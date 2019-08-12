/**
 * ***************************login init begin***************************************
 */
var login_page = $('#login_page');
/** ****************************home_page---begin************************************* */
login_page.live('pageinit', function(e, ui) {
	login_page.find("#goto_submit_id").live("tap", function() {
		goto_submit();
	});
	login_page.find("#loginsetting").live("fastClick", function() {
		goto_page("server_config_page");
	});

	login_page.find("#remember_loginname_label").live("tap", function() {
		var login_page = $("#login_page");
		var obj = login_page.find("#remember_loginname");
		//var obj = $(this).find("input");
		if (obj) {
			if ($(obj).is(":checked")) {
				$(obj).removeAttr("checked");
				//$(obj).prop("checked", false).checkboxradio("refresh");
			} else {
				$(obj).attr("checked", "checked");
				//$(obj).prop("checked", true).checkboxradio("refresh");
			}
		}
	});
	login_page.find(".forgot_password_label").live("tap", function() {
		showMessage('请到门户系统修改密码！', 5000);
	});
	login_page.find(".gesture_password_label").live("tap", function() {
		gestureLockLogin();
	});
	// 为选择按钮增加事件
	login_page.find(".remember_loginname").live("fastClick", function() {
		return false;
	});

});
login_page
		.live('pageshow',
				function(e, ui) {
					// 判断登陆状态，如果人为跳转到登陆页面 那么直接转到代办页面
					if ((session.get("hasloginin")
							&& session.get("hasloginin") != null && session
							.get("hasloginin") == "yes")) {
						goto_page("workbench_page");
						return;
					}

					$(".loginsection").find(".LoginBox").find("input")
							.removeAttr("class");
					$(".RemPwd").find("input[type='checkbox']").parent("div")
							.removeAttr("class").css("display", "inline");
					$(".loginsection").find(".submit").removeClass("ui-link");
					currentTemplatePage = "login_page";
					loginInit();
				});
login_page.live('pagehide', function(e, ui) {
});
/** ****************************home_page---end************************************* */
function loginInit() {
	var login_page = $("#login_page");
	var userCode = local.get("userCode");

	if (userCode && "" != userCode && "" != $.trim(userCode)) {
		login_page.find("#username_id").val(userCode);
		var myRememberLogin = new myCheckboxInput("remember_loginname");
		myRememberLogin.checkYes();
	}
	login_page.find("#password_id").val("");

	// 国际化示例
	// login_page.find("#remember_loginname_label").text(i18nMsg.login.rememberAccount);

	// var height = login_page.height();
	// login_page.find("table").css('margin-top', height/5*2);
	// var height=$('#login_page').height();
	// $("table").css("margin-top",height/5*2);
}
function goto_submit() {
	var login_page = $("#login_page");
	var userCode = $.trim(login_page.find("#username_id").val());

	var password = $.trim(login_page.find("#password_id").val());
	if ($.trim(userCode) == "") {
		showMessage('请输入用户名', '5000');
		return false;
	}
	if ($.trim(password) == "") {
		showMessage('请输入密码', '5000');
		return false;
	}
	login_page.find("#username_id").blur();
	login_page.find("#password_id").blur();
	goto_main_page(userCode, password);

}
function goto_main_page(userCode, password) {
	var loadingText = "登录中，请稍候!";
	showLoading(loadingText);
	//showLoginLoading();

	session.remove("hasloginin");
	session.remove("pageAddCount");
	session.remove("pageDisplayCount");
	session.remove("testMode");
	session.remove("downloadMode");
	session.remove("app_menu");
	session.remove("messsageFormat");
	session.remove("mobileNumber");
	session.remove("userId");
	session.remove("userCode");
	session.remove("userName");
	session.remove("orgId");
	session.remove("userInfo");
	session.remove("amapJSApiKey");
	session.remove("amapIosSdkKey");
	session.remove("amapAndroidSdkKey");
	session.remove("minDistance");
	session.remove("minInterval");
	session.remove("speedThreshold");
	session.remove("lowSpeedInterval");
	session.remove("highSpeedInterval");
	session.remove("jwt_token");
	
	var authData = {};
	authData.userCode = userCode;
	authData.password = password;
	authData.imei = getIMEI();
	authData.platform = getPlatformCode();
	authData.version = appVersion;
	authData.random = Math.random();
	
	$.getJSON(basePath + "/identification/appLogin/authentication.xhtml" + callback, authData, function(msg) {
		if ($.trim(msg.returnCode) == '0') {
			initialize(msg.data);
			var rememberLoginname = new myCheckboxInput("remember_loginname");
			if (rememberLoginname.isChecked()) {
				local.set("userCode", $.trim(msg.data.userinfo.userCode));
			} else {
				local.remove("userCode");
			}
			// 将用户信息存储到本地（需加密）
			local.set(msg.data.userinfo.userId, JSON.stringify(msg.data));
			
			heartBeat();

			// 设置别名，把用户的账号设置为别名，消息推送时，根据别名给对应的手机推送。
			setJPushAlias(msg.data.userinfo.userCode);

			var pushMessage = session.get("pushMessage");
			var pushState = session.get("pushState");
			if (pushState && "true" == pushState) {
				session.remove("pushMessage");
				session.remove("pushState");
	
				// 登陆之后跳转 推送消息页面
				messageGoto(pushMessage, "false");
				showHide();
			} else {
				setTimeout(function() {
					goto_page("workbench_page");
					showHide();
				}, 500);
			}
		} else {
			session.set("hasloginin", "no");
			showHide();
			goto_page("login_page");
			showMessage('用户名或密码错误！','5000');
			//errorHandler(msg.returnCode, msg.message);
			
		}
	});
}

