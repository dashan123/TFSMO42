var collection_css_picture_details = $('#collection_css_picture_details');
// collection_css_picture_details.find(".overflows").hide();
// var newdetail_myScroll;
// var newdetail_image_array = new Array();
// 获取屏幕高度
var window_height = $(window).height();
// var pagesize = 2;
/** ****************************collection_css_picture_details---begin************************************* */
var zoomObject = null;
var zoomFlag = false;

var zoomWidth = 0;
var zoomHeight = 0;

// 图片加载完毕 滚动条自动滚动到下面
function img_load(obj, index) {

	var objHeight = $(obj).height();
	var zoomFactor = $(window).width() / $(obj).width();
	$(obj)
			.attr(
					"style",
					"-webkit-transform-origin: 0% 0% 0px; transform-origin: 0% 0% 0px;-webkit-transform: scale("
							+ zoomFactor
							+ ", "
							+ zoomFactor
							+ "); transform: scale("
							+ zoomFactor
							+ ", "
							+ zoomFactor + ");");
	if (objHeight > 0) {
		$(obj).parent(".newsimageview").css("height",
				objHeight * zoomFactor + "px");
	}

	if (!zoomFlag) {
		// 添加图片手势功能
		zoomObject = new RTP.PinchZoom($(obj).parent(".newsimageview").parent(
				"ul"), {});
		// 标示该图片增加 手势功能
		zoomFlag = true;
	}

	if (null != zoomObject) {
		zoomObject.update();
	}

	$(obj).removeAttr("onload");

}
// function load_newdetail_image (){
// var index = currentPage;
// if(index <= newdetail_image_array.length){
// var page = $('#collection_css_picture_details');
// $(newdetail_image_array[index -1
// ]).appendTo(page.find(".wrapper").find("ul"));
// }
// }

collection_css_picture_details.live('pageinit', function(e, ui) {
	
	collection_css_picture_details.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		removeImageView();
		back_page();
	});

//	collection_css_picture_details.find(".imageSuofangZoomIn").live("fastClick", function() {
//		if (zoomObject != null) {
//			var zoomIn = zoomObject.zoomFactor + 0.2;
//			if (zoomIn <= 4) {
//				zoomObject.zoomFactor = zoomIn;
//				zoomObject.update();
//			}
//		}
//	});
//
//	collection_css_picture_details.find(".imageSuofangZoomOut").live("fastClick", function() {
//		if (zoomObject != null) {
//			var zoomOut = zoomObject.zoomFactor - 0.2;
//			if (zoomOut >= 0.5) {
//				zoomObject.zoomFactor = zoomOut;
//				zoomObject.update();
//			}
//		}
//	});

});

collection_css_picture_details.live('pageshow',function(e, ui) {
					
					// 判断当前 页面 如果非当前页面 就返回
					if (!beforePageShowCheck($(this))) {
						return;
					}

					
					// 更换标题(暂时固定为查看大图)
//					var param_title = session.get("image_zoom_page_title");
					
					// 初始化图片地址
//					var imageUrl = session.get("imageUrl");
//					$("#zoom-image").attr("src",imageUrl);

					load_collection_css_picture_details_content();
				});
collection_css_picture_details.live('pagehide', function(e, ui) {
});
/** ****************************collection_css_picture_details---end************************************* */

function load_collection_css_picture_details_content() {
	showLoading();

	var postData = {};
	postData.random = Math.random();
	postData.userCode = session.get("userCode");

	postData.caseId = session.get("caseId");//获取案件ID
	postData.fileId = session.get("fileId");//获取附件ID
	$.getJSON(basePath + "/app/CollectionCssPictureDetails/pageInit.xhtml"
			+ callback, postData, function(msg) {
		
		if($.trim(msg.returnCode) == '0'){
		    if(msg.data !=null){
		    	var data = msg.data;
		    	if(data.result == ConstDef.getConstant("RESULT_SUCESS")){
		    		//成功获取数据时的处理
		    		 var $currentPage = $('#collection_css_picture_details');
		    		 
//		    		$currentPage.find("[identity='fileName']").text(data.fileName);
//		    		$("#collection_css_picture_details_image").attr("src","data:image/jpg;base64,"+data.fileBase64Encode);
		    		 seecollectionphoto(data.fileBase64Encode);
		    	}else{
		    		//未成功获取到数据时的处理
		    		showMessage(data.errMessage,'1500');	
		    	}

				showHide();
		    }
		    else{
		    	showMessage('未检索到详情数据','1500');	
		    }

		} else {
			showHide();
			errorHandler(msg.returnCode, msg.message);
		}
//		showHide();
	});// end $.getJSON
}
