/*********************************************************login init begin*****************************************************************/	
var css_collection_record_details_save_page = $('#css_collection_record_details_save_page');
var css_collection_record_details_save_myScroll;
/******************************home_page---begin**************************************/	   
css_collection_record_details_save_page.live('pageinit',function(e, ui){
	var wrapper = "css_collection_record_details_save_wrapper";
	css_collection_record_details_save_myScroll = createMyScroll(wrapper);
	
	css_collection_record_details_save_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page();
	});
	
	//点击保存
	css_collection_record_details_save_page.find(".SaveBtn1").live("tap",function(){
		css_collection_record_details_save_page_handler.saveCollectionRecord();
	});
	
	//点击催收对象跳转页面进行选择
	var $collect_object_li = $("#css_collection_record_details_save_collect_object");
	$collect_object_li.live("tap",function(){
		var dictData = {};
		dictData.source = ConstDef.getConstant("DICTIONARY_DATA_SOURCE_FROM_DICTIONARY_TABLE");
		dictData.dictionaryCategoryCode = ConstDef.getConstant("COLLECT_OBJECT_CATEGORY_CODE");
		dictData.code = $(this).find("[identity='collect_object']").attr("code");
		dictData.name = $(this).find("[identity='collect_object']").text();
		session.set("dictData",JSON.stringify(dictData));
		goto_page2("collection_dictionary_data_list_page");

	});
	
	//点击联系方式跳转页面进行选择
	var $contact_method_li = $("#css_collection_record_details_save_contact_method");
	$contact_method_li.live("tap",function(){
		
		var dictData = {};
		dictData.source = ConstDef.getConstant("DICTIONARY_DATA_SOURCE_FROM_DICTIONARY_TABLE");
		dictData.dictionaryCategoryCode = ConstDef.getConstant("CATEGORY_CODE_CONTACT_METHOD");
		dictData.code = $(this).find("[identity='contact_method']").attr("code");
		dictData.name = $(this).find("[identity='contact_method']").text();
		session.set("dictData",JSON.stringify(dictData));
		goto_page2("collection_dictionary_data_list_page");

	});
	
	
	//点击行动代码跳转页面进行选择
	var $action_code_li = $("#css_collection_record_details_save_action_code");
	$action_code_li.live("tap",function(){
		
		var dictData = {};
		dictData.source = ConstDef.getConstant("DICTIONARY_DATA_SOURCE_FROM_DICTIONARY_TABLE");
		dictData.dictionaryCategoryCode = ConstDef.getConstant("CATEGORY_CODE_TELEPHONE_COLLECT_ACTION_CODE");
		dictData.code = $(this).find("[identity='action_code']").attr("code");
		dictData.name = $(this).find("[identity='action_code']").text();
		session.set("dictData",JSON.stringify(dictData));
		goto_page2("collection_dictionary_data_list_page");

	});
	
	//点击行动状态跳转页面进行选择
	var $action_status_li = $("#css_collection_record_details_save_action_status");
	$action_status_li.live("tap",function(){
		
		var dictData = {};
		dictData.source = ConstDef.getConstant("DICTIONARY_DATA_SOURCE_FROM_NON_DICTIONARY_TABLE");
		dictData.dictionaryCategoryCode = ConstDef.getConstant("NON_CATEGORY_CODE_ACTION_STATUS");
		dictData.code = $(this).find("[identity='action_status']").attr("code");
		dictData.name = $(this).find("[identity='action_status']").text();
		session.set("dictData",JSON.stringify(dictData));
		goto_page2("collection_dictionary_data_list_page");

	});
	
});


