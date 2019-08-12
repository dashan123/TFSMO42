package cn.com.cloud9.asynctask;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class URL_DownLoad {

	public static byte[] getURLcode(String path){
		URL url;
		ByteArrayOutputStream baos;
		try {
			url = new URL(path);
			HttpURLConnection connection=(HttpURLConnection) url.openConnection();
			connection.setReadTimeout(10000);
			connection.setConnectTimeout(10000);
		
			connection.connect();
			if(connection.getResponseCode()==200){
				InputStream is=connection.getInputStream();
				baos=new ByteArrayOutputStream();
				byte[] arr=new byte[1024];
				int len;
				while((len=is.read(arr))!=-1){
					baos.write(arr,0,len);
				}
				is.close();
				return baos.toByteArray();
			}
			
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		
		return null;
		
	}
}
