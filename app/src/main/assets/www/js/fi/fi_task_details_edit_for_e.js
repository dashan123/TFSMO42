var fi_task_details_edit_for_e_page = $('#fi_task_details_edit_for_e_page');

var fi_task_details_edit_for_e_myScroll;
var fiTaskDetailsEditForE_deletedPlanAddress = new Array();//删除的预约地址

/******************************home_page---begin**************************************/
fi_task_details_edit_for_e_page.live('pageinit',function(e,ui){
	
	var wrapper = "fi_task_details_edit_for_e_wrapper";
	var up = "fi_task_details_edit_for_e_pullUp";
	var down = "fi_task_details_edit_for_e_pullDown";
	fi_task_details_edit_for_e_myScroll = createMyScroll(wrapper,up,down);

	//回退事件处理
	fi_task_details_edit_for_e_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page();
	});
//	//添加地址--角色选择列表初始化
//	$("#fiTaskDetailsEditForE-role").mobiscroll().select({
//	        theme: 'red',
//	        lang: 'zh',
//	        display: 'bottom',
//	        minWidth: 200
//	    });
	//添加预约地址
	fi_task_details_edit_for_e_page.find("#fiTaskDetailsEditForE-addAppointmentAddress").live('tap',function(){
		
		fiTaskDetailsEditForE_addAppointmentAddress();
	});
	
	//提交预约时间
	fi_task_details_edit_for_e_page.find(".SaveBtn2").live('tap',function(){

		fiTaskDetailsEditForE_saveFiTaskDetails();

	});
});//end pageinit

fi_task_details_edit_for_e_page.live('pageshow',function(e, ui){

	currentLoadActionName  = "fi_task_details_edit_for_e_load_content";
	load_fi_task_details_edit_for_e_content();

});//end pageshow

