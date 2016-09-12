/**
 * 改模工件增加介面
 */
Ext.define('Module.ModuleModifyPart', {
	extend : 'Ext.panel.Panel',

	title : '修模与设变工件',

	layout : {
		type : 'border'
	},
	id : 'Module.ModuleModifyPart',

	moduleBarcode : '',
	initComponent : function() {
		var me = this;

		Ext.apply(me, {
			items : [ {
				xtype : 'container',
				region : 'west',
				width : 180,
				layout : 'border',
				items : [ {
					xtype : 'treepanel',
					region : 'center',
					flex : 1,
					title : '选择模具工号',
					rootVisible : false,
					viewConfig : {
						emptyText : '<h1 style="margin:10px">查询不到模具工号</h1>',
					},
					store : Ext.create('Ext.data.TreeStore', {
						fields : [ 'resumeid', 'remark', {
							name : 'starttime',
							type : 'date'
						}, {
							name : 'endtime',
							type : 'date'
						}, 'resumestate', 'text', 'id', 'leaf' ],
						autoLoad : false,
						proxy : {
							url : '',
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
						items : [ Ext.create('Module.ModuleFindTextField', {
							queryLength : 2
						}) ]
					} ],
					listeners : {
						itemclick : me.onClickModuleNumber
					}
				} ]
			}, {
				xtype : 'tabpanel',
				margins : '0 0 0 5',
				region : 'center',
				items : [ {
					xtype : 'gridpanel',
					id : 'modify-exits-part-grid-id',
					height : 150,
					title : '已有工件号',
					store : Ext.create('Ext.data.Store', {
						storeId : 'modify-part-list-id',
						fields : [ 'partbarlistcode', 'partlistcode', 'cnames', 'infoid', 'remark' ],
						autoLoad : false,
						proxy : {
							type : 'ajax',
							url : 'public/modulePartList',
							reader : {
								type : 'json'
							}
						}
					}),
					columns : [ {
						xtype : 'gridcolumn',
						dataIndex : 'partbarlistcode',
						width : 120,
						text : '工件条码号'
					}, {
						xtype : 'gridcolumn',
						dataIndex : 'partlistcode',
						text : '工件编号'
					}, {
						xtype : 'gridcolumn',
						dataIndex : 'cnames',
						text : '工件名称'
					}, {
						xtype : 'gridcolumn',
						dataIndex : 'infoid',
						width : 80,
						text : '工件名称',
						renderer : function(val) {
							return val != '' ? '<span style="color:blue;">已安排</span>' : '';
						}
					}, {
						xtype : 'gridcolumn',
						dataIndex : 'remark',
						width : 200,
						text : '工件说明'
					} ],
					selModel : Ext.create('Ext.selection.CheckboxModel', {
						mode : 'SIMPLE'
					}),
					dockedItems : [ {
						xtype : 'toolbar',
						items : [ {
							xtype : 'button',
							text : '确认增加',
							iconCls : 'dialog-apply-16',
							scope : me,
							handler : me.onSubmitModuleResume
						} ]
					} ]
				}, {
					xtype : 'panel',
					title : '新增工件号',
					bodyPadding : 5,
					layout : 'border',

					items : [ {
						xtype : 'panel',
						title : '添加工件',
						region : 'north',
						flex : 1,
						scroll : true,
						defaults : {
							labelWidth : 60,
							padding : '7 0 0 10'
						},
						layout : {
							type : 'table',
							columns : 3
						},
						items : [ {
							id : 'modify-part-type-txt',
							xtype : 'combobox',
							fieldLabel : '工件类型',
							valueField : 'classcode',
							displayField : 'chinaname',
							editable : false,
							store : new Ext.data.Store({
								proxy : {
									type : 'ajax',
									url : 'public/getPartRaceInfo',
									reader : {
										type : 'json',
										root : 'races'
									}
								},
								fields : [ 'classcode', 'chinaname' ]
							})
						}, {
							id : 'modify-part-type-code',
							xtype : 'textfield',
							fieldLabel : '类型代号',
							readOnly : true
						}, {
							id : 'modify-part-type-batch',
							xtype : 'textfield',
							fieldLabel : '工件编号',
							regex : me.partCodePattern
						}, {
							id : 'modify-part-list-name',
							xtype : 'textfield',
							fieldLabel : '工件名称'
						}, {
							id : 'modify-part-list-source',
							xtype : 'textfield',
							fieldLabel : '工件材料'
						}, {
							id : 'modify-part-list-norms',
							xtype : 'textfield',
							fieldLabel : '零件规格'
						}, {
							id : 'modify-part-list-count',
							xtype : 'textfield',
							fieldLabel : '工件总数',
							regex : me.partCreatePattern
						}, {
							id : 'modify-part-list-isfit',
							xtype : 'checkbox',
							fieldLabel : '是否固件'
						} ]
					}, {
						xtype : 'treepanel',
						region : 'center',
						margin : '5 0 0 0',
						flex : 1,
						title : '工件暂存',
						useArrows : true,
						rootVisible : false,
						selModel : {
							selType : 'checkboxmodel',
							mode : 'SIMPLE',
							toggleOnClick : false
						},
						rowLines : true,
						columnLines : true,
						forceFit : true,
						store : new Ext.data.TreeStore({
							root : {
								text : 'root',
								expand : false
							},
							fields : [ 'id', 'text', 'source', 'isfit', 'bodytxt', 'suffix', 'norms', 'count', 'type' ]
						}),
						columns : [ {
							xtype : 'treecolumn',
							dataIndex : 'text',
							text : '工件名称'
						}, {
							xtype : 'gridcolumn',
							dataIndex : 'id',
							text : '工件编号'
						}, {
							xtype : 'gridcolumn',
							dataIndex : 'source',
							text : '工件材质'
						}, {
							xtype : 'gridcolumn',
							dataIndex : 'norms',
							text : '工件规格'
						}, {
							xtype : 'gridcolumn',
							dataIndex : 'count',
							text : '统计数量',
							width : 40,
							align : 'right'
						}, {
							xtype : 'checkcolumn',
							dataIndex : 'isfit',
							disabled : true,
							width : 40,
							text : '是否固件'
						} ],
						tbar : [ {
							text : '新增工件',
							iconCls : 'gtk-add-16',
							handler : me.onClickNewPart
						}, '-', {
							text : '删除工件',
							iconCls : 'gtk-remove-16',
							handler : function() {
								var listGrid = Ext.getCmp('modify-part-list-grid');
								var selNode = listGrid.getSelectionModel().getSelection();
								if (!selNode.length) {
									return;
								}
								me.onClearSelectNodes(selNode);
							}
						}, '-', {
							text : '保存工件',
							iconCls : 'gtk-save-16',
							handler : me.onClickSavePart
						} ],
						width : '100%',
						flex : 2
					} ]
				} ]
			} ]
		});

		me.callParent(arguments);
	},

	/** 点击模具工号显示模具相应工件清单 */
	onClickModuleNumber : function(treeview, record) {

		if (record) {
			var me = Ext.getCmp('Module.ModuleModifyPart');
			me.moduleRecord = record;
			var store = Ext.getStore('modify-part-list-id');
			store.load({
				url : store.proxy.url,
				params : {
					moduleBarcode : record.data.id
				}
			});
		}

	},

	/** 提交改模所在加工的工件与改模信息 */
	onSubmitModuleResume : function() {

		var selection = App.getModel('modify-exits-part-grid-id');

		if (selection) {
			var me = this;
			var win = Ext.create('Module.ModuleResumeWindow', {
				moduleRecord : me.moduleRecord,
				title : me.moduleRecord.data.text + ' 加工工件信息'
			});

			win.show();
			win.partStore.loadData(selection);
		}

	},

	onClickNewPart : function() {
	},

	onClickSavePart : function() {
	}
});
