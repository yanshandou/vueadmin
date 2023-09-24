/**
 * 数据库链接
 * @date 2022年10月12日15:59:21
 * @author XuJunhao
 */
// 引用mongoose
const mongoose = require("mongoose");
// 引入封装好的日志
const myLog = require("../utils/myLog");
const config = require("../config");
// 开始连接, 是用配置里的url
mongoose.connect(config.URL);
// 获取链接对象
const conn = mongoose.connection;
// 监听错误
conn.on("error", () => {
	myLog.error("数据库链接失败...");
});
// 监听成功
conn.on("open", () => {
	myLog.info("数据库链接成功!!!");
});
// 导出
module.exports = mongoose;
