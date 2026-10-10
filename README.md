# 🍽️ 吃一点 · Eat A Bit

> 拍张照，AI 帮你识别吃了什么、有多少热量。

一个移动端优先的饮食记录 App。**单文件网页版 + 安卓安装包（APK）**，支持调用 AI 视觉模型拍照识别食物、估算份量与热量，并记录每日饮食。

---

## 🌐 在线访问

无需安装，浏览器直接打开即用：

- **GitHub Pages**：https://ruizailaile.github.io/eat-a-bit/
- **CDN 直链（jsDelivr）**：https://cdn.jsdelivr.net/gh/ruizailaile/eat-a-bit@main/index.html

> 在线版可正常拍照识别；受浏览器跨域限制，若接口不允许跨域，建议使用下面的安卓 App（走原生网络请求，不受 CORS 限制）。

---

## 📱 安卓 App

直接下载安装包：

- **[吃一点.apk](./吃一点.apk)**（约 420 KB，Android 7.0+）

安装步骤：
1. 把 `吃一点.apk` 传到手机
2. 点击安装（首次需允许「安装未知来源应用」）
3. 打开 App，允许相机权限，即可拍照识别

App 特性：
- 内置相机实时预览 + 拍照，也可从相册选图
- 通过**原生网络桥**直连 AI 接口，不受浏览器 CORS 限制
- 离线可用的本地记录（数据存在本机）

---

## ✨ 功能

- 📸 **拍照识别** — 拍一张照片，AI 识别图中所有食物，估算份量与热量
- 🥗 **营养明细** — 热量 / 蛋白质 / 脂肪 / 碳水，可手动调整份量
- 📊 **每日记录** — 早餐 / 午餐 / 晚餐 / 加餐，按日期分组回看
- 💧 **喝水打卡** — 玻璃人形容器可视化饮水量
- 🏆 **成就徽章 / 贴纸** — 连续打卡获得奖励
- 👤 **个人资料** — 昵称、身高、目标热量与营养目标
- 🌗 **主题 / 多语言** — 浅色 / 深色，多语言切换
- 🤖 **AI 营养助手** — 基于你的数据给出饮食建议（本地规则）

---

## 🤖 开启拍照 AI 识别

App 已**预置接口地址与模型名**，你只需填一个自己的 API Key：

1. 打开 App → 底部「我的」→「**AI 识别设置**」
2. 填写 **API Key**（默认已填好接口地址和模型名）
3. 点「保存配置」，可点「测试连通性」验证
4. 回到相机页拍照，即走**真实 AI 识别**

默认预置（可在设置页修改）：

| 项目 | 值 |
|---|---|
| 接口地址 | `https://open.bigmodel.cn/api/paas/v4/chat/completions` |
| 模型名 | `GLM-4.6V-Flash` |
| API Key | 需自行填写（不内置密钥） |

> 支持任意 **OpenAI 兼容**格式的视觉模型接口，例如通义千问 VL、OpenAI 的 `gpt-4o-mini` 等。
> 未配置 Key 时，拍照会回退为本地演示结果，功能仍可体验。

---

## 🧱 技术实现

| 部分 | 方案 |
|---|---|
| 网页应用 | 单个 `index.html`（内联 CSS/JS，零依赖、离线可用） |
| 安卓外壳 | Android WebView + `WebViewAssetLoader`（页面处于安全上下文，支持 `getUserMedia`） |
| 相机 | WebView 权限桥 + 系统相机兜底 |
| AI 调用 | OpenAI 兼容 `/chat/completions`，图片以 base64 dataURL 传入 |
| 跨域 | 安卓端走原生 `HttpURLConnection` 桥，绕过浏览器 CORS |
| 存储 | 浏览器 `localStorage`（本机保存，不上传） |

关键文件：
- [index.html](./index.html) — 网页应用全部逻辑
- [android-app/](./android-app) — 安卓工程（`MainActivity.java` 含相机权限、文件选择、原生 HTTP 桥）
- [android-app/app/build.gradle](./android-app/app/build.gradle) — 安卓构建配置（minSdk 24 / targetSdk 34）

---

## 📦 本地运行与打包

### 网页版

直接双击打开 [index.html](./index.html)，或起一个本地静态服务：

```bash
python3 -m http.server 8080
# 浏览器访问 http://localhost:8080/index.html
```

### 安卓 APK

前置：JDK 17、Android SDK（platform 34 / build-tools 34）、Gradle 8.7

```bash
# 在 android-app/local.properties 里配置 sdk.dir
gradle -p android-app assembleRelease
# 产物：android-app/app/build/outputs/apk/release/app-release.apk
```

构建产物已签名（使用工程内 `eatbit.keystore`），可直接安装。

---

## 📖 更多文档

- [SETUP.md](./SETUP.md) — Next.js 原型的环境配置步骤
- [ARCHITECTURE.md](./ARCHITECTURE.md) — 架构设计与数据表结构

> 仓库早期包含一个 Next.js + Supabase 的原型（`app/`、`components/`、`lib/`、`supabase/`），
> 当前主推的成品是上面的单文件网页版 + 安卓 APK。

---

## 📄 License

MIT
