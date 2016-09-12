/**
 * 新建工件面板
 */
Ext.define('Module.ModuleBuildPart', {
	extend : 'Ext.panel.Panel',

	initComponent : function() {
		var me = this;

		Ext.apply(me, {
			layout : 'border',
			items : [ {
				xtype : 'tabpanel',
				region : 'center',
				border : false,
				items : [ Ext.create('Module.CoxonModuleNewPart'), Ext.create('Module.ModuleModifyPart') ]
			} ]

		});

		me.callParent(arguments);
	}
});