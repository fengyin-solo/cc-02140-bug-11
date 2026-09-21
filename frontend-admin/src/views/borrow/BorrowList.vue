<template>
  <div class="borrow-list">
    <h2 class="page-title">借阅管理</h2>

    <!-- 统计卡片 - 丰富内容 -->
    <a-row :gutter="[16, 16]" class="stat-row">
      <a-col :xs="12" :sm="12" :md="6">
        <div class="stat-card-rich total">
          <div class="stat-card-header">
            <div class="stat-card-icon">
              <DatabaseOutlined />
            </div>
            <div class="stat-card-trend up">
              <RiseOutlined />
              <span>{{ todayBorrowCount }}</span>
            </div>
          </div>
          <div class="stat-card-body">
            <div class="stat-card-value">{{ filteredRecords.length }}</div>
            <div class="stat-card-label">总记录</div>
          </div>
          <div class="stat-card-footer">
            <span>今日新增 {{ todayBorrowCount }} 条</span>
          </div>
        </div>
      </a-col>
      <a-col :xs="12" :sm="12" :md="6">
        <div class="stat-card-rich borrowed">
          <div class="stat-card-header">
            <div class="stat-card-icon">
              <BookOutlined />
            </div>
            <div class="stat-card-badge">
              <ClockCircleOutlined />
            </div>
          </div>
          <div class="stat-card-body">
            <div class="stat-card-value">{{ filteredTotalBorrowed }}</div>
            <div class="stat-card-label">借阅中</div>
          </div>
          <div class="stat-card-footer">
            <a-progress
              :percent="borrowedPercent"
              :show-info="false"
              stroke-color="#1890ff"
              size="small"
            />
            <span>占比 {{ borrowedPercent }}%</span>
          </div>
        </div>
      </a-col>
      <a-col :xs="12" :sm="12" :md="6">
        <div class="stat-card-rich returned">
          <div class="stat-card-header">
            <div class="stat-card-icon">
              <CheckCircleOutlined />
            </div>
            <div class="stat-card-badge success">
              <SmileOutlined />
            </div>
          </div>
          <div class="stat-card-body">
            <div class="stat-card-value">{{ returnedCount }}</div>
            <div class="stat-card-label">已归还</div>
          </div>
          <div class="stat-card-footer">
            <a-progress
              :percent="returnedPercent"
              :show-info="false"
              stroke-color="#52c41a"
              size="small"
            />
            <span>归还率 {{ returnedPercent }}%</span>
          </div>
        </div>
      </a-col>
      <a-col :xs="12" :sm="12" :md="6">
        <div class="stat-card-rich overdue">
          <div class="stat-card-header">
            <div class="stat-card-icon">
              <ExclamationCircleOutlined />
            </div>
            <div class="stat-card-badge warning" v-if="filteredTotalOverdue > 0">
              <WarningOutlined />
            </div>
          </div>
          <div class="stat-card-body">
            <div class="stat-card-value">{{ filteredTotalOverdue }}</div>
            <div class="stat-card-label">已逾期</div>
          </div>
          <div class="stat-card-footer">
            <span v-if="filteredTotalOverdue > 0" class="warning-text">
              <AlertOutlined /> 请及时处理
            </span>
            <span v-else class="success-text">
              <CheckOutlined /> 暂无逾期
            </span>
          </div>
        </div>
      </a-col>
    </a-row>

    <!-- 搜索区域 -->
    <div class="search-area animate-slide-down">
      <a-row :gutter="16" align="middle">
        <a-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="search-input-wrapper">
            <a-input
              v-model:value="searchKeyword"
              placeholder="搜索读者、图书、卡号"
              allow-clear
              @input="onSearchInput"
              class="search-input"
            >
              <template #suffix>
                <SearchOutlined 
                  :class="['search-icon', { 'searching': isSearching }]" 
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
            <a-select-option value="borrowed">借阅中</a-select-option>
            <a-select-option value="returned">已归还</a-select-option>
            <a-select-option value="overdue">已逾期</a-select-option>
          </a-select>
        </a-col>
        <a-col :xs="24" :sm="24" :md="8" :lg="12" style="text-align: right;">
          <a-button type="primary" @click="showBorrowModal" class="add-btn">
            <PlusOutlined /> 新增借阅
          </a-button>
        </a-col>
      </a-row>
      <a-row :gutter="16" align="middle" style="margin-top: 16px;">
        <a-col :xs="24" :sm="12" :md="8" :lg="6">
          <a-range-picker
            v-model:value="dateRange"
            :placeholder="['开始日期', '结束日期']"
            allow-clear
            style="width: 100%"
            @change="handleDateRangeChange"
          >
            <template #suffixIcon>
              <CalendarOutlined />
            </template>
          </a-range-picker>
        </a-col>
        <a-col :xs="24" :sm="12" :md="16" :lg="18">
          <span class="filter-hint">
            <CalendarOutlined /> 按借阅日期筛选
          </span>
        </a-col>
      </a-row>
      
      <!-- 搜索结果提示 -->
      <transition name="fade-slide">
        <div v-if="hasFilters" class="search-result-tip">
          <span class="result-count">
            找到 <strong>{{ filteredRecords.length }}</strong> 条结果
          </span>
          <a-button type="link" size="small" @click="clearFilters" class="clear-btn">
            清除筛选
          </a-button>
        </div>
      </transition>
    </div>

    <!-- 借阅表格 -->
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
        :data-source="filteredRecords"
        :loading="loading"
        row-key="id"
        :pagination="{ pageSize: 10, showTotal: total => `共 ${total} 条` }"
        :row-class-name="getRowClassName"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'reader'">
            <div class="reader-cell" :style="{ animationDelay: `${index * 0.05}s` }">
              <div class="text-primary">{{ record.readerName }}</div>
              <div class="text-secondary">{{ record.cardNo }}</div>
            </div>
          </template>
          <template v-else-if="column.key === 'book'">
            <div class="book-cell">
              <div class="text-primary">{{ record.bookTitle }}</div>
              <div class="text-secondary">{{ record.isbn }}</div>
            </div>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)" :class="['status-tag', record.status]">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button
                v-if="record.status === 'borrowed' || record.status === 'overdue'"
                type="link"
                size="small"
                class="table-action-btn return-btn"
                @click="handleReturn(record)"
              >
                <CheckOutlined /> 归还
              </a-button>
              <a-button
                v-if="record.status === 'borrowed' && record.renewCount < 2"
                type="link"
                size="small"
                class="table-action-btn renew-btn"
                @click="handleRenew(record)"
              >
                <ReloadOutlined /> 续借
              </a-button>
              <span v-if="record.status === 'returned'" class="completed-text">
                <CheckCircleOutlined /> 已完成
              </span>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 新增借阅弹窗 -->
    <a-modal
      v-model:open="borrowModalVisible"
      title="新增借阅"
      :confirm-loading="submitLoading"
      @ok="handleBorrowSubmit"
      @cancel="handleModalClose"
      width="500px"
    >
      <a-form
        ref="borrowFormRef"
        :model="borrowForm"
        :rules="borrowRules"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="读者" name="readerId">
          <a-select
            v-model:value="borrowForm.readerId"
            placeholder="请选择读者"
            show-search
            :filter-option="filterReader"
          >
            <a-select-option
              v-for="reader in availableReaders"
              :key="reader.id"
              :value="reader.id"
              :label="reader.name"
            >
              {{ reader.name }} ({{ reader.cardNo }})
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="图书" name="bookId">
          <a-select
            v-model:value="borrowForm.bookId"
            placeholder="请选择图书"
            show-search
            :filter-option="filterBook"
          >
            <a-select-option
              v-for="book in availableBooks"
              :key="book.id"
              :value="book.id"
              :label="book.title"
            >
              {{ book.title }} (库存: {{ book.available }})
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import {
  PlusOutlined,
  CheckOutlined,
  ReloadOutlined,
  DatabaseOutlined,
  BookOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  RiseOutlined,
  ClockCircleOutlined,
  SmileOutlined,
  WarningOutlined,
  AlertOutlined,
  SearchOutlined,
  CalendarOutlined
} from '@ant-design/icons-vue'
import { useBorrowStore } from '@/stores/borrow'
import { useReaderStore } from '@/stores/reader'
import { useBookStore } from '@/stores/book'

