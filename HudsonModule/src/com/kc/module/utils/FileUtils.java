package com.kc.module.utils;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.nio.channels.FileChannel;

public class FileUtils {
    /**
     * 读取文本文件的内容
     * 
     * @param
     * @return
     */
    public static String readText(String path, String encode) {
        try {
            // 初始化读取文件的编码格式
            String encoding = (encode == null ? "UTF-8" : encode);
            File file = new File(path);
            // 构建文档内容类
            StringBuilder txtBuilder = new StringBuilder();
            // 判断文件是否存在
            if (file.isFile() && file.exists()) {
                // 构建读取TXT文件的类
                InputStreamReader read = new InputStreamReader(new FileInputStream(file), encoding);// 考虑到编码格式
                BufferedReader bufferedReader = new BufferedReader(read);
                // 循环读取TXT文件内容行
                String lineTxt = null;
                while ((lineTxt = bufferedReader.readLine()) != null) {
                    if (lineTxt != null) {
                        txtBuilder.append(lineTxt);
                    }
                }

                // 关闭文件组件
                bufferedReader.close();
                read.close();

                return txtBuilder.toString();
            } else {
                return (null);
            }
        }
        catch (Exception e) {
            return (null);
        }
    }

    /**
     * 将Text内容写入TXT文件
     * 
     * @param path
     * @param txt
     * @param encode
     * @return
     */
    public static boolean writeText(String path, String txt, String encode) {
        try {
            // 设置写入文件的格式
            String encoding = (encode == null ? "UTF-8" : encode);

            // 声明创建TXT文档
            File file = new File(path);
            if (!file.exists()) {
                file.createNewFile();
            }

            // 构建文件写入组件
            OutputStreamWriter write = new OutputStreamWriter(new FileOutputStream(file), encoding);
            BufferedWriter writer = new BufferedWriter(write);

            writer.write(txt);

            writer.close();
            write.flush();

            return (true);
        }
        catch (Exception e) {
            return (false);
        }
    }

    /**
     * 从错误的Exception类中输出错误原因
     * 
     * @param e
     * @return
     */
    public static String getErrorInfoFromException(Exception e) {
        try {
            StringWriter sw = new StringWriter();
            PrintWriter pw = new PrintWriter(sw);
            e.printStackTrace(pw);
            return sw.toString();
        }
        catch (Exception e2) {
            return e2.toString();
        }
    }

    /**
     * 创建一个文件夹
     * 
     * @param folderPath
     * @return
     */
    public static boolean newFolder(String folderPath) {
        try {
            String filePath = folderPath;
            File myFilePath = new File(filePath);

            if (!myFilePath.exists()) {
                return myFilePath.mkdir();
            }

            return true;
        }
        catch (Exception e) {
            return (false);
        }
    }

    /**
     * 删除文件夹
     * 
     * @param folderPath
     * @return
     */
    public static boolean delFolder(String folderPath) {
        try {
            String filePath = folderPath;
            File delPath = new File(filePath);
            return delPath.delete();
        }
        catch (Exception e) {
            return false;
        }
    }

    /**
     * 创建新一个新的文件
     * 
     * @param fileName
     * @return
     */
    public static boolean createFile(String fileName) {
        try {
            File myFileName = new File(fileName);
            if (!myFileName.exists()) {
                return myFileName.createNewFile();
            }

            return true;
        }
        catch (Exception e) {
            return false;
        }
    }

    /**
     * 删除一个文件
     * 
     * @param fileName
     * @return
     */
    public static boolean delFile(String fileName) {
        try {
            File myFileName = new File(fileName);
            return myFileName.delete();
        }
        catch (Exception e) {
            return false;
        }
    }

    /**
     * 文件通道范围内的复制
     * 
     * @param s
     * @param t
     * @return
     */
    public static boolean fileChannelCopy(File s, File t) {

        FileInputStream fi = null;
        FileOutputStream fo = null;
        FileChannel in = null;
        FileChannel out = null;

        try {
            fi = new FileInputStream(s);
            fo = new FileOutputStream(t);
            in = fi.getChannel();// 得到对应的文件通道
            out = fo.getChannel();// 得到对应的文件通道

            in.transferTo(0, in.size(), out);// 连接两个通道，并且从in通道读取，然后写入out通道

            fi.close();
            in.close();
            fo.close();
            out.close();

            return true;
        }
        catch (Exception e) {
            return false;
        }
    }

    /**
     * 判断文件或者文件夹是否存在
     * 
     * @param path
     * @return
     */
    public static boolean isExsist(String path) {
        File file = new File(path);
        return file.exists();
    }
}
