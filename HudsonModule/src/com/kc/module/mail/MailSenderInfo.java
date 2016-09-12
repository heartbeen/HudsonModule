package com.kc.module.mail;

/**
 * 发送邮件需要使用的基本信息
 */
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Properties;

public class MailSenderInfo {
    // 发送邮件的服务器的IP和端口
    private String mailServerHost;
    private String mailServerPort;
    // 邮件发送者的地址
    private String fromAddress;
    // 邮件接收者的地址
    private String toAddress;
    // 登陆邮件发送服务器的用户名和密码
    private String userName;
    private String password;
    // 是否需要身份验证
    private boolean validate = false;

    // 邮件主题
    private String subject;
    // 邮件的文本内容
    private String content;

    // 邮件附件的文件名
    private String[] attachFileNames;

    public MailSenderInfo() {
        init();
    }

    /**
     * 获得邮件会话属性
     */
    public Properties getProperties() {
        Properties p = new Properties();
        p.put("mail.smtp.host", this.mailServerHost);
        p.put("mail.smtp.port", this.mailServerPort);
        p.put("mail.smtp.auth", validate ? "true" : "false");
        return p;
    }

    public void init() {
        String path = MailSenderInfo.class.getResource("mail.properties").getPath();

        Properties properties = new Properties();

        try {
            properties.load(new FileInputStream(new File(path.replace("%20", " "))));

            this.mailServerHost = properties.getProperty("mailServerHost");
            this.mailServerPort = properties.getProperty("mailServerPort");
            this.fromAddress = properties.getProperty("fromAddress");
            this.userName = properties.getProperty("userName");
            this.password = properties.getProperty("password");

        }
        catch (FileNotFoundException e) {
            // this.mailServerHost = "coxonmail.sinyon.com.cn";
            // this.mailServerPort = "25";
            // this.fromAddress = "xuwei@sinyon.com.cn";
            // this.userName = "xuwei@sinyon.com.cn";
            // this.password = "21639909@coxon";
        }
        catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }

    public String getMailServerHost() {
        return mailServerHost;
    }

    public void setMailServerHost(String mailServerHost) {
        this.mailServerHost = mailServerHost;
    }

    public String getMailServerPort() {
        return mailServerPort;
    }

    public void setMailServerPort(String mailServerPort) {
        this.mailServerPort = mailServerPort;
    }

    public boolean isValidate() {
        return validate;
    }

    public void setValidate(boolean validate) {
        this.validate = validate;
    }

    public String[] getAttachFileNames() {
        return attachFileNames;
    }

    public void setAttachFileNames(String[] fileNames) {
        this.attachFileNames = fileNames;
    }

    public String getFromAddress() {
        return fromAddress;
    }

    public void setFromAddress(String fromAddress) {
        this.fromAddress = fromAddress;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getToAddress() {
        return toAddress;
    }

    public void setToAddress(String toAddress) {
        this.toAddress = toAddress;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String textContent) {
        this.content = textContent;
    }
}