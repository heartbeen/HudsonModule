package com.kc.module.interceptor;

import com.jfinal.aop.InterceptorStack;
import com.jfinal.plugin.activerecord.tx.Tx;
import com.kc.module.interceptor.validator.CraftPlanValidator;

/**
 * 工艺排程拦截器集合
 * 
 * @author xuwei
 * 
 */
public class CraftPlanInterceptor extends InterceptorStack {

    @Override
    public void config() {
        addInterceptors(new CraftPlanValidator(), new Tx());
    }
}
