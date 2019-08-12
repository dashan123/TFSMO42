var fi_task_report_view_page = $('#fi_task_report_view_page');

//var collectingAddressListPageHandler ={};

var fi_task_report_view_myScroll;
/******************************home_page---begin**************************************/
fi_task_report_view_page.live('pageinit',function(e,ui){
	
	var wrapper = "fi_task_report_view_wrapper";
	var up = "fi_task_report_view_pullUp";
	var down = "fi_task_report_view_pullDown";
	fi_task_report_view_myScroll = createMyScroll(wrapper,up,down);
//	//scroll位置
//	var scrollMapJSON = {};
//	scrollMapJSON.organizationid = organizationid;
//	scrollMap.contacts_dept_page = JSON.stringify(scrollMapJSON);
	//回退事件处理
	fi_task_report_view_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
//		back_page('workbench_page');
		back_page();
	});
	//点击展开/关闭列表
	fi_task_report_view_page.find("h2.ListTit:lt(2)").live("tap",function(e){
		var $contentElement = $(this).next("ul");
		if($contentElement.is(":visible")){
			$contentElement.hide();
			var $arrowElement = $(this).children("em");
			$arrowElement.removeClass("arrow-up");
			$arrowElement.addClass("arrow-down");
		}
		else{
			$contentElement.show();
			var $arrowElement = $(this).children("em");
			$arrowElement.removeClass("arrow-down");
			$arrowElement.addClass("arrow-up");
		}
	});
	fi_task_report_view_page.find(".segmentedButtonGroup input").live("tap",function(event){
		$(this).attr("class","segmentedButtons3Selected");
		$(this).siblings().attr("class","segmentedButtons3Unselected");
//		var fiRole = $(this).val();
		load_fi_task_report_view_content();
	});
	//跳转至任务详情查看页面
	$("ul[tag='fi_task_report_view_bottom'] li:first").live("tap",function(){

		var taskId = session.get("fiTaskId");
		session.set("taskId",taskId);//家访任务详情页面的任务Id为taskId
		var $toPage = $(this).attr("toPage");
		goto_page($toPage);
	});
	//跳转至拍照页面
	$("ul[tag='fi_task_report_view_bottom'] li:last").live("tap",function(){
		//传递家访报告Id
		var fiReportId = $('#fiTaskReportView-reportDetails').find("[identity='fiReportId']").val();
		if(fiReportId){
			
			session.set("businessId",fiReportId);
			var $toPage = $(this).attr("toPage");
			goto_page($toPage);
		}
		else{
			showMessage("当前家访角色没有家访报告与照片！！");
		}
		
	});
	
});//end pageinit


fi_task_report_view_page.live('pageshow',function(e, ui){

	currentLoadActionName  = "fi_task_report_view_load_content";
	load_fi_task_report_view_content();

});//end pageshow

function fi_task_report_view_load_content(){
	//下拉不刷新，则该方法置空
}
//加载页面初始化数据，并显示
function load_fi_task_report_view_content(){

	$('#fiTaskReportView-reportDetails').find("[identity]").text("");
	showLoading();
	var postData ={};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	postData.fiTaskId = session.get("fiTaskId");//获取家访任务Id
	postData.fiRole = $('#fiTaskReportView-reportDetails .segmentedButtonGroup input.segmentedButtons3Selected').val();
	
	$.getJSON(basePath+"/app/fiTaskReportView/pageInit.xhtml"+callback, postData,function(msg){
		
		if($.trim(msg.returnCode) == '0') {
			
			showHide();
			if(msg.data){
				
				var data = msg.data;
				
				var $applicantTab = $("#fiTaskReportView-reportDetails");
				var fiReport = data.report;
				if(fiReport){
					dataBindToElement($applicantTab,fiReport);
				}
				else{
					$('#fiTaskReportView-reportDetails').find("[identity='fiReportId']").val("");
				}
			
				//如果提交类型为正常，则不显示取消原因
//				var $submitTypeElement = $('#fiTaskReportView-reportDetails').find("[identity='submitType']");
//				var submitType = $submitTypeElement.text();
//				if(submitType == "QX"){
//					$submitTypeElement.parent("li").next().show();
//				}
//				else{
//					$submitTypeElement.parent("li").next().hide();
//				}
				//绑定实地地址fiTaskReportView-fieldAddressList
				$("#fiTaskReportView-fieldAddressList").empty();
				$.each(data.realAddress,function(i,n){
					
					var html = '<li><label for="">'+n.planAddressType+':</label><span style="display:inline-block;padding-right:10px;">'+(n.arrivalAddress?n.arrivalAddress:"")+'</span></li>';
					$("#fiTaskReportView-fieldAddressList").append(html);
					
				});
			}//end if(msg.data){
		}
		else{
			errorHandler(msg.returnCode,msg.message);
		}
		
	});//end $.getJSON

}
