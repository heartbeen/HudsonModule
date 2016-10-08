package com.kc.module.interceptor;

import java.util.Map;

import com.jfinal.aop.Interceptor;
import com.jfinal.core.ActionInvocation;
import com.jfinal.core.Controller;
import com.jfinal.kit.StrKit;
import com.kc.module.utils.ConstUtils;

/**
 * 操作权限验证拦截器
 * 
 * @author 徐维
 * @email xuweissh@163.com
 * 
 */
public class AuthInterceptor implements Interceptor {

    private String[] assembly;

    public String[] getAssembly() {
        return assembly;
    }

    public void setAssembly(String[] assembly) {
        this.assembly = assembly;
    }

    @Override
    public void intercept(ActionInvocation ai) {
        Controller controller = ai.getController();
        Map<String, String> authMap = controller.getSessionAttr(ConstUtils.USER_AUTH_PATH);

        if (authMap != null) {
            if (isOvert(this.getAssembly(), ai.getActionKey())
                || StrKit.notBlank(authMap.get(ai.getMethodName()))) {

                // ModuleActionExtract mae = new ModuleActionExtract();
                // mae.setController(ai.getController());
                // mae.setMethodName(ai.getMethodName());
                // mae.setMaxParaLength(30);
                // mae.setAllParaLength(300);
                // mae.extract();

                ai.invoke();
            } else {
                controller.setAttr("auth", true)
                          .setAttr("success", false)
                          .setAttr("login", true)
                          .setAttr("msg", "您无此权限,如要开通请告知管理员!")
                          .renderJson();
            }
        } else if ("/public/getLocaleContent".equals(ai.getActionKey())) {
            // 读取国际化内容无需登入
            ai.invoke();
        } else {
            controller.setAttr("msg", "您长时间没有操作,?秒后转到登录页面,请重新登陆!")
                      .setAttr("login", false)
                      .setAttr("success", false)
                      .setAttr("auth", true)
                      .renderJson();
        }
    }

    /**
     * 判断是否为公共组件
     * 
     * @param actions
     * @param key
     * @return
     */
    private boolean isOvert(String[] actions, String key) {
        for (String item : actions) {
            if (key.startsWith(item)) {
                return (true);
            }
        }

        return (false);
    }
}