function gestureLockLogin() {
	if (isGestureLockSet()) {
		startGestureLockLogin();
	} else {
		showMessage('没有设置手势密码，无法通过手势密码登录', 5000);
	}
}

function loginFromLocal(userId) {
	var loadingText = "登录中，请稍候!";
	showLoading(loadingText);
//	showLoginLoading();
	
	session.remove("hasloginin");
	session.remove("pageAddCount");
	session.remove("pageDisplayCount");
	session.remove("testMode");
	session.remove("downloadMode");
	session.remove("app_menu");
	session.remove("messsageFormat");
	session.remove("mobileNumber");
	session.remove("userId");
	session.remove("userCode");
	session.remove("userName");
	session.remove("orgId");
	session.remove("userInfo");
	session.remove("amapJSApiKey");
	session.remove("amapIosSdkKey");
	session.remove("amapAndroidSdkKey");
	session.remove("minDistance");
	session.remove("minInterval");
	session.remove("speedThreshold");
	session.remove("lowSpeedInterval");
	session.remove("highSpeedInterval");
	session.remove("jwt_token");
	
	if (isNetworkConnected) {
		var authData = {};
		authData.userId = userId;
		authData.imei = getIMEI();
		authData.platform = getPlatformCode();
		authData.version = appVersion;
		authData.random = Math.random();

		$.getJSON(basePath + "/identification/appLogin/gestureLock.xhtml" + callback, authData, function(msg) {

			if ($.trim(msg.returnCode) == '0') {
				initialize(msg.data);
				// 将用户信息存储到本地（需加密）
				local.set(msg.data.userinfo.userId, JSON.stringify(msg.data));
				
				showHide();
				heartBeat();
				setTimeout(function() {
					goto_page("workbench_page");
				}, 500);
				
			} else {
				session.set("hasloginin", "no");
				goto_page("login_page");
				showMessage(msg.message,'5000');
				//errorHandler(msg.returnCode, msg.message);
			}
		});

	} else {
		var data = JSON.parse(local.get(userId));
		initialize(data);
		showHide();
		showMessage('目前是离线状态，部分功能可能无法正常使用!', 5000);
		heartBeat();
		setTimeout(function() {
			goto_page("workbench_page");
		}, 500);
	}
}