function fi_task_details_edit_for_e_load_content(){
	//下拉不刷新，则该方法置空
}
//加载页面初始化数据，并显示
function load_fi_task_details_edit_for_e_content(){
	//清空deletedPlanAddress数组
	fiTaskDetailsEditForE_deletedPlanAddress.length = 0;
//	$('#fi_task_details_edit_for_e').empty();
	showLoading();
	var postData ={};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	postData.taskId = session.get("taskId");//获取家访任务Id
	
	$.getJSON(basePath+"/app/fiTaskDetailsEditForE/pageInit.xhtml"+callback, postData,function(msg){
		
		if($.trim(msg.returnCode) == '0') {
			showHide();
			if(msg.data){
				
				var data = msg.data;
				
				var detailsElement = $("#fiTaskDetailsEditForEPage_Details");
				
				//绑定家访任务信息
				var fiTask = data.fiTask;
				dataBindToElement(detailsElement,fiTask);
				
				//初始化家访地区列表
				var $fiRegionList = $("#fiTaskDetailsEditForE-fiRegion");
				$fiRegionList.empty();
				$.each(data.fiRegionList,function(i,n){
					var templateItem = "";
					if(n.code === fiTask.fiRegion){
						templateItem += '<option selected value="'+n.code+'">'+n.name+'</option>';
					}
					else{
						templateItem += '<option value="'+n.code+'">'+n.name+'</option>';
					}
					
					$fiRegionList.append(templateItem);
				});
				$("#fiTaskDetailsEditForE-fiRegion").mobiscroll().select({
				        theme: 'red',
				        lang: 'zh',
				        display: 'bottom',
				        minWidth: 200
//				        defaultValue:fiTask.fiRegion
				    });

				
				//绑定家访地址信息 fiAddressList
				$("#fiTaskDetailsEditForEPage_fiDemandList [_for='fiAddress']").remove();
				var $templateFiAddressItem = $('#fi_task_details_edit_for_e_page').find("[template-id='fiAddress'] li");
				var fiAddressList = data.fiAddressList;
				$.each(fiAddressList,function(i,n){
					var $fiAddressItemElement = $templateFiAddressItem.clone(true);
					dataBindToElement($fiAddressItemElement,n);

					$("#fiTaskDetailsEditForEPage_fiDemandList").append($fiAddressItemElement);
				});
				
				//绑定家访计划地址
				var appointmentAddressList2 = data.appointmentAddressList2;
				$("#fiTaskDetailsEditForEPage_fiFieldDetails [liFor='fiPlanAddress2']").remove();
				var $templateFiPlanAddress2Item = $('#fi_task_details_edit_for_e_page').find("[template-id='fiPlanAddress2'] li");
				$.each(appointmentAddressList2,function(i,n){
					var $fiPlanAddress2ItemElement = $templateFiPlanAddress2Item.clone(true);
					$fiPlanAddress2ItemElement.find('input[identity="planTime"]').attr("id",n.id);
					$fiPlanAddress2ItemElement.attr("status","saved");
					dataBindToElement($fiPlanAddress2ItemElement,n);

					$("#fiTaskDetailsEditForEPage_fiFieldDetails").append($fiPlanAddress2ItemElement);
				});
				
				fiTaskDetailsEditForE_deleteAppointmentAddress();
				
				var now = new Date();
				
				$('#fi_task_details_edit_for_e_page [control="mobiDatetime"]').mobiscroll().datetime({
				    theme: 'red',
				    lang: 'zh',
				    display: 'bottom',
				    min: now,
				    onSet:function(event,inst){
				    	
				    	var planTime = event.valueText;
				    	//选定预约日期后，提示是否保存预约时间，用户选择是后进行数据的保存
				    	var $target = $(this);
				    	var _for = $(this).attr("_for");
				    	if(_for === "fiCustomerAddress"){
				    		var fieldStatus = $(this).parent().find("[identity='fieldStatus']").text();
				    		if(fieldStatus === "JXZ"){
		            			showMessage("当前地址正在实地中，不可以修改预约时间！！");
		            		}
		            		else if(fieldStatus === "YJS"){//地址已结束，不可以删除或更改预约时间
		            			showMessage("当前地址已结束，不可以修改预约时间！！");
		            		}
		            		else{
		            			var $liPlanAddressElement =  $(this).parents('[liFor="fiCustomerAddress"]');
		            			if($liPlanAddressElement.attr("status") === "saved"){
		            				$liPlanAddressElement.attr("status","modified");
		            			}
		            		}
				    	}
				    	else if(_for === "fiPlanAddress2"){
				    		//为计划地址保存预约时间（根据家访计划地址Id执行更新操作）
				    		var fieldStatus = $(this).parent().find("[identity='fieldStatus']").text();
				    		if(fieldStatus === "JXZ"){
		            			showMessage("当前地址正在实地中，不可以修改预约时间！！");
		            		}
		            		else if(fieldStatus === "YJS"){//地址已结束，不可以删除或更改预约时间
		            			showMessage("当前地址已结束，不可以修改预约时间！！");
		            		}
		            		else{
//		            			var planAddressId = $(this).parent().find("[identity='id']").text();
		            			var $liPlanAddressElement =  $(this).parents('[liFor="fiPlanAddress2"]');
		            			if($liPlanAddressElement.attr("status") === "saved"){
		            				$liPlanAddressElement.attr("status","modified");
		            			}
		            		}
				    	}
//				    	return false;
				    }
//				    max: maxDate,
//				    dateWheels: '|D M d|'
				});
				
			}//end if(msg.data){
		}
		else{
			errorHandler(msg.returnCode,msg.message);
		}
		
	});//end $.getJSON
}

