# 独立服务器部署与性能优化指南

本文档将指导你如何脱离 Vercel/Supabase 免费层，使用自己的域名和服务器进行私有化部署。这能显著提升国内访问速度，并让你完全掌控数据。

## 第一部分：域名与云服务器 (生产环境推荐)

### 1. 购买域名与服务器
- **域名**: 推荐在 [阿里云](https://wanwang.aliyun.com/)、[腾讯云](https://dnspod.cloud.tencent.com/) 或 [NameSilo](https://www.namesilo.com/) 购买。
    - *建议*: 购买 `.com` 或 `.cn` 等常见后缀。
- **服务器 (VPS)**: 推荐购买位于 **香港** 或 **新加坡** 的服务器（无需备案，国内访问快），或者国内服务器（需备案）。
    - *配置建议*: 2核 CPU / 4G 内存 / 3M+ 带宽 / Ubuntu 22.04 LTS 系统。
    - *服务商*: 阿里云轻量应用服务器、腾讯云 Lighthouse、AWS Lightsail。

### 2. 服务器基础环境配置
使用 SSH 登录你的服务器：
```bash
ssh root@你的服务器IP
```

安装 Docker 和 Docker Compose（一键安装脚本）：
```bash
curl -fsSL https://get.docker.com | bash
```

### 3. 代码改造与 Docker 化
为了在独立服务器运行，我们需要将前端和后端打包进 Docker。

#### 3.1 创建 `Dockerfile`
在项目根目录创建 `Dockerfile`：

```dockerfile
# --- Build Stage ---
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
# 构建前端静态文件
RUN pnpm build

# --- Production Stage ---
FROM node:18-alpine
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod

# 复制前端构建产物到后端 public 目录 (Express 需配置静态托管)
COPY --from=builder /app/dist ./public
# 复制后端代码
COPY --from=builder /app/api ./api
# 复制其他必要文件
COPY .env.production .env

EXPOSE 3000
CMD ["node", "api/server.js"]
```

> **注意**: 你需要修改 `api/server.ts`，让它在生产环境托管 `public/` 目录下的静态文件。

#### 3.2 创建 `docker-compose.yml`
在服务器上创建一个目录（如 `/opt/eat-what`），并创建 `docker-compose.yml`：

```yaml
version: '3'
services:
  app:
    image: eat-what:latest
    build: .
    ports:
      - "3000:3000"
    env_file: .env
    restart: always

  # 可选：自建 PostgreSQL 数据库 (替代 Supabase)
  db:
    image: postgres:15
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: your_secure_password
      POSTGRES_DB: eat_what
    ports:
      - "5432:5432"

volumes:
  pgdata:
```

### 4. Nginx 反向代理与 SSL 证书
为了让用户通过域名安全访问，需要配置 Nginx。

1.  **域名解析**: 在域名控制台添加 `A` 记录，指向你的服务器 IP。
2.  **安装 Nginx**: `apt install nginx`
3.  **申请 SSL 证书**: 使用 `certbot` 自动申请免费证书。
    ```bash
    apt install certbot python3-certbot-nginx
    certbot --nginx -d yourdomain.com
    ```
4.  **配置反向代理**: 编辑 `/etc/nginx/sites-available/default`：
    ```nginx
    server {
        server_name yourdomain.com;
        location / {
            proxy_pass http://127.0.0.1:3000; # 转发给 Docker 容器
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
    ```

---

## 第二部分：本地电脑做服务器 (家庭/内网部署)

如果你想用闲置的 Windows/Mac 电脑当服务器，可通过 **内网穿透** 让外网访问。

### 方案一：Cloudflare Tunnel (推荐，免费且无需公网IP)
1.  **注册 Cloudflare**: 将你的域名 DNS 托管到 Cloudflare。
2.  **安装 cloudflared**:
    - **Mac**: `brew install cloudflared`
    - **Windows**: 下载 `.exe` 文件。
3.  **启动隧道**:
    ```bash
    cloudflared tunnel --url http://localhost:3000
    ```
    它会生成一个临时域名（如 `trycloudflare.com`），你可以直接发给朋友访问。
4.  **绑定自定义域名**: 在 Cloudflare Zero Trust 控制台配置 Tunnel，将你的域名（如 `home.eatwhat.com`）指向本地的 `http://localhost:3000`。

### 方案二：FRP / Ngrok (适合极客)
如果你有一台带公网 IP 的云服务器（作为中转），可以使用 FRP 将本地服务映射出去。
1.  **服务端 (frps)**: 部署在云服务器。
2.  **客户端 (frpc)**: 部署在本地电脑，配置指向本地 `3000` 端口。

### 本地电脑配置注意事项
1.  **电源设置**: 设置电脑为“永不休眠”。
2.  **网络环境**: 建议使用网线连接路由器，保证网络稳定。
3.  **防火墙**: 
    - **Windows**: 允许 Node.js 通过防火墙。
    - **Mac**: 关闭“阻止所有传入连接”。

---

## 总结：升级路线图

1.  **阶段一 (现状)**: Vercel + Supabase (免费，快速，但国内慢)。
2.  **阶段二 (加速)**: 购买域名绑定到 Vercel，解决 DNS 污染问题。
3.  **阶段三 (独立)**: 购买云服务器，使用 Docker 部署应用，Nginx 代理域名。
4.  **阶段四 (完全私有)**: 在服务器上自建 PostgreSQL (替代 Supabase)，完全掌握数据。
