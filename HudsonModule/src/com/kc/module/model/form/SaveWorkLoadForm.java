package com.kc.module.model.form;

public class SaveWorkLoadForm {
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCraftname() {
        return craftname;
    }

    public void setCraftname(String craftname) {
        this.craftname = craftname;
    }

    public String getCraftcode() {
        return craftcode;
    }

    public void setCraftcode(String craftcode) {
        this.craftcode = craftcode;
    }

    public String getNwlid() {
        return nwlid;
    }

    public void setNwlid(String nwlid) {
        this.nwlid = nwlid;
    }

    public int getUsehour() {
        return usehour;
    }

    public void setUsehour(int usehour) {
        this.usehour = usehour;
    }

    // 工艺ID
    private String id;
    // 工艺名称
    private String craftname;
    // 工艺代号
    private String craftcode;
    // 负荷ID
    private String nwlid;
    // 负荷时数
    private int usehour;
}
