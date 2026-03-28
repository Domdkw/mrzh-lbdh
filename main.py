import requests
import json
import time
import webview # pywebview

import rewrite
from parser import *


# 主流程
def main():
    # 获取 HTML 并保存到临时文件
    html_file_path = rewrite.get_html()
    
    # 创建窗口，使用文件路径而不是直接传入 HTML 字符串
    # 这样可以避免 data: URL 导致的 localStorage 被禁用等问题
    window = webview.create_window(
        title='mrzh-lbdh',
        url=html_file_path,
        width=390,
        height=600,
        js_api=Api()
    )
    # 在页面加载前注入代码（对应 DOMContentLoaded 之前）
    webview.start(
        debug=True,#False
        private_mode=True,
        user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1 Edg/146.0.0.0'
    )

if __name__ == '__main__':
    main()