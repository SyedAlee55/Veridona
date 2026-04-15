import React, { useState } from 'react';
import {
    Box, Paper, Typography, Button, TextField, Card, CardContent,
    Grid, LinearProgress, Chip, Dialog, DialogTitle, DialogContent,
    DialogActions, Alert, CircularProgress
} from '@mui/material';
import { useAccount } from 'wagmi';
import ReceiverDrawer from '../../components/ReceiverDrawer';
import ConnectWallet from '../../components/ConnectWallet';
import CampaignIcon from '@mui/icons-material/Campaign';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useCampaignCount, useAllCampaigns, useIsVerifiedReceiver } from '../../hooks/useContractRead';
import { useProposeCampaign, useTriggerPayout } from '../../hooks/useContractWrite';
import { getExplorerTxUrl } from '../../contracts/config';

const MyCampaignsPage = () => {
    const { address, isConnected } = useAccount();
    const [proposeOpen, setProposeOpen] = useState(false);
    const [goalAmount, setGoalAmount] = useState('');

    const { data: campaignCount, refetch: refetchCount } = useCampaignCount();
    const { campaigns, refetch: refetchCampaigns } = useAllCampaigns(campaignCount);

    // On-chain whitelist check
    const { data: isVerified } = useIsVerifiedReceiver(address);

    const {
        proposeCampaign, hash: proposeHash, isPending: proposePending,
        isConfirming: proposeConfirming, isConfirmed: proposeConfirmed, error: proposeError
    } = useProposeCampaign();

    const {
        triggerPayout, hash: payoutHash, isPending: payoutPending,
        isConfirming: payoutConfirming, isConfirmed: payoutConfirmed, error: payoutError
    } = useTriggerPayout();

    const handlePropose = () => {
        if (!address || !goalAmount) return;
        // msg.sender == _receiver enforced on-chain
        proposeCampaign(address, goalAmount);
    };

    const handleRefresh = () => {
        refetchCount();
        refetchCampaigns();
    };

    React.useEffect(() => {
        if (proposeConfirmed || payoutConfirmed) {
            setTimeout(handleRefresh, 2000);
        }
    }, [proposeConfirmed, payoutConfirmed]);

    const getStatusChip = (campaign) => {
        if (campaign.completed) return <Chip label="Completed" color="success" size="small" icon={<CheckCircleIcon />} />;
        if (campaign.isDisputed) return <Chip label="Removed" color="error" size="small" icon={<WarningAmberIcon />} />;
        if (campaign.isActive) return <Chip label="Active" color="primary" size="small" />;
        return <Chip label="Inactive" color="default" size="small" />;
    };

    const getClaimLabel = (campaign) => {
        if (!campaign.isActive || campaign.completed || campaign.isDisputed) return null;
        const isGoalReached = campaign.currentBalance >= campaign.goal && campaign.goal > 0n;
        if (!isGoalReached) return <Typography variant="body2" color="warning.main">Waiting for more donations.</Typography>;

        const elapsed = Math.floor(Date.now() / 1000) - Number(campaign.goalReachedAt);
        const secondsLeft = 86400 - elapsed;
        if (secondsLeft > 0) {
            const hrsLeft = Math.ceil(secondsLeft / 3600);
            return <Typography variant="body2" color="info.main">⏳ Safety window: ~{hrsLeft}h remaining</Typography>;
        }

        return (
            <Button
                size="small" variant="contained" color="success" startIcon={<AttachMoneyIcon />}
                onClick={() => triggerPayout(campaign.id)} disabled={payoutPending || payoutConfirming}
                sx={{ borderRadius: '8px', textTransform: 'none' }}
            >
                {payoutPending || payoutConfirming ? 'Processing...' : 'Claim Funds'}
            </Button>
        );
    };

    // Filter to only show campaigns belonging to the connected receiver
    const myCampaigns = campaigns.filter(c => c.receiver?.toLowerCase() === address?.toLowerCase());

    return (
        <ReceiverDrawer currentPage="/receiver/campaigns">
            <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: '1200px', mx: 'auto' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
                        <CampaignIcon sx={{ mr: 2, verticalAlign: 'middle', color: '#0072ff' }} />
                        My Campaigns
                    </Typography>
                    <ConnectWallet />
                </Box>

                {!isConnected ? (
                    <Paper elevation={3} sx={{ p: 6, textAlign: 'center', backgroundColor: '#f8f9ff', borderRadius: '16px' }}>
                        <Typography variant="h5" sx={{ mb: 2, color: '#333' }}>Connect Your Wallet</Typography>
                        <Typography variant="body1" sx={{ color: '#666', mb: 3 }}>
                            Connect your MetaMask wallet to view, create, and manage your campaigns.
                        </Typography>
                        <ConnectWallet />
                    </Paper>
                ) : !isVerified ? (
                    <Paper elevation={3} sx={{ p: 6, textAlign: 'center', backgroundColor: '#fff8e1', borderRadius: '16px', border: '1px solid #f59e0b' }}>
                        <Typography variant="h5" sx={{ mb: 2, color: '#b45309' }}>⏳ Not Yet Verified</Typography>
                        <Typography variant="body1" sx={{ color: '#78350f' }}>
                            Your wallet is not yet whitelisted on-chain. Please complete verification from your dashboard and wait for admin approval.
                        </Typography>
                    </Paper>
                ) : (
                    <>
                        <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                            <Button
                                variant="contained"
                                startIcon={<AddCircleOutlineIcon />}
                                onClick={() => setProposeOpen(true)}
                                sx={{ background: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)', borderRadius: '12px', textTransform: 'none', fontWeight: 'bold', px: 3 }}
                            >
                                Create Campaign
                            </Button>
                            <Button variant="outlined" onClick={handleRefresh} sx={{ borderRadius: '12px', textTransform: 'none' }}>
                                Refresh
                            </Button>
                        </Box>

                        {(proposeHash || payoutHash) && (
                            <Alert severity="info" sx={{ mb: 3 }}>
                                Transaction submitted! <a href={getExplorerTxUrl(proposeHash || payoutHash)} target="_blank" rel="noreferrer">View on Etherscan</a>
                            </Alert>
                        )}
                        {(proposeConfirmed || payoutConfirmed) && <Alert severity="success" sx={{ mb: 3 }}>Transaction confirmed! ✅</Alert>}
                        {(proposeError || payoutError) && <Alert severity="error" sx={{ mb: 3 }}>{(proposeError || payoutError)?.shortMessage || 'Transaction failed'}</Alert>}

                        <Typography variant="h6" sx={{ mb: 2, color: '#555' }}>
                            {myCampaigns.length} Campaign{myCampaigns.length !== 1 ? 's' : ''} Found
                        </Typography>

                        <Grid container spacing={3}>
                            {myCampaigns.map((campaign) => (
                                <Grid item xs={12} md={6} key={campaign.id}>
                                    <Card
                                        elevation={3}
                                        sx={{ borderRadius: '16px', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }, border: campaign.isActive ? '2px solid #0072ff' : '1px solid #e0e0e0' }}
                                    >
                                        <CardContent sx={{ p: 3 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Campaign #{campaign.id}</Typography>
                                                {getStatusChip(campaign)}
                                            </Box>

                                            <Box sx={{ my: 2 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{campaign.currentBalanceFormatted} ETH Raised</Typography>
                                                    <Typography variant="body2" sx={{ color: '#999' }}>Goal: {campaign.goalFormatted} ETH</Typography>
                                                </Box>
                                                <LinearProgress
                                                    variant="determinate" value={Math.min(campaign.progress, 100)}
                                                    sx={{ height: 10, borderRadius: 5, backgroundColor: '#e0e0e0', '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #00c6ff, #0072ff)', borderRadius: 5 } }}
                                                />
                                            </Box>

                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                <Typography variant="body2" sx={{ color: '#666' }}>Progress: {Math.min(campaign.progress, 100)}%</Typography>
                                                {campaign.completed && <Typography variant="body2" color="success.main">Funds paid out ✓</Typography>}
                                            </Box>

                                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', minHeight: 36 }}>
                                                {getClaimLabel(campaign)}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>

                        {myCampaigns.length === 0 && (
                            <Paper elevation={3} sx={{ p: 4, textAlign: 'center', backgroundColor: '#f5f5f5', borderRadius: '16px' }}>
                                <CampaignIcon sx={{ fontSize: 64, color: '#bbb', mb: 2 }} />
                                <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>No campaigns yet</Typography>
                                <Typography variant="body2" sx={{ color: '#999' }}>Click "Create Campaign" to get started!</Typography>
                            </Paper>
                        )}

                        {/* Create Campaign Dialog */}
                        <Dialog open={proposeOpen} onClose={() => setProposeOpen(false)} maxWidth="sm" fullWidth>
                            <DialogTitle sx={{ fontWeight: 'bold' }}>Create New Campaign</DialogTitle>
                            <DialogContent>
                                <Typography variant="body2" sx={{ mb: 3, color: '#666' }}>
                                    As a verified receiver, your campaign will go <strong>live immediately</strong> upon creation. Donors can fund it right away.
                                </Typography>
                                <TextField
                                    label="Funding Goal (Sepolia ETH)" type="number" placeholder="0.1"
                                    fullWidth value={goalAmount} onChange={(e) => setGoalAmount(e.target.value)}
                                    inputProps={{ step: '0.01', min: '0' }} sx={{ mt: 1 }}
                                />
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setProposeOpen(false)}>Cancel</Button>
                                <Button
                                    variant="contained" onClick={handlePropose} disabled={proposePending || proposeConfirming || !goalAmount}
                                    sx={{ background: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)' }}
                                >
                                    {proposePending || proposeConfirming ? <CircularProgress size={20} sx={{ color: 'white', mr: 1 }} /> : null}
                                    {proposePending ? 'Submitting...' : proposeConfirming ? 'Confirming...' : 'Launch Campaign 🚀'}
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </>
                )}
            </Box>
        </ReceiverDrawer>
    );
};

export default MyCampaignsPage;
