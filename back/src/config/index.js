/**
 * 配置文件
 * @date 2022年10月12日15:59:21
 * @author XuJunhao
 */
// 定义url
// const url = "mongodb://127.0.0.1:27017";
// 定义数据库的名字
// const dbName = "manager";
// 拼接url
const URL = "mongodb://admin:你的Mongodb的密码@43.153.31.148:27017/admin?authMechanism=DEFAULT&authSource=admin";
// 导出配置
module.exports = {
	URL,
};
