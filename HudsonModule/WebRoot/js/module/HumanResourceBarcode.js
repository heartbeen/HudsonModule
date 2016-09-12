/**
 * HumanResourceBarcode
 */
/**
 * 模具工件条码打印介面
 * 
 * 作者:David Email:xuweissh@163.com
 */
Ext.define('Module.HumanResourceBarcode', {
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

		var humanStore = Ext.create('Ext.data.Store', {
			storeId : 'human-barcode-store-id',
			fields : [ "barcode", "worknumber", "text", "empname" ],
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
						storeId : 'dept-region-barcode-store-id',
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
					dockedItems : [ {
						xtype : 'toolbar',
						items : [ '->', {
							text : '生成条码',
							scope : me,
							iconCls : 'vcard-16',
							handler : me.createDeptRegion
						} ]
					} ],

					listeners : {
						itemclick : me.onClickDeptRegion
					}
				}, {
					xtype : 'gridpanel',
					flex : 1,
					style : 'margin-top:5px;',
					rootVisible : false,
					region : 'center',
					title : '人员',
					useArrows : true,
					store : humanStore,
					columns : [ {
						xtype : 'gridcolumn',
						width : 100,
						dataIndex : 'text',
						text : '姓名',
						renderer : function(val) {
							return "<span class='user-16' style='display:inline-block;width:16px;height:16px;'>&nbsp;</span>&nbsp;" + val;
						}
					}, {
						xtype : 'gridcolumn',
						width : 80,
						dataIndex : 'worknumber',
						text : '工号'
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
							store : humanStore
						}), '->', {
							text : '生成条码',
							iconCls : 'vcard-16',
							scope : me,
							handler : me.createHumanBarcode
						} ]
					} ]
				} ]
			}, Ext.create('Project.component.PrintPanel', {
				region : 'center',
				id : 'human-barcode-printpanel',
				printObjectId : 'human-barcode-object',
				printEmbedId : 'human-barcode-embed',
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
	 * 查询当前单位的人员
	 */
	onClickDeptRegion : function(treepanel, record, item, index, e, eOpts) {
		if (record.data.id && record.data.id.length >= 4) {
			Ext.getStore('human-barcode-store-id').load({
				url : 'module/code/employeeBarcode',
				params : {
					stepId : record.data.id
				}
			});
		}

	},

	/**
	 * 生成模具加工单位条码
	 */
	createDeptRegion : function(button) {
		var tree = button.up('treepanel');
		// 如果格式为人员条码格式时,就重新更新格式 this.contextFormat为共用变量
		if (this.contextFormat && this.contextFormat.length == 3) {
			this.contextFormat = null;
		}

		this.previewBarcode('human-barcode-printpanel', tree.getChecked(), 1, 14061802);
	},

	/**
	 * 生成人员的条码
	 */
	createHumanBarcode : function(button) {
		var grid = button.up('gridpanel');
		// 如果格式为模具加工单位条码格式时,就重新更新格式 this.contextFormat为共用变量
		if (this.contextFormat && this.contextFormat.length == 2) {
			this.contextFormat = null;
		}
		this.previewBarcode('human-barcode-printpanel', grid.getSelectionModel().getSelection(), 1, 14061801);

	}
});
