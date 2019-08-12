/***************************
 * userId:当前登录用户的userId
 * fun:功能名称，字符串类型即可
 * opration:操作名称，取值：ConstDef.getConstant('XXXX')，其中XXXX取值如下
			NATIVE_STORAGE_ADD: "ADD", //新增
			NATIVE_STORAGE_REMOVE : "REMOVE", //删除
			NATIVE_STORAGE_MODIFY : "MODIFY", //修改
			NATIVE_STORAGE_QUERY :"QUERY",//查询
 * keyExtra:存储额外信息
 * callback:加载数据后调用的回调函数
 * newData:更改后的数据，如果不需要，传递{}即可
 */
function loadNativeStorage(userId,fun,method,keyExtra,opration,callback,newDataKey,newData,extension){
	//更改在催地址状态 更改为进行中,并重新从缓存加载在催地址列表
	var key = {};
	key.userId = userId;
	key.fun = fun;
	key.method = method;
	key.extra = keyExtra;
	key.direction = ConstDef.getConstant('SYNC_DIRECTION_DOWNLOAD');
	
	var extra={};
	extra.operation =opration;//ConstDef.getConstant("NATIVE_STORAGE_MODIFY");
	extra.newDataKey = newDataKey;
	extra.callback = callback;//load_collecting_address_list_content_from_native_storage;
	extra.newData = newData||{};
	extra.extension = extension||{};
	nativeStorageLoad(JSON.stringify(key),JSON.stringify(extra));
}
/**
 * 将下载数据存入缓存
 * @param userId
 * @param fun
 * @param method
 * @param keyExtra
 * @param msg
 * @param srcKey 数据的主键名称
 */
function saveDownloadDataToNativeStorage(userId, fun, method,keyExtra, msg,srcKey){
	//构造key:userId,fun,method,extra,direction,每个key必须由这几个部分组成
	var key = {};
	key.userId = userId;
	key.fun = fun;
	key.method = method;
	key.extra = keyExtra;
	key.direction = ConstDef.getConstant('SYNC_DIRECTION_DOWNLOAD');
	
	//构造value:value必须的属性data,data是一个数组，数组中的每个元素都有一个主键dataKey
	//如果传入的msg.data属性不是一个数组，请先构造成数组后再传入
	var value = {};//value等同于msg,是msg的升级版
	value.data = [];//存放msg.data,其中每一项多一个属性字段dataKey，代表每条数据的主键
	$.each(msg.data,function(i,n){
		var item = {};
		item.dataKey = n[srcKey];
		for (property in n) {
			item[property] = n[property];
		}
		value.data.push(item);
	});
	value.checkCode = msg.checkCode;//当前是否正在返程途中
	nativeStorageSave(JSON.stringify(key), JSON.stringify(value));
} 
function saveDownloadRawDataToNativeStorage(userId, fun, method,keyExtra, msg){
	//构造key:userId,fun,method,extra,direction,每个key必须由这几个部分组成
	var key = {};
	key.userId = userId;
	key.fun = fun;
	key.method = method;
	key.extra = keyExtra;
	key.direction = ConstDef.getConstant('SYNC_DIRECTION_DOWNLOAD');

	nativeStorageSave(JSON.stringify(key), JSON.stringify(msg));
} 
/**
 * 将需上行的数据存入缓存
 * @param userId
 * @param fun
 * @param method
 * @param action
 * @param data
 */
function saveUploadDataToNativeStorage(userId, fun, method, action, data){
	var key = {};
	key.userId = userId;
	key.fun = fun;
	key.method = method;
    key.executeDatetime = new Date();
	key.direction = ConstDef.getConstant('SYNC_DIRECTION_UPLOAD');
	
	var value = {};
	value.action = action;
	value.data = data;
	
	nativeStorageSave(JSON.stringify(key), JSON.stringify(value));
} 

/**
 * 本地缓存读取结果回调
 * @param key 
 * @param value
 * @param extra
 */
function onNativeStorageLoadedHandler(key,value,extra){
	
	if(value){
		onNativeStorageDataLoadedHandler(key,value,extra);
	}
	else{
		onNativeStorageDataNotLoadedHandler(key,value,extra);
	}
}

