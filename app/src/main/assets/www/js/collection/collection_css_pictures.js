/******************************login init begin**************************/
var css_collection_pictures_page = $('#css_collection_pictures_page');
var css_collection_pictures_page_myScroll;
//var fileBase64EncodeStr;
/** ****************************home_page---begin************************************* */
css_collection_pictures_page.live('pageinit', function(e, ui) {
	
	var wrapper = "css_collection_pictures_wrapper";
    var up = "css_collection_pictures_pullUp";
    var down = "css_collection_pictures_pullDown";
    css_collection_pictures_page_myScroll = createMyScroll(wrapper,up,down);

	// 回退按钮事件
	css_collection_pictures_page.find(".BackBtn").live("tap", function(event) {
		event.stopPropagation();
		back_page();
	});

});

css_collection_pictures_page.live('pageshow', function(e, ui) {
	
	currentLoadActionName = "css_collection_pictures_load_content";
	
	var fromPage = session.get("fromPage");
	 if(fromPage != "collection_css_picture_details"){
		 load_css_collection_pictures_content();
	 }else{
		// 获取当前页的index
		var fileId = 0;
 	    var scrollNowPage = session.get("nowPage");
 	    if(!$.isEmptyObject(scrollMap)){
 	    	var commonScrollMapJsonObj = scrollMap[scrollNowPage];
 	    	if(commonScrollMapJsonObj != null && typeof(commonScrollMapJsonObj) != "undefined"){
 	    		commonScrollMapJsonObj = JSON.parse(commonScrollMapJsonObj);
 	    		fileId = commonScrollMapJsonObj.fileId;
 	 	    	//删除Json数据中的scrollNowPage属性  
 	 	        delete scrollMap[scrollNowPage]; 
 	    	}
 	    }
		var scrollCurrentElement = $("#css_collection_pictures_page").find('.List ul li[fileId='+fileId+']').get(0);
		css_collection_pictures_page_myScroll.refresh();//刷新iScroll
		css_collection_pictures_page_myScroll.scrollToElement(scrollCurrentElement,0);
	}
	
});

function css_collection_pictures_load_content(){
	
}

// 加载详细，并显示

function load_css_collection_pictures_content() {
	/**
	 * 注释开始
	 * 该参数是用于图片左右滑动时使用，此处未使用
	 * 2018-10-25 yang
	 */
//	fileBase64EncodeStr = "";
	/**
	 * 注释结束
	 * 2018-10-25 yang
	 */
	var $list = $("#css_collection_pictures_page .List ul");
	$list.empty();

	showLoading();

	var postData = {};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.caseId = session.get("caseId");
	$.getJSON(basePath + "/app/CollectionCssPictures/pageInit.xhtml"
			+ callback, postData, function(msg) {
		if ($.trim(msg.returnCode) == '0') {

			if (msg.data.length <= 0) {
				showHide();
//				showMessage('暂无数据', '1500');
				return;
			}

			$.each(msg.data, function(i, n) {

				var $item = $("<li>" +
						"<span class='font12r'>"+(i+1)+"</span>" +
						"<span identity='fileName' class='font12r'></span>" +
						"</li>");
//				$item.attr("url",n.fullPath);
				$item.attr("fileId",n.atmtId);//附件ID
				/**
				 * 注释开始
				 * 该参数是用于图片左右滑动时使用，此处未使用
				 * 2018-10-25 yang
				 */
//				$item.attr("fileBase64Encode",n.fileBase64Encode);//文件的Base64编码
//				fileBase64EncodeStr = fileBase64EncodeStr +'@'+n.fileBase64Encode;
				/**
				 * 注释结束
				 * 2018-10-25 yang
				 */
				dataBindToElement($item, n);

				$item.bind("tap",function(){
					session.set("fileId",$(this).attr("fileId"));
					/**
					 * 注释开始
					 * 该语句session参数未使用
					 * 2018-10-25 yang
					 */
					//session.set("fileBase64Encode",$(this).attr("fileBase64Encode"));
					/**
					 * 注释结束
					 * 2018-10-25 yang
					 */
					
					var scrollMapJSON = {};
					scrollMapJSON.fileId = $(this).attr("fileId");
					scrollMap.css_collection_pictures_page = JSON.stringify(scrollMapJSON);
					
					goto_page("collection_css_picture_details");
				});//end bind
				$list.append($item);
			});// end $.each
			
//			fileBase64EncodeStr = fileBase64EncodeStr.substring(1);
			//sendImages(fileBase64EncodeStr);
			showHide();

		} else {
			showHide();
			errorHandler(msg.returnCode, msg.message);
		}

	});// end $.getJSON

}
