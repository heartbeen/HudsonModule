package com.kc.module.interceptor;

import com.jfinal.aop.InterceptorStack;
import com.kc.module.interceptor.validator.PublicValidator;

public class PublicInterceptorStack extends InterceptorStack {

    @Override
    public void config() {
        addInterceptors(new PublicValidator());
    }

}
