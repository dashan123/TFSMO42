package com.mining.app.zxing.utils;

import android.app.Activity;

public class ScreenUtils {

    public static int getScreenHeight(Activity activity){
        int height = activity.getWindowManager().getDefaultDisplay().getHeight();
        if (0 != height) {
            return height;
        }
        return 0;
    }

    public static int getScreenWidth(Activity activity){
        int width = activity.getWindowManager().getDefaultDisplay().getWidth();
        if (0 != width) {
            return width;
        }
        return 0;
    }
}
