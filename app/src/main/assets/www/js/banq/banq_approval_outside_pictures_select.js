var banq_approval_outside_pictures_select_page = $('#banq_approval_outside_pictures_select_page');
var banq_approval_outside_pictures_select_myScroll;

var banq_approval_outside_pictures_select_page_handler = {};

var banqApprovalOutsidePictures_deletedFiles = new Array();//要删除的图片文件id

/******************************banq_approval_outside_pictures_select_page---begin**************************************/
banq_approval_outside_pictures_select_page.live('pageinit',function(e, ui){
	var wrapper = "banq_approval_outside_pictures_select_wrapper";
//	var up = "banq_approval_outside_pictures_select_pullUp";
//	var down = "banq_approval_outside_pictures_select_pullDown";
	banq_approval_outside_pictures_select_myScroll = createMyScroll(wrapper);

	banq_approval_outside_pictures_select_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page();
		removeImageObject();
		return false;
	});
	
	//点击按日期查看照片
	banq_approval_outside_pictures_select_page.find(".chooseBtn").live("tap", function() {
		//分页
		currentPage = 1;
		hasData = true;

		load_banq_approval_outside_pictures_select_content();

	});

	banq_approval_outside_pictures_select_page.find('[tag="picBox"] .act2 dd').live("tap",function(){
		$(this).parent().attr("class","act3");
	});
	
	banq_approval_outside_pictures_select_page.find('[tag="picBox"] .act3 dd').live("tap",function(){
		$(this).parent().attr("class","act2");
	});
	
	//点击确定跳转页面
	banq_approval_outside_pictures_select_page.find(".SaveBtn2").live("tap",function(){
		
		banqApprovalPictures_OutSide_uploadPictures_Select();
	});

	//图片点击放大
	banq_approval_outside_pictures_select_page.find('[tag="picBox"] img').live("tap",function(){  

		var currentPage = $("#banq_approval_outside_pictures_select_page");
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

banq_approval_outside_pictures_select_page.live('pageshow',function(e, ui){
	session.remove("outPhoto");
	currentLoadActionName = "banq_approval_outside_pictures_select_load_content";
	
	$("#banq_approval_outside_pictures_select_page").find('[tag="picBox"]').empty();
	$(this).find("input[name='startDate']").val(getEndTime());
	load_banq_approval_outside_pictures_select_content();
});

function banq_approval_outside_pictures_select_load_content(){
	
}

//加载详细，并显示
function load_banq_approval_outside_pictures_select_content(){
	//清空页面数据
	var currentPage = $("#banq_approval_outside_pictures_select_page");
	currentPage.find('[tag="picBox"]').empty();
	showLoading();
	var banqData = {};
	banqData.random = Math.random();
	banqData.userId = session.get("userId");
	if(session.get("banqApprovalPicturesTitle")=="餐厅照片"){
		banqData.photoType = "1"
	}else if(session.get("banqApprovalPicturesTitle")=="发票照片"){
		banqData.photoType = "3"
	}else{
		banqData.photoType = "2"
	}
	banqData['takePhotoTime'] = currentPage.find("input[name='startDate']").val();
	$.getJSON(basePath+"/app/banqApprovalOutsideSelect/pageInit.xhtml"+callback, banqData,function(msg){
		if($.trim(msg.returnCode) == '0'){
			if (msg.data.length <= 0) {
				showHide();
				showMessage('暂无数据', '5000');
				return;
			}
			
			bind_banq_approval_outside_pictures_select_to_page(msg);	

		}
		else{
			showHide();
			errorHandler(msg.returnCode, msg.message);
			hasData = false;
        	//无数据时结束分页滚动
    		endScroll(sale_travel_record_list_);
		}
	});//end $.getJSON
};

	
//显示图片
function bind_banq_approval_outside_pictures_select_to_page(msg){
	
	var currentPage = $("#banq_approval_outside_pictures_select_page");
	currentPage.find('[tag="picBox"]').empty();
	
//	var imageUrlStr="";
	var $item = "";
	var $listImg = currentPage.find('[tag="picBox"] .act2');
	
		//显示照片
	$.each(msg.data.BanqPhotoList,function(i,n){
//		 imageUrlStr = imageUrlStr +'@'+n.extension;
		$item = $('<dl class="act2"><dt><img alt=""></dt><dd></dd></dl>');
		//显示图片
		var $image = $item.find('img');
		
		$image.attr('src',"data:image/jpeg;base64,"+n.extension);
		$image.attr("pictureId",n.id);
		$image.attr("imei",n.mobileImei);
		$image.attr("address",n.gpsPosition);
		currentPage.find('[tag="picBox"]').append($item);
	});
    showHide();
//	imageUrlStr = imageUrlStr.substring(1);
//	sendImages(imageUrlStr);
}

//确认照片
function banqApprovalPictures_OutSide_uploadPictures_Select(){
	var page = $('#banq_approval_outside_pictures_select_page');
	var act = page.find('.act3');
	var selectPhotoArr = new Array();
	var type = session.get("banqApprovalPicturesTitle");
	var photoId = session.get("images");
	for(var i=0;i<act.length;i++){
		var photoObject = {};
		var image = act.find("img")[i];
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
}//end saveCollectionRecord


