/**
 * Vuex 状态管理
 * @date 2022年10月11日22:18:04
 * @author XuJunhao
 */
// 引入相关的方法
import { createStore } from "vuex";
// 引入mutaitons
import mutations from "./mutations";
// 引入我们封装的localstorage
import storage from "../utils/storage";
// 获取用户信息, userInfo 从localstorage中获取, 没有就是空
const state = {
	userInfo: storage.getItem("userInfo") || "",
	menuList: storage.getItem("menuList"),
	actionList: storage.getItem("actionList"),
	noticeCount: 0,
};
// 导出
export default createStore({
	state,
	mutations,
});
