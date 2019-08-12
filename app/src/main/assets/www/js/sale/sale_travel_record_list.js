var sale_travel_record_list_page = $('#sale_travel_record_list_page');
var sale_travel_record_list_myScroll;
/** ****************************sale_travel_record_list_page---begin************************************* */
sale_travel_record_list_page.live('pageinit', function(e, ui) { 
 	//定义分页用到的数据
	var wrapper = "sale_travel_record_list_wrapper";
	var up = "sale_travel_record_list_pullUp";
	var down = "sale_travel_record_list_pullDown";
	sale_travel_record_list_myScroll = createMyScroll(wrapper, up, down);
	
    
	//获取日期参数
	$(this).find("input[name='startDate']").val(getEndTime());
	$(this).find("input[name='endDate']").val(getEndTime());

	// 返回工作台
	sale_travel_record_list_page.find(".BackBtn").live("fastClick", function(event) {
		event.stopPropagation();
		//初始化分页
		currentPage = 1;
		hasData = true;
		back_page();
	});

	// 按日期搜索
	sale_travel_record_list_page.find(".chooseBtn").live("tap", function() {
		
		currentPage = 1;
		hasData = true;
		var page = $('#sale_travel_record_list_page');
		page.find(".List").empty();

		load_sale_travel_record_list_content(page);

	});

});

/** ****************************sale_travel_record_list_page---end************************************* */
sale_travel_record_list_page.live('pageshow', function(e, ui) {
	
	//判断当前 页面 如果非当前页面 就返回
	if(!beforePageShowCheck($(this))){
		return;
	}
	currentTemplatePage = "sale_travel_record_list_page";
	currentLoadActionName = "sale_travel_record_load_list_content";
	
	var page = $('#sale_travel_record_list_page');
	//初始化分页
	currentPage = 1;
	hasData = true;
	page.find(".List").empty();
	load_sale_travel_record_list_content(page);
	
});

function sale_travel_record_load_list_content(){
	var page = $('#sale_travel_record_list_page');
	if(hasData){
		//如果还有数据则加载
		load_sale_travel_record_list_content(page);
	}
	
}
function load_sale_travel_record_list_content(page) {
	// 清空数据
	//page.find(".List").empty();
	showLoading();
	
	//设置分页开始结束位置
	var authData = {};
	setScroll(authData);
	authData.random = Math.random();
	authData.businessType = ConstDef.getConstant("BUSINESS_CATEGORY_SALE");
	authData.userCode =session.get("userCode");
//	authData.userId =session.get("userId");
	authData['startDate'] = page.find("input[name='startDate']").val();
	authData['endDate'] = page.find("input[name='endDate']").val();
	$.getJSON(basePath
			+ "/app/saleTravelRecordList/querySaleTravelRecordList.xhtml"
			+ callback, authData, function(msg) {
		if ($.trim(msg.returnCode) == '0') {
			if (msg.data.length <= 0) {
				showHide();
				showMessage('暂无数据', '5000');
				return;
			}
			
			$.each(msg.data, function(i, n) {
				var $sale_travel_record_list_item = $("#sale_travel_record_list_page .list-row-template ul li").clone(true);

				$sale_travel_record_list_item.attr("travelRecordId", n["id"]);

				//用于返回该页面时计算选项的index
				$sale_travel_record_list_item.attr("scrollCurrentPage",currentPage);
				$sale_travel_record_list_item.attr("scrollCurrentElementNum",i);
				
				$sale_travel_record_list_item.bind("tap", function() {
					session.set("travelRecordId", $(this).attr("travelRecordId"));
					session.set("page_keyword","行车记录列表");
					session.set("page_title","行车记录列表");
					session.set("page_from","sale_travel_record_list_page");			
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
					scrollMap.sale_travel_record_list_page = JSON.stringify(scrollMapJSON);
					
					goto_page("sale_travel_record_details_page");
				});

				$sale_travel_record_list_item.find("[identity='taskType']").text(n["businessExtf1"]);
				$sale_travel_record_list_item.find("[identity='saleDealer']").text(n["businessExtf2"]);
				
				dataBindToElement($sale_travel_record_list_item,n);
				
				$("#sale_travel_record_list_page ul.List").append($sale_travel_record_list_item);
			});
			
			showHide();
			
			//判断该列表是否已无数据
			if (!hasPage(msg.data.length)) {
				hasData = false;
				//无数据时结束分页滚动
				endScroll(sale_travel_record_list_myScroll);
			}
			
			var fromPage = session.get("fromPage");
			session.remove("fromPage")
			if (fromPage == "sale_travel_record_details_page") {
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
				var scrollCurrentElement = $("#sale_travel_record_list_page ul.List").find('.ListRow').get(scrollCurrentElementIndex-1);
				sale_travel_record_list_myScroll.refresh();//刷新iScroll
				sale_travel_record_list_myScroll.scrollToElement(scrollCurrentElement,0);
			}
//			if (msg.data.length <= 0) {
//				showHide();
////				showMessage('暂无数据', '5000');
//				hasData = false;
//            	//无数据时结束分页滚动
//        		endScroll(sale_travel_record_list_myScroll);
//			}
		
		} else {
			showHide();
			errorHandler(msg.returnCode, msg.message);
			hasData = false;
        	//无数据时结束分页滚动
    		endScroll(sale_travel_record_list_myScroll);
		}
       
	});

}
