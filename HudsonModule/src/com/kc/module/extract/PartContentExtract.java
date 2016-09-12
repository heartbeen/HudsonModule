package com.kc.module.extract;

import com.kc.module.dao.ExtractDao;
import com.kc.module.model.ModulePartList;
import com.kc.module.utils.StringUtils;

public class PartContentExtract extends ExtractDao {

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    private String msg;
    private boolean success;

    public boolean isEmpty() {
        return empty;
    }

    public void setEmpty(boolean empty) {
        this.empty = empty;
    }

    private boolean empty;

    @Override
    public Object extract() {
        String partid = this.getController().getPara("partid");
        if (StringUtils.isEmpty(partid)) {
            this.setMsg("零件资料无效!");
            this.setSuccess(false);
            return null;
        }

        ModulePartList mpl = ModulePartList.dao.getPartContent(partid);
        if (mpl == null) {
            this.setMsg("不能是部件资料!");
            this.setSuccess(false);
            return null;
        }

        // 如果零件登记讯息为空,则返回TRUE表示未编辑
        if (StringUtils.isEmpty(mpl.getStr("CONTENT"))) {
            this.setEmpty(true);
        }
        
        this.setSuccess(true);
        
        return (mpl);
    }

}
