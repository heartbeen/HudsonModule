package com.kc.module.transaction;

import java.io.File;
import java.util.Properties;

import com.jfinal.upload.UploadFile;
import com.kc.module.dao.BaseIAtom;
import com.kc.module.model.ModuleProductInfo;
import com.kc.module.utils.DataUtils;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.FileUtils;
import com.kc.module.utils.StringUtils;

public class UploadProductImageIAtom extends BaseIAtom {
    // 文件过滤器
    private String[] filter;
    // 图片路径
    private String imageUrl;
    // 设置文件的最大容量(默认为2M)
    private long maxLength = 2 * 1024 * 1024;

    public long getMaxLength() {
        return maxLength;
    }

    public void setMaxLength(long maxLength) {
        if (maxLength > this.maxLength) {
            this.maxLength = maxLength;
        }
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String[] getFilter() {
        return filter;
    }

    public void setFilter(String[] filter) {
        this.filter = filter;
    }

    @Override
    public boolean run() {
        try {
            Properties config = DataUtils.getProperties("config.properties");
            if (config == null) {
                this.setMsg("找不到文件需要保存的文件目录");
                return false;
            }

            UploadFile uploadFile = this.getController().getFile();
            String rootDic = this.getController().getSession().getServletContext().getRealPath("/");
            // 获取文件目录,如果结束不是以\结尾则为其添加结尾
            String dic = config.getProperty("imagedic");

            if (StringUtils.isEmpty(dic)) {
                this.setMsg("没有配置产品图片的存放目录");
                return false;
            }

            if (!dic.endsWith("\\")) {
                dic = dic + "\\";
            }

            boolean isDir = FileUtils.newFolder(rootDic + dic);
            if (!isDir) {
                this.setMsg("创建图片存放的文件夹失败");
                return false;
            }

            String prdid = this.getController().getPara("prdid");
            if (StringUtils.isEmpty(prdid)) {
                this.setMsg("未选择要上传图片的产品信息");
                return false;
            }

            // 查询指定的产品的详细资料
            ModuleProductInfo mpi = ModuleProductInfo.dao.findById(prdid);
            String relpath = null;

            if (uploadFile != null) {
                File tempFile = uploadFile.getFile();
                if (this.getMaxLength() < tempFile.length()) {
                    this.setMsg("上传图片超出要求最大容量");
                    return false;
                }

                String fileName = tempFile.getName();
                String extension = getExtension(fileName);

                boolean isVal = isLegal(extension);
                if (!isVal) {
                    this.setMsg("文件不是指定格式的图片(.bmp|.jpg|.png)");
                    return false;
                }

                // 如果查询的结果为空表示资料已经不存在了
                if (mpi == null) {
                    this.setMsg("产品的资料信息已经不存在了");
                    return false;
                }

                // 获取产品的原始文件存放路径
                String imagepath = mpi.getStr("IMAGEPATH");
                // 生成文件存放路径
                String imagename = DateUtils.getDateNow("yyMMddHHmmssSSS");
                String picurl = rootDic + dic + imagename + extension;
                // 设置文件的相对路径
                relpath = dic + imagename + extension;
                // 创建产品的图片存放文件
                File picFile = new File(picurl);
                // 用于存放操作已执行过的状态
                boolean isExecuted = false;

                // 如果查询的数据库中图片路径未指定则添加
                if (StringUtils.isEmpty(imagepath)) {
                    isExecuted = FileUtils.fileChannelCopy(tempFile, picFile);
                    if (!isExecuted) {
                        this.setMsg("保存图片文件出错");
                        return false;
                    }

                    isExecuted = mpi.set("IMAGEPATH", relpath).update();
                    if (!isExecuted) {
                        this.setMsg("更新产品信息失败");
                        return false;
                    }
                } else {
                    File oriFile = new File(rootDic + imagepath);
                    // 如果文件存在，先删除旧文件在创建一个新文件
                    if (oriFile.exists()) {
                        isExecuted = oriFile.delete();
                        if (!isExecuted) {
                            this.setMsg("保存图片文件出错");
                            return false;
                        }

                        isExecuted = FileUtils.fileChannelCopy(tempFile, picFile);
                        if (!isExecuted) {
                            this.setMsg("保存图片文件出错");
                            return false;
                        }
                    } else {
                        // 创建一个新文件
                        isExecuted = FileUtils.fileChannelCopy(tempFile, picFile);
                        if (!isExecuted) {
                            this.setMsg("保存图片文件出错");
                            return false;
                        }
                    }

                    // 更新数据库中的产品图片路径
                    isExecuted = mpi.set("IMAGEPATH", relpath).update();
                    if (!isExecuted) {
                        this.setMsg("更新产品信息失败");
                        return false;
                    }
                }

                this.setImageUrl(relpath);
            } else {
                this.setMsg("没有可上传的图片");
                return false;
            }

            this.setMsg("上传图片文件成功");
            return true;
        }
        catch (Exception e) {
            this.setMsg("上传文件失败");
            return false;
        }
    }

    /**
     * 判断文件是否为指定格式的文件
     * 
     * @param fileName
     * @return
     */
    private boolean isLegal(String extension) {
        String[] t_filter = this.getFilter();
        // 如果过滤文件未设置,则表示允许所有格式的文件
        if (t_filter == null || t_filter.length == 0) {
            return (true);
        }

        for (String item : t_filter) {
            if (item.equals(extension)) {
                return (true);
            }
        }

        return (false);
    }

    /**
     * 获取文件的格式后缀
     * 
     * @param fileName
     * @return
     */
    private String getExtension(String fileName) {
        int lastIndex = fileName.lastIndexOf(".");
        return fileName.substring(lastIndex);
    }
}
