/*********************************************************login init begin*****************************************************************/	
var litigation_collection_record_details_page = $('#litigation_collection_record_details_page');
var litigation_collection_record_details_myScroll;
var litigation_collection_record_details_page_handler = {};
/******************************home_page---begin**************************************/	   
litigation_collection_record_details_page.live('pageinit',function(e, ui){
	var wrapper = "litigation_collection_record_details_wrapper";
	litigation_collection_record_details_myScroll = createMyScroll(wrapper);
	
	litigation_collection_record_details_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page();
	});
	
	//跳转到 案件详情  事件
	litigation_collection_record_details_page.find(".bottoms1-red li:first").live("tap",function(){
		
		goto_page("collection_case_details_view_page");
	});
	
	//点击保存
	litigation_collection_record_details_page.find(".SaveBtn1").live("tap",function(){
		litigation_collection_record_details_page_handler.saveCollectionRecord();
	});
	
	//点击提交
	litigation_collection_record_details_page.find(".SaveBtn2").live("tap",function(){
		litigation_collection_record_details_page_handler.submitCollectionRecord();
	});
	litigation_collection_record_details_page_init();
	//点击图片查看大图
    litigation_collection_record_details_page.find('[tag="picBox"] img').live("tap",function(){
        
    	var currentPage = $("#litigation_collection_record_details_page");
		var fileBase64EncodeStr = "";
		var listImg = currentPage.find('[tag="picBox"] img');
		var photoIndex = listImg.index($(this));
		for (var i = 0; i < listImg.size(); i++) {
			fileBase64EncodeStr = fileBase64EncodeStr + "@"+ $(listImg.get(i)).attr("src").replace("data:image/png;base64,","");// 
		}
		
		fileBase64EncodeStr = fileBase64EncodeStr.substring(1);
		sendPictures(fileBase64EncodeStr,photoIndex);
        
    });
	
});
function litigation_collection_record_details_page_init(){
	//点击催收对象跳转页面进行选择
	var $collect_object_li = $("#litigation_collection_record_details_collect_object");
	litigation_collection_record_details_page_handler.collect_object_li_tap_handler=function(){
		var dictData = {};
		dictData.source = ConstDef.getConstant("DICTIONARY_DATA_SOURCE_FROM_DICTIONARY_TABLE");
		dictData.dictionaryCategoryCode = ConstDef.getConstant("COLLECT_OBJECT_CATEGORY_CODE");
		dictData.code = $(this).find("[identity='collect_object']").attr("code");
		dictData.name = $(this).find("[identity='collect_object']").text();
		session.set("dictData",JSON.stringify(dictData));
		goto_page2("collection_dictionary_data_list_page");

	};
	$collect_object_li.on("tap",litigation_collection_record_details_page_handler.collect_object_li_tap_handler);
	
	//点击联系方式跳转页面进行选择
	var $contact_method_li = $("#litigation_collection_record_details_contact_method");
	litigation_collection_record_details_page_handler.contact_method_li_tap_handler=function(){
		
		var dictData = {};
		dictData.source = ConstDef.getConstant("DICTIONARY_DATA_SOURCE_FROM_DICTIONARY_TABLE");
		dictData.dictionaryCategoryCode = ConstDef.getConstant("CATEGORY_CODE_CONTACT_METHOD");
		dictData.code = $(this).find("[identity='contact_method']").attr("code");
		dictData.name = $(this).find("[identity='contact_method']").text();
		session.set("dictData",JSON.stringify(dictData));
		goto_page2("collection_dictionary_data_list_page");

	};
	$contact_method_li.on("tap",litigation_collection_record_details_page_handler.contact_method_li_tap_handler);
	
	
	//点击行动代码跳转页面进行选择
	var $action_code_li = $("#litigation_collection_record_details_action_code");
	litigation_collection_record_details_page_handler.action_code_li_tap_handler=function(){
		
		var dictData = {};
		dictData.source = ConstDef.getConstant("DICTIONARY_DATA_SOURCE_FROM_DICTIONARY_TABLE");
		dictData.dictionaryCategoryCode = ConstDef.getConstant("CATEGORY_CODE_FIELD_COLLECT_ACTION_CODE");
		dictData.code = $(this).find("[identity='action_code']").attr("code");
		dictData.name = $(this).find("[identity='action_code']").text();
		session.set("dictData",JSON.stringify(dictData));
		goto_page2("collection_dictionary_data_list_page");

	};
	$action_code_li.on("tap",litigation_collection_record_details_page_handler.action_code_li_tap_handler);
	
	//点击行动状态跳转页面进行选择
	var $action_status_li = $("#litigation_collection_record_details_action_status");
	litigation_collection_record_details_page_handler.action_status_li_tap_handler=function(){
		
		var dictData = {};
		dictData.source = ConstDef.getConstant("DICTIONARY_DATA_SOURCE_FROM_NON_DICTIONARY_TABLE");
		dictData.dictionaryCategoryCode = ConstDef.getConstant("NON_CATEGORY_CODE_ACTION_STATUS");
		dictData.code = $(this).find("[identity='action_status']").attr("code");
		dictData.name = $(this).find("[identity='action_status']").text();
		session.set("dictData",JSON.stringify(dictData));
		goto_page2("collection_dictionary_data_list_page");

	};
	$action_status_li.on("tap",litigation_collection_record_details_page_handler.action_status_li_tap_handler);
	
}

