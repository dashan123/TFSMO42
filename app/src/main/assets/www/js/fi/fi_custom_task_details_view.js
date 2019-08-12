var fi_custom_task_details_view_page = $('#fi_custom_task_details_view_page');

var fi_custom_task_details_view_myScroll;

var fiCustomTaskDetailsView_deletedPlanAddress = new Array();//删除的预约地址
/******************************home_page---begin**************************************/
fi_custom_task_details_view_page.live('pageinit',function(e,ui){
	
	var wrapper = "fi_custom_task_details_view_wrapper";
	var up = "fi_custom_task_details_view_pullUp";
	var down = "fi_custom_task_details_view_pullDown";
	fi_custom_task_details_view_myScroll = createMyScroll(wrapper,up,down);
//	//scroll位置
//	var scrollMapJSON = {};
//	scrollMapJSON.organizationid = organizationid;
//	scrollMap.contacts_dept_page = JSON.stringify(scrollMapJSON);
	//回退事件处理
	fi_custom_task_details_view_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page();
	});
	fi_custom_task_details_view_page.find("[tag='fi_custom_task_details_view_page'] li:first").live("tap",function(event){
		
		showConfirmDialog("取消后不可再进行更改，是否取消？",{}, function(){
			//取消
			var finishStatus = "QX";
			fiCustomTaskDetailsView_finishCustomTask(finishStatus);
		});
		
	});
	fi_custom_task_details_view_page.find("[tag='fi_custom_task_details_view_page'] li:last").live("tap",function(event){
		showConfirmDialog("正常完成后不可再进行更改，是否继续？",{}, function(){
			//正常
			var finishStatus = "ZC";
			fiCustomTaskDetailsView_finishCustomTask(finishStatus);
		});
		
	});
});//end pageinit

fi_custom_task_details_view_page.live('pageshow',function(e, ui){

	currentLoadActionName  = "fi_custom_task_details_view_load_content";
	load_fi_custom_task_details_view_content();

});//end pageshow

function fi_custom_task_details_view_load_content(){
	//下拉不刷新，则该方法置空
}
//加载页面初始化数据，并显示
function load_fi_custom_task_details_view_content(){

	showLoading();
	var postData ={};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	postData.taskId = session.get("taskId");//家访任务Id
	
	if(session.get("taskId")){
		$.getJSON(basePath+"/app/fiCustomTaskDetailsView/pageInit.xhtml"+callback, postData,function(msg){
			
			if($.trim(msg.returnCode) == '0') {
				showHide();
				if(msg.data){
					
					var data = msg.data;
					
					var detailsElement = $("#fiCustomTaskDetailsViewPage_Details");
					
					//绑定任务信息
					var fiCustomTask = data.fiCustomTask;
					if(fiCustomTask){
						dataBindToElement(detailsElement,fiCustomTask);
						if(fiCustomTask.finishStatus=="ZC" || fiCustomTask.finishStatus=="QX"){
							//隐藏按钮
							$("#fi_custom_task_details_view_page").find("ul.bottoms2-red").hide();
						}
						else{
							$("#fi_custom_task_details_view_page").find("ul.bottoms2-red").show();
						}
					}
							
					//绑定自定义任务计划地址
					var planAddressList = data.planAddressList;
					if(planAddressList){
						$("#fiCustomTaskDetailsViewPage_fiFieldDetails").empty();
						var $templatePlanAddressItem = $('#fi_custom_task_details_view_page').find("[template-id='planAddress'] li");
						$.each(planAddressList,function(i,n){
							var $planAddressItemElement = $templatePlanAddressItem.clone(true);
							dataBindToElement($planAddressItemElement,n);

							$("#fiCustomTaskDetailsViewPage_fiFieldDetails").append($planAddressItemElement);
						});
					} 
					
					
				}//end if(msg.data){
			}
			else{
				errorHandler(msg.returnCode,msg.message);
			}
			
		});//end $.getJSON
	}
	else{}
}
//加载页面初始化数据，并显示
function fiCustomTaskDetailsView_finishCustomTask(finishStatus){

	showLoading();
	var postData ={};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	postData.taskId = session.get("taskId");//家访任务Id
	postData.finishStatus = finishStatus;//家访任务完成状态
	
	if(session.get("taskId")){
		$.getJSON(basePath+"/app/fiCustomTaskDetailsView/finishCustomTask.xhtml"+callback, postData,function(msg){
			
			if($.trim(msg.returnCode) == '0') {
				showHide();
				if(msg.data){
					
					var data = msg.data;
					
					if(data == "1"){
						showMessage("自定义任务成功完成",2000);
						setTimeout(function(){
							session.set("refreshFiMySchedulePage","true");
							back_page();
						}, 1500);
					}
					else if(data == "-5"){
						showMessage("该任务有正在进行中的计划地址，不允许完成",2000);
					}
					else{
						showMessage("自定义任务完成失败",2000);
					}
				}//end if(msg.data){
			}
			else{
				errorHandler(msg.returnCode,msg.message);
			}
			
		});//end $.getJSON
	}
	else{
		
	}
}