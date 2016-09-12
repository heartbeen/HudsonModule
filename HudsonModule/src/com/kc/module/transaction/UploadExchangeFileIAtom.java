package com.kc.module.transaction;

import java.io.File;
import java.io.FileInputStream;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.HashMap;
import java.util.Properties;

import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.jfinal.upload.UploadFile;
import com.kc.module.base.Barcode;
import com.kc.module.base.RegularState;
import com.kc.module.dao.BaseIAtom;
import com.kc.module.utils.ArithUtils;
import com.kc.module.utils.ControlUtils;
import com.kc.module.utils.DataUtils;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.JsonUtils;
import com.kc.module.utils.StringUtils;

/**
 * 上传交换的模具文件并将其中的信息提取保存
 * 
 * @author xzf
 * 
 */
public class UploadExchangeFileIAtom extends BaseIAtom {

    private String[] filter;

    public void setFilter(String[] fl) {
        this.filter = fl;
    }

    @Override
    public boolean run() throws SQLException {
        try {
            UploadFile upfile = this.getController().getFile();
            if (upfile == null || upfile.getFile() == null) {
                this.setMsg("没有上传模具文件");
                return false;
            }

            File usfile = upfile.getFile();
            // 获取文件名称
            String filename = usfile.getName();
            if (!isValidate(filename)) {
                this.setMsg("上传文件不是有效文件");
                return false;
            }

            String creator = ControlUtils.getEmpBarCode(this.getController());
            String posid = ControlUtils.getDeptRegionPosid(this.getController());

            Record record = null;
            boolean result = false;
            HSSFWorkbook book = new HSSFWorkbook(new FileInputStream(usfile));

            // 获取配置文件信息
            Properties proper = DataUtils.getProperties("config.properties");
            // 本公司唯一代号
            String factorycode = proper.getProperty("factorycode");

            // MODULELIST
            HSSFSheet ml_sheet = book.getSheet("ml");
            HSSFRow ml_row = ml_sheet.getRow(0);
            String moduleJson = ml_row.getCell(0).getStringCellValue();
            HashMap<?, ?> modulehash = (HashMap<?, ?>) JsonUtils.fromJsonToMap(moduleJson);

            String tokey = StringUtils.parseString(modulehash.get("tokey"));
            String tocode = StringUtils.parseString(modulehash.get("tocode"));

            if (!factorycode.equals(tokey)) {
                this.setMsg("导入资料不匹配");
                book.close();
                return false;
            }

            String modulebarcode = StringUtils.parseString(modulehash.get("modulebarcode"));
            // 加工状态
            String resumestate = StringUtils.parseString(modulehash.get("resumestate"));
            // 导入文件的模具履历ID
            String mrid = StringUtils.parseString(modulehash.get("mrid"));

            StringBuilder builder = new StringBuilder();

            builder.append("SELECT ML.*,(SELECT ID FROM MD_RESUME WHERE MODULEBARCODE = ");
            builder.append("ML.MODULEBARCODE) AS RID FROM MODULELIST ML WHERE MODULEBARCODE = ?");

            Record mlRecord = Db.findFirst(builder.toString(), modulebarcode);

            Timestamp starttime = parseStamp(StringUtils.parseString(modulehash.get("startdate")));
            Timestamp endtime = parseStamp(StringUtils.parseString(modulehash.get("enddate")));

            Timestamp nowtime = DateUtils.getNowStampTime();

            // 模具履历ID
            String rid = null;

            // 如果查询出来模具唯一号为空则新增模具资料
            if (mlRecord == null) {
                record = new Record();

                record.set("MODULECODE", StringUtils.parseString(modulehash.get("modulecode")))
                      .set("POSID", posid)
                      .set("GUESTID", tocode)
                      .set("MODULECLASS", StringUtils.parseString(modulehash.get("moduleclass")))
                      .set("INITTRYTIME", endtime)
                      .set("CREATETIME", nowtime)
                      .set("CREATOR", creator)
                      .set("MODULESTATE", "0")
                      .set("TAKEON", StringUtils.parseString(modulehash.get("takeon")))
                      .set("STARTTIME", starttime)
                      .set("PICTUREURL", StringUtils.parseString(modulehash.get("pictureurl")))
                      .set("PRODUCTNAME", StringUtils.parseString(modulehash.get("productname")))
                      .set("MODULEINTRO", StringUtils.parseString(modulehash.get("moduleintro")))
                      .set("GUESTCODE", StringUtils.parseString(modulehash.get("guestcode")))
                      .set("WORKPRESSURE", StringUtils.parseString(modulehash.get("workpressure")))
                      .set("UNITEXTRAC", StringUtils.parseString(modulehash.get("unitextrac")))
                      .set("OPERATEFLAG", StringUtils.parseString(modulehash.get("operateflag")))
                      .set("MODULEBARCODE", StringUtils.parseString(modulehash.get("modulebarcode")))
                      .set("PLASTIC", StringUtils.parseString(modulehash.get("plastic")))
                      .set("COMBINE", StringUtils.parseString(modulehash.get("combine")));

                result = Db.save("MODULELIST", "MODULEBARCODE", record);
                if (!result) {
                    this.setMsg("导入资料失败");
                    book.close();
                    return false;
                }
            } else {
                rid = StringUtils.parseString(mlRecord.getStr("RID"));
            }

            String mrsid = null;

            if (!StringUtils.isEmpty(mrid) && StringUtils.isEmpty(rid)) {

                // 创建新的RESUMEID
                rid = Barcode.MODULE_RESUME.nextVal();

                record = new Record();
                record.set("ID", rid)
                      .set("RESUMESTATE", resumestate)
                      .set("RESUMEEMPID", creator)
                      .set("STARTTIME", starttime)
                      .set("ENDTIME", endtime)
                      .set("MODULEBARCODE", modulebarcode);

                result = Db.save("MD_RESUME", record);
                if (!result) {
                    this.setMsg("导入资料失败");
                    book.close();
                    return false;
                }

                record.set("RESUMETIME", nowtime);

                result = Db.save("MD_RESUME_RECORD", record);
                if (!result) {
                    this.setMsg("导入资料失败");
                    book.close();
                    return false;
                }

                if (!StringUtils.isEmpty(resumestate) && !RegularState.MODULE_RESUME_NEW.getIndex().equals(resumestate)) {
                    mrsid = Barcode.MD_RESUME_SECTION.nextVal();

                    record = new Record();
                    record.set("ID", mrsid).set("RESUMEID", rid).set("STATEID", resumestate).set("STARTDATE", starttime).set("ENDDATE", endtime);

                    result = Db.save("MD_RESUME_SECTION", record);
                    if (!result) {
                        this.setMsg("导入资料失败");
                        book.close();
                        return false;
                    }
                }
            }

            Record mpRecord = null;
            HSSFSheet mp_sheet = book.getSheet("mp");
            int maxCount = mp_sheet.getPhysicalNumberOfRows();
            if (maxCount > 0) {
                for (int i = 0; i < maxCount; i++) {
                    HSSFRow mp_row = mp_sheet.getRow(i);
                    HSSFCell mp_cell = mp_row.getCell(0);

                    String mpJson = mp_cell.getStringCellValue();
                    if (StringUtils.isEmpty(mpJson)) {
                        continue;
                    }

                    HashMap<?, ?> mphash = (HashMap<?, ?>) JsonUtils.fromJsonToMap(mpJson);

                    String partbarcode = StringUtils.parseString(mphash.get("partbarcode"));
                    if (StringUtils.isEmpty(partbarcode)) {
                        continue;
                    }

                    mpRecord = Db.findFirst("SELECT * FROM MD_PART WHERE PARTBARCODE = ?", partbarcode);

                    if (mpRecord == null) {
                        record = new Record();

                        record.set("PARTBARCODE", partbarcode)
                              .set("MODULEBARCODE", modulebarcode)
                              .set("PARTCODE", StringUtils.parseString(mphash.get("partcode")))
                              .set("CNAMES", StringUtils.parseString(mphash.get("cnames")))
                              .set("ENAMES", StringUtils.parseString(mphash.get("enames")))
                              .set("RACEID", StringUtils.parseString(mphash.get("raceid")))
                              .set("NORMS", StringUtils.parseString(mphash.get("norms")))
                              .set("MATERIAL", StringUtils.parseString(mphash.get("material")))
                              .set("APPLIERID", StringUtils.parseString(mphash.get("applierid")))
                              .set("QUANTITY", ArithUtils.parseIntNumber(mphash.get("quantity"), 0))
                              .set("ISFIRMWARE", StringUtils.parseString(mphash.get("isfirmware")))
                              .set("ISBATCH", StringUtils.parseString(mphash.get("isbatch")))
                              .set("ISPROCESS", ArithUtils.parseIntNumber(mphash.get("isprocess"), 0))
                              .set("MEASURE", ArithUtils.parseIntNumber(mphash.get("measure"), 0))
                              .set("PARENTBARCODE", StringUtils.parseString(mphash.get("parentbarcode")))
                              .set("ISPARENT", ArithUtils.parseIntNumber(mphash.get("isparent"), 0));

                        result = Db.save("MD_PART", "PARTBARCODE", record);
                        if (!result) {
                            this.setMsg("导入资料失败");
                            book.close();
                            return false;
                        }
                    }
                }
            }

            HSSFSheet mpl_sheet = book.getSheet("mpl");
            Record mplRecord = null;
            int rowcount = mpl_sheet.getPhysicalNumberOfRows();
            if (rowcount > 0) {
                for (int i = 0; i < rowcount; i++) {
                    HSSFRow mpl_row = mpl_sheet.getRow(i);
                    HSSFCell mpl_cell = mpl_row.getCell(0);

                    String mplJson = mpl_cell.getStringCellValue();
                    if (StringUtils.isEmpty(mplJson)) {
                        continue;
                    }

                    HashMap<?, ?> mplhash = (HashMap<?, ?>) JsonUtils.fromJsonToMap(mplJson);

                    String partbarlistcode = StringUtils.parseString(mplhash.get("partbarlistcode"));
                    if (StringUtils.isEmpty(partbarlistcode)) {
                        continue;
                    }

                    // 查询零件信息
                    mplRecord = Db.findFirst("SELECT * FROM MD_PART_LIST WHERE PARTBARLISTCODE = ?", partbarlistcode);
                    if (mplRecord == null) {
                        record = new Record();

                        record.set("PARTBARLISTCODE", partbarlistcode)
                              .set("MODULEBARCODE", modulebarcode)
                              .set("PARTBARCODE", StringUtils.parseString(mplhash.get("partbarcode")))
                              .set("PARTLISTCODE", StringUtils.parseString(mplhash.get("partlistcode")))
                              .set("PARTROOTCODE", StringUtils.parseString(mplhash.get("partrootcode")))
                              .set("PARTLISTBATCH", StringUtils.parseString(mplhash.get("partlistbatch")))
                              .set("ISENABLE", StringUtils.parseString(mplhash.get("isenable")))
                              .set("MODULECODE", StringUtils.parseString(mplhash.get("modulecode")))
                              .set("ISSCHEDULE", StringUtils.parseString(mplhash.get("isschedule")))
                              .set("ISFIXED", ArithUtils.parseIntNumber(mplhash.get("isfixed"), 0))
                              .set("QUANTITY", ArithUtils.parseIntNumber(mplhash.get("quantity"), 1))

                              .set("PICCODE", StringUtils.parseString(mplhash.get("piccode")))
                              .set("HARDNESS", StringUtils.parseString(mplhash.get("hardness")))
                              .set("BUFFING", StringUtils.parseString(mplhash.get("buffing")))
                              .set("MATERIALSRC", StringUtils.parseString(mplhash.get("materialsrc")))
                              .set("MATERIALTYPE", StringUtils.parseString(mplhash.get("materialtype")))
                              .set("TOLERANCE", StringUtils.parseString(mplhash.get("tolerance")))
                              .set("REFORM", ArithUtils.parseIntNumber(mplhash.get("reform"), 0))
                              .set("REMARK", ArithUtils.parseIntNumber(mplhash.get("remark"), 0))
                              .set("ISDIVIED", ArithUtils.parseIntNumber(mplhash.get("isdivied"), 0));

                        result = Db.save("MD_PART_LIST", "PARTBARLISTCODE", record);
                        if (!result) {
                            this.setMsg("导入资料失败");
                            book.close();
                            return false;
                        }
                    }
                }
            }

            if (!StringUtils.isEmpty(rid)) {
                HSSFSheet mes_sheet = book.getSheet("mes");
                Record mesRecord = null;
                Barcode.MODULE_EST_SCHEDULE.nextVal(true);
                int mescount = mes_sheet.getPhysicalNumberOfRows();
                if (mescount > 0) {
                    for (int i = 0; i < mescount; i++) {
                        HSSFRow mes_row = mes_sheet.getRow(i);
                        HSSFCell mes_cell = mes_row.getCell(0);

                        String mesJson = mes_cell.getStringCellValue();
                        if (StringUtils.isEmpty(mesJson)) {
                            continue;
                        }

                        HashMap<?, ?> meshash = (HashMap<?, ?>) JsonUtils.fromJsonToMap(mesJson);

                        String partid = StringUtils.parseString(meshash.get("partid"));
                        String craftid = StringUtils.parseString(meshash.get("craftid"));

                        Timestamp e_start = DateUtils.parseTimeStamp(StringUtils.parseString(meshash.get("starttime")));
                        Timestamp e_end = DateUtils.parseTimeStamp(StringUtils.parseString(meshash.get("endtime")));

                        int ranknum = ArithUtils.parseIntNumber(meshash.get("ranknum"), 0);

                        if (StringUtils.isEmpty(partid) || StringUtils.isEmpty(craftid)) {
                            continue;
                        }

                        // 查询零件信息
                        mesRecord = Db.findFirst("SELECT * FROM MD_EST_SCHEDULE WHERE MODULERESUMEID = ? AND PARTID = ? AND CRAFTID = ? AND RANKNUM = ? AND TYPEID IS NULL",
                                                 rid,
                                                 partid,
                                                 craftid,
                                                 ranknum);
                        if (mesRecord == null) {

                            record = new Record();
                            record.set("ID", Barcode.MODULE_EST_SCHEDULE.nextVal())
                                  .set("PARTID", partid)
                                  .set("STARTTIME", e_start)
                                  .set("ENDTIME", e_end)
                                  .set("CRAFTID", craftid)
                                  .set("MODULERESUMEID", rid)
                                  .set("RANKNUM", ranknum)
                                  .set("DURATION", ArithUtils.parseIntNumber(meshash.get("duration"), 0))
                                  .set("PARENTID", StringUtils.parseString(meshash.get("parentid")))
                                  .set("EVALUATE", ArithUtils.parseIntNumber(meshash.get("evaluate"), 0))
                                  .set("ISFINISH", StringUtils.parseString(meshash.get("isfinish")))
                                  .set("ISUSED", StringUtils.parseString(meshash.get("isused")))
                                  .set("TYPEID", StringUtils.parseString(meshash.get("typeid")))
                                  .set("REMARK", StringUtils.parseString(meshash.get("remark")));

                            result = Db.save("MD_EST_SCHEDULE", record);
                            if (!result) {
                                this.setMsg("导入资料失败");
                                book.close();
                                return false;
                            }
                        }
                    }
                }

                HSSFSheet mpi_sheet = book.getSheet("mpi");
                Record mpiRecord = null;
                Barcode.MD_PROCESS_INFO.nextVal(true);
                int mpicount = mpi_sheet.getPhysicalNumberOfRows();
                if (mpicount > 0) {
                    for (int i = 0; i < mpicount; i++) {
                        HSSFRow mpi_row = mpi_sheet.getRow(i);
                        HSSFCell mpi_cell = mpi_row.getCell(0);

                        String mpiJson = mpi_cell.getStringCellValue();
                        if (StringUtils.isEmpty(mpiJson)) {
                            continue;
                        }

                        HashMap<?, ?> mpihash = (HashMap<?, ?>) JsonUtils.fromJsonToMap(mpiJson);

                        String mpi_part = StringUtils.parseString(mpihash.get("partbarlistcode"));
                        if (StringUtils.isEmpty(mpi_part)) {
                            continue;
                        }

                        // 查询零件信息
                        mpiRecord = Db.findFirst("SELECT * FROM MD_PROCESS_INFO WHERE PARTBARLISTCODE = ?", mpi_part);
                        if (mpiRecord == null) {

                            record = new Record();
                            record.set("ID", Barcode.MD_PROCESS_INFO.nextVal())
                                  .set("PARTBARLISTCODE", mpi_part)
                                  .set("MODULERESUMEID", rid)
                                  .set("ACTIONTIME", nowtime)
                                  .set("ISFIXED", ArithUtils.parseIntNumber(mpihash.get("isfixed"), 0))
                                  .set("ISMAJOR", ArithUtils.parseIntNumber(mpihash.get("ismajor"), 1));

                            result = Db.save("MD_PROCESS_INFO", record);
                            if (!result) {
                                this.setMsg("导入资料失败");
                                book.close();
                                return false;
                            }

                            // 如果履历段不为空则添加信息
                            if (!StringUtils.isEmpty(mrsid)) {
                                record = new Record();
                                record.set("ID", Barcode.MD_PART_SECTION.nextVal()).set("SECTIONID", mrsid).set("PARTBARLISTCODE", mpi_part);

                                result = Db.save("MD_PART_SECTION", record);
                                if (!result) {
                                    this.setMsg("导入资料失败");
                                    book.close();
                                    return false;
                                }
                            }
                        }
                    }
                }
            }

            book.close();

            this.setMsg("导入资料成功");
            return (true);
        }
        catch (Exception e) {
            e.printStackTrace();
            this.setMsg("请导入正确格式的文件");
            return false;
        }
    }

    /**
     * 将字符串转化为ORACLE格式的时间
     * 
     * @param date
     * @return
     */
    private Timestamp parseStamp(String date) {
        return DateUtils.parseTimeStamp(date);
    }

    /**
     * 判断文件格式是否为指定格式
     * 
     * @param filename
     * @return
     */
    private boolean isValidate(String filename) {
        if (filename == null) {
            return (false);
        }
        if (this.filter == null) {
            return (true);
        }

        for (String it : this.filter) {
            int idx = filename.lastIndexOf(".");
            String suffix = filename.substring(idx);
            if (suffix.equals(it)) {
                return (true);
            }
        }

        return (false);
    }

}
