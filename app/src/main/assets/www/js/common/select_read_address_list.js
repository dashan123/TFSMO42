  
/*********************************************************show View begin*****************************************************************/	
      		function show_select_read_address_view(){
      			//init
      			var page = select_read_address_view_Config();
      			//data
      			select_read_address_view_Data();
      			//event
      			select_read_address_view_Event(page);
      			//view
      			select_read_address_view_Show(page);
      		}
      		function select_read_address_view_Config(page){
     			 currentTemplatePage = "detail_template_page";
				 currentHeader = "commonHeader1";
				 currentContent = "selectAddressListPanel";
				 currentFooter = "documentSubmitFooter"; 
				 currentLoadActionName = "load_select_read_address_book_tree";
				 leftButtonText = "返回";
				 rightButtonText = "选择";
				 currentPageTitle = "选择人员";
				 page = $("#"+currentTemplatePage);
		    	 detail_template_init(page);
		    	 return page;
      		}
	
      		function select_read_address_view_Data(){
		    	 session.set("address_level", '');
                 session.set("address_currentNodeName", 'root');
                 session.set("address_currentNodeTitle", '');
     		}

      		function select_read_address_view_Event(page){
      			var header = page.find("#"+currentHeader);
		      	header.find("#goback").click(function(){show_todo_document_list_view(1);});
      			header.find("#refresh_data").click(function(){check_read_address_list();});
				page.find("#document_submit_submit_data").click(function(){confirm_select_read_address();});
 				page.find("#document_submit_cancel_data").click(function(){cancel_select_read_address();});
    		}

      		function select_read_address_view_Show(page){
      			check_read_address_list();
      			page.find("img[name=mycheckbox]").hide();
                page.find("#scroller ul li").remove("#bookList");
                page.find("#scroller ul li").remove("#bookTitle");
                goto_page(currentTemplatePage);
    		} 
