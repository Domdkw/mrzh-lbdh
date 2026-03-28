"use strict";

/**
 * 游戏官网首页模块
 * 功能包括：视频播放、服务器列表、用户ID验证、兑换码兑换
 */
nie.config.copyRight.setWhite();

nie.define("Index", function() {
    
    var videoPlayer = nie.require("nie.util.videoV2");
    var shareTitle = $("#share_title").html();
    var shareDesc = $("#share_desc").html();
    var sharePic = $("#share_pic").attr("data-src");
    var shareUtil = nie.require("nie.util.shareV5");
    
    shareUtil({
        fat: "#NIE-share",
        type: 1,
        defShow: [23, 22, 2, 1, 24],
        title: shareTitle,
        img: sharePic,
        content: shareDesc
    });
    
    var interfaceUtil = nie.require("interface");
    var $layer = $(".Layer");
    var $accountIDInput = $("#accountID");
    
    var userInputUid = "";
    var userRoleId = null;
    var selectedServerId = null;
    var isUserIdValid = false;
    var validateTimer = null;
    var watchmanToken = null;
    
    initWatchman({
        productNumber: "YD00955476049019",
        protocol: "https",
        onload: function(token) {
            watchmanToken = token;
        }
    });
    
    /**
     * 初始化函数
     */
    var init = function() {
        bindEvents();
        loadServerList();
        initExchangeSystem();
    };
    
    /**
     * 绑定事件处理
     */
    var bindEvents = function() {
        var $playButtons = $(".playVideo");
        
        $playButtons.on("click", function() {
            var clickIndex = $playButtons.index(this);
            var videoUrl = $playButtons.eq(clickIndex).data("video");
            
            if (videoUrl.match(".mp4") || "" == videoUrl) {
                showVideoPlayer("playVideo", videoUrl);
            } else {
                window.open(videoUrl);
            }
        });
        
        $("#tpl").on("click", ".container", function() {
            $(".btn_switch,.gameServer,.serversList").removeClass("on");
        }).on("click", ".Layer,.close", function() {
            hidePopup();
            $("#video-pop .video-box").html("");
        });
    };
    
    /**
     * 显示提示弹窗
     * @param {string} message - 提示消息
     */
    var showAlert = function(message) {
        $(".alertPop").find("p").html(message);
        showPopup("alertPop");
    };
    
    /**
     * 加载服务器列表
     */
    var loadServerList = function() {
        var officialServers = ["official"];
        var channelServers = ["channel"];
        
        $(".serversList ul").html("");
        
        $.each(officialServers, function(index, serverType) {
            interfaceUtil.serversInfo(serverType, function(response) {
                console.log(response.servers[0].data.length);
                if (response.servers[0].data.length) {
                    $.each(response.servers[0].data, function(i, server) {
                        console.log("server", server);
                        $(".serversList ul").append(
                            '<li data-name="' + server.name + '" data-id="' + server.id + '">' + server.name + "</li>"
                        );
                    });
                }
            }, function(error) {
                alert(error.msg);
            });
        });
        
        $.each(channelServers, function(index, serverType) {
            interfaceUtil.serversInfo(serverType, function(response) {
                console.log(response.servers[0].data.length);
                if (response.servers[0].data.length) {
                    $.each(response.servers[0].data, function(i, server) {
                        console.log("server", server);
                        $(".serversList ul").append(
                            '<li data-name="' + server.name + '" data-id="' + server.id + '">' + server.name + "</li>"
                        );
                    });
                }
            }, function(error) {
                alert(error.msg);
            });
        });
    };
    
    /**
     * 获取验证码Token
     * @param {function} callback - 回调函数
     */
    getWatchmanToken = function(callback) {
        if (watchmanToken) {
            watchmanToken.getToken("7aee5137f3b14e1dad04f9b06990a828", function(token) {
                callback(token);
            });
        }
    };
    
    /**
     * 查询用户角色信息
     * @param {string} uid - 用户ID
     * @param {string} serverId - 服务器ID
     * @param {string} token - 验证Token
     */
    var queryUserRole = function(uid, serverId, token) {
        interfaceUtil.queryRole(uid, serverId, token, function(response) {
            console.log(response.data);
            userRoleId = response.data[0].role_id;
            $(".gameNickName").html("用户名：" + response.data[0].name);
            $(".tips_id").addClass("tips_id_correct").removeClass("tips_id_error").html("用户ID有效");
            isUserIdValid = true;
        }, function(error) {
            $(".tips_id").addClass("tips_id_error").removeClass("tips_id_correct").html("用户ID错误或者用户ID和服务器不匹配");
            $(".gameNickName").html("");
            isUserIdValid = false;
            
            var errorMsg = "";
            if (error.msg.uid) {
                errorMsg = "请输入正确<br/>的用户ID";
            } else if (error.msg.indexOf("Bad Request.") != -1) {
                errorMsg = "用户ID错误或者<br/>用户ID和服务器不匹配";
            } else if (
                error.msg.indexOf("请稍后再试") != -1 ||
                error.msg.indexOf("接口错误") != -1 ||
                error.msg.indexOf("channel error") != -1 ||
                error.msg.indexOf("操作失败") != -1
            ) {
                errorMsg = "网络错误，<br/>请稍后再试！";
            } else {
                errorMsg = error.msg;
            }
            alert(errorMsg);
        });
    };
    
    /**
     * 清空表单
     * @param {boolean} clearAll - 是否清空所有字段
     */
    var clearForm = function(clearAll) {
        if (clearAll) {
            $(".mInput input").val("");
            $(".tips_id").removeClass("tips_id_error tips_id_correct").html("");
            $(".gameNickName").html("");
            $("#gameServer").html("请选择服务器");
            userInputUid = "";
            selectedServerId = "";
        } else {
            $("#redeemCode").val("");
        }
    };
    
    /**
     * 兑换礼包码
     * @param {string} roleId - 角色ID
     * @param {string} serverId - 服务器ID
     * @param {string} redeemCode - 兑换码
     * @param {string} token - 验证Token
     */
    var exchangeRedeemCode = function(roleId, serverId, redeemCode, token) {
        interfaceUtil.exchangeCode(roleId, serverId, redeemCode, token, function(response) {
            console.log(response);
            alert("兑换完成！<br/>请在游戏中确认");
            $(".btn_submit").stop().addClass("btn_submit1");
            setTimeout(function() {
                $(".btn_submit").stop().removeClass("btn_submit1");
            }, time);
            clearForm(true);
        }, function(error) {
            console.log(error);
            
            var errorMsg = "";
            if (error.msg.uid) {
                errorMsg = "兑换码不存在<br/>请核对后重试";
            } else if (
                error.msg.indexOf("doesn't exist") != -1 ||
                error.msg.indexOf("not exist") != -1 ||
                error.msg.indexOf("invalid pack code") != -1
            ) {
                errorMsg = "兑换码不存在<br/>请核对后重试";
            } else if (
                error.msg.indexOf("activated this type") != -1 ||
                error.msg.indexOf("already activated the same type") != -1 ||
                error.msg.indexOf("同类型礼包") != -1
            ) {
                errorMsg = "你已经兑换过此礼包";
            } else if (
                error.msg.indexOf("已经兑换") != -1 ||
                error.msg.indexOf("sn reach active limit") != -1 ||
                error.msg.indexOf("sn already used") != -1
            ) {
                errorMsg = "兑换码已被使用";
            } else if (
                error.msg.indexOf("请稍后再试") != -1 ||
                error.msg.indexOf("接口错误") != -1 ||
                error.msg.indexOf("系统错误") != -1 ||
                error.msg.indexOf("channel error") != -1 ||
                error.msg.indexOf("internal error") != -1 ||
                error.msg.indexOf("操作失败") != -1
            ) {
                errorMsg = "兑换失败，<br/>请稍后再试！";
            } else {
                errorMsg = "兑换失败，<br/>请核对您的兑换码！";
            }
            
            alert(errorMsg);
            clearForm(false);
        });
    };
    
    /**
     * 转换全角字符为半角字符
     * @param {string} str - 输入字符串
     * @returns {string} 转换后的字符串
     */
    var convertFullWidthToHalfWidth = function(str) {
        var result = "";
        for (var i = 0; i < str.length; i++) {
            var charCode = str.charCodeAt(i);
            if (charCode > 65248 && charCode < 65375) {
                result += String.fromCharCode(charCode - 65248);
            } else {
                result += String.fromCharCode(charCode);
            }
        }
        console.log(result);
        return result;
    };
    
    /**
     * 初始化兑换系统
     */
    var initExchangeSystem = function() {
        var scrollInitialized = 0;
        
        /**
         * 验证用户ID（带防抖）
         */
        var validateUserId = function() {
            if (validateTimer) {
                clearTimeout(validateTimer);
            }
            validateTimer = setTimeout(function() {
                getWatchmanToken(function(token) {
                    queryUserRole(convertFullWidthToHalfWidth(userInputUid), selectedServerId, token);
                });
            }, 600);
        };
        
        $(".serversList").on("click", "li", function() {
            $("#gameServer").html($(this).html());
            selectedServerId = $(this).attr("data-id");
            userInputUid = $.trim($("#accountID").val());
            console.log("uid", userInputUid);
            
            if (userInputUid && "" != userInputUid) {
                validateUserId();
            }
        });
        
        $accountIDInput.on("input", function() {
            userInputUid = $.trim($("#accountID").val());
            if (selectedServerId) {
                validateUserId();
            }
        });
        
        $(".confirmBox").on("click", ".btn_how", function() {
            showPopup("checkIDPop");
        }).on("click", ".btn_how1", function() {
            showPopup("checkIDPop1");
        }).on("click", ".btn_switch,.gameServer", function() {
            $(".btn_switch,.gameServer").toggleClass("on");
            $(".serversList").toggleClass("on");
            
            if (scrollInitialized == 0) {
                $(".serversList .scrollBox").niceScroll({
                    cursorcolor: "#292829",
                    cursorwidth: 10,
                    cursorborder: 0,
                    cursorborderradius: 0,
                    cursoropacitymin: 1,
                    cursoropacitymax: 1
                });
                scrollInitialized = 1;
            }
            
            return $(".btn_switch,.gameServer,.serversList").hasClass("on") ? false : void 0;
        });
        
        $(".search").click(function(e) {
            e.stopPropagation();
        });
        
        $(".search").on("input propertychange", function() {
            var searchText = $(this).val();
            $(".scrollBox li").hide();
            $(".scrollBox li").filter(":Contains(" + searchText + ")").fadeIn(500);
            
            setTimeout(function() {
                $(".serversList .scrollBox ul").getNiceScroll().resize();
            }, 600);
        });
        
        $(".confirmBox").on("click", ".btn_submit", function() {
            if ($(".btn_submit").hasClass("btn_submit1")) {
                alert("兑换太频繁了，请稍后再试");
                return;
            }
            
            var redeemCode = $.trim($("#redeemCode").val());
            
            if (!userInputUid) {
                alert("请输入你的用户ID");
                return;
            }
            
            if (!selectedServerId) {
                alert("请选择服务器");
                return;
            }
            
            if (!isUserIdValid) {
                alert("请先确认用户ID");
                return;
            }
            
            if (redeemCode == "") {
                alert("请输入兑换码");
                return;
            }
            
            getWatchmanToken(function(token) {
                exchangeRedeemCode(userRoleId, selectedServerId, redeemCode, token);
            });
        });
    };
    
    /**
     * 显示视频播放器
     * @param {string} type - 播放类型
     * @param {string} videoUrl - 视频地址
     */
    var showVideoPlayer = function(type, videoUrl) {
        if (videoUrl != "") {
            videoPlayer({
                fat: ".video-box",
                width: "800",
                height: "450",
                wmode: "direct",
                movieUrl: videoUrl,
                autoPlay: true
            });
            showPopup("video-pop");
        } else {
            alert("敬请期待！");
        }
    };
    
    /**
     * 显示弹窗
     * @param {string} popupClass - 弹窗类名
     */
    var showPopup = function(popupClass) {
        var $popup = $("." + popupClass);
        $popup.fadeIn();
        
        if (popupClass == "checkIDPop") {
            var topPosition = $(window).scrollTop() + (document.documentElement.clientHeight / 2 - $popup.height() / 2 - 100);
            $layer.fadeIn();
            $popup.css("top", topPosition);
        } else if (popupClass == "checkIDPop1") {
            var topPosition = $(window).scrollTop() + (document.documentElement.clientHeight / 2 - $popup.height() / 2 - 100);
            $layer.fadeIn();
            $popup.css("top", topPosition);
        } else {
            var marginTop = (1 * $popup.height() + parseInt($popup.css("padding-top")) + parseInt($popup.css("padding-bottom"))) / 2;
            $layer.fadeIn();
            $popup.css("margin-top", -marginTop);
        }
    };
    
    /**
     * 隐藏弹窗
     */
    var hidePopup = function() {
        $layer.fadeOut();
        $(".pop").fadeOut();
    };
    
    init();
    window.alert = showAlert;
});
