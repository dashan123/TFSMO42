package com.mining.app.zxing.utils;

import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.hardware.display.DisplayManager;
import android.hardware.display.VirtualDisplay;
import android.media.Image;
import android.media.ImageReader;
import android.media.projection.MediaProjection;
import android.media.projection.MediaProjectionManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.view.View;

import com.example.twobarcodes.MipcaActivityCapture;

import java.io.File;
import java.nio.ByteBuffer;

/**
 * Created by yaxian on 2018/4/20.
 */

public class PhoneUtils {

    static Bitmap returnBitmap;
    public static Bitmap captureSurfaceview(View view, MediaProjectionManager mMediaProjectionManager, int resultCode, Intent data, Context context){

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            final ImageReader mImageReader = ImageReader.newInstance(view.getWidth(), view.getHeight(), 0x1, 2);
    //			mMediaProjection = mMediaProjectionManager.getMediaProjection(resultCode, data);

            final MediaProjection mMediaProjection = mMediaProjectionManager.getMediaProjection(resultCode, data);

            final VirtualDisplay screenCapture = mMediaProjection.createVirtualDisplay("ScreenCapture",
                    view.getWidth(), view.getHeight(), context.getResources().getDisplayMetrics().densityDpi,
                    DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR,
                    mImageReader.getSurface(), null, null);


            new Handler().postDelayed(new Runnable() {
                @Override
                public void run() {
                    Image image = null;
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                        image = mImageReader.acquireLatestImage();
                    }
                    if (image == null) {
                        return;
                    }
                    int width = 0;
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                        width = image.getWidth();
                        int height = image.getHeight();
                        final Image.Plane[] planes = image.getPlanes();
                        final ByteBuffer buffer = planes[0].getBuffer();
                        int pixelStride = planes[0].getPixelStride();
                        int rowStride = planes[0].getRowStride();
                        int rowPadding = rowStride - pixelStride * width;
                        Bitmap mBitmap;
                        mBitmap = Bitmap.createBitmap(width + rowPadding / pixelStride, height, Bitmap.Config.ARGB_8888);
                        mBitmap.copyPixelsFromBuffer(buffer);
                        mBitmap = Bitmap.createBitmap(mBitmap, 0, 0, width, height);
                        image.close();
                        if (mBitmap != null) {
                            //拿到mitmap
                            returnBitmap = mBitmap;
                            screenCapture.release();
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                                mMediaProjection.stop();
                            }
                        }
                    }
                }
            },0);

        }
        return returnBitmap;
    }
}
