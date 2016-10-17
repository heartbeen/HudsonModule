
--1.增加国际化代码字段
alter table PROJECT_MODULE add  (lang_code varchar2(200));
alter table ITEM_AUTHORITY add  (lang_code varchar2(200));
alter table SUB_FUNCTION add  (lang_code varchar2(200));

--2.增加模块
insert into PROJECT_MODULE (id, parentid, name, remark, iconcls, mainpanel, tabpanel, modulepath, moduledefine, modulename, mpath, typeid, lang_code)
values (11, null,'系统管理','System','logo-shortcut','system-settings-win','system-settings-tabpanel','System:''js/system''','System.SystemProject','System','js/system', 0,'system.settings');
insert into PROJECT_MODULE (id, parentid, name, remark, iconcls, mainpanel, tabpanel, modulepath, moduledefine, modulename, mpath, typeid, lang_code)
values (12, 11,'参数','SystemParams','module-schedule', null, null, null, null, null, null, 0,'system.params');

--3.增加国际化功能
insert into SUB_FUNCTION (id, projectid, text, path, iconcls, lang_code)
values ('160920001', 12,'国际化','System.Internationalization','format-indent-qry-24','internationalization');

--4.将权限和用户设置转到系统管理之系统参数模块中
update SUB_FUNCTION set projectid = 12 where id ='140725022' or id='141229001';
commit;

--5.增加国际化内容序列
create sequence SYS_LOCALE_CONTENT_S
minvalue 1
maxvalue 9999999999999999999999999999
start with 81
increment by 1
cache 20;

--6.模块更新国际化编码
update PROJECT_MODULE set lang_code='design.system' where id='8';
update PROJECT_MODULE set lang_code='module.system' where id='1';
update PROJECT_MODULE set lang_code='query.area' where id='5';
update PROJECT_MODULE set lang_code='base.data' where id='2';
update PROJECT_MODULE set lang_code='advance.preparation' where id='3';
update PROJECT_MODULE set lang_code='machining.dynamics' where id='4';
update PROJECT_MODULE set lang_code='base.settings' where id='7';
update PROJECT_MODULE set lang_code='module.system.settings' where id='6';
update PROJECT_MODULE set lang_code='barcode.printer' where id='10';
update PROJECT_MODULE set lang_code='base.source' where id='9';



--7.模块功能更新国际化编码
update SUB_FUNCTION set lang_code='internationalization' where id='160920001';
update SUB_FUNCTION set lang_code='emp.barcode' where id='160720001';
update SUB_FUNCTION set lang_code='module.barcode' where id='160720002';
update SUB_FUNCTION set lang_code='design.barcode.settings' where id='160720000';
update SUB_FUNCTION set lang_code='design.craft.barcode' where id='160720003';
update SUB_FUNCTION set lang_code='design.system.barcode' where id='160720004';
update SUB_FUNCTION set lang_code='module.manager' where id='160615001';
update SUB_FUNCTION set lang_code='emp.settings' where id='141229001';
update SUB_FUNCTION set lang_code='design.main.tain' where id='150306001';
update SUB_FUNCTION set lang_code='module.barcode.settings' where id='140725006';
update SUB_FUNCTION set lang_code='module.add.new.mold' where id='140725001';
update SUB_FUNCTION set lang_code='factory.data' where id='140725002';
update SUB_FUNCTION set lang_code='module.craft.barcode' where id='140725007';
update SUB_FUNCTION set lang_code='machine.barcode' where id='140725008';
update SUB_FUNCTION set lang_code='dept.emp.barcode' where id='140725009';
update SUB_FUNCTION set lang_code='part.barcode' where id='140725010';
update SUB_FUNCTION set lang_code='module.system.barcode' where id='140725011';
update SUB_FUNCTION set lang_code='plan.query' where id='140725014';
update SUB_FUNCTION set lang_code='user.auth' where id='140725022';
update SUB_FUNCTION set lang_code='machine.manager' where id='140725025';
update SUB_FUNCTION set lang_code='plan.start.query' where id='140925001';
update SUB_FUNCTION set lang_code='machine.infoation' where id='140725003';
update SUB_FUNCTION set lang_code='module.worked' where id='141016021';
update SUB_FUNCTION set lang_code='machine.information' where id='140725023';
update SUB_FUNCTION set lang_code='machine.burden' where id='140725024';
update SUB_FUNCTION set lang_code='process.part.query' where id='141029001';
update SUB_FUNCTION set lang_code='part.list' where id='140725004';
update SUB_FUNCTION set lang_code='process.scheduler' where id='140725015';
update SUB_FUNCTION set lang_code='process.cost' where id='141031001';
update SUB_FUNCTION set lang_code='part.manager' where id='140725016';
update SUB_FUNCTION set lang_code='process.time.evaluation' where id='140725017';
update SUB_FUNCTION set lang_code='part.out.bound' where id='140725012';
update SUB_FUNCTION set lang_code='module.process.infomation' where id='141111001';
update SUB_FUNCTION set lang_code='module.data' where id='140725005';
update SUB_FUNCTION set lang_code='part.plan' where id='140725018';
update SUB_FUNCTION set lang_code='part.measure' where id='140725013';
update SUB_FUNCTION set lang_code='emp.process.infomation' where id='140725019';
update SUB_FUNCTION set lang_code='part.process.working' where id='140725020';
update SUB_FUNCTION set lang_code='module.process.working' where id='140725021';
update SUB_FUNCTION set lang_code='project.task' where id='150714001';

--8.增加国际化功能接口
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid, lang_code)
values ('00250', '/system/queryProjectModule', '查询模块信息', '0', '160920001', null);
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid, lang_code)
values ('00251', '/system/queryLocaleTag', '查询国际化标签', '0', '160920001', null);
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid, lang_code)
values ('00252', '/system/queryLocaleContentByTag', '通过国际化编码标签得到所有语言内容', '0', '160920001', null);
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid, lang_code)
values ('00254', '/system/updateLocaleContent', '更新国际化内容', '2', '160920001', null);
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid, lang_code)
values ('00255', '/system/saveLocaleContent', '新建国际化内容', '1', '160920001', null);
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid, lang_code)
values ('00256', '/system/saveLocaleTag', '新建国际化编码', '1', '160920001', null);
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid, lang_code)
values ('00258', '/system/updateLocaleTag', '更新国际化编码', '2', '160920001', null);
insert into ITEM_AUTHORITY (authid, authname, userpathname, authtype, moduleid, lang_code)
values ('00259', '/system/deleteLocaleTag', '批量删除国际化编码', '3', '160920001', null);