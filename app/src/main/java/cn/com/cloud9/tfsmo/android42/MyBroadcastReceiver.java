package cn.com.cloud9.tfsmo.android42;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.net.ConnectivityManager;
import android.net.NetworkInfo.State;
import android.widget.Toast;

public class MyBroadcastReceiver extends BroadcastReceiver {

    private Activity activity = null;
    public MyBroadcastReceiver(Activity activity){
        this.activity = activity;
    }
    @Override
    public void onReceive(Context context, Intent intent) {
//      Log.e(TAG, "网络状态改变");
        boolean success = false;

        //获得网络连接服务
        ConnectivityManager connManager = (ConnectivityManager) context.getSystemService(context.CONNECTIVITY_SERVICE);
        // State state = connManager.getActiveNetworkInfo().getState();
        State state = connManager.getNetworkInfo(ConnectivityManager.TYPE_WIFI).getState(); // 获取网络连接状态
        if (State.CONNECTED == state) { // 判断是否正在使用WIFI网络
            success = true;
        }

        state = connManager.getNetworkInfo(ConnectivityManager.TYPE_MOBILE).getState(); // 获取网络连接状态
        if (State.CONNECTED != state) { // 判断是否正在使用GPRS网络
            success = true;
        }

        if (!success) {
            Toast.makeText(activity, "您的网络连接已中断", Toast.LENGTH_LONG).show();
        }
    }

}
