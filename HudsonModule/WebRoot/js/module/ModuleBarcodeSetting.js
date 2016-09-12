/**
 * 模具条码设置介面
 */
Ext.define('Module.ModuleBarcodeSetting', {
	extend : 'Ext.panel.Panel',

	layout : {
		type : 'border'
	},

	pages : 1,// 预览打印条码数量
	propertyRecord : null,// 选中的打印内容属性记录

	initComponent : function() {
		var me = this;

		me.paperGridPanel = Ext.create('Ext.grid.Panel', {
			flex : 1,
			region : 'north',
			title : '纸张设置',
			store : Ext.create('Ext.data.Store', {
				storeId : 'module-barcodepaper-store-id',
				autoLoad : true,
				fields : [ "id", "papername", {
					name : "paperwidth",
					type : 'int'
				}, {
					name : "paperheight",
					type : 'int'
				}, {
					name : "leftgap",
					type : 'int'
				}, {
					name : "rightgap",
					type : 'int'
				}, {
					name : "papergap",
					type : 'int'
				}, {
					name : "papers",
					type : 'int'
				}, "used" ],
				proxy : {
					type : 'ajax',
					url : 'module/code/queryBarcodePaper?moduleId=1',
					reader : {
						type : 'json'
					}
				}
			}),

			columns : [ {
				xtype : 'gridcolumn',
				width : 25,
				dataIndex : 'used',
				text : '',
				renderer : function(val) {
					return '<span class="' + (val == 1 ? 'tick-16' : '') + '" style="display:block;width:16px;">&nbsp;</span>';
				}
			}, {
				xtype : 'gridcolumn',
				width : 155,
				dataIndex : 'papername',
				text : '纸张名称',
				renderer : function(val, meta, record) {
					if (record.data.used == 1) {
						return '<span style="font-weight: bold;">' + val + '</span>';
					} else {
						return val;
					}
				}
			} ],

			dockedItems : [ {
				xtype : 'toolbar',
				items : [ {
					tooltip : '新增打印纸',
					iconCls : 'application_add-16',
					scope : me,
					handler : me.addBarcode
				}, {
					tooltip : '删除打印纸',
					iconCls : 'application_delete-16',
					scope : me,
					handler : me.deleteBarcode
				}, '-', {
					tooltip : '使用打印纸',
					iconCls : 'cog-16',
					scope : me,
					handler : me.useBarcode
				} ]
			} ],
			listeners : {
				scope : me,
				containercontextmenu : me.newBarcodePaper,
				itemcontextmenu : me.modifyBarcodePaper,
				itemclick : me.clickBarcodePaper
			}

		});

		me.printPanel = Ext.create('Project.component.PrintPanel', {
			region : 'center',
			printObjectId : 'barcode-preview-object',
			printEmbedId : 'barcode-preview-embed',
			unit : 'mm',
			intOrient : 1,// 打印方向
			style : 'margin:0 5 0 5',

		});

		Ext.applyIf(me, {
			items : [ {
				xtype : 'container',
				region : 'west',
				width : 200,
				layout : {
					type : 'border'
				},
				items : [ me.paperGridPanel, {
					xtype : 'treepanel',
					rootVisible : false,
					flex : 1.3,
					useArrows : true,
					margins : '5 0 0 0',
					region : 'center',
					title : '条码列表',
					store : Ext.create('Ext.data.TreeStore', {
						fields : [ "text", "bartypeid", "printtype", "printcol", {
							name : "printwidth",
							type : 'double'
						}, "barcodetype", "contextid", {
							name : "rectlinewidth",
							type : 'double'
						}, {
							name : "xseat",
							type : 'double'
						}, {
							name : "yseat",
							type : 'double'
						}, "rectline", {
							name : "printheight",
							type : 'double'
						}, {
							name : "fontsize",
							type : 'int'
						}, "bartypeid", "printtext" ],
						proxy : {

							type : 'ajax',
							url : 'module/code/queryBarcodeFormat?moduleId=1',
							reader : {
								type : 'json'
							}
						}
					}),

					listeners : {
						scope : me,
						itemclick : me.clickBarcodeFormat
					}
				} ]
			}, me.printPanel, {
				xtype : 'propertygrid',
				id : 'module-barcodepapaer-propertygrid',
				nameColumnWidth : 120,
				sortableColumns : false,
				region : 'east',
				width : 240,
				title : '属性',

				sourceConfig : {

					// 纸张属性
					papername : {
						displayName : "<span style='font-weight: bold;'>纸张名称</span>"
					},
					paperwidth : {
						displayName : "<span style='font-weight: bold;'>纸张宽度(mm)</span>"
					},
					paperheight : {
						displayName : "<span style='font-weight: bold;'>纸张高度(mm)</span>"
					},
					leftgap : {
						displayName : "<span style='font-weight: bold;'>左边距(mm)</span>"
					},
					rightgap : {
						displayName : "<span style='font-weight: bold;'>右边距(mm)</span>"
					},
					papergap : {
						displayName : "<span style='font-weight: bold;'>纸张间距(mm)</span>"
					},
					papers : {
						displayName : "<span style='font-weight: bold;'>同时打印张数</span>"
					},
					used : {
						displayName : "<span style='font-weight: bold;'>是否使用</span>"
					},

					// 打印内容属性
					printname : {
						displayName : "<span style='font-weight: bold;'>打印名称</span>"
					},

					printtype : {
						displayName : "<span style='font-weight: bold;'>打印类型</span>",
						editor : new Ext.form.field.ComboBox({
							store : Ext.create('Ext.data.Store', {
								fields : [ 'value', 'typename' ],
								data : [ {
									typename : '文本',
									value : 'text'
								}, {
									typename : '条码',
									value : 'barcode'
								}, {
									typename : '矩形',
									value : 'rect'
								} ],
								proxy : {
									type : 'memory'
								}
							}),
							valueField : 'value',
							displayField : 'typename',
							forceSelection : true
						})
					},
					xseat : {
						displayName : "<span style='font-weight: bold;'>打印X坐标(mm)</span>"
					},
					yseat : {
						displayName : "<span style='font-weight: bold;'>打印Y坐标(mm)</span>"
					},
					printwidth : {
						displayName : "<span style='font-weight: bold;'>打印宽度(mm)</span>"
					},
					printheight : {
						displayName : "<span style='font-weight: bold;'>打印高度(mm)</span>"
					},
					barcodetype : {
						displayName : "<span style='font-weight: bold;'>条码类型</span>",
						editor : new Ext.form.field.ComboBox({
							store : BarcodeType,
							forceSelection : true
						})
					},
					rectline : {
						displayName : "<span style='font-weight: bold;'>矩形线框类型</span>"
					},
					rectlinewidth : {
						displayName : "<span style='font-weight: bold;'>矩形线框宽度</span>"
					},
					printtext : {
						displayName : "<span style='font-weight: bold;'>打印示例内容</span>"
					},
					fontsize : {
						displayName : "<span style='font-weight: bold;'>打印字体尺寸</span>"
					}

				},

				listeners : {
					scope : me,
					propertychange : me.propertychange
				}
			} ]
		});

		me.callParent(arguments);
	},

	/**
	 * 打印内容属性改变
	 */
	propertychange : function(source, recordId, value) {

		var me = this;
		var url = "";
		twt = source;
		me.propertyRecord.set(source, value);

		if (me.propertyRecord.data.papername) {
			// 改变的为纸张属性
			me.previewPaperResult(me.propertyRecord);
			me.propertyRecord.commit();

			url = "module/code/updateBarcodePaper?bp.id=".concat(me.propertyRecord.get('id') + '&bp.').concat(recordId + '=').concat(value);
		} else {
			// 改变的打印内容属性
			me.previewPrintBarcode(null, me.propertyRecord.parentNode.childNodes);
			url = "module/code/updateBarcodeContext?bc.id=".concat(me.propertyRecord.get('contextid') + '&bc.').concat(recordId + '=').concat(value);

		}

		Ext.Ajax.request({
			url : url,
			success : function(response) {
				var res = JSON.parse(response.responseText);
				App.InterPath(res, function() {
					if (res.success) {
						Fly.msg('成功', res.msg);
						App.printContextChange = true;
					} else {
						Fly.msg('错误', res.msg);
					}
				});
			},
			failure : function(response, opts) {
				App.Error(response);
			}
		});

	},

	/**
	 * 新增打印纸张
	 */
	addBarcode : function(component) {
		Ext.create('ModuleBarcodePaperSettingWindow').show();
	},

	/**
	 * 删除打印纸张
	 */
	deleteBarcode : function(component) {
		var me = this;
		var record = me.record;

		if (record) {
			// 从菜单删除

		} else {
			// 从工具栏删除
			record = me.paperGridPanel.getSelectionModel().getSelection()[0];
		}

		if (!record) {
			return;
		}

		Ext.MessageBox.show({
			title : '条码纸',
			msg : '是否删除(' + record.data.papername + ')',
			buttons : Ext.MessageBox.YESNO,
			buttonText : {
				yes : "是",
				no : "否"
			},
			fn : function(btn) {
				if (btn == 'yes') {
					Ext.Ajax.request({
						url : 'module/code/deleteBarcodePaper',
						params : {
							"bp.id" : record.data.id
						},
						success : function(response) {
							var res = JSON.parse(response.responseText);

							App.InterPath(res, function() {
								if (res.success) {
									Fly.msg('成功', res.msg);
									Ext.getStore('module-barcodepaper-store-id').remove(record);
								} else {
									Fly.msg('错误', res.msg);
								}
							});
						},
						failure : function(response, opts) {
							App.Error(response);
						}
					});
				}
			}
		});
	},

	/**
	 * 使用打印纸张
	 */
	useBarcode : function(component) {
		var me = this;

		Ext.Ajax.request({
			url : 'module/code/useBarcodeParper',
			params : {
				"bp.id" : me.record.data.id
			},
			success : function(response) {
				var res = JSON.parse(response.responseText);

				App.InterPath(res, function() {
					if (res.success) {
						Fly.msg('成功', res.msg);
						Ext.getStore('module-barcodepaper-store-id').load();
						
						// 显示设置纸张后的效果
						Ext.getCmp('Module.ModuleBarcodeSetting').previewPaperResult(me.record);
						App.paperFormat = me.record.data;
					} else {
						Fly.msg('错误', res.msg);
					}
				});
			},
			failure : function(response, opts) {
				App.Error(response);
			}
		});

	},

	clickBarcodePaper : function(view, record) {
		var me = this;
		var pro = Ext.getCmp('module-barcodepapaer-propertygrid');

		me.propertyRecord = record;

		pro.setTitle(record.data.papername + ' 属性');

		pro.setSource({
			"papername" : record.get("papername"),
			"paperwidth" : record.get("paperwidth"),
			"paperheight" : record.get("paperheight"),
			"leftgap" : record.get("leftgap"),
			"rightgap" : record.get("rightgap"),
			"papergap" : record.get("papergap"),
			"papers" : record.get("papers"),
			"used" : record.get("used")
		});

		me.previewPaperResult(record);
	},

	/**
	 * 预览纸张设置结果
	 */
	previewPaperResult : function(record) {
		var me = this;

		me.setPaperFormat(record);
		// 预览打印效果
		me.printPanel.openPreview();
		if (me.previewData) {
			if (me.previewData.length == 1) {
				for (var i = 1; i < me.pages; i++) {
					me.previewData[i] = me.previewData[0];
				}
			}
			me.printPanel.showContextPage(me.previewData);
		} else {
			me.printPanel.browsePreviewMode();
		}
	},

	/**
	 * 设置纸张格式
	 */
	setPaperFormat : function(record) {
		this.pages = record.get("papers");
		this.printPanel.pageWidth = record.get("paperwidth");
		this.printPanel.pargHeight = record.get("paperheight");
		this.printPanel.pages = record.get("papers");
		this.printPanel.gap = record.get("papergap");
		this.printPanel.leftGap = record.get("leftgap");
		this.printPanel.rightGap = record.get("rightgap");
	},

	newBarcodePaper : function(view, e, eOpts) {
		var me = this;

		Ext.create('ModuleBarcodePaperSettingMenu', {
			addBarcode : me.addBarcode
		}).showAt(e.getXY());
	},

	modifyBarcodePaper : function(view, record, item, index, e, eOpts) {
		var me = this;

		Ext.create('ModuleBarcodePaperSettingMenu', {
			record : record,

			addBarcode : me.addBarcode,
			editBarcode : me.editBarcode,
			deleteBarcode : me.deleteBarcode,
			useBarcode : me.useBarcode
		}).showAt(e.getXY());
	},

	/**
	 * 生成条码预览数据
	 */
	clickBarcodeFormat : function(view, record) {
		var me = this;
		var pro = Ext.getCmp('module-barcodepapaer-propertygrid');

		switch (record.data.depth) {
		case 1: {// 选择要预览的条码
			me.previewPrintBarcode(pro, record.childNodes);
			break;
		}

		case 2: {
			me.showPrintFormatProperty(pro, record);
			break;
		}
		}
	},

	/**
	 * 预览条码打印效果
	 */
	previewPrintBarcode : function(pro, fs) {
		var me = this;
		var barcodes = [];
		var contextPage = [];

		if (pro) {
			pro.setSource({});
			pro.setTitle('属性');
		}

		for ( var i in fs) {
			contextPage.push({
				type : fs[i].data.printtype,
				x : fs[i].data.xseat,
				y : fs[i].data.yseat,
				width : fs[i].data.printwidth,
				height : fs[i].data.printheight,
				context : {
					barcodeType : fs[i].data.barcodetype,
					text : fs[i].data.printtext,
					line : fs[i].data.rectline,
					lineWidth : fs[i].data.rectlinewidth
				}
			});
		}

		for (var i = 1; i <= me.pages; i++) {
			barcodes.push({
				contextPage : contextPage
			});
		}

		// 预览打印效果
		me.previewData = barcodes;
		me.printPanel.openPreview();
		me.printPanel.showContextPage(barcodes);

	},

	/**
	 * 
	 */
	showPrintFormatProperty : function(pro, record) {
		var me = this;

		me.propertyRecord = record;

		pro.setTitle(record.data.text + ' 属性');

		pro.setSource({
			"printname" : record.get("text"),
			"printtype" : record.get("printtype"),
			"xseat" : record.get("xseat"),
			"yseat" : record.get("yseat"),
			"printwidth" : record.get("printwidth"),
			"printheight" : record.get("printheight"),
			"barcodetype" : record.get("barcodetype"),
			"rectline" : record.get("rectline"),
			"rectlinewidth" : record.get("rectlinewidth"),
			"printtext" : record.get("printtext"),
			"fontsize" : record.get("fontsize"),
		});
	}

});

