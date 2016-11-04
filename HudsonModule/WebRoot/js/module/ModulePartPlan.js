/**
 * 
 */
Ext.define('Module.ShowEstimateLoad', {
	extend : 'Ext.window.Window',

	height : 750,
	width : 1000,
	title : '工件预计负荷',
	layout : 'border',
	modal : true,
	initKey : null,
	isInit : false,
	reloader : null,
	listeners : {
		destory : function(win) {
			if (win.reloader) {
				clearInterval(self.reloader);
			}
		}
	},
	bodyPadding : 3,
	tbar : [ {
		id : 'mpp-work-load-kind',
		xtype : 'numberfield',
		emptyText : '数字为空查询全部',
		minValue : 0,
		value : 0,
		fieldLabel : '查询计划天数',
		allowDecimals : false
	}, {
		text : '查询计划',
		iconCls : 'search-16',
		handler : function() {
			var days = Ext.getCmp('mpp-work-load-kind').getValue();
			var isall = false;
			if (days == null || isNaN(days)) {
				days = 0;
				isall = true;
			}

			this.up('window').getWorkLoadData('mpp-work-load-tab', {
				isall : isall,
				day : days
			}, false);
			;
		}
	}, '->', {
		xtype : 'checkbox',
		boxLabel : '10秒刷新',
		listeners : {
			change : function(chk, newValue) {
				var self = this.up('window');
				var dayInput = Ext.getCmp('mpp-work-load-kind');
				if (newValue) {
					self.reloader = setInterval(function(mine) {
						// 获取查询工艺类型
						var useDay = dayInput.getValue();
						dayInput.setReadOnly(true);

						var isall = false;
						if (useDay == null || isNaN(useDay)) {
							useDay = 0;
							isall = true;
						}

						var senddata = {
							day : useDay,
							isall : isall
						};
						mine.getWorkLoadData('mpp-work-load-tab', senddata, false);
					}, 10000, self);
				} else {
					if (self.reloader) {
						dayInput.setReadOnly(false);
						clearInterval(self.reloader);
						self.reloader = null;
					}
				}
			}
		}
	}, '-', {
		text : '设置负荷工艺',
		iconCls : 'cog-16',
		handler : function() {
			new ModuleScheduleCrafts().show();
		}
	} ],
	bbar : [],
	initComponent : function() {
		var me = this;

		Ext.applyIf(me, {
			items : [ {
				id : 'mpp-work-load-tab',
				xtype : 'tabpanel',
				height : 644,
				region : 'center'
			} ]
		});

		me.callParent(arguments);

		me.getWorkLoadData('mpp-work-load-tab', me.initKey, me.isInit);
	},
	/**
	 * 获取Combobox的当前Record
	 */
	findComboRecord : function(combo, field) {
		var val = combo.getValue();
		var store = combo.getStore();
		return store.findRecord(field, val);
	},
	/**
	 * 获取工件排程的详细讯息
	 */
	getWorkLoadData : function(tabid, params, init) {
		var self = this;
		var tbar = self.getDockedItems('toolbar[dock="bottom"]')[0];
		var tabPanel = Ext.getCmp(tabid);
		if (!init) {
			tabPanel.removeAll();
			tbar.removeAll();
		}
		Ext.Ajax.request({
			url : 'public/getResumeWorkLoad',
			method : 'POST',
			params : {
				astateid : '20201',
				fstateid : '["20209","20210"]',
				doall : '11216',
				classid : 1,
				day : params.day,
				isall : params.isall,
				dayhour : 24
			},
			success : function(resp) {
				var backJson = Ext.JSON.decode(resp.responseText);
				if (!backJson || !backJson.length) {
					return;
				}

				for ( var m in backJson) {
					tbar.add([ {
						text : '<b>' + backJson[m].craftname + MathRound(backJson[m].macload, 0, 0) + '小时</b>',
						iconCls : 'chart_curve-16'
					}, '-' ]);
					var tab = {
						title : backJson[m].craftname,
						layout : 'border',
						bodyPadding : 3,
						items : [ {
							xtype : 'gridpanel',
							region : 'center',
							viewConfig : {
								getRowClass : function(record, index, rowParams, store) {
									return (record.get('execute') ? 'row-active' : '');
								}
							},
							tbar : [ {
								iconCls : 'star-16',
								text : '<b>加工记录:' + backJson[m].list.length + '条</b>'
							}, '-', {
								text : '<b>预计负荷' + MathRound(backJson[m].evaluate, 1, 0) + '小时</b>',
								iconCls : 'chart_curve-16'
							} ],
							forceFit : true,
							store : Ext.create('Ext.data.Store', {
								fields : [ 'id', 'craftname', 'empname', 'enddate', 'evaluate', 'modulecode', 'partlistcode', 'regionname',
										'startdate', 'statename', 'batchno', 'usehour', 'proceed', 'execute' ],
								autoLoad : true,
								data : backJson[m].list

							}),
							columns : [ {
								text : '模具工号',
								dataIndex : 'modulecode',
								renderer : function(val) {
									return (val ? '<b>' + val + '</b>' : val);
								}
							}, {
								text : '零件编号',
								dataIndex : 'partlistcode',
								renderer : function(val) {
									return (val ? '<b>' + val + '</b>' : val);
								}
							}, {
								text : '零件状态',
								dataIndex : 'statename',
								renderer : function(val) {
									return (val ? '<b>' + val + '</b>' : val);
								}
							}, {
								text : '所在部门',
								dataIndex : 'regionname',
								renderer : function(val) {
									return (val ? '<b>' + val + '</b>' : val);
								}
							}, {
								text : '所在机台',
								dataIndex : 'batchno',
								renderer : function(val) {
									return (val ? '<b>' + val + '</b>' : val);
								}
							}, {
								text : '安排工艺',
								dataIndex : 'craftname',
								renderer : function(val) {
									return (val ? '<b>' + val + '</b>' : val);
								}
							}, {
								text : '开始时间',
								dataIndex : 'startdate',
								renderer : function(val) {
									return (val ? '<b>' + val.substring(0, 13) + '</b>' : val);
								}
							}, {
								text : '结束时间',
								dataIndex : 'enddate',
								renderer : function(val) {
									return (val ? '<b>' + val.substring(0, 13) + '</b>' : val);
								}
							}, {
								text : '预计时长',
								dataIndex : 'evaluate',
								width : 70,
								renderer : function(val) {
									return (val ? '<b>' + val + '</b>' : val);
								}
							} ]
						} ]
					};

					tabPanel.add(tab);
				}

				tabPanel.setActiveTab(0);
			},
			failure : function(x, y, z) {
				showError('连接网络失败,请检查网络连接!');
			}
		});
	},
	getWorkLoadPercent : function(est, mac) {
		if (!mac) {
			return 0;
		} else {
			var per = parseFloat(est) / parseFloat(mac) * 100;
			return MathRound(per, 1, 0);
		}
	},
	getWorkLoadPanel : function(items) {
		var panels = [];
		for ( var x in items) {
			panels.push({
				xtype : 'panel',
				title : items[x].title
			});
		}

		return panels;
	}

});
/*
 * File: app/view/MyWindow.js
 * 
 * This file was generated by Sencha Architect version 2.2.0.
 * http://www.sencha.com/products/architect/
 * 
 * This file requires use of the Ext JS 4.2.x library, under independent
 * license. License of Sencha Architect does not include license for Ext JS
 * 4.2.x. For more details see http://www.sencha.com/license or contact
 * license@sencha.com.
 * 
 * This file will be auto-generated each and everytime you save your project.
 * 
 * Do NOT hand edit this file.
 */

