var sale_travel_record_details_page = $("#sale_travel_record_details_page");
var sale_travel_record_details_myScroll;

//var feeDatetimeFlg = 0; //feeDatetimeFlg--0：没有费用填写时间  1：有费用填写时间
var selectDealerFlg = 1; //是否允许选择经销商名称  0：禁止选择  1：允许选择
var selectTravelTargetDataFlg = 1; //任务选择框是否有数据  0：无数据  1：有数据
var selectDealerDataFlg = 1; //经销商名称选择框是否有数据  0：无数据  1：有数据

sale_travel_record_details_page.live("pageinit", function(e, ui) {

	var wrapper = "sale_travel_record_details_wrapper";
	sale_travel_record_details_myScroll = createMyScroll(wrapper);
	// 返回行车列表
	sale_travel_record_details_page.find(".BackBtn").live("tap",
			function(event) {
				event.stopPropagation();
				back_page();
			});

	// 点击保存
	sale_travel_record_details_page.find(".SaveBtn").live("tap", function() {

//		querySaleFeeUpdateTime();
		addSaleTravelRecordDetailsCost();
	});
	
//	// 获取分区弹层
//	var $saleTravelTargetListTirebox = $("#sale_travel_record_details_all_tirebox");
//	// 弹层隐藏
//	$saleTravelTargetListTirebox.hide();
//
//	// 点击分区显示列表弹层
//	var $teamElement = $("#sale_travel_record_details_page .tierLi");
//	$teamElement.live("tap", function() {
//
//		$saleTravelTargetListTirebox.show();
//		// 下箭头变上箭头
//		var $arrow = $(this).children("span:last");
//		$arrow.removeClass("allBtn_down");
//		$arrow.addClass("allBtn_up");
//	});
//
//	// 取消 弹层选择
//	$saleTravelTargetListTirebox.find(".Cancel").live("tap", function() {
//		$saleTravelTargetListTirebox.hide();
//	});

});

sale_travel_record_details_page.live("pageshow", function(e, ui) {

	currentLoadActionName = "sale_travel_record_details_load_content"

	var fromPage = session.get("fromPage");
	// 如果前页面是workbench,则进入页面后重新加载数据
	if (fromPage == "sale_travel_record_list_page" || fromPage == "sale_my_schedule_page") {
		load_sale_travel_record_details_content();
	}

});

function sale_travel_record_details_load_content() {

}

