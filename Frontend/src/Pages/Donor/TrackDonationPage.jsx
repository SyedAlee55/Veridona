import React, { useEffect, useState } from 'react';
import {
    Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Card, CardContent, Grid, LinearProgress, Chip, TextField, Button, InputAdornment,
    IconButton, Tooltip, CircularProgress, Divider
} from '@mui/material';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import SearchIcon from '@mui/icons-material/Search';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

import DonorDrawer from '../../components/DonorDrawer';
import { useAuth } from '../../context/AuthContext';
import { usePublicClient } from 'wagmi';
import { CONTRACT_ADDRESSES, getExplorerTxUrl, getExplorerAddressUrl } from '../../contracts/config';
import { parseAbiItem, formatEther } from 'viem';
import { motion } from 'framer-motion';

const TrackDonationPage = () => {
    const { api } = useAuth();
    const publicClient = usePublicClient();

    // Legacy Backend States
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Web3 Search States
    const [searchHash, setSearchHash] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState('');

    // Web3 Recent Events States
    const [recentEvents, setRecentEvents] = useState([]);
    const [eventsLoading, setEventsLoading] = useState(false);

    useEffect(() => {
        fetchDonations();
    }, []);

    useEffect(() => {
        if (publicClient && CONTRACT_ADDRESSES.DONATION_MODULE) {
            fetchRecentEvents();
        }
    }, [publicClient]);

    const fetchDonations = async () => {
        try {
            const res = await api.get('/donor/donations');
            setDonations(res.data.donations || []);
        } catch (err) {
            // It's fine if it errors out since the backend route might be commented
            setError('Could not fetch legacy profile donations.');
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentEvents = async () => {
        if (!publicClient || !CONTRACT_ADDRESSES.DONATION_MODULE) return;
        setEventsLoading(true);
        try {
            const toBlock = await publicClient.getBlockNumber();
            const fromBlock = toBlock > 50000n ? toBlock - 50000n : 0n;

            const logs = await publicClient.getLogs({
                address: CONTRACT_ADDRESSES.DONATION_MODULE,
                event: parseAbiItem('event DonationReceived(uint256 id, address donor, uint256 amount)'),
                fromBlock,
                toBlock: 'latest'
            });

            const formattedLogs = logs.map(log => ({
                campaignId: log.args.id.toString(),
                donor: log.args.donor,
                amount: formatEther(log.args.amount),
                txHash: log.transactionHash,
                blockNumber: log.blockNumber.toString()
            })).reverse().slice(0, 50); // Get latest 50

            setRecentEvents(formattedLogs);
        } catch (err) {
            console.error('Error fetching events:', err);
        } finally {
            setEventsLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchHash.trim()) {
            setSearchError('Please enter a transaction hash.');
            return;
        }
        if (!searchHash.startsWith('0x') || searchHash.length !== 66) {
            setSearchError('Invalid transaction hash. It should be 66 characters long and start with 0x.');
            return;
        }

        setSearchError('');
        setSearchLoading(true);
        setSearchResult(null);

        try {
            const tx = await publicClient.getTransaction({ hash: searchHash });
            if (!tx) {
                setSearchError('Transaction not found on Sepolia network.');
                setSearchLoading(false);
                return;
            }

            const receipt = await publicClient.getTransactionReceipt({ hash: searchHash });
            setSearchResult({ tx, receipt });
        } catch (err) {
            console.error(err);
            setSearchError('Error fetching transaction. Make sure you are on Sepolia network.');
        } finally {
            setSearchLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'success';
            case 'processing': return 'info';
            case 'pending': return 'warning';
            default: return 'default';
        }
    };

    const getProgressValue = (status) => {
        switch (status) {
            case 'pending': return 33;
            case 'processing': return 66;
            case 'completed': return 100;
            default: return 0;
        }
    };

    return (
        <DonorDrawer currentPage="/donor/track-donation">
            <Box sx={{ width: '100%', p: { xs: 2, sm: 4 }, maxWidth: '1200px', mx: 'auto' }}>
                <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#0b1120', display: 'flex', alignItems: 'center' }}>
                    <TrackChangesIcon sx={{ mr: 2, fontSize: 36, color: '#00e5ff' }} />
                    Track Donations
                </Typography>

                {/* Web3 Tracker Search Bar */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <Card sx={{
                        mb: 4,
                        p: { xs: 2, sm: 4 },
                        background: 'linear-gradient(135deg, #0b1120 0%, #1a2235 100%)',
                        color: '#fff',
                        borderRadius: 4,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                        border: '1px solid rgba(0, 229, 255, 0.2)'
                    }}>
                        <Grid container spacing={4} alignItems="center">
                            <Grid item xs={12} md={5}>
                                <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center', color: '#00e5ff' }}>
                                    <TravelExploreIcon sx={{ mr: 1 }} /> Sepolia Tracker
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                                    Search and track any donation transaction directly on the Sepolia Ethereum blockchain using its transaction hash to verify execution in real-time.
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={7}>
                                <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        placeholder="Enter Tx Hash (0x...)"
                                        value={searchHash}
                                        onChange={(e) => setSearchHash(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        sx={{
                                            input: { color: '#fff', py: 2 },
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                                                '&:hover fieldset': { borderColor: '#00e5ff' },
                                                '&.Mui-focused fieldset': { borderColor: '#00e5ff' },
                                                backgroundColor: 'rgba(0,0,0,0.2)',
                                                borderRadius: 3
                                            }
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon sx={{ color: '#00e5ff' }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <Button
                                        variant="contained"
                                        onClick={handleSearch}
                                        disabled={searchLoading}
                                        sx={{
                                            minWidth: '130px',
                                            borderRadius: 3,
                                            backgroundColor: '#00e5ff',
                                            color: '#0b1120',
                                            fontWeight: 'bold',
                                            textTransform: 'none',
                                            fontSize: '1rem',
                                            boxShadow: '0 4px 14px rgba(0,229,255,0.4)',
                                            '&:hover': { backgroundColor: '#00b3cc', boxShadow: '0 6px 20px rgba(0,229,255,0.6)' },
                                            '&.Mui-disabled': { backgroundColor: 'rgba(0,229,255,0.3)', color: 'rgba(11,17,32,0.5)' }
                                        }}
                                    >
                                        {searchLoading ? <CircularProgress size={24} sx={{ color: '#0b1120' }} /> : 'Track'}
                                    </Button>
                                </Box>
                                {searchError && (
                                    <Typography variant="body2" sx={{ color: '#ff5252', mt: 2, fontWeight: 500 }}>
                                        {searchError}
                                    </Typography>
                                )}
                            </Grid>
                        </Grid>
                    </Card>
                </motion.div>

                {/* Web3 Search Result */}
                {searchResult && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
                        <Card sx={{ mb: 6, borderRadius: 3, borderLeft: '6px solid #00e5ff', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                            <CardContent sx={{ p: 4 }}>
                                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: '#0b1120', display: 'flex', alignItems: 'center' }}>
                                    <TrackChangesIcon sx={{ mr: 1, color: '#00e5ff' }} /> Transaction Found
                                </Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 'bold' }}>Transaction Hash</Typography>
                                        <Typography variant="body2" sx={{ wordBreak: 'break-all', fontFamily: 'monospace', bgcolor: '#f1f5f9', p: 1, borderRadius: 1, mt: 0.5 }}>
                                            {searchResult.tx.hash}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6} md={3}>
                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 'bold' }}>Status</Typography>
                                        <Box sx={{ mt: 0.5 }}>
                                            <Chip
                                                label={searchResult.receipt.status === 'success' ? 'Success' : 'Failed'}
                                                color={searchResult.receipt.status === 'success' ? 'success' : 'error'}
                                                size="small"
                                                variant="filled"
                                                sx={{ fontWeight: 'bold' }}
                                            />
                                        </Box>
                                    </Grid>
                                    <Grid item xs={6} md={3}>
                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 'bold' }}>Block Number</Typography>
                                        <Typography variant="body1" sx={{ mt: 0.5, fontWeight: 500 }}>{searchResult.receipt.blockNumber.toString()}</Typography>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 'bold' }}>From (Sender)</Typography>
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 0.5 }}>{searchResult.tx.from}</Typography>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 'bold' }}>To (Contract)</Typography>
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 0.5 }}>{searchResult.tx.to}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sx={{ mt: 2 }}>
                                        <Button
                                            variant="outlined"
                                            size="medium"
                                            endIcon={<OpenInNewIcon />}
                                            href={getExplorerTxUrl(searchResult.tx.hash)}
                                            target="_blank"
                                            sx={{ borderRadius: 2, borderColor: '#cbd5e1', color: '#475569', '&:hover': { borderColor: '#00e5ff', color: '#00e5ff', bgcolor: 'transparent' } }}
                                        >
                                            View on Etherscan
                                        </Button>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Network Table */}
                <Box sx={{ mb: 6 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h5" sx={{ fontWeight: '800', color: '#0b1120', display: 'flex', alignItems: 'center' }}>
                            <AccountBalanceWalletIcon sx={{ mr: 1.5, color: '#00e5ff' }} />
                            Recent Network Donations
                        </Typography>
                        <Tooltip title="Refresh On-Chain Events">
                            <IconButton onClick={fetchRecentEvents} disabled={eventsLoading} sx={{ bgcolor: '#f1f5f9', '&:hover': { bgcolor: '#e2e8f0' } }}>
                                <RefreshIcon sx={{ animation: eventsLoading ? 'spin 1s linear infinite' : 'none', color: '#0b1120' }} />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                        <Table aria-label="recent donations table">
                            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', color: '#475569', py: 2.5 }}>Campaign ID</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: '#475569', py: 2.5 }}>Donor Address</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: '#475569', py: 2.5 }}>Amount (ETH)</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: '#475569', py: 2.5, textAlign: 'center' }}>Link</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {eventsLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                                            <CircularProgress sx={{ color: '#00e5ff' }} />
                                        </TableCell>
                                    </TableRow>
                                ) : recentEvents.length > 0 ? (
                                    recentEvents.map((event, idx) => (
                                        <TableRow key={idx} hover sx={{ '&:last-child td, &:last-child th': { border: 0 }, transition: 'background 0.2s' }}>
                                            <TableCell sx={{ fontWeight: 600, color: '#0f172a' }}>#{event.campaignId}</TableCell>
                                            <TableCell sx={{ fontFamily: 'monospace' }}>
                                                <Tooltip title="View Sender on Etherscan">
                                                    <Box component="a" href={getExplorerAddressUrl(event.donor)} target="_blank" sx={{ color: '#3b82f6', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                                                        {event.donor.substring(0, 6)}...{event.donor.substring(38)}
                                                    </Box>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', color: '#10b981' }}>
                                                {event.amount} ETH
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="View Transaction on Etherscan">
                                                    <IconButton size="small" href={getExplorerTxUrl(event.txHash)} target="_blank" sx={{ color: '#94a3b8', '&:hover': { color: '#00e5ff' }, bgcolor: '#f8fafc' }}>
                                                        <OpenInNewIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 6, color: '#94a3b8' }}>
                                            <Typography variant="body1">No recent on-chain donations found for this contract.</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                <Divider sx={{ my: 6 }} />

                {/* Legacy Profile Profile Tracker */}
                <Box>
                    <Typography variant="h5" sx={{ mb: 3, fontWeight: '800', color: '#0b1120' }}>
                        Your Profile Donations (Legacy)
                    </Typography>

                    {error && !loading && (
                        <Card elevation={0} sx={{ mb: 3, backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 3 }}>
                            <CardContent>
                                <Typography variant="body2" sx={{ color: '#ef4444' }}>
                                    {error} - Make sure backend routing is enabled to fetch legacy data.
                                </Typography>
                            </CardContent>
                        </Card>
                    )}

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress sx={{ color: '#00e5ff' }} />
                        </Box>
                    ) : donations.length > 0 ? (
                        <Grid container spacing={3}>
                            {donations.map((donation) => (
                                <Grid item xs={12} md={6} key={donation.id}>
                                    <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 10px 25px rgba(0,0,0,0.05)', borderColor: '#cbd5e1' } }}>
                                        <CardContent sx={{ p: 3 }}>
                                            <Grid container spacing={2} alignItems="center">
                                                <Grid item xs={12} sm={4}>
                                                    <Typography variant="h5" sx={{ fontWeight: '800', color: '#0b1120' }}>
                                                        ${donation.amount}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                                                        {new Date(donation.date).toLocaleDateString()}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={8}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                                        <Typography variant="body2" sx={{ fontWeight: '600', color: '#475569' }}>
                                                            Status: {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                                                        </Typography>
                                                        <Chip
                                                            label={donation.status.toUpperCase()}
                                                            color={getStatusColor(donation.status)}
                                                            size="small"
                                                            sx={{ height: 20, fontSize: '0.65rem', fontWeight: 'bold' }}
                                                        />
                                                    </Box>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={getProgressValue(donation.status)}
                                                        sx={{
                                                            height: '8px',
                                                            borderRadius: '4px',
                                                            backgroundColor: '#f1f5f9',
                                                            '& .MuiLinearProgress-bar': {
                                                                backgroundColor:
                                                                    donation.status === 'completed'
                                                                        ? '#10b981'
                                                                        : donation.status === 'processing'
                                                                            ? '#3b82f6'
                                                                            : '#f59e0b',
                                                            }
                                                        }}
                                                    />
                                                </Grid>
                                            </Grid>
                                            {donation.recipientName && (
                                                <Box sx={{ mt: 3, p: 2, backgroundColor: '#f8fafc', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
                                                    <Typography variant="body2" sx={{ color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
                                                        <span><strong>Recipient:</strong> {donation.recipientName}</span>
                                                        <span><strong>Blood Type:</strong> {donation.bloodType || 'N/A'}</span>
                                                    </Typography>
                                                </Box>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    ) : null}
                </Box>
            </Box>
        </DonorDrawer>
    );
};

export default TrackDonationPage;
