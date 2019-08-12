package cn.com.cloud9.util;

import android.content.Context;
import android.graphics.Point;
import android.hardware.Camera.Size;
import android.os.Build;
import android.util.Log;
import android.view.Display;
import android.view.WindowManager;

import java.util.Collections;
import java.util.Comparator;
import java.util.List;

public class CameraUtils {

    public static Point getFullScreenSize(Context context) {
        WindowManager windowManager = (WindowManager) context.getSystemService(Context.
                        WINDOW_SERVICE);
        final Display display = windowManager.getDefaultDisplay();
        Point outPoint = new Point();
        if (Build.VERSION.SDK_INT >= 19) {
            // 可能有虚拟按键的情况
            display.getRealSize(outPoint);
        } else {
            // 不可能有虚拟按键
            display.getSize(outPoint);
        }
        return outPoint;
    }

    public static Size getProperPreViewSize(List<Size> sizeList, float displayRatio)
    {
        //先对传进来的size列表进行排序
        Collections.sort(sizeList, new SizeComparator());
        Collections.reverse(sizeList);

        Size result = null;
        float middle = 100f;
        float chazhi;
        for(Size size: sizeList) {
//            float curRatio =  ((float)size.width) / size.height;
            //预览时其实是宽的值大于高的值, 所以此处用高除以宽来计算宽高比
            float curRatio =  ((float)size.height) / size.width;
//            Log.i("flag","curRatio - displayRatio  ++++++++++"+ Math.abs(curRatio - displayRatio));
            //预览时取一个当前支持的预览比率和surfaceview的宽高比差值最小的
            chazhi = Math.abs(curRatio - displayRatio);
            if (chazhi < middle) {
                middle = chazhi;
                result = size;
            }
        }
        Log.i("flag","最后的预览宽高是++++++++++"+ result.width + "  " + result.height);
        return result;
    }

    public static Size getProperSize(List<Size> sizeList, float displayRatio)
    {
        //先对传进来的size列表进行排序
        Collections.sort(sizeList, new SizeComparator());
        Collections.reverse(sizeList);

        Size result = null;
        float middle = 100f;
        float chazhi;
        for(Size size: sizeList) {
            //预览时其实是宽的值大于高的值, 所以此处用高除以宽来计算宽高比
            float curRatio =  ((float)size.height) / size.width;

            if(curRatio - displayRatio == 0 && (size.width >1000 && size.height>1000))
            {
                Log.i("flag","curRatio - displayRatio == 0==============");
                result = size;
                return result;
            }
        }
        for(Size size: sizeList) {
            float curRatio =  ((float)size.height / size.width);
            if(curRatio == 9f/16 && (size.height>1000 && size.width>1000)) {
                result = size;
                Log.i("flag","if(curRatio == 9f/16)==============result:"+ result.width+"高是"+result.height  );
                return result;
            }
        }
        for(Size size: sizeList) {
            float curRatio =  ((float)size.height / size.width);
            if(curRatio == 3f/4 && (size.height>1000 && size.width>1000))
            {
                result = size;
                Log.i("flag","if(curRatio == 3f/4)==============result:"+ result.width+"高是"+result.height);
                return result;
            }
        }
        Log.i("flag","全都没有,  return 固定的吧====================="+sizeList.size());
        return sizeList.get((int) Math.rint(sizeList.size()/2));
    }

    static class SizeComparator implements Comparator<Size>
    {

        @Override
        public int compare(Size lhs, Size rhs) {
            // TODO Auto-generated method stub
            Size size1 = lhs;
            Size size2 = rhs;
            if(size1.width < size2.width
                    || size1.width == size2.width && size1.height < size2.height)
            {
                return -1;
            }
            else if(!(size1.width == size2.width && size1.height == size2.height))
            {
                return 1;
            }
            return 0;
        }

    }
}
