var audit_custodian_report_view_page = $('#audit_custodian_report_view_page');

var audit_custodian_report_view_myScroll;

/******************************audit_custodian_report_view_page---begin**************************************/
audit_custodian_report_view_page.live('pageinit',function(e,ui){
	
	var wrapper = "audit_custodian_report_view_wrapper";
	var up = "audit_custodian_report_view_pullUp";
	var down = "audit_custodian_report_view_pullDown";
	audit_custodian_report_view_myScroll = createMyScroll(wrapper,up,down);
	
	//回退事件处理
	audit_custodian_report_view_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page();
	});
	
	//点击 全部/已盘/未盘 按钮，检索满足条件的车辆信息显示到页面
	audit_custodian_report_view_page.find(".auditSegmentedButtonGroup input[type='button']").live("tap",function(event){
		event.stopPropagation();
		var audiSelectedBtn = $('#audit_custodian_report_view_page').find(".auditSegmentedButtonGroup .segmentedButtons4Selected");
		audiSelectedBtn.removeClass("segmentedButtons4Selected");
		audiSelectedBtn.addClass("segmentedButtons4Unselected");
		$(this).removeClass("segmentedButtons4Unselected");
		$(this).addClass("segmentedButtons4Selected");
		
		//初始化分页
		currentPage = 1;
		hasData = true;
		var $auditReportList = $('#audit_custodian_report_view_page').find(".auditReportViewContentDiv .auditReportViewList");
		$auditReportList.empty();
		//查询盘点报告
		var queryConditonVal = $(this).val();
		var $vinNoText = $('#audit_custodian_report_view_page').find("#auditCustodianReportView_vinNoText");
		var $vinNoVal = $vinNoText.val();
		queryAuditCustodianReportView(queryConditonVal,$vinNoVal);
	});
	
	//点击数字键盘
	audit_custodian_report_view_page.find(".auditReportViewNumericKeyboardNumber").live("tap",function(event){
		event.stopPropagation();
		//查询盘点报告
		var numericKeyboardVal = $(this).val();
		var $vinNoText = $('#audit_custodian_report_view_page').find("#auditCustodianReportView_vinNoText");
		var $vinNoVal = $vinNoText.val();
		$vinNoVal += numericKeyboardVal;
		$vinNoText.val($vinNoVal.substring(0,17));
		if($vinNoText.val().length >= 4){
			//初始化分页
			currentPage = 1;
			hasData = true;
			var $auditReportList = $('#audit_custodian_report_view_page').find(".auditReportViewContentDiv .auditReportViewList");
			$auditReportList.empty();
			
			var queryConditonVal = $('#audit_custodian_report_view_page').find(".auditSegmentedButtonGroup .segmentedButtons4Selected").val();
			var queryVinNoVal = $vinNoText.val();
			queryAuditCustodianReportView(queryConditonVal,queryVinNoVal);
		}
	});
	
	//点击删除按钮，删除检索条件车架号文本框中的1个字符，然后进行模糊查询
	audit_custodian_report_view_page.find("#deleteVinNo_view").live("tap",function(event){
		event.stopPropagation();
		//查询盘点报告
		var $vinNoText = $('#audit_custodian_report_view_page').find("#auditCustodianReportView_vinNoText");
		var $vinNoVal = $vinNoText.val();
		$vinNoText.val($vinNoVal.substring(0,$vinNoVal.length-1));
		if($vinNoText.val().length >= 4){
			//初始化分页
			currentPage = 1;
			hasData = true;
			var $auditReportList = $('#audit_custodian_report_view_page').find(".auditReportViewContentDiv .auditReportViewList");
			$auditReportList.empty();
			
			var queryConditonVal = $('#audit_custodian_report_view_page').find(".auditSegmentedButtonGroup .segmentedButtons4Selected").val();
			var $vinNoText = $('#audit_custodian_report_view_page').find("#auditCustodianReportView_vinNoText");
			var queryVinNoVal = $vinNoText.val();
			queryAuditCustodianReportView(queryConditonVal,queryVinNoVal);
		}
		
	});
	
	//点击清除按钮，删除检索条件车架号文本框中的所有字符，然后进行模糊查询
	audit_custodian_report_view_page.find("#clearVinNo_view").live("tap",function(event){
		event.stopPropagation();
		//查询盘点报告
		var $vinNoText = $('#audit_custodian_report_view_page').find("#auditCustodianReportView_vinNoText");
		$vinNoText.val("");
	});
	
});//end pageinit