//添加预约地址
function fiTaskDetailsEditForE_addAppointmentAddress(){
	//校验非空
//	var role = $("#fiTaskDetailsEditForE-role").mobiscroll('getVal');
//	if(!role){
//		showMessage("角色不能为空！",1500);
//		return;
//	}
	var appointAddress = $("#fiTaskDetailsEditForE-appointAddress").val();
	if(!appointAddress){
		showMessage("预约地址不能为空！",1500);
		return;
	}
	var appointDatetime = $("#fiTaskDetailsEditForE-appointDatetime").val();
	if(!appointDatetime){
		showMessage("预约时间不能为空！",1500);
		return;
	}
	
	//绑定计划地址
	var planAddressObject = {};
//	planAddressObject.fiRole = role;
	planAddressObject.planAddressType = "地址";
	planAddressObject.planAddress = appointAddress;
	planAddressObject.planTime = appointDatetime;
	
	var $templatePlanAddressItem = $('#fi_task_details_edit_for_e_page').find("[template-id='fiPlanAddress2'] li");
	var $planAddressItemElement = $templatePlanAddressItem.clone(true);
	$planAddressItemElement.attr("status","add");
	dataBindToElement($planAddressItemElement,planAddressObject);

	$("#fiTaskDetailsEditForEPage_fiFieldDetails").append($planAddressItemElement);
	$("#fiTaskDetailsEditForE-appointAddress").val("");
	$("#fiTaskDetailsEditForE-appointDatetime").val("");
	fiTaskDetailsEditForE_deleteAppointmentAddress();
}

//删除预约地址
function fiTaskDetailsEditForE_deleteAppointmentAddress(){

	$('#fiTaskDetailsEditForEPage_fiFieldDetails').mobiscroll().listview({
        theme: 'red',
        display: '',
        sortable: true,
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
            			fiTaskDetailsEditForE_deletedPlanAddress.push($(target).find("[identity='id']").text());
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

//保存任务详情
function fiTaskDetailsEditForE_saveFiTaskDetails(){
	
	//获取任务类型，内容，描述，城市
	var postData = getDataFromElement($('#fiTaskDetailsEditForEPage_basicInfo'));
	
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	postData.taskId =  session.get("taskId");
	
	//获取家访要求地址列表(全部执行更新操作，在服务端进行业务处理)
	var fiCustomerAddressArray = [];
	var $fiCustomerAddressListElement = $("#fiTaskDetailsEditForEPage_fiCustomerAddressList").find("li[status!='saved']");
	$.each($fiCustomerAddressListElement,function(i,n){
		
//		var planTime =  Format(new Date($(n).find("[identity='planTime']").val()),"yyyy-MM-dd HH:mm:ss");
		
		var fiCustomerAddressObject = {};
		fiCustomerAddressObject.id = $(n).find("[identity='fiCustomerAddressId']").text();
		fiCustomerAddressObject.fiRole = $(n).find("[identity='fiRole']").text();
		fiCustomerAddressObject.addressType = $(n).find("[identity='addressType']").text();
		fiCustomerAddressObject.address = $(n).find("[identity='address']").text();
		fiCustomerAddressObject.planTime = Format(new Date($(n).find("[identity='planTime']").val()),"yyyy-MM-dd HH:mm:ss");
		
		fiCustomerAddressArray.push(JSON.stringify(fiCustomerAddressObject));
	});
	
	//获取预约地址列表
	var $unSavedAddressListElement = $("#fiTaskDetailsEditForEPage_fiFieldDetails").find("li[status!='saved']");
	var addPlanAddressArray = [];
	var modifiedPlanAddressArray = [];
	$.each($unSavedAddressListElement,function(i,n){
		
		var planAddressObject = {};
		planAddressObject.id = $(n).find("[identity='id']").text();
//		planAddressObject.fiCustomTaskId = session.get("taskId");
//		planAddressObject.userId = session.get("userId");
//		planAddressObject.fieldStatus = "WKS";
		planAddressObject.fiRole = $(n).find("[identity='fiRole']").text();
		planAddressObject.planAddressType = $(n).find("[identity='planAddressType']").text();
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
	
	postData.fiCustomerAddressArray = fiCustomerAddressArray;
	postData.addPlanAddressArray = addPlanAddressArray;
	postData.modifiedPlanAddressArray = modifiedPlanAddressArray;
	postData.deletedPlanAddressArray =fiTaskDetailsEditForE_deletedPlanAddress;
	
	//保存数据至服务器
	$.ajax({
		url: basePath+"/app/fiTaskDetailsEditForE/saveFiTaskDetails.xhtml"+callback, //这个地址做了跨域处理
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
						
						load_fi_task_details_edit_for_e_content();
						showMessage("家访任务详情保存成功！！",2000);
					}
					else if(result == -1){
						showMessage("家访任务已完成，不允许更改任务详情！！",2000);
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
