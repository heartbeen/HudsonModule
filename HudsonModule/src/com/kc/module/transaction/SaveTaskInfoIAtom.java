package com.kc.module.transaction;

import java.sql.SQLException;

import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.IAtom;
import com.kc.module.base.Barcode;
import com.kc.module.model.TaskInfo;
import com.kc.module.model.TaskStuff;
import com.kc.module.model.form.ProjectTaskForm;
import com.kc.module.model.form.ProjectTaskStuffForm;
import com.kc.module.utils.JsonUtils;
import com.kc.module.utils.StringUtils;

/**
 * 对任务计划进行新增或者更新操作
 * 
 * @author ASUS
 * 
 */
public class SaveTaskInfoIAtom implements IAtom {

    private Controller controller;
    private String error;

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public Controller getController() {
        return controller;
    }

    public void setController(Controller controller) {
        this.controller = controller;
    }

    @Override
    public boolean run() throws SQLException {
        String json = this.controller.getPara("data");

        ProjectTaskForm form = JsonUtils.josnToBean(json, ProjectTaskForm.class);
        if (form == null) {
            this.setError("资料无效,请重新填写!");
            return false;
        }

        if (StringUtils.isEmpty(form.getModuleid())) {
            this.setError("模具资料无效,请重新填写!");
            return false;
        }

        if (form.getChangecount() < 0) {
            this.setError("设变次数不能为负数!");
            return false;
        }

        String taskId = null;
        boolean result = false;
        TaskInfo taskInfo = new TaskInfo();
        // 判断任务ID是否为空，如果为空为新增模具否则为更新模具
        if (StringUtils.isEmpty(form.getTaskid())) {
            // 如果该模具编号已经安排了项目任务,则提示已经安排过了
            if (TaskInfo.dao.getModuleExsistByColumn("MODULEBARCODE", form.getModuleid())) {
                this.setError("该模具已经安排了任务计划!");
                return false;
            }

            taskId = Barcode.TASK_INFO.nextVal();

            taskInfo.set("ID", taskId)
                    .set("MODULEBARCODE", form.getModuleid())
                    .set("PROPERTYCODE", form.getProperty())
                    .set("PROPERTYSCORE", form.getScore())
                    .set("PRECIOUSID", form.getPreciousid())
                    .set("STRUCTID", form.getStructid())
                    .set("TONID", form.getTonid())
                    .set("STANDARDCOUNT", form.getStandardcount())
                    .set("CHANGECOUNT", form.getChangecount())
                    .set("ISDOUBLE", (form.getDoublescore() ? 1 : 0));

            result = taskInfo.save();
            if (!result) {
                this.setError("新增任务失败,请重试!");
                return false;
            }

            if (form.getNewrecord().size() > 0) {
                for (ProjectTaskStuffForm pf : form.getNewrecord()) {
                    TaskStuff taskStuff = new TaskStuff();
                    result = taskStuff.set("ID", Barcode.TASK_STUFF.nextVal())
                                      .set("TASKID", taskId)
                                      .set("GROUPID", pf.getGroupid())
                                      .set("EMPID", pf.getEmpid())
                                      .set("ISSUM", pf.getIssum())
                                      .set("ISGENERAL", pf.getIsgeneral())
                                      .set("ISMAJOR", pf.getIsmajor())
                                      .set("ISGROUP", pf.getIsgroup())
                                      .set("ISSPECIFIC", pf.getIsspecific())
                                      .set("ISCHECKER", pf.getIschecker())
                                      .save();

                    if (!result) {
                        this.setError("新增任务失败,请重试!");
                        return false;
                    }
                }
            }

            this.setError("新增任务计划成功!");
            return true;
        } else {
            taskId = form.getTaskid();

            taskInfo.set("ID", taskId)
                    .set("PROPERTYCODE", form.getProperty())
                    .set("PROPERTYSCORE", form.getScore())
                    .set("PRECIOUSID", form.getPreciousid())
                    .set("STRUCTID", form.getStructid())
                    .set("TONID", form.getTonid())
                    .set("STANDARDCOUNT", form.getStandardcount())
                    .set("CHANGECOUNT", form.getChangecount())
                    .set("ISDOUBLE", (form.getDoublescore() ? 1 : 0));

            result = taskInfo.update();

            if (!result) {
                this.setError("更新任务计划失败,请重试!");
                return false;
            }

            // 保存新增的任务人员名单
            if (form.getNewrecord().size() > 0) {
                for (ProjectTaskStuffForm pf : form.getNewrecord()) {
                    // 新增
                    TaskStuff taskStuff = new TaskStuff();
                    result = taskStuff.set("ID", Barcode.TASK_STUFF.nextVal())
                                      .set("TASKID", taskId)
                                      .set("GROUPID", pf.getGroupid())
                                      .set("EMPID", pf.getEmpid())
                                      .set("ISSUM", pf.getIssum())
                                      .set("ISGENERAL", pf.getIsgeneral())
                                      .set("ISMAJOR", pf.getIsmajor())
                                      .set("ISGROUP", pf.getIsgroup())
                                      .set("ISSPECIFIC", pf.getIsspecific())
                                      .set("ISCHECKER", pf.getIschecker())
                                      .save();

                    if (!result) {
                        this.setError("新增任务失败,请重试!");
                        return false;
                    }
                }
            }

            if (form.getUpdaterecord().size() > 0) {
                for (ProjectTaskStuffForm pf : form.getUpdaterecord()) {
                    // 更新
                    TaskStuff taskStuff = new TaskStuff();
                    result = taskStuff.set("ID", pf.getId())
                                      .set("ISSUM", pf.getIssum())
                                      .set("ISGENERAL", pf.getIsgeneral())
                                      .set("ISMAJOR", pf.getIsmajor())
                                      .set("ISGROUP", pf.getIsgroup())
                                      .set("ISSPECIFIC", pf.getIsspecific())
                                      .set("ISCHECKER", pf.getIschecker())
                                      .update();

                    if (!result) {
                        this.setError("新增任务失败,请重试!");
                        return false;
                    }
                }
            }

            if (form.getRemoverecord().size() > 0) {
                for (ProjectTaskStuffForm pf : form.getRemoverecord()) {
                    // 删除
                    result = TaskStuff.dao.deleteById(pf.getId());

                    if (!result) {
                        this.setError("新增任务失败,请重试!");
                        return false;
                    }
                }
            }

            this.setError("更新任务计划成功!");
            return true;
        }
    }

}
