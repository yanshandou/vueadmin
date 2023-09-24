const Koa = require("koa");
const app = new Koa();
const views = require("koa-views");
const json = require("koa-json");
const onerror = require("koa-onerror");
const bodyparser = require("koa-bodyparser");
// const logger = require('koa-logger')
// const log4js = require("log4js");
// const logger = log4js.getLogger();
// 引入我们封装好的日志文件
const myLog = require("./utils/myLog");
// 导入utils文件夹下的util.js文件
const util = require("./utils/util");
const index = require("./routes/index");
const users = require("./routes/users");
const leave = require("./routes/leave");
const menus = require("./routes/menus");
const roles = require("./routes/roles");
const depts = require("./routes/depts");
// 导入cors模块
const cors = require("koa2-cors");
// 引入koa-jwt
const jwt = require("koa-jwt");
// 引入错误码
const { ERRNO } = require("./utils/util");
// error handler
onerror(app);
// 配置cors
app.use(
	cors({
		origin: "*", // 允许所有前端域名
	})
);
// middlewares
app.use(
	bodyparser({
		enableTypes: ["json", "form", "text"],
	})
);
app.use(json());
// app.use(logger())
app.use(require("koa-static")(__dirname + "/public"));
app.use(
	views(__dirname + "/views", {
		extension: "pug",
	})
);
// logger
app.use(async (ctx, next) => {
	await next().catch((err) => {
		if (err.status === 401) {
			// 接口是通的, 状态码应该是200
			ctx.status = 200;
			const errMsg = err.message || err.originalError.message;
			// 返回错误信息
			ctx.body = util.fail("登录过期, 请重新登录, " + errMsg, ERRNO.AUTH_ERROR);
		}
	});
});
// 进行jwt验证, secret参数是加密的密钥
// 如果是登录或者注册, 就不需要进行jwt验证
app.use(jwt({ secret: "wangshidai" }).unless({ path: [/^\/users\/login/] }));
// app.use(async (ctx, next) => {
// 	await next();
// 	logger.level = "warn";
// 	logger.trace("这是一条 trace 级别的日志!");
// 	logger.debug("这是一条 debug 级别的日志!");
// 	logger.info("这是一条 info 级别的日志!");
// 	logger.warn("这是一条 warn 级别的日志!");
// 	logger.error("这是一条 error 级别的日志!");
// 	logger.fatal("这是一条 fatal 级别的日志!");
// });
// app.use(async (ctx, next) => {
//   const start = new Date()
//   await next()
//   const ms = new Date() - start
//   console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
// })
// routes
app.use(index.routes(), index.allowedMethods());
app.use(users.routes(), users.allowedMethods());
app.use(leave.routes(), leave.allowedMethods());
app.use(menus.routes(), menus.allowedMethods());
app.use(roles.routes(), roles.allowedMethods());
app.use(depts.routes(), depts.allowedMethods());
// error-handling
app.on("error", (err, ctx) => {
	console.error("server error", err, ctx);
});
module.exports = app;
