var fi_my_schedule_page = $('#fi_my_schedule_page');

// var collectingAddressListPageHandler ={};

var fi_my_schedule_myScroll;
/** ****************************home_page---begin************************************* */
fi_my_schedule_page.live('pageinit', function(e, ui) {

	var wrapper = "fi_my_schedule_wrapper";
	var up = "fi_my_schedule_pullUp";
	var down = "fi_my_schedule_pullDown";
	fi_my_schedule_myScroll = createMyScroll(wrapper, up, down);
	// //scroll位置
	// var scrollMapJSON = {};
	// scrollMapJSON.organizationid = organizationid;
	// scrollMap.contacts_dept_page = JSON.stringify(scrollMapJSON);
	// 回退事件处理
	fi_my_schedule_page.find(".BackBtn").live("tap", function(event) {
		event.stopPropagation();
		back_page('workbench_page');
	});

	// 添加日程按钮-->跳转到添加日程页面
	fi_my_schedule_page.find(".addButton4").live(
			'tap',
			function() {

				// 获取当前选中的日期
				var scheduleDate = Format(
						$('#fiCalendar').mobiscroll('getVal'), "yyyy-MM-dd");
				var currentDate = Format(new Date(), "yyyy-MM-dd");

				// 如果选中日期>当前日期，则允许跳转至添加日程页面
				if (scheduleDate >= currentDate) {
					session.set("scheduleDate", scheduleDate);
					// 跳转至添加普通日程画面
					goto_page("fi_normal_schedule_add_page");
				} else {
					showMessage('选中日期小于当前日期，不能添加日程', '1500');
				}

			});

	// 日历初始化
	$('#fiCalendar').mobiscroll().calendar(
			{
				display : 'inline',
				layout : 'liquid',
				theme : 'red',
				lang : 'zh',
				markedDisplay : 'bottom',
				defaultValue : new Date(),
				onMonthLoading : function(event, inst) {
					var year = event.year, month = event.month;
					var yearAndMonth = year.toString() + "-"
							+ (month + 1 < 10 ? "0" + (month + 1) : month + 1);
					fiMySchedulePage_queryScheduleDays(yearAndMonth, inst);
				},
				onDayChange : function(event, inst) {

					fiMySchedulePage_querySchedules(event.date);

				}
			});

	$('#fiCalendar').mobiscroll('setVal', new Date());

	// 返程按钮事件
	fi_my_schedule_page.find('[identity="return-back-home"]').live("tap",function(event) {

		var $currentPage = $("#fi_my_schedule_page");
		var $actionButton = $currentPage.find('[identity="return-back-home"]');
		//查看当前按钮是否不可用
		if($actionButton.attr("enable") === "false" ){
			console.log("不可用：");
			return;
		}
		else{
			$actionButton.attr("enable","false");//将按钮置为不可用。
			fiMySchedule_returnHomeAction($actionButton);
			console.log("可用：");
		}
	});

});// end pageinit

fi_my_schedule_page.live('pageshow', function(e, ui) {

	currentLoadActionName = "fi_my_schedule_load_content";
	
	// 返程按钮状态初始化
	queryReturnHomeRecord();
	//防止断网导致 返程  按钮不可用
	$("#fi_my_schedule_page").find('[identity="return-back-home"]').attr("enable","true");
	
	// 当页面从普通日程详情查看，家访报告添加，家访报告查看，自定义任务详情查看页面返回时，不需刷新
	var fromPage = session.get("fromPage");
	if (fromPage != "fi_task_report_add_page"
			&& fromPage != "fi_task_report_view_page"
			&& (fromPage != "fi_custom_task_details_view_page" || session
					.get("refreshFiMySchedulePage") == "true")) {
		session.set("refreshFiMySchedulePage", "false");
		var inst = $('#fiCalendar').mobiscroll('getInst');
		var scheduleDate = $('#fiCalendar').mobiscroll('getVal');
		var yearAndMonth = Format(scheduleDate, "yyyy-MM");

		// 刷新标注红点
		fiMySchedulePage_queryScheduleDays(yearAndMonth, inst);

		// 进入时默认显示日程列表
		fiMySchedulePage_querySchedules(scheduleDate);
		// load_fi_my_schedule_content();
	} else {

		// 获取当前页的index
		// var scrollCurrentElementIndex = 0;
		// var scrollNowPage = session.get("nowPage");
		// if(!$.isEmptyObject(scrollMap)){
		// var commonScrollMapJsonObj = scrollMap[scrollNowPage];
		// if(commonScrollMapJsonObj != null && typeof(commonScrollMapJsonObj)
		// != "undefined"){
		// commonScrollMapJsonObj = JSON.parse(commonScrollMapJsonObj);
		// scrollCurrentElementIndex =
		// commonScrollMapJsonObj.scrollCurrentElementIndex;
		// //删除Json数据中的scrollNowPage属性
		// delete scrollMap[scrollNowPage];
		// }
		// }
		// var scrollCurrentElement =
		// $('#fi_my_schedule_page').find('#fi_my_schedule_list').get(scrollCurrentElementIndex);
		// fi_my_schedule_myScroll.refresh();//刷新iScroll
		// fi_my_schedule_myScroll.scrollToElement(scrollCurrentElement,0);
	}
});// end pageshow

