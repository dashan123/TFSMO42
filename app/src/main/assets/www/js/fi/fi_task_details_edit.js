var fi_task_details_edit_page = $('#fi_task_details_edit_page');

var fi_task_details_edit_myScroll;
var fiTaskDetailsEdit_deletedPlanAddress = new Array();//删除的预约地址

/******************************home_page---begin**************************************/
fi_task_details_edit_page.live('pageinit',function(e,ui){
	
	var wrapper = "fi_task_details_edit_wrapper";
	var up = "fi_task_details_edit_pullUp";
	var down = "fi_task_details_edit_pullDown";
	fi_task_details_edit_myScroll = createMyScroll(wrapper,up,down);
//	//scroll位置
//	var scrollMapJSON = {};
//	scrollMapJSON.organizationid = organizationid;
//	scrollMap.contacts_dept_page = JSON.stringify(scrollMapJSON);
	//回退事件处理
	fi_task_details_edit_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
//		back_page('workbench_page');
		back_page();
	});
	
	//添加预约地址
	fi_task_details_edit_page.find("#fiTaskDetailsEdit-addAppointmentAddress").live('tap',function(){
		
		fiTaskDetailsEdit_addAppointmentAddress();
	});
	
	//提交预约时间
	fi_task_details_edit_page.find(".SaveBtn2").live('tap',function(){

		fiTaskDetailsEdit_saveFiTaskDetails();

	});
	
	
	//打回任务
	fi_task_details_edit_page.find('[tag="fi_task_details_edit_bottom"] li:first').live('tap',function(){
		
		showConfirmDialog("打回后不可再进行更改，是否打回？",{}, function(){
			var fiTaskId = session.get("taskId");//获取家访任务Id
			var callBack1 = function(){
				showMessage("任务已预约，请到我的日程中执行打回操作。");
			}
			var callBack2 = function(){
				var postData ={};
				postData.random = new Date();
				postData.userCode = session.get("userCode");
				postData.userId = session.get("userId");
				postData.fiTaskId = session.get("taskId");//获取家访任务Id
				
				$.getJSON(basePath+"/app/fiTaskDetailsEdit/returnBackFiTask.xhtml"+callback, postData,function(msg){
					
					if($.trim(msg.returnCode) == '0') {
						showHide();
						if(msg.data){
							
							var data = msg.data;
							
							var result = data.result;
							if(result > 0){
								showMessage("家访任务打回成功！！",2000);
							}
							else if(result == -1){
								showMessage("家访任务已完成，不允许执行打回操作！！",2000);
							}
							else if(result == -2){
								showMessage("预约日期，完成日期任意一个为空，家访类型不是skip fi的，不可以提交！！",2000);
							}
							else if(result == -3){
								showMessage("提交类型为正常时，家访结束时间不能为空，请检查是否已开始并结束家访！！",2000);
							}
							else if(result == -4){
								showMessage("提交类型为正常时，必须要有家访报告，请检查是否已保存家访报告！！",2000);
							}
							else if(result == -5){
								showMessage("当前任务有正在进行中的计划地址，不允许执行打回操作！！",2000);
							}
							else{
								showMessage("家访报告打回失败！！",2000);
							}
							
						}//end if(msg.data){
					}
					else{
						errorHandler(msg.returnCode,msg.message);
					}
					
				});//end $.getJSON
			}
			
			fiTaskDetailsEdit_getPlanStatus(fiTaskId,callBack1,callBack2);
		});
		
		
	});
	
	//取消
	fi_task_details_edit_page.find('[tag="fi_task_details_edit_bottom"] li:last').live('tap',function(){
		showConfirmDialog("取消后不可再进行更改，是否取消？",{}, function(){
			var fiTaskId = session.get("taskId");//获取家访任务Id
			var callBack1 = function(){
				showMessage("任务已预约，请到我的日程中执行取消操作。");
			}
			var callBack2 = function(){
				var fiTaskId = session.get("taskId");//获取家访任务Id
				session.set("fiTaskId",fiTaskId);
				goto_page("fi_task_details_edit01_page");
			}
			fiTaskDetailsEdit_getPlanStatus(fiTaskId,callBack1,callBack2);
		});
		

	});
	//添加地址--角色选择列表初始化
	$("#fiTaskDetailsEdit-role").mobiscroll().select({
	        theme: 'red',
	        lang: 'zh',
	        display: 'bottom',
	        minWidth: 200
	    });
	  

	  $('#fiTaskDetailsEdit-leaveWord').mobiscroll().widget({
	        theme: 'red',
	        lang: 'zh',
	        display: 'bottom',
//	        anchor: $('#show'),
	        buttons: [{
	            text: '提交',
	            handler: 'set'
	        }, {
	            text: '取消',
	            handler: 'cancel'
	        }],
	        onBeforeShow: function (event, inst) {
	        	
	        	$("#fiTaskDetailsEdit-forDealerWord").attr("class","segmentedButtons2Selected");
	  		  	$("#fiTaskDetailsEdit-forDealerWord").siblings().attr("class","segmentedButtons2Unselected");
	        	
	            var s = inst.settings;

	            if (s.theme == 'wp' || s.baseTheme == 'wp') {
	                s.buttons[0].icon = 'checkmark';
	                s.buttons[1].icon = 'close';
	            }
	        },
	        onSet:function(event, inst){
	        	//提交留言 
	        	$("#fiTaskDetailsEdit-leaveWordBox").blur();
	        	var leaveWord = $("#fiTaskDetailsEdit-leaveWordBox").val();
	        	if(leaveWord == ""){
	        		showMessage("留言内容不可以为空！！");
	        		return;
	        	}
	        	
	        	
	  		  	if($("#fiTaskDetailsEdit-forDealerWord").attr("class")==="segmentedButtons2Selected"){
	  		  		
	  		  		fiTaskDetailsEdit_submitLeaveWord("forDealerWord",leaveWord);
	  		  	}
	  		  	else{
	  		  		fiTaskDetailsEdit_submitLeaveWord("forEmployeeWord",leaveWord);
	  		  	}
	  		  
	        },
	        onCancel: function (event, inst) {
//	        	debugger;
	        }
	    });
	  
	  //经销商留言
	  $('#fiTaskDetailsEdit-leaveWord').mobiscroll('tap', $('#fiTaskDetailsEdit-forDealerWord'), function () {
//		  alert("It's a tap!"); 
		  var $button = $('#fiTaskDetailsEdit-forDealerWord');
		  $button.attr("class","segmentedButtons2Selected");
		  $button.siblings().attr("class","segmentedButtons2Unselected");
			
		  fiTaskDetailsEdit_queryAndSetForDealerWord();
		  }
	  );
	  //内部留言
	  $('#fiTaskDetailsEdit-leaveWord').mobiscroll('tap', $('#fiTaskDetailsEdit-forEmployeeWord'), function () {
		  var $button = $('#fiTaskDetailsEdit-forEmployeeWord');
		  
		  $button.attr("class","segmentedButtons2Selected");
		  $button.siblings().attr("class","segmentedButtons2Unselected");
			
			//清空
			$("#fiTaskDetailsEdit-leaveWordBox").val("");
		  }
	  );

	  fi_task_details_edit_page.find(".SaveBtn1").live('tap',function(){
		  
		  $('#fiTaskDetailsEdit-leaveWord').mobiscroll('show');

		//获取并设置经销商留言默认值
		fiTaskDetailsEdit_queryAndSetForDealerWord();
	        return false;
	  });
	  
});//end pageinit

