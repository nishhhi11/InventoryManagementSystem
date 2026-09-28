function StockHistory() {
    return (
        <div className="page">
            <div className="topbar">
                <div>
                    <p className="eyebrow">INVENTORY</p>
                    <h1>Stock History</h1>
                </div>
            </div>

            <section className="panel">
                <div className="empty-state">
                    <h3>Stock movement tracking is active</h3>

                    <p>
                        Every stock update is being recorded in MongoDB.
                        The history viewer will use the stock movement API.
                    </p>
                </div>
            </section>
        </div>
    );
}

export default StockHistory;
