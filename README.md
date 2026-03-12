# Pet Games

[中文](README.md) | [English](README.en.md)

Pet Games 是一个轻松的放置类经营小游戏：你将和猫咪同伴一起经营小小工作室，通过升级桌子、招聘员工、训练技能来提升金币与鱼的产出，并完成任务解锁更多成长空间。

## 项目概览
这是一个前后端分离的全栈练习项目：后端用 FastAPI + MongoDB 提供状态存取与离线结算，前端用 Vite + React 实现一套可交互的放置类 UI。游戏包含基础资源循环、升级成长、任务奖励、商店兑换与照料衰减等机制。

## 核心特性
- **完整的离线结算**：支持 6 小时离线收益计算，自动应用照料衰减机制
- **永久化存储**：基于 MongoDB 的可靠玩家状态管理
- **响应式 UI**：使用 React + Tailwind CSS 打造流畅的游戏体验
- **自动保存**：可配置的自动保存机制（默认 5 秒一次）
- **多平台部署**：支持 Vercel（前端）、Render（后端）、MongoDB Atlas（数据库）

## 主要玩法
- 自动产出金币与鱼（按秒结算，随等级与升级提升）。
- 点击收集获得即时收益与少量经验。
- 升级系统：桌子、员工、技能三条成长路线，成本与收益随等级增长，并带 30 分钟冷却。
- 任务系统：满足条件后领取奖励与经验。
- 商店：使用金币购买鱼类补给。
- 休息加速：短时加倍产出并带冷却（默认 20 秒加速，40 秒冷却）。
- 离线收益与照料衰减：离线结算上限 6 小时；超过 30 分钟未照料后每 30 分钟衰减一次，最多 12 次。

## 数据与同步
- 玩家 ID 存在浏览器 localStorage，首次进入自动生成。
- 前端每秒 tick 计算收益，默认每 5 秒自动保存；可在设置中关闭自动保存或离线收益。
- 后端基于 MongoDB 持久化玩家状态，读取时会结算离线收益并应用照料衰减。

## 技术栈
- 后端：FastAPI，Motor（MongoDB）
- 前端：React，Vite，Tailwind CSS

## 目录结构
- `backend/`：FastAPI 服务 + 游戏逻辑
- `frontend/`：Vite React 应用

## 环境要求
- Node.js 18+
- Python 3.10+
- MongoDB（本地或 Atlas）

## 环境变量

### 后端
基于 `.env.example` 创建 `backend/.env`：
```bash
MONGODB_URL=mongodb://localhost:27017
```

### 前端
本地开发：创建 `frontend/.env`：
```bash
VITE_API_BASE=http://localhost:8000
```

生产构建：创建 `frontend/.env.production`：
```bash
VITE_API_BASE=https://api.your-domain.com
```

## 本地运行

### 后端
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 前端
```bash
cd frontend
npm install
npm run dev
```

打开：http://localhost:5173

## 构建前端
```bash
cd frontend
npm run build
npm run preview
```

## 生产部署指南

### 前端部署（Vercel）

1. **准备工作**
   - 将项目上传到 GitHub
   - 访问 [Vercel](https://vercel.com) 并使用 GitHub 账号登录

2. **创建项目**
   - 点击 "Add New" > "Project"
   - 选择你的 GitHub 仓库
   - 框架选择 "Vite"
   - 根目录设为 `frontend`

3. **环境变量配置**
   - 在 Vercel 项目设置中添加环境变量：
   ```
   VITE_API_BASE=https://your-render-api.onrender.com
   ```

4. **部署完成**
   - Vercel 会自动在每次推送时构建并部署
   - 你的应用将在 `https://your-project.vercel.app` 上线

### 后端部署（Render）

1. **准备工作**
   - 在项目根目录创建 `backend/render.yaml`：
   ```yaml
   services:
     - type: web
       name: pet-games-api
       env: python
       plan: free
       buildCommand: "pip install -r requirements.txt"
       startCommand: "uvicorn main:app --host 0.0.0.0 --port 8000"
       envVars:
         - key: MONGODB_URL
           scope: run
           value: ${MONGODB_URL}
   ```

2. **访问 Render**
   - 登录 [Render](https://render.com)
   - 连接你的 GitHub 账号

3. **创建 Web Service**
   - 点击 "New +" > "Web Service"
   - 选择包含 `backend/` 的 GitHub 仓库
   - 配置：
     - Name: `pet-games-api`
     - Environment: `Python 3.10`
     - Build Command: `pip install -r backend/requirements.txt`
     - Start Command: `cd backend && uvicorn main:app --host 0.0.0.0 --port 8000`

4. **环境变量设置**
   - 在 Render 仪表板中添加 Environment Variables：
   ```
   MONGODB_URL = (你的 MongoDB Atlas 连接字符串)
   ```

5. **完成部署**
   - 你的 API 将在 `https://your-app.onrender.com` 运行
   - 记住这个 URL，用于前端的 `VITE_API_BASE` 配置

### 数据库部署（MongoDB Atlas）

1. **创建账号与项目**
   - 访问 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - 注册并创建免费组织与项目

2. **创建集群**
   - 选择 "M0 Sandbox"（免费）
   - 部署区域选择离你最近的位置
   - 等待集群完成部署（通常需要 1-3 分钟）

3. **配置数据库用户**
   - 进入 "Database Access" 标签
   - 添加新用户（选择 "Password"）
   - 生成强密码并保存
   - 确保用户有 "readWriteAnyDatabase" 权限

4. **配置网络访问**
   - 进入 "Network Access" 标签
   - 添加 IP 地址允许列表
   - 为方便起见可添加 `0.0.0.0/0`（允许所有 IP），**生产环境应限制为特定 IP**

5. **获取连接字符串**
   - 进入 "Databases" 分页，点击 "Connect"
   - 选择 "Drivers" > "Python" 版本
   - 复制连接字符串，格式如：
   ```
   mongodb+srv://<username>:<password>@cluster-xxx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
   ```

6. **配置环境变量**
   - 在 Render 后端项目中设置 `MONGODB_URL` 为此连接字符串
   - 本地开发也可在 `backend/.env` 中使用此字符串

### 完整工作流

```
GitHub (仓库)
    ↓
Vercel (前端) ← VITE_API_BASE → Render (后端) ← MONGODB_URL → MongoDB Atlas
```

### 测试部署

1. 打开你的 Vercel 应用 URL
2. 在浏览器开发者工具中检查网络请求
3. 确保 API 调用成功指向 Render 后端
4. 测试游戏核心功能（保存、加载、升级等）

## API 端点
- `GET /api/health`
- `GET /api/catalog`
- `GET /api/player/{player_id}`
- `POST /api/player/{player_id}`
- `POST /api/player/{player_id}/action`

## 备注
- `.env` 与 `.env.production` 已被 git 忽略，请使用 `.env.example` 作为模板。
- 生产环境请收紧 `backend/main.py` 中的 CORS 配置。

---

## 许可证

本项目遵循仓库内 `LICENSE` 约束。
