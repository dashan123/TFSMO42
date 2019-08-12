package cn.com.cloud9.tfsmo.android42;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.SharedPreferences.Editor;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.Window;
import android.widget.ImageView;
import android.widget.LinearLayout;

import cn.com.cloud9.switchLayout.OnViewChangeListener;
import cn.com.cloud9.switchLayout.SwitchLayout;
import cn.jpush.android.api.JPushInterface;

public class MainActivity extends Activity {

	SwitchLayout switchLayout;//自定义的控件
	LinearLayout linearLayout;
	int mViewCount;//自定义控件中子控件的个数
	ImageView mImageView[];//底部的imageView
	int mCurSel;//当前选中的imageView

	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
//        super.onCreate(savedInstanceState);
//        JPushInterface.setDebugMode(true);
//        JPushInterface.init(this);

		//判断当前页面是否在栈顶, 如果没有, 就结束掉
		if (!isTaskRoot()) {
			finish();
			return;
		}

		requestWindowFeature(Window.FEATURE_NO_TITLE);
		setContentView(R.layout.main);
//            this.getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
//            	    WindowManager.LayoutParams.FLAG_FULLSCREEN);
		if(isFirstrun())  {
			setContentView(R.layout.switchpic);
			init();
		}
		else {
			Intent intent = new Intent();
			intent.setClass(MainActivity.this, CollectionWebview.class);
			startActivity(intent);
			finish();
		}

	}

	private  Boolean isFirstrun()  {

		//暂时屏掉
		if (true) return false;

		SharedPreferences sharedPreferences = this.getSharedPreferences("share", MODE_PRIVATE);

		boolean isFirstRun = sharedPreferences.getBoolean("isFirstRun", true);
		Editor editor = sharedPreferences.edit();

		if (isFirstRun) {
			Log.d("debug", "第一次运行");
			editor.putBoolean("isFirstRun", false);
			editor.commit();
			return true;
		} else {
			Log.d("debug", "不是第一次运行");
			return false;
		}
	}

	private void init() {
		switchLayout = (SwitchLayout) findViewById(R.id.switchLayoutID);
		linearLayout = (LinearLayout) findViewById(R.id.linerLayoutID);

		//得到子控件的个数
		mViewCount = switchLayout.getChildCount();
		mImageView = new ImageView[mViewCount];
		//设置imageView
		for(int i = 0;i < mViewCount;i++){
			//得到LinearLayout中的子控件
			mImageView[i] = (ImageView) linearLayout.getChildAt(i);
			mImageView[i].setEnabled(true);//控件激活
			mImageView[i].setOnClickListener(new MOnClickListener());
			mImageView[i].setTag(i);//设置与view相关的标签
		}
		//设置第一个imageView不被激活
		mCurSel = 0;
		mImageView[mCurSel].setEnabled(false);
		switchLayout.setOnViewChangeListener(new MOnViewChangeListener());

	}


	//点击事件的监听器
	private class MOnClickListener implements OnClickListener{

		public void onClick(View v) {
			int pos = (Integer) v.getTag();
			System.out.println("pos:--" + pos);
			//设置当前显示的ImageView
			setCurPoint(pos);
			//设置自定义控件中的哪个子控件展示在当前屏幕中
			switchLayout.snapToScreen(pos);
		}
	}


	/**
	 * 设置当前显示的ImageView
	 * @param pos
	 */
	private void setCurPoint(int pos) {
		if(pos < 0 || pos > mViewCount -1 || mCurSel == pos)
			return;
		//当前的imgaeView将可以被激活
		mImageView[mCurSel].setEnabled(true);
		//将要跳转过去的那个imageView变成不可激活
		mImageView[pos].setEnabled(false);
		mCurSel = pos;
	}

	//自定义控件中View改变的事件监听
	private class MOnViewChangeListener implements OnViewChangeListener {

		public void onViewChange(int view) {
			System.out.println("view:--" + view);
			if(view < 0 || mCurSel == view){

				return ;
			}else if(view > mViewCount - 1){
				//当滚动到第五个的时候activity会被关闭
				System.out.println("finish activity");
				finish();
			}
			setCurPoint(view);
		}

	}
}


