
         	$(document).bind('pageinit',function(){
                var button = $('#upload_button'), interval;
                var fileType = "all",fileNum = "one"; 
                new AjaxUpload(button,{
                    action: contextPath+'/upload', 
                    /*data:{
                        'buttoninfo':button.text()
                    },*/
                    name: 'userfile',
                    responseType: 'json',
                    autoSubmit: true,
                    onSubmit : function(file, ext){
                        if(fileType == "pic")
                        {
                            if (ext && /^(jpg|png|jpeg|gif)$/.test(ext)){
                                this.setData({'info': '文件类型为图片'});
                            } else {
                                $('<li></li>').appendTo('#attachFileList .files').text('非图片类型文件，请重传');
                                return false;               
                            }
                        }                          
                        button.text('附件上传中');            
                        if(fileNum == 'one')
                            this.disable();               
                        interval = window.setInterval(function(){
                            var text = button.text();
                            if (text.length < 14){
                                button.text(text + '.');                    
                            } else {
                                button.text('附件上传中');             
                            }
                        }, 200);
                    },
                    onComplete: function(file, response){
                        if(response != "success"){
                        	//alert(response.filename);  
                        }
                        button.text('文件上传');                            
                        window.clearInterval(interval);                         
                        this.enable();               
                        if(response == "success");
                            //$('<li></li>').appendTo('#example .files').text(file);    
                        $("#send_email_page").find("#filesList").append("<div><span>"+file+"</span>&nbsp;&nbsp;&nbsp;&nbsp;<a id='"+file+"' href='javascript:void(0)' onclick=removeAttachFile(\""+file+"\") >删除</a><div>");     
                    }
                });    
        	});