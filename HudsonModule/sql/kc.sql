create table ACCOUNT_INFO
(
  accountid  VARCHAR2(36) not null,
  username   VARCHAR2(20),
  password   VARCHAR2(32),
  roleid     VARCHAR2(10),
  empid      VARCHAR2(100),
  createtime VARCHAR2(100),
  valid      VARCHAR2(100),
  newauth    VARCHAR2(300)
)
;
comment on table ACCOUNT_INFO
  is '人员账号表';
comment on column ACCOUNT_INFO.accountid
  is '账户的唯一标识符';
comment on column ACCOUNT_INFO.username
  is '用户名';
comment on column ACCOUNT_INFO.password
  is '登录密码';
comment on column ACCOUNT_INFO.roleid
  is '角色ID';
comment on column ACCOUNT_INFO.empid
  is '用户代号';
comment on column ACCOUNT_INFO.createtime
  is '创建时间';
comment on column ACCOUNT_INFO.valid
  is '是否有效';
comment on column ACCOUNT_INFO.newauth
  is '存放新授权模块的名字,多个用(,)隔开';
alter table ACCOUNT_INFO
  add constraint ACCOUNT_PK primary key (ACCOUNTID);


create table ACCOUNT_LOGIN
(
  id        VARCHAR2(36) not null,
  accountid VARCHAR2(10),
  loginip   VARCHAR2(15),
  useragent VARCHAR2(150),
  logintime DATE
)
;
comment on table ACCOUNT_LOGIN
  is '登录讯息表';
comment on column ACCOUNT_LOGIN.id
  is '记录唯一号';
comment on column ACCOUNT_LOGIN.accountid
  is '账号代号';
comment on column ACCOUNT_LOGIN.loginip
  is '登录IP地址';
comment on column ACCOUNT_LOGIN.logintime
  is '登录时间';
alter table ACCOUNT_LOGIN
  add constraint ACCOUNT_LOGIN_PK primary key (ID);


create table BARCODE_CONTEXT
(
  id            VARCHAR2(8) not null,
  bartypeid     VARCHAR2(8),
  printname     VARCHAR2(20),
  printcol      VARCHAR2(20),
  printtype     VARCHAR2(15),
  xseat         INTEGER,
  yseat         INTEGER,
  printwidth    INTEGER,
  printheight   INTEGER,
  barcodetype   VARCHAR2(20),
  rectline      INTEGER,
  rectlinewidth INTEGER,
  fontsize      NUMBER,
  printtext     VARCHAR2(30)
)
;
comment on column BARCODE_CONTEXT.printname
  is '打印名称';
comment on column BARCODE_CONTEXT.printcol
  is '打印列名';
comment on column BARCODE_CONTEXT.printtype
  is '打印类型(text,barcode,rect)';
comment on column BARCODE_CONTEXT.xseat
  is '打印X坐标位置';
comment on column BARCODE_CONTEXT.yseat
  is '打印Y坐标位置';
comment on column BARCODE_CONTEXT.printwidth
  is '打印宽度';
comment on column BARCODE_CONTEXT.printheight
  is '打印高度';
comment on column BARCODE_CONTEXT.barcodetype
  is '条形码类型';
comment on column BARCODE_CONTEXT.rectline
  is '矩形线框类型';
comment on column BARCODE_CONTEXT.rectlinewidth
  is '矩形线框宽度';
alter table BARCODE_CONTEXT
  add constraint BARCODE_CONTEXT_PK primary key (ID);


create table BARCODE_PAPER
(
  id          VARCHAR2(8) not null,
  papername   VARCHAR2(20),
  paperwidth  INTEGER,
  paperheight INTEGER,
  leftgap     INTEGER,
  rightgap    INTEGER,
  papergap    INTEGER,
  papers      INTEGER,
  used        INTEGER,
  moduleid    NUMBER
)
;
comment on column BARCODE_PAPER.papername
  is '纸名称';
comment on column BARCODE_PAPER.paperwidth
  is '纸宽度';
comment on column BARCODE_PAPER.paperheight
  is '纸高度';
comment on column BARCODE_PAPER.leftgap
  is '左间隙';
comment on column BARCODE_PAPER.rightgap
  is '右间隙';
comment on column BARCODE_PAPER.papergap
  is '多张纸间隙';
comment on column BARCODE_PAPER.papers
  is '同时打印张数';
comment on column BARCODE_PAPER.used
  is '是否选用';
comment on column BARCODE_PAPER.moduleid
  is '条形码纸所属模块ID';


create table BARCODE_TYPE
(
  bartypeid VARCHAR2(8) not null,
  barname   VARCHAR2(40),
  moduleid  NUMBER
)
;
comment on table BARCODE_TYPE
  is '条形码代号作用表';
comment on column BARCODE_TYPE.bartypeid
  is '条形码作用代号';
comment on column BARCODE_TYPE.barname
  is '条形码用途介绍';
comment on column BARCODE_TYPE.moduleid
  is '所属模块ID';
alter table BARCODE_TYPE
  add constraint BAR_TYPE_P primary key (BARTYPEID);


create table DEVICE_DEPART
(
  id       VARCHAR2(48) not null,
  partid   VARCHAR2(30),
  deviceid VARCHAR2(30),
  batchno  INTEGER,
  stateid  VARCHAR2(30),
  craftid  VARCHAR2(30),
  empid    VARCHAR2(100),
  launch   VARCHAR2(30)
)
;
comment on table DEVICE_DEPART
  is '部门设备表(统计各个部门的设备讯息)';
comment on column DEVICE_DEPART.id
  is '设备部门号';
comment on column DEVICE_DEPART.partid
  is '部门唯一号';
comment on column DEVICE_DEPART.deviceid
  is '设备唯一号';
comment on column DEVICE_DEPART.batchno
  is '设备编号';
comment on column DEVICE_DEPART.stateid
  is '当前状态';
comment on column DEVICE_DEPART.craftid
  is '当前工艺';
comment on column DEVICE_DEPART.empid
  is '操机员ID';
comment on column DEVICE_DEPART.launch
  is '开机时间';
alter table DEVICE_DEPART
  add constraint DEVICE_DEPART_PK primary key (ID);


create table DEVICE_DEPART_RESUME
(
  id        VARCHAR2(48) not null,
  partid    VARCHAR2(30),
  deviceid  VARCHAR2(30),
  batchno   VARCHAR2(10),
  operdate  DATE,
  operflag  NUMBER,
  operator  VARCHAR2(100),
  devpartid VARCHAR2(100)
)
;
comment on column DEVICE_DEPART_RESUME.id
  is '流水UUID';
comment on column DEVICE_DEPART_RESUME.partid
  is '异动部门';
comment on column DEVICE_DEPART_RESUME.deviceid
  is '设备代号';
comment on column DEVICE_DEPART_RESUME.batchno
  is '设备编号';
comment on column DEVICE_DEPART_RESUME.operdate
  is '异动时间';
comment on column DEVICE_DEPART_RESUME.operflag
  is '异动标识';
comment on column DEVICE_DEPART_RESUME.operator
  is '异动人员';
comment on column DEVICE_DEPART_RESUME.devpartid
  is '设备部门号';
alter table DEVICE_DEPART_RESUME
  add constraint DEVICE_DEPART_RESUME_PK primary key (ID);


create table DEVICE_INFO
(
  id           VARCHAR2(48) not null,
  devicetype   VARCHAR2(30),
  assetnumber  VARCHAR2(30),
  discriptions VARCHAR2(100),
  createdate   DATE,
  isenable     VARCHAR2(10)
)
;
comment on column DEVICE_INFO.id
  is '设备唯一号';
comment on column DEVICE_INFO.devicetype
  is '设备类型';
comment on column DEVICE_INFO.assetnumber
  is '资产编号';
comment on column DEVICE_INFO.discriptions
  is '是否虚拟设备(0实际1虚拟)';
comment on column DEVICE_INFO.createdate
  is '创建日期';
comment on column DEVICE_INFO.isenable
  is '是否可用';
alter table DEVICE_INFO
  add constraint DEVICE_INFO_PK primary key (ID);


create table DEVICE_PROCESS_RESUME
(
  id           VARCHAR2(48) not null,
  devicepartid VARCHAR2(30),
  stateid      VARCHAR2(30),
  craftid      VARCHAR2(30),
  empid        VARCHAR2(30),
  actiondate   DATE,
  actiontype   VARCHAR2(100)
)
;
comment on table DEVICE_PROCESS_RESUME
  is '机台设备的加工记录表(准确记录每台机的动态)';
comment on column DEVICE_PROCESS_RESUME.id
  is '机台动作流水号';
comment on column DEVICE_PROCESS_RESUME.devicepartid
  is '部门设备ID';
comment on column DEVICE_PROCESS_RESUME.stateid
  is '机台动态ID';
comment on column DEVICE_PROCESS_RESUME.craftid
  is '工艺ID';
comment on column DEVICE_PROCESS_RESUME.empid
  is '员工ID';
comment on column DEVICE_PROCESS_RESUME.actiondate
  is '动作时间';
comment on column DEVICE_PROCESS_RESUME.actiontype
  is '上机下机';
alter table DEVICE_PROCESS_RESUME
  add constraint DEVICE_PROCESS_RESUME_PK primary key (ID);


create table DEVICE_TYPE
(
  id         VARCHAR2(30) not null,
  name       VARCHAR2(60),
  createdate DATE,
  creator    VARCHAR2(30)
)
;
comment on column DEVICE_TYPE.id
  is '设备类型代号';
comment on column DEVICE_TYPE.name
  is '设备类型名称';
comment on column DEVICE_TYPE.createdate
  is '创建日期';
comment on column DEVICE_TYPE.creator
  is '创建人';
alter table DEVICE_TYPE
  add constraint DEVICE_TYPE_PK primary key (ID);


create table DS_MANU
(
  manuid   NVARCHAR2(30) not null,
  manuname NVARCHAR2(30)
)
;
comment on column DS_MANU.manuid
  is '制作代号';
comment on column DS_MANU.manuname
  is '制作名称';
alter table DS_MANU
  add constraint DS_MANU_PK primary key (MANUID);


create table DS_PARTINFO
(
  raceid       VARCHAR2(30) not null,
  raceno       VARCHAR2(20),
  racename     VARCHAR2(48),
  racenorms    VARCHAR2(48),
  racematerial VARCHAR2(48),
  raceintro    VARCHAR2(100),
  racecount    NUMBER
)
;
comment on column DS_PARTINFO.raceid
  is '工件种类代号';
comment on column DS_PARTINFO.raceno
  is '工件编号';
comment on column DS_PARTINFO.racename
  is '工件名称';
comment on column DS_PARTINFO.racenorms
  is '工件规格';
comment on column DS_PARTINFO.racematerial
  is '工件素材';
comment on column DS_PARTINFO.raceintro
  is '工件说明';
comment on column DS_PARTINFO.racecount
  is '标准数量';
alter table DS_PARTINFO
  add constraint DS_PARTINFO_PK primary key (RACEID);


create table DS_PART_RECORD
(
  uniqueid   VARCHAR2(30) not null,
  raceid     VARCHAR2(30),
  manuid     VARCHAR2(30),
  stackid    VARCHAR2(30) not null,
  stateid    VARCHAR2(30) not null,
  empid      VARCHAR2(30),
  partlistid VARCHAR2(30),
  movecount  INTEGER,
  remark     VARCHAR2(48),
  movedate   DATE
)
;
comment on column DS_PART_RECORD.uniqueid
  is '唯一号';
comment on column DS_PART_RECORD.raceid
  is '工件种类号';
comment on column DS_PART_RECORD.manuid
  is '制作代号';
comment on column DS_PART_RECORD.stackid
  is '仓库编号';
comment on column DS_PART_RECORD.stateid
  is '状态号(0入口1出库)';
comment on column DS_PART_RECORD.empid
  is '员工代号';
comment on column DS_PART_RECORD.partlistid
  is '工件代号';
comment on column DS_PART_RECORD.movecount
  is '异动数量';
comment on column DS_PART_RECORD.remark
  is '异动说明';
comment on column DS_PART_RECORD.movedate
  is '异动时间';
alter table DS_PART_RECORD
  add constraint DS_PRODUCTLIST_PK primary key (UNIQUEID);


create table DS_PART_STACK
(
  aloneid    VARCHAR2(30) not null,
  manuid     VARCHAR2(30),
  raceid     VARCHAR2(30) not null,
  stackid    VARCHAR2(30),
  partlistid VARCHAR2(30),
  totalcount INTEGER
)
;
comment on column DS_PART_STACK.aloneid
  is '工件资料唯一号';
comment on column DS_PART_STACK.manuid
  is '制作代号(0内制1外购)';
comment on column DS_PART_STACK.raceid
  is '种类代号';
comment on column DS_PART_STACK.stackid
  is '仓库代号';
comment on column DS_PART_STACK.partlistid
  is '工件唯一号';
comment on column DS_PART_STACK.totalcount
  is '工件总数量';
alter table DS_PART_STACK
  add constraint DS_PRODUCTTOTALDATA_PK primary key (ALONEID);


create table DS_STACK
(
  stackid   VARCHAR2(30) not null,
  stackname VARCHAR2(30)
)
;
comment on column DS_STACK.stackid
  is '仓库代号';
comment on column DS_STACK.stackname
  is '仓库名称';
alter table DS_STACK
  add constraint DS_STACK_KEY primary key (STACKID);


create table DS_STATE
(
  stateid   VARCHAR2(30) not null,
  statename VARCHAR2(30)
)
;
comment on column DS_STATE.stateid
  is '状态代号';
comment on column DS_STATE.statename
  is '状态名称';
alter table DS_STATE
  add constraint DS_STATE_PK primary key (STATEID);


create table DUTIES
(
  id           VARCHAR2(10) not null,
  positionname VARCHAR2(20)
)
;
comment on table DUTIES
  is '人员职称表';
comment on column DUTIES.id
  is '职称代号';
comment on column DUTIES.positionname
  is '职称名称';
alter table DUTIES
  add constraint POSITION_PK primary key (ID);


create table EMPLOYEE_INFO
(
  id          VARCHAR2(36) not null,
  worknumber  VARCHAR2(10),
  empname     VARCHAR2(16),
  posid       VARCHAR2(10),
  stationid   VARCHAR2(20),
  regioncode  VARCHAR2(10),
  phone       VARCHAR2(15),
  shortnumber VARCHAR2(8),
  email       VARCHAR2(30),
  duty        VARCHAR2(10),
  isenable    VARCHAR2(10)
)
;
comment on column EMPLOYEE_INFO.id
  is '员工唯一号';
comment on column EMPLOYEE_INFO.worknumber
  is '员工工号';
comment on column EMPLOYEE_INFO.empname
  is '员工名称';
comment on column EMPLOYEE_INFO.posid
  is '所在部门';
comment on column EMPLOYEE_INFO.stationid
  is '员工职位';
comment on column EMPLOYEE_INFO.regioncode
  is '厂区代号';
comment on column EMPLOYEE_INFO.phone
  is '电话号码';
comment on column EMPLOYEE_INFO.shortnumber
  is '手机短号';
comment on column EMPLOYEE_INFO.email
  is '邮件地址';
comment on column EMPLOYEE_INFO.duty
  is '职务级别';
comment on column EMPLOYEE_INFO.isenable
  is '是否有效';
alter table EMPLOYEE_INFO
  add constraint EMPLOYEE_INFO_PK primary key (ID);


create table EXCHANGE_RATE
(
  id     VARCHAR2(30),
  short  VARCHAR2(100),
  cnames VARCHAR2(30),
  enames VARCHAR2(30),
  uptime DATE,
  rate   VARCHAR2(20),
  upman  VARCHAR2(100),
  ishome VARCHAR2(100)
)
;
comment on column EXCHANGE_RATE.id
  is '币别代号';
comment on column EXCHANGE_RATE.short
  is '币别缩写';
comment on column EXCHANGE_RATE.cnames
  is '中文币别';
comment on column EXCHANGE_RATE.enames
  is '英文币别';
comment on column EXCHANGE_RATE.uptime
  is '更新时间';
comment on column EXCHANGE_RATE.rate
  is '汇率';
comment on column EXCHANGE_RATE.upman
  is '更新人';
comment on column EXCHANGE_RATE.ishome
  is '是否本币';


create table FACTORY
(
  id          VARCHAR2(36) not null,
  factorycode VARCHAR2(36) not null,
  shortname   VARCHAR2(20),
  fullname    VARCHAR2(100),
  factorytype NUMBER,
  address     VARCHAR2(150),
  forwhich    VARCHAR2(10),
  contactor   VARCHAR2(30),
  phonenumber VARCHAR2(50),
  faxnumber   VARCHAR2(50),
  createtime  DATE,
  creator     VARCHAR2(30),
  nature      NUMBER,
  isdeal      VARCHAR2(4),
  remark      VARCHAR2(100),
  email       VARCHAR2(100),
  currency    VARCHAR2(5)
)
;
comment on column FACTORY.id
  is '工厂唯一号';
comment on column FACTORY.factorycode
  is '工厂代号';
comment on column FACTORY.shortname
  is '公司简称';
comment on column FACTORY.fullname
  is '工厂名称';
comment on column FACTORY.factorytype
  is '   1  本公司集团名称  2  客户 3供货商';
comment on column FACTORY.address
  is '公司地址';
comment on column FACTORY.forwhich
  is '属于本部哪个厂的厂商';
comment on column FACTORY.contactor
  is '联络人';
comment on column FACTORY.phonenumber
  is '联络电话';
comment on column FACTORY.faxnumber
  is '传真号码';
comment on column FACTORY.createtime
  is '创建时间';
comment on column FACTORY.creator
  is '资料创建人';
comment on column FACTORY.nature
  is ' 厂商的类型(港台资,欧美,大陆等)   01 港台资  02 欧美  03 大陆';
comment on column FACTORY.isdeal
  is '0可交易状态,1不可交易状态';
comment on column FACTORY.remark
  is '备注';
alter table FACTORY
  add constraint FACTORY_PK primary key (ID);


create table ITEM_AUTHORITY
(
  authid       VARCHAR2(10) not null,
  authname     VARCHAR2(100),
  userpathname VARCHAR2(200),
  authtype     VARCHAR2(3),
  moduleid     VARCHAR2(36)
)
;
comment on table ITEM_AUTHORITY
  is '功能权限关联表';
