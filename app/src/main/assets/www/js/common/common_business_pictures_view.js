var common_business_pictures_view_page = $('#common_business_pictures_view_page');
var common_business_pictures_view_myScroll;

var common_business_pictures_view_page_handler = {};

/******************************home_page---begin**************************************/
common_business_pictures_view_page.live('pageinit',function(e, ui){
	var wrapper = "common_business_pictures_view_wrapper";
//	var up = "common_business_pictures_view_pullUp";
//	var down = "common_business_pictures_view_pullDown";
	common_business_pictures_view_myScroll = createMyScroll(wrapper);

	common_business_pictures_view_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page();
		removeImageObject();
	});

	//图片点击放大
	common_business_pictures_view_page.find('[tag="picBox"] img').live("tap",function(){  

		var currentPage = $("#common_business_pictures_view_page");
		var fileBase64EncodeStr = "";
		var listImg = currentPage.find('[tag="picBox"] img');
		var photoIndex = listImg.index($(this));

		for (var i = 0; i < listImg.size(); i++) {
			fileBase64EncodeStr = fileBase64EncodeStr + "@" + $(listImg.get(i)).attr("src").replace("data:image/jpeg;base64,","");
		}
		
		fileBase64EncodeStr = fileBase64EncodeStr.substring(1);
		sendPictures(fileBase64EncodeStr,photoIndex);
	});
});

common_business_pictures_view_page.live('pageshow',function(e, ui){

	currentLoadActionName = "common_business_pictures_view_load_content";
	load_common_business_pictures_view_content();
});

function common_business_pictures_view_load_content(){
	
}

//清空页面数据
function clear_common_business_pictures_view_content(){
	var currentPage = $("#common_business_pictures_view_page");
	currentPage.find('[tag="picBox"]').empty();
}

//加载详细，并显示
function load_common_business_pictures_view_content(){
	//清空页面数据
	clear_common_business_pictures_view_content();

	showLoading();
	var currentPage = $("#common_business_pictures_view_page");

	var postData = {};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.businessId = session.get("businessId");
	postData.functionFlag = session.get("functionFlag");
	
	$.getJSON(basePath+"/app/commonBusinessPicturesView/pageInit.xhtml"+callback, postData,function(msg){

		showHide();
		
		if($.trim(msg.returnCode) == '0'){
			
			bind_common_business_pictures_view_to_page(msg);	

		}
		else{
			errorHandler(msg.returnCode,msg.message);
		}
	});//end $.getJSON
};



function bind_common_business_pictures_view_to_page(msg){

	var currentPage = $("#common_business_pictures_view_page");
	currentPage.find('[tag="picBox"]').empty();
	
		//显示照片
		var pictures = msg.data.pictures;
		$.each(pictures,function(i,n){
			if(n.extension){

//				var $item = $('<dl class="act"><dt><img alt=""></dt><dd></dd></dl>');
				var $item = $('<dl class="act"><dt><img alt=""></dt></dl>');

				//显示图片
				var $image = $item.find('img');
				$image.attr('src',"data:image/jpeg;base64,"+n.extension);
//				$image.attr('id',n.id);

				//显示照片时，记录照片在服务器端的Id，并初始化状态为 "normal"
				$image.attr("pictureId",n.id);
//				$image.attr("status","saved");//保存过的照片

				currentPage.find('[tag="picBox"]').append($item);
			}

		});

}