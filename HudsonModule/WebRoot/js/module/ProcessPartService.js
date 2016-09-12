Ext.define('Module.ProcessPartService', {
	extend : 'Ext.panel.Panel',
	title : '加工管理',
	layout : 'border',
	initComponent : function() {
		var me = this;
		me.items = [ {
			xtype : 'panel',
			region : 'north',
			title : '加工资料',
			height : 400,
			defaults : {
				padding : 2
			},
			layout : 'border',
			items : [ {
				xtype : 'panel',
				title : '机台讯息',
				region : 'west',
				width : 200
			}, {
				xtype : 'panel',
				border : false,
				region : 'center',
				defaults : {
					padding : 1,
				},
				layout : 'border',
				items : [ {
					xtype : 'panel',
					title : '员工讯息',
					region : 'north',
					flex : 2
				}, {
					xtype : 'panel',
					title : '工件讯息',
					region : 'center',
					flex : 3
				} ]
			} ]
		}, {
			title : '工件明细',
			xtype : 'gridpanel',
			region : 'center',
			columns : [ {
				text : 'row',
				rowIndex:'hello'
			} ]
		} ];

		me.callParent(arguments);
	}
});