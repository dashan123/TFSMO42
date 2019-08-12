package com.example.twobarcodes;

import java.io.File;
import java.io.IOException;
import java.util.Vector;

import android.app.Activity;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.res.AssetFileDescriptor;
import android.graphics.Bitmap;
import android.hardware.Camera;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.media.MediaPlayer.OnCompletionListener;
import android.media.projection.MediaProjectionManager;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.os.Vibrator;
import android.util.Log;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.SurfaceHolder;
import android.view.SurfaceHolder.Callback;
import android.view.SurfaceView;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.Result;
import com.mining.app.zxing.camera.CameraManager;
import com.mining.app.zxing.decoding.CaptureActivityHandler;
import com.mining.app.zxing.decoding.InactivityTimer;
import com.mining.app.zxing.utils.BitmapUtils;
import com.mining.app.zxing.utils.HandlerManager;
import com.mining.app.zxing.utils.MyDialog;
import com.mining.app.zxing.utils.PhoneUtils;
import com.mining.app.zxing.utils.ScreenUtils;
import com.mining.app.zxing.view.ViewfinderView;

import static com.mining.app.zxing.camera.CameraManager.MAX_FRAME_HEIGHT;

/**
 * Initial the camera
 * @author Ryan.Tang
 */
public class MipcaActivityCapture extends Activity implements Callback {

	private float oldDist = 1f;

    private MyDialog myDialog;
	public static final int OK = 0;
	public static final int fail = -1;
	private Handler svpnSericeHandler = new Handler() {
		public void handleMessage(Message msg) {
			switch (msg.what) {
				case MipcaActivityCapture.OK:
					//这里执行照片保存成功的操作
					playBeepSoundAndVibrate();//响铃且震动
					//提示一个对话框
//					setDialog();
					MipcaActivityCapture.this.finish();

					Log.i("flag", "----------------------- 222222222222222222222");
					return;
				case MipcaActivityCapture.fail:
					Log.d("flag", "msg.what = " + msg.what);
					return;
				default:
					Log.d("flag", "msg.what = " + msg.what);
					break;
			}
		}
	};
//	public MipcaActivityCapture() {
//		HandlerManager.getInstance().setHandler(svpnSericeHandler);
//	}

	private CaptureActivityHandler handler;
	private ViewfinderView viewfinderView;
	private boolean hasSurface;
	private Vector<BarcodeFormat> decodeFormats;
	private String characterSet;
	private InactivityTimer inactivityTimer;
	private MediaPlayer mediaPlayer;
	private boolean playBeep;
	private static final float BEEP_VOLUME = 0.50f;
	private boolean vibrate;
//	private Spinner spinner;
	private TextView tv_change_scan_area;

	private ImageView imageView_light;
	private boolean flashLightOpen = false;
	public static int RESULE_LENGTH_EIGHTEEN = 18;
	public static int RESULT_LENGGTH_SEVENTEEN = 17;

	private String type;


