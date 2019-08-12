var banq_approval_pictures_view_page = $('#banq_approval_pictures_view_page');
var banq_approval_pictures_view_myScroll;
/******************************banq_approval_pictures_view_page---begin**************************************/	   
banq_approval_pictures_view_page.live('pageinit',function(e, ui){
	
	var wrapper = "banq_approval_pictures_view_wrapper";
	var up = "banq_approval_pictures_view_pullUp";
    var down = "banq_approval_pictures_view_pullDown";
	banq_approval_pictures_view_myScroll = createMyScroll(wrapper,up,down);
	
	banq_approval_pictures_view_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page();
		removeImageObject();
	});
	
	//图片点击放大
	banq_approval_pictures_view_page.find('.ContentDiv img').live("tap",function(){  

		var currentPage = $("#banq_approval_pictures_view_page");
		var fileBase64EncodeStr = "";
		var listImg = currentPage.find('.ContentDiv img');
		var photoIndex = listImg.index($(this));

		for (var i = 0; i < listImg.size(); i++) {
			fileBase64EncodeStr = fileBase64EncodeStr + "@" + $(listImg.get(i)).attr("src").replace("data:image/jpeg;base64,","");
		}
		
		fileBase64EncodeStr = fileBase64EncodeStr.substring(1);
		sendPictures(fileBase64EncodeStr,photoIndex);
	});
	
});

banq_approval_pictures_view_page.live('pageshow',function(e, ui){
	
	currentLoadActionName = "banq_approval_pictures_view_load_content";
	load_banq_approval_pictures_view_content();
});

function banq_approval_pictures_view_load_content(){
		
}
	
//加载照片列表，并显示
function load_banq_approval_pictures_view_content(){
	
	var $photosUl = $("#banq_approval_pictures_view_page .ContentDiv ul");
	$photosUl.empty();
	
	showLoading();
	var postData = {};
    postData.random = new Date();
    postData.userCode = session.get("userCode");
    postData.baqApplyCode = session.get("baqApplyCode");//申请单号
	$.getJSON(basePath+"/app/banqApprovalPicturesView/pageInit.xhtml"+callback, postData,function(msg){
		if($.trim(msg.returnCode) == '0'){
			
			bind_banq_approval_pictures_view_to_page(msg);
			showHide();
		}
		else{
        	showHide();
        	errorHandler(msg.returnCode,msg.message);
         }
		
	});//end $.getJSON
	
}

function bind_banq_approval_pictures_view_to_page(msg){
	
	var $currentPage = $("#banq_approval_pictures_view_page");
	
	if(msg.data.length<=0){
	     showHide();
	  	 return;
	}
    
	//显示照片
//    var imageUrlStr = "";
	var photos = msg.data.photos;
	$.each(photos,function(i,n){
		if(n.photoBase64){
//			imageUrlStr = imageUrlStr +'@'+m.photoBase64;
			
			var $item = $('<li><img alt=""></li>');
			//显示图片
			var $image = $item.find('img');
			$image.attr('src',"data:image/jpeg;base64,"+n.photoBase64);
			//显示照片时，记录照片在服务器端的Id
			$image.attr("photoId",n.photoId);
			
			// photo_type--照片类型(1.餐厅 2.付款凭证 3.发票）
			if(n.photoType == "1"){
				$currentPage.find('#banqApprovalPicturesView_restaurantPhotosDiv ul').append($item);
			}else if(n.photoType == "2"){
				$currentPage.find('#banqApprovalPicturesView_paymentVoucherPhotosDiv ul').append($item);
			}else if(n.photoType == "3"){
				$currentPage.find('#banqApprovalPicturesView_invoicePhotosDiv ul').append($item);
			}
		}

	});
	
//	imageUrlStr = imageUrlStr.substring(1);
//    sendImages(imageUrlStr);
	
} //end bind_banq_approval_pictures_view_to_page