function fi_my_schedule_load_content() {
	// 下拉不刷新，则该方法置空
}

function fiMySchedulePage_querySchedules(scheduleDate) {

	var postData = {};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	postData.scheduleDate = Format(scheduleDate, "yyyy-MM-dd");
	// 查询日程列表
	$
			.ajax({
				url : basePath + "/app/fiMySchedule/querySchedules.xhtml"
						+ callback, // 这个地址做了跨域处理
				data : postData,
				type : 'GET',
				dataType : 'json',
				async : false,
				beforeSend : function() {
					showLoading();
				},
				success : function(msg) {

					showHide();

					if ($.trim(msg.returnCode) == '0') {

						var $fi_my_schedule_list = $('#fi_my_schedule_list');
						$fi_my_schedule_list.empty();

						var data = msg.data;

						// 显示普通日程列表
						var $templateNormalSchedule = $('#fi_my_schedule_page')
								.find("[template-id='normal-schedule']");
						$
								.each(
										data.normalSchedules,
										function(i, n) {
											var $normalScheduleItem = $templateNormalSchedule
													.clone(true);

											// 跳转至查看普通日程画面
											$normalScheduleItem
													.find("dd")
													.bind(
															"tap",
															function(event) {
																var normalScheduleId = $(
																		this)
																		.find(
																				"[identity='normalScheduleId']")
																		.text();
																session
																		.set(
																				"normalScheduleId",
																				normalScheduleId);
																// 跳转至查看普通日程画面
																goto_page("fi_normal_schedule_view_page");
															});
											dataBindToElement(
													$normalScheduleItem, n);
											$normalScheduleItem.show();
											$('#fi_my_schedule_list').append(
													$normalScheduleItem);
										});// end each

						// 显示家访日程列表
						var $templateFiTaskSchedule = $('#fi_my_schedule_page')
								.find("[template-id='fi-task-schedule']");

						var $templateFiTaskScheduleInfo = $(
								'#fi_my_schedule_page').find(
								"[template-id='fi-task-schedule-info']");

						$
								.each(
										data.fiTaskSchedules,
										function(i, n) {
											var $fiTaskScheduleItem = $templateFiTaskSchedule
													.clone(true);
											// 跳转至家访报告
											$fiTaskScheduleItem
													.bind(
															"tap",
															function(event) {
																var fiTaskId = $(
																		this)
																		.find(
																				"[identity='fiTaskId']")
																		.text();
																session
																		.set(
																				"fiTaskId",
																				fiTaskId);
																// 如果不是企业贷款(GD,DE)
																if (n.customerType != "QY") {
																	if (n.finishStatusText == "未完成") {
																		goto_page("fi_task_report_edit_page");
																	} else {

																		goto_page("fi_task_report_view_page");
																	}
																} else {
																	if (n.finishStatusText == "未完成") {

																		// 将该企贷任务完成：正常，打回，取消
																		$(
																				"#fiMySchedule_finishStatusList")
																				.mobiscroll()
																				.select(
																						{
																							theme : 'red',
																							lang : 'zh',
																							display : 'bottom',
																							minWidth : 200,
																							onSet : function(
																									event,
																									inst) {

																								var postData = {};
																								postData.random = new Date();
																								postData.userCode = session
																										.get("userCode");
																								postData.userId = session
																										.get("userId");
																								postData.fiTaskId = session
																										.get("fiTaskId");// 获取家访任务Id
																								postData.finishStatus = inst
																										.getVal();
																								debugger;
																								$
																										.getJSON(
																												basePath
																														+ "/app/fiMySchedule/finishFiQyTask.xhtml"
																														+ callback,
																												postData,
																												function(
																														msg) {

																													if ($
																															.trim(msg.returnCode) == '0') {
																														showHide();
																														if (msg.data) {

																															var data = msg.data;

																															var result = data.result;
																															if (result >= 0) {
																																// 刷新日程列表
																																var scheduleDate = $(
																																		'#fiCalendar')
																																		.mobiscroll(
																																				'getVal');
																																fiMySchedulePage_querySchedules(scheduleDate);
																																// showMessage("企贷家访任务完成状态更新成功！！",2000);
																																setTimeout(
																																		function() {
																																			showMessage(
																																					"企贷家访任务完成状态更新成功！！",
																																					2000);
																																		},
																																		1500);

																															} else if (result == -1) {
																																showMessage(
																																		"家访任务已完成，不允许再次提交！！",
																																		2000);
																															} else if (result == -2) {
																																showMessage(
																																		"预约日期，完成日期任意一个为空，家访类型不是skip fi的，不可以提交！！",
																																		2000);
																															} else if (result == -3) {
																																showMessage(
																																		"提交类型为正常时，家访结束时间不能为空，请检查是否已开始并结束家访！！",
																																		2000);
																															}
																															// else
																															// if(result
																															// ==
																															// -4){
																															// showMessage("提交类型为正常时，必须要有家访报告，请检查是否已保存家访报告！！",2000);
																															// }
																															else if (result == -5) {
																																showMessage(
																																		"当前任务有正在进行中的计划地址，不允许提交！！",
																																		2000);
																															} else {
																																showMessage(
																																		"家访报告提交失败！！",
																																		2000);
																															}

																														}// end
																															// if(msg.data){
																													} else {
																														errorHandler(
																																msg.returnCode,
																																msg.message);
																													}

																												});// end
																													// $.getJSON
																							}
																						});

																		$(
																				"#fiMySchedule_finishStatusList")
																				.mobiscroll(
																						"show");

																	} else {
																		showMessage(
																				"该任务为企贷家访任务，在MOA中不能查看家访报告。",
																				2000);
																	}
																}
																return false;
															});
											dataBindToElement(
													$fiTaskScheduleItem, n);

											// 显示家访日程信息
											$.each(
															n.scheduleInfo,
															function(i, n) {

																var $scheduleInfoItem = $templateFiTaskScheduleInfo
																		.clone(true);

																// 点击地址打开高德地图进行定位
																$scheduleInfoItem
																		.find(
																				'[identity="appointmentAddress"]')
																		.bind(
																				"tap",
																				function(
																						event) {
																					var address = $(
																							this)
																							.text();
																					callNavi(address);
																					event
																							.stopPropagation();
																				});

																var $actionButton = $scheduleInfoItem
																		.find("a[buttonType='action-button']");
																if (n.fieldStatus == "YJS") {
																	$actionButton.hide();
																} else {

																	$actionButton.bind("tap",function(event) {
//																				var $currentPage = $("#fi_my_schedule_page");
//																				var $actionButton = $currentPage.find('[identity="return-back-home"]');
																				//查看当前按钮是否不可用
																		
																				if($(this).attr("enable") === "false" ){
																					console.log("不可用：");
																					return;
																				}
																				else{
																					$(this).attr("enable","false");//将按钮置为不可用。
																					fiMySchedule_runTaskAction(this);
																					
																					console.log("可用：");
																				}
																				event.stopPropagation();
																			});

																	var imgSrc = n.fieldStatus == "WKS" ? "images/tfsred/StaBtn1.png"
																			: "images/tfsred/EndIcon.png";
																	$actionButton
																			.find(
																					"img")
																			.removeAttr(
																					"src");
																	$actionButton
																			.find(
																					"img")
																			.attr(
																					"src",
																					imgSrc);
																}

																dataBindToElement(
																		$scheduleInfoItem,
																		n);

																$scheduleInfoItem
																		.show();
																$fiTaskScheduleItem
																		.append($scheduleInfoItem);
															});

											$fiTaskScheduleItem.show();
											$('#fi_my_schedule_list').append(
													$fiTaskScheduleItem);
										});// end each

						// 显示自定义任务日程列表
						var $templateFiCustomTaskSchedule = $(
								'#fi_my_schedule_page').find(
								"[template-id='fi-custom-task']");
						var $templateFiCustomTaskScheduleInfo = $(
								'#fi_my_schedule_page').find(
								"[template-id='fi-custom-task-schedule-info']");

						$
								.each(
										data.fiCustomTaskSchedules,
										function(i, n) {
											var $fiCustomTaskScheduleItem = $templateFiCustomTaskSchedule
													.clone(true);
											// 跳转至自定义任务详情
											$fiCustomTaskScheduleItem
													.bind(
															"tap",
															function(event) {
																var fiCustomTaskId = $(
																		this)
																		.find(
																				"[identity='customTaskId']")
																		.text();
																// debugger;
																session
																		.set(
																				"taskId",
																				fiCustomTaskId);

																// if(n.finishStatusText
																// == "未完成"){
																// goto_page("fi_custom_task_details_edit_page");
																// }
																// else{

																goto_page("fi_custom_task_details_view_page");
																// }
															});
											dataBindToElement(
													$fiCustomTaskScheduleItem,
													n);

											// 显示自定义任务日程信息
											$
													.each(
															n.scheduleInfo,
															function(i, n) {
																var $scheduleInfoItem = $templateFiCustomTaskScheduleInfo
																		.clone(true);

																// 点击地址打开高德地图进行定位
																$scheduleInfoItem
																		.find(
																				'[identity="appointmentAddress"]')
																		.bind(
																				"tap",
																				function(
																						event) {
																					var address = $(
																							this)
																							.text();
																					callNavi(address);
																					event
																							.stopPropagation();
																				});

																var $actionButton = $scheduleInfoItem
																		.find("a[buttonType='action-button']");
																if (n.fieldStatus == "YJS") {
																	$actionButton
																			.hide();
																} else {

																	$actionButton.bind("tap",function(event) {
																		//查看当前按钮是否不可用
																		if($(this).attr("enable") === "false" ){
																			console.log("不可用：");
																			return;
																		}
																		else{
																			$(this).attr("enable","false");//将按钮置为不可用。
																			fiMySchedule_runTaskAction(this);
																			console.log("可用：");
																		}
																		event.stopPropagation();
																	});

																	var imgSrc = n.fieldStatus == "WKS" ? "images/tfsred/StaBtn1.png"
																			: "images/tfsred/EndIcon.png";
																	$actionButton
																			.find(
																					"img")
																			.removeAttr(
																					"src");
																	$actionButton
																			.find(
																					"img")
																			.attr(
																					"src",
																					imgSrc);
																}

																dataBindToElement(
																		$scheduleInfoItem,
																		n);
																$scheduleInfoItem
																		.show();
																$fiCustomTaskScheduleItem
																		.append($scheduleInfoItem);
															});

											$fiCustomTaskScheduleItem.show();
											$('#fi_my_schedule_list').append(
													$fiCustomTaskScheduleItem);
										});// end each

						$('#fi_my_schedule_list')
								.mobiscroll()
								.listview(
										{
											theme : 'red',
											display : '',
											sortable : false,
											iconSlide : true,
											swipe : 'left',
											stages : [ {
												percent : -25,
												color : 'red',
												icon : 'remove',
												text : '删除',
												confirm : true,
												disabled : function(event, inst) {
													// Disable this action only
													// for the item with 2 as
													// id.
													if (event.target
															.getAttribute('template-id') != 'normal-schedule') {
														return true;
													}
													// if
													// (event.target.getAttribute('data-id')
													// === '2') {
													// return true;
													// }
												},
												action : function(event, inst) {
													var finishStatusText = $(
															event.target)
															.find(
																	"[identity='finishStatusText']")
															.text();
													if (finishStatusText != "未完成") {
														showMessage(
																'日程已结束，不允许删除',
																'1500');
														return true;
													}

													var scheduleType = event.target
															.getAttribute('template-id');

													if (scheduleType == "normal-schedule") {
														// 删除普通日程

														// 获取普通日程的Id
														var scheduleId = $(
																event.target)
																.find(
																		"[identity='normalScheduleId']")
																.text();

														fiMySchedule_deleteSchedule(
																scheduleType,
																scheduleId);
														inst
																.remove(event.target);
														return false;
													} else if (scheduleType == "fi-task-schedule") {
														// 家访日程
														showMessage(
																'家访日程不支持删除操作',
																'1500');
													} else if (scheduleType == "fi-custom-task") {
														// 自定义任务日程
														showMessage(
																'自定义任务日程不支持删除操作',
																'1500');
													} else {

													}

													return false;
												}
											} ]
										});// end listview

					} else {
						errorHandler(msg.returnCode, msg.message);
					}
				},
				complete : function() {

				}
			});// end $.ajax

}

