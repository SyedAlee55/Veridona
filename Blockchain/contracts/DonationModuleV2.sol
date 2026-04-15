// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Interface to talk to your Gnosis Safe
interface IGnosisSafe {
    function execTransactionFromModule(
        address to,
        uint256 value,
        bytes calldata data,
        uint8 operation
    ) external returns (bool success);
}

// Interface to talk to your DonationReceipt NFT
interface IDonationReceipt {
    function mintReceipt(address _donor) external returns (uint256);
    function balanceOf(address owner) external view returns (uint256);
}

contract DonationModuleV2 {
    address public immutable safeTreasury;
    address public immutable nftReceipt;
    address public admin;

    uint256 public constant SECURITY_DELAY = 24 hours;

    struct Campaign {
        address payable receiver;
        uint256 goal;
        uint256 currentBalance;
        uint256 goalReachedAt;  // Timestamp for the 24h safety clock
        bool isActive;          // True if community voted it in (now automatic for verified receivers)
        bool isDisputed;        // Security flag to freeze payout
        bool completed;         // True if funds were sent
    }

    mapping(uint256 => Campaign) public campaigns;
    uint256 public campaignCount;

    // Reputation Tracking
    mapping(address => uint256) public totalDonated; 
    mapping(address => bool) public isVerifiedReceiver;

    event CampaignProposed(uint256 id, address receiver, uint256 goal);
    event CampaignRemoved(uint256 id);
    event DonationReceived(uint256 id, address donor, uint256 amount);
    event PayoutTriggered(uint256 id, address receiver);
    event ReceiverStatusUpdated(address receiver, bool status);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this");
        _;
    }

    constructor(address _safeTreasury, address _nftReceipt) {
        safeTreasury = _safeTreasury;
        nftReceipt = _nftReceipt;
        admin = msg.sender;
    }

    // --- ADMIN METHODS ---
    function setReceiverStatus(address _receiver, bool _status) external onlyAdmin {
        isVerifiedReceiver[_receiver] = _status;
        emit ReceiverStatusUpdated(_receiver, _status);
    }

    function removeCampaign(uint256 _id) external onlyAdmin {
        require(_id > 0 && _id <= campaignCount, "Invalid campaign ID");
        campaigns[_id].isActive = false;
        campaigns[_id].isDisputed = true;
        emit CampaignRemoved(_id);
    }

    // --- 1. PROPOSAL ---

    function proposeCampaign(address payable _receiver, uint256 _goal) external {
        require(isVerifiedReceiver[msg.sender], "Not a verified receiver");
        require(_receiver == msg.sender, "Receiver must match sender");
        campaignCount++;
        campaigns[campaignCount] = Campaign({
            receiver: _receiver,
            goal: _goal,
            currentBalance: 0,
            goalReachedAt: 0,
            isActive: true, // Instant Activation
            isDisputed: false,
            completed: false
        });
        emit CampaignProposed(campaignCount, _receiver, _goal);
    }

    // --- 2. DONATION LOGIC ---

    function donate(uint256 _id) external payable {
        Campaign storage c = campaigns[_id];
        require(c.isActive, "Campaign is not active");
        require(!c.completed, "Campaign already finalized");
        require(msg.value > 0, "Donation must be > 0");

        // Automatic NFT Minting for first-time donors
        if (IDonationReceipt(nftReceipt).balanceOf(msg.sender) == 0) {
            IDonationReceipt(nftReceipt).mintReceipt(msg.sender);
        }

        c.currentBalance += msg.value;
        totalDonated[msg.sender] += msg.value; // Update lifetime reputation

        // Forward funds immediately to the Gnosis Safe vault
        (bool success, ) = safeTreasury.call{value: msg.value}("");
        require(success, "Failed to send ETH to Gnosis Safe");

        // Start the 24h security clock if goal is hit
        if (c.currentBalance >= c.goal && c.goalReachedAt == 0) {
            c.goalReachedAt = block.timestamp;
        }

        emit DonationReceived(_id, msg.sender, msg.value);
    }

    function donateGeneral() external payable {
        require(msg.value > 0, "Donation must be > 0");

        // Automatic NFT Minting for first-time donors
        if (IDonationReceipt(nftReceipt).balanceOf(msg.sender) == 0) {
            IDonationReceipt(nftReceipt).mintReceipt(msg.sender);
        }

        totalDonated[msg.sender] += msg.value; // Update lifetime reputation

        // Forward funds immediately to the Gnosis Safe vault
        (bool success, ) = safeTreasury.call{value: msg.value}("");
        require(success, "Failed to send ETH to Gnosis Safe");

        emit DonationReceived(0, msg.sender, msg.value);
    }

    // --- 3. SECURITY & AUTOMATED PAYOUT ---

    function disputeCampaign(uint256 _id) external {
        require(IDonationReceipt(nftReceipt).balanceOf(msg.sender) > 0, "Only donors can dispute");
        campaigns[_id].isDisputed = true;
    }

    function triggerAutomatedPayout(uint256 _id) external {
        Campaign storage c = campaigns[_id];
        require(c.currentBalance >= c.goal, "Funding goal not reached");
        require(!c.isDisputed, "Campaign is under security review");
        require(!c.completed, "Funds already released");
        
        // Condition B: The 24-hour Safety Window
        require(block.timestamp >= c.goalReachedAt + SECURITY_DELAY, "24h safety window not yet passed");

        c.completed = true;

        // Command the Gnosis Safe to release the funds to the charity receiver
        bool success = IGnosisSafe(safeTreasury).execTransactionFromModule(
            c.receiver,
            c.currentBalance,
            "", 
            0 
        );

        require(success, "Gnosis Safe failed to execute payout");
        emit PayoutTriggered(_id, c.receiver);
    }

    // Fallback to receive ETH if needed
    receive() external payable {}
}