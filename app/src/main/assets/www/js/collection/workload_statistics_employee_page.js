          var  workload_statistics_employee_page;
          workload_statistics_employee_page=$("#workload_statistics_employee_page");
          var workload_statistics_employee_page_myScroll;
/** ****************************workload_statistics_page---begin************************************* */    
          workload_statistics_employee_page.live('pageinit',function(e,ui){
        	  
        		var wrapper = "workload_statistics_employee_wrapper";
        	    var up = "workload_statistics_employee_pullUp";
        	    var down = "workload_statistics_employee_pullDown";
        	    workload_statistics_employee_page_myScroll = createMyScroll(wrapper,up,down);
        	  
        	  //返回工作量统计BYTEAM
        		workload_statistics_employee_page.find(".BackBtn").live('tap',function(event){
        			event.stopPropagation();
        			back_page();
        	  });
        	  
        
          });
/** ****************************workload_statistics_page---end************************************* */             
          workload_statistics_employee_page.live('pageshow',function(e,ui){
        	  
        	  currentLoadActionName = "workload_statistics_employee_load_content"
        	  
        	  load_workload_statistics_employee_page_content();
          });
          
          function workload_statistics_employee_load_content(){
        	  
          }
          
          
          function load_workload_statistics_employee_page_content(){
        	  
        	  var page=$("#workload_statistics_employee_page");
        	  //清空第一行之外的所有内容
        	  page.find(".StatisticalResult li").eq(0).nextAll().remove();
        	  var authData={}
        	  authData.userCode=session.get("userCode");
        	  authData.random=Math.random();
        	  authData.startDate=session.get("startDate");
        	  authData.endDate=session.get("endDate");
        	  authData.teamCode=session.get("teamCode");
        	  $.getJSON(basePath+"/app/workloadStatisticsEmployee/queryWorkloadStatisticsByEmployee.xhtml"+callback,authData,function(msg){
        		  if($.trim(msg.returnCode) == '0'){
        			  $.each(msg.data,function(i,n){
        				   $woekloadstaistics=$("#workload_statistics_employee_page .list-row-template ul li").clone(true);
        				   $woekloadstaistics.find('[identity="USER_NAME"]').text(n.USER_NAME);
//        				   $woekloadstaistics.find('[identity="CASE_COUNT"]').text(n.CASE_COUNT);
        				   $woekloadstaistics.find('[identity="COLLECTED_CASE_COUNT"]').text(n.COLLECTED_CASE_COUNT);
        				   $woekloadstaistics.find('[identity="COLLECTED_ADDRESS_COUNT"]').text(n.COLLECTED_ADDRESS_COUNT);
        				   $woekloadstaistics.find('[identity="COLLECTED_TEL_RECORD_COUNT"]').text(n.COLLECTED_TEL_RECORD_COUNT);
        				   $woekloadstaistics.find('[identity="MILES_AMOUNT"]').text(Math.round(n.MILES_AMOUNT));
//        				   $woekloadstaistics.find('[identity="ONLINE_HOURS"]').text(n.ONLINE_HOURS);
        				   
        				   var checkInTimeHours = Math.floor(n.CHECK_IN_HOURS/60);
        				   var checkInTimeMinute = n.CHECK_IN_HOURS%60;
        				   var CHECKINHOURS = checkInTimeHours+"H"+checkInTimeMinute+"M";
        				   $woekloadstaistics.find('[identity="CHECK_IN_HOURS"]').text(CHECKINHOURS);
        				   
        				   var driveTimeHours = Math.floor(n.DRIVE_HOURS/60);
        				   var driveTimeMinute = n.DRIVE_HOURS%60;
        				   var DRIVEHOURS = driveTimeHours+"H"+driveTimeMinute+"M";
        				   $woekloadstaistics.find('[identity="DRIVE_HOURS"]').text(DRIVEHOURS);
        				 
        				   page.find(".StatisticalResult").append($woekloadstaistics);
        			  });
        			  
        		  }	  
        	  });
          }