var fi_custom_task_details_edit_page = $('#fi_custom_task_details_edit_page');

var fi_custom_task_details_edit_myScroll;

var fiCustomTaskDetailsEdit_deletedPlanAddress = new Array();//删除的预约地址
/******************************home_page---begin**************************************/
fi_custom_task_details_edit_page.live('pageinit',function(e,ui){
	
	var wrapper = "fi_custom_task_details_edit_wrapper";
	var up = "fi_custom_task_details_edit_pullUp";
	var down = "fi_custom_task_details_edit_pullDown";
	fi_custom_task_details_edit_myScroll = createMyScroll(wrapper,up,down);
//	//scroll位置
//	var scrollMapJSON = {};
//	scrollMapJSON.organizationid = organizationid;
//	scrollMap.contacts_dept_page = JSON.stringify(scrollMapJSON);
	//回退事件处理
	fi_custom_task_details_edit_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
//		back_page('workbench_page');
		back_page();
	});
	
	//保存
	fi_custom_task_details_edit_page.find(".SaveBtn2").live("tap",function(){
		fiCustomTaskDetailsEdit_saveFiCustomTaskDetails();

	});
	
	//添加预约地址
	fi_custom_task_details_edit_page.find("#fiCustomTaskDetailsEdit-addAppointmentAddress").live('tap',function(){
		
		fiCustomTaskDetailsEdit_addAppointmentAddress();
	});
	
	//任务类型数据初始化
	$("#fiCustomTaskDetailsEditPage_citys").mobiscroll().select({
	        theme: 'red',
	        lang: 'zh',
	        display: 'bottom',
	        minWidth: 200
	    });

	  
});//end pageinit

fi_custom_task_details_edit_page.live('pageshow',function(e, ui){

	currentLoadActionName  = "fi_custom_task_details_edit_load_content";
	load_fi_custom_task_details_edit_content();

});//end pageshow

