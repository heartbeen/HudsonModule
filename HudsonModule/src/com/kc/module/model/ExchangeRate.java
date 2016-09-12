package com.kc.module.model;

import java.util.List;

public class ExchangeRate extends ModelFinal<ExchangeRate> {

    /**
     * 
     */
    private static final long serialVersionUID = 1L;
    public static ExchangeRate dao = new ExchangeRate();

    public List<ExchangeRate> getExchangeRate() {
        StringBuilder builder = new StringBuilder();

        builder.append("SELECT ID AS MID,SHORT,CNAMES,RATE,ISHOME ");
        builder.append(" FROM EXCHANGE_RATE");

        return this.find(builder.toString());
    }
}
