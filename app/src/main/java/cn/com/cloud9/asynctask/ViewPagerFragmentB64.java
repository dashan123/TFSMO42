/*
Copyright 2014 David Morrissey

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package cn.com.cloud9.asynctask;

import android.graphics.PointF;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.support.v4.app.Fragment;
import android.util.Base64;
import android.view.LayoutInflater;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup;

import com.davemorrissey.labs.subscaleview.ImageSource;
import com.davemorrissey.labs.subscaleview.ImageViewState;
import com.davemorrissey.labs.subscaleview.SubsamplingScaleImageView;

import java.io.File;
import java.io.FileOutputStream;

import cn.com.cloud9.tfsmo.android42.R.id;
import cn.com.cloud9.tfsmo.android42.R.layout;
import cn.com.cloud9.util.HttpUtil;
import cn.com.cloud9.util.LogUtils;
import cn.com.cloud9.util.SDCardHelper;
import cn.com.cloud9.util.ToastUtils;

public class ViewPagerFragmentB64 extends Fragment {

	private String currStr;
	//	private Bitmap bitmap;
	private byte[] bytes;
	private final int BASE_PIC = 0001;

	private File dirFile;
	private final int MIN_SIZE=52428800;
	private SubsamplingScaleImageView imageView;
	private File pictureFile;

	private Handler handler = new Handler() {
		public void handleMessage(Message msg) {

			switch (msg.what) {
				case BASE_PIC:

					imageView.setImage(ImageSource.uri(pictureFile.getAbsolutePath()),
							new ImageViewState(0.5f, new PointF(0, 0), 0));

					break;

				default:
					break;
			}
		};
	};

	public ViewPagerFragmentB64() {
	}

	@Override
	public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {

		View rootView = null;

		if (rootView == null) {
			rootView = inflater.inflate(layout.view_pager_fragment_b64, container, false);
		}

		Bundle bundle = getArguments();
		if (bundle != null) {
			if (currStr == null && bundle.containsKey("currStr")) {

				if (imageView==null) {
					imageView = (SubsamplingScaleImageView) rootView.findViewById(id.imageView_b64_collection);
					imageView.setMinimumScaleType(SubsamplingScaleImageView.SCALE_TYPE_CENTER_INSIDE);
					imageView.setMinScale(1.0f);
				}
				pvClickExit();

				currStr = bundle.getString("currStr");
				if (currStr != null) {

					bytes=Base64.decode(currStr, Base64.DEFAULT);
//					bitmap=BitmapFactory.decodeByteArray(bytes, 0, bytes.length);

					// 如果SD卡已挂载
					if (SDCardHelper.isSDCardMounted()) {
						dirFile = new File(SDCardHelper.getSDCardPath() + File.separator + "/workPictureCollectionB64/");
						if (!dirFile.exists()) {
							dirFile.mkdirs();
						}
					} else {
//						ToastUtils.shortToast(getActivity(), "SD卡未挂载");
					}

					FileOutputStream fos;
					//如果网络是连通的
					if (HttpUtil.isNetWorkAvailable(getActivity())) {
						// 如果内存卡空间够用
						if (SDCardHelper.getSDCardAvailableSize() > MIN_SIZE) {

							// 创建文件
							pictureFile = new File(dirFile, System.currentTimeMillis() + ".jpg");

							try {
								if (!pictureFile.exists()) {
									pictureFile.createNewFile();
								}

								fos=new FileOutputStream(pictureFile);
//								bitmap.compress(CompressFormat.JPEG, 100, fos);

								fos.write(bytes);
								fos.flush();
								fos.close();

							} catch (Exception e) {
								// TODO Auto-generated catch block
								e.printStackTrace();
							}
						}else {
//							ToastUtils.longToast(getActivity(), "啊哦~ 手机存储空间不足了");
							LogUtils.i("手机存储空间不足");
						}

//						BitmapFactory.Options opts=new BitmapFactory.Options();
//						opts.inSampleSize=2;
//						opts.inJustDecodeBounds=false;
//						bitmap=BitmapFactory.decodeByteArray(bytes, 0, bytes.length, opts);

						new Thread(new Runnable() {

							@Override
							public void run() {
								// TODO Auto-generated method stub
								Message imgMessage = Message.obtain();
								imgMessage.what = BASE_PIC;
								handler.sendMessage(imgMessage);
							}
						}).start();
					}else {
						ToastUtils.shortToast(getActivity(), "啊哦~ 网络出问题了,请检查网络连接");
					}
				}
			}
		}

		return rootView;
	}

	public void pvClickExit() {

		imageView.setOnClickListener(new OnClickListener() {

			@Override
			public void onClick(View v) {
				// TODO Auto-generated method stub
				getActivity().finish();
				getActivity().overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out);
			}
		});
	}

	@Override
	public void onSaveInstanceState(Bundle outState) {
		// super.onSaveInstanceState(outState);
		View rootView = getView();
		if (rootView != null) {
			outState.putString("currStr", currStr);
		}
	}
	@Override
	public void onResume() {
		// TODO Auto-generated method stub
		super.onResume();
		pvClickExit();
	}
	@Override
	public void onDestroyView() {
		// TODO Auto-generated method stub
		super.onDestroyView();

		if (imageView!=null) {
			imageView.recycle();
			imageView=null;
		}

		System.gc();
	}

	@Override
	public View getView() {
		// TODO Auto-generated method stub

		return super.getView();
	}

	// 解决viewpager回滑报空的问题
//	@Override
//	public void onDetach() {
//		// TODO Auto-generated method stub
//		super.onDetach();
//
//		Field childFragmentManager;
//		try {
//			childFragmentManager = Fragment.class.getDeclaredField("mChildFragmentManager");
//			// .getDeclaredField("fragmentmanager");
//			childFragmentManager.setAccessible(true);
//			childFragmentManager.set(this, null);
//		} catch (NoSuchFieldException e) {
//			// TODO Auto-generated catch block
//			e.printStackTrace();
//		} catch (IllegalAccessException e) {
//			// TODO Auto-generated catch block
//			e.printStackTrace();
//		} catch (IllegalArgumentException e) {
//			// TODO Auto-generated catch block
//			e.printStackTrace();
//		}
//	}

	// 回滑图片复原
	@Override
	public void setUserVisibleHint(boolean isVisibleToUser) {
		// TODO Auto-generated method stub
		super.setUserVisibleHint(isVisibleToUser);

		if (!isVisibleToUser) {
			if (imageView != null) {
				imageView.resetScaleAndCenter();
			}
		}
	}

}
