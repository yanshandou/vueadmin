/**
 * Mutations 业务层数据提交
 * @date 2022年10月11日22:23:32
 * @author XuJunhao
 */
// 引入封装好的storage
import storage from "../utils/storage";
// 导出
export default {
	saveUserInfo(state, userInfo) {
		// 保存用户信息到vuex
		state.userInfo = userInfo;
		// 保存用户信息到localstorage
		storage.setItem("userInfo", userInfo);
	},
	removeUserInfo(state) {
		// 移除用户信息
		state.userInfo = "";
		storage.clearItem("userInfo");
	},
	saveMenuList(state, menuList) {
		state.menuList = menuList;
		storage.setItem("menuList", menuList);
	},
	saveActionList(state, actionList) {
		state.actionList = actionList;
		storage.setItem("actionList", actionList);
	},
	saveNoticeCount(state, noticeCount) {
		state.noticeCount = noticeCount;
		storage.setItem("noticeCount", noticeCount);
	},
};
