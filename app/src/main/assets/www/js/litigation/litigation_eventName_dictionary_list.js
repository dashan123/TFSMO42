var litigation_eventName_dictionary_list_page = $("#litigation_eventName_dictionary_list_page");
var litigation_eventName_dictionary_list_myScroll;

litigation_eventName_dictionary_list_page.live("pageinit",function(e, ui) {

	var wrapper = "litigation_eventName_dictionary_list_wrapper";
	var up = "litigation_eventName_dictionary_list_pullUp";
	var down = "litigation_eventName_dictionary_list_pullDown";
	litigation_eventName_dictionary_list_myScroll = createMyScroll(wrapper,up, down);
	
	// 返回前页
	litigation_eventName_dictionary_list_page.find(".BackBtn").live("tap",function(event) {
		event.stopPropagation();
		session.set("_fromPage2","litigation_eventName_dictionary_list_page")
		goto_page2(session.get("nowPage"));
				
	});
	
	litigation_eventName_dictionary_list_page.find("#dictionaryDataList li").live("tap",function(event) {
		event.stopPropagation();
		//当前项高亮，并存入session
		$(this).css("background-color","#E75858");
		
		var dictData = JSON.parse(session.get("dictData"));
		var dictDataObj = {};
		dictDataObj.dictionaryCategoryCode = dictData.dictionaryCategoryCode;
		dictDataObj.code = $(this).attr("code");
		dictDataObj.name = $(this).text();
		session.set("dictData",JSON.stringify(dictDataObj));
		session.set("_fromPage2","litigation_eventName_dictionary_list_page")
		goto_page2(session.get("nowPage"));
		
	});
});

litigation_eventName_dictionary_list_page.live("pageshow", function(e, ui) {
	
	currentLoadActionName = "litigation_eventName_dictionary_list_load_content";
	//加载字典数据
	litigation_eventName_dictionary_list_load_content();
});

function litigation_eventName_dictionary_list_load_content(){
	
	//如果网络是连通的
	if(isNetworkConnected()){
		load_litigation_eventName_dictionary_list_content();
	}
	else{
		//读取缓存
		var key = {};
		key.userId = session.get("userId");
		key.fun = "litigation_eventName_dictionary_list";
		key.method = "load_litigation_eventName_dictionary_list_content";
		keyExtra = {};
		var dictData = JSON.parse(session.get("dictData"));
//		keyExtra.source = dictData.source;
		keyExtra.dictionaryCategoryCode = dictData.dictionaryCategoryCode;
		key.extra = keyExtra;
		
		var extra={};
		extra.operation =ConstDef.getConstant("NATIVE_STORAGE_QUERY");
		extra.callback = "load_litigation_eventName_dictionary_list_content_from_native_storage";
		extra.newDataKey = {};
		extra.newData = {};

		loadNativeStorage(key.userId, key.fun, key.method , key.extra, extra.operation,extra.callback,extra.newDataKey,extra.newData);
	}
}   

function load_litigation_eventName_dictionary_list_content(){

	var $page=$("#litigation_eventName_dictionary_list_page");
	
	var $dictionaryDataList = $page.find("#dictionaryDataList");
	$dictionaryDataList.empty();

	showLoading();
	var authData = {};
	authData.userCode = session.get("userCode");
	authData.random = Math.random();
	var dictData = JSON.parse(session.get("dictData"));
//	authData.source = dictData.source;
	authData.dictionaryCategoryCode = dictData.dictionaryCategoryCode;
	
	$.getJSON(basePath+"/app/litigationEventNameDictionaryList/pageInit.xhtml"+callback,authData,function(msg){
		  if($.trim(msg.returnCode) == '0'){
			     
			//存入缓存
			var key = {};
			key.userId = session.get("userId");
			key.fun = "litigation_eventName_dictionary_list";
			key.method = "load_litigation_eventName_dictionary_list_content";
			keyExtra = {};
			var dictData = JSON.parse(session.get("dictData"));
//			keyExtra.source = dictData.source;
			keyExtra.dictionaryCategoryCode = dictData.dictionaryCategoryCode;
			key.extra = keyExtra;
			
			saveDownloadRawDataToNativeStorage(key.userId, key.fun, key.method, key.extra,msg);
			
			bind_litigation_eventName_dictionary_list_to_page(msg);
			 
			showHide();
		  }else{
            	showHide();
            	errorHandler(msg.returnCode,msg.message);
           }
		  
	  });
}//end


function load_litigation_eventName_dictionary_list_content_from_native_storage(value){

var $page=$("#litigation_eventName_dictionary_list_page");
	
	var $dictionaryDataList = $page.find("#dictionaryDataList");
	$dictionaryDataList.empty();
	
	if(value){
		showLoading();
		
		var msg = JSON.parse(value);
		
		bind_litigation_eventName_dictionary_list_to_page(msg);
			
		showHide();
		showMessage('当前网络处于离线状态，您正在查看缓存数据', '1500');
	}
	else{
		showMessage('当前网络处于离线状态，未读到缓存数据', '1500');
	}

}//end


function bind_litigation_eventName_dictionary_list_to_page(msg){
	
	if (msg.data.length <= 0) {
		showHide();
	}
	
	var $page=$("#litigation_eventName_dictionary_list_page");
	var $dictionaryDataList = $page.find("#dictionaryDataList");
	
	$dictionaryDataList.append($("<li code=''>请选择</li>"));
	//初始化字典数据列表
	$.each(msg.data.dictionaryDataList,function(i,n){
		var $dictionaryDataItem = $("<li code='"+n["code"]+"'></li>");
		$dictionaryDataItem.text(n["name"]);
		
		$dictionaryDataList.append($dictionaryDataItem);
	});//end $.each
}