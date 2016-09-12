package com.kc.module.controller;

import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.Db;
import com.kc.module.transaction.AddDesignScheduleIAtom;
import com.kc.module.transaction.AddDeviseCraftSetIAtom;
import com.kc.module.transaction.AlertScheduleOrderIAtom;
import com.kc.module.transaction.CompleteDeviseResumeIAtom;
import com.kc.module.transaction.DeleteDeviseCraftSetIAtom;
import com.kc.module.transaction.DeleteDeviseProductIAtom;
import com.kc.module.transaction.DeleteDeviseResumeIAtom;
import com.kc.module.transaction.DeleteScheduleInfoIAtom;
import com.kc.module.transaction.ExportDeviseCraftSetIAtom;
import com.kc.module.transaction.ManageCraftInfoIAtom;
import com.kc.module.transaction.ManageDesignResumeIAtom;
import com.kc.module.transaction.ManageDeviseModuleIAtom;
import com.kc.module.transaction.ManageModuleProductIAtom;
import com.kc.module.transaction.SaveDeviseModulePlanIAtom;
import com.kc.module.transaction.ScrapCraftInfoIAtom;
import com.kc.module.transaction.SendDesignImageIAtom;
import com.kc.module.transaction.UpdateScheduleInfoIAtom;
import com.kc.module.transaction.UploadProductImageIAtom;

public class DeviseController extends Controller {
    /**
     * 保存模具信息
     */
    public void saveDeviseModuleInfo() {
        ManageDeviseModuleIAtom mdmi = new ManageDeviseModuleIAtom();
        mdmi.setController(this);

        boolean success = Db.tx(mdmi);

        setAttr("success", success);
        setAttr("msg", mdmi.getMsg());

        renderJson();
    }

    /**
     * 保存金型日程
     */
    public void saveDeviseModulePlanInfo() {
        SaveDeviseModulePlanIAtom sdmpi = new SaveDeviseModulePlanIAtom();
        sdmpi.setController(this);

        boolean result = Db.tx(sdmpi);

        setAttr("success", result);
        setAttr("msg", sdmpi.getMsg());

        renderJson();
    }

    /**
     * 处理模具产品的相关讯息(包括新增、更新产品信息)
     */
    public void manageModuleProductInfo() {
        ManageModuleProductIAtom mmpi = new ManageModuleProductIAtom();
        mmpi.setController(this);

        boolean success = Db.tx(mmpi);

        setAttr("success", success);
        setAttr("msg", mmpi.getMsg());

        renderJson();
    }

    /**
     * 管理制程信息
     */
    public void manageCraftInfo() {
        ManageCraftInfoIAtom mcii = new ManageCraftInfoIAtom();
        mcii.setController(this);

        boolean success = Db.tx(mcii);

        setAttr("success", success);
        setAttr("msg", mcii.getMsg());

        renderJson();
    }

    /**
     * 报废制程
     */
    public void scrapCraftInfo() {
        ScrapCraftInfoIAtom scii = new ScrapCraftInfoIAtom();
        scii.setController(this);

        boolean success = Db.tx(scii);

        setAttr("success", success);
        setAttr("msg", scii.getMsg());

        renderJson();
    }

    /**
     * 新增计划制程
     */
    public void addDesignScheduleInfo() {
        AddDesignScheduleIAtom adsi = new AddDesignScheduleIAtom();
        adsi.setController(this);

        boolean success = Db.tx(adsi);

        setAttr("success", success);
        setAttr("msg", adsi.getMsg());

        renderJson();
    }

    /**
     * 加载图片信息
     */
    public void uploadProductImage() {
        UploadProductImageIAtom upii = new UploadProductImageIAtom();
        upii.setController(this);

        upii.setFilter(new String[]{".bmp", ".jpg", ".png"});

        boolean success = Db.tx(upii);

        setAttr("success", success);
        setAttr("msg", upii.getMsg());
        setAttr("imageurl", upii.getImageUrl());

        renderJson();
    }

