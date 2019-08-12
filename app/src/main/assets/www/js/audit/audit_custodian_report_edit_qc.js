var audit_custodian_report_edit_qc_page = $('#audit_custodian_report_edit_qc_page');

var audit_custodian_report_edit_qc_myScroll;

var custodianQcAuditorAndStoreHouseDistanceInterval;//判断盘点员与监管单位的距离的定时器

var custodianAuditCheckReportEditList_qc;   //盘点报告列表list--合格证盘点
var filterAuditCustodianReportQcList;//根据条件查询后的盘点报告列表list
var custodianQcAuditResultDictionaryList_qc;//盘点报告合格证状态

var auditCustodianReportEditQc_totalNum = 0; //总车辆台数
var auditCustodianReportEditQc_qcFinishNum = 0;  //合格证已盘车辆数量
var auditCustodianReportEditQc_qcUnFinishNum = 0;  //合格证未盘车辆数量
var auditCustodianReportEditQc_auditListStatus = ""; //盘点清单状态
/******************************audit_custodian_report_edit_qc_page---begin**************************************/
audit_custodian_report_edit_qc_page.live('pageinit',function(e,ui){
	
	var wrapper = "audit_custodian_report_edit_qc_wrapper";
	var up = "audit_custodian_report_edit_qc_pullUp";
	var down = "audit_custodian_report_edit_qc_pullDown";
	audit_custodian_report_edit_qc_myScroll = createMyScroll(wrapper,up,down);
	
	custodianAuditCheckReportEditList_qc = [];
	filterAuditCustodianReportQcList = [];
	custodianQcAuditResultDictionaryList_qc = [];
	
	//回退事件处理
	audit_custodian_report_edit_qc_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		//如果网络是连通的
		if(isNetworkConnected1()){
			showConfirmBackpage("请确认盘点数据是否已保存，否则数据会丢失", function(){
				custodianAuditCheckReportEditList_qc = [];
				filterAuditCustodianReportQcList = [];
				custodianQcAuditResultDictionaryList_qc = [];
				//清除判断盘点员与监管单位的距离的定时器
				clearInterval(custodianQcAuditorAndStoreHouseDistanceInterval);
				
				auditCustodianReportEditQc_totalNum = 0; //总车辆台数
				auditCustodianReportEditQc_qcFinishNum = 0;  //合格证已盘车辆数量
				auditCustodianReportEditQc_qcUnFinishNum = 0;  //合格证未盘车辆数量
				auditCustodianReportEditQc_auditListStatus = ""; //盘点清单状态
				
				//初始化分页
				currentPage = 1;
				hasData = true;
				
				back_page();
			});
			
		}else{
			showMessage('目前离线，请恢复网络后再试！','2000');
		}
		
	});
	
//	//点击遮罩层事件处理
//	$("#custodianAuditEditLoadingDivMaskLayer,#custodianAuditEditLoadingDiv").live("tap",function(event){
//		event.stopPropagation();
//		//如果网络是连通的
//		if(isNetworkConnected1()){
//			//自动保存监管单位盘库的数据
//			//盘点清单状态auditListStatus-- 0.未办 1.已办(正常完成任务) 2.跳过 3.进行中 4.DAS端完成 5.完成（更多按钮选项完成）
//			if(auditCustodianReportEditQc_auditListStatus != "" 
//				&& auditCustodianReportEditQc_auditListStatus != 0){
//				saveAuditCustodianReportQc();
//			}
//			
//			custodianAuditCheckReportEditList_qc = [];
//			filterAuditCustodianReportQcList = [];
//			custodianQcAuditResultDictionaryList_qc = [];
//			//清除判断盘点员与监管单位的距离的定时器
////			clearInterval(custodianQcAuditorAndStoreHouseDistanceInterval);
//			
//			auditCustodianReportEditQc_totalNum = 0; //总车辆台数
//			auditCustodianReportEditQc_qcFinishNum = 0;  //合格证已盘车辆数量
//			auditCustodianReportEditQc_qcUnFinishNum = 0;  //合格证未盘车辆数量
//			auditCustodianReportEditQc_auditListStatus = ""; //盘点清单状态
//			//初始化分页
//			currentPage = 1;
//			hasData = true;
//			
//			back_page();
//		}else{
//			showMessage('目前离线，请恢复网络后再试！','2000');
//		}
//	});
		
	//保存按钮处理
	audit_custodian_report_edit_qc_page.find(".SaveBtn1").live("tap",function(event){
		event.stopPropagation();
		//盘点清单状态auditListStatus-- 0.未办 1.已办(正常完成任务) 2.跳过 3.进行中 4.DAS端完成 5.完成（更多按钮选项完成）
		if(auditCustodianReportEditQc_auditListStatus != "" 
			&& auditCustodianReportEditQc_auditListStatus != 0){
			saveAuditCustodianReportQc("SaveBtn");
		}else{
			showMessage("当前经销商的盘点任务未开始，不能保存盘点报告",'5000');
		}
		
	});
	
	//点击 全部/已盘/未盘按钮，检索满足条件的车辆信息显示到页面
	audit_custodian_report_edit_qc_page.find(".auditSegmentedButtonGroup input[type='button']").live("tap",function(event){
		event.stopPropagation();
		var audiSelectedBtn = $('#audit_custodian_report_edit_qc_page').find(".auditSegmentedButtonGroup .segmentedButtons3Selected");
		audiSelectedBtn.removeClass("segmentedButtons3Selected");
		audiSelectedBtn.addClass("segmentedButtons3Unselected");
		$(this).removeClass("segmentedButtons3Unselected");
		$(this).addClass("segmentedButtons3Selected");
		//初始化分页
		currentPage = 1;
		hasData = true;
		//清空盘点报告数据列表
		var page = $('#audit_custodian_report_edit_qc_page');
		page.find(".auditCustodianReportEditContentDiv .auditCustodianReportEditList").empty();
		//查询盘点报告
		var queryConditonVal = $(this).val();
		queryCustodianAuditReportEdit_qc(queryConditonVal);
	});
	
	//点击数字键盘
	audit_custodian_report_edit_qc_page.find(".auditReportEditNumericKeyboardNumber").live("tap",function(event){
		//查询盘点报告
		var numericKeyboardVal = $(this).val();
		var $vinNoText = $('#audit_custodian_report_edit_qc_page').find(".vinNoTextCustodianQcDiv #vinNoText_custodianQc");
		var vinNoText = $vinNoText.val();
		vinNoText += numericKeyboardVal;
		$vinNoText.val(vinNoText.substring(0,17));
		if($vinNoText.val().length >= 4){
			//初始化分页
			currentPage = 1;
			hasData = true;
			//清空盘点报告数据列表
			var page = $('#audit_custodian_report_edit_qc_page');
			page.find(".auditCustodianReportEditContentDiv .auditCustodianReportEditList").empty();
			
			var queryConditonVal = $('#audit_custodian_report_edit_qc_page').find(".auditSegmentedButtonGroup .segmentedButtons3Selected").val();
			queryCustodianAuditReportEdit_qc(queryConditonVal);
		}
		
		event.stopPropagation();
	});
	
	//点击删除按钮，删除检索条件车架号文本框中的1个字符，然后进行模糊查询
	audit_custodian_report_edit_qc_page.find("#deleteVinNo_qc").live("tap",function(event){
		//查询盘点报告
		var $vinNoText = $('#audit_custodian_report_edit_qc_page').find(".vinNoTextCustodianQcDiv #vinNoText_custodianQc");
		var vinNoText = $vinNoText.val();
		$vinNoText.val(vinNoText.substring(0,vinNoText.length-1));
		if($vinNoText.val().length >= 4){
			//初始化分页
			currentPage = 1;
			hasData = true;
			//清空盘点报告数据列表
			var page = $('#audit_custodian_report_edit_qc_page');
			page.find(".auditCustodianReportEditContentDiv .auditCustodianReportEditList").empty();
			
			var queryConditonVal = $('#audit_custodian_report_edit_qc_page').find(".auditSegmentedButtonGroup .segmentedButtons3Selected").val();
			queryCustodianAuditReportEdit_qc(queryConditonVal);
		}
		event.stopPropagation();
	});
	
	//点击清除按钮，删除检索条件车架号文本框中的所有字符，然后进行模糊查询
	audit_custodian_report_edit_qc_page.find("#auditReportClearVinNoBtn_qc").live("tap",function(event){
		event.stopPropagation();
		//查询盘点报告
		var $vinNoText = $('#audit_custodian_report_edit_qc_page').find(".vinNoTextCustodianQcDiv #vinNoText_custodianQc");
		$vinNoText.val("");
	});
	
	//点击批量设置合格证状态
	audit_custodian_report_edit_qc_page.find("#auditCustodianReportEditQc_batchSetQcStatus")
			.live("tap", function(event) {
				
		var batchSetId = $(this).attr("id");
		batchSetStatus_custodianQc(batchSetId);
	});

	//点击显示、隐藏数字键盘
	audit_custodian_report_edit_qc_page.find("#auditCustodianReportEditQc_numericKeyboard")
			.live("tap",function(event){
				
		$("#audit_custodian_report_edit_qc_page").find("div.audiCustodianReportEditNumericKeyboard").toggle();
	});

});//end pageinit


