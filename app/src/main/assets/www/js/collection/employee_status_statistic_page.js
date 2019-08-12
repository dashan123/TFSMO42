              var employee_status_statistic_page;
              employee_status_statistic_page=$("#employee_status_statistic_page");
            /** ****************************employee_status_statistic_page---begin************************************* */              
              employee_status_statistic_page.live('pageinit',function(e,ui){
            	  
            		// 返回工作台
              employee_status_statistic_page.find(".BackBtn").live("fastClick", function(event) {
            	  event.stopPropagation();
            	  		//goto_page("workbench_page");
            	       //var fromPage = session.get("page_from");
       		           back_page();
            		});
              
              //刷新
              employee_status_statistic_page.find(".RefreshBtn").live("tap",function(){
            	  	load_employee_status_statistic_page_content();
            	  });
              });
              
              /** ****************************employee_status_statistic_page---end************************************* */
              employee_status_statistic_page.live('pageshow',function(e,ui){
            	  var fromPage = session.get("fromPage");
            		 if(fromPage != "employee_real_time_positioning_page"){
            			 load_employee_status_statistic_page_content();
            		 }
              });
              
              
              function load_employee_status_statistic_page_content(){
            	  
            	  //清空第一行之外的所有内容
            	  $("#employee_status_statistic_page .StatisticalResult .StatisticalResultLi ul").not(":first").remove();
            	  var page =$("#employee_status_statistic_page");
            	  showLoading();
            	  var authData = {};
            	  authData.userCode = session.get("userCode");
            	  authData.random = Math.random();
            	  $.getJSON(basePath+"/app/employeeStatusStatistic/queryEmployeeStatusStatistic.xhtml"+callback,authData,function(msg){
            		  
            		  if($.trim(msg.returnCode) == '0'){
            			  
            			  if(msg.data.length <= 0){
          		    	     showHide();
//                         	 showMessage('暂无数据','1500');
                         	 return;
             			  }
//            			  var $template = $("#employee_status_statistic_page .list-row-template ul li");
            			  var $template = $("#employee_status_statistic_page .list-row-template ul li ul"); 
            			  
            			  
            			  $.each(msg.data,function(i,n){
          				    var $employee_status_statistic = $template.clone(true);
          				  
          				    $employee_status_statistic.find("[identity='TEAM_NAME']").text(n.TEAM_NAME);            //分区
          				    $employee_status_statistic.find("[identity='EMPLOYEE_COUNT']").text(n.EMPLOYEE_COUNT);  //员工总数
          				    $employee_status_statistic.find("[identity='CHECK_IN_COUNT']").text(n.CHECK_IN_COUNT);  //工作中人数(签入人数-实地中人数)
          				    $employee_status_statistic.find("[identity='COLLECTING_COUNT']").text(n.COLLECTING_COUNT);  //实地中人数
          				    $employee_status_statistic.find("[identity='UN_CHECK_IN_COUNT']").text(n.EMPLOYEE_COUNT-n.CHECK_IN_COUNT-n.CHECKED_IN_COUNT);  //未签入人数
          				    $employee_status_statistic.find("[identity='UN_COLLECT_COUNT']").text(n.EMPLOYEE_COUNT-n.COLLECTING_COUNT-n.COLLECTED_COUNT);  //未实地人数
          				    
          				    $employee_status_statistic.find("[identity='EMPLOYEE_COUNT']").attr("personnelCategory",ConstDef.getConstant("CATEGORY_PERSONNEL_TOTAL"));
          				    $employee_status_statistic.find("[identity='CHECK_IN_COUNT']").attr("personnelCategory",ConstDef.getConstant("CATEGORY_PERSONNEL_WORKING"));
          				    $employee_status_statistic.find("[identity='COLLECTING_COUNT']").attr("personnelCategory",ConstDef.getConstant("CATEGORY_PERSONNEL_COLLECTING"));
          				    $employee_status_statistic.find("[identity='UN_CHECK_IN_COUNT']").attr("personnelCategory",ConstDef.getConstant("CATEGORY_PERSONNEL_UNCHECKIN"));
          				    $employee_status_statistic.find("[identity='UN_COLLECT_COUNT']").attr("personnelCategory",ConstDef.getConstant("CATEGORY_PERSONNEL_UNCOLLECT"));
          				    
          				    var $listRowTapSpan = $employee_status_statistic.find("span");
          				    $listRowTapSpan.attr("teamCode",n.TEAM_CODE);
          				    $listRowTapSpan.bind("tap",function(){
          				    	var $currentItem = $(this);
           					   $currentItem.css("background-color","orange");
           					   setTimeout(function(){
           						   $currentItem.css("background-color","white");
                					  
                  					session.set("teamCode",$currentItem.attr("teamCode"));
            				    	session.set("personnelCategory",$currentItem.attr("personnelCategory"));
            				    	session.set("page_keyword","人员状态统计");
            						session.set("page_title","人员状态统计");
            						session.set("page_from","employee_status_statistic_page");
            						
            				    	goto_page("employee_real_time_positioning_page");
           					   },100)
          				    	
          				    });
          				    $("#employee_status_statistic_page .StatisticalResult .StatisticalResultLi").append($employee_status_statistic);
          				  
          			  }); 
            		
            			  $("#employee_status_statistic_page .StatisticalResult .StatisticalResultLi ul:first-child").css("width",'25%');
        			  var ulWidth = (75/msg.data.length)+'%';
        			  $("#employee_status_statistic_page .StatisticalResult .StatisticalResultLi ul:not(:first)").css("width",ulWidth);
            		  
        			  showHide();  
            			  
//            			  $.each(msg.data,function(i,n){
//            				    var $employee_status_statistic=$template.clone(true);
//            				  
//            				    $employee_status_statistic.find("[identity='TEAM_NAME']").text(n.TEAM_NAME);            //分区
//            				    $employee_status_statistic.find("[identity='EMPLOYEE_COUNT']").text(n.EMPLOYEE_COUNT);  //员工总数
////            				    $employee_status_statistic.find("[identity='LOGON_COUNT']").text(n.LOGON_COUNT);        
//            				    $employee_status_statistic.find("[identity='CHECK_IN_COUNT']").text(n.CHECK_IN_COUNT);  //工作中人数(签入人数-实地中人数)
//            				    $employee_status_statistic.find("[identity='COLLECTING_COUNT']").text(n.COLLECTING_COUNT);  //实地中人数
//            				    $employee_status_statistic.find("[identity='UN_CHECK_IN_COUNT']").text(n.EMPLOYEE_COUNT-n.CHECK_IN_COUNT-n.CHECKED_IN_COUNT);  //未签入人数
////            				    $employee_status_statistic.find("[identity='UN_LOGON_COUNT']").text(n.UN_LOGON_COUNT);
//            				    $employee_status_statistic.find("[identity='UN_COLLECT_COUNT']").text(n.EMPLOYEE_COUNT-n.COLLECTING_COUNT-n.COLLECTED_COUNT);  //未实地人数
//            				    
//            				    $employee_status_statistic.find("[identity='EMPLOYEE_COUNT']").attr("personnelCategory",ConstDef.getConstant("CATEGORY_PERSONNEL_TOTAL"));
//            				    $employee_status_statistic.find("[identity='CHECK_IN_COUNT']").attr("personnelCategory",ConstDef.getConstant("CATEGORY_PERSONNEL_WORKING"));
//            				    $employee_status_statistic.find("[identity='COLLECTING_COUNT']").attr("personnelCategory",ConstDef.getConstant("CATEGORY_PERSONNEL_COLLECTING"));
//            				    $employee_status_statistic.find("[identity='UN_CHECK_IN_COUNT']").attr("personnelCategory",ConstDef.getConstant("CATEGORY_PERSONNEL_UNCHECKIN"));
//            				    $employee_status_statistic.find("[identity='UN_COLLECT_COUNT']").attr("personnelCategory",ConstDef.getConstant("CATEGORY_PERSONNEL_UNCOLLECT"));
//            				    
////            				    $employee_status_statistic.attr("teamCode",n.TEAM_CODE);
//            				    var $listRowTapSpan = $employee_status_statistic.find("span");
//            				    $listRowTapSpan.attr("teamCode",n.TEAM_CODE);
//            				    $listRowTapSpan.bind("tap",function(){
//            				    	var $currentItem = $(this);
//             					   $currentItem.css("background-color","orange");
//             					   setTimeout(function(){
//             						   $currentItem.css("background-color","white");
//                  					  
//	                  					session.set("teamCode",$currentItem.attr("teamCode"));
//	            				    	session.set("personnelCategory",$currentItem.attr("personnelCategory"));
//	            				    	session.set("page_keyword","人员状态统计");
//	            						session.set("page_title","人员状态统计");
//	            						session.set("page_from","employee_status_statistic_page");
//	            						
//	            				    	goto_page("employee_real_time_positioning_page");
//             					   },100)
//            				    	
//            				    });
//            					showHide();
//            				    $("#employee_status_statistic_page .StatisticalResult").append($employee_status_statistic);
//            				  
//            			  });
            			  
            		  }else{
	 	            	showHide();
	 	            	errorHandler(msg.returnCode,msg.message);
	 	            }
            		  
            	  });
              }