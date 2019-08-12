var fi_image_data_query_page = $('#fi_image_data_query_page');
var fi_image_data_query_myScroll;
/******************************fi_image_data_query_page---begin**************************************/	   
fi_image_data_query_page.live('pageinit',function(e, ui){
	
	var wrapper = "fi_image_data_query_wrapper";
	var up = "fi_image_data_query_pullUp";
    var down = "fi_image_data_query_pullDown";
    fi_image_data_query_myScroll = createMyScroll(wrapper,up,down);
	
	fi_image_data_query_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page();
        removeImageObject();
	});
	
	//影像资料列表项目点击事件
	fi_image_data_query_page.find(".ListRow").live("tap",function(){
//		session.set("page_keyword","可催案件列表");
//		session.set("page_title","可催案件列表");
//		session.set("page_from","case_image_view_page");
//		
//		var requestCode = $(this).attr("requestCode");
//		session.set("requestCode",requestCode);
//		
//		goto_page("collection_case_details_page");
	});
	
	//获取影像查询条件弹层	
	var $taskTypeTirebox = $("#fiImageDataQueryPage_tirebox");
	//弹层隐藏
	$taskTypeTirebox.hide();
	//点击查询条件显示列表弹层
	var $topBarElement = $("#fi_image_data_query_page .topBar");
	$topBarElement.live("tap",function(){
		$taskTypeTirebox.show();
		//下箭头变上箭头
		var $arrow = $(this).children("span:last");
		$arrow.removeClass("allBtn_down");
		$arrow.addClass("allBtn_up");
	});

	//取消 弹层选择
	$taskTypeTirebox.find(".Cancel").live("tap",function(){
		$taskTypeTirebox.hide();
		//上箭头变下箭头
		var $arrow = $topBarElement.children("span:last");
		$arrow.removeClass("allBtn_up");
		$arrow.addClass("allBtn_down");
		
	});
	
	//点击弹层列表项进行选择
	var $taskTypeListItem = $("#fi_image_data_query_page #fiImageDataQueryPage_list").find("li");
	$taskTypeListItem.bind("tap",function(){
		var $queryConditionType =  $("#fi_image_data_query_page").find("[identity='queryConditionType']");
		$queryConditionType.text($(this).text());
		$queryConditionType.attr("code",$(this).attr("code"));
		$("#fi_image_data_query_page #queryCondition").attr("placeholder","请输入"+$(this).text());
		
		$("#fiImageDataQueryPage_tirebox").hide();
		//上箭头变下箭头
		var $topBarElement = $("#fi_image_data_query_page .topBar");
		var $arrow = $topBarElement.children("span:last");
		$arrow.removeClass("allBtn_up");
		$arrow.addClass("allBtn_down");
	});
	
	// 按申请号或合同号搜索
	fi_image_data_query_page.find(".chooseBtn").live("tap", function() {

		load_fi_image_data_query_content();

	});
});
/******************************home_page---end**************************************/
fi_image_data_query_page.live('pageshow',function(e, ui){
	
	currentLoadActionName = "fi_image_data_query_load_content";
	
	//初始化查询条件
	var $queryConditionTypeInit =  $("#fi_image_data_query_page").find("[identity='queryConditionType']");
	$queryConditionTypeInit.text("申请号");
	$queryConditionTypeInit.attr("code",1);
	$("#fi_image_data_query_page #queryCondition").val("");
	$("#fi_image_data_query_page #queryCondition").attr("placeholder","请输入申请号");
	
	var $imageTypeList = $("#fi_image_data_query_page .imageRange");
	$imageTypeList.empty();
	
	//如果网络是连通的
//	if(isNetworkConnected()){
//		var fromPage = session.get("fromPage");
//		 if(fromPage != "image_zoom_page"){
//			 load_fi_image_data_query_content();
//		 }
//	}
//	else{
//		
//		var keyExtra = {};
//		keyExtra.requestCode = session.get("requestCode");
//		
//		//读取缓存
//		var key = {};
//		key.userId = session.get("userId");
//		key.fun = "fi_image_data_query";
//		key.method = "load_fi_image_data_query_content";
//		key.extra = keyExtra;
//		
//		var extra={};
//		extra.operation =ConstDef.getConstant("NATIVE_STORAGE_QUERY");
//		extra.callback = "load_fi_image_data_query_content_from_native_storage";
//		extra.newDataKey = {};
//		extra.newData = {};
//
//		loadNativeStorage(key.userId, key.fun, key.method , key.extra, extra.operation,extra.callback,extra.newDataKey,extra.newData);
//
//	}

});

	function fi_image_data_query_load_content(){
		
	}
	
	//加载影像资料列表，并显示
	function load_fi_image_data_query_content(){
		var $imageTypeList = $("#fi_image_data_query_page .imageRange");
		$imageTypeList.empty();
		
		showLoading();
		
//	    session.set("requestCode","AA-A403982001");
		var queryConditionTypeCode = $("#fi_image_data_query_page").find("[identity='queryConditionType']").attr("code");
		var queryConditionTypeText = $("#fi_image_data_query_page").find("[identity='queryConditionType']").text();
		var queryConditionVal = $("#fi_image_data_query_page #queryCondition").val();
		
		if(queryConditionVal == null || queryConditionVal == ""){
			showMessage(queryConditionTypeText+"不能为空", '1500');
			return false;
		}
		
		var postData = {};
	    postData.random = new Date();
	    postData.userCode = session.get("userCode");
	    postData.queryConditionTypeText = encodeURIComponent(queryConditionTypeText);//查询条件类型
	    postData.queryConditionVal = queryConditionVal;//案件申请号或合同号
	    
		$.getJSON(basePath+"/app/fiImageDataQuery/pageInit.xhtml"+callback, postData,function(msg){
			if($.trim(msg.returnCode) == '0'){
				
				//存入缓存
//				var key = {};
//				key.userId = session.get("userId");
//				key.fun = "fi_image_data_query";
//				key.method = "load_fi_image_data_query_content";
//				var keyExtra = {};
//				keyExtra.requestCode = session.get("requestCode");
//				key.extra = keyExtra;
//				saveDownloadRawDataToNativeStorage(key.userId, key.fun, key.method, key.extra,msg);
				
				if(msg.data.length<=0){
				     showHide();
				  	 showMessage('该合同号对应的影像资料不存在','1500');
				  	 return;
				}
				
				bind_fi_image_data_query_to_page(msg);
				
				showHide();
			}
			else{
	            	showHide();
	            	errorHandler(msg.returnCode,msg.message);
	            }

			
		});//end $.getJSON
		
		
	}

