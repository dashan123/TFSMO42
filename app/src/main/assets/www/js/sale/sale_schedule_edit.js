var sale_schedule_edit_page = $('#sale_schedule_edit_page');

var initStartTime = "";//初始化时日程开始时间
var initEndDatetime = "";//初始化时日程结束时间
//var initStartTimeDate = "";
//var initEndTimeDate = "";
var sale_schedule_edit_myScroll;
/******************************home_page---begin**************************************/
sale_schedule_edit_page.live('pageinit',function(e,ui){
	
	var wrapper = "sale_schedule_edit_wrapper";
//	var up = "fi_normal_schedule_add_pullUp";
//	var down = "fi_normal_schedule_add_pullDown";
//	sale_schedule_edit_myScroll = createMyScroll(wrapper,up,down);
	sale_schedule_edit_myScroll = createMyScroll(wrapper);
	//回退事件处理
	sale_schedule_edit_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page();
	});

	//保存按钮-->
	sale_schedule_edit_page.find(".SaveBtn1").live('tap',function(){
		
		//非空校验
		showConfirm("请确认数据是否无误，无误后确认保存", function(){
			
			saleScheduleEditPage_SaveSaleSchedule();
			
		});
		
	});
	
	$('#saleScheduleEditPage-ScheduleStartTime').mobiscroll().range({
		
	    endInput: '#saleScheduleEditPage-ScheduleEndTime',
	    controls: ['date', 'time'],
	    dateWheels: '|D M d|',
	    cssClass: 'scroller-range',
	    onBeforeShow: function (event, inst) {
	    	var startTime = new Date($('#saleScheduleEditPage-ScheduleStartTime').val());
	    	var endTime = new Date($('#saleScheduleEditPage-ScheduleEndTime').val());
	    	inst.setVal([startTime, endTime],true);
        }
	});
	
});//end pageinit

sale_schedule_edit_page.live('pageshow',function(e, ui){
	
	currentLoadActionName = "sale_schedule_edit_load_content";
    
	load_sale_schedule_edit_content();
});
function sale_schedule_edit_load_content(){
	
}
//加载日程页面初始化数据，并显示
function load_sale_schedule_edit_content(){
	var $currentPage = $("#sale_schedule_edit_page");
//	$currentPage.find("input[name='taskContent']").val("");
	$currentPage.find("input[name='scheduleDate']").val("");
//	$currentPage.find("input[name='scheduleTimeRange']").val();//默认值为当前时间至下班时间
	$currentPage.find("textarea[name='taskContent']").val("");
//	$currentPage.find("textarea[name='taskDescription']").val("");
	
	showLoading();
	var postData ={};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	postData.saleScheduleId = session.get("saleScheduleId");
	
	$.getJSON(basePath+"/app/saleScheduleEdit/pageInit.xhtml"+callback, postData,function(msg){
		
		if($.trim(msg.returnCode) == '0') {
			showHide();
			if(msg.data){
				
				var data = msg.data;
				//初始化日程信息
				var saleSchedule = data.saleSchedule;
				var $saleScheduleInfo = $("#sale_schedule_edit_page .basicInfo1");
				dataBindToElement($saleScheduleInfo,saleSchedule);

				var startDatetime = saleSchedule.startTime;
				initStartTime = startDatetime;//初始化时日程开始时间
				var startDatetimeArray = startDatetime.split(" ");//2017-06-30 19:30:00
				var startDateArray = startDatetimeArray[0].split("-");//2017-06-30
				var startTimeArray = startDatetimeArray[1].split(":");//19:30:00
				
				var startYear = startDateArray[0];
				var startMonth = startDateArray[1]-1;
				var startDay = startDateArray[2];
				var startHour = startTimeArray[0];
				var startMinute = startTimeArray[1];

				var endDatetime = saleSchedule.endTime;
				initEndDatetime = endDatetime;//初始化时日程结束时间
				var endDatetimeArray = endDatetime.split(" ");//2017-06-30 19:30:00
				var endDateArray = endDatetimeArray[0].split("-");//2017-06-30
				var endTimeArray = endDatetimeArray[1].split(":");//19:30:00
				    
				var endYear = endDateArray[0];
				var endMonth = endDateArray[1]-1;
				var endDay = endDateArray[2];
				var endHour = endTimeArray[0];
				var endMinute = endTimeArray[1];
				
				var startTime = new Date(startYear, startMonth,startDay,startHour,startMinute);
				var endTime = new Date(endYear, endMonth,endDay,endHour,endMinute);
//				initStartTimeDate = startTime;
//				initEndTimeDate = endTime;
				
				$('#saleScheduleEditPage-ScheduleStartTime').mobiscroll('setVal', [startTime,endTime ],true);
				
				//初始化日程类型列表
				var $saleScheduleType = $("#saleScheduleEditPage-SaleScheduleType");
				$saleScheduleType.empty();
				$.each(data.saleScheduleTypeList,function(i,n){
					
					if(n.code == saleSchedule.scheduleType){
						var templateItem = '<option selected value="'+n.code+'">'+n.name+'</option>';
						$saleScheduleType.append(templateItem);
						
					}
					else{
						var templateItem = '<option value="'+n.code+'">'+n.name+'</option>';
						$saleScheduleType.append(templateItem);
					}
				});
				
				//日程类型数据初始化
				$("#saleScheduleEditPage-SaleScheduleType").mobiscroll().select({
				        minWidth: 200,
				        onSet: function (event, inst) {
				        	
				        	//如果日程类型是拜访经销商，则显示经销商选择列表
				        	var $dealerContainer = $(this).parent("li").next();
				        	if(inst.getVal() == ConstDef.getConstant("DICTIONARY_CODE_SALE_DRM_VISIT_DEALER")){
				        		$dealerContainer.show();
//				        		$("#saleScheduleEditPage-dealersByDrm").mobiscroll('setVal',"",true);
				        	}
				        	else{
				        		$dealerContainer.hide();
				        		$("#saleScheduleEditPage-dealersByDrm").mobiscroll('setVal',"",true);
				        	}
				        }
				 });
				
				//初始化经销商列表 数据
				var dealersByDrm = data.dealersByDrm;
				var $dealersByDrmSelect = $("#saleScheduleEditPage-dealersByDrm");
				$dealersByDrmSelect.empty();
				$dealersByDrmSelect.append('<option value="">请选择</option>');
				$.each(dealersByDrm,function(i,n){
					if(n.code == saleSchedule.dealerCode){
						var templateItem = '<option selected value="'+n.code+'">'+n.name+'</option>';
						$dealersByDrmSelect.append(templateItem);
					}
					else{
						var templateItem = '<option value="'+n.code+'">'+n.name+'</option>';
						$dealersByDrmSelect.append(templateItem);
					}
					
				});
				
				//初始化经销商列表 组件
				$("#saleScheduleEditPage-dealersByDrm").mobiscroll().select({
				        minWidth: 200,
				        onBeforeShow: function (event, inst) {
				        	var dealersCount = $("#saleScheduleEditPage-dealersByDrm").find("option").length-1;
				        	if(dealersCount > 0){
				        		return true;
				        	}
				        	else{
				        		showMessage("没有可选择的经销商，您将不能保存拜访经销商类型的日程！",5000);
				        		return false;
				        	}
//				        	if(inst.getVal()){
//				        		return true;
//				        	}
//				        	else{
//				        		showMessage("没有可选择的经销商，您将不能保存拜访经销商类型的日程！",5000);
//				        		return false;
//				        	}
				        }
				});
				
				//根据日程类型是否拜访经销商   显示或隐藏经销商
				if(saleSchedule.scheduleType == ConstDef.getConstant("DICTIONARY_CODE_SALE_DRM_VISIT_DEALER")){
					$("#saleScheduleEditPage-dealersByDrm").parent("li").show();
					
				}
				else{
					$("#saleScheduleEditPage-dealersByDrm").parent("li").hide();
				}
			}
		}
		else{
			errorHandler(msg.returnCode,msg.message);
		}
	});//end $.getJSON
}

