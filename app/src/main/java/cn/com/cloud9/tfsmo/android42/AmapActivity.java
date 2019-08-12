package cn.com.cloud9.tfsmo.android42;

import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.CompoundButton;
import android.widget.CompoundButton.OnCheckedChangeListener;
import android.widget.ImageView;
import android.widget.Toast;

import com.amap.api.location.AMapLocation;
import com.amap.api.location.AMapLocationClient;
import com.amap.api.location.AMapLocationClientOption;
import com.amap.api.location.AMapLocationClientOption.AMapLocationMode;
import com.amap.api.location.AMapLocationListener;
import com.amap.api.maps.AMap;
import com.amap.api.maps.AMap.InfoWindowAdapter;
import com.amap.api.maps.AMap.OnInfoWindowClickListener;
import com.amap.api.maps.AMap.OnMarkerClickListener;
import com.amap.api.maps.AMapOptions;
import com.amap.api.maps.CameraUpdateFactory;
import com.amap.api.maps.LocationSource;
import com.amap.api.maps.MapView;
import com.amap.api.maps.UiSettings;
import com.amap.api.maps.model.BitmapDescriptorFactory;
import com.amap.api.maps.model.LatLng;
import com.amap.api.maps.model.Marker;
import com.amap.api.maps.model.MarkerOptions;
import com.amap.api.maps.model.MyLocationStyle;
import com.amap.api.maps.model.PolylineOptions;

import cn.com.cloud9.util.LogUtils;
import cn.com.cloud9.util.OrbitUtils;

public class AmapActivity extends Activity implements LocationSource, OnMarkerClickListener,AMapLocationListener, OnInfoWindowClickListener,OnCheckedChangeListener, InfoWindowAdapter {

	private MapView mMapView;
	private ImageView imageViewBackMap;

	private AMapLocationListener mlocationlistener;
	private AMap aMap;
	private AMapLocationClient mlocationclient;
	private AMapLocationClientOption mlocationoption;
	private UiSettings uiSettings;
	private OnLocationChangedListener mListener;
	private Marker marker1;
	private Marker marker2;

	//轨迹
	//以前的定位点
	private LatLng oldLatLng;
	//是否是第一次定位
	private boolean isFirstLatLng;

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		// TODO Auto-generated method stub
		super.onCreate(savedInstanceState);
		setContentView(R.layout.amap_activity);

		LogUtils.d("调用了onCreate方法");

		imageViewBackMap = (ImageView) findViewById(R.id.exit_map);

		mMapView = (MapView) findViewById(R.id.amap_details);
		mMapView.onCreate(savedInstanceState);

		isFirstLatLng = true;

		// mlocationlistener = new AMapLocationListener() {
		//
		// @Override
		// public void onLocationChanged(AMapLocation amaplocation) {
		// // Toast.makeText(getApplicationContext(),
		// // "onLocationChanged方法", Toast.LENGTH_LONG).show();
		// // TODO Auto-generated method stub
		// if (mlocationlistener != null && amaplocation != null) {
		// if (amaplocation != null && amaplocation.getErrorCode() == 0) {
		// // TODO
		// // amaplocation.getLatitude();
		// // Log.d("flag","wei
		// // du===="+amaplocation.getLatitude());
		// // amaplocation.getLongitude();
		// // Log.d("flag","jing
		// // du===="+amaplocation.getLongitude());
		//
		// mlocationlistener.onLocationChanged(amaplocation);
		// } else {
		// Log.d("AmapError", "location Error, ErrCode:" +
		// amaplocation.getErrorCode() + ", errInfo:"
		// + amaplocation.getErrorInfo());
		// }
		// } else {
		// Toast.makeText(getApplicationContext(),
		// "mlistener=null或amaplocation=null", Toast.LENGTH_LONG)
		// .show();
		// String errText = "定位失败," + amaplocation.getErrorCode() + ": " +
		// amaplocation.getErrorInfo();
		// Log.d("flag", "errText=" + errText);
		// }
		// }
		// };

		if (aMap == null) {
			aMap = mMapView.getMap();
		}
		uiSettings = aMap.getUiSettings();

		// 指南针
//		 uiSettings.setCompassEnabled(true);
		//LOGO位置
		uiSettings.setLogoPosition(AMapOptions.LOGO_POSITION_BOTTOM_CENTER);

//		 比例尺
//		 float scale = aMap.getScalePerPixel();
		// Toast.makeText(getApplicationContext(), "每像素代表" + scale + "米",
		// Toast.LENGTH_SHORT).show();
//		uiSettings.setScaleControlsEnabled(true);

