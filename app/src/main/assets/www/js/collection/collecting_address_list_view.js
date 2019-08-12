var collecting_address_list_view_page = $('#collecting_address_list_view_page');
var collecting_address_list_view_myScroll;
/******************************home_page---begin**************************************/	   
collecting_address_list_view_page.live('pageinit',function(e, ui){
	
	var wrapper = "collecting_address_list_view_wrapper";
    var up = "collecting_address_list_view_pullUp";
    var down = "collecting_address_list_view_pullDown";
	collecting_address_list_view_myScroll = createMyScroll(wrapper,up,down);
		
	//回退事件处理
	collecting_address_list_view_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page();
	});
	
//	//在催地址列表项目点击事件
//	collecting_address_list_view_page.find(".ListRow").live("tap",function(){
//		session.set("page_keyword","在催地址列表");
//		session.set("page_title","在催地址列表");
//		session.set("page_from","collecting_address_list_view_page");
//		
//		var collectingAddressID =  $(this).find("a[identity='collect-button']").attr("collectingAddressID");
//		session.set("collectingAddressID",collectingAddressID);
//		
////		goto_page("collecting_address_details_page");
//	});
	
});
/******************************home_page---end**************************************/
collecting_address_list_view_page.live('pageshow',function(e, ui){
	
	currentLoadActionName = "collecting_address_list_view_load_content";
    
	  load_collecting_address_list_view_content();
});

function collecting_address_list_view_load_content(){
	
}

	//加载在催地址列表View，并显示
	function load_collecting_address_list_view_content(){
		
		var $collecting_address_list = $("#collecting_address_list_view_page .List");
		$collecting_address_list.empty();
		
		showLoading();
		
		var authData = {};
	    authData.random = Math.random();
	    authData.userId = session.get("userId");
	    authData.userCode = session.get("userCode");
	    authData.employeeId = session.get("employeeId");
	    
		$.getJSON(basePath+"/app/collectingAddressListView/pageInit.xhtml"+callback, authData,function(msg){
			if($.trim(msg.returnCode) == '0'){
				if(msg.data.length<=0){
		    	     showHide();
//               	 showMessage('暂无数据','1500');
               	 return;
        	  }
				
				//在催地址列表的初始化
				var $template = $("#collecting_address_list_view_page .list-row-template");
				
				$.each(msg.data,function(i,n){
	
					var $collectingAddressItem = $template.clone(true);
					dataBindToElement($collectingAddressItem,n);
	//					$collectingAddressItem.find("[identity='contractNumber']").text(n["contractNumber"]);
	//					$collectingAddressItem.find("[identity='customerName']").text(n["customerName"]);
	//					$collectingAddressItem.find("[identity='address']").text(n["address"]);
	//					$collectingAddressItem.find("[identity='addressType']").text(n["addressType"]);
	//					$collectingAddressItem.find("[identity='licenseplateNumber']").text(n["licenseplateNumber"]);
	//					$collectingAddressItem.find("[identity='payoutStatus']").text(n["payoutStatus"]);
	//					$collectingAddressItem.find("[identity='overdueDays']").text(n["overdueDays"]);
	//
	               var address = $collectingAddressItem.find("[identity='address']").text();
	               $collectingAddressItem.find("[identity='address']").bind("tap",function(){
	            	   callNavi(address);
	                })
	
					$collectingAddressItem.removeClass("list-row-template");
					$collectingAddressItem.show();
	                   
					$collecting_address_list.append($collectingAddressItem);
				});//end $.each
			
				showHide();
			}
			else{
	            	showHide();
	            	errorHandler(msg.returnCode,msg.message);
	            }

			session.remove("employeeId");
			
		});//end $.getJSON
		
	}