<template>
	<div class="user-manager">
		<div class="query-form">
			<el-form inline :model="user" ref="formRef">
				<el-form-item label="用户ID" prop="userId">
					<el-input v-model="user.userId" placeholder="请输入用户ID" />
				</el-form-item>
				<el-form-item label="用户名称" prop="userName">
					<el-input v-model="user.userName" placeholder="请输入用户名称" />
				</el-form-item>
				<el-form-item label="用户状态" prop="state">
					<el-select v-model="user.state">
						<el-option :value="0" label="所有"></el-option>
						<el-option :value="1" label="在职"></el-option>
						<el-option :value="2" label="离职"></el-option>
						<el-option :value="3" label="试用期"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleQuery">查询</el-button>
					<el-button @click="handleReset(formRef)">重置</el-button>
				</el-form-item>
			</el-form>
		</div>
		<div class="base-table">
			<div class="action">
				<el-button v-has="'user-create'" type="primary" @click="addUser">新增</el-button>
				<el-button type="danger" :disabled="user.state === 2" v-has="'user-patch-delete'" @click="multiDelete"
					>批量删除</el-button
				>
			</div>
			<el-table :data="userList" style="width: 100%" @selection-change="handleSelectionChange">
				<el-table-column type="selection" width="55" />
				<el-table-column
					v-for="item in columns"
					:key="item.prop"
					:prop="item.prop"
					:label="item.label"
					:width="item.width"
					:formatter="item.formatter"
				/>
				<el-table-column fixed="right" label="操作" width="140">
					<template #default="scope">
						<el-button v-has="'user-edit'" size="small" @click="handleEdit(scope.row)">编辑</el-button>
						<el-button
							:disabled="scope.row.state === 2"
							type="danger"
							@click="handleDelete(scope.row.userId)"
							size="small"
							v-has="'user-delete'"
							>删除</el-button
						>
					</template>
				</el-table-column>
			</el-table>
			<el-pagination
				hide-on-single-page
				class="pagination"
				small
				:page-size="pager.pageSize"
				background
				layout="prev, pager, next"
				:total="pager.total || 0"
				@current-change="handleCurrentChange"
			/>
		</div>
		<el-dialog
			:title="actionName + '用户'"
			v-model="showModal"
			:before-close="
				() => {
					handleClose(dialogForm);
				}
			"
		>
			<!-- 表达对象的引用, 将来可以通过dialogForm进行表单的验证 -->
			<!-- userForm 给表单绑定事件 -->
			<!-- label-width 设置表单宽度 -->
			<!-- rules 表单数据的校验规则 -->
			<el-form ref="dialogForm" :model="userForm" label-width="100px" :rules="rules">
				<!-- label 中文名 -->
				<!-- prop model 的键名, prop 对应数据的属性名, 表单校验时, 必填 -->
				<el-form-item label="用户名" prop="userName">
					<!-- 绑定数据为userForm.userName -->
					<!-- 判断如果当前操作为编辑, edit, 用户名称不可操作 -->
					<el-input v-model="userForm.userName" :disabled="action == 'edit'" placeholder="请输入用户名称" />
				</el-form-item>
				<el-form-item label="邮箱" prop="userEmail">
					<el-input v-model="userForm.userEmail" :disabled="action == 'edit'" placeholder="请输入用户邮箱">
						<template #append>@wangshidai.com</template>
					</el-input>
				</el-form-item>
				<el-form-item label="手机号" prop="mobile">
					<el-input v-model="userForm.mobile" placeholder="请输入手机号" />
				</el-form-item>
				<el-form-item label="岗位" prop="job">
					<el-input v-model="userForm.job" placeholder="请输入岗位" />
				</el-form-item>
				<el-form-item label="状态" prop="state">
					<el-select v-model="userForm.state">
						<el-option :value="1" label="在职"></el-option>
						<el-option :value="2" label="离职"></el-option>
						<el-option :value="3" label="试用期"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="系统角色" prop="roleList">
					<el-select v-model="userForm.roleList" placeholder="请选择用户系统角色" multiple style="width: 100%">
						<el-option v-for="role in roleList" :key="role._id" :label="role.roleName" :value="role._id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="部门" prop="deptId">
					<el-cascader
						v-model="userForm.deptId"
						placeholder="请选择所属部门"
						:options="deptList"
						:props="{ checkStrictly: true, value: '_id', label: 'deptName' }"
						clearable
						style="width: 100%"
					></el-cascader>
				</el-form-item>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="handleClose(dialogForm)">取消</el-button>
					<el-button type="primary" @click="handleSubmit(dialogForm)">确定</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>
<script setup>
import { onMounted, reactive, ref, toRaw, nextTick } from "vue";
// 导入api
import api from "@/api";
// 引入ElMessage
import { ElMessage } from "element-plus";
// 引入util
import util from "@/utils/util.js";

