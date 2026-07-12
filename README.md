# Exam System

考试系统，包含前端、API Gateway、多个 Nest 服务、Prisma/MySQL、Redis、RabbitMQ、Swagger、统一配置、统一响应和统一异常处理。

## 架构

```txt
web
  |
  | /api/*
  v
exam-system gateway
  |
  | /api/user/**    -> user service
  | /api/exam/**    -> exam service
  | /api/answer/**  -> answer service
  | /api/analyse/** -> analyse service
  v
MySQL / Redis / RabbitMQ
```

异步邮件链路：

```txt
user service -> RabbitMQ email_queue -> notification service -> SMTP
```

答题分析链路：

```txt
answer service -> MySQL answer records
answer service -> Redis ranking
analyse service -> Redis ranking
```

## 服务端口

| 服务 | 说明 | 默认端口 |
| --- | --- | --- |
| `web` | React/Vite 前端 | `5173` |
| `exam-system` | API Gateway | `3000` |
| `user` | 用户、登录、验证码 | `3001` |
| `exam` | 考试管理、考试读取 | `3002` |
| `answer` | 答题、自动判卷、分析数据 | `3003` |
| `analyse` | 排行榜、分析服务 | `3004` |
| `notification` | RabbitMQ 邮件消费者 | 无 HTTP 端口 |
| `exam` TCP | Answer 调 Exam 的 TCP RPC | `8888` |

基础设施端口：

| 服务 | 用途 | 默认端口 |
| --- | --- | --- |
| MySQL | 数据库 | `3306` |
| Redis | 缓存、验证码、排行榜 | `6379` |
| RabbitMQ | 程序连接 | `5672` |
| RabbitMQ UI | 管理后台 | `15672` |

RabbitMQ 管理台：

```txt
http://localhost:15672
guest / guest
```

## 目录结构

```txt
apps/
  exam-system/    API Gateway
  user/           用户服务
  exam/           考试服务
  answer/         答题服务
  analyse/        分析服务
  notification/   RabbitMQ 消费者服务

libs/
  common/         通用 guard、decorator、响应拦截器、异常过滤器、Swagger
  config/         @nestjs/config 统一配置
  prisma/         PrismaService
  redis/          RedisModule / RedisService
  email/          SMTP 邮件发送
  excel/          Excel 导出
  notification/   RabbitMQ 生产者封装

web/              React/Vite 前端
prisma/           Prisma schema、seed
```

## 环境准备

安装依赖：

```bash
pnpm install
```

复制环境变量文件：

```bash
copy .env.example .env
```

PowerShell：

```powershell
Copy-Item .env.example .env
```

启动本地基础设施：

```bash
pnpm dev:infra
```

该命令会启动：

- MySQL
- Redis
- RabbitMQ

如果本机已有 MySQL 或 Redis 占用了 `3306` / `6379`，Docker 可能会端口冲突。可以停掉本机服务，或者修改 `docker-compose.yml` 的端口映射和 `.env`。

## 环境变量

核心配置在 `.env.example`：

```env
DATABASE_URL=mysql://root:123456@localhost:3306/exam_system

JWT_SECRET=change-me-in-local-env
JWT_EXPIRES_IN=30m

REDIS_HOST=localhost
REDIS_PORT=6379

RABBITMQ_URL=amqp://localhost:5672
EMAIL_QUEUE=email_queue

SMTP_HOST=smtp.qq.com
SMTP_PORT=587
SMTP_USER=your-email@qq.com
SMTP_PASS=your-smtp-password
SMTP_FROM=your-email@qq.com

APP_PORT=3000
USER_SERVICE_PORT=3001
EXAM_SERVICE_PORT=3002
ANSWER_SERVICE_PORT=3003
ANALYSE_SERVICE_PORT=3004

EXAM_TCP_PORT=8888
```

API Gateway 上游服务地址可以显式指定；不写时会根据端口自动生成：

```env
# USER_SERVICE_URL=http://localhost:3001
# EXAM_SERVICE_URL=http://localhost:3002
# ANSWER_SERVICE_URL=http://localhost:3003
# ANALYSE_SERVICE_URL=http://localhost:3004
```

## 数据库初始化

首次启动基础设施后，执行：

```bash
pnpm prisma:generate
pnpm prisma:migrate -- --name init
pnpm prisma:seed
```

Seed 会创建测试用户：

| 用户名 | 密码 |
| --- | --- |
| `admin` | `123456` |
| `student` | `123456` |

如果执行 `prisma migrate dev` 遇到 shadow database 权限问题，建议 `.env` 使用 root 用户连接本地 MySQL：

```env
DATABASE_URL=mysql://root:123456@localhost:3306/exam_system
```

## 启动

启动基础设施：

```bash
pnpm dev:infra
```

