var fi_task_details_edit01_page = $('#fi_task_details_edit01_page');

//var collectingAddressListPageHandler ={};

var fi_task_details_edit01_myScroll;
/******************************home_page---begin**************************************/
fi_task_details_edit01_page.live('pageinit',function(e,ui){
	
	var wrapper = "fi_task_details_edit01_wrapper";
	var up = "fi_task_details_edit01_pullUp";
	var down = "fi_task_details_edit01_pullDown";
	fi_task_details_edit01_myScroll = createMyScroll(wrapper,up,down);

	//回退事件处理
	fi_task_details_edit01_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page();
	});

//	$("#fiTaskDetailsEdit-cancelReasonBox").attr("disabled","disabled");
	//选择取消原因
	$("#fiTaskDetailsEdit01-cancelReasonList").find("li:not(:last)").live("tap",function(event){
		
		 $(this).attr("class","selectedLiColor");
		 $(this).siblings().attr("class","unSelectedLiColor");
		 
//		 var selectedItemText = $(this).text();
//		 if(selectedItemText == "05:其它"){
//			 $("#fiTaskDetailsEdit-cancelReasonBox").removeAttr("disabled");
//		  }
//		  else{
//			  $("#fiTaskDetailsEdit-cancelReasonBox").attr("disabled","disabled");
//		  }
	});
	
	//提交
	$("#fiTaskDetailsEdit01_submitFiTaskDetails").live("tap",function(event){

		var cancelReason = $("#fiTaskDetailsEdit01-cancelReasonList li.selectedLiColor").text();
		
		if(!cancelReason){
			showMessage("请选择取消原因！！",2000);
			return;
		}
		
//		if("05:其它" === cancelReason){
//			
//			cancelReason = $("#fiTaskDetailsEdit-cancelReasonBox").val();
//			
//			if(!cancelReason){
//				showMessage("请填写取消原因！！",2000);
//				return;
//			}
//		}
		
		fiTaskDetailsEdit01_submitFiTaskDetails("QX",cancelReason)
			 
	});
	
});//end pageinit


fi_task_details_edit01_page.live('pageshow',function(e, ui){

	currentLoadActionName  = "fi_task_details_edit01_load_content";

});//end pageshow

function fi_task_details_edit01_load_content(){
	//下拉不刷新，则该方法置空
}
//加载页面初始化数据，并显示
function load_fi_task_details_edit01_content(){

	
}

function fiTaskDetailsEdit01_submitFiTaskDetails(submitType,cancelReason){
//	var postData = getDataFromElement($('#fiTaskDetailsEdit-reportDetails'));
	 
	var postData = {};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	postData.fiTaskId = session.get("fiTaskId");//获取家访任务Id
	postData.submitType = submitType;
	postData.cancelReason = cancelReason;
	
	$.getJSON(basePath+"/app/fiTaskDetailsEdit/cancelFiTask.xhtml"+callback, postData,function(msg){
		
		if($.trim(msg.returnCode) == '0') {
			showHide();
			if(msg.data){
				
				var data = msg.data;
				
				var result = data.result;
				if(result > 0){
					showMessage("家访任务取消成功！！",2000);
					setTimeout(function(){
						back_page();//此处注意不影响fi_my_schedule_page的回退
					}, 1500);
				}
				else if(result == -1){
					showMessage("家访任务已完成，不允许执行取消操作！！",2000);
				}
				else if(result == -2){
					showMessage("预约日期，完成日期任意一个为空，家访类型不是skip fi的，不可以提交！！",2000);
				}
				else if(result == -3){
					showMessage("提交类型为正常时，家访结束时间不能为空，请检查是否已开始并结束家访！！",2000);
				}
				else if(result == -4){
					showMessage("提交类型为正常时，必须要有家访报告，请检查是否已保存家访报告！！",2000);
				}
				else if(result == -5){
					showMessage("当前任务有正在进行中的计划地址，不允许提交！！",2000);
				}
				else{
					showMessage("家访报告取消失败！！",2000);
				}
				
			}//end if(msg.data){
		}
		else{
			errorHandler(msg.returnCode,msg.message);
		}
		
	});//end $.getJSON
}