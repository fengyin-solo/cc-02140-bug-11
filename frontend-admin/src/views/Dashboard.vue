<template>
  <div class="dashboard">
    <h2 class="page-title animate-fade-in">首页概览</h2>

    <!-- 统计卡片 -->
    <a-row :gutter="[16, 16]" class="stat-row">
      <a-col :xs="24" :sm="12" :lg="6">
        <div class="stat-card animate-slide-up" style="animation-delay: 0.1s">
          <div class="stat-icon pulse-animation">
            <BookOutlined />
          </div>
          <div class="stat-info">
            <div class="stat-value count-up">{{ bookStore.totalBooks }}</div>
            <div class="stat-label">图书总数</div>
          </div>
          <div class="stat-card-bg"></div>
        </div>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="6">
        <div class="stat-card success animate-slide-up" style="animation-delay: 0.2s">
          <div class="stat-icon pulse-animation">
            <UserOutlined />
          </div>
          <div class="stat-info">
            <div class="stat-value count-up">{{ readerStore.totalReaders }}</div>
            <div class="stat-label">读者总数</div>
          </div>
          <div class="stat-card-bg"></div>
        </div>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="6">
        <div class="stat-card warning animate-slide-up" style="animation-delay: 0.3s">
          <div class="stat-icon pulse-animation">
            <SwapOutlined />
          </div>
          <div class="stat-info">
            <div class="stat-value count-up">{{ borrowStore.totalBorrowed }}</div>
            <div class="stat-label">借出中</div>
          </div>
          <div class="stat-card-bg"></div>
        </div>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="6">
        <div class="stat-card error animate-slide-up" style="animation-delay: 0.4s">
          <div class="stat-icon pulse-animation">
            <WarningOutlined />
          </div>
          <div class="stat-info">
            <div class="stat-value count-up">{{ borrowStore.totalOverdue }}</div>
            <div class="stat-label">逾期未还</div>
          </div>
          <div class="stat-card-bg"></div>
        </div>
      </a-col>
    </a-row>

    <!-- 借阅记录和分类统计 -->
    <a-row :gutter="[16, 16]">
      <!-- 最近借阅 -->
      <a-col :xs="24" :lg="16">
        <div class="card-container equal-height animate-fade-in" style="animation-delay: 0.5s">
          <div class="card-header">
            <h3 class="card-title">
              <HistoryOutlined class="icon-spin" /> 最近借阅记录
            </h3>
            <a-button type="link" class="view-all-btn" @click="$router.push('/borrow')">
              查看全部 <RightOutlined />
            </a-button>
          </div>
          <div class="card-body">
            <div class="borrow-list">
              <transition-group name="list" tag="div">
                <div
                  v-for="(record, index) in recentBorrows"
                  :key="record.id"
                  class="borrow-item hover-lift"
                  :style="{ animationDelay: `${0.6 + index * 0.1}s` }"
                >
                  <div class="borrow-info">
                    <a-avatar
                      :style="{ backgroundColor: getAvatarColor(record.readerId) }"
                      size="small"
                      class="avatar-bounce"
                    >
                      {{ record.readerName.charAt(0) }}
                    </a-avatar>
                    <div class="borrow-detail">
                      <span class="reader-name">{{ record.readerName }}</span>
                      <span class="book-title">{{ record.bookTitle }}</span>
                    </div>
                  </div>
                  <div class="borrow-meta">
                    <span class="borrow-date">{{ record.borrowDate }}</span>
                    <a-tag :color="getStatusColor(record.status)" size="small" class="status-tag">
                      {{ getStatusText(record.status) }}
                    </a-tag>
                  </div>
                </div>
              </transition-group>
            </div>
          </div>
        </div>
      </a-col>

      <!-- 分类统计 - 紧凑列表布局 -->
      <a-col :xs="24" :lg="8">
        <div class="card-container equal-height animate-fade-in" style="animation-delay: 0.6s">
          <div class="card-header">
            <h3 class="card-title">
              <PieChartOutlined class="icon-pulse" /> 图书分类统计
            </h3>
          </div>
          <div class="card-body category-body">
            <div class="category-list">
              <div
                v-for="(cat, index) in topCategories"
                :key="cat.id"
                class="category-item hover-highlight"
                :style="{ animationDelay: `${0.7 + index * 0.08}s` }"
              >
                <div class="category-left">
                  <span class="category-dot pulse-dot" :style="{ backgroundColor: getProgressColor(cat.id) }"></span>
                  <span class="category-name">{{ cat.name }}</span>
                </div>
                <div class="category-right">
                  <span class="category-count animate-number">{{ cat.bookCount }}</span>
                  <span class="category-unit">本</span>
                </div>
                <div class="category-progress">
                  <div
                    class="category-progress-bar"
                    :style="{
                      width: `${(cat.bookCount / maxBookCount) * 100}%`,
                      backgroundColor: getProgressColor(cat.id)
                    }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </a-col>
    </a-row>

    <!-- 热门图书 -->
    <div class="card-container animate-fade-in" style="margin-top: 16px; animation-delay: 0.7s">
      <div class="card-header">
        <h3 class="card-title">
          <FireOutlined class="icon-fire" /> 热门图书推荐
        </h3>
      </div>
      <a-row :gutter="[16, 16]">
        <a-col
          v-for="(book, index) in hotBooks"
          :key="book.id"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
        >
          <div class="book-card">
            <div class="book-cover">
              <img :src="book.cover" :alt="book.title" />
            </div>
            <div class="book-info">
              <h4 class="book-title">{{ book.title }}</h4>
              <p class="book-author">{{ book.author }}</p>
              <div class="book-meta">
                <a-tag color="blue" class="category-tag">{{ book.categoryName }}</a-tag>
                <span class="book-available">
                  <span class="stock-icon">📚</span>
                  {{ book.available }}/{{ book.total }}
                </span>
              </div>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  BookOutlined,
  UserOutlined,
  SwapOutlined,
  WarningOutlined,
  HistoryOutlined,
  RightOutlined,
  PieChartOutlined,
  FireOutlined
} from '@ant-design/icons-vue'
import { useBookStore } from '@/stores/book'
import { useReaderStore } from '@/stores/reader'
import { useBorrowStore } from '@/stores/borrow'
import { useCategoryStore } from '@/stores/category'