audit_custodian_report_edit_qc_page.live('pageshow',function(e, ui){

	var page = $('#audit_custodian_report_edit_qc_page');
	currentLoadActionName  = "audit_custodian_report_edit_qc_load_content";
	
	var fromPage = session.get("fromPage");
	if(fromPage != "common_business_pictures_edit_page" 
		&& fromPage != "common_business_pictures_view_page"){
		
		auditCustodianReportEditQc_totalNum = 0; //总车辆台数
		auditCustodianReportEditQc_qcFinishNum = 0;  //合格证已盘车辆数量
		auditCustodianReportEditQc_qcUnFinishNum = 0;  //合格证未盘车辆数量
		
		//初始化分页
		currentPage = 1;
		hasData = true;
		//清空盘点报告数据列表
		page.find(".auditCustodianReportEditContentDiv .auditCustodianReportEditList").empty();
		
		//查询提示消息列表
		load_audit_custodian_report_edit_qc_content();
	}else{
		// 获取当前页的index
		var scrollCurrentElementIndex = 0;
 	    var scrollNowPage = session.get("nowPage");
 	    if(!$.isEmptyObject(scrollMap)){
 	    	var commonScrollMapJsonObj = scrollMap[scrollNowPage];
 	    	if(commonScrollMapJsonObj != null && typeof(commonScrollMapJsonObj) != "undefined"){
 	    		commonScrollMapJsonObj = JSON.parse(commonScrollMapJsonObj);
// 	 	 	    scrollCurrentElementIndex = commonScrollMapJsonObj.scrollCurrentElementIndex-1;
 	 	 	    scrollCurrentElementIndex = commonScrollMapJsonObj.scrollCurrentElementIndex;
 	 	    	//删除Json数据中的scrollNowPage属性  
 	 	        delete scrollMap[scrollNowPage]; 
 	    	}
 	    }
		var scrollCurrentElement = page.find(".auditCustodianReportEditList .auditCustodianReportEditListItem").get(scrollCurrentElementIndex);
		audit_custodian_report_edit_qc_myScroll.refresh();//刷新iScroll
		audit_custodian_report_edit_qc_myScroll.scrollToElement(scrollCurrentElement,0);
	}
	
});//end pageshow

function audit_custodian_report_edit_qc_load_content(){
	//下拉不刷新，则该方法置空
	if(hasData){
		//如果还有数据则加载
//		var queryConditonVal = $('#audit_custodian_report_edit_qc_page').find(".auditSegmentedButtonGroup .segmentedButtons3Selected").val();
//		queryCustodianAuditReportEdit_qc(queryConditonVal);
		pullDownAuditCustodianReportEditQc();
	}
}

