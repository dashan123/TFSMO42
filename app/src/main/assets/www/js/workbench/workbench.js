            var workbench_page = $('#workbench_page');
            var app_menu = null;
            var myMarquee = null;
            var workbench_menu_myScroll;
            
/******************************workbench_page---begin**************************************/	   
            workbench_page.live('pageinit',function(e, ui){
            	var wrapper = "workbench_menu_wrapper";
            	workbench_menu_myScroll = createMyScroll(wrapper);
	        	
         		workbench_page.find("#UserInfoBtn").live("tap",function(){
         			goto_page("user_info_page");
         		});
         		
	        	workbench_page.find("#SignBtn").live("tap",user_sign_confirm);
	        	
	        	workbench_page.find("#NoticeInfoBtn").live("tap",function(event){
	        		event.stopPropagation();
         			goto_page("notice_list_page");
         		});
         		
         		workbench_page.find("#focus_photo_li img").live("tap",function(){
         			var contentUrl = $(this).attr("contentUrl");
         			session.set("contentUrl",contentUrl);
         			
         			goto_page("workbench_photo_page");
         		});

           	    if(os.android || os.androidICS 
       			        || os.ios || os.ios6){
           	    	checkVersion();
           	    }
	    
//           	    getUserLastLocation();
//	         	var userLastLocationInterval = setInterval(function(){
//	         		getUserLastLocation();
//	         	}, 5000);
    	    });	
            workbench_page.live('pageshow',function(e, ui){
            	currentLoadActionName = "workbench_menu_load_content";
//                //从session中获取图标并转化为对象
//                app_menu = JSON.parse(session.get("app_menu"));
//         		if(null != app_menu){
//             		//动态设置图标点击事件
//         			for(var i = 0;i < app_menu.length;i++){
//         				if ('WORKBENCH' == app_menu[i].moduleCode) { 
//            	        	workbench_page.find("#"+app_menu[i].code).live("tap",
//            	        			{pageId:app_menu[i].pageId,pagecode:app_menu[i].code,pageName:app_menu[i].name},tap_goto);
//         				}
//        		    }
//         		}
         		
            	  //判断当前 页面 如果非当前页面 就返回
            	  if(!beforePageShowCheck($(this))){
            		  return;
            	  }
        		  currentTemplatePage = "workbench_page";
        		  load_workbench_content();
    	    });	
            workbench_page.live('pagehide',function(e, ui){
            	var page = $('#workbench_page');
    	    });	
