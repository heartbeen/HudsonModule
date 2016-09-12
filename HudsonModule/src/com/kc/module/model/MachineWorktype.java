package com.kc.module.model;

import java.util.List;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;

public class MachineWorktype extends ModelFinal<MachineWorktype> {
    
    public static MachineWorktype dao = new MachineWorktype();  

    private static final long serialVersionUID = -3998967248761332676L;

    public List<Record> machineWorkTypeName() {  
        String sql = "select id,typeName from machine_worktype";        
        return Db.find(sql);            
    }    
}
