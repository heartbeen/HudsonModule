package com.kc.module.extract;

import java.util.List;

import com.kc.module.dao.ExtractDao;
import com.kc.module.model.RegionDepartment;

public class RegionRootExtract extends ExtractDao {

    private String match;

    public String getMatch() {
        return match;
    }

    public void setMatch(String match) {
        this.match = match;
    }

    @Override
    public Object extract() {
        List<RegionDepartment> root = RegionDepartment.dao.getRootRegion(match);

        RegionDepartment rd = new RegionDepartment();
        rd.set("ID", "").set("name", "全部").set("stepid", "");
        root.add(rd);

        return root;
    }

}
