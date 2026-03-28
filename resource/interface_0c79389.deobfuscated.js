"use strict";
nie.define("interface", function() {
    commonAction.remote._urlRoot = "https://gameserver.webcgi.163.com/";
    commonAction.remote._urlRoot = "https://gameserver.webcgi.163.com/";
    commonAction.remote2 = commonAction.InitRemote();
    commonAction.remote2._urlRoot = "//game-exchange.webapp.163.com/g66/";

    var Interface = {
        /**
         * 获取服务器列表信息
         * @param {string} type - 服务器类型 (如 "official", "channel")
         * @param {function} successCallback - 成功回调
         * @param {function} errorCallback - 失败回调
         */
        serversInfo: function(type, successCallback, errorCallback) {
            return commonAction.debug() ?
                commonAction.remote._fakeAjax(successCallback, { success: true }) :
                commonAction.remote._doAjax("game_servers_info", { game: "g66", type: type }, successCallback, errorCallback);
        },

        /**
         * 查询用户角色信息
         * @param {string} uid - 用户ID
         * @param {string} serverId - 服务器ID
         * @param {string} anticheat - 反作弊token
         * @param {function} successCallback - 成功回调
         * @param {function} errorCallback - 失败回调
         */
        queryRole: function(uid, serverId, anticheat, successCallback, errorCallback) {
            return commonAction.debug() ?
                commonAction.remote._fakeAjax(successCallback, { success: true }) :
                commonAction.remote2._doAjax("query_role", { uid: uid, server_id: serverId, anticheat: anticheat }, successCallback, errorCallback);
        },

        /**
         * 兑换码兑换
         * @param {string} uid - 用户ID
         * @param {string} serverId - 服务器ID
         * @param {string} exchangeCode - 兑换码
         * @param {string} anticheat - 反作弊token
         * @param {function} successCallback - 成功回调
         * @param {function} errorCallback - 失败回调
         */
        exchangeCode: function(uid, serverId, exchangeCode, anticheat, successCallback, errorCallback) {
            return commonAction.debug() ?
                commonAction.remote._fakeAjax(successCallback, { success: true }) :
                commonAction.remote2._doAjax("exchange", { uid: uid, server_id: serverId, sn: exchangeCode, anticheat: anticheat }, successCallback, errorCallback);
        }
    };

    return Interface;
});
