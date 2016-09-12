package com.kc.module.exception;

/**
 * 没有选择要导入工件清单的模具异常
 * 
 * @author David
 * 
 */
public class NoSelectModuleException extends Exception {

    /**
     * 
     */
    private static final long serialVersionUID = 1L;

    public NoSelectModuleException() {
        super("没有选择要导入模具清单的模具!");
    }
}
