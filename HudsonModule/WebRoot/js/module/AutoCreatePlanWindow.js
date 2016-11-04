Ext.define('Module.AutoCreatePlanWindow', {
	extend : 'Ext.window.Window',

	height : 450,
	width : 550,
	resizable : false,
	layout : {
		type : 'fit'
	},

	// 勾选的节点
	checkNodes : [],
	// 选中的节点
	selNode : null,

	modal : true,
	taskStore : null,

	initComponent : function() {
		var me = this;

		me.store = Ext.create('Ext.data.Store', {
			id : 'module-schedule-set-list-store',
			fields : [ 'craftid', 'craftname', 'duration', 'interval', 'intro' ],
			proxy : {
				type : 'memory'
			}
		});

		Ext.applyIf(me, {
			listeners : {
				destroy : function(win) {
					for ( var x in me.checkNodes) {
						var tNode = me.checkNodes[x];

						tNode.set('checked', false);
					}
				}
			},
			items : [ {
				xtype : 'gridpanel',
				border : false,
				title : '预设排程(注意:如果当前有排程时,会将现有排程删除)',
				store : me.store,

				plugins : [ Ext.create('Ext.grid.plugin.CellEditing', {
					clicksToEdit : 1
				}) ],

				columns : [ {
					xtype : 'rownumberer'
				}, {
					xtype : 'gridcolumn',
					dataIndex : 'craftname',
					text : '工艺'
				}, {
					xtype : 'numbercolumn',
					dataIndex : 'duration',
					text : '时间跨度',
					field : {
						xtype : 'numberfield',
						minValue : 1
					}
				}, {
					xtype : 'numbercolumn',
					dataIndex : 'interval',
					width : 60,
					text : '间隔时间',
					field : {
						xtype : 'numberfield',
						minValue : 0
					}
				}, {
					xtype : 'gridcolumn',
					dataIndex : 'intro',
					width : 150,
					text : '排程说明',
					field : {
						xtype : 'textfield'
					}
				}, {
					xtype : 'actioncolumn',
					width : 44,
					items : [ {
						iconCls : 'gtk-close-16',
						tooltip : '删除当前工艺',
						handler : me.onDeleteCraft
					} ]
				} ],
				dockedItems : [ {
					xtype : 'toolbar',
					dock : 'top',
					items : [ {
						xtype : 'datefield',
						id : 'auto-create-plan-startdate-id',
						fieldLabel : '开始日期',
						labelWidth : 60,
						format : 'Y-m-d',
						// minValue : new Date(),
						value : new Date()
					}, {
						xtype : 'timefield',
						id : 'auto-create-plan-starttime-id',
						width : 80,
						hideLabel : true,
						labelWidth : 60,
						increment : 60,
						format : 'H:i',
						value : new Date()
					} ]
				} ]
			} ],
			dockedItems : [ {
				xtype : 'toolbar',
				dock : 'bottom',
				ui : 'footer',
				items : [ {
					xtype : 'tbfill'
				}, {
					xtype : 'button',
					id : 'create-craft-plan-button',
					width : 80,
					text : '产生排程',
					iconCls : 'gtk-apply-16',
					scope : me,
					handler : me.createCraftPlan
				}, {
					xtype : 'button',
					id : 'cancel-craft-plan-button',
					width : 80,
					text : '取消',
					iconCls : 'gtk-cancel-16',
					handler : function() {
						me.destroy();
					}
				} ]
			} ]
		});

		me.callParent(arguments);
	},

	onDeleteCraft : function(grid, rowIndex, colIndex) {
		var store = grid.getStore();

		store.removeAt(rowIndex);
		grid.refresh();
	},

	/**
	 * 建排程方法
	 */
	createCraftPlan : function() {
		// 获取主窗口
		var me = this;

		var setRows = Ext.getStore('module-schedule-set-list-store').getRange();
		if (!setRows.length) {
			showError('排程集合没有任何工艺信息');
			return;
		}

		var stime = Ext.getCmp('auto-create-plan-starttime-id').getValue();
		var sdate = Ext.getCmp('auto-create-plan-startdate-id').getValue();

		var datetime = Ext.Date.format(sdate, 'Y-m-d') + " " + Ext.Date.format(stime, 'h:i:s');

		var craftSet = [], checkpart = [];
		for ( var x in setRows) {
			craftSet.push(setRows[x].getData());
		}

		for ( var x in me.checkNodes) {
			var childNode = me.checkNodes[x];
			checkpart.push(childNode.get('partbarlistcode'));
		}

		App.Progress('正在复制中...', '排程复制');

		Ext.Ajax.request({
			url : 'module/schedule/autoCraftPlan',
			params : {
				seldate : datetime,
				setlist : Ext.JSON.encode(craftSet),
				quotes : Ext.JSON.encode(checkpart),
				selpart : me.selNode.get('partbarlistcode')
			},
			success : function(response) {
				var res = JSON.parse(response.responseText);
				App.ProgressHide();

				App.InterPath(res, function() {
					if (res.success) {
						for ( var x in me.checkNodes) {
							var tNode = me.checkNodes[x];

							tNode.set('checked', false);
							tNode.set('cls', 'craft-schedule-exits');
						}

						if (res.gantt.length) {
							for ( var x in res.gantt) {
								res.gantt[x].Name = res.gantt[x].name;
								res.gantt[x].PercentDone = res.gantt[x].percentDone;

								res.gantt[x].StartDate = res.gantt[x].startDate;
								res.gantt[x].EndDate = res.gantt[x].endDate;

								res.gantt[x].Duration = res.gantt[x].duration;
								res.gantt[x].DurationUnit = res.gantt[x].durationUnit;
							}

							me.taskStore.loadData(res.gantt);
						}

						me.close();

						showSuccess(res.msg);
					} else {
						showError(res.msg);
					}
				});
			},
			failure : function(x, y, z) {
				App.ProgressHide();
				showError('连接服务器失败');
			}
		});

	},

	/**
	 * 得到需要删除的旧排程的ID
	 * 
	 * @returns {Array}
	 */
	getNeedOldCraftPlanId : function(planIds) {
		var taskRoot = this.parentPanel.taskGantt;
		for ( var x in taskRoot) {
			for ( var y in taskRoot[x]) {
				if (taskRoot[x]) {
					planIds.push(taskRoot[x][y].id);
				}
			}
		}
	},

	getAutoCraftPlanObject : function(craftPlanList) {
		var me = this;
		me.tasks = new Array();
		var record;
		var startTime = App.getRawValue('auto-create-plan-startdate-id') + ' ' + App.getRawValue('auto-create-plan-starttime-id');
		var endTime;
		var duration;
		var intervalTime = 0;
		var count = me.store.getCount();
		var index = 0;
		var tmp = "";
		var mainCount = 0;
		var intro = '';

		for (var i = 0; i < count; i++) {
			record = me.store.getAt(i);

			// 计算开工与完工时间
			duration = record.data.duration;
			startTime = i == 0 ? Ext.Date.parse(startTime, "Y-m-d H:i") : intervalTime;
			endTime = new Date(startTime.getTime() + 3600000 * duration);
			intervalTime = new Date(endTime.getTime() + record.data.interval * 3600000);

			intro = record.data.intro;

			// 生成排程Gantt数据
			me.tasks.push(me.copyTask(record.data.craftid, record.data.craftname, startTime, endTime, duration, i, intro));

			// 封装数据
			/** 可以对多个工件同时安排工艺排程 ------------------------------------------ */
			for ( var x in me.partBarCodes) {
				// 汇总工件的排程
				craftPlanList.mainPart.push(me.createCraftPlanObject(me.tasks[i], me.partBarCodes[x], me.moduleResumeId));

				// 零件清单的排程
				for ( var y in me.partListBarcodes[x]) {
					craftPlanList.partList.push(me.createCraftPlanObject(me.tasks[i], me.partListBarcodes[x][y], me.moduleResumeId));
					tmp = tmp + index + ";";

					index = index + 1;
				}

				// 用于存放当汇总工件的工件清单排程所在的索引
				craftPlanList.mainPart[mainCount++].parentId = tmp;

				tmp = "";
			}

		}
	},

	/**
	 * 生成数据对象
	 * 
	 * @param task
	 * @returns {___anonymous5977_6334}
	 */
	createCraftPlanObject : function(task, partBarCode, moduleResumeId) {
		// var me = this;
		console.info(task);

		var craftPlan = {
			"partId" : partBarCode,
			"startTime" : Ext.Date.format(task.getStartDate(), "Y-m-d?H:i:s.uO").replace('?', 'T'),
			"endTime" : Ext.Date.format(task.getEndDate(), "Y-m-d?H:i:s.uO").replace('?', 'T'),
			"craftid" : task.data.craftid,
			"moduleRId" : moduleResumeId,
			"rankNum" : task.data.index,
			"duration" : task.getDuration(),
			"remark" : task.data.intro
		};

		return craftPlan;
	},

	copyTask : function(craftid, name, startTime, endTime, duration, index, intro) {
		var model = this.taskStore.model;
		var task = new model({
			leaf : true
		});
		task.setPercentDone(0);
		task.data.craftid = craftid;
		task.setName(name);
		task.set(task.startDateField, startTime);
		task.set(task.endDateField, endTime);
		task.set(task.durationField, duration);
		task.set(task.durationUnitField, "h");
		task.setIndex(index);
		task.data.intro = intro;

		return task;
	},

});