var audit_done_task_list_page = $('#audit_done_task_list_page');

var audit_done_task_list_myScroll;

/******************************audit_done_task_list_page---begin**************************************/
audit_done_task_list_page.live('pageinit',function(e,ui){
	
	var wrapper = "audit_done_task_list_wrapper";
	var up = "audit_done_task_list_pullUp";
	var down = "audit_done_task_list_pullDown";
	audit_done_task_list_myScroll = createMyScroll(wrapper,up,down);
	//回退事件处理
	audit_done_task_list_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		//初始化分页 
		currentPage = 1;
		hasData = true;
		
		back_page("workbench_page");
	});

	audit_done_task_list_page.find(".auditSegmentedButtonGroup input").live("tap",function(event){
		//初始化分页 
		currentPage = 1;
		hasData = true;
		$('#auditDoneTaskListPage_auditDoneTaskList').empty();
		
		$(this).attr("class","segmentedButtons3Selected");
		$(this).siblings().attr("class","segmentedButtons3Unselected");
		
		auditDoneTaskList_queryAuditDoneTaskList();
	});
	
	//搜索按钮-->查询盘库已办任务
	audit_done_task_list_page.find(".queryButton").live('tap',function(){
		//初始化分页 
		currentPage = 1;
		hasData = true;
		$('#auditDoneTaskListPage_auditDoneTaskList').empty();
		
		auditDoneTaskList_queryAuditDoneTaskList();
	});
	
});//end pageinit

audit_done_task_list_page.live('pageshow',function(e, ui){

	currentLoadActionName  = "audit_done_task_list_load_content";
	
	//设置默认的日期范围
	var curDate = new Date();
	/* 获取当前年份 (4位,1970-????)*/
	var curYear = curDate.getFullYear();
	/* 获取当前月份 (0-11,0代表1月)*/
	var curMonth = curDate.getMonth();
	/* 获取当前日(1-31) */
	var curDate = curDate.getDate();
	
	/* 返回当月的天数 */
	var now = new Date(),
	minDate = new Date(curYear, curMonth, 1),
	maxDate = new Date(curYear, curMonth, curDate);
	
	var fromPage = session.get("fromPage");
	if(fromPage != "audit_list_page" ){
		
		//选择日期范围
		$('#auditDoneTaskListPage-dateRange').mobiscroll().range({
			theme: 'red',
		    lang: 'zh',
		    display: 'bottom',        
		    defaultValue: [minDate, maxDate]
		});
		$('#auditDoneTaskListPage-dateRange').mobiscroll('setVal', [minDate, maxDate],true);
		
		$('#auditDoneTaskListPage_auditDoneTaskList').empty();
		
		auditDoneTaskList_queryAuditDoneTaskList();
	}else{
		// 获取当前页的index
		var scrollCurrentElementIndex = 0;
 	    var scrollNowPage = session.get("nowPage");
 	    if(!$.isEmptyObject(scrollMap)){
 	    	var commonScrollMapJsonObj = scrollMap[scrollNowPage];
 	    	if(commonScrollMapJsonObj != null && typeof(commonScrollMapJsonObj) != "undefined"){
 	    		commonScrollMapJsonObj = JSON.parse(commonScrollMapJsonObj);
 	 	 	    scrollCurrentElementIndex = commonScrollMapJsonObj.scrollCurrentElementIndex;
 	 	    	//删除Json数据中的scrollNowPage属性  
 	 	        delete scrollMap[scrollNowPage]; 
 	    	}
 	    }
		var scrollCurrentElement = $('#audit_done_task_list_page').find('.margin-t10').get(scrollCurrentElementIndex);
		audit_done_task_list_myScroll.refresh();//刷新iScroll
		audit_done_task_list_myScroll.scrollToElement(scrollCurrentElement,0);
	}
	
});//end pageshow

function audit_done_task_list_load_content(){
	//下拉不刷新，则该方法置空
	if(hasData){
		auditDoneTaskList_queryAuditDoneTaskList();
	}
}

/**
 * 查询已办盘库任务
 * @param startDate 任务开始日期
 * @param endDate 任务结束时间
 * @param taskType 1.经销商盘库  2.监管单位盘库 3.抽查
 */