//初始化盘点报告页面
function load_audit_custodian_report_edit_qc_content(){
	var page = $('#audit_custodian_report_edit_qc_page');
	var $auditReportList = page.find(".auditCustodianReportEditContentDiv .auditCustodianReportEditList");
//	$auditReportList.empty();
	
	var auditReportStatisticsNumFont = page.find(".custodianAuditReportStatisticsNum_qc font");
	auditReportStatisticsNumFont.text("0");
	
	var $auditSegmentedButtonGroup = page.find(".auditSegmentedButtonGroup input");
	$auditSegmentedButtonGroup.removeClass("segmentedButtons3Selected");
	$auditSegmentedButtonGroup.addClass("segmentedButtons3Unselected");
	
	var $auditReportTotalBtn = page.find(".auditSegmentedButtonGroup #custodianAuditReportTotalBtn_qc");
	$auditReportTotalBtn.removeClass("segmentedButtons3Unselected");
	$auditReportTotalBtn.addClass("segmentedButtons3Selected");
	
	var $vinNoText = page.find("#vinNoText_custodianQc");
	$vinNoText.val("");
	//数字键盘默认显示
	page.find("div.audiCustodianReportEditNumericKeyboard").css("display","");
	
	showLoading();
	var postData = {};
    postData.random = Math.random();
    setScroll(postData);//设置分页开始结束位置
    postData.auditCheckListId = session.get("auditCheckListId");//盘点清单ID
    postData.dealerCode = session.get("auditCustodianDealerList_dealerCode");//当前选中的经销商code
    postData.auditPlanDate = session.get("auditPlanDate");//盘点日期
    postData.auditPlanDayId = session.get("auditPlanDayId");//盘点计划日ID
    postData.auditorId = session.get("auditorId");//盘点人员user_id
	postData.userCode = session.get("userCode"); 
    
	$.getJSON(basePath+"/app/auditCustodianReportEditQc/pageInit.xhtml"+callback, postData,function(msg){
		if($.trim(msg.returnCode) == '0'){
			auditCustodianReportEditQc_totalNum = 0; //总车辆台数
			auditCustodianReportEditQc_qcFinishNum = 0;  //合格证已盘车辆数量
			auditCustodianReportEditQc_qcUnFinishNum = 0;  //合格证未盘车辆数量
			
			var data = msg.data;
			custodianAuditCheckReportEditList_qc = data.auditReportList;//将初始化数据保存到全局变量数组中
			//不能直接让filterAuditCustodianReportQcList=custodianAuditCheckReportEditList_qc，这样的话其中一个数组值改变，另一个也会变
			filterAuditCustodianReportQcList = custodianAuditCheckReportEditList_qc.slice(0);
			//盘点清单状态auditListStatus-- 0.未办 1.已办(正常完成任务) 2.跳过 3.进行中 4.DAS端完成 5.完成（更多按钮选项完成）
			auditCustodianReportEditQc_auditListStatus = data.auditListStatus;
			
			if(data.result == 1){
				 if(data.auditReportList !=null 
						 && data.auditReportList.length != 0){
				    	//盘点报告初始化
				    	//盘点报告合格证状态
				    	custodianQcAuditResultDictionaryList_qc = data.qcAuditResultDictionaryList;
				    	//批量设置时，加载字典表中盘点报告合格证状态
				    	loadInitResultsBatchSet_custodianQc(custodianQcAuditResultDictionaryList_qc);
				    	
				    	//加载盘点报告列表
				    	var auditReportList = data.auditReportList;
				    	
						var $template = $("#audit_custodian_report_edit_qc_page .list-row-template");
						$.each(auditReportList,function(i,n){
							if(i>=postData.sindex-1 && i <= postData.eindex-1){
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
								
			                  //用于返回该页面时计算选项的index
			    	            $item.attr("scrollCurrentPage",currentPage);
			    	            $item.attr("scrollCurrentElementNum",i);
			    	            
								var $auditReportEditPhotoBtn = $item.find(".ListTit a.auditReportEditPhotoBtn");
								$auditReportEditPhotoBtn.bind("tap",function(event){
									event.stopPropagation();
									//如果网络是连通的
									if(isNetworkConnected1()){
										//设置当前选项的index到session中
//										var scrollCurrentElementIndex = 0;
//										var scrollCurrentElementNum = $item.attr("scrollCurrentElementNum");
//										var scrollCurrentPage = $item.attr("scrollCurrentPage");
//										var pageDisplayCount = session.get("pageDisplayCount");
//									    var pageAddCount = session.get("pageAddCount");
//									    if(scrollCurrentPage <= 1){
//										   	scrollCurrentElementIndex = parseInt(scrollCurrentElementNum)+1;
//									    }else{
//									    	scrollCurrentElementIndex = parseInt(pageDisplayCount)+((parseInt(scrollCurrentPage)-2)*parseInt(pageAddCount))+parseInt(scrollCurrentElementNum)+1;
//									    }
										var scrollCurrentElementNum = $item.attr("scrollCurrentElementNum");
										var scrollCurrentElementIndex = scrollCurrentElementNum;
										var scrollMapJSON = {};
										scrollMapJSON.scrollCurrentElementIndex = scrollCurrentElementIndex;
										scrollMap.audit_custodian_report_edit_qc_page = JSON.stringify(scrollMapJSON);
										
										var auditCheckReportId = $(this).parents(".auditCustodianReportEditListItem").find("[identity='auditCheckReportId']").text();
										auditCustodianReportEditQcPhotoBtn(auditCheckReportId);
									}else{
										showMessage('目前离线，请恢复网络后再试！','2000');
									}
								});
								
								var $auditReportEditConfirmBtn = $item.find(".ListTit a.auditReportEditConfirmBtn");
								$auditReportEditConfirmBtn.bind("tap",function(event){
									event.stopPropagation();
									auditCustodianReportEditQcConfirm(this,"ConfirmBtn");
								});
								
								var $auditReportEditQcRemarkInput = $item.find("input[name='auditCustodianReportEditQc_remark']");
								$auditReportEditQcRemarkInput.keyup(function(){
									event.stopPropagation();
									auditCustodianReportEditQcConfirm(this,"Remark");
								});
								
								//合格证盘点状态--qcFinishStatus：是否完成（0：未盘点  1.已盘点）
								if(n.qcFinishStatus == 1){
									$item.find(".CauseDiv").css("color","red");
								}else{
									n.qcFinishStatus = 0;
								}
								
								//加载字典表中盘点报告合格证状态
								loadInitCustodianQcAuditResult_qc($item,"auditCustodianReportEditQc_qcStatus",custodianQcAuditResultDictionaryList_qc,
										n.qcAuditResult,"SingleSet");
								
								dataBindToElement($item,n);
								
								$item.removeClass("list-row-template");
								$item.css("display","");
								$auditReportList.append($item);
							}
							
							//合格证盘点状态--qcFinishStatus：是否完成（0：未盘点  1.已盘点）
							if(n.qcFinishStatus == 1){
								auditCustodianReportEditQc_qcFinishNum += 1;
							}else{
								n.qcFinishStatus = 0;
								auditCustodianReportEditQc_qcUnFinishNum += 1;
							}
						});//end $.each
						
						auditCustodianReportEditQc_totalNum = auditReportList.length;
		            	showHide();
		            	
		            	//判断该列表是否已无数据
		            	if (!hasPage(auditReportList.length-postData.sindex)) {
		            		hasData = false;
		            		//无数据时结束分页滚动
		            		endScroll(audit_custodian_report_edit_qc_myScroll);
		            	}
		            	
		            	//是否测试模式 1:开启 0:关闭
		            	if (session.get("testMode") != "1") {
		            		//人员最后位置距库房的距离
		            		custodianAuditorLastLocationAndCustodianDistance(userLastLocation,auditCustodianReportEditQcBackPage);
		                	//循环查询盘库人员盘库时距离库房的距离限制的间隔时间（10000ms）
		                	var custodianAuditReportEditQc_intervalTime = session.get("auditCustodianValidDistanceInterval");
		                 	custodianQcAuditorAndStoreHouseDistanceInterval = setInterval(function(){
		                 		custodianAuditorLastLocationAndCustodianDistance(userLastLocation,auditCustodianReportEditQcBackPage);
		                 	}, custodianAuditReportEditQc_intervalTime);
		            	}
				    } else {
				    	showHide();
		            	showMessage('暂无数据','2000');	
				    	hasData = false;
		            	//无数据时结束分页滚动
		        		endScroll(audit_custodian_report_edit_qc_myScroll);
				    }
			}else{
				showHide();
            	showMessage(msg.message,'5000');
			}
		   
		    //设置总台数、合格证已盘、合格证未盘、抽查公里数、车已盘的车辆数量
			page.find("#auditCustodianReportEditQc_totalNum font").text(auditCustodianReportEditQc_totalNum);
			page.find("#auditCustodianReportEditQc_qcFinishNum font").text(auditCustodianReportEditQc_qcFinishNum);
			page.find("#auditCustodianReportEditQc_qcUnFinishNum font").text(auditCustodianReportEditQc_qcUnFinishNum);
    	}else{
	    	showHide();
	    	errorHandler(msg.returnCode,msg.message);
	    	hasData = false;
        	//无数据时结束分页滚动
    		endScroll(audit_custodian_report_edit_qc_myScroll);
	    }
		
	});//end $.getJSON
}

