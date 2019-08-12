var banq_pre_shot_photos_page = $('#banq_pre_shot_photos_page');
var banq_pre_shot_photos_myScroll;

var banqPreShotPhotos_deletedFiles = new Array();//要删除的图片文件id
var banqPreShotPhotos_saveBtnClickAble = 0;//保存按钮是否可点击--0：可点击 1：不可点击
/******************************banq_pre_shot_photos_page---begin**************************************/	   
banq_pre_shot_photos_page.live('pageinit',function(e, ui){
	
	var wrapper = "banq_pre_shot_photos_wrapper";
	var up = "banq_pre_shot_photos_pullUp";
    var down = "banq_pre_shot_photos_pullDown";
	banq_pre_shot_photos_myScroll = createMyScroll(wrapper,up,down);
	
	banq_pre_shot_photos_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page("workbench_page");
        removeImageObject();
        return false;
	});
	
	//点击保存按钮
	banq_pre_shot_photos_page.find(".SaveBtn1").live("tap",function(){
		
		var $saveImage = $("#banq_pre_shot_photos_page").find(".ContentDiv ul img[status='new']");
		if($saveImage.length > 0 || banqPreShotPhotos_deletedFiles.length > 0){

			//保存按钮是否可点击--0：可点击 1：不可点击
			if(banqPreShotPhotos_saveBtnClickAble == 1){
				return false;
			}
			banqPreShotPhotos_saveBtnClickAble = 1
			banqPreShotPhotos_uploadPictures();
		}else{
			showMessage('不存在未保存的照片','5000');
		}
	});
	
	//拍照
	banq_pre_shot_photos_page.find(".PrePhotoBtn").live("tap",function(){
		
		var $id = $(this).attr("id");
		if($id == "banqPreShotPhotos_restaurantPhotosAddBtn"){
			//预拍照片类型--餐厅照片
			session.set("PreShotPhotosType","RestaurantPhotos");
		}else if($id == "banqPreShotPhotos_paymentVoucherPhotosAddBtn"){
			//预拍照片类型--付款凭证照片
			session.set("PreShotPhotosType","PaymentVoucherPhotos");
		}else{
			//预拍照片类型--发票照片
			session.set("PreShotPhotosType","InvoicePhotos");
		}
		//用户是否已签入
		var userInfo = JSON.parse(session.get("userInfo"));
		if (ConstDef.getConstant("ONLINE_STATUS_SIGNIN") == userInfo.user.onlineStatus) {
			onLocationBegin();
			showLoading();
			setTimeout(function(){
				showHide();
				startCamera(0.7,"onCameraDone4BanqPreShotPhotos");
			},1000);
		}
		else{
			showMessage('您没有签入','5000');
		}
		
	});
	
	//图片点击放大
	banq_pre_shot_photos_page.find('.ContentDiv ul img').live("tap",function(){  
		var currentPage = $("#banq_pre_shot_photos_page");
		var fileBase64EncodeStr = "";
		var listImg = currentPage.find('.ContentDiv ul img');
		var photoIndex = listImg.index($(this));
		for (var i = 0; i < listImg.size(); i++) {
			fileBase64EncodeStr = fileBase64EncodeStr + "@" + $(listImg.get(i)).attr("src").replace("data:image/jpeg;base64,","");
		}
		fileBase64EncodeStr = fileBase64EncodeStr.substring(1);
		sendPictures(fileBase64EncodeStr,photoIndex);
	});
	
	//点击删除图片
	banq_pre_shot_photos_page.find('.ContentDiv ul dd').live("tap",function(){
		//获取要删除的文件名
		var $currentImage = $(this).parent().find('img');
		//如果是删除了已保存的照片，则将此照片从服务端也删除
		if($currentImage.attr("status")== "saved"){
			banqPreShotPhotos_deletedFiles.push($currentImage.attr("pictureId"));
			$(this).parent().remove();
		}
		else{
			$(this).parent().remove();
		}
	});
});

