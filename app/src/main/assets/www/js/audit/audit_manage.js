var audit_manage_page = $('#audit_manage_page');
var audit_manage_myScroll;
/******************************home_page---begin**************************************/
audit_manage_page.live('pageinit',function(e,ui){
	
	var wrapper = "audit_manage_wrapper";
	var up = "audit_manage_pullUp";
	var down = "audit_manage_pullDown";
	audit_manage_myScroll = createMyScroll(wrapper,up,down);
//	//scroll位置
//	var scrollMapJSON = {};
//	scrollMapJSON.organizationid = organizationid;
//	scrollMap.contacts_dept_page = JSON.stringify(scrollMapJSON);
	//回退事件处理
	audit_manage_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page('workbench_page');
	});

});//end pageinit


audit_manage_page.live('pageshow',function(e, ui){

	currentLoadActionName  = "audit_manage_load_content";
	load_audit_manage_content();
	
});//end pageshow

function audit_manage_load_content(){
	//下拉不刷新，则该方法置空
}
//加载页面初始化数据，并显示
function load_audit_manage_content(){
	$('#auditManageMonthList').empty();
	showLoading();
	var postData ={};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	
	$.getJSON(basePath+"/app/auditManage/pageInit.xhtml"+callback, postData,function(msg){

		if($.trim(msg.returnCode) == '0') {
			showHide();
			if(msg.data){
				
				var data = msg.data;
				
				// 盘库计划月份列表初始化
				var $templatePlanMonthListItem = $('#audit_manage_page').find("[template-id='planMonthListItem']");
				$.each(data.top12PlanMonths,function(i,n){
					var $planMonthListItem = $templatePlanMonthListItem.clone(true);
					$planMonthListItem.find("[identity='auditPlanMonth']").text(n);
					
					$planMonthListItem.bind("tap",function(event){
						var planMonth = $(this).find("[identity='auditPlanMonth']").text();
						//跳转至 盘库 任务列表 页面
						session.set("planMonth",planMonth);
						goto_page("audit_task_list_page");
//						var taskId = $(this).find("[identity='taskId']").text();
//						var taskType = $(this).find("[identity='taskType']").text();
//						session.set("taskId",taskId);
//						
//						if(taskType === "FI"){
//							//跳转至 家访任务详情编辑页面
//							goto_page("fi_task_details_edit_page");
//						}
//						else{
//							//跳转至 家访任务详情编辑页面
//							goto_page("fi_custom_task_details_edit_page");
//						}
					});
					
					$planMonthListItem.show();
					 $('#auditManageMonthList').append($planMonthListItem);
				});//end each
				
			}//end if(msg.data){
		}
		else{
			errorHandler(msg.returnCode,msg.message);
		}
		
	});//end $.getJSON
	
}

//查询待办任务列表
function auditManagePage_queryTodoTaskList(){
	
	$('#audit_manage').empty();
	showLoading();
	var postData ={};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	postData.taskType = $("#auditManagePage-taskType").val();
	var dateRange = $('#auditManagePage-dateRange').mobiscroll('getVal');
	if(dateRange){
		if(dateRange[0] != null && dateRange[1] != null){
			postData.startDate = Format(dateRange[0],"yyyy-MM-dd");
			postData.endDate = Format(dateRange[1],"yyyy-MM-dd");
		}
	}

	$.getJSON(basePath+"/app/fiTodoTaskList/queryTodoTasks.xhtml"+callback, postData,function(msg){
		
		if($.trim(msg.returnCode) == '0') {
			showHide();
			if(msg.data){
				
				var data = msg.data;
				auditManagePage_bindDataToPage(data);
			}//end if(msg.data){
		}
		else{
			errorHandler(msg.returnCode,msg.message);
		}
		
	});//end $.getJSON
}