const mongoose = require("../db/db");
const LeaveSchema = mongoose.Schema({
	orderNo: String,
	applyType: Number,
	startTime: { type: Date, default: Date.now },
	endTime: { type: Date, default: Date.now },
	applyUser: {
		userId: String,
		userName: String,
		userEmail: String,
	},
	leaveTime: String,
	reasons: String,
	auditUsers: String,
	curAuditUserName: String,
	auditFlows: [
		{
			userId: String,
			userName: String,
			userEmail: String,
		},
	],
	auditLogs: [
		{
			userId: String,
			userName: String,
			createTime: Date,
			remark: String,
			action: String,
		},
	],
	applyState: { type: Number, default: 1 },
	createTime: { type: Date, default: Date.now },
});
// 定义模型, 不用写复数
const Leave = mongoose.model("leave", LeaveSchema);
// 输出模型
module.exports = Leave;
