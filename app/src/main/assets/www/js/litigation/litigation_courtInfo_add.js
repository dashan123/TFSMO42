  var litigation_courtInfo_add_page = $("#litigation_courtInfo_add_page");
  var litigation_courtInfo_add_myScroll;
  litigation_courtInfo_add_page.live("pageinit",function(e,ui){
	    var wrapper = "litigation_courtInfo_add_wrapper";  
//		var up = "litigation_courtInfo_add_pullUp";
//		var down = "litigation_courtInfo_add_pullDown";
//		litigation_courtInfo_add_myScroll = createMyScroll(wrapper, up, down);
	    litigation_courtInfo_add_myScroll = createMyScroll(wrapper);
	    
	  //返回行车列表
	  litigation_courtInfo_add_page.find(".BackBtn").live("tap",function(event){
		  event.stopPropagation();
          back_page();
	  });
	  
	  //点击提交，提交诉讼法院信息，实时保存到CSS系统
	  litigation_courtInfo_add_page.find(".SaveBtn2").live("tap",function(){
		  
		  addLitigationCourtInfo();
	  });
	  
  });
          
  litigation_courtInfo_add_page.live("pageshow",function(e,ui){
	  
	  currentLoadActionName = "litigation_courtInfo_add_load_content"
	
	  var fromPage = session.get("fromPage");
      load_litigation_courtInfo_add_content();
  });
          
  function litigation_courtInfo_add_load_content(){
	  
  }
   
  function load_litigation_courtInfo_add_content(){
	  	var $currentPage = $("#litigation_courtInfo_add_page");
	  	
		showLoading();
		$currentPage.find("input[identity]").val("");
		$currentPage.find("[identity='courtType']").mobiscroll('setVal','',true);
		
		var postData = {};
		postData.random = new Date();
		postData.userCode = session.get("userCode");
		$.getJSON(basePath+"/app/litigationCourtInfoAdd/pageInit.xhtml"+callback, postData,function(msg){
			if($.trim(msg.returnCode) == '0'){
				var data = msg.data;
				if(data != null){
					//法院类型
					var $courtType = $currentPage.find("[identity='courtType']");
					$courtType.empty();
					$courtType.append('<option value="">请选择</option>');
					$.each(data,function(i,n){
						var templateItem = '<option value="'+n.code+'">'+n.name+'</option>';
						$courtType.append(templateItem);
					});
					$courtType.mobiscroll().select({
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
  
  //提交诉讼法院信息，实时保存到CSS系统
  function addLitigationCourtInfo(){
	  
	  var page = $('#litigation_courtInfo_add_page');
 	   var authData = {};
 	   //诉讼id
 	   var lawsuitCaseId = session.get("lawsuitCaseId");
	   if(lawsuitCaseId == null || lawsuitCaseId == ""){
		  showMessage('诉讼ID不存在，不能提交法院信息！','3000');
		  return false;
	   }
 	   authData.lawsuitCaseId = lawsuitCaseId;
 	   //合同号
 	   var contractNo = session.get("contractNo");
	   if(contractNo == null || contractNo == ""){
		  showMessage('合同号不存在，不能提交法院信息！','3000');
		  return false;
	   }
 	   authData.contractNo = contractNo;
 		//法院名称
 	   authData.courtName=page.find("input[identity='courtName']").val();
 	   if(authData.courtName == null || authData.courtName == ""){
		  showMessage('请输入法院名称！','3000');
		  return false;
	   }
 	   //法院类型代码
 	   authData.courtTypeCode=page.find("input[identity='courtType']").val();
 	   if(authData.courtTypeCode == null || authData.courtTypeCode == ""){
		  showMessage('请选择法院类型！','3000');
		  return false;
	   }
 	   //法院类型
 	   authData.courtType=page.find("input[identity='courtType']").val();
 	   //法官
 	   authData.justice=page.find("input[identity='justice']").val();  
 	   //法官电话
 	   authData.phone=page.find("input[identity='phone']").val();  
 	   //书记员
 	   authData.courtClerk=page.find("input[identity='courtClerk']").val();  
 	   //书记员电话
 	   authData.courtClerkPhone=page.find("input[identity='courtClerkPhone']").val(); 
 	   //法院地址
 	   authData.courtAddress=page.find("input[identity='courtAddress']").val();
 	   //城市
 	   authData.city=page.find("input[identity='city']").val();  
 	   //区域
 	   authData.district=page.find("input[identity='district']").val();  
 	   //录入人
// 	   authData.userNameCn=page.find("input[identity='userNameCn']").val();  
 	   authData.userNameCn=session.get("userCode");
 	   authData.userId = session.get("userId");
 	   //录入时间
 	   var currentDatetime = new Date().Format("yyyy-MM-dd HH:mm:ss");
 	   authData.enterTime=currentDatetime;  
 	   
	  showConfirm("请确认是否提交数据", function(){
		  showLoading();
		 $.getJSON(basePath+"/app/litigationCourtInfoAdd/addLitigationCourtInfo.xhtml"+callback,authData,function(msg){
   		   if($.trim(msg.returnCode) == '0'){
//   			   if(msg.data>0){
//           			showHide();
//	                showMessage('提交成功','2000');
//   			   }
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
            