/*********************litigation_collecting_address_details_page init begin*****************************************************************/	
var litigation_collecting_address_details_page = $('#litigation_collecting_address_details_page');
var litigation_collecting_address_details_myScroll;
var litigation_collecting_address_details_page_handler = {};
var deletedFiles = new Array();//要删除的图片文件id

litigation_collecting_address_details_page_handler.litigation_collecting_address_details_page_init = function(){
	//点击催收对象跳转页面进行选择
	var $collect_object_li = $("#litigation_collecting_address_details_collect_object");
	$collect_object_li.on("tap",function(){
		var dictData = {};
		dictData.source = ConstDef.getConstant("DICTIONARY_DATA_SOURCE_FROM_DICTIONARY_TABLE");
		dictData.dictionaryCategoryCode = ConstDef.getConstant("COLLECT_OBJECT_CATEGORY_CODE");
		dictData.code = $(this).find("[identity='collect_object']").attr("code");
		dictData.name = $(this).find("[identity='collect_object']").text();
		session.set("dictData",JSON.stringify(dictData));

		goto_page2("collection_dictionary_data_list_page");

	});

	//点击联系方式跳转页面进行选择
	var $contact_method_li = $("#litigation_collecting_address_details_contact_method");
	$contact_method_li.on("tap",function(){

		var dictData = {};
		dictData.source = ConstDef.getConstant("DICTIONARY_DATA_SOURCE_FROM_DICTIONARY_TABLE");
		dictData.dictionaryCategoryCode = ConstDef.getConstant("CATEGORY_CODE_CONTACT_METHOD");
		dictData.code = $(this).find("[identity='contact_method']").attr("code");
		dictData.name = $(this).find("[identity='contact_method']").text();
		session.set("dictData",JSON.stringify(dictData));
		goto_page2("collection_dictionary_data_list_page");
	});

	//点击行动代码跳转页面进行选择
	var $action_code_li = $("#litigation_collecting_address_details_action_code");
	$action_code_li.on("tap",function(){

		var dictData = {};
		dictData.source = ConstDef.getConstant("DICTIONARY_DATA_SOURCE_FROM_DICTIONARY_TABLE");
		dictData.dictionaryCategoryCode = ConstDef.getConstant("CATEGORY_CODE_FIELD_COLLECT_ACTION_CODE");
		dictData.code = $(this).find("[identity='action_code']").attr("code");
		dictData.name = $(this).find("[identity='action_code']").text();
		session.set("dictData",JSON.stringify(dictData));
		goto_page2("collection_dictionary_data_list_page");
	});

	//点击行动状态跳转页面进行选择
	var $action_status_li = $("#litigation_collecting_address_details_action_status");
	$action_status_li.on("tap",function(){

		var dictData = {};
		dictData.source = ConstDef.getConstant("DICTIONARY_DATA_SOURCE_FROM_NON_DICTIONARY_TABLE");
		dictData.dictionaryCategoryCode = ConstDef.getConstant("NON_CATEGORY_CODE_ACTION_STATUS");
		dictData.code = $(this).find("[identity='action_status']").attr("code");
		dictData.name = $(this).find("[identity='action_status']").text();
		session.set("dictData",JSON.stringify(dictData));
		goto_page2("collection_dictionary_data_list_page");
	});

	//拍照取证
	var $currentPage = $('#litigation_collecting_address_details_page');
	$currentPage.find(".bottoms2-red li:last").on("tap",function(){
		var userInfo = JSON.parse(session.get("userInfo"));
		if (ConstDef.getConstant("ONLINE_STATUS_SIGNIN") == userInfo.user.onlineStatus) {
			onLocationBegin();
			showLoading();
			setTimeout(function(){
				showHide();
				startCamera(0.7,"onCameraDone4LitigCollectingAddressDetails");
			},1000)
		}
		else{
			showMessage('您没有签入','1500');
		}
	});
};

