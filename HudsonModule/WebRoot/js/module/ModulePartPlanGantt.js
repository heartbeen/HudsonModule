/**
 * 
 */
Ext.define("Module.ModulePartPlanGantt", {
	extend : "Gnt.panel.Gantt",
	requires : [ 'Gnt.column.StartDate', 'Gnt.column.EndDate', 'Gnt.column.Duration', 'Gnt.column.PercentDone', 'Gnt.column.ResourceAssignment',
			'Sch.plugin.TreeCellEditing', 'Sch.plugin.Pan' ],
	rightLabelField : 'Responsible',
	highlightWeekends : true,// 突出显示周未
	showTodayLine : true,// 显示今天时间线
	loadMask : true,
	enableProgressBarResize : false,// 进度可否拖动
	skipWeekendsDuringDragDrop : false,
	weekendsAreWorkdays : true,// 周未也为工件时间
	cascadeChanges : true,
	readOnly : false,// 是否为只读
	crafts : null,
	format : 'Y-m-d G',
	craftPlanMenu : null,

	firstClick : null,// 用于判断两次点击的间隔时间
	secondClick : null,

	craftStartDate : NowDate,// 工艺的预计开始时间
	initComponent : function() {
		var me = this;

		Ext.apply(me, {
			title : '排工单',
			lockedGridConfig : {
				width : 480,
				title : '工艺',
				collapsible : true,
				listeners : {
					itemcontextmenu : me.itemContextMenu,
					containercontextmenu : me.containerContextMenu,
					cellclick : me.cellClick,
					itemdblclick : function(gttt, record, item, index) {
						var id = record.get('id');
						var remark = record.get('remark');
						Ext.Msg.prompt('提示', '请输入排程说明', function(e, value) {
							if (e == 'ok') {
								Ext.Ajax.request({
									url : 'module/schedule/saveEstimateRemark',
									params : {
										id : id,
										remark : value
									},
									method : 'POST',
									success : function(resp) {
										var backJson = Ext.JSON.decode(resp.responseText);
										if (backJson.success) {
											record.set('remark', value);
											showSuccess('保存工艺排程备注成功!');
										} else {
											var msg = backJson.msg ? backJson.msg : '保存工艺排程备注失败';
											showError(msg);
										}
									},
									failure : function(x, y, z) {
										showError('连接服务器失败!');
									}
								});
							}

						}, this, true, remark);
					}
				}
			},

			lockedViewConfig : {
				getRowClass : function(rec) {
					return rec.isRoot() ? 'root-row' : '';
				},

				// Enable node reordering in the locked grid
				plugins : {
					ptype : 'treeviewdragdrop',
					containerScroll : true,
					enableDrag : false
				},
				markDirty : false
			},

			// Experimental
			schedulerConfig : {
				collapsible : true,
				title : '加工进度甘特图'
			},

			leftLabelField : {
				dataIndex : 'Name',
				editor : {
					xtype : 'textfield'
				}
			},
			plugins : [ Ext.create('Sch.plugin.TreeCellEditing', {
				clicksToEdit : 1
			}), ],

			// Define an HTML template for the tooltip
			tooltipTpl : new Ext.XTemplate('<strong class="tipHeader">{Name}</strong>', '<table class="taskTip">',
					'<tr><td>开工时间:</td> <td align="right">{[values._record.getDisplayStartDate("Y-m-d H")]}</td></tr>',
					'<tr><td>完工时间:</td> <td align="right">{[values._record.getDisplayEndDate("Y-m-d H")]}</td></tr>', '</table>'),

			eventRenderer : function(task) {
				if (task.get('Color')) {
					var style = Ext.String.format('background-color: #{0};border-color:#{0}', task.get('Color'));

					return {
						// Here you can add custom per-task styles
						style : style
					};
				}
			},

			// Define the static columns
			columns : [ {
				xtype : 'treecolumn',
				header : '加工工艺',
				sortable : true,
				dataIndex : 'Name',
				width : 220,
				renderer : function(v, meta, r) {
					if (!r.data.leaf) {
						meta.tdCls = 'sch-gantt-parent-cell';
					}

					var remark = r.get('remark');

					return (v ? '<b><font color = ' + (remark ? 'red' : 'green') + '>|' + v + '|</font></b>' : v);
				},
				items : Ext.create('Project.component.GanttTaskFilterField', {
					store : me.taskStore
				}),
				sortableColumns : false
			}, {
				xtype : 'startdatecolumn',
				text : '开工时间',
				format : me.format,
				width : 115,
				sortableColumns : false
			}, {
				hidden : true,
				xtype : 'enddatecolumn',
				text : '完工时间',
				format : me.format,
				width : 115,
				sortableColumns : false
			}, {
				xtype : 'durationcolumn',
				text : '时间<br>跨度',
				width : 55,
				renderer : function(value) {
					return value;
				},
				sortableColumns : false
			}, {
				xtype : 'numbercolumn',
				text : '加工<br>工时',
				width : 55,
				dataIndex : 'evaluate',
				editor : {
					xtype : 'numberfield',
					allowDecimals : true,
					decimalPrecision : 1,
					minValue : 0
				},
				sortableColumns : false
			} ],

			tbar : Ext.create("Project.component.GanttToolbar", {
				gantt : me
			}),

			listeners : {
				taskdrop : me.taskDrop
			}
		});
		me.callParent(arguments);
	},

	taskDrop : function(gantt, taskRecord, eOpts) {
		console.log('taskdrop');
	},

	containerContextMenu : function(grid, e) {
		var me = grid.up('ganttpanel');
		me.craftMenuShow(me, null, e);
	},

	itemContextMenu : function(grid, record, item, index, e, eOpts) {
		var me = grid.up('ganttpanel');
		me.craftMenuShow(me, record, e);
	},

	/**
	 * 节点右键弹出菜单<br>
	 * 根据的不同弹出相应的菜单
	 */
	craftMenuShow : function(gantt, record, e) {

		var parent = Ext.getCmp('Module.ModulePartPlan');

		console.info(parent.isMainPart);
		if (!parent.isMainPart) {// 如果为单工件就不能增加或删除工艺
			return;
		}

		new Ext.create('Module.CraftPlanMenu', {
			craftItem : App.getModuleCraftMenu('public/getClassifyCrafts', 0),
			grid : gantt,
			record : record
		}).showAt(e.getXY());
	},

	/**
	 * 单击排程时间选择列追加事件
	 */
	cellClick : function(grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
		var me = grid.up('ganttpanel');

		// 操作间隔不能超700毫秒,否则不产生动作
		if (new Date().getTime() - me.currentTimeMillis < 500) {
			me.currentTimeMillis = new Date().getTime();
			me.isHasListeners = false;

			me.startColumn.editor.removeListener('blur', me.timeSelect);
			me.endColumn.editor.removeListener('blur', me.timeSelect);
			me.durationColumn.editor.removeListener('blur', me.durationSelect);
			me.evaluateColumn.getEditor().removeListener('blur', me.evaluateSelect);

			// showInfo("您的操作过快!");

			return;
		} else {
			me.currentTimeMillis = new Date().getTime();
		}

		// me.updataCraftWorkload(record);

		if (cellIndex == 0) {
			return;
		}

		if (me.startColumn == null) {
			me.startColumn = me.columns[1];
			me.endColumn = me.columns[2];
			me.durationColumn = me.columns[3];
			me.evaluateColumn = me.columns[4];

			me.startColumn.editor.timeLoc = 's';

			me.endColumn.editor.timeLoc = 'e';
			me.durationColumn.editor.timeLoc = 'd';
		}

		if (!me.isHasListeners) {
			me.isHasListeners = true;
			me.startColumn.editor.on('blur', me.timeSelect);
			me.endColumn.editor.on('blur', me.timeSelect);
			me.durationColumn.editor.on('blur', me.durationSelect);
			me.evaluateColumn.getEditor().on('blur', me.evaluateSelect);
		}

		// record.setStartDate(me.craftStartDate);

		me.nowPlanIndex = rowIndex;

		function setDisabled(abled) {
			me.startColumn.editor.setDisabled(abled);
			me.endColumn.editor.setDisabled(abled);
			me.durationColumn.editor.setDisabled(abled);

			if (abled) {
				Fly.msg('提示', '请安排上一个排程!');
			}
		}

		if (rowIndex > 0) {
			// 当上一个工艺没有安排时间时,当前选择的工艺就不能安排时间
			var upRecord = record.parentNode.childNodes[rowIndex - 1];
			if (upRecord.data.StartDate && upRecord.data.EndDate) {

				// me.startColumn.editor.setMinValue(upRecord.data.EndDate);

				if (!record.getStartDate()) {

					record.setStartDate(upRecord.data.EndDate);
				}

				setDisabled(false);
			} else {
				// me.startColumn.editor.setMinValue(me.craftStartDate);

				setDisabled(true);
			}
		} else {
			// me.startColumn.editor.setMinValue(me.craftStartDate);
			setDisabled(false);
		}

		ttt = record;

		me.clickCraftTaskItem = record;
		me.startTime = record.data.StartDate;
		me.endTime = record.data.EndDate;
		me.durationTime = record.data.Duration;
		me.planId = record.data.id;
		me.evaluateTiem = record.data.evaluate;
	},

	isHasListeners : false,
	currentTimeMillis : new Date().getTime(),
	planId : null,
	startColumn : null,
	endColumn : null,
	durationColumn : null,
	startTime : null,// 用来判断是否有改变日期
	endTime : null,// 用来判断是否有改变日期
	durationTime : null,
	clickCraftTaskItem : null,// 当前点击的工艺
	nowPlanIndex : null,
	evaluateTiem : null,

	timeSelect : function(field, the, eOpts) {
		var me = field.up('ganttpanel');

		var time = field.getValue();
		// 只判断该排程时间是否为空即可，为空则返回 |160418 ROCK
		if (time == null) {
			return;
		}

		// 如果时间没有改变时就不进行提交
		// if ((field.timeLoc == 's' && me.startTime == time) || (field.timeLoc
		// == 'e' && me.endTime == time)) {
		// return;
		// }

		// 时间改变时,进行保存
		me.saveCraftPlanTime(field, me);
	},

	/**
	 * 时间跨度变更方法
	 */
	durationSelect : function(field, the, eOpts) {
		var me = field.up('ganttpanel');
		var duration = field.getValue();
		// 如果时间没有改变时就不进行提交
		if (me.durationTime == duration) {
			return;
		}

		me.saveCraftDuration(field, me);

	},

	/**
	 * 工件加工时长变更方法
	 */
	evaluateSelect : function(field, the, eOpts) {
		var me = field.up('ganttpanel');
		var evaluate = field.getValue();
		// 如果时间没有改变时就不进行提交
		if (me.evaluateTiem == evaluate) {
			return;
		}

		if (evaluate > me.durationTime) {
			field.setValue(me.evaluateTiem);
			Fly.msg('错误', '加工时长不能大于时间跨度');
			return;
		}

		me.saveCraftEvaluate(field, me);
	},

	/**
	 * 更新工作量图表
	 */
	updataCraftWorkload : function(record) {
		try {
			var mpw = Ext.getCmp('ModulePartPlanWorkload');

			if (record) {
				mpw.craftId = record.data.craftId;
				mpw.date = Ext.Date.format(record.data.StartDate, 'Y-m');
				mpw.updateChartData(record.data.craftId, mpw.date);
				$('#part-plan-workload-title').text(record.data.Name + "工作量");

				mpw.chart.xAxis[0].removePlotLine('part-plan-plotLine');
				// 更新负荷基准线
				mpw.chart.xAxis[0].addPlotLine({
					value : record.data.StartDate,
					color : '#008B8B',
					width : 2,
					id : 'part-plan-plotLine',
					zIndex : 1000000,
					label : {
						text : Ext.Date.format(record.data.StartDate, 'Y-m-d')
					}
				});

				Ext.getCmp('part-plan-portletworkloaddate').setValue(record.data.StartDate);

			} else {
				mpw.updateChartData(mpw.craftId, mpw.date);
			}

		} catch (e) {
			console.error('工艺工作量面板没有找到!');
		}
	},

	/**
	 * 保存工艺排程时间
	 * 
	 * @param field
	 * @param craftBarcode
	 * @param duration
	 */
	saveCraftDuration : function(field, me) {
		var duration = field.getValue();
		var interval = (duration - me.durationTime) * 3600000;
		var isNeed = me.durationTime != null;

		Ext.Ajax.request({
			url : 'module/schedule/craftTime',
			params : {
				duration : duration,
				timeLoc : field.timeLoc,
				planId : me.planId,
				interval : interval,
				isNeed : me.durationTime != null
			},
			success : function(response) {
				var res = JSON.parse(response.responseText);

				App.InterPath(res, function() {

					if (res.success) {
						showSuccess(res.msg);

						if (isNeed) {
							me.moveCraftPlan(me.clickCraftTaskItem.parentNode, me.nowPlanIndex, interval);
						}

						// me.updataCraftWorkload();// 更新工艺工作量
						me.clickCraftTaskItem.commit();
						// me.craftStartDate =
						// me.clickCraftTaskItem.data.EndDate;
						// 用于下一个工艺的开始时间
						// var nextDate = new Date(me.craftStartDate.getTime() +
						// interval);

					} else {
						showError(res.msg);
						me.restore(field, me, false);
					}

				});
			},
			failure : function(response) {
				App.Error(response);
				me.restore(field, me, false);
			}
		});
	},

	/**
	 * 保存工件加工工时
	 */
	saveCraftEvaluate : function(field, me) {
		var evaluate = field.getValue();
		Ext.Ajax.request({
			url : 'module/schedule/evaluateTime',
			params : {
				"mes.id" : me.planId,
				"mes.evaluate" : evaluate
			},
			success : function(response) {
				var res = JSON.parse(response.responseText);

				App.InterPath(res, function() {

					if (res.success) {
						Fly.msg('工时', res.msg);

						// me.updataCraftWorkload();// 更新工艺工作量
						me.clickCraftTaskItem.commit();

					} else {
						Fly.msg('工时', '<span style="color:red">' + res.msg + '</span>');
						me.restore(field, me, false);
					}

				});
			},
			failure : function(response) {
				App.Error(response);
				me.restore(field, me, false);
			}
		});
	},
	/**
	 * 保存工艺排程时间
	 * 
	 * @param field
	 * @param craftBarcode
	 * @param duration
	 */
	saveCraftPlanTime : function(field, me) {

		var time = field.getRawValue();
		var rtime = field.getValue();

		if (me.clickCraftTaskItem.getIndex() > 0) {
			var up = me.clickCraftTaskItem.parentNode.childNodes[me.clickCraftTaskItem.getIndex() - 1];

			if (up.getEndDate() > rtime) {
				showError("当前工艺的开工时间不能超过前一工艺的完成时间");
				me.restore(field, me, true);
				return;
			}
		}

		var interval = field.timeLoc == 's' ? rtime - me.startTime : rtime - me.endTime;
		// 两种情况:1.时间为新设定,2.时间为调整,如果时间为调整时后续的工艺时间才要同时调整
		var isNeed = field.timeLoc == 's' ? me.startTime != null : me.endTime != null;

		Ext.Ajax.request({
			url : 'module/schedule/craftTime',
			params : {
				time : time,
				timeLoc : field.timeLoc,
				// 得到时间变动的间隔
				interval : interval,
				planId : me.planId,
				isNeed : isNeed

			},
			success : function(response) {
				var res = JSON.parse(response.responseText);

				App.InterPath(res, function() {

					if (res.success) {
						showSuccess(res.msg);

						if (isNeed) {
							me.moveCraftPlan(me.clickCraftTaskItem.parentNode, me.nowPlanIndex, interval);
						}

						// me.updataCraftWorkload();// 更新工艺工作量
						me.clickCraftTaskItem.commit();

					} else {
						showError(res.msg);
						me.restore(field, me, true);
					}
				});
			},
			failure : function(response) {
				App.Error(response);
				me.restore(field, me, true);
			}
		});
	},

	/**
	 * 没有权限或更新不成功时数据还原
	 * 
	 * @param field
	 * @param me
	 * @param isTime
	 *            更新的是时间值
	 */
	restore : function(field, me, isTime) {
		if (isTime) {
			if (field.timeLoc == 's')
				me.clickCraftTaskItem.setStartDate(me.startTime);

			if (field.timeLoc == 'e') {
				me.clickCraftTaskItem.setEndDate(me.endTime);
				me.clickCraftTaskItem.setDuration(me.durationTime);
			}
		} else {

			me.clickCraftTaskItem.setEndDate(me.endTiem);
			me.clickCraftTaskItem.setDuration(me.durationTime);
		}

	},

	/**
	 * 时间调整时,那么当前工艺之后的工艺时间也要相应调整
	 * 
	 * @param parentNode
	 * @param index
	 * @param interval
	 */
	moveCraftPlan : function(parentNode, index, interval) {
		var record;
		for (var i = index + 1; i < parentNode.childNodes.length; i++) {
			record = parentNode.childNodes[i];
			if (record.getStartDate()) {
				record.setStartDate(new Date(record.getStartDate().getTime() + interval));
			}

		}
	}
});

