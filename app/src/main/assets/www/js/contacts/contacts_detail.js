            var contacts_detail_page = $('#contacts_detail_page');
            var contacts_detail_myScroll;
/******************************tel_detail_page---begin**************************************/	   
            contacts_detail_page.live('pageinit',function(e, ui){
	        	var wrapper = "tel_detail_wrapper";
	            var up = "tel_detail_pullUp";
	            var down = "tel_detail_pullDown";
	            contacts_detail_myScroll = createMyScroll(wrapper,up,down);

	        	contacts_detail_page.find(".BackBtn").live("tap",function(event){
//	        		goto_page("contacts_dept_page");
	        		event.stopPropagation();
	        		back_page();
	        	});
	        	
	        	contacts_detail_page.find(".ShowOffLineControl").live("fastClick",function(){
	        		goto_page("contacts_favorite_page");
	        	});
	        	
	        	contacts_detail_page.find(".tit").live("tap",function(){
	        		var userObj = {};
	        		var account = $(this).attr("id");
	        		var name = $(this).attr("u_name");
	        		var email = $(this).attr("email");
//	        		var teamCode = $(this).attr("teamCode");
	        		var organizationName = $(this).attr("organizationName");
//	        		var position = $(this).attr("position");
//	        		var remark = $(this).attr("remark");
	        		var mobile = $(this).attr("mobile");
	        		var landLine = $(this).attr("landLine");
	        		var cityName = $(this).attr("cityName");
	        		
	        		
	        		userObj.account = account;
	        		userObj.name = ( name ==undefined?'':name);
	        		userObj.email=( email ==undefined ?'':email);
//	        		userObj.teamCode=( teamCode ==undefined?'':teamCode);
	        		userObj.organizationName = ( organizationName ==undefined?'':organizationName);
//	        		userObj.position =  ( position ==undefined?'':position);
//	        		userObj.remark = ( remark ==undefined?'':remark);
	        		userObj.mobile = (mobile ==undefined?'':mobile);
	        		userObj.landLine = (landLine ==undefined?'':landLine);
	        		userObj.cityName = (cityName ==undefined?'':cityName);
	        		
	        		session.set("tel_peo", JSON.stringify(userObj));
	        		session.set("pagefrom_peo_detail","contacts_detail_page");
	        		  
	        		session.remove("hassearchvalue");
	        		
	        		//返回该页面时返回选择的项
        			var scrollMapJSON = {};
        			scrollMapJSON.account = account;
        			scrollMap.contacts_detail_page = JSON.stringify(scrollMapJSON);
        			
	        		goto_page("contacts_peo_detail_page");
	        	});
	        	
	        	
	        	
	        	contacts_detail_page.find("._search").live("tap",function(){
	        		var page = $('#contacts_detail_page');
	        		//获取输入内容
	        		var searchValue = page.find(".searchBox input").val();
	        		if($.trim(searchValue)==""){
	        			showMessage("不能为空");
	        			return;
	        		}
	        		
	        		//设置 搜索页面 来源
	        		session.set("pagefrom","contacts_detail_page");
	        		//整个部门查询
//	        		session.set("sltfw",session.get("sltfw"));
	        		session.set("department",session.get("department"));
	        		session.set("telsearch",searchValue);
	        		session.remove("hassearchvalue");
	        		goto_page("contacts_search_page");
	        	});
	        	
    	    });	
            contacts_detail_page.live('pageshow',function(e, ui){
            	
            	currentLoadActionName = "contacts_detail_load_content"
            	
            	currentTemplatePage = "contacts_detail_page";
            	var page = $('#contacts_detail_page');
            	
            	var hassearchvalue = session.get("hassearchvalue");
            	
            	if("true"==hassearchvalue){
            		page.find(".searchBox input").val('');
            	}
            	
            	  //判断当前 页面 如果非当前页面 就返回
            	  if(!beforePageShowCheck($(this))){
            		  return;
            	  }
            	  var fromPage = session.get("fromPage");
            	  if(fromPage != "contacts_favorite_page" && fromPage != "contacts_peo_detail_page" &&fromPage != "contacts_search_page" ){

            		  load_tel_detail_content();
             	 }
            	  
            	  if(fromPage == "contacts_peo_detail_page"){
          			// 获取当前页的index
          			var account = 0;
          	 	    var scrollNowPage = session.get("nowPage");
          	 	    if(!$.isEmptyObject(scrollMap)){
          	 	    	var commonScrollMapJsonObj = scrollMap[scrollNowPage];
          	 	    	if(commonScrollMapJsonObj != null && typeof(commonScrollMapJsonObj) != "undefined"){
          	 	    		commonScrollMapJsonObj = JSON.parse(commonScrollMapJsonObj);
          	 	    		account = commonScrollMapJsonObj.account;
      	 	 	 	    	//删除Json数据中的scrollNowPage属性  
      	 	 	 	        delete scrollMap[scrollNowPage]; 
          	 	    	}
          	 	    }
          			var scrollCurrentElement = $('#contacts_detail_page').find('.tit[id='+account+']').get(0);
          			contacts_detail_myScroll.refresh();//刷新iScroll
          			contacts_detail_myScroll.scrollToElement(scrollCurrentElement,0);
            	  }
            	  
    	    });	
            
            function contacts_detail_load_content(){
            	
            	
            }
            contacts_detail_page.live('pagehide',function(e, ui){
    	    });	