/***********************litigation_collecting_address_details_page---begin**************************************/
litigation_collecting_address_details_page.live('pageinit',function(e, ui){
	var wrapper = "litigation_collecting_address_details_wrapper";
	litigation_collecting_address_details_myScroll = createMyScroll(wrapper);

	litigation_collecting_address_details_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page();
		removeImageObject();
	});

	//跳转到 案件详情  事件
	litigation_collecting_address_details_page.find(".bottoms2-red li:first").live("tap",function(){
		//传递参数contractId :session.set("contractId",msg.data.caseRecord.contractId);
		goto_page("collection_case_details_view_page");
	});

	//点击保存
	litigation_collecting_address_details_page.find(".SaveBtn1").live("tap",function(){
		showConfirm("请确认数据是否无误，无误后确认保存", function(){
			console.log("保存催记！！！！！");
			saveLitigCollectionRecord();
		});
	});

	//点击提交
	litigation_collecting_address_details_page.find(".SaveBtn2").live("tap",function(){

		submitLitigCollectionRecord();

	});

	litigation_collecting_address_details_page_handler.litigation_collecting_address_details_page_init();
	//点击删除图片
	litigation_collecting_address_details_page.find('[tag="picBox"] dd').live("tap",function(){

		//获取要删除的文件名
		var $currentImage = $(this).parent().find('img');

		//如果是删除了已保存的照片，则将此照片从服务端也删除
		if($currentImage.attr("status")== "saved"){
			deletedFiles.push($currentImage.attr("collectionRecordPictureId"));
			$(this).parent().remove();
		}
		else{
			$(this).parent().remove();
		}
	});

	//图片点击放大
	litigation_collecting_address_details_page.find('[tag="picBox"] img').live("tap",function(){  
		var currentPage = $("#litigation_collecting_address_details_page");
		var fileBase64EncodeStr = "";
		var listImg = currentPage.find('[tag="picBox"] img');
		var photoIndex = listImg.index($(this));
		for (var i = 0; i < listImg.size(); i++) {
			fileBase64EncodeStr = fileBase64EncodeStr + "@" + $(listImg.get(i)).attr("src").replace("data:image/jpeg;base64,","");
		}
		
		fileBase64EncodeStr = fileBase64EncodeStr.substring(1);
		sendPictures(fileBase64EncodeStr,photoIndex);
	});
});

litigation_collecting_address_details_page.live('pageshow',function(e, ui){

	currentLoadActionName = "litigation_collecting_address_details_load_content";
	var fromPage = session.get("_fromPage2");
	session.remove("_fromPage2");
	var fromPage1 = session.get("fromPage");//用于回退到此页面时不刷新

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
			var $collect_object_li = $("#litigation_collecting_address_details_collect_object");
		var $collect_object = $collect_object_li.find("[identity='collect_object']")
		$collect_object.text(dictData.name);
		$collect_object.attr("code",dictData.code);

		break;

		case ConstDef.getConstant("CATEGORY_CODE_CONTACT_METHOD"):
			//初始化联系方式
			var $contact_method_li = $("#litigation_collecting_address_details_contact_method");
		var contact_method = $contact_method_li.find("[identity='contact_method']")
		contact_method.text(dictData.name);
		contact_method.attr("code",dictData.code);
		break;

		case ConstDef.getConstant("CATEGORY_CODE_FIELD_COLLECT_ACTION_CODE"):
			//初始化行动代码

			var $action_code_li = $("#litigation_collecting_address_details_action_code");
		var $action_code = $action_code_li.find("[identity='action_code']")
		$action_code.text(dictData.name);
		$action_code.attr("code",dictData.code);
		break;

		case ConstDef.getConstant("NON_CATEGORY_CODE_ACTION_STATUS"):
			//初始化行动状态

			var $action_status_li = $("#litigation_collecting_address_details_action_status");
		var $action_status = $action_status_li.find("[identity='action_status']")
		$action_status.text(dictData.name);
		$action_status.attr("code",dictData.code);
		break;
		}

	}
	else if(fromPage1 != "image_zoom_page" 
		&& fromPage1 != "collection_case_details_view_page" 
			&& fromPage1 != "collection_css_picture_details"){

		//如果网络是连通的
		if(isNetworkConnected()){
			load_litigation_collecting_address_details_content();
		}
		else{

			//读取缓存
			var key = {};
			key.userId = session.get("userId");
			key.fun = "litigation_collecting_address_details_page";
			key.method = "load_litigation_collecting_address_details_content";
			keyExtra = {};
			keyExtra.collectingAddressID = session.get("collectingAddressID");
			key.extra = keyExtra;

			var extra={};
			extra.operation =ConstDef.getConstant("NATIVE_STORAGE_QUERY");
			extra.callback = "load_litigation_collecting_address_details_content_from_native_storage";
			extra.newDataKey = {};
			extra.newData = {};

			loadNativeStorage(key.userId, key.fun, key.method , key.extra, extra.operation,extra.callback,extra.newDataKey,extra.newData);
		}

	}

});

