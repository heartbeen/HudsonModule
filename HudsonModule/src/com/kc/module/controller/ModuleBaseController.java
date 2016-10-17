package com.kc.module.controller;

import java.io.UnsupportedEncodingException;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import com.jfinal.aop.Before;
import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.IAtom;
import com.jfinal.plugin.activerecord.Page;
import com.jfinal.plugin.activerecord.Record;
import com.jfinal.plugin.activerecord.tx.Tx;
import com.kc.module.base.Barcode;
import com.kc.module.interceptor.ModuleBaseInterceptorStack;
import com.kc.module.model.Account;
import com.kc.module.model.Authority;
import com.kc.module.model.Employee;
import com.kc.module.model.Factory;
import com.kc.module.model.RegionDepartment;
import com.kc.module.model.Role;
import com.kc.module.model.RolePosition;
import com.kc.module.model.Station;
import com.kc.module.model.form.FactoryForm;
import com.kc.module.transaction.AccountDeleteIAtom;
import com.kc.module.transaction.AddRegionDepartmentClassifyIAtom;
import com.kc.module.transaction.AddUserIAtom;
import com.kc.module.transaction.DeleteLocaleEmployeeIAtom;
import com.kc.module.transaction.SaveLocaleEmployeeIAtom;
import com.kc.module.utils.ControlUtils;
import com.kc.module.utils.JsonUtils;

/**
 * 模具基本资料建立控制器
 * 
 * @author xuwei
 * @date 2013-10-17
 * 
 */
@Before(ModuleBaseInterceptorStack.class)
public class ModuleBaseController extends Controller {

    /**
     * 新增厂别信息
     */
    @Before(Tx.class)
    public void insertFactory() {

        boolean succeed = Db.tx(new IAtom() {
            public boolean run() throws SQLException {

                FactoryForm factoryForm = JsonUtils.josnToBean(getPara("factory"),
                                                               FactoryForm.class);
                Factory factory = factoryForm.toModel();

                factory.set("id", Barcode.FACTORY.nextVal());
                factory.set("createtime", new Timestamp(new Date().getTime()));

                // 表示为增加分厂
                if (factoryForm.getFactorytype().equals("1")) {
                    RegionDepartment rd = new RegionDepartment();

                    rd.set(rd.getPrimaryKey(), Barcode.REGION_DEPART.nextVal());
                    rd.set("name", factoryForm.getShortname());
                    rd.set("cdate", new Timestamp(new Date().getTime()));
                    rd.set("stepid", RegionDepartment.dao.findBranchFactoryStepId());

                    // 分厂代码为自动产生
                    factory.set("Factorycode", rd.get("stepid"));

                    if (!rd.save()) {
                        return false;
                    }
                }

                return factory.save();
            }
        });

        response(succeed, "新增厂商成功!", "新增厂商失败!");
    }

    /**
     * 更新厂别信息
     */
    public void updateFactory() {

        boolean succeed = Db.tx(new IAtom() {
            public boolean run() throws SQLException {

                return JsonUtils.josnToBean(getPara("factory"), FactoryForm.class).update();
            }
        });

        response(succeed, "更新厂商成功!", "更新厂商失败!");
    }

    /**
     * 删除厂商记录
     */
    public void deleteFactory() {
        String id = getPara("id");
        String factoryType = getPara("factoryType");

        if (!factoryType.equals("1")) {
            setAttr("success", Factory.dao.findById(id).delete());
            setAttr("msg", getAttr("success") ? "删除厂商成功!" : "删除厂商失败!");
        } else {
            // 分厂资料不能删除
            setAttr("msg", "不能删除分厂资料!");
            setAttr("success", false);
        }

        renderJson();
    }

    /**
     * 查询厂商资料
     * 
     * @throws UnsupportedEncodingException
     */
    public void queryFactory() {
        String field = getPara("field");
        // TODO 乱码没有解决
        String condition = getPara("condition");
        int page = getParaToInt("page");
        int start = getParaToInt("start");
        int limit = getParaToInt("limit");

        Page<Factory> pages = Factory.dao.findFactory(field, condition, page, start, limit);

        setAttr("success", true);
        setAttr("info", pages.getList());
        setAttr("totalCount", pages.getTotalRow());

        renderJson();

    }