const borrowStore = useBorrowStore()
const readerStore = useReaderStore()
const bookStore = useBookStore()

const loading = ref(false)
const searchKeyword = ref('')
const selectedStatus = ref(null)
const dateRange = ref(null)
const borrowModalVisible = ref(false)
const submitLoading = ref(false)
const borrowFormRef = ref(null)
const isSearching = ref(false)
const tableAnimating = ref(false)
let searchTimeout = null

const columns = [
  { title: '读者信息', key: 'reader', width: 160 },
  { title: '图书信息', key: 'book', width: 200 },
  { title: '借阅日期', dataIndex: 'borrowDate', key: 'borrowDate', width: 110 },
  { title: '应还日期', dataIndex: 'dueDate', key: 'dueDate', width: 110 },
  { title: '归还日期', dataIndex: 'returnDate', key: 'returnDate', width: 110 },
  { title: '续借次数', dataIndex: 'renewCount', key: 'renewCount', width: 90 },
  { title: '状态', key: 'status', width: 90 },
  { title: '操作', key: 'action', width: 140, fixed: 'right' }
]

const borrowForm = reactive({
  readerId: null,
  bookId: null
})

const borrowRules = {
  readerId: [{ required: true, message: '请选择读者' }],
  bookId: [{ required: true, message: '请选择图书' }]
}