function litigation_collecting_address_details_load_content(){

}

//清空页面数据
function clear_litigation_collecting_address_details_content(){
	var currentPage = $("#litigation_collecting_address_details_page");
	currentPage.find('[tag="picBox"]').empty();
	currentPage.find("[identity='customer_name']").text("");
	currentPage.find("[identity='contract_number']").text("");
	currentPage.find("[identity='collect_record']").val("");

	litigation_collecting_address_details_default_values_set();
}

//设置页面元素默认值
function litigation_collecting_address_details_default_values_set(){
	var $collect_object_li = $("#litigation_collecting_address_details_collect_object");
	var $collect_object = $collect_object_li.find("[identity='collect_object']")
	$collect_object.text("借款人");
	$collect_object.attr("code","BORROWER");

	var $contact_method_li = $("#litigation_collecting_address_details_contact_method");
//	var $collect_object_li = $("#litigation_collecting_address_details_collect_object");
	var $contact_method = $contact_method_li.find("[identity='contact_method']")
	$contact_method.text("单位电话");
	$contact_method.attr("code","00001");

	//行动代码：actionCode
	var $action_code_li = $("#litigation_collecting_address_details_action_code");
	var $action_code = $action_code_li.find("[identity='action_code']")
	$action_code.text("实地借款人住址");
	$action_code.attr("code","00001009");

	//行动状态：actionState
	var $action_status_li = $("#litigation_collecting_address_details_action_status");
	var $action_status = $action_status_li.find("[identity='action_status']")
	$action_status.text("承诺");
	$action_status.attr("code","MPRM");

	var tenDaysLatter = GetDateStr(10);
	$("#litigation_collecting_address_details_page").find("[identity='next_time']").val(tenDaysLatter);
}
//加载详细，并显示
function load_litigation_collecting_address_details_content(){
	//清空页面数据
	clear_litigation_collecting_address_details_content();

	showLoading();
	var currentPage = $("#litigation_collecting_address_details_page");

	var postData = {};
	postData.random = new Date();
	postData.userCode = session.get("userCode");
	postData.collectingAddressID = session.get("collectingAddressID");
//	postData.caseRecordId =session.get("caseRecordId");
	$.getJSON(basePath+"/app/litigationCollectingAddressDetails/pageInit.xhtml"+callback, postData,function(msg){

		showHide();

		if($.trim(msg.returnCode) == '0'){

			//存入缓存
			var key = {};
			key.userId = session.get("userId");
			key.fun = "litigation_collecting_address_details_page";
			key.method = "load_litigation_collecting_address_details_content";
			keyExtra = {};
			keyExtra.collectingAddressID = session.get("collectingAddressID");
			key.extra = keyExtra;

			saveDownloadRawDataToNativeStorage(key.userId, key.fun, key.method, key.extra,msg);

			bind_litigation_collecting_address_details_to_page(msg);	

		}
		else{
			errorHandler(msg.returnCode,msg.message);
		}
	});//end $.getJSON
};

function load_litigation_collecting_address_details_content_from_native_storage(value){

	var currentPage = $("#litigation_collecting_address_details_page");

	if(value){
		showLoading();

		var msg = JSON.parse(value);

		bind_litigation_collecting_address_details_to_page(msg);		

		showHide();
		showMessage('当前网络处于离线状态，您正在查看缓存数据', '1500');
	}
	else{
		showMessage('当前网络处于离线状态，未读到缓存数据', '1500');
	}		
}

