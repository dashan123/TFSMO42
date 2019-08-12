/*********************************************************login init begin*****************************************************************/	
var litigation_task_handle_page = $('#litigation_task_handle_page');
var litigation_task_handle_myScroll;
//保存诉讼详情信息接口的json对象
var litigationTaskHandleSubmitJson = {};
//保存判决内容接口的json对象
var litigationTaskHandleSubmitAdjustContentJson = {};
/******************************litigation_task_handle_page---begin**************************************/	   
litigation_task_handle_page.live('pageinit',function(e, ui){
	
	var wrapper = "litigation_task_handle_wrapper"
	var up = "litigation_task_handle_pullUp";
    var down = "litigation_task_handle_pullDown";;
    litigation_task_handle_myScroll = createMyScroll(wrapper,up,down);
	
    litigation_task_handle_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page();
	});
	
	//点击展开/关闭列表
    litigation_task_handle_page.find("div.litig-details h1").live("tap",function(e){
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
			initAdjustContentObjHeight();
		}
	});
	
    //点击提交按钮后，只将发生变化的项目信息传回CSS系统
    litigation_task_handle_page.find(".SaveBtn2").live("tap",function(){
    	submitLitigationTaskHandle();
    });

	// 阻止判决内容粘贴
//    document.getElementById("litigationTaskHandle_adjustContent").onpaste = function() {
//        return false;
//    }
    
    //点击选择框所在行
    litigation_task_handle_page.find(".checkboxLiClasss").live("tap", function(event){
		event.stopPropagation();
		var obj = $(this).find("input[type='checkbox']");
		if (obj) {
			//当前选中值
			var currVal = "";
			if ($(obj).is(":checked")) {
				$(obj).removeAttr("checked");
				currVal = "N";
			} else {
				$(obj).attr("checked", "checked");
				currVal = "Y";
			}
			
			var identityVal = $(obj).attr("identity");
			var initVal = $(obj).val();
			if(initVal == ""){
				initVal = "N";
			}
	    	if(initVal != currVal){
	    		litigationTaskHandleSubmitJson[identityVal] = currVal;
	    	}else{
	    		delete litigationTaskHandleSubmitJson[identityVal];
	    	}
		}
	});
	//点击选择框
    litigation_task_handle_page.find(".checkboxLiClasss input[type='checkbox']").live("tap", function(event){
		event.stopPropagation();
		var obj = $(this);
		if (obj) {
			//当前选中值
			var currVal = "";
			if ($(obj).is(":checked")) {
				$(obj).attr("checked", "checked");
				currVal = "Y";
			} else {
				$(obj).removeAttr("checked");
				currVal = "N";
			}
			
			var identityVal = $(obj).attr("identity");
			var initVal = $(obj).val();
			if(initVal == ""){
				initVal = "N";
			}
	    	if(initVal != currVal){
	    		litigationTaskHandleSubmitJson[identityVal] = currVal;
	    	}else{
	    		delete litigationTaskHandleSubmitJson[identityVal];
	    	}
		}
	});
	
});


litigation_task_handle_page.live('pageshow',function(e, ui){
	
	var $currentPage = $("#litigation_task_handle_page");
	
	currentLoadActionName = "litigation_task_handle_load_content";
	
	var page_from = session.get("page_from");
	var $bottomElem = $currentPage.find("ul[tag='collection_case_details_bottom']");
	if(page_from == "collecting_address_list_page"){
		
		$bottomElem.removeClass("bottoms4-red");
		$bottomElem.addClass("bottoms5-red");
		$bottomElem.find("li:eq(3)").attr("topage","litigation_collecting_address_details_page");
		$bottomElem.find("li:eq(3)").css("display","block");
		
	}else if(page_from == "litigation_todo_case_list_page"){
		
		$bottomElem.removeClass("bottoms5-red");
		$bottomElem.addClass("bottoms4-red");
		$bottomElem.find("li:eq(3)").css("display","none");
		
	}else if(page_from == "collection_record_list_page"){
		
		$bottomElem.removeClass("bottoms4-red");
		$bottomElem.addClass("bottoms5-red");
		$bottomElem.find("li:eq(3)").attr("topage","litigation_collection_record_details_page");
		$bottomElem.find("li:eq(3)").css("display","block");
		$bottomElem.find("li:eq(4)").attr("topage","collection_case_details_view_page");
		
	}
	
	//如果网络是连通的
	if(isNetworkConnected()){
		var fromPage = session.get("fromPage");
		
		 if(fromPage != "litigation_cost_list_page"
			 && fromPage != "litigation_record_list_page"
				 && fromPage != "litigation_courtInfo_list_page" 
					 && fromPage != "litigation_collecting_address_details_page" 
						 &&fromPage != "litigation_case_details_page"){
			
			 load_litigation_task_handle_content();
		 }
	}
	else{
		//读取缓存
		var key = {};
		key.userId = session.get("userId");
		key.fun = "litigation_task_handle";
		key.method = "load_litigation_task_handle_content";
		var keyExtra = {};
		keyExtra.caseId = session.get("caseId");
		key.extra = keyExtra;
		
		
		var extra={};
		extra.operation =ConstDef.getConstant("NATIVE_STORAGE_QUERY");
		extra.callback = "load_litigation_task_handle_content_from_native_storage";
		extra.newDataKey = {};
		extra.newData = {};

		loadNativeStorage(key.userId, key.fun, key.method , key.extra, extra.operation,extra.callback,extra.newDataKey,extra.newData);
	
	}
});

