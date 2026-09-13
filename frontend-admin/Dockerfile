# 多阶段构建 - 支持 ARM64 和 AMD64 架构
# 构建阶段 - 使用官方 Node.js Alpine 镜像（支持多平台）
FROM node:20-alpine AS builder

WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 构建生产版本
RUN npm run build

# 生产阶段 - 使用 nginx:alpine（官方支持 linux/amd64, linux/arm64）
FROM nginx:1.25-alpine

# 复制构建产物到 nginx 目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
