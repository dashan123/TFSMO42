var fi_todo_task_list_page = $('#fi_todo_task_list_page');

//var collectingAddressListPageHandler ={};

var fi_todo_task_list_myScroll;
/******************************home_page---begin**************************************/
fi_todo_task_list_page.live('pageinit',function(e,ui){
	
	var wrapper = "fi_todo_task_list_wrapper";
	var up = "fi_todo_task_list_pullUp";
	var down = "fi_todo_task_list_pullDown";
	fi_todo_task_list_myScroll = createMyScroll(wrapper,up,down);
//	//scroll位置
//	var scrollMapJSON = {};
//	scrollMapJSON.organizationid = organizationid;
//	scrollMap.contacts_dept_page = JSON.stringify(scrollMapJSON);
	//回退事件处理
	fi_todo_task_list_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page('workbench_page');
	});
	
	//添加任务按钮-->跳转到添加任务页面
	fi_todo_task_list_page.find(".addButton4").live('tap',function(){
		
		//跳转到自定义任务详情添加页面
		session.remove("taskId");
		goto_page("fi_custom_task_details_edit_page");
		
	});
	//搜索按钮-->查询待办任务列表
	fi_todo_task_list_page.find(".queryButton").live('tap',function(){
		
		fiTodoTaskListPage_queryTodoTaskList();
		
	});
	
	//选择日期范围
	var instance = mobiscroll.range('#fiTodoTaskListPage-dateRange', {
	    theme: 'red',
	    lang: 'zh',
	    display: 'bottom',        
//	    invalid: ['w0', 'w6'],
	    onCancel: function (event, inst) {
	    	inst.clear();
	    }
	});

});//end pageinit


fi_todo_task_list_page.live('pageshow',function(e, ui){

	currentLoadActionName  = "fi_todo_task_list_load_content";
//	$('#fiTodoTaskListPage-dateRange').val("");
//	// With selector
//	$('#fiTodoTaskListPage-dateRange').mobiscroll('setVal', [null, null]);
	load_fi_todo_task_list_content();
	//当页面从自定义任务详情查看页面返回时，不需刷新
	var fromPage = session.get("fromPage");
	if(fromPage != "fi_task_report_add_page" 
		&& fromPage != "fi_task_report_view_page" 
			&& fromPage != "fi_custom_task_details_view_page" ){
		
		
		
//		load_fi_todo_task_list_content();
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
//		var scrollCurrentElement = $('#fi_todo_task_list_page').find('#fi_todo_task_list_list').get(scrollCurrentElementIndex);
//		fi_todo_task_list_myScroll.refresh();//刷新iScroll
//		fi_todo_task_list_myScroll.scrollToElement(scrollCurrentElement,0);
	}
});//end pageshow

function fi_todo_task_list_load_content(){
	//下拉不刷新，则该方法置空
}
//加载页面初始化数据，并显示
function load_fi_todo_task_list_content(){
	$('#fi_todo_task_list').empty();
	showLoading();
	var postData ={};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	var dateRange = $('#fiTodoTaskListPage-dateRange').mobiscroll('getVal');
	if(dateRange){
		if(dateRange[0] != null && dateRange[1] != null){
			postData.startDate = Format(dateRange[0],"yyyy-MM-dd");
			postData.endDate = Format(dateRange[1],"yyyy-MM-dd");
		}
	}
	$.getJSON(basePath+"/app/fiTodoTaskList/pageInit.xhtml"+callback, postData,function(msg){
		
		if($.trim(msg.returnCode) == '0') {
			showHide();
			if(msg.data){
				
				var data = msg.data;
				
				//初始化日程类型列表
				var $taskTypes = $("#fiTodoTaskListPage-taskType");
				$taskTypes.empty();
				$.each(data.taskTypes,function(i,n){
					
					var templateItem = '<option value="'+n.code+'">'+n.name+'</option>';
					$taskTypes.append(templateItem);
				});
				$("#fiTodoTaskListPage-taskType").mobiscroll().select({
				        theme: 'red',
				        lang: 'zh',
				        display: 'bottom',
				        minWidth: 200
				    });
				
				fiTodoTaskListPage_bindDataToPage(data);
				
			}//end if(msg.data){
		}
		else{
			errorHandler(msg.returnCode,msg.message);
		}
		
	});//end $.getJSON
	
}

//查询待办任务列表
function fiTodoTaskListPage_queryTodoTaskList(){
	
	$('#fi_todo_task_list').empty();
	showLoading();
	var postData ={};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	postData.taskType = $("#fiTodoTaskListPage-taskType").val();
	var dateRange = $('#fiTodoTaskListPage-dateRange').mobiscroll('getVal');
	if(dateRange){
		if(dateRange[0] != null && dateRange[1] != null){
			postData.startDate = Format(dateRange[0],"yyyy-MM-dd");
			postData.endDate = Format(dateRange[1],"yyyy-MM-dd");
		}
	}

	$.getJSON(basePath+"/app/fiTodoTaskList/queryTodoTasks.xhtml"+callback, postData,function(msg){
		
		if($.trim(msg.returnCode) == '0') {
			showHide();
			if(msg.data){
				
				var data = msg.data;
				fiTodoTaskListPage_bindDataToPage(data);

			}//end if(msg.data){
		}
		else{
			errorHandler(msg.returnCode,msg.message);
		}
		
	});//end $.getJSON
}

function fiTodoTaskListPage_bindDataToPage(data){
	
	//显示待办任务数量
	var $currentPage = $("#fi_todo_task_list_page");
	$currentPage.find("[identity='todoTasksCount']").text(data.todoTasksCount);
	
	//待办任务列表初始化
	
	var $templateTodoTaskListItem = $('#fi_todo_task_list_page').find("[template-id='todoTaskListItem']");
	$.each(data.todoTasks,function(i,n){
		var $todoTaskListItem = $templateTodoTaskListItem.clone(true);
		
		dataBindToElement($todoTaskListItem,n);
		
		if(n.taskType == "FI"){
			$todoTaskListItem.find("[role='forFI']").show();
		}
		else{
			$todoTaskListItem.find("[role='forFI']").hide();
		}
		
		$todoTaskListItem.find("dd").bind("tap",function(event){

			var taskId = $(this).find("[identity='taskId']").text();
			var taskType = $(this).find("[identity='taskType']").text();
			var customerType = $(this).find("[identity='customerType']").text();
			session.set("taskId",taskId);
			
			if(taskType === "FI"){
				if(customerType === "QY"){
					//跳转至 企业贷款家访任务详情编辑页面
					goto_page("fi_task_details_edit_for_e_page");
				}
				else{
					//跳转至 家访任务详情编辑页面
					goto_page("fi_task_details_edit_page");
				}
			}
			else{
				//跳转至 家访任务详情编辑页面
				goto_page("fi_custom_task_details_edit_page");
			}
		});
		
		$todoTaskListItem.show();
		 $('#fi_todo_task_list').append($todoTaskListItem);
	});//end each
}