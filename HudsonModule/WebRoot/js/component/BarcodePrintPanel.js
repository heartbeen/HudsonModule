/**
 * 
 */
Ext.define('Project.component.BarcodePrintPanel', {
	extend : 'Ext.panel.Panel',

	initComponent : function() {
		var me = this;

		me.callParent(arguments);
	},

	/**
	 * 得到打印纸的格式
	 */
	getPrintPaperFormat : function(moduleId) {

		var format = null;
		Ext.Ajax.request({
			url : 'public/queryPrintPaperFormat',
			params : {
				"moduleId" : moduleId
			},
			async : false,
			success : function(response) {
				format = Ext.JSON.decode(response.responseText);
			},
			failure : function(response) {
				App.Error(response);
			}
		});

		return format;

	},

	/**
	 * 预览打印效果<br>
	 * 
	 * printId:打印面板ID <br>
	 * models:数据 <br>
	 * projectId:项目ID <br>
	 * barTypeId:条码类型ID
	 */
	previewBarcode : function(printId, models, projectId, barTypeId) {
		var me = this;

		if (models) {
			if (!me.contextFormat || App.printContextChange) {
				me.contextFormat = me.getPrintBarcodeFormat(projectId, barTypeId);
			}
			var panel = Ext.getCmp(printId);
			panel.openPreview();
			panel.showContextPage(me.getPrintBarcodeContext(models, me.contextFormat));

		}
	},

	/**
	 * 得到相应条码的格式
	 */
	getPrintBarcodeFormat : function(moduleId, barTypeId) {
		var format = null;
		Ext.Ajax.request({
			url : 'module/code/queryBarcodeFormat',
			params : {
				"moduleId" : moduleId,
				"barTypeId" : barTypeId
			},
			async : false,
			success : function(response) {
				format = Ext.JSON.decode(response.responseText).children[0].children;
			},
			failure : function(response) {
				App.Error(response);
			}
		});
		return format;
	},

	/**
	 * 通给定的数据和条码打印格式,生成条码打印内容
	 */
	getPrintBarcodeContext : function(models, format) {
		var part = new Array();
		for ( var i in models) {
			var contextPage = [];
			for ( var x in format) {
				contextPage.push({
					type : format[x].printtype,
					x : format[x].xseat,
					y : format[x].yseat,
					width : format[x].printwidth,
					height : format[x].printheight,
					context : {
						barcodeType : format[x].barcodetype,
						text : models[i].get(format[x].printcol),
						line : format[x].rectline,
						lineWidth : format[x].rectlinewidth
					}
				});
			}
			part.push({
				contextPage : contextPage
			});
		}
		return part;
	}
});