              //人员实时定位
              var employee_real_time_positioning;
              employee_real_time_positioning=$("#employee_real_time_positioning_page");
              var employee_real_time_positioning_myScroll;
            /** ****************************employee_real_time_positioning_page  pageinit---begin************************************* */              
              employee_real_time_positioning.live('pageinit',function(e,ui){
            		var wrapper = "employee_real_time_positioning_wrapper";
            		var up = "employee_real_time_positioning_pullUp";
            		var down = "employee_real_time_positioning_pullDown";
            		employee_real_time_positioning_myScroll = createMyScroll(wrapper,up,down);
            		
            		
               // 返回人员状态统计页面
              employee_real_time_positioning.find(".BackBtn").live("fastClick", function(event){
            	  event.stopPropagation();
            	  	//var fromPage = session.get("page_from");
            		   back_page();
            		});
              });
              
            /** ****************************employee_real_time_positioning_page  pageinit---end************************************* */              
              employee_real_time_positioning.live('pageshow',function(e,ui){
            	  
            	  currentLoadActionName = "employee_real_time_positioning_load_content";
            	  
            	  load_employee_real_time_positioning_content();
            	  
              });
              
              function employee_real_time_positioning_load_content(){
            	  
              }
              
              function load_employee_real_time_positioning_content(){
            	  $("#employee_real_time_positioning_page .personnelList").empty();
            	  var page =$("#employee_real_time_positioning_page");
            	  
            	   showLoading();
            	  var authData = {};
            	  authData.userCode = session.get("userCode");
            	  authData.random = Math.random();
            	  authData.teamCode=session.get("teamCode");
            	  authData.personnelCategory=session.get("personnelCategory");
            	  $.getJSON(basePath+"/app/employeePositioning/queryEmployeeRealTimePositioning.xhtml"+callback,authData,function(msg){
            		  
            		  if($.trim(msg.returnCode) == '0'){
            			  if(msg.data.length <= 0){
         		    	     showHide();
//                        	 showMessage('暂无数据','1500');
                        	 return;
            			  }
            			  $.each(msg.data,function(i,n){
            				  if(n.Online_Status=='0'){
            					  $("#employee_real_time_positioning_page .list-row-template ul li").removeClass("usable");
            					  $("#employee_real_time_positioning_page .list-row-template ul li").addClass("disable");
            				  }
            				    var $employee_real_time_positioning=$("#employee_real_time_positioning_page .list-row-template ul").clone(true);
//            				    if(n.EMPLOYEE_STATUS == "实地中"){
//            				    	$employee_real_time_positioning.children().css("color","brown");
//            				    }else if(n.Online_Status == "1"){
//            				    	//已登录
//            				    	$employee_real_time_positioning.children().css("color","green");
//            				    }else if(n.Online_Status == "2"){
//            				    	//已签入
//            				    	$employee_real_time_positioning.children().css("color","red");
//            				    }else if(n.Online_Status == "0"){ 
//            				    	//未登录
//            				    	$employee_real_time_positioning.children().css("color","gray");
//            				    }
            				    $employee_real_time_positioning.children().css("color","black");
            				    
            				    $employee_real_time_positioning.find("[identity='Name']").text(n.Name);
            				    $employee_real_time_positioning.find("[identity='TEAM_NAME']").text(n.TEAM_NAME);
            				    $employee_real_time_positioning.find("[identity='City_Name']").text(n.City_Name);
            				    $employee_real_time_positioning.find("[identity='EMPLOYEE_STATUS']").text(n.EMPLOYEE_STATUS);
            				    
//            				    $employee_real_time_positioning.find("[identity='LOGON_TIME']").text(n.LOGON_TIME);
            				    $employee_real_time_positioning.find("[identity='CHECK_IN_TIME']").text(n.CHECK_IN_TIME);
            				    $employee_real_time_positioning.find("[identity='CHECK_OUT_TIME']").text(n.CHECK_OUT_TIME);
            				    $employee_real_time_positioning.find("[identity='CURRENT_ADDRESS']").text(n.CURRENT_ADDRESS);
            				    $employee_real_time_positioning.find("[identity='DESTINATION_ADDRESS']").text(n.DESTINATION_ADDRESS);
            				    //n.Online_Status
            				    showHide();
            				    $("#employee_real_time_positioning_page .personnelList").append($employee_real_time_positioning);
            				    
            				    var employeeAddress = $employee_real_time_positioning.find("[identity='CURRENT_ADDRESS']").text();
                                $employee_real_time_positioning.find("[identity='CURRENT_ADDRESS']").bind("tap",function(){
                                            callNavi(employeeAddress);
                                })
                                
                                var destinationAddress =  $employee_real_time_positioning.find("[identity='DESTINATION_ADDRESS']").text();
                                 $employee_real_time_positioning.find("[identity='DESTINATION_ADDRESS']").bind("tap",function(){
                                           callNavi(destinationAddress);
                               })
            			  });
            			  
            		  }else{
	 	            	showHide();
	 	            	errorHandler(msg.returnCode,msg.message);
	 	            }
            		  
            	  });
              }