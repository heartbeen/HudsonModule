package com.kc.module.plugin;

import java.io.File;
import java.io.FileFilter;
import java.util.HashMap;
import java.util.Map;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Unmarshaller;

import com.jfinal.kit.StrKit;

/**
 * sql xml 文件映射
 * 
 * @author David
 * @email xuweissh@163.com
 * 
 */
public class SqlManager {

    private static Map<String, String> sqlMap = new HashMap<String, String>();

    public static String sql(String groupNameAndsqlId) {
        return sqlMap.get(groupNameAndsqlId);
    }

    static void clearSqlMap() {
        sqlMap.clear();
    }

    static void parseSqlXml(String path) {
        File file = new File(SqlManager.class.getClassLoader()
                                             .getResource(path)
                                             .getPath()
                                             .replace("%20", " "));
        
        File[] files = file.listFiles(new FileFilter() {
            @Override
            public boolean accept(File pathname) {
                if (pathname.getName().endsWith("sql.xml")) {
                    return true;
                }
                return false;
            }
        });

        for (File xmlfile : files) {
            SqlGroup group = null;
            try {
                JAXBContext context = JAXBContext.newInstance(SqlGroup.class);
                Unmarshaller unmarshaller = context.createUnmarshaller();
                group = (SqlGroup) unmarshaller.unmarshal(xmlfile);
            }
            catch (JAXBException e) {
                throw new RuntimeException(e);
            }
            String name = group.name;

            if (StrKit.isBlank(name)) {
                name = xmlfile.getName();
            }

            for (SqlItem sqlItem : group.sqlItems) {
                sqlMap.put(sqlItem.database.toLowerCase()
                                           .concat(sqlItem.database.length() == 0 ? "" : ".")
                                           .concat(name.toLowerCase())
                                           .concat(".")
                                           .concat(sqlItem.id.toLowerCase()),
                           sqlItem.value);
            }
        }
    }

}