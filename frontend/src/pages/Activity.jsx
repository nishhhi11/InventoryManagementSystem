const Activity = () => {
    return (
        <div className="page">
            <div className="page-heading">
                <div>
                    <p className="eyebrow">
                        System monitoring
                    </p>
                    <h2>Activity Log</h2>
                    <p>
                        Keep an audit trail of important inventory
                        actions.
                    </p>
                </div>
            </div>

            <div className="panel empty-feature">
                <div className="feature-icon">◷</div>

                <h3>Audit activity</h3>

                <p>
                    Your backend is already creating activity log
                    records whenever stock is changed.
                </p>

                <div className="activity-preview">
                    <div>
                        <span>Action</span>
                        <strong>Updated stock</strong>
                    </div>

                    <div>
                        <span>Entity</span>
                        <strong>Stock</strong>
                    </div>

                    <div>
                        <span>Details</span>
                        <strong>
                            Stock change with reason
                        </strong>
                    </div>
                </div>

                <div className="feature-note">
                    The activity feed will become live after a
                    GET activity-log endpoint is added to the
                    backend.
                </div>
            </div>
        </div>
    );
};

export default Activity;
