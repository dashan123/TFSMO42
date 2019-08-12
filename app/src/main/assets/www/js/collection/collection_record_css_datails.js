/*********************************************************login init begin*****************************************************************/	
var css_collection_record_details_page = $('#css_collection_record_details_page');
var css_collection_record_details_myScroll;
/******************************home_page---begin**************************************/	   
css_collection_record_details_page.live('pageinit',function(e, ui){
	
	var wrapper = "css_collection_record_details_wrapper";
	css_collection_record_details_myScroll = createMyScroll(wrapper);
	//回退按钮事件
	css_collection_record_details_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page();
	});
});
/** ****************************home_page---end************************************* */

css_collection_record_details_page.live('pageshow',function(e, ui){
	
	currentLoadActionName = "css_collection_record_details_load_content";
	
	load_css_collection_record_details_content();
});

function css_collection_record_details_load_content(){
	
}

//加载详细，并显示

function load_css_collection_record_details_content(){
	
	var cssCollectionRecord = JSON.parse(session.get("cssCollectionRecord"));//在CSS催记详情页面使用该数据
	var $detailDiv = $("#css_collection_record_details_page .detailDiv");
	dataBindToElement($detailDiv, cssCollectionRecord);
	
	
//	showLoading();
	
//	var postData = {};
//	postData.random = Math.random();
//	postData.userCode = session.get("userCode");
//    postData.cssCollectionRecordId = session.get("cssCollectionRecordId");
//	session.remove("cssCollectionRecordId");
//	$.getJSON(basePath+"/app/cssCollectionRecordDeatils/pageInit.xhtml"+callback, postData,function(msg){
//		if($.trim(msg.returnCode) == '0'){
//		    if(msg.data !=null){
//
//				var $detailDiv = $("#css_collection_record_details_page .detailDiv");
//
//				dataBindToElement($detailDiv, msg.data.collRecordDetailsEntity);
//
//				showHide();
//		    }
//		    else{
//		    	var $detailElement = $("#css_collection_record_details_page .detailDiv [identity]");
//		    	$detailElement.text("");
//		    	showMessage('未检索到详情数据','1500');	
//		    }
//
//		} else {
//			showHide();
//			errorHandler(msg.returnCode, msg.message);
//		}
//
//	});// end $.getJSON

}