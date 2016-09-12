package com.kc.module.model;

/**
 * 机台设备工艺记录操作类<br>
 * 与数据库中<MD_DEVICE_CRAFTRESUME>表相对应<br>
 * 对机台所有操作的设备工艺记录有一个备份,方便后续的查询操作
 * 
 * @author Administrator
 * 
 */
public class MdDeviceCraftResume extends ModelFinal<MdDeviceCraftResume> {

    private static final long serialVersionUID = 1L;
    public static MdDeviceCraftResume dao = new MdDeviceCraftResume();
}
