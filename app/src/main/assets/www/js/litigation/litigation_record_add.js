  var litigation_record_add_page = $("#litigation_record_add_page");
  var litigation_record_add_myScroll;
  
  litigation_record_add_page.live("pageinit",function(e,ui){
	    var wrapper = "litigation_record_add_wrapper";  
//		var up = "litigation_record_add_pullUp";
//		var down = "litigation_record_add_pullDown";
//		litigation_record_add_myScroll = createMyScroll(wrapper, up, down);
		litigation_record_add_myScroll = createMyScroll(wrapper);
		
	  //返回行车列表
	  litigation_record_add_page.find(".BackBtn").live("tap",function(event){
		  event.stopPropagation();
          back_page();
	  });
	  
	  //点击提交，提交诉讼事件，诉讼事件信息实时保存到CSS系统
	  litigation_record_add_page.find(".SaveBtn2").live("tap",function(){
		  addLitigationRecord();
	  });
	  
	  //点击诉讼代码跳转页面进行选择
	  var $eventName = $("#litigation_record_add_page #litigation_record_add_eventName");
	  $eventName.on("tap",function(){
			var dictData = {};
			dictData.dictionaryCategoryCode = ConstDef.getConstant("DICTIONARY_CODE_LITIGATION_RECORD_EVENTNAME");
			dictData.code = $(this).find("[identity='eventName']").attr("code");
			dictData.name = $(this).find("[identity='eventName']").text();
			session.set("dictData",JSON.stringify(dictData));
			goto_page2("litigation_eventName_dictionary_list_page");
	  });
	  
	  //提醒时间
	  var now = new Date();
	  $("#litigation_record_add_page").find('[identity="notifyTime"]').mobiscroll().datetime({
		    theme: 'red',
		    lang: 'zh',
		    display: 'bottom',
		    min: now,
		    showNow: true,
		    onSet:function(event,inst){
		    	var editDate = event.valueText;
		    	var newEditDate = new Date(editDate);
		    	var editDateFormat = Format(newEditDate,"yyyy-MM-dd HH:mm:ss");
		    	$(this).val(editDateFormat);
		    }
		    
	  });
  });
          
  litigation_record_add_page.live("pageshow",function(e,ui){
	  
	  var $currentPage = $("#litigation_record_add_page");
	  currentLoadActionName = "litigation_record_add_load_content"
		 
	  var fromPage = session.get("fromPage");
	  if(fromPage == 'litigation_record_list_page'){
	  	//初始化催收对象
		var $eventNameLi = $currentPage.find("#litigation_record_add_eventName");
		var $eventName = $eventNameLi.find("[identity='eventName']")
		$eventName.text("请选择");
		$eventName.attr("code","");
		
		$currentPage.find("[identity='notifyTime']").val("");
		$currentPage.find("[identity='memo']").val("");
	  }
	  
      load_litigation_record_add_content();

  });
          
  function litigation_record_add_load_content(){
	
  }
   
  function load_litigation_record_add_content(){
	  
	  	var fromPage = session.get("_fromPage2");
		session.remove("_fromPage2");
		// 如果前页面是 litigation_eventName_dictionary_list_page ,则进入页面后不重新加载数据
		if (fromPage == "litigation_eventName_dictionary_list_page") {

			var dictData = JSON.parse(session.get("dictData"));
			//加载字典数据
			switch(dictData.dictionaryCategoryCode){
				case ConstDef.getConstant("DICTIONARY_CODE_LITIGATION_RECORD_EVENTNAME"):
					//初始化催收对象
					var $eventNameLi = $("#litigation_record_add_page #litigation_record_add_eventName");
					var $eventName = $eventNameLi.find("[identity='eventName']")
					$eventName.text(dictData.name);
					$eventName.attr("code",dictData.code);
					break;
			}

		}
  }
  
  //提交诉讼事件，诉讼事件信息实时保存到CSS系统
  function addLitigationRecord(){
	  
	   var page = $('#litigation_record_add_page');
	   
 	   var authData = {};
 	   authData.userId=session.get("userId");
 	   authData.userCode=session.get("userCode");
 	   //诉讼id
 	   var lawsuitCaseId = session.get("lawsuitCaseId");
	   if(lawsuitCaseId == null || lawsuitCaseId == ""){
		  showMessage('诉讼ID不存在，不能提交诉讼事件信息！','3000');
		  return false;
	   }
	   authData.lawsuitCaseId = lawsuitCaseId;
 	   //合同号
 	   var contractNo = session.get("contractNo");
	   if(contractNo == null || contractNo == ""){
		  showMessage('合同号不存在，不能提交诉讼事件信息！','3000');
		  return false;
	   }
	   authData.contractNo = contractNo;
 	   //诉讼代码
 	   authData.eventCode=page.find("[identity='eventName']").attr("code");
 	   if(authData.eventCode == null || authData.eventCode == ""){
		  showMessage('请选择诉讼代码！','3000');
		  return false;
	   }
 	   //诉讼名称
 	   authData.eventName=page.find("[identity='eventName']").text();
 	   //操作员
// 	   authData.userNameCn=page.find("input[identity='userNameCn']").val();
 	   authData.userNameCn = session.get("userCode");
 	   //提醒时间
 	   authData.notifyTime=page.find("input[identity='notifyTime']").val();
 	   if(authData.notifyTime == null || authData.notifyTime == ""){
		  showMessage('请选择提醒时间！','3000');
		  return false;
	   }
 	   //创建时间
 	   var currentDatetime = new Date().Format("yyyy-MM-dd HH:mm:ss");
 	   authData.createTime=currentDatetime;  
 	   //备注
 	   authData.memo=page.find("textarea[identity='memo']").val(); 
 	   if(authData.memo == null || authData.memo == ""){
		  showMessage('请填写备注！','3000');
		  return false;
	   }
 	   
	  showConfirm("请确认是否提交数据", function(){
		  showLoading();
		 $.getJSON(basePath+"/app/litigationRecordAdd/addLitigationRecord.xhtml"+callback,authData,function(msg){
   		   if($.trim(msg.returnCode) == '0'){
//   			   if(msg.data>0){
//           			showHide();
//	                showMessage('提交成功','2000');
//   			   }
   			   showHide();
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
            