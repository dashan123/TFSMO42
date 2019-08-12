var collecting_address_list_page = $('#collecting_address_list_page');
var collectingAddressListPageHandler ={};
var collecting_address_list_myScroll;
/******************************home_page---begin**************************************/
collecting_address_list_page.live('pageinit',function(e, ui){
	var wrapper = "collecting_address_list_wrapper";
	var up = "collecting_address_list_pullUp";
	var down = "collecting_address_list_pullDown";
	collecting_address_list_myScroll = createMyScroll(wrapper,up,down);
	//回退事件处理
	collecting_address_list_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page('workbench_page');
	});

	//在催地址列表项目点击事件
	collecting_address_list_page.find(".ListRow").live("tap",function(e){

		var $collectButton = $(this).find("a[identity='collect-button']");
		var collectingStatus = $collectButton.attr("collectingStatus")
		//业务类型：1催收 2诉讼
		var businessFlag = $collectButton.attr("businessFlag")
		//内部案件号
		var caseId = $collectButton.attr("caseId")
		//内部合同号
		var contractId = $collectButton.attr("contractId")
		
		if(collectingStatus == 1){
			session.set("page_keyword","在催地址列表");
			session.set("page_title","在催地址列表");
			session.set("page_from","collecting_address_list_page");

			var collectingAddressID =  $(this).find("a[identity='collect-button']").attr("collectingAddressID");
			session.set("collectingAddressID",collectingAddressID);

			//设置当前选项的index到session中
			var scrollCurrentElementIndex = 0;
			var scrollCurrentElementNum = $(this).attr("scrollCurrentElementNum");
			var scrollCurrentPage = $(this).attr("scrollCurrentPage");
			var pageDisplayCount = session.get("pageDisplayCount");
	 	    var pageAddCount = session.get("pageAddCount");
	 	   if(scrollCurrentPage <= 1){
	 		   	scrollCurrentElementIndex = parseInt(scrollCurrentElementNum)+1;
		    }else{
		    	scrollCurrentElementIndex = parseInt(pageDisplayCount)+((parseInt(scrollCurrentPage)-2)*parseInt(pageAddCount))+parseInt(scrollCurrentElementNum)+1;
		    }
			var scrollMapJSON = {};
			scrollMapJSON.scrollCurrentElementIndex = scrollCurrentElementIndex;
			scrollMap.collecting_address_list_page = JSON.stringify(scrollMapJSON);
			
			//业务类型：1催收 2诉讼
			if(businessFlag == '1'){
				goto_page("collecting_address_details_page");
			}else{
				session.set("caseId",caseId);
				session.set("contractId",contractId);
				goto_page("litigation_task_handle_page");
			}
			
		}else{
			showMessage('您还没有开始催收，请先开始催收','1500');
		}

	});

	//添加地址--案件（合同）查询
	collecting_address_list_page.find(".AddressAddBtn").live('tap',function(){
		goto_page("case_query_page");
	});

	//开始返程/结束返程
	var $returnBackHomeButton = $("#collecting_address_list_page [identity='return-back-home']");
	$returnBackHomeButton.live("tap",function(event){
		return_back_home(this);
		event.stopPropagation();
	});
});
/******************************home_page---end**************************************/
collecting_address_list_page.live('pageshow',function(e, ui){

	currentLoadActionName  = "collecting_address_list_load_content";
	//防止断网导致 返程  按钮不可用
	$("#collecting_address_list_page").find('[identity="collect-button"]').attr("enable","true");
	$("#collecting_address_list_page").find('[identity="return-back-home"]').attr("enable","true");
	//如果网络是连通的
	if(isNetworkConnected()){
		var fromPage = session.get("fromPage");
		if(fromPage != "collecting_address_details_page"){
			load_collecting_address_list_content();
		}
		else{
			// 获取当前页的index
			var scrollCurrentElementIndex = 0;
	 	    var scrollNowPage = session.get("nowPage");
	 	    if(!$.isEmptyObject(scrollMap)){
	 	    	var commonScrollMapJsonObj = scrollMap[scrollNowPage];
	 	    	if(commonScrollMapJsonObj != null && typeof(commonScrollMapJsonObj) != "undefined"){
	 	    		commonScrollMapJsonObj = JSON.parse(commonScrollMapJsonObj);
	 	 	 	    scrollCurrentElementIndex = commonScrollMapJsonObj.scrollCurrentElementIndex;
	 	 	 	    //删除Json数据中的scrollNowPage属性  
	 	 	 	    delete scrollMap[scrollNowPage]; 
	 	    	}
	 	    }
			var scrollCurrentElement = $('#collecting_address_list_page').find('.ListRow').get(scrollCurrentElementIndex);
			collecting_address_list_myScroll.refresh();//刷新iScroll
			collecting_address_list_myScroll.scrollToElement(scrollCurrentElement,0);
		}
	}
	else{

		//读取缓存
		var key = {};
		key.userId = session.get("userId");
		key.fun = "collecting_address_list";
		key.method = "load_collecting_address_list_content";
		key.extra = {};


		var extra={};
		extra.operation =ConstDef.getConstant("NATIVE_STORAGE_QUERY");
		extra.callback = "load_collecting_address_list_content_from_native_storage";
		extra.newDataKey = {};
		extra.newData = {};

		loadNativeStorage(key.userId, key.fun, key.method , key.extra, extra.operation,extra.callback,extra.newDataKey,extra.newData);
	}
});

