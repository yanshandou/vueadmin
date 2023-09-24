<template>
	<div class="role-manager">
		<div class="query-form">
			<el-form inline :model="queryForm" ref="formRef">
				<el-form-item label="角色名称" prop="roleName">
					<el-input v-model="queryForm.roleName" placeholder="请输入角色名称" />
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleQuery">查询</el-button>
					<el-button
						@click="
							handleReset(formRef);
							getRoleList();
						"
						>重置</el-button
					>
				</el-form-item>
			</el-form>
		</div>
		<div class="base-table">
			<div class="action">
				<el-button type="primary" @click="addRole">创建角色</el-button>
			</div>
			<el-table :data="roleList">
				<el-table-column
					v-for="item in columns"
					:key="item.prop"
					:prop="item.prop"
					:label="item.label"
					:width="item.width"
					:formatter="item.formatter"
				/>
				<el-table-column fixed="right" label="操作" width="260">
					<template #default="scope">
						<el-button @click="handleEdit(scope.row)" size="small">编辑</el-button>
						<el-button type="primary" size="small" @click="handleSet(scope.row)">设置权限</el-button>
						<el-button type="danger" @click="handleDelete(scope.row._id)" size="small">删除</el-button>
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
			:title="actionName + '角色'"
			v-model="showModal"
			:before-close="
				() => {
					handleClose(dialogForm);
				}
			"
		>
			<el-form ref="dialogForm" :model="roleForm" label-width="100px" :rules="rules">
				<el-form-item label="角色名称" prop="roleName">
					<el-input v-model="roleForm.roleName" placeholder="请输入角色名称" />
				</el-form-item>
				<el-form-item label="备注" prop="remark">
					<el-input type="textarea" :rows="2" v-model="roleForm.remark" placeholder="请输入备注" />
				</el-form-item>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="handleClose(dialogForm)">取消</el-button>
					<el-button type="primary" @click="handleSubmit(dialogForm)">确定</el-button>
				</span>
			</template>
		</el-dialog>
		<!-- 权限弹框-->
		<el-dialog title="权限设置" v-model="showPermission">
			<el-form label-width="100px">
				<el-form-item label="角色名称">
					{{ currentRoleName }}
				</el-form-item>
				<el-form-item label="选择权限">
					<el-tree
						ref="tree"
						:data="menuList"
						show-checkbox
						node-key="_id"
						default-expand-all
						:props="{ label: 'menuName' }"
					>
					</el-tree>
				</el-form-item>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="showPermission = false">取 消</el-button>
					<el-button type="primary" @click="handlePermissionSubmit">确 定</el-button>
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
// 表单引用
const formRef = ref();
let actionMap = {};
const dialogForm = ref();
const tree = ref();
const columns = reactive([
	{
		label: "角色名称",
		prop: "roleName",
	},
	{
		label: "备注",
		prop: "remark",
	},
	{
		label: "权限列表",
		prop: "permissionList",
		width: 400,
		formatter: (row, column, value) => {
			let names = [];
			let list = value.halfCheckedKeys || [];
			list.map((key) => {
				let name = actionMap[key];
				if (key && name) {
					names.push(name);
				}
			});
			return names.join(",");
		},
	},
	{
		label: "创建时间",
		prop: "createTime",
		formatter(row, column, value) {
			return util.utc2beijing(value);
		},
	},
]);
const queryForm = reactive({
	roleName: "",
});
const roleForm = reactive({});
const rules = {
	roleName: [
		{
			required: true,
			message: "请输入角色名称",
		},
	],
};
const pager = ref({
	total: 0,
	pageNum: 1,
	pageSize: 10,
});
// 控制dialog的显示隐藏
const showModal = ref(false);
// 控制权限弹框的显示隐藏
const showPermission = ref(false);
// 当前角色名称
const currentRoleName = ref("");
// 当前的角色的id
const currentRoleId = ref("");
const action = ref("add");
const actionName = ref("添加");
// 角色列表
const roleList = ref([]);
// 菜单列表
const menuList = ref([]);
// 权限设置
const handleSet = (row) => {
	currentRoleId.value = row._id;
	currentRoleName.value = row.roleName;
	showPermission.value = true;
	let { checkedKeys } = row.permissionList;
	setTimeout(() => {
		tree.value.setCheckedKeys(checkedKeys);
	});
};
const getActionMap = (list) => {
	let tmpActionMap = {};
	const deep = (arr) => {
		while (arr.length) {
			let item = arr.pop();
			if (item.children && item.action) {
				tmpActionMap[item._id] = item.menuName;
			}
			if (item.children && !item.action) {
				deep(item.children);
			}
		}
	};
	deep(JSON.parse(JSON.stringify(list)));
	actionMap = tmpActionMap;
};
// 获取角色列表
const getRoleList = async () => {
	const params = { ...toRaw(queryForm), ...pager.value };
	if (!params.roleName) {
		delete params.roleName;
	}
	const { list, page } = await api.roleList(params);
	roleList.value = list;
	pager.value = page;
};
// 获取菜单列表
const getMenuList = async () => {
	const res = await api.menuList();
	menuList.value = res;
	getActionMap(res);
};
onMounted(() => {
	getRoleList();
	getMenuList();
});
// 添加角色
const addRole = () => {
	action.value = "add";
	actionName.value = "添加";
	showModal.value = true;
};
const handleQuery = () => {
	getRoleList();
};
const handleClose = (formRef) => {
	// 关闭对话框
	showModal.value = false;
	// 重置表单
	handleReset(formRef);
};
const updatePermission = async (params) => {
	await api.updatePermission(params);
};
const handlePermissionSubmit = () => {
	let nodes = tree.value.getCheckedNodes();
	let halfKeys = tree.value.getHalfCheckedKeys();
	let checkedKeys = [];
	let parentKeys = [];
	nodes.map((nodeElement) => {
		if (!nodeElement.children.length) {
			checkedKeys.push(nodeElement._id);
		} else {
			parentKeys.push(nodeElement._id);
		}
	});
	let params = {
		_id: currentRoleId.value,
		permissionList: {
			checkedKeys,
			halfCheckedKeys: parentKeys.concat(halfKeys),
		},
	};
	updatePermission(params);
	showPermission.value = false;
	ElMessage.success("设置成功");
	getRoleList();
};
const handleCurrentChange = (val) => {
	pager.value.pageNum = val;
	getRoleList();
};
// 点击确定, 提交表单, 表单验证成功后提交
function handleSubmit(formRef) {
	formRef.validate((valid) => {
		// 如果结果为true
		if (valid) {
			const params = { ...toRaw(roleForm) };
			// 标记用户的操作类型
			params.action = action.value;
			api.roleOperate(params).then((res) => {
				// 我们之前设置了响应拦截, 只有成功了, 才会进到这一步
				ElMessage.success(actionName.value + "角色成功!");
				// 关闭对话框
				showModal.value = false;
				// 重置表单
				handleReset(formRef);
				// 重新获取角色列表
				getRoleList();
			});
		} else {
			ElMessage.error("校验表单失败");
		}
	});
}
// 重置
const handleReset = (formRef) => {
	// 重置表单
	formRef.resetFields();
};
// 编辑函数
const handleEdit = (row) => {
	// 修改action
	action.value = "edit";
	actionName.value = action.value === "add" ? "增加" : "编辑";
	// 展示弹框
	showModal.value = true;
	nextTick(() => {
		Object.assign(roleForm, row);
	});
};
// 删除角色
function handleDelete(roleId) {
	action.value = "delete";
	actionName.value = "删除";
	// 通过id删除角色, 现获取id, 拼接请求的参数
	const params = {
		_id: roleId,
		action: action.value,
	};
	// ajax 请求
	api.roleOperate(params).then((res) => {
		// 因为有响应拦截, 如果走到这里, 一定是成功的, 所以不需要额外的判断
		ElMessage.success("成功删除角色!");
		getRoleList();
	});
}
</script>
<style lang="scss" scoped></style>