litigation_collection_record_details_page.live('pageshow',function(e, ui){
	
	currentLoadActionName = "litigation_collection_record_details_load_content"
	
	var fromPage = session.get("_fromPage2");
	session.remove("_fromPage2");
	var fromPage1 = session.get("fromPage");
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
				var $collect_object_li = $("#litigation_collection_record_details_collect_object");
				var $collect_object = $collect_object_li.find("[identity='collect_object']")
				$collect_object.text(dictData.name);
				$collect_object.attr("code",dictData.code);

				break;
				
			case ConstDef.getConstant("CATEGORY_CODE_CONTACT_METHOD"):
				//初始化联系方式
				var $contact_method_li = $("#litigation_collection_record_details_contact_method");
				var contact_method = $contact_method_li.find("[identity='contact_method']")
				contact_method.text(dictData.name);
				contact_method.attr("code",dictData.code);
				break;
				
			case ConstDef.getConstant("CATEGORY_CODE_FIELD_COLLECT_ACTION_CODE"):
				//初始化行动代码
	
				var $action_code_li = $("#litigation_collection_record_details_action_code");
				var $action_code = $action_code_li.find("[identity='action_code']")
				$action_code.text(dictData.name);
				$action_code.attr("code",dictData.code);
				break;
				
			case ConstDef.getConstant("NON_CATEGORY_CODE_ACTION_STATUS"):
				//初始化行动状态
	
				var $action_status_li = $("#litigation_collection_record_details_action_status");
				var $action_status = $action_status_li.find("[identity='action_status']")
				$action_status.text(dictData.name);
				$action_status.attr("code",dictData.code);
				break;
		
		}

	}
	else if(fromPage1 != "image_zoom_page" && fromPage1 != "collection_case_details_view_page" && fromPage1 != "collection_css_picture_details"){
		load_litigation_collection_record_details_content();
	}
	
});

function litigation_collection_record_details_load_content(){
	
}

