import requests
import tools
import json
import rewrite
from bs4 import BeautifulSoup

xhrLog=[]
indexJS = ""

class Api:
    def __init__(self):
        pass

    def getLog(self, log):
        log = json.dumps(log)
        xhrLog.append(log)
        print(log,'\n')
        #打印到python控制台
    
    def parseIndexJS(self):
        getIndexJS()
            #getYDProductNumber()
            #getTDToken()


wmToken = ""
productNumber = ""
def getYDProductNumber():
    global productNumber
    productNumber = tools.getStringBetween(indexJS, "productNumber:", ",")
    if productNumber:
        productNumber = productNumber.strip('\'"')
        print("\033[32m[INFO]\033[0m","productNumber:",productNumber,"\n")
    else:
        productNumber = ""
        print("\033[31m[ERROR]\033[0m","未找到 productNumber\n")

def getTDToken():
    global wmToken
    wmToken = tools.getStringBetween(indexJS, "getToken(", ",")
    if wmToken:
        wmToken = wmToken.strip('\'"')
        print("\033[32m[INFO]\033[0m","wmToken:",wmToken,"\n")
    else:
        wmToken = ""
        print("\033[31m[ERROR]\033[0m","未找到 wmToken\n")

def getIndexJS():
    html = rewrite.original_html
    if not html:
        print("html 为空")
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
                print("\033[32m[INFO]\033[0m","找到 mrzh.res.netease.com index.js:",indexJSURL)

                global indexJS
                indexJS = requests.get(indexJSURL).text.strip()

                getYDProductNumber()
                getTDToken()
                break


   