function fi_custom_task_details_edit_load_content(){
	//下拉不刷新，则该方法置空
}
//加载页面初始化数据，并显示
function load_fi_custom_task_details_edit_content(){

	$('#fiCustomTaskDetailsEditPage_Details').find("[identity]").val("");
	$('#fiCustomTaskDetailsEditPage_Details').find("[identity]").text("");
	$("#fiCustomTaskDetailsEditPage_fiFieldDetails").empty();
	showLoading();
	var postData ={};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	postData.taskId = session.get("taskId");//获取家访任务Id
	
	
	if(session.get("taskId")){
		$.getJSON(basePath+"/app/fiCustomTaskDetailsEdit/pageInit.xhtml"+callback, postData,function(msg){
			
			if($.trim(msg.returnCode) == '0') {
				showHide();
				if(msg.data){
					
					var data = msg.data;
					
					var detailsElement = $("#fiCustomTaskDetailsEditPage_Details");
					
					//绑定任务信息
					var fiCustomTask = data.fiCustomTask;
					if(fiCustomTask){
						dataBindToElement(detailsElement,fiCustomTask);
					}
					
					//初始化任务类型
					var taskType = data.fiCustomTaskType;
					var fiCustomTaskTypeList = $("#fiCustomTaskDetailsEdit-taskType");
					fiCustomTaskTypeList.empty();
					$.each(taskType,function(i,n){
						var templateItem = "";
						if(n.code === fiCustomTask.taskType){
							templateItem += '<option selected value="'+n.code+'">'+n.name+'</option>';
						}
						else{
							templateItem += '<option value="'+n.code+'">'+n.name+'</option>';
						}
						
						fiCustomTaskTypeList.append(templateItem);
					});
					$("#fiCustomTaskDetailsEdit-taskType").mobiscroll().select({
				        theme: 'red',
				        lang: 'zh',
				        display: 'bottom',
				        minWidth: 200
//				        defaultValue:fiTask.fiRegion
				    });
					
					//初始化城市
					var citysData = data.citys;
					var $citysElement = $("#fiCustomTaskDetailsEditPage_citys");
					$citysElement.empty();
					var templateItem = "";
					$.each(citysData,function(i,n){
						templateItem += '<optgroup label='+i+'>';
						
						$.each(n,function(j,m){
							if(m.name === fiCustomTask.city){
								templateItem += '<option selected value="'+m.name+'">'+m.name+'</option>';
							}
							else{
								templateItem += '<option value="'+m.name+'">'+m.name+'</option>';
							}
						});
						
						templateItem += '</optgroup>';
					});
					$citysElement.append(templateItem);
					$("#fiCustomTaskDetailsEditPage_citys").mobiscroll().select({
				        theme: 'red',
				        lang: 'zh',
				        display: 'bottom',
				        minWidth: 200
//				        defaultValue:fiTask.fiRegion
				    });
									
					//绑定自定义任务计划地址
					var planAddressList = data.planAddressList;
					if(planAddressList){
						$("#fiCustomTaskDetailsEditPage_fiFieldDetails [liFor='planAddress']").remove();
						var $templatePlanAddressItem = $('#fi_custom_task_details_edit_page').find("[template-id='planAddress'] li");
						$.each(planAddressList,function(i,n){
							var $planAddressItemElement = $templatePlanAddressItem.clone(true);
							debugger;
							$planAddressItemElement.find('input[identity="planTime"]').attr("id",n.id);
							$planAddressItemElement.attr("status","saved");
							dataBindToElement($planAddressItemElement,n);

							$("#fiCustomTaskDetailsEditPage_fiFieldDetails").append($planAddressItemElement);
						});
					} 
					
					fiCustomTaskDetailsEdit_deleteAppointmentAddress();
					
					var now = new Date();
//				    minDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
//				    maxDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
					$('#fi_custom_task_details_edit_page [control="mobiDatetime"]').mobiscroll().datetime({
					    theme: 'red',
					    lang: 'zh',
					    display: 'bottom',
					    min: now,
					    onSet:function(event,inst){
					    	
					    	var planTime = event.valueText;
					    	//选定预约日期后，提示是否保存预约时间，用户选择是后进行数据的保存
					    	
					    	var $target = $(this);
					    	var _for = $(this).attr("_for");
					    	
				    		if(_for === "planAddress"){
				    			
					    		//为计划地址保存预约时间（根据家访计划地址Id执行更新操作）
					    		var fieldStatus = $(this).parent().find("[identity='fieldStatus']").text();
					    		if(fieldStatus === "JXZ"){
			            			showMessage("当前地址正在实地中，不可以修改预约时间！！");
			            		}
			            		else if(fieldStatus === "YJS"){//地址已结束，不可以删除或更改预约时间
			            			showMessage("当前地址已结束，不可以修改预约时间！！");
			            		}
			            		else{
			            			var planAddressId = $(this).parent().find("[identity='id']").text();
			            			var $liPlanAddressElement =  $(this).parents('[liFor="planAddress"]');
			            			if($liPlanAddressElement.attr("status") === "saved"){
			            				$liPlanAddressElement.attr("status","modified");
			            			}
			            		}
					    	}
					    }
//					    max: maxDate,
//					    dateWheels: '|D M d|'
					});
					
				}//end if(msg.data){
			}
			else{
				errorHandler(msg.returnCode,msg.message);
			}
			
		});//end $.getJSON
	}
	else{

		$.getJSON(basePath+"/app/fiCustomTaskDetailsEdit/pageInit0.xhtml"+callback, postData,function(msg){
			
			if($.trim(msg.returnCode) == '0') {
				showHide();
				if(msg.data){
					
					var data = msg.data;
					
					var detailsElement = $("#fiCustomTaskDetailsEditPage_Details");
					
					//初始化任务类型
					var taskType = data.fiCustomTaskType;
					var fiCustomTaskTypeList = $("#fiCustomTaskDetailsEdit-taskType");
					fiCustomTaskTypeList.empty();
					$.each(taskType,function(i,n){
						var templateItem = "";
						templateItem += '<option value="'+n.code+'">'+n.name+'</option>';
						fiCustomTaskTypeList.append(templateItem);
					});
					$("#fiCustomTaskDetailsEdit-taskType").mobiscroll().select({
				        theme: 'red',
				        lang: 'zh',
				        display: 'bottom',
				        minWidth: 200
//				        defaultValue:fiTask.fiRegion
				    });
					
					//初始化城市
					var citysData = data.citys;
					var $citysElement = $("#fiCustomTaskDetailsEditPage_citys");
					$citysElement.empty();
					var templateItem = "";
					$.each(citysData,function(i,n){
						templateItem += '<optgroup label='+i+'>';
						
						$.each(n,function(j,m){
//							if(m.name === fiCustomTask.city){
//								templateItem += '<option selected value="'+m.name+'">'+m.name+'</option>';
//							}
//							else{
//								templateItem += '<option value="'+m.name+'">'+m.name+'</option>';
//							}
							templateItem += '<option value="'+m.name+'">'+m.name+'</option>';
						});
						
						templateItem += '</optgroup>';
					});
					$citysElement.append(templateItem);
					$("#fiCustomTaskDetailsEditPage_citys").mobiscroll().select({
				        theme: 'red',
				        lang: 'zh',
				        display: 'bottom',
				        minWidth: 200
//				        defaultValue:fiTask.fiRegion
				    });
									
					var now = new Date();
//				    minDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
//				    maxDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
					$('#fi_custom_task_details_edit_page [control="mobiDatetime"]').mobiscroll().datetime({
					    theme: 'red',
					    lang: 'zh',
					    display: 'bottom',
					    min: now,
					    onSet:function(event,inst){
					    	
					    	var planTime = event.valueText;
					    	//选定预约日期后，提示是否保存预约时间，用户选择是后进行数据的保存
					    	
					    	var $target = $(this);
					    	var _for = $(this).attr("_for");
					    	
				    		if(_for === "planAddress"){
				    			
					    		//为计划地址保存预约时间（根据家访计划地址Id执行更新操作）
					    		var fieldStatus = $(this).parent().find("[identity='fieldStatus']").text();
					    		if(fieldStatus === "JXZ"){
			            			showMessage("当前地址正在实地中，不可以修改预约时间！！");
			            		}
			            		else if(fieldStatus === "YJS"){//地址已结束，不可以删除或更改预约时间
			            			showMessage("当前地址已结束，不可以修改预约时间！！");
			            		}
			            		else{
			            			var planAddressId = $(this).parent().find("[identity='id']").text();
			            			var $liPlanAddressElement =  $(this).parents('[liFor="planAddress"]');
			            			if($liPlanAddressElement.attr("status") === "saved"){
			            				$liPlanAddressElement.attr("status","modified");
			            			}
			            		}
					    	}
					    }
//					    max: maxDate,
//					    dateWheels: '|D M d|'
					});
					
				}//end if(msg.data){
			}
			else{
				errorHandler(msg.returnCode,msg.message);
			}
			
		});//end $.getJSON
	
	}
	
	
	
	
}

