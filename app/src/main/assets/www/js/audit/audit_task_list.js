var audit_task_list_page = $('#audit_task_list_page');

var audit_task_list_myScroll;

/******************************home_page---begin**************************************/
audit_task_list_page.live('pageinit',function(e,ui){
	
	var wrapper = "audit_task_list_wrapper";
	var up = "audit_task_list_pullUp";
	var down = "audit_task_list_pullDown";
	audit_task_list_myScroll = createMyScroll(wrapper,up,down);
	//回退事件处理
	audit_task_list_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		//初始化分页
		currentPage = 1;
		hasData = true;
		
		back_page();
	});

	audit_task_list_page.find(".auditSegmentedButtonGroup input").live("tap",function(event){
		$(this).attr("class","segmentedButtons5Selected");
		$(this).siblings().attr("class","segmentedButtons5Unselected");
		
		//初始化分页 
		currentPage = 1;
		hasData = true;
		var $auditTaskListPage_auditTaskList = $('#auditTaskListPage_auditTaskList');
		$auditTaskListPage_auditTaskList.empty();
		auditTaskList_queryAuditTaskList();
	});
	
	//搜索按钮-->查询盘库任务列表
	audit_task_list_page.find(".queryButton").live('tap',function(){
		
		//初始化分页 
		currentPage = 1;
		hasData = true;
		var $auditTaskListPage_auditTaskList = $('#auditTaskListPage_auditTaskList');
		$auditTaskListPage_auditTaskList.empty();
		
		auditTaskList_queryAuditTaskList();
	});
	
});//end pageinit

audit_task_list_page.live('pageshow',function(e, ui){

	currentLoadActionName  = "audit_task_list_load_content";
	
	//设置默认的日期范围
	var planMonth =  session.get("planMonth");
	var year = planMonth.substring(0,4);
	var month = planMonth.substring(5,7);
//	var curDate = new Date();
	/* 获取当前月份 */
//	var curMonth = curDate.getMonth();
	/*  生成实际的月份: 由于curMonth会比实际月份小1, 故需减1 */
//	curDate.setMonth(month);
	/* 将日期设置为0 */
//	curDate.setDate(0);
	//获取year年month月的最后一天（即天数）
	var curDate = new Date(year,month,0);
	
	/* 返回当月的天数 */
//	var now = new Date(),
	var minDate = new Date(year, month-1, 1);
	var maxDate = new Date(year, month-1, curDate.getDate());

	//选择日期范围
	$('#auditTaskListPage-dateRange').mobiscroll().range({
		theme: 'red',
	    lang: 'zh',
	    display: 'bottom',        
	    min: minDate,
	    max: maxDate
	});
	$('#auditTaskListPage-dateRange').mobiscroll('setVal', [minDate, maxDate],true);
	
	var fromPage = session.get("fromPage");
	if(fromPage != "audit_list_page" ){
		
		//初始化分页 
		currentPage = 1;
		hasData = true;
		var $auditTaskListPage_auditTaskList = $('#auditTaskListPage_auditTaskList');
		$auditTaskListPage_auditTaskList.empty();
		
		auditTaskList_queryAuditTaskList();
	}
	
});//end pageshow

function audit_task_list_load_content(){
	//下拉不刷新，则该方法置空
	if (hasData) {
		auditTaskList_queryAuditTaskList();
	}
}

/**
 * 查询盘库任务列表
 * @param startDate 任务开始日期
 * @param endDate 任务结束时间
 * @param taskStatus 任务状态
 * @param dealerName 经销商名称
 * @param auditor 对于盘库任务，是指盘库员姓名，对于抽查任务，是指抽查员姓名
 */
function auditTaskList_queryAuditTaskList(){
	
	//获取日期范围
	var dateRange = $('#auditTaskListPage-dateRange').mobiscroll('getVal');
	var startDate;
	var endDate;
	if(dateRange){
		if(dateRange[0] != null && dateRange[1] != null){
			startDate = Format(dateRange[0],"yyyy-MM-dd");
			endDate = Format(dateRange[1],"yyyy-MM-dd");
		}
	}
	//获取任务状态
	var taskStatus = $("#audit_task_list_page").find("input.segmentedButtons5Selected").val();
	
	//获取经销商名称
	var dealerName = $("#auditTaskListPage-dealerName").val();
	//获取人员姓名(盘点员)
	var auditor = $("#auditTaskListPage-auditorName").val();
	
	var postData ={};
	postData.random = new Date();
	setScroll(postData);//设置分页开始结束位置
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	
	postData.startDate = startDate;
	postData.endDate = endDate;

	if(taskStatus === "全部"){
		
	}
	else if(taskStatus === "未办"){
		postData.taskStatus = 0;
	}
	else if(taskStatus === "已办"){
		postData.taskStatus = 1;
	}
	else if(taskStatus === "跳过"){
		postData.taskStatus = 2;
	}
	else if(taskStatus === "进行中"){
		postData.taskStatus = 3;
	}
	
	postData.dealerName = dealerName;
	postData.auditor = auditor;
	
//	$('#auditTaskListPage_auditTaskList').empty();
	//查询盘库任务列表
	$.ajax({
		url: basePath+"/app/auditTaskList/queryAuditTaskList.xhtml"+callback, //这个地址做了跨域处理
		data: postData,
		type: 'GET',
		dataType: 'json',
		async:false,
		beforeSend: function () {
			showLoading();
			queryAuditTaskListSkipReasonAndCheckAuditors();
		},
		success: function (msg) {
			showHide();
			if($.trim(msg.returnCode) == '0') {

				var data = msg.data;
				
			    if(data.length>0){
			    	auditTaskList_bindDataToPage(data);
			    	//判断该列表是否已无数据
		          	if (!hasPage(data.length)) {
		          		hasData = false;
		          		//无数据时结束分页滚动
		          		endScroll(audit_task_list_myScroll);
		          	}
			    } 
			    else {
				    	
				    	hasData = false;
			          	//无数据时结束分页滚动
			      		endScroll(audit_task_list_myScroll);
				    }
			
			}
			else{
				errorHandler(msg.returnCode,msg.message);
			}
		},
		complete: function() {

		}
	});//end $.ajax
}

