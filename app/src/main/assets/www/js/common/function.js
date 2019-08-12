var os = {};
var c = navigator.userAgent;
os.webkit = c.match(/WebKit\/([\d.]+)/) ? !0 : !1;
os.android = c.match(/(Android)\s+([\d.]+)/) || c.match(/Silk-Accelerated/) ? !0 : !1;
os.androidICS = os.android && c.match(/(Android)\s4/) ? !0 : !1;
os.ipad = c.match(/(iPad).*OS\s([\d_]+)/) ? !0 : !1;
os.iphone = !os.ipad && c.match(/(iPhone\sOS)\s([\d_]+)/) ? !0 : !1;
os.ios = os.ipad || os.iphone;
os.ios6 = os.ios && c.match(/(OS)\s([6])/) ? !0 : !1;

var lastKnownAddress;//最后位置的实际地址

//var userLastLocation = new Array();//用户最后的位置坐标
var userLastLocation = {};//用户最后的位置坐标


        function myCheckbox(id){
			    this.id = id;
			    this.path = "images/common/";
				this.checkYes=function(){
			      $("img[id="+this.id+"]").attr("src",this.path+"checkyes.png");
			    };
			    this.checkNo=function(){
			      $("img[id="+this.id+"]").attr("src",this.path+"checkno.png");
			    };
			    this.title=function(){
				      return $("img[id="+this.id+"]").attr("title");
				};
			    this.val=function(){
				    var src = $("img[id="+this.id+"]").attr("src");
			        if(src.indexOf("checkno.png") >= 0){
			            return false;
			        }else{
			            return true;
			        }
				};
			}
        //added time 2015-06-10 
        function myCheckboxInput(id){
		    this.id = id;
			this.checkYes=function(){
		      $("#"+id).attr("checked","checked");
		    };
		    this.checkNo=function(){
		      $("#"+id).removeAttr("checked");
		    };
		    this.title=function(){
			      return $("#"+id).attr("title");
			};
			this.isChecked=function(){
			      return $("#"+id).is(":checked");
			};
		    this.val=function(){
		    	return $("#"+id).val();
			};
		}
            
            function local(){
            	this.storage = null;
				this.get=function(key){
	            	if(window.localStorage){
	            		this.storage = window.localStorage;
	            		var value = this.storage.getItem(key);
	            		if(value == 'undefined'){
	            		   value = '';
	            		}
	            		return value;
	            	}else{
	            		alert('不支持本地存储!');
	            		return '';
	            	}
				};
				this.set=function(key,value){
	            	if(window.localStorage){
	            		this.storage = window.localStorage;
	            		this.storage.setItem(key,value);
	            	}else{
	            		alert('不支持本地存储!');
	            	}
				};
				this.remove=function(key){
	            	if(window.localStorage){
	            		this.storage = window.localStorage;
	            		this.storage.removeItem(key);
	            	}else{
	            		alert('不支持本地存储!');
	            	}
				};
				this.clear=function(){
	            	if(window.localStorage){
	            		this.storage = window.localStorage;
	            		this.storage.clear();
	            	}else{
	            		alert('不支持本地存储!');
	            	}
				};
				this.key=function(num){
	            	if(window.localStorage){
	            		this.storage = window.localStorage;
	            		var value = this.storage.key(num);
	            		if(value == 'undefined'){
	            		   value = '';
	            		}
	            		return value;
	            	}else{
	            		alert('不支持本地存储!');
	            		return '';
	            	}
				};
				this.length=function(){
	            	if(window.localStorage){
	            		this.storage = window.localStorage;
	            		var value = this.storage.length;
	            		if(value == 'undefined'){
	            		   value = 0;
	            		}
	            		return value;
	            	}else{
	            		alert('不支持本地存储!');
	            		return 0;
	            	}
				};
            }
            
            function session(){
            	this.storage = null;
				this.get=function(key){
	            	if(window.sessionStorage){
	            		this.storage = window.sessionStorage;
	            		var value = this.storage.getItem(key);
	            		if(value == 'undefined'){
	            		   value = '';
	            		}
	            		return value;
	            	}else{
	            		alert('不支持本地存储!');
	            		return '';
	            	}
				};
				this.set=function(key,value){
	            	if(window.sessionStorage){
	            		this.storage = window.sessionStorage;
	            		this.storage.setItem(key,value);
	            	}else{
	            		alert('不支持本地存储!');
	            	}
				};
				this.remove=function(key){
	            	if(window.sessionStorage){
	            		this.storage = window.sessionStorage;
	            		this.storage.removeItem(key);
	            	}else{
	            		alert('不支持本地存储!');
	            	}
				};
				this.clear=function(){
	            	if(window.sessionStorage){
	            		this.storage = window.sessionStorage;
	            		this.storage.clear();
	            	}else{
	            		alert('不支持本地存储!');
	            	}
				};
				this.key=function(num){
	            	if(window.sessionStorage){
	            		this.storage = window.sessionStorage;
	            		var value = this.storage.key(num);
	            		if(value == 'undefined'){
	            		   value = '';
	            		}
	            		return value;
	            	}else{
	            		alert('不支持本地存储!');
	            		return '';
	            	}
				};
				this.length=function(){
	            	if(window.sessionStorage){
	            		this.storage = window.sessionStorage;
	            		var value = this.storage.length;
	            		if(value == 'undefined'){
	            		   value = 0;
	            		}
	            		return value;
	            	}else{
	            		alert('不支持本地存储!');
	            		return 0;
	            	}
				};
            }
            
