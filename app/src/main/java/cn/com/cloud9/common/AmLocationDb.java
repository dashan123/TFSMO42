package cn.com.cloud9.common;

import android.os.Environment;
import android.util.Log;

import org.xutils.DbManager;
import org.xutils.ex.DbException;
import org.xutils.x;

import java.io.File;

public class AmLocationDb {

    private static DbManager.DaoConfig daoConfig;

    private static DbManager getDbManager() {
        if (daoConfig == null) {
            daoConfig = new DbManager.DaoConfig()
                    .setDbName("loc.db")
                    .setDbDir(new File(Environment.getExternalStorageDirectory() + "/tfsmo"))
                    .setDbOpenListener(new DbManager.DbOpenListener() {
                        @Override
                        public void onDbOpened(DbManager db) {
                            //require api-11
                            //db.getDatabase().enableWriteAheadLogging();
                        	Log.d("flag", "onDbOpened >>>>>>");
                        }
                    });
        }
        return x.getDb(daoConfig);
    }

    public static void save(AmLocationEntity entity) throws DbException {
        DbManager db = getDbManager();
        db.save(entity);
    }

    public static AmLocationEntity getFirstEntity() throws DbException {
        DbManager db = getDbManager();
        return db.findFirst(AmLocationEntity.class);
    }

    public static AmLocationEntity getLastEntity() throws DbException {
        DbManager db = getDbManager();
        return db.selector(AmLocationEntity.class).orderBy("id",true).findFirst();
    }

    public static void deleteEntity(int id) throws DbException {
        DbManager db = getDbManager();
        db.deleteById(AmLocationEntity.class, id);
    }

}
