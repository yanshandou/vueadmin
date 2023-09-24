/**
 * 部门管理模块
 * @date 2023年7月30日
 * @author XuJunhao
 */
const router = require("koa-router")();
const util = require("../utils/util");
const { addMenu, updateMenu, deleteMenu, getMenuList } = require("../controller/menus");
// 引入md5
const md5 = require("md5");
// 引入jwt
const jwt = require("jsonwebtoken");
router.prefix("/menu");
// 部门编辑、删除、新增功能
router.post("/operate", async (ctx) => {
	const { _id, action, ...params } = ctx.request.body;
	try {
		switch (action) {
			case "add":
				const addResult = await addMenu(params);
				if (addResult) {
					ctx.body = util.success({}, "部门创建成功");
				} else {
					ctx.body = util.fail("部门添加失败");
				}
				break;
			case "edit":
				const editResult = await updateMenu(_id, params);
				if (editResult) {
					ctx.body = util.success({}, "部门修改成功");
				} else {
					ctx.body = util.fail("部门编辑失败");
				}
				break;
			case "delete":
				const deleteResult = await deleteMenu(_id);
				if (deleteResult) {
					ctx.body = util.success({}, "部门删除成功");
				} else {
					ctx.body = util.fail("部门删除失败");
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
// 部门列表查询
router.get("/list", async (ctx) => {
	// 获取查询参数, 部门名称和部门状态
	const { menuName, menuState } = ctx.request.query;
	// 定义查询条件
	const params = {};
	// 如果部门名称存在, 则查询条件中加入部门名称
	if (menuName) {
		params.menuName = menuName;
	}
	// 如果部门状态存在, 则查询条件中加入部门状态
	if (menuState) {
		params.menuState = menuState;
	}
	let rootList = (await getMenuList(params)) || [];
	let permissionList = [];
	if (menuName) {
		permissionList = rootList;
	} else {
		permissionList = util.getTreeMenu(rootList, null, []);
	}
	ctx.body = util.success(permissionList);
});
module.exports = router;