/******************************workbench_page---end**************************************/
            
        function tap_goto(event){
    		session.set("page_keyword",event.data.pageName);
    		session.set("page_title",event.data.pageName);
    		session.set("page_from","workbench_page");
    		if(event.data.pageId == "banq_pre_approval_list_page"){
    			var userInfo = JSON.parse(session.get("userInfo"));
    			if (ConstDef.getConstant("ONLINE_STATUS_SIGNIN") == userInfo.user.onlineStatus) {
    				goto_page(event.data.pageId);
    			}else{
    				showMessage("您还没有签入，请先签入！",'2000');
    			}
    		}else{
    			goto_page(event.data.pageId);
    		}
    	}

        function workbench_menu_load_content(){
        	
        }
        
        function load_workbench_content(){
        	var page = $('#workbench_page');
        	var authData = {};
        	var userId = session.get("userId");
        	 
        	showLoading();
	    	//签入信息
	 	    var userInfo = JSON.parse(session.get("userInfo"));
			if (ConstDef.getConstant("ONLINE_STATUS_SIGNIN") == userInfo.user.onlineStatus) {
				startLocationService(userInfo.userId, "case 1");
				page.find("#SignBtn .font12r").text('签出') ;
			} else {
				stopLocationService();
				page.find("#SignBtn .font12r").text('签入') ;
			}
        	
	 	    authData.userId = userId;
	 	    authData.random = Math.random();
	 	    $.getJSON(contextPath+"/workbench/workbenchInit.xhtml"+callback, authData,function(msg){
	 		    if($.trim(msg.returnCode) == '0'){
				    if(msg.data !=null){
				    	
				    	var userFlag = session.get("userFlag");
				 	    //图片信息
					    var photoHtml = '';
					    var photoTitle = new Array();
					    var photosSolid = '';
					    if(userFlag == ConstDef.getConstant("USERFLAG_COMPANY")){
					    	if (msg.data.pictureInfo != null && msg.data.pictureInfo.length > 0) {
							    $.each(msg.data.pictureInfo, function(i, p) {
								    photoHtml += '<li id="focus_photo_li"><img src="'+basePath + $.trim(p.path)+'" width="100%" height="160px" contentUrl="'+$.trim(p.contentUrl)+'"></li>';
								    photoTitle[i] = '<a href="javascript:void(0)"  style="text-decoration:none;color:black">'+$.trim(p.title).substring(0,20)+"..."+'</a>';
								    photosSolid += '<li>'+i+'</li>';
							    });
								page.find('#focus_thelist').html(photoHtml).trigger("create");		
								page.find("#focus_indicator").html(photosSolid).find("li:first").addClass('active');
								page.find("#focus_nav").show();
								page.find("#focus_indicator").trigger("create");
								
								load_photos(photoTitle);
						    } else {
						    	photoHtml += '<li>目前暂无数据！</li>';
						    	page.find('#focus_thelist').html(photoHtml);
						    }
					    	
					    	//通知信息
							var noticeHtml = '';
							if (msg.data.noticeInfo != null && msg.data.noticeInfo.length > 0) {
						    	$.each(msg.data.noticeInfo, function(i, p) {
						    		noticeHtml += '<div><a rel="'+p.id+'" class="goto_notice_detail_id" style="font-size: 16px;">'+$.trim(p.title)+'</a></div>';
						    	});
						    	page.find('.notice-items').html(noticeHtml);
//						    	if (myMarquee == null) {
//						    		myMarquee = createMarquee({});
//						    	}
						    	
						    	var marqueeLi = page.find('.notice-items').find(".goto_notice_detail_id");
					            for (var j = 0; j < marqueeLi.length; j++){   
					            	var li = marqueeLi[j];
					            	$(li).bind("tap",function() {
					          		var noticeId = $(this).attr("rel");
					          		session.set("noticeId", noticeId);
					          		goto_page("notice_detail_page");
					              });
					            }
							} else {
								noticeHtml += '<div class="no-after"><a class="goto_notice_detail_id" style="font-size: 16px;">目前暂无数据</a></div>';	
								page.find('.notice-items').html(noticeHtml);
							}
					    }else{
//					    	var picturePath = basePath + ConstDef.getConstant("WORKBENCH_OUTSOURCE_DEFAULT_PICTUREPATH");
					    	var picturePath = ConstDef.getConstant("WORKBENCH_OUTSOURCE_DEFAULT_PICTUREPATH");
					    	var picturetitle = ConstDef.getConstant("WORKBENCH_OUTSOURCE_DEFAULT_PICTURETITLE");
					    	photoHtml += '<li id="outsource_company_photo_li"><img src="'+picturePath +'"></li>';
						    photoTitle[0] = '<a href="javascript:void(0)"  style="text-decoration:none;color:black">'+picturetitle.substring(0,20)+'</a>';
						    photosSolid += '<li>'+0+'</li>';
						    
						    page.find('#focus_thelist').html(photoHtml).trigger("create");		
							page.find("#focus_indicator").html(photosSolid).find("li:first").addClass('active');
							page.find("#focus_nav").show();
							page.find("#focus_indicator").trigger("create");
							
							load_photos(photoTitle);
							
							//通知信息
							var noticeHtml = '';
							noticeHtml += '<div class="no-after"><a class="goto_notice_detail_id" style="font-size: 16px;">外包人员通知消息</a></div>';	
							page.find('.notice-items').html(noticeHtml);
					    }
			            
				    }
	 	    	}else{
			    	showHide();
			    	errorHandler(msg.returnCode,msg.message);
			    }	 	    		
	 	    });
	 	    
	 	    //权限控制
            //从session中获取图标并转化为对象
            app_menu = JSON.parse(session.get("app_menu"));
     		//清除图标
	        page.find("#workbench_menu_list").empty();
     		if(null != app_menu){
         		//根据权限显示图标
//     			var html = '';
     			var j = 0;
     			for(var i = 0;i < app_menu.length;i++){
     				if ('WORKBENCH' == app_menu[i].moduleCode) {
//        		    	html += '<li>';
//        		    	html += '<a href="#" id="'+app_menu[i].code+'"> ';
//        		    	html += '<span class="imgcell">';
//        		    	html += '<img src="images/'+app_menu[i].iconPath+'" width="64" class="imgs">';
//        		    	html += '<span class="tips">';
//        		    	html += '</span>';
//        		    	html += '</span> ';
//        		    	html += '<i>';
//        		    	html += app_menu[i].name;
//        		    	html += '</i>';
//        		    	html += '</a>';
//        		    	html += '</li>';
        		    	
     					j = j +1;
     					var $appMenuObject = $('<li>'+'<a href="#" id="'+app_menu[i].code+'"> '+'<span class="imgcell">'
        		    			+ '<img src="images/'+app_menu[i].iconPath+'" width="64" class="imgs">'
        		    			+ '<span class="tips"></span>'
        		    			+ '</span> '
        		    			+ '<i>' + app_menu[i].remark + '</i>'
        		    			+ '</a>'
        		    			+'</li>');
        		    	$appMenuObject.bind("tap",
        	        			{pageId:app_menu[i].pageId,pagecode:app_menu[i].code,pageName:app_menu[i].remark},tap_goto);
     				
        		    	page.find("#workbench_menu_list").append($appMenuObject);
     				
     				}
    		    }
//     			if(j<=0){
//                	showMessage('暂无数据','5000');	
//                }
//     			if(html.length<=0){
//                	showMessage('暂无数据','5000');	
//                }else{
//                	page.find("#workbench_menu_list").append(html);
//                }
     		}
     		
	 	    showHide();
        }

        function load_photos(photo_title){
        	var page = $('#workbench_page');
        	page.find("#focus_title").html(photo_title[0]);
            var width = page.find("#scroller").width();
            page.find("#focus_wrapper").width(width);
            page.find("#focus_nav").width(width);
            page.find("#focus_scroller").width(width*photo_title.length);
            page.find("#focus_scroller ul li").width(width);
            this.myFocusScroll = $_('#focus_wrapper').iScroll({
                 snap: true,
                 momentum: false,
                 hScrollbar: false,
                 onScrollEnd: function () {
                     document.querySelector('#focus_indicator > li.active').className = '';
                     document.querySelector('#focus_indicator > li:nth-child(' + (this.currPageX+1) + ')').className = 'active';
                     var current_photo_num = $("#focus_indicator").find(".active").text(); 
                      $("#focus_title").html("<a>"+photo_title[parseInt(current_photo_num)]+"</a>");
                 }
            });
            document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
            document.addEventListener('mousemove', function (e) { e.preventDefault(); }, false);
        }
        
        function user_sign_confirm(){	
	 	    var userInfo = JSON.parse(session.get("userInfo"));
	 	    var confirmTit;
			if ('2' == userInfo.user.onlineStatus) {
				//用户已签入，则签出
				confirmTit = "请确认是否签出";
			} else {
				if (session.get("testMode") != "1") {
					if (!isGpsServiceRunning()) {
						showMessage('当前手机位置定位功能没有开启，无法进行签入','5000');	
						return false;
					}
				}
				//用户未签入，则签入
				confirmTit = "请确认是否签入";
			}        	
			showConfirm(confirmTit, user_sign);
        }
        
        function user_sign(){
        	
			if (!isNetworkConnected()) {
				showMessage('当前网络不在线，无法进行签入签出','5000');	
				return false;
			}
        	
        	var page = $('#workbench_page');
	   		var authData = {};
	   		var userCode = session.get("userCode");
			var loadingText = "操作中，请稍候...";
			var html = '';
			
	 	    showLoading(loadingText);
	 	    var userInfo = JSON.parse(session.get("userInfo"));
			if ('2' == userInfo.user.onlineStatus) {
//				var collectFlg = session.get("collectFlg");
//				if (collectFlg == 'true') {
//					showMessage('当前用户正在催收中，签出前请先结束催收','5000');	
//					return false;
//				}
				
				//用户已签入，则签出
				authData.onlineStatus = 1;
			} else {
				//用户未签入，则签入
				authData.onlineStatus = 2;
			}
			session.set("userInfo",JSON.stringify(userInfo));
			
			var userId = session.get("userId");
			//2019年4月针对渗透测试的修改
			//对参数加密
			authData.userCode = encrypt(userCode);
			authData.userId = encrypt(userId);
	 	    authData.random = Math.random(); 	    			    
			$.getJSON(contextPath+"/workbench/userSign.xhtml"+callback, authData, function(msg){
				if($.trim(msg.returnCode) == '0'){
					if ('2' == userInfo.user.onlineStatus) {
						//用户已签入，则签出
						userInfo.user.onlineStatus = 1;
						stopLocationService();
						page.find("#SignBtn .font12r").text('签入') ;
					} else {
						//用户未签入，则签入
						userInfo.user.onlineStatus = 2;
						startLocationService(userInfo.userId, "case 1");
						page.find("#SignBtn .font12r").text('签出') ;
					}
					session.set("userInfo",JSON.stringify(userInfo));
					showHide();
//					showMessage(msg.data.OperationMessage,'5000');
				}else{
					showHide();
			    	errorHandler(msg.returnCode,msg.message);
				}
			});
    	}
        
        function moreMenu(){
        	var page = $('#workbench_page');
        	page.find("#moreMenu").toggle();
        }
		function checkVersion(){
		     var data = {};
        	 if(os.android || os.androidICS){
        		 data.platform = "android";
        	 }else if(os.ios || os.ios6){
        		 data.platform = "ios";
        	 }else{
        		 data.platform = "android";
        	 }
		     data.version = appVersion;
		     data.random = Math.random();
    	     $.getJSON(contextPath+"/more/checkVersion.xhtml"+callback, data,function(msg){
				    if($.trim(msg.returnCode) == '0'){
				    	 if($.trim(msg.data.isLatest) == "false"){
			                	 if(os.android || os.androidICS){
							    	 var text = "当前有新版本了，是否更新？";
							    	 if(window.confirm(text)){	
				                		 window.call.updateVersion(contextPath+msg.data.updateUrl);
							    	 }
			                	 }else if(os.ios || os.ios6){
			                		   var cmd = "versionUpdate";
			                		   var param1 = msg.data.updateUrl;
			                		   window.location.href="objc:///"+cmd+"~/"+param1;
			                	 }
				    	 }
				    }
      	    });
		}
		

		function common_calculateDistance(travelId,lineArr){

			var polyline = new AMap.Polyline({
				path:lineArr
			});
			
			var postData ={};
			postData.random = new Date();
			postData.userCode = session.get("userCode");
			postData.userId = session.get("userId");
			postData.travelId = travelId;
			postData.distance = polyline.getLength();

			//更改行车记录距离
			$.getJSON(basePath+"/app/workbench/calculateDistance.xhtml"+callback, postData,function(msg){
				if($.trim(msg.returnCode) == '0'){
					console.log(msg.message);
				}
				else{
					errorHandler(msg.returnCode,msg.message);
					console.log(msg.message);
				}

			});//end $.getJSON
		}

		function coll_calculateDistance(travelId,lineArr){
			//	var lineArr = new Array();

			//	lineArr = new Array();
			//	lineArr.push([113.402185,24.185521]);
			//	lineArr.push([113.402282,24.185374]);
			//	lineArr.push([113.402358,24.185481]);


			var polyline = new AMap.Polyline({
				path:lineArr
			});
			//	polyline.setPath(lineArr);
			//	var totalLength = polyline.getLength();

			var postData ={};
			postData.random = new Date();
			postData.userCode = session.get("userCode");
			postData.userId = session.get("userId");
			postData.travelId = travelId;
			postData.distance = polyline.getLength();

			//更改行车记录距离
			$.getJSON(basePath+"/app/workbench/collCalculateDistance.xhtml"+callback, postData,function(msg){
				if($.trim(msg.returnCode) == '0'){
					console.log(msg.message);
				}
				else{
					errorHandler(msg.returnCode,msg.message);
					console.log(msg.message);
				}

			});//end $.getJSON
		}
		
		/**
		 * 查询当前登录用户的实地状态
		 */
		function queryDriveStatus(callBack){
//			var driveStatus = undefined;
			
			var postData ={};
			postData.random = new Date();
			postData.userCode = session.get("userCode");
			postData.userId = session.get("userId");
			//获取需要标注红点的日期
			$.ajax({
				url: basePath+"/app/workbench/queryDriveStatus.xhtml"+callback, //这个地址做了跨域处理
				data: postData,
				type: 'GET',
				dataType: 'json',
				async:true,//经测试，手机上不支持false,当设置为false时，效果与true是一样的。
				beforeSend: function () {
//					showLoading();
				},
				success: function (msg) {

					if($.trim(msg.returnCode) == '0') {
						var data = msg.data;
						var driveStatus = data.driveStatus;
						if(driveStatus != undefined && driveStatus != null){
							callBack(driveStatus);
						}
						else{
							showMessage('未获取到当前用户的实地状态，请确认服务器是否联通！', '5000');
						}
						
					}
					else{
						errorHandler(msg.returnCode,msg.message);
					}
				},
				complete: function() {

				}
			});//end $.ajax
			
//			return driveStatus;
		}
		/**
		 * 查询当前登录用户的实地状态(催收部门用)
		 */
		function queryDriveStatusForColl(successFunc,completeFunc){
//			var driveStatus = undefined;
			
			var postData ={};
			postData.random = new Date();
			postData.userCode = session.get("userCode");
			postData.userId = session.get("userId");
			//获取需要标注红点的日期
			$.ajax({
				url: basePath+"/app/workbench/queryDriveStatusForColl.xhtml"+callback, //这个地址做了跨域处理
				data: postData,
				type: 'GET',
				dataType: 'json',
				async:true,//经测试，手机上不支持false,当设置为false时，效果与true是一样的。
				beforeSend: function () {
//					showLoading();
				},
				success: function (msg) {

					if($.trim(msg.returnCode) == '0') {
						var data = msg.data;
						var driveStatus = data.driveStatus;
						if(driveStatus != undefined && driveStatus != null){
							successFunc(driveStatus);
						}
						else{
							showMessage('未获取到当前用户的实地状态，请确认服务器是否联通！', '5000');
						}
						
					}
					else{
						errorHandler(msg.returnCode,msg.message);
					}
				},
				complete: completeFunc
			});//end $.ajax
			
//			return driveStatus;
		}
		
		function messageGoto(msg,hasPush) {
			if(typeof(msg)!="undefined" && $.trim(msg)!=""){
				var msgArr = msg.split("/");
				if(msgArr.length == 2){
					var title = msgArr[0];
					var id = msgArr[1];
					
					if("公文"==title || "合同"==title || "印章"==title || "请休假"== title || "会议"==title){
		        		if("公文"==title){
		        			session.set("approval_page_keyword","公文");
			        		session.set("approval_page_title","公文审批");
			        		session.set("approval_list_page_title","公文审批单");
			        		session.set("approval_page_from","approval_page");
		        		}
		        		if("合同"==title){
		        			session.set("approval_page_keyword","合同");
			        		session.set("approval_page_title","合同审批");
			        		session.set("approval_list_page_title","合同审批单");
			        		session.set("approval_page_from","approval_page");
		        		}
		        		if("印章"==title){
		        			session.set("approval_page_keyword","印章");
			        		session.set("approval_page_title","印章申请");
			        		session.set("approval_list_page_title","印章申请单");
			        		session.set("approval_page_from","approval_page");
		        		}
		        		if("请休假"==title){
		        			session.set("approval_page_keyword","请休假");
			        		session.set("approval_page_title","请休假");
			        		session.set("approval_list_page_title","请休假单");
			        		session.set("approval_page_from","approval_page");
		        		}
		        		if("会议"==title){
			        		session.set("approval_page_keyword","会议");
			        		session.set("approval_page_title","会议审批");
			        		session.set("approval_list_page_title","会议审批单");
			        		session.set("approval_page_from","approval_page");
		        		}
		        		
		        		if("false"!=hasPush || "yes"!=session.get("hasloginin")){
		        			session.set("pushMessage",msg);
		        			session.set("pushState","true");
		        		}
		        		
		        		currentLoadActionName = "load_approval_list_content";
		        		session.set("unid",id);
		        		goto_page("approval_list_page");
					}
					
					if("指令"==title){
						if("false"!=hasPush || "yes"!=session.get("hasloginin")){
		        			session.set("pushMessage",msg);
		        			session.set("pushState","true");
		        		}
						session.set("unid",id);
						
						currentLoadActionName = "load_instruct_detail_content";
		        		goto_page("instruct_detail_page");
					}
					
					
				}
			}
		}
		
		
//		function getUserLastLocation(){
//			onLocationBegin();
//			setTimeout(function(){
////				alert("newLongitude："+newLongitude+"  newLatitude:"+newLatitude);
//				if(newLongitude != 0 && newLatitude != 0){
//					userLastLocation[0] = newLongitude; //经度
//					userLastLocation[1] = newLatitude;  //纬度
//				}
//			},2000);
//		}