<template>
	<el-breadcrumb :separator-icon="ArrowRight">
		<template v-for="(route, index) in breadList" :key="route.path">
			<el-breadcrumb-item v-if="index === 0" :to="{ path: '/' }">{{ route.meta.title }}</el-breadcrumb-item>
			<el-breadcrumb-item v-else>{{ route.meta.title }}</el-breadcrumb-item>
		</template>
	</el-breadcrumb>
</template>
<script setup>
import { ArrowRight } from "@element-plus/icons-vue";
import { computed } from "@vue/runtime-core";
import { useRoute } from "vue-router";
var route = useRoute();
const breadList = computed(() => {
	return route.matched;
});
</script>
<style lang="scss" scoped></style>
<style lang="scss" scoped></style>
