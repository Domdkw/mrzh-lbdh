nie.define(function() {
  var Interface = nie.require("Interface");
  var Time = nie.require("util.bjTime");
  var clicktime=true;
  var djsTime = null;
  var _role_id = '';

  //易盾初始化
  var wm = null;
  // 初始化SDK，只需初始化一次
  // auto使用默认值，即自动化模式
  initWatchman({
    productNumber: 'YD00955476049019',
    onload: function (instance) {
      wm = instance;
    },
    onerror: function (err) {
      console.log(err)
    }
  });

  // 关注公众号
  $("#gzGzh").click(function() {
    $(".sharemask").addClass("on");
  });
  $(".sharemask").click(function() {
    $(".sharemask").removeClass("on");
  });

  //弹层
  $(".id-box a").click(function () {
    $(".mask, .pop1").addClass("on");
  })
  $('.btn-zysx').on("click", function(){
	 $(".mask, .pop3").addClass("on");
  })
  $(".mask, .close").click(function () {
    $(".mask, .pop").removeClass("on");
	$('.pop-wx').removeClass('show');
  })
  $('.pop-wx').on('click','.pop-close',function(){
  	$('.mask').removeClass('on');
  	$('.pop-wx').removeClass('show');
  })
  
  $('#btn_wx').click(function() {
  	$('.mask').addClass('on');
  	$('.pop-wx').addClass('show')
  })
  $(".btn_toTop")[0].addEventListener("click", function(e){
	window.scrollTo(0,0);
  }, false);

  //服务器下拉栏
  $(".server-box").click(function () {
    if($(".server-list").hasClass("on")){
      $(".server-list").removeClass("on");
      $(".icon-xl").removeClass("on");
    }else{
      $(".server-list").addClass("on");
      $(".icon-xl").addClass("on");
    }
  })
    $(".search").click(function(event){
		event.stopPropagation();    //  阻止事件冒泡
	});
	$('.search').on('input propertychange', function() {
		 var keyword = $(this).val();
		console.log(keyword)
		$('.list-box li').hide()//将原有的内容隐藏
		//然后将含有keyword的li进行渐变显示
		$(".list-box li").filter(":Contains("+keyword+")").show();
    });
  $(".server-list").on('click','li',function () {
    $(".select").attr("data-id", $(this).attr("data-id"));
    $(".select span").text($(this).text());
    $(this).addClass("on").siblings().removeClass("on")
    //选择后查询角色信息
    var uid = $(".id-box input").val();
    var server_id = $(".select").attr("data-id");
	if(server_id == 0){
		showPop2("请选择服务器", 1)
	}else if(uid != "" && server_id.length >1){
    // if(uid != "" && server_id != ""){
      wm && wm.getToken('7aee5137f3b14e1dad04f9b06990a828', function(token) {
        // 将token作为参数提交到服务端
        queryUserInfo(ToCDB(uid), server_id, token);
      });
    }else{
      $(".tips-server").removeClass("on");
    }
  })

  //id和服务器 填写后查询角色信息
  $(".id-box input").blur(function(){
    var uid = $(".id-box input").val();
    var server_id = $(".select").attr("data-id");
	console.log(typeof(server_id))
	console.log(server_id)
    // if(server_id == 0){
    // 	showPop2("请选择服务器", 1)
    // }else 
	if(uid != "" && server_id.length >1){
      wm && wm.getToken('7aee5137f3b14e1dad04f9b06990a828', function(token) {
        // 将token作为参数提交到服务端
        queryUserInfo(ToCDB(uid), server_id, token);
      });
    }else{
        $(".tips-server").removeClass("on");
    }
  });

  $(".id-box input, .code-box input").blur(function () {
	//console.log('ok11')
    var top = $(window).scrollTop();
    if(top < 5){
      $(window).scrollTop(top + 1);
    }else{
      $(window).scrollTop(top - 1);
    }
  })
 //倒计时
	function djs($obj) {
		var m = 60;
		$obj.addClass("btn-disable");
		djsTime = setInterval(function () {
			m--;
			if (m <= 0) {
				clearInterval(djsTime);
				djsTime = null;
				$obj.removeClass("btn-disable")
			}
		}, 1000);
	}		
    //点击兑换
	$(".btn-confirm").click(function () {
		if($('.btn-confirm').hasClass("btn-disable")){
			 showPop2("兑换太频繁了，请稍后再试", 1)
		}else{
			 var uid = $(".id-box input").val();
			 var server_id = $(".select").attr("data-id");
			 var sn = $(".code-box input").val();
			 if(uid == ""){
			   showPop2("请输入你的用户ID", 1)
			 }else if(server_id == ""||server_id == "0"){
			   showPop2("请选择服务器", 1)
			 }
			else if(sn == ""){
			  showPop2("请输入您的兑换码", 1)
			}
			else if($(".tips-id.invalid").hasClass("on")){
			  showPop2("请先确认用户ID", 1)
			  return false;
			}else{
			   wm && wm.getToken('7aee5137f3b14e1dad04f9b06990a828', function(token) {
				 // 将token作为参数提交到服务端
				 exchange(_role_id, server_id, sn, token);
			   });
			 }
	  	}	
	})  

  function showPop2(txt,flag) {
    if(flag==undefined){
      $(".pop2 .txt").removeClass("txt1 txt2 txt3 txt4 txt5 txt6").addClass(txt).html("");
    }else{
      $(".pop2 .txt").removeClass("txt1 txt2 txt3 txt4 txt5 txt6").html("<p>"+ txt +"</p>");
      // $(".pop2 .txt").html("<p>"+ txt +"</p>")
    }
    $(".mask, .pop2").addClass("on");
  }

  //兑换接口
  function exchange(uid, server_id, sn, anticheat) {
    Interface.fn.exchange(uid, server_id, sn, anticheat, function (res) {
      showPop2("兑换成功，请前往游戏确认", 1);
	  var $btnan=$(".btn-confirm");
	  djs($btnan);
	  console.log(res)
    },function (res) {
      console.log(res.msg)
      if(res.msg.uid){
        showPop2("兑换码不存在，请核对后重试", 1);
      }else if(res.msg.indexOf("doesn't exist")!=-1||res.msg.indexOf('not exist')!=-1||res.msg.indexOf("invalid pack code")!=-1){
        showPop2("兑换码不存在，请核对后重试", 1);
      }else if(res.msg.indexOf('activated this type')!=-1||res.msg.indexOf('already activated the same type')!=-1){
        showPop2("你已经兑换过该礼包", 1);
      }else if(res.msg.indexOf('sn reach active limit')!=-1){
        showPop2("uid已达兑换上限", 1);
      }else if(res.msg.indexOf('已激活过同类型礼包码')!=-1||res.msg.indexOf('sn already used')!=-1){
        showPop2("你已兑换过此礼包", 1);
      }else if(res.msg.indexOf('请稍后再试')!=-1||res.msg.indexOf('接口错误')!=-1||res.msg.indexOf('系统错误')!=-1||res.msg.indexOf('channel error')!=-1||res.msg.indexOf("internal error")!=-1||res.msg.indexOf('操作失败')!=-1){
        showPop2('兑换失败，请稍后再试！', 1);
      }else{
        showPop2('兑换失败，请核对您的兑换码！', 1);
      }
      // showPop2("txt3");
    })
  }
  
  //查询角色接口
  function queryUserInfo(uid, server_id, anticheat) {
    Interface.fn.queryUserInfo(uid, server_id, anticheat, function (res) {
      $(".tips-server").text("用户名："+res.data[0].name);
      _role_id = res.data[0].role_id;
      $(".tips-id.invalid").removeClass("on");
      $(".tips-server, .tips-id.valid").addClass("on");
    },function (res) {
	  // console.log(res)
      $(".tips-server, .tips-id.valid").removeClass("on");
      $(".tips-id.invalid").addClass("on");
	   // console.log(res.msg)
      if(res.msg.uid){
        showPop2('请先确认用户ID',1);
      }else if(res.msg.indexOf('Bad Request.')!=-1){ 
        showPop2('请先确认用户ID',1);
      }else if(res.msg.indexOf('请稍后再试')!=-1||res.msg.indexOf('接口错误')!=-1||res.msg.indexOf('channel error')!=-1||res.msg.indexOf('操作失败')!=-1){
        showPop2('系统错误，请稍后再试！', 1);
      }else{
        showPop2(res.msg,1);
      }

    })
  }

  //查询服务器列表
  function queryServersList(type) {
    Interface.fn.queryServersList(type,function (res) {
      var $listBox = $(".list-box");
	  console.log(res)
      var arr = res.servers[0].data;
	  console.log(arr.length)
      for(var i=0;i<arr.length;i++){
        $listBox.append(
          '<li class="item" data-name="' + arr[i].name + '" data-id="' + arr[i].id + '">'+ arr[i].name +'</li>'
        )
      }
    },function (res) {
        
    })
  }

  function initServer(){
    var $listBox = $(".list-box");
    let typeArr=['na','au','sea'];
    $.each(typeArr,function(idex,serverData){
      Interface.fn.queryServersList(serverData, function (res) {
        if(res.servers[0].data.length){
          $.each(res.servers[0].data,function(i,server){
            $listBox.append(
			  '<li class="item" data-name="' + server.name + '" data-id="' + server.id + '">'+ server.name +'</li>'
            )
          });
        }
      }, function (res) {
        alert(res.msg);
      });
    });
  }

  function ToCDB(str){//全角转半角
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

	queryServersList('channel');
    queryServersList('official');
  // initServer();

});