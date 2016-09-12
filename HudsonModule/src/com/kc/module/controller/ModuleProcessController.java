package com.kc.module.controller;

import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.Date;
import java.util.List;

import com.jfinal.aop.Before;
import com.jfinal.core.Controller;
import com.jfinal.kit.StrKit;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.IAtom;
import com.kc.module.base.Barcode;
import com.kc.module.interceptor.ModuleProcessInterceptorStack;
import com.kc.module.model.ModelFinal;
import com.kc.module.model.ModuleList;
import com.kc.module.model.ModuleProcessInfo;
import com.kc.module.model.ModuleProcessResume;
import com.kc.module.model.ProcessResume;
import com.kc.module.model.form.SendAssemblePart;
import com.kc.module.model.form.SendAssemblePartList;
import com.kc.module.utils.ControlUtils;
import com.kc.module.utils.DataUtils;

/**
 * 模具工件加工控制器<br>
 * 请求路径为:/module/process macsh
 * 
 * @author xuwei
 * @date 2013-10-17
 * 
 */
@Before(ModuleProcessInterceptorStack.class)
public class ModuleProcessController extends Controller {

    /**
     * 加工单位所有工件的模具信息
     */
    public void groupModuleInfo() {
        // TODO 前台可以选择加工单位
        boolean flag = getParaToBoolean("flag");
        String posId = null;
        if (!flag) {
            posId = getPara("posId");
            posId = StrKit.isBlank(posId) ? ControlUtils.getDeptRegionPosid(this) : posId;
        }

        reponse(ModuleList.dao.findGroupModuleInfo(posId, getPara("moduleResumeId"), flag),
                "没有模具信息!");
    }

    /**
     * 查询相应模具所在单位的工件信息
     */
    public void groupPartListInfo() {
        String id = getPara("moduleResumeId");
        String posId = getPara("posId");
        posId = StrKit.isBlank(posId) ? ControlUtils.getDeptRegionPosid(this) : posId;
        List<ModuleProcessInfo> macPartList = ModuleProcessInfo.dao.moduleMacPartList(id, posId);
        reponse(macPartList, "没有工件信息！");
    }

    private void reponse(List<? extends ModelFinal<?>> list, String msg) {
        setAttr("success", list.size() > 0);
        setAttr("msg", getAttr("success") ? "" : msg);
        setAttr("info", list);

        renderJson();
    }

    /**
     * 得到要签收的模具工件
     */
    public void moduleSignPart() {
        String moduleBarcode = getPara("moduleBarcode");
        String resumeId = getPara("resumeId");
        String posId = ControlUtils.getDeptRegionPosid(this);

        List<ProcessResume> list = ProcessResume.dao.getProcessResumePart(posId,
                                                                          moduleBarcode,
                                                                          resumeId);

        setAttr("parts", list);
        renderJson();
    }

    /**
     * 加工将完成工件送到组立
     */
    public void sendPartToAssemble() {

        boolean succeed = Db.tx(new IAtom() {
            public boolean run() throws SQLException {
                SendAssemblePartList send = DataUtils.fromJsonStrToBean(getPara("sendParts"),
                                                                       SendAssemblePartList.class);
                List<SendAssemblePart> partList = send.getPartList();

                ModuleProcessInfo mpi;
                ModuleProcessResume mpr;
                ModuleProcessResume newmpr;

                Timestamp sendTime = new Timestamp(new Date().getTime());

                Barcode.MODULE_PROCESS_RESUME.nextVal(true);

                int count = 0;

                for (int i = 0; i < partList.size(); i++) {
                    mpi = ModuleProcessInfo.dao.findById(partList.get(i).getId());

                    if ("20201".equals(mpi.get("partstateid"))) {
                        continue;
                    }

                    mpr = ModuleProcessResume.dao.findById(mpi.get("cursorid"));
                    newmpr = new ModuleProcessResume();

                    if (mpr != null) {
                        mpr.set("npartstateid", "20208");
                        mpr.set("nempactid", "20303");
                        mpr.set("ndeptid", send.getAssembleId());
                        mpr.set("nrcdtime", sendTime);

                        if (!mpr.update()) {
                            continue;
                        }
                    }

                    newmpr.set("id", Barcode.MODULE_PROCESS_RESUME.nextVal());
                    newmpr.set("partbarlistcode", mpi.get("partbarlistcode"));
                    newmpr.set("lpartstateid", "20208");
                    newmpr.set("lempactid", "20303");
                    newmpr.set("ldeptid", send.getAssembleId());
                    newmpr.set("lrcdtime", sendTime);
                    newmpr.set("rsmid", mpi.get("moduleresumeid"));
                    newmpr.set("mid", mpi.get("id"));

                    mpi.set("partstateid", "20208");
                    mpi.set("currentdeptid", send.getAssembleId());
                    mpi.set("actiontime", sendTime);
                    mpi.set("cursorid", newmpr.get("id"));

                    if (!(mpi.update() && newmpr.save())) {
                        continue;
                    }

                    count++;

                }

                setAttr("msg", String.format("共%d个工件送组立成功!", count));
                return true;
            }
        });

        setAttr("success", succeed);
        renderJson();

    }
}
