package com.kc.module.model;

import java.util.List;

public class BarcodePaper extends ModelFinal<BarcodePaper> {

    /**
     * 
     */
    private static final long serialVersionUID = 1L;
    public static BarcodePaper dao = new BarcodePaper();

    /**
     * 得到对应模块的条码纸张
     * 
     * @param moduleId
     *            模块ID
     * @return
     */
    public List<BarcodePaper> findPaperForModule(String moduleId) {
        return findFromCondition(new String[]{"MODULEID"}, moduleId);
    }

    /**
     * 查询当前指定使用的打印纸张
     * 
     * @param moduleId
     *            模块ID
     * @return
     */
    public BarcodePaper findUsedPaper(String moduleId) {
        return findFirst("SELECT * FROM BARCODE_PAPER BP WHERE BP.MODULEID=? AND BP.USED=1",
                         moduleId);
    }

}
