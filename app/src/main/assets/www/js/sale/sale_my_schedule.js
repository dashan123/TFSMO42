var sale_my_schedule_page = $('#sale_my_schedule_page');
var sale_my_schedule_myScroll;

var usingPrivateCarForPubilcPurposeBtnClickDate = "";
/** ****************************home_page---begin************************************* */
sale_my_schedule_page.live('pageinit', function(e, ui) {

	var wrapper = "sale_my_schedule_wrapper";
	var up = "sale_my_schedule_pullUp";
	var down = "sale_my_schedule_pullDown";
	sale_my_schedule_myScroll = createMyScroll(wrapper, up, down);
	// //scroll位置
	// var scrollMapJSON = {};
	// scrollMapJSON.organizationid = organizationid;
	// scrollMap.contacts_dept_page = JSON.stringify(scrollMapJSON);
	// 回退事件处理
	sale_my_schedule_page.find(".BackBtn").live("tap", function(event) {
		event.stopPropagation();
		back_page('workbench_page');
	});

	// 添加日程按钮-->跳转到添加日程页面
	sale_my_schedule_page.find(".addButton4").live('tap',function() {

				// 获取当前选中的日期
				var scheduleDate = Format($('#saleCalendar').mobiscroll('getVal'), "yyyy-MM-dd");
				var currentDate = Format(new Date(), "yyyy-MM-dd");

				// 如果选中日期>当前日期，则允许跳转至添加日程页面
				if (scheduleDate >= currentDate) {
					session.set("scheduleDate", scheduleDate);
					// 跳转至添加普通日程画面
					goto_page("sale_schedule_add_page");
				} else {
					showMessage('选中日期小于当前日期，不能添加日程', '5000');
				}

			});

	// 日历初始化
	$('#saleCalendar').mobiscroll().calendar(
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
					saleMySchedulePage_queryScheduleDays(yearAndMonth, inst);
				},
				onDayChange : function(event, inst) {

					saleMySchedulePage_querySchedules(event.date);

				}
			});

	$('#saleCalendar').mobiscroll('setVal', new Date());

	// 私车公用按钮事件
	sale_my_schedule_page.find('[identity="usingPrivateCarForPubilcPurpose"]').live("tap",function(event) {
		
		//判断该次点击私车公用按钮时间与上一次点击时间间隔是否大于1s
		if(usingPrivateCarForPubilcPurposeBtnClickDate == ""){
			usingPrivateCarForPubilcPurposeBtnClickDate = Format(new Date(),"yyyy-MM-dd HH:mm:ss");
		}else{
			var date1=new Date(usingPrivateCarForPubilcPurposeBtnClickDate); //上次点击私车公用按钮的时间
			var dateFormat=Format(new Date(),"yyyy-MM-dd HH:mm:ss"); //本次点击私车公用按钮的时间
			var date2=new Date(dateFormat); //本次点击私车公用按钮的时间
			var date3=(date2.getTime()-date1.getTime())/1000;   //相差秒数
			
			usingPrivateCarForPubilcPurposeBtnClickDate = dateFormat;
			
			if(date3 < 1){
				return false;
			}
		}
		
		var actionText = $(this).find("[identity='actionText']").text();
		var message = actionText === "记录里程"?"您确定要开始记录里程吗？":"您确定要结束记录里程吗？";
		var $currentPage = $("#sale_my_schedule_page");
		var $actionButton = $currentPage.find('[identity="usingPrivateCarForPubilcPurpose"]');
		
		showConfirm(message, function(){
			/*//查看当前按钮是否不可用
			if($actionButton.attr("enable") === "false" ){
				console.log("不可用：");
				return;
			}
			else{
				$actionButton.attr("enable","false");//将按钮置为不可用。
				saleMySchedulePage_usingPrivateCarForPubilcPurposeAction($actionButton);
				console.log("可用：");
	//以下代码用于模拟测试		
//				console.log("可用：");
//				setTimeout(function(){
//					var $actionButton = $("#sale_my_schedule_page").find('[identity="usingPrivateCarForPubilcPurpose"]')
//					saleMySchedulePage_usingPrivateCarForPubilcPurposeAction($actionButton);
//				},5000);
			}*/
			
			//查看当前按钮是否不可用
			if($actionButton.attr("enable") === "true" ){
				$actionButton.attr("enable","false");//将按钮置为不可用。
				saleMySchedulePage_usingPrivateCarForPubilcPurposeAction($actionButton);
				console.log("可用：");
			}
			else{
				console.log("不可用：");
				return;
			}
		});
		
	});

});// end pageinit

