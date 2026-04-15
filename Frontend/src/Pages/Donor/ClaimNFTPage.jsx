import React from 'react';
import {
    Box, Paper, Typography, Card, CardContent, Grid, Chip, Alert
} from '@mui/material';
import { useAccount } from 'wagmi';
import DonorDrawer from '../../components/DonorDrawer';
import ConnectWallet from '../../components/ConnectWallet';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import VerifiedIcon from '@mui/icons-material/Verified';
import TokenIcon from '@mui/icons-material/Token';
import {
    useHasReceipt, useNFTBalance, useTotalDonated
} from '../../hooks/useContractRead';
import { getExplorerAddressUrl } from '../../contracts/config';
import { CONTRACT_ADDRESSES } from '../../contracts/config';

const ClaimNFTPage = () => {
    const { address, isConnected } = useAccount();

    // Blockchain reads
    const { data: hasReceipt } = useHasReceipt(address);
    const { data: nftBalance } = useNFTBalance(address);
    const { totalDonatedFormatted } = useTotalDonated(address);

    return (
        <DonorDrawer currentPage="/donor/claim-nft">
            <Box sx={{ width: '100%', p: { xs: 2, sm: 4 }, maxWidth: '1200px', mx: 'auto' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
                        <CardGiftcardIcon sx={{ mr: 2, verticalAlign: 'middle', color: '#f57c00' }} />
                        Veridona Receipt NFT
                    </Typography>
                    <ConnectWallet compact />
                </Box>

                <Card elevation={3} sx={{ mb: 4, backgroundColor: '#fff3e0', borderLeft: '4px solid #f57c00', borderRadius: '12px' }}>
                    <CardContent>
                        <Typography variant="body1" sx={{ color: '#333' }}>
                            Veridona Receipt NFTs are <strong>Soulbound tokens</strong> — they cannot be transferred once minted.
                            They are automatically minted to your wallet during your first on-chain donation, serving as blockchain-verified proof of contribution.
                        </Typography>
                    </CardContent>
                </Card>

                {!isConnected ? (
                    <Paper elevation={3} sx={{ p: 6, textAlign: 'center', backgroundColor: '#f8f9ff', borderRadius: '16px' }}>
                        <CardGiftcardIcon sx={{ fontSize: 80, color: '#f57c00', mb: 2, opacity: 0.5 }} />
                        <Typography variant="h5" sx={{ mb: 2, color: '#333' }}>Connect Your Wallet</Typography>
                        <Typography variant="body1" sx={{ color: '#666', mb: 3 }}>
                            Connect your MetaMask wallet to see your Veridona Receipt NFT status.
                        </Typography>
                        <ConnectWallet />
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        {/* NFT Status Card */}
                        <Grid item xs={12} md={6}>
                            <Card
                                elevation={4}
                                sx={{
                                    borderRadius: '20px',
                                    overflow: 'hidden',
                                    background: hasReceipt
                                        ? 'linear-gradient(135deg, #151c3b 0%, #00d4ff 100%)'
                                        : 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
                                    color: hasReceipt ? 'white' : '#666',
                                    transition: 'all 0.3s ease',
                                    '&:hover': { transform: 'translateY(-4px)', boxShadow: 8 },
                                }}
                            >
                                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                                    <Box
                                        sx={{
                                            width: 100,
                                            height: 100,
                                            borderRadius: '50%',
                                            backgroundColor: hasReceipt ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mx: 'auto',
                                            mb: 3,
                                        }}
                                    >
                                        {hasReceipt ? (
                                            <VerifiedIcon sx={{ fontSize: 50, color: 'white' }} />
                                        ) : (
                                            <TokenIcon sx={{ fontSize: 50, color: '#bbb' }} />
                                        )}
                                    </Box>

                                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                                        {hasReceipt ? 'Veridona Receipt' : 'No Receipt Yet'}
                                    </Typography>

                                    <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                                        {hasReceipt
                                            ? 'You hold a Soulbound Veridona Receipt NFT!'
                                            : 'Make your first on-chain donation to receive one'
                                        }
                                    </Typography>

                                    {hasReceipt && (
                                        <Chip
                                            label="Soulbound • Non-transferable"
                                            sx={{
                                                backgroundColor: 'rgba(255,255,255,0.2)',
                                                color: 'white',
                                                fontWeight: 600,
                                            }}
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Stats Card */}
                        <Grid item xs={12} md={6}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Card elevation={3} sx={{ borderRadius: '16px' }}>
                                        <CardContent sx={{ p: 3 }}>
                                            <Typography variant="caption" sx={{ color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>
                                                NFT Balance
                                            </Typography>
                                            <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#151c3b' }}>
                                                {nftBalance?.toString() || '0'}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#999' }}>
                                                Veridona Receipts held
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                <Grid item xs={12}>
                                    <Card elevation={3} sx={{ borderRadius: '16px' }}>
                                        <CardContent sx={{ p: 3 }}>
                                            <Typography variant="caption" sx={{ color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>
                                                Total Donated
                                            </Typography>
                                            <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                                                {totalDonatedFormatted} sETH
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#999' }}>
                                                Sepolia ETH lifetime donations (on-chain reputation)
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                <Grid item xs={12}>
                                    <Card elevation={3} sx={{ borderRadius: '16px' }}>
                                        <CardContent sx={{ p: 3 }}>
                                            <Typography variant="caption" sx={{ color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>
                                                Voting Power
                                            </Typography>
                                            <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                                                {totalDonatedFormatted !== '0'
                                                    ? Math.sqrt(parseFloat(totalDonatedFormatted)).toFixed(2)
                                                    : '0'
                                                }
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#999' }}>
                                                VP = √(Total Sepolia ETH Donated) — Quadratic Voting
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Contract Info */}
                        <Grid item xs={12}>
                            <Alert severity="info" sx={{ borderRadius: '12px' }}>
                                <Typography variant="body2">
                                    <strong>NFT Contract:</strong>{' '}
                                    {CONTRACT_ADDRESSES.DONATION_RECEIPT ? (
                                        <a
                                            href={getExplorerAddressUrl(CONTRACT_ADDRESSES.DONATION_RECEIPT)}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{ color: '#1976d2', fontFamily: 'monospace' }}
                                        >
                                            {CONTRACT_ADDRESSES.DONATION_RECEIPT}
                                        </a>
                                    ) : (
                                        'Not deployed yet — deploy contracts first'
                                    )}
                                </Typography>
                            </Alert>
                        </Grid>
                    </Grid>
                )}
            </Box>
        </DonorDrawer>
    );
};

export default ClaimNFTPage;
