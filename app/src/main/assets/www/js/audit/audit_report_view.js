var audit_report_view_page = $('#audit_report_view_page');

var audit_report_view_myScroll;

/******************************audit_report_view_page---begin**************************************/
audit_report_view_page.live('pageinit',function(e,ui){
	
	var wrapper = "audit_report_view_wrapper";
	var up = "audit_report_view_pullUp";
	var down = "audit_report_view_pullDown";
	audit_report_view_myScroll = createMyScroll(wrapper,up,down);
	
	//回退事件处理
	audit_report_view_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page();
	});
	
	//点击 全部/已盘/未盘/公里数抽查 按钮，检索满足条件的车辆信息显示到页面
	audit_report_view_page.find(".auditSegmentedButtonGroup input[type='button']").live("tap",function(event){
		event.stopPropagation();
		var audiSelectedBtn = $('#audit_report_view_page').find(".auditSegmentedButtonGroup .segmentedButtons4Selected");
		audiSelectedBtn.removeClass("segmentedButtons4Selected");
		audiSelectedBtn.addClass("segmentedButtons4Unselected");
		$(this).removeClass("segmentedButtons4Unselected");
		$(this).addClass("segmentedButtons4Selected");
		//查询盘点报告
		var queryConditonVal = $(this).val();
		var $vinNoText = $('#audit_report_view_page').find("#vinNoText_view");
		var $vinNoVal = $vinNoText.val();
		queryAuditReportView(queryConditonVal,$vinNoVal);
	});
	
//	//点击查询按钮，然后进行模糊查询
//	audit_report_view_page.find("#searchVinNo_view").live("tap",function(event){
//		event.stopPropagation();
//		//查询盘点报告
//		var $vinNoText = $('#audit_report_view_page').find("#vinNoText_view");
//		var $vinNoVal = $vinNoText.val();
//		var queryConditonVal = $('#audit_report_view_page').find(".auditSegmentedButtonGroup .segmentedButtons4Selected").val();
//		queryAuditReportView(queryConditonVal,$vinNoVal);
//	});
	
	//点击数字键盘
	audit_report_view_page.find(".auditReportViewNumericKeyboardNumber").live("tap",function(event){
		event.stopPropagation();
		//查询盘点报告
		var numericKeyboardVal = $(this).val();
		var $vinNoText = $('#audit_report_view_page').find("#vinNoText_view");
		var $vinNoVal = $vinNoText.val();
		$vinNoVal += numericKeyboardVal;
		$vinNoText.val($vinNoVal.substring(0,17));
		if($vinNoText.val().length >= 4){
			var queryConditonVal = $('#audit_report_view_page').find(".auditSegmentedButtonGroup .segmentedButtons4Selected").val();
			var queryVinNoVal = $vinNoText.val();
			queryAuditReportView(queryConditonVal,queryVinNoVal);
		}
	});
	
	//点击删除按钮，删除检索条件车架号文本框中的1个字符，然后进行模糊查询
	audit_report_view_page.find("#deleteVinNo_view").live("tap",function(event){
		event.stopPropagation();
		//查询盘点报告
		var $vinNoText = $('#audit_report_view_page').find("#vinNoText_view");
		var $vinNoVal = $vinNoText.val();
		$vinNoText.val($vinNoVal.substring(0,$vinNoVal.length-1));
		if($vinNoText.val().length >= 4){
			var queryConditonVal = $('#audit_report_view_page').find(".auditSegmentedButtonGroup .segmentedButtons4Selected").val();
			var queryVinNoVal = $vinNoText.val();
			queryAuditReportView(queryConditonVal,queryVinNoVal);
		}
		
	});
	
	//点击清除按钮，删除检索条件车架号文本框中的所有字符，然后进行模糊查询
	audit_report_view_page.find("#clearVinNo_view").live("tap",function(event){
		event.stopPropagation();
		//查询盘点报告
		var $vinNoText = $('#audit_report_view_page').find("#vinNoText_view");
		$vinNoText.val("");
//		var queryConditonVal = $('#audit_report_view_page').find(".auditSegmentedButtonGroup .segmentedButtons4Selected").val();
//		var queryVinNoVal = $vinNoText.val();
//		queryAuditReportView(queryConditonVal,queryVinNoVal);
	});
	
});//end pageinit