/**
 * 根据当前登录用户和日程日期查询日程列表
 * 
 * @param yearAndMonth
 *            示例格式：2017-01-01
 * @param inst
 *            Returns the object instance.
 */
function fiMySchedulePage_queryScheduleDays(yearAndMonth, inst) {

	var postData = {};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	postData.yearAndMonth = yearAndMonth;
	// 获取需要标注红点的日期
	$
			.ajax({
				url : basePath + "/app/fiMySchedule/queryScheduleDays.xhtml"
						+ callback, // 这个地址做了跨域处理
				data : postData,
				type : 'GET',
				dataType : 'json',
				async : false,
				beforeSend : function() {
					showLoading();
				},
				success : function(msg) {

					showHide();

					if ($.trim(msg.returnCode) == '0') {
						var data = msg.data;
						inst.settings.marked = [];
						for (var i = 0; i < data.length; i++) {
							inst.settings.marked.push({
								d : new Date(data[i].scheduleDay), // Make sure
																	// that a
																	// javascript
																	// date
																	// object is
																	// passed
								color : 'rgb(163, 0, 38)'
							});
						}
						inst.redraw();
					} else {
						errorHandler(msg.returnCode, msg.message);
					}
				},
				complete : function() {

				}
			});// end $.ajax

}

function fiMySchedule_runTaskAction(actionButton) {

	// 获取当前选中的日期
	var scheduleDate = Format($('#fiCalendar').mobiscroll('getVal'),
			"yyyy-MM-dd");
	var currentDate = Format(new Date(), "yyyy-MM-dd");

	var fieldStatus = $(actionButton).find("span[identity='fieldStatus']")
			.text();
	if (fieldStatus == "WKS" && scheduleDate != currentDate) {
		showMessage('只能开始当天日程中的地址!!', '2000');
		return;
	}

	var finishStatusText = $(actionButton).parents("li").find(
			'[identity="finishStatusText"]').text();
	if (finishStatusText === "打回" || finishStatusText === "正常"
			|| finishStatusText === "取消" || finishStatusText === "取消未达"
			|| finishStatusText === "到达未访") {
		showMessage('任务已完成，不能执行开始操作！', '2000');
		return;
	}

	var callBack = function(driveStatus) {
		
		// 获取当前所点击按钮所对应的日程类型(家访，自定义任务)，实地状态 WKS,JXZ,YJS，计划地址Id
		var scheduleType = $(actionButton)
				.find("span[identity='scheduleType']").text();
		var fieldStatus = $(actionButton).find("span[identity='fieldStatus']")
				.text();
		var appointmentAddressId = $(actionButton).find(
				"span[identity='appointmentAddressId']").text();

		if (fieldStatus == "WKS" && driveStatus == false) {
			console.log("点击开始按钮,开始对地址进行家访");

			fiMySchedule_runTaskAction01(scheduleType, "start",
					appointmentAddressId, fieldStatus, driveStatus);

		} else if (fieldStatus == "WKS" && driveStatus == true) {
			showMessage('无法对当前地址进行家访，请确认是否有正在进行的其它地址！', '2000');
		} else if (fieldStatus == "JXZ" && driveStatus == true) {
			console.log("点击结束按钮,结束家访");

			fiMySchedule_runTaskAction01(scheduleType, "end",
					appointmentAddressId, fieldStatus, driveStatus);
		} else if (fieldStatus == "JXZ" && driveStatus == false) {
			console.log("ERROR");
		}
	};
	var completeFunc = function(){
		$(actionButton).attr("enable","true");
	}
	queryDriveStatusForColl(callBack,completeFunc);
}

