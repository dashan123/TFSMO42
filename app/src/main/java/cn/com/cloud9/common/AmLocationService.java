package cn.com.cloud9.common;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.PendingIntent;
import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.IBinder;
import android.os.SystemClock;
import android.support.annotation.Nullable;
import android.util.Log;
import android.widget.CompoundButton;
import android.widget.CompoundButton.OnCheckedChangeListener;

import com.amap.api.location.AMapLocation;
import com.amap.api.location.AMapLocationClient;
import com.amap.api.location.AMapLocationClientOption;
import com.amap.api.location.AMapLocationListener;
import com.amap.api.maps.LocationSource;
import com.amap.api.maps2d.AMapUtils;
import com.amap.api.maps2d.model.LatLng;

import cn.com.cloud9.util.LogUtils;
import cn.com.cloud9.util.PhoneUtil;
import cn.com.cloud9.util.SDCardHelper;
import cn.com.cloud9.util.ToastUtils;

public class AmLocationService extends Service implements AMapLocationListener,LocationSource,OnCheckedChangeListener{

	public static final String BROADCAST_ACTION = AmLocationService.class.getName();
	public static final String BROADCAST_TAG_MSG_LOC = "msg_loc";
	public static final String BROADCAST_TAG_MSG_SAVE = "msg_save";
	public static final String BROADCAST_TAG_CMD = "cmd";
	public static final String BROADCAST_CMD_STOP = "stop";

	// 守护进程 Service ID
	private final static int DAEMON_SERVICE_ID = -4121;

	private static final int TIME_SERVICE_WAKEUP = 1000 * 60;

	private BroadcastReceiver receiver = new BroadcastReceiver() {
		@Override
		public void onReceive(Context context, Intent intent) {
			String cmd = intent.getStringExtra(BROADCAST_TAG_CMD);
			if (BROADCAST_CMD_STOP.equals(cmd)) {
				cancelAlarm();
				stopSelf();
			}
		}
	};

	private AMapLocationClient locationClient = null;
	private AMapLocation lastSavedLoction = null;

	private long minDistance;
	private long minInterval;
	private long lowSpeedInterval;
	private long highSpeedInterval;
	private float speedThreshold;

	private String userid;
	private String extra;

	private static String dir = "AmapError";//打印LOG的文件夹名
	private static String dirname = "amapError.txt";//打印LOG的文件名

	private OnLocationChangedListener mListener;

	@Override
	public IBinder onBind(Intent intent) {
		return null;
	}

	@Override
	public void onCreate() {
		super.onCreate();

		// param
		SharedPreferences sharedPreferences = getSharedPreferences("location", MODE_PRIVATE);

		minDistance = sharedPreferences.getLong("minDistance", 0);
		minInterval = sharedPreferences.getLong("minInterval", 0);
		lowSpeedInterval = sharedPreferences.getLong("lowSpeedInterval", 0);
		highSpeedInterval = sharedPreferences.getLong("highSpeedInterval", 0);
		speedThreshold = sharedPreferences.getFloat("speedThreshold", 0);

		userid = sharedPreferences.getString("userid", null);
		extra = sharedPreferences.getString("extra", "");

		if (userid == null) {
			stopSelf();
			return;
		}

		// set location
		AMapLocationClientOption option = new AMapLocationClientOption();
		option.setHttpTimeOut(30000);
		//是否强制刷新WIFI
		option.setWifiActiveScan(false);


		// 设置定位模式 Battery_Saving为低功耗模式，Device_Sensors是仅设备模式,还有个高精度模式
//		option.setLocationMode(AMapLocationClientOption.AMapLocationMode.Hight_Accuracy); // 高精度
//		option.setLocationMode(AMapLocationClientOption.AMapLocationMode.Battery_Saving); // 网络
		option.setLocationMode(AMapLocationClientOption.AMapLocationMode.Device_Sensors); // 仅设备
		if (minInterval > 0) {
			// 设置定位间隔,单位毫秒
			option.setInterval(minInterval * 1000);
		}else{
			option.setInterval(5000);
		}

		//设置是否允许模拟位置,默认为false，不允许模拟位置
		option.setMockEnable(false);
//		option.setNeedAddress(true);

		locationClient = new AMapLocationClient(getApplicationContext());
		// 设置定位参数
		locationClient.setLocationOption(option);
		// 设置定位监听
		locationClient.setLocationListener(this);
		// 启动定位
		locationClient.startLocation();

		// keep alive
		setAlarm();
		registerReceiver(receiver, new IntentFilter(BROADCAST_ACTION));
	}

	@Override
	public int onStartCommand(Intent intent, int flags, int startId) {
//		//开启守护进程
//		startForeground(DAEMON_SERVICE_ID,new Notification());
//		if (Build.VERSION.SDK_INT >= 18){
//			Intent innerIntent = new Intent(getApplicationContext(), AmapDaemonInnerService.class);
//			startService(innerIntent);
////			startForeground(DAEMON_SERVICE_ID, new Notification());
//		}

		return START_STICKY;
	}

