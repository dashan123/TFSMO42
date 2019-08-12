var audit_list_page = $('#audit_list_page');

var audit_list_myScroll;
//var auditListStoreHousesTop;

var auditListPage_systemCurrentDate = "";   // 服务器时间
var auditListPage_storehouseValidDistance = 0; // 盘库库房有效范围
var auditListPage_storehouseValidDistanceInterval = 0; // 定时计算盘库人员距离库房距离时的间隔时间
var auditListPage_auditPlanDateFlg = 0; //盘点日期flag--1:任务的计划日期等于系统日期  2：任务的计划日期小于系统日期  3：任务的计划日期大于系统日期
var auditListPage_sameDateAuditTaskFlag = 0;//抽查任务是否和其对应的盘点任务同一天--0：不在同一天  1：在同一天
var auditListFlag = 1;//盘点清单数据flag--0：盘点清单数据为空 1：盘点清单数据不为空
var auditListPage_dealerUtilized = 0;//贷款金额
var auditListPage_unitsStocked = 0;//车辆台数
var session_auditListDealerCode = "";//经销商CODE
var auditListPage_acknowledgeFlag = 0;//1:acknowledge 0:open

var auditListPage_storeHouseLocationJsonArr = [];//盘库经销商库房坐标JSONArray
/******************************audit_list_page---begin**************************************/
audit_list_page.live('pageinit',function(e,ui){
	
	var wrapper = "audit_list_wrapper";
	var up = "audit_list_pullUp";
	var down = "audit_list_pullDown";
	audit_list_myScroll = createMyScroll(wrapper,up,down);
	
	//回退事件处理
	audit_list_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		auditListPage_systemCurrentDate = "";   // 服务器时间
		auditListPage_storehouseValidDistance = 0; // 盘库库房有效范围
		auditListPage_storehouseValidDistanceInterval = 0; // 定时计算盘库人员距离库房距离时的间隔时间
		auditListPage_auditPlanDateFlg = 0; //盘点日期flag--1:任务的计划日期等于系统日期  2：任务的计划日期小于系统日期  3：任务的计划日期大于系统日期
		auditListPage_sameDateAuditTaskFlag = 0;//抽查任务是否和其对应的盘点任务同一天--0：不在同一天  1：在同一天
		auditListFlag = 1;//盘点清单数据flag--0：盘点清单数据为空 1：盘点清单数据不为空
		auditListPage_dealerUtilized = 0;//贷款金额
		auditListPage_unitsStocked = 0;//车辆台数
		session_auditListDealerCode = "";//经销商CODE
		auditListPage_acknowledgeFlag = 0;//1:acknowledge 0:open
		auditListPage_storeHouseLocationJsonArr = [];//盘库经销商库房坐标JSONArray
		
		back_page();
	});
	
	//车架号输入4位时 ，自动查询数据
	audit_list_page.find(".auditListVinNoDiv #vinNoText").live("keyup",function(event){
		event.stopPropagation();
		//查询盘点清单
		//车架号
		var $vinNoText = $('#audit_list_page').find(".auditListVinNoDiv #vinNoText");
		var vinNoText = $vinNoText.val();
		if($vinNoText.val().length >= 4){
			// 根据条件判断从何处查询取得盘点清单
			var taskType = session.get("taskType");//taskType：1.经销商盘库  2.监管单位盘库 3.抽查
			var auditPlanDayId = session.get("auditPlanDayId");//盘点计划日ID或者抽查计划的盘点计划日ID
			var auditPlanDate = session.get("auditPlanDate");//盘点计划日期或者抽查计划的盘点计划日期
			
			var relationAuditPlanDayId = "";//抽查任务对应盘点任务的盘点计划日ID
			var checkAuditDate = "";//抽查任务对应盘点任务的盘点日期
			if(taskType == 3){
				relationAuditPlanDayId = session.get("relationAuditPlanDayId");//抽查任务对应盘点任务的盘点计划日ID
				checkAuditDate = session.get("checkAuditDate");//抽查任务对应盘点任务的盘点日期
			}
			judgmentQueryAuditList(auditPlanDayId,auditListPage_auditPlanDateFlg
					,taskType,relationAuditPlanDayId,checkAuditDate);
		}
		
	});
	
	//点击搜索按钮，根据车架号文本框中的值，查询盘点清单数据
	audit_list_page.find(".auditListVinNoDiv #searchVinNo").live("tap",function(event){
		event.stopPropagation();
		// 根据条件判断从何处查询取得盘点清单
		var taskType = session.get("taskType");//taskType：1.经销商盘库  2.监管单位盘库 3.抽查
		var auditPlanDayId = session.get("auditPlanDayId");//盘点计划日ID或者抽查计划的盘点计划日ID
		var auditPlanDate = session.get("auditPlanDate");//盘点计划日期或者抽查计划的盘点计划日期
		
		var relationAuditPlanDayId = "";//抽查任务对应盘点任务的盘点计划日ID
		var checkAuditDate = "";//抽查任务对应盘点任务的盘点日期
		if(taskType == 3){
			relationAuditPlanDayId = session.get("relationAuditPlanDayId");//抽查任务对应盘点任务的盘点计划日ID
			checkAuditDate = session.get("checkAuditDate");//抽查任务对应盘点任务的盘点日期
		}
		judgmentQueryAuditList(auditPlanDayId,auditListPage_auditPlanDateFlg
				,taskType,relationAuditPlanDayId,checkAuditDate);
	});
	
	//点击清除按钮，删除检索条件车架号文本框中的所有字符
	audit_list_page.find(".auditListVinNoDiv #deleteVinNo").live("tap",function(event){
		event.stopPropagation();
		//查询盘点报告
		var $vinNoText = $('#audit_list_page').find(".auditListVinNoDiv #vinNoText");
		$vinNoText.val("");
		
		// 根据条件判断从何处查询取得盘点清单
		var taskType = session.get("taskType");//taskType：1.经销商盘库  2.监管单位盘库 3.抽查
		var auditPlanDayId = session.get("auditPlanDayId");//盘点计划日ID或者抽查计划的盘点计划日ID
		var auditPlanDate = session.get("auditPlanDate");//盘点计划日期或者抽查计划的盘点计划日期
		
		var relationAuditPlanDayId = "";//抽查任务对应盘点任务的盘点计划日ID
		var checkAuditDate = "";//抽查任务对应盘点任务的盘点日期
		if(taskType == 3){
			relationAuditPlanDayId = session.get("relationAuditPlanDayId");//抽查任务对应盘点任务的盘点计划日ID
			checkAuditDate = session.get("checkAuditDate");//抽查任务对应盘点任务的盘点日期
		}
		judgmentQueryAuditList(auditPlanDayId,auditListPage_auditPlanDateFlg
				,taskType,relationAuditPlanDayId,checkAuditDate);
	});
	
	$("#audit_list_page #auditListBottomsUl li").live("tap",function(){
		var $id = $(this).attr("id");
		var $toPage = $(this).attr("toPage");
		//盘点任务的盘点清单状态 或 同日抽查任务对应盘点任务的盘点清单状态
		var $auditListStatus = $("#audit_list_page #auditListContentUl").attr("auditListStatus");
		//盘点任务的盘点清单ID 或 同日抽查任务对应盘点任务的盘点清单ID
		var $auditCheckListId = $("#audit_list_page #auditListContentUl").attr("auditCheckListId");
		//盘点任务的盘库报告ID（DAS) 或 同日抽查任务对应盘点任务的盘库报告ID（DAS)
		var $dasAuditReportId = $("#audit_list_page #auditListContentUl").attr("dasAuditReportId");
		//生成盘库报告的人员userId
		var $reportAuditorId = $("#audit_list_page #auditListContentUl").attr("reportAuditorId");
		//盘点清单的提交状态
		var $submitStatus = $("#audit_list_page #auditListContentUl").attr("submitStatus");
		
		//抽查任务的盘点清单ID、盘点清单状态、生成盘库报告的人员userId（不是其对应盘点任务的）
		var	$checkAuditCheckListId = $("#audit_list_page #auditListContentUl").attr("checkAuditCheckListId");
		var	$checkAuditListStatus = $("#audit_list_page #auditListContentUl").attr("checkAuditListStatus");
		var	$checkReportAuditorId = $("#audit_list_page #auditListContentUl").attr("checkReportAuditorId");
		
		//taskType：1.经销商盘库  2.监管单位盘库 3.抽查
		var taskType = session.get("taskType");
		
		session.set("auditListStatus",$auditListStatus);//盘点任务的盘点清单状态 或 同日抽查任务对应盘点任务的盘点清单状态
		session.set("checkAuditListStatus",$checkAuditListStatus);//同日抽查任务的盘点清单状态
		session.set("reportAuditorId",$reportAuditorId);//生成盘库报告的人员userId
		session.set("checkReportAuditorId",$checkReportAuditorId);//生成盘库报告的人员userId
		
		if($id == "auditList_dealerInfo-show"){
			queryAuditListDealerInfo();
			return false;
		}else{
			//任务的计划日期 大于等于 系统日期 
			var auditPlanDate = session.get("auditPlanDate");
//			var systemCurrentDate = auditListPage_systemCurrentDate;
			//editAuditCheckReportFlg--1:任务的计划日期等于系统日期  2：任务的计划日期小于系统日期  3：任务的计划日期大于系统日期
//			var editAuditCheckReportFlg = auditListPage_auditPlanDateFlg;
			//盘点日期flag--1:任务的计划日期等于系统日期  2：任务的计划日期小于系统日期  3：任务的计划日期大于系统日期
			session.set("auditPlanDateFlg",auditListPage_auditPlanDateFlg);
			
			//当前食堂的经度和纬度
//			var $currentDealerStorehouse = $("#audit_list_page #auditListDealerStorehouseList").find(".dealerStorehouseSelected");
//			var storeHouseLocationMap = {};
//			storeHouseLocationMap.longitude = $currentDealerStorehouse.find("span[identity='longitude']").text();  //经度
//			storeHouseLocationMap.latitude = $currentDealerStorehouse.find("span[identity='latitude']").text();   //纬度
//			session.set("storeHouseLocationMap",JSON.stringify(storeHouseLocationMap));
			session.set("storeHouseLocationMap",JSON.stringify(auditListPage_storeHouseLocationJsonArr));
			
			// 盘库库房有效范围
			session.set("auditStorehouseValidDistance",auditListPage_storehouseValidDistance);
			// 定时计算盘库人员距离库房距离时的间隔时间
			session.set("auditStorehouseValidDistanceInterval",auditListPage_storehouseValidDistanceInterval);
			//经销商库房ID
			var storehouseId = $('#audit_list_page').find(".dealerStorehouseSelected [identity='storehouseId']").text();
			session.set("auditList_storehouseId",storehouseId);
			//经销商库房是否收费
			var chargeFlag = $('#audit_list_page').find(".dealerStorehouseSelected [identity='chargeFlag']").text();
			session.set("charge_flag",chargeFlag);
			
			//page_from:转页来源页面（点击返回按钮时，此session值不改变）
			var page_from = session.get("page_from");
			//盘点任务id
			var auditPlanDayId = session.get("auditPlanDayId");
			
			if($toPage == "audit_report_edit_qc_page"){
				//经销商库房是否默认库房
				var defaultFlag = $('#audit_list_page').find(".dealerStorehouseSelected [identity='defaultFlag']").text();
				session.set("auditList_defaultFlag",defaultFlag);
				session.set("submitStatus",$submitStatus);
				
				//auditListStatus_qc、auditCheckListId_qc只在此if语句中使用，防止来回重复点击时出错
				var auditListStatus_qc = $auditListStatus;
				var auditCheckListId_qc = $auditCheckListId;
				//page_from:转页来源页面（点击返回按钮时，此session值不改变）
				if(page_from =="audit_task_list_page"){
					//盘点清单状态 0.未办 1.已办(正常完成任务) 2.跳过 3.进行中 4.DAS端完成 5.完成（更多按钮选项完成）
					if(auditListStatus_qc == 0){
						showMessage('该任务尚未进行合格证盘点','2000');
						return;
					}
				}
				
				//1:acknowledge 0:open
				if(auditListPage_acknowledgeFlag == 1){
					showMessage('该报告已经acknowledge，不能进入合格证盘点页面','2000');
					return;
				}
				
				//taskType：任务类型--1.经销商盘库  2.监管单位盘库 3.抽查
				//auditListPage_sameDateAuditTaskFlag ：抽查任务是否和其对应的盘点任务同一天--0：不在同一天  1：在同一天
				if(taskType == 3 && auditListPage_sameDateAuditTaskFlag == 1){
					//同日抽查任务判断抽查任务对应的盘点任务的盘点清单ID是否存在
					if(auditCheckListId_qc == null || auditCheckListId_qc == ""){
						showMessage('该抽查任务对应的盘点任务尚未进行盘点','2000');
						return;
					}
					//将同日抽查任务的盘点清单状态赋值给变量，用于判断是否已进行盘点
					auditListStatus_qc = $checkAuditListStatus;
				}else{
					if(auditCheckListId_qc == null || auditCheckListId_qc == ""){
						showMessage('请先自拍，再进行盘点','2000');
						return;
					}
				}
					
				session.set("auditCheckListId",auditCheckListId_qc);
				session.set("dasAuditReportId",$dasAuditReportId);
				
				//盘点清单状态 0.未办 1.已办(正常完成任务) 2.跳过 3.进行中 4.DAS端完成 5.完成（更多按钮选项完成）
				if(auditListStatus_qc == 0){
					showMessage('请先自拍，再进行盘点','2000');
				}else if(auditListStatus_qc == 2){
					showMessage('该任务已跳过，无盘点报告','2000');
				}else if(auditListStatus_qc == 4){
//					showMessage('该任务在DAS端完成，无盘点报告','2000');
					goto_page("audit_report_view_done_page");
				}else{
					//page_from:转页来源页面（点击返回按钮时，此session值不改变）
					if(page_from =="audit_task_list_page"){
						//从“盘库管理”页面迁移到“盘库报告”页面时只能查看
						//盘点日期flag--1:任务的计划日期等于系统日期  2：任务的计划日期小于系统日期  3：任务的计划日期大于系统日期
						if(auditListPage_auditPlanDateFlg == 2 && auditListStatus_qc == 1){
							goto_page("audit_report_view_done_page");
						}else{
							goto_page("audit_report_view_page");
						}
					}else{
						if(auditListPage_auditPlanDateFlg == 1){
							if(taskType == 1){
								goto_page($toPage);
							}else if(taskType == 3){
								//查询该抽查任务和其对应的盘点任务是否在同一日
								querySameDateAuditTaskByCheckTask(auditPlanDayId,auditPlanDate,$toPage);
							}else{
								showMessage('该任务为监管单位盘库，线下维护盘点清单','2000');
							}
						}else if(auditListPage_auditPlanDateFlg == 2){
							if(auditListStatus_qc == 1){
								goto_page("audit_report_view_done_page");
							}else{
								goto_page("audit_report_view_page");
							}
						}else{
							showMessage('当前不能对该库房进行盘点','2000');
						}
					}
				}
			}
			else if($toPage == "audit_report_edit_page"){
				
				//auditListStatus_reportEdit、auditCheckListId_reportEdit只在此if语句中使用，防止来回重复点击时出错
				var auditListStatus_reportEdit = $auditListStatus;
				var auditCheckListId_reportEdit = $auditCheckListId;
				
				//page_from:转页来源页面（点击返回按钮时，此session值不改变）
				if(page_from =="audit_task_list_page"){
					//盘点清单状态 0.未办 1.已办(正常完成任务) 2.跳过 3.进行中 4.DAS端完成 5.完成（更多按钮选项完成）
					if(auditListStatus_reportEdit == 0){
						showMessage('该任务尚未进行车辆盘点','2000');
						return;
					}
				}
				
				//1:acknowledge 0:open
				if(auditListPage_acknowledgeFlag == 1){
					showMessage('该报告已经acknowledge，不能进入车辆盘点页面','2000');
					return;
				}
				
				//taskType：任务类型--1.经销商盘库  2.监管单位盘库 3.抽查
				//auditListPage_sameDateAuditTaskFlag ：抽查任务是否和其对应的盘点任务同一天--0：不在同一天  1：在同一天
				if(taskType == 3 && auditListPage_sameDateAuditTaskFlag == 1){
					//同日抽查任务判断抽查任务对应的盘点任务的盘点清单ID是否存在，
					if(auditCheckListId_reportEdit == null || auditCheckListId_reportEdit == ""){
						showMessage('该抽查任务对应的盘点任务尚未进行盘点','2000');
						return;
					}
					//将同日抽查任务的盘点清单状态赋值给变量，用于判断是否已进行盘点
					auditListStatus_reportEdit = $checkAuditListStatus;
				}else{
					if(auditCheckListId_reportEdit == null || auditCheckListId_reportEdit == ""){
						showMessage('请先自拍，再进行盘点','2000');
						return;
					}
					
				}
				
				session.set("auditCheckListId",auditCheckListId_reportEdit);
				session.set("dasAuditReportId",$dasAuditReportId);
				
				//盘点清单状态 0.未办 1.已办(正常完成任务) 2.跳过 3.进行中 4.DAS端完成 5.完成（更多按钮选项完成）
				if(auditListStatus_reportEdit == 0){
					showMessage('请先自拍，再进行盘点','2000');
				}else if(auditListStatus_reportEdit == 2){
					showMessage('该任务已跳过，无盘点报告','2000');
				}else if(auditListStatus_reportEdit == 4){
//					showMessage('该任务在DAS端完成，无盘点报告','2000');
					goto_page("audit_report_view_done_page");
				}else{
					//page_from:转页来源页面（点击返回按钮时，此session值不改变）
					if(page_from =="audit_task_list_page"){
						//从“盘库管理”页面迁移到“盘库报告”页面时只能查看
						//盘点日期flag--1:任务的计划日期等于系统日期  2：任务的计划日期小于系统日期  3：任务的计划日期大于系统日期
						if(auditListPage_auditPlanDateFlg == 2 
								&& auditListStatus_reportEdit == 1){
							goto_page("audit_report_view_done_page");
						}else{
							goto_page("audit_report_view_page");
						}
					}else{
						if(auditListPage_auditPlanDateFlg == 1){
							if(taskType == 1){
								session.set("submitStatus",$submitStatus);
								goto_page($toPage);
							}else if(taskType == 3){
								//查询该抽查任务和其对应的盘点任务是否在同一日
								querySameDateAuditTaskByCheckTask(auditPlanDayId,auditPlanDate,$toPage);
							}else{
								showMessage('该任务为监管单位盘库，线下维护盘点清单','2000');
							}
						}else if(auditListPage_auditPlanDateFlg == 2){
							if(auditListStatus_reportEdit == 1){
								goto_page("audit_report_view_done_page");
							}else{
								goto_page("audit_report_view_page");
							}
						}else{
							showMessage('当前不能对该库房进行盘点','2000');
						}
					}
				}
			}
			else if($toPage == "audit_selfie_image_page"){
				session.set("functionFlag","1")
				//auditListStatus_selfieImage、auditCheckListId_selfieImage只在此if语句中使用，防止来回重复点击时出错
				var auditListStatus_selfieImage = $auditListStatus;
				var auditCheckListId_selfieImage = $auditCheckListId;//盘点任务的盘点清单ID 或 抽查任务对应盘点任务的盘点清单ID
				
				if(storehouseId == "" || storehouseId == null){
					showMessage('经销商库房信息不存在，不能自拍','2000');
					return;
				}
				
				//1:acknowledge 0:open
				if(auditListPage_acknowledgeFlag == 1){
					showMessage('该报告已经acknowledge，不能自拍','2000');
					return;
				}
				//auditListPage_sameDateAuditTaskFlag ：抽查任务是否和其对应的盘点任务同一天--0：不在同一天  1：在同一天
				if(taskType == 3 && auditListPage_sameDateAuditTaskFlag == 1){
					 /*同日抽查
						盘点清单id设置为抽查任务的盘点清单id（非其对应的盘库任务的 ）
						盘点清单状态设置为抽查任务的盘点清单（非其对应的盘库任务的 ）--盘点清单状态 0.未办 1.已办(正常完成任务) 2.跳过 3.进行中 4.DAS端完成 5.完成（更多按钮选项完成）
					*/
					auditCheckListId_selfieImage = $checkAuditCheckListId;
					auditListStatus_selfieImage = $checkAuditListStatus;
				}else{
					//盘点任务或非同日的抽查任务
					if(taskType == 1 || (taskType == 3 && auditListPage_sameDateAuditTaskFlag == 0)){
						//经销商盘库或者隔日抽查,盘点清单数据为空时，不能自拍生成盘点报告
						//auditListFlag  盘点清单数据flag--0：盘点清单数据为空 1：盘点清单数据不为空
						if(auditListFlag == 0){
							showMessage('盘点清单数据为空，不能自拍','2000');
							return;
						}
					}
					
				}
				session.set("auditList_businessId",auditCheckListId_selfieImage);
				
				//盘点清单状态 0.未办 1.已办(正常完成任务) 2.跳过 3.进行中 4.DAS端完成 5.完成（更多按钮选项完成）
				//能进行自拍的条件：
				//库房的任务状态是“未办”或盘点清单表中无数据时
				if(auditListStatus_selfieImage == 0 || auditListStatus_selfieImage == ""){
					//page_from:转页来源页面（点击返回按钮时，此session值不改变）
					if(page_from =="audit_task_list_page"){
						showMessage('该任务尚未拍照','2000');
						return;
					}
					//1.1任务的计划日期 等于 服务器端的系统日期
					//auditListPage_auditPlanDateFlg--1:任务的计划日期等于系统日期  2：任务的计划日期小于系统日期  3：任务的计划日期大于系统日期
					if(auditListPage_auditPlanDateFlg == 1){
						// 获取定位信息
						onLocationBegin();
						var userCurrentLocation = {};
						userCurrentLocation.longitude= newLongitude; //经度
						userCurrentLocation.latitude = newLatitude;  //纬度
						
//						var userCurrentLocationTime = getFormatDate(new Date(),"yyyy-MM-dd hh:mm:ss");  //当前时间
						
						//1.4盘点（抽查）计划已经发布
						//状态(1.生成，2.提交，3.发布)
						var planStatus = session.get("planStatus");
						if(planStatus == 3){
							var userInfo = JSON.parse(session.get("userInfo"));
							if (ConstDef.getConstant("ONLINE_STATUS_SIGNIN") == userInfo.user.onlineStatus) {
								//是否测试模式 1:开启 0:关闭
								if (session.get("testMode") != "1") {
									
									//1.3经销商的有效范围内或者最后一次的坐标在有效范围内
									if($.isEmptyObject(userCurrentLocation) 
											|| userCurrentLocation.longitude == 0 || userCurrentLocation.latitude == 0
											|| userCurrentLocation.longitude == "" || userCurrentLocation.latitude == ""
											|| userCurrentLocation.longitude == null || userCurrentLocation.latitude == null
											|| userCurrentLocation.longitude == "null" || userCurrentLocation.latitude == "null"
											|| userCurrentLocation.longitude == undefined || userCurrentLocation.latitude == undefined){
										showMessage("盘点员位置未取到，不能自拍",'5000');
										return;
										
									}else{
										if(auditListPage_storeHouseLocationJsonArr != null 
												&& auditListPage_storeHouseLocationJsonArr.length > 0){
											
											// 盘库库房有效范围
											var commonDistance = auditListPage_storehouseValidDistance;
											//库房坐标是否设置（0：存在库房坐标 1：库房的所有坐标都未设置）
											var storeHouseLocationExistFlag = 1;
											//盘库库房有效范围及盘点人员距离库房的距离是否同时存在（0：存在  1：不存在）
											var auditDistanceExistFlag = 1;
											//是否在库房的有效范围内（0:存在坐标在有效返回内  1：所有坐标都不在有效范围内）--盘库时一个库房可能分为几块，设置多个坐标
											var auditDistanceFlag = 1;
											for(var i=0;i<auditListPage_storeHouseLocationJsonArr.length;i++){
												var auditListPage_storeHouseLocationMap = auditListPage_storeHouseLocationJsonArr[i];
												if(!$.isEmptyObject(auditListPage_storeHouseLocationMap) 
														&& auditListPage_storeHouseLocationMap.longitude != 0 && auditListPage_storeHouseLocationMap.latitude != 0
														&& auditListPage_storeHouseLocationMap.longitude != "" && auditListPage_storeHouseLocationMap.latitude != ""
														&& auditListPage_storeHouseLocationMap.longitude != null && auditListPage_storeHouseLocationMap.latitude != null
														&& auditListPage_storeHouseLocationMap.longitude != undefined && auditListPage_storeHouseLocationMap.latitude != undefined){
													//库房坐标是否设置（0：存在库房坐标 1：库房的所有坐标都未设置）
													storeHouseLocationExistFlag = 0;
													
													// 盘点员距离库房的距离
													var distance = auditListPageAuditCalculateDistance(userCurrentLocation,auditListPage_storeHouseLocationMap);
													if(distance != null && commonDistance != null){
														//盘库库房有效范围及盘点人员距离库房的距离是否同时存在（0：存在  1：不存在）
														auditDistanceExistFlag = 0;
														
														if(distance < commonDistance){
															//是否在库房的有效范围内（0:存在坐标在有效返回内  1：所有坐标都不在有效范围内）--盘库时一个库房可能分为几块，设置多个坐标
															auditDistanceFlag = 0;
															
															goto_page($toPage);
															break;
														}
													}
												}
											}
											
											//库房坐标是否设置（0：存在库房坐标 1：库房的所有坐标都未设置）
											if(storeHouseLocationExistFlag == 1){
												showMessage("库房坐标未设置，不能自拍",'5000');
												return;
											}
											if(auditDistanceExistFlag == 1){
												showMessage("盘点员位置未取到或网络连接出错，不能自拍",'5000');
												return;
											}
											//是否在库房的有效范围内（0:存在坐标在有效返回内  1：所有坐标都不在有效范围内）--盘库时一个库房可能分为几块，设置多个坐标
											if(auditDistanceFlag == 1){
												showMessage("盘点员不在库房的有效范围内（"+commonDistance+"米），不能自拍",'5000');
												return;
											}
										}else{
											showMessage("库房坐标未设置，不能自拍",'5000');
											return;
										}
									} 
									
								}else{
									goto_page($toPage);
								}
								
							}else{
								showMessage('您没有签入，不能自拍','2000');
							}
							
						}else{
							showMessage("任务计划未发布，不能自拍",'2000');
						}
						
					}else{
						showMessage("任务的计划日期不等于服务器端的系统日期，不能自拍",'3000');
					}
					
				}
				else if(auditListStatus_selfieImage == 1 || auditListStatus_selfieImage == 3 
						|| auditListStatus_selfieImage == 5){
					//库房的任务状态是“进行中”、“已办”、完成（更多按钮选项完成）时，跳转到“自拍”页面，只能查看自拍照片，不能删除、重拍
//					$toPage = "common_business_pictures_view_page";
					goto_page($toPage);
				}else if(auditListStatus_selfieImage == 2){
					//库房的任务状态是“跳过”时，没有自拍照片。弹出提示信息“跳过该库房的盘点，没有自拍照片！”
					showMessage('跳过该库房的盘点，没有自拍照片','2000');
				}else if(auditListStatus_selfieImage == 4){
					//库房的任务状态是“DAS端完成”时，没有自拍照片。弹出提示信息“DAS端完成的盘点报告！”
					showMessage('DAS端完成的盘点报告','2000');
				}
				
			}else if($toPage == "audit_electronic_signature_page"){
				
				var auditCheckListId_electronicSignature = $auditCheckListId;
				if(auditCheckListId_electronicSignature == null 
						|| auditCheckListId_electronicSignature == ""){
					showMessage('请先自拍，再进行电子签章','3000');
					return;
				}
				
				var $auditListUlItem = $("#audit_list_page #auditListContentUl .auditListUl");
				if($auditListUlItem.length <= 0){
					showMessage('车辆数据不存在，不用电子签章','3000');
					return;
				}else{
					if($($auditListUlItem[0]).attr("auditCheckReportId") == ""){
						showMessage('请先提交报告，再进行电子签章','3000');
						return;
					}
				}
				var storehouseAddress = $('#audit_list_page').find(".dealerStorehouseSelected [identity='storehouseAddress']").text();
				session.set("storehouseAddress",storehouseAddress);
				session.set("auditCheckListId",auditCheckListId_electronicSignature);
				session.remove("submitStatus");
				session.set("submitStatus",$submitStatus);
				goto_page("audit_electronic_signature_page")
			}
			
		}
		
	});
	
	//显示库房列表时，如果有收费的店外存放地，则在库房地址后面显示按钮【拍照】，点击后，可以对收费确认书进行拍照上传
	audit_list_page.find(".auditListDealerStorehouseList [identity='chargeStorehousePhotoBtn']").live("tap",function(event){
		event.stopPropagation();
//		var dealerCode = $(this).find("[identity='dealerCode']").text();
		var $auditCheckListId = $("#audit_list_page #auditListContentUl").attr("auditCheckListId");
		var $submitStatus = $("#audit_list_page #auditListContentUl").attr("submitStatus");
		var auditCheckListId_selfieImage = $auditCheckListId;
		var taskType = session.get("taskType");
		var taskStatus = session.get("taskStatus");
		var	$checkAuditCheckListId = $("#audit_list_page #auditListContentUl").attr("checkAuditCheckListId");
		if(taskType == 3 && auditListPage_sameDateAuditTaskFlag == 1){
			auditCheckListId_selfieImage = $checkAuditCheckListId;
		}
		session.set("businessId",auditCheckListId_selfieImage);
		session.set("businessType",ConstDef.getConstant("BUSINESS_CATEGORY_AUDIT"))
		session.set("functionFlag","2");
		session.set("submitStatus",$submitStatus);
		
		if($submitStatus=="3" || $submitStatus=="4" || taskStatus=="1"){
			goto_page("common_business_pictures_view_page");
		}else if(taskStatus=="0"){
			showMessage("请先自拍,再进行收费确认书拍照", '3000');
		}else{
			goto_page("common_business_pictures_edit_page");
		}
	});
});//end pageinit


