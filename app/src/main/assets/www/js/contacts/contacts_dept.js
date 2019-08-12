             var  contacts_dept_page =$("#contacts_dept_page");
             var contacts_dept_page_myScroll;
 /******************************tel_dept_page---begin**************************************/	  
                 contacts_dept_page.live('pageinit',function(e,ui){
            	 var wrapper = "contacts_dept_page_wrapper";
            	    var up = "contacts_dept_page_pullUp";
            	    var down = "contacts_dept_page_pullDown";
            	    
            	    //人员标识  0：内部人员  1：外包人员
            	    var userFlag = session.get("userFlag");
            	    
            	 contacts_dept_page_myScroll = createMyScroll(wrapper,up,down);
            	 
            	 contacts_dept_page.find(".ShowOffLineControl").live('tap',function(){
            		 if(userFlag == 0){
            			 goto_page("contacts_favorite_page");
            		 }
            	 });
            	 
            	 contacts_dept_page.find(".groupTitle").live("tap",function(){
            		 var $this =$(this).next();
            		if( $this.is(":visible")){
            		 $("#contacts_dept_page").find(".group dl").slideUp();
            		 $("#contacts_dept_page").find(".groupTitle").find("span:first").removeClass("allBtn_up");
            		 $("#contacts_dept_page").find(".groupTitle").find("span:first").addClass("allBtn_down");
            		}else{
            			$("#contacts_dept_page").find(".group dl").slideDown();
            			$("#contacts_dept_page").find(".groupTitle").find("span:first").removeClass("allBtn_down");
            			$("#contacts_dept_page").find(".groupTitle").find("span:first").addClass("allBtn_up");
            		}
            	 });
            	 
            	 contacts_dept_page.find("._search").live('tap',function(){
            		 if(userFlag == 0){
            			 var  page =$("#contacts_dept_page");
                		 
                		 //获取输入框中的内容
                		 var searchValue =page.find(".searchBox").find("input:first").val();
                		 if($.trim(searchValue)==null||$.trim(searchValue)==""){
                			 showMessage("不能为空！");
                			 return;
                		 }
                		//设置 搜索页面 来源
                		 session.set("pagefrom","contacts_dept_page");
                		//整个部门查询
//                		 session.set("sltfw","");
                		 session.set("department","");
                		 session.set("telsearch",searchValue);
                		 goto_page("contacts_search_page");
            		 }
            	 });
                
            	 contacts_dept_page.find(".tit").live("fastClick",function(){
            		 if(userFlag == 0){
            			 var $this = $(this);
     	        		var $sub = $this.find("dl");
     	        		if($sub && $sub.length<=0){
//     	        			var organizationid = $this.attr("orgId");
//     	        			var organizationCode = $this.attr("code");
     	        			var department = $this.attr("department");
     	        			//设置部门信息
//     	        		    session.set("sltfw",organizationCode);
     	        		    session.set("department",department);
     	        			
     	        			session.set("hassearchvalue","true");
     	        			
     	        			var scrollMapJSON = {};
//     	        			scrollMapJSON.organizationid = organizationid;
     	        			scrollMapJSON.department = department;
     	        			scrollMap.contacts_dept_page = JSON.stringify(scrollMapJSON);
     	        			
     	        	       goto_page("contacts_detail_page");
     	        		}
            		 }
	        		
	        	});
             });
             
                 contacts_dept_page.live('pageshow',function(e,ui){
                	 
                	 currentLoadActionName =  "contacts_dept_load_content"
                	 
                	 var fromPage = session.get("fromPage");
                	 if(fromPage != "contacts_favorite_page" && fromPage != "contacts_search_page" &&fromPage != "contacts_detail_page" ){
                		//人员标识  0：内部人员  1：外包人员
                 	    var userFlag = session.get("userFlag");
                 	   if(userFlag != ConstDef.getConstant("USERFLAG_OUTSOURCE_COMPANY")){
                 		  load_tel_dept_page_content();
                 	   }else{
                 		  //清空
                 		  $("#contacts_dept_page").find(".searchBox").find("input:first").val("");
                 		  $("#contacts_dept_page").find(".group dl").remove();
                 	   }
                		 
                	 }
                	 
                	 if(fromPage == "contacts_detail_page"){
                			// 获取当前页的index
//                			var organizationid = 0;
                			var department = "";
                	 	    var scrollNowPage = session.get("nowPage");
                	 	    if(!$.isEmptyObject(scrollMap)){
                	 	    	var commonScrollMapJsonObj = scrollMap[scrollNowPage];
                	 	    	if(commonScrollMapJsonObj != null && typeof(commonScrollMapJsonObj) != "undefined"){
                	 	    		commonScrollMapJsonObj = JSON.parse(commonScrollMapJsonObj);
//                	 	    		organizationid = commonScrollMapJsonObj.organizationid;
                	 	    		department = commonScrollMapJsonObj.department;
            	 	 	 	    	//删除Json数据中的scrollNowPage属性  
            	 	 	 	        delete scrollMap[scrollNowPage]; 
                	 	    	}
                	 	    }
//                			var scrollCurrentElement = $('#contacts_dept_page').find('.tit[orgId='+organizationid+']').get(0);
                			var scrollCurrentElement = $('#contacts_dept_page').find('.tit[department='+department+']').get(0);
                			contacts_dept_page_myScroll.refresh();//刷新iScroll
                			contacts_dept_page_myScroll.scrollToElement(scrollCurrentElement,0);
                	 }
            	
             });
                 
                 function contacts_dept_load_content(){
                	 
                 }
                 
 /******************************tel_dept_page---end**************************************/	             
             function load_tel_dept_page_content(){
            	 var  page =$("#contacts_dept_page");
            	 //清空
                 page.find(".searchBox").find("input:first").val("");
            	 page.find(".group dl").remove();
            	 showLoading();
            	 var postData={};
            	 postData.random=Math.random();
            	 postData.userCode = session.get("userCode");
            	 $.getJSON(basePath+"/app/addressbook/showAllOrgList.xhtml"+callback,postData,function(msg){
            		  if($.trim(msg.returnCode) == '0'){
            			  if(msg.data !=null){
	   	 	    			 var html = '';
		 	    			html+=digui_dept(msg.data);
	   	 	    		    page.find(".group").append(html);  	 	    			
	   	 	    		 	//默认展开个人顶级部门节点
	   	 	    		      digui_openlevel();
	            		   }
            		       showHide();
            		  }else{
       	 	    		showHide();
      	 	    		errorHandler(msg.returnCode,msg.message);
     	 	       }
            	 });
            	 
     	 	    function digui_openlevel(){
    	 	    	var data = page.find(".groupTitle");
    	 	    	if(data.length>0){
    	 	    		var wrap_obj = $(data[0]).parents(".list-wrap");
    	 	    		if(wrap_obj.length>0){
    	 	    			var obj = wrap_obj[wrap_obj.length-1];
    	 	    			if($(obj).prev(".tit").length>0){
    	 	    				$(obj).prev(".tit").tap();
    	 	    			}
    	 	    		}
    	 	    	}
    	 	    }
     	 	    
       	 	    //递归部门信息
    	 	    function digui_dept(data){
    	 	    	var html = '';
    	 	    	//信息选择状态
	    			 for(var i=0;i<data.length;i++){
 	    				var dataresult = data[i];
 	    				if(dataresult != null){
 	    					html += "<dl  class='tit' department='"+dataresult.Department+"'>" 
 	    					+ "<dd>"+dataresult.Department+"</dd></dl>";
 	    				}else{
 	    					html += "<dl  class='tit' department=''>" 
 	    					+ "<dd> </dd></dl>";
 	    				}
	 	    		}
	    			 return html;	 	    	
    	 	    }
//    	 	    //递归部门信息
//    	 	    function digui_dept(data){
//    	 	    	var html = '';
//    	 	    	//信息选择状态
//    	 	    	for(var i=0;i<data.length;i++){
//    	 	    		var dataresult = data[i];
//    	 	    		var suborgarray = dataresult.parentOrgCode;
//    	 	    		var opentparentlevel = (dataresult.id == session.get("organizationid") ? dataresult.organizationid:"");
//    	 	    		opentparentlevel = (opentparentlevel=="undefined" || opentparentlevel=="") ? "":"opentparentlevel";
//    	 	    		html += "<dl  class='tit' orgId='"+dataresult.id+"' code='"+dataresult.code+"'>" +
//    	 	    		//"<dt><img src='images/tfsred/linkMan_4.jpg'>" +"</dt>" +
//    	 	    		"<dd>"+dataresult.name+"</dd></dl>";
//    	 	    		if(suborgarray!=null && suborgarray.length>0){
//    	 	    			html += '<div class="sub" style="position: absolute;height:inherit;top:0px;right:0px;width:35px;"><i class=""></i></div>';
//    	 	    		}
//    	 	    		if(suborgarray!=null && suborgarray.length>0){
//    	 	    			html += '<div class="list-wrap">';
//    	 	    			for(var j=0;j<suborgarray.length;j++){
//    	 	    				html +='<div class="list" style="height:auto;border-bottom:none;">';
//    	 	    				var temArray = new Array();
//    	 	    				temArray.push(suborgarray[j]);
//    	 	    				html += digui_dept(temArray);
//    	 	    				html +='</div>';
//    	 	    			}
//    	 	    			html += '</div>';
//    	 	    		}
//    	 	    	}
//    	 	    	return html;	 	    	
//    	 	    }
             }