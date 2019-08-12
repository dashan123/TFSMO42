package cn.com.cloud9.javabean;

import java.util.ArrayList;
import java.util.List;

public class B64ListStringImage {

	private static List<String> list;;
	private B64ListStringImage(){};
	public static List<String> getInstance(){
		
		if (list==null) {
			synchronized (B64ListStringImage.class) {
				if (list==null) {
					list=new ArrayList<String>();
				}
			}
		}
		return list;
	}
	
//	private static B64ListString mInstance;
//	private List<String> list;
//	private B64ListString(){};
//	public static B64ListString getInstance(){
//	
//	if (mInstance==null) {
//		synchronized (B64ListString.class) {
//			if (mInstance==null) {
//				mInstance=new B64ListString();
//			}
//		}
//	}
//	return mInstance;
//	}
//	
//	public List<String> getDatas(){
//		return list;
//	}
//	public void setDatas(List<String> list){
//		this.list=list;
//	}

}
