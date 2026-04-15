import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccount } from 'wagmi';
import ConnectWallet from '../components/ConnectWallet';
import { useCampaignCount, useAllCampaigns } from '../hooks/useContractRead';
import { useSetReceiverStatus, useRemoveCampaign } from '../hooks/useContractWrite';
import { getExplorerTxUrl } from '../contracts/config';
import { formatEther } from 'viem';

// ── helpers ──────────────────────────────────────────────────────────────────
const getCampaignStatus = (c) => {
    if (c.completed) return { label: 'Finished', color: '#4ade80', bg: '#14532d33' };
    if (c.isDisputed) return { label: 'Removed / Disputed', color: '#ef4444', bg: '#7f1d1d33' };
    if (!c.isActive) return { label: 'Inactive', color: '#94a3b8', bg: '#1e293b' };
    const goal = BigInt(c.goal || 0);
    const bal = BigInt(c.currentBalance || 0);
    if (goal === 0n || bal < goal) return { label: 'Funding', color: '#0ea5e9', bg: '#0c4a6e33' };
    const elapsed = Math.floor(Date.now() / 1000) - Number(c.goalReachedAt);
    if (elapsed < 86400) return { label: 'Safety Window', color: '#f59e0b', bg: '#78350f33' };
    return { label: 'Ready to Claim', color: '#a78bfa', bg: '#4c1d9533' };
};

const shortAddr = (a) => a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '—';

