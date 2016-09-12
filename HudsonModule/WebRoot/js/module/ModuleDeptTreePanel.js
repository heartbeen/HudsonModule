/**
 * 加工单位模具工号树面板,通用组件
 */
Ext.define('Module.ModuleDeptTreePanel', {
	extend : 'Ext.tree.Panel',

	split : true,
	width : 180,
	collapsed : false,
	collapsible : true,
	rootVisible : false,
	title : '模具工号',
	store : Ext.create('Ext.data.TreeStore', {
		autoLoad : true,
		proxy : {
			url : 'module/process/deptModule',
			// 自动导入工号
			type : 'ajax',
			reader : {
				type : 'json',
				root : 'children'
			}
		}
	}),
	dockedItems : [ {
		xtype : 'toolbar',
		dock : 'top',
		items : [ {
			text : '刷新',
			iconCls : 'view-refresh-16',
			handler : function() {
				var treepanel = this.up('treepanel');
				treepanel.getStore().load();

				if (treepanel.invoke) {
					for ( var i in treepanel.invoke) {
						treepanel.invoke[i].call();
					}
				}
			}
		} ]
	} ]
});