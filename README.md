# 棋牌乐园

Vue 3 + Vant 4 纯前端棋牌平台：**麻将 · 斗地主 · 五子棋**

## 特性

- 全免费，无账号，无内购
- 本地 AI 机器人补位（默认高难度，无 API 调用，离线可玩）
- 移动端优先，手牌横排完整展示，支持出牌提示
- 麻将：四川血战 / 广东推倒胡 / 国标 + 自定义规则
- 浏览器存储联机（热座 / BroadcastChannel）
- 关闭页面自动清理房间会话缓存

## 本地启动

```bash
npm install
npm run dev
```

局域网内手机访问（电脑与手机同一 WiFi）：

```bash
npm run dev:host
```

终端会显示 `Network: http://192.168.x.x:5173`，手机浏览器打开该地址即可。

```bash
npm run build
npm run preview
```

## 免费部署到公网（GitHub Pages）

适合长期免费访问。当前仓库 `chenkang12348/cursor-qipai` 使用 **master 分支 + `/docs` 目录** 发布。

### 访问地址

```text
https://chenkang12348.github.io/cursor-qipai/
```

### GitHub Pages 设置（与截图一致）

1. 仓库 → **Settings** → **Pages**
2. **Build and deployment** → Source 选 **Deploy from a branch**
3. Branch 选 **master**，Folder 选 **/docs**
4. 保存后等待 1～3 分钟生效

### 自动部署（推荐）

推送 `master` 上除 `docs/` 以外的代码变更时，`.github/workflows/deploy-pages.yml` 会自动构建并提交到 `docs/`：

```bash
git add .
git commit -m "feat: 更新功能"
git push origin master
```

### 本地手动构建（可选）

```bash
npm run build:pages
git add docs
git commit -m "chore: update GitHub Pages build"
git push origin master
```

本地预览 Pages 效果：

```bash
npm run preview:pages
```

> 若仓库改名，请同步修改 `package.json` 中 `build:pages` 的 `--base /仓库名/` 前缀。

### 首次推送

```bash
git init
git add .
git commit -m "init: 棋牌乐园"
git branch -M master
git remote add origin https://github.com/chenkang12348/cursor-qipai.git
git push -u origin master
```

首次部署约需 1～3 分钟，在 Pages 设置页可看到实际 URL。

### 其他免费平台（可选）

| 平台 | 说明 |
|------|------|
| [Cloudflare Pages](https://pages.cloudflare.com/) | 连接 GitHub，Build command: `npm run build`，Output: `dist` |
| [Vercel](https://vercel.com/) | 导入仓库，框架选 Vite，零配置 |
| [Netlify](https://www.netlify.com/) | 同上，Build: `npm run build`，Publish: `dist` |

子路径部署（GitHub Pages）已在 Vite / Router 中配置 `BASE_URL`，无需额外修改。

## 缓存说明

| 时机 | 清理内容 |
|------|----------|
| 关闭标签页 / 刷新 | 房间数据 `dt:room:*`、sessionStorage |
| 退出对局回大厅 | 同上 |
| 设置 → 清除本地缓存 | 全部 `dt:*`、麻将规则缓存（含 AI 难度恢复默认） |

主题（暗色模式）由浏览器单独管理，手动清缓存不会强制切换主题。

## AI 说明

所有 Bot 使用 **本地 TypeScript 算法** 运行在浏览器内，`src/bots/` 目录禁止网络请求，无需 API Key。默认难度为 **困难**。

## 技术栈

- Vue 3 + TypeScript + Vite
- Vant 4 + Pinia + Vue Router
- @vueuse/core

## 素材致谢

麻将牌面 SVG 来自 [FluffyStuff/riichi-mahjong-tiles](https://github.com/FluffyStuff/riichi-mahjong-tiles)（CC0 1.0），存放于 `public/mahjong-tiles/`。