function saleScheduleEditPage_SaveSaleSchedule(){
	showLoading();
	var postData ={};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");

	var $currentPage = $("#sale_schedule_edit_page");
	postData.saleScheduleId = session.get("saleScheduleId");
	postData.scheduleType = $currentPage.find("select[name='saleScheduleType']").val();
	postData.dealerCode = $currentPage.find("select[name='dealersByDrm']").val();
	if( postData.scheduleType === ConstDef.getConstant("DICTIONARY_CODE_SALE_DRM_VISIT_DEALER") && !postData.dealerCode){
		showMessage("当日程类型为拜访经销时，经销商不能为空！！");
		return;
	}
	var dealerName = $currentPage.find("select[name='dealersByDrm'] option:selected").text();
	postData.dealerName = dealerName =="请选择"?"":dealerName;
	postData.taskContent = $currentPage.find("textarea[name='taskContent']").val();

	postData.initStartTime = initStartTime;//初始化时日程开始时间
	postData.initEndDatetime = initEndDatetime;//初始化时日程结束时间
	postData.startTime = Format(new Date($currentPage.find("input[identity='startTime']").val()),"yyyy-MM-dd HH:mm:ss");
	postData.endTime = Format(new Date($currentPage.find("input[identity='endTime']").val()),"yyyy-MM-dd HH:mm:ss");
	var startDate = postData.startTime.substr(0,10);
	var endDate = postData.endTime.substr(0,10);
	if(startDate != endDate){
		showMessage("开始时间与结束时间必须在同一天！！");
		return;
	}
//	postData.taskDescription = $currentPage.find("textarea[name='taskDescription']").val();

	//将日程数据上传到服务器
	$.ajax({
		url: basePath+"/app/saleScheduleEdit/saveSaleSchedule.xhtml"+callback, //这个地址做了跨域处理
		data: postData,
		type: 'POST',
		dataType: 'json',
		async:false,
		beforeSend: function () {
			
		},
		success: function (msg) {

			showHide();

			if($.trim(msg.returnCode) == '0') {
				var result = msg.data;
				if(result == 1){
					//保存成功，返回我的日程页面
					showMessage("保存成功",'5000');
					setTimeout(function(){
						back_page();
					},1500);
				}
//				else if(result == -1){
//					showMessage("日程开始时间设定不符合要求，已按排其它日程",'5000');	
//				}
				else if(result == -2){
					showMessage("日程时间设定无效，请检查设定的日程时间内是否按排其它日程。",'5000');	
				}
				else if(result == -3){
//					showMessage("日程已结束，不允许修改！",'5000');	
					showMessage("日程结束时间应晚于当前时间！",'5000');	
				}
//				else if(result == -4){
//					showMessage("日程已在进行中，不允许修改！",'5000');	
//				}
				else if(result == -5){
					showMessage("日程已在进行中，不允许修改开始时间！",'5000');	
//					$('#saleScheduleEditPage-ScheduleStartTime').mobiscroll('setVal', [initStartTimeDate,new Date($currentPage.find("input[identity='endTime']").val()) ],true);
				}
			}
			else{
				errorHandler(msg.returnCode,msg.message);
			}
		},
		complete: function() {

		}
	});//end $.ajax
}