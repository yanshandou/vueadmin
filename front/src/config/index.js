/**
 * 环境配置封装
 * @date 2022年10月6日12:55:24
 * @author XuJunhao
 */
// 获取当前环境类型, 如果没有设置, 默认生产环境, 通常prod生产, dev开发
const env = import.meta.env.MODE === "development" ? "dev" : "prod";
// 定义相关配置
const EnvConfig = {
	// 开发环境
	dev: {
		baseApi: "https://adminapi.xujunhao.tech",
		mockApi: "https://www.fastmock.site/mock/90affc487e46d33ee51e9ebd335573df/api",
	},
	// 生产环境
	prod: {
		baseApi: "https://adminapi.xujunhao.tech", // 两个斜线定义的路径, 相对路径的一种, 省了协议http, https, 会根据实际情况动态的加上
	},
};

export default {
	// 当前环境为开发环境
	env: env,
	// 是否需要mock接口(临时用的测试接口, 如果后端的正式接口没有开发好, 前端可以先用测试接口, 和正式接口很像, 只是数据都是测试数据)
	mock: false,
	// 配置命名空间
	namespace: "manager",
	// 接口调用地址, 解构即可
	...EnvConfig[env],
};