//		    $("img[name=mycheckbox]").live("tap",function(){
//				   var checkBox = new myCheckbox($(this).attr("id"));				   
//				   if(checkBox.val()){
//				     checkBox.checkNo();
//				   }else{
//				     checkBox.checkYes();
//				   }
//			   });


////////////////////

//取地址栏参数
function getQueryString(name) {
	var regex = new RegExp("[?&]" + name + "=([^&#]*)(&|$)");
	var results = regex.exec(window.location.search);
	return results == null ? "" : decodeURIComponent(results[1]);
}

//手机标识 for ios
//var imei = getQueryString("imei");
var imei = "";
function setiosImei(parimei) {
    imei = parimei;
}

//手机标识
function getIMEI() {
	if (os.android) {
		return window.call.getIMEI();
	} else if(os.ios) {
		return imei;
	} else {
		return navigator.appCodeName;
	}
}

//系统标识
function getPlatformCode() {
	if (os.android) {
		return "1";
	} else if(os.ios) {
		return "2";
	} else {
		return "";
	}
}

//文件下载
function startDownload(url) {
	if (os.android) {
		window.call.startDownload(url);
	} else if(os.ios) {
		window.location.href = "download:" + url;
	} else {
		window.location.href = url;
	}
}

//打开邮件客户端
function openMail(mailAddress) {
	if (os.android) {
		window.call.openMail(mailAddress);
	} else if(os.ios) {
		window.location.href = "openmail:" + mailAddress;
	}
}

//绑定消息推送别名
function setJPushAlias(userAccount) {
	if (os.android || os.androidICS) {
		window.call.setJPushAlias(userAccount);
	} else if (os.ios || os.ios6) {
		//
	}
}

//清除原生部分缓存
function clearCache() {
	if (os.android) {
		window.call.clearCache();
	} else if (os.ios) {
        window.location.href = "clearCache";
	}
}

//版本更新
function updateVersion(url) {
	if (os.android) {
		appurl = contextPath + url;
		window.call.updateVersion(appurl);
	} else if (os.ios) {
		var cmd = "versionUpdate";
		var param1 = url;
		window.location.href="objc:///"+cmd+"~/"+param1;
	}
}

//拼装文件下载地址
function getFullDownloadPath(server, path) {
	var url = "http://" + server + "/" + path;
	var pos = url.lastIndexOf("/");
	return url.substring(0, pos) + "/" + encodeURIComponent(url.substring(pos+1));
}

////////////////////
//以下丰田新增

//--------------------
//以下原生自用
//--------------------

