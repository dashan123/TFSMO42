var case_query_page = $("#case_query_page");
var case_query_page_myScroll;
/** ****************************case_query_page---begin************************************* */

case_query_page.live('pageinit', function(e, ui) {
	var wrapper = "case_query_page_myScroll_wrapper";
 	case_query_page_myScroll = createMyScroll(wrapper);
	// 返回在催地址列表
	case_query_page.find(".BackBtn").live('tap', function(event) {
		event.stopPropagation();
		back_page();
	});

	// 隐藏遮罩层
	$("#case_query_page #case_query_tirebox").hide();

	//搜索按钮事件
	$("#case_query_page .searchBar1 .chooseBtn1").live('tap', function() {
		var page=$("#case_query_page");
		page.find(".personnelList").empty();
		var queryType =page.find(".topBar").find("span:first").attr("code");
		//alert(queryType);
		var queryValue= $("#case_query_page .searchBox1 input").val();//获取搜索框内的值
		//var queryScope="全部";//获取查询范围
	    if(queryValue==null || queryValue==""){
	    	showMessage("搜索框值不允许为空",1500);
			   return;
		   }

		//如果是车牌号对其简单验证
		var  fenlei=page.find(".topBar").find("span:first").text();
		if(fenlei=='车牌号'){
			
			var regExp =new RegExp("[A-Za-z0-9]{5}");
			
			var text=page.find(".searchBox1").find("input:first").val();
			var result =regExp.test(text);
			if(result==false){
				showMessage("请输入正确的5位车牌号！！");
				var inputval =page.find(".searchBox1").find("input:first").val("");
				page.find(".searchBox1").find("input:first").focus();
				page.find(".searchBox1").html("<span></span>"+"<input data-role='none' type='text' placeholder='"+'请输入正确的'+fenlei+'查询'+"' ></input>");
				return;
			}
			
			if(text.length > 5){
				showMessage("仅限输入5位车牌号，包括数字和字母，不包括省！");
				page.find(".searchBox1").find("input:first").val("");
				page.find(".searchBox1").find("input:first").focus();
				return;
			}
		}
		else if(fenlei == "车架号"){
			var text=page.find(".searchBox1").find("input:first").val();
			if(text.length != 6){
				showMessage("请输入车架号后6位！");
				page.find(".searchBox1").find("input:first").val("");
				page.find(".searchBox1").find("input:first").focus();
				return;
			}
		}
		
		load_case_query_list_content(queryType,queryValue);
	});
	// 选择查询条件分类
	case_query_page.find(".topBar").live("tap",function() {
			//var $arrow = $("#case_query_page").find(" ");
   
			//下箭头变上箭头
			var $arrow = $(this).find("span:last");
			$arrow.removeClass("allBtn_down");
			$arrow.addClass("allBtn_up");
			// 显示遮罩层
			$("#case_query_page #case_query_tirebox").show();

		});
	
	// 取消遮罩层
	$("#case_query_page #case_query_tirebox .Cancel").live("tap",function() {
			$("#case_query_page #case_query_tirebox").hide();
			//下箭头变上箭头
			var $arrow = $("#case_query_page").find(".topBar span:last");
			$arrow.removeClass("allBtn_up");
			$arrow.addClass("allBtn_down");
	});
	
/*	// 取消遮罩层
	$("#case_query_page #case_query_tirebox .TierBox").live("tap",function() {
			$("#case_query_page #case_query_tirebox").hide();
			//下箭头变上箭头
			var $arrow = $("#case_query_page").find(".topBar span:last");
			$arrow.removeClass("allBtn_up");
			$arrow.addClass("allBtn_down");
	});*/
	
	
    //点击选择框所在行
	case_query_page.find(".checkboxDivClasss").live("tap", function(event){
		event.stopPropagation();
		var obj = $(this).find("input[type='checkbox']");
		if (obj) {
			$(this).parents(".radioBar").find("input[type='checkbox']").removeAttr("checked");
			$(obj).attr("checked", "checked");
		}
	});
	//点击选择框
	case_query_page.find(".checkboxDivClasss input[type='checkbox']").live("tap", function(event){
		event.stopPropagation();
		var obj = $(this);
		if (obj) {
			$(this).parents(".radioBar").find("input[type='checkbox']").removeAttr("checked");
			$(obj).attr("checked", "checked");
		}
	});
	
});

/** ****************************case_query_page---end************************************* */
	case_query_page.live('pageshow', function(e, ui) {

		var fromPage = session.get("fromPage");
		 if(fromPage != "collection_case_details_case_query_page"){
			 $("#case_query_page").find(".radioBar input[type='checkbox']").removeAttr("checked");
			 $("#case_query_page").find("#collectionRadioId").attr("checked", "checked");
			 
			 load_case_query_init_content();
		 }
	});


