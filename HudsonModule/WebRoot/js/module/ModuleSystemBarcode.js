/**
 * 模具工件条码打印介面
 * 
 * 作者:David Email:xuweissh@163.com
 */
Ext.define('Module.ModuleSystemBarcode', {
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
		var partStore = Ext.create('Ext.data.Store', {
			id : 'module-system-barcode-store-id',
			fields : [ "barcodeid", "name" ],
			autoLoad : true,
			proxy : {
				type : 'ajax',
				url : 'module/code/systemBarcode',
				reader : {
					type : 'json',
				}
			}
		});

		Ext.applyIf(me, {
			items : [ {
				xtype : 'gridpanel',
				split : true,
				width : 230,
				region : 'west',
				title : '系统条码',
				store : partStore,

				columns : [ {
					xtype : 'gridcolumn',
					width : 85,
					dataIndex : 'barcodeid',
					text : '条码号'
				}, {
					xtype : 'gridcolumn',
					width : 100,
					dataIndex : 'name',
					text : '条码说明'
				} ],
				selModel : Ext.create('Ext.selection.CheckboxModel', {
					mode : 'SIMPLE'
				}),

				dockedItems : [ {
					xtype : 'toolbar',
					items : [ Ext.create('Project.component.FilterTextField', {
						emptyText : '查找...',
						filterField : 'barcodeid',
						width : 150,
						store : partStore
					}), '-', {
						text : '生成条码',
						scope : me,
						handler : me.buttonHandler
					} ]
				} ]
			}, Ext.create('Project.component.PrintPanel', {
				region : 'center',
				id : 'system-barcode-printpanel',
				printObjectId : 'system-barcode-object',
				printEmbedId : 'system-barcode-embed',
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

	buttonHandler : function(button) {
		var grid = button.up('gridpanel');
		this.previewBarcode('system-barcode-printpanel', grid.getSelectionModel().getSelection(), 1, 14061804);
	}
});
