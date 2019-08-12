/*********************************************************login init begin*****************************************************************/	
var collection_case_details_view_page = $('#collection_case_details_view_page');
var collection_case_details_view_myScroll;
/******************************home_page---begin**************************************/	   
collection_case_details_view_page.live('pageinit',function(e, ui){
	var wrapper = "collection_case_details_view_wrapper";
	var up = "collection_case_details_view_pullUp";
	var down = "collection_case_details_view_pullDown";
	collection_case_details_view_myScroll = createMyScroll(wrapper,up,down);

	collection_case_details_view_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page();
	});

	//点击展开/关闭列表
	collection_case_details_view_page.find("div.case-details h1").live("tap",function(e){
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

	//跳转到扣款流水页面
	collection_case_details_view_page.find("div.case-details[url='case_debit_list_page'] h1").live("tap",function(e){
		goto_page("case_debit_list_page");
	});

	//跳转到还款计划页面
	collection_case_details_view_page.find("div.case-details[url='case_repayment_plan_list_page'] h1").live("tap",function(e){
		goto_page("case_repayment_plan_list_page");
	});
	
	//跳转到核销还款明细
	collection_case_details_view_page.find("div.case-details li em[id='collectionCaseDetailView_showWriteOffDetail']").live("tap",function(e){
		session.set("page_keyword","案件详情");
		session.set("page_title","案件详情");
		session.set("page_from","collection_case_details_view_page");
		goto_page("case_writeoff_repayment_list_page");
	});
	
	//催收信息--点击来电记录按钮，进入催收信息的来电记录列表页面
	collection_case_details_view_page.find("div.case-details li em[id='collectionCaseDetailView_showCollInfo']").live("tap",function(e){
		goto_page("collection_caller_record_list_page");
	});
});


collection_case_details_view_page.live('pageshow',function(e, ui){

	currentLoadActionName = "collection_case_details_view_load_content"

	var fromPage = session.get("fromPage");
	if(fromPage != "case_debit_list_page" 
		&& fromPage != "case_repayment_plan_list_page" 
			&&fromPage != "case_image_view_page" 
				&& fromPage != "css_collection_record_list_page" 
					&&fromPage != "css_collection_pictures_page"
						&& fromPage != "case_writeoff_repayment_list_page"
							 && fromPage != "collection_caller_record_list_page"){

		load_collection_case_details_view_content();
	}

});

function collection_case_details_view_load_content(){
	//下拉不刷新，则该方法置空
}

