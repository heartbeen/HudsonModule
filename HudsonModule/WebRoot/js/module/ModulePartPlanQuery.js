/**
 * 模具排程查看
 */
Ext.define('Module.ModulePartPlanQuery', {
	extend : 'Ext.panel.Panel',

	layout : {
		type : 'border'
	},
	partFields : [ "moduleResumeId", "partBarCode", "name", "moduleresumeid", "partbarlistcode", "partbarcode", "partcode", "text", "cnames" ],
	moduleResumeId : '',// 模具的加工履历ID
	partBarCode : '',// 工件Id
	partListBarcode : '',// 工件清单ID
	partListBarcodes : '',
	isMainPart : true,// 工件是否为汇总工件
	isNewPredictCraft : false,// 是否不新的预设工艺集合

	initComponent : function() {
		var me = this;

		Ext.define('MyTaskModel', {
			extend : 'Gnt.model.Task',

			// A field in the dataset that will be added as a
			// CSS class to each
			// rendered task element
			clsField : 'TaskType',
			fields : [ {
				name : 'TaskType',
				type : 'string'
			}, {
				name : 'Color',
				type : 'string'
			}, {
				name : 'craftId',
				type : 'string'
			} ]
		});

		me.gantt = Ext.create("Module.ModulePartPlanQueryGantt", {
			region : 'center',
			rowHeight : 20,
			taskStore : Ext.create("Gnt.data.TaskStore", {
				model : 'MyTaskModel',
				proxy : {
					type : 'ajax',
					url : '',
					reader : {
						type : 'json'
					}
				},
				rootVisible : false
			}),
			dependencyStore : Ext.create("Gnt.data.DependencyStore", {
				autoLoad : false,
				proxy : {
					type : 'memory',
				}
			}),
			// assignmentStore : assignmentStore,
			// resourceStore : resourceStore,
			columnLines : true,
			rowLines : true,

			startDate : new Date(),// 模具开始时间
			endDate : Sch.util.Date.add(new Date(), Sch.util.Date.WEEK, 20),// 模具T0时间

			viewPreset : 'weekAndDayLetter'
		});

		Ext.applyIf(me, {
			items : [
					{
						xtype : 'panel',
						region : 'west',
						split : true,
						width : 305,
						layout : {
							type : 'border'
						},
						collapsed : false,
						collapsible : true,
						bodyPadding : 3,
						items : [ {
							xtype : 'gridpanel',
							title : '模具工号',
							region : 'center',
							forceFit : true,
							flex : 1,
							rootVisible : false,
							viewConfig : {
								emptyText : '<h1 style="margin:10px">查询不到模具工号</h1>',
							},
							store : Ext.create('Ext.data.Store', {
								autoLoad : true,
								fields : [ "endtime", "starttime", "modulebarcode", 'modulecode', "guestcode", "resumename", "resumestate", "text",
										"id" ],
								proxy : {
									url : '',
									type : 'ajax',
									reader : {
										type : 'json',
										root : 'children'
									}
								}
							}),
							columns : [ {
								text : '模具工号',
								dataIndex : 'modulecode',
								renderer : function(val, meta, record) {
									var _resumename = record.get('resumename');
									var _guestcode = record.get('guestcode');
									return '<b>' + val + (_guestcode ? ('/<font color = blue>' + _guestcode + '</font>') : '')
											+ "<font color = red>[" + (!_resumename ? '完成' : _resumename) + ']</font></b>';
								}
							} ],
							dockedItems : [ {
								xtype : 'toolbar',
								dock : 'top',
								items : [ {
									id : 'mppq-chk-by-guest',
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
							listeners : {
								itemclick : me.onClickModuleNumber,
								load : function() {
									// me.gantt.setTitle('排工单');
									// var
									// partStore
									// =
									// Ext.getStore('module-part-plan-query-tree-store-id');
									// partStore.load([]);

									// me.isMainPart
									// =
									// false;

								}
							}
						}
						// , {
						// xtype : 'treepanel',
						// split : true,
						// flex : 1.3,
						// border : '1 0 0 0',
						// region : 'south',
						// margin : '5 0 0 0',
						// title : '工件列表',
						// useArrows : true,
						// rootVisible : false,
						// store : Ext.create('Ext.data.TreeStore', {
						// id : 'module-part-plan-query-tree-store-id',
						// fields : me.partFields,
						// autoLoad : false,
						// proxy : {
						// type : 'ajax',
						// url : 'public/moduleResumePart',
						// reader : {
						// type : 'json',
						// root : 'children'
						// }
						// }
						// }),
						//
						// listeners : {
						// itemclick : me.onClickModulePart
						// }
						// }
						]
					}, me.gantt ]
		});

		me.callParent(arguments);
	},

	/**
	 * 新模或修模/设变
	 */
	onResumeModule : function(ctrl, nw) {
		var item = this;
		var chk = Ext.getCmp('mppq-chk-by-guest').getValue();
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

		// if (record) {
		// var store =
		// Ext.getStore('module-part-plan-tree-store-id');
		// store.load({
		// url : store.proxy.url,
		// params : {
		// moduleResumeId : record.data.id
		// }
		// });
		//
		// }//

		var parent = Ext.getCmp('Module.ModulePartPlanQuery');
		parent.partBarCode = '';
		parent.partListBarcode = "";

		parent.gantt.getTaskStore().loadData([]);
		// 设置排程区间
		parent.gantt.setStart(Ext.Date.parse(record.data.starttime, "Y-m-d H:i:s.u"));
		parent.gantt.setEnd(Ext.Date.parse(record.data.endtime, "Y-m-d H:i:s.u"));

		parent.gantt.setTitle(record.data.text);

		parent.isMainPart = false;// 表示没有选中主工件

		App.Progress('工艺排程读取中,请稍候...', '工艺排程');

		Ext.Ajax.request({
			url : 'module/schedule/moduleResumePlanGantt',
			params : {
				mri : record.data.id,
				s : record.data.starttime,
				e : record.data.endtime,
				m : record.data.text
			},
			success : function(response) {

				try {
					var res = JSON.parse(response.responseText);

					App.InterPath(res, function() {
						if (!res.success) {
							Fly.msg('提示', "<span style='color:blue;'>" + res.gantt[0].Name + res.msg + "</span>");
						}

						parent.gantt.taskStore.loadData(res.gantt);

					});
				} catch (e) {
					Fly.msg('错误', "<span style='color:red;'>回传数据错误</span>");
				}

				App.ProgressHide();
			},
			failure : function(response) {

				App.ProgressHide();
				App.Error(response);
			}
		});

	},

	/**
	 * 
	 * @param treeview
	 * @param record
	 */
	onClickModulePart : function(treeview, record) {
		if (!record) {
			return;
		}

		var parent = Ext.getCmp('Module.ModulePartPlan');

		parent.tipTitle = record.data.text + "# 加工排程";
		parent.gantt.setTitle(parent.gantt.title.split(":")[0] + ":" + parent.tipTitle);

		App.Progress('工艺排程读取中,请稍候...', '工艺排程');

		Ext.Ajax.request({
			url : 'module/schedule/moduleResumePlanGantt',
			params : {
				msi : parent.moduleResumeId
			},
			success : function(response) {
				App.ProgressHide();

				var res = JSON.parse(response.responseText);

				App.InterPath(res, function() {
					if (!res.success) {
						Fly.msg('错误', "<span style='color:red;'>" + res.msg + "</span>");
					}

					parent.gantt.taskStore.loadData(res.gantt);

				});
			},
			failure : function(response) {

				App.ProgressHide();
				App.Error(response);
			}
		});

	}

});
