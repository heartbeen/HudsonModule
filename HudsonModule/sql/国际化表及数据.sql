???prompt PL/SQL Developer import file
prompt Created on 2016年10月13日 by xuwei
set feedback off
set define off
prompt Creating SYS_LOCALE...
create table SYS_LOCALE
(
  locale_key  VARCHAR2(10) not null,
  locale_name VARCHAR2(20)
)
;
alter table SYS_LOCALE
  add constraint SYS_LOCALE_PK primary key (LOCALE_KEY);

prompt Creating SYS_LOCALE_CONTENT_T...
create table SYS_LOCALE_CONTENT_T
(
  id          NUMBER not null,
  locale_key  VARCHAR2(10) not null,
  lang_code   VARCHAR2(200) not null,
  lang_value  VARCHAR2(1000) not null,
  create_by   VARCHAR2(50),
  create_date DATE,
  modify_by   VARCHAR2(15),
  modify_date DATE
)
;
comment on column SYS_LOCALE_CONTENT_T.locale_key
  is '语言';
comment on column SYS_LOCALE_CONTENT_T.lang_code
  is '国际化语言编码';
comment on column SYS_LOCALE_CONTENT_T.lang_value
  is '语言所对应的值';
alter table SYS_LOCALE_CONTENT_T
  add primary key (ID);

prompt Creating SYS_LOCALE_TAG_T...
create table SYS_LOCALE_TAG_T
(
  lang_code   VARCHAR2(200) not null,
  project_id  NUMBER not null,
  category    VARCHAR2(15),
  create_by   VARCHAR2(50),
  create_date DATE,
  modify_by   VARCHAR2(15),
  modify_date DATE
)
;
create index SYS_LOCALE_TAG_PK on SYS_LOCALE_TAG_T (LANG_CODE);