/**
 * 本地缓存读取结果回调--当读到数据时
 * @param key 
 * @param value
 * @param extra
 */
function onNativeStorageDataLoadedHandler(key,value,extra){

	var keyObj = JSON.parse(decodeURI(key));
	var valueObj = JSON.parse(value);
	var extraObj = JSON.parse(extra);
   
	switch(extraObj.operation)
	{
		case ConstDef.getConstant("NATIVE_STORAGE_ADD"):
			
			//修改缓存数据  --往在催地址列表中新增一条 返程地址
			var newDataObj = extraObj.newData;
			var dataKey = extraObj.newDataKey;//要修改数据的主键
			
//			$.each(valueObj.data,function(i,n){
//				//找到需要修改的数据并修改
//				if(n.dataKey == dataKey){
//					for (property in newDataObj)  
//					  {
//						if(newDataObj[property]){
//							n[property] = newDataObj[property];
//						}
//					  }
//				}
//			});
			valueObj.checkCode = 1;
			valueObj.data.push(newDataObj);
			
			//保存修改
			nativeStorageSave(key, JSON.stringify(valueObj));
			//重新加载缓存的数据
			eval(extraObj.callback)(JSON.stringify(valueObj));
		  break;
		case ConstDef.getConstant("NATIVE_STORAGE_REMOVE"):
			//删除数据
			var newDataObj = extraObj.newData;
			var dataKey = extraObj.newDataKey;//要删除数据的主键
//			alert(dataKey);
			$.each(valueObj.data,function(i,n){
				
//				alert(n.dataKey);
				
				//找到需要修改的数据并删除
				if(n.dataKey == dataKey){
					valueObj.data.splice(i,1);
				}
			});
			//保存修改
			nativeStorageSave(key, JSON.stringify(valueObj));
			//重新加载缓存的数据
			eval(extraObj.callback)(JSON.stringify(valueObj));
		  break;
		case ConstDef.getConstant("NATIVE_STORAGE_MODIFY"):
			//修改缓存数据
			var newDataObj = extraObj.newData;
			var dataKey = extraObj.newDataKey;//要修改数据的主键
			
			if(extraObj.extension.checkCode != null ||extraObj.extension.checkCode != undefined){
                valueObj.checkCode = extraObj.extension.checkCode;
            }
            
			$.each(valueObj.data,function(i,n){
				//找到需要修改的数据并修改
				if(n.dataKey == dataKey){
					for (property in newDataObj)  
					  {
						if(newDataObj[property]){
							n[property] = newDataObj[property];
						}
					  }
				}
			});
			
			//保存修改
			nativeStorageSave(key, JSON.stringify(valueObj));
			//重新加载缓存的数据
			eval(extraObj.callback)(JSON.stringify(valueObj));
            break;
        case ConstDef.getConstant("NATIVE_STORAGE_QUERY"):
//        	alert(key);
        	//调用回调函数，查询本地数据
           	eval(extraObj.callback)(value);
            break;
        
		default:
			alert("tt");

	}
}

/**
 * 本地缓存读取结果回调--当读不到数据时
 * @param key 
 * @param value
 * @param extra
 */
function onNativeStorageDataNotLoadedHandler(key,value,extra){

	var keyObj = JSON.parse(decodeURI(key));
//	var valueObj = JSON.parse(value);
	var extraObj = JSON.parse(extra);
   
	switch(extraObj.operation)
	{
		case ConstDef.getConstant("NATIVE_STORAGE_ADD"):
			
		  break;
		case ConstDef.getConstant("NATIVE_STORAGE_REMOVE"):
			//删除数据
			
		  break;
		case ConstDef.getConstant("NATIVE_STORAGE_MODIFY"):
			//修改缓存数据
			
            break;
        case ConstDef.getConstant("NATIVE_STORAGE_QUERY"):
        	//调用回调函数，查询本地数据
           	eval(extraObj.callback)(value);
            break;
        
		default:
			alert("onNativeStorageDataNotLoadedHandler");

	}
}