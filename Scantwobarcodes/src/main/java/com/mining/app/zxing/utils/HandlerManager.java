package com.mining.app.zxing.utils;

import android.os.Handler;

import com.example.twobarcodes.MipcaActivityCapture;

public class HandlerManager {

    public static final String TAG = "Manager";

    private static HandlerManager mInstance;

    public Handler mHandler;

    public synchronized static HandlerManager getInstance() {
        if (mInstance == null) {
            mInstance = new HandlerManager();
        }
        return mInstance;
    }

    public void setHandler(Handler handler) {
        this.mHandler = handler;
    }

    public void sendSuccessMessage() {
        mHandler.sendEmptyMessage(MipcaActivityCapture.OK);
    }

    public void sendFailMessage() {
        mHandler.sendEmptyMessage(MipcaActivityCapture.fail);
    }
}
