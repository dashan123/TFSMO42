/**
 * *******************************************************login init begin****************************************************************
 */
var collection_record_employee_list_page = $('#collection_record_employee_list_page');
var collectionRecordEmployeeListSpace = {};
var collection_record_employee_list_myScroll;
collectionRecordEmployeeListSpace.listTapHandler = function(e) {
	var page = $('#collection_record_employee_list_page');
	session.set("employeeId", e.data.attr("userId"));
	session.set("startDate", page.find("input[name='startDate']").val());
	session.set("endDate", page.find("input[name='endDate']").val());
	
	//设置当前选项的index到session中
	var scrollCurrentElementIndex = 0;
	var scrollCurrentElementNum = e.data.attr("scrollCurrentElementNum");
	var scrollCurrentPage = e.data.attr("scrollCurrentPage");
	var pageDisplayCount = session.get("pageDisplayCount");
	var pageAddCount = session.get("pageAddCount");
	if(scrollCurrentPage <= 1){
		   	scrollCurrentElementIndex = parseInt(scrollCurrentElementNum)+1;
    }else{
    	scrollCurrentElementIndex = parseInt(pageDisplayCount)+((parseInt(scrollCurrentPage)-2)*parseInt(pageAddCount))+parseInt(scrollCurrentElementNum)+1;
    }
	var scrollMapJSON = {};
	scrollMapJSON.scrollCurrentElementIndex = scrollCurrentElementIndex;
	scrollMap.collection_record_employee_list_page = JSON.stringify(scrollMapJSON);
	
	goto_page("collection_record_list_view_page");
}

/** ****************************home_page---begin************************************* */
collection_record_employee_list_page.live('pageinit', function(e, ui) {
	
	var wrapper = "collection_record_employee_list_wrapper";
	var up = "collection_record_employee_list_pullUp";
	var down = "collection_record_employee_list_pullDown";
	
	collection_record_employee_list_myScroll = createMyScroll(wrapper,up,down);
	
	
	// 回退按钮事件
	collection_record_employee_list_page.find(".BackBtn").live("tap",function(event) {
		event.stopPropagation();
		back_page("workbench_page");
	});

	// 初始化查询起止日期
	$(this).find("input[name='startDate']").val(GetDateStr(0));
	$(this).find("input[name='endDate']").val(GetDateStr(0));
	
	// 搜索按钮事件
	collection_record_employee_list_page.find(".queryButton").live("tap",function() {
		var $currentPage = $('#collection_record_employee_list_page');
		var $team_condition = $currentPage.find("[identity='team']");
		var teamCode = $team_condition.attr("code");
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

		query_collection_record_employee_list_by_team(teamCode,	beginDate, endDate);
	});

	// 获取分区弹层
	var $teamListTirebox = $("#collection_record_employee_all_tirebox");

	// 弹层隐藏
	$teamListTirebox.hide();

	// 点击分区显示列表弹层
	var $teamElement = $("#collection_record_employee_list_page .topBar");
	$teamElement.live("tap", function() {

		$teamListTirebox.show();
		// 下箭头变上箭头
		var $arrow = $(this).children("span:last");
		$arrow.removeClass("allBtn_down");
		$arrow.addClass("allBtn_up");
	});

	// 取消 弹层选择
	$teamListTirebox.find(".Cancel").live("tap", function() {
		$teamListTirebox.hide();
	});

});

collection_record_employee_list_page.live('pageshow', function(e, ui) {
	
	currentLoadActionName = "collection_record_employee_list_load_content";
	
	var fromPage = session.get("fromPage");
	
	// 如果前页面是 collection_record_list_view_page ,则进入页面后不重新加载数据
	if (fromPage == "collection_record_list_view_page") {
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
		var scrollCurrentElement = $('#collection_record_employee_list_page').find('.ListRow').get(scrollCurrentElementIndex);
		collection_record_employee_list_myScroll.refresh();//刷新iScroll
		collection_record_employee_list_myScroll.scrollToElement(scrollCurrentElement,0);
	}
	else{
		load_collection_record_employee_list_content();
	}
	
});

function collection_record_employee_list_load_content(){
	
}

