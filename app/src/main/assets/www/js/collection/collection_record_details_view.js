/*********************************************************login init begin*****************************************************************/	
var collection_record_details_view_page = $('#collection_record_details_view_page');
var collection_record_details_view_myScroll;
/******************************home_page---begin**************************************/	   
collection_record_details_view_page.live('pageinit',function(e, ui){
	var wrapper = "collection_record_details_view_wrapper";
	collection_record_details_view_myScroll = createMyScroll(wrapper);
	
	collection_record_details_view_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page();
        removeImageObject();
	});
	
	//跳转到 案件详情  事件
	collection_record_details_view_page.find(".bottoms1-red li:first").live("tap",function(){
		
		goto_page("collection_case_details_view_page");
	});
	
    collection_record_details_view_page.find('[tag="picBox"] img').live("tap",function(){
        
//      showMessage($(this).attr("src"),'10000');
      var newStr = $(this).attr("src").replace("data:image/png;base64,","");
//          goto_page("image_zoom_page");
          gesturePicture(newStr);
                                                                      
  });
	
});

collection_record_details_view_page.live('pageshow',function(e, ui){
	
	currentLoadActionName = "collection_record_details_view_load_content"
	
	var fromPage = session.get("fromPage");
	 if(fromPage != "collection_case_details_view_page" && fromPage != "image_zoom_page"){
			load_collection_record_details_view_content();
	 }

});

function collection_record_details_view_load_content(){
	
}

//加载详细，并显示
function load_collection_record_details_view_content(){
	
	showLoading();
	var currentPage = $("#collection_record_details_view_page");
	currentPage.find('[tag="picBox"]').empty();
	currentPage.find(".detailDiv [identity]").text("");
	
	var collectionRecordId = session.get("collectionRecordId");
	if(collectionRecordId == null || collectionRecordId == ""){
		showMessage("已催记录ID不能为空！",'2000');
		return;
	}
	var postData = {};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
    postData.collectionRecordId = collectionRecordId;
	$.getJSON(basePath+"/app/collectionRecordDetailsView/pageInit.xhtml"+callback, postData,function(msg){
		   if($.trim(msg.returnCode) == '0'){
			   if(msg.data !=null){
				   
				   var caseRecord = msg.data.caseRecord;
				   if(caseRecord != null){
					    session.set("contractId",caseRecord.contractId);
						currentPage.find("[identity='customer_name']").text(caseRecord.customerName);
						currentPage.find("[identity='contract_number']").text(caseRecord.contractNumber);
				   }

					//催收对象：collectCustomer
					var collectObjectObj = msg.data.collectObjectObj;
					if(collectObjectObj != null){
						currentPage.find("[identity='collect_object']").text(collectObjectObj.name);
					}
					
					//联系方式：contractMethod
					var contractMethodObj = msg.data.contractMethodObj;
					if(contractMethodObj != null){
						currentPage.find("[identity='contact_method']").text(contractMethodObj.name);	
					}
					
					//行动代码：actionCode
					var actionCodeObj = msg.data.actionCodeObj;
					if(actionCodeObj != null){
						currentPage.find("[identity='action_code']").text(actionCodeObj.name);
					}
					
					
					//行动状态：actionState
					var actionStatusObj = msg.data.actionStatusObj;
					if(actionStatusObj != null){
						currentPage.find("[identity='action_status']").text(actionStatusObj.name);
					}
					
					//如果已经保存催记，则显示保存的催记信息
					var collectionRecord = msg.data.collectionRecord;
					if(collectionRecord != null){
						currentPage.find("[identity='next_time']").text(collectionRecord.nextTime.substring(0,10));
						currentPage.find("[identity='collect_record']").text(collectionRecord.collectRecord);
					}
					
					//显示催收照片
					var collectionRecordPictures = msg.data.collectionRecordPictures;
					var fileBase64EncodeStr = "";
					$.each(collectionRecordPictures,function(i,n){
						if(n.path){
							
							 var $item = $('<dl class="act"><dt><img alt=""></dt></dl>');
						     var $image = $item.find('img');
						     
						     $image.attr('src',"data:image/png;base64,"+n.extension);
						     fileBase64EncodeStr = fileBase64EncodeStr +'@'+n.extension;
						     currentPage.find('[tag="picBox"]').append($item);
						}
						
					});
					fileBase64EncodeStr = fileBase64EncodeStr.substring(1);
					sendImages(fileBase64EncodeStr);
					showHide();
			   }else{
				   showMessage(msg.message,'2000');
			   }
			  
		   }
		   else{
			   showHide();
			   errorHandler(msg.returnCode,msg.message);
		   	}
		
	});//end $.getJSON
};
