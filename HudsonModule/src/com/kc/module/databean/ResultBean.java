package com.kc.module.databean;

/**
 * 执行动作的返回结果
 * 
 * @author Rock
 * 
 */
public class ResultBean {
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

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }

    private boolean success;
    private String msg;
    private Object data;

}
