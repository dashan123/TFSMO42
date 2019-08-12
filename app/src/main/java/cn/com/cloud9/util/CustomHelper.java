package cn.com.cloud9.util;

import android.net.Uri;
import android.os.Environment;
import android.view.View;

import com.jph.takephoto.app.TakePhoto;
import com.jph.takephoto.compress.CompressConfig;
import com.jph.takephoto.model.TakePhotoOptions;

import java.io.File;


/**
 * - 支持通过相机拍照获取图片
 * - 支持从相册选择图片
 * - 支持从文件选择图片
 * - 支持多图选择
 * - 支持批量图片裁切
 * - 支持批量图片压缩
 * - 支持对图片进行压缩
 * - 支持对图片进行裁剪
 * - 支持对裁剪及压缩参数自定义
 * - 提供自带裁剪工具(可选)
 * - 支持智能选取及裁剪异常处理
 * - 支持因拍照Activity被回收后的自动恢复
 * Author: crazycodeboy
 * Date: 2016/9/21 0007 20:10
 * Version:4.0.0
 * 技术博文：http://www.devio.org
 * GitHub:https://github.com/crazycodeboy
 * Email:crazycodeboy@gmail.com
 */
public class CustomHelper {
    private View rootView;
    private int layout;
    private int limit;

//    public static CustomHelper of(View rootView) {
//        return new CustomHelper(rootView);
//    }

//    private CustomHelper(View rootView) {
//        this.rootView = rootView;
////        init();
//    }

    public static CustomHelper of(int layout) {
        return new CustomHelper(layout);
    }

    private CustomHelper(int layout) {
        this.layout = layout;
//        init();
    }


//    private void init() {
//        rgCrop = (RadioGroup) rootView.findViewById(R.id.rgCrop);
//        rgCompress = (RadioGroup) rootView.findViewById(R.id.rgCompress);
//        rgCompressTool = (RadioGroup) rootView.findViewById(R.id.rgCompressTool);
//        rgCropSize = (RadioGroup) rootView.findViewById(R.id.rgCropSize);
//        rgFrom = (RadioGroup) rootView.findViewById(R.id.rgFrom);
//        rgPickTool = (RadioGroup) rootView.findViewById(R.id.rgPickTool);
//        rgRawFile = (RadioGroup) rootView.findViewById(R.id.rgRawFile);
//        rgCorrectTool = (RadioGroup) rootView.findViewById(R.id.rgCorrectTool);
//        rgShowProgressBar = (RadioGroup) rootView.findViewById(R.id.rgShowProgressBar);
//        rgCropTool = (RadioGroup) rootView.findViewById(R.id.rgCropTool);
//        etCropHeight = (EditText) rootView.findViewById(R.id.etCropHeight);
//        etCropWidth = (EditText) rootView.findViewById(R.id.etCropWidth);
//        etLimit = (EditText) rootView.findViewById(R.id.etLimit);
//        etSize = (EditText) rootView.findViewById(R.id.etSize);
//        etHeightPx = (EditText) rootView.findViewById(R.id.etHeightPx);
//        etWidthPx = (EditText) rootView.findViewById(R.id.etWidthPx);
//
//    }

    public void onClick(int limit, TakePhoto takePhoto) {
        File file = new File(Environment.getExternalStorageDirectory(), "/paymentVoucher/" + System.currentTimeMillis() + ".png");
        if (!file.getParentFile().exists()) {
            file.getParentFile().mkdirs();
        }
        Uri imageUri = Uri.fromFile(file);

        configCompress(takePhoto);
        configTakePhotoOption(takePhoto);

        //裁剪
//      takePhoto.onPickMultipleWithCrop(limit, getCropOptions());
        //不裁剪
        takePhoto.onPickMultiple(limit);


        //大于一张照片时会默认切换到 takephoto的相册下
        //从文件选择照片
//      takePhoto.onPickFromDocumentsWithCrop(imageUri, getCropOptions());
//      takePhoto.onPickFromDocuments();

        //从相册选择照片
//      takePhoto.onPickFromGalleryWithCrop(imageUri, getCropOptions());
//      takePhoto.onPickFromGallery();

        //拍照选照片
//        if (rgCrop.getCheckedRadioButtonId() == R.id.rbCropYes) {
//            takePhoto.onPickFromCaptureWithCrop(imageUri, getCropOptions());
//        } else {
//            takePhoto.onPickFromCapture(imageUri);
//        }
    }

    private void configTakePhotoOption(TakePhoto takePhoto) {
        TakePhotoOptions.Builder builder = new TakePhotoOptions.Builder();
            //使用系统相册还是使用 takephoto自带相册
        builder.setWithOwnGallery(true);
//            builder.setCorrectImage(true);
        takePhoto.setTakePhotoOptions(builder.create());

    }

    private void configCompress(TakePhoto takePhoto) {
        //不压缩
//        takePhoto.onEnableCompress(null, false);
        int maxSize = 204800;//单位 B
        int width = 1080; //像素
        int height = 1920;
        boolean showProgressBar = false; //是否显示压缩进度条
        boolean enableRawFile = true; //是否保留原文件
        CompressConfig config;
        //使用库里自带的压缩工具
        config = new CompressConfig.Builder().setMaxSize(maxSize)
            .setMaxPixel(width >= height ? width : height)
            .enableReserveRaw(enableRawFile)
            .create();
        //使用LUBAN压缩
//        LubanOptions option = new LubanOptions.Builder().setMaxHeight(height).setMaxWidth(width).setMaxSize(maxSize).create();
//        config = CompressConfig.ofLuban(option);
//        config.enableReserveRaw(enableRawFile);

        takePhoto.onEnableCompress(config, showProgressBar);

    }

//    private CropOptions getCropOptions() {
//        if (rgCrop.getCheckedRadioButtonId() != R.id.rbCropYes) {
//            return null;
//        }
//        int height = Integer.parseInt(etCropHeight.getText().toString());
//        int width = Integer.parseInt(etCropWidth.getText().toString());
//        boolean withWonCrop = rgCropTool.getCheckedRadioButtonId() == R.id.rbCropOwn ? true : false;
//
//        CropOptions.Builder builder = new CropOptions.Builder();
//
//        if (rgCropSize.getCheckedRadioButtonId() == R.id.rbAspect) {
//            builder.setAspectX(width).setAspectY(height);
//        } else {
//            builder.setOutputX(width).setOutputY(height);
//        }
//        builder.setWithOwnCrop(withWonCrop);
//        return builder.create();
//    }

}
