 var fi_unfinished_task_statistics_team_page=$("#fi_unfinished_task_statistics_team_page");

 /** ****************************fi_unfinished_task_statistics_team_page---begin************************************* */              
 fi_unfinished_task_statistics_team_page.live('pageinit',function(e,ui){
	  
	// 返回工作台
	 fi_unfinished_task_statistics_team_page.find(".BackBtn").live("fastClick", function(event) {
	  	event.stopPropagation();
        back_page('workbench_page');
	 });
	 
	//搜索按钮-->查询待办任务列表
	 fi_unfinished_task_statistics_team_page.find(".queryButton").live('tap',function(){
			
		 queryFiUnfinishedTaskStatisticsTeamList();
			
	});
	 
		//选择日期范围
	 	var beginDate = new Date();//获取当前时间  
	 	beginDate.setDate(1);
	 	var defaultBeginDate = new Date(beginDate.getFullYear(), beginDate.getMonth(), beginDate.getDate());
	 	var nowDate = new Date();//获取当前时间  
	 	var defaultEndDate = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
		var instance = mobiscroll.range('#fiUnfinishedTaskStatisticsTeamPage_dateRange', {
		    theme: 'red',
		    lang: 'zh',
		    display: 'bottom',
		    defaultValue: [defaultBeginDate, defaultEndDate]
		});
		var defaultBeginDateStr = Format(defaultBeginDate,"yyyy/MM/dd");
		var defaultEndDateStr = Format(defaultEndDate,"yyyy/MM/dd");
		$("#fiUnfinishedTaskStatisticsTeamPage_dateRange").val(defaultBeginDateStr+" - "+defaultEndDateStr);
		instance.setVal([defaultBeginDate, defaultEndDate]);
		
  });
  
  /** ****************************fi_unfinished_task_statistics_team_page---end************************************* */
 fi_unfinished_task_statistics_team_page.live('pageshow',function(e,ui){
	  var fromPage = session.get("fromPage");
	  
//	  if(fromPage != "fi_unfinished_task_statistics_employee_page"){
		  if(fromPage == "workbench_page"){
			  $("#fiUnfinishedTaskStatisticsTeamPage_taskType").mobiscroll("setVal","ALL",true);
		  }
		  
		 load_fi_unfinished_task_statistics_team_page_content();
//	  }
  });
  
  
  function load_fi_unfinished_task_statistics_team_page_content(){
	  
	  //清空第一行之外的所有内容
	  $("#fi_unfinished_task_statistics_team_page .fiUnfinishedTaskStatisticsContentDiv ul").not(":first").remove();
	  var page =$("#fi_unfinished_task_statistics_team_page");
	  showLoading();
	  var taskType = $("#fiUnfinishedTaskStatisticsTeamPage_taskType").val();
	  var authData = {};
	  authData.random = Math.random();
	  authData.taskType = taskType;
	  var teamDateRange = $('#fiUnfinishedTaskStatisticsTeamPage_dateRange').mobiscroll('getVal');
	  if(teamDateRange){
		  authData.beginDate = Format(teamDateRange[0],"yyyy-MM-dd");
		  authData.endDate = Format(teamDateRange[1],"yyyy-MM-dd");
	  }
	  
	  $.getJSON(basePath+"/app/fiUnfinishedTaskStatisticsTeam/pageInit.xhtml"+callback,authData,function(msg){
		  if($.trim(msg.returnCode) == '0'){
			  showHide();
			  if(msg.data){
				  var data = msg.data;
				  //初始化日程类型列表
				  var $taskTypes = $("#fiUnfinishedTaskStatisticsTeamPage_taskType");
				  $taskTypes.empty();
				  $.each(data.taskTypes,function(i,n){
					  var templateItem = '<option value="'+n.code+'">'+n.name+'</option>';
					  $taskTypes.append(templateItem);
				  });
				  $taskTypes.mobiscroll().select({
				        theme: 'red',
				        lang: 'zh',
				        display: 'bottom',
				        minWidth: 200,
				        onInit: function (event, inst) {
				        	if(taskType == null){
				        		$taskTypes.mobiscroll('setVal',"ALL",true);
				        	}else{
				        		$taskTypes.mobiscroll('setVal',taskType,true);
				        	}
				        }
				  });
				  
				  fiUnfinishedTaskStatisticsTeamPage_bindDataToPage(data,authData);
			  }
		
		  }else{
        	showHide();
        	errorHandler(msg.returnCode,msg.message);
        }
		  
	  });
  }
  
  function queryFiUnfinishedTaskStatisticsTeamList(){
	  var page =$("#fi_unfinished_task_statistics_team_page");
	  //清空第一行之外的所有内容
	  $("#fi_unfinished_task_statistics_team_page .fiUnfinishedTaskStatisticsContentDiv ul").not(":first").remove();
	  showLoading();
	  var taskType = $("#fiUnfinishedTaskStatisticsTeamPage_taskType").val();
	  var authData = {};
	  authData.random = Math.random();
	  authData.taskType = taskType;
	  var teamDateRange = $('#fiUnfinishedTaskStatisticsTeamPage_dateRange').mobiscroll('getVal');
	  if(teamDateRange){
		  authData.beginDate = Format(teamDateRange[0],"yyyy-MM-dd");
		  authData.endDate = Format(teamDateRange[1],"yyyy-MM-dd");
	  }
	  
	  $.getJSON(basePath+"/app/fiUnfinishedTaskStatisticsTeam/queryFiUnfinishedTaskStatisticsTeamList.xhtml"+callback,authData,function(msg){
		  if($.trim(msg.returnCode) == '0'){
			  showHide();
			  if(msg.data){
				  var data = msg.data;
				  fiUnfinishedTaskStatisticsTeamPage_bindDataToPage(data,authData);
			  }
		  }else{
        	showHide();
        	errorHandler(msg.returnCode,msg.message);
        }
		  
	  }); 
  }
  
  function fiUnfinishedTaskStatisticsTeamPage_bindDataToPage(data,authData){
	  
	  var $template = $("#fi_unfinished_task_statistics_team_page .list-row-template .fiUnfinishedTaskStatisticsUl"); 
	  
	  $.each(data.teamUnfinishedTaskStatisticsList,function(i,n){
	    var $fi_unfinished_task_statistics_team = $template.clone(true);
	  
	    $fi_unfinished_task_statistics_team.find("[identity='teamName']").text(n.teamName);            //分区
	    $fi_unfinished_task_statistics_team.find("[identity='noAppointmentTaskCount']").text(n.noAppointmentTaskCount);  //未约任务数
	    $fi_unfinished_task_statistics_team.find("[identity='undoTaskCount']").text(n.undoTaskCount);  //已约未办任务数)
	    
	    $fi_unfinished_task_statistics_team.attr("teamCode",n.teamCode);
	    $fi_unfinished_task_statistics_team.bind("tap",function(){
	    	var $currentItem = $(this);
		    $currentItem.css("background-color","orange");
		    setTimeout(function(){
			    $currentItem.css("background-color","white");
				
			    var taskType = $("#fiUnfinishedTaskStatisticsTeamPage_taskType").val();
				session.set("teamCode",$currentItem.attr("teamCode"));
				session.set("beginDate",authData.beginDate);
				session.set("endDate",authData.endDate);
				session.set("taskType",taskType);
				
		    	session.set("page_keyword","未完成任务统计");
				session.set("page_title","未完成任务统计");
				session.set("page_from","fi_unfinished_task_statistics_team_page");
				
		    	goto_page("fi_unfinished_task_statistics_employee_page");
		   },100)
	    	
	    });
	    $fi_unfinished_task_statistics_team.css("display","");
	    $("#fi_unfinished_task_statistics_team_page .fiUnfinishedTaskStatisticsContentDiv").append($fi_unfinished_task_statistics_team);
	  }); 
  }