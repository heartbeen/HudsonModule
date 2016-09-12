package com.kc.module.shared;

import java.util.List;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.model.Craft;
import com.kc.module.model.RegionDepartment;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.StringUtils;

public class SharedMethods {

    /**
     * 获取流水号的方法
     * 
     * @param tablename
     * @param col
     * @param len
     * @return
     */
    @Deprecated
    public static String getDateTypeStreamId(String tablename, String col, int len) {
        long stream = 0l;
        StringBuilder builder = new StringBuilder();
        builder.append("SELECT MAX(TO_NUMBER(");
        builder.append(col);
        builder.append(") STREAMID FROM ");
        builder.append(tablename);
        builder.append(" WHERE ");
        builder.append(col);
        builder.append(" LIKE '");
        builder.append(DateUtils.getDateNow(SharedFields.DEFAULT_LONG_DATE_FORMAT));
        builder.append("%'");
        try {
            List<Record> record = Db.find(builder.toString());

            if (record == null || record.get(0).get("STREAMID") == null) {
                stream = Long.valueOf(DateUtils.getDateNow(SharedFields.DEFAULT_LONG_DATE_FORMAT) + StringUtils.leftPad("1", len, "0"));
            } else {
                stream = Long.valueOf(record.get(0).get("STREAMID").toString());
            }

            return stream + "";
        }
        catch (Exception e) {
            return (null);
        }
    }

    /**
     * 将阶梯形式的(如部门,工艺等讯息包括成Json格式)
     * 
     * @param part
     *            Model
     * @param len
     *            设置按阶梯位分割阶梯的长度
     * @return
     */
    public static String packageRegionDepartment(List<RegionDepartment> part, int len) {
        SharedFields.CurrentPart = null;
        SharedFields.Deepth = 0;
        SharedFields.RegionBuilder = new StringBuilder();
        if (part == null) {
            return "[]";
        } else {
            SharedFields.RegionBuilder.append("[");
            for (RegionDepartment detail : part) {
                Number typeNumber = detail.getNumber("KINDID");
                createUnitDepartment(detail.getStr("PARTID"),
                                     detail.getStr("STEPID"),
                                     detail.getStr("NAME"),
                                     detail.getStr("SNAME"),
                                     detail.getStr("CRAFTCODE"),
                                     detail.getStr("HPRICE"),
                                     typeNumber == null ? 0 : typeNumber.intValue(),
                                     len);
            }

            for (int i = 0; i < SharedFields.Deepth; i++) {
                SharedFields.RegionBuilder.append("]}");
            }

            SharedFields.RegionBuilder.append("]");

            return SharedFields.RegionBuilder.toString();
        }
    }

    /**
     * 将工艺资料进行打包
     * 
     * @param crafts
     * @param len
     * @return
     */
    public static String packageCrafts(List<Craft> crafts, int len) {
        SharedFields.CurrentPart = null;
        SharedFields.Deepth = 0;
        SharedFields.RegionBuilder = new StringBuilder();

        if (crafts == null) {
            return "[]";
        } else {
            SharedFields.RegionBuilder.append("[");
            for (Craft detail : crafts) {
                Number typeNumber = detail.getNumber("KINDID");
                createUnitDepartment(detail.getStr("PARTID"),
                                     detail.getStr("STEPID"),
                                     detail.getStr("NAME"),
                                     detail.getStr("SNAME"),
                                     detail.getStr("CRAFTCODE"),
                                     detail.getStr("HPRICE"),
                                     typeNumber == null ? 0 : typeNumber.intValue(),
                                     len);
            }

            for (int i = 0; i < SharedFields.Deepth; i++) {
                SharedFields.RegionBuilder.append("]}");
            }

            SharedFields.RegionBuilder.append("]");

            return SharedFields.RegionBuilder.toString();
        }
    }

    /**
     * 将需要查询的资料包装成TREESTORE格式<br>
     * ID为单元编号<br>
     * NAME为单元名称<br>
     * LEN为截取长度,如每两个字符为一个等级
     * 
     * @param id
     * @param name
     * @param len
     */
    private static synchronized void createUnitDepartment(String id,
                                                          String stepid,
                                                          String name,
                                                          String sname,
                                                          String craftcode,
                                                          String hprice,
                                                          int typeid,
                                                          int len) {
        int depth = getRegionDeepth(stepid, len);
        if (SharedFields.Deepth == 0) {
            // 如果存放部门位置的初始化字段为空则初始化之
            SharedFields.RegionBuilder.append("{id:\"")
                                      .append(id)
                                      .append("\",stepid:\"")
                                      .append(stepid)
                                      .append("\",text:\"")
                                      .append(name)
                                      .append("\",sname:\"")
                                      .append(sname)
                                      .append("\",craftcode:\"")
                                      .append(craftcode)
                                      .append("\",hprice:\"")
                                      .append(hprice)
                                      .append("\",kindid:\"")
                                      .append(typeid)
                                      .append("\",children:[");
            SharedFields.Deepth = depth;
        } else {
            if (SharedFields.Deepth >= depth) {
                for (int i = 0; i < SharedFields.Deepth - depth + 1; i++) {
                    SharedFields.RegionBuilder.append("]}");
                }
                SharedFields.RegionBuilder.append(",{id:\"")
                                          .append(id)
                                          .append("\",stepid:\"")
                                          .append(stepid)
                                          .append("\",text:\"")
                                          .append(name)
                                          .append("\",sname:\"")
                                          .append(sname)
                                          .append("\",craftcode:\"")
                                          .append(craftcode)
                                          .append("\",hprice:\"")
                                          .append(hprice)
                                          .append("\",kindid:\"")
                                          .append(typeid)
                                          .append("\",children:[");
                SharedFields.Deepth = depth;
            } else {
                SharedFields.RegionBuilder.append("{id:\"")
                                          .append(id)
                                          .append("\",stepid:\"")
                                          .append(stepid)
                                          .append("\",text:\"")
                                          .append(name)
                                          .append("\",sname:\"")
                                          .append(sname)
                                          .append("\",craftcode:\"")
                                          .append(craftcode)
                                          .append("\",hprice:\"")
                                          .append(hprice)
                                          .append("\",kindid:\"")
                                          .append(typeid)
                                          .append("\",children:[");
                SharedFields.Deepth = depth;
            }
        }
    }

    /**
     * 获取部门别的深度
     * 
     * @param partid
     * @param len
     * @return
     */
    private static int getRegionDeepth(String partid, int len) {
        if (partid == null || len < 0) {
            return -1;
        } else {
            return partid.length() / len;
        }
    }
}
