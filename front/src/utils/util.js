/**
 * 工具函数
 * @date 2022年11月06日02:37:31
 * @author XuJunhao
 */
/*
 * utc转北京时间
 */
function utc2beijing(utc_datetime) {
	// 转为正常的时间格式 年-月-日 时:分:秒
	let new_datetime = utc_datetime.split("T")[0] + " " + utc_datetime.split("T")[1].split(".")[0];
	// 处理成为时间戳
	let timestamp = new Date(new_datetime.replace(/-/g, "/")).getTime();
	timestamp = timestamp / 1000;
	// 增加8个小时，北京时间比utc时间多八个时区
	timestamp = timestamp + 8 * 60 * 60;
	// 时间戳转为时间
	let date = new Date(parseInt(timestamp) * 1000);
	let YY = date.getFullYear() + "-";
	let MM = (date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1) + "-";
	let DD = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
	let hh = (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) + ":";
	let mm = (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()) + ":";
	let ss = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
	return YY + MM + DD + " " + hh + mm + ss;
}
// 生成路由函数，接收一个菜单列表作为参数
function generateRoute(menuList) {
	// 创建空数组用于存储生成的路由对象
	const routes = [];
	// 递归函数，用于深度遍历菜单列表
	const deepList = (list) => {
		// 遍历菜单列表中的每一项
		list.forEach((item) => {
			// 如果当前项具有 action 属性，表示为有效路由项
			if (item.action) {
				// 将当前项转换为路由对象，并添加到 routes 数组中
				routes.push({
					name: item.component.split("/").pop(), // 路由名称
					path: item.path, // 路由路径
					meta: {
						title: item.menuName, // 路由标题
					},
					component: item.component, // 路由组件
				});
			}
			// 如果当前项具有 children 属性且没有 action 属性，表示为嵌套子菜单
			if (item.children && !item.action) {
				// 递归调用 deepList 函数处理子菜单
				deepList(item.children);
			}
		});
	};
	// 初始调用 deepList 函数处理传入的菜单列表
	deepList(menuList);
	// 返回生成的路由数组
	return routes;
}

// // 首字母大写
// function capitalizeFirstLetter(string) {
// 	return string.charAt(0).toUpperCase() + string.slice(1);
// }

// 导出
export default {
	utc2beijing,
	generateRoute,
};
