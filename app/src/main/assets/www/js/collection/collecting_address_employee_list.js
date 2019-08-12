/*********************************************************login init begin*****************************************************************/	
var collecting_address_employee_list_page = $('#collecting_address_employee_list_page');
var collectingAddressEmployeeListSpace = {};
var collecting_address_employee_list_myScroll;
collectingAddressEmployeeListSpace.listTapHandler = function(e){

	session.set("employeeId",e.data.attr("userId"));
	
	//设置当前选项的index到session中
	var scrollCurrentElementIndex = 0;
	var scrollCurrentElementNum = e.data.attr("scrollCurrentElementNum");
	var scrollCurrentPage = e.data.attr("scrollCurrentPage");
	var pageDisplayCount = session.get("pageDisplayCount");
	var pageAddCount = session.get("pageAddCount");
	if(scrollCurrentPage <= 1){
		   	scrollCurrentElementIndex = parseInt(scrollCurrentElementNum)+1;
    }else{
    	scrollCurrentElementIndex = parseInt(pageDisplayCount)+((parseInt(scrollCurrentPage)-2)*parseInt(pageAddCount))+parseInt(scrollCurrentElementNum)+1;
    }
	var scrollMapJSON = {};
	scrollMapJSON.scrollCurrentElementIndex = scrollCurrentElementIndex;
	scrollMap.collecting_address_employee_list_page = JSON.stringify(scrollMapJSON);
	
	goto_page("collecting_address_list_view_page");
}
/******************************home_page---begin**************************************/	   
collecting_address_employee_list_page.live('pageinit',function(e, ui){
	var wrapper = "collecting_address_employee_list_wrapper";
    var up = "collecting_address_employee_list_pullUp";
    var down = "collecting_address_employee_list_pullDown";
	collecting_address_employee_list_myScroll = createMyScroll(wrapper,up,down);
	
	//回退按钮事件
	collecting_address_employee_list_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page('workbench_page');
	});
	
	//获取分区弹层
	var $teamListTirebox = $("#team_list_tirebox");
	//弹层隐藏
	$teamListTirebox.hide();
	//点击分区显示列表弹层
	var $teamElement = $("#collecting_address_employee_list_page .topBar");
	$teamElement.live("tap",function(){

		$teamListTirebox.show();
		//下箭头变上箭头
		var $arrow = $(this).children("span:last");
		$arrow.removeClass("allBtn_down");
		$arrow.addClass("allBtn_up");
	});

	//取消 弹层选择
	$teamListTirebox.find(".Cancel").live("tap",function(){
		$teamListTirebox.hide();
	});

});


collecting_address_employee_list_page.live('pageshow',function(e, ui){
	
	currentLoadActionName = "collecting_address_employee_list_load_content";
	
	load_collecting_address_employee_list_content();
});

