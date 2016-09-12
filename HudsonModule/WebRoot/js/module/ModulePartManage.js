/**
 * 工件管理介面
 */
Ext.define('Module.ModulePartManage', {
	extend : 'Ext.panel.Panel',

	layout : {
		type : 'border'
	},

	moduleBarcode : '',

	initComponent : function() {
		var me = this;

		Ext.applyIf(me, {
			// items : [ {
			// xtype : 'tabpanel',
			// region : 'center',
			// activeTab : 1,
			// items : [ Ext.create('Module.ModuleSignPart'),
			// Ext.create('Module.ModulePartDetailed'),
			// Ext.create('Module.ModulePartChart') ]
			// } ]
			items : [ Ext.create('Module.ModulePartDetailed') ]
		});

		me.callParent(arguments);
	}
});
