package com.kc.module.interceptor;

import com.jfinal.aop.InterceptorStack;
import com.kc.module.interceptor.validator.ModuleProcessValidator;

/**
 * 模具工件加工管理拦截器集合
 * 
 * @author xuwei
 * 
 */
public class ModuleProcessInterceptorStack extends InterceptorStack {

    @Override
    public void config() {
        addInterceptors(new ModuleProcessValidator());
    }
}
