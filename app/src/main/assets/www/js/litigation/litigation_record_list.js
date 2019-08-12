var litigation_record_list_page = $('#litigation_record_list_page');
var litigation_record_list_myScroll;
/******************************home_page---begin**************************************/	   
litigation_record_list_page.live('pageinit',function(e, ui){
	
	var wrapper = "litigation_record_list_wrapper";
    var up = "litigation_record_list_pullUp";
    var down = "litigation_record_list_pullDown";
    litigation_record_list_wrapper = createMyScroll(wrapper,up,down);

    litigation_record_list_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		var fromPage = session.get("fromPage");
		if(fromPage == 'litigation_task_handle_view_page'){
			back_page("litigation_task_handle_view_page");
		}else{
			back_page("litigation_task_handle_page");
		}
	});
	
    litigation_record_list_page.find(".addButton4").live("tap",function(event){
		event.stopPropagation();
		goto_page("litigation_record_add_page");
	});
});

/******************************home_page---end**************************************/
litigation_record_list_page.live('pageshow',function(e, ui){
	currentLoadActionName = "litigation_record_list_load_content";
	
	var fromPage = session.get("fromPage");
	if(fromPage == 'litigation_task_handle_view_page'){
		$("#litigation_record_list_page").find(".addButton4").css("display","none");
	}else{
		$("#litigation_record_list_page").find(".addButton4").css("display","");
	}
	
	//如果网络是连通的
	if(isNetworkConnected()){
		load_litigation_record_list_page_content();
	}
	else{
		//读取缓存
		var key = {};
		key.userId = session.get("userId");
		key.fun = "litigation_record_list";
		key.method = "load_litigation_record_list_page_content";
		var keyExtra = {};
		keyExtra.caseId = session.get("caseId");
		key.extra = keyExtra;
		
		var extra={};
		extra.operation =ConstDef.getConstant("NATIVE_STORAGE_QUERY");
		extra.callback = "load_litigation_record_list_page_content_from_native_storage";
		extra.newDataKey = {};
		extra.newData = {};

		loadNativeStorage(key.userId, key.fun, key.method , key.extra, extra.operation,extra.callback,extra.newDataKey,extra.newData);

	}
});


function litigation_record_list_load_content(){
	
}

//加载诉讼事件列表，并显示
function load_litigation_record_list_page_content(){
	
	var $list = $("#litigation_record_list_page .List");
	$list.empty();
	
	showLoading();
	var postData = {};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.caseId = session.get("caseId");
	$.getJSON(basePath+"/app/litigationRecordList/pageInit.xhtml"+callback, postData,function(msg){
		if($.trim(msg.returnCode) == '0'){
			
			//存入缓存
			var key = {};
			key.userId = session.get("userId");
			key.fun = "litigation_record_list";
			key.method = "load_litigation_record_list_page_content";
			var keyExtra = {};
			keyExtra.caseId = session.get("caseId");
			key.extra = keyExtra;
			saveDownloadRawDataToNativeStorage(key.userId, key.fun, key.method, key.extra,msg);
			
			bind_litigation_record_list_to_page(msg);
		
			showHide();
		}
		else{
        	showHide();
        	errorHandler(msg.returnCode,msg.message);
        }
		
	});//end $.getJSON
	
	
}
//加载诉讼事件列表，并显示
function load_litigation_record_list_page_content_from_native_storage(value){
	
	var $list = $("#litigation_record_list_page .List");
	$list.empty();
	if(value){
		
		showLoading();
		var msg = JSON.parse(value); 
		if (msg.data != null) {
			
			bind_litigation_record_list_to_page(msg);
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

function bind_litigation_record_list_to_page(msg){

	var $list = $("#litigation_record_list_page .List");
	if(msg.data.length<=0){
	     showHide();
	     setTimeout(function(){
	    	 showMessage("数据不存在",3000)
	     },1000);
		 return;
	}
	
	//诉讼事件列表的初始化
	var $template = $("#litigation_record_list_page .list-row-template");
	$.each(msg.data,function(i,n){
		//提醒时间
		if(n["notifyTime"] != null){
			n["notifyTime"] = n["notifyTime"].substring(0,19);
		}
		//创建时间
		if(n["createTime"] != null){
			n["createTime"] = n["createTime"].substring(0,19);
		}
		var $item = $template.clone(true);
		
		dataBindToElement($item,n);
		$item.removeClass("list-row-template");
		$item.show();
		
		$list.append($item);
	});//end $.each
}
