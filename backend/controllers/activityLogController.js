const ActivityLog = require("../models/ActivityLog");

const getActivityLogs = async (req, res, next) => {
    try {
        const logs = await ActivityLog.find()
            .populate("user", "name email role")
            .sort({ createdAt: -1 })
            .limit(20);

        res.json(logs);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getActivityLogs
};
