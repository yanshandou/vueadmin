/**
 * api 管理
 * @date 2022年10月11日17:04:23
 * @author XuJunhao
 */
// 引入request
import request from "../utils/request";
//  导出login方法
export default {
	// 调用登录接口
	login(params) {
		// 该方法调用了request
		return request({
			method: "post", // 请求方法 post
			url: "/users/login", // 请求路径
			data: params, // 携带的数据
			mock: false, // 局部mock设置, 优先级更高, 是否走mock接口
		});
	},
	// 调用获取消息数量接口
	noticeCount() {
		// 该方法调用了request
		return request({
			method: "get", // 请求方法 get
			url: "/leave/count", // 请求路径
			data: {}, // 携带的数据
			mock: false, // 局部mock设置, 优先级更高, 是否走mock接口
		});
	},
	// 调用获取菜单列表接口
	menuList(params) {
		// 该方法调用了request
		return request({
			method: "get", // 请求方法 get
			url: "/menu/list", // 请求路径
			data: params, // 携带的数据
			mock: false, // 局部mock设置, 优先级更高, 是否走mock接口
		});
	},
	// 调用获取角色列表接口
	roleList(params) {
		// 该方法调用了request
		return request({
			method: "get", // 请求方法 get
			url: "/role/list", // 请求路径
			data: params, // 携带的数据
			mock: false, // 局部mock设置, 优先级更高, 是否走mock接口
		});
	},
	// 调用操作角色列表接口
	roleOperate(params) {
		return request({
			method: "post", // 请求方法 post
			url: "/role/operate", // 请求路径
			data: params, // 携带的数据
			mock: false, // 局部mock设置, 优先级更高, 是否走mock接口
		});
	},
	// 更新角色权限
	updatePermission(params) {
		return request({
			url: "/role/update/permission", // 请求路径
			method: "post", // 请求方法 post
			data: params, // 携带的数据
			mock: false, // 局部mock设置, 优先级更高, 是否走mock接口
		});
	},
	// 获取用户列表
	userList(params) {
		// 该方法调用了request
		return request({
			method: "get", // 请求方法 get
			url: "/users/list", // 请求路径
			data: params, // 携带的数据
		});
	},
	// 获取所有用户列表
	getAllUserList() {
		return request({
			url: "/users/all/list", // 请求路径
			method: "get", // 请求方法 get
			data: {}, // 携带的数据
			mock: false, // 局部mock设置, 优先级更高, 是否走mock接口
		});
	},
	// 获取审批列表
	getLeaveList(params) {
		return request({
			url: "/leave/list", // 请求路径
			method: "get", // 请求方法 get
			data: params, // 携带的数据
			mock: false, // 局部mock设置, 优先级更高, 是否走mock接口
		});
	},
	// 获取用户权限列表
	getPermissionList() {
		return request({
			url: "/users/getPermissionList", // 请求路径
			method: "get", // 请求方法 get
			data: {}, // 携带的数据
			mock: false, // 局部mock设置, 优先级更高, 是否走mock接口
		});
	},
	// 删除用户接口
	userDelete(params) {
		return request({
			method: "post", // 请求方法 post
			url: "/users/delete", // 请求路径
			data: params, // 携带的数据
		});
	},
	// 角色名称列表
	getRoleAllList() {
		return request({
			method: "get",
			url: "/role/allList",
			data: {},
			mock: false, // 局部mock设置, 优先级更高, 是否走mock接口
		});
	},
	// 获取部门列表
	getDeptList(params) {
		return request({
			method: "get",
			url: "/dept/list",
			data: params,
			mock: false, // 局部mock设置, 优先级更高, 是否走mock接口
		});
	},
	// 部门操作
	deptOperate(params) {
		return request({
			method: "post",
			url: "/dept/operate",
			data: params,
			mock: false, // 局部mock设置, 优先级更高, 是否走mock接口
		});
	},
	// 用户操作
	userSubmit(params) {
		return request({
			url: "/users/operate",
			method: "post",
			data: params,
		});
	},
	// 菜单操作
	menuSubmit(params) {
		return request({
			url: "/menu/operate",
			method: "post",
			data: params,
			mock: false, // 局部mock设置, 优先级更高, 是否走mock接口
		});
	},
	// 申请操作
	leaveOperate(params) {
		return request({
			url: "/leave/operate", // 请求路径
			method: "post", // 请求方法 post
			data: params, // 携带的数据
			mock: false, // 局部mock设置, 优先级更高, 是否走mock接口
		});
	},
	// 审批操作
	leaveApprove(params) {
		return request({
			url: "/leave/approve", // 请求路径
			method: "post", // 请求方法 post
			data: params, // 携带的数据
			mock: false, // 局部mock设置, 优先级更高, 是否走mock接口
		});
	},
};
