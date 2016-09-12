package com.kc.module.interceptor;

import com.jfinal.aop.InterceptorStack;
import com.kc.module.interceptor.validator.ModuleBaseValidator;

/**
 * 模具基本信息拦截
 * 
 * @author Administrator
 * 
 */
public class ModuleBaseInterceptorStack extends InterceptorStack {

    @Override
    public void config() {
        addInterceptors(new ModuleBaseValidator());

    }

}
