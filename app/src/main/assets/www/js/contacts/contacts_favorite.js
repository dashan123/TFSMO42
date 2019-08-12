var contacts_favorite_page = $('#contacts_favorite_page');
            var contacts_favorite_myScroll;
/******************************tel_bookmark_page---begin**************************************/	   
            contacts_favorite_page.live('pageinit',function(e, ui){
	        	var wrapper = "tel_bookmark_wrapper";
	            var up = "tel_bookmark_pullUp";
	            var down = "tel_bookmark_pullDown";
	            contacts_favorite_myScroll = createMyScroll(wrapper,up,down);

	        	contacts_favorite_page.find(".BackBtn").live("tap",function(event){
//	        		goto_page("contacts_dept_page");
	        		event.stopPropagation();
	        		back_page();
	        	});
	        	
	        	contacts_favorite_page.find(".ShowOffLineControl").live("fastClick",function(){
	        		goto_page("contacts_dept_page");
	        	});
	        	
	        	contacts_favorite_page.find(".tit").live("tap",function(){
	        		
	        		var userObj = {};
	        		var account = $(this).attr("id");
	        		var name = $(this).attr("u_name");
	        		var organizationName = $(this).attr("organizationName");
//	        		var position = $(this).attr("position");
	        		var mobile = $(this).attr("mobile");
//	        		var teamCode=$(this).attr("teamCode");
	        		var email =$(this).attr("email");
//	        		var remark = $(this).attr("remark");
	        		var landLine = $(this).attr("landLine");
	    			var cityName = $(this).attr("cityName");
	        		
	        		userObj.account = account;
	        		userObj.name = ( name ==undefined?'':name);
	        		userObj.organizationName = ( organizationName ==undefined?'':organizationName);
//	        		userObj.position =  ( position ==undefined?'':position);
	        		userObj.mobile = ( mobile ==undefined?'':mobile);
//	        		userObj.teamCode=( teamCode==undefined?'':teamCode);
	        		userObj.email=( email==undefined?'':email);
//	        		userObj.remark = ( remark ==undefined?'':remark);
	        		userObj.landLine = (landLine ==undefined?'':landLine);
	        		userObj.cityName = (cityName ==undefined?'':cityName);
	        		
	        		session.set("tel_peo", JSON.stringify(userObj));
	        		
	        		session.set("pagefrom_peo_detail","contacts_favorite_page");
	        		
	        		//返回该页面时返回选择的项
        			var scrollMapJSON = {};
        			scrollMapJSON.account = account;
        			scrollMap.contacts_favorite_page = JSON.stringify(scrollMapJSON);
        			
	        		goto_page("contacts_peo_detail_page");
	        	});
	        	
	        	contacts_favorite_page.find("._search").live("tap",function(){
	        		var page = $('#contacts_favorite_page');
	        		//获取输入内容
	        		var searchValue = page.find(".searchBox input").val();
	        		if($.trim(searchValue)==""){
	        			return;
	        		}
	        		
	        		//设置 搜索页面 来源
	        		session.set("pagefrom","contacts_favorite_page");
	        		//整个部门查询
//	        		session.set("sltfw",session.get("sltfw"));
	        		session.set("department",session.get("department"));
	        		session.set("telsearch",searchValue);
	        		goto_page("contacts_search_page");
	        	});
	        	
    	    });	
            contacts_favorite_page.live('pageshow',function(e, ui){
            	
            	currentLoadActionName = "contacts_favorite_load_content"
            	
            	currentTemplatePage = "contacts_favorite_page";
            	
            	  //判断当前 页面 如果非当前页面 就返回
            	  if(!beforePageShowCheck($(this))){
            		  return;
            	  }
            	  
            	  load_tel_bookmark_content();
    	    });	
            
            function contacts_favorite_load_content(){
            	
            	
            }
            
            contacts_favorite_page.live('pagehide',function(e, ui){
    	    });	
