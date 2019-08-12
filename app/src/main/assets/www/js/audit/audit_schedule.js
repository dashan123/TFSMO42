var audit_schedule_page = $('#audit_schedule_page');

var audit_schedule_myScroll;

/******************************home_page---begin**************************************/
audit_schedule_page.live('pageinit',function(e,ui){
	
	var wrapper = "audit_schedule_wrapper";
	var up = "audit_schedule_pullUp";
	var down = "audit_schedule_pullDown";
	audit_schedule_myScroll = createMyScroll(wrapper,up,down);
	//回退事件处理
	audit_schedule_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page('workbench_page');
	});
	
	//返程按钮事件
	audit_schedule_page.find('[identity="return-back-home"]').live("tap",function(event){
		
		//查看当前按钮是否不可用
		if($(this).attr("enable") === "false" ){
//			console.log("不可用：");
			return;
		}
		else{
			$(this).attr("enable","false");//将按钮置为不可用。
			auditSchedule_returnHomeAction(this);
//			console.log("可用：");
		}
	});
	
	//日历
	$('#auditCalendar').mobiscroll().calendar({
		display: 'inline',
		layout: 'liquid',
		theme: 'red',
		lang: 'zh',
		markedDisplay: 'bottom',
		onMonthLoading: function (event, inst) {
	        var year = event.year,
	            month = event.month;
	    	var yearAndMonth = year.toString()+"-"+ (month+1<10?"0"+(month+1):month+1);
	    	//获取需要标注红点的日期
	    	auditSchedulePageInit(yearAndMonth,inst)
	    },
		onDayChange: function (event, inst) {
			auditSchedule_querySchedule(event.date);
	    }
	});
	
});//end pageinit


audit_schedule_page.live('pageshow',function(e, ui){

	currentLoadActionName  = "audit_schedule_load_content";
	
	var fromPage = session.get("fromPage");
	if(fromPage != "audit_list_page"){
		$('#auditCalendar').mobiscroll('setVal', new Date());
	}
	
	var auditCalendarInst = $('#auditCalendar').mobiscroll('getInst');
	var auditDate = $('#auditCalendar').mobiscroll('getVal');
	var yearAndMonth = Format(auditDate,"yyyy-MM");
	
	//刷新标注红点
	auditSchedulePageInit(yearAndMonth,auditCalendarInst);
	//跑马灯中显示提示信息
	queryModifyNotice();
	//进入时默认显示日程列表
	auditSchedule_querySchedule(auditDate);
	
	//返程按钮状态初始化
	auditSchedule_queryReturnHomeRecord();
	
});//end pageshow

function audit_schedule_load_content(){
	//下拉不刷新，则该方法置空
}

//获取需要标注红点的日期
function auditSchedulePageInit(yearAndMonth,inst){
	var postData ={};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	postData.yearAndMonth = yearAndMonth;
	//获取需要标注红点的日期
	$.ajax({
		url: basePath+"/app/auditSchedule/pageInit.xhtml"+callback, //这个地址做了跨域处理
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
				inst.settings.marked = [];
                for (var i = 0; i < data.length; i++) {
                    inst.settings.marked.push({
                        d: new Date(data[i].scheduleDay), // Make sure that a javascript date object is passed
                        color: 'rgb(163, 0, 38)'
                    });
                }
                inst.redraw();
			}
			else{
				errorHandler(msg.returnCode,msg.message);
			}
		},
		complete: function() {

		}
	});//end $.ajax
}

