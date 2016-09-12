Ext.define('Task', {
	extend : 'Ext.data.Model',
	idProperty : 'taskId',
	fields : [ {
		name : 'sid',
		type : 'string'
	}, {
		name : 'partlistcode',
		type : 'string'
	}, {
		name : 'craftname',
		type : 'string'
	}, {
		name : 'starttime',
		type : 'string'
	}, {
		name : 'craftfee',
		type : 'float'
	}, {
		name : 'esthour',
		type : 'float'
	}, {
		name : 'acthour',
		type : 'float'
	}, {
		name : 'profee',
		type : 'float'
	}, {
		name : 'typeid',
		type : 'int'
	}, {
		name : 'isenable',
		type : 'int'
	}, {
		name : 'craftid',
		type : 'string'
	}, {
		name : 'estfee',
		type : 'float'
	} ]
});

Ext.define('TotalFee', {
	extend : 'Ext.data.Model',
	idProperty : 'craftid',
	fields : [ {
		name : 'flag',
		type : 'string'
	}, {
		name : 'craftid',
		type : 'string'
	}, {
		name : 'craftname',
		type : 'string'
	}, {
		name : 'craftfee',
		type : 'float'
	}, {
		name : 'esthour',
		type : 'float'
	}, {
		name : 'totalhour',
		type : 'float'
	}, {
		name : 'totalfee',
		type : 'float'
	}, {
		name : 'estfee',
		type : 'float'
	}, {
		name : 'ruinfee',
		type : 'float'
	} ]
});

Ext.define('Module.ShowProcessFee', {
	extend : 'Ext.window.Window',
	width : 700,
	height : 450,
	layout : 'border',
	modal : true,
	title : '模具成本汇总',
	initData : [],
	initComponent : function() {
		var self = this;
		self.items = [ Ext.create('Ext.grid.Panel', {
			id : 'pmc-grid-sum-fee',
			region : 'center',
			border : false,
			header : false,
			rowLines : true,
			forceFit : true,
			iconCls : 'icon-grid',
			store : Ext.create('Ext.data.Store', {
				id : 'pmc-store-sum-fee',
				model : 'TotalFee',
				groupField : 'flag',
				data : this.initData
			}),
			selModel : {
				selType : 'rowmodel'
			},
			features : [ {
				id : 'totalview',
				ftype : 'groupingsummary',
				groupHeaderTpl : '{name}',
				hideGroupedHeader : true,
				enableGroupingMenu : false
			} ],
			columns : [ {
				header : '<b>工艺名称</b>',
				width : 130,
				dataIndex : 'craftname',
				summaryType : 'count',
				summaryRenderer : function(value, summaryData, dataIndex) {
					return ((value === 0 || value > 1) ? '<b>(共' + value + '个工艺)</b>' : '<b>(共1个工艺)</b>');
				},
				renderer : self.renderBoldFont
			}, {
				header : '<b>工艺费用/时</b>',
				width : 100,
				dataIndex : 'craftfee',
				renderer : self.renderBoldFont
			}, {
				header : '<b>预计用时</b>',
				width : 100,
				groupable : false,
				dataIndex : 'esthour',
				renderer : self.renderBoldFont,
				summaryType : 'sum',
				summaryRenderer : function(value, summaryData, dataIndex) {
					return '<b>' + self.getRoundNumber(value, 1) + '</b>';
				}
			}, {
				header : '<b>实际用时</b>',
				width : 100,
				groupable : false,
				dataIndex : 'totalhour',
				renderer : self.renderBoldFont,
				summaryType : 'sum',
				summaryRenderer : function(value, summaryData, dataIndex) {
					return '<b>' + self.getRoundNumber(value, 1) + '</b>';
				}
			}, {
				header : '<b>预计费用</b>',
				width : 100,
				groupable : false,
				dataIndex : 'estfee',
				renderer : self.renderBoldFont,
				summaryType : 'sum',
				summaryRenderer : function(value, summaryData, dataIndex) {
					return '<b>' + self.getRoundNumber(value, 1) + '</b>';
				}
			}, {
				header : '<b>加工费用</b>',
				width : 100,
				groupable : false,
				dataIndex : 'totalfee',
				renderer : self.renderBoldFont,
				summaryType : 'sum',
				summaryRenderer : function(value, summaryData, dataIndex) {
					return '<b>' + self.getRoundNumber(value, 1) + '</b>';
				}
			}, {
				header : '<b>报废费用</b>',
				width : 100,
				groupable : false,
				dataIndex : 'ruinfee',
				renderer : self.renderBoldFont,
				summaryType : 'sum',
				summaryRenderer : function(value, summaryData, dataIndex) {
					return '<b>' + self.getRoundNumber(value, 1) + '</b>';
				}
			} ]
		}) ];
		self.callParent(arguments);
	},
	renderBoldFont : function(val) {
		return (val ? '<b>' + val + '</b>' : val);
	},
	getRoundNumber : function(num, pre) {
		var base = Math.pow(10, pre);
		return Math.round(num * base) / base;
	},
});

