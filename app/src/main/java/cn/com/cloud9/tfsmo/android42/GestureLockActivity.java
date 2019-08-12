package cn.com.cloud9.tfsmo.android42;

import android.app.Activity;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.TextView;

import cn.com.cloud9.common.Lock9View;

public class GestureLockActivity extends Activity {

    private final int STATE_FIRST_SET = 0;
    private final int STATE_CONFIRM = 1;

    private final int STATE_CHANGE_PASSWORD = 2;
    private final int STATE_CLOSE_GESTURE = 3;

    private int state = STATE_CHANGE_PASSWORD;

    private String userid;
    private String passwordSet;

    private Lock9View lock9View;
    private TextView lockText;

    private boolean pwshutoff=true;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_gestrue_lock);

//      this.getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);

        init();

        Log.d("flag", "passwordSet="+passwordSet);

        if (!userid.equals("")) {
            Log.i("flag", "-----------!!!!userid.equals()");
            SharedPreferences sharedPreferences = getSharedPreferences("lock", MODE_PRIVATE);
            String password=sharedPreferences.getString("password", null);
            if (password==null) {
                Log.i("flag", "if (password==null)");
                state=STATE_FIRST_SET;
            }else{
                passwordSet=password;
                Log.d("flag", "if (password==null)   else      passwordSet="+passwordSet);
                state = STATE_CHANGE_PASSWORD;
                lockText.setText(R.string.gesture_lock_old_password);
            }
        }else if (userid.equals("")){
            Log.i("flag", "-----------userid等于空字符串");
            SharedPreferences sharedPreferences = getSharedPreferences("lock", MODE_PRIVATE);
            String password=sharedPreferences.getString("password", null);
            pwshutoff=false;
            Log.i("flag", "password-----------"+password);
            passwordSet=password;
            state=STATE_CLOSE_GESTURE;
            lockText.setText(R.string.gesture_lock_shut_down);
        }
    }

    private void init() {
        userid = getIntent().getStringExtra("userid");
        lock9View = (Lock9View)findViewById(R.id.lock_set_view);
        lock9View.setCallBack(callBack);
        lockText = (TextView)findViewById(R.id.lock_set_text);
        lockText.setText(R.string.gesture_lock_set);
    }

    public void cancel(View view){
        if (userid.equals("")) {
            if (pwshutoff==false) {
                SharedPreferences spForShut = this.getSharedPreferences("closeGestureLock", MODE_PRIVATE);
                SharedPreferences.Editor editor = spForShut.edit();
                editor.putString("canNotShut","no");
                editor.commit();
            }
        }
        finish();
    }

    private Lock9View.CallBack callBack = new Lock9View.CallBack() {
        @Override
        public boolean onFinish(String password) {

            if (password != null && !"".equals(password)) {

//                	Toast.makeText(getApplicationContext(), "password.length="+password.length(), Toast.LENGTH_LONG).show();
                if (state==STATE_CHANGE_PASSWORD) {
                    Log.i("flag", "state==STATE_CHANGE_PASSWORD");
                    if (password.equals(passwordSet)) {

                        Log.d("flag", "--------------------passwordSet.equals(password)");
                        lockText.setText(R.string.gesture_lock_set);
                        state=STATE_FIRST_SET;
                        passwordSet=null;
                    }else{
                        Log.d("flag", "password.equals(passwordSet)   else");
                        lockText.setText(R.string.gesture_lock_old_password_err);
                        lock9View.setError();
                        state=STATE_CHANGE_PASSWORD;
                    }
                }else if (state==STATE_CLOSE_GESTURE) {
                    Log.i("flag","password－－－－"+password+"passwordSet==="+passwordSet);
                    Log.d("flag", "-----------------进入STATE_CLOSE_GESTURE");
                    if (password.equals(passwordSet)) {
                        passwordSet=null;
                        lockText.setText(R.string.gesture_lock_shut_down_ok);
                        finish();
                        password=null;
                        Log.d("flag", "----------------password.equals(passwordSet)");

                    }else{
                        pwshutoff=false;

                        lockText.setText(R.string.gesture_lock_old_password_err);
                        lock9View.setError();
                        state=STATE_CLOSE_GESTURE;
                        Log.d("flag", "password.equals(passwordSet)   else并且 "+state);
                    }
                }else if(state==STATE_FIRST_SET){

                    Log.d("flag", "----------------------state == STATE_FIRST_SET");
                    passwordSet = password;
                    Log.d("flag", "passwordSet="+passwordSet);
                    lockText.setText(R.string.gesture_lock_confirm);
                    state = STATE_CONFIRM;
                } else if (state == STATE_CONFIRM&&password.equals(passwordSet)) {

                    Log.d("flag", "---------------------state == STATE_CONFIRM && password.equals(passwordSet)");
                    state=STATE_CHANGE_PASSWORD;
                    lockText.setText(R.string.gesture_lock_password_success);
                    SharedPreferences sharedPreferences = getSharedPreferences("lock", MODE_PRIVATE);
                    SharedPreferences.Editor editor = sharedPreferences.edit();
                    editor.putString("userid", userid);
                    editor.putString("password", password);
                    Log.d("flag", "password在STATE_CONFIRM里="+password);
                    editor.commit();
                    finish();
                    return true;
                } else{
                    Log.d("flag", "else{");
                    passwordSet = null;
                    lockText.setText(R.string.gesture_lock_confirm_err);
                    lock9View.setError();
                    state = STATE_FIRST_SET;
                }
            }
//                else if (state == STATE_CHANGE_PASSWORD) {
//					lockText.setText(R.string.gesture_lock_old_password);
//					SharedPreferences sharedPreferences=getSharedPreferences("password", MODE_PRIVATE);
//					String passWord = sharedPreferences.getString("password", password);
//					if (passWord.equals(object)) {
//						
//					}
//				}

            return false;
        }
    };

}