//网络连通状态
var networkConnected;
function iosSetNetworkConnected(state) {
	networkConnected = state;
}
//位置服务状态
var locationServiceRunning;
function iosSetLocationServiceRunning(state) {
	locationServiceRunning = state;
}
//当前位置(ios/android都调用此函数)
var lastKnownLocation;
function setLastKnownLoaction(time, latitude, longitude, speed, bearing) {
	var loc = {};
	loc.time = time;
	loc.latitude = latitude;
	loc.longitude = longitude;
	loc.speed = speed;
	loc.bearing = bearing;
	lastKnownLocation = loc;
}
//手势密码设定状态
var gestureLockSet;
function iosSetGestureLockSet(state) {
	gestureLockSet = state;
}

//GPS服务设定状态
var gpsServiceRunning;
function iosSetGpsServiceRunning(state) {
    gpsServiceRunning = state;
}

//--------------------
//以下 H5->原生 接口
//--------------------

//检测网络是否连通
function isNetworkConnected() {
	return true;//禁用离线功能
	if (os.android) {
		return window.call.isNetworkConnected();
	} else if (os.ios) {
        return networkConnected;
	}
}

//检测网络是否连通
function isNetworkConnected1() {
	if (os.android) {
		return window.call.isNetworkConnected();
	} else if (os.ios) {
        return networkConnected;
	}
}

//获取GPS服务状态
function isGpsServiceRunning() {
	if (os.android) {
		return window.call.isGpsServiceRunning();
	} else if (os.ios) {
        return gpsServiceRunning;
	}
}

//发送短信(签入)
function sendSMS(phoneNumber, message) {
	if (os.android) {
		window.call.sendSMS(phoneNumber, message);
	} else if (os.ios) {
        window.location.href = "sendsms:" + phoneNumber + "~/" + message;
	}
}

//未签入获取定位信息
function onLocationBegin(){
    if (os.android) {
        window.call.onLocationBegin();
    } else if (os.ios) {
        window.location.href = "onlocationbegin:"
    }
}

//发送短信(未签入)
function sendMessage(phoneNumber, message) {
    if (os.android) {
        window.call.sendSMS(phoneNumber, message);
    } else if (os.ios) {
        window.location.href = "sendmessage:" + phoneNumber + "~/" + message;
    }
}

//拨打电话
function callPhone(phoneNumber){
    if (os.android) {
        window.call.callPhone(phoneNumber);
    } else if (os.ios) {
        window.location.href = "callphone:" + phoneNumber;
    }
}

////原生获取位置信息
//var newLatitude;
//var newLongitude;
//var newAddress;
//function onLocationDone(myLatitude, myLongitude, myAddress){
//    newLatitude = myLatitude;
//    newLongitude = myLongitude;
//    newAddress = myAddress;
//}

//原生获取位置信息
var newLatitude;
var newLongitude;
var newAddress;
var newSpeed;
function onLocationDone(myLatitude, myLongitude, myAddress,mySpeed){
    newLatitude = myLatitude;
    newLongitude = myLongitude;
    newAddress = myAddress;
    newSpeed = mySpeed;
    
}

//发送邮件
function sendMail(smtp, port, account, password, from, to, subject, body) {
	if (os.android) {
		window.call.sendMail(smtp, port, account, password, from, to, subject, body);
	} else if (os.ios) {
        window.location.href = "sendmail:" + smtp + "~/" + port + "~/" + account + "~/" + password + "~/" + from + "~/" + to + "~/" + subject + "~/" + body;
	}
}

//初始化设定位置服务参数
//最小变化距离(int米)、最小间隔时间(int秒)、低速间隔时间(int秒)、高速间隔时间(int秒)、速度阈值(float米/秒)
//请在startLocationService之前呼叫，推荐在诸如登录成功等时机呼叫
//注意：受ios限制，不可在呼叫本函数之后立即呼叫startLocationService
function initLocationService(minDistance, minInterval, lowSpeedInterval, highSpeedInterval, speedThreshold) {
	if (os.android) {
		window.call.initLocationService(minDistance, minInterval, lowSpeedInterval, highSpeedInterval, speedThreshold);
	} else if (os.ios) {
		window.location.href = "initlocationservice:" + minDistance + "~/" + minInterval + "~/" + lowSpeedInterval + "~/" + highSpeedInterval + "~/" + speedThreshold;
	}
}

