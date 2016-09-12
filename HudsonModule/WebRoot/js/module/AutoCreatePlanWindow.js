Ext.define('Module.AutoCreatePlanWindow', {
	extend : 'Ext.window.Window',

	height : 450,
	width : 550,
	resizable : false,
	layout : {
		type : 'fit'
	},

	partBarCodes : [],
	partListBarcodes : [],

	modal : true,
	taskStore : null,

	initComponent : function() {
		var me = this;

		me.store = Ext.create('Ext.data.Store', {
			fields : [ 'craftid', 'craftname', 'duration', 'interval', 'intro' ],
			proxy : {
				type : 'memory'
			}
		});

		Ext.applyIf(me, {
			items : [ {
				xtype : 'gridpanel',
				border : false,
				title : '预设排程(注意:如果当前有排程时,会将现有排程删除)',
				store : me.store,

				plugins : [ Ext.create('Ext.grid.plugin.CellEditing', {
					clicksToEdit : 1
				}) ],
				selModel : {
					selType : 'checkboxmodel',
					mode : 'SIMPLE'
				},
				columns : [ {
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
						minValue : 1
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
						iconCls : 'gtk-delete-16',
						text : '删除工序',
						handler : function() {
							var grid = this.up('gridpanel');
							var selRows = grid.getSelectionModel().getSelection();
							if (!selRows.length) {
								showInfo('未选中任何工序');
								return;
							}

							Ext.Msg.confirm('提醒', '是否确定要删除工序?', function(y) {
								if (y == 'yes') {
									grid.getStore().remove(selRows);
								}
							});
						}
					}, '-', {
						xtype : 'datefield',
						id : 'auto-create-plan-startdate-id',
						fieldLabel : '开始日期',
						labelWidth : 60,
						format : 'Y-m-d',
						minValue : new Date(),
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
					handler : me.onAutoCreate
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

		// Ext.MessageBox.show({
		// title : '排程',
		// msg : '你确定要删除->' + store.getAt(rowIndex).data.craftname + " 这个工艺吗?",
		// buttons : Ext.MessageBox.YESNO,
		// buttonText : {
		// yes : "確定",
		// no : "取消"
		// },
		// fn : function(buttonId) {
		// if (buttonId == 'yes') {
		// store.removeAt(rowIndex);
		// grid.refresh();
		// }
		// }
		// });
	},

	onAutoCreate : function() {
		var me = this;

		me.createCraftPlan();

		// App.Progress('派车申请单提交中,请稍候...', '提交派车申请单',
		// 'plan-delete-actioncolumn');
		// /App.ProgressHide();

		// Ext.MessageBox.show({
		// title : '排程',
		// msg : '你确定要删除->' + me.store.getAt(rowIndex).data.craftName + "
		// 这个工艺吗?",
		// buttons : Ext.MessageBox.YESNO,
		// buttonText : {
		// yes : "確定",
		// no : "取消"
		// },
		// fn : function(buttonId) {
		// if (buttonId == 'yes') {
		// me.createCraftPlan();
		// } else {
		// return;
		// }
		// }
		// });
	},

	/**
	 * 建排程方法
	 */
	createCraftPlan : function() {

		var me = this;
		console.info(this);

		var craftPlanList = {
			mainPart : [],
			partList : [],
			planIds : []
		};

		var tmp = me.title;

		me.setTitle('<span style="color:green;">自动生成排程中,请稍候...</span>');

		var createButton = Ext.getCmp('create-craft-plan-button');
		var cancelButton = Ext.getCmp('cancel-craft-plan-button');
		createButton.setDisabled(true);
		cancelButton.setDisabled(true);
		me.getAutoCraftPlanObject(craftPlanList);
		me.getNeedOldCraftPlanId(craftPlanList.planIds);

		Ext.Ajax.request({
			url : 'module/schedule/autoCraftPlan',
			params : {
				plan : Ext.JSON.encode(craftPlanList)

			},
			success : function(response) {
				var res = JSON.parse(response.responseText);

				App.InterPath(res, function() {
					if (res.success) {

						// 设置工艺排程ID
						for ( var i in me.tasks) {
							me.tasks[i].data.id = res.planId[i];
							me.tasks[i].data.remark = me.tasks[i].data.intro;
						}

						me.taskStore.loadData(me.tasks);

						me.parentPanel.taskGantt = [];// 一定要清空

						// 标记工件已安排排程
						me.parentPanel.selectPartRecord.set('cls', 'craft-schedule-exits');

						// 生成之后取消工件的选择
						for ( var i in me.selectParts) {
							me.selectParts[i].set("checked", false);
						}

						me.destroy();

					} else {
						Fly.msg('错误', "<span style='color:red;'>" + res.msg + "</span>");
						me.setTitle(tmp);

						createButton.setDisabled(false);
						cancelButton.setDisabled(false);
					}

				});

			},
			failure : function(response) {
				App.Error(response);
				me.setTitle(tmp);
				createButton.setDisabled(false);
				cancelButton.setDisabled(false);
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
		var intervalTime;
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