/******************************audit_electronic_signature_page---begin**************************************/
var audit_electronic_signature_page = $('#audit_electronic_signature_page');
var audit_electronic_signature_myScroll;

audit_electronic_signature_page.live('pageinit',function(e, ui){
	var wrapper = "audit_electronic_signature_wrapper";
	audit_electronic_signature_myScroll = createMyScroll(wrapper);

	audit_electronic_signature_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page();
	});
	
	audit_electronic_signature_page.find(".detailDiv p a").live("tap",function(event){
		var CarType = $(this).attr("id");
		session.set("CarType",CarType);
		goto_page("audit_electronic_signature_car_list_page");
	});
	
	audit_electronic_signature_page.find("#stocktaker").live("tap",function(){
		var chargeFlag = session.get("charge_flag");	//1:表示不收费;2:表示收费
		var userFlag = session.get("userFlag");			//0:该人员属于本公司;1:该人员属于外包公司
		var auditCheckListId = session.get("auditCheckListId");//清单ID
		var functionFlag = "";		//1:自拍照片;2:收费确认书;3:合格证报告/信息收集表
		var message = "";		//不满足盘点条件时提示信息
		var submitStatus = session.get("submitStatus");
		if(submitStatus=='3' || submitStatus=='4'){
			showMessage("已完成盘点员签章,不可重复操作!", '3000');
			return;
		}
		if(submitStatus == '1'){
			if(chargeFlag != '2' && userFlag == '1' || chargeFlag != '2' && userFlag != '1'){
				functionFlag = "3";
				message = "<p style='text-align:center;font-size:15px;'>电子签章声明</p>" +
						"<p>1.本人特此声明，在本次执行经销商库存盘点业务时，已严格按照丰田汽车金融（中国）有限公司所提供《第三方巡库操作手册》中规定的政策及流程操作。</p>" +
						"<p style='padding-bottom: 20px'>2.本人承诺此次经销商库存盘点结果是真实可信，不存在知情不报、欺诈隐瞒事实的情况，任何因本人违反对《第三方巡库操作手册》中规定而导致的任何法律责任由本人承担。</p>"+
						"合格证报告/信息收集表未提交，是否继续签章";
				audit_electronic_signature_stocktakerSignature(functionFlag,message);
			}
			if(chargeFlag == '2' && userFlag != '1' || chargeFlag == '2' && userFlag == '1'){
				functionFlag = "0";
				message = "<p style='text-align:center;font-size:15px;'>电子签章声明</p>" +
				"<p>1.本人特此声明，在本次执行经销商库存盘点业务时，已严格按照丰田汽车金融（中国）有限公司所提供《第三方巡库操作手册》中规定的政策及流程操作。</p>" +
				"<p style='padding-bottom: 20px'>2.本人承诺此次经销商库存盘点结果是真实可信，不存在知情不报、欺诈隐瞒事实的情况，任何因本人违反对《第三方巡库操作手册》中规定而导致的任何法律责任由本人承担。</p>"+
				"收费确认书及合格证报告/信息收集表未全部提交，是否继续签章";
				audit_electronic_signature_stocktakerSignature(functionFlag,message);
			}
		}else{
			showMessage("请提交盘库报告!", '3000');
		}
		
	});
	
	$('#distributor-signature').mobiscroll().widget({
        theme: 'red',
        lang: 'zh',
        display: 'bottom',
//	        anchor: $('#show'),
        buttons: [{
            text: '确定',
            handler: 'set'
        }, {
            text: '取消',
            handler: 'cancel'
        }],
        onSet:function(event, inst){
        	var userName = $("#dealer_userName").val();
  		  	var pwd = $("#dealer_pwd").val();
        	if(userName!="" && pwd!=""){
        		var i = userName.indexOf(".");
        		var dealerCode = userName.substring(0,i);
        		var code = session.get("auditListDealerCode");
        		if(dealerCode.toUpperCase() == code.toUpperCase()){
        			//提交用户名密码
          		  	audit_electronic_signature_distributorSignature(userName,pwd);
          		  	$("#distributor-signature .md-dialog input").val("");
        		}else{
        			var postData = {};
        			postData.random = new Date();
        			postData.dealerCode = dealerCode;
        			postData.dealerName = session.get("dealerName");
        			postData.code = code;
        			$.getJSON(basePath+"/app/auditElectronicSignature/QueryDistributor.xhtml"+callback,postData, function(msg){
        				if(msg.data>0){
        					
        					audit_electronic_signature_distributorSignature(userName,pwd);
                  		  	$("#distributor-signature .md-dialog input").val("");
        				}else{
        					showMessage("用户名或密码错误,签章失败!", '3000');
        				}
        			})
        		}
        	}else{
        		showMessage("用户名和密码不能为空!", '3000');
        	}
        	
        },
        onCancel: function (event, inst) {
//	        	debugger;
        }
    });
	
	audit_electronic_signature_page.find("#distributor").live("tap",function(){
		
		//先进行判断，盘点员签章成功之后才能进行财务经理签章
		var submitStatus = session.get("submitStatus");
		if(submitStatus == '3'){
			$('#distributor-signature').mobiscroll('show');
		}else if(submitStatus == '4'){
			showMessage("已完成经销商签章，不可重复操作", '3000');
		}else{
			showMessage("请先进行盘点员签章!", '3000');
		}
	});
	
});