function litigation_task_handle_load_content(){
	//该方法被引用，不要删除，如果想实现向上划动刷新，则在此添加代码
}
//加载详细，并显示
function load_litigation_task_handle_content(){

	showLoading();
	
	 //清空保存诉讼详情信息接口的json对象
	   for(var key in litigationTaskHandleSubmitJson){
		  delete litigationTaskHandleSubmitJson[key];
	   }
		
	  //清空保存判决内容接口的json对象
	  for(var key in litigationTaskHandleSubmitAdjustContentJson){
		  delete litigationTaskHandleSubmitAdjustContentJson[key];
	  }
	  
	var currentPage = $("#litigation_task_handle_page");
	currentPage.find(".litig-details span[identity]").text("");
	  
	var postData = {};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	//案件号
    postData.caseId = session.get("caseId");
    
    $.getJSON(basePath+"/app/litigationTaskHandle/pageInit.xhtml"+callback, postData,function(msg){
		if ($.trim(msg.returnCode) == '0') {

			if (msg.data != null) {
				//将取到的数据存入缓存
				var key = {};
				key.userId = session.get("userId");
				key.fun = "litigation_task_handle";
				key.method = "load_litigation_task_handle_content";
				var keyExtra = {};
				keyExtra.caseId = session.get("caseId");
				key.extra = keyExtra;
				
				saveDownloadRawDataToNativeStorage(key.userId, key.fun, key.method, key.extra,msg);
				
				bind_litigation_task_handle_to_page(msg);
				initAdjustContentObjHeight();
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

//加载详细，并显示
function load_litigation_task_handle_content_from_native_storage(value){
	
	var currentPage = $("#litigation_task_handle_page");
	currentPage.find("span[identity]").text("");
	
	if(value){
		
		showLoading();

		var msg = JSON.parse(value); 

		if (msg.data != null) {
			bind_litigation_task_handle_to_page(msg);
			initAdjustContentObjHeight();
			
			showHide();
			showMessage('当前网络处于离线状态，您正在查看缓存数据', '1500');
		}
		else{
			showHide();
			showMessage('当前处于离线状态，未读到缓存数', '1500');
			}
	}
	else{
		showMessage('当前网络处于离线状态，未读到缓存数据', '1500');
	}
};

function bind_litigation_task_handle_to_page(msg){
	var currentPage = $("#litigation_task_handle_page");
	
	var data = msg.data;
	//诉讼详情
	var litigationDetails = data.litigationDetails;
	if(litigationDetails != null){
		//诉讼id
		session.set("lawsuitCaseId",litigationDetails.lawsuitCaseId);
		//合同号
		session.set("contractNo",litigationDetails.contractNo);
		//初始化诉讼阶段列表
		var $lawsuitStep = currentPage.find("[identity='lawsuitStep']");
		$lawsuitStep.empty();
		$lawsuitStep.append('<option value="">请选择</option>');
		var lawsuitStepSelectedVal = "";
		$.each(data.lawSuitStepList,function(i,n){
			
			var $lawsuitStepItem = '<option value="'+n.code+'">'+n.name+'</option>';
			if(n.name == litigationDetails.lawsuitStep){
				lawsuitStepSelectedVal = n.code;
			}
			
			$lawsuitStep.append($lawsuitStepItem);
		});
		$lawsuitStep.mobiscroll().select({
		        theme: 'red',
		        lang: 'zh',
		        display: 'bottom',
		        minWidth: 200,
		        onInit: function(event, inst){
		        	$lawsuitStep.mobiscroll('setVal',lawsuitStepSelectedVal,true);
		        },
		        onSet: function (event, inst) {
		        	var selectedVal = inst.getVal();
		        	var selectedText = event.valueText;
		        	var initTet = litigationDetails.lawsuitStep;
		        	var identityVal = $(this).attr("identity");
		        	if(initTet != selectedText){
			        	litigationTaskHandleSubmitJson[identityVal] = selectedVal;
		        	}else{
		        		delete litigationTaskHandleSubmitJson[identityVal];
		        	}
		        	
			    }
		    });
		
		//初始化诉讼类型列表
		var $lawsuitType = currentPage.find("[identity='lawsuitType']");
		$lawsuitType.empty();
		$lawsuitType.append('<option value="">请选择</option>');
		var lawsuitTypeSelectedVal = "";
		$.each(data.lawSuitTypeList,function(i,n){
			
			var $lawsuitTypeItem = '<option value="'+n.code+'">'+n.name+'</option>';
			if(n.name == litigationDetails.lawsuitType){
				lawsuitTypeSelectedVal = n.code;
			}
			$lawsuitType.append($lawsuitTypeItem);
		});
		$lawsuitType.mobiscroll().select({
	        theme: 'red',
	        lang: 'zh',
	        display: 'bottom',
	        minWidth: 200,
	        onInit: function(event, inst){
	        	$lawsuitType.mobiscroll('setVal',lawsuitTypeSelectedVal,true);
	        },
	        onSet: function (event, inst) {
	        	var selectedVal = inst.getVal();
	        	var selectedText = event.valueText;
	        	var initTet = litigationDetails.lawsuitType;
	        	var identityVal = $(this).attr("identity");
	        	if(initTet != selectedText){
		        	litigationTaskHandleSubmitJson[identityVal] = selectedVal;
	        	}else{
	        		delete litigationTaskHandleSubmitJson[identityVal];
	        	}
		    }
	    });
		
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
	
	//诉讼详情页面所有日期输入框初始化及设置与修改事件
	var $dateClassElement = $("#litigation_task_handle_page").find(".dateClass");
	$dateClassElement.mobiscroll().date({
	    theme: 'red',
	    lang: 'zh',
	    display: 'bottom',
	    buttons:['set','cancel','clear'],
	    clearText:'清除',
	    onSet:function(event,inst){
	    	var editDate = event.valueText;
	    	var newEditDate = new Date(editDate);
	    	var editDateFormat = Format(newEditDate,"yyyy-MM-dd");
	    	$(this).val(editDateFormat);
	    	var identityVal = $(this).attr("identity");
	    	var initVal = litigationDetails[identityVal];
	    	if(initVal == null || initVal == ""){
	    		litigationTaskHandleSubmitJson[identityVal] = editDateFormat;
	    	}else if(initVal.substring(0,10) != editDateFormat){
	    		litigationTaskHandleSubmitJson[identityVal] = editDateFormat;
	    	}else{
	    		delete litigationTaskHandleSubmitJson[identityVal];
	    	}
	    },
	    onChange: function (event, inst) {
	    },
	    onClear: function (event, inst) {
	    	var identityVal = $(this).attr("identity");
	    	var initVal = litigationDetails[identityVal];
	    	if(initVal == null || initVal == ""){
	    		delete litigationTaskHandleSubmitJson[identityVal];
	    	}else {
	    		litigationTaskHandleSubmitJson[identityVal] = "";
	    	}
	    }
	});
	
	//诉讼详情页面所有时间输入框初始化及设置与修改事件
	var $timeClassElement = $("#litigation_task_handle_page").find(".timeClass");
	$timeClassElement.mobiscroll().datetime({
	    theme: 'red',
	    lang: 'zh',
	    display: 'bottom',
	    buttons:['set','cancel','clear'],
	    clearText:'清除',
	    onSet:function(event,inst){
	    	var editDate = event.valueText;
	    	var newEditDate = new Date(editDate);
	    	var editDateFormat = Format(newEditDate,"yyyy-MM-dd HH:mm:ss");
	    	$(this).val(editDateFormat);
	    	var identityVal = $(this).attr("identity");
	    	var initVal = litigationDetails[identityVal];
	    	if(initVal == null || initVal == ""){
	    		litigationTaskHandleSubmitJson[identityVal] = editDateFormat;
	    	}else if(initVal.substring(0,19) != editDateFormat){
	    		litigationTaskHandleSubmitJson[identityVal] = editDateFormat;
	    	}else{
	    		delete litigationTaskHandleSubmitJson[identityVal];
	    	}
	    },
	    onChange: function (event, inst) {
	    },
	    onClear: function (event, inst) {
	    	var identityVal = $(this).attr("identity");
	    	var initVal = litigationDetails[identityVal];
	    	if(initVal == null || initVal == ""){
	    		delete litigationTaskHandleSubmitJson[identityVal];
	    	}else {
	    		litigationTaskHandleSubmitJson[identityVal] = "";
	    	}
	    }
	});
	
	//诉讼详情页面所有金额输入框失去焦点时的执行方法
	currentPage.find("input.AmountClass").live("blur",function(){
		//为了去除最后一个小数点. 
		this.value = this.value.replace(/\.$/g,""); 
		if(this.value != null && this.value != ""){
			this.value = parseFloat(this.value);
		}
		var identityVal = $(this).attr("identity");
		var currVal = this.value;
		var initVal = litigationDetails[identityVal];
    	if(initVal != currVal){
    		litigationTaskHandleSubmitJson[identityVal] = currVal;
    	}else{
    		delete litigationTaskHandleSubmitJson[identityVal];
    	}
	});
	
	//诉讼详情页面所有文本输入框失去焦点时的执行方法
	currentPage.find("input.TextClass").live("blur",function(){
		//限制字符串实际长度，中文2，英文1,超出的截取前面的部分
		var textLimitLength = $(this).attr("textLimitLength");
		var flag = limitLength(this,textLimitLength);
		if(flag == false){
			var inputText = $(this).attr("placeHolder");
			showMessage(inputText+"长度超过最大长度，已截取字符串前面部分显示！",5000);
		}
		
		var identityVal = $(this).attr("identity");
		var currVal = $(this).val();
		var initVal = litigationDetails[identityVal];
    	if(initVal != currVal){
    		litigationTaskHandleSubmitJson[identityVal] = currVal;
    	}else{
    		delete litigationTaskHandleSubmitJson[identityVal];
    	}
	});
	
	//诉讼详情页面可编辑div失去焦点时的执行方法
	currentPage.find(".test_box").live("input",function(){
		 //限制字符串长度(汉字、字母一样)
		var maxlen = $(this).attr("divLimitLength");
	    var str = $(this).text();
	    var len = str.length;
	    if(len > maxlen){
	    	str = str.substring(0,maxlen);
	    	$(this).text(str);
	    	$(this).blur();
	    	showMessage("判决内容长度超过最大长度，已截取字符串前面部分显示！",5000);
	    }
	    var objMinHeightStr = $(this).css("min-height");
	    var pxIndex = objMinHeightStr.indexOf("px");
		var objMinHeight =  objMinHeightStr.substring(0,pxIndex);
	   	var objHeight = $(this).outerHeight(true)+10;
	   	if(objHeight < objMinHeight){
			objHeight = objMinHeight;
		}
		$(this).parent().css("height",objHeight+"px");
		$(this).parent().parent().css("height",objHeight+"px");
		
		var identityVal = $(this).attr("identity");
		var currVal = $(this).text();
		var initVal = litigationDetails[identityVal];
		if(initVal != currVal){
			litigationTaskHandleSubmitAdjustContentJson[identityVal] = currVal;
		}else{
			delete litigationTaskHandleSubmitAdjustContentJson[identityVal];
		}
	    return false;
	});

	if(litigationDetails != null){
		//一审程序--是否鉴定
		if(litigationDetails.identifyFlag == "Y"){
			currentPage.find("input[identity='identifyFlag']").prop("checked", true);
			currentPage.find("input[identity='identifyFlag']").prop("value", "Y");
		}else{
			currentPage.find("input[identity='identifyFlag']").prop("checked", false);
			currentPage.find("input[identity='identifyFlag']").prop("value", "N");
		}
		
		//第三人案件--第三人是否上诉
		if(litigationDetails.thirdPersonAppealFlag == "Y"){
			currentPage.find("input[identity='thirdPersonAppealFlag']").prop("checked", true);
			currentPage.find("input[identity='thirdPersonAppealFlag']").prop("value", "Y");
		}else{
			currentPage.find("input[identity='thirdPersonAppealFlag']").prop("checked", false);
			currentPage.find("input[identity='thirdPersonAppealFlag']").prop("value", "N");
		}
		//被诉案件--被诉是否上诉
		if(litigationDetails.defendandAppealFlag == "Y"){
			currentPage.find("input[identity='defendandAppealFlag']").prop("checked", true);
			currentPage.find("input[identity='defendandAppealFlag']").prop("value", "Y");
		}else{
			currentPage.find("input[identity='defendandAppealFlag']").prop("checked", false);
			currentPage.find("input[identity='defendandAppealFlag']").prop("value", "N");
		}
		//执行程序--是否上失信
		if(litigationDetails.brokenPromisesFlag == "Y"){
			currentPage.find("input[identity='brokenPromisesFlag']").prop("checked", true);
			currentPage.find("input[identity='brokenPromisesFlag']").prop("value", "Y");
		}else{
			currentPage.find("input[identity='brokenPromisesFlag']").prop("checked", false);
			currentPage.find("input[identity='brokenPromisesFlag']").prop("value", "N");
		}
		//其他
		//无合同
		if(litigationDetails.noContractFlag == "Y"){
			currentPage.find("input[identity='noContractFlag']").prop("checked", true);
			currentPage.find("input[identity='noContractFlag']").prop("value", "Y");
		}else{
			currentPage.find("input[identity='noContractFlag']").prop("checked", false);
			currentPage.find("input[identity='noContractFlag']").prop("value", "N");
		}
		//无绿本
		if(litigationDetails.noGreenBookFlag == "Y"){
			currentPage.find("input[identity='noGreenBookFlag']").prop("checked", true);
			currentPage.find("input[identity='noGreenBookFlag']").prop("value", "Y");
		}else{
			currentPage.find("input[identity='noGreenBookFlag']").prop("checked", false);
			currentPage.find("input[identity='noGreenBookFlag']").prop("value", "N");
		}
		//无抵押
		if(litigationDetails.unsecuredFlag == "Y"){
			currentPage.find("input[identity='unsecuredFlag']").prop("checked", true);
			currentPage.find("input[identity='unsecuredFlag']").prop("value", "Y");
		}else{
			currentPage.find("input[identity='unsecuredFlag']").prop("checked", false);
			currentPage.find("input[identity='unsecuredFlag']").prop("value", "N");
		}
		
		//有无终裁书
		//初始化有无终裁书列表
		var $arbitrationFlag = currentPage.find("[identity='arbitrationFlag']");
		$arbitrationFlag.mobiscroll().select({
	        theme: 'red',
	        lang: 'zh',
	        display: 'bottom',
	        minWidth: 200,
	        onInit:function(event,inst){
	        	if(litigationDetails.arbitrationFlag == "Y"){
	    			currentPage.find("[identity='arbitrationFlag']").mobiscroll('setVal',"Y",true);
	    		}else{
	    			currentPage.find("[identity='arbitrationFlag']").mobiscroll('setVal',"N",true);
	    		}
	        },
	        onSet: function (event, inst) {
	        	var selectedVal = inst.getVal();
	        	var identityVal = $(this).attr("identity");
	        	var initVal = litigationDetails[identityVal];
	        	if(initVal == ""){
	        		initVal = "N";
	        	}
	        	if(initVal != selectedVal){
		        	litigationTaskHandleSubmitJson[identityVal] = selectedVal;
	        	}else{
	        		delete litigationTaskHandleSubmitJson[identityVal];
	        	}
	        }
	    });
		
	}
	

	//案件类型
	var caseCategory = session.get("caseCategory")
	//如果案件为诉讼协办案件时，关键项目只能查看，不能编辑
	if(caseCategory == ConstDef.getConstant("CASE_CATEGORY_ASSIST")){
		//诉前程序：诉前调解时间
		currentPage.find("input[identity='mediationTimePre']").css("display","none");
		currentPage.find("span[identity='mediationTimePre']").css("display","");
		//一审程序：一审调解时间、一审第一次开庭时间、一审第二次开庭时间
		currentPage.find("input[identity='adjustTime']").css("display","none");
		currentPage.find("span[identity='adjustTime']").css("display","");
		
		currentPage.find("input[identity='courtOpentimeFst']").css("display","none");
		currentPage.find("span[identity='courtOpentimeFst']").css("display","");
		
		currentPage.find("input[identity='courtOpentimeFst2']").css("display","none");
		currentPage.find("span[identity='courtOpentimeFst2']").css("display","");
		
		//第三人案件：第三人第一次开庭时间、第三人第二次开庭时间
		currentPage.find("input[identity='thirdPersonFstTrialTime']").css("display","none");
		currentPage.find("span[identity='thirdPersonFstTrialTime']").css("display","");
		
		currentPage.find("input[identity='thirdPersonSecTrialTime']").css("display","none");
		currentPage.find("span[identity='thirdPersonSecTrialTime']").css("display","");
		
		//被诉案件：被诉第一次开庭时间、被诉第二次开庭时间
		currentPage.find("input[identity='defendandFirstTaialTime']").css("display","none");
		currentPage.find("span[identity='defendandFirstTaialTime']").css("display","");
		
		currentPage.find("input[identity='defendandSecTaialTime']").css("display","none");
		currentPage.find("span[identity='defendandSecTaialTime']").css("display","");
		
		//二审程序；二审调解时间、二审第一次开庭时间、二审第二次开庭时间
		currentPage.find("input[identity='mediationTimeSec']").css("display","none");
		currentPage.find("span[identity='mediationTimeSec']").css("display","");
		
		currentPage.find("input[identity='courtOpentimeSec']").css("display","none");
		currentPage.find("span[identity='courtOpentimeSec']").css("display","");
		
		currentPage.find("input[identity='secondTrialSec']").css("display","none");
		currentPage.find("span[identity='secondTrialSec']").css("display","");

	}else{
		//诉前程序：诉前调解时间
		currentPage.find("input[identity='mediationTimePre']").css("display","");
		currentPage.find("span[identity='mediationTimePre']").css("display","none");
		//一审程序：一审调解时间、一审第一次开庭时间、一审第二次开庭时间
		currentPage.find("input[identity='adjustTime']").css("display","");
		currentPage.find("span[identity='adjustTime']").css("display","none");
		
		currentPage.find("input[identity='courtOpentimeFst']").css("display","");
		currentPage.find("span[identity='courtOpentimeFst']").css("display","none");
		
		currentPage.find("input[identity='courtOpentimeFst2']").css("display","");
		currentPage.find("span[identity='courtOpentimeFst2']").css("display","none");
		
		//第三人案件：第三人第一次开庭时间、第三人第二次开庭时间
		currentPage.find("input[identity='thirdPersonFstTrialTime']").css("display","");
		currentPage.find("span[identity='thirdPersonFstTrialTime']").css("display","none");
		
		currentPage.find("input[identity='thirdPersonSecTrialTime']").css("display","");
		currentPage.find("span[identity='thirdPersonSecTrialTime']").css("display","none");
		
		//被诉案件：被诉第一次开庭时间、被诉第二次开庭时间
		currentPage.find("input[identity='defendandFirstTaialTime']").css("display","");
		currentPage.find("span[identity='defendandFirstTaialTime']").css("display","none");
		
		currentPage.find("input[identity='defendandSecTaialTime']").css("display","");
		currentPage.find("span[identity='defendandSecTaialTime']").css("display","none");
		
		//二审程序；二审调解时间、二审第一次开庭时间、二审第二次开庭时间
		currentPage.find("input[identity='mediationTimeSec']").css("display","");
		currentPage.find("span[identity='mediationTimeSec']").css("display","none");
		
		currentPage.find("input[identity='courtOpentimeSec']").css("display","");
		currentPage.find("span[identity='courtOpentimeSec']").css("display","none");
		
		currentPage.find("input[identity='secondTrialSec']").css("display","");
		currentPage.find("span[identity='secondTrialSec']").css("display","none");
	}
	
}

//点击提交按钮后，只将发生变化的项目信息传回CSS系统
function submitLitigationTaskHandle(){
	  
	  var page = $('#litigation_task_handle_page');
	  
	  if($.isEmptyObject(litigationTaskHandleSubmitJson)
			   && $.isEmptyObject(litigationTaskHandleSubmitAdjustContentJson)
	  	){
			 showMessage('没有需要保存的数据！','3000');
			  page.find("input[identity='lawsuitStep']").focus();
			  return false;
		}
	 
	  //诉讼id
	  var lawsuitCaseId = page.find("[identity='lawsuitCaseId']").text();
	  if(lawsuitCaseId == null || lawsuitCaseId == ""){
		  showMessage('诉讼ID不存在，不能提交诉讼详情信息！','3000');
		  return false;
	  }
	  //合同号
	  var contractNo = page.find("[identity='contractNo']").text();
	  
	  //报文前缀
	  var messagePrefix = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>";
	  //拼接保存诉讼详情信息接口的报文
	  var saveLitigationInfoMessage = "";
	  if(!$.isEmptyObject(litigationTaskHandleSubmitJson)){
		  saveLitigationInfoMessage += messagePrefix;
		  //根节点--开始
		  saveLitigationInfoMessage += "<root>";
		  //诉讼id
		  saveLitigationInfoMessage += "<lawsuitCaseId>"+lawsuitCaseId+"</lawsuitCaseId>";
		  //案件id
		  var caseId = session.get("caseId");
		  if(caseId == null || caseId == ""){
			  showMessage('案件ID不存在，不能提交诉讼详情信息！','3000');
			  return false;
		  }
		  saveLitigationInfoMessage += "<caseId>"+caseId+"</caseId>";
		  //客户姓名
		  var custmorName = page.find("[identity='custmorName']").text();
		  saveLitigationInfoMessage += "<name>"+custmorName+"</name>";
		  //合同号
		  saveLitigationInfoMessage += "<contractNo>"+contractNo+"</contractNo>";
		  //诉讼编号
		  var lawsuitSn = page.find("[identity='lawsuitSn']").text();
		  saveLitigationInfoMessage += "<ligiNumber>"+lawsuitSn+"</ligiNumber>";
		  //城市
		  var cityName = page.find("[identity='cityName']").text();
		  saveLitigationInfoMessage += "<city>"+cityName+"</city>";
		  //区域
		  var regionName = page.find("[identity='regionName']").text();
		  saveLitigationInfoMessage += "<area>"+regionName+"</area>";
		  
		  //************诉讼信息子节点--开始*************
		  saveLitigationInfoMessage += "<litigationInfo>";
		  //诉讼阶段--只传code不需要传中文
		  if(litigationTaskHandleSubmitJson.lawsuitStep != null){
			  saveLitigationInfoMessage += "<lawStep>"+litigationTaskHandleSubmitJson.lawsuitStep+"</lawStep>";
		  }
		  //诉讼类型--只传code不需要传中文
		  if(litigationTaskHandleSubmitJson.lawsuitType != null){
			  saveLitigationInfoMessage += "<lawSuitType>"+litigationTaskHandleSubmitJson.lawsuitType+"</lawSuitType>";
		  }
		  //***********诉前程序--开始*****************
		  //申请诉前保全时间
		  if(litigationTaskHandleSubmitJson.protectedTimePre != null){
			  saveLitigationInfoMessage += "<protectedTimePre>"+litigationTaskHandleSubmitJson.protectedTimePre+"</protectedTimePre>";
		  }
		  //诉前保全法院
		  if(litigationTaskHandleSubmitJson.protectedCourtPre != null){
			  saveLitigationInfoMessage += "<protectedCourtPre>"+litigationTaskHandleSubmitJson.protectedCourtPre+"</protectedCourtPre>";
		  }
		  //采取诉前保全时间--格式:yyyy-MM-dd
		  if(litigationTaskHandleSubmitJson.protectedTimeExe != null){
			  saveLitigationInfoMessage += "<protectedTimeExe>"+litigationTaskHandleSubmitJson.protectedTimeExe+"</protectedTimeExe>";
		  }
		  //诉前缴纳保证金时间--格式:yyyy-MM-dd
		  if(litigationTaskHandleSubmitJson.payDepositTimePre != null){
			  saveLitigationInfoMessage += "<payDepositTimePre>"+litigationTaskHandleSubmitJson.payDepositTimePre+"</payDepositTimePre>";
		  }
		  //诉前退还保证金时间--格式:yyyy-MM-dd
		  if(litigationTaskHandleSubmitJson.depositBackTimePre != null){
			  saveLitigationInfoMessage += "<depositBackTimePreLaw>"+litigationTaskHandleSubmitJson.depositBackTimePre+"</depositBackTimePreLaw>";
		  }
		  //申请诉前调解时间--格式:yyyy-MM-dd
		  if(litigationTaskHandleSubmitJson.adjustTimePre != null){
			  saveLitigationInfoMessage += "<adjustTimePre>"+litigationTaskHandleSubmitJson.adjustTimePre+"</adjustTimePre>";
		  }
		  //诉前调节法院
		  if(litigationTaskHandleSubmitJson.adjustCourtPre != null){
			  saveLitigationInfoMessage += "<adjustCourtPre>"+litigationTaskHandleSubmitJson.adjustCourtPre+"</adjustCourtPre>";
		  }
		  //诉前调节案号
		  if(litigationTaskHandleSubmitJson.mediationCaseNbrPre != null){
			  saveLitigationInfoMessage += "<mediationCaseNbrPre>"+litigationTaskHandleSubmitJson.mediationCaseNbrPre+"</mediationCaseNbrPre>";
		  }
		  //诉前调解金额
		  if(litigationTaskHandleSubmitJson.settlementAmountPre != null){
			  saveLitigationInfoMessage += "<settlementAmountPre>"+litigationTaskHandleSubmitJson.settlementAmountPre+"</settlementAmountPre>";
		  }
		  //诉前调解时间--格式:yyyy-MM-dd HH:mm:ss
		  if(litigationTaskHandleSubmitJson.mediationTimePre != null){
			  saveLitigationInfoMessage += "<mediationTimePre>"+litigationTaskHandleSubmitJson.mediationTimePre+"</mediationTimePre>";
		  }
		  //领取诉前调解书时间--格式:yyyy-MM-dd
		  if(litigationTaskHandleSubmitJson.gotconciliStatementTimePre != null){
			  saveLitigationInfoMessage += "<gotConciliationStatementTimePre>"+litigationTaskHandleSubmitJson.gotconciliStatementTimePre+"</gotConciliationStatementTimePre>";
		  }
		  //诉前调解生效时间--格式:yyyy-MM-dd
		  if(litigationTaskHandleSubmitJson.mediationEffectTimePre != null){
			  saveLitigationInfoMessage += "<mediationEffectTimePre>"+litigationTaskHandleSubmitJson.mediationEffectTimePre+"</mediationEffectTimePre>";
		  }
		  //诉前调解领取生效证明时间--格式:yyyy-MM-dd
		  if(litigationTaskHandleSubmitJson.gotmediationEffectTimePre != null){
			  saveLitigationInfoMessage += "<gotMediationEffectTimePre>"+litigationTaskHandleSubmitJson.gotmediationEffectTimePre+"</gotMediationEffectTimePre>";
		  }
		  //***********诉前程序--结束*****************
		  //***********债权主张--开始*****************
		  //提交债权主张时间--格式:yyyy-MM-dd
		  if(litigationTaskHandleSubmitJson.advocateTime != null){
			  saveLitigationInfoMessage += "<advocateTime>"+litigationTaskHandleSubmitJson.advocateTime+"</advocateTime>";
		  }
		  //受理债权主张法院
		  if(litigationTaskHandleSubmitJson.advocateCourt != null){
			  saveLitigationInfoMessage += "<advocateCourt>"+litigationTaskHandleSubmitJson.advocateCourt+"</advocateCourt>";
		  }
		  //债权主张金额
		  if(litigationTaskHandleSubmitJson.advocateClaimsAmount != null){
			  saveLitigationInfoMessage += "<advocatesClaimsAmount>"+litigationTaskHandleSubmitJson.advocateClaimsAmount+"</advocatesClaimsAmount>";
		  }
		  //***********债权主张--结束*****************
		  
		  //***********一审程序--开始*****************
		  //一审立案时间--格式:yyyy-MM-dd
		  if(litigationTaskHandleSubmitJson.fileTime != null){
			  saveLitigationInfoMessage += "<fileTime>"+litigationTaskHandleSubmitJson.fileTime+"</fileTime>";
		  }
		  //一审立案法院
		  if(litigationTaskHandleSubmitJson.fileCourt != null){
			  saveLitigationInfoMessage += "<fileCourt>"+litigationTaskHandleSubmitJson.fileCourt+"</fileCourt>";
		  }
		  //一审诉讼请求金额
		  if(litigationTaskHandleSubmitJson.firstTrialClaimsAmount != null){
			  saveLitigationInfoMessage += "<firstTrialClaimsAmount>"+litigationTaskHandleSubmitJson.firstTrialClaimsAmount+"</firstTrialClaimsAmount>";
		  }
		  //一审案号
		  if(litigationTaskHandleSubmitJson.caseNbrFst != null){
			  saveLitigationInfoMessage += "<caseNbrFst>"+litigationTaskHandleSubmitJson.caseNbrFst+"</caseNbrFst>";
		  }
		  //申请诉讼保全时间--格式:yyyy-MM-dd
		  if(litigationTaskHandleSubmitJson.protectedTimeLaw != null){
			  saveLitigationInfoMessage += "<protectedTimeLaw>"+litigationTaskHandleSubmitJson.protectedTimeLaw+"</protectedTimeLaw>";
		  }
		  //缴纳诉讼保证金时间--格式:yyyy-MM-dd
		  if(litigationTaskHandleSubmitJson.cashDepositTime != null){
			  saveLitigationInfoMessage += "<cashDepositTime>"+litigationTaskHandleSubmitJson.cashDepositTime+"</cashDepositTime>";
		  }
		  //退还诉讼保证金时间--格式:yyyy-MM-dd
		  if(litigationTaskHandleSubmitJson.depositBackTime != null){
			  saveLitigationInfoMessage += "<depositBackTime>"+litigationTaskHandleSubmitJson.depositBackTime+"</depositBackTime>";
		  }
		  //采取诉讼保全时间--格式:yyyy-MM-dd
		  if(litigationTaskHandleSubmitJson.protectedTimeLawexe != null){
			  saveLitigationInfoMessage += "<protectedTimeLawexe>"+litigationTaskHandleSubmitJson.protectedTimeLawexe+"</protectedTimeLawexe>";
		  }
		  //一审开庭公告刊登时间--格式:yyyy-MM-dd
		  if(litigationTaskHandleSubmitJson.openNoteTime != null){
			  saveLitigationInfoMessage += "<openNoteTime>"+litigationTaskHandleSubmitJson.openNoteTime+"</openNoteTime>";
		  }
		  //一审调解时间--格式:yyyy-MM-dd
		  if(litigationTaskHandleSubmitJson.adjustTime != null){
			  saveLitigationInfoMessage += "<adjustTime>"+litigationTaskHandleSubmitJson.adjustTime+"</adjustTime>";
		  }
		  //一审第一次开庭时间--格式:yyyy-MM-dd HH:mm:ss
		  if(litigationTaskHandleSubmitJson.courtOpentimeFst != null){
			  saveLitigationInfoMessage += "<courtOpentimeFst>"+litigationTaskHandleSubmitJson.courtOpentimeFst+"</courtOpentimeFst>";
		  }
		  //一审第二次开庭时间--格式:yyyy-MM-dd HH:mm:ss
		  if(litigationTaskHandleSubmitJson.courtOpentimeFst2 != null){
			  saveLitigationInfoMessage += "<courtOpentimeFst2>"+litigationTaskHandleSubmitJson.courtOpentimeFst2+"</courtOpentimeFst2>";
		  }
		  //一审判决/调解时间--格式:yyyy-MM-dd
		  if(litigationTaskHandleSubmitJson.adjustTimeFst != null){
			  saveLitigationInfoMessage += "<adjustTimeFst>"+litigationTaskHandleSubmitJson.adjustTimeFst+"</adjustTimeFst>";
		  }
		  //领取一审判决/调解时间--格式:yyyy-MM-dd
		  if(litigationTaskHandleSubmitJson.gotfirstJudgmentAdjustTime != null){
			  saveLitigationInfoMessage += "<gotFirstJudgmentAdjustTime>"+litigationTaskHandleSubmitJson.gotfirstJudgmentAdjustTime+"</gotFirstJudgmentAdjustTime>";
		  }
		  //一审判决公告刊登时间--格式:yyyy-MM-dd
		  if(litigationTaskHandleSubmitJson.adjustNoteTime != null){
			  saveLitigationInfoMessage += "<adjustNoteTime>"+litigationTaskHandleSubmitJson.adjustNoteTime+"</adjustNoteTime>";
		  }
		  //一审判决生效时间--格式:yyyy-MM-dd
		  if(litigationTaskHandleSubmitJson.effectTime != null){
			  saveLitigationInfoMessage += "<effectTime>"+litigationTaskHandleSubmitJson.effectTime+"</effectTime>";
		  }
		  //领取一审判决生效证明时间--格式:yyyy-MM-dd
		  if(litigationTaskHandleSubmitJson.gotfstJudgEffectProveTime != null){
			  saveLitigationInfoMessage += "<gotFirstJudgmentEffectProveTime>"+litigationTaskHandleSubmitJson.gotfstJudgEffectProveTime+"</gotFirstJudgmentEffectProveTime>";
		  }
		  //是否鉴定--Y是，N否
		  if(litigationTaskHandleSubmitJson.identifyFlag != null){
			  saveLitigationInfoMessage += "<identifyFlag>"+litigationTaskHandleSubmitJson.identifyFlag+"</identifyFlag>";
		  }
		  // 鉴定结果
		  if(litigationTaskHandleSubmitJson.identifyResult != null){
			  saveLitigationInfoMessage += "<identifyResult>"+litigationTaskHandleSubmitJson.identifyResult+"</identifyResult>";
		  }
		  //************一审程序--结束*****************
		  //************第三人案件--开始*****************
		  //第三人收到传票时间--格式:yyyy-MM-dd
		  if(litigationTaskHandleSubmitJson.thirdReceivedSummonsTime != null){
			  saveLitigationInfoMessage += "<thirdPersonReceivedSummonsTime>"+litigationTaskHandleSubmitJson.thirdReceivedSummonsTime+"</thirdPersonReceivedSummonsTime>";
		  }
		  //第三人法院
		  if(litigationTaskHandleSubmitJson.thirdPersonCourt != null){
			  saveLitigationInfoMessage += "<thirdPersonCourt>"+litigationTaskHandleSubmitJson.thirdPersonCourt+"</thirdPersonCourt>";
		  }
		  //第三人案由
		  if(litigationTaskHandleSubmitJson.thirdPersonCaseReason != null){
			  saveLitigationInfoMessage += "<thirdPersonCaseReason>"+litigationTaskHandleSubmitJson.thirdPersonCaseReason+"</thirdPersonCaseReason>";
		  }
		  //第三人案号
		  if(litigationTaskHandleSubmitJson.thirdPersonCaseNbr != null){
			  saveLitigationInfoMessage += "<thirdPersonCaseNbr>"+litigationTaskHandleSubmitJson.thirdPersonCaseNbr+"</thirdPersonCaseNbr>";
		  }
		  //第三人诉讼请求金额
		  if(litigationTaskHandleSubmitJson.thirdPersonRequestAmount != null){
			  saveLitigationInfoMessage += "<thirdPosionRequestAmount>"+litigationTaskHandleSubmitJson.thirdPersonRequestAmount+"</thirdPosionRequestAmount>";
		  }
		  //第三人第一次开庭时间--格式:yyyy-MM-dd HH:mm:ss
		  if(litigationTaskHandleSubmitJson.thirdPersonFstTrialTime != null){
			  saveLitigationInfoMessage += "<thirdPersonFstTrialTime>"+litigationTaskHandleSubmitJson.thirdPersonFstTrialTime+"</thirdPersonFstTrialTime>";
		  }
		  //第三人第二次开庭时间--格式:yyyy-MM-dd HH:mm:ss
		  if(litigationTaskHandleSubmitJson.thirdPersonSecTrialTime != null){
			  saveLitigationInfoMessage += "<thirdPersonSecTrialTime>"+litigationTaskHandleSubmitJson.thirdPersonSecTrialTime+"</thirdPersonSecTrialTime>";
		  }
		  //第三人领取判决时间--格式:yyyy-MM-dd
		  if(litigationTaskHandleSubmitJson.thirdPersonGotsentenceTime != null){
			  saveLitigationInfoMessage += "<thirdPersonGotSentenceTime>"+litigationTaskHandleSubmitJson.thirdPersonGotsentenceTime+"</thirdPersonGotSentenceTime>";
		  }
		  //第三人是否上诉--Y是N否
		  if(litigationTaskHandleSubmitJson.thirdPersonAppealFlag != null){
			  saveLitigationInfoMessage += "<thirdPersonAppealFlag>"+litigationTaskHandleSubmitJson.thirdPersonAppealFlag+"</thirdPersonAppealFlag>";
		  }
		  //************第三人案件--结束*****************
		  //************被诉案件--开始*****************
		  //被诉收到传票时间--格式:yyyy-MM-dd
		  if(litigationTaskHandleSubmitJson.defendandReceiveSummonTime != null){
			  saveLitigationInfoMessage += "<defendandReceivedSummonsTime>"+litigationTaskHandleSubmitJson.defendandReceiveSummonTime+"</defendandReceivedSummonsTime>";
		  }
		  //被诉法院
		  if(litigationTaskHandleSubmitJson.defendandCourt != null){
			  saveLitigationInfoMessage += "<defendandCourt>"+litigationTaskHandleSubmitJson.defendandCourt+"</defendandCourt>";
		  }
		  //被诉案由
		  if(litigationTaskHandleSubmitJson.defendandCaseReason != null){
			  saveLitigationInfoMessage += "<defendandCaseReason>"+litigationTaskHandleSubmitJson.defendandCaseReason+"</defendandCaseReason>";
		  }
		  //被诉案号
		  if(litigationTaskHandleSubmitJson.defendandCaseNbr != null){
			  saveLitigationInfoMessage += "<defendandCaseNbr>"+litigationTaskHandleSubmitJson.defendandCaseNbr+"</defendandCaseNbr>";
		  }
		  //被诉诉讼请求金额
		  if(litigationTaskHandleSubmitJson.defendandRequestAmount != null){
			  saveLitigationInfoMessage += "<defendandRequestAmount>"+litigationTaskHandleSubmitJson.defendandRequestAmount+"</defendandRequestAmount>";
		  }
		  //被诉第一次开庭时间--格式:yyyy-MM-dd HH:mm:ss
		  if(litigationTaskHandleSubmitJson.defendandFirstTaialTime != null){
			  saveLitigationInfoMessage += "<defendandFirstTrialTime>"+litigationTaskHandleSubmitJson.defendandFirstTaialTime+"</defendandFirstTrialTime>";
		  }
		  //被诉第二次开庭时间--格式:yyyy-MM-dd HH:mm:ss
		  if(litigationTaskHandleSubmitJson.defendandSecTaialTime != null){
			  saveLitigationInfoMessage += "<defendandSecTrialTime>"+litigationTaskHandleSubmitJson.defendandSecTaialTime+"</defendandSecTrialTime>";
		  }
		  //被诉领取判决时间--格式:yyyy-MM-dd
		  if(litigationTaskHandleSubmitJson.defendandGotsentenceTime != null){
			  saveLitigationInfoMessage += "<defendandGotSentenceTime>"+litigationTaskHandleSubmitJson.defendandGotsentenceTime+"</defendandGotSentenceTime>";
		  }
		  //被诉是否上诉--Y是N否
		  if(litigationTaskHandleSubmitJson.defendandAppealFlag != null){
			  saveLitigationInfoMessage += "<defendandAppealFlag>"+litigationTaskHandleSubmitJson.defendandAppealFlag+"</defendandAppealFlag>";
		  }
		  //************被诉案件--结束*****************
		  //************二审程序--开始*****************
		  //提出/收到二审诉状时间--格式:yyyy-MM-dd
		  if(litigationTaskHandleSubmitJson.indictTimeSec != null){
			  saveLitigationInfoMessage += "<indictTimeSec>"+litigationTaskHandleSubmitJson.indictTimeSec+"</indictTimeSec>";
		  }
		  //二审立案法院
		  if(litigationTaskHandleSubmitJson.courtSec != null){
			  saveLitigationInfoMessage += "<courtSec>"+litigationTaskHandleSubmitJson.courtSec+"</courtSec>";
		  }
		  //二审诉讼请求金额
		  if(litigationTaskHandleSubmitJson.secTrialClaimsAmount != null){
			  saveLitigationInfoMessage += "<secTrialClaimsAmount>"+litigationTaskHandleSubmitJson.secTrialClaimsAmount+"</secTrialClaimsAmount>";
		  }
		  //二审案号
		  if(litigationTaskHandleSubmitJson.caseNbrSec != null){
			  saveLitigationInfoMessage += "<caseNbrSec>"+litigationTaskHandleSubmitJson.caseNbrSec+"</caseNbrSec>";
		  }
		  //二审开庭公告刊登时间--格式:yyyy-MM-dd
		  if(litigationTaskHandleSubmitJson.openNoteTimeSec != null){
			  saveLitigationInfoMessage += "<openNoteTimeSec>"+litigationTaskHandleSubmitJson.openNoteTimeSec+"</openNoteTimeSec>";
		  }
		  //二审调解时间--格式:yyyy-MM-dd
		  if(litigationTaskHandleSubmitJson.mediationTimeSec != null){
			  saveLitigationInfoMessage += "<mediationTimeSec>"+litigationTaskHandleSubmitJson.mediationTimeSec+"</mediationTimeSec>";
		  }
		  //二审第一次开庭时间--格式:yyyy-MM-dd HH:mm:ss
		  if(litigationTaskHandleSubmitJson.courtOpentimeSec != null){
			  saveLitigationInfoMessage += "<courtOpentimeSec>"+litigationTaskHandleSubmitJson.courtOpentimeSec+"</courtOpentimeSec>";
		  }
		  //二审第二次开庭时间--格式:yyyy-MM-dd HH:mm:ss
		  if(litigationTaskHandleSubmitJson.secondTrialSec != null){
			  saveLitigationInfoMessage += "<secondTrialSec>"+litigationTaskHandleSubmitJson.secondTrialSec+"</secondTrialSec>";
		  }
		  //二审判决/调解时间-格式:yyyy-MM-dd
		  if(litigationTaskHandleSubmitJson.adjustTimeSec != null){
			  saveLitigationInfoMessage += "<adjustTimeSec>"+litigationTaskHandleSubmitJson.adjustTimeSec+"</adjustTimeSec>";
		  }
		  //领取二审判决/调解时间-格式:yyyy-MM-dd
		  if(litigationTaskHandleSubmitJson.gotsecJudgmentAdjustTime != null){
			  saveLitigationInfoMessage += "<gotSecJudgmentAdjustTime>"+litigationTaskHandleSubmitJson.gotsecJudgmentAdjustTime+"</gotSecJudgmentAdjustTime>";
		  }
		  //二审判决公告刊登时间-格式:yyyy-MM-dd
		  if(litigationTaskHandleSubmitJson.adjustNoteTimeSec != null){
			  saveLitigationInfoMessage += "<adjustNoteTimeSec>"+litigationTaskHandleSubmitJson.adjustNoteTimeSec+"</adjustNoteTimeSec>";
		  }
		  //二审判决生效时间-格式:yyyy-MM-dd
		  if(litigationTaskHandleSubmitJson.effectTimeSec != null){
			  saveLitigationInfoMessage += "<effectTimeSec>"+litigationTaskHandleSubmitJson.effectTimeSec+"</effectTimeSec>";
		  }
		  //领取二审判决生效证明时间-格式:yyyy-MM-dd
		  if(litigationTaskHandleSubmitJson.gotsecJudgEffectProveTime != null){
			  saveLitigationInfoMessage += "<gotSecJudgmentEffectProveTime>"+litigationTaskHandleSubmitJson.gotsecJudgEffectProveTime+"</gotSecJudgmentEffectProveTime>";
		  }
		  //************二审程序--结束*****************
		  //************执行程序--开始*****************
		  //申请执行时间-格式:yyyy-MM-dd
		  if(litigationTaskHandleSubmitJson.executeTime != null){
			  saveLitigationInfoMessage += "<executeTime>"+litigationTaskHandleSubmitJson.executeTime+"</executeTime>";
		  }
		  //申请执行法院
		  if(litigationTaskHandleSubmitJson.executeCourt != null){
			  saveLitigationInfoMessage += "<executeCourt>"+litigationTaskHandleSubmitJson.executeCourt+"</executeCourt>";
		  }
		  //执行案号
		  if(litigationTaskHandleSubmitJson.executeCaseNbr != null){
			  saveLitigationInfoMessage += "<executeCaseNbr>"+litigationTaskHandleSubmitJson.executeCaseNbr+"</executeCaseNbr>";
		  }
		  //执行标的金额
		  if(litigationTaskHandleSubmitJson.performAmount != null){
			  saveLitigationInfoMessage += "<performAmount>"+litigationTaskHandleSubmitJson.performAmount+"</performAmount>";
		  }
		  //受托执行时间--格式:yyyy-MM-dd
		  if(litigationTaskHandleSubmitJson.agentExecuteTime != null){
			  saveLitigationInfoMessage += "<agentExecuteTime>"+litigationTaskHandleSubmitJson.agentExecuteTime+"</agentExecuteTime>";
		  }
		  //受托执行法院
		  if(litigationTaskHandleSubmitJson.agentExecuteCourt != null){
			  saveLitigationInfoMessage += "<agentExecuteCourt>"+litigationTaskHandleSubmitJson.agentExecuteCourt+"</agentExecuteCourt>";
		  }
		  //受托执行案号
		  if(litigationTaskHandleSubmitJson.trusteePerform != null){
			  saveLitigationInfoMessage += "<trusteePerform>"+litigationTaskHandleSubmitJson.trusteePerform+"</trusteePerform>";
		  }
		  //收到法院终裁日期--格式:yyyy-MM-dd
		  if(litigationTaskHandleSubmitJson.adjustFinalTime != null){
			  saveLitigationInfoMessage += "<adjustFinalTime>"+litigationTaskHandleSubmitJson.adjustFinalTime+"</adjustFinalTime>";
		  }
		  //是否上失信--Y是N否
		  if(litigationTaskHandleSubmitJson.brokenPromisesFlag != null){
			  saveLitigationInfoMessage += "<brokenPromisesFlag>"+litigationTaskHandleSubmitJson.brokenPromisesFlag+"</brokenPromisesFlag>";
		  }
		  //上失信日期--格式:yyyy-MM-dd
		  if(litigationTaskHandleSubmitJson.brokenPromisesTime != null){
			  saveLitigationInfoMessage += "<brokenPromisesTime>"+litigationTaskHandleSubmitJson.brokenPromisesTime+"</brokenPromisesTime>";
		  }
		  //有无终裁书--Y有N无
		  if(litigationTaskHandleSubmitJson.arbitrationFlag != null){
			  saveLitigationInfoMessage += "<arbitrationFlag>"+litigationTaskHandleSubmitJson.arbitrationFlag+"</arbitrationFlag>";
		  }
		  //申请恢复执行时间--格式:yyyy-MM-dd
		  if(litigationTaskHandleSubmitJson.applyResumeExecutionTime != null){
			  saveLitigationInfoMessage += "<applyResumeExecutionTime>"+litigationTaskHandleSubmitJson.applyResumeExecutionTime+"</applyResumeExecutionTime>";
		  }
		  //************执行程序--结束*****************
		  //************其他--开始*****************
		  //无合同--Y无合同N有合同
		  if(litigationTaskHandleSubmitJson.noContractFlag != null){
			  saveLitigationInfoMessage += "<noContractFlag>"+litigationTaskHandleSubmitJson.noContractFlag+"</noContractFlag>";
		  }
		  //无绿本--Y有绿本N无绿本
		  if(litigationTaskHandleSubmitJson.noGreenBookFlag != null){
			  saveLitigationInfoMessage += "<noGreenBookFlag>"+litigationTaskHandleSubmitJson.noGreenBookFlag+"</noGreenBookFlag>";
		  }
		  //无抵押--Y有抵押N无抵押
		  if(litigationTaskHandleSubmitJson.unsecuredFlag != null){
			  saveLitigationInfoMessage += "<unsecuredFlag>"+litigationTaskHandleSubmitJson.unsecuredFlag+"</unsecuredFlag>";
		  }
		  //************其他--结束*****************
		  
		  //*********诉讼信息子节点--结束**********
		  saveLitigationInfoMessage += "</litigationInfo>";
		  //根节点--结束
		  saveLitigationInfoMessage += "</root>";
	  }
	  
	  //保存判决内容接口的json
	  var saveAdjustContentJson = {};
	  if(!$.isEmptyObject(litigationTaskHandleSubmitAdjustContentJson)){
		
		  //诉讼id
		  saveAdjustContentJson["lawsuitCaseId"] = lawsuitCaseId;
		  //合同号
		  if(contractNo == null || contractNo == ""){
			  showMessage('合同号不存在，不能提交诉讼详情信息！','3000');
			  return false;
		  }
		  saveAdjustContentJson["contractNo"] = contractNo;
		  //录入人
		  var enterUserCn = session.get("userCode");
		  if(enterUserCn != null){
			  saveAdjustContentJson["enterUserCn"] = enterUserCn;
		  }
		  //录入时间
	 	   var currentDatetime = new Date().Format("yyyy-MM-dd HH:mm:ss");
	 	  saveAdjustContentJson["enterTime"] = currentDatetime;
	 	 
	 	  //保存判决内容接口的json对象
		  for(var key in litigationTaskHandleSubmitAdjustContentJson){
			  saveAdjustContentJson[key] = litigationTaskHandleSubmitAdjustContentJson[key];
		  }
	  }
	   
	   var postData = {};
	   postData.saveLitigationInfoMessage = saveLitigationInfoMessage; //拼接保存诉讼详情信息接口的报文
	   postData.saveAdjustContentJson = JSON.stringify(saveAdjustContentJson);    //保存判决内容接口的报文
	   postData.userId = session.get("userId");
	   
	  showConfirm("请确认是否提交数据", function(){
			$.ajax({
				url: basePath+"/app/litigationTaskHandle/submitLitigationTaskHandle.xhtml",
				data: postData,
				type: 'POST',
				dataType: 'json',
				async:true,
				beforeSend: function () {
					showLoading();
				},
				success: function (msg) {
//					showHide();
					if($.trim(msg.returnCode) == '0') {
						 //重新加载页面数据
			 			   var resultMap = msg.data;
			 			   //保存诉讼信息接口返回结果
			 			   var detailResult = resultMap.saveLitigationDetailResult;
			 			  //保存判决内容接口返回结果
			 			   var contentResult = resultMap.saveLitigationContentResult;
			 			   
			 			   if((detailResult == "0" || detailResult == "")
			 					   && (contentResult == "0" || contentResult == "")){
			 				   //保存诉讼详情信息接口返回值为0，表示接口保存成功；为空表示没有调用接口
			 				   //保存判决内容接口返回值为0，表示接口保存成功；为空表示没有调用接口
			 				  load_litigation_task_handle_content();
			 				  
			 			   }else if(detailResult == "1"){
			 				   //保存诉讼详情信息接口返回值为1，表示接口保存失败
			 				   if(contentResult != "1"){
			 					//清空保存判决内容接口的json对象
			 					  for(var key in litigationTaskHandleSubmitAdjustContentJson){
			 						  delete litigationTaskHandleSubmitAdjustContentJson[key];
			 					  }
			 				   }
			 			   }else if(contentResult == "1"){
			 				  //保存判决内容接口返回值为1，表示接口保存失败
			 				  if(detailResult != "1"){
			 					  //清空保存诉讼详情信息接口的json对象
			 	 				  for(var key in litigationTaskHandleSubmitJson){
			 						 delete litigationTaskHandleSubmitJson[key];
			 	 				  }
			 				  }
			 				  
			 			   }
			 			 
//						  showHide();
			 			   setTimeout(function(){
			 				   showMessage(msg.message,'5000');
			 			   },1000);
						  
					}
					else{
						errorHandler(msg.returnCode,msg.message);
					}
				},
				complete: function() {

				}
			});
		 
	  });
}

function initAdjustContentObjHeight(){
	//判决内容高度初始化
	var adjustContentObj = $("#litigation_task_handle_page").find("#litigationTaskHandle_adjustContent");
	var adjustContentObjMinHeightStr = adjustContentObj.css("min-height");
	var pxIndex = adjustContentObjMinHeightStr.indexOf("px");
	var adjustContentObjMinHeight =  adjustContentObjMinHeightStr.substring(0,pxIndex);
	var objParentHeight = adjustContentObj.outerHeight(true)+10;
	if(objParentHeight < adjustContentObjMinHeight){
		objParentHeight=adjustContentObjMinHeight;
	}
	adjustContentObj.parent().css("height",objParentHeight+"px");
	adjustContentObj.parent().parent().css("height",objParentHeight+"px");
}
function divLimitLength(obj,maxlen){
    //限制字符串长度(汉字、字母一样)
    var str = $(obj).text();
    var len = str.length;
    if(len > maxlen){
    	str = str.substring(0,maxlen);
    	$(obj).text(str);
    	$(obj).blur();
    	var objMinHeightStr = $(obj).css("min-height");
    	var pxIndex = objMinHeightStr.indexOf("px");
    	var objMinHeight =  objMinHeightStr.substring(0,pxIndex);
    	var objHeight = $(obj).outerHeight(true)+10;
    	if(objHeight < objMinHeight){
    		objHeight = objMinHeight;
    	}
    	$(obj).parent().css("height ",objHeight+"px");
    	$(obj).parent().parent().css("height",objHeight+"px");
    	return false;
    }
    var objMinHeightStr = $(obj).css("min-height");
    var pxIndex = objMinHeightStr.indexOf("px");
	var objMinHeight =  objMinHeightStr.substring(0,pxIndex);
   	var objHeight = $(obj).outerHeight(true)+10;
   	if(objHeight < objMinHeight){
		objHeight = objMinHeight;
	}
	$(obj).parent().css("height",objHeight+"px");
	$(obj).parent().parent().css("height",objHeight+"px");
    return false;
}

