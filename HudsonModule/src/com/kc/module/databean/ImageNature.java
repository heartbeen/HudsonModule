package com.kc.module.databean;

/**
 * <h4>图片对象</h4> <br>
 * 1.用于得到模具三次元测量图片信息
 * 
 * @author David
 * @email xuweissh@163.com
 * 
 */
public class ImageNature {

    /**
     * 图片base64字符串
     */
    private String imageString;

    private int width;

    private int height;

    public ImageNature(String imageString, int width, int height) {
        this.imageString = imageString;
        this.width = width;
        this.height = height;
    }

    public String getImageString() {
        return imageString;
    }

    public void setImageString(String imageString) {
        this.imageString = imageString;
    }

    public int getWidth() {
        return width;
    }

    public void setWidth(int width) {
        this.width = width;
    }

    public int getHeight() {
        return height;
    }

    public void setHeight(int height) {
        this.height = height;
    }

}
