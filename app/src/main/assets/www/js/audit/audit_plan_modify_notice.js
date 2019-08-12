var audit_plan_modify_notice_page = $('#audit_plan_modify_notice_page');

var audit_plan_modify_notice_myScroll;
/******************************audit_plan_modify_notice_page---begin**************************************/
audit_plan_modify_notice_page.live('pageinit',function(e,ui){
	
	var wrapper = "audit_plan_modify_notice_wrapper";
	var up = "audit_plan_modify_notice_pullUp";
	var down = "audit_plan_modify_notice_pullDown";
	audit_plan_modify_notice_myScroll = createMyScroll(wrapper,up,down);
	
	//回退事件处理
	audit_plan_modify_notice_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page();
	});
	
});//end pageinit


audit_plan_modify_notice_page.live('pageshow',function(e, ui){

	currentLoadActionName  = "audit_plan_modify_notice_load_content";
	//查询提示消息列表
	load_audit_plan_modify_notice_content();
	
});//end pageshow

function audit_plan_modify_notice_load_content(){
	//下拉不刷新，则该方法置空
}

//查询提示消息列表
function load_audit_plan_modify_notice_content(){
	var page = $('#audit_plan_modify_notice_page');
	var audit_plan_modify_notice_list = $("#audit_plan_modify_notice_page").find("#audit_plan_modify_notice_list");
	audit_plan_modify_notice_list.empty();
	
	showLoading();
	var postData = {};
    postData.random = Math.random();
	postData.userId = session.get("userId");
    postData.userCode = session.get("userCode");
    
	$.getJSON(basePath+"/app/auditPlanModifyNotice/pageInit.xhtml"+callback, postData,function(msg){
		if($.trim(msg.returnCode) == '0'){
		    if(msg.data !=null && msg.data.length>0){
		    	//已催记录列表的初始化
				var $template = $("#audit_plan_modify_notice_page .list-row-template");
				var auditPlanModifyNoticeList = msg.data;
				$.each(auditPlanModifyNoticeList,function(i,n){
					/*if(n.modifyMsg != null){
						n.noticeInfo = n.modifyMsg;
					}
					if(n.planModifyDatetime != null){
						n.noticeInfo = n.planModifyDatetime;
					}*/
					var $item = $template.clone(true);
					
					var $ReadedButton = $item.find("a.ConBtn");
					$ReadedButton.bind("tap",function(event){
						auditPlanModifyNoticeReaded(this);
						event.stopPropagation();
					});
					dataBindToElement($item,n);
					$item.removeClass("list-row-template");
					$item.show();
					
					audit_plan_modify_notice_list.append($item);
				});//end $.each
			
            	showHide();
		    } else {
		    	showHide();
//            	showMessage('暂无数据','1500');	
		    }
    	}else{
	    	showHide();
	    	errorHandler(msg.returnCode,msg.message);
	    }
		
	});//end $.getJSON
}

function auditPlanModifyNoticeReaded(ReadedButton){
	
	var auditPlanModifyNoticeId = $(ReadedButton).find("span[identity='auditPlanModifyNoticeId']").text();
	
	var postData ={};
	postData.random = new Date();
	postData.userId = session.get("userId");
	postData.userCode = session.get("userCode");
	postData.auditPlanModifyNoticeId = auditPlanModifyNoticeId;
	
	showLoading();
	//点击已阅按钮
	$.getJSON(basePath+"/app/auditPlanModifyNotice/auditPlanModifyNoticeReaded.xhtml"+callback, postData,function(msg){
		showHide();
		if($.trim(msg.returnCode) == '0'){
			showMessage(msg.message,'1500');
			//查询提示消息列表
			setTimeout(function () { 
				load_audit_plan_modify_notice_content();
		    }, 1500);
			
		}
		else{
			errorHandler(msg.returnCode,msg.message);
		}

	});//end $.getJSON
}