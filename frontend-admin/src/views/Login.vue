<template>
  <div class="login-container">
    <div class="login-bg"></div>
    <div class="login-card">
      <div class="login-header">
        <div class="login-logo">
          <BookOutlined />
        </div>
        <h1 class="login-title">图书馆管理系统</h1>
        <p class="login-subtitle">Library Management System</p>
      </div>

      <a-form
        :model="formState"
        :rules="rules"
        @finish="handleLogin"
        layout="vertical"
        class="login-form"
      >
        <a-form-item name="username" label="用户名">
          <a-input
            v-model:value="formState.username"
            size="large"
            placeholder="请输入用户名"
            autocomplete="off"
          >
            <template #prefix>
              <UserOutlined />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item name="password" label="密码">
          <a-input-password
            v-model:value="formState.password"
            size="large"
            placeholder="请输入密码"
            autocomplete="off"
          >
            <template #prefix>
              <LockOutlined />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            block
            :loading="loading"
          >
            {{ loading ? '登录中...' : '登 录' }}
          </a-button>
        </a-form-item>
      </a-form>

    </div>

    <div class="login-footer">
      © 2024 图书馆管理系统 · 基于 Vue 3 + Ant Design Vue
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { UserOutlined, LockOutlined, BookOutlined } from '@ant-design/icons-vue'
import { users } from '@/data/mockData'

const router = useRouter()
const loading = ref(false)

const formState = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名' }],
  password: [{ required: true, message: '请输入密码' }]
}

async function handleLogin() {
  loading.value = true

  await new Promise(resolve => setTimeout(resolve, 800))

  const user = users.find(
    u => u.username === formState.username && u.password === formState.password
  )

  if (user) {
    localStorage.setItem('library_user', JSON.stringify({
      username: user.username,
      name: user.name,
      role: user.role,
      avatar: user.avatar
    }))
    message.success(`欢迎回来，${user.name}！`)
    router.push('/dashboard')
  } else {
    message.error('用户名或密码错误')
  }

  loading.value = false
}
</script>

<style lang="less" scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 50%, #0050b3 100%);
  padding: 24px;
}

.login-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.08) 0%, transparent 40%);
  pointer-events: none;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  padding: 40px;
  position: relative;
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-logo {
  width: 72px;
  height: 72px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  color: #fff;
  box-shadow: 0 8px 24px rgba(24, 144, 255, 0.3);
}

.login-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.login-subtitle {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.login-form {
  :deep(.ant-form-item-label > label) {
    font-weight: 500;
    color: #333;
  }

  :deep(.ant-input-affix-wrapper) {
    border-radius: 8px;
    padding: 8px 12px;
    transition: all 0.3s ease;

    &:hover {
      border-color: #40a9ff;
    }

    &:focus,
    &-focused {
      border-color: #1890ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    }
  }

  // 移除自动填充背景色
  :deep(input:-webkit-autofill),
  :deep(input:-webkit-autofill:hover),
  :deep(input:-webkit-autofill:focus),
  :deep(input:-webkit-autofill:active) {
    -webkit-box-shadow: 0 0 0 30px white inset !important;
    box-shadow: 0 0 0 30px white inset !important;
    -webkit-text-fill-color: #333 !important;
  }

  :deep(.ant-btn) {
    border-radius: 8px;
    height: 48px;
    font-size: 16px;
    font-weight: 500;
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(24, 144, 255, 0.4);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }
  }
}

.login-footer {
  margin-top: 32px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
}
</style>
