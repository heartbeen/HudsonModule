Ext.define('Module.WorkPartWindow', {
	extend : 'Ext.window.Window',

	height : 750,
	width : 1000,
	layout : {
		type : 'border'
	},
	title : '工件详细情况',
	iconCls : 'calendar-16',
	modal : true,
	partid : null,
	resumeid : null,
	partinfo : null,

	initComponent : function() {
		var me = this;

		Ext.applyIf(me, {
			items : [ {
				xtype : 'container',
				region : 'west',
				width : 450,
				defaults : {
					padding : 3
				},
				layout : {
					type : 'border'
				},
				items : [ {
					xtype : 'gridpanel',
					region : 'center',
					title : '预计加工排程',
					store : Ext.data.Store({
						fields : [ 'craftname', 'starthour', 'endhour', 'esthour' ],
						autoLoad : true,
						proxy : {
							url : 'public/getRegularEstimateSchedule?partid=' + me.partid + '&resumeid=' + me.resumeid,
							type : 'ajax',
							reader : {
								type : 'json'
							}
						}
					}),
					columns : [ {
						xtype : 'gridcolumn',
						dataIndex : 'craftname',
						width : 120,
						text : '工艺名称',
						renderer : function(val) {
							return (val ? '<b>' + val + '</b>' : val);
						}
					}, {
						xtype : 'gridcolumn',
						dataIndex : 'starthour',
						width : 120,
						text : '开始时间',
						renderer : function(val) {
							return (val ? '<b>' + val + '</b>' : val);
						}
					}, {
						xtype : 'gridcolumn',
						dataIndex : 'endhour',
						width : 120,
						text : '结束时间',
						renderer : function(val) {
							return (val ? '<b>' + val + '</b>' : val);
						}
					}, {
						xtype : 'gridcolumn',
						dataIndex : 'esthour',
						width : 60,
						text : '用时',
						renderer : function(val) {
							return (val ? '<b>' + val + '</b>' : val);
						}
					} ]
				}, {
					xtype : 'gridpanel',
					region : 'south',
					split : true,
					height : 200,
					store : new Ext.data.Store({
						fields : [ 'craftname', 'starthour', 'endhour', 'usehour' ],
						autoLoad : true,
						proxy : {
							url : 'public/getActualWorkSchedule?partid=' + me.partid + '&resumeid=' + me.resumeid,
							type : 'ajax',
							reader : {
								type : 'json'
							}
						}
					}),
					title : '实际生产排程',
					columns : [ {
						xtype : 'gridcolumn',
						dataIndex : 'craftname',
						text : '工艺名称',
						width : 120,
						renderer : function(val) {
							return (val ? '<b>' + val + '</b>' : val);
						},
					}, {
						xtype : 'gridcolumn',
						dataIndex : 'starthour',
						width : 120,
						renderer : function(val) {
							return (val ? '<b>' + val.substring(0, 13) + '</b>' : val);
						},
						text : '开始时间'
					}, {
						xtype : 'gridcolumn',
						dataIndex : 'endhour',
						width : 120,
						text : '结束时间',
						renderer : function(val) {
							return (val ? '<b>' + val.substring(0, 13) + '</b>' : val);
						},
					}, {
						xtype : 'gridcolumn',
						dataIndex : 'usehour',
						width : 60,
						text : '用时',
						renderer : function(val) {
							return (val ? '<b>' + val + '</b>' : val);
						},
					} ]
				}, {
					xtype : 'form',
					region : 'north',
					height : 291,
					defaults : {
						padding : '0 2'
					},
					bodyPadding : 3,
					title : '工件动态',
					layout : {
						type : 'table',
						columns : 2
					},
					items : [ {
						xtype : 'textfield',
						anchor : '100%',
						value : me.partinfo.partlistcode,
						fieldLabel : '工件代号',
						labelWidth : 65,
						readOnly : true
					}, {
						xtype : 'textfield',
						value : me.partinfo.partname,
						anchor : '100%',
						fieldLabel : '工件名称',
						labelWidth : 65,
						readOnly : true
					}, {
						xtype : 'textfield',
						value : me.partinfo.statename,
						anchor : '100%',
						fieldLabel : '当前状态',
						labelWidth : 65,
						readOnly : true
					}, {
						xtype : 'textfield',
						value : me.partinfo.regionname,
						anchor : '100%',
						fieldLabel : '所在单位',
						labelWidth : 65,
						readOnly : true
					}, {
						xtype : 'textfield',
						anchor : '100%',
						fieldLabel : '机台编号',
						value : me.partinfo.batchno,
						labelWidth : 65,
						readOnly : true
					}, {
						xtype : 'textfield',
						anchor : '100%',
						fieldLabel : '当前工艺',
						value : me.partinfo.craftname,
						labelWidth : 65,
						readOnly : true
					}, {
						xtype : 'textfield',
						anchor : '100%',
						value : me.partinfo.esthour,
						fieldLabel : '加工需时',
						labelWidth : 65,
						readOnly : true
					}, {
						xtype : 'textfield',
						anchor : '100%',
						fieldLabel : '实际用时',
						value : me.partinfo.acthour,
						labelWidth : 65,
						readOnly : true
					}, {
						xtype : 'textfield',
						anchor : '100%',
						fieldLabel : '加工费用',
						value : me.partinfo.totalfee,
						labelWidth : 65,
						readOnly : true
					},
					// TODO XXXX
					{
						xtype : 'textfield',
						anchor : '100%',
						value : me.partinfo.piccode,
						fieldLabel : '工件图号',
						labelWidth : 65,
						readOnly : true
					}, {
						xtype : 'textfield',
						value : me.partinfo.hardness,
						anchor : '100%',
						fieldLabel : '硬度HRC',
						labelWidth : 65,
						readOnly : true
					}, {
						xtype : 'textfield',
						value : me.partinfo.buffing,
						anchor : '100%',
						fieldLabel : '表面处理',
						labelWidth : 65,
						readOnly : true
					}, {
						xtype : 'textfield',
						value : (me.partinfo.materialsrc ? '外协' : '仓库'),
						anchor : '100%',
						fieldLabel : '材料来源',
						labelWidth : 65,
						readOnly : true
					}, {
						xtype : 'textfield',
						anchor : '100%',
						fieldLabel : '材料类型',
						value : (me.partinfo.materialtype ? '软料' : '硬料'),
						labelWidth : 65,
						readOnly : true
					}, {
						xtype : 'textfield',
						anchor : '100%',
						fieldLabel : '公差',
						value : me.partinfo.tolerance,
						labelWidth : 65,
						readOnly : true
					}, {
						xtype : 'textfield',
						anchor : '100%',
						value : (me.partinfo.reform ? '是' : '否'),
						fieldLabel : '标件改造',
						labelWidth : 65,
						readOnly : true
					}, {
						xtype : 'textfield',
						anchor : '100%',
						fieldLabel : '是否基件',
						value : (me.partinfo.isfixed ? '是' : '否'),
						labelWidth : 65,
						readOnly : true
					}, {
						xtype : 'textfield',
						anchor : '100%',
						fieldLabel : '备注说明',
						value : me.partinfo.remark,
						labelWidth : 65,
						readOnly : true
					} ]
				} ]
			}, {
				xtype : 'container',
				region : 'center',
				defaults : {
					padding : 3
				},
				layout : {
					type : 'border'
				},
				items : [ {
					xtype : 'gridpanel',
					region : 'center',
					store : new Ext.data.Store({
						fields : [ 'partlistcode', 'partname', 'regionname', 'craftname', 'batchno', 'statename', 'empname', 'lrcdtime' ],
						autoLoad : true,
						proxy : {
							url : 'public/getModuleProcessDetails?partid=' + me.partid + '&resumeid=' + me.resumeid,
							type : 'ajax',
							reader : {
								type : 'json'
							}
						}
					}),
					title : '零件加工明细',
					columns : [ {
						xtype : 'gridcolumn',
						dataIndex : 'partlistcode',
						text : '零件编号',
						width : 80,
						renderer : me.setFontBold
					}, {
						xtype : 'gridcolumn',
						dataIndex : 'partname',
						text : '零件名称',
						renderer : me.setFontBold
					}, {
						xtype : 'gridcolumn',
						dataIndex : 'regionname',
						text : '所在单位',
						renderer : me.setFontBold
					}, {
						xtype : 'gridcolumn',
						dataIndex : 'craftname',
						text : '加工工艺',
						renderer : me.setFontBold
					}, {
						xtype : 'gridcolumn',
						dataIndex : 'batchno',
						text : '机台编号',
						width : 80,
						renderer : me.setFontBold
					}, {
						xtype : 'gridcolumn',
						dataIndex : 'statename',
						text : '零件状态',
						width : 80,
						renderer : me.setFontBold
					}, {
						xtype : 'gridcolumn',
						dataIndex : 'empname',
						width : 80,
						text : '操作人员',
						renderer : me.setFontBold
					}, {
						xtype : 'gridcolumn',
						dataIndex : 'lrcdtime',
						text : '操作时间',
						width : 150,
						renderer : me.setFontBold
					} ]
				} ]
			} ]
		});

		me.callParent(arguments);
	},
	setFontBold : function(val) {
		return (val ? '<b>' + val + '</b>' : val);
	}
});

