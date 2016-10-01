-- 生成者Oracle SQL Developer Data Modeler 4.1.3.901
--   时间:        2016-10-01 13:38:32 CST
--   站点:      Oracle Database 11g
--   类型:      Oracle Database 11g




CREATE TABLE sys_locale
  (
    locale_key  VARCHAR2 (10) NOT NULL ,
    locale_name VARCHAR2 (20)
  ) ;
ALTER TABLE sys_locale ADD CONSTRAINT sys_locale_PK PRIMARY KEY ( locale_key ) ;


CREATE TABLE sys_locale_content_t
  (
    id          NUMBER NOT NULL ,
    locale_key  VARCHAR2 (10) NOT NULL ,
    lang_code   VARCHAR2 (200) NOT NULL ,
    lang_value  VARCHAR2 (1000) NOT NULL ,
    create_by   VARCHAR2 (50) ,
    create_date DATE ,
    modify_by   VARCHAR2 (15) ,
    modify_date DATE
  ) ;
COMMENT ON COLUMN sys_locale_content_t.locale_key
IS
  '语言' ;
  COMMENT ON COLUMN sys_locale_content_t.lang_code
IS
  '国际化语言编码' ;
  COMMENT ON COLUMN sys_locale_content_t.lang_value
IS
  '语言所对应的值' ;
ALTER TABLE sys_locale_content_t ADD CONSTRAINT sys_i18n_t_PK PRIMARY KEY ( id ) ;


CREATE TABLE sys_locale_tag_t
  (
    lang_code   VARCHAR2 (200) NOT NULL ,
    project_id  NUMBER NOT NULL ,
    category    VARCHAR2 (15) NOT NULL ,
    create_by   VARCHAR2 (50) ,
    create_date DATE ,
    modify_by   VARCHAR2 (15) ,
    modify_date DATE
  ) ;
COMMENT ON COLUMN sys_locale_tag_t.lang_code
IS
  '国际化语言编码' ;
  COMMENT ON COLUMN sys_locale_tag_t.project_id
IS
  '国际化所对应的模块，如果为-1时，表示为公用' ;
  COMMENT ON COLUMN sys_locale_tag_t.category
IS
  '分类:sys,user,' ;
ALTER TABLE sys_locale_tag_t ADD CONSTRAINT sys_locale_tag_PK PRIMARY KEY ( lang_code ) ;


ALTER TABLE sys_locale_content_t ADD CONSTRAINT sys_locale_content__locale_FK FOREIGN KEY ( locale_key ) REFERENCES sys_locale ( locale_key ) ;

ALTER TABLE sys_locale_content_t ADD CONSTRAINT sys_locale_content_tag_t_FK FOREIGN KEY ( lang_code ) REFERENCES sys_locale_tag_t ( lang_code ) ;


-- Oracle SQL Developer Data Modeler 概要报告: 
-- 
-- CREATE TABLE                             3
-- CREATE INDEX                             0
-- ALTER TABLE                              5
-- CREATE VIEW                              0
-- ALTER VIEW                               0
-- CREATE PACKAGE                           0
-- CREATE PACKAGE BODY                      0
-- CREATE PROCEDURE                         0
-- CREATE FUNCTION                          0
-- CREATE TRIGGER                           0
-- ALTER TRIGGER                            0
-- CREATE COLLECTION TYPE                   0
-- CREATE STRUCTURED TYPE                   0
-- CREATE STRUCTURED TYPE BODY              0
-- CREATE CLUSTER                           0
-- CREATE CONTEXT                           0
-- CREATE DATABASE                          0
-- CREATE DIMENSION                         0
-- CREATE DIRECTORY                         0
-- CREATE DISK GROUP                        0
-- CREATE ROLE                              0
-- CREATE ROLLBACK SEGMENT                  0
-- CREATE SEQUENCE                          0
-- CREATE MATERIALIZED VIEW                 0
-- CREATE SYNONYM                           0
-- CREATE TABLESPACE                        0
-- CREATE USER                              0
-- 
-- DROP TABLESPACE                          0
-- DROP DATABASE                            0
-- 
-- REDACTION POLICY                         0
-- 
-- ORDS DROP SCHEMA                         0
-- ORDS ENABLE SCHEMA                       0
-- ORDS ENABLE OBJECT                       0
-- 
-- ERRORS                                   0
-- WARNINGS                                 0
