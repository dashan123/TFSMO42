package cn.com.cloud9.util;

import android.os.Environment;

import org.xutils.DbManager;
import org.xutils.db.annotation.Column;
import org.xutils.db.annotation.Table;
import org.xutils.db.sqlite.WhereBuilder;
import org.xutils.ex.DbException;
import org.xutils.x;

import java.io.File;

public class DBUtil {

    @Table(name="storage")
    private static class Entity {
        @Column(name = "id", isId = true)
        private int id;
        @Column(name = "key")
        private String key;
        @Column(name = "value")
        private String value;

        public Entity() {
        }
        public Entity(String key, String value) {
            this.key = key;
            this.value = value;
        }

        public int getId() {
            return id;
        }
        public void setId(int id) {
            this.id = id;
        }
        public String getKey() {
            return key;
        }
        public void setKey(String key) {
            this.key = key;
        }
        public String getValue() {
            return value;
        }
        public void setValue(String value) {
            this.value = value;
        }
    }

    private static DbManager.DaoConfig daoConfig;

    private static DbManager getDbManager() {
        if (daoConfig == null) {
            daoConfig = new DbManager.DaoConfig()
                    .setDbName("storage.db")
                    .setDbDir(new File(Environment.getExternalStorageDirectory() + "/tfsmo"))
                    .setDbOpenListener(new DbManager.DbOpenListener() {
                        @Override
                        public void onDbOpened(DbManager db) {
                            //require api-11
                            //db.getDatabase().enableWriteAheadLogging();
                        }
                    });
        }
        return x.getDb(daoConfig);
    }

    public static void save(String key, String value) throws DbException {
        DbManager db = getDbManager();
        Entity entity = db.selector(Entity.class).where("key", "=", key).findFirst();
        if (entity == null) {
            entity = new Entity(key, value);
            db.save(entity);
        } else {
            if (value == null && "".equals(value)) {
                db.delete(entity);
            } else {
                entity.value = value;
                db.update(entity, "value");
            }
        }
    }

    public static String load(String key) throws DbException {
        DbManager db = getDbManager();
        Entity entity = db.selector(Entity.class).where("key", "=", key).findFirst();
        if (entity == null) {
            return "";
        } else {
            return entity.value;
        }
    }

    public static void clear() throws DbException {
        DbManager db = getDbManager();
        db.delete(Entity.class);
    }

    //below for with func

    @Table(name="func")
    private static class EntityFunc {
        @Column(name = "id", isId = true)
        private int id;
        @Column(name = "data")
        private String data;
        @Column(name = "func")
        private String func;

        public EntityFunc() {
        }
        public EntityFunc(String data, String func) {
            this.data = data;
            this.func = func;
        }
        public int getId() {
            return id;
        }
        public void setId(int id) {
            this.id = id;
        }
        public String getData() {
            return data;
        }
        public void setData(String data) {
            this.data = data;
        }
        public String getFunc() {
            return func;
        }
        public void setFunc(String func) {
            this.func = func;
        }

        public String toParamString() {
            StringBuffer sb = new StringBuffer();
            sb.append(id).append(",");
            sb.append("'").append(data == null ? "" : data.replace("'", "\\'")).append("',");
            sb.append("'").append(func).append("'");
            return sb.toString();
        }
    }

    public static void addFunc(String data, String func) throws DbException {
        DbManager db = getDbManager();
        db.save(new EntityFunc(data, func));
    }

    public static String fetchFirstFunc() throws DbException {
        DbManager db = getDbManager();
        EntityFunc ef = db.findFirst(EntityFunc.class);
        return ef.toParamString();
    }

    public static void deleteFunc(int id) throws DbException {
        DbManager db = getDbManager();
        db.deleteById(EntityFunc.class, id);
    }

}
