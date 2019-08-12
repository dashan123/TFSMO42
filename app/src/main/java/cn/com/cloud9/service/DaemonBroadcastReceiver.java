package cn.com.cloud9.service;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/**
 * Created by yaxian on 2017/8/25.
 */

public class DaemonBroadcastReceiver extends BroadcastReceiver {

    public final static String DAEMON_WAKE_ACTION = "daemon_BroadcastReceiver_Action";

    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        if (Intent.ACTION_BOOT_COMPLETED.equals(action)){
//            Log.i("flag","ACTION_BOOT_COMPLETED "+action);
        }else if (action.equals(DAEMON_WAKE_ACTION)){
//            if (!PhoneUtil.isServiceRunning(context,DaemonService.class.getName())){
//                context.startService(new Intent(context,DaemonService.class));
//                ToastUtils.shortToast(context,"重启DaemonService服务了");
//            }
//            Log.i("flag","DaemonService服务还在开启吗 "+PhoneUtil.isServiceRunning(context,DaemonService.class.getName()));
//            Log.i("flag","DAEMON_WAKE_ACTION "+action);
        }else if (Intent.ACTION_SCREEN_ON.equals(action)){
//            Log.i("flag","ACTION_SCREEN_ON"+action);
        }else {
//            Log.i("flag","else   "+action);
        }

    }
}
