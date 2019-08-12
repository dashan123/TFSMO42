package cn.com.cloud9.common;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.os.IBinder;
import android.os.SystemClock;
import android.support.annotation.Nullable;
import android.util.Log;

import java.util.Date;

import cn.com.cloud9.tfsmo.android42.CollectionWebview;
import cn.com.cloud9.util.HttpUtil;
import cn.com.cloud9.util.PhoneUtil;
import cn.com.cloud9.util.SDCardHelper;

/**
 * Created by yaxian on 2017/9/18.
 */

public class LogService extends Service {
    private static final int TIME_SERVICE_WAKEUP = 1000 * 60;
    public static final String BROADCAST_LOG_ACTION = LogService.class.getName();
    public static final String AMAP_DESTROY = "amap_destroy";
    public static final String AMAP_CREATE = "amap_create";
    public static final String DELETE_LOG_FILE = "deleteLogFile";
//    public static final String BROADCAST_LOG_CMD = "cmd";
//    public static final String BROADCAST_LOG_STOP = "stop";

    public String userid;

    private BroadcastReceiver logReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
//            String cmd = intent.getStringExtra(BROADCAST_LOG_CMD);

            if (intent.getAction().equals(BROADCAST_LOG_ACTION)) {
                cancelAlarm();
                stopSelf();
                stopService(intent);
            }
        }
    };
    boolean isclose=false;
    private BroadcastReceiver receiverAmapDestroy = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            if (AMAP_DESTROY.equals(action)) {
                isclose = false;//高德服务关闭了
            }
        }
    };
    private BroadcastReceiver receiverAmapCreate = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            if (AMAP_CREATE.equals(action)) {
                isclose = true;//高德服务开启了
            }
        }
    };

    private static boolean isDeleteLogFile = false;
    private BroadcastReceiver deleteLogReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if (intent.getAction().equals(DELETE_LOG_FILE)) {
                isDeleteLogFile = true;
//                date1 = null;
                Log.i("flag","接收到广播了，isDeleteLogFile = true;");
            }
        }
    };

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        Log.i("flag","LogService   onCreate");
        SharedPreferences sharedPreferences = getSharedPreferences("location", MODE_MULTI_PROCESS);
        userid = sharedPreferences.getString("userid", null);

        setAlarm();
        registerReceiver(logReceiver, new IntentFilter(BROADCAST_LOG_ACTION));
        registerReceiver(receiverAmapDestroy, new IntentFilter(AMAP_DESTROY));
        registerReceiver(receiverAmapCreate, new IntentFilter(AMAP_CREATE));
        //创建LOG日志文件时发送的广播
        registerReceiver(deleteLogReceiver, new IntentFilter(DELETE_LOG_FILE));
    }

    private static String dir = "trajectoryLog";//打印LOG的文件夹名
    private static String dirname = "trajectoryLog.txt";//打印LOG的文件名
    private Date date1 = null;
    long time1;
    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (isDeleteLogFile) {
            date1 = null;
            isDeleteLogFile = false;
        }
        SharedPreferences sp1 = getSharedPreferences("spForLogTime", MODE_MULTI_PROCESS);
        long time1InSp = sp1.getLong("time1", 0);
        if (null == date1 && time1InSp != 0) {//说明是程序退出了然后从新进入的
            Log.i("flag","if (null == date1 && time1InSp != 0)---");
            Date date2 = new Date(System.currentTimeMillis());
            long time2 = date2.getTime();
            if ((time2-time1InSp)/(1000*60*60*24) >= 7) {
                CollectionWebview.deleteLogs();
                //删除日志文件后SP清空
//                sp1.edit().clear().commit();
            }
        } else if (null == date1 && time1InSp == 0) {//说明是日志文件被删除后再进入的
            Log.i("flag","else if (null == date1 && time1InSp == 0)--- ---");
            date1 = new Date(System.currentTimeMillis());
            time1 = date1.getTime();

            SharedPreferences sharedPreferences = getSharedPreferences("spForLogTime", MODE_MULTI_PROCESS);
            SharedPreferences.Editor editor = sharedPreferences.edit();
            editor.putLong("time1", time1);
            editor.commit();
        } else if (null != date1 && time1InSp != 0) {//说明是正常情况日志没有被删除并且程序没有退出过进入的
            Log.i("flag","else if (null != date1 && time1InSp != 0)--- --- ---");
            Date date2 = new Date(System.currentTimeMillis());
            long time2 = date2.getTime();
            if ((time2-time1InSp)/(1000*60*60*24) >= 7) {
                CollectionWebview.deleteLogs();
                //删除日志文件后SP清空
//                sp1.edit().clear().commit();
            }
        }

