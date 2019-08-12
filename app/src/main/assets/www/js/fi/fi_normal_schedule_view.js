var fi_normal_schedule_view_page = $('#fi_normal_schedule_view_page');

//var collectingAddressListPageHandler ={};

var fi_normal_schedule_view_myScroll;
/******************************home_page---begin**************************************/
fi_normal_schedule_view_page.live('pageinit',function(e,ui){
	
	var wrapper = "fi_normal_schedule_view_wrapper";
//	var up = "fi_normal_schedule_view_pullUp";
//	var down = "fi_normal_schedule_view_pullDown";
//	fi_normal_schedule_view_myScroll = createMyScroll(wrapper,up,down);
	fi_normal_schedule_view_myScroll = createMyScroll(wrapper);
	//回退事件处理
	fi_normal_schedule_view_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page();
	});
	
});//end pageinit

fi_normal_schedule_view_page.live('pageshow',function(e, ui){
	
	currentLoadActionName = "fi_normal_schedule_view_load_content";
    
	load_fi_normal_schedule_view_content();
});
function fi_normal_schedule_view_load_content(){
	
}
//加载普通日程页面初始化数据，并显示
function load_fi_normal_schedule_view_content(){
	var $currentPage = $("#fi_normal_schedule_view_page");
	$currentPage.find("[identity]").empty();
	showLoading();
	var postData ={};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	postData.normalScheduleId = session.get("normalScheduleId");
	
	$.getJSON(basePath+"/app/fiNormalScheduleView/pageInit.xhtml"+callback, postData,function(msg){
		
		if($.trim(msg.returnCode) == '0') {
			showHide();
			if(msg.data){
				
				var data = msg.data;
				
				var $normalScheduleInfo = $("#fi_normal_schedule_view_page .basicInfo1");
				dataBindToElement($normalScheduleInfo,data.commonNormalSchedule);
				
				//将开始时间与结束时间格式化
				var $startTimeElement = $normalScheduleInfo.find('[identity="startTime"]');
				$startTimeElement.text($startTimeElement.text().substring(0,16));
				var $endTimeElement = $normalScheduleInfo.find('[identity="endTime"]');
				$endTimeElement.text($endTimeElement.text().substring(0,16));
				
			}
		}
		else{
			errorHandler(msg.returnCode,msg.message);
		}
		
	});//end $.getJSON
	
}