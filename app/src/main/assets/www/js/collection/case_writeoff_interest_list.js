var case_writeoff_interest_list_page = $('#case_writeoff_interest_list_page');
var case_writeoff_interest_list_myScroll;
/******************************case_writeoff_interest_list_page---begin**************************************/	   
case_writeoff_interest_list_page.live('pageinit',function(e, ui){
	
	var wrapper = "case_writeoff_interest_list_wrapper";
    var up = "case_writeoff_interest_list_pullUp";
    var down = "case_writeoff_interest_list_pullDown";
	case_writeoff_interest_list_myScroll = createMyScroll(wrapper,up,down);
	
	case_writeoff_interest_list_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		var page_from = session.get("page_from")
		session.remove("page_keyword");
		session.remove("page_title");
		session.remove("page_from");
		back_page(page_from);
	});
	
});

case_writeoff_interest_list_page.live('pageshow',function(e, ui){
	
	currentLoadActionName = "case_writeoff_interest_list_load_content";
	//如果网络是连通的
	if(isNetworkConnected()){
		load_case_writeoff_interest_list_page_content();
	}
	else{
		//读取缓存
		var key = {};
		key.userId = session.get("userId");
		key.fun = "case_writeoff_interest_list";
		key.method = "load_case_writeoff_interest_list_page_content";
		var keyExtra = {};
		keyExtra.contractId = session.get("contractId");
		key.extra = keyExtra;
		
		var extra={};
		extra.operation =ConstDef.getConstant("NATIVE_STORAGE_QUERY");
		extra.callback = "load_case_writeoff_interest_list_page_content_from_native_storage";
		extra.newDataKey = {};
		extra.newData = {};

		loadNativeStorage(key.userId, key.fun, key.method , key.extra, extra.operation,extra.callback,extra.newDataKey,extra.newData);

	}
});

function case_writeoff_interest_list_load_content(){
	
}
//加载核销明细列表，并显示
function load_case_writeoff_interest_list_page_content(){
	
	var $list = $("#case_writeoff_interest_list_page .List");
	$list.empty();
	
	showLoading();
	var postData = {};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.contractId = session.get("contractId");
	$.getJSON(basePath+"/app/caseWriteoffInterestList/pageInit.xhtml"+callback, postData,function(msg){
		if($.trim(msg.returnCode) == '0'){
			
			//存入缓存
			var key = {};
			key.userId = session.get("userId");
			key.fun = "case_writeoff_interest_list";
			key.method = "load_case_writeoff_interest_list_page_content";
			var keyExtra = {};
			keyExtra.contractId = session.get("contractId");
			key.extra = keyExtra;
			saveDownloadRawDataToNativeStorage(key.userId, key.fun, key.method, key.extra,msg);
			
			bind_case_writeoff_interest_list_to_page(msg);
		
			showHide();
		}
		else{
        	showHide();
        	errorHandler(msg.returnCode,msg.message);
        }
		
	});//end $.getJSON
	
	
}
//加载核销明细列表，并显示
function load_case_writeoff_interest_list_page_content_from_native_storage(value){
	
	var $list = $("#case_writeoff_interest_list_page .List");
	$list.empty();
	if(value){
		
		showLoading();
		var msg = JSON.parse(value); 
		if (msg.data != null) {
			
			bind_case_writeoff_interest_list_to_page(msg);
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

function bind_case_writeoff_interest_list_to_page(msg){

	var $list = $("#case_writeoff_interest_list_page .List");
	if(msg.data.length<=0){
	     showHide();
		 return;
	}
	
	//核销明细列表的初始化
	var $template = $("#case_writeoff_interest_list_page .list-row-template");
	$.each(msg.data,function(i,n){
		//核销基数  金额千分位格式化
		if(n["hxBaseAmount"] != null){
			n["hxBaseAmount"] = fmoney(n["hxBaseAmount"],2);
		}
		//基准利率  利率百分化
		if(n["rate"] != null){
			n["rate"] = (n["rate"]*100)+'%';
		}
		//核销罚息起始日
		if(n["startDate"] != null){
			n["startDate"] = n["startDate"].substring(0,10);
		}
		//核销罚息终止日
		if(n["endDate"] != null){
			n["endDate"] = n["endDate"].substring(0,10);
		}
		//核销罚息起止日
		var startEndDate = n["startDate"]+' ~ '+n["endDate"]
		
		//核销后罚息 金额千分位格式化
		if(n["insertFee"] != null){
			n["insertFee"] = fmoney(n["insertFee"],2);
		}
		
		var $item = $template.clone(true);
		$item.find("[identity='startEndDate']").text(startEndDate);
		
		dataBindToElement($item,n);
		$item.removeClass("list-row-template");
		$item.show();
		
		$list.append($item);
	});//end $.each
}
/******************************case_writeoff_interest_list_page---end**************************************/