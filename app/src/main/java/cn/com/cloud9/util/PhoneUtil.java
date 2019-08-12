package cn.com.cloud9.util;

import android.app.ActivityManager;
import android.content.ContentResolver;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.res.Configuration;
import android.content.res.Resources;
import android.database.Cursor;
import android.location.LocationManager;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.provider.MediaStore;
import android.util.DisplayMetrics;
import android.util.Log;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Enumeration;
import java.util.Locale;

public class PhoneUtil {

    public static boolean isNetworkConnected(Context context) {
        //这个类主要用来查询判断网络连接信息。
        ConnectivityManager cm = (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo network = cm.getActiveNetworkInfo();
        if (network != null) {
//            String wifiIP;
//            String GPRSip;
////            boolean isConnected = network.isConnectedOrConnecting();
//            if (network.getType() == ConnectivityManager.TYPE_WIFI) {
//                wifiIP = getPhoneWifiIPAddress(context);
////                ToastUtils.longToast(context,"wifi下的IP:  "+wifiIP);
//                saveLogToSdcard(context,"当前网络是wifi，IP为"+wifiIP);
//            }else{
//                GPRSip = getPhoneGPRSIpAddress(context);
////                ToastUtils.longToast(context,"数据流量下的ip:  "+GPRSip);
//                saveLogToSdcard(context,"当前网络是GPRS，IP为"+GPRSip);
//            }

//            return network.isAvailable();
            return network.isConnected();
        }
        return false;
    }
    //log用
    public static boolean isNetworkConnectedForLog(Context context) {
        //这个类主要用来查询判断网络连接信息。
        ConnectivityManager cm = (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo network = cm.getActiveNetworkInfo();
        if (network != null) {
            String wifiIP;
            String GPRSip;
            if (network.getType() == ConnectivityManager.TYPE_WIFI) {
                wifiIP = getPhoneWifiIPAddress(context);
                SDCardHelper.saveFileToSDCard(("当前网络是wifi，IP为"+wifiIP+"  ").getBytes(),dir,dirname,context);
            }else{
                GPRSip = getPhoneGPRSIpAddress(context);
                SDCardHelper.saveFileToSDCard(("当前网络是GPRS，IP为"+GPRSip+"  ").getBytes(),dir,dirname,context);
            }
            return network.isConnected();
        }
        return false;
    }

    //判断service是否在后台运行中
    public static boolean isServiceRunning(Context context, String className) {
        ActivityManager manager = (ActivityManager) context.getSystemService(context.ACTIVITY_SERVICE);
        for (ActivityManager.RunningServiceInfo service : manager.getRunningServices(Integer.MAX_VALUE)) {
            if (className.equals(service.service.getClassName())) {
                return true;
            }
        }
        return false;
    }

    public static void sendSMS(String phoneNumber, String message) {
//    	//获取SmsManager的默认实例
//        android.telephony.SmsManager smsManager = android.telephony.SmsManager.getDefault();
//        //拆分长短信
//        List<String> divideContents = smsManager.divideMessage(message);
//        for (String text : divideContents) {
//            smsManager.sendTextMessage(phoneNumber, null, text, null, null);
//        }

//    	Uri smsToUri = Uri.parse(phoneNumber);
//
//		Intent intent = new Intent(Intent.ACTION_SENDTO, smsToUri);
//
//		intent.putExtra("sms_body", message);
//
//		startActivity(intent);

    }

    //URI转path
    public static String getRealFilePath( final Context context, final Uri uri ) {
        if ( null == uri ) return null;
        // scheme部分
        final String scheme = uri.getScheme();
        String data = null;
        if ( scheme == null )
            // 访问路径
            data = uri.getPath();
        else if ( ContentResolver.SCHEME_FILE.equals( scheme ) ) {
            // 访问路径
            data = uri.getPath();
        } else if ( ContentResolver.SCHEME_CONTENT.equals( scheme ) ) {
            Cursor cursor = context.getContentResolver().query( uri, new String[] { MediaStore.Images.ImageColumns.DATA }, null, null, null );
            if ( null != cursor ) {
                if ( cursor.moveToFirst() ) {
                    int index = cursor.getColumnIndex( MediaStore.Images.ImageColumns.DATA );
                    if ( index > -1 ) {
                        data = cursor.getString( index );
                    }
                }
                cursor.close();
            }
        }
        return data;
    }

    //path转URI
    public static Uri pathToUri(String path,Context context){
        Uri uri = null;
        if (path != null) {
            path = Uri.decode(path);
            Log.d("flag", "path2 is " + path);
            ContentResolver cr = context.getContentResolver();
            StringBuffer buff = new StringBuffer();
            buff.append("(")
                    .append(MediaStore.Images.ImageColumns.DATA)
                    .append("=")
                    .append("'" + path + "'")
                    .append(")");
            Cursor cur = cr.query(
                    MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                    new String[] { MediaStore.Images.ImageColumns._ID },
                    buff.toString(), null, null);
            int index = 0;
            for (cur.moveToFirst(); !cur.isAfterLast(); cur
                    .moveToNext()) {
                index = cur.getColumnIndex(MediaStore.Images.ImageColumns._ID);
// set _id value
                index = cur.getInt(index);
            }
            if (index == 0) {
//do nothing
            } else {
                Uri uri_temp = Uri.parse("content://media/external/images/media/" + index);
                Log.d("flag", "uri_temp is " + uri_temp);
                if (uri_temp != null) {
                    uri = uri_temp;
                }
            }
        }
        return uri;
    }

    public static boolean isGpsOpen(Context context) {
        //位置管理器权限
        LocationManager locationManager = (LocationManager) context.getSystemService(Context.LOCATION_SERVICE);
        return locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER);
    }

    public static void changeSysLang(Context context, String lang) {
        if (lang == null || "".equals(lang)) {
            return;
        }
        Resources resources = context.getResources();
        Configuration config = resources.getConfiguration();
        DisplayMetrics dm = resources.getDisplayMetrics();
        config.locale = lang.startsWith("en") ? Locale.ENGLISH : Locale.SIMPLIFIED_CHINESE;
        resources.updateConfiguration(config, dm);
    }

    public static boolean isInstalled(Context context, String packageName) {
        try {
            PackageInfo pinfo = context.getPackageManager().getPackageInfo(packageName, 0);
            if (pinfo != null) {
                return true;
            }
        } catch (PackageManager.NameNotFoundException e) {
            //e.printStackTrace();
        }
        return false;
    }

    public static String getSysTime(Context context){
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        Date date = new Date(System.currentTimeMillis());
        String format = dateFormat.format(date);
        if (format!=null) {
            return format;
        }
        return null;
    }

    //获取移动数据下的手机IP
    public static String getPhoneGPRSIpAddress(Context context) {
        try
        {
            for (Enumeration<NetworkInterface> en = NetworkInterface.getNetworkInterfaces(); en.hasMoreElements();)
            {
                NetworkInterface intf = en.nextElement();
                for (Enumeration<InetAddress> enumIpAddr = intf.getInetAddresses(); enumIpAddr.hasMoreElements();)
                {
                    InetAddress inetAddress = enumIpAddr.nextElement();
                    if (!inetAddress.isLoopbackAddress())
                    {
                        return inetAddress.getHostAddress().toString();
                    }
                }
            }
        }
        catch (SocketException ex)
        {
//            Log.e("WifiPreference IpAddress", ex.toString());
            LogUtils.i(ex.toString());
        }
        return null;
    }

    //获取WIFI网络下的手机IP地址
    public static String getPhoneWifiIPAddress(Context context){
        //获取wifi服务
        WifiManager wifiManager = (WifiManager) context.getSystemService(Context.WIFI_SERVICE);
        //判断wifi是否开启
        if (!wifiManager.isWifiEnabled()) {
            wifiManager.setWifiEnabled(true);
        }
        WifiInfo wifiInfo = wifiManager.getConnectionInfo();
        int ipAddress = wifiInfo.getIpAddress();
        String ip = intToIp(ipAddress);
        if (ip == null || ip.equals("")) {
            return null;
        }
        return ip;
    }
    private static String intToIp(int i) {
        return (i & 0xFF ) + "." +
                ((i >> 8 ) & 0xFF) + "." +
                ((i >> 16 ) & 0xFF) + "." +
                ( i >> 24 & 0xFF) ;
    }

    private static StringBuffer sbForLog;//打印LOG的StringBuffer
    private static String dir = "trajectoryLog";//打印LOG的文件夹名
    private static String dirname = "trajectoryLog.txt";//打印LOG的文件名
    //保存日志
    public static void saveLogToSdcard(Context context, String contentStr){
        String sysTime = PhoneUtil.getSysTime(context);

        SharedPreferences fileDeleteSP = context.getSharedPreferences("fileDelete", context.MODE_PRIVATE);
        boolean isDeleted = fileDeleteSP.getBoolean("isDeleted",false);
        if (sbForLog==null) {
            sbForLog = new StringBuffer();
        }
        sbForLog.append(sysTime+" ----- "+contentStr+"\n");
        if ( SDCardHelper.saveFileToSDCard(sbForLog.toString().getBytes(),dir,dirname,context)) {
//            Log.i("flag","saveFileToSDCard    return true..................");
        }else{
//            Log.i("flag","saveFileToSDCard    return false..................");
        }
    }

    //ping服务器地址
    public static boolean ping(String host, int pingCount, StringBuffer stringBuffer) {
        String line = null;
        Process process = null;
        BufferedReader successReader = null;
//        String command = "ping -c " + pingCount + " -w 5 " + host;
        String command = "ping -c " + pingCount + " " + host;
        boolean isSuccess = false;
        try {
            process = Runtime.getRuntime().exec(command);
            if (process == null) {
//                Log.e("flag","ping fail:process is null.");
                append(stringBuffer, "ping fail:process is null.");
                return false;
            }
            successReader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            while ((line = successReader.readLine()) != null) {
//                Log.i("flag",line);
                append(stringBuffer, line);
            }
            int status = process.waitFor();
            if (status == 0) {
//                Log.i("flag","exec cmd success:" + command);
                append(stringBuffer, "exec cmd success:" + command);
                isSuccess = true;
            } else {
//                Log.e("flag","exec cmd fail.");
                append(stringBuffer, "exec cmd fail.");
                isSuccess = false;
            }
//            Log.i("flag","exec finished.");
            append(stringBuffer, "exec finished.");
        } catch (IOException e) {
//            Log.e("flag",e.toString());
        } catch (InterruptedException e) {
//            Log.e("flag",e.toString());
        } finally {
//            Log.i("flag","ping exit.");
            if (process != null) {
                process.destroy();
            }
            if (successReader != null) {
                try {
                    successReader.close();
                } catch (IOException e) {
//                    Log.e("flag",e.toString());
                }
            }
        }
        return isSuccess;
    }

    private static void append(StringBuffer stringBuffer, String text) {
        if (stringBuffer != null) {
            stringBuffer.append(text + "\n");
        }
    }

    //判断service是否在后台运行
//    public static boolean isServiceRunning(Context mContext, String className) {
//        boolean isRunning = false;
//        ActivityManager activityManager = (ActivityManager) mContext.getSystemService(Context.ACTIVITY_SERVICE);
//        List<ActivityManager.RunningServiceInfo> serviceList = activityManager.getRunningServices(Integer.MAX_VALUE);
//        Log.i("flag","Integer.MAX_VALUE======"+Integer.MAX_VALUE);
//        if (!(serviceList.size() > 0)) {
//            return false;
//        }
//
//        for (int i = 0; i < serviceList.size(); i++) {
//            Log.i("flag","serviceList.get(i).service.getClassName()="+serviceList.get(i).service.getClassName());
//            if (serviceList.get(i).service.getClassName().equals(className)) {
//                Log.i("flag","****************************AmLocationService.class.getName()="+AmLocationService.class.getName());
//                Log.i("flag","****************************serviceList.get(i).service.getClassName()="+serviceList.get(i).service.getClassName());
//                isRunning = true;
//                break;
//            }
//        }
//        return isRunning;
//    }

    //获取手机的品牌
    public static String getPhoneBrand() {
        String androidDisplay = null;
        androidDisplay = android.os.Build.BRAND;
        return androidDisplay;
    }

}
