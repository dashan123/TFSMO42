package cn.com.cloud9.common;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.PixelFormat;
import android.graphics.Point;
import android.hardware.Camera;
import android.hardware.Camera.CameraInfo;
import android.hardware.Camera.PictureCallback;
import android.hardware.Camera.Size;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.os.Message;
import android.provider.Settings.SettingNotFoundException;
import android.text.format.DateFormat;
import android.util.Log;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.OrientationEventListener;
import android.view.SurfaceHolder;
import android.view.SurfaceHolder.Callback;
import android.view.SurfaceView;
import android.view.View;
import android.view.View.OnTouchListener;
import android.view.WindowManager;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.SeekBar;
import android.widget.TextView;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Calendar;
import java.util.List;

import cn.com.cloud9.tfsmo.android42.R;
import cn.com.cloud9.util.Base64Util;
import cn.com.cloud9.util.CameraUtils;

public class MyCameraActivity extends Activity {

	private String phototype=null;

	private Camera camera;
	//点击屏幕时聚焦  拍照瞬间聚焦
	private SeekBar cameraSeekBar;
	private int maxZoom;

	private SurfaceView surfaceView;
	private int camera_id = 0;
	private IOrientationEventListener iOriListener;

	private final int SUCCESS = 233;
	private final int PHOTO_OK = 234;
	SnapHandler handler = new SnapHandler();

	int camera_direction = CameraInfo.CAMERA_FACING_BACK; // 摄像头方向

	private Camera.Parameters parameters;
	private ImageView iv_flash;
	private TextView tv_cancel;
	private TextView tv_confirm;
	private TextView tv_seekbar_hint;
	private PictureCallback picCallBack;
	private ImageView iv_shutter;
	private ImageView switch_camera;
	private View myTopBar;
	private Thread saveThread;

	//liang du
	private int lightNumBefore;
	private int lightModeBefore;

	private Handler myHandler = new Handler(new Handler.Callback() {
		@Override
		public boolean handleMessage(Message msg) {
			switch (msg.what){
				case PHOTO_OK:

					break;

				default:

					break;
			}


			return false;
		}
	});

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		// TODO Auto-generated method stub
		super.onCreate(savedInstanceState);
		this.getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
				WindowManager.LayoutParams.FLAG_FULLSCREEN);

		setContentView(R.layout.activity_my_camera);

//		Log.d("flag", "自定义相机的 oncreate");
		//设置打开相机后屏幕高亮
