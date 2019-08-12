var case_repayment_plan_list_page = $('#case_repayment_plan_list_page');
var case_repayment_plan_list_myScroll;
/******************************home_page---begin**************************************/	   
case_repayment_plan_list_page.live('pageinit',function(e, ui){
	
	var wrapper = "case_repayment_plan_list_wrapper";
    var up = "case_repayment_plan_list_pullUp";
    var down = "case_repayment_plan_list_pullDown";
	case_repayment_plan_list_myScroll = createMyScroll(wrapper,up,down);
	
	currentLoadActionName = "case_repayment_plan_list_load_content";
	
	case_repayment_plan_list_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page();
	});
	
	//列表信息显示/隐藏
	case_repayment_plan_list_page.find(".addButton4").live('tap',function(){
		
		var $contentElement = $("#case_repayment_plan_list_page").find(".List .RepaymentHide");
		$contentElement.toggle();
		if($contentElement.is(":visible")){
			$(this).find("span").text("隐藏详细");
			$(this).removeClass("caseRepaymentPlanListShow");
			$(this).addClass("caseRepaymentPlanListHide");
		}else{
			$(this).find("span").text("显示详细");
			$(this).removeClass("caseRepaymentPlanListHide");
			$(this).addClass("caseRepaymentPlanListShow");
		}
		
	});
});
/******************************home_page---end**************************************/
case_repayment_plan_list_page.live('pageshow',function(e, ui){
//如果网络是连通的
	if(isNetworkConnected()){
		load_case_repayment_plan_list_page_content();
	}
	else{
		//读取缓存
		var key = {};
		key.userId = session.get("userId");
		key.fun = "case_repayment_plan_list";
		key.method = "load_case_repayment_plan_list_page_content";
		var keyExtra = {};
		keyExtra.contractId = session.get("contractId");
		key.extra = keyExtra;
		
		var extra={};
		extra.operation =ConstDef.getConstant("NATIVE_STORAGE_QUERY");
		extra.callback = "load_case_repayment_plan_list_page_content_from_native_storage";
		extra.newDataKey = {};
		extra.newData = {};

		loadNativeStorage(key.userId, key.fun, key.method , key.extra, extra.operation,extra.callback,extra.newDataKey,extra.newData);

	}
});

	function case_repayment_plan_list_load_content(){}
	//加载还款计划列表，并显示
	function load_case_repayment_plan_list_page_content(){
		
		var $list = $("#case_repayment_plan_list_page .List");
		$list.empty();
		
		showLoading();
		
		var postData = {};
		postData.random = new Date();
		postData.userCode = session.get("userCode");
		postData.contractId = session.get("contractId");
		$.getJSON(basePath+"/app/CaseRepaymentplanList/pageInit.xhtml"+callback, postData,function(msg){
			if($.trim(msg.returnCode) == '0'){
				
				//存入缓存
				var key = {};
				key.userId = session.get("userId");
				key.fun = "case_repayment_plan_list";
				key.method = "load_case_repayment_plan_list_page_content";
				var keyExtra = {};
				keyExtra.contractId = session.get("contractId");
				key.extra = keyExtra;
				saveDownloadRawDataToNativeStorage(key.userId, key.fun, key.method, key.extra,msg);
				
				bind_case_repayment_plan_list_to_page(msg);
			
				showHide();
				
			
			}
			else{
	            	showHide();
	            	errorHandler(msg.returnCode,msg.message);
	            }

			
		});//end $.getJSON
		
		
	}
//加载还款计划列表，并显示
function load_case_repayment_plan_list_page_content_from_native_storage(value){
	var $list = $("#case_repayment_plan_list_page .List");
	$list.empty();
	
	if(value){
		
		showLoading();

		var msg = JSON.parse(value); 

		if (msg.data != null) {
			bind_case_repayment_plan_list_to_page(msg);
			
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
}

function bind_case_repayment_plan_list_to_page(msg){
	
	var $list = $("#case_repayment_plan_list_page .List");
	
	if(msg.data.length<=0){
	     showHide();
//  	 showMessage('暂无数据','1500');
  	 return;
	}

	//在还款计划的初始化
	var $template = $("#case_repayment_plan_list_page .list-row-template");
	
	$.each(msg.data,function(i,n){

		//月还款额   金额千分位格式化
		if(n["monthlyRepaymentAmount"] != null){
			n["monthlyRepaymentAmount"] = fmoney(n["monthlyRepaymentAmount"],2);
		}
		//月应付本金  金额千分位格式化
		if(n["monthlyPrincipalPayable"] != null){
			n["monthlyPrincipalPayable"] = fmoney(n["monthlyPrincipalPayable"],2);
		}
		//月利息 金额千分位格式化
		if(n["monthlyInterest"] != null){
			n["monthlyInterest"] = fmoney(n["monthlyInterest"],2);
		}
		//结算金额 金额千分位格式化
		if(n["settlementAmount"] != null){
			n["settlementAmount"] = fmoney(n["settlementAmount"],2);
		}
		//逾期罚息 金额千分位格式化
		if(n["lateCharge"] != null){
			n["lateCharge"] = fmoney(n["lateCharge"],2);
		}
		//催收工本费  金额千分位格式化
		if(n["collectionCost"] != null){
			n["collectionCost"] = fmoney(n["collectionCost"],2);
		}
		//逾期月还款额  金额千分位格式化
		if(n["monthlyOverdueRepayment"] != null){
			n["monthlyOverdueRepayment"] = fmoney(n["monthlyOverdueRepayment"],2);
		}
		//逾期总金额  金额千分位格式化
		if(n["overdueTotalAmount"] != null){
			n["overdueTotalAmount"] = fmoney(n["overdueTotalAmount"],2);
		}
		
		var $item = $template.clone(true);
		$item.find("[identity='repaymentDatetime']").text(n["repaymentDatetime"]);
		$item.find("[identity='debitDatetime']").text((n["debitDatetime"]).substring(0,10));
		$item.find("[identity='monthlyRepaymentAmount']").text(n["monthlyRepaymentAmount"]);
		$item.find("[identity='monthlyPrincipalPayable']").text(n["monthlyPrincipalPayable"]);
		$item.find("[identity='monthlyInterest']").text(n["monthlyInterest"]);
		$item.find("[identity='settlementAmount']").text(n["settlementAmount"]);
		$item.find("[identity='actualRepaymentDate']").text((n["actualRepaymentDate"]).substring(0,10));

		$item.find("[identity='maximumOverdueDays']").text(n["maximumOverdueDays"]);
		$item.find("[identity='overdueDays']").text(n["overdueDays"]);
		$item.find("[identity='lateCharge']").text(n["lateCharge"]);

		$item.find("[identity='collectionCost']").text(n["collectionCost"]);
		$item.find("[identity='monthlyOverdueRepayment']").text(n["monthlyOverdueRepayment"]);
		$item.find("[identity='overdueTotalAmount']").text(n["overdueTotalAmount"]);

		$item.removeClass("list-row-template");
		$item.show();
		
		
		$list.append($item);
	});//end $.each
}