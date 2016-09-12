/**
 * 模具加工机台负荷公告板
 */
Ext.define('Module.portlet.MachineLoadPortlet', {
	extend : 'Ext.panel.Panel',
	height : 300,
	initComponent : function() {
		var me = this;

		Ext.apply(this, {});

		me.callParent(arguments);
	},

	getName : function() {
		return Module.portlet.MachineLoadPortlet.getName();
	}
});
