<template>
  <div class="book-list">
    <h2 class="page-title animate-fade-in">图书管理</h2>

    <!-- 搜索区域 -->
    <div class="search-area animate-slide-down">
      <a-row :gutter="16" align="middle">
        <a-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="search-input-wrapper">
            <a-input
              v-model:value="searchKeyword"
              placeholder="搜索书名、作者、ISBN"
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
            v-model:value="selectedCategory"
            placeholder="选择分类"
            allow-clear
            style="width: 100%"
            @change="handleCategoryChange"
            class="category-select"
          >
            <a-select-option
              v-for="cat in categoryStore.categories"
              :key="cat.id"
              :value="cat.id"
            >
              {{ cat.name }}
            </a-select-option>
          </a-select>
        </a-col>
        <a-col :xs="24" :sm="24" :md="8" :lg="12" style="text-align: right;">
          <a-button type="primary" @click="showAddModal" class="add-btn">
            <PlusOutlined /> 新增图书
          </a-button>
        </a-col>
      </a-row>
      
      <!-- 搜索结果提示 -->
      <transition name="fade-slide">
        <div v-if="searchKeyword || selectedCategory" class="search-result-tip">
          <span class="result-count">
            找到 <strong>{{ filteredBooks.length }}</strong> 条结果
          </span>
          <a-button type="link" size="small" @click="clearFilters" class="clear-btn">
            清除筛选
          </a-button>
        </div>
      </transition>
    </div>

    <!-- 图书表格 -->
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
        :data-source="filteredBooks"
        :loading="loading"
        row-key="id"
        :pagination="{ pageSize: 10, showTotal: total => `共 ${total} 条` }"
        :row-class-name="getRowClassName"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'book'">
            <div class="book-cell">
              <div class="book-thumb-wrapper">
                <img :src="record.cover" :alt="record.title" class="book-thumb" />
              </div>
              <div class="book-detail">
                <div class="book-name">{{ record.title }}</div>
                <div class="book-isbn">ISBN: {{ record.isbn }}</div>
              </div>
            </div>
          </template>
          <template v-else-if="column.key === 'category'">
            <a-tag color="blue" class="category-tag">{{ record.categoryName }}</a-tag>
          </template>
          <template v-else-if="column.key === 'stock'">
            <div class="stock-cell">
              <span :class="['stock-value', { 'low-stock': record.available < 3 }]">
                {{ record.available }} / {{ record.total }}
              </span>
              <div class="stock-bar">
                <div 
                  class="stock-bar-fill" 
                  :style="{ 
                    width: `${(record.available / record.total) * 100}%`,
                    backgroundColor: record.available < 3 ? '#ff4d4f' : '#52c41a'
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
              <a-popconfirm
                title="确定要删除这本图书吗？"
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
      :title="isEdit ? '编辑图书' : '新增图书'"
      :confirm-loading="submitLoading"
      @ok="handleSubmit"
      @cancel="handleModalClose"
      width="640px"
    >
      <a-form
        ref="formRef"
        :model="formState"
        :rules="rules"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="ISBN" name="isbn">
          <a-input v-model:value="formState.isbn" placeholder="请输入ISBN" />
        </a-form-item>
        <a-form-item label="书名" name="title">
          <a-input v-model:value="formState.title" placeholder="请输入书名" />
        </a-form-item>
        <a-form-item label="作者" name="author">
          <a-input v-model:value="formState.author" placeholder="请输入作者" />
        </a-form-item>
        <a-form-item label="出版社" name="publisher">
          <a-input v-model:value="formState.publisher" placeholder="请输入出版社" />
        </a-form-item>
        <a-form-item label="分类" name="categoryId">
          <a-select v-model:value="formState.categoryId" placeholder="请选择分类">
            <a-select-option
              v-for="cat in categoryStore.categories"
              :key="cat.id"
              :value="cat.id"
            >
              {{ cat.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-row>
          <a-col :span="12">
            <a-form-item label="价格" name="price" :label-col="{ span: 10 }" :wrapper-col="{ span: 12 }">
              <a-input-number
                v-model:value="formState.price"
                :min="0"
                :precision="2"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="库存" name="total" :label-col="{ span: 10 }" :wrapper-col="{ span: 12 }">
              <a-input-number
                v-model:value="formState.total"
                :min="0"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="存放位置" name="location">
          <a-input v-model:value="formState.location" placeholder="如：A区-01-03" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick, watch } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons-vue'
import { useBookStore } from '@/stores/book'
import { useCategoryStore } from '@/stores/category'

const bookStore = useBookStore()
const categoryStore = useCategoryStore()

const loading = ref(false)
const searchKeyword = ref('')
const selectedCategory = ref(null)
const modalVisible = ref(false)
const submitLoading = ref(false)
const isEdit = ref(false)
const editingId = ref(null)
const formRef = ref(null)
const isSearching = ref(false)
const tableAnimating = ref(false)
let searchTimeout = null

const columns = [
  { title: '图书信息', key: 'book', width: 280 },
  { title: '作者', dataIndex: 'author', key: 'author', width: 120 },
  { title: '分类', key: 'category', width: 100 },
  { title: '出版社', dataIndex: 'publisher', key: 'publisher', ellipsis: true },
  { title: '价格', dataIndex: 'price', key: 'price', width: 80 },
  { title: '库存', key: 'stock', width: 80 },
  { title: '位置', dataIndex: 'location', key: 'location', width: 100 },
  { title: '操作', key: 'action', width: 150, fixed: 'right' }
]

const formState = reactive({
  isbn: '',
  title: '',
  author: '',
  publisher: '',
  categoryId: null,
  price: 0,
  total: 1,
  location: ''
})

const rules = {
  isbn: [{ required: true, message: '请输入ISBN' }],
  title: [{ required: true, message: '请输入书名' }],
  author: [{ required: true, message: '请输入作者' }],
  categoryId: [{ required: true, message: '请选择分类' }]
}

const filteredBooks = computed(() => {
  let result = bookStore.books

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(book =>
      book.title.toLowerCase().includes(keyword) ||
      book.author.toLowerCase().includes(keyword) ||
      book.isbn.includes(keyword)
    )
  }

  if (selectedCategory.value) {
    result = result.filter(book => book.categoryId === selectedCategory.value)
  }

  return result
})

