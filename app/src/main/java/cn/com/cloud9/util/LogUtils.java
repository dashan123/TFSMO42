package cn.com.cloud9.util;

import android.util.Log;

public class LogUtils {

	private static final String LOG_NAME="flag";
	
	private static boolean logEnable_v=true;
	private static boolean logEnable_d=true;
	private static boolean logEnable_i=true;
	private static boolean logEnable_w=true;
	private static boolean logEnable_e=true;
	
	public static void v(String message){
		if (logEnable_v) {
			Log.v(LOG_NAME, message);			
		}
	}
	public static void d(String message){
		if (logEnable_v) {
			Log.v(LOG_NAME, message);			
		}
	}
	public static void i(String message){
		if (logEnable_v) {
			Log.v(LOG_NAME, message);			
		}
	}
	public static void w(String message){
		if (logEnable_v) {
			Log.v(LOG_NAME, message);			
		}
	}
	public static void e(String message){
		if (logEnable_v) {
			Log.v(LOG_NAME, message);			
		}
	}
	
}
