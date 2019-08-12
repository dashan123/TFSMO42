           var tool_box =$("#tool_box_page");
           var app_menu = null;
           var myMarquee = null;
           var tool_box_myScroll;
           
/******************************tool_box---begin**************************************/
           tool_box.live('pageinit',function(e,ui){
        	   var wrapper = "tool_box_wrapper";
        	   tool_box_myScroll = createMyScroll(wrapper);          
            
            // 返回工作台
            tool_box.find(".BackBtn").live("fastClick", function() {
       			//var fromPage = session.get("page_from");
       			back_page();
       		});
        	
        	//从session中获取图标并转化为对象
            app_menu = JSON.parse(session.get("app_menu"));
    		if(null != app_menu){
        		//动态设置图标点击事件
    			for(var i = 0;i < app_menu.length;i++){
    				if ('TOOLBOX' == app_menu[i].moduleCode) {          		    	
    					tool_box.find("#"+app_menu[i].code).live("tap",
       	        			{pageId:app_menu[i].pageId,pagecode:app_menu[i].code,pageName:app_menu[i].name},tap_goto_tool_box);
    				}
   		        }
    		}
           });
           tool_box.live('pageshow',function(e, ui){
                         
        	   currentLoadActionName = "tool_box_load_content";       
                         
	         	  //判断当前 页面 如果非当前页面 就返回
	         	  if(!beforePageShowCheck($(this))){
	         		  return;
	         	  }
	     		  currentTemplatePage = "tool_box_page";
	     		  load_toolbox_content();
	 	    });	
           tool_box.live('pagehide',function(e, ui){
	         	var page = $('#tool_box_page');
	 	    });	
