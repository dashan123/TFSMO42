/********************************audit_policy_maintenance_page begin*****************************************************************/	
var audit_policy_maintenance_page = $('#audit_policy_maintenance_page');
var audit_policy_maintenance_myScroll;
var auditPolicyMaintenance_deletedFiles = new Array();//要删除的图片文件id

/******************************home_page---begin**************************************/
audit_policy_maintenance_page.live('pageinit',function(e, ui){
	var wrapper = "audit_policy_maintenance_wrapper";
	audit_policy_maintenance_myScroll = createMyScroll(wrapper);

	audit_policy_maintenance_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page();
		removeImageObject();
		return false;
	});

	//点击保存
	audit_policy_maintenance_page.find(".SaveBtn1").live("tap",function(){
		var currentPage = $("#audit_policy_maintenance_page");
		var listImg = currentPage.find('[tag="picBox"] img');
		if(listImg.size()>0){
			showConfirm("请确认数据是否无误，无误后确认保存", function(){
				saveAuditStorehousePolicy();
			});
		}else{
			showMessage("请至少上传一张图片!", '3000');
		}
	});

	//点击删除图片
	audit_policy_maintenance_page.find('[tag="picBox"] dd').live("tap",function(){

		//获取要删除的文件名
		var $currentImage = $(this).parent().find('img');
		//如果是删除了已保存的照片，则将此照片从服务端也删除
		if($currentImage.attr("status")== "saved"){
			auditPolicyMaintenance_deletedFiles.push($currentImage.attr("commonFileId"));
			$(this).parent().remove();
		}
		else{
			$(this).parent().remove();
		}
	});

	//图片点击放大
	audit_policy_maintenance_page.find('[tag="picBox"] img').live("tap",function(){  
		var currentPage = $("#audit_policy_maintenance_page");
		var fileBase64EncodeStr = "";
		var listImg = currentPage.find('[tag="picBox"] img');
		var photoIndex = listImg.index($(this));
		for (var i = 0; i < listImg.size(); i++) {
			fileBase64EncodeStr = fileBase64EncodeStr + "@" + $(listImg.get(i)).attr("src").replace("data:image/jpeg;base64,","");
		}
		
		fileBase64EncodeStr = fileBase64EncodeStr.substring(1);
		sendPictures(fileBase64EncodeStr,photoIndex);
	});
	
	//拍照
	audit_policy_maintenance_page.find("#auditPolicyMaintenancePhotographLi").live("tap",function(){
		var userInfo = JSON.parse(session.get("userInfo"));
		var $currentPage = $('#audit_policy_maintenance_page');
		var $listImg = $currentPage.find('[tag="picBox"] img');
		
		if($listImg.length < 5){
			if (ConstDef.getConstant("ONLINE_STATUS_SIGNIN") == userInfo.user.onlineStatus) {
				onLocationBegin();
				showLoading();
				setTimeout(function(){
					showHide();
					startCamera(0.7,"onCameraDone4AuditPolicyMaintenance");
				},1000)
			}
			else{
				showMessage('您没有签入','1500');
			}
		}else{
			showMessage('最多只能拍5张照片！','5000');
		}
		
	});
});

audit_policy_maintenance_page.live('pageshow',function(e, ui){

	currentLoadActionName = "audit_policy_maintenance_load_content";
//	var fromPage = session.get("fromPage");//用于回退到此页面时不刷新
	load_audit_policy_maintenance_content();

});

function audit_policy_maintenance_load_content(){
	//下拉不刷新，则该方法置空
}

//加载详细，并显示
function load_audit_policy_maintenance_content(){
	//清空页面数据
	showLoading();
	var currentPage = $("#audit_policy_maintenance_page");

	var postData = {};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.auditStorehousePolicyId = session.get("auditStorehousePolicyId");//保单id
	
	$.getJSON(basePath+"/app/auditPolicyMaintenance/pageInit.xhtml"+callback, postData,function(msg){

		showHide();
		if($.trim(msg.returnCode) == '0'){

			bind_audit_policy_maintenance_to_page(msg);	
		}
		else{
			errorHandler(msg.returnCode,msg.message);
		}
	});//end $.getJSON
};


function bind_audit_policy_maintenance_to_page(msg){

	var $currentPage = $("#audit_policy_maintenance_page");
	$currentPage.find('[tag="picBox"]').empty();
	$currentPage.find("[identity='policyBeginDate']").val("");
	$currentPage.find("[identity='policyEndDate']").val("");
	
//	var auditStorehousePolicyInfo = msg.data.auditStorehousePolicyInfo;
//	if(auditStorehousePolicyInfo != null && auditStorehousePolicyInfo.length > 0){
//		$currentPage.find("[identity='policyBeginDate']").val(auditStorehousePolicyInfo[0].policyBeginDate);
//		$currentPage.find("[identity='policyEndDate']").val(auditStorehousePolicyInfo[0].policyEndDate);
//	}

	//显示催收照片
//	var pictures = msg.data.pictures;
//	if(pictures != null && pictures.length > 0){
//		$.each(pictures,function(i,n){
//			if(n.extension){
//				var $item = $('<dl class="act"><dt><img alt=""></dt><dd></dd></dl>');
//				//显示图片
//				var $image = $item.find('img');
//				$image.attr('src',"data:image/jpeg;base64,"+n.extension);
//
//				//显示照片时，记录照片在服务器端的Id，并初始化状态为 "saved"
//				$image.attr("pictureId",n.id);
//				$image.attr("status","saved");//保存过的照片
//
//				$currentPage.find('[tag="picBox"]').append($item);
//			}
//
//		});
//	}

}

