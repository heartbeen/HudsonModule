Ext.define('Module.ModuleMachineBurden', {
	extend : 'Ext.panel.Panel',

	layout : {
		type : 'border'
	},

	initComponent : function() {
		var me = this;

		Ext.applyIf(me, {
			items : []
		});

		me.callParent(arguments);
	}

});