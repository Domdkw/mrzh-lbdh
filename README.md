# mrzh-lbdh

基于 Python 和 pywebview 的 Windows 桌面应用。

## 快速开始

### 环境要求

- Windows 10/11
- Python 3.12+

### 安装

```bash
pip install -r requirements.txt
```

### 运行

```bash
python main.py
```

## 功能

- 使用 pywebview 创建原生窗口
- JavaScript 代码注入和重写
- 实时日志输出
- 模拟移动端 User-Agent

## 文件说明

- `main.py` - 主程序入口
- `runner.py` - 核心业务逻辑
- `shell.py` - 命令行窗口管理
- `rewrite.py` - HTML/JS 重写

## 免责声明

**本项目仅供学习和研究使用，禁止用于任何非法用途。**

- 使用本项目所造成的一切后果由使用者自行承担
- 作者不对使用本项目产生的任何直接或间接损失负责
- 请在法律法规允许的范围内使用本项目
- 如涉及版权、商业利益等问题，请立即停止使用并删除本项目

## 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。
