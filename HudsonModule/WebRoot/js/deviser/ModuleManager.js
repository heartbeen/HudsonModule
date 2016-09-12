function addDesignSchedule() {
	var craftid = this.craftid;
	var stateid = this.stateid;
	var resumeid = this.up('window').resumeid;
	Ext.Ajax.request({
		url : 'module/devise/addDesignScheduleInfo',
		method : 'POST',
		params : {
			resumeid : resumeid,
			craftid : craftid,
			stateid : stateid
		},
		success : function(resp) {
			var backJson = Ext.JSON.decode(resp.responseText);
			if (backJson.success) {
				Ext.getStore('mm-sche-info-store').reload();
				showSuccess('添加计划制程成功');
			} else {
				showError(backJson.msg);
			}
		},
		failure : function() {
			showError('连接服务器失败');
		}
	});
}
function initCraftList(resumeid) {
	var panel = Ext.getCmp('mm-craft-list-panel');
	if (panel.items.length) {
		panel.removeAll();
	}
	Ext.Ajax.request({
		url : 'devise/share/getCrafInfoByKind?kind=0',
		method : 'POST',
		success : function(resp) {
			var backJson = Ext.JSON.decode(resp.responseText);
			if (backJson.length) {
				for ( var m in backJson) {
					panel.add({
						xtype : 'button',
						craftid : backJson[m].id,
						stateid : backJson[m].stateid,
						resumeid : resumeid,
						text : backJson[m].craftname,
						iconCls : 'vector_add-16',
						padding : 5,
						handler : addDesignSchedule
					});
				}
			}
		},
		failure : function(x, y, z) {
			showError('连接服务器失败');
		}
	});
};