/**
 * 初始化跳过理由列表及抽查人员列表
 */
function queryAuditTaskListSkipReasonAndCheckAuditors(){
	//页面初始化数据加载：加载跳过理由列表，抽查员列表
	$.getJSON(basePath+"/app/auditTaskList/pageInit.xhtml",function(msg){
		
		if($.trim(msg.returnCode) == '0') {
//			showHide();
			if(msg.data){
				
				var data = msg.data;
				
				//获取跳过理由
				$("#auditTaskList-dealerAuditPlanSkipReason").empty();
				$.each(data.skipReasonList, function(i, p) {  
					$("#auditTaskList-dealerAuditPlanSkipReason").append("<option value='"+p.code+"'>"+p.name+"</option>");                         
				});
				//获取抽查员列表
				$("#auditTaskList-checkAuditorList").empty();
				$.each(data.checkAuditors, function(i, p) {  
					$("#auditTaskList-checkAuditorList").append("<option value='"+p.id+"'>"+p.name+"</option>");                         
				});
			}//end if(msg.data){
		}
		else{
			errorHandler(msg.returnCode,msg.message);
		}
		
	});
}

function auditTaskList_bindDataToPage(data){

	var $audit_task_list = $('#auditTaskListPage_auditTaskList');
//	$audit_task_list.empty();
//	var data = msg.data;
	//显示盘库任务列表
	var $templateInventoryTaskLi = $('#audit_task_list_page').find(".template-container [template-id='audit-task-list-inventory-li']");
	var $templateCheckTaskLi = $('#audit_task_list_page').find(".template-container [template-id='audit-task-list-check-li']");
	$.each(data,function(i,n){
//			var auditDateD = Format(auditDate,"yyyy-MM-dd");
//			var nowD = new Date();
//			var nowDFormat = Format(nowD,"yyyy-MM-dd")
			//taskType：1.经销商盘库  2.监管单位盘库 3.抽查
			if(n.taskType == 1 || n.taskType == 2){
				var $inventoryTaskLi = $templateInventoryTaskLi.clone(true);
				
				dataBindToElement($inventoryTaskLi,n);
				$inventoryTaskLi.find(".ListTit a").attr("class","RwPd");
				//用于返回该页面时计算选项的index
				$inventoryTaskLi.find("dd").attr("scrollCurrentPage",currentPage);
				$inventoryTaskLi.find("dd").attr("scrollCurrentElementNum",i);
				if(n.taskType == 1 || n.taskType == 2){
					$inventoryTaskLi.find("dd").bind("tap",function(event){
						if(n.taskType == 2){
							/**
							 * 监管单位的盘库任务 taskType == 2
							 */
//							showMessage("监管单位的盘库清单是线下维护！",2000);
							//taskStatus  任务状态(0.未办 1.已办 2.跳过 3.进行中 )
							if(n.taskStatus == 2){
								showMessage("跳过的盘点任务，不能查看盘点经销商列表页面！",2000);
							}else{
								
								session.set("auditPlanDayId",n.auditPlanDayId);
								session.set("auditTaskList_dealerCode",n.dealerCode);
								session.set("taskType",n.taskType);
								session.set("auditPlanDate",n.auditDate);
								session.set("planStatus",n.status);//状态(1.生成，2.提交，3.发布)
								session.set("taskStatus",n.taskStatus);//任务状态(0.未办 1.已办 2.跳过 3.进行中 )
								session.set("auditorId",n.auditorId);//盘点人员user_id
								
								session.set("page_keyword","任务列表");
								session.set("page_title","任务列表");
								session.set("page_from","audit_task_list_page");
								
								goto_page("audit_custodian_dealer_list_page");
							}
							
						}else{
							/**
							 * 经销商的盘库任务 taskType == 1
							 */
							//taskStatus  任务状态(0.未办 1.已办 2.跳过 3.进行中 )
							if(n.taskStatus == 2){
								showMessage("跳过的盘点任务，不能查看盘点清单！",2000);
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
				    			scrollMap.collection_record_list_page = JSON.stringify(scrollMapJSON);
				    			
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
								session.set("auditTaskList_dealerCode",n.dealerCode);
								session.set("dealerCustodian",n.dealerCustodian);
								session.set("taskType",n.taskType);
								session.set("auditPlanDate",n.auditDate);
								session.set("planStatus",n.status);//状态(1.生成，2.提交，3.发布)
								session.set("auditorId",n.auditorId);//盘点人员user_id
								
								session.set("relationAuditPlanDayId",""); //抽查任务对应盘点任务的盘点计划日ID
								session.set("checkAuditId","");//抽查任务对应盘点任务的盘点员ID(user_id)
								session.set("checkAuditDate","");//抽查任务对应盘点任务的盘点日期
								session.set("checkTaskStatus","");//抽查任务对应盘点任务的任务状态(0.未办 1.已办 2.跳过 3.进行中 )
								
						    	session.set("page_keyword","任务列表");
								session.set("page_title","任务列表");
								session.set("page_from","audit_task_list_page");
								
								goto_page("audit_list_page");
							}
						}

					});
				}
				
				$inventoryTaskLi.show();
				$('#auditTaskListPage_auditTaskList').append($inventoryTaskLi);
			}
			//taskType：1.经销商盘库  2.监管单位盘库 3.抽查
			else if(n.taskType == 3){
				/**
				 * 经销商的抽查任务 taskType == 3
				 */
				var $checkTaskLi = $templateCheckTaskLi.clone(true);
				
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
	    			scrollMap.collection_record_list_page = JSON.stringify(scrollMapJSON);
					
					session.set("auditPlanDayId",n.auditPlanDayId);//抽查任务的盘点计划日ID
					session.set("auditTaskList_dealerCode",n.dealerCode);
					session.set("taskType",n.taskType);
					session.set("auditPlanDate",n.auditDate);//抽查任务的抽查日期
					session.set("planStatus",n.status);//状态(1.生成，2.提交，3.发布)
					session.set("dealerCustodian",n.dealerCustodian);
					session.set("auditorId",n.auditorId);//抽查任务的盘点员ID(user_id)
					
					//relationAuditPlanDayId:抽查任务对应盘点任务的盘点计划日ID
					if(n.checkSameTaskId != null && n.checkSameTaskId != ""){
						//日表中经销商某天的抽查计划对应的盘库任务安排多人盘库
						session.set("relationAuditPlanDayId",n.checkSameTaskId);
						//useSameTaskIdFlag:是否使用sameTaskId或checkSameTaskId--0：未使用  1：使用sameTaskId 2：使用checkSameTaskId
						session.set("useSameTaskIdFlag",2);
					}else{
						//日表中经销商某天的抽查计划对应的盘库任务只安排一人盘库
						session.set("relationAuditPlanDayId",n.relationAuditPlanDayId);
						//useSameTaskIdFlag:是否使用sameTaskId或checkSameTaskId--0：未使用  1：使用sameTaskId 2：使用checkSameTaskId
						session.set("useSameTaskIdFlag",0);
					}
					session.set("checkAuditDate",n.checkAuditDate);//抽查任务对应盘点任务的盘点日期
					session.set("checkAuditId",n.checkAuditId);//抽查任务对应盘点任务的盘点员ID(user_id)
					session.set("checkTaskStatus",n.checkTaskStatus);//抽查任务对应盘点任务的任务状态(0.未办 1.已办 2.跳过 3.进行中 )
					
					session.set("page_keyword","任务列表");
					session.set("page_title","任务列表");
					session.set("page_from","audit_task_list_page");
					
					goto_page("audit_list_page");
				});
				
				$checkTaskLi.show();
				$('#auditTaskListPage_auditTaskList').append($checkTaskLi);
			}
		 
	});//end each
	
	$('#auditTaskListPage_auditTaskList').mobiscroll().listview({
        theme: 'red',
        display: '',
        sortable: true,
        iconSlide: true,
        /*swipe:'left',*/
        stages: [ {
            percent: -25,
            color: 'red',
            icon: 'remove',
            text: function (event, inst) {
            	if (event.target.getAttribute('data-id') != '2') {
            		//非抽查任务
            		return "跳过";
                }else{
                	//对于抽查任务
                	return "取消";
                	
                }
            },
            confirm: true,
            disabled: function (event, inst) {
            	
            	
//            	$(event.target).find(".mbsc-lv-ic-text").text("test");
            	//计划 状态(1.生成，2.提交，3.发布)
            	var status = $(event.target).find("[identity='status']").text();
            	//任务状态:0.未办 1.已办 2.跳过 3.进行中 
            	var taskStatus = $(event.target).find("[identity='taskStatus']").text();
            	//只有未办的抽查任务才可以取消抽查
            	if (event.target.getAttribute('data-id') != '2') {
            		//非抽查任务
            		if (taskStatus != 0) {
                		return true;
                	}
            		//1.已发布，左滑没有反应。
                	//2.未发布，左滑后，可以跳过盘点任务
	            	if(status == 3){
	            		return true;
	            	}
                }else{
                	//对于抽查任务
                	//只有未办的抽查任务才可以取消抽查,其他状态的抽查任务不能取消抽查
                	if (taskStatus != 0) {
                		return true;
                	}
                	//1.已发布，左滑没有反应。
                	//2.未发布，左滑后，可以取消抽查
	            	if(status == 3){
	            		return true;
	            	}
                }
            },
            action: function (event, inst) {
            	
            	//任务状态:0.未办 1.已办 2.跳过 3.进行中 
                var taskStatus = $(event.target).find("[identity='taskStatus']").text();
	        	if(taskStatus != 0){
	        		showMessage('任务已开始或结束，不允许取消','1500');
	        		return true;
	        	}
	        	
	        	var auditScheduleCheckType = event.target.getAttribute('template-id');
	        	
	        	//如果是取消抽查任务
	        	if(auditScheduleCheckType == "audit-task-list-check-li"){
	        		//取消抽查任务
	        		// 抽查任务对应的盘库任务的same_task_id是否存在
	        		var checkSameTaskId = $(event.target).find("span[identity='checkSameTaskId']").text();
	        		if(checkSameTaskId == null || checkSameTaskId == ""){
	        			//抽查任务对应的盘库任务仅设置了一个人盘库
	        			//获取抽查任务的Id
		        		var auditPlanDayId = $(event.target).find("span[identity='auditPlanDayId']").text();
		        		var auditPlanMonthId = $(event.target).find("span[identity='auditPlanMonthId']").text();
		        		var taskType = $(event.target).find("span[identity='taskType']").text();
		        		var auditDate = $(event.target).find("span[identity='auditDate']").text();
//		        		var dealerId = $(event.target).find("span[identity='dealerId']").text();
		        		var dealerCode = $(event.target).find("span[identity='dealerCode']").text();
		        		var dealerName = $(event.target).find("span[identity='dealerName']").text();
		        		
//		        		auditSchedule_deleteSchedule(auditPlanDayId,taskType,auditDate,dealerCode,dealerName);
		        		//取消经销商抽查任务校验
		        		var postData ={};
		        		postData.random = new Date();
		        		postData.auditPlanMonthId = auditPlanMonthId;
		        		postData.dealerCode = dealerCode;
		        		postData.taskType = taskType;
		        		postData.auditDate = auditDate;
		        		var dataMap = "";
		        		$.ajax({
		        			url: basePath+"/app/auditTaskList/checkDeleteDealerCheckInventoryRule.xhtml"+callback, //这个地址做了跨域处理
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
		        					var msgList = msg.data.msgList;
		        					if(msgList != null || msgList != ""){
		        						var messageText ="不符合抽查规则,是否继续取消该抽查任务";
		        		    	    	showConfirmMultiline(messageText,msgList, function(){
		        		    	    		auditTaskList_deleteSchedule(auditPlanDayId,taskType,auditDate,dealerCode,dealerName);
		        		    	    		
		        		    	    		inst.remove(event.target);
		        		    	    	});
		        					}else{
		        						auditTaskList_deleteSchedule(auditPlanDayId,taskType,auditDate,dealerCode,dealerName);
		        						
		        						inst.remove(event.target);
		        					}
		        				}
		        				else{
		        					errorHandler(msg.returnCode,msg.message);
		        				}
		        			},
		        			complete: function() {
		        				
		        			}
		        		});//end $.ajax
	        		}else{
	        			//抽查任务对应的盘库任务设置了多个人盘库
	        			var message = "该任务安排了多个盘点员，APP端不支持对该任务进行调整，请到WEB端对该任务进行调整。";
	                	showEditInfoConfirmLongPromptMsg("取消",message, function(){
	            			return true;
	            		});
	        		}
	        		
	        		
//	        		return false;
	        	}
	        	else{
	        		//跳过盘库 
	        		// 盘库任务的same_task_id是否存在
	        		var sameTaskId = $(event.target).find("span[identity='sameTaskId']").text();
	        		if(sameTaskId == null || sameTaskId == ""){
	        			//盘库任务仅设置了一个人盘库
	        			var formData = {};
		        		var planMonth =  session.get("planMonth");
		        		var year = planMonth.substring(0,4);
		        		var month = planMonth.substring(5,7);
		        		var yearMonth = year+'-'+month;//'2017-04'
		        		formData['userCode'] = session.get("userCode");
		        		formData['dealerAuditPlanDayId'] = $(event.target).find("span[identity='auditPlanDayId']").text();
		        		formData['auditYearMonth'] = yearMonth;
		        		formData['auditDate'] = $(event.target).find("span[identity='auditDate']").text();
		        		formData['auditName'] = $(event.target).find("span[identity='auditName']").text();
		        		formData['abbreviation'] = $(event.target).find("span[identity='dealerName']").text();
		        		formData['relation_audit_plan_day_id'] = $(event.target).find("span[identity='relationAuditPlanDayId']").text();;
		        		
		        		$("#auditTaskList-dealerAuditPlanSkipReason").mobiscroll().select({
		        	        theme: 'red',
		        	        lang: 'zh',
		        	        display: 'bottom',
		        	        minWidth: 200,
		        	        onInit: function (event, inst) {
//		        	        	if(auditResults == ""){
//		        	        		$carStatus.mobiscroll('setVal',"NONE",true);
//		        	        	}else{
//		        	        		$carStatus.mobiscroll('setVal',auditResults,true);
//		        	        	}
		        	        },
		        	        onSet:function(event,inst){
		        	        	
		        	        	formData['dealerAuditPlanSkipReason'] = event.valueText;
				        		if(taskStatus == 0){
				        			if(formData['dealerAuditPlanSkipReason'] == "" ){
				        				showMessage("跳过原因不能为空",2000);
//				        				return false;
				        			}else{
				        				$.getJSON(basePath+"/app/auditTaskList/skipDealerAudit.xhtml",formData,function(result){
				        					if($.trim(result.returnCode) == "0"){
				        						
				        						var $auditTaskListPage_auditTaskList = $('#auditTaskListPage_auditTaskList');
				        						$auditTaskListPage_auditTaskList.empty();
				        						
				        						auditTaskList_queryAuditTaskList();
		            	    					setTimeout(function(){
		            	    						showMessage(result.message,2000);
		            	    					}, 2000);
				        						
				        					}else{
				        						showMessage(result.message,2000);
				        					}
				        				});	
				        			}
				        		 }else{
				        			 showMessage("当前任务不允许跳过",2000);
//				        			  return false;
				        		 }
		        	        }
		        	    });
		        		
		        		$('#auditTaskList-dealerAuditPlanSkipReason').mobiscroll('show');
	        		}else{
	        			//盘库任务设置了多个人盘库
	        			var message = "该任务安排了多个盘点员，APP端不支持对该任务进行调整，请到WEB端对该任务进行调整。";
	                	showEditInfoConfirmLongPromptMsg("跳过",message, function(){
	            			return true;
	            		});
	        		}
	        	}
	        	return true;
            }
        },
        {
            percent: 25,
            color: 'blue',
            icon: 'remove',
            text: '修改日期',
            confirm: true,
            disabled: function (event, inst) {
            	//计划 状态(1.生成，2.提交，3.发布)
            	var status = $(event.target).find("[identity='status']").text();
            	//任务状态:0.未办 1.已办 2.跳过 3.进行中 
            	var taskStatus = $(event.target).find("[identity='taskStatus']").text();
            	//任务状态为未办时才可以修改日期
                if (taskStatus != 0) {
            		return true;
                }
            	//1.已发布，右滑没有反应。
            	//2.未发布，右滑后，可以修改盘点日期或抽查日期
                if (status == 3) {
            		return true;
                }
            },
            action: function (event, inst) {
//            	debugger;
//            	var auditScheduleCheckType = event.target.getAttribute('template-id');
    	    	var auditPlanDayId = $(event.target).find("span[identity='auditPlanDayId']").text();
    	    	var taskType = $(event.target).find("span[identity='taskType']").text();
    	    	var auditPlanMonthId = $(event.target).find("span[identity='auditPlanMonthId']").text();
//    	    	var dealerId = $(event.target).find("span[identity='dealerId']").text();
    	    	var dealerCode = $(event.target).find("span[identity='dealerCode']").text();
    	    	//盘点任务的盘点日期或抽查任务的抽查日期
    	    	var auditDate = $(event.target).find("span[identity='auditDate']").text();
    	    	//盘点任务的盘点员或抽查任务的抽查员
    	    	var auditName = $(event.target).find("span[identity='auditName']").text();
    	    	//抽查任务的盘点日期
    	    	var checkAuditDate = $(event.target).find("span[identity='checkAuditDate']").text();
    	    	//经销商名称全称
    	    	var dealerName = $(event.target).find("span[identity='dealerName']").text();
    	    	//经销商名称简称
    	    	var dealerAbbreviation = $(event.target).find("span[identity='dealerAbbreviation']").text();
    	    	//dealerCustodianCode:经销商表[audit_dealer]的监管单位代码
    	    	var dealerCustodianCode = $(event.target).find("span[identity='dealerCustodianCode']").text();
    	    	//监管单位
    	    	var dealerCustodian = $(event.target).find("span[identity='dealerCustodian']").text();
    	    	//监管经销商数量flag 0监管1个经销商  1监管多个经销商
    	    	var custodianDealerCountFlag = $(event.target).find("span[identity='custodianDealerCountFlag']").text();
    	    	
    	    	var nowAuditDate = new Date(auditDate),
    	    	max = new Date(nowAuditDate.getFullYear() + 100, nowAuditDate.getMonth(), nowAuditDate.getDate());
    	    	var defaultValue = new Date(nowAuditDate.getFullYear(), nowAuditDate.getMonth(), nowAuditDate.getDate());
//    	    	var invalidVal = [defaultValue];
    	    	
    	    	//sameTaskIdFlag:  0--盘库任务设置多个人  1：盘库任务设置了一个人或者抽查任务对应的盘库任务设置了一个人
    	    	var sameTaskIdFlag = 0;
    	    	//taskType：1.经销商盘库  2.监管单位盘库 3.抽查
    	    	if(taskType == 3){
    	    		// 抽查任务对应的盘库任务的same_task_id是否存在
            		var checkSameTaskId = $(event.target).find("span[identity='checkSameTaskId']").text();
            		if(checkSameTaskId == null || checkSameTaskId == ""){
            			sameTaskIdFlag = 1;
            		}
    	    	}else{
    	    		// 盘库任务的same_task_id是否存在
            		var sameTaskId = $(event.target).find("span[identity='sameTaskId']").text();
            		if(sameTaskId == null || sameTaskId == ""){
            			sameTaskIdFlag = 1;
            		}
    	    	}
    	    	//sameTaskIdFlag:  0--盘库任务设置多个人  1：盘库任务设置了一个人或者抽查任务对应的盘库任务设置了一个人
        		if(sameTaskIdFlag == 1){
//        	    	$(event.target).find("div.mbsc-lv-ic-move-left").mobiscroll().date({
        	    	$(event.target).find("input.auditTaskListModifyDate").mobiscroll().date({
                	        theme: 'red',
                	        lang:"zh",
                	        display: 'bottom',
                	        defaultValue: defaultValue,
//                	        invalid:invalidVal,
                	        max: max,
                	        onSet: function (event, inst) {
                	        	
    	            	    	var modifyDate = event.valueText;
    	            	    	//修改的日期只能是当月的日期
    	            	    	var nowDate = new Date(auditDate);
    	            	    	var nowYYYYMM = nowDate.getFullYear()+"/"
    	            	    		+((nowDate.getMonth() + 1) > 10 ? (nowDate.getMonth() + 1) : "0"+ (nowDate.getMonth() + 1));
    	            	    	if(nowYYYYMM != modifyDate.substring(0,7)){
    	            	    		showMessage("修改的日期只能是当月的日期",'1500');
    	            	    		return true;
    	            	    	}
    	            	    	
    	            	    	var nowYYYYMMDD = nowYYYYMM+"/"
                	    		+(nowDate.getDate() >= 10 ? nowDate.getDate() : "0"+ nowDate.getDate());
    	            	    	if(nowYYYYMMDD == modifyDate){
    	            	    		showMessage("日期没有变更",'1500');
    	            	    		return true;
    	            	    	}
    	            	    	
    	            	    	//判断是否是休息日，及是否符合盘库或抽查规则
    	            	    	auditTaskList_checkRule(auditPlanMonthId,dealerCode,auditDate,modifyDate,taskType,
    	            	    			checkAuditDate,dealerCustodianCode,auditPlanDayId,auditName,dealerName,
    	            	    			dealerAbbreviation);
    	            	    	
    	            	    	
    	            	    }
                	    });
                	
                	// With selector
//                	$(event.target).mobiscroll('show');
        	    	$(event.target).find("input.auditTaskListModifyDate").mobiscroll('show');
        		}else{
        			//盘库任务设置了多个人盘库  或者 抽查任务对应的盘库任务设置了多个人盘库
        			var message = "该任务安排了多个盘点员，APP端不支持对该任务进行调整，请到WEB端对该任务进行调整。";
                	showEditInfoConfirmLongPromptMsg("修改日期",message, function(){
            			return true;
            		});
        		}
//                inst.remove(event.target);
                return true;
            }
        },
        {

            percent: 50,
            color: 'red',
            icon: 'remove',
            text: function (event, inst) {
            	if (event.target.getAttribute('data-id') != '2') {
            		//非抽查任务
            		return "修改盘点员";
                }else{
                	//对于抽查任务
                	return "修改抽查员";
                	
                }
            },
            confirm: true,
            disabled: function (event, inst) {
            	//计划 状态(1.生成，2.提交，3.发布)
            	var status = $(event.target).find("[identity='status']").text();
            	//任务状态:0.未办 1.已办 2.跳过 3.进行中 
            	var taskStatus = $(event.target).find("[identity='taskStatus']").text();
            	//任务状态为未办时才可以修改日期
                if (taskStatus != 0) {
            		return true;
                }
            	//1.已发布，右滑没有反应。
            	//2.未发布，右滑后，可以修改盘点日期或抽查日期
                if (status == 3) {
            		return true;
                }
            },
            action: function (event, inst) {
            	//修改盘点员
//            	var dealerId = $(event.target).find("span[identity='dealerId']").text();
//            	var auditScheduleCheckType = event.target.getAttribute('template-id');
    	    	var auditPlanDayId = $(event.target).find("span[identity='auditPlanDayId']").text();
    	    	var taskType = $(event.target).find("span[identity='taskType']").text();
    	    	var auditPlanMonthId = $(event.target).find("span[identity='auditPlanMonthId']").text();
    	    	var dealerId = $(event.target).find("span[identity='dealerId']").text();
    	    	var dealerCode = $(event.target).find("span[identity='dealerCode']").text();
    	    	//盘点任务的盘点日期或抽查任务的抽查日期
    	    	var auditDate = $(event.target).find("span[identity='auditDate']").text();
    	    	//盘点任务的盘点员或抽查任务的抽查员
    	    	var auditName = $(event.target).find("span[identity='auditName']").text();
    	    	var auditorId = $(event.target).find("span[identity='auditorId']").text();
    	    	//抽查任务的盘点日期
    	    	var checkAuditDate = $(event.target).find("span[identity='checkAuditDate']").text();
    	    	//经销商名称全称
    	    	var dealerId = $(event.target).find("span[identity='dealerId']").text();
    	    	var dealerName = $(event.target).find("span[identity='dealerName']").text();
    	    	//经销商名称简称
    	    	var dealerAbbreviation = $(event.target).find("span[identity='dealerAbbreviation']").text();
    	    	//dealerCustodianCode:经销商表[audit_dealer]的监管单位代码
    	    	var dealerCustodianCode = $(event.target).find("span[identity='dealerCustodianCode']").text();
    	    	//监管单位
    	    	var dealerCustodian = $(event.target).find("span[identity='dealerCustodian']").text();
    	    	//监管经销商数量flag 0监管1个经销商  1监管多个经销商
    	    	var custodianDealerCountFlag = $(event.target).find("span[identity='custodianDealerCountFlag']").text();
    	    	var taskStatus = $(event.target).find("[identity='taskStatus']").text();
    	    	var relationAuditPlanDayId = $(event.target).find("[identity='relationAuditPlanDayId']").text();
    	    	var nowAuditDate = new Date(auditDate);
//    	    	max = new Date(nowAuditDate.getFullYear() + 100, nowAuditDate.getMonth(), nowAuditDate.getDate());
//    	    	var defaultValue = new Date(nowAuditDate.getFullYear(), nowAuditDate.getMonth(), nowAuditDate.getDate());
//    	    	var invalidVal = [defaultValue];
    	    	
            	// 加载并显示当前经销商盘点员列表 
    	    	if(taskType != "3"){
    	    		var sameTaskId = $(event.target).find("span[identity='sameTaskId']").text();
        	    	// 盘库任务的same_task_id是否存在
        	    	if(sameTaskId == null || sameTaskId ==""){
        	    		
        	    		$("#auditTaskList-auditorList").empty();
    	            	var postData ={};
    	            	postData.random = new Date();
    	            	postData.userCode = session.get("userCode");
    	            	postData.userId = session.get("userId");
    	            	postData.dealerId = dealerId;
    	        		$.getJSON(basePath+"/app/auditTaskList/getAuditorsByDealerId.xhtml", postData, function(result){
    	        			
    	        			if($.trim(result.returnCode) == "0"){
    	        				$.each(result.data, function(i, p) {  
    	        					$("#auditTaskList-auditorList").append("<option value='"+p.userId+"'>"+p.userName+"</option>");                         
    	        				});
    	        				
    	        				// 显示当前经销商盘点员列表
    			        		$("#auditTaskList-auditorList").mobiscroll().select({
    						        theme: 'red',
    						        lang: 'zh',
    						        display: 'bottom',
    						        minWidth: 200,
    						        onSet: function (event, inst) {
    						    		//修改盘点日对应盘点员
    						    		if (taskStatus == 0){
    						    			var checkData = {};
    						    			var planMonth =  session.get("planMonth");
    						        		var year = planMonth.substring(0,4);
    						        		var month = planMonth.substring(5,7);
    						        		var yearMonth = year+'-'+month;//'2017-04'
    						    			checkData['auditYearMonth'] = yearMonth;
    						    			checkData['auditPlanMonthId'] = auditPlanMonthId;
    						    			checkData['dealerCode'] = dealerCode;
    						    			checkData['auditDate'] = auditDate;
    						    			checkData['auditor'] = auditorId;
    						    			checkData['modifyAuditor'] = inst.getVal();
    						    			checkData['custodianCode'] = dealerCustodianCode;
    						    			var dealerAuditPlanPerson = inst.getVal();
    						    			var func = function(){
    						    				var formData = {};
    						    				formData.random = new Date();
    						    				formData.userCode = session.get("userCode");
    						    				formData.userId = session.get("userId");
    						    				var planMonth =  session.get("planMonth");
    							        		var year = planMonth.substring(0,4);
    							        		var month = planMonth.substring(5,7);
    							        		var yearMonth = year+'-'+month;//'2017-04'
    						    				formData['auditYearMonth'] = yearMonth;
    						    				formData['auditDay'] =auditDate.substring(8,10);
    						    				formData['auditDate'] = auditDate;
    						    				formData['audit_plan_month_id'] = auditPlanMonthId;
    						    				formData['dealerAuditPlanDayId'] = auditPlanDayId;
    						    				formData['relation_audit_plan_day_id'] = relationAuditPlanDayId;
    						    				formData['dealerId'] = dealerId;
    						    				formData['abbreviation'] = dealerAbbreviation;
    						    				formData['dealerAuditPlanPerson'] = dealerAuditPlanPerson;
    						    				formData['auditName'] = auditName;
    						    				formData['taskType'] = taskType;
    						    				$.getJSON(basePath+"/app/auditTaskList/modifyDealerAuditor.xhtml",formData,function(result){
    						    					 if($.trim(result.returnCode) == "0"){
    						    						 auditTaskList_queryAuditTaskList();
    				            	    					setTimeout(function(){
    				            	    						showMessage(result.message,2000);
    				            	    					}, 1500);
    						    						
//    						    						
    						    			         }else{
    						    			        	 showMessage(result.message,2000);
    						    			         }
    						    				 });
    						    			}
    						    			auditTaskList_checkInventoryRule4ModifyDealerAuditor(checkData, func);

    						    		 }else{
    						    			showMessage("当前任务不允许修改盘点员",2000);
    						    		  }
    						    	
    						        }
    						    });//end select
    			        		$('#auditTaskList-auditorList').mobiscroll('show');
    	        	        }
    	        			else{
    	        				showMessage(result.message,2000);
    	        			}
    	        			
    	        		});// end $.getJSON
        	    	}else{
        	    		//盘库任务设置了多个人盘库
	        			var message = "该任务安排了多个盘点员，APP端不支持对该任务进行调整，请到WEB端对该任务进行调整。";
	                	showEditInfoConfirmLongPromptMsg("修改盘点员",message, function(){
	            			return true;
	            		});
        	    	}
    	    	}
    	    	else{
    	    		// 修改抽查员 
    	    		// 抽查任务对应的盘库任务的same_task_id是否存在
	        		var checkSameTaskId = $(event.target).find("span[identity='checkSameTaskId']").text();
	        		if(checkSameTaskId == null || checkSameTaskId == ""){
	        			// 显示抽查员列表
		        		$("#auditTaskList-checkAuditorList").mobiscroll().select({
					        theme: 'red',
					        lang: 'zh',
					        display: 'bottom',
					        minWidth: 200,
					        onSet: function (event, inst) {
					    		//修改盘点日对应盘点员
					    		if (taskStatus == 0){
					    			var checkData = {};
					    			var planMonth =  session.get("planMonth");
					        		var year = planMonth.substring(0,4);
					        		var month = planMonth.substring(5,7);
					        		var yearMonth = year+'-'+month;//'2017-04'
					    			checkData['auditYearMonth'] = yearMonth;
					    			checkData['auditPlanMonthId'] = auditPlanMonthId;
					    			checkData['dealerCode'] = dealerCode;
					    			checkData['auditDate'] = auditDate;
					    			checkData['auditor'] = auditorId;
					    			checkData['modifyAuditor'] = inst.getVal();
					    			checkData['custodianCode'] = dealerCustodianCode;
					    			var dealerAuditPlanPerson = inst.getVal();
					    			var func = function(){
					    				var formData = {};
					    				formData.random = new Date();
					    				formData.userCode = session.get("userCode");
					    				formData.userId = session.get("userId");
					    				var planMonth =  session.get("planMonth");
						        		var year = planMonth.substring(0,4);
						        		var month = planMonth.substring(5,7);
						        		var yearMonth = year+'-'+month;//'2017-04'
					    				formData['auditYearMonth'] = yearMonth;
					    				formData['auditDay'] =auditDate.substring(8,10);
					    				formData['auditDate'] = auditDate;
					    				formData['audit_plan_month_id'] = auditPlanMonthId;
					    				formData['dealerAuditPlanDayId'] = auditPlanDayId;
					    				formData['relation_audit_plan_day_id'] = relationAuditPlanDayId;
					    				formData['dealerId'] = dealerId;
					    				formData['abbreviation'] = dealerAbbreviation;
					    				formData['dealerAuditPlanPerson'] = dealerAuditPlanPerson;
					    				formData['auditName'] = auditName;
					    				formData['taskType'] = taskType;
					    				$.getJSON(basePath+"/app/auditTaskList/modifyDealerCheckAuditor.xhtml",formData,function(result){
					    					 if($.trim(result.returnCode) == "0"){
					    						 auditTaskList_queryAuditTaskList();
			            	    					setTimeout(function(){
			            	    						showMessage(result.message,2000);
			            	    					}, 1500);
					    			         }else{
					    			        	 showMessage(result.message,2000);
					    			         }
					    				 });
					    			}
					    			auditTaskList_checkInventoryRule4ModifyDealerAuditor(checkData, func);

					    		 }else{
					    			showMessage("当前任务不允许修改抽查员",2000);
					    		  }
					    	
					        }
					    });//end select
		        		$('#auditTaskList-checkAuditorList').mobiscroll('show');
	        		}else{
	        			//抽查任务对应的盘库任务设置了多个人盘库
	        			var message = "该任务安排了多个盘点员，APP端不支持对该任务进行调整，请到WEB端对该任务进行调整。";
	                	showEditInfoConfirmLongPromptMsg("修改抽查员",message, function(){
	            			return true;
	            		});
	        		}
    	    		
    	    	}
            }
        }
        ],
        
        onItemRemove: function () {
        	showMessage('操作成功','1500');
        }
    });//end listview
	

}
function auditTaskList_deleteSchedule(auditPlanDayId,taskType,auditDate,dealerCode,dealerName){
	var postData ={};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	postData.auditPlanDayId = auditPlanDayId;
	postData.taskType = taskType;
	postData.auditDate = auditDate;
//	postData.dealerId = dealerId;
	postData.dealerCode = dealerCode;
	postData.dealerName = dealerName;
	//取消抽查
	$.ajax({
		url: basePath+"/app/auditTaskList/deleteSchedule.xhtml"+callback, //这个地址做了跨域处理
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
				var data = msg.data;
				
			}
			else{
				errorHandler(msg.returnCode,msg.message);
			}
		},
		complete: function() {

		}
	});//end $.ajax
}


