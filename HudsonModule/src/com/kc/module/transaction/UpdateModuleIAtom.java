package com.kc.module.transaction;

import java.sql.Timestamp;

import com.jfinal.plugin.activerecord.Db;

public class UpdateModuleIAtom extends SqlTranscation {
    public static UpdateModuleIAtom iAtom = new UpdateModuleIAtom();

    @Override
    public boolean run() {
        try {
            String ajaxText = ctrl.getPara(ajaxAttr[0]);
            String updateModuleList = "update modulelist set moduleclass = ?,inittrytime = ?"
                                      + ",takeon = ?,starttime = ?,productname = ?,workpressure"
                                      + " = ?,unitextrac = ? where modulebarcode = ?";
            // String updateMdResume =
            // "update md_resume set starttime = ?,endtime = ? where modulebarcode = ?";
            if (ajaxText.equals("")) {
                return (false);
            }
            String[] trList = ajaxText.split("<TR>", -1);
            for (String row : trList) {
                String[] items = row.split("<TD>", -1);
                int ml_rs = Db.update(updateModuleList,
                                      items[1],
                                      Timestamp.valueOf(items[6] + " 00:00:00"),
                                      items[7],
                                      Timestamp.valueOf(items[5] + " 00:00:00"),
                                      items[2],
                                      items[3],
                                      items[4],
                                      items[8]);

                if (ml_rs != 1) {
                    return (false);
                }
            }
            return (true);
        }
        catch (Exception e) {
            return (false);
        }
    }
}