Ext.define('DesignCraftManager', {
	extend : 'Ext.window.Window',

	height : 500,
	width : 400,
	modal : true,
	layout : {
		type : 'border'
	},
	bodyPadding : 3,
	title : '制程管理',
	resizable : false,

	initComponent : function() {
		var me = this;

		Ext.applyIf(me, {
			items : [ {
				id : 'mm-craft-info-form',
				xtype : 'form',
				region : 'south',
				height : 230,
				split : true,
				bodyPadding : 10,
				title : '制程明细',
				bbar : [ '->', {
					text : '保存更新',
					iconCls : 'disk-16',
					handler : function() {
						this.up('form').submit({
							url : 'module/devise/manageCraftInfo',
							params : {
								kind : 0,
								scrapped : 0
							},
							success : function(form, action) {
								// 制程表更新
								Ext.getStore('mm-craft-info-store').reload();
								// 制程计划表更新
								Ext.getStore('mm-sche-info-store').reload();
								// 将FORM表重置
								form.reset();
								// 更新制程面板
								initCraftList();
							},
							failure : function(form, action) {
								var backJson = Ext.JSON.decode(action.response.responseText);
								showError(backJson.msg);
							}
						});
					}
				} ],
				items : [ {
					name : 'id',
					xtype : 'textfield',
					anchor : '100%',
					fieldLabel : '制程ID',
					labelWidth : 70
				}, {
					name : 'craftcode',
					xtype : 'textfield',
					anchor : '100%',
					fieldLabel : '制程代号',
					regex : /^[a-zA-Z]{1,3}$/,
					labelWidth : 70
				}, {
					name : 'craftname',
					xtype : 'textfield',
					anchor : '100%',
					fieldLabel : '制程名称',
					labelWidth : 70,
					maxLength : 10
				}, {
					name : 'stateid',
					xtype : 'combobox',
					valueField : 'id',
					displayField : 'name',
					store : Ext.create('Ext.data.Store', {
						fields : [ 'id', 'name' ],
						proxy : {
							url : 'devise/share/getStateInfoByKind?kind=2',
							type : 'ajax',
							reader : {
								type : 'json'
							}
						},
						autoLoad : true
					}),
					anchor : '100%',
					editable : false,
					fieldLabel : '默认状态',
					labelWidth : 70
				}, {
					name : 'unitcost',
					xtype : 'numberfield',
					anchor : '100%',
					fieldLabel : '单位费用',
					labelWidth : 70,
					value : 0,
					minValue : 0,
					maxValue : 1000,
					allowDecimals : true,
					decimalPrecision : 1
				} ]
			}, {
				xtype : 'gridpanel',
				region : 'center',
				forceFit : true,
				title : '制程列表',
				store : Ext.create('Ext.data.Store', {
					id : 'mm-craft-info-store',
					fields : [ 'id', 'craftname', 'craftcode', 'unitcost', 'stateid', 'statename' ],
					autoLoad : true,
					proxy : {
						url : 'devise/share/getCrafInfoByKind?kind=0',
						type : 'ajax',
						reader : {
							type : 'json'
						}
					}
				}),
				columns : [ {
					xtype : 'gridcolumn',
					dataIndex : 'craftname',
					text : '制程名称'
				}, {
					xtype : 'gridcolumn',
					dataIndex : 'craftcode',
					text : '制程代码'
				}, {
					xtype : 'gridcolumn',
					dataIndex : 'statename',
					text : '制程状态'
				}, {
					xtype : 'gridcolumn',
					dataIndex : 'unitcost',
					text : '单位费用',
					width : 70
				}, {
					xtype : 'actioncolumn',
					width : 40,
					items : [ {
						iconCls : 'gtk-delete-16',
						tooltip : '删除',
						handler : function(grid, rowIndex, colIndex) {
							var rec = grid.getStore().getAt(rowIndex);
							Ext.Ajax.request({
								url : 'module/devise/scrapCraftInfo',
								params : {
									id : rec.get('id')
								},
								success : function(resp) {
									var backJson = Ext.JSON.decode(resp.responseText);
									if (backJson.success) {
										grid.getStore().reload();
										Ext.getCmp('mm-craft-info-form').getForm().reset();
										initCraftList();
									} else {
										showError(backJson.msg);
									}
								},
								failure : function(x, y, z) {
									showError('连接服务器失败');
								}
							});
						}
					} ]
				} ],
				listeners : {
					itemdblclick : function(grid, record) {
						Ext.getCmp('mm-craft-info-form').loadRecord(record);
					}
				}
			} ]
		});

		me.callParent(arguments);
	}

});
Ext.define('DesignScheduleManager', {
	extend : 'Ext.window.Window',

	height : 600,
	width : 900,
	layout : {
		type : 'border'
	},
	bodyPadding : 3,
	title : '设计计划',
	iconCls : 'calendar-16',
	modal : true,
	modulebarcode : null,
	resumeid : null,

	initComponent : function() {
		var me = this;

		Ext.applyIf(me, {
			items : [
					{
						xtype : 'container',
						region : 'west',
						split : true,
						width : 300,
						layout : {
							type : 'border'
						},
						items : [
								{
									id : 'mm-design-resume-grid',
									xtype : 'gridpanel',
									region : 'north',
									split : true,
									forceFit : true,
									height : 180,
									title : '计划清单',
									store : Ext.create('Ext.data.Store', {
										id : 'mm-design-resume-store',
										fields : [ 'id', 'modulebarcode', 'startdate', 'enddate', 'takeon', 'orderdate', 'duedate', 'repairno',
												'remark', 'deviser', 'drid', 'statename', 'wsname', 'groupid', 'isimg', 'amend' ],
										autoLoad : true,
										proxy : {
											url : 'devise/share/getModuleDesignResume?modulebarcode=' + me.modulebarcode,
											type : 'ajax',
											reader : {
												type : 'json'
											}
										},
										listeners : {
											load : function(store, records) {
												for ( var m in records) {
													var rec = records[m];
													rec.set('startdate', Ext.Date.parse(rec.get('startdate'), 'Y-m-d H:i:s'));
													rec.set('enddate', Ext.Date.parse(rec.get('enddate'), 'Y-m-d H:i:s'));
													rec.set('orderdate', Ext.Date.parse(rec.get('orderdate'), 'Y-m-d H:i:s'));
													rec.set('duedate', Ext.Date.parse(rec.get('duedate'), 'Y-m-d H:i:s'));
												}
											}
										}
									}),
									listeners : {
										itemdblclick : function(grid, record) {
											var m_resumeid = record.get('id');
											me.resumeid = m_resumeid;
											Ext.getCmp('mm-resume-info-form').getForm().loadRecord(record);
											Ext.getStore('mm-sche-info-store').load({
												params : {
													resumeid : m_resumeid
												}
											});
										}
									},
									viewConfig : {
										getRowClass : function(record, rowIndex, p, store) {
											var drid = record.get('drid');
											var ismig = record.get('isimg');
											if (drid && ismig) {
												return 'state-20210';
											}

											return '';
										}
									},
									columns : [ {
										text : '设计单号',
										dataIndex : 'id'
									}, {
										text : '设计履历',
										dataIndex : 'statename',
										renderer : function(val, meta, record) {
											var amend = record.get('amend');
											return '<b>' + (amend ? '新模修正' : val) + '</b>';
										}
									}, {
										text : '设计状态',
										dataIndex : 'wsname',
										renderer : RenderFontBold
									}, {
										xtype : 'actioncolumn',
										width : 40,
										items : [ {
											tooltip : '删除',
											iconCls : 'gtk-delete-16',
											handler : function(grid, rowIndex, colIndex) {
												// 设计履历
												var k_resumeid = grid.getStore().getAt(rowIndex).get('id');

												Ajax.Post('module/devise/deleteDeviseResume', {
													resumeid : k_resumeid
												}, null, function(extras, backjson) {
													if (backjson.success) {
														// 将FORM面板清空
														Ext.getCmp('mm-resume-info-form').getForm().reset();
														// 清除制程计划信息
														Ext.getStore('mm-sche-info-store').removeAll();
														// 删除履历信息
														grid.getStore().removeAt(rowIndex);
														// 将设计履历缓存清除
														me.resumeid = null;

														showSuccess('删除设计履历成功');
													} else {
														showError(backjson.msg);
													}
												});
											}
										} ]
									} ]
								}, {
									id : 'mm-resume-info-form',
									xtype : 'form',
									region : 'center',
									bodyPadding : 5,
									fieldDefaults : {
										labelWidth : 65,
									},
									title : '计划明细',
									items : [ {
										name : 'id',
										xtype : 'textfield',
										anchor : '100%',
										fieldLabel : '履历代号',
										hidden : true
									}, {
										fieldLabel : '设计组别',
										name : 'groupid',
										xtype : 'combobox',
										anchor : '100%',
										editable : false,
										displayField : 'name',
										allowBlank : false,
										valueField : 'id',
										store : Ext.create('Ext.data.Store', {
											fields : [ 'id', 'name', 'stepid' ],
											proxy : {
												url : 'devise/share/getGroupInfo',
												type : 'ajax',
												reader : {
													type : 'json'
												}
											},
											autoLoad : true
										})
									}, {
										name : 'orderdate',
										xtype : 'datefield',
										anchor : '100%',
										fieldLabel : '起工日期',
										format : 'Y-m-d'
									}, {
										name : 'duedate',
										xtype : 'datefield',
										anchor : '100%',
										fieldLabel : '订单纳期',
										format : 'Y-m-d'
									}, {
										name : 'startdate',
										xtype : 'datefield',
										anchor : '100%',
										fieldLabel : '计划开始',
										format : 'Y-m-d'
									}, {
										name : 'enddate',
										xtype : 'datefield',
										anchor : '100%',
										fieldLabel : '计划完成',
										format : 'Y-m-d'
									}, {
										name : 'takeon',
										xtype : 'combobox',
										anchor : '100%',
										fieldLabel : '打合担当',
										displayField : 'empname',
										valueFiled : 'empname',
										minChars : 0,
										store : Ext.create('Ext.data.Store', {
											fields : [ 'id', 'worknumber', 'empname' ],
											autoLoad : true,
											proxy : {
												url : 'devise/share/getDesignEmployeeInfo',
												type : 'ajax',
												actionMethods : 'POST',
												reader : {
													type : 'json'
												}
											}
										}),
										maxLength : 20
									}, {
										name : 'deviser',
										xtype : 'combobox',
										anchor : '100%',
										displayField : 'empname',
										valueFiled : 'empname',
										minChars : 0,
										store : Ext.create('Ext.data.Store', {
											fields : [ 'id', 'worknumber', 'empname' ],
											autoLoad : true,
											proxy : {
												url : 'devise/share/getDesignEmployeeInfo',
												type : 'ajax',
												actionMethods : 'POST',
												reader : {
													type : 'json'
												}
											}
										}),
										fieldLabel : '设计担当'
									}, {
										name : 'repairno',
										xtype : 'textfield',
										anchor : '100%',
										fieldLabel : '修模单号',
										maxLength : 30
									}, {
										name : 'remark',
										xtype : 'textareafield',
										anchor : '100%',
										fieldLabel : '备注说明'
									}, {
										name : 'amend',
										xtype : 'checkbox',
										fieldLabel : '新模修正',
										anchor : '100%'
									} ],
									tbar : [ {
										text : '新增',
										iconCls : 'add-16',
										handler : function() {
											var modulebarcode = this.up('window').modulebarcode;
											var m_form = this.up('form').getForm();
											me.manageDesignResume('module/devise/manageDesignResume', m_form, modulebarcode, true);
										}
									}, '-', {
										text : '修改',
										iconCls : 'page_refresh-16',
										handler : function() {
											var modulebarcode = this.up('window').modulebarcode;
											var m_form = this.up('form').getForm();
											me.manageDesignResume('module/devise/manageDesignResume', m_form, modulebarcode, false);
										}
									}, '-', {
										text : '完成',
										iconCls : 'accept-16',
										handler : function() {
											me.completeResume(true);
										}
									}, '-', {
										text : '结案',
										iconCls : 'bug-16',
										handler : function() {
											me.completeResume(false);
										}
									}, '-', {
										text : '发图',
										iconCls : 'book_next-16',
										handler : function() {
											me.sendDesignImage();
										}
									} ]
								} ]
					},
					{
						xtype : 'container',
						region : 'center',
						layout : {
							type : 'border'
						},
						items : [
								{
									id : 'mm-sche-plan-grid',
									xtype : 'gridpanel',
									region : 'center',
									columnLines : true,
									title : '计划制程',
									stripeRows : true,
									forceFit : true,
									tbar : [ {
										xtype : 'splitbutton',
										text : '设为集合',
										iconCls : 'chart_organisation_add-16',
										menu : Ext.create('Ext.menu.Menu', {
											id : 'mm-craft-set-menu'
										}),
										handler : function() {
											var m_resumeid = me.resumeid;
											if (!m_resumeid) {
												showError('为选择模具设计信息');
												return;
											}

											Ext.Msg.prompt('添加制程集合', '请输入制程集合名称', function(btn, text) {
												if (btn == 'ok') {
													if (!text) {
														showError('请输入集合名称');
														return;
													}

													Ext.Ajax.request({
														url : 'module/devise/addDeviseCraftSet',
														method : 'POST',
														params : {
															resumeid : me.resumeid,
															setname : text,
															kind : 0
														},
														success : function(resp) {
															var backJson = Ext.JSON.decode(resp.responseText);
															if (backJson.success) {
																showSuccess(backJson.msg);
																me.getCraftSetMenu(0, 'mm-craft-set-menu');
															} else {
																showError(backJson.msg);
															}
														},
														failure : function(x, y, z) {
															showError('网络连接已经断开');
														}
													});
												}
											});
										},
									}, '-', {
										text : '移至开始',
										iconCls : 'resultset_first-16',
										handler : function() {
											var selRows = this.up('gridpanel').getSelectionModel().getSelection();
											if (!selRows.length) {
												showError('没有选择要调整顺序的行');
												return;
											}
											me.alertScheduleInfoOrder({
												id : selRows[0].get('id'),
												resumeid : selRows[0].get('designresumeid'),
												operate : 0
											});
										}
									}, '-', {
										text : '向上移动',
										iconCls : 'resultset_previous-16',
										handler : function() {
											var selRows = this.up('gridpanel').getSelectionModel().getSelection();
											if (!selRows.length) {
												showError('没有选择要调整顺序的行');
												return;
											}
											me.alertScheduleInfoOrder({
												id : selRows[0].get('id'),
												resumeid : selRows[0].get('designresumeid'),
												operate : 1
											});
										}
									}, '-', {
										text : '向下移动',
										iconCls : 'resultset_next-16',
										handler : function() {
											var selRows = this.up('gridpanel').getSelectionModel().getSelection();
											if (!selRows.length) {
												showError('没有选择要调整顺序的行');
												return;
											}
											me.alertScheduleInfoOrder({
												id : selRows[0].get('id'),
												resumeid : selRows[0].get('designresumeid'),
												operate : 2
											});
										}
									}, '-', {
										text : '移至最后',
										iconCls : 'resultset_last-16',
										handler : function() {
											var selRows = this.up('gridpanel').getSelectionModel().getSelection();
											if (!selRows.length) {
												showError('没有选择要调整顺序的行');
												return;
											}

											me.alertScheduleInfoOrder({
												id : selRows[0].get('id'),
												resumeid : selRows[0].get('designresumeid'),
												operate : 3
											});
										}
									}, '->', {
										text : '制程管理',
										iconCls : 'flag_red-16',
										handler : function() {
											new DesignCraftManager().show();
										}
									} ],
									plugins : [ Ext.create('Ext.grid.plugin.CellEditing', {
										clicksToEdit : 1,
										listeners : {
											edit : me.updateRowData
										}
									}) ],
									store : Ext.create('Ext.data.Store', {
										id : 'mm-sche-info-store',
										fields : [ 'id', 'designresumeid', 'craftname', 'planstart', 'planend', 'planhour', 'factstart', 'factend',
												'statename' ],
										autoLoad : true,
										proxy : {
											url : 'devise/share/getSchduleInfo',
											type : 'ajax',
											reader : {
												type : 'json'
											}
										},
										listeners : {
											load : function(store, records) {
												for ( var m in records) {
													var rec = records[m];

													rec.set('planstart', Ext.Date.parse(rec.get('planstart'), 'Y-m-d H:i:s'));
													rec.set('planend', Ext.Date.parse(rec.get('planend'), 'Y-m-d H:i:s'));
													rec.set('factstart', Ext.Date.parse(rec.get('factstart'), 'Y-m-d H:i:s'));
													rec.set('factend', Ext.Date.parse(rec.get('factend'), 'Y-m-d H:i:s'));

													rec.commit();
												}
											}
										}
									}),
									columns : [ {
										text : '制程名称',
										dataIndex : 'craftname',
										width : 120,
									}, {
										xtype : 'datecolumn',
										text : '预计开始',
										dataIndex : 'planstart',
										format : 'Y-m-d',
										width : 120,
										editor : {
											xtype : 'datefield',
											format : 'Y-m-d',
											editable : false
										}
									}, {
										xtype : 'datecolumn',
										text : '预计结束',
										dataIndex : 'planend',
										format : 'Y-m-d',
										width : 120,
										editor : {
											xtype : 'datefield',
											format : 'Y-m-d',
											editable : false
										}
									}, {
										xtype : 'numbercolumn',
										text : '用时',
										dataIndex : 'planhour',
										width : 70,
										editor : {
											xtype : 'numberfield',
											minValue : 0,
											maxValue : 100,
											allowDecimals : true,
											decimalPrecision : 1
										}
									}, {
										xtype : 'datecolumn',
										text : '实际开始',
										dataIndex : 'factstart',
										format : 'Y-m-d',
										width : 120,
										editor : {
											xtype : 'datefield',
											format : 'Y-m-d',
											editable : false
										}
									}, {
										xtype : 'datecolumn',
										text : '实际结束',
										dataIndex : 'factend',
										format : 'Y-m-d',
										width : 120,
										editor : {
											xtype : 'datefield',
											format : 'Y-m-d',
											editable : false
										}
									}, {
										text : '状态',
										dataIndex : 'statename',
										width : 70,
										renderer : RenderFontBold
									}, {
										xtype : 'actioncolumn',
										width : 40,
										items : [ {
											iconCls : 'gtk-delete-16',
											tooltip : '删除',
											handler : function(grid, rowIndex, colIndex) {
												var rec = grid.getStore().getAt(rowIndex);
												Ext.Ajax.request({
													url : 'module/devise/deleteScheduleInfo',
													params : {
														id : rec.get('id'),
														resumeid : rec.get('designresumeid')
													},
													success : function(resp) {
														var backJson = Ext.JSON.decode(resp.responseText);
														if (backJson.success) {
															grid.getStore().reload();
															showSuccess('删除制程成功');
														} else {
															showError('删除制程失败');
														}
													},
													failure : function(x, y, z) {
														showError('连接服务器失败');
													}
												});
											}
										} ]
									} ]
								}, {
									id : 'mm-craft-list-panel',
									xtype : 'panel',
									region : 'south',
									height : 100,
									defaults : {
										margin : 5
									},
									split : true,
									layout : 'column',
									items : [ {
										xtype : 'button',
										text : '现场打合',
										iconCls : 'date_add-16',
										padding : 5
									}, {
										xtype : 'button',
										text : '全3D模图制作',
										iconCls : 'date_add-16',
										padding : 5
									}, {
										xtype : 'button',
										text : '简略位图',
										iconCls : 'date_add-16',
										padding : 5
									}, {
										xtype : 'button',
										text : '制作清单',
										iconCls : 'date_add-16',
										padding : 5
									}, {
										xtype : 'button',
										text : '模图修正',
										iconCls : 'date_add-16',
										padding : 5
									}, {
										xtype : 'button',
										text : '打合资料制作',
										iconCls : 'date_add-16',
										padding : 5
									} ]
								} ]
					} ]
		});

		me.callParent(arguments);

		initCraftList();

		me.getCraftSetMenu(0, 'mm-craft-set-menu');
	},
	completeResume : function(finish) {
		var resumeGrid = Ext.getCmp('mm-design-resume-grid');
		var selectRows = resumeGrid.getSelectionModel().getSelection();
		var resumeForm = Ext.getCmp('mm-resume-info-form').getForm().reset();
		var scheStore = Ext.getStore('mm-sche-info-store');
		var moduleStore = Ext.getStore('dp-devise-module-list');
		if (!selectRows.length) {
			showError('没有选择任何设计履历');
			return;
		}

		Ext.Msg.prompt('提醒', '请输入社内番号', function(btn, text) {
			if (btn == 'ok') {
				Ajax.Post('module/devise/completeDeviseResume', {
					finish : finish,
					resumeid : selectRows[0].get('id'),
					modulecode : text
				}, {
					store : resumeGrid.getStore(),
					form : resumeForm,
					sstore : scheStore,
					mstore : moduleStore
				}, function(extras, backjson) {
					if (backjson.success) {

						extras.store.reload();
						extras.sstore.reload();
						extras.mstore.reload();

						extras.form.reset();

						showSuccess('操作成功');
					} else {
						showError(backjson.msg);
					}
				});
			}
		});
	},
	sendDesignImage : function() {
		var resumeGrid = Ext.getCmp('mm-design-resume-grid');
		var selectRows = resumeGrid.getSelectionModel().getSelection();

		if (!selectRows.length) {
			showError('没有选择任何设计履历');
			return;
		}

		Ext.Msg.prompt('提醒', '请输入社内番号', function(btn, text) {
			if (btn == 'ok') {
				Ajax.Post('module/devise/sendDesignImage', {
					resumeid : selectRows[0].get('id'),
					modulecode : text
				}, {
					store : resumeGrid.getStore()
				}, function(extras, backjson) {
					if (backjson.success) {
						extras.store.reload();
						showSuccess('操作成功');
					} else {
						showError(backjson.msg);
					}
				});
			}
		});
	},
	getCraftSetMenu : function(kind, menuid) {
		var self = this;

		Ext.Ajax.request({
			url : 'devise/share/getCraftSetInfo',
			method : 'POST',
			params : {
				kind : kind
			},
			success : function(resp) {
				var backJson = Ext.JSON.decode(resp.responseText);
				var childs = [];
				if (backJson.length) {
					for ( var x in backJson) {
						childs.push({
							text : backJson[x].name,
							iconCls : 'chart_organisation-16',
							hideOnClick : false,
							menu : Ext.create('Ext.menu.Menu', {
								items : [ {
									text : '导入制程集合',
									setId : backJson[x].id,
									iconCls : 'brick_go-16',
									handler : function() {
										Ajax.Post('module/devise/exportDeviseCraftSet', {
											setid : this.setId,
											resumeid : self.resumeid
										}, null, function(extras, backjson) {
											if (backjson.success) {
												Ext.getStore('mm-sche-info-store').reload();
												showSuccess('导入制程集合成功');
											} else {
												showError(backjson.msg);
											}
										});
									}
								}, {
									text : '删除制程集合',
									iconCls : 'cancel-16',
									setId : backJson[x].id,
									handler : function() {
										Ajax.Post('module/devise/deleteDeviseCraftSet', {
											setid : this.setId
										}, null, function(extras, backjson) {
											if (backjson.success) {
												self.getCraftSetMenu(0, 'mm-craft-set-menu');
												showSuccess('删除制程集合成功');
											} else {
												showError(backjson.msg);
											}
										});
									}
								} ]
							})
						});
					}
				}

				var menuset = Ext.getCmp(menuid);
				menuset.removeAll();
				if (childs.length) {
					menuset.add(childs);
				}
			},
			failure : function(x, y, z) {

			}
		});
	},
	updateRowData : function(editor, e) {
		Ext.Ajax.request({
			url : 'module/devise/updateDesignScheduleInfo',
			method : 'POST',
			params : {
				id : e.record.get('id'),
				planstart : e.record.get('planstart'),
				planend : e.record.get('planend'),
				planhour : e.record.get('planhour'),
				factstart : e.record.get('factstart'),
				factend : e.record.get('factend')
			},
			success : function(resp) {
				var backJson = Ext.JSON.decode(resp.responseText);
				if (backJson.success) {
					e.record.commit();
					showSuccess('更新制程计划成功');
				} else {
					e.record.reject();
					showError(backJson.msg);
				}
			},
			failure : function(x, y, z) {
				e.record.reject();
				showError('连接服务器失败');
			}
		});
	},
	alertScheduleInfoOrder : function(options) {
		Ext.Ajax.request({
			url : 'module/devise/alertScheduleInfoOrder',
			method : 'POST',
			params : options,
			success : function(resp) {
				var backJson = Ext.JSON.decode(resp.responseText);
				if (backJson.success) {
					Ext.getStore('mm-sche-info-store').reload();
					showSuccess('更新制程计划成功');
				} else {
					showError(backJson.msg);
				}
			},
			failure : function(x, y, z) {
				showError('连接服务器失败');
			}
		});
	},
	manageDesignResume : function(url, form, modulebarcode, append) {
		form.submit({
			url : url,
			params : {
				append : append,
				modulebarcode : modulebarcode
			},
			metho : 'POST',
			success : function(form, action) {
				Ext.getStore('mm-design-resume-store').reload();
				showSuccess('保存设计履历成功');
			},
			failure : function(form, action) {
				var backJson = Ext.JSON.decode(action.response.responseText);
				showError(backJson.msg);
			}
		});
	}
});
Ext.define('EditProductInfo', {
	extend : 'Ext.window.Window',

	frame : true,
	height : 600,
	width : 860,
	modal : true,
	modulebarcode : null,
	// resizable : false,
	layout : {
		type : 'border'
	},
	bodyPadding : 3,
	title : '产品管理',
	iconCls : 'plugin-16',
	// 产品唯一号
	prdid : null,

	initComponent : function() {
		var me = this;

		Ext.applyIf(me, {
			items : [ {
				iconCls : 'picture-16',
				xtype : 'panel',
				region : 'center',
				title : '产品图片',
				defaults : {
					margins : 2
				},
				layout : 'border',

				items : [ {
					id : 'mm-product-image-box',
					xtype : 'box', // 或者xtype: 'component',
					region : 'center',
					width : 100, // 图片宽度
					height : 200, // 图片高度
					autoEl : {
						tag : 'img', // 指定为img标签
						src : '' // 指定url路径
					}
				}, {
					xtype : 'form',
					region : 'south',
					layout : 'border',
					height : 30,
					bodyPadding : 2,
					items : [ {
						xtype : 'filefield',
						region : 'center',
						labelWidth : 70,
						fieldLabel : '产品图片',
						emptyText : '请选择图片文件'
					}, {
						xtype : 'button',
						region : 'east',
						text : '上传',
						iconCls : 'arrow_up-16',
						handler : function() {
							this.up('form').submit({
								url : 'module/devise/uploadProductImage',
								waitMsg : '图片上传中',
								params : {
									prdid : me.prdid
								},
								success : function(form, action) {
									var backJson = Ext.JSON.decode(action.response.responseText);

									// 设置图片路径
									Ext.getCmp('mm-product-image-box').getEl().dom.src = '';
									// 刷新产品信息表中的资料
									Ext.getStore('mm-module-product-store').reload();

									Ext.getCmp('mm-product-image-box').getEl().dom.src = backJson.imageurl;

									showSuccess(backJson.msg);
								},
								failure : function(form, action) {
									var backJson = Ext.JSON.decode(action.response.responseText);
									showError(backJson.msg);
								}
							});
						}
					} ]
				} ]
			}, {
				xtype : 'container',
				region : 'west',
				split : true,
				width : 300,
				layout : {
					type : 'border'
				},
				items : [ {
					xtype : 'gridpanel',
					region : 'center',
					forceFit : true,
					title : '产品列表',
					store : Ext.create('Ext.data.Store', {
						id : 'mm-module-product-store',
						fields : [ 'id', 'modulebarcode', 'productcode', 'productname', 'quantity', 'imagepath' ],
						autoLoad : true,
						proxy : {
							url : 'devise/share/getModuleProductInfo?modulebarcode=' + me.modulebarcode,
							type : 'ajax',
							reader : {
								type : 'json'
							}
						}
					}),
					listeners : {
						itemdblclick : function(grid, record) {
							me.prdid = record.get('id');
							// 设置图片路径
							Ext.getCmp('mm-product-image-box').getEl().dom.src = record.get('imagepath');
							Ext.getCmp('mm-product-info-form').getForm().loadRecord(record);
						}
					},
					columns : [ {
						xtype : 'gridcolumn',
						dataIndex : 'productcode',
						text : '客户番号'
					}, {
						xtype : 'gridcolumn',
						dataIndex : 'productname',
						text : '产品名称'
					}, {
						xtype : 'actioncolumn',
						width : 40,
						items : [ {
							tooltip : '删除',
							iconCls : 'gtk-delete-16',
							handler : function(grid, rowIndex, colIndex) {
								Ext.Msg.confirm('提醒', '是否删除模具产品信息', function(y) {
									if (y == 'yes') {
										var prdid = grid.getStore().getAt(rowIndex).get('id');
										Ajax.Post('module/devise/deleteModuleProductInfo', {
											id : prdid
										}, null, function(extras, backjson) {
											if (backjson.success) {
												// 将图片设置为SRC设置为空
												Ext.getCmp('mm-product-image-box').getEl().dom.src = '';
												// 删除该笔资料
												grid.getStore().removeAt(rowIndex);
												// 将产品资料栏清空
												Ext.getCmp('mm-product-info-form').getForm().reset();
												// 将缓存的产品ID设置为NULL
												me.prdid = null;

												showSuccess('删除设计履历成功');
											} else {
												showError(backjson.msg);
											}
										});
									}
								});
							}
						} ]
					} ]
				}, {
					id : 'mm-product-info-form',
					xtype : 'form',
					region : 'south',
					split : true,
					height : 300,
					bodyPadding : 10,
					title : '产品信息',
					items : [ {
						name : 'id',
						xtype : 'textfield',
						anchor : '100%',
						labelWidth : 70,
						fieldLabel : '产品唯一号'
					}, {
						name : 'productcode',
						xtype : 'textfield',
						anchor : '100%',
						labelWidth : 70,
						fieldLabel : '客户品番'
					}, {
						name : 'productname',
						xtype : 'textfield',
						anchor : '100%',
						labelWidth : 70,
						fieldLabel : '产品名称'
					}, {
						name : 'quantity',
						xtype : 'numberfield',
						anchor : '100%',
						labelWidth : 70,
						fieldLabel : '产品取数',
						value : 1,
						maxValue : 100
					} ],
					tbar : [ {
						text : '保存资料',
						iconCls : 'disk-16',
						handler : function() {
							this.up('form').getForm().submit({
								url : 'module/devise/manageModuleProductInfo',
								params : {
									modulebarcode : me.modulebarcode
								},
								success : function(form, action) {
									var backJson = Ext.JSON.decode(action.response.responseText);
									showSuccess(backJson.msg);

									form.reset();

									Ext.getStore('mm-module-product-store').reload();
								},
								failure : function(form, action) {
									var backJson = Ext.JSON.decode(action.response.responseText);
									showError(backJson.msg);
								}
							});
						}
					}, '-', {
						text : '默认设置',
						iconCls : 'cog-16',
						handler : function() {
							this.up('form').getForm().reset();
						}
					} ]
				} ]
			} ]
		});

		me.callParent(arguments);
	}
});
Ext.define('EditModulePlan', {
	extend : 'Ext.window.Window',

	height : 600,
	width : 600,
	modal : true,
	layout : {
		type : 'hbox'
	},
	// 模具唯一号
	modulebarcode : null,
	title : '金型日程',
	iconCls : 'date-16',

	initComponent : function() {
		var me = this;

		Ext.applyIf(me, {
			bbar : [ '->', {
				text : '保存资料',
				iconCls : 'gtk-save-16',
				handler : function() {
					me.savePlanInfo([ 'mm-plan-est-form', 'mm-plan-act-form' ], me.modulebarcode);
				}
			} ],
			items : [ {
				id : 'mm-plan-est-form',
				xtype : 'form',
				region : 'west',
				width : 350,
				bodyPadding : 5,
				border : false,
				flex : 1,
				layout : 'anchor',
				items : [ {
					name : 'id',
					xtype : 'textfield',
					anchor : '100%',
					hidden : true
				}, {
					name : 'modulebarcode',
					xtype : 'textfield',
					anchor : '100%',
					hidden : true
				}, {
					name : 'kind',
					xtype : 'textfield',
					anchor : '100%',
					hidden : true
				}, {
					name : 'lanchdate',
					xtype : 'datefield',
					anchor : '100%',
					fieldLabel : '起工日期',
					format : 'Y-m-d'
				}, {
					name : 'todate',
					xtype : 'datefield',
					anchor : '100%',
					fieldLabel : 'T0日期',
					format : 'Y-m-d'
				}, {
					name : 'makestart',
					xtype : 'datefield',
					anchor : '100%',
					fieldLabel : '制作开始',
					format : 'Y-m-d'
				}, {
					name : 'makefinish',
					xtype : 'datefield',
					anchor : '100%',
					fieldLabel : '制作完成',
					format : 'Y-m-d'
				}, {
					name : 'onsite',
					xtype : 'datefield',
					anchor : '100%',
					fieldLabel : '现场打合',
					format : 'Y-m-d'
				}, {
					name : 'dataverify',
					xtype : 'datefield',
					anchor : '100%',
					fieldLabel : '确认资料接收',
					format : 'Y-m-d'
				}, {
					name : 'lastview',
					xtype : 'datefield',
					anchor : '100%',
					fieldLabel : '最新产品图',
					format : 'Y-m-d'
				}, {
					name : 'flowchart',
					xtype : 'datefield',
					anchor : '100%',
					fieldLabel : '简略排位图',
					format : 'Y-m-d'
				}, {
					name : 'splitgraph',
					xtype : 'datefield',
					anchor : '100%',
					fieldLabel : '模仁分割图',
					format : 'Y-m-d'
				}, {
					name : 'detailflow',
					xtype : 'datefield',
					anchor : '100%',
					fieldLabel : '详细排位',
					format : 'Y-m-d'
				}, {
					name : 'fullgraph',
					xtype : 'datefield',
					anchor : '100%',
					fieldLabel : '全3D模图',
					format : 'Y-m-d'
				}, {
					name : 'makereview',
					xtype : 'datefield',
					anchor : '100%',
					fieldLabel : '加工前评审',
					format : 'Y-m-d'
				}, {
					name : 'ordersteel',
					xtype : 'datefield',
					anchor : '100%',
					fieldLabel : '钢材订购',
					format : 'Y-m-d'
				}, {
					name : 'hotrunner',
					xtype : 'datefield',
					anchor : '100%',
					fieldLabel : '热流道订购',
					format : 'Y-m-d'
				}, {
					name : 'moldbase',
					xtype : 'datefield',
					anchor : '100%',
					fieldLabel : '模坯订购',
					format : 'Y-m-d'
				}, {
					name : 'masterkernel',
					xtype : 'datefield',
					anchor : '100%',
					fieldLabel : '主模仁加工图',
					format : 'Y-m-d'
				}, {
					name : 'partlist',
					xtype : 'datefield',
					anchor : '100%',
					fieldLabel : '模具零件清单',
					format : 'Y-m-d'
				}, {
					name : 'partgraph',
					xtype : 'datefield',
					anchor : '100%',
					fieldLabel : '零件加工图',
					format : 'Y-m-d'
				}, {
					name : 'basegraph',
					xtype : 'datefield',
					anchor : '100%',
					fieldLabel : '模坯加工图',
					format : 'Y-m-d'
				} ]
			}, {
				id : 'mm-plan-act-form',
				xtype : 'form',
				region : 'center',
				flex : 1,
				bodyPadding : 5,
				layout : 'anchor',
				border : false,
				items : [ {
					name : 'id',
					xtype : 'textfield',
					anchor : '100%',
					labelWidth : 70,
					hidden : true
				}, {
					name : 'modulebarcode',
					xtype : 'textfield',
					labelWidth : 70,
					anchor : '100%',
					hidden : true
				}, {
					name : 'kind',
					xtype : 'textfield',
					labelWidth : 70,
					anchor : '100%',
					hidden : true
				}, , {
					name : 'lanchdate',
					xtype : 'datefield',
					labelWidth : 70,
					anchor : '100%',
					fieldLabel : '实际日程',
					format : 'Y-m-d'
				}, {
					name : 'todate',
					xtype : 'datefield',
					labelWidth : 70,
					anchor : '100%',
					fieldLabel : '实际日程',
					format : 'Y-m-d'
				}, {
					name : 'makestart',
					xtype : 'datefield',
					labelWidth : 70,
					anchor : '100%',
					fieldLabel : '实际日程',
					format : 'Y-m-d'
				}, {
					name : 'makefinish',
					labelWidth : 70,
					xtype : 'datefield',
					anchor : '100%',
					fieldLabel : '实际日程',
					format : 'Y-m-d'
				}, {
					name : 'onsite',
					xtype : 'datefield',
					labelWidth : 70,
					anchor : '100%',
					fieldLabel : '实际日程',
					format : 'Y-m-d'
				}, {
					name : 'dataverify',
					xtype : 'datefield',
					labelWidth : 70,
					anchor : '100%',
					fieldLabel : '实际日程',
					format : 'Y-m-d'
				}, {
					name : 'lastview',
					xtype : 'datefield',
					labelWidth : 70,
					anchor : '100%',
					fieldLabel : '实际日程',
					format : 'Y-m-d'
				}, {
					name : 'flowchart',
					xtype : 'datefield',
					labelWidth : 70,
					anchor : '100%',
					fieldLabel : '实际日程',
					format : 'Y-m-d'
				}, {
					name : 'splitgraph',
					xtype : 'datefield',
					labelWidth : 70,
					anchor : '100%',
					fieldLabel : '实际日程',
					format : 'Y-m-d'
				}, {
					name : 'detailflow',
					xtype : 'datefield',
					labelWidth : 70,
					anchor : '100%',
					fieldLabel : '实际日程',
					format : 'Y-m-d'
				}, {
					name : 'fullgraph',
					xtype : 'datefield',
					labelWidth : 70,
					anchor : '100%',
					fieldLabel : '实际日程',
					format : 'Y-m-d'
				}, {
					name : 'makereview',
					labelWidth : 70,
					xtype : 'datefield',
					anchor : '100%',
					fieldLabel : '实际日程',
					format : 'Y-m-d'
				}, {
					name : 'ordersteel',
					xtype : 'datefield',
					labelWidth : 70,
					anchor : '100%',
					fieldLabel : '实际日程',
					format : 'Y-m-d'
				}, {
					name : 'hotrunner',
					xtype : 'datefield',
					labelWidth : 70,
					anchor : '100%',
					fieldLabel : '实际日程',
					format : 'Y-m-d'
				}, {
					name : 'moldbase',
					xtype : 'datefield',
					labelWidth : 70,
					anchor : '100%',
					fieldLabel : '实际日程',
					format : 'Y-m-d'
				}, {
					name : 'masterkernel',
					xtype : 'datefield',
					labelWidth : 70,
					anchor : '100%',
					fieldLabel : '实际日程',
					format : 'Y-m-d'
				}, {
					name : 'partlist',
					xtype : 'datefield',
					labelWidth : 70,
					anchor : '100%',
					fieldLabel : '实际日程',
					format : 'Y-m-d'
				}, {
					name : 'partgraph',
					xtype : 'datefield',
					labelWidth : 70,
					anchor : '100%',
					fieldLabel : '实际日程',
					format : 'Y-m-d'
				}, {
					name : 'basegraph',
					xtype : 'datefield',
					labelWidth : 70,
					anchor : '100%',
					fieldLabel : '实际日程',
					format : 'Y-m-d'
				} ]
			} ]
		});

		me.callParent(arguments);

		me.getPlanInfo('mm-plan-est-form', me.modulebarcode, 0);
		me.getPlanInfo('mm-plan-act-form', me.modulebarcode, 1);

	},
	getPlanInfo : function(form, moduleid, kind) {
		var _win = this;
		Ext.getCmp(form).getForm().load({
			url : 'devise/share/getModulePlan',
			params : {
				modulebarcode : moduleid,
				kind : kind
			},
			success : function(form, action) {
				var backJson = Ext.JSON.decode(action.response.responseText);

				form.findField('id').setValue(backJson.data.id);
				form.findField('modulebarcode').setValue(backJson.data.modulebarcode);
				form.findField('lanchdate').setValue(Ext.Date.parse(backJson.data.lanchdate, 'Y-m-d H:i:s'));
				form.findField('todate').setValue(Ext.Date.parse(backJson.data.todate, 'Y-m-d H:i:s'));
				form.findField('makestart').setValue(Ext.Date.parse(backJson.data.makestart, 'Y-m-d H:i:s'));

				form.findField('makefinish').setValue(Ext.Date.parse(backJson.data.makefinish, 'Y-m-d H:i:s'));
				form.findField('onsite').setValue(Ext.Date.parse(backJson.data.onsite, 'Y-m-d H:i:s'));
				form.findField('dataverify').setValue(Ext.Date.parse(backJson.data.dataverify, 'Y-m-d H:i:s'));
				form.findField('lastview').setValue(Ext.Date.parse(backJson.data.lastview, 'Y-m-d H:i:s'));
				form.findField('flowchart').setValue(Ext.Date.parse(backJson.data.flowchart, 'Y-m-d H:i:s'));

				form.findField('splitgraph').setValue(Ext.Date.parse(backJson.data.splitgraph, 'Y-m-d H:i:s'));
				form.findField('detailflow').setValue(Ext.Date.parse(backJson.data.detailflow, 'Y-m-d H:i:s'));
				form.findField('fullgraph').setValue(Ext.Date.parse(backJson.data.fullgraph, 'Y-m-d H:i:s'));
				form.findField('makereview').setValue(Ext.Date.parse(backJson.data.makereview, 'Y-m-d H:i:s'));
				form.findField('ordersteel').setValue(Ext.Date.parse(backJson.data.ordersteel, 'Y-m-d H:i:s'));

				form.findField('hotrunner').setValue(Ext.Date.parse(backJson.data.hotrunner, 'Y-m-d H:i:s'));
				form.findField('moldbase').setValue(Ext.Date.parse(backJson.data.moldbase, 'Y-m-d H:i:s'));
				form.findField('masterkernel').setValue(Ext.Date.parse(backJson.data.masterkernel, 'Y-m-d H:i:s'));
				form.findField('partlist').setValue(Ext.Date.parse(backJson.data.partlist, 'Y-m-d H:i:s'));
				form.findField('partgraph').setValue(Ext.Date.parse(backJson.data.partgraph, 'Y-m-d H:i:s'));

				form.findField('basegraph').setValue(Ext.Date.parse(backJson.data.basegraph, 'Y-m-d H:i:s'));

				form.findField('kind').setValue(backJson.data.kind);

			},
			failure : function(form, action) {
				_win.close();
				showError('加载模具金型计划失败');
			}
		});
	},
	savePlanInfo : function(formlist, moduleid) {
		var self = this;
		var isValid = self.formValid(formlist);
		if (!isValid) {
			showError('输入的内容不合法');
			return;
		}

		var formdata = self.getFormData(formlist);
		Ext.Ajax.request({
			url : 'module/devise/saveDeviseModulePlanInfo',
			method : 'POST',
			params : {
				modulebarcode : moduleid,
				datalist : Ext.JSON.encode(formdata)
			},
			success : function(resp) {
				var backJson = Ext.JSON.decode(resp.responseText);
				if (backJson.success) {
					showSuccess('保存资料成功');
					self.close();
				} else {
					showError(backJson.msg);
				}
			},
			failure : function(x, y, z) {
				showError('连接服务器失败');
			}
		});
	},
	formValid : function(formlist) {
		for ( var x in formlist) {
			var isValid = Ext.getCmp(formlist[x]).getForm().isValid();
			if (!isValid) {
				return isValid;
			}
		}

		return (true);
	},
	getFormData : function(formlist) {
		var datalist = [];
		for ( var x in formlist) {
			var data = Ext.getCmp(formlist[x]).getValues();
			datalist.push(data);
		}

		return datalist;
	}

});
Ext.define('AppendModuleInfo', {
	extend : 'Ext.window.Window',

	frame : true,
	modal : true,
	height : 590,
	width : 400,
	layout : {
		type : 'border'
	},
	// 是否为新增模具信息
	append : false,
	title : '新建模具信息',
	iconCls : 'plugin-16',
	formRecord : null,
	initComponent : function() {
		var me = this;

		Ext.applyIf(me, {
			items : [ {
				id : 'mm-module-info-form',
				xtype : 'form',
				region : 'center',
				border : false,
				fieldDefaults : {
					labelWidth : 65
				},
				bodyPadding : 10,
				items : [ {
					name : 'designresumeid',
					xtype : 'textfield',
					anchor : '100%',
					fieldLabel : '设计履历号',
					hidden : true,
					value : me.formRecord.designresumeid
				}, {
					name : 'modulebarcode',
					xtype : 'textfield',
					anchor : '100%',
					fieldLabel : '模具唯一号',
					hidden : true,
					value : me.formRecord.modulebarcode
				}, {
					name : 'flag',
					xtype : 'textfield',
					anchor : '100%',
					fieldLabel : '操作标识符',
					hidden : true,
					value : me.formRecord.flag
				},
				// 可编辑项目框
				{
					name : 'guestid',
					xtype : 'combobox',
					anchor : '100%',
					fieldLabel : '选择客户',
					valueField : 'guestid',
					displayField : 'shortname',
					store : Ext.create('Ext.data.Store', {
						fields : [ 'guestid', 'factorycode', 'shortname' ],
						proxy : {
							url : 'public/queryGuestOfModuleCode?type=02',
							type : 'ajax',
							reader : {
								type : 'json'
							}
						},
						autoLoad : true,
					}),
					editable : false,
					allowBlank : false,
					value : me.formRecord.guestid
				}, {
					name : 'guestcode',
					xtype : 'textfield',
					anchor : '100%',
					fieldLabel : '客户番号',
					allowBlank : false,
					// 客户番号必须为字母数字下划线和(-()+*/中的一个或者组合)
					regex : /^(\w|[-()+*\/])+$/,
					value : me.formRecord.guestcode
				}, {
					name : 'modulecode',
					xtype : 'textfield',
					anchor : '100%',
					fieldLabel : '社内番号',
					value : me.formRecord.modulecode
				}, {
					name : 'productname',
					xtype : 'textfield',
					anchor : '100%',
					fieldLabel : '部品名称',
					value : me.formRecord.productname
				}, {
					name : 'moduleclass',
					xtype : 'textfield',
					anchor : '100%',
					fieldLabel : '客户机种',
					value : me.formRecord.moduleclass
				}, {
					name : 'plastic',
					xtype : 'textfield',
					anchor : '100%',
					fieldLabel : '产品材料',
					value : me.formRecord.plastic
				}, {
					name : 'unitextrac',
					xtype : 'textfield',
					anchor : '100%',
					fieldLabel : '产品取数',
					regex : /^\d{1,2}([+]\d{1,2})*$/,
					allowBlank : false,
					value : me.formRecord.unitextrac
				}, {
					name : 'combine',
					xtype : 'combobox',
					store : Ext.create('Ext.data.Store', {
						fields : [ 'id', 'name' ],
						data : [ {
							id : 1,
							name : '单射成型'
						}, {
							id : 2,
							name : '双射成型'
						} ]
					}),
					anchor : '100%',
					editable : false,
					fieldLabel : '成型方式',
					displayField : 'name',
					valueField : 'id',
					value : me.formRecord.combine
				}, {
					name : 'workpressure',
					xtype : 'numberfield',
					anchor : '100%',
					allowBlank : false,
					fieldLabel : '成型吨位',
					maxValue : 1000,
					minValue : 0,
					value : me.formRecord.workpressure
				}, {
					name : 'orderdate',
					xtype : 'datefield',
					anchor : '100%',
					fieldLabel : '起工日期',
					// editable : false,
					format : 'Y-m-d',
					value : me.formRecord.orderdate
				}, {
					name : 'duedate',
					xtype : 'datefield',
					anchor : '100%',
					fieldLabel : 'T0纳期',
					// editable : false,
					format : 'Y-m-d',
					value : me.formRecord.duedate
				}, {
					name : 'takeon',
					xtype : 'combobox',
					anchor : '100%',
					fieldLabel : '打合担当',
					displayField : 'empname',
					valueFiled : 'empname',
					minChars : 0,
					store : Ext.create('Ext.data.Store', {
						fields : [ 'id', 'worknumber', 'empname' ],
						autoLoad : true,
						proxy : {
							url : 'devise/share/getDesignEmployeeInfo',
							type : 'ajax',
							actionMethods : 'POST',
							reader : {
								type : 'json'
							}
						}
					}),
					value : me.formRecord.takeon
				}, {
					name : 'deviser',
					xtype : 'combobox',
					anchor : '100%',
					displayField : 'empname',
					valueFiled : 'empname',
					minChars : 0,
					store : Ext.create('Ext.data.Store', {
						fields : [ 'id', 'worknumber', 'empname' ],
						autoLoad : true,
						proxy : {
							url : 'devise/share/getDesignEmployeeInfo',
							type : 'ajax',
							actionMethods : 'POST',
							reader : {
								type : 'json'
							}
						}
					}),
					fieldLabel : '设计担当',
					value : me.formRecord.deviser
				}, {
					name : 'startdate',
					xtype : 'datefield',
					anchor : '100%',
					fieldLabel : '开始设计',
					// editable : false,
					format : 'Y-m-d',
					value : me.formRecord.startdate
				}, {
					name : 'enddate',
					xtype : 'datefield',
					anchor : '100%',
					fieldLabel : '设计完成',
					// editable : false,
					format : 'Y-m-d',
					value : me.formRecord.enddate
				}, {
					name : 'remark',
					xtype : 'textareafield',
					anchor : '100%',
					fieldLabel : '备注说明',
					maxLength : 100,
					value : me.formRecord.remark
				}, {
					xtype : 'checkboxgroup',
					fieldLabel : '勾选项',
					hidden : true,
					columns : 3,
					items : [ {
						boxLabel : '设计计划',
						name : 'isplan',
						checked : me.formRecord.isplan
					}, {
						boxLabel : '产品复制',
						name : 'iscopy',
						checked : me.formRecord.iscopy
					} ]
				} ],
				bbar : [ '->', {
					text : '保存资料',
					iconCls : 'gtk-save-16',
					handler : function() {
						Ext.Msg.confirm('提醒', '是否确定保存资料', function(y) {
							if (y == 'yes') {
								var mm_form = Ext.getCmp('mm-module-info-form').getForm();
								if (mm_form.isValid()) {
									mm_form.submit({
										url : 'module/devise/saveDeviseModuleInfo',
										waitMsg : '正在提交数据',
										method : "POST",
										success : function(form, action) {
											var mm_flag = me.formRecord.flag;
											switch (mm_flag) {
											case 0:
												mm_form.findField('guestcode').setValue('');
												mm_form.findField('modulecode').setValue('');

												break;
											case 1:
												me.close();
												break;
											default:
												me.close();
												break;
											}

											Ext.getStore('mm-module-list-store').reload();
											showSuccess('保存模具信息成功');
										},
										failure : function(form, action) {
											var result = Ext.JSON.decode(action.response.responseText);
											showError(result.msg);
										}
									});
								}
							}
						});
					}
				} ]
			} ]
		});

		me.callParent(arguments);

		if (me.formRecord.init) {
			var mm_form = Ext.getCmp('mm-module-info-form').getForm();
			mm_form.load({
				url : 'devise/share/getDeviserModuleMessage',
				params : {
					flag : me.formRecord.flag,
					modulebarcode : me.formRecord.modulebarcode,
					iscopy : me.formRecord.iscopy,
					isplan : me.formRecord.isplan
				},
				success : function(form, action) {
					var backJson = Ext.JSON.decode(action.response.responseText);

					mm_form.findField('startdate').setValue(Ext.Date.parse(backJson.data.startdate, 'Y-m-d H:i:s'));
					mm_form.findField('enddate').setValue(Ext.Date.parse(backJson.data.enddate, 'Y-m-d H:i:s'));
					mm_form.findField('orderdate').setValue(Ext.Date.parse(backJson.data.starttime, 'Y-m-d H:i:s'));
					mm_form.findField('duedate').setValue(Ext.Date.parse(backJson.data.inittrytime, 'Y-m-d H:i:s'));

				},
				failure : function(form, action) {
					showError('加载模具资料失败');
				}
			});
		}
	}

});

