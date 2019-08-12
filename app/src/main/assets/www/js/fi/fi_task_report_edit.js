var fi_task_report_edit_page = $('#fi_task_report_edit_page');

//var collectingAddressListPageHandler ={};

var fi_task_report_edit_myScroll;
/******************************home_page---begin**************************************/
fi_task_report_edit_page.live('pageinit',function(e,ui){
	
	var wrapper = "fi_task_report_edit_wrapper";
	var up = "fi_task_report_edit_pullUp";
	var down = "fi_task_report_edit_pullDown";
	fi_task_report_edit_myScroll = createMyScroll(wrapper,up,down);
//	//scroll位置
//	var scrollMapJSON = {};
//	scrollMapJSON.organizationid = organizationid;
//	scrollMap.contacts_dept_page = JSON.stringify(scrollMapJSON);
	//回退事件处理
	fi_task_report_edit_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
//		back_page('workbench_page');
		back_page();
	});
	//点击展开/关闭列表
	fi_task_report_edit_page.find("h2.ListTit:lt(2)").live("tap",function(e){
		var $contentElement = $(this).next("ul");
		if($contentElement.is(":visible")){
			$contentElement.hide();
			var $arrowElement = $(this).children("em");
			$arrowElement.removeClass("arrow-up");
			$arrowElement.addClass("arrow-down");
		}
		else{
			$contentElement.show();
			var $arrowElement = $(this).children("em");
			$arrowElement.removeClass("arrow-down");
			$arrowElement.addClass("arrow-up");
		}
	});
	//保存
  fi_task_report_edit_page.find(".SaveBtn1").live('tap',function(){
	  var fiRole = $('#fiTaskReportEdit-reportDetails .segmentedButtonGroup input.segmentedButtons3Selected').val();
	  
	  var fiDetails = $("#fiTaskReportEdit-reportDetails").find("[identity='fiDetails']").val();
	  if($.trim(fiDetails) ===""){
		  showMessage("FI调查情况陈述不能为空!!",2000);
		  return;
	  }
	  
	  showConfirmDialog("您确定要保存"+fiRole+"的家访报告吗？",fiRole, fiTaskReportEdit_saveFiTaskReport);
  });
  
  //初始化页面的几个下拉列表
  fiTaskReportEdit_initPageSelect();

 $('#fiTaskReportEdit-submitFiReport').mobiscroll().widget({
     theme: 'red',
     lang: 'zh',
     display: 'bottom',
//     anchor: $('#show'),
     buttons: [{
         text: '',
         handler: 'set',
         cssClass: 'hideBtn'
     }, {
         text: '',
         handler: 'cancel',
         cssClass: 'hideBtn'
     }],
     onBeforeShow: function (event, inst) {
    	 $("#fiTaskReportEdit-submitType").find("input[type='button']").one("click",function(){

    		 $(this).attr("class","segmentedButtons1Selected");
    		 $(this).siblings().attr("class","segmentedButtons1Unselected");
    		  var submitType = $(this).val();
    		  if(submitType === "取消"){
    			  
    			  $('#fiTaskReportEdit-submitFiReport').mobiscroll('hide');
    			  submitType = "QX";
    			  goto_page("fi_task_report_edit01_page");
    		  }
    		  else{
    			  if(submitType === "正常"){
    				  submitType="ZC";
    			  }
    			  else if(submitType === "打回"){
    				  submitType="DH";
    			  }
    			  
    			  $('#fiTaskReportEdit-submitFiReport').mobiscroll('hide');
    			  fiTaskReportEdit_submitFiTaskReport(submitType,""); 
    			  
    		  }
    		  
    	  });
    	 
     },
     onInit: function (event, inst) {
     },
     onSet:function(event, inst){},
     onCancel: function (event, inst) {}
 });
  
  	//提交
  	fi_task_report_edit_page.find(".SaveBtn2").live('tap',function(){
  		
  		$('#fiTaskReportEdit-submitFiReport').mobiscroll('show');
	    return false;
	});
  
  	//角色切换事件
	$("#fiTaskReportEdit-reportDetails").find(".segmentedButtonGroup input").live("tap",function(event){
		$(this).attr("class","segmentedButtons3Selected");
		$(this).siblings().attr("class","segmentedButtons3Unselected");
		load_fi_task_report_edit_content();
	});

	//跳转至任务详情
	$("ul[tag='fi_task_report_edit_bottom'] li:first").live("tap",function(){
		//传递家访任务Id
		var taskId = session.get("fiTaskId");
		session.set("taskId",taskId);
		var $toPage = $(this).attr("toPage");
		goto_page($toPage);
	});
	
	//跳转至拍照页面
	$("ul[tag='fi_task_report_edit_bottom'] li:last").live("tap",function(){
		//传递家访报告Id
		var fiReportId = $('#fiTaskReportEdit-reportDetails').find("[identity='fiReportId']").val();
		if(fiReportId){
			
			session.set("businessId",fiReportId);
			var businessType = ConstDef.getConstant("BUSINESS_CATEGORY_FI");
			session.set("businessType",businessType);
			
			var $toPage = $(this).attr("toPage");
			goto_page($toPage);
		}
		else{
			showMessage("当前家访角色没有家访报告，请先添加家访报告！！");
		}
		
	});
	
	fi_task_report_edit_page.find("[identity='fiDetails']").on("input propertychange blur",function(){
		  var fiDetailsVal = $(this).val();
		  var fiDetailsMaxlen = $(this).attr("maxlength");
		  if(fiDetailsMaxlen > 0 && fiDetailsVal.length > fiDetailsMaxlen){
			$(this).val(fiDetailsVal.substring(0,fiDetailsMaxlen));
	        showMessage("FI调查情况陈述长度超过最大长度！",3000);
	        return;
		  }
	  })
});//end pageinit