/**
 * 纸张操作菜单
 */
Ext.define('ModuleBarcodePaperSettingMenu', {
	extend : 'Ext.menu.Menu',

	initComponent : function() {
		var me = this;

		Ext.applyIf(me, {
			items : [ {
				text : '新增打印纸',
				iconCls : 'application_add-16',
				scope : me,
				handler : me.addBarcode
			}, {
				text : '删除打印纸',
				iconCls : 'application_delete-16',
				disabled : me.record ? false : true,
				scope : me,
				handler : me.deleteBarcode
			}, '-', {
				text : '使用打印纸',
				iconCls : 'cog-16',
				disabled : me.record ? false : true,
				scope : me,
				handler : me.useBarcode
			} ]
		});

		me.callParent(arguments);
	}
});

/**
 * 纸张新增窗口
 */
Ext.define('ModuleBarcodePaperSettingWindow', {
	extend : 'Ext.window.Window',

	iconCls : 'application_add-16',
	modal : true,
	height : 320,
	width : 400,
	layout : {
		type : 'fit'
	},
	title : '新增纸张',

	initComponent : function() {
		var me = this;

		Ext.applyIf(me, {

			items : [ {
				xtype : 'form',
				border : false,
				bodyPadding : 10,
				title : '',
				defaults : {
					allowBlank : false
				},
				items : [ {
					xtype : 'textfield',
					hidden : true,
					allowBlank : true,
					name : 'id'
				}, {
					xtype : 'textfield',
					anchor : '100%',
					fieldLabel : '纸张名称',
					labelWidth : 80,
					name : 'papername',
					maxLength : 20
				}, {
					xtype : 'fieldset',
					layout : {
						type : 'table'
					},
					defaults : {
						allowBlank : false
					},
					title : '纸张规格(单位:mm)',
					items : [ {
						xtype : 'numberfield',
						anchor : '100%',
						width : 174,
						fieldLabel : '宽度',
						labelWidth : 60,
						name : 'paperwidth'
					}, {
						xtype : 'numberfield',
						style : 'margin-left:5px;',
						width : 157,
						fieldLabel : '高度',
						labelWidth : 60,
						name : 'paperheight'
					} ]
				}, {
					xtype : 'fieldset',
					defaults : {
						labelAlign : 'right',
						value : 1,
						minValue : 0,
						allowBlank : false
					},
					layout : {
						type : 'table'
					},
					title : '间隙(单位:mm)',
					items : [ {
						xtype : 'numberfield',
						width : 106,
						fieldLabel : '左',
						labelWidth : 40,
						name : 'leftgap',
						value : 1
					}, {
						xtype : 'numberfield',
						style : 'margin-left:5px;',
						width : 106,
						fieldLabel : '中',
						labelWidth : 40,
						name : 'papergap',
						value : 1
					}, {
						xtype : 'numberfield',
						style : 'margin-left:5px;',
						width : 106,
						fieldLabel : '右',
						labelWidth : 40,
						name : 'rightgap'
					} ]
				}, {
					xtype : 'fieldset',
					layout : {
						type : 'table'
					},
					title : '同时打印数量',
					items : [ {
						xtype : 'numberfield',
						anchor : '100%',
						width : 135,
						fieldLabel : '张数',
						labelWidth : 60,
						name : 'papers',
						value : 1,
						minValue : 1,
						allowBlank : false
					} ]
				} ]
			} ],
			dockedItems : [ {
				xtype : 'toolbar',
				dock : 'bottom',
				ui : 'footer',
				defaults : {
					width : 60
				},
				items : [ '->', {
					xtype : 'button',
					text : '新增',
					iconCls : 'accept-16',
					scope : me,
					handler : me.saveBarcode
				}, {
					xtype : 'button',
					text : '取消',
					handler : function() {
						me.destroy();
					}
				} ]
			} ]
		});

		me.callParent(arguments);
	},

	/**
	 * 保存条码打印纸格式
	 */
	saveBarcode : function() {
		var me = this;
		var form = me.getComponent(0).getForm();// 00668975

		if (form.isValid()) {
			var data = form.getValues();

			Ext.MessageBox.show({
				title : '条码纸',
				msg : '是否保存对条码纸的设置?',
				buttons : Ext.MessageBox.YESNO,
				buttonText : {
					yes : "是",
					no : "否"
				},
				fn : function(btn) {
					if (btn == 'yes') {
						Ext.Ajax.request({
							url : 'module/code/saveBarcodePaper',
							params : {
								"bp.id" : data.id,
								"bp.papername" : data.papername,
								"bp.paperwidth" : data.paperwidth,
								"bp.paperheight" : data.paperheight,
								"bp.leftgap" : data.leftgap,
								"bp.rightgap" : data.rightgap,
								"bp.papergap" : data.papergap,
								"bp.papers" : data.papers,
								"bp.moduleid" : data.moduleid || 1
							},
							success : function(response) {
								var res = JSON.parse(response.responseText);

								App.InterPath(res, function() {
									if (res.success) {
										Fly.msg('成功', res.msg);
										me.destroy();
										data.id = res.id;
										Ext.getStore('module-barcodepaper-store-id').add(data);
									} else {

										Fly.msg('错误', res.msg);
									}
								});
							},
							failure : function(response, opts) {
								App.Error(response);
							}
						});
					}
				}
			});
		}
	}
});
