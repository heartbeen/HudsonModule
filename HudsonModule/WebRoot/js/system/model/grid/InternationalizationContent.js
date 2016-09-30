/**
 * 
 */
Ext.define('System.model.grid.Internationalization', {
	extend : 'Ext.data.Model',
	fields : [ {
		name : 'id',
		type : 'int'
	}, {
		name : 'localename',
		type : 'string'
	}, {
		name : 'langvalue',
		type : 'string'
	} ]
});