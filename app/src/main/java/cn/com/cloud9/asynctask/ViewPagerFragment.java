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

import android.graphics.Bitmap;
import android.graphics.Bitmap.CompressFormat;
import android.graphics.PointF;
import android.graphics.drawable.Drawable;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.support.v4.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup;
import android.widget.ImageView.ScaleType;

import com.bumptech.glide.Glide;
import com.bumptech.glide.request.animation.GlideAnimation;
import com.bumptech.glide.request.target.SimpleTarget;
import com.davemorrissey.labs.subscaleview.ImageSource;
import com.davemorrissey.labs.subscaleview.ImageViewState;
import com.davemorrissey.labs.subscaleview.SubsamplingScaleImageView;
import com.tiffdecoder.TiffDecoder;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.lang.reflect.Field;

import cn.com.cloud9.tfsmo.android42.R;
import cn.com.cloud9.tfsmo.android42.R.id;
import cn.com.cloud9.tfsmo.android42.R.layout;
import cn.com.cloud9.util.HttpURLConnHelper;
import cn.com.cloud9.util.HttpUtil;
import cn.com.cloud9.util.LogUtils;
import cn.com.cloud9.util.SDCardHelper;
import cn.com.cloud9.util.ToastUtils;
import uk.co.senab.photoview.PhotoView;
import uk.co.senab.photoview.PhotoViewAttacher;
import uk.co.senab.photoview.PhotoViewAttacher.OnPhotoTapListener;

public class ViewPagerFragment extends Fragment {

	private String[] imgArray;
	private String currstr;
	private SubsamplingScaleImageView imageView;
	// private ImageView tiffImageview;
	private PhotoView photoViewTiff;
	private File dirFile;
	private File fileTiff;
	private File dirFileTiff;
	private final long MIN_SIZE = 52428800;
	private Bitmap tiffBitmap;

	private Handler handler = new Handler() {
		public void handleMessage(Message msg) {

			if (msg.arg1 == 1) {

				photoViewTiff.setVisibility(View.VISIBLE);
				photoViewTiff.setImageBitmap(tiffBitmap);
				photoViewTiff.setMinScale(1.0f);

				TiffDecoder.nativeTiffClose();

			}
		};
	};

	public ViewPagerFragment() {
	}

	@Override
	public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {

		View rootView = null;

		if (rootView == null) {
			rootView = inflater.inflate(layout.view_pager_fragment, container, false);
		}

		Bundle bundle = getArguments();
		if (bundle != null) {
			if (currstr == null && bundle.containsKey("currStr")) {
				imageView = (SubsamplingScaleImageView) rootView.findViewById(id.imageView);
//				LogUtils.d("imageView="+imageView);
				clickExit();

				if (photoViewTiff == null) {
					photoViewTiff = (PhotoView) rootView.findViewById(id.photoview_tiff);
				}
				tiffClickExit();

				currstr = bundle.getString("currStr");
			}
		}
		if (currstr != null) {
			if (imageView != null) {
				imageView.setMinimumScaleType(SubsamplingScaleImageView.SCALE_TYPE_CENTER_INSIDE);
				imageView.setMinScale(1.0f);
				imageView.setImage(ImageSource.resource(R.mipmap.zhanwei));

			} else {
//				ToastUtils.shortToast(getActivity(), "SubsamplingScaleImageView未初始化");
			}

			// 如果SD卡已挂载
			if (SDCardHelper.isSDCardMounted()) {
				dirFile = new File(SDCardHelper.getSDCardPath() + File.separator + "/workPicture/");
				if (!dirFile.exists()) {
					dirFile.mkdirs();
				}
			} else {
//				ToastUtils.shortToast(getActivity(), "SD卡未挂载");
				LogUtils.i("SD卡未挂载");
			}
			//如果网络是连通的
			if (HttpUtil.isNetWorkAvailable(getActivity())) {
				// 如果内存卡空间够用
				if (SDCardHelper.getSDCardAvailableSize() > MIN_SIZE) {

					// 使用GLIDE下载图片
					Glide.with(this).load(currstr).asBitmap()// 设置回调类型
							.into(new SimpleTarget<Bitmap>() {
								@Override
								public void onResourceReady(Bitmap bitmap, GlideAnimation<? super Bitmap> arg1) {
									// TODO Auto-generated method stub
									// 创建文件
									File pictureFile = new File(dirFile, System.currentTimeMillis() + ".jpg");
									if (!pictureFile.exists()) {
										try {
											pictureFile.createNewFile();

										} catch (IOException e) {
											// TODO Auto-generated catch block
											e.printStackTrace();
										}
									}
									// 保存文件
									FileOutputStream fos = null;
									try {
										fos = new FileOutputStream(pictureFile);
										bitmap.compress(CompressFormat.JPEG, 100, fos);
										// 将保存的地址给SubsamplingScaleImageView,这里注意设置ImageViewState
										imageView.setImage(ImageSource.uri(pictureFile.getAbsolutePath()),
												new ImageViewState(0.5f, new PointF(0, 0), 0));
										imageView.setMinimumScaleType(SubsamplingScaleImageView.SCALE_TYPE_CENTER_INSIDE);
										// imageView.set
									} catch (FileNotFoundException e) {
										// TODO Auto-generated catch block
										e.printStackTrace();
									} finally {
										if (fos != null) {
											try {
												fos.close();
											} catch (IOException e) {
												// TODO Auto-generated catch block
												e.printStackTrace();
											}
										}
									}
								}

								@Override
								public void onLoadFailed(Exception e, Drawable errorDrawable) {
									// TODO Auto-generated method stub
									super.onLoadFailed(e, errorDrawable);

//									if (currstr.startsWith("http")) {
//										ToastUtils.longToast(getActivity(), "亲,图片加载失败了,请检查服务器连接...");
//										return;
//									}

									new Thread(new Runnable() {

										@Override
										public void run() {
											// TODO Auto-generated method stub

											// 如果SD卡已挂载
											if (SDCardHelper.isSDCardMounted()) {
												dirFileTiff = new File(
														dirFile.getAbsolutePath() + File.separator + "/tiffImage/");
												if (!dirFileTiff.exists()) {
													dirFileTiff.mkdirs();
												}
											}

											fileTiff = new File(dirFileTiff, System.currentTimeMillis() + ".tiff");
											if (!fileTiff.exists()) {
												try {
													fileTiff.createNewFile();
												} catch (IOException e) {
													// TODO Auto-generated catch
													// block
													e.printStackTrace();
												}
											}
											FileOutputStream tiffFos = null;
											if (fileTiff != null) {
												if (HttpURLConnHelper.saveFileFromURL(currstr, fileTiff)) {

													// 图片文件存储完毕后,转换成BITMAP
													try {
														Uri uri = Uri.fromFile(fileTiff);
														TiffDecoder.nativeTiffOpen(uri.getPath());
														long begin = System.currentTimeMillis();
														int[] pixels = TiffDecoder.nativeTiffGetBytes();
														long end = System.currentTimeMillis();
														tiffBitmap = Bitmap.createBitmap(pixels,
																TiffDecoder.nativeTiffGetWidth(),
																TiffDecoder.nativeTiffGetHeight(), Bitmap.Config.ARGB_8888);
														// tiffBitmap.compress(Bitmap.CompressFormat.JPEG,
														// 100, tiffFos);

													} catch (Exception e) {
														// TODO: handle exception
													}

												} else {
//													ToastUtils.shortToast(getActivity(), "TIFF图片文件保存失败");
													LogUtils.i("TIFF图片文件保存失败");
												}
											} else {
//												ToastUtils.shortToast(getActivity(), "TIFF图片文件为空");
												LogUtils.i("TIFF图片文件为空");
											}

											Message message = new Message();
											message.arg1 = 1;
											handler.sendMessage(message);
										}
									}).start();
								}

							});
				} else {
//					ToastUtils.longToast(getActivity(), "啊哦~ 手机存储空间不足了");
					LogUtils.i("啊哦~ 手机存储空间不足了");
				}
			}else {
				ToastUtils.shortToast(getActivity(), "啊哦~ 网络出问题了,请检查网络连接");
			}
		}

		return rootView;
	}