//function load_fi_image_data_query_content_from_native_storage(value){
//	
//	var $imageTypeList = $("#fi_image_data_query_page .imageRange");
//	$imageTypeList.empty();
//	
//	if(value){
//		
//		showLoading();
//
//		var msg = JSON.parse(value); 
//
//		if (msg.data != null) {
//			bind_fi_image_data_query_to_page(msg);
//			
//			showHide();
//			showMessage('当前网络处于离线状态，您正在查看缓存数据', '1500');
//		}
//		else{
//			showHide();
//			showMessage('当前处于离线状态，未读到缓存数', '1500');
//			}
//	}
//	else{
//		showMessage('当前网络处于离线状态，未读到缓存数据', '1500');
//	}
//
//}

function bind_fi_image_data_query_to_page(msg){
	
	var $imageTypeList = $("#fi_image_data_query_page .imageRange");
	
	//影像缩略图列表的初始化
	var $template = $("#fi_image_data_query_page .list-row-template");
	var imageUrlStr = "";
	$.each(msg.data,function(i,n){
		var $item = $template.clone(true);
		
		$item.children("h1").attr("typeCode",n["typeCode"])
							.text(n["typeName"]);
		
		var $thumbList = $item.children("ul");
		$.each(n.imageList,function(i,m){
			
			if(m.format.indexOf("image")==0){
				var $thumListItem = $('<li><img src="'+m.thumbUrl
						+'" imageUrl="'+m.imageUrl
						+'" alt=""></li>');
                imageUrlStr = imageUrlStr +'@'+m.imageUrl;
               
				$thumListItem.bind("tap",function(){
					session.set("imageUrl",$(this).children("img").attr("imageUrl"));//将图片的Url传到查看大图页面
					var imagePicture = $(this).children("img").attr("imageUrl");
					gesturePicture(imagePicture);
				});

				$thumbList.append($thumListItem);
			}
			else{
				var $thumListItem = $('<li><a href="'+m.imageUrl+'">非图片资料</a></li>');

				$thumbList.append($thumListItem);
			}
			
		});
		
		
		$item.removeClass("list-row-template");
		$item.show();

		$imageTypeList.append($item);
	});//end $.each
    imageUrlStr = imageUrlStr.substring(1);
    sendImages(imageUrlStr);
} //end bind_fi_image_data_query_to_page

//args： true-放大   false-缩小
function ImageSuofang(args) {
    	var page = $('#newdetail_page');
			
        var oImg = page.find(".ul"); 
        
    	alert(zoomObject.lastScale);
        if(!zoomFlag){
    		//添加图片手势功能
    		zoomObject = new RTP.PinchZoom($(obj).parent(".newsimageview").parent("ul"), {});
    		//标示该图片增加 手势功能
    		zoomFlag = true;
    	}
    	
    	if(null != zoomObject){
    		zoomObject.update();
    	}
        
        if (args) {
            oImg.width = oImg.width * 1.5; 
            oImg.height = oImg.height * 1.5; 
        } 
        else { 
            oImg.width = oImg.width / 1.5; 
            oImg.height = oImg.height / 1.5; 
        } 
    }     
	