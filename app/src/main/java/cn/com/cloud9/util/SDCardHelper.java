package cn.com.cloud9.util;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Environment;
import android.os.StatFs;
import android.util.Log;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;

import cn.com.cloud9.common.LogService;

public class SDCardHelper {
	public static final String FILE_NAME = "createfile";

	/**
	 * boolean isSDCardMounted()判断SD卡是否挂载 String getSDCardPath() 获取SD卡目录 long
	 * getSDCardSize() 获取SD空间大小 long getSDCardFreeSize() 获取SD卡剩余空间
	 * saveFileToSDCard(byte[] data, String dir,String filename) 保存数据到指定目录
	 * readFileFromSDCard(String filepath) 从SD卡获取数据
	 */

	/**
	 * 返回SDCard的是否挂载
	 *
	 * @return
	 */
	public static boolean isSDCardMounted() {
		return Environment.getExternalStorageState().equals(
				Environment.MEDIA_MOUNTED);
	}

	/**
	 * 返回SDCard路径
	 *
	 * @return
	 */
	public static String getSDCardPath() {
		if (isSDCardMounted()) {
			return Environment.getExternalStorageDirectory().getAbsolutePath();
		}
		return null;
	}

	/**
	 * 获取SDCard大小
	 *
	 * @return
	 */
	public static long getSDCardSize() {
		String path = getSDCardPath();
		if (path != null) { // statistics File System
			StatFs sf = new StatFs(path);
			// 获取块的个数
			long blockcount = sf.getBlockCount();
			// 块的大小
			long blocksize = sf.getBlockSize();

			return blockcount * blocksize;
		}
		return 0;
	}

	/**
	 * 获取SDCard的剩余空间大小
	 *
	 * @return
	 */
	public static long getSDCardFreeSize() {
		String path = getSDCardPath();
		if (path != null) { // statistics File System
			StatFs sf = new StatFs(path);
			// 获取块的个数
			long blockcount = sf.getFreeBlocks();
			// 块的大小
			long blocksize = sf.getBlockSize();

			return blockcount * blocksize;
		}
		return 0;
	}

	/**
	 * 获取SDCard的可用空间大小
	 *
	 * @return
	 */
	public static long getSDCardAvailableSize() {
		String path = getSDCardPath();
		if (path != null) { // statistics File System
			StatFs sf = new StatFs(path);
			// 获取块的个数
			long blockcount = sf.getAvailableBlocks();
			// 块的大小
			long blocksize = sf.getBlockSize();

			return blockcount * blocksize;
		}
		return 0;
	}

	/**
	 * 保存数据到SDcard
	 *
	 * @param data
	 *            存储的数据
	 * @param dir
	 *            要存储的文件夹
	 * @param filename
	 *            文件名
	 * @return
	 */
	static File file = null;
	public static boolean saveFileToSDCard(byte[] data, String dir, String filename, Context context) {
		File dirFile = new File(getSDCardPath() + File.separator + dir);
		if (!dirFile.exists()) {
			dirFile.mkdirs();
		}
		// 保存数据
		// 1判断空间是否够
		if (getSDCardAvailableSize() >= data.length) {
			if (filename.equals("trajectoryLog.txt")) {
				SharedPreferences sp01 = context.getSharedPreferences(FILE_NAME, context.MODE_MULTI_PROCESS);
				boolean isCreated = sp01.getBoolean("isCreated",false);
				if (null==file) {
					file = new File(dirFile, filename);
				}
				try {
					if (!file.exists()) {
						file.createNewFile();

						//日志被删除后清空SP里的time1
						SharedPreferences sp = context.getSharedPreferences("spForLogTime",context.MODE_MULTI_PROCESS);
						sp.edit().clear().commit();

						Intent intent = new Intent();
						intent.setAction(LogService.DELETE_LOG_FILE);
						context.sendBroadcast(intent);
					}
				} catch (IOException e) {
					e.printStackTrace();
				}
			}else{
				if (null==file) {
					file = new File(dirFile, filename);
					Log.i("flag","file = new File-------------------------------");
				}
				try {
					if (!file.exists()) {
						file.createNewFile();
						Log.i("flag","!file.exists() ================================ ");
					}
				} catch (IOException e) {
					e.printStackTrace();
				}
			}

			FileOutputStream fos=null;
			try {
				fos = new FileOutputStream(file,true);
//				Log.i("flag","fos = new FileOutputStream(file,true)");
				fos.write(data);
				return true;
			} catch (Exception e) {
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
		return false;
	}

	/**
	 * 从SDcard读取数据
	 *
	 * @param filepath  绝对路径
	 * @return
	 */
	public static byte[] readFileFromSDCard(String filepath) {

		ByteArrayOutputStream baos=null;
		File file=new File(filepath);
		if(file.exists()){
			FileInputStream fis=null;
			try {
				fis=new FileInputStream(file);
				baos=new ByteArrayOutputStream();
				byte[] buf=new byte[1023*10];
				int len=0;
				while((len=fis.read(buf))!=-1){
					baos.write(buf,0,len);
				}
				return baos.toByteArray();
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}finally{
				if(fis!=null){
					try {
						fis.close();
					} catch (IOException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
				}
			}

		}

		return null;
	}

	//递归删除文件夹下所有文件和文件夹
	public static void deltAllFiles(File f) {
		if (f.exists()) {
			// 返回一个抽象路径名数组，这些路径名表示此抽象路径名表示的目录中的文件
			File[] files = f.listFiles();
			if (files != null) {
				for (File file : files)
					if (file.isDirectory()) {
						deltAllFiles(file);
						file.delete(); // 删除目录下的所有文件后，该目录变成了空目录，可直接删除
					} else if (file.isFile()) {
						file.delete();
					}
			}
			// f.delete(); //删除最外层的目录
		}
	}

}