comment on column ITEM_AUTHORITY.authid
  is '包括用户ID和角色ID';
comment on column ITEM_AUTHORITY.authname
  is 'Y:具有增加数据功能 N:不具有';
comment on column ITEM_AUTHORITY.userpathname
  is 'Y:具有查询功能 N:不具有';
comment on column ITEM_AUTHORITY.authtype
  is '0 查询  1 新增  2 修改  3 删除';
comment on column ITEM_AUTHORITY.moduleid
  is ' 对应模块ID';
alter table ITEM_AUTHORITY
  add constraint ITEM_AUTHORITY_PK primary key (AUTHID);


create table MAIN_PROJECT
(
  id        VARCHAR2(36) not null,
  name      VARCHAR2(30),
  filepath  VARCHAR2(100),
  icon      VARCHAR2(30),
  remark    VARCHAR2(150),
  finelname VARCHAR2(30)
)
;
alter table MAIN_PROJECT
  add constraint MAIN_PROJECT_PK primary key (ID);


create table MD_ACTUAL_SCHEDULE
(
  actualid  VARCHAR2(32),
  estid     VARCHAR2(32),
  starttime DATE,
  duration  NUMBER
)
;


create table MD_CRAFT
(
  craftcode VARCHAR2(20),
  craftname VARCHAR2(20),
  craftrank NUMBER,
  craftinfo VARCHAR2(100),
  id        VARCHAR2(30) not null,
  craftid   VARCHAR2(30)
)
;
comment on table MD_CRAFT
  is '模具加工工艺表';
comment on column MD_CRAFT.craftcode
  is '工艺代号';
comment on column MD_CRAFT.craftname
  is '工艺名称';
comment on column MD_CRAFT.craftrank
  is '工艺级别';
comment on column MD_CRAFT.craftinfo
  is '工艺单价';
comment on column MD_CRAFT.id
  is '二维码';
comment on column MD_CRAFT.craftid
  is '工艺阶梯号';
alter table MD_CRAFT
  add constraint MD_CRAFT_PK primary key (ID);


create table MD_CRAFT_SET
(
  id       VARCHAR2(48),
  setid    VARCHAR2(30),
  craftid  VARCHAR2(30),
  roleid   VARCHAR2(10),
  duration NUMBER,
  gap      NUMBER,
  ranknum  NUMBER,
  setname  VARCHAR2(50)
)
;
comment on column MD_CRAFT_SET.id
  is '组合排程唯一号';
comment on column MD_CRAFT_SET.setid
  is '组合排程合并号';
comment on column MD_CRAFT_SET.craftid
  is '组合排程号';
comment on column MD_CRAFT_SET.duration
  is '默认加工时长';
comment on column MD_CRAFT_SET.gap
  is '默认工艺的间隙';


create table MD_DEVICE_CRAFT
(
  id        VARCHAR2(48),
  deviceid  VARCHAR2(30),
  craftid   VARCHAR2(30),
  isdefault VARCHAR2(4)
)
;
comment on column MD_DEVICE_CRAFT.id
  is '模具机台工艺表';
comment on column MD_DEVICE_CRAFT.deviceid
  is '设备编号';
comment on column MD_DEVICE_CRAFT.craftid
  is '工艺代号';
comment on column MD_DEVICE_CRAFT.isdefault
  is '是否默认工艺';


create table MD_DEVICE_CRAFTRESUME
(
  id         VARCHAR2(48),
  resumeid   VARCHAR2(48),
  deviceid   VARCHAR2(30),
  craftid    VARCHAR2(30),
  createtime DATE,
  creator    VARCHAR2(30)
)
;
comment on column MD_DEVICE_CRAFTRESUME.id
  is 'ID号码';
comment on column MD_DEVICE_CRAFTRESUME.deviceid
  is '设备代号';
comment on column MD_DEVICE_CRAFTRESUME.craftid
  is '工艺代号';
comment on column MD_DEVICE_CRAFTRESUME.createtime
  is '创建时间';
comment on column MD_DEVICE_CRAFTRESUME.creator
  is '创建人员';


create table MD_DEVICE_SPECIAL
(
  id       VARCHAR2(48) not null,
  devposid VARCHAR2(48),
  isalone  VARCHAR2(48)
)
;
comment on column MD_DEVICE_SPECIAL.devposid
  is '部门设备ID号';
comment on column MD_DEVICE_SPECIAL.isalone
  is 'NULL为单独加工';
alter table MD_DEVICE_SPECIAL
  add constraint MD_DEVICE_SPECIAL_PK primary key (ID);


create table MD_EST_SCHEDULE
(
  id             VARCHAR2(48) not null,
  schid          VARCHAR2(36),
  partid         VARCHAR2(48),
  starttime      DATE,
  endtime        DATE,
  craftid        VARCHAR2(48),
  ismerge        VARCHAR2(100),
  moduleresumeid VARCHAR2(30),
  ranknum        NUMBER,
  duration       NUMBER,
  parentid       VARCHAR2(48),
  evaluate       NUMBER,
  isfinish       VARCHAR2(10),
  isused         VARCHAR2(10),
  typeid         VARCHAR2(10)
)
;
comment on column MD_EST_SCHEDULE.id
  is '工务排程唯一号';
comment on column MD_EST_SCHEDULE.schid
  is '排程或者合并排程号';
comment on column MD_EST_SCHEDULE.partid
  is '工件ID号';
comment on column MD_EST_SCHEDULE.starttime
  is '开始时间';
comment on column MD_EST_SCHEDULE.endtime
  is '结束时间';
comment on column MD_EST_SCHEDULE.craftid
  is '工艺代号';
comment on column MD_EST_SCHEDULE.ismerge
  is '是否合并';
comment on column MD_EST_SCHEDULE.moduleresumeid
  is '模具履历ID';
comment on column MD_EST_SCHEDULE.ranknum
  is '加工顺序号';
comment on column MD_EST_SCHEDULE.duration
  is '加工时长(小时)';
comment on column MD_EST_SCHEDULE.parentid
  is '依赖的排程ID';
comment on column MD_EST_SCHEDULE.evaluate
  is '评估加工时长(单位:小时)';
comment on column MD_EST_SCHEDULE.isfinish
  is '完成标识符';
comment on column MD_EST_SCHEDULE.isused
  is '是否已经使用(1已经使用)';
comment on column MD_EST_SCHEDULE.typeid
  is '排程类型(1临时排程)';
create index I_PARTID on MD_EST_SCHEDULE (PARTID);
alter table MD_EST_SCHEDULE
  add constraint MD_EST_SCHEDULE_PK primary key (ID);


create table MD_MACHINE_INFO
(
  id      VARCHAR2(48),
  macload NUMBER
)
;
comment on column MD_MACHINE_INFO.id
  is '模具机台设备号';
comment on column MD_MACHINE_INFO.macload
  is '模具机台负载';


create table MD_MEASURE_LIST
(
  partbarcode   VARCHAR2(20),
  modulebarcode VARCHAR2(20)
)
;
comment on table MD_MEASURE_LIST
  is '模具要测量工件的清单';


create table MD_PART
(
  partbarcode   VARCHAR2(20) not null,
  modulebarcode VARCHAR2(20),
  partcode      VARCHAR2(20),
  cnames        VARCHAR2(50),
  enames        VARCHAR2(30),
  raceid        VARCHAR2(10),
  norms         VARCHAR2(60),
  material      VARCHAR2(30),
  applierid     VARCHAR2(20),
  quantity      NUMBER,
  isfirmware    VARCHAR2(10) default 0,
  isbatch       VARCHAR2(10),
  isprocess     NUMBER,
  measure       NUMBER,
  parentbarcode VARCHAR2(20),
  isparent      NUMBER
)
;
comment on column MD_PART.partbarcode
  is '零件二维号';
comment on column MD_PART.modulebarcode
  is '模具二维号';
comment on column MD_PART.partcode
  is '零件代号';
comment on column MD_PART.cnames
  is '中文名称';
comment on column MD_PART.enames
  is '英文名称';
comment on column MD_PART.raceid
  is '种类(标准件等)';
comment on column MD_PART.norms
  is '规格(厂宽高等)';
comment on column MD_PART.material
  is '材料名称';
comment on column MD_PART.applierid
  is '料供商代号';
comment on column MD_PART.quantity
  is '工件数量';
comment on column MD_PART.isfirmware
  is '是否固件';
comment on column MD_PART.isbatch
  is '是否编号';
comment on column MD_PART.isprocess
  is '是否要加工 0:为加工,1为不加工';
comment on column MD_PART.measure
  is '是否要测量,1:要测量,null或0:不测量';
comment on column MD_PART.parentbarcode
  is '将工件镶入到指定工件';
comment on column MD_PART.isparent
  is '是否为镶入父工件';
alter table MD_PART
  add constraint MD_PART_PK primary key (PARTBARCODE);


create table MD_PART_LIST
(
  partbarlistcode VARCHAR2(20) not null,
  modulebarcode   VARCHAR2(20),
  partbarcode     VARCHAR2(20),
  partlistcode    VARCHAR2(20),
  partrootcode    VARCHAR2(20),
  partlistbatch   VARCHAR2(20),
  isenable        VARCHAR2(4) default 0,
  modulecode      VARCHAR2(48),
  isschedule      VARCHAR2(4)
)
;
comment on column MD_PART_LIST.partbarlistcode
  is '零件编号二维代号';
comment on column MD_PART_LIST.modulebarcode
  is '模具二维编码';
comment on column MD_PART_LIST.partbarcode
  is '零件二维代码';
comment on column MD_PART_LIST.partlistcode
  is '零件编号代号';
comment on column MD_PART_LIST.partrootcode
  is '零件编码';
comment on column MD_PART_LIST.partlistbatch
  is '零件编号尾号';
comment on column MD_PART_LIST.isenable
  is '零件状态(0为OK状态)';
comment on column MD_PART_LIST.modulecode
  is '模具工号';
comment on column MD_PART_LIST.isschedule
  is '是否安排排程';
create index MD_PART_LIST_PARTBARCODE_IDX on MD_PART_LIST (PARTBARCODE);
alter table MD_PART_LIST
  add constraint MD_PART_LIST_PK primary key (PARTBARLISTCODE);


create table MD_PART_RELATION
(
  relationid  VARCHAR2(30),
  partbarcode VARCHAR2(30)
)
;


create table MD_PART_RESUME
(
  id              VARCHAR2(36),
  modulebarcode   VARCHAR2(20),
  partlistbarcode VARCHAR2(20),
  modulestatecode VARCHAR2(48),
  modifiedtime    DATE,
  modifiedstate   VARCHAR2(10)
)
;
comment on column MD_PART_RESUME.id
  is '工件履历异动ID号';
comment on column MD_PART_RESUME.modulebarcode
  is '模具工号唯一号';
comment on column MD_PART_RESUME.partlistbarcode
  is '工件代号唯一号';
comment on column MD_PART_RESUME.modulestatecode
  is '模具状态唯一号';
comment on column MD_PART_RESUME.modifiedtime
  is '工件异动时间';
comment on column MD_PART_RESUME.modifiedstate
  is '工件异动状态ID';


create table MD_PART_SECTION
(
  id              VARCHAR2(30) not null,
  sectionid       VARCHAR2(30),
  partbarlistcode VARCHAR2(30),
  remark          VARCHAR2(100)
)
;
comment on table MD_PART_SECTION
  is '模具工件履历加工清单';
comment on column MD_PART_SECTION.id
  is '流水号';
comment on column MD_PART_SECTION.sectionid
  is '模具加工分段号';
comment on column MD_PART_SECTION.partbarlistcode
  is '工件唯一号';
comment on column MD_PART_SECTION.remark
  is '备注说明';
alter table MD_PART_SECTION
  add constraint MD_PART_SECTION_PK primary key (ID);


create table MD_PROCESS_DEVSTATE
(
  id      VARCHAR2(48),
  devid   VARCHAR2(30),
  stateid VARCHAR2(20),
  empid   VARCHAR2(30),
  acttime DATE
)
;


create table MD_PROCESS_INFO
(
  id               VARCHAR2(48) not null,
  partmergeid      VARCHAR2(48),
  partbarlistcode  VARCHAR2(48),
  devicepartid     VARCHAR2(48),
  devicecraftid    VARCHAR2(48),
  partstateid      VARCHAR2(48),
  devicestateid    VARCHAR2(48),
  deviceempid      VARCHAR2(48),
  devicelaunchdate VARCHAR2(30),
  moduleresumeid   VARCHAR2(48),
  currentdeptid    VARCHAR2(48),
  remark           VARCHAR2(200),
  scheduleid       VARCHAR2(48),
  actiontime       DATE,
  partcount        VARCHAR2(10),
  cursorid         VARCHAR2(20)
)
;
comment on table MD_PROCESS_INFO
  is '工件加工缓冲表';
comment on column MD_PROCESS_INFO.id
  is '工件加工唯一号';
comment on column MD_PROCESS_INFO.partmergeid
  is '工件合并登记号';
comment on column MD_PROCESS_INFO.partbarlistcode
  is '工件部件唯一号';
comment on column MD_PROCESS_INFO.devicepartid
  is '机台部门唯一号';
comment on column MD_PROCESS_INFO.devicecraftid
  is '工件加工工艺';
comment on column MD_PROCESS_INFO.partstateid
  is '工件部件状态号';
comment on column MD_PROCESS_INFO.devicestateid
  is '加工机台状态号';
comment on column MD_PROCESS_INFO.deviceempid
  is '加工机台员工号';
comment on column MD_PROCESS_INFO.devicelaunchdate
  is '机台开机时间';
comment on column MD_PROCESS_INFO.moduleresumeid
  is '模具履历号';
comment on column MD_PROCESS_INFO.currentdeptid
  is '当前部门代号';
comment on column MD_PROCESS_INFO.remark
  is '加工说明';
comment on column MD_PROCESS_INFO.scheduleid
  is '工件预计排程号';
comment on column MD_PROCESS_INFO.actiontime
  is '异动时间';
comment on column MD_PROCESS_INFO.partcount
  is '工件数量(合并加工的个数)';
comment on column MD_PROCESS_INFO.cursorid
  is '游标ID';
alter table MD_PROCESS_INFO
  add constraint MD_PROCESS_INFO_PK primary key (ID);


create table MD_PROCESS_RESUME
(
  id              VARCHAR2(48) not null,
  partmergeid     VARCHAR2(48),
  partbarlistcode VARCHAR2(48),
  ldevdepartid    VARCHAR2(20),
  lprocraftid     VARCHAR2(20),
  lpartstateid    VARCHAR2(20),
  ldevstateid     VARCHAR2(20),
  lempid          VARCHAR2(20),
  lempactid       VARCHAR2(20),
  ldeptid         VARCHAR2(20),
  lscheid         VARCHAR2(30),
  lrcdtime        DATE,
  ndevdepartid    VARCHAR2(20),
  nprocraftid     VARCHAR2(20),
  npartstateid    VARCHAR2(20),
  ndevstateid     VARCHAR2(20),
  nempid          VARCHAR2(20),
  nempactid       VARCHAR2(20),
  ndeptid         VARCHAR2(20),
  nscheid         VARCHAR2(20),
  nrcdtime        DATE,
  partcount       VARCHAR2(10),
  mid             VARCHAR2(20),
  rsmid           VARCHAR2(20),
  istime          VARCHAR2(10),
  invisible       NUMBER default 0,
  outid           VARCHAR2(48)
)
;
comment on column MD_PROCESS_RESUME.id
  is '工件加工记录ID';
comment on column MD_PROCESS_RESUME.partmergeid
  is '工件合并记录ID';
comment on column MD_PROCESS_RESUME.partbarlistcode
  is '工件部件唯一号';
comment on column MD_PROCESS_RESUME.ldevdepartid
  is '上一个机台部门号';
comment on column MD_PROCESS_RESUME.lprocraftid
  is '上一个工艺号';
comment on column MD_PROCESS_RESUME.lpartstateid
  is '上一个工件状态号';
comment on column MD_PROCESS_RESUME.ldevstateid
  is '上一个设备状态号';
comment on column MD_PROCESS_RESUME.lempid
  is '上一个操作员';
comment on column MD_PROCESS_RESUME.lempactid
  is '上一个员工动作(上机下机或者签收等)';
comment on column MD_PROCESS_RESUME.ldeptid
  is '上一个部门别';
comment on column MD_PROCESS_RESUME.lscheid
  is '上一个排程号';
comment on column MD_PROCESS_RESUME.lrcdtime
  is '上一个安排时间';
comment on column MD_PROCESS_RESUME.ndevdepartid
  is '当前机台部门号';
comment on column MD_PROCESS_RESUME.nprocraftid
  is '当前工艺号';
comment on column MD_PROCESS_RESUME.npartstateid
  is '当前工件状态';
comment on column MD_PROCESS_RESUME.ndevstateid
  is '当前机台状态';
comment on column MD_PROCESS_RESUME.nempid
  is '当前员工号';
comment on column MD_PROCESS_RESUME.nempactid
  is '当前员工动作(上机下机签收等)';
comment on column MD_PROCESS_RESUME.ndeptid
  is '当前部门';
comment on column MD_PROCESS_RESUME.nscheid
  is '当前排程';
comment on column MD_PROCESS_RESUME.nrcdtime
  is '当前时间';
comment on column MD_PROCESS_RESUME.partcount
  is '工件数量';
comment on column MD_PROCESS_RESUME.mid
  is 'MD_PROCESS_INFO表ID';
comment on column MD_PROCESS_RESUME.rsmid
  is '模具履历号';
comment on column MD_PROCESS_RESUME.istime
  is '是否计时标签(0为计时,1为不计时)';
comment on column MD_PROCESS_RESUME.invisible
  is '是否可见(0可见1不可见)';
comment on column MD_PROCESS_RESUME.outid
  is '是否外发ID号';
alter table MD_PROCESS_RESUME
  add constraint MD_PROCESS_RESUME_PK primary key (ID);


create table MD_PROCESS_STATE
(
  id   VARCHAR2(10) not null,
  name VARCHAR2(30),
  info VARCHAR2(48),
  type VARCHAR2(10)
)
;
comment on column MD_PROCESS_STATE.id
  is '加工状态唯一号';
comment on column MD_PROCESS_STATE.name
  is '加工状态名称';
comment on column MD_PROCESS_STATE.info
  is '加工状态说明';
