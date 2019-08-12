package cn.com.cloud9.tfsmo.android42;

import android.os.Handler;
import android.os.Message;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;
import java.net.URLConnection;

import cn.com.cloud9.util.LogUtils;

public class FileDownloader extends Thread {
	String _urlStr;//要下载的路径
	String _dirName;//要保存的目标文件夹
	String _fileName;//要保存的文件名
	Handler _myHandler;

	public FileDownloader(String urlStr,String dirName,String fileName,Handler myHandler)
	{
		_urlStr = urlStr;
		_dirName = dirName;
		_fileName = fileName;
		_myHandler = myHandler;
	}

	@Override
	public void run() {
		//准备拼接新的文件名（保存在存储卡后的文件名）
		String newFilename = _fileName;
		if (!_dirName.endsWith("/")) _dirName += "/";
		newFilename = _dirName + newFilename;
		File file = new File(newFilename);
		//如果目标文件已经存在，则删除。产生覆盖旧文件的效果
		if(file.exists())
		{
			file.delete();
		}
		try {
			// 构造URL
			URL url = new URL(_urlStr);
			// 打开连接
			URLConnection con =url.openConnection();

			//setRequestProperty主要是设置HttpURLConnection请求头里面的属性，至于要设置什么这个要看服务器端的约定

			//是浏览器发给服务器,声明浏览器支持的编码类型
			con.setRequestProperty("Accept-Encoding","identity");

			//采用chunked编码方式来进行报文体的传输。chunked编码的基本方法是将大块数据分解成多块小数据，每块都可以自指定长度
			con.setRequestProperty("Transfer-Encoding","chunked");

			//在Http协议消息头中，使用Content-Type来表示具体请求中的媒体类型信息
			con.setRequestProperty("Content-Type","application/x-download;charset=UTF-8");
			//con.setRequestProperty("Set-Cookie","JSESSIONID=87A083DD53CE75CABA459E111DABE4EA; Path=/ycoa/; HttpOnly");


			//获得文件的长度
			int contentLength = con.getContentLength();
			LogUtils.d("长度："+contentLength);
			// 输入流

			InputStream is = con.getInputStream();

			int hasRead = 0;//已经读取了多少
			int progress = 0;

			// 1K的数据缓冲
			byte[] bs = new byte[1024];
			// 读取到的数据长度
			int len;
			// 输出的文件流
			LogUtils.d("准备FileOutputStream");
			OutputStream os = new FileOutputStream(newFilename);
			LogUtils.d("准备FileOutputStream完毕");
			// 开始读取

			while ((len = is.read(bs)) != -1) {
				if(CollectionWebview.downbool==false) {
					LogUtils.d("break");
					break;
				}
				os.write(bs, 0, len);

				//Log.v("aaaaaaaaa","读取");

				//记录完成了的多少
				hasRead +=len;
				progress = (int)((double)hasRead/((double)contentLength) * 100);//完成的百分比
				//发送通知
				Message msg = _myHandler.obtainMessage();
				msg.arg1 = progress;
				msg.sendToTarget();

			}
			// 完毕，关闭所有链接
//			    OaWebview.downbool=true;
			os.flush();
			os.close();
			is.close();

		} catch (Exception e) {
			e.printStackTrace();
			//错误通知
			Message msg = _myHandler.obtainMessage();
			msg.arg1 = -1;
			msg.sendToTarget();
		}
		CollectionWebview.downbool=false;

	}
}
