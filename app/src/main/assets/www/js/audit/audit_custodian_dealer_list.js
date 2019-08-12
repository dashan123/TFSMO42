var audit_custodian_dealer_list_page = $('#audit_custodian_dealer_list_page');

var audit_custodian_dealer_list_myScroll;

//var auditCustodianDealerList_custodianMap = "";//监管单位信息
var auditCustodianDealerList_custodianLocationMap = {};//当前监管单位的经度和纬度
var auditCustodianDealerList_imageFlag = "";//该任务是否已自拍 --HaveTakePhotographs:已经自拍  DidNotTakePhotographs:尚未自拍
var auditCustodianDealerList_auditPlanDateFlg = 0;//盘点日期flag--1:任务的计划日期等于系统日期  2：任务的计划日期小于系统日期  3：任务的计划日期大于系统日期
var auditCustodianDealerList_custodianValidDistance = 0; // 监管单位有效范围
var auditCustodianDealerList_custodianValidDistanceInterval = 0; // 定时计算盘库人员距离监管单位距离时的间隔时间
var auditCustodianDealerList_dealerIdArrayIsExist = 0; // 监管单位监管经销商id是否存在（0：不存在  1：存在）
/******************************audit_custodian_dealer_list_page---begin**************************************/
audit_custodian_dealer_list_page.live('pageinit',function(e,ui){
	
	var wrapper = "audit_custodian_dealer_list_wrapper";
	var up = "audit_custodian_dealer_list_pullUp";
	var down = "audit_custodian_dealer_list_pullDown";
	audit_custodian_dealer_list_myScroll = createMyScroll(wrapper,up,down);
	
	//回退事件处理
	audit_custodian_dealer_list_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
//		auditCustodianDealerList_custodianMap = "";//监管单位信息
		auditCustodianDealerList_custodianLocationMap = {};//当前监管单位的经度和纬度
		auditCustodianDealerList_imageFlag = "";//该任务是否已自拍 --HaveTakePhotographs:已经自拍  DidNotTakePhotographs:尚未自拍
		auditCustodianDealerList_auditPlanDateFlg = 0;//盘点日期flag--1:任务的计划日期等于系统日期  2：任务的计划日期小于系统日期  3：任务的计划日期大于系统日期
		auditCustodianDealerList_custodianValidDistance = 0; // 监管单位有效范围
		auditCustodianDealerList_custodianValidDistanceInterval = 0; // 定时计算盘库人员距离监管单位距离时的间隔时间
		auditCustodianDealerList_dealerIdArrayIsExist = 0; // 监管单位监管经销商id是否存在（0：不存在  1：存在）
		
		back_page();
	});
	
	//点击盘点经销商列表事件处理
	audit_custodian_dealer_list_page.find(".auditCustodianDealerListContentDiv .auditCustodianDealer").live("tap",function(event){
		event.stopPropagation();
		
		var selectedItem = $('#audit_custodian_dealer_list_page').find(".auditCustodianDealerListContentDiv .auditCustodianDealer.auditCustodianDealerSelected");
		if(auditCustodianDealerList_imageFlag == "HaveTakePhotographs"){
			var selectedItem_auditListStatus = selectedItem.attr("auditListStatus");
			//盘点清单状态 0.未办 1.已办(正常完成任务) 2.跳过 3.进行中 4.DAS端完成 5.完成（更多按钮选项完成）
			if(selectedItem_auditListStatus == 1){
				selectedItem.css("background-color","red");
			}else if(selectedItem_auditListStatus == 3){
				selectedItem.css("background-color","green");
			}
		}
		selectedItem.removeClass("auditCustodianDealerSelected");
		
		$(this).css("background-color","");
		$(this).addClass("auditCustodianDealerSelected");
	});
	
	$("#audit_custodian_dealer_list_page").find("ul.bottoms2-red li").live("tap",function(){
		var page = $('#audit_custodian_dealer_list_page');
		var $toPage = $(this).attr("toPage");
		//任务状态(0.未办 1.已办 2.跳过 3.进行中 )
		var taskStatus = session.get("taskStatus");
		//page_from:转页来源页面（点击返回按钮时，此session值不改变）
		var page_from = session.get("page_from");
		//当前选中的经销商
		var selectedItem = page.find(".auditCustodianDealerListContentDiv div.auditCustodianDealerSelected");
		//选中经销商的dealerId
		var auditCustodianDealerList_selectedDealerId = selectedItem.attr("dealerId");
		session.set("auditCustodianDealerList_selectedDealerId",auditCustodianDealerList_selectedDealerId);
		//当前监管单位的经度和纬度
		session.set("auditCustodianDealerList_custodianLocationMap",JSON.stringify(auditCustodianDealerList_custodianLocationMap));
		
		if ($toPage == "audit_custodian_report_edit_qc_page") {
			//进入“合格证盘点”页面时的处理
			// 盘库库房有效范围
			session.set("auditCustodianValidDistance",auditCustodianDealerList_custodianValidDistance);
			// 定时计算盘库人员距离库房距离时的间隔时间
			session.set("auditCustodianValidDistanceInterval",auditCustodianDealerList_custodianValidDistanceInterval);
			
			//当前选中的经销商的code
			var dealerCode = selectedItem.find("span[identity='dealerCode']").text();
			session.set("auditCustodianDealerList_dealerCode",dealerCode);//当前选中的经销商的code
			//当前经销商的盘点清单id
			var auditCustodianDealerList_auditCheckListId = selectedItem.attr("auditCheckListId");
			session.set("auditCheckListId",auditCustodianDealerList_auditCheckListId);
			//盘点清单状态auditListStatus-- 0.未办 1.已办(正常完成任务) 2.跳过 3.进行中 4.DAS端完成 5.完成（更多按钮选项完成）
			var auditCustodianDealerList_auditListStatus = selectedItem.attr("auditListStatus");//当前经销商的盘点清单状态
			if(auditCustodianDealerList_auditListStatus == null){
				//当数据库中不存在该值时，盘点清单状态默认是“未办”状态
				//盘点清单状态 0.未办 1.已办(正常完成任务) 2.跳过 3.进行中 4.DAS端完成 5.完成（更多按钮选项完成）
				auditCustodianDealerList_auditListStatus = 0;
			}
			
			//page_from:转页来源页面（点击返回按钮时，此session值不改变）
			if(page_from =="audit_task_list_page" 
				|| page_from =="audit_done_task_list_page"){
				//从“盘库管理”或“已办任务”页面迁移到“盘库报告”页面的情况只能查看
				//盘点清单状态 0.未办 1.已办(正常完成任务) 2.跳过 3.进行中 4.DAS端完成 5.完成（更多按钮选项完成）
				if(auditCustodianDealerList_auditListStatus == 0){
					// 0.未办
					showMessage('该经销商尚未进行合格证盘点，无盘点报告！','5000');
					return;
				}else if(auditCustodianDealerList_auditListStatus == 1){
					//1.已办(正常完成任务) 
					goto_page("audit_custodian_report_view_page");
					
				}else if(auditCustodianDealerList_auditListStatus == 2){
					//2.跳过 
					showMessage('该经销商任务已跳过，无盘点报告','5000');
					return;
				}else if(auditCustodianDealerList_auditListStatus == 3){
					//3.进行中
					goto_page("audit_custodian_report_view_page");
					
				}else if(auditCustodianDealerList_auditListStatus == 4){
					//4.DAS端完成
					goto_page("audit_custodian_report_view_page");
					
				}else if(auditCustodianDealerList_auditListStatus == 5){
					//5.完成（更多按钮选项完成）
					showMessage('该经销商任务已完成（更多选项中完成），无盘点报告','5000');
					return;
				}
				
			}else{
				//从“我的日程”页面迁移到页面的情况
				//盘点清单状态 0.未办 1.已办(正常完成任务) 2.跳过 3.进行中 4.DAS端完成 5.完成（更多按钮选项完成）
				if(auditCustodianDealerList_auditListStatus == 0){
					// 0.未办
					//auditCustodianDealerList_auditPlanDateFlg 盘点日期flag--1:任务的计划日期等于系统日期  2：任务的计划日期小于系统日期  3：任务的计划日期大于系统日期
					if(auditCustodianDealerList_auditPlanDateFlg == 1){
						//任务状态(0.未办 1.已办 2.跳过 3.进行中 )
						if(taskStatus == 0){
							showMessage('请先自拍，再进行合格证盘点','5000');
							return;
						}else{
							goto_page($toPage);
						}
					}else if(auditCustodianDealerList_auditPlanDateFlg == 2){
						showMessage('该经销商未进行合格证盘点，无盘点报告！','5000');
						return;
					}else{
						showMessage('该任务计划日期大于当前日期，当前不能对该监管单位进行盘库！','5000');
						return;
					}
				}else if(auditCustodianDealerList_auditListStatus == 1){
					//1.已办(正常完成任务) 
					//auditCustodianDealerList_auditPlanDateFlg 盘点日期flag--1:任务的计划日期等于系统日期  2：任务的计划日期小于系统日期  3：任务的计划日期大于系统日期
					if(auditCustodianDealerList_auditPlanDateFlg == 1){
						goto_page($toPage);
						
					}else if(auditCustodianDealerList_auditPlanDateFlg == 2){
						goto_page("audit_custodian_report_view_page");
						
					}
				}else if(auditCustodianDealerList_auditListStatus == 2){
					//2.跳过 
					showMessage('该经销商任务已跳过，无盘点报告','5000');
					return;
				}else if(auditCustodianDealerList_auditListStatus == 3){
					//3.进行中
					//auditCustodianDealerList_auditPlanDateFlg 盘点日期flag--1:任务的计划日期等于系统日期  2：任务的计划日期小于系统日期  3：任务的计划日期大于系统日期
					if(auditCustodianDealerList_auditPlanDateFlg == 1){
						goto_page($toPage);
						
					}else if(auditCustodianDealerList_auditPlanDateFlg == 2){
						goto_page("audit_custodian_report_view_page");
						
					}
					
				}else if(auditCustodianDealerList_auditListStatus == 4){
					//4.DAS端完成
					goto_page("audit_custodian_report_view_page");
					
				}else if(auditCustodianDealerList_auditListStatus == 5){
					//5.完成（更多按钮选项完成）
					showMessage('该经销商任务已完成（更多选项中完成），无盘点报告','5000');
					return;
				}
			}
			
		} else if ($toPage == "audit_custodian_selfie_image_page") {
			//进入“自拍”页面时的处理
			var auditPlanDate = session.get("auditPlanDate");//盘点日期
			var auditPlanDayId = session.get("auditPlanDayId");//盘点计划日ID
			session.set("auditCustodianDealerList_businessId",auditPlanDayId);
			
			//auditCustodianDealerList_dealerIdArrayIsExist-- 监管单位监管经销商id是否存在（0：不存在  1：存在）
			if(auditCustodianDealerList_dealerIdArrayIsExist == 0){
				showMessage('监管单位监管的经销商不存在，不能自拍','5000');
				return;
			}
			
			// 获取定位信息
			onLocationBegin();
			var userCurrentLocation = {};
			userCurrentLocation.longitude= newLongitude; //经度
			userCurrentLocation.latitude = newLatitude;  //纬度
//			var userCurrentLocationTime = getFormatDate(new Date(),"yyyy-MM-dd hh:mm:ss");  //当前时间
			
			//任务状态(0.未办 1.已办 2.跳过 3.进行中 )
			//能进行自拍的条件：任务状态为“未办”
			if(taskStatus == 0){
				//page_from:转页来源页面（点击返回按钮时，此session值不改变）
				if(page_from =="audit_task_list_page"
					|| page_from =="audit_done_task_list_page"){
					
					showMessage('该监管单位的盘点任务未自拍，不能查看自拍照！','5000');
					return;
				}else{
					var userInfo = JSON.parse(session.get("userInfo"));
					//1.用户已签入
					if (ConstDef.getConstant("ONLINE_STATUS_SIGNIN") == userInfo.user.onlineStatus){
						//2.盘点（抽查）计划已经发布
						//状态(1.生成，2.提交，3.发布)
						var planStatus = session.get("planStatus");//状态(1.生成，2.提交，3.发布)
						if(planStatus == 3){
							//3.任务的计划日期 等于 服务器端的系统日期
							//auditCustodianDealerList_auditPlanDateFlg--1:任务的计划日期等于系统日期  2：任务的计划日期小于系统日期  3：任务的计划日期大于系统日期
							if(auditCustodianDealerList_auditPlanDateFlg == 1){
								//4.是否测试模式 1:开启 0:关闭
								if (session.get("testMode") != "1") {
									
									if($.isEmptyObject(auditCustodianDealerList_custodianLocationMap) 
											|| auditCustodianDealerList_custodianLocationMap.longitude == 0 
											|| auditCustodianDealerList_custodianLocationMap.latitude == 0
											|| auditCustodianDealerList_custodianLocationMap.longitude == "" 
											|| auditCustodianDealerList_custodianLocationMap.latitude == ""
											|| auditCustodianDealerList_custodianLocationMap.longitude == null 
											|| auditCustodianDealerList_custodianLocationMap.latitude == null
											|| auditCustodianDealerList_custodianLocationMap.longitude == undefined 
											|| auditCustodianDealerList_custodianLocationMap.latitude == undefined){
										
										showMessage("监管单位坐标未正确设置，不能自拍",'5000');
										return;
										
									}else if($.isEmptyObject(userCurrentLocation) 
											|| userCurrentLocation.longitude == 0 
											|| userCurrentLocation.latitude == 0
											|| userCurrentLocation.longitude == "" 
											|| userCurrentLocation.latitude == ""
											|| userCurrentLocation.longitude == null 
											|| userCurrentLocation.latitude == null
											|| userCurrentLocation.longitude == undefined 
											|| userCurrentLocation.latitude == undefined){
										showMessage("盘点员位置未取到，不能自拍",'5000');
										return;
										
									}else{
										//监管单位的有效范围内或者最后一次的坐标在有效范围内
										var func = function(distance){
											// 监管单位有效范围
											var commonDistance = auditCustodianDealerList_custodianValidDistance;
											if(distance != null && commonDistance != null){
												if(distance < commonDistance){
													goto_page($toPage);
												}else{
													showMessage("盘点员不在监管单位的有效范围内（"+commonDistance+"米），不能自拍",'5000');
												}
											}else{
												showMessage("盘点员位置未取到或网络连接出错，不能自拍",'5000');
											}
											
										}
										auditCustodianDealerListAuditCalculateDistance(userCurrentLocation,auditCustodianDealerList_custodianLocationMap,func);
									}
									
								}else{
									goto_page($toPage);
								}
							}else{
								showMessage("该监管单位盘点任务的计划日期不等于服务器端的当前系统日期，不能自拍",'5000');
							}
						}else{
							showMessage("该监管单位盘点任务计划未发布，不能自拍",'3000');
						}
					}else{
						showMessage('您没有签入，不能自拍','2000');
					}
				}
				
			}else if(taskStatus == 1 || taskStatus == 3){
				//任务状态(0.未办 1.已办 2.跳过 3.进行中 )
				//任务状态为"已办"、“进行中”时，,判断是否已自拍，若已自拍，则直接跳转到“自拍”页面，只能查看自拍照片，不能删除、重拍
				//auditCustodianDealerList_imageFlag  该任务是否已自拍 --HaveTakePhotographs:已经自拍  DidNotTakePhotographs:尚未自拍
				if(auditCustodianDealerList_imageFlag == "HaveTakePhotographs"){
					goto_page($toPage);
				}else{
					showMessage('该监管单位的盘点任务未自拍，不能查看自拍照！','5000');
					return;
				}
			}else if(taskStatus == 2){
				//任务状态(0.未办 1.已办 2.跳过 3.进行中 )
				//任务状态是“跳过”时，没有自拍照片。弹出提示信息“跳过该监管单位的盘点，没有自拍照片！”
				showMessage('该监管单位的盘点任务已跳过，没有自拍照片！','5000');
				return;
			}
		}
			
	});
});//end pageinit


