package com.kc.module.report;

import java.io.IOException;

import org.apache.poi.hssf.usermodel.HSSFWorkbook;

import com.alibaba.druid.util.StringUtils;
import com.jfinal.core.Controller;
import com.kc.module.utils.ControlUtils;
import com.kc.module.utils.DateUtils;

public abstract class Report {

    private HSSFWorkbook workBook;
    private String fileName;

    public HSSFWorkbook getWorkBook() {
        return workBook;
    }

    public void setWorkBook(HSSFWorkbook workBook) {
        this.workBook = workBook;
    }

    protected Controller controller;

    public Report(Controller controller) throws IOException {
        this.controller = controller;
    }

    public void exportExcel() {
        exportReport();
        ControlUtils.exportFile(workBook, controller.getResponse(), getFileName());
        controller.renderNull();
    }

    public void setFileName(String name) {
        this.fileName = name;
    }

    /**
     * 
     * @return
     */
    private String getFileName() {
        return StringUtils.isEmpty(this.fileName) ? DateUtils.getDateNow("yyMMddHHmmssSSS") : this.fileName;
    }

    public abstract void exportReport();

}
