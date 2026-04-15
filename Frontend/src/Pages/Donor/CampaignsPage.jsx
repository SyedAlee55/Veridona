import React, { useState } from 'react';
import {
    Box, Paper, Typography, Button, TextField, Card, CardContent,
    Grid, LinearProgress, Chip, Dialog, DialogTitle, DialogContent,
    DialogActions, Alert, CircularProgress
} from '@mui/material';
import { useAccount } from 'wagmi';
import DonorDrawer from '../../components/DonorDrawer';
import ConnectWallet from '../../components/ConnectWallet';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import GavelIcon from '@mui/icons-material/Gavel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
    useCampaignCount, useAllCampaigns
} from '../../hooks/useContractRead';
import {
    useProposeCampaign, useDisputeCampaign
} from '../../hooks/useContractWrite';
import { getExplorerTxUrl } from '../../contracts/config';

const CampaignsPage = () => {
    const { address, isConnected } = useAccount();
    const [proposeOpen, setProposeOpen] = useState(false);
    const [receiverAddr, setReceiverAddr] = useState('');
    const [goalAmount, setGoalAmount] = useState('');

    // Read hooks
    const { data: campaignCount, refetch: refetchCount } = useCampaignCount();
    const { campaigns, refetch: refetchCampaigns } = useAllCampaigns(campaignCount);
    // Write hooks
    const {
        proposeCampaign, hash: proposeHash, isPending: proposePending,
        isConfirming: proposeConfirming, isConfirmed: proposeConfirmed, error: proposeError
    } = useProposeCampaign();
    const {
        dispute, hash: disputeHash, isPending: disputePending,
        isConfirming: disputeConfirming, isConfirmed: disputeConfirmed, error: disputeError
    } = useDisputeCampaign();

    const handlePropose = () => {
        if (!receiverAddr || !goalAmount) return;
        proposeCampaign(receiverAddr, goalAmount);
    };

    const handleRefresh = () => {
        refetchCount();
        refetchCampaigns();
    };

    // Refresh after confirmations
    React.useEffect(() => {
        if (proposeConfirmed || disputeConfirmed) {
            setTimeout(handleRefresh, 2000);
        }
    }, [proposeConfirmed, disputeConfirmed]);

    const getStatusChip = (campaign) => {
        if (campaign.completed) return <Chip label="Completed" color="success" size="small" icon={<CheckCircleIcon />} />;
        if (campaign.isDisputed) return <Chip label="Disputed" color="error" size="small" icon={<WarningAmberIcon />} />;
        if (campaign.isActive) return <Chip label="Active" color="primary" size="small" />;
        return <Chip label="Inactive" color="default" size="small" />;
    };

    return (
        <DonorDrawer currentPage="/donor/campaigns">
            <Box sx={{ width: '100%', p: { xs: 2, sm: 4 }, maxWidth: '1200px', mx: 'auto' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
                        <HowToVoteIcon sx={{ mr: 2, verticalAlign: 'middle', color: '#151c3b' }} />
                        Campaigns
                    </Typography>
                    <ConnectWallet />
                </Box>

                {!isConnected ? (
                    <Paper elevation={3} sx={{ p: 6, textAlign: 'center', backgroundColor: '#f8f9ff', borderRadius: '16px' }}>
                        <AccountIcon sx={{ fontSize: 80, color: '#151c3b', mb: 2, opacity: 0.5 }} />
                        <Typography variant="h5" sx={{ mb: 2, color: '#333' }}>Connect Your Wallet</Typography>
                        <Typography variant="body1" sx={{ color: '#666', mb: 3 }}>
                            Connect your MetaMask wallet to view, propose, and vote on campaigns.
                        </Typography>
                        <ConnectWallet />
                    </Paper>
                ) : (
                    <>
                        {/* Action buttons */}
                        <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                            <Button
                                variant="contained"
                                startIcon={<AddCircleOutlineIcon />}
                                onClick={() => setProposeOpen(true)}
                                sx={{
                                    background: 'linear-gradient(135deg, #151c3b 0%, #00d4ff 100%)',
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                    px: 3,
                                }}
                            >
                                Propose New Campaign
                            </Button>
                            <Button variant="outlined" onClick={handleRefresh} sx={{ borderRadius: '12px', textTransform: 'none' }}>
                                Refresh
                            </Button>
                        </Box>

                        {/* Transaction alerts */}
                        {(proposeHash || disputeHash) && (
                            <Alert severity="info" sx={{ mb: 3 }}>
                                Transaction submitted!{' '}
                                <a href={getExplorerTxUrl(proposeHash || disputeHash)} target="_blank" rel="noreferrer">
                                    View on Etherscan
                                </a>
                            </Alert>
                        )}
                        {(proposeConfirmed || disputeConfirmed) && (
                            <Alert severity="success" sx={{ mb: 3 }}>Transaction confirmed! ✅</Alert>
                        )}
                        {(proposeError || disputeError) && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {(proposeError || disputeError)?.shortMessage || 'Transaction failed'}
                            </Alert>
                        )}

                        {/* Campaign list */}
                        <Typography variant="h6" sx={{ mb: 2, color: '#555' }}>
                            {campaigns.length} Campaign{campaigns.length !== 1 ? 's' : ''} Found
                        </Typography>

                        <Grid container spacing={3}>
                            {campaigns.map((campaign) => (
                                <Grid item xs={12} md={6} key={campaign.id}>
                                    <Card
                                        elevation={3}
                                        sx={{
                                            borderRadius: '16px',
                                            transition: 'all 0.3s ease',
                                            '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                                            border: campaign.isActive ? '2px solid #151c3b' : '1px solid #e0e0e0',
                                        }}
                                    >
                                        <CardContent sx={{ p: 3 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                    Campaign #{campaign.id}
                                                </Typography>
                                                {getStatusChip(campaign)}
                                            </Box>

                                            <Typography variant="body2" sx={{ color: '#666', mb: 1, fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                                Receiver: {campaign.receiver}
                                            </Typography>

                                            <Box sx={{ my: 2 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        {campaign.currentBalanceFormatted} Sepolia ETH
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: '#999' }}>
                                                        Goal: {campaign.goalFormatted} Sepolia ETH
                                                    </Typography>
                                                </Box>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={Math.min(campaign.progress, 100)}
                                                    sx={{
                                                        height: 10,
                                                        borderRadius: 5,
                                                        backgroundColor: '#e0e0e0',
                                                        '& .MuiLinearProgress-bar': {
                                                            background: 'linear-gradient(90deg, #151c3b, #00d4ff)',
                                                            borderRadius: 5,
                                                        },
                                                    }}
                                                />
                                            </Box>

                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                <Typography variant="body2" sx={{ color: '#666' }}>
                                                    Progress: {Math.min(campaign.progress, 100)}%
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                {campaign.isActive && !campaign.completed && !campaign.isDisputed && (
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="error"
                                                        startIcon={<GavelIcon />}
                                                        onClick={() => dispute(campaign.id)}
                                                        disabled={disputePending || disputeConfirming}
                                                        sx={{ borderRadius: '8px', textTransform: 'none' }}
                                                    >
                                                        Dispute
                                                    </Button>
                                                )}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>

                        {campaigns.length === 0 && (
                            <Paper elevation={3} sx={{ p: 4, textAlign: 'center', backgroundColor: '#f5f5f5', borderRadius: '16px' }}>
                                <HowToVoteIcon sx={{ fontSize: 64, color: '#bbb', mb: 2 }} />
                                <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>No campaigns yet</Typography>
                                <Typography variant="body2" sx={{ color: '#999' }}>
                                    Be the first to propose a campaign!
                                </Typography>
                            </Paper>
                        )}

                        {/* Propose Campaign Dialog */}
                        <Dialog open={proposeOpen} onClose={() => setProposeOpen(false)} maxWidth="sm" fullWidth>
                            <DialogTitle sx={{ fontWeight: 'bold' }}>Propose New Campaign</DialogTitle>
                            <DialogContent>
                                <Typography variant="body2" sx={{ mb: 3, color: '#666' }}>
                                    Verified organizations can propose new funding campaigns. Once proposed,
                                    the campaign becomes active immediately.
                                </Typography>
                                <TextField
                                    label="Receiver Wallet Address"
                                    placeholder="0x..."
                                    fullWidth
                                    value={receiverAddr}
                                    onChange={(e) => setReceiverAddr(e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    label="Funding Goal (Sepolia ETH)"
                                    type="number"
                                    placeholder="0.1"
                                    fullWidth
                                    value={goalAmount}
                                    onChange={(e) => setGoalAmount(e.target.value)}
                                    inputProps={{ step: '0.01', min: '0' }}
                                />
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setProposeOpen(false)}>Cancel</Button>
                                <Button
                                    variant="contained"
                                    onClick={handlePropose}
                                    disabled={proposePending || proposeConfirming || !receiverAddr || !goalAmount}
                                    sx={{
                                        background: 'linear-gradient(135deg, #151c3b 0%, #00d4ff 100%)',
                                    }}
                                >
                                    {proposePending || proposeConfirming ? (
                                        <CircularProgress size={20} sx={{ color: 'white', mr: 1 }} />
                                    ) : null}
                                    {proposePending ? 'Submitting...' : proposeConfirming ? 'Confirming...' : 'Propose Campaign'}
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </>
                )}
            </Box>
        </DonorDrawer>
    );
};

// Simple fallback icon
const AccountIcon = ({ sx }) => (
    <Box component="span" sx={sx}>
        <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
            <path d="M21 18v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1" />
        </svg>
    </Box>
);

export default CampaignsPage;
