var case_image_view_page = $('#case_image_view_page');
var case_image_view_myScroll;
/******************************home_page---begin**************************************/	   
case_image_view_page.live('pageinit',function(e, ui){
	
	var wrapper = "case_image_view_wrapper";
	var up = "case_image_view_pullUp";
    var down = "case_image_view_pullDown";
	case_image_view_myScroll = createMyScroll(wrapper,up,down);
	currentLoadActionName = "case_image_view_load_content";
	case_image_view_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page();
                                               removeImageObject();
	});
	
	//影像资料列表项目点击事件
	case_image_view_page.find(".ListRow").live("tap",function(){
//		session.set("page_keyword","可催案件列表");
//		session.set("page_title","可催案件列表");
//		session.set("page_from","case_image_view_page");
//		
//		var requestCode = $(this).attr("requestCode");
//		session.set("requestCode",requestCode);
//		
//		goto_page("collection_case_details_page");
	});
		
});
/******************************home_page---end**************************************/
case_image_view_page.live('pageshow',function(e, ui){
 //如果网络是连通的
	if(isNetworkConnected()){
		var fromPage = session.get("fromPage");
		 if(fromPage != "image_zoom_page"){
			 load_case_image_view_content();
		 }
	}
	else{
		
		//读取缓存
		var key = {};
		key.userId = session.get("userId");
		key.fun = "case_image_view";
		key.method = "load_case_image_view_content";
		var keyExtra = {};
		keyExtra.requestCode = session.get("requestCode");
		key.extra = keyExtra;
		
		
		var extra={};
		extra.operation =ConstDef.getConstant("NATIVE_STORAGE_QUERY");
		extra.callback = "load_case_image_view_content_from_native_storage";
		extra.newDataKey = {};
		extra.newData = {};

		loadNativeStorage(key.userId, key.fun, key.method , key.extra, extra.operation,extra.callback,extra.newDataKey,extra.newData);

	}

});

	function case_image_view_load_content(){
		
	}
	
	//加载影像资料列表，并显示
	function load_case_image_view_content(){
		
		var $imageTypeList = $("#case_image_view_page .ContentDiv");
		$imageTypeList.empty();
		
		showLoading();
		
		var postData = {};
	    postData.random = new Date();
	    postData.userCode = session.get("userCode");
//	    session.set("requestCode","AA-A403982001");
	    postData.requestCode = session.get("requestCode");//案件申请号
		$.getJSON(basePath+"/app/CaseImageView/pageInit.xhtml"+callback, postData,function(msg){
			if($.trim(msg.returnCode) == '0'){
				
				//存入缓存
				var key = {};
				key.userId = session.get("userId");
				key.fun = "case_image_view";
				key.method = "load_case_image_view_content";
				var keyExtra = {};
				keyExtra.requestCode = session.get("requestCode");
				key.extra = keyExtra;
				saveDownloadRawDataToNativeStorage(key.userId, key.fun, key.method, key.extra,msg);
				
				bind_case_image_view__to_page(msg);
				
			
				showHide();

			}
			else{
	            	showHide();
	            	errorHandler(msg.returnCode,msg.message);
	            }

			
		});//end $.getJSON
		
		
	}

function load_case_image_view_content_from_native_storage(value){
	
	var $imageTypeList = $("#case_image_view_page .ContentDiv");
	$imageTypeList.empty();
	
	if(value){
		
		showLoading();

		var msg = JSON.parse(value); 

		if (msg.data != null) {
			bind_case_image_view__to_page(msg);
			
			showHide();
			showMessage('当前网络处于离线状态，您正在查看缓存数据', '1500');
		}
		else{
			showHide();
			showMessage('当前处于离线状态，未读到缓存数', '1500');
			}
	}
	else{
		showMessage('当前网络处于离线状态，未读到缓存数据', '1500');
	}

}

function bind_case_image_view__to_page(msg){
	
	var $imageTypeList = $("#case_image_view_page .ContentDiv");
	
	if(msg.data.length<=0){
	     showHide();
//	  	 showMessage('暂无数据','1500');
	  	 return;
	}
    
	//影像缩略图列表的初始化
	var $template = $("#case_image_view_page .list-row-template");
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
//					goto_page("image_zoom_page");
					var imagePicture = $(this).children("img").attr("imageUrl");
					gesturePicture(imagePicture);
				});

				$thumbList.append($thumListItem);
			}
			else{
				var $thumListItem = $('<li><a href="'+m.imageUrl+'">非图片资料</a></li>');

//				$thumListItem.bind("tap",function(){
//					session.set("imageUrl",$(this).children("img").attr("imageUrl"));//将图片的Url传到查看大图页面
//					goto_page("image_zoom_page");
//					var imagePicture = $(this).children("img").attr("imageUrl");
//					gesturePicture(imagePicture);
//					goto_page("image_zoom_page");
//				});

				$thumbList.append($thumListItem);
			}
			
		});
		
		
		$item.removeClass("list-row-template");
		$item.show();

		$imageTypeList.append($item);
	});//end $.each
    imageUrlStr = imageUrlStr.substring(1);
    sendImages(imageUrlStr);
} //end bind_case_image_view__to_page

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
	