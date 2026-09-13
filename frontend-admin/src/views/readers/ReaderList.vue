<template>
  <div class="reader-list">
    <h2 class="page-title animate-fade-in">读者管理</h2>

    <!-- 搜索区域 -->
    <div class="search-area animate-slide-down">
      <a-row :gutter="16" align="middle">
        <a-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="search-input-wrapper">
            <a-input
              v-model:value="searchKeyword"
              placeholder="搜索姓名、卡号、手机号"
              allow-clear
              @press-enter="handleSearch"
              @input="onSearchInput"
              class="search-input"
            >
              <template #suffix>
                <SearchOutlined 
                  :class="['search-icon', { 'searching': isSearching }]" 
                  @click="handleSearch" 
                />
              </template>
            </a-input>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :md="8" :lg="6">
          <a-select
            v-model:value="selectedStatus"
            placeholder="选择状态"
            allow-clear
            style="width: 100%"
            @change="handleStatusChange"
          >
            <a-select-option value="active">正常</a-select-option>
            <a-select-option value="expired">已过期</a-select-option>
          </a-select>
        </a-col>
        <a-col :xs="24" :sm="24" :md="8" :lg="12" style="text-align: right;">
          <a-button type="primary" @click="showAddModal" class="add-btn">
            <PlusOutlined /> 新增读者
          </a-button>
        </a-col>
      </a-row>
      
      <!-- 搜索结果提示 -->
      <transition name="fade-slide">
        <div v-if="searchKeyword || selectedStatus" class="search-result-tip">
          <span class="result-count">
            找到 <strong>{{ filteredReaders.length }}</strong> 条结果
          </span>
          <a-button type="link" size="small" @click="clearFilters" class="clear-btn">
            清除筛选
          </a-button>
        </div>
      </transition>
    </div>

    <!-- 读者表格 -->
    <div :class="['table-container', 'animate-fade-in', { 'table-loading': tableAnimating }]">
      <!-- 加载动画遮罩 -->
      <transition name="fade">
        <div v-if="tableAnimating" class="table-loading-overlay">
          <div class="loading-spinner">
            <div class="spinner-ring"></div>
            <span>搜索中...</span>
          </div>
        </div>
      </transition>
      
      <a-table
        :columns="columns"
        :data-source="filteredReaders"
        :loading="loading"
        row-key="id"
        :pagination="{ pageSize: 10, showTotal: total => `共 ${total} 条` }"
        :row-class-name="getRowClassName"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'reader'">
            <div class="reader-cell" :style="{ animationDelay: `${index * 0.05}s` }">
              <a-avatar 
                :style="{ backgroundColor: getAvatarColor(record.id) }"
                class="reader-avatar"
              >
                {{ record.name.charAt(0) }}
              </a-avatar>
              <div class="reader-detail">
                <div class="reader-name">{{ record.name }}</div>
                <div class="reader-card">{{ record.cardNo }}</div>
              </div>
            </div>
          </template>
          <template v-else-if="column.key === 'type'">
            <a-tag :color="record.type === '教师' ? 'purple' : 'cyan'" class="type-tag">
              {{ record.type }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-badge
              :status="record.status === 'active' ? 'success' : 'error'"
              :text="record.status === 'active' ? '正常' : '已过期'"
              :class="['status-badge', record.status]"
            />
          </template>
          <template v-else-if="column.key === 'borrow'">
            <div class="borrow-cell">
              <span class="borrow-value">{{ record.borrowCount }} / {{ record.maxBorrow }}</span>
              <div class="borrow-bar">
                <div 
                  class="borrow-bar-fill" 
                  :style="{ 
                    width: `${(record.borrowCount / record.maxBorrow) * 100}%`,
                    backgroundColor: record.borrowCount >= record.maxBorrow ? '#ff4d4f' : '#1890ff'
                  }"
                ></div>
              </div>
            </div>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" class="table-action-btn edit-btn" @click="showEditModal(record)">
                <EditOutlined /> 编辑
              </a-button>
              <a-button type="link" size="small" class="table-action-btn detail-btn" @click="showDetailModal(record)">
                <EyeOutlined /> 详情
              </a-button>
              <a-popconfirm
                title="确定要删除这个读者吗？"
                ok-text="确定"
                cancel-text="取消"
                @confirm="handleDelete(record.id)"
              >
                <a-button type="link" size="small" danger class="table-action-btn delete-btn">
                  <DeleteOutlined /> 删除
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="isEdit ? '编辑读者' : '新增读者'"
      :confirm-loading="submitLoading"
      @ok="handleSubmit"
      @cancel="handleModalClose"
      width="560px"
    >
      <a-form
        ref="formRef"
        :model="formState"
        :rules="rules"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="姓名" name="name">
          <a-input v-model:value="formState.name" placeholder="请输入姓名" />
        </a-form-item>
        <a-form-item label="性别" name="gender">
          <a-radio-group v-model:value="formState.gender">
            <a-radio value="男">男</a-radio>
            <a-radio value="女">女</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="手机号" name="phone">
          <a-input v-model:value="formState.phone" placeholder="请输入手机号" maxlength="11" />
        </a-form-item>
        <a-form-item label="邮箱" name="email">
          <a-input v-model:value="formState.email" placeholder="请输入邮箱" />
        </a-form-item>
        <a-form-item label="类型" name="type">
          <a-select v-model:value="formState.type" placeholder="请选择类型">
            <a-select-option value="学生">学生</a-select-option>
            <a-select-option value="教师">教师</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="院系" name="department">
          <a-input v-model:value="formState.department" placeholder="请输入院系" />
        </a-form-item>
        <a-form-item label="有效期至" name="expireDate">
          <a-date-picker
            v-model:value="formState.expireDate"
            style="width: 100%"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 详情弹窗 -->
    <a-modal
      v-model:open="detailVisible"
      title="读者详情"
      :footer="null"
      width="500px"
    >
      <a-descriptions :column="1" bordered size="small" v-if="currentReader">
        <a-descriptions-item label="卡号">{{ currentReader.cardNo }}</a-descriptions-item>
        <a-descriptions-item label="姓名">{{ currentReader.name }}</a-descriptions-item>
        <a-descriptions-item label="性别">{{ currentReader.gender }}</a-descriptions-item>
        <a-descriptions-item label="类型">{{ currentReader.type }}</a-descriptions-item>
        <a-descriptions-item label="院系">{{ currentReader.department }}</a-descriptions-item>
        <a-descriptions-item label="手机号">{{ currentReader.phone }}</a-descriptions-item>
        <a-descriptions-item label="邮箱">{{ currentReader.email }}</a-descriptions-item>
        <a-descriptions-item label="注册日期">{{ currentReader.registerDate }}</a-descriptions-item>
        <a-descriptions-item label="有效期至">{{ currentReader.expireDate }}</a-descriptions-item>
        <a-descriptions-item label="借阅情况">
          {{ currentReader.borrowCount }} / {{ currentReader.maxBorrow }}
        </a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-badge
            :status="currentReader.status === 'active' ? 'success' : 'error'"
            :text="currentReader.status === 'active' ? '正常' : '已过期'"
          />
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons-vue'
import { useReaderStore } from '@/stores/reader'

