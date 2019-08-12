var workbench_photo_page = $('#workbench_photo_page');


workbench_photo_page.live('pageinit', function(e, ui) {
	
	workbench_photo_page.find(".BackBtn").live("tap",function(event){
		$('#workbench_photo_page').find(".workbench_photo_list").empty();
		event.stopPropagation();
		back_page();
	});


});

workbench_photo_page.live('pageshow',function(e, ui) {
					
		// 判断当前 页面 如果非当前页面 就返回
		if (!beforePageShowCheck($(this))) {
			return;
		}
		// 更换标题(暂时固定为查看大图)
//					var param_title = session.get("image_zoom_page_title");
		var page = $('#workbench_photo_page');
		// 初始化图片地址
		var workbenchPhotoUrl = session.get("contentUrl");

		//清空原始数据列表
	     	page.find(".workbench_photo_list").empty();
	     	var html =  '<iframe  frameborder="0" height="600px" width="100%" scrolling="true"  src="'+workbenchPhotoUrl+'"></iframe>';
	     	page.find(".workbench_photo_list").append(html);
	});

