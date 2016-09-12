/**
 * 
 */
Ext.define('Module.ModulePartChart', {
	extend : 'Ext.tab.Panel',
	title : '图表分析',

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
			items : [ {
				xtype : 'panel',
				title : '工件时间线分布',

				html : '<div id="part-timeline-visualization" style="margin:3px;width:100%;height:200%;"></div>',
				autoScroll : true,
				dockedItems : [ {
					xtype : 'toolbar',
					items : [ {
						text : '查询条件',
						componentCls : 'module-part-panel-query',
						iconCls : 'edit-find-16'
					} ]
				} ],

				listeners : {
					render : function(panel, eo) {

						// 时间轴
						var now = new Date();
						me.timeline = new vis.Timeline(document.getElementById('part-timeline-visualization'));

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
						me.onFindDeptPartTimeline();

						// me.timeline.on('select', function(properties) {
						// console.log(properties.items)
						//						});

						me.createQueryWindow(me);
					}
				}

			} ]
		});

		me.callParent(arguments);
	},

	/**
	 * 生成弹出提示框
	 */
	createQueryWindow : function(me) {
		// 弹出式查询
		$('.module-part-panel-query').qtip({
			content : {
				text : '<div id="module-part-chart-module-panel" style="display:block;width:300px;height:400px;"></div>'
			// title : '查询条件'
			},
			position : {
				my : 'top left', // Position my top
				// left...
				at : 'bottom center' // at the bottom
			// right of...
			},
			hide : {
				delay : 90,
				fixed : true,
				event : 'click mouseleave',

				effect : function(offset) {
					$(this).slideDown(100); // "this" refers to
					// the tooltip
				}
			},
			show : {
				event : 'click',
				effect : function(offset) {
					$(this).slideDown(100);

					if ($('#module-part-chart-module-panel').html() == '') {
						Ext.create('PartQueryQtipPanel', {
							renderTo : 'module-part-chart-module-panel',
							parent : me
						});
					}
				}
			},
			style : {
				classes : 'qtip-blue qtip-shadow qtip-rounded'
			}
		});
	},

	/**
	 * 查询当前加工单位的工件加工时间轴数据
	 */
	onFindDeptPartTimeline : function(moduleResumeId, moduleState) {
		var me = this;
		App.Progress('工件信息读取中,请稍候...', '工件');

		Ext.Ajax.request({
			url : 'module/part/deptPartTimeline',
			params : {
				moduleResumeId : moduleResumeId,
				moduleState : moduleState
			},
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
		setTimeout(function() {
			// 弹出显示排程
			$('.module-part-panel').each(function() {
				$(this).qtip({
					content : {
						text : $(this).find('.plan-content'),
						title : '预计排程'
					},
					position : {
						my : 'top center', // Position my top
						// left...
						at : 'bottom center' // at the bottom
					// right of...
					},
					hide : {
						event : 'click mouseleave'
					},

					show : {
						target : $(this)
					},
					style : {
						classes : 'qtip-tipped qtip-shadow'
					}
				});
			});
		}, 1500);
	},

	/**
	 * 处理时间轴数据
	 */
	processPartInfo : function(me, parts) {
		var nowDate = new Date();
		var workDate;

		for (var i = 0; i < parts.length; i++) {
			var content = "";
			// <span>平面研磨(SG)</span><span class="module-resume
			// module-desgin">设变</span>
			content = content.concat('<div class="module-part-panel state-').concat(parts[i].partstateid);
			content = content.concat('"><div>').concat(parts[i].modulecode).concat('&lt;');
			content = content.concat(parts[i].partlistcode).concat('&gt</div><div><span class="module-craft">');
			content = content.concat(parts[i].craftname).concat('</span><span class="module-resume ');
			content = content.concat(me.resumeState['state' + parts[i].resumestate].className);// 区分模具状态
			content = content.concat('">');
			content = content.concat(me.resumeState['state' + parts[i].resumestate].stateName);// 显示模具状态
			content = content.concat('</span>');
			content = content.concat('</div><div class="plan-content"><div>');
			content = content.concat('<span>开工时间:</span><span class="');

			if (parts[i].start) {
				workDate = Ext.Date.parse(parts[i].start.substring(0, 19), "Y-m-d H:i:s");
				content = content.concat(nowDate.getTime() > workDate.getTime() ? 'delayed' : 'exactly');
				// delayed
				content = content.concat('">');
				content = content.concat(Ext.Date.format(workDate, "Y-m-d H:i"));
			} else {
				content = content.concat('">');
			}

			content = content.concat('</span></div><div><span>完工时间:</span><span class="');

			if (parts[i].endtime) {
				workDate = Ext.Date.parse(parts[i].endtime.substring(0, 19), "Y-m-d H:i:s");
				content = content.concat(nowDate.getTime() > workDate.getTime() ? 'delayed' : 'exactly');
				// exactly
				content = content.concat('">');
				content = content.concat(Ext.Date.format(workDate, "Y-m-d H:i"));
			} else {
				content = content.concat('">');
			}

			content = content.concat(' </span></div><div><span>加工时长:</span><span>');
			content = content.concat(parts[i].duration < 0 ? '<span style="color:red;">没有该工艺排程</span>' : parts[i].duration + '(时)');
			content = content.concat('</span></div><div>');
			content = content.concat('<span>工件状态:</span><span>');
			content = content.concat(parts[i].name);
			content = content.concat('</span></div>');

			content = content.concat(' </div>');

			parts[i].content = content;
		}
	}

});