const readerStore = useReaderStore()

const loading = ref(false)
const searchKeyword = ref('')
const selectedStatus = ref(null)
const modalVisible = ref(false)
const detailVisible = ref(false)
const submitLoading = ref(false)
const isEdit = ref(false)
const editingId = ref(null)
const formRef = ref(null)
const currentReader = ref(null)
const isSearching = ref(false)
const tableAnimating = ref(false)
let searchTimeout = null

const columns = [
  { title: '读者信息', key: 'reader', width: 200 },
  { title: '类型', key: 'type', width: 80 },
  { title: '院系', dataIndex: 'department', key: 'department', width: 120 },
  { title: '手机号', dataIndex: 'phone', key: 'phone', width: 120 },
  { title: '借阅', key: 'borrow', width: 80 },
  { title: '有效期至', dataIndex: 'expireDate', key: 'expireDate', width: 110 },
  { title: '状态', key: 'status', width: 80 },
  { title: '操作', key: 'action', width: 180, fixed: 'right' }
]

const formState = reactive({
  name: '',
  gender: '男',
  phone: '',
  email: '',
  type: '学生',
  department: '',
  expireDate: ''
})

// 手机号验证
const validatePhone = (rule, value) => {
  if (!value) {
    return Promise.reject('请输入手机号')
  }
  const phoneReg = /^1[3-9]\d{9}$/
  if (!phoneReg.test(value)) {
    return Promise.reject('请输入正确的手机号格式')
  }
  return Promise.resolve()
}

