package com.kc.module.transaction;

import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.base.Barcode;
import com.kc.module.base.RegularState;
import com.kc.module.dao.BaseIAtom;
import com.kc.module.model.DesignResume;
import com.kc.module.model.DesignResumeRecord;
import com.kc.module.model.ModuleList;
import com.kc.module.model.ModuleResume;
import com.kc.module.model.ModuleResumeRecord;
import com.kc.module.utils.ArithUtils;
import com.kc.module.utils.ControlUtils;
import com.kc.module.utils.DataUtils;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.StringUtils;

/**
 * 发图给生产管理单位
 * 
 * @author ASUS
 * 
 */
public class SendDesignImageIAtom extends BaseIAtom {

    @Override
    public boolean run() throws SQLException {
        try {
            // 获取履历ID
            String resumeid = this.getController().getPara("resumeid");
            String modulecode = this.getController().getPara("modulecode");
            if (StringUtils.isEmpty(resumeid)) {
                this.setMsg("设计履历信息不完整");
                return (false);
            }

            // 获取员工信息唯一号
            String empid = ControlUtils.getEmpBarCode(this.getController());

            StringBuilder builder = new StringBuilder();

            builder.append("SELECT DR.*,(SELECT COUNT(*) FROM MD_RESUME WHERE MODULEBARCODE = DR.MODULEBARCODE) AS RCOUNT,");
            builder.append("(SELECT COUNT(*) FROM MODULELIST WHERE MODULEBARCODE <> DR.MODULEBARCODE AND MODULESTATE = 0 ");
            builder.append("AND MODULECODE = ?) AS MCOUNT FROM DS_RESUME DR WHERE ID = ?");

            DesignResume dr = DesignResume.dao.findFirst(builder.toString(), modulecode, resumeid);
            if (dr == null) {
                this.setMsg("设计履历已不存在");
                return false;
            }
            // 获取模具状态
            String stateid = dr.getStr("STATEID");
            // 获取是否已经发图
            int isimg = dr.getNumber("ISIMG").intValue();

            boolean result = false;

            // 如果模具为新模并且未发图则设置为发图其他跳过
            if (stateid.equals(RegularState.MODULE_RESUME_NEW.getIndex()) && isimg == 0) {
                // 判断社内番号的命名是否正确
                String moduleregex = DataUtils.getPropertyValue("config.properties", "moduleregex");
                if (!StringUtils.isRegex(moduleregex, modulecode)) {
                    this.setMsg("模具社内编号不合法");
                    return (false);
                }

                // 判断社内番号是否重复
                int mcount = ArithUtils.toInt(dr.getNumber("MCOUNT"), 0);
                if (mcount > 0) {
                    this.setMsg("该社内编号已经存在了");
                    return (false);
                }

                String modulebarcode = dr.getStr("MODULEBARCODE");
                Timestamp nowtime = DateUtils.getNowStampTime();

                // 更新模具社内编号信息
                ModuleList ml = new ModuleList();
                ml.set("MODULEBARCODE", modulebarcode).set("MODULECODE", modulecode.toUpperCase());

                result = ml.update();
                if (!result) {
                    this.setMsg("发图失败");
                    return false;
                }

                dr = new DesignResume();
                dr.set("ID", resumeid).set("ISIMG", 1);

                result = dr.update();

                if (!result) {
                    this.setMsg("发图失败");
                    return false;
                }

                DesignResumeRecord drr = new DesignResumeRecord();
                drr.set("ID", resumeid).set("ISIMG", 1);

                result = drr.update();
                if (!result) {
                    this.setMsg("发图失败");
                    return false;
                }

                String mrid = Barcode.MODULE_RESUME.nextVal();

                // 判断模具加工履历已经存在
                int rcount = ArithUtils.toInt(dr.getNumber("RCOUNT"), 0);
                if (rcount == 0) {
                    ModuleResume mr = new ModuleResume();
                    mr.set("ID", mrid)
                      .set("RESUMESTATE", RegularState.MODULE_RESUME_NEW.getIndex())
                      .set("RESUMEEMPID", empid)
                      .set("STARTTIME", dr.getTimestamp("ORDERDATE"))
                      .set("ENDTIME", dr.getTimestamp("DUEDATE"))
                      .set("MODULEBARCODE", modulebarcode)
                      .set("DEVISER", dr.getStr("TAKEON"));

                    result = mr.save();
                    if (!result) {
                        this.setMsg("发图失败");
                        return false;
                    }

                    ModuleResumeRecord mrr = new ModuleResumeRecord();
                    mrr.set("ID", mrid)
                       .set("RESUMESTATE", RegularState.MODULE_RESUME_NEW.getIndex())
                       .set("RESUMEEMPID", empid)
                       .set("STARTTIME", dr.getTimestamp("ORDERDATE"))
                       .set("ENDTIME", dr.getTimestamp("DUEDATE"))
                       .set("MODULEBARCODE", modulebarcode)
                       .set("DEVISER", dr.getStr("TAKEON"))
                       .set("RESUMETIME", DateUtils.getNowStampTime());
                    result = mrr.save();
                    if (!result) {
                        this.setMsg("发图失败");
                        return false;
                    }
                }

                List<Record> partlist = Db.find("SELECT MPL.* FROM MD_PART_LIST MPL LEFT JOIN MD_PROCESS_INFO MPI ON MPL.PARTBARLISTCODE = MPI.PARTBARLISTCODE"
                                                        + " WHERE MPL.MODULEBARCODE = ? AND MPL.ISENABLE = ? AND MPI.ID IS NULL",
                                                modulebarcode,
                                                0);

                if (partlist.size() > 0) {
                    Record record = null;
                    for (Record rcd : partlist) {
                        record = new Record();
                        record.set("ID", Barcode.MD_PROCESS_INFO.nextVal())
                              .set("PARTBARLISTCODE", rcd.getStr("PARTBARLISTCODE"))
                              .set("MODULERESUMEID", mrid)
                              .set("ACTIONTIME", nowtime)
                              .set("ISFIXED", record.getNumber("ISFIXED"))
                              .set("ISMAJOR", "1");

                        result = Db.save("MD_PROCESS_INFO", record);
                        if (!result) {
                            this.setMsg("发图失败");
                            return false;
                        }
                    }
                }
            }

            return true;
        }
        catch (Exception e) {
            e.printStackTrace();
            this.setMsg("资料有误,请联系系统管理员");
            return false;
        }
    }
}
