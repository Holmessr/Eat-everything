# 后端数据库与 Supabase 教程

## 1. 数据库设置 (Supabase)

推荐使用 Supabase 提供 PostgreSQL 数据库、认证和存储服务。

### 1.1 创建项目
1.  登录 [Supabase](https://supabase.com/) 并创建一个新项目。
2.  获取项目的 `Project URL` 和 `anon public key`。

### 1.2 创建数据表
请使用 `supabase/schema.sql` 文件中的 SQL 脚本来初始化数据库。

> **注意：** 数据库字段使用 `snake_case`（下划线命名），而前端代码中我们已经做了适配，确保 API 调用时使用正确的字段名。

### 1.3 运行 SQL 脚本
1.  进入 Supabase 控制台。
2.  点击左侧菜单的 **SQL Editor**。
3.  点击 **"New query"**。
4.  将 `supabase/schema.sql` 的内容复制粘贴到编辑器中。
5.  点击 **Run** 执行脚本。

## 2. Supabase 快速上手教程 (Backend 0-1)

### 什么是 Supabase?
Supabase 是一个开源的 Firebase 替代品。它基于 PostgreSQL 数据库，提供了实时订阅、身份认证 (Auth)、文件存储 (Storage) 和自动生成的 API。

### 核心概念
- **Table (表)**: 就像 Excel 中的一个个 Sheet，存储结构化数据（如用户、店铺、菜谱）。
- **Row Level Security (RLS)**: 这是一个非常重要的安全机制。它允许你编写规则（Policy），决定谁可以查看、修改或删除某一行数据。
    - 例如：`create policy "Users can see their own data" on shops for select using (auth.uid() = user_id);`
    - 这句话的意思是：只有当当前登录用户的 ID (`auth.uid()`) 等于这行数据的 `user_id` 时，他才能查询 (`select`) 这行数据。
- **Authentication (认证)**: Supabase 处理用户注册、登录、找回密码等流程，支持邮箱、手机号、Google/GitHub 等第三方登录。
- **Storage (存储)**: 用于存储图片、视频等大文件。你需要创建 Bucket（桶），并设置访问权限。

### 常用操作指南

#### 如何查看和编辑数据？
1.  点击左侧 **Table Editor** (表格图标)。
2.  选择你想查看的表（如 `shops`）。
3.  你可以像操作 Excel 一样直接在界面上新增、修改或删除数据（前提是 RLS 允许或者是管理员身份）。

#### 如何修改表结构（添加字段）？
1.  在 **Table Editor** 中，点击表右上角的 **"+"** 号（Add column）。
2.  输入字段名（推荐用 `snake_case`，如 `phone_number`）。
3.  选择数据类型（如 `text`, `integer`, `boolean`）。
4.  点击 **Save**。
5.  **重要**: 修改完数据库后，记得去更新前端的 TypeScript 类型定义 (`src/types/index.ts`)，否则前端代码会报错。

#### 如何备份数据？
1.  点击左侧 **Database**。
2.  选择 **Backups**。
3.  Supabase 会自动进行每日备份。你也可以随时下载 `.sql` 格式的备份文件。

#### 如何排查 RLS 权限问题？
如果你发现前端请求报错 `403 Forbidden` 或 `new row violates row-level security policy`：
1.  检查 **Authentication** -> **Policies**。
2.  确保对应的表（如 `shops`）开启了 RLS (`Enable RLS`)。
3.  检查是否有对应的 Policy 允许你的操作（SELECT, INSERT, UPDATE, DELETE）。
4.  **调试技巧**: 在 SQL Editor 中勾选 "Show RLS policies"，或者暂时关闭 RLS 看看是否能成功，以确认是否是权限问题。

### 后续升级建议
1.  **使用 Supabase CLI**: 当你熟悉后，推荐使用 CLI 在本地开发和管理数据库迁移 (Migrations)，而不是直接在网页上操作生产数据库。
2.  **Edge Functions**: 如果需要编写复杂的后端逻辑（如定时任务、Webhooks），可以使用 Supabase Edge Functions (Deno 运行时)。
