/**
 * 
 */
Ext.define('Module.ModulePartTimeEvaluation', {
	extend : 'Ext.panel.Panel',

	resumeState : {
		state20401 : {
			stateName : '新模',
			className : 'module-new'
		},
		state20402 : {
			stateName : '修模',
			className : 'module-modify'
		},
		state20402 : {
			stateName : '设变',
			className : 'module-desgin'
		}
	},

	initComponent : function() {
		var me = this;

		Ext.applyIf(me, {

			html : '<div id="part-timeline-evaluation" style="margin:3px;width:100%;height:300%;">'
					+ '</div><div id="evaluation-qtip-growl-container"></div>',
			autoScroll : true,
			dockedItems : [ {
				xtype : 'toolbar',
				items : [ {
					text : '查询条件',
					componentCls : 'module-evaluation-panel-query',
					iconCls : 'edit-find-16'
				} ]
			} ],

			listeners : {
				render : function(panel, eo) {

					// 时间轴
					var now = new Date();
					me.timeline = new vis.Timeline(document.getElementById('part-timeline-evaluation'));

					me.timeline.setOptions({
						width : '100%',
						height : '100%',
						selectable : true,
						start : Ext.Date.getFirstDateOfMonth(now),
						end : Ext.Date.getLastDateOfMonth(now),
						showCurrentTime : true,
						showCustomTime : false,
						orientation : 'top'
					});

					me.timeline.setCustomTime(now);
					// me.onFindDeptPartTimeline();

					me.createQueryWindow(me);
				}
			}

		});

		me.callParent(arguments);
	},

	/**
	 * 生成弹出提示框
	 */
	createQueryWindow : function(me) {
		// 弹出式查询
		$('.module-evaluation-panel-query').qtip({
			content : {
				text : '<div id="module-evaluation-modulePanel"></div>',
				title : {
					text : '模具工号',
					button : true
				}
			},
			position : {
				my : 'top left',
				at : 'bottom center'
			},
			hide : {
				delay : 90,
				fixed : true,
				event : 'click',

				effect : function(offset) {
					$(this).slideDown(100);
				}
			},
			show : {
				event : 'click',
				effect : function(offset) {
					$(this).slideDown(100);

					if ($('#module-evaluation-modulePanel').html() == '') {
						Ext.create('EvaluationModulePanel', {
							parent : me
						});
					}
				}
			},
			style : {
				width : 440,
				height : 380,
				classes : 'qtip-tipped qtip-shadow'
			}
		});
	},

	/**
	 * 查询当前加工单位的工件加工时间轴数据
	 */
	onFindDeptPartTimeline : function(moduleResumeId, craftId) {
		var me = this;
		App.Progress('工件信息读取中,请稍候...', '工件');

		Ext.Ajax.request({
			url : 'module/part/deptPartSchedule',
			params : {
				moduleResumeId : moduleResumeId,
				craftId : craftId
			},
			async : false,
			success : function(response) {
				var res = JSON.parse(response.responseText);

				App.InterPath(res, function() {
					if (res.success) {

						me.processPartInfo(me, res.parts);

						me.timeline.setItems(res.parts);

						me.timelineTimeout();
					}

				});

				App.ProgressHide();
			},
			failure : function(response, opts) {
				App.Error(response);
				App.ProgressHide();
			}
		});

	},

	/**
	 * 延时生成提示工具
	 */
	timelineTimeout : function() {
		var me = this;
		var timeLine = $('#part-timeline-evaluation');
		var timeLinePosition = timeLine.offset();// 时间轴面板的位置

		var timeLinetop = timeLinePosition.top;
		var timeLineLeft = timeLinePosition.left;
		var timeLineWidth = timeLine.width();
		var timeLineHeight = timeLine.height();
		var bodyHeight = $('body').height();

		setTimeout(function() {

			// 弹出显示排程
			$('.module-part-time-evaluation-panel').each(
					function() {
						var partPanel = $(this);

						var data = '<div class="module-part-time-evaluation-setting-panel" style="display:block;width:300px;height:360px;">'
								+ '</div><div class="evaluation-data">';
						data = data + partPanel.find('.evaluation-data').text() + "</div>";

						var tmp = Ext.JSON.decode(partPanel.find('.evaluation-data').text());

						var toolQtip = partPanel.qtip({
							content : {
								text : data,
								title : "<span class='module-part-name'>" + tmp.modulecode + " " + tmp.partcode + "</span>"
							},
							position : {
								// my : newPosition.my,
								// at : newPosition.at,
								target : partPanel
							},
							hide : {
								delay : 90,
								fixed : true,
								event : 'click mouseleave',

								effect : function(offset) {
									$(this).slideDown(100);
								}
							},

							show : {
								event : 'click',
								effect : function(offset) {
									var qtipTool = $(this);

									var data = Ext.JSON.decode(qtipTool.find('.evaluation-data').text());
									var panel = qtipTool.find('.module-part-time-evaluation-setting-panel');

									if (panel[0].innerHTML == '') {

										data.start = Ext.Date.parse(data.start.replace('T', ' '), 'Y-m-d H:i:s');
										data.endtime = Ext.Date.parse(data.endtime.replace('T', ' '), 'Y-m-d H:i:s');

										var extPanel = Ext.create('EvaluationSettingPanel', {
											maxEvaluate : (data.endtime - data.start) / 3600000
										});

										extPanel.setValues(data);
										extPanel.partPanel = partPanel;// 将工件面板加到预估工时面板中
										extPanel.qtipTool = qtipTool;

										extPanel.render(panel[0]);

									}

									qtipTool.slideDown(100);
								}
							},
							style : {
								classes : 'qtip-tipped qtip-shadow'
							}
						});

						// 鼠标进行工件面板时，根据面板的实际位置来计算提示框所要显示的位置
						partPanel.on('mouseenter', function() {
							var api = toolQtip.qtip('api');
							var newPosition = me.processQtipToolPosition(api.get('position.target'), timeLinetop, timeLineLeft, timeLineWidth,
									bodyHeight);

							api.set('position.my', newPosition.my);
							api.set('position.at', newPosition.at);
						});

					});
		}, 1000);
	},

	/**
	 * 根据工件的实际所在位置计算提示框所要显示的位置
	 */
	processQtipToolPosition : function(target, parentTop, parentLeft, parentWidth, parentHeight) {

		var position = {
			my : 'bottom right',
			at : 'center center'
		};
		var targetTop = target.offset().top + target.height() / 2;
		var targetLeft = target.offset().left + target.width() / 2;

		var xf = parentLeft + parentWidth / 4;
		var xs = parentLeft + (parentWidth / 4) * 3;

		var yf = parentHeight / 4;
		var ys = (parentHeight / 4) * 3;

		if (targetTop <= yf && targetTop < ys) {
			position.my = ' top';// 工件面板中心点处在屏幕高度小于1/4处
		} else if (targetTop > yf && targetTop < ys) {
			position.my = ' center';// 工件面板中心点处在屏幕高度1/4与3/4之间
		} else {
			position.my = ' bottom';// 工件面板中心点处在屏幕高度大于3/4处
		}

		if (targetLeft <= xf && targetLeft < xs) {
			position.my = 'left ' + position.my;// 工件面板中心点处在屏幕宽度小于1/4处
			position.at = 'right center';
		} else if (targetLeft > xf && targetLeft < xs) {
			position.my = 'left ' + position.my;// 工件面板中心点处在屏幕宽度1/4与3/4之间
		} else {
			position.my = 'right ' + position.my;// 工件面板中心点处在屏幕宽度大于3/4处
			position.at = 'left center';
		}
		return position;
	},

	/**
	 * 处理时间轴数据
	 */
	processPartInfo : function(me, parts) {

		for (var i = 0; i < parts.length; i++) {
			if (parts[i].start) {
				var content = "";
				content = content.concat('<div class="module-part-time-evaluation-panel"><div>');

				content = content.concat('<span>');
				content = content.concat(parts[i].partcode);
				content = content.concat('</span></div><div class="craft-evaluation"><span>');
				content = content.concat(parts[i].craftname);
				content = content.concat('</span><span class="evaluation ');
				content = content.concat(parts[i].evaluate ? 'evaluation-exits' : 'evaluation-not-exits');
				content = content.concat('">').concat(parts[i].evaluate == null ? "0" : parts[i].evaluate);
				content = content.concat('</span></div><div class="evaluation-data">');
				content = content.concat(Ext.JSON.encode(parts[i]));
				content = content.concat('</div></div>	');

				parts[i].content = content;
			}

		}
	}

});

