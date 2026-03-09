# 吃什么 (Eat What) - 快速上线指南

本指南将帮助你快速部署“吃什么”应用，包括后端数据库、API 服务和前端页面。

## 1. 数据库设置 (Supabase)

推荐使用 Supabase 提供 PostgreSQL 数据库、认证和存储服务。

### 1.1 创建项目
1.  登录 [Supabase](https://supabase.com/) 并创建一个新项目。
2.  获取项目的 `Project URL` 和 `anon public key`。

### 1.2 创建数据表
进入 Supabase 的 **SQL Editor**，运行以下 SQL 脚本以创建所需的数据表：

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Shops Table
create table public.shops (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text check (type in ('delivery', 'dine-in')) not null,
  rating numeric check (rating >= 1 and rating <= 5) not null,
  tags text[] default '{}',
  image_url text,
  images text[] default '{}',
  visit_count integer default 0,
  address text,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Recipes Table
create table public.recipes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  rating numeric check (rating >= 1 and rating <= 5) not null,
  tags text[] default '{}',
  difficulty text check (difficulty in ('easy', 'medium', 'hard')) not null,
  prep_time integer default 0,
  cook_time integer default 0,
  ingredients text[] default '{}',
  steps text[] default '{}',
  image_url text,
  images text[] default '{}',
  source_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Row Level Security (RLS) Policies
alter table public.shops enable row level security;
alter table public.recipes enable row level security;

-- Allow users to view/edit only their own data
create policy "Users can view their own shops" on shops for select using (auth.uid() = user_id);
create policy "Users can insert their own shops" on shops for insert with check (auth.uid() = user_id);
create policy "Users can update their own shops" on shops for update using (auth.uid() = user_id);
create policy "Users can delete their own shops" on shops for delete using (auth.uid() = user_id);

create policy "Users can view their own recipes" on recipes for select using (auth.uid() = user_id);
create policy "Users can insert their own recipes" on recipes for insert with check (auth.uid() = user_id);
create policy "Users can update their own recipes" on recipes for update using (auth.uid() = user_id);
create policy "Users can delete their own recipes" on recipes for delete using (auth.uid() = user_id);
```

## 2. DeepSeek API 接入

为了启用智能推荐功能，你需要接入 DeepSeek API。

1.  访问 [DeepSeek 开放平台](https://platform.deepseek.com/) 注册并申请 API Key。
2.  使用“后端代理转发”保护密钥：
    - 我们已使用 Vercel Functions 实现了后端代理接口：`api/ai/recommend.ts`。
    - 该接口会自动读取环境变量 `DEEPSEEK_API_KEY` 并转发请求，前端无需持有密钥。
3.  本地开发时，在项目根目录创建 `.env`：
    ```
    DEEPSEEK_API_KEY=你的本地key
    ```
    然后运行 `pnpm run dev`，Vite 会自动加载该变量。
4.  生产环境时，不提交 `.env`；在 Vercel 的项目设置里配置环境变量即可。

## 3. 部署前端 (Vercel)

Vercel 是部署 React 应用最简单的方式，同时也支持 Serverless Functions (本项目已集成)。

1.  将你的代码推送到 GitHub/GitLab 仓库。
2.  登录 [Vercel](https://vercel.com/)，点击 **"Add New..."** -> **"Project"**。
3.  导入你的 Git 仓库。
4.  在 **Environment Variables** 中添加以下环境变量：
    *   `VITE_SUPABASE_URL`: 你的 Supabase 项目 URL
    *   `VITE_SUPABASE_ANON_KEY`: 你的 Supabase Anon Key
    *   `DEEPSEEK_API_KEY`: 你的 DeepSeek API Key (仅后端 Function 可见)
    *   `VITE_API_BASE_URL`: **留空不填** (生产环境会自动使用同源 API 调用 `/api/ai/recommend`)
5.  点击 **Deploy**。等待构建完成后，Vercel 会提供一个访问域名（如 `eat-everything.vercel.app`）。

### 3.1 验证部署
- 访问 Vercel 提供的域名。
- 在首页底部的“智能饮食助手”输入问题，如果能收到回复，说明 DeepSeek 代理接口 (Vercel Function) 工作正常。

## 4. 域名与服务器配置 (可选)

如果你想使用自定义域名：

1.  **购买域名**：在阿里云、腾讯云或 Namecheap 等平台购买域名。
2.  **配置 DNS**：
    *   在 Vercel 项目设置中找到 **Domains**。
    *   添加你的自定义域名（如 `eatwhat.com`）。
    *   根据 Vercel 的提示，在你的域名注册商处添加 CNAME 记录（通常指向 `cname.vercel-dns.com`）。
3.  **SSL 证书**：Vercel 会自动为你的自定义域名配置免费的 SSL 证书，无需手动操作。

---

**祝贺！** 完成以上步骤后，你的“吃什么”应用就正式上线了！本项目采用了 Supabase (数据库/认证) + Vercel (前端/API代理) 的架构，无需维护额外的后端服务器。

## 5. 后续更新与维护指南

当你的应用上线后，你可能需要更新代码、修改数据库或升级功能。以下是推荐的操作流程：

### 5.1 代码更新 (自动化部署)
得益于 Vercel 的 Git 集成，更新代码非常简单：
1.  **本地开发**：在本地修改代码、修复 Bug 或添加新功能。
2.  **提交代码**：将修改后的代码 `git push` 到你的 GitHub/GitLab 仓库。
3.  **自动部署**：Vercel 会自动检测到仓库的更新，并触发新的构建和部署。
    *   你可以在 Vercel 控制台查看构建进度。
    *   如果构建失败（如 TS 错误），Vercel 会发送通知，并且不会覆盖线上的旧版本。

### 5.2 数据库变更 (Supabase)
如果你需要修改数据表结构（例如添加新字段）：
1.  **SQL Editor**：登录 Supabase 控制台，进入 SQL Editor。
2.  **执行变更脚本**：编写并运行 `ALTER TABLE` 语句。例如，给 `shops` 表添加一个 `opening_hours` 字段：
    ```sql
    alter table public.shops add column opening_hours text;
    ```
3.  **更新前端类型**：记得同步更新前端代码中的 TypeScript 接口定义 (`src/types/index.ts`)，以匹配新的数据库结构。

### 5.3 环境变量更新
如果你需要更换 API Key 或添加新的环境变量：
1.  **Vercel**：进入项目 Settings -> Environment Variables，修改变量值，然后重新 Redeploy（或者等待下一次代码推送自动生效）。
2.  **Supabase**：如果使用了 Edge Functions，在 Supabase 控制台的 Edge Functions 设置中更新变量。

### 5.4 数据备份
Supabase 每日会自动备份你的数据库。
- 你可以在 Supabase 控制台的 **Database -> Backups** 中查看和下载备份。
- 建议在进行重大数据库变更前，手动创建一个备份。

