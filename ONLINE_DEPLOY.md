# 完全在线部署教程：GitHub + Vercel + Supabase

这份教程假设你是第一次做网页项目，并且不想在本地安装 Node.js、npm、VS Code 或其他软件。

你要做的事情只有三类：

1. 在 GitHub 网页上传代码。
2. 在 Supabase 网页创建数据库。
3. 在 Vercel 网页部署网站。

## 第 0 步：确认项目文件已经完整

当前项目已经包含完整代码，不是只有说明文档。

你应该能看到这些重要文件：

- `package.json`
- `src/app/auth/page.tsx`
- `src/app/todos/page.tsx`
- `src/app/friends/page.tsx`
- `src/app/requests/page.tsx`
- `src/app/friends/[id]/page.tsx`
- `src/lib/supabase.ts`
- `src/app/globals.css`
- `supabase/schema.sql`

如果你要上传到 GitHub，建议上传整个项目文件夹里的全部内容。

## 第 1 步：创建 GitHub 仓库

1. 打开 GitHub：https://github.com
2. 登录账号。
3. 点击右上角的 `+`。
4. 点击 `New repository`。
5. 在 `Repository name` 输入：

```text
shared-todo-garden
```

6. 选择 `Public` 或 `Private` 都可以。
7. 不要勾选 `Add a README file`。
8. 不要勾选 `.gitignore`。
9. 不要选择 license。
10. 点击绿色按钮 `Create repository`。

## 第 2 步：把项目上传到 GitHub

推荐方式：使用 GitHub 网页上传压缩包解压后的文件。

1. 打开你刚创建的 GitHub 仓库页面。
2. 找到页面中间的 `uploading an existing file` 链接并点击。
3. 把这个项目文件夹里的所有文件拖进去。
4. 注意要包含这些文件夹和文件：

```text
src
supabase
package.json
tailwind.config.ts
tsconfig.json
next.config.ts
postcss.config.js
next-env.d.ts
.env.example
.gitignore
README.md
ONLINE_DEPLOY.md
```

5. 页面下方 `Commit changes` 区域保持默认即可。
6. 点击绿色按钮 `Commit changes`。

如果 GitHub 网页不允许一次上传文件夹，可以改用这个替代方案：

1. 先在电脑上把项目文件夹压缩成 zip。
2. 打开 zip。
3. 把 zip 里面的文件和文件夹拖到 GitHub 上传页面。
4. 不要只上传 zip 文件本身，GitHub 需要看到解压后的项目文件。

## 第 3 步：创建 Supabase 项目

1. 打开 Supabase：https://supabase.com
2. 登录账号。
3. 点击 `New project`。
4. 选择一个 organization。
5. 在 `Project name` 输入：

```text
shared-todo-garden
```

6. 在 `Database Password` 设置一个密码。
7. `Region` 选择离你较近的区域。
8. 点击 `Create new project`。
9. 等待项目创建完成，通常需要 1 到 3 分钟。

## 第 4 步：在 Supabase 创建数据库表和权限

1. 进入 Supabase 项目。
2. 左侧菜单点击 `SQL Editor`。
3. 点击 `New query`。
4. 打开本项目里的：

```text
supabase/schema.sql
```

5. 复制里面的全部内容。
6. 粘贴到 Supabase 的 SQL 编辑框。
7. 点击 `Run`。
8. 如果看到 `Success. No rows returned` 或类似成功提示，就可以继续。

这一步会创建：

- `profiles`：用户资料
- `todos`：待办事项
- `friendships`：好友申请和好友关系
- Row Level Security：数据库权限
- Realtime：todo 和好友申请实时同步

## 第 5 步：确认 Supabase 邮箱登录开启

1. 左侧菜单点击 `Authentication`。
2. 点击 `Providers`。
3. 找到 `Email`。
4. 确认 Email 是 enabled / 开启状态。

第一次测试时，如果你不想每次收确认邮件，可以这样做：

1. 左侧点击 `Authentication`。
2. 点击 `Sign In / Providers` 或 `Providers`。
3. 进入 `Email` 设置。
4. 找到 `Confirm email`。
5. 测试阶段可以关闭它。

正式展示给别人用时，建议重新开启邮箱确认。

## 第 6 步：复制 Supabase 环境变量

1. 在 Supabase 左侧菜单点击 `Project Settings`。
2. 点击 `API`。
3. 找到 `Project URL`，复制它。
4. 找到 `Project API keys` 里的 `anon public` key，复制它。

你稍后要把它们粘贴到 Vercel：

```text
NEXT_PUBLIC_SUPABASE_URL=Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon public key
```

## 第 7 步：用 Vercel 导入 GitHub 项目

1. 打开 Vercel：https://vercel.com
2. 用 GitHub 登录。
3. 点击 `Add New...`。
4. 点击 `Project`。
5. 找到刚才的 GitHub 仓库：

```text
shared-todo-garden
```

6. 点击 `Import`。

## 第 8 步：在 Vercel 填环境变量

在 Vercel 的导入页面，找到 `Environment Variables`。

添加第一个变量：

```text
Name: NEXT_PUBLIC_SUPABASE_URL
Value: 粘贴 Supabase 的 Project URL
```

点击 `Add`。

添加第二个变量：

```text
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: 粘贴 Supabase 的 anon public key
```

点击 `Add`。

然后点击 `Deploy`。

Vercel 会自动做这些事情：

- 自动运行 `npm install`
- 自动运行 `npm run build`
- 自动生成线上网站地址

你本地不需要运行任何 npm 命令。

## 第 9 步：打开网站测试

部署成功后，Vercel 会显示一个网址，类似：

```text
https://shared-todo-garden.vercel.app
```

点击打开。

测试流程：

1. 进入 `/auth`。
2. 注册第一个账号，例如：

```text
alice@example.com
```

3. 登录后进入 `/todos`。
4. 新增几个 Todo。
5. 再用另一个浏览器、无痕窗口或手机打开同一个网站。
6. 注册第二个账号，例如：

```text
bob@example.com
```

7. 用 Bob 去 `/friends` 搜索 Alice 的邮箱。
8. 点击申请。
9. 用 Alice 去 `/requests` 接受申请。
10. Bob 去 `/friends`，点击 Alice。
11. Bob 应该可以看到 Alice 的 Todo 和完成状态。
12. Alice 点击完成某个 Todo 后，Bob 页面会实时更新。

## 第 10 步：如果部署失败，先看这几个地方

### 情况 1：网页显示 Supabase 环境变量缺失

回到 Vercel 项目：

1. 点击 `Settings`。
2. 点击 `Environment Variables`。
3. 检查是否有：

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

4. 如果没有，补上。
5. 回到 `Deployments`。
6. 点击最新部署右侧的三个点。
7. 点击 `Redeploy`。

### 情况 2：注册后没有资料

回到 Supabase：

1. 点击 `SQL Editor`。
2. 重新执行 `supabase/schema.sql`。
3. 再注册一个新账号测试。

### 情况 3：好友看不到 Todo

检查这三件事：

1. 好友申请是否已经在 `/requests` 被接受。
2. `friendships` 表里的 `status` 是否是 `accepted`。
3. 是否已经执行过 `supabase/schema.sql` 里的 RLS SQL。

## 命令行替代方案

本教程不要求命令行。

如果某篇网上教程叫你执行：

```bash
npm install
npm run dev
```

你可以不用执行。Vercel 会在线帮你安装依赖和构建。

如果某篇教程叫你用 VS Code 编辑文件，你也可以不用。GitHub 网页本身可以上传和编辑文件。
