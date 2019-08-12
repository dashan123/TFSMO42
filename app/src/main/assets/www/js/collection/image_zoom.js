var image_zoom_page = $('#image_zoom_page');


image_zoom_page.live('pageinit', function(e, ui) {
	
	image_zoom_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		removeImageView();
		back_page();
	});


});

image_zoom_page.live('pageshow',function(e, ui) {
					
					// 判断当前 页面 如果非当前页面 就返回
					if (!beforePageShowCheck($(this))) {
						return;
					}

					
					// 更换标题(暂时固定为查看大图)
//					var param_title = session.get("image_zoom_page_title");
					
					// 初始化图片地址
//					var imageUrl = session.get("imageUrl");
//					$("#zoom-image").attr("src",imageUrl);

//					load_newdetail_content();
				});
image_zoom_page.live('pagehide', function(e, ui) {
});

