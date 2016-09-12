package com.kc.module.base;

/**
 * 模具状态枚举
 * 
 * @author David
 * @email xuweissh@163.com
 * 
 */
public enum ModuleState {

    /** */
    MODULE_NEW("新模", "20401"),

    /** */
    MODULE_MODIFTY("修模", "20402"),

    /** */
    MODULE_CANCEL("报废", "20405"),

    /** */
    MODULE_DESIGN_CHANGE("设变", "20403");

    private String name;
    private String index;

    private ModuleState(String name, String index) {
        this.name = name;
        this.index = index;
    }

    public String getName() {
        return name;
    }

    public String getIndex() {
        return index;
    }

}
