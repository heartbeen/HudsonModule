package com.kc.module.model;

import java.util.List;

import com.jfinal.plugin.activerecord.Model;

/**
 * 加工状态类
 * 
 * @author David
 * @email xuweissh@163.com
 * 
 */
public class ModuleProcessState extends Model<ModuleProcessState> {

    /**
     * 
     */
    private static final long serialVersionUID = 1L;
    public static ModuleProcessState dao = new ModuleProcessState();

    /**
     * 得到相应的加工状态
     * 
     * @param type
     * @return
     */
    public List<ModuleProcessState> getProcessState(String type) {
        String sql = "SELECT id ,name FROM MD_PROCESS_STATE WHERE id LIKE ?||'%'";
        return find(sql, type);
    }

    /**
     * 得到相应的加工状态
     * 
     * @param type
     * @return
     */
    public List<ModuleProcessState> findSystembarcode() {
        return find("SELECT ID BARCODEID,NAME FROM MD_PROCESS_STATE WHERE TYPE=0 ORDER BY ID");
    }

    /**
     * 获取所有以206开头的工件外发状态
     * 
     * @return
     */
    @Deprecated
    public List<ModuleProcessState> findOutBoundStates() {
        return find("SELECT ID AS STATEID,NAME AS STATENAME FROM MD_PROCESS_STATE WHERE TYPE = 1 AND ID LIKE '206%'");
    }

    /**
     * 获取机台状态
     * 
     * @param classid
     * @param typeid
     * @return
     */
    public List<ModuleProcessState> getReferenceStates(String classid, int typeid) {
        return this.find("SELECT ID AS STATEID,NAME AS STATENAME FROM MD_PROCESS_STATE WHERE ID LIKE ?||'%' AND TYPE = ? ORDER BY ID", classid, typeid);
    }

}
