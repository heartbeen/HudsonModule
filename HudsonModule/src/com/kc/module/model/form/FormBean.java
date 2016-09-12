package com.kc.module.model.form;

import com.kc.module.model.ModelFinal;
import com.kc.module.utils.DataUtils;

/**
 * 请求表单bean接口, 提供转换为model方法,还有crud方法
 * 
 * @author xuwei
 * 
 */
public abstract class FormBean<E extends ModelFinal<E>> {

    private Class<E> modelClass;

    public FormBean(Class<E> modelClass) {
        this.modelClass = modelClass;
    }

    public abstract boolean validator();

    /**
     * 将form保存到数据库
     * 
     * @return
     */
    public boolean save() {
        try {
            return toModel().save();
        }
        catch (Exception e) {
            return false;
        }
    }

    /**
     * 将form更新到数据库
     * 
     * @return
     */
    public boolean update() {
        try {
            return toModel().update();
        }
        catch (Exception e) {
            return false;
        }
    }

    /**
     * 将form从数据库中删除
     * 
     * @return
     */
    public boolean delete() {
        try {
            return toModel().delete();
        }
        catch (Exception e) {
            return false;
        }
    }

    /**
     * bean 转换为 model类型
     * 
     * @return
     */
    public E toModel() {
        return modelClass == null ? null : DataUtils.beanToModel(modelClass, this);
    }
}