/******************************tel_detail_page---end**************************************/

            function load_tel_detail_content(){
            	var page = $('#contacts_detail_page');
            	var userCode = session.get("userCode");
            	var userId = session.get("userId");
            	//上级部门
//            	var sltfw = session.get("sltfw");
            	var department = session.get("department");
            	//用于页面回显
    	 	     showLoading();
    	 	     var authData = {};
    	 	     authData.userCode = userCode;
    	 	     authData.userId = userId;
    	 	     //被选择的上级部门
                 //  authData.sltfw = "1";
//    	 	     authData.organizationCode = sltfw;
    	 	     authData.department = department;
    	 	     authData.random = Math.random();
    	 	     //清空
    	 	     page.find(".searchBox").find("input:first").val("");
    	 	     page.find(".linkManList li").remove();
    	 	    $.getJSON(contextPath+"/addressbook/showOrgAddressBookList.xhtml"+callback, authData,function(msg){
    	 	    	if($.trim(msg.returnCode) == '0'){
    	 	    		showHide();
    	 	    		if(msg.data.length>0){
	    	 	    		digui_peo(msg.data);
	    	 	    	}
    	 	    	}else{
//    	 	    		 showMessage("暂无数据");
    	 	    		showHide();
    	 	    		errorHandler(msg.returnCode,msg.message);
    	 	    	}
    	 	    });
    	 	    
    	 	    //递归信息
    	 	    function digui_peo(data,radio,optionclass,sltuseridmap){
    	 	    	var page = $('#contacts_detail_page');
    	 	    	var html = '';
	    			 for(var i=0;i<data.length;i++){
	 	    				var dataresult = data[i];
	 	    				
	 	    				var email =dataresult.Email;
	 	    				var u_name = dataresult.Name;
	 	    				var account = dataresult.Code;
	 	    				var id = dataresult.ID;
//	 	    				var organizationName = dataresult.organizationname;
	 	    				var organizationName = dataresult.Department;
//	 	    				var position = dataresult.Position_Name;
	 	    				var mobile = dataresult.Mobile;
	 	    				var landLine = dataresult.Landline;
	 	    				var cityName = dataresult.City_Name
//	 	    				var teamCode =dataresult.TEAM_NAME;
//	 	    			    var remark =dataresult.remark;
	 	    				 email =  (email==undefined?"":email);
	 	    				 u_name = (u_name== undefined ? "":u_name);
	 	    				 account = (account == undefined ? "":account);
	 	    				 id = (id == undefined ? "":id);
	 	    				 organizationName = (organizationName== undefined? "":organizationName);
//	 	    				 position = (position == undefined ? "":position);
	 	    				 mobile = (mobile == undefined ? "":mobile);
	 	    				 landLine = (landLine == undefined ? "":landLine);
	 	    				 cityName = (cityName == undefined ? "":cityName);
//	 	    				 teamCode=(teamCode==undefined?"":teamCode);
//	 	    				 remark=(remark==undefined?"":remark);
//	 	    		    	 html = "<li><dl class='tit' code='"+dataresult.Code+"' id='"+dataresult.ID+"' position='"+dataresult.Position_Name+"' mobile='"+mobile+"' organizationName='"+dataresult.organizationname+"'  u_name = '"+u_name+"' email='"+email+"'  teamCode='"+teamCode+"' remark='"+dataresult.remark+"'>"+
	 	    				html = "<li><dl class='tit' code='"+account
	 	    					+"' id='"+id
	 	    					+"' mobile='"+mobile
	 	    					+"' landLine='"+landLine
	 	    					+"' cityName='"+cityName
	 	    					+"' organizationName='"+organizationName
	 	    					+"'  u_name = '"+u_name
	 	    					+"' email='"+email+"'>"
	 	    					+
	 	    		    	 	 //通讯录用户头像
//	 	    		    	            	 "<dt><img src='images/tfsred/uName.png'>" +
//		     		    	   		        "</dt>" +
     		    	   		         "<dd><h4>"+u_name+"</h4>" +
     		    	   				 "<span>"+mobile+"</span>" +
     		    	   				 "</dd></dl></li>";
	 	    		    	page.find(".linkManList").append(html);
	 	    			 }
    	 	    }
            }