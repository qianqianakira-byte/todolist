# Shared Todo Garden

这是一个完整的 Next.js + TypeScript + Tailwind CSS + Supabase 多人共享 To Do List 项目。

你不需要在本地安装 Node.js、npm、VS Code 或其他软件。推荐使用：

- GitHub：存放项目代码
- Supabase：提供登录、数据库、实时同步
- Vercel：在线自动安装依赖、构建和部署网站

## 已生成的完整项目文件

这不是只有 README 的空项目。项目已经包含：

- `package.json`：项目依赖和部署脚本
- `src/app/auth/page.tsx`：登录 / 注册页
- `src/app/todos/page.tsx`：我的 Todo 页面
- `src/app/friends/page.tsx`：好友列表、邮箱搜索、发送好友申请
- `src/app/requests/page.tsx`：接受 / 拒绝好友申请
- `src/app/friends/[id]/page.tsx`：查看好友 Todo
- `src/lib/supabase.ts`：Supabase 客户端
- `src/lib/types.ts`：TypeScript 类型
- `src/app/globals.css`：Tailwind 全局样式
- `supabase/schema.sql`：数据库表、RLS 权限、Realtime 配置
- `.env.example`：环境变量示例

## 在线部署说明

请按 `ONLINE_DEPLOY.md` 操作。那份文档会一步一步告诉你：

1. 怎么在 GitHub 网页创建仓库。
2. 怎么把项目文件上传到 GitHub。
3. 怎么在 Supabase 网页创建数据库并粘贴 SQL。
4. 怎么在 Vercel 网页导入 GitHub 仓库。
5. 怎么在 Vercel 粘贴 Supabase 环境变量。
6. 怎么部署并测试登录、Todo、好友申请、好友 Todo 实时同步。

## 本地命令不是必须的

如果你以后想本地运行，才需要：

```bash
npm install
npm run dev
```

但本项目当前推荐走 GitHub + Vercel + Supabase，全程可以使用网页操作完成。
