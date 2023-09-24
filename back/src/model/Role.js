const mongoose = require("../db/db");
const RoleSchema = mongoose.Schema({
	roleName: String, // 角色名称
	remark: String, // 备注
	// 权限列表
	permissionList: {
		checkedKeys: [],
		halfCheckedKeys: [],
	},
	// 更新时间
	updateTime: {
		type: Date,
		default: Date.now(),
	},
	// 创建时间
	createTime: {
		type: Date,
		default: Date.now(),
	},
});

// 定义模型, 不用写复数
const Role = mongoose.model("role", RoleSchema);
// 输出模型
module.exports = Role;