Ext.define('PartScheduleEidtor', {
	extend : 'Ext.window.Window',

	height : 410,
	width : 350,
	modal : true,
	layout : {
		type : 'border'
	},
	title : '零件资料编辑',
	iconCls : 'page_edit-16',
	partid : null,

	initComponent : function() {
		var me = this;

		Ext.applyIf(me, {
			items : [ {
				id : 'mpp-part-info-form',
				xtype : 'form',
				region : 'center',
				border : false,
				bodyPadding : 10,
				bbar : [ {
					text : '保存资料',
					iconCls : 'gtk-save-16',
					handler : function() {
						var self = this.up('window');
						this.up('form').getForm().submit({
							url : 'module/schedule/savePartContent',
							method : "POST",
							success : function(form, action) {
								self.close();
							},
							failure : function(form, action) {
								showError('保存资料失败,请检查网络连接!');
							}
						});
					}
				} ],
				items : [ {
					name : 'partbarlistcode',
					xtype : 'textfield',
					anchor : '100%',
					fieldLabel : '零件单号',
					hidden : true
				}, {
					name : 'partbarcode',
					xtype : 'textfield',
					anchor : '100%',
					fieldLabel : '部件单号',
					hidden : true
				}, {
					name : 'piccode',
					xtype : 'textfield',
					anchor : '100%',
					fieldLabel : '零件图号',
					maxLength : 30
				}, {
					name : 'material',
					xtype : 'textfield',
					anchor : '100%',
					fieldLabel : '材料',
					maxLength : 30
				}, {
					name : 'hardness',
					xtype : 'textfield',
					anchor : '100%',
					fieldLabel : '硬度HRC',
					maxLength : 30
				}, {
					name : 'buffing',
					xtype : 'textfield',
					anchor : '100%',
					fieldLabel : '表面处理',
					maxLength : 30
				}, {
					name : 'tolerance',
					xtype : 'textfield',
					anchor : '100%',
					fieldLabel : '公差',
					maxLength : 30
				}, {
					xtype : 'radiogroup',
					fieldLabel : '材料来源',
					items : [ {
						xtype : 'radiofield',
						boxLabel : '仓库存料',
						name : 'materialsrc',
						inputValue : 0
					}, {
						xtype : 'radiofield',
						boxLabel : '外协订料',
						name : 'materialsrc',
						inputValue : 1
					} ]
				}, {
					xtype : 'radiogroup',
					fieldLabel : '材料类型',
					items : [ {
						xtype : 'radiofield',
						boxLabel : '硬料',
						name : 'materialtype',
						inputValue : 0
					}, {
						xtype : 'radiofield',
						boxLabel : '软料',
						name : 'materialtype',
						inputValue : 1
					} ]
				}, {
					name : 'reform',
					xtype : 'checkboxfield',
					anchor : '100%',
					fieldLabel : '标准件改造',
					boxLabel : '是',
					inputValue : 1
				}, {
					xtype : 'textareafield',
					name : 'remark',
					anchor : '100%',
					height : 115,
					labelAlign : 'top',
					maxLength : 60
				} ]
			} ]
		});

		me.callParent(arguments);

		Ext.getCmp('mpp-part-info-form').getForm().load({
			url : 'public/getPartContent?partid=' + me.partid
		});
	}

});
Ext
		.define(
				'ExportScheduleListWindow',
				{
					extend : 'Ext.window.Window',

					height : 300,
					modal : true,
					resizable : false,
					width : 300,
					layout : 'border',
					resumeid : null,
					title : '导出零件排程清单',
					iconCls : 'application_put-16',
					bbar : [ {
						text : '打印清单',
						iconCls : 'printer-16',
						handler : function() {
							var self = this.up('window');
							var schelist = Ext.getCmp('mpp-sche-export-grid').getSelectionModel().getSelection();
							if (!schelist.length) {
								showInfo('没有任何零件排程!');
								return;
							}

							var parts = [];
							for ( var x in schelist) {
								parts.push(schelist[x].get('partbarlistcode'));
							}

							Ext.Ajax.request({
								url : 'public/getModuleScheduleContent',
								params : {
									resumeid : self.resumeid,
									parts : Ext.JSON.encode(parts)
								},
								success : function(resp) {
									var backJson = Ext.JSON.decode(resp.responseText);
									if (!backJson.length) {
										showInfo('没有任何零件排程!');
										return;
									}

									var _printHtml = self.initPrintContent('零件排程报告', '深圳安德鲁精密模具有限公司', backJson, 10);
									$(_printHtml).jqprint();

								},
								failure : function(x, y, z) {
									showError('导出零件排程失败,请检查网络连接!');
								}
							});
						}
					} ],

					initComponent : function() {
						var me = this;

						Ext.applyIf(me, {
							items : [ {
								id : 'mpp-sche-export-grid',
								xtype : 'gridpanel',
								region : 'center',
								selModel : {
									selType : 'checkboxmodel',
									mode : 'SIMPLE',
									toggleOnClick : false
								},
								forceFit : true,
								store : Ext.create('Ext.data.Store', {
									fields : [ 'partbarlistcode', 'partlistcode', 'cnames' ],
									autoLoad : true,
									proxy : {
										url : 'module/schedule/getModuleScheduleInfo?resumeid=' + me.resumeid,
										type : 'ajax',
										reader : {
											type : 'json'
										}
									}
								}),
								border : false,
								columns : [ {
									xtype : 'gridcolumn',
									dataIndex : 'partlistcode',
									text : '零件编号'
								}, {
									xtype : 'gridcolumn',
									dataIndex : 'cnames',
									text : '零件名称'
								} ]
							} ]
						});

						me.callParent(arguments);
					},
					initPrintContent : function(title, headline, data, cnt) {
						var printHtml = '<html><head><title>'
								+ title
								+ '</title><style type = "text/css">body{font-size:12px}</style><style media=print>.noPrint {  display: none; } table {  page-break-after: always; } </style> </head><body>';
						for ( var m in data) {
							var n_part = data[m];
							printHtml += ('<div><table border="1" width = "716" cellspacing="0">'
									+ '<tr><td height="36" colspan="12" align="center"><span style = "font-size: 24px">深圳市安德鲁精密模具有限公司</span></td></tr>'
									+ '<tr><td height="30" colspan="12" align="center"><span style = "font-size: 18px">工艺流程表</span></td></tr>'
									+ '<tr><td colspan="2" rowspan="3" align="center">订单图面要求'
									+ (n_part.partlistcode ? '[' + n_part.partlistcode + ']' : '')
									+ '</td><td colspan="3" align="center" height = "28">模号</td>'
									+ '<td colspan="3" align="center">图号</td><td width="43" align="center">数量</td><td width="85" align="center">材料</td>'
									+ '<td width="77" align="center">硬度HRC</td><td width="84" align="center">表面处理</td></tr>'
									+ '<tr><td colspan="3" align="center" height = "28">'
									+ n_part.modulecode
									+ '</td><td colspan="3" align="center">'
									+ n_part.piccode
									+ '</td><td width="43" align="center">'
									+ n_part.quantity
									+ '</td><td width="85" align="center">'
									+ n_part.material
									+ '</td><td width="77" align="center">'
									+ n_part.hardness
									+ '</td><td width="84" align="center">'
									+ n_part.buffing
									+ '</td></tr><tr><td colspan="3" align="center" height = "28">下单日期</td><td colspan="3" align="center">'
									+ n_part.starttime
									+ '</td><td colspan="2" align="center">订单交期</td><td colspan="2" align="center">'
									+ n_part.inittrytime
									+ '</td></tr>'
									+ '<tr><td colspan="2" rowspan="3" align="center">原材料准备</td><td height="26" colspan="2" >外协订料：<input type="checkbox" name="checkbox" '
									+ (n_part.materialsrc ? 'checked="checked"' : '')
									+ ' /></td>'
									+ '<td colspan="2">软料<input type="checkbox" name="checkbox2" '
									+ (n_part.materialtype ? 'checked="checked"' : '')
									+ ' /></td><td width="36" rowspan="2" align="center">公差</td>'
									+ '<td width="76" rowspan="2" align="center">'
									+ n_part.tolerance
									+ '</td><td colspan="2" rowspan="2" align="center">零件外形尺寸</td><td colspan="2" rowspan="2" align="center"></td></tr>'
									+ '<tr><td height="32" colspan="2">仓 库 料：<input type="checkbox" name="checkbox4" '
									+ (n_part.materialsrc ? '' : 'checked="checked"')
									+ ' /></td>'
									+ '<td colspan="2">硬料<input type="checkbox" name="checkbox3" '
									+ (n_part.materialtype ? '' : 'checked="checked"')
									+ ' /></td></tr>'
									+ '<tr><td colspan="10" height = "28">有无标准件改造<input type="checkbox" name="checkbox42" '
									+ (n_part.reform ? 'checked="checked"' : '')
									+ ' /></td></tr>'
									+ '<tr><td height="37" colspan="12" align="center"><span style = "font-size: 18px">工艺流程</span></td></tr>'
									+ '<tr><td width="34" height="49" align="center">加工<br>顺序</td>'
									+ '<td width="80" align="center">工序</td><td colspan="7" align="center">单工序加工内容及注意事项</td>' + '<td align="center">工序交期</td><td align="center">成本预算</td><td align="center">完成确认</td></tr>');

							var sches = n_part.cell;
							// var stdcnt = parseInt(cnt);
							// var n_left = (sches.length > stdcnt ? 0 : stdcnt
							// - sches.length);

							// for ( var n in sches) {
							// printHtml += ('<tr><td width = "80" align
							// ="center">' + sches[n].ranknum + '</td><td width
							// = "80" align ="center">'
							// + sches[n].craftname + '</td><td width = "80"
							// colspan="5" align ="center">' + sches[n].remark +
							// '</td>'
							// + '<td width = "80" align ="center">' +
							// sches[n].endtime + '</td><td width = "80" align
							// ="center">'
							// + (sches[n].fee ? sches[n].fee : '') + '</td><td
							// width = "80" align ="center"></td>' + '<td width
							// = "80" align ="center"></td><td width = "80"
							// align ="center"></td><td width = "80" align
							// ="center"></td></tr>');
							// }

							for ( var n in sches) {
								printHtml += ('<tr><td height = "30" align="center">' + sches[n].ranknum + '</td><td align="center">'
										+ sches[n].craftname + '</td><td colspan="7" align="center">' + sches[n].remark + '</td><td align="center">'
										+ sches[n].endtime + '</td><td align="center">' + (sches[n].fee ? sches[n].fee : '') + '</td><td></td></tr>');
							}

							// for (var i = sches.length - 1; i < n_left; i++) {
							// printHtml += ('<tr><td width = "80" align
							// ="center">'
							// + (i + 1)
							// + '</td><td width = "80" align ="center"></td><td
							// width = "80" colspan="5" align ="center"></td>'
							// + '<td width = "80" align ="center">#</td><td
							// width = "80" align ="center">#</td><td width =
							// "80" align ="center">#</td>' + '<td width = "80"
							// align ="center">#</td><td width = "80" align
							// ="center"></td><td width = "80" align
							// ="center"></td></tr>');
							// }

							printHtml += ('<tr><td align="center">零<br>件<br>备<br>注</td><td width = "80" colspan="11">' + n_part.intro + '</td></tr>'
									+ '<tr><td colspan="12">1.每道工序加工完后需自行检查，合格后才能流到下道工序；后一道工序加工者在加工前需简单检查上一工序加工的部位，'
									+ '以防止因上一道工序已报废，后一道工序仍继续加工的情况发生。<br>2.加工者需如实填写实际完成工时、造成者签名及完成状况，以备后序作查询凭证及考评依据。<br>'
									+ '3.严格按照此工艺流程执行加工，在加工中如发现工艺制定不合理或是加工难度很大，本着先执行后投诉或提出修改建议为原则。<br>' + '4.此工艺流程按排与实际生产状况有冲突时，其生产小组负责人应第一时间向生产主管如实汇报情况， 以便及时作出合理调整。</td></tr></table></div>');
						}

						printHtml += ('</body></html>');

						return printHtml;
					}
				});