    /**
     * 响应通用方法
     * 
     * @param succeed
     * @param successMsg
     * @param faildMsg
     */
    private void response(boolean succeed, String successMsg, String faildMsg) {
        setAttr("success", succeed);
        setAttr("msg", getAttr("success") ? successMsg : faildMsg);
        renderJson();
    }

    /**
     * 新增角色信息
     */
    public void insertRole() {
        Role role = getModel(Role.class);

        boolean success = false;

        if (Role.dao.findByName(role.getStr("rolename")) != null) {
            setAttr("msg", "已存在角色");
        } else {
            role.set("ROLEID", Barcode.ROLE.nextVal())
                .set("createTime", new java.sql.Timestamp(new Date().getTime()));
            success = role.save();
            setAttr("msg", "角色新增成功!");
        }

        setAttr("success", success);

        renderJson();
    }

    /**
     * 新增相应路径信息
     */
    public void insertAuthority() {
        Authority authority = getModel(Authority.class, "auth");
        authority.set("authid", Barcode.AUTHORITY.nextVal());
        boolean success = authority.save();
        // if (success) {
        // CacheKit.remove("authorityList", "auth");
        // }
        renderJson("success", success);
    }

    /**
     * 新增权限分配信息
     */
    public void insertRolePos() {
        RolePosition role = new RolePosition();
        role.set("authPosId", UUID.randomUUID().toString())
            .set("roleId", getPara("roleId"))
            .set("authId", getPara("authId"))
            .set("posId", "0101");
        renderJson("success", role.save());
    }

    /**
     * 增加用户
     */
    public void insertAccountInfo() {

        Account account = getModel(Account.class);
        Account exitAccount = account.findFirstByColunmName("username");

        if ("001".equals(account.get("roleid"))) {
            if ("001".equals(ControlUtils.getRoleId(this))) {
                if (exitAccount != null) {
                    setAttr("success", false);
                    setAttr("msg", "用户账号已经存在!");
                } else {
                    Employee e = Employee.dao.findFristCondition(new String[]{"worknumber"},
                                                                 account.get("username"));

                    if (e == null) {
                        setAttr("success", false);
                        setAttr("msg", "用户资料不存在,请新增用户资料!");
                    } else {
                        account.set("ACCOUNTID", e.get("id"));

                        setAttr("success", account.save());
                        setAttr("msg", getAttr("success") ? "用户账号新增成功!" : "用户账号新增失败,请重试!");
                    }
                }
            } else {
                setAttr("msg", "您没有设置用户为系统管理员的权限！");
                setAttr("success", false);
            }
        } else {
            if (exitAccount != null) {
                setAttr("success", false);
                setAttr("msg", "用户账号已经存在!");
            } else {
                Employee e = Employee.dao.findFristCondition(new String[]{"worknumber"},
                                                             account.get("username"));

                if (e == null) {
                    setAttr("success", false);
                    setAttr("msg", "用户资料不存在,请新增用户资料!");
                } else {
                    account.set("ACCOUNTID", e.get("id"));

                    setAttr("success", account.save());
                    setAttr("msg", getAttr("success") ? "用户账号新增成功!" : "用户账号新增失败,请重试!");
                }
            }
        }

        renderJson();
    }

    /**
     * 根据ID,删除角色列表记录
     */
    public void deleteRole() {
        renderJson("success", Role.dao.deleteById(getPara("id")));
    }

    /**
     * 获取相应路径列表信息
     */
    public void authorityList() {

        // List<Record> list = CacheKit.get("authorityList", "auth", new
        // IDataLoader() {
        //
        // @Override
        // public Object load() {
        // return Authority.dao.findAuthorityData();
        // }
        //
        // });

        renderJson(Authority.dao.findAuthorityData(ControlUtils.getLocale(this)));
    }

    /**
     * 根据ID,删除对应路径
     */
    public void deleteAuthority() {

        boolean success = Db.tx(new IAtom() {
            public boolean run() throws SQLException {

                int count = RolePosition.dao.deleteRoldAuth(getPara("authId"));
                if (count > -1) {
                    return Authority.dao.deleteById(getPara("authId"));
                }
                return false;
            }
        });

        // if (success) {
        // CacheKit.remove("authorityList", "auth");
        // }

        renderJson("success", success);
    }

    /**
     * 修改功能路径信息
     */
    public void updateAuthority() {
        boolean success = getModel(Authority.class, "auth").update();
        // if (success) {
        // CacheKit.remove("authorityList", "auth");
        // }

        renderJson("success", success);
    }

