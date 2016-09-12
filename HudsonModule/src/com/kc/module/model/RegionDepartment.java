package com.kc.module.model;

import java.util.ArrayList;
import java.util.List;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.base.Barcode;
import com.kc.module.utils.ConstUtils;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.StringUtils;

public class RegionDepartment extends ModelFinal<RegionDepartment> {

    /**
     * 
     */
    private static final long serialVersionUID = 1L;
    public static RegionDepartment dao = new RegionDepartment();

    /**
     * 得到新分厂的编号
     * 
     * @return
     */
    public String findBranchFactoryStepId() {
        String sql = "select to_number(nvl(max(stepid),0)) stepid from " + tableName() + " where length(stepid) =2";
        int id = findFirst(sql).getNumber("stepid").intValue() + 1;

        return id > 9 ? id + "" : "0" + id;
    }

    /**
     * 获取机台部门讯息
     * 
     * @param factoryId
     * @return
     */
    public List<RegionDepartment> getRegionDepartment(String factoryId, int deptLayout) {
        StringBuilder builder = new StringBuilder();
        builder.append("SELECT ID AS PARTID,STEPID ,NAME FROM REGION_DEPART WHERE ISAVA = 0");
        if (!StringUtils.isEmpty(factoryId)) {
            builder.append(" AND STEPID LIKE '") //
                   .append(factoryId)
                   .append("%'");
        }

        if (deptLayout != 0) {
            builder.append(" AND LENGTH(STEPID)=").append(deptLayout);
        }

        builder.append(" ORDER BY STEPID ");

        return this.find(builder.toString());
    }

    /**
     * 新增部门
     * 
     * @param stepid
     * @param name
     * @return
     */
    public boolean addRegionDepartment(String stepid, String name) {
        StringBuilder builder = new StringBuilder("SELECT MAX(TO_NUMBER(STEPID)) MAXID FROM REGION_DEPART WHERE 1=1");
        builder.append(" AND STEPID LIKE '");
        builder.append(stepid);
        builder.append("__'");
        List<RegionDepartment> list = this.find(builder.toString());
        // 生成阶梯代号
        String addId = null;
        if (list.get(0).get("MAXID") == null) {
            addId = stepid + "01";
        } else {
            String maxIdStr = list.get(0).get("MAXID").toString();
            int newSize = (maxIdStr.length() / 2 == 0 ? maxIdStr.length() : maxIdStr.length() + 1);
            int maxVal = Integer.valueOf(maxIdStr) + 1;
            addId = StringUtils.leftPad(maxVal + "", newSize, "0");
        }

        RegionDepartment rd = new RegionDepartment();

        rd.set("ID", Barcode.REGION_DEPART.nextVal()) //
          .set("NAME", name)
          .set("CDATE", DateUtils.getNowStampTime())
          .set("STEPID", addId);

        return rd.save();
    }

    /**
     * 得到厂别的所有部门,用于打印码
     * 
     * @param factoryStepId
     * @return
     */
    public List<Record> findDeptForFactory(String factoryStepId) {

        return Db.find("SELECT ID BARCODE,NAME TEXT ,STEPID ID FROM REGION_DEPART WHERE STEPID LIKE ?||'%' AND LENGTH(STEPID ) = 4", factoryStepId);
    }

    /**
     * 得到部门的所有分单位,用于打印码
     * 
     * @param factoryStepId
     * @return
     */
    public List<Record> findRegionForDept(String deptStepId) {

        return Db.find("SELECT ID BARCODE,NAME TEXT,STEPID ID FROM REGION_DEPART WHERE STEPID LIKE ?||'%' AND LENGTH(STEPID ) = 6", deptStepId);
    }

    public List<RegionDepartment> queryRegionDepartByStepid(String stepid) {
        if (stepid == null || stepid.length() < 2) {
            return new ArrayList<RegionDepartment>();
        }

        return this.find("SELECT ID AS POSID,NAME,STEPID FROM REGION_DEPART WHERE STEPID LIKE '" + stepid + "01%' ORDER BY STEPID");
    }

