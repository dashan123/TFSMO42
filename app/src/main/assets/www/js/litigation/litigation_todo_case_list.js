var litigation_todo_case_list_page = $('#litigation_todo_case_list_page');
var litigation_todo_case_list_myScroll;

/******************************litigation_todo_case_list_page---begin**************************************/	   
litigation_todo_case_list_page.live('pageinit',function(e, ui){
	
	//定义分页用到的数据
	var wrapper = "litigation_todo_case_list_wrapper";
	var up = "litigation_todo_case_list_pullUp";
    var down = "litigation_todo_case_list_pullDown";

	litigation_todo_case_list_myScroll = createMyScroll(wrapper,up,down);
	
	litigation_todo_case_list_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page("workbench_page");
		return false;
	});
	
	//可诉案件列表项目点击事件
	litigation_todo_case_list_page.find(".ListRow").live("tap",function(){
		session.set("page_keyword","诉讼案件列表");
		session.set("page_title","诉讼案件列表");
		session.set("page_from","litigation_todo_case_list_page");
		
		//内部合同号（来自接口）
		var contractId = $(this).attr("contractId");
		session.set("contractId",contractId);
		//可诉案件ID
		var litigToDoCaseId = $(this).find("[identity='id']").text();
		session.set("litigToDoCaseId",litigToDoCaseId);
		//案件号
		var caseId = $(this).attr("caseId");
		session.set("caseId",caseId);
		//案件类型
		var caseCategory = $(this).find("[identity='caseCategory']").text();
		session.set("caseCategory",caseCategory);
		
		//设置当前选项的index到session中
		var scrollCurrentElementIndex = 0;
		var scrollCurrentElementNum = $(this).attr("scrollCurrentElementNum");
		var scrollCurrentPage = $(this).attr("scrollCurrentPage");
		var pageDisplayCount = session.get("pageDisplayCount");
 	    var pageAddCount = session.get("pageAddCount");
 	   if(scrollCurrentPage <= 1){
 		   	scrollCurrentElementIndex = parseInt(scrollCurrentElementNum)+1;
	    }else{
	    	scrollCurrentElementIndex = parseInt(pageDisplayCount)+((parseInt(scrollCurrentPage)-2)*parseInt(pageAddCount))+parseInt(scrollCurrentElementNum)+1;
	    }
		var scrollMapJSON = {};
		scrollMapJSON.scrollCurrentElementIndex = scrollCurrentElementIndex;
		scrollMap.litigation_todo_case_list_page = JSON.stringify(scrollMapJSON);
		
		//跳转到诉讼详情页面--可以添加在诉地址
		goto_page("litigation_task_handle_page");
	});
	
	// 点击查询按钮搜索
	litigation_todo_case_list_page.find(".chooseBtn").live("tap", function() {
		
		load_litigation_todo_case_list_content();
	});
	
});
/******************************litigation_todo_case_list_page---end**************************************/

litigation_todo_case_list_page.live('pageshow',function(e, ui){
	
	currentLoadActionName = "litigation_todo_case_list_load_content";
	
	var fromPage = session.get("fromPage");
	 if(fromPage != "litigation_task_handle_page"){
		 
		 $("#litigation_todo_case_list_page").find(".search-box-2row input").val("");
		 
		 load_litigation_todo_case_list_content0();
	 }else{
			// 获取当前页的index
			var scrollCurrentElementIndex = 0;
	 	    var scrollNowPage = session.get("nowPage");
	 	    if(!$.isEmptyObject(scrollMap)){
	 	    	var commonScrollMapJsonObj = scrollMap[scrollNowPage];
	 	    	if(commonScrollMapJsonObj != null && typeof(commonScrollMapJsonObj) != "undefined"){
	 	    		commonScrollMapJsonObj = JSON.parse(commonScrollMapJsonObj);
	 	    		scrollCurrentElementIndex = commonScrollMapJsonObj.scrollCurrentElementIndex;
 	 	 	    	//删除Json数据中的scrollNowPage属性  
 	 	 	        delete scrollMap[scrollNowPage]; 
	 	    	}
	 	    	
	 	    }
			var scrollCurrentElement = $('#litigation_todo_case_list_page').find('.ListRow').get(scrollCurrentElementIndex);
			litigation_todo_case_list_myScroll.refresh();//刷新iScroll
			litigation_todo_case_list_myScroll.scrollToElement(scrollCurrentElement,0);
	}
	 
});

function litigation_todo_case_list_load_content(){
	//下拉不刷新，则该方法置空
}

function load_litigation_todo_case_list_content0(){
	//如果网络是连通的
	if(isNetworkConnected()){
		load_litigation_todo_case_list_content();
	}
	else{
		//读取缓存
		var key = {};
		key.userId = session.get("userId");
		key.fun = "litigation_todo_case_list";
		key.method = "load_litigation_todo_case_list_content0";
		var keyExtra = {};
		key.extra = keyExtra;
		
		var extra={};
		extra.operation =ConstDef.getConstant("NATIVE_STORAGE_QUERY");
		extra.callback = "load_litigation_todo_case_list_content_from_native_storage";
		extra.newDataKey = {};
		extra.newData = {};

		loadNativeStorage(key.userId, key.fun, key.method , key.extra, extra.operation,extra.callback,extra.newDataKey,extra.newData);
	}
}

