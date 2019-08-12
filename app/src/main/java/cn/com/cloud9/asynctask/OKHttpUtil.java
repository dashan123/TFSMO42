package cn.com.cloud9.asynctask;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

import okhttp3.OkHttpClient;
import okhttp3.OkHttpClient.Builder;
import okhttp3.Request;
import okhttp3.Response;

public class OKHttpUtil {
	private static OkHttpClient mOkHttpClient = null;
	static {
		OkHttpClient.Builder builder = new Builder();
		// 网络的链接时间
		builder.connectTimeout(50, TimeUnit.SECONDS);
		mOkHttpClient = builder.build();
	}

	// Okhttp它是如何处理请求的呢？
	public static Response execute(Request request) throws IOException {

		// 把一个okhttp的request放入call中并且执行
		return mOkHttpClient.newCall(request).execute();
	}

	public static String getStringFromUrl(String url) {

		// 根据 传入的参数url，来实例一个请求
		Request request = new Request.Builder().url(url).build();
		try {
			Response response = execute(request);
			// 判断请求是否成功
			if (response.isSuccessful()) {
				// 把response中的返回的文本取出
				String res = response.body().string();
				return res;
			}

		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return null;

	}

	public static byte[] getByteArrayFromUrl(String url) {
		// 根据 传入的参数url，来实例一个请求
		Request request = new Request.Builder().url(url).build();

		try {
			Response response = execute(request);
			// 判断请求是否成功
			if (response.isSuccessful()) {
				// 把response中的返回的文本取出
				byte [] res = response.body().bytes();
				return res;
			}

		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return null;
	}

}
