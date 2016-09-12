package com.kc.module.model.form;

import java.util.List;

import com.jfinal.plugin.activerecord.Record;

/**
 * 主要用于存放从数据库中查询出来的某套模具的加工履历信息以及最近一期零件的加工情况
 * 
 * @author ASUS
 * 
 */
public class ModulePartMessageForm {
    public String getSelIndex() {
        return selIndex;
    }

    public void setSelIndex(String selIndex) {
        this.selIndex = selIndex;
    }

    public List<Record> getResumeList() {
        return resumeList;
    }

    public void setResumeList(List<Record> resumeList) {
        this.resumeList = resumeList;
    }

    public List<Record> getQueryList() {
        return queryList;
    }

    public void setQueryList(List<Record> queryList) {
        this.queryList = queryList;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    // 判断是否加载成功
    private boolean success;
    // 返回的结果消息
    private String msg;
    // 选择的履历
    private String selIndex;
    // 存放加工履历信息的集合
    private List<Record> resumeList;
    // 存放加工零件信息的集合
    private List<Record> queryList;
}
