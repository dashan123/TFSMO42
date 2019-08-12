var case_message_upload_page = $('#case_message_upload_page');

/******************************case_message_upload_page---begin**************************************/	   
case_message_upload_page.live('pageinit', function(e, ui) {
	
	case_message_upload_page.find(".BackBtn").live("tap", function() {

		back_page();
	});

	// 点击提交
	case_message_upload_page.find(".SaveBtn2").live("tap", function() {
		submitMessage();
	});

});

case_message_upload_page.live('pageshow', function(e, ui) {
	
	$('#case_message_upload_page').find("[identity='received_amount']").val("");
});


function submitMessage() {

	showLoading();

	var userInfo = JSON.parse(session.get("userInfo"));
	var authData = {};
	//获取当前时间
	var currentDatetime = new Date().Format("YYYY/MM/DD HH/mm/ss");
	var receivedAmount = $('#case_message_upload_page').find("[identity='received_amount']").val();
	if(receivedAmount==null || receivedAmount==""){
    	showMessage("收款金额值不允许为空",1500);
		return;
	}
	
	var uploadCaseMessage = JSON.parse(session.get("uploadCaseMessage"));
	
	authData.sendTime = currentDatetime;
	authData.sendUser = session.get("userCode");
	authData.status = "1";
	if(uploadCaseMessage != null){
//		authData.currentCollectUserName = uploadCaseMessage.currentCollectUserName;//当前催收人
		authData.currentCollectUserName = session.get("userName");//当前用户
		authData.city = uploadCaseMessage.city; //城市
		authData.payoutStatus = uploadCaseMessage.payoutStatus; //账户状态
		authData.contractNumber = uploadCaseMessage.contractNumber; //合同号
		authData.customerName = uploadCaseMessage.customerName; //客户姓名
		authData.requestCode = uploadCaseMessage.requestCode; //申请号
		authData.fiveClassDaysOverdue = uploadCaseMessage.fiveClassDaysOverdue;//五级分类逾期天数
	}else{
		authData.currentCollectUserName = session.get("userName");//当前用户
		authData.city = ""; //城市
		authData.payoutStatus = ""; //账户状态
		authData.contractNumber = ""; //合同号
		authData.customerName = ""; //客户姓名
		authData.requestCode = ""; //申请号
		authData.fiveClassDaysOverdue = "";//五级分类逾期天数
	}
	authData.receivedAmount = receivedAmount//收款金额
	
	//数据库增加数据
	$.getJSON(basePath + "/app/caseUploadMessage/addUploadMessage.xhtml"
			+ callback, authData, function(msg) {
		if ($.trim(msg.returnCode) == '0') {
			showHide();
			if(msg.message != ""){
				
				$('#case_message_upload_page').find("[identity='received_amount']").val("");
				showMessage(msg.message,'5000');
			}else{
				if (msg.data > 0) {
					showMessage('信息上报成功','5000');
					setTimeout(function(){
						back_page();
	   	    		  }, 5000);
				}
			}
			
		} else {
			showHide();
			errorHandler(msg.returnCode, msg.message);
		}
	});
}