Ext.define('EvaluationModulePanel', {
	extend : 'Ext.tree.Panel',

	height : 340,
	width : 260,
	title : '',
	craftIds : [],

	initComponent : function() {
		var me = this;

		Ext.applyIf(me, {
			viewConfig : {

			},
			dockedItems : [ {
				xtype : 'toolbar',
				items : [ {
					text : '刷新',
					handler : function() {
						me.getStore().load();
					}
				}, '-', {
					text : '工艺',
					iconCls : 'document-export-16',
					menu : Ext.create("Ext.menu.Menu"),
					parent : me,
					listeners : {
						focus : me.onReadCraft
					}
				} ]
			} ],

			store : Ext.create('Ext.data.TreeStore', {
				autoLoad : true,
				fields : [ "endtime", "starttime", "modulebarcode", "text", "id", "leaf" ],

				proxy : {
					type : 'ajax',
					url : 'public/module?isResume=true',
					reader : {
						type : 'json'
					}
				}
			}),
			rootVisible : false,
			renderTo : 'module-evaluation-modulePanel',
			listeners : {
				itemclick : me.onClickModule
			}
		// columns : [ {
		// xtype : 'treecolumn',
		// width : 140,
		// dataIndex : 'text',
		// text : '工号'
		// }, {
		// xtype : 'datecolumn',
		// width : 80,
		// dataIndex : 'starttime',
		// text : '开始时间',
		// format : 'Y-m-d'
		// }, {
		// xtype : 'datecolumn',
		// width : 80,
		// dataIndex : 'endtime',
		// text : '完成时间',
		// format : 'Y-m-d'
		// } ]
		});

		me.callParent(arguments);
	},
	/**
	 * 得到用户所在部门所有的工艺
	 */
	onReadCraft : function() {
		var me = this.parent;
		var menu = this.menu;

		if (menu.items.length > 0) {
			return;
		}

		Ext.Ajax.request({
			url : 'public/deptModuleCraft',
			async : false,
			success : function(response) {
				var res = JSON.parse(response.responseText);

				if (res.success) {

					for ( var i in res.craft) {
						menu.add({
							text : res.craft[i].craftname,
							craftId : res.craft[i].craftid,
							index : i,
							checked : true,
							parent : me,
							handler : me.onClickModuleCraft
						});

						me.craftIds[i] = res.craft[i].craftid;
					}
				}
			},
			failure : function(response, opts) {
				App.Error(response);
			}
		});
	},

	/**
	 * 选择工艺
	 */
	onClickModuleCraft : function() {
		var me = this.parent;

		if (this.checked) {
			me.craftIds[this.index] = this.craftId;
		} else {
			delete me.craftIds[this.index];
		}

		if (me.moduleResumeId) {
			me.parent.onFindDeptPartTimeline(me.moduleResumeId, me.craftIds.join());
		} else {
			Fly.msg('提示', '没有选择模具!');
		}
	},

	/**
	 * 单击模具工号进行查询数据
	 */
	onClickModule : function(tree, record, item, index, e, eOpts) {
		var me = tree.up('treepanel');

		if (me.craftIds.join().length == 0 || !record) {
			Fly.msg('提示', '没有选择工艺!');
			return;
		}

		me.moduleResumeId = record.data.id;
		me.parent.onFindDeptPartTimeline(record.data.id, me.craftIds.join());

	}

});

