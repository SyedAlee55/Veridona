import { useReadContract, useReadContracts } from 'wagmi';
import { formatEther } from 'viem';
import DonationModuleABI from '../contracts/abis/DonationModuleV2.json';
import DonationReceiptABI from '../contracts/abis/DonationReceipt.json';
import { CONTRACT_ADDRESSES } from '../contracts/config';

/**
 * Read the total number of campaigns
 */
export const useCampaignCount = () => {
    return useReadContract({
        address: CONTRACT_ADDRESSES.DONATION_MODULE,
        abi: DonationModuleABI,
        functionName: 'campaignCount',
    });
};

/**
 * Read a specific campaign's data by ID
 */
export const useCampaign = (campaignId) => {
    const result = useReadContract({
        address: CONTRACT_ADDRESSES.DONATION_MODULE,
        abi: DonationModuleABI,
        functionName: 'campaigns',
        args: [BigInt(campaignId || 0)],
        query: { enabled: !!campaignId },
    });

    // Parse the campaign struct
    const campaign = result.data
        ? {
            receiver: result.data[0],
            goal: result.data[1],
            currentBalance: result.data[2],
            voteTally: result.data[3],
            goalReachedAt: result.data[4],
            isActive: result.data[5],
            isDisputed: result.data[6],
            completed: result.data[7],
            goalFormatted: formatEther(result.data[1]),
            currentBalanceFormatted: formatEther(result.data[2]),
            progress: result.data[1] > 0n
                ? Number((result.data[2] * 100n) / result.data[1])
                : 0,
        }
        : null;

    return { ...result, campaign };
};

/**
 * Read multiple campaigns at once
 */
export const useAllCampaigns = (count) => {
    const campaignCount = Number(count || 0);
    const contracts = [];

    for (let i = 1; i <= campaignCount; i++) {
        contracts.push({
            address: CONTRACT_ADDRESSES.DONATION_MODULE,
            abi: DonationModuleABI,
            functionName: 'campaigns',
            args: [BigInt(i)],
        });
    }

    const result = useReadContracts({
        contracts,
        query: { enabled: campaignCount > 0 },
    });

    const campaigns = (result.data || []).map((res, index) => {
        if (res.status !== 'success') return null;
        const d = res.result;
        return {
            id: index + 1,
            receiver: d[0],
            goal: d[1],
            currentBalance: d[2],
            voteTally: d[3],
            goalReachedAt: d[4],
            isActive: d[5],
            isDisputed: d[6],
            completed: d[7],
            goalFormatted: formatEther(d[1]),
            currentBalanceFormatted: formatEther(d[2]),
            progress: d[1] > 0n ? Number((d[2] * 100n) / d[1]) : 0,
        };
    }).filter(Boolean);

    return { ...result, campaigns };
};

/**
 * Check if a user has voted for a specific campaign
 */
export const useHasVoted = (campaignId, userAddress) => {
    return useReadContract({
        address: CONTRACT_ADDRESSES.DONATION_MODULE,
        abi: DonationModuleABI,
        functionName: 'hasVoted',
        args: [BigInt(campaignId || 0), userAddress],
        query: { enabled: !!campaignId && !!userAddress },
    });
};

/**
 * Get the total ETH donated by a user (reputation)
 */
export const useTotalDonated = (userAddress) => {
    const result = useReadContract({
        address: CONTRACT_ADDRESSES.DONATION_MODULE,
        abi: DonationModuleABI,
        functionName: 'totalDonated',
        args: [userAddress],
        query: { enabled: !!userAddress },
    });

    return {
        ...result,
        totalDonatedFormatted: result.data ? formatEther(result.data) : '0',
    };
};

/**
 * Check if a user has a DonationReceipt NFT
 */
export const useHasReceipt = (userAddress) => {
    return useReadContract({
        address: CONTRACT_ADDRESSES.DONATION_RECEIPT,
        abi: DonationReceiptABI,
        functionName: 'hasReceipt',
        args: [userAddress],
        query: { enabled: !!userAddress },
    });
};

/**
 * Get NFT balance for a user
 */
export const useNFTBalance = (userAddress) => {
    return useReadContract({
        address: CONTRACT_ADDRESSES.DONATION_RECEIPT,
        abi: DonationReceiptABI,
        functionName: 'balanceOf',
        args: [userAddress],
        query: { enabled: !!userAddress },
    });
};

/**
 * Get the vote threshold constant
 */
export const useVoteThreshold = () => {
    return useReadContract({
        address: CONTRACT_ADDRESSES.DONATION_MODULE,
        abi: DonationModuleABI,
        functionName: 'VOTE_THRESHOLD',
    });
};
