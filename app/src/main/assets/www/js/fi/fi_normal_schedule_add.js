var fi_normal_schedule_add_page = $('#fi_normal_schedule_add_page');

//var collectingAddressListPageHandler ={};

var fi_normal_schedule_add_myScroll;
/******************************home_page---begin**************************************/
fi_normal_schedule_add_page.live('pageinit',function(e,ui){
	
	var wrapper = "fi_normal_schedule_add_wrapper";
//	var up = "fi_normal_schedule_add_pullUp";
//	var down = "fi_normal_schedule_add_pullDown";
//	fi_normal_schedule_add_myScroll = createMyScroll(wrapper,up,down);
	fi_normal_schedule_add_myScroll = createMyScroll(wrapper);
	//回退事件处理
	fi_normal_schedule_add_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page();
	});

	//保存按钮-->
	fi_normal_schedule_add_page.find(".SaveBtn1").live('tap',function(){
		
		//非空校验
		
		showConfirm("请确认数据是否无误，无误后确认保存", function(){
			
			fiNormalScheduleAddPage_SaveNormalSchedule();
			
		});
		
	});
	
	//选择日程日期的时间范围
	$('#fiNormalScheduleAddPage-ScheduleTimeRange').mobiscroll().range({
        theme: 'red',
        lang: 'zh',
        display: 'bottom',
        controls: ['time'],
//        min: new Date(),
        maxWidth: 100
    });
	
});//end pageinit

fi_normal_schedule_add_page.live('pageshow',function(e, ui){
	
	currentLoadActionName = "fi_normal_schedule_add_load_content";
    
	load_fi_normal_schedule_add_content();
});
function fi_normal_schedule_add_load_content(){
	
}
//加载普通日程页面初始化数据，并显示
function load_fi_normal_schedule_add_content(){
	var $currentPage = $("#fi_normal_schedule_add_page");
//	var $collecting_address_list = $("#collecting_address_list_view_page .List");
//	$collecting_address_list.empty();
//	postData.scheduleType = $currentPage.find("select[name='normalScheduleType']").val();
	$currentPage.find("input[name='taskContent']").val("");
	$currentPage.find("input[name='scheduleDate']").val("");
//	$currentPage.find("input[name='scheduleTimeRange']").val();//默认值为当前时间至下班时间
	$currentPage.find("textarea[name='taskDescription']").val("");
	
	showLoading();
	var postData ={};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	
	$.getJSON(basePath+"/app/fiNormalScheduleAdd/pageInit.xhtml"+callback, postData,function(msg){
		
		if($.trim(msg.returnCode) == '0') {
			showHide();
			if(msg.data){
				
				var data = msg.data;
				
				//初始化日程类型列表
				var $normalScheduleType = $("#fiNormalScheduleAddPage-NormalScheduleType");
				$normalScheduleType.empty();
				$.each(data.normalScheduleTypeList,function(i,n){
					
					var templateItem = '<option value="'+n.code+'">'+n.name+'</option>';
					$normalScheduleType.append(templateItem);
				});
				//日程类型数据初始化
				$("#fiNormalScheduleAddPage-NormalScheduleType").mobiscroll().select({
				        theme: 'red',
				        lang: 'zh',
				        display: 'bottom',
				        minWidth: 200
				    });
				//初始化日程日期
				$currentPage.find("input[name='scheduleDate']").val(session.get("scheduleDate"));
				//初始化日程时间范围
//				var startTime =Format(new Date(),"HH:mm");
				var startTime = data.amStartWorkTime;
				var endTime = data.pmEndWorkTime;
				$currentPage.find("input[name='scheduleTimeRange']").val(startTime+" - "+endTime);//默认值为当前时间至下班时间
				// With selector
//				$('#fiNormalScheduleAddPage-ScheduleTimeRange').mobiscroll('setVal', [new Date(2016, 1, 1), new Date(2016, 1, 7)]);
//				$('#fiNormalScheduleAddPage-ScheduleTimeRange').mobiscroll('setArrayVal', [4, 5]);
			}
		}
		else{
			errorHandler(msg.returnCode,msg.message);
		}
	});//end $.getJSON
}
function fiNormalScheduleAddPage_SaveNormalSchedule(){
	showLoading();
	var postData ={};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	
	var $currentPage = $("#fi_normal_schedule_add_page");
	postData.scheduleType = $currentPage.find("select[name='normalScheduleType']").val();
	postData.taskContent = $currentPage.find("input[name='taskContent']").val();
	postData.scheduleDate = $currentPage.find("input[name='scheduleDate']").val();
	postData.scheduleTimeRange = $currentPage.find("input[name='scheduleTimeRange']").val();
	postData.taskDescription = $currentPage.find("textarea[name='taskDescription']").val();
	
	//将普通日程数据上传到服务器
	$.ajax({
		url: basePath+"/app/fiNormalScheduleAdd/saveNormalSchedule.xhtml"+callback, //这个地址做了跨域处理
		data: postData,
		type: 'POST',
		dataType: 'json',
		async:false,
		beforeSend: function () {
			
		},
		success: function (msg) {

			showHide();

			if($.trim(msg.returnCode) == '0') {

				if(msg.data == true){
					//保存成功，返回我的日程页面
					showMessage("保存成功",'1000');
					setTimeout(function(){
						back_page();
					},2500);
					
				}
				else{
					showMessage("保存失败",'1000');	
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