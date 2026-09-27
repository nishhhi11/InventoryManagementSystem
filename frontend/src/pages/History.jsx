const History = () => {
    return (
        <div className="page">
            <div className="page-heading">
                <div>
                    <p className="eyebrow">
                        Inventory tracking
                    </p>
                    <h2>Stock History</h2>
                    <p>
                        Track every stock adjustment made in the
                        system.
                    </p>
                </div>
            </div>

            <div className="panel empty-feature">
                <div className="feature-icon">↕</div>

                <h3>Stock movement history</h3>

                <p>
                    The backend already records stock movements
                    with previous quantity, new quantity, change,
                    reason and user information.
                </p>

                <div className="feature-tags">
                    <span>Previous Stock</span>
                    <span>New Stock</span>
                    <span>Quantity Changed</span>
                    <span>Reason</span>
                    <span>Performed By</span>
                    <span>Timestamp</span>
                </div>

                <div className="feature-note">
                    History display will connect once the
                    stock-movement GET endpoint is added to the
                    backend.
                </div>
            </div>
        </div>
    );
};

export default History;