function collecting_address_list_load_content(){
	//下拉不刷新，则该方法置空
}

//在线加载在催地址列表，并显示
function load_collecting_address_list_content(){

	var $collecting_address_list = $("#collecting_address_list_page .List");
	$collecting_address_list.empty();

	showLoading();

	var authData = {};
	authData.random = new Date();
	authData.userCode = session.get("userCode");
	authData.userId = session.get("userId");

	$.getJSON(basePath+"/app/collectingAddressList/pageInit.xhtml"+callback, authData,function(msg){
		if($.trim(msg.returnCode) == '0'){

			//存入缓存
			var key = {};
			key.userId = session.get("userId");
			key.fun = "collecting_address_list";
			key.method = "load_collecting_address_list_content";
			key.extra = {};

			saveDownloadDataToNativeStorage(key.userId, key.fun, key.method, key.extra,msg,"id");

			bind_collecting_address_list_to_page(msg);

			showHide();
		}
		else{
			showHide();
			errorHandler(msg.returnCode,msg.message);
		}
	});//end $.getJSON
}
//从缓存加载在催地址列表，并显示
function load_collecting_address_list_content_from_native_storage(value){

	var $collecting_address_list = $("#collecting_address_list_page .List");
	$collecting_address_list.empty();

	if(value){
		showLoading();

		var msg = JSON.parse(value);

		bind_collecting_address_list_to_page(msg);

		showHide();
		showMessage('当前网络处于离线状态，您正在查看缓存数据', '1500');
	}
	else{
		showMessage('当前网络处于离线状态，未读到缓存数据', '1500');
	}
}

