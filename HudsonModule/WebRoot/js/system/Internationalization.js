/**
 * 
 */
Ext.define('System.Internationalization', {
	extend : 'Ext.panel.Panel',
	layout : {
		padding : 5,
		type : 'border'
	},
	title : '国际化',

	initComponent : function() {
		var me = this;

		Ext.applyIf(me, {
			items : [ {
				xtype : 'container',
				region : 'center',
				layout : {
					type : 'border'
				},
				items : [ {
					xtype : 'gridpanel',
					flex : 2,
					region : 'center',
					title : '详细数据',
					columns : [ {
						xtype : 'gridcolumn',
						width : 88,
						dataIndex : 'string',
						text : '语言'
					}, {
						xtype : 'numbercolumn',
						width : 345,
						dataIndex : 'number',
						text : '内容'
					} ]
				}, {
					xtype : 'gridpanel',
					flex : 3,
					margins : '0 0 5 0',
					region : 'north',
					height : 179,
					title : '国际化代码列表',
					columns : [ {
						xtype : 'gridcolumn',
						width : 186,
						dataIndex : 'string',
						text : '国际化代码'
					}, {
						xtype : 'gridcolumn',
						text : '所属模块'
					}, {
						xtype : 'gridcolumn',
						text : '类型'
					}, {
						xtype : 'gridcolumn',
						width : 72,
						text : '创建人'
					}, {
						xtype : 'datecolumn',
						width : 80,
						dataIndex : 'date',
						text : '创建日期'
					}, {
						xtype : 'gridcolumn',
						width : 77,
						text : '修改人'
					}, {
						xtype : 'datecolumn',
						dataIndex : 'date',
						text : '修改日期'
					} ],
					dockedItems : [ {
						xtype : 'pagingtoolbar',
						dock : 'bottom',
						width : 360,
						displayInfo : true
					}, {
						xtype : 'toolbar',
						dock : 'top',
						items : [ {
							xtype : 'button',
							text : '新建 '
						}, {
							xtype : 'button',
							text : '删除'
						}, {
							xtype : 'button',
							text : '保存'
						} ]
					} ],
					selModel : Ext.create('Ext.selection.CheckboxModel', {

					})
				} ]
			}, {
				xtype : 'form',
				region : 'west',
				margin : '0 5 0 0',
				minWidth : 180,
				width : 180,
				bodyPadding : 10,
				collapsed : false,
				collapsible : true,
				title : '查询',
				fieldDefaults : {
					labelAlign : 'top',
					labelWidth : 100
				},
				items : [ {
					xtype : 'textfield',
					style : {
						width : '100%'
					},
					fieldLabel : '国际化代码',
					labelStyle : 'margin-bottom:5px'
				}, {
					xtype : 'textfield',
					style : {
						width : '100%'
					},
					fieldLabel : '国际化内容',
					labelStyle : 'margin-bottom:5px'
				}, {
					xtype : 'combobox',
					margin : '0 0 10 0',
					style : {
						width : '100%'
					},
					width : 158,
					fieldLabel : '所属模块',
					labelStyle : 'margin-bottom:5px'
				}, {
					xtype : 'combobox',
					margin : '0 0 10 0',
					style : {
						width : '100%'
					},
					width : 158,
					fieldLabel : '类型',
					labelStyle : 'margin-bottom:5px'
				}, {
					xtype : 'button',
					width : 75,
					text : '查找'
				}, {
					xtype : 'button',
					margin : '0 0 0 7',
					width : 75,
					text : '重置'
				} ]
			} ]
		});

		me.callParent(arguments);
	}

});