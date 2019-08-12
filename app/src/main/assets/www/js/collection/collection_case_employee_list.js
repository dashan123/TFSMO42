/*********************************************************login init begin*****************************************************************/	
var collection_case_employee_list_page = $('#collection_case_employee_list_page');
var collection_case_employee_list_myScroll;
var collectionCaseEmployeeListSpace = {};
collectionCaseEmployeeListSpace.listTapHandler = function(e){

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
	scrollMap.collection_case_employee_list_page = JSON.stringify(scrollMapJSON);
	
	goto_page("todo_case_list_view_page");
}
/******************************home_page---begin**************************************/	   
collection_case_employee_list_page.live('pageinit',function(e, ui){
	
	var wrapper = "collection_case_employee_list_wrapper";
    var up = "collection_case_employee_list_pullUp";
    var down = "collection_case_employee_list_pullDown";
	collection_case_employee_list_myScroll = createMyScroll(wrapper,up,down);
	
	
	//回退按钮事件
	collection_case_employee_list_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		goto_page("workbench_page");
	});
	
	//获取分区弹层
	var $teamListTirebox = $("#collection_case_employee_all_tirebox");
	
	//弹层隐藏
	$teamListTirebox.hide();
	
	//点击分区显示列表弹层
	var $teamElement = $("#collection_case_employee_list_page .topBar");
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


collection_case_employee_list_page.live('pageshow',function(e, ui){
	
	currentLoadActionName = "collection_case_employee_list_load_content";
	var fromPage = session.get("fromPage");
	if(fromPage != "todo_case_list_view_page"){
		load_collection_case_employee_list_content();
	}else{
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
		var scrollCurrentElement = $('#collection_case_employee_list_page').find('.ListRow').get(scrollCurrentElementIndex);
		collection_case_employee_list_myScroll.refresh();//刷新iScroll
		collection_case_employee_list_myScroll.scrollToElement(scrollCurrentElement,0);
	}
	
});

function collection_case_employee_list_load_content(){
	
}
//加载详细，并显示
function load_collection_case_employee_list_content(){

	var currentPage = $("#collection_case_employee_list_page");

	var postData = {};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	var fromPage = session.get("fromPage");
	if(fromPage == "todo_case_list_view_page"){
		var teamCode = session.get("teamCode");
		postData.teamCode = teamCode;
	}
	$.getJSON(basePath+"/app/collectionCaseEmployeeList/pageInit.xhtml"+callback, postData,function(msg){
		var $currentPage = $("#collection_case_employee_list_page");
		
		//在催地址人员列表的初始化
		$currentPage.find(".personnelList").empty();
		var $template = $("#collection_case_employee_list_page .list-row-template li");
		//点击在催地址人员列表项，跳转到在催地址列表
		
		//近期未电话的近期标准显示
		var recentDaysJqwdh = msg.data.recentDaysJqwdh;
		if(recentDaysJqwdh){
			if(recentDaysJqwdh.length > 0){
				$template.find("[identity='RECENTLY_DAYS_JQWDH']").text(recentDaysJqwdh[0]["code"]+"日内");
			}
		}
		
		
		//近期未电话的近期标准显示
		var recentDaysJqwsd = msg.data.recentDaysJqwsd;
		if(recentDaysJqwsd){
			if(recentDaysJqwsd.length > 0){
				$template.find("[identity='RECENTLY_DAYS_JQWSD']").text(recentDaysJqwsd[0]["code"]+"日内");
			}
		}
		
		
//		element.find("[identity='"+property+"']").text(dataObject[property]);
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
			//待核销剩余本金 金额格式化
			n.WRITTING_OFF_SURPLUS_PRINCIPAL = fmoney(n.WRITTING_OFF_SURPLUS_PRINCIPAL,2)
			
			dataBindToElement($item,n);
			$item.bind("tap",$item,collectionCaseEmployeeListSpace.listTapHandler);
			$currentPage.find(".personnelList").append($item);
		});//end $.each
		
		//设置分区默认显示
		if(fromPage != "todo_case_list_view_page"){
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
		var $teamList = $("#collection_case_employee_all_list");
		$teamList.empty();
		var $teamListItem = $("<li code=''></li>");
		$teamListItem.text("全部");
		//点击弹层列表项进行选择
		$teamListItem.bind("tap",function(){
			
			var $team_condition = $currentPage.find("[identity='team']");
			var $priorCondition = $team_condition.text();
			$team_condition.text($(this).text());
			$team_condition.attr("code",$(this).attr("code"));
			
			$("#collection_case_employee_all_tirebox").hide();
			//上箭头变下箭头
			var $teamElement = $("#collection_case_employee_list_page .topBar");
			var $arrow = $teamElement.children("span:last");
			$arrow.removeClass("allBtn_up");
			$arrow.addClass("allBtn_down");
			if($team_condition.text() != $priorCondition){
				//根据选择的TEAM查询数据
				query_collection_case_employee_list_by_team($team_condition.attr("code"));
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
				$("#collection_case_employee_all_tirebox").hide();
				//下箭头变上箭头
				var $teamElement = $("#collection_case_employee_list_page .topBar");
				var $arrow = $teamElement.children("span:last");
				$arrow.removeClass("allBtn_up");
				$arrow.addClass("allBtn_down");
				if($team_condition.text() != $priorCondition){
					query_collection_case_employee_list_by_team($team_condition.attr("code"));
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

function query_collection_case_employee_list_by_team(teamCode)
{
	var $currentPage = $("#collection_case_employee_list_page");
	
	var postData = {};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.teamCode = teamCode;
	
	session.set("teamCode",teamCode);
	var teamCodeName = $currentPage.find("[identity='team']").text();
	session.set("teamCodeName",teamCodeName);
	//根据选择的TEAM查询数据
	$.getJSON(basePath+"/app/collectionCaseEmployeeList/queryEmployeeList.xhtml"+callback, postData,function(msg){
		
			if($.trim(msg.returnCode) == '0'){
			
				if(msg.data.length<=0){
		    	     showHide();
//		    	     showMessage('暂无数据','1500');
		    	     return;
				}
				
				//在催地址人员列表的初始化
				$currentPage.find(".personnelList").empty();
				var $template = $("#collection_case_employee_list_page .list-row-template li");
				
				
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
					//待核销剩余本金 金额千分位格式化
					n.WRITTING_OFF_SURPLUS_PRINCIPAL = fmoney(n.WRITTING_OFF_SURPLUS_PRINCIPAL,2)
					
					dataBindToElement($item,n);
					//点击可催案件人员列表项，跳转到可催案件列表
					$item.bind("tap",$item,collectionCaseEmployeeListSpace.listTapHandler);
					
					$currentPage.find(".personnelList").append($item);
				});//end $.each
			}//end if($.trim(msg.returnCode) == '0')

	});
}