Ext.define('PartQueryQtipPanel', {
	extend : 'Ext.panel.Panel',

	height : 390,
	width : 260,
	layout : {
		type : 'border'
	},
	title : '条件选择',

	moduleInfoFields : [ "endtime", "resumestate", "curestate", "plastic", "starttime", "remark", "guestname", "modulecode", "unitextrac", "guestid",
			"moduleresumeid", "executive", "moduleintro", "modulestate", "workpressure", "takeon", "moduleclass", "modulebarcode", "pictureurl",
			"resumeempid", "productname" ],

	bodyPadding : 3,
	initComponent : function() {
		var me = this;

		Ext.applyIf(me, {
			items : [ {
				xtype : 'fieldset',
				margins : '5 0 0 0',
				region : 'south',
				maxHeight : 100,
				title : '模具状态',
				items : [ {
					xtype : 'radiogroup',
					id : 'module-state-radiogroup',
					layout : {
						align : 'stretch',
						type : 'hbox'
					},
					fieldLabel : 'Label',
					hideLabel : true,
					items : [ {
						xtype : 'checkboxfield',
						inputValue : 20401,
						style : 'margin-right:10px;',
						checked : true,
						boxLabel : '新模'
					}, {
						xtype : 'checkboxfield',
						inputValue : 20402,
						style : 'margin-right:10px;',
						checked : true,
						boxLabel : '修模'
					}, {
						xtype : 'checkboxfield',
						inputValue : 20403,
						checked : true,
						boxLabel : '设变'
					} ]
				} ]
			}, {

				xtype : 'gridpanel',
				id : 'module-part-chart-gird',
				region : 'center',
				title : '模具工号',
				store : Ext.create('Ext.data.Store', {
					fields : me.moduleInfoFields,
					autoLoad : true,
					proxy : {
						url : 'module/process/groupModuleInfo',
						// 自动导入工号
						type : 'ajax',
						reader : {
							type : 'json',
							root : 'info'
						}
					}
				}),
				selModel : Ext.create('Ext.selection.CheckboxModel', {
					mode : 'SIMPLE'
				}),
				dockedItems : [ {
					xtype : 'toolbar',
					dock : 'top',
					items : [ {
						text : '刷新',
						iconCls : 'view-refresh-16',
						handler : function() {
							this.up('gridpanel').getStore().load();
						}
					}, '-', {
						text : '确认查询',
						iconCls : 'editpaste-16',
						scope : me,
						handler : me.onClickSelectModule
					}, '-', {
						text : '所有模具',
						iconCls : 'editpaste-16',
						scope : me,
						handler : me.onClickAllModule
					} ]
				} ],
				columns : [ {
					xtype : 'gridcolumn',
					width : 150,
					dataIndex : 'modulecode',
					text : '模具工号'
				} ],

				listeners : {
				// itemclick : me.onModuleItemClick
				}
			} ]
		});

		me.callParent(arguments);
	},

	/**
	 * 查找指定模具的工件信息
	 */
	onClickSelectModule : function() {

		// 选择多套模具
		var moduleResumeId = "";

		var models = App.getSelectionModel('module-part-chart-gird');
		for (var i = 0; i < models.length; i++) {
			moduleResumeId = moduleResumeId.concat(models[i].data.moduleresumeid).concat(';');
		}
		var me = this;

		me.parent.onFindDeptPartTimeline(moduleResumeId, me.getSelectState());
	},

	/**
	 * 查询所有模具工件信息
	 */
	onClickAllModule : function() {
		var me = this;
		me.parent.onFindDeptPartTimeline('', me.getSelectState());
	},

	/**
	 * 得到要查询的模具状态
	 */
	getSelectState : function() {
		var group = Ext.getCmp('module-state-radiogroup');
		var moduleState = "";

		for (var i = 0; i < 3; i++) {
			var box = group.getComponent(i);
			if (box.getValue()) {
				moduleState = moduleState.concat(box.inputValue).concat(';');
			}
		}
		return moduleState;
	}

// onModuleItemClick : function(grid, record, item, index, e, eOpts) {
//
// if (!record) {
// return;
// }
//
// var me = grid.up('panel').up('panel');
//
// var group = Ext.getCmp('module-state-radiogroup');
// var moduleState = "";
//
// for (var i = 0; i < 3; i++) {
// var box = group.getComponent(i);
// if (box.getValue()) {
// moduleState = moduleState.concat(box.inputValue).concat(';');
// }
// }
//
// me.parent.onFindDeptPartTimeline(record.data.modulecode, moduleState);
//
// }

});
