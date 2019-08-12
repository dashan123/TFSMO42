$.ajaxSettings.traditional=true;

//以下变量用于分页
var currentLoadActionName = "";
var myPullActionName = "";
var currentTemplatePage = "";
var currentPage = 1;
var hasData = true;
var totalPage = 1;
var currentHeader = "";
var currentFooter = "";
var currentContent = "";
var currentPageTitle = "";

//以下变量用于共通导航栏显示，目前未用
var leftButtonText = "";
var rightButtonText = "";

//以下变量用于 页面返回
var nowPage = ""; //当前页面
var prePageStock = new Array(); //页面堆栈
	
var scrollMap = {};

var appVersion = "v1.1.0";

var local = new local();
var session = new session();
			
            ajaxHandler();
           
            $(document).bind('pageshow',function(){
            	
            	//初始化弹出对话框
            	initMyDialog();
            	
            	nowPage = session.get("nowPage");
            	if(nowPage == "server_config_page"){
            		return ;
            	}
            	
            	//判断非登陆状态，如果人为跳转到其他页面 那么直接转到登陆页面
            	if(!(session.get("hasloginin") && session.get("hasloginin") != null && session.get("hasloginin")=="yes")){
            		goto_page("login_page");
            		return false;
            	}
            	
            	mobiscroll.settings = {
            		    theme: 'red',
            		    lang: 'zh',
            		    display: 'bottom'
            		};
            	 /**
           		 * 设置所有的日历控件
           		 * 请为所有的日历控件设置扩展属性 control="calendar"
           		 */
           		mobiscroll.calendar("input[control='calendar']", {
           			dateFormat: 'yy-mm-dd', // 日期格式
           	        theme: "red",          // Specify theme like: theme: 'ios' or omit setting to use default
           	            lang: "zh",    // Specify language like: lang: 'pl' or omit setting to use default
           	            display: "center",
           	            animate: "flip"
           	    });
            });
            
            //调用数据前 判断是否是当前页面
            function beforePageShowCheck(obj){
            	nowPage = session.get("nowPage");
            	if($(obj).attr("id") != nowPage){
            		return false;
            	}else{
            		return true;
            	}
            }
/*******************************************************************************/
            document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
            document.addEventListener('mousemove', function (e) { e.preventDefault(); }, false);
/********************************************************************************/    
            function getClientHeight(){
            	// 获取窗口高度
            	if (window.innerHeight)
            	winHeight = window.innerHeight;
            	else if ((document.body) && (document.body.clientHeight))
            	winHeight = document.body.clientHeight;
            	// 通过深入 Document 内部对 body 进行检测，获取窗口大小
            	if (document.documentElement && document.documentElement.clientHeight)
            	{
            	winHeight = document.documentElement.clientHeight;
            	}
            	return winHeight;
            }
            
            function getClientWidth(){
            	// 获取窗口宽度
            	if (window.innerWidth)
            	winWidth = window.innerWidth;
            	else if ((document.body) && (document.body.clientWidth))
            	winWidth = document.body.clientWidth;
            	// 通过深入 Document 内部对 body 进行检测，获取窗口大小
            	if (document.documentElement && document.documentElement.clientWidth)
            	{
            	winWidth = document.documentElement.clientWidth;
            	}
            	return winWidth;
            }
 /********************************************************************************/  
            function showMessage(msg, time){
 	    	       $.mobile.loading('hide');
// 	    	      var messageHtml = "<table><tr><td style='vertical-align:middle;font-size:14px;color:black;font-weight:bold'>"+msg+"</td></tr></table>";
// 	    	       var messageHtml = "<div class='maskLayerDiv'><div id='showMessageContent' style='position:relative;width:200px;height:40px;vertical-align:middle;align:center;font-size:16px;color:black;'>"+msg+"</div></div>";
// 	    	      var messageHtml = "<div style='vertical-align:middle;text-align:center;font-size:16px;color:black;'>"+msg+"</div>";
// 	    	       var messageHtml = "<div style='text-align:center;font-size:16px;color:black;'>"+msg+"</div>";
 	    	      var messageHtml = "<div>" +
 	    	      		"<div style='text-align:center;font-family:SimHei;font-weight:bold;font-size:15px;color:black;'>温馨提示</div>" +
 	    	      		"<div style='text-align:center;font-size:15px;color:black;'>"+msg+"</div>" +
 	    	      		"</div>";
 	    	      
// 	    	       var topHeight = (getClientHeight()-40)/2;
// 	    	       var leftWidth = (getClientWidth()-200)/2;
// 	    	       var bottomLen = getClientHeight()-100;
 	    	       $.mobile.loading('alert',{text:msg,textVisible: true,theme: 'a',textonly: true,html:messageHtml});
// 	    	      $('#alertDiv').parent().css("top", bottomLen+"px");
// 	    	       $("#showMessageContent").css("top", topHeight+"px").css("left",leftWidth+"px").css("display",'block'); 
// 	    	       $(".maskLayerDiv").show();
 	    	       if(time != null && time != 0){
 		    	      setTimeout(function(){
 		    	    	  $.mobile.loading('hide');
// 		    	    	  $(".maskLayerDiv").hide();
 		    	    	  }, time);
 	    	       }else{
 	    	    	  setTimeout(function(){
 	    	    		  $.mobile.loading('hide');
// 	    	    		  $(".maskLayerDiv").hide();
 	    	    		  }, 3000);
 	    	       }
           }
            /*********************************************************************************/	
            function showLoginLoading(){
            	var loadingHtml = "<div id='loginMaskLayerDiv' class='loginMaskLayerDiv' style='opacity: 1;-moz-opacity: 1;-khtml-opacity: 1;filter: alpha(Opacity=100);'>"
            				+"<img src='images/tfsred/loginloading.png' width='100%' height='100%'/>"
            				+"<div class='loginLoadingSpinner'>"
			            	  +"<div class='loginLoadingDot1'></div>"
			            	  +"<div class='loginLoadingDot2'></div>"
			            	+"</div>"
            			+"</div>";
            	$.mobile.loading('show',{theme: 'a',opacity: 1,textonly: false,html:loadingHtml});
            	$("#loginMaskLayerDiv").parent("div").css("opacity","1");
            }
/*********************************************************************************/	
            function showLoading(loadingText){
            	if(loadingText == null){
                	 loadingText = "加载中，请稍候 . . .";
            	}
//            	var loadingHtml = "<div class='maskLayerDiv'>" +
//            			"<table style='height:100%;line-height:100%;border:0;cellpadding:0;cellspacing:0;margin-left:auto; margin-right:auto;'>" +
//            			"<tr>" +
//            			"<td style='vertical-align:middle;'><img src='images/tfsred/loading.gif' width='20' height='20'/></td>" +
//            			"<td style='vertical-align:middle;font-size:16px;color:white;'>"+loadingText+"</td>" +
//            			"</tr></table></div>";
            	
//            	var loadingHtml = "<div class='maskLayerDiv'>" +
//    			"<table style='height:100%;line-height:100%;border:0;cellpadding:0;cellspacing:0;margin-left:auto; margin-right:auto;'>" +
//    			"<tr>" +
//    			"<td style='vertical-align:middle;width:20;height:20;'><div class='spinner'><div class='bounce1'></div> <div class='bounce2'></div><div class='bounce3'></div></div></td>" +
//    			"<td style='vertical-align:middle;font-size:16px;color:white;'>"+loadingText+"</td>" +
//    			"</tr></table></div>";
            	
            	var loadingHtml = 
    			"<div style='position:absolute;z-index:99997;display:inline-flex;vertical-align:middle;width:100%;'>" +
    			"<div class='spinner' style='width:20%;'>" +
    			"<div class='bounce1'></div> " +
    			"<div class='bounce2'></div>" +
    			"<div class='bounce3'></div>" +
    			"</div>&nbsp;&nbsp;" +
    			"<div style='vertical-align:middle;font-size:16px;color:white;width:80%'>"+loadingText+"</div>" +
    			"</div>"+
    			"<div class='maskLayerDiv'></div>";
            	
            	//var loadingHtml = "<img src='images/tfsred/loading.gif' width='32' height='32'/>";
            	$.mobile.loading('show',{text:loadingText,textVisible: true,theme: 'a',textonly: false,html:loadingHtml});
            	$(".maskLayerDiv").show();
            }
