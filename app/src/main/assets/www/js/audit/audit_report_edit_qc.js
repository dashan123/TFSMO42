var audit_report_edit_qc_page = $('#audit_report_edit_qc_page');

var audit_report_edit_qc_myScroll;

var qcAuditorAndStoreHouseDistanceInterval;

var auditCheckReportEditList_qc;   //盘点报告列表list--合格证盘点
var qcAuditResultDictionaryList_qc;//盘点报告合格证状态
/******************************audit_report_edit_qc_page---begin**************************************/
audit_report_edit_qc_page.live('pageinit',function(e,ui){
	
	var wrapper = "audit_report_edit_qc_wrapper";
	var up = "audit_report_edit_qc_pullUp";
	var down = "audit_report_edit_qc_pullDown";
	audit_report_edit_qc_myScroll = createMyScroll(wrapper,up,down);
	
	auditCheckReportEditList_qc = [];
	qcAuditResultDictionaryList_qc = [];
	
	//回退事件处理
	audit_report_edit_qc_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		//如果网络是连通的
		if(isNetworkConnected1()){
			showConfirmBackpage("请确认盘点数据是否已保存，否则数据会丢失", function(){
				auditCheckReportEditList_qc = [];
				qcAuditResultDictionaryList_qc = [];
				
				clearInterval(qcAuditorAndStoreHouseDistanceInterval);
				back_page();
			});
			
		}else{
			showMessage('目前离线，请恢复网络后再试！','2000');
		}
		
	});
	
//	//点击遮罩层事件处理
//	$("#auditEditQcLoadingDivMaskLayer,#auditEditQcLoadingDiv").live("tap",function(event){
//		event.stopPropagation();
//		//如果网络是连通的
//		if(isNetworkConnected1()){
//			//自动保存盘库数据
//			saveAuditReport_qc();
//			auditCheckReportEditList_qc = [];
//			qcAuditResultDictionaryList_qc = [];
//			//清除定时器
//			clearInterval(qcAuditorAndStoreHouseDistanceInterval);
//			back_page();
//		}else{
//			showMessage('目前离线，请恢复网络后再试！','2000');
//		}
//	});
		
	//保存按钮处理
	audit_report_edit_qc_page.find(".SaveBtn1").live("tap",function(event){
		event.stopPropagation();
		var message = "此操作仅保存到MOA系统，非上传到DAS系统；如果想上传到DAS系统,请点击【上传】按钮。";
		showSaveConfirmLongPromptMsg("点击【保存】按钮",message, function(){
			saveAuditReport_qc("SaveBtn");
		});
	});
	
	//提交按钮处理
	audit_report_edit_qc_page.find(".SaveBtn2").live("tap",function(event){
		event.stopPropagation();
		var message = "此操作会将数据上传至DAS系统，并生成盘库报告；如果只是将数据保存到MOA系统，点击【保存】按钮即可。是否继续上传操作？";
		showConfirmLongPromptMsg("点击【上传】按钮",message, function(){
			submitAuditReport_qc();
		});
	});
	
	//点击 全部/已盘/未盘/公里数抽查 按钮，检索满足条件的车辆信息显示到页面
	audit_report_edit_qc_page.find(".auditSegmentedButtonGroup input[type='button']").live("tap",function(event){
		event.stopPropagation();
		var audiSelectedBtn = $('#audit_report_edit_qc_page').find(".auditSegmentedButtonGroup .segmentedButtons4Selected");
		audiSelectedBtn.removeClass("segmentedButtons4Selected");
		audiSelectedBtn.addClass("segmentedButtons4Unselected");
		$(this).removeClass("segmentedButtons4Unselected");
		$(this).addClass("segmentedButtons4Selected");
		//查询盘点报告
		var queryConditonVal = $(this).val();
		queryAuditReportEdit_qc(queryConditonVal);
	});
	
	//点击数字键盘
	audit_report_edit_qc_page.find(".auditReportEditNumericKeyboardNumber").live("tap",function(event){
		//查询盘点报告
		var numericKeyboardVal = $(this).val();
		var $vinNoText = $('#audit_report_edit_qc_page').find(".vinNoTextQcDiv #vinNoText_qc");
		var vinNoText = $vinNoText.val();
		vinNoText += numericKeyboardVal;
		$vinNoText.val(vinNoText.substring(0,17));
		if($vinNoText.val().length >= 4){
			var queryConditonVal = $('#audit_report_edit_qc_page').find(".auditSegmentedButtonGroup .segmentedButtons4Selected").val();
			queryAuditReportEdit_qc(queryConditonVal);
		}
		
		event.stopPropagation();
	});
	
	//点击删除按钮，删除检索条件车架号文本框中的1个字符，然后进行模糊查询
	audit_report_edit_qc_page.find("#deleteVinNo_qc").live("tap",function(event){
		//查询盘点报告
		var $vinNoText = $('#audit_report_edit_qc_page').find(".vinNoTextQcDiv #vinNoText_qc");
		var vinNoText = $vinNoText.val();
		$vinNoText.val(vinNoText.substring(0,vinNoText.length-1));
		if($vinNoText.val().length >= 4){
			var queryConditonVal = $('#audit_report_edit_qc_page').find(".auditSegmentedButtonGroup .segmentedButtons4Selected").val();
			queryAuditReportEdit_qc(queryConditonVal);
		}
		event.stopPropagation();
	});
	
	//点击清除按钮，删除检索条件车架号文本框中的所有字符，然后进行模糊查询
	audit_report_edit_qc_page.find("#auditReportClearVinNoBtn_qc").live("tap",function(event){
		event.stopPropagation();
		//查询盘点报告
		var $vinNoText = $('#audit_report_edit_qc_page').find(".vinNoTextQcDiv #vinNoText_qc");
		$vinNoText.val("");
//		var queryConditonVal = $('#audit_report_edit_qc_page').find(".auditSegmentedButtonGroup .segmentedButtons4Selected").val();
//		queryAuditReportEdit_qc(queryConditonVal);
	});
	
	//点击报告拍照按钮
	audit_report_edit_qc_page.find(".bottoms4-red #auditReportEditQc_reportPhotos").live("tap",function(event){
		var auditCheckListId = session.get("auditCheckListId");
		var businessType = ConstDef.getConstant("BUSINESS_CATEGORY_AUDIT");
		var submitStatus = session.get("submitStatus");
		session.set("businessId",auditCheckListId);
		session.set("businessType",businessType);
		session.set("buttonType","AuditQCReportPhotos");
		session.set("functionFlag","3");
		if(submitStatus=="3" || submitStatus=="4"){
			goto_page("common_business_pictures_view_page");
		}else{
			goto_page("common_business_pictures_edit_page");
		}
	});
	
	//点击批量设置未盘合格证状态
	audit_report_edit_qc_page.find(".bottoms4-red #auditReportEditQc_setUnAuditQcStatus").live("tap",function(event){
//		$("#audit_report_edit_qc_page .List .auditReportEditListItem .ListTit input[type='checkbox']").attr("checked","checked");
		var batchSetId = $(this).attr("id");
		batchSetStatus_qc(batchSetId);
	});
	
	//点击批量设置合格证状态
	audit_report_edit_qc_page.find(".bottoms4-red li a.batchSet").live("tap",function(event){
		var batchSetId = $(this).attr("id");
		batchSetStatus_qc(batchSetId);
	});
	
	//点击显示隐藏数字键盘
	audit_report_edit_qc_page.find(".bottoms4-red li a.numericKeyboard").live("tap",function(event){
		$("#audit_report_edit_qc_page").find("div.auditReportEditNumericKeyboard").toggle();
	});

});//end pageinit


