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

    uint256 public constant VOTE_THRESHOLD = 10; // Target VP to activate campaign
    uint256 public constant SECURITY_DELAY = 24 hours;

    struct Campaign {
        address payable receiver;
        uint256 goal;
        uint256 currentBalance;
        uint256 voteTally;      // Total Quadratic Voting Power
        uint256 goalReachedAt;  // Timestamp for the 24h safety clock
        bool isActive;          // True if community voted it in
        bool isDisputed;        // Security flag to freeze payout
        bool completed;         // True if funds were sent
    }

    mapping(uint256 => Campaign) public campaigns;
    uint256 public campaignCount;

    // Reputation Tracking
    mapping(address => uint256) public totalDonated; 
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event CampaignProposed(uint256 id, address receiver, uint256 goal);
    event CampaignActivated(uint256 id);
    event DonationReceived(uint256 id, address donor, uint256 amount);
    event PayoutTriggered(uint256 id, address receiver);

    constructor(address _safeTreasury, address _nftReceipt) {
        safeTreasury = _safeTreasury;
        nftReceipt = _nftReceipt;
        admin = msg.sender;
    }

    // --- 1. PROPOSAL & VOTING ---

    function proposeCampaign(address payable _receiver, uint256 _goal) external {
        campaignCount++;
        campaigns[campaignCount] = Campaign(_receiver, _goal, 0, 0, 0, false, false, false);
        emit CampaignProposed(campaignCount, _receiver, _goal);
    }

    function voteForCampaign(uint256 _id) external {
        Campaign storage c = campaigns[_id];
        require(!c.isActive, "Campaign is already active");
        require(!hasVoted[_id][msg.sender], "You already voted");
        
        // Layer 1: Check if they have the Receipt NFT
        require(IDonationReceipt(nftReceipt).balanceOf(msg.sender) > 0, "Must hold NFT to vote");

        // Normalize: Divide by 1e18 to get the "Ether" value. Reduces gas of loop perfectly!
        uint256 etherValue = totalDonated[msg.sender] / 1e18; 
        
        uint256 vp = sqrt(etherValue);
        
        if (vp == 0 && totalDonated[msg.sender] > 0) {
            vp = 1; // Fallback so small donations aren't ignored
        }

        require(vp > 0, "No donation history found");

        c.voteTally += vp;
        hasVoted[_id][msg.sender] = true;

        // If threshold met, campaign goes live
        if (c.voteTally >= VOTE_THRESHOLD) {
            c.isActive = true;
            emit CampaignActivated(_id);
        }
    }

    // --- 2. DONATION LOGIC ---

    function donate(uint256 _id) external payable {
        Campaign storage c = campaigns[_id];
        require(c.isActive, "Campaign not yet approved by community");
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

    // --- MATH HELPER: Babylonian Method for sqrt ---
    function sqrt(uint y) internal pure returns (uint z) {
        if (y > 3) {
            z = y;
            uint x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    // Fallback to receive ETH if needed
    receive() external payable {}
}