//添加预约地址
function fiCustomTaskDetailsEdit_addAppointmentAddress(){
	//校验非空
	var appointAddress = $("#fiCustomTaskDetailsEdit-appointAddress").val();
	if(!appointAddress){
		showMessage("预约地址不能为空！",1500);
		return;
	}
	var appointDatetime = $("#fiCustomTaskDetailsEdit-appointDatetime").val();
	
	if(!appointDatetime){
		showMessage("预约时间不能为空！",1500);
		return;
	}
	
	//绑定自定义任务计划地址
	var planAddressObject = {};
	planAddressObject.planAddress = appointAddress;
	planAddressObject.planTime = appointDatetime;
	    
	var $templatePlanAddressItem = $('#fi_custom_task_details_edit_page').find("[template-id='planAddress'] li");
	var $planAddressItemElement = $templatePlanAddressItem.clone(true);
	
	$planAddressItemElement.find("input").attr("id",uuid());
	$planAddressItemElement.attr("status","add");
	dataBindToElement($planAddressItemElement,planAddressObject);

	$("#fiCustomTaskDetailsEditPage_fiFieldDetails").append($planAddressItemElement);
	$("#fiCustomTaskDetailsEdit-appointAddress").val("");
	$("#fiCustomTaskDetailsEdit-appointDatetime").val("");
	fiCustomTaskDetailsEdit_deleteAppointmentAddress();
}

