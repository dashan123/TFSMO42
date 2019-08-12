               var list_template_page = $("#list_template_page");
               var list_template_myScroll;
/******************************list_template_page---begin**************************************/
               list_template_page.live('pageinit',function(e, ui){
            	    //create scroll
	          	    var wrapper = "list_template_wrapper";
 	        	    var up = "list_template_pullUp";
 	        	    var down = "list_template_pullDown";
 	        	    list_template_myScroll =  createMyScroll(wrapper, up, down);   
 	        	    //init content
 	        	    Content_for_list_template(list_template_page);
 	        	    //init footer
           	        Footer_for_list_template(list_template_page);
           	        //init header
           	        Header_for_list_template(list_template_page);
			   }).live('pageshow',function(e, ui){
				     //load Dynamic data
		    	     load_data();
			   }).live('pagehide',function(e, ui){
              	     var page = $("#work_platform_page");
             	     page.find("#data_list").empty();
	   	       });	
 /******************************list_template_page---end**************************************/		    

 /******************************list_template_page---begin**************************************/
		     function Header_for_list_template(page){
		    	 //var page = 
             }
		     function Footer_for_list_template(page){
		    	 page.find("#photoNews").live("click",function(){ show_news_list_view("photoNews",1);});
         	     page.find("#jituanNews").live("click",function(){ show_news_list_view("jituanNews",1);});
              	 page.find("#jicengNews").live("click",function(){ show_news_list_view("jicengNews",1);});
            	 page.find("#ziliaoNews").live("click",function(){ show_news_list_view("ziliaoNews",1);});
           	       
            	 page.find("#workplatform").live('tap',function(){show_work_platform_view(1);});
 	        	 page.find("#document").live('tap',function(){show_todo_document_list_view(1);});
 	        	 page.find("#addressbook").live('tap',function(){show_address_list_view();});
 	        	 page.find("#meeting").live('tap',function(){show_meeting_list_view(1);});
 	        	  
 	        	 page.find("#selectAddress").live('tap',function(){show_select_email_address_view('address');});
 	        	 page.find("#selectCC").live('tap',function(){show_select_email_address_view('cc');});
 	        	 page.find("#selectBCC").live('tap',function(){show_select_email_address_view('bcc');});
 	        	 page.find("#show_email_detail_id").live("tap",function(){changePanel('1');});
 	        	 page.find("#show_email_attachment_id").live("tap",function(){changePanel('2');});
 	        	 page.find("#submit_data").live('tap',function(e, ui){validate_email();});
            	 
 	        	 page.find("#receive_box").live("click",function(){show_received_email_list_view(1);});
 	        	 page.find("#send_email").live("click",function(){show_send_email_view(true);});
 	        	 page.find("#sended_email").live("click",function(){show_sended_email_list_view(1);});
 	        	   
 	        	 page.find("#portal").live("click",function(){show_portal_view();});
 	        	 page.find("#oa").live("click",function(){show_work_platform_view(1);});
 	        	 page.find("#email").live("click",function(){show_received_email_list_view(1);});
 	        	 page.find("#more").live("click",function(){show_more_view();});
		     }
		     
		     function Content_for_list_template(page){
		    	 page.find("#todo").live("tap",function(){show_todo_document_list_view();});
		    	 page.find("#toview").live("tap",function(){show_toview_document_list_view();}); 
           	       
		    	 page.find("#search").live("tap",function(){load_data();});
           	       
		    	 page.find("#photoMore").live("tap",function(){show_news_list_view("photoNews",1);});
		    	 page.find("#jituanMore").live("tap",function(){show_news_list_view("jituanNews",1);});
		    	 page.find("#jicengMore").live("tap",function(){show_news_list_view("jicengNews",1);});
		    	 page.find("#ziliaoMore").live("tap",function(){show_news_list_view("ziliaoNews",1);});
		    	 page.find("#messageNumber").live("tap",function(){show_message_view();});
		     }
	     
		    function load_data(){
		    	if(currentLoadActionName != undefined && currentLoadActionName != ''){
			    	eval(currentLoadActionName)();
		    	}
		    }
		    
		    function list_template_init(page){
		    	 page.find('#header span[data-view=header]').hide();
		    	 page.find('#content span[data-view=content]').hide();
		    	 page.find('#footer div[data-view=footer]').hide();
     			 page.find("#header #goback").unbind("click");
      			 page.find("#header #refresh_data").unbind("click");
      			 page.find("ul li").remove('#gridInfo');
				 if($.trim(currentHeader) != ""){
					 var header = page.find("#header");
					 header.find("#"+currentHeader).show();
					 header.find("#"+currentHeader).find("#goback").text(leftButtonText);
					 header.find("#"+currentHeader).find("#refresh_data").text(rightButtonText);
					 if($.trim(currentPageTitle) != ""){
						 header.find("#"+currentHeader).find("#pageTitle").text(currentPageTitle);
					 }
				 }
				 if($.trim(currentContent) != ""){
					page.find('#content #'+currentContent).show();
				 }
				 if($.trim(currentFooter) != ""){
					page.find('#footer #'+currentFooter).show();
				 }
		    	 //oa
		    	 page.find('#footer #workplatform').removeClass('ui-btn-active');
		    	 page.find('#footer #document').removeClass('ui-btn-active');
		    	 page.find('#footer #addressbook').removeClass('ui-btn-active');
		    	 page.find('#footer #meeting').removeClass('ui-btn-active');
		    	 //email
	        	 page.find("#footer #receive_box").removeClass('ui-btn-active');
 	        	 page.find("#footer #send_email").removeClass('ui-btn-active');
 	        	 page.find("#footer #sended_email").removeClass('ui-btn-active');
		    }
/******************************list_template_page---end**************************************/			