//保存续保信息
function saveAuditStorehousePolicy(){
	var page = $('#audit_policy_maintenance_page');

	var postData = {};
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	//经销商code
	postData.dealerCode = session.get("dealerCode");
	//经销商名称
	postData.dealerName = session.get("dealerName");
	//经销商库房地址
	postData.storehouseAddress = session.get("storehouseAddress");
	//经销商库房id
	postData.storehouseId = session.get("storehouseId");
	//保单ID
	postData.auditStorehousePolicyId = session.get("auditStorehousePolicyId");
	//业务类别
	var businessType = ConstDef.getConstant("BUSINESS_CATEGORY_AUDIT");
	postData.businessType = businessType;
	//保单开始日
	var policyBeginDate = page.find("[identity='policyBeginDate']").val();
	if(policyBeginDate != ""){
		policyBeginDate = policyBeginDate.replace("-","/");
		policyBeginDate = policyBeginDate.replace("-","/");
		postData.policyBeginDate =policyBeginDate+" 00/00/00";
	}else{
//		postData.policyBeginDate ="";
		showMessage('保单开始日不能为空！','1500');
		return false;
	}
	
	//保单截止日
	var policyEndDate = page.find("[identity='policyEndDate']").val();
	if(policyEndDate != ""){
		policyEndDate = policyEndDate.replace("-","/");
		policyEndDate = policyEndDate.replace("-","/");
		postData.policyEndDate =policyEndDate+" 00/00/00";
	}else{
//		postData.policyEndDate ="";
		showMessage('保单截止日不能为空！','1500');
		return false;
	}

	//获取要上传的图片及要删除的图片
	var $images = page.find('[tag="picBox"] img')
//	if($images.length==0){
//		showMessage('请先拍照后再提交保单信息！','1500');
//		return false;
//	}
	
	var formData = new FormData();//定义要上传的催记数据的存储
	formData.append("userCode",postData.userCode);
	formData.append("dealerCode",postData.dealerCode);//经销商code
	formData.append("dealerName",postData.dealerName);//经销商名称
	formData.append("storehouseAddress",postData.storehouseAddress);//经销商库房地址
	formData.append("businessId",postData.auditStorehousePolicyId);//业务ID--保单Id
	formData.append("businessType",postData.businessType);
	formData.append("policyBeginDate",postData.policyBeginDate);
	formData.append("policyEndDate",postData.policyEndDate);
	formData.append("storehouseId",postData.storehouseId);//经销商库房ID

	//要删除的文件的id
	$.each(auditPolicyMaintenance_deletedFiles,function(i,n){
		formData.append("auditPolicyMaintenance_deletedFiles", n);
	});

	$.each($images,function(i,n){
		//如果是新拍的照片，则上传文件 
		if($(n).attr('status') == 'new'){
			var file = dataURItoBlob($(n).attr('src'));
			formData.append("img", file);
			formData.append("newFiles",$(n).attr('pictureId'));
		}
	});//end 
		
	//如果网络是连通的
	if(isNetworkConnected()){
		//上传催记数据
		$.ajax({
			url: basePath+"/app/auditPolicyMaintenance/uploadPictures.xhtml", //这个地址做了跨域处理
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
							page.find('[tag="picBox"] img').attr("status","saved");
							//清空deletedFiles数组
							auditPolicyMaintenance_deletedFiles.length = 0;
							//保存成功后返回已保存的催记ID
							page.find(".SaveBtn1").attr("auditStorehousePolicyId",msg.data.auditStorehousePolicyId);
							
						}
					}
					showMessage(msg.message,'2000');
					setTimeout(function(){
						back_page();
					},2000)
				}
				else{
					errorHandler(msg.returnCode,msg.message);
				}
			},
			complete: function() {

			}
		});

	}
	else{//如果网络未连通
		showMessage("目前离线，请恢复网络后再试！",'2000');
	}
		
}//end saveAuditStorehousePolicy

//--------------------
//以下 原生->H5 回调
//--------------------
//相机拍照的回调
function onCameraDone4AuditPolicyMaintenance(src) {
	showLoading();
	var pictureId = uuid();//生成新拍图片的文件的Id
	var $currentPage = $('#audit_policy_maintenance_page');
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
			$currentPage.find('[tag="picBox"]').append($item);
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
