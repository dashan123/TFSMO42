/*************************travel_record_employee_list_page****************************/
var travel_record_employee_list_page = $('#travel_record_employee_list_page');
var travelRecordEmployeeListSpace = {};
var travel_record_employee_list_myScroll;
travelRecordEmployeeListSpace.listTapHandler = function(e) {

	//跳转到行车记录列表查看页面
	session.set("employeeId", e.data.attr("userId"));
	session.set("employeeCode", e.data.attr("userCode"));
	var $currentPage = $('#travel_record_employee_list_page');
	var beginDate = $currentPage.find("input[name='startDate']").val();
	var endDate = $currentPage.find("input[name='endDate']").val();
	session.set("beginDate",beginDate);
	session.set("endDate",endDate);
//	goto_page("travel_record_list_view_page");
}

/** ****************************home_page---begin************************************* */
travel_record_employee_list_page.live('pageinit', function(e, ui) {
	
	var wrapper = "travel_record_employee_list_wrapper";
	var up = "travel_record_employee_list_pullUp";
	var down = "travel_record_employee_list_pullDown";
	
	travel_record_employee_list_myScroll = createMyScroll(wrapper,up,down);
	
	
	// 回退按钮事件
	travel_record_employee_list_page.find(".BackBtn").live("tap",function(event) {
		event.stopPropagation();
		back_page("workbench_page");
	});

	// 初始化查询起止日期
//	$(this).find("input[name='startDate']").val(getYesterdayDate());
//	$(this).find("input[name='endDate']").val(getYesterdayDate());
	$(this).find("input[name='startDate']").val(getEndTime());
	$(this).find("input[name='endDate']").val(getEndTime());
	
	// 搜索按钮事件
	travel_record_employee_list_page.find(".queryButton").live("tap",function() {
		var $currentPage = $('#travel_record_employee_list_page');
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

		query_travel_record_employee_list_by_team(teamCode,	beginDate, endDate);
	});

	// 获取分区弹层
	var $teamListTirebox = $("#travel_record_employee_list_team_tirebox");

	// 弹层隐藏
	$teamListTirebox.hide();

	// 点击分区显示列表弹层
	var $teamElement = $("#travel_record_employee_list_page .topBar");
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

travel_record_employee_list_page.live('pageshow', function(e, ui) {
	
	currentLoadActionName = "travel_record_employee_list_load_content";
	
	var fromPage = session.get("fromPage");
	
	// 如果前页面是 travel_record_list_view_page ,则进入页面后不重新加载数据
	if (fromPage == "travel_record_list_view_page") {
		
	}
	else{
		load_travel_record_employee_list_content();
	}
	
});

function travel_record_employee_list_load_content(){
	
}

// 加载详细，并显示
function load_travel_record_employee_list_content() {
	showLoading();
	//设定分区条件 初始值：全部 -ConstDef.getConstant('TEAM_ALL_CODE')
	var $currentPage = $("#travel_record_employee_list_page");
	var $team_condition = $currentPage.find("[identity='team']");
	$team_condition.text("全部");
	$team_condition.attr("code",ConstDef.getConstant('TEAM_ALL_CODE'));
	
	var $currentPage = $('#travel_record_employee_list_page');
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
	
	$.getJSON(basePath+ "/app/travelRecordEmployeeList/pageInit.xhtml"+ callback,postData,function(msg) {
		// 行车记录人员列表的初始化
		$currentPage.find(".List").empty();
		var $template = $("#travel_record_employee_list_page .list-row-template li");

		$.each(msg.data.employeeList,function(i, n) {

			var $item = $template.clone(true);

			$item.attr("userId", n["USER_ID"]);

			$item.attr("userCode", n["USER_CODE"]);
			n.MILES_AMOUNT = Math.round(n.MILES_AMOUNT);
			
			n.FUEL_COSTS = fmoney(n.FUEL_COSTS,2);
			n.HIGHWAY_FEE = fmoney(n.HIGHWAY_FEE,2);
			n.PARKING_FEE = fmoney(n.PARKING_FEE,2);
			
			dataBindToElement($item, n);
			// 点击行车记录人员列表项，跳转到行车记录列表
			$item.bind("tap",$item,travelRecordEmployeeListSpace.listTapHandler);
			$currentPage.find(".List").append($item);
		});// end $.each
		
		// 初始化分区列表
		var $teamList = $("#travel_record_employee_list_team__list");
		$teamList.empty();
		var $teamListItem = $("<li code='"+ConstDef.getConstant('TEAM_ALL_CODE')+"'></li>");
		$teamListItem.text("全部");
		
		// 点击弹层列表项进行选择
		$teamListItem.bind("tap",function() {

			var $team_condition = $currentPage.find("[identity='team']");
			var $priorCondition = $team_condition.text();
			$team_condition.text($(this).text());
			$team_condition.attr("code",$(this).attr("code"));

			$("#travel_record_employee_list_team_tirebox").hide();
			// 上箭头变下箭头
			var $teamElement = $("#travel_record_employee_list_page .topBar");
			var $arrow = $teamElement.children("span:last");
			$arrow.removeClass("allBtn_up");
			$arrow.addClass("allBtn_down");
//							if ($team_condition.text() != $priorCondition) {
//								// 根据选择的TEAM查询数据
//								query_travel_record_employee_list_by_team($team_condition.attr("code"));
//							}

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
				$("#travel_record_employee_list_team_tirebox").hide();
				// 下箭头变上箭头
				var $teamElement = $("#travel_record_employee_list_page .topBar");
				var $arrow = $teamElement.children("span:last");
				$arrow.removeClass("allBtn_up");
				$arrow.addClass("allBtn_down");

				// if($team_condition.text()
				// !=
				// $priorCondition){
				// query_travel_record_employee_list_by_team($team_condition.attr("code"));
				// }

			});

			$teamList.append($teamListItem);
		});// end $.each
			
			
//		// 在催地址人员列表的初始化
//		travel_record_employee_list_page.find(".queryButton").trigger("tap");
			//	
		
		showHide();
	});// end $.getJSON
};

