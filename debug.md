# 调试记录

状态: [RESOLVED]

## 2026-03-06 启动失败排查

### 症状
用户报告 `net::ERR_CONNECTION_REFUSED http://localhost:5173/`，无法访问开发服务器。

### 假设
1.  依赖未正确安装或版本冲突。
2.  端口 5173 被占用或未监听。
3.  Vite 配置错误。

### 排查过程
1.  检查 `package.json`，发现 `dev` 脚本使用 `npm` 而用户要求 `pnpm`。
2.  尝试启动发现 `zod` 版本冲突（`@hookform/resolvers` 依赖 v3，但安装了 v4）。
3.  发现 API 服务器端口 3001 被占用。

### 解决方案
1.  修改 `package.json` 脚本为 `pnpm run`。
2.  降级 `zod` 到 `^3.24.1`，降级 `@hookform/resolvers` 到 `^3.9.0`。
3.  清理端口 3001 占用进程。
4.  重新安装依赖并启动。

### 验证
-   `pnpm run dev` 成功启动。
-   Vite 运行在 `http://localhost:5173/`。
-   浏览器访问正常。
