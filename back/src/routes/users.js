/**
 * 用户管理模块
 * @date 2022年10月12日16:01:54
 * @author XuJunhao
 */
const router = require("koa-router")();
const {
	login,
	userList,
	userDelete,
	userUnique,
	userAdd,
	getUserSequenceId,
	userEdit,
	getAllUsers,
	getUserMenuList,
} = require("../controller/users");
const util = require("../utils/util");
// 引入md5
const md5 = require("md5");
// 引入jwt
const jwt = require("jsonwebtoken");
router.prefix("/users");
// 登录, post请求, 传递用户名和密码  /users/login
router.post("/login", async (ctx) => {
	try {
		// 从请求体中获取用户名和密码, 使用解构赋值
		const { userName, userPassword } = ctx.request.body;
		// 对密码进行md5加密
		const userMd5Password = md5(userPassword);
		// 验证登录, 交给controller
		let result = await login(userName, userMd5Password);
		// 判断结果, 如果找到了, 返回正确信息, 如果没找到, 提示错误
		if (result) {
			// 删除userPassword, 调用toObject()方法
			result = result.toObject();
			delete result.userPassword;
			// 生成token, 使用jwt.sign()方法, 传递三个参数, 第一个参数是payload, 第二个参数是密钥, 第三个参数是过期时间
			const token = jwt.sign(
				{
					data: result,
				},
				"wangshidai",
				{
					expiresIn: "10h",
				}
			);
			result.token = token;
			ctx.body = util.success(result);
		} else {
			ctx.body = util.fail("账号或密码不正确");
		}
	} catch (error) {
		// 如果上述过程出现问题, 返回错误信息
		ctx.body = util.fail(error.msg);
	}
});

// 获取用户列表
router.get("/list", async (ctx) => {
	// 进行查询, 整个放到try catch里面
	try {
		// 拼接参数
		// 从前端的请求中获取 userId, userName, state
		const { userId, userName, state } = ctx.request.query;
		// 从前端的请求中, 计算并返回pager和skipIndex
		const { page, skipIndex } = util.pager(ctx.request.query);
		// 定义查询数据库的参数, 就是请求条件
		let userParams = {}; // 查询用户的参数
		let pageParams = {}; // 分页的参数
		// 拼接参数
		pageParams.page = page;
		pageParams.skipIndex = skipIndex;
		// 如果有userId, 带上
		if (userId) {
			userParams.userId = userId;
		}
		// 如果有userName, 带上
		if (userName) {
			userParams.userName = userName;
		}
		// 如果有用户状态, 并且用户状态不等0, 如果是0, 意味着"所有", 全查, 不用搜索
		if (state && state != "0") {
			userParams.state = state;
		}
		// 请求数据
		const result = await userList(userParams, pageParams);
		// 返回数据
		if (result) {
			// 成功返回数据
			ctx.body = util.success({
				// 注意需要展开
				...result,
			});
		} else {
			// 失败提醒
			ctx.body = util.fail("查询不到符合条件的用户");
		}
	} catch (error) {
		ctx.body = util.fail("查询异常" + error);
	}
});

// 用户删除/批量删除
router.post("/delete", async (ctx) => {
	try {
		// 待删除的用户Id数组
		const { userIds } = ctx.request.body;
		// 批量删除, 逻辑删除, 就是批量更新
		const result = await userDelete(userIds);
		// 判断删除条数, 如果有数字, 说明删除成功, 如果没有数字, 说明删除失败
		if (result) {
			ctx.body = util.success({ nModified: result }, `共删除成功${result}条`);
		} else {
			ctx.body = util.fail("删除失败");
		}
	} catch (error) {
		ctx.body = util.fail("删除操作异常" + error);
	}
});

// 用户新增/编辑, 走 operate, 操作接口
router.post("/operate", async (ctx) => {
	// 从请求体中获取所有参数, 再进行参数的验证
	const { userId, userName, userEmail, mobile, job, state, roleList, deptId, action } = ctx.request.body;
	// 判断是新增还是便捷
	if (action === "add") {
		// 如果没有userName, userEmail, deptId, 说明参数有误, 不过一般不会发生, 因为有前端的表单校验
		if (!userName || !userEmail || !deptId) {
			// 如果没有, 提示参数错误
			ctx.body = util.fail("参数错误", util.CODE.PARAM_ERROR);
			return;
		}
		// 查询 userName, userEmail, 返回 _id, userName, userEmail 字段
		const res = await userUnique(userName, userEmail);

		if (res != null) {
			// 如果查到了, 应该返回错误
			ctx.body = util.fail(`系统监测到有重复的用户，信息如下：${res.userName} - ${res.userEmail}`);
			return;
		}
		// 没有问题, 就创建用户
		// 如果没有查到, 可以走下面的操作, 首先从自增表中, 拿到最新的id
		const sequenceId = await getUserSequenceId();
		try {
			// 创建对象, 密码使用md5加密
			const userParams = {
				userId: sequenceId,
				userName,
				userPassword: md5("123456"),
				userEmail,
				role: 1, //默认普通用户
				roleList,
				job,
				state,
				deptId,
				mobile,
			};
			const userAddResult = await userAdd(userParams);
			if (userAddResult) {
				// 返回成功信息
				ctx.body = util.success({ userId: userAddResult.userId }, "用户创建成功");
			} else {
				ctx.body = util.fail("用户创建失败");
			}
		} catch (error) {
			// 如果错误, 返回失败
			ctx.body = util.fail(JSON.stringify(error));
		}
	}
	if (action === "edit") {
		// 如果是编辑, 如果部门id没有, 提示用户部门不能为空
		if (!deptId) {
			ctx.body = util.fail("部门不能为空", util.CODE.PARAM_ERROR);
			return;
		}
		// 如果没问题, 进行更新
		const editParams = { mobile, job, state, roleList, deptId };
		// 通过查询userId, 更新手机号, 职位, 状态,
		const res = await userEdit(userId, editParams);
		// 提示更新成功
		if (res) {
			ctx.body = util.success({ userId: res.userId }, "更新成功");
		} else {
			ctx.body = util.fail("更新失败");
		}
	}
});
// 获取全量用户列表
router.get("/all/list", async (ctx) => {
	try {
		const list = await getAllUsers();
		ctx.body = util.success(list);
	} catch (error) {
		ctx.body = util.fail(error.stack);
	}
});

// 获取用户对应的权限菜单
router.get("/getPermissionList", async (ctx) => {
	try {
		// 获取请求头中的token
		let authorization = ctx.request.headers.authorization;
		// 解密token, 获取用户信息
		let { data } = util.decoded(authorization);
		if (!data) {
			util.fail("token验证失败");
			return;
		}
		// 获取用户对应的菜单
		let menuList = await getUserMenuList(data.role, data.roleList);
		// 获取用户对应的操作权限
		let actionList = util.getAction(JSON.parse(JSON.stringify(menuList)));
		// 返回数据
		ctx.body = util.success({ menuList, actionList });
	} catch (error) {
		console.log(JSON.stringify(error));
	}
});
module.exports = router;