// 邮箱验证
const validateEmail = (rule, value) => {
  if (!value) {
    return Promise.resolve()
  }
  const emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailReg.test(value)) {
    return Promise.reject('请输入正确的邮箱格式')
  }
  return Promise.resolve()
}

const rules = {
  name: [{ required: true, message: '请输入姓名' }],
  phone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
  email: [{ validator: validateEmail, trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型' }],
  expireDate: [{ required: true, message: '请选择有效期' }]
}

const avatarColors = ['#1890ff', '#52c41a', '#faad14', '#722ed1', '#eb2f96', '#13c2c2']

function getAvatarColor(id) {
  return avatarColors[(id - 1) % avatarColors.length]
}

const filteredReaders = computed(() => {
  let result = readerStore.readers

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(reader =>
      reader.name.toLowerCase().includes(keyword) ||
      reader.cardNo.toLowerCase().includes(keyword) ||
      reader.phone.includes(keyword)
    )
  }

  if (selectedStatus.value) {
    result = result.filter(reader => reader.status === selectedStatus.value)
  }

  return result
})

function handleSearch() {
  triggerSearchAnimation()
}

function handleStatusChange() {
  triggerSearchAnimation()
}

// 搜索输入时的动画效果
function onSearchInput() {
  isSearching.value = true
  
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  searchTimeout = setTimeout(() => {
    isSearching.value = false
    triggerSearchAnimation()
  }, 300)
}

// 触发表格搜索动画和loading
function triggerSearchAnimation() {
  loading.value = true
  tableAnimating.value = true
  setTimeout(() => {
    tableAnimating.value = false
    loading.value = false
  }, 600)
}

// 清除筛选
function clearFilters() {
  searchKeyword.value = ''
  selectedStatus.value = null
  triggerSearchAnimation()
}

// 获取行样式类名
function getRowClassName(record, index) {
  return `table-row-animate row-${index}`
}

function resetForm() {
  Object.assign(formState, {
    name: '',
    gender: '男',
    phone: '',
    email: '',
    type: '学生',
    department: '',
    expireDate: ''
  })
}

function handleModalClose() {
  nextTick(() => {
    formRef.value?.resetFields()
  })
}

function showAddModal() {
  isEdit.value = false
  editingId.value = null
  resetForm()
  modalVisible.value = true
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

function showEditModal(record) {
  isEdit.value = true
  editingId.value = record.id
  Object.assign(formState, {
    name: record.name,
    gender: record.gender,
    phone: record.phone,
    email: record.email,
    type: record.type,
    department: record.department,
    expireDate: record.expireDate
  })
  modalVisible.value = true
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

function showDetailModal(record) {
  currentReader.value = record
  detailVisible.value = true
}

async function handleSubmit() {
  try {
    await formRef.value.validate()
    submitLoading.value = true

    await new Promise(resolve => setTimeout(resolve, 500))

    const readerData = {
      ...formState,
      status: new Date(formState.expireDate) > new Date() ? 'active' : 'expired',
      borrowCount: 0,
      maxBorrow: formState.type === '教师' ? 10 : 5,
      registerDate: new Date().toISOString().split('T')[0]
    }

    if (isEdit.value) {
      readerStore.updateReader(editingId.value, readerData)
      message.success('读者信息更新成功')
    } else {
      readerStore.addReader(readerData)
      message.success('读者添加成功')
    }

    modalVisible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    submitLoading.value = false
  }
}

function handleDelete(id) {
  readerStore.deleteReader(id)
  message.success('读者删除成功')
}
</script>

<style lang="less" scoped>
// ========================================
// 动画定义
// ========================================
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes rowFadeIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes barGrow {
  from { width: 0; }
}

@keyframes expandWidth {
  to { width: 100%; }
}

// ========================================
// 动画类
// ========================================
.animate-fade-in {
  animation: fadeIn 0.5s ease-out both;
}

.animate-slide-down {
  animation: slideDown 0.5s ease-out both;
}

// ========================================
// 过渡动画
// ========================================
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

// ========================================
// 主样式
// ========================================
.reader-list {
  .page-title {
    font-size: 20px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 24px;
    position: relative;
    display: inline-block;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 0;
      height: 3px;
      background: linear-gradient(90deg, #52c41a, #73d13d);
      border-radius: 2px;
      animation: expandWidth 0.8s ease-out 0.3s forwards;
    }
  }
}

.search-area {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
  
  .search-input-wrapper {
    position: relative;
    
    .search-input {
      transition: all 0.3s ease;
      
      &:focus-within {
        box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.2);
      }
    }
    
    .search-icon {
      color: rgba(0, 0, 0, 0.45);
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        color: #52c41a;
        transform: scale(1.1);
      }
      
      &.searching {
        animation: pulse 0.5s ease-in-out infinite;
        color: #52c41a;
      }
    }
  }
  
  .add-btn {
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
    }
  }
  
  .search-result-tip {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px dashed #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .result-count {
      color: #666;
      font-size: 13px;
      
      strong {
        color: #52c41a;
        font-size: 16px;
        margin: 0 4px;
      }
    }
    
    .clear-btn {
      font-size: 13px;
      
      &:hover {
        color: #ff4d4f;
      }
    }
  }
}