function bind_collecting_address_list_to_page(msg){

	var $collecting_address_list = $("#collecting_address_list_page .List");

	if(msg.data.length<=0){
		showHide();
		//		showMessage('暂无数据','1500');

		//获取返回驻地按钮
		var $returnBackHomeButton = $("#collecting_address_list_page [identity='return-back-home']");

		//设置返回驻地按钮是否可以点击
		$returnBackHomeButton.attr({ clickable: "true"});

		//检查是否正在返程途中
		var returningHome = false;

		//如果在返回途中  msg.checkCode =="1"为正在返程途中
		if(msg.checkCode =="1"){
			returningHome = true;
		}
		$returnBackHomeButton.children("span").text(msg.checkCode=="1"?"结束":"开始");
		var imgSrc = msg.checkCode=="1"?"images/tfsred/EndIcon1.png":"images/tfsred/StaBtn.png";
		$returnBackHomeButton.find("img").removeAttr("src");
		$returnBackHomeButton.find("img").attr("src",imgSrc);
		$returnBackHomeButton.attr("RETURN_HOME_STATUS",msg.checkCode);

		return;
	}

	//检查当前是否有正在进行的催收
	var hasCollectingAddress = false;//false代表没有正在进行的催收
	$.each(msg.data,function(i,n){
		if(n["collectingStatus"]==1){
			hasCollectingAddress = true;
		}
	});

	//获取返回驻地按钮
	var $returnBackHomeButton = $("#collecting_address_list_page [identity='return-back-home']");

	//设置返回驻地按钮是否可以点击
	if(hasCollectingAddress){
		$returnBackHomeButton.attr({ clickable: "false"});
	}
	else{
		$returnBackHomeButton.attr({ clickable: "true"});
	}

	//检查是否正在返程途中
	var returningHome = false;

	//如果在返回途中  msg.checkCode =="1"为正在返程途中
	if(msg.checkCode =="1"){
		returningHome = true;
	}
	$returnBackHomeButton.children("span").text(msg.checkCode=="1"?"结束":"开始");
	var imgSrc = msg.checkCode=="1"?"images/tfsred/EndIcon1.png":"images/tfsred/StaBtn.png";
	$returnBackHomeButton.find("img").removeAttr("src");
	$returnBackHomeButton.find("img").attr("src",imgSrc);
	$returnBackHomeButton.attr("RETURN_HOME_STATUS",msg.checkCode);

	var isRunning = hasCollectingAddress || returningHome;

	//在催地址列表的初始化
	var $template = $("#collecting_address_list_page .list-row-template");

	$.each(msg.data,function(i,n){

		var $collectingAddressItem = $template.clone(true);

		//如果当前地址不在催，则绑定删除确认事件
		if(n["collectingStatus"]!=1){
			$collectingAddressItem.bind("swipeleft",{collectingAddressID:n["id"]},function(e){

				showConfirmDialog("您确认要删除吗？",e.data, delete_collecting_address);
			});
		}

		$collectingAddressItem.find("[identity='contractNumber']").text(n["contractNumber"]);
		$collectingAddressItem.find("[identity='customerName']").text(n["customerName"]);
		$collectingAddressItem.find("[identity='address']").text(n["address"]);
		$collectingAddressItem.find("[identity='addressType']").text(n["addressType"]);
		$collectingAddressItem.find("[identity='licenseplateNumber']").text(n["licenseplateNumber"]);
		$collectingAddressItem.find("[identity='payoutStatus']").text(n["payoutStatus"]);
		$collectingAddressItem.find("[identity='overdueDays']").text(n["overdueDays"]);

		var address = $collectingAddressItem.find("[identity='address']").text();
		$collectingAddressItem.find("[identity='address']").bind("tap",function(event){
			callNavi(address);
			event.stopPropagation();
		})

		var $collectButton = $collectingAddressItem.find("a[identity='collect-button']");
		var pageType = session.get("collecting_address_list_page_type");

		$collectButton.children("span").text(n["collectingStatus"]==1?"结束":"开始");
		var imgSrc = n["collectingStatus"]==1?"images/tfsred/EndIcon.png":"images/tfsred/StaBtn1.png";
		$collectButton.find("img").removeAttr("src");
		$collectButton.find("img").attr("src",imgSrc);
		$collectButton.attr("collectingStatus",n["collectingStatus"]);

		$collectButton.attr("collectingAddressID",n["id"]);
		$collectButton.attr("caseRecordId",n["caseRecordId"]);
		//业务类型：1催收 2诉讼
		$collectButton.attr("businessFlag",n["businessFlag"]);
		//内部案件号
		$collectButton.attr("caseId",n["caseId"]);
		//内部合同号
		$collectButton.attr("contractId",n["contractId"]);


		//如果有正在进行的催收或正在返程途中
		if(isRunning){
			//只有正在进行的催收是可以执行事件的
			if(n["collectingStatus"]==1){
				$collectButton.attr({ clickable: "true"});
			}
			else{
				$collectButton.attr({ clickable: "false"});

			}
		}
		else{
			$collectButton.attr({ clickable: "true"});

		}

		$collectButton.bind("tap",function(event){
			run_collect(this);
			event.stopPropagation();
		});

		//用于返回该页面时计算选项的index
		$collectingAddressItem.find(".ListRow").attr("scrollCurrentPage",1);
		$collectingAddressItem.find(".ListRow").attr("scrollCurrentElementNum",i);
		
		$collectingAddressItem.removeClass("list-row-template");
		$collectingAddressItem.show();


		$collecting_address_list.append($collectingAddressItem);
	});//end $.each
}//end bind_collecting_address_list_to_page

