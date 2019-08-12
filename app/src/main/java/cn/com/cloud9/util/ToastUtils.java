package cn.com.cloud9.util;

import android.content.Context;
import android.widget.Toast;

public class ToastUtils {

	private ToastUtils(){
		throw new UnsupportedOperationException("cannot be instantiated");
	}
	
	public static void shortToast(Context context,String message){
		Toast.makeText(context, message, Toast.LENGTH_SHORT).show();
	}
	public static void shortToast(Context context,int message){
		Toast.makeText(context, message, Toast.LENGTH_SHORT).show();
	}
	
	
	public static void longToast(Context context,String message){
		Toast.makeText(context, message, Toast.LENGTH_LONG).show();
	}
	public static void longToast(Context context,int message){
		Toast.makeText(context, message, Toast.LENGTH_LONG).show();
	}
}