function bind_litigation_collecting_address_details_to_page(msg){

	var currentPage = $("#litigation_collecting_address_details_page");
	currentPage.find('[tag="picBox"]').empty();
	currentPage.find("[identity='customer_name']").text(msg.data.caseRecord.customerName);
	currentPage.find("[identity='contract_number']").text(msg.data.caseRecord.contractNumber);
	currentPage.find("[identity='contract_number']").attr("contractNumber",msg.data.caseRecord.contractNumber);
	currentPage.find("[identity='collect_record']").val("");

	session.set("contractId",msg.data.caseRecord.contractId);//进入案件详情画面可使用该参数
	session.set("caseId",msg.data.caseRecord.caseId);//进入查看CSS催收照片大图画面，可使用该参数

	//如果已经保存催记，则显示保存的催记信息
	var collectionRecord = msg.data.collectionRecord;
	
	if(collectionRecord != null && collectionRecord.status != ConstDef.getConstant("COLLECTION_RECORD_STATUS_UN_SAVE")){

		//保存成功后返回的已保存的催记ID
		var $currentPage =$("#litigation_collecting_address_details_page");
		$currentPage.find(".SaveBtn1").attr("collectionRecordId",collectionRecord.id);

		//催收对象：collectCustomer
		var collectObjectList = msg.data.collectObjectList;
		$.each(collectObjectList,function(i,n){
			if(n.code == collectionRecord.collectCustomer){
				var $collect_object_li = $("#litigation_collecting_address_details_collect_object");
				var $collect_object = $collect_object_li.find("[identity='collect_object']")
				$collect_object.text(n.name);
				$collect_object.attr("code",n.code);

			}
		});

		//联系方式：contractMethod
		var contractMethodList = msg.data.contractMethodList;
		$.each(contractMethodList,function(i,n){
			if(n.code == collectionRecord.contractMethod){
				var contractMethodList = $("#litigation_collecting_address_details_contact_method");
				var $contact_method = contractMethodList.find("[identity='contact_method']")
				$contact_method.text(n.name);
				$contact_method.attr("code",n.code);

			}
		});

		//行动代码：actionCode
		var actionCodeList = msg.data.actionCodeList;
		$.each(actionCodeList,function(i,n){
			if(n.code == collectionRecord.actionCode){
				var $action_code_li = $("#litigation_collecting_address_details_action_code");
				var $action_code = $action_code_li.find("[identity='action_code']")
				$action_code.text(n.name);
				$action_code.attr("code",n.code);

			}
		});

		//行动状态：actionState
		var actionStatusList = msg.data.actionStatusList;
		$.each(actionStatusList,function(i,n){
			if(n.code == collectionRecord.actionState){
				var $action_status_li = $("#litigation_collecting_address_details_action_status");
				var $action_status = $action_status_li.find("[identity='action_status']")
				$action_status.text(n.name);
				$action_status.attr("code",n.code);

			}
		});

		currentPage.find("[identity='collect_record']").val(collectionRecord.collectRecord);

		//显示催收照片
		var collectionRecordPictures = msg.data.collectionRecordPictures;
		$.each(collectionRecordPictures,function(i,n){
			if(n.extension){

				var $item = $('<dl class="act"><dt><img alt=""></dt><dd></dd></dl>');

				//显示图片
				var $image = $item.find('img');
				$image.attr('src',"data:image/jpeg;base64,"+n.extension);
				$image.attr('attachmentId',n.attachmentId);

				//显示照片时，记录照片在服务器端的Id，并初始化状态为 "normal"
				$image.attr("collectionRecordPictureId",n.id);
				$image.attr("status","saved");//保存过的照片

				currentPage.find('[tag="picBox"]').append($item);
			}

		});

		currentPage.find("[identity='next_time']").val(collectionRecord.nextTime.substring(0,10));
		//若催记已提交（collectionRecord.status == "2"）,则不可编辑
		if(collectionRecord.status == "2"){
			currentPage.find(".detailDiv li").off("tap");
			currentPage.find(".bottoms2-red li:last").off("tap");
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

			currentPage.find('[tag="picBox"] dd').hide();
		}
		else{

			litigation_collecting_address_details_page_handler.litigation_collecting_address_details_page_init();
			currentPage.find("[identity]").removeAttr("disabled");
			currentPage.find("[id=litigation_collecting_address_details_collect_object] span:last").addClass("allBtn_down");
			currentPage.find("[id=litigation_collecting_address_details_contact_method] span:last").addClass("allBtn_down");
			currentPage.find("[id=litigation_collecting_address_details_action_code] span:last").addClass("allBtn_down");
			currentPage.find("[id=litigation_collecting_address_details_action_status] span:last").addClass("allBtn_down");
			currentPage.find("[identity='next_time']").next().show();
			currentPage.find("[identity='next_time']").next().attr("display","inline-block;");

			currentPage.find("[identity='collect_record']").parent(".remark").children("#collectRecordDiv").remove();
			currentPage.find("[identity='collect_record']").parent(".remark").removeAttr("min-height");
			currentPage.find("[identity='collect_record']").show();

			currentPage.find(".SaveBtn1").show();
			currentPage.find(".SaveBtn2").show();

			currentPage.find('[tag="picBox"] dd').show();
		}

	}
	else{
		//清空数据
		//催收对象：collectCustomer
		litigation_collecting_address_details_default_values_set();

		currentPage.find("[identity='collect_record']").val("");
		currentPage.find("[identity='collect_record']").parent(".remark").children("#collectRecordDiv").remove();
		currentPage.find("[identity='collect_record']").parent(".remark").removeAttr("min-height");
		currentPage.find("[identity='collect_record']").show();

		//清空催收照片
		currentPage.find('[tag="picBox"]').empty();

		litigation_collecting_address_details_page_handler.litigation_collecting_address_details_page_init();
		currentPage.find("[identity]").removeAttr("disabled");

		currentPage.find("[id=litigation_collecting_address_details_collect_object] span:last").addClass("allBtn_down");
		currentPage.find("[id=litigation_collecting_address_details_contact_method] span:last").addClass("allBtn_down");
		currentPage.find("[id=litigation_collecting_address_details_action_code] span:last").addClass("allBtn_down");
		currentPage.find("[id=litigation_collecting_address_details_action_status] span:last").addClass("allBtn_down");
		currentPage.find("[identity='next_time']").next().show();
		currentPage.find("[identity='next_time']").next().attr("display","inline-block;");

		currentPage.find(".SaveBtn1").show();
		currentPage.find(".SaveBtn2").show();
	}
}

