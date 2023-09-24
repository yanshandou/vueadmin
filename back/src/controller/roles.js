// 引入数据库模型
const Role = require("../model/Role");
// 查询角色名称列表
async function getRoleAllList() {
	const list = await Role.find({}, "_id roleName");
	return list;
}

// 查询角色列表
async function getRoleList(params, page, skipIndex) {
	const query = Role.find(params);
	const list = await query.skip(skipIndex).limit(page.pageSize);
	const total = await Role.countDocuments(params);
	return { list, total };
}

// 创建角色
async function createRole(roleName, remark) {
	const res = await Role.create({ roleName, remark });
	return res;
}
// 编辑角色
async function editRole(_id, roleName, remark) {
	let params = { roleName, remark };
	params.update = new Date();
	const res = await Role.findByIdAndUpdate(_id, params);
	return res;
}

// 删除角色
async function deleteRole(_id) {
	const res = await Role.findByIdAndRemove(_id);
	return res;
}

// 设置角色权限
async function updatePermission(_id, permissionList) {
	let params = { permissionList, update: new Date() };
	let res = await Role.findByIdAndUpdate(_id, params);
	return res;
}

// 导出
module.exports = {
	getRoleAllList,
	getRoleList,
	createRole,
	editRole,
	deleteRole,
	updatePermission,
};
