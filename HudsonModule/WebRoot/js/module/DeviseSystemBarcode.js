/**
 * 模具工件条码打印介面
 * 
 * 作者:David Email:xuweissh@163.com
 */
Ext.define('Module.DeviseSystemBarcode', {
	extend : 'Project.component.BarcodePrintPanel',
	layout : {
		type : 'border'
	},
	title : '系统条码打印',
	initComponent : function() {
		var me = this;
		if (!App.paperFormat) {
			App.paperFormat = me.getPrintPaperFormat(1);
		}
		var partStore = Ext.create('Ext.data.Store', {
			id : 'devise-system-barcode-store-id',
			fields : [ "id", "name" ],
			autoLoad : true,
			proxy : {
				type : 'ajax',
				url : 'devise/share/getStateInfo',
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
					dataIndex : 'name',
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
				id : 'devise-system-barcode-printpanel',
				printObjectId : 'devise-system-barcode-object',
				printEmbedId : 'devise-system-barcode-embed',
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
		this.previewBarcode('devise-system-barcode-printpanel', grid.getSelectionModel().getSelection(), 1, 16072003);
	}
});
