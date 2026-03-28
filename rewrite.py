import requests
import os
import tempfile
from bs4 import BeautifulSoup
import shell

#获取源码
original_html = ""
rewritten_html = ""
temp_file_path = ""
def get_html():
    global original_html
    original_html = request_html()
    if not original_html:
        shell.shell.print("获取index.html失败")
        return ""
    global rewritten_html
    rewritten_html = rewrite_html(original_html)
    if not rewritten_html:
        shell.shell.print("重写index.html失败")
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


def rewrite_html(html_content):
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