const bookStore = useBookStore()
const readerStore = useReaderStore()
const borrowStore = useBorrowStore()
const categoryStore = useCategoryStore()

const recentBorrows = computed(() => {
  return [...borrowStore.records]
    .sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate))
    .slice(0, 5)
})

const topCategories = computed(() => {
  return categoryStore.categories.slice(0, 6)
})

const maxBookCount = computed(() => {
  const counts = categoryStore.categories.map(c => c.bookCount)
  return Math.max(...counts, 1)
})

const hotBooks = computed(() => {
  return bookStore.books.slice(0, 4)
})

const avatarColors = ['#1890ff', '#52c41a', '#faad14', '#722ed1', '#eb2f96', '#13c2c2']

function getAvatarColor(id) {
  return avatarColors[(id - 1) % avatarColors.length]
}

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

const progressColors = ['#1890ff', '#52c41a', '#faad14', '#722ed1', '#eb2f96', '#13c2c2', '#fa541c', '#2f54eb']

function getProgressColor(id) {
  return progressColors[(id - 1) % progressColors.length]
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

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes progressGrow {
  from { width: 0; }
}

// ========================================
// 动画类
// ========================================
.animate-fade-in {
  animation: fadeIn 0.5s ease-out both;
}

.animate-slide-up {
  animation: slideUp 0.5s ease-out both;
}

.hover-lift {
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #fafafa;
  }
}

.hover-highlight {
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #fafafa;
  }
}

