

/******************************send_email_page---begin**************************************/
            function show_department_list_view(currentPage){
      			//init
      			var page = department_list_view_Config();
      			//data
      			department_list_view_Data(currentPage);
      			//event
      			department_list_view_Event(page);
      			//view
      			department_list_view_Show(page);
      		}

      		function department_list_view_Config(page){
   			   currentTemplatePage = "list_template_page";
			   currentHeader = "commonHeader2";
			   currentContent = "selectAddressDetailPanel";
			   currentFooter = "selectEmailFooter";
			   myPullActionName = "load_select_email_address_detail_content";
			   currentLoadActionName = "load_select_email_address_detail_content";
			   leftButtonText = "返回";
			   rightButtonText = "选择";
			   currentPageTitle = "部门人员";
			   page = $("#"+currentTemplatePage);
	    	   list_template_init(page);
	    	   return page;
      		}
      		function department_list_view_Data(currentPage_){
      			if(currentPage_ != null && currentPage_ != ""){
      				currentPage = currentPage_;
      			}else{
      				currentPage = 1;
      			}
     		}

      		function department_list_view_Event(page){
  				page.find("#goback").click(function(){show_select_email_address_view("");});
  				page.find("#search").click(function(e, ui){load_select_email_address_detail_content();});
  				page.find("#selectEmailFooter #check_all").live("tap",function(){ check_all_address(currentContent);});
  				page.find("#selectEmailFooter #cancel_all").live("tap",function(){ cancel_all_address(currentContent);});
  				page.find("#selectEmailFooter #confirm_select_address").live("click",function(){submit_selected_depart_user();});
  				page.find("#selectEmailFooter #cancel_select_address").live("click",function(){ cancel_all_address(currentContent);});
    		}

      		function department_list_view_Show(page){
      			$("#"+currentFooter).hide();
           		 goto_page(currentTemplatePage);
    		}	    		
/******************************send_email_page---end**************************************/	

/****************************** address_detail_page-------begin***********************************************/
            function goto_show_address_detail(id){
//            	goto_page('list_template_page');           	
            	$('#select_address_list_page #show_address_detail_id').val(id);
            }          
/**
* address_detail_page-------end
****************************************************************************************/
            
/************************************* address_detail_page-------begin**************************************************/
        	function load_select_email_address_detail_content(){
        		        var page = $("#"+currentTemplatePage);	
        		        var content = page.find("#"+currentContent);
        		        initScrollArea(page);
        		        var departmentName = session.get("address_currentNodeName");
        		        var searchName = content.find("#searchName").val();
        		        //page.find("#footer #address_book").addClass("ui-btn-active");
        		        content.find("#data_list li").remove('#gridInfo');
        	 			var queryData = {};
        	 			queryData.searchName = searchName;
        	 			queryData.departmentName = departmentName;
        	 			queryData.page_size = oa_page_size;
        	 			queryData.currentPage = currentPage;
        	 			queryData.random = Math.random();
        	 			showLoading();
      				  	 $.getJSON(contextPath+"/oa/queryAddressBookList.xhtml"+callback, queryData,function(msg){
    						    if($.trim(msg.returnCode) == '0'){
    						    	$.each(msg.data.pageData, function(i, p) {
        	 				                var obj = content.find("ul").children("#address_detail_template").clone();
        	 				                obj.find("#name").text($.trim(p.realName));
        	 				                obj.find("#companyEmail").html("<a href='javascript:void(0)' onclick=goto_send_email('"+$.trim(p.companyEmail)+"') >"+$.trim(p.companyEmail)+"</a>");
        	 				                obj.find("#telephoneNumber").html("<a href='tel:"+$.trim(p.telephoneNumber)+"'>"+$.trim(p.telephoneNumber)+"</a>");
        	 				                obj.find("#mobilePhoneNumber").html("<a href='tel:"+$.trim(p.mobilePhoneNumber)+"'>"+$.trim(p.mobilePhoneNumber)+"</a>");
        	 				                obj.find("#department").text($.trim(p.departmentName));
        	 				                obj.attr("data-filtertext",$.trim(p.ID));   	
        	 				                obj.find("#position").text($.trim(p.position));
        	 				                var myid = $.trim(p.companyEmail);
        	 				                myid = myid.substring(0,myid.indexOf("@"));
        	 				                obj.find("#temp").attr("id", myid);
        	 				                obj.find("table").attr("onclick","check_current_user('"+myid+"')");
        	 				                obj.attr("id","gridInfo");
        	 				                obj.show();
        	 				                content.find("ul").append(obj);
    						    	});
    						    	content.find("ul").listview("refresh");
    						    	showHide();
    						    }else{	 
 						    	   errorHandler(msg.returnCode,msg.message);
    						    }
    						    list_template_myScroll.refresh();
    					  });
        	}
