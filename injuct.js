console.log("XHR 拦截已注入");

let pywebview_status = false;
let pageOnLoaded = false;
// XHR 日志记录
let xhrLogCache = [];
//先记录，后发送到pywebview日志，解决pywebview对象未初始化问题
let productNumber = "";
let wmID = "";
let serverID = "";



/**
 * 页面加载完成后的回调函数
 */
function onPywebviewReady() {
    pywebview_status = true;
    pageOnLoaded = true;
    console.log("pywebview ready");

    //发送xhr日志到pywebview日志
    sendOldXHRLog();

    //测试wm是否暴露
    console.log("wm:",window.wm);
    sendLog("wm:"+toString(window.wm));

    //加载完成时发送解析指令
    window.pywebview.api.parseIndexJS();
}

function sendLog(log) {
    if (pageOnLoaded) {
        window.pywebview.api.getLog(log);
    }else{
        xhrLogCache.push(log);
    }
}
function sendOldXHRLog() {
    if (pywebview_status) {
        console.log("发送旧xhr日志到pywebview日志");
        for(let i=0;i<xhrLogCache.length;i++){
            window.pywebview.api.getLog(xhrLogCache[i]);
        }
    }
}

window.onload = function() {
    console.log("页面加载完成");
    //开启检查pywebview状态的定时器
    setTimeout(() => {
        checkPywebview(onPywebviewReady);
    }, 2000);
}

function checkPywebview(callback) {
    if (window.pywebview && window.pywebview.api) {
        pywebview_status = true;
        console.log("pywebview 对象已可用");
        callback();
    } else {
        // 递归调用，检查是否可用
        setTimeout(() => {
            checkPywebview(callback);
        }, 1000);
        console.log("pywebview 对象检查");
    }
}


// 保存原始 XHR 构造函数
const OriginalXHR = window.XMLHttpRequest;
// 覆写XHR
window.XMLHttpRequest = function() {
    const xhr = new OriginalXHR();
    const originalOpen = xhr.open;
    const originalSend = xhr.send;
    
    xhr.open = function(method, url, ...args) {
        xhr._url = url;
        xhr._method = method;
        sendLog({ method, url });
        console.log('XHR Open:', method, url);
        return originalOpen.call(this, method, url, ...args);
    };
    
    xhr.send = function(body) {
        sendLog({ method: xhr._method, url: xhr._url, body });
        console.log('XHR Send:', xhr._method, xhr._url, body || '');
        return originalSend.call(this, body);
    };
    
    return xhr;
};


/**
 * 覆写jQuery ajax方法
 * 用于拦截和记录所有通过jQuery发起的ajax请求
 */
function overrideJQueryAjax() {
    if (window.$ && window.$.ajax) {
        const originalAjax = $.ajax;
        
        $.ajax = function(url, options) {
            let settings = {};
            
            if (typeof url === 'object') {
                settings = url;
            } else {
                settings = options || {};
                settings.url = url;
            }
            
            const logEntry = {
                method: settings.type || settings.method || 'GET',
                url: settings.url,
                data: settings.data,
                timestamp: new Date().toISOString()
            };
            
            sendLog(logEntry);
            console.log('jQuery AJAX(rewrite):', logEntry.method, logEntry.url, logEntry.data || '');
            
            return originalAjax.call(this, settings);
        };
    } else {
        setTimeout(overrideJQueryAjax, 500);
    }
}

overrideJQueryAjax();

function tocdb(str) {//全角转半角 源代码
var tmp = "";
for (var i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 65248 && str.charCodeAt(i) < 65375) {
    tmp += String.fromCharCode(str.charCodeAt(i) - 65248);
    }
    else {
    tmp += String.fromCharCode(str.charCodeAt(i));
    }
}
console.log(tmp);
return tmp;
}


function setYD(p,w){
    productNumber = p;
    wmID = w;
    console.log("setYD",p,w);
}

let currentToken = null;

/**
 * 获取wmID后重置watchman计数器，避免服务器风控
 */
let wmAnticheatCount = 0;

