var general_travel_record_details_page = $("#general_travel_record_details_page");
var general_travel_record_details_myScroll;

general_travel_record_details_page.live("pageinit", function(e, ui) {

	var wrapper = "general_travel_record_details_wrapper";
	general_travel_record_details_myScroll = createMyScroll(wrapper);
	// 返回行车列表
	general_travel_record_details_page.find(".BackBtn").live("tap",
			function(event) {
				event.stopPropagation();
				back_page();
			});

	// 点击保存
	general_travel_record_details_page.find(".SaveBtn").live("tap", function() {

		queryGeneralFeeUpdateTime();
	});
	// 查看催收记录
//	general_travel_record_details_page.find(".checkBtn").live(
//			"tap",
//			function() {
//				// 催收记录列表？催记详细？
//				session.set("collectionRecordId", $(this).attr(
//						"collection_record_id"));
//				goto_page("collection_record_details_page");
//			});

});

general_travel_record_details_page.live("pageshow", function(e, ui) {

	currentLoadActionName = "general_travel_record_details_load_content"

	var fromPage = session.get("fromPage");
	// 如果前页面是workbench,则进入页面后重新加载数据
	if (fromPage == "general_travel_record_list_page") {
		load_general_travel_record_details_content();
	}

});

function general_travel_record_details_load_content() {

}