audit_custodian_dealer_list_page.live('pageshow',function(e, ui){

	currentLoadActionName  = "audit_custodian_dealer_list_load_content";
	
	//初始化库房及盘点清单信息
	load_audit_custodian_dealer_list_content();
	
});//end pageshow

function audit_custodian_dealer_list_load_content(){
	//下拉不刷新，则该方法置空
}

//初始化库房及盘点清单信息
function load_audit_custodian_dealer_list_content() {
	
	var page = $('#audit_custodian_dealer_list_page');
	var $auditCustodianDealerList = page.find(".auditCustodianDealerListContentDiv .auditCustodianDealerListRow");
	$auditCustodianDealerList.empty();
	
	var fromPage = session.get("fromPage");
	var custodianCode = "";
	if(fromPage == "audit_schedule_page"){
		//从“我的日程页面”进入本页面
		custodianCode = session.get("auditSchedule_dealerCode");
		session.set("auditCustodianDealerList_custodianCode",custodianCode);
		
	}else if(fromPage == "audit_done_task_list_page"){
		//从“已办任务页面”进入本页面
		custodianCode = session.get("auditDoneTaskList_dealerCode");
		session.set("auditCustodianDealerList_custodianCode",custodianCode);
		
	}else if(fromPage == "audit_task_list_page"){
		//从“盘库管理页面”进入本页面
		custodianCode = session.get("auditTaskList_dealerCode");
		session.set("auditCustodianDealerList_custodianCode",custodianCode);
		
	}
	
	//选中经销商的dealerId
	var auditCustodianDealerList_selectedDealerId = session.get("auditCustodianDealerList_selectedDealerId");

	showLoading();
	var postData = {};
    postData.random = Math.random();
    postData.auditPlanDayId = session.get("auditPlanDayId");//盘点计划日ID
    postData.auditPlanDate = session.get("auditPlanDate");//盘点计划日期
    postData.custodianCode = session.get("auditCustodianDealerList_custodianCode");//监管单位code
    
	$.getJSON(basePath+"/app/auditCustodianDealerList/pageInit.xhtml"+callback, postData,function(msg){
		if($.trim(msg.returnCode) == '0'){
			if(msg.data != null){
				//该任务是否已自拍 --HaveTakePhotographs:已经自拍  DidNotTakePhotographs:尚未自拍
				auditCustodianDealerList_imageFlag = msg.data.imageFlag;
				//盘点日期flag--1:任务的计划日期等于系统日期  2：任务的计划日期小于系统日期  3：任务的计划日期大于系统日期
				auditCustodianDealerList_auditPlanDateFlg = msg.data.auditPlanDateFlg;
				//监管单位信息
				var auditCustodianDealerList_custodianMap = msg.data.custodianMap;
				if(auditCustodianDealerList_custodianMap != null
						&& auditCustodianDealerList_custodianMap.longitude != null 
						&& auditCustodianDealerList_custodianMap.latitude != null
						&& auditCustodianDealerList_custodianMap.longitude != undefined 
						&& auditCustodianDealerList_custodianMap.latitude != undefined
						&& auditCustodianDealerList_custodianMap.longitude != 0 
						&& auditCustodianDealerList_custodianMap.latitude != 0
						&& auditCustodianDealerList_custodianMap.longitude != "" 
						&& auditCustodianDealerList_custodianMap.latitude != ""){
						
					auditCustodianDealerList_custodianLocationMap.longitude = auditCustodianDealerList_custodianMap.longitude; //监管单位经度
					auditCustodianDealerList_custodianLocationMap.latitude = auditCustodianDealerList_custodianMap.latitude;  //监管单位纬度
				}
				// 盘库监管单位有效范围
				auditCustodianDealerList_custodianValidDistance = msg.data.auditUserToCustodianValidDistance;
		    	// 定时计算盘库人员距离监管单位距离时的间隔时间
				auditCustodianDealerList_custodianValidDistanceInterval = msg.data.auditUserToCustodianValidDistanceInterval;
				//监管单位监管的经销商列表
				var auditCustodianDealerList = msg.data.auditCustodianDealerList;
				
			    if(auditCustodianDealerList !=null){
			    	var dealerIdArray = [];
			    	//加载盘点报告列表
					var $template = $("#audit_custodian_dealer_list_page .auditCustodianDealerList_template");
					$.each(auditCustodianDealerList,function(i,n){
						dealerIdArray[i] = n.dealerId;
						
						var $item = $template.clone(true);
						//该任务是否已自拍 --HaveTakePhotographs:已经自拍  DidNotTakePhotographs:尚未自拍
						if(auditCustodianDealerList_imageFlag == "HaveTakePhotographs"){
							//盘点清单状态 0.未办 1.已办(正常完成任务) 2.跳过 3.进行中 4.DAS端完成 5.完成（更多按钮选项完成）
							if(n.auditListStatus == 1){
								$item.css("background-color","red");
							}else if(n.auditListStatus == 3){
								$item.css("background-color","green");
							}
						}
						$item.attr("auditListStatus",n.auditListStatus);
						$item.attr("auditCheckListId",n.auditCheckListId);
						$item.attr("dealerId",n.dealerId);
						
						dataBindToElement($item,n);
						
						$item.removeClass("auditCustodianDealerList_template");
						$item.css("display","");
						
						if(fromPage == "audit_schedule_page" 
							|| fromPage == "audit_done_task_list_page"
								|| fromPage == "audit_task_list_page"){
							if(i == 0){
								$item.css("background-color","");
								$item.addClass("auditCustodianDealerSelected");
							}
						}else{
							if(n.dealerId == auditCustodianDealerList_selectedDealerId){
								$item.css("background-color","");
								$item.addClass("auditCustodianDealerSelected");
							}
						}
						
						$auditCustodianDealerList.append($item);
						
					});//end $.each
					
					if(dealerIdArray != null && dealerIdArray != "" && dealerIdArray.length != 0){
						auditCustodianDealerList_dealerIdArrayIsExist = 1; // 监管单位监管经销商id是否存在（0：不存在  1：存在）
					}
					session.set("auditCustodianDealerList_dealerIdArray",JSON.stringify(dealerIdArray));
			    }
			    
			    showHide();
			}else {
		    	showHide();
		    }
			
    	}else{
	    	showHide();
	    	errorHandler(msg.returnCode,msg.message);
	    }
		
	});//end $.getJSON
}

function auditCustodianDealerListAuditCalculateDistance(startLocationMap,endLocationMap,func){
	var lineArr = new Array();
    lineArr.push([startLocationMap.longitude,startLocationMap.latitude]);//[经度，纬度]
    lineArr.push([endLocationMap.longitude,endLocationMap.latitude]);//[经度，纬度]
	
	var polyline = new AMap.Polyline({
		path:lineArr
	});
	//	polyline.setPath(lineArr);
	var distance = polyline.getLength();
	
	func(distance);
}