comment on column MD_PROCESS_STATE.type
  is '状态类型(0用于打印,1不用于打印)';
alter table MD_PROCESS_STATE
  add constraint MD_PROCESS_STATE_PK primary key (ID);


create table MD_RESUME
(
  id            VARCHAR2(36),
  curestate     VARCHAR2(100),
  resumestate   VARCHAR2(10),
  resumeempid   VARCHAR2(20),
  starttime     DATE,
  endtime       DATE,
  remark        VARCHAR2(500),
  modulebarcode VARCHAR2(48)
)
;
comment on table MD_RESUME
  is '模具履历记录表(包括新模,各种修模,设变)';
comment on column MD_RESUME.id
  is '模具履历ID';


create table MD_RESUME_RECORD
(
  id            VARCHAR2(48),
  modulebarcode VARCHAR2(48),
  resumestate   VARCHAR2(10),
  resumetime    DATE,
  resumeempid   VARCHAR2(20),
  starttime     DATE,
  endtime       DATE,
  finishtime    DATE,
  remark        VARCHAR2(500)
)
;
comment on column MD_RESUME_RECORD.id
  is '异动唯一号记录号';
comment on column MD_RESUME_RECORD.modulebarcode
  is '模具唯一号';
comment on column MD_RESUME_RECORD.resumestate
  is '模具异动号';
comment on column MD_RESUME_RECORD.resumetime
  is '模具异动时间';
comment on column MD_RESUME_RECORD.resumeempid
  is '异动人员';
comment on column MD_RESUME_RECORD.starttime
  is '加工开始时间';
comment on column MD_RESUME_RECORD.endtime
  is '预计完工时间';
comment on column MD_RESUME_RECORD.finishtime
  is '实际完工时间';
comment on column MD_RESUME_RECORD.remark
  is '加工备注';


create table MD_RESUME_SECTION
(
  id        VARCHAR2(30) not null,
  resumeid  VARCHAR2(30),
  stateid   VARCHAR2(30),
  startdate DATE,
  enddate   DATE,
  remark    VARCHAR2(100),
  finished  NUMBER default 0
)
;
comment on table MD_RESUME_SECTION
  is '模具履历的分段加工表';
comment on column MD_RESUME_SECTION.id
  is '流水号';
comment on column MD_RESUME_SECTION.resumeid
  is '模具履历号';
comment on column MD_RESUME_SECTION.stateid
  is '加工状态';
comment on column MD_RESUME_SECTION.startdate
  is '开始时间';
comment on column MD_RESUME_SECTION.enddate
  is '结束时间';
comment on column MD_RESUME_SECTION.remark
  is '操作说明';
comment on column MD_RESUME_SECTION.finished
  is '是否完成';
alter table MD_RESUME_SECTION
  add constraint MD_RESUME_SECTION_PK primary key (ID);


create table MD_TD_MEASURE
(
  id            VARCHAR2(10) not null,
  partbarcode   VARCHAR2(30),
  modulebarcode VARCHAR2(100),
  measurename   VARCHAR2(100),
  measuretime   DATE,
  picturepath   VARCHAR2(300),
  craftid       VARCHAR2(10),
  remark        VARCHAR2(500),
  empid         VARCHAR2(20)
)
;
comment on table MD_TD_MEASURE
  is '三次元测量数据表';
comment on column MD_TD_MEASURE.partbarcode
  is '工件条形码';
comment on column MD_TD_MEASURE.modulebarcode
  is '模具条形码';
comment on column MD_TD_MEASURE.measurename
  is '测量名称';
comment on column MD_TD_MEASURE.measuretime
  is '测量时间';
comment on column MD_TD_MEASURE.craftid
  is '测量的工艺Id';
comment on column MD_TD_MEASURE.remark
  is '备注';
comment on column MD_TD_MEASURE.empid
  is '测量者';


create table MD_TOLERANCE
(
  id              VARCHAR2(30) not null,
  partbarlistcode VARCHAR2(30),
  partbarcode     VARCHAR2(30),
  modulebarcode   VARCHAR2(30),
  mposid          VARCHAR2(30),
  mempid          VARCHAR2(30),
  posid           VARCHAR2(30),
  empid           VARCHAR2(30),
  mid             VARCHAR2(20),
  msize           VARCHAR2(20),
  maxtolar        VARCHAR2(20),
  mintolar        VARCHAR2(20),
  toolid          VARCHAR2(10),
  mdata           VARCHAR2(20),
  graphno         VARCHAR2(30),
  remark          VARCHAR2(60),
  batchno         VARCHAR2(20),
  craftid         VARCHAR2(20),
  sdate           VARCHAR2(30),
  mdate           VARCHAR2(30),
  mrst            VARCHAR2(10),
  dempid          VARCHAR2(30)
)
;
comment on table MD_TOLERANCE
  is '精测测量表';
comment on column MD_TOLERANCE.id
  is '流水号';
comment on column MD_TOLERANCE.partbarlistcode
  is '工件号';
comment on column MD_TOLERANCE.partbarcode
  is '部件号';
comment on column MD_TOLERANCE.modulebarcode
  is '模具号';
comment on column MD_TOLERANCE.mposid
  is '测量单位';
comment on column MD_TOLERANCE.mempid
  is '测量人';
comment on column MD_TOLERANCE.posid
  is '送测单位';
comment on column MD_TOLERANCE.empid
  is '送测人';
comment on column MD_TOLERANCE.mid
  is '寸法编号';
comment on column MD_TOLERANCE.msize
  is '寸法长度';
comment on column MD_TOLERANCE.maxtolar
  is '误差上限';
comment on column MD_TOLERANCE.mintolar
  is '误差下限';
comment on column MD_TOLERANCE.toolid
  is '测量工具号';
comment on column MD_TOLERANCE.mdata
  is '测量资料';
comment on column MD_TOLERANCE.graphno
  is '图纸编号';
comment on column MD_TOLERANCE.remark
  is '备注';
comment on column MD_TOLERANCE.batchno
  is '测量批次';
comment on column MD_TOLERANCE.craftid
  is '测量工艺';
comment on column MD_TOLERANCE.sdate
  is '制造日期';
comment on column MD_TOLERANCE.mdate
  is '测量时间';
comment on column MD_TOLERANCE.mrst
  is '测量结果(0:OK,1NG,2救济)';
comment on column MD_TOLERANCE.dempid
  is '设计判定人';
alter table MD_TOLERANCE
  add constraint MD_TOLERANCE_PK primary key (ID);


create table MD_TOLERANCE_RECORD
(
  id              VARCHAR2(30) not null,
  partbarlistcode VARCHAR2(30),
  partbarcode     VARCHAR2(30),
  modulebarcode   VARCHAR2(30),
  mposid          VARCHAR2(30),
  mempid          VARCHAR2(30),
  posid           VARCHAR2(30),
  empid           VARCHAR2(30),
  mid             VARCHAR2(20),
  msize           VARCHAR2(20),
  maxtolar        VARCHAR2(20),
  mintolar        VARCHAR2(20),
  toolid          VARCHAR2(10),
  mdata           VARCHAR2(20),
  graphno         VARCHAR2(30),
  remark          VARCHAR2(60),
  batchno         VARCHAR2(20),
  craftid         VARCHAR2(20),
  sdate           VARCHAR2(30),
  mdate           VARCHAR2(30)
)
;
comment on column MD_TOLERANCE_RECORD.id
  is '流水号';
comment on column MD_TOLERANCE_RECORD.partbarlistcode
  is '工件号';
comment on column MD_TOLERANCE_RECORD.partbarcode
  is '部件号';
comment on column MD_TOLERANCE_RECORD.modulebarcode
  is '模具号';
comment on column MD_TOLERANCE_RECORD.mposid
  is '测量单位';
comment on column MD_TOLERANCE_RECORD.mempid
  is '测量人';
comment on column MD_TOLERANCE_RECORD.posid
  is '送测部门';
comment on column MD_TOLERANCE_RECORD.empid
  is '送测人';
comment on column MD_TOLERANCE_RECORD.mid
  is '寸法编号';
comment on column MD_TOLERANCE_RECORD.msize
  is '寸法长度';
comment on column MD_TOLERANCE_RECORD.maxtolar
  is '误差上限';
comment on column MD_TOLERANCE_RECORD.mintolar
  is '误差下限';
comment on column MD_TOLERANCE_RECORD.toolid
  is '工具代号';
comment on column MD_TOLERANCE_RECORD.mdata
  is '测量资料';
comment on column MD_TOLERANCE_RECORD.graphno
  is '工件图纸号';
comment on column MD_TOLERANCE_RECORD.remark
  is '备注';
comment on column MD_TOLERANCE_RECORD.batchno
  is '批次代号';
comment on column MD_TOLERANCE_RECORD.craftid
  is '测量工艺';
comment on column MD_TOLERANCE_RECORD.sdate
  is '制造日期';
comment on column MD_TOLERANCE_RECORD.mdate
  is '测量日期';
alter table MD_TOLERANCE_RECORD
  add constraint MD_TOLERANCE_RECORD_PK primary key (ID);


create table MEASURETOOLS
(
  id   VARCHAR2(30) not null,
  name VARCHAR2(60),
  code VARCHAR2(30)
)
;
comment on column MEASURETOOLS.id
  is 'ID号';
comment on column MEASURETOOLS.name
  is '工具名称';
comment on column MEASURETOOLS.code
  is '工件代号';
alter table MEASURETOOLS
  add constraint MEASURETOOLS_PK primary key (ID);


create table MODULELIST
(
  posid         VARCHAR2(36) not null,
  modulecode    VARCHAR2(50),
  guestid       VARCHAR2(20),
  moduleclass   VARCHAR2(50),
  inittrytime   DATE,
  facttrytime   DATE,
  createyear    VARCHAR2(20),
  createmonth   VARCHAR2(10),
  createtime    DATE,
  creator       VARCHAR2(20),
  modulestate   VARCHAR2(4),
  takeon        VARCHAR2(20),
  starttime     DATE,
  monthno       NUMBER,
  pictureurl    VARCHAR2(30),
  modulestyle   VARCHAR2(10),
  productname   VARCHAR2(100),
  moduleintro   VARCHAR2(240),
  guestcode     VARCHAR2(30),
  workpressure  NUMBER default 0,
  unitextrac    VARCHAR2(20),
  operateflag   VARCHAR2(10),
  modulebarcode VARCHAR2(100) not null,
  plastic       VARCHAR2(100),
  filename      VARCHAR2(30),
  excelindex    NUMBER,
  combine       NUMBER
)
;
comment on column MODULELIST.posid
  is '模具的加工厂区代号';
comment on column MODULELIST.modulecode
  is '模具内部ID号';
comment on column MODULELIST.guestid
  is '客户代号';
comment on column MODULELIST.moduleclass
  is '客户机种名';
comment on column MODULELIST.inittrytime
  is 'TO时间';
comment on column MODULELIST.facttrytime
  is '实际TO时间';
comment on column MODULELIST.createyear
  is '模具订单年份';
comment on column MODULELIST.createmonth
  is '模具创建的月份';
comment on column MODULELIST.createtime
  is '建立模具数据的具体时间';
comment on column MODULELIST.creator
  is '创建模具数据的员工ID';
comment on column MODULELIST.modulestate
  is '模具状态(0正常,1报废)';
comment on column MODULELIST.takeon
  is '模具担当';
comment on column MODULELIST.starttime
  is '开工时间';
comment on column MODULELIST.monthno
  is '月度编号';
comment on column MODULELIST.pictureurl
  is '金型担当';
comment on column MODULELIST.modulestyle
  is '制作方式';
comment on column MODULELIST.productname
  is '部品名称';
comment on column MODULELIST.moduleintro
  is '模具说明';
comment on column MODULELIST.guestcode
  is '客户番号';
comment on column MODULELIST.workpressure
  is '机台吨位';
comment on column MODULELIST.unitextrac
  is '单位取数';
comment on column MODULELIST.operateflag
  is '0新制作1设变修模';
comment on column MODULELIST.modulebarcode
  is '模具工号唯一号';
comment on column MODULELIST.plastic
  is '产品材质';
comment on column MODULELIST.excelindex
  is '所在电子表格的位置';
comment on column MODULELIST.combine
  is '1:单色模,2:双色模';
alter table MODULELIST
  add constraint MODULELIST_PK primary key (MODULEBARCODE);


create table MODULE_MATERIAL
(
  id           VARCHAR2(36) not null,
  materialid   VARCHAR2(36),
  materialname VARCHAR2(20),
  supplierid   VARCHAR2(36) not null
)
;
comment on column MODULE_MATERIAL.supplierid
  is '供货商电话';
alter table MODULE_MATERIAL
  add constraint MODULE_MATERIAL_PK primary key (ID);


create table PARALIST
(
  id       VARCHAR2(30),
  code     VARCHAR2(30),
  clen     VARCHAR2(48),
  csname   VARCHAR2(48),
  ctname   VARCHAR2(48),
  ename    VARCHAR2(48),
  shortcut VARCHAR2(20)
)
;
comment on column PARALIST.id
  is '流水号';
comment on column PARALIST.code
  is '代码';
comment on column PARALIST.clen
  is '长度';
comment on column PARALIST.csname
  is '简体名称';
comment on column PARALIST.ctname
  is '繁体名称';
comment on column PARALIST.ename
  is '英文名称';
comment on column PARALIST.shortcut
  is '简称';


create table PARTRACE
(
  id         VARCHAR2(36) not null,
  classcode  VARCHAR2(36) not null,
  chinaname  VARCHAR2(30),
  aboardname VARCHAR2(30),
  createtime DATE,
  creator    VARCHAR2(20),
  rtype      VARCHAR2(10)
)
;
comment on column PARTRACE.id
  is '模具零件种类永久ID号';
comment on column PARTRACE.classcode
  is '零件类别ID号';
comment on column PARTRACE.chinaname
  is '零件的中文名称';
comment on column PARTRACE.aboardname
  is '零件的外国名称';
comment on column PARTRACE.createtime
  is '创建日期';
comment on column PARTRACE.creator
  is '创建人ID';
comment on column PARTRACE.rtype
  is '0用于加工,1不用于加工';
alter table PARTRACE
  add constraint PARTRACE_PK primary key (ID);


create table PART_OUTBOUND
(
  id              VARCHAR2(48) not null,
  partlistbarcode VARCHAR2(48),
  stateid         VARCHAR2(20),
  applier         VARCHAR2(20),
  applytime       DATE,
  outcraftid      VARCHAR2(100),
  outcraftname    VARCHAR2(100),
  checker         VARCHAR2(20),
  checktime       DATE,
  backtime        DATE,
  charges         VARCHAR2(100),
  outfactoryid    VARCHAR2(20),
  outguestname    VARCHAR2(100),
  outaddress      VARCHAR2(100),
  applycomment    VARCHAR2(100),
  checkcomment    VARCHAR2(100),
  backcomment     VARCHAR2(100),
  recevier        VARCHAR2(20),
  moduleresumeid  VARCHAR2(48),
  currencyid      VARCHAR2(10),
  posid           VARCHAR2(30),
  outphone        VARCHAR2(30),
  contactor       VARCHAR2(30),
  outtime         DATE,
  outman          VARCHAR2(48),
  canceltime      DATE,
  cancelman       VARCHAR2(30),
  outcraftcode    VARCHAR2(48),
  isfinish        NUMBER default 0
)
;
comment on column PART_OUTBOUND.id
  is '外发签收唯一号';
comment on column PART_OUTBOUND.partlistbarcode
  is '外发工件号码';
comment on column PART_OUTBOUND.stateid
  is '签核状态';
comment on column PART_OUTBOUND.applier
  is '申请人';
comment on column PART_OUTBOUND.applytime
  is '申请时间';
comment on column PART_OUTBOUND.outcraftid
  is '外发工艺ID串(以分号隔开)';
comment on column PART_OUTBOUND.outcraftname
  is '外发工艺名称(以分号隔开)';
comment on column PART_OUTBOUND.checker
  is '核准人';
comment on column PART_OUTBOUND.checktime
  is '核准时间';
comment on column PART_OUTBOUND.backtime
  is '返厂时间';
comment on column PART_OUTBOUND.charges
  is '加工费用';
comment on column PART_OUTBOUND.outfactoryid
  is '外发加工厂ID号';
comment on column PART_OUTBOUND.outguestname
  is '外发工厂名称';
comment on column PART_OUTBOUND.outaddress
  is '外发工厂地址';
comment on column PART_OUTBOUND.applycomment
  is '申请者说明';
comment on column PART_OUTBOUND.checkcomment
  is '签核者说明';
comment on column PART_OUTBOUND.backcomment
  is '返厂说明';
comment on column PART_OUTBOUND.recevier
  is '工件返厂接收者ID号';
comment on column PART_OUTBOUND.moduleresumeid
  is '模具履历号';
comment on column PART_OUTBOUND.currencyid
  is '支付币别';
comment on column PART_OUTBOUND.posid
  is '申请部门';
comment on column PART_OUTBOUND.outphone
  is '外发联系电话';
comment on column PART_OUTBOUND.contactor
  is '外发联系人';
comment on column PART_OUTBOUND.outtime
  is '外发时间';
comment on column PART_OUTBOUND.outman
  is '外发模具负责人';
comment on column PART_OUTBOUND.canceltime
  is '取消时间';
comment on column PART_OUTBOUND.cancelman
  is '取消人';
comment on column PART_OUTBOUND.outcraftcode
  is '外发工艺代号';
comment on column PART_OUTBOUND.isfinish
  is '外发是否完成(0未完成,1已经完成)';
alter table PART_OUTBOUND
  add constraint PART_OUTBOUND_PK primary key (ID);


create table PROJECT_MODULE
(
  id           NUMBER not null,
  parentid     NUMBER,
  name         VARCHAR2(50),
  remark       VARCHAR2(150),
  iconcls      VARCHAR2(100),
  mainpanel    VARCHAR2(100),
  tabpanel     VARCHAR2(100),
  modulepath   VARCHAR2(100),
  moduledefine VARCHAR2(100),
  modulename   VARCHAR2(50),
  mpath        VARCHAR2(100)
)
;
comment on column PROJECT_MODULE.mainpanel
  is '模块主面板ID';
comment on column PROJECT_MODULE.tabpanel
  is '模块功能面板ID';
