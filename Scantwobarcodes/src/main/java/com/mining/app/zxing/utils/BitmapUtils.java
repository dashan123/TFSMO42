package com.mining.app.zxing.utils;

import android.content.Context;
import android.graphics.Bitmap;
import android.os.Environment;
import android.util.Log;
import android.view.View;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;

/**
 * Created by yaxian on 2018/4/16.
 */

public class BitmapUtils {
    public static boolean saveBitmapTofile(Bitmap bmp, String filePath) {
        Bitmap.CompressFormat format = Bitmap.CompressFormat.JPEG;
        int quality = 100;
        OutputStream stream = null;
        boolean isSuccessSaved = false;
        try
        {
            Log.i("tag","aaaaaaaaaaaaaaaaaaaaaa");
            stream = new FileOutputStream(filePath);
            Log.i("tag","bbbbbbbbbbbbbbbbbbbb");
            isSuccessSaved = bmp.compress(format, quality, stream);
            Log.i("tag","ccccccccccccccccccccccc");
            try {
                stream.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        catch (FileNotFoundException e)
        {
            e.printStackTrace();
        }
        return isSuccessSaved;
    }

    /**
     * dip转pix
     * @param context
     * @param dp
     * @return
     */
    public static int dp2px(Context context, float dp) {
        final float scale = context.getResources().getDisplayMetrics().density;
        return (int) (dp * scale + 0.5f);
    }

    /****
     *
     * 截取屏幕,不包含导航栏
     */
    public static boolean getScreenBitmap(String filePath, View decorView, Context context){

        decorView.setDrawingCacheEnabled(true);
        decorView.buildDrawingCache();
        Bitmap bitmap = Bitmap.createBitmap(decorView.getDrawingCache());
        if (bitmap != null) {
            try {
                File file = new File(filePath);
                FileOutputStream os = new FileOutputStream(file);
                bitmap.compress(Bitmap.CompressFormat.PNG, 100, os);
                os.flush();
                os.close();
            } catch (Exception e) {
            }
            return true;
        }
        return false;

    }


}
