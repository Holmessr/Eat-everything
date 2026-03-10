# 前端部署与 Vercel 教程

## 1. 部署前端 (Vercel)

Vercel 是部署 React 应用最简单的方式，同时也支持 Serverless Functions (本项目已集成)。

### 步骤
1.  **准备代码**: 将你的代码推送到 GitHub/GitLab 仓库。
2.  **创建项目**: 登录 [Vercel](https://vercel.com/)，点击 **"Add New..."** -> **"Project"**。
3.  **导入仓库**: 选择并导入你的 Git 仓库。
4.  **配置环境变量**: 在 **Environment Variables** 中添加以下变量：
    *   `VITE_SUPABASE_URL`: 你的 Supabase 项目 URL
    *   `VITE_SUPABASE_ANON_KEY`: 你的 Supabase Anon Key
    *   `DEEPSEEK_API_KEY`: 你的 DeepSeek API Key (仅后端 Function 可见)
    *   `BAIDU_OCR_API_KEY`: 你的百度智能云 OCR API Key (仅后端 Function 可见)
    *   `BAIDU_OCR_SECRET_KEY`: 你的百度智能云 OCR Secret Key (仅后端 Function 可见)
    *   `VITE_API_BASE_URL`: **留空不填** (生产环境会自动使用同源 API 调用 `/api/ai/recommend`)
5.  **部署**: 点击 **Deploy**。等待构建完成后，Vercel 会提供一个访问域名（如 `eat-everything.vercel.app`）。

### 验证部署
- 访问 Vercel 提供的域名。
- 在首页底部的“智能饮食助手”输入问题，如果能收到回复，说明 DeepSeek 代理接口 (Vercel Function) 工作正常。

## 2. 域名与服务器配置 (可选)

如果你想使用自定义域名：

1.  **购买域名**：在阿里云、腾讯云或 Namecheap 等平台购买域名。
2.  **配置 DNS**：
    *   在 Vercel 项目设置中找到 **Domains**。
    *   添加你的自定义域名（如 `eatwhat.com`）。
    *   根据 Vercel 的提示，在你的域名注册商处添加 CNAME 记录（通常指向 `cname.vercel-dns.com`）。
3.  **SSL 证书**：Vercel 会自动为你的自定义域名配置免费的 SSL 证书，无需手动操作。

## 3. Vercel 国内访问优化

如果你发现 Vercel 的默认域名 (`*.vercel.app`) 在国内无法访问，可以尝试以下方案：

### 方案一：绑定自定义域名 (推荐)
绑定自己的域名是解决访问问题的最佳方案，因为 Vercel 自动分配的子域名常被 DNS 污染。
1.  **购买域名**：在阿里云、腾讯云等平台购买一个域名。
2.  **绑定域名**：在 Vercel 项目设置 -> Domains 中添加你的域名。
3.  **配置 DNS**：
    *   如果你的域名 DNS 托管在阿里云/腾讯云，添加一条 CNAME 记录指向 `cname.vercel-dns.com`。
    *   或者将域名的 Nameservers 修改为 Vercel 提供的服务器。

### 方案二：使用 Cloudflare 代理
如果你不想购买域名，可以尝试通过 Cloudflare Workers 转发请求，但这需要一定的技术门槛配置。建议优先使用方案一。

## 4. Vercel 快速上手教程

### 什么是 Vercel?
Vercel 是一个前端云平台，专门为静态网站和 Serverless 函数优化。它能自动从 Git 仓库拉取代码，构建并部署到全球 CDN 节点。

### 核心概念
- **Projects (项目)**: 对应你的一个 Git 仓库。
- **Deployments (部署)**: 每次代码提交或配置修改都会触发一次新的部署。
- **Domains (域名)**: 你可以绑定多个域名到一个项目。
- **Environment Variables (环境变量)**: 存储敏感信息（如 API Key），区分开发和生产环境。

### 常用操作
1.  **查看构建日志**: 部署失败时，点击 Deployments -> 具体的部署记录 -> Building，查看错误日志。
2.  **回滚版本**: 如果新版本有问题，可以在 Deployments 列表中找到旧版本，点击 "Promote to Production" 瞬间回滚。
3.  **Serverless Logs**: 点击 Logs 标签页，可以查看后端 API (`api/` 目录下代码) 的运行日志，用于排查 API 报错。

### 后续更新
得益于 Vercel 的 Git 集成，更新代码非常简单：
1.  **本地开发**: 在本地修改代码、修复 Bug 或添加新功能。
2.  **提交代码**: 将修改后的代码 `git push` 到你的 GitHub/GitLab 仓库。
3.  **自动部署**: Vercel 会自动检测到仓库的更新，并触发新的构建和部署。
