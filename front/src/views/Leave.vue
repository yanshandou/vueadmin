<template>
	<div class="leave-manager">
		<div class="query-form">
			<el-form inline :model="queryForm" ref="formRef">
				<el-form-item label="审批状态" prop="applyState">
					<el-select v-model="queryForm.applyState">
						<el-option value="" label="全部"></el-option>
						<el-option :value="1" label="待审批"></el-option>
						<el-option :value="2" label="审批中"></el-option>
						<el-option :value="3" label="审批拒绝"></el-option>
						<el-option :value="4" label="审批通过"></el-option>
						<el-option :value="5" label="作废"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleQuery">查询</el-button>
					<el-button
						@click="
							handleReset(formRef);
							getLeaveList();
						"
						>重置</el-button
					>
				</el-form-item>
			</el-form>
		</div>
		<div class="base-table">
			<div class="action">
				<el-button type="primary" @click="addLeave">申请休假</el-button>
			</div>
			<el-table :data="leaveList">
				<el-table-column
					v-for="item in columns"
					:key="item.prop"
					:prop="item.prop"
					:label="item.label"
					:width="item.width"
					:formatter="item.formatter"
				/>
				<el-table-column fixed="right" label="操作" width="150">
					<template #default="scope">
						<el-button @click="handleDetail(scope.row)" size="small">查看</el-button>
						<el-button
							v-if="[1, 2].includes(scope.row.applyState)"
							type="danger"
							@click="handleDelete(scope.row._id)"
							size="small"
							>作废</el-button
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
			title="申请休假"
			v-model="showModal"
			width="70%"
			:before-close="
				() => {
					handleClose(dialogForm);
				}
			"
		>
			<el-form ref="dialogForm" :model="leaveForm" label-width="120px" :rules="rules">
				<el-form-item label="休假类型" prop="applyType" required>
					<el-select v-model="leaveForm.applyType">
						<el-option label="事假" :value="1"></el-option>
						<el-option label="调休" :value="2"></el-option>
						<el-option label="年假" :value="3"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="休假类型" required>
					<el-row>
						<el-col :span="8">
							<el-form-item prop="startTime" required>
								<el-date-picker
									v-model="leaveForm.startTime"
									type="date"
									placeholder="选择开始日期"
									@change="(val) => handleDateChange('startTime', val)"
								/>
							</el-form-item>
						</el-col>
						<el-col :span="1">-</el-col>
						<el-col :span="8">
							<el-form-item prop="endTime" required>
								<el-date-picker
									v-model="leaveForm.endTime"
									type="date"
									placeholder="选择结束日期"
									@change="(val) => handleDateChange('endTime', val)"
								/>
							</el-form-item>
						</el-col>
					</el-row>
				</el-form-item>
				<el-form-item label="休假时长" required prop="leaveTime">
					{{ leaveForm.leaveTime }}
				</el-form-item>
				<el-form-item label="休假原因" prop="reasons" required>
					<el-input type="textarea" :row="3" placeholder="请输入休假原因" v-model="leaveForm.reasons" />
				</el-form-item>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="handleClose(dialogForm)">取消</el-button>
					<el-button type="primary" @click="handleSubmit(dialogForm)">确定</el-button>
				</span>
			</template>
		</el-dialog>
		<el-dialog title="申请休假详情" width="50%" v-model="showDetailModal" destroy-on-close>
			<el-steps :active="detail.applyState > 2 ? 3 : detail.applyState" align-center>
				<el-step title="待审批"></el-step>
				<el-step title="审批中"></el-step>
				<el-step title="审批通过/审批拒绝"></el-step>
			</el-steps>
			<el-form label-width="120px" label-suffix=":">
				<el-form-item label="休假类型">
					<div>{{ detail.applyTypeName }}</div>
				</el-form-item>
				<el-form-item label="休假时间">
					<div>{{ detail.time }}</div>
				</el-form-item>
				<el-form-item label="休假时长">
					<div>{{ detail.leaveTime }}</div>
				</el-form-item>
				<el-form-item label="休假原因">
					<div>{{ detail.reasons }}</div>
				</el-form-item>
				<el-form-item label="审批状态">
					<div>{{ detail.applyStateName }}</div>
				</el-form-item>
				<el-form-item label="审批人">
					<div>{{ detail.curAuditUserName }}</div>
				</el-form-item>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="showDetailModal = false">关 闭</el-button>
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
let detail = ref({});
const showDetailModal = ref(false);
const columns = reactive([
	{
		label: "单号",
		prop: "orderNo",
	},
	{
		label: "休假时间",
		prop: "",
		width: 280,
		formatter(row) {
			return util.utc2beijing(row.startTime) + " 到 " + util.utc2beijing(row.endTime);
		},
	},
	{
		label: "休假时长",
		prop: "leaveTime",
	},
	{
		label: "休假类型",
		prop: "applyType",
		formatter(row, column, value) {
			return {
				1: "事假",
				2: "调休",
				3: "年假",
			}[value];
		},
	},
	{
		label: "休假原因",
		prop: "reasons",
	},
	{
		label: "申请时间",
		prop: "createTime",
		width: 180,
		formatter: (row, column, value) => {
			return util.utc2beijing(value);
		},
	},
	{
		label: "审批人",
		prop: "auditUsers",
	},
	{
		label: "当前审批人",
		prop: "curAuditUserName",
	},
	{
		label: "审批状态",
		prop: "applyState",
		formatter: (row, column, value) => {
			// 1:待审批 2:审批中 3:审批拒绝 4:审批通过 5:作废
			return {
				1: "待审批",
				2: "审批中",
				3: "审批拒绝",
				4: "审批通过",
				5: "作废",
			}[value];
		},
	},
]);
const queryForm = reactive({
	applyState: 1,
});
// 创建休假弹框表单
const leaveForm = reactive({
	applyType: 1,
	startTime: "",
	endTime: "",
	leaveTime: "0天",
	reasons: "",
});
// 表单规则
const rules = {
	startTime: [
		{
			type: "date",
			required: true,
			message: "请输入开始日期",
			trigger: "change",
		},
	],
	endTime: [
		{
			type: "date",
			required: true,
			message: "请输入结束日期",
			trigger: "change",
		},
	],
	reasons: [
		{
			required: true,
			message: "请输入休假原因",
			trigger: ["change", "blur"],
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

// 当前审批名称
const currentLeaveName = ref("");
// 当前的审批的id
const currentLeaveId = ref("");
const action = ref("add");
const actionName = ref("添加");
// 审批列表
const leaveList = ref([]);
// 菜单列表
const menuList = ref([]);
// 权限设置
const handleSet = (row) => {
	currentLeaveId.value = row._id;
	currentLeaveName.value = row.leaveName;
	showDetailModal.value = true;
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
// 获取审批列表
const getLeaveList = async () => {
	const params = { ...toRaw(queryForm), ...pager.value };
	if (!params.leaveName) {
		delete params.leaveName;
	}
	const { list, page } = await api.getLeaveList(params);
	leaveList.value = list;
	pager.value = page;
};
// 获取菜单列表
const getMenuList = async () => {
	const res = await api.menuList();
	menuList.value = res;
	getActionMap(res);
};
onMounted(() => {
	getLeaveList();
	getMenuList();
});
// 添加审批
const addLeave = () => {
	action.value = "add";
	actionName.value = "添加";
	showModal.value = true;
};
const handleQuery = () => {
	getLeaveList();
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
		_id: currentLeaveId.value,
		permissionList: {
			checkedKeys,
			halfCheckedKeys: parentKeys.concat(halfKeys),
		},
	};
	updatePermission(params);
	showDetailModal.value = false;
	ElMessage.success("设置成功");
	getLeaveList();
};
const handleCurrentChange = (val) => {
	pager.value.pageNum = val;
	getLeaveList();
};
// 点击确定, 提交表单, 表单验证成功后提交
function handleSubmit(formRef) {
	formRef.validate((valid) => {
		// 如果结果为true
		if (valid) {
			const params = { ...toRaw(leaveForm) };
			// 标记用户的操作类型
			params.action = action.value;
			api.leaveOperate(params).then((res) => {
				// 我们之前设置了响应拦截, 只有成功了, 才会进到这一步
				ElMessage.success(actionName.value + "审批成功!");
				// 关闭对话框
				showModal.value = false;
				// 重置表单
				handleReset(formRef);
				// 重新获取审批列表
				getLeaveList();
			});
		} else {
			ElMessage.error("校验表单失败");
		}
	});
}
// 重置
const handleReset = (formRef) => {
	console.log(formRef);
	// 重置表单
	formRef.resetFields();
	console.log(leaveForm);
};
const handleDetail = (row) => {
	let data = { ...row };
	data.applyTypeName = {
		1: "事假",
		2: "调休",
		3: "年假",
	}[data.applyType];
	data.time = util.utc2beijing(row.startTime) + " 到 " + util.utc2beijing(row.endTime);
	// 1:待审批 2:审批中 3:审批拒绝 4:审批通过 5:作废
	data.applyStateName = {
		1: "待审批",
		2: "审批中",
		3: "审批拒绝",
		4: "审批通过",
		5: "作废",
	}[data.applyState];
	detail.value = data;
	showDetailModal.value = true;
};

// 删除审批
function handleDelete(leaveId) {
	action.value = "delete";
	actionName.value = "删除";
	// 通过id删除审批, 现获取id, 拼接请求的参数
	const params = {
		_id: leaveId,
		action: action.value,
	};
	// ajax 请求
	api.leaveOperate(params).then((res) => {
		// 因为有响应拦截, 如果走到这里, 一定是成功的, 所以不需要额外的判断
		ElMessage.success("成功作废审批!");
		getLeaveList();
	});
}
// 获取休假时长
const handleDateChange = (key, val) => {
	let { startTime, endTime } = leaveForm;
	if (!startTime || !endTime) return;
	if (startTime > endTime) {
		ElMessage.error("开始日期不能晚于结束日期");
		leaveForm.leaveTime = "0天";
		setTimeout(() => {
			leaveForm[key] = "";
		}, 0);
	} else {
		leaveForm.leaveTime = (endTime - startTime) / (24 * 60 * 60 * 1000) + 1 + "天";
	}
};
</script>
<style lang="scss" scoped></style>
