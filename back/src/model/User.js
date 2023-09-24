/**
 * 用户集合的数据模型, 包含数据规范
 * @date 2022年10月12日16:06:43
 * @author XuJunhao
 */
// 导入
const mongoose = require("../db/db");
// 配置字段的格式
const UserSchema = mongoose.Schema(
	{
		userId: {
			type: Number, // 类型
			required: true, // 必填
			unique: true, // 唯一, 不可重复
		}, // 用户ID，自增长
		userName: {
			type: String, // 类型
			required: true, // 必填
			unique: true, // 唯一, 不可重复
		}, // 用户名称
		userPassword: {
			type: String, // 类型
			required: true, // 必填
		}, // 用户密码，md5加密
		userEmail: String, // 用户邮箱
		mobile: String, // 手机号
		sex: Number, // 性别 0:男  1：女
		deptId: [], // 部门
		job: String, // 岗位
		state: {
			type: Number, // 类型
			default: 1, // 默认值
		}, // 1: 在职 2: 离职 3: 试用期
		role: {
			type: Number, // 类型
			default: 1, // 默认值
		}, // 用户角色 0：系统管理员  1： 普通用户
		roleList: [], //系统角色
		createTime: {
			type: Date, // 类型
			default: Date.now(), // 默认值
		}, // 创建时间
		lastLoginTime: {
			type: Date, // 类型
			default: Date.now(), // 默认值
		}, // 最后登录时间
	},
	{
		timestamps: true, // 时间戳 会自动生成创建时间和更新时间 
		versionKey: false, // 清除版本信息 __v
	}
);
// 定义模型, 不用写复数
const User = mongoose.model("user", UserSchema);
// 输出模型
module.exports = User;
