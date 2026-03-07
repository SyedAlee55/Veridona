import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Card, CardContent, Grid } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import DonorDrawer from '../../components/DonorDrawer';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';

const ClaimNFTPage = () => {
    const { user, api } = useAuth();
    const [nfts, setNfts] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchNFTs();
    }, []);

    const fetchNFTs = async () => {
        try {
            const res = await api.get('/donor/nfts');
            setNfts(res.data.nfts || []);
        } catch (error) {
            setMessage('Error fetching NFTs: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleClaimNFT = async (nftId) => {
        setLoading(true);
        try {
            const res = await api.post(`/donor/claim-nft/${nftId}`);
            setMessage('NFT claimed successfully!');
            fetchNFTs();
        } catch (error) {
            setMessage('Error claiming NFT: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <DonorDrawer currentPage="/donor/claim-nft">
            <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: '1200px', mx: 'auto' }}>
                <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#333' }}>
                    <CardGiftcardIcon sx={{ mr: 2, verticalAlign: 'middle', color: '#f57c00' }} />
                    Claim Digital NFT Certificates
                </Typography>

                <Card elevation={3} sx={{ mb: 4, backgroundColor: '#fff3e0', borderLeft: '4px solid #f57c00' }}>
                    <CardContent>
                        <Typography variant="body1" sx={{ color: '#333' }}>
                            Receive digital NFT certificates for your donations. These blockchain-verified certificates serve as proof of your contribution to saving lives.
                        </Typography>
                    </CardContent>
                </Card>

                {nfts.length > 0 ? (
                    <TableContainer component={Paper} elevation={3}>
                        <Table>
                            <TableHead sx={{ backgroundColor: '#667eea', color: 'white' }}>
                                <TableRow>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Certificate Name</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date Eligible</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {nfts.map((nft) => (
                                    <TableRow key={nft.id} hover>
                                        <TableCell>{nft.name}</TableCell>
                                        <TableCell>{new Date(nft.eligibleDate).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Box sx={{
                                                display: 'inline-block',
                                                px: 2,
                                                py: 0.5,
                                                borderRadius: '20px',
                                                backgroundColor: nft.claimed ? '#e8f5e9' : '#fff3e0',
                                                color: nft.claimed ? '#2e7d32' : '#f57c00',
                                                fontSize: '0.85rem',
                                                fontWeight: '600'
                                            }}>
                                                {nft.claimed ? 'Claimed' : 'Available'}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                disabled={nft.claimed || loading}
                                                onClick={() => handleClaimNFT(nft.id)}
                                                sx={{
                                                    backgroundColor: nft.claimed ? '#ccc' : '#667eea',
                                                    '&:hover': {
                                                        backgroundColor: nft.claimed ? '#ccc' : '#764ba2',
                                                    }
                                                }}
                                            >
                                                {nft.claimed ? 'Claimed' : 'Claim Now'}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Paper elevation={3} sx={{ p: 4, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
                        <CardGiftcardIcon sx={{ fontSize: 64, color: '#bbb', mb: 2 }} />
                        <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
                            No NFT certificates available yet
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#999' }}>
                            Make donations to become eligible for NFT certificates
                        </Typography>
                    </Paper>
                )}

                {message && (
                    <Box
                        sx={{
                            mt: 3,
                            p: 2,
                            backgroundColor: message.includes('Error') ? '#ffebee' : '#e8f5e9',
                            color: message.includes('Error') ? '#c62828' : '#2e7d32',
                            borderRadius: '8px',
                            border: `2px solid ${message.includes('Error') ? '#ef5350' : '#66bb6a'}`,
                        }}
                    >
                        {message}
                    </Box>
                )}
            </Box>
        </DonorDrawer>
    );
};

export default ClaimNFTPage;
