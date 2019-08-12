/*****************************litigation_task_handle_view_page init begin*****************************************************************/	
var litigation_task_handle_view_page = $('#litigation_task_handle_view_page');
var litigation_task_handle_view_myScroll;
/******************************litigation_task_handle_view_page---begin**************************************/	   
litigation_task_handle_view_page.live('pageinit',function(e, ui){
	
	var wrapper = "litigation_task_handle_view_wrapper"
	var up = "litigation_task_handle_view_pullUp";
    var down = "litigation_task_handle_view_pullDown";;
    litigation_task_handle_view_myScroll = createMyScroll(wrapper,up,down);
	
    litigation_task_handle_view_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page();
	});
	
	//点击展开/关闭列表
    litigation_task_handle_view_page.find("div.litig-details h1").live("tap",function(e){
		var $contentElement = $(this).next("ul");
		if($contentElement.is(":visible")){
			$contentElement.hide();
			var $arrowElement = $(this).children("span");
			$arrowElement.removeClass("arrow-up");
			$arrowElement.addClass("arrow-down");
		}
		else{
			$contentElement.show();
			var $arrowElement = $(this).children("span");
			$arrowElement.removeClass("arrow-down");
			$arrowElement.addClass("arrow-up");
		}
	});
	
});


litigation_task_handle_view_page.live('pageshow',function(e, ui){
	
	var $currentPage = $("#litigation_task_handle_view_page");
	currentLoadActionName = "litigation_task_handle_view_load_content";
	
	var page_from = session.get("page_from");
	var $bottomElem = $currentPage.find("ul[tag='collection_case_details_bottom']");
	if(page_from == "todo_case_list_view_page"){
		$bottomElem.removeClass("bottoms5-red");
		$bottomElem.addClass("bottoms4-red");
		$bottomElem.find("li:eq(3)").css("display","none");
	}else if(page_from == "collection_record_list_view_page"){
		$bottomElem.removeClass("bottoms4-red");
		$bottomElem.addClass("bottoms5-red");
		$bottomElem.find("li:eq(3)").css("display","block");
	}
	
	var fromPage = session.get("fromPage");
	 if(fromPage != "litigation_cost_list_page"
		 && fromPage != "litigation_record_list_page"
			 && fromPage != "litigation_courtInfo_list_page" 
				 && fromPage != "litigation_collecting_address_details_page" 
					 &&fromPage != "litigation_case_details_page"){
		
		 load_litigation_task_handle_view_content();
	 }
});

function litigation_task_handle_view_load_content(){
	//该方法被引用，不要删除，如果想实现向上划动刷新，则在此添加代码
}

//加载详细，并显示
function load_litigation_task_handle_view_content(){

	showLoading();
	var currentPage = $("#litigation_task_handle_view_page");
	currentPage.find("span[identity]").text("");
	var postData = {};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	//案件号
    postData.caseId = session.get("caseId");
    
    $.getJSON(basePath+"/app/litigationTaskHandleView/pageInit.xhtml"+callback, postData,function(msg){
		if ($.trim(msg.returnCode) == '0') {

			if (msg.data != null) {
				
				bind_litigation_task_handle_view_to_page(msg);

				showHide();
			}
			else{
				showHide();
			}
		}
		else {
			showHide();
			errorHandler(msg.returnCode, msg.message);
		}
    });//end $.getJSON
};

