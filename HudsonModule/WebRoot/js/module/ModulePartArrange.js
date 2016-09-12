/**
 * 机加工工件安排介面
 * 
 */
Ext.define('Module.ModulePartArrange', {
	extend : 'Ext.panel.Panel',

	waitProcessPartFields : [ "modulecode", "endtime", "craftschbarcode", "starttime", "schtype", "id", "duration", "partlistbarcode",
			"machinebarcode", "resumeid", "partstate", "quantity", "partlistcode", "intime", "schbarcode", "machinecode" ],

	id : 'Module.ModulePartArrange',
	title : '工件安排',
	// 工艺工作拆分
	craftSplit : [],
	// 选择的模具
	moduleBarcode : null,
	// 选择的加工履历
	resumeId : null,
	// 选择加工工艺
	craftId : null,
	// 工艺名称
	craftName : null,

	initComponent : function() {
		var me = this;

		if (PlanDeptCrafts && PlanDeptCrafts.length > 0)
			me.craftId = PlanDeptCrafts[2].id.split(';')[1];

		Ext.applyIf(me, {
			layout : {
				type : 'border'
			},

			items : [ {
				xtype : 'container',
				flex : 1,
				region : 'north',
				layout : {
					type : 'border'
				},
				items : [ Ext.create('Module.ModuleDeptTreePanel', {
					region : 'west',
					invoke : [ function() {
						// 树刷新时执行
						var grid = Ext.getCmp('part-wait-process-gridpanel-id');
						grid.setTitle('工件清单');
						App.clearGrid(grid);
					} ],
					listeners : {
						itemclick : me.itemClick
					}
				}), {
					xtype : 'gridpanel',
					id : 'part-wait-process-gridpanel-id',
					region : 'center',
					title : '工件清单',
					columnLines : true,
					dockedItems : [ {
						xtype : 'toolbar',
						id : 'dept-plan-toolbar-id',
						dock : 'top',

						defaults : {
							margins : '0 5 0 0',
							pressed : false,
							toggleGroup : 'workPlanbtns',
							allowDepress : false
						},
						items : PlanDeptCrafts.length > 0 ? PlanDeptCrafts : []
					} ],
					store : Ext.create('Ext.data.Store', {
						storeId : 'part-plan-store-id',
						fields : me.waitProcessPartFields,
						proxy : {
							type : 'memory',
							reader : {
								type : 'json',
								root : 'list'
							}
						}
					}),
					columns : [ {
						xtype : 'rownumberer'
					}, {
						xtype : 'gridcolumn',
						width : 100,
						dataIndex : 'partlistcode',
						text : '部号'
					}, {
						xtype : 'numbercolumn',
						width : 49,
						dataIndex : 'quantity',
						format : '0',
						text : '件数'
					}, {
						xtype : 'datecolumn',
						dataIndex : 'intime',
						width : 115,
						format : Module.detaFormat,
						text : '接收时间'
					}, {
						xtype : 'datecolumn',
						dataIndex : 'starttime',
						width : 115,
						format : Module.detaFormat,
						text : '预计开工时间'
					}, {
						xtype : 'datecolumn',
						dataIndex : 'endtime',
						width : 115,
						format : Module.detaFormat,
						text : '预计完工时间'
					}, {
						xtype : 'gridcolumn',
						width : 60,
						dataIndex : 'machinecode',
						text : '机台号'
					}, {
						xtype : 'gridcolumn',
						dataIndex : 'schtype',
						width : 70,
						text : '工件类型'
					}, {
						xtype : 'gridcolumn',
						width : 65,
						dataIndex : 'partstate',
						renderer : function(value) {
							return Module.partState[value];
						},
						text : '工件状态',
						width : 70,
					}, {
						xtype : 'gridcolumn',
						text : '所属厂别'
					} ],

					listeners : {
						itemdblclick : me.arrangePartClick
					}
				} ]
			}, Ext.create('Module.ModuleArrangeConduct', {
				flex : 1.85,
				region : 'center',
				waitProcessPartFields : me.waitProcessPartFields
			}) ]
		});

		me.callParent(arguments);
	},
	/**
	 * 工号点击事件
	 */
	itemClick : function(tree, record, item, index, e, eOpts) {

		if (record) {
			var me = Ext.getCmp('Module.ModulePartArrange');
			var tmp = record.data.id.split(';');
			me.moduleBarcode = tmp[0];
			me.resumeId = tmp[1];
			me.moduleCode = record.data.text;
			me.selectWaitProcessPart(me, Ext.getStore('part-plan-store-id'));
		}
	},

	/**
	 * 得到在当前单位的工件信息
	 */
	selectWaitProcessPart : function(me, store) {

		var grid = Ext.getCmp('part-wait-process-gridpanel-id');
		grid.setTitle(me.moduleCode + "  工件清单");
		var show = new Ext.LoadMask(grid.getView(), {
			msg : "工件清单加载中..."
		});
		show.show();

		Ext.Ajax.request({
			url : 'module/process/waitProcessPart',
			params : {
				'partDetailed.moduleBarcode' : me.moduleBarcode,
				'partDetailed.resumeId' : me.resumeId,
				'partDetailed.craftId' : me.craftId
			},
			success : function(response) {
				var res = JSON.parse(response.responseText);

				App.InterPath(res, function() {
					if (res.success) {
						store.loadData(res.waitParts);
					} else {
						Fly.msg('清单', res.message);
					}
				});
				show.hide();

			},
			failure : function(response, opts) {
				App.Error(response);
				show.hide();
			}
		});
	},

	/**
	 * 选择要安排的工件
	 */
	arrangePartClick : function(grid, record, item, index, e, eOpts) {
		if (!record)
			return;

		if (record.data.partstate > 0) {
			Fly.msg('工件安排', '工件已安排过,请选择其它工件');
			return;
		}

		var store = Ext.getStore('arrange-part-store-id');

		if (store.indexOfTotal(record) < 0) {
			record.data.modulecode = Ext.getCmp('Module.ModulePartArrange').moduleCode;
			store.insert(store.getCount(), record);
		}

	},

	/**
	 * 读取选中的工艺的拆分工作,如果没有拆分时,就直接执行安排工作,如果有拆分就要读取工艺的拆分工作
	 * 
	 * @param fields
	 * @param records
	 * @param me
	 */
	createCraftSplit : function(me) {
		var splitTab = Ext.getCmp('craft-split-tabpanel-id');
		var formPanel = [];

		splitTab.removeAll();

		splitTab.setTitle(me.craftName);

		Ext.Ajax.request({
			url : 'public/craftSplit',
			params : {
				craftId : me.craftId
			},
			success : function(response) {
				var res = JSON.parse(response.responseText);

				App.InterPath(res, function() {
					if (res.success) {// 工艺有拆分工作 如:CNC加工时拆分为:编程和机加工

						for ( var i in res.split) {
							formPanel.push(Ext.create('CraftSplitPanel', {
								craftId : me.craftId,
								craftsplitId : res.split[i].id,
								title : res.split[i].splitname,
								machines : MachineCombo
							}));
						}
					} else {// 工艺没有拆分工作 如:平面磨床

						formPanel.push(Ext.create('CraftSplitPanel', {
							craftId : me.craftId,
							craftsplitId : '',
							title : me.craftName,
							machines : MachineCombo
						}));
					}

					splitTab.add(formPanel);
					splitTab.setActiveTab(0);
					splitTab.splitCount = formPanel.length;// 工艺分割任务的数量
				});
			},
			failure : function(response, opts) {
				App.Error(response);
			}
		});
	}
});