function handleSearch() {
  triggerSearchAnimation()
}

function handleCategoryChange() {
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
  selectedCategory.value = null
  triggerSearchAnimation()
}

// 获取行样式类名
function getRowClassName(record, index) {
  return `table-row-animate row-${index}`
}

// 表格变化处理
function handleTableChange() {
  triggerSearchAnimation()
}

function resetForm() {
  Object.assign(formState, {
    isbn: '',
    title: '',
    author: '',
    publisher: '',
    categoryId: null,
    price: 0,
    total: 1,
    location: ''
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
    isbn: record.isbn,
    title: record.title,
    author: record.author,
    publisher: record.publisher,
    categoryId: record.categoryId,
    price: record.price,
    total: record.total,
    location: record.location
  })
  modalVisible.value = true
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

// 导入本地封面图片
import hlmCover from '@/views/img/hlm.webp'
import jsCover from '@/views/img/js.webp'
import sgyyCover from '@/views/img/sgyy.webp'
import vueCover from '@/views/img/vue.jpeg'
import sjCover from '@/views/img/sj.webp'
import jjxCover from '@/views/img/jjx.webp'
import xlxCover from '@/views/img/xlx.webp'
import sxCover from '@/views/img/sx.webp'

// 默认书籍封面图片（使用本地图片）
const DEFAULT_COVERS = [
  hlmCover,
  jsCover,
  sgyyCover,
  vueCover,
  sjCover,
  jjxCover,
  xlxCover,
  sxCover
]

async function handleSubmit() {
  try {
    await formRef.value.validate()
    submitLoading.value = true

    const category = categoryStore.getCategoryById(formState.categoryId)

    // 使用真实书籍封面图片
    const randomCover = DEFAULT_COVERS[Math.floor(Math.random() * DEFAULT_COVERS.length)]

    const bookData = {
      ...formState,
      categoryName: category?.name || '',
      available: isEdit.value ? undefined : formState.total,
      cover: isEdit.value ? (bookStore.getBookById(editingId.value)?.cover || randomCover) : randomCover
    }

    // 编辑时不覆盖 available
    if (isEdit.value) {
      delete bookData.available
    }

    await new Promise(resolve => setTimeout(resolve, 500))

    if (isEdit.value) {
      bookStore.updateBook(editingId.value, bookData)
      message.success('图书更新成功')
    } else {
      bookStore.addBook(bookData)
      message.success('图书添加成功')
    }

    modalVisible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    submitLoading.value = false
  }
}

function handleDelete(id) {
  bookStore.deleteBook(id)
  message.success('图书删除成功')
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

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
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

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
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

@keyframes stockBarGrow {
  from { width: 0; }
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
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

.animate-slide-up {
  animation: slideUp 0.5s ease-out both;
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
.book-list {
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
      background: linear-gradient(90deg, #1890ff, #40a9ff);
      border-radius: 2px;
      animation: expandWidth 0.8s ease-out 0.3s forwards;
    }
  }
}

@keyframes expandWidth {
  to { width: 100%; }
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
        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
      }
    }
    
    .search-icon {
      color: rgba(0, 0, 0, 0.45);
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        color: #1890ff;
        transform: scale(1.1);
      }
      
      &.searching {
        animation: pulse 0.5s ease-in-out infinite;
        color: #1890ff;
      }
    }
  }
  
  .category-select {
    transition: all 0.3s ease;
  }
  
  .add-btn {
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
    }
    
    &:active {
      transform: translateY(0);
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
        color: #1890ff;
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
        border-top-color: #1890ff;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      
      span {
        color: #1890ff;
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

  // 表格内按钮样式
  .table-action-btn {
    padding: 2px 4px;
    height: auto;
    border-radius: 4px;
    transition: all 0.2s ease;

    &.edit-btn:hover {
      color: #1890ff;
      background: #e6f7ff;
    }

    &.delete-btn:hover {
      color: #ff4d4f;
      background: #fff1f0;
    }
  }
}

.book-cell {
  display: flex;
  align-items: center;

  .book-thumb-wrapper {
    position: relative;
    margin-right: 12px;
    
    .book-thumb {
      width: 48px;
      height: 64px;
      object-fit: cover;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }

  .book-detail {
    .book-name {
      font-weight: 500;
      color: #1a1a1a;
      margin-bottom: 4px;
    }

    .book-isbn {
      font-size: 12px;
      color: #999;
    }
  }
}

.category-tag {
  // 保持默认样式
}

.stock-cell {
  .stock-value {
    display: block;
    margin-bottom: 4px;
    
    &.low-stock {
      color: #ff4d4f;
      font-weight: 500;
    }
  }
  
  .stock-bar {
    width: 60px;
    height: 4px;
    background: #f0f0f0;
    border-radius: 2px;
    overflow: hidden;
    
    .stock-bar-fill {
      height: 100%;
      border-radius: 2px;
    }
  }
}

.low-stock {
  color: #ff4d4f;
  font-weight: 500;
}
</style>
