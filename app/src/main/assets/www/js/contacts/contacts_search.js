var contacts_search_page = $('#contacts_search_page');
			var tel_dept_myScroll;
/******************************tel_search_page---begin**************************************/	   
			contacts_search_page.live('pageinit',function(e, ui){
	        	var tel_dept_wrapper = "tel_search_wrapper";
	        	tel_dept_myScroll = createMyScroll(tel_dept_wrapper);
	        	
	        	$(contacts_search_page).find("._search").live("tap",function(){
	        		var page = $('#contacts_search_page');
	        		//获取输入内容
	        		var searchValue = page.find(".searchBox input").val();
	        		
	        		if($.trim(searchValue)==""){
	        			showMessage("不能为空！");
	        			return;
	        		}
	        		
	        		//失去焦点 查询数据/隐藏遮罩层
	              	//判断 页面来源 ;如果是通讯录搜藏页面
	              	if(session.get("pagefrom")=='contacts_favorite_page'){
	              		load_tel_bookmark_search_content();
	              	}else{
	              		load_tel_search_content();
	              	}
	        	});
	        	
	        	
	        	$(contacts_search_page).find(".BackBtn").live("tap",function(event){
//	        		var backPage = session.get("pagefrom");
//	        		goto_page(backPage);
	        		event.stopPropagation();
	        		back_page();
	        	});
	        	
	        	$(contacts_search_page).find(".tit").live("tap",function(){
	        		var userObj = {};
	        		var account = $(this).attr("id");
	        		var name = $(this).attr("u_name");
	        		var email = $(this).attr("email");
//	        		var teamCode = $(this).attr("teamCode");
	        		var organizationName = $(this).attr("organizationName");
//	        		var organizationid = $(this).attr("organizationid");
//	        		var position = $(this).attr("position");
//	        		var remark = $(this).attr("remark");
	        		var mobile = $(this).attr("mobile");
	        		var landLine = $(this).attr("landLine");
	    			var cityName = $(this).attr("cityName");
	        		
	        		userObj.account = account;
	        		userObj.name = (name ==undefined?'':name);
	        		userObj.email=( email ==undefined?'':email);
//	        		userObj.teamCode=( teamCode ==undefined?'':teamCode);
	        		userObj.organizationName = (organizationName ==undefined?'':organizationName);
//	        		userObj.organizationid = (organizationid ==undefined?'':organizationid);
//	        		userObj.position =  ( position ==undefined?'':position);
	        		userObj.mobile = (mobile ==undefined?'':mobile);
//	        		userObj.remark = (remark ==undefined?'':remark);
	        		userObj.landLine = (landLine ==undefined?'':landLine);
	        		userObj.cityName = (cityName ==undefined?'':cityName);
	        		
	        		session.set("tel_peo", JSON.stringify(userObj));
	        		
	        		session.set("pagefrom_peo_detail","contacts_search_page");
	        		goto_page("contacts_peo_detail_page");
	        	});
	        	
    	    });	
			contacts_search_page.live('pageshow',function(e, ui){
				
				currentLoadActionName = "contacts_search_load_content"
				
            	currentTemplatePage = "contacts_search_page";
            	
          	  //判断当前 页面 如果非当前页面 就返回
          	  if(!beforePageShowCheck($(this))){
          		  return;
          	  }
          	
          	//来源页面搜索值
          	var telsearch = session.get("telsearch");
          	
          	$(this).find(".searchBox input").val(telsearch);
          	
          	
          	//判断 页面来源 ;如果是通讯录搜藏页面
          	if(session.get("pagefrom")=='contacts_favorite_page'){
          		load_tel_bookmark_search_content();
          	}else{
          		load_tel_search_content();
          	}
          	
    	    });	
			
			function contacts_search_load_content(){
				
			}
            
			contacts_search_page.live('pagehide',function(e, ui){
    	    });	
