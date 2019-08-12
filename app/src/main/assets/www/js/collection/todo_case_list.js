var todo_case_list_page = $('#todo_case_list_page');
var todo_case_list_myScroll;

var todo_case_list_recentDaysJqwdh = 5;
var todo_case_list_recentDaysJqwsd = 20;
/******************************home_page---begin**************************************/	   
todo_case_list_page.live('pageinit',function(e, ui){
	
	//定义分页用到的数据
	var wrapper = "todo_case_list_wrapper";
	var up = "todo_case_list_pullUp";
    var down = "todo_case_list_pullDown";

	todo_case_list_myScroll = createMyScroll(wrapper,up,down);
	
	
	todo_case_list_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page("workbench_page");
	});
	
	// 隐藏遮罩层
	$("#todo_case_list_page #todo_case_list_tirebox").hide();
	//条件初始化
	$("#todo_case_list_page .topBar").find("span:first").text("全部");
	$("#todo_case_list_page .topBar").find("span:first").attr("code","1");
	
	//可催案件列表项目点击事件
	todo_case_list_page.find(".ListRow").live("tap",function(){
		session.set("page_keyword","可催案件列表");
		session.set("page_title","可催案件列表");
		session.set("page_from","todo_case_list_page");
		
		var contractId = $(this).attr("contractId");
		session.set("contractId",contractId);
		var toDoCaseId = $(this).find("[identity='id']").text();
		session.set("cssCollectionRecordDetailsSave_toDoCaseId",toDoCaseId);  //css_collection_record_details_save_page页面使用后移除
		session.set("todoCaseId",toDoCaseId);  //css_collection_record_details_save_page页面使用后移除
		
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
		scrollMap.todo_case_list_page = JSON.stringify(scrollMapJSON);
		
		//跳转到案件详情页面--可以添加在催地址
		goto_page("collection_case_details_page");
	});
	
	//获得“近期”的设置
	var postData = {};
    postData.random = Math.random();
    postData.userId = session.get("userId");
    postData.userCode = session.get("userCode");
   
	$.getJSON(basePath+"/app/TodoCaseList/getRecentDaysSetting.xhtml"+callback, postData,function(msg){
		if($.trim(msg.returnCode) == '0'){
			
			//近期未电话的近期标准显示
			var recentDaysJqwdh = msg.data.recentDaysJqwdh;
			if(recentDaysJqwdh){
				if(recentDaysJqwdh.length > 0){
//					$template.find("[identity='RECENTLY_DAYS_JQWDH']").text(recentDaysJqwdh[0]["code"]+"日内");
					todo_case_list_recentDaysJqwdh = recentDaysJqwdh[0]["code"];
				}
			}
			
			
			//近期未实地的近期标准显示
			var recentDaysJqwsd = msg.data.recentDaysJqwsd;
			if(recentDaysJqwsd){
				if(recentDaysJqwsd.length > 0){
//					$template.find("[identity='RECENTLY_DAYS_JQWSD']").text(recentDaysJqwsd[0]["code"]+"日内");
					todo_case_list_recentDaysJqwsd = recentDaysJqwsd[0]["code"];
				}
			}

			showHide();
		}
		else{
            	showHide();
            	errorHandler(msg.returnCode,msg.message);
            }
	});//end $.getJSON
	
	// 选择查询条件分类
	todo_case_list_page.find(".topBar").live("tap",function() {
		//下箭头变上箭头
		var $arrow = $(this).find("span:last");
		$arrow.removeClass("allBtn_down");
		$arrow.addClass("allBtn_up");
		// 显示遮罩层
		$("#todo_case_list_page #todo_case_list_tirebox").show();

		// 取消遮罩层
		$("#todo_case_list_page #todo_case_list_tirebox .Cancel").live("tap",function() {
			$("#todo_case_list_page #todo_case_list_tirebox").hide();
			$arrow.removeClass("allBtn_up");
			$arrow.addClass("allBtn_down");
		});

	});
});
/******************************home_page---end**************************************/
todo_case_list_page.live('pageshow',function(e, ui){
	currentLoadActionName = "todo_case_list_load_content";
	
	var $todoCaseList = $("#todo_case_list_page #todo_case_list_list");
	$todoCaseList.empty();
	
	var $todoCaseListItem = $("<li code='1'></li>");
	$todoCaseListItem.text("全部");
	$todoCaseList.append($todoCaseListItem);
	
	$todoCaseListItem = $("<li code='2'></li>");
	$todoCaseListItem.text("待核销");
	$todoCaseList.append($todoCaseListItem);
	
	$todoCaseListItem = $("<li code='3'></li>");
	$todoCaseListItem.text("已核销");
	$todoCaseList.append($todoCaseListItem);
	
	$todoCaseListItem = $("<li code='4'></li>");
	$todoCaseListItem.text("任务队列");
	$todoCaseList.append($todoCaseListItem);
	
	$todoCaseListItem = $("<li code='5'></li>");
	$todoCaseListItem.text("协办");
	$todoCaseList.append($todoCaseListItem);
	
	$todoCaseListItem = $("<li code='6'></li>");
	$todoCaseListItem.text(todo_case_list_recentDaysJqwdh+"日内未电话");
	$todoCaseList.append($todoCaseListItem);
	
	$todoCaseListItem = $("<li code='7'></li>");
	$todoCaseListItem.text(todo_case_list_recentDaysJqwsd+"日内未实地");
	$todoCaseList.append($todoCaseListItem);
	
	//点击弹层列表项进行选择
	var $todoCaseListItem = $todoCaseList.find("li");
	$todoCaseListItem.bind("tap",function(){
		
		var $caseClassification_condition = $("#todo_case_list_page .topBar").find("span:first");
		$caseClassification_condition.text($(this).text());
		$caseClassification_condition.attr("code",$(this).attr("code"));
		$("#todo_case_list_tirebox").hide();
		//下箭头变上箭头
		var $caseClassificationElement = $("#todo_case_list_page .topBar");
		var $arrow = $caseClassificationElement.children("span:last");
		$arrow.removeClass("allBtn_up");
		$arrow.addClass("allBtn_down");
		load_todo_case_list_content0();
			
	});
	var fromPage = session.get("fromPage");
	 if(fromPage != "collection_case_details_page"){
		 load_todo_case_list_content0();
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
			var scrollCurrentElement = $('#todo_case_list_page').find('.ListRow').get(scrollCurrentElementIndex);
			todo_case_list_myScroll.refresh();//刷新iScroll
			todo_case_list_myScroll.scrollToElement(scrollCurrentElement,0);
		}
});

	function todo_case_list_load_content(){
		//下拉不刷新，则该方法置空
	}

	function load_todo_case_list_content0(){
		//如果网络是连通的
		if(isNetworkConnected()){
			load_todo_case_list_content();
		}
		else{
			//读取缓存
			var key = {};
			key.userId = session.get("userId");
			key.fun = "todo_case_list";
			key.method = "load_todo_case_list_content";
			var keyExtra = {};
			keyExtra.caseClassification = $("#todo_case_list_page .topBar").find("span:first").attr("code");
			key.extra = keyExtra;
			
			var extra={};
			extra.operation =ConstDef.getConstant("NATIVE_STORAGE_QUERY");
			extra.callback = "load_todo_case_list_content_from_native_storage";
			extra.newDataKey = {};
			extra.newData = {};

			loadNativeStorage(key.userId, key.fun, key.method , key.extra, extra.operation,extra.callback,extra.newDataKey,extra.newData);
		}
	}
	
	//加载可催案件列表，并显示
	function load_todo_case_list_content(){
		
		var $todo_case_list = $("#todo_case_list_page .List");
		$todo_case_list.empty();
		
		showLoading();
		
		var postData = {};
	    postData.random = Math.random();
	    postData.userId = session.get("userId");
	    postData.userCode = session.get("userCode");
	    var caseClassification = $("#todo_case_list_page .topBar").find("span:first").attr("code");
	    postData.caseClassification = caseClassification;
		$.getJSON(basePath+"/app/TodoCaseList/pageInit.xhtml"+callback, postData,function(msg){
			if($.trim(msg.returnCode) == '0'){
				
				//存入缓存
				var key = {};
				key.userId = session.get("userId");
				key.fun = "todo_case_list";
				key.method = "load_todo_case_list_content";
				var keyExtra = {};
				keyExtra.caseClassification = $("#todo_case_list_page .topBar").find("span:first").attr("code");
				key.extra = keyExtra;
				
				saveDownloadDataToNativeStorage(key.userId, key.fun, key.method, key.extra,msg,"id");
				
				bind_todo_case_list_to_page(msg);
			
				showHide();
			}
			else{
	            	showHide();
	            	errorHandler(msg.returnCode,msg.message);
	            }
		});//end $.getJSON
	}

	function load_todo_case_list_content_from_native_storage(value){
		
		var $todo_case_list = $("#todo_case_list_page .List");
		$todo_case_list.empty();
		
		if(value){
			showLoading();
			
			var msg = JSON.parse(value); 
			bind_todo_case_list_to_page(msg);	
					
			showHide();
			showMessage('当前网络处于离线状态，您正在查看缓存数据', '1500');
		}
		else{
			showMessage('当前网络处于离线状态，未读到缓存数据', '1500');
		}
		
	}
	
	function bind_todo_case_list_to_page(msg){
		
		var $todo_case_list = $("#todo_case_list_page .List");
		
		if(msg.data.length<=0){
   	     showHide();
//      	 showMessage('暂无数据','1500');
      	 return;
	  }

		//可催案件列表的初始化
		var $template = $("#todo_case_list_page .list-row-template");
		
		$.each(msg.data,function(i,n){

			var $item = $template.clone(true);
			$item.children(".ListRow").attr("contractId",n["contractId"]);
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
				$closeButton.attr("todoCaseId",n["id"]);
				$closeButton.attr("collectionCaseRecordId",n["collectionCaseRecordId"]);
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
							postData2.todoCaseId = $(this).attr("todoCaseId");
							postData2.collectionCaseRecordId = $(this).attr("collectionCaseRecordId");
					        showConfirm("请确认是否要关闭协办案件", function(){ 
							$.getJSON(basePath+"/app/TodoCaseList/closeCoSpon.xhtml"+callback, postData2,function(msg){
								if(msg.data == ConstDef.getConstant("RESULT_SUCESS")){
									showMessage("案件成功关闭！",1500);
									load_todo_case_list_content();
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
			
			
			$todo_case_list.append($item);
		});//end $.each
	}