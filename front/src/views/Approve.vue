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
			<el-table :data="leaveList">
				<el-table-column
					v-for="item in columns"
					:key="item.prop"
					:prop="item.prop"
					:label="item.label"
					:width="item.width"
					:formatter="item.formatter"
				/>
				<el-table-column label="操作" width="150">
					<template #default="scope">
						<el-button
							size="small"
							type="danger"
							@click="handleDetail(scope.row)"
							v-if="scope.row.curAuditUserName == userInfo.userName && [1, 2].includes(scope.row.applyState)"
							>审核</el-button
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
		<el-dialog title="审核" width="50%" v-model="showDetailModal" destroy-on-close>
			<el-form label-width="120px" label-suffix=":" ref="dialogForm" :model="auditForm" :rules="rules">
				<el-form-item label="申请人">
					<div>{{ detail.applyUser.userName }}</div>
				</el-form-item>
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
				<el-form-item label="备注" prop="remark">
					<el-input type="textarea" :rows="3" placeholder="请输入审核备注" v-model="auditForm.remark" />
				</el-form-item>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="handleApprove(dialogForm, 'pass')">审核通过</el-button>
					<el-button @click="handleApprove(dialogForm, 'refuse')" type="primary">驳回</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>
<script setup>
// 导入vuex
import store from "@/store";
import { useStore } from "vuex";
import { onMounted, reactive, ref, toRaw, nextTick } from "vue";
// 导入api
import api from "@/api";
// 引入ElMessage
import { ElMessage } from "element-plus";
// 引入util
import util from "@/utils/util.js";
// 从vuex中获取用户信息
const userInfo = useStore().state.userInfo;
const auditForm = reactive({
	remark: "",
});
// 表单引用
const formRef = ref();
const tree = ref();
let detail = ref({});
const showDetailModal = ref(false);
const columns = reactive([
	{
		label: "单号",
		prop: "orderNo",
	},
	{
		label: "申请人",
		prop: "",
		formatter(row) {
			return row.applyUser.userName;
		},
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
const dialogForm = reactive({});
const rules = {
	remark: [
		{
			required: true,
			message: "请输入审核备注",
			trigger: "change",
		},
	],
};
const pager = ref({
	total: 0,
	pageNum: 1,
	pageSize: 10,
});
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
// 获取审批列表
const getLeaveList = async () => {
	const params = { ...toRaw(queryForm), ...pager.value, type: "approve" };
	if (!params.leaveName) {
		delete params.leaveName;
	}
	const { list, page } = await api.getLeaveList(params);
	leaveList.value = list;
	pager.value = page;
};
onMounted(() => {
	getLeaveList();
});
// 添加审批
const addLeave = () => {
	action.value = "add";
	actionName.value = "添加";
	showDetailModal.value = true;
};
const handleQuery = () => {
	getLeaveList();
};
const handleClose = (formRef) => {
	// 关闭对话框
	showDetailModal.value = false;
	// 重置表单
	handleReset(formRef);
};
const handleCurrentChange = (val) => {
	pager.value.pageNum = val;
	getLeaveList();
};
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
// 审核触发的函数, action: pass:通过 refuse:驳回
const handleApprove = (formRef, action) => {
	// 表单验证
	formRef.validate((valid) => {
		// 如果验证通过
		if (valid) {
			// 拼接参数
			let params = {
				action,
				remark: auditForm.remark,
				_id: detail.value._id,
			};
			try {
				// 调用接口
				api.leaveApprove(params);
				// 关闭弹框
				handleClose(formRef);
				// 提示
				ElMessage.success("处理成功");
				// 重新获取列表
				getLeaveList();
				store.commit("saveNoticeCount", store.state.noticeCount - 1);
			} catch (error) {
				console.log(error);
			}
		}
	});
};
</script>
<style lang="scss" scoped></style>