    /**
     * 查找部门层级所对应的部门
     * 
     * @param stepId
     * @return
     */
    public List<Record> findDeptForStepId(String stepId) {
        return Db.find("select id barcode,name text,stepid id  from region_depart rd where rd.STEPID = ?", stepId);
    }

    /**
     * 根据模具加工用户所在的stepid,查找相应的模具加工单位
     * 
     * @return
     */
    public List<RegionDepartment> findDeptForUser(String deptSetpId) {
        StringBuilder sql = new StringBuilder();

        sql.append("SELECT ID DEPTID,NAME FROM REGION_DEPART WHERE STEPID  ");

        switch (deptSetpId.length()) {
        case 2: {
            sql.append("LIKE ?||'" + ConstUtils.MODULE_DEPT_CODE);
            sql.append("'||'%' AND LENGTH(STEPID)=6");
            break;
        }
        case 4: {
            sql.append("LIKE ?||'%' AND LENGTH(STEPID)=6");
            break;
        }
        case 6: {
            sql.append("=? ");
            break;
        }
        }
        sql.append(" ORDER BY ID");

        return find(sql.toString(), deptSetpId);

    }

    public List<RegionDepartment> getUserRegionDepartment(String factoryId, String partNo) {
        // 如果工厂的代号为空,则表示没有权限或者尚未登录,返回一个空的List
        if (StringUtils.isEmpty(factoryId)) {
            return new ArrayList<RegionDepartment>();
        }

        // 执行对匹配厂区的识别
        String sql = "SELECT ID AS DEPTID,NAME AS DEPTNAME,STEPID FROM REGION_DEPART WHERE STEPID LIKE ? ORDER BY STEPID";
        return this.find(sql, factoryId + partNo + "%");
    }

    public List<RegionDepartment> getLocaleSubDepartment(String stepid) {
        // 如果部门单位为空或者阶梯ID号的长度小于6则返回一个空的部门集合
        if (StringUtils.isEmpty(stepid)) {
            return new ArrayList<RegionDepartment>();
        }

        String sql = "SELECT ID,NAME,STEPID FROM REGION_DEPART WHERE STEPID LIKE '" + stepid + "%'";
        return this.find(sql);
    }

    /**
     * 查找模具组立单位
     * 
     * @return
     */
    public List<Record> findModuleAssemble() {
        return Db.find("SELECT ID DEPTID,NAME DEPTNAME FROM REGION_DEPART WHERE STEPID LIKE '040107%' AND LENGTH(STEPID)=8");
    }

    /**
     * 获取金型根节点
     * 
     * @param match
     * @return
     */
    public List<RegionDepartment> getRootRegion(String match) {
        return this.find("SELECT * FROM REGION_DEPART WHERE STEPID LIKE ? ORDER BY ID", match);
    }

    public List<RegionDepartment> getClassifyRegion(int classid, int isava) {
        StringBuilder sql = new StringBuilder();

        sql.append("SELECT RD.ID, RD.NAME, RD.STEPID, RDC.ID AS RDCID FROM REGION_DEPART RD LEFT JOIN (");
        sql.append("SELECT * FROM REGION_DEPART_CLASSIFY WHERE CLASSID = ?) ");
        sql.append("RDC ON RD.ID = RDC.DEPARTID WHERE RD.ISAVA = ? ORDER BY RD.STEPID");

        return this.find(sql.toString(), classid, isava);
    }

    /**
     * 获取分类的部门信息
     * 
     * @param classid
     * @param isava
     * @return
     */
    public List<Record> getPackageClassifyRegion(int classid, int isava) {
        List<RegionDepartment> regionList = getClassifyRegion(classid, isava);
        List<Record> regionRecord = new ArrayList<Record>();

        for (RegionDepartment c : regionList) {
            Record rcd = new Record();

            rcd.set("ID", c.getStr("ID"));
            rcd.set("REGIONNAME", c.getStr("NAME"));
            rcd.set("STEPID", c.getStr("STEPID"));
            rcd.set("RDCID", c.getStr("RDCID"));
            rcd.set("CHECKED", (c.get("RDCID") != null));

            regionRecord.add(rcd);
        }

        return regionRecord;
    }
}