fi_task_report_edit_page.live('pageshow',function(e, ui){

	currentLoadActionName  = "fi_task_report_edit_load_content";
	load_fi_task_report_edit_content();

});//end pageshow

function fi_task_report_edit_load_content(){
	//下拉不刷新，则该方法置空
}
//加载页面初始化数据，并显示
function load_fi_task_report_edit_content(){
	
	$('#fiTaskReportEdit-reportDetails').find("[identity]").val("");
	showLoading();
	var postData ={};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	postData.fiTaskId = session.get("fiTaskId");//获取家访任务Id
	postData.fiRole = $('#fiTaskReportEdit-reportDetails .segmentedButtonGroup input.segmentedButtons3Selected').val();
	
	$.getJSON(basePath+"/app/fiTaskReportEdit/pageInit.xhtml"+callback, postData,function(msg){
		
		if($.trim(msg.returnCode) == '0') {
			showHide();
			if(msg.data){
				
				var data = msg.data;
				
				var $reportDetails = $("#fiTaskReportEdit-reportDetails");
				var fiReport = data.report;
				if(fiReport){
					dataBindToElement($reportDetails,fiReport);
					$("#fiTaskReportEditPage-nowVehicleBuyYear").mobiscroll('setVal', fiReport.nowVehicleBuyYear,true);
					$("#fiTaskReportEditPage-otherVehicleBuyYear").mobiscroll('setVal', fiReport.otherVehicleBuyYear,true);
					$("#fiTaskReportEditPage-nowVehicleLoanBuyDesc").mobiscroll("setVal",fiReport.nowVehicleLoanBuyDesc,true);
					$("#fiTaskReportEditPage-customerCooperationDesc").mobiscroll("setVal",fiReport.customerCooperationDesc,true);
				}
				else{
					var reportBasic = data.reportBasic;
					dataBindToElement($reportDetails,reportBasic);
					$reportDetails.find("[identity='name']").text(session.get("userName"));
					//初始化页面的几个下拉列表
					fiTaskReportEdit_initPageSelect();
				}

				//绑定实地地址
				$("#fiTaskReportEdit-fieldAddressList").empty();
				$.each(data.realAddress,function(i,n){
					
					var html = '<li><label for="">'+n.planAddressType+':</label><span style="display:inline-block;padding-right:10px;">'+(n?n.arrivalAddress:"")+'</span></li>';
					$("#fiTaskReportEdit-fieldAddressList").append(html);
					
				});
			}//end if(msg.data){
		}
		else{
			errorHandler(msg.returnCode,msg.message);
		}
		
	});//end $.getJSON
}