//开启位置采集服务
//extra 附加信息，string型，会保持原状上传到服务端，可保存用户自定义数据
//开启服务后，位置采集的结果通过onLocationChanged回调
function startLocationService(userid, extra) {
	if (os.android) {
		window.call.startLocationService(userid, extra);
	} else if (os.ios) {
		window.location.href = "startlocationservice:" + userid + "~/" + extra;
	}
}

//停止位置采集服务
function stopLocationService() {
	if (os.android) {
    	window.call.stopLocationService();
    } else if (os.ios) {
        window.location.href = "stoplocationservice";
    }
}

//检测位置采集服务是否在运行中
function isLocationServiceRunning() {
	if (os.android) {
    	return window.call.isLocationServiceRunning();
    } else if (os.ios) {
        return locationServiceRunning;
    }
}

//获取当前位置
//仅在签入状态下有效
function getLastKnownLoaction() {
	return lastKnownLocation;
}

//获取第一条本地缓存(未上传)的位置信息数据
//获取结果通过onLocationHistoryFetched事件回调
function fetchFirstLocationHistory() {
	if (os.android) {
    	window.call.fetchFirstLocationHistory();
    } else if (os.ios) {
        window.location.href = "fetchfirstlocationhistory";
    }
}

//获取最后一条本地缓存(未上传)的位置信息数据
//获取结果通过onLocationHistoryFetched事件回调
function fetchLastLocationHistory() {
	if (os.android) {
    	window.call.fetchLastLocationHistory();
    } else if (os.ios) {
        window.location.href = "fetchlastlocationhistory";
    }
}

//删除一条本地缓存的位置信息数据(上传成功后呼叫)
function deleteLocationHistory(id) {
	if (os.android) {
    	window.call.deleteLocationHistory(id);
    } else if (os.ios) {
        window.location.href = "deletelocationhistory:" + id;
    }
}

//开始上传(离线时采集的)本地缓存的历史位置信息数据
//请在诸如登录成功、网络状态变更等时机呼叫
function startUploadLocationHistory() {
	if (isNetworkConnected()) {
		fetchFirstLocationHistory();
	}
}

//手势密码登录
//如果成功则回调onGestureLockLogin
function startGestureLockLogin() {
	if (os.android) {
    	window.call.startGestureLockLogin();
    } else if (os.ios) {
        window.location.href = "startgesturelocklogin";
    }
}

//手势密码设定
function startGestureLockSet(userid) {
	if (os.android) {
    	window.call.startGestureLockSet(userid);
    } else if (os.ios) {
        window.location.href = "startgesturelockset:" + userid;
    }
}

//清除手势密码
function clearGestureLockSet() {
	if (os.android) {
    	window.call.clearGestureLockSet();
    } else if (os.ios) {
        window.location.href = "cleargesturelockset";
    }
}

//检测手势密码是否已设定
function isGestureLockSet() {
	if (os.android) {
    	return window.call.isGestureLockSet();
    } else if (os.ios) {
        return gestureLockSet;
    }
}

//手势密码返回状态(新增方法)

function gestureState(state){}

//本地缓存写入
//key string型
//value string型
function nativeStorageSave(key, value) {
	if (os.android) {
		window.call.nativeStorageSave(key, value);
	} else if(os.ios) {
		window.location.href = "nativestoragesave:" + key + "~/" + value;
	}
}

//本地缓存读取
//读取结果在回调函数onNativeStorageLoaded中获取
//key不存在时返回空字符串("")
//extra string型，会在onNativeStorageLoaded中按原样返回，可用于区分是哪一次呼叫的回调
function nativeStorageLoad(key, extra) {
	if (os.android) {
		var val = window.call.nativeStorageLoad(key);
		onNativeStorageLoaded(key, val, extra)
	} else if(os.ios) {
		window.location.href = "nativestorageload:" + key + "~/" + extra;
	}
}