启动所有服务和前端：

```bash
pnpm dev:all
```

单独启动服务：

```bash
pnpm dev:gateway
pnpm dev:user
pnpm dev:exam
pnpm dev:answer
pnpm dev:analyse
pnpm dev:notification
pnpm dev:web
```

常用访问地址：

| 地址 | 说明 |
| --- | --- |
| `http://localhost:5173` | 前端 |
| `http://localhost:3000` | API Gateway |
| `http://localhost:15672` | RabbitMQ 管理台 |

## API Gateway

前端只请求 API Gateway：

```txt
web -> /api/* -> gateway:3000
```

前端 Axios 配置：

```ts
baseURL: '/api'
```

前端代码：

```ts
http.get('/exam/list')
```

实际请求链路：

```txt
GET /api/exam/list
-> gateway:3000
-> exam service:3002/list
```

Gateway 转发规则：

| 前端请求 | 转发到 |
| --- | --- |
| `/api/user/**` | `USER_SERVICE_URL` |
| `/api/exam/**` | `EXAM_SERVICE_URL` |
| `/api/answer/**` | `ANSWER_SERVICE_URL` |
| `/api/analyse/**` | `ANALYSE_SERVICE_URL` |

## RabbitMQ

RabbitMQ 用于异步发送邮件验证码。

生产者：

```txt
user service
```

消费者：

```txt
notification service
```

事件名：

```txt
email.send
```

队列：

```txt
email_queue
```

流程：

```txt
用户请求验证码
-> user service 生成验证码
-> 写入 Redis
-> 投递 RabbitMQ 消息
-> notification service 消费消息
-> EmailService 发送 SMTP 邮件
```

消费者使用手动 ack：

```txt
ack  = 邮件发送成功，确认消息
nack = 邮件发送失败，拒绝消息
```

当前失败后不重新入队，避免邮件发送失败时产生无限重试。

## Redis

Redis 主要用于：

- 注册验证码缓存
- 修改密码验证码缓存
- 考试排行榜 sorted set
- 排行榜用户信息 hash

排行榜相关 key 示例：

```txt
exam:${examId}:ranking
exam:${examId}:ranking:user:${userId}
```

## Swagger

各服务 Swagger 地址：

| 服务 | Swagger |
| --- | --- |
| user | `http://localhost:3001/api-docs` |
| exam | `http://localhost:3002/api-docs` |
| answer | `http://localhost:3003/api-docs` |
| analyse | `http://localhost:3004/api-docs` |

Gateway 当前只负责转发，不聚合 Swagger。

## 常用命令

```bash
# 安装依赖
pnpm install

# 启动基础设施
pnpm dev:infra

# 启动全部服务
pnpm dev:all

# 前端构建
pnpm build:web

# 后端构建
pnpm build

# 测试
pnpm test

# Prisma
pnpm prisma:generate
pnpm prisma:migrate -- --name init
pnpm prisma:seed
```

Docker Compose 常用命令：

```bash
# 查看容器状态
docker compose ps

# 查看日志
docker compose logs mysql
docker compose logs redis
docker compose logs rabbitmq

# 停止容器，保留数据
docker compose down

# 停止容器，并删除 MySQL/Redis/RabbitMQ 数据
docker compose down -v
```

注意：`docker compose down -v` 会删除 volume，数据库数据会丢失。

## 验证命令

类型检查：

```bash
pnpm exec tsc -p apps/exam-system/tsconfig.app.json --noEmit
pnpm exec tsc -p apps/user/tsconfig.app.json --noEmit
pnpm exec tsc -p apps/exam/tsconfig.app.json --noEmit
pnpm exec tsc -p apps/answer/tsconfig.app.json --noEmit
pnpm exec tsc -p apps/analyse/tsconfig.app.json --noEmit
pnpm exec tsc -p apps/notification/tsconfig.app.json --noEmit
```

关键测试示例：

```bash
pnpm test apps/user/src/user.service.spec.ts apps/notification/src/notification.controller.spec.ts
```

前端验证：

```bash
pnpm --filter web build
```

## 后续工程化方向

- Gateway 统一鉴权
- 请求日志和 traceId
- RabbitMQ 重试队列和死信队列
- 服务健康检查
- Dockerfile 和镜像构建
- CI/CD 自动部署
- Prometheus / Grafana 可观测性

## 注意事项

- `.env` 不应该提交到 Git。
- 如果 RabbitMQ 管理台没有 `email_queue`，通常是 `notification` 服务还没启动。
- 如果前端请求 404，先确认 `gateway` 是否启动。
- 如果验证码接口卡住，检查 RabbitMQ 和 `notification` 服务状态。
- 如果 Prisma migrate 报 shadow database 权限问题，使用 root MySQL 连接。
