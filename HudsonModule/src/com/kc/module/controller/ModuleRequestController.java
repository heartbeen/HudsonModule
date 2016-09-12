package com.kc.module.controller;

import java.util.List;

import com.jfinal.core.Controller;
import com.jfinal.kit.JsonKit;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.model.Factory;
import com.kc.module.model.MachineWorktype;
import com.kc.module.model.ModuleMachine;
import com.kc.module.model.PositionInfo;
import com.kc.module.utils.ModelUtils;

/**
 * 模具模块请求数据控制器类
 * 
 * @author xuwei
 * 
 */
public class ModuleRequestController extends Controller {

    /**
     * 得到待安排加工的模具工号
     */
    public void arrangeModule() {

    }

    /**
     * 返回模具加工进度<br>
     * 'customer', 'moduleclass', 'modulecode', 'starttime',<br>
     * 'trytime', 'factprocess', 'planprocess'
     */
    public void moduleProcess() {
        renderText("Asdf");
    }

    /**
     * 获取厂名
     */
    public void getFactoryName() {

        List<Record> factoryList = Factory.dao.factoryName();

        renderText("{factorys:" + JsonKit.toJson(factoryList, 2).toLowerCase() + "}");
    }

    /**
     * 获取单位
     */
    public void getPositionName() {

        List<Record> positionList = PositionInfo.dao.positionName();

        renderText("{postionNames:" + JsonKit.toJson(positionList, 2).toLowerCase() + "}");
    }

    /**
     * 获取加工分类名称
     */
    public void getMachineWorkTypeName() {

        List<Record> machineWorkTypeList = MachineWorktype.dao.machineWorkTypeName();

        renderText("{workTypes:" + JsonKit.toJson(machineWorkTypeList, 2).toLowerCase() + "}");
    }

    /**
     * 获取工艺名称
     */
    public void getMachineList() {

        List<Record> machineList = ModuleMachine.dao.machineData();

        renderText("{auth:" + JsonKit.toJson(machineList, 2).toLowerCase() + "}");
    }

    public void initAddModuleCode() {
        List<Factory> fact = Factory.dao.getInnerFactory(getPara(0));
        renderText(ModelUtils.getModelJsonList(fact));
    }
}