comment on column PROJECT_MODULE.modulepath
  is '模块所在的路径';
comment on column PROJECT_MODULE.moduledefine
  is '模块定义名';
alter table PROJECT_MODULE
  add constraint PROJECT_P_ID primary key (ID);


create table REGION_DEPART
(
  id     VARCHAR2(30) not null,
  name   VARCHAR2(48),
  cdate  DATE,
  empid  VARCHAR2(30),
  stepid VARCHAR2(36)
)
;
comment on column REGION_DEPART.id
  is '部门二维编号';
comment on column REGION_DEPART.name
  is '部门名称';
comment on column REGION_DEPART.cdate
  is '创建日期';
comment on column REGION_DEPART.empid
  is '创建人';
comment on column REGION_DEPART.stepid
  is '阶梯代号(最高18级)';
alter table REGION_DEPART
  add constraint REGION_DEPART_PK primary key (ID);


create table ROLE
(
  roleid     VARCHAR2(10) not null,
  rolename   VARCHAR2(20),
  createid   VARCHAR2(10),
  createtime DATE
)
;
comment on table ROLE
  is '角色表';
comment on column ROLE.roleid
  is '角色ID';
comment on column ROLE.rolename
  is '角色名称';
comment on column ROLE.createid
  is '建立者ID';
comment on column ROLE.createtime
  is '角色建立日期';
alter table ROLE
  add constraint ROLE_PK primary key (ROLEID);


create table ROLE_POS
(
  authposid VARCHAR2(36) not null,
  roleid    VARCHAR2(10) not null,
  authid    VARCHAR2(10) not null,
  posid     VARCHAR2(36) not null,
  workid    VARCHAR2(36),
  authok    VARCHAR2(4),
  rsv001    VARCHAR2(10),
  rsv002    VARCHAR2(10)
)
;
comment on column ROLE_POS.authok
  is '权限是否有效  0 无效  1 有效';
alter table ROLE_POS
  add constraint ROLE_POS_PK primary key (AUTHPOSID);


create table STATION
(
  id          VARCHAR2(36) not null,
  stationname VARCHAR2(15),
  stationcode VARCHAR2(10)
)
;
comment on table STATION
  is '岗位表';
alter table STATION
  add constraint STATION_PK primary key (ID);


create table SUB_FUNCTION
(
  id        VARCHAR2(36) not null,
  projectid NUMBER,
  text      VARCHAR2(30),
  path      VARCHAR2(200),
  iconcls   VARCHAR2(30)
)
;
alter table SUB_FUNCTION
  add constraint SUB_FUNCTION_PK primary key (ID);


create table WORK_ITEM
(
  workid   VARCHAR2(36) not null,
  workname VARCHAR2(30),
  jsname   VARCHAR2(20),
  jspath   VARCHAR2(100)
)
;
comment on column WORK_ITEM.workid
  is '工作ID';
alter table WORK_ITEM
  add constraint WORK_ITEM_PK primary key (WORKID);


insert into ACCOUNT_INFO (accountid, username, password, roleid, empid, createtime, valid, newauth)
values ('101140228008', '223004', '494AA8CADD60B13EAE4B27ADD8A7F813', '003', null, null, '1', null);
insert into ACCOUNT_INFO (accountid, username, password, roleid, empid, createtime, valid, newauth)
values ('101140228007', '31807', '71CF3273FB2456B4EA95F6E1563D1680', '001', null, null, '1', null);
commit;


insert into BARCODE_CONTEXT (id, bartypeid, printname, printcol, printtype, xseat, yseat, printwidth, printheight, barcodetype, rectline, rectlinewidth, fontsize, printtext)
values ('14061801', '14061803', '机台名称', 'name', 'text', 3, 2, 30, 6, null, null, null, 12, '传统放电');
insert into BARCODE_CONTEXT (id, bartypeid, printname, printcol, printtype, xseat, yseat, printwidth, printheight, barcodetype, rectline, rectlinewidth, fontsize, printtext)
values ('14061802', '14061803', '机台编号', 'batchno', 'text', 25, 2, 15, 6, null, null, null, 12, '1#机');
insert into BARCODE_CONTEXT (id, bartypeid, printname, printcol, printtype, xseat, yseat, printwidth, printheight, barcodetype, rectline, rectlinewidth, fontsize, printtext)
values ('14061803', '14061803', '机台条形码', 'barcode', 'barcode', 1, 7, 45, 13, '128Auto', null, null, null, '1031406180001');
insert into BARCODE_CONTEXT (id, bartypeid, printname, printcol, printtype, xseat, yseat, printwidth, printheight, barcodetype, rectline, rectlinewidth, fontsize, printtext)
values ('14061804', '14061800', '模具工号', 'modulecode', 'text', 1, 2, 30, 6, null, null, null, 12, 'C62-015T4');
insert into BARCODE_CONTEXT (id, bartypeid, printname, printcol, printtype, xseat, yseat, printwidth, printheight, barcodetype, rectline, rectlinewidth, fontsize, printtext)
values ('14061805', '14061800', '工件部号', 'partlistcode', 'text', 25, 2, 25, 6, null, null, null, 12, '201-1');
insert into BARCODE_CONTEXT (id, bartypeid, printname, printcol, printtype, xseat, yseat, printwidth, printheight, barcodetype, rectline, rectlinewidth, fontsize, printtext)
values ('14061806', '14061800', '工件条形码', 'partbarlistcode', 'barcode', 1, 7, 50, 16, '128Auto', null, null, null, '10314061800001');
insert into BARCODE_CONTEXT (id, bartypeid, printname, printcol, printtype, xseat, yseat, printwidth, printheight, barcodetype, rectline, rectlinewidth, fontsize, printtext)
values ('14061807', '14061801', '工号', 'worknumber', 'text', 25, 2, 30, 6, null, null, null, 12, '45125');
insert into BARCODE_CONTEXT (id, bartypeid, printname, printcol, printtype, xseat, yseat, printwidth, printheight, barcodetype, rectline, rectlinewidth, fontsize, printtext)
values ('14061808', '14061801', '姓名', 'empname', 'text', 3, 2, 20, 6, null, null, null, 12, '张某某');
insert into BARCODE_CONTEXT (id, bartypeid, printname, printcol, printtype, xseat, yseat, printwidth, printheight, barcodetype, rectline, rectlinewidth, fontsize, printtext)
values ('14061809', '14061801', '条形码', 'barcode', 'barcode', 3, 7, 40, 15, '128Auto', null, null, null, '103140618001');
insert into BARCODE_CONTEXT (id, bartypeid, printname, printcol, printtype, xseat, yseat, printwidth, printheight, barcodetype, rectline, rectlinewidth, fontsize, printtext)
values ('14061810', '14061802', '部门名称', 'text', 'text', 10, 2, 25, 6, null, null, null, 12, '磨床');
insert into BARCODE_CONTEXT (id, bartypeid, printname, printcol, printtype, xseat, yseat, printwidth, printheight, barcodetype, rectline, rectlinewidth, fontsize, printtext)
values ('14061811', '14061802', '部门条形码', 'barcode', 'barcode', 3, 7, 40, 12, '128Auto', null, null, null, '1030001');
insert into BARCODE_CONTEXT (id, bartypeid, printname, printcol, printtype, xseat, yseat, printwidth, printheight, barcodetype, rectline, rectlinewidth, fontsize, printtext)
values ('14061812', '14061804', '系统功能名称', 'name', 'text', 5, 2, 40, 20, null, null, null, 12, '开工');
insert into BARCODE_CONTEXT (id, bartypeid, printname, printcol, printtype, xseat, yseat, printwidth, printheight, barcodetype, rectline, rectlinewidth, fontsize, printtext)
values ('14061813', '14061804', '功能条形码', 'barcodeid', 'barcode', 5, 7, 40, 15, '128Auto', null, null, 0, '20101');
insert into BARCODE_CONTEXT (id, bartypeid, printname, printcol, printtype, xseat, yseat, printwidth, printheight, barcodetype, rectline, rectlinewidth, fontsize, printtext)
values ('14061815', '14061805', '工艺条形码', 'barcodeid', 'barcode', 3, 7, 40, 12, '128Auto', null, null, null, '201010');
insert into BARCODE_CONTEXT (id, bartypeid, printname, printcol, printtype, xseat, yseat, printwidth, printheight, barcodetype, rectline, rectlinewidth, fontsize, printtext)
values ('14061814', '14061805', '工艺名称', 'name', 'text', 3, 2, 30, 6, null, null, null, 12, '传统铣床');
commit;

insert into BARCODE_PAPER (id, papername, paperwidth, paperheight, leftgap, rightgap, papergap, papers, used, moduleid)
values ('14061813', '单张打印', 50, 25, 2, 2, 0, 1, 0, 1);
insert into BARCODE_PAPER (id, papername, paperwidth, paperheight, leftgap, rightgap, papergap, papers, used, moduleid)
values ('14061814', '两张打印', 50, 25, 2, 2, 2, 2, 1, 1);
commit;

insert into BARCODE_TYPE (bartypeid, barname, moduleid)
values ('14061803', '机台条形码格式', 1);
insert into BARCODE_TYPE (bartypeid, barname, moduleid)
values ('14061802', '部门条形码格式', 1);
insert into BARCODE_TYPE (bartypeid, barname, moduleid)
values ('14061801', '人员条形码格式', 1);
insert into BARCODE_TYPE (bartypeid, barname, moduleid)
values ('14061800', '工件条形码格式', 1);
insert into BARCODE_TYPE (bartypeid, barname, moduleid)
values ('14061804', '系统条形码格式', 1);
insert into BARCODE_TYPE (bartypeid, barname, moduleid)
values ('14061805', '工艺条形码格式', 1);
commit;

insert into DEVICE_DEPART (id, partid, deviceid, batchno, stateid, craftid, empid, launch)
values ('1031505160001', '1130006', '1021505160001', 1, '20102', '11201', null, null);
commit;

insert into DEVICE_DEPART_RESUME (id, partid, deviceid, batchno, operdate, operflag, operator, devpartid)
values ('0000', '1130006', '1021505160001', '1', to_date('16-05-2015 13:51:25', 'dd-mm-yyyy hh24:mi:ss'), 0, '101140228008', '1031505160001');
commit;

insert into DEVICE_INFO (id, devicetype, assetnumber, discriptions, createdate, isenable)
values ('1021505160001', '010102', '4654654', '0', to_date('16-05-2015 13:51:25', 'dd-mm-yyyy hh24:mi:ss'), '0');
commit;


insert into DEVICE_TYPE (id, name, createdate, creator)
values ('010112', '模拟热处理', to_date('29-05-2014 18:48:12', 'dd-mm-yyyy hh24:mi:ss'), null);
insert into DEVICE_TYPE (id, name, createdate, creator)
values ('010102', '传统铣床', to_date('10-01-2014 08:43:56', 'dd-mm-yyyy hh24:mi:ss'), null);
insert into DEVICE_TYPE (id, name, createdate, creator)
values ('010101', '平面磨床', to_date('10-01-2014 08:43:55', 'dd-mm-yyyy hh24:mi:ss'), null);
insert into DEVICE_TYPE (id, name, createdate, creator)
values ('010103', '传统放电', to_date('10-01-2014 08:43:56', 'dd-mm-yyyy hh24:mi:ss'), null);
insert into DEVICE_TYPE (id, name, createdate, creator)
values ('010109', '快走丝线割', to_date('14-04-2014 15:49:19', 'dd-mm-yyyy hh24:mi:ss'), null);
insert into DEVICE_TYPE (id, name, createdate, creator)
values ('010107', '坐标磨床', to_date('14-04-2014 15:49:19', 'dd-mm-yyyy hh24:mi:ss'), null);
insert into DEVICE_TYPE (id, name, createdate, creator)
values ('010108', '圆筒磨床', to_date('14-04-2014 15:49:19', 'dd-mm-yyyy hh24:mi:ss'), null);
insert into DEVICE_TYPE (id, name, createdate, creator)
values ('010110', '枪钻', to_date('14-04-2014 15:49:19', 'dd-mm-yyyy hh24:mi:ss'), null);
insert into DEVICE_TYPE (id, name, createdate, creator)
values ('010111', '车床', to_date('14-04-2014 15:49:19', 'dd-mm-yyyy hh24:mi:ss'), null);
insert into DEVICE_TYPE (id, name, createdate, creator)
values ('010106', '数控放电', to_date('14-04-2014 15:56:17', 'dd-mm-yyyy hh24:mi:ss'), null);
insert into DEVICE_TYPE (id, name, createdate, creator)
values ('010104', '数控铣床', to_date('14-04-2014 15:49:19', 'dd-mm-yyyy hh24:mi:ss'), null);
insert into DEVICE_TYPE (id, name, createdate, creator)
values ('010105', '慢走丝线割', to_date('14-04-2014 15:54:19', 'dd-mm-yyyy hh24:mi:ss'), null);
insert into DEVICE_TYPE (id, name, createdate, creator)
values ('010113', 'M', to_date('14-05-2015 11:10:33', 'dd-mm-yyyy hh24:mi:ss'), null);
commit;





insert into DS_STACK (stackid, stackname)
values ('001', '1号仓库');
insert into DS_STACK (stackid, stackname)
values ('002', '2号仓库');
insert into DS_STACK (stackid, stackname)
values ('003', '3号仓库');
commit;

insert into DS_STATE (stateid, statename)
values ('0001', '入库');
insert into DS_STATE (stateid, statename)
values ('0002', '出库');
commit;

insert into DUTIES (id, positionname)
values ('0003', '组长');
insert into DUTIES (id, positionname)
values ('0002', '带班');
insert into DUTIES (id, positionname)
values ('0001', '操作员');
commit;

insert into EMPLOYEE_INFO (id, worknumber, empname, posid, stationid, regioncode, phone, shortnumber, email, duty, isenable)
values ('101140228007', '31807', '徐维', '1130001', '111001', null, '13694948166', '666969', null, null, null);
insert into EMPLOYEE_INFO (id, worknumber, empname, posid, stationid, regioncode, phone, shortnumber, email, duty, isenable)
values ('101140228008', '223004', '张华', '1130002', '111000', null, null, null, null, null, null);
commit;

insert into EXCHANGE_RATE (id, short, cnames, enames, uptime, rate, upman, ishome)
values ('00001', 'CNY', '人民币', 'Chinese Yuan', to_date('30-05-2014 16:27:18', 'dd-mm-yyyy hh24:mi:ss'), '1', null, '0');
insert into EXCHANGE_RATE (id, short, cnames, enames, uptime, rate, upman, ishome)
values ('00002', 'USD', '美元', 'United States Dollar', to_date('30-05-2014 16:27:19', 'dd-mm-yyyy hh24:mi:ss'), '6.244', null, '1');
insert into EXCHANGE_RATE (id, short, cnames, enames, uptime, rate, upman, ishome)
values ('00003', 'HKD', '港币', 'HongKong Dollar', to_date('30-05-2014 16:27:20', 'dd-mm-yyyy hh24:mi:ss'), '0.8054', null, '1');
insert into EXCHANGE_RATE (id, short, cnames, enames, uptime, rate, upman, ishome)
values ('00005', 'GBP', '英镑', 'GreatBritain Pound', to_date('30-05-2014 16:27:20', 'dd-mm-yyyy hh24:mi:ss'), '10.4612', null, '1');
insert into EXCHANGE_RATE (id, short, cnames, enames, uptime, rate, upman, ishome)
values ('00006', 'JPY', '日元', 'Japanese Yen', to_date('30-05-2014 16:27:21', 'dd-mm-yyyy hh24:mi:ss'), '0.0614', null, '1');
commit;

insert into FACTORY (id, factorycode, shortname, fullname, factorytype, address, forwhich, contactor, phonenumber, faxnumber, createtime, creator, nature, isdeal, remark, email, currency)
values ('10800001', 'E', 'EPSON', 'EPSON', 2, '深圳南山', null, null, null, null, to_date('14-05-2015 11:25:25', 'dd-mm-yyyy hh24:mi:ss'), null, null, null, null, null, null);
insert into FACTORY (id, factorycode, shortname, fullname, factorytype, address, forwhich, contactor, phonenumber, faxnumber, createtime, creator, nature, isdeal, remark, email, currency)
values ('10800002', '01', '锴诚精密', '深圳锴诚精密模具有限公司', 1, '深圳锴诚精密模具有限公司', null, null, null, null, to_date('14-05-2015 13:00:56', 'dd-mm-yyyy hh24:mi:ss'), null, 3, null, null, null, 'RMB');
commit;

insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00125', '/module/inquire/getEmployeeProcessPartInformation', '查询员工加工工件明细', '0', '140725019');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00126', '/module/quality/addMeasurePart', '增加要测量的工件', '1', '140725013');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00127', '/module/base/findLocalRegionDepartment', '查询员工所在的部门', '0', '140725022');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00128', '/module/base/getCareerInfo', '获取员工职位', '0', '140725022');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00129', '/module/base/findEmployeeByWorkNumber', '按照工号匹配查找员工讯息', '0', '140725022');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00130', '/module/base/saveEmployeeInfo', '保存员工数据', '0', '140725022');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00131', 'module/base/saveStationInfo', '增加工作职位讯息', '1', '140725022');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00132', '/module/part/getCurrencyDepartmentMachineInfo', '获取本部门当前机台讯息', '0', '140725025');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00133', '/module/part/pauseCurrencyDepartMachine', '暂停本部门的机台(如午饭时间等)', '2', '140725025');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00134', '/module/part/getCurrentProcessMachinePartInfo', '获取机台的工件加工讯息', '0', '140725025');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00135', '/module/manage/getModulePartInformation', '获取所有的工件讯息', '0', '140725004');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00136', '/module/manage/getModuleWorkPieces', '查询将要新增的工件讯息', '0', '140725004');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00137', '/module/manage/modifyModuleInformation', '模具修改或者设变', '2', '140725004');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00138', '/module/schedule/queryPredictCraftSchedule', '查询预计要加工的模具排程讯息', '0', '140925001');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00139', '/module/manage/saveExcelPartInfo', '将模具讯息模板中数据导入系统中', '1', '140725004');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00140', '/module/schedule/getScheduleModuleInfo', '查询已经安排排程的模具讯息', '0', '140725018');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00141', '/module/schedule/saveOrUpateScheduleInfo', '修改排程日期或者复制排程讯息', '1', '140725018');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00142', '/module/part/getMatchModuleInfo', '查询已经导入工件的模具讯息', '0', '140725004');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00143', '/module/part/copyModulePartInfo', '为增番模具复制参考模具讯息', '1', '140725004');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00144', '/module/part/delModulePartInfo', '删除工件讯息', '3', '140725004');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00145', '/module/manage/getFinishModulePartInfo', '查询完工模具的工件讯息', '0', '141016021');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00147', '/module/inquire/findPartInfo', '查询当前加工的工件讯息', '0', '141029001');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00146', '/module/manage/proceedModuleFinish', '执行模具履历的完工动作', '2', '141016021');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00148', '/module/inquire/getLocalePartInfo', '查询本单位的工件讯息', '0', '140925001');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00149', '/module/inquire/getLocalePartSchedule', '获取本部门的工件排程讯息', '0', '140925001');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00150', '/module/inquire/getModuleCost', '查询模具的加工成本', '0', '141031001');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00151', '/module/inquire/getModuleResumeInfo', '查询模具的履历讯息', '0', '141031001');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00152', '/module/inquire/getModuleProcessCost', '获取模具每个履历的加工成本', '0', '141031001');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00153', '/module/process/groupModuleInfo', '查询加工流程中模具的基本讯息', '0', '140725015');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00154', '/module/inquire/queryModuleInfoByCase', '获取模具的加工详情', '0', '141111001');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00156', '/module/inquire/getAllModuleResumeInfo', '查询每套模具的所有加工讯息', '0', '141111001');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00155', '/module/inquire/getCurrentModuleInformation', '查询当前的模具讯息', '0', '141111001');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00157', '/module/part/getCurrentModulePartInfo', '获取当前的模具工件讯息', '0', '141203001');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00158', '/module/part/getModuleListData', '获取模具数据', '0', '141203001');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00159', '/module/part/getModulePartData', '获取工具类别数据', '0', '141203001');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00160', '/module/part/getStackListData', '获取仓库数据', '0', '141203001');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00161', '/module/part/addModulePartData', '新增工件数据', '1', '141203001');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00179', '/module/part/getOutBoundPartInfo', '获取外发工件的相关资料', '0', '140725012');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00186', '/module/part/getModuleResumeSectionInfo', '获取模具加工的阶段性工件讯息', '0', '140725004');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00163', '/module/base/getLocaleEmployeeInfo', '获取本单位员工的基本讯息', '0', '141229001');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00164', '/module/base/saveLocaleEmployeeInfo', '获取员工的基本数据讯息', '1', '141229001');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00169', '/module/manage/generateModuleCode', '生成工件编号', '1', '140725001');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00171', '/module/base/accountInfoList', '查询用户登陆账号信息', '1', '140725022');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00172', '/module/base/updateAccountInfo', '更新登录账号信息', '2', '140725022');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00173', '/module/base/updateAccountInfo', '更改模具工件', '1', '150306001');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00174', '/module/manage/onModifyPartCount', '更新工件的数量', '2', '140725004');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00175', '/module/manage/generateModuleCode', '生成工件编号', '1', '140725001');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00176', '/module/schedule/autoCraftPlan', '保存预设工件的排程', '0', '140725018');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00177', '/module/manage/uploadModulePartBom', '解析Excel文件中的工件讯息', '0', '140725004');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00178', '/module/manage/queryModuleByCondition', '查询模具数据', '0', '140725005');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00185', '/module/part/getModuleSectionInfo', '获取模具的阶段加工讯息', '0', '140725004');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00187', '/module/part/saveModuleSectionInfo', '新增或者更新模具履历阶段讯息', '1', '140725004');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00162', '/module/base/getLocaleSubDepartment', '获取本单位以及子单位资料', '0', '141229001');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00165', '/module/base/deleteLocaleEmployeeInfo', '删除本单位的员工讯息', '2', '141229001');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00167', '/module/schedule/autoCraftPlan', '保存预设工件的排程', '0', '140725018');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00168', '/module/manage/uploadModulePartBom', '解析Excel文件中的工件讯息', '0', '140725004');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00182', '/module/part/saveOutBoundApplyCancel', '工件外发取消', '2', '140725012');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00181', '/module/part/saveOutBoundApplyUncheck', '工件外发驳回', '2', '140725012');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00180', '/module/part/saveOutBoundApplyCheck', '工件外发签核', '2', '140725012');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00184', '/module/part/saveOutBoundApplyBack', '工件外发回收', '2', '140725012');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00183', '/module/part/saveOutBoundApplyOut', '工件执行外发', '2', '140725012');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00166', '/module/manage/onModifyPartCount', '更新工件的数量', '2', '140725004');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00108', '/module/quality/query', '查询', '1', '140725013');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00110', '/module/quality/getMeasureTools', '查询精测工具讯息', '0', '140725013');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00093', '/module/part/getOutBoundDetails', '查询外发明细', '0', '140725012');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00097', '/module/part/outBoundBackDone', '更新工件的外发回收状态', '2', '140725012');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00098', '/module/part/outBoundCancel', '更新工件的外发为取消状态', '2', '140725012');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00099', '/module/code/queryBarcodePaper', '查询模块所对应的条形码纸张', '0', '140725006');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00103', '/module/code/updateBarcodePaper', '更新打印纸属性', '2', '140725006');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00104', '/module/code/updateBarcodeContext', '更新打印内容格式属性', '2', '140725006');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00109', '/module/quality/queryDepartmentStaff', '获取部门所有成员', '0', '140725013');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00082', '/module/code/systemBarcode', '查询系统条形码', '0', '140725011');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00040', '/module/manage/saveNewModuleData', '新模基本数据建立', '1', '140725001');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00052', '/module/manage/saveDeviceClassfic', '设置模具加工机台种类', '1', '140107001');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00077', '/module/part/deptPartTimeline', '查询本单位当前现在工件信息', '0', '140725016');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00078', '/module/schedule/deptEvaluateTime', '设置工件的加工工时', '2', '140725017');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00005', '/module/base/deleteRole', '根据ID,删除角色信息', '3', '140725022');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00004', '/module/manage/updateModuleIntroduce', '更新模具数据', '2', '140725005');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00002', '/module/schedule/moduleResumePlanGantt', '查询模具排程', '0', '140725014');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00043', '/module/manage/updateModuleIntroduce', '更新模具数据', '2', '140725001');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00081', '/module/code/modulePartList', '查询要打印条形码的工件信息', '0', '140725010');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00085', '/module/code/machineBarcode', '查询模具加工机台条形码', '0', '140725008');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00087', '/module/manage/getModuleForOutBound', '查询工艺集合信息', '0', '140725012');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00061', '/module/manage/addRegionPartment', '新增厂区部门', '1', '140725002');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00062', '/module/manage/getPackageCrafts', '查询模具加工工艺', '0', '140725002');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00070', '/module/schedule/createCraftSet', '增加预设工艺排程', '1', '140725018');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00071', '/module/schedule/deleteCraftSet', '删除预设工艺排程', '3', '140725018');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00089', '/module/manage/getDeviceFacotry', '查询外发工艺的厂商代号', '0', '140725012');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00092', '/module/part/saveOutBoundApply', '保存外发申请记录', '1', '140725012');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00031', '/module/process/moduleSignPart', '获取要签收的工件信息', '0', '140725016');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00032', '/module/process/verifySignPart', '签收模具工件(手动)', '2', '140725016');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00034', '/module/process/groupModuleInfo', '得到当前加工单位的模具工号', '0', '140725016');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00036', '/module/process/groupPartListInfo', '加工单位相关工艺工件列表', '0', '140725016');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00054', '/module/manage/queryDevicesByPart', '查询部门设备的工艺等相关讯息', '0', '131223016');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00056', '/module/base/updateFactory', '更新厂商数据', '2', '140725002');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00059', '/module/manage/addDeviceType', '新增设备类型', '1', '140725003');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00066', '/module/schedule/createCraftPlan', '增加工艺排程', '0', '140725018');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00069', '/module/schedule/craftSet', '查询工艺集合信息', '0', '140725018');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00072', '/module/schedule/updateCraftSet', '更改预设工艺排程', '2', '140725018');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00073', '/module/manage/getAllFactoryDevice', '查询厂区设备讯息', '0', '140725003');
commit;

insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00076', '/module/manage/delDevices', '删除设备数据', '3', '140725003');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00079', '/module/part/saveEvaluation', '设置模具工件的加工工时', '2', '140725017');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00083', '/module/code/employeeBarcode', '查询部门和员工条形码', '0', '140725009');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00084', '/module/code/deptBarcode', '查询部门条形码', '0', '140725009');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00091', '/module/part/saveOutBoundFactoryInfo', '增加工件外发厂商', '1', '140725012');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00080', '/module/code/machineBarcode', '查询机台的条形码号', '0', '140725008');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00030', '/module/base/insertAuthority', '新增相对路径', '1', '140725022');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00090', '/module/part/getExchangeRate', '回去当前货币汇率讯息', '0', '140725012');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00042', '/module/manage/queryModuleByCase', '按条件查询模具基本信息', '0', '140725001');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00053', '/module/manage/getRegionPartForAddition', '查询机台部门', '0', '131223016');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00055', '/module/manage/getDeviceFacotry', '查询设备管理的厂区', '0', '140725003');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00060', '/module/manage/getPackageRegionDeparment', '查询厂区部门树结构', '0', '140725002');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00064', '/module/base/queryFactory', '查询厂商数据', '0', '140725002');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00067', '/module/schedule/removeCraftPlan', '删除加工工艺排程', '3', '140725018');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00068', '/module/schedule/craftPlanGantt', '查询工件排程甘特图信息', '0', '140725018');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00074', '/module/base/deleteFactory', '删除除厂商资料', '3', '140725002');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00075', '/module/manage/updateDevices', '更新机台设备讯息', '2', '140725003');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00046', '/module/manage/createModuleNewParts', '新增新模工件资料', '1', '140725004');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00086', '/module/schedule/evaluateTime', '设置工件的加工工时', '2', '140725018');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00088', '/module/schedule/queryScheudle', '查询模具排程', '0', '140725015');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00011', '/module/base/insertFactory', '新增厂商数据信息', '1', '140725002');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00018', '/module/schedule/craftTime', '设置工艺的开工与完工时间', '1', '140725018');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00033', '/module/manage/estimateModuleCode', '新模工号建立', '1', '140725001');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00044', '/module/manage/getNewModuleForPart', '按要求查询模具工号', '0', '140725004');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00063', '/module/manage/addCrafts', '新增工艺资料', '1', '140725002');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00065', '/module/part/modifyExitsPart', '增加修模或设变要加工的工件', '1', '140725004');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00094', '/module/part/updateOutBoundInfo', '更新外发工件讯息', '2', '140725012');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00101', '/module/code/deleteBarcodePaper', '删除条形码纸', '3', '140725006');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00102', '/module/code/queryBarcodeFormat', '查询条形码打印格式', '1', '140725006');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00105', '/module/base/insertRole', '新增角色', '1', '140725022');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00106', '/module/base/insertAccountInfo', '新增用户', '1', '140725022');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00107', '/module/code/useBarcodeParper', '设置条形码打印使用纸张', '2', '140725006');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00095', '/module/part/getRegionDepartOfMetal', '获取金型部的所有部门', '0', '140725012');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00096', '/module/part/updateOutBoundAboard', '将外发工件设置为外发状态', '2', '140725012');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00100', '/module/code/saveBarcodePaper', '新增和修改条形码纸张属性', '1', '140725006');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00113', '/module/quality/saveMeasurePicture', '提交模具测量图片', '1', '140725013');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00111', '/module/query/getMachineProcessInfo', '查询机台加工讯息', '0', '140725020');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00112', '/module/quality/cropMeasurePicture', '裁剪测量图片', '1', '140725013');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00114', '/module/inquire/getModuleCodeList', '查询指定的模具工号', '0', '140725020');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00115', '/module/inquire/getModuleResumeInfo', '查询指定的模具履历', '0', '140725020');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00116', '/module/inquire/getModuleResumePartList', '查询模具履历中的工件集合', '0', '140725020');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00117', 'module/inquire/getTotalPartProcessInfo', '查询工件的排程以及加工讯息', '0', '140725020');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00118', '/module/quality/queryPartThreeMeasure', '查询三次元测量图片', '1', '140725013');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00119', 'module/inquire/getModuleProcessDetails', '查询工件的加工明细', '0', '140725020');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00120', '/module/quality/deleteMeasurePicture', '删除测量图片', '3', '140725013');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00121', '/module/inquire/getProcessModuleCodeList', '查询正在加工的模具工号', '0', '140725021');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00122', '/module/inquire/getCurrentProcessModuleInfo', '获取模具工件的加工？容', '0', '140725021');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00123', '/module/inquire/getUserCurrentRegionDepartment', '查询当前用户所在的厂区部门', '0', '140725019');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00124', '/module/inquire/getEmployeeProcessInformation', '查询员工的加工明细(D卡)', '0', '140725019');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00188', '/module/base/authorityList', '查詢功能路徑列表', '0', '140725022');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00189', '/module/base/deleteAuthority', '刪除功能路徑', '3', '140725022');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00190', '/module/base/deleteRolePos', '刪除用戶登錄權限', '3', '140725022');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00191', '/module/base/updateAuthority', '更新功能路徑信息', '2', '140725022');
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid)
values ('00192', '/module/base/deleteAccountInfo', '删除用户登录账号', '3', '140725022');
commit;

insert into MAIN_PROJECT (id, name, filepath, icon, remark, finelname)
values ('00001', '模具制造', 'js/module', null, null, 'ModuleProject.js');
commit;


insert into MD_CRAFT (craftcode, craftname, craftrank, craftinfo, id, craftid)
values ('GGG', 'GGG', null, '1', '11221', '14');
insert into MD_CRAFT (craftcode, craftname, craftrank, craftinfo, id, craftid)
values ('GT', '抛光', null, '300', '11217', '01');
insert into MD_CRAFT (craftcode, craftname, craftrank, craftinfo, id, craftid)
values ('KF', '组立', null, '40', '11218', '02');
insert into MD_CRAFT (craftcode, craftname, craftrank, craftinfo, id, craftid)
values ('M', '传统铣床', null, '45', '11201', '03');
insert into MD_CRAFT (craftcode, craftname, craftrank, craftinfo, id, craftid)
values ('SG', '平面研磨', null, '50', '11205', '04');
insert into MD_CRAFT (craftcode, craftname, craftrank, craftinfo, id, craftid)
values ('H', '热处理', null, '120', '11207', '05');
insert into MD_CRAFT (craftcode, craftname, craftrank, craftinfo, id, craftid)
values ('CNC', '数控铣床', null, '95', '11208', '06');
insert into MD_CRAFT (craftcode, craftname, craftrank, craftinfo, id, craftid)
values ('WE', '线割', null, '95', '11211', '07');
insert into MD_CRAFT (craftcode, craftname, craftrank, craftinfo, id, craftid)
values ('EDM', '传统放电', null, '60', '11212', '08');
insert into MD_CRAFT (craftcode, craftname, craftrank, craftinfo, id, craftid)
values ('NCE', '数控放电', null, '80', '11213', '09');
insert into MD_CRAFT (craftcode, craftname, craftrank, craftinfo, id, craftid)
values ('QM', '精测', null, '60', '11214', '10');
insert into MD_CRAFT (craftcode, craftname, craftrank, craftinfo, id, craftid)
values ('L', '车床', null, '40', '11215', '11');
insert into MD_CRAFT (craftcode, craftname, craftrank, craftinfo, id, craftid)
values ('JG', '坐标磨床', null, '200', '11219', '12');
insert into MD_CRAFT (craftcode, craftname, craftrank, craftinfo, id, craftid)
values ('OG', '圆筒磨床', null, '65', '11220', '13');
commit;

insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1406250001', null, null, null, null, null, null, '母模仁');
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1406250002', '1406250001', '11201', null, 24, 1, 0, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1406250003', '1406250001', '11208', null, 24, 1, 1, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1406250004', '1406250001', '11207', null, 24, 1, 2, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1406250005', '1406250001', '11205', null, 48, 1, 3, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1406250006', '1406250001', '11208', null, 48, 1, 4, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1406250007', '1406250001', '11211', null, 72, 1, 5, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1406250008', '1406250001', '11213', null, 72, 1, 6, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1406250009', '1406250001', '11214', null, 10, 1, 7, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1406260001', null, null, null, null, null, null, '公模仁');
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1406260002', '1406260001', '11201', null, 24, 1, 0, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409120021', '1406260001', '11208', null, 24, 1, 3, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409120024', '1409120023', '11201', null, 8, 1, 0, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1406260005', '1406260001', '11205', null, 24, 1, 5, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409120033', '1406260001', '11214', null, 24, 1, 7, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409120018', '1406260001', '11211', null, 24, 1, 14, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1406260008', '1406260001', '11208', null, 24, 1, 11, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1407280001', null, null, null, null, null, null, '母模板');
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1407280002', '1407280001', '11205', null, 20, 10, 0, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1407280003', '1407280001', '11201', null, 36, 10, 2, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1407280004', '1407280001', '11208', null, 48, 10, 1, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1407280005', '1407280001', '11211', null, 48, 10, 3, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1407280006', null, null, null, null, null, null, '上顶出板');
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1407280007', '1407280006', '11205', null, 24, 48, 0, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1407280008', '1407280006', '11201', null, 24, 54, 1, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1407280009', '1407280006', '11211', null, 24, 40, 2, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1407280010', null, null, null, null, null, null, '定位环');
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1407280011', '1407280010', '11215', null, 24, 1, 0, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1407280015', '1407280013', '11205', null, 24, 48, 1, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1407280013', null, null, null, null, null, null, '固定块');
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1407280014', '1407280013', '11201', null, 24, 48, 0, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1407280016', null, null, null, null, null, null, '支撑柱');
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1407280017', '1407280016', '11215', null, 24, 24, 0, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1407280018', '1407280016', '11205', null, 24, 1, 1, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1407280019', null, null, null, null, null, null, '灌嘴');
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1407280020', '1407280019', '11215', null, 10, 1, 0, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1407280021', '1407280019', '11201', null, 5, 6, 1, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1407280022', '1407280019', '11207', null, 24, 24, 2, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1407280023', '1407280019', '11205', null, 48, 48, 3, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1407280024', '1407280019', '11211', null, 24, 48, 4, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409030001', null, null, null, null, null, null, '上固定板');
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409030002', '1409030001', '11205', null, 24, 17, 0, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409030003', '1409030001', '11208', null, 64, 10, 1, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409030004', '1409030001', '11201', null, 64, 10, 2, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409090001', null, null, null, null, null, null, '入子');
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409090002', '1409090001', '11205', null, 32, 1, 0, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409090003', '1409090001', '11212', null, 43, 1, 1, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409090004', null, null, null, null, null, null, '外拉杆');
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409090005', '1409090004', '11201', null, 24, 1, 0, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409100003', '1409100001', '11201', null, 48, 36, 1, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409090007', '1409090004', '11211', null, 24, 1, 1, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409100001', null, null, null, null, null, null, '模脚');
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409100002', '1409100001', '11205', null, 24, 36, 0, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409100004', null, null, null, null, null, null, '线割入子');
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409100005', '1409100004', '11211', null, 24, 24, 0, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409100006', '1409100004', '11205', null, 24, 24, 1, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409100007', '1409100004', '11212', null, 64, 24, 2, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409100008', '1409100004', '11214', null, 10, 5, 4, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409120001', null, null, null, null, null, null, '滑座');
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409120002', '1409120001', '11201', null, 10, 10, 0, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409120003', '1409120001', '11207', null, 24, 48, 1, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409120004', '1409120001', '11205', null, 16, 40, 2, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409120005', '1409120001', '11211', null, 10, 40, 3, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409120006', '1409120001', '11208', null, 2, 10, 4, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409120007', null, null, null, null, null, null, 'M-H-SG-NC');
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409120008', '1409120007', '11201', null, 8, 10, 0, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409120009', '1409120007', '11207', null, 24, 48, 1, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409120010', '1409120007', '11205', null, 12, 40, 2, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409120011', '1409120007', '11208', null, 2, 40, 3, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409120012', null, null, null, null, null, null, 'L-H-SG');
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409120013', '1409120012', '11215', null, 10, 1, 0, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409120014', '1409120012', '11207', null, 24, 36, 1, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409120015', '1409120012', '11205', null, 14, 1, 2, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409120016', null, null, null, null, null, null, 'SG');
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409120017', '1409120016', '11205', null, 10, 1, 0, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409120019', '1406260001', '11212', null, 24, 1, 12, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409120022', '1406260001', '11207', null, 24, 1, 2, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409120023', null, null, null, null, null, null, '斜销顶杆');
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409120025', '1409120023', '11207', null, 24, 1, 1, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409120026', '1409120023', '11205', null, 24, 10, 2, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409120027', '1409120023', '11211', null, 24, 20, 3, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409120028', '1409120023', '11208', null, 4, 5, 4, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409120029', '1409100004', '11208', null, 4, 1, 3, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409120035', '1409120034', '11205', null, 20, 49, 0, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409120034', null, null, null, null, null, null, 'SG-EDM-WE-QM');
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409120036', '1409120034', '11212', null, 48, 36, 1, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409120038', '1409120034', '11211', null, 6, 20, 2, null);
insert into MD_CRAFT_SET (id, setid, craftid, roleid, duration, gap, ranknum, setname)
values ('1409120039', '1409120034', '11214', null, 6, 5, 3, null);
commit;





insert into MD_MACHINE_INFO (id, macload)
values ('1021505160001', 20);
commit;










insert into MD_PROCESS_STATE (id, name, info, type)
values ('20407', '修模/設變', '模具維修和設變混合加工', '1');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('20208', '簽收', '簽收工件', '1');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('20210', '完成', '工件完成', '1');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('20209', '完工', '工件完工', '0');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('30101', '保存資料', '保存資料', '0');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('30102', '關閉視窗', '關閉系統視窗，隱藏', '0');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('30103', '清空全部', '清空所有的新增工件', '0');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('30104', '加工模式', '操機員可執行的操作模式', '0');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('30105', '簽收模式', '進行簽收或者報廢的模式', '0');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('30106', 'T', '設置臨時排程', '1');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('30107', '選擇排程', '選擇合適的工藝排程', '0');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('30108', '合併加工', '如果沒合併則設置合併，否則不合併', '0');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('30109', '全部完工', '將開工的工件設置為完工', '0');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('20601', '申请中', '外發申請中', '1');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('20404', '停止', '因為某種原因導致模具加工暫停', '1');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('20602', '已核准', '核准外發', '1');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('20603', '已驳回', '不同意外發', '1');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('20604', '外发中', '工件外發中', '1');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('20605', '已完成', '外發完成', '1');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('20101', '設備開啟', '機台為停機狀態', '0');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('20102', '設備關閉', '機台處在加工工件中', '0');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('20103', '設備保養', '機台達到負荷上限，在保養當中', '0');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('20104', '設備維修', '機台狀態為維修狀態', '0');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('20201', '開工', '開始加工', '0');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('20202', '暫停', '模具工件暫停加工', '1');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('20203', '停工', '工件停工', '0');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('20204', '接收', '機台接收工件', '1');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('20205', '外發', '工件外發', '1');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('30110', '全部停工', '工件全部停止下機，工藝未完成', '0');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('20301', '上機操作', '上機操作機台', '1');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('20302', '下機操作', '下機停止操作', '1');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('20401', '新模', '新增模具狀態', '1');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('20402', '修模', '修改模具狀態', '1');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('20405', '報廢', '模具報廢', '1');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('20403', '設變', '設變', '1');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('20105', '設備報廢', '報廢', '1');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('20206', '報廢', '工件報廢', '1');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('20207', '取消', '取消工件', '0');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('20303', '工件簽收', '簽收', '0');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('20304', '工件外發', '外發', '1');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('20305', '工件報廢', '報廢', '0');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('20501', '正常加工', '單個工件的加工', '1');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('20502', '同步加工', '同一機台不同時間', '1');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('20503', '合併加工', '略', '1');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('20606', '已取消', '外發取消', '1');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('20306', '執行完工', '完工', '0');
insert into MD_PROCESS_STATE (id, name, info, type)
values ('20406', '完成', '加工完成', '1');
commit;

insert into MD_RESUME (id, curestate, resumestate, resumeempid, starttime, endtime, remark, modulebarcode)
values ('0000', '1', '20401', null, to_date('14-05-2015', 'dd-mm-yyyy'), to_date('31-05-2015', 'dd-mm-yyyy'), null, '1051505140001');
insert into MD_RESUME (id, curestate, resumestate, resumeempid, starttime, endtime, remark, modulebarcode)
values ('0000', '1', '20401', null, to_date('14-05-2015 08:00:00', 'dd-mm-yyyy hh24:mi:ss'), to_date('16-05-2015 08:00:00', 'dd-mm-yyyy hh24:mi:ss'), '234234234', '1051505140003');
insert into MD_RESUME (id, curestate, resumestate, resumeempid, starttime, endtime, remark, modulebarcode)
values ('0000', '1', '20401', null, to_date('15-05-2015 08:00:00', 'dd-mm-yyyy hh24:mi:ss'), to_date('15-05-2015 08:00:00', 'dd-mm-yyyy hh24:mi:ss'), null, '1051505140004');
insert into MD_RESUME (id, curestate, resumestate, resumeempid, starttime, endtime, remark, modulebarcode)
values ('0001', '1', '20401', null, to_date('15-05-2015 08:00:00', 'dd-mm-yyyy hh24:mi:ss'), to_date('15-05-2015 08:00:00', 'dd-mm-yyyy hh24:mi:ss'), null, '1051505140007');
insert into MD_RESUME (id, curestate, resumestate, resumeempid, starttime, endtime, remark, modulebarcode)
values ('0002', '1', '20401', null, to_date('15-05-2015', 'dd-mm-yyyy'), to_date('15-05-2015', 'dd-mm-yyyy'), null, '1051505140011');
commit;

insert into MD_RESUME_RECORD (id, modulebarcode, resumestate, resumetime, resumeempid, starttime, endtime, finishtime, remark)
values ('0000', '1051505140001', '20401', to_date('14-05-2015 11:28:03', 'dd-mm-yyyy hh24:mi:ss'), null, to_date('14-05-2015', 'dd-mm-yyyy'), to_date('31-05-2015', 'dd-mm-yyyy'), null, null);
insert into MD_RESUME_RECORD (id, modulebarcode, resumestate, resumetime, resumeempid, starttime, endtime, finishtime, remark)
values ('0000', '1051505140003', '20401', to_date('14-05-2015 13:22:43', 'dd-mm-yyyy hh24:mi:ss'), null, to_date('14-05-2015 08:00:00', 'dd-mm-yyyy hh24:mi:ss'), to_date('16-05-2015 08:00:00', 'dd-mm-yyyy hh24:mi:ss'), null, '234234234');
insert into MD_RESUME_RECORD (id, modulebarcode, resumestate, resumetime, resumeempid, starttime, endtime, finishtime, remark)
values ('0000', '1051505140004', '20401', to_date('14-05-2015 14:04:53', 'dd-mm-yyyy hh24:mi:ss'), null, to_date('15-05-2015 08:00:00', 'dd-mm-yyyy hh24:mi:ss'), to_date('15-05-2015 08:00:00', 'dd-mm-yyyy hh24:mi:ss'), null, null);
insert into MD_RESUME_RECORD (id, modulebarcode, resumestate, resumetime, resumeempid, starttime, endtime, finishtime, remark)
values ('0001', '1051505140007', '20401', to_date('14-05-2015 14:08:40', 'dd-mm-yyyy hh24:mi:ss'), null, to_date('15-05-2015 08:00:00', 'dd-mm-yyyy hh24:mi:ss'), to_date('15-05-2015 08:00:00', 'dd-mm-yyyy hh24:mi:ss'), null, null);
insert into MD_RESUME_RECORD (id, modulebarcode, resumestate, resumetime, resumeempid, starttime, endtime, finishtime, remark)
values ('0002', '1051505140011', '20401', to_date('14-05-2015 14:18:51', 'dd-mm-yyyy hh24:mi:ss'), null, to_date('15-05-2015', 'dd-mm-yyyy'), to_date('15-05-2015', 'dd-mm-yyyy'), null, null);
commit;





insert into MEASURETOOLS (id, name, code)
values ('140628009', '目視', 'E');
insert into MEASURETOOLS (id, name, code)
values ('140628008', '嚙合試驗機', 'GR');
insert into MEASURETOOLS (id, name, code)
values ('140628007', '測微計', 'M');
insert into MEASURETOOLS (id, name, code)
values ('140628006', '厚薄規', 'TG');
insert into MEASURETOOLS (id, name, code)
values ('140628005', '三次元', '3M');
insert into MEASURETOOLS (id, name, code)
values ('140628004', '指針高度計', 'D');
insert into MEASURETOOLS (id, name, code)
values ('140628003', '塞規', 'PG');
insert into MEASURETOOLS (id, name, code)
values ('140628002', '工具顯微鏡', 'ME');
insert into MEASURETOOLS (id, name, code)
values ('140628010', '真圓度機', 'RA');
insert into MEASURETOOLS (id, name, code)
values ('140628011', '投影機', 'P');
insert into MEASURETOOLS (id, name, code)
values ('140628013', '千分錶', 'VB');
insert into MEASURETOOLS (id, name, code)
values ('140628012', '2.5次元', '2.5D');
insert into MEASURETOOLS (id, name, code)
values ('140628001', '卡尺', 'DN');
commit;

insert into MODULELIST (posid, modulecode, guestid, moduleclass, inittrytime, facttrytime, createyear, createmonth, createtime, creator, modulestate, takeon, starttime, monthno, pictureurl, modulestyle, productname, moduleintro, guestcode, workpressure, unitextrac, operateflag, modulebarcode, plastic, filename, excelindex, combine)
values ('1130001', 'KC1505E23', '10800001', 'qwer', to_date('15-05-2015', 'dd-mm-yyyy'), null, null, null, null, '223004', '0', '31807', to_date('15-05-2015', 'dd-mm-yyyy'), null, '徐维', null, 'qwer', '67asfasdf', 'rqwer', 10, '3', '0', '1051505140011', 'qwer', null, null, 1);
commit;


insert into PARALIST (id, code, clen, csname, ctname, ename, shortcut)
values ('0002', '30105', '5', '高级模式', '高级模式', 'SUPER_MODE', 'ME_SP');
insert into PARALIST (id, code, clen, csname, ctname, ename, shortcut)
values ('0001', '30104', '5', '标准模式', '标准模式', 'REGULAR_MODE', 'ME_ST');
insert into PARALIST (id, code, clen, csname, ctname, ename, shortcut)
values ('0003', '20301', '5', '上机', '上机', 'EMP_UP', 'EE_UP');
insert into PARALIST (id, code, clen, csname, ctname, ename, shortcut)
values ('0004', '20302', '5', '下机', '下机', 'EMP_DOWN', 'EE_DN');
insert into PARALIST (id, code, clen, csname, ctname, ename, shortcut)
values ('0005', '20303', '5', '签收', '签收', 'PART_SIGN', 'EE_SN');
insert into PARALIST (id, code, clen, csname, ctname, ename, shortcut)
values ('0006', '20304', '5', '外发', '外发', 'PART_OUT', 'EE_OT');
insert into PARALIST (id, code, clen, csname, ctname, ename, shortcut)
values ('0007', '20305', '5', '报废', '报废', 'PART_RUIN', 'EE_RN');
insert into PARALIST (id, code, clen, csname, ctname, ename, shortcut)
values ('0008', '20101', '5', '开启', '开启', 'MACHINE_LAUNCH', 'MC_LH');
insert into PARALIST (id, code, clen, csname, ctname, ename, shortcut)
values ('0009', '20102', '5', '关闭', '关闭', 'MACHINE_SHUT', 'MC_ST');
insert into PARALIST (id, code, clen, csname, ctname, ename, shortcut)
values ('0010', '20103', '5', '保养', '保养', 'MACHINE_MAINTAIN', 'MC_MN');
insert into PARALIST (id, code, clen, csname, ctname, ename, shortcut)
values ('0011', '20104', '5', '维修', '维修', 'MACHINE_MEND', 'MC_MD');
insert into PARALIST (id, code, clen, csname, ctname, ename, shortcut)
values ('0012', '20201', '5', '开工', '开工', 'PART_START', 'PT_ST');
insert into PARALIST (id, code, clen, csname, ctname, ename, shortcut)
values ('0013', '20202', '5', '暂停', '暂停', 'PART_SUSPEND', 'PT_SD');
insert into PARALIST (id, code, clen, csname, ctname, ename, shortcut)
values ('0014', '20203', '5', '停止', '停止', 'PART_STOP', 'PT_SP');
insert into PARALIST (id, code, clen, csname, ctname, ename, shortcut)
values ('0015', '20204', '5', '接收', '接收', 'PART_RECEIVE', 'PT_RE');
insert into PARALIST (id, code, clen, csname, ctname, ename, shortcut)
values ('0016', '20205', '5', '外发', '外发', 'PART_OUTBOUND', 'PT_OD');
insert into PARALIST (id, code, clen, csname, ctname, ename, shortcut)
values ('0017', '20206', '5', '报废', '报废', 'PART_RUIN', 'PT_RN');
insert into PARALIST (id, code, clen, csname, ctname, ename, shortcut)
values ('0018', '20207', '5', '取消', '取消', 'PART_CANCEL', 'PT_CL');
insert into PARALIST (id, code, clen, csname, ctname, ename, shortcut)
values ('0019', '20208', '5', '签收', '签收', 'PART_SIGN', 'PT_SN');
insert into PARALIST (id, code, clen, csname, ctname, ename, shortcut)
values ('0020', '30101', '5', '保存动作', '保存动作', 'ACTION_SAVE', 'AT_SE');
insert into PARALIST (id, code, clen, csname, ctname, ename, shortcut)
values ('0021', '30102', '5', '关闭动作', '关闭动作', 'ACTION_SHUT', 'AT_ST');
insert into PARALIST (id, code, clen, csname, ctname, ename, shortcut)
values ('0022', '20501', '5', '正常加工', '正常加工', 'COMMON_DO', 'PS_CD');
insert into PARALIST (id, code, clen, csname, ctname, ename, shortcut)
values ('0023', '20502', '5', '同步加工', '同步加工', 'SYN_DO', 'PS_SD');
insert into PARALIST (id, code, clen, csname, ctname, ename, shortcut)
values ('0024', '20503', '5', '合并加工', '合并加工', 'MERGE_DO', 'PS_MD');
insert into PARALIST (id, code, clen, csname, ctname, ename, shortcut)
values ('0025', '101', '12', '员工识别代号', '员工识别代号', 'DISCERN_EMP', 'DN_EE');
insert into PARALIST (id, code, clen, csname, ctname, ename, shortcut)
values ('0026', '102', '13', '机台识别代号', '机台识别代号', 'DISCERN_MACHINE', 'DN_ME');
insert into PARALIST (id, code, clen, csname, ctname, ename, shortcut)
values ('0027', '112', '5', '工艺识别代号', '工艺识别代号', 'DISCERN_CRAFT', 'DN_CT');
insert into PARALIST (id, code, clen, csname, ctname, ename, shortcut)
values ('0028', '107', '14', '工件识别代号', '工件识别代号', 'DISCERN_PART', 'DN_PT');
insert into PARALIST (id, code, clen, csname, ctname, ename, shortcut)
values ('0029', '201', '5', '机台状态识别号', '机台状态识别号', 'DISCERN_MAC_STATE', 'DN_MS');
insert into PARALIST (id, code, clen, csname, ctname, ename, shortcut)
values ('0030', '202', '5', '工件状态识别号', '工件状态识别号', 'DISCERN_PART_STATE', 'DN_PS');
insert into PARALIST (id, code, clen, csname, ctname, ename, shortcut)
values ('0031', '203', '5', '员工状态识别号', '员工状态识别号', 'DISCERN_EMP_ACTION', 'DN_EA');
insert into PARALIST (id, code, clen, csname, ctname, ename, shortcut)
values ('0032', '301', '5', '系统动作识别号', '系统动作识别号', 'DISCERN_SYS_ACTION', 'DN_SA');
insert into PARALIST (id, code, clen, csname, ctname, ename, shortcut)
values ('0033', '113', '7', '厂区部门识别号', '厂区部门识别号', 'DISCERN_DEPART', 'DN_DT');
commit;

