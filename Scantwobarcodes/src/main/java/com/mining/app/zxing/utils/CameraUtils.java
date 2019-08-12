package com.mining.app.zxing.utils;

import android.hardware.Camera.Size;
import android.util.Log;

import java.util.Collections;
import java.util.Comparator;
import java.util.List;

public class CameraUtils {

    public static Size getProperSize(List<Size> sizeList)
    {
        //先对传进来的size列表进行排序
        Collections.sort(sizeList, new SizeComparator());//升序
//        Collections.reverse(sizeList);

        Size result = null;
        for(Size size: sizeList) {
//            float curRatio =  ((float)size.height) / size.width;
            if(size.width > 1000 && size.height > 1000)
            {
                Log.i("flag","=====================1000100010001000"+ size.width+" "+size.height);
                result = size;
                return result;
            }
        }
        return sizeList.get(sizeList.size());
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