//保存催记
function saveLitigCollectionRecord(){
	var page = $('#litigation_collecting_address_details_page');

	var postData = {};
	postData.userCode = session.get("userCode");
	postData.userId = session.get("userId");
	postData.collectingAddressID = session.get("collectingAddressID");
	
	postData.contract_number = page.find("[identity='contract_number']").attr("contractNumber");
	
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
	
	var formData = new FormData();//定义要上传的催记数据的存储

	formData.append("userCode",postData.userCode);
	formData.append("collectingAddressID",postData.collectingAddressID);
	formData.append("contractNumber",postData.contract_number);
	formData.append("collectCustomer",postData.collect_object);
	formData.append("contactMehtod",postData.contact_method);
	formData.append("actionCode",postData.action_code);
	formData.append("actionState",postData.action_state);
	formData.append("nextTime",postData.next_time);
	formData.append("collectRecord",postData.collect_record);

	//获取要上传的图片及要删除的图片
	var litigation_collecting_address_details_page = $('#litigation_collecting_address_details_page');
	var $images = litigation_collecting_address_details_page.find('[tag="picBox"] img')

	//要删除的文件的id
	$.each(deletedFiles,function(i,n){
		formData.append("deletedFiles", n);
	});

	$.each($images,function(i,n){
		//如果是新拍的照片，则上传文件 
		if($(n).attr('status') == 'new'){
			var file = dataURItoBlob($(n).attr('src'));
			formData.append("img", file);
			formData.append("newFiles",$(n).attr('collectionRecordPictureId'));
		}
	});//end $.each($images,function(i,n){
		
	//如果网络是连通的
	if(isNetworkConnected()){

		//上传催记数据
		$.ajax({
			url: basePath+"/app/litigationCollectingAddressDetails/upload.xhtml", //这个地址做了跨域处理
			data: formData,
			processData: false,
			contentType: false,
			type: 'POST',
			dataType: 'json',
			async:true,
			beforeSend: function () {
				showLoading();
			},
			success: function (msg) {

				showHide();

				if($.trim(msg.returnCode) == '0') {

					if(msg.data){
						if(msg.data.result == "success"){
							//保存成功后，所有照片的状态置为 'saved' 状态
							var litigation_collecting_address_details_page = $('#litigation_collecting_address_details_page');
							litigation_collecting_address_details_page.find('[tag="picBox"] img').attr("status","saved");

							//清空deletedFiles数组
							deletedFiles.length = 0;

							//保存成功后返回已保存的催记ID
							var $currentPage =$("#litigation_collecting_address_details_page");
							$currentPage.find(".SaveBtn1").attr("collectionRecordId",msg.data.collectionRecordId);
						}
					}

					showMessage(msg.message,'2000');
				}
				else{
					errorHandler(msg.returnCode,msg.message);
				}
			},
			complete: function() {

			}
		});

	}
	else{//如果网络未连通
		postData.deletedFiles = formData.getAll("deletedFiles");
		postData.img = formData.getAll("img");//图片数据内容
		postData.newFiles = formData.getAll("newFiles");//图片的Id

		//将要保存的催记内容保存到手机缓存（将上行数据存入缓存）
		var userId = session.get("userId");
		var fun = "litigation_collecting_address_details";
		var method = "saveLitigCollectionRecord";
		var action = basePath+"/app/litigationCollectingAddressDetails/upload.xhtml";
		var data = postData;
		saveUploadDataToNativeStorage(userId, fun, method, action, data);
	}
}//end saveLitigCollectionRecord

