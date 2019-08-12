<%@page import="java.io.File"%>
<%@page import="java.text.SimpleDateFormat"%>
<%@page import="java.util.Date"%>
<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>
<%
 String fileID = request.getParameter("fileName");
 fileID = new String(fileID.getBytes("iso8859-1"), "utf-8");
 String fileName = null;
 String filePath = null;
 int fileSize = 0;
 if(fileID.indexOf("file/email") != -1){
	 filePath = request.getSession().getServletContext().getRealPath("/")+fileID;
	 File file = new File(filePath);
	 if(file.exists()){
		 fileSize = (int)(file.length());
	 }else{
		 out.print("<script>alert('文件下载失败！');</script>");
		 return;
	 }
	 fileID = new SimpleDateFormat("yyyyMMddHHmmssSSS").format(new Date())+fileID.substring(fileID.lastIndexOf("."), fileID.length());
	 fileName = fileID;
 }else{
	 fileName = fileID.substring(0, fileID.lastIndexOf("."));
	 filePath = request.getSession().getServletContext().getRealPath("/")+"/file/download/"+fileName;
	 File folder = new File(filePath);
	 if(folder.isDirectory()){
		 File[] file = folder.listFiles();
		 fileName = file[0].getName();
		 fileSize = (int)(file[0].length());
	 }else{
		 out.print("<script>alert('文件下载失败！');</script>");
		 return;
	 }
	 filePath += "/" + fileName;
 }

 String fileminitype = "application/x-download;charset=UTF-8";
 response.setContentType(fileminitype);
 response.setHeader("Location",fileName);
 //response.setHeader("Cache-Control", "max-age=" + cacheTime);
 response.setHeader("Content-Disposition", "attachment; filename=" + fileID); //filename应该是编码后的(utf-8)
 response.setContentLength(fileSize);
 java.io.OutputStream outputStream = response.getOutputStream();
 java.io.InputStream inputStream = new java.io.FileInputStream(filePath);
 byte[] buffer = new byte[1024];
 int i = -1;
 while ((i = inputStream.read(buffer)) != -1) {
      outputStream.write(buffer, 0, i);
  }
 outputStream.flush();
 outputStream.close();
 inputStream.close();
 outputStream = null;
%>