function load_general_travel_record_details_content() {
	// $("#general_travel_record_details_page .List").empty();
	var page = $("#general_travel_record_details_page");

	showLoading();
	var authData = {};
	authData.random = Math.random();
	authData.travelRecordId = session.get("travelRecordId");
	authData.userId = session.get("userId");
	authData.userCode = session.get("userCode");
	authData.addressTypeReturnhome = ConstDef.getConstant("ADDRESS_TYPE_RETURNHOME");
	authData.addressTypeHomevisits = ConstDef.getConstant("ADDRESS_TYPE_HOMEVISITS");
	authData.addressTypeInventory = ConstDef.getConstant("ADDRESS_TYPE_INVENTORY");
	authData.addressTypeColletion = ConstDef.getConstant("ADDRESS_TYPE_COLLECTION");

	$.getJSON(
			basePath
			+ "/app/generalTravelRecordDetails/queryGeneralTravelRecordDetailsList.xhtml"
			+ callback,
			authData,
			function(msg) {
				if ($.trim(msg.returnCode) == '0') {

					page.find(".basicInfo1 span").text("");
					page.find(".basicInfo1 input").val("");
					page.find(".basicInfo1 textarea").val("");
					if (msg.data != null) {

						// 行车记录详情信息
						var generalTravelRecordDetails = msg.data.generalTravelRecordDetails;

						if(generalTravelRecordDetails["address_type"] == ConstDef.getConstant("ADDRESS_TYPE_RETURNHOME")){
							page.find("[identity='workobjectName']").text("返程记录，无工作对象");
						}else{
							page.find("[identity='workobjectName']").text(generalTravelRecordDetails["workobject_name"]);
						}
						
						if(generalTravelRecordDetails["address_type"] == ConstDef.getConstant("ADDRESS_TYPE_RETURNHOME")){
							page.find("[identity='addressType']").text("返程");
						}else if(generalTravelRecordDetails["address_type"] == ConstDef.getConstant("ADDRESS_TYPE_COLLECTION")){
							page.find("[identity='addressType']").text("催收");
						}else if(generalTravelRecordDetails["address_type"] == ConstDef.getConstant("ADDRESS_TYPE_HOMEVISITS")){
							page.find("[identity='addressType']").text("家访");
						}else if(generalTravelRecordDetails["address_type"] == ConstDef.getConstant("ADDRESS_TYPE_INVENTORY")){
//							page.find("[identity='addressType']").text("盘库");
							page.find("[identity='addressType']").text(generalTravelRecordDetails["business_extf1"]);
						}else{
							page.find("[identity='addressType']").text("");
						}
						page.find("[identity='departureDatetime']")
							.text(generalTravelRecordDetails["departure_datetime"]);
						page.find("[identity='arrivalDatetime']")
							.text(generalTravelRecordDetails["arrival_datetime"]);
						page.find("[identity='departureDate']")
							.text(generalTravelRecordDetails["departure_date"]);
						page.find("[identity='arrivalDate']")
							.text(generalTravelRecordDetails["arrival_date"]);
						page.find("[identity='departureAddress']")
							.text(generalTravelRecordDetails["departure_address"]);
						page.find("[identity='arrivalAddress']")
							.text(generalTravelRecordDetails["arrival_address"]);

						if (generalTravelRecordDetails["mileage"] != 0) {
							page.find("[identity='mileage']")
								.text(Math.round(generalTravelRecordDetails["mileage"]));
						} else {
							var polyline = new AMap.Polyline({
								path : msg.data.locationArray
							});
							var distance = polyline.getLength();
							// page.find("[identity='mileage']").attr("mileage",distance);
							page.find("[identity='mileage']").text(
									Math.round(distance / 1000));
							// page.find("[identity='mileage']").text(Math.round(distance));
						}
						// 如果有费用填写时间
						if (generalTravelRecordDetails["fee_datetime"]) {
							
							page.find("[identity='remark']").attr("readonly", "readonly");
							page.find("[identity='remark']").attr("disabled", "disabled");
							page.find("[identity='remark']").attr('placeholder', '');

							page.find(".SaveBtn").hide();
							
//							page.find("[identity='fuelCosts']").css("display","none")
//							page.find("[identity='fuelCostsSpan']").css("display","")
							
							page.find("[identity='parkingFee']").css("display","none")
							page.find("[identity='parkingFeeSpan']").css("display","")
							
							page.find("[identity='highwayFee']").css("display","none")
							page.find("[identity='highwayFeeSpan']").css("display","")
						
//							page.find("[identity='otherFee']").css("display","none")
//							page.find("[identity='otherFeeSpan']").css("display","")
						
//							page.find("#generalTravelRecordDetailsTextareaRemark").css("display","none")
//							page.find("[identity='remark']").css("display","none")
//							page.find("[identity='remarkSpan']").css("display","")
							
//							var fuelCosts = generalTravelRecordDetails["fuel_costs"];
//							if(fuelCosts != null && fuelCosts != ""){
//								fuelCosts = fmoney(fuelCosts,2);
//							}
							var parkingFee = generalTravelRecordDetails["parking_fee"];
							if(parkingFee != null && parkingFee != ""){
								parkingFee = fmoney(parkingFee);
							}
							var highwayFee = generalTravelRecordDetails["highway_fee"];
							if(highwayFee != null && highwayFee != ""){
								highwayFee = fmoney(highwayFee);
							}
//							var otherFee = generalTravelRecordDetails["other_fee"];
//							if(otherFee != null && otherFee != ""){
//								otherFee = fmoney(otherFee);
//							}
							
//							page.find("[identity='fuelCostsSpan']").text(fuelCosts);
							page.find("[identity='parkingFeeSpan']").text(parkingFee);
							page.find("[identity='highwayFeeSpan']").text(highwayFee);
//							page.find("[identity='otherFeeSpan']").text(otherFee);
							
							var remark = generalTravelRecordDetails["remark"];
//							page.find("[identity='remarkSpan']").text(remark);
							page.find("[identity='remark']").val(remark);
						} else {
							page.find(".SaveBtn").show();

//							page.find("[identity='fuelCosts']").css("display","")
//							page.find("[identity='fuelCostsSpan']").css("display","none")
							
							page.find("[identity='parkingFee']").css("display","")
							page.find("[identity='parkingFeeSpan']").css("display","none")
							
							page.find("[identity='highwayFee']").css("display","")
							page.find("[identity='highwayFeeSpan']").css("display","none")
						
//							page.find("[identity='otherFee']").css("display","")
//							page.find("[identity='otherFeeSpan']").css("display","none")
						
//							page.find("#generalTravelRecordDetailsTextareaRemark").css("display","")
//							page.find("[identity='remark']").css("display","")
//							page.find("[identity='remarkSpan']").css("display","none")
							
							page.find("[identity='remark']").removeAttr("readonly");
							page.find("[identity='remark']").removeAttr("disabled");
							page.find("[identity='remark']").attr('placeholder', '请填写备注');

						}
						
						showHide();
					} else {
						showHide();
						// showMessage('暂无数据','1500');
					}

				} else {
					showHide();
					errorHandler(msg.returnCode, msg.message);
				}

			});

}