audit_custodian_report_view_page.live('pageshow',function(e, ui){
	var page = $('#audit_custodian_report_view_page');
	currentLoadActionName  = "audit_custodian_report_view_load_content";
	
	var fromPage = session.get("fromPage");
	if(fromPage != "common_business_pictures_view_page"){
		//初始化分页
		currentPage = 1;
		hasData = true;
		//清空盘点报告数据列表
		var $auditReportList = page.find(".auditReportViewContentDiv .auditReportViewList");
		$auditReportList.empty();
		//查询提示消息列表
		load_audit_custodian_report_view_content();
	}else{
		// 获取当前页的index
		var scrollCurrentElementIndex = 0;
 	    var scrollNowPage = session.get("nowPage");
 	    if(!$.isEmptyObject(scrollMap)){
 	    	var commonScrollMapJsonObj = scrollMap[scrollNowPage];
 	    	if(commonScrollMapJsonObj != null && typeof(commonScrollMapJsonObj) != "undefined"){
 	    		commonScrollMapJsonObj = JSON.parse(commonScrollMapJsonObj);
 	 	 	    scrollCurrentElementIndex = commonScrollMapJsonObj.scrollCurrentElementIndex-1;
 	 	    	//删除Json数据中的scrollNowPage属性  
 	 	        delete scrollMap[scrollNowPage]; 
 	    	}
 	    }
		var scrollCurrentElement = page.find(".auditReportViewContentDiv .auditReportViewListItem").get(scrollCurrentElementIndex);
		audit_custodian_report_view_myScroll.refresh();//刷新iScroll
		audit_custodian_report_view_myScroll.scrollToElement(scrollCurrentElement,0);
	}
	
});//end pageshow

function audit_custodian_report_view_load_content(){
	//下拉不刷新，则该方法置空
	if(hasData){
		//如果还有数据则加载
		var queryConditonVal = $('#audit_custodian_report_view_page').find(".auditSegmentedButtonGroup .segmentedButtons4Selected").val();
		var $vinNoText = $('#audit_custodian_report_view_page').find("#auditCustodianReportView_vinNoText");
		var queryVinNoVal = $vinNoText.val();
		queryAuditCustodianReportView(queryConditonVal,queryVinNoVal)
	}
}

