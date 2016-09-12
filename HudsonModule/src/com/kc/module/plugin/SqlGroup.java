package com.kc.module.plugin;

import java.util.ArrayList;
import java.util.List;

import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement
class SqlGroup {

    /**
     * model名称
     */
    @XmlAttribute
    String name;

    @XmlElement(name = "sql")
    List<SqlItem> sqlItems = new ArrayList<SqlItem>();

    void addSqlgroup(SqlItem sqlGroup) {
        sqlItems.add(sqlGroup);
    }

}