		MyLocationStyle locationStyle = new MyLocationStyle();
		locationStyle.myLocationIcon(BitmapDescriptorFactory.fromResource(R.mipmap.location_marker));
		locationStyle.strokeColor(Color.BLUE);
		locationStyle.radiusFillColor(Color.argb(50, 0, 0, 30));

		locationStyle.strokeWidth(0);
		aMap.setMyLocationStyle(locationStyle);

		// 设置定位监听
		aMap.setLocationSource(this);
		// 定位按钮
		uiSettings.setMyLocationButtonEnabled(true);
		// 显示定位层并可触发定位
		aMap.setMyLocationEnabled(true);
		// 设置定位的类型为自由定位. 可以由定位 LOCATION_TYPE_LOCATE、跟随 LOCATION_TYPE_MAP_FOLLOW 或地图根据面向方向旋转 LOCATION_TYPE_MAP_ROTATE
		aMap.setMyLocationType(AMap.LOCATION_TYPE_LOCATE);

		//画线
		// 缩放级别（zoom）：地图缩放级别范围为【4-20级】，值越大地图越详细
		aMap.moveCamera(CameraUpdateFactory.zoomTo(16));
		//使用 aMap.setMapTextZIndex(2) 可以将地图底图文字设置在添加的覆盖物之上
		aMap.setMapTextZIndex(2);

		// startService(new
		// Intent(getApplicationContext(),AmLocationService.class));

		// mlistener = new AMapLocationListener() {
		//
		// @Override
		// public void onLocationChanged(AMapLocation location) {
		// // TODO Auto-generated method stub
		// mlistener.onLocationChanged(location);
		// }
		// };
		aMap.setOnMarkerClickListener(this);
		aMap.setInfoWindowAdapter(this);
		aMap.setOnInfoWindowClickListener(this);

	}

	/**绘制两个坐标点之间的线段,从以前位置到现在位置*/
	private void drawLineOnMap(LatLng oldData, LatLng newData){

		aMap.addPolyline(new PolylineOptions()
				.add(oldData,newData)
				.geodesic(true)
				.color(Color.BLUE));
	}

//	public void onCheckedChanged(RadioGroup group, int checkedId) {
//		if (aMap != null) {
//			if (checkedId == R.id.bottom_left) {
//				// uiSettings.setLogoPosition(AMapOptions.LOGO_POSITION_BOTTOM_LEFT);
//				uiSettings.setLogoPosition(AMapOptions.LOGO_POSITION_BOTTOM_CENTER);
//			} else if (checkedId == R.id.bottom_center) {
//				// uiSettings.setLogoPosition(AMapOptions.LOGO_POSITION_BOTTOM_CENTER);
//				uiSettings.setLogoPosition(AMapOptions.LOGO_POSITION_BOTTOM_CENTER);
//
//			} else if (checkedId == R.id.bottom_right) {
//				// uiSettings.setLogoPosition(AMapOptions.LOGO_POSITION_BOTTOM_RIGHT);
//				uiSettings.setLogoPosition(AMapOptions.LOGO_POSITION_BOTTOM_CENTER);
//
//			}
//		}
//	}

	// 开启位置服务
	// public void startLocationService(String userid, String extra) {
	// SharedPreferences sharedPreferences = getSharedPreferences("location",
	// MODE_PRIVATE);
	// SharedPreferences.Editor editor = sharedPreferences.edit();
	/// editor.putString("userid", userid);
	// editor.putString("extra", extra);
	// editor.commit();
	// startService(new Intent(getApplicationContext(),
	// AmLocationService.class));
	// }



	@Override
	protected void onDestroy() {
		super.onDestroy();
		// 在activity执行onDestroy时执行mMapView.onDestroy()，实现地图生命周期管理
		mMapView.onDestroy();
		deactivate();
		LogUtils.d("调用了onDestroy方法");

	}

	@Override
	protected void onResume() {
		super.onResume();
		// 在activity执行onResume时执行mMapView.onResume ()，实现地图生命周期管理
		mMapView.onResume();

		LogUtils.d("调用了onResume方法");
	}

	@Override
	protected void onPause() {
		super.onPause();
		// 在activity执行onPause时执行mMapView.onPause ()，实现地图生命周期管理
		mMapView.onPause();

		LogUtils.d("调用了onPause方法");
	}

	@Override
	protected void onSaveInstanceState(Bundle outState) {
		super.onSaveInstanceState(outState);
		// 在activity执行onSaveInstanceState时执行mMapView.onSaveInstanceState
		// (outState)，实现地图生命周期管理
		mMapView.onSaveInstanceState(outState);
	}

	public void exitAmap(View view) {

		finish();
	}

	// 激活定位
	@Override
	public void activate(OnLocationChangedListener listener) {
		// TODO Auto-generated method stub
		mListener = listener;
		if (mlocationclient == null) {
			mlocationclient = new AMapLocationClient(this);
			mlocationoption = new AMapLocationClientOption();
			// 设置定位监听
			mlocationclient.setLocationListener(this);
			mlocationoption.setLocationMode(AMapLocationMode.Hight_Accuracy);
			mlocationoption.setInterval(1000);
			// mlocationoption.setNeedAddress(true);
			// 强制刷新WIFI
			// mlocationoption.setWifiActiveScan(true);
			mlocationoption.setMockEnable(true);
			mlocationclient.setLocationOption(mlocationoption);
			mlocationclient.startLocation();
		}
	}

	/**
	 * 停止定位
	 */
	@Override
	public void deactivate() {
		// TODO Auto-generated method stub
		mListener = null;
		if (mlocationclient != null) {
			mlocationclient.stopLocation();
			mlocationclient.onDestroy();
		}
		mlocationclient = null;
	}

	@Override
	public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
		// TODO Auto-generated method stub

	}

	public void addMarker(AMapLocation amapLocation){
		double weidu=amapLocation.getLatitude();
		double jingdu=amapLocation.getLongitude();

		String cityName=amapLocation.getCity();
		String streetName=amapLocation.getStreet();
		String districtName=amapLocation.getDistrict();
		String streetNum=amapLocation.getStreetNum();
		String aoiName=amapLocation.getAoiName();
		marker1 = aMap.addMarker(new MarkerOptions()
				.anchor(0.5f, 0.5f)
				.position(new LatLng(weidu, jingdu))
				.title("当前位置")
				.snippet(cityName+" "+districtName+" "+streetName+aoiName)
				.icon(BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_AZURE))
				.draggable(true));;
