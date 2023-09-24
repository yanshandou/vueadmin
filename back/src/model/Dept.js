const mongoose = require("../db/db");
const DeptSchema = mongoose.Schema({
	deptName: String, // 部门名称
	userId: String, // 管理员id
	userName: String, // 用户名
	userEmail: String, // 用户邮箱
	parentId: [mongoose.Types.ObjectId], // 父级id
	updateTime: {
		type: Date,
		default: Date.now(),
	},
	createTime: {
		type: Date,
		default: Date.now(),
	},
});
// 定义模型, 不用写复数
const Dept = mongoose.model("dept", DeptSchema);
// 输出模型
module.exports = Dept;
