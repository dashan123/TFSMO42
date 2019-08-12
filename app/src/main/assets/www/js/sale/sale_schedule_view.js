var sale_schedule_view_page = $('#sale_schedule_view_page');

var sale_schedule_view_myScroll;
/******************************home_page---begin**************************************/
sale_schedule_view_page.live('pageinit',function(e,ui){
	
	var wrapper = "sale_schedule_view_wrapper";
//	var up = "sale_schedule_view_pullUp";
//	var down = "sale_schedule_view_pullDown";
//	sale_schedule_view_myScroll = createMyScroll(wrapper,up,down);
	sale_schedule_view_myScroll = createMyScroll(wrapper);
	//回退事件处理
	sale_schedule_view_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page();
	});
	
});//end pageinit

sale_schedule_view_page.live('pageshow',function(e, ui){
	
	currentLoadActionName = "sale_schedule_view_load_content";
    
	load_sale_schedule_view_content();
});
function sale_schedule_view_load_content(){
	
}
//加载销售日程页面初始化数据，并显示
function load_sale_schedule_view_content(){
	var $currentPage = $("#sale_schedule_view_page");
	$currentPage.find("[identity]").empty();
	showLoading();
	var postData ={};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	postData.saleScheduleId = session.get("saleScheduleId");
	
	$.getJSON(basePath+"/app/saleScheduleView/pageInit.xhtml"+callback, postData,function(msg){
		
		if($.trim(msg.returnCode) == '0') {
			showHide();
			if(msg.data){
				
				var data = msg.data;
				
				var $saleScheduleInfo = $("#sale_schedule_view_page .basicInfo1");
				dataBindToElement($saleScheduleInfo,data.saleSchedule);
				
				//如果日程类型是拜访经销商或者内勤，则显示经销商信息
				var $scheduleTypeElement = $saleScheduleInfo.find('[identity="scheduleType"]');
				var $dealerNameElement = $saleScheduleInfo.find('[identity="dealerName"]');
	        	var scheduleType = $scheduleTypeElement.text();
//	        	if(scheduleType == ConstDef.getConstant("DICTIONARY_CODE_SALE_DRM_VISIT_DEALER") 
//	        			||scheduleType == ConstDef.getConstant("DICTIONARY_CODE_SALE_OFFICE_WORK") ){
        		if(scheduleType == ConstDef.getConstant("DICTIONARY_CODE_SALE_DRM_VISIT_DEALER")){
	        		$dealerNameElement.parent().show();
	        	}
	        	else{
	        		$dealerNameElement.parent().hide();
	        	}
				
				//将开始时间与结束时间格式化
				var $startTimeElement = $saleScheduleInfo.find('[identity="startTime"]');
				$startTimeElement.text($startTimeElement.text().substring(0,16));
				var $endTimeElement = $saleScheduleInfo.find('[identity="endTime"]');
				$endTimeElement.text($endTimeElement.text().substring(0,16));
				
			}
		}
		else{
			errorHandler(msg.returnCode,msg.message);
		}
		
	});//end $.getJSON
	
}