/**
* address_detail_page-------end
****************************************************************************************/

		        
		    function submit_selected_depart_user(){
		    	//var listPage = $("#select_address_template_page");
		    	var page = $("#"+currentTemplatePage);
            	var temp = true; 
            	var checkboxObj = page.find("#selectAddressDetailPanel  img[name=mycheckbox]");
            	checkboxObj.each(function(i){
      			      var check_address = new myCheckbox($(this).attr("id"));
      			      if(check_address.val()){
      			    	temp = false;
      			    	return;
      			      };
      		    });
            	if(temp){ 
            		alert("请先选择！");
			    	return ;
        	    }
		    	var receiveType = session.get("email_receive_type");
		    	if($.trim(receiveType) == 'address' || $.trim(receiveType) == 'cc' || $.trim(receiveType) == 'bcc'){
	            	var names = '';
	            	var targetPageName = $("#sendEmail");
	            	checkboxObj.each(function(i){
	      			      var check_address = new myCheckbox($(this).attr("id"));
	      			      if(check_address.val()){
	      			    	names = names + $.trim($(this).parent().parent().parent().find('#companyEmail').text()) + ';';
	      			      };
	      		    });
	            	names = names.substr(1,names.length-1);
	            	if($.trim(receiveType) == 'address'){
	            		targetPageName.find("#address").val(names);
	            	}else if($.trim(receiveType) == 'cc'){
	            		targetPageName.find("#cc").val(names);
	            	}else if($.trim(receiveType) == 'bcc'){
	            		targetPageName.find("#bcc").val(names);
	            	}
	            	//listPage.find("#targetType").val('');
	            	session.set("email_receive_type","");
	            	show_send_email_view(false,false);
	            	return;
		    	}else if($.trim(receiveType) == 'document_submit_user'){
	            	var names = '';
	            	checkboxObj.each(function(i){
	      			      var check_address = new myCheckbox($(this).attr("id"));
	      			      if(check_address.val()){
	      			    	names = names + $.trim($(this).parent().parent().parent().find('#name').text()) + ';';
	      			      };
	      		    });
	            	names = names.substr(1,names.length-1);
	            	session.set("document_submit_participant", names);
	            	//$("#document_submit_page").find("#participant").val(names);
	            	//goto_page('document_submit_page');
	            	show_document_submit();
	            	return;
		    	}		    	
		    }
		    
        function check_user_list(){
    		    $("#"+currentFooter).hide();
    	}

    	function check_current_user(currentNodeName){
		        var selectNode = new myCheckbox(currentNodeName);
		        if(selectNode.val()){
			           selectNode.checkNo();
		        }else{
		    	       selectNode.checkYes();
		        }
            	var checkboxObj = $("#selectAddressDetailPanel  img[name=mycheckbox]");
            	var num = 0;
            	checkboxObj.each(function(i){
      			      var check_address = new myCheckbox($(this).attr("id"));
      			      if(check_address.val()){
      			    	  num ++;
      			      };
      		    });
            	if(num > 0){ 
            		$("#"+currentFooter).show();
        	    }else{
        	    	$("#"+currentFooter).hide();
        	    }
    	}
		    
    	function check_all_address(pageId){
    		var page = $("#"+pageId);
    		page.find("img[name=mycheckbox]").each(function(i){
    			  var check_address = new myCheckbox($(this).attr("id"));
    			  check_address.checkYes();
    		});
    	}
    	function cancel_all_address(pageId){
    		var page = $("#"+pageId);
    		page.find("img[name=mycheckbox]").each(function(i){
    			  var check_address = new myCheckbox($(this).attr("id"));
    			  check_address.checkNo();
    		});
    		$("#"+currentFooter).hide();
    	}
