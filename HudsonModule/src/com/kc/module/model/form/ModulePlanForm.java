package com.kc.module.model.form;

import java.util.Date;

import com.kc.module.model.ModulePlanInfo;

public class ModulePlanForm extends FormBean<ModulePlanInfo> {

    public ModulePlanForm() {
        super(ModulePlanInfo.class);
    }

    @Override
    public boolean validator() {
        return false;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getModulebarcode() {
        return modulebarcode;
    }

    public void setModulebarcode(String modulebarcode) {
        this.modulebarcode = modulebarcode;
    }

    public Date getLanchdate() {
        return lanchdate;
    }

    public void setLanchdate(Date lanchdate) {
        this.lanchdate = lanchdate;
    }

    public Date getTodate() {
        return todate;
    }

    public void setTodate(Date todate) {
        this.todate = todate;
    }

    public Date getMakestart() {
        return makestart;
    }

    public void setMakestart(Date makestart) {
        this.makestart = makestart;
    }

    public Date getMakefinish() {
        return makefinish;
    }

    public void setMakefinish(Date makefinish) {
        this.makefinish = makefinish;
    }

    public Date getOnsite() {
        return onsite;
    }

    public void setOnsite(Date onsite) {
        this.onsite = onsite;
    }

    public Date getDataverify() {
        return dataverify;
    }

    public void setDataverify(Date dataverify) {
        this.dataverify = dataverify;
    }

    public Date getLastview() {
        return lastview;
    }

    public void setLastview(Date lastview) {
        this.lastview = lastview;
    }

    public Date getDesignstart() {
        return designstart;
    }

    public void setDesignstart(Date designstart) {
        this.designstart = designstart;
    }

    public Date getFlowchart() {
        return flowchart;
    }

    public void setFlowchart(Date flowchart) {
        this.flowchart = flowchart;
    }

    public Date getSplitgraph() {
        return splitgraph;
    }

    public void setSplitgraph(Date splitgraph) {
        this.splitgraph = splitgraph;
    }

    public Date getDetailflow() {
        return detailflow;
    }

    public void setDetailflow(Date detailflow) {
        this.detailflow = detailflow;
    }

    public Date getFullgraph() {
        return fullgraph;
    }

    public void setFullgraph(Date fullgraph) {
        this.fullgraph = fullgraph;
    }

    public Date getMakereview() {
        return makereview;
    }

    public void setMakereview(Date makereview) {
        this.makereview = makereview;
    }

    public Date getOrdersteel() {
        return ordersteel;
    }

    public void setOrdersteel(Date ordersteel) {
        this.ordersteel = ordersteel;
    }

    public Date getHotrunner() {
        return hotrunner;
    }

    public void setHotrunner(Date hotrunner) {
        this.hotrunner = hotrunner;
    }

    public Date getMoldbase() {
        return moldbase;
    }

    public void setMoldbase(Date moldbase) {
        this.moldbase = moldbase;
    }

    public Date getMasterkernel() {
        return masterkernel;
    }

    public void setMasterkernel(Date masterkernel) {
        this.masterkernel = masterkernel;
    }

    public Date getPartlist() {
        return partlist;
    }

    public void setPartlist(Date partlist) {
        this.partlist = partlist;
    }

    public Date getPartgraph() {
        return partgraph;
    }

    public void setPartgraph(Date partgraph) {
        this.partgraph = partgraph;
    }

    public Date getBasegraph() {
        return basegraph;
    }

    public void setBasegraph(Date basegraph) {
        this.basegraph = basegraph;
    }

    public int getCategory() {
        return category;
    }

    public void setCategory(int category) {
        this.category = category;
    }

    public int getKind() {
        return kind;
    }

    public void setKind(int kind) {
        this.kind = kind;
    }

    private String id;
    private String modulebarcode;
    private Date lanchdate;
    private Date todate;
    private Date makestart;
    private Date makefinish;
    private Date onsite;
    private Date dataverify;
    private Date lastview;
    private Date designstart;
    private Date flowchart;
    private Date splitgraph;
    private Date detailflow;
    private Date fullgraph;
    private Date makereview;
    private Date ordersteel;
    private Date hotrunner;
    private Date moldbase;
    private Date masterkernel;
    private Date partlist;
    private Date partgraph;
    private Date basegraph;
    private int category;
    private int kind;

}
