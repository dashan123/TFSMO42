var sale_dealer_edit_page = $('#sale_dealer_edit_page');

/******************************home_page---begin**************************************/
sale_dealer_edit_page.live('pageinit',function(e,ui){
	
//	var wrapper = "sale_dealer_edit_wrapper";
//	var up = "sale_dealer_edit_pullUp";
//	var down = "sale_dealer_edit_pullDown";
//	sale_dealer_edit_myScroll = createMyScroll(wrapper,up,down);

	//回退事件处理
	sale_dealer_edit_page.find(".BackBtn").live("tap",function(event){
		event.stopPropagation();
		back_page();
	});

	//采集坐标按钮事件处理
	sale_dealer_edit_page.find("#saleDealerEditPage-getCoordinate").live('tap',function(){

        onLocationBegin();
        
        showLoading();
        //获取当前时间
        var currentDatetime = new Date().Format("YYYY/MM/DD HH:mm:ss");

        setTimeout(function(){
                   showHide();
                   
                   if(newLongitude == 0 || newLatitude == 0 || newAddress == null ){
                       showHide();
                       showMessage('未能获取到位置信息,请重试','5000');
                       return;
                       }
                   
                   //将获取到的坐标与地址信息显示到页面
                   $("#saleDealerEditPage_basicInfo").find("[identity='coordinate']").text(newLongitude+","+newLatitude);
                   $("#saleDealerEditPage_basicInfo").find("[identity='address']").text(newAddress);
                   
                   }, 3000);

	});
	
	//提交经销商坐标信息
	sale_dealer_edit_page.find(".SaveBtn2").live('tap',function(){

		var message = "保存以后不可再次更改，请确认是否继续！";
		showConfirm(message, function(){
			
			saleDealerEdit_saveDealerInfoDetails();
		});
		
	});
});//end pageinit

sale_dealer_edit_page.live('pageshow',function(e, ui){

	saleDealerEditPage_queryDealerInfoByCode();
//	currentLoadActionName  = "sale_dealer_edit_load_content";
//	load_sale_dealer_edit_content();

});//end pageshow

function sale_dealer_edit_load_content(){
	//下拉不刷新，则该方法置空
}
//根据经销商CODE查询经销商信息
function saleDealerEditPage_queryDealerInfoByCode(){
	
	showLoading();
	
	var postData ={};
	postData.random = new Date();
	postData.code = session.get("dealerCode");
	
	$.getJSON(basePath+"/app/saleDealerEdit/queryDealerInfoByCode.xhtml"+callback, postData,function(msg){
		
		if($.trim(msg.returnCode) == '0') {
			showHide();
			
			if(msg.data){
				
				var data = msg.data;
				
				var dealerInfo = data.dealerInfo;
				
				var $currentPage = $('#sale_dealer_edit_page');
				if(dealerInfo.allowDrmEdit == 1){
					$currentPage.find("#saleDealerEditPage-getCoordinate").show();
					$currentPage.find(".SaveBtn2").show();
				}
				else{
					$currentPage.find("#saleDealerEditPage-getCoordinate").hide();
					$currentPage.find(".SaveBtn2").hide();
				}
				
				//绑定经销商信息
				var detailsElement = $("#saleDealerEditPage_basicInfo");
				dataBindToElement(detailsElement,dealerInfo);
				
				var coordinateAddress = $("#saleDealerEditPage_basicInfo").find("[identity='address']").text();
                	$("#saleDealerEditPage_basicInfo").find("[identity='address']").live("tap",function(){
                	callNavi(coordinateAddress);
                });
				
			}//end if(msg.data){
			else{
				showMessage("未查询到经销商数据",5000);
				$("#saleDealerEditPage_basicInfo").find("[identity='id']").val("")
//				$("#saleDealerEditPage_basicInfo").find("[identity='code']").val("")
				$("#saleDealerEditPage_basicInfo").find("[identity='name']").val("")
				
			    $("#saleDealerEditPage_basicInfo").find("[identity='coordinate']").text("");
			    $("#saleDealerEditPage_basicInfo").find("[identity='address']").text("");
				
			}
		}
		else{
			errorHandler(msg.returnCode,msg.message);
		}
		
	});//end $.getJSON
}

//保存坐标信息
function saleDealerEdit_saveDealerInfoDetails(){
	
	var postData = {};
	postData.random = new Date();
	postData.id = $("#saleDealerEditPage_basicInfo").find("[identity='id']").val()
	postData.code = $("#saleDealerEditPage_basicInfo").find("[identity='code']").val()
	
    var coordinate = $("#saleDealerEditPage_basicInfo").find("[identity='coordinate']").text();
    var address = $("#saleDealerEditPage_basicInfo").find("[identity='address']").text();
    var coordinateArray = coordinate.split(",");
    
    if(coordinateArray.length != 2){
    	showMessage("坐标数据有误，请尝试重新获取！！",5000);
    }
    else{
    	postData.longitude = coordinateArray[0];
    	postData.latitude = coordinateArray[1];
    }
    postData.address = address;
    postData.userCode = session.get("userCode");
	
	//保存数据至服务器
	$.ajax({
		url: basePath+"/app/saleDealerEdit/saveDealerInfo.xhtml"+callback, //这个地址做了跨域处理
		data: postData,
		traditional: true,//这个设置为true，data:{"steps":["qwe","asd","zxc"]}会转换成steps=qwe&steps=asd&...
		type: 'GET',
		dataType: 'json',
		async:false,
		beforeSend: function () {
			showLoading();
		},
		success: function (msg) {

			showHide();

			if($.trim(msg.returnCode) == '0') {
				var data = msg.data;
				
				if(data){
					if(data.result > 0){
						
						showMessage("经销商坐标数据保存成功！！",5000);
						saleDealerEditPage_queryDealerInfoByCode();
					}
					
				}//end if(data)
			}
			else{
				errorHandler(msg.returnCode,msg.message);
			}
		},
		complete: function() {

		}
	});//end $.ajax
}
