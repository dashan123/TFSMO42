package cn.com.cloud9.common;

import com.amap.api.location.AMapLocation;

import org.xutils.db.annotation.Column;
import org.xutils.db.annotation.Table;

import cn.com.cloud9.javabean.DecimalClipping;

@Table(name="location")
public class AmLocationEntity {

    @Column(name = "id", isId = true)
    private int id;
    @Column(name = "userid")
    private String userid;
    @Column(name = "time")
    private long time;
    @Column(name = "latitude")
    private double latitude;
    @Column(name = "longitude")
    private double longitude;
    @Column(name = "speed")
    private float speed;
    @Column(name = "bearing")
    private float bearing;
    @Column(name = "extra")
    private String extra;

    private String newLatitude;
    private String newLongitude;

    public AmLocationEntity() {
    }

    public AmLocationEntity(AMapLocation loc, String userid, String extra) {
        newLatitude = DecimalClipping.getInstance().format(loc.getLatitude());
        newLongitude = DecimalClipping.getInstance().format(loc.getLongitude());

        this.userid = userid;
        this.time = loc.getTime();
        this.latitude = Double.parseDouble(newLatitude);
        this.longitude = Double.parseDouble(newLongitude);
        this.speed = loc.getSpeed();
        this.bearing = loc.getBearing();
        this.extra = extra;
    }

    public String toParamStringForLoc() {
        StringBuffer locInfo = new StringBuffer();
        locInfo.append(time).append(",");
        locInfo.append(latitude).append(",");
        locInfo.append(longitude).append(",");
        locInfo.append(speed).append(",");
        locInfo.append(bearing);
        return locInfo.toString();
    }

    public String toParamStringForSave() {
        StringBuffer locInfo = new StringBuffer();
        locInfo.append(id).append(",");
        locInfo.append("'").append(userid).append("',");
        locInfo.append(time).append(",");
        locInfo.append(latitude).append(",");
        locInfo.append(longitude).append(",");
        locInfo.append(speed).append(",");
        locInfo.append(bearing).append(",");
        locInfo.append("'").append(extra).append("'");
        return locInfo.toString();
    }

    public float getBearing() {
        return bearing;
    }

    public void setBearing(float bearing) {
        this.bearing = bearing;
    }

    public String getExtra() {
        return extra;
    }

    public void setExtra(String extra) {
        this.extra = extra;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    public float getSpeed() {
        return speed;
    }

    public void setSpeed(float speed) {
        this.speed = speed;
    }

    public long getTime() {
        return time;
    }

    public void setTime(long time) {
        this.time = time;
    }

    public String getUserid() {
        return userid;
    }

    public void setUserid(String userid) {
        this.userid = userid;
    }
}
