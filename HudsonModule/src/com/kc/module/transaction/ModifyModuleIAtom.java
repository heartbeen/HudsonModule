package com.kc.module.transaction;

import java.sql.SQLException;
import java.util.List;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.IAtom;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.base.Barcode;
import com.kc.module.model.form.ModifyModuleInfoForm;
import com.kc.module.utils.ControlUtils;
import com.kc.module.utils.DBUtils;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.JsonUtils;
import com.kc.module.utils.StringUtils;

public class ModifyModuleIAtom implements IAtom {
    private Controller controller;

    public Controller getController() {
        return controller;
    }

    public void setController(Controller controller) {
        this.controller = controller;
    }

    public boolean isResult() {
        return result;
    }

    public void setResult(boolean result) {
        this.result = result;
    }

    public int getFlag() {
        return flag;
    }

    public void setFlag(int flag) {
        this.flag = flag;
    }

    private boolean result;
    private int flag;

    @Override
    public boolean run() throws SQLException {
        ObjectMapper mapper = new ObjectMapper();
        try {
            String pmark = StringUtils.parseString(this.getController().getPara("pmark"));
            String module = StringUtils.parseString(this.getController().getPara("module"));
            ModifyModuleInfoForm form = mapper.readValue(this.controller.getPara("para"),
                                                         ModifyModuleInfoForm.class);
            // 模具工件的唯一号集合,如果集合内容为空,则返回FALSE
            String[] list = JsonUtils.parseJsArray(this.getController().getPara("list"));

            if (list == null || list.length == 0) {
                this.setFlag(-1);
                return (false);
            }

            if (StringUtils.isEmpty(module)) {
                this.setFlag(-2);
                return (false);
            }

            String starttime = form.getStartdate() + " " + form.getStarttime() + ":00";
            String endtime = form.getEnddate() + " " + form.getEndtime() + ":00";
            boolean dateRst = DateUtils.dateCompare(starttime, endtime, "yyyy-MM-dd HH:mm:ss");
            if (!dateRst) {
                this.setFlag(-6);
                return (false);
            }

            if (StringUtils.isEmpty(form.getResumeState()) || form.getResumeState().equals("20401")) {
                this.setFlag(-5);
                return (false);
            }

            StringBuilder builder = new StringBuilder();
            builder.append("SELECT A.OPERATEFLAG, A.MODULESTATE, B.RESUMESTATE ");
            builder.append(",B.ID FROM MODULELIST A ");
            builder.append(" LEFT JOIN MD_RESUME B ON A.MODULEBARCODE = B.MODULEBARCODE ");
            builder.append(" WHERE A.MODULEBARCODE = ? AND A.MODULESTATE = ?");
            // 查询相关的模具讯息
            Record rcd = Db.findFirst(builder.toString(), module, "0");
            if (rcd == null) {
                this.setFlag(-3);
                return (false);
            }

            // 操作标识,0正在操作状态1可以操作状态
            String operflag = StringUtils.parseString(rcd.getStr("OPERATEFLAG"));
            String rsmstate = StringUtils.parseString(rcd.getStr("RESUMESTATE"));
            // 如果操作号为1代表模具为完成状态,需要重新生成一个履历号,否则为加工状态,获取其当前履历号
            String mdResumeId = null;

            if (operflag.equals("1")) {
                mdResumeId = Barcode.MODULE_RESUME.nextVal();
            } else {
                // 判断模具状态跟要操作的工件是否是一个状态,如果不是一个状态,则返回FALSE
                if (!rsmstate.equals(form.getResumeState())) {
                    this.setFlag(-4);
                    return (false);
                }

                mdResumeId = rcd.getStr("ID");
            }

            boolean rst = false;

            builder = new StringBuilder();
            builder.append("SELECT A.PARTBARLISTCODE, B.ID ");
            builder.append("FROM MD_PART_LIST A ");
            builder.append("LEFT JOIN MD_PROCESS_INFO B ON A.PARTBARLISTCODE = ");
            builder.append("B.PARTBARLISTCODE WHERE A.MODULEBARCODE = ?");
            builder.append(" AND A.ISENABLE = ? AND A.PARTBARLISTCODE IN ");
            builder.append(DBUtils.sqlIn(list));

            // 如果查询出来的对应的工件讯息没有符合要求的,则返回FALSE
            List<Record> r_list = Db.find(builder.toString(), module, "0");
            if (r_list.size() == 0) {
                this.setFlag(-7);
                return (false);
            }
            
            Barcode.MD_PROCESS_INFO.nextVal(true);

            for (Record row : r_list) {
                String partbarlistcode = row.getStr("PARTBARLISTCODE");
                // 如果工件的ID号不存在
                if (StringUtils.isEmpty(row.getStr("ID"))) {
                    String mdProcessId = Barcode.MD_PROCESS_INFO.nextVal();
                    row = new Record();
                    row.set("ID", mdProcessId)
                       .set("PARTBARLISTCODE", partbarlistcode)
                       .set("MODULERESUMEID", mdResumeId)
                       .set("ACTIONTIME", DateUtils.parseTimeStamp(DateUtils.getDateNow()))
                       .set("REMARK", pmark);
                    // 将工件讯息插入MD_PROCESS_INFO表中
                    rst = Db.save("MD_PROCESS_INFO", row);
                    if (!rst) {
                        this.setFlag(-8);
                        return (false);
                    }
                }
            }

            Record updateRcd = new Record();

            if (operflag.equals("1")) {
                updateRcd.set("ID", mdResumeId)
                         .set("RESUMESTATE", form.getResumeState())
                         .set("RESUMEEMPID", ControlUtils.getAccountId(this.controller))
                         .set("STARTTIME", DateUtils.parseTimeStamp(starttime))
                         .set("ENDTIME", DateUtils.parseTimeStamp(endtime))
                         .set("REMARK", form.getRemark())
                         .set("MODULEBARCODE", module);
                // 保存MD_RESUME履历记录
                rst = Db.save("MD_RESUME", updateRcd);
                if (!rst) {
                    this.setFlag(-9);
                    return (false);
                }
                // 保存MD_RESUME_RECORD履历记录
                rst = Db.save("MD_RESUME_RECORD", updateRcd);
                if (!rst) {
                    this.setFlag(-10);
                    return (false);
                }
                // 将模具的OPERATE设置为0,表示该模具设置为加工状态
                updateRcd = new Record();
                updateRcd.set("MODULEBARCODE", module).set("OPERATEFLAG", "0");
                rst = Db.update("MODULELIST", "MODULEBARCODE", updateRcd);
                if (!rst) {
                    return (false);
                }
            }

            return (true);
        }
        catch (Exception e) {
            e.printStackTrace();
            this.setFlag(-11);
            return (false);
        }
    }
}
