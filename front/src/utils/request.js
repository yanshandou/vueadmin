/**
 * axios 二次封装
 * @date 2022年10月6日16:38:28
 * @author XuJunhao
 */
import axios from "axios";
// 导入配置
import config from "../config/index.js";
// 导入element-plus的弹框组件
import { ElMessage } from "element-plus";
// 导入storage
import storage from "../utils/storage.js";
// 定义错误信息
const TOKEN_INVALID = "Token 认证失败, 请重新登录!";
const NETWORK_ERROR = "网络请求异常, 请稍后重试!";
// 导入路由
import router from "../router/index.js";
// 创建axios实例, 添加全局配置
const service = axios.create({
	// 从配置项中取出baseURL
	baseURL: config.baseApi,
	// 超时时间, 8s
	timeout: 8000,
});
// 请求拦截
service.interceptors.request.use((req) => {
	// 获取请求头
	const headers = req.headers;
	// 如果请求头中, 没有验证信息, 给个默认值
	if (!headers.Authorization) {
		// 从storage中取出token, token在userInfo中, 需要解构
		const { token } = storage.getItem("userInfo") || {};
		// 如果有token, 就把token放到请求头中
		if (token) {
			headers.Authorization = "Bearer " + token;
		}
	}
	// 返回请求信息, 接着往后走
	return req;
});
// 响应拦截
service.interceptors.response.use((res) => {
	// 从响应的数据中, 获取errno,data, msg
	const { errno, data, msg } = res.data;
	// 如果错误码0, 直接返回data
	if (errno === 0) {
		return data;
	} else if (errno === 5001) {
		// 如果错误码5001, 报错, 返回错误信息
		ElMessage.error(TOKEN_INVALID); // 页面弹框
		// 路由跳转登录页面, 给一些时间, 比如1.5s
		setTimeout(() => {
			router.push("/login");
		}, 1500);
		return Promise.reject(TOKEN_INVALID); // 控制台
	} else {
		// 走到这一步, 就是其他报错
		ElMessage.error(msg || NETWORK_ERROR);
		return Promise.reject(msg || NETWORK_ERROR);
	}
});
/**
 * 请求的核心参数
 * @param {*} options
 * @returns axios 实例
 */
// 封装request
function request(options) {
	// 默认get请求
	options.method = options.method || "get";
	// 有时候方法是大写的GET, 所以先转小写
	if (options.method.toLowerCase() === "get") {
		// 传参的时候, 都传递data, 虽然get需要的是params, 我们可以进行转换
		options.params = options.data;
	}
	// 定义一个变量, 用来处理mock的设置, 默认是全局的mock配置, config.mock
	let isMock = config.mock;
	// 接口设置了自己的局部的mock, 优先使用局部的mock, options.mock
	if (typeof options.mock !== "undefined") {
		isMock = options.mock;
	}
	// 如果是生产环境, 一定要调线上的正式的api
	if (config.env === "prod") {
		service.defaults.baseURL = config.baseApi;
	} else {
		// 判断是否开启了mock, 如果开了, 走mock, 如果没开, 走线上正式的api
		service.defaults.baseURL = isMock ? config.mockApi : config.baseApi;
	}
	return service(options);
}
// 添加对应的请求方法
["get", "post", "put", "delete", "patch"].forEach((item) => {
	// 循环给request绑定方法
	request[item] = (url, data, options) => {
		// 把参数进行整理, 调用request
		return request({
			// 路径
			url,
			// 数据
			data,
			// 方法
			method: item,
			// 展开相关的配置
			...options,
		});
	};
});
// 导出
export default request;
