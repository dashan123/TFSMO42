var banq_pre_approval_list_page = $('#banq_pre_approval_list_page');

var banq_pre_approval_list_myScroll;
/******************************banq_pre_approval_list_page---begin**************************************/
banq_pre_approval_list_page.live('pageinit',function(e,ui){
	var wrapper = "banq_pre_approval_list_wrapper";
	var up = "banq_pre_approval_list_pullUp";
	var down = "banq_pre_approval_list_pullDown";
	banq_pre_approval_list_myScroll = createMyScroll(wrapper,up,down);
	//回退事件处理
	banq_pre_approval_list_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page('workbench_page');
	});
	banq_pre_approval_list_page.find("#banqPreApprovalListPage_approvalList li dd").live("tap",function(event){
		var code = $(this).find("[identity='applyNo']").text();
		var status = $(this).find("[identity='applyStatus']").text();
		var beforeDate = $(this).find("[identity='beforeDate']").text();
		var bgtMoney = $(this).find("[identity='bgtMoney']").text();
		var payComment = $(this).find("[identity='payComment']").text();
		session.set("applyCode",code);
		session.set("status",status);
		session.set("beforeDate",beforeDate);
		session.set("bgtMoney",rmoney(bgtMoney));
		session.set("payComment",payComment);
		goto_page("banq_approval_pictures_edit_page");
	});
});//end pageinit


banq_pre_approval_list_page.live('pageshow',function(e, ui){
	currentLoadActionName  = "banq_pre_approval_list_load_content";
	load_banq_pre_approval_list_content();
	//当页面从XX查看页面返回时，不需刷新
//	var fromPage = session.get("fromPage");
});//end pageshow
function banq_pre_approval_list_load_content(){
	//下拉不刷新，则该方法置空
}
//加载页面初始化数据，并显示
function load_banq_pre_approval_list_content(){
	banqPreApprovalListPage_queryApprovalList();
}
//查询申请单列表
function banqPreApprovalListPage_queryApprovalList(){
	$('#banqPreApprovalListPage_approvalList').empty();
	showLoading();
	var postData ={};
	var userInfo = JSON.parse(session.get("userInfo"));
	postData.random = new Date();
	postData.personUid = userInfo.user.personuid;
	postData.userId = session.get("userId");
	$.getJSON(basePath+"/app/banqPreApprovalList/pageInit.xhtml"+callback, postData,function(msg){
		if($.trim(msg.returnCode) == '0') {
			showHide();
			if(msg.data){
				var data = msg.data;
				banqPreApprovalListPage_bindDataToPage(data);
			}//end if(msg.data){
		}
		else{
			errorHandler(msg.returnCode,msg.message);
		}
	});//end $.getJSON
}
function banqPreApprovalListPage_bindDataToPage(data){
	var $currentPage = $("#banq_pre_approval_list_page");
	var $templatePreApprovalListItem = $('#banq_pre_approval_list_page').find("[template-id='preApprovalListItem']");
	$.each(data.BanqApplyList,function(i,n){
		var $preApprovalListItem = $templatePreApprovalListItem.clone(true);
		if(n.bgtMoney != null){
			n.bgtMoney = fmoney(n["bgtMoney"].trim(),2)
		}
		dataBindToElement($preApprovalListItem,n);
		$preApprovalListItem.show();
		$('#banqPreApprovalListPage_approvalList').append($preApprovalListItem);
	});//end each
}