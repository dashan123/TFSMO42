var audit_electronic_signature_car_list_page = $('#audit_electronic_signature_car_list_page');
var audit_electronic_signature_car_list_myScroll;
/******************************audit_electronic_signature_car_list_page---begin**************************************/
audit_electronic_signature_car_list_page.live('pageinit',function(e,ui){
	
	var wrapper = "audit_electronic_signature_car_list_wrapper";
	var up = "audit_electronic_signature_car_list_pullUp";
	var down = "audit_electronic_signature_car_list_pullDown";
	audit_electronic_signature_car_list_myScroll = createMyScroll(wrapper,up,down);
	
	//回退事件处理
	audit_electronic_signature_car_list_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page();
	});
	
	

});//end pageinit


audit_electronic_signature_car_list_page.live('pageshow',function(e, ui){

	
	audit_electronic_signature_car_list_page.find("#signatureCarListItem").live("tap",function(event){
		var carType = session.get("CarType");
		if(carType=="OFFSE" || carType=="SOLD" || carType=="SOT"){
			var business_id = $(this).attr("auditcheckreportid");
			session.set("businessId",business_id);
			session.set("functionFlag","4");
			goto_page("common_business_pictures_view_page");
		}else{
			
		}
	});
	
	currentLoadActionName  = "audit_electronic_signature_car_list_load_content";
	
	//初始化库房及盘点清单信息
	load_audit_electronic_signature_car_list_content();
	
});//end pageshow

function audit_electronic_signature_car_list_load_content(){
	//下拉不刷新，则该方法置空
}

//初始化库房及盘点清单信息
function load_audit_electronic_signature_car_list_content() {
	$('#auditCarListContentUl').empty();
	showLoading();
	var postData = {};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.auditCheckListId = session.get("auditCheckListId");
	postData.CarType = session.get("CarType");

	$.getJSON(basePath+"/app/auditElectronicSignatureCar/pageInit.xhtml"+callback, postData,function(msg){
		if($.trim(msg.returnCode) == '0'){
			if(msg.data !=null){
				showHide();
				var data = msg.data.auditReportList;
				audit_ElectronicSignatureCar_list_page_bindDataToPage(data);
			}else{
				showHide();
			}
		}
		else{
			errorHandler(msg.returnCode,msg.message);
		}
	});//end $.getJSON
	
}

function audit_ElectronicSignatureCar_list_page_bindDataToPage(data){
	$.each(data,function(i,n){
		var $signatureCarListItem = $('#signatureCarListItem').clone(true);
		$signatureCarListItem.attr("auditcheckreportid",n.id);
		dataBindToElement($signatureCarListItem,n);
		$signatureCarListItem.show();
		$('#auditCarListContentUl').append($signatureCarListItem);
	});//end each
}
