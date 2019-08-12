/*********************************************************css_collection_record_list_page init begin*****************************************************************/	
var css_collection_record_list_page = $('#css_collection_record_list_page');
var css_collection_record_list_myScroll;
/******************************home_page---begin**************************************/	   
css_collection_record_list_page.live('pageinit',function(e, ui){
	
	//定义分页用到的数据
	var wrapper = "css_collection_record_list_wrapper";
	var up = "css_collection_record_list_pullUp";
	var down = "css_collection_record_list_pullDown";
	css_collection_record_list_myScroll = createMyScroll(wrapper, up, down);
	
	
	//案件催收列表列表点击事件
	css_collection_record_list_page.find(".ListRow").live("tap",function(){
		session.set("page_keyword","案件催记列表");
		session.set("page_title","案件催记列表");
		session.set("page_from","css_collection_record_list_page");
//		session.set("caseId",$(this).find("[identity='caseId']").text());
		var todoCase = JSON.parse(session.get("todoCase"));
		var css_collection_record = {};
		css_collection_record.customerName = todoCase.customerName;
		
		css_collection_record.contractNumber =  todoCase.contractNumber;
		css_collection_record.createDatetime = $(this).find("[identity='createDatetime']").text();
		css_collection_record.contactType = $(this).find("[identity='contactType']").text();
		css_collection_record.contactPerson = $(this).find("[identity='contactPerson']").text();
		css_collection_record.actionCodeComment = $(this).find("[identity='actionCodeComment']").text();
		css_collection_record.actionUser = $(this).find("[identity='actionUser']").text();
		css_collection_record.actionComment = $(this).find("[identity='actionComment']").text();
		session.set("cssCollectionRecord",JSON.stringify(css_collection_record));//在CSS催记详情页面使用该数据
//		session.remove("todoCase");
		
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
		scrollMap.css_collection_record_list_page = JSON.stringify(scrollMapJSON);
		
		goto_page("css_collection_record_details_page");
	});
	
	//添加催记
	css_collection_record_list_page.find(".AddressAddBtn").live('tap',function(){
		goto_page("css_collection_record_details_save_page");
	});
	

	//回退按钮事件
	css_collection_record_list_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		//初始化分页
		currentPage = 1;
		hasData = true;
		back_page();
	});
	

});
/******************************home_page---end**************************************/	 

css_collection_record_list_page.live('pageshow',function(e, ui){
	
	currentLoadActionName = "css_collection_record_list_load_content";
	
	//判断当前 页面 如果非当前页面 就返回
	if(!beforePageShowCheck($(this))){
		return;
	}
	currentTemplatePage = "css_collection_record_list_page";
  
	var fromPage = session.get("fromPage");
	if(fromPage == "collection_case_details_page"
		|| fromPage == "css_collection_record_details_save_page"
			|| fromPage == "css_collection_record_details_page"
				|| fromPage == "litigation_case_details_page"){
		
		var page_from = session.get("page_from");
		if(page_from == "todo_case_list_page"){
			
			session.set("businessFlag","1");//业务类型：1催收 2诉讼
			$('#css_collection_record_list_page').find(".AddressAddBtn").show();
		}else if(page_from == "litigation_todo_case_list_page"){
			
			session.set("businessFlag","2");//业务类型：1催收 2诉讼
			$('#css_collection_record_list_page').find(".AddressAddBtn").show();
		}
	}else{
		$('#css_collection_record_list_page').find(".AddressAddBtn").hide();
	}
	
	
	//如果不是从详情页面进入，则重新加载数据
	if (fromPage != "css_collection_record_details_page"
		&& fromPage != "css_collection_record_details_save_page" ) {
		//初始化分页
		currentPage = 1;
		hasData = true;
		var page = $('#css_collection_record_list_page');
		page.find(".List").empty();

		load_css_collection_record_list_content(page);
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
		var scrollCurrentElement = $('#css_collection_record_list_page').find('.ListRow').get(scrollCurrentElementIndex);
		css_collection_record_list_myScroll.refresh();//刷新iScroll
		css_collection_record_list_myScroll.scrollToElement(scrollCurrentElement,0);
	}
	
});

function css_collection_record_list_load_content (){

	var page = $('#css_collection_record_list_page');
  	
	if (hasData) {
		//如果还有数据则加载
		load_css_collection_record_list_content(page);
	}
}
//加载详细，并显示

function load_css_collection_record_list_content(page){
	
	var $list = $("#css_collection_record_list_page .List");
//	$list.empty();
	
	showLoading();
	
	var postData = {};
	postData.random = new Date();
	setScroll(postData);//设置分页开始结束位置
	postData.userCode = session.get("userCode");
	postData.caseId = session.get("caseId");
	$.getJSON(basePath+"/app/cssCollectionRecordList/pageInit.xhtml"+callback, postData,function(msg){
						if ($.trim(msg.returnCode) == '0') {

							if (msg.data != null && msg.data.length > 0) {

								var $template = $("#css_collection_record_list_page .list-row-template");
								$.each(msg.data, function(i, n) {

									var $item = $template.clone(true);
									//截取时间的日期
									n.createDatetime = n.createDatetime.substring(0,10);
									dataBindToElement($item, n);
									
									$item.find(".ListRow").attr("scrollCurrentPage",currentPage);
									$item.find(".ListRow").attr("scrollCurrentElementNum",i);
									
									$item.removeClass("list-row-template");
									$item.show();

									$list.append($item);
								});// end $.each

								// 判断该列表是否已无数据
								if (!hasPage(msg.data.length)) {
									hasData = false;
									// 无数据时结束分页滚动
									endScroll(css_collection_record_list_myScroll);
								}
								showHide();
							} else {
								showHide();
//								showMessage('暂无数据', '1500');
								hasData = false;
								// 无数据时结束分页滚动
								endScroll(css_collection_record_list_myScroll);
							}

						} else {
							showHide();
							errorHandler(msg.returnCode, msg.message);
						}
		
		
	});//end $.getJSON
	
	
}