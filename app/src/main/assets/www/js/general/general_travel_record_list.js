var general_travel_record_list_page = $('#general_travel_record_list_page');
var general_travel_record_list_myScroll;
/** ****************************general_travel_record_list_page---begin************************************* */
general_travel_record_list_page.live('pageinit', function(e, ui) { 
 	//定义分页用到的数据
	var wrapper = "general_travel_record_list_wrapper";
	var up = "general_travel_record_list_pullUp";
	var down = "general_travel_record_list_pullDown";
	general_travel_record_list_myScroll = createMyScroll(wrapper, up, down);
	
    
	//获取日期参数
	$(this).find("input[name='startDate']").val(getEndTime());
	$(this).find("input[name='endDate']").val(getEndTime());

	// 返回工作台
	general_travel_record_list_page.find(".BackBtn").live("fastClick", function(event) {
		event.stopPropagation();
		//初始化分页
		currentPage = 1;
		hasData = true;
		back_page();
	});

	// 按日期搜索
	general_travel_record_list_page.find(".chooseBtn").live("tap", function() {
		
		currentPage = 1;
		hasData = true;
		var page = $('#general_travel_record_list_page');
		page.find(".List").empty();

		load_general_travel_record_list_content(page);

	});

});

/** ****************************general_travel_record_list_page---end************************************* */
general_travel_record_list_page.live('pageshow', function(e, ui) {
	
	//判断当前 页面 如果非当前页面 就返回
	if(!beforePageShowCheck($(this))){
		return;
	}
	currentTemplatePage = "general_travel_record_list_page";
	currentLoadActionName = "general_travel_record_load_list_content";
	var fromPage = session.get("fromPage");
	//如果前页面是workbench,则进入页面后重新加载数据
	if (fromPage == "workbench_page") {
		var page = $('#general_travel_record_list_page');
		page.find(".List").empty();
	}
	//如果前页面是从travel_record_details_page页面返回,则不重新加载数据
	if (fromPage != "general_travel_record_details_page") {
		general_travel_record_load_list_content();
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
		var scrollCurrentElement = $('#general_travel_record_list_page').find('.ListRow').get(scrollCurrentElementIndex);
		general_travel_record_list_myScroll.refresh();//刷新iScroll
		general_travel_record_list_myScroll.scrollToElement(scrollCurrentElement,0);
	}
});

function general_travel_record_load_list_content(){
	var page = $('#general_travel_record_list_page');
	if(hasData){
		//如果还有数据则加载
		load_general_travel_record_list_content(page);
	}
	
}
function load_general_travel_record_list_content(page) {
	// 清空数据
	//page.find(".List").empty();
	showLoading();
	
	//设置分页开始结束位置
	var authData = {};
	setScroll(authData);
	authData.random = Math.random();
	authData.addressTypeReturnhome = ConstDef.getConstant("ADDRESS_TYPE_RETURNHOME");
//	authData.addressTypeHomevisits = ConstDef.getConstant("ADDRESS_TYPE_HOMEVISITS");
	authData.addressTypeInventory = ConstDef.getConstant("ADDRESS_TYPE_INVENTORY");
//	authData.addressTypeColletion = ConstDef.getConstant("ADDRESS_TYPE_COLLECTION");
	authData.userCode =session.get("userCode");
//	authData.userId =session.get("userId");
	authData['startDate'] = page.find("input[name='startDate']").val();
	authData['endDate'] = page.find("input[name='endDate']").val();
	$.getJSON(basePath
			+ "/app/generalTravelRecordList/queryGeneralTravelRecordList.xhtml"
			+ callback, authData, function(msg) {
		if ($.trim(msg.returnCode) == '0') {
			$.each(msg.data, function(i, n) {
				var $general_travel_record_list_item = $("#general_travel_record_list_page .list-row-template ul li").clone(true);

//				$general_travel_record_list_item.find("[identity='workobjectName']")
//						.text(n["workobject_name"]);
				/*$general_travel_record_list_item.find("[identity='contractNumber']")
						.text(n["contract_number"]);*/
				if(n["address_type"] == ConstDef.getConstant("ADDRESS_TYPE_RETURNHOME")){
					$general_travel_record_list_item.find("[identity='addressType']")
							.text("返程");
				}else if(n["address_type"] == ConstDef.getConstant("ADDRESS_TYPE_COLLECTION")){
					$general_travel_record_list_item.find("[identity='addressType']")
							.text("催收");
				}else if(n["address_type"] == ConstDef.getConstant("ADDRESS_TYPE_HOMEVISITS")){
					$general_travel_record_list_item.find("[identity='addressType']")
							.text("家访");
				}else if(n["address_type"] == ConstDef.getConstant("ADDRESS_TYPE_INVENTORY")){
//					$general_travel_record_list_item.find("[identity='addressType']")
//							.text("盘库");
					$general_travel_record_list_item.find("[identity='addressType']").text(n["business_extf1"]);
				}else{
					$general_travel_record_list_item.find("[identity='addressType']")
							.text("");
				}
				
				$general_travel_record_list_item.find("[identity='departureDatetime']")
						.text(n["departure_datetime"]);
				$general_travel_record_list_item.find("[identity='arrivalDatetime']")
						.text(n["arrival_datetime"]);
				$general_travel_record_list_item.find("[identity='arrivalAddress']")
						.text(n["arrival_address"]);
				$general_travel_record_list_item.find("[identity='mileage']")
						.text(n["Mileage"]);
				$general_travel_record_list_item.attr("travelRecordId", n["id"]);

				//用于返回该页面时计算选项的index
				$general_travel_record_list_item.attr("scrollCurrentPage",currentPage);
				$general_travel_record_list_item.attr("scrollCurrentElementNum",i);
				
				$general_travel_record_list_item.bind("tap", function() {
					session.set("travelRecordId", $(this).attr("travelRecordId"));
					session.set("page_keyword","行车记录列表");
					session.set("page_title","行车记录列表");
					session.set("page_from","general_travel_record_list_page");			
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
					scrollMap.common_travel_record_list_page = JSON.stringify(scrollMapJSON);
					
					goto_page("general_travel_record_details_page");
				});

				$("#general_travel_record_list_page ul.List").append($general_travel_record_list_item);
			});
			
			showHide();
			//判断该列表是否已无数据
			if (!hasPage(msg.data.length)) {
				hasData = false;
				//无数据时结束分页滚动
				endScroll(general_travel_record_list_myScroll);
			}
			if (msg.data.length <= 0) {
				showHide();
//				showMessage('暂无数据', '1500');
				hasData = false;
            	//无数据时结束分页滚动
        		endScroll(general_travel_record_list_myScroll);
			}
		} else {
			showHide();
			errorHandler(msg.returnCode, msg.message);
			hasData = false;
        	//无数据时结束分页滚动
    		endScroll(general_travel_record_list_myScroll);
		}
       
	});

}
