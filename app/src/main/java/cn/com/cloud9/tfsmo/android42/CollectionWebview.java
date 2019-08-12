package cn.com.cloud9.tfsmo.android42;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.AlertDialog.Builder;
import android.app.Dialog;
import android.app.DownloadManager;
import android.app.Notification;
import android.content.BroadcastReceiver;
import android.content.ContentValues;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.content.SharedPreferences.Editor;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.Bitmap.Config;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.graphics.Rect;
import android.location.Address;
import android.location.Geocoder;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.os.Message;
import android.provider.MediaStore;
import android.telephony.TelephonyManager;
import android.util.Base64;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.Display;
import android.view.KeyEvent;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MotionEvent;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup.LayoutParams;
import android.view.ViewTreeObserver;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.GeolocationPermissions;
import android.webkit.JavascriptInterface;
import android.webkit.JsResult;
import android.webkit.URLUtil;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebStorage;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.ImageView;
import android.widget.ImageView.ScaleType;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.RadioButton;
import android.widget.RelativeLayout;
import android.widget.ScrollView;
import android.widget.Toast;

import com.amap.api.maps.model.LatLng;
//import com.lidroid.xutils.BitmapUtils;
import com.example.twobarcodes.MipcaActivityCapture;
import com.jph.takephoto.app.TakePhoto;
import com.jph.takephoto.app.TakePhotoImpl;
import com.jph.takephoto.model.InvokeParam;
import com.jph.takephoto.model.TContextWrap;
import com.jph.takephoto.model.TImage;
import com.jph.takephoto.model.TResult;
import com.jph.takephoto.permission.InvokeListener;
import com.jph.takephoto.permission.PermissionManager;
import com.jph.takephoto.permission.TakePhotoInvocationHandler;
import com.lzy.okgo.OkGo;
import com.lzy.okgo.callback.StringCallback;
import com.nostra13.universalimageloader.core.DisplayImageOptions;
import com.nostra13.universalimageloader.core.ImageLoader;

import org.xutils.ex.DbException;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLEncoder;
import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import cn.com.cloud9.common.AmLocationDb;
import cn.com.cloud9.common.AmLocationEntity;
import cn.com.cloud9.common.AmLocationService;
import cn.com.cloud9.common.LogService;
import cn.com.cloud9.common.MyCameraActivity;
import cn.com.cloud9.javabean.B64ListString;
import cn.com.cloud9.javabean.B64ListStringImage;
import cn.com.cloud9.service.DaemonService;
import cn.com.cloud9.switchLayout.OnViewChangeListener;
import cn.com.cloud9.switchLayout.SwitchLayout;
import cn.com.cloud9.util.AMapUtil;
import cn.com.cloud9.util.Base64Util;
import cn.com.cloud9.util.CustomHelper;
import cn.com.cloud9.util.DBUtil;
import cn.com.cloud9.util.LogUtils;
import cn.com.cloud9.util.MailUtil;
import cn.com.cloud9.util.PhoneUtil;
import cn.com.cloud9.util.SDCardHelper;
import cn.com.cloud9.util.ToastUtils;
import cn.com.cloud9.util.ViewUtils;
import cn.jpush.android.api.BasicPushNotificationBuilder;
import cn.jpush.android.api.JPushInterface;
import cn.jpush.android.api.TagAliasCallback;
import okhttp3.Call;
import okhttp3.Response;
import uk.co.senab.photoview.PhotoView;

//import HttpUtils.PhotoViewAttacher;
//import uk.co.senab.photoview.PhotoView;
//import uk.co.senab.photoview.PhotoViewAttacher;

//关于android2.3中javascript交互的问题
public class CollectionWebview extends Activity implements TakePhoto.TakeResultListener,InvokeListener {

	private String phototype=null;

    private final static int SCANNIN_GREQUEST_CODE = 5000;
	private final int SHOW_PIC = 0011;
	private final int DISMIS_DIALOG = 0012;
	private final int NEW_URL = 0013;
	private final int BIG_PIC = 0014;
	private final int IMG_HTTP = 0015;

	private final int SET_JPUSH_ALIAS = 0100;
	private final int MSG_SET_ALIAS = 0101;

	private WebView webView = null;
	private Boolean isFirstIn = false;
	private Context ctx = CollectionWebview.this;
	private Dialog loadingDialog;
	private Dialog nonetDialog;
	private boolean waitBool = false;

	String latitudeStr;
	String longitudeStr;
	private float myspeed;
	String amaplat;
	String amaplog;

	//scrollview用
	private int eleHeight;
	private int usableHeightPrevious;
	private ScrollView scrollView;

	// 查看大图自定义控件
	private ImageView imageViewBigPic;
	private int screenWidth = 0;
	private int screenHeight = 0;
	private BufferedInputStream bis = null;

	private String totalUrlString;
	private String totalUrlString_Collection;
	private int picIndex;
	private PhotoView photoview_main;

	// photoView
	// private PhotoView photoView = null;
	private ImageLoader loader;
	private DisplayImageOptions imageOptions;
	private float maxScale;
	private RelativeLayout layout;

	// 定位
	private String provider;
	private LocationManager locationManager;
	private Location currentLocation;
	private String locationAdreass;
	private Double latitude;
	private Double longitude;
	// getLastKnownLocation定位的监听

	private Bitmap bitmap = null;
	// private Bitmap bitmapBase64 = null;
	private Button button;

	private int backtime = 0;
	private int showimageid = 1;
	private int waitTime = 0;
	private Dialog downloadialog;
	private String fileName = "";
	private String dirName = "";

	private static final int ITEM1 = Menu.FIRST;
	private static final int ITEM2 = Menu.FIRST + 1;
	private static final int ITEM3 = Menu.FIRST + 2;
	public static boolean downbool = false;
	private String intenttittleStr = "";

	private ProgressBar _ProgressBar01;
	private boolean firstresume = true;
	public static CollectionWebview instance = null;

	SwitchLayout switchLayout;// 自定义的控件
	LinearLayout linearLayout;
	int mViewCount;// 自定义控件中子控件的个数
	ImageView mImageView[];// 底部的imageView
	int mCurSel;// 当前选中的imageView
	boolean firststart = true;
	boolean newurlBool = false;

	private long lastDownloadId = 0; // 系统下载id

	@SuppressLint("JavascriptInterface")
	public void onCreate(Bundle savedInstanceState) {
		getTakePhoto();
		super.onCreate(savedInstanceState);
		LogUtils.i("onCreate");
		requestWindowFeature(Window.FEATURE_NO_TITLE);
		setContentView(R.layout.main);

		instance = this;

		//软键盘弹出时,WEBVIEW界面上移
//		getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE |
//				WindowManager.LayoutParams.SOFT_INPUT_STATE_HIDDEN);

		//导航栏
//		getWindow().addFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_NAVIGATION);//B


		// MODE_PRIVATE：为默认操作模式,代表该文件是私有数据,只能被应用本身访问,在该模式下,写入的内容会覆盖原文件的内容
		SharedPreferences sp = instance.getSharedPreferences("SP", MODE_PRIVATE);
		isFirstIn = sp.getBoolean("isFirstIn", true);

		// 注册系统下载监听
		registerReceiver(downloadReceiver, new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE));
		// 注册网络状态变更监听
		registerReceiver(networkChangeReceiver, new IntentFilter("android.net.conn.CONNECTIVITY_CHANGE"));
		// 注册位置定位服务监听
		registerReceiver(locationReceiver, new IntentFilter(AmLocationService.BROADCAST_ACTION));

		webView = (WebView) findViewById(R.id.webview);

		loadingDialog = new Dialog(instance, R.style.Transparent);

//		WindowManager.LayoutParams lp = loadingDialog.getWindow().getAttributes();
//		lp.windowAnimations=R.style.Transparent;

		// 把本类的一个实例添加到js的全局对象window中，
		// 这样就可以使用window.call来调用它的方法
		webView.addJavascriptInterface(new InJavaScript(), "call");

		// 设置支持JavaScript脚本
		WebSettings webSettings = webView.getSettings();
		webSettings.setJavaScriptEnabled(true);
		// 设置可以访问文件
		webSettings.setAllowFileAccess(true);
		// 设置支持缩放
		webSettings.setBuiltInZoomControls(false);
		webSettings.setSupportZoom(false);

		webSettings.setDatabaseEnabled(true);
		String dir = this.getApplicationContext().getDir("database", Context.MODE_PRIVATE).getPath();
		webSettings.setDatabasePath(dir);

