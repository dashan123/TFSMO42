var sale_schedule_add_page = $('#sale_schedule_add_page');

var sale_schedule_add_myScroll;
/******************************home_page---begin**************************************/
sale_schedule_add_page.live('pageinit',function(e,ui){
	
	var wrapper = "sale_schedule_add_wrapper";
//	var up = "fi_normal_schedule_add_pullUp";
//	var down = "fi_normal_schedule_add_pullDown";
//	sale_schedule_add_myScroll = createMyScroll(wrapper,up,down);
	sale_schedule_add_myScroll = createMyScroll(wrapper);
	//回退事件处理
	sale_schedule_add_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page();
	});

	//保存按钮-->
	sale_schedule_add_page.find(".SaveBtn1").live('tap',function(){
		
		//非空校验
		
		showConfirm("请确认数据是否无误，无误后确认保存!", function(){
			
			saleScheduleAddPage_SaveSaleSchedule();
			
		});
		
	});
	
	//选择日程日期的时间范围
	$('#saleScheduleAddPage-ScheduleTimeRange').mobiscroll().range({
        theme: 'red',
        lang: 'zh',
        display: 'bottom',
        controls: ['time'],
//        min: new Date(),
        maxWidth: 100
    });
	
});//end pageinit

sale_schedule_add_page.live('pageshow',function(e, ui){
	
	currentLoadActionName = "sale_schedule_add_load_content";
    
	load_sale_schedule_add_content();
});
function sale_schedule_add_load_content(){
	
}
//加载日程页面初始化数据，并显示
function load_sale_schedule_add_content(){
	var $currentPage = $("#sale_schedule_add_page");
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
	
	$.getJSON(basePath+"/app/saleScheduleAdd/pageInit.xhtml"+callback, postData,function(msg){
		
		if($.trim(msg.returnCode) == '0') {
			showHide();
			if(msg.data){
				
				var data = msg.data;
				
				//初始化日程类型列表
				var $saleScheduleType = $("#saleScheduleAddPage-SaleScheduleType");
				$saleScheduleType.empty();
				$saleScheduleType.append('<option value="">请选择</option>');
				$.each(data.saleScheduleTypeList,function(i,n){
					var templateItem = '<option value="'+n.code+'">'+n.name+'</option>';
					$saleScheduleType.append(templateItem);
					
					//以下代码默认显示拜访经销商
//					if(n.code == ConstDef.getConstant("DICTIONARY_CODE_SALE_DRM_VISIT_DEALER")){
//						var templateItem = '<option selected value="'+n.code+'">'+n.name+'</option>';
//						$saleScheduleType.append(templateItem);
//					}
//					else{
//						var templateItem = '<option value="'+n.code+'">'+n.name+'</option>';
//						$saleScheduleType.append(templateItem);
//					}
					
				});
				//日程类型数据初始化
				$("#saleScheduleAddPage-SaleScheduleType").mobiscroll().select({
				        theme: 'red',
				        lang: 'zh',
				        display: 'bottom',
				        minWidth: 200,
				        onSet: function (event, inst) {
				        	
				        	//如果日程类型是拜访经销商，则显示经销商选择列表
				        	var $dealerContainer = $(this).parent("li").next();
				        	if(inst.getVal() == ConstDef.getConstant("DICTIONARY_CODE_SALE_DRM_VISIT_DEALER")){
				        		$dealerContainer.show();
				        	}
				        	else{
				        		$dealerContainer.hide();
				        	}
				        }
				    });
				
				//初始化日程日期
				var schduleDate = session.get("scheduleDate")
				$currentPage.find("input[name='scheduleDate']").val(schduleDate);
				
//				var year = schduleDate.substr(0,4);
//				var month = schduleDate.substr(5,2);
//				var day = schduleDate.substr(8,2);
//				var amStartWorkTime = data.amStartWorkTime;
//				var pmEndWorkTime = data.pmEndWorkTime;
//				
//				var startHour = amStartWorkTime.split(":")[0];
//				var startMinute = amStartWorkTime.split(":")[1];
//				var startDate = new Date(year, month,day,startHour,startMinute);
//				var endHour = pmEndWorkTime.split(":")[0];
//				var endMinute = pmEndWorkTime.split(":")[1];
//				var endDate = new Date(year, month,day,endHour,endMinute);
				
				//初始化日程时间范围
				
//				$('#saleScheduleAddPage-ScheduleTimeRange').mobiscroll("option",{
//					min: minDate
//				});
//				$('#saleScheduleAddPage-ScheduleTimeRange').mobiscroll('setVal', [startDate, endDate],true);
				$('#saleScheduleAddPage-ScheduleTimeRange').mobiscroll('clear');

				//初始化经销商列表 数据
				var dealersByDrm = data.dealersByDrm;
				var $dealersByDrmSelect = $("#saleScheduleAddPage-dealersByDrm");
				$dealersByDrmSelect.empty();
				$dealersByDrmSelect.append('<option value="">请选择</option>');
				$.each(dealersByDrm,function(i,n){
					
					var templateItem = '<option value="'+n.code+'">'+n.name+'</option>';
					$dealersByDrmSelect.append(templateItem);
				});
				//初始化经销商列表 组件
				$("#saleScheduleAddPage-dealersByDrm").mobiscroll().select({
				        theme: 'red',
				        lang: 'zh',
				        display: 'bottom',
				        minWidth: 200,
				        onBeforeShow: function (event, inst) {
				        	var dealersCount = $("#saleScheduleAddPage-dealersByDrm").find("option").length-1;
				        	if(dealersCount > 0){
				        		return true;
				        	}
				        	else{
				        		showMessage("没有可选择的经销商，您将不能保存拜访经销商类型的日程！",5000);
				        		return false;
				        	}
//				        	debugger;
//				        	if(inst.getVal.length > 1){
//				        		return true;
//				        	}
//				        	else{
//				        		showMessage("没有可选择的经销商，您将不能保存拜访经销商类型的日程！",5000);
//				        		return false;
//				        	}
				        }
				});
				
				//根据日程类型是否拜访经销商显示或隐藏经销商
				if($("#saleScheduleAddPage-SaleScheduleType").mobiscroll("getVal") == ConstDef.getConstant("DICTIONARY_CODE_SALE_DRM_VISIT_DEALER")){
					$("#saleScheduleAddPage-dealersByDrm").parent("li").show();
				}
				else{
					$("#saleScheduleAddPage-dealersByDrm").parent("li").hide();
				}
			}
		}
		else{
			errorHandler(msg.returnCode,msg.message);
		}
	});//end $.getJSON
}

