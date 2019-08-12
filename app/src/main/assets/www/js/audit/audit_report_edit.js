var audit_report_edit_page = $('#audit_report_edit_page');

var audit_report_edit_myScroll;

var auditorAndStoreHouseDistanceInterval;

var auditCheckReportEditList;   //盘点报告列表list--车盘点
var auditResultsDictionaryList;//盘点报告车状态
var keyAuditResultDictionaryList;//盘点报告钥匙状态
var sweepCode;	//扫码方式--1:条码 2:二维码

var auditMode = "1" //盘点方式--1:手动输入 2.扫码
/******************************audit_report_edit_page---begin**************************************/
audit_report_edit_page.live('pageinit',function(e,ui){
	
	var wrapper = "audit_report_edit_wrapper";
	var up = "audit_report_edit_pullUp";
	var down = "audit_report_edit_pullDown";
	audit_report_edit_myScroll = createMyScroll(wrapper,up,down);
	
	auditCheckReportEditList = [];
	auditResultsDictionaryList = [];
	keyAuditResultDictionaryList = [];
	
	//回退事件处理
	audit_report_edit_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		//如果网络是连通的
		if(isNetworkConnected1()){
			showConfirmBackpage("请确认盘点数据是否已保存，否则数据会丢失", function(){
				auditCheckReportEditList = [];
				auditResultsDictionaryList = [];
				keyAuditResultDictionaryList = [];
				//清除定时器
				clearInterval(auditorAndStoreHouseDistanceInterval);
				back_page();
			});
			
		}else{
			showMessage('目前离线，请恢复网络后再试！','2000');
		}
		
	});
	
	
/*	//点击遮罩层事件处理
	$("#auditEditLoadingDivMaskLayer,#auditEditLoadingDiv").live("tap",function(event){
		event.stopPropagation();
		//如果网络是连通的
		if(isNetworkConnected1()){
			//自动保存盘库数据
			saveAuditReport();
			auditCheckReportEditList = [];
			auditResultsDictionaryList = [];
			keyAuditResultDictionaryList = [];
			//清除定时器
			clearInterval(auditorAndStoreHouseDistanceInterval);
			back_page();
		}else{
			showMessage('目前离线，请恢复网络后再试！','2000');
		}
	});*/
	
	
	//保存按钮处理
	audit_report_edit_page.find(".SaveBtn1").live("tap",function(event){
		event.stopPropagation();
		var message = "此操作仅保存到MOA系统，非上传到DAS系统；如果想上传到DAS系统,请点击【上传】按钮。";
		showSaveConfirmLongPromptMsg("点击【保存】按钮",message, function(){
			saveAuditReport("SaveBtn");
		});
		
	});
	
	//提交按钮处理
	audit_report_edit_page.find(".SaveBtn2").live("tap",function(event){
		event.stopPropagation();
		var message = "此操作会将数据上传至DAS系统，并生成盘库报告；如果只是将数据保存到MOA系统，点击【保存】按钮即可。是否继续上传操作？";
		showConfirmLongPromptMsg("点击【上传】按钮",message, function(){
			submitAuditReport();
		});
	});
	
	//点击 全部/已盘/未盘/公里数抽查 按钮，检索满足条件的车辆信息显示到页面
	audit_report_edit_page.find(".auditSegmentedButtonGroup input[type='button']").live("tap",function(event){
		event.stopPropagation();
		var audiSelectedBtn = $('#audit_report_edit_page').find(".auditSegmentedButtonGroup .segmentedButtons4Selected");
		audiSelectedBtn.removeClass("segmentedButtons4Selected");
		audiSelectedBtn.addClass("segmentedButtons4Unselected");
		$(this).removeClass("segmentedButtons4Unselected");
		$(this).addClass("segmentedButtons4Selected");
		//查询盘点报告
		var queryConditonVal = $(this).val();
		queryAuditReportEdit(queryConditonVal);
	});
	
	//点击数字键盘
	audit_report_edit_page.find(".auditReportEditNumericKeyboard .auditReportEditNumericKeyboardNumber").live("tap",function(event){
		event.stopPropagation();
		//盘点方式--1:手动输入 2.扫码
		auditMode = "1";
		sweepCode="";
		//查询盘点报告
		var numericKeyboardVal = $(this).val();
		var $vinNoText = $('#audit_report_edit_page').find(".vinNoTextDiv #vinNoText");
		var vinNoText = $vinNoText.val();
		vinNoText += numericKeyboardVal;
		$vinNoText.val(vinNoText.substring(0,17));
		if($vinNoText.val().length >= 4){
			var queryConditonVal = $('#audit_report_edit_page').find(".auditSegmentedButtonGroup .segmentedButtons4Selected").val();
			queryAuditReportEdit(queryConditonVal);
		}
		
	});
	
	//点击删除按钮，删除检索条件车架号文本框中的1个字符，然后进行模糊查询
	audit_report_edit_page.find(".auditReportEditNumericKeyboardRow2 #deleteVinNo").live("tap",function(event){
		event.stopPropagation();
		//查询盘点报告
		var $vinNoText = $('#audit_report_edit_page').find(".vinNoTextDiv #vinNoText");
		var vinNoText = $vinNoText.val();
		$vinNoText.val(vinNoText.substring(0,vinNoText.length-1));
		if($vinNoText.val().length >= 4){
			var queryConditonVal = $('#audit_report_edit_page').find(".auditSegmentedButtonGroup .segmentedButtons4Selected").val();
			queryAuditReportEdit(queryConditonVal);
		}
		
	});
	
	//点击清除按钮，删除检索条件车架号文本框中的所有字符，然后进行模糊查询
	audit_report_edit_page.find(".auditReportEditNumericKeyboardRow3 #auditReportClearVinNoBtn").live("tap",function(event){
		event.stopPropagation();
		//查询盘点报告
		var $vinNoText = $('#audit_report_edit_page').find(".vinNoTextDiv #vinNoText");
		$vinNoText.val("");
//		var queryConditonVal = $('#audit_report_edit_page').find(".auditSegmentedButtonGroup .segmentedButtons4Selected").val();
//		queryAuditReportEdit(queryConditonVal);
	});
	
	//点击批量设置车状态、设置钥匙状态
	audit_report_edit_page.find(".bottoms3-red li a.batchSet").live("tap",function(event){
		var batchSetId = $(this).attr("id");
		batchSetStatus(batchSetId);
	});
	
	//点击显示隐藏数字键盘
	audit_report_edit_page.find(".bottoms3-red li a.numericKeyboard").live("tap",function(event){
		$("#audit_report_edit_page").find("div.auditReportEditNumericKeyboard").toggle();
	});
	
	//扫描二维码
	audit_report_edit_page.find("#QRCodeBtn").live("tap",function(event){
		sweepCode = '2';//二维码
		auditMode = "2";//盘点方式:扫码
		showLoading();
		setTimeout(function(){
			showHide();
			var businessType = ConstDef.getConstant("BUSINESS_CATEGORY_AUDIT");
			session.set("businessType",businessType);
			scan_QR_code(sweepCode,"onScanCodeFinish");
		},1000);
	});
	
	//扫描条形码
	audit_report_edit_page.find("#barCodeBtn").live("tap",function(event){
		sweepCode = '1';//条码
		auditMode = "2";//盘点方式:扫码
		showLoading();
		setTimeout(function(){
			showHide();
			var businessType = ConstDef.getConstant("BUSINESS_CATEGORY_AUDIT");
			session.set("businessType",businessType);
			Scanning_Barcode(sweepCode,"onScanCodeFinish");
		},1000);
	});

});//end pageinit


