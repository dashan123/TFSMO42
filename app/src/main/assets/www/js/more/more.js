var more_page = $('#more_page');
            var portal_myScroll;

/******************************more_page---begin**************************************/	   
            more_page.live('pageinit',function(e, ui){
//                    alert(gestureLockSet);
	        	more_page.find(".ChangeGPW").live("tap",function(){
	        		changeGesturePassword();
	        	});
	        	
	        	more_page.find(".SetGPW").live("tap",function(){
	        		setGesturePassword();
	        	});
	        	
	        	more_page.find(".CleanCache").live("tap",function(){
	        		showMessage("缓存清理完成",5000);
	        		
	        		//清理缓存
	        		clearCache();
	        		//2.清理下载的文件
	        		//1.清理登陆记住用户名密码
	        		//local.remove("userCode");
	        		//local.remove("password");
	        	});
	        	
	        	//版本信息
	        	more_page.find(".Version").live("tap",function(){
	        		goto_page("version_page");
	        	});
	        	
    	    });	
            more_page.live('pageshow',function(e, ui){
            	  //判断当前 页面 如果非当前页面 就返回
	          	  if(!beforePageShowCheck($(this))){
	          		  return;
	          	  }
            	
            	currentTemplatePage = "more_page";
            	
            	content_more_page();
    	    });	
            more_page.live('pagehide',function(e, ui){
    	    });	
            
            function content_more_page(){
            	
            	content_more_version_page();
            }
            
            function content_more_version_page(){
            	var page = $('#more_page');
            	
            	if (isGestureLockSet()) {
                	page.find(".ChangeGPWBtn").css({ backgroundImage: "url('images/tfsred/more_on.png')" });
                	page.find(".SetGPWBtn").html("<em><i></i></em>");
            	} else {
            		page.find(".ChangeGPWBtn").css({ backgroundImage: "url('images/tfsred/more_off.png')" });
            		page.find(".SetGPWBtn").empty();
            	}
            	
            	//设置APP版本信息
            	page.find(".appversion").text('当前版本 '+appVersion);
            	
            	page.find(".appversion_new").hide();
            	
            	showLoading();
            	var authData = {};
            	authData.version = appVersion;
            	if (os.android) {
            		authData.platform = "android";
            	} else if(os.ios) {
            		authData.platform = "ios";
            	} else {
            		authData.platform = "";
            	}
            	authData.random = Math.random();
            	$.getJSON(contextPath+"/more/checkVersion.xhtml"+callback, authData,function(msg){
            		if($.trim(msg.returnCode) == '0'){
            			showHide();
            			if(msg.data !=null){
            				var isLatest = msg.data.isLatest;
            				 if(isLatest == "false"){
								page.find(".appversion_new").show();
            				}
            			}
            		}else{
       			    	 showHide();
       			    	 errorHandler(msg.returnCode,msg.message);
            		}
            	});
            }
            
            
            function changeGesturePassword() {
            	var page = $('#more_page');
            	if (page.find(".SetGPWBtn").html() == "<em><i></i></em>") {
            		//TODO:输入密码确认
                	if (isGestureLockSet()) {
                		//TODO:输入密码确认
                        clearGestureLockSet();
                    }else{
                        page.find(".ChangeGPWBtn").css({ backgroundImage: "url('images/tfsred/more_off.png')" });
                        page.find(".SetGPWBtn").empty();
                    }
                    
                } else {
            		page.find(".SetGPWBtn").html("<em><i></i></em>");
            		page.find(".ChangeGPWBtn").css({ backgroundImage: "url('images/tfsred/more_on.png')" });
            	}
            }
            
            function setGesturePassword() {
            	var page = $('#more_page');
        		var userId = session.get("userId");
            	
        		if (page.find(".SetGPWBtn").html() == "<em><i></i></em>") {
                	if (isGestureLockSet()) {
                		//TODO:输入密码确认
            		}
                	startGestureLockSet(userId);
        		}

            }
/******************************more_page---end**************************************/
         //回调修改按钮状态
            function gestureState(state){
                gestureLockSet = state;
                var page = $('#more_page');
                if(state == false){
                    page.find(".ChangeGPWBtn").css({ backgroundImage: "url('images/tfsred/more_off.png')" });
                    page.find(".SetGPWBtn").empty();
                }
                
            }