	/** Called when the activity is first created. */
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_capture);
		//ViewUtil.addTopView(getApplicationContext(), this, R.string.scan_card);

		Intent intent = getIntent();
		//获取到type确定是点的扫描二维码还是扫描条形码
		type = (String) intent.getExtras().get("type");
		HandlerManager.getInstance().setHandler(svpnSericeHandler);


		CameraManager.init(getApplication());
		viewfinderView = (ViewfinderView) findViewById(R.id.viewfinder_view);
		viewfinderView.setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View v) {
				Log.i("flag","点了viewfinderView了");
//				FlashlightManager.enableFlashlight();

			}
		});

		Button mButtonBack = (Button) findViewById(R.id.button_back);
		mButtonBack.setOnClickListener(new OnClickListener() {

			@Override
			public void onClick(View v) {
				MipcaActivityCapture.this.finish();
			}
		});
		hasSurface = false;
		inactivityTimer = new InactivityTimer(this);

		imageView_light = (ImageView) findViewById(R.id.bottom_bar_camera_light);
		imageView_light.setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View v) {
				Log.i("flag","点了 闪光灯了");
				if (flashLightOpen) {
					imageView_light.setImageResource(R.drawable.btn_camera_light);
				} else {
					imageView_light.setImageResource(R.drawable.btn_camera_light_off);
				}
				toggleFlashLight();

			}
		});

		if (type != null && type.equals("1")) {
			SharedPreferences spForScanCode = getSharedPreferences("scanCode",MODE_PRIVATE);
			spForScanCode.edit().putString("type",type).commit();
//			Toast.makeText(MipcaActivityCapture.this, "type===="+type, Toast.LENGTH_SHORT).show();

			ViewfinderView.isFirst = false;
			CameraManager.framingRect = null;
			CameraManager.framingRectInPreview = null;
//			viewfinderView.requestLayout();
//			viewfinderView.invalidate();
		}
		if (type != null && type.equals("2")) {
			SharedPreferences spForScanCode = getSharedPreferences("scanCode",MODE_PRIVATE);
			spForScanCode.edit().putString("type",type).commit();
//			Toast.makeText(MipcaActivityCapture.this, "type===="+type, Toast.LENGTH_SHORT).show();
//			MAX_FRAME_HEIGHT = 800;
//			MAX_FRAME_WIDTH = 800;
			ViewfinderView.isFirst = false;
			CameraManager.framingRect = null;
			CameraManager.framingRectInPreview = null;
//			viewfinderView.requestLayout();
//			viewfinderView.invalidate();
		}

		//设置tv_change_scan_area
//		setTvChangeScanArea();
//		setSpinner();

	}

	public void setDialog(){
		myDialog = new MyDialog(MipcaActivityCapture.this, R.style.MyDialog, R.layout.dialog_scancode_alert);
		myDialog.setOnKeyListener(new DialogInterface.OnKeyListener() {
			@Override
			public boolean onKey(DialogInterface dialog, int keyCode, KeyEvent event) {
				if (event.getAction() == KeyEvent.ACTION_DOWN) {
					if (keyCode == KeyEvent.KEYCODE_BACK) {
						return true;
					}
				}
				return false;
			}
		});
		myDialog.setMessage("恭喜, 扫码成功");
		myDialog.setYesOnclickListener("确定", new MyDialog.onYesOnclickListener() {
			@Override
			public void onYesOnclick() {
				if (myDialog.isShowing()) {
					myDialog.dismiss();
					myDialog = null;
					MipcaActivityCapture.this.finish();
					mMediaProjectionManager = null;
					//TODO
					//finish的时候, 把扫码得到的内容传回给CollectionWebview

				}
			}
		});
		myDialog.show();
		//要放在show方法之后, 否则不生效
		MyDialog.setDialogSize(myDialog,0.8,0.3);
	}
	//该页面禁止使用返回键


	@Override
	public boolean onKeyDown(int keyCode, KeyEvent event) {
		if (keyCode == KeyEvent.KEYCODE_BACK) {
			return true;
		}
		return super.onKeyDown(keyCode, event);
	}

//	public void setTvChangeScanArea(){
//		tv_change_scan_area = (TextView) findViewById(R.id.tv_change_scan_area);
//		tv_change_scan_area.setOnClickListener(new OnClickListener() {
//			@Override
//			public void onClick(View v) {
//				Log.i("flag","现在的字是什么   "+tv_change_scan_area.getText().toString());
//				if (tv_change_scan_area.getText().toString().equals("扫描条形码")) {
//                    Log.i("flag","现在的字是   "+tv_change_scan_area.getText().toString());
//					tv_change_scan_area.setText(R.string.scan_qr_code);
//                    Log.i("flag","改变之后是:"+tv_change_scan_area.getText().toString());
//
//					MAX_FRAME_HEIGHT = 250;
//					MAX_FRAME_WIDTH = 800;
//					ViewfinderView.isFirst = false;
//					CameraManager.framingRect = null;
//					CameraManager.framingRectInPreview = null;
//					viewfinderView.requestLayout();
//					viewfinderView.invalidate();
//
//				}else {
//                    Log.i("flag","现在的字不是扫描条形码");
//					tv_change_scan_area.setText(R.string.scan_bar_code);
//                    Log.i("flag","改变之后是:"+tv_change_scan_area.getText().toString());
//
//					MAX_FRAME_HEIGHT = 800;
//					MAX_FRAME_WIDTH = 800;
//					ViewfinderView.isFirst = false;
//					CameraManager.framingRect = null;
//					CameraManager.framingRectInPreview = null;
//					viewfinderView.requestLayout();
//					viewfinderView.invalidate();
//				}
//			}
//		});
//	}




