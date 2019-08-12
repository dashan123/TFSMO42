/*********************************************************login init begin*****************************************************************/	
var litigation_case_details_page = $('#litigation_case_details_page');
var litigation_case_details_myScroll;
/******************************home_page---begin**************************************/	   
litigation_case_details_page.live('pageinit',function(e, ui){
	
	var wrapper = "litigation_case_details_wrapper"
	var up = "litigation_case_details_pullUp";
    var down = "litigation_case_details_pullDown";;
	litigation_case_details_myScroll = createMyScroll(wrapper,up,down);
	
	//内部合同号，从其它画面传入并将传递给 催收记录，催收照片，还款计划，扣款流水 功能画面使用
//	console.log(session.get("contractId"));

	litigation_case_details_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page();
	});
	
	//点击展开/关闭列表
	litigation_case_details_page.find("div.case-details h1").live("tap",function(e){
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
	
	//跳转到核销还款明细
	litigation_case_details_page.find("div.case-details li em[id='litigationCaseDetail_showWriteOffDetail']").live("tap",function(e){
		session.set("page_keyword","案件详情（诉讼）");
		session.set("page_title","案件详情（诉讼）");
		session.set("page_from","litigation_case_details_page");
		goto_page("case_writeoff_repayment_list_page");
	});
	
	//催收信息--点击来电记录按钮，进入催收信息的来电记录列表页面
	litigation_case_details_page.find("div.case-details li em[id='litigationCaseDetail_showCollInfo']").live("tap",function(e){
		goto_page("collection_caller_record_list_page");
	});
	
	//跳转到还款计划页面
	litigation_case_details_page.find("div.case-details[url='case_repayment_plan_list_page'] h1").live("tap",function(e){
		goto_page("case_repayment_plan_list_page");
	});
	
	//跳转到扣款流水页面
	litigation_case_details_page.find("div.case-details[url='case_debit_list_page'] h1").live("tap",function(e){
		goto_page("case_debit_list_page");
	});
	
});


litigation_case_details_page.live('pageshow',function(e, ui){
	
	currentLoadActionName = "litigation_case_details_load_content";
	//如果网络是连通的
	if(isNetworkConnected()){
		var fromPage = session.get("fromPage");
		 if(fromPage != "case_writeoff_repayment_list_page"
			 && fromPage != "collection_caller_record_list_page"
				 && fromPage != "case_debit_list_page" 
					 && fromPage != "case_repayment_plan_list_page" 
						 &&fromPage != "case_image_view_page" 
							 && fromPage != "css_collection_record_list_page" 
								 &&fromPage != "css_collection_pictures_page"){

			 load_litigation_case_details_content();
		 }
	}
	else{
		//读取缓存
		var key = {};
		key.userId = session.get("userId");
		key.fun = "litigation_case_details";
		key.method = "load_litigation_case_details_content";
		var keyExtra = {};
		keyExtra.contractId = session.get("contractId");
		key.extra = keyExtra;
		
		
		var extra={};
		extra.operation =ConstDef.getConstant("NATIVE_STORAGE_QUERY");
		extra.callback = "load_litigation_case_details_content_from_native_storage";
		extra.newDataKey = {};
		extra.newData = {};

		loadNativeStorage(key.userId, key.fun, key.method , key.extra, extra.operation,extra.callback,extra.newDataKey,extra.newData);
	
	}
	
});

