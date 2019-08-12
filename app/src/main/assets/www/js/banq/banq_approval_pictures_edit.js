var banq_approval_pictures_edit_page = $('#banq_approval_pictures_edit_page');
var banq_approval_pictures_edit_myScroll;
var banqApprovalPicturesEdit_submitBtnClickAble = 0;//提交按钮是否可点击--0：可点击 1：不可点击
/******************************banq_approval_pictures_edit_page---begin**************************************/	   
banq_approval_pictures_edit_page.live('pageinit',function(e, ui){
	
	var wrapper = "banq_approval_pictures_edit_wrapper";
	var up = "banq_approval_pictures_edit_pullUp";
    var down = "banq_approval_pictures_edit_pullDown";
	banq_approval_pictures_edit_myScroll = createMyScroll(wrapper,up,down);
	
	banq_approval_pictures_edit_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page();
        removeImageObject();
        return false;
	});
	
	//点击提交按钮
	banq_approval_pictures_edit_page.find(".SaveBtn2").live("tap",function(){
		
		if(banqApprovalPicturesEdit_submitBtnClickAble == 1){
			return false;
		}
		var $currentPage = $('#banq_approval_pictures_edit_page');
		var $imgEle = $currentPage.find(".ContentDiv ul img");
		if($imgEle.length == 0){
			//如果不存在照片，则提示“该申请单没有照片，是否回HELPDESK走特殊审批渠道”，如果点击是，则继续，否则返回
			showLongPromptMsg("提示","该申请单没有照片，是否回HELPDESK走特殊审批渠道",function(){
				banqApprovalPicturesEdit_submitBtnClickAble = 1;
				//提交类型：1正常提交 2走特殊审批（此时不用拍照）
				submitBanqApprovalPicturesEdit(2);
			})
		}else{
			//如果存在照片，餐厅和发票的照片必须存在，付款凭证可以没有照片
			//餐厅照片
			var $resImgEle = $currentPage.find("#banqApprovalPicturesEdit_restaurantPhotosDiv ul img");
			//发票照片
			var $invoiceImgEle = $currentPage.find("#banqApprovalPicturesEdit_invoicePhotosDiv ul img");
			if($resImgEle.length > 0 && $invoiceImgEle.length > 0){
				
				showConfirm("请确认是否提交", function(){
					banqApprovalPicturesEdit_submitBtnClickAble = 1;
					//提交类型：1正常提交 2走特殊审批（此时不用拍照）
					submitBanqApprovalPicturesEdit(1);
				});
				
			}else{
				banqApprovalPicturesEdit_submitBtnClickAble = 0;
				showMessage('餐厅和发票的照片必须存在!','3000');
				return;
			}
		}
		
	});
	//添加图片
	banq_approval_pictures_edit_page.find(".PhotosAddBtn").live("tap",function(){
		var $id = $(this).attr("id");
		if($id == "banqApprovalPicturesEdit_restaurantPhotosAddBtn"){
			session.set("banqApprovalPicturesTitle","餐厅照片");
		}else if($id == "banqApprovalPicturesEdit_paymentVoucherPhotosAddBtn"){
			
			session.set("banqApprovalPicturesTitle","付款凭证照片");
		}else{
			
			session.set("banqApprovalPicturesTitle","发票照片");
		}
		
		goto_page("banq_approval_pictures_page");
	});
	
	//图片点击放大
	banq_approval_pictures_edit_page.find('.ContentDiv ul img').live("tap",function(){  
		var currentPage = $("#banq_approval_pictures_edit_page");
		var fileBase64EncodeStr = "";
		var listImg = currentPage.find('.ContentDiv ul img');
		var photoIndex = listImg.index($(this));
		for (var i = 0; i < listImg.size(); i++) {
			fileBase64EncodeStr = fileBase64EncodeStr + "@" + $(listImg.get(i)).attr("src").replace("data:image/jpeg;base64,","");
		}
		fileBase64EncodeStr = fileBase64EncodeStr.substring(1);
		sendPictures(fileBase64EncodeStr,photoIndex);
	});
});

banq_approval_pictures_edit_page.live('pageshow',function(e, ui){
	banqApprovalPicturesEdit_submitBtnClickAble = 0;
	currentLoadActionName  = "banq_pre_approval_list_load_content";
	load_banq_approval_pictures_edit_content();
});

	function banq_approval_pictures_edit_load_content(){
		//下拉不刷新，则该方法置空
	}
	
	//加载影像资料列表，并显示
	function load_banq_approval_pictures_edit_content(){
		var $imageTypeList = $("#banq_approval_pictures_edit_page .ContentDiv");
		showLoading();
		var postData ={};
		postData.random = new Date();
		postData.applyCode = session.get("applyCode");
		$.getJSON(basePath+"/app/banqApprovalPicturesEdit/pageInit.xhtml"+callback, postData,function(msg){
			if($.trim(msg.returnCode) == '0'){
				//存入缓存
				showHide();
				if(msg.data){
					var data = msg.data;
					bind_banq_approval_pictures_edit_to_page(data);
				}
			}
			else{
	            	showHide();
	            	errorHandler(msg.returnCode,msg.message);
	            }
		});//end $.getJSON
	}


