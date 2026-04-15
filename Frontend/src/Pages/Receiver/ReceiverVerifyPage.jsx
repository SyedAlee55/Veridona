import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ReceiverDrawer from '../../components/ReceiverDrawer';
import { useAccount } from 'wagmi';

const ReceiverVerifyPage = () => {
    const { api } = useAuth();
    const navigate = useNavigate();
    const { address, isConnected } = useAccount();
    const [form, setForm] = useState({ orgName: '', taxId: '', documentUrl: '' });
    const [status, setStatus] = useState(null); // 'none' | 'pending' | 'approved' | 'rejected'
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await api.get('/receiver/status');
                setStatus(res.data.status);
                if (res.data.status === 'approved') {
                    navigate('/receiver');
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchStatus();
    }, [api, navigate]);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!form.orgName || !form.taxId || !form.documentUrl) {
            setError('All fields are required.');
            return;
        }
        if (!isConnected || !address) {
            setError('Please connect your wallet first.');
            return;
        }
        setSubmitting(true);
        try {
            await api.post('/receiver/verify', { ...form, walletAddress: address });
            setSuccess('Application submitted! The admin will review your request.');
            setStatus('pending');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit application.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <ReceiverDrawer currentPage="/receiver/verify">
            <div style={styles.loading}>
                <div style={styles.spinner}></div>
                <p style={{ color: '#aaa', marginTop: 16 }}>Checking verification status…</p>
            </div>
        </ReceiverDrawer>
    );

    return (
        <ReceiverDrawer currentPage="/receiver/verify">
            <div style={styles.page}>
                <div style={styles.card}>
                    {/* Header */}
                    <div style={styles.header}>
                        <div style={styles.iconBadge}>🏛️</div>
                        <h1 style={styles.title}>Receiver Verification</h1>
                        <p style={styles.subtitle}>
                            Submit your organisation details to get whitelisted as a verified receiver.
                        </p>
                    </div>

                    {/* Status Banner */}
                    {status === 'pending' && (
                        <div style={{ ...styles.banner, background: 'linear-gradient(135deg, #f59e0b22, #f59e0b11)', border: '1px solid #f59e0b66' }}>
                            <span style={{ fontSize: 24 }}>⏳</span>
                            <div>
                                <p style={{ color: '#f59e0b', fontWeight: 700, margin: 0 }}>Verification Pending</p>
                                <p style={{ color: '#92400e', margin: 0, fontSize: 14 }}>Your application is under admin review. You'll be notified once approved.</p>
                            </div>
                        </div>
                    )}
                    {status === 'rejected' && (
                        <div style={{ ...styles.banner, background: 'linear-gradient(135deg, #ef444422, #ef444411)', border: '1px solid #ef444466' }}>
                            <span style={{ fontSize: 24 }}>❌</span>
                            <div>
                                <p style={{ color: '#ef4444', fontWeight: 700, margin: 0 }}>Application Rejected</p>
                                <p style={{ color: '#7f1d1d', margin: 0, fontSize: 14 }}>You may re-submit with updated information below.</p>
                            </div>
                        </div>
                    )}

                    {/* Form — show when none or rejected */}
                    {(status === 'none' || status === 'rejected') && (
                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.field}>
                                <label style={styles.label}>Organisation Name</label>
                                <input
                                    style={styles.input}
                                    name="orgName"
                                    placeholder="e.g. Green Earth Foundation"
                                    value={form.orgName}
                                    onChange={handleChange}
                                />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Tax ID / Registration Number</label>
                                <input
                                    style={styles.input}
                                    name="taxId"
                                    placeholder="e.g. 12-3456789"
                                    value={form.taxId}
                                    onChange={handleChange}
                                />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Supported Document URL</label>
                                <input
                                    style={styles.input}
                                    name="documentUrl"
                                    placeholder="https://drive.google.com/..."
                                    value={form.documentUrl}
                                    onChange={handleChange}
                                />
                                <span style={styles.hint}>Link to your registration certificate, tax letter, etc.</span>
                            </div>

                            <div style={styles.field}>
                                <label style={styles.label}>Receiver Wallet Address (Connected)</label>
                                <input
                                    style={{ ...styles.input, backgroundColor: '#1e293b', color: '#64748b' }}
                                    name="walletAddress"
                                    value={address || 'Wallet not connected'}
                                    readOnly
                                />
                                <span style={styles.hint}>This is the address that will be whitelisted on the blockchain.</span>
                            </div>

                            {error && <p style={styles.errorMsg}>⚠️ {error}</p>}
                            {success && <p style={styles.successMsg}>✅ {success}</p>}

                            <button type="submit" style={styles.submitBtn} disabled={submitting}>
                                {submitting ? 'Submitting…' : 'Submit Application'}
                            </button>
                        </form>
                    )}

                    {/* Info Steps */}
                    <div style={styles.steps}>
                        {[
                            { icon: '📝', label: 'Submit your details' },
                            { icon: '🔍', label: 'Admin review' },
                            { icon: '✅', label: 'Get whitelisted on-chain' },
                            { icon: '🚀', label: 'Create campaigns instantly' },
                        ].map((s, i) => (
                            <div key={i} style={styles.step}>
                                <div style={styles.stepIcon}>{s.icon}</div>
                                <span style={styles.stepLabel}>{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </ReceiverDrawer>
    );
};

const styles = {
    page: {
        minHeight: '100vh',
        background: '#0f172a',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '40px 16px',
    },
    card: {
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: 20,
        padding: '40px 36px',
        width: '100%',
        maxWidth: 600,
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
    },
    header: { textAlign: 'center', marginBottom: 32 },
    iconBadge: {
        fontSize: 48, background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
        borderRadius: '50%', width: 80, height: 80,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 16px', boxShadow: '0 8px 32px #6366f155',
    },
    title: { color: '#f1f5f9', fontSize: 28, fontWeight: 800, margin: '0 0 8px' },
    subtitle: { color: '#94a3b8', fontSize: 15, margin: 0 },
    banner: {
        display: 'flex', gap: 16, alignItems: 'flex-start',
        borderRadius: 12, padding: '16px 20px', marginBottom: 24,
    },
    form: { display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 },
    field: { display: 'flex', flexDirection: 'column', gap: 6 },
    label: { color: '#cbd5e1', fontSize: 13, fontWeight: 600, letterSpacing: '0.05em' },
    input: {
        background: '#0f172a', border: '1px solid #334155',
        borderRadius: 10, padding: '12px 16px',
        color: '#f1f5f9', fontSize: 15, outline: 'none',
        transition: 'border-color 0.2s',
    },
    hint: { color: '#475569', fontSize: 12 },
    errorMsg: { color: '#f87171', background: '#7f1d1d22', borderRadius: 8, padding: '10px 14px', margin: 0 },
    successMsg: { color: '#4ade80', background: '#14532d22', borderRadius: 8, padding: '10px 14px', margin: 0 },
    submitBtn: {
        background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
        color: '#fff', border: 'none', borderRadius: 12,
        padding: '14px 28px', fontSize: 16, fontWeight: 700,
        cursor: 'pointer', transition: 'opacity 0.2s',
        boxShadow: '0 8px 24px #6366f144',
    },
    steps: {
        display: 'flex', justifyContent: 'space-between',
        borderTop: '1px solid #334155', paddingTop: 24, gap: 8,
    },
    step: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 },
    stepIcon: {
        fontSize: 24, background: '#0f172a',
        borderRadius: '50%', width: 48, height: 48,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid #334155',
    },
    stepLabel: { color: '#64748b', fontSize: 11, textAlign: 'center', fontWeight: 500 },
    loading: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' },
    spinner: {
        width: 40, height: 40, border: '3px solid #334155',
        borderTop: '3px solid #0ea5e9', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    },
};

export default ReceiverVerifyPage;