//	@SuppressWarnings("ResourceType")//忽略该警告
//	private void setSpinner() {
//		spinner = (Spinner) findViewById(R.id.spinner);
////		String[] data=getResources().getStringArray(R.layout.scan_codes);
//		String[] data = getResources().getStringArray(R.array.spinner_for_scan_codes);
//		//适配器
//		ArrayAdapter<String> adapter=new ArrayAdapter<String>(this, R.layout.scan_codes,R.id.tv_scan_codes, data);
//		//创建适配器
//		spinner.setAdapter(adapter);
//		//设置默认值
////		spinner.setSelection(0);
//		//模式
//		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
//			spinner.setLayoutMode(MODE_PRIVATE);
//		}
//		//设置提示
////		spinner.setPrompt("请选择城市");
//		//监听
//		spinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
//
//			@Override
//			public void onItemSelected(AdapterView<?> parent,//spinner
//									   View view, //条目布局
//									   int position,//选择的数据的位置
//									   long id) { //数据的唯一标识
//
//				//获取某个位置的数据
//				switch (String.valueOf(id)){
//					case "0":
//						Log.i("flag","点的扫描二维码");
////						if (MAX_FRAME_HEIGHT != 800 || MAX_FRAME_WIDTH != 800) {
//							MAX_FRAME_HEIGHT = 800;
//							MAX_FRAME_WIDTH = 800;
//							ViewfinderView.isFirst = false;
//							CameraManager.framingRect = null;
//							CameraManager.framingRectInPreview = null;
//							viewfinderView.requestLayout();
//							viewfinderView.invalidate();
////						}
//
//						break;
//					case "1":
//						Log.i("flag","点的扫描条形码");
//						MAX_FRAME_HEIGHT = 250;
//						MAX_FRAME_WIDTH = 800;
//						ViewfinderView.isFirst = false;
//						CameraManager.framingRect = null;
//						CameraManager.framingRectInPreview = null;
//						viewfinderView.requestLayout();
//						viewfinderView.invalidate();
//
//						break;
//
//					default:
//						break;
//				}
//			}
//
//			@Override
//			public void onNothingSelected(AdapterView<?> parent) {
//				// TODO Auto-generated method stub
//
//			}
//		});
//	}
	SurfaceView surfaceView;
	@Override
	protected void onResume() {
		super.onResume();
		Log.i("flag", "MIP CAMERA ACTIVITY  onResume============================" );
		surfaceView = (SurfaceView) findViewById(R.id.preview_view);
		SurfaceHolder surfaceHolder = surfaceView.getHolder();
		if (hasSurface) {
			Log.i("flag", "hasSurface============================" );
			initCamera(surfaceHolder);
		} else {
			Log.i("flag", "hasSurface  else ============================" );
			surfaceHolder.addCallback(this);
			surfaceHolder.setType(SurfaceHolder.SURFACE_TYPE_PUSH_BUFFERS);
		}
		decodeFormats = null;
		characterSet = null;

		playBeep = true;
		AudioManager audioService = (AudioManager) getSystemService(AUDIO_SERVICE);
		if (audioService.getRingerMode() != AudioManager.RINGER_MODE_NORMAL) {
			playBeep = false;
		}
		initBeepSound();
		vibrate = true;

	}

	@Override
	protected void onPause() {
		super.onPause();
		if (handler != null) {
			handler.quitSynchronously();
			handler = null;
		}
		CameraManager.get().closeDriver();
	}

	@Override
	protected void onDestroy() {
		inactivityTimer.shutdown();
		if (MAX_FRAME_HEIGHT != 800) {
			MAX_FRAME_HEIGHT = 800;
		}
		SharedPreferences spForScan = getSharedPreferences("scanCode",MODE_PRIVATE);
		if (!spForScan.getString("type","0").equals("0")) {
			spForScan.edit().clear().commit();
		}
		super.onDestroy();
	}

	/**
	 * 处理扫描结果
	 * @param result
//	 * @param barcode
	 */
	MediaProjectionManager mMediaProjectionManager;
	String resultString;
	//之前的DEMO是返回一个图片回去的,但是图片过大会报错.所以这里去掉第二个参数
	public void handleDecode(Result result, Bitmap barcode) {
		inactivityTimer.onActivity();
		resultString = result.getText();
		Log.i("flag","-----------截取前----------" + resultString);

		if (resultString.equals("") || null == resultString) {
			Toast.makeText(MipcaActivityCapture.this, "扫描失败,请重新扫描!", Toast.LENGTH_SHORT).show();
			handler.restartPreviewAndDecode();
		}else if (null != handler) {
			//不加位数判断, 所以把这里注掉
//			if ( resultString.length() != RESULE_LENGTH_EIGHTEEN ) {
//				Toast.makeText(MipcaActivityCapture.this, "扫描结果有误,请重新扫描!", Toast.LENGTH_SHORT).show();
//				handler.restartPreviewAndDecode();
//			}else{


			if (isNetworkConnected(MipcaActivityCapture.this)) {
				CameraManager.get().takephoto();

				Intent resultIntent = new Intent();
				Bundle bundle = new Bundle();
				//正常车架号是17位,如果大于17位,把最后一位截掉
				if (resultString.length() > RESULT_LENGGTH_SEVENTEEN) {

					String newResultString = resultString.substring(0,resultString.length()-1);
					bundle.putString("result", newResultString);
					resultIntent.putExtras(bundle);
					setResult(RESULT_OK,resultIntent);
					Log.i("flag","-------if----截取后----------" + newResultString);
				}else {

					bundle.putString("result", resultString);
					resultIntent.putExtras(bundle);
					setResult(RESULT_OK,resultIntent);
					Log.i("flag","----------- else----------");
				}
			}else {
				Intent resultIntent = new Intent();
				Bundle bundle = new Bundle();
				//正常车架号是17位,如果大于17位,把最后一位截掉
				if (resultString.length() > RESULT_LENGGTH_SEVENTEEN) {

					String newResultString = resultString.substring(0,resultString.length()-1);
					bundle.putString("result", newResultString);
					resultIntent.putExtras(bundle);
					setResult(RESULT_OK,resultIntent);
					Log.i("flag","-------if----截取后----------" + newResultString);
				}else {

					bundle.putString("result", resultString);
					resultIntent.putExtras(bundle);
					setResult(RESULT_OK,resultIntent);
					Log.i("flag","----------- else----------");
				}

				new Thread(new Runnable(){
					@Override
					public void run() {
						HandlerManager.getInstance().sendSuccessMessage();
					}
				}).start();
			}


				//截屏的方式时的代码
//				if (null == scan_photo_path || scan_photo_path.equals("")) {
//					Toast.makeText(MipcaActivityCapture.this, "二维码截图路径为空!", Toast.LENGTH_SHORT).show();
//					return;
//				}else if( null != scan_photo_path && !scan_photo_path.equals("")){
	// 				截屏
	//				if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
	//					mMediaProjectionManager = (MediaProjectionManager) getSystemService(Context.MEDIA_PROJECTION_SERVICE);
	//					startActivityForResult(mMediaProjectionManager.createScreenCaptureIntent(), 1111);
	//				}
// }

//			}
		}
	}

	public static boolean isNetworkConnected(Context context) {
		//这个类主要用来查询判断网络连接信息。
		ConnectivityManager cm = (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
		NetworkInfo network = cm.getActiveNetworkInfo();
		if (network != null) {
			return network.isConnected();
		}
		return false;
	}

	private void initCamera(SurfaceHolder surfaceHolder) {
		Log.d("flag", "initCamera============================" );
		try {
			CameraManager.get().openDriver(surfaceHolder);
		} catch (IOException ioe) {
			return;
		} catch (RuntimeException e) {
			return;
		}
		if (handler == null) {
			handler = new CaptureActivityHandler(this, decodeFormats, characterSet);
		}
	}

	@Override
	public void surfaceChanged(SurfaceHolder holder, int format, int width,
							   int height) {

	}

	@Override
	public void surfaceCreated(SurfaceHolder holder) {
		Log.i("flag","surfaceCreated=================");
		if (!hasSurface) {
			hasSurface = true;
			initCamera(holder);
		}

	}

	@Override
	public void surfaceDestroyed(SurfaceHolder holder) {
		hasSurface = false;

	}

	public ViewfinderView getViewfinderView() {
		return viewfinderView;
	}

	public Handler getHandler() {
		return handler;
	}

	public void drawViewfinder() {
		viewfinderView.drawViewfinder();

	}

	private void initBeepSound() {
		if (playBeep && mediaPlayer == null) {
			// The volume on STREAM_SYSTEM is not adjustable, and users found it
			// too loud,
			// so we now play on the music stream.
			setVolumeControlStream(AudioManager.STREAM_MUSIC);
			mediaPlayer = new MediaPlayer();
			mediaPlayer.setAudioStreamType(AudioManager.STREAM_MUSIC);
			mediaPlayer.setOnCompletionListener(beepListener);

			AssetFileDescriptor file = getResources().openRawResourceFd(
					R.raw.beep);
			try {
				mediaPlayer.setDataSource(file.getFileDescriptor(),
						file.getStartOffset(), file.getLength());
				file.close();
				mediaPlayer.setVolume(BEEP_VOLUME, BEEP_VOLUME);
				mediaPlayer.prepare();
			} catch (IOException e) {
				mediaPlayer = null;
			}
		}
	}

	private static final long VIBRATE_DURATION = 200L;

	private void playBeepSoundAndVibrate() {
		if (playBeep && mediaPlayer != null) {
			mediaPlayer.start();
		}
		if (vibrate) {
			Vibrator vibrator = (Vibrator) getSystemService(VIBRATOR_SERVICE);
			vibrator.vibrate(VIBRATE_DURATION);
		}
	}

	/**
	 * When the beep has finished playing, rewind to queue up another one.
	 */
	private final OnCompletionListener beepListener = new OnCompletionListener() {
		public void onCompletion(MediaPlayer mediaPlayer) {
			mediaPlayer.seekTo(0);
		}
	};

	/**
	 * 切换散光灯状态
	 */
	public void toggleFlashLight() {
		if (flashLightOpen) {
			setFlashLightOpen(false);
		} else {
			setFlashLightOpen(true);
		}
	}

	/**
	 * 设置闪光灯是否打开
	 * @param open
	 */
	public void setFlashLightOpen(boolean open) {
		if (flashLightOpen == open){
			return;
		}

		flashLightOpen = !flashLightOpen;
		CameraManager.get().setFlashLight(open);
	}
	Bitmap captureBitmap;
	@Override
	protected void onActivityResult(int requestCode, int resultCode, Intent data) {
		super.onActivityResult(requestCode, resultCode, data);
//		采用截屏方式的代码
//		if (requestCode == 1111) {
//			if (resultCode != Activity.RESULT_OK) {
//				Toast.makeText(this, "用户取消了", Toast.LENGTH_SHORT).show();
//				return;
//			}
//
//			captureBitmap = PhoneUtils.captureSurfaceview(surfaceView,mMediaProjectionManager,resultCode,data,MipcaActivityCapture.this);
//			if (null != captureBitmap) {
//				Intent resultIntent = new Intent();
//				Bundle bundle = new Bundle();
//				if (resultString.length() == RESULE_LENGTH_EIGHTEEN) {
//					String newResultString = resultString.substring(0,resultString.length()-2);
//					bundle.putString("result", newResultString);
//				}else{
//					bundle.putString("result", resultString);
//				}
//
//				if (!new File(scan_photo_path).exists()){
//					new File(scan_photo_path).mkdir();
//				}
//				String fileName = System.currentTimeMillis()+".jpg";
//				BitmapUtils.saveBitmapTofile(captureBitmap,scan_photo_path + fileName);
//				bundle.putString("scan_codes_photo_path", scan_photo_path + fileName);
//
//				resultIntent.putExtras(bundle);
//				setResult(RESULT_OK, resultIntent);
//				MipcaActivityCapture.this.finish();
//
//				mMediaProjectionManager = null;
//
//			}
//
//		}
	}

}