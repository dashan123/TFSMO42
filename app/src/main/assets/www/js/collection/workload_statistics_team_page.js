          var  workload_statistics_page;
          workload_statistics_page=$("#workload_statistics_page");
/** ****************************workload_statistics_page---begin************************************* */    
          workload_statistics_page.live('pageinit',function(e,ui){

//        		$("#workload_statistics_page #startDate").val(getYesterdayDate());
//        		$("#workload_statistics_page #endDate").val(getYesterdayDate());
        		$("#workload_statistics_page #startDate").val(getEndTime());
        		$("#workload_statistics_page #endDate").val(getEndTime());

        	  //返回工作台
        	  workload_statistics_page.find(".BackBtn").live('tap',function(event){
        		  event.stopPropagation();
        		  back_page();
        	  });
        	  
        	  //搜索按钮
        	  workload_statistics_page.find(".chooseBtn").live('tap',function(){
        		  
        		  load_workload_statistics_page_content();
        	  });
          });
/** ****************************workload_statistics_page---end************************************* */             
          workload_statistics_page.live('pageshow',function(e,ui){
        	  var fromPage = session.get("fromPage");
 			 if(fromPage != "workload_statistics_employee_page"){
 	        	  load_workload_statistics_page_content();
 			 }

          });
          
          
          function load_workload_statistics_page_content(){
        	  showLoading();
        	  var page=$("#workload_statistics_page");
        	  //清空第一行之外的所有内容
        	  page.find(".StatisticalResult .StatisticalResultLi ul").not(":first").remove();
        	  var authData={}
        	  authData.userCode=session.get("userCode");
        	  authData.random=Math.random();
        	  authData.startDate=page.find("#startDate").val();
        	  session.set("startDate",authData.startDate);
        	  authData.endDate=page.find("#endDate").val();
        	  session.set("endDate",authData.endDate);
        	  $.getJSON(basePath+"/app/workloadStatistics/queryWorkloadStatisticsByTeam.xhtml"+callback,authData,function(msg){
        		  if($.trim(msg.returnCode) == '0'){
//        			  $.each(msg.data,function(i,n){
//        				   $woekloadstaistics=$("#workload_statistics_page .list-row-template ul li").clone(true);
//        				   $woekloadstaistics.find('[identity="TEAM_NAME"]').text(n.TEAM_NAME);
////        				   $woekloadstaistics.find('[identity="CASE_COUNT"]').text(n.CASE_COUNT);
//        				   $woekloadstaistics.find('[identity="COLLECTED_CASE_COUNT"]').text(n.COLLECTED_CASE_COUNT);
//        				   $woekloadstaistics.find('[identity="COLLECTED_ADDRESS_COUNT"]').text(n.COLLECTED_ADDRESS_COUNT);
//        				   $woekloadstaistics.find('[identity="COLLECTED_TEL_RECORD_COUNT"]').text(n.COLLECTED_TEL_RECORD_COUNT);
//        				   $woekloadstaistics.find('[identity="MILES_AMOUNT"]').text(Math.round(n.MILES_AMOUNT));
////        				   $woekloadstaistics.find('[identity="ONLINE_HOURS"]').text(n.ONLINE_HOURS);
//        				   
//        				   var checkInTimeHours = Math.floor(n.CHECK_IN_HOURS/60);
//        				   var checkInTimeMinute = n.CHECK_IN_HOURS%60;
//        				   var CHECKINHOURS = checkInTimeHours+"H"+checkInTimeMinute+"M";
//        				   $woekloadstaistics.find('[identity="CHECK_IN_HOURS"]').text(CHECKINHOURS);
//        				   
//        				   var driveTimeHours = Math.floor(n.DRIVE_HOURS/60);
//        				   var driveTimeMinute = n.DRIVE_HOURS%60;
//        				   var DRIVEHOURS = driveTimeHours+"H"+driveTimeMinute+"M";
//        				   $woekloadstaistics.find('[identity="DRIVE_HOURS"]').text(DRIVEHOURS);
//        				 
//        				   $woekloadstaistics.attr("TEAM",n.TEAM);
//        				   
//        				   //跳转工作量统计by Employee
//        				   $woekloadstaistics.bind('tap',function(){
//        					   var $currentItem = $(this);
//        					   $currentItem.children().css("background-color","orange");
//        					   setTimeout(function(){
//        						   $currentItem.children().css("background-color","white");
//        						   session.set("teamCode",$currentItem.attr("TEAM"));
//             					  goto_page("workload_statistics_employee_page");
//        					   },100)
//        					  
//        				   });
//        				   page.find(".StatisticalResult").append($woekloadstaistics);
//        			  });
        			  
        			  
        			  $.each(msg.data,function(i,n){
	       				   $woekloadstaistics=$("#workload_statistics_page .list-row-template ul li ul").clone(true);
	       				   $woekloadstaistics.find('[identity="TEAM_NAME"]').text(n.TEAM_NAME);
	//       				   $woekloadstaistics.find('[identity="CASE_COUNT"]').text(n.CASE_COUNT);
	       				   $woekloadstaistics.find('[identity="COLLECTED_CASE_COUNT"]').text(n.COLLECTED_CASE_COUNT);
	       				   $woekloadstaistics.find('[identity="COLLECTED_ADDRESS_COUNT"]').text(n.COLLECTED_ADDRESS_COUNT);
	       				   $woekloadstaistics.find('[identity="COLLECTED_TEL_RECORD_COUNT"]').text(n.COLLECTED_TEL_RECORD_COUNT);
	       				   $woekloadstaistics.find('[identity="MILES_AMOUNT"]').text(Math.round(n.MILES_AMOUNT));
	//       				   $woekloadstaistics.find('[identity="ONLINE_HOURS"]').text(n.ONLINE_HOURS);
	       				   
	       				   var checkInTimeHours = Math.floor(n.CHECK_IN_HOURS/60);
	       				   var checkInTimeMinute = n.CHECK_IN_HOURS%60;
	       				   var CHECKINHOURS = checkInTimeHours+"H"+checkInTimeMinute+"M";
	       				   $woekloadstaistics.find('[identity="CHECK_IN_HOURS"]').text(CHECKINHOURS);
	       				   
	       				   var driveTimeHours = Math.floor(n.DRIVE_HOURS/60);
	       				   var driveTimeMinute = n.DRIVE_HOURS%60;
	       				   var DRIVEHOURS = driveTimeHours+"H"+driveTimeMinute+"M";
	       				   $woekloadstaistics.find('[identity="DRIVE_HOURS"]').text(DRIVEHOURS);
	       				 
	       				   $woekloadstaistics.attr("TEAM",n.TEAM);
	       				   
	       				   //跳转工作量统计by Employee
	       				   $woekloadstaistics.bind('tap',function(){
	       					   var $currentItem = $(this);
	       					   $currentItem.find("li").children().css("background-color","orange");
	       					   setTimeout(function(){
	       						   $currentItem.find("li").children().css("background-color","white");
	       						   session.set("teamCode",$currentItem.attr("TEAM"));
	            					  goto_page("workload_statistics_employee_page");
	       					   },100)
	       					  
	       				   });
	       				   page.find(".StatisticalResult .StatisticalResultLi").append($woekloadstaistics);
	       			  });
        			  
        			  page.find(".StatisticalResult .StatisticalResultLi ul:first-child").css("width",'25%');
        			  var ulWidth = (75/msg.data.length)+'%';
        			  page.find(".StatisticalResult .StatisticalResultLi ul:not(:first)").css("width",ulWidth);
        			  
        			  showHide();
        			  if (msg.data.length <= 0) {
//        					showMessage('暂无数据', '1500');
        				}
        		  }else{
        			showHide();
        			errorHandler(msg.returnCode, msg.message);
        		  }
        	  });
          }