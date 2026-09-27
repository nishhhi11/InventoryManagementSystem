const StatCard = ({
    title,
    value,
    subtitle,
    icon,
    danger = false
}) => {
    return (
        <div className={`stat-card ${danger ? "danger" : ""}`}>
            <div className="stat-card-top">
                <div className="stat-icon">{icon}</div>

                {danger && (
                    <span className="status-pill">
                        Attention
                    </span>
                )}
            </div>

            <div className="stat-value">{value}</div>

            <div className="stat-title">{title}</div>

            {subtitle && (
                <div className="stat-subtitle">
                    {subtitle}
                </div>
            )}
        </div>
    );
};

export default StatCard;
