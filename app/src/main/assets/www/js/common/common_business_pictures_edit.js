var common_business_pictures_edit_page = $('#common_business_pictures_edit_page');
var common_business_pictures_edit_myScroll;

var common_business_pictures_edit_page_handler = {};

var commonBusinessPicturesEdit_deletedFiles = new Array();//要删除的图片文件id

common_business_pictures_edit_page_handler.common_business_pictures_edit_page_init = function(){
	//拍照取证
	var $currentPage = $('#common_business_pictures_edit_page');
	$currentPage.find(".bottoms1-red li:last").on("tap",function(){
		
		//拍摄照片张数不超过9张
		var $currentPage = $('#common_business_pictures_edit_page');
		var $listImg = $currentPage.find('[tag="picBox"] img');
		
		var listImgLimitCount = 9;
		var fromPage = session.get("fromPage");
		if(fromPage == "audit_report_edit_page" || fromPage == "audit_custodian_report_edit_qc_page"){
			listImgLimitCount = 6;
		}else if(fromPage == "audit_report_edit_qc_page"){
			var buttonType = session.get("buttonType")
			if(buttonType == "AuditQCPhotos"){
				//在合格证盘点页面点击车辆列表中【照片】按钮转页时，限制6张照片
				listImgLimitCount = 6;
			}else{
				//在合格证盘点页面底部新增按钮【报告拍照】，限制5张照片
				listImgLimitCount = 5;
			}
		}else if(fromPage == "audit_list_page"){
			//收费确认书照片
			listImgLimitCount = 3;
		}
		if($listImg.length < listImgLimitCount){
			var userInfo = JSON.parse(session.get("userInfo"));
			if (ConstDef.getConstant("ONLINE_STATUS_SIGNIN") == userInfo.user.onlineStatus) {
				onLocationBegin();
				showLoading();
				setTimeout(function(){
					showHide();
					startCamera(0.7,"onCameraDone4CommonBusinessPicturesEdit");
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
};

/******************************home_page---begin**************************************/
common_business_pictures_edit_page.live('pageinit',function(e, ui){
	var wrapper = "common_business_pictures_edit_wrapper";
//	var up = "common_business_pictures_edit_pullUp";
//	var down = "common_business_pictures_edit_pullDown";
	common_business_pictures_edit_myScroll = createMyScroll(wrapper);

	common_business_pictures_edit_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page();
		removeImageObject();
	});

	//点击上传文件
	common_business_pictures_edit_page.find(".SaveBtn2").live("tap",function(){
		
		commonBusinessPicturesEdit_uploadPictures();
	});

	common_business_pictures_edit_page_handler.common_business_pictures_edit_page_init();
	
	//点击删除图片
	common_business_pictures_edit_page.find('[tag="picBox"] dd').live("tap",function(){

		//获取要删除的文件名
		var $currentImage = $(this).parent().find('img');

		//如果是删除了已保存的照片，则将此照片从服务端也删除
		if($currentImage.attr("status")== "saved"){
			commonBusinessPicturesEdit_deletedFiles.push($currentImage.attr("pictureId"));
			$(this).parent().remove();
		}
		else{
			$(this).parent().remove();
		}
	});

	//图片点击放大
	common_business_pictures_edit_page.find('[tag="picBox"] img').live("tap",function(){  

		var currentPage = $("#common_business_pictures_edit_page");
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

common_business_pictures_edit_page.live('pageshow',function(e, ui){

	currentLoadActionName = "common_business_pictures_edit_load_content";
	load_common_business_pictures_edit_content();
});

function common_business_pictures_edit_load_content(){
	
}

//清空页面数据
function clear_common_business_pictures_edit_content(){
	var currentPage = $("#common_business_pictures_edit_page");
	currentPage.find('[tag="picBox"]').empty();
}

//加载详细，并显示
function load_common_business_pictures_edit_content(){
	//清空页面数据
	clear_common_business_pictures_edit_content();

	showLoading();
	var currentPage = $("#common_business_pictures_edit_page");

	var postData = {};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.businessId = session.get("businessId");
	postData.functionFlag = session.get("functionFlag");
	
	$.getJSON(basePath+"/app/commonBusinessPicturesEdit/pageInit.xhtml"+callback, postData,function(msg){

		showHide();
		
		if($.trim(msg.returnCode) == '0'){
			
			bind_common_business_pictures_edit_to_page(msg);	

		}
		else{
			errorHandler(msg.returnCode,msg.message);
		}
	});//end $.getJSON
};



function bind_common_business_pictures_edit_to_page(msg){
	
	var currentPage = $("#common_business_pictures_edit_page");
	currentPage.find('[tag="picBox"]').empty();
	
		//显示照片
		var pictures = msg.data.pictures;
		$.each(pictures,function(i,n){
			if(n.extension){

				var $item = $('<dl class="act"><dt><img alt=""></dt><dd></dd></dl>');

				//显示图片
				var $image = $item.find('img');
				$image.attr('src',"data:image/jpeg;base64,"+n.extension);
//				$image.attr('attachmentId',n.attachmentId);

				//显示照片时，记录照片在服务器端的Id，并初始化状态为 "normal"
				$image.attr("pictureId",n.id);
				$image.attr("status","saved");//保存过的照片

				currentPage.find('[tag="picBox"]').append($item);
			}

		});

}

//上传照片
function commonBusinessPicturesEdit_uploadPictures(){
	var page = $('#common_business_pictures_edit_page');

	var postData = {};
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	postData.businessId = session.get("businessId");
	postData.businessType = session.get("businessType");
	postData.functionFlag = session.get("functionFlag");
	postData.auditCheckListId = session.get("auditCheckListId");
	postData.dealerCode = session.get("auditListDealerCode");
	postData.useSameTaskIdFlag = session.get("useSameTaskIdFlag");
	postData.auditPlanDayId = session.get("auditPlanDayId");
	
	var formData = new FormData();//定义要上传的催记数据的存储
	formData.append("userCode",postData.userCode);
	formData.append("businessId",postData.businessId);
	formData.append("businessType",postData.businessType);
	formData.append("functionFlag",postData.functionFlag);
	formData.append("auditCheckListId",postData.auditCheckListId);
	formData.append("dealerCode",postData.dealerCode);
	formData.append("auditPlanDayId",postData.auditPlanDayId);
	formData.append("useSameTaskIdFlag",postData.useSameTaskIdFlag);

	//获取要上传的图片及要删除的图片
	var common_business_pictures_edit_page = $('#common_business_pictures_edit_page');
	var $images = common_business_pictures_edit_page.find('[tag="picBox"] img')

	//要删除的文件的id
	$.each(commonBusinessPicturesEdit_deletedFiles,function(i,n){
		formData.append("deletedFiles", n);
	});

	$.each($images,function(i,n){
		//如果是新拍的照片，则上传文件 
		if($(n).attr('status') == 'new'){
			var file = dataURItoBlob($(n).attr('src'));
			formData.append("img", file);
			formData.append("newFiles",$(n).attr('pictureId'));
		}
	});//end $.each($images,function(i,n){
		
	//如果网络是连通的
	if(isNetworkConnected()){

		//上传催记数据
		$.ajax({
			url: basePath+"/app/commonBusinessPicturesEdit/uploadPictures.xhtml", //这个地址做了跨域处理
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
							var common_business_pictures_edit_page = $('#common_business_pictures_edit_page');
							common_business_pictures_edit_page.find('[tag="picBox"] img').attr("status","saved");

							//清空deletedFiles数组
							commonBusinessPicturesEdit_deletedFiles.length = 0;
							var returntaskStatus = msg.data.returntaskStatus;
				    		session.remove("taskStatus");
				    		session.set("taskStatus",returntaskStatus);
							//保存成功后返回已保存的催记ID
//							var $currentPage =$("#common_business_pictures_edit_page");
//							$currentPage.find(".SaveBtn1").attr("collectionRecordId",msg.data.collectionRecordId);
						}
					}

					showMessage(msg.message,'5000');
				}
				else{
					errorHandler(msg.returnCode,msg.message);
				}
			},
			complete: function() {

			}
		});

	}
	else{
		showMessage("网络不通，请确认手机信号是否正常或联系技术人员查找原因！！",'5000');
	}
}//end saveCollectionRecord


//--------------------
//以下 原生->H5 回调
//--------------------
//相机拍照的回调
function onCameraDone4CommonBusinessPicturesEdit(src) {
	showLoading();

	var pictureId = uuid();//生成新拍图片的文件的Id
	var common_business_pictures_edit_page = $('#common_business_pictures_edit_page');
	var $item = $('<dl class="act"><dt><img alt="" status="new" pictureId="'+pictureId+'"></dt><dd></dd></dl>');
	var $image = $item.find('img');

	//图片加水印
	var imgsrc = src;
	if (/^data:/.test(imgsrc)) imgsrc = dataURItoBlob(imgsrc);
	watermark([imgsrc])
	.dataUrl(watermark.text.lowerRight(getWatermarkWord(), '25px 微软雅黑', '#fff', 0.5))
	.then(function(url) {


		/************图片压缩begin*********************/
		lrz(url, { quality: 0.7 })  //压缩比
		.then(function (rst) {
			$image.attr('src', rst.base64);
			common_business_pictures_edit_page.find('[tag="picBox"]').append($item);
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