audit_list_page.live('pageshow',function(e, ui){

//	auditListStoreHousesTop = 35;
	currentLoadActionName  = "audit_list_load_content";
	
	// 监管单位的盘点不考虑电子签章；在APP端选择“跳过、DAS端完成”的盘点不考虑电子签章
	var taskType = session.get("taskType");//taskType：1.经销商盘库  2.监管单位盘库 3.抽查
	if(taskType == 2){
		$("#audit_list_page").find("#auditListBottomsUl li[topage='audit_electronic_signature_page']").css("display","none");
		$("#audit_list_page").find("#auditListBottomsUl").attr("class","bottoms4-red");
	}else{
		$("#audit_list_page").find("#auditListBottomsUl li[topage='audit_electronic_signature_page']").css("display","");
		$("#audit_list_page").find("#auditListBottomsUl").attr("class","bottoms5-red");
	}
//	audit_electronic_signature_page();
	//初始化库房及盘点清单信息
	load_audit_list_content();
	
});//end pageshow

function audit_electronic_signature_page(){
	
}

function audit_list_load_content(){
	//下拉不刷新，则该方法置空
}

//初始化库房及盘点清单信息
function load_audit_list_content() {
	var page = $('#audit_list_page');
	
	var taskType = session.get("taskType");//taskType：1.经销商盘库  2.监管单位盘库 3.抽查
	var auditPlanDayId = session.get("auditPlanDayId");//盘点计划日ID或者抽查计划的盘点计划日ID
	var auditPlanDate = session.get("auditPlanDate");//盘点计划日期或者抽查计划的盘点计划日期
	
	var relationAuditPlanDayId = "";//抽查任务对应盘点任务的盘点计划日ID
	var checkAuditDate = "";//抽查任务对应盘点任务的盘点日期
	if(taskType == 3){
		relationAuditPlanDayId = session.get("relationAuditPlanDayId");//抽查任务对应盘点任务的盘点计划日ID
		checkAuditDate = session.get("checkAuditDate");//抽查任务对应盘点任务的盘点日期
	}
	
	//初始化更多按钮选项
	auditList_moreBtnClick(taskType);
	
	var fromPage = session.get("fromPage");
	if (fromPage != "audit_report_edit_page"
			&& fromPage != "audit_report_edit_qc_page"
			&& fromPage != "audit_report_view_page"
			&& fromPage != "audit_report_view_done_page"
			&& fromPage != "audit_selfie_image_page"
			&& fromPage != "common_business_pictures_edit_page"
			&& fromPage != "common_business_pictures_view_page"
			&& fromPage != "audit_electronic_signature_page") {

		var auditListDealerStorehouseList = $("#audit_list_page").find(
				"#auditListDealerStorehouseList");
		auditListDealerStorehouseList.empty();
		
		auditListPage_storeHouseLocationJsonArr = [];//盘库经销商库房坐标JSONArray
		
		//经销商CODE
		if(fromPage == "audit_done_task_list_page"){
			
			session_auditListDealerCode = session.get("auditDoneTaskList_dealerCode");
			session.remove("auditDoneTaskList_dealerCode");
			
		}else if(fromPage == "audit_task_list_page"){
			
			session_auditListDealerCode = session.get("auditTaskList_dealerCode");
			session.remove("auditTaskList_dealerCode");
//			//若是从“盘库管理”转页到的“盘点清单页面”，设置session记录转页页面；返回到上一页面时清楚此session
//			session.set("fromPageToAuditListPage",fromPage);
			
		}else if(fromPage == "audit_schedule_page"){
			
			session_auditListDealerCode = session.get("auditSchedule_dealerCode");
			session.remove("auditSchedule_dealerCode");
			
		}else{
			session_auditListDealerCode = session.get("audit_dealerCode");//现在无此session，以后再增加页面时可以用
			session.remove("audit_dealerCode");
		}
		session.set("auditListDealerCode",session_auditListDealerCode);
//		session.set("dealerAbbreviation",$("[identity='dealerAbbreviation']").text());
		
		//根据任务状态、任务类型，判断从何处查询经销商库房信息及盘点清单信息
		judgmentQueryStoreHouses(auditPlanDayId,auditPlanDate,session_auditListDealerCode,
				taskType,relationAuditPlanDayId,checkAuditDate);
	
	}else{
		// 根据条件判断从何处查询取得盘点清单
		judgmentQueryAuditList(auditPlanDayId,auditListPage_auditPlanDateFlg
				,taskType,relationAuditPlanDayId,checkAuditDate);
	}
	
}

