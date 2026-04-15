import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useIsVerifiedReceiver } from '../hooks/useContractRead';
import ReceiverDrawer from '../components/ReceiverDrawer';

const ReceiverDashboard = () => {
    const { user, api } = useAuth();
    const navigate = useNavigate();
    const { address, isConnected } = useAccount();
    const [dbStatus, setDbStatus] = useState(null); // 'none' | 'pending' | 'approved' | 'rejected'
    const [loadingStatus, setLoadingStatus] = useState(true);

    // On-chain verification check
    const { data: isOnChainVerified, isLoading: chainLoading } = useIsVerifiedReceiver(address);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await api.get('/receiver/status');
                setDbStatus(res.data.status);
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingStatus(false);
            }
        };
        fetchStatus();
    }, [api]);

    const isLoading = loadingStatus || chainLoading;
    const isFullyVerified = isOnChainVerified === true;

    const quickLinks = [
        {
            title: 'My Campaigns',
            icon: '🚀',
            description: 'Create campaigns and trigger payouts after the 24h safety window.',
            path: '/receiver/campaigns',
            gradient: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
        },
        {
            title: 'FAQ',
            icon: '💡',
            description: 'Learn how Veridona works and how to use your dashboard.',
            path: '/receiver/faq',
            gradient: 'linear-gradient(135deg, #10b981, #0ea5e9)',
        },
        {
            title: 'Contact Us',
            icon: '📬',
            description: 'Reach out to the team for support or questions.',
            path: '/receiver/contact',
            gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
        },
    ];

    const renderVerificationGate = () => {
        if (dbStatus === 'none' || dbStatus === null) {
            return (
                <div style={s.gate}>
                    <div style={s.gateIcon}>📋</div>
                    <h2 style={s.gateTitle}>Verification Required</h2>
                    <p style={s.gateText}>
                        Before you can create campaigns, you need to submit your organisation details for admin review.
                    </p>
                    <button style={s.gateBtn} onClick={() => navigate('/receiver/verify')}>
                        Start Verification →
                    </button>
                </div>
            );
        }
        if (dbStatus === 'pending') {
            return (
                <div style={{ ...s.gate, borderColor: '#f59e0b44' }}>
                    <div style={{ ...s.gateIcon, background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>⏳</div>
                    <h2 style={s.gateTitle}>Verification Pending</h2>
                    <p style={s.gateText}>
                        Your application is in the admin review queue. Once approved, your wallet will be whitelisted on-chain and you can create campaigns.
                    </p>
                    <div style={s.statusBadge}>
                        <span style={{ color: '#f59e0b' }}>● Under Review</span>
                    </div>
                </div>
            );
        }
        if (dbStatus === 'rejected') {
            return (
                <div style={{ ...s.gate, borderColor: '#ef444444' }}>
                    <div style={{ ...s.gateIcon, background: 'linear-gradient(135deg, #ef4444, #7f1d1d)' }}>❌</div>
                    <h2 style={s.gateTitle}>Application Rejected</h2>
                    <p style={s.gateText}>
                        Your previous application was not approved. Please re-submit with updated or corrected information.
                    </p>
                    <button style={{ ...s.gateBtn, background: 'linear-gradient(135deg, #ef4444, #7f1d1d)' }} onClick={() => navigate('/receiver/verify')}>
                        Re-submit Application
                    </button>
                </div>
            );
        }
        return null;
    };

    return (
        <ReceiverDrawer currentPage="/receiver">
            <div style={s.page}>
                {/* Header */}
                <div style={s.hero}>
                    <div>
                        <h1 style={s.heroTitle}>Welcome, {user?.username} 👋</h1>
                        <p style={s.heroSub}>
                            {isFullyVerified
                                ? 'You are a verified receiver. Start creating campaigns below.'
                                : 'Complete verification to unlock campaign creation.'}
                        </p>
                    </div>
                    <div style={s.verifiedBadge}>
                        {isLoading
                            ? <span style={{ color: '#94a3b8' }}>Checking…</span>
                            : isFullyVerified
                                ? <span style={{ color: '#4ade80' }}>✅ Verified Receiver</span>
                                : <span style={{ color: '#f59e0b' }}>⏳ Pending Verification</span>
                        }
                    </div>
                </div>

                {/* Wallet Warning */}
                {!isConnected && (
                    <div style={s.walletWarn}>
                        🦊 Connect your MetaMask wallet to check your on-chain verification status.
                    </div>
                )}

                {/* Verification Gate or Dashboard Content */}
                {isLoading ? (
                    <div style={s.loadingRow}><div style={s.spinner} /></div>
                ) : !isFullyVerified ? (
                    renderVerificationGate()
                ) : (
                    <>
                        {/* Stats Row */}
                        <div style={s.statsRow}>
                            {[
                                { label: 'Status', value: '✅ Active', color: '#4ade80' },
                                { label: 'Wallet', value: address ? `${address.slice(0, 6)}…${address.slice(-4)}` : 'N/A', color: '#0ea5e9' },
                                { label: 'Role', value: 'Verified Receiver', color: '#a78bfa' },
                            ].map((stat) => (
                                <div key={stat.label} style={s.statCard}>
                                    <span style={{ color: '#64748b', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em' }}>{stat.label.toUpperCase()}</span>
                                    <span style={{ color: stat.color, fontSize: 18, fontWeight: 800, marginTop: 4 }}>{stat.value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Quick Access */}
                        <h2 style={s.sectionTitle}>Quick Access</h2>
                        <div style={s.quickGrid}>
                            {quickLinks.map((link) => (
                                <div key={link.path} style={s.quickCard} onClick={() => navigate(link.path)}>
                                    <div style={{ ...s.quickIcon, background: link.gradient }}>{link.icon}</div>
                                    <div>
                                        <p style={s.quickTitle}>{link.title}</p>
                                        <p style={s.quickDesc}>{link.description}</p>
                                    </div>
                                    <span style={s.quickArrow}>→</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </ReceiverDrawer>
    );
};

const s = {
    page: { padding: '32px 24px', maxWidth: 900, margin: '0 auto', fontFamily: 'Inter, sans-serif' },
    hero: {
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        border: '1px solid #334155', borderRadius: 20,
        padding: '32px 36px', marginBottom: 24,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
    },
    heroTitle: { color: '#f1f5f9', fontSize: 28, fontWeight: 800, margin: '0 0 8px' },
    heroSub: { color: '#94a3b8', margin: 0 },
    verifiedBadge: { fontWeight: 700, fontSize: 16 },
    walletWarn: {
        background: '#78350f22', border: '1px solid #f59e0b55', borderRadius: 12,
        color: '#fbbf24', padding: '12px 20px', marginBottom: 24, fontSize: 14,
    },
    loadingRow: { display: 'flex', justifyContent: 'center', padding: 64 },
    spinner: {
        width: 40, height: 40, border: '3px solid #334155',
        borderTop: '3px solid #0ea5e9', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    },
    gate: {
        background: '#1e293b', border: '1px solid #6366f133',
        borderRadius: 20, padding: '48px 40px', textAlign: 'center',
        maxWidth: 520, margin: '0 auto',
    },
    gateIcon: {
        fontSize: 36, background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
        borderRadius: '50%', width: 80, height: 80,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px',
    },
    gateTitle: { color: '#f1f5f9', fontSize: 24, fontWeight: 800, margin: '0 0 12px' },
    gateText: { color: '#94a3b8', lineHeight: 1.6, margin: '0 0 24px' },
    gateBtn: {
        background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
        color: '#fff', border: 'none', borderRadius: 12,
        padding: '12px 28px', fontSize: 15, fontWeight: 700,
        cursor: 'pointer',
    },
    statusBadge: {
        background: '#f59e0b22', border: '1px solid #f59e0b55',
        borderRadius: 8, padding: '8px 16px', display: 'inline-block', fontWeight: 600, fontSize: 14,
    },
    statsRow: { display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' },
    statCard: {
        flex: 1, minWidth: 160, background: '#1e293b', border: '1px solid #334155',
        borderRadius: 14, padding: '20px 24px', display: 'flex', flexDirection: 'column',
    },
    sectionTitle: { color: '#f1f5f9', fontSize: 20, fontWeight: 700, marginBottom: 16 },
    quickGrid: { display: 'flex', flexDirection: 'column', gap: 12 },
    quickCard: {
        background: '#1e293b', border: '1px solid #334155', borderRadius: 14,
        padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16,
        cursor: 'pointer', transition: 'border-color 0.2s, transform 0.15s',
    },
    quickIcon: {
        fontSize: 24, borderRadius: 12, width: 52, height: 52,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    quickTitle: { color: '#f1f5f9', fontWeight: 700, margin: '0 0 4px', fontSize: 16 },
    quickDesc: { color: '#64748b', margin: 0, fontSize: 13 },
    quickArrow: { color: '#475569', fontSize: 20, marginLeft: 'auto' },
};

export default ReceiverDashboard;
