// 引入相关变量
import { createRouter, createWebHashHistory } from "vue-router";
// 引入组件
import Home from "../components/Home.vue";
import Welcome from "../views/Welcome.vue";
// 引入工具函数
import utils from "../utils/util";
// 引入 API
import API from "../api";
// 引入 storage
import storage from "../utils/storage";
// 定义路由规则, 注意这里的路由规则是一个数组, 数组中的每一个对象就是一个路由规则
const routes = [
	{
		name: "home", // 路由名称
		path: "/", // 路由匹配的路径, "/"表示根路径
		component: Home, // 匹配Home组件, 注意需要导入
		redirect: "/welcome", // 重定向到welcome子路由
		meta: {
			// 路由元信息
			title: "首页", // 路由标题
		},
		children: [
			{
				name: "welcome", // 子路由名称
				path: "/welcome", // 子路由匹配的路径
				component: Welcome, // 匹配Welcome组件
				meta: {
					// 路由元信息
					title: "欢迎页", // 路由标题
				},
			},
		], // 定义子路由
	},
	// 登录路由, 和首页路由平级
	{
		name: "login", // 子路由名称
		path: "/login", // 子路由匹配的路径
		component: () => import("../views/Login.vue"), // 匹配Login组件
		meta: {
			// 路由元信息
			title: "登录页", // 路由标题
		},
	},
	{
		name: "404", // 子路由名称
		path: "/404", // 子路由匹配的路径
		meta: {
			title: "页面不存在", // 路由标题
		},
		component: () => import("../views/404.vue"), // 匹配404组件
	},
];
const router = createRouter({
	history: createWebHashHistory(),
	routes,
});
/**
 * loadAsyncRoutes 函数用于异步加载路由信息
 * 它通过获取用户信息中的 token，然后调用 API.getPermissionList() 获取菜单权限列表。
 * 根据菜单权限列表生成路由信息，并将这些路由添加到主页（home）的路由配置中。
 */
async function loadAsyncRoutes() {
	// 获取用户信息
	let userInfo = storage.getItem("userInfo") || {};
	if (userInfo.token) {
		try {
			// 调用 API.getPermissionList() 获取菜单权限列表
			const { menuList } = await API.getPermissionList();
			// 根据菜单权限列表生成路由信息
			let routes = utils.generateRoute(menuList);
			// 使用 import.meta.glob() 加载视图组件模块
			const modules = import.meta.glob("../views/*.vue");
			// 将视图组件与对应的路由关联起来，并将这些路由添加到主页（home）的路由配置中
			routes.map((route) => {
				let url = `../views/${route.component}.vue`;
				route.component = modules[url];
				router.addRoute("home", route);
			});
		} catch (error) {
			// 处理异常情况
			console.log(JSON.stringify(error));
		}
	}
}
loadAsyncRoutes();
const NOT_FOUND_PATH = "/404";
// 导航守卫：这是Vue路由的导航守卫，它是用于在路由跳转前执行某些操作或验证的钩子
router.beforeEach(async (to, from, next) => {
	// 判断即将进入的路由是否有名称
	if (to.name) {
		// 检查即将进入的路由名称是否存在
		if (router.hasRoute(to.name)) {
			// 如果存在，则设置文档标题为目标路由的meta.title属性
			document.title = to.meta.title;
			// 继续导航到目标路由
			next();
		} else {
			// 如果不存在该路由，重定向到404页面
			next("/404");
		}
	} else {
		// 如果即将进入的路由没有名称，那么尝试加载异步路由
		await loadAsyncRoutes();
		// 从所有已加载的路由中查找与目标路径匹配的路由
		let curRoute = router.getRoutes().filter((item) => item.path == to.path);
		// 判断是否找到了匹配的路由
		if (curRoute?.length) {
			// 如果找到，设置文档标题为匹配路由的meta.title属性
			document.title = curRoute[0].meta.title;
			// 继续导航到目标路由，并使用replace模式，这样用户点击浏览器后退按钮时，不会返回到原路由
			next({ ...to, replace: true });
		} else {
			// 如果没有找到匹配的路由，重定向到404页面
			next("/404");
		}
	}
});

// 创建路由并导出
export default router;