audit_report_edit_qc_page.live('pageshow',function(e, ui){

	currentLoadActionName  = "audit_report_edit_qc_load_content";
	
	var fromPage = session.get("fromPage");
	if(fromPage != "common_business_pictures_edit_page" 
		&& fromPage != "common_business_pictures_view_page"){
		//查询提示消息列表
		load_audit_report_edit_qc_content();
	}
	
});//end pageshow

function audit_report_edit_qc_load_content(){
	//下拉不刷新，则该方法置空
}

//初始化盘点报告页面
function load_audit_report_edit_qc_content(){
	var page = $('#audit_report_edit_qc_page');
	var $auditReportList = page.find(".auditReportEditContentDiv .auditReportEditList");
	$auditReportList.empty();
	
	var auditReportStatisticsNumFont = page.find(".auditReportStatisticsNum_qc font");
	auditReportStatisticsNumFont.text("0");
	
	var $auditSegmentedButtonGroup = page.find(".auditSegmentedButtonGroup input");
	$auditSegmentedButtonGroup.removeClass("segmentedButtons4Selected");
	$auditSegmentedButtonGroup.addClass("segmentedButtons4Unselected");
	
	var $auditReportTotalBtn = page.find(".auditSegmentedButtonGroup #auditReportTotalBtn_qc");
	$auditReportTotalBtn.removeClass("segmentedButtons4Unselected");
	$auditReportTotalBtn.addClass("segmentedButtons4Selected");
	
	var $vinNoText = page.find("#vinNoText_qc");
	$vinNoText.val("");
	
	//数字键盘默认显示
	page.find("div.auditReportEditNumericKeyboard").css("display","");
	
	showLoading();
	var postData = {};
    postData.random = Math.random();
    postData.auditCheckListId = session.get("auditCheckListId");
//    //taskType：1.经销商盘库  2.监管单位盘库 3.抽查
//	var taskType = session.get("taskType");
//    if(taskType == 3){
//    	postData.taskType = taskType;
//    	postData.relationAuditPlanDayId = session.get("relationAuditPlanDayId");//抽查任务对应盘点任务的盘点计划日ID
//	}
    
	$.getJSON(basePath+"/app/auditReportEditQc/pageInit.xhtml"+callback, postData,function(msg){
		if($.trim(msg.returnCode) == '0'){
			var auditReportTotalNum = 0; //总车辆台数
//			var auditFinishNum = 0;   //车已盘车辆数量
			var auditUnfinishNum = 0;  //车未盘车辆数量
			var odomSelectiveNum = 0;  //抽查公里数车辆数量
			var qcFinishNum = 0;  //合格证已盘车辆数量
			var qcUnFinishNum = 0;  //合格证未盘车辆数量
			
			var data = msg.data;
			
			auditCheckReportEditList_qc = data.auditReportList;//将初始化数据保存到全局变量数组中
			
		    if(data.auditReportList !=null){
		    	//盘点报告初始化
		    	//盘点报告合格证状态
		    	qcAuditResultDictionaryList_qc = data.qcAuditResultDictionaryList;
		    	
		    	//批量设置时，加载字典表中盘点报告合格证状态
		    	loadInitResultsBatchSet_qc(qcAuditResultDictionaryList_qc);
		    	
		    	//加载盘点报告列表
		    	var auditReportList = data.auditReportList;
//		    	var relationAuditReportList = data.relationAuditReportList;
		    	
				var $template = $("#audit_report_edit_qc_page .list-row-template");
				
				$.each(auditReportList,function(i,n){
					var $item = $template.clone(true);
					
					//checkbox
                    var $auditReportEditQcCheckBoxLabel = $item.find(".ListTit [identity='vinNo']");
                    $auditReportEditQcCheckBoxLabel.bind("tap", function() {
                        var checkObj = $item.find("[identity = 'checkbox_in_qc']");
                        if ($(checkObj).is(":checked")) {
                            $(checkObj).removeAttr("checked");
                        } else {
                            $(checkObj).attr("checked", "checked");
                        }
                    });
					
					var $auditReportEditPhotoBtn = $item.find(".ListTit a.auditReportEditPhotoBtn");
					$auditReportEditPhotoBtn.bind("tap",function(event){
						event.stopPropagation();
						session.set("functionFlag","4");
						//如果网络是连通的
						if(isNetworkConnected1()){
							var auditCheckReportId = $(this).parents(".auditReportEditListItem").find("[identity='auditCheckReportId']").text();
							auditReportEditPhotoBtn_qc(auditCheckReportId);
						}else{
							showMessage('目前离线，请恢复网络后再试！','2000');
						}
					});
					
					var $auditReportEditConfirmBtn = $item.find(".ListTit a.auditReportEditConfirmBtn");
					$auditReportEditConfirmBtn.bind("tap",function(event){
						event.stopPropagation();
						auditReportEditConfirm_qc(this,"ConfirmBtn");
					});
					
					/*var $auditReportEditOdometerInput = $item.find("input[name='auditReportEdit_qc_odometer']");
					$auditReportEditOdometerInput.keyup(function(){
						event.stopPropagation();
						auditReportEditConfirm_qc(this,"Odometer");
					});
					
					*/
					var $auditReportEditQcRemarkInput = $item.find("input[name='auditReportEdit_qc_remark']");
					$auditReportEditQcRemarkInput.keyup(function(){
						event.stopPropagation();
						auditReportEditConfirm_qc(this,"Remark");
					});
					
					//车盘点状态--vehicleFinishStatus ：是否完成（0：未盘点  1.已盘点）
					if(n.vehicleFinishStatus == 1){
//						auditFinishNum += 1;
//						$item.find(".CauseDiv").css("color","red");
					}else{
						n.vehicleFinishStatus = 0;
						auditUnfinishNum += 1;
					}
					
					//合格证盘点状态--qcFinishStatus：是否完成（0：未盘点  1.已盘点）
					if(n.qcFinishStatus == 1){
						qcFinishNum += 1;
//						$item.find(".CauseDiv").css("color","orange");
						$item.find(".CauseDiv").css("color","red");
					}else{
						n.qcFinishStatus = 0;
						qcUnFinishNum += 1;
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
					
					//对于GTMC渠道经销商，也要显示实际车架号
					if(n.make == "GTMC"){
						$item.find("#vinNoView").css("display","");
					}
					//加载字典表中盘点报告合格证状态
					loadInitQcAuditResult_qc($item,"auditReportEdit_qc_qcStatus",qcAuditResultDictionaryList_qc,
							n.qcAuditResult,"SingleSet");
					
					if(n.auditResults=="OFFSE" || n.auditResults=="SOT" || n.auditResults=="SOLD"){
						$item.find("#auditReportEdit_qc_soldDateDiv").css("display","");
					}else{
						$item.find("#auditReportEdit_qc_soldDateDiv").css("display","none");
					}
					
					dataBindToElement($item,n);
					
					$item.removeClass("list-row-template");
					$item.css("display","");
//					$item.show();
					$auditReportList.append($item);
					
				});//end $.each
				
				auditReportTotalNum = auditReportList.length;
				//设置总台数、合格证已盘、合格证未盘、抽查公里数、车已盘的车辆数量
				page.find("#auditReportTotalNum_qc font").text(auditReportTotalNum);
				page.find("#qcFinishNum_qc font").text(qcFinishNum);
				page.find("#qcUnfinishNum_qc font").text(qcUnFinishNum);
				page.find("#odomSelectiveNum_qc font").text(odomSelectiveNum);
//				page.find("#auditFinishNum_qc font").text(auditFinishNum);
//				page.find("#auditUnfinishNum_qc font").text(auditUnfinishNum);
				
            	showHide();
            	
            	//是否默认库房(Y--是默认库房  N-- 不是默认库房)
            	var defaultFlag = session.get("auditList_defaultFlag");
            	//是否测试模式 1:开启 0:关闭
            	if (session.get("testMode") != "1" && defaultFlag == "Y") {
            		//人员最后位置距库房的距离
                	auditorLastLocationAndStoreHouseDistance(userLastLocation,auditReportEditQcBackPage);
                	//循环查询盘库人员盘库时距离库房的距离限制的间隔时间（10000ms）
//                	var auditReportEditQc_intervalTime = ConstDef.getConstant("AUDIT_USER_STOREHOUSE_DISTANCE_INTERVAL");
                	var auditReportEditQc_intervalTime = session.get("auditStorehouseValidDistanceInterval");
                 	qcAuditorAndStoreHouseDistanceInterval = setInterval(function(){
                 		auditorLastLocationAndStoreHouseDistance(userLastLocation,auditReportEditQcBackPage);
                 	}, auditReportEditQc_intervalTime);
            	}
            	
		    } else {
		    	showHide();
//            	showMessage('暂无数据','1500');	
		    }
    	}else{
	    	showHide();
	    	errorHandler(msg.returnCode,msg.message);
	    }
		if(session.get("submitStatus")=='3'||session.get("submitStatus")=='4'){
			var message = "报告已经完成电子签章，如果修改了报告，请重新进行电子签章。";
			showConfirmsignature_report("提示",message, function(){
				session.set("submitStatus","0");
			});
		}
		
	});//end $.getJSON
}

//查询盘点报告
function queryAuditReportEdit_qc(queryConditonVal){
	var page = $('#audit_report_edit_qc_page');
	var $auditReportList = page.find(".auditReportEditContentDiv .auditReportEditList");
	$auditReportList.empty();
	
	var auditReportStatisticsNumFont = page.find(".auditReportStatisticsNum_qc font");
	auditReportStatisticsNumFont.text("0");
	
	showLoading();
	
	var $qcFinishStatus = "";
	var $odomSelectiveFlag = "";
    
    var auditReportTotalNum = 0; //总车辆台数
	var qcFinishNum = 0;  //合格证已盘车辆数量
	var qcUnFinishNum = 0;  //合格证未盘车辆数量
	var odomSelectiveNum = 0;  //抽查公里数车辆数量
//	var auditFinishNum = 0;   //车已盘车辆数量
	var auditUnfinishNum = 0;  //车未盘车辆数量
	
	//不能直接让filterAuditReportList=auditCheckReportEditList_qc，这样的话其中一个数组值改变，另一个也会变
//    var filterAuditReportList = auditCheckReportEditList_qc.auditReportList.slice(0);
    var filterAuditReportList = auditCheckReportEditList_qc.slice(0);
   
    //1.统计总台数、合格证已盘、合格证未盘、抽查公里数、车已盘、车未盘车辆数
    //2.将不符合查询条件的数据从filterAuditReportList数组中删除,数组元素对象数量会减少
    var flag = true;
    for(var i=0; i < filterAuditReportList.length; flag ? i++ : i){
    	var filterAuditReportObject = filterAuditReportList[i];
    	 
    	//1.统计总台数、合格证已盘、合格证未盘、抽查公里数、车已盘、车未盘车辆数
    	//车盘点状态--vehicleFinishStatus ：是否完成（0：未盘点  1.已盘点）
		if(filterAuditReportObject.vehicleFinishStatus == 1){
//			auditFinishNum += 1;
		}else{
			auditUnfinishNum += 1;
		}
		//合格证盘点状态--qcFinishStatus：是否完成（0：未盘点  1.已盘点）
		if(filterAuditReportObject.qcFinishStatus == 1){
			qcFinishNum += 1;
		}else{
			qcUnFinishNum += 1;
		}
    	//odomSelectiveFlag:是否抽查公里数(0：不抽查  1.抽查)
		if(filterAuditReportObject.odomSelectiveFlag == 1){
			odomSelectiveNum += 1;
		}
		
		//2.将不符合查询条件的数据从filterAuditReportList数组中删除
		var queryFlag = true;//查询条件查询flag--true:没有从数组删除数据 false:从数组删除数据
    	if(queryConditonVal != "" && queryConditonVal != null){
    		if(queryConditonVal == "已盘"){
        		//合格证盘点状态：qcFinishStatus --是否完成（0：未盘点  1.已盘点）
        		$qcFinishStatus = "1";
        	}else if(queryConditonVal == "未盘"){
        		//合格证盘点状态：qcFinishStatus -- 是否完成（0：未盘点  1.已盘点）
        		$qcFinishStatus = "0";
        	}else if(queryConditonVal == "公里数抽查"){
        		//抽查公里数状态：odomSelectiveFlag--是否抽查公里数(0：不抽查  1.抽查)
        		$odomSelectiveFlag = "1";
        	}
    		
    		if($qcFinishStatus != null && $qcFinishStatus != ''){
            	if(filterAuditReportObject.qcFinishStatus != $qcFinishStatus){
            		filterAuditReportList.splice(i,1);
            		queryFlag = false;
            	}else{
            		queryFlag = true;
            	}
            }
    		else if($odomSelectiveFlag != null && $odomSelectiveFlag != ''){
        		if(filterAuditReportObject.odomSelectiveFlag != $odomSelectiveFlag){
        			filterAuditReportList.splice(i,1);
        			queryFlag = false;
            	}else{
            		queryFlag = true;
            	}
        	}
    	}
    	
    	var vinNoFlag = true;//车架号查询flag--true:没有从数组删除数据 false:从数组删除数据
    	if(queryFlag != false){
    		 // 车架号
    	    var $vinNo = page.find("#vinNoText_qc").val();
        	if($vinNo != null && $vinNo != ''){
//        		if(filterAuditReportObject.vinNo.indexOf($vinNo) == -1){
//        			filterAuditReportList.splice(i,1);
//        			vinNoFlag = false;
//            	}else{
//            		vinNoFlag = true;
//            	}
        		var $vinNoLength = $vinNo.length;
        		var filterAuditReportVinNo = filterAuditReportObject.vinNo;
        		var filterAuditReportMatchNo = filterAuditReportObject.matchVinNo;
        		var filterVinNoLength = filterAuditReportVinNo.length;
        		if(filterAuditReportMatchNo != "" && filterAuditReportMatchNo != null && filterAuditReportMatchNo != undefined){
        			var filterMatchVinNoLength = filterAuditReportMatchNo.length;
        			if(filterVinNoLength >= $vinNoLength || filterMatchVinNoLength >= $vinNoLength){
            			var filterVinNoStr = filterAuditReportVinNo.substring(filterVinNoLength-$vinNoLength,filterVinNoLength);
            			var filterMatchNoStr = filterAuditReportMatchNo.substring(filterMatchVinNoLength-$vinNoLength,filterMatchVinNoLength);
                		if(filterVinNoStr != $vinNo && filterMatchNoStr != $vinNo){
                			//将不符合查询条件的数据从filterAuditReportList数组中删除
                			filterAuditReportList.splice(i,1);
                			vinNoFlag = false;
                		}else{
                			vinNoFlag = true;
                    	}
            		}else{
            			//将不符合查询条件的数据从filterAuditReportList数组中删除
            			filterAuditReportList.splice(i,1);
            			vinNoFlag = false;
            		}
        		}else{
        			if(filterVinNoLength >= $vinNoLength){
            			var filterVinNoStr = filterAuditReportVinNo.substring(filterVinNoLength-$vinNoLength,filterVinNoLength);
                		if(filterVinNoStr != $vinNo){
                			//将不符合查询条件的数据从filterAuditReportList数组中删除
                			filterAuditReportList.splice(i,1);
                			vinNoFlag = false;
                		}else{
                			vinNoFlag = true;
                    	}
            		}else{
            			//将不符合查询条件的数据从filterAuditReportList数组中删除
            			filterAuditReportList.splice(i,1);
            			vinNoFlag = false;
            		}
        		}
        		
        	}
    	}
    	
    	if(queryFlag == false || vinNoFlag == false){
    		flag = false;
    	}else{
    		flag = true;
    	}
    }
    
    //加载查询后的数据列表
	var auditReportList = filterAuditReportList;
    if(auditReportList !=null){
    	//盘点报告合格证状态
//    	qcAuditResultDictionaryList_qc = auditCheckReportEditList_qc.qcAuditResultDictionaryList;
    	
//    	//批量设置时，加载字典表中盘点报告合格证状态
//    	loadInitResultsBatchSet_qc(qcAuditResultDictionaryList_qc);
    	
    	//加载盘点报告列表
		var $template = $("#audit_report_edit_qc_page .list-row-template");
		$.each(auditReportList,function(i,n){
			var $item = $template.clone(true);
			
			var $auditReportEditQcCheckboxLabel = $item.find(".ListTit [identity='vinNo']");
            $auditReportEditQcCheckboxLabel.bind("tap", function() {
                var obj = $item.find(".ListTit [identity='checkbox_in_qc']");
                if ($(obj).is(":checked")) {
                $(obj).removeAttr("checked");
                } else {
                    $(obj).attr("checked", "checked");
                }
            });
			
            //对于GTMC渠道经销商，显示实际车架号
            if(n.make == "GTMC"){
				$item.find("#vinNoView").css("display","");
			}
            
			var $auditReportEditPhotoBtn = $item.find(".ListTit a.auditReportEditPhotoBtn");
			$auditReportEditPhotoBtn.bind("tap",function(event){
				event.stopPropagation();
				//如果网络是连通的
				if(isNetworkConnected1()){
					var auditCheckReportId = $(this).parents(".auditReportEditListItem").find("[identity='auditCheckReportId']").text();
					auditReportEditPhotoBtn_qc(auditCheckReportId);
				}else{
					showMessage('目前离线，请恢复网络后再试！','2000');
				}
			});
			
			var $auditReportEditConfirmBtn = $item.find(".ListTit a.auditReportEditConfirmBtn");
			$auditReportEditConfirmBtn.bind("tap",function(event){
				event.stopPropagation();
				auditReportEditConfirm_qc(this,"ConfirmBtn");
			});
			
			var $auditReportEditQcRemarkInput = $item.find("input[name='auditReportEdit_qc_remark']");
			$auditReportEditQcRemarkInput.keyup(function(){
				event.stopPropagation();
				auditReportEditConfirm_qc(this,"Remark");
			});
			//qcFinishStatus ：是否完成（0：未盘点  1.已盘点）
			if(n.qcFinishStatus == 1){
				$item.find(".CauseDiv").css("color","red");
			}
//					//odomSelectiveFlag:是否抽查公里数(0：不抽查  1.抽查)
			if(n.odomSelectiveFlag == 1){
				$item.find(".CauseDiv").css("color","blue");
			}
			//是否抽查钥匙 --0：不抽查  1.抽查
			if(n.keySelectiveFlag == 1){
				$item.find(".CauseDiv .KeyBtn").css("display","");
			}
			
			//加载字典表中盘点报告合格证状态
			loadInitQcAuditResult_qc($item,"auditReportEdit_qc_qcStatus",qcAuditResultDictionaryList_qc,
					n.qcAuditResult,"SingleSet");
			
			if(n.auditResults=="OFFSE" || n.auditResults=="SOT" || n.auditResults=="SOLD"){
				$item.find("#auditReportEdit_qc_soldDateDiv").css("display","");
			}else{
				$item.find("#auditReportEdit_qc_soldDateDiv").css("display","none");
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
    
//    auditReportTotalNum = auditCheckReportEditList_qc.auditReportList.length;
    auditReportTotalNum = auditCheckReportEditList_qc.length;
	//设置总台数、已盘、未盘、抽查公里数的车辆数量
	page.find("#auditReportTotalNum_qc font").text(auditReportTotalNum);
	page.find("#qcFinishNum_qc font").text(qcFinishNum);
	page.find("#qcUnfinishNum_qc font").text(qcUnFinishNum);
	page.find("#odomSelectiveNum_qc font").text(odomSelectiveNum);
//	page.find("#auditFinishNum_qc font").text(auditFinishNum);
//			page.find("#auditUnfinishNum_qc font").text(auditUnfinishNum);
}

//批量设置时，加载字典表中盘点报告合格证状态
function loadInitResultsBatchSet_qc(qcAuditResultDictionaryList_qc){
	var $auditReportEditQcBatchSet = $("#audit_report_edit_qc_page .auditReportEditQcBatchSet");
	loadInitQcAuditResult_qc($auditReportEditQcBatchSet,"auditReportEdit_qc_batchSetQcStatusSelect",
			qcAuditResultDictionaryList_qc,"","BatchSet");
}

//点击批量操作的链接（设置车状态、设置钥匙状态、设置合格证状态）时，在js中调用相应的批量操作选择项的单击事件
function batchSetStatus_qc(batchSetId){
	var $checkedInputItems = $("#audit_report_edit_qc_page .List .auditReportEditListItem .ListTit input[type='checkbox']:checked");
	//设置qc
	if(batchSetId == "auditReportEdit_qc_batchSetQcStatus"){
		if($checkedInputItems != null && $checkedInputItems.length > 0){
			var $batchSetQcStatus = $("#audit_report_edit_qc_page .auditReportEditQcBatchSet").find("input");
			$batchSetQcStatus.click();
		}else{
			showMessage("请至少选择一辆车！",'1500');
		}
	//设置未盘qc
	}else if(batchSetId == "auditReportEditQc_setUnAuditQcStatus"){
		var $batchSetQcStatus = $("#audit_report_edit_qc_page .auditReportEditQcBatchSet").find("input");
		$batchSetQcStatus.click();
		session.set("batch","no");
	}
	
}

//加载字典表中盘点报告合格证状态
function loadInitQcAuditResult_qc($item,qcStatusName,qcAuditResultDictionaryList_qc,qcAuditResult,setClassification){
	//经销商监管单位
//	var dealerCustodianCode = session.get("dealerCustodianCode");
	var dealerCustodian = session.get("dealerCustodian");
	//经销商Code
//	var dealerCode = session.get("dealerCode");
	var dealerCode = session.get("auditListDealerCode");
	//盘点报告合格证状态
	var $qcStatus =  $item.find("[name='"+qcStatusName+"']");
	$qcStatus.empty();
	$.each(qcAuditResultDictionaryList_qc,function(i,n){
		var templateItem = '<option value="'+n.code+'">'+n.name+'</option>';
		$qcStatus.append(templateItem);
	});
//	var qcAuditResultLength = qcAuditResultDictionaryList_qc.length;
	$qcStatus.mobiscroll().select({
		theme: 'red',
		lang: 'zh',
		display: 'bottom',
		minWidth: 200,
//		rows:qcAuditResultLength+1,
		onInit: function (event, inst) {
	        if(qcAuditResult == ""){
	        	if(dealerCustodian.indexOf("Yinyan") > -1){
//		        	$qcStatus.mobiscroll('setVal',"Yinyan",true);
		        	$qcStatus.mobiscroll('setVal',ConstDef.getConstant("AUDIT_REPORT_EDIT_YINYAN"),true);
		        	
		        }else if(dealerCustodian.indexOf("CAIB") > -1){
//		        	$qcStatus.mobiscroll('setVal',"CAIB",true);
		        	$qcStatus.mobiscroll('setVal',ConstDef.getConstant("AUDIT_REPORT_EDIT_CAIB"),true);
		        	
		        }else if(dealerCustodian.indexOf("ChangJiu") > -1){
//		        	$qcStatus.mobiscroll('setVal',"ChangJiu",true);
		        	$qcStatus.mobiscroll('setVal',ConstDef.getConstant("AUDIT_REPORT_EDIT_ChangJiu"),true);
		        	
		        }else if(dealerCode.indexOf("T") == 0 || dealerCode.indexOf("G") == 0 || dealerCode.indexOf("L") == 0){
//		        	$qcStatus.mobiscroll('setVal',"TFL",true);
		        	$qcStatus.mobiscroll('setVal',ConstDef.getConstant("AUDIT_REPORT_EDIT_TFL"),true);
		        	
		        }else{
//		        	$qcStatus.mobiscroll('setVal',"NONE",true);
		        	$qcStatus.mobiscroll('setVal',ConstDef.getConstant("AUDIT_REPORT_EDIT_NONE"),true);
		        }
	        	
	        }else{
	        	$qcStatus.mobiscroll('setVal',qcAuditResult,true);
	        }
	     },
	     onSet:function(event,inst){
	        if(setClassification == "BatchSet"){
	        	//批量设置合格证状态`
	        	var $checkedInputItems = $("#audit_report_edit_qc_page .auditReportEditListItem .ListTit input[type='checkbox']:checked");
	     		var qcStatusVal = $qcStatus.mobiscroll("getVal");
	     		
	     		if(session.get("batch")=='no'){
	     			var status = $("#auditReportEditQcStatusSpan_qc input[identity='qcFinishStatus']");
	     			$.each(status,function(i,inputitem){
	     				if($(this).text()=='0'){
	     					var $select = $(inputitem).parent().find("select[name='auditReportEdit_qc_qcStatus']");
	     					$select.mobiscroll('setVal',qcStatusVal,true);
	     					auditReportEditConfirm_qc($select,"QcStatus");
	     				}
	     			});
	     			session.remove("batch");
	     		}
	     		//批量设置时，设置所有选中的列表项的合格证状态
	     		var $select = $checkedInputItems.parents(".ListRow").find("dd div.auditReportEditSelectContent select[name='auditReportEdit_qc_qcStatus']");
	        	$select.mobiscroll('setVal',qcStatusVal,true);
	        	
	        	//批量设置合格证状态时，选中项合格证状态修改时，保存到js中的车辆盘点数据变量中
	        	$.each($checkedInputItems,function(i,inputitem){
	        		var $qcStatusSelectItem = $(inputitem).parents(".ListRow").find("dd div.auditReportEditSelectContent select[name='auditReportEdit_qc_qcStatus']");
	        		auditReportEditConfirm_qc($qcStatusSelectItem,"QcStatus");
	        	});//end $.each
	        	
	        	//所有选中checkbox，取消选中
        		$checkedInputItems.removeAttr("checked");
	        	
        	}else if(setClassification == "SingleSet"){
        		//单个设置合格证状态时，选中项合格证状态修改时，保存到js中的车辆盘点数据变量中
        		auditReportEditConfirm_qc(this,"QcStatus");
        	}
	     }
	});
}

//图片链接处理
function auditReportEditPhotoBtn_qc(auditCheckReportId){
	clearInterval(qcAuditorAndStoreHouseDistanceInterval);
	
	var businessType = ConstDef.getConstant("BUSINESS_CATEGORY_AUDIT");
	session.set("businessId",auditCheckReportId);
	session.set("businessType",businessType);
	session.set("buttonType","AuditQCPhotos");
	goto_page("common_business_pictures_edit_page");
}

//点击完成链接
function auditReportEditConfirm_qc(auditReportEditItem,callClassification){
	var page = $("#audit_report_edit_qc_page")
	
	var $auditReportEditListItem = $(auditReportEditItem).parents(".auditReportEditListItem");
	//数据列表序号number
	var number = $auditReportEditListItem.find("[identity='number']").text()
	//盘库报告ID
	var auditCheckReportId = $auditReportEditListItem.find("[identity='auditCheckReportId']").text()
	
	//获取合格证已盘、合格证未盘、抽查公里数的车辆数量
	var qcFinishNum = Number(page.find("#qcFinishNum_qc font").text());
	var qcUnfinishNum = Number(page.find("#qcUnfinishNum_qc font").text());
	var odomSelectiveNum = Number(page.find("#odomSelectiveNum_qc font").text());
	
	//原有合格证盘点状态--是否完成：0：未盘点  1.已盘点
	var oldQcFinishStatus = $auditReportEditListItem.find("[identity='qcFinishStatus']").text();
	//odomSelectiveFlag:是否抽查公里数(0：不抽查  1.抽查)--原有状态
	var oldOdomSelectiveFlag = $auditReportEditListItem.find("[identity='odomSelectiveFlag']").text();
	
	//合格证盘点是否完成--0：未盘点  1.已盘点
	var $qcFinishStatus = oldQcFinishStatus;
	
	//保存到页面js中保存的数组中
//	var saveAuditReportList = auditCheckReportEditList_qc.auditReportList;
	var saveAuditReportList = auditCheckReportEditList_qc;
	
	var saveAuditReportObject = saveAuditReportList[number-1];
	if(saveAuditReportObject.auditCheckReportId == auditCheckReportId){
		
		//callClassification:调用分类   -- ConfirmBtn：点击完成按钮  
		if(callClassification == "ConfirmBtn"){
			//是否完成--0：未盘点  1.已盘点
			$qcFinishStatus = 1;
			//是否完成--0：未盘点  1.已盘点---原有状态
			if(oldQcFinishStatus != "1"){
				qcFinishNum += 1;
				qcUnfinishNum -= 1
				$auditReportEditListItem.find("[identity='qcFinishStatus']").text("1");
			}
			
			//设置已盘、未盘、抽查公里数的车辆数量
			page.find("#qcFinishNum_qc font").text(qcFinishNum);
			page.find("#qcUnfinishNum_qc font").text(qcUnfinishNum);
			
			if(oldOdomSelectiveFlag != "1"){
				$auditReportEditListItem.find(".CauseDiv").css("color","red");
			}
			//合格证
			saveAuditReportObject.qcAuditResult = $auditReportEditListItem.find("[name='auditReportEdit_qc_qcStatus']").val();
			saveAuditReportObject.qcAuditResultName = $auditReportEditListItem.find("[name='auditReportEdit_qc_qcStatus'] option:selected").text();
			//合格证盘点状态--是否完成：0：未盘点  1.已盘点
			saveAuditReportObject.qcFinishStatus = $qcFinishStatus;
			//备注
			saveAuditReportObject.remark = $auditReportEditListItem.find("[name='auditReportEdit_qc_remark']").val();
			
			showMessage("该车辆合格证盘点完成",'2000');
			
			//TODO:清空车架号查询的车架号
			$('#audit_report_edit_qc_page').find("#vinNoText_qc").val('');
			
		}else if(callClassification == "QcStatus"){
			//合格证
			saveAuditReportObject.qcAuditResult = $auditReportEditListItem.find("[name='auditReportEdit_qc_qcStatus']").val();
			saveAuditReportObject.qcAuditResultName = $auditReportEditListItem.find("[name='auditReportEdit_qc_qcStatus'] option:selected").text();
		}else if(callClassification == "Remark"){
			//备注
			saveAuditReportObject.remark = $auditReportEditListItem.find("[name='auditReportEdit_qc_remark']").val();
		}
		
	}
}

//点击保存
function saveAuditReport_qc(flag){
	
//	var saveAuditReportList = auditCheckReportEditList_qc.auditReportList;
	var saveAuditReportList = auditCheckReportEditList_qc;
	var saveData = [];
	$.each(saveAuditReportList,function(i,saveAuditReportObject){
		var eachSaveData ={};
		//盘库报告ID
		eachSaveData.auditCheckReportId = saveAuditReportObject.auditCheckReportId;
		//合格证盘点状态--是否完成：0：未盘点  1.已盘点
		eachSaveData.qcFinishStatus = saveAuditReportObject.qcFinishStatus;
		//合格证
		eachSaveData.qcAuditResult = saveAuditReportObject.qcAuditResult;
		//备注
		eachSaveData.remark = saveAuditReportObject.remark;
		
		saveData.push(eachSaveData);
		
	});
	
	var postData = {};
    postData.random = Math.random();
    postData.userCode = session.get("userCode");
    postData.saveData = JSON.stringify(saveData);
    postData.useSameTaskIdFlag = session.get("useSameTaskIdFlag");
    postData.auditCheckListId = session.get("auditCheckListId");
    postData.dealerCode =  session.get("auditListDealerCode"); //经销商CODE
    postData.auditPlanDayId = session.get("auditPlanDayId");
    postData.flag = flag;
    
//	showLoading();
////	点击保存按钮
//	$.getJSON(basePath+"/app/auditReportEditQc/saveAuditReport.xhtml"+callback, postData,function(msg){
//		showHide();
//		if($.trim(msg.returnCode) == '0'){
//			showMessage(msg.message,'2000');
//		}
//		else{
//			errorHandler(msg.returnCode,msg.message);
//		}
//
//	});//end $.getJSON
	
	$.ajax({
		url: basePath+"/app/auditReportEditQc/saveAuditReport.xhtml",
		data: postData,
		type: 'POST',
		dataType: 'json',
		async:true,
		beforeSend: function () {
			showLoading();
		},
		success: function (msg) {
			showHide();
			if($.trim(msg.returnCode) == '0') {
//				showMessage(msg.message,'2000');
//				showMessage("已将数据成功保存到MOA系统",'3000');
				if(flag != "QcBackPage"){
					setTimeout(function(){
						showMessage("保存成功",'3000');
					},'500');
				}
			}
			else{
				errorHandler(msg.returnCode,msg.message);
			}
		},
		complete: function() {

		}
	});
}

//点击提交
function submitAuditReport_qc(){
//	var saveAuditReportList = auditCheckReportEditList_qc.auditReportList;
	var saveAuditReportList = auditCheckReportEditList_qc;
	var saveData = [];
	$.each(saveAuditReportList,function(i,saveAuditReportObject){
		var eachSaveData ={};
		//盘库报告ID
		eachSaveData.auditCheckReportId = saveAuditReportObject.auditCheckReportId;
		//合格证盘点状态--是否完成：0：未盘点  1.已盘点
		eachSaveData.qcFinishStatus = saveAuditReportObject.qcFinishStatus;
		//合格证
		eachSaveData.qcAuditResult = saveAuditReportObject.qcAuditResult;
		//备注
		eachSaveData.remark = saveAuditReportObject.remark;
		
		saveData.push(eachSaveData);
		
	});
	
	//盘点计划日ID
	var auditPlanDayId = session.get("auditPlanDayId");
	//useSameTaskIdFlag:是否使用sameTaskId或checkSameTaskId--0：未使用  1：使用sameTaskId 2：使用checkSameTaskId
	var useSameTaskIdFlag = session.get("useSameTaskIdFlag");
	
	var postData = {};
    postData.random = Math.random();
    postData.userCode = session.get("userCode");
    postData.auditCheckListId = session.get("auditCheckListId");
    postData.dasAuditReportId = session.get("dasAuditReportId");
    postData.saveData = JSON.stringify(saveData);
    
    postData.auditPlanDayId = auditPlanDayId;
//    postData.dealerCode = session.get("dealerCode"); //经销商CODE
    postData.dealerCode =  session.get("auditListDealerCode"); //经销商CODE
    postData.useSameTaskIdFlag = useSameTaskIdFlag; //useSameTaskIdFlag:是否使用sameTaskId或checkSameTaskId--0：未使用  1：使用sameTaskId 2：使用checkSameTaskId
    
//	showLoading();
////	点击保存按钮
//	$.getJSON(basePath+"/app/auditReportEditQc/submitAuditReport.xhtml"+callback, postData,function(msg){
//		showHide();
//		if($.trim(msg.returnCode) == '0'){
//			//任务状态(0.未办 1.已办 2.跳过 3.进行中 )
//    		var returntaskStatus = msg.data.returntaskStatus;
//    		session.remove("taskStatus");
//    		session.set("taskStatus",returntaskStatus);
//    		
//			showMessage(msg.message,'2000');
//		}
//		else{
//			errorHandler(msg.returnCode,msg.message);
//		}
//
//	});//end $.getJSON
	
	$.ajax({
		url: basePath+"/app/auditReportEditQc/submitAuditReport.xhtml",
		data: postData,
		type: 'POST',
		dataType: 'json',
		async:true,
		beforeSend: function () {
			showLoading();
		},
		success: function (msg) {
			showHide();
			if($.trim(msg.returnCode) == '0') {
				//任务状态(0.未办 1.已办 2.跳过 3.进行中 )
	    		var returntaskStatus = msg.data.returntaskStatus;
	    		session.remove("taskStatus");
	    		session.set("taskStatus",returntaskStatus);
	    		session.set("submitStatus","1");
				showMessage(msg.message,'2000');
			}
			else{
				errorHandler(msg.returnCode,msg.message);
			}
		},
		complete: function() {

		}
	});
}

function auditReportEditQcBackPage(oper){
	
	//如果网络是连通的
	if(isNetworkConnected1()){
		//自动保存盘库数据
		saveAuditReport_qc("QcBackPage");
		auditCheckReportEditList_qc = [];
		qcAuditResultDictionaryList_qc = [];
		
		hideMyDialog(oper);
		oper.find(".promptMsg").html("");
		//清除定时器
		clearInterval(qcAuditorAndStoreHouseDistanceInterval);
		back_page();
	}else{
		showAuditReportMessage('目前离线，请恢复网络后再试！',oper,auditReportEditQcBackPage,2000)
	}
}