function auditDoneTaskList_queryAuditDoneTaskList(){
	
	//获取日期范围
	var dateRange = $('#auditDoneTaskListPage-dateRange').mobiscroll('getVal');
	var startDate;
	var endDate;
	if(dateRange){
		if(dateRange[0] != null && dateRange[1] != null){
			startDate = Format(dateRange[0],"yyyy-MM-dd");
			endDate = Format(dateRange[1],"yyyy-MM-dd");
		}
	}
	//获取任务类型
	var taskType = $("#audit_done_task_list_page").find("input.segmentedButtons3Selected").val();
	
	var postData ={};
	postData.random = new Date();
	setScroll(postData);//设置分页开始结束位置
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	
	postData.startDate = startDate;
	postData.endDate = endDate;

	//1.经销商盘库  2.监管单位盘库 3.抽查
	if(taskType === "全部"){
		
	}else if(taskType === "盘点"){
		postData.taskTypeArray = JSON.stringify([1,2]);
	}else if(taskType === "抽查"){
		postData.taskTypeArray = JSON.stringify([3]);
	}
	
	//查询盘库任务列表
	$.ajax({
		url: basePath+"/app/auditDoneTaskList/queryAuditDoneTaskList.xhtml"+callback, //这个地址做了跨域处理
		data: postData,
		type: 'GET',
		dataType: 'json',
		async:false,
		beforeSend: function () {
			showLoading();
		},
		success: function (msg) {
			showHide();
			if($.trim(msg.returnCode) == '0') {
				var $auditDoneTaskList = $('#auditDoneTaskListPage_auditDoneTaskList');
				
				var data = msg.data;
				$('#audit_done_task_list_page').find("#totalDoneTaskListNum").text(data.length);
				
				if(data != null && data.length > 0){
					//显示盘库任务列表
					var $templateInventoryTaskLi = $('#audit_done_task_list_page').find(".list-row-template [template-id='audit-done-task-list-inventory-li']");
					var $templateCheckTaskLi = $('#audit_done_task_list_page').find(".list-row-template [template-id='audit-done-task-list-check-li']");
					$.each(data,function(i,n){
						//taskType：1.经销商盘库  2.监管单位盘库 3.抽查
						if(n.taskType == 1 || n.taskType == 2){
							var $inventoryTaskLi = $templateInventoryTaskLi.clone(true);
							
							//用于返回该页面时计算选项的index
							$inventoryTaskLi.find("dd").attr("scrollCurrentPage",currentPage);
							$inventoryTaskLi.find("dd").attr("scrollCurrentElementNum",i);
							
							dataBindToElement($inventoryTaskLi,n);
							$inventoryTaskLi.find(".ListTit a").attr("class","RwPd");
							
							$inventoryTaskLi.find("dd").bind("tap",function(event){
								if(n.taskType == 1){
									//taskStatus 任务状态(0.未办 1.已办 2.跳过 3.进行中 )
									if(n.taskStatus == 2){
										showMessage("跳过的盘点任务，不能查看盘点清单！",1500);
									}else{
//										var acknowledge = "AK";
//										if(acknowledge == "AK"){
//											showMessage("已经acknowledge，不能查看盘库清单！",1500);
//										}else{
										
											//设置当前选项的index到session中
											var scrollCurrentElementIndex = 0;
											var scrollCurrentElementNum = $(this).attr("scrollCurrentElementNum");
											var scrollCurrentPage = $(this).attr("scrollCurrentPage");
											var pageDisplayCount = session.get("pageDisplayCount");
									 	    var pageAddCount = session.get("pageAddCount");
									 	   if(scrollCurrentPage <= 1){
									 		   	scrollCurrentElementIndex = parseInt(scrollCurrentElementNum)+1;
										    }else{
										    	scrollCurrentElementIndex = parseInt(pageDisplayCount)+((parseInt(scrollCurrentPage)-2)*parseInt(pageAddCount))+parseInt(scrollCurrentElementNum)+1;
										    }
											var scrollMapJSON = {};
											scrollMapJSON.scrollCurrentElementIndex = scrollCurrentElementIndex;
											scrollMap.audit_done_task_list_page = JSON.stringify(scrollMapJSON);
											
											if(n.sameTaskId != null && n.sameTaskId != ""){
												//日表中经销商某天的盘库计划安排多人盘库
												session.set("auditPlanDayId",n.sameTaskId);
												//useSameTaskIdFlag:是否使用sameTaskId或checkSameTaskId--0：未使用  1：使用sameTaskId 2：使用checkSameTaskId
												session.set("useSameTaskIdFlag",1);
											}else{
												//日表中经销商某天的盘库计划只安排一人盘库
												session.set("auditPlanDayId",n.auditPlanDayId);
												//useSameTaskIdFlag:是否使用sameTaskId或checkSameTaskId--0：未使用  1：使用sameTaskId 2：使用checkSameTaskId
												session.set("useSameTaskIdFlag",0);
											}
											session.set("auditDoneTaskList_dealerCode",n.dealerCode);
											session.set("dealerCustodian",n.dealerCustodian);
											session.set("taskType",n.taskType);
											session.set("auditPlanDate",n.auditDate);
											session.set("planStatus",n.status);//状态(1.生成，2.提交，3.发布)
											session.set("auditorId",n.auditorId);//盘点人员user_id
											
											session.set("relationAuditPlanDayId",""); //抽查任务对应盘点任务的盘点计划日ID
											session.set("checkAuditId","");//抽查任务对应盘点任务的盘点员ID(user_id)
											session.set("checkAuditDate","");//抽查任务对应盘点任务的盘点日期
											session.set("checkTaskStatus","");//抽查任务对应盘点任务的任务状态(0.未办 1.已办 2.跳过 3.进行中 )
											
									    	session.set("page_keyword","已办任务");
											session.set("page_title","已办任务");
											session.set("page_from","audit_done_task_list_page");
											
											goto_page("audit_list_page");
										}
										
//									}
									
								}else{
//									showMessage("监管单位的盘库清单是线下维护！",1500);
									//taskStatus 任务状态(0.未办 1.已办 2.跳过 3.进行中 )
									if(n.taskStatus == 2){
										showMessage("跳过的盘点任务，不能查看盘点经销商列表页面！",1500);
									}else{
										//设置当前选项的index到session中
										var scrollCurrentElementIndex = 0;
										var scrollCurrentElementNum = $(this).attr("scrollCurrentElementNum");
										var scrollCurrentPage = $(this).attr("scrollCurrentPage");
										var pageDisplayCount = session.get("pageDisplayCount");
								 	    var pageAddCount = session.get("pageAddCount");
								 	   if(scrollCurrentPage <= 1){
								 		   	scrollCurrentElementIndex = parseInt(scrollCurrentElementNum)+1;
									    }else{
									    	scrollCurrentElementIndex = parseInt(pageDisplayCount)+((parseInt(scrollCurrentPage)-2)*parseInt(pageAddCount))+parseInt(scrollCurrentElementNum)+1;
									    }
										var scrollMapJSON = {};
										scrollMapJSON.scrollCurrentElementIndex = scrollCurrentElementIndex;
										scrollMap.audit_done_task_list_page = JSON.stringify(scrollMapJSON);
										
										session.set("auditPlanDayId",n.auditPlanDayId);
										session.set("auditDoneTaskList_dealerCode",n.dealerCode);
										session.set("taskType",n.taskType);
										session.set("auditPlanDate",n.auditDate);
										session.set("planStatus",n.status);//状态(1.生成，2.提交，3.发布)
										session.set("taskStatus",n.taskStatus);//任务状态(0.未办 1.已办 2.跳过 3.进行中 )
										session.set("auditorId",n.auditorId);//盘点人员user_id
										
								    	session.set("page_keyword","已办任务");
										session.set("page_title","已办任务");
										session.set("page_from","audit_done_task_list_page");
										
										goto_page("audit_custodian_dealer_list_page");
									}
								}
							});
							
							$inventoryTaskLi.show();
							$auditDoneTaskList.append($inventoryTaskLi);
						}
						//taskType：1.经销商盘库  2.监管单位盘库 3.抽查
						else if(n.taskType == 3){
							var $checkTaskLi = $templateCheckTaskLi.clone(true);
							
							//用于返回该页面时计算选项的index
							$checkTaskLi.find("dd").attr("scrollCurrentPage",currentPage);
							$checkTaskLi.find("dd").attr("scrollCurrentElementNum",i);
							
							dataBindToElement($checkTaskLi,n);
							$checkTaskLi.find(".ListTit a").attr("class","RwCc");
							
							$checkTaskLi.find("dd").bind("tap",function(event){
								
								//设置当前选项的index到session中
								var scrollCurrentElementIndex = 0;
								var scrollCurrentElementNum = $(this).attr("scrollCurrentElementNum");
								var scrollCurrentPage = $(this).attr("scrollCurrentPage");
								var pageDisplayCount = session.get("pageDisplayCount");
						 	    var pageAddCount = session.get("pageAddCount");
						 	   if(scrollCurrentPage <= 1){
						 		   	scrollCurrentElementIndex = parseInt(scrollCurrentElementNum)+1;
							    }else{
							    	scrollCurrentElementIndex = parseInt(pageDisplayCount)+((parseInt(scrollCurrentPage)-2)*parseInt(pageAddCount))+parseInt(scrollCurrentElementNum)+1;
							    }
								var scrollMapJSON = {};
								scrollMapJSON.scrollCurrentElementIndex = scrollCurrentElementIndex;
								scrollMap.audit_done_task_list_page = JSON.stringify(scrollMapJSON);
								
								session.set("auditPlanDayId",n.auditPlanDayId);//抽查任务的盘点计划日ID
								session.set("auditDoneTaskList_dealerCode",n.dealerCode);
								session.set("taskType",n.taskType);
								session.set("auditPlanDate",n.auditDate);
								session.set("planStatus",n.status);//状态(1.生成，2.提交，3.发布)
								session.set("dealerCustodian",n.dealerCustodian);
								session.set("auditorId",n.auditorId);//抽查任务的盘点员ID(user_id)
							
								//relationAuditPlanDayId：抽查任务对应盘点任务的盘点计划日ID
								if(n.checkSameTaskId != null && n.checkSameTaskId != ""){
									//盘点日表中经销商某天的抽查计划对应的盘库任务安排多人盘库
									session.set("relationAuditPlanDayId",n.checkSameTaskId);
									//useSameTaskIdFlag:是否使用sameTaskId或checkSameTaskId--0：未使用  1：使用sameTaskId 2：使用checkSameTaskId
									session.set("useSameTaskIdFlag",2);
								}else{
									//盘点日表中经销商某天的抽查计划对应的盘库任务只安排一人盘库
									session.set("relationAuditPlanDayId",n.relationAuditPlanDayId); 
									//useSameTaskIdFlag:是否使用sameTaskId或checkSameTaskId--0：未使用  1：使用sameTaskId 2：使用checkSameTaskId
									session.set("useSameTaskIdFlag",0);
								}
								session.set("checkAuditId",n.checkAuditId);//抽查任务对应盘点任务的盘点员ID(user_id)
								session.set("checkAuditDate",n.checkAuditDate);//抽查任务对应盘点任务的盘点日期
								session.set("checkTaskStatus",n.checkTaskStatus);//抽查任务对应盘点任务的任务状态(0.未办 1.已办 2.跳过 3.进行中 )
								
								session.set("page_keyword","已办任务");
								session.set("page_title","已办任务");
								session.set("page_from","audit_done_task_list_page");
								
								goto_page("audit_list_page");
							});
							
							$checkTaskLi.show();
							$auditDoneTaskList.append($checkTaskLi);
						}
						 
					});//end each
					$auditDoneTaskList.css("display","");
					
					//判断该列表是否已无数据
		          	if (!hasPage(data.length)) {
		          		hasData = false;
		          		//无数据时结束分页滚动
		          		endScroll(audit_done_task_list_myScroll);
		          	}
				}else{
					hasData = false;
		          	//无数据时结束分页滚动
		      		endScroll(audit_done_task_list_myScroll);
				}
			}
			else{
				errorHandler(msg.returnCode,msg.message);
				hasData = false;
	          	//无数据时结束分页滚动
	      		endScroll(audit_done_task_list_myScroll);
			}
		},
		complete: function() {
		}
	});//end $.ajax
}