// ========================================
// 主样式
// ========================================
.dashboard {
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

.stat-row {
  margin-bottom: 16px;
}

.stat-card {
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  color: #fff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 12px 32px rgba(24, 144, 255, 0.4);
  }

  &.success {
    background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
    box-shadow: 0 2px 8px rgba(82, 196, 26, 0.15);

    &:hover {
      box-shadow: 0 12px 32px rgba(82, 196, 26, 0.4);
    }
  }

  &.warning {
    background: linear-gradient(135deg, #faad14 0%, #ffc53d 100%);
    box-shadow: 0 2px 8px rgba(250, 173, 20, 0.15);

    &:hover {
      box-shadow: 0 12px 32px rgba(250, 173, 20, 0.4);
    }
  }

  &.error {
    background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
    box-shadow: 0 2px 8px rgba(255, 77, 79, 0.15);

    &:hover {
      box-shadow: 0 12px 32px rgba(255, 77, 79, 0.4);
    }
  }

  .stat-card-bg {
    position: absolute;
    right: -20px;
    bottom: -20px;
    width: 120px;
    height: 120px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    transition: transform 0.3s ease;
  }

  &:hover .stat-card-bg {
    transform: scale(1.1);
  }

  .stat-icon {
    font-size: 40px;
    opacity: 0.9;
    margin-right: 20px;
    z-index: 1;
    transition: transform 0.3s ease;
  }

  &:hover .stat-icon {
    transform: scale(1.1);
  }

  .stat-info {
    z-index: 1;

    .stat-value {
      font-size: 32px;
      font-weight: 700;
      line-height: 1.2;
    }

    .stat-label {
      font-size: 14px;
      opacity: 0.9;
      margin-top: 4px;
    }
  }
}

.card-container {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    border-color: #e0e0e0;
  }

  &.equal-height {
    height: 100%;
    min-height: 340px;
    display: flex;
    flex-direction: column;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 16px;

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .view-all-btn {
      transition: all 0.3s ease;

      &:hover {
        transform: translateX(2px);
      }
    }
  }

  .card-body {
    padding: 16px 20px;
    flex: 1;
    overflow: auto;
  }
}

// 借阅列表样式
.borrow-list {
  .borrow-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }

    .borrow-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .borrow-detail {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .reader-name {
          font-weight: 500;
          color: #1a1a1a;
          font-size: 14px;
        }

        .book-title {
          font-size: 12px;
          color: #999;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }

    .borrow-meta {
      display: flex;
      align-items: center;
      gap: 12px;

      .borrow-date {
        font-size: 12px;
        color: #999;
      }
    }
  }
}

// 列表动画
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

// 分类列表样式
.category-body {
  padding: 8px 20px !important;
}

.category-list {
  .category-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f5f5f5;
    flex-wrap: wrap;

    &:last-child {
      border-bottom: none;
    }

    .category-left {
      display: flex;
      align-items: center;
      gap: 10px;

      .category-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .category-name {
        font-size: 14px;
        color: #1a1a1a;
      }
    }

    .category-right {
      display: flex;
      align-items: baseline;
      gap: 2px;

      .category-count {
        font-size: 16px;
        font-weight: 600;
        color: #1a1a1a;
      }

      .category-unit {
        font-size: 12px;
        color: #999;
      }
    }

    .category-progress {
      width: 100%;
      height: 2px;
      background: #f0f0f0;
      border-radius: 2px;
      margin-top: 8px;
      overflow: hidden;

      .category-progress-bar {
        height: 100%;
        border-radius: 2px;
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        animation: progressGrow 1s ease-out both;
      }
    }
  }
}

.book-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    border-color: #1890ff;
  }

  .book-cover {
    height: 180px;
    overflow: hidden;
    background: #f5f5f5;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .book-info {
    padding: 16px;

    .book-title {
      font-size: 14px;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0 0 8px 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.5;
      min-height: 42px;
      word-break: break-all;
    }

    .book-author {
      font-size: 13px;
      color: #666;
      margin: 0 0 12px 0;
    }

    .book-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .category-tag {
        transition: all 0.3s ease;
      }

      .book-available {
        font-size: 12px;
        color: #999;
        display: flex;
        align-items: center;
        gap: 4px;

        .stock-icon {
          font-size: 14px;
          animation: float 2s ease-in-out infinite;
        }
      }
    }
  }
}
</style>
