var case_debit_list_page = $('#case_debit_list_page');
var case_debit_list_myScroll;
/******************************home_page---begin**************************************/	   
case_debit_list_page.live('pageinit',function(e, ui){
	
	var wrapper = "case_debit_list_wrapper";
    var up = "case_debit_list_pullUp";
    var down = "case_debit_list_pullDown";
	case_debit_list_wrapper = createMyScroll(wrapper,up,down);
	currentLoadActionName = "case_debit_list_load_content";
	case_debit_list_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page();
	});
	
});

/******************************home_page---end**************************************/
case_debit_list_page.live('pageshow',function(e, ui){
//如果网络是连通的
	if(isNetworkConnected()){
		load_case_debit_list_content();
	}
	else{

		//读取缓存
		var key = {};
		key.userId = session.get("userId");
		key.fun = "case_debit_list";
		key.method = "load_case_debit_list_content";
		var keyExtra = {};
		keyExtra.contractId = session.get("contractId");
		key.extra = keyExtra;
		
		var extra={};
		extra.operation =ConstDef.getConstant("NATIVE_STORAGE_QUERY");
		extra.callback = "load_case_debit_list_content_from_native_storage";
		extra.newDataKey = {};
		extra.newData = {};

		loadNativeStorage(key.userId, key.fun, key.method , key.extra, extra.operation,extra.callback,extra.newDataKey,extra.newData);

	}

});

	function case_debit_list_load_content(){
		
	}
	
	//加载扣款流水列表，并显示
	function load_case_debit_list_content(){
		
		var $list = $("#case_debit_list_page .List");
		$list.empty();
		
		showLoading();
		
		var postData = {};
		postData.random = new Date();
		postData.userCode = session.get("userCode");
		postData.contractId = session.get("contractId");
		$.getJSON(basePath+"/app/CaseDebitList/pageInit.xhtml"+callback, postData,function(msg){
			if($.trim(msg.returnCode) == '0'){
				
				//存入缓存
				var key = {};
				key.userId = session.get("userId");
				key.fun = "case_debit_list";
				key.method = "load_case_debit_list_content";
				var keyExtra = {};
				keyExtra.contractId = session.get("contractId");
				key.extra = keyExtra;
				saveDownloadRawDataToNativeStorage(key.userId, key.fun, key.method, key.extra,msg);
				
				bind_case_debit_list_to_page(msg);
			
				showHide();
				
			
			}
			else{
	            	showHide();
	            	errorHandler(msg.returnCode,msg.message);
	            }

			
		});//end $.getJSON
	}


function load_case_debit_list_content_from_native_storage(value){

	var $list = $("#case_debit_list_page .List");
	$list.empty();

	if(value){
		
		showLoading();

		var msg = JSON.parse(value); 

		if (msg.data != null) {
			bind_case_debit_list_to_page(msg);
			
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

function bind_case_debit_list_to_page(msg){
	
	var $list = $("#case_debit_list_page .List");
	
	if(msg.data.length<=0){
	     showHide();
//  	 showMessage('暂无数据','1500');
  	 return;
	}
   

	//扣款流水列表的初始化
	var $template = $("#case_debit_list_page .list-row-template");
	
	$.each(msg.data,function(i,n){

		var $item = $template.clone(true);
		$item.find("[identity='repaymentPeriod']").text((n["repaymentPeriod"]));
		$item.find("[identity='debitDatetime']").text((n["debitDatetime"]).substring(0,10));
		if(n["debitAmount"] != null){
			n["debitAmount"] = fmoney(n["debitAmount"],2);
		}
		$item.find("[identity='debitAmount']").text(n["debitAmount"]);
		$item.find("[identity='debitType']").text(n["debitType"]);
		$item.find("[identity='debitTypeDesc']").text(n["debitTypeDesc"]);
		$item.find("[identity='descRepaymentPerson']").text(n["descRepaymentPerson"]);
		$item.find("[identity='refundRevokeDate']").text((n["refundRevokeDate"]).substring(0,10));
		
		
		$item.find("[identity='debitSerialNumber']").text(n["debitSerialNumber"]);
		$item.find("[identity='bank']").text(n["bank"]);
		$item.find("[identity='bankBranch']").text(n["bankBranch"]);
		
		
		$item.find("[identity='accounts']").text(n["accounts"]);
		if(n["refundAmount"] != null){
			n["refundAmount"] = fmoney(n["refundAmount"],2);
		}
		$item.find("[identity='refundAmount']").text(n["refundAmount"]);
		$item.find("[identity='executionStatus']").text(n["executionStatus"]);
		
		$item.find("[identity='operator']").text(n["operator"]);
		$item.find("[identity='operatingResults']").text(n["operatingResults"]);
							
		
		$item.removeClass("list-row-template");
		$item.show();
		
		
		$list.append($item);
	});//end $.each
}