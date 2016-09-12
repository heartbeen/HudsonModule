package com.kc.module.plugin;

import com.jfinal.log.Logger;
import com.jfinal.plugin.IPlugin;

/**
 * sqlxml插件
 * 
 * @author David
 * @email xuweissh@163.com
 * 
 */
public class SqlInXmlPlugin implements IPlugin {

    private Logger logger = Logger.getLogger(SqlInXmlPlugin.class);

    private String path = "";

    public SqlInXmlPlugin(String path) {
        this.path = path;
    }

    @Override
    public boolean start() {

        try {
            SqlManager.parseSqlXml(path);
        }
        catch (Exception e) {
            logger.error("sql file faild read!", e);
            new RuntimeException(e);
        }
        return true;
    }

    @Override
    public boolean stop() {
        SqlManager.clearSqlMap();
        return true;
    }

}