package com.kc.module.plugin;

import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlValue;

/**
 * 
 * @author Administrator
 * 
 */
@XmlRootElement
class SqlItem {

    /**
     * 业务名称
     */
    @XmlAttribute
    String id;

    /**
     * 对应数据库
     */
    @XmlAttribute
    String database = "";

    /**
     * sql语句
     */
    @XmlValue
    String value;

}