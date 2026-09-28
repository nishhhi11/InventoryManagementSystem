import { useEffect, useState } from "react";
import { getStockMovements } from "../services/api";
import { History, ArrowUpRight, ArrowDownRight, Package } from "lucide-react";

function StockHistory() {
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMovements = async () => {
            try {
                setLoading(true);
                const data = await getStockMovements();
                setMovements(data);
            } catch (err) {
                setError("Failed to load stock history.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchMovements();
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

    return (
        <div className="page" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text-color, #dffafa)' }}>Stock History</h1>
                <p style={{ margin: 0, color: 'var(--text-muted, #769293)', fontSize: '14px' }}>Track recent inventory adjustments and movements</p>
            </div>

            {error && (
                <div style={{ backgroundColor: 'rgba(255, 107, 107, 0.1)', border: '1px solid rgba(255, 107, 107, 0.2)', color: '#ff6b6b', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' }}>
                    {error}
                </div>
            )}

            <section className="dashboard-section" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted, #769293)' }}>
                        Loading history...
                    </div>
                ) : movements.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--text-muted)' }}>
                            <History size={24} />
                        </div>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600, color: 'var(--text-color, #dffafa)' }}>No activity yet</h3>
                        <p style={{ margin: 0, color: 'var(--text-muted, #769293)', fontSize: '14px' }}>Stock movements will appear here when inventory is updated.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(93, 224, 212, 0.1)' }}>
                                    <th style={{ padding: '16px 24px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted, #769293)', fontWeight: 600 }}>Product</th>
                                    <th style={{ padding: '16px 24px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted, #769293)', fontWeight: 600, textAlign: 'right' }}>Change</th>
                                    <th style={{ padding: '16px 24px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted, #769293)', fontWeight: 600 }}>Reason</th>
                                    <th style={{ padding: '16px 24px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted, #769293)', fontWeight: 600 }}>Performed By</th>
                                    <th style={{ padding: '16px 24px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted, #769293)', fontWeight: 600, textAlign: 'right' }}>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {movements.map((movement) => {
                                    const isPositive = movement.quantityChanged > 0;
                                    return (
                                        <tr key={movement._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background-color 0.2s', ':hover': { backgroundColor: 'rgba(255,255,255,0.01)' } }}>
                                            <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text-color, #dffafa)', fontWeight: 500 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '6px', color: 'var(--text-muted, #769293)' }}>
                                                        <Package size={16} />
                                                    </div>
                                                    <div>
                                                        <div>{movement.product?.name || 'Unknown Product'}</div>
                                                        {movement.product?.sku && <div style={{ fontSize: '12px', color: 'var(--text-muted, #769293)', marginTop: '2px' }}>{movement.product.sku}</div>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, textAlign: 'right', color: isPositive ? 'var(--primary-light, #5de0d4)' : '#ff6b6b' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                                                    {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                                    {isPositive ? '+' : ''}{movement.quantityChanged}
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text-color, #dffafa)' }}>
                                                <span style={{ 
                                                    padding: '4px 10px', 
                                                    borderRadius: '4px', 
                                                    fontSize: '12px', 
                                                    fontWeight: 500,
                                                    backgroundColor: 'rgba(255,255,255,0.04)',
                                                    border: '1px solid rgba(255,255,255,0.05)'
                                                }}>
                                                    {movement.reason}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text-muted, #769293)' }}>
                                                <div>{movement.performedBy?.name || 'System'}</div>
                                            </td>
                                            <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-muted, #769293)', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                                {formatDate(movement.createdAt)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

export default StockHistory;