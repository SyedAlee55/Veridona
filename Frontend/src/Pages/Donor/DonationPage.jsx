import React, { useState } from 'react';
import {
    Box, Paper, Typography, Button, TextField, Card, CardContent,
    Grid, MenuItem, Select, FormControl, InputLabel, Alert, CircularProgress
} from '@mui/material';
import { useAccount } from 'wagmi';
import { useAuth } from '../../context/AuthContext';
import DonorDrawer from '../../components/DonorDrawer';
import ConnectWallet from '../../components/ConnectWallet';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useCampaignCount, useAllCampaigns } from '../../hooks/useContractRead';
import { useDonate, useDonateGeneral } from '../../hooks/useContractWrite';
import { getExplorerTxUrl } from '../../contracts/config';

const DonationPage = () => {
    const { user } = useAuth();
    const { address, isConnected } = useAccount();
    const [donationAmount, setDonationAmount] = useState('');
    const [selectedCampaign, setSelectedCampaign] = useState('');

    // Read campaigns from blockchain
    const { data: campaignCount } = useCampaignCount();
    const { campaigns } = useAllCampaigns(campaignCount);
    const activeCampaigns = campaigns.filter(c => c.isActive && !c.completed);

    // Write hooks for donating
    const { donate, hash: hashC, isPending: isPendingC, isConfirming: isConfirmingC, isConfirmed: isConfirmedC, error: errorC } = useDonate();
    const { donateGeneral, hash: hashG, isPending: isPendingG, isConfirming: isConfirmingG, isConfirmed: isConfirmedG, error: errorG } = useDonateGeneral();

    const activeHash = hashC || hashG;
    const isPending = isPendingC || isPendingG;
    const isConfirming = isConfirmingC || isConfirmingG;
    const isConfirmed = isConfirmedC || isConfirmedG;
    const error = errorC || errorG;

    const handleDonate = () => {
        if (!selectedCampaign || !donationAmount || parseFloat(donationAmount) <= 0) return;
        if (selectedCampaign === 'general') {
            donateGeneral(donationAmount);
        } else {
            donate(selectedCampaign, donationAmount);
        }
    };

    return (
        <DonorDrawer currentPage="/donor/donation">
            <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: '1200px', mx: 'auto' }}>
                <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#333' }}>
                    <FavoriteBorderIcon sx={{ mr: 2, verticalAlign: 'middle', color: '#e53935' }} />
                    Make a Donation
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Paper
                            elevation={3}
                            sx={{
                                p: 4,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                borderRadius: '16px',
                            }}
                        >
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                                Donate via Blockchain
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
                                Donate ETH directly to an active campaign on the Sepolia testnet.
                                Your donation is recorded on-chain with full transparency.
                            </Typography>

                            {/* Wallet connection */}
                            <Box sx={{ mb: 3 }}>
                                <ConnectWallet compact />
                            </Box>

                            {isConnected ? (
                                <>
                                    {/* Campaign selector */}
                                    <FormControl fullWidth sx={{ mb: 2 }}>
                                        <InputLabel sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                            Select Campaign
                                        </InputLabel>
                                        <Select
                                            value={selectedCampaign}
                                            onChange={(e) => setSelectedCampaign(e.target.value)}
                                            label="Select Campaign"
                                            sx={{
                                                color: 'white',
                                                '& fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                                                '&:hover fieldset': { borderColor: 'white' },
                                                '& .MuiSvgIcon-root': { color: 'white' },
                                            }}
                                        >
                                            <MenuItem value="general">
                                                🌟 General Treasury (Donation without Campaign)
                                            </MenuItem>
                                            {activeCampaigns.map((c) => (
                                                <MenuItem key={c.id} value={c.id}>
                                                    Campaign #{c.id} — Goal: {c.goalFormatted} Sepolia ETH
                                                    ({Math.min(c.progress, 100)}% funded)
                                                </MenuItem>
                                            ))}
                                            {activeCampaigns.length === 0 && (
                                                <MenuItem disabled>No active campaigns yet</MenuItem>
                                            )}
                                        </Select>
                                    </FormControl>

                                    <TextField
                                        type="number"
                                        label="Donation Amount (Sepolia ETH)"
                                        placeholder="0.01"
                                        value={donationAmount}
                                        onChange={(e) => setDonationAmount(e.target.value)}
                                        fullWidth
                                        sx={{
                                            mb: 2,
                                            '& .MuiOutlinedInput-root': {
                                                color: 'white',
                                                '& fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                                                '&:hover fieldset': { borderColor: 'white' },
                                            },
                                            '& label': { color: 'rgba(255,255,255,0.8)' },
                                        }}
                                        inputProps={{ step: '0.001', min: '0', style: { color: 'white' } }}
                                    />

                                    <Button
                                        variant="contained"
                                        fullWidth
                                        onClick={handleDonate}
                                        disabled={isPending || isConfirming || !selectedCampaign || !donationAmount}
                                        sx={{
                                            backgroundColor: 'white',
                                            color: '#667eea',
                                            fontWeight: 'bold',
                                            borderRadius: '12px',
                                            py: 1.5,
                                            '&:hover': { backgroundColor: '#f0f0f0' },
                                        }}
                                    >
                                        {isPending ? (
                                            <><CircularProgress size={20} sx={{ mr: 1 }} /> Confirm in Wallet...</>
                                        ) : isConfirming ? (
                                            <><CircularProgress size={20} sx={{ mr: 1 }} /> Confirming...</>
                                        ) : (
                                            'Donate Sepolia ETH'
                                        )}
                                    </Button>
                                </>
                            ) : (
                                <Typography variant="body2" sx={{ opacity: 0.8, fontStyle: 'italic' }}>
                                    Connect your wallet to donate via blockchain
                                </Typography>
                            )}
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card elevation={3} sx={{ borderRadius: '16px', height: '100%' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                                    How Blockchain Donations Work
                                </Typography>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" sx={{ mb: 1.5, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                        <Box component="span" sx={{ fontWeight: 'bold', color: '#667eea', minWidth: '20px' }}>1.</Box>
                                        Connect your MetaMask wallet (Sepolia testnet)
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1.5, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                        <Box component="span" sx={{ fontWeight: 'bold', color: '#667eea', minWidth: '20px' }}>2.</Box>
                                        Select an active campaign to donate to
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1.5, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                        <Box component="span" sx={{ fontWeight: 'bold', color: '#667eea', minWidth: '20px' }}>3.</Box>
                                        Enter ETH amount and confirm the transaction
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1.5, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                        <Box component="span" sx={{ fontWeight: 'bold', color: '#667eea', minWidth: '20px' }}>4.</Box>
                                        Funds go directly to the Gnosis Safe treasury
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1.5, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                        <Box component="span" sx={{ fontWeight: 'bold', color: '#667eea', minWidth: '20px' }}>5.</Box>
                                        First-time donors get a Soulbound NFT receipt automatically!
                                    </Typography>
                                </Box>

                                <Card sx={{ p: 2, backgroundColor: '#e8f5e9', borderRadius: '12px' }}>
                                    <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 500 }}>
                                        ✨ Your donation is 100% transparent, immutable, and verifiable on the blockchain.
                                    </Typography>
                                </Card>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Transaction status alerts */}
                {activeHash && (
                    <Alert
                        severity="info"
                        sx={{ mt: 3, borderRadius: '12px' }}
                        action={
                            <Button
                                color="inherit"
                                size="small"
                                href={getExplorerTxUrl(activeHash)}
                                target="_blank"
                                endIcon={<OpenInNewIcon />}
                            >
                                View
                            </Button>
                        }
                    >
                        Transaction submitted! Waiting for confirmation...
                    </Alert>
                )}
                {isConfirmed && (
                    <Alert severity="success" sx={{ mt: 2, borderRadius: '12px' }}>
                        🎉 Donation confirmed on-chain! Thank you for your contribution.
                    </Alert>
                )}
                {error && (
                    <Alert severity="error" sx={{ mt: 2, borderRadius: '12px' }}>
                        {error?.shortMessage || 'Transaction failed. Please try again.'}
                    </Alert>
                )}
            </Box>
        </DonorDrawer>
    );
};

export default DonationPage;