function fiMySchedule_runTaskAction01(scheduleType, action,
		appointmentAddressId, fieldStatus, driveStatus) {
	var postData = {};
	postData.random = new Date();
	var userInfo = JSON.parse(session.get("userInfo"));
	postData.onlineStatus = userInfo.user.onlineStatus;
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	// 手机端当前时间
	// var currentDatetime = new Date().Format("YYYY/MM/DD HH/mm/ss");
	// postData.currentDatetime = currentDatetime;

	if (action === "end") {
		onLocationBegin();
		// 获取手机位置信息
		setTimeout(function() {

			postData.latitude = newLatitude;
			postData.longitude = newLongitude;
			postData.address = newAddress;

			if (authData.longiTude == 0 || authData.latiTude == 0
					|| authData.address == null) {
				// showMessage('未能获取到位置信息,该地址的坐标无法出现在家访报告中！！','1500');
				return;
			}
		}, 2000);
	}

	postData.scheduleType = scheduleType;
	postData.action = action;
	postData.appointmentAddressId = appointmentAddressId;
	postData.fieldStatus = fieldStatus;
	postData.drivingStatus = driveStatus;
	showLoading();
	// 执行家访
	$.getJSON(basePath + "/app/fiMySchedule/runFiTaskAction.xhtml" + callback,
			postData, function(msg) {
				showHide();
				if ($.trim(msg.returnCode) == '0') {
					if (msg.data) {
						var data = msg.data;
						if (data.action == "unknown") {
							showMessage(msg.message, '1500');
						} else if (data.action == "start"
								&& data.result == "success") {
							// 成功开始家访
							showMessage(msg.message, '1500');

							// 刷新日程列表
							var scheduleDate = $('#fiCalendar').mobiscroll(
									'getVal');
							fiMySchedulePage_querySchedules(scheduleDate);
						} else if (data.action == "end"
								&& data.result == "success") {
							showMessage(msg.message, '1500');

							// 刷新日程列表
							var scheduleDate = $('#fiCalendar').mobiscroll(
									'getVal');
							fiMySchedulePage_querySchedules(scheduleDate);
							// 计算里程数
							var returnData = msg.data.dataMap;
							if (returnData != null) {

								var travelId = returnData.travelRecord.id;
								// 获取所有的点
								var lineArr = returnData.locationArray;
								// common_calculateDistance(travelId,lineArr);
								coll_calculateDistance(travelId, lineArr);

							}
						}
					}
					console.log(msg.message);

				} else {
					errorHandler(msg.returnCode, msg.message);
					console.log(msg.message);
				}

			});// end $.getJSON
}


