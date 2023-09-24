<template>
	<div class="welcome">
		<!-- 左侧内容区 -->
		<div class="content">
			<div class="sub-title">欢迎体验</div>
			<div class="title">通用后台管理系统</div>
			<div class="desc">- Vue3.0 + ElementPlus + Node + MongoDB 通用后台管理系统</div>
		</div>
		<!-- 右侧图片 -->
		<div class="img"></div>
	</div>
</template>

<script>
export default {
	name: "Welcome",
};
</script>

<style lang="scss" scoped>
.welcome {
	background-color: #fff;
	display: flex;
	justify-content: center;
	align-items: center;
	height: calc(100vh - 100px);
	.content {
		position: relative;
		bottom: 40px;
		.sub-title {
			font-size: 30px;
			line-height: 42px;
			color: #333;
		}
		.title {
			font-size: 40px;
			line-height: 62px;
			color: #409eff;
		}
		.desc {
			text-align: right;
			font-size: 14px;
			color: #999;
		}
	}
	.img {
		width: 371px;
		height: 438px;
		background-image: url("../assets/images/welcome.png");
		margin-left: 105px;
	}
}
</style>
