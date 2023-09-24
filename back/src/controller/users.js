/**
 * 用户集合, 控制器
 * @date 2022年10月13日15:12:21
 * @author XuJunhao
 */
// 引入数据库模型
const User = require("../model/User");
const Menu = require("../model/Menu");
const Role = require("../model/Role");
const Counter = require("../model/Counter");
const util = require("../utils/util");
// 登录
async function login(userName, userPassword) {
	try {
		// 从数据库中查找
		// findOne()方法, 查找一个, 返回一个对象, 形参是一个对象, 里面是查找条件
		const user = await User.findOne({ userName, userPassword });
		// 是否找到
		if (user != null) {
			return user;
		} else {
			return false;
		}
	} catch (error) {
		console.log(JSON.stringify(error));
	}
}

// 查询用户列表
async function userList(userParams, pageParams) {
	const { page, skipIndex } = pageParams;
	// 根据条件查询所有用户列表
	// find 通过条件查询, 第二个参数代表不查询_id和userPassword
	// 如果有skipIndex和page, 可以跳转查询, 可以返回分页的数据
	const list = await User.find(userParams, { _id: 0, userPassword: 0 })
		.skip(skipIndex)
		.limit(page.pageSize)
		.sort({ createTime: -1 });
	// countDocuments 查询总共有多少条数据
	const total = await User.countDocuments(userParams);
	// 返回数据
	if (list != undefined && total != undefined) {
		return {
			page: {
				...page,
				total,
			},
			list,
		};
	} else {
		return false;
	}
}

// 删除用户列表
async function userDelete(userIds) {
	// 逻辑删除, 就是批量更新, state = 2, 意味着离职状态
	const result = await User.updateMany({ userId: { $in: userIds } }, { state: 2 });
	// 判断更新的条数
	if (result.modifiedCount) {
		const deleteNumber = result.modifiedCount;
		return deleteNumber;
	} else {
		return false;
	}
}

// 用户查重
async function userUnique(userName, userEmail) {
	const res = await User.findOne({ $or: [{ userName }, { userEmail }] }, "_id userName userEmail");
	return res;
}

// 获取自增的id
async function getUserSequenceId() {
	try {
		const userId = await Counter.findOneAndUpdate({ _id: "userId" }, { $inc: { sequence_value: 1 } }, { new: true });
		return userId ? userId.sequence_value : false;
	} catch (error) {
		console.log(JSON.stringify(error));
	}
}

// 新增用户
async function userAdd(params) {
	try {
		const user = new User(params);
		// 用户保存, 就是新增的效果
		const userInfo = await user.save();
		return userInfo ? userInfo : false;
	} catch (error) {
		console.log(JSON.stringify(error));
	}
}

// 编辑用户
async function userEdit(userId, params) {
	// 找到一个数据, 并且更新, 返回最新的数据
	const result = await User.findOneAndUpdate({ userId }, params, { new: true });
	// 判断更新结果
	return result ? result : false;
}

// 查询所有用户
async function getAllUsers() {
	const users = await User.find({}, "userId userName userEmail");
	return users ? users : false;
}

// 获取菜单列表
async function getUserMenuList(userRole, roleKeys) {
	try {
		let rootList = [];
		if (userRole == 0) {
			rootList = (await Menu.find({})) || [];
		} else {
			// 根据用户拥有的角色，获取权限列表
			// 现查找用户对应的角色有哪些
			let roleList = await Role.find({ _id: { $in: roleKeys } });
			let permissionList = [];
			roleList.map((role) => {
				let { checkedKeys, halfCheckedKeys } = role.permissionList;
				permissionList = permissionList.concat([...checkedKeys, ...halfCheckedKeys]);
			});
			// 去重, 如果两个角色的权限有重复, 那么就去重
			permissionList = [...new Set(permissionList)];
			rootList = await Menu.find({ _id: { $in: permissionList } });
		}
		return util.getTreeMenu(rootList, null, []);
	} catch (error) {
		console.log(JSON.stringify(error));
	}
}

// 导出
module.exports = {
	login,
	userList,
	userDelete,
	userUnique,
	getUserSequenceId,
	userAdd,
	userEdit,
	getAllUsers,
	getUserMenuList,
};
