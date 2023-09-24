<template>
	<div class="basic-layout">
		<!-- 左边的菜单导航 start-->
		<div :class="['nav-side', isCollapse ? 'fold' : 'expand']">
			<div class="logo">
				<img src="../assets/images/logo.png" alt="" />
				<span>Manager</span>
			</div>
			<!-- 菜单导航 start -->
			<el-menu
				:default-active="route.path"
				:collapse="isCollapse"
				background-color="#001529"
				text-color="#fff"
				class="el-menu-vertical-demo"
				@open="handleOpen"
				@close="handleClose"
				router
			>
				<tree-menu :userMenu="userMenu" />
			</el-menu>
			<!-- 菜单导航 end -->
		</div>
		<!-- 左边的菜单导航 end-->
		<!-- 右侧的内容区 start-->
		<div :class="['content-right', isCollapse ? 'fold' : 'expand']">
			<!-- 顶部导航 start-->
			<div class="nav-top">
				<!-- 面包屑导航 start -->
				<div class="nav-left">
					<el-icon v-show="!isCollapse" @click="toggle" class="nav-flod-expand-icon"><Fold /></el-icon>
					<el-icon v-show="isCollapse" @click="toggle" class="nav-flod-expand-icon"><Expand /></el-icon>
					<div class="bread">
						<bread-crumb />
					</div>
				</div>
				<!-- 面包屑导航 end -->
				<!-- 用户信息 start -->
				<div class="user-info">
					<el-badge @click="noticeClick" :is-dot="Boolean(noticeCount)" class="notice" type="danger">
						<el-icon><Bell /></el-icon>
					</el-badge>
					<el-dropdown @command="handleCommand">
						<span class="user-link">
							{{ userInfo.userName }}
						</span>
						<template #dropdown>
							<el-dropdown-menu>
								<el-dropdown-item command="email">邮箱: {{ userInfo.userEmail }}</el-dropdown-item>
								<el-dropdown-item command="logout">退出</el-dropdown-item>
							</el-dropdown-menu>
						</template>
					</el-dropdown>
				</div>
				<!-- 用户信息 end -->
			</div>
			<!-- 顶部导航 end-->
			<!-- 主内容区 start-->
			<div class="wrapper">
				<!-- 主页面 start -->
				<div class="main-page">
					<!-- 路由组件 start -->
					<router-view></router-view>
					<!-- 路由组件 end -->
				</div>
				<!-- 主页面 end -->
			</div>
			<!-- 主内容区 end-->
		</div>
		<!-- 右侧的内容区 end-->
	</div>
</template>
<script>
export default {
	name: "Home",
};
</script>
<script setup>
import { Document, Menu as IconMenu, Setting, Promotion, Fold, Bell, Expand } from "@element-plus/icons-vue";
import { computed, reactive, ref } from "vue";
import router from "../router";
import store from "../store";
// 导入onMounted
import { onMounted } from "vue";
// 导入api模块, 方便后期调用
import api from "@/api";
// 引入treeMenu组件
import TreeMenu from "@/components/TreeMenu.vue";
// 导入面包屑导航
import BreadCrumb from "@/components/BreadCrumb.vue";
import { useRoute } from "vue-router";
const route = useRoute();
const isCollapse = ref(false);
const userMenu = ref([]);
let userInfo = store.state.userInfo;
const handleOpen = (key, keyPath) => {};
const handleClose = (key, keyPath) => {};
const handleCommand = (command) => {
	if (command === "email") {
	} else if (command === "logout") {
		// 清空vuex中的数据
		store.commit("removeUserInfo");
		// 清空本地的数据
		userInfo = null;
		// 跳转到登录页面
		router.push("/login");
	}
};
// 菜单的打开关闭
const toggle = () => {
	// 取反
	isCollapse.value = !isCollapse.value;
};
const noticeCount = computed(() => {
	return store.state.noticeCount;
});
// 获取通知的数量
const getNoticeCount = async () => {
	const count = await api.noticeCount();
	store.commit("saveNoticeCount", count);
};
// 获取菜单列表
const getMenuList = async () => {
	// 获取菜单列表, 操作权限列表
	const { menuList, actionList } = await api.getPermissionList();
	// 将菜单列表, 操作权限列表保存到vuex中
	store.commit("saveMenuList", menuList);
	store.commit("saveActionList", actionList);
	// 将菜单列表保存到userMenu中
	userMenu.value = menuList;
};
onMounted(() => {
	getNoticeCount();
	getMenuList();
});
const noticeClick = () => {
	if (noticeCount.value === 0) return;
	router.push("/audit/approve");
};
</script>
<style scoped lang="scss">
.basic-layout {
	// 左侧的导航栏
	.nav-side {
		position: fixed;
		width: 200px;
		&.fold {
			width: 64px;
		}
		&.expand {
			width: 200px;
		}
		height: 100vh;
		background-color: #001529;
		// 字体白色
		color: #fff;
		// 垂直方向可以出现滚动条
		overflow-y: auto;
		// 过渡动画, 因为菜单可以打开关闭
		transition: width 0.5s;
		.logo {
			display: flex;
			align-items: center;
			font-size: 18px;
			height: 50px;
			img {
				width: 32px;
				height: 32px;
				margin: 0 16px;
			}
		}
		.el-menu {
			border-right: none;
		}
	}
	.content-right {
		transition: margin-left 0.5s;
		// 左侧的侧边栏是200px宽, 所以需要这么设置, 给左侧腾出位置
		// 因为左侧的侧边栏将来可以收起来, 所以后期还需要调整
		margin-left: 200px;
		&.fold {
			margin-left: 64px;
		}
		&.expand {
			margin-left: 200px;
		}
		.nav-top {
			height: 50px;
			line-height: 50px;
			// 内容通常需要左右两边对齐
			display: flex;
			justify-content: space-between;
			// 两边对齐之后, 往往有间距, 不是紧贴着左侧的侧边栏
			padding: 0 20px;
			// 做一个分割线
			border-bottom: 1px solid #ddd;
			.nav-left {
				display: flex;
				align-items: center;
				.nav-flod-expand-icon {
					font-size: 18px;
					margin-right: 15px;
				}
			}
			.user-info {
				display: flex;
				align-items: center;
				.notice {
					font-size: 22px;
					line-height: 16px;
					margin-right: 16px;
				}
				&:hover {
					cursor: pointer;
				}
				.user-link {
					font-weight: bold;
					color: #409eff;
					outline: none;
				}
			}
		}
		.wrapper {
			background-color: #eef0f3;
			padding: 20px;
			// 高度需要动态计算, 注意减号两边有空格
			min-height: calc(100vh - 50px);
			.main-page {
				// background-color: #fff;
				height: 100%;
			}
		}
	}
}
</style>
