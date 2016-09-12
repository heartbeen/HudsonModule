package com.kc.module.transaction;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.IAtom;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.base.Barcode;
import com.kc.module.model.form.GenerateMoudleForm;
import com.kc.module.utils.ArithUtils;
import com.kc.module.utils.ControlUtils;
import com.kc.module.utils.DBUtils;
import com.kc.module.utils.StringUtils;

public class CreateModuleIAtom implements IAtom {
    // 控制器
    private Controller controller;
    // 模具工号单位
    private int unit;
    // 返回的结果内容
    private String backStr;
    // 返回的数据清单
    private List<Record> rlist = new ArrayList<Record>();
    // 保存结果
    private int rst;
    // 获取模具工号的最大值
    private int topCount;

    public int getUnit() {
        return unit;
    }

    public void setUnit(int unit) {
        this.unit = unit;
    }

    public int getTopCount() {
        return topCount;
    }

    public void setTopCount(int topCount) {
        this.topCount = topCount;
    }

    public int getRst() {
        return rst;
    }

    public void setRst(int rst) {
        this.rst = rst;
    }

    public String getBackStr() {
        return backStr;
    }

    public void setBackStr(String backStr) {
        this.backStr = backStr;
    }

    public List<Record> getRlist() {
        return rlist;
    }

    public void setRlist(List<Record> rlist) {
        this.rlist = rlist;
    }

    public Controller getController() {
        return controller;
    }

    public void setController(Controller controller) {
        this.controller = controller;
    }

    @Override
    public boolean run() throws SQLException {
        // 将前台的资料解析并入后台的Form当中
        GenerateMoudleForm gmf = controller.getModel(GenerateMoudleForm.class, "gmf");
        // 设置模具工号的位数
        this.setUnit(gmf.getModuleUnit());
        // 判断前台传来的模具工号是否合法
        String moduleSplit = gmf.getModuleFrom();
        if (!StringUtils.isRegex(getRegex(), moduleSplit)) {
            this.setRst(-1);
            return (false);
        }

        // 为返回的模具讯息作一个初始化
        this.backStr = "";

        // TODO 得到厂别的代码,如谷崧四厂为4,有可能会变
        /** 锴诚模具中不含厂区代号,所以此处将其本行代码舍弃 --Rock150313-- */
        // String factory = ControlUtil.getStepId(controller).substring(0, 2);
        List<String> allModules = getModuleCodeList(gmf.getFactoryGuest(), gmf.getProcessType(), gmf.getOrderMonth(), parseModuleCode(moduleSplit));
        // 如果解析的模具工号为空,则返回
        if (allModules.size() == 0) {
            this.setRst(-2);
            return (false);
        }
        // 如果解析的模具工号大于设定的最大的模具生成数量,则返回
        if (allModules.size() > this.topCount) {
            this.setRst(-3);
            return (false);
        }

        // 先查询数据库中是否存在未报废的模具的记录
        List<Record> q_list = Db.find("SELECT * FROM MODULELIST WHERE MODULESTATE = ? AND MODULECODE IN "
                                      + DBUtils.sqlIn(allModules)
                                      + "ORDER BY MODULECODE", "0");

        // 将服务器读取的模具工号于生成的模具工号进行比对,如果服务器已经存在,则将生成的模具集合中对应的模具工号讯息清除掉
        for (Record r : q_list) {
            String b_mcode = r.getStr("MODULECODE");
            if (StringUtils.isEmpty(b_mcode)) {
                continue;
            }

            if (allModules.contains(b_mcode)) {
                this.backStr += (b_mcode + ";");
                // 如果已经存在了该模具的讯息,则将其从模具集合中移除掉
                allModules.remove(b_mcode);
            }
        }

        Record record = null;

        // 获取厂区的BARCODE
        String posid = ControlUtils.getFactoryPosid(controller);
        // 获取创建人讯息
        String creator = ControlUtils.getAccountWorkNumber(controller);
        // 获取创建人名字
        String creatorname = ControlUtils.getAccountName(controller);

        for (String moldno : allModules) {
            record = new Record();

            record.set("posid", posid).set("modulecode", moldno.toString());
            record.set("modulebarcode", Barcode.MODULE.nextVal());
            record.set("guestname", gmf.getGuestName()).set("guestid", gmf.getGuestId());
            record.set("creator", creator);
            record.set("creatorname", creatorname);
            record.set("modulestate", "0");
            record.set("combine", 1);

            this.rlist.add(record);
        }

        // 将执行的Flag设置为1,代表成功
        this.setRst(1);

        return true;
    }

    /**
     * 将前台发送的模具工号字符串进行分析,解析出用于生成的模具工号集合
     * 
     * @param splitStr
     * @return
     */
    private Set<Integer> parseModuleCode(String splitStr) {
        // 将前台传来的模具工号字符串进行分割处理
        String[] item = splitStr.split(",");
        // 声明Set集合用于存放模具号
        Set<Integer> r_list = new HashSet<Integer>();
        for (String cell : item) {
            if (ArithUtils.isPlusInt(cell, false)) {
                int val = ArithUtils.parseInt(cell);
                // 如果值为0或者大于最大值,则跳过
                if (val == 0) {
                    continue;
                }
                // 如果结果中已经含有了这个编号,则跳过,否则添加一个至集合中
                if (!r_list.contains(val)) {
                    r_list.add(val);
                }

            } else {
                // 如果一个元素不包含'-',则表示这个元素不是需要的内容,则跳过
                if (!StringUtils.strContain(cell, "-")) {
                    continue;
                }

                String[] unit = cell.split("-");
                // 暂时将间隔符两端的值赋予最大与最小值
                int min = ArithUtils.parseInt(unit[0]);
                int max = ArithUtils.parseInt(unit[1]);

                if (min == 0 && max == 0) {
                    continue;
                }

                // 如果MIN小于1,将最小值+1
                if (min < 1) {
                    min++;
                }
                // 如果MAX小于1,将最小值+1
                if (max < 1) {
                    max++;
                }
                // 如果最小值大于最大值,将最大值与最小值交换位置
                if (min > max) {
                    int temp = max;
                    max = min;
                    min = temp;
                }

                // 将值从最小值
                for (int x = min; x < (max + 1); x++) {
                    if (!r_list.contains(x)) {
                        r_list.add(x);
                    }
                }
            }
        }

        return r_list;
    }

    /**
     * 获取正则表达式
     * 
     * @return
     */
    private String getRegex() {
        return "^(\\d{1," + this.unit + "}([-]\\d{1," + this.unit + "})?,)*(\\d{1," + this.unit + "}([-]\\d{1," + this.unit + "})?)$";
    }

    /**
     * 将分散的模具讯息组合成标准模具工号的集合<br>
     * gcode:客户代号,maketype:制作别,factoryid:厂区代号
     * 
     * @param gcode
     * @param maketype
     * @param factroyid
     * @param set
     * @return
     */
    private List<String> getModuleCodeList(String gcode, String maketype, String ordermonth, Set<Integer> set) {
        List<String> m_list = new ArrayList<String>();

        for (int u : set) {
            m_list.add(maketype + ordermonth + gcode + StringUtils.leftPad(u + "", this.unit, "0"));
        }

        return m_list;
    }
}