//开始/结束催收

function run_collect(collectButton){

	var $collectButton = $(collectButton);
	if($collectButton.attr("clickable")=="true"){
		console.log("可以点击");

		//查看当前按钮是否不可用
		if($collectButton.attr("enable") === "false" ){
			console.log("不可用分支：");
			return;
		}
		else{
			console.log("可用分支：");
			$collectButton.attr("enable","false");//将按钮置为不可用。
			
			var paramObj = {};
			paramObj.collectingAddressID = $collectButton.attr("collectingAddressID");
			paramObj.caseRecordId = $collectButton.attr("caseRecordId");
			//业务类型：1催收 2诉讼
			paramObj.businessFlag = $collectButton.attr("businessFlag");
			
			//如果当前催收正在进行
			if($collectButton.attr("collectingStatus") == 1){

				finish_collect(paramObj);
			}
			else{
				start_collect(paramObj);
			}
			
		}
		
	}
	else{
		console.log("不可点击");
	}
}//end run_collect

function start_collect(paramObj){

	//标记尚未拍照
	//	session.set("hasPictures",false);
	var userInfo = JSON.parse(session.get("userInfo"));
	//如果已签入
	if (ConstDef.getConstant("ONLINE_STATUS_SIGNIN") == userInfo.user.onlineStatus) {
		var postData = {};
		var userInfo = JSON.parse(session.get("userInfo"));
		postData.onlineStatus = userInfo.user.onlineStatus;
		postData.userId = session.get("userId");
		postData.userCode = session.get("userCode");
		//当前在催地址ID
		postData.collectingAddressID = paramObj.collectingAddressID;
		postData.caseRecordId = paramObj.caseRecordId;
		//业务类型：1催收 2诉讼
		postData.businessFlag = paramObj.businessFlag;

		//手机端当前时间
//		var currentDatetime = new Date().Format("YYYY/MM/DD HH/mm/ss");

//		postData.currentDatetime = currentDatetime;
		//如果网络是连通的
		if(isNetworkConnected()){
			$.getJSON(basePath+"/app/collectingAddressList/startCollect.xhtml"+callback, postData,function(msg){
				showHide();
//				$("#collecting_address_list_page").find('[identity="return-back-home"]').attr("enable","true");
				$("#collecting_address_list_page").find('[collectingaddressid="'+postData.collectingAddressID+'"]').attr("enable","true");
				
				if($.trim(msg.returnCode) == '0'){
					if(msg.data =="NOT-CHECK-IN"){
						
						showMessage(msg.message,'1500');
					}
					else if(msg.data =="DRIVING"){
						
						showMessage(msg.message,'2500');
					}
					else{
						console.log("已经开始催收");
						load_collecting_address_list_content();
					}

				}else{
//					showHide();
					errorHandler(msg.returnCode,msg.message);
				}
			});
		}
		else{//网络没有连通时
			//将上行数据存入缓存
			var userId = session.get("userId");
			var fun = "collecting_address_list";
			var method = "start_collect";
			var action = basePath+"/app/collectingAddressList/startCollect.xhtml";
			var data = postData;
			saveUploadDataToNativeStorage(userId, fun, method, action, data);


			//读取缓存（在催地址列表离线数据），更改在催地址状态 更改为进行中,并重新从缓存加载在催地址列表
			var key = {};
			key.userId = session.get("userId");
			key.fun = "collecting_address_list";
			key.method = "load_collecting_address_list_content";
			key.extra = {};

			var extra={};
			extra.operation =ConstDef.getConstant("NATIVE_STORAGE_MODIFY");
			extra.callback = "load_collecting_address_list_content_from_native_storage";
			extra.newDataKey = paramObj.collectingAddressID ;//要更改的在催地址的ID
			extra.newData = {};
			extra.newData.collectingStatus = ConstDef.getConstant("COLLECTING_STATUS_STARTED") ;//正在催收

			loadNativeStorage(key.userId, key.fun, key.method , key.extra, extra.operation,extra.callback,extra.newDataKey,extra.newData);
		}
	}
	else{
		showMessage("您还没有签入，请先签入！",'1500');
	}
}//end finish_collect


