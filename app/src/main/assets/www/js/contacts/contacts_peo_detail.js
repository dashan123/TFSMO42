var contacts_peo_detail_page = $('#contacts_peo_detail_page');
            var portal_myScroll;
/******************************tel_peo_detail_page---begin**************************************/	   
            contacts_peo_detail_page.live('pageinit',function(e, ui){
	        	var wrapper = "approval_wrapper";
	        	//portal_myScroll = createMyScroll(wrapper);

	        	contacts_peo_detail_page.find(".BackBtn").live("fastClick",function(event){
//	        		var pagefrom = session.get("pagefrom_peo_detail");
//	        		goto_page(pagefrom);
	        		event.stopPropagation();
	        		back_page();
	        	});
	        	
	        	//收藏
	        	contacts_peo_detail_page.find(".fav").live("tap",function(){
	        		var $this = $(this);
	        		var account = $this.attr("account");
	        		if($this.attr("class").indexOf("faved")!= -1){
	        			del_book_mark(account,$this);
	        		}else{
	        			add_book_mark(account,$this);
	        		}
	        	});
	        	
	        	contacts_peo_detail_page.find(".dotel").live("tap",function(){
	        		window.open($(this).attr("href"));
	        	});
	        	
    	    });	
            contacts_peo_detail_page.live('pageshow',function(e, ui){
            	
            	currentLoadActionName = "contacts_peo_detail_load_content"
            	
            	currentTemplatePage = "contacts_peo_detail_page";
            	
            	tel_peo_detail_content();
    	    });	
            
            function contacts_peo_detail_load_content(){
            	
            	
            }
            
            contacts_peo_detail_page.live('pagehide',function(e, ui){
    	    });	
/******************************tel_peo_detail_page---end**************************************/
            
            function add_book_mark(account,obj){
            	 var userCode = session.get("userCode");
            	 var userId = session.get("userId");
            	 var userName = session.get("userName");
            	 
	   	 	     var authData = {};
	   	 	     authData.userCode = userCode;
	   	 	     authData.userId = userId;
	   	 	     authData.userName = userName;
	   	 	     authData.bookmarkuserid = account;
	   	 	     authData.random = Math.random();
	   	 	     
	   	 	    $.getJSON(contextPath+"/addressbook/addUserAddressBookList.xhtml"+callback, authData,function(msg){
	   	 	    	if($.trim(msg.returnCode) == '0'){
	   	 	    		obj.addClass("faved");	
	   	 	    	}else{
	   	 	    		errorHandler(msg.returnCode,msg.message);
	   	 	    	}
	   	 	    });
            }
            
            function del_book_mark(account,obj){
            	 var userCode = session.get("userCode");
            	 var userId = session.get("userId");
            	 
	   	 	     var authData = {};
	   	 	     authData.userCode = userCode;
	   	 	     authData.userId = userId;
	   	 	     authData.bookmarkuserid = account;
	   	 	     authData.random = Math.random();
	   	 	     
	   	 	    $.getJSON(contextPath+"/addressbook/delUserAddressBookList.xhtml"+callback, authData,function(msg){
	   	 	    	if($.trim(msg.returnCode) == '0'){
	   	 	    		obj.removeClass("faved");
	   	 	    		session.set("contacts_peo_detail_faved_flag",1); //1：删除收藏
	   	 	    	}else{
	   	 	    		errorHandler(msg.returnCode,msg.message);
	   	 	    	}
	   	 	    });
           }
            
            
            function tel_peo_detail_content(){
            	var userCode = session.get("userCode");
            	var userId = session.get("userId");
            	
	   	 	    var authData = {};
	   	 	    authData.userCode = userCode;
	   	 	    authData.userId = userId;
	   	 	    
            	var page = $('#contacts_peo_detail_page');
            	page.find(".fav").removeClass("faved");
            	var userObj = session.get("tel_peo");
            	userObj = eval("("+userObj+")");
//            	console.log(userObj);
            	page.find(".fav").attr("account",userObj.account);
            	
            	authData.linkman = userObj.account;
            	
            	page.find(".basicInfo").empty();
            	$.getJSON(contextPath+"/addressbook/selectUserFavoriteStatus.xhtml"+callback, authData,function(msg){
            		if($.trim(msg.returnCode) == '0'){
            	  		if(msg.data.length>0){
//            			    	$.each(msg.data,function(i,n){
//            			    		if(n.linkman==userObj.account){
            			            		page.find(".fav").addClass("faved");
//            			    		}else{
//            			    		}
//            			    	});
            			    }else{
            			    }
            		}
            	});
            	var html = '';
//            	html+='<li>分区：'+userObj.teamCode+'</li>'
            	html+='<li>城市：'+userObj.cityName+'</li>'
            	html+='<li>姓名：'+userObj.name+'</li>'
            	html+='<li>电话：<span identity = "telphone">'+(userObj.mobile==undefined?"":$.trim(userObj.mobile))+'</span></li>'
            	html+='<li>座机：<span identity = "landLine">'+(userObj.landLine==undefined?"":$.trim(userObj.landLine))+'</span></li>'
            	html+='<li>邮箱：<span identity = "emailAddress">'+(userObj.email==undefined?"":$.trim(userObj.email))+'</li>'
            	page.find(".basicInfo").html(html);
            	
            	page.find(".basicInfo span[identity='telphone']").live("tap",function(){
                    
                    callPhone((userObj.mobile==undefined?"":$.trim(userObj.mobile)));
                    
                    });
            	page.find(".basicInfo span[identity='landLine']").live("tap",function(){
                    
                    callPhone((userObj.landLine==undefined?"":$.trim(userObj.landLine)));
                    
                    });
                page.find(".basicInfo span[identity='emailAddress']").live("tap",function(){
                                                                       
                    openMail((userObj.email==undefined?"":$.trim(userObj.email)));
                                                                       
                    });
            }