package com.kc.module.model.form;

import com.kc.module.utils.StringUtils;

/**
 * 用于Coxon模具工号生成
 * 
 * @author David
 * 
 */
@SuppressWarnings("rawtypes")
public class GenerateMoudleForm extends FormBean {

    private String orderMonth;

    private String factoryGuest;
    private String processType;
    private String guestId;
    private String guestName;
    private String moduleFrom;
    private int moduleUnit = 0;

    @SuppressWarnings("unchecked")
    public GenerateMoudleForm() {
        super(null);
    }

    public String getOrderMonth() {
        return orderMonth;
    }

    public void setOrderMonth(String orderMonth) {
        this.orderMonth = orderMonth;
    }

    public String getFactoryGuest() {
        return factoryGuest;
    }

    public void setFactoryGuest(String factoryGuest) {
        this.factoryGuest = factoryGuest;
    }

    public String getProcessType() {
        return processType;
    }

    public void setProcessType(String processType) {
        this.processType = processType;
    }

    public String getModuleFrom() {
        return moduleFrom;
    }

    public String getGuestId() {
        return guestId;
    }

    public void setGuestId(String guestId) {
        this.guestId = guestId;
    }

    public String getGuestName() {
        return guestName;
    }

    public void setGuestName(String guestName) {
        this.guestName = guestName;
    }

    public void setModuleFrom(String moduleFrom) {
        this.moduleFrom = moduleFrom;
    }

    public int getModuleUnit() {
        return moduleUnit;
    }

    public void setModuleUnit(int moduleUnit) {
        this.moduleUnit = moduleUnit;
    }

    @Override
    public boolean validator() {

        return StringUtils.isEmpty(this.orderMonth)
               && StringUtils.isEmpty(this.factoryGuest)
               && StringUtils.isEmpty(this.processType)
               && StringUtils.isEmpty(this.moduleFrom)
               && this.moduleUnit > 0;
    }
}
