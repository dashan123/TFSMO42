var collection_record_list_page = $('#collection_record_list_page');
var collection_record_list_myScroll;
/******************************home_page---begin**************************************/	   
collection_record_list_page.live('pageinit',function(e, ui){

	//定义分页用到的数据
	var wrapper = "collection_record_list_wrapper";
	var up = "collection_record_list_pullUp";
	var down = "collection_record_list_pullDown";
	collection_record_list_myScroll = createMyScroll(wrapper, up, down);
	
	
	//回退事件处理
	collection_record_list_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		//初始化分页
		currentPage = 1;
		hasData = true;
		
		//回退到工作台
		back_page('workbench_page');
	});
	
	// 初始化查询起止日期
	$(this).find("input[name='startDate']").val(GetDateStr(0));
	$(this).find("input[name='endDate']").val(GetDateStr(0));
	
	//已催记录列表项目点击事件
	collection_record_list_page.find(".ListRow").live("tap",function(){
		session.set("page_keyword","已催记录列表");
		session.set("page_title","已催记录列表");
		session.set("page_from","collection_record_list_page");
		
		session.set("collectionRecordId",$(this).find("[identity='id']").text());
		
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
		scrollMap.collection_record_list_page = JSON.stringify(scrollMapJSON);
		//业务类型：1催收 2诉讼
		var businessFlag = $(this).attr("businessFlag");
		if(businessFlag == '1'){
			goto_page("collection_record_details_page");
		}else{
			//内部案件号
			var caseId = $(this).attr("caseId")
			//内部合同号
			var contractId = $(this).attr("contractId")
			session.set("caseId",caseId);
			session.set("contractId",contractId);
			goto_page("litigation_task_handle_page");
		}
		
	});
	
	
	// 按日期搜索
	collection_record_list_page.find(".chooseBtn").live("tap", function() {
		//初始化分页
		currentPage = 1;
		hasData = true;
		var page = $('#collection_record_list_page');
		page.find(".List").empty();

		load_collection_record_list_content(page);

	});
	
		
});
/******************************home_page---end**************************************/
collection_record_list_page.live('pageshow',function(e, ui){
	
	currentLoadActionName = "collection_record_list_load_content";
	//判断当前 页面 如果非当前页面 就返回
	if(!beforePageShowCheck($(this))){
		return;
	}
	currentTemplatePage = "collection_record_list_page";
  
	var fromPage = session.get("fromPage");
	
	//如果不是从详情页面进入，则重新加载数据
	if (fromPage != "collection_record_details_page") {
		//初始化分页
		currentPage = 1;
		hasData = true;
		var page = $('#collection_record_list_page');
		page.find(".List").empty();

		load_collection_record_list_content(page);
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
		var scrollCurrentElement = $('#collection_record_list_page').find('.ListRow').get(scrollCurrentElementIndex);
		collection_record_list_myScroll.refresh();//刷新iScroll
		collection_record_list_myScroll.scrollToElement(scrollCurrentElement,0);
	}
	
	
	
	//如果前页面是workbench,则进入页面后重新加载数据
//	if (fromPage == "workbench_page") {
//		var page = $('#collection_record_list_page');
//		page.find(".List").empty();
//	}
	//如果前页面是从collection_record_list_page页面返回,则不重新加载数据
//	if (fromPage != "collection_record_details_page") {
//		//加载数据
//		collection_record_list_load_content();
//	}
	  
//	  load_collection_record_list_content();
});

function collection_record_list_load_content (){

	var page = $('#collection_record_list_page');
  	
	if (hasData) {
		//如果还有数据则加载
		load_collection_record_list_content(page);
	}
}

//加载已催记录列表，并显示
function load_collection_record_list_content(page){
	var page = $('#collection_record_list_page');

	var collection_record_list = $("#collection_record_list_page .List");

	showLoading();
	
	var postData = {};
    postData.random = Math.random();
	setScroll(postData);//设置分页开始结束位置
	postData.userId = session.get("userId");
    postData.userCode = session.get("userCode");
    postData.startDate=page.find("input[name='startDate']").val();
    postData.endDate=page.find("input[name='endDate']").val();
    
	$.getJSON(basePath+"/app/collectionRecordList/pageInit.xhtml"+callback, postData,function(msg){
		if($.trim(msg.returnCode) == '0'){
		    if(msg.data !=null && msg.data.length>0){
		    	
		    	//已催记录列表的初始化
				var $template = $("#collection_record_list_page .list-row-template");
				
				$.each(msg.data,function(i,n){

					var $item = $template.clone(true);
					
					dataBindToElement($item,n);
					//用于返回该页面时计算选项的index
					$item.find(".ListRow").attr("scrollCurrentPage",currentPage);
					$item.find(".ListRow").attr("scrollCurrentElementNum",i);
					//业务类型：1催收 2诉讼
					$item.find(".ListRow").attr("businessFlag",n.businessFlag);
					//内部案件号
					$item.find(".ListRow").attr("caseId",n.caseId);
					//内部合同号
					$item.find(".ListRow").attr("contractId",n.contractId);
					$item.removeClass("list-row-template");
					$item.show();
					
					
					collection_record_list.append($item);
				});//end $.each
			
            	//判断该列表是否已无数据
            	if (!hasPage(msg.data.length)) {
            		hasData = false;
            		//无数据时结束分页滚动
            		endScroll(collection_record_list_myScroll);
            	}
            	showHide();
		    } else {
		    	showHide();
//            	showMessage('暂无数据','1500');	
            	hasData = false;
            	//无数据时结束分页滚动
        		endScroll(collection_record_list_myScroll);
		    }
	    	}else{
	    	showHide();
	    	errorHandler(msg.returnCode,msg.message);
	    }
		
	});//end $.getJSON
}