//		marker1.showInfoWindow();

		marker2 = aMap.addMarker(new MarkerOptions()
				.anchor(0.5f, 0.5f)

				.position(new LatLng(33.1111, 100.1111))
				.title("不知道哪")
				.snippet("不知道哪,随便写的")
				.icon(BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_AZURE))
				.draggable(true));;
//		marker2.showInfoWindow();
//		Log.d("flag", "marker2.getPosition();"+marker2.getPosition());

	}

	@Override
	public void onLocationChanged(AMapLocation amapLocation) {
		// TODO Auto-generated method stub
		if (mListener != null && amapLocation != null) {
			if (amapLocation != null && amapLocation.getErrorCode() == 0) {

				mListener.onLocationChanged(amapLocation);// 显示系统小蓝点

//				addMarker(amapLocation);

				//轨迹用
				LatLng newLatLng= OrbitUtils.getLocationLatLng(amapLocation);

				if (isFirstLatLng) {
					oldLatLng=newLatLng;
					isFirstLatLng=false;
				}
				//位置有变化
				if (oldLatLng!=newLatLng) {
//					 Log.d("flag", amapLocation.getLatitude() + "," + amapLocation.getLongitude());
					drawLineOnMap(oldLatLng, newLatLng);
					oldLatLng=newLatLng;
				}

			} else {
				String errText = "定位失败," + amapLocation.getErrorCode() + ": " + amapLocation.getErrorInfo();
				Log.e("AmapErr", errText);
				// mLocationErrText.setVisibility(View.VISIBLE);
				// mLocationErrText.setText(errText);
//				Toast.makeText(getApplicationContext(), "amapLocation或errorcode为空", Toast.LENGTH_LONG).show();

				if(isFirstLatLng){
//					Toast.makeText(this, errText, Toast.LENGTH_SHORT).show();
				}
			}
		}
	}

	@Override
	public void onInfoWindowClick(Marker marker) {
		// TODO Auto-generated method stub

//		Toast.makeText(getApplicationContext(), "你点击了infoWindow窗口"+marker.getTitle(), Toast.LENGTH_LONG).show();

	}

	@Override
	public boolean onMarkerClick(Marker marker) {
		// TODO Auto-generated method stub
		if (marker.equals(marker1)) {
			marker.showInfoWindow();
		}
		if (marker.equals(marker2)) {
			marker.showInfoWindow();
		}

		return false;
	}

	@Override
	public View getInfoContents(Marker arg0) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public View getInfoWindow(Marker arg0) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	protected void onStart() {
		// TODO Auto-generated method stub
		super.onStart();

		LogUtils.d("调用了onStart方法");
	}

	@Override
	protected void onStop() {
		// TODO Auto-generated method stub
		super.onStop();

		LogUtils.d("调用了onStop方法");
	}

	@Override
	protected void onRestart() {
		// TODO Auto-generated method stub
		super.onRestart();
		LogUtils.d("调用了onRestart方法");
	}
}