function finish_collect(paramObj){

	var postData = {};
	postData.userCode = session.get("userCode");
	postData.random = new Date();
	//当前在催地址ID
	postData.userId = session.get("userId");
	postData.userCode = session.get("userCode");
	postData.collectingAddressID = paramObj.collectingAddressID;
	postData.caseRecordId = paramObj.caseRecordId;
	//业务类型：1催收 2诉讼
	postData.businessFlag = paramObj.businessFlag;
	//手机端当前时间
//	var currentDatetime = new Date().Format("YYYY/MM/DD HH/mm/ss");
//	postData.currentDatetime = currentDatetime;

	//如果网络是连通的
	if(isNetworkConnected()){
		showLoading();

		//结束催收前校验是否有催记照片
		var postData2 = {};
		postData2.collectingAddressID = paramObj.collectingAddressID;
		//		showLoading();
		$.getJSON(basePath+"/app/collectingAddressList/queryCollCollectionRecordPicture.xhtml"+callback, postData2,function(msg2){
			
			$("#collecting_address_list_page").find('[collectingaddressid="'+postData.collectingAddressID+'"]').attr("enable","true");
			
			if($.trim(msg2.returnCode) == '0'){
				showHide();
				var _func = function(){
					showLoading();
					$.getJSON(basePath+"/app/collectingAddressList/finishCollect.xhtml"+callback, postData,function(msg){
						if($.trim(msg.returnCode) == '0'){
							console.log("已经结束催收");
							showHide();
							showMessage(msg.message,'1500');

							//计算里程数
							var returnData = msg.data;
							if(returnData !=null){

								var travelId = returnData.travelRecord.id;
								//获取所有的点
								var lineArr = returnData.locationArray;
								coll_calculateDistance(travelId,lineArr);
							}

							load_collecting_address_list_content();
						}else{
							showHide();
							errorHandler(msg.returnCode,msg.message);
						}
					});
				};
				if(msg2.data.pictureCount <= 0){
//					messageText2 = "催记已拍摄照片，请确认是否结束催收！";
					var messageText2= "催记没有照片，请确认是否结束催收！";
					showConfirm(messageText2,_func );
				}
				else{
					_func();
				}


			}else{
				showHide();
				errorHandler(msg.returnCode,msg.message);
			}
		});//end $.getJSON
	}
	else{
		var messageText = "结束催收后不可再拍照，请确认是否结束催收！";
		showConfirm(messageText, function(){
			//将上行数据存入缓存
			var userId = session.get("userId");
			var fun = "collecting_address_list";
			var method = "finish_collect";
			var action = basePath+"/app/collectingAddressList/finishCollect.xhtml";
			var data = postData;
			saveUploadDataToNativeStorage(userId, fun, method, action, data);

			//读取缓存（在催地址列表离线数据），删除当前在催地址列表项,并重新从缓存加载在催地址列表
			var key = {};
			key.userId = session.get("userId");
			key.fun = "collecting_address_list";
			key.method = "load_collecting_address_list_content";
			key.extra = {};

			var extra={};
			extra.operation =ConstDef.getConstant("NATIVE_STORAGE_REMOVE");
			extra.callback = "load_collecting_address_list_content_from_native_storage";
			extra.newDataKey = paramObj.collectingAddressID ;//要更改的在催地址的ID
			extra.newData = {};

			loadNativeStorage(key.userId, key.fun, key.method , key.extra, extra.operation,extra.callback,extra.newDataKey,extra.newData);

		});	
	}
}//end finish_collect