banq_pre_shot_photos_page.live('pageshow',function(e, ui){
	banqPreShotPhotos_saveBtnClickAble = 0;//保存按钮是否可点击--0：可点击 1：不可点击
	currentLoadActionName  = "banq_pre_shot_photos_load_content";
	load_banq_pre_shot_photos_content();
});

	function banq_pre_shot_photos_load_content(){
		//下拉不刷新，则该方法置空
	}
	
	//加载影像资料列表，并显示
	function load_banq_pre_shot_photos_content(){
		showLoading();
		
		var postData ={};
		postData.random = new Date();
		postData.userId = session.get("userId");
		postData.userCode = session.get("userCode");
		$.getJSON(basePath+"/app/banqPreShotPhotos/pageInit.xhtml"+callback, postData,function(msg){
			if($.trim(msg.returnCode) == '0'){
				if(msg.data){
					var data = msg.data;
					bind_banq_pre_shot_photos_to_page(data);
				}
				showHide();
			}else{
            	showHide();
            	errorHandler(msg.returnCode,msg.message);
	        }
		});//end $.getJSON
	}


function bind_banq_pre_shot_photos_to_page(data){
	$currentPage = $("#banq_pre_shot_photos_page");
	var $imageTypeList = $currentPage.find(".ContentDiv ul");
	$imageTypeList.empty();
	 
	if(data.BanqPhotoList != null && data.BanqPhotoList.length>0){
		$.each(data.BanqPhotoList,function(i,n){
			
			var $item = $('<li class="res"><dt><img alt=""></dt><dd></dd></li>');
			var $image = $item.find('img');
			$image.attr('src',"data:image/jpeg;base64,"+n.extension);
			$image.attr("status","saved");//保存过的照片
			$image.attr("pictureId",n.id);
			$image.attr("photoType",n.photoType);
			
			if(n.photoType=='1'){
				$currentPage.find("#banqPreShotPhotos_restaurantPhotosDiv ul").append($item);
			}
			if(n.photoType=='2'){
				$currentPage.find("#banqPreShotPhotos_paymentVoucherPhotosDiv ul").append($item);
			}
			if(n.photoType=='3'){
				$currentPage.find("#banqPreShotPhotos_invoicePhotosDiv ul").append($item);
			}
		});
	}
} //end 

