package com.kc.module.utils;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import com.sun.org.apache.xerces.internal.impl.dv.util.HexBin;

import sun.misc.BASE64Decoder;
import sun.misc.BASE64Encoder;

/**
 * 数据密钥生成类
 * 
 * @author 徐维
 * 
 */
public class MD5Utils {

    private static MessageDigest messageDigest;

    static {
        try {
            messageDigest = MessageDigest.getInstance("md5");
        }
        catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        }
    }

    private MD5Utils() {

    };

    // private static final MD5Utils token = new MD5Utils();
    //
    // public static MD5Utils getInstance() {
    // return token;
    // }

    /**
     * 对传入的字符进行再次加密，再进行多次循环加密
     * 
     * @param s
     *            　字符
     * @param token
     *            　密文
     * @param times
     *            　加密次数
     * @return
     */
    public static String getMD5(String s, String token, int times) {

        String md5 = s;

        for (int i = 0; i < times; i++) {
            md5 = getMD5((md5 + token).getBytes());
        }

        return md5;
    }

    /**
     * 对传入的字符进行多次加密
     * 
     * @param s
     *            　字符
     * @param times
     *            　加密字数
     * @return
     */
    public static String getMD5(String s, int times) {

        String md5 = s;

        for (int i = 0; i < times; i++) {
            md5 = getMD5(md5.getBytes());
        }

        return md5;

    }

    /**
     * 生成一个字符串的MD5码
     * 
     * @param s
     * @return
     */
    public static String getMD5(String s) {
        byte[] b = s.getBytes();

        return getMD5(b);

    }

    /**
     * 生成一个文件的MD5码
     * 
     * @param file
     *            文件
     * @return MD5码
     */
    public static String getFileMD5(File file) {

        byte[] b = getFileBinary(file);

        return getMD5(b);
    }

    /**
     * 得到文件的字节数组
     * 
     * @param file
     *            文件
     * @return 字节数组
     */
    public static byte[] getFileBinary(File file) {

        if (file.length() > Integer.MAX_VALUE) {
            // throw new
        }

        byte[] b = new byte[(int) file.length()];
        try {
            InputStream in = new FileInputStream(file);

            in.read(b);

            in.close();
        }
        catch (FileNotFoundException e) {

            e.printStackTrace();
        }
        catch (IOException e) {
            e.printStackTrace();
        }
        return b;
    }

    /**
     * 
     * @return
     */
    public static String getToken() {

        String token = System.currentTimeMillis() + "";

        return getBASE64(token.getBytes());
    }

    /**
     * 
     * @param b
     * @return
     */
    public static String getBASE64(byte[] b) {
        byte[] md5 = messageDigest.digest(b);
        BASE64Encoder base = new BASE64Encoder();
        // 115.com 115_pan_ssh
        return base.encode(md5);
    }

    /**
     * 
     * @param b
     * @return
     */
    private static String getMD5(byte[] b) {
        byte[] md5 = messageDigest.digest(b);
        return HexBin.encode(md5);
    }

    /**
     * 将图片文件转化为字节数组字符串，并对其进行Base64编码处理
     * 
     * @param imgFile
     * @return 返回Base64编码过的字节数组字符串
     */
    public static String getImageBASE64(String imgFile) {
        InputStream in = null;
        byte[] data = null;
        // 读取图片字节数组
        try {
            in = new FileInputStream(imgFile);
            data = new byte[in.available()];
            in.read(data);
            in.close();
        }
        catch (IOException e) {
            e.printStackTrace();
        }
        // 对字节数组Base64编码
        BASE64Encoder encoder = new BASE64Encoder();
        return encoder.encode(data);//
    }

    /**
     * 对字节数组字符串进行Base64解码并生成图片
     * 
     * @param imgStr
     * @return
     */
    public static boolean BASE64TOImage(String imgStr, String imgFilePath) {
        if (imgStr == null) // 图像数据为空
            return false;
        BASE64Decoder decoder = new BASE64Decoder();
        try {
            // Base64解码
            byte[] b = decoder.decodeBuffer(imgStr);
            for (int i = 0; i < b.length; ++i) {
                if (b[i] < 0) {// 调整异常数据
                    b[i] += 256;
                }
            }

            OutputStream out = new FileOutputStream(imgFilePath);
            out.write(b);
            out.flush();
            out.close();
            return true;
        }
        catch (Exception e) {
            return false;
        }
    }

}
