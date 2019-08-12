package com.mining.app.zxing.utils;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Matrix;
import android.media.ExifInterface;
import android.util.Base64;
import android.util.Log;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

public class Base64Util {

    public static String fileToBase64(String filePath, int quality,Context context) {
        Log.i("flag","fileToBase64方法里filePath= "+filePath);
        BitmapFactory.Options opt = new BitmapFactory.Options();
        opt.inJustDecodeBounds = true;
//        Bitmap bm = BitmapFactory.decodeFile(filePath,opt);
        opt.inSampleSize = 2;
        opt.inJustDecodeBounds = false;
        Bitmap bm= BitmapFactory.decodeFile(filePath, opt);
        String phoneBrand = getPhoneBrand();
        Bitmap returnBm = null;
//        Log.i("flag","phoneBrand= "+phoneBrand);
//        ToastUtils.shortToast(context,"手机品牌是："+PhoneUtil.getPhoneBrand());
        if (phoneBrand!=null && (phoneBrand.equals("samsung") || phoneBrand.equals("Sony"))) {
            //如果是三星手机，则需要旋转图片
            int degree = getBitmapDegree(filePath);
            // 根据旋转角度，生成旋转矩阵
            Matrix matrix = new Matrix();
            matrix.postRotate(degree);
            if (bm != null) {
                returnBm = Bitmap.createBitmap(bm, 0, 0, bm.getWidth(), bm.getHeight(), matrix, true);
            }
        }

        if (returnBm!=null) {
            return bitmapToBase64(returnBm, quality);
        }

        return bitmapToBase64(bm, quality);
    }

    /**
     * 获取原始图片的角度（解决三星手机拍照后图片是横着的问题）
     * @param path 图片的绝对路径
     * @return 原始图片的角度
     */
    public static int getBitmapDegree(String path) {
        int degree = 0;
        try {
            // 从指定路径下读取图片，并获取其EXIF信息
            ExifInterface exifInterface = new ExifInterface(path);
            // 获取图片的旋转信息
            int orientation = exifInterface.getAttributeInt(ExifInterface.TAG_ORIENTATION,
                    ExifInterface.ORIENTATION_NORMAL);
            Log.e("jxf", "orientation" + orientation);
            switch (orientation) {
                case ExifInterface.ORIENTATION_ROTATE_90:
                    degree = 90;
                    break;
                case ExifInterface.ORIENTATION_ROTATE_180:
                    degree = 180;
                    break;
                case ExifInterface.ORIENTATION_ROTATE_270:
                    degree = 270;
                    break;
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return degree;
    }

    //获取手机的品牌
    public static String getPhoneBrand() {
        String androidDisplay = null;
        androidDisplay = android.os.Build.BRAND;
        return androidDisplay;
    }

    /**
     *CRLF 这个参数看起来比较眼熟，它就是Win风格的换行符，意思就是使用CR LF这一对作为一行的结尾而不是Unix风格的LF
     DEFAULT 这个参数是默认，使用默认的方法来加密
     NO_PADDING 这个参数是略去加密字符串最后的”=”
     NO_WRAP 这个参数意思是略去所有的换行符（设置后CRLF就没用了）
     URL_SAFE 这个参数意思是加密时不使用对URL和文件名有特殊意义的字符来作为加密字符，具体就是以-和_取代+和/
     */
    public static String bitmapToBase64(Bitmap bitmap, int quality) {

        String result = null;
        ByteArrayOutputStream baos = null;
        try {
            if (bitmap != null) {
                baos = new ByteArrayOutputStream();
                bitmap.compress(Bitmap.CompressFormat.JPEG, quality, baos);

                baos.flush();
                baos.close();

                byte[] bitmapBytes = baos.toByteArray();
                result = Base64.encodeToString(bitmapBytes, Base64.NO_WRAP);//Base64.DEFAULT
                result = "data:image/jpeg;base64," + result.replace("\n", "");
            }
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            try {
                if (baos != null) {
                    baos.flush();
                    baos.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return result;
    }

//    public static Bitmap base64ToBitmap(String base64Data) {
//        byte[] bytes = Base64.decode(base64Data, Base64.DEFAULT);
//        return BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
//    }

}