audit_electronic_signature_page.live('pageshow',function(e, ui){
	
	currentLoadActionName = "audit_electronic_signature_load_content";
	load_audit_electronic_signature_content();
	
});

function audit_electronic_signature_load_content(){
	//下拉不刷新，则该方法置空
}

//加载详细，并显示
function load_audit_electronic_signature_content(){
	showLoading();
	var currentPage = $("#audit_electronic_signature_page");

	var postData = {};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.auditCheckListId = session.get("auditCheckListId");
//	var auditCheckListId = session.get("auditCheckListId");

	$.getJSON(basePath+"/app/auditElectronicSignature/pageInit.xhtml"+callback,postData,function(msg){

		showHide();

		if($.trim(msg.returnCode) == '0'){
			if(msg.data !=null){
				
				var data = msg.data.auditReportList;
				
				currentPage.find(".detailDiv span[identity]").text("");
				$.each(data,function(i,n){
					//合计台数
					currentPage.find(".detailDiv span[identity='totalNumber']").text(n.total);
					//在库车辆台数
					currentPage.find(".detailDiv span[identity='storageVehiclesNumber']").text(n.none);
					//在途车辆台数
					currentPage.find(".detailDiv span[identity='onthewayVehiclesNumber']").text(n.otw);
					//车辆销售台数
					currentPage.find(".detailDiv span[identity='soldVehiclesNumber']").text(n.sold);
					//车辆互抵台数
					currentPage.find(".detailDiv span[identity='offsetVehiclesNumber']").text(n.offset);
					//SOT车辆台数
					currentPage.find(".detailDiv span[identity='SOTVehiclesNumber']").text(n.sot);
				})
			}else{
				showHide();
			}
		}
		else{
			errorHandler(msg.returnCode,msg.message);
		}
	});//end $.getJSON
};

function audit_electronic_signature_stocktakerSignature(functionFlag,message){
	
	var auditCheckListId = session.get("auditCheckListId");//清单ID
	var postInfo = {};
	postInfo.random = new Date();
	postInfo.userCode = session.get("userCode");
	postInfo.auditCheckListId = session.get("auditCheckListId");
	postInfo.functionFlag = functionFlag;
	
	$.getJSON(basePath+"/app/auditElectronicSignature/selectFileByFunctionFlag.xhtml"+callback,postInfo,function(msg){
		if(functionFlag == '0'){
			if(msg.data>=2){
				var info = "<p style='text-align:center;font-size:15px;'>电子签章声明</p>" +
				"<p>1.本人特此声明，在本次执行经销商库存盘点业务时，已严格按照丰田汽车金融（中国）有限公司所提供《第三方巡库操作手册》中规定的政策及流程操作。</p>" +
				"<p style='padding-bottom: 20px'>2.本人承诺此次经销商库存盘点结果是真实可信，不存在知情不报、欺诈隐瞒事实的情况，任何因本人违反对《第三方巡库操作手册》中规定而导致的任何法律责任由本人承担。</p>"+
				"是否进行盘点员签章";
				showLongPromptMsg("【盘点员签章】",info,function(){
					//进行签章，修改状态
					var postData = {};
					postData.random = new Date();
					postData.userCode = session.get("userCode");
					postData.userName = session.get("userName");
					postData.auditCheckListId = session.get("auditCheckListId");
					
					$.getJSON(basePath+"/app/auditElectronicSignature/updateSubmitStatusById.xhtml"+callback,postData,function(msg){
						showHide();
						if(msg.data>0){
							session.remove("submitStatus");
							session.set("submitStatus","3");
							showMessage("盘点员签章成功", '3000');
						}
					})
				});
			}else{
				showConfirmSignature("【盘点员签章】",message, function(){
					var postData = {};
					postData.random = new Date();
					postData.userName = session.get("userName");
					postData.userCode = session.get("userCode");
					postData.auditCheckListId = session.get("auditCheckListId");
					
					$.getJSON(basePath+"/app/auditElectronicSignature/updateSubmitStatusById.xhtml"+callback,postData,function(msg){
						showHide();
						if(msg.data>0){
							session.remove("submitStatus");
							session.set("submitStatus","3");
							showMessage("盘点员签章成功", '3000');
						}
					})
				});
			}
		}else{
			if(msg.data>0){
				var info = "<p style='text-align:center;font-size:15px;'>电子签章声明</p>" +
				"<p>1.本人特此声明，在本次执行经销商库存盘点业务时，已严格按照丰田汽车金融（中国）有限公司所提供《第三方巡库操作手册》中规定的政策及流程操作。</p>" +
				"<p style='padding-bottom: 20px'>2.本人承诺此次经销商库存盘点结果是真实可信，不存在知情不报、欺诈隐瞒事实的情况，任何因本人违反对《第三方巡库操作手册》中规定而导致的任何法律责任由本人承担。</p>"+
				"是否进行盘点员签章";
				//提示框提示
				showLongPromptMsg("【盘点员签章】",info,function(){
					//进行签章，修改状态
					var postData = {};
					postData.random = new Date();
					postData.userCode = session.get("userCode");
					postData.userName = session.get("userName");
					postData.auditCheckListId = session.get("auditCheckListId");
					$.getJSON(basePath+"/app/auditElectronicSignature/updateSubmitStatusById.xhtml"+callback,postData,function(msg){
						showHide();
						if(msg.data>0){
							session.remove("submitStatus");
							session.set("submitStatus","3");
							showMessage("盘点员签章成功", '3000');
						}
					})
				});
			}else{
				showConfirmSignature("【盘点员签章】",message, function(){
					var postData = {};
					postData.random = new Date();
					postData.userCode = session.get("userCode");
					postData.userName = session.get("userName");
					postData.auditCheckListId = session.get("auditCheckListId");
					
					$.getJSON(basePath+"/app/auditElectronicSignature/updateSubmitStatusById.xhtml"+callback,postData,function(msg){
						showHide();
						if(msg.data>0){
							session.remove("submitStatus");
							session.set("submitStatus","3");
							showMessage("盘点员签章成功", '3000');
						}
					})
				});
			}
		}
	})
}