//本地缓存清空
function nativeStorageClear() {
	if (os.android) {
    	window.call.nativeStorageClear();
    } else if(os.ios) {
    	window.location.href = "nativestorageclear";
    }
}

//本地缓存(上行数据)新增一条
//data: json object，数据（调用func时传递的参数）
//func: string型，缓存读取时要调用的函数名(文字)
function addNativeStorageWithFunc(data, func) {
	var sdata = JSON.stringify(data);
	if (os.android) {
    	window.call.addNativeStorageWithFunc(sdata, func);
    } else if(os.ios) {
    	window.location.href = "addnativestoragewithfunc:" + sdata + "~/" + func;
    }
}

//本地缓存(上行数据)读取第一条
//读取结果在回调函数onNativeStorageWithFuncFetched中获取
function fetchFirstNativeStorageWithFunc() {
	if (os.android) {
    	window.call.fetchFirstNativeStorageWithFunc();
    } else if(os.ios) {
    	window.location.href = "fetchfirstnativestoragewithfunc";
    }
}

//本地缓存(上行数据)删除某一条
function deleteNativeStorageWithFunc(id) {
	if (os.android) {
    	window.call.deleteNativeStorageWithFunc(id);
    } else if(os.ios) {
    	window.location.href = "deletenativestoragewithfunc:" + id;
    }
}

//本地缓存(上行数据)开始逐条提交
function startExecuteNativeStorageWithFunc() {
	fetchFirstNativeStorageWithFunc();
}

//强制退出应用
function quitApp() {
	if (os.android) {
    	window.call.quitApp();
    } else if (os.ios) {
    	window.location.href = "quitapp";
    }
}

//设定系统显示语言(原生部分)
function setSysConfigLang(lang) {
	if (os.android) {
		window.call.setSysConfigLang(lang);
	} else if (os.ios) {
		window.location.href = "setsysconfiglang:" + lang;
	}
}

//启动相机
//quality 压缩比，默认0.7
function startCamera(quality,sendPhotoType) {
	if (os.android) {
		window.call.startCamera(quality,sendPhotoType);
	} else if (os.ios) {
		window.location.href = "startcamera:" + quality + "~/" + sendPhotoType;
	}
}

//启动相册
function ImagePicker(callbackMethodName,selectableCount) {
	if (os.android) {
		window.call.imagepicker(callbackMethodName,selectableCount);
	} else if (os.ios) {
		window.location.href = "imagepicker:" + callbackMethodName+ "~/" + selectableCount;
	}
}

//查看催收照片  seecollectionphoto
function seecollectionphoto(image){
    if(os.android){
        window.call.seecollectionphoto(image);
    }else if (os.ios){
        window.location.href = "seecollectionphoto:" + image;
    }
}

//图片手势放大
function gesturePicture(image){
    if(os.android){
        window.call.gesturePicture(image);
    }else if (os.ios){
       window.location.href = "gesturepicture:" + image;
    }
}

//图片手势放大(拍照)
function sendPictures(picture, index){
    if(os.android){
        window.call.sendPictures(picture, index);
    }else if (os.ios){
        window.location.href = "sendpictures:" + picture + "~/" + index;
    }
}

//清空图片数组
function removeImageObject(){
    if(os.android){
        window.call.removeImageObject();
    }else if (os.ios){
        window.location.href = "removeimageobject:"
    }
}

//图片浏览(数据)
function sendImages(images){
    if(os.android){
        window.call.sendImages(images);
    }else if (os.ios){
        window.location.href = "sendimages:" + images;
    }
}

//移除imageView
function removeImageView(){
    if(os.android){
        window.call.removeImageView();
    }else if (os.ios){
        window.location.href = "removeimageview:"
    }
}

//唤起导航
function callNavi(dest) {
	if (os.android) {
		window.call.callNavi(dest);
	} else if (os.ios) {
		window.location.href = "callnavi:" + dest;
	}
}

//--------------------
//以下 原生->H5 回调
//--------------------

//网络状态变更事件
function onNetworkStateChanged(state) {
	if (state == true) {
		//开始上传(离线时采集的)本地缓存的历史位置信息数据
		startUploadLocationHistory();
	}
	//TODO:业务开发可添加其他处理
	//
}

