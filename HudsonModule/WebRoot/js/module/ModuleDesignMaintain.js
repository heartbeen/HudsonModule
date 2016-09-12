/**
 * 模具设变和维修介面
 */
Ext.define('Module.ModuleDesignMaintain', {
	extend : 'Ext.panel.Panel',

	layout : {
		type : 'border'
	},
	border : false,
	defaults : {
		padding : 2
	},
	// 获取工件总数,其格式如下: (4|(4-10,2,3)(XYZ)[XYZ])
	partCreatePattern : /^(\d{1,2}|(\((\d{1,2}|(\d{1,2}-\d{1,2}))(,(\d{1,2}|(\d{1,2}-\d{1,2})))*\)))?(\([a-zA-Z]+\))?(\[[a-zA-Z]+\])?$/,
	// 工件代码的正则表达式
	partCodePattern : /^\d{1,2}$/,
	standardUnitCounter : 0,
	partAddNodeDataList : [],
	/** 以下暂时不用这种查询方式 2014-3-31 moduleCaseSet : new Ext.ModuleCaseOfPart(), */

	selectModuleRecord : null,
	initComponent : function() {
		var me = this;
		Ext.apply(me, {
			items : [
					{
						xtype : 'container',
						region : 'west',
						layout : 'border',
						width : 230,
						items : [ {
							xtype : 'gridpanel',
							id : 'main-design-module-list',
							region : 'center',
							rowLines : true,
							title : '模具工号',
							dockedItems : [ {
								xtype : 'toolbar',
								items : [ Ext.create('Module.ModuleFindTextField', {
									queryLength : 2,
									url : 'public/module?isResume=false'
								}) ]
							} ],
							forceFit : true,
							flex : 1,
							store : Ext.create('Ext.data.Store', {
								autoLoad : false,
								fields : [ "endtime", "starttime", "modulebarcode", "resumestate", "text", "id" ],
								proxy : {
									type : 'ajax',
									url : '',
									reader : {
										type : 'json',
										root : 'children'
									}
								},
								listeners : {
									load : function() {
										me.selectModuleRecord = null;
									}
								}
							}),
							columns : [ {
								xtype : 'gridcolumn',
								dataIndex : 'text',
								text : '模具工号'
							} ],

							listeners : {
								scope : me,
								itemclick : me.getModulePartInformation
							}
						} ]

					},
					{
						xtype : 'panel',
						region : 'center',
						title : '工件清单',
						layout : 'border',
						bodyPadding : 3,
						items : [
								{
									xtype : 'fieldset',
									title : '添加工件',
									region : 'north',
									defaults : {
										padding : '0 3',
										labelWidth : 60
									},
									layout : {
										type : 'table',
										columns : 3
									},
									items : [ {
										id : 'main-part-module-code',
										xtype : 'textfield',
										fieldLabel : '模具工号',
										readOnly : true
									}, {
										id : 'main-part-type-txt',
										xtype : 'combobox',
										fieldLabel : '工件类型',
										valueField : 'id',
										displayField : 'chinaname',
										editable : false,
										store : new Ext.data.Store({
											proxy : {
												type : 'ajax',
												url : 'public/getPartRaceInfo',
												reader : {
													type : 'json',
													root : 'races'
												}
											},
											fields : [ 'id', 'classcode', 'chinaname' ]
										})
									}, {
										id : 'main-part-type-code',
										xtype : 'textfield',
										fieldLabel : '工件编号'
									}, {
										id : 'main-part-list-name',
										xtype : 'textfield',
										fieldLabel : '工件名称'
									}, {
										id : 'main-part-list-source',
										xtype : 'textfield',
										fieldLabel : '工件材料'
									}, {
										id : 'main-part-list-norms',
										xtype : 'textfield',
										fieldLabel : '零件规格',
										value : '參考圖紙'
									}, {
										id : 'main-part-list-count',
										xtype : 'textfield',
										fieldLabel : '工件总数',
										regex : me.partCreatePattern
									}, {
										id : 'main-part-list-split',
										xtype : 'combobox',
										fieldLabel : '编号规则',
										displayField : 'name',
										valueField : 'id',
										store : Ext.create('Ext.data.Store', {
											fields : [ 'id', 'name' ],
											data : [ {
												id : 0,
												name : '合并编号'
											}, {
												id : 1,
												name : '区分编号'
											} ]
										}),
										editable : false,
										value : 0
									}, {
										id : 'main-part-list-isfit',
										xtype : 'checkbox',
										fieldLabel : '是否固件'
									} ]

								},
								{
									xtype : 'gridpanel',
									region : 'center',
									title : '模具工件清单',
									id : 'main-module-part-info',
									selModel : {
										selType : 'checkboxmodel',
										mode : 'SIMPLE',
										toggleOnClick : false
									},
									moduleInfo : null,
									tbar : [ {
										text : '修模设变',
										iconCls : 'gnome-run-16',
										scope : me,
										handler : me.onSubmitModuleResume
									} ],
									rowLines : true,
									columnLines : true,
									// forceFit : true,
									store : new Ext.data.Store({
										fields : [ 'modulebarcode', 'partbarcode', 'partname', 'material', 'norms', 'parttype', 'partbarlistcode',
												'partlistcode', 'partsuffix', 'isfirmware', 'raceid', 'partcode' ],
										autoLoad : false,
										proxy : {
											url : '',
											type : 'ajax',
											reader : {
												type : 'json'
											}
										}
									}),
									columns : [ {
										xtype : 'gridcolumn',
										width : 100,
										dataIndex : 'partlistcode',
										text : '工件编号'
									}, {
										xtype : 'gridcolumn',
										dataIndex : 'partname',
										width : 160,
										text : '工件名称'
									}, {
										xtype : 'gridcolumn',
										dataIndex : 'material',
										width : 100,
										text : '工件材质'
									}, {
										xtype : 'gridcolumn',
										dataIndex : 'norms',
										width : 120,
										text : '工件规格'
									} ],
									listeners : {
										itemdblclick : function(grid, record) {
											Ext.getCmp('main-part-type-txt').setValue(record.get('raceid'));
											Ext.getCmp('main-part-type-code').setValue(record.get('partcode'));
											Ext.getCmp('main-part-list-name').setValue(record.get('partname'));
											Ext.getCmp('main-part-list-source').setValue(record.get('material'));
											Ext.getCmp('main-part-list-norms').setValue(record.get('norms'));
											Ext.getCmp('main-part-list-isfit').setValue(record.get('isfirmware') > 0);
										}
									}
								} ]
					} ]
		});

		me.callParent(arguments);
	},

	getModulePartInformation : function(grid, record) {

		this.selectModuleRecord = record;

		var cmnpGrid = Ext.getCmp('main-module-part-info');
		cmnpGrid.getStore().load({
			url : 'module/manage/getModulePartInformation',
			params : {
				modulebarcode : record.get('modulebarcode')
			},
			// 回馈函数
			callback : function(resp, oper, success) {
				if (success) {
					var sel = grid.getSelectionModel().getSelection();
					if (sel && sel.length) {
						cmnpGrid.moduleInfo = sel[0];
						Ext.getCmp('main-part-module-code').setValue(sel[0].data.text);
					}
				} else {
					showError('查询模具资料失败!');
				}
			}
		});
	},

	/** 提交改模所在加工的工件与改模信息 */
	onSubmitModuleResume : function(button) {
		var me = this;

		if (!me.selectModuleRecord) {
			showError("请选择模具");
		}

		var self = button.up("gridpanel");

		var selection = self.getSelectionModel().getSelection();

		var win = Ext.create('Module.ModuleResumeWindow', {
			moduleRecord : me.selectModuleRecord
		});

		win.show();
		win.partStore.removeAll();
		win.resumeStore.load({
			url : 'public/historyResumePart',
			params : {
				m : me.selectModuleRecord.data.modulebarcode
			},
			callback : function(records, operation, success) {
				Ext.Array.forEach(records, function(item) {
					item.data.newup = false;
					item.data.update = false;
				});

				if (selection.length > 0) {

					win.resumeStore.insert(0, new HistoryResumeModel({
						resumename : "当前设变/修模",
						'resumeid' : '',
						'starttime' : '',
						'endtime' : '',
						'remark' : '',
						newup : true,
						children : selection
					}));
				}

				var gird = win.getComponent(0);
				gird.fireEvent('itemclick', gird.getView(), gird.store.getAt(0));
				gird.getSelectionModel().select(0);
			}
		});
	}
});

