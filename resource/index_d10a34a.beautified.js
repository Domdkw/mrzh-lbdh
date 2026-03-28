"use strict";
nie.config.copyRight.setWhite(), nie.define("Index", function() {
    var e = nie.require("nie.util.videoV2"),
        t = $("#share_title").html(),
        n = $("#share_desc").html(),
        i = $("#share_pic").attr("data-src"),
        o = nie.require("nie.util.shareV5"),
        r = (o({
            fat: "#NIE-share",
            type: 1,
            defShow: [23, 22, 2, 1, 24],
            title: t,
            img: i,
            content: n
        }), nie.require("interface")),
        s = $(".Layer"),
        a = $("#accountID"),
        c = void 0,
        l = void 0,
        d = void 0,
        m = !1,
        u = null,
        f = null;
    initWatchman({
        productNumber: "YD00955476049019",
        protocol: "https",
        onload: function(e) {
            f = e
        }
    });
    var h = function() {
            g(), p(), O()
        },
        g = function() {
            var e = $(".playVideo");
            e.on("click", function() {
                var t = e.index(this),
                    n = e.eq(t).data("video");
                n.match(".mp4") || "" == n ? k("playVideo", n) : window.open(n)
            }), $("#tpl").on("click", ".container", function() {
                $(".btn_switch,.gameServer,.serversList").removeClass("on")
            }).on("click", ".Layer,.close", function() {
                D(), $("#video-pop .video-box").html("")
            })
        },
        v = function(e) {
            $(".alertPop").find("p").html(e), w("alertPop")
        },
        p = function() {
            var e = ["official"],
                t = ["channel"];
            $(".serversList ul").html(""), $.each(e, function(e, t) {
                r.serversInfo(t, function(e) {
                    console.log(e.servers[0].data.length), e.servers[0].data.length && $.each(e.servers[0].data, function(e, t) {
                        console.log("server", t), $(".serversList ul").append('<li data-name="' + t.name + '" data-id="' + t.id + '">' + t.name + "</li>")
                    })
                }, function(e) {
                    alert(e.msg)
                })
            }), $.each(t, function(e, t) {
                r.serversInfo(t, function(e) {
                    console.log(e.servers[0].data.length), e.servers[0].data.length && $.each(e.servers[0].data, function(e, t) {
                        console.log("server", t), $(".serversList ul").append('<li data-name="' + t.name + '" data-id="' + t.id + '">' + t.name + "</li>")
                    })
                }, function(e) {
                    alert(e.msg)
                })
            })
        },
        b = function(e) {
            f && f.getToken("7aee5137f3b14e1dad04f9b06990a828", function(t) {
                e(t)
            })
        },
        x = function(e, t, n) {
            r.queryRole(e, t, n, function(e) {
                console.log(e.data), l = e.data[0].role_id, $(".gameNickName").html("\u7528\u6237\u540d\uff1a" + e.data[0].name), $(".tips_id").addClass("tips_id_correct").removeClass("tips_id_error").html("\u7528\u6237ID\u6709\u6548"), m = !0
            }, function(e) {
                $(".tips_id").addClass("tips_id_error").removeClass("tips_id_correct").html("\u7528\u6237ID\u9519\u8bef\u6216\u8005\u7528\u6237ID\u548c\u670d\u52a1\u5668\u4e0d\u5339\u914d"), $(".gameNickName").html(""), m = !1, alert(e.msg.uid ? "\u8bf7\u8f93\u5165\u6b63\u786e<br/>\u7684\u7528\u6237ID" : -1 != e.msg.indexOf("Bad Request.") ? "\u7528\u6237ID\u9519\u8bef\u6216\u8005<br/>\u7528\u6237ID\u548c\u670d\u52a1\u5668\u4e0d\u5339\u914d" : -1 != e.msg.indexOf("\u8bf7\u7a0d\u540e\u518d\u8bd5") || -1 != e.msg.indexOf("\u63a5\u53e3\u9519\u8bef") || -1 != e.msg.indexOf("channel error") || -1 != e.msg.indexOf("\u64cd\u4f5c\u5931\u8d25") ? "\u7f51\u7edc\u9519\u8bef\uff0c<br/>\u8bf7\u7a0d\u540e\u518d\u8bd5\uff01" : e.msg)
            })
        },
        _ = function(e) {
            e ? ($(".mInput input").val(""), $(".tips_id").removeClass("tips_id_error tips_id_correct").html(""), $(".gameNickName").html(""), $("#gameServer").html("\u8bf7\u9009\u62e9\u670d\u52a1\u5668"), c = "", d = "") : $("#redeemCode").val("")
        },
        I = function(e, t, n, i) {
            r.exchangeCode(e, t, n, i, function(e) {
                console.log(e), alert("\u5151\u6362\u5b8c\u6210\uff01<br/>\u8bf7\u5728\u6e38\u620f\u4e2d\u786e\u8ba4"), $(".btn_submit").stop().addClass("btn_submit1"), setTimeout(function() {
                    $(".btn_submit").stop().removeClass("btn_submit1")
                }, time), _(!0)
            }, function(e) {
                console.log(e), alert(e.msg.uid ? "\u5151\u6362\u7801\u4e0d\u5b58\u5728<br/>\u8bf7\u6838\u5bf9\u540e\u91cd\u8bd5" : -1 != e.msg.indexOf("doesn't exist") || -1 != e.msg.indexOf("not exist") || -1 != e.msg.indexOf("invalid pack code") ? "\u5151\u6362\u7801\u4e0d\u5b58\u5728<br/>\u8bf7\u6838\u5bf9\u540e\u91cd\u8bd5" : -1 != e.msg.indexOf("activated this type") || -1 != e.msg.indexOf("already activated the same type") || -1 != e.msg.indexOf("\u540c\u7c7b\u578b\u793c\u5305") ? "\u4f60\u5df2\u7ecf\u5151\u6362\u8fc7\u6b64\u793c\u5305" : -1 != e.msg.indexOf("\u5df2\u7ecf\u5151\u6362") || -1 != e.msg.indexOf("sn reach active limit") || -1 != e.msg.indexOf("sn already used") ? "\u5151\u6362\u7801\u5df2\u88ab\u4f7f\u7528" : -1 != e.msg.indexOf("\u8bf7\u7a0d\u540e\u518d\u8bd5") || -1 != e.msg.indexOf("\u63a5\u53e3\u9519\u8bef") || -1 != e.msg.indexOf("\u7cfb\u7edf\u9519\u8bef") || -1 != e.msg.indexOf("channel error") || -1 != e.msg.indexOf("internal error") || -1 != e.msg.indexOf("\u64cd\u4f5c\u5931\u8d25") ? "\u5151\u6362\u5931\u8d25\uff0c<br/>\u8bf7\u7a0d\u540e\u518d\u8bd5\uff01" : "\u5151\u6362\u5931\u8d25\uff0c<br/>\u8bf7\u6838\u5bf9\u60a8\u7684\u5151\u6362\u7801\uff01"), _(!1)
            })
        },
        C = function(e) {
            for (var t = "", n = 0; n < e.length; n++) t += String.fromCharCode(e.charCodeAt(n) > 65248 && e.charCodeAt(n) < 65375 ? e.charCodeAt(n) - 65248 : e.charCodeAt(n));
            return console.log(t), t
        },
        O = function() {
            function e() {
                u && clearTimeout(u), u = setTimeout(function() {
                    b(function(e) {
                        x(C(c), d, e)
                    })
                }, 600)
            }
            var t = 0;
            $(".serversList").on("click", "li", function() {
                $("#gameServer").html($(this).html()), d = $(this).attr("data-id"), c = $.trim($("#accountID").val()), console.log("uid", c), c && "" != c && e()
            }), a.on("input", function() {
                c = $.trim($("#accountID").val()), d && e()
            }), $(".confirmBox").on("click", ".btn_how", function() {
                w("checkIDPop")
            }).on("click", ".btn_how1", function() {
                w("checkIDPop1")
            }).on("click", ".btn_switch,.gameServer", function() {
                return $(".btn_switch,.gameServer").toggleClass("on"), $(".serversList").toggleClass("on"), 0 == t && ($(".serversList .scrollBox").niceScroll({
                    cursorcolor: "#292829",
                    cursorwidth: 10,
                    cursorborder: 0,
                    cursorborderradius: 0,
                    cursoropacitymin: 1,
                    cursoropacitymax: 1
                }), t = 1), $(".btn_switch,.gameServer,.serversList").hasClass("on") ? !1 : void 0
            }), $(".search").click(function(e) {
                e.stopPropagation()
            }), $(".search").on("input propertychange", function() {
                var e = $(this).val();
                $(".scrollBox li").hide(), $(".scrollBox li").filter(":Contains(" + e + ")").fadeIn(500), setTimeout(function() {
                    $(".serversList .scrollBox ul").getNiceScroll().resize()
                }, 600)
            });
            $(".confirmBox").on("click", ".btn_submit", function() {
                $(".btn_submit").hasClass("btn_submit1") ? alert("\u5151\u6362\u592a\u9891\u7e41\u4e86\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5") : ! function() {
                    var e = $.trim($("#redeemCode").val());
                    c ? d ? m ? "" == e ? alert("\u8bf7\u8f93\u5165\u5151\u6362\u7801") : b(function(t) {
                        I(l, d, e, t)
                    }) : alert("\u8bf7\u5148\u786e\u8ba4\u7528\u6237ID") : alert("\u8bf7\u9009\u62e9\u670d\u52a1\u5668") : alert("\u8bf7\u8f93\u5165\u4f60\u7684\u7528\u6237ID")
                }()
            })
        },
        k = function(t, n) {
            if ("" != n) {
                {
                    e({
                        fat: ".video-box",
                        width: "800",
                        height: "450",
                        wmode: "direct",
                        movieUrl: n,
                        autoPlay: !0
                    })
                }
                w("video-pop")
            } else alert("\u656c\u8bf7\u671f\u5f85\uff01")
        },
        w = function(e) {
            var t = $("." + e);
            if (t.fadeIn(), "checkIDPop" == e) {
                var n = $(window).scrollTop() + (document.documentElement.clientHeight / 2 - t.height() / 2 - 100);
                s.fadeIn(), t.css("top", n)
            } else if ("checkIDPop1" == e) {
                var n = $(window).scrollTop() + (document.documentElement.clientHeight / 2 - t.height() / 2 - 100);
                s.fadeIn(), t.css("top", n)
            } else {
                var i = (1 * t.height() + parseInt(t.css("padding-top")) + parseInt(t.css("padding-bottom"))) / 2;
                s.fadeIn(), t.css("margin-top", -i)
            }
        },
        D = function() {
            s.fadeOut(), $(".pop").fadeOut()
        };
    h(), window.alert = v
});