//位置变化事件
function onLocationChanged(id, userid, time, latitude, longitude, speed, bearing, extra) {
	//TODO:请业务开发实现,以下处理仅供参考
	//TODO:调试信息待删除
//	if (out) out(id +'<br>'+ time + '<br>'+ latitude + '<br>'+ longitude + '<br>'+ speed + '<br>'+ bearing);
	//用户最后位置坐标
	if(longitude != null && longitude != 0 && latitude != null && latitude != 0){
		userLastLocation.longitude= longitude; //经度
		userLastLocation.latitude = latitude;  //纬度
	}
	
	//网络连通状态下立即上传位置信息数据
	if (isNetworkConnected()) {
		
		if(longitude != null && longitude != 0 && latitude != null && latitude != 0 && speed > -1){
			var authData = {};
			authData.userid = userid;
			authData.time = time;
			authData.latitude = latitude;
			authData.longitude = longitude;
			authData.speed = speed;
			authData.bearing = bearing;
			authData.extra = extra;
			authData.random = Math.random();
			$.getJSON(contextPath+"/workbench/collectLocation.xhtml"+callback, authData, function(msg) {
				if($.trim(msg.returnCode) == '0') {
					//上传成功后删除本地缓存
					lastKnownAddress = msg.data;
					deleteLocationHistory(id);
				}
			});
		} else {
			deleteLocationHistory(id);
		}
		

	}
}

//本地缓存的位置信息数据的回调
function onLocationHistoryFetched(id, userid, time, latitude, longitude, speed, bearing, extra) {
	//TODO:请业务开发实现,以下处理仅供参考
	if (isNetworkConnected()) {
		var authData = {};
		authData.userid = userid;
		authData.time = time;
		authData.latitude = latitude;
		authData.longitude = longitude;
		authData.speed = speed;
		authData.bearing = bearing;
		authData.extra = extra;
		authData.random = Math.random();
		$.getJSON(contextPath+"/workbench/collectLocation.xhtml"+callback, authData, function(msg) {
			if($.trim(msg.returnCode) == '0') {
				//上传成功后删除本地缓存
				deleteLocationHistory(id);
				//计划查询(未上传的)本地缓存数据
				setTimeout(fetchFirstLocationHistory, 500);
			}
		});
	}
}

//通过手势密码登录成功事件
function onGestureLockLogin(userid) {
	loginFromLocal(userid);
}

//定义缓存使用的key类

//function NativeStorageKey(userId, func, itemKey,direction) {
//    this.userId = userId;
//    this.func = func;
//    this.itemKey = itemKey;
//    this.direction = direction;
//}



//本地缓存读取结果回调
function onNativeStorageLoaded(key, value, extra) {

	onNativeStorageLoadedHandler(key,value,extra);

}

//本地缓存(上行数据)读取的回调
function onNativeStorageWithFuncFetched(id, data, func) {
	//以下处理仅供参考
	var odata = JSON.parse(data);
	var ofunc = eval(func);
	ofunc(odata);
	deleteNativeStorageWithFunc(id);
	setTimeout(fetchFirstNativeStorageWithFunc, 500);
}

//相机拍照的回调
function onCameraDone(src,callBack) {
	eval(callBack)(src);
}

//扫描二维码	sweepCode:1.条码 2.二维码
function scan_QR_code(sweepCode,callbackMethodName){
	if(os.android){
        window.call.scan_QR_code(sweepCode,callbackMethodName);
    }else if (os.ios){
        window.location.href = "scan_QR_code:" + sweepCode+ "~/" + callbackMethodName;
    }

}

//扫描条形码	sweepCode:1.条码 2.二维码
function Scanning_Barcode(sweepCode,callbackMethodName){
	if(os.android){
        window.call.Scanning_Barcode(sweepCode,callbackMethodName);
    }else if (os.ios){
        window.location.href = "Scanning_Barcode:" + sweepCode+ "~/" + callbackMethodName;
    }
}

//扫码回调
function onScanCodeFinish(photo,src){
	eval(photo)(src);
}
