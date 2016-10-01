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
					flex : 3,
					margins : '0 0 5 0',
					region : 'north',
					title : '国际化代码列表',
					plugins : [ new Ext.grid.plugin.CellEditing({
						clicksToEdit : 1
					}) ],

					store : new Ext.data.Store({
						storeId : 'system.model.grid.Internationalization',
						pageSize : 25,
						autoLoad : true,
						model : System.model.grid.Internationalization,
						proxy : {
							actionMethods : {
								read : "POST"
							},
							type : 'ajax',
							url : 'system/queryLocaleTag',
							reader : {
								type : 'json',
								root : 'info',
								totalProperty : 'totalCount'
							}
						}
					}),
					columns : [ {
						xtype : 'gridcolumn',
						width : 240,
						dataIndex : 'lang_code',
						text : '国际化代码',
						editor : {
							allowBlank : false
						}
					}, {
						xtype : 'gridcolumn',
						text : '所属模块',
						dataIndex : 'project_id',
						editor : new Ext.form.field.ComboBox({
							// typeAhead : true,
							// triggerAction : 'all',
							displayField : 'name',
							valueField : 'id',
							// queryMode : 'local',
							store : {
								fields : [ 'name', 'id', 'parentid' ],
								proxy : {
									type : 'ajax',
									url : 'system/queryProjectModule',
									reader : {
										type : 'json'
									}
								}
							}
						})
					}, {
						xtype : 'gridcolumn',
						text : '类型',
						dataIndex : 'category',
						editor : new Ext.form.field.ComboBox({
							store : [ [ 'user', '用户' ], [ 'sys', '系统' ] ]
						})
					}, {
						xtype : 'gridcolumn',
						width : 72,
						dataIndex : 'create_by',
						text : '创建人'
					}, {
						xtype : 'datecolumn',
						width : 80,
						dataIndex : 'create_date',
						dataIndex : 'date',
						text : '创建日期'
					}, {
						xtype : 'gridcolumn',
						width : 77,
						dataIndex : 'modify_by',
						text : '修改人'
					}, {
						xtype : 'datecolumn',
						dataIndex : 'date',
						dataIndex : 'modify_date',
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
						}, '-', {
							xtype : 'button',
							iconCls : 'edit-delete-16',
							text : '删除'
						}, '-', {
							xtype : 'button',
							iconCls : 'filesave-16',
							text : '保存'
						} ]
					} ],
					selModel : Ext.create('Ext.selection.CheckboxModel', {

					}),
					listeners : {
						itemclick : me.onItemClick
					}
				}, {
					xtype : 'gridpanel',
					flex : 2,
					region : 'center',
					title : '详细数据',
					columns : [ {
						xtype : 'gridcolumn',
						width : 100,
						dataIndex : 'localename',
						text : '语言'
					}, {
						xtype : 'gridcolumn',
						width : 360,
						dataIndex : 'langvalue',
						text : '内容',
						editor : {
							allowBlank : false
						}
					} ],
					store : new Ext.data.Store({
						storeId : 'system.model.grid.InternationalizationContent',
						model : System.model.grid.InternationalizationContent,
						proxy : {
							type : 'memory',
							reader : {
								type : 'json'
							}
						}
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
					labelStyle : 'margin-bottom:5px',
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
					labelStyle : 'margin-bottom:5px',
					displayField : 'name',
					valueField : 'id',
					store : {
						fields : [ 'name', 'id', 'parentid' ],
						proxy : {
							type : 'ajax',
							url : 'system/queryProjectModule',
							reader : {
								type : 'json'
							}
						}
					}
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
		var rec = new System.model.grid.Internationalization();

		Ext.getStore("system.model.grid.Internationalization").insert(0, rec);
		// this.cellEditing.startEditByPosition({
		// row : 0,
		// column : 0
		// });
	},

	/**
	 * 显示当前标签的所有语言数据
	 */
	onItemClick : function(grid, record, item, index) {

		var data = [ {
			id : 1,
			localename : '简体中文'
		}, {
			id : 2,
			localename : 'English'
		} ];

		Ext.getStore("system.model.grid.InternationalizationContent").loadData(data);

	}

});