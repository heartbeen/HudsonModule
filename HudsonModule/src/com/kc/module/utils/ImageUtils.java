package com.kc.module.utils;

import java.awt.Graphics;
import java.awt.Image;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import javax.imageio.ImageIO;
import javax.imageio.stream.FileImageOutputStream;
import javax.imageio.stream.ImageOutputStream;

import sun.misc.BASE64Decoder;
import sun.misc.BASE64Encoder;

import com.kc.module.databean.ImageNature;
import com.kc.module.model.form.CropMeasureForm;

public class ImageUtils {

    private static BASE64Encoder encoder = new BASE64Encoder();
    private static BASE64Decoder decoder = new BASE64Decoder();

    /**
     * 图片转化成base64字符串
     * 
     * @param imagePath
     *            图片所在路径
     * @return
     */
    public static ImageNature getImageNature(String imagePath) {

        ImageNature imn = null;
        try {
            InputStream in = new FileInputStream(new File(imagePath));
            byte[] data = new byte[in.available()];
            in.read(data);
            in.close();
            BufferedImage image = ImageIO.read(new ByteArrayInputStream(data));

            imn = new ImageNature("data:image/png;base64,".concat(encoder.encode(data)), image.getWidth(), image.getHeight());
            return imn;
        }
        catch (IOException e) {
            e.printStackTrace();
            return imn;
        }
    }

    /**
     * 图片转化成base64字符串
     * 
     * @param imageFile
     *            图片文件
     * 
     * @param imagePath
     *            读完图片后是否将图片删除
     * @return
     */
    public static String getImageStr(File imageFile, boolean isDelete) {

        if (!imageFile.exists()) {
            return "";
        }
        // 将图片文件转化为字节数组字符串，并对其进行Base64编码处理
        InputStream in = null;
        byte[] data = null;
        // 读取图片字节数组
        try {
            in = new FileInputStream(imageFile);
            data = new byte[in.available()];
            in.read(data);
            in.close();
            if (isDelete) {
                imageFile.delete();
            }

            // 对字节数组Base64编码
            return encoder.encode(data);
        }
        catch (IOException e) {
            e.printStackTrace();
            return "";
        }

    }

    // base64字符串转化成图片
    public static boolean generateImage(String imgStr, String imgPath) { // 对字节数组字符串进行Base64解码并生成图片
        if (imgStr == null) // 图像数据为空
            return false;

        try {
            // Base64解码
            byte[] b = decoder.decodeBuffer(imgStr);
            for (int i = 0; i < b.length; ++i) {
                if (b[i] < 0) {// 调整异常数据
                    b[i] += 256;
                }
            }
            // 生成jpeg图片
            OutputStream out = new FileOutputStream(imgPath);
            out.write(b);
            out.flush();
            out.close();
            return true;
        }
        catch (Exception e) {
            return false;
        }
    }

    /**
     * 
     * @param cmf
     *            前台提交的裁剪数据表单
     * @return
     */
    public static synchronized String getCropImage(CropMeasureForm cmf) {

        return getCropImage(cmf.getImgSrc(), cmf.getX(), cmf.getY(), cmf.getWidth(), cmf.getHeight());
    }

    /**
     * 
     * @param imageBase
     * @param x
     *            - 指定矩形区域左上角的 X 坐标
     * @param y
     *            - 指定矩形区域左上角的 Y 坐标
     * @param w
     *            - 指定矩形区域的宽度
     * @param h
     *            - 指定矩形区域的高度
     * @return
     */
    public static synchronized String getCropImage(String imageBase, int x, int y, int w, int h) {

        try {
            return getCropImage(imageToByte(imageBase), x, y, w, h);
        }
        catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }

        return "";

    }

    /**
     * 
     * @param imageStr
     * @return
     * @throws IOException
     */
    public static byte[] imageToByte(String imageStr) throws IOException {

        byte[] b = decoder.decodeBuffer(imageStr);
        for (int i = 0; i < b.length; ++i) {
            if (b[i] < 0) {// 调整异常数据
                b[i] += 256;
            }
        }

        return b;
    }

    /**
     * 对指定图片进行裁剪
     * 
     * @param imgData
     *            图片数据
     * @param x
     *            - 指定矩形区域左上角的 X 坐标
     * @param y
     *            - 指定矩形区域左上角的 Y 坐标
     * @param w
     *            - 指定矩形区域的宽度
     * @param h
     *            - 指定矩形区域的高度
     * @return
     */
    public static synchronized String getCropImage(byte[] imgData, int x, int y, int w, int h) {
        try {
            BufferedImage image = ImageIO.read(new ByteArrayInputStream(imgData));

            return getCropImage(image, x, y, w, h);

        }
        catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }

        return "";
    }

    /**
     * 
     * @param image
     * @param x
     *            - 指定矩形区域左上角的 X 坐标
     * @param y
     *            - 指定矩形区域左上角的 Y 坐标
     * @param w
     *            - 指定矩形区域的宽度
     * @param h
     *            - 指定矩形区域的高度
     * @return
     */
    public static synchronized String getCropImage(BufferedImage image, int x, int y, int w, int h) {
        BufferedImage bi = image.getSubimage(x, y, w, h);

        String tmpPath = System.getProperty("java.io.tmpdir") + "tmp.png";

        try {

            File file = new File(tmpPath);
            ImageOutputStream ios = new FileImageOutputStream(file);
            ImageIO.write(bi, "png", ios);

            ios.close();
            bi.flush();

            return getImageStr(file, true);
        }
        catch (IOException e) {
            e.printStackTrace();
        }

        return "";
    }

    /**
     * 上传的图片保存到服务器硬盘
     * 
     * @param imageStr
     * @param path
     * @return
     */
    public static boolean imageSaveToDisk(String imageStr, String path) {
        try {
            BufferedImage bi = ImageIO.read(new ByteArrayInputStream(imageToByte(imageStr)));

            // 如果上级目录不存在时就创建
            File dir = new File(path.substring(0, path.lastIndexOf(File.separator)));

            if (!dir.exists() || !dir.isDirectory()) {
                dir.mkdirs();
            }

            ImageOutputStream ios = new FileImageOutputStream(new File(path));
            boolean success = ImageIO.write(bi, "png", ios);

            ios.close();
            bi.flush();

            return success;
        }
        catch (IOException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 将图片读取后处理成指定长宽的图片流
     * 
     * @param srcImageFile
     * @param scale
     * @param flag
     * @return
     */
    public static BufferedImage getScaleBuffer(String srcImageFile, int width, int height) {
        try {
            // 读取原始文件至流
            BufferedImage src = ImageIO.read(new File(srcImageFile)); // 读入文件
            // 略缩图片
            Image image = src.getScaledInstance(width, height, Image.SCALE_DEFAULT);
            BufferedImage tag = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);

            Graphics g = tag.getGraphics();
            g.drawImage(image, 0, 0, null); // 绘制缩小后的图
            g.dispose();

            return tag;
        }
        catch (IOException e) {
            return (null);
        }
    }

    /**
     * 生成图片的略缩图
     * 
     * @param srcImageFile
     * @param result
     * @param format
     * @param width
     * @param height
     * @return
     */
    public static boolean createScaleImage(String srcImageFile, String dest, String format, int width, int height) {
        try {
            BufferedImage src = ImageIO.read(new File(srcImageFile)); // 读入文件

            Image image = src.getScaledInstance(width, height, Image.SCALE_DEFAULT);
            BufferedImage tag = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
            Graphics g = tag.getGraphics();

            g.drawImage(image, 0, 0, null); // 绘制缩小后的图
            g.dispose();

            return ImageIO.write(tag, format, new File(dest));// 输出到文件流
        }
        catch (IOException e) {
            return false;
        }
    }
}
