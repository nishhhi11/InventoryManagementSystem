function ActivityLog() {
    return (
        <div className="page">
            <div className="topbar">
                <div>
                    <p className="eyebrow">SECURITY</p>
                    <h1>Activity Log</h1>
                </div>
            </div>

            <section className="panel">
                <div className="empty-state">
                    <h3>Activity tracking is active</h3>

                    <p>
                        Inventory actions are being recorded by the backend.
                        The activity viewer will be connected to its API
                        endpoint once exposed.
                    </p>
                </div>
            </section>
        </div>
    );
}

export default ActivityLog;