function heartBeat(){

	if (!isGpsServiceRunning()) {
		var userInfo = JSON.parse(session.get("userInfo"));
		if (userInfo != null && userInfo.user != null) {
			if ('2' == userInfo.user.onlineStatus) {
				showMessage('当前设备定位功能已被关闭，目前用户已签入，请打开设备定位功能','5000');	
			}
		}
	}
	
	if (isNetworkConnected()) {

		var authData = {};
		//2019年4月针对渗透测试的修改
		//对参数加密
		authData.userId = encrypt(session.get("userId"));
		authData.random = Math.random();
		
		$.getJSON(basePath + "/identification/appHeartBeat/loginCheck.xhtml" + callback, authData, function(msg) {
			if ($.trim(msg.returnCode) == '0') {
				if (msg.data.userinfo.user.extension != getIMEI()) {
		    		//清除本地登陆状态
		    		session.remove("hasloginin");
		    		session.remove("pageAddCount");
		    		session.remove("pageDisplayCount");
		    		session.remove("testMode");
		    		session.remove("downloadMode");
			 		session.remove("app_menu");
			 		session.remove("messsageFormat");
			 		session.remove("mobileNumber");
			 		session.remove("userId");
			 		session.remove("userCode");
			 		session.remove("userName");
			 		session.remove("orgId");
			 		session.remove("userInfo");
			 		session.remove("amapJSApiKey");
			 		session.remove("amapIosSdkKey");
			 		session.remove("amapAndroidSdkKey");
			 		session.remove("minDistance");
			 		session.remove("minInterval");
			 		session.remove("speedThreshold");
			 		session.remove("lowSpeedInterval");
			 		session.remove("highSpeedInterval");
			 		
		    		//清理缓存
		    		clearCache();
					goto_page("login_page");
					stopLocationService();
					showMessage("新设备加入，原设备已被踢出",'5000');
					return false;
				}else{
					initialize(msg.data);
			    	//签入信息
			 	    var userInfo = JSON.parse(session.get("userInfo"));
					if (ConstDef.getConstant("ONLINE_STATUS_SIGNIN") == userInfo.user.onlineStatus) {
						if (!isLocationServiceRunning()) {
							startLocationService(userInfo.userId, "case 1");
						}
						$('#workbench_page').find("#SignBtn .font12r").text('签出') ;
					} else {
						stopLocationService();
						$('#workbench_page').find("#SignBtn .font12r").text('签入') ;
					}
					window.setTimeout("heartBeat()", 300000); //每隔600秒调用一下本身 
				}
			} 
		});
		
	}
} 

function initialize(data) {
	// 记录登陆状态
	session.set("hasloginin", "yes");

	// 设置分页 加载数据数量
	session.set("pageAddCount", data.pageAddCount);
	// 设置分页 初次加载数据数量
	session.set("pageDisplayCount", data.pageDisplayCount);

	// 设置是否测试模式
	session.set("testMode", data.testMode);
	// 设置下载模式
	session.set("downloadMode", data.downloadMode);
	// 用户信息
	session.set("userId", data.userinfo.userId);
	session.set("userCode", data.userinfo.userCode);
	session.set("userName", data.userinfo.userName);
	session.set("orgId", data.userinfo.user.orgId);
	session.set("userFlag", data.userinfo.user.userFlag);
	session.set("drivingStatus",data.userinfo.drivingStatus);
	session.set("userInfo", JSON.stringify(data.userinfo));

	// 设置高德地图key
	session.set("amapJSApiKey", JSON.stringify(data.amapJSApiKey));
	session.set("amapIosSdkKey", JSON.stringify(data.amapIosSdkKey));
	session.set("amapAndroidSdkKey", JSON.stringify(data.amapAndroidSdkKey));

	// 用户菜单权限
	session.set("app_menu", JSON.stringify(data.menu));

	// SOS短信初始化数据
	session.set("messsageFormat", JSON.stringify(data.messsageFormat));
	session.set("mobileNumber", JSON.stringify(data.mobileNumber));

	//设置位置数据采集参数,最小变化距离(int米)、最小间隔时间(int秒)、低速间隔时间(int秒)、高速间隔时间(int秒)、速度阈值(float米/秒)
	session.set("minDistance", data.minDistance);
	session.set("minInterval", data.minInterval);
	session.set("speedThreshold", data.speedThreshold);
	session.set("lowSpeedInterval", data.lowSpeedInterval);
	session.set("highSpeedInterval", data.highSpeedInterval);
	
	//
	
    //认证Token存入header
//    var jwt_token = data.jwt_token;
//    if (jwt_token) {
//   	 $.ajaxSetup({
//   		 headers: { 'x-access-token': jwt_token } 
//   	 });
//    }
//	session.set("jwt_token", data.jwt_token);
	
	initLocationService(data.minDistance, data.minInterval, data.lowSpeedInterval, data.highSpeedInterval, (data.speedThreshold*1000/3600));
	
}



// function checkedRemember(){
// var remember = new myCheckbox("remember");
// if(remember.val()){
// local.set("ycoa_remember","false");
// remember.checkNo();
// }else{
// remember.checkYes();
// }
// }
// function setJPushAlias(userCode){
// if(os.android || os.androidICS){
// window.call.setJPushAlias(userCode);
// }
// // else if(os.ios || os.ios6){
// // window.call.setJPushAlias(userCode);
// // }
// }
