# 构建发布指南

## 前置要求

### 开发环境
- Node.js 18+
- Rust 1.70+
- npm 9+

### Windows 构建环境
```powershell
# 安装 Rust (如果没有)
winget install Rustlang.Rustup

# 安装 Visual Studio Build Tools
winget install Microsoft.VisualStudioBuildTools
```

## 构建命令

### 开发模式
```bash
npm run tauri:dev
```

### 生产构建

#### 1. 前端构建
```bash
npm run build
```

#### 2. Tauri 构建
```bash
npm run tauri:build
```

## 输出

### Windows 安装包
```
src-tauri/target/release/bundle/msi/
src-tauri/target/release/bundle/nsis/
```

- `.msi` - Windows Installer
- `.exe` - NSIS 安装程序

## 图标生成

如果需要生成图标，可以使用以下工具：

### 在线图标生成
1. 访问 https://www.favicon.cc/
2. 上传 1024x1024 PNG 设计稿
3. 下载生成的各种尺寸图标

### 放置图标
```
src-tauri/icons/
├── 32x32.png
├── 128x128.png
├── 128x128@2x.png
├── icon.icns (macOS)
└── icon.ico (Windows)
```

## 签名

### Windows 代码签名（可选）
```powershell
# 使用 Windows SDK 签名工具
signtool sign /f certificate.pfx /p password /tr http://timestamp.digicert.com /td sha256 .\MyMD_1.0.0_x64-setup.exe
```

## 发布

### 发布到 GitHub Releases
```bash
# 创建 tag
git tag v1.0.0
git push origin v1.0.0

# 使用 GitHub Actions 自动构建和发布
```

### 手动发布
1. 构建产物在 `src-tauri/target/release/bundle/`
2. 上传到 GitHub Releases 或其他分发平台
3. 更新下载链接

## 构建配置

### 修改版本号
编辑 `src-tauri/Cargo.toml`:
```toml
[package]
version = "1.0.0"
```

### 修改应用名称
编辑 `src-tauri/tauri.conf.json`:
```json
{
  "productName": "MyMD",
  "bundle": {
    "shortDescription": "跨平台 Markdown 编辑器"
  }
}
```

## 常见问题

### Q: 构建失败 "Failed to compile"
A: 确保前端 `npm run build` 成功后再运行 Tauri 构建

### Q: 图标缺失
A: 确保 `src-tauri/icons/` 目录存在并包含所有图标文件

### Q: WebView2 未安装
A: Windows 10/11 通常自带 WebView2，旧系统需要手动安装