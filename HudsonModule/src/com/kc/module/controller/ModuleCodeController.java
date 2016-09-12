package com.kc.module.controller;

import java.sql.SQLException;
import java.util.List;

import com.jfinal.aop.Before;
import com.jfinal.core.Controller;
import com.jfinal.kit.JsonKit;
import com.jfinal.kit.StrKit;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.IAtom;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.base.Barcode;
import com.kc.module.interceptor.AuthInterceptor;
import com.kc.module.model.BarcodeContext;
import com.kc.module.model.BarcodePaper;
import com.kc.module.model.Craft;
import com.kc.module.model.DeviceDepart;
import com.kc.module.model.Employee;
import com.kc.module.model.ModulePartList;
import com.kc.module.model.ModuleProcessState;
import com.kc.module.model.RegionDepartment;
import com.kc.module.utils.ControlUtils;
import com.kc.module.utils.DataUtils;

/**
 * 条码
 * 
 * @author Administrator
 * 
 */
@Before(AuthInterceptor.class)
public class ModuleCodeController extends Controller {

    public void getModuleCode() {
        List<DeviceDepart> list = DeviceDepart.dao.getDepartCode();

        renderJson("{\"success\":" + JsonKit.toJson(list) + "}");
    }

    /**
     * 得到要打条码的工件
     */
    public void modulePartList() {

        renderJson(ModulePartList.dao.findPartBarcode(getPara("modulebarcode")));
    }

    /**
     * 模具系统条码
     */
    public void systemBarcode() {
        renderJson(ModuleProcessState.dao.findSystembarcode());
    }

    /**
     * 得到员工条码 </p>
     * 
     * 根据登录者的权限不同,所要打印员工范围也不相同,<br>
     * <ul>
     * <li>2:可以打印厂内所有部门员工的条码</li>
     * <li>4:可以打印当前部门所有员工的条码</li>
     * <li>6:可以打印当部门单位的员工条友</li>
     * </ul>
     */
    public void deptBarcode() {
        String stepId = getPara("stepId");

        stepId = StrKit.isBlank(stepId) || stepId.equals("root") ? ControlUtils.getStepId(this) : stepId;
        List<Record> list = null;
        int len = stepId.length();

        switch (len) {
        case 2: {
            list = RegionDepartment.dao.findDeptForFactory(stepId);
            break;
        }
        case 4: {
            list = RegionDepartment.dao.findRegionForDept(stepId);
            break;
        }
        case 6: {
            list = RegionDepartment.dao.findDeptForStepId(stepId);
            break;
        }
        }

        if (len == 4 || len == 6) {
            for (Record r : list) {
                r.set("checked", false);
                r.set("leaf", true);
                r.set("icon", "images/icons/group.png");
            }
        }

        setAttr("success", list.size() > 0);
        setAttr("children", list);
        
        renderJson();
    }

    /**
     * 查找相应部门单位的人员条码
     */
    public void employeeBarcode() {
        List<Record> list = Employee.dao.findEmployeeForDept(getPara("stepId"));

        setAttr("success", list.size() > 0);
        setAttr("children", list);
        renderJson();
    }

    /**
     * 查询机台条码
     */
    public void machineBarcode() {
        renderJson(DeviceDepart.dao.findMachineBarcode(getPara("stepId")));
    }

    /**
     * 查询模块所对应的条码纸张
     */
    public void queryBarcodePaper() {
        renderJson(BarcodePaper.dao.findPaperForModule(getPara("moduleId")));
    }

    /**
     * 新增和修改条码纸张属性
     */
    public void saveBarcodePaper() {

        BarcodePaper bp = getModel(BarcodePaper.class, "bp");

        bp.set("id", Barcode.BARCODE_PAPER.nextVal());
        boolean success = bp.save();

        setAttr("success", success);
        setAttr("msg", success ? "保存成功!" : "保存失败!");
        setAttr("id", bp.get("id"));

        renderJson();
    }

    /**
     * 删除条码纸
     */
    public void deleteBarcodePaper() {
        BarcodePaper bp = getModel(BarcodePaper.class, "bp");
        setAttr("success", bp.get("id") == null ? false : bp.delete());
        setAttr("msg", getAttr("success") ? "删除成功!" : "删除失败!");

        renderJson();
    }

    /**
     * 设置条码打印使用纸张
     */
    public void useBarcodeParper() {

        boolean succeed = Db.tx(new IAtom() {
            public boolean run() throws SQLException {
                BarcodePaper bp = getModel(BarcodePaper.class, "bp");
                bp.set("used", 1);

                int i = Db.update("UPDATE " + bp.tableName() + " SET USED=0 WHERE ID <> ?", bp.get("id"));
                return bp.update() && i > 0;
            }
        });

        setAttr("success", succeed);
        setAttr("msg", getAttr("success") ? "设置成功!" : "设置失败!");

        renderJson();

    }

    /**
     * 查询条码打印格式
     */
    public void queryBarcodeFormat() {
        List<Record> list = BarcodeContext.dao.findBarcodeContextForModule(getPara("moduleId"), getPara("barTypeId"));

        String json = DataUtils.recordMapToJson(DataUtils.recordTwoLayout(list, "BARNAME", "PRINTNAME", "BARNAME", "BARTYPEID"));

        renderJson("{\"children\":" + json.replace("barname", "text").replace("printname", "text") + "}");

    }

    /**
     * 更新打印纸属性
     */
    public void updateBarcodePaper() {

        BarcodePaper bp = getModel(BarcodePaper.class, "bp");

        setAttr("success", bp.update());
        setAttr("msg", getAttr("success") ? "更新成功!" : "更新失败!");

        renderJson();
    }

    /**
     * 更新打印内容格式属性
     */
    public void updateBarcodeContext() {

        BarcodeContext bc = getModel(BarcodeContext.class, "bc");

        setAttr("success", bc.update());
        setAttr("msg", getAttr("success") ? "更新成功!" : "更新失败!");

        renderJson();
    }

    public void craftBarcode() {
        renderJson(Craft.dao.getCraftInfoById());
    }
    // 31815 421036
}