/**
 * 根据任务状态、任务类型，判断从何处查询经销商库房信息及盘点清单信息
 * 任务状态:
 * 1.任务状态为：1.已办、2.跳过 时从盘点清单表查询库房信息
 * 2.任务状态为：0.未办、3.进行中 时从经销商库房表查询库房信息
 * 任务类型:
 * 任务类型为：1.经销商盘库 3.抽查 时需要根据盘点清单状态查询盘点清单数据
 * 任务类型为：2.监管单位盘库 时不需要查询盘点清单数据
 * @param auditPlanDayId:盘点计划日ID
 * @param auditPlanDate:盘点计划日期 （如2017-07-19）
 * @param dealerCode:经销商Code
 * @param taskType：任务类型--1.经销商盘库  2.监管单位盘库 3.抽查
 * @param relationAuditPlanDayId:抽查任务对应盘点任务的盘点计划日ID
 * @param checkAuditDate:抽查任务对应盘点任务的盘点日期
 */
function judgmentQueryStoreHouses(auditPlanDayId,auditPlanDate,dealerCode
		,taskType,relationAuditPlanDayId,checkAuditDate){
	showLoading();
	$("#audit_list_page #auditListDealerStorehouseList").empty();
	$("#audit_list_page #auditListContentUl").empty();
	
	//更多按钮不显示
	$("#audit_list_page #auditListOther").css("display","none");
	//总台数
	$("#audit_list_page .auditALLShow #totalNum").find("font").text("");
	//已选数量
	$("#audit_list_page .auditALLShow #selectedNum").find("font").text("");
	//库房状态 
	$("#audit_list_page .auditALLShow #storehouseAuditListStatus").find("font").text("");
	
	$("#audit_list_page #auditListContentUl").removeAttr("auditListStatus");
	$("#audit_list_page #auditListContentUl").removeAttr("auditCheckListId");//盘点任务的盘点清单ID或抽查任务对应的盘点任务的盘点清单ID
	$("#audit_list_page #auditListContentUl").removeAttr("dasAuditReportId");
	$("#audit_list_page #auditListContentUl").removeAttr("auditPlanDate");
	$("#audit_list_page #auditListContentUl").removeAttr("reportAuditorId");//生成盘库报告的人员userid
	
	$("#audit_list_page #auditListContentUl").removeAttr("checkAuditListStatus");
	$("#audit_list_page #auditListContentUl").removeAttr("checkAuditCheckListId");//抽查任务的盘点清单ID
	$("#audit_list_page #auditListContentUl").removeAttr("checkDasAuditReportId");
	$("#audit_list_page #auditListContentUl").removeAttr("checkAuditPlanDate");
	$("#audit_list_page #auditListContentUl").removeAttr("checkReportAuditorId");//抽查任务生成盘库报告的人员userid
	
	//任务状态:0.未办 1.已办 2.跳过 3.进行中
	var taskStatus = session.get("taskStatus");
	//taskType：1.经销商盘库  2.监管单位盘库 3.抽查
	var taskType = session.get("taskType");
	//抽查任务对应盘点任务的任务状态(0.未办 1.已办 2.跳过 3.进行中 )
	var checkTaskStatus = session.get("checkTaskStatus");
	
	var postData = {};
    postData.random = Math.random();
    postData.dealerCode = dealerCode;
    postData.auditPlanDayId = auditPlanDayId;
    postData.auditPlanDate = auditPlanDate;
    postData.taskStatus = taskStatus;//任务状态:0.未办 1.已办 2.跳过 3.进行中
    postData.taskType = taskType;//taskType：1.经销商盘库  2.监管单位盘库 3.抽查
    postData.relationAuditPlanDayId = relationAuditPlanDayId;//抽查任务对应盘点任务的盘点计划日ID
    postData.checkAuditDate = checkAuditDate;//抽查任务对应盘点任务的盘点日期
    postData.checkTaskStatus = checkTaskStatus;//抽查任务对应盘点任务的任务状态(0.未办 1.已办 2.跳过 3.进行中 )
    
	$.getJSON(basePath+"/app/auditList/pageInit.xhtml"+callback, postData,function(msg){
		if($.trim(msg.returnCode) == '0'){
		    if(msg.data !=null){
		    	//服务器端的系统日期
		    	auditListPage_systemCurrentDate = msg.data.systemCurrentDate;
		    	// 盘库库房的有效距离
		    	auditListPage_storehouseValidDistance = msg.data.auditUserToStorehouseValidDistance;
		    	// 定时计算盘库人员距离库房距离时的间隔时间
		    	auditListPage_storehouseValidDistanceInterval = msg.data.auditUserToStorehouseValidDistanceInterval;
		    	//抽查任务是否和其对应的盘点任务同一天--0：不在同一天  1：在同一天
		    	auditListPage_sameDateAuditTaskFlag = msg.data.sameDateAuditTaskFlag;
		    	
		    	//auditListPage_auditPlanDateFlg--1:任务的计划日期等于系统日期  2：任务的计划日期小于系统日期  3：任务的计划日期大于系统日期
				var auditPlanDateDt = "";
				if(auditPlanDate != null && auditPlanDate != ""){
					auditPlanDateDt = new Date(Date.parse(auditPlanDate.replace(/\-/g, "\/")));
				}
				var systemCurrentDate = auditListPage_systemCurrentDate;
				var curDateDt = "";
				if(systemCurrentDate != null && systemCurrentDate != ""){
					curDateDt = new Date(Date.parse(systemCurrentDate.replace(/\-/g, "\/")));
				}
				
				if(auditPlanDate != null && auditPlanDate != "" 
					&& systemCurrentDate != null && systemCurrentDate != ""){
					
					if(auditPlanDateDt.getTime() == curDateDt.getTime()){
						//1:任务的计划日期等于系统日期
						auditListPage_auditPlanDateFlg = 1;
					}else if(auditPlanDateDt.getTime() < curDateDt.getTime()){
						//2：任务的计划日期小于系统日期 
						auditListPage_auditPlanDateFlg = 2;
					}else{
						//3：任务的计划日期大于系统日期
						auditListPage_auditPlanDateFlg = 3;
					}
				}
				
				//该任务对应经销商的库房列表
		    	var storeHousesList = msg.data.storeHousesList;
		    	if(storeHousesList !=null && storeHousesList.length>0){
		    		//经销商库房的初始化
					var $auditListDealerStorehouseTemplate = $("#audit_list_page").find(".auditListDealerStorehouse_template");
					//任务类型--1.经销商盘库  2.监管单位盘库 3.抽查
//					if(taskType != 2){
						$.each(storeHousesList,function(i,n){
							var $storeHousesItem = $auditListDealerStorehouseTemplate.clone(true);
							//点击经销商库房列表项
							$storeHousesItem.find(".auditListDealerStorehouse").bind("tap",function(event){
								var $noCurrentDealerStorehouse = $("#audit_list_page #auditListDealerStorehouseList").find(".auditListDealerStorehouse").not(this);
								$noCurrentDealerStorehouse.removeClass("dealerStorehouseSelected");
								$(this).addClass("dealerStorehouseSelected");
								//设置盘库经销商库房坐标JSONArray
								setAuditListPageStoreHouseLocationJsonArr(this);
								//根据条件判断从何处查询取得盘点清单
								judgmentQueryAuditList(auditPlanDayId,auditListPage_auditPlanDateFlg
										,taskType,relationAuditPlanDayId,checkAuditDate);
								event.stopPropagation();
							});
							
							dataBindToElement($storeHousesItem,n);
							//是否收费--1:不收费 2.收费
							if(n.chargeFlag == 2){
								$storeHousesItem.find(".item2").css("display","");
							}else{
								$storeHousesItem.find(".item2").remove();
							}
							$storeHousesItem.css("display","");
							$storeHousesItem.addClass("storehouseBox");
							$storeHousesItem.removeClass("auditListDealerStorehouse_template");
							
							$("#audit_list_page #auditListDealerStorehouseList").append($storeHousesItem);
							
//							var auditListStoreHouseHeight = $storeHousesItem.height();
//							if(auditListStoreHouseHeight > 40){
//								$storeHousesItem.css("line-height","25px");
//							}
						});//end $.each
						
						var $firstDealerStorehouse = $("#audit_list_page #auditListDealerStorehouseList").find(".auditListDealerStorehouse:first");
						$firstDealerStorehouse.addClass("dealerStorehouseSelected");
						//设置盘库经销商库房坐标JSONArray
						setAuditListPageStoreHouseLocationJsonArr($firstDealerStorehouse);
						
						// 根据条件判断从何处查询取得盘点清单
						judgmentQueryAuditList(auditPlanDayId,auditListPage_auditPlanDateFlg
								,taskType,relationAuditPlanDayId,checkAuditDate);
//					}
//					else{
//						$.each(storeHousesList,function(i,n){
//							var $storeHousesItem = $auditListDealerStorehouseTemplate.clone(true);
//							dataBindToElement($storeHousesItem,n);
//							$storeHousesItem.show();
//							$("#audit_list_page #auditListDealerStorehouseList").append($storeHousesItem);
//						});//end $.each
//						
//						var $firstDealerStorehouse = $("#audit_list_page #auditListDealerStorehouseList").find(".auditListDealerStorehouse:first");
//						$firstDealerStorehouse.addClass("dealerStorehouseSelected");
//						
//						//更多按钮
//			    		//任务状态:0.未办 1.已办 2.跳过 3.进行中
//						if(taskStatus == 1 || taskStatus == 2){
//							//更多按钮不显示
//							$("#audit_list_page #auditListOther").css("display","none");
//						}else{
//							//更多按钮显示
//							$("#audit_list_page #auditListOther").css("display","");
//						}
//			    		
//			    		//总台数
//			    		$("#audit_list_page .auditALLShow #totalNum").find("font").text("");
//			    		//已选数量
//			    		$("#audit_list_page .auditALLShow #selectedNum").find("font").text("");
//			    		//库房状态 
//			    		$("#audit_list_page .auditALLShow #storehouseAuditListStatus").find("font").text("");
//					
//			    		showHide();
//			    		showMessage('该任务为监管单位盘库，不显示盘点清单信息','3000');
//					}
				
//						showHide();
		    	}else{
		    		//更多按钮
		    		//盘点日期flag--1:任务的计划日期等于系统日期  2：任务的计划日期小于系统日期  3：任务的计划日期大于系统日期
		    		if(auditListPage_auditPlanDateFlg != 3){
		    			//任务状态:0.未办 1.已办 2.跳过 3.进行中
						if(taskStatus == 1 || taskStatus == 2){
							//更多按钮不显示
							$("#audit_list_page #auditListOther").css("display","none");
						}else{
							//更多按钮显示
							$("#audit_list_page #auditListOther").css("display","");
						}
		    		}else{
		    			//任务的计划日期大于系统日期的情况更多按钮不显示
						$("#audit_list_page #auditListOther").css("display","none");
		    		}
		    		
					
		    		//总台数
		    		$("#audit_list_page .auditALLShow #totalNum").find("font").text("");
		    		//已选数量
		    		$("#audit_list_page .auditALLShow #selectedNum").find("font").text("");
		    		//库房状态 
		    		$("#audit_list_page .auditALLShow #storehouseAuditListStatus").find("font").text("");
		    		
		    		showHide();
		    	}
				
		    } else {
		    	showHide();
//            	showMessage('暂无数据','2000');	
		    }
		    
		    var auditListDealerStorehouseListHeight = $("#audit_list_page #auditListDealerStorehouseList").height();
		    //		    auditListStoreHousesTop = 125+(auditListStoreHousesTop*msg.data.storeHousesList.length)
		    var auditListWrapperTop = 160+auditListDealerStorehouseListHeight
			$("#audit_list_page #audit_list_wrapper").css("top",auditListWrapperTop+"px");
//		    alert($("#audit_list_page #audit_list_wrapper").css("top"));
    	}else{
	    	showHide();
	    	errorHandler(msg.returnCode,msg.message);
	    }
	});//end $.getJSON
}

