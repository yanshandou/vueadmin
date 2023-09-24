/**
 * 后台通用的工具函数
 * @date 2022年10月8日23:49:15
 * @author XuJunhao
 */
// 导入之前封装好的日志对象
const myLog = require("./myLog");
const jwt = require("jsonwebtoken");
// 定义错误码, 大写通常表示常量
const ERRNO = {
	SUCCESS: 0, // 没有错误
	PARAM_ERROR: 1001, //参数不正确
	USER_ACCOUNT_ERROR: 2001, //用户账号密码错误
	USER_LOGIN_ERROR: 3001, //用户未登录
	BUSINESS_ERROR: 4001, //业务请求失败
	AUTH_ERROR: 5001, //认证失败或TOKEN过期
};
/**
 * 分页结构
 * @param {object} pageNum 第几页, pageSize, 每页多少条
 */
function pager({ pageNum = 1, pageSize = 10 }) {
	// pageNum, pageSize 参数转数字
	// *= 可以将字符串转数字
	pageNum *= 1;
	pageSize *= 1;
	// 因为数据库查询数据, 需要起始索引(skipIndex)和查询条数,
	// 比如第一页的数据, 应该是起始索引0, 查10条(索引0~9)
	// 第二页的数据, 起始索引10, 查10条(索引10~19)
	// 第三页的数据, 起始索引20, 查10条(索引20~29)
	// 根据pageNum和pageSize, 可以计算起始索引
	const skipIndex = (pageNum - 1) * pageSize;
	// 返回数据
	return {
		page: {
			pageNum, // 第几页, 页码
			pageSize, // 每页几条
		},
		skipIndex, // 数据库查询的时候, 起始索引
	};
}
/**
 * 成功请求的封装, data是第一个参数, 方便调用的时候传参, errno默认成功, 可以不传
 * @param {object} data 数据
 * @param {string} msg 信息
 * @param {number} errno 错误码
 * @returns {object} 包含数据, 信息, 错误码的对象
 */
function success(data = "", msg = "", errno = ERRNO.SUCCESS) {
	// 利用我们封装好的日志方法, 进行打印日志
	myLog.debug(JSON.stringify(data));
	// 返回包含code,data,msg的对象
	return {
		errno,
		data,
		msg,
	};
}
/**
 * 失败请求的封装, msg为第一个参数, 方便调用的时候传参, 默认错误码为业务请求失败, 错误状态下, data默认为空
 * @param {string} msg 信息
 * @param {number} errno 错误码
 * @param {object} data 数据
 * @returns {object} 包含数据, 信息, 错误码的对象
 */
function fail(msg = "", errno = ERRNO.BUSINESS_ERROR, data = "") {
	// 利用我们封装好的日志方法, 进行打印日志
	myLog.error(JSON.stringify(data));
	// 返回包含code,data,msg的对象
	return {
		errno, // 错误码
		data, // 数据
		msg, // 信息
	};
}
// 递归拼接树形菜单
function getTreeMenu(rootList, id, list) {
	rootList.forEach(({ parentId, _doc, _id }) => {
		// 遍历根节点列表
		if (String(parentId[parentId.length - 1]) === String(id)) {
			// 判断父节点的最后一个元素是否与给定的id匹配
			list.push(_doc); // 将匹配的节点添加到列表中
		}
	});
	list.forEach((item) => {
		// 遍历已经匹配的节点列表
		item.children = []; // 初始化子节点数组
		const { _id: itemId } = item; // 获取当前节点的_id属性值并赋给itemId变量
		const filteredChildren = rootList.filter(
			({ parentId }) => String(parentId[parentId.length - 1]) === String(itemId) // 筛选出当前节点的直接子节点
		);
		if (filteredChildren.length > 0) {
			// 判断是否存在直接子节点
			item.children = getTreeMenu(rootList, itemId, []); // 递归调用getTreeMenu函数获取当前节点的子节点，并将结果赋给children属性
			if (item.children.length === 0) {
				// 如果子节点为空，则删除children属性
				delete item.children;
			} else if (item.children[0].menuType === 2) {
				// 如果子节点不为空且第一个子节点的menuType属性为2
				item.action = item.children; // 将子节点赋给action属性，用于后续的菜单按钮权限控制
			}
		}
	});
	return list; // 返回处理后的树状菜单列表
}
// 递归拼接树形列表
function getTreeDept(rootList, id, list) {
	for (let i = 0; i < rootList.length; i++) {
		let item = rootList[i];
		if (String(item.parentId.slice().pop()) == String(id)) {
			list.push(item._doc);
		}
	}
	list.map((item) => {
		item.children = [];
		getTreeDept(rootList, item._id, item.children);
		if (item.children.length == 0) {
			delete item.children;
		}
	});
	return list;
}
// 解析token
function decoded(authorization) {
	if (authorization) {
		// 获取token
		let token = authorization.split(" ")[1];
		// 解析token
		return jwt.verify(token, "wangshidai");
	}
	return "";
}
function formateDate(date, rule) {
	let fmt = rule || "yyyy-MM-dd hh:mm:ss";
	if (/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, date.getFullYear());
	}
	const o = {
		// 'y+': date.getFullYear(),
		"M+": date.getMonth() + 1,
		"d+": date.getDate(),
		"h+": date.getHours(),
		"m+": date.getMinutes(),
		"s+": date.getSeconds(),
	};
	for (let k in o) {
		if (new RegExp(`(${k})`).test(fmt)) {
			const val = o[k] + "";
			fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? val : ("00" + val).substr(val.length));
		}
	}
	return fmt;
}
function getAction(list) {
	// 创建一个空数组用于存储操作列表
	let actionList = [];
	// 定义递归函数，用于深度遍历列表
	const deep = (arr) => {
		while (arr.length) {
			// 从列表中取出最后一项
			let item = arr.pop();
			// 如果该项包含操作信息
			if (item.action) {
				// 遍历操作列表并将每个操作的菜单代码添加到actionList数组中
				item.action.map((action) => {
					actionList.push(action.menuCode);
				});
			}
			// 如果该项有子项并且没有操作信息
			if (item.children && !item.action) {
				// 继续深度遍历子项
				deep(item.children);
			}
		}
	};
	// 调用递归函数开始处理列表
	deep(list);
	// 返回操作列表
	return actionList;
}
// 导出定义好的方法
module.exports = {
	pager,
	success,
	fail,
	ERRNO,
	getTreeMenu,
	getTreeDept,
	decoded,
	getAction,
	formateDate
};
