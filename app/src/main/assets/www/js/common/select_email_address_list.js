			    
 /*********************************************************show View begin*****************************************************************/	
	      		function show_select_email_address_view(receiveType){
	      			//init
	      			var page = select_email_address_view_Config();
	      			//data
	      			select_email_address_view_Data(receiveType);
	      			//event
	      			select_email_address_view_Event(page);
	      			//view
	      			select_email_address_view_Show(page);
	      		}
	      		function select_email_address_view_Config(page){
	     			 currentTemplatePage = "detail_template_page";
					 currentHeader = "commonHeader2";
					 currentContent = "selectAddressListPanel";
					 currentFooter = ""; 
					 currentLoadActionName = "load_select_email_address_book_tree";
					 leftButtonText = "返回";
					 rightButtonText = "选择";
					 currentPageTitle = "通讯录";
					 page = $("#"+currentTemplatePage);
			    	 detail_template_init(page);
			    	 return page;
	      		}
		
	      		function select_email_address_view_Data(receiveType){
			    	 session.set("address_level", '');
	                 session.set("address_currentNodeName", 'root');
	                 session.set("address_currentNodeTitle", '');
	                 if(receiveType != null && receiveType != ""){
		                 session.set("email_receive_type",receiveType);
	                 }
	     		}

	      		function select_email_address_view_Event(page){
	      			var header = page.find("#"+currentHeader);
			      	header.find("#goback").click(function(){show_send_email_view(true);});
	    		}

	      		function select_email_address_view_Show(page){
//	      			page.find("img[name=mycheckbox]").hide();
	                page.find("#scroller ul li").remove("#bookList");
	                page.find("#scroller ul li").remove("#bookTitle");
	                goto_page(currentTemplatePage);
	    		} 
	/*********************************************************show View end*****************************************************************/	
/******************************************************************************* address_list_page-------end****************************************************************************************/
        	function load_select_email_address_book_tree(){		
        		var page = $("#"+currentTemplatePage);
	        	initScrollArea(page);
        		var currentNodeName = session.get("address_currentNodeName");//page.find("#currentNodeName").val();
        		page.find("#scroller ul li").remove("#bookList");
        		//page.find("#scroller ul li").remove("#bookTitle");
        		showLoading();
        	    $.getJSON(contextPath+"/oa/queryAddressTree.xhtml"+callback, {currentNodeName: currentNodeName}, function(msg){
        		    if($.trim(msg.returnCode) == "0"){ 		  
                     		  $.each(msg.data,  function(i, d){
                     			   var li = "";
           		        		   var level = session.get("address_level");//page.find("#level").val();
                     			   if(i == 0){
                     			       	   var bookTitle = page.find("li[data-role=list-divider]");
                     			       	   bookTitle.each(function(i){
                     			       		    	   if($.trim($(this).text()) == d.text){
                     			       		    		    $(this).remove();
                     			       		    	   }
                     			       	   });
                 				    	   li =  ' <li id="bookTitle" data-role="list-divider">'+level+d.text+'</li>'; 
                     				       //page.find("#currentNodeTitle").val(d.text);
                 				    	   session.set("address_currentNodeTitle", d.text);
                 				    	   session.set("address_currentNodeName", d.name);
                 				    	   session.set("address_parentNodeName", d.parentName);
                     				       //page.find("#currentNodeName").val(d.name);
                     				       //page.find("#parentNodeName").val(d.parentName);
                     			   }else{
                         			   if($.trim(d.hasChild) == "true"){
                         				   li = '<li id="bookList" data-icon="false" ><a href="javascript:void(0);"   onclick=goto_select_address_book_childNode("'+d.name+'","'+d.text+'") ><span style="float:right;margin-top:-3px;"><img id="'+d.name+'" name="mycheckbox" style="display:none;"  src="images/common/checkno.png" /></span> &nbsp; '+level+'<img src="images/department.gif" class="ui-li-icon">'+d.text+'</a></li>';
                         			   }else{
                         				   li = '<li id="bookList" data-icon="false"><a href="javascript:void(0);"    onclick=goto_select_address_book_detail("'+d.name+'") ><span style="float:right;margin-top:-3px;"><img id="'+d.name+'" name="mycheckbox" style="display:none;"  src="images/common/checkno.png" /></span> &nbsp; '+level+'<img src="images/person.png" alt="'+d.text+'" class="ui-li-icon">'+d.text+'</a></li>';
                         			   }       
                     			   }   
                     			    page.find("#scroller ul").append(li);
                     		  });
                     		 var currentNodeName = session.get("address_currentNodeName");
                     		 if($.trim(currentNodeName) == "root" || $.trim(currentNodeName) == ""){
                     			   page.find("#goback").attr("onclick", "goto_portal()");
                     		 }else{
                     			  page.find("#goback").attr("onclick", "goto_select_address_book_parentNode()");
                     		 }
                     		 page.find("#scroller ul").listview("refresh");
                     		showHide();
        		    }else{	 
				    	   errorHandler(msg.returnCode,msg.message);
				    }
        		    myRefresh(detail_template_myScroll);
        		});
        	}
        	function goto_select_address_book_childNode(currentNodeName, currentNodeTitle){
        		// var page = $("#detail_template_page");
//        		 var isShow = page.find("img[name=mycheckbox]").css("display");
//        		 if($.trim(isShow) != 'none'){
//        			    check_current_address(currentNodeName);
//        			    return;
//        		 }
        		 session.set("address_currentNodeName",currentNodeName);
        		 var level = session.get("address_level");
        		 session.set("address_level", level+"&nbsp;");
        		 session.set("address_currentNodeTitle", currentNodeTitle);
        		 load_select_email_address_book_tree();
        	}
        	
        	function goto_select_address_book_detail(currentNodeName){
        		session.set("address_currentNodeName",currentNodeName);
        		show_department_list_view(1);
        	}
        	
        	function goto_select_address_book_parentNode(){
      		     var page = $("#"+currentTemplatePage);
      		     var parentNodeName = session.get("address_parentNodeName");
      		     session.set("address_currentNodeName",parentNodeName);
       		     var level = session.get("address_level");
       		     level = level.substring(0,level.length-6);
       		     session.set("address_level", level);
      		     var title = session.get("address_currentNodeTitle");
      		     var bookTitle = page.find("li[data-role=list-divider]");
      		     bookTitle.each(function(i){
      		    	   if($.trim($(this).text()) == title){
      		    		    $(this).remove();
      		    	   }
      		     });
      		     load_select_address_book_tree();
      	    }

        	