//判断是否是休息日，及是否符合盘库或抽查规则
function auditTaskList_checkRule(auditPlanMonthId,dealerCode,auditDate,modifyDate,taskType,checkAuditDate,
		dealerCustodianCode,auditPlanDayId,auditName,dealerName,dealerAbbreviation){
	
	var postData ={};
	postData.random = new Date();
	postData.userId = session.get("userId");
	postData.auditPlanMonthId = auditPlanMonthId;
	postData.dealerCode = dealerCode;
	postData.auditDate = auditDate;
	postData.modifyDate = modifyDate;
	postData.taskType = taskType;
	postData.checkAuditDate = checkAuditDate;
	postData.dealerCustodianCode = dealerCustodianCode;
	
	//判断是否是休息日，及是否符合盘库或抽查规则
	$.ajax({
		url: basePath+"/app/auditTaskList/checkRule.xhtml"+callback, //这个地址做了跨域处理
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
				
				var dataMap = msg.data;
				
				if(dataMap.checkType == "checkHoliday"){
					//修改的日期不能是休息日
					var holidayMsgText = dataMap.holidayMsgText
					showMessage(holidayMsgText,'1500');
					return true;
					
				}else if(dataMap.checkType == "checkInventoryRule"){
					// 是否符合盘库或抽查规则
					var messageText="";
					var msgList = dataMap.msgList;
			    	if(msgList != null && msgList !=""){
			    		if(taskType == 1 || taskType == 2){
			    			messageText ="不符合盘库规则,是否继续修改盘库日期";
			    		}
			    		else if(taskType==3){
			    			messageText ="不符合抽查规则,是否继续修改抽查日期";
			    		}
			    		
			    	}else{
			    		
			    		if(taskType == 1 || taskType == 2){
			    			messageText ="盘库规则校验成功,是否继续修改盘库日期";
			    		}
			    		else if(taskType==3){
			    			messageText ="抽查规则校验成功,是否继续修改抽查日期";
			    		}
			    	}
			    	

			    	showConfirmMultiline(messageText,msgList, function(){
			    		var modifyTaskDatePostData ={};
			    		modifyTaskDatePostData.random = new Date();
			    		modifyTaskDatePostData.userCode = session.get("userCode");
			    		modifyTaskDatePostData.userId =  session.get("userId");
			    		modifyTaskDatePostData.auditPlanDayId = auditPlanDayId;
			    		modifyTaskDatePostData.auditDate = auditDate;
			    		modifyTaskDatePostData.modifyDate = modifyDate;
			    		modifyTaskDatePostData.auditName = auditName;
//			    		modifyTaskDatePostData.dealerId = dealerId;
			    		modifyTaskDatePostData.dealerCode = dealerCode;
			    		modifyTaskDatePostData.dealerName = dealerName;
			    		modifyTaskDatePostData.dealerAbbreviation = dealerAbbreviation;
			    		modifyTaskDatePostData.taskType = taskType;
			    		
			    		modifyTaskDatePostData.dealerCustodianCode = dealerCustodianCode;
			    		showLoading();
			    		
			    		//修改盘库或抽查日期
			    		$.getJSON(basePath+"/app/auditTaskList/modifyTaskDate.xhtml"+callback, modifyTaskDatePostData,function(msg){
			    			showHide();
			    			if($.trim(msg.returnCode) == '0'){
			    				
			    				//初始化分页 
					    		var $auditTaskListPage_auditTaskList = $('#auditTaskListPage_auditTaskList');
					    		$auditTaskListPage_auditTaskList.empty();
					    		
			    				auditTaskList_queryAuditTaskList();
			    				
		    					setTimeout(function(){
		    						showMessage(msg.message,'1500');
		    					}, 1500);
		    					
			    			}
			    			else{
			    				errorHandler(msg.returnCode,msg.message);
			    			}

			    		});//end $.getJSON
			    	});
			    	
				}
				
			}
			else{
				errorHandler(msg.returnCode,msg.message);
				return true;
			}
		},
		complete: function() {
			
		}
	});//end $.ajax
	
}