//        if (null == date1) {
//            Log.i("flag","(null == date1");
//            date1 = new Date(System.currentTimeMillis());
//            time1 = date1.getTime();
//
//            SharedPreferences sharedPreferences = getSharedPreferences("spForLogTime", MODE_PRIVATE);
//            SharedPreferences.Editor editor = sharedPreferences.edit();
//            editor.putLong("time1", time1);
//            editor.commit();
//        }else{
//            Log.i("flag","else");
//            Date date2 = new Date(System.currentTimeMillis());
//            long time2 = date2.getTime();
//            if ((time2-time1)/(1000*60*60*24) >= 7) {
//                CollectionWebview.deleteLogs();
//            }
//        }

        if (userid==null) {
            userid="";
        }

        String sysTime = PhoneUtil.getSysTime(getApplicationContext());
        boolean isServiceOpen = PhoneUtil.isServiceRunning(getApplicationContext(),AmLocationService.class.getName());
        if (isServiceOpen) {
//        if (isclose) {
//            SDCardHelper.saveFileToSDCard((sysTime+"  "+"用户user_id为 "+userid + "   "+"高德服务状态：运行中"+"\n").getBytes(),dir,dirname,getApplicationContext());
            SDCardHelper.saveFileToSDCard((sysTime+"  " + "   "+"高德服务状态：运行中"+"\n").getBytes(),dir,dirname,getApplicationContext());
        }else{
//            SDCardHelper.saveFileToSDCard((sysTime+"  "+"用户user_id为 "+userid + "   "+"高德服务状态：关闭中>>>>>>"+"\n").getBytes(),dir,dirname,getApplicationContext());
            SDCardHelper.saveFileToSDCard((sysTime+"  " + "   "+"高德服务状态：关闭中!!!!!"+"\n").getBytes(),dir,dirname,getApplicationContext());
        }
        int code = HttpUtil.getResponseCode(getApplicationContext());
        if (code == 200) {
            SDCardHelper.saveFileToSDCard(("与服务器连接正常"+"\n"+"GPS是否已开启："+PhoneUtil.isGpsOpen(getApplicationContext())+"\n"+"\n").getBytes(),dir,dirname,getApplicationContext());
        }else if(code == -1){
            SDCardHelper.saveFileToSDCard(("网络已断开 ......"+"\n"+"GPS是否已开启："+PhoneUtil.isGpsOpen(getApplicationContext())+"\n"+"\n").getBytes(),dir,dirname,getApplicationContext());
        }else{
            SDCardHelper.saveFileToSDCard(("与服务器连接异常 !!!!!! 状态码为："+code+"\n"+"GPS是否已开启："+PhoneUtil.isGpsOpen(getApplicationContext())+"\n"+"\n").getBytes(),dir,dirname,getApplicationContext());
        }

        return START_STICKY;
//        return super.onStartCommand(intent, flags, startId);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        Log.i("flag","LogService   onDestroy");
        unregisterReceiver(logReceiver);
        unregisterReceiver(receiverAmapDestroy);
        unregisterReceiver(receiverAmapCreate);
        unregisterReceiver(deleteLogReceiver);
    }

    private void setAlarm() {
        //一种系统级别的提示服务，在特定的时刻为我们广播一个指定的Intent
        AlarmManager alarmManager = (AlarmManager) getApplicationContext().getSystemService(ALARM_SERVICE);
        Intent intent = new Intent(getApplicationContext(), LogService.class);
        //PendingIntent是Intent的封装类
        //通过启动服务获取对象
        PendingIntent pendingIntent = PendingIntent.getService(getApplicationContext(), 0, intent,
                PendingIntent.FLAG_UPDATE_CURRENT);
        //该方法用于设置重复闹钟，第一个参数表示闹钟类型，第二个参数表示闹钟首次执行时间，第三个参数表示闹钟两次执行的间隔时间，第四个参数表示闹钟响应动作。
        alarmManager.setRepeating(AlarmManager.ELAPSED_REALTIME_WAKEUP,
                SystemClock.elapsedRealtime() + TIME_SERVICE_WAKEUP, TIME_SERVICE_WAKEUP, pendingIntent);
    }
    public void cancelAlarm() {
        AlarmManager alarmManager = (AlarmManager) getApplicationContext().getSystemService(ALARM_SERVICE);
        Intent intent = new Intent(getApplicationContext(), LogService.class);
        PendingIntent pendingIntent = PendingIntent.getService(getApplicationContext(), 0, intent,
                PendingIntent.FLAG_UPDATE_CURRENT);
        alarmManager.cancel(pendingIntent);
    }
}