Ext.define('Deviser.ModuleManager', {
	extend : 'Ext.panel.Panel',
	layout : {
		type : 'border'
	},
	initStore : new Ext.data.Store({
		id : 'mm-module-list-store',
		fields : [ 'modulebarcode', 'guestname', 'moduleclass', 'guestcode', 'productname', 'modulecode', 'imageurl', 'unitextrac', 'takeon',
				'pictureurl', 'remark', 'ensure', 'workpressure' ],
		proxy : {
			url : 'devise/share/getDeviserModuleInfo',
			type : 'ajax',
			reader : {
				type : 'json',
				root : 'info',
				totalProperty : 'totalCount'
			}
		},
		pageSize : 50,
		autoLoad : true
	}),
	menu : Ext.create('Ext.menu.Menu', {
		id : 'mainMenu',
		record : null,
		style : {
			overflow : 'visible'
		},
		items : [ {
			text : '修改模具',
			iconCls : 'pencil-16',
			handler : function() {
				var data = this.up('menu').record.getData();
				new AppendModuleInfo({
					title : '修改模具信息',
					formRecord : {
						modulebarcode : data.modulebarcode,
						unitextrac : '1',
						combine : 1,
						workpressure : 0,
						isplan : true,
						iscopy : false,
						flag : 1,
						init : true
					}
				}).show();
			}
		},
		// '-', {
		// text : '复制模具',
		// iconCls : 'page_copy-16',
		// hidden : true,
		// handler : function() {
		// var data = this.up('menu').record.getData();
		// new AppendModuleInfo({
		// title : '复制模具信息',
		// formRecord : {
		// modulebarcode : data.modulebarcode,
		// unitextrac : '1',
		// combine : 0,
		// workpressure : 0,
		// isplan : true,
		// iscopy : true,
		// flag : 2,
		// init : true
		// }
		// }).show();
		// }
		// },
		'-', {
			text : '产品管理',
			iconCls : 'plugin_add-16',
			handler : function() {
				var data = this.up('menu').record.getData();
				new EditProductInfo({
					modulebarcode : data.modulebarcode
				}).show();
			}
		}, '-', {
			text : '管理计划',
			iconCls : 'date_add-16',
			handler : function() {
				var data = this.up('menu').record.getData();
				new DesignScheduleManager({
					title : data.guestcode + '设计计划',
					modulebarcode : data.modulebarcode
				}).show();
			}
		}, '-', {
			text : '金型日程',
			iconCls : 'clock-16',
			handler : function() {
				var data = this.up('menu').record.getData();
				new EditModulePlan({
					title : data.guestcode + '金型日程' + (data.modulecode ? '(' + data.modulecode + ')' : ''),
					modulebarcode : data.modulebarcode
				}).show();
			}
		} ]
	}),
	initComponent : function() {
		var me = this;
		Ext.applyIf(me, {
			items : [ {
				xtype : 'gridpanel',
				region : 'center',
				forceFit : true,
				columnLines : true,
				listeners : {
					itemcontextmenu : function(view, record, item, index, e, eOpts) {
						me.menu.record = record;
						me.menu.showAt(e.getXY());
						return false;
					}
				},
				store : me.initStore,
				tbar : [ {
					iconCls : 'add-16',
					text : '<b>新增模具</b>',
					handler : function() {
						new AppendModuleInfo({
							formRecord : {
								modulebarcode : '',
								unitextrac : '1',
								combine : 1,
								workpressure : 0,
								isplan : true,
								iscopy : false,
								flag : 0,
								init : false
							}
						}).show();
					}
				}, '-', {
					iconCls : 'arrow_refresh-16',
					text : '<b>刷新资料</b>',
					handler : function() {
						me.initStore.reload();
					}
				}, '->', {
					iconCls : 'sum-16',
					text : '<b>全部资料</b>',
					handler : function() {
						me.initStore.loadPage(1);
					}
				}, '-', {
					iconCls : 'pencil-16',
					text : '<b>设计中</b>',
					handler : function() {
						me.initStore.loadPage(1, {
							params : {
								ds : true
							}
						});
					}
				}, '-', {
					xtype : 'textfield',
					emptyText : '输入模具编号',
					listeners : {
						change : function(field, newVal, oldVal) {
							me.initStore.loadPage(1, {
								params : {
									match : (newVal ? newVal.toUpperCase() : newVal)
								}
							});
						}
					}
				} ],
				bbar : Ext.create('Ext.PagingToolbar', {
					store : me.initStore,
					displayInfo : true,
					displayMsg : '显示资料 {0} - {1} of {2}',
					emptyMsg : "没有查询到模具讯息"
				}),
				columns : [ new Ext.grid.RowNumberer({
					header : "序号",
					width : 40
				}), {
					xtype : 'gridcolumn',
					text : '客户',
					dataIndex : 'guestname',
					width : 130,
					height : 40,
					renderer : me.initCellContent
				}, {
					dataIndex : 'imageurl',
					text : '图片',
					width : 60,
					align : 'center',
					renderer : function(value) {
						return "<img width='48px' heigth='48px' src='devise/share/requestScaleImage?filename=" + value + "' />";
					}
				}, {
					text : '机种',
					dataIndex : 'moduleclass',
					width : 150,
					renderer : me.initCellContent
				}, {
					text : '品番/模号',
					dataIndex : 'guestcode',
					width : 200,
					renderer : me.initCellContent
				}, {
					text : '品名',
					dataIndex : 'productname',
					width : 200,
					renderer : me.initCellContent
				}, {
					text : '社内编号',
					dataIndex : 'modulecode',
					width : 120,
					renderer : me.initCellContent
				}, {
					text : '取数',
					dataIndex : 'unitextrac',
					width : 80,
					renderer : me.initCellContent
				}, {
					text : '吨位(T)',
					dataIndex : 'workpressure',
					width : 80,
					renderer : me.initCellContent
				}, {
					text : '打合',
					dataIndex : 'takeon',
					width : 80,
					renderer : me.initCellContent
				}, {
					text : '设计',
					dataIndex : 'pictureurl',
					width : 120,
					renderer : me.initCellContent
				}, {
					text : '备注',
					dataIndex : 'remark',
					width : 200,
					renderer : me.initCellContent
				} ]
			} ]
		});

		me.callParent(arguments);
	},
	initCellContent : function(val) {
		return '<div class = "x-grid-cell-content">' + (val ? val : '') + '</div>';
	}
});