//		setSysLight();

		//如果是自拍，在这里通过SP获取FLAG
		//如果有此FLAG，在surfaceCreated里就直接打开前置摄像头，否则执行之前的代码

		initView();

		initListener();

	}

	public void startThread(final byte[] picByteArray){

		saveThread = new Thread(new Runnable(){
			@Override
			public void run() {

				// TODO Auto-generated method stub
				String state=Environment.getExternalStorageState();
				String path=Environment.getExternalStorageDirectory().getAbsolutePath()+File.separator+"taskPhoto"+File.separator;
//				Log.d("flag", "state="+state);
//				Log.d("flag", "path="+path);

				File dir = new File(path);
				if(!dir.exists())
				{
					dir.mkdirs();// 创建文件夹
				}
				String name = DateFormat.format("yyyyMMdd_hhmmss",Calendar.getInstance()) + ".jpg";
				File f = new File(path +name);
				if(!f.exists())
				{
					try {
						f.createNewFile();
					} catch (IOException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
				}
				else {
//					Log.d("flag", "f.exists="+false);
				}
				FileOutputStream outputStream;
				try {
//					Log.d("flag", "f="+f.toString());
					outputStream = new FileOutputStream(f);
					outputStream.write(picByteArray); // 写入sd卡中
					outputStream.close(); // 关闭输出流
				} catch (FileNotFoundException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				} // 文件输出流
				catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}

				SharedPreferences spForPicPath = getSharedPreferences("picPath", MODE_PRIVATE);
				SharedPreferences.Editor edit = spForPicPath.edit();
				edit.putString("imgPath",f.toString());
//				Log.i("flag","f.toString())＝＝＝====="+f.toString());
				edit.commit();

//				Log.d("flag", "store success");
				handler.sendEmptyMessage(SUCCESS);

			}
		});
	}

	private void initView() {
		cameraSeekBar = (SeekBar) findViewById(R.id.camera_SeekBar);
		cameraSeekBar.setProgress(0);
		tv_seekbar_hint = (TextView) findViewById(R.id.tv_seekbar_hint);

		surfaceView = (SurfaceView) this.findViewById(R.id.surfaceView_main);
		iv_flash = (ImageView) findViewById(R.id.top_bar_camera_light);
		tv_cancel=(TextView) findViewById(R.id.tv_cancel);
		tv_confirm=(TextView) findViewById(R.id.tv_confirm);
		iv_shutter=(ImageView) findViewById(R.id.ib_shutter);
		switch_camera=(ImageView) findViewById(R.id.top_bar_switch_camera);
		myTopBar=findViewById(R.id.camera_header_bar);
		iOriListener = new IOrientationEventListener(this);

		picCallBack = new PictureCallback() {
			@Override
			public void onPictureTaken(byte[] data, Camera camera) {
				// TODO Auto-generated method stub
//				Log.d("flag", "onPictureTaken-----zhao wan le >>>.......");

				final byte[] picByteArray = data;
				startThread(picByteArray);
				//启动存储照片的线程
				saveThread.start();
			}
		};
	}

	public void initListener(){
		//
		surfaceView.setOnTouchListener(new OnTouchListener() {

			@Override
			public boolean onTouch(View v, MotionEvent event) {
				// TODO Auto-generated method stub

				camera.cancelAutoFocus();
				camera.autoFocus(new Camera.AutoFocusCallback() {
					@Override
					public void onAutoFocus(boolean success, Camera camera) {
						if (success) {

//							ToastUtils.shortToast(getApplicationContext(), "对焦 成功");
						}else {
//							ToastUtils.shortToast(getApplicationContext(), "对焦 失败");
						}
					}
				});
				//此处设置点击屏幕手动聚焦.camera.autofocus()...
				//但会与自动聚焦发生冲突, 完善中.

				return false;
			}
		});

		surfaceView.getHolder().setKeepScreenOn(true);// 屏幕常亮
		surfaceView.getHolder().addCallback(new Callback() {

			@Override
			public void surfaceCreated(SurfaceHolder holder) {
				// TODO Auto-generated method stub
				int mNumberOfCameras = Camera.getNumberOfCameras();
//				Log.i("flag","surfaceCreated---------------------------");
				// Find the ID of the default camera
				CameraInfo cameraInfo = new CameraInfo();

				//如果是自拍，就打开前置摄像头
				//打开前置摄像头以后需要设置闪光灯为不可见
				//另外现在有switch切换时，需要两次才能切换摄像头的BUG
//				if (true) {
//					for (int i = 0; i < mNumberOfCameras; i++) {
//						Camera.getCameraInfo(i, cameraInfo);
//						if (cameraInfo.facing == CameraInfo.CAMERA_FACING_FRONT) {
//							camera_id = i;
//						}
//					}
//					camera = Camera.open(camera_id);
//					try {
////					camera.stopPreview();
//						camera.setPreviewDisplay(holder);
//						camera.startPreview(); // 开始预览
//
//						iOriListener.enable();
//
//					} catch (IOException e) {
//						// TODO Auto-generated catch block
//						e.printStackTrace();
//					}
//				}else{
					for (int i = 0; i < mNumberOfCameras; i++) {
						Camera.getCameraInfo(i, cameraInfo);
						if (cameraInfo.facing == CameraInfo.CAMERA_FACING_BACK) {
							camera_id = i;
						}
					}
					camera = Camera.open(camera_id);
					try {
//					camera.stopPreview();
						camera.setPreviewDisplay(holder);
						camera.startPreview(); // 开始预览

						iOriListener.enable();

					} catch (IOException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
//				}
			}

			@Override
			public void surfaceChanged(SurfaceHolder holder, int format, int width, int height) {
				// TODO Auto-generated method stub
				//设置参数
				Log.i("flag","surfaceChanged");
				Point fullScreenSize = CameraUtils.getFullScreenSize(getApplicationContext());
				setCameraParasAndDisplay(fullScreenSize.x, fullScreenSize.y);
				//如果用 surfaceview 的宽高, 那么导航栏和状态栏的高度不会被计算进去,导致宽高比不准确,和list的里的对不上
//				setCameraParasAndDisplay(width, height);

			}

			@Override
			public void surfaceDestroyed(SurfaceHolder holder) {
				// TODO Auto-generated method stub
				Log.i("flag","surfaceDestroyed---------------------------");
				if (null != camera) {
					camera.stopPreview();
					camera.release();
//					camera = null;
				}

			}

		});// 为SurfaceView的句柄添加一个回调函数

		//seekbar
		cameraSeekBar.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
			@Override
			public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
//				Log.i("flag","onProgressChanged=================================");
				parameters = camera.getParameters();
				parameters.setZoom(progress);

				//设置照片竖屏显示，否则webview里全是横着的
				parameters.set("orientation", "portrait");
				parameters.set("rotation", 90);
				if (camera_direction == CameraInfo.CAMERA_FACING_FRONT) {
					parameters.set("rotation", 270);
				}
				parameters.setJpegQuality(100); // 设置照片质量
				parameters.setPictureFormat(PixelFormat.JPEG); // 设置图片格式
				// 先判断是否支持，否则会报错
				if (parameters.getSupportedFocusModes().contains(Camera.Parameters.FOCUS_MODE_AUTO)) {
//					parameters.setFocusMode(Camera.Parameters.FOCUS_MODE_CONTINUOUS_PICTURE);
					parameters.setFocusMode(Camera.Parameters.FOCUS_MODE_AUTO);
				}
				camera.cancelAutoFocus();// 只有加上了这一句，才会自动对焦。
				camera.autoFocus(new Camera.AutoFocusCallback() {
					@Override
					public void onAutoFocus(boolean success, Camera camera) {

					}
				});
				camera.setDisplayOrientation(90);
				camera.setParameters(parameters);

			}

			@Override
			public void onStartTrackingTouch(SeekBar seekBar) {

			}

			@Override
			public void onStopTrackingTouch(SeekBar seekBar) {

			}
		});
	}

	public void onClick(View view) {

		switch (view.getId()) {
			case R.id.top_bar_camera_light:

//			Log.d("flag", "切换闪光灯了");
				if (parameters.getFlashMode().equals("off")) {
					if (parameters != null) {
						parameters.setFlashMode(parameters.FLASH_MODE_TORCH);
					} else {
//						Log.d("flag", "paramas为空");
					}
					camera.setParameters(parameters);
					iv_flash.setImageResource(R.drawable.btn_camera_light_off);
				} else if (parameters.getFlashMode().equals("torch")) {
					// 还有torch模式
					// Log.d("flag", "flashMode= "+parameters.getFlashMode());
					if (parameters != null) {
						parameters.setFlashMode(parameters.FLASH_MODE_OFF);
//					Log.d("flag", "parameters.getFlashMode() == auto==现在设置为== "+parameters.getFlashMode());

					} else {
//						Log.d("flag", "paramas为空");
					}
					camera.setParameters(parameters);
					iv_flash.setImageResource(R.drawable.btn_camera_light);
//				Log.d("flag", "if (parameters.getFlashMode().equals(auto))===这时设为OFF===" + parameters.getFlashMode());
				}else {
//					Log.d("flag", "不是OFF也不是AUTO");
				}
//			Log.d("flag", "flashmode=" + parameters.getFlashMode());

				break;

			case R.id.ib_shutter:

				// 拍照
				camera.takePicture(null, null, picCallBack);
				iv_shutter.setClickable(false);
//				tv_cancel.setText(R.string.text_cancel);
				tv_cancel.setVisibility(View.INVISIBLE);
				tv_cancel.setClickable(false);
				myTopBar.setVisibility(View.INVISIBLE);
				iv_shutter.setVisibility(View.INVISIBLE);
//				tv_confirm.setVisibility(View.VISIBLE);
//				tv_confirm.setClickable(true);

				break;

			case R.id.tv_cancel:

				// 取消
				if (tv_cancel.getText().equals("返回")) {
					finish();
				} else {
					iv_shutter.setClickable(true);
					iv_shutter.setVisibility(View.VISIBLE);
					tv_cancel.setText(R.string.text_return);
					tv_confirm.setVisibility(View.INVISIBLE);
					tv_confirm.setClickable(false);
					// holder.setType(SurfaceHolder.SURFACE_TYPE_PUSH_BUFFERS);
					camera.stopPreview();
					camera.startPreview();
					myTopBar.setVisibility(View.VISIBLE);
				}

				//点取消时删除上传过的照片
				try {
					SharedPreferences spForPicPath = getSharedPreferences("picPath", MODE_PRIVATE);
					String imgPath = spForPicPath.getString("imgPath",null);
					if (imgPath != null) {
						File file = new File(imgPath);
						file.delete();
					}
				} catch (Exception ex) {
//				ToastUtils.shortToast(ctx, "文件删除失败");
				}

				break;

			case R.id.tv_confirm:

				tv_confirm.setClickable(false);
//				camera.stopPreview();
//				// 确认
//				try {
//					camera.setPreviewDisplay(surfaceView.getHolder());
//					camera.startPreview();
//				} catch (IOException e) {
//					// TODO Auto-generated catch block
//					e.printStackTrace();
//				}
//				if (tv_confirm.getVisibility()==View.VISIBLE) {
//					tv_confirm.setVisibility(View.INVISIBLE);
//				}
//				if (iv_shutter.getVisibility()==View.INVISIBLE) {
//					iv_shutter.setVisibility(View.VISIBLE);
//					iv_shutter.setClickable(true);
//				}
//				if (tv_cancel.getText().equals("取消")) {
//					tv_cancel.setText(R.string.text_return);
//				}
//				myTopBar.setVisibility(View.VISIBLE);

				//返回数据


				SharedPreferences sp = getSharedPreferences("picPath", MODE_PRIVATE);
				String imgPath = sp.getString("imgPath",null);
//				phototype = sp.getString("phototype",null);

				int quality = (int) (sp.getFloat("quality", 0) * 100);
				if (quality <= 0 || quality > 100) {
					quality = 70;
				}

				if (imgPath != null) {
//					Log.i("flag","666");
					StringBuffer b64 = new StringBuffer();
//					Log.i("flag","imgPath＝＝＝＝＝＝＝＝＝＝＝＝＝"+imgPath);
					b64.append(Base64Util.fileToBase64(imgPath, quality,getApplicationContext()));

					SharedPreferences spForPathB64 = getSharedPreferences("b64ForPath", MODE_PRIVATE);
					SharedPreferences.Editor edit = spForPathB64.edit();
					edit.putString("b64Path",b64.toString());
//					Log.i("flag","b64.toString()＝＝＝"+b64.toString());
					edit.commit();

					if (b64.toString() != null) {
//						Log.i("flag","================================================");
							finish();
					}else{
//						Log.i("flag","这里b64应该是空===="+b64.toString());
					}

				}else {
//					ToastUtils.shortToast(this,"path为空");
				}

//				finish();

				break;

			case R.id.top_bar_switch_camera:

				if (iv_flash.getVisibility()==View.VISIBLE) {
					iv_flash.setVisibility(view.INVISIBLE);
				}else{
					iv_flash.setVisibility(View.VISIBLE);
				}

				if (camera_direction == CameraInfo.CAMERA_FACING_BACK) {
					camera_direction = CameraInfo.CAMERA_FACING_FRONT;
				} else {
					camera_direction = CameraInfo.CAMERA_FACING_BACK;
				}
				int mNumberOfCameras = Camera.getNumberOfCameras();
				CameraInfo cameraInfo = new CameraInfo();
				for (int i = 0; i < mNumberOfCameras; i++) {
					Camera.getCameraInfo(i, cameraInfo);
					if (cameraInfo.facing == camera_direction) {
						camera_id = i;
					}
				}
				if (null != camera) {
					camera.stopPreview();
					camera.release();
				}
				camera = Camera.open(camera_id);
				try {
					camera.setPreviewDisplay(surfaceView.getHolder());
					camera.startPreview();
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				//前置不要缩放功能
				if (camera_direction == CameraInfo.CAMERA_FACING_FRONT){
					cameraSeekBar.setVisibility(View.GONE);
				}else{
					cameraSeekBar.setVisibility(View.VISIBLE);
				}
				break;

			default:
				break;
		}

		Point fullScreenSize = CameraUtils.getFullScreenSize(getApplicationContext());
		setCameraParasAndDisplay(fullScreenSize.x, fullScreenSize.y);
		Log.d("flag","onclick---------------------="+fullScreenSize.x+"    y="+fullScreenSize.y);
//		setCameraParasAndDisplay(surfaceView.getWidth(), surfaceView.getHeight());
	}

	@Override
	protected void onResume() {
		// TODO Auto-generated method stub
		super.onResume();
//		setSysLight();
//		Log.d("flag", "自定义相机的 onResume");
		try {
			//0手动
			// 获取系统亮度模式 0手动  1自动
//			lightModeBefore=android.provider.Settings.System.getInt(getContentResolver(), android.provider.Settings.System.SCREEN_BRIGHTNESS_MODE);
			//设置系统亮度模式
//			Log.d("flag", "lightmodebefore======="+lightModeBefore);
			if (lightModeBefore==1) {
				android.provider.Settings.System.putInt(getContentResolver(), android.provider.Settings.System.SCREEN_BRIGHTNESS_MODE,0);
			}
//			lightNumBefore = android.provider.Settings.System.getInt(getContentResolver(), android.provider.Settings.System.SCREEN_BRIGHTNESS);
			// 设置系统亮度范围在0-255之间
			if (lightNumBefore!=200) {
				android.provider.Settings.System.putInt(getContentResolver(), android.provider.Settings.System.SCREEN_BRIGHTNESS,200);
			}

		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	@Override
	protected void onStart() {
		super.onStart();
//		Log.d("flag", "自定义相机的 onStart");
	}

	@Override
	protected void onStop() {
		// TODO Auto-generated method stub
		super.onStop();
//		setSysLight2();

//		Log.d("flag", "onStop");
	}
	@Override
	protected void onDestroy() {
		// TODO Auto-generated method stub
		super.onDestroy();
		this.iOriListener.disable();
		Log.d("flag", "自定义相机的 onDestroy");

//					camera.stopPreview();
//					camera.release();
//					camera = null;


//		setSysLight2();
	}

	public class IOrientationEventListener extends OrientationEventListener {

		private int mCurrentNormalizedOrientation;

		public IOrientationEventListener(Context context) {
			super(context);
			// TODO Auto-generated constructor stub
		}

		@Override
		public void onOrientationChanged(int orientation) {
			if (orientation != ORIENTATION_UNKNOWN) {
				mCurrentNormalizedOrientation = normalize(orientation);
			}



			// TODO Auto-generated method stub
//			if (ORIENTATION_UNKNOWN == orientation) {
//				return;
//			}
//			CameraInfo info = new CameraInfo();
//			Camera.getCameraInfo(camera_id, info);
//			orientation = (orientation + 45) / 90 * 90;
//			int rotation = 0;
//			if (info.facing == CameraInfo.CAMERA_FACING_FRONT) {
//				rotation = (info.orientation - orientation + 360) % 360;
//			} else {
//				rotation = (info.orientation + orientation) % 360;
//			}
//
//			if (null != camera) {
//				parameters = camera.getParameters();
//				parameters.setRotation(rotation);
//				camera.setParameters(parameters);
//			}

		}

		private int normalize(int degrees) {
			if (degrees > 315 || degrees <= 45) {
				return 0;
			}

			if (degrees > 45 && degrees <= 135) {
				return 90;
			}

			if (degrees > 135 && degrees <= 225) {
				return 180;
			}

			if (degrees > 225 && degrees <= 315) {
				return 270;
			}

			throw new RuntimeException("The physics as we know them are no more. Watch out for anomalies.");
		}

	}

	public void setCameraParasAndDisplay(int width, int height) {
		parameters = camera.getParameters();
		//设置照片竖屏显示，否则webview里全是横着的
		parameters.set("orientation", "portrait");
		parameters.set("rotation", 90);
		if (camera_direction == CameraInfo.CAMERA_FACING_FRONT) {
			parameters.set("rotation", 270);
		}
		if (camera_direction == CameraInfo.CAMERA_FACING_BACK) {
			tv_seekbar_hint.setVisibility(View.VISIBLE);
		}else {
			tv_seekbar_hint.setVisibility(View.GONE);
		}
		parameters.setJpegQuality(100); // 设置照片质量
		parameters.setPictureFormat(PixelFormat.JPEG); // 设置图片格式
		maxZoom = parameters.getMaxZoom();
		cameraSeekBar.setMax(maxZoom);


		if (Build.VERSION.SDK_INT < 28) {
			/* 获取摄像头支持的PictureSize列表 */
			List<Size> pictureSizeList = parameters.getSupportedPictureSizes();
			/* 从列表中选取合适的分辨率 */
			Size picSize = CameraUtils.getProperSize(pictureSizeList, ((float) width) / height);
			if (null != picSize) {
				parameters.setPictureSize(picSize.width, picSize.height);
			} else {
				picSize = parameters.getPictureSize();
			}
			/* 获取摄像头支持的PreviewSize列表 */
			List<Size> previewSizeList = parameters.getSupportedPreviewSizes();
			Size preSize = CameraUtils.getProperPreViewSize(previewSizeList, ((float) width) / height);
			if (null != preSize) {
				parameters.setPreviewSize(preSize.width, preSize.height);
			}else{
				preSize = parameters.getPreviewSize();
			}

			/* 根据选出的PictureSize重新设置SurfaceView大小 */
			float w = picSize.width;
			float h = picSize.height;
			surfaceView.setLayoutParams(new RelativeLayout.LayoutParams((int) (height * (w / h)), height));
		}

		// 先判断是否支持，否则会报错
		if (parameters.getSupportedFocusModes().contains(Camera.Parameters.FOCUS_MODE_AUTO)) {
//			parameters.setFocusMode(Camera.Parameters.FOCUS_MODE_CONTINUOUS_PICTURE);
			parameters.setFocusMode(Camera.Parameters.FOCUS_MODE_AUTO);
		}
		camera.cancelAutoFocus();// 只有加上了这一句，才会自动对焦。
		camera.setDisplayOrientation(90);
		camera.setParameters(parameters);
	}



	//打开相机时设置系统亮度模式
	public void setSysLight(){
		try {
			//获取亮度
			lightNumBefore = android.provider.Settings.System.getInt(getContentResolver(), android.provider.Settings.System.SCREEN_BRIGHTNESS);

			// 获取系统亮度模式 0手动  1自动
			lightModeBefore=android.provider.Settings.System.getInt(getContentResolver(), android.provider.Settings.System.SCREEN_BRIGHTNESS_MODE);
//			Log.d("flag", "lightmodebefore======="+lightModeBefore);
			//设置系统亮度模式
			if (lightModeBefore==1) {
				android.provider.Settings.System.putInt(getContentResolver(), android.provider.Settings.System.SCREEN_BRIGHTNESS_MODE,0);
			}

			// 设置系统亮度范围在0-255之间
			if (lightNumBefore!=180) {
				android.provider.Settings.System.putInt(getContentResolver(), android.provider.Settings.System.SCREEN_BRIGHTNESS,180);
			}
		} catch (SettingNotFoundException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
	}

	//关闭相机时恢复亮度
	public void setSysLight2(){
		try {
			// 获取系统亮度模式 0手动  1自动
			if (lightModeBefore==1) {
//				Log.d("flag", "lightmodebefore======="+lightModeBefore);
				android.provider.Settings.System.putInt(getContentResolver(), android.provider.Settings.System.SCREEN_BRIGHTNESS_MODE,1);
			}else{
				// 设置系统亮度
				android.provider.Settings.System.putInt(getContentResolver(), android.provider.Settings.System.SCREEN_BRIGHTNESS,lightNumBefore);
			}
		} catch (Exception e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
	}

	class SnapHandler extends Handler {

		@Override
		public void handleMessage(Message msg) {
			// TODO Auto-generated method stub
			super.handleMessage(msg);
			if (msg.what == SUCCESS) {
				Log.d("flag", "==================================照片已存储到testcamera文件夹");
				if (tv_confirm != null) {
					tv_confirm.setVisibility(View.VISIBLE);
					tv_confirm.setClickable(true);

					tv_cancel.setText(R.string.text_cancel);
					tv_cancel.setVisibility(View.VISIBLE);
					tv_cancel.setClickable(true);
				}
//				Toast.makeText(MyCameraActivity.this, "照片存储至testcamera文件夹", Toast.LENGTH_SHORT).show();
//				Log.d("flag", "照片已存储到testcamera文件夹");
			}
		}

	}

	@Override
	public boolean onKeyDown(int keyCode, KeyEvent event) {
		// TODO Auto-generated method stub
		if (keyCode == KeyEvent.KEYCODE_BACK) {
			showDialog(2);
			return true;
		}
		return super.onKeyDown(keyCode, event);
	}

}