//删除预约地址
function fiCustomTaskDetailsEdit_deleteAppointmentAddress(){

	$('#fiCustomTaskDetailsEditPage_fiFieldDetails').mobiscroll().listview({
        theme: 'red',
        display: '',
        sortable: false,
        iconSlide: true,
        swipe:'left',
        stages: [ {
            percent: -25,
            color: 'red',
            icon: 'remove',
            text: '删除',
            confirm: true,
            disabled: function (event, inst) {
                // Disable this action only for the item with 2 as id. 
//            	if (event.target.getAttribute('template-id') != 'normal-schedule') {
//                    return true;
//                }
            },
            action: function (event, inst) {
            	
            	var target = event.target;
            	var status = $(target).attr("status");
            	
            	//删除了已在服务器端保存的照片
            	if(status != "add"){
            		
            		var fieldStatus = $(target).find("[identity='fieldStatus']").text();
            		//如果地址正在实地中，不可以删除或更改预约时间
            		if(fieldStatus === "JXZ"){
            			showMessage("当前地址正在实地中，不可以删除！！");
//            			return false;
            		}
            		else if(fieldStatus === "YJS"){//地址已结束，不可以删除或更改预约时间
            			showMessage("当前地址已结束，不可以删除！！");
//            			return false;
            		}
            		else{
            			fiCustomTaskDetailsEdit_deletedPlanAddress.push($(target).find("[identity='id']").text());
            			inst.remove(event.target);
            		}
            	}
            	else{
            		inst.remove(event.target);
            	}
            }
        }
        ]
    });//end listview
	
	
}


//保存自定义任务详情
function fiCustomTaskDetailsEdit_saveFiCustomTaskDetails(){
	
	//获取任务类型，内容，描述，城市
	var postData = getDataFromElement($('#fiCustomTaskDetailsEditPage_basicInfo'));
	
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	if(session.get("taskId")==null){
		session.set("taskId",uuid());
	}
	postData.taskId =  session.get("taskId");
	
	//获取预约地址列表
	var $unSavedAddressListElement = $("#fiCustomTaskDetailsEditPage_fiFieldDetails").find("li[status!='saved']");
	var addPlanAddressArray = [];
	var modifiedPlanAddressArray = [];
	$.each($unSavedAddressListElement,function(i,n){
		
		var planAddressObject = {};
		planAddressObject.id = $(n).find("[identity='id']").text();
//		planAddressObject.fiCustomTaskId = session.get("taskId");
//		planAddressObject.userId = session.get("userId");
//		planAddressObject.fieldStatus = "WKS";
		planAddressObject.planAddress = $(n).find("[identity='planAddress']").text();
		planAddressObject.planTime = Format(new Date($(n).find("[identity='planTime']").val()),"yyyy-MM-dd HH:mm:ss");
		
		if($(n).attr("status") === "add"){
			
			addPlanAddressArray.push(JSON.stringify(planAddressObject));
		}
		else if($(n).attr("status") === "modified"){
			modifiedPlanAddressArray.push(JSON.stringify(planAddressObject));
		}
		else{}
		

	});
	
	postData.addPlanAddressArray = addPlanAddressArray;
	postData.modifiedPlanAddressArray = modifiedPlanAddressArray;
	postData.deletedPlanAddressArray =fiCustomTaskDetailsEdit_deletedPlanAddress;
	
	
	//保存数据至服务器
	$.ajax({
		url: basePath+"/app/fiCustomTaskDetailsEdit/saveFiCustomTaskDetails.xhtml"+callback, //这个地址做了跨域处理
		data: postData,
		traditional: true,//这个设置为true，data:{"steps":["qwe","asd","zxc"]}会转换成steps=qwe&steps=asd&...
		type: 'GET',
		dataType: 'json',
		async:false,
		beforeSend: function () {
			showLoading();
		},
		success: function (msg) {

			showHide();

			if($.trim(msg.returnCode) == '0') {
				var data = msg.data;
				
				if(data){
					if(data.result > 0){
						load_fi_custom_task_details_edit_content();
						setTimeout(function(){
							showMessage("自定义任务详情保存成功！！",1500);
						}, 1500);
						
					}
					else{
						
					}
				}//end if(data)
			}
			else{
				errorHandler(msg.returnCode,msg.message);
			}
		},
		complete: function() {

		}
	});//end $.ajax
}