    /**
     * 根据ID,删除权限分配记录
     */
    public void deleteRolePos() {
        renderJson("success", RolePosition.dao.deleteById(getPara("authPosId")));
    }

    /**
     * 获取登陆账号列表
     */
    public void accountInfoList() {
        renderJson(Account.dao.accountInfoData(getPara("colName"), getPara("value")));
    }

    /**
     * 更新登录账号信息
     */
    public void updateAccountInfo() {
        Account account = getModel(Account.class, "acc");
        String roldId = account.findUserRole();

        if ("001".equals(roldId) || "001".equals(account.get("roleid"))) {
            if ("001".equals(ControlUtils.getRoleId(this))) {
                setAttr("success", getModel(Account.class, "acc").update());
                setAttr("msg", getAttr("success") ? "角色权限设置成功!" : "角色权限设置失败!");
            } else {
                setAttr("msg", "您没有设置用户为系统管理员的权限！");
                setAttr("success", false);
            }
        } else {
            setAttr("success", getModel(Account.class, "acc").update());
            setAttr("msg", getAttr("success") ? "角色权限设置成功!" : "角色权限设置失败!");
        }

        renderJson();
    }

    /**
     * 根据ID,删除用户登陆权限信息或者用户信息
     */
    public void deleteAccountInfo() {
        AccountDeleteIAtom adi = new AccountDeleteIAtom();
        adi.setController(this);
        adi.setMajor("011");

        boolean result = Db.tx(adi);

        setAttr("success", result);
        setAttr("msg", adi.getError());

        renderJson();
    }

    /**
     * 获取员工讯息
     */
    public void getCareerInfo() {
        renderJson(Station.dao.getCareerInfo());
    }

    /**
     * 按照工号匹配查找员工讯息
     */
    public void findEmployeeByWorkNumber() {
        renderJson(Employee.dao.findEmployeeByWorkNumber(getPara("worknumber")));
    }

    /**
     * 獲取本廠
     */
    public void findLocalRegionDepartment() {
        renderJson(RegionDepartment.dao.getUserRegionDepartment(ControlUtils.getFactoryStepid(this),
                                                                ""));
    }

    /**
     * 增加人员信息
     */
    public void saveEmployeeInfo() {
        AddUserIAtom aui = new AddUserIAtom();
        aui.setController(this);

        boolean result = Db.tx(aui);

        setAttr("result", result);
        setAttr("msg", aui.getError());

        renderJson();
    }

    public void saveStationInfo() {
        renderJson("result", Station.dao.addStationInfo(getPara("sname")));
    }

    /**
     * ||获取本单位以及子单位的相关讯息||
     */
    public void getLocaleSubDepartment() {
        renderJson(RegionDepartment.dao.getLocaleSubDepartment(ControlUtils.getStepId(this)));
    }

    /**
     * ||获取本单位以及子单位员工讯息||
     */
    public void getLocaleEmployeeInfo() {
        renderJson(Employee.dao.getLocaleEmployeeInfo(ControlUtils.getStepId(this)));
    }

    /**
     * 新增本单位的员工讯息
     */
    public void saveLocaleEmployeeInfo() {
        // 初始化保存员工讯息的transaction
        SaveLocaleEmployeeIAtom slei = new SaveLocaleEmployeeIAtom();
        slei.setController(this);
        // 执行事务
        boolean rst = Db.tx(slei);
        // 获取事务执行状态
        setAttr("success", rst);
        setAttr("msg", slei.getMsg());
        // 渲染至前台
        renderJson();
    }

    /**
     * 删除部门员工的相关讯息
     */
    public void deleteLocaleEmployeeInfo() {
        DeleteLocaleEmployeeIAtom dlei = new DeleteLocaleEmployeeIAtom();
        dlei.setController(this);
        // 执行事务
        boolean rst = Db.tx(dlei);
        // 获取事务执行状态
        setAttr("success", rst);
        setAttr("msg", dlei.getMsg());
        // 渲染至前台
        renderJson();
    }

    /**
     * 新增部门分类
     */
    public void addRegionDepartmentClassify() {
        AddRegionDepartmentClassifyIAtom adci = new AddRegionDepartmentClassifyIAtom();
        adci.setController(this);

        boolean result = Db.tx(adci);

        setAttr("success", result);
        setAttr("msg", adci.getMsg());

        renderJson();
    }
}
