var fi_done_task_list_page = $('#fi_done_task_list_page');

//var collectingAddressListPageHandler ={};

var fi_done_task_list_myScroll;
/******************************home_page---begin**************************************/
fi_done_task_list_page.live('pageinit',function(e,ui){
	
	var wrapper = "fi_done_task_list_wrapper";
	var up = "fi_done_task_list_pullUp";
	var down = "fi_done_task_list_pullDown";
	fi_done_task_list_myScroll = createMyScroll(wrapper,up,down);

	//回退事件处理
	fi_done_task_list_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		
		//初始化分页
		currentPage = 1;
		hasData = true;
		
		back_page('workbench_page');
	});
	
	//初始化任务类型列表
	fiDoneTaskListPage_queryTaskTypes();

	//搜索按钮-->查询已办任务列表
	fi_done_task_list_page.find(".queryButton").live('tap',function(){
		
		//初始化分页
		currentPage = 1;
		hasData = true;
		var $fiDoneTaskList = $('#fi_done_task_list');
		$fiDoneTaskList.empty();

		load_fi_done_task_list_content();
	});
	
	//初始化完成状态列表
	$("#fiDoneTaskListPage-finishStatus").mobiscroll().select({
        theme: 'red',
        lang: 'zh',
        display: 'bottom',
        minWidth: 200
    });

	//选择日期范围
 	var beginDate = new Date();//获取当前时间  
 	beginDate.setDate(1);
 	var defaultBeginDate = new Date(beginDate.getFullYear(), beginDate.getMonth(), beginDate.getDate());
 	var nowDate = new Date();//获取当前时间  
 	var defaultEndDate = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
	var instance = mobiscroll.range('#fiDoneTaskListPage-dateRange', {
	    theme: 'red',
	    lang: 'zh',
	    display: 'bottom',
	    defaultValue: [defaultBeginDate, defaultEndDate]
	});
	var defaultBeginDateStr = Format(defaultBeginDate,"yyyy/MM/dd");
	var defaultEndDateStr = Format(defaultEndDate,"yyyy/MM/dd");
	$("#fiDoneTaskListPage-dateRange").val(defaultBeginDateStr+" - "+defaultEndDateStr);
	instance.setVal([defaultBeginDate, defaultEndDate]);
});//end pageinit

fi_done_task_list_page.live('pageshow',function(e, ui){

	currentLoadActionName = "fi_done_task_list_load_content";
	//判断当前 页面 如果非当前页面 就返回
	if(!beforePageShowCheck($(this))){
		return;
	}
	currentTemplatePage = "fi_done_task_list_page";
  
	var fromPage = session.get("fromPage");
	
	//如果不是从详情页面进入，则重新加载数据
	if (fromPage != "fi_task_details_view_page" && fromPage != "fi_custom_task_details_view_page") {
		//初始化分页
		currentPage = 1;
		hasData = true;
		var $fiDoneTaskList = $('#fi_done_task_list');
		$fiDoneTaskList.empty();
		load_fi_done_task_list_content();
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
		var scrollCurrentElement = $('#fi_done_task_list').get(scrollCurrentElementIndex);
		fi_done_task_list_myScroll.refresh();//刷新iScroll
		fi_done_task_list_myScroll.scrollToElement(scrollCurrentElement,0);
	}
	
});//end pageshow

function fi_done_task_list_load_content(){
	var page = $('#fi_done_task_list_page');
	if (hasData) {
		//如果还有数据则加载
		load_fi_done_task_list_content();
	}
}