function load_sale_travel_record_details_content() {
	// $("#sale_travel_record_details_page .List").empty();
	var page = $("#sale_travel_record_details_page");

	showLoading();
	var authData = {};
	authData.random = Math.random();
	authData.travelRecordId = session.get("travelRecordId");
	authData.userId = session.get("userId");
	authData.userCode = session.get("userCode");

	$.getJSON(
			basePath
			+ "/app/saleTravelRecordDetails/querySaleTravelRecordDetailsList.xhtml"
			+ callback,
			authData,
			function(msg) {
				if ($.trim(msg.returnCode) == '0') {

					page.find(".basicInfo1 span").text("");
					page.find(".basicInfo1 input").val("");
					page.find(".basicInfo1 textarea").val("");
					if (msg.data != null) {

						// 行车记录详情信息
						var saleTravelRecordDetails = msg.data.saleTravelRecordDetails;

						//初始化任务类型列表
						var saleTravelTargetList = msg.data.saleTravelTargetList;
						if(saleTravelTargetList != null && saleTravelTargetList.length > 0){
							selectTravelTargetDataFlg = 1;
							
							var $saleTravelTargetSelect = page.find("#saleTravelRecordDetailsPage-saleTravelTarget");
							$saleTravelTargetSelect.empty();
							$.each(saleTravelTargetList,function(i,n){
								var templateItem = '<option value="'+n.name+'">'+n.name+'</option>';
								$saleTravelTargetSelect.append(templateItem);
							});
							//任务类型数据初始化
							$saleTravelTargetSelect.mobiscroll().select({
						        theme: 'red',
						        lang: 'zh',
						        display: 'bottom',
						        minWidth: 200,
						        showOnFocus:true,
						        onInit: function (event, inst) {
						        	var businessExtf1 = saleTravelRecordDetails['businessExtf1'];
						        	if(businessExtf1 == "" || businessExtf1 == null){
//						        		$saleTravelTargetSelect.mobiscroll('setVal',"",true);
						        	}else{
						        		$saleTravelTargetSelect.mobiscroll('setVal',businessExtf1,true);
						        	}
						        },
						        onSet:function(event,inst){
						        	var saleTravelTargetVal = $(this).mobiscroll("getVal");
						        	page.find("[identity='saleTravelTarget']").text(saleTravelTargetVal);
						        	if(saleTravelTargetVal == "其它"){
						        		selectDealerFlg = 0;
						        		page.find("[identity='saleTravelDetailsDealer']").text("");
						        	}else{
						        		selectDealerFlg = 1;
						        		page.find("[identity='saleTravelDetailsDealer']").text("请选择");
						        	}
						        }
						    });
						}else{
							selectTravelTargetDataFlg = 0;
						}
						
						//初始化经销商列表 数据
						var dealersByDrmList = msg.data.saleDealerInfoList;
						if(dealersByDrmList != null && dealersByDrmList.length > 0){
							selectDealerDataFlg = 1;
							
							var $dealersByDrmSelect = page.find("#saleTravelRecordDetailsPage-dealersByDrm");
							$dealersByDrmSelect.empty();
							$.each(dealersByDrmList,function(i,n){
								var templateItem = '<option value="'+n.name+'">'+n.name+'</option>';
								$dealersByDrmSelect.append(templateItem);
							});
							//初始化经销商列表 组件
							$dealersByDrmSelect.mobiscroll().select({
							        theme: 'red',
							        lang: 'zh',
							        display: 'bottom',
							        minWidth: 200,
							        showOnFocus:true,
							        onInit: function (event, inst) {
							        	var businessExtf2 = saleTravelRecordDetails['businessExtf2'];
							        	if(businessExtf2 == "" || businessExtf2 == null){
//							        		$dealersByDrmSelect.mobiscroll('setVal',"",true);
							        	}else{
							        		$dealersByDrmSelect.mobiscroll('setVal',businessExtf2,true);
							        	}
							        },
							        onSet:function(event,inst){
							        	var dealersByDrmSelectVal = $(this).mobiscroll("getVal");
							        	page.find("[identity='saleTravelDetailsDealer']").text(dealersByDrmSelectVal);
							        }
							    });
						}else{
							selectDealerDataFlg = 0;
						}
						
//						page.find("[identity='taskType']").text(saleTravelRecordDetails["businessExtf1"]);
//						page.find("[identity='saleDealer']").text(saleTravelRecordDetails["businessExtf2"]);
						if(saleTravelRecordDetails["businessExtf1"] == null){
							page.find("[identity='saleTravelTarget']").text("请选择");
						}else{
							page.find("[identity='saleTravelTarget']").text(saleTravelRecordDetails["businessExtf1"]);
						}
						if(saleTravelRecordDetails["businessExtf2"] == null){
							page.find("[identity='saleTravelDetailsDealer']").text("请选择");
						}else{
							page.find("[identity='saleTravelDetailsDealer']").text(saleTravelRecordDetails["businessExtf2"]);
						}
						
						var $saleTravelTargetLi = page.find("#saleTravelTargetLi");
						$saleTravelTargetLi.bind("tap", function(event) {
							// 如果没有有费用填写时间
//							if (feeDatetimeFlg == 0) {
//								var saleTravelTargetId = $(this).attr("id");
//								selectSaleTravelTargetOrDealers(saleTravelTargetId);
								if(selectTravelTargetDataFlg == 1){
//									var $setSaleTravelTargetInput = $("#sale_travel_record_details_page .saleTravelRecordDetailsSaleTravelTargetDiv").find("input");
//									$setSaleTravelTargetInput.click();
									var $saleTravelTargetSelect = page.find("#saleTravelRecordDetailsPage-saleTravelTarget");
									$saleTravelTargetSelect.mobiscroll('show');
								}else{
									showMessage('任务类型暂无数据', '5000');
									return;
								}
//							}
							
							return false;
						});
						
						var $saleTravelDetailsDealerLi = page.find("#saleTravelDetailsDealerLi");
						$saleTravelDetailsDealerLi.bind("tap", function(event) {
							// 如果没有有费用填写时间 并且允许选择经销商名称
//							if (feeDatetimeFlg == 0 && selectDealerFlg == 1) {
							if (selectDealerFlg == 1) {
//								var saleDealerId = $(this).attr("id");
//								selectSaleTravelTargetOrDealers(saleDealerId);
								if(selectDealerDataFlg == 1){
//									var $setSaleDealersInput = $("#sale_travel_record_details_page .saleTravelRecordDetailsDealersDiv").find("input");
//									$setSaleDealersInput.click();
									var $dealersByDrmSelect = page.find("#saleTravelRecordDetailsPage-dealersByDrm");
									$dealersByDrmSelect.mobiscroll('show');
								}else{
									showMessage('经销商名称暂无数据', '5000');
									return;
								}
							}
							return false;
						});
						
						page.find("[identity='departureDate']").text(saleTravelRecordDetails["departureDate"]);
						page.find("[identity='departureDatetime']").text(saleTravelRecordDetails["departureDatetime"]);
						page.find("[identity='departureAddress']").text(saleTravelRecordDetails["departureAddress"]);
						
						page.find("[identity='arrivalDate']").text(saleTravelRecordDetails["arrivalDate"]);
						page.find("[identity='arrivalDatetime']").text(saleTravelRecordDetails["arrivalDatetime"]);
						page.find("[identity='arrivalAddress']").text(saleTravelRecordDetails["arrivalAddress"]);

						if (saleTravelRecordDetails["mileage"] != 0) {
							page.find("[identity='mileage']")
									.text(Math.round(saleTravelRecordDetails["mileage"]));
						} else {
							var polyline = new AMap.Polyline({
								path : msg.data.locationArray
							});
							var distance = polyline.getLength();
							
							page.find("[identity='mileage']").text(Math.round(distance / 1000));
						}
//						// 如果有费用填写时间
//						if (saleTravelRecordDetails["feeDatetime"]) {
//							//feeDatetimeFlg--0：没有费用填写时间  1：有费用填写时间
//							feeDatetimeFlg = 1;
//							
//							page.find("[identity='remark']").attr("readonly", "readonly");
//							page.find("[identity='remark']").attr('placeholder', '');
//
//							page.find(".SaveBtn").hide();
//							page.find("[identity='parkingFee']").css("display","none")
//							page.find("[identity='parkingFeeSpan']").css("display","")
//							page.find("[identity='highwayFee']").css("display","none")
//							page.find("[identity='highwayFeeSpan']").css("display","")
//							
//							var parkingFee = saleTravelRecordDetails["parkingFee"];
//							if(parkingFee != null && parkingFee != ""){
//								parkingFee = fmoney(parkingFee,2);
//							}
//							var highwayFee = saleTravelRecordDetails["highwayFee"];
//							if(highwayFee != null && highwayFee != ""){
//								highwayFee = fmoney(highwayFee,2);
//							}
//							
//							page.find("[identity='parkingFeeSpan']").text(parkingFee);
//							page.find("[identity='highwayFeeSpan']").text(highwayFee);
//							page.find("[identity='remark']").val(saleTravelRecordDetails["remark"]);
//						} else {
							//feeDatetimeFlg--0：没有费用填写时间  1：有费用填写时间
//							feeDatetimeFlg = 0;
							
							page.find(".SaveBtn").show();
							page.find("[identity='parkingFee']").css("display","")
							page.find("[identity='parkingFeeSpan']").css("display","none")
							page.find("[identity='highwayFee']").css("display","")
							page.find("[identity='highwayFeeSpan']").css("display","none")
							page.find("[identity='remark']").removeAttr("readonly");
							page.find("[identity='remark']").attr('placeholder', '请填写备注');
							
							var parkingFee = saleTravelRecordDetails["parkingFee"];
							if(parkingFee != null && parkingFee != ""){
								parkingFee = fmoney(parkingFee,2);
							}
							var highwayFee = saleTravelRecordDetails["highwayFee"];
							if(highwayFee != null && highwayFee != ""){
								highwayFee = fmoney(highwayFee,2);
							}
							
							page.find("input[identity='parkingFee']").val(parkingFee);//停车费
							page.find("input[identity='highwayFee']").val(highwayFee);//高速费
							page.find("[identity='remark']").val(saleTravelRecordDetails["remark"]);
//						}

//						// 初始化分区列表
//						var $saleTravelTargetList = $("#sale_travel_record_details_all_list");
//						$saleTravelTargetList.empty();
//						
//						$.each(msg.data.saleTravelTargetList,function(i, n) {
//							var $saleTravelTargetListItem = $("<li code='"+ n["code"] + "'></li>");
//							$saleTravelTargetListItem.text(n["name"]);
//		
//							// 点击弹层列表项进行选择
//							$saleTravelTargetListItem.bind("tap",function() {
////								var $team_condition = page.find("[identity='team']");
////								var $priorCondition = $team_condition.text();
////								$team_condition.text($(this).text());
////								$team_condition.attr("code",$(this).attr("code"));
//								
//								$("#sale_travel_record_details_all_tirebox").hide();
//								// 下箭头变上箭头
//								var $teamElement = page.find(".tierLi");
//								var $arrow = $teamElement.children("span:last");
//								$arrow.removeClass("allBtn_up");
//								$arrow.addClass("allBtn_down");
//		
//							});
//		
//							$saleTravelTargetList.append($saleTravelTargetListItem);
//						});// end $.each
						
						showHide();
					} else {
						showHide();
						// showMessage('暂无数据','5000');
					}

				} else {
					showHide();
					errorHandler(msg.returnCode, msg.message);
				}

			});

}

