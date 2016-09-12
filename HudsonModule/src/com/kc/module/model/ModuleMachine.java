package com.kc.module.model;

import java.util.List;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;

public class ModuleMachine extends ModelFinal<ModuleMachine> {

    public static ModuleMachine dao = new ModuleMachine();

    private static final long serialVersionUID = -3998967248761332676L;

    public List<Record> machineData() {
        String sql = "select t.machinecode,t.machinename,t.machinestate,w.typename,p.posname from md_machine t,"
                     + "position_info p,machine_worktype w where t.worktypeid = w.id(+) and t.posid = p.posid";
        return Db.find(sql);
    }

    /**
     * 得到相关加工单位的机台信息
     * 
     * @param posId
     *            加工单位ID
     * @return
     */
    public List<ModuleMachine> getDeptMachine(String posId) {
        String sql = "select mm.machinecode||'号机' machinecode,mm.machinebarcode ,mm.machinestate ,mw.typename"
                     + " from MD_MACHINE mm left join machine_worktype mw "
                     + "on mw.id=mm.worktypeid where mm.posid=?";
        return dao.find(sql, posId);
    }

    /**
     * 计算指定模具加工工艺所有机台的负载
     * 
     * @param craftId
     * @return
     */
    public int findMachineLoad(String craftId) {

        ModuleMachine mm = findFirst("SELECT NVL(SUM(MACLOAD),0) LOAD FROM MD_MACHINE_INFO WHERE ID IN (SELECT DEVICEID FROM MD_DEVICE_CRAFT WHERE CRAFTID = ?)",
                                     craftId);

        return mm.getNumber("LOAD").intValue();
    }

}
