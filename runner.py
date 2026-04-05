import requests
import json
import time
from bs4 import BeautifulSoup
import os

import shell
import rewrite
import tools


xhrLog=[]
window = None
user = ""
serverID = ""
anticheat_token = ""
anticheat_status = False
user_data = {}

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
        getYDProductNumber()
        getTDToken()
        checkYDStatus()
    
    def setAnticheat(self,status,token=None):
        global anticheat_status
        global anticheat_token
        anticheat_status = status
        anticheat_token = token





wmID = ""
productNumber = ""
def getYDProductNumber():
    global productNumber
    productNumber = tools.getStringBetween(rewrite.indexJS, "productNumber:", ",")
    if productNumber:
        productNumber = productNumber.strip().strip('\'"')
        shell.shell.print("\033[32m[INFO]\033[0m","productNumber:",productNumber,"\n")
    else:
        productNumber = ""
        shell.shell.print("\033[31m[ERROR]\033[0m","未找到 productNumber\n")

def getTDToken():
    global wmID
    wmID = tools.getStringBetween(rewrite.indexJS, "getToken(", ",")
    if wmID:
        wmID = wmID.strip().strip('\'"')
        shell.shell.print("\033[32m[INFO]\033[0m","wmID:",wmID,"\n")
    else:
        wmID = ""
        shell.shell.print("\033[31m[ERROR]\033[0m","未找到 wmID\n")

def checkYDStatus():
    if not productNumber or not wmID:
        shell.shell.print("\033[31m[ERROR]\033[0m","未找到 productNumber 或 wmID")
    else:
        shell.shell.print("\033[32m[INFO]\033[0m","productNumber 和 wmID 检查成功，Next...")
        window.evaluate_js(f"setYD('{productNumber}','{wmID}');")

        # 从 userinfo.json 中读取用户信息
        conf_status = getUserInfo()
        if not conf_status:
            # 获取服务器列表, 并询问用户服务器ID
            serverID()
            # 询问用户用户ID
            askUser()
            shell.shell.print("\033[32m[INFO]\033[0m","用户ID:",user,"\n")

            askSetUserInfo()

        # 查询角色信息
        check_QueryRole()

        #兑换
        exchange()





_serverListCache = []

def serverID():
    """
    获取服务器列表
    返回服务器列表数据供前端使用
    """
    global _serverListCache
    stype = input("请输入服务器类型; 1：官服(official)  2：渠道服(channel) 其他数字：服务器id：")
    if stype == "1":
        stype = "official"
    elif stype == "2":
        stype = "channel"
    else:
        print("设置服务器ID")
        shell.shell.print("\033[32m[INFO]\033[0m","设置服务器ID")
        global serverID
        serverID = stype
        return

    res = requests.get(f"https://gameserver.webcgi.163.com/game_servers_info?game=g66&type={stype}")
    if res.status_code == 200:
        serverData = json.loads(res.text)["servers"][0]["data"]
        serverData = tools.quick_sort(serverData, key=lambda x: x["py"][0][0])
        _serverListCache = serverData
        
        print("----服务器列表---\n")
        for server in serverData:
            print(server["id"],": ",server["name"]," ",server["py"][0][0])
        
        return askServerID()
    else:
        print("获取服务器列表失败")

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
        global serverID
        serverID = a
        shell.shell.print("\033[32m[INFO]\033[0m","服务器ID:", a,"\n")

def askUser():
    global user
    user = input("请输入用户ID：")
    shell.shell.print("\033[32m[INFO]\033[0m","用户ID:", user,"\n")

def getUserInfo():
    """
    从 userinfo.json 中读取用户信息
    """
    if not os.path.exists("userinfo.json"):
        shell.shell.print("\033[31m[INFO]\033[0m","未找到 userinfo.json 文件")
        return False
    with open("userinfo.json", "r") as f:
        data = json.load(f)
        global user
        user = data["userid"]
        global serverID
        serverID = data["serverid"]
        shell.shell.print("\033[32m[INFO]\033[0m","用户信息:", data,"\n")
        print("用户ID:",user)
        print("服务器ID:",serverID)
        return True

def askSetUserInfo():
    """
    保存用户信息到 userinfo.json
    """
    s = input("是否保存用户信息到 userinfo.json？(y/n)(空=取消)：")
    if s != "y":
        shell.shell.print("\033[32m[INFO]\033[0m","用户选择不保存用户信息到 userinfo.json")
        return
    if not user or not serverID:
        shell.shell.print("\033[31m[ERROR]\033[0m","用户ID 或服务器ID 为空")
        return
    if os.path.exists("userinfo.json"):
        shell.shell.print("\033[32m[INFO]\033[0m","userinfo.json 文件已存在，覆盖")
    else:
        shell.shell.print("\033[32m[INFO]\033[0m","userinfo.json 文件不存在，创建")
    
    with open("userinfo.json", "w") as f:
        data = {"userid": user, "serverid": serverID}
        json.dump(data, f, indent=4)  