Ext.define('EvaluationSettingPanel', {
	extend : 'Ext.panel.Panel',

	height : 350,
	width : 255,
	layout : {
		type : 'border'
	},
	bodyPadding : 5,

	initComponent : function() {
		var me = this;

		// me.partLabel = Ext.create('Ext.form.Label');
		me.partEvaluationText = Ext.create('Ext.form.field.Number', {
			name : 'evaluation',
			fieldLabel : '需要工时(小时)',
			minValue : 1,
			maxValue : me.maxEvaluate
		});

		me.form = Ext.create('Ext.form.Panel', {
			region : 'north',
			border : false,
			height : 150,
			bodyBorder : false,
			bodyPadding : 10,
			title : '',
			defaults : {
				labelWidth : 80,
				anchor : '100%',
				format : 'Y-m-d H:i:s'
			},
			items : [// me.partLabel,
			{
				xtype : 'datefield',
				style : 'margin-top:15px;',
				fieldLabel : '预计开工时间',
				name : 'start',
				readOnly : true
			}, {
				xtype : 'datefield',
				fieldLabel : '预计完工时间',
				name : 'endtime',
				readOnly : true
			}, me.partEvaluationText, {

				xtype : 'button',
				width : 60,
				text : '保存',
				scope : me,
				handler : me.savePartEvaluation
			} ]

		});

		Ext.applyIf(me, {
			items : [ me.form, {
				xtype : 'gridpanel',
				region : 'center',
				title : '关联工件',
				columns : [ {
					xtype : 'gridcolumn',
					dataIndex : 'string',
					text : 'String'
				}, {
					xtype : 'numbercolumn',
					dataIndex : 'number',
					text : 'Number'
				}, {
					xtype : 'datecolumn',
					dataIndex : 'date',
					text : 'Date'
				}, {
					xtype : 'booleancolumn',
					dataIndex : 'bool',
					text : 'Boolean'
				} ]
			} ]
		});

		me.callParent(arguments);
	},

	setValues : function(values) {
		var me = this;
		me.form.getForm().setValues(values);
		me.part = values;
		// var text = "<span style='color:red;font-weight:
		// bold;font-size:14px;'>" + values.modulecode + " " + values.partcode +
		// "</span>";
		// me.partLabel.html = text;
		me.partEvaluationText.setValue(values.evaluate);
	},

	/**
	 * 保存预估工时
	 */
	savePartEvaluation : function() {
		var me = this;

		var time = me.partEvaluationText.getValue();

		if (time) {
			// 假如获取的模具工件为空,则提示
			Ext.Ajax.request({
				url : 'module/schedule/deptEvaluateTime',
				params : {
					"mes.id" : me.part.id,
					"mes.evaluate" : time
				},
				success : function(response) {
					var res = JSON.parse(response.responseText);

					App.InterPath(res, function() {
						if (res.success) {
							// 更新前台数据
							var exits = me.partPanel.find('.evaluation');
							var partPanelData = me.partPanel.find('.evaluation-data');
							var qtipToolData = me.qtipTool.find('.evaluation-data');
							if (exits) {
								exits.removeClass('evaluation-not-exits');
								exits.addClass('evaluation-exits');
							}
							exits.text(time);// 更新时间

							me.part.evaluate = time;

							if (partPanelData) {
								partPanelData.text(Ext.JSON.encode(me.part));
							}

							if (qtipToolData) {
								qtipToolData.text(Ext.JSON.encode(me.part));
							}

						}

						me.saveQtipGrowl(res.success, res.msg);
					});
				},
				failure : function() {
					me.saveQtipGrowl(false, "服务连接失败!");
				}
			});
		}

	},

	/**
	 * 弹出预估结果信息框
	 */
	saveQtipGrowl : function(success, msg, position) {

		$('<div/>').qtip({
			content : {
				text : msg,
				title : {
					text : '信息',
					button : true
				}
			},
			position : {
				target : [ 10, 10 ],
				container : $('#evaluation-qtip-growl-container')
			},
			show : {
				event : false,
				ready : true,
				effect : function() {
					$(this).stop(0, 1).animate({
						height : 'toggle'
					}, 400, 'swing');
				},
				delay : 0
			// persistent : persistent
			},
			hide : {
				event : false,
				effect : function(api) {
					$(this).stop(0, 1).animate({
						height : 'toggle'
					}, 400, 'swing');
				}
			},
			style : {
				width : 250,
				classes : success ? 'jgrowl' : 'qtip-red',
				tip : false
			},
			events : {
				render : function(event, api) {
					if (!api.options.show.persistent) {
						$(this).bind('mouseover mouseout', function(e) {
							var lifespan = 5000;

							clearTimeout(api.timer);
							if (e.type !== 'mouseover') {
								api.timer = setTimeout(function() {
									api.hide(e);
								}, lifespan);
							}
						}).triggerHandler('mouseout');
					}
				}
			}
		});
	}

});