		// 使用localStorage则必须打开
		webSettings.setDomStorageEnabled(true);
		webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);
		webSettings.setAppCacheMaxSize(5 * 1024 * 1024);
		webSettings.setAllowFileAccess(true);
		webSettings.setAppCacheEnabled(true);
		webSettings.setGeolocationEnabled(true);

		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN)//API4.1
			webView.getSettings().setAllowUniversalAccessFromFileURLs(true);

		//5.0以上, 同步cookie的操作已经可以自动同步、但前提是我们必须开启第三方cookie的支持。
		//如果不开启, 服务端会一直报"用户身份异常, 请重新登陆"的错误
		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
			CookieManager.getInstance().setAcceptThirdPartyCookies(webView,true);
		}

		// 查看大图
		button = (Button) findViewById(R.id.button_back_bigpic);
		// viewPagerVisible=(ViewPager) findViewById(R.id.viewpager_invisible);

		layout = (RelativeLayout) findViewById(R.id.relativelayout_main);

		if (isFirstIn) {
			Editor editor = sp.edit();
			editor.putBoolean("isFirstIn", false);
			editor.commit();
			// http://1.202.156.132/tfsmo/app/main.html#login_page"
			webView.loadUrl("file:///android_asset/www/main.html");
		} else {
			webView.loadUrl("file:///android_asset/www/main.html");
		}

		notifyThread.start();

		// fileDown("http://117.22.253.69:8090/ycoa/page/download/download.jsp?fileName=20130114101602198.doc");

		Intent intent = getIntent();

		if (intent.hasExtra("message")) {

			// messgae改为message
			String intentStr = intent.getStringExtra("message");
			if (intentStr.length() != 0) {
				newurlBool = true;
				intenttittleStr = "javascript:messageGoto('" + intentStr + "')";
			} else {
				// 386行.......messgae
				// LogUtils.d("flag" + "intentStr.length=" +
				// intentStr.length());
			}
		} else {
			// LogUtils.d("flag" + "intent.hasExtra(message)=" +
			// (intent.hasExtra("message")));
		}

		// 设置WebViewClient
		webView.setWebViewClient(new WebViewClient() {

			public boolean shouldOverrideUrlLoading(WebView view, String url) {
				if (url.startsWith("tel:")) {
					Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
					startActivity(intent);
					return true;
				}
				view.loadUrl(url);
				return true;
			}

			public void onPageStarted(WebView view, String url, Bitmap favicon) {
				super.onPageStarted(view, url, favicon);

				if (firststart) {
					loadingDialog.setContentView(R.layout.loading);
					loadingDialog.setCancelable(false);
					loadingDialog.show();

					waitBool = true;
					loadThread.start();
//					loadingDialog.setOnKeyListener(new DialogInterface.OnKeyListener() {
//						public boolean onKey(DialogInterface dialog, int keyCode, KeyEvent event) {
//							if (keyCode == KeyEvent.KEYCODE_BACK) {
//								String title = "退出";
//								String text = "是否退出系统？";
//								quitApplication(title, text);
//								;
//								return true;
//							} else {
//								return false;
//							}
//						}
//					});
					firststart = false;
				}
			}

			public void onPageFinished(WebView view, String url) {
				super.onPageFinished(view, url);
				waitBool = false;
				waitTime = 100000;
				if (!isConnect(CollectionWebview.this)) {
					nonetdialog();
				}
			}

			// 当网页加载资源过程中发现SSL错误会调用此方法。
			// 我们应用程序必须做出响应，是取消请求handler.cancel(),还是继续请求handler.proceed();内核的默认行为是handler.cancel();
			// SSL错误，证书出现错误
			@Override
			public void onReceivedSslError(WebView view, android.webkit.SslErrorHandler handler,
										   android.net.http.SslError error) { // 重写此方法可以让webview处理https请求
				handler.proceed();
			}

		});

		// WebChromeClient是辅助WebView处理Javascript的对话框，网站图标，网站title，加载进度等
		webView.setWebChromeClient(new WebChromeClient() {
			// 处理javascript中的alert
			// 用onJsAlert来输出javascript方法的信息
			public boolean onJsAlert(WebView view, String url, String message, final JsResult result) {
				// 构建一个Builder来显示网页中的对话框
				Builder builder = new Builder(CollectionWebview.this);
				builder.setTitle(R.string.js_alert);
				builder.setMessage(message);
				builder.setPositiveButton(android.R.string.ok, new AlertDialog.OnClickListener() {
					public void onClick(DialogInterface dialog, int which) {
						result.confirm();
					}
				});
				builder.setCancelable(false);
				builder.create();
				builder.show();
				return true;
			}

			// 处理javascript中的confirm
			public boolean onJsConfirm(WebView view, String url, String message, final JsResult result) {
				Builder builder = new Builder(CollectionWebview.this);
				builder.setTitle(R.string.js_confirm);
				builder.setMessage(message);
				builder.setPositiveButton(android.R.string.ok, new AlertDialog.OnClickListener() {
					public void onClick(DialogInterface dialog, int which) {
						result.confirm();
					}
				});
				builder.setNegativeButton(android.R.string.cancel, new DialogInterface.OnClickListener() {
					public void onClick(DialogInterface dialog, int which) {
						result.cancel();
					}
				});
				builder.setCancelable(false);
				builder.create();
				builder.show();
				return true;
			}

			@Override
			// 设置网页加载的进度条
			public void onProgressChanged(WebView view, int newProgress) {
				CollectionWebview.this.getWindow().setFeatureInt(Window.FEATURE_PROGRESS, newProgress * 100);
				super.onProgressChanged(view, newProgress);
			}

			// 设置应用程序的标题title
			public void onReceivedTitle(WebView view, String title) {
				CollectionWebview.this.setTitle(title);
				super.onReceivedTitle(view, title);
			}

			public void onExceededDatabaseQuota(String url, String databaseIdentifier, long currentQuota,
												long estimatedSize, long totalUsedQuota, WebStorage.QuotaUpdater quotaUpdater) {
				quotaUpdater.updateQuota(estimatedSize * 2);
			}

			public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
				callback.invoke(origin, true, false);
				super.onGeolocationPermissionsShowPrompt(origin, callback);
			}

			public void onReachedMaxAppCacheSize(long spaceNeeded, long totalUsedQuota,
												 WebStorage.QuotaUpdater quotaUpdater) {
				quotaUpdater.updateQuota(spaceNeeded * 2);
			}
		});
		// 覆盖默认后退按钮的作用，替换成WebView里的查看历史页面
		webView.setOnKeyListener(new View.OnKeyListener() {
			public boolean onKey(View v, int keyCode, KeyEvent event) {
				if (event.getAction() == KeyEvent.ACTION_DOWN) {
					if ((keyCode == KeyEvent.KEYCODE_BACK) && webView.canGoBack()) {
						webView.goBack();
						return true;
					}
				}
				return false;
			}
		});

		startService(new Intent(instance, DaemonService.class));//守护进程

		scrollView = (ScrollView) findViewById(R.id.scrollview_main);
		//获取输入框的Y值
		webView.setOnTouchListener(new View.OnTouchListener() {
			@Override
			public boolean onTouch(View v, MotionEvent event) {
				eleHeight = (int) event.getY();
				((WebView)v).requestDisallowInterceptTouchEvent(true);
				return false;
			}
		});
		//键盘弹起时scrollview上移
		webView.getViewTreeObserver().addOnGlobalLayoutListener(new ViewTreeObserver.OnGlobalLayoutListener() {
			@Override
			public void onGlobalLayout() {
				possiblyResizeChildOfContent();
			}
		});

		//启动打印日志服务
		startLogService();

		//设置状态栏颜色
		ViewUtils.setStatusBarColour(CollectionWebview.this,getResources().getColor(R.color.status_bar));

		//takephoto帮助类
		customHelper = CustomHelper.of(R.layout.main);
	}

	private String b64Path = "";
	@Override
	protected void onResume() {
		super.onResume();
		//判断uriPath是否为空，决定是否与JS交互
		SharedPreferences spForPath = getSharedPreferences("b64ForPath", MODE_PRIVATE);
		b64Path = spForPath.getString("b64Path", null);
		if (null!=b64Path && !b64Path.equals("")) {
			SharedPreferences sp = getSharedPreferences("camera", MODE_PRIVATE);
			phototype = sp.getString("phototype",null);

			if (webView != null) {
				runOnUiThread(	new Runnable() {
					@Override
					public void run() {
						if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
							if (phototype != null) {
								webView.evaluateJavascript("javascript:onCameraDone('" + b64Path + "','" + phototype + "')", null);
							} else {
//								ToastUtils.longToast(ctx, "传递的参数不能为空");
							}
						} else {
							if (phototype!=null) {
								webView.loadUrl("javascript:onCameraDone('" + b64Path + "','"+ phototype + "')");
							}else {
//								ToastUtils.longToast(ctx, "传递的参数不能为空");
							}
						}
					}
				});

			}else {
//				ToastUtils.shortToast(ctx,"webview为空");
			}

			//删除上传过的照片
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

			getSharedPreferences("b64ForPath", MODE_PRIVATE).edit().putString("b64Path","").commit();
		}
		LogUtils.i("-----------onResume");
	}

	protected void onNewIntent(Intent intent) {
		super.onNewIntent(intent);
		setIntent(intent);
		// 把messgae改成了message
		if (intent.hasExtra("message")) {

			String intentStr = intent.getStringExtra("message");
			if (intentStr.length() != 0) {

				newurlBool = true;
				String messageGotoStr = "javascript:messageGoto('" + intentStr + "')";
				webView.loadUrl(messageGotoStr);
			}
		}
	}

	public boolean showdialog(String content, String tittle) {

		// showselect=false;
		// 用来构建一个消息提醒的对话框
		Builder builder = new Builder(ctx);
		builder.setTitle(tittle) // 标题
				.setCancelable(true) // 响应back按钮
				.setMessage(content) // 对话框显示内容
				// 设置按钮
				.setPositiveButton("确定", new DialogInterface.OnClickListener() {
					public void onClick(DialogInterface dialog, int which) {

					}
				});
		// 创建Dialog对象
		builder.create().show();
		return true;
	}

	public boolean dispatchKeyEvent(KeyEvent event) {

		if (event.getKeyCode() == KeyEvent.KEYCODE_BACK) {
			if (event.getAction() == KeyEvent.ACTION_DOWN && event.getRepeatCount() == 0) {
				// 服务器设置页面
				if (webView.getUrl().indexOf("main.html#server_config_page") > 0) {
					runOnUiThread(new Runnable() {
						public void run() {
							webView.loadUrl("javascript:goto_page('login_page')");
						}
					});
					return true;
				}
				// 登录页面及首页提示退出，其他页面返回首页
				// portal_page首页
				if ((webView.canGoBack()) && (webView.getUrl().indexOf("main.html#portal_page") == -1)
						&& (webView.getUrl().indexOf("main.html#login_page") == -1)) {
					runOnUiThread(new Runnable() {

						public void run() {
							webView.loadUrl("javascript:goto_page('portal_page')");
						}
					});

				} else {
					new Builder(this).setTitle(R.string.exit).setMessage(R.string.exit_msg)
							.setIcon(R.drawable.question)
							.setNegativeButton(R.string.cancel, new DialogInterface.OnClickListener() {

								public void onClick(DialogInterface dialog, int which) {
								}
							}).setPositiveButton(R.string.exit, new DialogInterface.OnClickListener() {
						public void onClick(DialogInterface dialog, int whichButton) {
							finish();
						}
					}).show();
				}
			}
			return true;
		}
		return super.dispatchKeyEvent(event);
	}

	Builder builder=null;
	public void nonetdialog() {
		// showselect=false;

		if (builder==null) {
			builder= new Builder(CollectionWebview.this);
			builder.setTitle("提示!") // 标题
					.setIcon(R.drawable.wlan) // icon
					.setCancelable(false) // 响应back按钮
					.setMessage("对不起, 没有可用的网络, 请检查您的网络连接!") // 对话框显示内容
					// 设置按钮
					.setPositiveButton("确定", new DialogInterface.OnClickListener() {
						public void onClick(DialogInterface dialog, int which) {
//							finish();
						}
					});
			// 创建Dialog对象
			builder.create().show();
		}
	}

	// fileDown文件下载
	public void fileDown(String url) {
		synchronized (this) {
			if (downbool)
				return;
			downbool = true;
		}

		// LayoutInflater是用来找res/layout/下的xml布局文件
		LayoutInflater factory = LayoutInflater.from(CollectionWebview.this);
		final View textEntryView = factory.inflate(R.layout.downloaddialog, null);

		Builder alertbuilder = new Builder(CollectionWebview.this);
		_ProgressBar01 = (ProgressBar) textEntryView.findViewById(R.id.ProgressBar01);

		alertbuilder.setTitle("下载中").setCancelable(false).setView(textEntryView);
		downloadialog = alertbuilder.create();
		downloadialog.show();

		downloadialog.setOnKeyListener(new DialogInterface.OnKeyListener() {
			public boolean onKey(DialogInterface dialog, int keyCode, KeyEvent event) {
				if (keyCode == KeyEvent.KEYCODE_BACK && backtime == 0) {
					String title = "停止下载";
					String text = "是否停止下载？";
					stopdownload(title, text);
					backtime++;
					return true;
				} else {
					return false;
				}
			}
		});

		fileName = getFilename(url);

		_ProgressBar01.setProgress(0);

		// 要下载的文件路径
		String urlDownload = "";
		urlDownload = url;
		// 获得存储卡路径，构成 保存文件的目标路径

		dirName = Environment.getExternalStorageDirectory() + "/tfsmo/Download/";
		File f = new File(dirName);
		if (!f.exists()) {
			f.mkdir();
		}

		// 启动文件下载线程
		new FileDownloader(urlDownload, dirName, fileName, myHandler).start();

	}

	private Handler myHandler = new Handler() {
		public void handleMessage(Message msg) {
			if (!downloadialog.isShowing()) {
				return;
			}
			// 获得进度，该进度由实际的操作进行通知。这里负责对通知进行处理
			int progress = msg.arg1;
			// 错误处理
			if (progress < 0) {
				downloadialog.dismiss();
				ToastUtils.shortToast(instance, "发生错误");
				return;
			}
			// 设置进度条的当前位置
			_ProgressBar01.setProgress(progress);
			if (progress >= 100) {
				ToastUtils.shortToast(instance, "下载成功");
				downloadialog.dismiss();

				Intent intent = new Intent("android.intent.action.VIEW");
				intent.addCategory("android.intent.category.DEFAULT");
				intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
				Uri uri = Uri.fromFile(new File(dirName + fileName));
				String type = FileUtil.getMIMEType(fileName);
				intent.setDataAndType(uri, type);
				try {
					startActivity(intent);
				} catch (Exception e) {
					ToastUtils.shortToast(instance, "由于尚未安装相关应用，无法打开该文件！");
				}
			}
		}

		;
	};

	private final TagAliasCallback mAliasCallback = new TagAliasCallback() {
		@Override
		public void gotResult(int code, String alias, Set<String> tags) {
			String logs ;
			switch (code) {
				case 0:
					logs = "success to set alias=============================";
					// 建议这里往 SharePreference 里写一个成功设置的状态。成功设置一次后，以后不必再次设置了。
					SharedPreferences spForJpushAlias = getSharedPreferences("Alias",MODE_PRIVATE);
					spForJpushAlias.edit().putString("alias",alias).commit();
					break;
				case 6002:
					logs = "Failed to set alias 60 seconds retry=============================";
					Log.i("flag", logs);
					// 延迟 60 秒来调用 Handler 设置别名
					mHandler.sendMessageDelayed(mHandler.obtainMessage(SET_JPUSH_ALIAS, alias), 1000 * 60);
					break;
				default:
					logs = "Failed with errorCode ============================= " + code;
			}
//			ToastUtils.shortToast(getApplicationContext(),logs);
		}
	};

	public String getFilename(String url) {

		return url.substring(url.lastIndexOf("/") + 1);
	}

	public static boolean isConnect(Context context) {

		// 获取手机所有连接管理对象（包括对wi-fi,net等连接的管理）
		try {
			// 主要管理和网络连接相关的操作
			ConnectivityManager connectivity = (ConnectivityManager) context
					.getSystemService(Context.CONNECTIVITY_SERVICE);
			if (connectivity != null) {

				// 获取网络连接管理的对象
				NetworkInfo info = connectivity.getActiveNetworkInfo();
				if (info != null && info.isConnected()) {
					// 判断当前网络是否已经连接
					if (info.getState() == NetworkInfo.State.CONNECTED) {
						return true;
					}
				}
			}
		} catch (Exception e) {
			// TODO: handle exception
		}
		return false;
	}

	public void onDestroy() {
		super.onDestroy();
		LogUtils.i("-----------onDestroy");
		// unregisterReceiver(receiver); //取消监听

		// 取消系统下载监听
		unregisterReceiver(downloadReceiver);
		// 取消网络状态变更监听
		unregisterReceiver(networkChangeReceiver);
		// 取消位置服务监听
		unregisterReceiver(locationReceiver);

		stopLogService();//关闭日志服务

	}

	private TakePhoto takePhoto;
	private InvokeParam invokeParam;
	private CustomHelper customHelper;
	private StringBuffer b64StrSplit = null;
	@Override
	protected void onSaveInstanceState(Bundle outState) {
		getTakePhoto().onSaveInstanceState(outState);
		super.onSaveInstanceState(outState);
		LogUtils.i("onSaveInstanceState");
	}

	@Override
	protected void onRestoreInstanceState(Bundle savedInstanceState) {
		super.onRestoreInstanceState(savedInstanceState);
		LogUtils.i("onRestoreInstanceState");
	}

	public TakePhoto getTakePhoto(){
		if (takePhoto==null){
			takePhoto= (TakePhoto) TakePhotoInvocationHandler.of(this).bind(new TakePhotoImpl(this,this));
		}
		return takePhoto;
	}

	@Override
	public void takeSuccess(TResult result) {
		ArrayList<TImage> images = result.getImages();
		String compressPath = images.get(0).getCompressPath();

		b64StrSplit = new StringBuffer();
		for (int i = 0; i < images.size(); i++) {
			b64StrSplit.append(Base64Util.fileToBase64(images.get(i).getCompressPath(), 100, instance));
			if (i < images.size()-1){
				b64StrSplit.append("@");
			}
		}

		if (webView != null) {
			if (!"".equals(b64StrSplit) && null != phototype) {
				runOnUiThread(new Runnable() {
					@Override
					public void run() {
						if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
							webView.evaluateJavascript("javascript:onCameraDone('" + b64StrSplit +  "','" + phototype + "')", null);
						}else{
							webView.loadUrl("javascript:onCameraDone('" + b64StrSplit +  "','" + phototype + "')");
						}
						//隐藏对话框
//                	ProgressDialogUtil.dismiss();
					}
				});
			}
			b64StrSplit = null;
		}
	}

	@Override
	public void takeFail(TResult result, String msg) {

	}

	@Override
	public void takeCancel() {

	}

	@Override
	public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
		super.onRequestPermissionsResult(requestCode, permissions, grantResults);
		//以下代码为处理Android6.0、7.0动态权限所需
		PermissionManager.TPermissionType type=PermissionManager.onRequestPermissionsResult(requestCode,permissions,grantResults);
		PermissionManager.handlePermissionsResult(this,type,invokeParam,this);
	}

	@Override
	public PermissionManager.TPermissionType invoke(InvokeParam invokeParam) {
		PermissionManager.TPermissionType type=PermissionManager.checkPermission(TContextWrap.of(this),invokeParam.getMethod());
		if(PermissionManager.TPermissionType.WAIT.equals(type)){
			this.invokeParam=invokeParam;
		}
		Log.i("flag","-----------------------type="+type);
		return type;
	}

    private String scanPhotoPath;
	final class InJavaScript {
		@JavascriptInterface
		public void quitApp(final String title, final String text) {
			quitApplication(title, text);
		}

        @JavascriptInterface
        // 扫描二维码
        public void scan_QR_code(String type,String s) {
            Intent scanintent = new Intent();
            scanintent.setClass(instance, MipcaActivityCapture.class);
            scanintent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
            scanintent.putExtra("type",type);
//		scanintent.putExtra("path",Environment.getExternalStorageDirectory().getAbsolutePath()+File.separator+"taskPhoto"+File.separator);
            startActivityForResult(scanintent, SCANNIN_GREQUEST_CODE);
        }

        @JavascriptInterface
        // 扫描条形码
        public void Scanning_Barcode(String type,String s) {
            Intent scanintent = new Intent();
            scanintent.setClass(instance, MipcaActivityCapture.class);
            scanintent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
            scanintent.putExtra("type",type);
//		scanintent.putExtra("path",Environment.getExternalStorageDirectory().getAbsolutePath()+File.separator+"taskPhoto"+File.separator);
            startActivityForResult(scanintent, SCANNIN_GREQUEST_CODE);
        }

		@JavascriptInterface
		public void setJPushAlias(String alias) {
			if (getSharedPreferences("Alias",MODE_PRIVATE).getString("alias",null) == null || getSharedPreferences("Alias",MODE_PRIVATE).getString("alias",null) .equals("")) {
				setJPushAlias_(alias);
				LogUtils.i("--------------------------------SP里没有，从新设置alias=");
			}
			LogUtils.i("--------------------------------alias="+alias);
		}

		@JavascriptInterface
		public void openDocument(final String documentURL) {
			getPdfFileIntent(documentURL);
		}

		@JavascriptInterface
		// 版本更新
		public void updateVersion(String urlStr) {
			Intent myIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(urlStr));
			startActivity(myIntent);

		}

		@JavascriptInterface
		private void getPdfFileIntent(String param) {
			// 根据用户的数据打开相应的ACTIVITY
			Intent intent = new Intent("android.intent.action.VIEW");
			intent.addCategory("android.intent.category.DEFAULT");
			intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
			Uri localUri = Uri.fromFile(new File(param));
			intent.setDataAndType(localUri, "application/msword");
			startActivity(intent);
			// return intent;
		}

		@JavascriptInterface
		// 手机标识
		public String getIMEI() {
			String imei = ((TelephonyManager) getSystemService(TELEPHONY_SERVICE)).getDeviceId();
			return imei;
		}

		@JavascriptInterface
		// takephoto
		public void imagepicker(String type, int limit) {
			if (null != type) {
				phototype = type;
				SharedPreferences sp = getSharedPreferences("camera", MODE_PRIVATE);
				Editor edit = sp.edit();
				edit.putString("phototype",phototype);
				edit.commit();
			}
			customHelper.onClick(limit,takePhoto);
		}

		@JavascriptInterface
		// 调用拨打电话
		public void callPhone(String phoneNumber) {
			Intent intent = new Intent(Intent.ACTION_DIAL);
			intent.setData(Uri.parse("tel:" + phoneNumber));
			// resolveActivity查询是否有符合条件的ACTIVITY
			// getPackageManager获得已安装的应用程序信息
			if (intent.resolveActivity(getPackageManager()) != null) {
				startActivity(intent);
			}
		}

		@JavascriptInterface
		// 打开邮件客户端
		public void openMail(String mailAddress) {
			Intent data = new Intent(Intent.ACTION_SENDTO);
			data.setData(Uri.parse("mailto:" + mailAddress));
			data.putExtra(Intent.EXTRA_SUBJECT, "");
			data.putExtra(Intent.EXTRA_TEXT, "");
			startActivity(data);
		}

		@JavascriptInterface
		// 下载文件
		public void startDownload(String url) {
			// fileDown(url);
			fileDownSys(url);
		}

		@JavascriptInterface
		//上传日志文件
		public void uploadLogFile(){
			String str = Environment.getExternalStorageDirectory().getAbsolutePath() + File.separator + "trajectoryLog/"+"trajectoryLog.txt";
			OkGo.post("http://192.168.1.107:8080/TestServlet001/servlet/TestServlet001")
					.tag(this)
					.isMultipart(true)
					.params("file1",new File(str))
					.execute(new StringCallback() {
						@Override
						public void onSuccess(String s, Call call, Response response) {
							Log.i("flag","上传成功了");
						}

						@Override
						public void onError(Call call, Response response, Exception e) {
							super.onError(call, response, e);
							Log.i("flag","上传失败了"+e.getMessage());
						}

						@Override
						public void downloadProgress(long currentSize, long totalSize, float progress, long networkSpeed) {
							super.downloadProgress(currentSize, totalSize, progress, networkSpeed);
							Log.i("flag","progress    "+progress);
						}
					});
		}

		@JavascriptInterface
		// 清除缓存
		public void clearCache() {
			Log.i("flag","clearCache    ");
			deleteDatabase("webview.db");
			deleteDatabase("webviewCache.db");

			//删除日志文件
			deleteLogs();
			//上传日志文件
//			uploadLogFile();
//			isServiceConnected();
		}

		@JavascriptInterface
		// 检测网络状态
		public boolean isNetworkConnected() {
			return PhoneUtil.isNetworkConnected(getApplicationContext());
		}

		@JavascriptInterface
		// 检测GPS状态
		public boolean isGpsServiceRunning() {
			return PhoneUtil.isGpsOpen(getApplicationContext());
		}

		@JavascriptInterface
		// 检测高德地图的连接状态
		public boolean isAmapConnected() {
			boolean isServiceOpen = PhoneUtil.isServiceRunning(getApplicationContext(),AmLocationService.class.getName());
			if (isServiceOpen) {
//				ToastUtils.longToast(ctx,"高德服务连接中");
				return true;
			}else{
//				ToastUtils.longToast(ctx,"高德服务断开中");
				return false;
			}
		}