const hasFilters = computed(() => {
  return searchKeyword.value || selectedStatus.value || dateRange.value
})

const filteredRecords = computed(() => {
  // 使用派生最终状态作为统一数据源，列表回显与统计、馆藏数量保持一致
  let result = borrowStore.recordsWithStatus

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(record =>
      record.readerName.toLowerCase().includes(keyword) ||
      record.bookTitle.toLowerCase().includes(keyword) ||
      record.cardNo.toLowerCase().includes(keyword)
    )
  }

  if (selectedStatus.value) {
    result = result.filter(record => record.status === selectedStatus.value)
  }

  if (dateRange.value && dateRange.value.length === 2) {
    const startDate = dateRange.value[0].format('YYYY-MM-DD')
    const endDate = dateRange.value[1].format('YYYY-MM-DD')
    result = result.filter(record => {
      return record.borrowDate >= startDate && record.borrowDate <= endDate
    })
  }

  return result
})

const filteredTotalBorrowed = computed(() => {
  return filteredRecords.value.filter(r => r.status === 'borrowed').length
})

const filteredTotalOverdue = computed(() => {
  return filteredRecords.value.filter(r => r.status === 'overdue').length
})

const returnedCount = computed(() => {
  return filteredRecords.value.filter(r => r.status === 'returned').length
})

const todayBorrowCount = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return filteredRecords.value.filter(r => r.borrowDate === today).length
})

const borrowedPercent = computed(() => {
  const total = filteredRecords.value.length
  if (total === 0) return 0
  return Math.round((filteredTotalBorrowed.value / total) * 100)
})

const returnedPercent = computed(() => {
  const total = filteredRecords.value.length
  if (total === 0) return 0
  return Math.round((returnedCount.value / total) * 100)
})

const availableReaders = computed(() => {
  return readerStore.readers.filter(r =>
    r.status === 'active' && r.borrowCount < r.maxBorrow
  )
})

const availableBooks = computed(() => {
  return bookStore.books.filter(b => b.available > 0)
})

function getStatusColor(status) {
  const colors = {
    borrowed: 'processing',
    returned: 'success',
    overdue: 'error'
  }
  return colors[status] || 'default'
}

function getStatusText(status) {
  const texts = {
    borrowed: '借阅中',
    returned: '已归还',
    overdue: '已逾期'
  }
  return texts[status] || status
}

function filterReader(input, option) {
  return option.label.toLowerCase().includes(input.toLowerCase())
}

function filterBook(input, option) {
  return option.label.toLowerCase().includes(input.toLowerCase())
}

function handleStatusChange() {
  triggerSearchAnimation()
}

function handleDateRangeChange() {
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
  dateRange.value = null
  triggerSearchAnimation()
}

// 获取行样式类名
function getRowClassName(record, index) {
  return `table-row-animate row-${index}`
}

function handleModalClose() {
  nextTick(() => {
    borrowFormRef.value?.resetFields()
  })
}

function showBorrowModal() {
  borrowForm.readerId = null
  borrowForm.bookId = null
  borrowModalVisible.value = true
  nextTick(() => {
    borrowFormRef.value?.clearValidate()
  })
}