Ext.define("HistoryResumeModel", {
	extend : 'Ext.data.Model',
	fields : [ 'resumeid', 'resumename', "resumestate", "update", {
		name : 'newup',
		type : "bool"
	}, {
		name : 'starttime',
		type : 'date'
	}, {
		name : 'endtime',
		type : 'date'
	}, 'mdremark', {
		name : "children",
		type : "object"
	} ]
});

/**
 * 设变信息窗口
 */
Ext.define('Module.ModuleResumeWindow', {
	extend : 'Ext.window.Window',
	height : 540,
	width : 730,
	layout : {
		type : 'border'
	},
	title : "设变/修模信息",
	bodyPadding : 5,
	resumeStore : Ext.create('Ext.data.Store', {
		model : 'HistoryResumeModel',
		autoLoad : false,
		proxy : {
			type : 'ajax'
		}
	}),
	partStore : Ext.create('Ext.data.Store', {
		fields : [ 'partbarlistcode', 'partlistcode', 'partname', 'remark' ],
		autoLoad : false
	}),

	selectPartRecord : null,
	resumeRecord : null,
	form : null,
	resizable : false,
	required : '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>',
	modal : true,
	nowTime : new Date(),
	initComponent : function() {
		var me = this;

		Ext.applyIf(me, {
			items : [ {
				xtype : 'gridpanel',
				style : 'margin-right:5px;',
				title : '',
				width : 150,
				region : 'west',
				store : me.resumeStore,
				forceFit : true,
				columns : [ {
					xtype : 'gridcolumn',
					dataIndex : 'resumename',
					width : 120,
					text : '设变/修模列表'
				} ],
				listeners : {
					scope : me,
					itemclick : me.onClickHistoryResume
				}
			}, {
				xtype : 'container',
				layout : 'border',
				region : 'center',
				items : [ {
					xtype : 'fieldset',
					layout : 'border',
					region : 'north',
					title : '设变/修模工件信息',
					flex : 1.4,
					items : [ {
						xtype : 'gridpanel',
						region : 'center',
						title : '工件清单',
						store : me.partStore,
						forceFit : true,
						columns : [ {
							xtype : 'gridcolumn',
							dataIndex : 'partbarlistcode',
							width : 120,
							text : '工件条码号',
							renderer : me.renderHaveRemark
						}, {
							xtype : 'gridcolumn',
							dataIndex : 'partlistcode',
							text : '工件编号',
							renderer : me.renderHaveRemark
						}, {
							xtype : 'gridcolumn',
							dataIndex : 'partname',
							text : '工件名称',
							renderer : me.renderHaveRemark
						}, {
							xtype : 'actioncolumn',
							width : 20,
							items : [ {
								iconCls : 'dialog-cancel-16',
								tooltip : '移除工件',
								scope : me,
								handler : me.onClickRemovePart
							} ]
						} ],

						listeners : {
							scope : me,
							itemclick : me.onClickPartRemark
						}
					}, {
						xtype : 'textareafield',
						id : 'main-part-process-remark-id',
						region : 'east',
						fieldLabel : '工件(设变/修模)说明(200字)',
						style : 'margin-left:5px;',
						maxLength : 200,
						labelAlign : 'top',
						labelWidth : 100,
						width : 160,
						maxHeight : 235,
						labelStyle : 'margin-bottom:3px;',
						listeners : {
							scope : me,
							blur : me.onRecordPartRemark
						}
					} ]
				}, {
					xtype : 'form',
					border : 0,
					margin : '5 0 0 0',
					region : 'center',
					layout : 'border',
					flex : 1,
					items : [ {
						xtype : 'fieldset',
						region : 'center',
						fieldDefaults : {
							labelAlign : 'top',
							labelWidth : 100,
							labelStyle : 'margin-bottom:3px;'
						},
						layout : {
							type : 'border'
						},
						title : '基本信息',
						items : [ {
							xtype : 'container',
							region : 'west',
							width : 180,
							layout : {
								type : 'vbox',
								align : 'stretch'
							},
							bodyPadding : 5,
							items : [ {
								xtype : 'combobox',
								name : 'resumeState',
								fieldLabel : '设变或修模',
								valueField : 'id',
								displayField : 'name',
								allowBlank : false,
								emptyText : '请选择设变/修模',
								afterLabelTextTpl : me.required,
								editable : false,
								store : new Ext.data.Store({
									fields : [ 'id', 'name' ],
									data : [ {
										id : '20402',
										name : '修模'
									}, {
										id : '20403',
										name : '设变'
									} ]
								}),
								listeners : {
									scope : me,
									select : me.onSelectResumeState
								}
							}, {
								xtype : 'container',
								layout : 'table',
								items : [ {
									xtype : 'datefield',
									name : 'startdate',
									fieldLabel : '开始日期',
									afterLabelTextTpl : me.required,
									allowBlank : false,
									width : 100,
									value : Ext.Date.format(me.nowTime, 'Y-m-d'),
									format : 'Y-m-d',
									listeners : {
										scope : me,
										select : me.onSelectStartDate
									}
								}, {
									xtype : 'timefield',
									name : 'starttime',
									allowBlank : false,
									fieldLabel : '开始时间',
									style : 'margin-left:5px',
									increment : 30,
									width : 75,
									afterLabelTextTpl : me.required,
									value : me.nowTime,
									format : 'H:i',
									listeners : {
										scope : me,
										select : me.onSelectStartDate
									}
								} ]
							}, {
								xtype : 'container',
								layout : 'table',
								items : [ {
									xtype : 'datefield',
									name : 'enddate',
									afterLabelTextTpl : me.required,
									allowBlank : false,
									width : 100,
									fieldLabel : '完成日期',
									format : 'Y-m-d',
									listeners : {
										scope : me,
										select : me.onSelectEndDate
									}
								}, {
									xtype : 'timefield',
									name : 'endtime',
									allowBlank : false,
									style : 'margin-left:5px',
									fieldLabel : '完成时间',
									increment : 30,
									width : 75,
									afterLabelTextTpl : me.required,
									format : 'H:i',
									listeners : {
										scope : me,
										select : me.onSelectEndDate
									}
								} ]
							} ]
						}, {
							xtype : 'textareafield',
							name : 'remark',
							region : 'center',
							fieldLabel : '模具(设变/修模)说明(500字)',
							style : 'margin-left:5px;',
							maxLength : 500,
							maxHeight : 132,
							listeners : {
								scope : me,
								blur : me.onResumeRemark
							}
						} ]
					} ]
				} ]
			} ],
			dockedItems : [ {
				xtype : 'toolbar',
				dock : 'bottom',
				ui : 'footer',
				items : [ {
					xtype : 'tbfill'
				},

				/*
				 * { xtype : 'checkbox', fieldLabel : '合并修模或设变', checked : true,
				 * labelWidth : 100 }, '-',
				 */

				{
					text : '提交',
					iconCls : 'dialog-apply-16',
					width : 60,
					scope : me,
					handler : me.onSubmit

				}, {
					text : '取消',
					iconCls : 'dialog-cancel-16',
					width : 60,
					handler : function() {
						me.destroy();
					}
				} ]
			} ]
		});

		me.callParent(arguments);
	},

	/**
	 * 移除相关工件
	 */
	onClickRemovePart : function(gridpanel, rowIndex, colIndex) {
		var me = this;

		if (me.resumeRecord.data.newup) {
			Ext.MessageBox.confirm('工件', '您确认删除该工件的修模/设变?', function(btn) {
				if (btn != 'yes') {
					return;
				}
				me.shareRemovePart(rowIndex);
			});

		} else {
			showInfo("不允许删除已设变/修模的工件!");
		}

	},

	shareRemovePart : function(rowIndex) {
		var me = this;
		me.partStore.removeAt(rowIndex);
		Ext.Array.erase(me.resumeRecord.data.children, 1, 1);

		if (me.partStore.count() == 0) {
			me.resumeStore.remove(me.resumeRecord);

			var gird = me.getComponent(0);
			gird.fireEvent('itemclick', gird.getView(), gird.store.getAt(0));
			gird.getSelectionModel().select(0);
		}
	},

	/**
	 * 有工件加工说明时显示样式
	 */
	renderHaveRemark : function(value, m, record) {
		if (record.data.remark) {
			return "<span style='font-weight: bold;'>".concat(value).concat("</span>");
		} else {
			return value;
		}
	},

	/**
	 * 点击同期修模/设变
	 */
	onClickHistoryResume : function(grid, record) {
		var me = this;
		me.selectPartRecord = null;
		me.partStore.loadData(record.data.children);

		me.resumeRecord = record;

		if (!me.form) {
			me.form = me.query('form')[0].getForm();
		}

		// 设置模具的履历状态
		me.form.findField('resumeState').setValue(record.data.resumestate);
		me.form.findField('remark').setValue(record.data.mdremark);
		// 设置开始和结束时间的控件的值
		me.form.findField('startdate').setValue(record.data.starttime);
		me.form.findField('starttime').setValue(record.data.starttime);

		me.form.findField('enddate').setValue(record.data.endtime);
		me.form.findField('endtime').setValue(record.data.endtime);

		Ext.getCmp("main-part-process-remark-id").setValue("");

		me.form.clearInvalid();
	},

	/**
	 * 点击相应工件的修模/设变说明
	 */
	onClickPartRemark : function(grid, record, item, index) {
		this.selectPartRecord = record;
		this.selectPartIndex = index;
		Ext.getCmp("main-part-process-remark-id").setValue(record.data.remark);
	},

	/**
	 * 记录每个工件的设变/修模说明
	 */
	onRecordPartRemark : function(area, The, eOpts) {
		if (this.selectPartRecord) {

			this.selectPartRecord.set("remark", area.getValue());

			if (!this.resumeRecord.data.newup) {
				this.resumeRecord.data.children[this.selectPartIndex].remark = area.getValue();
				this.resumeRecord.data.children[this.selectPartIndex].update = true;
			}

			this.moduleResumeUpdate();
		} else {
			area.setValue(null);
		}
	},

	/**
	 * 记录模具设变/修模说明
	 */
	onResumeRemark : function(area, The, eOpts) {
		if (this.resumeRecord) {
			this.resumeRecord.set("mdremark", area.getValue());

			this.moduleResumeUpdate();
		}
	},

	onSelectResumeState : function(combo, records) {
		if (this.resumeRecord) {
			this.resumeRecord.set("resumestate", combo.getValue());

			this.moduleResumeUpdate();
		}
	},

	onSelectStartDate : function(combo, records) {
		if (this.resumeRecord) {
			var time = this.form.findField('startdate').getRawValue() + " " + this.form.findField('starttime').getRawValue();
			this.resumeRecord.set("starttime", time);

			this.moduleResumeUpdate();
		}
	},

	onSelectEndDate : function(combo, records) {
		if (this.resumeRecord) {
			var time = this.form.findField('enddate').getRawValue() + " " + this.form.findField('endtime').getRawValue();
			this.resumeRecord.set("endtime", time);

			this.moduleResumeUpdate();
		}
	},

	moduleResumeUpdate : function() {
		// 如果修模记录为已存时,就表示为更新
		if (!this.resumeRecord.data.newup && !this.resumeRecord.data.update) {
			this.resumeRecord.set("update", true);
		}
	},

	onSubmit : function(button) {
		var me = this;

		// 用于统计FORM的控件是否有效,如果没有效果则提示
		if (!me.form.isValid()) {
			showInfo('信息不完全,请输全信息!');
			return;
		}

		Ext.MessageBox.confirm('修模/设变', '您确认建立模具修模/设变?', function(btn) {
			if (btn != 'yes') {
				return;
			}

			button.setDisabled(true);

			var count = me.resumeStore.count();

			var resume = {
				moduleResume : []
			};

			// 生成修模/设计提交数据对象
			for ( var i = 0; i < count; i++) {
				var module = me.resumeStore.getAt(i);

				if (module.data.newup || module.data.update) {
					resume.moduleResume.push({
						id : module.data.resumeid,
						curestate : 1,
						resumestate : module.data.resumestate,
						starttime : module.data.starttime,
						endtime : module.data.endtime,
						remark : module.data.mdremark,
						modulebarcode : me.moduleRecord.data.modulebarcode,
						partResume : []
					});

					if (module.data.newup) {
						Ext.Array.forEach(module.data.children, function(item) {
							resume.moduleResume[i].partResume.push({
								id : '',
								partbarlistcode : item.data.partbarlistcode,
								remark : item.data.remark,
								moduleresumeid : ''
							});
						});
					} else {
						Ext.Array.forEach(module.data.children, function(item) {
							if (item.update) {
								resume.moduleResume[i].partResume.push({
									id : item.id,
									partbarlistcode : item.partbarlistcode,
									remark : item.remark,
									moduleresumeid : ''
								});
							}

						});
					}
				}
			}

			Ext.Ajax.request({
				url : 'module/manage/modifyModuleInformation',
				method : 'POST',
				params : {
					info : App.dateReplaceToZone(Ext.JSON.encode(resume))
				},
				success : function(response) {
					var res = JSON.parse(response.responseText);

					App.InterPath(res, function() {
						if (!res.success) {
							showError(res.msg);
							button.setDisabled(false);
						} else {
							showSuccess(res.msg);
							me.destroy();
						}
					});
				},
				failure : function(x, y) {
					button.setDisabled(false);

					if (x.status.toString().startsWith("4")) {
						showError("连接网络异常,请检查网络连接!");
					}
					if (x.status.toString().startsWith("5")) {
						showError("服务器处理数据错误,请通知管理员!");
					}

				}
			});
		});

	}
});
