            
            var no_footer_template_page = $("#no_footer_template_page");
            var no_footer_template_myScroll;
/******************************detail_template_page---begin**************************************/	
            no_footer_template_page.live('pageinit',function(e, ui){
	            var wrapper = "no_footer_template_wrapper";
	            var up = "no_footer_template_pullUp";
	        	var down = "no_footer_template_pullDown";
	            no_footer_template_myScroll = createMyScroll(wrapper,up,down);
        	    //init content
        	    Content_for_no_footer_template();
       	        //init header
       	        Header_for_no_footer_template();
			}).live('pageshow',function(e, ui){
		        // var page = $("#detail_template_page");
		        //page.find("#ID").val(ui.prevPage.find('#ID').val());
		        //page.find("#footer").hide();
				load_data();			    
		    }).live('pagehide',function(e, ui){
		    });	
/******************************detail_template_page---end**************************************/
            
            
            /******************************no_footer_template_page---begin**************************************/
            
            	function Header_for_no_footer_template(){}
            	function Content_for_no_footer_template(){}
            
			    function no_footer_template_init(page){
			    	 page.find('#header span[data-view=header]').hide();
			    	 page.find('#content span[data-view=content]').hide();
					 if($.trim(currentHeader) != ""){
						 var header = page.find("#header");
						 header.find("#"+currentHeader).show();
						 header.find("#"+currentHeader).find("#goback").text(leftButtonText);
						 header.find("#"+currentHeader).find("#refresh_data").text(rightButtonText);
						 header.find("#"+currentHeader).find("#goback").unbind("click");
						 header.find("#"+currentHeader).find("#refresh_data").unbind("click");
						 if($.trim(currentPageTitle) != ""){
							 header.find("#"+currentHeader).find("#pageTitle").text(currentPageTitle);
						 }
					 }
					 if($.trim(currentHeader) != ""){
						page.find('#header #'+currentHeader).show();
					 }
					 if($.trim(currentContent) != ""){
						page.find('#content #'+currentContent).show();
					 }
			    }
		    
		  /******************************no_footer_template_page---end**************************************/			
            