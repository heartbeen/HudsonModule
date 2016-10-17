package com.kc.module.report;

import java.io.IOException;
import java.util.List;
import java.util.Properties;

import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;

import com.jfinal.core.Controller;
import com.jfinal.kit.JsonKit;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.utils.DBUtils;
import com.kc.module.utils.DataUtils;
import com.kc.module.utils.JsonUtils;

public class ExportModuleReport extends Report {

    public ExportModuleReport(Controller controller) throws IOException {
        super(controller);
        // TODO Auto-generated constructor stub
    }

    @Override
    public void exportReport() {
        try {
            // 模具唯一号
            String modulebarcode = this.controller.getPara("modulebarcode");
            // 零件唯一号
            String partlist = this.controller.getPara("partlist");
            // 部件唯一号
            String unitlist = this.controller.getPara("unitlist");
            // 要转移到的公司代号
            String to = this.controller.getPara("to");

            // 获取配置文件信息
            Properties proper = DataUtils.getProperties("config.properties");
            // 本公司唯一代号
            String factorycode = proper.getProperty("factorycode");
            // 预计要导入的公司信息
            String todata = proper.getProperty(to);
            String[] toinfo = todata.split("#", -1);

            StringBuilder builder = new StringBuilder();

            builder.append("SELECT ML.*, MR.ID AS MRID, MR.RESUMESTATE, MR.STARTTIME AS STARTDATE, MR.ENDTIME AS ENDDATE ");
            builder.append(" FROM MODULELIST ML LEFT JOIN MD_RESUME MR ON ML.MODULEBARCODE = MR.MODULEBARCODE WHERE ML.MODULEBARCODE = ?");

            Record record = Db.findFirst(builder.toString(), modulebarcode);
            // 如果模具信息不存在则返回
            if (record == null) {
                return;
            }

            // 模具的基本相关信息
            String modulecode = record.getStr("MODULECODE");
            String mrid = record.getStr("MRID");

            this.setFileName(modulecode);

            record.set("local", factorycode);
            record.set("tokey", toinfo[0]);
            record.set("tocode", toinfo[1]);

            HSSFWorkbook book = new HSSFWorkbook();

            // MODULELIST
            HSSFSheet ml_sheet = book.createSheet("ml");
            HSSFRow ml_row = ml_sheet.createRow(0);
            HSSFCell ml_cell = ml_row.createCell(0);
            ml_cell.setCellValue(JsonKit.toJson(record));

            List<String> parts = JsonUtils.parseJsArrayList(partlist);
            List<String> units = JsonUtils.parseJsArrayList(unitlist);

            // MD_PART
            HSSFSheet mp_sheet = book.createSheet("mp");
            List<Record> mp_list = Db.find("SELECT * FROM MD_PART WHERE PARTBARCODE IN " + DBUtils.sqlIn(units));
            if (mp_list.size() > 0) {
                for (int m = 0; m < mp_list.size(); m++) {
                    HSSFRow mp_row = mp_sheet.createRow(m);
                    HSSFCell mp_cell = mp_row.createCell(0);

                    mp_cell.setCellValue(JsonKit.toJson(mp_list.get(m)));
                }
            }

            // MD_PART_LIST
            HSSFSheet mpl_sheet = book.createSheet("mpl");
            List<Record> mpl_list = Db.find("SELECT * FROM MD_PART_LIST WHERE PARTBARLISTCODE IN " + DBUtils.sqlIn(parts));
            if (mpl_list.size() > 0) {
                for (int m = 0; m < mpl_list.size(); m++) {
                    HSSFRow mpl_row = mpl_sheet.createRow(m);
                    HSSFCell mpl_cell = mpl_row.createCell(0);

                    mpl_cell.setCellValue(JsonKit.toJson(mpl_list.get(m)));
                }
            }

            List<String> merges = DataUtils.mergeList(units, parts);

            // MD_EST_SCHEDULE
            HSSFSheet msi_sheet = book.createSheet("mes");
            List<Record> msi_list = Db.find("SELECT * FROM MD_EST_SCHEDULE WHERE MODULERESUMEID = ? AND PARTID IN "
                                            + DBUtils.sqlIn(merges)
                                            + " AND TYPEID IS NULL", mrid);
            if (msi_list.size() > 0) {
                for (int m = 0; m < msi_list.size(); m++) {
                    HSSFRow msi_row = msi_sheet.createRow(m);
                    HSSFCell msi_cell = msi_row.createCell(0);

                    msi_cell.setCellValue(JsonKit.toJson(msi_list.get(m)));
                }
            }

            // MD_PROCESS_INFO
            HSSFSheet mpi_sheet = book.createSheet("mpi");
            List<Record> mpi_list = Db.find("SELECT * FROM MD_PROCESS_INFO WHERE MODULERESUMEID = ? AND PARTBARLISTCODE IN "
                                            + DBUtils.sqlIn(parts)
                                            + " AND ISMAJOR = ?", mrid, 1);
            if (mpi_list.size() > 0) {
                for (int m = 0; m < mpi_list.size(); m++) {
                    HSSFRow mpi_row = mpi_sheet.createRow(m);
                    HSSFCell mpi_cell = mpi_row.createCell(0);

                    mpi_cell.setCellValue(JsonKit.toJson(mpi_list.get(m)));
                }
            }

            this.setWorkBook(book);
        }
        catch (Exception e) {
            e.printStackTrace();
            return;
        }
    }

}
