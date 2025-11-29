# YARB Web3 - 动态文章展示系统

基于 React + TypeScript 构建的现代化动态文章展示系统，能够从指定的 GitHub 仓库中自动获取目录结构并展示 Markdown 文章内容。

## 🌟 核心特性

- **🔗 动态 GitHub 仓库集成** - 支持任意 GitHub 仓库，自动解析目录结构
- **📅 智能文章处理** - 从文件名解析日期和序号，支持多种日期格式
- **🌐 大模型翻译功能** - 集成 SiliconFlow API，支持流式翻译文章内容
- **⚡ 高性能优化** - 30分钟智能缓存、文章预加载、虚拟滚动
- **📱 完美响应式设计** - 移动端单页面切换，桌面端侧边栏布局
- **⚙️ 灵活配置管理** - 支持自定义仓库地址、分支、路径和文件夹过滤
- **🎨 现代化 UI** - Toast 通知、骨架屏加载、平滑动画、错误边界处理
- **🔧 开发者友好** - TypeScript 全覆盖、模块化架构、完整状态管理

## 🛠 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite 5.0
- **HTTP 客户端**: Axios (拦截器 + 错误处理)
- **Markdown 渲染**: react-markdown + remark-gfm
- **状态管理**: 自定义 Hooks (完整状态机)
- **样式方案**: CSS3 + 响应式设计 + 骨架屏
- **性能优化**: React.memo + 智能缓存 + 预加载机制

## 📁 项目结构

```
src/
├── components/     # React 组件（features/layout/ui 分类）
├── services/       # 业务逻辑层（GitHub API、配置、翻译）
├── hooks/          # 自定义 Hooks（状态管理、响应式检测）
├── utils/          # 工具函数（日期、文件名解析、验证等）
├── types/          # TypeScript 类型定义
├── constants/      # 应用常量配置
└── styles/         # 全局样式
```

## 🚀 核心功能

- **GitHub API 集成** - 30分钟智能缓存、文章预加载、403错误降级处理
- **智能文章处理** - 支持多种日期格式解析（2025.9.9、2025-9-9、20250909等），按日期/序号/文件名智能排序
- **配置管理** - 支持 GitHub URL 解析、配置验证、文件夹过滤
- **响应式设计** - 移动端单页面切换，桌面端侧边栏布局
- **大模型翻译** - 集成 SiliconFlow API，支持流式翻译文章内容

## 📦 安装和运行

### 一键 Vercel 部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/dubuqingfeng/yarb-web3)

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

访问 `http://localhost:3000` 查看应用（开发服务器会自动打开浏览器）。

## ⚙️ 配置说明


### 自定义配置
1. 点击设置按钮打开配置界面
2. 输入 GitHub 仓库 URL（支持完整 URL 或简写）
3. 点击"测试连接"验证配置
4. 选择要展示的文件夹（可选）
5. 保存配置并自动刷新

### 高级配置
可在 `src/constants/index.ts` 中修改：
- 响应式断点（移动端 < 1000px）
- 缓存时长（默认 30 分钟）
- 预加载数量（默认前后各 2 篇）

## 🚀 部署

支持所有静态网站部署平台（Vercel、Netlify、GitHub Pages 等）：

1. 推送代码到 GitHub 仓库
2. 在部署平台中导入项目
3. 自动构建和部署