/*function saveCollectionRecordToNativeStorage(){
	
	var page = $('#litigation_collecting_address_details_page');

	var postData = {};
	postData.collectingAddressID = session.get("collectingAddressID");
	postData.contract_number = page.find("[identity='contract_number']").text();
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


	//取得所有要上传的图片
	var litigation_collecting_address_details_page = $('#litigation_collecting_address_details_page');
	var $images = litigation_collecting_address_details_page.find('[tag="picBox"] img:visible')

	var imagesBase64DataArray = new Array();
	$.each($images,function(i,n){
		imagesBase64DataArray.push($(n).attr('src'));
	});

	postData.images = imagesBase64DataArray;

	//将上行数据存入缓存
	var userId = session.get("userId");
	var fun = "litigation_collecting_address_details";
	var method = "saveLitigCollectionRecord";
	var action = basePath+"/app/litigationCollectingAddressDetails/saveLitigCollectionRecord.xhtml";
	var data = postData;
	saveUploadDataToNativeStorage(userId, fun, method, action, data);
}*/

function submitLitigCollectionRecord(){

	var page = $('#litigation_collecting_address_details_page');

	var collect_object = page.find("[identity='collect_object']").attr("code");
	var contact_method = page.find("[identity='contact_method']").attr("code");
	var action_code = page.find("[identity='action_code']").attr("code");
	if(action_code != undefined || action_code != null){
		action_code = action_code;
	}else{
		action_code = "";
	}
	var action_state = page.find("[identity='action_status']").attr("code");
	var next_time_t = page.find("[identity='next_time']").val();
	var next_time = "";
	if(next_time_t != ""){
		next_time_t = next_time_t.replace("-","/");
		next_time_t = next_time_t.replace("-","/");
		next_time =next_time_t+" 00/00/00";
	}

	var collect_record = page.find("[identity='collect_record']").val();

	var $images = page.find('[tag="picBox"] img');

	//页面数据非空校验
	if(!collect_object){
		showMessage('请选择催收对象！','1500');
		return false;
	}

	if(!contact_method){
		showMessage('请选择联系方式！','1500');
		return false;
	}

	if(!action_code){
		showMessage('请选择行动代码！','1500');
		return false;
	}

	if(!action_state){
		showMessage('请选择行动状态！','1500');
		return false;
	}

	if(!next_time_t){
		showMessage('请选择下次约会时间！','1500');
		return false;
	}

	if(!collect_record){
		showMessage('请填写催收记录！','1500');
		page.find("input[identity='remark']").focus();
		return false;
	}

	if($images.length==0){
		showMessage('请先拍照后再提交催记！','1500');
		return false;
	}

	showConfirm("请确认数据是否正确，提交后将不能再进行更改", function(){
		showLoading();

		var formData = new FormData();//定义要上传的催记数据的存储

		formData.append("collectingAddressID",session.get("collectingAddressID"));
		formData.append("collectCustomer",collect_object);
		formData.append("contactMehtod",contact_method);
		formData.append("actionCode",action_code);
		formData.append("actionState",action_state);
		formData.append("nextTime",next_time);
		formData.append("collectRecord",collect_record);

		//要删除的文件的id
		$.each(deletedFiles,function(i,n){
			formData.append("deletedFiles", n);
		});

		$.each($images,function(i,n){
			//如果是新拍的照片，则上传文件 
			if($(n).attr('status') == 'new'){
				var file = dataURItoBlob($(n).attr('src'));
				formData.append("img", file);
				formData.append("newFiles",$(n).attr('collectionRecordPictureId'));
			}
		});

		var userInfo = JSON.parse(session.get("userInfo"));
		var userCssCode = "";
		if(userInfo.userMapping.CSS != undefined && userInfo.userMapping.CSS != null){
			userCssCode = userInfo.userMapping.CSS;
		}

		var userCode = session.get("userCode");
		var collectionRecordId = page.find(".SaveBtn1").attr("collectionRecordId");
		var contract_number = page.find("[identity='contract_number']").attr("contractNumber");
		
		formData.append("userCssCode",userCssCode);
		formData.append("userCode",userCode);
		formData.append("collectionRecordId",collectionRecordId);
		formData.append("contractNumber",contract_number);

		//上传催记数据
		$.ajax({
			url: basePath+"/app/litigationCollectingAddressDetails/submitLitigCollectionRecord.xhtml", 
			data: formData,
			processData: false,
			contentType: false,
			type: 'POST',
			dataType: 'json',
			async:true,
			beforeSend: function () {
				showLoading();
			},
			success: function (msg) {
				showHide();
				if($.trim(msg.returnCode) == '0') {
					if(msg.data){
						if(msg.data.result == "success"){
							//保存成功后，所有照片的状态置为 'saved' 状态
							var litigation_collecting_address_details_page = $('#litigation_collecting_address_details_page');
							litigation_collecting_address_details_page.find('[tag="picBox"] img').attr("status","saved");

							//清空deletedFiles数组
							deletedFiles.length = 0;

							//保存成功后返回已保存的催记ID
							litigation_collecting_address_details_page.find(".SaveBtn1").attr("collectionRecordId",msg.data.collectionRecordId);
						}
					}

					showMessage(msg.message,'2000');
					setTimeout(function(){
						back_page();
					},2500);
				}
				else{
					errorHandler(msg.returnCode,msg.message);
				}
			},
			complete: function() {

			}
		});
	});
}