//function auditTaskList_checkHoliday(modifyDate){
//	var postData ={};
//	postData.random = new Date();
//	postData.modifyDate = modifyDate;
//	var countHoliday = "";
//	//获取需要标注红点的日期
//	$.ajax({
//		url: basePath+"/app/auditTaskList/checkHoliday.xhtml"+callback, //这个地址做了跨域处理
//		data: postData,
//		type: 'GET',
//		dataType: 'json',
//		async:false,
//		beforeSend: function () {
//			showLoading();
//		},
//		success: function (msg) {
//			showHide();
//			if($.trim(msg.returnCode) == '0') {
//				countHoliday = msg.data.countHoliday;
//			}
//			else{
//				errorHandler(msg.returnCode,msg.message);
//			}
//		},
//		complete: function() {
//			
//		}
//	});//end $.ajax
//	
//	return countHoliday;
//}

//修改任务日期时校验盘库规则
//function auditTaskList_checkInventoryRule(auditPlanMonthId,dealerCode,
//		auditDate,modifyDate,taskType,checkAuditDate,dealerCustodianCode){
//	var postData ={};
//	postData.random = new Date();
////	postData.userCode = session.get("userCode");
//	postData.userId = session.get("userId");
////	postData.auditPlanDayId = auditPlanDayId;
//	postData.auditPlanMonthId = auditPlanMonthId;
////	postData.dealerId = dealerId;
//	postData.dealerCode = dealerCode;
//	postData.auditDate = auditDate;
//	postData.modifyDate = modifyDate;
//	postData.taskType = taskType;
//	postData.checkAuditDate = checkAuditDate;
////	postData.dealerCustodian = dealerCustodian;
////	postData.custodianDealerCountFlag = custodianDealerCountFlag;
////	postData.dealerName = dealerName;
//	postData.dealerCustodianCode = dealerCustodianCode;
//	var dataMap = "";
//	//获取需要标注红点的日期
//	$.ajax({
//		url: basePath+"/app/auditTaskList/checkInventoryRule.xhtml"+callback, //这个地址做了跨域处理
//		data: postData,
//		type: 'GET',
//		dataType: 'json',
//		async:false,
//		beforeSend: function () {
//			showLoading();
//		},
//		success: function (msg) {
//			showHide();
//			if($.trim(msg.returnCode) == '0') {
//				dataMap = msg.data;
//			}
//			else{
//				errorHandler(msg.returnCode,msg.message);
//			}
//		},
//		complete: function() {
//			
//		}
//	});//end $.ajax
//	
//	return dataMap;
//}

//修改盘库员时校验盘库规则
function auditTaskList_checkInventoryRule4ModifyDealerAuditor(formData, func){
	$.getJSON(basePath+"/app/auditTaskList/checkDealerAuditInventoryRule.xhtml",formData,function(result){
		if($.trim(result.returnCode) == "0"){
			func();
		} else if ($.trim(result.returnCode) == "1") {
			var msg = result.message;
			
			showConfirmDialog(msg,{}, func);
       }else{
    	   showMessage(result.message,2000);
       }
	});
}


