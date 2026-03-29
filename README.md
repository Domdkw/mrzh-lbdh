# mrzh-lbdh

一个基于 Python 和 pywebview 的 Windows 桌面应用。

## 项目简介

本项目是一个桌面应用程序，使用 pywebview 框架创建轻量级窗口，通过重写和注入 JavaScript 代码来实现特定功能。

## 功能特性

- 🖥️ 使用 pywebview 创建原生窗口
- 🔧 支持 JavaScript 代码注入和重写
- 📊 实时日志输出到独立命令行窗口
- 🌐 模拟移动端 User-Agent
- 🔒 支持反作弊 token 管理

## 技术栈

- **Python 3.12+**
- **pywebview** - 跨平台 WebView 库
- **requests** - HTTP 请求库
- **BeautifulSoup4** - HTML 解析库

## 项目结构

```
mrzh-lbdh/
├── main.py              # 主程序入口
├── runner.py            # 核心业务逻辑和 API 接口
├── shell.py             # 命令行窗口管理
├── rewrite.py           # HTML/JS 重写和注入
├── tools.py             # 工具函数
├── resource/            # 静态资源文件
│   ├── jquery_mixNIE_.1.11.js
│   └── *.js            # 其他 JavaScript 文件
└── sn.txt              # 配置信息
```

## 安装说明

### 环境要求

- Windows 10/11
- Python 3.12 或更高版本

### 安装依赖

```bash
pip install pywebview requests beautifulsoup4
```

或者使用 requirements.txt（如果存在）：

```bash
pip install -r requirements.txt
```

## 使用方法

### 运行程序

```bash
python main.py
```

### 主要模块说明

#### 1. 主程序 (main.py)

程序入口，负责：
- 初始化命令行窗口
- 获取并重写 HTML
- 创建 webview 窗口
- 注册事件监听

#### 2. 运行器 (runner.py)

核心业务逻辑：
- API 接口实现
- 网络请求处理
- 数据解析和日志记录
- 反作弊 token 管理

#### 3. 重写模块 (rewrite.py)

HTML/JS 处理：
- 获取原始 HTML
- 注入自定义 JavaScript
- 暴露 watchman 对象
- 保存临时文件

#### 4. Shell 模块 (shell.py)

命令行管理：
- 创建独立命令行窗口
- 日志输出
- 进程间通信

## 开发指南

### 调试模式

在 [main.py](file://d:\Python\mrzh-lbdh\main.py) 中设置 `debug=True` 以启用调试模式：

```python
webview.start(
    debug=True,
    private_mode=True,
    user_agent='...'
)
```

### 日志查看

程序运行时会打开一个独立的命令行窗口，所有日志会实时输出到该窗口。

## 注意事项

1. 程序需要访问网络资源，请确保网络连接正常
2. 使用模拟的移动端 User-Agent 来访问资源
3. 反作弊功能需要正确配置 token
4. 临时文件会在程序退出后自动清理

## 常见问题

### Q: 窗口无法打开？
A: 检查 Python 版本是否为 3.12+，并确保安装了所有依赖。

### Q: 日志窗口没有输出？
A: 检查 shell.py 中的端口配置（默认 19999）是否被占用。

### Q: HTML 加载失败？
A: 检查网络连接，确保可以访问相关资源。

## 许可证

本项目仅供学习和研究使用。

## 贡献

欢迎提交 Issue 和 Pull Request！

## 联系方式

如有问题，请通过 GitHub Issues 联系。
