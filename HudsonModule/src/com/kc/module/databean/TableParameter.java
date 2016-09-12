package com.kc.module.databean;

/**
 * 数据库表的条件参数
 * 
 * @author ASUS
 * 
 */
public class TableParameter {
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Object getValue() {
        return value;
    }

    public void setValue(Object value) {
        this.value = value;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    // 列名字
    private String name;
    // 符号(=,IN,<>)
    private String symbol;
    // 参数值
    private Object value;

    /**
     * 将参数转换成SQL语句
     * 
     * @return
     */
    public String toSql() {
        return this.name + " " + this.symbol + " " + this.value;
    }
}