//加载详细，并显示
function load_litigation_collection_record_details_content(){
	
	showLoading();
	var currentPage = $("#litigation_collection_record_details_page");
	
	var postData = {};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
    postData.collectionRecordId = session.get("collectionRecordId");
	$.getJSON(basePath+"/app/litigationCollectionRecordDetails/pageInit.xhtml"+callback, postData,function(msg){
		
		 showHide();
		   if($.trim(msg.returnCode) == '0'){

				currentPage.find('[tag="picBox"]').empty();
				
				currentPage.find("[identity='customer_name']").text(msg.data.caseRecord.customerName);
				currentPage.find("[identity='contract_number']").text(msg.data.caseRecord.contractNumber);
				
				session.set("contractId",msg.data.caseRecord.contractId);
				session.set("caseId",msg.data.caseRecord.caseId);//进入查看CSS催收照片大图画面，可使用该参数
				//如果已经保存催记，则显示保存的催记信息
				var collectionRecord = msg.data.collectionRecord;
				if(collectionRecord != null && collectionRecord.status != ConstDef.getConstant("COLLECTION_RECORD_STATUS_UN_SAVE")){
						//催收对象：collectCustomer
						var collectObjectList = msg.data.collectObjectList;
						$.each(collectObjectList,function(i,n){
							if(n.code == collectionRecord.collectCustomer){
								var $collect_object_li = $("#litigation_collection_record_details_collect_object");
								var $collect_object = $collect_object_li.find("[identity='collect_object']")
								$collect_object.text(n.name);
								$collect_object.attr("code",n.code);
								
							}
						});
						
						//联系方式：contractMethod
						var contractMethodList = msg.data.contractMethodList;
						$.each(contractMethodList,function(i,n){
							if(n.code == collectionRecord.contractMethod){
								var contractMethodList = $("#litigation_collection_record_details_contact_method");
								var $contact_method = contractMethodList.find("[identity='contact_method']")
								$contact_method.text(n.name);
								$contact_method.attr("code",n.code);
								
							}
						});
						
						//行动代码：actionCode
						
						var actionCodeList = msg.data.actionCodeList;
						$.each(actionCodeList,function(i,n){
							if(n.code == collectionRecord.actionCode){
								var $action_code_li = $("#litigation_collection_record_details_action_code");
								var $action_code = $action_code_li.find("[identity='action_code']")
								$action_code.text(n.name);
								$action_code.attr("code",n.code);
								
							}
						});
						
						//行动状态：actionState
						
						var actionStatusList = msg.data.actionStatusList;
						$.each(actionStatusList,function(i,n){
							if(n.code == collectionRecord.actionState){
								var $action_status_li = $("#litigation_collection_record_details_action_status");
								var $action_status = $action_status_li.find("[identity='action_status']")
								$action_status.text(n.name);
								$action_status.attr("code",n.code);

							}
						});
						
						
						currentPage.find("[identity='next_time']").val(collectionRecord.nextTime.substring(0,10));
						currentPage.find("[identity='collect_record']").val(collectionRecord.collectRecord);
						
						//显示催收照片
						var collectionRecordPictures = msg.data.collectionRecordPictures;
						$.each(collectionRecordPictures,function(i,n){
							if(n.path){
								
								 var $item = $('<dl class="act"><dt><img alt=""></dt></dl>');
							     var $image = $item.find('img');
							     
							     $image.attr('src',"data:image/png;base64,"+n.extension);
							     $image.attr('attachmentId',n.attachmentId);
							     currentPage.find('[tag="picBox"]').append($item);
							}
							
						});
						
						//若催记已提交（collectionRecord.status == "2"）,则不可编辑
						if(collectionRecord.status == "2"){
							currentPage.find(".detailDiv li").off("tap");
							currentPage.find("[identity]").attr("disabled","disabled");
							currentPage.find(".detailDiv li span").removeClass("allBtn_down");
							currentPage.find("[identity='next_time']").next().hide();
							
							currentPage.find("[identity='collect_record']").hide();
							var $collectRecord = "<div id='collectRecordDiv' class='remark font12r'>"+collectionRecord.collectRecord+"</div>";
							currentPage.find("[identity='collect_record']").parent(".remark").children("#collectRecordDiv").remove();
							currentPage.find("[identity='collect_record']").parent(".remark").append($collectRecord);
							currentPage.find("[identity='collect_record']").parent(".remark").css("height","auto");
							currentPage.find("#collectRecordDiv").css("height","auto");
							currentPage.find("#collectRecordDiv").css("min-height","10rem");
							
							currentPage.find(".SaveBtn1").hide();
							currentPage.find(".SaveBtn2").hide();
						}
						else{
							litigation_collection_record_details_page_init();
							currentPage.find("[identity]").removeAttr("disabled");
							
							currentPage.find("[id=litigation_collection_record_details_collect_object] span:last").addClass("allBtn_down");
							currentPage.find("[id=litigation_collection_record_details_contact_method] span:last").addClass("allBtn_down");
							currentPage.find("[id=litigation_collection_record_details_action_code] span:last").addClass("allBtn_down");
							currentPage.find("[id=litigation_collection_record_details_action_status] span:last").addClass("allBtn_down");
							currentPage.find("[identity='next_time']").next().show();
							currentPage.find("[identity='next_time']").next().attr("display","inline-block;");
							
							currentPage.find("[identity='collect_record']").parent(".remark").children("#collectRecordDiv").remove();
							currentPage.find("[identity='collect_record']").parent(".remark").removeAttr("min-height");
							currentPage.find("[identity='collect_record']").show();
							
							currentPage.find(".SaveBtn1").show();
							currentPage.find(".SaveBtn2").show();
						}
				}
				else{
					//清空数据
					//催收对象：collectCustomer
					var $collect_object_li = $("#litigation_collection_record_details_collect_object");
					var $collect_object = $collect_object_li.find("[identity='collect_object']")
					$collect_object.text("借款人");
					$collect_object.attr("code","BORROWER");

					var $contact_method_li = $("#litigation_collection_record_details_contact_method");
					var $contact_method = $contact_method_li.find("[identity='contact_method']")
					$contact_method.text("单位电话");
					$contact_method.attr("code","00001");
					
					//行动代码：actionCode
					var $action_code_li = $("#litigation_collection_record_details_action_code");
					var $action_code = $action_code_li.find("[identity='action_code']")
					$action_code.text("实地借款人住址");
					$action_code.attr("code","00001009");
					
					//行动状态：actionState
					var $action_status_li = $("#litigation_collection_record_details_action_status");
					var $action_status = $action_status_li.find("[identity='action_status']")
					$action_status.text("承诺");
					$action_status.attr("code","MPRM");

					litigation_collection_record_details_page_init();
					
					currentPage.find("[identity]").removeAttr("disabled");
					currentPage.find("[id=litigation_collection_record_details_collect_object] span:last").addClass("allBtn_down");
					currentPage.find("[id=litigation_collection_record_details_contact_method] span:last").addClass("allBtn_down");
					currentPage.find("[id=litigation_collection_record_details_action_code] span:last").addClass("allBtn_down");
					currentPage.find("[id=litigation_collection_record_details_action_status] span:last").addClass("allBtn_down");
					currentPage.find("[identity='next_time']").next().show();
					currentPage.find("[identity='next_time']").next().attr("display","inline-block;");
					currentPage.find(".SaveBtn1").show();
					currentPage.find(".SaveBtn2").show();
					
					var tenDaysLatter = GetDateStr(10);
					currentPage.find("[identity='next_time']").val(tenDaysLatter);
					
					currentPage.find("[identity='collect_record']").val("");
					currentPage.find("[identity='collect_record']").parent(".remark").children("#collectRecordDiv").remove();
					currentPage.find("[identity='collect_record']").parent(".remark").removeAttr("min-height");
					currentPage.find("[identity='collect_record']").show();
					
					//清空催收照片
					currentPage.find('[tag="picBox"]').empty();
				}
				
		   }
		   else{
			   errorHandler(msg.returnCode,msg.message);
		   	}
		
		
		
	});//end $.getJSON
};

