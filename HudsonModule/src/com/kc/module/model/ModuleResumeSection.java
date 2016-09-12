package com.kc.module.model;

import java.util.List;

public class ModuleResumeSection extends ModelFinal<ModuleResumeSection> {

    /**
     * 
     */
    private static final long serialVersionUID = 1L;

    public static ModuleResumeSection dao = new ModuleResumeSection();

    /**
     * 获取模具加工的阶段进程ID号
     * 
     * @param secid
     * @return
     */
    public List<ModuleResumeSection> getModuleResumeSectionInfo(String secid) {
        StringBuilder builder = new StringBuilder();
        builder.append("SELECT MRS.ID AS MRSID, MPS.ID AS SECID, MPS.PARTBARLISTCODE, ");
        builder.append("MPL.PARTLISTCODE, MP.CNAMES AS PARTNAME , MPS.REMARK, 0 AS ISNEW ");
        builder.append("FROM MD_RESUME_SECTION MRS ");
        builder.append("LEFT JOIN MD_PART_SECTION MPS ON MRS.ID = MPS.SECTIONID ");
        builder.append("LEFT JOIN MD_PART_LIST MPL ON MPS.PARTBARLISTCODE = MPL.PARTBARLISTCODE ");
        builder.append("LEFT JOIN MD_PART MP ON MPL.PARTBARCODE = MP.PARTBARCODE ");
        builder.append("WHERE MRS.ID = ? AND MPL.ISENABLE = 0");

        return this.find(builder.toString(), secid);
    }

}
