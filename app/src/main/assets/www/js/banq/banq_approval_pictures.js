var banq_approval_pictures_page = $('#banq_approval_pictures_page');
var banq_approval_pictures_myScroll;

var banq_approval_pictures_page_handler = {};
var banqApprovalPictures_deletedFiles = new Array();//要删除的图片文件id
var banqApprovalPictures_saveBtnClickAble = 0;//保存按钮是否可点击--0：可点击 1：不可点击

/************************banqanquet_approval_pictures_page---begin**************************************/
banq_approval_pictures_page.live('pageinit',function(e, ui){
	var wrapper = "banq_approval_pictures_wrapper";
	banq_approval_pictures_myScroll = createMyScroll(wrapper);
	
	banq_approval_pictures_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page();
		removeImageObject();
		return false;
	});
	
	//点击保存文件
	banq_approval_pictures_page.find(".SaveBtn1").live("tap",function(){
		
		//保存按钮是否可点击--0：可点击 1：不可点击
		if(banqApprovalPictures_saveBtnClickAble == 1){
			return false;
		}
		var type = session.get("banqApprovalPicturesTitle");
		var $currentPage = $('#banq_approval_pictures_page');
		var $listImg = $currentPage.find('[tag="picBox"] img');
		if(type == "发票照片"){
			if($listImg.length>4){
				showMessage('发票照片最多只能选择4张!','5000');
			}else{
				banqApprovalPictures_saveBtnClickAble = 1
				banqApprovalPictures_uploadPictures();
			}
		}else{
			if($listImg.length>2){
				showMessage('餐厅和付款凭证照片最多只能选择2张!','5000');
			}else{
				banqApprovalPictures_saveBtnClickAble = 1
				banqApprovalPictures_uploadPictures();
			}
		}
	});
	
	//其他申请单照片选择
	banq_approval_pictures_page.find("#banqApprovalPictures_Other").live("tap",function(){
		var $currentPage = $('#banq_approval_pictures_page');
		var $listImg = $currentPage.find('[tag="picBox"] .act');
		var images = "";
		for(var i=0;i<$listImg.length;i++){
			var image = $listImg.find("img")[i];
			images+=$(image).attr('pictureId');
		}
		session.set("images",images);
		goto_page("banq_approval_outside_pictures_select_page");
	});
	
	//预拍摄照片选择
	banq_approval_pictures_page.find("#banqApprovalPictures_preShot").live("tap",function(){
		var $currentPage = $('#banq_approval_pictures_page');
		var $listImg = $currentPage.find('[tag="picBox"] .act');
		var images = "";
		for(var i=0;i<$listImg.length;i++){
			var image = $listImg.find("img")[i];
			images+=$(image).attr('pictureId');
		}
		session.set("images",images);
		
		var type = session.get("banqApprovalPicturesTitle");
		var photoType = "";
		if(type=='餐厅照片'){
			photoType = "1";
		}else if(type=='付款凭证照片'){
			photoType = "2";
		}else{
			photoType = "3";
		}
		session.set("photoType",photoType);
		goto_page("banq_pre_shot_photos_select_page");
	});
	
	//拍照取证
	banq_approval_pictures_page.find("#banqApprovalPictures_Camera").live("tap",function(){
		//拍摄照片张数不超过2张
		var $currentPage = $('#banq_approval_pictures_page');
		var $listImg = $currentPage.find('[tag="picBox"] img');
		var listImgLimitCount = 2;
		var fromPage = session.get("banqApprovalPicturesTitle");
		if(fromPage == "发票照片"){
			listImgLimitCount = 4;
		}
		if($listImg.length < listImgLimitCount){
			var userInfo = JSON.parse(session.get("userInfo"));
			if (ConstDef.getConstant("ONLINE_STATUS_SIGNIN") == userInfo.user.onlineStatus) {
				onLocationBegin();
				showLoading();
				setTimeout(function(){
					showHide();
					startCamera(0.7,"onCameraDone4BanqApprovalPictures");
				},1000);
			}
			else{
				showMessage('您没有签入','5000');
			}
		}
		else{
			showMessage('最多只能拍'+listImgLimitCount+'张照片！','5000');
		}
	});
	
	//点击删除图片
	banq_approval_pictures_page.find('[tag="picBox"] dd').live("tap",function(){
		//获取要删除的文件名
		var $currentImage = $(this).parent().find('img');
		//如果是删除了已保存的照片，则将此照片从服务端也删除
		if($currentImage.attr("status")== "saved"){
			banqApprovalPictures_deletedFiles.push($currentImage.attr("pictureId"));
			$(this).parent().remove();
		}
		else{
			$(this).parent().remove();
		}
	});
	//图片点击放大
	banq_approval_pictures_page.find('[tag="picBox"] img').live("tap",function(){  
		var currentPage = $("#banq_approval_pictures_page");
		var fileBase64EncodeStr = "";
		var listImg = currentPage.find('[tag="picBox"] img');
		var photoIndex = listImg.index($(this));
		for (var i = 0; i < listImg.size(); i++) {
			fileBase64EncodeStr = fileBase64EncodeStr + "@" + $(listImg.get(i)).attr("src").replace("data:image/jpeg;base64,","");
		}
		fileBase64EncodeStr = fileBase64EncodeStr.substring(1);
		sendPictures(fileBase64EncodeStr,photoIndex);
	});
	
	banq_approval_pictures_page.find("#picturesBottoms li").live("tap",function(){
		var $id = $(this).attr("id");
		var $imgSrc = $(this).find("img").attr("src");
		if($id == "banqApprovalPictures_ImagePicker"){
			//当前照片数
			var listImgLength = $('#banq_approval_pictures_page').find('[tag="picBox"] img').length;
			//最多选择照片数
			var listImgLimitCount = 2;
			var fromPage = session.get("banqApprovalPicturesTitle");
			if(fromPage == "发票照片"){
				listImgLimitCount = 4;
			}
			var selectableCount = listImgLimitCount-listImgLength;//可选择的照片数
			if(selectableCount > 0){
				var userInfo = JSON.parse(session.get("userInfo"));
				if (ConstDef.getConstant("ONLINE_STATUS_SIGNIN") == userInfo.user.onlineStatus) {
					onLocationBegin();
					showLoading();
					
					setTimeout(function(){
						showHide();
						ImagePicker("onImagePickerDoneBanqApprovalPictures",selectableCount);
					},1000);
				}
				else{
					showMessage('您没有签入','5000');
				}
			}else{
				showMessage('最多只能选择'+listImgLimitCount+'张照片！','5000');
			}
		}
	});
});

