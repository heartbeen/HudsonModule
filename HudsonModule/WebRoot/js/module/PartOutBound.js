Ext.define('Module.PartOutBound', {
	extend : 'Ext.tab.Panel',
	initComponent : function() {
		var me = this;
		Ext.apply(me, {
			items : [ Ext.create('Module.PartOutApply', {}), Ext.create('Module.PartOutManage', {}) ]
		});

		me.callParent(arguments);
	}
});