//开始/结束 返程
function return_back_home(returnBackHomeButton){
	var $returnBackHomeButton = $(returnBackHomeButton);
	if($returnBackHomeButton.attr("clickable")=="true"){
		console.log("可以点击");
		
		//查看当前按钮是否不可用
		if($returnBackHomeButton.attr("enable") === "false" ){
			console.log("不可用分支：");
			return;
		}
		else{
			console.log("可用分支：");
			$returnBackHomeButton.attr("enable","false");//将按钮置为不可用。
			
			//如果当前催收正在进行
			if($returnBackHomeButton.attr("RETURN_HOME_STATUS") == "1"){
				finish_return_home();
			}
			else{
				start_return_home();
			}
		}
	}
	else{
		console.log("不可点击");//此处的不可点击是因为有正在进行的其它地址
	}
}//end return_back_home

//开始返程
function start_return_home(){
//	showLoading();
	var postData = {};
	var userInfo = JSON.parse(session.get("userInfo"));
	postData.userId = session.get("userId");
	postData.userCode = session.get("userCode");
	postData.onlineStatus = userInfo.user.onlineStatus;  
	
	//手机端当前时间
	var currentDatetime = new Date().Format("YYYY/MM/DD HH/mm/ss");

	postData.currentDatetime = currentDatetime;

	//如果网络是连通的
	if(isNetworkConnected()){
		showLoading();
		$.getJSON(basePath+"/app/collectingAddressList/startReturnHome.xhtml"+callback, postData,function(msg){
			showHide();
			$("#collecting_address_list_page").find('[identity="return-back-home"]').attr("enable","true");
			if($.trim(msg.returnCode) == '0'){
				if(msg.data =="NOT-CHECK-IN"){
					
					showMessage(msg.message,'1500');
				}
				else if(msg.data =="DRIVING"){
					showMessage(msg.message,'2500');
				}
				else{
					console.log("已经开始返程");
					load_collecting_address_list_content();
				}

			}else{
				
				errorHandler(msg.returnCode,msg.message);
			}
		});
	}
	else{

		var messageText = "当前网络处于离线状态，确认开始返程吗？";
		showConfirm(messageText, function(){
			//将上行数据存入缓存
			var userId = session.get("userId");
			var fun = "collecting_address_list";
			var method = "start_return_home";
			var action = basePath+"/app/collectingAddressList/startReturnHome.xhtml";
			var data = postData;
			saveUploadDataToNativeStorage(userId, fun, method, action, data);

			//读取缓存（在催地址列表离线数据），新增一条返程的在催地址，并重新从缓存加载在催地址列表
			var key = {};
			key.userId = session.get("userId");
			key.fun = "collecting_address_list";
			key.method = "load_collecting_address_list_content";
			key.extra = {};

			var extra={};
			extra.operation =ConstDef.getConstant("NATIVE_STORAGE_MODIFY");
			extra.callback = "load_collecting_address_list_content_from_native_storage";

//			extra.newDataKey =  uuid() ;//要新增的在催（返程）地址的ID
//			session.set("returnHomeAddressId",extra.newDataKey);
			extra.extension = {};
			extra.extension.checkCode = 1;
			extra.newData = {};
//			extra.newData.dataKey = extra.newDataKey;
//			extra.newData.addressType="RETURN_HOME_ADDRESS";
//			extra.newData.id = extra.newDataKey;
//			extra.newData.collectingStatus = ConstDef.getConstant("COLLECTING_STATUS_STARTED") ;//正在催收

			loadNativeStorage(key.userId, key.fun, key.method , key.extra, extra.operation,extra.callback,extra.newDataKey,extra.newData,extra.extension);

		});	

	}

}//end start_return_home