audit_report_view_page.live('pageshow',function(e, ui){

//	currentLoadActionName  = "audit_report_view_load_content";
	//查询提示消息列表
	load_audit_report_view_content();
	
});//end pageshow

//function audit_report_view_load_content(){
//	//下拉不刷新，则该方法置空
//}

//初始化盘点报告页面
function load_audit_report_view_content(){
	var page = $('#audit_report_view_page');
	var $auditReportList = page.find(".auditReportViewContentDiv .auditReportViewList");
	$auditReportList.empty();
	
	var auditReportStatisticsNumFont = $("#audit_report_view_page .auditReportStatisticsNum font");
	auditReportStatisticsNumFont.text("0");
	
	var $auditSegmentedButtonGroup = $('#audit_report_view_page').find(".auditSegmentedButtonGroup input");
	var $auditReportTotalBtn = $('#audit_report_view_page').find(".auditSegmentedButtonGroup #auditReportTotalBtn_view");
	$auditSegmentedButtonGroup.removeClass("segmentedButtons4Selected");
	$auditSegmentedButtonGroup.addClass("segmentedButtons4Unselected");
	$auditReportTotalBtn.removeClass("segmentedButtons4Unselected");
	$auditReportTotalBtn.addClass("segmentedButtons4Selected");
	
	var $vinNoText = $('#audit_report_view_page').find("#vinNoText_view");
	$vinNoText.val("");
	
	//taskType：1.经销商盘库  2.监管单位盘库 3.抽查
	var taskType = session.get("taskType");
	var auditCheckListId = session.get("auditCheckListId");//盘点清单ID
	var auditListDealerCode = session.get("auditListDealerCode");//经销商CODE
	var storehouseId = session.get("auditList_storehouseId");//经销商库房ID
	var auditPlanDateFlg = session.get("auditPlanDateFlg");//盘点日期flag--1:任务的计划日期等于系统日期  2：任务的计划日期小于系统日期  3：任务的计划日期大于系统日期
	
	var auditPlanDayId = session.get("auditPlanDayId");//盘点计划日ID或者抽查计划的盘点计划日ID
	var auditPlanDate = session.get("auditPlanDate");//盘点计划日期或者抽查计划的盘点计划日期
	var auditorId = session.get("auditorId");//抽查任务的抽查人员id或者盘点任务的盘点人员
	var auditListStatus = session.get("auditListStatus")//盘点清单状态 0.未办 1.已办(正常完成任务) 2.跳过 3.进行中 4.DAS端完成 5.完成（更多按钮选项完成）
	
	var	relationAuditPlanDayId = session.get("relationAuditPlanDayId");//抽查任务对应盘点任务的盘点计划日ID
	var	checkAuditDate = session.get("checkAuditDate");//抽查任务对应盘点任务的盘点日期
	var checkAuditId = session.get("checkAuditId");//抽查任务对应盘点任务的盘点员ID(user_id)
	var checkAuditListStatus = session.get("checkAuditListStatus");//抽查任务对应盘点任务的盘点清单状态 (0.未办 1.已办(正常完成任务) 2.跳过 3.进行中 4.DAS端完成 5.完成（更多按钮选项完成）)
	
	var reportAuditorId = session.get("reportAuditorId");//生成盘库报告的人员userId
	var checkReportAuditorId = session.get("checkReportAuditorId");//抽查任务生成盘库报告的人员userId
	
	showLoading();
	var postData = {};
    postData.random = Math.random();
    postData.dealerCode = auditListDealerCode;//经销商CODE
    postData.storehouseId = storehouseId;//经销商库房ID
    
    postData.auditCheckListId = auditCheckListId;//盘点清单ID
    postData.auditPlanDateFlg = auditPlanDateFlg;//盘点日期flag--1:任务的计划日期等于系统日期  2：任务的计划日期小于系统日期  3：任务的计划日期大于系统日期
   
    postData.auditPlanDayId = auditPlanDayId;//盘点计划日ID
    postData.auditPlanDate = auditPlanDate;//盘点计划日ID或者抽查计划的盘点计划日ID
    postData.auditorId = auditorId;//盘点任务的盘点人员或者抽查任务的抽查人员id
    postData.auditListStatus = auditListStatus;//盘点清单状态(同日抽查任务时auditListStatus为其对应的盘点任务的盘点清单状态)
    
    postData.taskType = taskType;
	postData.sameDateAuditTaskFlag = auditListPage_sameDateAuditTaskFlag;//抽查任务是否和其对应的盘点任务同一天--0：不在同一天  1：在同一天
	postData.relationAuditPlanDayId = relationAuditPlanDayId;//抽查任务对应盘点任务的盘点计划日ID
	postData.checkAuditDate = checkAuditDate;//抽查任务对应盘点任务的盘点日期
	postData.checkAuditId = checkAuditId;//抽查任务对应盘点任务的盘点员ID(user_id)
	postData.checkAuditListStatus = checkAuditListStatus;//同日抽查任务对应盘点任务的盘点清单状态 (0.未办 1.已办(正常完成任务) 2.跳过 3.进行中 4.DAS端完成 5.完成（更多按钮选项完成）)
	
	postData.reportAuditorId = reportAuditorId;//生成盘库报告的人员userId
	postData.checkReportAuditorId = checkReportAuditorId;//抽查任务生成盘库报告的人员userId
	
	$.getJSON(basePath+"/app/auditReportView/pageInit.xhtml"+callback, postData,function(msg){
		if($.trim(msg.returnCode) == '0'){
			var auditReportTotalNum = 0; //总台数
			var auditFinishNum = 0;   //已盘
			var auditUnfinishNum = 0;  //未盘
			var odomSelectiveNum = 0;  //抽查公里数
			var qcFinishNum = 0;  //合格证已盘数量
			
			var data = msg.data;
			
		    if(data.auditReportList !=null){
		    	//盘点报告初始化
		    	//加载盘点报告列表
		    	var auditReportList = data.auditReportList;
				var $template = $("#audit_report_view_page .list-row-template");
				$.each(auditReportList,function(i,n){
					var $item = $template.clone(true);
					
					var $auditReportViewPhotoBtn = $item.find("a.auditReportEditPhotoBtn");
					$auditReportViewPhotoBtn.bind("tap",function(event){
						event.stopPropagation();
						var auditCheckReportId = $(this).parents(".auditReportViewListItem").find("[identity='auditCheckReportId']").text();
						auditReportViewPhotoBtn(auditCheckReportId);
					});
					
					//车盘点状态--vehicleFinishStatus ：是否完成（0：未盘点  1.已盘点）
					if(n.vehicleFinishStatus == 1){
						auditFinishNum += 1;
						$item.find(".CauseDiv").css("color","red");
					}else{
						n.vehicleFinishStatus = 0;
						auditUnfinishNum += 1;
					}
					
//					合格证盘点状态--qcFinishStatus：是否完成（0：未盘点  1.已盘点）
					if(n.qcFinishStatus == 1){
						qcFinishNum += 1;
						$item.find(".CauseDiv").css("color","red");
					}else{
						n.qcFinishStatus = 0;
					}
					
					//odomSelectiveFlag:是否抽查公里数(0：不抽查  1.抽查)
					if(n.odomSelectiveFlag == 1){
						odomSelectiveNum += 1;
						$item.find(".CauseDiv").css("color","blue");
					}
					//keySelectiveFlag:是否抽查钥匙--0：不抽查  1.抽查
					if(n.keySelectiveFlag == 1){
						$item.find("a.KeyBtn").css("display","");
					}
					
					//加载销售日期
					if(n.auditResults=="OFFSE" || n.auditResults=="SOT" || n.auditResults=="SOLD"){
						$item.find("#auditReportView_soldDateDiv").css("display","");
					}else{
						$item.find("#auditReportView_soldDateDiv").css("display","none");
					}
					
					dataBindToElement($item,n);
					
					$item.removeClass("list-row-template");
					$item.css("display","");
//					$item.show();
					$auditReportList.append($item);
					
				});//end $.each
				
				auditReportTotalNum = auditReportList.length;
				//设置总台数、车已盘、车未盘、抽查公里数、合格证已盘 的车辆数量
				page.find("#auditReportTotalNum_view font").text(auditReportTotalNum);
				page.find("#auditFinishNum_view font").text(auditFinishNum);
				page.find("#auditUnfinishNum_view font").text(auditUnfinishNum);
				page.find("#odomSelectiveNum_view font").text(odomSelectiveNum);
				page.find("#qcFinishNum_view font").text(qcFinishNum);
				
				
            	showHide();
		    } else {
		    	showHide();
//            	showMessage('暂无数据','1500');	
		    }
    	}else{
	    	showHide();
	    	errorHandler(msg.returnCode,msg.message);
	    }
		
	});//end $.getJSON
}