//		boolean isServiceOpen = false;
//		@JavascriptInterface
		// 检测高德地图的连接状态
//		public boolean isServiceConnected() {
//			OkGo.get("http://192.168.1.107:8080/TestServlet001/servlet/TestServlet001")     // 请求方式和请求url
//					.tag(this)                       // 请求的 tag, 主要用于取消对应的请求
//					.execute(new StringCallback() {
//						@Override
//						public void onSuccess(String s, Call call, Response response) {
//							// s 即为所需要的结果
//							isServiceOpen = true;
//						}
//
//						@Override
//						public void onError(Call call, Response response, Exception e) {
//							isServiceOpen = false;
//						}
//					});
//
//			ToastUtils.longToast(ctx,"与服务器连接状态是："+isServiceOpen);
//			return isServiceOpen;
//
//		}

		@JavascriptInterface
		// 发短信
		// SOS调用此方法发送短信
		public void sendSMS(String phoneNumber, String message) {
			String newPhoneNumber = null;
			if (phoneNumber !=null) {
				if ("".equals(phoneNumber)) {
					ToastUtils.longToast(ctx,"对不起,无有效的电话号码!");
					newPhoneNumber=phoneNumber;
					Uri smsToUri = null;
					smsToUri = Uri.parse("smsto:" + newPhoneNumber);
					Intent intent = new Intent(Intent.ACTION_SENDTO, smsToUri);
					intent.putExtra("sms_body", message);
					startActivity(intent);
				}
				else if (phoneNumber.contains("@")){
					newPhoneNumber = phoneNumber.replace("@", ",");
					Uri smsToUri = null;
					smsToUri = Uri.parse("smsto:" + newPhoneNumber);
					Intent intent = new Intent(Intent.ACTION_SENDTO, smsToUri);
					intent.putExtra("sms_body", message);
					startActivity(intent);
				}else{
					newPhoneNumber=phoneNumber;
					Uri smsToUri = null;
					smsToUri = Uri.parse("smsto:" + newPhoneNumber);
					Intent intent = new Intent(Intent.ACTION_SENDTO, smsToUri);
					intent.putExtra("sms_body", message);
					startActivity(intent);
				}
			}
		}

		@JavascriptInterface
		// 发邮件
		public boolean sendMail(String smtp, String port, String account, String password, String from, String to,
								String subject, String body) {
			return MailUtil.sendMail(smtp, port, account, password, from, to, subject, body);
		}

		private Location getLastKnownLocation() {
			locationManager = (LocationManager)getApplicationContext().getSystemService(LOCATION_SERVICE);
			List<String> providers = locationManager.getProviders(true);
			Location bestLocation = null;
			for (String provider : providers) {
				Location location = locationManager.getLastKnownLocation(provider);
				if (location == null) {
					continue;
				}
				if (bestLocation == null || location.getAccuracy() < bestLocation.getAccuracy()) {
					// Found best last known location: %s", l);
					bestLocation = location;
				}
			}
			return bestLocation;
		}
		@JavascriptInterface
		// 获取定位信息
		public void onLocationBegin() {
			// 获取的是位置服务
			String serviceString = getApplicationContext().LOCATION_SERVICE;
			// 获取LocationManager对象
			if (locationManager==null) {
				locationManager = (LocationManager) getSystemService(serviceString);
			}
			boolean isGPSopen = locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER);
