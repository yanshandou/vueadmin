<template>
	<!-- 创建一个根标签, 这样配合scss, 只要根标签不重名, 不用担心组件之间的样式污染 -->
	<!-- 相当于给每个组件起了一个名字做前缀 -->
	<div class="login-wrapper">
		<!-- 模态框 -->
		<div class="modal">
			<!-- 表单 -->
			<el-form ref="userFormRef" :model="user" status-icon :rules="rules">
				<!-- 标题 -->
				<div class="title">网时代</div>
				<!-- 表单元素 -->
				<el-form-item prop="userName">
					<!-- input框 -->
					<el-input type="text" :prefix-icon="User" v-model="user.userName" />
				</el-form-item>
				<el-form-item prop="userPassword">
					<!-- 密码框 -->
					<el-input type="password" :prefix-icon="View" v-model="user.userPassword" />
				</el-form-item>
				<el-form-item>
					<!-- 按钮, primary, 背景色是蓝色 -->
					<el-button type="primary" @click="login(userFormRef)" class="btn-login">登录</el-button>
				</el-form-item>
			</el-form>
		</div>
	</div>
</template>

<!-- vite-project/src/views/Login.vue -->
<script setup>
// 引入 reactive, ref, 生产响应式的数据
import { reactive, ref } from "vue";
// 引入图标, 需要显示在视图层
import { User, View } from "@element-plus/icons-vue";
// 导入useRouter, 需要路由跳转
import { useRouter } from "vue-router";
// 导入api, 表单验证成功后, 进行ajax请求
import api from "../api";
// 导入useStore, 验证通过后, 要把用户信息存入vuex中
import { useStore } from "vuex";
// 使用路由
const router = useRouter();
// 创建store
const store = useStore();
// 定义表单的用户数据
const user = reactive({
	userName: "",
	userPassword: "",
});
// 在setup中, 获取模板的引用将存储在与名字匹配的 ref 里,
// 详见 https://cn.vuejs.org/api/built-in-special-attributes.html#ref
const userFormRef = ref();
// 定义表单的验证规则
const rules = {
	// userName 用户名的验证规则
	userName: [
		{
			required: true, // 必传
			message: "请输入用户名", // 不符合规则时的错误信息
			trigger: "blur", // 失去焦点触发数据校验
		},
	],
	// userPassword 用户密码的校验规则
	userPassword: [
		{
			required: true, // 必传
			message: "请输入用户密码", // 不符合规则时的错误提示信息
			trigger: "blur", // 失去焦点触发数据校验
		},
	],
};
// 定义点击按钮触发的login方法
function login(formRef) {
	// 进行验证, 参数是一个回调函数, 形参valid是验证的结果
	formRef.validate((valid) => {
		// 如果结果为true
		if (valid) {
			// 调用我们封装好的ajax方法, 进行用户的登录
			api.login(user).then((res) => {
				// 如果登录成功, 存一份与用户信息到vuex
				store.commit("saveUserInfo", res);
				// 登录成功后, 跳转首页
				router.push("/");
			});
		} else {
			// 失败, return false, 还留在登录页
			return false;
		}
	});
}
</script>

<style scoped lang="scss">
// 因为每个组件都有根标签, 已经可以起到区别的作用, 所以上面的scoped, 可以加, 也可以不加
.login-wrapper {
	// 模态框垂直水平居中
	display: flex;
	justify-content: center;
	align-items: center;
	// 给背景色
	background-color: #f8fcff;
	// 设置宽高
	width: 100vw;
	height: 100vh;
	// 设置模态框
	.modal {
		// 设置宽度, 高度由内容撑起来
		width: 500px;
		padding: 50px;
		// 设置背景色
		background-color: #fff;
		// 设置圆角
		border-radius: 4px;
		// 加阴影
		box-shadow: 0px 0px 10px 3px #dad9d9;
		// 设置标题
		.title {
			// 设置字体大小和行高
			font-size: 50px;
			line-height: 1.5;
			// 文字居中
			text-align: center;
			// 和下面的input框保持距离
			margin-bottom: 30px;
		}
		// 设置按钮
		.btn-login {
			width: 100%;
		}
	}
}
</style>
