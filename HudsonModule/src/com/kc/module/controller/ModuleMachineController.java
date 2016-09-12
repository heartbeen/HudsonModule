package com.kc.module.controller;

import com.jfinal.aop.Before;
import com.jfinal.core.Controller;
import com.kc.module.interceptor.AuthInterceptor;

/**
 * 模具加工机台管理控制器
 * 
 * @author xuwei
 * @date 2013-10-17
 * 
 */
@Before(AuthInterceptor.class)
public class ModuleMachineController extends Controller {

}