banq_approval_pictures_page.live('pageshow',function(e, ui){
	banqApprovalPictures_saveBtnClickAble = 0;//保存按钮是否可点击--0：可点击 1：不可点击
	currentLoadActionName = "banq_approval_pictures_load_content";
	
	var fromPage = session.get("fromPage");
	 if(fromPage != "banq_approval_outside_pictures_select_page"
		 && fromPage != "banq_pre_shot_photos_select_page"){
		 
		 load_banq_approval_pictures_content();
	 }else{
		 var selectPhotoArr = JSON.parse(session.get("selectPhotoArr"));
			if(selectPhotoArr!=null){
				for(var i=0;i<selectPhotoArr.length;i++){
					var selectPhotoObj = selectPhotoArr[i];
					var $item = $('<dl class="act"><dt><img status="selected" pictureId="'+selectPhotoObj.opId+'" src="'+selectPhotoObj.outPhoto+'"></dt><dd></dd></dl>');
					$("#banq_approval_pictures_page").find('[tag="picBox"]').append($item);
				}
			}
			session.remove("selectPhotoArr");
	}
	
});

function banq_approval_pictures_load_content(){
	
}

//加载详细，并显示
function load_banq_approval_pictures_content(){
	$("#banq_approval_pictures_page").find('[tag="picBox"]').empty();
	var banqApprovalPicturesTitle = session.get("banqApprovalPicturesTitle");
	var $Camera = $("#picturesBottoms");
	var status = session.get("status");

	$Camera.empty();
	//申请单打回状态:1 非打回 0打回--来至接口
	if(status=='0'){
		var $item = $('<li id="banqApprovalPictures_Other"><a href="#" data-before-src="10" data-after-src="16"><div><img src="images/tfsred/pictures.png" width="20"></div> <i>其他申请单照片</i></a></li>');
		$Camera.append($item);
		
		var $item1 = $('<li id="banqApprovalPictures_preShot"><a href="#" data-before-src="10" data-after-src="16"><div><img src="images/tfsred/pictures.png" width="20"></div> <i>预拍摄照片</i></a></li>');
		$Camera.append($item1);
		$Camera.attr('class',"bottoms2-red");
	}else{
		if(banqApprovalPicturesTitle=='付款凭证照片'){
			var $item = $('<li id="banqApprovalPictures_Camera"><a href="#" data-before-src="10" data-after-src="16"><div><img src="images/tfsred/photograph.png" width="20"></div> <i>拍照</i></a></li><li id="banqApprovalPictures_ImagePicker"><a href="#" data-before-src="11" data-after-src="17"><div><img src="images/tfsred/photoAlbum.png" width="20"></div> <i>相册</i></a></li>');
			$Camera.append($item);
			
			var $item1 = $('<li id="banqApprovalPictures_preShot"><a href="#" data-before-src="10" data-after-src="16"><div><img src="images/tfsred/pictures.png" width="20"></div> <i>预拍摄照片</i></a></li>');
			$Camera.append($item1);
			$Camera.attr('class',"bottoms3-red");
		}else{
			var $item = $('<li id="banqApprovalPictures_Camera"><a href="#" data-before-src="10" data-after-src="16"><div><img src="images/tfsred/photograph.png" width="20"></div> <i>拍照</i></a></li>');
			$Camera.append($item);
			
			var $item1 = $('<li id="banqApprovalPictures_preShot"><a href="#" data-before-src="10" data-after-src="16"><div><img src="images/tfsred/pictures.png" width="20"></div> <i>预拍摄照片</i></a></li>');
			$Camera.append($item1);
			$Camera.attr('class',"bottoms2-red");
		}
		
	}
	$("#banq_approval_pictures_page").find(".HeadTit").text(banqApprovalPicturesTitle);
	
	
	if(banqApprovalPicturesTitle=='餐厅照片'){
		var restaurantStr = session.get("restaurant");
		if(restaurantStr != null && restaurantStr !=''){
			var res = new Array();
			var rid = new Array();
			res = restaurantStr.split("@");
			rid = session.get("rid").split(",");
			for(var i=0;i<res.length;i++){
				var $item = $('<dl class="act"><dt><img status="saved" pictureId="'+rid[i]+'" src="'+res[i]+'"></dt><dd></dd></dl>');
				$("#banq_approval_pictures_page").find('[tag="picBox"]').append($item);
			}
		}
		
	}else if(banqApprovalPicturesTitle=='付款凭证照片'){
		var paymentStr = session.get("payment");
		if(paymentStr != null && paymentStr !=''){
			var pays = new Array();
			var pid = new Array();
			pays = paymentStr.split("@");
			pid = session.get("pid").split(",");
			for(var i=0;i<pays.length;i++){
				var $item = $('<dl class="act"><dt><img status="saved" pictureId="'+pid[i]+'" src="'+pays[i]+'"></dt><dd></dd></dl>');
				$("#banq_approval_pictures_page").find('[tag="picBox"]').append($item);
			}
		}
	}else{
		var invoiceStr = session.get("invoice");
		if(invoiceStr != null && invoiceStr !=''){
			var invs = new Array();
			var nid = new Array();
			invs = invoiceStr.split("@");
			nid = session.get("nid").split(",");
			for(var i=0;i<invs.length;i++){
				var $item = $('<dl class="act"><dt><img status="saved" pictureId="'+nid[i]+'" src="'+invs[i]+'"></dt><dd></dd></dl>');
				$("#banq_approval_pictures_page").find('[tag="picBox"]').append($item);
			}
		}
	}
	
};

