/*********************************************************login init begin*****************************************************************/	
var server_config_page = $('#server_config_page');
/******************************home_page---begin**************************************/	   
            server_config_page.live('pageinit',function(e, ui){
                server_config_page.find(".BackBtn").live("tap",function(){
                	goto_page("login_page");
                });
                
                server_config_page.find(".SaveBtn").live("fastClick",function(){
                	showConfirm("确认是否保存", saveConfig);
                });
                
    	    });	
            server_config_page.live('pageshow',function(e, ui){
            	var page = $("#server_config_page");
                page.find("#server_config_text").val(local.get("server_config"));
                
            });	
            server_config_page.live('pagehide',function(e, ui){
    	    });	
            
            function saveConfig() {
            	var page = $("#server_config_page");
                var server_config = page.find("#server_config_text").val();
                
                if($.trim(server_config).length<=0){
                	showMessage('服务器设置不能为空！', 5000);
                	return;
                }
                
                local.set("server_config",server_config);
                //更新服务配置
                refreshServerConfig();
//                refreshLang(function() {
//                	goto_page("login_page");
//                });
                showMessage('服务器设置保存成功！', 5000);
                goto_page("login_page");
            	
            }
/******************************home_page---end**************************************/