/**
 * wm重置状态标志
 * true: 正在重置中，禁止获取token
 * false: 正常状态
 */
let isWmResetting = false;

/**
 * 清除所有cookies
 */
function clearAllCookies() {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
        if (window.location.hostname.indexOf('.') > -1) {
            const domain = '.' + window.location.hostname.split('.').slice(-2).join('.');
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + domain;
        }
    }
    sendLog("\x1b[32m[INFO]\x1b[0m [clearAllCookies] 已清除所有cookies");
}

/**
 * 重置Watchman环境
 * 使用Promise封装异步操作，确保stop和start按顺序完成
 * @returns {Promise<boolean>} 重置是否成功
 */
function resetWmEnvironment() {
    return new Promise((resolve) => {
        if (isWmResetting) {
            sendLog("\x1b[33m[WARN]\x1b[0m [resetWmEnvironment] 正在重置中，请稍候...");
            resolve(false);
            return;
        }
        
        if (!window.wm) {
            console.error("[resetWmEnvironment] wm 未暴露");
            sendLog("\x1b[31m[ERROR]\x1b[0m [resetWmEnvironment] wm 未暴露");
            resolve(false);
            return;
        }
        if (!wmID) {
            console.error("[resetWmEnvironment] wmID 未设置");
            sendLog("\x1b[31m[ERROR]\x1b[0m [resetWmEnvironment] wmID 未设置");
            resolve(false);
            return;
        }

        isWmResetting = true;
        wmAnticheatCount = 0;
        currentToken = null;
        
        sendLog("\x1b[36m[INFO]\x1b[0m [resetWmEnvironment] 开始重置Watchman...");
        
        window.wm.stop(function() {
            console.log("[resetWmEnvironment] wm stopped");
            sendLog("\x1b[32m[INFO]\x1b[0m [resetWmEnvironment] wm stopped");
            
            clearAllCookies();
            localStorage.clear();
            sessionStorage.clear();
            sendLog("\x1b[32m[INFO]\x1b[0m [resetWmEnvironment] 已清除cookie,localStorage,sessionStorage");
            
            window.wm.start(function() {
                console.log("[resetWmEnvironment] wm started");
                sendLog("\x1b[32m[INFO]\x1b[0m [resetWmEnvironment] wm started");
                isWmResetting = false;
                sendLog("\x1b[32m[INFO]\x1b[0m [resetWmEnvironment] 重置Watchman完成");
                resolve(true);
            });
        });
    });
}

/**
 * 获取Watchman反作弊Token
 * 超过5次自动重置Watchman环境
 */
async function fetchWmAnticheat() {
    if (isWmResetting) {
        sendLog("\x1b[33m[WARN]\x1b[0m [fetchWmAnticheat] Watchman正在重置中，跳过本次请求");
        return;
    }
    
    if (wmAnticheatCount >= 5) {
        sendLog("\x1b[33m[WARN]\x1b[0m [fetchWmAnticheat] 达到5次限制，开始重置Watchman...");
        const resetSuccess = await resetWmEnvironment();
        if (!resetSuccess) {
            sendLog("\x1b[31m[ERROR]\x1b[0m [fetchWmAnticheat] Watchman重置失败");
            return;
        }
    }
    
    if (!window.wm) {
        console.error("[fetchWmAnticheat] wm 未暴露");
        sendLog("\x1b[31m[ERROR]\x1b[0m [fetchWmAnticheat] wm 未暴露");
        return;
    }
    if (!wmID) {
        console.error("[fetchWmAnticheat] wmID 未设置");
        sendLog("\x1b[31m[ERROR]\x1b[0m [fetchWmAnticheat] wmID 未设置");
        return;
    }
    
    wm.getToken(wmID, function(token) {
        const a = "[fetchWmAnticheat] getToken token:" + token + "  c:" + wmAnticheatCount;
        console.log(a);
        sendLog("\x1b[32m[INFO]\x1b[0m " + a);
        currentToken = token;
        wmAnticheatCount += 1;
        window.pywebview.api.setAnticheat(true, token);
    });
}

