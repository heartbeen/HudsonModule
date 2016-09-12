/**
 * 模具工件条码打印介面
 * 
 * 作者:David Email:xuweissh@163.com
 */
Ext.define('Module.ModulePartBarcode', {
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
			items : [
					{
						xtype : 'panel',

						region : 'west',
						split : true,
						width : 310,
						bodyPadding : 3,
						layout : {
							type : 'border'
						},
						collapsed : false,
						collapsible : true,

						items : [
								{
									xtype : 'gridpanel',
									title : '模具工号',
									region : 'center',
									border : true,
									flex : 1,
									forceFit : true,
									rootVisible : false,
									viewConfig : {
										emptyText : '<h1 style="10214053000margin:10px">查询不到模具工号</h1>',
									},
									store : Ext.create('Ext.data.Store', {
										autoLoad : true,
										fields : [ "endtime", "starttime", "modulebarcode", 'modulecode', "guestcode", "resumename", "resumestate",
												"text", "id", "leaf" ],
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
										items : [ {
											id : 'mpb-chk-by-guest',
											xtype : 'checkbox',
											boxLabel : '依番号'
										}, ''
										// ,
										// Ext.create('Module.ModuleFindTextField',
										// {
										// queryLength : 2,
										// url : 'public/module?isResume=false'
										// })
										, {
											xtype : 'textfield',
											emptyText : '请输入模具号',
											isTxt : true,
											listeners : {
												change : me.onResumeModule
											}
										}, {
											text : '快速查询',
											iconCls : 'lightning-16',
											menu : Ext.create("Ext.menu.Menu", {
												items : [ {
													text : '新增模具',
													// isNew : true,
													isTxt : false,
													states : "['20401']",
													parent : me,
													iconCls : 'cog_add-16',
													handler : me.onResumeModule
												}, {
													text : '修模设变',
													isTxt : false,
													// isNew : false,
													states : "['20402','20403']",
													parent : me,
													iconCls : 'cog_edit-16',
													handler : me.onResumeModule
												}, {
													text : '零件加工',
													isTxt : false,
													states : "['20408']",
													// isNew : false,
													iconCls : 'cog-16',
													parent : me,
													handler : me.onResumeModule
												}, {
													text : '治具加工',
													isTxt : false,
													states : "['20409']",
													// isNew : false,
													iconCls : 'cog_go-16',
													parent : me,
													handler : me.onResumeModule
												}, {
													text : '量产加工',
													isTxt : false,
													states : "['20410']",
													// isNew : false,
													iconCls : 'wand-16',
													parent : me,
													handler : me.onResumeModule
												}, {
													text : '暂停模具',
													isTxt : false,
													// isNew : false,
													states : "['20404']",
													parent : me,
													iconCls : 'cog_delete-16',
													handler : me.onResumeModule
												} ]
											})
										} ]
									} ],
									columns : [ {
										xtype : 'gridcolumn',
										dataIndex : 'modulecode',
										text : '模具工号',
										renderer : function(val, meta, record) {
											var _resumename = record.get('resumename');
											var _guestcode = record.get('guestcode');
											return '<b>' + val + (_guestcode ? ('/<font color = blue>' + _guestcode + '</font>') : '')
													+ "<font color = red>[" + (!_resumename ? '完成' : _resumename) + ']</font></b>';
										}
									} ],
									listeners : {
										itemclick : me.onClickModuleNumber,
										load : function() {
											Ext.getStore('module-part-barcode-store-id').loadData([]);
										}
									}
								}, {
									xtype : 'gridpanel',
									border : false,
									flex : 1.3,
									border : '1 0 0 0',
									region : 'south',
									margin : '5 0 0 0',
									title : '工件列表',
									store : partStore,
									columnLines : true,
									split : true,
									forceFit : true,
									columns : [ {
										xtype : 'gridcolumn',
										width : 85,
										dataIndex : 'modulecode',
										text : '模具工号',
										renderer : function(val) {
											return (val ? '<b>' + val + '</b>' : val);
										}
									}, {
										xtype : 'gridcolumn',
										width : 85,
										dataIndex : 'partlistcode',
										text : '零件编号',
										renderer : function(val) {
											return (val ? '<b>' + val + '</b>' : val);
										}
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
									} ]
								} ]
					}, Ext.create('Project.component.PrintPanel', {
						id : 'modulepart-barcode-printpanel',
						region : 'center',
						printObjectId : 'modulepart-barcode-object',
						printEmbedId : 'modulepart-barcode-embed',
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
	 * 新模或修模/设变
	 */
	onResumeModule : function(ctrl, nw) {
		var item = this;
		var chk = Ext.getCmp('mpb-chk-by-guest').getValue();
		item.up('gridpanel').getStore().load({
			url : 'public/getModuleResumeInfoByCase',
			params : {
				chk : chk,
				query : (item.isTxt ? nw : null),
				states : item.states
			}
		});
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
		this.previewBarcode('modulepart-barcode-printpanel', grid.getSelectionModel().getSelection(), 1, 14061800);
	},

	// /**
	// * 新模或修模/设变
	// */
	// onResumeModule : function() {
	// var item = this;
	// item.up('treepanel').getStore().load({
	// url : 'public/moduleForResume',
	// params : {
	// isNew : item.isNew
	// }
	// });
	// },

	/**
	 * 更新前提示
	 */
	onDeforeedit : function(editor, e, eOpts) {

	},
	/**
	 * 更新模具信息
	 */
	onUpdateModuleInfo : function(editor, e) {

		// var data = Ext.Array.toArray(e.record.data);

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