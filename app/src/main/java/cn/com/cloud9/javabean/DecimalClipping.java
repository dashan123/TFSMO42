package cn.com.cloud9.javabean;

import java.text.DecimalFormat;

/**
 * Created by yaxian on 2017/7/19.
 */

public class DecimalClipping {

    private static DecimalFormat decimalFormatForLoc;
    private DecimalClipping(){};

    public static DecimalFormat getInstance() {
        if (decimalFormatForLoc == null) {
            synchronized (DecimalClipping.class) {
                if (decimalFormatForLoc == null) {
                    decimalFormatForLoc = new DecimalFormat("0.000000");
                }
            }
        }
        return decimalFormatForLoc;
    }
}
