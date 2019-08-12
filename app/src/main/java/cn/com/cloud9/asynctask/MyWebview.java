package cn.com.cloud9.asynctask;

import android.app.Activity;
import android.content.Context;
import android.graphics.Rect;
import android.util.AttributeSet;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.Display;
import android.view.View;
import android.view.ViewTreeObserver;
import android.webkit.WebView;
import android.widget.RelativeLayout;

import cn.com.cloud9.tfsmo.android42.R;

/**
 * Created by yaxian on 2017/8/31.
 */

public class MyWebview extends WebView {
    private Context mContext;
    public MyWebview(Context context) {
        super(context);
        init(context);
    }

    public MyWebview(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context);
    }

    public MyWebview(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context);
    }
    private void init(Context context) {
        mContext = context;
    }

    private View mChildOfContent;
    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        try {
            //最大高度显示为屏幕内容高度的一半
            Display display = ((Activity)mContext).getWindowManager().getDefaultDisplay();
            DisplayMetrics d = new DisplayMetrics();
            display.getMetrics(d);

            RelativeLayout relativeLayout = (RelativeLayout)((Activity)mContext).findViewById(R.id.relativelayout_main);
            mChildOfContent = relativeLayout.getChildAt(0);
            Rect r = new Rect();
            mChildOfContent.getWindowVisibleDisplayFrame(r);
            //此处是关键，设置控件高度
            heightMeasureSpec = MeasureSpec.makeMeasureSpec(d.heightPixels-r.top, MeasureSpec.EXACTLY);
//            Log.i("flag","d.heightPixels-r.top   "+(d.heightPixels-r.top));

        } catch (Exception e) {
            e.printStackTrace();
        }
        super.onMeasure(widthMeasureSpec, heightMeasureSpec);
//        super.onMeasure(widthMeasureSpec, heightMeasureSpec);
    }



}