	@Override
	public void onDestroy() {
		super.onDestroy();
		unregisterReceiver(receiver);
		if (null != locationClient) {
			locationClient.stopLocation();
			locationClient.onDestroy();
			locationClient = null;
			lastSavedLoction = null;
		}
	}

	private void setAlarm() {
		//一种系统级别的提示服务，在特定的时刻为我们广播一个指定的Intent
		AlarmManager alarmManager = (AlarmManager) getApplicationContext().getSystemService(ALARM_SERVICE);
		Intent intent = new Intent(getApplicationContext(), AmLocationService.class);
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
		Intent intent = new Intent(getApplicationContext(), AmLocationService.class);
		PendingIntent pendingIntent = PendingIntent.getService(getApplicationContext(), 0, intent,
				PendingIntent.FLAG_UPDATE_CURRENT);
		alarmManager.cancel(pendingIntent);
	}

	//当定位信息改变的时候
	@Override
	public void onLocationChanged(AMapLocation loc) {

		if (loc != null && loc.getErrorCode() == 0) {
			loc.setAccuracy(1.0f);
//			ToastUtils.shortToast(getApplicationContext(),"loc是空："+loc.getErrorCode());

			// send last location
			{
				AmLocationEntity entity = new AmLocationEntity(loc, userid, extra);
				Intent intent = new Intent();
				intent.setAction(BROADCAST_ACTION);
				intent.putExtra(BROADCAST_TAG_MSG_LOC, entity.toParamStringForLoc());
				getApplicationContext().sendBroadcast(intent);
			}

			// to save
			boolean toSave = false;
			if (lastSavedLoction == null) {
				toSave = true;
			} else {
				//LatLng类是以经度和纬度表示的地理坐标点
				LatLng pos1 = new LatLng(loc.getLatitude(), loc.getLongitude());
				LatLng pos2 = new LatLng(lastSavedLoction.getLatitude(), lastSavedLoction.getLongitude());
//				Log.d("flag", "lat = "+pos1);
				//计算两点之间的距离
				float dis = AMapUtils.calculateLineDistance(pos1, pos2);

				if (dis > 0 && dis >= minDistance) {
					long time = (loc.getTime() - lastSavedLoction.getTime()) / 1000;
					if (time > 0 && time > minInterval) {
						float speed = dis / time;
						if (speed >= speedThreshold) {
							if (time > highSpeedInterval)
								toSave = true;
						} else {
							if (time > lowSpeedInterval)
								toSave = true;
						}
					}
				}
			}
			if (toSave) {
				lastSavedLoction = loc;
				try {
					// save
					AmLocationEntity entity = new AmLocationEntity(loc, userid, extra);
					AmLocationDb.save(entity);
					entity = AmLocationDb.getLastEntity();
					// send
					Intent intent = new Intent();
					intent.setAction(BROADCAST_ACTION);
					intent.putExtra(BROADCAST_TAG_MSG_SAVE, entity.toParamStringForSave());
					getApplicationContext().sendBroadcast(intent);
				} catch (Exception ex) {
					ex.printStackTrace();
				}
			}
		}else {
			//定位失败时，可通过ErrCode（错误码）信息来确定失败的原因，errInfo是错误信息，详见错误码表。
//			Log.e("AmapError","location Error, ErrCode:" + loc.getErrorCode() + ", errInfo:" + loc.getErrorInfo());
			String sysTime = PhoneUtil.getSysTime(getApplicationContext());
			SDCardHelper.saveFileToSDCard((sysTime+"       " +"定位异常, 错误码:" + loc.getErrorCode() + ", 错误信息:" + loc.getErrorInfo()+"\n"+"\n").getBytes(),dir,dirname,getApplicationContext());
//			ToastUtils.shortToast(getApplicationContext(),"ErrCode:" + loc.getErrorCode() + ", errInfo:" + loc.getErrorInfo());
		}
//		}else{
//			Toast.makeText(getApplicationContext(), "mListener监听为空", Toast.LENGTH_SHORT).show();
//		}
	}

	@Override
	public void activate(OnLocationChangedListener arg0) {
		// TODO Auto-generated method stub

	}

	@Override
	public void deactivate() {
		// TODO Auto-generated method stub

	}

	@Override
	public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
		// TODO Auto-generated method stub

	}

//	public static class AmapDaemonInnerService extends Service {
//		@Override
//		public void onCreate() {
//			super.onCreate();
//		}
//
//		@Override
//		public int onStartCommand(Intent intent, int flags, int startId) {
//			startForeground(DAEMON_SERVICE_ID, new Notification());
////            stopForeground(true);
//			stopSelf();
//			return super.onStartCommand(intent, flags, startId);
//		}
//
//		@Nullable
//		@Override
//		public IBinder onBind(Intent intent) {
//			return null;
//		}
//
//		@Override
//		public void onDestroy() {
//			stopForeground(true);
//			super.onDestroy();
//		}
//	}

}
