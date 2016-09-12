package com.kc.module.transaction;

import java.util.List;
import java.util.Map;

import com.kc.module.base.Barcode;
import com.kc.module.model.ModuleTolerance;
import com.kc.module.model.ModuleToleranceRecord;
import com.kc.module.utils.ControlUtils;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.JsonUtils;
import com.kc.module.utils.StringUtils;

public class SaveMeasurePoints extends SqlTranscation {
    public static SaveMeasurePoints iAtom = new SaveMeasurePoints();

    @Override
    public boolean run() {
        // 獲取登錄的賬戶訊息
        String mdeptid = ControlUtils.getDeptPosid(this.ctrl);
        String mempid = ControlUtils.getAccountId(this.ctrl);

        String modulecode = this.ctrl.getPara(this.ajaxAttr[0]);
        String partlistcode = this.ctrl.getPara(this.ajaxAttr[1]);
        String graphno = this.ctrl.getPara(this.ajaxAttr[2]).toUpperCase();
        String deptid = this.ctrl.getPara(this.ajaxAttr[3]);
        String empid = this.ctrl.getPara(this.ajaxAttr[4]);
        String craftid = this.ctrl.getPara(this.ajaxAttr[5]);
        String makedate = this.ctrl.getPara(this.ajaxAttr[6]);
        // 测量数据集合
        String mdata = this.ctrl.getPara(this.ajaxAttr[7]);

        Map<?, ?>[] dataRow = JsonUtils.fromJsonStrToList(mdata);
        // 测量批次号使用最长时间
        String batchno = DateUtils.getDateNow("yyyyMMddHHmmssSSS");
        // 將MD_TOLERANCE表中的該工件的測量記錄全部讀取出來,進行分析
        List<ModuleTolerance> mtle = ModuleTolerance.dao.getModuleTolerance(partlistcode);
        // 將資料做一個遍歷,從資料庫中對比是否存在該記錄
        for (Map<?, ?> row : dataRow) {
            // 是否存在測量點的標識符
            boolean isExsist = false;
            ModuleTolerance temp = null;
            // 獲取標識符
            String pointId = StringUtils.parseString(row.get("mid"));
            // 如果標識符為空,則跳過該記錄
            if (StringUtils.isEmpty(pointId)) {
                continue;
            }

            for (ModuleTolerance mt : mtle) {
                // 工件測量點標識符
                String mid = StringUtils.parseString(mt.get("MID"));
                if (mid.equals(pointId)) {
                    // 測量記錄點ID號
                    temp = mt;
                    isExsist = true;
                    break;
                }
            }

            if (isExsist) {
                temp.set("MPOSID", mdeptid)
                    .set("MEMPID", mempid)
                    .set("POSID", deptid)
                    .set("EMPID", empid)
                    .set("MSIZE", StringUtils.parseString(row.get("msize")))
                    .set("MAXTOLAR", StringUtils.parseString(row.get("maxtolar")))
                    .set("MINTOLAR", StringUtils.parseString(row.get("mintolar")))
                    .set("TOOLID", StringUtils.parseString(row.get("toolid")))
                    .set("MDATA", StringUtils.parseString(row.get("mdata")))
                    .set("GRAPHNO", graphno)
                    .set("REMARK", StringUtils.parseString(row.get("remark")))
                    .set("BATCHNO", batchno)
                    .set("CRAFTID", craftid)
                    .set("SDATE", makedate)
                    .set("MDATE", DateUtils.getDateNow())
                    .set("MRST", "")
                    .set("DEMPID", "");
                boolean rs = temp.update();
                if (!rs) {
                    return rs;
                }
            } else {
                temp = new ModuleTolerance();
                temp.set("ID", Barcode.MD_TOLARANCE.nextVal())
                    .set("PARTBARLISTCODE", partlistcode)
                    .set("MODULEBARCODE", modulecode)
                    .set("MPOSID", mdeptid)
                    .set("MEMPID", mempid)
                    .set("POSID", deptid)
                    .set("EMPID", empid)
                    .set("MID", StringUtils.parseString(row.get("mid")))
                    .set("MSIZE", StringUtils.parseString(row.get("msize")))
                    .set("MAXTOLAR", StringUtils.parseString(row.get("maxtolar")))
                    .set("MINTOLAR", StringUtils.parseString(row.get("mintolar")))
                    .set("TOOLID", StringUtils.parseString(row.get("toolid")))
                    .set("MDATA", StringUtils.parseString(row.get("mdata")))
                    .set("GRAPHNO", graphno)
                    .set("REMARK", StringUtils.parseString(row.get("remark")))
                    .set("BATCHNO", batchno)
                    .set("CRAFTID", craftid)
                    .set("SDATE", makedate)
                    .set("MDATE", DateUtils.getDateNow())
                    .set("MRST", "")
                    .set("DEMPID", "");

                boolean rs = temp.save();
                if (!rs) {
                    return rs;
                }
            }

            // 初始化測量記錄類
            ModuleToleranceRecord mtr = new ModuleToleranceRecord();
            mtr.set("ID", Barcode.MD_TOLERANCE_RECORD.nextVal())
               .set("PARTBARLISTCODE", partlistcode)
               .set("MODULEBARCODE", modulecode)
               .set("MPOSID", mdeptid)
               .set("MEMPID", mempid)
               .set("POSID", deptid)
               .set("EMPID", empid)
               .set("MID", StringUtils.parseString(row.get("mid")))
               .set("MSIZE", StringUtils.parseString(row.get("msize")))
               .set("MAXTOLAR", StringUtils.parseString(row.get("maxtolar")))
               .set("MINTOLAR", StringUtils.parseString(row.get("mintolar")))
               .set("TOOLID", StringUtils.parseString(row.get("toolid")))
               .set("MDATA", StringUtils.parseString(row.get("mdata")))
               .set("GRAPHNO", graphno)
               .set("REMARK", StringUtils.parseString(row.get("remark")))
               .set("BATCHNO", batchno)
               .set("CRAFTID", craftid)
               .set("SDATE", makedate)
               .set("MDATE", DateUtils.getDateNow());

            // 更新測量記錄表
            boolean rst = mtr.save();
            if (!rst) {
                return rst;
            }
        }

        return (true);
    }
}