//            function showLoading1(){
//            	var loadingHtml = "<table ><tr><td align='center'><img src='images/tfsred/loading.gif' width='50' height='50'/></td></tr></table>";
//            	$.mobile.loading('show',{html:loadingHtml});
//            	
//            }
            
//            function showAuditEditLoading(loadingText,auditEditLoadingDivId,maskClickFunc){
//            	if(loadingText == null){
//                	 loadingText = "加载中，请稍候 . . .";
//            	}
//            	
//            	var loadingHtml = 
//    			"<div id='"+auditEditLoadingDivId+"' onclick=eval("+maskClickFunc+")(event,'"+loadingText+"') style='position:absolute;z-index:99997;display:inline-flex;vertical-align:middle;width:100%;'>" +
//    			"<div class='spinner' style='width:20%;' >" +
//    			"<div class='bounce1'></div> " +
//    			"<div class='bounce2'></div>" +
//    			"<div class='bounce3'></div>" +
//    			"</div>&nbsp;&nbsp;" +
//    			"<div style='vertical-align:middle;font-size:16px;color:white;width:80%'>"+loadingText+"</div>" +
//    			"</div>"+
//    			"<div id='"+auditEditLoadingDivId+"MaskLayer' class='auditEditMaskLayerDiv' onclick=eval("+maskClickFunc+")(event,'"+loadingText+"')></div>";
//            	
//            	$.mobile.loading('show',{text:loadingText,textVisible: true,theme: 'a',textonly: false,html:loadingHtml});
//            	$(".auditEditMaskLayerDiv").show();
//            }
            
/*********************************************************************************/	
            function showHide(){
            	$.mobile.loading('hide');
            }
/*********************************************************************************/	
            function errorHandler(errorCode, errorMsg){
            	
            	if($.trim(errorCode) == '1'){
            		setTimeout(function(){
			    		 showMessage(errorMsg,'5000');	
			    	         }, 500);
            	}else if($.trim(errorCode) == '-1'){
//            		session.remove("hasloginin");
            		showMessage(errorMsg,5000);
//			    	setTimeout(function(){
//			    		      goto_page('login_page');
//			    	}, 1000);
            	}else if($.trim(errorCode) == '4'){
//            		session.remove("hasloginin");
            		showMessage(errorMsg,5000);
//			    	setTimeout(function(){
//			    		      goto_page('login_page');
//			    	}, 1000);
            	}else{
            		showMessage(errorMsg,5000);
            	}       	
            }
