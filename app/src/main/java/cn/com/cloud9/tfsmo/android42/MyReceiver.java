package cn.com.cloud9.tfsmo.android42;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import cn.jpush.android.api.JPushInterface;

/**
 * 自定义接收器
 *
 * 如果不定义这个 Receiver，则：
 * 1) 默认用户会打开主界面
 * 2) 接收不到自定义消息
 */


public class MyReceiver extends BroadcastReceiver {
	private static final String TAG = "MyReceiver";
	private static String todoStr="未赋值";
	private static boolean timed=false;
	static String endtimeStr="";
	static List<String> idlist = new ArrayList<String>();
	static List<String> timelist = new ArrayList<String>();

	private String content;
	private String time;
	private String title;

	@Override
	public void onReceive(Context context, Intent intent) {
		Bundle bundle = intent.getExtras();
		Log.d("flag", "onReceive - " + intent.getAction() + ", extras: " + printBundle(bundle));

		if (JPushInterface.ACTION_REGISTRATION_ID.equals(intent.getAction())) {
			String regId = bundle.getString(JPushInterface.EXTRA_REGISTRATION_ID);
			Log.d(TAG, "接收Registration Id============================== : " + regId);
			//send the Registration Id to your server...
		}
//		else if (JPushInterface.ACTION_UNREGISTER.equals(intent.getAction())){
//			String regId = bundle.getString(JPushInterface.EXTRA_REGISTRATION_ID);
//			Log.d(TAG, "接收UnRegistration Id : " + regId);
//			//send the UnRegistration Id to your server...
//		}
		else if (JPushInterface.ACTION_MESSAGE_RECEIVED.equals(intent.getAction())) {
			Log.d("flag", "接收到推送下来的自定义消息:============================== " + bundle.getString(JPushInterface.EXTRA_MESSAGE));
			//todoStr=bundle.getString(JPushInterface.EXTRA_MESSAGE)+endtimeStr;

		} else if (JPushInterface.ACTION_NOTIFICATION_RECEIVED.equals(intent.getAction())) {
			int notifactionId = bundle.getInt(JPushInterface.EXTRA_NOTIFICATION_ID);
			Log.d("flag", "接收到推送下来的通知的ID===========================: " + notifactionId);

		} else if (JPushInterface.ACTION_NOTIFICATION_OPENED.equals(intent.getAction())) {
			Log.d("flag", "用户点击打开了通知==========================");

			Intent intentMessage = new Intent(context, MessageActivity.class);
			Bundle bundleForMessage = new Bundle();
			bundleForMessage.putString("content",content);
			if (endtimeStr!="" &&endtimeStr!=null && endtimeStr.contains("time:")) {
				time = endtimeStr.substring(endtimeStr.indexOf(":")+1,endtimeStr.length());
			}
			bundleForMessage.putString("time",time);
			Log.i("flag",".putString(time,time)======================="+time);
			bundleForMessage.putString("title",title);
			intentMessage.putExtras(bundleForMessage);
			intentMessage.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK|Intent.FLAG_ACTIVITY_CLEAR_TOP);
			context.startActivity(intentMessage);

//			//打开自定义的Activity
//			String typeStr="";
//			//返回指定子字符串在此字符串中第一次出现处的索引
//			if(todoStr.indexOf("key:cn.jpush.android.ALERT, value:")!=-1) {
////				Log.d("flag", "----------------------todoStr="+todoStr);
//				String tempStr="\"type\":\"";
//				if(todoStr.indexOf(tempStr)!=-1) {
//					tempStr=todoStr.substring(todoStr.indexOf(tempStr)+tempStr.length());
//					typeStr=tempStr.substring(0,tempStr.indexOf("\""));
//					typeStr=removeSpecilChar(typeStr);
//				}
//			}
////            if (typeStr.length()==0||typeStr==null) {
////				Log.d("flag", "---------------------- typeStr为0或为空"+typeStr.length());
////			}
//			if(typeStr.length()!=0) {
//				Log.d("flag", "----------------------"+typeStr.toString()+typeStr.length());
//				Intent i = new Intent(context, CollectionWebview.class);
//				Log.d("flag","todoStr:$$"+todoStr+"$$");
//				//把messgae改成message
//				i.putExtra("message",typeStr);
//				i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK|Intent.FLAG_ACTIVITY_CLEAR_TOP);
//				Log.d("flag","start:message_Activity");
//				context.startActivity(i);
//				typeStr="";
//
//
//			} else {
////				Log.d("flag", "----------------------else  typeStr.length()   "+typeStr.length());
////				Intent i = new Intent(context, CollectionWebview.class);
////				i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK|Intent.FLAG_ACTIVITY_CLEAR_TOP);
////				//Log.v("aaaaaaaaa","start:message_Activity");
////				context.startActivity(i);
////				typeStr="";
//
//				Log.d("flag", "----------------------else  typeStr.length()   "+typeStr.length());
//				Intent i = new Intent(context, MessageActivity.class);
//				i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK|Intent.FLAG_ACTIVITY_CLEAR_TOP);
//				context.startActivity(i);
//				typeStr="";
//
//
//			}

		} else {
			Log.d(TAG, "Unhandled intent - " + intent.getAction());
		}
	}
	
	// 打印所有的 intent extra 数据
	private String printBundle(Bundle bundle) {
		StringBuilder sb = new StringBuilder();
		for (String key : bundle.keySet()) {
			if (key.equals(JPushInterface.EXTRA_NOTIFICATION_ID)) {
				sb.append("\nkey:" + key + ", value:" + bundle.getInt(key));

			} else {
				sb.append("\nkey:" + key + ", value:" + bundle.getString(key));
			}
			if (key.equals("cn.jpush.android.ALERT")){
				content = bundle.getString(key);
			}
			if (key.equals("cn.jpush.android.NOTIFICATION_CONTENT_TITLE")){
				title = bundle.getString(key);
			}
		}

		String minuteStr;
		String hourStr;
		String secondStr;
		String keyStr="";
		String keysStr,keyeStr,tempidStr;
		keysStr="android.NOTIFICATION_ID, value:";
		keyeStr="key:cn.jpush.android";
		tempidStr=sb.toString();
		if(tempidStr.indexOf(keysStr)!=-1) {
			tempidStr=tempidStr.substring(tempidStr.indexOf(keysStr)+keysStr.length());
			Log.v("flag","-----if111-------- tempidStr:"+tempidStr);
			if(tempidStr.indexOf(keyeStr)!=-1) {
				tempidStr=tempidStr.substring(0,tempidStr.indexOf(keyeStr));
				Log.v("flag","------if222------- tempidStr:"+tempidStr);
				if(tempidStr.length()>3) {
					keyStr=tempidStr;
					keyStr.trim();
					//Log.v("aaaaaaaaa","Key:"+keyStr+"$$$");

				}
			}else {
				Log.v("flag","------------- else:   keyStr=tempidStr;   tempidStr"+tempidStr);
				keyStr=tempidStr;
				keyStr.trim();
				//Log.v("aaaaaaaaa","touch tempidStr:"+tempidStr+"$$$");
			}
		}
		Calendar ca = Calendar.getInstance();

		int yeah = ca.get(Calendar.YEAR);
		int month = ca.get(Calendar.MONTH)+1;
		int day = ca.get(Calendar.DAY_OF_MONTH);

		int minute=ca.get(Calendar.MINUTE);//分
		int hour=ca.get(Calendar.HOUR_OF_DAY);//小时
		int second=ca.get(Calendar.SECOND);//秒

		hourStr = Integer.toString(hour);
		if(hourStr.length()<2) {
			hourStr="0"+hourStr;
		}


		minuteStr = Integer.toString(minute);
		if(minuteStr.length()<2) {
			minuteStr="0"+minuteStr;
		}

		secondStr = Integer.toString(second);
		if(secondStr.length()<2) {
			secondStr="0"+secondStr;
		}
		endtimeStr="\ntime:"+Integer.toString(yeah)+"年"+Integer.toString(month)+"月"+Integer.toString(day)+"日"+hourStr+":"+minuteStr+":"+secondStr;
		int i=0;
		while(i<idlist.size()){
			if(idlist.get(i).toString().indexOf(keyStr)!=-1) {
				//Log.v("aaaaaaaaa","found id:"+keyStr);
				todoStr=sb.toString()+timelist.get(i);
				return sb.toString()+timelist.get(i);

			}
			Log.v("flag","idlist  "+idlist.get(i).toString());
			i++;
		}

		idlist.add(keyStr);
		timelist.add(endtimeStr);

		todoStr=sb.toString()+endtimeStr;
		return sb.toString()+endtimeStr;
	}
	public static String removeSpecilChar(String str){
		String result = "";
		if(null != str){
			Pattern pat = Pattern.compile("\\s*|\n|\r|\t");
			Matcher mat = pat.matcher(str);
			result = mat.replaceAll("");
		}
		return result;
	}


}