//			 添加权限后，指定使用GPS获取定位
			String gpsProvider = locationManager.GPS_PROVIDER;

			// 获取当前位置信息
			if (!isGPSopen) {
				ToastUtils.longToast(instance, "请打开GPS定位并重试");
//				Intent intentGPS = new Intent();
//				intentGPS.setAction(android.provider.Settings.ACTION_LOCATION_SOURCE_SETTINGS);
//				startActivity(intentGPS);
//				return;
			}
//////////////////////////// 获取不到GPS Provider////////////////////////////////////////////////

			LocationListener locationListenerGPS = new LocationListener() {
				@Override
				public void onLocationChanged(Location location) {
					if (location != null) {
						LogUtils.i("GPS监听里   onLocationChanged   "+location);
						currentLocation=location;
						latitude=location.getLatitude();
						longitude=location.getLongitude();
					}
				}

				@Override
				public void onStatusChanged(String provider, int status, Bundle extras) {
					LogUtils.i("onStatusChanged   "+provider);
				}

				@Override
				public void onProviderEnabled(String provider) {
					LogUtils.i("onProviderEnabled   "+provider);
				}

				@Override
				public void onProviderDisabled(String provider) {
					LogUtils.i("onProviderDisabled   "+provider);
				}
			};
			locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER,1000, 0,locationListenerGPS);
			currentLocation = locationManager.getLastKnownLocation(gpsProvider);

			if (currentLocation!=null) {
				latitude = currentLocation.getLatitude();
				longitude = currentLocation.getLongitude();// 经度
				myspeed = currentLocation.getSpeed();

				DecimalFormat decimalFormat = new DecimalFormat("0.000000");
				latitudeStr = decimalFormat.format(latitude);
				longitudeStr = decimalFormat.format(longitude);
				if (currentLocation.getAccuracy()!=5.0) {
					currentLocation.setAccuracy(5.0f);
				}

				//将手机硬件获取到的坐标点转化为高德坐标系的点
				LatLng newlatLng = AMapUtil.trunsformLatLng(ctx, latitudeStr, longitudeStr);
				//将已经转化为高德的点的经纬度裁减为6位
				if (newlatLng!=null) {
					amaplat = decimalFormat.format(newlatLng.latitude);
					amaplog = decimalFormat.format(newlatLng.longitude);
				}
			}
			if (latitude==null&&currentLocation==null) {
				runOnUiThread(new Runnable() {
					@Override
					public void run() {
						if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
							webView.evaluateJavascript("javascript:onLocationDone('" + null + "','" + null + "','" + null + "','" + null +"')",null);
							if (locationManager != null) {
								locationManager = null;
							}
						} else {
							webView.loadUrl("javascript:onLocationDone('" + null + "','" + null + "','" + null + "','" + null + "')");
							if (locationManager != null) {
								locationManager = null;
							}
						}
					}
				});
				//currentLocation一直为空时, 返回
				return;
			}

			// 获取街道地址
			Geocoder gc = new Geocoder(getApplicationContext(), Locale.getDefault());
			List<Address> locationList = null;
			try {
				locationList = gc.getFromLocation(Double.parseDouble(amaplat), Double.parseDouble(amaplog), 1);
				if (!PhoneUtil.isNetworkConnected(ctx)) {
					ToastUtils.longToast(ctx,"请检查您的网络连接!");
				}
				if (locationList == null || locationList.size() == 0) {
					runOnUiThread(new Runnable() {
						@Override
						public void run() {
							if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
								webView.evaluateJavascript("javascript:onLocationDone('" + amaplat + "','" + amaplog + "','" + null + "','" + null + "')",null);
							} else {
								webView.loadUrl("javascript:onLocationDone('" + amaplat + "','" + amaplog + "','" + null + "','" + null + "')");
							}
						}
					});
				} else {
					Address address = locationList.get(0);// 得到Address实例
					String countryName = address.getCountryName();// 得到国家名称，比如：中国
					String locality = address.getLocality();// 得到城市名称，比如：北京市
					String addressLine = null;// 得到周边信息，包括街道等，i=0，得到街道名称
					for (int i = 0; address.getAddressLine(i) != null; i++) {
						addressLine = address.getAddressLine(i);
					}
					locationAdreass = address.getAddressLine(0) + address.getAddressLine(1);

					runOnUiThread(new Runnable() {
						@Override
						public void run() {
							Log.i("flag","public void run()  925");
							if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
								webView.evaluateJavascript("javascript:onLocationDone('" + amaplat + "','" + amaplog + "','" + locationAdreass + "','" + myspeed + "')",null);
							} else {
								webView.loadUrl("javascript:onLocationDone('" + amaplat + "','" + amaplog + "','" + locationAdreass + "','" + myspeed + "')");
							}
						}
					});
				}
			} catch (IOException e) {
				e.printStackTrace();
			}
			if (locationManager!=null) {
				locationManager=null;
			}
		}
		@JavascriptInterface
		// 初始化设定位置服务参数
		public void initLocationService(long minDistance, long minInterval, long lowSpeedInterval,
										long highSpeedInterval, float speedThreshold) {
			SharedPreferences sharedPreferences = getSharedPreferences("location", MODE_PRIVATE);
			Editor editor = sharedPreferences.edit();
			editor.putLong("minDistance", minDistance);
			editor.putLong("minInterval", minInterval);
			editor.putLong("lowSpeedInterval", lowSpeedInterval);
			editor.putLong("highSpeedInterval", highSpeedInterval);
			editor.putFloat("speedThreshold", speedThreshold);
			editor.commit();
		}
		@JavascriptInterface
		// 开启位置服务
		public void startLocationService(String userid, String extra) {
			SharedPreferences sharedPreferences = getSharedPreferences("location", MODE_MULTI_PROCESS);
			Editor editor = sharedPreferences.edit();
			editor.putString("userid", userid);
			editor.putString("extra", extra);
			editor.commit();
			startService(new Intent(getApplicationContext(), AmLocationService.class));

//			//暂时注掉，因为日志中暂时去掉了打印userid功能
//			startLogService();//再次开启日志服务，防止更换账号后ID不变
		}
		@JavascriptInterface
		// 关闭位置服务
		public void stopLocationService() {
			Intent intent = new Intent();
			intent.setAction(AmLocationService.BROADCAST_ACTION);
			intent.putExtra(AmLocationService.BROADCAST_TAG_CMD, AmLocationService.BROADCAST_CMD_STOP);
			sendBroadcast(intent);
		}
		@JavascriptInterface
		// 检测位置服务状态
		// Service后台服务创建时最好都要判断是否存在
		public boolean isLocationServiceRunning() {
			return PhoneUtil.isServiceRunning(getApplicationContext(), AmLocationService.class.getName());
		}
		@JavascriptInterface
		// 获取第一条本地缓存(未上传)的位置信息数据
		public void fetchFirstLocationHistory() {
			try {
				final AmLocationEntity entity = AmLocationDb.getFirstEntity();
				if (webView != null && entity != null) {
					runOnUiThread(new Runnable() {
						@Override
						public void run() {
							if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
//								Log.i("flag","==============onLocationHistoryFetched");
								webView.evaluateJavascript("javascript:onLocationHistoryFetched(" + entity.toParamStringForSave() + ")",null);
							} else {
//								Log.i("flag","==============onLocationHistoryFetched");
								webView.loadUrl("javascript:onLocationHistoryFetched(" + entity.toParamStringForSave() + ")");
							}
						}
					});

				}
			} catch (DbException e) {
				e.printStackTrace();
			}
		}
		@JavascriptInterface
		// 获取最后一条本地缓存(未上传)的位置信息数据
		public void fetchLastLocationHistory() {
			try {
				AmLocationEntity entity = AmLocationDb.getLastEntity();
				if (webView != null && entity != null) {
					webView.loadUrl("javascript:onLocationHistoryFetched(" + entity.toParamStringForSave() + ")");
				}
			} catch (DbException e) {
				e.printStackTrace();
			}
		}
		@JavascriptInterface
		// 删除一条本地缓存的位置信息数据(上传成功后呼叫)
		public void deleteLocationHistory(int id) {
			try {
				AmLocationDb.deleteEntity(id);
			} catch (DbException e) {
				e.printStackTrace();
			}
		}
		@JavascriptInterface
		// 手势密码登录
		public void startGestureLockLogin() {
//			Log.i("flag","startGestureLockLogin");
			startActivityForResult(new Intent(getApplicationContext(), GestureLockLoginActivity.class), 0);
		}
		@JavascriptInterface
		// 手势密码设定
		public void startGestureLockSet(String userid) {
			Intent it = new Intent(getApplicationContext(), GestureLockActivity.class);
			it.putExtra("userid", userid);
			startActivity(it);
		}
		@JavascriptInterface
		// 手势密码清除，清除之前输入一遍旧密码确认
		public void clearGestureLockSet() {
//			Log.i("flag","调用了clearGestureLockSet");

			Intent it = new Intent(getApplicationContext(), GestureLockActivity.class);
			it.putExtra("userid", "");

//			startActivity(it);
			startActivityForResult(it,2);

//			SharedPreferences sharedPreferences = getSharedPreferences("lock", MODE_PRIVATE);
//			Editor editor = sharedPreferences.edit();
//			// 清空共享存储里的所有数据
////			editor.clear();
////			editor.commit();
//
//			final boolean state = isGestureLockSet();
//			Log.i("flag","state===1008==="+state);
//			if (webView != null) {
//				if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
//					if (phototype != null) {
//						Log.i("flag", "--------------gestureState    evaluateJavascript");
//						webView.evaluateJavascript("javascript:gestureState(" + state + ")", null);
//					}
//				} else {
//					if (phototype != null) {
//						Log.i("flag", "---------------gestureState    loadUrl");
//						webView.loadUrl("javascript:gestureState(" + state + ")");
//					}
//				}
//			} else {
//				Log.i("flag","webview为NULL");
//			}
		}
		@JavascriptInterface
		// 检测手势密码设定状态
		public boolean isGestureLockSet() {
			SharedPreferences sharedPreferences = getSharedPreferences("lock", MODE_PRIVATE);
			String password = sharedPreferences.getString("password", null);
//			Log.i("flag","isGestureLockSet   password==="+password);
			if (password != null && !"".equals(password)) {
//				Log.i("flag","return true;");

				return true;
			}
//			Log.i("flag","return false;");
			return false;
		}
		@JavascriptInterface
		// 本地缓存写入
		public void nativeStorageSave(String key, String value) {
			try {
				DBUtil.save(key, value);
			} catch (DbException e) {
				e.printStackTrace();
			}
		}
		@JavascriptInterface
		// 本地缓存读取
		public String nativeStorageLoad(String key) {
			try {
				return DBUtil.load(key);
			} catch (DbException e) {
				e.printStackTrace();
			}
			return "";
		}
		@JavascriptInterface
		// 本地缓存清空
		public void nativeStorageClear() {
			try {
				DBUtil.clear();
			} catch (DbException e) {
				e.printStackTrace();
			}
		}
		@JavascriptInterface
		// 本地缓存(上行数据)写入
		public void addNativeStorageWithFunc(String data, String func) {
			try {
				DBUtil.addFunc(data, func);
			} catch (DbException e) {
				e.printStackTrace();
			}
		}
		@JavascriptInterface
		// 本地缓存(上行数据)读取第一条
		public void fetchFirstNativeStorageWithFunc() {
			try {
				String paramString = DBUtil.fetchFirstFunc();
				if (webView != null) {
					webView.loadUrl("javascript:onNativeStorageWithFuncFetched(" + paramString + ")");
				}
			} catch (DbException e) {
				e.printStackTrace();
			}
		}
		@JavascriptInterface
		// 本地缓存(上行数据)删除
		public void deleteNativeStorageWithFunc(int id) {
			try {
				DBUtil.deleteFunc(id);
			} catch (DbException e) {
				e.printStackTrace();
			}
		}
		@JavascriptInterface
		// 退出
		public void quitApp() {
			finish();
		}
		@JavascriptInterface
		// 设定语言
		public void setSysConfigLang(String lang) {
			PhoneUtil.changeSysLang(getApplicationContext(), lang);
		}
		@JavascriptInterface
		// 显示大图,手势放大缩小
		public void gesturePicture(String image) {
			if (image != null) {
				boolean httpTrue = image.startsWith("http");
				if (httpTrue) {
					// TODO
					Intent intent = new Intent(CollectionWebview.instance, PhotoviewActivity.class);

					intent.putExtra("image", image);

					if (null != totalUrlString) {
						intent.putExtra("urlArray", totalUrlString);
					}

					startActivity(intent);
//					overridePendingTransition(android.R.anim.fade_in, 0);

				}
				else{
					Intent intent = new Intent(CollectionWebview.instance, B64Activity.class);
					// intent.putExtra("image", image);
					if (B64ListStringImage.getInstance().size() != 0) {
						B64ListStringImage.getInstance().clear();
					}
					B64ListStringImage.getInstance().add(image);
					//
					if (null != totalUrlString_Collection) {
						if (B64ListString.getInstance().size() != 0) {
							B64ListString.getInstance().clear();
						}
						B64ListString.getInstance().add(totalUrlString_Collection);

					} else {
						LogUtils.d("totalUrlString_Collection是空的");
					}

					instance.startActivity(intent);
					overridePendingTransition(android.R.anim.fade_in, 0);
				}
			}
		}
		@JavascriptInterface
		public void removeImageObject() {
			LogUtils.d("removeImageObject-----------------");
			if (totalUrlString!=null&&totalUrlString_Collection!=null) {
//				LogUtils.d("两个都不为空-----------------");
				totalUrlString = null;
			}else if (totalUrlString==null&&totalUrlString_Collection!=null){
//				LogUtils.d("totalUrlString为空另一个不为空-----------------");
				totalUrlString_Collection=null;
			}else if (totalUrlString!=null&&totalUrlString_Collection==null) {
//				LogUtils.d("totalUrlString_Collection为空另一个不为空-----------------");
				totalUrlString=null;
			}
		}
		@JavascriptInterface
		// 接收viewpager所用的图片数组的字符串
		public void sendImages(String images) {
//			LogUtils.d("sendImages-----------------");
			if (images.startsWith("http")) {
				totalUrlString = images;
			}else {
				totalUrlString_Collection=images;
			}
		}
		@JavascriptInterface
		public void seecollectionphoto (String image){
//			LogUtils.d("走的催收照片列表");
			if (photoview_main == null) {
				runOnUiThread(new Runnable() {

					@Override
					public void run() {
						// TODO Auto-generated method stub
						photoview_main = (PhotoView) findViewById(R.id.photoview_main);
					}
				});
			} else {
				runOnUiThread(new Runnable() {

					@Override
					public void run() {
						// TODO Auto-generated method stub

						photoview_main = null;
						RelativeLayout.LayoutParams layoutParams = new RelativeLayout.LayoutParams(
								LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT);
						layoutParams.setMargins(0, 150, 0, 0);
						photoview_main = new PhotoView(ctx);
						photoview_main.setScaleType(ScaleType.FIT_CENTER);
						photoview_main.setBackgroundColor(Color.WHITE);

						photoview_main.setLayoutParams(layoutParams);
						photoview_main.setVisibility(View.GONE);
						layout.addView(photoview_main);
					}
				});
			}
			try {
				byte[] bitmapArray = Base64.decode(image, Base64.DEFAULT);
				bitmap = BitmapFactory.decodeByteArray(bitmapArray, 0, bitmapArray.length);

			} catch (Exception e) {
				// TODO: handle exception
				e.printStackTrace();
//				ToastUtils.shortToast(ctx, "图片解析有误");
			}

			if (bitmap != null) {
				// 获取屏幕高宽
				// Display display =
				// getWindowManager().getDefaultDisplay();
				// screenWidth = display.getWidth();
				// screenHeight = display.getHeight();

				Thread thread2 = new Thread(new Runnable() {

					@Override
					public void run() {

						// TODO Auto-generated method stub

						Message imgMessage = Message.obtain();
						imgMessage.what = BIG_PIC;
						mHandler.sendMessage(imgMessage);
					}
				});
				thread2.start();

			}
		}
		// 照相页面图片浏览
		@JavascriptInterface
		public void sendPictures(String picture, int index) {
			if ("".equals(picture) || null == picture){
				return;
			}
			totalUrlString = picture;
			picIndex = index;

			Intent intent = new Intent(CollectionWebview.instance, B64PhotoActivity.class);
			intent.putExtra("index", index);

			if (null != totalUrlString) {
				LogUtils.d("totalUrlString===="+totalUrlString);
				if (B64ListString.getInstance().size() != 0) {
					B64ListString.getInstance().clear();
				}
				B64ListString.getInstance().add(totalUrlString);

			}else {
				LogUtils.d("totalUrlString=null");
			}
			instance.startActivity(intent);
			overridePendingTransition(android.R.anim.fade_in, 0);

		}
		@JavascriptInterface
		// 退出大图模式时移除图片
		public void removeImageView() {

			// TODO
			Thread removeImgThread = new Thread() {
				public void run() {

					mHandler.post(new Runnable() {

						@Override
						public void run() {

							if (photoview_main != null) {
								photoview_main.setVisibility(View.GONE);
								photoview_main = null;
							}
						}
					});
				}
			};
			removeImgThread.start();

		}
		@JavascriptInterface
		// 启动相机
		public void startCamera(float quality,String photoType) {

			Log.i("flag","startCamera");
			phototype=photoType;
			SharedPreferences sharedPreferences = getSharedPreferences("camera", MODE_PRIVATE);
			Editor editor = sharedPreferences.edit();
			editor.putFloat("quality", quality);
			editor.commit();
			// capture 捕捉
			// 创建打开相机应用的意图
			Intent intent = new Intent(CollectionWebview.this, MyCameraActivity.class);
			intent.setFlags(intent.FLAG_ACTIVITY_CLEAR_TOP);

//			//存储照片的URI
			SharedPreferences sp = getSharedPreferences("camera", MODE_PRIVATE);
			Editor edit = sp.edit();
			edit.putString("phototype",phototype);
			edit.commit();

			startActivity(intent);

		}
		@JavascriptInterface
		// 唤起导航
		public void callNavi(String address) {

			// Intent intent = new Intent(OaWebview.this, AmapActivity.class);
			// intent.putExtra("address", address);
			// startActivity(intent);

			// 以下打开高德地图
			if (PhoneUtil.isInstalled(getApplicationContext(), "com.autonavi.minimap")) {
				try {
					String dataUrl = "androidamap://keywordNavi?sourceApplication=tfsmo&keyword="
							+ URLEncoder.encode(address, "utf-8") + "&style=0";
					Intent it = new Intent("android.intent.action.VIEW", Uri.parse(dataUrl));
					it.setPackage("com.autonavi.minimap");
					startActivity(it);
				} catch (UnsupportedEncodingException e) {
					e.printStackTrace();
				}
			} else {
				Uri uri = Uri.parse("market://details?id=com.autonavi.minimap");
				Intent it = new Intent(Intent.ACTION_VIEW, uri);
				startActivity(it);
			}

		}
	}

	Uri photoUri;

	// 回调
	@Override
	protected void onActivityResult(int requestCode, int resultCode, Intent intent) {
//		Log.i("flag","onActivityResult");
		// 0-手势密码
		if (requestCode == 0 && resultCode == Activity.RESULT_OK) {
//			Log.i("flag","if (requestCode == 0 && ....");
			if (webView != null) {
//				Log.i("flag","webView.loadUrl(\"javascript:onGestureLockLogin");
				String userid = intent.getStringExtra("userid");
				webView.loadUrl("javascript:onGestureLockLogin('" + userid + "')");
			}
		}
//		// 1-相机
//		if (requestCode == 1 && resultCode == RESULT_OK) {
//			Uri uri = null;
//			if (intent != null && intent.getData() != null) {
//				// 获取Scheme跳转的参数
//				uri = intent.getData();
//			}
//			if (uri == null && photoUri != null) {
//				uri = photoUri;
//			}
//			if (uri != null) {
//				// quality
//				SharedPreferences sharedPreferences = getSharedPreferences("camera", MODE_PRIVATE);
//				int quality = (int) (sharedPreferences.getFloat("quality", 0) * 100);
//				if (quality <= 0 || quality > 100) {
//
//					quality = 70;
//				}
//				// encode
//
//				String path = PhoneUtil.getRealFilePath(getApplicationContext(), uri);
//				// /storage/emulated/0/DCIM/Camera/1482134207518.jpg
//
//				if (webView != null && path != null) {
//					final StringBuffer b64=new StringBuffer();
//					b64.append(Base64Util.fileToBase64(path, quality));
//					//老方式
////					final String b64 = Base64Util.fileToBase64(path, quality);
//					// image=最后一行是BHpjIqA
//
//					runOnUiThread(new Runnable() {
//						@Override
//						public void run() {
//							if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
//								if (phototype != null) {
////									Log.i("flag","================evaluateJavascript======================");
//									webView.evaluateJavascript("javascript:onCameraDone('" + b64 + "','" + phototype + "')", null);
////									ToastUtils.longToast(ctx, "加载中,请稍后 ...");
//								} else {
////									ToastUtils.longToast(ctx, "传递的参数不能为空");
//								}
//							} else {
//								if (phototype!=null) {
////									Log.i("flag","================loadUrl qian======================");
//									webView.loadUrl("javascript:onCameraDone('" + b64 + "','"+ phototype + "')");
////									ToastUtils.longToast(ctx,"加载中,请稍后 ...");
////									Log.i("flag","================loadUrl======================");
//								}else {
////									ToastUtils.longToast(ctx, "传递的参数不能为空");
//								}
//							}
//						}
//					});
//
//				}else {
////					ToastUtils.shortToast(ctx,"path为空");
//				}
//				// delete
//				try {
//					File file = new File(path);
//					file.delete();
//				} catch (Exception ex) {
//					//
////					ToastUtils.shortToast(ctx, "文件删除失败");
//				}
//			}
//		}
		//2 - 手势密码清除后回调
		if (requestCode == 2) {
			//如果点击了“取消”，则直接返回
			SharedPreferences spForShut = getSharedPreferences("closeGestureLock",MODE_PRIVATE);
			String kouling = spForShut.getString("canNotShut", "");
			Log.i("flag","kouling==================="+kouling);
			if (spForShut!=null) {
				Log.i("flag","if (spForShut!=null) {");
				if (kouling.equals("no")) {
					Editor edit = spForShut.edit();
					edit.clear();
					edit.commit();
					Log.i("flag","if (kouling.equals()) {");
					return;
				}
			}

			SharedPreferences sharedPreferences = getSharedPreferences("lock", MODE_PRIVATE);
			Editor editor = sharedPreferences.edit();
			// 清空共享存储里的所有数据
			editor.clear();
			editor.commit();

			final boolean state = new InJavaScript().isGestureLockSet();
//			Log.i("flag","state===1428==="+state);
			if (webView != null) {
				if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
//						Log.i("flag", "--------------gestureState    evaluateJavascript");
						webView.evaluateJavascript("javascript:gestureState(" + state + ")", null);
				} else {
//						Log.i("flag", "---------------gestureState    loadUrl");
						webView.loadUrl("javascript:gestureState(" + state + ")");
				}
			} else {
//				Log.i("flag","webview为NULL");
			}
		}
        //		5000
        if (requestCode == SCANNIN_GREQUEST_CODE) {
            if(resultCode == RESULT_OK){
                Bundle bundle = intent.getExtras();
                String result = bundle.getString("result");

                //传给JS
                sendScanCodePhoto(result);

//				webView.loadUrl("javascript:onScanCodeFinish('" + result + "')");
            }
        }


