import { createApp } from "vue";
// import "./style.css";
// 导入路由
import router from "./router";
import App from "./App.vue";
// 引入vuex
import store from "./store";
// 引入axios
import request from "./utils/request.js";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
// 引入封装好的storage
import storage from "./utils/storage.js";
// 引入公共样式
import "./assets/style/index.scss";
import "./assets/style/reset.css";

import * as ElementPlusIconVue from "@element-plus/icons-vue";

const app = createApp(App);

app.directive("has", {
	/**
	 * 在元素挂载之前执行的钩子函数
	 * @param {HTMLElement} el - 元素对象
	 * @param {object} binding - 绑定对象
	 */
	beforeMount(el, binding) {
		// 从存储中获取操作列表
		const actionList = storage.getItem("actionList");
		// 获取绑定值
		const value = binding.value;
		// 检查当前操作是否在操作列表中
		const hasPermission = actionList.includes(value);
		// 如果没有权限
		if (!hasPermission) {
			// 设置元素样式为隐藏
			el.style.display = "none";
			// 延迟0毫秒后执行删除元素的操作
			setTimeout(() => {
				el.remove();
			}, 0);
		}
	},
});

for (const [key, component] of Object.entries(ElementPlusIconVue)) {
	app.component(key, component);
}

// 全局挂载变量
app.config.globalProperties.$request = request;
app.config.globalProperties.$storage = storage;
app.use(router);
app.use(ElementPlus, { size: "small" });
app.use(store);
app.mount("#app");