css_collection_record_details_save_page.live('pageshow',function(e, ui){
	
	currentLoadActionName = "css_collection_record_details_save_load_content";
	var fromPage = session.get("_fromPage2");
	session.remove("_fromPage2");
	
	// 如果前页面是 collection_dictionary_data_list_page ,则进入页面后不重新加载数据
	if (fromPage == "collection_dictionary_data_list_page") {
	
		/**
		 * 获取字典类别，从该画面存入session： session.get("dictionaryCategoryCode");
		 * 获取字典编码，从字典数据列表画面存入session：session.get("dictionaryCode");
		 * 获取字典名称，从字典数据列表画面存入session：session.get("dictionaryName");
		 */

		var dictData = JSON.parse(session.get("dictData"));
		//加载字典数据
		switch(dictData.dictionaryCategoryCode){
		
			case ConstDef.getConstant("COLLECT_OBJECT_CATEGORY_CODE"):
				//初始化催收对象
				var $collect_object_li = $("#css_collection_record_details_save_collect_object");
				var $collect_object = $collect_object_li.find("[identity='collect_object']")
				$collect_object.text(dictData.name);
				$collect_object.attr("code",dictData.code);

				break;
				
			case ConstDef.getConstant("CATEGORY_CODE_CONTACT_METHOD"):
				//初始化联系方式
				var $contact_method_li = $("#css_collection_record_details_save_contact_method");
				var contact_method = $contact_method_li.find("[identity='contact_method']")
				contact_method.text(dictData.name);
				contact_method.attr("code",dictData.code);
				break;
				
			case ConstDef.getConstant("CATEGORY_CODE_TELEPHONE_COLLECT_ACTION_CODE"):
				//初始化行动代码
	
				var $action_code_li = $("#css_collection_record_details_save_action_code");
				var $action_code = $action_code_li.find("[identity='action_code']")
				$action_code.text(dictData.name);
				$action_code.attr("code",dictData.code);
				break;
				
			case ConstDef.getConstant("NON_CATEGORY_CODE_ACTION_STATUS"):
				//初始化行动状态
	
				var $action_status_li = $("#css_collection_record_details_save_action_status");
				var $action_status = $action_status_li.find("[identity='action_status']")
				$action_status.text(dictData.name);
				$action_status.attr("code",dictData.code);
				break;
		
		}

	}
	else{
		load_css_collection_record_details_save_content();
	}
});
function css_collection_record_details_save_load_content(){
	
}
//加载详细，并显示
function load_css_collection_record_details_save_content(){
	
	showLoading();
	var currentPage = $("#css_collection_record_details_save_page");
	
//	var postData = {};
//	postData.random = new Date();
//	postData.userCode = session.get("userCode");
//	$.getJSON(basePath+"/app/collectionRecordDetailsSaveCss/pageInit.xhtml"+callback, postData,function(msg){
//		showHide();
//	   if($.trim(msg.returnCode) == '0'){
//		    var $actionCodeList = currentPage.find("#css_collection_record_details_save_action_code_list");
//			var $contractMethodList = currentPage.find("#css_collection_record_details_save_contact_method_list");
//			var $actionStatusList = currentPage.find("#css_collection_record_details_save_action_status_list");
//			var $collectObjectList = currentPage.find("#css_collection_record_details_save_collect_object_list");
//			$actionCodeList.empty();
//			$contractMethodList.empty();
//			$actionStatusList.empty();
//			$collectObjectList.empty();
//			
//			//初始化行动代码
//			$.each(msg.data.actionCodeList,function(i,n){
//				var $actionCodeItem = $("<li code='"+n["code"]+"'></li>");
//				$actionCodeItem.text(n["name"]);
//				
//				$actionCodeList.append($actionCodeItem);
//			});//end $.each
//
//			//初始化行动状态
//			$.each(msg.data.actionStatusList,function(i,n){
//				var $actionStatusItem = $("<li code='"+n["code"]+"'></li>");
//				$actionStatusItem.text(n["name"]);
//				
//				$actionStatusList.append($actionStatusItem);
//			});//end $.each
//
//			//初始化催收对象
//			$.each(msg.data.collectObjectList,function(i,n){
//				var $collectObjectItem = $("<li code='"+n["code"]+"'></li>");
//				$collectObjectItem.text(n["name"]);
//				$collectObjectList.append($collectObjectItem);
//			});//end $.each
//			
//			//初始化联系方式
//			$.each(msg.data.contractMethodList,function(i,n){
//				var $contractMethodItem = $("<li code='"+n["code"]+"'></li>");
//				$contractMethodItem.text(n["name"]);
//				$contractMethodList.append($contractMethodItem);
//			});//end $.each
			
			var todoCase = JSON.parse(session.get("todoCase"));
			currentPage.find("[identity='customer_name']").text(todoCase.customerName);
			currentPage.find("[identity='contract_number']").text(todoCase.contractNumber);
			//催收对象：collectCustomer
			var $collect_object_li = $("#css_collection_record_details_save_collect_object");
			var $collect_object = $collect_object_li.find("[identity='collect_object']")
			$collect_object.text("借款人");
			$collect_object.attr("code","BORROWER");

			var $contact_method_li = $("#css_collection_record_details_save_contact_method");
			var $contact_method = $contact_method_li.find("[identity='contact_method']")
			$contact_method.text("单位电话");
			$contact_method.attr("code","00001");
			
			//行动代码：actionCode
			var $action_code_li = $("#css_collection_record_details_save_action_code");
			var $action_code = $action_code_li.find("[identity='action_code']")
			$action_code.text("实地电话借款人");
			$action_code.attr("code","00000015");
			
			//行动状态：actionState
			var $action_status_li = $("#css_collection_record_details_save_action_status");
			var $action_status = $action_status_li.find("[identity='action_status']")
			$action_status.text("谈判中");
			$action_status.attr("code","NEGO");

			var tenDaysLatter = GetDateStr(10);
			currentPage.find("[identity='next_time']").val(tenDaysLatter);
			currentPage.find("[identity='collect_record']").val("");
			showHide();
//	   }
//	   else{
//		   errorHandler(msg.returnCode,msg.message);
//	   	}
//		
//	});//end $.getJSON
};

	//保存催记
	var css_collection_record_details_save_page_handler = {};
	css_collection_record_details_save_page_handler.saveCollectionRecord=function(){
	   var page = $('#css_collection_record_details_save_page');
	   
	   var businessFlag = session.get("businessFlag");//业务类型：1催收 2诉讼
	   var toDoCaseId = "";
	   if(businessFlag == "1"){
		   toDoCaseId = session.get("cssCollectionRecordDetailsSave_toDoCaseId");
	   }else if(businessFlag == "2"){
		   toDoCaseId = session.get("litigToDoCaseId");
	   }
	   
	   var postData = {};
	   
	   var userInfo = JSON.parse(session.get("userInfo"));
	   var userCssCode = "";
	   if(userInfo.userMapping.CSS != undefined && userInfo.userMapping.CSS != null){
			userCssCode = userInfo.userMapping.CSS;
	   }
	   
	   postData.userId = session.get("userId");
	   postData.userCode = session.get("userCode");
	   postData.userCssCode = userCssCode;
	   postData.toDoCaseId = toDoCaseId;
	   //手机端当前时间
	   var currentDatetime = new Date().Format("YYYY/MM/DD HH/mm/ss");
	   postData.currentDatetime = currentDatetime;
	   postData.contractId = session.get("contractId");
	   
	   postData.contract_number = page.find("[identity='contract_number']").text();
	   postData.collect_object = page.find("[identity='collect_object']").attr("code");
	   postData.contact_method = page.find("[identity='contact_method']").attr("code");
	   postData.action_code = page.find("[identity='action_code']").attr("code");
	   postData.action_state = page.find("[identity='action_status']").attr("code");
	   var next_time_t = page.find("[identity='next_time']").val();
	   next_time_t = next_time_t.replace("-","/");
	   next_time_t = next_time_t.replace("-","/");

	   postData.next_time =next_time_t+" 00/00/00";
	   postData.collect_record = page.find("[identity='collect_record']").val();
	   postData.businessFlag = businessFlag;//业务类型：1催收 2诉讼
	   
	   //页面数据非空校验
	   if(!postData.collect_object){
		   showMessage('请选择催收对象！','1500');
		   return;
	   }
	   if(!postData.contact_method){
		   showMessage('请选择联系方式！','1500');
		   return;
	   }
	   if(!postData.action_code){
		   showMessage('请选择行动代码！','1500');
		   return;
	   }
	   
	   if(!postData.action_state){
		   showMessage('请选择行动状态！','1500');
		   return;
	   }
	   
	   if(!next_time_t){
		   showMessage('请选择下次约会时间！','1500');
		   return;
	   }
	   
	   if(!postData.collect_record){
		   showMessage('请填写催收记录！','1500');
		   page.find("input[identity='remark']").focus();
		   return;
	   }

	   showLoading();
	   $.ajaxSettings.async = false; // (同步执行)
	   var saveMessage = "";
	   $.getJSON(basePath+"/app/collectionRecordDetailsSaveCss/saveCollectionRecord.xhtml"+callback,postData,function(msg){
		   showHide();
		   if($.trim(msg.returnCode) == '0'){
			   saveMessage = msg.message;
//			   goto_page("css_collection_record_list_page");
			   back_page();
		   }
		   else{
			   errorHandler(msg.returnCode,msg.message);
		   	}
		});//end $.getJSON
	   $.ajaxSettings.async = true; //（异步执行）
	   if(saveMessage != ""){
		   showMessage(saveMessage,2000);
	   }
	   
   }//end saveCollectionRecord