//查询已办任务列表
function load_fi_done_task_list_content(){
	
	showLoading();
	var postData ={};
	postData.random = new Date();
	setScroll(postData);//设置分页开始结束位置
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	postData.taskType = $("#fiDoneTaskListPage-taskType").val();
	postData.finishStatus = $("#fiDoneTaskListPage-finishStatus").val();

	var dateRange = $('#fiDoneTaskListPage-dateRange').mobiscroll('getVal');
	if(dateRange){
		postData.startDate = Format(dateRange[0],"yyyy-MM-dd");
		postData.endDate = Format(dateRange[1],"yyyy-MM-dd");
	}
	
	$.getJSON(basePath+"/app/fiDoneTaskList/queryDoneTasks.xhtml"+callback, postData,function(msg){
		if($.trim(msg.returnCode) == '0'){
			if(msg.data != null){
				var data = msg.data;
				//显示已办任务数量
		    	var $currentPage = $("#fi_done_task_list_page");
		    	$currentPage.find("[identity='doneTasksCount']").text(data.doneTasksCount);

			    if(data.doneTasks.length>0){
			    	
			    	//已办任务列表初始化
			    	var $templateTodoTaskListItem = $('#fi_done_task_list_page').find(".template-container [template-id='doneTaskListItem']");
			    	$.each(data.doneTasks,function(i,n){
			    		var $doneTaskListItem = $templateTodoTaskListItem.clone(true);
			    		
			    		dataBindToElement($doneTaskListItem,n);
			    		//用于返回该页面时计算选项的index
			    		$doneTaskListItem.find("dd").attr("scrollCurrentPage",currentPage);
			    		$doneTaskListItem.find("dd").attr("scrollCurrentElementNum",i);
			    		
			    		
			    		$doneTaskListItem.find("dd").bind("tap",function(event){

			    			var taskId = $(this).find("[identity='taskId']").text();
			    			var taskType = $(this).find("[identity='taskType']").text();
			    			
			    			
			    			
			    			//设置当前选项的index到session中
			    			var scrollCurrentElementIndex = 0;
			    			var scrollCurrentElementNum = $(this).attr("scrollCurrentElementNum");
			    			var scrollCurrentPage = $(this).attr("scrollCurrentPage");
			    			var pageDisplayCount = session.get("pageDisplayCount");
			    	 	    var pageAddCount = session.get("pageAddCount");
			    	 	   if(scrollCurrentPage <= 1){
			    	 		   	scrollCurrentElementIndex = parseInt(scrollCurrentElementNum)+1;
			    		    }else{
			    		    	scrollCurrentElementIndex = parseInt(pageDisplayCount)+((parseInt(scrollCurrentPage)-2)*parseInt(pageAddCount))+parseInt(scrollCurrentElementNum)+1;
			    		    }
			    			var scrollMapJSON = {};
			    			scrollMapJSON.scrollCurrentElementIndex = scrollCurrentElementIndex;
			    			scrollMap.collection_record_list_page = JSON.stringify(scrollMapJSON);
			    			
			    			
			    			if(taskType === "FI"){
			    				//跳转至 家访任务详情查看页面
//			    				session.set("taskId",taskId);
//			    				goto_page("fi_task_details_view_page");
			    				
			    				//跳转至家访任务报告查看页面
			    				session.set("fiTaskId",taskId);
			    				goto_page("fi_task_report_view_page");
			    			}
			    			else{
			    				//跳转至 家访任务详情查看页面
			    				session.set("taskId",taskId);
			    				goto_page("fi_custom_task_details_view_page");
			    			}
			    		});
			    		
			    		$doneTaskListItem.show();
			    		 $('#fi_done_task_list').append($doneTaskListItem);
			    	});//end each
				
		          	//判断该列表是否已无数据
		          	if (!hasPage(data.doneTasks.length)) {
		          		hasData = false;
		          		//无数据时结束分页滚动
		          		endScroll(fi_done_task_list_myScroll);
		          	}
		          	showHide();
				    } 
			    else {
				    	showHide();
				    	hasData = false;
			          	//无数据时结束分页滚动
			      		endScroll(fi_done_task_list_myScroll);
				    }
			}
		}else{
	    	showHide();
	    	errorHandler(msg.returnCode,msg.message);
	    }
		
	});//end $.getJSON
}

//查询任务类型
function fiDoneTaskListPage_queryTaskTypes(){
	
	var postData ={};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	$.ajax({
		url: basePath+"/app/fiDoneTaskList/pageInit.xhtml"+callback, //这个地址做了跨域处理
		data: postData,
		type: 'GET',
		dataType: 'json',
		async:false,
		beforeSend: function () {
			showLoading();
		},
		success: function (msg) {

			showHide();

			if($.trim(msg.returnCode) == '0') {
				if(msg.data != null){

					var data = msg.data;
					
					//初始化日程类型列表
					var $taskTypes = $("#fiDoneTaskListPage-taskType");
					$taskTypes.empty();
					$.each(data.taskTypes,function(i,n){
						var templateItem = '';
						if(n.code == "FI"){
							templateItem += '<option selected value="'+n.code+'">'+n.name+'</option>';
						}
						else{
							templateItem += '<option value="'+n.code+'">'+n.name+'</option>';
						}
						
						$taskTypes.append(templateItem);
					});
					$("#fiDoneTaskListPage-taskType").mobiscroll().select({
					        theme: 'red',
					        lang: 'zh',
					        display: 'bottom',
					        minWidth: 200
					    });
				}
				else{
					showMessage("未查询到任何数据！！",2000);
				}
			}
			else{
				errorHandler(msg.returnCode,msg.message);
			}
		},
		complete: function() {

		}
	});//end $.ajax
}
