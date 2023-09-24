<template>
	<div class="dept-manager">
		<div class="query-form">
			<el-form inline :model="queryForm" ref="formRef">
				<el-form-item label="部门名称" prop="deptName">
					<el-input v-model="queryForm.deptName" placeholder="请输入部门名称" />
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleQuery">查询</el-button>
					<el-button
						@click="
							handleReset(formRef);
							getDeptList();
						"
						>重置</el-button
					>
				</el-form-item>
			</el-form>
		</div>
		<div class="base-table">
			<div class="action">
				<el-button type="primary" @click="addDept">创建部门</el-button>
			</div>
			<el-table :data="deptList" row-key="_id" :tree-props="{ children: 'children' }" stripe>
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
						<el-button type="primary" @click="handleEdit(scope.row)" size="small">编辑</el-button>
						<!-- <el-button type="primary" size="small" @click="handleSet(scope.row)">设置权限</el-button> -->
						<el-button type="danger" @click="handleDelete(scope.row._id)" size="small">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
		</div>
		<el-dialog :title="action == 'add' ? '创建部门' : '编辑部门'" v-model="showModal">
			<el-form ref="dialogForm" :model="deptForm" :rules="rules" label-width="120px">
				<el-form-item label="上级部门" prop="parentId">
					<el-cascader
						placeholder="请选择上级部门"
						v-model="deptForm.parentId"
						:props="{ checkStrictly: true, value: '_id', label: 'deptName' }"
						clearable
						:options="deptList"
						:show-all-levels="true"
					></el-cascader>
				</el-form-item>
				<el-form-item label="部门名称" prop="deptName">
					<el-input placeholder="请输入部门名称" v-model="deptForm.deptName"></el-input>
				</el-form-item>
				<el-form-item label="负责人" prop="user">
					<el-select placeholder="请选择部门负责人" v-model="deptForm.user" @change="handleUser">
						<el-option
							v-for="item in userList"
							:key="item.userId"
							:label="item.userName"
							:value="`${item.userId}/${item.userName}/${item.userEmail}`"
						></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="负责人邮箱" prop="userEmail">
					<el-input placeholder="请输入负责人邮箱" v-model="deptForm.userEmail" disabled></el-input>
				</el-form-item>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="handleClose(dialogForm)">取消</el-button>
					<el-button @click="handleSubmit(dialogForm)" type="primary">确定</el-button>
				</span>
			</template>
		</el-dialog>
		<!-- 权限弹框-->
		<el-dialog title="权限设置" v-model="showPermission">
			<el-form label-width="100px">
				<el-form-item label="部门名称">
					{{ currentDeptName }}
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
const userList = ref([]);
const tree = ref();
const columns = reactive([
	{
		label: "部门名称",
		prop: "deptName",
	},
	{
		label: "负责人",
		prop: "userName",
	},
	{
		label: "更新时间",
		prop: "updateTime",
		formatter(row, column, value) {
			return util.utc2beijing(value);
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
	deptName: "",
});
const deptForm = reactive({});
const rules = {
	// parentId: [
	// 	{
	// 		required: true,
	// 		message: "请选择上级部门",
	// 		trigger: "blur",
	// 	},
	// ],
	deptName: [
		{
			required: true,
			message: "请输入部门名称",
			trigger: "blur",
		},
	],
	user: [
		{
			required: true,
			message: "请选择负责人",
			trigger: "blur",
		},
	],
};
const pager = ref({
	total: 0,
	pageNum: 1,
	pageSize: 10,
});

const handleUser = (value) => {
	const [userId, userName, userEmail] = value.split("/");
	Object.assign(deptForm, { userId, userName, userEmail });
};

// 控制dialog的显示隐藏
const showModal = ref(false);
// 控制权限弹框的显示隐藏
const showPermission = ref(false);
// 当前部门名称
const currentDeptName = ref("");
// 当前的部门的id
const currentDeptId = ref("");
const action = ref("add");
const actionName = ref("添加");
// 部门列表
const deptList = ref([]);
// 菜单列表
const menuList = ref([]);
// 权限设置
const handleSet = (row) => {
	currentDeptId.value = row._id;
	currentDeptName.value = row.deptName;
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
// 获取部门列表
const getDeptList = async () => {
	const params = { ...toRaw(queryForm) };
	if (!params.deptName) {
		delete params.deptName;
	}
	const res = await api.getDeptList(params);
	deptList.value = res;
};
// 获取菜单列表
const getMenuList = async () => {
	const res = await api.menuList();
	menuList.value = res;
	getActionMap(res);
};

// 获取所有用户列表
const getAllUserList = async () => {
	const res = await api.getAllUserList();
	userList.value = res;
};

onMounted(() => {
	getDeptList();
	getMenuList();
	getAllUserList();
});
// 添加部门
const addDept = () => {
	action.value = "add";
	actionName.value = "添加";
	showModal.value = true;
};
// 添加部门(在原有基础上添加)
const handleAdd = (row) => {
	// 这段代码的功能是将 row._id 加入到 row.parentId 数组中，并剔除其中的空值。具体来说，它创建了 row.parentId 数组的一个副本，并将 row._id 添加到副本中。然后，通过使用 filter 方法并传入一个回调函数，该代码删除了副本中的所有空值（例如 null 、 undefined 和空字符串）。最后，赋值给 deptForm.parentId 的是经过筛选后的数组。
	deptForm.parentId = [...row.parentId, row._id].filter((item) => item);
	action.value = "add";
	actionName.value = "添加";
	showModal.value = true;
};
const handleSelectionChange = (val) => {
};
const handleQuery = () => {
	getDeptList();
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
		_id: currentDeptId.value,
		permissionList: {
			checkedKeys,
			halfCheckedKeys: parentKeys.concat(halfKeys),
		},
	};
	updatePermission(params);
	showPermission.value = false;
	ElMessage.success("设置成功");
	getDeptList();
};

const handleCurrentChange = (val) => {
	pager.value.pageNum = val;
	getDeptList();
};
// 点击确定, 提交表单, 表单验证成功后提交
function handleSubmit(formRef) {
	formRef.validate((valid) => {
		// 如果结果为true
		if (valid) {
			const params = { ...toRaw(deptForm) };
			// 标记用户的操作类型
			params.action = action.value;
			delete params.user;
			api.deptOperate(params).then((res) => {
				// 我们之前设置了响应拦截, 只有成功了, 才会进到这一步
				ElMessage.success(actionName.value + "部门成功!");
				// 关闭对话框
				showModal.value = false;
				// 重置表单
				handleReset(formRef);
				// 重新获取部门列表
				getDeptList();
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
		Object.assign(deptForm, row, {
			user: `${row.userId}/${row.userName}/${row.userEmail}`,
		});
	});
};
// 删除部门
function handleDelete(deptId) {
	action.value = "delete";
	actionName.value = "删除";
	// 通过id删除部门, 现获取id, 拼接请求的参数
	const params = {
		_id: deptId,
		action: action.value,
	};
	// ajax 请求
	api.deptOperate(params).then((res) => {
		// 因为有响应拦截, 如果走到这里, 一定是成功的, 所以不需要额外的判断
		ElMessage.success("成功删除部门!");
		getDeptList();
	});
}
</script>
<style lang="scss" scoped></style>
