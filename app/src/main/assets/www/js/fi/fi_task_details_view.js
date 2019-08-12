var fi_task_details_view_page = $('#fi_task_details_view_page');

//var collectingAddressListPageHandler ={};

var fi_task_details_view_myScroll;
/******************************home_page---begin**************************************/
fi_task_details_view_page.live('pageinit',function(e,ui){
	
	var wrapper = "fi_task_details_view_wrapper";
	var up = "fi_task_details_view_pullUp";
	var down = "fi_task_details_view_pullDown";
	fi_task_details_view_myScroll = createMyScroll(wrapper,up,down);
//	//scroll位置
//	var scrollMapJSON = {};
//	scrollMapJSON.organizationid = organizationid;
//	scrollMap.contacts_dept_page = JSON.stringify(scrollMapJSON);
	//回退事件处理
	fi_task_details_view_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
//		back_page('workbench_page');
		back_page();
	});

});//end pageinit


fi_task_details_view_page.live('pageshow',function(e, ui){

	currentLoadActionName  = "fi_task_details_view_load_content";
	load_fi_task_details_view_content();

});//end pageshow

function fi_task_details_view_load_content(){
	//下拉不刷新，则该方法置空
}
//加载页面初始化数据，并显示
function load_fi_task_details_view_content(){
//	$('#fi_task_details_view').empty();
	showLoading();
	var postData ={};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	postData.taskId = session.get("taskId");//获取家访任务Id
	
	$.getJSON(basePath+"/app/fiTaskDetailsView/pageInit.xhtml"+callback, postData,function(msg){
		
		if($.trim(msg.returnCode) == '0') {
			showHide();
			if(msg.data){
				
				var data = msg.data;
				
				var detailsElement = $("#fiTaskDetailsViewPage_Details");
				//绑定家访任务信息
				var fiTask = data.fiTask;
				dataBindToElement(detailsElement,fiTask);
				//格式化金额
				var loanAmount = formatNumberToThousands(detailsElement.find('[identity="loanAmount"]').text());
				detailsElement.find('[identity="loanAmount"]').text(loanAmount);
				
				var monthlyRepayment = formatNumberToThousands(detailsElement.find('[identity="monthlyRepayment"]').text());
				detailsElement.find('[identity="monthlyRepayment"]').text(monthlyRepayment);
				
				//绑定家访客户信息 customerInfoList
				$("#fiTaskDetailsViewPage_customerInfoList").empty();
				var $templateCustomerInfoItem = $('#fi_task_details_view_page').find("[template-id='customerInfo'] li");
				var customerInfoList = data.customerInfoList;
				$.each(customerInfoList,function(i,n){
					var $customerInfoItemElement = $templateCustomerInfoItem.clone(true);
					dataBindToElement($customerInfoItemElement,n);

					$customerInfoItemElement.find('[identity="maritalStatus"]').text(n.maritalStatus==true?"已婚":"未婚");//以文本方式显示婚姻状态
					$customerInfoItemElement.find('[identity="birthday"]').text(n.birthday.substring(0,10));//格式式出生日期
					
					$("#fiTaskDetailsViewPage_customerInfoList").append($customerInfoItemElement);
				});
				
				//绑定家访地址信息 fiAddressList
				
				$("#fiTaskDetailsViewPage_fiDemandList [_for='fiAddress']").remove();
				var $templateFiAddressItem = $('#fi_task_details_view_page').find("[template-id='fiAddress'] li");
				var fiAddressList = data.fiAddressList;
				$.each(fiAddressList,function(i,n){
					var $fiAddressItemElement = $templateFiAddressItem.clone(true);
					dataBindToElement($fiAddressItemElement,n);

					$("#fiTaskDetailsViewPage_fiDemandList").append($fiAddressItemElement);
				});
				
				//绑定预约地址信息 
				$("#fiTaskDetailsViewPage_fiFieldDetails [_for='fiAppointmentAddress']").remove();
				var $templateFiAppointmentAddressItem = $('#fi_task_details_view_page').find("[template-id='fiAppointmentAddress'] li");
				var appointmentAddressList = data.appointmentAddressList;
				$.each(appointmentAddressList,function(i,n){
					var $appointmentAddressItemElement = $templateFiAppointmentAddressItem.clone(true);
					dataBindToElement($appointmentAddressItemElement,n);
					$appointmentAddressItemElement.css("background-color",i%2==0?"#FFDDAA":"#FFEE99");
					$("#fiTaskDetailsViewPage_fiFieldDetails").append($appointmentAddressItemElement);
				});
				
			}//end if(msg.data){
		}
		else{
			errorHandler(msg.returnCode,msg.message);
		}
		
	});//end $.getJSON
	
}
