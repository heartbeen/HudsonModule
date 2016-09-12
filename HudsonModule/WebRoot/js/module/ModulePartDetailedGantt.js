/**
 * 
 */
Ext.define("Module.ModulePartDetailedGantt", {
	extend : "Gnt.panel.Gantt",
	requires : [ 'Gnt.column.StartDate', 'Gnt.column.EndDate', 'Gnt.column.Duration', 'Gnt.column.PercentDone', 'Gnt.column.ResourceAssignment',
			'Sch.plugin.TreeCellEditing', 'Sch.plugin.Pan', 'Project.component.GanttTaskFilterField' ],
	rightLabelField : 'Responsible',
	highlightWeekends : true,// 突出显示周未
	showTodayLine : true,// 显示今天时间线
	loadMask : true,
	enableProgressBarResize : false,// 进度可否拖动
	skipWeekendsDuringDragDrop : false,
	weekendsAreWorkdays : true,// 周未也为工件时间
	cascadeChanges : true,
	enableBaseline : true,
	baselineVisible : false,
	enableDependencyDragDrop : false,

	readOnly : true,// 是否为只读
	crafts : null,
	format : 'n/j',
	craftPlanMenu : null,
	style1 : '<div class="sch-gantt-progress-bar" style="width:{percentDone}%;',
	style2 : '{progressBarStyle}" unselectable="on"><span>{[Math.round(values.percentDone)]}%<span></span></div>',

	initComponent : function() {
		var me = this;

		me.exportPlugin = new Gnt.plugin.Export({
		// printServer :
		// 'http://dev.bryntum.com/examples/gantt/examples/export/server.php'
		});

		Ext.apply(me, {
			taskBodyTemplate : me.style1 + me.style2,

			lockedGridConfig : {
				width : 290,
				title : '工艺',
				collapsible : true
			},

			lockedViewConfig : {
				getRowClass : function(rec) {
					return rec.isRoot() ? 'root-row' : '';
				}
			},
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
			tooltipTpl : new Ext.XTemplate('<strong class="tipHeader">{Name}</strong>', '<table class="taskTip">',
					'<tr><td>开工时间:</td> <td align="right">{[values._record.getDisplayStartDate("Y年m月d日 H时")]}</td></tr>',
					'<tr><td>完工时间:</td> <td align="right">{[values._record.getDisplayEndDate("Y年m月d日 H时")]}</td></tr>', '</table>'),

			eventRenderer : function(task) {
				if (task.get('Color')) {
					var style = Ext.String.format('background-color: #{0};border-color:#{0}', task.get('Color'));

					return {
						style : style
					};
				}
			},
			columns : [ {
				xtype : 'namecolumn',
				header : '加工工艺',
				sortable : true,
				dataIndex : 'Name',
				width : 160,
				renderer : function(v, meta, r) {
					if (!r.data.leaf)
						meta.tdCls = 'sch-gantt-parent-cell';

					if (r.data.typeid == 1) {
						v = v + '(<span style="color:red;font-weight: bold;">临时</span>)';
					}

					return v;
				},

				items : new Project.component.GanttTaskFilterField({
					store : me.taskStore
				})
			}, {
				xtype : 'startdatecolumn',
				text : '开工<br>时间',
				format : me.format,
				width : 45
			// renderer : me.dateRender

			}, {
				// hidden : true,
				xtype : 'enddatecolumn',
				text : '完工<br>时间',
				format : me.format,
				width : 45
			// renderer : me.dateRender
			}, {
				xtype : 'durationcolumn',
				text : '加工<br>时长',
				width : 55,
				renderer : function(val) {
					return val + 'h';
				}
			} ],

			// Define the buttons that are
			// available for user
			// interaction
			tbar : Ext.create("Project.component.GanttToolbar", {
				gantt : me
			}),

			plugins : me.exportPlugin,

			dockedItems : [ {
				xtype : 'toolbar',
				dock : 'bottom',
				items : [ {
					text : '显示预计排程',
					style : 'margin-left:5px;',
					enableToggle : true,
					pressed : false,
					handler : function() {
						me.el.toggleCls('sch-ganttpanel-showbaseline');
					}
				}, '-', {
					xtype : 'numberfield',
					fieldLabel : '调整行高',

					labelWidth : 60,
					value : 24,
					minValue : 24,
					maxValue : 50,
					width : 120,
					parent : me,
					editable : false,
					listeners : {
						spindown : me.onSetupHeight,
						spinup : me.onSetupHeight
					}
				} ]
			} ]
		});
		me.callParent(arguments);
	},

	/**
	 * 
	 */
	dateRender : function(val) {
		var f = Ext.Data.format(val, 'n/j');
		return "<span style='color:blue;font-weight:bold;'>" + f + "</span>";

	},

	onSetupHeight : function(spin, eOpts) {
		var view = spin.parent.getSchedulingView();
		var height = spin.getValue();

		Ext.util.CSS.updateRule('.sch-ganttpanel .x-grid-cell', 'height', height + 'px');

		view.getDependencyView().setRowHeight(height, true);
		view.setRowHeight(height);
	}

});
