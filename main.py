import webview # pywebview

import rewrite
from runner import *
import shell

def on_loaded():
    global window
    api.set_window(window)
    shell.shell.print("窗口加载完成，window 引用已设置")

# 主流程
def main():
    global window, api
    # 打开子命令行窗口
    shell.shell.open()
    
    # 获取 HTML 并保存到临时文件
    html_file_path = rewrite.get_html()
    
    # 创建 Api 实例（先不传入 window）
    api = Api()
    
    # 创建窗口，使用文件路径而不是直接传入 HTML 字符串
    # 这样可以避免 data: URL 导致的 localStorage 被禁用等问题
    shell.shell.print("启动浏览器窗口")
    window = webview.create_window(
        title='mrzh-lbdh',
        url=html_file_path,
        width=390,
        height=600,
        minimized=True,
        js_api=api
    )
    
    shell.shell.print("等待inject.js 发送响应")
    window.events.loaded += on_loaded

    webview.start(
        debug=False,#True
        private_mode=True,
        user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1 Edg/146.0.0.0',
    )

if __name__ == '__main__':
    main()