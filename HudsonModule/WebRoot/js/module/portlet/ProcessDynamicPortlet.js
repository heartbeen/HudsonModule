/**
 * 工件加工信息公告板
 */
Ext.define('Module.portlet.ProcessDynamicPortlet', {
	extend : 'Ext.panel.Panel',
	height : 290,
	initComponent : function() {
		var me = this;

		Ext.apply(me, {});

		this.callParent(arguments);
	},

	getName : function() {
		return Module.portlet.ProcessDynamicPortlet.getName();
	}
});