//查询盘点报告
function queryCustodianAuditReportEdit_qc(queryConditonVal){
	showLoading();
	
	var page = $('#audit_custodian_report_edit_qc_page');
	var $auditReportList = page.find(".auditCustodianReportEditContentDiv .auditCustodianReportEditList");
//	$auditReportList.empty();
	
	var auditReportStatisticsNumFont = page.find(".custodianAuditReportStatisticsNum_qc font");
	auditReportStatisticsNumFont.text("0");
	
	var $qcFinishStatus = "";
    
    auditCustodianReportEditQc_totalNum = 0; //总车辆台数
	auditCustodianReportEditQc_qcFinishNum = 0;  //合格证已盘车辆数量
	auditCustodianReportEditQc_qcUnFinishNum = 0;  //合格证未盘车辆数量
	
	//不能直接让filterAuditCustodianReportQcList=custodianAuditCheckReportEditList_qc，这样的话其中一个数组值改变，另一个也会变
	filterAuditCustodianReportQcList = custodianAuditCheckReportEditList_qc.slice(0);
   
    //1.统计总台数、合格证已盘、合格证未盘、抽查公里数、车已盘、车未盘车辆数
    //2.将不符合查询条件的数据从filterAuditCustodianReportQcList数组中删除,数组元素对象数量会减少
    var flag = true;
    for(var i=0; i < filterAuditCustodianReportQcList.length; flag ? i++ : i){
    	var filterAuditReportObject = filterAuditCustodianReportQcList[i];
    	 
    	//1.统计总台数、合格证已盘、合格证未盘、抽查公里数、车已盘、车未盘车辆数
		//合格证盘点状态--qcFinishStatus：是否完成（0：未盘点  1.已盘点）
		if(filterAuditReportObject.qcFinishStatus == 1){
			auditCustodianReportEditQc_qcFinishNum += 1;
		}else{
			auditCustodianReportEditQc_qcUnFinishNum += 1;
		}
		
		//2.将不符合查询条件的数据从filterAuditCustodianReportQcList数组中删除
		var queryFlag = true;//查询条件查询flag--true:没有从数组删除数据 false:从数组删除数据
    	if(queryConditonVal != "" && queryConditonVal != null){
    		if(queryConditonVal == "已盘"){
        		//合格证盘点状态：qcFinishStatus --是否完成（0：未盘点  1.已盘点）
        		$qcFinishStatus = "1";
        	}else if(queryConditonVal == "未盘"){
        		//合格证盘点状态：qcFinishStatus -- 是否完成（0：未盘点  1.已盘点）
        		$qcFinishStatus = "0";
        	}
    		
    		if($qcFinishStatus != null && $qcFinishStatus != ''){
            	if(filterAuditReportObject.qcFinishStatus != $qcFinishStatus){
            		filterAuditCustodianReportQcList.splice(i,1);
            		queryFlag = false;
            	}else{
            		queryFlag = true;
            	}
            }
    	}
    	
    	var vinNoFlag = true;//车架号查询flag--true:没有从数组删除数据 false:从数组删除数据
    	if(queryFlag != false){
    		 // 车架号
    	    var $vinNo = page.find("#vinNoText_custodianQc").val();
        	if($vinNo != null && $vinNo != ''){
        		var $vinNoLength = $vinNo.length;
        		var filterAuditReportVinNo = filterAuditReportObject.vinNo;
        		var filterVinNoLength = filterAuditReportVinNo.length;
        		if(filterVinNoLength >= $vinNoLength){
        			var filterVinNoStr = filterAuditReportVinNo.substring(filterVinNoLength-$vinNoLength,filterVinNoLength);
            		if( filterVinNoStr != $vinNo){
            			filterAuditCustodianReportQcList.splice(i,1);
            			vinNoFlag = false;
            		}else{
            			vinNoFlag = true;
                	}
        		}else{
        			filterAuditCustodianReportQcList.splice(i,1);
        			vinNoFlag = false;
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
	var auditReportList = filterAuditCustodianReportQcList;
    if(auditReportList !=null){
    	var postData = {};
        setScroll(postData);//设置分页开始结束位置
        
    	//加载盘点报告列表
		var $template = $("#audit_custodian_report_edit_qc_page .list-row-template");
		$.each(auditReportList,function(i,n){
			if(i>=postData.sindex-1 && i <= postData.eindex-1){
				
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
	            
	            //用于返回该页面时计算选项的index
	            $item.attr("scrollCurrentPage",currentPage);
	            $item.attr("scrollCurrentElementNum",i);
				
				var $auditReportEditPhotoBtn = $item.find(".ListTit a.auditReportEditPhotoBtn");
				$auditReportEditPhotoBtn.bind("tap",function(event){
					event.stopPropagation();
					//如果网络是连通的
					if(isNetworkConnected1()){
						//设置当前选项的index到session中
//						var scrollCurrentElementIndex = 0;
//						var scrollCurrentElementNum = $item.attr("scrollCurrentElementNum");
//						var scrollCurrentPage = $item.attr("scrollCurrentPage");
//						var pageDisplayCount = session.get("pageDisplayCount");
//					    var pageAddCount = session.get("pageAddCount");
//					    if(scrollCurrentPage <= 1){
//						   	scrollCurrentElementIndex = parseInt(scrollCurrentElementNum)+1;
//					    }else{
//					    	scrollCurrentElementIndex = parseInt(pageDisplayCount)+((parseInt(scrollCurrentPage)-2)*parseInt(pageAddCount))+parseInt(scrollCurrentElementNum)+1;
//					    }
						
						var scrollCurrentElementNum = $item.attr("scrollCurrentElementNum");
					    var scrollCurrentElementIndex = scrollCurrentElementNum;
						var scrollMapJSON = {};
						scrollMapJSON.scrollCurrentElementIndex = scrollCurrentElementIndex;
						scrollMap.audit_custodian_report_edit_qc_page = JSON.stringify(scrollMapJSON);
						
						var auditCheckReportId = $(this).parents(".auditCustodianReportEditListItem").find("[identity='auditCheckReportId']").text();
						auditCustodianReportEditQcPhotoBtn(auditCheckReportId);
					}else{
						showMessage('目前离线，请恢复网络后再试！','2000');
					}
				});
				
				var $auditReportEditConfirmBtn = $item.find(".ListTit a.auditReportEditConfirmBtn");
				$auditReportEditConfirmBtn.bind("tap",function(event){
					event.stopPropagation();
					auditCustodianReportEditQcConfirm(this,"ConfirmBtn");
				});
				
				var $auditReportEditQcRemarkInput = $item.find("input[name='auditCustodianReportEditQc_remark']");
				$auditReportEditQcRemarkInput.keyup(function(){
					event.stopPropagation();
					auditCustodianReportEditQcConfirm(this,"Remark");
				});
				//qcFinishStatus ：是否完成（0：未盘点  1.已盘点）
				if(n.qcFinishStatus == 1){
					$item.find(".CauseDiv").css("color","red");
				}
				
				//加载字典表中盘点报告合格证状态
				loadInitCustodianQcAuditResult_qc($item,"auditCustodianReportEditQc_qcStatus",custodianQcAuditResultDictionaryList_qc,
						n.qcAuditResult,"SingleSet");
				
				dataBindToElement($item,n);
				$item.removeClass("list-row-template");
				$item.css("display","");
				$auditReportList.append($item);
			
			}
		});//end $.each
		
		//判断该列表是否已无数据
    	if (!hasPage(auditReportList.length-postData.sindex)) {
    		hasData = false;
    		//无数据时结束分页滚动
    		endScroll(audit_custodian_report_edit_qc_myScroll);
    	}
    	
    	showHide();
    } else {
    	showHide();
//            	showMessage('暂无数据','1500');	
    	hasData = false;
		//无数据时结束分页滚动
		endScroll(audit_custodian_report_edit_qc_myScroll);
    }
    
    auditCustodianReportEditQc_totalNum = custodianAuditCheckReportEditList_qc.length;
	//设置总台数、合格证已盘、合格证未盘的车辆数量
	page.find("#auditCustodianReportEditQc_totalNum font").text(auditCustodianReportEditQc_totalNum);
	page.find("#auditCustodianReportEditQc_qcFinishNum font").text(auditCustodianReportEditQc_qcFinishNum);
	page.find("#auditCustodianReportEditQc_qcUnFinishNum font").text(auditCustodianReportEditQc_qcUnFinishNum);
}

//下拉刷新盘库报告
function pullDownAuditCustodianReportEditQc(){
	showLoading();
	
	var page = $('#audit_custodian_report_edit_qc_page');
	var $auditReportList = page.find(".auditCustodianReportEditContentDiv .auditCustodianReportEditList");
//	$auditReportList.empty();
	
    //加载查询后的数据列表
	var auditReportList = filterAuditCustodianReportQcList;
    if(auditReportList !=null){
    	var postData = {};
        setScroll(postData);//设置分页开始结束位置
        
    	//加载盘点报告列表
		var $template = $("#audit_custodian_report_edit_qc_page .list-row-template");
		$.each(auditReportList,function(i,n){
			if(i>=postData.sindex-1 && i <= postData.eindex-1){
				
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
	            
	            //用于返回该页面时计算选项的index
	            $item.attr("scrollCurrentPage",currentPage);
	            $item.attr("scrollCurrentElementNum",i);
				
				var $auditReportEditPhotoBtn = $item.find(".ListTit a.auditReportEditPhotoBtn");
				$auditReportEditPhotoBtn.bind("tap",function(event){
					event.stopPropagation();
					//如果网络是连通的
					if(isNetworkConnected1()){
						//设置当前选项的index到session中
//						var scrollCurrentElementIndex = 0;
//						var scrollCurrentElementNum = $item.attr("scrollCurrentElementNum");
//						var scrollCurrentPage = $item.attr("scrollCurrentPage");
//						var pageDisplayCount = session.get("pageDisplayCount");
//					    var pageAddCount = session.get("pageAddCount");
//					    if(scrollCurrentPage <= 1){
//						   	scrollCurrentElementIndex = parseInt(scrollCurrentElementNum)+1;
//					    }else{
//					    	scrollCurrentElementIndex = parseInt(pageDisplayCount)+((parseInt(scrollCurrentPage)-2)*parseInt(pageAddCount))+parseInt(scrollCurrentElementNum)+1;
//					    }
						var scrollCurrentElementNum = $item.attr("scrollCurrentElementNum");
						var scrollCurrentElementIndex = scrollCurrentElementNum;
						var scrollMapJSON = {};
						scrollMapJSON.scrollCurrentElementIndex = scrollCurrentElementIndex;
						scrollMap.audit_custodian_report_edit_qc_page = JSON.stringify(scrollMapJSON);
						
						var auditCheckReportId = $(this).parents(".auditCustodianReportEditListItem").find("[identity='auditCheckReportId']").text();
						auditCustodianReportEditQcPhotoBtn(auditCheckReportId);
					}else{
						showMessage('目前离线，请恢复网络后再试！','2000');
					}
				});
				
				var $auditReportEditConfirmBtn = $item.find(".ListTit a.auditReportEditConfirmBtn");
				$auditReportEditConfirmBtn.bind("tap",function(event){
					event.stopPropagation();
					auditCustodianReportEditQcConfirm(this,"ConfirmBtn");
				});
				
				var $auditReportEditQcRemarkInput = $item.find("input[name='auditCustodianReportEditQc_remark']");
				$auditReportEditQcRemarkInput.keyup(function(){
					event.stopPropagation();
					auditCustodianReportEditQcConfirm(this,"Remark");
				});
				//qcFinishStatus ：是否完成（0：未盘点  1.已盘点）
				if(n.qcFinishStatus == 1){
					$item.find(".CauseDiv").css("color","red");
				}
				
				//加载字典表中盘点报告合格证状态
				loadInitCustodianQcAuditResult_qc($item,"auditCustodianReportEditQc_qcStatus",custodianQcAuditResultDictionaryList_qc,
						n.qcAuditResult,"SingleSet");
				
				dataBindToElement($item,n);
				$item.removeClass("list-row-template");
				$item.css("display","");
				$auditReportList.append($item);
			
			}
		});//end $.each
		
		//判断该列表是否已无数据
    	if (!hasPage(auditReportList.length-postData.sindex)) {
    		hasData = false;
    		//无数据时结束分页滚动
    		endScroll(audit_custodian_report_edit_qc_myScroll);
    	}
    	
    	showHide();
    } else {
    	showHide();
    	hasData = false;
		//无数据时结束分页滚动
		endScroll(audit_custodian_report_edit_qc_myScroll);
    }
    
}

//批量设置时，加载字典表中盘点报告合格证状态
function loadInitResultsBatchSet_custodianQc(custodianQcAuditResultDictionaryList_qc){
	var $auditCustodianReportEditQcBatchSet = $("#audit_custodian_report_edit_qc_page .auditCustodianReportEditQcBatchSet");
	loadInitCustodianQcAuditResult_qc($auditCustodianReportEditQcBatchSet,"auditCustodianReportEditQc_batchSetQcStatusSelect",
			custodianQcAuditResultDictionaryList_qc,"","BatchSet");
}

//点击批量操作的链接（设置设置合格证状态）时，在js中调用相应的批量操作选择项的单击事件
function batchSetStatus_custodianQc(batchSetId){
	var $checkedInputItems = $("#audit_custodian_report_edit_qc_page .auditCustodianReportEditListItem .ListTit input[type='checkbox']:checked");
	if($checkedInputItems != null && $checkedInputItems.length > 0){
		if(batchSetId == "auditCustodianReportEditQc_batchSetQcStatus"){
			var $batchSetQcStatus = $("#audit_custodian_report_edit_qc_page .auditCustodianReportEditQcBatchSet").find("input");
			$batchSetQcStatus.click();
		}
		
	}else{
		showMessage("请至少选择一辆车！",'1500');
	}
	
}

//加载字典表中盘点报告合格证状态
function loadInitCustodianQcAuditResult_qc($item,qcStatusName
		,custodianQcAuditResultDictionaryList_qc,qcAuditResult,setClassification){
	//盘点报告合格证状态
	var $qcStatus =  $item.find("[name='"+qcStatusName+"']");
	$qcStatus.empty();
	$.each(custodianQcAuditResultDictionaryList_qc,function(i,n){
		var templateItem = '<option value="'+n.code+'">'+n.name+'</option>';
		$qcStatus.append(templateItem);
	});
	$qcStatus.mobiscroll().select({
		theme: 'red',
		lang: 'zh',
		display: 'bottom',
		minWidth: 200,
		onInit: function (event, inst) {
	        if(qcAuditResult == ""){
	        	$qcStatus.mobiscroll('setVal',"NONE",true);
	        }else{
	        	$qcStatus.mobiscroll('setVal',qcAuditResult,true);
	        }
	     },
	     onSet:function(event,inst){
	        if(setClassification == "BatchSet"){
	        	//批量设置合格证状态
	        	var $checkedInputItems = $("#audit_custodian_report_edit_qc_page .auditCustodianReportEditListItem .ListTit input[type='checkbox']:checked");
	     		var qcStatusVal = $qcStatus.mobiscroll("getVal");
	     		//批量设置时，设置所有选中的列表项的合格证状态
	     		var $select = $checkedInputItems.parents(".ListRow")
	     				.find("dd div.auditCustodianReportEditSelectContent select[name='auditCustodianReportEditQc_qcStatus']");
	        	$select.mobiscroll('setVal',qcStatusVal,true);
	        	
	        	//批量设置合格证状态时，选中项合格证状态修改时，保存到js中的车辆盘点数据变量中
	        	$.each($checkedInputItems,function(i,inputitem){
	        		var $qcStatusSelectItem = $(inputitem).parents(".ListRow")
	        				.find("dd div.auditCustodianReportEditSelectContent select[name='auditCustodianReportEditQc_qcStatus']");
	        		auditCustodianReportEditQcConfirm($qcStatusSelectItem,"QcStatus");
	        	});//end $.each
	        	
	        	//所有选中checkbox，取消选中
        		$checkedInputItems.removeAttr("checked");
	        	
        	}else if(setClassification == "SingleSet"){
        		//单个设置合格证状态时，选中项合格证状态修改时，保存到js中的车辆盘点数据变量中
        		auditCustodianReportEditQcConfirm(this,"QcStatus");
        	}
	     }
	});
}

//图片链接处理
function auditCustodianReportEditQcPhotoBtn(auditCheckReportId){
	clearInterval(custodianQcAuditorAndStoreHouseDistanceInterval);
	
	var businessType = ConstDef.getConstant("BUSINESS_CATEGORY_AUDIT");
	session.set("businessId",auditCheckReportId);
	session.set("businessType",businessType);
	
	goto_page("common_business_pictures_edit_page");
}

//点击完成链接
function auditCustodianReportEditQcConfirm(auditReportEditItem,callClassification){
	var page = $("#audit_custodian_report_edit_qc_page")
	
	var $auditCustodianReportEditListItem = $(auditReportEditItem).parents(".auditCustodianReportEditListItem");
	//数据列表序号number
	var number = $auditCustodianReportEditListItem.find("[identity='number']").text()
	//盘库报告ID
	var auditCheckReportId = $auditCustodianReportEditListItem.find("[identity='auditCheckReportId']").text()
	
	//获取合格证已盘、合格证未盘车辆数量
//	var qcFinishNum = Number(page.find("#custodianQcFinishNum_qc font").text());
//	var qcUnfinishNum = Number(page.find("#auditCustodianReportEditQc_qcUnFinishNum font").text());
	
	//原有合格证盘点状态--是否完成：0：未盘点  1.已盘点
	var oldQcFinishStatus = $auditCustodianReportEditListItem.find("[identity='qcFinishStatus']").text();
	//合格证盘点是否完成--0：未盘点  1.已盘点
	var $qcFinishStatus = oldQcFinishStatus;
	
	//保存到页面js中保存的数组中
	var saveAuditReportList = custodianAuditCheckReportEditList_qc;
	
	var saveAuditReportObject = saveAuditReportList[number-1];
	if(saveAuditReportObject.auditCheckReportId == auditCheckReportId){
		
		//callClassification:调用分类   -- ConfirmBtn：点击完成按钮  
		if(callClassification == "ConfirmBtn"){
			//是否完成--0：未盘点  1.已盘点
			$qcFinishStatus = 1;
			//是否完成--0：未盘点  1.已盘点---原有状态
			if(oldQcFinishStatus != "1"){
				auditCustodianReportEditQc_qcFinishNum += 1;
				auditCustodianReportEditQc_qcUnFinishNum -= 1
				$auditCustodianReportEditListItem.find("[identity='qcFinishStatus']").text("1");
				//qcFinishStatus ：是否完成（0：未盘点  1.已盘点）
				$auditCustodianReportEditListItem.find(".CauseDiv").css("color","red");
			}
			//设置合格证已盘、合格证未盘的车辆数量
			page.find("#auditCustodianReportEditQc_qcFinishNum font").text(auditCustodianReportEditQc_qcFinishNum);
			page.find("#auditCustodianReportEditQc_qcUnFinishNum font").text(auditCustodianReportEditQc_qcUnFinishNum);
			
			//合格证
			saveAuditReportObject.qcAuditResult = $auditCustodianReportEditListItem.find("[name='auditCustodianReportEditQc_qcStatus']").val();
			saveAuditReportObject.qcAuditResultName = $auditCustodianReportEditListItem.find("[name='auditCustodianReportEditQc_qcStatus'] option:selected").text();
			//合格证盘点状态--是否完成：0：未盘点  1.已盘点
			saveAuditReportObject.qcFinishStatus = $qcFinishStatus;
			//备注
			saveAuditReportObject.remark = $auditCustodianReportEditListItem.find("[name='auditCustodianReportEditQc_remark']").val();
			
			showMessage("该车辆合格证盘点完成",'2000');
			
			//清空车架号查询的车架号
			$('#audit_custodian_report_edit_qc_page').find("#vinNoText_custodianQc").val('');
			
		}else if(callClassification == "QcStatus"){
			//合格证
			saveAuditReportObject.qcAuditResult = $auditCustodianReportEditListItem.find("[name='auditCustodianReportEditQc_qcStatus']").val();
			saveAuditReportObject.qcAuditResultName = $auditCustodianReportEditListItem.find("[name='auditCustodianReportEditQc_qcStatus'] option:selected").text();
		}else if(callClassification == "Remark"){
			//备注
			saveAuditReportObject.remark = $auditCustodianReportEditListItem.find("[name='auditCustodianReportEditQc_remark']").val();
		}
		
	}
}

//点击保存
function saveAuditCustodianReportQc(flag){
	
	var saveAuditReportList = custodianAuditCheckReportEditList_qc;
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
	
	//点击保存按钮后，如果总台数=QC已盘，则认为该经销商已经盘点完毕；如果总台数>QC已盘，则认为该经销商还在盘点中。
	//盘点清单状态auditListStatus-- 0.未办 1.已办(正常完成任务) 2.跳过 3.进行中 4.DAS端完成 5.完成（更多按钮选项完成）
	if(auditCustodianReportEditQc_auditListStatus == 3){
		//总车量数--auditCustodianReportEditQc_totalNum   合格证已盘车辆数量--auditCustodianReportEditQc_qcFinishNum
		if(auditCustodianReportEditQc_totalNum == auditCustodianReportEditQc_qcFinishNum){
			auditCustodianReportEditQc_auditListStatus = 1;
		}else if(auditCustodianReportEditQc_totalNum > auditCustodianReportEditQc_qcFinishNum){
			auditCustodianReportEditQc_auditListStatus = 3;
		}
	}
	
	var postData = {};
    postData.random = Math.random();
    postData.userCode = session.get("userCode");
    postData.saveData = JSON.stringify(saveData);
    
    postData.auditCheckListId = session.get("auditCheckListId");//盘点清单ID
    postData.auditPlanDayId = session.get("auditPlanDayId");//盘点计划日ID
    postData.auditListStatus = auditCustodianReportEditQc_auditListStatus;//盘点清单状态auditListStatus-- 0.未办 1.已办(正常完成任务) 2.跳过 3.进行中 4.DAS端完成 5.完成（更多按钮选项完成）
	$.ajax({
		url: basePath+"/app/auditCustodianReportEditQc/saveAuditCustodianReportQc.xhtml",
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
				if(flag != "CustodianQcBackPage"){
					showMessage("已将数据成功保存到MOA系统",'2000');
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

function custodianAuditorLastLocationAndCustodianDistance(userLastLocation,afterLoadingFunc){
	
	var custodianLocationMap = JSON.parse(session.get("auditCustodianDealerList_custodianLocationMap"));

	var func = function(distance){
		var commonDistance = session.get("auditCustodianValidDistance");
		if(distance != null && commonDistance != null){
			if(distance > commonDistance){
//				showLoading("盘点员距离库房超过"+commonDistance+"米,不在监管单位的有效范围内,不能编辑盘点报告!");
//				showAuditEditLoading("盘点员距离库房超过"+commonDistance+"米,不在监管单位的有效范围内,不能编辑盘点报告!",custodianAuditEditLoadingDiv);
				var message = "盘点员距离库房超过"+commonDistance+"米,不在监管单位的有效范围内,不能编辑盘点报告，点击确认按钮，将返回前一页面！";
				showAuditReportBackPageConfirmMsg("确认信息",message,afterLoadingFunc);
			}else{
				showHide();
			}
		}else{
//			showMessage("盘点员位置未取到或网络连接出错，不能编辑盘点报告！",'2000');
			var message = "盘点员位置未取到或网络连接出错，不能编辑盘点报告，点击确认按钮，将返回前一页面！";
			showAuditReportBackPageConfirmMsg("确认信息",message,afterLoadingFunc);
		}
	}
	
	if($.isEmptyObject(userLastLocation) 
			|| userLastLocation.longitude == 0 || userLastLocation.latitude == 0
			|| userLastLocation.longitude == "" || userLastLocation.latitude == ""
			|| userLastLocation.longitude == null || userLastLocation.latitude == null
			|| userLastLocation.longitude == "null" || userLastLocation.latitude == "null"
			|| userLastLocation.longitude == undefined || userLastLocation.latitude == undefined){
		
//		showLoading("盘点员位置未取到，不能编辑盘点报告！");
//		showAuditEditLoading("盘点员位置未取到，不能编辑盘点报告！",custodianAuditEditLoadingDiv);
		var message = "盘点员位置未取到，不能编辑盘点报告，点击确认按钮，将返回前一页面！";
		showAuditReportBackPageConfirmMsg("确认信息",message,afterLoadingFunc);
	}else if($.isEmptyObject(custodianLocationMap)
			|| custodianLocationMap.longitude == 0 || custodianLocationMap.latitude == 0
			|| custodianLocationMap.longitude == "" || custodianLocationMap.latitude == ""
			|| custodianLocationMap.longitude == null || custodianLocationMap.latitude == null
			|| custodianLocationMap.longitude == "null" || custodianLocationMap.latitude == "null"
			|| custodianLocationMap.longitude == undefined || custodianLocationMap.latitude == undefined){
		
//		showLoading("监管单位坐标未正确设置，不能编辑盘点报告！");
//		showAuditEditLoading("监管单位坐标未正确设置，不能编辑盘点报告！",custodianAuditEditLoadingDiv);
		var message = "监管单位坐标未正确设置，不能编辑盘点报告，点击确认按钮，将返回前一页面！";
		showAuditReportBackPageConfirmMsg("确认信息",message,afterLoadingFunc);
	}else{
		auditCustodianDealerListAuditCalculateDistance(userLastLocation,custodianLocationMap,func);
	}
	
}

function auditCustodianReportEditQcBackPage(oper){
	
	//如果网络是连通的
	if(isNetworkConnected1()){
		//自动保存监管单位盘库的数据
		//盘点清单状态auditListStatus-- 0.未办 1.已办(正常完成任务) 2.跳过 3.进行中 4.DAS端完成 5.完成（更多按钮选项完成）
		if(auditCustodianReportEditQc_auditListStatus != "" 
			&& auditCustodianReportEditQc_auditListStatus != 0){
			saveAuditCustodianReportQc("CustodianQcBackPage");
		}
		
		custodianAuditCheckReportEditList_qc = [];
		filterAuditCustodianReportQcList = [];
		custodianQcAuditResultDictionaryList_qc = [];
		
		auditCustodianReportEditQc_totalNum = 0; //总车辆台数
		auditCustodianReportEditQc_qcFinishNum = 0;  //合格证已盘车辆数量
		auditCustodianReportEditQc_qcUnFinishNum = 0;  //合格证未盘车辆数量
		auditCustodianReportEditQc_auditListStatus = ""; //盘点清单状态
		//初始化分页
		currentPage = 1;
		hasData = true;
		hideMyDialog(oper);
		oper.find(".promptMsg").html("");
		//清除判断盘点员与监管单位的距离的定时器
		clearInterval(custodianQcAuditorAndStoreHouseDistanceInterval);
		back_page();
		
	}else{
		showAuditReportMessage('目前离线，请恢复网络后再试！',oper,auditCustodianReportEditQcBackPage,2000)
	}
}