/*********************************************************login init begin*****************************************************************/	
var message_upload_page = $('#message_upload_page');

/******************************home_page---begin**************************************/	   
message_upload_page.live('pageinit',function(e, ui){
	message_upload_page.find(".BackBtn").live("tap",function(){

		back_page();
	});	
	
	//点击提交
	message_upload_page.find(".SaveBtn2").live("tap",function(){
		submitMessage();
	});

});

message_upload_page.live('pageshow',function(e, ui){
	 $('#message_upload_page').find("[identity='message_upload']").val("");
});


function submitMessage(){
	
	showLoading();
	
	var userInfo = JSON.parse(session.get("userInfo"));
	 var authData = {};
     //获取当前时间
     var currentDatetime = new Date().Format("YYYY/MM/DD HH/mm/ss");
     var uploadMessage = $('#message_upload_page').find("[identity='message_upload']").val();
     
     authData.sendTime=currentDatetime;
     authData.sendUser = session.get("userCode");
     authData.message = uploadMessage
     authData.status="1";

     
   //数据库增加数据
     $.getJSON(basePath+"/app/uploadMessageReceiver/addUploadMessage.xhtml"+callback,authData,function(msg){
               if($.trim(msg.returnCode) == '0'){
            	   showHide();
               if(msg.data>0){
            	   showMessage('信息上报成功','5000');
               }
               }else {
               showHide();
               errorHandler(msg.returnCode, msg.message);
               }
               });
}