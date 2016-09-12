Ext.define("Module.ModuleProcessGantt", {
	extend : "Gnt.panel.Gantt",
	requires : [ 'Gnt.column.StartDate', 'Gnt.column.EndDate', 'Gnt.column.Duration', 'Gnt.column.PercentDone', 'Gnt.column.ResourceAssignment',
			'Sch.plugin.TreeCellEditing', 'Sch.plugin.Pan', 'Module.GanttToolbar' ],
	rightLabelField : 'Responsible',
	highlightWeekends : true,// 突出显示周未
	showTodayLine : true,// 显示今天时间线
	loadMask : true,
	enableProgressBarResize : false,// 进度可否拖动
	skipWeekendsDuringDragDrop : true,// 周未也为工件时间
	readOnly : true,// 是否为只读

	initComponent : function() {
		var me = this;

		Ext.apply(me, {
			title : '排工单',
			layout:'border',
			lockedGridConfig : {
				width : 400,
				title : '工艺',
				id : 'twt',
				collapsible : true
			},

			lockedViewConfig : {
				getRowClass : function(rec) {
					return rec.isRoot() ? 'root-row' : '';
				},

				// Enable node reordering in the locked grid
				plugins : {
					ptype : 'treeviewdragdrop',
					containerScroll : true
				}
			},

			// Experimental
			schedulerConfig : {
				collapsible : true,
				title : '进度'
			},

			leftLabelField : {
				dataIndex : 'Name',
				editor : {
					xtype : 'textfield'
				}
			},

			// Define an HTML template for the tooltip
			tooltipTpl : new Ext.XTemplate('<strong class="tipHeader">{Name}</strong>', '<table class="taskTip">',
					'<tr><td>开工时间:</td> <td align="right">{[values._record.getDisplayStartDate("y-m-d")]}</td></tr>',
					'<tr><td>完工时间:</td> <td align="right">{[values._record.getDisplayEndDate("y-m-d")]}</td></tr>', '</table>'),

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
				width : 150,
				renderer : function(v, meta, r) {
					if (!r.data.leaf)
						meta.tdCls = 'sch-gantt-parent-cell';

					return v;
				}
			}, {
				xtype : 'startdatecolumn',
				text : '开工时间',
				format : 'Y-m-d H:i',
				width : 130
			}, {
				// hidden : true,
				xtype : 'enddatecolumn',
				text : '完工时间',
				format : 'Y-m-d H:i',
				width : 130
			}, {
				xtype : 'durationcolumn',
				text : '加工<br>时长',
				width : 55,
				renderer : function(value) {
					return value.toString() + "天";
				}
			} ],

			// Define the buttons that are available for user
			// interaction
			tbar : new Module.GanttToolbar({
				gantt : me
			}),

			dockedItems : [ {
				xtype : 'toolbar',
				dock : 'bottom',
				items : [ {
					iconCls : 'icon-prev',
					text : '上一周',
					handler : function() {
						me.shiftPrevious();
					}
				}, {
					iconCls : 'icon-next',
					text : '下一周',
					handler : function() {
						me.shiftNext();
					}
				} ]
			} ],

			listeners : {
				taskcontextmenu : me.onClickTask,
				beforetaskdrag : me.onBeforeTaskDrag
			}
		});

		me.callParent(arguments);

	},

	onBeforeTaskDrag : function(gantt, taskRecord, e, eOpts) {
		console.log('asdf');
	},

	onClickTask : function(gantt, taskRecord, e, eOpts) {

	}
});
