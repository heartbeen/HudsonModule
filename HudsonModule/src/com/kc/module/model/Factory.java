package com.kc.module.model;

import java.net.URLDecoder;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import com.jfinal.kit.StrKit;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Page;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.base.Barcode;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.StringUtils;

public class Factory extends ModelFinal<Factory> {

    public static Factory dao = new Factory();

    private static final long serialVersionUID = -3998967248761332676L;

    /**
     * 获取厂区讯息<br>
     * 第二个参数01代表为本集团公司类型
     * 
     * @return
     */
    public List<Record> getRegion(String flag) {
        StringBuilder builder = new StringBuilder();
        builder.append("SELECT                                          ");
        builder.append("b.ID AS BARID,a.FACTORYCODE, a.ID AS FATID,     ");
        builder.append("a.SHORTNAME,CONTACTOR,ADDRESS,PHONENUMBER FROM  ");
        builder.append("FACTORY a LEFT JOIN REGION_DEPART b             ");
        builder.append("ON a.FACTORYCODE = b.STEPID                     ");
        builder.append("WHERE                                           ");
        builder.append("a.FACTORYTYPE = ?                               ");
        builder.append("ORDER BY a.FACTORYCODE                          ");

        return Db.find(builder.toString(), flag);
    }

    public boolean saveFactoryInfo(List<String> list) {
        // 如果获取的参数为空,返回FALSE讯息
        if (list == null) {
            return (false);
        }

        // 如果外发厂商的代号编号为空,返回
        String code = StringUtils.parseString(list.get(0));
        if (code.isEmpty()) {
            return (false);
        }

        StringBuilder builder = new StringBuilder("SELECT * FROM FACTORY WHERE FACTORYCODE ='");
        builder.append(code);
        builder.append("'");

        // 查询厂商是否已经存在
        List<Factory> row = this.find(builder.toString());
        // 如果查询结果,厂商代号不为空,则表示该代号已经被占用
        if (row != null && row.size() > 0) {
            return (false);
        }

        return new Factory().set("ID", Barcode.FACTORY.nextVal())
                            .set("FACTORYCODE", code)
                            .set("SHORTNAME", list.get(1))
                            .set("FULLNAME", list.get(1))
                            .set("FACTORYTYPE", "3")
                            .set("ADDRESS", list.get(3))
                            .set("CONTACTOR", list.get(2))
                            .set("PHONENUMBER", list.get(4))
                            .save();
    }

    public List<Record> factoryName() {
        String sql = "select factoryCode,shortName from factory where factorytype='01'";
        return Db.find(sql);
    }

    public List<Record> factoryData() {
        String sql = "select * from factory where factoryType='01' order by factoryCode";
        return Db.find(sql);
    }

    public List<Factory> getInnerFactory(String type) {
        if (type == null || type.trim().equals("")) {
            return (null);
        }

        return find("select factorycode,shortname from FACTORY where factorytype = '" + type + "' order by factorycode");
    }

    /**
     * 
     * @param field
     * @param condition
     * @return
     */
    public Page<Factory> findFactory(String field, String condition, int page, int start, int limit) {

        String sql = "select * ";
        String sqlExceptSelect = "";
        if (!StrKit.isBlank(field) && !StrKit.isBlank(condition)) {
            sqlExceptSelect = "from FACTORY where " + field + " like '%" + URLDecoder.decode(condition).toUpperCase().trim() + "%'";
        } else {
            sqlExceptSelect = "from FACTORY ";
        }

        return paginate(page, limit, sql, sqlExceptSelect);
    }

    /**
     * 生成一个字符串ID
     * 
     * @param factoryId
     * @param deptId
     * @return
     */
    public String getFactoryIdData(String factoryId, String deptId) {
        String idData = "";
        String date = DateUtils.dateToStr(new Date(), "yyyy-mm-dd").replace("-", "");
        idData = factoryId + deptId + date;
        String sql = "select top 1 idData from factory where idData =" + idData + "%" + "order by idData desc";
        Record data = Db.findFirst(sql);
        if (data == null) {
            idData += "000001";
        } else {
            int i = Integer.parseInt(data.get("idData").toString()) + 1;
            idData = String.valueOf(i);
        }
        return idData;
    }

    /**
     * 查询客户代号
     * 
     * @param type
     *            客户类型
     * @param code
     *            客户代号匹配
     * @return
     */
    public List<Factory> queryGuestFactory(String type, String query) {

        String sql = "select id guestid,factorycode,shortname from FACTORY where "
                     + "factorytype = ? and factorycode like ?||'%' order by factorycode";

        return dao.find(sql, type, (query == null ? "" : query.toUpperCase()));

    }

    /**
     * 新增帐号信息
     * 
     * @param factoryCode
     * @param shortName
     * @param fullName
     * @param factoryTpye
     * @param address
     * @param forWhich
     * @param contactor
     * @param phoneNumber
     * @param faxNumber
     * @param creator
     * @param nature
     * @param isDeal
     * @return
     */
    public Boolean insertFactory(String factoryCode,
                                 String shortName,
                                 String fullName,
                                 String address,
                                 String contactor,
                                 String phoneNumber,
                                 String faxNumber,
                                 String creator,
                                 int nature,
                                 String factoryType) {
        return new Factory().set("id", UUID.randomUUID().toString())
                            .set("factoryCode", factoryCode)
                            .set("shortName", shortName)
                            .set("fullName", fullName)
                            .set("address", address)
                            .set("contactor", contactor)
                            .set("phoneNumber", phoneNumber)
                            .set("faxNumber", faxNumber)
                            .set("creator", creator)
                            .set("nature", nature)
                            .set("factoryType", factoryType)
                            .set("createTime", new java.sql.Timestamp(new Date().getTime()))
                            .save();
    }

    /**
     * 根据ID,删除工厂记录
     * 
     * @param id
     * @return
     */
    public Boolean deleteFactory(String id) {
        return Db.deleteById("factory", id);
    }

    /**
     * 通过客户代码得到客户ID
     * 
     * @param factoryCode
     * @return
     */
    public String findFactoryId(String factoryCode) {
        Factory factory = findFirst("select id from " + tableName() + " where factorycode=?", factoryCode);
        return factory == null ? "" : factory.getStr("id");
    }

//    /**
//     * 查询客户代号
//     * 
//     * @param type
//     *            客户类型
//     * @param code
//     *            客户代号匹配
//     * @return
//     */
//    public List<Factory> queryGuestFactoryByNameOrCode(String type, String col, String query) {
//
//        StringBuilder builder = new StringBuilder();
//
//        builder.append("select id guestid,factorycode,shortname from FACTORY where factorytype = ?");
//        if (query == null) {
//            builder.append("and factorycode|| like ?||'%' order by factorycode");
//        }
//
//        return dao.find(sql, type, (query == null ? "" : query.toUpperCase()));
//    }

}
