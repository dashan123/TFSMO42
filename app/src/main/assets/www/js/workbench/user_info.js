            var userInfo_page = $('#user_info_page');

/******************************workbench_page---begin**************************************/	   
            userInfo_page.live('pageinit',function(e, ui){
            	userInfo_page.find(".BackBtn").live("tap",function(){
            		back_page();
            	});
            	userInfo_page.find(".ExitBtn").live("tap",function(){
            		showConfirm("确认是否退出", user_exit);
            	});      
    	    });	
            userInfo_page.live('pageshow',function(e, ui){
            	  //判断当前 页面 如果非当前页面 就返回
            	  if(!beforePageShowCheck($(this))){
            		  return;
            	  }
        		  currentTemplatePage = "user_info_page";
        		  load_userInfo_content();
    	    });	
            userInfo_page.live('pagehide',function(e, ui){
            	var page = $('#user_info_page');
    	    });	
/******************************workbench_page---end**************************************/
            
        function load_userInfo_content(){
        	var page = $('#user_info_page');

        	showLoading();
        	
        	var userCode = session.get("userCode");
	 	    var userInfo = JSON.parse(session.get("userInfo"));
			//用户信息
	    	page.find("[identity='userNameLabel']").text(userInfo.userName);
	    	if (userInfo.org != null) {
	    		page.find("[identity='orgNameLabel']").text(userInfo.org.name);
	    	}
	    	page.find("[identity='cityNameLabel']").text(userInfo.user.cityName);
	    	if (userInfo.user.onlineStatus != null) {
	    		if (userInfo.user.onlineStatus == 1) {
	    			page.find("[identity='onlineStutasLabel']").text("已登录");
	    		} else if (userInfo.user.onlineStatus == 2) {
	    			page.find("[identity='onlineStutasLabel']").text("已签入");
	    		}
	    	} else {
	    		page.find("[identity='onlineStutasLabel']").text("");
	    	}
			
	    	//签入信息
	    	var authData = {};
	 	    authData.userCode = userCode;
	 	    authData.random = Math.random();
	 	    $.getJSON(contextPath+"/workbench/getUserStatusDate.xhtml"+callback, authData,function(msg){
	 		    if($.trim(msg.returnCode) == '0'){
				    if(msg.data !=null){
				    	page.find("[identity='loginTimeLabel']").text(msg.data.logintime);
				    	if (msg.data.signintime != null) {
				    		page.find("[identity='signinTimeLabel']").text(msg.data.signintime);
				    	} else {
				    		page.find("[identity='signinTimeLabel']").text("");
				    	}
				    }
	 	    	}else{
			    	showHide();
			    	errorHandler(msg.returnCode,msg.message);
			    }	 	    		
	 	    });
     		
	 	    showHide();
        }  
  
        function user_exit(){
        	var page = $('#user_info_page');
	   		var authData = {};
	   		var userId = session.get("userId");
			var loadingText = "操作中，请稍候...";
			var html = '';
	 	    
	 	    var userInfo = JSON.parse(session.get("userInfo"));
			if ('2' == userInfo.user.onlineStatus) {
				//用户已签入，则签出
				//提示用户目前已签入，退出前需签出
				showMessage('目前已签入，退出需先签出！', 5000);
				return false;
			}
			showLoading(loadingText);
			
			authData.userId = userId;
			authData.imei = getIMEI();
	 	    authData.random = Math.random(); 	    			    
	 	    $.getJSON(basePath+"/identification/appLogin/logout.xhtml"+callback, authData,function(msg){});
	 	    
	 	    
	 	    
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
    		
    		showHide();
    		
    		//跳转登陆页面
    		goto_page("login_page");
		}