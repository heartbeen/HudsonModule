package com.kc.module.transaction;

public class AvoidOutBound extends SqlTranscation {
    public static AvoidOutBound iAtom = new AvoidOutBound();

    @Override
    public boolean run() {
        
        return (true);
    }

}
