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

import cn.com.cloud9.asynctask.ViewPagerFragmentB64;
import cn.com.cloud9.javabean.B64ListString;
import cn.com.cloud9.javabean.B64ListStringImage;
import cn.com.cloud9.util.SDCardHelper;

public class B64Activity extends FragmentActivity {

	private ViewPager viewpagerB64;
//	private ImageView vp_b64_back;
	private String totalUrlString;
	private String imageCurr;
	private String[] imgArrays;
	private List<Fragment> listFragment;

	@Override
	protected void onCreate(Bundle savedInstanceState) {

		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_viewpager_b64);
		init();
		getFragmentList();
		setAdapter();
		setCurrItem();
	}

	// 切割字符串
	public String[] getB64Array(String str) {
		if (str.contains("@")) {
			imgArrays = str.split("@");
			return imgArrays;
		}else {
			imgArrays=new String[]{str};
			return imgArrays;
		}
	}

	// 得到碎片集合
	public void getFragmentList() {

		for (int i = 0; i < imgArrays.length; i++) {

			ViewPagerFragmentB64 fragment = new ViewPagerFragmentB64();

			Bundle bundle = new Bundle();
			String currStr = null;

			currStr = imgArrays[i];
			bundle.putString("currStr", currStr);
			fragment.setArguments(bundle);

			listFragment.add(fragment);
		}
	}

	public void setCurrItem() {

		// 设置当前图片为image这个图片
		for (int i = 0; i < imgArrays.length; i++) {
			if (imgArrays[i].equals(imageCurr)) {
				viewpagerB64.setCurrentItem(i);
			} else {
			}
		}
	}

	public void setAdapter() {

		PagerAdapter pagerAdapter = new ScreenSlidePagerAdapter(getSupportFragmentManager());
		viewpagerB64 = (ViewPager) findViewById(R.id.viewpager_b64);
		viewpagerB64.setAdapter(pagerAdapter);
		viewpagerB64.setVisibility(View.VISIBLE);

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
//		overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out);
//	}

	public void init() {

		viewpagerB64 = (ViewPager) findViewById(R.id.viewpager_b64);
//		vp_b64_back = (ImageView) findViewById(R.id.vp_b64_back);

		totalUrlString= B64ListString.getInstance().get(0);
		imageCurr = B64ListStringImage.getInstance().get(0);

		// 通过切割得到imageArrays地址的数组
		getB64Array(totalUrlString);

		listFragment = new ArrayList<Fragment>();
	}

	@Override
	protected void onDestroy() {
		// TODO Auto-generated method stub
		super.onDestroy();

		viewpagerB64 = null;
//		vp_b64_back=null;

		// 递归删除下载到本地的图片
		File dirFile = new File(SDCardHelper.getSDCardPath() + File.separator + "/workPictureCollectionB64/");
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
