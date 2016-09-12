/**
 * 模具工件条码打印介面
 * 
 * 作者:David Email:xuweissh@163.com
 */
Ext.define('Module.DeviseCraftBarcode', {
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
			id : 'devise-craft-barcode-store-id',
			fields : [ "id", "craftname" ],
			autoLoad : true,
			proxy : {
				type : 'ajax',
				url : 'devise/share/getCraftInfoByKindAndHidden?kind=0',
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
					text : '工艺条码号',
					renderer : RenderFontBold
				}, {
					xtype : 'gridcolumn',
					width : 100,
					dataIndex : 'craftname',
					text : '工艺名称',
					renderer : RenderFontBold
				} ],
				selModel : Ext.create('Ext.selection.CheckboxModel', {
					mode : 'SIMPLE'
				}),

				dockedItems : [ {
					xtype : 'toolbar',
					items : [ '->', {
						text : '生成条码',
						iconCls : 'image-16',
						scope : me,
						handler : me.buttonHandler
					} ]
				} ]
			}, Ext.create('Project.component.PrintPanel', {
				region : 'center',
				id : 'devise-craft-barcode-printpanel',
				printObjectId : 'devise-craft-barcode-object',
				printEmbedId : 'devise-craft-barcode-embed',
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
		this.previewBarcode('devise-craft-barcode-printpanel', grid.getSelectionModel().getSelection(), 1, 16072002);
	}
});