insert into PARTRACE (id, classcode, chinaname, aboardname, createtime, creator, rtype)
values ('1100305001', '0', '模坯', 'MoldBase Unit', to_date('26-11-2013 11:01:50', 'dd-mm-yyyy hh24:mi:ss'), '31807', '0');
insert into PARTRACE (id, classcode, chinaname, aboardname, createtime, creator, rtype)
values ('1100305002', '1', '自制件', 'HomeMade', to_date('26-11-2013 11:05:20', 'dd-mm-yyyy hh24:mi:ss'), '31807', '0');
insert into PARTRACE (id, classcode, chinaname, aboardname, createtime, creator, rtype)
values ('1100305003', '2', '热流道系统', 'Hot System', to_date('26-11-2013 11:15:38', 'dd-mm-yyyy hh24:mi:ss'), '31807', '0');
insert into PARTRACE (id, classcode, chinaname, aboardname, createtime, creator, rtype)
values ('1100305004', '3', '前模仁', 'CavityCore Unit', to_date('26-11-2013 11:15:58', 'dd-mm-yyyy hh24:mi:ss'), '31807', '0');
insert into PARTRACE (id, classcode, chinaname, aboardname, createtime, creator, rtype)
values ('1100305005', '4', '后模仁', 'Core Unit', to_date('26-11-2013 11:16:01', 'dd-mm-yyyy hh24:mi:ss'), '31807', '0');
insert into PARTRACE (id, classcode, chinaname, aboardname, createtime, creator, rtype)
values ('1100305006', '5', '行位', 'Slide Unit', to_date('26-11-2013 11:16:04', 'dd-mm-yyyy hh24:mi:ss'), '31807', '0');
insert into PARTRACE (id, classcode, chinaname, aboardname, createtime, creator, rtype)
values ('1100305007', '9', '标准件', 'Standard Unit', to_date('26-11-2013 11:16:13', 'dd-mm-yyyy hh24:mi:ss'), '31807', '1');
insert into PARTRACE (id, classcode, chinaname, aboardname, createtime, creator, rtype)
values ('1100305008', '6', '斜顶', 'Lift Unit', to_date('26-11-2013 11:16:06', 'dd-mm-yyyy hh24:mi:ss'), '31807', '0');
insert into PARTRACE (id, classcode, chinaname, aboardname, createtime, creator, rtype)
values ('1100305009', '8', '顶出件', 'Ejector Unit ', to_date('26-11-2013 11:16:08', 'dd-mm-yyyy hh24:mi:ss'), '31807', '0');
insert into PARTRACE (id, classcode, chinaname, aboardname, createtime, creator, rtype)
values ('1100305010', '7', '电极', 'Electrode', to_date('26-11-2013 11:25:02', 'dd-mm-yyyy hh24:mi:ss'), '31807', '0');
commit;


insert into PROJECT_MODULE (id, parentid, name, remark, iconcls, mainpanel, tabpanel, modulepath, moduledefine, modulename, mpath)
values (7, null, '模具库存', 'ModuleStack', 'logo-standardcut', 'module-stack-win', 'module-stack-tabpanel', 'ModuleStack : ''js/module/stack''', 'ModuleStack.ModuleStackProject', 'ModuleStack', 'js/module/stack');
insert into PROJECT_MODULE (id, parentid, name, remark, iconcls, mainpanel, tabpanel, modulepath, moduledefine, modulename, mpath)
values (8, 7, '工件管理', 'StandardList', 'module-account', null, null, null, null, null, null);
insert into PROJECT_MODULE (id, parentid, name, remark, iconcls, mainpanel, tabpanel, modulepath, moduledefine, modulename, mpath)
values (1, null, '模具系统', 'Module', 'logo-shortcut', 'module-project-win', 'module-project-tabpanel', 'Module : ''js/module''', 'Module.ModuleProject', 'Module', 'js/module');
insert into PROJECT_MODULE (id, parentid, name, remark, iconcls, mainpanel, tabpanel, modulepath, moduledefine, modulename, mpath)
values (5, 1, '查询专区', 'ModuleBase', 'module-account', null, null, null, null, null, null);
insert into PROJECT_MODULE (id, parentid, name, remark, iconcls, mainpanel, tabpanel, modulepath, moduledefine, modulename, mpath)
values (2, 1, '基本数据', 'ModuleManage', 'module-part-process', null, null, null, null, null, null);
insert into PROJECT_MODULE (id, parentid, name, remark, iconcls, mainpanel, tabpanel, modulepath, moduledefine, modulename, mpath)
values (3, 1, '前期准备', 'ModulePart', 'module-part', null, null, null, null, null, null);
insert into PROJECT_MODULE (id, parentid, name, remark, iconcls, mainpanel, tabpanel, modulepath, moduledefine, modulename, mpath)
values (4, 1, '加工动态', 'ModuleProcess', 'module-list', null, null, null, null, null, null);
insert into PROJECT_MODULE (id, parentid, name, remark, iconcls, mainpanel, tabpanel, modulepath, moduledefine, modulename, mpath)
values (6, 1, '系统设置', 'ModuleMachine', 'module-schedule', null, null, null, null, null, null);
commit;

insert into REGION_DEPART (id, name, cdate, empid, stepid)
values ('1130001', '深圳锴诚精密模具有限公司', to_date('14-01-2015 09:17:32', 'dd-mm-yyyy hh24:mi:ss'), null, '01');
commit;

insert into ROLE (roleid, rolename, createid, createtime)
values ('002', '铣床主管', null, to_date('16-05-2015 14:49:31', 'dd-mm-yyyy hh24:mi:ss'));
insert into ROLE (roleid, rolename, createid, createtime)
values ('003', '部门管理员', null, to_date('16-05-2015 14:57:09', 'dd-mm-yyyy hh24:mi:ss'));
insert into ROLE (roleid, rolename, createid, createtime)
values ('001', '系统管理员', null, to_date('23-06-2014 09:44:17', 'dd-mm-yyyy hh24:mi:ss'));
commit;

insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('8d287573-5472-45dd-a509-97ddc6b31dd5', '001', '00002', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('d615bde8-8ee3-425a-b95c-116b4c1773a6', '001', '00107', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('1b74c9c8-0cb5-402e-b942-2c44394ed949', '001', '00106', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00092', '001', '00111', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('092', '001', '00112', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('d0fa3ce9-50c9-49fb-844d-6f97d3b346ff', '001', '00113', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('b099ebb2-a865-4052-951d-f5909f3a8a85', '001', '00110', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('17482225-e2cf-4f19-8803-eafeb37cada2', '001', '00109', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00093', '001', '00114', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00094', '001', '00115', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00095', '001', '00116', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00096', '001', '00117', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('292273b8-28d6-4024-9a11-a6c3ae2fa225', '001', '00118', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00097', '001', '00119', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('5fa63177-db16-4097-a76e-f829f6f28565', '001', '00120', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00098', '001', '00121', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00099', '001', '00122', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00100', '001', '00123', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00101', '001', '00124', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00102', '001', '00125', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00115', '001', '00139', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00116', '001', '00140', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00117', '001', '00141', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00118', '001', '00142', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00119', '001', '00143', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00120', '001', '00144', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00121', '001', '00145', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00122', '001', '00146', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00123', '001', '00147', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00124', '001', '00148', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00125', '001', '00149', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00126', '001', '00150', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00127', '001', '00151', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00128', '001', '00152', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00129', '001', '00153', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00130', '001', '00154', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00131', '001', '00155', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00132', '001', '00156', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00103', '001', '00127', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00104', '001', '00128', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00105', '001', '00129', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00106', '001', '00130', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00107', '001', '00131', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00108', '001', '00132', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00109', '001', '00133', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00110', '001', '00134', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00111', '001', '00135', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00112', '001', '00136', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00113', '001', '00137', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00114', '001', '00138', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('93f672ff-d686-4e6c-bcfd-e55b09b36acf', '001', '00108', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('11698b11-d061-4deb-a38d-70d21886303d', '001', '00099', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('edec5044-830f-456d-ae38-921a2e21f9ec', '001', '00103', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('d754abd6-f2a3-4f7c-a6c3-881ce561b15c', '001', '00104', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('d8b2de97-9f02-4841-b27d-4bedf52e9bed', '001', '00101', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('238f4847-c3f6-430f-ab79-54e950fabe6e', '001', '00102', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('622c9127-0718-4a36-b35f-dab448741e29', '001', '00100', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('443d9b0e-e668-482b-bfe0-f414746ca505', '001', '00085', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('fc3116b8-a07b-4745-b137-8f6a25ca4558', '001', '00080', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('91ecf283-ad58-4a24-abdc-178948372e19', '001', '00083', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('ca79dddf-dcdd-4576-a2cb-3dc1a6aeb4c4', '001', '00084', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('94ad31be-38f8-46b0-a4da-a37246acbb2d', '001', '00081', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('4059a8fb-922b-4bf7-ad57-3de2c946cdbf', '001', '00082', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('2c909df9-05f8-41a6-a8f0-cefa631454f6', '001', '00061', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('ff4d6d15-f62c-495f-8108-b95cf616b7bb', '001', '00062', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('ab85c1eb-2377-4179-b065-5329dd693e96', '001', '00056', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('27d3e045-dd4d-4e03-9c3f-d9ee1daec4d8', '001', '00060', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('c4f5b6b5-5a33-4580-90c1-4d779aaa046f', '001', '00064', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('c0e8c5f6-e363-4bee-bedd-663d42252ebc', '001', '00074', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('8cdecbe1-50ae-4db3-9a1c-8c5c9fcecc09', '001', '00011', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('e005344d-ecd5-49a5-8786-3cc6cb71442c', '001', '00063', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('27abf97f-9904-4ece-9a05-7a9a19f30cc5', '001', '00005', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('ee8c4b6f-20c9-4f84-8c1f-9ae4204ca8f0', '001', '00030', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('2a976fb9-8156-474a-bfe6-5ecaf27f2fbd', '001', '00105', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('759e06fe-37f5-4bbf-aa0c-426fa156e432', '001', '00040', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('a64ba30b-97ee-41ae-9720-163bf4e75637', '001', '00043', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('9267f218-2c9c-4bf5-a582-e9ace87429ef', '001', '00033', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('28cc63d3-f9a2-4c8c-97e5-37db3af18a85', '001', '00042', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('6bce7c14-dde7-443c-9c37-b60179f4b9fe', '001', '00004', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('c0983e08-be79-49a7-bd9e-f07b0840e0a3', '001', '00046', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('f8c8614f-f4f7-4d7e-961a-1b56cb97fc3f', '001', '00065', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('5a8eb061-78c8-474f-8b60-cf1726306903', '001', '00044', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('ca70e6fa-9d92-492f-8447-3f51cedc82ff', '001', '00077', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('fd14a130-587c-4a58-a4d6-16ad0ff747d1', '001', '00031', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('ab5dfae6-d941-4f19-be4b-12a98388a83b', '001', '00032', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('81e567e8-2efc-49ff-b651-fe1c4e17485f', '001', '00034', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('85ff3158-fcb6-4ab5-8d71-a75c9df1766c', '001', '00036', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('8c9b6b89-a4f6-4cbc-bd08-c53ff3f65f24', '001', '00078', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('d880e9cd-c432-4528-9303-e948e08d1283', '001', '00079', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('e646128d-e08c-4961-839d-b6b4c6db2eb9', '001', '00093', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('b781ff11-421d-4339-b90a-43001c00b6e6', '001', '00097', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('527b4e1d-b5ae-4af9-9f23-ff140f1e012b', '001', '00098', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('0e3a6708-cb83-4b37-8ecf-606b1a584ad1', '001', '00087', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('673473a2-e043-41bb-9897-12a6c51ab99a', '001', '00089', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('422a1b0f-bdab-46f2-8f93-62d79dc1c56c', '001', '00092', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('8a8bbb35-9466-49e6-9e20-a84b3c104544', '001', '00091', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('4a35e8ea-7074-43a4-a5a0-e0e310336fce', '001', '00090', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('fc771bcb-365a-4af2-b482-c297ca08eaac', '001', '00094', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('62aa470e-fed5-44b5-b270-bea60f3ae9c5', '001', '00095', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('371a5a9a-db46-4bfd-9c5d-4154a005e27f', '001', '00096', '0101', null, null, null, null);
commit;

insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('abe9cb52-e55e-4448-93dd-627fd88d6c08', '001', '00052', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('e2f4e9b0-b085-4924-b768-77d692e409d8', '001', '00059', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('3a0ac261-37e9-4c79-bff0-1bdfaeaffd58', '001', '00073', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('47568ac9-2e9b-4498-ad79-4bedb97ba59e', '001', '00076', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('e78bd0fc-ca87-4f88-ad50-50ef18b8ad04', '001', '00055', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('8653bfd0-ed1c-41a7-b4e8-e51b443588c3', '001', '00075', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('c0c78e72-187a-462a-9faa-078b0d6e76da', '001', '00054', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('1909d4df-0f43-4a80-8a67-707f353bd767', '001', '00053', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('239854f8-d5ec-4115-a597-2ff3f96586dc', '001', '00088', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('4773a741-6b6a-496b-bca3-6d2b975ce967', '001', '00070', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('e19c26e5-82d1-4053-b264-8d90e1341197', '001', '00071', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('7be3a394-5421-4680-b1b4-15d67e06e31d', '001', '00066', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('01db2aa5-e00f-419a-a903-5cc76883bcfd', '001', '00069', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('1dc30554-980d-4033-858e-534b86222fd8', '001', '00072', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('b3f12839-2b8f-47d7-8d0e-071f80eff84c', '001', '00067', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('a87392d4-708c-4c6e-b4d6-def4458c4a49', '001', '00068', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('4a09d084-eeca-4ab2-bae6-559336c745cf', '001', '00086', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('e9bc8639-4302-42b4-a49b-3f64893ea31b', '001', '00018', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00141', '001', '00165', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('fa6c60fc-a98c-41bc-b322-a6504b7e7f58', '001', '00188', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('86cc2a64-5a59-42e8-882d-9cf347776069', '001', '00189', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('3544359c-f23d-4e36-b3ad-85944a9cc7b4', '001', '00190', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('3f7fb02e-cf60-4bc0-a382-69ca0a0744c9', '001', '00191', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('6d858bd9-1642-429f-b46a-306fa997b1b8', '001', '00192', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('5a333f3c-767f-44b1-87f9-01c7d9d46824', '001', '00171', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('6a7a6c46-7a20-4b95-a9cc-7efad48671f4', '001', '00172', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('df0243bf-b1a2-4749-a4ae-5d09966e0abd', '002', '00138', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('8b3805c9-ea1c-4dff-bacf-430d59a198a0', '002', '00148', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('988b1a84-313c-4a1f-8dde-2b1392d8d9a0', '002', '00149', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00143', '001', '00179', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00145', '001', '00186', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('cca64902-494d-4fdf-a622-626809a24398', '002', '00147', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('0a892896-85b0-4076-83c5-70b830cdc5f5', '002', '00153', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('d545f2a2-e2d6-4221-b4f0-cf6f9de9fb25', '001', '00168', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('d54339b3-c77e-4099-80f7-44a2b9a3b834', '001', '00169', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00144', '001', '00185', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00146', '001', '00187', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('0e4e6972-1176-42f4-a020-32334cc93913', '002', '00088', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('d21c8c6a-9988-42e7-b3fc-0c0f8ea906fb', '002', '00124', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('47b5237b-3939-437d-83eb-54c60329fc72', '002', '00123', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('8cbea49e-710e-435c-87d7-6a88d1abf97b', '002', '00125', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('411e11f4-71f6-4b63-82f4-9fd42bd264f2', '002', '00119', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('84156e50-268b-4761-8145-3da9688c842b', '002', '00114', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('92215895-c276-4fcb-ac93-b94c7d901154', '002', '00115', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('873e3109-b165-4386-9a12-971d7c4cd2a9', '002', '00117', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('56fc4f01-f386-483a-8ff0-9dc7c87d8161', '002', '00111', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('984f9c4d-534a-4166-9b62-12b51eb36ab6', '002', '00116', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('a6b5ebce-cb36-472d-b44b-fd0bf9d1fd9c', '002', '00121', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('eb0ccc4e-b567-4881-89d7-f9a92fce74db', '002', '00122', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('8f416de3-11a0-4351-a86c-256e60a01185', '002', '00156', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('97ddd2ac-2063-462a-9617-146a952aac88', '002', '00155', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('5b6b8b37-de8f-4024-81ab-58bdbdbe0b5b', '002', '00154', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('da47ed91-c4f7-48dc-bd97-a57fd565c7a7', '003', '00148', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('315abc1a-a299-4a72-9288-c6ac162992af', '003', '00002', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('240ee397-24c7-4373-88f3-6ba8003f53a5', '003', '00138', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('f8362f60-5edc-43af-bfc5-f5285b023f74', '003', '00149', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('9c7a57d2-a5c6-4532-82a1-0f82a5e938be', '003', '00147', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('3edfb0b5-8391-417d-a7f2-8156b3cfd87e', '003', '00153', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('18d74ba2-45ab-49c3-9edf-d5c64ad14c1f', '003', '00088', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('ad9023c4-6929-4652-b7c7-102071411fdb', '003', '00152', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('127399e0-3c04-4707-aead-ca864b09b1e4', '003', '00151', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('a48e8254-1f21-41e3-b85d-d1db8e4c6f54', '003', '00150', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('fd97b4f8-a149-414d-a9f9-e42eba1200b2', '003', '00036', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('d87aa104-1c50-4619-98b3-c786ea846c62', '003', '00032', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('039c5b68-ca0e-4cb0-b913-f5abe4d9747e', '003', '00034', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('2b5bbe02-6c5c-41c2-82b9-93457c2d413d', '003', '00031', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('36d29d42-7825-45fb-9f88-917794e84477', '003', '00077', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('2fb64e3d-fb2f-4fa4-b2b1-8665a61b3276', '003', '00078', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('eacb4287-d5ec-4518-95c5-899bd686a9dc', '003', '00079', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('3668bec5-acfe-442a-816a-e4be924f6456', '003', '00156', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('02abd0b0-d19a-4500-aee7-430d4d7f53be', '003', '00155', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('53462b99-6c92-48b1-be4e-e57d5ee5cea2', '003', '00154', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('a3170823-5fea-4e7d-b473-65836549c29a', '003', '00124', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('e286d929-a458-4477-b6b5-94d6a06e7e4d', '003', '00123', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('2e153bed-c5f2-46d0-9848-4a54c5ea13fd', '003', '00125', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('7a4b3394-fe35-4650-b82d-b3f3da8e64fb', '003', '00119', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('63dd2143-b318-4b83-95c4-7fa4b662cc4a', '003', '00116', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('e702c187-7754-462a-b086-daff4f53928f', '003', '00114', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('5a950f1c-dbb3-43cd-b6cf-49b731e23006', '003', '00115', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('2a7bdd1f-2921-47a5-bca4-778ab6f42b19', '003', '00117', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('50003c9f-bdc3-474a-8702-d8c91341bb9e', '003', '00111', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('3b738b04-39d5-4f6e-b9b7-25cffc0c713b', '003', '00122', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('8698a7ee-7daf-4fe4-af63-0441f6110868', '003', '00121', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('296ef19b-473e-41ae-ae43-1e6a095e28cb', '003', '00175', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00138', '001', '00162', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('416ed30b-7a48-4a94-b383-a40994495626', '001', '00173', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00139', '001', '00163', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00140', '001', '00164', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('e7bd8a11-503c-453a-be11-63e2fa712328', '001', '00167', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('3c3560ed-adfa-4f99-9435-89ae79110cf9', '003', '00169', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('8428be4f-f626-46f3-b6cf-cad672dcc73a', '003', '00040', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('2ae636bc-a397-48c8-9622-0e672e16ad41', '003', '00042', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('8f685aa2-ad24-4c64-8862-439641c2e71b', '003', '00043', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('4b8c24df-7f63-4cc7-868c-fb68ad67c0ac', '003', '00033', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('00142', '001', '00166', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('0f94fdf6-6c36-424c-ae3b-7174417f97c8', '003', '00065', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('e5f059e4-0c5a-49c2-8608-041095ceffcb', '001', '00183', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('abecdbf5-1163-48c2-bba4-41721067a3f7', '001', '00181', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('e5aa9d36-ee43-4652-9cd0-bcc37988742e', '001', '00184', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('3e8b5476-83f7-4b4f-aab5-559d409d3a7b', '001', '00182', '0101', null, null, null, null);
commit;

insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('ba18ab42-acfd-46b7-935f-b7f5286c9387', '001', '00180', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('93c909f1-6358-4689-a61e-ac12c76af2b4', '003', '00186', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('f3cd28e8-9625-43a9-af33-d44561802757', '003', '00136', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('b4767a75-83f7-4e73-88cb-d040cca915ec', '003', '00166', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('3a1cf0b8-b0cd-4158-85e9-7eed7fb33fa1', '003', '00144', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('dcd8e255-9875-4201-80d3-82c1530e08c5', '003', '00177', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('181627a9-1f81-455d-81d2-4aa6fb4014be', '003', '00174', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('a2be16fe-79bb-4c73-bc34-9f88305a7f54', '003', '00135', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('f6928c59-372b-49ec-8628-b3eb866327d1', '003', '00044', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('8984566f-b084-4f7a-8cf4-8ac5260a2665', '003', '00142', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('c6e25766-16af-4946-9bb8-06a5d6641908', '003', '00046', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('c3cf333d-4931-4727-876a-1b7a00c9f44b', '003', '00187', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('4421f568-afed-4117-b3e8-a5e2486c4a34', '003', '00168', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('b0af3d24-ba59-4dfc-9827-b22c4f8bdb40', '003', '00143', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('577f3bbe-678c-4509-8457-a0547c0e5498', '003', '00137', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('5dd72a67-d02b-4cbc-8673-6921cd07400e', '003', '00139', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('1205c893-5871-4c98-bbd9-629c0aa380a9', '003', '00185', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('de6835cd-a87d-4b52-b103-2a8ef5401ecf', '003', '00004', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('d578e4be-55cc-4d2d-b875-dc56b34c083a', '003', '00178', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('ebc032a4-b9a4-4f00-bf7e-ecd2c04d0762', '003', '00102', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('a67e83c7-d0cc-4ef2-b5a4-7e76a4e3c296', '003', '00099', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('ac9b6616-f5b6-4a9d-9915-d018dcbc2761', '003', '00100', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('63989c87-8450-4029-be07-1330ba48d311', '003', '00101', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('7663dbfd-1d75-48f3-bd34-fed852e06cf5', '003', '00107', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('759f09f7-8add-429e-a7a2-f29da41090f2', '003', '00103', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('17806a7f-1418-41a1-8e2f-4643b19f33ef', '003', '00104', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('22ec3ab0-bf29-4e5e-888a-083ff3369486', '003', '00080', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('39eee537-3460-4b45-bbfa-7c9362c59981', '003', '00085', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('288e240e-7da0-4100-a736-cbb20ea69700', '003', '00084', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('5ce250ec-8b1d-40b2-9793-d517548a0a6f', '003', '00083', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('fa14ac77-9fba-4196-9a13-45b9eb9f88c8', '003', '00081', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('801e442a-e19e-40ee-a5f9-8ac7986c6e18', '003', '00082', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('fc7dce89-bdbc-41a1-9577-af9a8d1f6f3a', '003', '00072', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('2275a403-1334-45e4-a082-b73792270a29', '003', '00018', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('3d2c1151-0a9e-484c-92a0-8b65fc1ffb6f', '003', '00067', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('2bc36eb1-793a-4a59-99cb-98f1b4d97498', '003', '00070', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('6b88aac9-400c-4a26-a853-ea38e961d595', '003', '00066', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('3b601382-20a7-4eae-97ea-6505645699dc', '003', '00140', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('ca986253-d8eb-4abd-9f62-86d253a063e5', '003', '00068', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('e6c71d44-adaa-4517-ae86-82191cd7316c', '003', '00141', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('2935309e-6cbe-437c-a1fa-6e1c7676900c', '003', '00086', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('325dd19a-ebc4-4981-ba7e-4a6b449869e7', '003', '00071', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('98408b9b-8065-42c8-9567-6dec38de419c', '003', '00176', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('c37ef18e-f1f6-4447-9c7e-e8bddf37b2cb', '003', '00167', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('7e703a39-0981-4434-8c94-d40fc4b82649', '003', '00069', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('5f8a78e9-9185-4aa6-8c40-6a0e0c0a5a07', '003', '00132', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('137cc0a7-62e8-4ace-9468-f5b5649f8567', '003', '00133', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('fba82c84-25fb-4c78-a10d-f0c8974220ee', '003', '00134', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('171f457d-c56e-4538-ad8c-7bfcce2e989c', '003', '00145', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('7b8fef11-dc0e-4fba-ad78-c7d08228811d', '003', '00146', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('b0779f87-618a-4c48-ba6a-c8373ab193e2', '003', '00093', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('b5107fc0-c3b4-469e-89a9-087e495fc9e3', '003', '00095', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('dce9943d-241b-42de-b763-ca5671e312d3', '003', '00097', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('23a9d3aa-b1a5-482e-aff8-c1f8f9930d1c', '003', '00183', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('5ad58739-dafd-407f-a62d-25d22ffeb053', '003', '00098', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('9201393e-7115-452a-a864-0e107b47c810', '003', '00181', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('bd113f29-ba4c-4856-98ec-8b36f938e323', '003', '00089', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('0c398577-6ba0-492f-93dd-56df5297c804', '003', '00184', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('644d131d-c3c2-4f76-a7eb-2eb9c7884cae', '003', '00179', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('395bc35f-f57c-42d5-a652-99d8d7ec111a', '003', '00092', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('dce2b6a1-c123-4ebd-8dcb-e2cd4078adef', '003', '00090', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('2f3e5af6-dfe0-42bd-8158-1b4365df374d', '003', '00182', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('2e2b1907-7865-4c27-bca1-ee715d91c319', '003', '00096', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('f5651756-3ead-4c8b-b5c9-14214ea050f0', '003', '00087', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('9f64c84b-6ad9-48c4-956a-5a9842e25282', '003', '00180', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('c53a75de-e0b2-484f-9688-cb9bb8727d0a', '003', '00094', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('7f994b82-cdee-48be-bfef-03b4427513fc', '003', '00091', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('80880575-b502-4e12-8f5a-ac208c211552', '003', '00126', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('f6afcb26-61f5-42d1-91da-6b83db76a840', '003', '00109', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('b22a91b2-33ca-4792-ab2f-b18091e72fbf', '003', '00112', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('898bc067-7dcd-446f-a988-b2fee7b55f76', '003', '00113', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('766d1937-2edd-408d-91dd-264dbd6e47e1', '003', '00110', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('c9cc869f-2b65-4a65-9c3f-1ccda29681bd', '003', '00120', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('1deb7bed-edc5-4db8-9418-b00011edaecd', '003', '00118', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('3450f87b-19d5-4326-bd64-460a805068e2', '003', '00108', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('f77fa403-843d-4dd2-b6ac-69c512f8022b', '003', '00162', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('eb3aa065-2d9c-4379-a20a-75a6db80c6e2', '003', '00164', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('cc513dfa-4f22-4c06-bc56-4643ebaceef5', '003', '00163', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('849e6404-a212-4b1d-a301-66472d387b38', '003', '00165', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('aa2c59c9-5135-4091-8a0e-30db8439b590', '003', '00074', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('474e54c2-d23f-4690-b3ca-0baf78fc198b', '003', '00011', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('e0b97161-211b-4813-9615-4111ce8dd8f7', '003', '00064', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('8baf51f8-34b2-4e7e-bfc6-f9b73c04566f', '003', '00060', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('bad72a2a-f6cb-4a42-b94e-c335cfb8705c', '003', '00062', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('8efe9985-b003-4c71-b56b-cd7da9b6929f', '003', '00056', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('8f353312-d925-4920-8f4c-3855d30587de', '003', '00063', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('e1dbd7e8-c491-433a-8203-7947fbe0ab81', '003', '00061', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('51710621-2760-4431-a786-550ce89a51c9', '003', '00192', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('56f8aa49-3dbe-4d08-ad68-9b43b82ebefd', '003', '00106', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('9beaf465-e412-4048-a5a7-fb893d98d075', '003', '00131', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('8eadc263-b337-4ec3-8cfb-abfceb169185', '003', '00128', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('42e9b5eb-5a18-4eb3-8fc5-393bd474eabd', '003', '00127', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('b6b024bb-ea0f-448f-b620-6f5a65fe4e43', '003', '00105', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('614de2e8-4c3f-4b94-a0c7-32d61fc1a52a', '003', '00188', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('c891da10-1322-4edd-aafc-65d6093e46c0', '003', '00172', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('1d293ceb-c249-45f6-9b9c-9135e6a48d93', '003', '00129', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('2afddd78-43eb-4228-ab3e-79002377e733', '003', '00190', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('cd51cff3-5175-4b21-b9d7-50a07260ea4d', '003', '00171', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('5d979c09-d043-49d7-84fe-1c622fd89f52', '003', '00005', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('4e72c085-0bf9-488e-b25e-71e103ef1a39', '003', '00130', '0101', null, null, null, null);
commit;

insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('cf1b1336-a70a-4118-bee9-b1621b0d8300', '003', '00059', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('931d176d-0b7e-42fe-8105-da728976eac8', '003', '00055', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('400eb7b3-9a3a-4f3e-a038-c64ccbb4fc56', '003', '00076', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('5fcfda1f-e414-4673-a069-d38e9340bab1', '003', '00073', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('7b1b7c25-e4e9-474f-b7f3-c18bf6e6229c', '003', '00075', '0101', null, null, null, null);
insert into ROLE_POS (authposid, roleid, authid, posid, workid, authok, rsv001, rsv002)
values ('5dca40d2-4175-4e0e-b7ec-e3f27dad7606', '002', '00002', '0101', null, null, null, null);
commit;

insert into STATION (id, stationname, stationcode)
values ('111000', '经理', null);
insert into STATION (id, stationname, stationcode)
values ('111001', '铣床操机员', null);
insert into STATION (id, stationname, stationcode)
values ('111003', '线割操机员', null);
insert into STATION (id, stationname, stationcode)
values ('111002', '磨床操机员', null);
insert into STATION (id, stationname, stationcode)
values ('111004', '测量员', null);
insert into STATION (id, stationname, stationcode)
values ('111005', '营业开发', null);
commit;

insert into SUB_FUNCTION (id, projectid, text, path, iconcls)
values ('141229001', 6, '员工设置', 'Module.DepartmentSettings', 'format-indent-auth-24');
insert into SUB_FUNCTION (id, projectid, text, path, iconcls)
values ('150306001', -1, '设变修模', 'Module.ModuleDesignMaintain', 'format-indent-prs-24');
insert into SUB_FUNCTION (id, projectid, text, path, iconcls)
values ('140725006', 3, '条形码设置', 'Module.ModuleBarcodeSetting', 'format-indent-less-24');
insert into SUB_FUNCTION (id, projectid, text, path, iconcls)
values ('140725001', 2, '新增模具', 'Module.CoxonCreateModuleInformation', 'format-indent-base-24');
insert into SUB_FUNCTION (id, projectid, text, path, iconcls)
values ('140725002', 6, '厂区资料', 'Module.BaseInformation', 'format-indent-base-24');
insert into SUB_FUNCTION (id, projectid, text, path, iconcls)
values ('140725007', 3, '工件查看', 'Module.ProcessPartCode', 'format-indent-less-24');
insert into SUB_FUNCTION (id, projectid, text, path, iconcls)
values ('140725008', 3, '机台条形码', 'Module.MachineBarCode', 'format-indent-less-24');
insert into SUB_FUNCTION (id, projectid, text, path, iconcls)
values ('140725009', 3, '部门与人员条形码', 'Module.HumanResourceBarcode', 'format-indent-less-24');
insert into SUB_FUNCTION (id, projectid, text, path, iconcls)
values ('140725010', 3, '工件条形码', 'Module.ModulePartBarcode', 'format-indent-less-24');
insert into SUB_FUNCTION (id, projectid, text, path, iconcls)
values ('140725011', 3, '系统条形码', 'Module.ModuleSystemBarcode', 'format-indent-less-24');
insert into SUB_FUNCTION (id, projectid, text, path, iconcls)
values ('140725014', 5, '排程查询', 'Module.ModulePartPlanQuery', 'format-indent-qry-24');
insert into SUB_FUNCTION (id, projectid, text, path, iconcls)
values ('140725022', 6, '用户权限', 'Module.RootManager', 'format-indent-auth-24');
insert into SUB_FUNCTION (id, projectid, text, path, iconcls)
values ('140725025', 4, '管控机台', 'Module.MachineOperate', 'format-indent-prs-24');
insert into SUB_FUNCTION (id, projectid, text, path, iconcls)
values ('140925001', 5, '预计开工查询', 'Module.PreviewProcessSchedule', 'format-indent-qry-24');
insert into SUB_FUNCTION (id, projectid, text, path, iconcls)
values ('140725003', 6, '设备讯息', 'Module.ManageDevices', 'format-indent-base-24');
insert into SUB_FUNCTION (id, projectid, text, path, iconcls)
values ('141016021', 4, '模具完工', 'Module.ModuleProcessFinish', 'format-indent-prs-24');
insert into SUB_FUNCTION (id, projectid, text, path, iconcls)
values ('140725023', 6, '机台信息', 'Module.ModuleMachineInfo', 'format-indent-less-24');
insert into SUB_FUNCTION (id, projectid, text, path, iconcls)
values ('140725024', 6, '机台负荷', 'Module.ModuleMachineBurden', 'format-indent-less-24');
insert into SUB_FUNCTION (id, projectid, text, path, iconcls)
values ('141029001', 5, '加工工件查询', 'Module.FindPartInfo', 'format-indent-qry-24');
insert into SUB_FUNCTION (id, projectid, text, path, iconcls)
values ('140725004', 2, '工件清单', 'Module.CoxonModuleNewPart', 'format-indent-base-24');
insert into SUB_FUNCTION (id, projectid, text, path, iconcls)
values ('140725015', 5, '加工流程', 'Module.ModuleSchedulerQuery', 'format-indent-qry-24');
insert into SUB_FUNCTION (id, projectid, text, path, iconcls)
values ('141031001', 5, '工件加工成本', 'Module.ProcessModuleCost', 'format-indent-qry-24');
insert into SUB_FUNCTION (id, projectid, text, path, iconcls)
values ('140725016', 5, '工件管理', 'Module.ModulePartManage', 'format-indent-qry-24');
insert into SUB_FUNCTION (id, projectid, text, path, iconcls)
values ('140725017', 5, '加工工时评估', 'Module.ModulePartTimeEvaluation', 'format-indent-qry-24');
insert into SUB_FUNCTION (id, projectid, text, path, iconcls)
values ('140725012', 4, '工件外发', 'Module.PartOutBound', 'format-indent-prs-24');
insert into SUB_FUNCTION (id, projectid, text, path, iconcls)
values ('141111001', 5, '模具加工明细', 'Module.ModuleProcessInformation', 'format-indent-qry-24');
insert into SUB_FUNCTION (id, projectid, text, path, iconcls)
values ('141203001', 8, '工件管理', 'Module.StandardPartManager', 'format-indent-qry-24');
insert into SUB_FUNCTION (id, projectid, text, path, iconcls)
values ('140725005', 2, '模具资料', 'Module.CoxonQueryModuleCode', 'format-indent-base-24');
insert into SUB_FUNCTION (id, projectid, text, path, iconcls)
values ('140725018', 3, '工件排程', 'Module.ModulePartPlan', 'format-indent-sche-24');
insert into SUB_FUNCTION (id, projectid, text, path, iconcls)
values ('140725013', 4, '工件测量', 'Module.ModuleMeasureResult', 'format-indent-msr-24');
insert into SUB_FUNCTION (id, projectid, text, path, iconcls)
values ('140725019', 5, '人员加工明细', 'Module.EmployeeProcessInfo', 'format-indent-qry-24');
insert into SUB_FUNCTION (id, projectid, text, path, iconcls)
values ('140725020', 5, '工件加工进度', 'Module.ModulePartProcessInfo', 'format-indent-qry-24');
insert into SUB_FUNCTION (id, projectid, text, path, iconcls)
values ('140725021', 5, '加工模具进度', 'Module.ModuleProcessSchedule', 'format-indent-qry-24');
commit;


