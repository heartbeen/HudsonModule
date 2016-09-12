Ext.define("Module.GanttToolbar", {
	extend : "Ext.Toolbar",

	gantt : null,

	initComponent : function() {
		var gantt = this.gantt;

		var spinner = Ext.create('Ext.form.field.Spinner', {
			width : 50
		});

		gantt.taskStore.on({
			'filter-set' : function() {
				this.down('[iconCls=icon-collapseall]').disable();
				this.down('[iconCls=icon-expandall]').disable();
			},
			'filter-clear' : function() {
				this.down('[iconCls=icon-collapseall]').enable();
				this.down('[iconCls=icon-expandall]').enable();
			},
			scope : this
		});

		gantt.plugins = new Gnt.plugin.Printable({
			printRenderer : function(task, tplData) {
				if (task.isMilestone()) {
					return;
				} else if (task.isLeaf()) {
					var availableWidth = tplData.width - 4, progressWidth = Math.floor(availableWidth * task.get('PercentDone') / 100);

					return {
						// Style borders to act as background/progressbar
						progressBarStyle : Ext.String.format('width:{2}px;border-left:{0}px solid #7971E2;border-right:{1}px solid #E5ECF5;',
								progressWidth, availableWidth - progressWidth, availableWidth)
					};
				} else {
					var availableWidth = tplData.width - 2, progressWidth = Math.floor(availableWidth * task.get('PercentDone') / 100);

					return {
						// Style borders to act as background/progressbar
						progressBarStyle : Ext.String.format('width:{2}px;border-left:{0}px solid #FFF3A5;border-right:{1}px solid #FFBC00;',
								progressWidth, availableWidth - progressWidth, availableWidth)
					};
				}
			},

			beforePrint : function(sched) {
				var v = sched.getSchedulingView();
				this.oldRenderer = v.eventRenderer;
				this.oldMilestoneTemplate = v.milestoneTemplate;
				v.milestoneTemplate = new Gnt.template.Milestone({
					prefix : 'foo',
					printable : true,
					imgSrc : 'images/milestone.png'
				});
				v.eventRenderer = this.printRenderer;
			},

			afterPrint : function(sched) {
				var v = sched.getSchedulingView();
				v.eventRenderer = this.oldRenderer;
				v.milestoneTemplate = this.oldMilestoneTemplate;
			}
		});

		Ext.apply(this, {
			items : [ {
				iconCls : 'action',
				text : '高亮显示工时大于',
				handler : function(btn) {
					gantt.taskStore.queryBy(function(task) {
						var day = spinner.getValue();
						if (task.data.leaf && task.getDuration() > day) {
							var el = gantt.getSchedulingView().getElementFromEventRecord(task);
							el && el.frame('lime');
						}
					}, this);
				}
			}, spinner, {
				text : '天的工艺',
				handler : function(btn) {
					gantt.taskStore.queryBy(function(task) {
						var day = spinner.getValue();
						if (task.data.leaf && task.getDuration() > day) {
							var el = gantt.getSchedulingView().getElementFromEventRecord(task);
							el && el.frame('lime');
						}
					}, this);
				}
			}, '-', {
				xtype : 'textfield',
				emptyText : '请输入要查询的工艺...',
				enableKeyEvents : true,
				listeners : {
					keyup : {
						fn : function(field, e) {
							var value = field.getValue();
							var regexp = new RegExp(Ext.String.escapeRegex(value), 'i');

							if (value) {
								gantt.taskStore.filterTreeBy(function(task) {
									return regexp.test(task.get('Name'));
								});
							} else {
								gantt.taskStore.clearTreeFilter();
							}
						},
						buffer : 300,
						scope : this
					},
					specialkey : {
						fn : function(field, e) {
							if (e.getKey() === e.ESC) {
								field.reset();

								gantt.taskStore.clearTreeFilter();
							}
						}
					}
				}
			}, '-', {
				text : '全屏显示',
				iconCls : 'icon-fullscreen',
				disabled : !this._fullScreenFn,
				handler : function() {
					this.showFullScreen();
				},
				scope : this
			}, {
				text : '填充显示',
				iconCls : 'zoomfit',
				handler : function() {
					gantt.zoomToFit();
				}
			}, '-', {
				text : '收起工艺',
				iconCls : 'icon-collapseall',
				handler : function() {
					gantt.collapseAll();
				}
			}, {
				text : '展开工艺',
				iconCls : 'icon-expandall',
				handler : function() {
					gantt.expandAll();
				}
			}, '-', {
				iconCls : 'icon-print',
				text : '打印',
				// scale : 'large',
				scope : this,
				handler : function() {
					// Make sure this fits horizontally on one page.
					// gantt.zoomToFit();
					gantt.print();
				}
			} ]
		});

		this.callParent(arguments);
	},

	applyPercentDone : function(value) {
		this.gantt.getSelectionModel().selected.each(function(task) {
			task.setPercentDone(value);
		});
	},

	showFullScreen : function() {
		this.gantt.el.down('.x-panel-body').dom[this._fullScreenFn]();
	},

	// Experimental, not X-browser
	_fullScreenFn : (function() {
		var docElm = document.documentElement;

		if (docElm.requestFullscreen) {
			return "requestFullscreen";
		} else if (docElm.mozRequestFullScreen) {
			return "mozRequestFullScreen";
		} else if (docElm.webkitRequestFullScreen) {
			return "webkitRequestFullScreen";
		}
	})()
});