.table-container {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 20px;
  position: relative;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
  
  &.table-loading {
    .ant-table {
      filter: blur(2px);
      pointer-events: none;
    }
  }
  
  .table-loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    border-radius: 12px;
    
    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      
      .spinner-ring {
        width: 40px;
        height: 40px;
        border: 3px solid #f0f0f0;
        border-top-color: #52c41a;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      
      span {
        color: #52c41a;
        font-size: 14px;
      }
    }
  }

  // 表格行样式
  :deep(.ant-table-tbody) {
    .ant-table-row {
      &:hover td {
        background: #fafafa !important;
      }
    }
  }

  .table-action-btn {
    padding: 2px 4px;
    height: auto;
    border-radius: 4px;
    transition: all 0.2s ease;

    &.edit-btn:hover,
    &.detail-btn:hover {
      color: #1890ff;
      background: #e6f7ff;
    }

    &.delete-btn:hover {
      color: #ff4d4f;
      background: #fff1f0;
    }
  }
}

.reader-cell {
  display: flex;
  align-items: center;

  .reader-avatar {
    margin-right: 12px;
  }

  .reader-detail {
    .reader-name {
      font-weight: 500;
      color: #1a1a1a;
      margin-bottom: 2px;
    }

    .reader-card {
      font-size: 12px;
      color: #999;
    }
  }
}

.type-tag {
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
}

.status-badge {
  &.expired {
    :deep(.ant-badge-status-dot) {
      // 保持默认
    }
  }
}

.borrow-cell {
  .borrow-value {
    display: block;
    margin-bottom: 4px;
  }
  
  .borrow-bar {
    width: 60px;
    height: 4px;
    background: #f0f0f0;
    border-radius: 2px;
    overflow: hidden;
    
    .borrow-bar-fill {
      height: 100%;
      border-radius: 2px;
    }
  }
}
</style>
