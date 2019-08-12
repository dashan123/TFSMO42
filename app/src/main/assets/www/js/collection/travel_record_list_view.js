var travel_record_list_view_page = $('#travel_record_list_view_page');
var travel_record_list_view_myScroll;
/** ****************************travel_record_list_view_page---begin************************************* */
travel_record_list_view_page.live('pageinit', function(e, ui) { 
 	//定义分页用到的数据
	var wrapper = "travel_record_list_view_wrapper";
	var up = "travel_record_list_view_pullUp";
	var down = "travel_record_list_view_pullDown";
	travel_record_list_view_myScroll = createMyScroll(wrapper, up, down);
	
    
	//获取日期参数
//	$("#travel_record_list_view_page #startDate").val(getYesterdayDate());
//	$("#travel_record_list_view_page #endDate").val(getYesterdayDate());

	// 返回工作台
	travel_record_list_view_page.find(".BackBtn").live("fastClick", function(event) {
		event.stopPropagation();
		//初始化分页
		currentPage = 1;
		hasData = true;
		back_page();
	});

	// 按日期搜索
//	travel_record_list_view_page.find(".chooseBtn").live("tap", function() {
//		
//		currentPage = 1;
//		hasData = true;
//		var page = $('#travel_record_list_view_page');
//		page.find(".List").empty();
//
//		load_travel_record_list_view_content(page);
//
//	});

});

/** ****************************travel_record_list_view_page---end************************************* */
travel_record_list_view_page.live('pageshow', function(e, ui) {
	
	currentLoadActionName = "travel_record_list_view_load_content";
	//判断当前 页面 如果非当前页面 就返回
	if(!beforePageShowCheck($(this))){
		return;
	}
	currentTemplatePage = "travel_record_list_view_page";
	var fromPage = session.get("fromPage");
	//如果前页面是workbench,则进入页面后重新加载数据
//	if (fromPage == "travel_record_employee_list_page") {
//		var page = $('#travel_record_list_view_page');
//		page.find(".List").empty();
//	}
//	//如果前页面是从travel_record_details_page页面返回,则不重新加载数据
//	if (fromPage != "travel_record_details_view_page") {
//		travel_record_load_list_content();
//	}
});

function travel_record_list_view_load_content(){
	var page = $('#travel_record_list_view_page');
	if(hasData){
		//如果还有数据则加载
		load_travel_record_list_view_content(page);
	}
	
}
function load_travel_record_list_view_content(page) {
	// 清空数据
	//page.find(".List").empty();
	showLoading();
	
	//设置分页开始结束位置
	var authData = {};
	//authData.uitcode = session.get("uitcode");
	authData.userCode =session.get("employeeCode");
	// authData.GNType = encodeURIComponent(keyword); //中文
	authData.random = Math.random();
	setScroll(authData);
	session.set("beginDate",beginDate);
	session.set("endDate",endDate);
	authData['startDate'] = session.get("beginDate");
	authData['endDate'] = session.get("endDate");

	$.getJSON(basePath
			+ "/app/travelLingListView/queryTravelingRecordList.xhtml"
			+ callback, authData, function(msg) {
		if ($.trim(msg.returnCode) == '0') {
			$.each(msg.data, function(i, n) {
				var $travel_record_list_view_item = $("#travel_record_list_view_page .list-row-template ul li").clone(true);

				$travel_record_list_view_item.find("[identity='customerName']")
						.text(n["customer_name"]);
				$travel_record_list_view_item.find("[identity='contractNumber']")
						.text(n["contract_number"]);
				$travel_record_list_view_item.find("[identity='departureDatetime']")
						.text(n["departure_datetime"]);
				$travel_record_list_view_item.find("[identity='arrivalDatetime']")
						.text(n["arrival_datetime"]);
				$travel_record_list_view_item.find("[identity='arrivalAddress']")
						.text(n["arrival_address"]);
				$travel_record_list_view_item.find("[identity='Mileage']")
						.text(n["Mileage"]);

				$travel_record_list_view_item.attr("travelRecordId", n["id"]);
				$travel_record_list_view_item.attr("businessType", n["businessType"]);

				$travel_record_list_view_item.bind("tap", function() {
					session.set("travelRecordId", $(this).attr("travelRecordId"));
					session.set("customerName", $(this).find("[identity='customerName']").text());
					session.set("contractNumber", $(this).find("[identity='contractNumber']").text());
					session.set("businessType", $(this).attr("businessType"));
				//	alert(session.get("travelRecordId"));
					session.set("page_keyword","行车记录列表");
					session.set("page_title","行车记录列表");
					session.set("page_from","travel_record_list_view_page");
					goto_page("travel_record_details_page");
				});

				$("#travel_record_list_view_page ul.List").append($travel_record_list_view_item);
			});
			     showHide();
			//判断该列表是否已无数据
			if (!hasPage(msg.data.length)) {
				hasData = false;
				//无数据时结束分页滚动
				endScroll(travel_record_myScroll);
			}
			if (msg.data.length <= 0) {
				showHide();
//				showMessage('暂无数据', '1500');
				hasData = false;
            	//无数据时结束分页滚动
        		endScroll(travel_record_myScroll);
			}
		} else {
			showHide();
			errorHandler(msg.returnCode, msg.message);
			hasData = false;
        	//无数据时结束分页滚动
    		endScroll(travel_record_myScroll);
		}
       
	});

}
