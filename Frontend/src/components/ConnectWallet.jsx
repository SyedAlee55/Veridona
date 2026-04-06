import React from 'react';
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { Box, Button, Typography, Chip, IconButton, Tooltip } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LogoutIcon from '@mui/icons-material/Logout';

const ConnectWallet = ({ compact = false }) => {
    const { address, isConnected, chain } = useAccount();
    const { connect, connectors, isPending } = useConnect();
    const { disconnect } = useDisconnect();
    const { data: balance } = useBalance({ address });

    const truncateAddress = (addr) => {
        if (!addr) return '';
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    const copyAddress = () => {
        if (address) {
            navigator.clipboard.writeText(address);
        }
    };

    if (isConnected) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: compact ? 1 : 1.5,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)',
                    border: '1px solid rgba(102,126,234,0.3)',
                }}
            >
                <Box
                    sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: '#4caf50',
                        boxShadow: '0 0 6px rgba(76,175,80,0.6)',
                    }}
                />

                {!compact && (
                    <Box sx={{ mr: 1 }}>
                        <Typography variant="caption" sx={{ color: '#999', display: 'block', lineHeight: 1 }}>
                            {chain?.name || 'Unknown Network'}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#333' }}>
                            {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : '...'}
                        </Typography>
                    </Box>
                )}

                <Chip
                    label={truncateAddress(address)}
                    size="small"
                    sx={{
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        backgroundColor: 'rgba(102,126,234,0.15)',
                        color: '#667eea',
                        border: '1px solid rgba(102,126,234,0.3)',
                    }}
                />

                <Tooltip title="Copy Address">
                    <IconButton size="small" onClick={copyAddress} sx={{ color: '#667eea' }}>
                        <ContentCopyIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Disconnect Wallet">
                    <IconButton size="small" onClick={() => disconnect()} sx={{ color: '#e53935' }}>
                        <LogoutIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                </Tooltip>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {connectors.map((connector) => (
                <Button
                    key={connector.uid}
                    onClick={() => connect({ connector })}
                    disabled={isPending}
                    variant="contained"
                    size={compact ? 'small' : 'medium'}
                    startIcon={<AccountBalanceWalletIcon />}
                    sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontWeight: 'bold',
                        borderRadius: '12px',
                        textTransform: 'none',
                        px: 3,
                        boxShadow: '0 4px 15px rgba(102,126,234,0.3)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                            boxShadow: '0 6px 20px rgba(102,126,234,0.4)',
                        },
                    }}
                >
                    {isPending ? 'Connecting...' : `Connect ${connector.name}`}
                </Button>
            ))}
        </Box>
    );
};

export default ConnectWallet;