function bind_litigation_task_handle_view_to_page(msg){
	var currentPage = $("#litigation_task_handle_view_page");
	
	var data = msg.data;
	//诉讼详情
	var litigationDetails = data.litigationDetails;
	if(litigationDetails != null){
		//诉前程序
		//申请诉前保全时间
		if(litigationDetails.protectedTimePre != null 
				&& litigationDetails.protectedTimePre != ""){
			litigationDetails.protectedTimePre = litigationDetails.protectedTimePre.substring(0,10)
		}
		//采取诉前保全时间
		if(litigationDetails.protectedTimeExe != null 
				&& litigationDetails.protectedTimeExe != ""){
			litigationDetails.protectedTimeExe = litigationDetails.protectedTimeExe.substring(0,10)
		}
		//诉前缴纳保证金时间
		if(litigationDetails.payDepositTimePre != null 
				&& litigationDetails.payDepositTimePre != ""){
			litigationDetails.payDepositTimePre = litigationDetails.payDepositTimePre.substring(0,10)
		}
		//诉前退还保证金时间
		if(litigationDetails.depositBackTimePre != null 
				&& litigationDetails.depositBackTimePre != ""){
			litigationDetails.depositBackTimePre = litigationDetails.depositBackTimePre.substring(0,10)
		}
		//申请诉前调解时间
		if(litigationDetails.adjustTimePre != null 
				&& litigationDetails.adjustTimePre != ""){
			litigationDetails.adjustTimePre = litigationDetails.adjustTimePre.substring(0,10)
		}
		//领取诉前调解书时间
		if(litigationDetails.gotconciliStatementTimePre != null 
				&& litigationDetails.gotconciliStatementTimePre != ""){
			litigationDetails.gotconciliStatementTimePre = litigationDetails.gotconciliStatementTimePre.substring(0,10)
		}
		//诉前调解生效时间
		if(litigationDetails.mediationEffectTimePre != null 
				&& litigationDetails.mediationEffectTimePre != ""){
			litigationDetails.mediationEffectTimePre = litigationDetails.mediationEffectTimePre.substring(0,10)
		}
		//诉前调解领取生效证明时间
		if(litigationDetails.gotmediationEffectTimePre != null 
				&& litigationDetails.gotmediationEffectTimePre != ""){
			litigationDetails.gotmediationEffectTimePre = litigationDetails.gotmediationEffectTimePre.substring(0,10)
		}
		
		//债权主张
		//提交债权主张时间
		if(litigationDetails.advocateTime != null 
				&& litigationDetails.advocateTime != ""){
			litigationDetails.advocateTime = litigationDetails.advocateTime.substring(0,10)
		}
		
		//一审程序
		//一审立案时间
		if(litigationDetails.fileTime != null 
				&& litigationDetails.fileTime != ""){
			litigationDetails.fileTime = litigationDetails.fileTime.substring(0,10)
		}
		//申请诉讼保全时间
		if(litigationDetails.protectedTimeLaw != null 
				&& litigationDetails.protectedTimeLaw != ""){
			litigationDetails.protectedTimeLaw = litigationDetails.protectedTimeLaw.substring(0,10)
		}
		//缴纳诉讼保证金时间
		if(litigationDetails.cashDepositTime != null 
				&& litigationDetails.cashDepositTime != ""){
			litigationDetails.cashDepositTime = litigationDetails.cashDepositTime.substring(0,10)
		}
		//退还诉讼保证金时间
		if(litigationDetails.depositBackTime != null 
				&& litigationDetails.depositBackTime != ""){
			litigationDetails.depositBackTime = litigationDetails.depositBackTime.substring(0,10)
		}
		//采取诉讼保全时间
		if(litigationDetails.protectedTimeLawexe != null 
				&& litigationDetails.protectedTimeLawexe != ""){
			litigationDetails.protectedTimeLawexe = litigationDetails.protectedTimeLawexe.substring(0,10)
		}
		//一审开庭公告刊登时间
		if(litigationDetails.openNoteTime != null 
				&& litigationDetails.openNoteTime != ""){
			litigationDetails.openNoteTime = litigationDetails.openNoteTime.substring(0,10)
		}
		//一审调解时间
		if(litigationDetails.adjustTime != null 
				&& litigationDetails.adjustTime != ""){
			litigationDetails.adjustTime = litigationDetails.adjustTime.substring(0,10)
		}
		//一审判决/调解时间
		if(litigationDetails.adjustTimeFst != null 
				&& litigationDetails.adjustTimeFst != ""){
			litigationDetails.adjustTimeFst = litigationDetails.adjustTimeFst.substring(0,10)
		}
		//领取一审判决/调解时间
		if(litigationDetails.gotfirstJudgmentAdjustTime != null 
				&& litigationDetails.gotfirstJudgmentAdjustTime != ""){
			litigationDetails.gotfirstJudgmentAdjustTime = litigationDetails.gotfirstJudgmentAdjustTime.substring(0,10)
		}
		//一审判决公告刊登时间
		if(litigationDetails.adjustNoteTime != null 
				&& litigationDetails.adjustNoteTime != ""){
			litigationDetails.adjustNoteTime = litigationDetails.adjustNoteTime.substring(0,10)
		}
		//一审判决生效时间
		if(litigationDetails.effectTime != null 
				&& litigationDetails.effectTime != ""){
			litigationDetails.effectTime = litigationDetails.effectTime.substring(0,10)
		}
		//领取一审判决生效证明时间
		if(litigationDetails.gotfstJudgEffectProveTime != null 
				&& litigationDetails.gotfstJudgEffectProveTime != ""){
			litigationDetails.gotfstJudgEffectProveTime = litigationDetails.gotfstJudgEffectProveTime.substring(0,10)
		}
		
		//第三人案件
		//第三人收到传票时间
		if(litigationDetails.thirdReceivedSummonsTime != null 
				&& litigationDetails.thirdReceivedSummonsTime != ""){
			litigationDetails.thirdReceivedSummonsTime = litigationDetails.thirdReceivedSummonsTime.substring(0,10)
		}
		//第三人领取判决时间
		if(litigationDetails.thirdPersonGotsentenceTime != null 
				&& litigationDetails.thirdPersonGotsentenceTime != ""){
			litigationDetails.thirdPersonGotsentenceTime = litigationDetails.thirdPersonGotsentenceTime.substring(0,10)
		}
		
		//被诉案件
		//被诉收到传票时间
		if(litigationDetails.defendandReceiveSummonTime != null 
				&& litigationDetails.defendandReceiveSummonTime != ""){
			litigationDetails.defendandReceiveSummonTime = litigationDetails.defendandReceiveSummonTime.substring(0,10)
		}
		//被诉领取判决时间
		if(litigationDetails.defendandGotsentenceTime != null 
				&& litigationDetails.defendandGotsentenceTime != ""){
			litigationDetails.defendandGotsentenceTime = litigationDetails.defendandGotsentenceTime.substring(0,10)
		}
		
		//二审程序
		//提出/收到二审诉状时间
		if(litigationDetails.indictTimeSec != null 
				&& litigationDetails.indictTimeSec != ""){
			litigationDetails.indictTimeSec = litigationDetails.indictTimeSec.substring(0,10)
		}
		//二审开庭公告刊登时间
		if(litigationDetails.openNoteTimeSec != null 
				&& litigationDetails.openNoteTimeSec != ""){
			litigationDetails.openNoteTimeSec = litigationDetails.openNoteTimeSec.substring(0,10)
		}
		//二审调解时间
		if(litigationDetails.mediationTimeSec != null 
				&& litigationDetails.mediationTimeSec != ""){
			litigationDetails.mediationTimeSec = litigationDetails.mediationTimeSec.substring(0,10)
		}
		//二审判决/调解时间
		if(litigationDetails.adjustTimeSec != null 
				&& litigationDetails.adjustTimeSec != ""){
			litigationDetails.adjustTimeSec = litigationDetails.adjustTimeSec.substring(0,10)
		}
		//领取二审判决/调解时间
		if(litigationDetails.gotsecJudgmentAdjustTime != null 
				&& litigationDetails.gotsecJudgmentAdjustTime != ""){
			litigationDetails.gotsecJudgmentAdjustTime = litigationDetails.gotsecJudgmentAdjustTime.substring(0,10)
		}
		//二审判决公告刊登时间
		if(litigationDetails.adjustNoteTimeSec != null 
				&& litigationDetails.adjustNoteTimeSec != ""){
			litigationDetails.adjustNoteTimeSec = litigationDetails.adjustNoteTimeSec.substring(0,10)
		}
		//二审判决生效时间
		if(litigationDetails.effectTimeSec != null 
				&& litigationDetails.effectTimeSec != ""){
			litigationDetails.effectTimeSec = litigationDetails.effectTimeSec.substring(0,10)
		}
		//领取二审判决生效证明时间
		if(litigationDetails.gotsecJudgEffectProveTime != null 
				&& litigationDetails.gotsecJudgEffectProveTime != ""){
			litigationDetails.gotsecJudgEffectProveTime = litigationDetails.gotsecJudgEffectProveTime.substring(0,10)
		}
		
		//执行程序
		//申请执行时间
		if(litigationDetails.executeTime != null 
				&& litigationDetails.executeTime != ""){
			litigationDetails.executeTime = litigationDetails.executeTime.substring(0,10)
		}
		//受托执行时间
		if(litigationDetails.agentExecuteTime != null 
				&& litigationDetails.agentExecuteTime != ""){
			litigationDetails.agentExecuteTime = litigationDetails.agentExecuteTime.substring(0,10)
		}
		//收到法院终裁日期
		if(litigationDetails.adjustFinalTime != null 
				&& litigationDetails.adjustFinalTime != ""){
			litigationDetails.adjustFinalTime = litigationDetails.adjustFinalTime.substring(0,10)
		}
		//上失信日期
		if(litigationDetails.brokenPromisesTime != null 
				&& litigationDetails.brokenPromisesTime != ""){
			litigationDetails.brokenPromisesTime = litigationDetails.brokenPromisesTime.substring(0,10)
		}
		//申请恢复执行时间
		if(litigationDetails.applyResumeExecutionTime != null 
				&& litigationDetails.applyResumeExecutionTime != ""){
			litigationDetails.applyResumeExecutionTime = litigationDetails.applyResumeExecutionTime.substring(0,10)
		}
	}
	
	
	dataBindToElement(currentPage,litigationDetails);
	
	//一审程序--是否鉴定
	if(litigationDetails.identifyFlag == "Y"){
		currentPage.find("input[identity='identifyFlag']").prop("checked", true);
	}
	//第三人案件--第三人是否上诉
	if(litigationDetails.thirdPersonAppealFlag == "Y"){
		currentPage.find("input[identity='thirdPersonAppealFlag']").prop("checked", true);
	}
	//被诉案件--被诉是否上诉
	if(litigationDetails.defendandAppealFlag == "Y"){
		currentPage.find("input[identity='defendandAppealFlag']").prop("checked", true);
	}
	//执行程序--是否上失信
	if(litigationDetails.brokenPromisesFlag == "Y"){
		currentPage.find("input[identity='brokenPromisesFlag']").prop("checked", true);
	}
	//其他
	//无合同
	if(litigationDetails.noContractFlag == "Y"){
		currentPage.find("input[identity='noContractFlag']").prop("checked", true);
	}
	//无绿本
	if(litigationDetails.noGreenBookFlag == "Y"){
		currentPage.find("input[identity='noGreenBookFlag']").prop("checked", true);
	}
	//无抵押
	if(litigationDetails.unsecuredFlag == "Y"){
		currentPage.find("input[identity='unsecuredFlag']").prop("checked", true);
	}
	
	//有无终裁书
	if(litigationDetails.arbitrationFlag == "Y"){
		currentPage.find("[identity='arbitrationFlag']").text("有");
	}else{
		currentPage.find("[identity='arbitrationFlag']").text("无");
	}
	
}