/******************************tel_search_page---end**************************************/
            
            function load_tel_search_content(){
            	
            	var page = $('#contacts_search_page');
            	var userCode = session.get("userCode");
//            	var sltfw = session.get("sltfw");
            	var department = session.get("department");
            	var userId = session.get("userId");
            	
            	var searchValue = page.find(".searchBox input").val();
            	//用于页面回显
    	 	     showLoading();
    	 	     var authData = {};
    	 	     authData.userCode = userCode;
    	 	     //被选择的上级部门
    	 	     //  authData.sltfw = "1";
//    	 	     authData.organizationCode = sltfw;
    	 	     authData.department = department;
    	 	     authData.userId = userId;
    	 	     authData.userName = encodeURIComponent(searchValue);
    	 	     authData.random = Math.random();
    	 	     
    	 	     session.set("telsearch",searchValue);
    	 	     
    	 	     page.find(".linkManList").empty();
    	 	    $.getJSON(contextPath+"/addressbook/searchUserInfo.xhtml"+callback, authData,function(msg){
    	 	    	
    	 	    	if($.trim(msg.returnCode) == '0'){
    	 	    		showHide();
    	 	     		if(msg.data.length>0){
    	 	    			var html = '';
    	 	    			html += digui_peo(msg.data);
    	 	    			page.find(".linkManList").html(html);
	    	 	    	}
	   	 	    	}else{
//	   	 	    		showMessage("暂无数据");
		   	 	    	showHide();
		 	    		errorHandler(msg.returnCode,msg.message);
	   	 	    	}
    	 	    });
    	 	    
    	 	    //递归信息
    	 	    function digui_peo(data,radio,optionclass,sltuseridmap){
    	 	    	var html = '';
	    			 for(var i=0;i<data.length;i++){
	 	    				var dataresult = data[i];
	 	    				var u_name = dataresult.Name;
	 	    				var account = dataresult.Code;
	 	    				var id = dataresult.ID;
//	 	    				var organizationName = dataresult.organizationname;
//	 	    				var organizationId = dataresult.organizationid;
	 	    				var organizationName = dataresult.Department;
//	 	    				var organizationCode = dataresult.Department_Code;
//	 	    				var position = dataresult.Position_Name;
	 	    				var mobile = dataresult.Mobile;
//	 	    				var teamCode =dataresult.TEAM_NAME;
	 	    				var email =dataresult.Email;
//	 	    				var remark =dataresult.remark;
	 	    				var landLine = dataresult.Landline;
	 	    				var cityName = dataresult.City_Name
	 	    				
	 	    				 u_name = (u_name== undefined ? "":u_name);
	 	    				 account = (account== undefined ? "":account);
	 	    				 organizationName = (organizationName == undefined ? "":organizationName);
//	 	    				 position = (position == undefined ? "":position);
	 	    				 mobile = (mobile == undefined ? "":mobile);
//	 	    				 teamCode=(teamCode==undefined ?"":teamCode);
	 	    				 email = (email==undefined ?"":email);
//	 	    				 remark=(remark==undefined?"":remark);
	 	    				 landLine = (landLine == undefined ? "":landLine);
	 	    				 cityName = (cityName == undefined ? "":cityName);
	 	    				 
//	 	    		    	 html  += "<li><dl class='tit' code='"+account+"' organizationCode='"+organizationCode+"'  id='"+id+"'  landLine='"+landLine+"' mobile='"+mobile+"' organizationName='"+organizationName+"'  u_name = '"+u_name+"' email='"+email+"' cityName='"+cityName+"'>"+
	 	    		    	 html  += "<li><dl class='tit' code='"+account+"'  id='"+id+"'  landLine='"+landLine+"' mobile='"+mobile+"' organizationName='"+organizationName+"'  u_name = '"+u_name+"' email='"+email+"' cityName='"+cityName+"'>"+
//	    		    	 		 "<dt><img src='images/tfsred/uName.png'></dt>" +
		    	   		         "<dd><h4>"+u_name+"</h4>" +
		    	   				 "<span>"+mobile+"</span>" +
		    	   				 "</dd></dl></li>";
	 	    				
	 	    			 }
	    			return html;
    	 	    }
            }
            
            function load_tel_bookmark_search_content(){
            	
            	var page = $('#contacts_search_page');
            	var userCode = session.get("userCode");
            	var userId = session.get("userId");
            	
            	var searchValue = page.find(".searchBox input").val();
            	//用于页面回显
    	 	     showLoading();
    	 	     var authData = {};
    	 	     authData.userCode = userCode;
    	 	     authData.userId = userId;
    	 	     authData.userName = encodeURIComponent(searchValue);
    	 	     authData.random = Math.random();
    	 	     page.find(".linkManList").empty();
    	 	    $.getJSON(contextPath+"/addressbook/searchBookMarkUserInfo.xhtml"+callback, authData,function(msg){
    	 	    	
    	 	    	if($.trim(msg.returnCode) == '0'){
    	 	    		showHide();
	 	    			var html = '';
	 	    			html += digui_peo(msg.data);
	 	    			page.find(".linkManList").html(html);
    	 	    	}else{
    	 	    		showHide();
    	 	    		errorHandler(msg.returnCode,msg.message);
    	 	    	}
//    	 	    	if($.trim(msg.data==null)){
//   	 	    		 showMessage("暂无数据");
//   	 	    	   }
    	 	    });
    	 	    
    	 	    //递归信息
    	 	    function digui_peo(data,radio,optionclass,sltuseridmap){
    	 	    	var html = '';
	    			 for(var i=0;i<data.length;i++){
	 	    				var dataresult = data[i];
	 	    				var u_name = dataresult.Name;
	 	    				var account = dataresult.Code;
	 	    				var id = dataresult.ID;
//	 	    				var organizationName = dataresult.organizationname;
//	 	    				var organizationId = dataresult.organizationid;
	 	    				var organizationName = dataresult.Department;
//	 	    				var organizationCode = dataresult.Department_Code;
//	 	    				var position = dataresult.Position_Name;
	 	    				var mobile = dataresult.Mobile;
//	 	    				var teamCode =dataresult.TEAM_NAME;
	 	    				var email =dataresult.Email;
	 	    				var landLine = dataresult.Landline;
	 	    				var cityName = dataresult.City_Name
	 	    				
	 	    				 u_name = (u_name == undefined ? "":u_name);
	 	    				 account = (account == undefined ? "":account);
	 	    				 organizationName = (organizationName== undefined ? "":organizationName);
//	 	    				 position = (position == undefined ? "":position);
	 	    				 mobile = (mobile == undefined ? "":mobile);
//	 	    				 teamCode=(teamCode==undefined?"":teamCode);
	 	    				 email = (email==undefined?"":email);
	 	    				 landLine = (landLine == undefined ? "":landLine);
	 	    				 cityName = (cityName == undefined ? "":cityName);
	 	    				 
//	 	    		    	 html  += "<li><dl class='tit' code='"+dataresult.Code+"' organizationCode='"+organizationCode+"' landLine='"+landLine+"' mobile='"+mobile+"' organizationName='"+dataresult.organizationname+"'  u_name = '"+dataresult.Name+"' email='"+email+"'  cityName='"+cityName+"'>"+
	 	    		    	 html  += "<li><dl class='tit' code='"+dataresult.Code+"' landLine='"+landLine+"' mobile='"+mobile+"' organizationName='"+dataresult.organizationname+"'  u_name = '"+dataresult.Name+"' email='"+email+"'  cityName='"+cityName+"'>"+
	    		    	 		 "<dt><img src='images/tfsred/uName.png'>" +
		    	   		         "</dt><dd><h4>"+u_name+"</h4>" +
		    	   				 "<span>"+mobile+"</span>" +
		    	   				 "</dd></dl></li>";
	 	    			    }
	    			return html;
    	 	    }
            }