Ext.define('Module.CraftPlanMenu', {
	extend : 'Ext.menu.Menu',

	initComponent : function() {
		var me = this;

		for ( var i in me.craftItem) {
			me.craftItem[i].handler = me.addTaskAction;
		}

		Ext.applyIf(me, {
			items : [ {
				xtype : 'menuitem',
				text : '向前增加',
				iconCls : 'document-import-16',
				menu : {
					xtype : 'menu',
					direction : 'u',
					parent : me,
					items : me.craftItem
				}
			}, {
				xtype : 'menuitem',
				text : '向后增加',
				disabled : !me.record,
				iconCls : 'document-export-16',
				menu : {
					xtype : 'menu',
					direction : 'd',
					parent : me,
					items : me.craftItem
				}
			}, {
				xtype : 'menuseparator'
			}, {
				xtype : 'menuitem',
				disabled : !me.record,
				text : '删除工艺',
				iconCls : 'app-ruin-16',
				scope : me,
				handler : me.onDeletePlanTask
			} ]
		});

		me.callParent(arguments);
	},

	/**
	 * 创建新排程工艺任务
	 */
	copyTask : function(c, name) {
		var b = this.grid.getTaskStore().model;
		var a = new b({
			leaf : true
		});
		a.setPercentDone(0);
		a.setName(name);
		a.set(a.startDateField, null);
		a.set(a.endDateField, null);
		a.set(a.durationField, null);
		a.set(a.durationUnitField, (c && c.getDurationUnit()) || "h");
		return a;
	},

	/**
	 * 删除排程工艺
	 */
	onDeletePlanTask : function() {
		var me = this;
		var a = me.grid.getSelectionModel().selected;
		var parent = Ext.getCmp('Module.ModulePartPlan');

		Ext.Ajax.request({
			url : 'module/schedule/removeCraftPlan',
			params : {
				id : a.items[0].data.id

			},
			success : function(response) {
				var res = JSON.parse(response.responseText);

				App.InterPath(res, function() {
					if (res.success) {
						me.grid.taskStore.remove(a.getRange());

						if (me.grid.taskStore.getCount() == 0) {
							parent.selectPartRecord.set('cls', 'craft-schedule-noexits');
						}

						showSuccess(res.msg);
					} else {
						showError(res.msg);
					}
				});
			},
			failure : function(response) {
				App.Error(response);
			}
		});

		// Ext.MessageBox.show({
		// title : '排程',
		// msg : '你确定要删除->' + a.items[0].data.Name + " 这个工艺吗?",
		// buttons : Ext.MessageBox.YESNO,
		// buttonText : {
		// yes : "确定",
		// no : "取消"
		// },
		// fn : function(buttonId) {
		// if (buttonId == 'yes') {
		// Ext.Ajax.request({
		// url : 'module/schedule/removeCraftPlan',
		// params : {
		// id : a.items[0].data.id
		//
		// },
		// success : function(response) {
		// var res = JSON.parse(response.responseText);
		//
		// App.InterPath(res, function() {
		// if (res.success) {
		// me.grid.taskStore.remove(a.getRange());
		//
		// if (me.grid.taskStore.getCount() == 0) {
		// parent.selectPartRecord.set('cls', 'craft-schedule-noexits');
		// }
		//
		// showSuccess(res.msg);
		// } else {
		// showError(res.msg);
		// }
		// });
		// },
		// failure : function(response) {
		// App.Error(response);
		// }
		// });
		// }
		// }
		// });
	},

	/**
	 * 新增排程工艺
	 */
	addTaskAction : function(item) {
		var upMenu = item.up('menu');
		if (upMenu.direction == 'u') {
			upMenu.parent.addTaskAboveAction(item.text, item.craftId.split('-')[2]);
		} else {
			upMenu.parent.addTaskBelowAction(item.text, item.craftId.split('-')[2]);
		}
	},

	/**
	 * 向前增加排程工艺动作
	 * 
	 * @param name
	 *            工艺名称
	 */
	addTaskAboveAction : function(name, craftId) {
		this.addTaskAbove(this.copyTask(this.record, name), craftId);
	},

	/**
	 * 向后增加排程工艺动作
	 * 
	 * @param name
	 *            工艺名称
	 */
	addTaskBelowAction : function(name, craftId) {
		this.addTaskBelow(this.copyTask(this.record, name), craftId);
	},

	/**
	 * 向前增加排程工艺方法
	 * 
	 * @param a
	 */
	addTaskAbove : function(a, craftId) {
		var b = this.record;
		if (b) {
			b.addTaskAbove(a);
		} else {
			this.grid.taskStore.getRootNode().appendChild(a);

		}

		this.submitCraftPlan(a, craftId);
	},

	/**
	 * 向后增加排程工艺方法
	 * 
	 * @param a
	 */
	addTaskBelow : function(a, craftId) {
		var b = this.record;
		if (b) {
			b.addTaskBelow(a);

		} else {
			this.grid.taskStore.getRootNode().appendChild(a);
		}

		this.submitCraftPlan(a, craftId);

	},

	/**
	 * 增加工艺排程
	 * 
	 * @param plan
	 * @param craftId
	 */
	submitCraftPlan : function(plan, craftId) {
		var me = this;
		var parent = Ext.getCmp('Module.ModulePartPlan');

		Ext.Ajax.request({
			url : 'module/schedule/createCraftPlan',
			params : {
				"mes.moduleResumeId" : parent.moduleResumeId,
				"mes.craftId" : craftId,
				"mes.rankNum" : plan.data.index,
				"partBarCode" : parent.partBarCode,
				"partListId" : parent.partListBarcodes,
				"isAll" : parent.isAll,
				"isEnd" : this.grid.taskStore.getCount() - 1 == plan.data.index

			},
			success : function(response) {
				var res = JSON.parse(response.responseText);

				App.InterPath(res, function() {
					if (res.success) {
						plan.set("id", res.schId);
						plan.set("craftId", craftId);

						showSuccess(res.msg);

						// 标记工件已安排排程
						parent.selectPartRecord.set('cls', 'craft-schedule-exits');
					} else {

						showError(res.msg);
						me.grid.taskStore.remove(plan);
					}
				});
			},
			failure : function(response) {
				App.Error(response);
				me.grid.taskStore.remove(plan);
			}
		});

	}

});
