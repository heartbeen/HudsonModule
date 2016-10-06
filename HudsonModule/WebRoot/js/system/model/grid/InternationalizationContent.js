/**
 * 
 */
Ext.define('System.model.grid.InternationalizationContent', {
	extend : 'Ext.data.Model',
	fields : [ {
		name : 'lang_value',
		type : 'string'
	}, {
		name : 'locale_key',
		type : 'string'
	}, {
		name : 'lang_code',
		type : 'string'
	}, {
		name : 'locale_name',
		type : 'string'
	}, {
		name : 'create_by',
		type : 'string'
	}, {
		name : 'create_date',
		type : 'date'
	}, {
		name : 'modify_by',
		type : 'string'
	}, {
		name : 'modify_date',
		type : 'date'
	}, {
		name : 'id',
		type : 'int'
	} ]
});