# 吃什么 (Eat What) - 部署文档

本文档包含了项目的完整部署指南。为了方便阅读，我们将其拆分为以下部分：

- **[前端部署与 Vercel 教程](./docs/deploy-frontend-vercel.md)**: 包含如何使用 Vercel 部署前端、配置环境变量、解决国内访问问题以及 Vercel 的基础使用教程。
- **[后端数据库与 Supabase 教程](./docs/deploy-backend-supabase.md)**: 包含如何配置 Supabase 数据库、运行 SQL 脚本、配置 RLS 策略以及 Supabase 的基础使用教程（建表、更新等）。
- **[独立服务器部署与性能优化指南](./docs/deploy-self-hosted.md)**: 包含如何购买域名/服务器、Docker 部署、Nginx 配置以及如何将本地电脑作为服务器使用（进阶版）。

## 快速开始

1.  **准备环境**: 确保你已经安装了 Node.js (v18+) 和 pnpm。
2.  **配置后端**: 按照 [Supabase 教程](./docs/deploy-backend-supabase.md) 设置数据库。
3.  **本地运行**:
    ```bash
    cp .env.example .env.local # 填入你的环境变量
    pnpm install
    pnpm run dev
    ```
4.  **部署上线**: 按照 [Vercel 教程](./docs/deploy-frontend-vercel.md) 将项目发布到互联网。

## 项目结构

- `src/`: 前端 React 代码
- `api/`: 后端 Serverless Functions (Express)
- `supabase/`: 数据库 SQL 脚本
- `docs/`: 详细文档教程