async function handleBorrowSubmit() {
  if (submitLoading.value) return
  try {
    await borrowFormRef.value.validate()
    submitLoading.value = true

    await new Promise(resolve => setTimeout(resolve, 500))

    // 借阅记录、馆藏可借数量、读者已借数由 store 原子提交，避免部分失败
    const result = borrowStore.borrowBook({
      readerId: borrowForm.readerId,
      bookId: borrowForm.bookId
    })

    if (!result.success) {
      if (result.reason === 'unavailable') {
        message.error('该图书库存不足，无法借阅')
      } else if (result.reason === 'pending') {
        message.warning('操作进行中，请勿重复提交')
      } else {
        message.error('读者或图书信息不存在')
      }
      return
    }

    message.success('借阅成功')
    borrowModalVisible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    submitLoading.value = false
  }
}

function handleReturn(record) {
  const result = borrowStore.returnBook(record.id)
  if (result.success) {
    message.success('归还成功')
  } else if (result.reason === 'already-returned') {
    message.info('该记录已归还，请勿重复操作')
  } else if (result.reason === 'pending') {
    message.warning('操作进行中，请稍候')
  } else {
    message.error('归还失败，请重试')
  }
}

function handleRenew(record) {
  const result = borrowStore.renewBook(record.id)
  if (result.success) {
    message.success('续借成功，借阅期限延长15天')
  } else if (result.reason === 'max-renewed') {
    message.error('续借失败，已达到最大续借次数')
  } else if (result.reason === 'already-returned') {
    message.info('该记录已归还，无法续借')
  } else if (result.reason === 'pending') {
    message.warning('操作进行中，请稍候')
  } else {
    message.error('续借失败，请重试')
  }
}
</script>

<style lang="less" scoped>
.borrow-list {
  .page-title {
    font-size: 20px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 24px;
  }
}

.stat-row {
  margin-bottom: 16px;
}

.stat-card-rich {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
  height: 100%;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    background: #f0f7ff;
  }

  &.total {
    border-left-color: #667eea;
    .stat-card-icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .stat-card-value { color: #667eea; }
  }

  &.borrowed {
    border-left-color: #1890ff;
    .stat-card-icon { background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%); }
    .stat-card-value { color: #1890ff; }
  }

  &.returned {
    border-left-color: #52c41a;
    .stat-card-icon { background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%); }
    .stat-card-value { color: #52c41a; }
  }

  &.overdue {
    border-left-color: #ff4d4f;
    .stat-card-icon { background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%); }
    .stat-card-value { color: #ff4d4f; }
  }

  .stat-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .stat-card-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      color: #fff;
    }

    .stat-card-trend {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 12px;

      &.up {
        background: #f6ffed;
        color: #52c41a;
      }
    }

    .stat-card-badge {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      background: #e6f7ff;
      color: #1890ff;

      &.success {
        background: #f6ffed;
        color: #52c41a;
      }

      &.warning {
        background: #fff2e8;
        color: #fa541c;
        animation: pulse 1.5s infinite;
      }
    }
  }

  .stat-card-body {
    margin-bottom: 12px;

    .stat-card-value {
      font-size: 32px;
      font-weight: 700;
      line-height: 1.2;
    }

    .stat-card-label {
      font-size: 14px;
      color: #999;
      margin-top: 4px;
    }
  }

  .stat-card-footer {
    font-size: 12px;
    color: #999;
    padding-top: 12px;
    border-top: 1px dashed #f0f0f0;

    :deep(.ant-progress) {
      margin-bottom: 4px;
    }

    .warning-text {
      color: #fa541c;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .success-text {
      color: #52c41a;
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

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
        box-shadow: 0 0 0 2px rgba(250, 173, 20, 0.2);
      }
    }
    
    .search-icon {
      color: rgba(0, 0, 0, 0.45);
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        color: #faad14;
        transform: scale(1.1);
      }
      
      &.searching {
        animation: pulse 0.5s ease-in-out infinite;
        color: #faad14;
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
  
  .filter-hint {
    font-size: 13px;
    color: #999;
    display: flex;
    align-items: center;
    gap: 4px;
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
        color: #faad14;
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
        border-top-color: #faad14;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      
      span {
        color: #faad14;
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

    &.return-btn:hover,
    &.renew-btn:hover {
      color: #1890ff;
      background: #e6f7ff;
    }
  }
  
  .completed-text {
    color: #52c41a;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.reader-cell,
.book-cell {
  // 保持默认样式
}

.text-primary {
  font-weight: 500;
  color: #1a1a1a;
}

.text-secondary {
  font-size: 12px;
  color: #999;
}

.status-tag {
  // 保持默认样式
}
</style>