//将用户名和密码提交后台，进行验证，成功则调用接口获取邮箱
function audit_electronic_signature_distributorSignature(userName,pwd){
	
	var postData = {};
	postData.random = new Date();
	postData.userName = userName;
	postData.pwd = pwd;
	
	//验证用户名密码是否正确，如果正确则获取邮箱和姓名
	$.getJSON(basePath+"/app/auditElectronicSignature/distributorVerification.xhtml"+callback,postData,function(msg){
		if(msg.data.result==0){
			var mail = msg.data.email;
			var dealerName = msg.data.dealerName;
			var postInfo = {};
			postInfo.random = new Date();
			postInfo.userCode = session.get("userCode");
			postInfo.dealerCode = session.get("auditListDealerCode");
			postInfo.useSameTaskIdFlag = session.get("useSameTaskIdFlag");
			postInfo.auditPlanDayId = session.get("auditPlanDayId");
			postInfo.auditCheckListId = session.get("auditCheckListId");
			postInfo.dealerName = dealerName;
			
			if(mail != null || mail != ""){
				//签章修改盘库清单状态并发送邮件至财务经理邮箱
				$.getJSON(basePath+"/app/auditElectronicSignature/updateDistributorById.xhtml"+callback,postInfo,function(msg){
					showHide();
					if($.trim(msg.returnCode) == '0') {
						//任务状态(0.未办 1.已办 2.跳过 3.进行中 )
			    		var returntaskStatus = msg.data.returntaskStatus;
			    		session.remove("taskStatus");
			    		session.set("taskStatus",returntaskStatus);
						showMessage(msg.message,'2000');
						session.remove("submitStatus");
						session.set("submitStatus","4");
						session.set("dealerSignature",userName);
						audit_electronic_signature_exportAuditReportPDF(mail,dealerName);
					}
					else{
						errorHandler(msg.returnCode,msg.message);
					}
				});
			}else{
				showMessage("邮箱为空，签章失败!",'3000');
			}
		}else{
			showMessage("用户名或密码错误，签章失败",'3000');
		}
	});
}

/**
 * 生成PDF格式盘点报告发送到财务经理邮箱
 */
function audit_electronic_signature_exportAuditReportPDF(email,dealerName){
	var postData = {};
	postData.random = new Date();
	postData.userName = session.get("userName");
	postData.userCode = session.get("userCode");
	postData.planDayId = session.get("auditPlanDayId");
	postData.dealerCode = session.get("auditListDealerCode");
	postData.type = session.get("taskType");
	postData.userId = session.get("userId");
	postData.date = session.get("auditPlanDate");
	postData.abbreviation = session.get("dealerAbbreviation");
	postData.storehouseAddress = session.get("storehouseAddress");
	postData.storehouseId = session.get("auditList_storehouseId");
	postData.dealerSignature = dealerName;
	postData.mail = email;
	
	$.getJSON(basePath+"/app/auditElectronicSignature/exportAuditReportPDFApp.xhtml"+callback,postData, function(msg){
		if($.trim(msg.returnCode) == "0"){
			showMessage(msg.message);
//			window.location.href = ctx+"/downloadFile?filePath="+msg.data.path+"&fileName="+msg.data.AuditReportFileName;
		}else{
			alert(msg.message);
			auditReportInquiryPage();
		}
	});
}


/******************************audit_electronic_signature_page---end**************************************/