function fiMySchedule_returnHomeAction(actionButton) {

	var successFunc = function(driveStatus) {
		// 获取当前所点击按钮所对应的日程类型(家访，自定义任务)，实地状态 WKS,JXZ,YJS，计划地址Id
		var fieldStatus = $(actionButton).find("span[identity='fieldStatus']")
				.text();
		var id = $(actionButton).find("span[identity='id']").text();

		if (fieldStatus == "WKS" && driveStatus == false) {
			console.log("点击开始按钮,开始返程");
			fiMySchedule_returnHomeAction01("start", id);

		} else if (fieldStatus == "WKS" && driveStatus == true) {
			showMessage('无法开始返程，请确认是否有正在进行的其它地址！', '2500');
		} else if (fieldStatus == "JXZ" && driveStatus == true) {
			console.log("点击结束按钮,结束返程");
			fiMySchedule_returnHomeAction01("end", id);
		} else if (fieldStatus == "JXZ" && driveStatus == false) {
			console.log("ERROR");
		}
	};
	var completeFunc = function(){
		$("#fi_my_schedule_page").find('[identity="return-back-home"]').attr("enable","true");
	}
	queryDriveStatusForColl(successFunc,completeFunc);
}

function queryReturnHomeRecord() {

	var postData = {};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	showLoading();

	$.getJSON(basePath + "/app/fiMySchedule/queryReturnHomeRecord.xhtml"
			+ callback, postData, function(msg) {
		showHide();
		if ($.trim(msg.returnCode) == '0') {
			if (msg.data) {
				var data = msg.data;
				// 初始化返回驻地状态显示
				var returningHomeRecord = data.returningHomeRecord;
				var $buttonReturnHome = $("#fi_my_schedule_page").find(
						'[identity="return-back-home"]');
				
				// 如果已开始返程
				if (returningHomeRecord) {
					$buttonReturnHome.children("[identity='actionText']").text(
							"结束");
					$buttonReturnHome.find("img").attr("src",
							"images/tfsred/EndIcon.png");
					$buttonReturnHome.find("[identity='id']").text(
							returningHomeRecord.id);
					$buttonReturnHome.find("[identity='fieldStatus']").text(
							"JXZ");
				} else {
					$buttonReturnHome.children("[identity='actionText']").text(
							"开始");
					$buttonReturnHome.find("img").attr("src",
							"images/tfsred/StaBtn.png");
					$buttonReturnHome.find("[identity='fieldStatus']").text(
							"WKS");
				}
			}
			console.log(msg.message);

		} else {
			errorHandler(msg.returnCode, msg.message);
			console.log(msg.message);
		}

	});// end $.getJSON

}