Ext.define('ModuleScheduleCrafts', {
	extend : 'Ext.window.Window',
	width : 280,
	height : 360,
	modal : true,
	layout : 'border',
	title : '工艺设定',
	bbar : [ '->', {
		iconCls : 'gtk-save-16',
		text : '保存设定',
		handler : function() {
			var _win = this.up('window');
			// 获取要设定的工艺讯息
			var craftRows = Ext.getCmp('msc-craft-select').getSelectionModel().getSelection();

			var craftArr = [];
			for ( var x in craftRows) {
				craftArr.push(craftRows[x].get('id'));
			}

			Ext.Ajax.request({
				url : 'module/schedule/addModuleCraftClassify?flag=1',
				params : {
					craftset : craftArr.join(',')
				},
				method : 'POST',
				success : function(res) {
					var backJson = Ext.JSON.decode(res.responseText);
					if (backJson.success) {
						_win.close();
					} else {
						showError(backJson.msg);
					}
				},
				failure : function(x, y, z) {
					showError('连接服务器失败,请重新登录!');
				}
			});
		}
	} ],
	initComponent : function() {
		var self = this;
		self.items = [ {
			id : 'msc-craft-select',
			xtype : 'gridpanel',
			region : 'center',
			forceFit : true,
			border : false,
			selModel : {
				mode : "SIMPLE",
				// checkOnly : true,
				selType : "checkboxmodel"
			},
			columns : [ {
				dataIndex : 'craftname',
				text : '加工工艺',
				renderer : function(val, meta, record) {
					return val ? ('<b>' + val + '[' + record.get('craftcode') + ']</b>') : val;
				}
			} ],
			store : Ext.create('Ext.data.Store', {
				fields : [ 'id', 'craftname', 'mccid', 'craftcode', 'checked' ],
				autoLoad : true,
				proxy : {
					url : 'public/getScheduleCrafts?classid=1',
					type : 'ajax',
					reader : {
						type : 'json'
					}
				},
				listeners : {
					load : function(store, records) {
						var selGrid = Ext.getCmp('msc-craft-select');
						var estSelRow = [];
						if (records && records.length) {
							for ( var x in records) {
								if (records[x].get('checked')) {
									estSelRow.push(records[x]);
								}
							}

							if (estSelRow.length) {
								selGrid.getSelectionModel().select(estSelRow);
							}
						}
					}
				}
			})
		} ];
		self.callParent(arguments);
	}
});
Ext.define('Module.ModulePartPlan', {
	extend : 'Ext.panel.Panel',
	requires : [ 'Module.ModulePartPlanGantt' ],

	emptyText : '<div style="color:red;">没有工件</div><div>请到:[<span sytle="color:blue;">工件加工</span>]'
			+ '->[<span sytle="color:blue;">工件清单</span>]中导入工件或手动增加工件</div>',
	layout : {
		type : 'border'
	},
	partFields : [ "partbarcode", "moduleresumeid", "partbarlistcode", "partcode", "partlistcode", "text", "cnames" ],

	editBtnText : '编辑',
	// 缓存选择的零件记录
	selectRecord : null,
	isNewPredictCraft : false,// 是否不新的预设工艺集合
	taskGantt : [],// 用来存放选中工件的工艺排程
	consult : { // 复制排程参考资料
		// 选择模具番号
		modulecode : null,
		// 模具履历ID
		resumeid : null,
		// 选择的零件或者部件号
		partcode : null,
		// 零件或者部件唯一号
		partbarcode : null,
		// 零件还是部件
		ismain : true,
		// 设置的零件唯一号
		setbarcode : null,
		// 设定的模具履历
		setresumeid : null
	},

	initComponent : function() {
		var me = this;

		me.gantt = Ext.create("Module.ModulePartPlanGantt", {
			id : 'module-part-plan-gantt',
			region : 'center',
			flex : 1.3,
			rowHeight : 20,
			taskStore : Ext.create("Gnt.data.TaskStore", {
				// model : 'Gnt.model.Task',
				model : 'ModulePartScheduleModel',
				autoLoad : true,
				proxy : {
					type : 'ajax',
					url : '',
					reader : {
						type : 'json'
					}
				},
				rootVisible : false
			}),
			dependencyStore : Ext.create("Gnt.data.DependencyStore", {
				// model : 'Gnt.model.Dependency',
				autoLoad : true,
				proxy : {
					type : 'memory',
				}
			}),
			columnLines : true,
			rowLines : true,

			startDate : new Date(),// 模具开始时间
			endDate : Sch.util.Date.add(new Date(), Sch.util.Date.WEEK, 20),// 模具T0时间

			viewPreset : 'weekAndDayLetter',
		});

		// me.workloadPanel = Ext.create('Module.ModulePartPlanWorkload', {
		// id : 'ModulePartPlanWorkload',
		// collapsed : false,
		// collapsible : true,
		// split : true,
		// region : 'south',
		// flex : 1,
		// title : '',
		// });

		Ext.applyIf(me, {
			tbar : {
				items : [ {
					text : '工艺设定',
					iconCls : 'calendar_edit-16',
					handler : function() {
						new ModuleScheduleCrafts().show();
					}
				}, '-', {
					text : '管理排程',
					iconCls : 'date_edit-16',
					handler : function() {
						var selRows = Ext.getCmp('grid-schedule-module-info').getSelectionModel().getSelection();
						if (!selRows.length) {
							showInfo('未选中任何模具!');
							return;
						}

						var t_list = [];
						for ( var x in selRows) {
							t_list.push({
								modulebarcode : selRows[x].get('modulebarcode'),
								text : selRows[x].get('text')
							});
						}
						Ext.create('Module.CopyModuleSchedule', {
							modulelist : t_list
						}).show();
					}
				}, "-", {
					text : '工艺流程',
					iconCls : 'cog_edit-16',
					menu : Ext.create("Ext.menu.Menu", {
						items : [ {
							text : '预设流程',
							listeners : {
								focus : me.onMenuItemFocus
							},
							parent : me
						}, '-', {
							text : '设置预设流程',
							iconCls : 'app-set-16',

							handler : me.onCustomWindow
						} ]
					})
				}, '-', {
					text : '查看工件负荷',
					iconCls : 'chart_bar-16',
					handler : function() {
						new Module.ShowEstimateLoad({
							initKey : {
								day : 0,
								isall : false
							}
						}).show();
					}
				} ]
			},

			items : [ {
				xtype : 'panel',
				region : 'west',
				split : true,
				width : 310,
				layout : {
					type : 'border'
				},
				collapsed : false,
				collapsible : true,
				title : '模具工号',
				bodyPadding : 3,
				items : [ {
					id : 'grid-schedule-module-info',
					xtype : 'gridpanel',
					region : 'center',
					flex : 1,
					hideHeaders : true,
					forceFit : true,
					selectRecord : null,
					viewConfig : {
						emptyText : '<h1 style="margin:10px">查询不到模具工号</h1>',
					},
					selType : 'checkboxmodel',
					store : Ext.create('Ext.data.Store', {
						autoLoad : true,
						fields : [ "endtime", "starttime", "modulebarcode", 'modulecode', "guestcode", "resumename", "resumestate", "text", "id" ],
						proxy : {
							url : '',
							type : 'ajax',
							reader : {
								type : 'json',
								root : 'children'
							}
						},
						listeners : {
							load : function() {
								me.gantt.setTitle('排工单');
								// 将选择的零件信息清空
								me.selectRecord = null;

								var partStore = Ext.getStore('module-part-plan-tree-store-id');
								partStore.load([]);

								Ext.getCmp('module-part-plan-txt-qurey').setValue(Ext.emptyString);

								me.gantt.taskStore.loadData([]);
							}
						}
					}),
					columns : [ {
						xtype : 'gridcolumn',
						dataIndex : 'modulecode',
						renderer : function(val, meta, record) {
							var _resumename = record.get('resumename');
							return '<b>' + val + "<font color = red>[" + (!_resumename ? '完成' : _resumename) + ']</font></b>';
						}
					} ],
					dockedItems : [ {
						xtype : 'toolbar',
						items : [ {
							id : 'mpp-chk-by-guest',
							xtype : 'checkbox',
							boxLabel : '依番号'
						}, ''
						// ,
						// Ext.create('Module.ModuleFindTextField',
						// {
						// queryLength : 2,
						// url : 'public/module?isResume=false'
						// })
						, {
							xtype : 'textfield',
							emptyText : '请输入模具号',
							isTxt : true,
							listeners : {
								change : me.onResumeModule
							}
						}, {
							text : '快速查询',
							iconCls : 'lightning-16',
							menu : Ext.create("Ext.menu.Menu", {
								items : [ {
									text : '新增模具',
									// isNew : true,
									isTxt : false,
									states : "['20401']",
									parent : me,
									iconCls : 'cog_add-16',
									handler : me.onResumeModule
								}, {
									text : '修模设变',
									isTxt : false,
									// isNew : false,
									states : "['20402','20403']",
									parent : me,
									iconCls : 'cog_edit-16',
									handler : me.onResumeModule
								}, {
									text : '零件加工',
									isTxt : false,
									states : "['20408']",
									// isNew : false,
									iconCls : 'cog-16',
									parent : me,
									handler : me.onResumeModule
								}, {
									text : '治具/量产',
									isTxt : false,
									states : "['20409']",
									// isNew : false,
									iconCls : 'cog_go-16',
									parent : me,
									handler : me.onResumeModule
								}, {
									text : '暂停模具',
									isTxt : false,
									// isNew : false,
									states : "['20404']",
									parent : me,
									iconCls : 'cog_delete-16',
									handler : me.onResumeModule
								} ]
							})
						} ]
					} ],
					listeners : {
						itemdblclick : me.onClickModuleNumber
					}
				}, {
					xtype : 'treepanel',
					id : 'module-part-plan-part-treepanel',
					flex : 1.3,
					resumeid : null,
					border : '1 0 0 0',
					region : 'south',
					margin : '5 0 0 0',
					tbar : [ {
						id : 'module-part-plan-txt-qurey',
						xtype : 'textfield',
						emptyText : '查找零件号',
						width : 110,
						listeners : {
							change : function(field, nw, od) {
								// 甘特图先清空
								me.gantt.taskStore.loadData([]);

								var store = Ext.getStore('module-part-plan-tree-store-id');
								store.reload({
									params : {
										resumeid : me.consult.resumeid,
										partcode : nw
									},
									success : function() {
										// 将选中的零件信息清空
										me.consult.partbarcode = null;
										me.consult.partcode = null;
									}
								});
							}
						}
					}, '->', {
						text : '复制',
						iconCls : 'page_white_paste-16',
						handler : function() {
							var treeview = this.up('treepanel');
							var selRows = treeview.getSelectionModel().getSelection();
							// 勾选行
							var chkRows = treeview.getChecked();
							if (!chkRows.length) {
								showError('没有选择任何要复制排程的零件');
								return;
							}

							var chkr = [];
							if (chkRows.length) {
								for ( var x in chkRows) {
									chkr.push(chkRows[x].get('partbarlistcode'));
								}
							}

							if (!selRows.length) {
								showError('没有选择任何要安排排程的工件或者部件');
								return;
							}

							var selR = selRows[0];

							App.Progress('正在复制中...', '排程复制');

							Ext.Ajax.request({
								url : 'module/schedule/copyPartSchedule',
								params : {
									resumeid : me.consult.setresumeid,
									reference : me.consult.setbarcode,
									selpart : selR.get('partbarlistcode'),
									copies : Ext.JSON.encode(chkr)
								},
								method : 'POST',
								success : function(resp) {
									App.ProgressHide();

									var backJson = Ext.JSON.decode(resp.responseText);
									if (backJson.success) {

										for ( var m in chkRows) {
											var childNode = chkRows[m];
											// 取消子节点勾选
											childNode.set("checked", false);
											// 将没有复制排程的零件设置为已经复制状态
											childNode.set('cls', 'craft-schedule-exits');
										}

										if (backJson.gantt.length) {

											for ( var x in backJson.gantt) {

												backJson.gantt[x].Name = backJson.gantt[x].name;
												backJson.gantt[x].PercentDone = backJson.gantt[x].percentDone;

												backJson.gantt[x].StartDate = backJson.gantt[x].startDate;
												backJson.gantt[x].EndDate = backJson.gantt[x].endDate;

												backJson.gantt[x].Duration = backJson.gantt[x].duration;
												backJson.gantt[x].DurationUnit = backJson.gantt[x].durationUnit;
											}

											me.gantt.taskStore.loadData(backJson.gantt);
										}

										showSuccess(backJson.msg);
									} else {
										showError(backJson.msg);
									}
								},
								failure : function(x, y, z) {
									App.ProgressHide();
									showError('请检查网络是否正常');
								}
							});
						}
					}, '-', {
						id : 'export-sche-list-btn',
						text : '导出',
						iconCls : 'page_gear-16',
						resumeid : null,
						handler : function() {
							var self = this;
							if (self.resumeid) {
								new ExportScheduleListWindow({
									resumeid : this.resumeid
								}).show();
							} else {
								showError('未选中任何模具讯息!');
							}
						}
					}, '-', {
						id : 'export-sche-list-edit',
						text : me.editBtnText,
						partcode : null,
						iconCls : 'page_edit-16',
						handler : function() {
							if (this.partcode) {
								new PartScheduleEidtor({
									partid : this.partcode
								}).show();
							}
						}
					} ],
					title : '工件列表',
					useArrows : true,
					rootVisible : false,
					store : Ext.create('Ext.data.TreeStore', {
						id : 'module-part-plan-tree-store-id',
						fields : me.partFields,
						proxy : {
							type : 'ajax',
							url : 'public/moduleResumeUnit',
							reader : {
								type : 'json'
							}
						},
						autoLoad : true
					}),
					viewConfig : {
						emptyText : me.emptyText,
					},

					listeners : {
						itemclick : me.onClickModulePart
					}
				} ]
			}, {
				xtype : 'container',
				layout : 'border',
				region : 'center',
				items : [ me.gantt ]
			} ]
		});

		me.callParent(arguments);
	},
	/**
	 * 新模或修模/设变
	 */
	onResumeModule : function(ctrl, nw) {
		var item = this;
		var chk = Ext.getCmp('mpp-chk-by-guest').getValue();
		item.up('gridpanel').getStore().load({
			url : 'public/getModuleResumeInfoByCase',
			params : {
				chk : chk,
				query : (item.isTxt ? nw : null),
				states : item.states
			}
		});
	},

	/**
	 * 显示自定义工艺排程窗口
	 */
	onCustomWindow : function() {
		Ext.create('Module.CustomFlowplanWindow').show();
	},

	/**
	 * 显示预设工艺集合方法
	 * 
	 * @param menu
	 * @param e
	 */
	onMenuItemFocus : function(menu, e) {

		// 三种条件表示要重新读取工艺集合
		if (!PredictCraftMenu || !PredictCraftMenu[0].success || menu.parent.isNewPredictCraft) {
			PredictCraftMenu = [ {
				xtype : 'menuitem',
				text : "没有预计工艺数据,请设置!",
				success : false
			} ];
			// 生成工艺集合选择菜单
			Ext.Ajax.request({
				url : 'public/craftSetMenuitem',
				async : false,
				success : function(response) {
					var res = JSON.parse(response.responseText);
					if (res.success) {
						PredictCraftMenu = [];
						for ( var i in res.item) {
							PredictCraftMenu.push({
								xtype : 'menuitem',
								text : res.item[i].setname,
								setId : res.item[i].setid,
								children : res.item[i].children,
								success : true,
								handler : menu.parent.onDefaultPlan
							});
						}

						menu.parent.isNewPredictCraft = false;
					}
				},
				failure : function(response) {
					App.Error(response);
				}
			});

			menu.setMenu(Ext.create('Ext.menu.Menu', {
				items : PredictCraftMenu
			}));
		} else {
			// 没有菜单项时重新设置
			if (!menu.menu) {
				menu.setMenu(Ext.create('Ext.menu.Menu', {
					items : PredictCraftMenu
				}));
			}
		}

	},

	// /**
	// * 新模或修模/设变
	// */
	// onResumeModule : function() {
	// var item = this;
	// item.parent.taskGantt = [];// 读取模具信息时,将之前选择工件工艺排程清空
	// item.up('gridpanel').getStore().load({
	// url : 'public/moduleForResume',
	// params : {
	// isNew : item.isNew
	// }
	// });
	// },

	/**
	 * 对工件生成预设排程
	 */
	onDefaultPlan : function() {
		var menuItem = this;

		// 获取主界面
		var me = Ext.getCmp('Module.ModulePartPlan');
		// 获取零件树
		var treeView = Ext.getCmp('module-part-plan-part-treepanel');// 可以对多个工件同时安排工艺排程
		// 勾选的节点
		var checkNodes = treeView.getChecked();
		if (!checkNodes.length) {
			showError('没有勾选任何零件信息');
			return;
		}

		// 获取选择节点
		var selNodes = treeView.getSelectionModel().getSelection();

		var window = Ext.create('Module.AutoCreatePlanWindow', {
			title : '自动生成排程',
			checkNodes : checkNodes,
			selNode : (selNodes.length ? selNodes[0] : null),
			taskStore : me.gantt.taskStore
		});

		window.store.loadData(menuItem.children);

		window.show();
	},
	/** 点击模具工号显示模具相应工件清单 */
	onClickModuleNumber : function(treeview, record) {
		var parent = Ext.getCmp('Module.ModulePartPlan');

		// 获取订单日期和结束日期
		var starttime = new Date(record.get('starttime'));
		var endtime = new Date(record.get('endtime'));
		// 将编辑按钮设置为不可用
		var editBtn = Ext.getCmp('export-sche-list-edit');

		editBtn.setDisabled(true);
		editBtn.setText(parent.editBtnText);

		// 设置零件列表的缓存模具履历号
		var exportScheBtn = Ext.getCmp('export-sche-list-btn');
		exportScheBtn.resumeid = record.get('id');

		// 设置参考零件的模具工号
		parent.consult.modulecode = record.get('modulecode');
		parent.consult.resumeid = record.get('id');

		// 将选择零件的信息清空
		parent.consult.partbarcode = null;
		parent.consult.partcode = null;

		parent.gantt.getTaskStore().loadData([]);
		// 设置排程区间

		parent.gantt.setStart(starttime);

		// 如果时间区间是在当天,而且开始和结束时间在当天之内会报错,所以要将结束时间往后推迟一天
		var compareDate = Ext.Date.add(endtime, Ext.Date.DAY, -1);
		if (compareDate < starttime) {
			parent.gantt.setEnd(Ext.Date.add(endtime, Ext.Date.DAY, 1));
		} else {
			parent.gantt.setEnd(endtime);
		}

		parent.gantt.setTitle(Ext.String.format("[ {0} ] 加工时间: {1} 至 {2}", record.data.text, Ext.Date.format(starttime, "Y-m-d"), Ext.Date.format(
				endtime, "Y-m-d")));

		// 重新选择工件时,就从当前开始
		parent.gantt.craftStartDate = NowDate;
		// 设置选择行
		treeview.selectRecord = record;

		var store = Ext.getStore('module-part-plan-tree-store-id');

		store.load({
			params : {
				resumeid : record.data.id
			}
		});
	},

	/**
	 * 
	 * @param treeview
	 * @param record
	 */
	onClickModulePart : function(treeview, record, item, index, e) {
		// 单击加载零件排程的时候，如果是勾选则不加载
		if (e.target.className.indexOf('x-tree-checkbox') > -1) {
			return;
		}
		if (!record) {
			return;
		}

		var parent = Ext.getCmp('Module.ModulePartPlan');
		var editBtn = Ext.getCmp('export-sche-list-edit');

		// 获取零件唯一号
		var partid = record.data.partbarlistcode;
		// 获取零件编号
		parent.consult.partcode = record.data.partlistcode;
		// 缓存选中的零件信息
		parent.selectPartRecord = record;
		// 是否部件
		parent.consult.ismain = false;
		// 设置零件号
		parent.consult.partbarcode = partid;

		if (editBtn.isDisabled()) {
			editBtn.setDisabled(false);
		}

		Ext.Ajax.request({
			url : 'public/getPartContent?partid=' + partid,
			success : function(resp) {
				var backJson = Ext.JSON.decode(resp.responseText);
				if (backJson.success) {
					editBtn.partcode = partid;

					if (backJson.empty) {
						editBtn.setText(parent.editBtnText);
					} else {
						editBtn.setText('<font color = blue><b>' + parent.editBtnText + '</b></font>');
					}
				} else {
					editBtn.setText(parent.editBtnText);
					showError(backJson.msg);
				}
			},
			failure : function(x, y, z) {
				editBtn.setText(parent.editBtnText);
				showError('连接服务器失败,请检查网络连接!');
			}
		});

		// 重新选择工件时,就从当前开始
		parent.gantt.craftStartDate = NowDate;

		parent.selectPartRecord = record;

		App.Progress('工艺排程读取中,请稍候...', '工艺排程');

		Ext.Ajax.request({
			url : 'module/schedule/craftPlanGantt',
			params : {
				"mes.partId" : partid,
				"mes.moduleResumeId" : parent.consult.resumeid
			},
			success : function(response) {
				var res = Ext.JSON.decode(response.responseText);

				App.InterPath(res, function() {
					if (!res.success) {
						showError(res.msg);
						return;
					}

					parent.gantt.taskStore.loadData(res.gantt);
				});

				App.ProgressHide();
			},
			failure : function(response) {

				App.ProgressHide();
				App.Error(response);
			}
		});
	}

});

