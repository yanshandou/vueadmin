/**
 * 菜单集合, 控制器
 * @date 2023年7月30日14:17:05
 * @author XuJunhao
 */
// 引入数据库模型
const Menu = require("../model/Menu");
// 新增菜单
async function addMenu(params) {
	try {
		const menu = await Menu.create(params);
		return menu;
	} catch (error) {
		console.log(JSON.stringify(error));
	}
}
// 更新菜单
async function updateMenu(_id, params) {
	try {
		params.updateTime = new Date();
		res = await Menu.findByIdAndUpdate(_id, params, { new: true });
		return res;
	} catch (error) {
		console.log(JSON.stringify(error));
	}
}
// 删除菜单
async function deleteMenu(_id) {
	try {
		// 根据id删除一条
		await Menu.findByIdAndRemove(_id);
		// 根据parentId删除多条
		await Menu.deleteMany({ parentId: { $all: [_id] } });
		return true;
	} catch (error) {
		console.log("error....");
		console.log(JSON.stringify(error));
		return false;
	}
}

// 获取菜单列表
async function getMenuList(params) {
	try {
		const menuList = await Menu.find(params);
		return menuList;
	} catch (error) {
		console.log(JSON.stringify(error));
	}
}

// 导出
module.exports = {
	addMenu,
	updateMenu,
	deleteMenu,
	getMenuList,
};
