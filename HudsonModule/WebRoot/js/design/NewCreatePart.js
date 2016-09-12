/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('Part', {
	extend : 'Ext.data.Model',
	fields : [ 'id', 'partcode', 'description', 'material', 'quantity', 'partsize', 'uglayout', 'remark' ]
});

var cavity = /^[1][0]{2}$/;
var cavity_child = /^[1][0-9]{2}$/;

var core = /^[2][0]{2}$/;
var core_child = /^[2][0-9]{2}$/;

var moduleid;

mainArray = new Array();
standardArray = new Array();
baseArray = new Array();

Ext.define('NewPartGrid', {
	extend : 'Ext.grid.Panel',

	initComponent : function() {
		var me = this;

		Ext.apply(me, {
			store : Ext.create('Ext.data.Store', {

				model : 'Part',

				proxy : {
					type : 'memory',
					reader : {
						type : 'json',
						root : 'part'

					}
				}
			}),

			// 无权限时不启用编辑插件
			plugins : UserAuth.NewCreatePart.increase != 'Y' ? null : Ext.create('Ext.grid.plugin.CellEditing', {
				pluginId : me.pluginId,
				clicksToEdit : 1,
				listeners : {
					edit : function(editor, e, eOpts) {// 这个方法只对特定的工厂有效
						// TODO 这里要写自动填充工件名称代码
						// 当记录有更改时进行记录
						if (e.originalValue != e.value) {
							me.array[e.rowIdx] = e.record.data;// 记录更改过的数据
						}

					}
				}
			}),
			columns : [ {
				xtype : 'gridcolumn',
				width : 62,
				dataIndex : 'partcode',
				text : '部号',
				field : {
					type : 'textfield',
					maxLength : 10
				}
			}, {
				xtype : 'gridcolumn',
				dataIndex : 'description',
				text : '名称',
				editor : new Ext.form.field.ComboBox({
					id : me.comboId,
					typeAhead : true,
					triggerAction : 'all',
					selectOnTab : true,
					displayField : 'text',
					store : me.partname,//
					lazyRender : true,
					listClass : 'x-combo-list-small'
				})
			}, {
				xtype : 'gridcolumn',
				dataIndex : 'material',
				width : 79,
				text : '材质',
				field : {
					type : 'combobox',
					maxLength : 20
				}
			}, {
				xtype : 'gridcolumn',
				dataIndex : 'quantity',
				width : 43,
				text : '数量',
				renderer : function(value, metaData, record, rowIdx, colIdx, store, view) {
					value = value < 1 ? 1 : value;
					return value;
				},
				field : {
					xtype : 'numberfield'
				}
			}, {
				xtype : 'gridcolumn',
				dataIndex : 'partsize',
				text : '规格',
				field : {
					type : 'textfield',
					maxLength : 50
				}
			}, {
				xtype : 'gridcolumn',
				dataIndex : 'uglayout',
				width : 62,
				text : '图层',
				field : {
					type : 'textfield',
					maxLength : 5
				}
			}, {
				xtype : 'gridcolumn',
				dataIndex : 'remark',
				text : '说明',
				field : {
					type : 'textfield',
					maxLength : 50
				}
			} ]

		});

		me.callParent(arguments);
	}
});

var mainGrid = Ext.create('NewPartGrid', {

	id : 'design-main-part-grid',
	title : '模具主件',
	pluginId : 'desing-main-part-plugin',
	comboId : 'main-part-combobox',
	partname : ModulePartName.main,
	array : mainArray

});

var standardGrid = Ext.create('NewPartGrid', {
	id : 'design-standard-part-grid',
	title : '模具配件',
	pluginId : 'desing-standard-part-plugin',
	comboId : 'standard-part-combobox',
	partname : ModulePartName.standard,
	array : standardArray
});

var baseGrid = Ext.create('NewPartGrid', {
	id : 'design-mold_base-grid',
	title : '模板',
	pluginId : 'desing-moldbase-part-plugin',
	comboId : 'base-part-combobox',
	partname : ModulePartName.moldbase,
	array : baseArray
});

var screwGrid = Ext.create('NewPartGrid', {
	id : 'design-screw-part-grid',
	title : '镙丝',
	pluginId : 'desing-screw-part-plugin'
});

