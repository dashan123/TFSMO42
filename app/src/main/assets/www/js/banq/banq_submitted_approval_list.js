var banq_submitted_approval_list_page = $('#banq_submitted_approval_list_page');

var banq_submitted_approval_list_myScroll;
/******************************banq_submitted_approval_list_page---begin**************************************/
banq_submitted_approval_list_page.live('pageinit',function(e,ui){
	
	var wrapper = "banq_submitted_approval_list_wrapper";
	var up = "banq_submitted_approval_list_pullUp";
	var down = "banq_submitted_approval_list_pullDown";
	banq_submitted_approval_list_myScroll = createMyScroll(wrapper,up,down);
	
	//回退事件处理
	banq_submitted_approval_list_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page('workbench_page');
	});
	
});//end pageinit


banq_submitted_approval_list_page.live('pageshow',function(e, ui){

	currentLoadActionName  = "banq_submitted_approval_list_load_content";
	load_banq_submitted_approval_list_content();
	
});//end pageshow

function banq_submitted_approval_list_load_content(){
	//下拉不刷新，则该方法置空
}

//查询经销商列表
function load_banq_submitted_approval_list_content(){
	
	$('#banqSubmittedApprovalListPage_approvalList').empty();
	showLoading();
	var postData ={};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");

	$.getJSON(basePath+"/app/banqSubmittedApprovalList/pageInit.xhtml"+callback, postData,function(msg){
		
		if($.trim(msg.returnCode) == '0') {
			showHide();
			if(msg.data){
				
				var data = msg.data;
				banqSubmittedApprovalListPage_bindDataToPage(data);

			}//end if(msg.data){
		}
		else{
			errorHandler(msg.returnCode,msg.message);
		}
		
	});//end $.getJSON
}

function banqSubmittedApprovalListPage_bindDataToPage(data){
	
	var $currentPage = $("#banq_submitted_approval_list_page");
	
	var $templateSubmittedApprovalListItem = $currentPage.find("[template-id='submittedApprovalListItem']");
	$.each(data.submittedApplyList,function(i,n){
		var $submittedApprovalListItem = $templateSubmittedApprovalListItem.clone(true);
		if(n.bgtMoney != null){
			n.bgtMoney = fmoney(n["bgtMoney"].trim(),2)
		}
		dataBindToElement($submittedApprovalListItem,n);
		
		$submittedApprovalListItem.find("dd").bind("tap",function(event){

			session.set("baqApplyCode",n.code);
			goto_page("banq_approval_pictures_view_page");
			
		});
		
		$submittedApprovalListItem.show();
		$('#banqSubmittedApprovalListPage_approvalList').append($submittedApprovalListItem);
	});//end each
}