/**
 * 根据条件判断从何处查询盘点清单
 * @param auditPlanDayId：盘点计划日ID
 * @param auditPlanDateFlg:盘点日期flag--1:任务的计划日期等于系统日期  2：任务的计划日期小于系统日期  3：任务的计划日期大于系统日期
 * @param taskType：任务类型--1.经销商盘库  2.监管单位盘库 3.抽查
 * @param relationAuditPlanDayId:抽查任务对应盘点任务的盘点计划日ID
 * @param checkAuditDate:抽查任务对应盘点任务的盘点日期
 */
function judgmentQueryAuditList(auditPlanDayId,auditPlanDateFlg
				,taskType,relationAuditPlanDayId,checkAuditDate){
	$("#audit_list_page #auditListContentUl").empty();
	//经销商code
	var dealerCode = session_auditListDealerCode;
	if(dealerCode == "" || dealerCode == null){
		showMessage('经销商库房不存在','2000');
		return;
	}
	//经销商库房ID
	var storehouseId = $('#audit_list_page').find(".dealerStorehouseSelected [identity='storehouseId']").text();
	if(storehouseId == "" || storehouseId == null){
		showMessage('经销商库房不存在','2000');
		return;
	}
	//经销商库房Code
	var storehouseCode = $('#audit_list_page').find(".dealerStorehouseSelected [identity='storehouseCode']").text();
	if(storehouseCode == "" || storehouseCode == null){
		showMessage('经销商库房不存在','2000');
		return;
	}	
	//车架号
	var vinNoText = $('#audit_list_page').find(".auditListVinNoDiv #vinNoText").val();
	
	//page_from:转页来源页面（点击返回按钮时，此session值不改变）
	var page_from = session.get("page_from");
	if(page_from == "audit_task_list_page"){
		//audit_task_list_page:盘库管理——任务列表页面
		//从盘库管理——任务列表页面转页到此页面时，取得盘点清单列表
		queryAuditListFromAuditTaskListPage(auditPlanDayId,storehouseId,dealerCode,storehouseCode,
				auditPlanDateFlg,page_from,taskType,relationAuditPlanDayId,vinNoText);
	}else{
		//取得盘点清单列表
		queryAuditList(auditPlanDayId,storehouseId,dealerCode,storehouseCode,
				auditPlanDateFlg,page_from,taskType,relationAuditPlanDayId,vinNoText);
	}
	
}


