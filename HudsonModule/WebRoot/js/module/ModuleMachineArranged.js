Ext.define('Module.ModuleMachineArranged', {
	extend : 'Ext.panel.Panel',

	autoScroll : true,
	layout : {
		type : 'anchor'
	},
	bodyPadding : 5,
	collapsed : false,
	collapsible : true,
	title : '机台',
	items : [ {
		xtype : 'container',
		anchor : '100%',
		width : 100,
		layout : {
			type : 'table'
		},
		items : [ {
			xtype : 'textfield',
			fieldLabel : '加工类型',
			labelWidth : 70
		}, {
			xtype : 'textfield',
			margin : '0 0 5 5',
			fieldLabel : '加工者',
			labelWidth : 70
		} ]
	}, {
		xtype : 'gridpanel',
		height : 185,
		title : '已安排工件列表',
		columns : [ {
			xtype : 'rownumberer'
		}, {
			xtype : 'gridcolumn',
			width : 88,
			dataIndex : 'string',
			text : '工号'
		}, {
			xtype : 'gridcolumn',
			width : 70,
			dataIndex : 'number',
			text : '部号'
		}, {
			xtype : 'datecolumn',
			dataIndex : 'date',
			text : '预计开工'
		}, {
			xtype : 'datecolumn',
			dataIndex : 'bool',
			text : '预计完工'
		}, {
			xtype : 'gridcolumn',
			width : 75,
			text : '预计加工<br>用时(小时)'
		}, {
			xtype : 'datecolumn',
			text : '实际开工时间'
		}, {
			xtype : 'numbercolumn',
			width : 54,
			text : '件数'
		} ]
	} ],
	dockedItems : [ {
		xtype : 'toolbar',
		id : 'dept-machine-toolbar-id',
		dock : 'top',
		autoScroll : true,
		defaults : {
			margins : '0 5 0 0',
			pressed : false,
			toggleGroup : 'machines',
			allowDepress : false
		},
		items : Machines.length > 0 ? Machines : []
	} ]

});