function finish_return_home(){

	var postData = {};
	postData.userId = session.get("userId");
	postData.userCode = session.get("userCode");
	//当前在催地址ID
	//	postData.collectingAddressID = paramObj.collectingAddressID;
	//	postData.caseRecordId = paramObj.caseRecordId;

	//当前位置信息--经纬度 todo:
	//	postData.longitude = 11;//经度
	//	postData.latitude = 22;//纬度
	//	postData.speed = 33;//速度
	//	postData.direction = "正北";//方向
	//	postData.distance = 11111;//公里数
	//	postData.address = "北京市朝阳区";


	//手机端当前时间
	var currentDatetime = new Date().Format("YYYY/MM/DD HH/mm/ss");

	postData.currentDatetime = currentDatetime;

	//如果网络是连通的
	if(isNetworkConnected()){
		showLoading();
		$.getJSON(basePath+"/app/collectingAddressList/finishReturnHome.xhtml"+callback, postData,function(msg){
			
			$("#collecting_address_list_page").find('[identity="return-back-home"]').attr("enable","true");
			if($.trim(msg.returnCode) == '0'){
				console.log("结束返程");
				//计算里程数
				var returnData = msg.data;
				if(returnData !=null){

					var travelId = returnData.travelRecord.id;
					//获取所有的点
					var lineArr = returnData.locationArray;
					coll_calculateDistance(travelId,lineArr);
				}


				showHide();
				load_collecting_address_list_content();
			}else{
				showHide();
				errorHandler(msg.returnCode,msg.message);
			}
			//			load_collecting_address_list_content();
		});
	}
	else{

		var messageText = "当前网络处于离线状态，确认结束返程吗？";
		showConfirm(messageText, function(){
			//将上行数据存入缓存
			var userId = session.get("userId");
			var fun = "collecting_address_list";
			var method = "finish_return_home";
			var action = basePath+"/app/collectingAddressList/finishReturnHome.xhtml";
			var data = postData;
			saveUploadDataToNativeStorage(userId, fun, method, action, data);

			//读取缓存（在催地址列表离线数据），删除当前用户的返程的在催地址，并重新从缓存加载在催地址列表 TODO
			var key = {};
			key.userId = session.get("userId");
			key.fun = "collecting_address_list";
			key.method = "load_collecting_address_list_content";
			key.extra = {};

			var extra={};
			extra.operation =ConstDef.getConstant("NATIVE_STORAGE_MODIFY");
			extra.callback = "load_collecting_address_list_content_from_native_storage";

//			extra.newDataKey =  uuid() ;//要新增的在催（返程）地址的ID
//			session.set("returnHomeAddressId",extra.newDataKey);
			extra.extension = {};
			extra.extension.checkCode = 0;
			extra.newData = {};
//			extra.newData.dataKey = extra.newDataKey;
//			extra.newData.addressType="RETURN_HOME_ADDRESS";
//			extra.newData.id = extra.newDataKey;
//			extra.newData.collectingStatus = ConstDef.getConstant("COLLECTING_STATUS_STARTED") ;//正在催收

			loadNativeStorage(key.userId, key.fun, key.method , key.extra, extra.operation,extra.callback,extra.newDataKey,extra.newData,extra.extension);

		});	

	}
}//end finish_return_home


//删除在催地址
function delete_collecting_address(data){

	//获取要删除的在催地址ID
	var collectingAddressID = data.collectingAddressID;

	var postData = {};
	postData.userCode = session.get("userCode");
	postData.collectingAddressID = collectingAddressID;
	showLoading();
	$.getJSON(basePath+"/app/collectingAddressList/deleteCollectingAddressById.xhtml"+callback, postData,function(msg){

		console.log("删除在催地址："+collectingAddressID);
		if($.trim(msg.returnCode) == '0'){
			showHide();
			showMessage(msg.message,'1500');
			load_collecting_address_list_content();
		}
		else{
			showHide();
			errorHandler(msg.returnCode,msg.message);
		}

	});

}

