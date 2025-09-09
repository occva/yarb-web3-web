# YARB Web3 文章展示网站

基于 GitHub 仓库目录结构的动态文章展示网站，用于展示 [yarb-web3](https://github.com/dubuqingfeng/yarb-web3) 仓库中 `archive` 目录下的文章。

## 功能特性

- 🗂️ **动态年份导航** - 自动获取 GitHub 仓库中的年份文件夹作为导航
- 📄 **文章列表展示** - 显示选中年份下的所有 Markdown 文章
- 📖 **Markdown 渲染** - 支持完整的 Markdown 语法和 GitHub 风格表格
- 📱 **响应式设计** - 适配桌面端和移动端设备
- ⚡ **性能优化** - 本地缓存减少 API 请求，骨架屏提升用户体验
- 🎨 **现代 UI** - 美观的界面设计和流畅的交互动画

## 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **Markdown 渲染**: react-markdown + remark-gfm
- **HTTP 客户端**: Axios
- **样式**: CSS3 + 响应式设计

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:3000` 查看应用。

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 项目结构

```
src/
├── components/           # React 组件
│   ├── YearNavigation.tsx    # 年份导航组件
│   ├── ArticleList.tsx       # 文章列表组件
│   └── ArticleContent.tsx    # 文章内容展示组件
├── services/            # 服务层
│   └── githubApi.ts         # GitHub API 服务
├── hooks/               # 自定义 Hooks
│   └── useAppState.ts       # 应用状态管理
├── App.tsx              # 主应用组件
├── main.tsx             # 应用入口
└── *.css                # 样式文件
```

## 核心功能

### 1. GitHub API 集成

- 自动获取 `archive` 目录下的年份文件夹
- 动态加载指定年份的文章列表
- 通过 `download_url` 获取文章内容
- 实现本地缓存机制，提升性能

### 2. 组件设计

- **YearNavigation**: 年份导航栏，支持加载状态和错误处理
- **ArticleList**: 文章列表，显示文章标题、文件名和大小
- **ArticleContent**: 文章内容展示，支持 Markdown 渲染和操作按钮

### 3. 状态管理

使用自定义 Hook `useAppState` 管理应用状态：
- 年份列表和当前选中年份
- 文章列表和当前选中文章
- 加载状态和错误处理
- 缓存管理

### 4. 用户体验

- 骨架屏加载效果
- 错误状态提示和重试机制
- 响应式设计，适配各种屏幕尺寸
- 流畅的动画和交互效果

## 配置说明

### GitHub API 配置

在 `src/services/githubApi.ts` 中可以修改以下配置：

```typescript
const REPO_OWNER = 'dubuqingfeng';  // 仓库所有者
const REPO_NAME = 'yarb-web3';      // 仓库名称
const ARCHIVE_PATH = 'archive';     // 文章目录路径
```

### 样式定制

所有样式文件都支持自定义修改：
- `src/App.css` - 全局样式
- `src/components/*.css` - 组件样式

## 部署

### Vercel 部署

1. 将代码推送到 GitHub 仓库
2. 在 Vercel 中导入项目
3. 自动部署完成

### 其他平台

项目使用标准的 Vite 构建，可以部署到任何支持静态网站的平台上。

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 开发说明

### 添加新功能

1. 在 `src/components/` 中创建新组件
2. 在 `src/services/` 中添加相关服务
3. 在 `src/hooks/` 中管理状态逻辑
4. 更新 `src/App.tsx` 集成新功能

### 调试技巧

- 使用浏览器开发者工具查看网络请求
- 检查 GitHub API 返回的数据结构
- 利用 React DevTools 调试组件状态

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！