//加载详细，并显示
function load_collection_case_details_view_content(){

	showLoading();

	var currentPage = $("#collection_case_details_view_page");
	currentPage.find("span[identity]").text("");
	var postData = {};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.contractId = session.get("contractId");//此处不清除此session,需要传递给其它画面
	
	postData.employeeId = session.get("employeeId");
	var lastFieldCollectDatetime = session.get("lasttime112211");
	if(lastFieldCollectDatetime == null){
        lastFieldCollectDatetime = "";
    }
    session.remove("lasttime112211");
	$.getJSON(basePath+"/app/CollectionCaseDetailsView/pageInit.xhtml"+callback, postData,function(msg){
		if ($.trim(msg.returnCode) == '0') {

			if (msg.data != null) {
				
				//案件基本信息 
				var collTodoCase = msg.data.collTodoCase;
				/*//逾期总金额 金额千分位格式化
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
				
				currentPage.find("[identity='lastFieldCollectDatetime']").text("");
				collTodoCase.lastFieldCollectDatetime = lastFieldCollectDatetime;

				var lastFieldCollectDate = collTodoCase.lastFieldCollectDatetime.substring(0);
				currentPage.find("[identity='lastFieldCollectDatetime']").text(lastFieldCollectDate);  //最后一次跟进时间

				session.set("caseId",collTodoCase["caseId"]);//该参数将在催收照片及催收记录页面使用
				session.set("requestCode",collTodoCase.requestCode);

				var todoCase = {};
				todoCase.customerName = collTodoCase["customerName"];
				todoCase.contractNumber = collTodoCase["contractNumber"];

				session.set("todoCase",JSON.stringify(todoCase));//在CSS催记详情页面使用该数据

				//案件合同信息
				var collCaseContractInfo = msg.data.collCaseContractInfo;
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
					contractStartEndDatetime = collCaseContractInfo.contractStartDatetime +" ~ "+collCaseContractInfo.contractEndDatetime
				}
				dataBindToElement(currentPage,collCaseContractInfo);
				//合同起止日
				$contractInfoInfoElement.find("[identity='contractStartEndDatetime']").text(contractStartEndDatetime)
				
				//案件联系信息
				var $contactInfoListElement = currentPage.find("[identity = 'contactInfo']").parent("h1").next("ul");
				$contactInfoListElement.empty();

				var collCaseContactInfoListMap = msg.data.collCaseContactInfoListMap;
				for (var key in collCaseContactInfoListMap) {
					$contactInfoListElement.append($('<li style="background:#f6f6f6;font-size:14px;font-weight:bold;font-style:italic;"<span identity = "contactInfoClassification">'+key+'</span></li>'));
					$.each(collCaseContactInfoListMap[key],function(i,n){
						//地址
						if(n["manner"] =='ADDRESS'){
							var $contactInfoElement =  $('<li style="height:auto;">名称：<span identity = "fullName">'+n["fullName"]+'</span></li>'
									+'<li style="height:auto;">地址类型：<span identity = "addressType">'+n["type"]+'</span></li>'
									+'<li style="height:auto;">地址：<span identity = "address">'+n["content"]+'</span></li>');

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
					});
				}

				//案件逾期信息
				var collCaseOverdueInfo = msg.data.collCaseOverdueInfo;
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
				
//				if(msg.data.collCaseOverdueInfo != null && msg.data.collCaseOverdueInfo.overdueDatetime != null){
//					var overdueDate = msg.data.collCaseOverdueInfo.overdueDatetime.substring(0,10);
//					currentPage.find("[identity='overdueDatetime']").text(overdueDate);  //逾期日期
//				}
//				if(msg.data.collCaseOverdueInfo != null && msg.data.collCaseOverdueInfo.latelyRepayDatetime != null){
//					var latelyRepayDate = msg.data.collCaseOverdueInfo.latelyRepayDatetime.substring(0,10);
//					currentPage.find("[identity='latelyRepayDatetime']").text(latelyRepayDate); //最近一次还款日期
//				}
				
				//***********催收二期新增信息***********
				//催收二期新增信息
				var collCaseAddedInfo = msg.data.collCaseAddedInfoEntity;
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

				/*//提前还款信息 
				var collCaseEarlyRepayInfo = msg.data.collCaseEarlyRepayInfo;
				if(collCaseEarlyRepayInfo != null){
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
//				uploadCaseMessage.currentCollectUserName = collTodoCase["currentCollectUserName"]; //当前催收人
				uploadCaseMessage.city = collTodoCase["city"]; //城市
				uploadCaseMessage.payoutStatus = collTodoCase["payoutStatus"]; //账户状态
				uploadCaseMessage.contractNumber = collTodoCase["contractNumber"]; //合同号
				uploadCaseMessage.customerName = collTodoCase["customerName"]; //客户姓名
				uploadCaseMessage.requestCode = collTodoCase["requestCode"]; //申请号
				if(msg.data.collCaseOverdueInfo != null && msg.data.collCaseOverdueInfo.fiveClassDaysOverdue != null){
					uploadCaseMessage.fiveClassDaysOverdue = msg.data.collCaseOverdueInfo.fiveClassDaysOverdue;//五级分类逾期天数
				}else{
					uploadCaseMessage.fiveClassDaysOverdue = "";
				}
				session.set("uploadCaseMessage",JSON.stringify(uploadCaseMessage));//在信息上报页面使用该数据
				
				showHide();
			}
			else{
				showHide();
//				showMessage('暂无数据', '1500');
			}
		}
		else {
			showHide();
			errorHandler(msg.returnCode, msg.message);
		}





	});//end $.getJSON

};
