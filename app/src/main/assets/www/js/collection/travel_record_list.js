var travel_record_list_page = $('#travel_record_list_page');
var travel_record_list_myScroll;
/** ****************************travel_record_list_page---begin************************************* */
travel_record_list_page.live('pageinit', function(e, ui) { 
 	//定义分页用到的数据
	var wrapper = "travel_record_list_wrapper";
	var up = "travel_record_list_pullUp";
	var down = "travel_record_list_pullDown";
	travel_record_list_myScroll = createMyScroll(wrapper, up, down);
	
    
	//获取日期参数
//	$(this).find("input[name='startDate']").val(getYesterdayDate());
//	$(this).find("input[name='endDate']").val(getYesterdayDate());
	$(this).find("input[name='startDate']").val(getEndTime());
	$(this).find("input[name='endDate']").val(getEndTime());

	// 返回工作台
	travel_record_list_page.find(".BackBtn").live("fastClick", function(event) {
		event.stopPropagation();
		//初始化分页
		currentPage = 1;
		hasData = true;
		back_page();
	});

	// 按日期搜索
	travel_record_list_page.find(".chooseBtn").live("tap", function() {
		
		currentPage = 1;
		hasData = true;
		var page = $('#travel_record_list_page');
		page.find(".List").empty();

		load_travel_record_list_content(page);

	});

});

/** ****************************travel_record_list_page---end************************************* */
travel_record_list_page.live('pageshow', function(e, ui) {
	
	//判断当前 页面 如果非当前页面 就返回
	if(!beforePageShowCheck($(this))){
		return;
	}
	currentTemplatePage = "travel_record_list_page";
	currentLoadActionName = "travel_record_load_list_content";
	var fromPage = session.get("fromPage");
	//如果前页面是workbench,则进入页面后重新加载数据
	if (fromPage == "workbench_page") {
		var page = $('#travel_record_list_page');
		page.find(".List").empty();
	}
	//如果前页面是从travel_record_details_page页面返回,则不重新加载数据
	if (fromPage != "travel_record_details_page") {
		travel_record_load_list_content();
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
		var scrollCurrentElement = $('#travel_record_list_page').find('.ListRow').get(scrollCurrentElementIndex);
		travel_record_list_myScroll.refresh();//刷新iScroll
		travel_record_list_myScroll.scrollToElement(scrollCurrentElement,0);
	}
});

function travel_record_load_list_content(){
	var page = $('#travel_record_list_page');
	if(hasData){
		//如果还有数据则加载
		load_travel_record_list_content(page);
	}
	
}
function load_travel_record_list_content(page) {
	// 清空数据
	//page.find(".List").empty();
	showLoading();
	
	//设置分页开始结束位置
	var authData = {};
	//authData.uitcode = session.get("uitcode");
	authData.userCode =session.get("userCode");
	// authData.GNType = encodeURIComponent(keyword); //中文
	authData.random = Math.random();
	setScroll(authData);
	authData['startDate'] = page.find("input[name='startDate']").val();
	authData['endDate'] = page.find("input[name='endDate']").val();
//    authData.currentPage=1;
//    authData.page_size=10;
	$.getJSON(basePath
			+ "/app/travelLingList/queryTravelingRecordList.xhtml"
			+ callback, authData, function(msg) {
		if ($.trim(msg.returnCode) == '0') {
			$.each(msg.data, function(i, n) {
				var $travel_record_list_item = $("#travel_record_list_page .list-row-template ul li").clone(true);

				$travel_record_list_item.find("[identity='customerName']")
						.text(n["customer_name"]);
				$travel_record_list_item.find("[identity='contractNumber']")
						.text(n["contract_number"]);
//				if(n["departure_date"] != undefined || n["departure_datetime"] != undefined){
//					var departure_datetime = n["departure_date"]+" "+n["departure_datetime"];
//					$travel_record_list_item.find("[identity='departureDatetime']").text(departure_datetime);
					$travel_record_list_item.find("[identity='departureDatetime']").text(n["departure_date"]);
//				}
				
//				if(n["arrival_date"] != undefined || n["arrival_datetime"] != undefined){
//					var arrival_datetime = n["arrival_date"]+" "+n["arrival_datetime"];
//					$travel_record_list_item.find("[identity='arrivalDatetime']").text(arrival_datetime);
					$travel_record_list_item.find("[identity='arrivalDatetime']").text(n["arrival_date"]);
//				}
				
				$travel_record_list_item.find("[identity='arrivalAddress']")
						.text(n["arrival_address"]);
				$travel_record_list_item.find("[identity='Mileage']")
					.text(n["Mileage"]);

				$travel_record_list_item.attr("travelRecordId", n["id"]);
				$travel_record_list_item.attr("businessType", n["businessType"]);

				//用于返回该页面时计算选项的index
				$travel_record_list_item.attr("scrollCurrentPage",currentPage);
				$travel_record_list_item.attr("scrollCurrentElementNum",i);
				
				$travel_record_list_item.bind("tap", function() {
					session.set("travelRecordId", $(this).attr("travelRecordId"));
					session.set("customerName", $(this).find("[identity='customerName']").text());
					session.set("contractNumber", $(this).find("[identity='contractNumber']").text());
					session.set("businessType", $(this).attr("businessType"));
				//	alert(session.get("travelRecordId"));
					session.set("page_keyword","行车记录列表");
					session.set("page_title","行车记录列表");
					session.set("page_from","travel_record_list_page");
					
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
					scrollMap.travel_record_list_page = JSON.stringify(scrollMapJSON);
					
					goto_page("travel_record_details_page");
				});

				$("#travel_record_list_page ul.List").append($travel_record_list_item);
			});
			     showHide();
			//判断该列表是否已无数据
			if (!hasPage(msg.data.length)) {
				hasData = false;
				//无数据时结束分页滚动
				endScroll(travel_record_list_myScroll);
			}
			if (msg.data.length <= 0) {
				showHide();
//				showMessage('暂无数据', '1500');
				hasData = false;
            	//无数据时结束分页滚动
        		endScroll(travel_record_list_myScroll);
			}
		} else {
			showHide();
			errorHandler(msg.returnCode, msg.message);
			hasData = false;
        	//无数据时结束分页滚动
    		endScroll(travel_record_list_myScroll);
		}
       
	});

}
