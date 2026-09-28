import { useEffect, useState } from "react";
import { getActivityLogs } from "../services/api";
import { Activity, User, Box, Tag, AlertCircle } from "lucide-react";

function ActivityLog() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setLoading(true);
                const data = await getActivityLogs();
                setLogs(data);
            } catch (err) {
                setError("Failed to load activity log.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-GB', { 
            day: 'numeric', 
            month: 'short', 
            hour: '2-digit', 
            minute: '2-digit'
        });
    };

    const getEntityIcon = (entity) => {
        switch(entity) {
            case 'Product': return <Box size={16} />;
            case 'Category': return <Tag size={16} />;
            case 'Stock': return <Activity size={16} />;
            case 'User': return <User size={16} />;
            default: return <Activity size={16} />;
        }
    };

    return (
        <div className="page" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text-color, #dffafa)' }}>Activity Log</h1>
                <p style={{ margin: 0, color: 'var(--text-muted, #769293)', fontSize: '14px' }}>Monitor security and system-wide actions</p>
            </div>

            {error && (
                <div style={{ backgroundColor: 'rgba(255, 107, 107, 0.1)', border: '1px solid rgba(255, 107, 107, 0.2)', color: '#ff6b6b', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' }}>
                    {error}
                </div>
            )}

            <section className="dashboard-section" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted, #769293)' }}>
                        Loading activity...
                    </div>
                ) : logs.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--text-muted)' }}>
                            <Activity size={24} />
                        </div>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600, color: 'var(--text-color, #dffafa)' }}>No activity yet</h3>
                        <p style={{ margin: 0, color: 'var(--text-muted, #769293)', fontSize: '14px' }}>System actions will be recorded here.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(93, 224, 212, 0.1)' }}>
                                    <th style={{ padding: '16px 24px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted, #769293)', fontWeight: 600 }}>Action</th>
                                    <th style={{ padding: '16px 24px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted, #769293)', fontWeight: 600 }}>Details</th>
                                    <th style={{ padding: '16px 24px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted, #769293)', fontWeight: 600 }}>Performed By</th>
                                    <th style={{ padding: '16px 24px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted, #769293)', fontWeight: 600, textAlign: 'right' }}>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background-color 0.2s', ':hover': { backgroundColor: 'rgba(255,255,255,0.01)' } }}>
                                        <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text-color, #dffafa)', fontWeight: 500 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '6px', color: 'var(--primary-light, #5de0d4)' }}>
                                                    {getEntityIcon(log.entity)}
                                                </div>
                                                <div>
                                                    <div>{log.action}</div>
                                                    <div style={{ fontSize: '12px', color: 'var(--text-muted, #769293)', marginTop: '2px', textTransform: 'uppercase' }}>{log.entity}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text-color, #dffafa)' }}>
                                            <div style={{ maxWidth: '400px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-muted, #769293)' }} title={log.details}>
                                                {log.details || "-"}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text-color, #dffafa)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(93, 224, 212, 0.2)', color: 'var(--primary-light, #5de0d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                                                    {log.user?.name ? log.user.name.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                                <div>
                                                    <div>{log.user?.name || 'Unknown User'}</div>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-muted, #769293)' }}>{log.user?.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-muted, #769293)', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                            {formatDate(log.createdAt)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

export default ActivityLog;