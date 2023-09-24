<template>
	<div class="menu-manager">
		<div class="query-form">
			<el-form inline :model="queryForm" ref="formRef">
				<el-form-item label="菜单名称" prop="menuName">
					<el-input v-model="queryForm.menuName" placeholder="请输入菜单名称" />
				</el-form-item>
				<el-form-item label="菜单状态" prop="menuState">
					<el-select v-model="queryForm.menuState">
						<el-option :value="1" label="正常"></el-option>
						<el-option :value="2" label="停用"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleQuery">查询</el-button>
					<el-button @click="handleReset(formRef);getMenuList()">重置</el-button>
				</el-form-item>
			</el-form>
		</div>
		<div class="base-table">
			<div class="action">
				<el-button type="primary" @click="addMenu">创建菜单</el-button>
			</div>
			<el-table
				row-key="_id"
				:tree-props="{ children: 'children' }"
				:data="menuList"
				style="width: 100%"
				@selection-change="handleSelectionChange"
			>
				<el-table-column
					v-for="item in columns"
					:key="item.prop"
					:prop="item.prop"
					:label="item.label"
					:width="item.width"
					:formatter="item.formatter"
				/>
				<el-table-column fixed="right" label="操作" width="200">
					<template #default="scope">
						<el-button @click="handleAdd(scope.row)" type="primary" size="small">新增</el-button>
						<el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
						<el-button :disabled="scope.row.state === 2" type="danger" @click="handleDelete(scope.row._id)" size="small"
							>删除</el-button
						>
					</template>
				</el-table-column>
			</el-table>
		</div>
		<el-dialog
			:title="actionName + '菜单'"
			v-model="showModal"
			:before-close="
				() => {
					handleClose(dialogForm);
				}
			"
		>
			<!-- 表达对象的引用, 将来可以通过dialogForm进行表单的验证 -->
			<!-- menuForm 给表单绑定事件 -->
			<!-- label-width 设置表单宽度 -->
			<!-- rules 表单数据的校验规则 -->
			<el-form ref="dialogForm" :model="menuForm" label-width="100px" :rules="rules">
				<!-- label 中文名 -->
				<!-- prop model 的键名, prop 对应数据的属性名, 表单校验时, 必填 -->
				<el-form-item label="父级菜单" prop="parentId">
					<el-cascader
						v-model="menuForm.parentId"
						:options="menuList"
						:props="{ checkStrictly: true, value: '_id', label: 'menuName' }"
						clearable
					/>
					<span>不选，则直接创建一级菜单</span>
				</el-form-item>
				<el-form-item label="菜单类型" prop="menuType">
					<el-radio-group v-model="menuForm.menuType">
						<el-radio :label="1">菜单</el-radio>
						<el-radio :label="2">按钮</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="菜单名称" prop="menuName">
					<el-input v-model="menuForm.menuName" placeholder="请输入菜单名称" />
				</el-form-item>
				<el-form-item label="菜单图标" prop="icon" v-show="menuForm.menuType == 1">
					<el-input v-model="menuForm.icon" placeholder="请输入菜单图标" />
				</el-form-item>
				<el-form-item label="路由地址" prop="path" v-show="menuForm.menuType == 1">
					<el-input v-model="menuForm.path" placeholder="请输入路由地址" />
				</el-form-item>
				<el-form-item label="权限标识" prop="menuCode" v-show="menuForm.menuType == 2">
					<el-input v-model="menuForm.menuCode" placeholder="请输入权限标识" />
				</el-form-item>
				<el-form-item label="组件路径" prop="component" v-show="menuForm.menuType == 1">
					<el-input v-model="menuForm.component" placeholder="请输入组件路径" />
				</el-form-item>
				<el-form-item label="菜单状态" prop="menuState" v-show="menuForm.menuType == 1">
					<el-radio-group v-model="menuForm.menuState">
						<el-radio :label="1">正常</el-radio>
						<el-radio :label="2">停用</el-radio>
					</el-radio-group>
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
// 表单引用
const formRef = ref();
const dialogForm = ref();
const columns = reactive([
	{
		label: "菜单名称",
		prop: "menuName",
		width: 150,
	},
	{
		label: "图标",
		prop: "icon",
	},
	{
		label: "菜单类型",
		prop: "menuType",
		formatter(row, column, value) {
			return {
				1: "菜单",
				2: "按钮",
			}[value];
		},
	},
	{
		label: "权限标识",
		prop: "menuCode",
	},
	{
		label: "路由地址",
		prop: "path",
	},
	{
		label: "组件路径",
		prop: "component",
	},
	{
		label: "菜单状态",
		prop: "menuState",
		width: 90,
		formatter(row, column, value) {
			return {
				1: "正常",
				2: "停用",
			}[value];
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
	menuState: 1,
});
const menuForm = reactive({
	parentId: [null],
	menuType: 1,
	menuState: 1,
});

const rules = {
	// 菜单名称
	menuName: [
		{
			required: true, // 必填
			message: "请输入菜单名称", // 提示消息
			trigger: "blur", // 触发方式, blur表示失去焦点时触发
		},
		{
			min: 2, // 最小长度
			max: 10, // 最大长度
			message: "长度在2-8个字符", // 提示消息
			trigger: "blur", // 触发方式, blur表示失去焦点时触发
		},
	],
};

// 控制dialog的显示隐藏
const showModal = ref(false);
const action = ref("add");
const actionName = ref("添加");
// 菜单列表
const menuList = ref([]);

// 获取菜单列表
const getMenuList = async () => {
	const params = { ...toRaw(queryForm) };
	const res = await api.menuList(params);
	menuList.value = res;
};
onMounted(() => {
	getMenuList();
});
// 添加菜单
const addMenu = () => {
	action.value = "add";
	actionName.value = "添加";
	showModal.value = true;
};

// 添加菜单(在原有基础上添加)
const handleAdd = (row) => {
	// 这段代码的功能是将 row._id 加入到 row.parentId 数组中，并剔除其中的空值。具体来说，它创建了 row.parentId 数组的一个副本，并将 row._id 添加到副本中。然后，通过使用 filter 方法并传入一个回调函数，该代码删除了副本中的所有空值（例如 null 、 undefined 和空字符串）。最后，赋值给 menuForm.parentId 的是经过筛选后的数组。
	menuForm.parentId = [...row.parentId, row._id].filter((item) => item);
	action.value = "add";
	actionName.value = "添加";
	showModal.value = true;
};
const handleSelectionChange = (val) => {
};
const handleQuery = () => {
	getMenuList();
};
const handleClose = (formRef) => {
	// 关闭对话框
	showModal.value = false;
	// 重置表单
	handleReset(formRef);
};
// 点击确定, 提交表单, 表单验证成功后提交
function handleSubmit(formRef) {
	formRef.validate((valid) => {
		// 如果结果为true
		if (valid) {
			const params = { ...toRaw(menuForm) };
			// 标记用户的操作类型
			params.action = action.value;
			if (!params.parentId) {
				params.parentId = [null];
			}
			api.menuSubmit(params).then((res) => {
				// 我们之前设置了响应拦截, 只有成功了, 才会进到这一步
				ElMessage.success(actionName.value + "菜单成功!");
				// 关闭对话框
				showModal.value = false;
				// 重置表单
				handleReset(formRef);
				// 重新获取菜单列表
				getMenuList();
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
		Object.assign(menuForm, row);
	});
};

// 删除菜单
function handleDelete(menuId) {
	action.value = "delete";
	actionName.value = "删除";
	// 通过id删除菜单, 现获取id, 拼接请求的参数
	const params = {
		_id: menuId,
		action: action.value,
	};
	// ajax 请求
	api.menuSubmit(params).then((res) => {
		// 因为有响应拦截, 如果走到这里, 一定是成功的, 所以不需要额外的判断
		ElMessage.success("成功删除菜单!");
		getMenuList();
	});
}
</script>
<style lang="scss" scoped></style>
