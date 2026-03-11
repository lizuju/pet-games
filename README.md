# Pet Games

[中文](README.md) | [English](README.en.md)

Pet Games 是一个轻松的放置类经营小游戏：你将和猫咪同伴一起经营小小工作室，通过升级桌子、招聘员工、训练技能来提升金币与鱼的产出，并完成任务解锁更多成长空间。

## 项目概览
这是一个前后端分离的全栈练习项目：后端用 FastAPI + MongoDB 提供状态存取与离线结算，前端用 Vite + React 实现一套可交互的放置类 UI。游戏包含基础资源循环、升级成长、任务奖励、商店兑换与照料衰减等机制。

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
