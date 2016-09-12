package com.kc.module.model;

import java.util.List;

import com.jfinal.plugin.activerecord.DbKit;
import com.jfinal.plugin.activerecord.Model;
import com.jfinal.plugin.activerecord.Table;
import com.jfinal.plugin.activerecord.TableMapping;
import com.jfinal.plugin.activerecord.dialect.Dialect;
import com.kc.module.utils.ConstUtils;
import com.kc.module.utils.DataUtils;

public abstract class ModelFinal<M extends ModelFinal<?>> extends Model<M> {

    private String dialectName;

    private String className;

    /**
     * 
     */
    private static final long serialVersionUID = 1L;
    private Table table;

    public List<M> listAll() {
        return this.find("select * from " + tableName() + " order by " + getPrimaryKey());

    }

    /**
     * 得到表名
     * 
     * @return
     */
    public String tableName() {
        return getTable().getName();
    }

    /**
     * 得到主键名
     * 
     * @return
     */
    public String getPrimaryKey() {
        return getTable().getPrimaryKey();
    }

    public Table getTable() {
        if (table == null) {
            table = TableMapping.me().getTable(getClass());
        }

        return table;
    }

    public Class<?> getColumnType(String columnLabel) {
        return getTable().getColumnType(columnLabel);
    }

    /**
     * 得到表的方言
     * 
     * @return
     */
    private Dialect getDialect() {
        return DbKit.getConfig(getClass()).getDialect();
    }

    public String getDialectStr() {
        if (dialectName == null) {
            dialectName = getDialect().getClass().getSimpleName().toLowerCase();
        }
        return dialectName;
    }

    /**
     * 得到sql语句的key
     * 
     * @param func
     * @return
     */
    public String sqlKey(String func) {
        return getDialectStr().concat(".").concat(getClassName()).concat(".").concat(func == null ? "" : func.toLowerCase());
    }

    public String getClassName() {
        if (className == null) {
            className = getClass().getSimpleName().toLowerCase();
        }

        return className;
    }

    /**
     * 通过给定条件查找数据
     * 
     * @param colunms
     * @param paras
     * @return
     */
    public List<M> findFromCondition(String[] colunms, Object... paras) {

        if (colunms.length != paras.length) {
            throw new RuntimeException("列长度与参数长度不相等:" + colunms.length + "->" + paras.length);
        }

        StringBuilder sql = selectSql();

        for (int i = 0; i < colunms.length; i++) {
            sql.append(colunms[i]).append("=?");
            sql.append(i == colunms.length - 1 ? "" : " and ");
        }

        return find(sql.toString(), paras);
    }

    public M findFristCondition(String[] colunms, Object... paras) {
        List<M> list = findFromCondition(colunms, paras);
        return list.size() > 0 ? list.get(0) : null;
    }

    public StringBuilder selectSql() {
        StringBuilder sql = new StringBuilder();
        sql.append("select * from ").append(tableName()).append(" where ");

        return sql;
    }

    public StringBuilder updateSql() {
        StringBuilder sql = new StringBuilder();
        sql.append("update ").append(tableName()).append(" set ");
        return sql;
    }

    /**
     * 
     * @param cn
     * @return
     */
    public M findFirstByColunmName(String... cn) {
        Object[] paras = new Object[cn.length];

        for (int i = 0; i < cn.length; i++) {
            paras[i] = get(cn[i]);
        }
        return findFristCondition(cn, paras);
    }

    /**
     * 
     * @param cn
     * @return
     */
    public List<M> findByColunmName(String... cn) {
        Object[] paras = new Object[cn.length];

        for (int i = 0; i < cn.length; i++) {
            paras[i] = get(cn[i]);
        }
        return findFromCondition(cn, paras);
    }

    @Override
    public boolean save() {
        converet();
        return super.save();
    }

    @Override
    public boolean update() {
        converet();
        return super.update();
    }

    private void converet() {
        if (ConstUtils.DATABASE_CHARSET.indexOf("ZHT16MSWIN950") > 0) {
            DataUtils.convertCharset(this, "TW");
        }

        if (ConstUtils.DATABASE_CHARSET.indexOf("GB2312") > 0) {
            DataUtils.convertCharset(this, "CN");
        }
    }

}
