package com.kc.module.model.form;

/**
 * @项目名称: 谷崧集团管理系统
 * @类说明: 分页查询属性类
 * @author 徐维
 * @建立日期 2013-08-02
 * @email xuwei@sinyon.com.cn
 */
public class PageQuery {

    /**
     * 要查询的值
     */
    private String query;

    /**
     * 其它查询条件,不是必有条件
     */
    private String otherQuery;

    /**
     * 查询的页码
     */
    private int page;

    /**
     * 开始记录行号
     */
    private int start;

    /**
     * 一页显示的行数
     */
    private int limit;

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public String getOtherQuery() {
        return otherQuery;
    }

    public void setOtherQuery(String otherQuery) {
        this.otherQuery = otherQuery;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getStart() {
        return start;
    }

    public void setStart(int start) {
        this.start = start;
    }

    public int getLimit() {
        return limit;
    }

    public void setLimit(int limit) {
        this.limit = limit;
    }

}
