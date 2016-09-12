package com.kc.module.model;

public class OrderRelation extends ModelFinal<OrderRelation> {

    /**
     * 
     */
    private static final long serialVersionUID = 6750487368414698514L;

    /** 产生ID的序列名 */
    private final String ID_SEQ = "MD_ORDER_RELATION_SEQ";

    public String idSeq() {
        return this.ID_SEQ;
    }

    /**
     * 自动产生ID
     */
    @Override
    public boolean save() {
        set("id", ID_SEQ + ".nextval");

        return super.save();
    }
}
