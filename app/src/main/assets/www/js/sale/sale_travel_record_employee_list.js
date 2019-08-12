/*************************sale_travel_record_employee_list_page****************************/
var sale_travel_record_employee_list_page = $('#sale_travel_record_employee_list_page');
var sale_travel_record_employee_list_myScroll;

/** ****************************home_page---begin************************************* */
sale_travel_record_employee_list_page.live('pageinit', function(e, ui) {
	
	var wrapper = "sale_travel_record_employee_list_wrapper";
	var up = "sale_travel_record_employee_list_pullUp";
	var down = "sale_travel_record_employee_list_pullDown";
	
	sale_travel_record_employee_list_myScroll = createMyScroll(wrapper,up,down);
	
	
	// 回退按钮事件
	sale_travel_record_employee_list_page.find(".BackBtn").live("tap",function(event) {
		event.stopPropagation();
		back_page("workbench_page");
	});

	// 初始化查询起止日期
	$(this).find("input[name='startDate']").val(getEndTime());
	$(this).find("input[name='endDate']").val(getEndTime());
	
	// 搜索按钮事件
	sale_travel_record_employee_list_page.find(".queryButton").live("tap",function() {
		var $currentPage = $('#sale_travel_record_employee_list_page');
		var drmName = $currentPage.find("input[id='drmName']").val();
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

		query_sale_travel_record_employee_list_by_team(drmName,beginDate,endDate);
	});

});

sale_travel_record_employee_list_page.live('pageshow', function(e, ui) {
	
	currentLoadActionName = "sale_travel_record_employee_list_load_content";
	
	var fromPage = session.get("fromPage");
	
	// 如果前页面是 travel_record_list_view_page ,则进入页面后不重新加载数据
	if (fromPage == "sale_travel_record_list_view_page") {
		
	}
	else{
		load_sale_travel_record_employee_list_content();
	}
	
});

function sale_travel_record_employee_list_load_content(){
	
}

// 加载详细，并显示
function load_sale_travel_record_employee_list_content() {
	showLoading();
	var $currentPage = $("#sale_travel_record_employee_list_page");
	
	var beginDate = $currentPage.find("input[name='startDate']").val();
	var endDate = $currentPage.find("input[name='endDate']").val();
	
	var postData = {};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.beginDate = beginDate;
	postData.endDate = endDate;
//	postData.orgId = session.get("orgId");
	
	$.getJSON(basePath+ "/app/saleTravelRecordEmployeeList/pageInit.xhtml"+ callback,postData,function(msg) {
		if ($.trim(msg.returnCode) == '0') {
			// 行车记录人员列表的初始化
			$currentPage.find(".List").empty();
			var $template = $("#sale_travel_record_employee_list_page .list-row-template li");

			$.each(msg.data.employeeList,function(i, n) {

				var $item = $template.clone(true);

				$item.attr("userId", n["USER_ID"]);

				$item.attr("userCode", n["USER_CODE"]);
				n.COMMON_MILES_AMOUNT = Math.round(n.COMMON_MILES_AMOUNT);
				
				n.COMMON_HIGHWAY_FEE = fmoney(n.COMMON_HIGHWAY_FEE,2);
				n.COMMON_PARKING_FEE = fmoney(n.COMMON_PARKING_FEE,2);
				
				dataBindToElement($item, n);
				$currentPage.find(".List").append($item);
			});// end $.each
		}
		
		showHide();
	});// end $.getJSON
};

function query_sale_travel_record_employee_list_by_team(drmName,beginDate,endDate) {
	showLoading();
	var postData = {};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.drmName = drmName;
	postData.beginDate = beginDate;
	postData.endDate = endDate;
//	postData.orgId = session.get("orgId");
	// 根据选择的TEAM查询数据
	$.getJSON(basePath+ "/app/saleTravelRecordEmployeeList/querySaleEmployeeList.xhtml"
							+ callback,postData,function(msg) {
			var $currentPage = $("#sale_travel_record_employee_list_page");

			if ($.trim(msg.returnCode) == '0') {

				if (msg.data.employeeList.length <= 0) {
					showHide();
//					showMessage('暂无数据', '5000');
					return;
				}

				// 在催地址人员列表的初始化
				$currentPage.find(".List").empty();
				var $template = $("#sale_travel_record_employee_list_page .list-row-template li");

				$.each(msg.data.employeeList,function(i, n) {

						var $item = $template.clone(true);
						$item.attr("userId",n["USER_ID"]);
						$item.attr("userCode", n["USER_CODE"]);
						n.COMMON_MILES_AMOUNT = Math.round(n.COMMON_MILES_AMOUNT);
						
						n.COMMON_HIGHWAY_FEE = fmoney(n.COMMON_HIGHWAY_FEE,2);
						n.COMMON_PARKING_FEE = fmoney(n.COMMON_PARKING_FEE,2);
						
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