/**
 * 取得盘点清单列表
 * 
 * @param auditPlanDayId：盘点计划日ID
 * @param storehouseId:经销商库房ID
 * @param dealerCode:经销商code
 * @param storehouseCode:经销商库房Code
 * @param auditPlanDateFlg:盘点日期flag--1:任务的计划日期等于系统日期  2：任务的计划日期小于系统日期  3：任务的计划日期大于系统日期
 * @param page_from:转页来源页面（点击返回按钮时，此session值不改变）
 * @param taskType：任务类型--1.经销商盘库  2.监管单位盘库 3.抽查
 * @param relationAuditPlanDayId:抽查任务对应盘点任务的盘点计划日ID
 * @param vinNoText 车架号
 */
function queryAuditList(auditPlanDayId,storehouseId,dealerCode,storehouseCode,
		auditPlanDateFlg,page_from,taskType,relationAuditPlanDayId,vinNoText){
	$("#audit_list_page #auditListContentUl").empty();
	var postData = {};
    postData.random = Math.random();
    postData.auditPlanDayId = auditPlanDayId;
    postData.storehouseId = storehouseId;
    postData.dealerCode = dealerCode;
    postData.storehouseCode = storehouseCode;
    postData.auditPlanDateFlg = auditPlanDateFlg;
    postData.taskType = taskType;
    postData.relationAuditPlanDayId = relationAuditPlanDayId;//抽查任务对应盘点任务的盘点计划日ID
    postData.sameDateAuditTaskFlag = auditListPage_sameDateAuditTaskFlag;//抽查任务是否和其对应的盘点任务同一天--0：不在同一天  1：在同一天
   
    postData.auditorId = session.get("auditorId");//当前任务的盘点人员id（抽查任务的抽查人员或者盘点任务的盘点人员）
    postData.auditDate = session.get("auditPlanDate");//抽查任务的抽查日期或者盘点任务的盘点日期
    postData.checkAuditDate = session.get("checkAuditDate");//抽查任务对应的盘点任务的盘点日期
	postData.checkAuditId = session.get("checkAuditId");//抽查任务对应盘点任务的盘点员ID(user_id)	
//    showLoading();
//	$.getJSON(basePath+"/app/auditList/queryAuditList.xhtml"+callback, postData,function(msg){
//		if($.trim(msg.returnCode) == '0'){
//			showHide();
////			if(msg.data.auditList !=null && msg.data.auditList.length>0){
//				
//				bindData_AuditList(msg,page_from,taskType);
////		    } else {
////		    	showMessage(msg.message,'2000');
////		    }
//		}
//		else{
//			showHide();
//			errorHandler(msg.returnCode,msg.message);
//		}
//
//	});//end $.getJSON
	//TODO sd
	$.ajax({
		url: basePath+"/app/auditList/queryAuditList.xhtml"+callback,
		data: postData,
		type: 'POST',
		dataType: 'json',
		async:false,
		beforeSend: function () {
			showLoading();
		},
		success: function (msg) {
			if ($.trim(msg.returnCode) == '0') {
				showHide();
				bindData_AuditList(msg, page_from, taskType,vinNoText);
			} else {
				showHide();
				errorHandler(msg.returnCode, msg.message);
			}
		},
		complete: function() {

		}
	});
}


/**
 * 取得盘点清单列表(从盘库管理页面转页来时)
 * @param auditPlanDayId：盘点计划日ID
 * @param storehouseId:经销商库房ID
 * @param dealerCode:经销商code
 * @param storehouseCode:经销商库房Code
 * @param auditPlanDateFlg:盘点日期flag--1:任务的计划日期等于系统日期  2：任务的计划日期小于系统日期  3：任务的计划日期大于系统日期
 * @param page_from:转页来源页面（点击返回按钮时，此session值不改变）
 * @param taskType：任务类型--1.经销商盘库  2.监管单位盘库 3.抽查
 * @param relationAuditPlanDayId:抽查任务对应盘点任务的盘点计划日ID
 */