sale_my_schedule_page.live('pageshow', function(e, ui) {

	// $('#saleCalendar').mobiscroll('setVal', new Date(2017, 1, 3));
	currentLoadActionName = "sale_my_schedule_load_content";
	
	// 私车公用 按钮状态初始化
	saleMySchedulePage_queryUsingPrivateCarForPubilcPurposeRecord();

	//防止断网导致 私车公用  按钮不可用
	$("#sale_my_schedule_page").find('[identity="usingPrivateCarForPubilcPurpose"]').attr("enable","true");
	
	// 当页面从普通日程详情查看，家访报告添加，家访报告查看，自定义任务详情查看页面返回时，不需刷新
	var fromPage = session.get("fromPage");
	if (fromPage != "sale_task_report_add_page") {
//		session.set("refreshFiMySchedulePage", "false");
		var inst = $('#saleCalendar').mobiscroll('getInst');
		var scheduleDate = $('#saleCalendar').mobiscroll('getVal');
		var yearAndMonth = Format(scheduleDate, "yyyy-MM");

		// 刷新标注红点
		saleMySchedulePage_queryScheduleDays(yearAndMonth, inst);

		// 进入时默认显示日程列表
		saleMySchedulePage_querySchedules(scheduleDate);
		// load_sale_my_schedule_content();
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
		// $('#sale_my_schedule_page').find('#sale_my_schedule_list').get(scrollCurrentElementIndex);
		// sale_my_schedule_myScroll.refresh();//刷新iScroll
		// sale_my_schedule_myScroll.scrollToElement(scrollCurrentElement,0);
	}
});// end pageshow

function sale_my_schedule_load_content() {
	// 下拉不刷新，则该方法置空
}

