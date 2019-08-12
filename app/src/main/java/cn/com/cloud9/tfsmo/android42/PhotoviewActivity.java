package cn.com.cloud9.tfsmo.android42;

import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentActivity;
import android.support.v4.app.FragmentManager;
import android.support.v4.app.FragmentStatePagerAdapter;
import android.support.v4.view.PagerAdapter;
import android.support.v4.view.ViewPager;
import android.view.KeyEvent;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import cn.com.cloud9.asynctask.ViewPagerFragment;
import cn.com.cloud9.util.SDCardHelper;

public class PhotoviewActivity extends FragmentActivity {

	private ViewPager viewPagerVisible;
	private String imageCurr;
//	private ImageView viewpager_activity_back;
	private String imgTotalUrl;
	private String[] imgArrays;
	private List<String> listURL;

	private String url;
	private List<Fragment> listFragment;
	private float x1;
	private float y1;
	private int biaoji = 0;

	@Override
	protected void onCreate(Bundle savedInstanceState) {

		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_viewpager);

		init();

		getFragmentList();

		setAdapter();

		setCurrItem();

	}

	// 切割字符串
	public String[] getUrlArray(String str) {
		imgArrays = str.split("@");
		return imgArrays;
	}

	public List<String> getUrl(String[] arr) {

		listURL = new ArrayList<String>();

		for (int i = 0; i < arr.length; i++) {
			listURL.add(arr[i]);
		}
		return listURL;
	}

	// 得到碎片集合
	public void getFragmentList() {

//		LogUtils.d("getFragmentList");
		for (int i = 0; i < imgArrays.length; i++) {

			ViewPagerFragment fragment = new ViewPagerFragment();

			Bundle bundle = new Bundle();
			String currStr = null;

			currStr = imgArrays[i];
			bundle.putString("currStr", currStr);
			fragment.setArguments(bundle);

			listFragment.add(fragment);
		}
	}

	public void setCurrItem() {

//		LogUtils.d("setCurrItem");
		// 设置当前图片为image这个图片
		for (int i = 0; i < imgArrays.length; i++) {
			if (imgArrays[i].equals(imageCurr)) {
				viewPagerVisible.setCurrentItem(i);
			} else {
			}
		}
	}

	public void setAdapter() {
//		LogUtils.d("setAdapter");
		PagerAdapter pagerAdapter = new ScreenSlidePagerAdapter(getSupportFragmentManager());
		viewPagerVisible = (ViewPager) findViewById(R.id.viewpager_invisible);
		viewPagerVisible.setAdapter(pagerAdapter);
		viewPagerVisible.setVisibility(View.VISIBLE);

	}

	private class ScreenSlidePagerAdapter extends FragmentStatePagerAdapter {


		public ScreenSlidePagerAdapter(FragmentManager fm) {
			super(fm);
		}

		@Override
		public Fragment getItem(int position) {

			// 此方法里也可放Bundle
			return listFragment.get(position);
		}

		@Override
		public int getCount() {
			return imgArrays.length;
		}

		@Override
		public Object instantiateItem(ViewGroup viewGroup, int index) {
			// TODO Auto-generated method stub
			return super.instantiateItem(viewGroup, index);
		}

		@Override
		public void destroyItem(ViewGroup container, int position, Object object) {
			// TODO Auto-generated method stub
			// super.destroyItem(container, position, object);

		}
	}

//	public void onClick(View view) {
//		finish();
////		overridePendingTransition(0, android.R.anim.fade_out);
//	}

	public void init() {
//		LogUtils.d("init");
		viewPagerVisible = (ViewPager) findViewById(R.id.viewpager_invisible);
//		viewpager_activity_back = (ImageView) findViewById(R.id.vp_back);

		imgTotalUrl = getIntent().getStringExtra("urlArray");
		imageCurr = getIntent().getStringExtra("image");

		// 通过切割得到imageArrays地址的数组
		getUrlArray(imgTotalUrl);
		// 得到URL的LIST集合
		getUrl(imgArrays);

		listFragment = new ArrayList<Fragment>();
	}

	@Override
	protected void onDestroy() {
		// TODO Auto-generated method stub
		super.onDestroy();

		viewPagerVisible = null;
		imgTotalUrl=null;

		// 递归删除下载到本地的图片
		File dirFile = new File(SDCardHelper.getSDCardPath() + File.separator + "/workPicture/");
		if (dirFile.exists()) {
			deleteAllFiles(dirFile);
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

	/**
	 * 递归删除文件
	 *
	 * @param file
	 *            要删除的文件的根目录
	 */

	private static void deleteAllFiles(File f) {
		if (f.exists()) {
			// 返回一个抽象路径名数组，这些路径名表示此抽象路径名表示的目录中的文件
			File[] files = f.listFiles();
			if (files != null) {
				for (File file : files)
					if (file.isDirectory()) {
						deleteAllFiles(file);
						file.delete(); // 删除目录下的所有文件后，该目录变成了空目录，可直接删除
					} else if (file.isFile()) {
						file.delete();
					}
			}
			// f.delete(); //删除最外层的目录
		}
	}

	/**
	 * 对图片进行二次采样，生成缩略图。避免加载过大图片出现内存溢出
	 */
	// public static Bitmap createThumbnail(byte[] data, int newWidth,
	// int newHeight) {
	// BitmapFactory.Options options = new BitmapFactory.Options();
	// //只读取图片头部信息，不读body部分
	// options.inJustDecodeBounds = true;
	// BitmapFactory.decodeByteArray(data, 0, data.length, options);
	// //options.outWidth:需要获取的图片文件的宽
	// //options.outHeight:需要获取的图片文件的高
	// int oldWidth = options.outWidth;
	// int oldHeight = options.outHeight;
	//
	// // Log.i("Helper", "--->oldWidth:" + oldWidth);
	// // Log.i("Helper", "--->oldHeight:" + oldHeight);
	//
	// int ratioWidth = 0;
	// int ratioHeight = 0;
	//
	// //根据需要计算压缩比例
	// if (newWidth != 0 && newHeight == 0) {
	// ratioWidth = oldWidth / newWidth;
	// options.inSampleSize = ratioWidth;
	// // Log.i("Helper", "--->ratioWidth:" + ratioWidth);
	//
	// } else if (newWidth == 0 && newHeight != 0) {
	// ratioHeight = oldHeight / newHeight;
	// options.inSampleSize = ratioHeight;
	// } else {
	// ratioHeight = oldHeight / newHeight;
	// ratioWidth = oldWidth / newWidth;
	// options.inSampleSize = ratioHeight > ratioWidth ? ratioHeight
	// : ratioWidth;
	// }
	// options.inPreferredConfig = Config.ALPHA_8;
	// //真正读取图片文件
	// options.inJustDecodeBounds = false;
	//
	// Bitmap bm = BitmapFactory
	// .decodeByteArray(data, 0, data.length, options);
	//
	//
	//// Bitmap bm=BitmapFactory.decodeStream(is, null, options);
	//
	// return bm;
	// }

}