/******************************tel_bookmark_page---end**************************************/

            function load_tel_bookmark_content(){
            	var page = $('#contacts_favorite_page');
            	var userCode = session.get("userCode");
            	var userId = session.get("userId");
            	//用于页面回显
    	 	     showLoading();
    	 	     var authData = {};
    	 	     authData.userCode = userCode;
    	 	     authData.userId = userId;
    	 	     authData.random = Math.random();
    	 	     //清空搜索框与内容
    	 	     page.find(".searchBox").find("input:first").val("");
    	 	     page.find(".linkManList").empty();
    	 	    $.getJSON(contextPath+"/addressbook/showUserAddressBookList.xhtml"+callback, authData,function(msg){
    	 	    	
    	 	    	if($.trim(msg.returnCode) == '0'){
    	 	    		showHide();
    	 	    			var html = '';
    	 	    			html += digui_peo(msg.data);
    	 	    			page.find(".linkManList").html(html);
    	 	    			
    	 	    			var fromPage = session.get("fromPage");
    	 	    			var contacts_peo_detail_faved_flag = session.get("contacts_peo_detail_faved_flag")  //1：删除收藏flag
    	 	            	session.remove("contacts_peo_detail_faved_flag"); 
    	 	    			if(fromPage == "contacts_peo_detail_page" && contacts_peo_detail_faved_flag != 1){
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
    	 	          			var scrollCurrentElement = $('#contacts_favorite_page').find('.tit[id='+account+']').get(0);
    	 	          			contacts_favorite_myScroll.refresh();//刷新iScroll
    	 	          			contacts_favorite_myScroll.scrollToElement(scrollCurrentElement,0);
    	 	            	  }
    	 	    	}else{
    	 	    		showHide();
    	 	    		errorHandler(msg.returnCode,msg.message);
    	 	    	}
    	 	    });
            }
            
	 	    
	 	    //递归信息
	 	    function digui_peo(data,radio,optionclass,sltuseridmap){
	 	    	var html = '';
    			 for(var i=0;i<data.length;i++){
 	    				var dataresult = data[i];
 	    				
 	    				var id = dataresult.ID;
 	    				var account = dataresult.Code;
 	    				var email =dataresult.Email;
 	    				var u_name = dataresult.Name;
 	    				var organizationName = dataresult.Department;
// 	    				var organizationCode = dataresult.Department_Code;
// 	    				var position = dataresult.Position_Name;
 	    				var mobile = dataresult.Mobile;
// 	    				var teamCode =dataresult.TEAM_NAME;
// 	    			    var remark =dataresult.remark;
 	    				var landLine = dataresult.Landline;
 	    				var cityName = dataresult.City_Name
 	    				
 	    				 id = (id == undefined ? "":id);
 	    				 account = (account== undefined ? "":account);
 	    				 email = (email==undefined?"":email);
 	    				 u_name = (u_name == undefined ? "":u_name);
 	    				 organizationName = (organizationName == undefined ? "":organizationName);
// 	    				 position = (position == undefined? "":position);
 	    				 mobile = (mobile == undefined? "":mobile);
// 	    				 teamCode=(teamCode==undefined?"":teamCode);
// 	    				 remark=(remark==undefined?"":reamrk);
 	    				 landLine = (landLine == undefined ? "":landLine);
 	    				 cityName = (cityName == undefined ? "":cityName);
 	    				 
// 	    		    	 html  += "<li><dl class='tit' code='"+dataresult.Code+"'  position='"+dataresult.Position_Name+"'  id='"+dataresult.ID+"' mobile='"+mobile+"' organizationName='"+dataresult.organizationname+"'  u_name = '"+dataresult.Name+"' email='"+email+"'  teamCode='"+teamCode+"' remark='"+dataresult.remark+"'>"+
 	    		    	 html  += "<li><dl class='tit' code='"+dataresult.Code+"' id='"+dataresult.ID+"' mobile='"+mobile+"' landLine='"+landLine+"' organizationName='"+organizationName+"'  u_name = '"+u_name+"' email='"+email+"' cityName='"+cityName+"'>"+
//		 	    		    	 		 "<dt><img src='images/tfsred/uName.png'></dt>" +
	     		    	   		         "<dd><h4>"+u_name+"</h4>" +
	     		    	   				 "<span>"+mobile+"</span>" +
	     		    	   				 "</dd></dl></li>";
 	    			 }
    			return html;
	 	    }