//保存催记
litigation_collection_record_details_page_handler.saveCollectionRecord=function(){

	var page = $('#litigation_collection_record_details_page');

	   var postData = {};
	   postData.collectionRecordId = session.get("collectionRecordId");

	   postData.collect_object = page.find("[identity='collect_object']").attr("code");
	   postData.contact_method = page.find("[identity='contact_method']").attr("code");
	   var action_code = page.find("[identity='action_code']").attr("code");
	   if(action_code != undefined || action_code != null){
		   postData.action_code = action_code;
	   }else{
		   postData.action_code = "";
	   }
	   
	   postData.action_state = page.find("[identity='action_status']").attr("code");
	   var next_time_t = page.find("[identity='next_time']").val();
	   if(next_time_t != ""){
		   next_time_t = next_time_t.replace("-","/");
		   next_time_t = next_time_t.replace("-","/");
		   postData.next_time =next_time_t+" 00/00/00";
	   }else{
		   postData.next_time ="";
	   }
	   
	   postData.collect_record = page.find("[identity='collect_record']").val();

	   showLoading();
	   $.getJSON(basePath+"/app/litigationCollectionRecordDetails/saveCollectionRecord.xhtml"+callback,postData,function(msg){
		   
		   showHide();
			   if($.trim(msg.returnCode) == '0'){

				   showMessage(msg.message,'2000');
			   }
			   else{
				   errorHandler(msg.returnCode,msg.message);
			   	}
			   });//end $.getJSON
	   
   }//end saveCollectionRecord

