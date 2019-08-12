var banq_pre_shot_photos_select_page = $('#banq_pre_shot_photos_select_page');
var banq_pre_shot_photos_select_myScroll;

/******************************banq_pre_shot_photos_select_page---begin**************************************/
banq_pre_shot_photos_select_page.live('pageinit',function(e, ui){
	var wrapper = "banq_pre_shot_photos_select_wrapper";
//	var up = "banq_pre_shot_photos_select_pullUp";
//	var down = "banq_pre_shot_photos_select_pullDown";
	banq_pre_shot_photos_select_myScroll = createMyScroll(wrapper);

	banq_pre_shot_photos_select_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page();
		removeImageObject();
		return false;
	});
	
	banq_pre_shot_photos_select_page.find('[tag="picBox"] .act2 dd').live("tap",function(){
		$(this).parent().attr("class","act3");
	});
	
	banq_pre_shot_photos_select_page.find('[tag="picBox"] .act3 dd').live("tap",function(){
		$(this).parent().attr("class","act2");
	});
	
	//点击确定跳转页面
	banq_pre_shot_photos_select_page.find(".SaveBtn2").live("tap",function(){
		
		banqPreShotPhotosSelect_selectPhotos();
	});

	//图片点击放大
	banq_pre_shot_photos_select_page.find('[tag="picBox"] img').live("tap",function(){  

		var currentPage = $("#banq_pre_shot_photos_select_page");
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

banq_pre_shot_photos_select_page.live('pageshow',function(e, ui){
	
	currentLoadActionName = "banq_pre_shot_photos_select_load_content";
	load_banq_pre_shot_photos_select_content();
});

function banq_pre_shot_photos_select_load_content(){
	
}

//加载详细，并显示
function load_banq_pre_shot_photos_select_content(){
	//清空页面数据
	var currentPage = $("#banq_pre_shot_photos_select_page");
	currentPage.find('[tag="picBox"]').empty();
	
	showLoading();
	var banqData = {};
	banqData.random = Math.random();
	banqData.userId = session.get("userId");
	banqData.photoType = session.get("photoType");
	
	$.getJSON(basePath+"/app/banqPreShotPhotosSelect/pageInit.xhtml"+callback, banqData,function(msg){
		if($.trim(msg.returnCode) == '0'){
			if (msg.data.length <= 0) {
				showHide();
				showMessage('暂无数据', '5000');
				return;
			}
			bind_banq_pre_shot_photos_select_to_page(msg);	

		}
		else{
			showHide();
			errorHandler(msg.returnCode, msg.message);
		}
	});//end $.getJSON
};

	
//显示图片
function bind_banq_pre_shot_photos_select_to_page(msg){
	
	var currentPage = $("#banq_pre_shot_photos_select_page");
	currentPage.find('[tag="picBox"]').empty();
	
		//显示照片
	$.each(msg.data.BanqPhotoList,function(i,n){
		var $item = $('<dl class="act2"><dt><img alt=""></dt><dd></dd></dl>');
		//显示图片
		var $image = $item.find('img');
		
		$image.attr('src',"data:image/jpeg;base64,"+n.extension);
		$image.attr("pictureId",n.id);
		$image.attr("imei",n.mobileImei);
		$image.attr("address",n.gpsPosition);
		currentPage.find('[tag="picBox"]').append($item);
	});
	
    showHide();
}

//确认照片
function banqPreShotPhotosSelect_selectPhotos(){
	var page = $('#banq_pre_shot_photos_select_page');
	var $selectedElements = page.find('.act3');
	var selectPhotoArr = new Array();
	var photoId = session.get("images");
	for(var i=0;i<$selectedElements.length;i++){
		var photoObject = {};
		var image = $selectedElements.find("img")[i];
		if(photoId.search($(image).attr('pictureId')) == -1){
			photoObject.opId = $(image).attr('pictureId');
			photoObject.outPhoto = $(image).attr('src');
			photoObject.imei = $(image).attr('imei');
			photoObject.address = $(image).attr('address');
			selectPhotoArr.push(photoObject);
		}
	}
	session.set("selectPhotoArr",JSON.stringify(selectPhotoArr));
	back_page();
}//end