function fiMySchedule_returnHomeAction01(action, id) {
	var postData = {};
	postData.random = new Date();
	var userInfo = JSON.parse(session.get("userInfo"));
	postData.onlineStatus = userInfo.user.onlineStatus;
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	postData.action = action;
	postData.id = id;
	showLoading();
	// 执行家访
	$.getJSON(basePath + "/app/fiMySchedule/returnHomeAction.xhtml" + callback,
			postData, function(msg) {
				showHide();
				$("#fi_my_schedule_page").find('[identity="return-back-home"]').attr("enable","true");
				if ($.trim(msg.returnCode) == '0') {
					if (msg.data) {
						var data = msg.data;
						if (data.action == "unknown") {
							showMessage(msg.message, '1500');
						} else if (data.action == "start"
								&& data.result == "success") {
							// 成功开始返程
							showMessage(msg.message, '1500');
							queryReturnHomeRecord();
							// 刷新日程列表
							// var scheduleDate =
							// $('#fiCalendar').mobiscroll('getVal');
							// fiMySchedulePage_querySchedules(scheduleDate);
						} else if (data.action == "end"
								&& data.result == "success") {
							showMessage(msg.message, '1500');
							queryReturnHomeRecord();
							// 刷新日程列表
							// var scheduleDate =
							// $('#fiCalendar').mobiscroll('getVal');
							// fiMySchedulePage_querySchedules(scheduleDate);
							// 计算里程数
							var returnData = msg.data.dataMap;
							if (returnData != null) {

								var travelId = returnData.travelRecord.id;
								// 获取所有的点
								var lineArr = returnData.locationArray;
								coll_calculateDistance(travelId, lineArr);

							}
						}
					}
					console.log(msg.message);

				} else {
					errorHandler(msg.returnCode, msg.message);
					console.log(msg.message);
				}

			});// end $.getJSON
}

function fiMySchedule_deleteSchedule(scheduleType, scheduleId) {
	var postData = {};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	postData.scheduleType = scheduleType;
	postData.scheduleId = scheduleId;
	// 获取需要标注红点的日期
	$.ajax({
		url : basePath + "/app/fiMySchedule/deleteSchedule.xhtml" + callback, // 这个地址做了跨域处理
		data : postData,
		type : 'GET',
		dataType : 'json',
		async : false,
		beforeSend : function() {
			showLoading();
		},
		success : function(msg) {

			showHide();

			if ($.trim(msg.returnCode) == '0') {
				var data = msg.data;

			} else {
				errorHandler(msg.returnCode, msg.message);
			}
		},
		complete : function() {

		}
	});// end $.ajax
}