function litigation_case_details_load_content(){
	//该方法被引用，不要删除，如果想实现向上划动刷新，则在此添加代码
}
//加载详细，并显示
function load_litigation_case_details_content(){

	showLoading();
	var currentPage = $("#litigation_case_details_page");
	currentPage.find("span[identity]").text("");
	var postData = {};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	//contractId--内部合同号，从其它画面传入并将传递给 还款计划，扣款流水 功能画面使用
    postData.contractId = session.get("contractId");//此处不清除此session,需要传递给其它画面
   
    $.getJSON(basePath+"/app/litigationCaseDetails/pageInit.xhtml"+callback, postData,function(msg){
		if ($.trim(msg.returnCode) == '0') {

			if (msg.data != null) {
				//将取到的数据存入缓存
				var key = {};
				key.userId = session.get("userId");
				key.fun = "litigation_case_details";
				key.method = "load_litigation_case_details_content";
				var keyExtra = {};
				keyExtra.contractId = session.get("contractId");
				key.extra = keyExtra;
				
				saveDownloadRawDataToNativeStorage(key.userId, key.fun, key.method, key.extra,msg);
				
				bind_litigation_case_details_to_page(msg);

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
function load_litigation_case_details_content_from_native_storage(value){
	
	var currentPage = $("#litigation_case_details_page");
	currentPage.find("span[identity]").text("");
	
	if(value){
		
		showLoading();

		var msg = JSON.parse(value); 

		if (msg.data != null) {
			bind_litigation_case_details_to_page(msg);
			
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

function bind_litigation_case_details_to_page(msg){
	var currentPage = $("#litigation_case_details_page");
	//案件合同信息
	var collCaseContractInfo = msg.data.collCaseContractInfo;
	//案件联系信息
	var collCaseContactInfoListMap = msg.data.collCaseContactInfoListMap;
	//催收二期新增信息
	var collCaseAddedInfo = msg.data.collCaseAddedInfoEntity;
	//案件逾期账户信息
	var collCaseOverdueInfo = msg.data.collCaseOverdueInfo;
	//案件基本信息 
	var collTodoCase = msg.data.collTodoCase;
	
	
	//案件合同信息
	var $contractInfoInfoElement = currentPage.find("[identity = 'contractInfo']").parent("h1").next("ul");
	//合同起止日
	var contractStartEndDatetime = "";
	if(collCaseContractInfo != null){
		//首付金额   金额千分位格式化
		if(collCaseContractInfo.firstPayment != null){
			collCaseContractInfo.firstPayment = fmoney(collCaseContractInfo.firstPayment,2);
		}
		//贷款金额   金额千分位格式化
		if(collCaseContractInfo.financedAmt != null){
			collCaseContractInfo.financedAmt = fmoney(collCaseContractInfo.financedAmt,2);
		}
		//购车金额   金额千分位格式化
		if(collCaseContractInfo.buyCarAmount != null){
			collCaseContractInfo.buyCarAmount = fmoney(collCaseContractInfo.buyCarAmount,2);
		}
		//合同起始日
		if(collCaseContractInfo.contractStartDatetime != null 
				&& collCaseContractInfo.contractStartDatetime != ""){
			collCaseContractInfo.contractStartDatetime = collCaseContractInfo.contractStartDatetime.substring(0,10);
		}
		//合同到期日
		if(collCaseContractInfo.contractEndDatetime != null
				&& collCaseContractInfo.contractEndDatetime != ""){
			collCaseContractInfo.contractEndDatetime = collCaseContractInfo.contractEndDatetime.substring(0,10);
			
		}
		//合同起止日
		var contractStartEndDatetime = collCaseContractInfo.contractStartDatetime +" ~ "+collCaseContractInfo.contractEndDatetime
	}
	dataBindToElement($contractInfoInfoElement,collCaseContractInfo);
	//合同起止日
	$contractInfoInfoElement.find("[identity='contractStartEndDatetime']").text(contractStartEndDatetime)
	
	//案件联系信息
	var $contactInfoListElement = currentPage.find("[identity = 'contactInfo']").parent("h1").next("ul");
	$contactInfoListElement.empty();
	var $newAddressElement = $('<li style="height:2.5rem;"><input type="text" identity = "address" data-role="none" placeholder="请输入一个新地址"/><em><span></span>催收</em></li>'); 
	
	//为催收按钮绑定单击事件--添加在催地址
	$newAddressElement.find("em").bind("tap",
			{type:"newAddress",value:$newAddressElement},addLitigCollectingAddress);
	
	$contactInfoListElement.append($newAddressElement);
	
	for (var key in collCaseContactInfoListMap) {
		$contactInfoListElement.append($('<li style="background:#f6f6f6;font-size:14px;font-weight:bold;font-style:italic;"<span identity = "contactInfoClassification">'+key+'</span></li>'));
		$.each(collCaseContactInfoListMap[key],function(i,n){
			//地址
			if(n["manner"] =='ADDRESS'){
				var $contactInfoElement =  $('<li style="height:auto;">名称：<span identity = "fullName">'+n["fullName"]+'</span></li>'
						+'<li style="height:auto;">地址类型：<span identity = "addressType">'+n["type"]+'</span></li>'
						+'<li style="height:auto;">地址：<span identity = "address">'+n["content"]+'</span><em style="position:absolute;right:1px;"><span></span>催收</em></li>');
				
				//为催收按钮绑定单击事件--添加在催地址
				$contactInfoElement.find("em").bind("tap",
						{type:"caseAddress",value:$contactInfoElement},addLitigCollectingAddress);
				
				$contactInfoListElement.append($contactInfoElement);
			}
			else{
				var $contactInfoElement =  $('<li>名称：<span identity = "fullName">'+n["fullName"]+'</span></li>'
						+'<li>电话类型：<span identity = "phoneType">'+n["type"]+'</span></li>'
						+'<li>电话号码：<span identity = "telphone">'+n["content"]+'</span></li>');
				
				$contactInfoElement.find("span[identity='telphone']").bind("tap",function(){
                    
                    callPhone(n["content"]);
                    
                    });
				$contactInfoListElement.append($contactInfoElement);
			}
		});//end $.each
	}
	
	//案件逾期账户信息
	if(collCaseOverdueInfo != null){
		//逾期日期
		if(collCaseOverdueInfo.overdueDatetime != null && collCaseOverdueInfo.overdueDatetime !=""){
			collCaseOverdueInfo.overdueDatetime = collCaseOverdueInfo.overdueDatetime.substring(0,10);
		}
		//最近一次还款日期
		if(collCaseOverdueInfo.latelyRepayDatetime != null && collCaseOverdueInfo.latelyRepayDatetime !=""){
			collCaseOverdueInfo.latelyRepayDatetime = collCaseOverdueInfo.latelyRepayDatetime.substring(0,10);
		}
		//月还款金额  金额千分位格式化
		if(collCaseOverdueInfo.monthlyPackBackMoney != null){
			collCaseOverdueInfo.monthlyPackBackMoney = fmoney(collCaseOverdueInfo.monthlyPackBackMoney,2);
		}
		//逾期总金额  金额千分位格式化
		if(collCaseOverdueInfo.overdueAmount != null){
			collCaseOverdueInfo.overdueAmount = fmoney(collCaseOverdueInfo.overdueAmount,2);
		}
		//未到期本金  金额千分位格式化
		if(collCaseOverdueInfo.notdueCorpus != null){
			collCaseOverdueInfo.notdueCorpus = fmoney(collCaseOverdueInfo.notdueCorpus,2);
		}
		//逾期月还款总金额  金额千分位格式化
		if(collCaseOverdueInfo.overdueMonthlyPackBackMoney != null){
			collCaseOverdueInfo.overdueMonthlyPackBackMoney = fmoney(collCaseOverdueInfo.overdueMonthlyPackBackMoney,2);
		}
		//逾期本金总计 金额千分位格式化
		if(collCaseOverdueInfo.overdueCorpusTotalled != null){
			collCaseOverdueInfo.overdueCorpusTotalled = fmoney(collCaseOverdueInfo.overdueCorpusTotalled,2);
		}
		//逾期利息总计 金额千分位格式化
		if(collCaseOverdueInfo.overdueInterestTotalled != null){
			collCaseOverdueInfo.overdueInterestTotalled = fmoney(collCaseOverdueInfo.overdueInterestTotalled,2);
		}
		//逾期罚息总计 金额千分位格式化
		if(collCaseOverdueInfo.overduePenaltyTotalled != null){
			collCaseOverdueInfo.overduePenaltyTotalled = fmoney(collCaseOverdueInfo.overduePenaltyTotalled,2);
		}
		//逾期费用总计 金额千分位格式化
		if(collCaseOverdueInfo.overdueCostTotalled != null){
			collCaseOverdueInfo.overdueCostTotalled = fmoney(collCaseOverdueInfo.overdueCostTotalled,2);
		}
		//最近一次还款金额 金额千分位格式化
		if(collCaseOverdueInfo.latelyRepayment != null){
			collCaseOverdueInfo.latelyRepayment = fmoney(collCaseOverdueInfo.latelyRepayment,2);
		}
		
	}
	dataBindToElement(currentPage,collCaseOverdueInfo);
	
	//***********催收二期新增信息***********
	if(collCaseAddedInfo != null){
		//************逾期账户信息************
		//剩余本金 金额千分位格式化
		if(collCaseAddedInfo.principalOsAmt != null){
			collCaseAddedInfo.principalOsAmt = fmoney(collCaseAddedInfo.principalOsAmt,2);
		}
		//************逾期账户信息************
		//************核销信息************
		//核销日期
		if(collCaseAddedInfo.writeoffDay != null 
				&& collCaseAddedInfo.writeoffDay !=""){
			collCaseAddedInfo.writeoffDay = collCaseAddedInfo.writeoffDay.substring(0,10);
		}
		//核销时总金额 金额千分位格式化
		if(collCaseAddedInfo.writeoffAmt != null){
			collCaseAddedInfo.writeoffAmt = fmoney(collCaseAddedInfo.writeoffAmt,2);
		}
		//当前本金 金额千分位格式化
		if(collCaseAddedInfo.hxPricipalAmtAfter != null){
			collCaseAddedInfo.hxPricipalAmtAfter = fmoney(collCaseAddedInfo.hxPricipalAmtAfter,2);
		}
		//当前利息 金额千分位格式化
		if(collCaseAddedInfo.hxInterestAmtAfter != null){
			collCaseAddedInfo.hxInterestAmtAfter = fmoney(collCaseAddedInfo.hxInterestAmtAfter,2);
		}
		//当前罚息 金额千分位格式化
		if(collCaseAddedInfo.hxPenaltyAmtAfter != null){
			collCaseAddedInfo.hxPenaltyAmtAfter = fmoney(collCaseAddedInfo.hxPenaltyAmtAfter,2);
		}
		//当前工本费 金额千分位格式化
		if(collCaseAddedInfo.hxChargeAmtAfter != null){
			collCaseAddedInfo.hxChargeAmtAfter = fmoney(collCaseAddedInfo.hxChargeAmtAfter,2);
		}
		//诉讼费 金额千分位格式化
		if(collCaseAddedInfo.hxLawsuitfeesum != null){
			collCaseAddedInfo.hxLawsuitfeesum = fmoney(collCaseAddedInfo.hxLawsuitfeesum,2);
		}
		//核销结清金额 金额千分位格式化
		if(collCaseAddedInfo.wrtieoffEtAmt != null){
			collCaseAddedInfo.wrtieoffEtAmt = fmoney(collCaseAddedInfo.wrtieoffEtAmt,2);
		}
		//最近一次还款金额 金额千分位格式化
		if(collCaseAddedInfo.writeoffLastPaidAmt != null){
			collCaseAddedInfo.writeoffLastPaidAmt = fmoney(collCaseAddedInfo.writeoffLastPaidAmt,2);
		}
		//最近一次还款日期
		if(collCaseAddedInfo.writeoffLastPaidDate != null 
				&& collCaseAddedInfo.writeoffLastPaidDate !=""){
			collCaseAddedInfo.writeoffLastPaidDate = collCaseAddedInfo.writeoffLastPaidDate.substring(0,10);
		}
		//************核销信息************
		//*************诉讼信息*************
		//诉讼费 金额千分位格式化
		if(collCaseAddedInfo.lawsuitFeeSum != null){
			collCaseAddedInfo.lawsuitFeeSum = fmoney(collCaseAddedInfo.lawsuitFeeSum,2);
		}
		//*************诉讼信息*************
		//*************催收信息*************
		//案件分配日期
		if(collCaseAddedInfo.caseAssignedDate != null 
				&& collCaseAddedInfo.caseAssignedDate !=""){
			collCaseAddedInfo.caseAssignedDate = collCaseAddedInfo.caseAssignedDate.substring(0,10);
		}
		//协办分配日期
		if(collCaseAddedInfo.assistAssignedTime != null 
				&& collCaseAddedInfo.assistAssignedTime !=""){
			collCaseAddedInfo.assistAssignedTime = collCaseAddedInfo.assistAssignedTime.substring(0,10);
		}
		//*************催收信息*************
		//**************合同信息********************
		//A卡评分
		if(collCaseAddedInfo.score != null){
			collCaseAddedInfo.score = collCaseAddedInfo.score.toFixed(1);
		}
		//**************合同信息********************
	}
	dataBindToElement(currentPage,collCaseAddedInfo);
	//***********催收二期新增信息***********
	
	//案件基本信息 
	var collTodoCase = msg.data.collTodoCase;
/*	//最后一次跟进时间  截取为日期型
	collTodoCase.lastFieldCollectDatetime = collTodoCase.lastFieldCollectDatetime.substring(0,10);
	//逾期总金额 金额千分位格式化
	if(collTodoCase.overdueAmount != null){
		collTodoCase.overdueAmount = fmoney(collTodoCase.overdueAmount,2);
	}
	//剩余本金  金额千分位格式化
	if(collTodoCase.oddCorpus != null){
		collTodoCase.oddCorpus = fmoney(collTodoCase.oddCorpus,2);
	}*/
	if(collTodoCase != null){
		//借款人或共申人或担保人信息为空时，也不显示相应的项目标题
		if(collTodoCase.borrowerNme != null && collTodoCase.borrowerNme != ""){
			currentPage.find(".borrower").removeClass("borrowerHide");
		}else{
			currentPage.find(".borrower").addClass("borrowerHide");
		}
		if(collTodoCase.coBorrowerNme != null && collTodoCase.coBorrowerNme != ""){
			currentPage.find(".coBorrower").removeClass("coBorrowerHide");
		}else{
			currentPage.find(".coBorrower").addClass("coBorrowerHide");
		}
		if(collTodoCase.guarantorNme != null && collTodoCase.guarantorNme != ""){
			currentPage.find(".guarantor").removeClass("guarantorHide");
		}else{
			currentPage.find(".guarantor").addClass("guarantorHide");
		}
	}
	dataBindToElement(currentPage,collTodoCase);
	
	session.set("caseId",collTodoCase["caseId"]);//案件号
	session.set("requestCode",collTodoCase.requestCode);//申请号
	session.set("contractNumber",collTodoCase.contractNumber);//案件合同号
	
	var todoCase = {};
	todoCase.customerName = collTodoCase["customerName"];
	todoCase.contractNumber = collTodoCase["contractNumber"];
	
	session.set("todoCase",JSON.stringify(todoCase));//在CSS催记详情页面使用该数据
	

	/*//提前还款信息
	var collCaseEarlyRepayInfo = msg.data.collCaseEarlyRepayInfo;
	//提前还款总额   金额千分位格式化
	if(collCaseEarlyRepayInfo.ETAmount != null){
		collCaseEarlyRepayInfo.ETAmount = fmoney(collCaseEarlyRepayInfo.ETAmount,2);
	}
	//未到期本金   金额千分位格式化
	if(collCaseEarlyRepayInfo.surplusPrincipal != null){
		collCaseEarlyRepayInfo.surplusPrincipal = fmoney(collCaseEarlyRepayInfo.surplusPrincipal,2);
	}
	//提前还款违约金   金额千分位格式化
	if(collCaseEarlyRepayInfo.earlyRepayDamages != null){
		collCaseEarlyRepayInfo.earlyRepayDamages = fmoney(collCaseEarlyRepayInfo.earlyRepayDamages,2);
	}
	//逾期月还款   金额千分位格式化
	if(collCaseEarlyRepayInfo.overdueFine != null){
		collCaseEarlyRepayInfo.overdueFine = fmoney(collCaseEarlyRepayInfo.overdueFine,2);
	}
	//累计罚息   金额千分位格式化
	if(collCaseEarlyRepayInfo.fine != null){
		collCaseEarlyRepayInfo.fine = fmoney(collCaseEarlyRepayInfo.fine,2);
	}
	//累计催收费用   金额千分位格式化
	if(collCaseEarlyRepayInfo.poundage != null){
		collCaseEarlyRepayInfo.poundage = fmoney(collCaseEarlyRepayInfo.poundage,2);
	}
	//应收罚息   金额千分位格式化
	if(collCaseEarlyRepayInfo.collectionCost != null){
		collCaseEarlyRepayInfo.collectionCost = fmoney(collCaseEarlyRepayInfo.collectionCost,2);
	}
	//应收利息   金额千分位格式化
	if(collCaseEarlyRepayInfo.surplusInterest != null){
		collCaseEarlyRepayInfo.surplusInterest = fmoney(collCaseEarlyRepayInfo.surplusInterest,2);
	}
	//结清金额   金额千分位格式化
	if(collCaseEarlyRepayInfo.netReceivableAmount != null){
		collCaseEarlyRepayInfo.netReceivableAmount = fmoney(collCaseEarlyRepayInfo.netReceivableAmount,2);
	}
	dataBindToElement(currentPage,collCaseEarlyRepayInfo);*/
	
	//提前还款信息
	var collCaseEarlyRepayInfo = msg.data.collCaseEarlyRepayInfo;
	if(collCaseEarlyRepayInfo != null){
		//提前还款总额   金额千分位格式化
		if(collCaseEarlyRepayInfo.ETAmount != null){
			collCaseEarlyRepayInfo.ETAmount = fmoney(collCaseEarlyRepayInfo.ETAmount,2);
		}
		//提前还款违约金   金额千分位格式化
		if(collCaseEarlyRepayInfo.earlyRepayDamages != null){
			collCaseEarlyRepayInfo.earlyRepayDamages = fmoney(collCaseEarlyRepayInfo.earlyRepayDamages,2);
		}
	}
	//提前还款总额
	currentPage.find("[identity='earlyRepaymentTotalMoney']").text(collCaseEarlyRepayInfo.ETAmount);
	//提前还款违约金
	currentPage.find("[identity='earlyRepayDamages']").text(collCaseEarlyRepayInfo.earlyRepayDamages);
	
	var uploadCaseMessage = {};
//	uploadCaseMessage.currentCollectUserName = collTodoCase["currentCollectUserName"]; //当前催收人
	uploadCaseMessage.city = collTodoCase["city"]; //城市
	uploadCaseMessage.payoutStatus = collTodoCase["payoutStatus"]; //账户状态
	uploadCaseMessage.contractNumber = collTodoCase["contractNumber"]; //合同号
	uploadCaseMessage.customerName = collTodoCase["customerName"]; //客户姓名
	uploadCaseMessage.requestCode = collTodoCase["requestCode"]; //申请号
	if(msg.data.collCaseOverdueInfo != null && msg.data.collCaseOverdueInfo.fiveClassDaysOverdue != null){
		uploadCaseMessage.fiveClassDaysOverdue = msg.data.collCaseOverdueInfo.fiveClassDaysOverdue;//五级分类逾期天数
	}else{
		uploadCaseMessage.fiveClassDaysOverdue = "";//五级分类逾期天数
	}
	session.set("uploadCaseMessage",JSON.stringify(uploadCaseMessage));//在信息上报页面使用该数据

}

function addLitigCollectingAddress(e){
		var eventData = e.data;
		var postData = {};
		postData.random = new Date();
		postData.userId = session.get("userId");
		postData.userCode = session.get("userCode");
		postData.contractId = session.get("contractId")
		postData.litigToDoCaseId = session.get("litigToDoCaseId");
		
		if(eventData.type=="newAddress"){
			postData.addressType = ConstDef.getConstant("NEW_ADD_ADDRESS");
		    postData.address = eventData.value.find('[identity = "address"]').val();
		}
		else{
			postData.addressType = eventData.value.find('[identity = "addressType"]').text();
		    postData.address = eventData.value.find('[identity = "address"]').text();
		}
	    
		if(!postData.address){
			showMessage('请先输入要添加的在催地址！', '1500');
			return;
		}
		
	    //手机端当前时间
		var currentDatetime = new Date().Format("YYYY/MM/DD HH/mm/ss");
		postData.addTime = currentDatetime;
		//业务类型：1催收 2诉讼
		postData.businessFlag = "2";
		
		showConfirmDialog("请确认是否将地址添加到在诉地址列表！",postData, function(){
			showLoading();
			$.getJSON(basePath+"/app/litigationCaseDetails/addLitigCollectingAddress.xhtml"+callback, postData,function(msg){
				if ($.trim(msg.returnCode) == '0') {
					showHide();
					showMessage('已成功添加在诉地址！', '1500');
				}
				else {
					showHide();
					errorHandler(msg.returnCode, msg.message);
				}
				
			});//end $.getJSON
		});
};//end $contactInfoElement.find("em").bind