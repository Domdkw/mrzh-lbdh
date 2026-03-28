console.log("XHR 拦截已注入");

let pywebview_status = false;
let pageOnLoaded = false;
// XHR 日志记录
let xhrLogCache = [];
//先记录，后发送到pywebview日志，解决pywebview对象未初始化问题


/**
 * 页面加载完成后的回调函数
 */
function onPywebviewReady() {
    pywebview_status = true;
    pageOnLoaded = true;
    console.log("pywebview ready");

    //发送xhr日志到pywebview日志
    sendOldXHRLog();

    //发送index.js到pywebview
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



