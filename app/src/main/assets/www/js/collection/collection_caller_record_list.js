var collection_caller_record_list_page = $('#collection_caller_record_list_page');
var collection_caller_record_list_myScroll;
/******************************collection_caller_record_list_page---begin**************************************/	   
collection_caller_record_list_page.live('pageinit',function(e, ui){
	
	var wrapper = "collection_caller_record_list_wrapper";
    var up = "collection_caller_record_list_pullUp";
    var down = "collection_caller_record_list_pullDown";
	collection_caller_record_list_myScroll = createMyScroll(wrapper,up,down);
	
	collection_caller_record_list_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page();
	});
	
});

collection_caller_record_list_page.live('pageshow',function(e, ui){
	
	currentLoadActionName = "collection_caller_record_list_load_content";
	//如果网络是连通的
	if(isNetworkConnected()){
		load_collection_caller_record_list_page_content();
	}
	else{
		//读取缓存
		var key = {};
		key.userId = session.get("userId");
		key.fun = "collection_caller_record_list";
		key.method = "load_collection_caller_record_list_page_content";
		var keyExtra = {};
		keyExtra.contractId = session.get("contractId");
		key.extra = keyExtra;
		
		var extra={};
		extra.operation =ConstDef.getConstant("NATIVE_STORAGE_QUERY");
		extra.callback = "load_collection_caller_record_list_page_content_from_native_storage";
		extra.newDataKey = {};
		extra.newData = {};

		loadNativeStorage(key.userId, key.fun, key.method , key.extra, extra.operation,extra.callback,extra.newDataKey,extra.newData);

	}
});

function collection_caller_record_list_load_content(){
	
}
//加载核销明细列表，并显示
function load_collection_caller_record_list_page_content(){
	
	var $list = $("#collection_caller_record_list_page .List");
	$list.empty();
	
	showLoading();
	var postData = {};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.contractNumber = session.get("contractNumber");//案件合同号
	$.getJSON(basePath+"/app/collectionCallerRecordList/pageInit.xhtml"+callback, postData,function(msg){
		if($.trim(msg.returnCode) == '0'){
			
			//存入缓存
			var key = {};
			key.userId = session.get("userId");
			key.fun = "collection_caller_record_list";
			key.method = "load_collection_caller_record_list_page_content";
			var keyExtra = {};
			keyExtra.contractId = session.get("contractId");
			key.extra = keyExtra;
			saveDownloadRawDataToNativeStorage(key.userId, key.fun, key.method, key.extra,msg);
			
			bind_collection_caller_record_list_to_page(msg);
		
			showHide();
		}
		else{
        	showHide();
        	errorHandler(msg.returnCode,msg.message);
        }
		
	});//end $.getJSON
	
	
}
//加载核销明细列表，并显示
function load_collection_caller_record_list_page_content_from_native_storage(value){
	
	var $list = $("#collection_caller_record_list_page .List");
	$list.empty();
	if(value){
		
		showLoading();
		var msg = JSON.parse(value); 
		if (msg.data != null) {
			
			bind_collection_caller_record_list_to_page(msg);
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

function bind_collection_caller_record_list_to_page(msg){

	var $list = $("#collection_caller_record_list_page .List");
	if(msg.data.length<=0){
	     showHide();
		 return;
	}
	
	//催收信息来电记录列表的初始化
	var $template = $("#collection_caller_record_list_page .list-row-template");
	$.each(msg.data,function(i,n){

		var $item = $template.clone(true);
		
		dataBindToElement($item,n);
		$item.removeClass("list-row-template");
		$item.show();
		
		$list.append($item);
	});//end $.each
}
/******************************collection_caller_record_list_page---end**************************************/