function load_case_query_init_content(){
	
	var page = $("#case_query_page");
	//清空遮罩层
	page.find("#case_query_tirebox").find("#case_query_list").empty();
	//清空案件数据列表
	page.find(".personnelList").empty();
    //清空条件框	
	//page.find(".topBar").find("span:first").empty();
	//条件初始化
//	page.find(".topBar").find("span:first").text("借款人");
	//搜索初始化
//	page.find(".searchBox1").html("<span></span>"+"<input data-role='none' type='text' placeholder='"+'请输入借款人查询'+"' ></input>");
	showLoading();
	var postData={}
	postData.userCode = session.get("userCode");
	postData.random = Math.random();
	
//	var  fromPage =session.get("fromPage");
//	if (fromPage != "collection_case_details_case_query_page") {
//		//条件初始化
//    	page.find(".topBar").find("span:first").text("借款人");
//    	page.find(".topBar").find("span:first").attr("code","Q02");
//    	//搜索初始化
//    	page.find(".searchBox1").html("<span></span>"+"<input data-role='none' type='text' placeholder='"+'请输入借款人查询'+"' ></input>");	
//	}else{
//		//条件初始化
//		var queryType = session.get("queryType");
//		var queryTypeName = session.get("queryTypeName");
//    	page.find(".topBar").find("span:first").attr("code",queryType);
//    	page.find(".topBar").find("span:first").text(queryTypeName);
//    	//搜索初始化
//    	page.find(".searchBox1").html("<span></span>"+"<input data-role='none' type='text' placeholder='"+'请输入'+queryTypeName+'查询'+"' ></input>");	
//	}
	
	$.getJSON(basePath + "/app/caseQuery/queryCaseInit.xhtml" + callback,postData, function(data) {
		if ($.trim(data.returnCode) == '0') {
		    $.each(data.data,function(i,n){
		    	
		    	var _area=$("<li code='"+n.code+"'></li>");
		    	_area.text(n.name);
		    	showHide();
		    	page.find("#case_query_list").append(_area);
		    	//根据排序，设置查询条件默认值为从字典表中查询出的第一条数据
		    	if(i==0){
		    		//条件初始化
			    	page.find(".topBar").find("span:first").text(n.name);
			    	page.find(".topBar").find("span:first").attr("code",n.code);
			    	//搜索初始化
//			    	page.find(".searchBox1").html("<span></span>"+"<input data-role='none' type='text' placeholder='"+'请输入'+n.name+'查询'+"' ></input>");	
			    	//搜索初始化
			    	if(n.name=='车架号'){
			    		page.find(".searchBox1").html("<span></span>"+"<input data-role='none' type='text' maxlength='6' placeholder='"+'请输入车架号后6位进行查询'+"' ></input>");
					}
					else{
						page.find(".searchBox1").html("<span></span>"+"<input data-role='none' type='text' placeholder='"+'请输入'+n.name+'查询'+"' ></input>");
					}
		    	}
				// 遮罩弹层列表项点击事件
				$("#case_query_page #case_query_tirebox #case_query_list li").live("tap",function() {
					//下箭头变上箭头
					var $arrow = page.find(".topBar").find("span:last");
					$arrow.removeClass("allBtn_down");
					$arrow.addClass("allBtn_up");
					//_area.attr("code",n.code);
					var $queryTypeElement = page.find(".topBar").find("span:first");
					$queryTypeElement.text($(this).text());
					$queryTypeElement.attr("code",$(this).attr("code"));
					//重写搜索框
					if($(this).text()==n.name){
						if(n.name == '车牌号')
						{
							showMessage("仅限输入5位车牌号，包括数字和字母，不包括省！"); 
							//onkeyup='value=value.replace(/[^\w\.\/]/ig,'')'  只能输入英文字母和数字,不能输入中文
						}
//						page.find(".searchBox1").html("<span></span>"+"<input data-role='none' type='text' placeholder='"+'请输入'+n.name+'查询'+"' ></input>");
					
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
					$("#case_query_page #case_query_tirebox").hide();		
		     	});
		    });
		} else{   
		    	showHide();
				errorHandler(data.returnCode,data.message);
		}
//	  load_case_query_list_content();

   });
}
function load_case_query_list_content(queryType,queryValue,queryScope) {
	var page = $("#case_query_page");
	//清空搜索框
//	page.find(".searchBox1").find("input:first").val("");
	//清空内容
	//如果前页面是从collection_case_details_page页面返回,则不重新加载数据
	var  fromPage =session.get("fromPage");
	if (fromPage != "collection_case_details_case_query_page") {
		page.find(".personnelList").empty();
	}

	queryValue==undefined?"":queryValue;
	//条件判断初始化为借款人先不查询数据
	if(queryValue==undefined || queryValue=="" ){
		   return;
	   }
	showLoading();
	var userInfo = JSON.parse(session.get("userInfo"));
	var authData = {}
	authData.userCssCode = userInfo.userMapping.CSS;
	authData.userCode = session.get("userCode");
	authData.random = Math.random();
	authData.queryType=queryType;
	authData.queryValue=queryValue;
	//authData.queryScope=queryScope;

	var queryTypeName = page.find(".topBar").find("span:first").text();
	session.set("queryType",queryType);
	session.set("queryTypeName",queryTypeName);
	
	$.getJSON(basePath + "/app/caseQuery/queryCase.xhtml" + callback,
			authData, function(data) {
				if ($.trim(data.returnCode) == '0') {
					$.each(data.data, function(i, n) {

						var $item = $("#case_query_page .list-row-template ul li").clone(true);
						dataBindToElement($item, n);
						showHide();
						
//					   $item.attr("contractId",n.contractId);
						 $item.attr("contractId",n.contractId);
						//进入催记详细
						$("#case_query_page .personnelList li").live("tap",function(){
							session.set("contractId",$(this).attr("contractId"));
							var businessFlag = $("#case_query_page").find(".radioBar input[type='checkbox']:checked").val();
							session.set("businessFlag",businessFlag);
						    goto_page("collection_case_details_case_query_page");
						});
						page.find(".personnelList").append($item);
					});
				    if(data.data==null||data.data.length<=0){
				    	page.find(".searchBox1").find("input:first").focus();
				    	showHide();
				    	showMessage("暂无数据"); 
				    }else{
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
	