Ext.define('Module.CopyModuleSchedule', {
	extend : 'Ext.window.Window',
	width : 300,
	height : 350,
	modal : true,
	title : '模具排程管理',
	layout : 'border',
	padding : 5,
	modulelist : [],
	defaults : {
		padding : 2
	},
	initComponent : function() {
		var me = this;
		Ext.applyIf(me, {
			items : [ {
				xtype : 'gridpanel',
				region : 'center',
				forceFit : true,
				columns : [ {
					text : '模具工号',
					dataIndex : 'text'
				} ],
				store : Ext.create('Ext.data.Store', {
					id : 'store-schedule-module-list',
					fields : [ 'modulebarcode', 'text' ],
					data : me.modulelist,
					autoLoad : false
				})
			}, {
				id : 'alter-form',
				xtype : 'form',
				region : 'south',
				defaults : {
					anchor : '100%',
					padding : 3
				},
				fieldDefaults : {
					labelWidth : 110,
					labelAlign : 'left',
					msgTarget : 'none',
					invalidCls : ''
				},
				items : [ {
					name : 'refer-module',
					xtype : 'combobox',
					displayField : 'modulecode',
					valueField : 'modulecode',
					store : Ext.create('Ext.data.Store', {
						id : 'store-schedule-query-info',
						fields : [ 'modulebarcode', 'modulecode', 'schecount' ],
						autoLoad : false,
						proxy : {
							url : '',
							type : 'ajax',
							reader : {
								type : 'json'
							}
						}
					}),
					emptyText : '请输入参考模具',
					listeners : {
						change : function(combo, nw, od) {
							Ext.getStore('store-schedule-query-info').load({
								url : 'module/schedule/getScheduleModuleInfo',
								params : {
									match : nw
								}
							});
						}
					}
				}, {
					xtype : 'radiogroup',
					fieldLabel : '',
					cls : 'x-check-group-alt',
					items : [ {
						boxLabel : '排程推迟',
						name : 'rb-mode',
						inputValue : 1,
						checked : true
					}, {
						boxLabel : '排程提前',
						name : 'rb-mode',
						inputValue : 2
					} ]
				}, {
					name : 'modify-day',
					xtype : 'numberfield',
					fieldLabel : '天数',
					labelWidth : 40,
					width : 120,
					maxValue : 1000,
					minValue : 0,
					value : 0
				}, {
					name : 'modify-hour',
					xtype : 'numberfield',
					fieldLabel : '时数',
					labelWidth : 40,
					width : 120,
					maxValue : 1000,
					minValue : 0,
					value : 0
				} ],
			} ],
			bbar : [ {
				text : '保存资料',
				iconCls : 'gtk-save-16',
				handler : function() {
					var loadIndex = layer.load("模具排程复制中...", 0);
					var rows = Ext.getStore('store-schedule-module-list').getRange();
					var submitRow = [];
					for ( var x in rows) {
						submitRow.push(rows[x].get('modulebarcode'));
					}
					// 如果提交的模具工号集合不存在,则返回空
					if (!rows.length) {
						showInfo('没有模具工号可以提交!');
						return;
					}

					Ext.getCmp('alter-form').getForm().submit({
						url : 'module/schedule/saveOrUpateScheduleInfo',
						params : {
							modulelist : Ext.JSON.encode(submitRow)
						},
						success : function(form, action) {
							showSuccess('保存资料成功!');
							Ext.getCmp('module-part-plan-part-treepanel').getStore().reload();
							Ext.getCmp('module-part-plan-gantt').getTaskStore().loadData([]);
							me.close();

							layer.close(loadIndex);
							return;
						},
						failure : function(form, action) {
							layer.close(loadIndex);
							var backJson = Ext.JSON.decode(action.response.responseText);
							if (backJson.result == -1) {
								showError('未选中任何待操作的模具工号!');
								return;
							} else if (backJson.result == -2) {
								showError('更改类型未设置!');
								return;
							} else if (backJson.result == -3) {
								showError('延迟或者提前的日期在0-30天之内!');
								return;

							} else if (backJson.result == -4) {
								showError('延迟或者提前的时数在0~23时之内!');
								return;

							} else if (backJson.result == -5) {
								showError('待操作的模具讯息已经不存在了!');
								return;

							} else if (backJson.result == -6) {
								showError('所有模具都已经安排排程了!');
								return;

							} else if (backJson.result == -7) {
								showError('更新排程请设置天数或者时数!');
								return;

							} else if (backJson.result == -8) {
								showError('更新模具排程失败,请重试!');
								return;

							} else if (backJson.result == -9) {
								showError('保存模具排程失败,请重试!');
								return;

							} else {
								showError('未知原因,请联系管理员!');
								return;
							}
						}
					});
				}
			} ]
		});

		me.callParent(arguments);
	}
});