var audit_selfie_image_page = $('#audit_selfie_image_page');
var audit_selfie_image_myScroll;

var audit_selfie_image_page_handler = {};

//var auditSelfieImage_deletedFiles = new Array();//要删除的图片文件id

audit_selfie_image_page_handler.audit_selfie_image_page_init = function(){
	//拍照取证
	var $currentPage = $('#audit_selfie_image_page');
	$currentPage.find(".bottoms1-red li:last").on("tap",function(){
		
		var pictureNum = $currentPage.find('[tag="picBox"] dl').length;
		if(pictureNum >= 1){
			showMessage('每个库房只能拍摄1张自拍照片，需要重拍，请删除原自拍照后再拍！','3000');
			return;
		}
		var userInfo = JSON.parse(session.get("userInfo"));
		if (ConstDef.getConstant("ONLINE_STATUS_SIGNIN") == userInfo.user.onlineStatus) {
			onLocationBegin();
			showLoading();
			setTimeout(function(){
				showHide();
				startCamera(0.7,"onCameraDone4AuditSelfieImage");
			},1000)
		}
		else{
			showMessage('您没有签入','1500');
		}
	});
};

/******************************home_page---begin**************************************/
audit_selfie_image_page.live('pageinit',function(e, ui){
	var wrapper = "audit_selfie_image_wrapper";
	audit_selfie_image_myScroll = createMyScroll(wrapper);

	audit_selfie_image_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page();
		removeImageObject();
	});

	//点击上传文件
	audit_selfie_image_page.find(".SaveBtn2").live("tap",function(){
		//查看当前按钮是否不可用
		if($(this).attr("enable") === "false" ){
//			console.log("不可用：");
			return;
		}
		else{
			$(this).attr("enable","false");//将按钮置为不可用。
			//已经拍摄的照片数量
			var pictureNum = $('#audit_selfie_image_page').find('[tag="picBox"] dl').length;
//			if(pictureNum > 1){
//				showMessage('只能保存1张自拍照片','1500');
//				return;
//			}
//			if(pictureNum < 1){
//				showMessage('请先自拍再上传照片','1500');
//				return;
//			}
			uploadPictures();
//			console.log("可用：");
		}
	

	});

	audit_selfie_image_page_handler.audit_selfie_image_page_init();
	
	//点击删除图片
	audit_selfie_image_page.find('[tag="picBox"] dd').live("tap",function(){

		//获取要删除的文件名
		var $currentImage = $(this).parent().find('img');

//		//如果是删除了已保存的照片，则将此照片从服务端也删除
//		if($currentImage.attr("status")== "saved"){
////			auditSelfieImage_deletedFiles.push($currentImage.attr("fileId"));
//			auditSelfieImage_deletedFiles.push($currentImage.attr("pictureId"));
//			$(this).parent().remove();
//		}
//		else{
			$(this).parent().remove();
//		}
	});

	//图片点击放大
	audit_selfie_image_page.find('[tag="picBox"] img').live("tap",function(){  

		var currentPage = $("#audit_selfie_image_page");
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

audit_selfie_image_page.live('pageshow',function(e, ui){

	currentLoadActionName = "audit_selfie_image_load_content";
	audit_selfie_image_load_content();
	
});

function audit_selfie_image_load_content(){
	load_audit_selfie_image_content();
}

//清空页面数据
function clear_audit_selfie_image_content(){
	var currentPage = $("#audit_selfie_image_page");
	currentPage.find('[tag="picBox"]').empty();
}

//加载详细，并显示
function load_audit_selfie_image_content(){
	//清空页面数据
	clear_audit_selfie_image_content();

	showLoading();
	var currentPage = $("#audit_selfie_image_page");

	var postData = {};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.businessId = session.get("auditList_businessId");

	$.getJSON(basePath+"/app/auditSelfieImage/pageInit.xhtml"+callback, postData,function(msg){

		showHide();

		if($.trim(msg.returnCode) == '0'){
			
			bind_audit_selfie_image_to_page(msg);	

		}
		else{
			errorHandler(msg.returnCode,msg.message);
		}
	});//end $.getJSON
};



function bind_audit_selfie_image_to_page(msg){

	var currentPage = $("#audit_selfie_image_page");
	currentPage.find('[tag="picBox"]').empty();
	
	currentPage.find('[tag="picBox"] dd').css("display","");
	currentPage.find(".SaveBtn2").css("display","");
	currentPage.find(".bottoms1-red").css("display","");
	
	currentPage.find(".SaveBtn2").attr("enable","true");//将按钮置为可用。
	//显示照片
	var pictures = msg.data.pictures;
	if(pictures != null && pictures.length > 0){
		$.each(pictures,function(i,n){
			if(n.extension){

				var $item = $('<dl class="act"><dt><img alt=""></dt><dd></dd></dl>');

				//显示图片
				var $image = $item.find('img');
				$image.attr('src',"data:image/jpeg;base64,"+n.extension);
//					$image.attr('attachmentId',n.attachmentId);

				//显示照片时，记录照片在服务器端的Id，并初始化状态为 "normal"
				$image.attr("pictureId",n.id);
				$image.attr("status","saved");//保存过的照片

				currentPage.find('[tag="picBox"]').append($item);
			}

		});
		
		currentPage.find('[tag="picBox"] dd').css("display","none");
		currentPage.find(".SaveBtn2").css("display","none");
		currentPage.find(".bottoms1-red").css("display","none");
		
	}
}

//上传照片
function uploadPictures(){
	var page = $('#audit_selfie_image_page');

	var postData = {};
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	postData.businessId = session.get("auditList_businessId");
	postData.businessType = ConstDef.getConstant("BUSINESS_CATEGORY_AUDIT");
	
	postData.auditPlanDayId = session.get("auditPlanDayId");
//	postData.dealerCode = session.get("dealerCode");
	postData.dealerCode = session.get("auditListDealerCode");
	postData.auditDate = session.get("auditPlanDate");//抽查任务的抽查日期或者盘点任务的盘点日期
//	postData.auditorId = session.get("auditorId");
	postData.storehouseId = session.get("auditList_storehouseId");
	postData.reportCode = "";
	
	postData.taskType =session.get("taskType");//taskType：1.经销商盘库  2.监管单位盘库 3.抽查
	postData.sameDateAuditTaskFlag = auditListPage_sameDateAuditTaskFlag;//抽查任务是否和其对应的盘点任务同一天--0：不在同一天  1：在同一天
	postData.relationAuditPlanDayId = session.get("relationAuditPlanDayId");//抽查任务对应盘点任务的盘点计划日ID
	
	postData.checkAuditDate = session.get("checkAuditDate");//抽查任务对应的盘点任务的盘点日期
	if(session.get("checkAuditId")!=null && session.get("checkAuditId")!=""){
		postData.checkAuditId = session.get("checkAuditId");//抽查任务对应盘点任务的盘点员ID(user_id)	
	}else{
		postData.checkAuditId = 0;//抽查任务对应盘点任务的盘点员ID(user_id)
	}
	
	//useSameTaskIdFlag:是否使用sameTaskId或checkSameTaskId--0：未使用  1：使用sameTaskId 2：使用checkSameTaskId
	postData.useSameTaskIdFlag = session.get("useSameTaskIdFlag");
	
	var formData = new FormData();//定义要上传的照片数据的存储
	formData.append("userCode",postData.userCode);
	formData.append("businessId",postData.businessId);
	formData.append("businessType",postData.businessType);
	
	formData.append("auditPlanDayId",postData.auditPlanDayId);
	formData.append("dealerCode",postData.dealerCode);
	formData.append("auditDate",postData.auditDate);
	formData.append("checkAuditDate",postData.checkAuditDate);
	formData.append("auditorId",postData.userId);//抽查任务的盘点员ID(user_id)或者盘点任务的盘点员ID(user_id)
	formData.append("checkAuditId",postData.checkAuditId);//抽查任务对应盘点任务的盘点员ID(user_id)
	formData.append("storehouseId",postData.storehouseId);
	formData.append("reportCode",postData.reportCode);
	formData.append("taskType",postData.taskType);
	formData.append("sameDateAuditTaskFlag",postData.sameDateAuditTaskFlag);
	formData.append("relationAuditPlanDayId",postData.relationAuditPlanDayId);
	formData.append("useSameTaskIdFlag",postData.useSameTaskIdFlag);//useSameTaskIdFlag:是否使用sameTaskId或checkSameTaskId--0：未使用  1：使用sameTaskId 2：使用checkSameTaskId

	//获取要上传的图片及要删除的图片
//	var audit_selfie_image_page = $('#audit_selfie_image_page');
//	var $images = audit_selfie_image_page.find('[tag="picBox"] img')
	var $images = page.find('[tag="picBox"] img')

//	//要删除的文件的id
//	$.each(auditSelfieImage_deletedFiles,function(i,n){
//		formData.append("deletedFiles", n);
//	});

	$.each($images,function(i,n){
		//如果是新拍的照片，则上传文件 
		if($(n).attr('status') == 'new'){
			var file = dataURItoBlob($(n).attr('src'));
			formData.append("img", file);
			formData.append("newFiles",$(n).attr('pictureId'));
		}
	});//end $.each($images,function(i,n){
		
	//如果网络是连通的
	if(isNetworkConnected1()){
		//上传盘库照片数据
		$.ajax({
			url: basePath+"/app/auditSelfieImage/uploadPictures.xhtml", //这个地址做了跨域处理
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
				page.find(".SaveBtn2").attr("enable","true");//将按钮置为可用。
				
				if($.trim(msg.returnCode) == '0') {

					if(msg.data){
						if(msg.data.result == "success"){
							//保存成功后，所有照片的状态置为 'saved' 状态
//							var audit_selfie_image_page = $('#audit_selfie_image_page');
//							audit_selfie_image_page.find('[tag="picBox"] img').attr("status","saved");
							page.find('[tag="picBox"] img').attr("status","saved");

							//清空deletedFiles数组
//							auditSelfieImage_deletedFiles.length = 0;

							page.find('[tag="picBox"] dd').css("display","none");
							page.find(".SaveBtn2").css("display","none");
							page.find(".bottoms1-red").css("display","none");
							
							//保存成功后返回已保存的催记ID
//							var $currentPage =$("#audit_selfie_image_page");
//							$currentPage.find(".SaveBtn1").attr("collectionRecordId",msg.data.collectionRecordId);
							var rtnCheckListId = msg.data.rtnCheckListId;
							session.set("rtnCheckListId",rtnCheckListId);
							
							//任务状态(0.未办 1.已办 2.跳过 3.进行中 )
							var returntaskStatus = msg.data.returntaskStatus;
				    		session.remove("taskStatus");
				    		session.set("taskStatus",returntaskStatus);
				    		
							showMessage(msg.message,'2000');
							
							setTimeout(function(){
								back_page();
							},2000);
							
						}else{
							showMessage(msg.message,'2000');
						}
					}

					
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
		showMessage("目前离线，请恢复网络后再试！",'2000');
		page.find(".SaveBtn2").attr("enable","true");//将按钮置为可用。
	}
}//end saveCollectionRecord


//--------------------
//以下 原生->H5 回调
//--------------------
//相机拍照的回调
function onCameraDone4AuditSelfieImage(src) {
	showLoading();

	var pictureId = uuid();//生成新拍图片的文件的Id
	var audit_selfie_image_page = $('#audit_selfie_image_page');
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
			audit_selfie_image_page.find('[tag="picBox"]').append($item);
		})
		.catch(function (err){
			showMessage('ERROR:图片压缩出错！','1500');
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
