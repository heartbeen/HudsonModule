package com.kc.module.model;

import java.util.List;

public class ModuleTolerance extends ModelFinal<ModuleTolerance> {

    /**
     * 
     */
    private static final long serialVersionUID = 1L;
    public static ModuleTolerance dao = new ModuleTolerance();

    public List<ModuleTolerance> getModuleTolerance(String partlistcode) {
        return this.find("SELECT * FROM MD_TOLERANCE WHERE PARTBARLISTCODE = ?", partlistcode);
    }
}