function collecting_address_employee_list_load_content(){
	
}
//加载详细，并显示
function load_collecting_address_employee_list_content(){

	var currentPage = $("#collecting_address_employee_list_page");
	
	var postData = {};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	var fromPage = session.get("fromPage");
	if(fromPage == "collecting_address_list_view_page"){
		var teamCode = session.get("teamCode");
		postData.teamCode = teamCode;
		
		// 获取当前页的index
		var scrollCurrentElementIndex = 0;
 	    var scrollNowPage = session.get("nowPage");
 	    if(!$.isEmptyObject(scrollMap)){
 	    	var commonScrollMapJsonObj = scrollMap[scrollNowPage];
 	    	if(commonScrollMapJsonObj != null && typeof(commonScrollMapJsonObj) != "undefined"){
 	    		commonScrollMapJsonObj = JSON.parse(commonScrollMapJsonObj);
 	 	 	    scrollCurrentElementIndex = commonScrollMapJsonObj.scrollCurrentElementIndex;
 	 	    	//删除Json数据中的scrollNowPage属性  
 	 	        delete scrollMap[scrollNowPage]; 
 	    	}
 	    }
		var scrollCurrentElement = $('#collecting_address_employee_list_page').find('.ListRow').get(scrollCurrentElementIndex);
		collecting_address_employee_list_myScroll.refresh();//刷新iScroll
		collecting_address_employee_list_myScroll.scrollToElement(scrollCurrentElement,0);
	}
	
	$.getJSON(basePath+"/app/collectingAddressEmployeeList/pageInit.xhtml"+callback, postData,function(msg){
		var $currentPage = $("#collecting_address_employee_list_page");
		
		//在催地址人员列表的初始化
		$currentPage.find(".personnelList").empty();
		var $template = $("#collecting_address_employee_list_page .list-row-template li");
		
		$.each(msg.data.employeeList,function(i,n){

			var $item = $template.clone(true);
			
			if(n.EMPLOYEE_STATUS == "实地中"){
				$item.children().css("color","brown");
		    }else if(n.EMPLOYEE_STATUS == "已登录"){
		    	//已登录
		    	$item.children().css("color","green");
		    }else if(n.EMPLOYEE_STATUS == "已签入"){
		    	//已签入
		    	$item.children().css("color","red");
		    }else if(n.EMPLOYEE_STATUS == "未登录"){ 
		    	//未登录
		    	$item.children().css("color","gray");
		    }
			
			$item.attr("userId",n["USER_ID"]);
			dataBindToElement($item,n);
			
			//用于返回该页面时计算选项的index
			$item.attr("scrollCurrentPage",1);
			$item.attr("scrollCurrentElementNum",i);
			
			//点击在催地址人员列表项，跳转到在催地址列表
			$item.bind("tap",$item,collectingAddressEmployeeListSpace.listTapHandler);
			$currentPage.find(".personnelList").append($item);
		});//end $.each
		
		//设置分区默认显示
		if(fromPage != "collecting_address_list_view_page"){
			var $team_condition = $currentPage.find("[identity='team']");
			$team_condition.text("全部");
			$team_condition.attr("code",'');
		}else{
			var teamCode = session.get("teamCode");
			var teamCodeName = session.get("teamCodeName");
			var $team_condition = $currentPage.find("[identity='team']");
			$team_condition.text(teamCodeName);
			$team_condition.attr("code",teamCode);
		}
		
		//初始化分区列表
		var $teamList = $("#team_list");
		$teamList.empty();
		var $teamListItem = $("<li code=''></li>");
		$teamListItem.text("全部");
		//点击弹层列表项进行选择
		$teamListItem.bind("tap",function(){
			
			var $team_condition = $currentPage.find("[identity='team']");
			var $priorCondition = $team_condition.text();
			$team_condition.text($(this).text());
			$team_condition.attr("code",$(this).attr("code"));
			
			$("#team_list_tirebox").hide();
			//上箭头变下箭头
			var $teamElement = $("#collecting_address_employee_list_page .topBar");
			var $arrow = $teamElement.children("span:last");
			$arrow.removeClass("allBtn_up");
			$arrow.addClass("allBtn_down");
			if($team_condition.text() != $priorCondition){
				//根据选择的TEAM查询数据
				query_collecting_address_employee_list_by_team($team_condition.attr("code"));
			}
				
		});
		$teamList.append($teamListItem);

		$.each(msg.data.teamList,function(i,n){
			var $teamListItem = $("<li code='"+n["code"]+"'></li>");
			$teamListItem.text(n["name"]);
			
			//点击弹层列表项进行选择
			$teamListItem.bind("tap",function(){
				
				var $team_condition = $currentPage.find("[identity='team']");
				var $priorCondition = $team_condition.text();
				$team_condition.text($(this).text());
				$team_condition.attr("code",$(this).attr("code"));
				$("#team_list_tirebox").hide();
				//下箭头变上箭头
				var $teamElement = $("#collecting_address_employee_list_page .topBar");
				var $arrow = $teamElement.children("span:last");
				$arrow.removeClass("allBtn_up");
				$arrow.addClass("allBtn_down");
				if($team_condition.text() != $priorCondition){
					query_collecting_address_employee_list_by_team($team_condition.attr("code"));
				}
					
			});
			
			$teamList.append($teamListItem);
		});//end $.each
		
		var teamCode = $currentPage.find("[identity='team']").attr("code");
		var teamCodeName = $currentPage.find("[identity='team']").text();
		session.set("teamCode",teamCode);
		session.set("teamCodeName",teamCodeName);
	
	});//end $.getJSON
};

function query_collecting_address_employee_list_by_team(teamCode)
{
	var $currentPage = $("#collecting_address_employee_list_page");
	var postData = {};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.teamCode = teamCode;
	
	session.set("teamCode",teamCode);
	var teamCodeName = $currentPage.find("[identity='team']").text();
	session.set("teamCodeName",teamCodeName);
	//根据选择的TEAM查询数据
	$.getJSON(basePath+"/app/collectingAddressEmployeeList/queryEmployeeList.xhtml"+callback, postData,function(msg){
		
			if($.trim(msg.returnCode) == '0'){
			
				if(msg.data.length<=0){
		    	     showHide();
//		    	     showMessage('暂无数据','1500');
		    	     return;
				}
				
				//在催地址人员列表的初始化
				$currentPage.find(".personnelList").empty();
				var $template = $("#collecting_address_employee_list_page .list-row-template li");
				
				
				$.each(msg.data.employeeList,function(i,n){

					var $item = $template.clone(true);
					
					if(n.EMPLOYEE_STATUS == "实地中"){
						$item.children().css("color","brown");
				    }else if(n.EMPLOYEE_STATUS == "已登录"){
				    	//已登录
				    	$item.children().css("color","green");
				    }else if(n.EMPLOYEE_STATUS == "已签入"){
				    	//已签入
				    	$item.children().css("color","red");
				    }else if(n.EMPLOYEE_STATUS == "未登录"){ 
				    	//未登录
				    	$item.children().css("color","gray");
				    }
					
					$item.attr("userId",n["USER_ID"]);
					//用于返回该页面时计算选项的index
					$item.attr("scrollCurrentPage",1);
					$item.attr("scrollCurrentElementNum",i);
					
					dataBindToElement($item,n);
					
					//点击在催地址人员列表项，跳转到在催地址列表
					$item.bind("tap",$item,collectingAddressEmployeeListSpace.listTapHandler);
					
					$currentPage.find(".personnelList").append($item);
				});//end $.each
			}//end if($.trim(msg.returnCode) == '0')

	});
}

