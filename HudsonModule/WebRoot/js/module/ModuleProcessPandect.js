/**
 * 模具加工总览
 */
Ext.define('Module.ModuleProcessPandect', {
	extend : 'Portlet.PortalPanel',

	getTools : function() {
		return [ {
			xtype : 'tool',
			type : 'refresh',
			handler : function(e, target, header, tool) {
				var portlet = header.up('panel');
				var dataPanel = portlet.getComponent(0);

				try {
					dataPanel.getStore().load();
				} catch (e) {

				}
			}
		} ];
	},

	initComponent : function() {
		var me = this;

		Ext.applyIf(me, {
			iconCls : 'cog-16',
			items : [ {
				items : [ {
					title : '加工提醒',
					tools : me.getTools(),
					itmes : Ext.create('Module.portlet.ModulePartOperationCaution')
				}, {
					title : '工作量',
					tools : me.getTools(),
					itmes : Ext.create('Module.portlet.ModuleOperationWorkload')
				} ]
			}, {
				items : [ {
					title : '机台稼动',
					tools : me.getTools(),
					items : Ext.create('Module.portlet.ModuleMachineOperationRate')
				} ]
			} ]
		});

		me.callParent(arguments);
	}
});
