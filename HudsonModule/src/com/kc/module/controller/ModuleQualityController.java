package com.kc.module.controller;

import java.io.File;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.Date;
import java.util.List;

import com.jfinal.aop.Before;
import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.IAtom;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.base.Barcode;
import com.kc.module.databean.ImageNature;
import com.kc.module.interceptor.AuthInterceptor;
import com.kc.module.interceptor.validator.ModuleQualityValidator;
import com.kc.module.model.Employee;
import com.kc.module.model.MeasureTools;
import com.kc.module.model.ModulePart;
import com.kc.module.model.ModuleThreeMeasure;
import com.kc.module.model.form.CropMeasureForm;
import com.kc.module.transaction.SaveMeasurePoints;
import com.kc.module.utils.ControlUtils;
import com.kc.module.utils.ImageUtils;

/**
 * 模具品质管理控制器
 * 
 * @author xuwei
 * @date 2013-10-17
 * 
 */
@Before(AuthInterceptor.class)
public class ModuleQualityController extends Controller {

    public void queryDepartmentStaff() {
        renderJson(Employee.dao.getEmployeeInfo(getPara("posid")));
    }

    public void getMeasureTools() {
        renderJson(MeasureTools.dao.getMeasureToolInfo());
    }

    /**
     * 裁剪测量图片
     */
    @Before(ModuleQualityValidator.class)
    public void cropMeasurePicture() {
        CropMeasureForm cmf = getModel(CropMeasureForm.class, "cmf");

        setAttr("success", true);
        setAttr("crop", cmf.getImgType() + ',' + ImageUtils.getCropImage(cmf));

        renderJson();
    }

    public void AddMeasureTools() {
        renderJson("result",
                   MeasureTools.dao.AddMeasureTools(getPara("toolid"), getPara("toolname")));
    }

    public void saveMeasurePoints() {
        SaveMeasurePoints.iAtom.setController(this);
        SaveMeasurePoints.iAtom.setAjaxAttr(new String[]{"modulecode",
                                                         "partcode",
                                                         "graphno",
                                                         "deptid",
                                                         "empid",
                                                         "craftid",
                                                         "makedate",
                                                         "mdata"});

        boolean rs = SaveMeasurePoints.iAtom.runTx(SaveMeasurePoints.iAtom);
        renderJson("result", rs);
    }

    /**
     * 保存模具三次测量图片
     */
    public void saveMeasurePicture() {
        final Controller c = this;

        boolean success = Db.tx(new IAtom() {
            public boolean run() throws SQLException {
                ModuleThreeMeasure mtm = getModel(ModuleThreeMeasure.class, "mtm");
                String gc = getPara("guestcode");
                String picData = getPara("picturedata");
                String moduleCode = getPara("modulecode");
                String partcode = getPara("partcode");

                String picturePath = "";

                mtm.set("id", Barcode.MD_THREE_MEASURE.nextVal());

                // 生成保存图片路径 C62\C62-2323T4\100.14200001.png
                picturePath = gc.concat(File.separator)
                                .concat(moduleCode)
                                .concat(File.separator)
                                .concat(partcode)
                                .concat("-")
                                .concat(mtm.getStr("id"))
                                .concat(".png");

                mtm.set("PICTUREPATH", picturePath);
                mtm.set("measuretime", new Timestamp(new Date().getTime()));
                mtm.set("empid", ControlUtils.getAccountId(c));

                // 生成保存图片绝对路径
                picturePath = ControlUtils.getModuleMeasureRealPath(c)
                                         .concat(File.separator)
                                         .concat(picturePath);

                boolean success = ImageUtils.imageSaveToDisk(picData.split(",")[1], picturePath);

                if (success) {
                    success = mtm.save();
                    if (!success) {
                        // 如果数据库没有保存成功时,就将图片删除
                        File file = new File(picturePath);
                        file.delete();
                    } else {

                        setAttr("empname", ControlUtils.getAccountName(c));
                        setAttr("measuretime", mtm.get("measuretime"));
                        setAttr("id", mtm.get("id"));
                    }
                }
                return success;
            }
        });

        setAttr("success", success);
        setAttr("msg", success ? "测量图片上传成功!" : "测量图片上传失败!");

        renderJson();
    }

    /**
     * 查询三次元测量图片
     */
    @Before(ModuleQualityValidator.class)
    public void queryPartThreeMeasure() {

        List<Record> list = ModuleThreeMeasure.dao.findPartOfMeasure(getPara("partBarcode"),
                                                                     getPara("measureDate"));

        String picPath = ControlUtils.getModuleMeasureRealPath(this).concat(File.separator);

        ImageNature in;
        for (Record r : list) {

            in = ImageUtils.getImageNature(picPath.concat(r.getStr("PICTUREPATH")));

            r.set("imagestring", in.getImageString());
            r.set("width", in.getWidth());
            r.set("height", in.getHeight());

            r.remove("PICTUREPATH");
        }

        renderJson(list);

    }

    /**
     * 删除测量图片
     */
    @Before(ModuleQualityValidator.class)
    public void deleteMeasurePicture() {
        final Controller c = this;
        boolean success = Db.tx(new IAtom() {
            public boolean run() throws SQLException {
                ModuleThreeMeasure mtm = ModuleThreeMeasure.dao.findById(getPara("id"));

                File file = new File(ControlUtils.getModuleMeasureRealPath(c)
                                                .concat(File.separator)
                                                .concat(mtm.getStr("PICTUREPATH")));

                return mtm.delete() && file.delete();

            }
        });

        setAttr("success", success);
        setAttr("msg", success ? "测量图片删除成功!" : "测量图片删除失败!");

        renderJson();
    }

    /**
     * 增加要测量的工件
     */
    public void addMeasurePart() {
        boolean success = Db.tx(new IAtom() {
            public boolean run() throws SQLException {
                return Db.update("UPDATE ".concat(ModulePart.dao.tableName())
                                          .concat(" SET MEASURE=1 WHERE PARTBARCODE IN (")
                                          .concat(getPara("parts"))
                                          .concat(")")) > 0;

            }
        });
        setAttr("success", success);
        setAttr("msg", success ? "测量工件增加成功!" : "测量工件增加失败!");

        renderJson();
    }
}