function fiTaskDetailsEdit_queryAndSetForDealerWord(){
	
	//获取经销商留言默认值
	var postData ={};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	postData.fiTaskId = session.get("taskId");//获取家访任务Id
	
	$.getJSON(basePath+"/app/fiTaskDetailsEdit/queryForDealerWord.xhtml"+callback, postData,function(msg){
		
		if($.trim(msg.returnCode) == '0') {
			showHide();
			if(msg.data){
				
				var data = msg.data;
				if(data.appointTime){
					$("#fiTaskDetailsEdit-leaveWordBox").val("预约"+data.appointTime+"进行家访");
				}

			}//end if(msg.data){
		}
		else{
			errorHandler(msg.returnCode,msg.message);
		}
		
	});//end $.getJSON
}

function fiTaskDetailsEdit_submitLeaveWord(wordType,wordContent){

	var postData ={};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	postData.fiTaskId = session.get("taskId");//获取家访任务Id
	postData.wordType = wordType;
	postData.wordContent = wordContent;
	
	$.getJSON(basePath+"/app/fiTaskDetailsEdit/submitLeaveWord.xhtml"+callback, postData,function(msg){
		
		if($.trim(msg.returnCode) == '0') {
			showHide();
			if(msg.data){
				
				var data = msg.data;
				if(data.result == true){
					showMessage("留言提交成功",1500);
				}
				else{
					showMessage("留言提交失败",1500);
				}
				
			}//end if(msg.data){
		}
		else{
			errorHandler(msg.returnCode,msg.message);
		}
		
	});//end $.getJSON
}


fi_task_details_edit_page.live('pageshow',function(e, ui){

	currentLoadActionName  = "fi_task_details_edit_load_content";
	load_fi_task_details_edit_content();

});//end pageshow

