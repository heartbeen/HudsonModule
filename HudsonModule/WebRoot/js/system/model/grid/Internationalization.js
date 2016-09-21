/**
 * 
 */
Ext.define('System.model.grid.Internationalization', {
	extend : 'Ext.data.Model',
	fields : [ {
		name : 'langcode',
		type : 'string'
	}, {
		name : 'projectid',
		type : 'string'
	}, {
		name : 'category'
	}, {
		name : 'createby',
		type : 'string'
	}, {
		name : 'createdate',
		type : 'date'
	}, {
		name : 'modifyby',
		type : 'string'
	}, {
		name : 'modifydate',
		type : 'date'
	}, {
		name : 'content',
		type : 'object'
	} ]
});