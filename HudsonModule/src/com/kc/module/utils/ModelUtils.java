package com.kc.module.utils;

import java.util.HashMap;
import java.util.List;

import com.jfinal.kit.JsonKit;
import com.jfinal.plugin.activerecord.Model;
import com.jfinal.plugin.activerecord.Record;
import com.jfinal.plugin.activerecord.Table;
import com.kc.module.model.ModelFinal;

/****************************************************************************************
 * 本类为对Model类的处理类
 * 
 * @author XZF
 * 
 ****************************************************************************************/
public class ModelUtils {
    /**
     * 获取非空Model的JSON串
     * 
     * @param model
     * @return
     */
    public static String getModelJson(Model<?> model) {
        if (model != null) {
            return model.toJson();

        } else {
            return null;
        }
    }

    /**
     * 获取非空Record的JSON串
     * 
     * @param model
     * @return
     */
    public static String getRecordJson(Record record) {
        if (record != null) {
            return record.toJson();

        } else {
            return null;
        }
    }

    /**
     * 指定将model类中的某些列包装成JSON
     * 
     * @param model
     * @param columns
     * @return
     */
    public static String getModelJson(Model<?> model, String[] columns) {
        if (model == null) {
            return (null);
        }

        if (columns == null || columns.length == 0) {
            return (null);
        }

        HashMap<String, Object> hash = new HashMap<String, Object>();

        for (String col : columns) {
            for (String attr : model.getAttrNames()) {
                if (attr.equals(col)) {
                    hash.put(attr, model.get(attr));
                    break;
                }
            }
        }

        if (hash.size() == 0) {
            return (null);
        } else {
            return JsonKit.toJson(hash, 4);
        }

    }

    /**
     * 获取Model List返回的JSON数组
     * 
     * @param model
     * @return
     */
    public static <M extends Model<?>> String getModelJsonList(List<M> model) {
        if (model == null || model.size() == 0) {
            return "[]";
        } else {
            StringBuilder sb = new StringBuilder("[");
            for (Model<?> m : model) {
                if (m != null) {
                    sb.append(getModelJson(m) + ",");
                }
            }
            return sb.equals("[") ? "[]" : sb.substring(0, sb.length() - 1) + "]";
        }
    }

    public static String getModelRecordList(List<Record> record) {
        if (record == null || record.size() == 0) {
            return "[]";
        } else {
            StringBuilder sb = new StringBuilder("[");
            for (Record m : record) {
                if (m != null) {
                    sb.append(getRecordJson(m) + ",");
                }
            }
            return sb.equals("[") ? "[]" : sb.substring(0, sb.length() - 1) + "]";
        }
    }

    public static <M extends Model<?>> String getModelJsonList(List<M> model, String[] columns) {
        if (model == null || model.size() == 0) {
            return "[]";
        } else {
            StringBuilder sb = new StringBuilder("[");
            for (Model<?> m : model) {
                if (m != null) {
                    sb.append(getModelJson(m, columns) + ",");
                }
            }
            return sb.equals("[") ? "[]" : sb.substring(0, sb.length() - 1) + "]";
        }
    }

    /**
     * 数据对象转换
     * 
     * @param record
     * @param clazz
     * @return
     */
    public static <T extends ModelFinal<?>> T recordToModel(Record record, Class<T> clazz) {
        T model = null;
        try {
            model = clazz.newInstance();

            String[] columnNames = record.getColumnNames();
            Table table = model.getTable();

            for (String name : columnNames) {
                if (table.hasColumnLabel(name)) {
                    model.set(name, record.get(name));
                }
            }
        }
        catch (Exception e) {}

        return model;
    }
}
