var collection_dictionary_data_list_page = $("#collection_dictionary_data_list_page");
var collection_dictionary_data_list_myScroll;

collection_dictionary_data_list_page.live("pageinit",function(e, ui) {

			var wrapper = "collection_dictionary_data_list_wrapper";
			var up = "collection_dictionary_data_list_pullUp";
			var down = "collection_dictionary_data_list_pullDown";
			collection_dictionary_data_list_myScroll = createMyScroll(wrapper,up, down);
			currentLoadActionName = "collection_dictionary_data_list_load_content";
			// 返回前页
			collection_dictionary_data_list_page.find(".BackBtn").live("tap",function(event) {
				event.stopPropagation();
				//				back_page();
				
				session.set("_fromPage2","collection_dictionary_data_list_page")
				goto_page2(session.get("nowPage"));
						
			});
		});

collection_dictionary_data_list_page.live("pageshow", function(e, ui) {
	currentLoadActionName = "collection_dictionary_data_list_load_content";
	
	
	
//	var fromPage = session.get("fromPage");
//	// 如果前页面是workbench,则进入页面后重新加载数据
//	if (fromPage == "travel_record_list_page") {
	
	
	//加载字典数据
	collection_dictionary_data_list_load_content();
//	}

});
function collection_dictionary_data_list_load_content(){
	
	//如果网络是连通的
	if(isNetworkConnected()){
		load_collection_dictionary_data_list_content();
	}
	else{
		
		//读取缓存
		var key = {};
		key.userId = session.get("userId");
		key.fun = "collection_dictionary_data_list";
		key.method = "load_collection_dictionary_data_list_content";
		keyExtra = {};
		var dictData = JSON.parse(session.get("dictData"));
		keyExtra.source = dictData.source;
		keyExtra.dictionaryCategoryCode = dictData.dictionaryCategoryCode;
		
		key.extra = keyExtra;
		
		
		var extra={};
		extra.operation =ConstDef.getConstant("NATIVE_STORAGE_QUERY");
		extra.callback = "load_collection_dictionary_data_list_content_from_native_storage";
		extra.newDataKey = {};
		extra.newData = {};

		loadNativeStorage(key.userId, key.fun, key.method , key.extra, extra.operation,extra.callback,extra.newDataKey,extra.newData);
	}
}   

function load_collection_dictionary_data_list_content(){

	var $page=$("#collection_dictionary_data_list_page");
	
	var $dictionaryDataList = $page.find("#dictionaryDataList");
	$dictionaryDataList.empty();
	

	showLoading();
	var authData = {};
	authData.userCode = session.get("userCode");
	authData.random = Math.random();
	var dictData = JSON.parse(session.get("dictData"));
	authData.source = dictData.source;
	authData.dictionaryCategoryCode = dictData.dictionaryCategoryCode;// session.get("dictionaryCategoryCode");
	  
	$.getJSON(basePath+"/app/CollectionDictionaryDataList/pageInit.xhtml"+callback,authData,function(msg){
		  if($.trim(msg.returnCode) == '0'){
			     
			//存入缓存
			var key = {};
			key.userId = session.get("userId");
			key.fun = "collection_dictionary_data_list";
			key.method = "load_collection_dictionary_data_list_content";
			keyExtra = {};
			var dictData = JSON.parse(session.get("dictData"));
			keyExtra.source = dictData.source;
			keyExtra.dictionaryCategoryCode = dictData.dictionaryCategoryCode;
			
			key.extra = keyExtra;
			
			saveDownloadRawDataToNativeStorage(key.userId, key.fun, key.method, key.extra,msg);
			
			bind_collection_dictionary_data_list_to_page(msg);
			 
			showHide();
		  }else{
            	showHide();
            	errorHandler(msg.returnCode,msg.message);
           }
		  
	  });
}//end function load_collection_dictionary_data_list_content


function load_collection_dictionary_data_list_content_from_native_storage(value){

var $page=$("#collection_dictionary_data_list_page");
	
	var $dictionaryDataList = $page.find("#dictionaryDataList");
	$dictionaryDataList.empty();
	
	if(value){
		showLoading();
		
		var msg = JSON.parse(value);
		
		bind_collection_dictionary_data_list_to_page(msg);
			
		showHide();
		showMessage('当前网络处于离线状态，您正在查看缓存数据', '1500');
	}
	else{
		showMessage('当前网络处于离线状态，未读到缓存数据', '1500');
	}

}//end function load_collection_dictionary_data_list_content


function bind_collection_dictionary_data_list_to_page(msg){
	if (msg.data.length <= 0) {
		showHide();
//		showMessage('暂无数据', '1500');
	}
	var $page=$("#collection_dictionary_data_list_page");
	var $dictionaryDataList = $page.find("#dictionaryDataList");
	var dictData = JSON.parse(session.get("dictData"));
	//初始化字典数据列表
	$.each(msg.data.dictionaryDataList,function(i,n){
//		var actionCodeSource = ConstDef.getConstant("DICTIONARY_DATA_SOURCE_FROM_NON_DICTIONARY_TABLE");
//		var actionCode = ConstDef.getConstant("CATEGORY_CODE_FIELD_COLLECT_ACTION_CODE");
//		if(dictData.source == actionCodeSource && dictData.dictionaryCategoryCode == actionCode){
//			var $dictionaryDataItem = $("<li code='"+n["action_code_id"]+"'></li>");
//			$dictionaryDataItem.text(n["name"]);
//		}else{
			var $dictionaryDataItem = $("<li code='"+n["code"]+"'></li>");
			$dictionaryDataItem.text(n["name"]);
//		}
		
		$dictionaryDataItem.bind("tap",function(){
			
			//当前项高亮，并存入session
			$(this).css("background-color","#E75858");
			
			var dictDataObj = {};
			dictDataObj.dictionaryCategoryCode = dictData.dictionaryCategoryCode;
			dictDataObj.code = $(this).attr("code");
			dictDataObj.name = $(this).text();
			session.set("dictData",JSON.stringify(dictDataObj));
			session.set("_fromPage2","collection_dictionary_data_list_page")
			goto_page2(session.get("nowPage"));
	
		});
		
		$dictionaryDataList.append($dictionaryDataItem);
	});//end $.each
}