function fiTaskReportEdit_initPageSelect(){
	//初始化购买使用时间
	var now = new Date();
	var htmlOption = "";
	for(var i=0;i<20;i++){
		var year = now.getFullYear()-i;
		if(i===2){
			htmlOption += '<option selected value='+year+'>'+year+'</option>';
		}
		else{
			htmlOption += '<option value='+year+'>'+year+'</option>';
		}
	}
	$("#fiTaskReportEditPage-nowVehicleBuyYear").empty();
	$("#fiTaskReportEditPage-nowVehicleBuyYear").append(htmlOption);
	$("#fiTaskReportEditPage-nowVehicleBuyYear").mobiscroll().select({
        theme: 'red',
        lang: 'zh',
        display: 'bottom',
        minWidth: 200
    });
	
	$("#fiTaskReportEditPage-otherVehicleBuyYear").empty();
	$("#fiTaskReportEditPage-otherVehicleBuyYear").append(htmlOption);
	$("#fiTaskReportEditPage-otherVehicleBuyYear").mobiscroll().select({
        theme: 'red',
        lang: 'zh',
        display: 'bottom',
        minWidth: 200
    });
	//是否贷款购买
	var htmlOption4nowVehicleLoanBuyDesc = '<option value="是/已还清">是/已还清</option>'
	+'<option value="是/未还清" selected>是/未还清</option>'
	+'<option value="全款">全款</option>';
	$("#fiTaskReportEditPage-nowVehicleLoanBuyDesc").html(htmlOption4nowVehicleLoanBuyDesc);
	$("#fiTaskReportEditPage-nowVehicleLoanBuyDesc").mobiscroll().select({
	        theme: 'red',
	        lang: 'zh',
	        display: 'bottom',
	        minWidth: 200
	    });
	
	//客户配合度
	var htmlOption4customerCooperationDesc = '<option value="A.非常配合">A.非常配合</option>'
		+'<option value="B.比较配合" selected>B.比较配合</option>'
		+'<option value="C.一般">C.一般</option>'
		+'<option value="D.不配合">D.不配合</option>'
		+'<option value="E.极不配合">E.极不配合</option>';
	$("#fiTaskReportEditPage-customerCooperationDesc").html(htmlOption4customerCooperationDesc);
	$("#fiTaskReportEditPage-customerCooperationDesc").mobiscroll().select({
	        theme: 'red',
	        lang: 'zh',
	        display: 'bottom',
	        minWidth: 200
	    });
	
}

function fiTaskReportEdit_saveFiTaskReport(fiRole){
	var postData = getDataFromElement($('#fiTaskReportEdit-reportDetails'));
	
	var fiDetailsObj = $("#fi_task_report_edit_page").find("[identity='fiDetails']");
	var maxlen = fiDetailsObj.attr("maxlength");
	if(maxlen > 0 && postData.fiDetails.length > maxlen){
		fiDetailsObj.val(postData.fiDetails.substring(0,maxlen));
        showMessage("FI调查情况陈述长度超过最大长度！",3000);
        return;
	}
	
	postData.customerCooperationDesc = $("#fiTaskReportEditPage-customerCooperationDesc").mobiscroll('getVal');
	
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	postData.fiTaskId = session.get("fiTaskId");//获取家访任务Id
	postData.fiRole = fiRole;
	
/*	$.getJSON(basePath+"/app/fiTaskReportEdit/saveFiTaskReport.xhtml"+callback, postData,function(msg){
		
		if($.trim(msg.returnCode) == '0') {
			showHide();
			if(msg.data){
				
				var data = msg.data;
				
				var result = data.result;
				if(result >= 0){
					
					load_fi_task_report_edit_content();
					setTimeout(function(){
						showMessage("家访报告保存成功！！",2000);
					}, 1500);
					
				}
				else if(result == -1){
					showMessage("家访任务尚未开始与结束,不能保存家访报告！！",2000);
				}
				else{
					showMessage("家访报告保存失败！！",2000);
				}
				
			}//end if(msg.data){
		}
		else{
			errorHandler(msg.returnCode,msg.message);
		}
		
	});//end $.getJSON
*/	
	
	$.ajax({
		url: basePath+"/app/fiTaskReportEdit/saveFiTaskReport.xhtml",
		data: postData,
		type: 'POST',
		dataType: 'json',
		async:true,
		beforeSend: function () {
			showLoading();
		},
		success: function (msg) {
			if($.trim(msg.returnCode) == '0') {
				showHide();
				if(msg.data){
					
					var data = msg.data;
					
					var result = data.result;
					if(result >= 0){
						
						load_fi_task_report_edit_content();
						setTimeout(function(){
							showMessage("家访报告保存成功！！",2000);
						}, 1500);
						
					}
					else if(result == -1){
						showMessage("家访任务尚未开始与结束,不能保存家访报告！！",2000);
					}
					else{
						showMessage("家访报告保存失败！！",2000);
					}
					
				}//end if(msg.data){
			}
			else{
				errorHandler(msg.returnCode,msg.message);
			}
		},
		complete: function() {

		}
	});//end $.ajax
}

