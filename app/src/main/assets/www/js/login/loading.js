             var loading_page = $('#loading_page');
/******************************home_page---begin**************************************/	   
             loading_page.live('pageinit',function(e, ui){     
    	    });	
             loading_page.live('pageshow',function(e, ui){
    			 currentTemplatePage = "loading_page";
            	 after_loading();
    	    });	
           loading_page.live('pagehide',function(e, ui){
    	   });	
/******************************home_page---end**************************************/
            function after_loading(){
            	 var userCode = local.get("userCode");
            	 var password = local.get("password");
            	 goto_main_page(userCode, password, "loading");
            }