// ── component ─────────────────────────────────────────────────────────────────
const AdminDashboard = () => {
    const { user, api, logout } = useAuth();
    const { address, isConnected } = useAccount();

    // Backend state
    const [applications, setApplications] = useState([]);
    const [appLoading, setAppLoading] = useState(true);
    const [appMsg, setAppMsg] = useState('');

    // On-chain state
    const { data: campaignCount, refetch: refetchCount } = useCampaignCount();
    const { campaigns, isLoading: campaignsLoading, refetch: refetchCampaigns } = useAllCampaigns(campaignCount);

    // Write hooks
    const { setReceiverStatus, hash: approveHash, isPending: approvePending, isConfirmed: approveConfirmed, error: approveError } = useSetReceiverStatus();
    const { removeCampaign, hash: removeHash, isPending: removePending, isConfirmed: removeConfirmed, error: removeError } = useRemoveCampaign();

    // Active tab
    const [tab, setTab] = useState('queue'); // 'queue' | 'pipeline' | 'moderate'

    // tracking which application/campaign is being actioned
    const [pendingApproveId, setPendingApproveId] = useState(null);
    const [pendingRemoveId, setPendingRemoveId] = useState(null);

    const fetchApplications = useCallback(async () => {
        try {
            const res = await api.get('/admin/applications');
            setApplications(res.data.applications || []);
        } catch (e) {
            console.error(e);
        } finally {
            setAppLoading(false);
        }
    }, [api]);

    useEffect(() => { fetchApplications(); }, [fetchApplications]);

    // After on-chain approve confirmed → update DB
    useEffect(() => {
        if (approveConfirmed && pendingApproveId) {
            api.post('/admin/applications/approve', { applicationId: pendingApproveId })
                .then(() => {
                    setAppMsg('✅ Receiver approved on-chain and in database.');
                    fetchApplications();
                    setPendingApproveId(null);
                })
                .catch(console.error);
        }
    }, [approveConfirmed, pendingApproveId, api, fetchApplications]);

    // After on-chain remove confirmed
    useEffect(() => {
        if (removeConfirmed && pendingRemoveId) {
            setAppMsg(`✅ Campaign #${pendingRemoveId} removed from chain.`);
            setTimeout(() => { refetchCount(); refetchCampaigns(); }, 2000);
            setPendingRemoveId(null);
        }
    }, [removeConfirmed, pendingRemoveId, refetchCount, refetchCampaigns]);

    const handleApprove = (app) => {
        const addr = app.walletAddress || app.user?.walletAddress;
        if (!addr) {
            setAppMsg('⚠️ This receiver has no wallet address on file.');
            return;
        }
        setPendingApproveId(app._id);
        setReceiverStatus(addr, true);
    };

    const handleRemove = (id) => {
        setPendingRemoveId(id);
        removeCampaign(id);
    };

    // ── UI ──────────────────────────────────────────────────────────────────
    const tabs = [
        { id: 'queue', label: '📋 Verification Queue', count: applications.length },
        { id: 'pipeline', label: '🌐 Global Pipeline', count: campaigns.length },
        { id: 'moderate', label: '🚨 Moderation', count: null },
    ];

    return (
        <div style={s.page}>
            {/* Sidebar */}
            <aside style={s.sidebar}>
                <div style={s.logo}>⚡ Veridona</div>
                <p style={s.role}>Admin Command Center</p>
                <div style={s.walletBox}>
                    {isConnected
                        ? <span style={{ color: '#4ade80', fontSize: 13 }}>🟢 {shortAddr(address)}</span>
                        : <ConnectWallet />}
                </div>
                <nav style={s.nav}>
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            style={{ ...s.navBtn, ...(tab === t.id ? s.navBtnActive : {}) }}
                        >
                            <span>{t.label}</span>
                            {t.count !== null && <span style={s.navCount}>{t.count}</span>}
                        </button>
                    ))}
                </nav>
                <div style={s.adminInfo}>
                    <p style={{ margin: 0, color: '#64748b', fontSize: 12 }}>Logged in as</p>
                    <p style={{ margin: 0, color: '#cbd5e1', fontWeight: 700 }}>{user?.username}</p>
                    <button onClick={logout} style={s.logoutBtn}>
                        🚪 Logout
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main style={s.main}>
                {/* Flash message */}
                {appMsg && (
                    <div style={s.flashMsg} onClick={() => setAppMsg('')}>
                        {appMsg} <span style={{ opacity: 0.5, marginLeft: 12 }}>✕</span>
                    </div>
                )}

                {/* Tx hashes */}
                {(approveHash || removeHash) && (
                    <a href={getExplorerTxUrl(approveHash || removeHash)} target="_blank" rel="noreferrer" style={s.txLink}>
                        🔗 View transaction on Etherscan →
                    </a>
                )}
                {(approveError || removeError) && (
                    <div style={{ ...s.flashMsg, borderColor: '#ef444466', color: '#f87171' }}>
                        ⚠️ {(approveError || removeError)?.shortMessage || 'Transaction failed'}
                    </div>
                )}

                {/* ── Tab: Verification Queue ── */}
                {tab === 'queue' && (
                    <section>
                        <h2 style={s.sectionTitle}>Receiver Verification Queue</h2>
                        <p style={s.sectionDesc}>Pending applications from organisations seeking receiver status.</p>

                        {appLoading ? (
                            <div style={s.loadingRow}><div style={s.spinner} /></div>
                        ) : applications.length === 0 ? (
                            <div style={s.emptyState}>
                                <span style={{ fontSize: 48 }}>📭</span>
                                <p style={{ color: '#64748b', marginTop: 12 }}>No pending applications</p>
                            </div>
                        ) : (
                            <div style={s.cardGrid}>
                                {applications.map(app => (
                                    <div key={app._id} style={s.appCard}>
                                        <div style={s.appCardHeader}>
                                            <div style={s.appAvatar}>{app.orgName?.[0]?.toUpperCase() || '?'}</div>
                                            <div>
                                                <p style={s.appName}>{app.orgName}</p>
                                                <p style={s.appUser}>{app.user?.email}</p>
                                            </div>
                                            <div style={s.statusPill}>⏳ Pending</div>
                                        </div>

                                        <div style={s.appMeta}>
                                            <div style={s.metaRow}>
                                                <span style={s.metaLabel}>Tax ID</span>
                                                <span style={s.metaValue}>{app.taxId}</span>
                                            </div>
                                            <div style={s.metaRow}>
                                                <span style={s.metaLabel}>Wallet</span>
                                                <span style={s.metaValue} title={app.walletAddress || app.user?.walletAddress}>
                                                    {shortAddr(app.walletAddress || app.user?.walletAddress)}
                                                </span>
                                            </div>
                                            <div style={s.metaRow}>
                                                <span style={s.metaLabel}>Document</span>
                                                <a href={app.documentUrl} target="_blank" rel="noreferrer" style={s.docLink}>View Document →</a>
                                            </div>
                                        </div>

                                        <div style={s.appActions}>
                                            <button
                                                style={{ ...s.actionBtn, background: 'linear-gradient(135deg, #10b981, #0ea5e9)' }}
                                                onClick={() => handleApprove(app)}
                                                disabled={approvePending && pendingApproveId === app._id}
                                            >
                                                {approvePending && pendingApproveId === app._id ? '⏳ Approving…' : '✅ Approve'}
                                            </button>
                                            <button
                                                style={{ ...s.actionBtn, background: 'linear-gradient(135deg, #ef4444, #7f1d1d)' }}
                                                onClick={() => api.post('/admin/applications/reject', { applicationId: app._id }).then(fetchApplications)}
                                            >
                                                ❌ Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* ── Tab: Global Pipeline ── */}
                {tab === 'pipeline' && (
                    <section>
                        <h2 style={s.sectionTitle}>Global Campaign Pipeline</h2>
                        <p style={s.sectionDesc}>Bird's-eye view of all campaigns across the platform.</p>

                        {campaignsLoading ? (
                            <div style={s.loadingRow}><div style={s.spinner} /></div>
                        ) : campaigns.length === 0 ? (
                            <div style={s.emptyState}>
                                <span style={{ fontSize: 48 }}>📊</span>
                                <p style={{ color: '#64748b', marginTop: 12 }}>No campaigns yet</p>
                            </div>
                        ) : (
                            <div style={s.table}>
                                <div style={s.tableHeader}>
                                    <span style={{ flex: 0.5 }}>#</span>
                                    <span style={{ flex: 2 }}>Receiver</span>
                                    <span style={{ flex: 1.5 }}>Raised / Goal</span>
                                    <span style={{ flex: 1.5 }}>Status</span>
                                </div>
                                {campaigns.map(c => {
                                    const st = getCampaignStatus(c);
                                    const pct = c.goal > 0n ? Math.min(Number((c.currentBalance * 100n) / c.goal), 100) : 0;
                                    return (
                                        <div key={c.id} style={s.tableRow}>
                                            <span style={{ flex: 0.5, color: '#64748b' }}>#{c.id}</span>
                                            <span style={{ flex: 2, color: '#cbd5e1', fontFamily: 'monospace', fontSize: 13 }}>{shortAddr(c.receiver)}</span>
                                            <span style={{ flex: 1.5 }}>
                                                <div style={{ color: '#f1f5f9', fontSize: 13 }}>{formatEther(c.currentBalance)} / {formatEther(c.goal)} ETH</div>
                                                <div style={{ ...s.progressBar }}>
                                                    <div style={{ ...s.progressFill, width: `${pct}%` }} />
                                                </div>
                                            </span>
                                            <span style={{ flex: 1.5 }}>
                                                <span style={{ ...s.statusPill, background: st.bg, color: st.color, borderColor: `${st.color}55` }}>
                                                    {st.label}
                                                </span>
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                )}

                {/* ── Tab: Moderation ── */}
                {tab === 'moderate' && (
                    <section>
                        <h2 style={s.sectionTitle}>Campaign Moderation</h2>
                        <p style={s.sectionDesc}>Remove fraudulent or invalid campaigns from the chain. This action is irreversible.</p>

                        {campaignsLoading ? (
                            <div style={s.loadingRow}><div style={s.spinner} /></div>
                        ) : campaigns.length === 0 ? (
                            <div style={s.emptyState}>
                                <span style={{ fontSize: 48 }}>🎉</span>
                                <p style={{ color: '#64748b', marginTop: 12 }}>Nothing to moderate</p>
                            </div>
                        ) : (
                            <div style={s.modGrid}>
                                {campaigns.filter(c => !c.completed).map(c => {
                                    const st = getCampaignStatus(c);
                                    return (
                                        <div key={c.id} style={s.modCard}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                                <span style={{ color: '#f1f5f9', fontWeight: 700 }}>Campaign #{c.id}</span>
                                                <span style={{ ...s.statusPill, background: st.bg, color: st.color, borderColor: `${st.color}55` }}>{st.label}</span>
                                            </div>
                                            <div style={s.metaRow}>
                                                <span style={s.metaLabel}>Receiver</span>
                                                <span style={{ ...s.metaValue, fontFamily: 'monospace' }}>{shortAddr(c.receiver)}</span>
                                            </div>
                                            <div style={s.metaRow}>
                                                <span style={s.metaLabel}>Balance</span>
                                                <span style={s.metaValue}>{formatEther(c.currentBalance)} ETH</span>
                                            </div>
                                            <div style={s.metaRow}>
                                                <span style={s.metaLabel}>Goal</span>
                                                <span style={s.metaValue}>{formatEther(c.goal)} ETH</span>
                                            </div>
                                            <button
                                                style={{ ...s.actionBtn, marginTop: 16, background: 'linear-gradient(135deg, #ef4444, #7f1d1d)', width: '100%' }}
                                                onClick={() => handleRemove(c.id)}
                                                disabled={(removePending || !removeConfirmed === false) && pendingRemoveId === c.id}
                                            >
                                                {removePending && pendingRemoveId === c.id ? '⏳ Removing…' : '🗑️ Remove Campaign'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                )}
            </main>
        </div>
    );
};

// ── styles ────────────────────────────────────────────────────────────────────
const s = {
    page: { display: 'flex', minHeight: '100vh', background: '#0f172a', fontFamily: 'Inter, sans-serif' },
    sidebar: {
        width: 240, background: '#0a0f1e', borderRight: '1px solid #1e293b',
        padding: '32px 20px', display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0,
    },
    logo: { color: '#f1f5f9', fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 4 },
    role: { color: '#475569', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 20px' },
    walletBox: { marginBottom: 20 },
    nav: { display: 'flex', flexDirection: 'column', gap: 4, flex: 1 },
    navBtn: {
        background: 'transparent', border: 'none', color: '#64748b',
        padding: '10px 14px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
        fontSize: 13, fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        transition: 'all 0.15s',
    },
    navBtnActive: { background: '#1e293b', color: '#f1f5f9' },
    navCount: {
        background: '#334155', color: '#94a3b8', borderRadius: 20,
        padding: '2px 8px', fontSize: 11, fontWeight: 700,
    },
    adminInfo: {
        borderTop: '1px solid #1e293b', paddingTop: 16, marginTop: 8,
        display: 'flex', flexDirection: 'column', gap: 12
    },
    logoutBtn: {
        background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
        color: '#f87171', borderRadius: 8, padding: '8px 12px', fontSize: 12,
        fontWeight: 600, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
        marginTop: 4, width: '100%'
    },
    main: { flex: 1, padding: '40px 48px', overflowY: 'auto' },
    flashMsg: {
        background: '#14532d22', border: '1px solid #4ade8066', borderRadius: 12,
        color: '#4ade80', padding: '12px 20px', marginBottom: 24,
        cursor: 'pointer', fontSize: 14, fontWeight: 600,
    },
    txLink: {
        display: 'block', color: '#0ea5e9', marginBottom: 16, fontSize: 13,
        textDecoration: 'none', fontWeight: 600,
    },
    sectionTitle: { color: '#f1f5f9', fontSize: 24, fontWeight: 800, margin: '0 0 8px' },
    sectionDesc: { color: '#64748b', margin: '0 0 28px', fontSize: 14 },
    loadingRow: { display: 'flex', justifyContent: 'center', padding: 64 },
    spinner: {
        width: 40, height: 40, border: '3px solid #1e293b',
        borderTop: '3px solid #0ea5e9', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    },
    emptyState: {
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '64px 0', background: '#1e293b', borderRadius: 16, border: '1px solid #334155',
    },
    // Application cards
    cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 },
    appCard: { background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: 24 },
    appCardHeader: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 },
    appAvatar: {
        width: 44, height: 44, background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 800, fontSize: 18, flexShrink: 0,
    },
    appName: { color: '#f1f5f9', fontWeight: 700, margin: 0, fontSize: 15 },
    appUser: { color: '#64748b', margin: 0, fontSize: 12 },
    statusPill: {
        background: '#78350f33', color: '#f59e0b', border: '1px solid #f59e0b55',
        borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600,
        marginLeft: 'auto', whiteSpace: 'nowrap',
    },
    appMeta: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 },
    metaRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    metaLabel: { color: '#475569', fontSize: 12, fontWeight: 600 },
    metaValue: { color: '#94a3b8', fontSize: 13 },
    docLink: { color: '#0ea5e9', textDecoration: 'none', fontSize: 13, fontWeight: 600 },
    appActions: { display: 'flex', gap: 10 },
    actionBtn: {
        flex: 1, border: 'none', borderRadius: 10, padding: '10px 16px',
        color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
        transition: 'opacity 0.2s',
    },
    // Table
    table: { background: '#1e293b', borderRadius: 16, border: '1px solid #334155', overflow: 'hidden' },
    tableHeader: {
        display: 'flex', padding: '14px 24px', borderBottom: '1px solid #334155',
        color: '#475569', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
        textTransform: 'uppercase',
    },
    tableRow: {
        display: 'flex', padding: '16px 24px', borderBottom: '1px solid #1e293b',
        alignItems: 'center', transition: 'background 0.15s',
    },
    progressBar: { height: 4, background: '#334155', borderRadius: 4, marginTop: 6, overflow: 'hidden' },
    progressFill: { height: '100%', background: 'linear-gradient(90deg, #0ea5e9, #6366f1)', borderRadius: 4, transition: 'width 0.4s' },
    // Moderation
    modGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 },
    modCard: { background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: 24 },
};

export default AdminDashboard;