    /**
     * 更新制程计划信息
     */
    public void updateDesignScheduleInfo() {
        UpdateScheduleInfoIAtom usii = new UpdateScheduleInfoIAtom();
        usii.setController(this);

        boolean success = Db.tx(usii);

        setAttr("success", success);
        setAttr("msg", usii.getMsg());

        renderJson();
    }

    /**
     * 调整制程计划的顺序
     */
    public void alertScheduleInfoOrder() {
        AlertScheduleOrderIAtom asoi = new AlertScheduleOrderIAtom();
        asoi.setController(this);

        boolean success = Db.tx(asoi);

        setAttr("success", success);
        setAttr("msg", asoi.getMsg());

        renderJson();
    }

    /**
     * 删除制程计划
     */
    public void deleteScheduleInfo() {
        DeleteScheduleInfoIAtom dsii = new DeleteScheduleInfoIAtom();
        dsii.setController(this);

        boolean success = Db.tx(dsii);

        setAttr("success", success);
        setAttr("msg", dsii.getMsg());

        renderJson();
    }

    /**
     * 管理模具计划履历
     */
    public void manageDesignResume() {
        ManageDesignResumeIAtom mdri = new ManageDesignResumeIAtom();
        mdri.setController(this);

        boolean success = Db.tx(mdri);

        setAttr("success", success);
        setAttr("msg", mdri.getMsg());

        renderJson();
    }

    /**
     * 新增制程安排
     */
    public void addDeviseCraftSet() {
        AddDeviseCraftSetIAtom acsi = new AddDeviseCraftSetIAtom();
        acsi.setController(this);

        boolean success = Db.tx(acsi);

        setAttr("success", success);
        setAttr("msg", acsi.getMsg());

        renderJson();
    }

    /**
     * 导入制程集合信息
     */
    public void exportDeviseCraftSet() {
        ExportDeviseCraftSetIAtom edcsi = new ExportDeviseCraftSetIAtom();
        edcsi.setController(this);

        boolean success = Db.tx(edcsi);

        setAttr("success", success);
        setAttr("msg", edcsi.getMsg());

        renderJson();
    }

    /**
     * 删除设计制程集合
     */
    public void deleteDeviseCraftSet() {
        DeleteDeviseCraftSetIAtom ddcsi = new DeleteDeviseCraftSetIAtom();
        ddcsi.setController(this);

        boolean success = Db.tx(ddcsi);

        setAttr("success", success);
        setAttr("msg", ddcsi.getMsg());

        renderJson();
    }

    /**
     * 删除设计履历信息
     */
    public void deleteDeviseResume() {
        DeleteDeviseResumeIAtom ddri = new DeleteDeviseResumeIAtom();
        ddri.setController(this);

        boolean success = Db.tx(ddri);

        setAttr("success", success);
        setAttr("msg", ddri.getMsg());

        renderJson();
    }

    /**
     * 设计履历完成或者结案
     */
    public void completeDeviseResume() {
        CompleteDeviseResumeIAtom cdri = new CompleteDeviseResumeIAtom();
        cdri.setController(this);

        boolean success = Db.tx(cdri);

        setAttr("success", success);
        setAttr("msg", cdri.getMsg());

        renderJson();
    }

    /**
     * 删除模具产品信息
     */
    public void deleteModuleProductInfo() {
        DeleteDeviseProductIAtom ddpi = new DeleteDeviseProductIAtom();
        ddpi.setController(this);

        boolean success = Db.tx(ddpi);

        setAttr("success", success);
        setAttr("msg", ddpi.getMsg());

        renderJson();
    }

    /**
     * 发送设计图纸给
     */
    public void sendDesignImage() {
        SendDesignImageIAtom sii = new SendDesignImageIAtom();
        sii.setController(this);

        boolean success = Db.tx(sii);

        setAttr("success", success);
        setAttr("msg", sii.getMsg());

        renderJson();
    }
}
