/**
 * 加工单位所有工件清单
 */
Ext.define('Module.ModulePartDetailed', {
	extend : 'Ext.panel.Panel',
	layout : {
		type : 'border'
	},
	region : 'center',
	title : '工件清单',
	bodyPadding : 2,

	deptPartFields : [ "batchno", "craftname", "partbarlistcode", "moduleresumeid", "evaluate", "empname", "infoid", "macstate", "partlistcode",
			"partstate", "endtime", "starttime" ],

	moduleInfoFields : [ {
		name : "endtime",
		type : 'date'
	}, "resumestate", "curestate", "plastic", {
		name : "starttime",
		type : 'date'
	}, "remark", "guestname", "modulecode", "unitextrac", "guestid", "id", "executive", "moduleintro", "modulestate", "workpressure", "takeon",
			"moduleclass", "modulebarcode", "pictureurl", "resumeempid", "productname", "moduleresumeid", "detector", 'designer' ],

	initComponent : function() {
		var me = this;

		me.moduleStore = Ext.create('Ext.data.Store', {
			fields : me.moduleInfoFields,
			autoLoad : true,
			proxy : {
				url : 'module/process/groupModuleInfo?flag=false',
				// 自动导入工号
				type : 'ajax',
				reader : {
					type : 'json',
					root : 'info'
				}
			}
		});

		me.partListStore = Ext.create('Ext.data.Store', {
			fields : me.deptPartFields,
			proxy : {
				type : 'ajax',
				url : 'module/process/groupPartListInfo',
				reader : {
					type : 'json',
					root : 'info'
				}
			},
			listeners : {
				load : function(store, records, successful, eOpts) {
					if (!records) {
						store.loadData([]);
					}
				}
			}
		});

		Ext.applyIf(me, {
			items : [ {
				xtype : 'tabpanel',
				region : 'center',
				// tabPosition : 'left',
				activeTab : 0,
				items : [ {
					xtype : 'panel',
					layout : {
						type : 'border'
					},
					title : '在制工件',
					bodyPadding : 2,
					items : [ {
						xtype : 'container',
						layout : 'border',
						region : 'west',
						width : 220,
						split : true,
						items : [ {

							xtype : 'gridpanel',
							id : 'dept-module-number-grid',
							region : 'north',
							title : '模具工号',
							forceFit : true,
							style : {
								marginBottom : 5
							},
							flex : 1,
							store : me.moduleStore,

							dockedItems : [ {
								xtype : 'toolbar',
								dock : 'top',
								items : [ {
									text : '刷新',
									iconCls : 'view-refresh-16',
									handler : function() {
										this.up('gridpanel').getStore().load();
										Ext.getCmp('part-detailed-module-propertygrid').setSource({});
									}
								}, '-', Ext.create('Project.component.FilterTextField', {
									emptyText : '查找工号...',
									filterField : 'modulecode',
									width : 150,
									store : me.moduleStore
								}) ]
							} ],
							header : false,
							columns : [ {
								xtype : 'gridcolumn',
								width : 160,
								dataIndex : 'modulecode',
								text : '模具工号'
							} ],

							listeners : {
								itemclick : me.onModuleItemClick
							}
						}, {
							xtype : 'propertygrid',
							id : 'part-detailed-module-propertygrid',
							nameColumnWidth : 70,
							sortableColumns : false,
							title : '模具信息',
							hideHeaders : true,
							region : 'center',
							flex : 1,
							source : {}
						} ]

					}, {
						xtype : 'container',
						layout : 'border',
						region : 'center',

						items : [ {
							xtype : 'gridpanel',
							id : 'part-detailed-gridpanel-id',
							region : 'center',
							flex : 1.4,
							title : '清单',
							columnLines : true,
							selModel : Ext.create('Ext.selection.CheckboxModel', {
								mode : 'SIMPLE'
							}),
							store : me.partListStore,
							columns : [ {
								xtype : 'rownumberer',
								width : 30
							}, {
								xtype : 'gridcolumn',
								width : 100,
								dataIndex : 'partlistcode',
								text : '部号',
								items : [ Ext.create('Project.component.FilterTextField', {
									emptyText : '查找工件...',
									filterField : "partlistcode",
									store : me.partListStore
								}) ]
							}, {
								xtype : 'gridcolumn',
								width : 80,
								dataIndex : 'craftname',
								text : '工艺'
							}, {
								xtype : 'gridcolumn',
								width : 80,
								dataIndex : 'empname',
								text : '加工者'
							}, {
								xtype : 'gridcolumn',
								width : 50,
								dataIndex : 'batchno',
								text : '机台号'
							}, {
								xtype : 'gridcolumn',
								width : 60,
								dataIndex : 'macstate',
								text : '机台状态'
							}, {
								xtype : 'gridcolumn',
								width : 60,
								dataIndex : 'partstate',
								text : '工件状态'
							} ],
							dockedItems : [ {
								xtype : 'toolbar',
								dock : 'bottom',
								items : [ {
									xtype : 'combobox',
									id : 'module-assemble',
									fieldLabel : '组立别',
									style : 'margin-left:10px;',
									labelWidth : 45,
									editable : false,
									displayField : 'deptname',
									valueField : 'deptid',
									store : new Ext.data.Store({
										fields : [ 'deptid', 'deptname' ],
										proxy : {
											url : 'public/queryModuleAssemble',
											type : 'ajax',
											reader : {
												type : 'json'
											}
										},
										autoLoad : true
									}),
									listConfig : {
										getInnerTpl : function() {
											return '<a class="search-item"><span style = \'font-weight:bold\'>{deptname}</span></a>';
										}
									}
								}, '-', {
									text : '完工送出',
									iconCls : 'lorry-16',
									handler : me.sendPartToAssemble
								} ]
							} ],
							listeners : {
								itemdblclick : me.onClickPartGantt
							}
						}, {
							xtype : 'gridpanel',
							region : 'south',
							flex : 1,
							margins : '5 0 0 0',
							title : '加工历史',
							columns : [ Ext.create('Ext.grid.RowNumberer'), {
								xtype : 'gridcolumn',
								width : 80,
								dataIndex : 'modulecode',
								text : '模具工号'
							}, {
								xtype : 'numbercolumn',
								width : 60,
								dataIndex : 'number',
								text : '部号'
							}, {
								xtype : 'datecolumn',
								width : 100,
								defaultWidth : 80,
								dataIndex : 'date',
								text : '签收日期'
							}, {
								xtype : 'datecolumn',
								dataIndex : 'bool',
								text : '预计开工时间'
							}, {
								xtype : 'datecolumn',
								text : '预计完工时间'
							}, {
								xtype : 'gridcolumn',
								width : 80,
								text : '工件类型'
							}, {
								xtype : 'gridcolumn',
								width : 60,
								text : '工件状态'
							} ]
						} ]
					} ]
				}, {
					xtype : 'panel',
					layout : {
						type : 'border'
					},
					title : '本单位要加工的工件',
					bodyPadding : 2,

					items : [ {
						xtype : 'treepanel',
						region : 'west',
						split : true,
						width : 150,
						collapsible : true,
						title : '模具工号',
						viewConfig : {

						}
					}, {
						xtype : 'gridpanel',
						region : 'center',
						title : '当前工件状态',
						columns : [ {
							xtype : 'rownumberer',
							width : 20
						}, {
							xtype : 'gridcolumn',
							width : 80,
							dataIndex : 'string',
							text : '模具工号'
						}, {
							xtype : 'gridcolumn',
							width : 60,
							dataIndex : 'number',
							text : '部号'
						}, {
							xtype : 'gridcolumn',
							width : 80,
							dataIndex : 'date',
							text : '当前单位'
						}, {
							xtype : 'gridcolumn',
							width : 73,
							dataIndex : 'bool',
							text : '当前工艺'
						}, {
							xtype : 'gridcolumn',
							text : '开工时间'
						}, {
							xtype : 'gridcolumn',
							text : '本单位工艺'
						}, {
							xtype : 'gridcolumn',
							text : '状态'
						} ]
					} ]
				} ]
			} ]
		});
		me.callParent(arguments);
	},

	/**
	 * 双击工件查看工件排程
	 */
	onClickPartGantt : function(grid, record) {
		var url = 'module/schedule/craftPlanGantt?mes.partId=' + record.get("partbarlistcode") + '&mes.moduleResumeId='
				+ record.get("moduleresumeid");

		var gantt = Ext.create('Module.ModulePartDetailedGantt', {
			region : 'center',
			border : false,
			taskStore : Ext.create("Gnt.data.TaskStore", {
				model : 'ModulePartScheduleModel',
				proxy : {
					type : 'ajax',
					url : url,
					reader : {
						type : 'json',
						root : 'gantt'
					}
				},
				rootVisible : false,
				listeners : {
					load : function(store, records, successful) {
						if (records && records.length > 0) {
							gantt.zoomToFit();
						}
					}
				}
			}),
			columnLines : true,
			rowLines : true,
			viewPreset : 'weekAndDayLetter'
		});

		Ext.create('Ext.window.Window', {
			modal : true,
			width : 840,
			height : 500,
			layout : 'border',
			title : '<span style="color:#CD5555">(' + record.get("partlistcode") + ')排程</span>',
			items : [ gantt ]
		}).show();

	},

	/**
	 * 工号点击事件，得到在本单位工件
	 */
	onModuleItemClick : function(grid, record, item, index, e, eOpts) {

		var dom = Ext.getCmp("part-detailed-gridpanel-id");
		var partStore = dom.getStore();

		dom.setTitle(record.data.modulecode + ' 清单<span style="color:#A51212;">(双击工件可以查看排程)</span>');

		if (partStore.isFiltered()) {
			partStore.clearFilter();
		}

		partStore.load({
			url : partStore.proxy.url,
			params : {
				moduleResumeId : record.data.moduleresumeid
			}
		});
		
		var pro = Ext.getCmp('part-detailed-module-propertygrid');
		pro.setSource({
			"<span style='font-weight: bold;'>客户</span>" : record.get("guestname"),
			"<span style='font-weight: bold;'>模具工号</span>" : record.get("modulecode"),
			"<span style='font-weight: bold;'>业务担当</span>" : record.get("detector"),
			"<span style='font-weight: bold;'>金型担当</span>" : record.get("executive"),
			"<span style='font-weight: bold;'>设计担当</span>" : record.get('designer'),
			"<span style='font-weight: bold;'>成形吨位</span>" : record.get("workpressure"),
			"<span style='font-weight: bold;'>产品名称</span>" : record.get("productname"),
			"<span style='font-weight: bold;'>产品材质</span>" : record.get("plastic"),
			"<span style='font-weight: bold;'>机种</span>" : record.get("moduleclass"),
			"<span style='font-weight: bold;'>开始时间</span>" : Ext.Date.format(record.get("starttime"), 'Y-m-d'),
			"<span style='font-weight: bold;'>完成时间</span>" : Ext.Date.format(record.get("endtime"), 'Y-m-d'),
			"<span style='font-weight: bold;'>取数</span>" : record.get("unitextrac")
		});

	},

	/**
	 * 得到在当前单位的工件信息
	 */
	selectDeptParts : function(me, store) {

		var show = new Ext.LoadMask(Ext.getCmp('part-detailed-gridpanel-id').getView(), {
			msg : "工件清单加载中..."
		});
		show.show();

		Ext.Ajax.request({
			url : 'module/process/deptPartDetailed',
			params : {
				'partDetailed.moduleBarcode' : me.moduleBarcode,
				'partDetailed.resumeId' : me.resumeId,
				'partDetailed.craftId' : me.craftId
			},
			success : function(response) {
				var res = JSON.parse(response.responseText);

				App.InterPath(res, function() {
					if (res.success) {
						store.loadData(res.detailed);
					} else {
						Fly.msg('清单', res.message);
					}
				});
				show.hide();
			},
			failure : function(response, opts) {
				App.Error(response);
				show.hide();
			}
		});
	},

	/**
	 * 将工件送到组立
	 */
	sendPartToAssemble : function() {
		var models = Ext.getCmp("part-detailed-gridpanel-id").getSelectionModel().getSelection();

		if (models.length == 0) {
			showInfo("请选择要送到组立的工件!");
			return;
		}

		var assemble = Ext.getCmp("module-assemble").getValue();

		if (!assemble) {
			showInfo("请选择要送到组立的组别!");
			return;
		}

		var sendParts = {
			partList : [],
			assembleId : assemble,
			assembleName : Ext.getCmp("module-assemble").getName()
		};

		Ext.MessageBox.confirm('送出', '确认选定的工件送组立?', function(btn) {
			if (btn == 'yes') {

				Ext.Array.forEach(models, function(model) {
					sendParts.partList.push({
						id : model.data.infoid
					});
				});

				Ext.Ajax.request({
					url : 'module/process/sendPartToAssemble',
					params : {
						sendParts : Ext.JSON.encode(sendParts)
					},
					success : function(response) {
						var res = JSON.parse(response.responseText);

						App.InterPath(res, function() {
							if (res.success) {
								var grid = Ext.getCmp("dept-module-number-grid");
								grid.fireEventArgs("itemclick", [ grid, grid.getSelectionModel().getSelection()[0] ]);
								showSuccess(res.msg);
							} else {
								showError(models.length + "个工件签收失败,请再试一次!");
							}
						});
					},
					failure : function(response, opts) {
						App.Error(response);
					}
				});
			}
		});
	}
});