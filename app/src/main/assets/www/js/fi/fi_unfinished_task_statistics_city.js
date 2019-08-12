 var fi_unfinished_task_statistics_city_page=$("#fi_unfinished_task_statistics_city_page");

 var fi_unfinished_task_statistics_city_myScroll;
 /** ****************************fi_unfinished_task_statistics_city_page---begin************************************* */              
 fi_unfinished_task_statistics_city_page.live('pageinit',function(e,ui){
	  
	 var wrapper = "fi_unfinished_task_statistics_city_wrapper";
	 var up = "fi_unfinished_task_statistics_city_pullUp";
	 var down = "fi_unfinished_task_statistics_city_pullDown";
	 fi_unfinished_task_statistics_city_myScroll = createMyScroll(wrapper,up,down);
		
	// 返回工作台
	 fi_unfinished_task_statistics_city_page.find(".BackBtn").live("fastClick", function(event) {
	  	event.stopPropagation();
        back_page();
	 });
	 
  });
  
  /** ****************************fi_unfinished_task_statistics_city_page---end************************************* */
 fi_unfinished_task_statistics_city_page.live('pageshow',function(e,ui){
		 load_fi_unfinished_task_statistics_city_page_content();
  });
  
  
  function load_fi_unfinished_task_statistics_city_page_content(){
	  
	  //清空第一行之外的所有内容
	  $("#fi_unfinished_task_statistics_city_page .fiUnfinishedTaskStatisticsContentDiv ul").not(":first").remove();
	  $('#fi_unfinished_task_statistics_city_detail_list').empty();
	  var page =$("#fi_unfinished_task_statistics_city_page");
	  showLoading();
	  page.find("span[id='userId']").text(session.get("fiUnfinishedTaskStatisticsEmployeeUserId"));
	  var authData = {};
	  authData.random = Math.random();
	  authData.beginDate = session.get("beginDate");
	  authData.endDate = session.get("endDate");
	  authData.taskType = session.get("taskType");
	  authData.teamCode = session.get("teamCode");
	  authData.userId = session.get("fiUnfinishedTaskStatisticsEmployeeUserId");
	  
	  $.getJSON(basePath+"/app/fiUnfinishedTaskStatisticsCity/pageInit.xhtml"+callback,authData,function(msg){
		  if($.trim(msg.returnCode) == '0'){
			  showHide();
			  if(msg.data){
				  var data = msg.data;
				  
				  fiUnfinishedTaskStatisticsCityPage_bindDataToPage(data,authData);
			  }
		
		  }else{
        	showHide();
        	errorHandler(msg.returnCode,msg.message);
        }
		  
	  });
  }
  
  
  function fiUnfinishedTaskStatisticsCityPage_bindDataToPage(data,authData){
	  
	  var $template = $("#fi_unfinished_task_statistics_city_page .list-row-template .fiUnfinishedTaskStatisticsUl"); 
	  
	  $.each(data.cityUnfinishedTaskStatisticsList,function(i,n){
		  
	    var $fi_unfinished_task_statistics_city = $template.clone(true);
	  
	    $fi_unfinished_task_statistics_city.find("[identity='city']").text(n.city);            //分区
	    $fi_unfinished_task_statistics_city.find("[identity='noAppointmentTaskCount']").text(n.noAppointmentTaskCount);  //未约任务数
	    $fi_unfinished_task_statistics_city.find("[identity='undoTaskCount']").text(n.undoTaskCount);  //已约未办任务数)
	    
	    $fi_unfinished_task_statistics_city.bind("tap",function(){
	    	var $currentItem = $(this);
	    	var $contentUl = $("#fi_unfinished_task_statistics_city_page .fiUnfinishedTaskStatisticsContentDiv .fiUnfinishedTaskStatisticsUl");
	    	$contentUl.not(this).css("background-color","white");
		    $currentItem.css("background-color","orange");
		    
		    var beginDate = authData.beginDate;
		    var endDate = authData.endDate;
		    var taskType = authData.taskType;
		    var teamCode = authData.teamCode;
		    var userId = $("#fi_unfinished_task_statistics_city_page").find("span[id='userId']").text();
		    var city = $currentItem.find("[identity='city']").text();
		    queryFiUnfinishedTaskStatisticsCityDetail(beginDate,endDate,taskType,teamCode,userId,city);
	    });
	    $fi_unfinished_task_statistics_city.css("display","");
	    $("#fi_unfinished_task_statistics_city_page .fiUnfinishedTaskStatisticsContentDiv").append($fi_unfinished_task_statistics_city);
	  }); 
  }
  
  
function queryFiUnfinishedTaskStatisticsCityDetail(beginDate,endDate,taskType,
		teamCode,userId,city){
	  
	  $('#fi_unfinished_task_statistics_city_detail_list').empty();
	  var page =$("#fi_unfinished_task_statistics_city_page");
	  showLoading();
	  var authData = {};
	  authData.random = Math.random();
	  authData.beginDate = beginDate;
	  authData.endDate = endDate;
	  authData.taskType = taskType;
	  authData.teamCode = teamCode;
	  authData.userId = userId;
	  authData.city = city;
	  
	  $.getJSON(basePath+"/app/fiUnfinishedTaskStatisticsCity/queryFiUnfinishedTaskStatisticsCityDetail.xhtml"+callback,authData,function(msg){
		  if($.trim(msg.returnCode) == '0'){
			  showHide();
			  if(msg.data){
				  var data = msg.data;
				//未完成任务明细列表
				var $templateCityFiUnfinishedTaskDetailItem = $('#fi_unfinished_task_statistics_city_page').find("[template-id='cityFiUnfinishedTaskStatisticsDetailItem']");
				$.each(data.cityUnfinishedTaskStatisticsDetailList,function(i,n){
					var $cityFiUnfinishedTaskDetailItem = $templateCityFiUnfinishedTaskDetailItem.clone(true);
					
					if(n.taskType == "FI"){
						$cityFiUnfinishedTaskDetailItem.find("[role='forFI']").show();
//						n.taskTypeText = "家访";
					}
					else{
						$cityFiUnfinishedTaskDetailItem.find("[role='forFI']").hide();
						
//						if(n.taskType == "HY"){
//							n.taskTypeText = "会议";
//						}else if(n.taskType == "XZCS"){
//							n.taskTypeText = "协助催收";
//						}
					}
					
					dataBindToElement($cityFiUnfinishedTaskDetailItem,n);

					$cityFiUnfinishedTaskDetailItem.show();
					$('#fi_unfinished_task_statistics_city_detail_list').append($cityFiUnfinishedTaskDetailItem);
				});//end each
			  }
		
		  }else{
        	showHide();
        	errorHandler(msg.returnCode,msg.message);
        }
		  
	  });
  }