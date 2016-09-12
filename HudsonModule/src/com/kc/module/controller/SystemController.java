package com.kc.module.controller;

import java.util.List;
import java.util.UUID;

import com.jfinal.aop.ClearInterceptor;
import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.model.Authority;
import com.kc.module.model.ProjectModule;
import com.kc.module.model.RolePosition;
import com.kc.module.model.SubFunction;
import com.kc.module.utils.ControlUtils;

// @Before(SystemInterceptorStack.class)
@ClearInterceptor
public class SystemController extends Controller {

    /**
     * 得到角色对应的权限
     */
    public void queryRoleAuthority() {
        String[] id = getPara("id").split(";");
        String roleId = getPara("roleId");

        List<Record> list = null;

        if (id.length == 1) {
            list = ProjectModule.dao.findSubModule(id[0]);
        } else {
            if ("1".equals(id[1])) {
                list = SubFunction.dao.findSubModuleFunction(id[0]);
            }

            if ("2".equals(id[1])) {
                list = Authority.dao.findFunctionAuthority(id[0], roleId);
                for (Record r : list) {
                    r.set("checked", r.get("AUTHPOSID") == null ? false : true);
                    r.set("leaf", true);
                }
            }
        }

        renderJson("children", list);
    }

    /**
     * 得到角色所拥有的主模块列表
     */
    public void queryMainModule() {
        renderJson("children", ProjectModule.dao.findMainModule());
    }

    /**
     * 为角色设置权限
     */
    public void createRoleAuthority() {
        try {
            RolePosition role = getModel(RolePosition.class, "rp");

            role.set("authPosId", UUID.randomUUID().toString()).set("posId", "0101");

            if ("001".equals(role.get("roleid"))) {
                if ("001".equals(ControlUtils.getRoleId(this))) {
                    setAttr("success", role.save());
                    setAttr("msg", getAttr("success") ? "角色权限授权成功!" : "角色权限授权失败!");
                } else {
                    setAttr("msg", "您没有设置系统管理员的权限！");
                    setAttr("success", false);
                }

            } else {

                setAttr("success", role.save());
                setAttr("msg", getAttr("success") ? "角色权限授权成功!" : "角色权限授权失败!");
            }

            if (getAttr("success")) {
                // cleartRoleCache(role.getStr("roleId"));
                setAttr("authPosId", role.get("authPosId"));
            }
        }
        catch (Exception e) {
            e.printStackTrace();
            setAttr("success", false);
            setAttr("msg", "内部错误,角色权限授权失败!");
        }
        finally {
            renderJson();
        }

    }

    /**
     * 删除角色权限
     */
    public void deleteRoleAuthority() {
        try {

            String roleId = getPara("roleId");

            if ("001".equals(roleId)) {
                // super manager have auth,other not
                if ("001".equals(ControlUtils.getRoleId(this))) {
                    setAttr("success", RolePosition.dao.deleteById(getPara("authPosId")));
                    setAttr("msg", getAttr("success") ? "删除角色权限成功!" : "删除角色权限失败!");
                } else {
                    setAttr("msg", "您没有设置系统管理员的权限！");
                    setAttr("success", false);
                }

            } else {
                setAttr("success", RolePosition.dao.deleteById(getPara("authPosId")));
                setAttr("msg", getAttr("success") ? "删除角色权限成功!" : "删除角色权限失败!");
            }

            // if (getAttr("success")) {
            // cleartRoleCache(getPara("roleId"));
            // }
        }
        catch (Exception e) {
            setAttr("success", false);
            setAttr("msg", "内部错误,删除角色权限失败!");
        }
        finally {
            renderJson();
        }

    }

    // private void cleartRoleCache(String roldId) {
    // CacheKit.remove("projectModule", roldId);
    // CacheKit.remove("moduleProject", roldId);
    // }
}
