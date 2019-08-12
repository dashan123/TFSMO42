package cn.com.cloud9.util;

import android.os.Environment;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.Writer;
import java.text.SimpleDateFormat;
import java.util.Date;

public class LogUtil {

    public static final String LOG_FILE_NAME = "tfsmo.log";

    public static void out(String msg) {
        try {
            File logf = new File(Environment.getExternalStorageDirectory() + File.separator + LOG_FILE_NAME);
            SimpleDateFormat df = new SimpleDateFormat("[yyyy-MM-dd HH:mm:ss]: ");
            Writer writer = new BufferedWriter(new FileWriter(logf.getAbsolutePath(), true), 1024);
            writer.write(df.format(new Date()));
            writer.write(msg);
            writer.write("\n");
            writer.flush();
            writer.close();
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

}
