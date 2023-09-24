<template>
	<!-- for循环进行遍历, 注意是_id -->
	<template v-for="menu in menuData.userMenu" :key="menu._id">
		<!-- 代表父菜单 -->
		<el-sub-menu
			:index="menu.path"
			v-if="menu.children != undefined && menu.children.length > 0 && menu.children[0].menuType == 1"
		>
			<template #title>
				<el-icon><component :is="menu.icon.split('-').pop()" /></el-icon>
				<span>{{ menu.menuName }}</span>
			</template>
			<!-- 递归展示菜单 -->
			<tree-menu :userMenu="menu.children" />
		</el-sub-menu>

		<!-- 代表子菜单 -->
		<el-menu-item
			v-else-if="menu.children != undefined && menu.children.length > 0 && menu.children[0].menuType == 2"
			:index="menu.path"
			>{{ menu.menuName }}</el-menu-item
		>
	</template>
</template>
<script setup>


const menuData = defineProps({
	userMenu: {
		type: Array,
		required: true,
	},
});
</script>
<style lang="scss" scoped></style>
