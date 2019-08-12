package cn.com.cloud9.tfsmo.android42;


import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class MessageActivity extends Activity {


	private TextView tittleTextView;
	private TextView timeTextView;
	private TextView contentleTextView;
	private Button okButton;
	private Button cancelButton;
	private  String contentStr="";
	private  String tittleStr="";
	private  String timeStr="";
	private String typeStr="";


	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		setContentView(R.layout.layout_message);

		init();

		Intent intent = getIntent();
		//所messgae改成message
		if(intent.hasExtra("message")) {
			//所messgae改成message
			String intentStr = intent.getStringExtra("message");
			intentStr.replace("\n", "");
			intentStr.replace("\r", "");

			if(intentStr.indexOf("key:cn.jpush.android.ALERT, value:")!=-1) {

				String tempStr="\"type\":\"";
				if(intentStr.indexOf(tempStr)!=-1) {
					tempStr=intentStr.substring(intentStr.indexOf(tempStr)+tempStr.length());

					typeStr=tempStr.substring(0,tempStr.indexOf("\""));
					typeStr=removeSpecilChar(typeStr);
				}

				tempStr="key:cn.jpush.android.ALERT, value:";
				String dialogStr=intentStr.substring(intentStr.indexOf(tempStr)+tempStr.length());
				tempStr="key:cn.jpush";
				if(dialogStr.indexOf(tempStr)!=-1) {
					contentStr=dialogStr.substring(0,dialogStr.indexOf(tempStr));
					contentStr=removeSpecilChar(contentStr);
					contentleTextView.setText(contentStr);
				}
				tempStr="NOTIFICATION_CONTENT_TITLE, value:";
				if(dialogStr.indexOf(tempStr)!=-1) {
					dialogStr=dialogStr.substring(dialogStr.indexOf(tempStr)+tempStr.length());
				}
				tempStr="key:cn.jpush";
				if(dialogStr.indexOf(tempStr)!=-1) {
					tittleStr=dialogStr.substring(0,dialogStr.indexOf(tempStr));
					tittleStr=removeSpecilChar(tittleStr);
					tittleTextView.setText(tittleStr);
				}
				tempStr="time:";
				if(dialogStr.indexOf(tempStr)!=-1) {
					timeStr=dialogStr.substring(dialogStr.indexOf(tempStr)+tempStr.length());
					timeStr=removeSpecilChar(timeStr);
					timeTextView.setText(timeStr);
				}


			}
		}

		okButton.setOnClickListener(new Button.OnClickListener() {
			public void onClick(View v) {
				if(typeStr.length()!=0) {
					Intent myintent = new Intent(MessageActivity.this, CollectionWebview.class);
					//所messgae改成message
					myintent.putExtra("message",typeStr);
					startActivity(myintent);
					typeStr="";
					finish();
				} else {

					Intent myintent = new Intent(MessageActivity.this, CollectionWebview.class);
					startActivity(myintent);
					typeStr="";
					finish();
				}

				finish();
			}

		});
		cancelButton.setOnClickListener(new Button.OnClickListener() {
			public void onClick(View v) {
				typeStr="";

				finish();
			}

		});
	}

	public void init(){
		tittleTextView = (TextView) findViewById(R.id.tittleTextView);
		timeTextView = (TextView) findViewById(R.id.timeTextView);
		contentleTextView = (TextView) findViewById(R.id.contentTextView);
		okButton = (Button) findViewById(R.id.okButton);
		cancelButton = (Button) findViewById(R.id.cancelButton);

		Intent intentMessage = getIntent();
		Bundle extras = intentMessage.getExtras();
		tittleTextView.setText(extras.getString("title",""));
		timeTextView.setText(extras.getString("time",""));
		Log.i("flag","extras.getString(time)======================="+extras.getString("time",""));
		contentleTextView.setText(extras.getString("content",""));
	}

	protected void onResume() {
		Intent intent = getIntent();
		//所messgae改成message
		if(intent.hasExtra("message")) {
			//所messgae改成message
			String intentStr = intent.getStringExtra("message");
			intentStr.replace("\n", "");
			intentStr.replace("\r", "");


			if(intentStr.indexOf("key:cn.jpush.android.ALERT, value:")!=-1) {

				String tempStr="\"type\":\"";
				if(intentStr.indexOf(tempStr)!=-1) {
					tempStr=intentStr.substring(intentStr.indexOf(tempStr)+tempStr.length());

					typeStr=tempStr.substring(0,tempStr.indexOf("\""));
					typeStr=removeSpecilChar(typeStr);
				}

				tempStr="key:cn.jpush.android.ALERT, value:";
				String dialogStr=intentStr.substring(intentStr.indexOf(tempStr)+tempStr.length());
				tempStr="key:cn.jpush";
				if(dialogStr.indexOf(tempStr)!=-1) {
					contentStr=dialogStr.substring(0,dialogStr.indexOf(tempStr));
					contentStr=removeSpecilChar(contentStr);
					contentleTextView.setText(contentStr);
				}
				tempStr="NOTIFICATION_CONTENT_TITLE, value:";
				if(dialogStr.indexOf(tempStr)!=-1) {
					dialogStr=dialogStr.substring(dialogStr.indexOf(tempStr)+tempStr.length());
				}
				tempStr="key:cn.jpush";
				if(dialogStr.indexOf(tempStr)!=-1) {
					tittleStr=dialogStr.substring(0,dialogStr.indexOf(tempStr));
					tittleStr=removeSpecilChar(tittleStr);
					tittleTextView.setText(tittleStr);
				}
				tempStr="time:";
				if(dialogStr.indexOf(tempStr)!=-1) {
					timeStr=dialogStr.substring(dialogStr.indexOf(tempStr)+tempStr.length());
					timeStr=removeSpecilChar(timeStr);
					timeTextView.setText(timeStr);
				}



			}
		}
		super.onResume();

	}
	public static String removeSpecilChar(String str){
		String result = "";
		if(null != str){
			Pattern pat = Pattern.compile("\\s*|\n|\r|\t");
			Matcher mat = pat.matcher(str);
			result = mat.replaceAll("");
		}
		return result;
	}


}


