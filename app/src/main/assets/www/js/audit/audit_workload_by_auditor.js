var audit_workload_by_auditor_page = $('#audit_workload_by_auditor_page');

var audit_workload_by_auditor_myScroll;
/******************************home_page---begin**************************************/
audit_workload_by_auditor_page.live('pageinit',function(e,ui){
	
	var wrapper = "audit_workload_by_auditor_wrapper";
	var up = "audit_workload_by_auditor_pullUp";
	var down = "audit_workload_by_auditor_pullDown";
	audit_workload_by_auditor_myScroll = createMyScroll(wrapper,up,down);

	//回退事件处理
	audit_workload_by_auditor_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page();
	});

	//搜索按钮-->查询盘库工作量统计
	audit_workload_by_auditor_page.find(".queryButton").live('tap',function(){

		load_audit_workload_by_auditor_content();
	});
});//end pageinit

audit_workload_by_auditor_page.live('pageshow',function(e, ui){

	currentLoadActionName = "audit_workload_by_auditor_load_content";
	//判断当前 页面 如果非当前页面 就返回
	if(!beforePageShowCheck($(this))){
		return;
	}
	currentTemplatePage = "audit_workload_by_auditor_page";
  
	var fromPage = session.get("fromPage");
	load_audit_workload_by_auditor_content();
	
});//end pageshow

function audit_workload_by_auditor_load_content(){
	
}

//查询列表
function load_audit_workload_by_auditor_content(){
	
	showLoading();
	var postData ={};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	postData.startDate = session.get("startDate");
	postData.endDate = session.get("endDate");
	postData.orgId = session.get("auditWorkloadByCompanyPage_orgId");
	//如果点击的是全部
	if(postData.orgId == null || postData.orgId == ""){
		var userInfoJson = eval('(' + session.get("userInfo") + ')'); 
		postData.orgId = userInfoJson.org.id;
	}
	
	$.getJSON(basePath+"/app/auditWorkloadCount/selectWorkLoadCountByAuditCompany.xhtml"+callback, postData,function(msg){
		if($.trim(msg.returnCode) == '0'){
			if(msg.data != null){
				var data = msg.data;
				
			    if(data){
			    	
			    	$('#auditWorkloadByAuditorPage_workloadList').find("li:not(:first)").remove();
			    	var $templateWorkloadListItem = $('#audit_workload_by_auditor_page').find(".list-row-template ul li");
			    	$.each(data,function(i,n){
			    		var $workloadListItem = $templateWorkloadListItem.clone(true);
			    		if(n.drivedMilesAmount != null){
			    			n.drivedMilesAmount = Math.round(n.drivedMilesAmount/1000);
			    		}
			    		
			    		dataBindToElement($workloadListItem,n);
			    					    		
			    		 $('#auditWorkloadByAuditorPage_workloadList').append($workloadListItem);
			    	});//end each
		          	
				    } 
			    else {}
			}
			showHide();
		}else{
	    	showHide();
	    	errorHandler(msg.returnCode,msg.message);
	    }
		
	});//end $.getJSON
}
