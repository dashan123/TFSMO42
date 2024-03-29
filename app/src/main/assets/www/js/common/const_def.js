//js端常量的定义  by LIU SHENG

var ConstDef = (function() { 

		var constants = {
			//定义了两个常量
			TEAM_ALL_CODE: 'zTOTAL',
			SYNC_DIRECTION_DOWNLOAD:'DOWNLOAD',
			SYNC_DIRECTION_UPLOAD:'UPLOAD',
			
			//字典类别编码：与服务端相同
			RETURN_HOME_STATUS_CATEGORY_CODE: "RETURN_HOME_STATUS",
			COLLECT_OBJECT_CATEGORY_CODE : "COLLECT_OBJECT",
			TEAM_CATEGORY_CODE : "TEAM",
			CATEGORY_CODE_CASE_QUERY_TYPE : "CASE_QUERY_TYPE",
			CATEGORY_CODE_CASE_MESSAGE_FORMAT : "MESSAGE_FORMAT_DEFINE",
			CATEGORY_CODE_CASE_APP_MODULE_CATEGORY : "APP_MODULE_CATEGORY",
			CATEGORY_CODE_CASE_CITY_CATEGORY : "CITY_CATEGORY",
			CATEGORY_CODE_CASE_POSITION_CATEGORY : "POSITION_CATEGORY",
			CATEGORY_CODE_FIELD_COLLECT_ACTION_CODE : "FIELD_COLLECT_ACTION_CODE",//实地催收行动代码
			CATEGORY_CODE_TELEPHONE_COLLECT_ACTION_CODE : "TELEPHONE_COLLECT_ACTION_CODE",//实地电话催收行动代码
			CATEGORY_CODE_CONTACT_METHOD : "CONTRACT_METHOD",//实地催收 --联系方式
			
			//人员类别
			CATEGORY_PERSONNEL_TOTAL:"PERSONNEL_TOTAL",  //所有人员
			CATEGORY_PERSONNEL_WORKING:"PERSONNEL_WORKING",  //工作中人员
			CATEGORY_PERSONNEL_COLLECTING:"PERSONNEL_COLLECTING",  //实地中人员
			CATEGORY_PERSONNEL_UNCHECKIN:"PERSONNEL_UNCHECKIN",  //未签入人员
			CATEGORY_PERSONNEL_UNCOLLECT:"PERSONNEL_UNCOLLECT",  //未实地人员
			
			//行动状态类别编码
			NON_CATEGORY_CODE_ACTION_STATUS : "ACTION_STATUS",//实地催收 --行动状态
			
			
			//用户在线状态
			ONLINE_STATUS_OFFLINE: 0, //离线
			ONLINE_STATUS_ONLINE : 1, //在线
			ONLINE_STATUS_SIGNIN : 2, //签入
			
			//对本地缓存内容的操作
			NATIVE_STORAGE_ADD: "ADD", //新增
			NATIVE_STORAGE_REMOVE : "REMOVE", //删除
			NATIVE_STORAGE_MODIFY : "MODIFY", //修改
			NATIVE_STORAGE_QUERY :"QUERY",//查询
			
			//在催地址催收状态
			COLLECTING_STATUS_NORMAL : 0, //未进行中
			COLLECTING_STATUS_STARTED : 1, //已开始（进行中）
			
			//催收案件分类
			CASE_CATEGORY_TODO : "FIEC",//主办-代催
			CASE_CATEGORY_ASSIST : "FIEC_ASSIST",//协办
			CASE_CATEGORY_AGENT : "AGENT",//代办
			
			/** 成功 */
			RESULT_SUCESS :"0",
			/** 失败  */
			RESULT_FAILURE :"1",
			/** 跑批  */
			RESULT_BATCH:"2",
			
			//外包公司 工作台默认图片
			WORKBENCH_OUTSOURCE_DEFAULT_PICTUREPATH : "images/tfsred/outsource_workbench_banner.jpg",  //工作台默认图片路径
			WORKBENCH_OUTSOURCE_DEFAULT_PICTURETITLE :"",    //工作台默认图片标题
			
			//[common_travel_record]表中[address_type]字段值
			//COLLECTION:表示催收行车记录;HOMEVISITS:家访行车记录；INVENTORY:盘库行车记录；RETURNHOME:返程行车记录；
			ADDRESS_TYPE_COLLECTION : "COLLECTION",
			ADDRESS_TYPE_HOMEVISITS : "HOMEVISITS",
			ADDRESS_TYPE_INVENTORY : "INVENTORY",
			ADDRESS_TYPE_RETURNHOME : "RETURNHOME",
			
			//[Admin_Users]表中[User_Flag]
			USERFLAG_COMPANY : 0,       //该人员属于本公司
			USERFLAG_OUTSOURCE_COMPANY : 1,  //该人员属于外包公司
			
			//车辆盘库报告audit_check_report表是否抽查钥匙 (0：不抽查  1.抽查)
			KEY_SELECTIVE_FLAG_NOCHECK : 0, //不抽查
			KEY_SELECTIVE_FLAG_CHECK : 1,  //抽查
			
			//业务类别
			BUSINESS_CATEGORY_FI : "FI",
			BUSINESS_CATEGORY_AUDIT : "AUDIT",
			BUSINESS_CATEGORY_SALE : "SALE",
			
			//盘点清单--ak:acknowledge op:open
			AUDIT_CHECK_LIST_ACKNOWLEDGE : "AK",
			
			//盘库人员可以开始盘库时距离库房的距离限制（1000m）
//			AUDIT_USER_STOREHOUSE_DISTANCE : 1000,
			//循环查询盘库人员盘库时距离库房的距离限制的间隔时间（60000ms）
//			AUDIT_USER_STOREHOUSE_DISTANCE_INTERVAL : 60000,
			
			//盘点报告  合格证状态
			AUDIT_REPORT_EDIT_NONE : "00001",
			AUDIT_REPORT_EDIT_TFL : "00005",
			AUDIT_REPORT_EDIT_YINYAN : "00006",
			AUDIT_REPORT_EDIT_CAIB : "00007",
			AUDIT_REPORT_EDIT_ChangJiu : "00008",
			
			//地址类型
			NEW_ADD_ADDRESS :"新添加地址",
			
			COLLECTION_RECORD_STATUS_UN_SAVE : 0, //未手动保存催记
			COLLECTION_RECORD_STATUS_SAVED : 1, //催记已手动保存
			COLLECTION_RECORD_STATUS_SUBMITED : 2, //催记已手动提交
			
			//字典数据来源
			DICTIONARY_DATA_SOURCE_FROM_DICTIONARY_TABLE :"Admin_Dictionary",
			DICTIONARY_DATA_SOURCE_FROM_NON_DICTIONARY_TABLE :"NON_DICTIONARY_TABLE",
			//轨迹采点总数
			TRACK_TOTAL_POINT : 300,//
			
			//销售 日程类型：  拜访经销商SALE_DRM_VISIT_DEALER
			DICTIONARY_CODE_SALE_OFFICE_WORK:"SALE_OFFICE_WORK",//内勤
			DICTIONARY_CODE_SALE_ON_THE_WAY:"SALE_ON_THE_WAY",//在途
			DICTIONARY_CODE_SALE_NONE_VISIT_DLR_MANAGE:"SALE_NONE_VISIT_DLR_MANAGE",//非拜访类DLR管理
			DICTIONARY_CODE_SALE_DRM_VISIT_DEALER:"SALE_DRM_VISIT_DEALER",//拜访经销商
			DICTIONARY_CODE_SALE_DRM_VACATION:"SALE_DRM_VACATION",//休假
			
			//诉讼字典类别编码
			DICTIONARY_CODE_LITIGATION_RECORD_EVENTNAME : "LITIGATION_RECORD_EVENTNAME",//诉讼代码
			
			UNKO: -100
		}
		
		var handler={};
		// 定义了一个静态方法
		handler.getConstant=function(name){//获取常量的方法
			return constants[name];
		}
		return handler
})();
