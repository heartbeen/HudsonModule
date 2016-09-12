package com.kc.module.controller;

import com.jfinal.aop.Before;
import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.Db;
import com.kc.module.interceptor.AuthInterceptor;
import com.kc.module.model.TaskGroup;
import com.kc.module.model.TaskStruct;
import com.kc.module.transaction.SaveTaskInfoIAtom;
import com.kc.module.transaction.TaskPropertyIAtom;
import com.kc.module.transaction.UpdateRegionDepartmentIAtom;

/**
 * 此类为功能加载类,用于所有功能模块的加载
 * 
 * @author David
 * @email xuweissh@163.com
 * 
 */
@Before(AuthInterceptor.class)
public class ProjectController extends Controller {
    public void getTaskInfo() {
        renderJson();
    }

    public void doTaskProperty() {
        TaskPropertyIAtom tpi = new TaskPropertyIAtom();
        tpi.setController(this);
        boolean success = Db.tx(tpi);

        setAttr("success", success);

        renderJson();
    }

    /**
     * 更新TASK_STRUCT表中的人员讯息
     */
    public void updateTaskStruct() {
        setAttr("success",
                TaskStruct.dao.updateTaskStruct(getPara("uniqueId"), getPara("uniqueVal"), getPara("updateCol"), getParaToBoolean("updateVal")));
        renderJson();
    }

    /**
     * 删除TASK_STRUCT表中的人员讯息
     */
    public void deleteTaskStruct() {
        setAttr("success", TaskStruct.dao.deleteTaskStruct(getPara("uniqueId"), getPara("uniqueVal")));

        renderJson();
    }

    /**
     * 新增组织成员
     */
    public void addTaskStruct() {
        setAttr("success", TaskStruct.dao.addTaskStruct(getPara("groupid"), getPara("empid")));
        renderJson();
    }

    /**
     * 操作任务组织清单
     */
    public void operateTaskGroup() {
        setAttr("success", TaskGroup.dao.operateTaskGroup(getPara("id"), getPara("name"), getPara("stepid"), getParaToInt("type")));
        renderJson();
    }

    public void saveTaskInfo() {
        SaveTaskInfoIAtom stfi = new SaveTaskInfoIAtom();
        stfi.setController(this);

        boolean success = Db.tx(stfi);

        setAttr("success", success);
        setAttr("error", stfi.getError());

        renderJson();
    }

    public void updateRegionDepartment() {
        UpdateRegionDepartmentIAtom urdi = new UpdateRegionDepartmentIAtom();
        urdi.setController(this);

        boolean result = Db.tx(urdi);

        setAttr("success", result);
        setAttr("msg", urdi.getMsg());

        renderJson();
    }
}
