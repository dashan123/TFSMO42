var todo_case_list_view_page = $('#todo_case_list_view_page');
var todo_case_list_view_myScroll;
/******************************todo_case_list_view_page---begin**************************************/	   
todo_case_list_view_page.live('pageinit',function(e, ui){
	
	var wrapper = "todo_case_list_view_wrapper";
    var up = "todo_case_list_view_pullUp";
    var down = "todo_case_list_view_pullDown";
	todo_case_list_view_myScroll = createMyScroll(wrapper,up,down);
	
	todo_case_list_view_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page();
	});
	// 隐藏遮罩层
	$("#todo_case_list_view_page #todo_case_list_view_tirebox").hide();
	//条件初始化
	$("#todo_case_list_view_page .topBar").find("span:first").text("全部");
	$("#todo_case_list_view_page .topBar").find("span:first").attr("code","1");
	//可催案件列表项目点击事件
	todo_case_list_view_page.find(".ListRow").live("tap",function(){
		session.set("page_keyword","可催案件列表");
		session.set("page_title","可催案件列表");
		session.set("page_from","todo_case_list_view_page");
		
		//申请号
		var requestCode = $(this).attr("requestCode");
		session.set("requestCode",requestCode);
		//内部合同号
		var contractId = $(this).attr("contractId");
		session.set("contractId",contractId);
		//可催案件ID
		var caseDetailsIdid = $(this).attr("id");
		session.set("caseDetailsId",caseDetailsIdid);
		session.set("todoCaseId",caseDetailsIdid);
		 //内部案件号
		var caseId = $(this).attr("caseId")
		session.set("caseId",caseId);
		
		var lastPhoneTime = $(this).find("[identity='lastCaseCollectionTimeJqwgj']").text();
		var lastIndeedTime = $(this).find("[identity='lastCaseCollectionTimeJqwsd']").text();
		 var lasttime= "";
         if(lastPhoneTime >= lastIndeedTime){
         lasttime = lastPhoneTime;
         }else{
         lasttime = lastIndeedTime;
         }
        session.set("lasttime112211",lasttime);
        
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
		scrollMap.todo_case_list_view_page = JSON.stringify(scrollMapJSON);
		
		//业务类型：1催收 2诉讼
		var businessFlag = $(this).attr("businessFlag");
		if(businessFlag == '1'){
			goto_page("collection_case_details_view_page");
		}else{
			goto_page("litigation_task_handle_view_page");
		}
	});
	
	//获得“近期”的设置
	var postData = {};
    postData.random = Math.random();
    postData.userId = session.get("userId");
    postData.userCode = session.get("userCode");
   
	$.getJSON(basePath+"/app/TodoCaseListView/getRecentDaysSetting.xhtml"+callback, postData,function(msg){
		if($.trim(msg.returnCode) == '0'){
			
			//近期未电话的近期标准显示
			var recentDaysJqwdh = msg.data.recentDaysJqwdh;
			if(recentDaysJqwdh){
				if(recentDaysJqwdh.length > 0){
//					$template.find("[identity='RECENTLY_DAYS_JQWDH']").text(recentDaysJqwdh[0]["code"]+"日内");
					todo_case_list_recentDaysJqwdh = recentDaysJqwdh[0]["code"];
				}
			}
			
			
			//近期未电话的近期标准显示
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
	todo_case_list_view_page.find(".topBar").live("tap",function() {
		//下箭头变上箭头
		var $arrow = $(this).find("span:last");
		$arrow.removeClass("allBtn_down");
		$arrow.addClass("allBtn_up");
		// 显示遮罩层
		$("#todo_case_list_view_page #todo_case_list_view_tirebox").show();

		// 取消遮罩层
		$("#todo_case_list_view_page #todo_case_list_view_tirebox .Cancel").live("tap",function() {
			$("#todo_case_list_view_page #todo_case_list_view_tirebox").hide();
			$arrow.removeClass("allBtn_up");
			$arrow.addClass("allBtn_down");
		});

	});
		
});
/******************************home_page---end**************************************/
todo_case_list_view_page.live('pageshow',function(e, ui){
	
	currentLoadActionName = "todo_case_list_view_load_content"
	
	var $todoCaseList = $("#todo_case_list_view_page #todo_case_list_view_list");
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
	$todoCaseListItem.text("催收协办");
	$todoCaseList.append($todoCaseListItem);
	
	$todoCaseListItem = $("<li code='6'></li>");
	$todoCaseListItem.text(todo_case_list_recentDaysJqwdh+"日内未电话");
	$todoCaseList.append($todoCaseListItem);
	
	$todoCaseListItem = $("<li code='7'></li>");
	$todoCaseListItem.text(todo_case_list_recentDaysJqwsd+"日内未实地");
	$todoCaseList.append($todoCaseListItem);
	
	$todoCaseListItem = $("<li code='8'></li>");
	$todoCaseListItem.text("诉讼");
	$todoCaseList.append($todoCaseListItem);
	
	//点击弹层列表项进行选择
	var $todoCaseListItem = $todoCaseList.find("li");
	$todoCaseListItem.bind("tap",function(){
		
		var $caseClassification_condition = $("#todo_case_list_view_page .topBar").find("span:first");
		$caseClassification_condition.text($(this).text());
		$caseClassification_condition.attr("code",$(this).attr("code"));
		$("#todo_case_list_view_tirebox").hide();
		//下箭头变上箭头
		var $caseClassificationElement = $("#todo_case_list_view_page .topBar");
		var $arrow = $caseClassificationElement.children("span:last");
		$arrow.removeClass("allBtn_up");
		$arrow.addClass("allBtn_down");
		load_todo_case_list_view_content();
			
	});	
		
	var fromPage = session.get("fromPage");
	 if(fromPage != "collection_case_details_view_page"){
		  load_todo_case_list_view_content();
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
			var scrollCurrentElement = $('#todo_case_list_view_page').find('.ListRow').get(scrollCurrentElementIndex);
			todo_case_list_view_myScroll.refresh();//刷新iScroll
			todo_case_list_view_myScroll.scrollToElement(scrollCurrentElement,0);
	 }

});

function todo_case_list_view_load_content(){
	
}

//加载可催案件列表，并显示
function load_todo_case_list_view_content(){
	
	var $todo_case_list_view = $("#todo_case_list_view_page .List");
	$todo_case_list_view.empty();
	
	showLoading();
	var postData = {};
    postData.random = Math.random();
    postData.userCode = session.get("userCode");
    postData.employeeId = session.get("employeeId");
    postData.userId = session.get("userId");
    postData.userCode = session.get("userCode");
    var caseClassification = $("#todo_case_list_view_page .topBar").find("span:first").attr("code");
    postData.caseClassification = caseClassification;
    
	$.getJSON(basePath+"/app/TodoCaseListView/pageInit.xhtml"+callback, postData,function(msg){
		if($.trim(msg.returnCode) == '0'){
			if(msg.data.length<=0){
	    	     showHide();
	    	     return;
			}
			
			//可催案件列表的初始化
			var $template = $("#todo_case_list_view_page .list-row-template");
			
			$.each(msg.data,function(i,n){

				var $item = $template.clone(true);
				//剩余本金 金额千分位格式化
				n.oddCorpus = fmoney(n.oddCorpus,2);
				//逾期总金额 金额千分位格式化
				n.overdueAmount = fmoney(n.overdueAmount,2);
					
				dataBindToElement($item,n);
				$item.find(".ListRow").attr("contractId",n.contractId)
				$item.find(".ListRow").attr("id",n.id);
				//业务类型：1催收 2诉讼
				$item.find(".ListRow").attr("businessFlag",n.businessFlag);
				//内部案件号
				$item.find(".ListRow").attr("caseId",n.caseId);
				
				//用于返回该页面时计算选项的index
				$item.find(".ListRow").attr("scrollCurrentPage",1);
				$item.find(".ListRow").attr("scrollCurrentElementNum",i);
				
                $item.removeClass("list-row-template");
				$item.show();
				
				$todo_case_list_view.append($item);
			});//end $.each
		
			showHide();
		}
		else{
        	showHide();
        	errorHandler(msg.returnCode,msg.message);
        }
		
	});//end $.getJSON
	
}
	
