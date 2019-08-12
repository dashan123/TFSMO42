 var fi_unfinished_task_statistics_employee_page=$("#fi_unfinished_task_statistics_employee_page");

 var fi_unfinished_task_statistics_employee_myScroll;
 /** ****************************fi_unfinished_task_statistics_employee_page---begin************************************* */              
 fi_unfinished_task_statistics_employee_page.live('pageinit',function(e,ui){
	  
	 var wrapper = "fi_unfinished_task_statistics_employee_wrapper";
	 var up = "fi_unfinished_task_statistics_employee_pullUp";
	 var down = "fi_unfinished_task_statistics_employee_pullDown";
	 fi_unfinished_task_statistics_employee_myScroll = createMyScroll(wrapper,up,down);
		
	// 返回工作台
	 fi_unfinished_task_statistics_employee_page.find(".BackBtn").live("fastClick", function(event) {
	  	event.stopPropagation();
        back_page();
	 });
	 
  });
  
  /** ****************************fi_unfinished_task_statistics_employee_page---end************************************* */
 fi_unfinished_task_statistics_employee_page.live('pageshow',function(e,ui){
		 load_fi_unfinished_task_statistics_employee_page_content();
  });
  
  
  function load_fi_unfinished_task_statistics_employee_page_content(){
	  
	  //清空第一行之外的所有内容
	  $("#fi_unfinished_task_statistics_employee_page .fiUnfinishedTaskStatisticsContentDiv ul").not(":first").remove();
	  var page =$("#fi_unfinished_task_statistics_employee_page");
	  showLoading();
	  var teamCode = session.get("teamCode");
	  page.find("span[id='teamCode']").attr("teamCode",teamCode);
	  var authData = {};
	  authData.random = Math.random();
	  authData.taskType = session.get("taskType");
	  authData.beginDate = session.get("beginDate");
	  authData.endDate = session.get("endDate");
	  authData.teamCode = teamCode;
	  
	  $.getJSON(basePath+"/app/fiUnfinishedTaskStatisticsEmployee/pageInit.xhtml"+callback,authData,function(msg){
		  if($.trim(msg.returnCode) == '0'){
			  showHide();
			  if(msg.data){
				  var data = msg.data;
				  
				  fiUnfinishedTaskStatisticsEmployeePage_bindDataToPage(data,authData);
			  }
		
		  }else{
        	showHide();
        	errorHandler(msg.returnCode,msg.message);
        }
		  
	  });
  }
  
  
  function fiUnfinishedTaskStatisticsEmployeePage_bindDataToPage(data,authData){
	  
	  var $template = $("#fi_unfinished_task_statistics_employee_page .list-row-template .fiUnfinishedTaskStatisticsUl"); 
	  
	  $.each(data.employeeUnfinishedTaskStatisticsList,function(i,n){
		  
	    var $fi_unfinished_task_statistics_employee = $template.clone(true);
	  
	    $fi_unfinished_task_statistics_employee.find("[identity='userName']").text(n.userName);            //分区
	    $fi_unfinished_task_statistics_employee.find("[identity='noAppointmentTaskCount']").text(n.noAppointmentTaskCount);  //未约任务数
	    $fi_unfinished_task_statistics_employee.find("[identity='undoTaskCount']").text(n.undoTaskCount);  //已约未办任务数)
	    $fi_unfinished_task_statistics_employee.attr("userId",n.userId);
	    
	    $fi_unfinished_task_statistics_employee.bind("tap",function(){
	    	var $currentItem = $(this);
		    $currentItem.css("background-color","orange");
		    setTimeout(function(){
			    $currentItem.css("background-color","white");
				  
				session.set("beginDate",authData.beginDate);
				session.set("endDate",authData.endDate);
				session.set("taskType",authData.taskType);
				session.set("teamCode",authData.teamCode);
				session.set("fiUnfinishedTaskStatisticsEmployeeUserId",$currentItem.attr("userId"));
				
		    	session.set("page_keyword","未完成任务统计");
				session.set("page_title","未完成任务统计");
				session.set("page_from","fi_unfinished_task_statistics_employee_page");
				
		    	goto_page("fi_unfinished_task_statistics_city_page");
		   },100)
	    	
	    });
	    $fi_unfinished_task_statistics_employee.css("display","");
	    $("#fi_unfinished_task_statistics_employee_page .fiUnfinishedTaskStatisticsContentDiv").append($fi_unfinished_task_statistics_employee);
	  }); 
  }