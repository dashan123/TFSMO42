            var notice_list_page = $('#notice_list_page');
            var notice_myScroll;

/******************************workbench_page---begin**************************************/	   
            notice_list_page.live('pageinit',function(e, ui){
            	
            	//定义分页用到的数据
            	var wrapper = "notice_list_wrapper";
	        	var up = "notice_list_pullUp";
	        	var down = "notice_list_pullDown";
            	notice_myScroll = createMyScroll(wrapper, up, down);
            	currentLoadActionName = "notice_load_content";
            	
            	notice_list_page.find(".BackBtn").live("tap",function(event){
            		event.stopPropagation();
	        		//初始化分页
	        		currentPage = 1;
	        		hasData = true;
            		back_page();
            	});    
            	notice_list_page.find(".goto_notice_detail_id").live("tap",function(){
	        		var noticeId = $(this).attr("rel");
	        		session.set("noticeId", noticeId);
	        		
	        		var scrollMapJSON = {};
	        		scrollMapJSON.noticeId = noticeId;
	        		scrollMap.notice_list_page = JSON.stringify(scrollMapJSON);
	        		
	        		goto_page("notice_detail_page");
	        	});
    	    });	
            notice_list_page.live('pageshow',function(e, ui){
            	//判断当前 页面 如果非当前页面 就返回
            	if(!beforePageShowCheck($(this))){
            		return;
            	}
            	currentTemplatePage = "notice_list_page";
        	  
            	var fromPage = session.get("fromPage");
            	//如果前页面是workbench,则进入页面后重新加载数据
            	if (fromPage == "workbench_page") {
            		var page = $('#notice_list_page');
            		page.find(".list_row").empty();
            	}
            	//如果前页面是从notice_detail_page页面返回,则不重新加载数据
            	if (fromPage != "notice_detail_page") {
            		notice_load_content();
            	}else{
            		// 获取当前页的index
            		var noticeId = "";
             	    var scrollNowPage = session.get("nowPage");
             	    if(!$.isEmptyObject(scrollMap)){
             	    	var commonScrollMapJsonObj = scrollMap[scrollNowPage];
             	    	if(commonScrollMapJsonObj != null && typeof(commonScrollMapJsonObj) != "undefined"){
             	    		commonScrollMapJsonObj = JSON.parse(commonScrollMapJsonObj);
             	    		noticeId = commonScrollMapJsonObj.noticeId;
         	 	 	    	//删除Json数据中的scrollNowPage属性  
         	 	 	        delete scrollMap[scrollNowPage]; 
             	    	}
             	    }
            		var scrollCurrentElement = $('#notice_list_page').find('.goto_notice_detail_id[rel="'+noticeId+'"]').get(0);
            		notice_myScroll.refresh();//刷新iScroll
            		notice_myScroll.scrollToElement(scrollCurrentElement,0);
            	}
        		  
    	    });	
            notice_list_page.live('pagehide',function(e, ui){
            	var page = $('#notice_list_page');
    	    });	
/******************************workbench_page---end**************************************/
            
        function notice_load_content (){

        	var page = $('#notice_list_page');
 	     	
        	if (hasData) {
        		//如果还有数据则加载
        		load_noticeList_content(page);
        	}
        }
            
        function load_noticeList_content(page){
        	var html = '';
        	var authData = {};
        	var userId = session.get("userId");
        	showLoading();
       	
        	//设置分页开始结束位置
        	setScroll(authData);
        		 	    
	 	    authData.userId = userId;
	 	    authData.random = Math.random();
	 	    $.getJSON(contextPath+"/workbench/getNoticeList.xhtml"+callback, authData,function(msg){
	 		    if($.trim(msg.returnCode) == '0'){
				    if(msg.data !=null && msg.data.length>0){
						//通知信息
				    	$.each(msg.data, function(i, p) {
					    	html += '<a href="#" rel="'+p.id+'" class="goto_notice_detail_id">';
					    	html += '<strong>'+p.title+'</strong>';
					    	//html += '<i>NEW</i>';
					    	html += '<span class="arrow-shadow"></span>';
					    	html += '<span class="time">'+p.publishDatetime+'</span></a>';
					    });
				    	
		            	page.find(".list_row").append(html);
		            	//判断该列表是否已无数据
	                	if (!hasPage(msg.data.length)) {
	                		hasData = false;
	                		//无数据时结束分页滚动
	                		endScroll(notice_myScroll);
	                	}
	                	showHide();
				    } else {
				    	showHide();
//		            	showMessage('暂无数据','5000');	
		            	hasData = false;
		            	//无数据时结束分页滚动
                		endScroll(notice_myScroll);
				    }
	 	    	}else{
			    	showHide();
			    	errorHandler(msg.returnCode,msg.message);
			    }	 
	 	    });
        }