//初始化盘点报告页面
function load_audit_custodian_report_view_content(){
	var page = $('#audit_custodian_report_view_page');
	var $auditReportList = page.find(".auditReportViewContentDiv .auditReportViewList");
//	$auditReportList.empty();
	
	var auditReportStatisticsNumFont = $("#audit_custodian_report_view_page .auditReportStatisticsNum font");
	auditReportStatisticsNumFont.text("0");
	
	var $auditSegmentedButtonGroup = $('#audit_custodian_report_view_page').find(".auditSegmentedButtonGroup input");
	var $auditReportTotalBtn = $('#audit_custodian_report_view_page').find(".auditSegmentedButtonGroup #auditCustodianReportView_totalBtn");
	$auditSegmentedButtonGroup.removeClass("segmentedButtons4Selected");
	$auditSegmentedButtonGroup.addClass("segmentedButtons4Unselected");
	$auditReportTotalBtn.removeClass("segmentedButtons4Unselected");
	$auditReportTotalBtn.addClass("segmentedButtons4Selected");
	
	var $vinNoText = $('#audit_custodian_report_view_page').find("#auditCustodianReportView_vinNoText");
	$vinNoText.val("");
	
	var auditCheckListId = session.get("auditCheckListId");//盘点清单ID
	
	showLoading();
	var postData = {};
	setScroll(postData);//设置分页开始结束位置
    postData.random = Math.random();
    postData.auditCheckListId = auditCheckListId;//盘点清单ID
    
	$.getJSON(basePath+"/app/auditCustodianReportView/pageInit.xhtml"+callback, postData,function(msg){
		if($.trim(msg.returnCode) == '0'){
			var auditCustodianReportView_totalNum = 0; //总车辆台数
			var auditCustodianReportView_qcFinishNum = 0;  //合格证已盘车辆数量
			var auditCustodianReportView_qcUnFinishNum = 0;  //合格证未盘车辆数量
			
			var data = msg.data;
			
		    if(data.auditReportList !=null){
		    	//盘点报告初始化
		    	//加载盘点报告列表
		    	var auditReportList = data.auditReportList;
				var $template = $("#audit_custodian_report_view_page .list-row-template");
				$.each(auditReportList,function(i,n){
					if(i>=postData.sindex-1 && i <= postData.eindex-1){
						var $item = $template.clone(true);
						
						//用于返回该页面时计算选项的index
			            $item.attr("scrollCurrentPage",currentPage);
			            $item.attr("scrollCurrentElementNum",i);
			            
						var $auditReportViewPhotoBtn = $item.find("a.auditReportEditPhotoBtn");
						$auditReportViewPhotoBtn.bind("tap",function(event){
							event.stopPropagation();
							//如果网络是连通的
							if(isNetworkConnected1()){
								//设置当前选项的index到session中
								var scrollCurrentElementIndex = 0;
								var scrollCurrentElementNum = $item.attr("scrollCurrentElementNum");
								var scrollCurrentPage = $item.attr("scrollCurrentPage");
								var pageDisplayCount = session.get("pageDisplayCount");
							    var pageAddCount = session.get("pageAddCount");
							    if(scrollCurrentPage <= 1){
								   	scrollCurrentElementIndex = parseInt(scrollCurrentElementNum)+1;
							    }else{
							    	scrollCurrentElementIndex = parseInt(pageDisplayCount)+((parseInt(scrollCurrentPage)-2)*parseInt(pageAddCount))+parseInt(scrollCurrentElementNum)+1;
							    }
								var scrollMapJSON = {};
								scrollMapJSON.scrollCurrentElementIndex = scrollCurrentElementIndex;
								scrollMap.audit_custodian_report_view_page = JSON.stringify(scrollMapJSON);
								
								var auditCheckReportId = $(this).parents(".auditReportViewListItem").find("[identity='auditCheckReportId']").text();
								auditReportViewPhotoBtn(auditCheckReportId);
							}else{
								showMessage('目前离线，请恢复网络后再试！','2000');
							}
							
						});
						
						dataBindToElement($item,n);
						
						$item.removeClass("list-row-template");
						$item.css("display","");
						$auditReportList.append($item);
					}
					
					//合格证盘点状态--qcFinishStatus：是否完成（0：未盘点  1.已盘点）
					if(n.qcFinishStatus == 1){
						auditCustodianReportView_qcFinishNum += 1;
					}else{
						n.qcFinishStatus = 0;
						auditCustodianReportView_qcUnFinishNum +=1;
					}
					
				});//end $.each
				
				auditCustodianReportView_totalNum = auditReportList.length;
				//设置总台数、合格证已盘、合格证未盘的车辆数量
				page.find("#auditCustodianReportView_totalNum font").text(auditCustodianReportView_totalNum);
				page.find("#auditCustodianReportView_qcFinishNum font").text(auditCustodianReportView_qcFinishNum);
				page.find("#auditCustodianReportView_qcUnFinishNum font").text(auditCustodianReportView_qcUnFinishNum);
				
				//判断该列表是否已无数据
            	if (!hasPage(auditReportList.length-postData.sindex)) {
            		hasData = false;
            		//无数据时结束分页滚动
            		endScroll(audit_custodian_report_view_myScroll);
            	}
            	
            	showHide();
		    } else {
		    	showHide();
//            	showMessage('暂无数据','1500');
		    	hasData = false;
	        	//无数据时结束分页滚动
	    		endScroll(audit_custodian_report_view_myScroll);
		    }
    	}else{
	    	showHide();
	    	errorHandler(msg.returnCode,msg.message);
	    	hasData = false;
        	//无数据时结束分页滚动
    		endScroll(audit_custodian_report_view_myScroll);
	    }
		
	});//end $.getJSON
}

