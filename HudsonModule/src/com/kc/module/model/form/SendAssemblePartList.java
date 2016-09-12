package com.kc.module.model.form;

import java.util.List;

/**
 * 发送到组立的工件集合
 * 
 * @author Administrator
 * 
 */
public class SendAssemblePartList {

    private List<SendAssemblePart> partList;

    /**
     * 组立ID
     */
    private String assembleId;

    /**
     * 组立名称
     */
    private String assembleName;

    public List<SendAssemblePart> getPartList() {
        return partList;
    }

    public void setPartList(List<SendAssemblePart> partList) {
        this.partList = partList;
    }

    public String getAssembleId() {
        return assembleId;
    }

    public void setAssembleId(String assembleId) {
        this.assembleId = assembleId;
    }

    public String getAssembleName() {
        return assembleName;
    }

    public void setAssembleName(String assembleName) {
        this.assembleName = assembleName;
    }

}