function query_travel_record_employee_list_by_team(teamCode,beginDate,endDate) {
	showLoading();
	var postData = {};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.teamCode = teamCode;
	postData.beginDate = beginDate;
	postData.endDate = endDate;
	// 根据选择的TEAM查询数据
	$.getJSON(basePath+ "/app/travelRecordEmployeeList/queryEmployeeList.xhtml"
							+ callback,postData,function(msg) {
			var $currentPage = $("#travel_record_employee_list_page");

			if ($.trim(msg.returnCode) == '0') {

				if (msg.data.employeeList.length <= 0) {
					showHide();
//					showMessage('暂无数据', '1500');
					return;
				}

				// 在催地址人员列表的初始化
				$currentPage.find(".List").empty();
				var $template = $("#travel_record_employee_list_page .list-row-template li");

				$.each(msg.data.employeeList,function(i, n) {

						var $item = $template.clone(true);
						$item.attr("userId",n["USER_ID"]);
						$item.attr("userCode", n["USER_CODE"]);
						n.MILES_AMOUNT = Math.round(n.MILES_AMOUNT);
						
						n.FUEL_COSTS = fmoney(n.FUEL_COSTS,2);
						n.HIGHWAY_FEE = fmoney(n.HIGHWAY_FEE,2);
						n.PARKING_FEE = fmoney(n.PARKING_FEE,2);
						
						dataBindToElement($item, n);
						// 点击行车记录人员列表项，跳转到行车记录列表
						$item.bind("tap",$item,travelRecordEmployeeListSpace.listTapHandler);

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



//var travel_record_employee_list_page = $("#travel_record_employee_list_page");
//var travel_record_statistic_myScroll;      
//travel_record_employee_list_page.live("pageinit",function(e,ui){
//	
//	//定义分页用到的数据
//	var wrapper = "travel_record_statistic_wrapper";
//	var up = "travel_record_statistic_pullUp";
//	var down = "travel_record_statistic_pullDown";
//	travel_record_statistic_myScroll = createMyScroll(wrapper, up, down);
//	currentLoadActionName = "travel_record_statistic_load_content";
//     
//	//回退事件处理
//	travel_record_list_page.find(".BackBtn").live("tap",function(){
//		//回退到工作台
//		back_page('workbench_page');
//	}); 	
//	
//	//初始化日期查询条件
//	$("#travel_record_employee_list_page #startDate").val(getYesterdayDate());
//	$("#travel_record_employee_list_page #endDate").val(getYesterdayDate());
//
//	// 按日期搜索
//	travel_record_employee_list_page.find(".chooseBtn").live("tap", function() {
////		currentPage = 1;
////		hasData = true;
////		var page = $('#travel_record_employee_list_page');
////		page.find(".List").empty();
//
//		load_travel_record_statistic_content();
//	});
//	
//	//隐藏分区选择弹框
//	$("#travel_record_statistic_team_tirebox").hide();
//	
//	//隐藏弹层事件
//	travel_record_employee_list_page.find(".Cancel").live("tap",function(){
//
//		//上箭头变下箭头
//		var $arrow =$("#travel_record_employee_list_page .topBar").find("span:last");
//		$arrow.removeClass("allBtn_up");
//		$arrow.addClass("allBtn_down");
//		$("#travel_record_statistic_team_tirebox").hide();
//	});    		
//        	  
//	//显示
//	travel_record_employee_list_page.find(".topBar").live("tap",function(){
//
//		//下箭头变上箭头
//		var $arrow = $("#travel_record_employee_list_page .topBar").find("span:last");
//		$arrow.removeClass("allBtn_down");
//		$arrow.addClass("allBtn_up");
//		$("#travel_record_statistic_team_tirebox").show();
//	  });
//});
//          
//travel_record_employee_list_page.live("pageshow",function(e,ui){
//	//判断当前 页面 如果非当前页面 就返回
//	if(!beforePageShowCheck($(this))){
//		return;
//	}
//	currentTemplatePage = "travel_record_employee_list_page";
//	
//	var fromPage = session.get("fromPage");
//	
//	//如果前页面是workbench,则进入页面后重新加载数据
//	if (fromPage == "workbench_page") {
//		//初始化分页
//		currentPage = 1;
//		hasData = true;
//		var page = $('#travel_record_employee_list_page');
//		page.find(".List").empty();
//
//		load_travel_record_statistic_content(page);
//	}
//	
////	var fromPage = session.get("fromPage");
////	//如果前页面是workbench,则进入页面后重新加载数据
////	if (fromPage == "workbench_page") {
////		var page = $('#travel_record_employee_list_page');
////		page.find(".List").empty();
////	}
//	
//	//初始化分区为全部
//	$("#travel_record_employee_list_page").find("#dictionary_list_area").text("全部");
// 
// 
// 
// 
//// var $currentPage = $("#travel_record_employee_list_page");
////	var $team_condition = $currentPage.find("[identity='team']");
////	$team_condition.text("全部");
////	$team_condition.attr("code",ConstDef.getConstant('TEAM_ALL_CODE'));
// 
//  
////	travel_record_statistic_load_content();
//});
//
//function travel_record_statistic_load_content(){
////	var page = $('#travel_record_employee_list_page');
////	if(hasData){
////		//如果还有数据则加载
////		load_travel_record_statistic_content(page);
////	}
//}
//
//
//
//
//
////
////function load_travel_record_statistic_content(){
////
////	var page = $('#travel_record_employee_list_page');
////	// 清空弹层内容
////	page.find("#travel_record_statistic_team_list").empty();
////	showLoading();
////	var authData = {};
////	authData.userCode = session.get("userCode");
//////	setScroll(authData);
////	authData.random = Math.random();
////	authData.startDate = page.find("#startDate").val();
////	authData.endDate = page.find("#endDate").val();
////	authData.teamCode = session.get("trvalTeamCode");
////	  // authData.dictionaryName=page.find("#dictionary_list_area").text();
////	  //travelingRecordStatisticInit
////	  $.getJSON(basePath+"/travelRecord/travelLingStatistic/queryTravelingRecordStatistic.xhtml"+callback,authData,function(msg){
////		  if($.trim(msg.returnCode) == '0'){
////			  var $areaList = page.find("#travel_record_statistic_team_tirebox").find("#travel_record_statistic_team_list");
////			  
////			  $.each(msg.data,function(i,n){      
////				  
////				  //避免第二次查询弹层内容被覆盖
////				  if(n.travelingRecordStatisticdictionaryName!=undefined){
////					  
////				       var  $_Area_All=$("<li id='all' ></li>"); 
////				       $_Area_All.text("全部");
////				       $areaList.append($_Area_All);
////				       
////				       page.find("#travel_record_statistic_team_list").find("#all").live("tap",function(){
////				    	 //下箭头变上箭头
////							var $arrow = page.find(".topBar").find("span:last");
////							$arrow.removeClass("allBtn_down");
////							$arrow.addClass("allBtn_up");
////				    	   page.find("#dictionary_list_area").text($(this).text());
////				    	   page.find("#travel_record_statistic_team_tirebox").hide();
////				    	   $arrow.removeClass("allBtn_up");
////							   $arrow.addClass("allBtn_down");
////				       });
////				       
////				   $.each(n.travelingRecordStatisticdictionaryName,function(i,m){
////						   
////					   var  $area=$("<li id='"+m["code"]+"' ></li>"); 
////					   $area.text(m["name"]);
////					   $area.attr("code",m["code"]);
//////					   var a =$(this).attr("code");
////					   $areaList.append($area);
////					   
////					   //选择分区事件
//////					   page.find("#travel_record_statistic_team__list").find("#"+a).live("tap",function(){
////					   $area.live("tap",function(){
////						   //下箭头变上箭头
////   							var $arrow = page.find(".topBar").find("span:last");
////    						$arrow.removeClass("allBtn_down");
////    						$arrow.addClass("allBtn_up");
////      		                page.find("#dictionary_list_area").text(m["name"]);
////      		                session.set("trvalTeamCode",$(this).attr("code"));
////  		                    
////  		                     page.find("#travel_record_statistic_team_tirebox").hide();
////  		                   $arrow.removeClass("allBtn_up");
////							   $arrow.addClass("allBtn_down");
////  		              });
////				   });
////				  }
////				  
////				  var $travel_record_statis_item = $("#travel_record_employee_list_page .list-row-template ul li").clone(true);
////				  if(n.user_id!=undefined){
//////				  $travel_record_statis_item.find("[identity='user_id']").text(n.user_id);
////				 $travel_record_statis_item.find("[identity='Name']").text(n.Name);
//// 				 $travel_record_statis_item.find("[identity='licenseplate_number']").text(n.licenseplate_number);
//// 				 $travel_record_statis_item.find("[identity='addressed']").text(n.address);
//// 				 $travel_record_statis_item.find("[identity='mileage']").text(n.mileage/1000);  //公里数
//// 				 $travel_record_statis_item.find("[identity='fuelCosts']").text(n.fuel_costs);
//// 				 $travel_record_statis_item.find("[identity='parkingFee']").text(n.Parking_fee);
//// 				 $travel_record_statis_item.find("[identity='highwayFee']").text(n.highway_fee);
//// 				  
////			  
//// 				 showHide();
//// 				 $travel_record_statis_item.removeClass("list-row-template");
//// 				 $travel_record_statis_item.show();
//// 				 $("#travel_record_employee_list_page .List").append($travel_record_statis_item);
////				  
////				  }else{
////					  //showHide();
////					  
////				  }
////			  });
////			 
////	
////			  //查询的数据包含分区
////			  if(msg.data.length<=1){
////					hasData = false;
////					//无数据时结束分页滚动
////					endScroll(travel_record_statistic_myScroll);
////		    	     showHide();
////                	 showMessage('暂无数据','1500');
////         	  }
////			  
////		  }else{
////				hasData = false;
////				//无数据时结束分页滚动
////				endScroll(travel_record_statistic_myScroll);
////	            	showHide();
////	            	errorHandler(msg.returnCode,msg.message);
////	            }
////		  
////	  });
////	  
////
////}
////          