audit_report_edit_page.live('pageshow',function(e, ui){

	currentLoadActionName  = "audit_report_edit_load_content";
	
	var fromPage = session.get("fromPage");
	if(fromPage != "common_business_pictures_edit_page" 
		&& fromPage != "common_business_pictures_view_page"){
		//查询提示消息列表
		load_audit_report_edit_content();
	}
	
});//end pageshow

function audit_report_edit_load_content(){
	//下拉不刷新，则该方法置空
}

//初始化盘点报告页面
function load_audit_report_edit_content(){
	var page = $('#audit_report_edit_page');
	var $auditReportList = page.find(".auditReportEditContentDiv .auditReportEditList");
	$auditReportList.empty();
	
	var auditReportStatisticsNumFont = $('#audit_report_edit_page').find(".auditReportStatisticsNum font");
	auditReportStatisticsNumFont.text("0");
	
	var $auditSegmentedButtonGroup = $('#audit_report_edit_page').find(".auditSegmentedButtonGroup input");
	var $auditReportTotalBtn = $('#audit_report_edit_page').find(".auditSegmentedButtonGroup #auditReportTotalBtn");
	$auditSegmentedButtonGroup.removeClass("segmentedButtons4Selected");
	$auditSegmentedButtonGroup.addClass("segmentedButtons4Unselected");
	$auditReportTotalBtn.removeClass("segmentedButtons4Unselected");
	$auditReportTotalBtn.addClass("segmentedButtons4Selected");
	
	var $vinNoText = $('#audit_report_edit_page').find("#vinNoText");
	$vinNoText.val("");
	
	//数字键盘默认显示
	page.find("div.auditReportEditNumericKeyboard").css("display","");
	
	showLoading();
	var postData = {};
    postData.random = Math.random();
    postData.auditCheckListId = session.get("auditCheckListId");//盘点清单ID
//    //taskType：1.经销商盘库  2.监管单位盘库 3.抽查
//	var taskType = session.get("taskType");
//    if(taskType == 3){
//    	postData.taskType = taskType;
//    	postData.relationAuditPlanDayId = session.get("relationAuditPlanDayId");//抽查任务对应盘点任务的盘点计划日ID
//	}
    
	$.getJSON(basePath+"/app/auditReportEdit/pageInit.xhtml"+callback, postData,function(msg){
		if($.trim(msg.returnCode) == '0'){
			var auditReportTotalNum = 0; //总台数
			var auditFinishNum = 0;   //已盘
			var auditUnfinishNum = 0;  //未盘
			var odomSelectiveNum = 0;  //抽查公里数
//			var qcFinishNum = 0;  //合格证已盘数量
			
			var data = msg.data;
//			auditCheckReportEditList = data; //将初始化数据保存到全局变量数组中
			auditCheckReportEditList = data.auditReportList; //将初始化数据保存到全局变量数组中
			
		    if(data.auditReportList !=null){
		    	//盘点报告初始化
		    	//盘点报告车状态
		    	auditResultsDictionaryList = data.auditResultsDictionaryList;
		    	//盘点报告钥匙状态
		    	keyAuditResultDictionaryList = data.keyAuditResultDictionaryList;
		    	
		    	//批量设置时，加载字典表中盘点报告车状态、盘点报告钥匙状态
		    	loadInitResultsBatchSet(auditResultsDictionaryList,keyAuditResultDictionaryList);
		    	
		    	//加载盘点报告列表
		    	var auditReportList = data.auditReportList;
//		    	var relationAuditReportList = data.relationAuditReportList;
		    	
				var $template = $("#audit_report_edit_page .list-row-template");
				
				$.each(auditReportList,function(i,n){
					var $item = $template.clone(true);
					
					//checkbox
                    var $auditReportEditCheckBoxLabel = $item.find(".ListTit [identity='vinNo']");
                    $auditReportEditCheckBoxLabel.bind("tap", function() {
                        var checkObj = $item.find(".ListTit [identity = 'checkbox_in']");
                        if ($(checkObj).is(":checked")) {
                            $(checkObj).removeAttr("checked");
                        } else {
                            $(checkObj).attr("checked", "checked");
                        }
                    });
                    
					var $auditReportEditPhotoBtn = $item.find(".ListTit a.auditReportEditPhotoBtn");
					$auditReportEditPhotoBtn.bind("tap",function(event){
						event.stopPropagation();
						//如果网络是连通的
						if(isNetworkConnected1()){
							var auditCheckReportId = $(this).parents(".auditReportEditListItem").find("[identity='auditCheckReportId']").text();
							auditReportEditPhotoBtn(auditCheckReportId);
						}else{
							showMessage('目前离线，请恢复网络后再试！','2000');
						}
						
					});
					
					//点击完成按钮
					var $auditReportEditConfirmBtn = $item.find(".ListTit a.auditReportEditConfirmBtn");
					$auditReportEditConfirmBtn.bind("tap",function(event){
						event.stopPropagation();
						auditReportEditConfirm(this,"ConfirmBtn");
					});
					
					//公里数输入框keyup事件
					var $auditReportEditOdometerInput = $item.find("input[name='auditReportEdit_odometer']");
					$auditReportEditOdometerInput.keyup(function(){
						event.stopPropagation();
						auditReportEditConfirm(this,"Odometer");
					});
					
					//备注输入框的keyup事件
					var $auditReportEditRemarkInput = $item.find("input[name='auditReportEdit_remark']");
					$auditReportEditRemarkInput.keyup(function(){
						event.stopPropagation();
						auditReportEditConfirm(this,"Remark");
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
//						qcFinishNum += 1;
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
					//对于GTMC渠道经销商，也要显示实际车架号
					if(n.make == "GTMC"){
						$item.find("#vinNoView").css("display","");
					}
					
					//加载字典表中盘点报告车状态、盘点报告钥匙状态、盘点报告合格证状态
					loadInitAuditResults($item,"auditReportEdit_carStatus",auditResultsDictionaryList,
							n.auditResults,"SingleSet");
					loadInitKeyAuditResult($item,"auditReportEdit_keyStatus",keyAuditResultDictionaryList,
							n.keyAuditResult,"SingleSet");
					//加载销售日期
					loadInitSoldDate($item,"auditReportEdit_soldDate",n.soldDate);
					if(n.auditResults=="OFFSE" || n.auditResults=="SOT" || n.auditResults=="SOLD"){
						$item.find("#auditReportEdit_soldDateDiv").css("display","");
					}else{
						$item.find("#auditReportEdit_soldDateDiv").css("display","none");
					}
					dataBindToElement($item,n);
					
					$item.removeClass("list-row-template");
					$item.css("display","");
//					$item.show();
					$auditReportList.append($item);
					
				});//end $.each
				
				auditReportTotalNum = auditReportList.length;
				//设置总台数、车已盘、车未盘、抽查公里数、合格证已盘 的车辆数量
				page.find("#auditReportTotalNum font").text(auditReportTotalNum);
				page.find("#auditFinishNum font").text(auditFinishNum);
				page.find("#auditUnfinishNum font").text(auditUnfinishNum);
				page.find("#odomSelectiveNum font").text(odomSelectiveNum);
//				page.find("#qcFinishNum font").text(qcFinishNum);
				
            	showHide();
            	
            	//是否测试模式 1:开启 0:关闭
            	if (session.get("testMode") != "1") {
            		//盘点人员最后位置距库房的距离是否在库房的有效范围
                	auditorLastLocationAndStoreHouseDistance(userLastLocation,auditReportEditBackPage);
                	//定时循环查询盘库人员盘库时距离库房的距离的间隔时间（ms）
//                	var auditReportEdit_intervalTime = ConstDef.getConstant("AUDIT_USER_STOREHOUSE_DISTANCE_INTERVAL");
                	var auditReportEdit_intervalTime = session.get("auditStorehouseValidDistanceInterval");
                 	auditorAndStoreHouseDistanceInterval = setInterval(function(){
                 		auditorLastLocationAndStoreHouseDistance(userLastLocation,auditReportEditBackPage);
                 	}, auditReportEdit_intervalTime);
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
function queryAuditReportEdit(queryConditonVal){
	var page = $('#audit_report_edit_page');
	var $auditReportList = page.find(".auditReportEditContentDiv .auditReportEditList");
	$auditReportList.empty();
	
	var auditReportStatisticsNumFont = page.find(".auditReportStatisticsNum font");
	auditReportStatisticsNumFont.text("0");
	
	showLoading();
	var $vehicleFinishStatus = "";
	var $odomSelectiveFlag = "";
    
    var auditReportTotalNum = 0; //总台数
	var auditFinishNum = 0;   //已盘
	var auditUnfinishNum = 0;  //未盘
	var odomSelectiveNum = 0;  //抽查公里数
//	var qcFinishNum = 0;  //合格证已盘数量
	
	//不能直接让filterAuditReportList=auditCheckReportEditList，这样的话其中一个数组值改变，另一个也会变
//    var filterAuditReportList = auditCheckReportEditList.auditReportList.slice(0);
    var filterAuditReportList = auditCheckReportEditList.slice(0);
    
    //1.统计总台数、已盘、未盘、抽查公里数车辆数、合格证已盘数量
    //2.将不符合查询条件的数据从filterAuditReportList数组中删除
    var flag = true;
    for(var i=0; i < filterAuditReportList.length; flag ? i++ : i){
    	var filterAuditReportObject = filterAuditReportList[i];
    	
    	//1.统计总台数、已盘、未盘、抽查公里数车辆数、合格证已盘数量
    	//车盘点状态--vehicleFinishStatus ：是否完成（0：未盘点  1.已盘点）
		if(filterAuditReportObject.vehicleFinishStatus == 1){
			auditFinishNum += 1;
		}else{
			auditUnfinishNum += 1;
		}
		//合格证盘点状态--qcFinishStatus：是否完成（0：未盘点  1.已盘点）
		if(filterAuditReportObject.qcFinishStatus == 1){
//			qcFinishNum += 1;
		}
    	//odomSelectiveFlag:是否抽查公里数(0：不抽查  1.抽查)
		if(filterAuditReportObject.odomSelectiveFlag == 1){
			odomSelectiveNum += 1;
		}
		
		//2.将不符合查询条件的数据从filterAuditReportList数组中删除
		var queryFlag = true;//查询条件查询flag--true:没有从数组删除数据 false:从数组删除数据
    	if(queryConditonVal != "" && queryConditonVal != null){
    		if(queryConditonVal == "已盘"){
        		//vehicleFinishStatus ：是否完成（0：未盘点  1.已盘点）
        		$vehicleFinishStatus = "1";
        	}else if(queryConditonVal == "未盘"){
        		//vehicleFinishStatus ：是否完成（0：未盘点  1.已盘点）
        		$vehicleFinishStatus = "0";
        	}else if(queryConditonVal == "公里数抽查"){
        		//odomSelectiveFlag:是否抽查公里数(0：不抽查  1.抽查)
        		$odomSelectiveFlag = "1";
        	}
    		
    		if($vehicleFinishStatus != null && $vehicleFinishStatus != ''){
            	if(filterAuditReportObject.vehicleFinishStatus != $vehicleFinishStatus){
            		//将不符合查询条件的数据从filterAuditReportList数组中删除
            		filterAuditReportList.splice(i,1);
            		queryFlag = false;
            	}else{
            		queryFlag = true;
            	}
            }
    		else if($odomSelectiveFlag != null && $odomSelectiveFlag != ''){
        		if(filterAuditReportObject.odomSelectiveFlag != $odomSelectiveFlag){
        			//将不符合查询条件的数据从filterAuditReportList数组中删除
        			filterAuditReportList.splice(i,1);
        			queryFlag = false;
            	}else{
            		queryFlag = true;
            	}
        	}
    	}
    	
    	var vinNoFlag = true;//车架号查询flag--true:没有从数组删除数据 false:从数组删除数据
    	if(queryFlag != false){
    		//TODO 车架号查询
    	    var $vinNo = page.find(".vinNoTextDiv #vinNoText").val();
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
	var data = filterAuditReportList;
    if(data !=null){
//    	//盘点报告车状态
//    	auditResultsDictionaryList = auditCheckReportEditList.auditResultsDictionaryList;
//    	//盘点报告钥匙状态
//    	keyAuditResultDictionaryList = auditCheckReportEditList.keyAuditResultDictionaryList;
    	
    	//批量设置时，加载字典表中盘点报告车状态、盘点报告钥匙状态、盘点报告合格证状态
//    	loadInitResultsBatchSet(auditResultsDictionaryList,keyAuditResultDictionaryList);
    	
    	//加载盘点报告列表
//    	var auditReportList = data;
		var $template = $("#audit_report_edit_page .list-row-template");
		$.each(data,function(i,n){
			var $item = $template.clone(true);
			
			//checkbox
            var $auditReportEditCheckBoxLabel = $item.find(".ListTit [identity='vinNo']");
            $auditReportEditCheckBoxLabel.bind("tap", function() {
                var checkObj = $item.find(".ListTit [identity = 'checkbox_in']");
                if ($(checkObj).is(":checked")) {
                    $(checkObj).removeAttr("checked");
                } else {
                    $(checkObj).attr("checked", "checked");
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
					auditReportEditPhotoBtn(auditCheckReportId);
				}else{
					showMessage('目前离线，请恢复网络后再试！','2000');
				}
				
			});
			
			//完成按钮点击事件
			var $auditReportEditConfirmBtn = $item.find(".ListTit a.auditReportEditConfirmBtn");
			$auditReportEditConfirmBtn.bind("tap",function(event){
				event.stopPropagation();
				auditReportEditConfirm(this,"ConfirmBtn");
			});
			
			//公里数输入框keyup事件
			var $auditReportEditOdometerInput = $item.find("input[name='auditReportEdit_odometer']");
			$auditReportEditOdometerInput.keyup(function(){
				event.stopPropagation();
				auditReportEditConfirm(this,"Odometer");
			});
			
			//备注输入框的keyup事件
			var $auditReportEditRemarkInput = $item.find("input[name='auditReportEdit_remark']");
			$auditReportEditRemarkInput.keyup(function(){
				event.stopPropagation();
				auditReportEditConfirm(this,"Remark");
			});
			
			//vehicleFinishStatus ：是否完成（0：未盘点  1.已盘点）
			if(n.vehicleFinishStatus == 1){
				$item.find(".CauseDiv").css("color","red");
			}
			
			//odomSelectiveFlag:是否抽查公里数(0：不抽查  1.抽查)
			if(n.odomSelectiveFlag == 1){
				$item.find(".CauseDiv").css("color","blue");
			}
			
			//是否抽查钥匙 --0：不抽查  1.抽查
			if(n.keySelectiveFlag == 1){
				$item.find(".CauseDiv .KeyBtn").css("display","");
			}
			
			//加载字典表中盘点报告车状态、盘点报告钥匙状态、盘点报告合格证状态
			loadInitAuditResults($item,"auditReportEdit_carStatus",auditResultsDictionaryList,
					n.auditResults,"SingleSet");
			loadInitKeyAuditResult($item,"auditReportEdit_keyStatus",keyAuditResultDictionaryList,
					n.keyAuditResult,"SingleSet");
			//加载销售日期
			loadInitSoldDate($item,"auditReportEdit_soldDate",n.soldDate);
			if(n.auditResults=="OFFSE" || n.auditResults=="SOT" || n.auditResults=="SOLD"){
				$item.find("#auditReportEdit_soldDateDiv").css("display","");
			}else{
				$item.find("#auditReportEdit_soldDateDiv").css("display","none");
			}
			
			dataBindToElement($item,n);
			$item.removeClass("list-row-template");
			$item.css("display","");
//			$item.show();
			$auditReportList.append($item);
			
		});//end $.each
		
    	showHide();
    } else {
    	showHide();
//            	showMessage('暂无数据','1500');	
    }
    
//    auditReportTotalNum = auditCheckReportEditList.auditReportList.length;
    auditReportTotalNum = auditCheckReportEditList.length;
	//设置总台数、已盘、未盘、抽查公里数的车辆数量
	page.find("#auditReportTotalNum font").text(auditReportTotalNum);
	page.find("#auditFinishNum font").text(auditFinishNum);
	page.find("#auditUnfinishNum font").text(auditUnfinishNum);
	page.find("#odomSelectiveNum font").text(odomSelectiveNum);
//	page.find("#qcFinishNum font").text(qcFinishNum);
		
}

//批量设置时，加载字典表中盘点报告车状态、盘点报告钥匙状态、盘点报告合格证状态
function loadInitResultsBatchSet(auditResultsDictionaryList,keyAuditResultDictionaryList){
	var $auditReportEditCarBatchSet = $("#audit_report_edit_page .auditReportEditCarBatchSet");
	loadInitAuditResults($auditReportEditCarBatchSet,"auditReportEdit_batchSetCarStatusSelect",
			auditResultsDictionaryList,"","BatchSet");
	
	var $auditReportEditKeyBatchSet = $("#audit_report_edit_page .auditReportEditKeyBatchSet");
	loadInitKeyAuditResult($auditReportEditKeyBatchSet,"auditReportEdit_batchSetKeyStatusSelect",
			keyAuditResultDictionaryList,"","BatchSet");
}

//点击批量操作的链接（设置车状态、设置钥匙状态、设置合格证状态）时，在js中调用相应的批量操作选择项的单击事件
function batchSetStatus(batchSetId){
	var $checkedInputItems = $("#audit_report_edit_page .auditReportEditListItem .ListTit input[type='checkbox']:checked");
	if($checkedInputItems != null && $checkedInputItems.length > 0){
		if(batchSetId == "auditReportEdit_batchSetCarStatus"){
			var $batchSetCarStatus = $("#audit_report_edit_page .auditReportEditCarBatchSet").find("input");
			$batchSetCarStatus.click();
		}else if(batchSetId == "auditReportEdit_batchSetKeyStatus"){
			var $batchSetKeyStatus = $("#audit_report_edit_page .auditReportEditKeyBatchSet").find("input");
			$batchSetKeyStatus.click();
		}
	}else{
		showMessage("请至少选择一辆车！",'2000');
	}
	
}

//加载字典表中盘点报告车状态
function loadInitAuditResults($item,carStatusName,auditResultsDictionaryList,auditResults,setClassification){
	//盘点报告车状态
	var $carStatus =  $item.find("[name='"+carStatusName+"']");
	$carStatus.empty();
	$.each(auditResultsDictionaryList,function(i,n){
		var templateItem = '<option value="'+n.code+'">'+n.name+'</option>';
		$carStatus.append(templateItem);
	});
	$carStatus.mobiscroll().select({
	        theme: 'red',
	        lang: 'zh',
	        display: 'bottom',
	        minWidth: 200,
	        onInit: function (event, inst) {
	        	if(auditResults == ""){
	        		//设置默认车状态
	        		$carStatus.mobiscroll('setVal',"NONE",true);
	        	}else{
	        		//已设置的车状态值
	        		$carStatus.mobiscroll('setVal',auditResults,true);
	        	}
	        },
	        onSet:function(event,inst){
	        	
	        	if(setClassification == "BatchSet"){
	        		//批量设置车状态
	        		var $checkedInputItems = $("#audit_report_edit_page .auditReportEditListItem .ListTit input[type='checkbox']:checked");
        			var carStatusVal = $carStatus.mobiscroll("getVal");
        			//批量设置时，设置所有选中的列表项的车状态
        			var $select = $checkedInputItems.parents(".ListRow").find("dd div.auditReportEditSelectContent select[name='auditReportEdit_carStatus']");
	        		$select.mobiscroll('setVal',carStatusVal,true);
	        		
//	        		//批量设置时，设置“车”的值时，钥匙的值也要自动设置成相同的值(但是修改“钥匙”的值时，不用自动修改“车”的值)
		     		var $selectKeyStatus = $checkedInputItems.parents(".ListRow").find("dd div.auditReportEditSelectContent select[name='auditReportEdit_keyStatus']");
		        	if(carStatusVal == "MOVE"){
		        		//move to other location
		        		$selectKeyStatus.mobiscroll('setVal','00004',true);
		        	}else if(carStatusVal == "NONE"){
		        		//NONE
		        		$selectKeyStatus.mobiscroll('setVal','00001',true);
		        	}else if(carStatusVal == "OTW"){
		        		//On the Way
		        		$selectKeyStatus.mobiscroll('setVal','00002',true);
		        	}else if(carStatusVal == "SOLD"){
		        		//sold
		        		$selectKeyStatus.mobiscroll('setVal','00003',true);
		        		
		        	}
		        	
		        	var $soldDateInput = $checkedInputItems.parents(".ListRow").find("#auditReportEdit_soldDateDiv");
		        	if(carStatusVal =="OFFSE" || carStatusVal=="SOT" 
	        			|| carStatusVal=="SOLD"){
		        		
		        		$soldDateInput.css("display","");
		        	}else{
		        		$soldDateInput.css("display","none");
		        		$soldDateInput.find("input[name='auditReportEdit_soldDate']").val("");
		        	}
		        	
	        		//批量设置车状态时，选中项车状态修改时，保存到js中的车辆盘点数据变量中
	        		$.each($checkedInputItems,function(i,inputitem){
		        		var $carStatusSelectItem = $(inputitem).parents(".ListRow").find("dd div.auditReportEditSelectContent select[name='auditReportEdit_carStatus']");
		        		auditReportEditConfirm($carStatusSelectItem,"CarStatus");
		        		
		        	});//end $.each
		        	
	        		//所有选中checkbox，取消选中
	        		$checkedInputItems.removeAttr("checked");
	        		
	        	}else if(setClassification == "SingleSet"){
	        		
//	        		//单个设置车状态时，钥匙的值也要自动设置成相同的值(但是修改“钥匙”的值时，不用自动修改“车”的值)
	        		var carStatusVal = $carStatus.mobiscroll("getVal");
		     		var $selectKeyStatus = $(this).parents(".ListRow").find("dd div.auditReportEditSelectContent select[name='auditReportEdit_keyStatus']");
		        	if(carStatusVal == "MOVE"){
		        		//move to other location
		        		$selectKeyStatus.mobiscroll('setVal','00004',true);
		        	}else if(carStatusVal == "NONE"){
		        		//NONE
		        		$selectKeyStatus.mobiscroll('setVal','00001',true);
		        	}else if(carStatusVal == "OTW"){
		        		//On the Way
		        		$selectKeyStatus.mobiscroll('setVal','00002',true);
		        	}else if(carStatusVal == "SOLD"){
		        		//sold
		        		$selectKeyStatus.mobiscroll('setVal','00003',true);
		        	}
		        	
		        	var $soldDateInput = $item.find("#auditReportEdit_soldDateDiv");
		        	if(carStatusVal =="OFFSE" || carStatusVal=="SOT" 
	        			|| carStatusVal=="SOLD"){
		        		$soldDateInput.css("display","");
		        	}else{
		        		$soldDateInput.css("display","none");
		        		$soldDateInput.find("input[name='auditReportEdit_soldDate']").val("");
		        	}
	        		//单个设置车状态时，选中项车状态修改时，保存到js中的车辆盘点数据变量中
	        		auditReportEditConfirm(this,"CarStatus");
	        	}
	        }
	    });
}
//加载字典表中盘点报告钥匙状态
function loadInitKeyAuditResult($item,keyStatusName,keyAuditResultDictionaryList,keyAuditResult,setClassification){
	//盘点报告钥匙状态
	var $keyStatus =  $item.find("[name='"+keyStatusName+"']");
	$keyStatus.empty();
	$.each(keyAuditResultDictionaryList,function(i,n){
		var templateItem = '<option value="'+n.code+'">'+n.name+'</option>';
		$keyStatus.append(templateItem);
	});
	$keyStatus.mobiscroll().select({
		theme: 'red',
		lang: 'zh',
		display: 'bottom',
		minWidth: 200,
		onInit: function (event, inst) {
	        if(keyAuditResult == ""){
	        	//钥匙状态默认值
	        	$keyStatus.mobiscroll('setVal',"00001",true);
	        }else{
	        	//已设置的钥匙状态
	        	$keyStatus.mobiscroll('setVal',keyAuditResult,true);
	        }
	     },
	     onSet:function(event,inst){
	        if(setClassification == "BatchSet"){
	        	//批量设置钥匙状态
	        	var $checkedInputItems = $("#audit_report_edit_page .auditReportEditListItem .ListTit input[type='checkbox']:checked");
	     		var keyStatusVal = $keyStatus.mobiscroll("getVal");
	     		//批量设置时，设置所有选中的列表项的钥匙状态
	     		var $select = $checkedInputItems.parents(".ListRow").find("dd div.auditReportEditSelectContent select[name='auditReportEdit_keyStatus']");
	        	$select.mobiscroll('setVal',keyStatusVal,true);
	        	
	        	//批量设置钥匙状态时，选中项钥匙状态修改时，保存到js中的车辆盘点数据变量中
	        	$.each($checkedInputItems,function(i,inputitem){
	        		var $keyStatusSelectItem = $(inputitem).parents(".ListRow").find("dd div.auditReportEditSelectContent select[name='auditReportEdit_keyStatus']");
	        		auditReportEditConfirm($keyStatusSelectItem,"KeyStatus");
	        	});//end $.each
	        	
	        	//所有选中checkbox，取消选中
        		$checkedInputItems.removeAttr("checked");
        		
        	}else if(setClassification == "SingleSet"){
        		//单个设置钥匙状态时，选中项钥匙状态修改时，保存到js中的车辆盘点数据变量中
        		auditReportEditConfirm(this,"KeyStatus");
        	}
	     }
	});
}

function loadInitSoldDate($item,soldDateName,initSoldDate){
	var $soldDate =  $item.find("[name='"+soldDateName+"']");
	$soldDate.mobiscroll().date({
	    theme: 'red',
	    lang: 'zh',
	    display: 'bottom',
//	    min: new Date(),
	    onInit:function(event,inst){
	    	if(initSoldDate != null && initSoldDate != ""){
//		    	var initSoldDate = event.valueText;
//		    	$soldDate.mobiscroll('setVal', initSoldDate,true);
		    	var newInitSoldDate = new Date(initSoldDate);
		    	var initSoldDateFormat = Format(newInitSoldDate,"yyyy-MM-dd");
		    	$soldDate.val(initSoldDateFormat);
	    	}else{
	    		$soldDate.val("");
	    	}
	    },
	    onSet:function(event,inst){
	    	var soldDate = event.valueText;
	    	var newSoldDate = new Date(soldDate);
	    	var soldDateFormat = Format(newSoldDate,"yyyy-MM-dd");
	    	$soldDate.val(soldDateFormat);
//	    	$(this).mobiscroll('setVal', soldDateFormat,true);
	    	//单个设置销售日期时，选中项销售日期修改时，保存到js中的车辆盘点数据变量中
    		auditReportEditConfirm(this,"soldDate");
	    }
	});
	
}

//点击图片链接处理
function auditReportEditPhotoBtn(auditCheckReportId){
	clearInterval(auditorAndStoreHouseDistanceInterval);
	
	var businessType = ConstDef.getConstant("BUSINESS_CATEGORY_AUDIT");
	session.set("businessId",auditCheckReportId);
	session.set("businessType",businessType);
	session.set("functionFlag","4");
	goto_page("common_business_pictures_edit_page");
}

//点击完成链接处理，修改盘点状态、公里数抽查状态，并经数据保存到页面js中保存的数组中
function auditReportEditConfirm(auditReportEditItem,callClassification){
	var page = $("#audit_report_edit_page")
	var $auditReportEditListItem = $(auditReportEditItem).parents(".auditReportEditListItem");
	//数据列表序号number
	var number = $auditReportEditListItem.find("[identity='number']").text()
	//盘库报告ID
	var auditCheckReportId = $auditReportEditListItem.find("[identity='auditCheckReportId']").text()
	// 公里数
	var auditReportEditOdometer = $auditReportEditListItem.find("input[name='auditReportEdit_odometer']").val();
	
	//获取已盘、未盘、抽查公里数的车辆数量
	var auditFinishNum = Number(page.find("#auditFinishNum font").text());
	var auditUnfinishNum = Number(page.find("#auditUnfinishNum font").text());
	var odomSelectiveNum = Number(page.find("#odomSelectiveNum font").text());
//	var qcFinishNum = Number(page.find("#qcFinishNum font").text());  //合格证已盘数量
	
	//原有车盘点状态--是否完成：（0：未盘点  1.已盘点）
	var $oldVehicleFinishStatus = $auditReportEditListItem.find("[identity='vehicleFinishStatus']").text();
	//odomSelectiveFlag:是否抽查公里数(0：不抽查  1.抽查)--原有状态
	var $oldOdomSelectiveFlag = $auditReportEditListItem.find("[identity='odomSelectiveFlag']").text();
	
	//是否完成--0：未盘点  1.已盘点
	var $vehicleFinishStatus = $oldVehicleFinishStatus;
	//odomSelectiveFlag:是否抽查公里数(0：不抽查  1.抽查)
	var $odomSelectiveFlag = $oldOdomSelectiveFlag;
	
	//保存到页面js中保存的数组中
//	var saveAuditReportList = auditCheckReportEditList.auditReportList;
	var saveAuditReportList = auditCheckReportEditList;
	var saveAuditReportObject = saveAuditReportList[number-1];
	if(saveAuditReportObject.auditCheckReportId == auditCheckReportId){

		//callClassification:调用分类   -- ConfirmBtn：点击完成按钮  
		if(callClassification == "ConfirmBtn"){
			// 点击【完成】时，将该辆车标识为“已盘”
			$vehicleFinishStatus = 1;
			//是否完成--0：未盘点  1.已盘点---原有状态
			if($oldVehicleFinishStatus != "1"){
				auditFinishNum += 1;	
				auditUnfinishNum -= 1
				$auditReportEditListItem.find("[identity='vehicleFinishStatus']").text("1");
			}
			
			//设置已盘、未盘、抽查公里数的车辆数量
			page.find("#auditFinishNum font").text(auditFinishNum);
			page.find("#auditUnfinishNum font").text(auditUnfinishNum);
			
			// 点击【完成】时，判断公里数是否有值，如果有值，则将该辆车标识为“公里数抽查”，否则标识为“已盘”
			if(auditReportEditOdometer != ""){
				$auditReportEditListItem.find(".CauseDiv").css("color","blue");
				$odomSelectiveFlag = 1;
				if($oldOdomSelectiveFlag != "1"){
					odomSelectiveNum += 1;
				}
				$auditReportEditListItem.find("[identity='odomSelectiveFlag']").text("1");
			}else{
				$auditReportEditListItem.find(".CauseDiv").css("color","red");
				$odomSelectiveFlag = 0;
				if($oldOdomSelectiveFlag == "1"){
					odomSelectiveNum -= 1;
				}
				$auditReportEditListItem.find("[identity='odomSelectiveFlag']").text("0");
			}
			page.find("#odomSelectiveNum font").text(odomSelectiveNum);
			
			//车
			saveAuditReportObject.auditResults = $auditReportEditListItem.find("[name='auditReportEdit_carStatus']").val();
			saveAuditReportObject.auditResultsName = $auditReportEditListItem.find("[name='auditReportEdit_carStatus'] option:selected").text();
			//钥匙
			saveAuditReportObject.keyAuditResult = $auditReportEditListItem.find("[name='auditReportEdit_keyStatus']").val();
			saveAuditReportObject.keyAuditResultName = $auditReportEditListItem.find("[name='auditReportEdit_keyStatus'] option:selected").text();
			//公里数
			saveAuditReportObject.odometer = $auditReportEditListItem.find("[name='auditReportEdit_odometer']").val();
			//车盘点状态--是否完成：0：未盘点  1.已盘点
			saveAuditReportObject.vehicleFinishStatus = $vehicleFinishStatus;
			//公里数抽查状态--是否抽查公里数（0：不抽查  1.抽查）
			saveAuditReportObject.odomSelectiveFlag = $odomSelectiveFlag;
			//备注
			saveAuditReportObject.remark = $auditReportEditListItem.find("[name='auditReportEdit_remark']").val();
			//销售日期
			saveAuditReportObject.soldDate = $auditReportEditListItem.find("[name='auditReportEdit_soldDate']").val();
			//盘点方式 1:手动输入 2.扫码
			saveAuditReportObject.auditMode = auditMode;
			
			showMessage("该车辆盘点完成",'500');
			
			setTimeout(function(){
				if(sweepCode=='1'){
//					auditMode = "2";//盘点方式:扫码
					setTimeout(function(){
						showHide();
						var businessType = ConstDef.getConstant("BUSINESS_CATEGORY_AUDIT");
						session.set("businessType",businessType);
						Scanning_Barcode(sweepCode,"onScanCodeFinish");
					},1000);
				}else if(sweepCode=='2'){
//					auditMode = "2";//盘点方式:扫码
					setTimeout(function(){
						showHide();
						var businessType = ConstDef.getConstant("BUSINESS_CATEGORY_AUDIT");
						session.set("businessType",businessType);
						scan_QR_code(sweepCode,"onScanCodeFinish");
					},1000);
				}
			}, 500);
			
			//TODO:清空车架号查询的车架号
			$('#audit_report_edit_page').find("#vinNoText").val('');
			
		}else if(2 == "Odometer"){
//			if(auditReportEditOdometer != ""){
//				$odomSelectiveFlag = 1;
//				$auditReportEditListItem.find("[identity='odomSelectiveFlag']").text("1");
//			}else{
//				$odomSelectiveFlag = 0;
//				$auditReportEditListItem.find("[identity='odomSelectiveFlag']").text("0");
//			}
			//公里数
			saveAuditReportObject.odometer = $auditReportEditListItem.find("[name='auditReportEdit_odometer']").val();
//			//公里数抽查状态--是否抽查公里数（0：不抽查  1.抽查）
//			saveAuditReportObject.odomSelectiveFlag = $odomSelectiveFlag;
			
		}else if(callClassification == "Remark"){
			//备注
			saveAuditReportObject.remark = $auditReportEditListItem.find("[name='auditReportEdit_remark']").val();
		}else if(callClassification == "CarStatus"){
			//车
			saveAuditReportObject.auditResults = $auditReportEditListItem.find("[name='auditReportEdit_carStatus']").val();
			saveAuditReportObject.auditResultsName = $auditReportEditListItem.find("[name='auditReportEdit_carStatus'] option:selected").text();
			//钥匙
			saveAuditReportObject.keyAuditResult = $auditReportEditListItem.find("[name='auditReportEdit_keyStatus']").val();
			saveAuditReportObject.keyAuditResultName = $auditReportEditListItem.find("[name='auditReportEdit_keyStatus'] option:selected").text();
			//销售日期
			saveAuditReportObject.soldDate = $auditReportEditListItem.find("[name='auditReportEdit_soldDate']").val();
		}else if(callClassification == "KeyStatus"){
			//钥匙
			saveAuditReportObject.keyAuditResult = $auditReportEditListItem.find("[name='auditReportEdit_keyStatus']").val();
			saveAuditReportObject.keyAuditResultName = $auditReportEditListItem.find("[name='auditReportEdit_keyStatus'] option:selected").text();
		}else if(callClassification == "soldDate"){
			//销售日期
			saveAuditReportObject.soldDate = $auditReportEditListItem.find("[name='auditReportEdit_soldDate']").val();
		}
		
	}
	
}
//TODO 保存
function saveAuditReport(flag){
//	var saveAuditReportList = auditCheckReportEditList.auditReportList;
	var saveAuditReportList = auditCheckReportEditList;
	var saveData = [];
	$.each(saveAuditReportList,function(i,saveAuditReportObject){
		var eachSaveData ={};
		//盘库报告ID
		eachSaveData.auditCheckReportId = saveAuditReportObject.auditCheckReportId;
		//车盘点状态--是否完成：0：未盘点  1.已盘点
		eachSaveData.vehicleFinishStatus = saveAuditReportObject.vehicleFinishStatus;
		//公里数抽查状态--是否抽查公里数（0：不抽查  1.抽查）
		eachSaveData.odomSelectiveFlag = saveAuditReportObject.odomSelectiveFlag;
		
		//车
		eachSaveData.auditResults = saveAuditReportObject.auditResults;
		//钥匙
		eachSaveData.keyAuditResult = saveAuditReportObject.keyAuditResult;
		//合格证
//		eachSaveData.qcAuditResult = saveAuditReportObject.qcAuditResult;
		
		//公里数
//		eachSaveData.odometer = saveAuditReportObject.odometer==null?"":saveAuditReportObject.odometer;
		eachSaveData.odometer = saveAuditReportObject.odometer;
		//备注
//		eachSaveData.remark = saveAuditReportObject.remark==null?"":saveAuditReportObject.remark;
		eachSaveData.remark = saveAuditReportObject.remark;
		//销售日期
		eachSaveData.soldDate = saveAuditReportObject.soldDate;
		//盘点方式--1:手动输入 2.扫码
		eachSaveData.auditMode = saveAuditReportObject.auditMode;
		//真实车架号
		eachSaveData.matchVinNo = saveAuditReportObject.matchVinNo;
		saveData.push(eachSaveData);
		
	});
	var auditCheckListId = session.get("auditCheckListId");
	var postData = {};
    postData.random = Math.random();
    postData.userCode = session.get("userCode");
    postData.saveData = JSON.stringify(saveData);
    postData.auditCheckListId = auditCheckListId;
    postData.useSameTaskIdFlag = session.get("useSameTaskIdFlag");
    postData.auditCheckListId = session.get("auditCheckListId");
    postData.dealerCode =  session.get("auditListDealerCode"); //经销商CODE
    postData.auditPlanDayId = session.get("auditPlanDayId");
    postData.flag = flag;
    
//	showLoading();
////	点击保存按钮
//	$.getJSON(basePath+"/app/auditReportEdit/saveAuditReport.xhtml"+callback, postData,function(msg){
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
		url: basePath+"/app/auditReportEdit/saveAuditReport.xhtml",
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
				
				if(flag !="BackPage"){
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

function submitAuditReport(){
//	var saveAuditReportList = auditCheckReportEditList.auditReportList;
	var saveAuditReportList = auditCheckReportEditList;
	var saveData = [];
	$.each(saveAuditReportList,function(i,saveAuditReportObject){
		var eachSaveData ={};
		//盘库报告ID
		eachSaveData.auditCheckReportId = saveAuditReportObject.auditCheckReportId;
		//车盘点状态--是否完成：0：未盘点  1.已盘点
		eachSaveData.vehicleFinishStatus = saveAuditReportObject.vehicleFinishStatus;
		//公里数抽查状态--是否抽查公里数（0：不抽查  1.抽查）
		eachSaveData.odomSelectiveFlag = saveAuditReportObject.odomSelectiveFlag;
		
		//车
		eachSaveData.auditResults = saveAuditReportObject.auditResults;
		//钥匙
		eachSaveData.keyAuditResult = saveAuditReportObject.keyAuditResult;
		//合格证
//		eachSaveData.qcAuditResult = saveAuditReportObject.qcAuditResult;
		
		//公里数
		eachSaveData.odometer = saveAuditReportObject.odometer;
		//备注
		eachSaveData.remark = saveAuditReportObject.remark;
		//销售日期
		eachSaveData.soldDate = saveAuditReportObject.soldDate;
		//盘点方式--1:手动输入 2.扫码
		eachSaveData.auditMode = saveAuditReportObject.auditMode;
		
		saveData.push(eachSaveData);
	});
	
	//全部/已盘/未盘/公里数抽查 按钮选中的值
//	var queryConditonVal = $('#audit_report_edit_page').find(".auditSegmentedButtonGroup .segmentedButtons4Selected").val();
	//车架号
//	var vinNoText = $('#audit_report_edit_page').find("#vinNoText").val();
	//盘点计划日ID
	var auditPlanDayId = session.get("auditPlanDayId");
	//useSameTaskIdFlag:是否使用sameTaskId或checkSameTaskId--0：未使用  1：使用sameTaskId 2：使用checkSameTaskId
	var useSameTaskIdFlag = session.get("useSameTaskIdFlag");
	
	var postData = {};
    postData.random = Math.random();
    postData.userCode = session.get("userCode");
    postData.auditCheckListId = session.get("auditCheckListId");
    postData.dasAuditReportId = session.get("dasAuditReportId");
//    if(queryConditonVal != "" && queryConditonVal != null){
//    	if(queryConditonVal == "已盘"){
//    		//vehicleFinishStatus ：是否完成（0：未盘点  1.已盘点）
//    		postData.vehicleFinishStatus = "1";
//    	}else if(queryConditonVal == "未盘"){
//    		//vehicleFinishStatus ：是否完成（0：未盘点  1.已盘点）
//    		postData.vehicleFinishStatus = "0";
//    	}else if(queryConditonVal == "公里数抽查"){
//    		//odomSelectiveFlag:是否抽查公里数(0：不抽查  1.抽查)
//    		postData.odomSelectiveFlag = "1";
//    	}
//    }
//    if(vinNoText != "" && vinNoText != null){
//    	postData.vinNo = vinNoText;
//    }
    postData.saveData = JSON.stringify(saveData);
    
    postData.auditPlanDayId = auditPlanDayId;
//    postData.dealerCode = session.get("dealerCode"); //经销商CODE
    postData.dealerCode = session.get("auditListDealerCode"); //经销商CODE
    postData.useSameTaskIdFlag = useSameTaskIdFlag;//useSameTaskIdFlag:是否使用sameTaskId或checkSameTaskId--0：未使用  1：使用sameTaskId 2：使用checkSameTaskId
    
//	showLoading();
////	点击保存按钮
//	$.getJSON(basePath+"/app/auditReportEdit/submitAuditReport.xhtml"+callback, postData,function(msg){
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
		url: basePath+"/app/auditReportEdit/submitAuditReport.xhtml",
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

//盘点人员最后位置距库房的距离是否在库房的有效范围
function auditorLastLocationAndStoreHouseDistance(userLastLocation,afterLoadingFunc){
		
//		var storeHouseLocationMap = JSON.parse(session.get("storeHouseLocationMap"));
		var storeHouseLocationJsonArr = JSON.parse(session.get("storeHouseLocationMap"));
		
		if($.isEmptyObject(userLastLocation) 
				|| userLastLocation.longitude == 0 || userLastLocation.latitude == 0
				|| userLastLocation.longitude == "" || userLastLocation.latitude == ""
				|| userLastLocation.longitude == null || userLastLocation.latitude == null
				|| userLastLocation.longitude == "null" || userLastLocation.latitude == "null"
				|| userLastLocation.longitude == undefined || userLastLocation.latitude == undefined){
//			showLoading("盘点员位置未取到，不能编辑盘点报告！");
//			showAuditEditLoading("盘点员位置未取到，不能编辑盘点报告！",auditEditLoadingDiv);
			showSaveConfirmLongPromptMsg.hide();
			var message = "盘点员位置未取到，不能编辑盘点报告，点击确认按钮，将返回前一页面！";
			showAuditReportBackPageConfirmMsg("确认信息",message,afterLoadingFunc);
			return;
			
		}else{
			if(storeHouseLocationJsonArr != null 
					&& storeHouseLocationJsonArr.length > 0){
				
				// 盘库库房有效范围
				var commonDistance = session.get("auditStorehouseValidDistance");;
				//库房坐标是否设置（0：存在库房坐标 1：库房的所有坐标都未设置）
				var storeHouseLocationExistFlag = 1;
				//盘库库房有效范围及盘点人员距离库房的距离是否同时存在（0：存在  1：不存在）
				var auditDistanceExistFlag = 1;
				//是否在库房的有效范围内（0:存在坐标在有效返回内  1：所有坐标都不在有效范围内）--盘库时一个库房可能分为几块，设置多个坐标
				var auditDistanceFlag = 1;
				
				for(var i=0;i<storeHouseLocationJsonArr.length;i++){
					var storeHouseLocationMap = storeHouseLocationJsonArr[i];
					
					if(!$.isEmptyObject(storeHouseLocationMap) 
							&& storeHouseLocationMap.longitude != 0 && storeHouseLocationMap.latitude != 0
							&& storeHouseLocationMap.longitude != "" && storeHouseLocationMap.latitude != ""
							&& storeHouseLocationMap.longitude != null && storeHouseLocationMap.latitude != null
							&& storeHouseLocationMap.longitude != undefined && storeHouseLocationMap.latitude != undefined){
						//库房坐标是否设置（0：存在库房坐标 1：库房的所有坐标都未设置）
						storeHouseLocationExistFlag = 0;
						
						// 盘点员距离库房的距离
						var distance = auditCalculateDistance(userLastLocation,storeHouseLocationMap);
						if(distance != null && commonDistance != null){
							//盘库库房有效范围及盘点人员距离库房的距离是否同时存在（0：存在  1：不存在）
							auditDistanceExistFlag = 0;
							//盘点员在库房的有效范围内
							if(distance < commonDistance){
								//是否在库房的有效范围内（0:存在坐标在有效返回内  1：所有坐标都不在有效范围内）--盘库时一个库房可能分为几块，设置多个坐标
								auditDistanceFlag = 0;
								showHide();
								break;
							}
						}
					}
				}
				
				//库房坐标是否设置（0：存在库房坐标 1：库房的所有坐标都未设置）
				if(storeHouseLocationExistFlag == 1){
//					showLoading("库房坐标未设置，不能编辑盘点报告！");
//					showAuditEditLoading("库房坐标未设置，不能编辑盘点报告！",auditEditLoadingDiv);
					showSaveConfirmLongPromptMsg.hide();
					var message = "库房坐标未设置，不能编辑盘点报告，点击确认按钮，将返回前一页面！";
					showAuditReportBackPageConfirmMsg("确认信息",message,afterLoadingFunc);
					return;
				}
				if(auditDistanceExistFlag == 1){
//					showLoading("盘点员位置未取到或网络连接出错，不能编辑盘点报告！");
//					showAuditEditLoading("盘点员位置未取到或网络连接出错，不能编辑盘点报告！",auditEditLoadingDiv);
					showSaveConfirmLongPromptMsg.hide();
					var message = "盘点员位置未取到或网络连接出错，不能编辑盘点报告，点击确认按钮，将返回前一页面！";
					showAuditReportBackPageConfirmMsg("确认信息",message,afterLoadingFunc);
					return;
				}
				//是否在库房的有效范围内（0:存在坐标在有效返回内  1：所有坐标都不在有效范围内）--盘库时一个库房可能分为几块，设置多个坐标
				if(auditDistanceFlag == 1){
//					showLoading("盘点员距离库房超过"+commonDistance+"米,不在经销商的有效范围内,不能编辑盘点报告！");
//					showAuditEditLoading("盘点员距离库房超过"+commonDistance+"米,不在经销商的有效范围内,不能编辑盘点报告！",auditEditLoadingDiv);
					showSaveConfirmLongPromptMsg.hide();
					var message = "盘点员距离库房超过"+commonDistance+"米,不在经销商的有效范围内,不能编辑盘点报告，点击确认按钮，将返回前一页面！";
					showAuditReportBackPageConfirmMsg("确认信息",message,afterLoadingFunc);
					return;
				}
			}else{
//				showLoading("库房坐标未设置，不能编辑盘点报告！");
//				showAuditEditLoading("库房坐标未设置，不能编辑盘点报告！",auditEditLoadingDiv);
				showSaveConfirmLongPromptMsg.hide();
				var message = "库房坐标未设置，不能编辑盘点报告，点击确认按钮，将返回前一页面！";
				showAuditReportBackPageConfirmMsg("确认信息",message,afterLoadingFunc);
				return;
			}
		} 
//		var func = function(distance){
////			var commonDistance = ConstDef.getConstant("AUDIT_USER_STOREHOUSE_DISTANCE");
//			var commonDistance = session.get("auditStorehouseValidDistance");
//			if(distance != null && commonDistance != null){
//				if(distance > commonDistance){
//					showLoading("盘点员距离库房超过"+commonDistance+"米,不在经销商的有效范围内,不能编辑盘点报告!");
//				}else{
//					showHide();
//				}
//			}else{
//				showMessage("盘点员位置未取到或网络连接出错，不能编辑盘点报告！",'2000');
//			}
//			
//		}
		
//		if(!$.isEmptyObject(userLastLocation) 
//			&& userLastLocation.longitude !== 0 && userLastLocation.latitude !== 0
//			&& userLastLocation.longitude !== "" && userLastLocation.latitude !== ""
//			&& userLastLocation.longitude !== null && userLastLocation.latitude !== null
//			&& userLastLocation.longitude !== undefined && userLastLocation.latitude !== undefined
//			&& !$.isEmptyObject(storeHouseLocationMap)
//			&& storeHouseLocationMap.longitude !== 0 && storeHouseLocationMap.latitude !== 0
//			&& storeHouseLocationMap.longitude !== "" && storeHouseLocationMap.latitude !== ""
//			&& storeHouseLocationMap.longitude !== null && storeHouseLocationMap.latitude !== null
//			&& storeHouseLocationMap.longitude !== undefined && storeHouseLocationMap.latitude !== undefined){
//			
//			auditCalculateDistance(userLastLocation,storeHouseLocationMap,func);
//		}else{
//			showLoading("盘点员位置未取到，不能编辑盘点报告！");
//		}
		
}

//
function auditCalculateDistance(startLocationMap,endLocationMap,func){
	var lineArr = new Array();
//	lineArr.push([113.402185,24.185521]);
//	lineArr.push([113.402282,24.185374]);
	
//	alert("startLocationMap:"+JSON.stringify(startLocationMap)+"   endLocationMap:"+JSON.stringify(endLocationMap));
    lineArr.push([startLocationMap.longitude,startLocationMap.latitude]);//[经度，纬度]
    lineArr.push([endLocationMap.longitude,endLocationMap.latitude]);//[经度，纬度]
	
	var polyline = new AMap.Polyline({
		path:lineArr
	});
	//	polyline.setPath(lineArr);
	var distance = polyline.getLength();
	
//	func(distance);
	return distance;
}

function auditReportEditBackPage(oper){
	//如果网络是连通的
	if(isNetworkConnected1()){
		//自动保存盘库数据
		saveAuditReport("BackPage");
		auditCheckReportEditList = [];
		auditResultsDictionaryList = [];
		keyAuditResultDictionaryList = [];
		
		hideMyDialog(oper);
		oper.find(".promptMsg").html("");
		
		//清除定时器
		clearInterval(auditorAndStoreHouseDistanceInterval);
		back_page();
	}else{
		showAuditReportMessage('目前离线，请恢复网络后再试！',oper,auditReportEditBackPage,2000)
	}
}


//扫码回调
function onScanCodeFinish(photo,src){
	showLoading();
	var vinNo = src;
	if(vinNo!=null||vinNo!=""){
		$('#audit_report_edit_page').find("#vinNoText").val(vinNo);
		var queryConditonVal = $('#audit_report_edit_page').find(".auditSegmentedButtonGroup .segmentedButtons4Selected").val();
		queryAuditReportEdit(queryConditonVal);
		var businessId = $(".ListRow [identity='auditCheckReportId']").text();
		if(businessId!=null&&businessId!=""){
			sweepCodePicturesEdit_uploadPictures(businessId,photo);
		}
	}
}

//保存扫码截图
function sweepCodePicturesEdit_uploadPictures(businessId,photo){
	
	//声明一个数组用来存放图片
	var savePhoto = [];
	
	var postData = {};
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	postData.businessId = businessId;
	postData.businessType = ConstDef.getConstant("BUSINESS_CATEGORY_AUDIT");
	postData.functionFlag = 5;
	
	var formData = new FormData();//定义要上传的催记数据的存储
	formData.append("userCode",postData.userCode);
	formData.append("businessId",postData.businessId);
	formData.append("businessType",postData.businessType);
	formData.append("functionFlag",postData.functionFlag);

	//如果是新拍的照片，则上传文件 
	var file = dataURItoBlob(photo);
	formData.append("img", file);
	formData.append("newFiles",uuid());
		
	//如果网络是连通的
	if(isNetworkConnected()){

		//上传催记数据
		$.ajax({
			url: basePath+"/app/commonBusinessPicturesEdit/uploadPictures.xhtml", //这个地址做了跨域处理
			data: formData,
			processData: false,
			contentType: false,
			type: 'POST',
			dataType: 'json',
			async:true,
			beforeSend: function () {
				showLoading();
			},
			success: function (msg) {

				showHide();

				if($.trim(msg.returnCode) == '0') {

					if(msg.data){
						if(msg.data.result == "success"){
						}
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
}
