var sale_dealer_list_page = $('#sale_dealer_list_page');

var sale_dealer_list_myScroll;
/******************************home_page---begin**************************************/
sale_dealer_list_page.live('pageinit',function(e,ui){
	
	var wrapper = "sale_dealer_list_wrapper";
	var up = "sale_dealer_list_pullUp";
	var down = "sale_dealer_list_pullDown";
	sale_dealer_list_myScroll = createMyScroll(wrapper,up,down);
//	//scroll位置
//	var scrollMapJSON = {};
//	scrollMapJSON.organizationid = organizationid;
//	scrollMap.contacts_dept_page = JSON.stringify(scrollMapJSON);
	//回退事件处理
	sale_dealer_list_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page('workbench_page');
	});
	
	//搜索按钮-->查询经销商列表
	sale_dealer_list_page.find(".queryButton").live('tap',function(){
		
		saleDealerListPage_queryDealerList();
		
	});

});//end pageinit


sale_dealer_list_page.live('pageshow',function(e, ui){

	currentLoadActionName  = "sale_dealer_list_load_content";

	load_sale_dealer_list_content();
	
	//当页面从XX查看页面返回时，不需刷新
	var fromPage = session.get("fromPage");
	if(fromPage != "fi_task_report_add_page" 
			&& fromPage != "fi_custom_task_details_view_page" ){
		
	}
	else{
		
		
		// 获取当前页的index
//		var scrollCurrentElementIndex = 0;
// 	    var scrollNowPage = session.get("nowPage");
// 	    if(!$.isEmptyObject(scrollMap)){
// 	    	var commonScrollMapJsonObj = scrollMap[scrollNowPage];
// 	    	if(commonScrollMapJsonObj != null && typeof(commonScrollMapJsonObj) != "undefined"){
// 	    		commonScrollMapJsonObj = JSON.parse(commonScrollMapJsonObj);
// 	 	 	    scrollCurrentElementIndex = commonScrollMapJsonObj.scrollCurrentElementIndex;
// 	 	 	    //删除Json数据中的scrollNowPage属性  
// 	 	 	    delete scrollMap[scrollNowPage]; 
// 	    	}
// 	    }
//		var scrollCurrentElement = $('#sale_dealer_list_page').find('#sale_dealer_list_list').get(scrollCurrentElementIndex);
//		sale_dealer_list_myScroll.refresh();//刷新iScroll
//		sale_dealer_list_myScroll.scrollToElement(scrollCurrentElement,0);
	}
});//end pageshow

function sale_dealer_list_load_content(){
	//下拉不刷新，则该方法置空
}

//加载页面初始化数据，并显示
function load_sale_dealer_list_content(){
	
	saleDealerListPage_queryDealerList();

}

//查询经销商列表
function saleDealerListPage_queryDealerList(){
	
	$('#saleDealerListPage_dealerList').empty();
	showLoading();
	var postData ={};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	postData.dealerName = $('#saleDealerListPage-dealerName').val();

	$.getJSON(basePath+"/app/saleDealerList/queryDealerList.xhtml"+callback, postData,function(msg){
		
		if($.trim(msg.returnCode) == '0') {
			showHide();
			if(msg.data){
				
				var data = msg.data;
				saleDealerListPage_bindDataToPage(data);

			}//end if(msg.data){
		}
		else{
			errorHandler(msg.returnCode,msg.message);
		}
		
	});//end $.getJSON
}

function saleDealerListPage_bindDataToPage(data){
	
	var $currentPage = $("#sale_dealer_list_page");
	
	var $templateDealerListItem = $('#sale_dealer_list_page').find("[template-id='dealerListItem']");
	$.each(data.dealerList,function(i,n){
		var $dealerListItem = $templateDealerListItem.clone(true);
		
		dataBindToElement($dealerListItem,n);
		
		$dealerListItem.find("dd").bind("tap",function(event){

			var dealerId = $(this).find("[identity='id']").text();
			var code = $(this).find("[identity='code']").text();
			
			session.set("dealerCode",code);
			goto_page("sale_dealer_edit_page");
			
		});
		
		$dealerListItem.show();
		 $('#saleDealerListPage_dealerList').append($dealerListItem);
	});//end each
}