// 查询是否修改过
function queryGeneralFeeUpdateTime() {
	showLoading();
	var authData = {};
	authData.travelRecordId = session.get("travelRecordId");
	authData.uitcode = session.get("uitcode");
	authData.random = Math.random();
	$.getJSON(basePath + "/app/generalTravelRecordDetails/queryGeneralFeeModifytimeByID.xhtml"
			+ callback, authData, function(msg) {

		if ($.trim(msg.returnCode) == '0') {
			if (msg.data != null && msg.data != "") {
				showHide();
				showMessage('您已经编辑过了无法再次编辑', '1500');
			} else {
				showHide();
				addGeneralTravelRecordDetailsCost();
			}
		} else {
			showHide();
			errorHandler(msg.returnCode, msg.message);
		}
	});
}

// 添加编辑
function addGeneralTravelRecordDetailsCost() {
	var page = $('#general_travel_record_details_page');
	
//	if (!checkMoney(rmoney(page.find("input[identity='fuelCosts']").val()))) {
//    	showMessage('加油费只能输入数字！', '1500');
//		return false;
//	} 
	if (!checkMoney(rmoney(page.find("input[identity='parkingFee']").val()))) {
    	showMessage('停车费只能输入数字！', '1500');
		return false;
	} 
	if (!checkMoney(rmoney(page.find("input[identity='highwayFee']").val()))) {
    	showMessage('高速费只能输入数字！', '1500');
		return false;
	}
//	if (!checkMoney(rmoney(page.find("input[identity='otherFee']").val()))) {
//    	showMessage('其他费用只能输入数字！', '1500');
//		return false;
//	}
	
	var authData = {};
	authData.travelRecordId = session.get("travelRecordId");
	authData.userCode = session.get("userCode");

//	authData.fuelCosts = rmoney(page.find("input[identity='fuelCosts']").val());//加油费
	authData.parkingFee = rmoney(page.find("input[identity='parkingFee']").val());//停车费
	authData.highwayFee = rmoney(page.find("input[identity='highwayFee']").val());//高速费
//	authData.otherFee = rmoney(page.find("input[identity='otherFee']").val());//其他费用
//	authData.remark = page.find("input[identity='remark']").val();// 备注
	authData.remark = page.find("textarea[identity='remark']").val();// 备注

	if (
//		(authData.fuelCosts == null || authData.fuelCosts == "")
//		&& 
		(authData.parkingFee == null || authData.parkingFee == "")
		&& (authData.highwayFee == null || authData.highwayFee == "")
//		&& (authData.otherFee == null || authData.otherFee == "")
		&& (authData.remark == null || authData.remark == "")) {
		showMessage('没有需要保存的数据！', '1500');
//		page.find("input[identity='fuelCosts']").focus();
		page.find("input[identity='parkingFee']").focus();
		return false;

	}

	var currentDatetime = new Date().Format("YYYY/MM/DD HH/mm/ss");
	authData.currentDatetime = currentDatetime;
	showConfirm("请确认是否保存", function() {
		showLoading();
		$.getJSON(basePath
				+ "/app/generalTravelRecordDetails/addGeneralTravelRecordDetailsCost.xhtml"
				+ callback, authData, function(msg) {
			if ($.trim(msg.returnCode) == '0') {
				if (msg.data > 0) {
					showHide();
					// load_travel_record_details_content();
					showMessage('保存成功', '2000');
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
