# 图书馆管理系统

## How to Run

### Docker 运行（推荐）

```bash
# 构建并启动所有服务
docker-compose up --build -d

# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 本地开发运行

```bash
# 进入前端项目目录
cd frontend-admin

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:8081
```

### 验证 Docker 镜像跨平台支持

```bash
# 验证 Node.js 镜像支持 ARM64
docker pull --platform linux/arm64 node:20-alpine

# 验证 Nginx 镜像支持 ARM64
docker pull --platform linux/arm64 nginx:1.25-alpine
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


## 项目结构

```
.
├── docker-compose.yml          # Docker Compose 配置
├── .gitignore                  # Git 忽略文件配置
├── README.md                   # 项目说明文档
└── frontend-admin/             # 前端管理后台
    ├── Dockerfile              # Docker 构建文件
    ├── nginx.conf              # Nginx 配置
    ├── package.json            # 项目依赖配置
    ├── vite.config.js          # Vite 构建配置
    ├── index.html              # HTML 入口
    ├── public/                 # 静态资源
    │   └── favicon.svg         # 网站图标
    └── src/                    # 源代码
        ├── main.js             # 应用入口
        ├── App.vue             # 根组件
        ├── router/             # 路由配置
        │   └── index.js        # 路由定义
        ├── stores/             # Pinia 状态管理
        │   ├── book.js         # 图书状态
        │   ├── reader.js       # 读者状态
        │   ├── borrow.js       # 借阅状态
        │   └── category.js     # 分类状态
        ├── layouts/            # 布局组件
        │   └── MainLayout.vue  # 主布局
        ├── views/              # 页面组件
        │   ├── Login.vue       # 登录页
        │   ├── Dashboard.vue   # 首页概览
        │   ├── books/
        │   │   └── BookList.vue      # 图书管理
        │   ├── readers/
        │   │   └── ReaderList.vue    # 读者管理
        │   ├── borrow/
        │   │   └── BorrowList.vue    # 借阅管理
        │   └── categories/
        │       └── CategoryList.vue  # 分类管理
        ├── data/               # 模拟数据
        │   └── mockData.js     # Mock 数据
        └── styles/             # 全局样式
            └── global.less     # 全局样式文件
```

---

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **Ant Design Vue 4** - 企业级 UI 组件库
- **Pinia** - Vue 状态管理库
- **Vue Router** - Vue.js 官方路由
- **Less** - CSS 预处理器
- **Nginx** - 高性能 Web 服务器
- **Docker** - 容器化部署

---

## 功能模块

### 1. 首页概览 (Dashboard)
- 统计卡片展示：图书总数、读者总数、借出中、逾期未还
- 最近借阅记录列表
- 图书分类统计
- 热门图书推荐

### 2. 图书管理 (Books)
- 图书列表展示（支持分页）
- 图书搜索（按书名、作者、ISBN）
- 按分类筛选
- 新增/编辑/删除图书

### 3. 读者管理 (Readers)
- 读者列表展示
- 读者搜索（按姓名、卡号、手机号）
- 按状态筛选
- 新增/编辑/删除读者
- 读者详情查看

### 4. 借阅管理 (Borrow)
- 借阅记录列表
- 借阅统计
- 新增借阅
- 图书归还
- 续借功能

### 5. 分类管理 (Categories)
- 分类卡片展示
- 新增/编辑/删除分类

---

## 设计规范

- **间距规范**: 8px / 12px / 16px / 24px / 32px
- **圆角**: 8px / 12px
- **阴影**: 0 2px 8px rgba(0,0,0,0.06) / 0 4px 12px rgba(0,0,0,0.1)
- **主色调**: #1890ff (蓝色)
- **成功色**: #52c41a (绿色)
- **警告色**: #faad14 (橙色)
- **错误色**: #ff4d4f (红色)
- **背景色**: #f5f7fa (浅灰)
