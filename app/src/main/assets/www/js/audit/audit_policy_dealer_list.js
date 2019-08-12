var audit_policy_dealer_list_page = $('#audit_policy_dealer_list_page');

var audit_policy_dealer_list_myScroll;
/******************************audit_policy_dealer_list_page---begin**************************************/
audit_policy_dealer_list_page.live('pageinit',function(e,ui){
	
	var wrapper = "audit_policy_dealer_list_wrapper";
	var up = "audit_policy_dealer_list_pullUp";
	var down = "audit_policy_dealer_list_pullDown";
	audit_policy_dealer_list_myScroll = createMyScroll(wrapper,up,down);
	
	//回退事件处理
	audit_policy_dealer_list_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page();
		return false;
	});
	
	//点击盘点经销商列表事件处理
	audit_policy_dealer_list_page.find(".auditPolicyDealerListContentDiv .auditPolicyDealer").live("tap",function(event){
		event.stopPropagation();
		var dealerCode = $(this).find("[identity='dealerCode']").text();
		var dealerName = $(this).find("[identity='dealerName']").text();
		session.set("dealerCode",dealerCode);
		session.set("dealerName",dealerName);
		goto_page("audit_policy_storehouse_list_page");
	});
	
	//点击查询按钮，根据经销商代码、经销商名称查询经销商列表
	audit_policy_dealer_list_page.find(".queryButton").live("tap",function(event){

		queryAuditPolicyDealerList();
	});
	
});//end pageinit


audit_policy_dealer_list_page.live('pageshow',function(e, ui){

	currentLoadActionName  = "audit_policy_dealer_list_load_content";
	//初始化经销商列表
	load_audit_policy_dealer_list_content();
	
});//end pageshow

function audit_policy_dealer_list_load_content(){
	//下拉不刷新，则该方法置空
}

//初始化经销商列表
function load_audit_policy_dealer_list_content() {
	
	var page = $('#audit_policy_dealer_list_page');
	var $auditPolicyDealerList = page.find(".auditPolicyDealerListContentDiv .auditPolicyDealerList");
	$auditPolicyDealerList.empty();
	
	showLoading();
	var postData = {};
    postData.random = Math.random();
    postData.userId = session.get("userId");
    postData.userFlag = session.get("userFlag");// userFlag--0：该人员属于本公司，1：该人员属于外包公司
    
	$.getJSON(basePath+"/app/auditPolicyDealerList/pageInit.xhtml"+callback, postData,function(msg){
		if($.trim(msg.returnCode) == '0'){
			if(msg.data != null){
				//经销商列表
				var auditPolicyDealerList = msg.data.auditPolicyDealerList;
				
			    if(auditPolicyDealerList !=null){
			    	//加载盘点报告列表
					var $template = $("#audit_policy_dealer_list_page .auditPolicyDealerList_template");
					$.each(auditPolicyDealerList,function(i,n){
						
						var $item = $template.clone(true);
						dataBindToElement($item,n);
						
						$item.removeClass("auditPolicyDealerList_template");
						$item.css("display","");
						$auditPolicyDealerList.append($item);
						
					});//end $.each
					
			    }
			    showHide();
			    
			}else {
		    	showHide();
		    }
			
    	}else{
	    	showHide();
	    	errorHandler(msg.returnCode,msg.message);
	    }
		
	});//end $.getJSON
}

//根据经销商代码、经销商名称查询经销商列表
function queryAuditPolicyDealerList(){
	showLoading();
	
	var page = $('#audit_policy_dealer_list_page');
	var $auditPolicyDealerList = page.find(".auditPolicyDealerListContentDiv .auditPolicyDealerList");
	$auditPolicyDealerList.empty();
	
	//经销商code
	var dealerCode = page.find("input[name='dealerCode']").val();
	//经销商名称
	var dealerName = page.find("input[name='dealerName']").val();
	
	var postData = {};
    postData.random = Math.random();
    postData.userId = session.get("userId");
    postData.userFlag = session.get("userFlag");// userFlag--0：该人员属于本公司，1：该人员属于外包公司
    postData.dealerCode = dealerCode;
    postData.dealerName = dealerName;
    
	$.getJSON(basePath+"/app/auditPolicyDealerList/queryAuditPolicyDealerList.xhtml"+callback, postData,function(msg){
		if($.trim(msg.returnCode) == '0'){
			if(msg.data != null){
				//经销商列表
				var auditPolicyDealerList = msg.data.auditPolicyDealerList;
				
			    if(auditPolicyDealerList !=null){
			    	//加载盘点报告列表
					var $template = $("#audit_policy_dealer_list_page .auditPolicyDealerList_template");
					$.each(auditPolicyDealerList,function(i,n){
						
						var $item = $template.clone(true);
						dataBindToElement($item,n);
						
						$item.removeClass("auditPolicyDealerList_template");
						$item.css("display","");
						$auditPolicyDealerList.append($item);
						
					});//end $.each
					
			    }
			    showHide();
			    
			}else {
		    	showHide();
		    }
			
    	}else{
	    	showHide();
	    	errorHandler(msg.returnCode,msg.message);
	    }
		
	});//end $.getJSON
}
