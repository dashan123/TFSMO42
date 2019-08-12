var case_writeoff_repayment_list_page = $('#case_writeoff_repayment_list_page');
var case_writeoff_repayment_list_myScroll;
/******************************case_writeoff_repayment_list_page---begin**************************************/	   
case_writeoff_repayment_list_page.live('pageinit',function(e, ui){
	
	var wrapper = "case_writeoff_repayment_list_wrapper";
    var up = "case_writeoff_repayment_list_pullUp";
    var down = "case_writeoff_repayment_list_pullDown";
	case_writeoff_repayment_list_myScroll = createMyScroll(wrapper,up,down);
	
	case_writeoff_repayment_list_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		var page_from = session.get("page_from")
		session.remove("page_keyword");
		session.remove("page_title");
		session.remove("page_from");
		
		back_page(page_from);
	});
	
});

case_writeoff_repayment_list_page.live('pageshow',function(e, ui){
	
	currentLoadActionName = "case_writeoff_repayment_list_load_content";
	//如果网络是连通的
	if(isNetworkConnected()){
		load_case_writeoff_repayment_list_page_content();
	}
	else{
		//读取缓存
		var key = {};
		key.userId = session.get("userId");
		key.fun = "case_writeoff_repayment_list";
		key.method = "load_case_writeoff_repayment_list_page_content";
		var keyExtra = {};
		keyExtra.contractId = session.get("contractId");
		key.extra = keyExtra;
		
		var extra={};
		extra.operation =ConstDef.getConstant("NATIVE_STORAGE_QUERY");
		extra.callback = "load_case_writeoff_repayment_list_page_content_from_native_storage";
		extra.newDataKey = {};
		extra.newData = {};

		loadNativeStorage(key.userId, key.fun, key.method , key.extra, extra.operation,extra.callback,extra.newDataKey,extra.newData);

	}
});

function case_writeoff_repayment_list_load_content(){
	
}
//加载核销明细列表，并显示
function load_case_writeoff_repayment_list_page_content(){
	
	var $list = $("#case_writeoff_repayment_list_page .List");
	$list.empty();
	
	showLoading();
	var postData = {};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.contractId = session.get("contractId");
	$.getJSON(basePath+"/app/caseWriteoffRepaymentList/pageInit.xhtml"+callback, postData,function(msg){
		if($.trim(msg.returnCode) == '0'){
			
			//存入缓存
			var key = {};
			key.userId = session.get("userId");
			key.fun = "case_writeoff_repayment_list";
			key.method = "load_case_writeoff_repayment_list_page_content";
			var keyExtra = {};
			keyExtra.contractId = session.get("contractId");
			key.extra = keyExtra;
			saveDownloadRawDataToNativeStorage(key.userId, key.fun, key.method, key.extra,msg);
			
			bind_case_writeoff_repayment_list_to_page(msg);
		
			showHide();
		}
		else{
        	showHide();
        	errorHandler(msg.returnCode,msg.message);
        }
		
	});//end $.getJSON
	
	
}
//加载核销明细列表，并显示
function load_case_writeoff_repayment_list_page_content_from_native_storage(value){
	
	var $list = $("#case_writeoff_repayment_list_page .List");
	$list.empty();
	if(value){
		
		showLoading();
		var msg = JSON.parse(value); 
		if (msg.data != null) {
			
			bind_case_writeoff_repayment_list_to_page(msg);
			showHide();
			showMessage('当前网络处于离线状态，您正在查看缓存数据', '1500');
		}else{
			showHide();
			showMessage('当前处于离线状态，未读到缓存数', '1500');
		}
	}
	else{
		showMessage('当前网络处于离线状态，未读到缓存数据', '1500');
	}
}

function bind_case_writeoff_repayment_list_to_page(msg){

	var $list = $("#case_writeoff_repayment_list_page .List");
	if(msg.data.length<=0){
	     showHide();
		 return;
	}
	
	//核销明细列表的初始化
	var $template = $("#case_writeoff_repayment_list_page .list-row-template");
	$.each(msg.data,function(i,n){

		//应还总额  金额千分位格式化
		if(n["totalRepayMent"] != null){
			n["totalRepayMent"] = fmoney(n["totalRepayMent"],2);
		}
		//当前本金  金额千分位格式化
		if(n["principal"] != null){
			n["principal"] = fmoney(n["principal"],2);
		}
		//当前利息  金额千分位格式化
		if(n["interest"] != null){
			n["interest"] = fmoney(n["interest"],2);
		}
		//罚息  金额千分位格式化
		if(n["hxPenaltyAmt"] != null){
			n["hxPenaltyAmt"] = fmoney(n["hxPenaltyAmt"],2);
		}
		//当前工本费  金额千分位格式化
		if(n["hxChargeAmt"] != null){
			n["hxChargeAmt"] = fmoney(n["hxChargeAmt"],2);
		}
		//核销后罚息  金额千分位格式化
		if(n["hxInterestFee"] != null){
			n["hxInterestFee"] = fmoney(n["hxInterestFee"],2);
		}
		//诉讼费  金额千分位格式化
		if(n["lawsuitFee"] != null){
			n["lawsuitFee"] = fmoney(n["lawsuitFee"],2);
		}
		//还款金额  金额千分位格式化
		if(n["repaymentAmt"] != null){
			n["repaymentAmt"] = fmoney(n["repaymentAmt"],2);
		}
		
		//还款日期
		if(n["repaymentDate"] != null){
			n["repaymentDate"] = n["repaymentDate"].substring(0,10);
		}
		var $item = $template.clone(true);
		
		dataBindToElement($item,n);
		$item.removeClass("list-row-template");
		$item.show();
		
		$list.append($item);
	});//end $.each
}
/******************************case_writeoff_repayment_list_page---end**************************************/