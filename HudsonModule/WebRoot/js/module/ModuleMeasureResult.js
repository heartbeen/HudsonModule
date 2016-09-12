/**
 * 
 */
Ext.define('Module.ModuleMeasureResult', {
	extend : 'Ext.panel.Panel',
	title : '工件测量',
	layout : 'fit',
	initComponent : function() {
		var me = this;

		Ext.applyIf(me, {

			layout : 'border',

			items : [ {
				xtype : 'tabpanel',
				region : 'center',
				items : [ Ext.create('Module.ModuleStereoscopicMeasure'), Ext.create('Module.ToleranceMeasure') ]
			} ]
		});

		me.callParent(arguments);
	}
});