/******************************tool_box---end**************************************/       
           function tap_goto_tool_box(event){
       		session.set("page_keyword",event.data.pageName);
       		session.set("page_title",event.data.pageName);
       		session.set("page_from","tool_box_page");
       		if(event.data.pageId=="sos_message_send_page"){
       			//SOS消息页面
       			load_sos_message_send_page_content();
       		}
       		if(event.data.pageId=="message_upload_page"){
       			
       			goto_page("message_upload_page");
       		}
       		
       		if(event.data.pageId=="fi_image_data_query_page"){
       			goto_page("fi_image_data_query_page");
       		}
       		
           }
           
           function tool_box_load_content(){
        	   
           }
           
           //初始化工具箱页面
           function load_toolbox_content(){      
        	var page = $('#tool_box_page');
	       	  var authData = {};
	       	  authData.userCode = session.get("userCode");
	       	  authData.random=Math.random();
	 	    //权限控制
            //从session中获取图标并转化为对象
            app_menu = JSON.parse(session.get("app_menu"));
     		//清除图标
	        page.find("#toolbox_menu_list").empty();
     		if(null != app_menu){
         		//根据权限显示图标
     			var html = '';
     			for(var i = 0;i < app_menu.length;i++){
     				if ('TOOLBOX' == app_menu[i].moduleCode) {
        		    	html += '<li>';
        		    	html += '<a href="#" id="'+app_menu[i].code+'"> ';
        		    	html += '<span class="imgcell">';
        		    	html += '<img src="images/'+app_menu[i].iconPath+'" width="64" class="imgs">';
        		    	html += '<span class="tips">';
        		    	html += '</span>';
        		    	html += '</span> ';
        		    	html += '<i>';
        		    	html += app_menu[i].name;
        		    	html += '</i>';
        		    	html += '</a>';
        		    	html += '</li>';
     				}
    		    }
//                if(html.length<=0){
//                	showMessage('暂无数据','5000');	
//                }else{
//                	page.find("#toolbox_menu_list").append(html);
//                }
                if(html.length > 0){
                	page.find("#toolbox_menu_list").append(html);
                }
     		}
     		showHide();
     		 
           }
           

            var authData = {};

           //SOS消息发送
           function load_sos_message_send_page_content(){
               
               var userInfo = JSON.parse(session.get("userInfo"));
               
               onLocationBegin();
               
               showLoading();
                              //获取当前时间
               var currentDatetime = new Date().Format("YYYY/MM/DD HH:mm:ss");
               
               authData.userCode = session.get("userCode");
               authData.userId = session.get("userId");
               authData.random=Math.random();
               authData.sendTime=currentDatetime;
               authData.recordTime=currentDatetime;
               
               var  receiverUserId= new Array();
               var  phoneNumbers ="";
               var  pho=session.get("mobileNumber");
               pho=eval("("+pho+")");
               
               $.each(pho,function(i,n){
                  //接收者用户id
                  receiverUserId.push(n.ID);
                  //phoneNumbers拼成字符串形式号码之间用@符号隔开。
                  if(n.MOBILE != null){
                      phoneNumbers+='@'+n.MOBILE;
                      }
                });
               authData.receiverUserId=receiverUserId;
               //求救人姓名name
               authData.sosSender=session.get("userName");
               var messsageFormat =session.get("messsageFormat");
               messsageFormat=eval("("+messsageFormat+")");
               authData.message= messsageFormat.name;
               
//               setTimeout(function(){
//                  showHide();
//                  //将SOS消息格式中的占位符替换
//                  var message   =  authData.message
//                  .replace("@USER_NAME",authData.sosSender)
//                  .replace("@SOS_TIME",authData.sendTime)
//                  .replace("@ADDRESS",newAddress)
//                  .replace("@LONGITUDE",newLongitude)
//                  .replace("@LATITUDE",newLatitude);
//                  
//                  authData.longiTude=newLongitude;
//                  authData.latiTude=newLatitude;
//                  authData.address=newAddress;
//                  authData.outOfDanger = "1";
//                  authData.content=message;
//                  
//                  if(authData.longiTude == 0 || authData.latiTude == 0 || authData.address == null ){
//                      showHide();
//                      showMessage('未能获取到位置信息,请重试','5000');
//                      return;
//                   }
//                  
//                  sendMessage(phoneNumbers.substring(1,phoneNumbers.length),message)//调用短信接口
//                  
//               }, 2000);
               
               var func = function(){
            	   setTimeout(function(){
            		   if(newLongitude == 0 || newLatitude == 0 || newAddress == null ){
                		   showHide();
                		   showMessage('未能获取到位置信息,请重试','5000');
                		   return;
                	   }
            		   
            		   if(newSpeed <= -1){
            			   onLocationBegin();
            			   func();
            		   }else{
            			   showHide();
                    	   //将SOS消息格式中的占位符替换
                    	   var message   =  authData.message
                    	   .replace("@USER_NAME",authData.sosSender)
                    	   .replace("@SOS_TIME",authData.sendTime)
                    	   .replace("@ADDRESS",newAddress)
                    	   .replace("@LONGITUDE",newLongitude)
                    	   .replace("@LATITUDE",newLatitude);
                    	   
                    	   authData.longiTude=newLongitude;
                    	   authData.latiTude=newLatitude;
                    	   authData.address=newAddress;
                    	   authData.outOfDanger = "1";
                    	   authData.content=message;
                    	   
                    	   sendMessage(phoneNumbers.substring(1,phoneNumbers.length),message)//调用短信接口
            		   }
                	   
                   }, 2000); 
               }//end func
               
               func();

           }

//发送短信回调(发送、取消)

function messageResult(result){
    if(result == "1"){
        
        //数据库增加数据
//        $.getJSON(basePath+"/app/sosMessageReceiver/addSOSMessage.xhtml"+callback,authData,function(msg){
//                  if($.trim(msg.returnCode) == '0'){
//                  if(msg.data){
//                  // alert("发送成功");
//                	  if(msg.message){
//                		  showMessage(msg.message,5000);
//                	  }
//                  }
//                  }else {
//                  showHide();
//                  errorHandler(msg.returnCode, msg.message);
//                  }
//                  });
        
        $.getJSON(basePath+"/app/commonSosMessageReceiver/addCommonSosMessage.xhtml"+callback,authData,function(msg){
        	if($.trim(msg.returnCode) == '0'){
        		if(msg.data){
        			// alert("发送成功");
        			if(msg.message){
        				showMessage(msg.message,5000);
        			}
        		}
        	}else {
        		showHide();
        		errorHandler(msg.returnCode, msg.message);
        	}
        });
        
    }
    else{
    
    
    }
    
    }


