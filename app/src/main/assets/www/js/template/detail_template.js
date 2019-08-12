                
            var detail_template_page = $("#detail_template_page");
            var detail_template_myScroll;
            var operateActionName = '';
/******************************detail_template_page---begin**************************************/	
            detail_template_page.live('pageinit',function(e, ui){
	            var wrapper = "detail_template_wrapper";
	            detail_template_myScroll = createMyScroll(wrapper);        	              
        	    //init content
        	    Content_for_detail_template();
        	    //init footer
       	        Footer_for_detail_template();
       	        //init header
       	        Header_for_detail_template();
			}).live('pageshow',function(e, ui){
		        // var page = $("#detail_template_page");
		        //page.find("#ID").val(ui.prevPage.find('#ID').val());
		        //page.find("#footer").hide();
				load_data();			    
		    }).live('pagehide',function(e, ui){
		    });	
/******************************detail_template_page---end**************************************/
            
            /******************************list_template_page---begin**************************************/
		     function Header_for_detail_template(){
		    	 detail_template_page.find("#show_document_detail").live("tap",function(){show_detail();});
		    	 detail_template_page.find("#show_document").live("tap",function(){openDocument();});
		    	 detail_template_page.find("#show_document_attachment").live("tap",function(){show_attachment();});
            }
		     function Footer_for_detail_template(){
		    	 detail_template_page.find("#document_detail_process_track").live("tap",function(){show_process_trace_view();});
		    	 detail_template_page.find("#document_detail_pass_veiw").live("click",function(){goto_pass_view();});
		    	 detail_template_page.find("#document_detail_pass_veiw_track").live("tap",function(){show_view_trace_view(true);});
		    	 detail_template_page.find("#document_detail_finish_veiw").live("click",function(){documentViewOver();});
		    	 detail_template_page.find("#document_detail_submit_task_veiw").live("click",function(){submit1_document();});
		    	 detail_template_page.find("#document_detail_save_advice").live("tap",function(){save_document();});
		     }
		     
		     function Content_for_detail_template(){
		     }
		    
			    function detail_template_init(page){
			    	 page.find('#header span[data-view=header]').hide();
			    	 page.find('#content span[data-view=content]').hide();
			    	 page.find('#footer div[data-view=footer]').hide();
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
					 if($.trim(currentFooter) != ""){
						page.find('#footer #'+currentFooter).show();
					 }
			    }
		    
/******************************list_template_page---end**************************************/			
            
            function operateButton(){
            	var page = $("#"+currentTemplatePage);   	
            	page.find("#footer #"+currentFooter).toggle();
            }

		    

            
            function select_all_commonWords(pageName){
            	var page = $("#"+pageName);
            	page.find('input[type=checkbox]').attr("checked", true).checkboxradio("refresh");
            }
            function cancel_all_commonWords(pageName){
            	var page = $("#"+pageName);
            	page.find('input[type=checkbox]').attr("checked", false).checkboxradio("refresh");
            }