/*********************************************************show View end*****************************************************************/	
/********************************* address_list_page-------end**********************************************************/
        	function load_select_read_address_book_tree(){
        		var page = $("#"+currentTemplatePage);
				 initScrollArea(page);
        		var url = session.get("document_detail_readURL");
        		page.find("#scroller ul li").remove("#bookList");
        		//page.find("#scroller ul li").remove("#bookTitle");
        		showLoading();
        	    $.getJSON(contextPath+"/oa/queryReadAddressTree.xhtml"+callback, {url: url,isSub:'false'}, function(msg){
        		    if($.trim(msg.returnCode) == "0"){ 		  
          			           var li = "";
		        		       li +=  ' <li id="bookTitle" data-role="list-divider">陕西延长石油（集团）有限责任公司</li>'; 
                     		  $.each(msg.data,  function(i, d){
//           		        		   var level = page.find("#level").val();
           		        		   if($.trim(d.text) != ""){
           		        			   var id = $.trim(d.id);
           		        			   id = id.replace(":","_");
                         			   if($.trim(d.checkbox) != "true"){
                         				   li += '<li id="'+id+'li" data-icon="false" level="0" ><a href="javascript:void(0);"   onclick=goto_select_read_address_book_childNode("'+id+'","'+d.text+'","'+d.src+'") ><img src="images/department.gif" class="ui-li-icon">'+d.text+'</a></li>';
                         			   }else{
                         				   li += '<li id="'+id+'li" data-icon="false" level="0" ><a href="javascript:void(0);"    onclick=goto_select_read_address_book_childNode("'+id+'","'+d.text+'","'+d.src+'") ><span style="float:right;"><img id="'+id+'img" title="'+$.trim(d.id)+'" style="display:none"  name="mycheckbox"  src="images/common/checkno.png" /></span> <img src="images/person.png" class="ui-li-icon">'+d.text+'</a></li>';
                         			   }   
           		        		   }
                     		  });
               			     page.find("#scroller ul").append(li);
                     		 page.find("#scroller ul").listview("refresh");
                     		 showHide();
        		    }else{	 
				    	   errorHandler(msg.returnCode,msg.message);
				    }
        		    myRefresh(detail_template_myScroll);
        		});
        	}
        	function goto_select_read_address_book_childNode(parentID, text, src){
        		 var page = $("#"+currentTemplatePage);
        		 var isShow = page.find("img[name=mycheckbox]").css("display");
        		 if($.trim(isShow) != 'none'){
        			    check_current_read_address(parentID);
        			    return;
        		 }
        		 
        		 if($.trim(src) == ""){
        			 return;
        		 }
        		 
         		showLoading();
        	    $.getJSON(contextPath+"/oa/queryReadAddressTree.xhtml"+callback, {url: src,isSub:'true'}, function(msg){
        		    if($.trim(msg.returnCode) == "0"){ 		  
          			           var li = "";
          			           var parentLI = page.find("li[id="+parentID+"li]");
       		        		   var level = parentLI.attr("level");
       		        		   level = parseInt(level)+1;
       		        		   var levelSpace = "";
       		        		   for(var i=0; i<parseInt(level); i++){
       		        		         levelSpace += "--";
       		        		   }
       		        		   
       		        		   var flag = true;
       		        		   var parentLILevel = parentLI.attr("level");
       		        		   var nextLI = parentLI.next('li');
       		        		   var nextLILevel = nextLI.attr("level");
           		        	   while(nextLILevel != undefined && (parseInt(parentLILevel) < parseInt(nextLILevel))){
           		        		        var tempLI = nextLI.next('li');
           		        			    nextLILevel = tempLI.attr("level");
           		        			    nextLI.remove();
           		        			    nextLI = tempLI;
        		        				flag = false;
       		        		   }

                     		  $.each(msg.data,  function(i, d){
           		        		   if($.trim(d.text) != ""){
           		        			   var id = $.trim(d.id);
           		        			   id = id.replace(":","_");
                         			   if($.trim(d.checkbox) != "true"){
                         				   li += '<li id="'+id+'li" data-icon="false" level="'+level+'" ><a href="javascript:void(0);"   onclick=goto_select_read_address_book_childNode("'+id+'","'+d.text+'","'+d.src+'") > '+levelSpace+'<img src="images/department.gif" class="ui-li-icon">'+d.text+'</a></li>';
                         			   }else{
                         				   li += '<li id="'+id+'li" data-icon="false"  level="'+level+'" ><a href="javascript:void(0);"    onclick=goto_select_read_address_book_childNode("'+id+'","'+d.text+'","'+d.src+'") ><span style="float:right;"><img id="'+id+'img" title="'+d.id+'" style="display:none"  name="mycheckbox"  src="images/common/checkno.png" /></span> '+levelSpace+'<img src="images/person.png"  class="ui-li-icon">'+d.text+'</a></li>';
                         			   } 
           		        		   }
                     		  });
                     		  if(flag){
                     		        parentLI.after(li);
                     		  }
                     		 page.find("#scroller ul").listview("refresh");
                     		 showHide();
        		    }else{	 
				    	    errorHandler(msg.returnCode,msg.message);
				    }
        		    myRefresh(detail_template_myScroll);
        		});
        	}
        	function check_current_read_address(id){
		        var selectNode = new myCheckbox(id+"img");
		        if(selectNode.val()){
			           selectNode.checkNo();
		        }else{
		    	       selectNode.checkYes();
		        }
        	}
        	function check_read_address_list(){
    		    var content = $("#"+currentContent);
    		    content.find("img[name=mycheckbox]").toggle();
    		    $("#"+currentFooter).toggle();
        	}
        	
        	function confirm_select_read_address(){
         		showLoading();
        		var page = $("#"+currentTemplatePage);
        		var vals = "";
        		page.find("img[name=mycheckbox]").each(function(i){
        			  var check_address = new myCheckbox($(this).attr("id"));
        			  if(check_address.val()){
        				  vals += check_address.title() +";";
        			  }
        		});
        		if($.trim(vals) == ""){
        			showMessage('请先选择传阅人！', 5000);
        			return;
        		}
        		var url = session.get("document_detail_readURL");
        	    $.getJSON(contextPath+"/oa/passReadDocument.xhtml"+callback, {url: url,vals: vals}, function(msg){
            		 showHide();
        		    if($.trim(msg.returnCode) == "0"){ 		  
                            if($.trim(msg.data) == "true"){
                            	showMessage('发送成功！', 5000);
                            }else{
                            	showMessage('发送失败！', 5000);
                            }
 		            }else{	 
			    	       errorHandler(msg.returnCode,msg.message);
			        }
        		    show_document_detail_view(false);
        	    });
        	}
        	function cancel_select_read_address(){
    		    var content = $("#"+currentContent);
    		    content.find("img[name=mycheckbox]").toggle();
    		    content.find("img[name=mycheckbox]").each(function(i){
        			  var check_address = new myCheckbox($(this).attr("id"));
        			  check_address.checkNo();
        		});
    		    $("#"+currentFooter).toggle();
        	}