//查询盘点报告
function queryAuditCustodianReportView(queryConditonVal,vinNoVal){
	var page = $('#audit_custodian_report_view_page');
	var $auditReportList = page.find(".auditReportViewContentDiv .auditReportViewList");
//	$auditReportList.empty();
	
//	var auditReportStatisticsNumFont = $('#audit_custodian_report_view_page').find(".auditReportStatisticsNum font");
//	auditReportStatisticsNumFont.text("0");
	
	var auditCheckListId = session.get("auditCheckListId");//盘点清单ID
	
	showLoading();
	var postData = {};
	setScroll(postData);//设置分页开始结束位置
    postData.random = Math.random();
    postData.auditCheckListId = auditCheckListId;
    if(queryConditonVal != "" && queryConditonVal != null){
    	if(queryConditonVal == "已盘"){
    		//合格证盘点状态--qcFinishStatus：是否完成（0：未盘点  1.已盘点）
    		postData.qcFinishStatus = "1";
    	}else if(queryConditonVal == "未盘"){
    		//合格证盘点状态--qcFinishStatus：是否完成（0：未盘点  1.已盘点）
    		postData.qcFinishStatus = "0";
    	}
    }
    
    if(vinNoVal != "" && vinNoVal != null){
    	postData.vinNo = vinNoVal;
    }
	
	$.getJSON(basePath+"/app/auditCustodianReportView/queryAuditCustodianReportList.xhtml"+callback, postData,function(msg){
		if($.trim(msg.returnCode) == '0'){
//			var auditCustodianReportView_totalNum = 0; //总车辆台数
//			var auditCustodianReportView_qcFinishNum = 0;  //合格证已盘车辆数量
//			var auditCustodianReportView_qcUnFinishNum = 0;  //合格证未盘车辆数量
			
			var data = msg.data;
		    if(data.auditReportList !=null){
		    	
		    	//加载盘点报告列表
		    	var auditReportList = data.auditReportList;
				var $template = $("#audit_custodian_report_view_page .list-row-template");
				$.each(auditReportList,function(i,n){
					var $item = $template.clone(true);
					
					//用于返回该页面时计算选项的index
		            $item.attr("scrollCurrentPage",currentPage);
		            $item.attr("scrollCurrentElementNum",i);
		            
					var $auditReportViewPhotoBtn = $item.find("a.auditReportEditPhotoBtn");
					$auditReportViewPhotoBtn.bind("tap",function(event){
						event.stopPropagation();
						
						//如果网络是连通的
						if(isNetworkConnected1()){
							//设置当前选项的index到session中
							var scrollCurrentElementIndex = 0;
							var scrollCurrentElementNum = $item.attr("scrollCurrentElementNum");
							var scrollCurrentPage = $item.attr("scrollCurrentPage");
							var pageDisplayCount = session.get("pageDisplayCount");
						    var pageAddCount = session.get("pageAddCount");
						    if(scrollCurrentPage <= 1){
							   	scrollCurrentElementIndex = parseInt(scrollCurrentElementNum)+1;
						    }else{
						    	scrollCurrentElementIndex = parseInt(pageDisplayCount)+((parseInt(scrollCurrentPage)-2)*parseInt(pageAddCount))+parseInt(scrollCurrentElementNum)+1;
						    }
							var scrollMapJSON = {};
							scrollMapJSON.scrollCurrentElementIndex = scrollCurrentElementIndex;
							scrollMap.audit_custodian_report_view_page = JSON.stringify(scrollMapJSON);
							
							var auditCheckReportId = $(this).parents(".auditReportViewListItem").find("[identity='auditCheckReportId']").text();
							auditReportViewPhotoBtn(auditCheckReportId);
						}else{
							showMessage('目前离线，请恢复网络后再试！','2000');
						}
					});
					
					//合格证盘点状态--qcFinishStatus：是否完成（0：未盘点  1.已盘点）
					if(n.qcFinishStatus == 1){
						auditCustodianReportView_qcFinishNum += 1;
					}else{
						n.qcFinishStatus = 0;
						auditCustodianReportView_qcUnFinishNum += 1;
					}
					
					dataBindToElement($item,n);
					$item.removeClass("list-row-template");
					$item.css("display","");
					$auditReportList.append($item);
					
				});//end $.each
				
				//判断该列表是否已无数据
            	if (!hasPage(auditReportList.length)) {
            		hasData = false;
            		//无数据时结束分页滚动
            		endScroll(audit_custodian_report_view_myScroll);
            	}
            	showHide();
		    } else {
		    	showHide();
//            	showMessage('暂无数据','1500');
		    	hasData = false;
	        	//无数据时结束分页滚动
	    		endScroll(audit_custodian_report_view_myScroll);
		    }
		    
//			auditCustodianReportView_totalNum = auditReportList.length;
//			//设置总台数、合格证已盘、合格证未盘的车辆数量
//			page.find("#auditCustodianReportView_totalNum font").text(auditCustodianReportView_totalNum);
//			page.find("#auditCustodianReportView_qcFinishNum font").text(auditCustodianReportView_qcFinishNum);
//			page.find("#auditCustodianReportView_qcUnFinishNum font").text(auditCustodianReportView_qcUnFinishNum);
    	}else{
	    	showHide();
	    	errorHandler(msg.returnCode,msg.message);
	    	hasData = false;
        	//无数据时结束分页滚动
    		endScroll(audit_custodian_report_view_myScroll);
	    }
		
	});//end $.getJSON
}

//点击图片链接处理
function auditReportViewPhotoBtn(auditCheckReportId){
	session.set("businessId",auditCheckReportId);
	goto_page("common_business_pictures_view_page");
}
