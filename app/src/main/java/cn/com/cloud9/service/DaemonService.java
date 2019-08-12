package cn.com.cloud9.service;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import android.support.annotation.Nullable;
import android.util.Log;

import cn.com.cloud9.util.ToastUtils;
import cn.jpush.android.api.JPushInterface;

/**
 * Created by yaxian on 2017/8/25.
 */

public class DaemonService extends Service {

    // 定时唤醒的时间间隔，这里为了自己测试方边设置了一分钟
    private final static int ALARM_INTERVAL = 60 * 1000;
    // 发送唤醒广播请求码
    private final static int WAKE_REQUEST_CODE = 5121;
    // 守护进程 Service ID
    private final static int DAEMON_SERVICE_ID = -5121;

    @Override
    public void onCreate() {
//        ToastUtils.shortToast(getApplicationContext(),"onCreate");
        Log.i("flag","onCreate");
//        JPushInterface.init(getApplicationContext());
        super.onCreate();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
//        ToastUtils.shortToast(getApplicationContext(),"onStartCommand~~~!!@##");
        Log.i("flag","onStartCommand");
//        if (Build.VERSION.SDK_INT < 18) {
//            startForeground(1000,new Notification());
//        }else{
//            Intent innerIntent = new Intent(this, DaemonInnerService.class);
//            startService(innerIntent);
//            startForeground(1000, new Notification());
//        }

        startForeground(DAEMON_SERVICE_ID,new Notification());
        if (Build.VERSION.SDK_INT >= 18){
            Intent innerIntent = new Intent(this, DaemonInnerService.class);
            startService(innerIntent);
//            startForeground(DAEMON_SERVICE_ID, new Notification());
        }

        AlarmManager alarmManager = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
        Intent alarmIntent = new Intent();
        alarmIntent.setAction(DaemonBroadcastReceiver.DAEMON_WAKE_ACTION);

        PendingIntent pendingIntent = PendingIntent.getBroadcast(getApplicationContext(), WAKE_REQUEST_CODE, alarmIntent, PendingIntent.FLAG_UPDATE_CURRENT);

//        alarmManager.setInexactRepeating(AlarmManager.RTC_WAKEUP,System.currentTimeMillis(),ALARM_INTERVAL,pendingIntent);
        alarmManager.setRepeating(AlarmManager.RTC_WAKEUP,System.currentTimeMillis(),ALARM_INTERVAL,pendingIntent);

//        return super.onStartCommand(intent, flags, startId);
        return START_STICKY;
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        Log.i("flag","onDestroy");
        stopForeground(true);
        super.onDestroy();
    }

    public static class DaemonInnerService extends Service {
        @Override
        public void onCreate() {
            super.onCreate();
        }

        @Override
        public int onStartCommand(Intent intent, int flags, int startId) {
            startForeground(DAEMON_SERVICE_ID, new Notification());
            stopSelf();
            return super.onStartCommand(intent, flags, startId);
        }

        @Nullable
        @Override
        public IBinder onBind(Intent intent) {
            return null;
        }

        @Override
        public void onDestroy() {
            stopForeground(true);
            super.onDestroy();
        }
    }
}
