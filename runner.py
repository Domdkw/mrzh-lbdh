import requests
import tools
import json
import rewrite
from bs4 import BeautifulSoup
import shell



xhrLog=[]
indexJS = ""
window = None

class Api:
    def __init__(self, window_ref=None):
        global window
        window = window_ref

    def set_window(self, window_ref):
        global window
        window = window_ref

    def getLog(self, log):
        log = json.dumps(log)
        xhrLog.append(log)
        shell.shell.print(log,'\n')
        # 打印到 python 控制台
    
    def parseIndexJS(self):
        getIndexJS()
            #getYDProductNumber()
            #getTDToken()
    
    def getServerList(self):
        return serverList()

    def askUser(self):
        return askUser()


wmToken = ""
productNumber = ""
def getYDProductNumber():
    global productNumber
    productNumber = tools.getStringBetween(indexJS, "productNumber:", ",")
    if productNumber:
        productNumber = productNumber.strip().strip('\'"')
        shell.shell.print("\033[32m[INFO]\033[0m","productNumber:",productNumber,"\n")
    else:
        productNumber = ""
        shell.shell.print("\033[31m[ERROR]\033[0m","未找到 productNumber\n")

def getTDToken():
    global wmToken
    wmToken = tools.getStringBetween(indexJS, "getToken(", ",")
    if wmToken:
        wmToken = wmToken.strip().strip('\'"')
        shell.shell.print("\033[32m[INFO]\033[0m","wmToken:",wmToken,"\n")
    else:
        wmToken = ""
        shell.shell.print("\033[31m[ERROR]\033[0m","未找到 wmToken\n")

def checkYDStatus():
    if not productNumber or not wmToken:
        shell.shell.print("\033[31m[ERROR]\033[0m","未找到 productNumber 或 wmToken")
        return False
    else:
        shell.shell.print("\033[32m[INFO]\033[0m","productNumber 和 wmToken 检查成功，Next...")
        window.evaluate_js(f"setYD('{productNumber}','{wmToken}');check_QueryRole()")
        return True

def getIndexJS():
    html = rewrite.original_html
    if not html:
        shell.shell.print("html 为空")
        return ""
    #查找 script 标签
    soup = BeautifulSoup(html, "html.parser")
    scripts = soup.find_all("script")
    if scripts:
        for script in scripts:
            if "index" in str(script) and "mrzh.res.netease.com" in str(script):
                indexJSURL = script.get("src", "")
                if not indexJSURL.startswith("http"):
                    indexJSURL = "https://mrzh.res.netease.com" + tools.getStringBetween(html, "mrzh.res.netease.com", ".js") + ".js"
                shell.shell.print("\033[32m[INFO]\033[0m","找到 mrzh.res.netease.com index.js:",indexJSURL)

                global indexJS
                indexJS = requests.get(indexJSURL).text.strip()

                getYDProductNumber()
                getTDToken()
                checkYDStatus()
                break


_serverListCache = []

def serverList():
    """
    获取服务器列表
    返回服务器列表数据供前端使用
    """
    global _serverListCache
    stype = input("请输入服务器类型; 1：官服(official)  2：渠道服(channel) ：")
    if stype == "1":
        stype = "official"
    elif stype == "2":
        stype = "channel"
    else:
        print("输入错误")
        return None
    res = requests.get(f"https://gameserver.webcgi.163.com/game_servers_info?game=g66&type={stype}")
    if res.status_code == 200:
        serverData = json.loads(res.text)["servers"][0]["data"]
        serverData = tools.quick_sort(serverData, key=lambda x: x["py"][0][0])
        _serverListCache = serverData
        
        print("----服务器列表---\n")
        for server in serverData:
            print(server["id"],": ",server["name"]," ",server["py"][0][0])
        askServerID()
        return serverData
    else:
        print("获取服务器列表失败")
        return None

def askServerID():
    """
    询问用户服务器ID
    返回用户输入的服务器ID
    """
    global _serverListCache
    a = input("请输入服务器ID：")
    validIds = [str(server["id"]) for server in _serverListCache]
    if a not in validIds:
        print("服务器ID不存在")
        return askServerID()
    else:
        print("服务器ID:", a)
        window.evaluate_js(f"setServerID('{a}')")
        return a

def askUser():
    return input("请输入用户ID：")
    
