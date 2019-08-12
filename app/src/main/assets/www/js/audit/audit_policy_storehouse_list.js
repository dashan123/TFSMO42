var audit_policy_storehouse_list_page = $('#audit_policy_storehouse_list_page');
var audit_policy_storehouse_list_myScroll;
/** ****************************audit_policy_storehouse_list_page---begin************************************* */
audit_policy_storehouse_list_page.live('pageinit', function(e, ui) { 
 	//定义分页用到的数据
	var wrapper = "audit_policy_storehouse_list_wrapper";
	var up = "audit_policy_storehouse_list_pullUp";
	var down = "audit_policy_storehouse_list_pullDown";
	audit_policy_storehouse_list_myScroll = createMyScroll(wrapper, up, down);
	
	// 返回工作台
	audit_policy_storehouse_list_page.find(".BackBtn").live("tap", function(event) {
		event.stopPropagation();
		back_page();
		return false;
	});

	// 
	audit_policy_storehouse_list_page.find("[identity='viewPhotosBtn']").live("tap", function() {
		//保单id
		var auditStorehousePolicyId = $(this).parents(".ListRow").attr("auditStorehousePolicyId");
		session.set("businessId",auditStorehousePolicyId);
		session.set("functionFlag","6");
		goto_page("common_business_pictures_view_page");

	});
	
	audit_policy_storehouse_list_page.find("[identity='renewalBtn']").live("tap", function() {
		//保单id
		var auditStorehousePolicyId = $(this).parents(".ListRow").attr("auditStorehousePolicyId");
		//经销商库房id
		var storehouseId = $(this).parents(".ListRow").attr("storehouseId");
		//经销商库房地址
		var storehouseAddress = $(this).parents(".ListRow").find("[identity='storehouseAddress']").text();
		
		session.set("auditStorehousePolicyId",auditStorehousePolicyId);
		session.set("storehouseId",storehouseId);
		session.set("storehouseAddress",storehouseAddress);
		
		goto_page("audit_policy_maintenance_page");
	});
	
	audit_policy_storehouse_list_page.find("#sampleBtn").live("tap", function() {
		
		goto_page("common_business_pictures_view_page");
		
	});

});

audit_policy_storehouse_list_page.live('pageshow', function(e, ui) {
	
	//判断当前 页面 如果非当前页面 就返回
	if(!beforePageShowCheck($(this))){
		return;
	}
	currentLoadActionName = "audit_policy_storehouse_list_load_content";
	
	load_audit_policy_storehouse_list_content();
	
});

function audit_policy_storehouse_list_load_content(){
	//下拉不刷新，则该方法置空
}

function load_audit_policy_storehouse_list_content(page) {
	// 清空数据
	var page = $('#audit_policy_storehouse_list_page');
	page.find(".List").empty();
	showLoading();
	
	var authData = {};
	authData.random = Math.random();
	authData.dealerCode =session.get("dealerCode");
	
	$.getJSON(basePath+ "/app/auditPolicyStorehouseList/pageInit.xhtml"+ callback, authData, function(msg) {
		if ($.trim(msg.returnCode) == '0') {
			
			if(msg.data != null && msg.data.length > 0){
				$.each(msg.data, function(i, n) {
					var $auditPolicyStorehouseListItem = $("#audit_policy_storehouse_list_page .list-row-template ul li").clone(true);
					
					dataBindToElement($auditPolicyStorehouseListItem,n);
					//保单ID
					$auditPolicyStorehouseListItem.attr("auditStorehousePolicyId",n.auditStorehousePolicyId);
					//经销商库房ID
					$auditPolicyStorehouseListItem.attr("storehouseId",n.storehouseId);
					//是否收费 1:不收费 2.收费
					$auditPolicyStorehouseListItem.find("[identity='chargeFlagName']").attr("chargeFlag",n.chargeFlag);
					//是否在市区 1:市区 2.非市区
					$auditPolicyStorehouseListItem.find("[identity='incityFlagName']").attr("incityFlag",n.incityFlag);
					
					$("#audit_policy_storehouse_list_page ul.List").append($auditPolicyStorehouseListItem);
				});
			}
			
			showHide();
		} else {
			showHide();
			errorHandler(msg.returnCode, msg.message);
		}
       
	});

}

/** ****************************audit_policy_storehouse_list_page---end************************************* */