function fiTaskReportEdit_submitFiTaskReport(submitType,cancelReason){
	var postData = getDataFromElement($('#fiTaskReportEdit-reportDetails'));
	console.log("提交家访任务(家访报告)");
	
	var fiDetailsObj = $("#fi_task_report_edit_page").find("[identity='fiDetails']");
	var maxlen = fiDetailsObj.attr("maxlength");
	if(maxlen > 0 && postData.fiDetails.length > maxlen){
		fiDetailsObj.val(postData.fiDetails.substring(0,maxlen));
        showMessage("FI调查情况陈述长度超过最大长度！",3000);
        return;
	}
	
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	postData.fiTaskId = session.get("fiTaskId");//获取家访任务Id
	postData.submitType = submitType;
	postData.cancelReason = cancelReason;
	
	/*$.getJSON(basePath+"/app/fiTaskReportEdit/submitFiTaskReport.xhtml"+callback, postData,function(msg){
		
		if($.trim(msg.returnCode) == '0') {
			showHide();
			if(msg.data){
				
				var data = msg.data;
				
				var result = data.result;
				if(result > 0){
					showMessage("家访报告提交成功！！",1500);
					
					setTimeout(function(){
						back_page();
					}, 1500);
				}
				else if(result == -1){
					showMessage("家访任务已完成，不允许再次提交！！",2000);
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
					showMessage("当前任务有正在进行中的计划地址，不允许提交！！",2000);
				}
				else{
					showMessage("家访报告提交失败！！",2000);
				}
				
			}//end if(msg.data){
		}
		else{
			errorHandler(msg.returnCode,msg.message);
		}
		
	});//end $.getJSON
*/	
	
	$.ajax({
		url: basePath+"/app/fiTaskReportEdit/submitFiTaskReport.xhtml",
		data: postData,
		type: 'POST',
		dataType: 'json',
		async:true,
		beforeSend: function () {
			showLoading();
		},
		success: function (msg) {
			if($.trim(msg.returnCode) == '0') {
				showHide();
				if(msg.data){
					
					var data = msg.data;
					
					var result = data.result;
					if(result > 0){
						showMessage("家访报告提交成功！！",1500);
						
						setTimeout(function(){
							back_page();
						}, 1500);
					}
					else if(result == -1){
						showMessage("家访任务已完成，不允许再次提交！！",3000);
					}
					else if(result == -2){
						showMessage("预约日期，完成日期任意一个为空，家访类型不是skip fi的，不可以提交！！",5000);
					}
					else if(result == -3){
						showMessage("提交类型为正常时，家访结束时间不能为空，请检查是否已开始并结束家访！！",5000);
					}
					else if(result == -4){
						showMessage("提交类型为正常时，必须要有家访报告，请检查是否已保存家访报告！！",5000);
					}
					else if(result == -5){
						showMessage("当前任务有正在进行中的计划地址，不允许提交！！",5000);
					}
					else{
						showMessage("家访报告提交失败！！",2000);
					}
					
				}//end if(msg.data){
			}
			else{
				errorHandler(msg.returnCode,msg.message);
			}
		},
		complete: function() {

		}
	});//end $.ajax
}