// 对话框相关
const dialogForm = ref();
const showModal = ref(false);
const dialogFormVisible = ref(false);
const formLabelWidth = "100px";
const form = reactive({
	name: "",
	region: "",
	date1: "",
	date2: "",
	delivery: false,
	type: [],
	resource: "",
	desc: "",
});
// 新增用户Form对象
const userForm = reactive({
	state: 3,
});
// 所有角色列表
const roleList = ref([]);
// 所有部门列表
const deptList = ref([]);
// 定义用户操作行为
const action = ref("add");
const actionName = ref("添加");
const rules = reactive({
	userName: [
		{
			required: true,
			message: "请输入用户名称",
			trigger: "blur",
		},
	],
	userEmail: [{ required: true, message: "请输入用户邮箱", trigger: "blur" }],
	mobile: [
		{
			pattern: /^1[3-9]\d{9}$/,
			message: "请输入正确的手机号格式",
			trigger: "blur",
		},
	],
	deptId: [
		{
			required: true,
			message: "请输入用户邮箱",
			trigger: "blur",
		},
	],
});
// 选中的用户id
const checkedUserIds = ref([]);
// 表单引用
const formRef = ref();
const user = reactive({
	state: 1,
});
const userList = ref([]);
const columns = reactive([
	{
		label: "用户ID",
		prop: "userId",
	},
	{
		label: "用户名称",
		prop: "userName",
	},
	{
		label: "用户邮箱",
		prop: "userEmail",
	},
	{
		label: "用户角色",
		prop: "role",
		formatter(row, column, value) {
			console.log("value", value);
			const roleObject = {
				0: "管理员",
				1: "普通用户",
			};
			return roleObject[value];
		},
	},
	{
		label: "用户状态",
		prop: "state",
		formatter(row, column, value) {
			const stateObject = {
				1: "在职",
				2: "离职",
				3: "试用期",
			};
			return stateObject[value];
		},
	},
	{
		label: "注册时间",
		prop: "createTime",
		formatter(row, column, value) {
			return util.utc2beijing(value);
		},
	},
	{
		label: "最后登录时间",
		prop: "lastLoginTime",
		formatter(row, column, value) {
			return util.utc2beijing(value);
		},
	},
]);
const pager = ref({});
// 生命周期, 页面加载完成后执行
onMounted(() => {
	// 获取用户列表
	getUserList();
	// 获取部门列表
	getDeptList();
	// 获取角色列表
	getRoleList();
});

// 获取部门列表
const getDeptList = () => {
	api.getDeptList().then((res) => {
		deptList.value = res;
	});
};
// 获取角色列表
const getRoleList = () => {
	api.getRoleAllList().then((res) => {
		roleList.value = res;
	});
};

// 获取用户列表
const getUserList = () => {
	// 设置参数
	const params = {
		...pager.value,
		...user, // 加上查询条件
	};
	// 走ajax
	api.userList(params).then((res) => {
		const { list, page } = res;
		userList.value = list;
		pager.value = page;
		// 如果没有数据, 提示用户
		if (list.length === 0) {
			ElMessage.error("暂无数据!");
		}
	});
};
// 点击页码触发函数
const handleCurrentChange = (val) => {
	// 更新pager
	pager.value.pageNum = val;
	// 请求接口
	getUserList();
};

// 编辑函数
function handleEdit(row) {
	// 修改action
	action.value = "edit";
	actionName.value = action.value === "add" ? "增加" : "编辑";
	// 展示弹框
	showModal.value = true;
	nextTick(() => {
		Object.assign(userForm, row);
		// 清理掉邮箱的后缀, 使用正则替换, g表示匹配并且替换所有符合条件的字符串
		userForm.userEmail = userForm.userEmail.replace(/@.+$/g, "");
	});
}

// 查询
const handleQuery = () => {
	// 请求接口
	getUserList();
};
// 重置
const handleReset = (formRef) => {
	// 重置表单
	formRef.resetFields();
	// 请求接口
	getUserList();
};
// 删除
// 删除用户
function handleDelete(userId) {
	// 通过id删除用户, 现获取id, 拼接请求的参数
	const params = { userIds: [userId] };
	// ajax 请求
	api.userDelete(params).then((res) => {
		if (res.nModified > 0) {
			// 提示用户成功
			ElMessage.success("成功删除用户!");
			// 重新获取最新的列表
			getUserList();
		}
	});
}
// 批量删除
function multiDelete() {
	if (checkedUserIds.value.length === 0) {
		// 提示用户
		ElMessage.error("请选择要删除的用户!");
		// 终止程序, 不往下走了
		return;
	}
	// 通过id删除用户
	const params = {
		// 传递用户id数组
		userIds: checkedUserIds.value,
	};
	// ajax 请求
	api.userDelete(params).then((res) => {
		if (res.nModified > 0) {
			// 提示用户成功
			ElMessage.success(`批量删除成功, 已成功删除${res.nModified}个用户!`);
			// 重新获取最新的列表
			getUserList();
		} else {
			// 提示用户失败
			ElMessage.error("批量删除失败!");
		}
	});
}
// 选中的用户id发生变化
function handleSelectionChange(val) {
	// 更新选中的用户id
	checkedUserIds.value = val.map((item) => item.userId);
}
// 新增用户
function addUser() {
	// 修改action
	action.value = "add";
	actionName.value = action.value === "add" ? "增加" : "编辑";
	showModal.value = true;
}
// 取消
function handleClose(formEl) {
	// 重置表单
	handleReset(formEl);
	// 关闭弹窗
	showModal.value = false;
}
// 确定
function handleSubmit(formRef) {
	formRef.validate((valid) => {
		// 如果结果为true
		if (valid) {
			const params = { ...toRaw(userForm), userEmail: userForm.userEmail + "@wangshidai.com" };
			// 标记用户的操作类型
			params.action = action.value;
			api.userSubmit(params).then((res) => {
				if (res.userId) {
					// 弹框提醒用户
					ElMessage.success(actionName.value + "用户成功!");
					// 关闭对话框
					showModal.value = false;
					// 重置表单
					handleReset(formRef);
					// 重新请求用户列表
					getUserList();
				} else {
					ElMessage.error(actionName.value + "用户失败!");
					return false;
				}
			});
		} else {
			ElMessage.error("校验表单失败");
		}
	});
}
</script>
<style lang="scss" scoped></style>