function saleScheduleAddPage_SaveSaleSchedule(){
	showLoading();
	var postData ={};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	
	var $currentPage = $("#sale_schedule_add_page");
	postData.scheduleType = $currentPage.find("select[name='saleScheduleType']").val();
	if(!postData.scheduleType){
		showMessage("请选择日程类型！");
		return;
	}
	
	postData.dealerCode = $currentPage.find("select[name='dealersByDrm']").val();
	if( postData.scheduleType === ConstDef.getConstant("DICTIONARY_CODE_SALE_DRM_VISIT_DEALER") && !postData.dealerCode){
		showMessage("请选择经销商！");
		return;
	}
	var dealerName = $currentPage.find("select[name='dealersByDrm'] option:selected").text();
	postData.dealerName = dealerName =="请选择"?"":dealerName;
	postData.taskContent = $currentPage.find("textarea[name='taskContent']").val();
	postData.scheduleDate = $currentPage.find("input[name='scheduleDate']").val();
	postData.scheduleTimeRange = $currentPage.find("input[name='scheduleTimeRange']").val();
	if(!postData.scheduleTimeRange){
		showMessage("请选择日程起止时间！");
		return;
	}
//	postData.taskDescription = $currentPage.find("textarea[name='taskDescription']").val();
	
	//将日程数据上传到服务器
	$.ajax({
		url: basePath+"/app/saleScheduleAdd/saveSaleSchedule.xhtml"+callback, //这个地址做了跨域处理
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
//					showMessage("日程开始时间设定不符合要求，已按排其它日程",'3000');	
//				}
				else if(result == -2){
					showMessage("日程时间设定无效，请检查设定的日程时间内是否按排其它日程。",'5000');	
				}
				else if(result == -3){
					showMessage("日程开始时间设定不符合要求，在当前时间之前",'5000');	
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