function fi_task_details_edit_load_content(){
	//下拉不刷新，则该方法置空
}

//加载页面初始化数据，并显示
function load_fi_task_details_edit_content(){
	
	//取消与打回按钮的显示与隐藏
	fiTaskDetailsEdit_getPlanStatus(session.get("taskId"),function(){
		
		$('#fi_task_details_edit_page').find('[tag="fi_task_details_edit_bottom"]').hide();
		$('#fi_task_details_edit_wrapper').css("bottom","0px");
	},function(){
		$('#fi_task_details_edit_page').find('[tag="fi_task_details_edit_bottom"]').show();
		$('#fi_task_details_edit_wrapper').css("bottom","60px");
	});
	
	//清空deletedPlanAddress数组
	fiTaskDetailsEdit_deletedPlanAddress.length = 0;
//	$('#fi_task_details_edit').empty();
	showLoading();
	var postData ={};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	postData.taskId = session.get("taskId");//获取家访任务Id
	
	$.getJSON(basePath+"/app/fiTaskDetailsEdit/pageInit.xhtml"+callback, postData,function(msg){
		
		if($.trim(msg.returnCode) == '0') {
			showHide();
			if(msg.data){
				
				var data = msg.data;
				
				var detailsElement = $("#fiTaskDetailsEditPage_Details");
				
				//绑定家访任务信息
				var fiTask = data.fiTask;
				dataBindToElement(detailsElement,fiTask);
				//格式化金额
				var loanAmount = formatNumberToThousands(detailsElement.find('[identity="loanAmount"]').text());
				detailsElement.find('[identity="loanAmount"]').text(loanAmount);
				
				var monthlyRepayment = formatNumberToThousands(detailsElement.find('[identity="monthlyRepayment"]').text());
				detailsElement.find('[identity="monthlyRepayment"]').text(monthlyRepayment);
				
				//初始化家访地区列表
				var $fiRegionList = $("#fiTaskDetailsEdit-fiRegion");
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
				$("#fiTaskDetailsEdit-fiRegion").mobiscroll().select({
				        theme: 'red',
				        lang: 'zh',
				        display: 'bottom',
				        minWidth: 200
//				        defaultValue:fiTask.fiRegion
				    });

				//绑定家访客户信息 customerInfoList
				$("#fiTaskDetailsEditPage_customerInfoList").empty();
				var $templateCustomerInfoItem = $('#fi_task_details_edit_page').find("[template-id='customerInfo'] li");
				var customerInfoList = data.customerInfoList;
				$.each(customerInfoList,function(i,n){
					var $customerInfoItemElement = $templateCustomerInfoItem.clone(true);
					dataBindToElement($customerInfoItemElement,n);

					$customerInfoItemElement.find('[identity="maritalStatus"]').text(n.maritalStatus==true?"已婚":"未婚");//以文本方式显示婚姻状态
					$customerInfoItemElement.find('[identity="birthday"]').text(n.birthday.substring(0,10));//格式式出生日期
					
					$("#fiTaskDetailsEditPage_customerInfoList").append($customerInfoItemElement);
				});
				
				//绑定家访地址信息 fiAddressList
				
				$("#fiTaskDetailsEditPage_fiDemandList [_for='fiAddress']").remove();
				var $templateFiAddressItem = $('#fi_task_details_edit_page').find("[template-id='fiAddress'] li");
				var fiAddressList = data.fiAddressList;
				$.each(fiAddressList,function(i,n){
					var $fiAddressItemElement = $templateFiAddressItem.clone(true);
					dataBindToElement($fiAddressItemElement,n);

					$("#fiTaskDetailsEditPage_fiDemandList").append($fiAddressItemElement);
				});
				
				//绑定家访要求地址信息(带预约时间)
				var fiAddressList2 = data.fiAddressList2;
				$("#fiTaskDetailsEditPage_fiCustomerAddressList [liFor='fiCustomerAddress']").remove();
				var $templateFiAddress2Item = $('#fi_task_details_edit_page').find("[template-id='fiCustomerAddress'] li");
				$.each(fiAddressList2,function(i,n){
					var $fiAddress2ItemElement = $templateFiAddress2Item.clone(true);
					$fiAddress2ItemElement.find('input[identity="planTime"]').attr("id",n.fiCustomerAddressId);
					
					$fiAddress2ItemElement.attr("status","saved");
					dataBindToElement($fiAddress2ItemElement,n);

					$("#fiTaskDetailsEditPage_fiCustomerAddressList").append($fiAddress2ItemElement);
				});
				
				//绑定家访计划地址
				var appointmentAddressList2 = data.appointmentAddressList2;
				$("#fiTaskDetailsEditPage_fiFieldDetails [liFor='fiPlanAddress2']").remove();
				var $templateFiPlanAddress2Item = $('#fi_task_details_edit_page').find("[template-id='fiPlanAddress2'] li");
				$.each(appointmentAddressList2,function(i,n){
					var $fiPlanAddress2ItemElement = $templateFiPlanAddress2Item.clone(true);
					$fiPlanAddress2ItemElement.find('input[identity="planTime"]').attr("id",n.id);
					$fiPlanAddress2ItemElement.attr("status","saved");
					dataBindToElement($fiPlanAddress2ItemElement,n);

					$("#fiTaskDetailsEditPage_fiFieldDetails").append($fiPlanAddress2ItemElement);
				});
				
				fiTaskDetailsEdit_deleteAppointmentAddress();
				
				var now = new Date();
				
				$('#fi_task_details_edit_page [control="mobiDatetime"]').mobiscroll().datetime({
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

//查询任务的预约状态，如果已预约，则执行回调函数 callBack1,否则执行回调函数callBack2
function fiTaskDetailsEdit_getPlanStatus(fiTaskId,callBack1,callBack2){
	var postData ={};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	postData.fiTaskId = fiTaskId;
	
	$.getJSON(basePath+"/app/fiTaskDetailsEdit/getPlanTime.xhtml"+callback, postData,function(msg){
		
		if($.trim(msg.returnCode) == '0') {
			showHide();
			if(msg.data){
				
				var data = msg.data;
				
				var planTime = data.planTime;
				if(planTime){
					callBack1();
				}
				else{
					callBack2();
				}
			}//end if(msg.data){
		}
		else{
			errorHandler(msg.returnCode,msg.message);
		}
		
	});//end $.getJSON
}

//添加预约地址
function fiTaskDetailsEdit_addAppointmentAddress(){
	//校验非空
	var role = $("#fiTaskDetailsEdit-role").mobiscroll('getVal');
	if(!role){
		showMessage("角色不能为空！",1500);
		return;
	}
	var appointAddress = $("#fiTaskDetailsEdit-appointAddress").val();
	if(!appointAddress){
		showMessage("预约地址不能为空！",1500);
		return;
	}
	var appointDatetime = $("#fiTaskDetailsEdit-appointDatetime").val();
	if(!appointDatetime){
		showMessage("预约时间不能为空！",1500);
		return;
	}
	
	//绑定计划地址
	var planAddressObject = {};
	planAddressObject.fiRole = role;
	planAddressObject.planAddressType = "其它地址";
	planAddressObject.planAddress = appointAddress;
	planAddressObject.planTime = appointDatetime;
	
	var $templatePlanAddressItem = $('#fi_task_details_edit_page').find("[template-id='fiPlanAddress2'] li");
	var $planAddressItemElement = $templatePlanAddressItem.clone(true);
	
	$planAddressItemElement.attr("status","add");
	dataBindToElement($planAddressItemElement,planAddressObject);

	$("#fiTaskDetailsEditPage_fiFieldDetails").append($planAddressItemElement);
	$("#fiTaskDetailsEdit-appointAddress").val("");
	$("#fiTaskDetailsEdit-appointDatetime").val("")
	fiTaskDetailsEdit_deleteAppointmentAddress();
}

//删除预约地址
function fiTaskDetailsEdit_deleteAppointmentAddress(){

	$('#fiTaskDetailsEditPage_fiFieldDetails').mobiscroll().listview({
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
            			fiTaskDetailsEdit_deletedPlanAddress.push($(target).find("[identity='id']").text());
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
function fiTaskDetailsEdit_saveFiTaskDetails(){
	
	//获取任务类型，内容，描述，城市
	var postData = getDataFromElement($('#fiTaskDetailsEditPage_basicInfo'));
	
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	postData.taskId =  session.get("taskId");
	
	//获取家访要求地址列表(全部执行更新操作，在服务端进行业务处理)
	var fiCustomerAddressArray = [];
	var $fiCustomerAddressListElement = $("#fiTaskDetailsEditPage_fiCustomerAddressList").find("li[status!='saved']");
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
	var $unSavedAddressListElement = $("#fiTaskDetailsEditPage_fiFieldDetails").find("li[status!='saved']");
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
	postData.deletedPlanAddressArray =fiTaskDetailsEdit_deletedPlanAddress;
	
	//保存数据至服务器
	$.ajax({
		url: basePath+"/app/fiTaskDetailsEdit/saveFiTaskDetails.xhtml"+callback, //这个地址做了跨域处理
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
						load_fi_task_details_edit_content();
						
						showMessage("家访任务详情保存成功！！",2000);
						
					}
					else if(data.result == -1){
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