Ext.define('Module.ShowModuleInfo', {
	extend : 'Ext.window.Window',

	height : 242,
	width : 400,
	closeAction : 'hide',
	layout : {
		columns : 2,
		type : 'table'
	},
	title : '模具加工进度',

	initComponent : function() {
		var self = this;

		Ext.applyIf(self, {
			bodyPadding : 6,
			defaults : {
				padding : 3
			},
			items : [ {
				xtype : 'textfield',
				id : 'txt_inquire_module_batch',
				width : 180,
				fieldLabel : '模具编号',
				readOnly : true,
				labelWidth : 60
			}, {
				xtype : 'textfield',
				id : 'txt_inquire_custom_name',
				width : 180,
				fieldLabel : '模具客户',
				readOnly : true,
				labelWidth : 60
			}, {
				xtype : 'textfield',
				id : 'txt_inquire_module_class',
				width : 180,
				readOnly : true,
				fieldLabel : '模具机种',
				labelWidth : 60
			}, {
				xtype : 'textfield',
				id : 'txt_inquire_make_state',
				readOnly : true,
				width : 180,
				fieldLabel : '制作状态',
				labelWidth : 60
			}, {
				xtype : 'textfield',
				id : 'txt_inquire_module_takeon',
				readOnly : true,
				width : 180,
				fieldLabel : '金型担当',
				labelWidth : 60
			}, {
				xtype : 'textfield',
				id : 'date_inquire_est_start',
				readOnly : true,
				width : 180,
				fieldLabel : '开始日期',
				labelWidth : 60
			}, {
				xtype : 'textfield',
				id : 'date_inquire_est_finish',
				readOnly : true,
				width : 180,
				fieldLabel : '预计完成',
				labelWidth : 60
			}, {
				xtype : 'textfield',
				id : 'num_inquire_est_time',
				width : 180,
				fieldLabel : '预计用时',
				labelWidth : 60,
				readOnly : true
			}, {
				xtype : 'textfield',
				id : 'num_inquire_act_time',
				readOnly : true,
				width : 180,
				fieldLabel : '实际用时',
				labelWidth : 60
			}, {
				id : 'lbl_inquire_module_per',
				xtype : 'displayfield',
				width : 180,
				fieldLabel : '完成比',
				labelWidth : 60,
				value : '<div style = \'background:green;width:0%;font-weight:bold\'>0%<div>',
				fieldStyle : 'background:#FFF'
			} ]
		});

		self.callParent(arguments);
	}

});
Ext.define('Module.ModulePartProcessInfo', {
	extend : 'Ext.panel.Panel',
	title : '工件加工记录',
	layout : 'border',
	/**
	 * 新模或修模/设变
	 */
	onResumeModule : function(ctrl, nw) {
		var item = this;
		var chk = Ext.getCmp('mppi-chk-by-guest').getValue();
		item.up('gridpanel').getStore().load({
			url : 'public/getModuleResumeInfoByCase',
			params : {
				chk : chk,
				query : (item.isTxt ? nw : null),
				states : item.states
			}
		});
	},
	modulePlan : Ext.create('Module.ShowModuleInfo'),
	/**
	 * 将字体渲染为粗体
	 */
	renderFontBold : function(val) {
		return (val ? '<b>' + val + '</b>' : val);
	},
	initComponent : function() {
		var me = this;
		me.items = [ {
			xtype : 'panel',
			region : 'center',
			frame : true,
			title : '工件进度',
			layout : 'border',
			bodyPadding : 2,
			items : [
					{
						xtype : 'gridpanel',
						region : 'west',
						title : '模具工号',
						width : 305,
						frame : true,
						split : true,
						collapsible : true,
						rootVisible : false,
						forceFit : true,
						listeners : {
							itemclick : function(tree, record) {
								var config = {
									modulebarcode : record.get('modulebarcode'),
									style : 'yymmdd',
									format : 'yy/mm/dd',
									index : 0,
									chk : false,
									init : true
								};

								me.getReusmeInfo(config);
							}
						},
						store : Ext.create('Ext.data.Store',
								{
									fields : [ "endtime", "starttime", "modulebarcode", 'modulecode', "guestcode", "resumename", "resumestate",
											"text", "id" ],
									proxy : {
										url : '',
										type : 'ajax',
										reader : {
											type : 'json',
											root : 'children'
										}
									},
									autoLoad : true
								}),
						hideHeaders : true,
						columns : [ {
							text : '模具工号',
							dataIndex : 'modulecode',
							renderer : function(val, meta, record) {
								var _resumename = record.get('resumename');
								var _guestcode = record.get('guestcode');
								return '<b>' + val + (_guestcode ? ('/<font color = blue>' + _guestcode + '</font>') : '') + "<font color = red>["
										+ (!_resumename ? '完成' : _resumename) + ']</font></b>';
							}
						} ],
						tbar : [ {
							id : 'mppi-chk-by-guest',
							xtype : 'checkbox',
							boxLabel : '依番号'
						}, {
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
									text : '治具加工',
									isTxt : false,
									states : "['20409']",
									// isNew : false,
									iconCls : 'cog_go-16',
									parent : me,
									handler : me.onResumeModule
								}, {
									text : '量产加工',
									isTxt : false,
									states : "['20410']",
									// isNew : false,
									iconCls : 'wand-16',
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
					},
					{
						xtype : 'gridpanel',
						title : '零件加工明细',
						forceFit : true,
						region : 'center',
						store : Ext.create('Ext.data.Store', {
							id : 'mppi-store-part-info',
							fields : [ 'partlistcode', 'partbarlistcode', 'moduleresumeid', 'partname', 'regionname', 'statename', 'batchno',
									'craftname', 'craftcode', 'empname', 'actiontime', 'scher', 'remark', 'per', 'planbacktime' ],
							autoLoad : true
						}),
						tbar : [
								{
									id : 'mppi-combo-resume-id',
									xtype : 'combobox',
									queryMode : 'local',
									// fieldLabel : '模具履历',
									width : 120,
									labelWidth : 65,
									displayField : 'rcode',
									valueField : 'id',
									editable : false,
									store : Ext.create('Ext.data.Store', {
										id : 'mppi-store-resume-id',
										fields : [ 'id', 'modulebarcode', 'resumestate', 'resumename', 'starttime', 'endtime', 'processed',
												'deviser', 'installer', 'mrid', 'rcode', 'modulecode', 'guestcode' ],
										autoLoad : true
									}),
									listeners : {
										select : function(combo, record) {
											var config = {
												resumeid : combo.getValue(),
												style : 'yymmdd',
												format : 'yy/mm/dd',
												index : 0,
												chk : false,
												init : false
											};

											me.getReusmeInfo(config);
											// Ext.getCmp('mppi-module-resume-tip').update('XXX');
										}
									}
								}, {
									xtype : 'button',
									id : 'mppi-module-resume-tip',
									iconCls : 'information-16'
								} ],
						listeners : {
							itemdblclick : function(grid, record, item, index, e, eOpts) {
								var _partid = record.get('partbarlistcode');
								var _resumeid = record.get('moduleresumeid');

								Ext.Ajax.request({
									url : 'public/getWorkPartInformation',
									params : {
										partid : _partid,
										resumeid : _resumeid
									},
									method : 'POST',
									success : function(resp) {
										var json = Ext.JSON.decode(resp.responseText);
										if (json.length > 0) {
											new Module.WorkPartWindow({
												partid : _partid,
												resumeid : _resumeid,
												partinfo : json[0]
											}).show();
										} else {
											showError('查询不到工件的相关资料!');
										}
									},
									failure : function(x, y, z) {
										showError('加载工件资料失败!');
									}
								});
							}
						},
						columns : [ {
							text : '零件编号',
							width : 100,
							dataIndex : 'partlistcode',
							renderer : function(val, meta, record) {
								var remark = record.get('remark');
								if (remark) {
									val += ('<font color = blue>[' + remark + ']</font>');
								}

								return (val ? '<b>' + val + '</b>' : val);
							}
						}, {
							text : '生产排程',
							dataIndex : 'scher',
							width : 400,
							renderer : me.renderBoldFont
						}, {
							text : '工件状态',
							dataIndex : 'statename',
							renderer : me.renderBoldFont
						}, {
							xtype : 'gridcolumn',
							dataIndex : 'planbacktime',
							text : '外发回厂时间',
							width : 100,
							renderer : me.renderBoldFont
						}, {
							text : '所在单位',
							dataIndex : 'regionname',
							renderer : function(val) {
								return (val ? ('<b>' + val + '</b>') : '<b><font color =red>未接收</font></b>');
							}
						}, {
							text : '所在机台',
							dataIndex : 'batchno',
							renderer : function(val) {
								return (val ? ('<b>' + val + '</b>') : '<b><font color =red>未上机</font></b>');
							}
						}, {
							text : '加工工艺',
							dataIndex : 'craftname',
							width : 170,
							renderer : function(val, meta, record) {
								var _craftcode = record.get('craftcode');
								return val ? ('<b>' + val + (_craftcode ? ('[' + _craftcode + ']') : '') + '</b>') : val;
							}
						}, {
							text : '操作人员',
							dataIndex : 'empname',
							renderer : me.renderBoldFont
						}, {
							text : '完成进度',
							dataIndex : 'per',
							renderer : me.scheduleProgressBar
						}, {
							text : '操作时间',
							dataIndex : 'actiontime',
							width : 200,
							renderer : function(val, meta, record) {
								var _statename = record.get('statename');
								return ((_statename && val) ? '<b>' + val + '</b>' : '');
							}
						} ]
					} ]
		} ];

		// 將所有參數處理并Show出界面
		me.callParent(arguments);
	},
	getReusmeInfo : function(config) {
		Ext.Ajax.request({
			url : 'public/getModuleResumePartInfo',
			params : config,
			method : 'POST',
			success : function(resp) {
				var backJson = Ext.JSON.decode(resp.responseText);

				if (backJson.success) {
					Ext.getStore('mppi-store-part-info').loadData(backJson.queryList);

					var fristR = backJson.resumeList[0];
					if (config.init) {
						var combo = Ext.getCmp('mppi-combo-resume-id');

						combo.getStore().loadData(backJson.resumeList);
						combo.setValue(fristR.id);
					}

					function parseNull(val) {
						return val ? val : '---';
					}

					var tips = '<table style = "font-size:10px">' + '<tr><td style = "width:180px;height:20px"><b>模具编号</b>:'
							+ parseNull(fristR.modulecode) + '</td><td style = "width:180px"><b>客户番号</b>:' + parseNull(fristR.guestcode)
							+ '</td><td style = "width:180px"><b>模具履历</b>:' + parseNull(fristR.rcode) + '</td></tr>'
							+ '<tr><td style = "height:20px"><b>预计开始</b>:' + parseNull(fristR.starttime) + '</td><td><b>预计结束</b>:'
							+ parseNull(fristR.endtime) + '</td><td><b>加工完成</b>:' + parseNull(fristR.processed) + '</td></tr>'
							+ '<tr><td style = "height:20px"><b>组立完成</b>:' + parseNull(fristR.finishtime) + '</td><td><b>设计担当</b>:'
							+ parseNull(fristR.deviser) + '</td><td><b>组立担当</b>:' + parseNull(fristR.installer) + '</td></tr>' + '</table>';
					Ext.getCmp('mppi-module-resume-tip').setTooltip({
						text : tips,
						dismissDelay : 15000
					});
				} else {
					showError(backJson.msg);
				}
			},
			failure : function(x, y, z) {
				showError('连接服务器失败!');
			}
		});
	},
	renderBoldFont : function(val) {
		return val ? '<b>' + val + '</b>' : val;
	},
	parseFloatString : function(x) {
		if (isNaN(x)) {
			return 0;
		}

		try {
			return parseFloat(x);
		} catch (ex) {
			return 0;
		}
	},
	mathRound : function(num, pre) {
		var pos = Math.pow(10, pre);
		return Math.round(pos * num) / pos;
	},
	renderProgressBar : function(est, act) {
		var mine = this;
		var per = mine.parseFloatString(est) ? mine.mathRound(mine.parseFloatString(act) / mine.parseFloatString(est) * 100, 1) : 0;
		var bar = '<div style = \'background:' + (per > 100 ? '#d9534f' : '#5cb85c') + ';width:' + (per > 100 ? 100 : per) + '%;font-weight:bold\'>'
				+ per + '%<div>';
		return bar;
	}
});