//保存照片
function banqApprovalPictures_uploadPictures(){
	var type = session.get("banqApprovalPicturesTitle");
	var page = $('#banq_approval_pictures_page');
	var postData = {};
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	postData.applyCode = session.get("applyCode");
	postData.applystatus = session.get("status");
	postData.beforeDate = session.get("beforeDate");
	postData.bgtMoney = session.get("bgtMoney");
	postData.payComment = session.get("payComment");
	var nowD = new Date();
	var nowDFormat = Format(nowD,"yyyy-MM-dd HH:mm:ss");
	var formData = new FormData();//定义要上传的催记数据的存储
	formData.append("userCode",postData.userCode);
	formData.append("applyCode",postData.applyCode);
	if(type=='餐厅照片'){
		formData.append("type","1");
	}else if(type=='付款凭证照片'){
		formData.append("type","2");
	}else{
		formData.append("type","3");
	}
//	formData.append("applyNo",uuid());
	formData.append("userId",postData.userId);
	formData.append("applystatus",postData.applystatus);
	formData.append("beforeDate",postData.beforeDate);
	formData.append("bgtMoney",postData.bgtMoney);
	formData.append("payComment",postData.payComment);
	formData.append("takeTime",nowDFormat);
	formData.append("imei",getIMEI());
	if(!newAddress || newAddress == "undefined" || newAddress == "null"){
		newAddress == "";
	}
	formData.append("address",newAddress);
	//获取要上传的图片及要删除的图片
	var banq_approval_pictures_page = $('#banq_approval_pictures_page');
	var $images = banq_approval_pictures_page.find('[tag="picBox"] img');
	
	var deletedFilesLen = banqApprovalPictures_deletedFiles.length;
	//要删除的文件的id
	$.each(banqApprovalPictures_deletedFiles,function(i,n){
		formData.append("deletedFiles", n);
	});
	
	var newFilesLen = 0;
	$.each($images,function(i,n){
		//如果是新拍的照片，则上传文件 
		if($(n).attr('status') == 'new'){
			var file = dataURItoBlob($(n).attr('src'));
			formData.append("img", file);
			formData.append("newFiles",$(n).attr('pictureId'));
			newFilesLen += 1;
		}
	});//end $.each($images,function(i,n){
	var oldFilesLen = 0;
	$.each($images,function(i,n){
		//如果是以保存的照片，则上传文件 
		if($(n).attr('status') == 'selected'){
			formData.append("oldFiles",$(n).attr('pictureId'));
			oldFilesLen += 1;
		}
	});//end $.each($images,function(i,n){
	
	if(deletedFilesLen == 0 && newFilesLen == 0 && oldFilesLen == 0){
		showMessage('不存在未保存的照片','5000');
	}else{
		//如果网络是连通的
		if(isNetworkConnected()){

			//上传数据
			$.ajax({
				url: basePath+"/app/banqApprovalPictures/uploadBanqPictures.xhtml", //这个地址做了跨域处理
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
						showMessage(msg.message,'4000');
						if(msg.data){
							if(msg.data.result == "success"){
								//保存成功后，所有照片的状态置为 'saved' 状态
								var banq_approval_pictures_page = $('#banq_approval_pictures_page');
								banq_approval_pictures_page.find('[tag="picBox"] img').attr("status","saved");
								//清空deletedFiles数组
								banqApprovalPictures_deletedFiles.length = 0;
								
								setTimeout(function(){
									back_page();
							        removeImageObject();
							     },2000)
							}else{
								banqApprovalPictures_saveBtnClickAble = 0;//保存按钮是否可点击--0：可点击 1：不可点击
							}
						}else{
							banqApprovalPictures_saveBtnClickAble = 0;//保存按钮是否可点击--0：可点击 1：不可点击
						}
					}
					else{
						errorHandler(msg.returnCode,msg.message);
						banqApprovalPictures_saveBtnClickAble = 0;//保存按钮是否可点击--0：可点击 1：不可点击
					}
					
				}
			});

		}
		else{
			showMessage("网络不通，请确认手机信号是否正常或联系技术人员查找原因！！",'5000');
		}
	}

}//end saveCollectionRecord
//--------------------
//以下 原生->H5 回调
//--------------------
//相机拍照的回调
function onCameraDone4BanqApprovalPictures(src) {
	showLoading();
	var pictureId = uuid();//生成新拍图片的文件的Id
	var banq_approval_pictures_page = $('#banq_approval_pictures_page');
	var $item = $('<dl class="act"><dt><img alt="" status="new" pictureId="'+pictureId+'"></dt><dd></dd></dl>');
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
			banq_approval_pictures_page.find('[tag="picBox"]').append($item);
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

//相册选择的回调
function onImagePickerDoneBanqApprovalPictures(src) {
	showLoading();
	var $itemTemplate = $('<dl class="act"><dt><img alt="" status="new"></dt><dd></dd></dl>');
	
	var pictures = new Array();
	pictures = src.split("@");//拆分
	for(var i=0;i<pictures.length;i++){
		var imgsrc = pictures[i];
		if (/^data:/.test(imgsrc)) imgsrc = dataURItoBlob(imgsrc);
		//图片加水印
		watermark([imgsrc])
		.dataUrl(watermark.text.lowerRight(getWatermarkWord(), '20px 微软雅黑', '#fff', 0.5))
		.then(function(url) {
			/************图片压缩begin*********************/
			lrz(url, { quality: 0.7 })  //压缩比
			.then(function (rst) {
				var pictureId = uuid();//生成新拍图片的文件的Id
				var $item = $itemTemplate.clone();
				var $image = $item.find('img');
				$image.attr("pictureId",pictureId);
				$image.attr('src', rst.base64);
				$('#banq_approval_pictures_page').find('[tag="picBox"]').append($item);
			})
			.catch(function (err){
				showMessage('ERROR:图片压缩出错！','5000');
			})
			.always(function () {
				showHide();
			});
			/*****************图片压缩end********************/      

		});
	}
	
}


//拼装水印文字
//function getWatermarkWord() {
//
//	var username = session.get("userName");
//	var waterText = username + " " + getNowString();
//
//	if(!newAddress){
//		waterText = waterText +" 经度:" + newLongitude+" 纬度:"+ newLatitude;
//
//	}else{
//		waterText += newAddress;
//	}
//	return   waterText;
//
//}