//加载诉讼案件列表，并显示
function load_litigation_todo_case_list_content(){
	
	var page = $("#litigation_todo_case_list_page");
	page.find(".List").empty();
	
	showLoading();
	var postData = {};
    postData.random = Math.random();
    postData.userId = session.get("userId");
//    postData.userCode = session.get("userCode");
    postData.city = page.find("[name='city']").val();//城市
    postData.customerName = page.find("[name='customerName']").val();//客户姓名
    postData.contractNumber = page.find("[name='contractNumber']").val();//合同号
    
	$.getJSON(basePath+"/app/LitigationTodoCaseList/pageInit.xhtml"+callback, postData,function(msg){
		if($.trim(msg.returnCode) == '0'){
			//存入缓存
			var key = {};
			key.userId = session.get("userId");
			key.fun = "litigation_todo_case_list";
			key.method = "load_litigation_todo_case_list_content";
			var keyExtra = {};
			keyExtra.caseClassification = $("#litigation_todo_case_list_page .topBar").find("span:first").attr("code");
			key.extra = keyExtra;
			
			saveDownloadDataToNativeStorage(key.userId, key.fun, key.method, key.extra,msg,"id");
			
			bind_litigation_todo_case_list_to_page(msg);
		
			showHide();
		}else{
        	showHide();
        	errorHandler(msg.returnCode,msg.message);
        }
	});//end $.getJSON
}

function load_litigation_todo_case_list_content_from_native_storage(value){
	
	var $litigation_todo_case_list = $("#litigation_todo_case_list_page .List");
	$litigation_todo_case_list.empty();
	
	if(value){
		showLoading();
		
		var msg = JSON.parse(value); 
		bind_litigation_todo_case_list_to_page(msg);	
				
		showHide();
		showMessage('当前网络处于离线状态，您正在查看缓存数据', '1500');
	}
	else{
		showMessage('当前网络处于离线状态，未读到缓存数据', '1500');
	}
	
}

function bind_litigation_todo_case_list_to_page(msg){
	
	var $litigation_todo_case_list = $("#litigation_todo_case_list_page .List");
	if(msg.data.length<=0){
	     showHide();
	  	 return;
	 }

	//可催案件列表的初始化
	var $template = $("#litigation_todo_case_list_page .list-row-template");
	$.each(msg.data,function(i,n){

		var $item = $template.clone(true);
		$item.children(".ListRow").attr("contractId",n["contractId"]);
		$item.find(".ListRow").attr("caseId",n["caseId"]);
		//用于返回该页面时计算选项的index
		$item.find(".ListRow").attr("scrollCurrentPage",1);
		$item.find(".ListRow").attr("scrollCurrentElementNum",i);
		
		//剩余本金 金额千分位格式化
		n.oddCorpus = fmoney(n.oddCorpus,2);
		//逾期总金额 金额千分位格式化
		n.overdueAmount = fmoney(n.overdueAmount,2);
		dataBindToElement($item,n);
		
		//如果案件为协办
		if(n["caseCategory"]==ConstDef.getConstant("CASE_CATEGORY_ASSIST")){
			var $closeButton = $item.find('[identity="close-button"]');
			
			$closeButton.attr("caseId",n["caseId"]);
			$closeButton.attr("litigTodoCaseId",n["id"]);
			$closeButton.attr("litigationCaseRecordId",n["litigationCaseRecordId"]);
			$closeButton.show();
			$closeButton.bind("tap",function(event){
				if(isNetworkConnected()){
					
						var postData2 = {};
						postData2.random = Math.random();
						var userInfo = JSON.parse(session.get("userInfo"));
						postData2.userCssCode = userInfo.userMapping.CSS;
						postData2.userId = session.get("userId");
						postData2.userCode = session.get("userCode");
						postData2.caseId = $(this).attr("caseId");
						postData2.litigTodoCaseId = $(this).attr("litigTodoCaseId");
				        showConfirm("请确认是否要关闭协办案件", function(){ 
						$.getJSON(basePath+"/app/LitigationTodoCaseList/closeCoSpon.xhtml"+callback, postData2,function(msg){
							if(msg.data == ConstDef.getConstant("RESULT_SUCESS")){
								showMessage("案件成功关闭！",1500);
								load_litigation_todo_case_list_content();
							}
							else{
								showMessage("案件关闭失败！",1500);
							}
						});
		                 
		              });
		        }
				else{
					showMessage('当前网络处于离线状态，该功能不支持离线操作。', '1500');
				}
				event.stopPropagation(); 
			});
		}

		$item.removeClass("list-row-template");
		$item.show();
		
		$litigation_todo_case_list.append($item);
	});//end $.each
}

//合同号获得焦点事件
function focusContractNumber(obj){
	if(obj){
		if(obj.value == ""){
			obj.value="HP"
		}
	}
}
//合同号失去焦点事件
function blurContractNumber(obj){
	if(obj){
		if(obj.value == "HP"){
			obj.value=""
		}
	}
}
	