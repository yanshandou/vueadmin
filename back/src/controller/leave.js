// 引入数据库模型
const Leave = require("../model/Leave");

// 获取部门列表
async function getLeaveList(params, skipIndex, page) {
	try {
		const query = Leave.find(params);
		const list = await query.skip(skipIndex).limit(page.pageSize);
		const total = await Leave.countDocuments(params);
		return { list, total };
	} catch (error) {
		console.log(JSON.stringify(error));
	}
}
async function countLeaveNumber() {
	return await Leave.countDocuments();
}
async function addLeave(params) {
	return await Leave.create(params);
}
async function deleteLeave(_id) {
	return await Leave.findByIdAndUpdate(_id, { applyState: 5 }, { new: true });
}

async function updateLeave(_id, params) {
	return await Leave.findByIdAndUpdate(_id, params);
}

async function findLeave(_id) {
	return await Leave.findById(_id);
}

async function getLeaveCount(params) {
	return await Leave.countDocuments(params);
}
// 导出
module.exports = {
	getLeaveList,
	countLeaveNumber,
	addLeave,
	deleteLeave,
	findLeave,
	updateLeave,
	getLeaveCount,
};
