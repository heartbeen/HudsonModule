package com.kc.module.model;

/**
 * 工件状态说明及索引编号
 * 
 * @author xuwei
 * 
 */
public enum PartState {

    WAIT("待安排", 0), ARRANGED("已安排", 1), PROCESSING("加工中", 2), PAUSE("暂停", 3);

    private String name;

    private int index;

    PartState(String name, int index) {
        this.name = name;
        this.index = index;
    }

    /**
     * 工件状态说明
     * 
     * @return
     */
    public String state() {
        return name;
    }

    /**
     * 工件状态索引号
     * 
     * @return
     */
    public int index() {
        return index;
    }

}