prompt Loading SYS_LOCALE...
insert into SYS_LOCALE (locale_key, locale_name)
values ('zh_CN', '简体中文');
insert into SYS_LOCALE (locale_key, locale_name)
values ('zh_TW', '繁体中文');
insert into SYS_LOCALE (locale_key, locale_name)
values ('en_US', 'English(US)');
commit;
prompt 3 records loaded
prompt Loading SYS_LOCALE_CONTENT_T...
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (48, 'en_US', 'system.systemparams.msg.locale.delete.success', 'Remove international code successfully!', '薛赵峰', to_date('10-10-2016 22:08:08', 'dd-mm-yyyy hh24:mi:ss'), '薛赵峰', to_date('10-10-2016 22:08:56', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (49, 'zh_CN', 'system.systemparams.msg.locale.delete.success', '删除国际化编码成功！', '薛赵峰', to_date('10-10-2016 22:08:18', 'dd-mm-yyyy hh24:mi:ss'), '薛赵峰', to_date('10-10-2016 22:08:18', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (50, 'zh_TW', 'system.systemparams.msg.locale.delete.success', '删除國際化編碼成功！', '薛赵峰', to_date('10-10-2016 22:09:12', 'dd-mm-yyyy hh24:mi:ss'), '薛赵峰', to_date('10-10-2016 22:09:12', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (51, 'zh_CN', 'system.systemparams.msg.locale.delete.fail', '删除国际化编码失败！', '薛赵峰', to_date('10-10-2016 22:10:00', 'dd-mm-yyyy hh24:mi:ss'), '薛赵峰', to_date('10-10-2016 22:10:00', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (52, 'zh_TW', 'system.systemparams.msg.locale.delete.fail', '删除國際化編碼失敗！', '薛赵峰', to_date('10-10-2016 22:10:06', 'dd-mm-yyyy hh24:mi:ss'), '薛赵峰', to_date('10-10-2016 22:10:06', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (53, 'en_US', 'system.systemparams.msg.locale.delete.fail', 'Failed to remove international code!', '薛赵峰', to_date('10-10-2016 22:10:36', 'dd-mm-yyyy hh24:mi:ss'), '薛赵峰', to_date('10-10-2016 22:10:36', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (54, 'zh_CN', 'module.add.new.mold', '新增模具', '薛赵峰', to_date('12-10-2016 00:23:25', 'dd-mm-yyyy hh24:mi:ss'), '薛赵峰', to_date('12-10-2016 00:23:25', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (55, 'zh_CN', 'factory.data', '厂区资料', '薛赵峰', to_date('12-10-2016 00:24:19', 'dd-mm-yyyy hh24:mi:ss'), '薛赵峰', to_date('12-10-2016 00:24:19', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (56, 'zh_CN', 'machine.infomation', '设备讯息', '薛赵峰', to_date('12-10-2016 00:25:28', 'dd-mm-yyyy hh24:mi:ss'), '薛赵峰', to_date('12-10-2016 00:25:28', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (57, 'zh_CN', 'part.list', '工件清单', '薛赵峰', to_date('12-10-2016 00:26:02', 'dd-mm-yyyy hh24:mi:ss'), '薛赵峰', to_date('12-10-2016 00:26:02', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (58, 'zh_CN', 'module.data', '模具资料', '薛赵峰', to_date('12-10-2016 00:26:40', 'dd-mm-yyyy hh24:mi:ss'), '薛赵峰', to_date('12-10-2016 00:26:40', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (59, 'zh_CN', 'barcode.settings', '条形码设置', '薛赵峰', to_date('12-10-2016 00:27:25', 'dd-mm-yyyy hh24:mi:ss'), '薛赵峰', to_date('12-10-2016 00:27:25', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (60, 'zh_CN', 'craft.barcode', '工艺条形码', '薛赵峰', to_date('12-10-2016 00:28:21', 'dd-mm-yyyy hh24:mi:ss'), '薛赵峰', to_date('12-10-2016 00:28:21', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (61, 'zh_CN', 'dept.emp.barcode', '部门与人员条形码', '薛赵峰', to_date('12-10-2016 00:29:13', 'dd-mm-yyyy hh24:mi:ss'), '薛赵峰', to_date('12-10-2016 00:29:13', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (62, 'zh_CN', 'machine.barcode', '机台条形码', '薛赵峰', to_date('12-10-2016 00:30:04', 'dd-mm-yyyy hh24:mi:ss'), '薛赵峰', to_date('12-10-2016 00:30:04', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (63, 'zh_CN', 'part.barcode', '工件条形码', '薛赵峰', to_date('12-10-2016 00:30:39', 'dd-mm-yyyy hh24:mi:ss'), '薛赵峰', to_date('12-10-2016 00:34:55', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (45, 'en_US', 'system.systemparam.title.locale.query', 'Query', '薛赵峰', to_date('09-10-2016 22:22:23', 'dd-mm-yyyy hh24:mi:ss'), '薛赵峰', to_date('09-10-2016 22:30:46', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (46, 'zh_TW', 'system.systemparam.title.locale.query', '査詢', '薛赵峰', to_date('09-10-2016 22:22:45', 'dd-mm-yyyy hh24:mi:ss'), '薛赵峰', to_date('09-10-2016 22:22:45', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (47, 'zh_CN', 'system.systemparam.title.locale.query', '査询', '薛赵峰', to_date('09-10-2016 22:22:48', 'dd-mm-yyyy hh24:mi:ss'), '薛赵峰', to_date('09-10-2016 22:23:11', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (2, 'zh_CN', 'barcode.printer', '条码打印', null, null, null, null);
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (3, 'zh_CN', 'base.settings', '基本设定', null, null, null, null);
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (4, 'zh_CN', 'design.system', '设计系统', null, null, null, null);
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (5, 'zh_CN', 'base.source', '基本资料', null, null, null, null);
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (6, 'zh_CN', 'module.system', '模具系统', null, null, null, null);
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (7, 'zh_CN', 'query.area', '查询专区', null, null, null, null);
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (8, 'zh_CN', 'base.data', '基本数据', null, null, null, null);
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (9, 'zh_CN', 'advance.preparation', '前期准备', null, null, null, null);
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (10, 'zh_CN', 'machining.dynamics', '加工动态', null, null, null, null);
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (11, 'zh_CN', 'module.system.settings', '系统设置', null, null, null, null);
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (12, 'zh_TW', 'barcode.printer', '條碼列印', null, null, null, null);
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (13, 'zh_TW', 'base.settings', '基本設定', null, null, null, null);
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (14, 'zh_TW', 'design.system', '設計系統', null, null, null, null);
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (15, 'zh_TW', 'base.source', '基本資料', null, null, null, null);
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (16, 'zh_TW', 'module.system', '模具系統', null, null, null, null);
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (17, 'zh_TW', 'query.area', '査詢專區', null, null, null, null);
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (18, 'zh_TW', 'base.data', '基本數據', null, null, null, null);
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (19, 'zh_TW', 'advance.preparation', '前期準備', null, null, null, null);
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (20, 'zh_TW', 'machining.dynamics', '加工動態', null, null, null, null);
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (21, 'zh_TW', 'module.system.settings', '系統設置', null, null, null, null);
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (23, 'en_US', 'base.settings', 'Basic Setting', null, null, '薛赵峰', to_date('09-10-2016 22:35:28', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (24, 'en_US', 'design.system', 'Design System', null, null, null, null);
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (25, 'en_US', 'base.source', 'Basic Data', null, null, '薛赵峰', to_date('05-10-2016 08:03:26', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (26, 'en_US', 'module.system', 'Module System', null, null, null, null);
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (27, 'en_US', 'query.area', 'Query Area', null, null, null, null);
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (28, 'en_US', 'base.data', 'Basic Data', null, null, '薛赵峰', to_date('05-10-2016 06:03:09', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (29, 'en_US', 'advance.preparation', 'Preparation in Advance', null, null, '薛赵峰', to_date('04-10-2016 22:45:25', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (30, 'en_US', 'machining.dynamics', 'Machining Dynamics', null, null, null, null);
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (31, 'en_US', 'module.system.settings', 'System Settings', null, null, null, null);
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (22, 'en_US', 'barcode.printer', 'Barcode Printing', null, null, '薛赵峰', to_date('05-10-2016 06:22:37', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (32, 'en_US', 'system.settings', 'System Manager', null, null, '薛赵峰', to_date('09-10-2016 22:30:34', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (33, 'zh_TW', 'system.settings', '系统管理', null, null, null, null);
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (34, 'zh_CN', 'system.settings', '系統管理', null, null, null, null);
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (35, 'en_US', 'system.params', 'System Params', null, null, null, null);
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (36, 'zh_TW', 'system.params', '系统参数', null, null, null, null);
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (37, 'zh_CN', 'system.params', '系统参数', null, null, null, null);
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (64, 'en_US', 'part.barcode', 'Part Barcode', '薛赵峰', to_date('12-10-2016 01:31:27', 'dd-mm-yyyy hh24:mi:ss'), '薛赵峰', to_date('12-10-2016 01:31:27', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (42, 'en_US', 'system.systemparam.locale.content.data.table', 'Data', '薛赵峰', to_date('09-10-2016 21:59:25', 'dd-mm-yyyy hh24:mi:ss'), '薛赵峰', to_date('09-10-2016 21:59:25', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (43, 'zh_CN', 'system.systemparam.locale.content.data.table', '详细数据', '薛赵峰', to_date('09-10-2016 21:59:38', 'dd-mm-yyyy hh24:mi:ss'), '薛赵峰', to_date('09-10-2016 21:59:38', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_CONTENT_T (id, locale_key, lang_code, lang_value, create_by, create_date, modify_by, modify_date)
values (44, 'zh_TW', 'system.systemparam.locale.content.data.table', '詳細數據', '薛赵峰', to_date('09-10-2016 22:02:00', 'dd-mm-yyyy hh24:mi:ss'), '薛赵峰', to_date('09-10-2016 22:02:00', 'dd-mm-yyyy hh24:mi:ss'));
commit;
prompt 59 records loaded
prompt Loading SYS_LOCALE_TAG_T...
insert into SYS_LOCALE_TAG_T (lang_code, project_id, category, create_by, create_date, modify_by, modify_date)
values ('barcode.printer', 10, 'sys', null, null, '薛赵峰', to_date('06-10-2016 11:48:56', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_TAG_T (lang_code, project_id, category, create_by, create_date, modify_by, modify_date)
values ('base.settings', 7, 'sys', null, null, '薛赵峰', to_date('06-10-2016 11:48:28', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_TAG_T (lang_code, project_id, category, create_by, create_date, modify_by, modify_date)
values ('machining.dynamics', 4, 'sys', null, null, '薛赵峰', to_date('06-10-2016 12:01:20', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_TAG_T (lang_code, project_id, category, create_by, create_date, modify_by, modify_date)
values ('design.system', 8, 'sys', null, null, '薛赵峰', to_date('06-10-2016 12:01:42', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_TAG_T (lang_code, project_id, category, create_by, create_date, modify_by, modify_date)
values ('query.area', 5, 'sys', null, null, '薛赵峰', to_date('06-10-2016 12:00:57', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_TAG_T (lang_code, project_id, category, create_by, create_date, modify_by, modify_date)
values ('base.data', 2, 'sys', null, null, '薛赵峰', to_date('06-10-2016 12:01:06', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_TAG_T (lang_code, project_id, category, create_by, create_date, modify_by, modify_date)
values ('base.source', 9, 'sys', null, null, '薛赵峰', to_date('06-10-2016 12:00:36', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_TAG_T (lang_code, project_id, category, create_by, create_date, modify_by, modify_date)
values ('advance.preparation', 3, 'sys', null, null, '薛赵峰', to_date('06-10-2016 12:01:13', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_TAG_T (lang_code, project_id, category, create_by, create_date, modify_by, modify_date)
values ('module.system.settings', 6, 'sys', null, null, '薛赵峰', to_date('06-10-2016 12:01:28', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_TAG_T (lang_code, project_id, category, create_by, create_date, modify_by, modify_date)
values ('system.params', 12, 'sys', null, null, '薛赵峰', to_date('06-10-2016 11:49:07', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_TAG_T (lang_code, project_id, category, create_by, create_date, modify_by, modify_date)
values ('module.system', 1, 'sys', null, null, '薛赵峰', to_date('06-10-2016 12:00:50', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_TAG_T (lang_code, project_id, category, create_by, create_date, modify_by, modify_date)
values ('system.settings', 11, 'sys', null, null, '薛赵峰', to_date('06-10-2016 12:01:34', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_TAG_T (lang_code, project_id, category, create_by, create_date, modify_by, modify_date)
values ('system.systemparams.msg.locale.delete.success', 12, null, '薛赵峰', to_date('10-10-2016 22:07:32', 'dd-mm-yyyy hh24:mi:ss'), '薛赵峰', to_date('10-10-2016 22:07:32', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_TAG_T (lang_code, project_id, category, create_by, create_date, modify_by, modify_date)
values ('system.systemparams.msg.locale.delete.fail', 12, null, '薛赵峰', to_date('10-10-2016 22:09:43', 'dd-mm-yyyy hh24:mi:ss'), '薛赵峰', to_date('10-10-2016 22:09:43', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_TAG_T (lang_code, project_id, category, create_by, create_date, modify_by, modify_date)
values ('factory.data', 6, null, '薛赵峰', to_date('12-10-2016 00:23:57', 'dd-mm-yyyy hh24:mi:ss'), '薛赵峰', to_date('12-10-2016 00:23:57', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_TAG_T (lang_code, project_id, category, create_by, create_date, modify_by, modify_date)
values ('module.add.new.mold', 9, null, '薛赵峰', to_date('12-10-2016 00:22:27', 'dd-mm-yyyy hh24:mi:ss'), '薛赵峰', to_date('12-10-2016 00:22:52', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_TAG_T (lang_code, project_id, category, create_by, create_date, modify_by, modify_date)
values ('machine.infomation', 6, null, '薛赵峰', to_date('12-10-2016 00:25:10', 'dd-mm-yyyy hh24:mi:ss'), '薛赵峰', to_date('12-10-2016 00:25:18', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_TAG_T (lang_code, project_id, category, create_by, create_date, modify_by, modify_date)
values ('part.list', 9, null, '薛赵峰', to_date('12-10-2016 00:25:52', 'dd-mm-yyyy hh24:mi:ss'), '薛赵峰', to_date('12-10-2016 00:25:52', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_TAG_T (lang_code, project_id, category, create_by, create_date, modify_by, modify_date)
values ('module.data', 9, null, '薛赵峰', to_date('12-10-2016 00:26:29', 'dd-mm-yyyy hh24:mi:ss'), '薛赵峰', to_date('12-10-2016 00:26:29', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_TAG_T (lang_code, project_id, category, create_by, create_date, modify_by, modify_date)
values ('barcode.settings', 3, null, '薛赵峰', to_date('12-10-2016 00:27:12', 'dd-mm-yyyy hh24:mi:ss'), '薛赵峰', to_date('12-10-2016 00:27:12', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_TAG_T (lang_code, project_id, category, create_by, create_date, modify_by, modify_date)
values ('craft.barcode', 3, null, '薛赵峰', to_date('12-10-2016 00:28:11', 'dd-mm-yyyy hh24:mi:ss'), '薛赵峰', to_date('12-10-2016 00:28:11', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_TAG_T (lang_code, project_id, category, create_by, create_date, modify_by, modify_date)
values ('machine.barcode', 3, null, '薛赵峰', to_date('12-10-2016 00:28:47', 'dd-mm-yyyy hh24:mi:ss'), '薛赵峰', to_date('12-10-2016 00:28:47', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_TAG_T (lang_code, project_id, category, create_by, create_date, modify_by, modify_date)
values ('dept.emp.barcode', 3, null, '薛赵峰', to_date('12-10-2016 00:29:03', 'dd-mm-yyyy hh24:mi:ss'), '薛赵峰', to_date('12-10-2016 00:29:03', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_TAG_T (lang_code, project_id, category, create_by, create_date, modify_by, modify_date)
values ('part.barcode', 3, null, '薛赵峰', to_date('12-10-2016 00:30:27', 'dd-mm-yyyy hh24:mi:ss'), '薛赵峰', to_date('12-10-2016 00:30:27', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_TAG_T (lang_code, project_id, category, create_by, create_date, modify_by, modify_date)
values ('system.systemparam.title.locale.query', 12, null, '薛赵峰', to_date('09-10-2016 22:22:12', 'dd-mm-yyyy hh24:mi:ss'), '薛赵峰', to_date('09-10-2016 22:22:12', 'dd-mm-yyyy hh24:mi:ss'));
insert into SYS_LOCALE_TAG_T (lang_code, project_id, category, create_by, create_date, modify_by, modify_date)
values ('system.systemparam.locale.content.data.table', 12, null, '薛赵峰', to_date('09-10-2016 21:23:30', 'dd-mm-yyyy hh24:mi:ss'), '薛赵峰', to_date('09-10-2016 22:20:31', 'dd-mm-yyyy hh24:mi:ss'));
commit;
prompt 26 records loaded
set feedback on
set define on
prompt Done.
