# 跨平台打包配置

## 当前支持平台

| 平台 | 格式 | 状态 |
|------|------|------|
| Windows | .msi, .exe (NSIS) | ✅ 完整 |
| macOS | .dmg, .app | ⏳ 待配置 |
| Linux | .AppImage, .deb | ⏳ 待配置 |

## macOS 配置

### 编辑 tauri.conf.json
```json
{
  "bundle": {
    "macOS": {
      "minimumSystemVersion": "10.13",
      "frameworks": [],
      "providerName": "MyMD Team"
    }
  }
}
```

### 生成 macOS 签名（开发无需签名）
```bash
# 开发构建
npm run tauri:build -- --target x86_64-apple-darwin

# 代码签名
codesign --force --sign "Developer ID Application: Your Name" ./src-tauri/target/release/bundle/osx/MyMD.app
```

### 创建 .dmg
```bash
# 使用 create-dmg 工具
npx create-dmg \
  --app ./src-tauri/target/release/bundle/osx/MyMD.app \
  --output ./src-tauri/target/release/bundle/dmg/ \
  --volname "MyMD"
```

## Linux 配置

### 安装构建依赖
```bash
# Ubuntu/Debian
sudo apt install libwebkit2gtk-4.0-dev libappindicator3-dev librsvg2-dev patchelf

# Fedora
sudo dnf install webkit2gtk4.0-devel libappindicator3-devel librsvg2-devel

# Arch
sudo pacman -S webkit2gtk libappindicator librsvg patchelf
```

### 构建 AppImage
```bash
# 安装 linuxdeploy
wget https://github.com/linuxdeploy/linuxdeploy/releases/download/continuous/linuxdeploy-x86_64.AppImage
chmod +x linuxdeploy-x86_64.AppImage

# 构建
npm run tauri:build -- --target x86_64-unknown-linux-gnu

# 打包为 AppImage
./linuxdeploy-x86_64.AppImage --appdir ./src-tauri/target/release/bundle/appimage/ --output appimage
```

### 构建 .deb
```bash
# 安装 cargo-deb
cargo install cargo-deb

# 构建
cargo deb --manifest-path ./src-tauri/Cargo.toml
```

## CI/CD 自动化

### GitHub Actions 配置
```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    strategy:
      matrix:
        include:
          - platform: 'macos-latest'
            target: 'x86_64-apple-darwin'
          - platform: 'macos-latest'
            target: 'aarch64-apple-darwin'
          - platform: 'ubuntu-22.04'
            target: 'x86_64-unknown-linux-gnu'

    runs-on: ${{ matrix.platform }}

    steps:
      - uses: actions/checkout@v4

      - name: Install Rust
        uses: dtolnay/rust-toolchain@stable

      - name: Build Tauri
        uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag: ${{ github.ref_name }}
          target: ${{ matrix.target }}
```

## 性能目标

| 指标 | Windows | macOS | Linux |
|------|---------|-------|-------|
| 包体积 | < 15MB | < 15MB | < 12MB |
| 启动时间 | < 2s | < 2s | < 2s |
| 内存占用 | < 200MB | < 200MB | < 150MB |

## 已知限制

1. **Windows**: 需要 WebView2 运行时（大多数 Windows 10/11 已自带）
2. **macOS**: 首次运行需要用户授权"来自非 App Store 的应用"
3. **Linux**: 需要 GTK3 和 WebKitGTK 支持