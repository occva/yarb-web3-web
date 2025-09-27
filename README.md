# YARB Web3 文章展示网站

基于 GitHub 仓库目录结构的动态文章展示网站，用于展示 [yarb-web3](https://github.com/dubuqingfeng/yarb-web3) 仓库中 `archive` 目录下的文章。

## 功能特性

- 🗂️ **动态年份导航** - 自动获取 GitHub 仓库中的年份文件夹作为导航
- 📄 **智能文章列表** - 显示选中年份下的所有 Markdown 文章，支持按日期排序
- 📖 **完整 Markdown 渲染** - 支持完整的 Markdown 语法和 GitHub 风格表格
- 📱 **响应式设计** - 完美适配桌面端和移动端设备，移动端采用单页面切换模式
- ⚡ **性能优化** - 智能缓存机制、文章预加载、骨架屏提升用户体验
- 🎨 **现代 UI** - 美观的界面设计和流畅的交互动画
- 🔄 **智能刷新** - 支持手动刷新和错误重试机制
- 📅 **日期解析** - 自动从文件名解析日期，智能排序和当前日期文章定位
- 🚀 **回到顶部** - 智能回到顶部按钮，支持自定义滚动容器
- 💾 **缓存管理** - 30分钟智能缓存，减少 API 请求频率

## 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite 5.0
- **Markdown 渲染**: react-markdown + remark-gfm
- **HTTP 客户端**: Axios (支持请求拦截和错误处理)
- **状态管理**: 自定义 Hooks (useAppState, useMobileDetection, useVirtualScroll)
- **样式**: CSS3 + 响应式设计 + 骨架屏动画
- **性能优化**: 智能缓存、预加载、虚拟滚动

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
│   ├── YearNavigation.tsx    # 年份导航组件 (支持骨架屏)
│   ├── ArticleList.tsx       # 文章列表组件 (支持移动端)
│   ├── ArticleContent.tsx    # 文章内容展示组件 (支持移动端)
│   └── BackToTop.tsx         # 回到顶部组件 (支持自定义容器)
├── services/            # 服务层
│   └── githubApi.ts         # GitHub API 服务 (缓存+预加载)
├── hooks/               # 自定义 Hooks
│   ├── useAppState.ts       # 应用状态管理 (完整状态机)
│   ├── useMobileDetection.ts # 移动端检测
│   └── useVirtualScroll.ts   # 虚拟滚动 (性能优化)
├── App.tsx              # 主应用组件 (响应式布局)
├── main.tsx             # 应用入口
└── *.css                # 样式文件 (响应式+动画)
```

## 核心功能

### 1. GitHub API 集成

- **智能缓存**: 30分钟本地缓存，减少 API 请求频率
- **错误处理**: 403错误降级处理，提供默认数据
- **预加载机制**: 自动预加载相邻文章，提升用户体验
- **请求拦截**: Axios 拦截器处理错误和超时
- **日期解析**: 支持多种日期格式的文件名解析

### 2. 组件设计

- **YearNavigation**: 年份导航栏，支持骨架屏加载和刷新按钮
- **ArticleList**: 文章列表，支持移动端单页面模式和日期排序
- **ArticleContent**: 文章内容展示，支持移动端返回按钮和日期显示
- **BackToTop**: 智能回到顶部按钮，支持自定义滚动容器

### 3. 状态管理

使用完整的自定义 Hook 体系：
- **useAppState**: 完整的状态机，管理所有应用状态
- **useMobileDetection**: 移动端检测，动态切换布局
- **useVirtualScroll**: 虚拟滚动，优化长列表性能

### 4. 响应式设计

- **桌面端**: 侧边栏 + 主内容区域布局
- **移动端**: 单页面切换模式，列表和内容分别显示
- **自适应**: 1000px 断点自动切换布局模式

### 5. 性能优化

- **智能缓存**: 多级缓存策略，减少重复请求
- **预加载**: 相邻文章自动预加载
- **骨架屏**: 优雅的加载状态展示
- **错误重试**: 智能错误处理和重试机制

## 配置说明

### GitHub API 配置

在 `src/services/githubApi.ts` 中可以修改以下配置：

```typescript
const REPO_OWNER = 'dubuqingfeng';  // 仓库所有者
const REPO_NAME = 'yarb-web3';      // 仓库名称
const ARCHIVE_PATH = 'archive';     // 文章目录路径
const CACHE_DURATION = 30 * 60 * 1000; // 缓存时长 (30分钟)
```

### 移动端断点配置

在 `src/hooks/useMobileDetection.ts` 中修改断点：

```typescript
setIsMobile(window.innerWidth < 1000); // 1000px 断点
```

### 样式定制

所有样式文件都支持自定义修改：
- `src/App.css` - 全局样式和响应式布局
- `src/components/*.css` - 组件样式和动画效果
- 支持 CSS 变量自定义主题色彩

## 部署

### Vercel 部署

1. 将代码推送到 GitHub 仓库
2. 在 Vercel 中导入项目
3. 自动部署完成

### 其他平台

项目使用标准的 Vite 构建，可以部署到任何支持静态网站的平台上。



## 开发说明

### 添加新功能

1. 在 `src/components/` 中创建新组件
2. 在 `src/services/` 中添加相关服务
3. 在 `src/hooks/` 中管理状态逻辑
4. 更新 `src/App.tsx` 集成新功能


### 错误处理

- 网络错误自动重试机制
- 403 错误降级处理
- 用户友好的错误提示
- 完整的错误边界处理

## 项目特色

### 🚀 智能特性

- **自动日期解析**: 支持多种日期格式 (2025.9.9, 2025-9-9, 20250909 等)
- **当前日期定位**: 自动定位到当前日期的文章，提升用户体验
- **智能排序**: 按日期倒序排列，最新文章优先显示
- **预加载优化**: 自动预加载相邻文章，切换更流畅

### 📱 移动端优化

- **单页面模式**: 移动端采用列表/内容切换模式
- **触摸友好**: 优化的触摸交互和手势支持
- **自适应布局**: 1000px 断点智能切换布局模式
- **返回导航**: 移动端支持返回按钮和手势返回

### ⚡ 性能优化

- **多级缓存**: 30分钟智能缓存 + 预加载缓存
- **请求优化**: 避免重复请求，智能去重
- **错误降级**: 403 错误自动降级，提供默认数据
- **骨架屏**: 优雅的加载状态，提升感知性能

