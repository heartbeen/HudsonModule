/**
 * 
 */
Ext.define('System.Internationalization', {
	extend : 'Ext.panel.Panel',

	requires : [ 'System.model.grid.Internationalization', 'System.model.grid.InternationalizationContent' ],
	xtype : 'cell-editing',

	layout : {
		padding : 5,
		type : 'border'
	},
	title : '国际化',

	internatUrl : 'system/queryLocaleTag',
	contentUrl : 'system/queryLocaleContentByTag',

	internalStroeId : 'system.model.grid.Internationalization',
	contentStoreId : 'system.model.grid.InternationalizationContent',

	queryFormId : 'system.query.internationalization',

	initComponent : function() {
		var me = this;

		me.localeTagStore = new Ext.data.Store({
			storeId : me.internalStroeId,
			pageSize : 25,
			autoLoad : true,
			model : System.model.grid.Internationalization,
			proxy : {
				actionMethods : {
					read : "POST"
				},
				type : 'ajax',
				url : me.internatUrl,
				reader : {
					type : 'json',
					root : 'info',
					totalProperty : 'totalCount'
				}
			}
		});

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
						clicksToEdit : 2
					}) ],

					store : me.localeTagStore,
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
						width : 200,
						dataIndex : 'project_name',
						editor : new Ext.form.field.ComboBox({
							editable : false,
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
							editable : false,
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
						text : '创建日期'
					}, {
						xtype : 'gridcolumn',
						width : 77,
						dataIndex : 'modify_by',
						text : '修改人'
					}, {
						xtype : 'datecolumn',
						dataIndex : 'modify_date',
						text : '修改日期'
					} ],

					dockedItems : [ {
						xtype : 'pagingtoolbar',
						dock : 'bottom',
						width : 360,
						displayInfo : true,
						store : me.localeTagStore,
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
						scope : me,
						itemclick : me.onItemClick
					}
				}, {// 国际化内容
					xtype : 'gridpanel',
					flex : 2,
					region : 'center',
					title : '详细数据',
					columns : [ {
						xtype : 'gridcolumn',
						width : 100,
						dataIndex : 'locale_name',
						text : '语言'
					}, {
						xtype : 'gridcolumn',
						width : 360,
						dataIndex : 'lang_value',
						text : '内容',
						editor : {
							allowBlank : false
						}
					}, {
						xtype : 'gridcolumn',
						width : 72,
						dataIndex : 'create_by',
						text : '创建人'
					}, {
						xtype : 'datecolumn',
						width : 80,
						dataIndex : 'create_date',
						text : '创建日期'
					}, {
						xtype : 'gridcolumn',
						width : 77,
						dataIndex : 'modify_by',
						text : '修改人'
					}, {
						xtype : 'datecolumn',
						dataIndex : 'modify_date',
						text : '修改日期'
					} ],
					plugins : [ new Ext.grid.plugin.CellEditing({
						clicksToEdit : 1
					}) ],
					store : new Ext.data.Store({
						autoLoad : false,
						storeId : me.contentStoreId,
						model : System.model.grid.InternationalizationContent,
						proxy : {
							actionMethods : {
								read : "POST"
							},
							type : 'ajax',
							url : me.contentUrl,
							reader : {
								type : 'json'
							}
						}
					})
				} ]
			}, {
				xtype : 'form',
				region : 'west',
				id : me.queryFormId,
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
					name : 'lang_code',
					fieldLabel : '国际化代码'
				}, {
					xtype : 'textfield',
					style : {
						width : '100%'
					},
					name : 'lang_value',
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
					name : 'project_id',
					fieldLabel : '所属模块',
					labelStyle : 'margin-bottom:5px',
					displayField : 'name',
					editable : false,
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
					name : 'category',
					style : {
						width : '100%'
					},
					width : 158,
					editable : false,
					fieldLabel : '类型',
					labelStyle : 'margin-bottom:5px',
					store : [ [ 'user', '用户' ], [ 'sys', '系统' ] ]

				}, {
					xtype : 'button',
					width : 75,
					text : '查找',
					scope : me,
					handler : me.onQueryLang
				}, {
					xtype : 'button',
					margin : '0 0 0 7',
					width : 75,
					text : '重置',
					scope : me,
					handler : me.onRestQueryLang
				} ]
			} ]
		});

		me.callParent(arguments);
	},

	/**
	 * 增加国际化
	 */
	onAddClick : function() {
		// Create a model instance
		var rec = new System.model.grid.Internationalization();

		Ext.getStore(this.internalStroeId).insert(0, rec);
		// this.cellEditing.startEditByPosition({
		// row : 0,
		// column : 0
		// });
	},

	/**
	 * 显示当前标签的所有语言数据
	 */
	onItemClick : function(grid, record, item, index) {
		var me = this;

		if (grid.getSelectionModel().getSelection().length > 1) {
			Ext.getStore(me.contentStoreId).loadData([]);

			return;
		}

		Ext.getStore(me.contentStoreId).load({
			url : me.contentUrl,
			params : {
				lang_code : record.data.lang_code
			}
		});

	},

	/**
	 * 查询语言动作
	 */
	onQueryLang : function() {
		var me = this;

		Ext.getStore(me.internalStroeId).load({
			url : me.internatUrl,
			params : Ext.getCmp(me.queryFormId).getForm().getValues()
		});

		Ext.getStore(me.contentStoreId).loadData([]);
	},

	/**
	 * 查询语言动作
	 */
	onRestQueryLang : function() {
		Ext.getCmp(this.queryFormId).getForm().reset();

		this.onQueryLang();
	}

});