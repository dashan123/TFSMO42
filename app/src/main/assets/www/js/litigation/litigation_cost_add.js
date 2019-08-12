  var litigation_cost_add_page = $("#litigation_cost_add_page");
  var litigation_cost_add_myScroll;
  
  litigation_cost_add_page.live("pageinit",function(e,ui){
	  
	  var wrapper = "litigation_cost_add_wrapper";  
//	  var up = "litigation_cost_add_pullUp";
//	  var down = "litigation_cost_add_pullDown";
//	  litigation_cost_add_myScroll = createMyScroll(wrapper, up, down);
	  litigation_cost_add_myScroll = createMyScroll(wrapper);
	  
	  //返回行车列表
	  litigation_cost_add_page.find(".BackBtn").live("tap",function(event){
		  event.stopPropagation();
          back_page();
	  });
	  
	  //点击保存
	  litigation_cost_add_page.find(".SaveBtn2").live("tap",function(){
			//提交诉讼费用，费用信息实时保存到CSS系统
			addLitigationCost();
	  });
	  
		//缴纳时间
		var $feeDate = $("#litigation_cost_add_page").find("[identity='feeDate']");
		$feeDate.mobiscroll().date({
		    theme: 'red',
		    lang: 'zh',
		    display: 'bottom',
		    onSet:function(event,inst){
		    	var editDate = event.valueText;
		    	var newEditDate = new Date(editDate);
		    	var editDateFormat = Format(newEditDate,"yyyy-MM-dd");
		    	$(this).val(editDateFormat);
		    }
		});
		
		//是否客户支付
		var $customerpayFlag= $("#litigation_cost_add_page").find("[identity='customerpayFlag']");
		$customerpayFlag.mobiscroll().select({
	        theme: 'red',
	        lang: 'zh',
	        display: 'bottom',
	        minWidth: 200
		});
		
		//有无发票数据初始化
		var $invoiceFlag = $("#litigation_cost_add_page").find("[identity='invoiceFlag']");
		$invoiceFlag.mobiscroll().select({
	        theme: 'red',
	        lang: 'zh',
	        display: 'bottom',
	        minWidth: 200
		});
	  
  });
          
  litigation_cost_add_page.live("pageshow",function(e,ui){
	  
	  currentLoadActionName = "litigation_cost_add_load_content"
	  load_litigation_cost_add_content();

  });
          
  function litigation_cost_add_load_content(){
	  
  }
  
  function load_litigation_cost_add_content(){
		
		showLoading();
		var $currentPage = $("#litigation_cost_add_page");
		$currentPage.find("[identity='lawsuitfeetypeCn']").mobiscroll('setVal','',true);
		$currentPage.find("input[identity='feeAmount']").val("");
		$currentPage.find("input[identity='feeDate']").val("");
		$currentPage.find("[identity='customerpayFlag']").mobiscroll('setVal','Y',true);
		$currentPage.find("[identity='invoiceFlag']").mobiscroll('setVal','Y',true);
		
		var postData = {};
		postData.random = new Date();
		postData.userCode = session.get("userCode");
		$.getJSON(basePath+"/app/litigationCostAdd/pageInit.xhtml"+callback, postData,function(msg){
			if($.trim(msg.returnCode) == '0'){
				var data = msg.data;
				if(data != null){
					//诉讼费用类型
					var $lawsuitfeetypeCn = $("#litigation_cost_add_page").find("[identity='lawsuitfeetypeCn']");
					$lawsuitfeetypeCn.empty();
					$lawsuitfeetypeCn.append('<option value="">请选择</option>');
					$.each(data,function(i,n){
						var templateItem = '<option value="'+n.code+'">'+n.name+'</option>';
						$lawsuitfeetypeCn.append(templateItem);
					});
					$lawsuitfeetypeCn.mobiscroll().select({
				        theme: 'red',
				        lang: 'zh',
				        display: 'bottom',
				        minWidth: 200
				  });
				}
			
				showHide();
			}
			else{
	        	showHide();
	        	errorHandler(msg.returnCode,msg.message);
	        }
			
		});//end $.getJSON
  }
  
  //提交诉讼费用，费用信息实时保存到CSS系统
  function addLitigationCost(){
	  
	  var page = $('#litigation_cost_add_page');
 	   var authData = {};
 	   //诉讼id
 	   var lawsuitCaseId = session.get("lawsuitCaseId");
 	   if(lawsuitCaseId == null || lawsuitCaseId == ""){
		  showMessage('诉讼ID不存在，不能提交费用信息！','3000');
		  return false;
 	   }
 	   authData.lawsuitCaseId = lawsuitCaseId;
 	   //合同号
 	   var contractNo = session.get("contractNo");
 	   if(contractNo == null || contractNo == ""){
		  showMessage('合同号不存在，不能提交费用信息！','3000');
		  return false;
	   }
 	   authData.contractNo = contractNo;
 	   //案件id
 	   var caseId = session.get("caseId");
 	   if(caseId == null || caseId == ""){
		  showMessage('案件ID不存在，不能提交费用信息！','3000');
		  return false;
	   }
 	   authData.caseId = caseId;
 	   //费用类型
 	   authData.lawsuitfeetypeCn=page.find("[identity='lawsuitfeetypeCn']").val();
 	   if(authData.lawsuitfeetypeCn == null || authData.lawsuitfeetypeCn == ""){
		  showMessage('请选择费用类型！','3000');
		  return false;
	   }
 	   //金额
 	   authData.feeAmount=page.find("input[identity='feeAmount']").val();
 	  if(authData.feeAmount == null || authData.feeAmount == ""){
		  showMessage('请填写金额！','3000');
		  return false;
	   }
 	   //缴纳时间
 	   authData.feeDate=page.find("input[identity='feeDate']").val();
 	  if(authData.feeDate == null || authData.feeDate == ""){
		  showMessage('请选择缴纳时间！','3000');
		  return false;
	   }
 	 	//是否客户支付
 	   authData.customerpayFlag=page.find("[identity='customerpayFlag']").val();
 	   //有无发票
 	   authData.invoiceFlag=page.find("[identity='invoiceFlag']").val();  
 	   //录入人
// 	   authData.userNameCn=page.find("input[identity='userNameCn']").val();  
 	   authData.userNameCn=session.get("userCode");
 	   authData.userId = session.get("userId");
 	   //录入时间
 	   var currentDatetime = new Date().Format("yyyy-MM-dd HH:mm:ss");
 	   authData.enterTime=currentDatetime;  
 	  
	  showConfirm("请确认是否提交数据", function(){
		  showLoading();
		 $.getJSON(basePath+"/app/litigationCostAdd/addLitigationCost.xhtml"+callback,authData,function(msg){
   		   if($.trim(msg.returnCode) == '0'){
   			   
   			   showMessage(msg.message,'5000');
   			   if(msg.data == 0){
   				 setTimeout(function(){back_page();},3000);
   			   }
   		   }else{
				showHide();
	            errorHandler(msg.returnCode,msg.message);
		    }
		 });
	  });
  }
        