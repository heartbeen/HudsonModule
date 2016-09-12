package com.kc.module.transaction;

import java.sql.SQLException;
import java.util.List;

import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.IAtom;
import com.kc.module.base.Barcode;
import com.kc.module.model.TaskClassic;
import com.kc.module.model.TaskInfo;

/**
 * 操作项目任务属性的事务
 * 
 * @author ROCK
 * 
 */
public class TaskPropertyIAtom implements IAtom {

    private Controller controller;

    public Controller getController() {
        return controller;
    }

    public void setController(Controller controller) {
        this.controller = controller;
    }

    @Override
    public boolean run() throws SQLException {
        // 判断操作符是新增更新(true)还是删除(false)
        boolean flag = this.getController().getParaToBoolean("flag");
        // 获取属性唯一ID号
        String propertyid = this.getController().getPara("propertyid");

        String propertyname = this.getController().getPara("propertyname");
        String propertycode = this.getController().getPara("propertycode");

        int propertytype = this.getController().getParaToInt("propertytype");
        int propertyscore = this.getController().getParaToInt("propertyscore");
        int propertycount = this.getController().getParaToInt("propertycount");

        // 查找数据库中是否存在这个模具属性
        TaskClassic tc = TaskClassic.dao.getTaskClassicById(propertyid);

        if (flag) {
            if (tc == null) {
                tc = new TaskClassic();

                return tc.set("ID", Barcode.TASK_CLASSIC.nextVal())
                         .set("TYPID", propertytype)
                         .set("CODE", propertycode)
                         .set("NAME", propertyname)
                         .set("SCORE", propertyscore)
                         .set("SCOUNT", propertycount)
                         .save();
            } else {
                return tc.set("NAME", propertyname)
                         .set("SCORE", propertyscore)
                         .set("SCOUNT", propertycount)
                         .update();
            }
        } else {
            if (tc != null) {
                // 查找TaskInfo这个表中是否有属性对应的项目资料,如果有的话就更新没有就删除
                List<TaskInfo> t_info = TaskInfo.dao.getTaskInfoByType(propertyid);

                if (t_info.size() == 0) {
                    return tc.delete();
                } else {
                    return tc.set("ISUSED", 1).update();
                }
            }
        }

        return (true);
    }

}
