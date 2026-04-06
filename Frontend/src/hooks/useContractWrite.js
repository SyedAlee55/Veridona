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