Ext.define('Module.ProcessModuleCost', {
	extend : 'Ext.panel.Panel',
	title : '加工成本',
	layout : 'border',
	require : [ 'Ext.grid.*', 'Ext.data.*', 'Ext.form.field.Number', 'Ext.form.field.Date', 'Ext.tip.QuickTipManager', 'Ext.layout.container.Fit' ],
	initComponent : function() {
		var me = this;
		me.items = [
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
							// 重新加载模具的履历
							var resumeCtrl = Ext.getCmp('pmc-combo-resume-select');
							resumeCtrl.getStore().load({
								url : 'module/inquire/getModuleResumeInfo',
								params : {
									modulebarcode : record.get('modulebarcode')
								},
								callback : function(records, operation, success) {
									if (success) {
										if (records.length) {
											var s_resumeid = records[0].get('resumeid');
											resumeCtrl.setValue(s_resumeid);
											Ext.getCmp('pmc-txt-module-code').setValue(record.get('modulecode'));
											Ext.getStore('pmc-store-process-fee').load({
												url : 'module/inquire/getModuleProcessCost',
												params : {
													resumeid : s_resumeid
												},
												callback : function(s_rcd, s_oper, success) {
													if (success) {
														me.collapseSummaryGrid('pmc-grid-total-fee', 'group');
													}
												}
											});
										}
									}
								}
							});

							resumeCtrl.setValue(Ext.emptyString);
						}
					},
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
						}
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
						id : 'pmc-chk-by-guest',
						xtype : 'checkbox',
						boxLabel : '依番号'
					}, ''
					// , Ext.create('Module.ModuleFindTextField', {
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
				}, Ext.create('Ext.grid.Panel', {
					id : 'pmc-grid-total-fee',
					region : 'center',
					rowLines : true,
					title : '加工成本',
					iconCls : 'icon-grid',
					store : Ext.create('Ext.data.Store', {
						id : 'pmc-store-process-fee',
						model : 'Task',
						groupField : 'partlistcode',
						data : []
					}),
					selModel : {
						selType : 'rowmodel'
					},
					dockedItems : [ {
						dock : 'top',
						xtype : 'toolbar',
						items : [ {
							id : 'pmc-txt-module-code',
							xtype : 'textfield',
							fieldLabel : '当前模具',
							labelWidth : 65,
							readOnly : true
						}, '-', {
							id : 'pmc-combo-resume-select',
							xtype : 'combobox',
							fieldLabel : '选择履历',
							labelWidth : 65,
							displayField : 'resumename',
							valueField : 'resumeid',
							editable : false,
							listeners : {
								select : function(combo, record) {
									Ext.getStore('pmc-store-process-fee').load({
										url : 'module/inquire/getModuleProcessCost',
										params : {
											resumeid : record[0].get('resumeid')
										},
										callback : function(s_rcd, s_oper, success) {
											if (success) {
												me.collapseSummaryGrid('pmc-grid-total-fee', 'group');
											}
										}
									});
								}
							},
							store : Ext.create('Ext.data.Store', {
								fields : [ 'resumeid', 'resumename' ],
								autoLoad : true,
								proxy : {
									url : '',
									type : 'ajax',
									reader : {
										type : 'json'
									}
								}
							})
						}, '->', {
							text : '查看模具费用',
							iconCls : 'search-16',
							handler : function() {
								var validateRow = me.sumProcessFee();
								if (!validateRow.length) {
									showInfo('没有该模具履历的加工讯息!');
									return;
								}
								Ext.create('Module.ShowProcessFee', {
									initData : validateRow
								}).show();
							}
						} ]
					} ],
					features : [ {
						id : 'group',
						ftype : 'groupingsummary',
						groupHeaderTpl : '{name}',
						hideGroupedHeader : true,
						enableGroupingMenu : false
					} ],
					columns : [ {
						text : '工件编号',
						width : 300,
						locked : true,
						tdCls : 'task',
						dataIndex : 'partlistcode',
						hideable : false
					}, {
						header : '<b>工件/排程编号</b>',
						width : 180,
						// sortable : true,
						dataIndex : 'sid',
						summaryType : 'count',
						summaryRenderer : function(value, summaryData, dataIndex) {
							return ((value === 0 || value > 1) ? '<b>(' + value + '个排程)</b>' : '<b>(共1个排程)</b>');
						}
					}, {
						header : '<b>排程类型</b>',
						width : 130,
						dataIndex : 'typeid',
						renderer : function(val) {
							return (val == '0' ? '预计排程' : '临时排程');
						}
					}, {
						header : '<b>工艺名称</b>',
						width : 130,
						dataIndex : 'craftname',
					}, {
						header : '<b>工艺费用/时</b>',
						width : 100,
						dataIndex : 'craftfee',
					}, {
						header : '<b>预计用时</b>',
						width : 100,
						// sortable : true,
						dataIndex : 'esthour',
						summaryType : 'sum',
						renderer : function(value, metaData, record, rowIdx, colIdx, store, view) {
							return value + ' 时';
						},
						summaryRenderer : function(value, summaryData, dataIndex) {
							return me.getRoundNumber(value, 1) + ' 时';
						}
					}, {
						header : '<b>实际用时</b>',
						width : 100,
						// sortable : true,
						dataIndex : 'acthour',
						summaryType : 'sum',
						renderer : function(value, metaData, record, rowIdx, colIdx, store, view) {
							return value + ' 时';
						},
						summaryRenderer : function(value, summaryData, dataIndex) {
							return me.getRoundNumber(value, 1) + ' 时';
						}
					}, {
						header : '<b>预计费用</b>',
						width : 100,
						// sortable : false,
						groupable : false,
						dataIndex : 'estfee',
						summaryType : 'sum',
						summaryRenderer : function(value, summaryData, dataIndex) {
							return me.getRoundNumber(value, 1);
						}
					}, {
						header : '<b>加工费用</b>',
						width : 100,
						// sortable : false,
						groupable : false,
						dataIndex : 'profee',
						// renderer : function(value, metaData, record) {
						// var craftid = record.get('craftid');
						// var val = (craftid == '11207' ? 0 : value);
						// record.set('craftid', val);
						// return val;
						// },
						summaryType : 'sum',
						summaryRenderer : function(value, summaryData, dataIndex) {
							return me.getRoundNumber(value, 1);
						}
					} ]
				}) ];

		me.callParent(arguments);
	},
	getProcessFee : function(record) {
		if (record.get('craftfee') && record.get('acthour')) {
			return record.get('craftfee') * record.get('acthour');
		} else {
			return 0;
		}
	},
	/**
	 * 折叠汇总表的数据
	 * 
	 * @param gridname
	 * @param itemid
	 */
	collapseSummaryGrid : function(gridname, itemid) {
		Ext.getCmp(gridname).lockedGrid.getView().getFeature(itemid).collapseAll();
	},
	/**
	 * 展开汇总表的数据
	 * 
	 * @param gridname
	 * @param itemid
	 */
	expandSummaryGrid : function(gridname, itemid) {
		Ext.getCmp(gridname).lockedGrid.getView().getFeature(itemid).expandAll();
	},
	/**
	 * 獲取Round后的數據
	 * 
	 * @param num
	 * @param pre
	 * @returns {Number}
	 */
	getRoundNumber : function(num, pre) {
		var base = Math.pow(10, pre);
		return Math.round(num * base) / base;
	},
	/**
	 * 新模或修模/设变
	 */
	onResumeModule : function(ctrl, nw) {
		var item = this;
		var chk = Ext.getCmp('pmc-chk-by-guest').getValue();
		item.up('gridpanel').getStore().load({
			url : 'public/getModuleResumeInfoByCase',
			params : {
				chk : chk,
				query : (item.isTxt ? nw : null),
				states : item.states
			}
		});
	},
	sumProcessFee : function() {
		var store = Ext.getCmp('pmc-grid-total-fee').getStore();
		if (!store.getCount()) {
			return [];
		}

		var craftInfo = [];
		store.each(function(record) {
			var m_craftid = record.get('craftid');
			var m_craftname = record.get('craftname');
			var m_craftfee = record.get('craftfee');
			var m_total = record.get('profee');
			var m_acthour = record.get('acthour');
			var m_esthour = record.get('esthour');
			// 预计费用
			var m_estfee = record.get('estfee');
			// 是否报废的标志
			var m_ruin = record.get('isenable');

			var z_flag = false;
			for ( var x in craftInfo) {
				if (craftInfo[x].craftid == m_craftid) {
					craftInfo[x].totalfee += m_total;
					craftInfo[x].totalhour += m_acthour;
					craftInfo[x].estfee += m_estfee;
					craftInfo[x].esthour += m_esthour;

					if (m_ruin) {
						craftInfo[x].ruinfee += m_total;
					}

					z_flag = true;

					break;
				}
			}

			if (!z_flag) {
				craftInfo.push({
					flag : '所有工艺',
					craftid : m_craftid,
					craftname : m_craftname,
					craftfee : m_craftfee,
					totalhour : m_acthour,
					totalfee : m_total,
					estfee : m_estfee,
					esthour : m_esthour,
					ruinfee : m_ruin ? m_total : 0
				});
			}
		});

		var _major = this;
		var notNullCraft = [];
		for ( var m in craftInfo) {
			if (craftInfo[m].totalhour || craftInfo[m].estfee) {

				craftInfo[m].totalfee = _major.getRoundNumber(craftInfo[m].totalfee, 1);
				craftInfo[m].totalhour = _major.getRoundNumber(craftInfo[m].totalhour, 1);
				craftInfo[m].esthour = _major.getRoundNumber(craftInfo[m].esthour, 1);
				craftInfo[m].estfee = _major.getRoundNumber(craftInfo[m].estfee, 1);
				craftInfo[m].ruinfee = _major.getRoundNumber(craftInfo[m].ruinfee, 1);

				notNullCraft.push(craftInfo[m]);
			}
		}

		return notNullCraft;
	}
});