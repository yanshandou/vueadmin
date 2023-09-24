const router = require("koa-router")();
const util = require("../utils/util");
// 引入md5
const md5 = require("md5");
const {
	getRoleAllList,
	getRoleList,
	createRole,
	editRole,
	deleteRole,
	updatePermission,
} = require("../controller/roles");
// 引入jwt
const jwt = require("jsonwebtoken");
router.prefix("/role");
// 查询所有角色名称列表
router.get("/allList", async (ctx) => {
	try {
		const list = await getRoleAllList();
		ctx.body = util.success(list);
	} catch (error) {
		ctx.body = util.fail(`查询失败:${error.stack}`);
	}
});
// 按页获取角色列表
router.get("/list", async (ctx) => {
	// 获取前端传递的参数, 角色名称, 页码, 页数
	const { roleName } = ctx.request.query;
	const { page, skipIndex } = util.pager(ctx.request.query);
	try {
		let params = {};
		if (roleName) {
			params.roleName = roleName;
		}
		const { list, total } = await getRoleList(params, page, skipIndex);
		ctx.body = util.success({
			list,
			page: {
				...page,
				total,
			},
		});
	} catch (error) {
		ctx.body = util.fail(`查询失败：${error.stack}`);
	}
});
// 角色操作：创建、编辑和删除
router.post("/operate", async (ctx) => {
	// 获取前端传递的参数, 角色名称, 备注, 操作类型
	const { _id, roleName, remark, action } = ctx.request.body;
	try {
		switch (action) {
			case "add":
				const res = createRole(roleName, remark);
				const info = "创建成功";
				ctx.body = util.success(res, info);
				break;
			case "edit":
				if (_id) {
					const res = editRole(_id, roleName, remark);
					const info = "编辑成功";
					ctx.body = util.success(res, info);
				} else {
					ctx.body = util.fail("缺少参数params: _id");
					return;
				}
				break;
			case "delete":
				if (_id) {
					const res = deleteRole(_id);
					const info = "删除成功";
					ctx.body = util.success(res, info);
				} else {
					ctx.body = util.fail("缺少参数params: _id");
					return;
				}
				break;
		}
	} catch (error) {
		ctx.body = util.fail(error.stack);
	}
});

// 设置角色权限
router.post("/update/permission", async (ctx) => {
	// 获取前端传递的参数, 角色id, 权限列表
	const { _id, permissionList } = ctx.request.body;
	try {
		let res = updatePermission(_id, permissionList);
		ctx.body = util.success("", "权限设置成功");
	} catch (error) {
		ctx.body = util.fail("权限设置失败");
	}
});

// 导出路由
module.exports = router;
