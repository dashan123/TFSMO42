var travel_case_query_page = $("#travel_case_query_page");
var travel_case_query_page_myScroll;
/** ****************************travel_case_query_page---begin************************************* */

travel_case_query_page.live('pageinit', function(e, ui) {
	var wrapper = "travel_case_query_page_myScroll_wrapper";
	travel_case_query_page_myScroll = createMyScroll(wrapper);
	// 返回在控制台
	travel_case_query_page.find(".BackBtn").live('tap', function(event) {
		event.stopPropagation();
		back_page();
	});

	// 隐藏遮罩层
	$("#travel_case_query_page #case_query_tirebox").hide();

	//搜索按钮事件
//	$("#case_query_page .searchBar font").on({
//		
//		click:function(){$("#case_query_page .personnelList li").text($(this).attr("code"))}		
//	
//	});
	$("#travel_case_query_page .searchBar1 .chooseBtn1").live('tap', function() {
		var page=$("#travel_case_query_page");
		page.find(".personnelList").empty();
		var queryType =page.find(".topBar").find("span:first").attr("code");
		var queryValue= $("#travel_case_query_page .searchBox1 input").val();//获取搜索框内的值
		var queryScope="全部";//获取查询范围
	    if(queryValue==null || queryValue==""){
	    	showMessage("搜索框值不允许为空",1500);
			   return;
		   }

		//如果是车牌号对其简单验证
		var  fenlei=page.find(".topBar").find("span:first").text();
		if(fenlei=='车牌号'){
			
			var regExp =new RegExp("[A-Za-z0-9]{5,7}");
			var text=page.find(".searchBox1").find("input:first").val();
			var result =regExp.test(text);
			if(result==false){
				showMessage("请输入正确的车牌号！！");
				var inputval =page.find(".searchBox1").find("input:first").val("");
				page.find(".searchBox1").find("input:first").focus();
				page.find(".searchBox1").html("<span></span>"+"<input data-role='none' type='text' placeholder='"+'请输入正确的'+fenlei+'查询'+"' ></input>");
				return;
			}
			if(text.length > 5){
				showMessage("仅限输入5位车牌号，包括数字和字母，不包括省");
				page.find(".searchBox1").find("input:first").val("");
				page.find(".searchBox1").find("input:first").focus();
				return;
			}
		}
		else if(fenlei == "车架号"){
//			var regExp =new RegExp("[A-Za-z0-9]{5,7}");
			var text=page.find(".searchBox1").find("input:first").val();
//			var result =regExp.test(text);
//			if(result==false){
//				showMessage("请输入正确的车牌号！！");
//				var inputval =page.find(".searchBox1").find("input:first").val("");
//				page.find(".searchBox1").find("input:first").focus();
//				page.find(".searchBox1").html("<span></span>"+"<input data-role='none' type='text' placeholder='"+'请输入正确的'+fenlei+'查询'+"' ></input>");
//				return;
//			}
			if(text.length != 6){
				showMessage("请输入车架号后6位！！");
				page.find(".searchBox1").find("input:first").val("");
				page.find(".searchBox1").find("input:first").focus();
				return;
			}
		}
		
		load_travel_case_query_list_content(queryType,queryValue,queryScope);
	});
	// 选择查询条件分类
	travel_case_query_page.find(".topBar").live("tap",function() {
		//var $arrow = $("#case_query_page").find(" ");

		//下箭头变上箭头
		var $arrow = $(this).find("span:last");
		$arrow.removeClass("allBtn_down");
		$arrow.addClass("allBtn_up");
		// 显示遮罩层
		$("#travel_case_query_page #case_query_tirebox").show();

		// 取消遮罩层
		$("#travel_case_query_page #case_query_tirebox .Cancel").live("tap",function() {
			$("#travel_case_query_page #case_query_tirebox").hide();
			$arrow.removeClass("allBtn_up");
			$arrow.addClass("allBtn_down");
		});

	});
});

/** ****************************travel_case_query_page---end************************************* */
travel_case_query_page.live('pageshow', function(e, ui) {
	var fromPage = session.get("fromPage");
	 if(fromPage != "collection_case_details_view_page"){
		 load_tarvel_case_query_init_content();
	 }
	});