function queryAuditListFromAuditTaskListPage(auditPlanDayId,storehouseId,dealerCode
			,storehouseCode,auditPlanDateFlg,page_from,taskType,relationAuditPlanDayId
			,vinNoText){
	$("#audit_list_page #auditListContentUl").empty();
	var postData = {};
    postData.random = Math.random();
    postData.auditPlanDayId = auditPlanDayId;
    postData.storehouseId = storehouseId;
    postData.dealerCode = dealerCode;
    postData.storehouseCode = storehouseCode;
    postData.auditPlanDateFlg = auditPlanDateFlg;
    postData.taskType = taskType;
    postData.relationAuditPlanDayId = relationAuditPlanDayId;//抽查任务对应盘点任务的盘点计划日ID
    postData.sameDateAuditTaskFlag = auditListPage_sameDateAuditTaskFlag;//抽查任务是否和其对应的盘点任务同一天--0：不在同一天  1：在同一天
    
    postData.auditorId = session.get("auditorId");//当前任务的盘点人员id（抽查任务的抽查人员或者盘点任务的盘点人员）
    postData.auditDate = session.get("auditPlanDate");//抽查任务的抽查日期或者盘点任务的盘点日期
    postData.checkAuditDate = session.get("checkAuditDate");//抽查任务对应的盘点任务的盘点日期
	postData.checkAuditId = session.get("checkAuditId");//抽查任务对应盘点任务的盘点员ID(user_id)	
//    showLoading();
//	$.getJSON(basePath+"/app/auditList/queryAuditListFromAuditTaskListPage.xhtml"+callback, postData,function(msg){
//		if($.trim(msg.returnCode) == '0'){
//			showHide();
////			if(msg.data.auditList !=null && msg.data.auditList.length>0){
//				
//				bindData_AuditList(msg,page_from,taskType);
////		    } else {
////		    	showMessage(msg.message,'2000');
////		    }
//		}
//		else{
//			showHide();
//			errorHandler(msg.returnCode,msg.message);
//		}
//
//	});//end $.getJSON
	
	$.ajax({
		url: basePath+"/app/auditList/queryAuditListFromAuditTaskListPage.xhtml"+callback,
		data: postData,
		type: 'POST',
		dataType: 'json',
		async:false,
		beforeSend: function () {
			showLoading();
		},
		success: function (msg) {
			if ($.trim(msg.returnCode) == '0') {
				showHide();
				bindData_AuditList(msg, page_from, taskType,vinNoText);
			} else {
				showHide();
				errorHandler(msg.returnCode, msg.message);
			}
		},
		complete: function() {

		}
	});
}

//将查询的数据绑定到列表
function bindData_AuditList(msg,page_from,taskType,vinNoText){
	//任务状态:0.未办 1.已办 2.跳过 3.进行中
	var taskStatus = session.get("taskStatus");
	
	var rtnAuditListMap = msg.data;
	var $auditList = rtnAuditListMap.auditList;
	var $acknowledge = rtnAuditListMap.acknowledge;
	var $auditListStatus = rtnAuditListMap.auditListStatus;//盘点任务的盘点清单状态或者抽查任务对应盘点任务的盘点清单状态
	var $auditCheckListId = rtnAuditListMap.auditCheckListId;
	var $dasAuditReportId = rtnAuditListMap.dasAuditReportId;
	var $auditPlanDate = rtnAuditListMap.auditPlanDate;
	var $reportAuditorId = rtnAuditListMap.reportAuditorId;
	var $submitStatus = rtnAuditListMap.submitStatus;
	
	$("#audit_list_page #auditListContentUl").attr("auditListStatus",$auditListStatus);
	$("#audit_list_page #auditListContentUl").attr("auditCheckListId",$auditCheckListId);
	$("#audit_list_page #auditListContentUl").attr("dasAuditReportId",$dasAuditReportId);
	$("#audit_list_page #auditListContentUl").attr("auditPlanDate",$auditPlanDate);
	$("#audit_list_page #auditListContentUl").attr("reportAuditorId",$reportAuditorId);
	$("#audit_list_page #auditListContentUl").attr("submitStatus",$submitStatus);
	
	var auditListStatusNameObj = {"0":"未办","1":"已办","2":"跳过","3":"进行中","4":"DAS端完成","5":"完成"};
	//抽查任务的盘点清单状态  0.未办 1.已办(正常完成任务) 2.跳过 3.进行中 4.DAS端完成 5.完成（更多按钮选项完成）
	var $checkAuditListStatus = "";
	var storehouseCheckAuditListStatusName = "";
	//taskType：任务类型--1.经销商盘库  2.监管单位盘库 3.抽查
	if(taskType == 3){
//		var $checkAcknowledge = rtnAuditListMap.checkAcknowledge;
		$checkAuditListStatus = rtnAuditListMap.checkAuditListStatus;
		var $checkAuditCheckListId = rtnAuditListMap.checkAuditCheckListId;
		var $checkDasAuditReportId = rtnAuditListMap.checkDasAuditReportId;
		var $checkAuditPlanDate = rtnAuditListMap.checkAuditPlanDate;
		var $checkReportAuditorId = rtnAuditListMap.checkReportAuditorId;
		
		$("#audit_list_page #auditListContentUl").attr("checkAuditListStatus",$checkAuditListStatus);
		$("#audit_list_page #auditListContentUl").attr("checkAuditCheckListId",$checkAuditCheckListId);
		$("#audit_list_page #auditListContentUl").attr("checkDasAuditReportId",$checkDasAuditReportId);
		$("#audit_list_page #auditListContentUl").attr("checkAuditPlanDate",$checkAuditPlanDate);
		$("#audit_list_page #auditListContentUl").attr("checkReportAuditorId",$checkReportAuditorId);
		
		storehouseCheckAuditListStatusName = auditListStatusNameObj[$checkAuditListStatus]
	}

	auditListPage_dealerUtilized = 0;//贷款金额
	auditListPage_unitsStocked = 0;//车辆台数
	
	if($auditList !=null && $auditList.length>0){
		//已选数量
		var selectedNum = 0;
		var $auditListTemplate = $("#audit_list_page").find(".auditListContent_template .list-row-template");
		$.each($auditList,function(i,n){
			 //如果字符串中不包含目标字符会返回-1
			if(n.vinNo.indexOf(vinNoText)>=0){
				var $auditListItem = $auditListTemplate.clone(true);
				$auditListItem.attr("auditCheckReportId",n.auditCheckReportId);
				$auditListItem.attr("keySelectiveFlag",n.keySelectiveFlag);
				$auditListItem.attr("auditListStatus",n.auditListStatus);
				
				//auditListPage_auditPlanDateFlg  盘点日期flag--1:任务的计划日期等于系统日期  2：任务的计划日期小于系统日期  3：任务的计划日期大于系统日期
				//auditListStatus 盘点清单状态 0.未办 1.已办(正常完成任务) 2.跳过 3.进行中 4.DAS端完成 5.完成（更多按钮选项完成）
				if(auditListPage_auditPlanDateFlg != 2 || n.auditListStatus != 1){
					$auditListItem.bind("tap",function(event){
						event.stopPropagation();
						var auditCheckReportId = $(this).attr("auditCheckReportId");
						var keySelectiveFlag = $(this).attr("keySelectiveFlag");
						var auditListStatus = $(this).attr("auditListStatus"); //盘点清单状态 0.未办 1.已办(正常完成任务) 2.跳过 3.进行中 4.DAS端完成 5.完成（更多按钮选项完成）
						auditList_selectOrCancelKey(this,auditCheckReportId,keySelectiveFlag,auditListStatus);
					});
				}
				
				if(n.financingDate != null){
					n.financingDate = n.financingDate.substring(0,10);
				}
				
				dataBindToElement($auditListItem,n);
				
				if(n.keySelectiveFlag == 1){
					$auditListItem.css("color","red");
					selectedNum += 1;
				}
				
				$auditListItem.css("display","");
				$auditListItem.removeClass("list-row-template");
				$("#audit_list_page #auditListContentUl").append($auditListItem);
			}
			
			auditListPage_dealerUtilized = auditListPage_dealerUtilized + n.utilized;//贷款金额
			auditListPage_unitsStocked = auditListPage_unitsStocked + 1;//车辆台数
			
		});//end $.each
		
		//总台数
		$("#audit_list_page .auditALLShow #totalNum").find("font").text($auditList.length);
		
		//已选数量
		$("#audit_list_page .auditALLShow #selectedNum").find("font").text(selectedNum);
		
		//任务状态:0.未办 1.已办 2.跳过 3.进行中
		if(taskStatus == 1 || taskStatus == 2){
			//更多按钮不显示
			$("#audit_list_page #auditListOther").css("display","none");
		}
		
		if($acknowledge == ConstDef.getConstant("AUDIT_CHECK_LIST_ACKNOWLEDGE")){
	    	auditListPage_acknowledgeFlag = 1;  //1:acknowledge 0:open
		}else{
			auditListPage_acknowledgeFlag = 0; //1:acknowledge 0:open
		}
		
		auditListFlag = 1;//盘点清单数据flag--0：盘点清单数据为空    1：盘点清单数据不为空
		
    } else {
    	auditListFlag = 0;//盘点清单数据flag--0：盘点清单数据为空   1：盘点清单数据不为空
    	
    	//更多按钮
		//任务状态:0.未办 1.已办 2.跳过 3.进行中
		if(taskStatus == 1 || taskStatus == 2){
			//更多按钮不显示
			$("#audit_list_page #auditListOther").css("display","none");
		}else{
			//更多按钮显示
			$("#audit_list_page #auditListOther").css("display","");
		}
		
		//总台数
		$("#audit_list_page .auditALLShow #totalNum").find("font").text("0");
		//已选数量
		$("#audit_list_page .auditALLShow #selectedNum").find("font").text("0");
		
    	if($acknowledge == ConstDef.getConstant("AUDIT_CHECK_LIST_ACKNOWLEDGE")){
        	showMessage(msg.message,'2000');
        	auditListPage_acknowledgeFlag = 1;  //1:acknowledge 0:open
    	}else{
    		auditListPage_acknowledgeFlag = 0; //1:acknowledge 0:open
    		showMessage("暂无数据",'2000');
    	}
    	
    }
	
	//库房状态 --盘点清单状态(0.未办 1.已办(正常完成) 2.跳过 3.进行中 4.DAS端完成 5.完成（更多按钮选项）)
	var $storehouseAuditListStatusFont = $("#audit_list_page .auditALLShow #storehouseAuditListStatus").find("font");
	var storehouseAuditListStatus = $auditListStatus;
	var storehouseAuditListStatusName = auditListStatusNameObj[storehouseAuditListStatus];
	
	//盘点日期flag--1:任务的计划日期等于系统日期  2：任务的计划日期小于系统日期  3：任务的计划日期大于系统日期
	if(auditListPage_auditPlanDateFlg != 3){
		//taskType：任务类型--1.经销商盘库  2.监管单位盘库 3.抽查
		if(taskType == 1 || taskType == 2){
			//库房状态 --盘点清单状态(0.未办 1.已办(正常完成) 2.跳过 3.进行中 4.DAS端完成 5.完成（更多按钮选项）)
			if(storehouseAuditListStatus == 0){
				//更多按钮显示
				$("#audit_list_page #auditListOther").css("display","");
				
			}else if(storehouseAuditListStatus == 1 || storehouseAuditListStatus == 2
					|| storehouseAuditListStatus == 4 || storehouseAuditListStatus == 5){
				//更多按钮不显示
				$("#audit_list_page #auditListOther").css("display","none");
				
			}else if(storehouseAuditListStatus == 3){
				//taskType：任务类型--1.经销商盘库  2.监管单位盘库 3.抽查
				if(taskType == 1){
					//更多按钮不显示
					$("#audit_list_page #auditListOther").css("display","none");
				}else{
					//更多按钮显示
					$("#audit_list_page #auditListOther").css("display","");
				}
				
			}else{
				//更多按钮显示
				$("#audit_list_page #auditListOther").css("display","");
			}
		}else if(taskType == 3){
			//库房状态 --盘点清单状态(0.未办 1.已办(正常完成) 2.跳过 3.进行中 4.DAS端完成 5.完成（更多按钮选项）)
			if($checkAuditListStatus == 0){
				//更多按钮显示
				$("#audit_list_page #auditListOther").css("display","");
				
			}else if($checkAuditListStatus == 1 || $checkAuditListStatus == 2
					|| $checkAuditListStatus == 4 || $checkAuditListStatus == 5){
				//更多按钮不显示
				$("#audit_list_page #auditListOther").css("display","none");
				
			}else if($checkAuditListStatus == 3){
				//taskType：任务类型--1.经销商盘库  2.监管单位盘库 3.抽查
				//auditListPage_sameDateAuditTaskFlag ：抽查任务是否和其对应的盘点任务同一天--0：不在同一天  1：在同一天
				if(auditListPage_sameDateAuditTaskFlag == 0){
					//更多按钮不显示
					$("#audit_list_page #auditListOther").css("display","none");
				}else{
					//更多按钮显示
					$("#audit_list_page #auditListOther").css("display","");
				}
				
			}else{
				//更多按钮显示
				$("#audit_list_page #auditListOther").css("display","");
			}
		}
		
		//page_from:转页来源页面（点击返回按钮时，此session值不改变）
		if(page_from =="audit_task_list_page"){
			//从“盘库管理--任务列表”页面迁移到“盘库清单”页面时只能查看，更多按钮不显示
			$("#audit_list_page #auditListOther").css("display","none");
		}
	}else{
		//任务的计划日期大于系统日期的情况更多按钮不显示
		$("#audit_list_page #auditListOther").css("display","none");
	}
	
	var currentAuditListStatusName = "";//当前库房状态
	//taskType：任务类型--1.经销商盘库  2.监管单位盘库 3.抽查
	if(taskType == 3){
		currentAuditListStatusName = storehouseCheckAuditListStatusName + "("+storehouseAuditListStatusName+")";
	}else{
		currentAuditListStatusName = storehouseAuditListStatusName;
	}
	$storehouseAuditListStatusFont.text(currentAuditListStatusName);
	// 在APP端选择“跳过、DAS端完成”的盘点不考虑电子签章。--//库房状态 --盘点清单状态(0.未办 1.已办(正常完成) 2.跳过 3.进行中 4.DAS端完成 5.完成（更多按钮选项）)
	if($auditListStatus == 2 || $auditListStatus ==4 
			|| $checkAuditListStatus == 2 || $checkAuditListStatus == 4 ){
		$("#audit_list_page").find("#auditListBottomsUl li[topage='audit_electronic_signature_page']").css("display","none");
		$("#audit_list_page").find("#auditListBottomsUl").attr("class","bottoms4-red");
	}else{
		$("#audit_list_page").find("#auditListBottomsUl li[topage='audit_electronic_signature_page']").css("display","");
		$("#audit_list_page").find("#auditListBottomsUl").attr("class","bottoms5-red");
		
	}
}

