/**
 * 模具工件条码打印介面
 * 
 * 作者:David Email:xuweissh@163.com
 */
Ext.define('Module.ModuleCraftBarcode', {
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
			id : 'module-craft-barcode-store-id',
			fields : [ "id", "craftname" ],
			autoLoad : true,
			proxy : {
				type : 'ajax',
				url : 'module/code/craftBarcode',
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
				title : '工艺条码',
				store : partStore,

				columns : [ {
					xtype : 'gridcolumn',
					width : 85,
					dataIndex : 'id',
					text : '工艺条码号'
				}, {
					xtype : 'gridcolumn',
					width : 100,
					dataIndex : 'craftname',
					text : '工艺名称'
				} ],
				selModel : Ext.create('Ext.selection.CheckboxModel', {
					mode : 'SIMPLE'
				}),

				dockedItems : [ {
					xtype : 'toolbar',
					items : [ Ext.create('Project.component.FilterTextField', {
						emptyText : '查找...',
						filterField : 'id',
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
				id : 'craft-barcode-printpanel',
				printObjectId : 'craft-barcode-object',
				printEmbedId : 'craft-barcode-embed',
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
		this.previewBarcode('craft-barcode-printpanel', grid.getSelectionModel().getSelection(), 1, 14061805);
	}
});
