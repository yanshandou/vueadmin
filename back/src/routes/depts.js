/**
 * 菜单管理模块
 * @date 2023年7月30日
 * @author XuJunhao
 */
const router = require("koa-router")();
const util = require("../utils/util");
const { addDept, updateDept, deleteDept, getDeptList } = require("../controller/depts");
// 引入md5
const md5 = require("md5");
// 引入jwt
const jwt = require("jsonwebtoken");
router.prefix("/dept");
// 菜单编辑、删除、新增功能
router.post("/operate", async (ctx) => {
	const { _id, action, ...params } = ctx.request.body;
	try {
		switch (action) {
			case "add":
				const addResult = await addDept(params);
				if (addResult) {
					ctx.body = util.success({}, "菜单创建成功");
				} else {
					ctx.body = util.fail("菜单添加失败");
				}
				break;
			case "edit":
				const editResult = await updateDept(_id, params);
				if (editResult) {
					ctx.body = util.success({}, "菜单修改成功");
				} else {
					ctx.body = util.fail("菜单编辑失败");
				}
				break;
			case "delete":
				const deleteResult = await deleteDept(_id);
				if (deleteResult) {
					ctx.body = util.success({}, "菜单删除成功");
				} else {
					ctx.body = util.fail("菜单删除失败");
				}
				break;
		}
	} catch (error) {
		console.log("发生了错误");
		// 如果上述过程出现问题, 返回错误信息
		console.log(JSON.stringify(error));
		ctx.body = util.fail(error.msg);
	}
});
// 菜单列表查询
router.get("/list", async (ctx) => {
	// 获取查询参数
	const { deptName } = ctx.request.query;
	// 定义查询条件
	const params = {};
	// 如果菜单名称存在, 则查询条件中加入菜单名称
	if (deptName) {
		params.deptName = deptName;
	}
	let rootList = (await getDeptList(params)) || [];
	let permissionList = [];
	if (deptName) {
		permissionList = rootList;
	} else {
		permissionList = util.getTreeDept(rootList, null, []);
	}
	ctx.body = util.success(permissionList);
});
module.exports = router;
