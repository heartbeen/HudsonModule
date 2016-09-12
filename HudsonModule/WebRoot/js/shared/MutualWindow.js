Ext.define('Share.MutualWindow', {
	extend : 'Ext.window.Window',

	modal : true,
	layout:'border',

	initComponent : function() {
		var me = this;

		Ext.apply(me, {

			items:[{
				xtype:'container',
				style:'border-bottom:1px ',
				region:'north',
			},]
		});

		me.callParent(arguments);
	}

});