litigation_collection_record_details_page_handler.submitCollectionRecord=function (){

	var page = $('#litigation_collection_record_details_page');

	   var postData = {};
	   postData.collect_object = page.find("[identity='collect_object']").attr("code");
	   postData.contact_method = page.find("[identity='contact_method']").attr("code");
	   var action_code = page.find("[identity='action_code']").attr("code");
	   if(action_code != undefined || action_code != null){
		   postData.action_code = action_code;
	   }else{
		   postData.action_code = "";
	   }
	   postData.action_state = page.find("[identity='action_status']").attr("code");
	   
	   var next_time_t = page.find("[identity='next_time']").val();
	   if(next_time_t != ""){
		   next_time_t = next_time_t.replace("-","/");
		   next_time_t = next_time_t.replace("-","/");
		   postData.next_time =next_time_t+" 00/00/00";
	   }else{
		   postData.next_time ="";
	   }
	  
	   postData.collect_record = page.find("[identity='collect_record']").val();
	   
	   //页面数据非空校验
	   if(!postData.collect_object){
		   showMessage('请选择催收对象！','1500');
		   return false;
	   }
	   
	   if(!postData.action_code){
		   showMessage('请选择行动代码！','1500');
		   return false;
	   }
	   
	   if(!postData.action_state){
		   showMessage('请选择行动状态！','1500');
		   return false;
	   }
	   
	   if(!next_time_t){
		   showMessage('请选择下次约会时间！','1500');
		   return false;
	   }
	   
	   if(!postData.collect_record){
		   showMessage('请填写催收记录！','1500');
		   page.find("input[identity='remark']").focus();
		   return false;
	   }
	   
	showConfirm("请确认已保存当前页面数据，提交后将不能再进行更改", function(){

		showLoading();	
		
		//保存成功后返回已保存的催记ID
		var $currentPage =$("#litigation_collection_record_details_page");
		var userInfo = JSON.parse(session.get("userInfo"));
		
		postData.random = new Date();
		postData.userCssCode = userInfo.userMapping.CSS;
		postData.userCode = session.get("userCode");
		postData.collectionRecordId = session.get("collectionRecordId");
		postData.contract_number = $currentPage.find("[identity='contract_number']").text();

		   $.getJSON(basePath+"/app/litigationCollectionRecordDetails/submitCollectionRecord.xhtml"+callback,postData,function(msg){
			   
			   showHide();
				   if($.trim(msg.returnCode) == '0'){
					   showMessage(msg.message,'2000');
					   setTimeout(function(){
						   back_page();
						  },2500);
				   }
				   else{
					   		errorHandler(msg.returnCode,msg.message);
				   	}
				});//end $.getJSON
		
	});
}
