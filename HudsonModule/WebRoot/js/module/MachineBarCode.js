/**
 * 模具机台条码打印页面
 */

Ext.define('Module.MachineBarCode', {
	extend : 'Project.component.BarcodePrintPanel',
	layout : {
		type : 'border'
	},
	title : '模具查询',

	initComponent : function() {
		var me = this;

		if (!App.paperFormat) {
			App.paperFormat = me.getPrintPaperFormat(1);
		}

		var macStore = Ext.create('Ext.data.Store', {
			storeId : 'machine-barcode-store-id',
			fields : [ "barcode", "batchno", "name" ],
			autoLoad : false,
			proxy : {
				type : 'ajax',
				url : '',
				reader : {
					type : 'json',
					root : "children"
				}
			}
		});

		Ext.applyIf(me, {
			items : [ {
				xtype : 'container',
				split : true,
				width : 260,
				region : 'west',
				layout : 'border',
				items : [ {
					xtype : 'treepanel',
					rootVisible : false,
					flex : 1,
					region : 'north',
					title : '部门单位',
					store : Ext.create('Ext.data.TreeStore', {
						fields : [ "barcode", "id", "text" ],
						autoLoad : true,
						nodeParam : 'stepId',
						proxy : {
							type : 'ajax',
							url : 'module/code/deptBarcode',
							reader : {
								type : 'json',
								root : "children"
							}
						}
					}),
					useArrows : true,

					listeners : {
						itemclick : me.onClickDeptMachine
					}
				}, {
					xtype : 'gridpanel',
					flex : 1,
					style : 'margin-top:5px;',
					rootVisible : false,
					region : 'center',
					title : '机台清单',
					useArrows : true,
					store : macStore,
					columns : [ {
						xtype : 'gridcolumn',
						width : 120,
						dataIndex : 'name',
						text : '机台名称',
						renderer : function(val) {
							return "<span class='user-16' style='display:inline-block;width:16px;height:16px;'>&nbsp;</span>&nbsp;" + val;
						}
					}, {
						xtype : 'gridcolumn',
						width : 80,
						dataIndex : 'batchno',
						text : '机台编号'
					} ],

					selModel : Ext.create('Ext.selection.CheckboxModel', {
						mode : 'SIMPLE'
					}),

					dockedItems : [ {
						xtype : 'toolbar',
						items : [ Ext.create('Project.component.FilterTextField', {
							emptyText : '查找...',
							filterField : 'text',
							width : 150,
							store : macStore
						}), '->', {
							text : '生成条码',
							scope : me,
							iconCls : 'vcard-16',
							handler : me.createMachineBarcode
						} ]
					} ]
				} ]
			}, Ext.create('Project.component.PrintPanel', {
				region : 'center',
				id : 'machine-barcode-printpanel',
				printObjectId : 'machine-barcode-object',
				printEmbedId : 'machine-barcode-embed',
				paperId : App.paperFormat.id,
				pageWidth : App.paperFormat.paperwidth,
				pargHeight : App.paperFormat.paperheight,
				unit : 'mm',
				intOrient : 1,// 打印方向
				pages : App.paperFormat.papers,
				gap : App.paperFormat.papergap,
				leftGap : App.paperFormat.leftgap,
				rightGap : App.paperFormat.rightgap
			}) ]
		});

		me.callParent(arguments);
	},

	/**
	 * 更新前提示
	 */
	onClickDeptMachine : function(grid, record) {
		Ext.getStore('machine-barcode-store-id').load({
			url : 'module/code/machineBarcode',
			params : {
				stepId : record.data.id
			}
		});
	},
	/**
	 * 更新模具信息
	 */
	createMachineBarcode : function(button) {
		var grid = button.up('gridpanel');

		this.previewBarcode('machine-barcode-printpanel', grid.getSelectionModel().getSelection(), 1, 14061803);
	}

});
