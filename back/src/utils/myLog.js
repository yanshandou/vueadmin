/**
 * 日志存储封装
 * @date 2022年10月7日19:00:01
 * @author XuJunhao
 */

// 引入log4js
const log4js = require("log4js");
// 配置log4js
const levels = {
	trace: log4js.levels.TRACE,
	debug: log4js.levels.DEBUG,
	info: log4js.levels.INFO,
	warn: log4js.levels.WARN,
	error: log4js.levels.ERROR,
	fatal: log4js.levels.FATAL,
};

// 定义相关配置
log4js.configure({
	// 追加器
	appenders: {
		// 追加器名字可以自定义
		console: {
			type: "console", // 控制台输出
		},
		// 追加器名字可以自定义
		trace: {
			type: "file", // 文件输出
			filename: "log/trace", // 文件名
			pattern: "yyyy-MM-dd.log", // 文件后缀
			alwaysIncludePattern: true, // 文件名和文件后缀结合, 类似 "trace.2022-10-07.log"
		},
		// 追加器名字可以自定义
		debug: {
			type: "file", // 文件输出
			filename: "log/debug", // 文件名
			pattern: "yyyy-MM-dd.log", // 文件后缀
			alwaysIncludePattern: true, // 文件名和文件后缀结合, 类似 "trace.2022-10-07.log"
		},
		// 追加器名字可以自定义
		info: {
			type: "file", //文件输出
			filename: "log/info", //文件名
			pattern: "yyyy-MM-dd.log", //文件后缀
			alwaysIncludePattern: true, //文件名和文件后缀结合, 类似 "trace.2022-10-07.log"
		},
		// 追加器名字可以自定义
		warn: {
			type: "file", //文件输出
			filename: "log/warn", //文件名
			pattern: "yyyy-MM-dd.log", //文件后缀
			alwaysIncludePattern: true, //文件名和文件后缀结合, 类似 "trace.2022-10-07.log"
		},
		// 追加器名字可以自定义
		error: {
			type: "file", //文件输出
			filename: "log/error", //文件名
			pattern: "yyyy-MM-dd.log", //文件后缀
			alwaysIncludePattern: true, //文件名和文件后缀结合, 类似 "trace.2022-10-07.log"
		},
		// 追加器名字可以自定义
		fatal: {
			type: "file", //文件输出
			filename: "log/fatal", //文件名
			pattern: "yyyy-MM-dd.log", //文件后缀
			alwaysIncludePattern: true, //文件名和文件后缀结合, 类似 "trace.2022-10-07.log"
		},
	},
	// 分类
	categories: {
		// default 分类必须要有, 否则报错
		default: {
			// 支持多个追加器
			appenders: ["console"],
			// 定义级别为 debug
			level: levels.debug,
		},
		// 分类名称可以自定义
		myTrace: {
			// 支持多个追加器, 下面代码的含义是trace级别的日志, 控制台打印, 同时输出到文件
			appenders: ["trace", "console"],
			// 定义级别为trace
			level: levels.trace,
		},
		// 分类名称可以自定义
		myDebug: {
			// 支持多个追加器, 下面代码的含义是debug级别的日志, 控制台打印, 同时输出到文件
			appenders: ["debug", "console"],
			// 定义级别为debug
			level: levels.debug,
		},
		// 分类名称可以自定义
		myInfo: {
			// 支持多个追加器, 下面代码的含义是info级别的日志, 控制台打印, 同时输出到文件
			appenders: ["info", "console"],
			// 定义级别为info
			level: levels.info,
		},
		// 分类名称可以自定义
		myWarn: {
			// 支持多个追加器, 下面代码的含义是warn级别的日志, 控制台打印, 同时输出到文件
			appenders: ["warn", "console"],
			// 定义级别为warn
			level: levels.warn,
		},
		// 分类名称可以自定义
		myError: {
			// 支持多个追加器, 下面代码的含义是error级别的日志, 控制台打印, 同时输出到文件
			appenders: ["error", "console"],
			// 定义级别为error
			level: levels.error,
		},
		// 分类名称可以自定义
		myFatal: {
			// 支持多个追加器, 下面代码的含义是fatal级别的日志, 控制台打印, 同时输出到文件
			appenders: ["fatal", "console"],
			// 定义级别为fatal
			level: levels.fatal,
		},
	},
});

/**
 * trace 日志输出
 * @param {string} content 输出的日志内容
 */
const trace = (content) => {
	// getLogger的参数是我们之前定义的分类名称
	const logger = log4js.getLogger("myTrace");
	// 触发一个 trace 日志
	logger.trace(content);
};
/**
 * debug 日志输出
 * @param {string} content 输出的日志内容
 */
const debug = (content) => {
	// getLogger的参数是我们之前定义的分类名称
	const logger = log4js.getLogger("myDebug");
	// 触发一个 debug 日志
	logger.debug(content);
};
/**
 * info 日志输出
 * @param {string} content 输出的日志内容
 */
const info = (content) => {
	// getLogger的参数是我们之前定义的分类名称
	const logger = log4js.getLogger("myInfo");
	// 触发一个 info 日志
	logger.info(content);
};
/**
 * warn 日志输出
 * @param {string} content 输出的日志内容
 */
const warn = (content) => {
	// getLogger的参数是我们之前定义的分类名称
	const logger = log4js.getLogger("myWarn");
	// 触发一个 warn 日志
	logger.warn(content);
};
/**
 * error 日志输出
 * @param {string} content 输出的日志内容
 */
const error = (content) => {
	// getLogger的参数是我们之前定义的分类名称
	const logger = log4js.getLogger("myError");
	// 触发一个 error 日志
	logger.error(content);
};
/**
 * fatal 日志输出
 * @param {string} content 输出的日志内容
 */
const fatal = (content) => {
	// getLogger的参数是我们之前定义的分类名称
	const logger = log4js.getLogger("myFatal");
	// 触发一个 fatal 日志
	logger.fatal(content);
};
// 导出
module.exports = {
	trace,
	debug,
	info,
	warn,
	error,
	fatal,
};