function load_tarvel_case_query_init_content(){
	
	var page = $("#travel_case_query_page");
	//清空遮罩层
	page.find("#case_query_tirebox").find("#travel_case_query_list").empty();
	//清空案件列表
	page.find(".personnelList").empty();
    //清空条件框	
//	page.find(".topBar").find("span:first").empty();
	
	showLoading();
	
//	var  fromPage =session.get("fromPage");
//	if (fromPage != "collection_case_details_view_page") {
//		//条件初始化
//    	page.find(".topBar").find("span:first").text("车牌号");
//    	page.find(".topBar").find("span:first").attr("code","Q04");
//    	//搜索初始化
//    	page.find(".searchBox1").html("<span></span>"+"<input data-role='none' type='text' placeholder='"+'请输入车牌号查询'+"' ></input>");	
//	}else{
//		//条件初始化
//		var queryType = session.get("queryType");
//		var queryTypeName = session.get("queryTypeName");
//    	page.find(".topBar").find("span:first").attr("code",queryType);
//    	page.find(".topBar").find("span:first").text(queryTypeName);
//    	//搜索初始化
//    	page.find(".searchBox1").html("<span></span>"+"<input data-role='none' type='text' placeholder='"+'请输入'+queryTypeName+'查询'+"' ></input>");	
//	}
	
	var postData={}
	postData.userCode = session.get("userCode");
	postData.random = Math.random();
	
	$.getJSON(basePath + "/app/travelcaseQuery/queryCaseInit.xhtml" + callback,postData, function(data) {
		if ($.trim(data.returnCode) == '0') {
		    $.each(data.data,function(i,n){
		    	
		    	var _area=$("<li code='"+n.code+"'></li>");
		    	_area.text(n.name);
		    	showHide();
		    	page.find("#travel_case_query_list").append(_area);
		    	//根据排序，设置查询条件默认值为从字典表中查询出的第一条数据
		    	if(i==0){
		    		//条件初始化
			    	page.find(".topBar").find("span:first").text(n.name);
			    	page.find(".topBar").find("span:first").attr("code",n.code);
			    	//搜索初始化
			    	if(n.name=='车架号'){
			    		page.find(".searchBox1").html("<span></span>"+"<input data-role='none' type='text' maxlength='6' placeholder='"+'请输入车架号后6位进行查询'+"' ></input>");
						
					}
					else{
						page.find(".searchBox1").html("<span></span>"+"<input data-role='none' type='text' placeholder='"+'请输入'+n.name+'查询'+"' ></input>");
					}
//			    	page.find(".searchBox1").html("<span></span>"+"<input data-role='none' type='text' placeholder='"+'请输入'+n.name+'查询'+"' ></input>");	
		    	}
				// 遮罩弹层列表项点击事件
				$("#travel_case_query_page #case_query_tirebox #travel_case_query_list li").live("tap",function() {
					//下箭头变上箭头
					var $arrow = page.find(".topBar").find("span:last");
					$arrow.removeClass("allBtn_down");
					$arrow.addClass("allBtn_up");
					//_area.attr("code",n.code);
					var $queryTypeElement = page.find(".topBar").find("span:first");
					$queryTypeElement.text($(this).text());
					$queryTypeElement.attr("code",$(this).attr("code"));
					//重写搜索框
					if($(this).text() == n.name){
						if(n.name=='车牌号')
						{
							showMessage("仅限输入5位车牌号，包括数字和字母，不包括省！"); 
						//onkeyup='value=value.replace(/[^\w\.\/]/ig,'')'  只能输入英文字母和数字,不能输入中文
						}
//						else if(n.name=='合同号'){
//							
//						}
						
						//设置提示文本（placeholder）
						if(n.name=='车架号'){
							page.find(".searchBox1").html("<span></span>"+"<input data-role='none' type='text' maxlength='6' placeholder='"+'请输入车架号后6位进行查询'+"' ></input>");
						}
						else if(n.name=='合同号'){
							page.find(".searchBox1").html("<span></span>"+"<input data-role='none' type='text' value='HP' placeholder='"+'请输入'+n.name+'查询'+"' ></input>");
						}
						else{
							page.find(".searchBox1").html("<span></span>"+"<input data-role='none' type='text' placeholder='"+'请输入'+n.name+'查询'+"' ></input>");
						}
					}
					$arrow.removeClass("allBtn_up");
					$arrow.addClass("allBtn_down");
					$("#travel_case_query_page #case_query_tirebox").hide();		
		     	});
		    });
		} else{   
		    	showHide();
				errorHandler(data.returnCode,data.message);
		}
//		load_travel_case_query_list_content();

   });
}
function load_travel_case_query_list_content(queryType,queryValue,queryScope) {
	var page = $("#travel_case_query_page");
	//清空搜索框
//	page.find(".searchBox1").find("input:first").val("");
	//清空内容
	//如果前页面是从collection_case_details_page页面返回,则不重新加载数据
	var  fromPage =session.get("fromPage");
	if (fromPage != "collection_case_details_view_page") {
		page.find(".personnelList").empty();
	}

	queryValue==undefined?"":queryValue;
	//条件判断初始化为借款人先不查询数据
	if(queryValue==undefined || queryValue=="" ){
		   return;
	   }
	showLoading();
	var authData = {}
	authData.userCode = session.get("userCode");
	authData.random = Math.random();
	authData.queryType=queryType;
	authData.queryValue=queryValue;
	authData.queryScope=queryScope;

	var queryTypeName = page.find(".topBar").find("span:first").text();
	session.set("queryType",queryType);
	session.set("queryTypeName",queryTypeName);
	
	$.getJSON(basePath + "/app/travelcaseQuery/queryCase.xhtml" + callback,
			authData, function(data) {
				if ($.trim(data.returnCode) == '0') {
					$.each(data.data, function(i, n) {

						var $item = $(
								"#travel_case_query_page .list-row-template ul li")
								.clone(true);
//						if (n.accountStatus == '良好') {//??
//							$item.addClass("usable");//变红
//						} else {
//							$item.addClass("disable");//字体变灰
//						}

						dataBindToElement($item, n);
						showHide();
						
					   $item.attr("contractId",n.contractId);
						//进入催记详细
						$("#travel_case_query_page .personnelList li").live("tap",function(){
							session.set("contractId",$(this).attr("contractId"));
						    goto_page("collection_case_details_view_page");
						});
						page.find(".personnelList").append($item);
					});
				    if(data.data==null||data.data.length<=0){
				    	page.find(".searchBox1").find("input:first").focus();
				    	showHide();
				    	showMessage("暂无数据"); 
				    }else{
				    	//清空搜索框
				    	//清空搜索框
				    	if(queryTypeName == '合同号'){
				    		page.find(".searchBox1").find("input:first").val("HP");
				    	}else{
				    		page.find(".searchBox1").find("input:first").val("");
				    	}
				    }
				} else {
					showHide();
					errorHandler(data.returnCode, data.message);
				}
		});
}
	