function saleMySchedulePage_querySchedules(scheduleDate) {

	var postData = {};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	postData.scheduleDate = Format(scheduleDate, "yyyy-MM-dd");
	// 查询日程列表
	$.ajax({
		url:basePath + "/app/saleMySchedule/querySchedules.xhtml"+ callback, // 这个地址做了跨域处理
		data : postData,
		type : 'GET',
		dataType : 'json',
		async : false,
		beforeSend : function() {
			showLoading();
		},
		success:function(msg){
			showHide();
			if ($.trim(msg.returnCode) == '0') {
				var $sale_my_schedule_list = $('#sale_my_schedule_list');
				$sale_my_schedule_list.empty();

				var data = msg.data;
				// 显示日程列表
				var $templateSaleSchedule = $('#sale_my_schedule_page').find("[template-id='sale-schedule']");
				$.each(data.saleSchedules,function(i, n) {
					
					var $saleScheduleItem = $templateSaleSchedule.clone(true);
					if(n.finishStatus === "YWC"){
						//日程列表项的标题栏置为灰色
						$saleScheduleItem.find("h2").css("background-color","#9c9898");
					}
					// 跳转至查看日程画面
					$saleScheduleItem.find("dd").bind("tap",function(event) {
						
						var saleScheduleId = $(this).find("[identity='saleScheduleId']").text();
						session.set("saleScheduleId",saleScheduleId);
						// 判断每个日程是否为已完成日程，如果为已完成日常则进行查看，否则进入修改日程画面
						var finishStatus = $(this).parent().find("[identity='finishStatus']").text();
						
						if(finishStatus=="YWC"){							
							goto_page("sale_schedule_view_page");
						}else{
							goto_page("sale_schedule_edit_page");
						}
					});
									
					dataBindToElement($saleScheduleItem, n);
					
					$saleScheduleItem.show();
					
					var scheduleTypeCode = $saleScheduleItem.find("[identity='scheduleTypeCode']").text();
					if(scheduleTypeCode == ConstDef.getConstant("DICTIONARY_CODE_SALE_DRM_VISIT_DEALER")){
						$saleScheduleItem.find("[identity='dealerName']").parent("p").show();
		        	}
					$('#sale_my_schedule_list').append($saleScheduleItem);
				});// end each

				$('#sale_my_schedule_list').mobiscroll().listview({
					
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
//											if (event.target
//													.getAttribute('template-id') != 'normal-schedule') {
//												return true;
//											}
										},
										action : function(event, inst) {
											var finishStatusText = $(event.target)
													.find("[identity='finishStatusText']")
													.text();
											if (finishStatusText != "未完成") {
												showMessage('日程已结束，不允许删除','5000');
												return true;
											}

											var scheduleType = event.target
													.getAttribute('template-id');

											if (scheduleType == "sale-schedule") {
												// 删除日程

												// 获取日程的Id
												var scheduleId = $(
														event.target)
														.find("[identity='saleScheduleId']")
														.text();

												saleMySchedule_deleteSchedule(scheduleType,scheduleId);
												inst.remove(event.target);
												return false;
											} 

											return false;
										}
									} ]
								});// end listview
			}
			else {
				errorHandler(msg.returnCode, msg.message);
			}
		},
		complete : function() {

		}
	});//end $.ajax
	
}

/**
 * 根据当前登录用户和日程日期查询日程列表
 * 
 * @param yearAndMonth
 *            示例格式：2017-01-01
 * @param inst
 *            Returns the object instance.
 */
