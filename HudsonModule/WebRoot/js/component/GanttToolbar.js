Ext.define("Project.component.GanttToolbar", {
	extend : "Ext.Toolbar",
	cls : 'my-toolbar',

	gantt : null,

	initComponent : function() {
		var gantt = this.gantt;

		gantt.taskStore.on({
			'filter-set' : function() {
				this.down('[iconCls*=icon-collapseall]').disable();
				this.down('[iconCls*=icon-expandall]').disable();
			},
			'filter-clear' : function() {
				this.down('[iconCls*=icon-collapseall]').enable();
				this.down('[iconCls*=icon-expandall]').enable();
			},
			scope : this
		});

		Ext.apply(this, {
			defaults : {
				scale : 'medium'
			},

			items : [ {
				xtype : 'textfield',
				fieldLabel : '参考零件',
				width : 220,
				labelWidth : 65,
				readOnly : true
			}, {
				tooltip : '刷排程',
				iconCls : 'paint_brush-32',
				handler : function() {
					var parent = Ext.getCmp('Module.ModulePartPlan');

					parent.consult.setbarcode = parent.consult.partbarcode;
					parent.consult.setresumeid = parent.consult.resumeid;

					if (!parent.consult.partbarcode) {
						showInfo('没有选择任何零件信息');
						return;
					}

					var paratext = parent.consult.modulecode + ' - ' + parent.consult.partcode;

					this.up().down('textfield').setValue(paratext);
				}
			}, '-', {
				tooltip : '全部删除',
				iconCls : 'gtk-delete-16',
				handler : function() {
					var parent = Ext.getCmp('Module.ModulePartPlan');

					App.Progress('正在删除排程...', '排程删除');

					Ext.Msg.confirm('提醒', '是否确认删除零件计划排程', function(y) {
						if (y == 'yes') {
							Ext.Ajax.request({
								url : 'module/schedule/removeCraftPlan',
								params : {
									partbarlistcode : parent.consult.partbarcode
								},
								success : function(response) {
									App.ProgressHide();

									var res = JSON.parse(response.responseText);
									App.InterPath(res, function() {
										if (res.success) {
											// 将零件信息设置为没有排程状态
											parent.selectPartRecord.set('cls', 'craft-schedule-noexits');
											// 将排程清空
											parent.gantt.taskStore.loadData([]);

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
						}
					});
				}

			}, '->', {
				tooltip : '向前一周',
				iconCls : 'icon icon-left',
				handler : function() {
					gantt.shiftPrevious();
				}
			}, {
				tooltip : '向后一周',
				iconCls : 'icon icon-right',
				handler : function() {
					gantt.shiftNext();
				}
			}, '-', {
				tooltip : '收起所有任务',
				iconCls : 'icon icon-collapseall',
				handler : function() {
					gantt.collapseAll();
				}
			},

			{
				tooltip : '展开所有任务',
				iconCls : 'icon icon-expandall',
				handler : function() {
					gantt.expandAll();
				}
			}, '-', {
				tooltip : '缩小',
				iconCls : 'icon icon-zoomout',
				handler : function() {
					gantt.zoomOut();
				}
			}, {
				tooltip : '放大',
				iconCls : 'icon icon-zoomin',
				handler : function() {
					gantt.zoomIn();
				}
			}, '-', {
				tooltip : '定位显示',
				iconCls : 'icon icon-zoomfit',
				handler : function() {
					gantt.zoomToFit();
				}
			},
			// {
			// tooltip : '全屏显示',
			// iconCls : 'icon icon-fullscreen',
			// disabled : !this._fullScreenFn,
			// handler : function() {
			// this.showFullScreen();
			// },
			// scope : this
			// },
			'-', {
				tooltip : '高亮显示',
				iconCls : 'icon icon-criticalpath',
				enableToggle : true,
				handler : function(btn) {
					var v = gantt.getSchedulingView();
					if (btn.pressed) {
						v.highlightCriticalPaths(true);
					} else {
						v.unhighlightCriticalPaths(true);
					}
				}
			}, '-', {
				text : '更多...',
				menu : {
					items : [ {
						text : '高亮显示大于1天的任务',
						handler : function(btn) {
							gantt.taskStore.queryBy(function(task) {
								if (task.data.leaf && task.getDuration() > 8) {
									var el = gantt.getSchedulingView().getElementFromEventRecord(task);
									el && el.frame('lime');
								}
							}, this);
						}
					},
					// {
					// text : 'Filter: Tasks with progress < 30%',
					// handler : function (btn) {
					// gantt.taskStore.filterTreeBy(function (task) {
					// return task.get('PercentDone') < 30;
					// });
					// }
					// },
					{
						text : '清除过滤',
						handler : function(btn) {
							gantt.taskStore.clearTreeFilter();
						}
					}, {
						text : '跳转到最后',
						handler : function(btn) {
							var latestEndDate = new Date(0), latest = null;
							gantt.taskStore.getRootNode().cascadeBy(function(task) {
								if (task.get('EndDate') >= latestEndDate) {
									latestEndDate = task.get('EndDate');
									latest = task;
								}
							});
							gantt.getSchedulingView().scrollEventIntoView(latest, true);
						}
					} ]
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
		this.gantt.el.down('.x-panel-body').dom[this._fullScreenFn](Element.ALLOW_KEYBOARD_INPUT);
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
		} else if (docElm.msRequestFullscreen) {
			return "msRequestFullscreen";
		}
	})()
});
