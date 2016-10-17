/**
 * 
 */
Ext.define('System.model.grid.Internationalization', {
	extend : 'Ext.data.Model',
	fields : [ {
		name : 'lang_code',
		type : 'string'
	}, {
		name : 'project_id',
		type : 'string'
	}, {
		name : 'project_name',
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
		name : 'isNew',
		type : 'bool'
	} ]
});