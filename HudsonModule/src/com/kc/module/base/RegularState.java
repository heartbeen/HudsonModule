package com.kc.module.base;

public enum RegularState {

    // TODO 外发状态 | 申请中
    OUT_STATE_APPLY("申请中", "20601"),
    // 核准
    OUT_STATE_CHECKED("核准", "20602"),
    // 驳回
    OUT_STATE_UNCHECKED("驳回", "20603"),
    // 外发中
    OUT_STATE_ABOARD("外发中", "20604"),
    // 完成
    OUT_STATE_FINISH("完成", "20605"),
    // 取消
    OUT_STATE_CANCEL("取消", "20606"),

    // TODO 零件状态 | 开机
    MACHINE_START("开机", "20101"),
    // 停机
    MACHINE_STOP("停机", "20102"),
    // 外发
    PART_STATE_OUT("外发", "20205"),
    // 签收
    PART_STATE_CHECK("签收", "20208"),
    // 报废
    PART_STATE_RUIN("报废", "20206"),
    // 暂停
    PART_STATE_PAUSE("暂停", "20202"),
    // 停止
    PART_STATE_STOP("停止", "20203"),
    // 完成
    PART_STATE_OVER("完成", "20210"),
    // 加工
    PART_STATE_PROCESS("加工", "20201"),
    // 完工
    PART_STATE_FINISH("完工", "20209"),

    // TODO 员工执行状态 | 报废零件
    EMP_ACTION_RUIN("报废", "20305"),
    // 工件外发
    EMP_ACTION_OUT("工件外发", "20304"),
    // 零件签收
    EMP_ACTION_CHECK("签收", "20303"),
    // 下机
    EMP_ACTION_UP("上机", "20301"),
    // 上机
    EMP_ACTION_DOWN("下机", "20302"),

    // TODO 模具状态 | 新模
    MODULE_RESUME_NEW("新模", "20401"),
    // 修模
    MODULE_RESUME_MEND("修模", "20402"),
    // 停止
    MODULE_RESUME_STOP("停止", "20404"),
    // 设变
    MODULE_RESUME_PART("零件", "20408"),

    // TODO 制程状态 | 准备(单位未接收)
    DESIGN_SCHEDULE_READY("准备", "40201"),
    // 单位接收
    DESIGN_SCHEDULE_ACCEPT("接收", "40202"),
    // 制程加工中
    DESIGN_SCHEDULE_PROCESS("加工", "40203"),
    // 制程暂停
    DESIGN_SCHEDULE_STOP("暂停", "40204"),
    // 制程完毕
    DESIGN_SCHEDULE_FINISH("完成", "40205"),
    // 制程结案
    DESIGN_SCHEDULE_OVER("结案", "40207"),

    // TODO 计划加工状态 | 准备
    DESIGN_RESUME_READY("准备", "40101"),
    // 接收
    DESIGN_RESUME_PROCESS("加工", "40102"),
    // 加工
    DESIGN_RESUME_PAUSE("中止", "40103"),
    // 暂停
    DESIGN_RESUME_END("结案", "40104"),
    // 完成
    DESIGN_RESUME_FINISH("完成", "40105");

    private String name;
    private String index;

    private RegularState(String name, String index) {
        this.name = name;
        this.index = index;
    }

    public String getName() {
        return name;
    }

    public String getIndex() {
        return index;
    }
}