//// 查询是否修改过
//function querySaleFeeUpdateTime() {
//	showLoading();
//	var authData = {};
//	authData.travelRecordId = session.get("travelRecordId");
//	authData.uitcode = session.get("uitcode");
//	authData.random = Math.random();
//	$.getJSON(basePath + "/app/saleTravelRecordDetails/querySaleFeeModifytimeByID.xhtml"
//			+ callback, authData, function(msg) {
//
//		if ($.trim(msg.returnCode) == '0') {
//			if (msg.data != null && msg.data != "") {
//				showHide();
//				showMessage('您已经编辑过了无法再次编辑', '5000');
//			} else {
//				showHide();
//				addSaleTravelRecordDetailsCost();
//			}
//		} else {
//			showHide();
//			errorHandler(msg.returnCode, msg.message);
//		}
//	});
//}

// 添加编辑
function addSaleTravelRecordDetailsCost() {
	var page = $('#sale_travel_record_details_page');
	
	var saleTravelTargetText = page.find("[identity='saleTravelTarget']").text();
	if(saleTravelTargetText == "请选择"){
		saleTravelTargetText = "";
	}
	var saleTravelDetailsDealerText = page.find("[identity='saleTravelDetailsDealer']").text();
	if(saleTravelDetailsDealerText == "请选择"){
		saleTravelDetailsDealerText = "";
	}
	
	if (!checkMoney(rmoney(page.find("input[identity='parkingFee']").val()))) {
    	showMessage('停车费只能输入数字！', '5000');
		return false;
	} 
	if (!checkMoney(rmoney(page.find("input[identity='highwayFee']").val()))) {
		showMessage('高速费只能输入数字！', '5000');
		return false;
	}
	
	var authData = {};
	authData.travelRecordId = session.get("travelRecordId");
	authData.userCode = session.get("userCode");
	
//	authData.saleTravelTarget = page.find("#saleTravelRecordDetailsPage-saleTravelTarget").mobiscroll("getVal");
//	authData.saleDealer = page.find("#saleTravelRecordDetailsPage-dealersByDrm").mobiscroll("getVal");
	authData.saleTravelTarget = saleTravelTargetText;
	authData.saleDealer = saleTravelDetailsDealerText;

	authData.parkingFee = rmoney(page.find("input[identity='parkingFee']").val());//停车费
	authData.highwayFee = rmoney(page.find("input[identity='highwayFee']").val());//高速费
	authData.remark = page.find("textarea[identity='remark']").val();// 备注
	
	if(authData.saleTravelTarget == null || authData.saleTravelTarget =="" 
		|| authData.saleTravelTarget =="请选择"){
		showMessage('请选择任务！', '5000');
		return false;
	}
	
	if(authData.saleTravelTarget =="访店" && (authData.saleDealer == ""  
		|| authData.saleDealer == null)){
		showMessage('请选择经销商名称！', '5000');
		return false;
	}
	
//	if (
//		(authData.saleTravelTarget == null || authData.saleTravelTarget =="" 
//			|| authData.saleTravelTarget =="请选择")
//		&& (authData.saleDealer == "" || authData.saleDealer == null
//				|| authData.saleDealer =="请选择")
//		&& (authData.parkingFee == null || authData.parkingFee == "")
//		&& (authData.highwayFee == null || authData.highwayFee == "")
//		&& (authData.remark == null || authData.remark == "")) {
//		showMessage('没有需要保存的数据！', '1500');
////		page.find("input[identity='fuelCosts']").focus();
//		page.find("input[identity='saleTravelTarget']").focus();
//		return false;
//	}

	var currentDatetime = new Date().Format("YYYY/MM/DD HH/mm/ss");
	authData.currentDatetime = currentDatetime;
	showConfirm("请确认是否保存", function() {
		showLoading();
		$.getJSON(basePath
				+ "/app/saleTravelRecordDetails/addSaleTravelRecordDetailsCost.xhtml"
				+ callback, authData, function(msg) {
			if ($.trim(msg.returnCode) == '0') {
				if (msg.data > 0) {
					showHide();
					var parkingFee = authData.parkingFee;
					if(parkingFee != null && parkingFee != ""){
						parkingFee = fmoney(parkingFee,2);
						page.find("input[identity='parkingFee']").val(parkingFee);//停车费
					}
					var highwayFee = authData.highwayFee;
					if(highwayFee != null && highwayFee != ""){
						highwayFee = fmoney(highwayFee,2);
						page.find("input[identity='highwayFee']").val(highwayFee);//高速费
					}
					
					showMessage('保存成功', '5000');
				}

				setTimeout(function() {
					back_page();
				}, 2000);
			} else {
				showHide();
				errorHandler(msg.returnCode, msg.message);
			}
		});
	});

}

//// 选择任务类型 或 经销店名称
//function selectSaleTravelTargetOrDealers(selectType) {
//	if (selectType == "saleTravelTargetLi") {
//		if(selectTravelTargetDataFlg == 1){
//			var $setSaleTravelTargetInput = $("#sale_travel_record_details_page .saleTravelRecordDetailsSaleTravelTargetDiv").find("input");
//			$setSaleTravelTargetInput.click();
//		}else{
//			showMessage('任务类型暂无数据', '5000');
//			return;
//		}
//		
//	} else if (selectType == "saleTravelDetailsDealerLi") {
//		
//		if(selectDealerDataFlg == 1){
//			var $setSaleDealersInput = $("#sale_travel_record_details_page .saleTravelRecordDetailsDealersDiv").find("input");
//			$setSaleDealersInput.click();
//		}else{
//			showMessage('经销商名称暂无数据', '5000');
//			return;
//		}
//	}
//
//}
