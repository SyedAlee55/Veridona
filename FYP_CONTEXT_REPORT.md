# Veridona FYP Context Report

This report provides a comprehensive summary of the current project context for the Veridona FYP application, serving as a snapshot of its architecture, blockchain configuration, achieved milestones, frontend progress, and known issues. 

## Current Architecture
The system architecture natively links a sophisticated set of smart contracts running on the Sepolia testnet to a Web3-friendly frontend.
- **DonationModuleV2**: A custom Gnosis Safe Module containing the core logic for the platform. It tracks campaigns, handles community (Quadratic) voting, and processes incoming donations. By acting as a module, it has the unique authority to programmatically instruct the Gnosis Safe to move funds when specific logical milestones are cleared (like reaching a funding goal and waiting a 24-hour security delay).
- **Gnosis Safe Treasury**: Functions as the primary vault. Instead of holding funds linearly, it allows the verified `DonationModuleV2` to release payouts programmatically through `execTransactionFromModule`, providing a robust, enterprise-grade safety net.
- **DonationReceipt NFT**: An ERC721-compliant token forming the reputation and access backend. It acts as an identity "handshake" — the first time a user donates, the module mints an NFT to them. Subsequent critical actions, like voting and instituting disputes, require the donor to prove they hold this receipt natively within the contract (`IDonationReceipt.balanceOf > 0`).

## Blockchain State (Sepolia Testnet)
The current contract ecosystem operates on the Sepolia network. The active deployments are:
- **Gnosis Safe**: `0x2781dc9A92659C64a392c989CFFda745d8B02f8E`
- **DonationModuleV2**: `0x50b268b45617F095b357ba847A7ac0F35fEe59c2`
- **DonationReceipt NFT**: `0x5fE7674312fB0e028205483708EeB48f25b84b20`

## Milestones Achieved
- **Safe Authorization**: The custom `DonationModuleV2` is successfully registered and enabled inside the Gnosis Safe treasury, establishing the critical command path necessary for autonomous, community-approved fund allocation.
- **NFT Handshake Integration**: Strict role-based gatekeeping is live. Contract operations confirm that a user has a valid NFT balance before allowing them to vote or pause a campaign by disputing it. It effectively separates active contributors from external entities.
- **End-to-end Transaction Flow Setup**: Proposal, voting, funding, and automated routing functionality form a cohesive workflow natively via the smart contracts.

## Frontend Progress
- **UI & Architecture Stack**: The frontend infrastructure utilizes **React 19** powered by **Vite**. The styling leverages a utility-first approach with **TailwindCSS 4**, supplemented by **Material-UI (MUI)**.
- **Web3 Ecosystem**: Wallet connections, network switching, and state queries are directly engineered using the industry-standard **Wagmi** and **viem** libraries.
- **Live Features**: Main UI routing encompasses pages like `DonationPage`, `ClaimNFTPage`, and `CampaignsPage`. Deep React hooks (`useDonate`, `useVoteForCampaign`, `useProposeCampaign`) map symmetrically to the Solidity functions, executing real network transactions transparently to the active connecting Wallet.

## Known Issues
### `voteForCampaign` Gas Limit & `totalDonated` Logic
- **Context:** Following the quadratic voting principle, the `voteForCampaign` function applies a custom Babylonian square-root mathematical algorithm over the user’s lifetime accrued contributions (`totalDonated`).
- **The Bug:** Because Ethereum registers ETH incrementally in Wei (1 ETH = $10^{18}$ Wei), the raw numeric value placed in `totalDonated` is extremely large. Consequently, the internal `while` loop within the `sqrt()` function executes excessively, aggressively consuming gas. This effectively causes the transaction to hit network-enforced block gas limits or exhaust standard user-submitted gas estimates, resulting in a failed function call.

---

## Source Code Reference

### `DonationModule.sol` (Module Core Logic)
```solidity
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
        require(IDonationReceipt(nftReceipt).balanceOf(msg.sender) > 0, "Must be a donor (hold NFT) to vote");

        // Layer 2 & 3: Calculate Voting Power = sqrt(totalDonated)
        uint256 vp = sqrt(totalDonated[msg.sender]);
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
```

### `Frontend/src/hooks/useContractWrite.js` (Frontend Architecture Sample)
```javascript
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import DonationModuleABI from '../contracts/abis/DonationModuleV2.json';
import DonationReceiptABI from '../contracts/abis/DonationReceipt.json';
import { CONTRACT_ADDRESSES } from '../contracts/config';

/**
 * Hook to donate ETH to a campaign
 * Usage:
 *   const { donate, hash, isPending, isConfirming, isConfirmed } = useDonate();
 *   donate(campaignId, amountInEther);
 */
export const useDonate = () => {
    const { writeContract, data: hash, isPending, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({ hash });

    const donate = (campaignId, amountInEther) => {
        writeContract({
            address: CONTRACT_ADDRESSES.DONATION_MODULE,
            abi: DonationModuleABI,
            functionName: 'donate',
            args: [BigInt(campaignId)],
            value: parseEther(amountInEther.toString()),
        });
    };

    return { donate, hash, isPending, isConfirming, isConfirmed, error };
};

/**
 * Hook to propose a new campaign
 */
export const useProposeCampaign = () => {
    const { writeContract, data: hash, isPending, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({ hash });

    const proposeCampaign = (receiverAddress, goalInEther) => {
        writeContract({
            address: CONTRACT_ADDRESSES.DONATION_MODULE,
            abi: DonationModuleABI,
            functionName: 'proposeCampaign',
            args: [receiverAddress, parseEther(goalInEther.toString())],
        });
    };

    return { proposeCampaign, hash, isPending, isConfirming, isConfirmed, error };
};

/**
 * Hook to vote for a campaign
 */
export const useVoteForCampaign = () => {
    const { writeContract, data: hash, isPending, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({ hash });

    const vote = (campaignId) => {
        writeContract({
            address: CONTRACT_ADDRESSES.DONATION_MODULE,
            abi: DonationModuleABI,
            functionName: 'voteForCampaign',
            args: [BigInt(campaignId)],
        });
    };

    return { vote, hash, isPending, isConfirming, isConfirmed, error };
};

/**
 * Hook to dispute a campaign
 */
export const useDisputeCampaign = () => {
    const { writeContract, data: hash, isPending, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({ hash });

    const dispute = (campaignId) => {
        writeContract({
            address: CONTRACT_ADDRESSES.DONATION_MODULE,
            abi: DonationModuleABI,
            functionName: 'disputeCampaign',
            args: [BigInt(campaignId)],
        });
    };

    return { dispute, hash, isPending, isConfirming, isConfirmed, error };
};

/**
 * Hook to trigger automated payout for a completed campaign
 */
export const useTriggerPayout = () => {
    const { writeContract, data: hash, isPending, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({ hash });

    const triggerPayout = (campaignId) => {
        writeContract({
            address: CONTRACT_ADDRESSES.DONATION_MODULE,
            abi: DonationModuleABI,
            functionName: 'triggerAutomatedPayout',
            args: [BigInt(campaignId)],
        });
    };

    return { triggerPayout, hash, isPending, isConfirming, isConfirmed, error };
};
```
