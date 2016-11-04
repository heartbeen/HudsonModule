package com.kc.module.controller;

import java.io.IOException;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpSession;

import com.jfinal.aop.Before;
import com.jfinal.aop.ClearInterceptor;
import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.Db;
import com.kc.module.interceptor.validator.LoginValidator;
import com.kc.module.model.Account;
import com.kc.module.model.Authority;
import com.kc.module.model.ProjectModule;
import com.kc.module.transaction.AlertUserInfoIAtom;
import com.kc.module.utils.ConstUtils;
import com.kc.module.utils.ControlUtils;
import com.kc.module.utils.StringUtils;

@ClearInterceptor
public class AccountController extends Controller {

    /**
     * 主介面
     * 
     * @throws ServletException
     * @throws IOException
     */
    public void index() throws ServletException, IOException {
        String lang = ControlUtils.getLocale(this);

        Calendar calendar = Calendar.getInstance();
        calendar.setTime(new Date());

        Long time = calendar.getTimeInMillis();

        setAttr("basePath", StringUtils.getBasePath(this.getRequest()));
        setAttr("time", time);
        setAttr("lang", lang);

        renderJsp("/WEB-INF/view/index.jsp");// 会抛导常,但不会影响执行
    }

    /**
     * 登录
     */
    @Before(LoginValidator.class)
    public void login() {
        String userName = this.getPara("userName");
        String password = this.getPara("password");

        Account userData = Account.dao.login(userName, password);

        if (userData != null) {
            String valid = userData.get("valid");
            if ("0".equals(valid) || valid == null) {
                setAttr("msg", "您的账号已失效!");
                setAttr("success", false);
            } else {
                List<Authority> allPathData = Authority.dao.allAuthority(userData.get("ROLEID"), userData.get("ACCOUNTID"));

                if (allPathData.size() > 0) {

                    Map<String, String> map = new HashMap<String, String>();

                    for (Authority acc : allPathData) {
                        String authid = acc.getStr("authid");
                        String name = acc.getStr("AUTHNAME");

                        if (StringUtils.isEmpty(authid) || StringUtils.isEmpty(name)) {
                            continue;
                        }

                        map.put(name.substring(name.lastIndexOf("/") + 1), authid);
                    }

                    setSessionAttr(ConstUtils.USER_AUTH_PATH, map);
                    setSessionAttr(ConstUtils.USER_BASE_INFO, userData);

                    // 得到用户所有的模块
                    if (userData.get("NEWAUTH") != null || !getParaToBoolean("localdata")) {

                        if (userData.get("NEWAUTH") != null) {
                            Account a = new Account();
                            a.set("ACCOUNTID", userData.get("ACCOUNTID"));
                            a.set("NEWAUTH", null);
                            a.update();
                            setAttr("newauth", userData.get("NEWAUTH"));// 表示用户有新的授权,此值会记录到用户前台中
                        }

                        roleProcess(userData.getStr("ROLEID"), ControlUtils.getLocale(this));
                    }

                    setAttr("success", true);
                    setAttr("msg", "登录成功!");

                    allPathData = null;
                } else {
                    setAttr("success", false);
                    setAttr("msg", "您没有获得角色，请找管理员！");
                }
            }

        } else {
            setAttr("msg", "用户名或密码错误!");
            setAttr("success", false);
        }

        renderJson();
    }

    /**
     * 得到角色所对应的模块
     * 
     * @param roleId
     */
    private void roleProcess(final String roleId, final String locale) {
        // setAttr("modules", CacheKit.get("projectModule", roleId, new
        // IDataLoader() {
        // public Object load() {
        // return ProjectModule.dao.findModule(roleId);
        // }
        // }));

        setAttr("modules", ProjectModule.dao.findModule(roleId, locale));
    }

    /**
     * 退出登录
     */
    public void logout() {

        try {
            HttpSession session = getSession(false);
            session.removeAttribute(ConstUtils.USER_AUTH_PATH);
            session.removeAttribute(ConstUtils.USER_BASE_INFO);
            session.removeAttribute(ConstUtils.USER_POSITION);
        }
        catch (Exception e) {}
        finally {
            redirect("/");
        }

    }

    public void alterUserInfo() {
        AlertUserInfoIAtom auii = new AlertUserInfoIAtom();
        auii.setController(this);

        boolean success = Db.tx(auii);
        setAttr("success", success);
        setAttr("msg", auii.getMsg());

        renderJson();
    }
}
