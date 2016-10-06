package com.kc.module.controller;

import java.io.UnsupportedEncodingException;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import com.jfinal.aop.ClearInterceptor;
import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.IAtom;
import com.jfinal.plugin.activerecord.Page;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.model.Authority;
import com.kc.module.model.ProjectModule;
import com.kc.module.model.RolePosition;
import com.kc.module.model.SubFunction;
import com.kc.module.model.sys.SysLocaleContent;
import com.kc.module.model.sys.SysLocaleTag;
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

    /**
     * 
     */
    public void queryProjectModule() {

        List<ProjectModule> moduleList = ProjectModule.dao.queryProjectModule(ControlUtils.getLang(this));

        renderJson(moduleList);
    }

    /**
     * 查询厂商资料
     * 
     * @throws UnsupportedEncodingException
     */
    public void queryLocaleTag() {
        Record condition = new Record();
        condition.set("lang_code", getPara("lang_code"));
        condition.set("lang_value", getPara("lang_value"));
        condition.set("project_id", getPara("project_id"));
        condition.set("category", getPara("category"));

        int page = getParaToInt("page");
        int start = getParaToInt("start");
        int limit = getParaToInt("limit");

        Page<SysLocaleTag> pages = SysLocaleTag.dao.findLocaleTag(condition, ControlUtils.getLang(this), page, start, limit);

        setAttr("success", true);
        setAttr("info", pages.getList());
        setAttr("totalCount", pages.getTotalRow());

        renderJson();

    }

    /**
     * 通过国际化编码标签得到所有语言内容
     */
    public void queryLocaleContentByTag() {
        renderJson(SysLocaleContent.dao.findLocaleContentByTag(getPara("lang_code")));
    }

    /**
     * 新建国际化编码
     */
    public void saveLocaleTag() {
        SysLocaleTag tag = getModel(SysLocaleTag.class, "tag");
        String newCode = getPara("new_code");

        if (tag.get("lang_code") == null && newCode != null && tag.findById(newCode) == null) {
            tag.set("lang_code", newCode);
            tag.set("create_by", ControlUtils.getAccountName(this));
            tag.set("create_date", new Timestamp(new Date().getTime()));
            tag.set("modify_by", ControlUtils.getAccountName(this));
            tag.set("modify_date", new Timestamp(new Date().getTime()));

            boolean success = tag.save();

            setAttr("success", success);
            setAttr("msg", tag.get("lang_code") + (success ? "<br>新建国际化编码成功！" : "<br>新建国际化编码失败,请重试！"));

            if (success) {
                setAttr("tag", tag);
            }
        } else {
            setAttr("success", false);
            setAttr("msg", tag.get("lang_code") + "<br>国际化编码已存在！");
        }

        renderJson();

    }

    /**
     * 更新国际化编码
     */
    public void updateLocaleTag() {
        final String accountName = ControlUtils.getAccountName(this);
        final SysLocaleTag tag = getModel(SysLocaleTag.class, "tag");
        final String newCode = getPara("new_code");

        if (tag.get("lang_code") != null && newCode != null) {

            tag.set("modify_by", accountName);
            tag.set("modify_date", new Timestamp(new Date().getTime()));

            boolean success = Db.tx(new IAtom() {
                public boolean run() throws SQLException {

                    boolean success = tag.update();

                    if (!newCode.equals(tag.get("lang_code"))) {
                        success = success && tag.updateLocaleTag(newCode);
                        success = success && SysLocaleContent.dao.upateLocaleContentCode(newCode, tag.getStr("lang_code"));
                    }

                    return success;
                }
            });

            setAttr("success", success);
            setAttr("msg", success ? "更新国际化编码成功！" : "更新国际化编码失败,请重试！");

            if (success) {
                setAttr("tag", tag);
            }
        } else {
            setAttr("success", false);
            setAttr("msg", tag.get("lang_code") + "<br>国际化编码已存在！");
        }

        renderJson();
    }

    /**
     * 批量删除国际化编码
     */
    public void deleteLocaleTag() {
        final String tags = getPara("tags");

        if (tags != null) {

            boolean success = Db.tx(new IAtom() {
                public boolean run() throws SQLException {

                    String[] localeTags = tags.split(",");

                    return SysLocaleTag.dao.deleteLocaleTag(localeTags) && SysLocaleContent.dao.deleteLocaleContent(localeTags);
                }
            });

            setAttr("success", success);
            setAttr("msg", success ? "删除国际化编码成功！" : "删除国际化编码失败！");

        } else {
            setAttr("success", true);
            setAttr("msg", "请选择国际化编码!");
        }

        renderJson();
    }

    /**
     * 新建国际化内容
     */
    public void saveLocaleContent() {

        SysLocaleContent content = getModel(SysLocaleContent.class, "content");

        content.set("create_by", ControlUtils.getAccountName(this));
        content.set("create_date", new Timestamp(new Date().getTime()));
        content.set("modify_by", ControlUtils.getAccountName(this));
        content.set("modify_date", new Timestamp(new Date().getTime()));

        boolean success = content.save();

        setAttr("success", success);
        setAttr("msg", success ? "新建国际化内容成功！" : "新建国际化内容失败,请重试！");

        if (success) {
            setAttr("content", content);
        }

        renderJson();
    }

    /**
     * 更新国际化内容
     */
    public void updateLocaleContent() {

        SysLocaleContent content = getModel(SysLocaleContent.class, "content");

        content.set("modify_by", ControlUtils.getAccountName(this));
        content.set("modify_date", new Timestamp(new Date().getTime()));

        boolean success = content.update();

        setAttr("success", success);
        setAttr("msg", success ? "更新国际化内容成功！" : "更新国际化内容失败,请重试！");

        if (success) {
            setAttr("content", content);
        }

        renderJson();
    }
}