//		// 3 takephoto
//		//点击确定后dialog显示有问题. 可以在回调后自定义一个dialog
//        if (requestCode ==  TConstant.RC_PICK_MULTIPLE) {
//            if (resultCode == Activity.RESULT_OK && intent != null) {
//                //显示对话框
//				if (activity != null && !activity.isDestroyed() && !activity.isFinishing()) {
//					ProgressDialogUtil.showProgressDialog(activity);
//				}else{
//					Log.i("flag", "--------------ProgressDialogUtil.showProgressDialog===");
//				}
//			}
//        }
		getTakePhoto().onActivityResult(requestCode, resultCode, intent);

	}

    public void sendScanCodePhoto(final String result){
        SharedPreferences spForPicPath = getSharedPreferences("scanPhotoPath", MODE_PRIVATE);
        scanPhotoPath = spForPicPath.getString("scanPhotoPath","");
        final String scanPhotoB64 = Base64Util.fileToBase64(scanPhotoPath,100,CollectionWebview.this);
        if (webView != null) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                        webView.evaluateJavascript("javascript:onScanCodeFinish('" + scanPhotoB64 + "','" + result + "')",null);
                    } else {
                        webView.loadUrl("javascript:onScanCodeFinish('" + scanPhotoB64 + "','" + result + "')");
                    }
                }
            });
        }
    }

	private void setJPushAlias_(String alias) {
		// 调用 Handler 来异步设置别名
		mHandler.sendMessage(mHandler.obtainMessage(MSG_SET_ALIAS, alias));
//		Message message = Message.obtain();
//		message.obj = alias;
//		mHandler.sendMessage(message);
	}

	private void quitApplication(String title, String text) {
		new Builder(CollectionWebview.this).setTitle(title).setMessage(text)
				.setNegativeButton("取消", new DialogInterface.OnClickListener() {

					public void onClick(DialogInterface dialog, int which) {
					}
				}).setPositiveButton("退出", new DialogInterface.OnClickListener() {
			public void onClick(DialogInterface dialog, int whichButton) {
				finish();
				System.exit(0);
			}
		}).show();
	}

	private void stopdownload(String title, String text) {
		new Builder(CollectionWebview.this).setTitle(title).setMessage(text)
				.setNegativeButton("继续", new DialogInterface.OnClickListener() {

					public void onClick(DialogInterface dialog, int which) {
						backtime = 0;
					}
				}).setPositiveButton("停止", new DialogInterface.OnClickListener() {
			public void onClick(DialogInterface dialog, int whichButton) {
				downloadialog.dismiss();
				downbool = false;
				backtime = 0;
			}
		}).show();

	}

	private Handler mHandler = new Handler() {
		public void handleMessage(Message msg) {
			// TODO Auto-generated method stub
			switch (msg.what) {
				case NEW_URL:

					break;
				case IMG_HTTP:

					// photoView.setScaleType(ScaleType.FIT_CENTER);
					// photoView.setImageBitmap(bitmap);
					// photoView.setVisibility(View.VISIBLE);

					// View.OnLayoutChangeListener listener = new
					// OnLayoutChangeListener() {
					//
					// @Override
					// public void onLayoutChange(View v, int left, int top, int
					// right, int bottom, int oldLeft,
					// int oldTop, int oldRight, int oldBottom) {
					// // TODO Auto-generated method stub
					// if (photoView.getVisibility() == View.GONE) {
					// layout.removeView(photoView);
					// }
					// }
					// };
					// photoView.removeOnLayoutChangeListener(listener);

					break;

				case BIG_PIC:

					photoview_main.setImageBitmap(bitmap);
					photoview_main.setVisibility(View.VISIBLE);

					break;

				case SHOW_PIC:
					// if (showimageid == 1) {
					//
					// processpic1.setImageResource(R.drawable.waitdot_2);
					// processpic6.setImageResource(R.drawable.waitdot_1);
					// }
					// if (showimageid == 2) {
					// processpic2.setImageResource(R.drawable.waitdot_2);
					// processpic1.setImageResource(R.drawable.waitdot_1);
					// }
					// if (showimageid == 3) {
					// processpic3.setImageResource(R.drawable.waitdot_2);
					// processpic2.setImageResource(R.drawable.waitdot_1);
					// }
					// if (showimageid == 4) {
					// processpic4.setImageResource(R.drawable.waitdot_2);
					// processpic3.setImageResource(R.drawable.waitdot_1);
					// }
					// if (showimageid == 5) {
					// processpic5.setImageResource(R.drawable.waitdot_2);
					// processpic4.setImageResource(R.drawable.waitdot_1);
					// }
					// if (showimageid == 6) {
					// processpic6.setImageResource(R.drawable.waitdot_2);
					// processpic5.setImageResource(R.drawable.waitdot_1);
					// }
					//
					// showimageid++;
					// if (showimageid == 7) {
					// showimageid = 1;
					// }

					LogUtils.d("webview页面加载中...");

					break;
				case DISMIS_DIALOG:
					loadingDialog.dismiss();

					break;
				case MSG_SET_ALIAS:
					JPushInterface.setAlias(getApplicationContext(),SET_JPUSH_ALIAS,msg.obj.toString());//新API使用此方法
					break;

				default:
					break;
			}
		}

	};
	/////////////////////////////////////////////// DragImageView的方法

	public static Bitmap ReadBitmapById(Context context, int resId) {
		BitmapFactory.Options opt = new BitmapFactory.Options();
		opt.inPreferredConfig = Config.RGB_565;
		opt.inPurgeable = true;
		opt.inInputShareable = true;
		// 获取资源图片
		InputStream is = context.getResources().openRawResource(resId);
		return BitmapFactory.decodeStream(is, null, opt);
	}

	Thread loadThread = new Thread() {
		public void run() {
			while (true) {

				if (waitBool) {

					while(waitBool){

						try {
							Message msg  =  new Message();
							msg.what  =  SHOW_PIC;
							mHandler.sendMessage(msg);
						} catch (Exception e) {	e.printStackTrace();  	}
						try {
							sleep(500);
						} catch (Exception e) {
							e.printStackTrace();
						}
						//

					}

					try {
						sleep(1000);
					} catch (Exception e) {
						e.printStackTrace();
					}

					Message msg = new Message();
					msg.what = DISMIS_DIALOG;
					mHandler.sendMessage(msg);

				} else {
					try {
						sleep(1000 + waitTime);
					} catch (Exception e) {
						e.printStackTrace();
					}
				}
			}
		}
	};

	Thread notifyThread = new Thread() {
		public void run() {
			try {
				sleep(5000);
			} catch (Exception e) {
				e.printStackTrace();
			}
			while (true) {
				if (newurlBool) {
					while (newurlBool) {
						try {

							runOnUiThread(new Runnable() {
								public void run() {
									if (webView.getUrl().indexOf("main.html") + 9 == webView.getUrl().length()) {
										// do nothing
									} else if (webView.getUrl().endsWith("main.html#login_page")) {
										// do nothing
									} else if (webView.getUrl().endsWith("main.html#server_config_page")) {
										// do nothing
									} else {
										if (intenttittleStr.length() != 0) {
											newurlBool = false;
											webView.loadUrl(intenttittleStr);
											intenttittleStr = "";
										}

									}

								}
							});

						} catch (Exception e) {
							e.printStackTrace();
						}
						try {
							sleep(10000);
						} catch (Exception e) {
							e.printStackTrace();
						}
					}

				} else {
					try {
						sleep(2000);
					} catch (Exception e) {
						e.printStackTrace();
					}
				}
			}
		}
	};

	private void init() {
		switchLayout = (SwitchLayout) findViewById(R.id.switchLayoutID);
		linearLayout = (LinearLayout) findViewById(R.id.linerLayoutID);

		// 得到子控件的个数
		mViewCount = switchLayout.getChildCount();
		mImageView = new ImageView[mViewCount];
		// 设置imageView
		for (int i = 0; i < mViewCount; i++) {
			// 得到LinearLayout中的子控件
			mImageView[i] = (ImageView) linearLayout.getChildAt(i);
			mImageView[i].setEnabled(true);// 控件激活
			mImageView[i].setOnClickListener(new MOnClickListener());
			mImageView[i].setTag(i);// 设置与view相关的标签
		}
		// 设置第一个imageView不被激活
		mCurSel = 0;
		mImageView[mCurSel].setEnabled(false);
		switchLayout.setOnViewChangeListener(new MOnViewChangeListener());
	}

	// 点击事件的监听器
	private class MOnClickListener implements OnClickListener {

		public void onClick(View v) {
			int pos = (Integer) v.getTag();
			System.out.println("pos:--" + pos);
			// 设置当前显示的ImageView
			setCurPoint(pos);
			// 设置自定义控件中的哪个子控件展示在当前屏幕中
			switchLayout.snapToScreen(pos);
		}
	}

	/**
	 * 设置当前显示的ImageView
	 *
	 * @param pos
	 */
	private void setCurPoint(int pos) {
		if (pos < 0 || pos > mViewCount - 1 || mCurSel == pos)
			return;
		// 当前的imgaeView将可以被激活
		mImageView[mCurSel].setEnabled(true);
		// 将要跳转过去的那个imageView变成不可激活
		mImageView[pos].setEnabled(false);
		mCurSel = pos;
	}

	// 自定义控件中View改变的事件监听
	private class MOnViewChangeListener implements OnViewChangeListener {

		public void onViewChange(int view) {
			System.out.println("view:--" + view);
			if (view < 0 || mCurSel == view) {
				return;
			} else if (view > mViewCount - 1) {
				// 当滚动到第五个的时候activity会被关闭
				System.out.println("finish activity");
				finish();
			}
			setCurPoint(view);
		}
	}

	public void setPush() {
		LayoutInflater factory = LayoutInflater.from(CollectionWebview.this);
		final View textEntryView = factory.inflate(R.layout.set, null);
		final RadioButton dogetRadioButton;
		RadioButton nogetRadioButton;
		final CheckBox vibrateCheckBox;
		final CheckBox soundCheckBox;

		Builder builder = new Builder(CollectionWebview.this);
		dogetRadioButton = (RadioButton) textEntryView.findViewById(R.id.radioButton1);
		nogetRadioButton = (RadioButton) textEntryView.findViewById(R.id.radioButton2);
		vibrateCheckBox = (CheckBox) textEntryView.findViewById(R.id.checkBox2);
		soundCheckBox = (CheckBox) textEntryView.findViewById(R.id.checkBox1);

		boolean mExternalStorageWriteable = false;
		String baseDir = Environment.getExternalStorageDirectory().getAbsolutePath();
		//

		final String state = Environment.getExternalStorageState();
		if (Environment.MEDIA_MOUNTED.equals(state)) {
			mExternalStorageWriteable = true;
		}
		if (mExternalStorageWriteable) // 看看保存的设置
		{

			File myFolderPath = new File(baseDir + "/ycoa");
			if (!myFolderPath.exists()) {
				myFolderPath.mkdir();
			}
			File myFilePath = new File(baseDir + "/ycoa" + "/set.ini");
			try {
				if (!myFilePath.exists()) {
					myFilePath.createNewFile();
					FileWriter fw = new FileWriter(baseDir + "/ycoa" + "/set.ini");

					fw.write("111");
					fw.flush();
					fw.close();
					dogetRadioButton.setChecked(true);
					vibrateCheckBox.setChecked(true);
					soundCheckBox.setChecked(true);
				} else {
					FileReader fr = new FileReader(baseDir + "/ycoa" + "/set.ini");
					BufferedReader br = new BufferedReader(fr);
					String setStr = br.readLine().toString();
					if (setStr.length() == 3) {
						String tempStr;
						tempStr = setStr.substring(0, 1);
						if (tempStr.equals("1")) {
							dogetRadioButton.setChecked(true);
						} else {
							nogetRadioButton.setChecked(true);
						}
						tempStr = setStr.substring(1, 2);
						if (tempStr.equals("1")) {
							soundCheckBox.setChecked(true);
						}
						tempStr = setStr.substring(2, 3);
						if (tempStr.equals("1")) {
							vibrateCheckBox.setChecked(true);
						}

					}
					br.close();
					fr.close();
				}
			} catch (Exception e) {
				e.printStackTrace();
			}
		}

		builder.setTitle("消息推送设置").setCancelable(true).setView(textEntryView)
				.setPositiveButton("确定", new DialogInterface.OnClickListener() {
					public void onClick(DialogInterface dialog, int which) {
						BasicPushNotificationBuilder builder = new BasicPushNotificationBuilder(CollectionWebview.this);
						builder.statusBarDrawable = R.mipmap.icon;
						builder.notificationFlags = Notification.FLAG_AUTO_CANCEL; // 设置为点击后自动消失

						String saveStr = "";

						if (dogetRadioButton.isChecked()) {
							saveStr = "1";
							JPushInterface.resumePush(getApplicationContext());
						} else {
							saveStr = "0";
							JPushInterface.stopPush(getApplicationContext());
						}
						if (soundCheckBox.isChecked()) {
							saveStr = saveStr + "1";
							builder.notificationDefaults = Notification.DEFAULT_SOUND;
						} else {
							saveStr = saveStr + "0";
						}
						if (vibrateCheckBox.isChecked()) {
							saveStr = saveStr + "1";
							builder.notificationDefaults = Notification.DEFAULT_VIBRATE;
						} else {
							saveStr = saveStr + "0";
						}
						if (vibrateCheckBox.isChecked() && soundCheckBox.isChecked()) {
							builder.notificationDefaults = Notification.DEFAULT_ALL;
						}
						if ((!vibrateCheckBox.isChecked()) && (!soundCheckBox.isChecked())) {
							builder.notificationDefaults = Notification.DEFAULT_LIGHTS;
						}
						JPushInterface.setPushNotificationBuilder(1, builder);

						boolean mExternalStorageWriteable = false;
						if (Environment.MEDIA_MOUNTED.equals(state)) {
							mExternalStorageWriteable = true;
						}
						if (mExternalStorageWriteable) {
							String baseDir = Environment.getExternalStorageDirectory().getAbsolutePath();
							try {
								FileWriter fw = new FileWriter(baseDir + "/ycoa" + "/set.ini");
								fw.write(saveStr);
								fw.flush();
								fw.close();
							} catch (Exception e) {
								e.printStackTrace();
							}
						}

					}
				}).setNegativeButton("取消", new DialogInterface.OnClickListener() {
			public void onClick(DialogInterface dialog, int which) {
				;
			}
		});

		builder.create().show();

		return;
	}

	// 系统下载处理
	private void fileDownSys(String url) {
		String dirName = "tfsmo/Download";
		// String fileName = getFilename(url);
		String fileName = getFilenameFromHeader(url);
		if (fileName == null || "".equals(fileName)) {
			fileName = getFilename(url);
		}
		File f = new File(Environment.getExternalStorageDirectory() + "/" + dirName + "/");
		if (!f.exists()) {
			f.mkdir();
		}
		DownloadManager downloadManager = (DownloadManager) getSystemService(DOWNLOAD_SERVICE);
		DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
		request.setDestinationInExternalPublicDir(dirName, fileName);
		lastDownloadId = downloadManager.enqueue(request);
		// registerReceiver(downloadReceiver, new
		// IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE));
		ToastUtils.shortToast(ctx, "开始后台下载，请稍候");
	}

	@Override
	protected void onStart() {
		// TODO Auto-generated method stub
		super.onStart();
		LogUtils.i("-----------onStart");
	}

	@Override
	protected void onPostResume() {
		// TODO Auto-generated method stub
		super.onPostResume();
	}

	@Override
	protected void onPause() {
		// TODO Auto-generated method stub
		super.onPause();

		// stopService(new Intent(instance,AmLocationService.class));
	}

	@Override
	protected void onStop() {
		// TODO Auto-generated method stub
		super.onStop();
		LogUtils.i("-----------onStop");
	}

	@Override
	protected void onRestart() {
		// TODO Auto-generated method stub
		super.onRestart();
	}

	// 从header中取文件名
	private String getFilenameFromHeader(String url) {
		String oldvalue = System.getProperty("http.keepAlive");
		try {
			System.setProperty("http.keepAlive", "false");
			URLConnection conn = new URL(url).openConnection();
			InputStream input = conn.getInputStream();
			String contentDisposition = conn.getHeaderField("Content-Disposition");
			input.close();
			String fname = URLUtil.guessFileName(url, contentDisposition, null);

			return fname;
		} catch (Exception ex) {
			//
		} finally {
			System.setProperty("http.keepAlive", oldvalue);
		}
		return null;
	}

	// 系统下载完成处理
	private BroadcastReceiver downloadReceiver = new BroadcastReceiver() {
		public void onReceive(Context context, Intent intent) {
			if (intent.getAction().equals(DownloadManager.ACTION_DOWNLOAD_COMPLETE)) {
				long id = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, 0);
				if (id == lastDownloadId) {
					DownloadManager downloadManager = (DownloadManager) getSystemService(DOWNLOAD_SERVICE);
					DownloadManager.Query query = new DownloadManager.Query();
					query.setFilterById(lastDownloadId);
					Cursor c = downloadManager.query(query);
					if (c != null && c.moveToFirst()) {
						String path = c.getString(c.getColumnIndex(DownloadManager.COLUMN_LOCAL_URI));
						Intent it = new Intent("android.intent.action.VIEW");
						it.addCategory("android.intent.category.DEFAULT");
						it.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
						Uri uri = Uri.parse(path);
						String type = FileUtil.getMIMEType(path);
						it.setDataAndType(uri, type);
						try {
							startActivity(it);
						} catch (Exception e) {
							ToastUtils.longToast(ctx, "由于尚未安装相关应用，无法打开该文件！");
						}
					}
				}
			}
		}
	};

	// 网络状态变更通知
	private BroadcastReceiver networkChangeReceiver = new BroadcastReceiver() {
		@Override
		public void onReceive(Context context, Intent intent) {
			if (webView != null) {
				boolean state = PhoneUtil.isNetworkConnected(getApplicationContext());
				webView.loadUrl("javascript:onNetworkStateChanged(" + state + ")");
			}
		}
	};

	// 位置服务通知
	private BroadcastReceiver locationReceiver = new BroadcastReceiver() {
		@Override
		public void onReceive(Context context, Intent intent) {
			String msgLoc = intent.getStringExtra(AmLocationService.BROADCAST_TAG_MSG_LOC);
			String msgSave = intent.getStringExtra(AmLocationService.BROADCAST_TAG_MSG_SAVE);
			if (webView != null) {
				if (msgLoc != null && !"".equals(msgLoc)) {
					webView.loadUrl("javascript:setLastKnownLoaction(" + msgLoc + ")");
				}
				if (msgSave != null && !"".equals(msgSave)) {
					webView.loadUrl("javascript:onLocationChanged(" + msgSave + ")");
				}
			}
		}
	};

	//启动LOGservice
	public void startLogService(){
		startService(new Intent(CollectionWebview.this, LogService.class));
	}

	//关闭LOG服务
	public void stopLogService() {
		Intent intent = new Intent();
		intent.setAction(LogService.BROADCAST_LOG_ACTION);
		sendBroadcast(intent);
	}

	// 删除日志文件
	public static void deleteLogs(){
		File dirFile = new File(SDCardHelper.getSDCardPath() + File.separator + "/trajectoryLog/");
		if (dirFile.exists()) {
			SDCardHelper.deltAllFiles(dirFile);
		}

		Intent intent = new Intent();
		intent.setAction(LogService.DELETE_LOG_FILE);
		instance.sendBroadcast(intent);
	}

	// 获取屏幕高度和宽度
	public int getMarginBottom() {
		DisplayMetrics dm = new DisplayMetrics();
		getWindowManager().getDefaultDisplay().getMetrics(dm);
		screenHeight = dm.heightPixels;
		if (eleHeight >= 0) {
			return screenHeight - eleHeight;
		}
		return 0;
	}
	private void possiblyResizeChildOfContent() {
		int usableHeightNow = computeUsableHeight();
		if (usableHeightNow != usableHeightPrevious) {
			int usableHeightSansKeyboard = webView.getRootView()
					.getHeight();
			int heightDifference = usableHeightSansKeyboard - usableHeightNow;
			if (heightDifference > (usableHeightSansKeyboard / 4)) {
				if (eleHeight > usableHeightNow-200) {//输入框被键盘盖住
//					Log.i("flag","输入框被键盘遮挡了");
					scrollView.smoothScrollTo(0, (int) (heightDifference - getMarginBottom()+Math.floor(usableHeightNow/2)));
				}
			} else {
			}
			webView.requestLayout();
			usableHeightPrevious = usableHeightNow;
		}
	}
	private int computeUsableHeight() {
		Rect r = new Rect();
		webView.getWindowVisibleDisplayFrame(r);
		return (r.bottom - r.top);
	}

}
