const router = require("koa-router")();
const util = require("../utils/util");
// 导入jwt
const jwt = require("jsonwebtoken");
const {
	getLeaveList,
	countLeaveNumber,
	addLeave,
	deleteLeave,
	findLeave,
	updateLeave,
	getLeaveCount,
} = require("../controller/leave");
const { findUserListFromDept, findDeptById } = require("../controller/depts");
router.prefix("/leave");

// 查询申请列表
router.get("/list", async (ctx) => {
	const { applyState, type } = ctx.request.query;
	const { page, skipIndex } = util.pager(ctx.request.query);
	let authorization = ctx.request.headers.authorization;
	let { data } = util.decoded(authorization);
	try {
		let params = {};
		if (type === "approve") {
			if (applyState == 1 || applyState == 2) {
				params.curAuditUserName = data.userName;
				params.$or = [{ applyState: 1 }, { applyState: 2 }];
			} else if (applyState > 2) {
				params = { "auditFlows.userId": data.userId, applyState };
			} else {
				params = { "auditFlows.userId": data.userId };
			}
		} else {
			params = {
				"applyUser.userId": data.userId,
			};
			if (applyState) {
				params.applyState = applyState;
			}
		}
		const { list, total } = await getLeaveList(params, skipIndex, page);
		ctx.body = util.success({
			page: {
				...page,
				total,
			},
			list,
		});
	} catch (error) {
		ctx.body = util.fail(`查询失败:${error.stack}`);
	}
});
router.post("/operate", async (ctx) => {
	const { _id, action, ...params } = ctx.request.body;
	let authorization = ctx.request.headers.authorization;
	let { data } = util.decoded(authorization);
	if (action === "add") {
		// 生成申请单号
		let orderNo = "XJ";
		orderNo += util.formateDate(new Date(), "yyyyMMdd");
		const total = await countLeaveNumber();
		params.orderNo = orderNo + total;
		// 获取用户当前部门ID
		let id = data.deptId.pop();
		// 查找负责人信息
		let dept = await findDeptById(id);
		// 获取人事部门和财务部门负责人信息
		let userList = await findUserListFromDept();
		let auditUsers = dept.userName;
		// 审核流程
		let auditFlows = [{ userId: dept.userId, userName: dept.userName, userEmail: dept.userEmail }];
		userList.map((item) => {
			auditFlows.push({
				userId: item.userId,
				userName: item.userName,
				userEmail: item.userEmail,
			});
			auditUsers += "," + item.userName;
		});
		params.auditUsers = auditUsers;
		params.curAuditUserName = dept.userName;
		params.auditFlows = auditFlows;
		params.auditLogs = [];
		params.applyUser = {
			userId: data.userId,
			userName: data.userName,
			userEmail: data.userEmail,
		};
		let res = await addLeave(params);
		if (res) {
			ctx.body = util.success("", "创建成功");
		} else {
			ctx.body = util.fail("创建失败");
		}
	}
	if (action === "delete") {
		let res = await deleteLeave(_id);
		ctx.body = util.success("", "操作成功");
	}
});
router.post("/approve", async (ctx) => {
	// 获得参数
	const { action, remark, _id } = ctx.request.body;
	let authorization = ctx.request.headers.authorization;
	let { data } = util.decoded(authorization);
	let params = {};
	try {
		// 1:待审批 2:审批中 3:审批拒绝 4:审批通过 5:作废
		let doc = await findLeave(_id);
		let auditLogs = doc.auditLogs || [];
		if (action == "refuse") {
			params.applyState = 3;
		} else {
			// 审核通过
			if (doc.auditFlows.length == doc.auditLogs.length) {
				ctx.body = util.success("当前申请单已处理，请勿重复提交");
				return;
			} else if (doc.auditFlows.length == doc.auditLogs.length + 1) {
				params.applyState = 4;
			} else if (doc.auditFlows.length > doc.auditLogs.length) {
				params.applyState = 2;
				params.curAuditUserName = doc.auditFlows[doc.auditLogs.length + 1].userName;
			}
		}
		auditLogs.push({
			userId: data.userId,
			userName: data.userName,
			createTime: new Date(),
			remark,
			action: action == "refuse" ? "审核拒绝" : "审核通过",
		});
		params.auditLogs = auditLogs;
		let res = await updateLeave(_id, params);
		ctx.body = util.success("", "处理成功");
	} catch (error) {
		ctx.body = util.fail(`查询异常：${error.message}`);
	}
});

router.get("/count", async (ctx) => {
	let authorization = ctx.request.headers.authorization;
	let { data } = util.decoded(authorization);
	try {
		let params = {};
		params.curAuditUserName = data.userName;
		params.$or = [{ applyState: 1 }, { applyState: 2 }];
		const total = await getLeaveCount(params);
		ctx.body = util.success(total);
	} catch (error) {
		ctx.body = util.fail(`查询异常：${error.message}`);
	}
});
module.exports = router;
