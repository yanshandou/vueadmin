/**
 * 部门集合, 控制器
 * @date 2023年7月30日14:17:05
 * @author XuJunhao
 */
// 引入数据库模型
const Dept = require("../model/Dept");
// 新增部门
async function addDept(params) {
	try {
		const dept = await Dept.create(params);
		return dept;
	} catch (error) {
		console.log(JSON.stringify(error));
	}
}
// 更新部门
async function updateDept(_id, params) {
	try {
		params.updateTime = new Date();
		res = await Dept.findByIdAndUpdate(_id, params, { new: true });
		return res;
	} catch (error) {
		console.log(JSON.stringify(error));
	}
}
// 删除部门
async function deleteDept(_id) {
	try {
		// 根据id删除一条
		await Dept.findByIdAndRemove(_id);
		// 根据parentId删除多条
		await Dept.deleteMany({ parentId: { $all: [_id] } });
		return true;
	} catch (error) {
		console.log("error....");
		console.log(JSON.stringify(error));
		return false;
	}
}

// 获取部门列表
async function getDeptList(params) {
	try {
		const deptList = await Dept.find(params);
		return deptList;
	} catch (error) {
		console.log(JSON.stringify(error));
	}
}
async function findUserListFromDept() {
	return await Dept.find({ deptName: { $in: ["人事部", "财务部"] } });
}
async function findDeptById(_id) {
	return await Dept.findById(_id);
}
// 导出
module.exports = {
	addDept,
	updateDept,
	deleteDept,
	getDeptList,
	findUserListFromDept,
	findDeptById
};