	public void clickExit() {
		imageView.setOnClickListener(new OnClickListener() {

			@Override
			public void onClick(View v) {
				// TODO Auto-generated method stub
				getActivity().finish();
//				getActivity().overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out);
			}
		});
	}

	public void tiffClickExit() {
		photoViewTiff.setOnPhotoTapListener(new OnPhotoTapListener() {

			@Override
			public void onPhotoTap(View arg0, float arg1, float arg2) {
//				Log.d("flag", "zhi xing jian ting le ---------------");
				// TODO Auto-generated method stub
				getActivity().finish();
//				getActivity().overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out);

			}
		});
	}

	@Override
	public void onSaveInstanceState(Bundle outState) {
		// super.onSaveInstanceState(outState);
		View rootView = getView();
		if (rootView != null) {
			outState.putStringArray("currStr", imgArray);
		}
	}

	@Override
	public void onDestroyView() {
		// TODO Auto-generated method stub
		super.onDestroyView();

		if (tiffBitmap != null) {
			tiffBitmap.recycle();
		}
		if (photoViewTiff != null) {
			photoViewTiff.setVisibility(View.GONE);
			photoViewTiff = null;
		}
		if (imageView != null) {
			imageView.recycle();
		}

		System.gc();
	}

	@Override
	public View getView() {
		// TODO Auto-generated method stub

		return super.getView();
	}

	// 解决viewpager回滑报空的问题
	@Override
	public void onDetach() {
		// TODO Auto-generated method stub
		super.onDetach();

		Field childFragmentManager;
		try {
			childFragmentManager = Fragment.class.getDeclaredField("mChildFragmentManager");
			// .getDeclaredField("fragmentmanager");
			childFragmentManager.setAccessible(true);
			childFragmentManager.set(this, null);
		} catch (NoSuchFieldException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IllegalAccessException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IllegalArgumentException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	// 回滑图片复原
	@Override
	public void setUserVisibleHint(boolean isVisibleToUser) {
		// TODO Auto-generated method stub
		super.setUserVisibleHint(isVisibleToUser);

		if (!isVisibleToUser) {
			if (imageView != null) {
				imageView.resetScaleAndCenter();
			}
			if (photoViewTiff != null) {
				PhotoViewAttacher mAttacher = new PhotoViewAttacher(photoViewTiff);// 把得到的photoView放到这个负责变形的类当中
				mAttacher.setScaleType(ScaleType.FIT_CENTER);// 设置充满全屏
			}
		}
//		else {
//			if (photoViewTiff != null) {
//				tiffClickExit();
//			}
//		}
	}
}