def awaitAnticheat():
    """
    等待 anticheat_status 为 True
    """
    # 重置 anticheat_status 和 anticheat_token
    global anticheat_status
    global anticheat_token
    anticheat_status = False
    anticheat_token = ""

    window.evaluate_js(f"fetchWmAnticheat()")
    n = 0
    # 等待 anticheat_status 为 True
    shell.shell.print("\033[32m[INFO]\033[0m","等待 anticheat_status 返回")
    while not anticheat_status and n < 10:
        time.sleep(1)
        n += 1
    if n >= 10:
        shell.shell.print("\033[31m[ERROR]\033[0m","等待 anticheat_status 返回超时")
        return None, None
    if not anticheat_token:
        shell.shell.print("\033[31m[ERROR]\033[0m","未找到 anticheat_token")
        return None, None
    shell.shell.print("\033[32m[INFO]\033[0m 花费", n, "秒")

    return anticheat_token, anticheat_status

def check_QueryRole():
    """
    查询角色信息
    异步获取服务器列表和用户ID
    """
    anticheat_token, anticheat_status = awaitAnticheat()
    if not anticheat_token or not anticheat_status:
        shell.shell.print("\033[31m[ERROR]\033[0m","获取 anticheat_token 失败")
        return
    
    # 查询角色信息
    shell.shell.print("\033[32m[INFO]\033[0m","check_QueryRole wmAnticheat:",anticheat_token if anticheat_status else "未设置","\n")
    u = f"https://game-exchange.webapp.163.com/g66/query_role?uid={user}&server_id={serverID}&anticheat={anticheat_token}"
    shell.shell.print("\033[32m[INFO]\033[0m","查询URL:", u,"\n")

    res = requests.get(u)
    if res.status_code == 200:
        shell.shell.print("\033[32m[INFO]\033[0m","角色信息:", res.text,"\n")
        print("查询成功")
        global user_data
        user_data = json.loads(res.text)["data"][0]
        print("role_id:",user_data["role_id"])

    else:
        shell.shell.print("\033[31m[ERROR]\033[0m","查询角色信息失败")

def exchange():
    """
    批量兑换礼包码
    从 sn.txt 读取礼包码列表，逐个进行兑换
    每个请求都需要获取一次 anticheat_token
    """
    global user_data
    if not user_data:
        shell.shell.print("\033[31m[ERROR]\033[0m","用户数据为空，请先查询角色信息\n")
        return
    
    role_id = user_data.get("role_id")
    if not role_id:
        shell.shell.print("\033[31m[ERROR]\033[0m","未找到 role_id\n")
        return
    
    # 读取礼包码列表
    try:
        with open('sn.txt', 'r', encoding='utf-8') as f:
            sn_list = [line.strip() for line in f.readlines() if line.strip()]
    except FileNotFoundError:
        shell.shell.print("\033[31m[ERROR]\033[0m","未找到 sn.txt 文件\n")
        return
    
    shell.shell.print("\033[32m[INFO]\033[0m","开始批量兑换，共", len(sn_list), "个礼包码\n")
    
    success_count = 0
    fail_count = 0
    
    for i, sn in enumerate(sn_list, 1):
        shell.shell.print("\033[36m[INFO]\033[0m", f"正在兑换第 {i}/{len(sn_list)} 个礼包码：{sn}\n")
        
        # 每次请求都获取新的 anticheat_token
        anticheat_token, anticheat_status = awaitAnticheat()
        if not anticheat_token or not anticheat_status:
            shell.shell.print("\033[31m[ERROR]\033[0m", f"获取 anticheat_token 失败，跳过礼包码：{sn}\n")
            fail_count += 1
            continue
        
        # 兑换礼包码
        exchange_url = f"https://game-exchange.webapp.163.com/g66/exchange?uid={role_id}&server_id={serverID}&sn={sn}&anticheat={anticheat_token}"
        shell.shell.print("\033[32m[INFO]\033[0m","兑换 URL:", exchange_url,"\n")
        
        res = requests.get(exchange_url)
        if res.status_code == 200:
            result = json.loads(res.text)
            shell.shell.print("\033[32m[INFO]\033[0m","兑换结果:", res.text,"\n")
            
            # 判断兑换是否成功
            if result.get("code") == 200 or result.get("success"):
                shell.shell.print("\033[32m[SUCCESS]\033[0m", f"礼包码 {sn} 兑换成功\n")
                success_count += 1
            else:
                msg = result.get("msg", "")
                shell.shell.print("\033[31m[FAIL]\033[0m", f"礼包码 {sn} 兑换失败：{msg}\n")
                fail_count += 1
        else:
            shell.shell.print("\033[31m[ERROR]\033[0m", f"礼包码 {sn} 请求失败，状态码：{res.status_code}\n")
            fail_count += 1
        
        print(f"兑换{i}/{len(sn_list)}:{sn},{result.get('msg', '')}")
        
        # 添加延迟，避免请求过快
        time.sleep(5)
    
    shell.shell.print("\033[32m[SUMMARY]\033[0m", f"兑换完成，成功：{success_count}, 失败：{fail_count}\n")
       
