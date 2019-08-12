            var notice_detail_page = $('#notice_detail_page');

/******************************notice_detail_page---begin**************************************/	   
            notice_detail_page.live('pageinit',function(e, ui){
            	notice_detail_page.find(".BackBtn").live("tap",function(){
            		back_page();
            	});         	    
    	    });	
            notice_detail_page.live('pageshow',function(e, ui){
            	  //判断当前 页面 如果非当前页面 就返回
            	  if(!beforePageShowCheck($(this))){
            		  return;
            	  }
        		  currentTemplatePage = "notice_detail_page";
        		  load_notice_detail_content();
    	    });	
            notice_detail_page.live('pagehide',function(e, ui){
            	var page = $('#notice_detail_page');
    	    });	
/******************************notice_detail_page---end**************************************/
            
        function load_notice_detail_content(){
        	var page = $('#notice_detail_page');
        	var authData = {};
        	var userCode = session.get("userCode");
        	showLoading();
			
        	page.find("[identity='noticeTitleLabel']").text("");
	    	page.find("[identity='noticePublisherLabel']").text("");
	    	page.find("[identity='noticePublishDatetimeLabel']").text("");			    	
	    	page.find("[identity='noticeContentLabel']").text("");
	    	
	 	    authData.userCode = userCode;
	 	    authData.noticeId = session.get("noticeId");
	 	   	authData.random = Math.random();
	 	    $.getJSON(contextPath+"/workbench/getNoticeDetail.xhtml"+callback, authData,function(msg){
	 		    if($.trim(msg.returnCode) == '0'){
				    if(msg.data !=null){
						//用户信息
				    	page.find("[identity='noticeTitleLabel']").text(msg.data.title);
				    	page.find("[identity='noticePublisherLabel']").text(msg.data.userName);
				    	page.find("[identity='noticePublishDatetimeLabel']").text(msg.data.publishDatetime);			    	
				    	page.find("[identity='noticeContentLabel']").text(msg.data.content);
				    }
	 	    	}else{
			    	showHide();
			    	errorHandler(msg.returnCode,msg.message);
			    }	 	    		
	 	    });
     		
	 	    showHide();
        }
