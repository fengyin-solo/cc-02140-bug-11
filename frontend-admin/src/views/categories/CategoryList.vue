<template>
  <div class="category-list">
    <h2 class="page-title">分类管理</h2>

    <!-- 操作区域 -->
    <div class="search-area">
      <a-row :gutter="16" align="middle">
        <a-col :xs="24" :sm="12" :md="8" :lg="6">
          <a-input
            v-model:value="searchKeyword"
            placeholder="搜索分类名称"
            allow-clear
          >
            <template #suffix>
              <SearchOutlined style="color: rgba(0,0,0,0.45); cursor: pointer;" />
            </template>
          </a-input>
        </a-col>
        <a-col :xs="24" :sm="12" :md="16" :lg="18" style="text-align: right;">
          <a-button type="primary" @click="showAddModal">
            <PlusOutlined /> 新增分类
          </a-button>
        </a-col>
      </a-row>
    </div>

    <!-- 分类卡片列表 -->
    <a-row :gutter="[16, 16]">
      <a-col
        v-for="category in filteredCategories"
        :key="category.id"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
      >
        <div class="category-card" :style="{ borderTopColor: getCategoryColor(category.id) }">
          <div class="category-header">
            <div class="category-icon" :style="{ backgroundColor: getCategoryColor(category.id) }">
              <FolderOutlined />
            </div>
            <div class="category-actions">
              <a-button type="text" size="small" class="action-btn edit-btn" @click="showEditModal(category)">
                <EditOutlined />
              </a-button>
              <a-popconfirm
                title="确定要删除这个分类吗？"
                ok-text="确定"
                cancel-text="取消"
                @confirm="handleDelete(category.id)"
              >
                <a-button type="text" size="small" class="action-btn delete-btn">
                  <DeleteOutlined />
                </a-button>
              </a-popconfirm>
            </div>
          </div>
          <div class="category-body">
            <h3 class="category-name">{{ category.name }}</h3>
            <p class="category-code">编码: {{ category.code }}</p>
            <p class="category-desc">{{ category.description }}</p>
          </div>
          <div class="category-footer">
            <div class="book-count">
              <BookOutlined />
              <span>{{ category.bookCount }} 本图书</span>
            </div>
          </div>
        </div>
      </a-col>
    </a-row>

    <!-- 空状态 -->
    <a-empty
      v-if="filteredCategories.length === 0"
      description="暂无分类数据"
      class="empty-state"
    />

    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="isEdit ? '编辑分类' : '新增分类'"
      :confirm-loading="submitLoading"
      @ok="handleSubmit"
      @cancel="handleModalClose"
      width="480px"
    >
      <a-form
        ref="formRef"
        :model="formState"
        :rules="rules"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="分类名称" name="name">
          <a-input v-model:value="formState.name" placeholder="请输入分类名称" />
        </a-form-item>
        <a-form-item label="分类编码" name="code">
          <a-input
            v-model:value="formState.code"
            placeholder="请输入分类编码（如：WX）"
            :maxlength="4"
          />
        </a-form-item>
        <a-form-item label="描述" name="description">
          <a-textarea
            v-model:value="formState.description"
            placeholder="请输入分类描述"
            :rows="3"
          />
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
  EditOutlined,
  DeleteOutlined,
  FolderOutlined,
  BookOutlined,
  SearchOutlined
} from '@ant-design/icons-vue'
import { useCategoryStore } from '@/stores/category'

const categoryStore = useCategoryStore()

const searchKeyword = ref('')
const modalVisible = ref(false)
const submitLoading = ref(false)
const isEdit = ref(false)
const editingId = ref(null)
const formRef = ref(null)

const formState = reactive({
  name: '',
  code: '',
  description: ''
})

const rules = {
  name: [{ required: true, message: '请输入分类名称' }],
  code: [
    { required: true, message: '请输入分类编码' },
    { pattern: /^[A-Z]{2,4}$/, message: '编码为2-4位大写字母' }
  ]
}

const categoryColors = [
  '#1890ff', '#52c41a', '#faad14', '#722ed1',
  '#eb2f96', '#13c2c2', '#fa541c', '#2f54eb'
]

function getCategoryColor(id) {
  return categoryColors[(id - 1) % categoryColors.length]
}

const filteredCategories = computed(() => {
  if (!searchKeyword.value) return categoryStore.categories

  const keyword = searchKeyword.value.toLowerCase()
  return categoryStore.categories.filter(cat =>
    cat.name.toLowerCase().includes(keyword) ||
    cat.code.toLowerCase().includes(keyword)
  )
})

function resetForm() {
  Object.assign(formState, {
    name: '',
    code: '',
    description: ''
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

function showEditModal(category) {
  isEdit.value = true
  editingId.value = category.id
  Object.assign(formState, {
    name: category.name,
    code: category.code,
    description: category.description
  })
  modalVisible.value = true
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

async function handleSubmit() {
  try {
    await formRef.value.validate()
    submitLoading.value = true

    await new Promise(resolve => setTimeout(resolve, 500))

    if (isEdit.value) {
      categoryStore.updateCategory(editingId.value, formState)
      message.success('分类更新成功')
    } else {
      categoryStore.addCategory(formState)
      message.success('分类添加成功')
    }

    modalVisible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    submitLoading.value = false
  }
}

function handleDelete(id) {
  const category = categoryStore.getCategoryById(id)
  if (category && category.bookCount > 0) {
    message.warning('该分类下还有图书，无法删除')
    return
  }

  categoryStore.deleteCategory(id)
  message.success('分类删除成功')
}
</script>

<style lang="less" scoped>
.category-list {
  .page-title {
    font-size: 20px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 24px;
  }
}

.search-area {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 20px;
  margin-bottom: 16px;
}

.category-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-top: 4px solid #1890ff;
  transition: all 0.3s;
  overflow: hidden;

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    background: #f0f7ff;
  }

  .category-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 16px 0;

    .category-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 18px;
    }

    .category-actions {
      display: flex;
      gap: 4px;

      .action-btn {
        width: 32px;
        height: 32px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        transition: all 0.2s ease;

        &:hover {
          transform: none !important;
          box-shadow: none !important;
        }

        &.edit-btn {
          color: #666;

          &:hover {
            color: #1890ff;
            background: #e6f7ff;
          }
        }

        &.delete-btn {
          color: #999;

          &:hover {
            color: #ff4d4f;
            background: #fff1f0;
          }
        }
      }
    }
  }

  .category-body {
    padding: 16px;

    .category-name {
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0 0 8px 0;
    }

    .category-code {
      font-size: 13px;
      color: #666;
      margin: 0 0 8px 0;
    }

    .category-desc {
      font-size: 13px;
      color: #999;
      margin: 0;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  .category-footer {
    padding: 12px 16px;
    background: #f8f9fa;
    border-top: 1px solid #f0f0f0;

    .book-count {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #666;
    }
  }
}

.empty-state {
  margin-top: 60px;
}
</style>
