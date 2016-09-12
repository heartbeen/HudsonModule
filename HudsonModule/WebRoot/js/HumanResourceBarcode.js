/**
 * 人员条码打印介面
 */
Ext.define('Module.HumanResourceBarcode', {
	extend : 'Ext.panel.Panel',
	layout : {
		type : 'border'
	},
	title : '模具查询',
	initComponent : function() {
		var me = this;

		var partStore = Ext.create('Ext.data.Store', {
			id : 'module-part-barcode-store-id',
			fields : [ "modulecode", "partlistcode", "partbarlistcode" ],
			autoLoad : false,
			proxy : {
				type : 'ajax',
				url : 'module/code/modulePartList',
				reader : {
					type : 'json',
				}
			}
		});

		Ext.applyIf(me, {
			items : [ {
				xtype : 'panel',
				region : 'west',
				split : true,
				width : 230,
				layout : {
					type : 'border'
				},
				collapsed : false,
				collapsible : true,
				title : '模具工号',

				items : [ {
					xtype : 'treepanel',
					region : 'center',
					flex : 1,
					rootVisible : false,
					viewConfig : {
						emptyText : '<h1 style="margin:10px">查询不到模具工号</h1>',
					},
					store : Ext.create('Ext.data.TreeStore', {
						autoLoad : false,
						fields : [ "endtime", "starttime", "modulebarcode", "text", "id", "leaf" ],
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
							queryLength : 2,
							url : 'public/module?isResume=true'
						}), "->", "-", {
							text : '快速查询',
							menu : Ext.create("Ext.menu.Menu", {
								style : 'z-index:999999',
								items : [ {
									text : '新模工号',
									isNew : true,
									parent : me,
									handler : me.onResumeModule
								}, {
									text : '修模或设变工号',
									isNew : false,
									parent : me,
									handler : me.onResumeModule
								} ]
							})
						} ]
					} ],
					listeners : {
						itemclick : me.onClickModuleNumber,
						load : function() {
							Ext.getStore('module-part-barcode-store-id').loadData([]);
						}
					}
				}, {
					xtype : 'gridpanel',
					flex : 1.3,
					border : '1 0 0 0',
					region : 'south',
					margin : '5 0 0 0',
					title : '工件列表',
					store : partStore,

					listeners : {
						itemclick : me.deleteCodeData,
					},
					columns : [ {
						xtype : 'gridcolumn',
						width : 85,
						dataIndex : 'modulecode',
						text : '模具工号'
					}, {
						xtype : 'gridcolumn',
						width : 85,
						dataIndex : 'partlistcode',
						text : '工件'
					} ],
					selModel : Ext.create('Ext.selection.CheckboxModel', {
						mode : 'SIMPLE'
					}),

					dockedItems : [ {
						xtype : 'toolbar',
						items : [ Ext.create('Project.component.FilterTextField', {
							emptyText : '查找工件...',
							filterField : 'partlistcode',
							width : 150,
							store : partStore
						}), '-', {
							text : '生成条码',
							scope : me,
							handler : me.buttonHandler
						} ]
					}, {
						xtype : 'toolbar',
						dock : 'bottom',
						items : [ {
							xtype : 'combobox',
							id : 'module-part-barcode-type-id',

							width : 200,
							fieldLabel : '条码格式',
							labelWidth : 60,
							store : Ext.create('Ext.data.Store', {
								fields : [ 'value' ],

								data : [ {
									value : "128A"
								}, {
									value : "128B"
								}, {
									value : "128C"
								}, {
									value : "128Auto"
								}, {
									value : "EAN8"
								}, {
									value : "EAN13"
								}, {
									value : "EAN128A"
								}, {
									value : "EAN128B"
								}, {
									value : "EAN128C"
								}, {
									value : "Code39"
								}, {
									value : "39Extended"
								}, {
									value : "2_5interleaved"
								}, {
									value : "2_5industrial"
								}, {
									value : "2_5matrix"
								}, {
									value : ""
								}, {
									value : "UPC_A"
								}, {
									value : "UPC_E0"
								}, {
									value : "UPC_E1"
								}, {
									value : "UPCsupp2"
								}, {
									value : "UPCsupp5"
								}, {
									value : "Code93"
								}, {
									value : "93Extended"
								}, {
									value : "MSI"
								}, {
									value : "Codaba"
								}, {
									value : "QRCode"
								}, {
									value : "PDF417"
								} ],
								proxy : {
									type : 'memory'
								}
							}),
							valueField : 'value',
							displayField : 'value',
							listeners : {
								scope : me,
								select : me.barcodeTypeSelect
							}

						} ]
					} ]
				} ]
			}, Ext.create('Project.component.PrintPanel', {
				id : 'modulepart-barcode-printpanel',
				region : 'center',
				printObjectId : 'modulepart-barcode-object',
				printEmbedId : 'modulepart-barcode-embed',
				pageWidth : 40,
				pargHeight : 20,
				unit : 'mm',
				intOrient : 1,// 打印方向
				pages : 3,
				gap : 2,
				leftGap : 2,
				rightGap : 2

			}) ]
		});

		me.callParent(arguments);
	},

	/** 点击模具工号显示模具相应工件清单 */
	onClickModuleNumber : function(treeview, record) {

		if (record) {
			var store = Ext.getStore('module-part-barcode-store-id');
			store.load({
				url : store.proxy.url,
				params : {
					modulebarcode : record.data.modulebarcode
				}
			});
		}//

	},

	buttonHandler : function(button) {
		var grid = button.up('gridpanel');
		this.createPartBarcode(grid.getSelectionModel().getSelection());
	},

	barcodeTypeSelect : function(combo) {
		var grid = combo.up('gridpanel');
		this.createPartBarcode(grid.getSelectionModel().getSelection());
	},

	createPartBarcode : function(models) {
		if (models) {
			var code = App.getValue('module-part-barcode-type-id') || 'EAN128C';

			var part = new Array();
			for ( var i in models) {
				part.push({// 打印页1
					contextPage : [ {
						type : 'text',// 打印的类型,text,barcode,rect
						x : 5,
						y : 2,
						width : 40,
						height : 6,
						context : {
							text : models[i].data.modulecode + '  ' + models[i].data.partlistcode
						}
					}, {
						type : 'barcode',// 打印的类型,text,barcode,rect
						x : 3,
						y : 7,
						width : 40,
						height : 11,
						context : {
							barcodeType : code,// 条码类型
							text : models[i].data.partbarlistcode
						// text :
						// $("#barcode-panel").barcode(models[i]
						// .data.partbarlistcode,
						// "ean8", {
						// barWidth : 2,
						// barHeight : 30
						// }).html()
						}
					} ]
				});
			}

			var panel = Ext.getCmp('modulepart-barcode-printpanel');
			panel.openPreview();
			panel.showContextPage(part);
		}
	},

	/**
	 * 新模或修模/设变
	 */
	onResumeModule : function() {
		var item = this;
		item.up('treepanel').getStore().load({
			url : 'public/moduleForResume',
			params : {
				isNew : item.isNew
			}
		});
	},

	/**
	 * 按条件查询模具信息
	 */
	createCodeData : function(gridpanel, record, index, eOpts) {
		var me = this;
		var codeId = record.data.id;
		var deleteId = '#' + codeId;
		var bool = true;
		$(deleteId).remove();
		// Ext.getCmp('query-module-listCode').getSelectionModel().toggleOnClick(true);

		if (bool) {
			$("#machine-base-code-panel").append(
					'<div id="' + codeId + '" style="margin:0 5pt 0 5pt;text-align:center;display:block;width:132px;font-size: 18px;float:left;" >'
							+ '<div style="margin-bottom:2px;">' + record.data.craftname + ' ' + record.data.batchno + '</div><div class="bcTarget-'
							+ codeId + '" ></div></div>');
			var pnId = '.bcTarget-' + codeId;

			$(pnId).barcode({
				code : record.data.id,
				crc : false
			}, "code128", {
				output : 'svg',
				fontSize : 18,
				barHeight : 30
			});
		}
	},

	deleteCodeData : function(gridpanel, record, item, index, e, eOpts) {
		var codeId = record.data.id;

		var pnId = '#' + codeId;
		$(pnId).remove();
	},

	/**
	 * 更新前提示
	 */
	onDeforeedit : function(editor, e, eOpts) {

	},
	/**
	 * 更新模具信息
	 */
	onUpdateModuleInfo : function(editor, e) {

		var data = Ext.Array.toArray(e.record.data);

		Ext.Ajax.request({
			url : 'module/manage/updateModuleIntroduce',
			params : {
				module : App.dateReplaceToZone(Ext.JSON.encode(e.record.data))
			},
			method : "POST",

			success : function(response) {
				var res = Ext.JSON.decode(response.responseText);

				App.InterPath(res, function() {
					if (res.success) {
						Fly.msg('信息', res.msg);
						e.record.commit();
					} else {
						Fly.msg('错误', "<span style='color:red;'>" + res.msg + "</span>");
					}
				});
			},
			failure : function() {
				Fly.msg('提醒', '网络连接失败!');
				return;
			}
		});

	}
});
