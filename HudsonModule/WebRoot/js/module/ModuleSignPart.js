/**
 * 加工单位接收工件介面
 */
Ext.define('Module.ModuleSignPart', {
	extend : 'Ext.panel.Panel',

	layout : {
		type : 'border'
	},
	bodyPadding : 2,
	title : '接收工件',
	moduleBarcode : '',
	resumeId : '',

	initComponent : function() {
		var me = this;

		Ext.apply(me, {
			items : [ {
				xtype : 'treepanel',
				region : 'west',
				split : true,
				width : 180,
				animCollapse : false,
				collapsed : false,
				collapsible : true,
				title : '模号',
				rootVisible : false,
				store : Ext.create('Ext.data.TreeStore', {
					autoLoad : false,
					proxy : {
						url : '',
						// 自动导入工号
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
					items : [ Ext.create('Module.ModuleFindTextField') ]
				} ],
				listeners : {
					itemclick : me.onClickModule
				}
			}, {
				xtype : 'gridpanel',
				id : 'sign-parts-grid-id',
				region : 'center',
				title : '待签收工件列表',
				columns : [ {
					xtype : 'gridcolumn',
					dataIndex : 'partlistcode',
					text : '工件号'
				}, {
					xtype : 'gridcolumn',
					dataIndex : 'quantity',
					width : 50,
					text : '件数'
				}, {
					xtype : 'gridcolumn',
					dataIndex : 'posname',
					text : '现在单位'
				}, {
					xtype : 'gridcolumn',
					dataIndex : 'partstate',
					text : '工件状态'
				}, {
					xtype : 'gridcolumn',
					text : '签收',
					dataIndex : 'signed',
					width : 60
				} ],
				selModel : Ext.create('Ext.selection.CheckboxModel', {
					mode : "SIMPLE"
				}),
				store : Ext.create('Ext.data.Store', {
					fields : [ 'partlistbarcode', 'partlistcode', 'modulecode', 'prostate', 'posname', 'signed', 'quantity' ],
					proxy : {
						type : 'ajax',
						url : '',
						reader : {
							type : 'json',
							root : 'parts'
						}
					}
				}),

				viewConfig : {
					getRowClass : me.renderRow
				},

				listeners : {
					select : me.selectionPart
				},
				dockedItems : [ {
					xtype : 'toolbar',
					dock : 'top',
					items : [ {
						xtype : 'textfield',
						fieldLabel : '输入编号',
						labelWidth : 60
					}, {
						xtype : 'button',
						width : 80,
						text : '查询'
					} ]
				}, {
					xtype : 'toolbar',
					dock : 'bottom',
					ui : 'footer',
					items : [ {
						xtype : 'button',
						width : 80,
						text : '签收',
						scope : me,
						handler : me.verifySignPart
					} ]
				} ]
			} ]
		});

		me.callParent(arguments);
	},

	selectionPart : function(model, record, index, eOpts) {
		if (selected.data.signed == '已签收') {
			model.setLocked(false);
		}
	},
	/**
	 * 得到模具要签收的工件信息
	 */
	onClickModule : function(tree, record, item, index, e, eOpts) {
		if (record) {
			var grid = Ext.getCmp('sign-parts-grid-id');
			var tmp = record.data.id.split(';');
			twt = tree.up('panel');
			tree.up('panel').up('panel').moduleBarcode = tmp[0];
			tree.up('panel').up('panel').resumeId = tmp[1];

			grid.getStore().load({
				url : 'module/process/moduleSignPart',
				params : {
					moduleBarcode : tmp[0],
					resumeId : tmp[1]
				}
			});
		}
	},

	/**
	 * row样式渲染 当工件已签收时字体着色
	 * 
	 * @param record
	 * @param rowIndex
	 * @param rowParams
	 * @param store
	 * @returns
	 */
	renderRow : function(record, rowIndex, rowParams, store) {
		return record.get("signed") == '已签收' ? "dept-part-signed" : "";
	},

	/**
	 * 签收选定工件
	 */
	verifySignPart : function() {
		var me = this;
		var partListBarcodes = '';
		var grid = Ext.getCmp('sign-parts-grid-id');
		var model = App.getSelectionModel(grid);

		if (model == null || model.length == 0) {
			Fly.msg('签收', '您没有选择要签收的工件,请选择!');
			return;
		}

		var show = new Ext.LoadMask(grid, {
			msg : "模具工件签收中,请稍候..."
		});
		show.show();

		for ( var i in model) {
			partListBarcodes = partListBarcodes.concat(model[i].data.partlistbarcode).concat(';');
		}

		Ext.Ajax.request({
			url : 'module/process/verifySignPart',
			params : {
				moduleBarcode : me.moduleBarcode,
				partListBarcodes : partListBarcodes,
				resumeId : me.resumeId
			},
			success : function(response) {
				show.hide();
				var res = JSON.parse(response.responseText);

				App.InterPath(res, function() {
					App.responseResult('partlistbarcode', res.parts, model, grid.getStore(), "签收工件", "指定工件部分或全部签收不成功!", "工件签收成功!");

				});

			},
			failure : function(response, opts) {
				show.hide();

				App.Error(response);
			}
		});
	}
});