/*********************************************************************************/	
      		function initScrollArea(page){
      			var headerHeight = page.find("#header").height();
      			var footerHeight = page.find("#footer").height();
      			page.find(".wrapper").css({top:headerHeight, bottom:footerHeight});
      		}
      		
            function createMyScroll(wrapper, up, down){
           	 var scroll = null;
           	 var action = "myOnScrollPullAction";
           	 if(wrapper != null && up != null && down != null){
           	      scroll = new iScroll(wrapper, {
           	    	  	useTransition: false,checkDOMChanges: true,momentum: true,bounce: true,hScroll:true,vScroll:true,hScrollbar:false,vScrollbar:false, hideScrollbar:true, fadeScrollbar:false,lockDirection:false,zoom:true,
           	    		topOffset: document.getElementById(down).offsetHeight,
           	    		onRefresh: function () {myOnRefresh(document.getElementById(down),document.getElementById(up))},
           	    		onScrollMove: function () {myOnScrollMove(this,document.getElementById(down),document.getElementById(up))},
           	    		onScrollEnd: function () {myOnScrollEnd(scroll,document.getElementById(down),document.getElementById(up),action)}
           	    	});	 
           	    	document.getElementById(wrapper).style.left = '0';  
           	 }else{
           		  scroll  = new iScroll(wrapper,{useTransition: false,checkDOMChanges: true,momentum: false,bounce: false,hScroll:true,vScroll:true,hScrollbar:false,vScrollbar:false, hideScrollbar:true, fadeScrollbar:false,lockDirection:false,zoom:true});
           	 }
           	return scroll;
            }
    /**
     * 
     * @param pullDownEl
     * @param pullUpEl
     */        
    function myOnRefresh(pullDownEl,pullUpEl){
//	     if(myPullActionName == null || myPullActionName == ""){
//	    	 return;
//	     }
    			if (pullDownEl.className.match('loading')) {
    				pullDownEl.className = '';
    				pullDownEl.querySelector('.pullDownLabel').innerHTML = '向下拖动加载上一页...';
    			} else if (pullUpEl.className.match('loading')) {
    				pullUpEl.className = '';
    				pullUpEl.querySelector('.pullUpLabel').innerHTML = '向上拖动加载下一页...';
    			}
    	        pullDownEl.style.display = 'none';
    	        pullUpEl.style.display = 'none';
    }
    /**
     * 
     * @param obj
     * @param pullDownEl
     * @param pullUpEl
     */
    function myOnScrollMove(obj,pullDownEl,pullUpEl){  
//	     if(myPullActionName == null || myPullActionName == ""){
//	    	 return;
//	     }
         if(obj.y > 0){
//         	if (obj.y > 40 && !pullDownEl.className.match('flip')) {
// 				pullDownEl.style.display = 'block';
// 				pullDownEl.className = 'flip';
// 				pullDownEl.querySelector('.pullDownLabel').innerHTML = '即将加载...';
// 				obj.minScrollY = 0;
// 			} else if (obj.y < 40 && pullDownEl.className.match('flip')) {
// 				pullDownEl.style.display = 'block';
// 				pullDownEl.className = '';
// 				pullDownEl.querySelector('.pullDownLabel').innerHTML = '向下拖动加载上一页...';
// 				obj.minScrollY = -pullDownEl.offsetHeight;
// 			}
         }else {
        	 //console.log(obj.maxScrollY+"_"+obj.y+"_"+pullUpEl.className.match('flip'));
         	if(obj.maxScrollY < 0){
             	if (obj.y < (obj.maxScrollY - 40) && !pullUpEl.className.match('flip')) {
             	        pullUpEl.style.display = 'block';
         				pullUpEl.className = 'flip';
         				pullUpEl.querySelector('.pullUpLabel').innerHTML = '即将加载...';
         				obj.maxScrollY = obj.offsetHeight;
         		} else if (obj.y > (obj.maxScrollY - 40) && pullUpEl.className.match('flip')) {
             	        pullUpEl.style.display = 'block';
         				pullUpEl.className = '';
         				pullUpEl.querySelector('.pullUpLabel').innerHTML = '向上拖动加载下一页...';
         				obj.maxScrollY = pullUpEl.offsetHeight;
         		}
         	}else{
             	if (obj.y < -40 && !pullUpEl.className.match('flip')) {
           	        pullUpEl.style.display = 'block';
       				pullUpEl.className = 'flip';
       				pullUpEl.querySelector('.pullUpLabel').innerHTML = '即将加载...';
       				obj.maxScrollY = obj.offsetHeight;
       		    } else if (obj.y > -40 && pullUpEl.className.match('flip')) {
           	        pullUpEl.style.display = 'block';
       				pullUpEl.className = '';
       				pullUpEl.querySelector('.pullUpLabel').innerHTML = '向上拖动加载下一页...';
       				obj.maxScrollY = pullUpEl.offsetHeight;
       		    }
         	}
         }
    }
    /**
     * 
     * @param page
     * @param myScroll
     * @param pullDownEl
     * @param pullUpEl
     * @param pullActionName
     */
    function myOnScrollEnd(myScroll,pullDownEl,pullUpEl,pullActionName){
//    	     if(myPullActionName == null || myPullActionName == ""){
//    	    	 return;
//    	     }
    			if (pullDownEl.className.match('flip')) {
    				pullDownEl.className = 'loading';
    				pullDownEl.querySelector('.pullDownLabel').innerHTML = '加载中...';				
    				eval(pullActionName)('up');
    			} else if (pullUpEl.className.match('flip')) {
    				pullUpEl.className = 'loading';
    				pullUpEl.querySelector('.pullUpLabel').innerHTML = '加载中...';				
    				eval(pullActionName)('down');
    			}
				myScroll.refresh();	
    }
    function myOnScrollPullAction(type){
		var temp = parseInt(currentPage);
  	    if($.trim(type) == 'up'){
  		     temp = temp <= 1 ? 1 : temp - 1;
  	    }else{
  		     temp = temp < 1 ? 1 : temp + 1;	
  		     
  		    currentPage = temp;
  	  	    eval(currentLoadActionName)();  
  	    }
  	   	   
     } 
    
    function setScroll(authData){
 	    var pageDisplayCount = session.get("pageDisplayCount");
 	    var pageAddCount = session.get("pageAddCount");
 	    
 	    if(currentPage <= 1){
 	    	authData.sindex = 1;
 	    	authData.eindex = pageDisplayCount;
 	    }else{
 	    	authData.sindex = parseInt(pageDisplayCount)+((parseInt(currentPage) - 2)*parseInt(pageAddCount))+1;
 	    	authData.eindex = parseInt(pageDisplayCount)+((parseInt(currentPage) - 2)*parseInt(pageAddCount))+parseInt(pageAddCount);
 	    }
    }
    
    function hasPage(length) {
    	var pageAddCount = session.get("pageAddCount");
    	if (length >= pageAddCount)
    		return true;
    	else
    		return false;
    }
    
    function endScroll(myScroll){
		var maxY = myScroll.maxScrollY;
		myScroll.scrollTo(0, maxY);
		if(currentPage>1){
			currentPage = currentPage -1;
  		}
    }
    /**
     * 
     * @param page
     * @param myScroll
     * @param int x
     * @param int y
     */
    function myRefresh(myScroll,x,y){
    	if(x==null||y==null){
    		myScroll.refresh();
    		myScroll.scrollTo(0,40);	
    	}else{
    		myScroll.refresh();
    		myScroll.scrollTo(parseInt(x),parseInt(y));
    	}
    }
    /*********************************************************************************/	
    function showAttachment(attachList, page, element_id){
     	$.each(attachList, function(i, a) {
   		  var types = a.fileName.split('.');
   		  var img = '';
   		  var extension = $.trim(types[types.length-1]);
   		  if(extension == 'doc'){//'+bussinessServer+a.savePath+'
   			 img = "images/attach/doc.gif";
   			page.find("#"+element_id+"").append('<tr id="attachment"><td></td><td><img src="'+img+'" border="0px">&nbsp;&nbsp;<a href="javascript:void(0);" onclick=downloadFile("'+a.savePath+'","'+a.fileName+'")  >'+a.fileName+'</a></td></tr>');
   		  }else if(extension == 'docx'){
   			 img = "images/attach/docx.gif";
   			page.find("#"+element_id+"").append('<tr id="attachment"><td></td><td><img src="'+img+'" border="0px">&nbsp;&nbsp;<a href="javascript:void(0);" onclick=downloadFile("'+a.savePath+'","'+a.fileName+'")   >'+a.fileName+'</a></td></tr>');
   		  }else if(extension == 'xls'){
   			 img = "images/attach/xls.gif";
   			page.find("#"+element_id+"").append('<tr id="attachment"><td></td><td><img src="'+img+'" border="0px">&nbsp;&nbsp;<a href="javascript:void(0);" onclick=downloadFile("'+a.savePath+'","'+a.fileName+'")   >'+a.fileName+'</a></td></tr>');
   		  }else if(extension == 'xlsx'){
   			 img = "images/attach/xlsx.gif";
   			page.find("#"+element_id+"").append('<tr id="attachment"><td></td><td><img src="'+img+'" border="0px">&nbsp;&nbsp;<a href="javascript:void(0);" onclick=downloadFile("'+a.savePath+'","'+a.fileName+'")   >'+a.fileName+'</a></td></tr>');
   		  }else if(extension == 'jpg'){
   			 img = "images/attach/jpg.gif";
   			page.find("#"+element_id+"").append('<tr id="attachment"><td></td><td><img src="'+img+'" border="0px">&nbsp;&nbsp;<a href="javascript:void(0);" onclick=downloadFile("'+a.savePath+'","'+a.fileName+'")   >'+a.fileName+'</a></td></tr>');
   		  }else if(extension == 'png'){
   			 img = "images/attach/png.gif";
   			page.find("#"+element_id+"").append('<tr id="attachment"><td></td><td><img src="'+img+'" border="0px">&nbsp;&nbsp;<a href="javascript:void(0);" onclick=downloadFile("'+a.savePath+'","'+a.fileName+'")   >'+a.fileName+'</a></td></tr>');
   		  }else if(extension == 'pdf'){
   			 img = "images/attach/pdf.gif";
   			page.find("#"+element_id+"").append('<tr id="attachment"><td></td><td><img src="'+img+'" border="0px">&nbsp;&nbsp;<a href="javascript:void(0);" onclick=downloadFile("'+a.savePath+'","'+a.fileName+'")   >'+a.fileName+'</a></td></tr>');
   		  }else if(extension == 'zip'){
       		 img = "images/attach/rar.gif";
       		 page.find("#"+element_id+"").append('<tr id="attachment"><td></td><td><img src="'+img+'" border="0px">&nbsp;&nbsp;<a href="javascript:void(0);" onclick=downloadFile("'+a.savePath+'","'+a.fileName+'")   >'+a.fileName+'</a></td></tr>');
   		  }else if(extension == 'rar'){
   			 img = "images/attach/rar.gif";
   			page.find("#"+element_id+"").append('<tr id="attachment"><td></td><td><img src="'+img+'" border="0px">&nbsp;&nbsp;<a href="javascript:void(0);" onclick=downloadFile("'+a.savePath+'","'+a.fileName+'")   >'+a.fileName+'</a></td></tr>');
   		  }else if(extension == 'gzip'){
   			 img = "images/attach/rar.gif";
   			page.find("#"+element_id+"").append('<tr id="attachment"><td></td><td><img src="'+img+'" border="0px">&nbsp;&nbsp;<a href="javascript:void(0);" onclick=downloadFile("'+a.savePath+'","'+a.fileName+'")   >'+a.fileName+'</a></td></tr>');
   		  }else if(extension == 'flash'){
   			 img = "images/attach/fla.gif";
   			page.find("#"+element_id+"").append('<tr id="attachment"><td></td><td><img src="'+img+'" border="0px">&nbsp;&nbsp;<a href="javascript:void(0);" onclick=downloadFile("'+a.savePath+'","'+a.fileName+'")   >'+a.fileName+'</a></td></tr>');
   		  }else if(extension == 'apk'){
   			 img = "images/attach/rar.gif";
   			page.find("#"+element_id+"").append('<tr id="attachment"><td></td><td><img src="'+img+'" border="0px">&nbsp;&nbsp;<a href="javascript:void(0);" onclick=downloadFile("'+a.savePath+'","'+a.fileName+'")  >'+a.fileName+'</a></td></tr>');
   		  }else if(extension == 'txt'){
 			 img = "images/attach/txt.gif";
			 page.find("#"+element_id+"").append('<tr id="attachment"><td></td><td><img src="'+img+'" border="0px">&nbsp;&nbsp;<a href="javascript:void(0);" onclick=downloadFile("'+a.savePath+'","'+a.fileName+'")   >'+a.fileName+'</a></td></tr>');
   		  }else if(extension == 'aip'){
 			 img = "images/attach/aip.gif";
			 page.find("#"+element_id+"").append('<tr id="attachment"><td></td><td><img src="'+img+'" border="0px">&nbsp;&nbsp;<a href="javascript:void(0);" onclick=downloadFile("'+a.savePath+'","'+a.fileName+'")   >'+a.fileName+'</a></td></tr>');
   		  }else if(extension == 'exe'){
   			 img = "images/attach/exe.gif";
   			page.find("#"+element_id+"").append('<tr id="attachment"><td></td><td><img src="'+img+'" border="0px">&nbsp;&nbsp;<a href="javascript:void(0);" onclick=downloadFile("'+a.savePath+'","'+a.fileName+'")   >'+a.fileName+'</a></td></tr>');
   		  } else{
   			  img = "images/attach/unknown.gif";
   			  page.find("#"+element_id+"").append('<tr id="attachment"><td></td><td><img src="'+img+'" border="0px">&nbsp;&nbsp;<a href="javascript:void(0);" onclick=downloadFile("'+a.savePath+'","'+a.fileName+'")   >'+a.fileName+'</a></td></tr>');
   		  }
   	   });
    }
    function downloadFile(url, fileName){
    	 showLoading();
    	 if(url.indexOf("file/email") > 0){
    		  showHide();
    		  window.location.href=contextPath+"/FileDownloadServlet?fileName="+url;
    	 }else{
        	 $.getJSON(contextPath+"/oa/downloadFile.xhtml"+callback, {url : url, fileName : fileName, random : Math.random()},function(msg){
        		 if($.trim(msg.returnCode) == '0'){
        			      showHide();
        			      //window.location.href=contextPath+"/FileDownloadServlet?fileName="+msg.data;
        			      window.location.href=contextPath+"/page/download/download.jsp?fileName="+msg.data;
        		 }    		
        	 });	
    	 }
    }
	/*********************************************************************************/
	function ajaxHandler(){
//		var commonPage = $("#common_page");
		$.ajaxSetup({
			  cache: false,
			  global: true,
			  async: true,
			  timeout:1000*60*2,
			  type: "GET",
			  error: function (xhr, status, e) {
				  showHide();
					  if(status=="timeout"){
						  showMessage('请求超时，请检查网络或者服务器配置！', 5000);
					  }
				  }
			});
		$(document).ajaxError(function(event,request, settings){
			showHide();
			var status = request.status;
			var statusText = request.statusText;
			console.log(request.responseText);

			if(status == "0" && statusText == "error"){
				showMessage('目前离线，请恢复网络后再试！', 5000);
			}else{
				if(""!=request.responseText){
					var data = eval("("+request.responseText+")");
					if(data.returnCode=="-1"){
						//清楚本地登陆状态
						session.remove("hasloginin");
						goto_page("login_page");
						//setTimeout(function(){goto_page("login_page");}, 1000);
						showMessage('用户身份异常，请重新登录！', 5000);
					}
				}else{
					showMessage('目前离线，请恢复网络后再试！', 5000);
				}
			}

    	});
		$(document).ajaxStart(function(){ 
    	});
		$(document).ajaxStop(function(){
			 //alert('服务器连接失败stop！');
        	 //$.mobile.loading('hide');
    	});
		$(document).ajaxSuccess(function(evt, request, settings,data) {
			//alert(settings.url+"success");
//			var test = request.responseText;
//			var result = new Function() {return test()};
		});
	}
	/*********************************************************************************/	
	function goto_page(page){
		
		if (page == null || page == "") {
			showMessage('指定页面不存在!', 5000);
			return;
		}
		
		nowPage = session.get("nowPage");
		
		if(nowPage == page && page!="login_page"){
			//如果前往页面与当前页面是同一页面，则不再入栈
			 if(currentLoadActionName != null && currentLoadActionName != ""){
				 eval(currentLoadActionName)();
			 }
		}else{
			session.set("fromPage", nowPage);
			//将当前页面加入页面堆栈
			prePageStock.push(nowPage);
			//修改当前页面为新页面
			nowPage = page;
			session.set("nowPage", nowPage);
			
		    $.mobile.changePage("#"+nowPage, {
		           transition: "none",
				    reverse: true,
				    changeHash: true
		     });
		}
	}
	
	function goto_page2(page){
		
		if (page == null || page == "") {
			showMessage('指定页面不存在!', 5000);
			return;
		}

		 $.mobile.changePage("#"+page, {
	           transition: "none",
			    reverse: true,
			    changeHash: true
	     });
		
//		nowPage = session.get("nowPage");
//		
//		if(nowPage == page && page!="login_page"){
//			//如果前往页面与当前页面是同一页面，则不再入栈
//			 if(currentLoadActionName != null && currentLoadActionName != ""){
//				 eval(currentLoadActionName)();
//			 }
//		}else{
//			session.set("fromPage", nowPage);
//			//将当前页面加入页面堆栈
////			prePageStock.push(nowPage);
//			//修改当前页面为新页面
//			nowPage = page;
//			session.set("nowPage", nowPage);
//			
//		   
//		}
	}
	
	function back_page(backPage){
		nowPage = session.get("nowPage");
		
		if(nowPage == backPage && backPage !="login_page") return;
		
		session.set("fromPage", nowPage);
		
		if (typeof(backPage) != "undefined" && backPage != null && $.trim(backPage) != "") {
			//如果要返回到指定页面，则该被返回的页面将不加入页面堆栈，此与goto_page明显区别。	
			//修改当前页面为新页面
			nowPage = backPage;
			var prePageStockLen = prePageStock.length;
			if(prePageStockLen >= 1){
				var lastPage = prePageStock[prePageStockLen-1];
				if(typeof(lastPage) != "undefined" 
					&& lastPage != null 
					&& $.trim(lastPage) != "" 
					&& lastPage == nowPage){
					//删除堆栈内最后的与当前页面相同的值
					prePageStock.splice(prePageStockLen-1,prePageStockLen);
				}
			}
			
		} else {
			nowPage = prePageStock.pop();
		}
		if (nowPage == null || nowPage == "") {
			nowPage = 'workbench_page';
		}
		
		if (nowPage == 'workbench_page' || nowPage == 'tool_box_page' || nowPage == 'contacts_dept_page' || nowPage == 'more_page') {
			//清空堆栈，避免内存溢出
			prePageStock.splice(0,prePageStock.length);
		}
			
		session.set("nowPage", nowPage);
	    $.mobile.changePage("#"+nowPage, {
	           transition: "none",
			    reverse: true,
			    changeHash: true
	     });
	}
	/*********************************************************************************/	
	function checkEmail(email){var pattern =/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;return pattern.test(email);}
	
	//导航全局控制
	$(".goto_workbench_public").live("tap",function(){
		goto_page("workbench_page");
	});
	
	$(".goto_tools_public").live("tap",function(){
		goto_page("tool_box_page");
	});
	
	$(".goto_tel_public").live("tap",function(){
		goto_page("contacts_dept_page");
	});
	
	$(".goto_more_public").live("tap",function(){
		goto_page("more_page");
	});
    
	//个人催收页面底部导航控制
	$("ul[tag='collection_page_bottom'] li").live("tap",function(){
		var $toPage = $(this).attr("toPage");
		goto_page($toPage);
	});
	
	//案件详情页面底部导航控制
	$("ul[tag='collection_case_details_bottom'] li").live("tap",function(){
		var $toPage = $(this).attr("toPage");
		goto_page($toPage);
	});
	
	//案件详情核销明细页面底部导航控制
	$("ul[tag='collection_case_writeoff_page_bottom'] li").live("tap",function(){
		var $toPage = $(this).attr("toPage");
		goto_page2($toPage);
	});
	
	//风险盘库页面底部导航控制
	$("ul[tag='audit_page_bottom'] li").live("tap",function(){
		var $toPage = $(this).attr("toPage");
		goto_page($toPage);
	});
	
	//宴请页面底部导航控制
	$("ul[tag='banq_page_bottom'] li").live("tap",function(){
		var $toPage = $(this).attr("toPage");
		goto_page($toPage);
	});
	
	function initMyDialog(){
		$(".overflows").hide();
		$(".oper").hide();
		$(".oper1").hide();
	};
	
	function showMyDialog(obj){
		if($(".overflows").is(":visible")){
			return;
		}else{
			$(".overflows").show();
			obj.show();
		}
	};
	
	function hideMyDialog(obj,time){
		if(typeof(time) == "number"){
			obj.slideUp(time,function(){
				$(".overflows").hide();
			});
		}else{
			obj.slideUp();
			$(".overflows").hide();
		}
	}
	
	function showConfirm(title, confirmFunc, canselFunc){
		var oper = $(".oper");
		oper.find(".tit").text(title);
		if($(".overflows").is(":visible")){
			return;
		}else{
			$(".overflows").show();
			oper.show();
		}
		oper.find(".CanselBtn").off("tap");
		oper.find(".ConfirmBtn").off("tap");
		oper.find(".ConfirmBtn").one("tap",function(){
			hideMyDialog(oper);
//			oper.find(".ConfirmBtn").off("tap");
			oper.find(".CanselBtn").off("tap");
			confirmFunc();
 		});
		oper.find(".CanselBtn").one("tap",function(){
			hideMyDialog(oper,500);
//			oper.find(".CanselBtn").off("tap");
			oper.find(".ConfirmBtn").off("tap");
			if (canselFunc != null) {
				canselFunc();
			}
 		});
	};
		
	function showConfirmBackpage(title, confirmFunc, canselFunc){
		var oper = $(".oper2");
		oper.find(".tit").text(title);
		if($(".overflows").is(":visible")){
			return;
		}else{
			$(".overflows").show();
			oper.show();
		}
		oper.find(".CanselBtn").off("tap");
		oper.find(".ConfirmBtn").off("tap");
		oper.find(".ConfirmBtn").one("tap",function(){
			hideMyDialog(oper);
			oper.find(".CanselBtn").off("tap");
			confirmFunc();
 		});
		oper.find(".CanselBtn").one("tap",function(){
			hideMyDialog(oper,500);
			oper.find(".ConfirmBtn").off("tap");
			if (canselFunc != null) {
				canselFunc();
			}
 		});
	};
	
	function showConfirmSignature(title,message, confirmFunc, canselFunc){
		var oper = $(".oper7");
		oper.find(".tit").text(title);
		oper.find(".promptMsg").html("");
		oper.find(".promptMsg").html(message);
		if($(".overflows").is(":visible")){
			return;
		}else{
			$(".overflows").show();
			oper.show();
		}
		oper.find(".CanselBtn").off("tap");
		oper.find(".ConfirmBtn").off("tap");
		oper.find(".ConfirmBtn").one("tap",function(){
			hideMyDialog(oper);
			oper.find(".CanselBtn").off("tap");
			confirmFunc();
 		});
		oper.find(".CanselBtn").one("tap",function(){
			hideMyDialog(oper,500);
			oper.find(".ConfirmBtn").off("tap");
			if (canselFunc != null) {
				canselFunc();
			}
 		});
	};
	
	function showConfirmsignature_report(title,message, confirmFunc, canselFunc){
		var oper = $(".oper8");
		oper.find(".tit").text(title);
		oper.find(".promptMsg").html("");
		oper.find(".promptMsg").html(message);
		if($(".overflows").is(":visible")){
			return;
		}else{
			$(".overflows").show();
			oper.show();
		}
		oper.find(".CanselBtn").off("tap");
		oper.find(".ConfirmBtn").off("tap");
		oper.find(".ConfirmBtn").one("tap",function(){
			hideMyDialog(oper);
			oper.find(".CanselBtn").off("tap");
			confirmFunc();
 		});
		oper.find(".CanselBtn").one("tap",function(){
			hideMyDialog(oper,500);
			oper.find(".ConfirmBtn").off("tap");
			if (canselFunc != null) {
				canselFunc();
			}
 		});
	};
	
	function showConfirmMultiline(title,message, confirmFunc, canselFunc){
		var oper = $(".oper1");
		oper.find(".tit").text(title);
		oper.find(".checkMsg").html("");
		var html = ""
		for(var i = 0; i < message.length; i++){
			html += "<span style='font-weight:bold;font-size:16px;'>"+(i+1)+". </span>"+message[i]+"<br>";
		}
		oper.find(".checkMsg").html(html);
		
		if($(".overflows").is(":visible")){
			return;
		}else{
			$(".overflows").show();
			oper.show();
		}
		oper.find(".CanselBtn").off("tap");
		oper.find(".ConfirmBtn").off("tap");
		oper.find(".ConfirmBtn").one("tap",function(){
			hideMyDialog(oper);
			oper.find(".CanselBtn").off("tap");
			confirmFunc();
			oper.find(".checkMsg").html("");
 		});
		oper.find(".CanselBtn").one("tap",function(){
			hideMyDialog(oper,500);
			oper.find(".ConfirmBtn").off("tap");
			if (canselFunc != null) {
				canselFunc();
			}
			oper.find(".checkMsg").html("");
 		});
	};
	
	function showConfirmLongPromptMsg(title,message, confirmFunc, canselFunc){
		var oper = $(".oper3");
		oper.find(".tit").text(title);
		oper.find(".promptMsg").html("");
		oper.find(".promptMsg").html(message);
		
		if($(".overflows").is(":visible")){
			return;
		}else{
			$(".overflows").show();
			oper.show();
		}
		oper.find(".CanselBtn").off("tap");
		oper.find(".ConfirmBtn").off("tap");
		oper.find(".ConfirmBtn").one("tap",function(){
			hideMyDialog(oper);
			oper.find(".CanselBtn").off("tap");
			confirmFunc();
			oper.find(".promptMsg").html("");
		});
		oper.find(".CanselBtn").one("tap",function(){
			hideMyDialog(oper,500);
			oper.find(".ConfirmBtn").off("tap");
			if (canselFunc != null) {
				canselFunc();
			}
			oper.find(".promptMsg").html("");
		});
	};
	
	function showSaveConfirmLongPromptMsg(title,message, confirmFunc, canselFunc){
		var oper = $(".oper4");
		oper.find(".tit").text(title);
		oper.find(".promptMsg").html("");
		oper.find(".promptMsg").html(message);
		
		if($(".overflows").is(":visible")){
			return;
		}else{
			$(".overflows").show();
			oper.show();
		}
		oper.find(".ConfirmBtn").off("tap");
		oper.find(".ConfirmBtn").one("tap",function(){
			hideMyDialog(oper);
			confirmFunc();
			oper.find(".promptMsg").html("");
		});
	};
	
	function showAuditReportBackPageConfirmMsg(title,message, confirmFunc, canselFunc){
		var oper = $(".oper4");
		oper.find(".tit").text(title);
		oper.find(".promptMsg").html("");
		oper.find(".promptMsg").html(message);
		
		if($(".overflows").is(":visible")){
			return;
		}else{
			$(".overflows").show();
			oper.show();
		}
		oper.find(".ConfirmBtn").off("tap");
		oper.find(".ConfirmBtn").one("tap",function(){
			 console.log("ConfirmBtn tap");
//			hideMyDialog(oper);
			confirmFunc(oper);
//			oper.find(".promptMsg").html("");
		});
	};
	
    function showAuditReportMessage(msg,oper,confirmFunc,time){
	       $.mobile.loading('hide');
	      var messageHtml = "<div>" +
	      		"<div style='text-align:center;font-family:SimHei;font-weight:bold;font-size:15px;color:black;'>温馨提示</div>" +
	      		"<div style='text-align:center;font-size:15px;color:black;'>"+msg+"</div>" +
	      		"</div>";
	      
	       $.mobile.loading('alert',{text:msg,textVisible: true,theme: 'a',textonly: true,html:messageHtml});
	       if(time != null && time != 0){
	 	      setTimeout(function(){
	 	    	  $.mobile.loading('hide');
	 	    	  oper.find(".ConfirmBtn").off("tap");
	 	    	  oper.find(".ConfirmBtn").one("tap",function(){
	 				 confirmFunc(oper);
	 	    	  	});
	 	    	  }, time);
	       }else{
	    	  setTimeout(function(){
	    		  $.mobile.loading('hide');
	    		  	oper.find(".ConfirmBtn").off("tap");
	    			oper.find(".ConfirmBtn").one("tap",function(){
	    				confirmFunc(oper);
	    			});
	    		  }, 3000);
	       }
}
    
	function showEditInfoConfirmLongPromptMsg(title,message, confirmFunc, canselFunc){
		var oper = $(".oper5");
		oper.find(".tit").text(title);
		oper.find(".promptMsg").html("");
		oper.find(".promptMsg").html(message);
		
		if($(".overflows").is(":visible")){
			return;
		}else{
			$(".overflows").show();
			oper.show();
		}
		oper.find(".ConfirmBtn").off("tap");
		oper.find(".ConfirmBtn").one("tap",function(){
			hideMyDialog(oper);
			confirmFunc();
			oper.find(".promptMsg").html("");
		});
	};
	
	function showLongPromptMsg(title,message, confirmFunc, canselFunc){
		var oper = $(".oper6");
		oper.find(".tit").text(title);
		oper.find(".promptMsg").html("");
		oper.find(".promptMsg").html(message);
		
		if($(".overflows").is(":visible")){
			return;
		}else{
			$(".overflows").show();
			oper.show();
		}
		oper.find(".ConfirmBtn").off("tap");
		oper.find(".ConfirmBtn").one("tap",function(){
			hideMyDialog(oper);
			confirmFunc();
			oper.find(".promptMsg").html("");
		});
		oper.find(".CanselBtn").one("tap",function(){
			hideMyDialog(oper,500);
			oper.find(".ConfirmBtn").off("tap");
			if (canselFunc != null) {
				canselFunc();
			}
			oper.find(".promptMsg").html("");
		});
	};
	
	function showConfirmDialog(title,data, confirmFunc){
		var oper = $(".oper");
		oper.find(".tit").text(title);
		if($(".overflows").is(":visible")){
			return;
		}else{
			$(".overflows").show();
			oper.show();
		}
		oper.find(".ConfirmBtn").one("tap",function(){
			hideMyDialog(oper);
//			oper.find(".ConfirmBtn").off("tap");
			oper.find(".CanselBtn").off("tap");
			confirmFunc(data);
 		});
		oper.find(".CanselBtn").one("tap",function(){
			hideMyDialog(oper,500);
			oper.find(".ConfirmBtn").off("tap");
//			oper.find(".CanselBtn").off("tap");
//			if (canselFunc != null) {
//				canselFunc();
//			}
 		});
	};
	//----------------------------------
	//处理服务器端返回的日期对象（与普通Js的日期对象不同）
	//--------------------------------------------
	function ConvertToDateString(dateObj)
	{
		var d = dateObj;
		var year = (d.year < 1900) ? (1900 + d.year) : d.year;
		var month = d.month+1;
		var date = d.date;
		
		return year+"-"+month+"-"+date;
	};
	
	function ConvertToDatetimeString(dateObj)
	{
		var d = dateObj;
		var year = (d.year < 1900) ? (1900 + d.year) : d.year;
		var month = d.month+1;
		var date = d.date;
		var hours = d.hours;
		var minutes = d.minutes;
		var seconds = d.seconds;
		return year+"-"+month+"-"+date+" "+hours+":"+minutes+":"+seconds;
	};
	
	//---------------------------------------------------  
	// 日期格式化  
	// 格式 YYYY/yyyy/YY/yy 表示年份  
	// MM/M 月份  
	// W/w 星期  
	// dd/DD/d/D 日期  
	// hh/HH/h/H 时间  
	// mm/m 分钟  
	// ss/SS/s/S 秒  
	// ffff 毫秒
	//---------------------------------------------------  
	Date.prototype.Format = function(formatStr)   
	{   
	    var str = formatStr;   
	    var Week = ['日','一','二','三','四','五','六'];  
	  
	    str=str.replace(/yyyy|YYYY/,this.getFullYear());   
	    str=str.replace(/yy|YY/,(this.getYear() % 100)>9?(this.getYear() % 100).toString():'0' + (this.getYear() % 100));   
	    var currentMonth = this.getMonth()+1;
	    str=str.replace(/MM/,currentMonth>9?currentMonth:'0' + currentMonth);   
	    str=str.replace(/M/g,currentMonth+1);   
	  
	    str=str.replace(/w|W/g,Week[this.getDay()]);   
	  
	    str=str.replace(/dd|DD/,this.getDate()>9?this.getDate().toString():'0' + this.getDate());   
	    str=str.replace(/d|D/g,this.getDate());   
	  
	    str=str.replace(/hh|HH/,this.getHours()>9?this.getHours().toString():'0' + this.getHours());   
	    str=str.replace(/h|H/g,this.getHours());   
	    
	    str=str.replace(/mm/,this.getMinutes()>9?this.getMinutes().toString():'0' + this.getMinutes());   
	    str=str.replace(/m/g,this.getMinutes());   
	  
	    str=str.replace(/ss|SS/,this.getSeconds()>9?this.getSeconds().toString():'0' + this.getSeconds());   
	    str=str.replace(/s|S/g,this.getSeconds());
	  
//	    str=str.replace(/f|F/g,this.getSeconds());
	    
	    return str;   
	};
