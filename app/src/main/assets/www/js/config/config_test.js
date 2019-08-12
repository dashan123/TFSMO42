//var loadingHtml = "<table width='10px' height='40px'><tr><td align='right' width='100%' valign='middle'><img src='images/ajax-loader.gif' width='32' height='32'/></td></tr></table>";
/********************************************************************************/
var main_page_size = 5;
var news_page_size = 20;
var oa_page_size = 12;
var email_page_size = 12;
var callback = '?callback=?';
var navigationFlag = 0;

var sendType = "";

//默认语言
var sysLang = "zh_CN"

if(typeof(local.get("server_config"))=="undefined" || $.trim(local.get("server_config"))=="" || $.trim(local.get("server_config"))=="undefined"){
local.set("server_config","103.235.250.24");
}

//默认访问协议
//var serverProtocol = "https";
var serverProtocol = "http";

//设置默认服务 地址
var serverConfig = serverProtocol + "://"+local.get("server_config");
var basePath = serverConfig + "/tfsmo";
var contextPath = basePath + "/app";

//更新服务配置
function refreshServerConfig(){
	 serverConfig = serverProtocol + "://"+local.get("server_config");
	 basePath = serverConfig + "/tfsmo";
	 contextPath = basePath + "/app";
}

//更新语言
function refreshLang(fn) {
//	$.i18n.properties({
//	    path:'message/',
//	    language:sysLang,
//	    callback: function() {
//	        if (fn) fn();
//	    }
//	});
}
refreshLang();

$(document).bind("mobileinit", function(){
	 $.mobile.ajaxEnabled = true;
	 $.mobile.loadingMessageTextVisible = true;
	 $.mobile.defaultPageTransition = 'none';
	 $.mobile.defaultDialogTransition = 'none';
	 $.mobile.transitionFallbacks.slideout = "none"; 
	 $.mobile.selectmenu.prototype.options.nativeMenu = false;
	 $.mobile.page.prototype.options.domCache = false;
	 
});