var audit_workload_by_company_page = $('#audit_workload_by_company_page');

//var collectingAddressListPageHandler ={};

var audit_workload_by_company_myScroll;
/******************************home_page---begin**************************************/
audit_workload_by_company_page.live('pageinit',function(e,ui){
	
	var wrapper = "audit_workload_by_company_wrapper";
	var up = "audit_workload_by_company_pullUp";
	var down = "audit_workload_by_company_pullDown";
	audit_workload_by_company_myScroll = createMyScroll(wrapper,up,down);

	//回退事件处理
	audit_workload_by_company_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page('workbench_page');
	});
	
	//搜索按钮-->查询盘库工作量统计
	audit_workload_by_company_page.find(".queryButton").live('tap',function(){

		load_audit_workload_by_company_content();
	});

	//选择日期范围
 	var beginDate = new Date();//获取当前时间  
 	beginDate.setDate(1);
 	var defaultBeginDate = new Date(beginDate.getFullYear(), beginDate.getMonth(), beginDate.getDate());
 	var nowDate = new Date();//获取当前时间  
 	var defaultEndDate = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
	var instance = mobiscroll.range('#auditWorkloadByCompanyPage_dateRange', {
	    theme: 'red',
	    lang: 'zh',
	    display: 'bottom',
	    defaultValue: [defaultBeginDate, defaultEndDate]
	});
	var defaultBeginDateStr = Format(defaultBeginDate,"yyyy/MM/dd");
	var defaultEndDateStr = Format(defaultEndDate,"yyyy/MM/dd");
	$("#auditWorkloadByCompanyPage_dateRange").val(defaultBeginDateStr+" - "+defaultEndDateStr);
	instance.setVal([defaultBeginDate, defaultEndDate]);
});//end pageinit

audit_workload_by_company_page.live('pageshow',function(e, ui){

	currentLoadActionName = "audit_workload_by_company_load_content";
	//判断当前 页面 如果非当前页面 就返回
	if(!beforePageShowCheck($(this))){
		return;
	}
	currentTemplatePage = "audit_workload_by_company_page";
  
	var fromPage = session.get("fromPage");
	load_audit_workload_by_company_content();
	
});//end pageshow

function audit_workload_by_company_load_content(){
	
}

//查询列表
function load_audit_workload_by_company_content(){
	
	showLoading();
	var postData ={};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	//如果 该人员属于外包公司，则向后台多传一个参数orgId
	var userFlag = session.get("userFlag");
	if(userFlag == ConstDef.getConstant("USERFLAG_OUTSOURCE_COMPANY")){
//		postData.orgId = JSON.parse(session.get("userInfo")).org.id;
		var userInfoJson = eval('(' + session.get("userInfo") + ')'); 
		//postData.orgId = userInfoJson.org.id;
		postData.orgId = userInfoJson.user.companyId;
	}
	
	var dateRange = $('#auditWorkloadByCompanyPage_dateRange').mobiscroll('getVal');
	if(dateRange){
		postData.startDate = Format(dateRange[0],"yyyy-MM-dd");
		postData.endDate = Format(dateRange[1],"yyyy-MM-dd");
		session.set("startDate",postData.startDate);
		session.set("endDate",postData.endDate);
	}
	
	$.getJSON(basePath+"/app/auditWorkloadCount/selectWorkLoadCount.xhtml"+callback, postData,function(msg){
		if($.trim(msg.returnCode) == '0'){
			if(msg.data != null){
				var data = msg.data;
				
			    if(data){
			    	
			    	$('#auditWorkloadByCompanyPage_workloadList').find("li:not(:first)").remove();
			    	var $templateWorkloadListItem = $('#audit_workload_by_company_page').find(".list-row-template ul li");
			    	$.each(data,function(i,n){
			    		var $workloadListItem = $templateWorkloadListItem.clone(true);
			    		if(n.drivedMilesAmount != null){
			    			n.drivedMilesAmount = Math.round(n.drivedMilesAmount/1000);	
			    		}
			    			
			    		dataBindToElement($workloadListItem,n);
			    					    		
			    		$workloadListItem.bind("tap",function(event){

			    			var orgId = $(this).find("[identity='orgId']").text();
			    			
			    			session.set("auditWorkloadByCompanyPage_orgId",orgId);
			    			goto_page("audit_workload_by_auditor_page");
			    		});
			    		
			    		 $('#auditWorkloadByCompanyPage_workloadList').append($workloadListItem);
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
