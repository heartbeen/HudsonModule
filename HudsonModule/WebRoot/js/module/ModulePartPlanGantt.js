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
	stripeRows : true,
	format : 'Y-m-d G',
	craftPlanMenu : null,

	firstClick : null,// 用于判断两次点击的间隔时间
	secondClick : null,

	craftStartDate : NowDate,// 工艺的预计开始时间
	initComponent : function() {
		var me = this;

		Ext.apply(me, {
			title : '计划排程信息',
			lockedGridConfig : {
				width : 420,
				title : '工艺排程',
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

			tbar : [ {
				text : '更新',
				iconCls : 'save-16'
			} ],

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
				width : 180,
				renderer : function(v, meta, r) {
					if (!r.data.leaf) {
						meta.tdCls = 'sch-gantt-parent-cell';
					}

					var remark = r.get('remark');

					return (v ? '<b><font color = ' + (remark ? 'red' : 'green') + '>|' + v + '|</font></b>' : v);
				},
				// items : Ext.create('Project.component.GanttTaskFilterField',
				// {
				// store : me.taskStore
				// }),
				sortableColumns : false
			}, {
				xtype : 'startdatecolumn',
				text : '开工时间',
				format : me.format,
				width : 105,
				sortableColumns : false
			}, {
				hidden : true,
				xtype : 'enddatecolumn',
				text : '完工时间',
				format : me.format,
				width : 105,
				sortableColumns : false
			}, {
				xtype : 'durationcolumn',
				text : '时间<br>跨度',
				width : 50,
				renderer : function(value) {
					return value;
				},
				sortableColumns : false
			}, {
				xtype : 'numbercolumn',
				text : '预计<br>工时',
				width : 50,
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
		// console.log('taskdrop');
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

		// 如果暂存的控件不为空则清除BLUR事件
		if (me.startColumn != null) {
			me.startColumn.editor.removeListener('blur', me.timeSelect);
			// me.endColumn.editor.removeListener('blur', me.timeSelect);
			me.durationColumn.editor.removeListener('blur', me.durationSelect);
			me.evaluateColumn.getEditor().removeListener('blur', me.evaluateSelect);
		} else {
			me.startColumn = me.columns[1];
			// me.endColumn = me.columns[2];
			me.durationColumn = me.columns[3];
			me.evaluateColumn = me.columns[4];
		}

		me.startColumn.editor.on('blur', me.timeSelect);
		// me.endColumn.editor.on('blur', me.timeSelect);
		me.durationColumn.editor.on('blur', me.timeSelect);
		me.evaluateColumn.getEditor().on('blur', me.timeSelect);

		me.startColumn.timeCol = 's';
		me.durationColumn.timeCol = 'd';
		me.evaluateColumn.timeCol = 'e';

		// 选中查询记录
		me.clickCraftTaskItem = record;
	},
	startColumn : null,// 开始时间
	endColumn : null,// 结束时间
	evaluateColumn : null,// 预估时间
	durationColumn : null,// 时间间隔
	clickCraftTaskItem : null,// 当前点击的工艺

	timeSelect : function(field, the, eOpts) {
		var me = field.up('ganttpanel');
		var evaluate = (field.name == 'evaluate' ? field.getValue() : me.clickCraftTaskItem.get('evaluate'));

		App.Progress('正在修改中...', '修改排程');

		Ext.Ajax.request({
			url : 'module/schedule/craftTime',
			params : {
				sid : me.clickCraftTaskItem.get('id'),
				start : Ext.Date.format(me.clickCraftTaskItem.get('StartDate'), 'Y-m-d H:i:s'),
				duration : Arith.toIntRef(me.clickCraftTaskItem.get('Duration'), 0),
				evaluate : Arith.toIntRef(evaluate, 0)
			},
			success : function(response) {
				App.ProgressHide();
				var res = JSON.parse(response.responseText);
				App.InterPath(res, function() {
					if (res.success) {
						me.clickCraftTaskItem.commit();
						showSuccess(res.msg);
					} else {
						me.clickCraftTaskItem.reject();
						showError(res.msg);
					}
				});
			},
			failure : function(response) {
				App.ProgressHide();
				me.clickCraftTaskItem.reject();
				showError('连接服务器失败');
				return;
			}
		});
	},
	//
	// /**
	// * 时间跨度变更方法
	// */
	// durationSelect : function(field, the, eOpts) {
	// var me = field.up('ganttpanel');
	// var duration = field.getValue();
	// // 如果时间没有改变时就不进行提交
	// if (me.durationTime == duration) {
	// return;
	// }
	//
	// me.saveCraftDuration(field, me);
	//
	// },
	//
	// /**
	// * 工件加工时长变更方法
	// */
	// evaluateSelect : function(field, the, eOpts) {
	// var me = field.up('ganttpanel');
	// var evaluate = field.getValue();
	// // 如果时间没有改变时就不进行提交
	// if (me.evaluateTiem == evaluate) {
	// return;
	// }
	//
	// if (evaluate > me.durationTime) {
	// field.setValue(me.evaluateTiem);
	// Fly.msg('错误', '加工时长不能大于时间跨度');
	// return;
	// }
	//
	// me.saveCraftEvaluate(field, me);
	// },

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
// ,
//
// /**
// * 保存工艺排程时间
// *
// * @param field
// * @param craftBarcode
// * @param duration
// */
// saveCraftDuration : function(field, me) {
// var duration = field.getValue();
// var interval = (duration - me.durationTime) * 3600000;
// var isNeed = me.durationTime != null;
//
// Ext.Ajax.request({
// url : 'module/schedule/craftTime',
// params : {
// duration : duration,
// timeLoc : field.timeLoc,
// planId : me.planId,
// interval : interval,
// isNeed : me.durationTime != null
// },
// success : function(response) {
// var res = JSON.parse(response.responseText);
//
// App.InterPath(res, function() {
//
// if (res.success) {
// showSuccess(res.msg);
//
// if (isNeed) {
// me.moveCraftPlan(me.clickCraftTaskItem.parentNode, me.nowPlanIndex,
// interval);
// }
//
// // me.updataCraftWorkload();// 更新工艺工作量
// me.clickCraftTaskItem.commit();
// // me.craftStartDate =
// // me.clickCraftTaskItem.data.EndDate;
// // 用于下一个工艺的开始时间
// // var nextDate = new Date(me.craftStartDate.getTime() +
// // interval);
//
// } else {
// showError(res.msg);
// me.restore(field, me, false);
// }
//
// });
// },
// failure : function(response) {
// App.Error(response);
// me.restore(field, me, false);
// }
// });
// },
//
// /**
// * 保存工件加工工时
// */
// saveCraftEvaluate : function(field, me) {
// var evaluate = field.getValue();
// Ext.Ajax.request({
// url : 'module/schedule/evaluateTime',
// params : {
// "mes.id" : me.planId,
// "mes.evaluate" : evaluate
// },
// success : function(response) {
// var res = JSON.parse(response.responseText);
//
// App.InterPath(res, function() {
//
// if (res.success) {
// Fly.msg('工时', res.msg);
//
// // me.updataCraftWorkload();// 更新工艺工作量
// me.clickCraftTaskItem.commit();
//
// } else {
// Fly.msg('工时', '<span style="color:red">' + res.msg + '</span>');
// me.restore(field, me, false);
// }
//
// });
// },
// failure : function(response) {
// App.Error(response);
// me.restore(field, me, false);
// }
// });
// },
//
// /**
// * 没有权限或更新不成功时数据还原
// *
// * @param field
// * @param me
// * @param isTime
// * 更新的是时间值
// */
// restore : function(field, me, isTime) {
// if (isTime) {
// if (field.timeLoc == 's')
// me.clickCraftTaskItem.setStartDate(me.startTime);
//
// if (field.timeLoc == 'e') {
// me.clickCraftTaskItem.setEndDate(me.endTime);
// me.clickCraftTaskItem.setDuration(me.durationTime);
// }
// } else {
//
// me.clickCraftTaskItem.setEndDate(me.endTiem);
// me.clickCraftTaskItem.setDuration(me.durationTime);
// }
//
// },
//
// /**
// * 时间调整时,那么当前工艺之后的工艺时间也要相应调整
// *
// * @param parentNode
// * @param index
// * @param interval
// */
// moveCraftPlan : function(parentNode, index, interval) {
// var record;
// for (var i = index + 1; i < parentNode.childNodes.length; i++) {
// record = parentNode.childNodes[i];
// if (record.getStartDate()) {
// record.setStartDate(new Date(record.getStartDate().getTime() + interval));
// }
//
// }
// }
});

Ext.define('Module.CraftPlanMenu', {
	extend : 'Ext.menu.Menu',

	initComponent : function() {
		var me = this;

		for ( var i in me.craftItem) {
			me.craftItem[i].handler = me.taskAppend;
		}

		Ext.applyIf(me, {
			items : [ {
				xtype : 'menuitem',
				disabled : me.record,
				text : '增加工艺',
				iconCls : 'application_form_add-16',
				menu : {
					xtype : 'menu',
					// direction : 'u',
					parent : me,
					items : me.craftItem
				}
			}, {
				xtype : 'menuitem',
				text : '插入工艺',
				disabled : !me.record,
				iconCls : 'application_get-16',
				menu : {
					xtype : 'menu',
					// direction : 'd',
					parent : me,
					items : me.craftItem
				}
			}, {
				xtype : 'menuseparator'
			}, {
				xtype : 'menuitem',
				disabled : !me.record,
				text : '删除工艺',
				iconCls : 'cancel-16',
				scope : me,
				handler : me.onDeletePlanTask
			} ]
		});

		me.callParent(arguments);
	},

	taskAppend : function(item) {

		var craftId = item.craftId.split('-')[2];

		var mainMenu = item.parentMenu.parent;
		mainMenu.submitCraftPlan(mainMenu.record, craftId);
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
		var delRow = me.grid.getSelectionModel().getSelection();
		var parent = Ext.getCmp('Module.ModulePartPlan');

		App.Progress('正在删除排程...', '排程删除');
		Ext.Ajax.request({
			url : 'module/schedule/removeCraftPlan',
			params : {
				sid : delRow[0].data.id
			},
			success : function(response) {
				App.ProgressHide();

				var res = JSON.parse(response.responseText);
				App.InterPath(res, function() {
					if (res.success) {

						if (!res.gantt.length) {
							parent.selectPartRecord.set('cls', 'craft-schedule-noexits');
						}

						for ( var x in res.gantt) {

							res.gantt[x].Name = res.gantt[x].name;
							res.gantt[x].PercentDone = res.gantt[x].percentDone;

							res.gantt[x].StartDate = res.gantt[x].startDate;
							res.gantt[x].EndDate = res.gantt[x].endDate;

							res.gantt[x].Duration = res.gantt[x].duration;
							res.gantt[x].DurationUnit = res.gantt[x].durationUnit;
						}

						me.grid.taskStore.loadData(res.gantt);

						showSuccess(res.msg);
					} else {
						showError(res.msg);
					}
				});
			},
			failure : function(response) {
				App.ProgressHide();
				App.Error('请检查网络连接');
			}
		});
	},

	/**
	 * 新增排程工艺
	 */
	addTaskAction : function(item) {
		var upMenu = item.up('menu');
		upMenu.parent.addTaskAboveAction(item.text, item.craftId.split('-')[2]);
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

		App.Progress('正在安排中...', '排程操作');
		Ext.Ajax.request({
			url : 'module/schedule/createCraftPlan',
			params : {
				craftid : craftId,
				sid : !plan ? plan : plan.data.id,
				partbarlistcode : parent.consult.partbarcode
			},
			success : function(response) {
				App.ProgressHide();

				var res = JSON.parse(response.responseText);

				App.InterPath(res, function() {
					if (res.success) {
						if (res.gantt.length) {

							for ( var x in res.gantt) {
								res.gantt[x].Name = res.gantt[x].name;
								res.gantt[x].PercentDone = res.gantt[x].percentDone;

								res.gantt[x].StartDate = res.gantt[x].startDate;
								res.gantt[x].EndDate = res.gantt[x].endDate;

								res.gantt[x].Duration = res.gantt[x].duration;
								res.gantt[x].DurationUnit = res.gantt[x].durationUnit;
							}

							parent.gantt.taskStore.loadData(res.gantt);
						}

						showSuccess(res.msg);

						// 标记工件已安排排程
						parent.selectPartRecord.set('cls', 'craft-schedule-exits');
					} else {
						showError(res.msg);
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