//--------------------
//以下 原生->H5 回调
//--------------------
//相机拍照的回调
function onCameraDone4LitigCollectingAddressDetails(src) {
	showLoading();

	var collectionRecordPictureId = uuid();//生成新拍图片的文件的Id
	var litigation_collecting_address_details_page = $('#litigation_collecting_address_details_page');
	var $item = $('<dl class="act"><dt><img alt="" status="new" collectionRecordPictureId="'+collectionRecordPictureId+'"></dt><dd></dd></dl>');
	var $image = $item.find('img');

	//图片加水印
	var imgsrc = src;
	if (/^data:/.test(imgsrc)) imgsrc = dataURItoBlob(imgsrc);
	watermark([imgsrc])
	.dataUrl(watermark.text.lowerRight(getWatermarkWord(), '25px 微软雅黑', '#fff', 0.5))
	.then(function(url) {


		/************图片压缩begin*********************/
		lrz(url, { quality: 0.7 })  //压缩比
		.then(function (rst) {
			$image.attr('src', rst.base64);
			litigation_collecting_address_details_page.find('[tag="picBox"]').append($item);
		})
		.catch(function (err){
			showMessage('ERROR:图片压缩出错！','1500');
		}
		)
		.always(function () {
			showHide();
		});
		/*****************图片压缩end********************/      

	});
}

//拼装水印文字
function getWatermarkWord() {

	var username = session.get("userName");
	var waterText = username + " " + getNowString();

	if(!newAddress){
		waterText = waterText +" 经度:" + newLongitude+" 纬度:"+ newLatitude;

	}else{
		waterText += newAddress;
	}
	return   waterText;

}