// 加载详细，并显示
function load_collection_record_employee_list_content() {
	//设定分区条件 初始值：全部 -ConstDef.getConstant('TEAM_ALL_CODE')
	var $currentPage = $("#collection_record_employee_list_page");
	var $team_condition = $currentPage.find("[identity='team']");
	$team_condition.text("全部");
	$team_condition.attr("code",ConstDef.getConstant('TEAM_ALL_CODE'));
	
	var $currentPage = $('#collection_record_employee_list_page');
//	var $team_condition = $currentPage.find("[identity='team']");
	var teamCode =$team_condition.attr("code");
	var beginDate = $currentPage.find("input[name='startDate']").val();
	var endDate = $currentPage.find("input[name='endDate']").val();
	
	var postData = {};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.teamCode = teamCode;
	postData.beginDate = beginDate;
	postData.endDate = endDate;
	showLoading();
	$.getJSON(basePath+ "/app/collectionRecordEmployeeList/pageInit.xhtml"+ callback,postData,function(msg) {
		if($.trim(msg.returnCode) == '0'){
		    if(msg.data !=null && msg.data.employeeList.length>0){
					// 已催地址人员列表的初始化
					$currentPage.find(".personnelList").empty();
					var $template = $("#collection_record_employee_list_page .list-row-template li");
	
					$.each(msg.data.employeeList,function(i, n) {
	
						var $item = $template.clone(true);
	
						$item.attr("userId", n["USER_ID"]);
						n.MILES_AMOUNT = Math.round(n.MILES_AMOUNT);
						var checkInTimeHours = Math.floor(n.CHECK_IN_HOURS/60);
						var checkInTimeMinute = n.CHECK_IN_HOURS%60;
						n.CHECK_IN_HOURS = checkInTimeHours+"H"+checkInTimeMinute+"M";
						
						//用于返回该页面时计算选项的index
						$item.attr("scrollCurrentPage",1);
						$item.attr("scrollCurrentElementNum",i);
						
						dataBindToElement($item, n);
						// 点击已催地址人员列表项，跳转到已催记录列表
						$item.bind("tap",$item,collectionRecordEmployeeListSpace.listTapHandler);
						$currentPage.find(".personnelList").append($item);
					});// end $.each
					
					// 初始化分区列表
					var $teamList = $("#collection_record_employee_all_list");
					$teamList.empty();
					var $teamListItem = $("<li code='"+ConstDef.getConstant('TEAM_ALL_CODE')+"'></li>");
					$teamListItem.text("全部");
				
					// 点击弹层列表项进行选择
					$teamListItem.bind("tap",function() {
	
						var $team_condition = $currentPage.find("[identity='team']");
						var $priorCondition = $team_condition.text();
						$team_condition.text($(this).text());
						$team_condition.attr("code",$(this).attr("code"));
	
						$("#collection_record_employee_all_tirebox").hide();
						// 上箭头变下箭头
						var $teamElement = $("#collection_record_employee_list_page .topBar");
						var $arrow = $teamElement.children("span:last");
						$arrow.removeClass("allBtn_up");
						$arrow.addClass("allBtn_down");
//						if ($team_condition.text() != $priorCondition) {
//							// 根据选择的TEAM查询数据
//							query_collection_record_employee_list_by_team($team_condition.attr("code"));
//						}
	
					});
				
					$teamList.append($teamListItem);

					$.each(msg.data.teamList,function(i, n) {
						var $teamListItem = $("<li code='"+ n["code"] + "'></li>");
						$teamListItem.text(n["name"]);
	
						// 点击弹层列表项进行选择
						$teamListItem.bind("tap",function() {
							var $team_condition = $currentPage.find("[identity='team']");
							var $priorCondition = $team_condition.text();
							$team_condition.text($(this).text());
							$team_condition.attr("code",$(this).attr("code"));
							$("#collection_record_employee_all_tirebox").hide();
							// 下箭头变上箭头
							var $teamElement = $("#collection_record_employee_list_page .topBar");
							var $arrow = $teamElement.children("span:last");
							$arrow.removeClass("allBtn_up");
							$arrow.addClass("allBtn_down");
	
							// if($team_condition.text()
							// !=
							// $priorCondition){
							// query_collection_record_employee_list_by_team($team_condition.attr("code"));
							// }
	
						});
	
						$teamList.append($teamListItem);
					});// end $.each
            	
            		showHide();
			    } else {
			    	showHide();
//	            	showMessage('暂无数据','1500');	
			    }
	    	}else{
		    	showHide();
		    	errorHandler(msg.returnCode,msg.message);
	    	}	
		
//						// 在催地址人员列表的初始化
//						collection_record_employee_list_page.find(".queryButton").trigger("tap");
		//		
	});// end $.getJSON
};

function query_collection_record_employee_list_by_team(teamCode,beginDate,endDate) {
	var postData = {};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.teamCode = teamCode;
	postData.beginDate = beginDate;
	postData.endDate = endDate;
	// 根据选择的TEAM查询数据
	showLoading();
	$.getJSON(basePath+ "/app/collectionRecordEmployeeList/queryEmployeeList.xhtml"
							+ callback,postData,function(msg) {
			var $currentPage = $("#collection_record_employee_list_page");

			if ($.trim(msg.returnCode) == '0') {

				if (msg.data.employeeList.length <= 0) {
					showHide();
//					showMessage('暂无数据', '1500');
					return;
				}

				// 在催地址人员列表的初始化
				$currentPage.find(".personnelList").empty();
				var $template = $("#collection_record_employee_list_page .list-row-template li");

				$.each(msg.data.employeeList,function(i, n) {

						var $item = $template.clone(true);
						$item.attr("userId",n["USER_ID"]);
						n.MILES_AMOUNT = Math.round(n.MILES_AMOUNT);
						var checkInTimeHours = Math.floor(n.CHECK_IN_HOURS/60);
						var checkInTimeMinute = n.CHECK_IN_HOURS%60;
						n.CHECK_IN_HOURS = checkInTimeHours+"H"+checkInTimeMinute+"M";
						dataBindToElement($item, n);
						
						//用于返回该页面时计算选项的index
						$item.attr("scrollCurrentPage",1);
						$item.attr("scrollCurrentElementNum",i);
						
						// 点击在催地址人员列表项，跳转到在催地址列表
						$item.bind("tap",$item,collectionRecordEmployeeListSpace.listTapHandler);

						$currentPage.find(".personnelList").append($item);
				});// end $.each
				showHide();
			}else{
		    	showHide();
		    	errorHandler(msg.returnCode,msg.message);
	    	}// end if($.trim(msg.returnCode) == '0')

		});
}
