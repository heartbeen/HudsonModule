package com.kc.module.model.form;

import java.util.List;

public class ParsePartcodeForm {
    private boolean result;
    private String resumestate;
    // 用于区分是否为已经加工过的工件(1为已经加工,0为新模)
    private String flag;
    private int bflag;

    public int getBflag() {
        return bflag;
    }

    public void setBflag(int bflag) {
        this.bflag = bflag;
    }

    public String getFlag() {
        return flag;
    }

    public void setFlag(String flag) {
        this.flag = flag;
    }

    public String getResumestate() {
        return resumestate;
    }

    public void setResumestate(String resumestate) {
        this.resumestate = resumestate;
    }

    public boolean isResult() {
        return result;
    }

    public void setResult(boolean result) {
        this.result = result;
    }

    public String getResumeid() {
        return resumeid;
    }

    public void setResumeid(String resumeid) {
        this.resumeid = resumeid;
    }

    public List<CreatePartListForm> getQueryList() {
        return queryList;
    }

    public void setQueryList(List<CreatePartListForm> queryList) {
        this.queryList = queryList;
    }

    private String resumeid;
    private List<CreatePartListForm> queryList;
}
