/**
 * 测量结果
 */
Ext.define('Module.ModuleStereoscopicMeasure', {
	extend : 'Ext.panel.Panel',

	title : '三次元测量',

	emptyText : '<div style="color:red;">没有工件</div>',

	moduleRecord : null,// 选中的模具
	partRecord : null,// 选中的工件

	initComponent : function() {
		var me = this;

		me.partMeasureStore = Ext.create('Ext.data.Store', {
			fields : [ "measurename", "remark", "empname", "modulecode", "partbarcode", "id", "craftid", "craftname", "partcode", "modulebarcode",
					"measuretime", 'imagestring', {
						name : 'width',
						type : 'int'
					}, {
						name : 'height',
						type : 'int'
					} ],
			proxy : {
				url : '',
				type : 'ajax',
				reader : {
					type : 'json'
				}
			},

			listeners : {
				scope : me,
				load : me.updateImageSize
			}
		});

		Ext.applyIf(me, {
			layout : 'border',
			bodyPadding : 5,

			items : [
					{
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
								scope : me,
								itemclick : me.onClickModuleNumber,
								load : function() {
									var partStore = Ext.getStore('module-measure-tree-store-id');

									partStore.load([]);

								}
							}
						}, {
							xtype : 'treepanel',
							id : 'module-measure-treepanel',
							flex : 1.3,
							border : '1 0 0 0',
							region : 'south',
							margin : '5 0 0 0',
							title : '工件列表',
							useArrows : true,
							rootVisible : false,
							store : Ext.create('Ext.data.TreeStore', {
								id : 'module-measure-tree-store-id',
								fields : [ 'modulebarcode', 'partbarcode', 'text', 'partcode' ],
								autoLoad : false,
								proxy : {
									type : 'ajax',
									url : 'public/moduleMeasureList',
									reader : {
										type : 'json',
										root : 'children'
									}
								}
							}),
							viewConfig : {
								emptyText : me.emptyText,
							},

							listeners : {
								scope : me,
								itemclick : me.onClickModuleMeasurePart
							},

							dockedItems : [ {
								xtype : 'toolbar',
								items : [ {
									iconCls : 'brick_add-16',
									tooltip : '增加测量工件',
									scope : me,
									handler : me.addMeasureParts
								}, {
									iconCls : 'picture_add-16',
									tooltip : '增加测量图片',
									scope : me,
									handler : me.importMeasurePicture
								} ]
							} ]
						} ]
					},
					{
						xtype : 'panel',
						region : 'center',
						title : '测量结果',
						layout : 'fit',
						items : [ {
							xtype : 'dataview',
							deferInitialRefresh : false,
							store : me.partMeasureStore,
							tpl : Ext.create('Ext.XTemplate', '<tpl for=".">', '<div class="measure">',
									'<img imgwidth="{width}" imgheight="{height}" src="{imagestring}" />',
									'<a class="editpicture picture_edit-16" href="javascript:void(0);"></a>',
									'<a class="previewpicture picture-16" href="javascript:void(0);"></a>',
									'<a class="deletepicture picture_delete-16" href="javascript:void(0);"></a>',
									'<strong>{modulecode}&nbsp;&nbsp; {measurename}</strong>',
									'<span>测量者:{empname}&nbsp;&nbsp;送测工艺:{craftname}</span>', '</div>', '</tpl>'),
							id : 'measure-edit',
							itemSelector : 'div.measure',
							overItemCls : 'measure-hover',
							multiSelect : true,
							autoScroll : true,

							listeners : {
								scope : me,
								render : me.renderMeasurePanel,
								resize : me.dataViewResize,
								itemmouseenter : me.enterMeasurePicture,
								itemdblclick : me.previewMeasurePicture
							}
						} ],

						dockedItems : [ {
							xtype : 'toolbar',
							items : [ {
								iconCls : 'calendar-16',
								text : '测量日期',
								id : 'measure-select-button',
								menu : {
									xtype : 'menu',
									items : [ Ext.create('Ext.picker.Date', {
										iconCls : 'calendar_view_day-16',
										scope : me,
										handler : me.selectMeasureDate
									}) ]
								}
							} ]
						} ]
					} ]

		});

		me.callParent(arguments);
	},

	/**
	 * 显示面板调整尺寸时,同时对三次元图片显示的列数与尺寸进行计算
	 */
	dataViewResize : function(panel, width, height, oldWidth, oldHeight, eOpts) {
		this.updateSzie(width);
		this.updateImageSize();
	},

	/**
	 * 显示面板首次显示时对要三次元图片显示的列数与尺寸进行计算
	 */
	renderMeasurePanel : function(view) {
		var me = this;
		setTimeout(function() {
			me.updateSzie(view.getWidth());
		}, 500);
	},

	/**
	 * 根据显示面板的宽度,对显示列数和尺寸进行动态调整
	 */
	updateSzie : function(width) {
		var me = this;
		me.measurePanelWidth = width - 20;

		if (me.measurePanelWidth >= 850) {
			// 4列显示
			me.measurePanelWidth = me.measurePanelWidth / 4 - 10;
		}

		if (me.measurePanelWidth >= 650 && me.measurePanelWidth < 850) {
			// 3列显示
			me.measurePanelWidth = me.measurePanelWidth / 3 - 10;
		}

		if (me.measurePanelWidth >= 350 && me.measurePanelWidth < 650) {
			// 2列显示
			me.measurePanelWidth = me.measurePanelWidth / 2 - 10;
		}

		// 按4:3比例显示结果
		me.measurePanelHeight = Math.floor(3 / 4 * me.measurePanelWidth);

		// 实际图片显示区尺寸
		me.imageWidth = me.measurePanelWidth - 16;
		me.imageHeight = me.measurePanelHeight - 44;
	},

	/**
	 * 动态调整三次元测量图的尺寸,如果有测量图片的情况下
	 */
	updateImageSize : function(store, records) {
		var me = this;

		var edit = $('#measure-edit div.measure');
		edit.css('width', me.measurePanelWidth);
		edit.css('height', me.measurePanelHeight);

		var img = $('#measure-edit div.measure img');
		img.css('width', me.imageWidth);
		img.css('height', me.imageHeight);

		if (img.length == 0) {
			return;
		}

		if (records) {
			me.measureLength = records.length;

			// 读取三次元图片数据后增加图片编辑按钮事件
			me.addPictureEditEvent();
		}

		for (var i = 1; i <= me.measureLength; i++) {
			var child = $('#measure-edit div.measure:nth-child(' + i + ') img');
			var imgwidth = child.attr('imgwidth');
			var imgheight = child.attr('imgheight');

			var scale = me.getImgScale(me.imageWidth, me.imageHeight, imgwidth, imgheight);

			child.css('width', imgwidth * scale);
			child.css('height', imgheight * scale);
		}

	},

	/**
	 * 增加图片编辑按钮事件
	 */
	addPictureEditEvent : function() {
		var me = this;
		var edit = $('#measure-edit .editpicture');
		var preview = $('#measure-edit .previewpicture');
		var del = $('#measure-edit .deletepicture');

		edit.on('click', function() {
			var win = Ext.create('Module.ModuleMeasurePrictureWindow', {
				moduleRecord : me.moduleRecord,
				partRecord : me.partRecord,
				imgSrc : me.measureRecord.data.imagestring,
				actionType : 'edit'
			});

			var form = win.getComponent(1).getComponent('measure-info-form').getForm();
			form.setValues(me.measureRecord.data);

			win.show();
		});

		preview.on('click', function() {
			me.previewMeasurePicture(null, me.measureRecord);
		});

		del.on('click', function() {
			Ext.Msg.confirm('確認', '是否確定删除三次元测量图片?', function(e) {
				if (e == 'yes') {
					Ext.Ajax.request({
						url : 'module/quality/deleteMeasurePicture',
						params : {
							"id" : me.measureRecord.get('id')
						},
						success : function(response) {
							var res = JSON.parse(response.responseText);
							App.InterPath(res, function() {
								if (res.success) {
									me.partMeasureStore.remove(me.measureRecord);
								}

								Fly.msg('信息', res.msg);
							});
						},
						failure : function(response, opts) {
							App.Error(response);
						}
					});
				}
			});
		});
	},

	/**
	 * 计算显示区与图片的比例
	 */
	getImgScale : function(iw, ih, fw, fh) {
		var ws = iw / fw;
		var hs = ih / fh;
		return ws < hs ? ws : hs;
	},

	/**
	 * 增加工艺三次元测量图片
	 */
	importMeasurePicture : function() {
		var me = this;

		if (me.partRecord == null) {
			Fly.msg('信息', '没有选择测量的工件');
			return;
		}

		var win = Ext.create('Module.ModuleMeasurePrictureWindow', {
			moduleRecord : me.moduleRecord,
			partRecord : me.partRecord
		});

		var form = win.getComponent(1).getComponent('measure-info-form').getForm();
		var mc = me.moduleRecord.data.text;
		form.setValues({
			modulecode : mc.substring(0, mc.lastIndexOf('(')),
			partcode : me.partRecord.data.partcode
		});

		win.show();

	},

	/**
	 * 新模或修模/设变
	 */
	onResumeModule : function() {
		var item = this;
		item.parent.taskGantt = [];// 读取模具信息时,将之前选择工件工艺排程清空
		item.up('treepanel').getStore().load({
			url : 'public/moduleForResume',
			params : {
				isNew : item.isNew
			}
		});
	},

	/**
	 * 点击模具工号显示模具相应工件清单
	 */
	onClickModuleNumber : function(treeview, record) {
		var me = this;
		if (record) {
			me.moduleRecord = record;
			me.partRecord = null;
			var store = Ext.getStore('module-measure-tree-store-id');
			store.load({
				url : store.proxy.url,
				params : {
					moduleBarcode : record.data.modulebarcode,
					measure : 1
				}
			});
		}
	},

	/**
	 * 查询工件的三次元测量图片
	 */
	onClickModuleMeasurePart : function(treeview, record) {

		var me = this;
		me.partRecord = record;

		Ext.getCmp('measure-select-button').setText('测量日期');

		me.queryMeasurePicture(me.partRecord);
	},

	/**
	 * 查询工件指定日期的三次元测量图片
	 */
	selectMeasureDate : function(picker, date) {
		var me = this;

		if (!me.partRecord) {
			return;
		}

		date = Ext.Date.format(date, 'Y-m-d');
		Ext.getCmp('measure-select-button').setText(date);

		me.queryMeasurePicture(me.partRecord, date);
	},

	/**
	 * 查询模具工件三次元测量图片
	 */
	queryMeasurePicture : function(record, date) {
		this.partMeasureStore.load({
			url : 'module/quality/queryPartThreeMeasure',
			params : {
				partBarcode : record.data.partbarcode,
				measureDate : date
			}
		});
	},

	/**
	 * 鼠标进行图片之后保存选择的图片数据,用图片编辑和预览做准备
	 */
	enterMeasurePicture : function(view, record, item, index, e, eOpts) {
		this.measureRecord = record;
	},

	/**
	 * 双击三次元测量图片预览
	 */
	previewMeasurePicture : function(view, record, item, index, e, eOpts) {
		var title = record.get("modulecode") + ' ' + record.get("measurename") + '--测量者:' + record.get("empname") + '  送测工艺:'
				+ record.get("craftname");

		Ext.create('Ext.window.Window', {
			width : 800,
			height : 600,
			title : '测量图片预览  (' + title + ')',
			modal : true,
			iconCls : 'photo-16',
			maximizable : true,
			layout : 'fit',
			items : [ Ext.create('Project.component.PicturePreviewPanel', {
				imgSrc : record.data.imagestring,
				imgWidth : record.data.width,
				imgHeight : record.data.height
			}) ]
		}).show();
	},

	/**
	 * 增加要测量的工件信息
	 */
	addMeasureParts : function() {
		var me = this;
		if (!me.moduleRecord) {
			Fly.msg('提示', '请选择模具!');
			return;
		}
		Ext.create('Module.ModuleMeasurePartAddWindow', {
			title : '增加' + me.moduleRecord.data.text + '工件',
			moduleBarcode : me.moduleRecord.data.modulebarcode,
			measureStoreId : 'module-measure-tree-store-id'
		}).show();
	}
});
