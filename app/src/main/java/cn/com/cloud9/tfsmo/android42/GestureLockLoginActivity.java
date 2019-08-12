package cn.com.cloud9.tfsmo.android42;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.TextView;

import cn.com.cloud9.common.Lock9View;

public class GestureLockLoginActivity extends Activity {

    private String userid;
    private String passwordSet;

    private Lock9View lock9View;
    private TextView lockText;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_gestrue_lock);
//        this.getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        init();
    }

    private void init() {
        SharedPreferences sharedPreferences = getSharedPreferences("lock", MODE_PRIVATE);
        userid = sharedPreferences.getString("userid", null);
        passwordSet = sharedPreferences.getString("password", null);
        if (passwordSet == null) {
            finish();
        }
        lock9View = (Lock9View)findViewById(R.id.lock_set_view);
        lock9View.setCallBack(callBack);
        lockText = (TextView)findViewById(R.id.lock_set_text);
        lockText.setText(R.string.gesture_lock_login);
    }


    private Lock9View.CallBack callBack = new Lock9View.CallBack() {
        @Override
        public boolean onFinish(String password) {
            if (password != null && !"".equals(password)) {
                if (password.equals(passwordSet)) {
                    Intent it = new Intent();
                    it.putExtra("userid", userid);
                    setResult(Activity.RESULT_OK, it);
                    finish();
                    return true;
                } else {
                    lockText.setText(R.string.gesture_lock_login_err);
                    lock9View.setError();
                }
            }
            return false;
        }
    };
}
