package cn.com.cloud9.asynctask;

import android.content.Context;
import android.util.Log;

import com.bumptech.glide.Glide;
import com.bumptech.glide.GlideBuilder;
import com.bumptech.glide.load.DecodeFormat;
import com.bumptech.glide.load.engine.bitmap_recycle.LruBitmapPool;
import com.bumptech.glide.load.engine.cache.LruResourceCache;
import com.bumptech.glide.load.engine.cache.MemorySizeCalculator;
import com.bumptech.glide.module.GlideModule;

public class PhotoViewGlideMoudule implements GlideModule {

	@Override
	public void applyOptions(Context context, GlideBuilder builder) {
		// TODO Auto-generated method stub
		builder.setDecodeFormat(DecodeFormat.PREFER_ARGB_8888);

		//设置内在缓存大小和...
		MemorySizeCalculator calculator = new MemorySizeCalculator(context);
		int defaultMemoryCacheSize = calculator.getMemoryCacheSize();
		int defaultBitmapPoolSize = calculator.getBitmapPoolSize();
		Log.d("flag", "defaultMemoryCacheSize="+defaultMemoryCacheSize);
		Log.d("flag", "defaultBitmapPoolSize="+defaultBitmapPoolSize);

		int customMemoryCacheSize = (int) (10.0 * defaultMemoryCacheSize);
		int customBitmapPoolSize = (int) (10.0 * defaultBitmapPoolSize);

		Log.d("flag", "customMemoryCacheSize="+customMemoryCacheSize);
		Log.d("flag", "customBitmapPoolSize="+customBitmapPoolSize);

		builder.setMemoryCache( new LruResourceCache( customMemoryCacheSize ));
		builder.setBitmapPool( new LruBitmapPool( customBitmapPoolSize ));

	}

	@Override
	public void registerComponents(Context arg0, Glide arg1) {
		// TODO Auto-generated method stub

	}

}
