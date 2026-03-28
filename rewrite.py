import requests
import os
import tempfile
from bs4 import BeautifulSoup
import shell
import tools

#获取源码
original_html = ""
rewritten_html = ""
temp_file_path = ""

indexJS_URL = ""
js_e_idx = 0
soup_html = None

global indexJS
indexJS = ""
global unstrip_indexJS
unstrip_indexJS = ""

def get_html():
    global original_html
    original_html = request_html()
    if not original_html:
        shell.shell.print("获取index.html失败")
        return ""

    global rewritten_html
    rewritten_html = inject_js_code(original_html)
    if not rewritten_html:
        shell.shell.print("重写index.html失败")
        return ""

    getIndexJS(rewritten_html)

    rewritten_html = expose_wm(rewritten_html)
    if not rewritten_html:
        shell.shell.print("暴露watchman失败")
        return ""
    
    global temp_file_path   
    temp_file_path = save_temp_html(rewritten_html)
    if not temp_file_path:
        shell.shell.print("保存index.html失败")
        return ""

    return temp_file_path


def request_html():
    """
    从网易MRZH网站获取HTML页面
    Returns:
        str: 获取到的HTML内容
    """
    response = requests.get('https://mrzh.163.com/m/lbdh/')
    response.encoding = 'utf-8'
    if response.status_code == 200:
        shell.shell.print('获取index.html成功')
        return response.text
    else:
        shell.shell.print('获取index.html失败')
        return '<html><body>获取index.html失败</body></html>'


def save_temp_html(html_content):
    """
    将HTML内容保存到临时文件中
    Args:
        html_content (str): 要保存的HTML内容
    Returns:
        str: 临时文件的绝对路径
    """
    temp_dir = tempfile.gettempdir()
    temp_file_path = os.path.join(temp_dir, 'mrzh_lbdh_temp.html')
    
    with open(temp_file_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    shell.shell.print(f'HTML已保存到临时文件: {temp_file_path}')
    return temp_file_path


def inject_js_code(html_content):
    """
    对HTML内容进行重写
    Args:
        html_content (str): 要重写的HTML内容
    Returns:
        str: 重写后的HTML内容
    """
    
    soup = BeautifulSoup(html_content, 'html.parser')
    script = soup.new_tag('script', type='text/javascript')
    with open('injuct.js', 'r', encoding='utf-8') as f:
        script.string = f.read()
    soup.head.append(script)
    shell.shell.print("注入inject.js成功")

    return str(soup)

def getIndexJS(html):
    if not html:
        shell.shell.print("html 为空")
        return ""
    soup_html = BeautifulSoup(html, "html.parser")
    scripts = soup_html.find_all("script")
    if scripts:
        for script in scripts:
            src = script.get("src", "")
            script_str = str(script)
            if "index" in script_str and "mrzh.res.netease.com" in script_str:
                if src.startswith("http://") or src.startswith("https://"):
                    indexJSURL = src
                elif src:
                    indexJSURL = "https://mrzh.res.netease.com" + src
                else:
                    continue
                shell.shell.print("\033[32m[INFO]\033[0m","找到 mrzh.res.netease.com index.js:", indexJSURL)
                global js_e_idx
                shell.shell.print(script_str)
                js_e_idx = html.find(script_str)
                global indexJS_URL
                global indexJS
                global unstrip_indexJS
                indexJS_URL = indexJSURL
                indexJS = requests.get(indexJSURL).text.strip()
                break



def expose_wm(html):
    """
    暴露watchman，首先修改JS外链为内联，然后暴露Window
    Args:
        html_content (str): 要暴露的HTML内容
    Returns:
        str: 暴露后的HTML内容
    """
    #暴露watchman
    shell.shell.print("暴露watchman")
    js = indexJS

    js = js.replace("wm = instance;", "window.wm = wm = instance;")
    
    if not html:
        shell.shell.print("html 为空")
        return ""
    #查找当前index.js script 标签
    ee = html.find(">", js_e_idx)
    if ee == -1: 
        shell.shell.print("未找到index.js外链")
        return ""
    shell.shell.print("删除index.js外链")
    html = html[:js_e_idx] + "<script>" + js + "</script>" + html[ee+1:]
    
    return html
        
    

       
