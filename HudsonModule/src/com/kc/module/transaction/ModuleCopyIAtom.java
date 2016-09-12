package com.kc.module.transaction;

import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.IAtom;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.base.Barcode;
import com.kc.module.utils.DBUtils;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.JsonUtils;
import com.kc.module.utils.StringUtils;

/**
 * 用于复制模具的工件讯息
 * 
 * @author Administrator
 * 
 */
public class ModuleCopyIAtom implements IAtom {
    public Controller controller;

    public Controller getController() {
        return controller;
    }

    public void setController(Controller controller) {
        this.controller = controller;
    }

    public int result;

    public int getResult() {
        return result;
    }

    public void setResult(int result) {
        this.result = result;
    }

    @Override
    public boolean run() throws SQLException {
        String modulelist = this.getController().getPara("modulelist");
        String refermodule = this.getController().getPara("refer");

        if (StringUtils.isEmpty(modulelist)) {
            this.setResult(-1);
            return (false);
        }

        if (StringUtils.isEmpty(refermodule)) {
            this.setResult(-2);
            return (false);
        }

        String[] m_arr = JsonUtils.parseJsArray(modulelist);

        StringBuilder builder = new StringBuilder();
        builder.append("SELECT ML.MODULEBARCODE,MR.ID AS RSMID, (                     ");
        builder.append("        SELECT COUNT(*)                                       ");
        builder.append("        FROM MD_PART_LIST MPL                                 ");
        builder.append("        WHERE MPL.MODULEBARCODE = ML.MODULEBARCODE            ");
        builder.append("            AND MPL.ISENABLE = ?                              ");
        builder.append("        ) AS PARTCOUNT                                        ");
        builder.append("FROM MODULELIST ML LEFT JOIN MD_RESUME MR ON                  ");
        builder.append("ML.MODULEBARCODE = MR.MODULEBARCODE WHERE ML.MODULEBARCODE IN ");

        builder.append(DBUtils.sqlIn(m_arr));

        List<Record> mRcd = Db.find(builder.toString(), "0");
        Map<String, String> mExsit = new HashMap<String, String>();

        for (Record r : mRcd) {
            String m_barcode = r.getStr("MODULEBARCODE");
            String m_resume = r.getStr("RSMID");
            int m_count = r.getNumber("PARTCOUNT").intValue();
            // 如果查询的结果是工件数量为0并且集合中不存在该模具号,则在集合中添加该模具号
            if (m_count == 0 && !mExsit.containsKey(m_barcode)) {
                mExsit.put(m_barcode, m_resume);
            }
        }
        // 如果集合中的模具数量为0,则返回
        if (mExsit.size() == 0) {
            this.setResult(-3);
            return (false);
        }

        builder = new StringBuilder();

        builder.append("SELECT * FROM MD_PART A, MD_PART_LIST B     ");
        builder.append("WHERE A.PARTBARCODE = B.PARTBARCODE         ");
        builder.append(" AND B.ISENABLE = ? AND A.MODULEBARCODE = ? ");
        builder.append(" ORDER BY A.PARTBARCODE");

        // 查询参考模具讯息,如果参考模具工件讯息为空,则返回-4
        List<Record> part_info = Db.find(builder.toString(), "0", refermodule);
        if (part_info.size() == 0) {
            this.setResult(-4);
            return (false);
        }

        // 刷新当前的MD_PROCESS_INFO表的ID最大值
        Barcode.MD_PROCESS_INFO.nextVal(true);

        // 用于暂存部件号码以备工件进行参考对比
        String k_partcode = null;
        // 用于生成一个新的部件ID号
        String t_partnewid = null;
        // 初始化一至数据库的结果
        boolean rst = false;

        Record m_save = new Record();
        Record p_save = new Record();
        Record l_save = new Record();

        for (String key : mExsit.keySet()) {
            String t_rsmid = mExsit.get(key);
            for (Record r : part_info) {
                // 部件号
                String t_partcode = r.getStr("PARTCODE");
                // 工件唯一号
                String t_partbarlistcode = r.getStr("PARTBARLISTCODE");
                // 工件号码
                String t_partlistcode = r.getStr("PARTLISTCODE");
                // 工件后缀
                String t_partlistbatch = r.getStr("PARTLISTBATCH");
                // 工件名称
                String t_partname = r.getStr("CNAMES");
                // 工件种类
                String t_raceid = r.getStr("RACEID");
                // 工件规格
                String t_norms = r.getStr("NORMS");
                // 工件材料
                String t_material = r.getStr("MATERIAL");
                // 工件数量
                int t_quantity = r.getNumber("QUANTITY").intValue();
                // 是否固件
                String t_firm = r.getStr("ISFIRMWARE");
                // 如果暂存部件号为空,则将部件号设置为第一个部件号,并且为新的部件号赋一个新的唯一值
                // 如果部件号与暂存号对比发生了变化,则将暂存号设置为部件号,其他情况暂存号不变
                if (StringUtils.isEmpty(k_partcode)) {
                    k_partcode = t_partcode;
                    t_partnewid = Barcode.MODULE_PART.nextVal();
                    m_save = new Record();
                    m_save.set("PARTBARCODE", t_partnewid)
                          .set("MODULEBARCODE", key)
                          .set("PARTCODE", t_partcode)
                          .set("CNAMES", t_partname)
                          .set("RACEID", t_raceid)
                          .set("NORMS", t_norms)
                          .set("MATERIAL", t_material)
                          .set("QUANTITY", t_quantity)
                          .set("ISFIRMWARE", t_firm)
                          .set("ISBATCH", "0")
                          .set("ISPROCESS", 0)
                          .set("MEASURE", 0);
                    // 将部件保存至MD_PART表,如果结果为FALSE,表示保存失败
                    rst = Db.save("MD_PART", "PARTBARCODE", m_save);
                    if (!rst) {
                        this.setResult(-5);
                        return rst;
                    }

                } else {
                    if (!k_partcode.equals(t_partcode)) {
                        k_partcode = t_partcode;
                        t_partnewid = Barcode.MODULE_PART.nextVal();
                        m_save = new Record();
                        m_save.set("PARTBARCODE", t_partnewid)
                              .set("MODULEBARCODE", key)
                              .set("PARTCODE", t_partcode)
                              .set("CNAMES", t_partname)
                              .set("RACEID", t_raceid)
                              .set("NORMS", t_norms)
                              .set("MATERIAL", t_material)
                              .set("QUANTITY", t_quantity)
                              .set("ISFIRMWARE", t_firm)
                              .set("ISBATCH", "0")
                              .set("ISPROCESS", 0)
                              .set("MEASURE", 0);
                        rst = Db.save("MD_PART", "PARTBARCODE", m_save);
                        if (!rst) {
                            this.setResult(-5);
                            return rst;
                        }
                    }
                }

                // 如果查询的工件唯一号为空,则跳过,否则将工件添加至MD_PART_LIST表,并且将MD_PROCESS_INFO表增加一个工件记录
                if (!StringUtils.isEmpty(t_partbarlistcode)) {
                    String t_listnewid = Barcode.MODULE_PART_LIST.nextVal();
                    p_save = new Record();
                    p_save.set("PARTBARLISTCODE", t_listnewid)
                          .set("MODULEBARCODE", key)
                          .set("PARTBARCODE", t_partnewid)
                          .set("PARTLISTCODE", t_partlistcode)
                          .set("PARTROOTCODE", t_partcode)
                          .set("PARTLISTBATCH", t_partlistbatch)
                          .set("ISENABLE", "0");

                    rst = Db.save("MD_PART_LIST", "PARTBARLISTCODE", p_save);
                    if (!rst) {
                        this.setResult(-5);
                        return rst;
                    }

                    String t_processid = Barcode.MD_PROCESS_INFO.nextVal();

                    l_save = new Record();
                    l_save.set("ID", t_processid)
                          .set("PARTBARLISTCODE", t_listnewid)
                          .set("MODULERESUMEID", t_rsmid)
                          .set("ACTIONTIME", DateUtils.parseTimeStamp(DateUtils.getDateNow()));

                    rst = Db.save("MD_PROCESS_INFO", l_save);
                    if (!rst) {
                        this.setResult(-5);
                        return rst;
                    }
                }
            }
        }

        this.setResult(1);
        return (true);
    }
}