//	d.getMilliseconds()
//	  Label16.Text = string.Format("{0:yyyyMMddHHmmssffff}",dt);	
	
	
	//将数据（dataObject）绑定到指定元素（element）的后代元素
	function dataBindToElement(element,dataObject){
		for (property in dataObject)  
		  {  
			var $node = element.find("[identity='"+property+"']");
			if($node.prop("nodeName") === "INPUT" 
				|| $node.prop("nodeName") === "TEXTAREA" 
					|| $node.prop("nodeName") ==="SELECT"){
				$node.val(dataObject[property]);
			}
			else{
				$node.text(dataObject[property]);
			}
		  }
	}
	
	function getDataFromElement(element){
		var data = {};
		var $nodes = $(element).find("[identity]");
		$.each($nodes,function(i,n){
			var $n = $(n);
			if($n.prop("nodeName") === "INPUT" 
				|| $n.prop("nodeName") === "TEXTAREA" 
					|| $n.prop("nodeName") ==="SELECT"){
				
				data[$n.attr("identity")] = $n.val();
				
			}
			else{
				data[$n.attr("identity")] = $n.text();
			}
		});
		return data;
	}
	// 获取本月第一天
	function getStartDate() {

		var dtmDate = new Date();
		var dtmYear = dtmDate.getFullYear();
		var dtmMonth = dtmDate.getMonth() + 1;
		dtmMonth = dtmMonth < 10 ? ("0" + dtmMonth) : dtmMonth;
		var dtmFirstdate = dtmYear + '-' + dtmMonth + '-01'
		return dtmFirstdate;
	}

	// 获取当天
	function getEndTime() {
		var dtmDate = new Date();
		var dtmYear = dtmDate.getFullYear();
		var dtmMonth = dtmDate.getMonth() + 1;
		dtmMonth = dtmMonth < 10 ? ("0" + dtmMonth) : dtmMonth;
		var dtmDay = dtmDate.getDate();
		dtmDay = dtmDay < 10 ? ("0" + dtmDay) : dtmDay;
		var dtmToday = dtmYear + "-" + dtmMonth + "-" + dtmDay;
		return dtmToday;
	}
	function GetDateStr(AddDayCount) {
	    var dd = new Date();
	    dd.setDate(dd.getDate()+AddDayCount);//获取AddDayCount天后的日期
//	    dd.setTime(dd.getTime()+AddDayCount*24*60*60*1000);//获取AddDayCount天后的日期
	    var y = dd.getFullYear();
	    var m = dd.getMonth()+1;//获取当前月份的日期
	    m = m < 10 ? ("0" + m) : m;
	    var d = dd.getDate();
	    d = d < 10 ? ("0" + d) : d;
	    return y+"-"+m+"-"+d;
	}
	// 获取昨天
	function getYesterdayDate() {
		return GetDateStr(-1);
	}
	//格式化当前时间
	function getNowString() {
		var date = new Date();
		var seperator1 = "-";
		var seperator2 = ":";
		var month = date.getMonth() + 1;
		var strDate = date.getDate();
		if (month >= 1 && month <= 9) month = "0" + month;
		if (strDate >= 0 && strDate <= 9) strDate = "0" + strDate;
		var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
			+ " " + date.getHours() + seperator2 + date.getMinutes() + seperator2 + date.getSeconds();
		return currentdate;
	}
	/**
	 * 调用方法 Format(date,"yyyy-MM-dd HH:mm");
	 * 输出格式为 "2015-10-14 16:50"；第一个参数为时间，第二个参数为输出格式。
　　	 格式中代表的意义：
　　　　d:日期天数；dd:日期天数（2位，不够补0）；ddd:星期（英文简写）；dddd:星期（英文全拼）；
　　　　M:数字月份；MM:数字月份（2位，不够补0）；MMM:月份（英文简写）；MMMM:月份（英文全拼）；
　　　　yy:年份（2位）；yyyy:年份；
　　　　h:小时（12时计时法）；hh:小时（2位，不足补0；12时计时法）；
　　　　H:小时（24时计时法）；HH:小时（2位，不足补0；24时计时法）；
　　　　m:分钟；mm:分钟（2位，不足补0）；
　　　　s:秒；ss:秒（2位，不足补0）；
　　　　l:毫秒数（保留3位）；
　　　　tt: 小时（12时计时法，保留am、pm）；TT: 小时（12时计时法，保留AM、PM）；
	 * @param now
	 * @param mask
	 * @returns
	 */
	function Format(now,mask)
    {
        var d = now;
        var zeroize = function (value, length)
        {
            if (!length) length = 2;
            value = String(value);
            for (var i = 0, zeros = ''; i < (length - value.length); i++)
            {
                zeros += '0';
            }
            return zeros + value;
        };
     
        return mask.replace(/"[^"]*"|'[^']*'|\b(?:d{1,4}|m{1,4}|yy(?:yy)?|([hHMstT])\1?|[lLZ])\b/g, function ($0)
        {
            switch ($0)
            {
                case 'd': return d.getDate();
                case 'dd': return zeroize(d.getDate());
                case 'ddd': return ['Sun', 'Mon', 'Tue', 'Wed', 'Thr', 'Fri', 'Sat'][d.getDay()];
                case 'dddd': return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()];
                case 'M': return d.getMonth() + 1;
                case 'MM': return zeroize(d.getMonth() + 1);
                case 'MMM': return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()];
                case 'MMMM': return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][d.getMonth()];
                case 'yy': return String(d.getFullYear()).substr(2);
                case 'yyyy': return d.getFullYear();
                case 'h': return d.getHours() % 12 || 12;
                case 'hh': return zeroize(d.getHours() % 12 || 12);
                case 'H': return d.getHours();
                case 'HH': return zeroize(d.getHours());
                case 'm': return d.getMinutes();
                case 'mm': return zeroize(d.getMinutes());
                case 's': return d.getSeconds();
                case 'ss': return zeroize(d.getSeconds());
                case 'l': return zeroize(d.getMilliseconds(), 3);
                case 'L': var m = d.getMilliseconds();
                    if (m > 99) m = Math.round(m / 10);
                    return zeroize(m);
                case 'tt': return d.getHours() < 12 ? 'am' : 'pm';
                case 'TT': return d.getHours() < 12 ? 'AM' : 'PM';
                case 'Z': return d.toUTCString().match(/[A-Z]+$/);
                // Return quoted strings with the surrounding quotes removed
                default: return $0.substr(1, $0.length - 2);
            }
        });
    };
	//图片格式转换
	//http://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata
	function dataURItoBlob (dataURI) {
		// convert base64/URLEncoded data component to raw binary data held in a string
		var byteString;
		if (dataURI.split(',')[0].indexOf('base64') >= 0)
			byteString = atob(dataURI.split(',')[1]);
		else
			byteString = unescape(dataURI.split(',')[1]);
		// separate out the mime component
		var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
		// write the bytes of the string to a typed array
		var ia = new Uint8Array(byteString.length);
		for (var i = 0; i < byteString.length; i++) {
			ia[i] = byteString.charCodeAt(i);
		}
		return new Blob([ia], {type:mimeString});
	}
	
	
	function convertImgToBase64(url, callback, outputFormat){ 
		var canvas = document.createElement('CANVAS'); 
		var ctx = canvas.getContext('2d'); 
		var img = new Image; 
		img.crossOrigin = 'Anonymous'; 
		img.onload = function(){ 
		canvas.height = img.height; 
		canvas.width = img.width; 
		ctx.drawImage(img,0,0); 
		var dataURL = canvas.toDataURL(outputFormat || 'image/png'); 
		callback.call(this, dataURL); 
		// Clean up 
		canvas = null; 
		}; 
		img.src = url; 
	} 
	
		
	function uuid() {
	    var s = [];
	    var hexDigits = "0123456789abcdef";
	    for (var i = 0; i < 36; i++) {
	        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
	    }
	    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
	    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
	    s[8] = s[13] = s[18] = s[23] = "-";
	 
	    var uuid = s.join("");
	    return uuid;
	}
	
	function formatNumberToThousands(number){
		var numberString = number.toString();
		var regex = /(?=(?!(\b))(\d{3})+$)/g;
		return numberString.replace(regex,",");
	}
	
	//JS实现数字自动转换金额（自动格式化输入的数字/千位分隔符）
	function fmoney(s, n) {
		if(s.length <= 0) return "";
		var m = "";
		if(s < 0){
			m = "-";
			s = s.substr(1);
		}
		n = n > 0 && n <= 20 ? n : 2; 
		s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + ""; 
		var l = s.split(".")[0].split("").reverse(), r = s.split(".")[1]; 
		t = ""; 
		for (i = 0; i < l.length; i++) { 
		t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : ""); 
		} 
		return m + t.split("").reverse().join("") + "." + r; 
	} 
	