Ext.define('Manage.Design.NewCreatePart', {
	extend : 'Ext.ux.desktop.Module',

	// requires : [ 'Ext.tab.Panel', 'Ext.panel.Panel' ],

	id : UserAuth.NewCreatePart.itemWebId,

	init : function() {

	},

	createWindow : function() {
		var me = this;

		var desktop = me.app.getDesktop();

		var win = desktop.getWindow(UserAuth.NewCreatePart.itemWebId);

		console.log(win);
		if (!win) {
			win = desktop.createWindow({
				id : UserAuth.NewCreatePart.itemWebId,
				title : eval(UserAuth.NewCreatePart.itemTitle),
				width : 760,
				height : 600,
				iconCls : UserAuth.NewCreatePart.itemIcon,
				animCollapse : false,
				border : false,
				constrainHeader : true,

				layout : 'border',
				items : [ {
					xtype : 'container',
					region : 'west',
					layout : 'border',
					width : 200,
					items : [ {
						xtype : 'treepanel',
						id : 'design-module-tree',
						region : 'center',
						flex : 2,
						title : '模具工号',
						dockedItems : [ {
							xtype : 'toolbar',
							dock : 'top',
							ui : 'footer',
							items : [ {
								iconCls : 'view-refresh-16',
								handler : function() {
									Ext.getStore('new-part-modulno-tree').load();

									moduleid = '';

									App.clearTable(mainGrid);
									App.clearTable(baseGrid);
									App.clearTable(standardGrid);
									App.clearTable(screwGrid);
								}
							} ]
						} ],
						store : Ext.create('Ext.data.TreeStore', {

							storeId : 'new-part-modulno-tree',
							autoLoad : true,
							proxy : {
								url : 'ModuleServlet?aid=104010004',
								// 自动导入工号
								type : 'ajax',
								reader : {
									type : 'json',
									root : 'children'
								}
							}
						}),

						rootVisible : false,
						scope : me,
						listeners : {
							itemclick : me.onModuleClick
						}
					}, {
						xtype : 'propertygrid',
						region : 'south',
						flex : 1,
						source : {
							'Property 1' : 'String',
							'Property 2' : true,
							'Property 3' : '2013-07-08T11:20:14',
							'Property 4' : 123
						}
					} ]

				}, {
					xtype : 'tabpanel',
					id : 'design-create-part-tabpanel',
					margins : '0 0 0 5',
					region : 'center',
					activeTab : 0,
					items : [ mainGrid, standardGrid, baseGrid, screwGrid ],// 工件表
					dockedItems : UserAuth.NewCreatePart.increase != 'Y' ? null : [ {// 无权限不显示增加操作
						xtype : 'toolbar',
						dock : 'bottom',
						ui : 'footer',// 此项可以设置按键UI
						items : [ {
							xtype : 'button',
							text : '',
							iconCls : 'add-16',
							handler : me.onAddPartClick
						}, {
							xtype : 'button',
							text : '',
							iconCls : 'remove-16',
							itemId : 'delete',
							scope : me,
							handler : me.onDeleteClick
						}, {
							xtype : 'button',
							text : '导入标准模板',
							scope : me,
							iconCls : 'human-folder-new-16',
							handler : me.onSavePartClick
						}, '-', {
							xtype : 'label',
							id : 'new-part-error-label'
						}, '->', {
							xtype : 'button',
							text : '保存资料',
							scope : me,
							iconCls : 'stock_save-16',
							handler : me.onSavePartClick
						} ]
					} ]
				} ]
			});
		}

		return win;
	},

	onSelectChange : function(selModel, selections) {
		this.down('#delete').setDisabled(selections.length === 0);
	},

	/**
	 * 点击模具工号得到模具的工件清单
	 */
	onModuleClick : function(view, rcd, item, idx, event, eOpts) {

		// 没有查询权限
		if (UserAuth.NewCreatePart.renovate != 'Y') {
			return;
		}

		// 得到选中的模具ID号
		if (rcd.get('leaf')) {
			moduleid = rcd.get("id");

			// 增加工件清单
			Ext.Ajax.request({
				url : 'ModuleServlet',
				params : {
					aid : 104010006,
					moduleid : moduleid
				},
				success : function(response) {

					var parts = JSON.parse(response.responseText);

					mainGrid.getStore().loadData(parts.main);
					baseGrid.getStore().loadData(parts.base);
					standardGrid.getStore().loadData(parts.standard);
					screwGrid.getStore().loadData(parts.screw);
				}
			});

			App.clearArray(mainArray);
			App.clearArray(standardArray);
			App.clearArray(baseArray);
		}

	},

	/**
	 * 增加一个工件空行
	 */
	onAddPartClick : function() {

		if (!moduleid) {
			return;
		}

		var tab = Ext.getCmp('design-create-part-tabpanel').getActiveTab();
		var store = tab.getStore();

		var editing = tab.getPlugin(tab.pluginId);

		editing.cancelEdit();
		store.insert(store.count(), new Part({
			'id' : '',
			'partcode' : '',
			'description' : '',
			'material' : '',
			'quantity' : '1',
			'partsize' : '',
			'uglayout' : '',
			'remark' : ''

		}));

		// 编辑行定位
		editing.startEditByPosition({
			row : store.count() - 1,
			column : 0
		});

	},

	/**
	 * 删除一个工件信息
	 */
	onDeleteClick : function() {
		var tab = Ext.getCmp('design-create-part-tabpanel').getActiveTab();
		var selection = tab.getSelectionModel().getSelection()[0];
		if (selection) {
			tab.store.remove(selection);
		}
	},

	/**
	 * 保存工件清单
	 */
	onSavePartClick : function() {
		if (!moduleid) {
			return;
		}

		var mainParts = this.onAnalyzeData(mainArray, 'M');
		var standardParts = this.onAnalyzeData(standardArray, 'S');
		var baseParts = this.onAnalyzeData(baseArray, 'B');
		var screwParts = 'null';

		console.log(mainParts);
		// 增加工件清单
		Ext.Ajax.request({
			url : 'ModuleServlet',
			params : {
				aid : 104010005,
				mainParts : mainParts,
				standardParts : standardParts,
				baseParts : baseParts,
				screwParts : screwParts
			},
			success : function(response) {

			}
		});

	},

	/**
	 * 对store进行分析并生成JSON
	 * 
	 * @param store
	 */
	onAnalyzeData : function(array, type) {
		var parts = 'null';
		var model;
		if (array.length > 0) {
			// moduleid
			parts = '';
			for ( var i = 0; i < array.length; i++) {
				model = array[i];

				if (model == undefined || model.partcode === '')
					continue;

				parts = parts + 'moduleid:' + moduleid + ',';
				parts = parts + 'partcode:' + model.partcode + ',';
				parts = parts + 'partindex:0,';
				parts = parts + 'description:' + (model.description ? model.description : '') + ',';
				parts = parts + 'type:' + type + ',';
				parts = parts + 'quantity:' + model.quantity + ',';
				parts = parts + 'material:' + model.material + ',';
				parts = parts + 'partsize:' + model.partsize + ',';
				parts = parts + 'uglayout:' + model.uglayout + ',';
				parts = parts + 'partflag:N,';
				parts = parts + 'remark:' + model.remark + (i == array.length - 1 ? model.quantity == 1 ? '' : "##" : "##");//这个判断很重要

				if (model.quantity == 1)
					continue;

				for ( var x = 1; x <= parseInt(model.quantity); x++) {

					parts = parts + 'moduleid:' + moduleid + ',';
					parts = parts + 'partcode:' + model.partcode + ',';
					parts = parts + 'partindex:' + x + ',';
					parts = parts + 'description:' + (model.description ? model.description : '') + ',';
					parts = parts + 'type:' + type + ',';
					parts = parts + 'quantity:1,';
					parts = parts + 'material:' + model.material + ',';
					parts = parts + 'partsize:' + model.partsize + ',';
					parts = parts + 'uglayout:' + model.uglayout + ',';
					parts = parts + 'partflag:N,';
					parts = parts + 'remark:' + model.remark + (x == model.quantity ? i == array.length - 1 ? '' : '##' : "##");//这个判断很重要

				}
			}

			parts = parts === '' ? null : parts;
		}

		return parts;
	},

	onCellKey : function(grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {

		console.log(record.data.partcode);
	}

});