//保存照片
function banqPreShotPhotos_uploadPictures(){

	var $currentPage = $('#banq_pre_shot_photos_page');
	var nowD = new Date();
	var nowDFormat = Format(nowD,"yyyy-MM-dd HH:mm:ss");
	
	var postData = {};
	postData.userId = session.get("userId");
	postData.userCode = session.get("userCode");
	postData.nowDFormat = nowDFormat;
	postData.imei = getIMEI();
	if(!newAddress || newAddress == "undefined" || newAddress == "null"){
		newAddress == "";
	}
	postData.newAddress = newAddress;
	
	
	var formData = new FormData();//定义要上传的照片数据的存储
	formData.append("userId",postData.userId);
	formData.append("userCode",postData.userCode);
	formData.append("takeTime",postData.nowDFormat);
	formData.append("imei",postData.imei);
	formData.append("address",postData.newAddress);
	
	//获取要上传的图片及要删除的图片
	var $images = $currentPage.find('.ContentDiv ul img');
	$.each($images,function(i,n){
		//如果是新拍的照片，则上传文件 
		if($(n).attr('status') == 'new'){
			var file = dataURItoBlob($(n).attr('src'));
			formData.append("img", file);
			formData.append("newFiles",$(n).attr('pictureId'));
			formData.append("photoTypes",$(n).attr("photoType"));
		}
		
	});//end $.each($images,function(i,n){
	
	//要删除的文件的id
	$.each(banqPreShotPhotos_deletedFiles,function(i,n){
		formData.append("deletedFiles", n);
	});
		
	//如果网络是连通的
	if(isNetworkConnected()){
		//上传数据
		$.ajax({
			url: basePath+"/app/banqPreShotPhotos/uploadBanqPreShotPhotos.xhtml", //这个地址做了跨域处理
			data: formData,
			processData: false,
			contentType: false,
			type: 'POST',
			dataType: 'json',
			async:true,
			beforeSend: function () {
				showLoading();
			},
			success: function (msg) {
				showHide();
				if($.trim(msg.returnCode) == '0') {
					if(msg.data){
						if(msg.data.result == "success"){
							//保存成功后，所有照片的状态置为 'saved' 状态
							$('#banq_pre_shot_photos_page').find('.ContentDiv ul img').attr("status","saved");
							//清空deletedFiles数组
							banqPreShotPhotos_deletedFiles.length = 0;
							banqPreShotPhotos_saveBtnClickAble = 0;//保存按钮是否可点击--0：可点击 1：不可点击
//							setTimeout(function(){
//								back_page();
//						        removeImageObject();
//						     },4000)
						}else{
							banqPreShotPhotos_saveBtnClickAble = 0;//保存按钮是否可点击--0：可点击 1：不可点击
						}
					}else{
						banqPreShotPhotos_saveBtnClickAble = 0;//保存按钮是否可点击--0：可点击 1：不可点击
					}
					
					showMessage(msg.message,'4000');
				}
				else{
					errorHandler(msg.returnCode,msg.message);
					banqPreShotPhotos_saveBtnClickAble = 0;//保存按钮是否可点击--0：可点击 1：不可点击
				}
				
			}
		});

	}
	else{
		showMessage("网络不通，请确认手机信号是否正常或联系技术人员查找原因！！",'5000');
	}
}//end

//以下 原生->H5 回调
//--------------------
//相机拍照的回调
function onCameraDone4BanqPreShotPhotos(src) {
	showLoading();
	
	var $currentPage = $('#banq_pre_shot_photos_page');
	//预拍照片类型
	var preShotPhotosType = session.get("PreShotPhotosType");
	session.remove("PreShotPhotosType");
	
	var pictureId = uuid();//生成新拍图片的文件的Id
//	var $item = $('<dl class="act"><dt><img alt="" status="new" pictureId="'+pictureId+'"></dt><dd></dd></dl>');
	var $item = $('<li class="res"><dt><img alt="" status="new" pictureId="'+pictureId+'"></dt><dd></dd></li>');
	var $image = $item.find('img');
	//图片加水印
	var imgsrc = src;
	if (/^data:/.test(imgsrc)) imgsrc = dataURItoBlob(imgsrc);
	watermark([imgsrc])
	.dataUrl(watermark.text.lowerRight(getWatermarkWord(), '20px 微软雅黑', '#fff', 0.5))
	.then(function(url) {
		/************图片压缩begin*********************/
		lrz(url, { quality: 0.7 })  //压缩比
		.then(function (rst) {
			$image.attr('src', rst.base64);
			
			if(preShotPhotosType == "RestaurantPhotos"){
				//预拍照片类型--餐厅照片
				$image.attr("photoType","1");
				$currentPage.find("#banqPreShotPhotos_restaurantPhotosDiv ul").append($item);
			
			}else if(preShotPhotosType == "PaymentVoucherPhotos"){
				//预拍照片类型--付款凭证照片
				$image.attr("photoType","2");
				$currentPage.find("#banqPreShotPhotos_paymentVoucherPhotosDiv ul").append($item);
			
			}else{
				//预拍照片类型--发票照片
				$image.attr("photoType","3");
				$currentPage.find("#banqPreShotPhotos_invoicePhotosDiv ul").append($item);
			}
			
		})
		.catch(function (err){
			showMessage('ERROR:图片压缩出错！','5000');
		}
		)
		.always(function () {
			showHide();
		});
		/*****************图片压缩end********************/      

	});
}