//查询和抽查任务在同一日的对应的盘点任务
function querySameDateAuditTaskByCheckTask(auditPlanDayId,auditPlanDate,$toPage){
	var postData = {};
	postData.random = Math.random();
	postData.auditPlanDayId = auditPlanDayId;
	postData.auditPlanDate = auditPlanDate;
	
	$.getJSON(basePath+"/app/auditList/querySameDateAuditTaskByCheckTask.xhtml"+callback, postData,function(msg){
		if($.trim(msg.returnCode) == '0'){
			if(msg.data !=null && msg.data.length>0){
//				sameDateAuditTaskList = msg.data;
				//抽查任务（同日抽查）
				goto_page("audit_report_view_page");
			}else{
				goto_page($toPage);
			}
		}else{
			errorHandler(msg.returnCode,msg.message);
		}
	});//end $.getJSON
	
}

//点击一天车辆明细
//任务的计划日期 等于 服务器端的系统日期，且库房的任务状态是“进行中”、“已办”时，进行以下处理；
//1.字体为默认颜色时，点击后，字体变红，标识需要抽查钥匙的车辆。
//2.字体为红色时，点击后，字体变为默认颜色，取消抽查钥匙
//其他情况时，点击没有反应。
function auditList_selectOrCancelKey(event,auditCheckReportId,keySelectiveFlag,auditListStatus){
	//taskType：1.经销商盘库  2.监管单位盘库 3.抽查
	var $taskType = session.get("taskType");
	//taskType：任务类型--1.经销商盘库  2.监管单位盘库 3.抽查
	//auditListPage_sameDateAuditTaskFlag ：抽查任务是否和其对应的盘点任务同一天--0：不在同一天  1：在同一天
	if($taskType == 3 && auditListPage_sameDateAuditTaskFlag == 1){
		return;
	}
	
	showLoading();
	
	//库房的任务状态--盘点清单状态 0.未办 1.已办(正常完成任务) 2.跳过 3.进行中 4.DAS端完成 5.完成（更多按钮选项完成）
	if(auditListStatus == 1 || auditListStatus == 3 || auditListStatus == 5){
		//清空车架号
		$('#audit_list_page').find(".auditListVinNoDiv #vinNoText").val("");
		
		var auditPlanDayId = session.get("auditPlanDayId");//盘点计划日ID或者抽查计划的盘点计划日ID
		var auditPlanDate = session.get("auditPlanDate");//盘点计划日期或者抽查计划的盘点计划日期
		var relationAuditPlanDayId = "";//抽查任务对应盘点任务的盘点计划日ID
		var checkAuditDate = "";//抽查任务对应盘点任务的盘点日期
		if($taskType == 3){
			relationAuditPlanDayId = session.get("relationAuditPlanDayId");//抽查任务对应盘点任务的盘点计划日ID
			checkAuditDate = session.get("checkAuditDate");//抽查任务对应盘点任务的盘点日期
		}
		
		var updateKeySelectiveFlag = 0;
		if(keySelectiveFlag == ConstDef.getConstant("KEY_SELECTIVE_FLAG_NOCHECK")){
			updateKeySelectiveFlag = ConstDef.getConstant("KEY_SELECTIVE_FLAG_CHECK");
		}else{
			updateKeySelectiveFlag = ConstDef.getConstant("KEY_SELECTIVE_FLAG_NOCHECK");
		}
		var postData = {};
		postData.random = Math.random();
		postData.userCode = session.get("userCode");
		postData.auditCheckReportId = auditCheckReportId;
		postData.updateKeySelectiveFlag = updateKeySelectiveFlag;
//		postData.auditPlanDate = session.get("auditPlanDate");
		postData.auditPlanDate = auditPlanDate;
		
		$.getJSON(basePath+"/app/auditList/selectOrCancelCheckKey.xhtml"+callback, postData,function(msg){
			if($.trim(msg.returnCode) == '0'){
				showHide();
				if(msg.data.updateCheckKeyResult != null){
					if(msg.data.updateCheckKeyResult > 0){
						if(updateKeySelectiveFlag == ConstDef.getConstant("KEY_SELECTIVE_FLAG_NOCHECK")){
							$(event).css("color","");
							$(event).attr("keySelectiveFlag",updateKeySelectiveFlag);
							//已选数量
							var selectedNum = Number($("#audit_list_page .auditALLShow #selectedNum").find("font").text());
							$("#audit_list_page .auditALLShow #selectedNum").find("font").text(selectedNum-1);
							
							showMessage('取消抽查钥匙','1500');
						}else{
							$(event).css("color","red");
							$(event).attr("keySelectiveFlag",updateKeySelectiveFlag);
							//已选数量
							var selectedNum = Number($("#audit_list_page .auditALLShow #selectedNum").find("font").text());
							$("#audit_list_page .auditALLShow #selectedNum").find("font").text(selectedNum+1);
							
							showMessage('抽查钥匙','1500');
						}
					}else{
						showMessage('数据库不存在该数据','1500');
					}
					
					setTimeout(function(){
						judgmentQueryAuditList(auditPlanDayId,auditListPage_auditPlanDateFlg
								,$taskType,relationAuditPlanDayId,checkAuditDate);
					},'1000');
					
				}else{
					showMessage('任务的计划日期等于服务器端的系统日期时，才可以取消或抽查钥匙','2000');
				}
			}else{
				showHide();
				errorHandler(msg.returnCode,msg.message);
			}
		});//end $.getJSON
	}else{
//		showMessage('库房的任务状态是“进行中”、“已办”时，才可以取消抽查钥匙或抽查钥匙','2000');	
		showMessage('请先自拍，才可以取消或抽查钥匙','2000');	
	}
}

