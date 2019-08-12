var version_page = $('#version_page');
            var version_myScroll;
/******************************version_page---begin**************************************/	   
            version_page.live('pageinit',function(e, ui){
	        	var wrapper = "version_list_wrapper";
	        	version_myScroll = createMyScroll(wrapper);

	        	version_page.find(".BackBtn").live("tap",function(){
	        		back_page();
	        	});
	        	
	        	//更新应用
	        	version_page.find(".version_doreload").live("tap",function(){
	        			var appurl = $(this).attr("appurl");
	        			updateVersion(appurl);
	        	});
	        	
	        	//检测更新
	        	version_page.find(".version_docheck").live("tap",function(){
	        		content_version_page();
	        	});
           	    
    	    });	
            version_page.live('pageshow',function(e, ui){
            	currentLoadActionName  = "version_load_content";
            	currentTemplatePage = "version_page";
            	
            	content_version_page();
    	    });	
            version_page.live('pagehide',function(e, ui){
    	    });	
            
            function version_load_content(){
        		//下拉不刷新，则该方法置空
            }
            
            function content_version_page(){
            	var page = $('#version_page');
            	
            	page.find(".version_docheck").hide();
				page.find(".version_doreload").hide();
            	
				page.find(".version_version").empty();
				
				//清空新版本信息
            	page.find(".version_new_content").empty();
            	//清空旧版本信息
            	page.find(".version_old_content").empty();
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
            				if(isLatest == "true"){
            					
            					//获取指定版本信息
            					getVersionInfo(page,authData,"new");
            					
                        		setTimeout(function(){
                        			showMessage('当前已是最新版本','5000');
           			    	         }, 500);
            					
            				}else if(isLatest == "false"){
            					var obj = msg.data.version;
            					var remarks = obj.remarks;
								if(remarks && remarks.length>0){
									var html = '';
									html += '<div style="margin-left:20px;margin-right:20px;">';
									html += '<span style="border-radius:5px;background:#F5F5F5;padding:5px;color:#999;">版本：'+obj.no+'</span>';
									html += '<span style="border-radius:5px;background: rgb(240, 43, 65);padding:3px;color:#f0f0f0;margin:auto 10px;font-style:italic;font-size:10px">NEW</span>';
									html += '</div>';
									html += '<ul>';
									for(var i =0;i<remarks.length;i++){
										html += '<li>'+remarks[i]+'</li>';
									}
									html += '</ul>';
									
									html += '<div style="width:inherit;border-bottom:1px solid #999;margin:20px;"></div>';
									page.find(".version_new_content").html(html);
								}
								
								page.find(".version_version").html(obj.no);
								
								page.find(".version_docheck").hide();
								page.find(".version_doreload").attr("appurl",msg.data.updateUrl);
								page.find(".version_doreload").show();
								
								//获取指定版本信息
            					getVersionInfo(page,authData,"old");
            				}
            			}
            		}else{
       			    	 showHide();
       			    	 errorHandler(msg.returnCode,msg.message);
            		}
            		
            	});
            }
            
            //获取指定版本信息
            function getVersionInfo(page,authData,state){
				showLoading();
				$.getJSON(contextPath+"/more/getVersion.xhtml"+callback, authData, function(msg1){
					if($.trim(msg1.returnCode) == '0'){
						showHide();
						if(msg1.data !=null){
							var obj = msg1.data;
							var remarks = obj.remarks;
							if(remarks && remarks.length>0){
								var html = '';
								html += '<div style="margin-left:20px;margin-right:20px;">';
								html += '<span style="border-radius:5px;background:#F5F5F5;padding:5px;color:#999;">版本：'+appVersion+'</span>';
								html += '</div>';
								html += '<ul>';
								for(var i =0;i<remarks.length;i++){
									html += '<li>'+remarks[i]+'</li>';
								}
								html += '</ul>';
								page.find(".version_old_content").html(html);
								
								if("new" == state){
									page.find(".version_version").html(appVersion);
									page.find(".version_docheck").show();
									page.find(".version_doreload").hide();
								}

							}
						}
						
					}else{
						 showHide();
       			    	 errorHandler(msg1.returnCode,msg1.message);
					}
				});
            	
            }
/******************************version_page---end**************************************/
