      var travel_record_details_page = $("#travel_record_details_page");
          var travel_record_details_myScroll;
          travel_record_details_page.live("pageinit",function(e,ui){
        	    var wrapper = "travel_record_details_wrapper";  
        		var up = "travel_record_details_pullUp";
        		var down = "travel_record_details_pullDown";
        		travel_record_details_myScroll = createMyScroll(wrapper, up, down);
        	  //返回行车列表
        	  travel_record_details_page.find(".BackBtn").live("tap",function(event){
        		  event.stopPropagation();
                    back_page();
        	  });
        	  
        	  //点击保存
        	  travel_record_details_page.find(".SaveBtn").live("tap",function(){
        		  
        		  queryFeeUpdateTime();
        	  });
        	  //查看催收记录
        	  travel_record_details_page.find(".checkBtn").live("tap",function(){
        		  //催收记录列表？催记详细？
        		  session.set("collectionRecordId", $(this).attr("collection_record_id"));
        		  goto_page("collection_record_details_page");
        	  });
        	  
          });
          
          travel_record_details_page.live("pageshow",function(e,ui){
        	  
        	  currentLoadActionName = "travel_record_details_load_content"
        	
        	var fromPage = session.get("fromPage");
          	//如果前页面是workbench,则进入页面后重新加载数据
          	if (fromPage == "travel_record_list_page") {
          		load_travel_record_details_content();
          	}  
          	
          });
          
          function travel_record_details_load_content(){
        	  
          }
          
          function load_travel_record_details_content(){
//             $("#travel_record_details_page .List").empty();
        	  
        	  var page=$("#travel_record_details_page");

              showLoading();
        	  var authData = {};
        	  authData.travelRecordId=session.get("travelRecordId");
        	  // alert(session.get("travelRecordId"));
        	  authData.userId = session.get("userId");
        	  authData.userCode = session.get("userCode");
        	  authData.random=Math.random();
        	  
        	  $.getJSON(basePath+"/app/travelLingDetails/queryTravelingRecordDetailsList.xhtml"+callback,authData,function(msg){
        		  if($.trim(msg.returnCode) == '0'){
        			  
        			  page.find(".basicInfo1 span").text("");
        			  page.find(".basicInfo1 input").val("");
        			  if(msg.data != null){
        				  
        				 //行车记录详情信息
        				 var travelingRecordDetails = msg.data.travelingRecordDetails;
        				  
        				 if(travelingRecordDetails != null){
        					 
        					var customerName = session.get("customerName");
          					var contractNumber = session.get("contractNumber");
          					var businessType = session.get("businessType");
          					session.remove("customerName");
          					session.remove("contractNumber");
          					session.remove("businessType");
         					
//        			    	 page.find("[identity='customerName']").text(travelingRecordDetails["customer_name"]);
//        				     page.find("[identity='contractNumber']").text(travelingRecordDetails["contract_number"]);
          					//RETURN_HOME:表示返程；UN_RETURN_HOME：表示非返程记录
//             			    if(travelingRecordDetails["flag"] == 'RETURN_HOME'){
          					//FI_CUSTOM_TASK时collection_record_id也为空
             			    if(businessType == "RETURN"){
             			    	page.find("[identity='customerName']").text("返程记录，无客户姓名");
	             			    page.find("[identity='contractNumber']").text("返程记录，无合同号");
             			     }else{
	            				 page.find("[identity='customerName']").text(customerName);
	             			     page.find("[identity='contractNumber']").text(contractNumber);
             			     }
              			     
              			     page.find("[identity='departureDatetime']").text(travelingRecordDetails["departure_datetime"]);
              			     page.find("[identity='arrivalDatetime']").text(travelingRecordDetails["arrival_datetime"]);
              			     page.find("[identity='departureDate']").text(travelingRecordDetails["departure_date"]);
              			     page.find("[identity='arrivalDate']").text(travelingRecordDetails["arrival_date"]);
              			     page.find("[identity='departureAddress']").text(travelingRecordDetails["departure_address"]);
              			     page.find("[identity='arrivalAddress']").text(travelingRecordDetails["arrival_address"]);
              			     
               			   if(travelingRecordDetails["mileage"] != 0){
               				 page.find("[identity='mileage']").text(Math.round(travelingRecordDetails["mileage"]));
               			   }else{
     	          				 var polyline = new AMap.Polyline({
     	                             path:msg.data.locationArray
     	                         });
               				 	var distance = polyline.getLength();
//           			    		page.find("[identity='mileage']").attr("mileage",distance);
     	           			   page.find("[identity='mileage']").text(Math.round(distance/1000));
     	           			  // page.find("[identity='mileage']").text(Math.round(distance));
               			   }
              			     //如果有费用填写时间
              			    if(travelingRecordDetails["fee_datetime"]){
//              			    page.find("[identity='fuelCosts']").attr("readonly","readonly");
//              			    page.find("[identity='parkingFee']").attr("readonly","readonly");
//              			    page.find("[identity='highwayFee']").attr("readonly","readonly");
              			    	
              			    	page.find("[identity='fuelCosts']").css("display","none")
    							page.find("[identity='fuelCostsSpan']").css("display","")
    							
    							page.find("[identity='parkingFee']").css("display","none")
    							page.find("[identity='parkingFeeSpan']").css("display","")
    							
    							page.find("[identity='highwayFee']").css("display","none")
    							page.find("[identity='highwayFeeSpan']").css("display","")
    							
    							 var fuelCosts = travelingRecordDetails["fuel_costs"];
    							if(fuelCosts != null && fuelCosts != ""){
    								if(fuelCosts < 0){
    									fuelCosts = fmoney(Math.abs(fuelCosts),2);
    									fuelCosts = "-"+fuelCosts;
    								}else{
    									fuelCosts = fmoney(fuelCosts,2);
    								}
    							}
    							var parkingFee = travelingRecordDetails["parking_fee"];
    							if(parkingFee != null && parkingFee != ""){
    								if(parkingFee < 0){
    									parkingFee = fmoney(Math.abs(parkingFee),2);
    									parkingFee = "-"+parkingFee;
    								}else{
    									parkingFee = fmoney(parkingFee,2);
    								}
    							}
    							var highwayFee = travelingRecordDetails["highway_fee"];
    							if(highwayFee != null && highwayFee != ""){
    								if(highwayFee < 0){
    									highwayFee = fmoney(Math.abs(highwayFee),2);
    									highwayFee = "-"+highwayFee;
    								}else{
    									highwayFee = fmoney(highwayFee,2);
    								}
    							}
                			    page.find("[identity='fuelCostsSpan']").text(fuelCosts);
    							page.find("[identity='parkingFeeSpan']").text(parkingFee);
    							page.find("[identity='highwayFeeSpan']").text(highwayFee);
    							
                  			    page.find("[identity='remark']").attr("readonly","readonly");
                  			    page.find("[identity='remark']").attr("disabled", "disabled");
                  			    page.find("[identity='remark']").attr('placeholder','');
                  			    page.find("[identity='remark']").val(travelingRecordDetails["remark"]);
                  			    
                 			    page.find(".SaveBtn").hide();
              			    }
              			    else{
              			    	page.find(".SaveBtn").show();
//              			    	page.find("[identity='fuelCosts']").removeAttr("readonly");
//                  			    page.find("[identity='parkingFee']").removeAttr("readonly");
//                  			    page.find("[identity='highwayFee']").removeAttr("readonly");
//                  			    page.find("[identity='remark']").removeAttr("readonly");
              			    	page.find("[identity='fuelCosts']").css("display","")
    							page.find("[identity='fuelCostsSpan']").css("display","none")
    							
    							page.find("[identity='parkingFee']").css("display","")
    							page.find("[identity='parkingFeeSpan']").css("display","none")
    							
    							page.find("[identity='highwayFee']").css("display","")
    							page.find("[identity='highwayFeeSpan']").css("display","none")
    							
    							page.find("[identity='remark']").removeAttr("readonly");
                  			    page.find("[identity='remark']").removeAttr("disabled");
                  			    page.find("[identity='remark']").attr('placeholder','请填写备注');
              			    	
              			    }
              			    
              			    page.find(".checkBtn").attr("collection_record_id",travelingRecordDetails.collection_record_id);
              			     
//              			     travelingRecordDetails["flag"] == 'RETURN_HOME'  RETURN_HOME:表示返程；UN_RETURN_HOME：表示非返程记录 
              			     //businessType
              			     if(businessType == "RETURN" || businessType == "FI" || businessType == "FI_CUSTOM_TASK"){
              			    	 page.find(".checkBtn").hide();
              			     }else{
              			    	 page.find(".checkBtn").show();
              			     }
              				  
        				 }
     					
         				 showHide();
        			  }
        			  else{
        				  showHide();
//        				  showMessage('暂无数据','1500');
        			  }
        			  
        		  }else{
	 	            	showHide();
	 	            	errorHandler(msg.returnCode,msg.message);
	 	            }
        		  
        	  });
        	  
              }
          
          
          //查询是否修改过
          function queryFeeUpdateTime(){
        	  showLoading();
        	  var authData = {};
        	  authData.travelRecordId=session.get("travelRecordId");
        	  authData.uitcode=session.get("uitcode");
        	  authData.random=Math.random();
        	  $.getJSON(basePath+"/app/travelLingDetails/queryFeeModifytimeByID.xhtml"+callback,authData,function(msg){
        		
        		   if($.trim(msg.returnCode) == '0'){
        			  if(msg.data!=null && msg.data!=""){
        				  showHide();
		                  showMessage('您已经编辑过了无法再次编辑','1500');
        			  }else{
        				  showHide();
        				  addTravelingRecordDetailsCost();
        			  }
        		  }else{
        				showHide();
	 	            	errorHandler(msg.returnCode,msg.message);
        		  }
        	  });
          } 
            
            //添加编辑
            function addTravelingRecordDetailsCost(){
               var page = $('#travel_record_details_page');
           	   var authData = {};
           	   authData.travelRecordId=session.get("travelRecordId");
           	   authData.userCode=session.get("userCode");
//           	   authData.mileage=page.find("[identity='mileage']").text();
//           	 authData.mileage=page.find("[identity='mileage']").attr("mileage");
           	
           	   authData.fuelCosts=page.find("input[identity='fuelCosts']").val();
           	   authData.parkingFee=page.find("input[identity='parkingFee']").val();
           	   authData.highwayFee=page.find("input[identity='highwayFee']").val();
           	   authData.remark=page.find("input[identity='remark']").val();//备注  
//           	   authData.departureMileage=page.find("input[identity='departureMileage']").val();
//           	   authData.arrivalMileage=page.find("input[identity='arrivalMileage']").val();
           	   
       	   if((authData.fuelCosts==null||authData.fuelCosts=="")
			   &&(authData.parkingFee==null||authData.parkingFee=="")
			   &&(authData.highwayFee==null||authData.highwayFee=="")
//			   &&(authData.departureMileage==null||authData.departureMileage=="")
//			   &&(authData.arrivalMileage==null||authData.arrivalMileage=="")
			   &&(authData.remark==null||authData.remark=="")){
				 showMessage('没有需要保存的数据！','1500');
				  page.find("input[identity='fuelCosts']").focus();
				  return false;
				  
			   }
           	   
          	  var currentDatetime = new Date().Format("YYYY/MM/DD HH/mm/ss");
          	  authData.currentDatetime = currentDatetime;
          	showConfirm("请确认是否保存", function(){
          		showLoading();
          		 $.getJSON(basePath+"/app/travelLingDetails/addTravelingRecordDetailsCost.xhtml"+callback,authData,function(msg){
             		   if($.trim(msg.returnCode) == '0'){
             			   if(msg.data>0){
  		           			showHide();
//  		           			load_travel_record_details_content();
  			                showMessage('保存成功','2000');
             			   }
             			   
             			   setTimeout(function(){back_page();},2000);
             		   }else{
	      				showHide();
	   	            	errorHandler(msg.returnCode,msg.message);
	      		       }
          		 });
          	});
           	 
            	
            }
            
            