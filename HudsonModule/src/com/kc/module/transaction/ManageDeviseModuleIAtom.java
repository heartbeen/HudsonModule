package com.kc.module.transaction;

import java.sql.SQLException;
import java.sql.Timestamp;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.base.Barcode;
import com.kc.module.base.RegularState;
import com.kc.module.dao.BaseIAtom;
import com.kc.module.model.ModuleList;
import com.kc.module.model.form.DeviseModuleInfoForm;
import com.kc.module.utils.ControlUtils;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.JsonUtils;
import com.kc.module.utils.StringUtils;

public class ManageDeviseModuleIAtom extends BaseIAtom {

    @Override
    public boolean run() throws SQLException {
        // 将请求的参数包装成JSON
        String jsonString = ControlUtils.fromParamterToJson(this.getController());
        // 获取工厂唯一代号
        String posid = ControlUtils.getFactoryPosid(this.getController());
        // 获取员工唯一号
        String empid = ControlUtils.getEmpBarCode(this.getController());
        // 将JSON串转化为bean
        DeviseModuleInfoForm dmif = JsonUtils.josnToBean(jsonString, DeviseModuleInfoForm.class);

        // 如果客户番号为空则返回
        if (dmif == null || StringUtils.isEmpty(dmif.getGuestcode())) {
            this.setMsg("客户番号不能为空");
            return false;
        }
        // 查询模具记录
        String query = "SELECT ML.MODULEBARCODE, DR.ID AS DRID, MR.ID AS MRID, DR.STATEID FROM MODULELIST ML LEFT JOIN DS_RESUME DR "
                       + "ON ML.MODULEBARCODE = DR.MODULEBARCODE LEFT JOIN MD_RESUME MR ON ML.MODULEBARCODE = MR.MODULEBARCODE "
                       + " WHERE ML.MODULESTATE = ? AND ML.GUESTCODE = ?";

        Record record = Db.findFirst(query, 0, dmif.getGuestcode());
        Record updateR = null;
        boolean result = false;

        // 获取当前时间
        Timestamp stampNow = DateUtils.getNowStampTime();
        // 去掉备注中的空格
        String remark = StringUtils.trimBlank(dmif.getRemark(), null);
        // 如果模具社内编号为空则将其设置为客户番号
        String modulecode = (StringUtils.isEmpty(dmif.getModulecode()) ? dmif.getGuestcode() : dmif.getModulecode().toUpperCase());
        // 判断模具番号是否重复
        boolean notexsist = validateModuleCode(dmif.getGuestcode(), dmif.getModulecode());

        // FLAG的三种状态0新增1修改2增番
        int flag = dmif.getFlag();
        if (flag == 0) {
            if (record != null) {
                this.setMsg("模具客户番号已经存在了");
                return false;
            }

            if (!notexsist) {
                this.setMsg("模具社内编号已经存在了");
                return false;
            }

            String modulebarcode = Barcode.MODULE.nextVal();

            updateR = new Record();
            updateR.set("POSID", posid)
                   .set("MODULECODE", modulecode)
                   .set("GUESTID", dmif.getGuestid())
                   .set("MODULECLASS", dmif.getModuleclass())
                   .set("INITTRYTIME", DateUtils.parseTimeStamp(dmif.getDuedate()))
                   .set("CREATETIME", stampNow)
                   .set("CREATOR", empid)
                   .set("TAKEON", dmif.getTakeon())
                   .set("STARTTIME", DateUtils.parseTimeStamp(dmif.getOrderdate()))
                   .set("PICTUREURL", dmif.getDeviser())
                   .set("PRODUCTNAME", dmif.getProductname())
                   .set("MODULEINTRO", remark)
                   .set("GUESTCODE", dmif.getGuestcode())
                   .set("WORKPRESSURE", dmif.getWorkpressure())
                   .set("UNITEXTRAC", dmif.getUnitextrac())
                   .set("OPERATEFLAG", "0")
                   .set("MODULEBARCODE", modulebarcode)
                   .set("PLASTIC", dmif.getPlastic())
                   .set("COMBINE", dmif.getCombine())
                   .set("ENSURE", 0)
                   .set("MODULESTATE", 0);

            result = Db.save("MODULELIST", "MODULEBARCODE", updateR);
            if (!result) {
                this.setMsg("新增模具资料失败");
                return result;
            }

            String dsresumeid = Barcode.DS_RESUME.nextVal();

            updateR = new Record();
            updateR.set("ID", dsresumeid)
                   .set("MODULEBARCODE", modulebarcode)
                   .set("STATEID", RegularState.MODULE_RESUME_NEW.getIndex())
                   .set("STARTDATE", DateUtils.parseTimeStamp(dmif.getStartdate()))
                   .set("ENDDATE", DateUtils.parseTimeStamp(dmif.getEnddate()))
                   .set("TAKEON", dmif.getTakeon())
                   .set("MODULERESUMEID", "")
                   .set("EMPID", empid)
                   .set("ACTIONTIME", stampNow)
                   .set("REMARK", remark)
                   .set("ORDERDATE", DateUtils.parseTimeStamp(dmif.getOrderdate()))
                   .set("DUEDATE", DateUtils.parseTimeStamp(dmif.getDuedate()))
                   .set("WORKSTATE", "40101")
                   .set("DEVISER", dmif.getDeviser())
                   .set("ISIMG", 0);

            result = Db.save("DS_RESUME", updateR);
            if (!result) {
                this.setMsg("新增模具资料失败");
                return result;
            }

            result = Db.save("DS_RESUME_RECORD", updateR);
            if (!result) {
                this.setMsg("新增模具资料失败");
                return result;
            }

            // 新增模具部品信息
            if (!StringUtils.isEmpty(dmif.getProductname())) {
                updateR = new Record();
                updateR.set("ID", Barcode.MD_PRODUCT_INFO.nextVal())
                       .set("MODULEBARCODE", modulebarcode)
                       .set("PRODUCTCODE", dmif.getGuestcode())
                       .set("PRODUCTNAME", dmif.getProductname())
                       .set("QUANTITY", 1)
                       .set("EMPID", empid)
                       .set("ACTIONTIME", stampNow);

                result = Db.save("MD_PRODUCT_INFO", updateR);
                if (!result) {
                    this.setMsg("新增模具资料失败");
                    return result;
                }
            }
        }
        // 修模
        else if (flag == 1) {
            // 如果模具唯一号为空，则返回
            if (StringUtils.isEmpty(dmif.getModulebarcode())) {
                this.setMsg("模具资料不完整");
                return false;
            }

            if (record != null) {
                if (!notexsist) {
                    this.setMsg("模具社内编号已经存在了");
                    return false;
                }

                // 获取模具的当前履历状态
                String modulestate = record.getStr("STATEID");
                // 判断模具是否为新模
                boolean isnew = (RegularState.MODULE_RESUME_NEW.getIndex().equals(modulestate));

                updateR = new Record();
                updateR.set("POSID", posid)
                       .set("MODULECODE", modulecode)
                       .set("GUESTID", dmif.getGuestid())
                       .set("MODULECLASS", dmif.getModuleclass())
                       .set("TAKEON", dmif.getTakeon())
                       .set("PICTUREURL", dmif.getDeviser())
                       .set("PRODUCTNAME", dmif.getProductname())
                       .set("MODULEINTRO", remark)
                       .set("GUESTCODE", dmif.getGuestcode())
                       .set("WORKPRESSURE", dmif.getWorkpressure())
                       .set("UNITEXTRAC", dmif.getUnitextrac())
                       .set("MODULEBARCODE", dmif.getModulebarcode())
                       .set("PLASTIC", dmif.getPlastic())
                       .set("COMBINE", dmif.getCombine());
                // 如果为新模具,更新订单日期
                if (isnew) {
                    updateR.set("INITTRYTIME", DateUtils.parseTimeStamp(dmif.getDuedate())) //
                           .set("STARTTIME", DateUtils.parseTimeStamp(dmif.getOrderdate()));
                }
                result = Db.update("MODULELIST", "MODULEBARCODE", updateR);
                if (!result) {
                    this.setMsg("修改模具资料失败");
                    return result;
                }

                // 获取当前的履历设计ID号
                String drid = record.getStr("DRID");
                if (!StringUtils.isEmpty(drid)) {
                    updateR = new Record();
                    updateR.set("ID", drid)
                           .set("STARTDATE", DateUtils.parseTimeStamp(dmif.getStartdate()))
                           .set("ENDDATE", DateUtils.parseTimeStamp(dmif.getEnddate()))
                           .set("TAKEON", dmif.getTakeon())
                           .set("DEVISER", dmif.getDeviser())
                           .set("REMARK", remark);

                    // 如果为新模具,更新订单日期
                    if (isnew) {
                        updateR.set("ORDERDATE", DateUtils.parseTimeStamp(dmif.getOrderdate()))//
                               .set("DUEDATE", DateUtils.parseTimeStamp(dmif.getDuedate()));
                    }
                    // 更新MD_RESUME表
                    result = Db.update("DS_RESUME", updateR);
                    if (!result) {
                        this.setMsg("修改模具资料失败");
                        return result;
                    }
                    // 更新MD_RESUME_RECORD表
                    result = Db.update("DS_RESUME_RECORD", updateR);
                    if (!result) {
                        this.setMsg("修改模具资料失败");
                        return result;
                    }
                }
                // else {
                // if (!StringUtils.isEmpty(dmif.getIsplan())) {
                // String mrid = record.getStr("mrid");
                // updateR = new Record();
                // updateR.set("ID", Barcode.DS_RESUME.nextVal())
                // .set("STATEID", RegularState.MODULE_RESUME_MEND.getIndex())
                // .set("STARTDATE",
                // DateUtils.parseTimeStamp(dmif.getStartdate()))
                // .set("ENDDATE", DateUtils.parseTimeStamp(dmif.getEnddate()))
                // .set("TAKEON", dmif.getTakeon())
                // .set("MODULERESUMEID", mrid)
                // .set("EMPID", empid)
                // .set("ACTIONTIME", stampNow)
                // .set("REMARK", remark)
                // .set("ORDERDATE",
                // DateUtils.parseTimeStamp(dmif.getOrderdate()))
                // .set("DUEDATE", DateUtils.parseTimeStamp(dmif.getDuedate()))
                // .set("WORKSTATE",
                // RegularState.DESIGN_RESUME_READY.getIndex())
                // .set("DEVISER", dmif.getDeviser());
                //
                // result = Db.save("DS_RESUME", updateR);
                // if (!result) {
                // this.setMsg("修改模具资料失败");
                // return result;
                // }
                //
                // result = Db.save("DS_RESUME_RECORD", updateR);
                // if (!result) {
                // this.setMsg("修改模具资料失败");
                // return result;
                // }
                // }
                // }

            } else {
                this.setMsg("没有该模具的相关信息");
                return (false);
            }
        }

        return true;
    }

    /**
     * 判断模具的客户番号和社内编号是否重复
     * 
     * @param guestcode
     * @param modulecode
     * @return
     */
    private boolean validateModuleCode(String guestcode, String modulecode) {
        // 判断社内编号是否存在
        if (!StringUtils.isEmpty(modulecode)) {
            ModuleList ml = ModuleList.dao.findModuleByColumn("MODULECODE", modulecode.toUpperCase(), true);
            if (ml == null) {
                return (true);
            }

            String matchcode = ml.getStr("GUESTCODE");
            // 如果客户番号为空则返回
            if (StringUtils.isEmpty(matchcode)) {
                return (false);
            }

            return guestcode.equals(matchcode);
        }

        return (true);
    }
}
