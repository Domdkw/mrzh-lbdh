function getUserInfo(){
//选择后查询角色信息
    var uid = ''
    var server_id = ''
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
}