//	//JS实现数字自动转换人民币金额（自动格式化输入的数字/千位分隔符）
//	function formatMoney(s) {
//		if (/[^0-9\.]/.test(s))
//			return "invalid value";
//		s = s.replace(/^(\d*)$/, "$1.");
//		s = (s + "00").replace(/(\d*\.\d\d)\d*/, "$1");
//		s = s.replace(".", ",");
//		var re = /(\d)(\d{3},)/;
//		while (re.test(s))
//			s = s.replace(re, "$1,$2");
//		s = s.replace(/,(\d\d)$/, ".$1");
//		return "￥" + s.replace(/^\./, "0.")
//	}
	//将金额格式的数字在返回成float型。 
	function rmoney(s) 
	{ 
		if (s == '') return s;
		return parseFloat(s.replace(/[^\d\.-]/g, "")); 
	} 
	
	//只能输入数字 及最多两位小数
	function onlyInNum(obj){
		obj.value = obj.value.replace(/[^\d.]/g,""); //清除"数字"和"."以外的字符
		obj.value = obj.value.replace(/^\./g,""); //验证第一个字符是数字
		obj.value = obj.value.replace(/\.{2,}/g,"."); //只保留第一个, 清除多余的
		obj.value = obj.value.replace(".","$#$").replace(/\./g,"").replace("$#$",".");
		obj.value = obj.value.replace(/^(\-)*(\d+)\.(\d\d).*$/,'$1$2.$3'); //只能输入两个小数
	}
	
	//只能输入数字 及最多两位小数(允许输入负数)
	function inNumAndNegativeNum(event,obj){
		//响应鼠标事件，允许左右方向键移动 
	    event = window.event||event; 
	    if(event.keyCode == 37 | event.keyCode == 39){ 
	        return; 
	    }
	    //输入的初始值
	    var initialValue = obj.value;
		obj.value = obj.value.replace(/[^\d.]/g,""); //清除"数字"和"."以外的字符
		obj.value = obj.value.replace(/^\./g,""); //验证第一个字符是数字而不是小数点. 
		obj.value = obj.value.replace(/\.{2,}/g,"."); //保证只有出现一个小数点.而没有多个小数点. 
		obj.value = obj.value.replace(".","$#$").replace(/\./g,"").replace("$#$",".");//保证小数点.只出现一次，而不能出现两次以上 
		obj.value = obj.value.replace(/^(\-)*(\d+)\.(\d\d).*$/,'$1$2.$3'); //只能输入两个小数
		//如果第一位是负号，则允许添加 
		var t = initialValue.charAt(0);
		if (t == '-') {
			obj.value = '-' + obj.value;
		}
	}
	
	 function checkNum(obj){ 
		 //为了去除最后一个小数点. 
		 obj.value = obj.value.replace(/\.$/g,""); 
	 }
	 
	function checkMoney(e) { 
	    var re = /^\d+(\.\d+)?$/;
	    if (e != "") { 
	        if (!re.test(e)) { 
	        	return false;
	        } 
	    } 
	    return true;
	}
	
	/**
	 *转换long值为日期字符串
	 * @param l long值
	 * @param pattern 格式字符串,例如：yyyy-MM-dd hh:mm:ss
	 * @return 符合要求的日期字符串
	*/
	function getFormatDateByLong(longDate, pattern) {
		return getFormatDate(new Date(longDate), pattern);
	}
	
	 /**
	 *转换日期对象为日期字符串
	 * @param l long值
	 * @param pattern 格式字符串,例如：yyyy-MM-dd hh:mm:ss
	 * @return 符合要求的日期字符串
	*/
	function getFormatDate(date, pattern) {
		if (date == undefined) {
			date = new Date();
		}
		if (pattern == undefined) {
			pattern = "yyyy-MM-dd hh:mm:ss";
		}
		return date.formatDateByPattern(pattern);
	}
	
	//扩展Date的formatDateByPattern方法
	Date.prototype.formatDateByPattern = function (format) {
		var o = {
			"M+" : this.getMonth() + 1,
			"d+" : this.getDate(),
			"h+" : this.getHours(),
			"m+" : this.getMinutes(),
			"s+" : this.getSeconds(),
			"q+" : Math.floor((this.getMonth() + 3) / 3),
			"S" : this.getMilliseconds()
		}
		if (/(y+)/.test(format)) {
			format = format.replace(RegExp.$1, (this.getFullYear() + "")
					.substr(4 - RegExp.$1.length));
		}
		for ( var k in o) {
			if (new RegExp("(" + k + ")").test(format)) {
				format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k]
						: ("00" + o[k]).substr(("" + o[k]).length));
			}
		}
		return format;
	}
	
	/**
     * 限制字符串实际长度，中文2，英文1 要获得长度的字符串
     */
     function limitLength(obj,maxlen) {
    	var str = obj.value;
        var realLength = 0, len = str.length, charCode = -1;
        for ( var i = 0; i < len; i++) {
            charCode = str.charCodeAt(i);
            if (charCode >= 0 && charCode <= 128){
            	realLength += 1;
            }else{
            	realLength += 2;
            }
                
            if(realLength > maxlen){
            	$(obj).val(str.substring(0,i));
            	return false;
            }
        }
        
        return true;
    }

 	/**
      * 限制字符串实际长度，中文2，英文1 要获得长度的字符串
      */
      function getStrLength(str) {
         var realLength = 0, len = str.length, charCode = -1;
         for ( var i = 0; i < len; i++) {
             charCode = str.charCodeAt(i);
             if (charCode >= 0 && charCode <= 128){
             	realLength += 1;
             }else{
             	realLength += 2;
             }
         }
         return realLength;
     }
      
     //过滤字符串html标签方法
     function filterHTMLTag(msg) {
         var msg = msg.replace(/<\/?[^>]*>/g, ''); //去除HTML Tag
         msg = msg.replace(/[|]*\n/, '') //去除行尾空格
         msg = msg.replace(/&npsp;/ig, ''); //去掉npsp
         return msg;
     }
 
 	//主加密函数
 	function encrypt(str){
 	    var encryptStr="";//最终返回的加密后的字符串
 	    encryptStr+=produceRandom(3);//产生3位随机数

 	    var temp=encode16(str).split("{");//对要加密的字符转换成16进制
 	    var numLength=temp[0].length;//转换后的字符长度
 	    numLength=numLength.toString(16);//字符长度换算成16进制
 	    if(numLength.length==1){//如果是1，补一个0
 	        numLength="0"+numLength;
 	    }else if(numLength.length>2){//转换后的16进制字符长度如果大于2位数，则返回，不支持
 	        return "";
 	    }
 	    encryptStr+=numLength;

 	    if(temp[1]=="0"){
 	        encryptStr+=0;
 	    }else if(temp[1]=="1"){
 	        encryptStr+=1;
 	    }

 	    encryptStr+=temp[0];

 	    if(encryptStr.length<20){//如果小于20位，补上随机数
 	        var ran=produceRandom(20-encryptStr.length);
 	        encryptStr+=ran;
 	    }
 	    return encryptStr;
 	}
     
     function encode16(str){
	   // str=str.toLowerCase();
	    if (str.match(/^[-+]?\d*$/) == null){//非整数字符，对每一个字符都转换成16进制，然后拼接
	        var s=str.split("");
	        var temp="";
	        for(var i=0;i<s.length;i++){
	            s[i]=s[i].charCodeAt();//先转换成Unicode编码
	            s[i]=s[i].toString(16);
	            temp=temp+s[i];
	        }
	        return temp+"{"+1;//1代表字符
	    }else{//数字直接转换成16进制
	        str=parseInt(str).toString(16);
	    }
	    return str+"{"+0;//0代表纯数字
	}


	function produceRandom(n){
	    var num="";
	    for(var i=0;i<n;i++)
	    {
	        num+=Math.floor(Math.random()*10);
	    }
	    return num;
	}