//查询跑马灯中提示信息
function queryModifyNotice(){
	var postData ={};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	$.ajax({
		url: basePath+"/app/auditSchedule/queryModifyNotice.xhtml"+callback, //这个地址做了跨域处理
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
				//显示日程列表
				var page = $('#audit_schedule_page');
				var $noticeInfo = page.find("marquee.notice-items");
				if(data != null && data.length > 0){
					var noticeHtml = '<h2 identity="noticeInfo" class="ListTit" style="margin-bottom:0;background:#ffaad5;color:black;white-space:nowrap;">'+data+'</h2>';
					$noticeInfo.html(noticeHtml);
					
					$noticeInfo.bind("tap",function(event){
						goto_page("audit_plan_modify_notice_page");
						event.stopPropagation();
					});
				} else {
					var noticeHtml = '<h2 identity="noticeInfo" class="ListTit" style="margin-bottom:0;background:#ffaad5;color:black;white-space:nowrap;">无提示信息</h2>';
					$noticeInfo.html(noticeHtml);
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
//查询日程
function auditSchedule_querySchedule(auditDate){
	var postData ={};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	postData.auditDate = Format(auditDate,"yyyy-MM-dd");
	
	$('#audit_schedule_page').find("#audit_schedule_list").empty();
	//查询日程列表
	$.ajax({
		url: basePath+"/app/auditSchedule/querySchedule.xhtml"+callback, //这个地址做了跨域处理
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
				var $audit_schedule_list = $('#audit_schedule_list');
				$audit_schedule_list.empty();
				var data = msg.data;
				//显示日程列表
				var $templateInventoryScheduleLi = $('#audit_schedule_page').find("[template-id='audit-schedule-inventory-li']");
				var $templateCheckScheduleLi = $('#audit_schedule_page').find("[template-id='audit-schedule-check-li']");
				$.each(data,function(i,n){
						var auditDateD = Format(auditDate,"yyyy-MM-dd");
						var nowD = new Date();
						var nowDFormat = Format(nowD,"yyyy-MM-dd")
						//taskType：1.经销商盘库  2.监管单位盘库 3.抽查
						if(n.taskType == 1 || n.taskType == 2){
							var $inventoryScheduleLi = $templateInventoryScheduleLi.clone(true);
							var $inventoryActionButton = $inventoryScheduleLi.find("a[buttonType='action-button']");
							$inventoryActionButton.attr("enable","true");//将按钮置为不可用
							//任务状态:0.未办 1.已办 2.跳过 3.进行中 
//							if(n.taskStatus == 0 && auditDateD == nowDFormat){
							if(auditDateD == nowDFormat){
								if(n.fieldStatus =="YJS"){
									$inventoryActionButton.hide();
								}
								else{
									$inventoryActionButton.bind("tap",function(event){
										//查看当前按钮是否不可用
										if($(this).attr("enable") === "false" ){
											console.log("不可用：");
											return;
										}
										else{
											$(this).attr("enable","false");//将按钮置为不可用。
											auditSchedule_runAuditTaskAction(this);
										}
										event.stopPropagation();
									});
									
									var inventoryImgSrc = n.fieldStatus=="WKS"?"images/tfsred/StaBtn1.png":"images/tfsred/EndIcon.png";
									$inventoryActionButton.find("img").removeAttr("src");
									$inventoryActionButton.find("img").attr("src",inventoryImgSrc);
								}
							}else{
								$inventoryActionButton.hide();
							}							
							
							dataBindToElement($inventoryScheduleLi,n);
							$inventoryScheduleLi.find(".ListTit a").attr("class","RwPd");
							
							$inventoryScheduleLi.find("dd").bind("tap",function(event){
								//taskType：1.经销商盘库  2.监管单位盘库 3.抽查
								if(n.taskType == 1){
									//任务状态(0.未办 1.已办 2.跳过 3.进行中 )
									if(n.taskStatus != 2){
										
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
										session.set("auditSchedule_dealerCode",n.dealerCode);
										session.set("dealerCustodian",n.dealerCustodian);
										session.set("taskType",n.taskType);
										session.set("auditPlanDate",n.auditDate);
										session.set("planStatus",n.status);//状态(1.生成，2.提交，3.发布)
										session.set("taskStatus",n.taskStatus);//任务状态(0.未办 1.已办 2.跳过 3.进行中 )
										session.set("auditorId",n.auditorId);//盘点人员user_id
										session.set("dealerName",n.dealerName);//经销商名称
										session.set("dealerAbbreviation",n.dealerAbbreviation);//经销商简称
										
										session.set("relationAuditPlanDayId",""); //抽查任务对应盘点任务的盘点计划日ID
										session.set("checkAuditId","");//抽查任务对应盘点任务的盘点员ID(user_id)
										session.set("checkAuditDate","");//抽查任务对应盘点任务的盘点日期
										session.set("checkTaskStatus","");//抽查任务对应盘点任务的任务状态(0.未办 1.已办 2.跳过 3.进行中 )
										
								    	session.set("page_keyword","我的日程");
										session.set("page_title","我的日程");
										session.set("page_from","audit_schedule_page");
										
										goto_page("audit_list_page");
									}else{
										showMessage('该任务为已跳过，不能进入盘点清单页面','2000');
									}
								}else{
//									showMessage('该任务为监管单位盘库，请在线下进行','2000');
//					        		return true;
									//任务状态(0.未办 1.已办 2.跳过 3.进行中 )
									if(n.taskStatus != 2){
										session.set("auditPlanDayId",n.auditPlanDayId);
										session.set("auditSchedule_dealerCode",n.dealerCode);
										session.set("taskType",n.taskType);
										session.set("auditPlanDate",n.auditDate);
										session.set("planStatus",n.status);//状态(1.生成，2.提交，3.发布)
										session.set("taskStatus",n.taskStatus);//任务状态(0.未办 1.已办 2.跳过 3.进行中 )
										session.set("auditorId",n.auditorId);//盘点人员user_id
										
										session.set("page_keyword","我的日程");
										session.set("page_title","我的日程");
										session.set("page_from","audit_schedule_page");
										
										goto_page("audit_custodian_dealer_list_page");
									}else{
										showMessage('该任务为已跳过，不能进入盘点经销商列表页面','2000');
									}
									
								}
							});
							
							
							$inventoryScheduleLi.show();
							$('#audit_schedule_list').append($inventoryScheduleLi);
						}
						//taskType：1.经销商盘库  2.监管单位盘库 3.抽查
						else if(n.taskType == 3){
							var $checkScheduleLi = $templateCheckScheduleLi.clone(true);
							var $checkActionButton = $checkScheduleLi.find("a[buttonType='action-button']");
							$checkActionButton.attr("enable","true");//将按钮置为不可用
							//任务状态:0.未办 1.已办 2.跳过 3.进行中 
//							if(n.taskStatus == 0 && auditDateD == nowDFormat){
							if(auditDateD == nowDFormat){
								if(n.fieldStatus =="YJS"){
									$checkActionButton.hide();
								}
								else{
									$checkActionButton.bind("tap",function(event){
										//查看当前按钮是否不可用
										if($(this).attr("enable") === "false" ){
											console.log("不可用：");
											return;
										}
										else{
											$(this).attr("enable","false");//将按钮置为不可用。
											auditSchedule_runAuditTaskAction(this);
										}
										
										event.stopPropagation();
									});
									
									var checkImgSrc = n.fieldStatus=="WKS"?"images/tfsred/StaBtn1.png":"images/tfsred/EndIcon.png";
									$checkActionButton.find("img").removeAttr("src");
									$checkActionButton.find("img").attr("src",checkImgSrc);
								}
							}else{
								$checkActionButton.hide();
							}
							
							dataBindToElement($checkScheduleLi,n);
							$checkScheduleLi.find(".ListTit a").attr("class","RwCc");
							
							$checkScheduleLi.find("dd").bind("tap",function(event){
								//checkTaskStatus--抽查任务对应盘点任务的任务状态(0.未办 1.已办 2.跳过 3.进行中 )
								if(n.taskStatus == 2){
									showMessage('该抽查任务已跳过，不能进入盘点清单页面','2000');
								}else if(n.checkTaskStatus == 2){
									showMessage('该抽查任务对应的盘点任务已跳过，不能进入盘点清单页面','3000');
								}else{
									session.set("auditPlanDayId",n.auditPlanDayId); //抽查任务的盘点计划日ID
									session.set("auditSchedule_dealerCode",n.dealerCode);
									session.set("taskType",n.taskType);
									session.set("auditPlanDate",n.auditDate);//抽查任务的抽查日期
									session.set("planStatus",n.status);//状态(1.生成，2.提交，3.发布)
									session.set("taskStatus",n.taskStatus);//任务状态(0.未办 1.已办 2.跳过 3.进行中 )
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
									session.set("checkAuditDate",n.checkAuditDate);//抽查任务对应盘点任务的盘点日期
									session.set("checkAuditId",n.checkAuditId);//抽查任务对应盘点任务的盘点员ID(user_id)
									session.set("checkTaskStatus",n.checkTaskStatus);//抽查任务对应盘点任务的任务状态(0.未办 1.已办 2.跳过 3.进行中 )
									session.set("dealerAbbreviation",n.dealerAbbreviation);//经销商简称
							    	session.set("page_keyword","我的日程");
									session.set("page_title","我的日程");
									session.set("page_from","audit_schedule_page");
									
									goto_page("audit_list_page");
								}
								
							});
							
							$checkScheduleLi.show();
							$('#audit_schedule_list').append($checkScheduleLi);
						}
					 
				});//end each
				
				$('#audit_schedule_list').mobiscroll().listview({
			        theme: 'red',
			        display: '',
			        sortable: true,
			        iconSlide: true,
			        /*swipe:'left',*/
			        stages: [ {
			            percent: -25,
			            color: 'red',
			            icon: 'remove',
			            text: '取消',
			            confirm: true,
			            disabled: function (event, inst) {
			            	//计划 状态(1.生成，2.提交，3.发布)
			            	var status = $(event.target).find("[identity='status']").text();
			            	//任务状态:0.未办 1.已办 2.跳过 3.进行中 
			            	var taskStatus = $(event.target).find("[identity='taskStatus']").text();
			            	//只有未办的抽查任务才可以取消抽查
			            	if (event.target.getAttribute('data-id') != '2') {
			            		//非抽查任务
		                		return true;
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
				        		showMessage('日程已开始或结束，不允许取消','1500');
				        		return true;
				        	}
				        	
				        	var auditScheduleCheckType = event.target.getAttribute('template-id');
				        	
				        	if(auditScheduleCheckType == "audit-schedule-check-li"){
				        		//取消抽查任务
				        		// 抽查任务对应的盘库任务的same_task_id是否存在
				        		var checkSameTaskId = $(event.target).find("span[identity='checkSameTaskId']").text();
				        		if(checkSameTaskId == null || checkSameTaskId == ""){
				        			//获取抽查任务的Id
					        		var auditPlanDayId = $(event.target).find("span[identity='auditPlanDayId']").text();
					        		var auditPlanMonthId = $(event.target).find("span[identity='auditPlanMonthId']").text();
					        		var taskType = $(event.target).find("span[identity='taskType']").text();
					        		var auditDate = $(event.target).find("span[identity='auditDate']").text();
//					        		var dealerId = $(event.target).find("span[identity='dealerId']").text();
					        		var dealerCode = $(event.target).find("span[identity='dealerCode']").text();
					        		var dealerName = $(event.target).find("span[identity='dealerName']").text();
					        		
//					        		auditSchedule_deleteSchedule(auditPlanDayId,taskType,auditDate,dealerCode,dealerName);
					        		//取消经销商抽查任务校验
					        		var postData ={};
					        		postData.random = new Date();
					        		postData.auditPlanMonthId = auditPlanMonthId;
					        		postData.dealerCode = dealerCode;
					        		postData.taskType = taskType;
					        		postData.auditDate = auditDate;
					        		var dataMap = "";
					        		$.ajax({
					        			url: basePath+"/app/auditSchedule/checkDeleteDealerCheckInventoryRule.xhtml"+callback, //这个地址做了跨域处理
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
					        		    	    		auditSchedule_deleteSchedule(auditPlanDayId,taskType,auditDate,dealerCode,dealerName);
					        		    	    		inst.remove(event.target);
					        		    	    	});
					        					}else{
					        						auditSchedule_deleteSchedule(auditPlanDayId,taskType,auditDate,dealerCode,dealerName);
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
//				        		return false;
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
			            	
			            	var userFlag = session.get("userFlag");//0:该人员属于本公司   1:该人员属于外包公司
			            	//如果 该人员属于外包公司,不能修改盘库日期
			            	if(userFlag == ConstDef.getConstant("USERFLAG_OUTSOURCE_COMPANY")){
			                	return true;
				             }
			            	
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
			            	
			            	var auditScheduleCheckType = event.target.getAttribute('template-id');
	            	    	var auditPlanDayId = $(event.target).find("span[identity='auditPlanDayId']").text();
	            	    	var taskType = $(event.target).find("span[identity='taskType']").text();
	            	    	var auditPlanMonthId = $(event.target).find("span[identity='auditPlanMonthId']").text();
//	            	    	var dealerId = $(event.target).find("span[identity='dealerId']").text();
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
//	            	    	var invalidVal = [defaultValue];
	            	    	
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
	            	    		
//		            	    	$(event.target).find("div.mbsc-lv-ic-move-left").mobiscroll().date({
		            	    	$(event.target).find("input.auditScheduleModifyDate").mobiscroll().date({
				            	        theme: 'red',
				            	        lang:"zh",
				            	        display: 'bottom',
				            	        defaultValue: defaultValue,
//				            	        invalid:invalidVal,
				            	        max: max,
				            	        onSet: function (event, inst) {
				            	        	
					            	    	var modifyDate = event.valueText;
					            	    	//修改的日期只能是当月的日期
					            	    	var nowDate = new Date(auditDate);
					            	    	var nowYYYYMM = nowDate.getFullYear()+"/"
					            	    		+((nowDate.getMonth() + 1) >= 10 ? (nowDate.getMonth() + 1) : "0"+ (nowDate.getMonth() + 1));
					            	    	if(nowYYYYMM != modifyDate.substring(0,7)){
					            	    		showMessage("修改的日期只能是当月的日期",'1500');
					            	    		return true;
					            	    	}
//					            	    	
					            	    	var nowYYYYMMDD = nowYYYYMM+"/"
				            	    		+(nowDate.getDate() >= 10 ? nowDate.getDate() : "0"+ nowDate.getDate());
					            	    	if(nowYYYYMMDD == modifyDate){
					            	    		showMessage("日期没有变更",'1500');
					            	    		return true;
					            	    	}
					            	    	
					            	    	//判断是否是休息日，及是否符合盘库或抽查规则
					            	    	auditSchedule_checkRule(auditPlanMonthId,dealerCode,auditDate,modifyDate,taskType,
					            	    			checkAuditDate,dealerCustodianCode,auditPlanDayId,auditName,dealerName,
					            	    			dealerAbbreviation);
					            	    }
				            	    });
				            	
				            	// With selector
		            	    	$(event.target).find("input.auditScheduleModifyDate").mobiscroll('show');
	            	    	}else{
	                			//盘库任务设置了多个人盘库  或者 抽查任务对应的盘库任务设置了多个人盘库
	                			var message = "该任务安排了多个盘点员，APP端不支持对该任务进行调整，请到WEB端对该任务进行调整。";
	                        	showEditInfoConfirmLongPromptMsg("修改日期",message, function(){
	                    			return true;
	                    		});
	                		}

//			                inst.remove(event.target);
			                return true;
			            }
			        }
			        ],
			        
			        onItemRemove: function () {
//			        	alert("删除成功");
			        	showMessage('删除成功','1500');
			        }
			    });//end listview
				
			}
			else{
				errorHandler(msg.returnCode,msg.message);
			}
		},
		complete: function() {

		}
	});//end $.ajax
}


function auditSchedule_runAuditTaskAction(actionButton){
//	var driveStatus = queryDriveStatus();
	
//	if(driveStatus == undefined){
//		showMessage('未获取到当前用户的实地状态，请确认服务器是否联通！', '1500');
//		return;
//	}
	
	var callBack = function(driveStatus){
		//获取当前所点击按钮所对应的实地状态 WKS,JXZ,YJS
		var fieldStatus = $(actionButton).find("span[identity='fieldStatus']").text();
		var auditPlanDayId = $(actionButton).find("span[identity='auditPlanDayId']").text();
		var dealerName = $(actionButton).parents(".ListRow").find("span[identity='dealerName']").text();//经销商名称全称
		//taskType：1.经销商盘库  2.监管单位盘库 3.抽查
		var taskType = $(actionButton).parents(".ListRow").find("span[identity='taskType']").text();
		
		if(fieldStatus =="WKS" && driveStatus==false){
			console.log("点击开始按钮,开始任务");
			auditSchedule_runAuditTaskAction01("start",auditPlanDayId,fieldStatus,driveStatus,"",actionButton,taskType);
			
		}
		else if(fieldStatus =="WKS" && driveStatus==true){
			console.log("无法开始任务，请确认是否有正在进行的任务");
			showMessage("无法开始任务，请确认是否有正在进行的任务",'1500');
			$(actionButton).attr("enable","true");//设置开始/结束 按钮可用
		}
		else if(fieldStatus =="JXZ" && driveStatus==true){
			console.log("点击结束按钮,结束任务");
			showMessage("点击结束按钮,结束任务",'1500');

			auditSchedule_runAuditTaskAction01("end",auditPlanDayId,fieldStatus,driveStatus,dealerName,actionButton,taskType);
		} 
		else if(fieldStatus =="JXZ" && driveStatus==false){
			console.log("ERROR");
			showMessage("ERROR",'1500');
			$(actionButton).attr("enable","true");//设置开始/结束 按钮可用
		}
	}
	
	queryDriveStatus(callBack);
}
function auditSchedule_runAuditTaskAction01(action,auditPlanDayId,fieldStatus,driveStatus,dealerName,actionButton,taskType){
	var postData ={};
	postData.random = new Date();
	var userInfo = JSON.parse(session.get("userInfo"));
	postData.onlineStatus = userInfo.user.onlineStatus;
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	//手机端当前时间
	var currentDatetime = new Date().Format("YYYY/MM/DD HH/mm/ss");
	postData.currentDatetime = currentDatetime;
	
	postData.auditPlanDayId = auditPlanDayId;
	postData.action = action;
	postData.fieldStatus = fieldStatus;
	postData.drivingStatus = driveStatus;
	postData.dealerName = dealerName;//经销商名称全称
	postData.taskType = taskType;//taskType：1.经销商盘库  2.监管单位盘库 3.抽查
	showLoading();
	//执行任务
	$.getJSON(basePath+"/app/auditSchedule/runAuditTaskAction.xhtml"+callback, postData,function(msg){
		showHide();
		if($.trim(msg.returnCode) == '0'){
			if(msg.data){
				var data = msg.data;
				if(data.action == "unknown"){
					showMessage(msg.message,'1500');
				}
				else if(data.action == "start" && data.result == "success"){
					//成功开始盘库或抽查任务
					showMessage(msg.message,'1500');
					
					//刷新日程列表
					var auditDate = $('#auditCalendar').mobiscroll('getVal');
					auditSchedule_querySchedule(auditDate);
				}
				else if(data.action == "end" && data.result == "success"){
					showMessage(msg.message,'1500');
					
					//刷新日程列表
					var auditDate = $('#auditCalendar').mobiscroll('getVal');
					auditSchedule_querySchedule(auditDate);
					
					//计算里程数
					var returnData = msg.data.dataMap;
					if(returnData !=null){

						var travelId = returnData.travelRecord.id;
						//获取所有的点
						var lineArr = returnData.locationArray;
						common_calculateDistance(travelId,lineArr);
					}
				}
			}
//			console.log(msg.message);
			
		}
		else{
			errorHandler(msg.returnCode,msg.message);
//			console.log(msg.message);
		}

		$(actionButton).attr("enable","true");//设置开始/结束 按钮可用
	});//end $.getJSON
}

function auditSchedule_queryReturnHomeRecord(){
	
	var postData ={};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	showLoading();
	
	$.getJSON(basePath+"/app/auditSchedule/queryReturnHomeRecord.xhtml"+callback, postData,function(msg){
		showHide();
		if($.trim(msg.returnCode) == '0'){
			if(msg.data){
				var data = msg.data;
				//初始化返回驻地状态显示
				var returningHomeRecord = data.returningHomeRecord;
				var $buttonReturnHome = $("#audit_schedule_page").find('[identity="return-back-home"]');
				$buttonReturnHome.attr("enable","true");//将按钮置为可用。
				//如果已开始返程
				if(returningHomeRecord){
					$buttonReturnHome.children("[identity='actionText']").text("结束");
					$buttonReturnHome.find("img").attr("src","images/tfsred/EndIcon1.png");
					$buttonReturnHome.find("[identity='id']").text(returningHomeRecord.id);
					$buttonReturnHome.find("[identity='fieldStatus']").text("JXZ");
				}
				else{
					$buttonReturnHome.children("[identity='actionText']").text("开始");
					$buttonReturnHome.find("img").attr("src","images/tfsred/StaBtn.png");
					$buttonReturnHome.find("[identity='fieldStatus']").text("WKS");
				}
			}
//			console.log(msg.message);
		}
		else{
			errorHandler(msg.returnCode,msg.message);
//			console.log(msg.message);
		}

	});//end $.getJSON
	
}

function auditSchedule_returnHomeAction(actionButton){
//	var driveStatus = queryDriveStatus();
//	
//	if(driveStatus == undefined){
//		showMessage('未获取到当前用户的实地状态，请确认服务器是否联通！', '1500');
//		return;
//	}
	
	var callBack = function(driveStatus){
		//获取当前所点击返回驻地按钮所对应的实地状态 WKS,JXZ,YJS，返回驻地记录Id
		var fieldStatus = $(actionButton).find("span[identity='fieldStatus']").text();
		var id = $(actionButton).find("span[identity='id']").text();
		
		if(fieldStatus =="WKS" && driveStatus==false){
			console.log("点击开始按钮,开始返程");
			auditSchedule_returnHomeAction01("start",id,actionButton);
		}
		else if(fieldStatus =="WKS" && driveStatus==true){
			console.log("无法开始返程，请确认是否有正在进行的其它任务");
			showMessage("无法开始返程，请确认是否有正在进行的其它任务",'1500');
			$(actionButton).attr("enable","true");//设置开始/结束 按钮可用
		}
		else if(fieldStatus =="JXZ" && driveStatus==true){
			console.log("点击结束按钮,结束返程");
			auditSchedule_returnHomeAction01("end",id,actionButton);
		} 
		else if(fieldStatus =="JXZ" && driveStatus==false){
			console.log("ERROR");
			showMessage("ERROR",'1500');
			$(actionButton).attr("enable","true");//设置开始/结束 按钮可用
		}
	}
	
	queryDriveStatus(callBack);
}

function auditSchedule_returnHomeAction01(action,id,actionButton){
	showLoading();
	var postData ={};
	postData.random = new Date();
	var userInfo = JSON.parse(session.get("userInfo"));
	postData.onlineStatus = userInfo.user.onlineStatus;
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	//手机端当前时间
	var currentDatetime = new Date().Format("YYYY/MM/DD HH/mm/ss");
	postData.currentDatetime = currentDatetime;
	
	postData.action = action;
	postData.id = id;
	//开始或结束返程
	$.getJSON(basePath+"/app/auditSchedule/returnHomeAction.xhtml"+callback, postData,function(msg){
		showHide();
		if($.trim(msg.returnCode) == '0'){
			if(msg.data){
				var data = msg.data;
				if(data.action == "unknown"){
					showMessage(msg.message,'1500');
				}
				else if(data.action == "start" && data.result == "success"){
					//成功开始返程
					showMessage(msg.message,'1500');
					auditSchedule_queryReturnHomeRecord();
				}
				else if(data.action == "end" && data.result == "success"){
					showMessage(msg.message,'1500');
					auditSchedule_queryReturnHomeRecord();
					//计算里程数
					var returnData = msg.data.dataMap;
					if(returnData !=null){

						var travelId = returnData.travelRecord.id;
						//获取所有的点
						var lineArr = returnData.locationArray;
						common_calculateDistance(travelId,lineArr);
						
					}
				}
			}
//			console.log(msg.message);
			
		}
		else{
			errorHandler(msg.returnCode,msg.message);
//			console.log(msg.message);
		}
		
		$(actionButton).attr("enable","true");//将按钮置为可用。
	});//end $.getJSON
}

function auditSchedule_deleteSchedule(auditPlanDayId,taskType,auditDate,dealerCode,dealerName){
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
		url: basePath+"/app/auditSchedule/deleteSchedule.xhtml"+callback, //这个地址做了跨域处理
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
function auditSchedule_checkRule(auditPlanMonthId,dealerCode,auditDate,modifyDate,taskType,checkAuditDate,
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
		url: basePath+"/app/auditSchedule/checkRule.xhtml"+callback, //这个地址做了跨域处理
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
					
					var modifyTaskDateFun = function(){
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
			    		$.getJSON(basePath+"/app/auditSchedule/modifyTaskDate.xhtml"+callback, modifyTaskDatePostData,function(msg){
			    			showHide();
			    			if($.trim(msg.returnCode) == '0'){
//			    				if(msg.data){
//			    					var data = msg.data;
			    					var auditDate = $('#auditCalendar').mobiscroll('getVal');
			    					//刷新日程
			    					auditSchedule_querySchedule(auditDate)
			    					//刷新小红点
			    					var modifyAuditCalendarInst = $('#auditCalendar').mobiscroll('getInst');
			    					var auditDateNowDate = new Date(auditDate);
			            	    	var auditDateYYYYMMdd = auditDateNowDate.getFullYear()+"-"
			            	    		+((auditDateNowDate.getMonth() + 1) > 10 ? (auditDateNowDate.getMonth() + 1) : "0"+ (auditDateNowDate.getMonth() + 1));
			    					auditSchedulePageInit(auditDateYYYYMMdd,modifyAuditCalendarInst);
			    					
			    					setTimeout(function(){
			    						showMessage(msg.message,'1500');
			    					}, 1500);
			    					
//			    				}
			    			}
			    			else{
			    				errorHandler(msg.returnCode,msg.message);
			    			}

			    		});//end $.getJSON
					}
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
			    		
			    		showConfirmMultiline(messageText,msgList, function(){
			    			modifyTaskDateFun();
				    	});
			    	}
			    	else{
			    		
//			    		if(taskType == 1 || taskType == 2){
//			    			messageText ="盘库规则校验成功,是否继续修改盘库日期";
//			    		}
//			    		else if(taskType==3){
//			    			messageText ="抽查规则校验成功,是否继续修改抽查日期";
//			    		}
			    		
			    		modifyTaskDateFun();
			    	}
			    	
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

//function auditSchedule_checkHoliday(modifyDate){
//var postData ={};
//postData.random = new Date();
//postData.modifyDate = modifyDate;
//var countHoliday = "";
////获取需要标注红点的日期
//$.ajax({
//	url: basePath+"/app/auditSchedule/checkHoliday.xhtml"+callback, //这个地址做了跨域处理
//	data: postData,
//	type: 'GET',
//	dataType: 'json',
//	async:false,
//	beforeSend: function () {
//		showLoading();
//	},
//	success: function (msg) {
//		showHide();
//		if($.trim(msg.returnCode) == '0') {
//			countHoliday = msg.data.countHoliday;
//		}
//		else{
//			errorHandler(msg.returnCode,msg.message);
//		}
//	},
//	complete: function() {
//		
//	}
//});//end $.ajax
//
//return countHoliday;
//}

////修改任务日期时校验盘库规则
//function auditSchedule_checkInventoryRule(auditPlanMonthId,dealerCode,
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
//		url: basePath+"/app/auditSchedule/checkInventoryRule.xhtml"+callback, //这个地址做了跨域处理
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

//取消经销商抽查任务校验
/*function auditSchedule_checkDeleteDealerCheckInventoryRule(
		auditPlanMonthId,taskType,auditDate,dealerCode,dealerName){
	var postData ={};
	postData.random = new Date();
	postData.auditPlanMonthId = auditPlanMonthId;
	postData.dealerCode = dealerCode;
	postData.taskType = taskType;
	postData.auditDate = auditDate;
	var dataMap = "";
	//获取需要标注红点的日期
	$.ajax({
		url: basePath+"/app/auditSchedule/checkDeleteDealerCheckInventoryRule.xhtml"+callback, //这个地址做了跨域处理
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
					var messageText ="不符合抽查规则,是否继续修改抽查日期";
	    	    	showConfirmMultiline(messageText,msgList, function(){
	    	    		auditSchedule_deleteSchedule(auditPlanDayId,taskType,auditDate,dealerCode,dealerName);
	    	    	});
				}else{
					auditSchedule_deleteSchedule(auditPlanDayId,taskType,auditDate,dealerCode,dealerName);
				}
			}
			else{
				errorHandler(msg.returnCode,msg.message);
			}
		},
		complete: function() {
			
		}
	});//end $.ajax
}*/