//查询经销商信息
function queryAuditListDealerInfo(){
	showLoading();
	$("#audit_list_page #auditList_dealerDiv").find("span").text("");
	var auditPlanDayId = session.get("auditPlanDayId");
	//taskType：任务类型--1.经销商盘库  2.监管单位盘库 3.抽查
	var taskType = session.get("taskType");
	//auditListPage_sameDateAuditTaskFlag ：抽查任务是否和其对应的盘点任务同一天--0：不在同一天  1：在同一天
	if(taskType == 3 && auditListPage_sameDateAuditTaskFlag == 1){
		auditPlanDayId =  session.get("relationAuditPlanDayId");//抽查任务对应盘点任务的盘点计划日ID
	}
	var storehouseId = $('#audit_list_page').find(".dealerStorehouseSelected [identity='storehouseId']").text();
	if(storehouseId == "" || storehouseId == null){
		showMessage('经销商不存在','2000');
		return;
	}
	var storehouseName = $('#audit_list_page').find(".dealerStorehouseSelected [identity='storehouseName']").text();
//	var dealerCode = session.get("dealerCode");
	var dealerCode = session_auditListDealerCode;
	var postData = {};
    postData.random = Math.random();
    postData.auditPlanDayId = auditPlanDayId;
    postData.storehouseId = storehouseId;
    postData.dealerCode = dealerCode;
    
	$.getJSON(basePath+"/app/auditList/queryAuditListDealerInfo.xhtml"+callback, postData,function(msg){
		showHide();
		if($.trim(msg.returnCode) == '0'){
			if(msg.data !=null){
				var $auditListDealerDiv = $("#audit_list_page #auditList_dealerDiv").find(".md-body");
				var auditDealer = msg.data;
				auditDealer.storehouseName = storehouseName;
				auditDealer.dealerUtilized = fmoney(auditListPage_dealerUtilized,2);//贷款金额
				auditDealer.dealerUnitsStocked = auditListPage_unitsStocked;//车辆台数
				dataBindToElement($auditListDealerDiv,auditDealer);
				
				//经销商
				var instance2 = mobiscroll.widget('#auditList_dealerDiv', {
					theme : 'mobiscroll',
					lang : 'zh',
					anchor : '#auditList_dealerInfo-show',
					display : 'bottom',
					buttons : [/*{
							text: 'Agree',
							handler: 'set'
						}, */{
						text : '关闭',
						handler : 'cancel'
					} ],
					onBeforeShow : function(event, inst) {
						var s = inst.settings;
						if (s.theme == 'wp' || s.baseTheme == 'wp') {
							s.buttons[0].icon = 'checkmark';
							s.buttons[1].icon = 'close';
						}
					}
				});
				instance2.show();
            	
				showHide();
		    } else {
		    	showHide();
		    }
		}
		else{
			showHide();
			errorHandler(msg.returnCode,msg.message);
		}

	});//end $.getJSON

}

////初始化更多按钮选项
function auditList_moreBtnClick(taskType){
	//更多事件处理
	//taskType：1.经销商盘库  2.监管单位盘库 3.抽查
//	var taskType = session.get("taskType");
	var moreBtnData = [];
	if(taskType == 1){
		moreBtnData = [
		               { value: 2, display: "跳过" },
				       { value: 4, display: "DAS端完成" }
		              ];
	}else if(taskType == 2){
		moreBtnData = [
		               { value: 5, display: "完成" }
		              ];
	}else{
		moreBtnData = [
		               { value: 5, display: "完成" },
				       { value: 2, display: "跳过" },
				       { value: 4, display: "DAS端完成" }
		              ];
	}
	mobiscroll.scroller('#auditListOther',{
		theme: 'red',
		lang: 'zh',
		display: 'bottom',
		width: 150,
		wheels: [
			[{
				circular: false,
				data: moreBtnData,
				label: ''
			}]
		],
		showLabel: true,
		minWidth: 130,
		
		formatValue: function (data) {
			return data[0];
		},
		onSet: function (event, inst) {
			var auditListStatus = event.valueText;
			if(auditListStatus == 5){
				//taskType：1.经销商盘库  2.监管单位盘库 3.抽查
				//auditListPage_sameDateAuditTaskFlag ：抽查任务是否和其对应的盘点任务同一天--0：不在同一天  1：在同一天
				if(taskType == 2){
					//库房的任务状态--盘点清单状态 0.未办 1.已办(正常完成任务) 2.跳过 3.进行中 4.DAS端完成 5.完成（更多按钮选项完成）
					var $currAuditListStatus = $("#audit_list_page #auditListContentUl").attr("auditListStatus");
					if($currAuditListStatus == 0){
						showMessage('请先自拍，再进行盘点','2000');
						return;
					}
				}else if(taskType == 3 && auditListPage_sameDateAuditTaskFlag == 1){
					//库房的任务状态--盘点清单状态 0.未办 1.已办(正常完成任务) 2.跳过 3.进行中 4.DAS端完成 5.完成（更多按钮选项完成）
					var $checkAuditListStatus = $("#audit_list_page #auditListContentUl").attr("checkAuditListStatus");
					if($checkAuditListStatus == 0){
						showMessage('请先自拍，再进行盘点','2000');
						return;
					}
				}
			}
			
			auditList_moreOperation(taskType,auditListStatus);
			
	    }
	});
	
}
//点击更多操作选项，更新数据库
function auditList_moreOperation(taskType,auditListStatus){
	
	var $auditPlanDayId = session.get("auditPlanDayId");
//	//taskType：1.经销商盘库  2.监管单位盘库 3.抽查
//	var $taskType = session.get("taskType");
	var $taskType = taskType;

	//useSameTaskIdFlag:是否使用sameTaskId或checkSameTaskId--0：未使用  1：使用sameTaskId 2：使用checkSameTaskId
	var $useSameTaskIdFlag = session.get("useSameTaskIdFlag");
	
	var $auditCheckListId = $("#audit_list_page #auditListContentUl").attr("auditCheckListId");
	//taskType：任务类型--1.经销商盘库  2.监管单位盘库 3.抽查
	//auditListPage_sameDateAuditTaskFlag ：抽查任务是否和其对应的盘点任务同一天--0：不在同一天  1：在同一天
	if($taskType == 3 && auditListPage_sameDateAuditTaskFlag == 1){
		$auditCheckListId = $("#audit_list_page #auditListContentUl").attr("checkAuditCheckListId");
	}
	
	var $storehouseId = $('#audit_list_page').find(".dealerStorehouseSelected [identity='storehouseId']").text();
	//经销商库房Code
	var $storehouseCode = $('#audit_list_page').find(".dealerStorehouseSelected [identity='storehouseCode']").text();
	//page_from:转页来源页面（点击返回按钮时，此session值不改变）
	var $page_from = session.get("page_from");
	
	var postData = {};
    postData.random = Math.random();
    postData.userCode = session.get("userCode");
    postData.userId = session.get("userId");
    postData.auditCheckListId = $auditCheckListId;
    postData.auditPlanDayId = $auditPlanDayId;
    postData.storehouseId = $storehouseId;
    postData.auditListStatus = auditListStatus;//库房的任务状态--盘点清单状态 0.未办 1.已办(正常完成任务) 2.跳过 3.进行中 4.DAS端完成 5.完成（更多按钮选项完成）
    postData.taskStatus = session.get("taskStatus"); //任务状态:0.未办 1.已办 2.跳过 3.进行中
//    postData.dealerCode = session.get("dealerCode"); //经销商CODE
    postData.dealerCode = session_auditListDealerCode; //经销商CODE
    postData.useSameTaskIdFlag = $useSameTaskIdFlag; ////useSameTaskIdFlag:是否使用sameTaskId或checkSameTaskId--0：未使用  1：使用sameTaskId 2：使用checkSameTaskId
    
	$.getJSON(basePath+"/app/auditList/moreOperation.xhtml"+callback, postData,function(msg){
		if($.trim(msg.returnCode) == '0'){
		    if(msg.data !=null){
		    	var moreOperationResult = msg.data.moreOperationResult;
		    	if(moreOperationResult >= 1){
		    		//任务状态(0.未办 1.已办 2.跳过 3.进行中 )
		    		var returntaskStatus = msg.data.returntaskStatus;
//		    		session.remove("taskStatus");
		    		session.set("taskStatus",returntaskStatus);
		    		
		    		var $relationAuditPlanDayId = "";//抽查任务对应盘点任务的盘点计划日ID
		    		if($taskType == 3){
		    			$relationAuditPlanDayId = session.get("relationAuditPlanDayId");//抽查任务对应盘点任务的盘点计划日ID
		    		}
		    		//车架号
		    		var vinNoText = $('#audit_list_page').find(".auditListVinNoDiv #vinNoText").val();

		    		queryAuditList($auditPlanDayId,$storehouseId,session_auditListDealerCode
		    				,$storehouseCode,auditListPage_auditPlanDateFlg,$page_from,
		    				$taskType,$relationAuditPlanDayId,vinNoText);
		    		
		    		setTimeout(function(){
		    			showMessage("操作成功",'2000');
					}, 2000);
		    	}else{
		    		showMessage("数据库中不存在该条数据",'2000');
		    	}
		    	
		    }else{
		    	showMessage(msg.message,'2000');	
		    }
    	}else{
	    	errorHandler(msg.returnCode,msg.message);
	    }
	});//end $.getJSON
}

function setAuditListPageStoreHouseLocationJsonArr(currentDealerStorehouseItem){
	
	auditListPage_storeHouseLocationJsonArr = [];//盘库经销商库房坐标JSONArray
	var storeHouseLocationMap = {};
	storeHouseLocationMap.longitude = $(currentDealerStorehouseItem).find("span[identity='longitude']").text();  //经度
	storeHouseLocationMap.latitude = $(currentDealerStorehouseItem).find("span[identity='latitude']").text();   //纬度
	var storeHouseLocationMap1 = {};
	storeHouseLocationMap1.longitude = $(currentDealerStorehouseItem).find("span[identity='longitude1']").text();  //经度
	storeHouseLocationMap1.latitude = $(currentDealerStorehouseItem).find("span[identity='latitude1']").text();   //纬度
	var storeHouseLocationMap2 = {};
	storeHouseLocationMap2.longitude = $(currentDealerStorehouseItem).find("span[identity='longitude2']").text();  //经度
	storeHouseLocationMap2.latitude = $(currentDealerStorehouseItem).find("span[identity='latitude2']").text();   //纬度
	var storeHouseLocationMap3 = {};
	storeHouseLocationMap3.longitude = $(currentDealerStorehouseItem).find("span[identity='longitude3']").text();  //经度
	storeHouseLocationMap3.latitude = $(currentDealerStorehouseItem).find("span[identity='latitude3']").text();   //纬度
	var storeHouseLocationMap4 = {};
	storeHouseLocationMap4.longitude = $(currentDealerStorehouseItem).find("span[identity='longitude4']").text();  //经度
	storeHouseLocationMap4.latitude = $(currentDealerStorehouseItem).find("span[identity='latitude4']").text();   //纬度
	
	
	auditListPage_storeHouseLocationJsonArr.push(storeHouseLocationMap);
	auditListPage_storeHouseLocationJsonArr.push(storeHouseLocationMap1);
	auditListPage_storeHouseLocationJsonArr.push(storeHouseLocationMap2);
	auditListPage_storeHouseLocationJsonArr.push(storeHouseLocationMap3);
	auditListPage_storeHouseLocationJsonArr.push(storeHouseLocationMap4);
}

function auditListPageAuditCalculateDistance(startLocationMap,endLocationMap){
	var lineArr = new Array();
    lineArr.push([startLocationMap.longitude,startLocationMap.latitude]);//[经度，纬度]
    lineArr.push([endLocationMap.longitude,endLocationMap.latitude]);//[经度，纬度]
	
	var polyline = new AMap.Polyline({
		path:lineArr
	});
	//	polyline.setPath(lineArr);
	var distance = polyline.getLength();
	
//	func(distance);
	return distance;
}