/*************************general_travel_record_employee_list_page****************************/
var general_travel_record_employee_list_page = $('#general_travel_record_employee_list_page');
var general_travel_record_employee_list_myScroll;

/** ****************************home_page---begin************************************* */
general_travel_record_employee_list_page.live('pageinit', function(e, ui) {
	
	var wrapper = "general_travel_record_employee_list_wrapper";
	var up = "general_travel_record_employee_list_pullUp";
	var down = "general_travel_record_employee_list_pullDown";
	
	general_travel_record_employee_list_myScroll = createMyScroll(wrapper,up,down);
	
	
	// 回退按钮事件
	general_travel_record_employee_list_page.find(".BackBtn").live("tap",function(event) {
		event.stopPropagation();
		back_page("workbench_page");
	});

	// 初始化查询起止日期
	$(this).find("input[name='startDate']").val(getEndTime());
	$(this).find("input[name='endDate']").val(getEndTime());
	
	// 搜索按钮事件
	general_travel_record_employee_list_page.find(".queryButton").live("tap",function() {
		var $currentPage = $('#general_travel_record_employee_list_page');
		var beginDate = $currentPage.find("input[name='startDate']").val();
		var endDate = $currentPage.find("input[name='endDate']").val();
				
		if (!beginDate) {
			alert("请输入起始日期");
			return;
		}
		
		if (!endDate) {
			alert("请输入结束日期");
			return;
		}

		query_general_travel_record_employee_list_by_team(beginDate,endDate);
	});

});

general_travel_record_employee_list_page.live('pageshow', function(e, ui) {
	
	currentLoadActionName = "general_travel_record_employee_list_load_content";
	
	var fromPage = session.get("fromPage");
	
	// 如果前页面是 travel_record_list_view_page ,则进入页面后不重新加载数据
	if (fromPage == "general_travel_record_list_view_page") {
		
	}
	else{
		load_general_travel_record_employee_list_content();
	}
	
});

function general_travel_record_employee_list_load_content(){
	
}

// 加载详细，并显示
function load_general_travel_record_employee_list_content() {
	showLoading();
	//设定分区条件 初始值：全部 -ConstDef.getConstant('TEAM_ALL_CODE')
	var $currentPage = $("#general_travel_record_employee_list_page");
	
	var beginDate = $currentPage.find("input[name='startDate']").val();
	var endDate = $currentPage.find("input[name='endDate']").val();
	
	var postData = {};
	postData.random = new Date();
	postData.userId = session.get("userId");
	postData.userCode = session.get("userCode");
	postData.beginDate = beginDate;
	postData.endDate = endDate;
//	postData.orgId = session.get("orgId");
	
	$.getJSON(basePath+ "/app/generalTravelRecordEmployeeList/pageInit.xhtml"+ callback,postData,function(msg) {
		// 行车记录人员列表的初始化
		$currentPage.find(".List").empty();
		var $template = $("#general_travel_record_employee_list_page .list-row-template li");

		$.each(msg.data.employeeList,function(i, n) {

			var $item = $template.clone(true);

			$item.attr("userId", n["USER_ID"]);

			$item.attr("userCode", n["USER_CODE"]);
			n.COMMON_MILES_AMOUNT = Math.round((n.COMMON_MILES_AMOUNT/1000));
			
//			n.COMMON_FUEL_COSTS = fmoney(n.COMMON_FUEL_COSTS,2);
			n.COMMON_HIGHWAY_FEE = fmoney(n.COMMON_HIGHWAY_FEE,2);
			n.COMMON_PARKING_FEE = fmoney(n.COMMON_PARKING_FEE,2);
//			n.COMMON_OTHER_FEE = fmoney(n.COMMON_OTHER_FEE,2);
			
			dataBindToElement($item, n);
			$currentPage.find(".List").append($item);
		});// end $.each
		
		showHide();
	});// end $.getJSON
};

function query_general_travel_record_employee_list_by_team(beginDate,endDate) {
	showLoading();
	var postData = {};
	postData.random = new Date();
	postData.userId = session.get("userId");
	postData.userCode = session.get("userCode");
	postData.beginDate = beginDate;
	postData.endDate = endDate;
//	postData.orgId = session.get("orgId");
	// 根据选择的TEAM查询数据
	$.getJSON(basePath+ "/app/generalTravelRecordEmployeeList/queryGeneralEmployeeList.xhtml"
							+ callback,postData,function(msg) {
			var $currentPage = $("#general_travel_record_employee_list_page");

			if ($.trim(msg.returnCode) == '0') {

				if (msg.data.employeeList.length <= 0) {
					showHide();
					return;
				}

				// 在催地址人员列表的初始化
				$currentPage.find(".List").empty();
				var $template = $("#general_travel_record_employee_list_page .list-row-template li");

				$.each(msg.data.employeeList,function(i, n) {

						var $item = $template.clone(true);
						$item.attr("userId",n["USER_ID"]);
						$item.attr("userCode", n["USER_CODE"]);
						n.COMMON_MILES_AMOUNT = Math.round(n.COMMON_MILES_AMOUNT/1000);
						
//						n.COMMON_FUEL_COSTS = fmoney(n.COMMON_FUEL_COSTS,2);
						n.COMMON_HIGHWAY_FEE = fmoney(n.COMMON_HIGHWAY_FEE,2);
						n.COMMON_PARKING_FEE = fmoney(n.COMMON_PARKING_FEE,2);
//						n.COMMON_OTHER_FEE = fmoney(n.COMMON_OTHER_FEE,2);
						
						dataBindToElement($item, n);

						$currentPage.find(".List").append($item);
					});// end $.each
				showHide();
			}// end if($.trim(msg.returnCode) == '0')
			else{
				showHide();
				errorHandler(msg.returnCode,msg.message);
			}

		});
}       