function saleMySchedulePage_queryScheduleDays(yearAndMonth, inst) {
	
	var postData = {};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	postData.yearAndMonth = yearAndMonth;
	// 获取需要标注红点的日期
	$.ajax({
		url : basePath + "/app/saleMySchedule/queryScheduleDays.xhtml"+ callback, // 这个地址做了跨域处理
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
						d : new Date(data[i].scheduleDay), 
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

function saleMySchedulePage_usingPrivateCarForPubilcPurposeAction(actionButton) {

	var callBack = function(driveStatus) {

		// 获取当前所点击按钮所对应的日程类型(家访，自定义任务)，实地状态 WKS,JXZ,YJS，计划地址Id
		var fieldStatus = $(actionButton).find("span[identity='fieldStatus']").text();
		var id = $(actionButton).find("span[identity='id']").text();

		if (fieldStatus == "WKS" && driveStatus == false) {
			console.log("点击记录里程按钮,开始私车公用");
			saleMySchedule_usingPrivateCarForPubilcPurposeAction01("start", id);

		} else if (fieldStatus == "WKS" && driveStatus == true) {
			showMessage('无法开始私车公用，请确认是否有正在进行的其它地址！', '5000');
		} else if (fieldStatus == "JXZ" && driveStatus == true) {
			console.log("点击结束按钮,结束私车公用");
			saleMySchedule_usingPrivateCarForPubilcPurposeAction01("end", id);
		} else if (fieldStatus == "JXZ" && driveStatus == false) {
			console.log("ERROR");
		}
	};
	queryDriveStatus(callBack);
}

function saleMySchedulePage_queryUsingPrivateCarForPubilcPurposeRecord() {

	var postData = {};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	showLoading();

	$.getJSON(basePath + "/app/saleMySchedule/queryUsingPrivateCarForPubilcPurposeRecord.xhtml"
			+ callback, postData, function(msg) {
		showHide();
		if ($.trim(msg.returnCode) == '0') {
			if (msg.data) {
				var data = msg.data;
				// 初始化返回驻地状态显示
				var usingPrivateCarForPubilcPurposeRecord = data.usingPrivateCarForPubilcPurposeRecord;
				var $buttonUsingPrivateCarForPubilcPurpose = $("#sale_my_schedule_page").find(
						'[identity="usingPrivateCarForPubilcPurpose"]');
				// 如果已开始私车公用
				if (usingPrivateCarForPubilcPurposeRecord) {
					$buttonUsingPrivateCarForPubilcPurpose.children("[identity='actionText']").text(
							"结束");
					$buttonUsingPrivateCarForPubilcPurpose.find("img").attr("src",
							"images/tfsred/EndIcon1.png");
					$buttonUsingPrivateCarForPubilcPurpose.find("[identity='id']").text(
							usingPrivateCarForPubilcPurposeRecord.id);
					$buttonUsingPrivateCarForPubilcPurpose.find("[identity='fieldStatus']").text(
							"JXZ");
				} else {
					$buttonUsingPrivateCarForPubilcPurpose.children("[identity='actionText']").text(
							"记录里程");
					$buttonUsingPrivateCarForPubilcPurpose.find("img").attr("src",
							"images/tfsred/StaBtn.png");
					$buttonUsingPrivateCarForPubilcPurpose.find("[identity='fieldStatus']").text(
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

function saleMySchedule_usingPrivateCarForPubilcPurposeAction01(action, id) {
	var postData = {};
	postData.random = new Date();
	var userInfo = JSON.parse(session.get("userInfo"));
	postData.onlineStatus = userInfo.user.onlineStatus;
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	postData.action = action;
	postData.id = id;

	showLoading();
	// 私车公用
	$.getJSON(basePath + "/app/saleMySchedule/usingPrivateCarForPubilcPurposeAction.xhtml" + callback,
			postData, function(msg) {
				showHide();
				if ($.trim(msg.returnCode) == '0') {
					if (msg.data) {
						var data = msg.data;
						if (data.action == "unknown") {
							showMessage(msg.message, '5000');
						} else if (data.action == "start"
								&& data.result == "success") {
							// 成功开始私车公用
							showMessage(msg.message, '5000');

							saleMySchedulePage_queryUsingPrivateCarForPubilcPurposeRecord();
							
						} else if (data.action == "end"
								&& data.result == "success") {
							
							saleMySchedulePage_queryUsingPrivateCarForPubilcPurposeRecord();
							
//							showMessage(msg.message, '1500');
							// 计算里程数
							var returnData = msg.data.dataMap;
							if (returnData != null) {

								var travelId = returnData.travelRecord.id;
								// 获取所有的点
								var lineArr = returnData.locationArray;
								common_calculateDistance(travelId, lineArr);
								
//								setTimeout(function(){
//									
//									//跳转至行车记录页面
//									showMessage("成功结束私车公用，即将跳转至行车记录详情...", '2000');
//									session.set("travelRecordId",travelId);
//									setTimeout(function(){
//										goto_page("sale_travel_record_details_page");
//									},1000);
//								},1000);
//								
								
								session.set("travelRecordId",travelId);
								goto_page("sale_travel_record_details_page");
							}
							
						}
					}
					console.log(msg.message);

				} else {
					errorHandler(msg.returnCode, msg.message);
					console.log(msg.message);
				}
			
				$("#sale_my_schedule_page").find('[identity="usingPrivateCarForPubilcPurpose"]').attr("enable","true");
				
			});// end $.getJSON
}

function saleMySchedule_deleteSchedule(scheduleType, scheduleId) {
	var postData = {};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	postData.scheduleType = scheduleType;
	postData.scheduleId = scheduleId;
	
	$.ajax({
		url : basePath + "/app/saleMySchedule/deleteSchedule.xhtml" + callback, // 这个地址做了跨域处理
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
