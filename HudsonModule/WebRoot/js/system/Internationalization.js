/**
 * 
 */
Ext.define('System.Internationalization', {
	extend : 'Ext.panel.Panel',

	requires : [ 'System.model.grid.Internationalization' ],
	xtype : 'cell-editing',

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
						text : '内容',
						editor : {
							allowBlank : false
						}
					} ]
				}, {
					xtype : 'gridpanel',
					flex : 3,
					margins : '0 0 5 0',
					region : 'north',
					title : '国际化代码列表',
					plugins : [ new Ext.grid.plugin.CellEditing({
						clicksToEdit : 1
					}) ],
					store : new Ext.data.Store({
						// destroy the store if the grid is destroyed
						storeId : 'system.model.grid.Internationalization',
						autoDestroy : true,
						model : System.model.grid.Internationalization,
						proxy : {
							type : 'ajax',
							url : '',
							reader : {
								type : 'json',
								record : 'plant'
							}
						}
					}),
					columns : [ {
						xtype : 'gridcolumn',
						width : 240,
						dataIndex : 'langcode',
						text : '国际化代码',
						editor : {
							allowBlank : false
						}
					}, {
						xtype : 'gridcolumn',
						text : '所属模块',
						dataIndex : 'projectid',
						editor : new Ext.form.field.ComboBox({
							typeAhead : true,
							triggerAction : 'all',
							store : [ [ '用户', 'user' ], [ '系统', 'sys' ] ]
						})
					}, {
						xtype : 'gridcolumn',
						text : '类型',
						dataIndex : 'category',
						editor : new Ext.form.field.ComboBox({
							typeAhead : true,
							triggerAction : 'all',
							store : [ [ '用户', 'user' ], [ '系统', 'sys' ] ]
						})
					}, {
						xtype : 'gridcolumn',
						width : 72,
						dataIndex : 'createby',
						text : '创建人'
					}, {
						xtype : 'datecolumn',
						width : 80,
						dataIndex : 'createdate',
						dataIndex : 'date',
						text : '创建日期'
					}, {
						xtype : 'gridcolumn',
						width : 77,
						dataIndex : 'modifyby',
						text : '修改人'
					}, {
						xtype : 'datecolumn',
						dataIndex : 'date',
						dataIndex : 'modifydate',
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
							iconCls : 'appointment-new-16',
							text : '新建 ',
							scope : this,
							handler : this.onAddClick
						}, {
							xtype : 'button',
							iconCls : 'edit-delete-16',
							text : '删除'
						}, {
							xtype : 'button',
							iconCls : 'filesave-16',
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
					fieldLabel : '国际化代码'
				}, {
					xtype : 'textfield',
					style : {
						width : '100%'
					},
					fieldLabel : '国际化内容',
					labelStyle : 'margin-bottom:5px',
					editor : {
						allowBlank : false
					}
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
	},
	onAddClick : function() {
		// Create a model instance
		var rec = new System.model.grid.Internationalization({
			common : 'New Plant 1',
			light : 'Mostly Shady',
			price : 0,
			availDate : Ext.Date.clearTime(new Date()),
			indoor : false
		});

		Ext.getStore("system.model.grid.Internationalization").insert(0, rec);
		// this.cellEditing.startEditByPosition({
		// row : 0,
		// column : 0
		// });
	}

});