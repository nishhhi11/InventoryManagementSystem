function StatCard({ value, label, icon, colorClass = "", trend, trendUp }) {
    return (
        <div className={`stat-card ${colorClass}`}>
            <div className="stat-card-icon">{icon}</div>
            <div className="stat-card-info">
                <span className="stat-card-label">{label}</span>
                <strong className="stat-card-value">{value}</strong>
                {trend && (
                    <div className="stat-card-trend">
                        <span className="trend-text">vs Last Month</span>
                        <span className={`trend-badge ${trendUp ? "up" : "down"}`}>
                            {trendUp ? "▲" : "▼"} {trend}%
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default StatCard;