/*function start_litig(paramObj){
	
	var userInfo = JSON.parse(session.get("userInfo"));
	//如果已签入
	if (ConstDef.getConstant("ONLINE_STATUS_SIGNIN") == userInfo.user.onlineStatus) {
		var postData = {};
		var userInfo = JSON.parse(session.get("userInfo"));
		postData.onlineStatus = userInfo.user.onlineStatus;
		postData.userId = session.get("userId");
		postData.userCode = session.get("userCode");
		//当前在催地址ID
		postData.collectingAddressID = paramObj.collectingAddressID;
		postData.caseRecordId = paramObj.caseRecordId;

		//如果网络是连通的
		if(isNetworkConnected()){
			$.getJSON(basePath+"/app/collectingAddressList/startLitig.xhtml"+callback, postData,function(msg){
				showHide();
				$("#collecting_address_list_page").find('[collectingaddressid="'+postData.collectingAddressID+'"]').attr("enable","true");
				
				if($.trim(msg.returnCode) == '0'){
					if(msg.data =="NOT-CHECK-IN"){
						
						showMessage(msg.message,'1500');
					}
					else if(msg.data =="DRIVING"){
						
						showMessage(msg.message,'2500');
					}
					else{
						console.log("已经开始诉讼");
						load_collecting_address_list_content();
					}

				}else{
					errorHandler(msg.returnCode,msg.message);
				}
			});
		}
		else{//网络没有连通时
			//将上行数据存入缓存
			var userId = session.get("userId");
			var fun = "collecting_address_list";
			var method = "start_litig";
			var action = basePath+"/app/collectingAddressList/startLitig.xhtml";
			var data = postData;
			saveUploadDataToNativeStorage(userId, fun, method, action, data);


			//读取缓存（在催地址列表离线数据），更改在催地址状态 更改为进行中,并重新从缓存加载在催地址列表
			var key = {};
			key.userId = session.get("userId");
			key.fun = "collecting_address_list";
			key.method = "load_collecting_address_list_content";
			key.extra = {};

			var extra={};
			extra.operation =ConstDef.getConstant("NATIVE_STORAGE_MODIFY");
			extra.callback = "load_collecting_address_list_content_from_native_storage";
			extra.newDataKey = paramObj.collectingAddressID ;//要更改的在催地址的ID
			extra.newData = {};
			extra.newData.collectingStatus = ConstDef.getConstant("COLLECTING_STATUS_STARTED") ;//正在催收

			loadNativeStorage(key.userId, key.fun, key.method , key.extra, extra.operation,extra.callback,extra.newDataKey,extra.newData);
		}
	}
	else{
		showMessage("您还没有签入，请先签入！",'1500');
	}
}//end start_litig


function finish_litig(paramObj){

	var postData = {};
	postData.userCode = session.get("userCode");
	postData.random = new Date();
	//当前在催地址ID
	postData.userId = session.get("userId");
	postData.userCode = session.get("userCode");
	postData.collectingAddressID = paramObj.collectingAddressID;
	postData.caseRecordId = paramObj.caseRecordId;

	//如果网络是连通的
	if(isNetworkConnected()){
		$("#collecting_address_list_page").find('[collectingaddressid="'+postData.collectingAddressID+'"]').attr("enable","true");
		
		showLoading();
		$.getJSON(basePath+"/app/collectingAddressList/finishLitig.xhtml"+callback, postData,function(msg){
			if($.trim(msg.returnCode) == '0'){
				console.log("已经结束诉讼");
				showHide();
				showMessage(msg.message,'1500');

				//计算里程数
				var returnData = msg.data;
				if(returnData !=null){

					var travelId = returnData.travelRecord.id;
					//获取所有的点
					var lineArr = returnData.locationArray;
					coll_calculateDistance(travelId,lineArr);
				}

				load_collecting_address_list_content();
			}else{
				showHide();
				errorHandler(msg.returnCode,msg.message);
			}
		});
	}
	else{
		//将上行数据存入缓存
		var userId = session.get("userId");
		var fun = "collecting_address_list";
		var method = "finish_litig";
		var action = basePath+"/app/collectingAddressList/finishLitig.xhtml";
		var data = postData;
		saveUploadDataToNativeStorage(userId, fun, method, action, data);

		//读取缓存（在催地址列表离线数据），删除当前在催地址列表项,并重新从缓存加载在催地址列表
		var key = {};
		key.userId = session.get("userId");
		key.fun = "collecting_address_list";
		key.method = "load_collecting_address_list_content";
		key.extra = {};

		var extra={};
		extra.operation =ConstDef.getConstant("NATIVE_STORAGE_REMOVE");
		extra.callback = "load_collecting_address_list_content_from_native_storage";
		extra.newDataKey = paramObj.collectingAddressID ;//要更改的在催地址的ID
		extra.newData = {};

		loadNativeStorage(key.userId, key.fun, key.method , key.extra, extra.operation,extra.callback,extra.newDataKey,extra.newData);
	}
}//end finish_litig*/