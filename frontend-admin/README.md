# Frontend Admin - 图书馆管理系统前端

## How to Run

### 本地开发运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:8081
```

### Docker 运行

```bash
# 在项目根目录运行
docker-compose up --build -d

# 或在当前目录单独构建
docker build -t frontend-admin .
docker run -d -p 8081:80 --name frontend-admin frontend-admin
```

### 生产构建

```bash
npm run build
npm run preview
```

---

## Services

| 服务名称 | 端口 | 说明 |
|---------|------|------|
| frontend-admin | 8081 | 图书馆管理系统前端服务 |

---

## 测试账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |

---

## 题目内容

帮我生成一个纯前端的图书馆管理项目，使用 Ant Design Vue，不需要和后端交互，要有默认数据。

---

## 项目结构

```
frontend-admin/
├── Dockerfile              # Docker 构建文件（支持 ARM64/AMD64）
├── nginx.conf              # Nginx 配置
├── package.json            # 项目依赖
├── vite.config.js          # Vite 配置
├── index.html              # HTML 入口
├── public/                 # 静态资源
│   └── favicon.svg
└── src/
    ├── main.js             # 应用入口
    ├── App.vue             # 根组件
    ├── router/             # 路由配置
    │   └── index.js
    ├── stores/             # Pinia 状态管理
    │   ├── book.js
    │   ├── borrow.js
    │   ├── category.js
    │   └── reader.js
    ├── layouts/            # 布局组件
    │   └── MainLayout.vue
    ├── views/              # 页面组件
    │   ├── Dashboard.vue
    │   ├── Login.vue
    │   ├── books/
    │   ├── borrow/
    │   ├── categories/
    │   └── readers/
    ├── data/               # 模拟数据
    │   └── mockData.js
    └── styles/             # 全局样式
        └── global.less
```

## 技术栈

- Vue 3 + Vite
- Ant Design Vue 4
- Pinia
- Vue Router
- Less