//查询盘点报告
function queryAuditReportView(queryConditonVal,vinNoVal){
	var page = $('#audit_report_view_page');
	var $auditReportList = page.find(".auditReportViewContentDiv .auditReportViewList");
	$auditReportList.empty();
	
//	var auditReportStatisticsNumFont = $('#audit_report_view_page').find(".auditReportStatisticsNum font");
//	auditReportStatisticsNumFont.text("0");
	
	//taskType：1.经销商盘库  2.监管单位盘库 3.抽查
	var taskType = session.get("taskType");
	var auditCheckListId = session.get("auditCheckListId");//盘点清单ID
	
	var auditListDealerCode = session.get("auditListDealerCode");//经销商CODE
	var storehouseId = session.get("auditList_storehouseId");//经销商库房ID
	var auditPlanDateFlg = session.get("auditPlanDateFlg");//盘点日期flag--1:任务的计划日期等于系统日期  2：任务的计划日期小于系统日期  3：任务的计划日期大于系统日期
	
	var auditPlanDayId = session.get("auditPlanDayId");//盘点计划日ID或者抽查计划的盘点计划日ID
	var auditPlanDate = session.get("auditPlanDate");//盘点计划日期或者抽查计划的盘点计划日期
	var auditorId = session.get("auditorId");//抽查任务的抽查人员id或者盘点任务的盘点人员
	var auditListStatus = session.get("auditListStatus")//盘点清单状态 0.未办 1.已办(正常完成任务) 2.跳过 3.进行中 4.DAS端完成 5.完成（更多按钮选项完成）
	
	var	relationAuditPlanDayId = session.get("relationAuditPlanDayId");//抽查任务对应盘点任务的盘点计划日ID
	var	checkAuditDate = session.get("checkAuditDate");//抽查任务对应盘点任务的盘点日期
	var checkAuditId = session.get("checkAuditId");//抽查任务对应盘点任务的盘点员ID(user_id)
	var checkAuditListStatus = session.get("checkAuditListStatus");//同日抽查任务对应盘点任务的盘点清单状态 (0.未办 1.已办(正常完成任务) 2.跳过 3.进行中 4.DAS端完成 5.完成（更多按钮选项完成）)
	
	var reportAuditorId = session.get("reportAuditorId");//生成盘库报告的人员userId
	var checkReportAuditorId = session.get("checkReportAuditorId");//抽查任务生成盘库报告的人员userId

	showLoading();
	var postData = {};
    postData.random = Math.random();
    postData.auditCheckListId = auditCheckListId;
    if(queryConditonVal != "" && queryConditonVal != null){
    	if(queryConditonVal == "已盘"){
    		//vehicleFinishStatus ：是否完成（0：未盘点  1.已盘点）
    		postData.vehicleFinishStatus = "1";
    	}else if(queryConditonVal == "未盘"){
    		//vehicleFinishStatus ：是否完成（0：未盘点  1.已盘点）
    		postData.vehicleFinishStatus = "0";
    	}else if(queryConditonVal == "公里数抽查"){
    		//odomSelectiveFlag:是否抽查公里数(0：不抽查  1.抽查)
    		postData.odomSelectiveFlag = "1";
    	}
    }
    
    if(vinNoVal != "" && vinNoVal != null){
    	postData.vinNo = vinNoVal;
    }
	
    postData.dealerCode = auditListDealerCode;//经销商CODE
    postData.storehouseId = storehouseId;//经销商库房ID
    postData.auditPlanDateFlg = auditPlanDateFlg;//盘点日期flag--1:任务的计划日期等于系统日期  2：任务的计划日期小于系统日期  3：任务的计划日期大于系统日期
   
    postData.auditPlanDayId = auditPlanDayId;//盘点计划日ID
    postData.auditPlanDate = auditPlanDate;//盘点计划日ID或者抽查计划的盘点计划日ID
    postData.auditorId = auditorId;//盘点任务的盘点人员或者抽查任务的抽查人员id
    postData.auditListStatus = auditListStatus;//盘点清单状态
    
    postData.taskType = taskType;
	postData.sameDateAuditTaskFlag = auditListPage_sameDateAuditTaskFlag;//抽查任务是否和其对应的盘点任务同一天--0：不在同一天  1：在同一天
	postData.relationAuditPlanDayId = relationAuditPlanDayId;//抽查任务对应盘点任务的盘点计划日ID
	postData.checkAuditDate = checkAuditDate;//抽查任务对应盘点任务的盘点日期
	postData.checkAuditId = checkAuditId;//抽查任务对应盘点任务的盘点员ID(user_id)
	postData.checkAuditListStatus = checkAuditListStatus;//同日抽查任务对应盘点任务的盘点清单状态 (0.未办 1.已办(正常完成任务) 2.跳过 3.进行中 4.DAS端完成 5.完成（更多按钮选项完成）)
	
	postData.reportAuditorId = reportAuditorId;//生成盘库报告的人员userId
	postData.checkReportAuditorId = checkReportAuditorId;//抽查任务生成盘库报告的人员userId

	$.getJSON(basePath+"/app/auditReportView/queryAuditReportList.xhtml"+callback, postData,function(msg){
		if($.trim(msg.returnCode) == '0'){
			
		    var auditReportTotalNum = 0; //总台数
			var auditFinishNum = 0;   //车已盘
			var auditUnfinishNum = 0;  //车未盘
			var odomSelectiveNum = 0;  //抽查公里数
			var qcFinishNum = 0;  //合格证已盘数量
			
			var data = msg.data;
		    if(data.auditReportList !=null){
		    	
		    	//加载盘点报告列表
		    	var auditReportList = data.auditReportList;
				var $template = $("#audit_report_view_page .list-row-template");
				$.each(auditReportList,function(i,n){
					var $item = $template.clone(true);
					
					var $auditReportViewPhotoBtn = $item.find("a.auditReportEditPhotoBtn");
					$auditReportViewPhotoBtn.bind("tap",function(event){
						event.stopPropagation();
						var auditCheckReportId = $(this).parents(".auditReportViewListItem").find("[identity='auditCheckReportId']").text();
						auditReportViewPhotoBtn(auditCheckReportId);
					});
					
					
					//车盘点状态--vehicleFinishStatus ：是否完成（0：未盘点  1.已盘点）
					if(n.vehicleFinishStatus == 1){
						auditFinishNum += 1;
						$item.find(".CauseDiv").css("color","red");
					}else{
						n.vehicleFinishStatus = 0;
						auditUnfinishNum += 1;
					}
					
					//合格证盘点状态--qcFinishStatus：是否完成（0：未盘点  1.已盘点）
					if(n.qcFinishStatus == 1){
						qcFinishNum += 1;
//						$item.find(".CauseDiv").css("color","orange");
					}else{
						n.qcFinishStatus = 0;
					}
					
					//odomSelectiveFlag:是否抽查公里数(0：不抽查  1.抽查)
					if(n.odomSelectiveFlag == 1){
						odomSelectiveNum += 1;
						$item.find(".CauseDiv").css("color","blue");
					}
					//keySelectiveFlag:是否抽查钥匙--0：不抽查  1.抽查
					if(n.keySelectiveFlag == 1){
						$item.find("a.KeyBtn").css("display","");
					}
					
					//加载销售日期
					if(n.auditResults=="OFFSE" || n.auditResults=="SOT" || n.auditResults=="SOLD"){
						$item.find("#auditReportView_soldDateDiv").css("display","");
					}else{
						$item.find("#auditReportView_soldDateDiv").css("display","none");
					}
					
					dataBindToElement($item,n);
					$item.removeClass("list-row-template");
					$item.css("display","");
//					$item.show();
					$auditReportList.append($item);
					
				});//end $.each
				
            	showHide();
		    } else {
		    	showHide();
//            	showMessage('暂无数据','1500');	
		    }
		    
		    auditReportTotalNum = auditReportList.length;
			//设置总台数、已盘、未盘、抽查公里数的车辆数量
			page.find("#auditReportTotalNum_view font").text(auditReportTotalNum);
			page.find("#auditFinishNum_view font").text(auditFinishNum);
			page.find("#auditUnfinishNum_view font").text(auditUnfinishNum);
			page.find("#odomSelectiveNum_view font").text(odomSelectiveNum);
			page.find("#qcFinishNum_view font").text(qcFinishNum);
    	}else{
	    	showHide();
	    	errorHandler(msg.returnCode,msg.message);
	    }
		
	});//end $.getJSON
}

//点击图片链接处理
function auditReportViewPhotoBtn(auditCheckReportId){
	session.set("businessId",auditCheckReportId);
	goto_page("common_business_pictures_view_page");
}
