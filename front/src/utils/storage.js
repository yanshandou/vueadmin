/**
 * storage 二次封装
 * @date 2022年10月7日10:56:42
 * @author XuJunhao
 */

// 导入配置信息
import config from "../config/index.js";

// 封装的时候, 尽量和原生api相似, 减少记忆成本
export default {
	// 设置
	setItem(key, value) {
		// 定义需要存储的key和value
		// 存储的key, 是当前的命名空间
		const sotrageKey = config.namespace;
		// 存储的value, 就是接收的两个形参, 注意属性名如果是变量, 需要是中括号
		let storageValue = { [key]: value };
		// 先取出原来的storage对应的value对象, 如果没有, 返回空对象
		let oldStorageValue = window.localStorage.getItem(sotrageKey) || "{}";
		// 取出来的是json字符串, 需要序列化成对象
		oldStorageValue = JSON.parse(oldStorageValue);
		// 原有的数据, 和新数据, 放到一起, 对象合并, 牵涉到同名覆盖
		storageValue = { ...oldStorageValue, ...storageValue };
		// 转成json字符串
		storageValue = JSON.stringify(storageValue);
		// 把接收到的key,value, 写入原来的value对象里面, 需要先把原来的value对象取出来, 序列化
		window.localStorage.setItem(sotrageKey, storageValue);
	},
	// 获取
	getItem(key) {
		// 通过命名空间, 找到存储的value对象(JSON 字符串)
		let storageValue = window.localStorage.getItem(config.namespace) || "{}";
		// JSON 字符串转对象
		storageValue = JSON.parse(storageValue);
		// 通过key, 从对象中取值并返回
		return storageValue[key];
	},
	// 清除某一项
	clearItem(key) {
		// 清除的是某一项, 而不是全部清除, localStorage自带的api是清除全部
		// 通过命名空间, 找到存储的value对象(JSON 字符串)
		let storageValue = window.localStorage.getItem(config.namespace) || "{}";
		// JSON 字符串转对象
		storageValue = JSON.parse(storageValue);
		// 通过delete 删除
		delete storageValue[key];
		// 删除之后, 需要写回去
		// 对象转回json字符串
		storageValue = JSON.stringify(storageValue);
		// 使用原生api, 写回去
		window.localStorage.setItem(config.namespace, storageValue);
	},
	// 清除所有
	clearAll() {
		// 调用原生api即可
		window.localStorage.clear();
	},
};