function bind_banq_approval_pictures_edit_to_page(data){
	
	var $imageTypeList = $("#banq_approval_pictures_edit_page .ContentDiv");
	$imageTypeList.find('ul').empty();
	session.remove("restaurant");
	session.remove("payment");
	session.remove("invoice");
	 
	if(data.BanqPhotoList.length<=0){
	     showHide();
//	     setTimeout(function(){
//	    	 showMessage('暂无数据','1500');
//	     },1000)
	  	 return;
	}
//	var imageUrlStr = "";
	var restaurant = "";
	var payment = "";
	var invoice = "";
	var rid="";
	var pid="";
	var nid="";
	$.each(data.BanqPhotoList,function(i,n){
//		 imageUrlStr = imageUrlStr +'@'+n.extension;
		if(n.photoType=='1'){
			var $item = $('<li class="res"><img alt=""></li>');
			var $image = $item.find('img');
			$image.attr('src',"data:image/jpeg;base64,"+n.extension);
			$image.attr("status","saved");//保存过的照片
			$image.attr("rid",n.id);
			$("#banqApprovalPicturesEdit_restaurantPhotosDiv").find('ul').append($item);
			restaurant+= $image.attr('src')+'@';
			rid+=$image.attr('rid')+',';
		}
		if(n.photoType=='2'){
			var $item = $('<li class="res"><img alt=""></li>');
			var $image = $item.find('img');
			$image.attr('src',"data:image/jpeg;base64,"+n.extension);
			$image.attr("status","saved");//保存过的照片
			$image.attr("pid",n.id);
			$("#banqApprovalPicturesEdit_paymentVoucherPhotosDiv").find('ul').append($item);
			payment+= $image.attr('src')+'@';
			pid+=$image.attr('pid')+',';
		}
		if(n.photoType=='3'){
			var $item = $('<li class="res"><img alt=""></li>');
			var $image = $item.find('img');
			$image.attr('src',"data:image/jpeg;base64,"+n.extension);
			$image.attr("status","saved");//保存过的照片
			$image.attr("nid",n.id);
			$("#banqApprovalPicturesEdit_invoicePhotosDiv").find('ul').append($item);
			invoice+= $image.attr('src')+'@';
			nid+=$image.attr('nid')+',';
		}
	});
	if (restaurant.length > 0) {
		restaurant = restaurant.substr(0, restaurant.length - 1);
    }
	if (payment.length > 0) {
		payment = payment.substr(0, payment.length - 1);
    }
	if (invoice.length > 0) {
		invoice = invoice.substr(0, invoice.length - 1);
    }
	if (rid.length > 0) {
		rid = rid.substr(0, rid.length - 1);
    }
	if (pid.length > 0) {
		pid = pid.substr(0, pid.length - 1);
    }
	if (nid.length > 0) {
		nid = nid.substr(0, nid.length - 1);
    }
//	 imageUrlStr = imageUrlStr.substring(1);
//	 sendImages(imageUrlStr);
	 session.set("restaurant",restaurant);
	 session.set("payment",payment);
	 session.set("invoice",invoice);
	 session.set("rid",rid);
	 session.set("pid",pid);
	 session.set("nid",nid);
} //end 

//提交按钮事件
function submitBanqApprovalPicturesEdit(submitType){
	var page = $('#banq_approval_pictures_edit_page');
	var postData = {};
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	postData.applyCode = session.get("applyCode");//申请单CODE
	postData.submitType = submitType;//提交类型：1正常提交 2走特殊审批（此时不用拍照）
	postData.applystatus = session.get("status");
	postData.beforeDate = session.get("beforeDate");
	postData.bgtMoney = session.get("bgtMoney");
	postData.payComment = session.get("payComment");
		
	//如果网络是连通的
	if(isNetworkConnected()){

		//提交同步照片数据
		$.ajax({
			url: basePath+"/app/banqApprovalPicturesEdit/submitBanqApprovalPictures.xhtml", //这个地址做了跨域处理
			data: postData,
			type: 'POST',
			dataType: 'json',
			async:true,
			beforeSend: function () {
				showLoading();
			},
			success: function (msg) {
				showHide();
				if($.trim(msg.returnCode) == '0') {
					showMessage(msg.data.message,'4000');
					if(msg.data && msg.data.result == "success"){
						banqApprovalPicturesEdit_submitBtnClickAble = 1;
						setTimeout(function(){
							back_page();
					        removeImageObject();
					     },2000)
					}else{
						banqApprovalPicturesEdit_submitBtnClickAble = 0;
					}
					
				}
				else{
					errorHandler(msg.returnCode,msg.message);
				}
			}
		});

	}
	else{
		showMessage("网络不通，请确认手机信号是否正常或联系技术人员查找原因！！",'5000');
	}
}
