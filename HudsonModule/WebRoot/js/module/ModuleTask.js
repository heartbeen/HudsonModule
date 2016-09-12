Ext.define('Module.AddTaskGroupMember', {
	extend : 'Ext.window.Window',
	title : '添加项目成员',
	width : 300,
	height : 200,
	modal : true,
	resizable : false,
	initComponent : function() {
		var me = this;

		Ext.apply(me, {
			layout : 'border',
			buttons : [ {
				text : '添加成员',
				iconCls : 'accept-16',
				handler : function() {
					var treeStructId = Ext.getCmp('mt-struct-treeid').getChecked();
					if (!treeStructId.length) {
						showError('未选择任何项目小组!');
						return;
					}

					var treeList = [];
					for ( var x in treeStructId) {
						treeList.push(treeStructId[x].get('id'));
					}

					Ext.Ajax.request({
						url : 'public/getJoinTaskStuff',
						method : 'POST',
						params : {
							treeid : Ext.JSON.encode(treeList)
						},
						success : function(resp) {
							var backJson = Ext.JSON.decode(resp.responseText);
							if (backJson && backJson.length > 0) {
								var taskList = Ext.getCmp('mt-grid-taskstuff').getStore();
								for ( var m in backJson) {
									var _sIndex = taskList.findExact('empid', backJson[m].empid);
									if (_sIndex < 0) {
										backJson[m].id = '';
										taskList.add(backJson[m]);
									}
								}
							}

							me.close();
						},
						failure : function(x, y, z) {
							showError('加载项目成员失败,请检查网络连接!');
						}
					});
				}
			} ],
			items : [ {
				id : 'mt-struct-treeid',
				xtype : 'treepanel',
				region : 'center',
				border : false,
				rootVisible : false,
				split : true,
				store : Ext.create('Ext.data.TreeStore', {
					autoLoad : true,
					fields : [ 'id', 'text', 'stepid', 'groupid', 'structid', 'checked', 'leaf' ],
					proxy : {
						type : 'ajax',
						url : 'public/getTaskGroupChildAndMember',
						reader : {
							type : 'json',
							root : 'children'// 数据
						},
						extraParams : {
							stepid : ''
						}
					},
					root : {
						expanded : true
					},
					listeners : {
						'beforeexpand' : function(node, eOpts) {
							this.proxy.extraParams.stepid = node.raw.stepid;
						}
					}
				})
			} ]
		});

		me.callParent(arguments);
	}
});

Ext.define('Module.TaskInfoManager', {
	extend : 'Ext.window.Window',

	height : 500,
	width : 800,
	resizable : false,
	layout : 'border',
	bodyPadding : 3,
	title : '新增任务计划',
	modal : true,
	taskMsg : null,
	initComponent : function() {
		var me = this;

		Ext.applyIf(me, {
			defaults : {
				padding : 3
			},
			items : [ {
				xtype : 'container',
				region : 'center',
				layout : 'border',
				items : [
						{
							xtype : 'fieldset',
							layout : {
								type : 'table',
								columns : 2
							},
							defaults : {
								padding : '0 5'
							},
							region : 'north',
							title : '任务计划',
							items : [ {
								id : 'mt-task-moduleid',
								xtype : 'combobox',
								fieldLabel : '模具编号',
								disabled : me.taskMsg.disabled,
								width : 300,
								displayField : 'modulecode',
								valueField : 'modulebarcode',
								value : me.taskMsg.moduleid,
								minChars : 0,
								store : Ext.create('Ext.data.Store', {
									fields : [ 'modulebarcode', 'modulecode' ],
									autoLoad : true,
									proxy : {
										url : 'public/getModuleListByVague?isall=true',
										type : 'ajax',
										reader : {
											type : 'json'
										}
									}
								})
							}, {
								id : 'mt-task-property',
								xtype : 'textfield',
								fieldLabel : '任务属性',
								value : me.taskMsg.property,
								width : 300,
								readOnly : true
							}, {
								id : 'mt-property-precious',
								xtype : 'combobox',
								width : 300,
								fieldLabel : '精度系数',
								editable : false,
								value : me.taskMsg.precious,
								displayField : 'name',
								valueField : 'id',
								store : Ext.create('Ext.data.Store', {
									fields : [ 'id', 'name', 'typid', 'code', 'score', 'scount' ],
									autoLoad : true,
									proxy : {
										url : 'public/getTaskPropertyByType?typeid=0',
										type : 'ajax',
										reader : {
											type : 'json'
										}
									}
								}),
								listeners : {
									select : function(combo, records) {
										var preciousRecord = records[0];
										var structRecord = me.getComboSelectRecord('mt-property-struct', 'id');
										var tonRecord = me.getComboSelectRecord('mt-property-ton', 'id');

										var propertyCode = '', propertyScore = 0, propertyCount = 0;

										if (preciousRecord) {
											propertyCode = preciousRecord.get('code');
											propertyScore = preciousRecord.get('score');
											propertyCount = preciousRecord.get('scount');
										}

										if (structRecord) {
											propertyCode += structRecord.get('code');
											propertyScore += structRecord.get('score');
											propertyCount += structRecord.get('scount');
										}

										if (tonRecord) {
											propertyCode += tonRecord.get('code');
											propertyScore += tonRecord.get('score');
											propertyCount += tonRecord.get('scount');
										}

										Ext.getCmp('mt-task-property').setValue(propertyCode);
										Ext.getCmp('mt-task-score').setValue(propertyScore);
										Ext.getCmp('mt-task-standardcount').setValue(propertyCount);
									}
								}
							}, {
								id : 'mt-task-score',
								xtype : 'textfield',
								width : 300,
								fieldLabel : '任务积分',
								value : me.taskMsg.score,
								readOnly : true
							}, {
								id : 'mt-property-struct',
								width : 300,
								xtype : 'combobox',
								fieldLabel : '构造系数',
								value : me.taskMsg.struct,
								editable : false,
								displayField : 'name',
								valueField : 'id',
								store : Ext.create('Ext.data.Store', {
									fields : [ 'id', 'name', 'typid', 'code', 'score', 'scount' ],
									autoLoad : true,
									proxy : {
										url : 'public/getTaskPropertyByType?typeid=1',
										type : 'ajax',
										reader : {
											type : 'json'
										}
									}
								}),
								listeners : {
									select : function(combo, records) {
										var preciousRecord = me.getComboSelectRecord('mt-property-precious', 'id');
										var structRecord = records[0];
										var tonRecord = me.getComboSelectRecord('mt-property-ton', 'id');

										var propertyCode = '', propertyScore = 0, propertyCount = 0;

										if (preciousRecord) {
											propertyCode = preciousRecord.get('code');
											propertyScore = preciousRecord.get('score');
											propertyCount = preciousRecord.get('scount');
										}

										if (structRecord) {
											propertyCode += structRecord.get('code');
											propertyScore += structRecord.get('score');
											propertyCount += structRecord.get('scount');
										}

										if (tonRecord) {
											propertyCode += tonRecord.get('code');
											propertyScore += tonRecord.get('score');
											propertyCount += tonRecord.get('scount');
										}

										Ext.getCmp('mt-task-property').setValue(propertyCode);
										Ext.getCmp('mt-task-score').setValue(propertyScore);
										Ext.getCmp('mt-task-standardcount').setValue(propertyCount);
									}
								}
							}, {
								id : 'mt-task-standardcount',
								xtype : 'textfield',
								fieldLabel : '标准次数',
								value : me.taskMsg.standard,
								width : 300,
								readOnly : true
							}, {
								id : 'mt-property-ton',
								width : 300,
								xtype : 'combobox',
								fieldLabel : '吨位系数',
								value : me.taskMsg.ton,
								displayField : 'name',
								editable : false,
								valueField : 'id',
								store : Ext.create('Ext.data.Store', {
									fields : [ 'id', 'name', 'typid', 'code', 'score', 'scount' ],
									autoLoad : true,
									proxy : {
										url : 'public/getTaskPropertyByType?typeid=2',
										type : 'ajax',
										reader : {
											type : 'json'
										}
									}
								}),
								listeners : {
									select : function(combo, records) {
										var preciousRecord = me.getComboSelectRecord('mt-property-precious', 'id');
										var structRecord = me.getComboSelectRecord('mt-property-struct', 'id');
										var tonRecord = records[0];

										var propertyCode = '', propertyScore = 0, propertyCount = 0;

										if (preciousRecord) {
											propertyCode = preciousRecord.get('code');
											propertyScore = preciousRecord.get('score');
											propertyCount = preciousRecord.get('scount');
										}

										if (structRecord) {
											propertyCode += structRecord.get('code');
											propertyScore += structRecord.get('score');
											propertyCount += structRecord.get('scount');
										}

										if (tonRecord) {
											propertyCode += tonRecord.get('code');
											propertyScore += tonRecord.get('score');
											propertyCount += tonRecord.get('scount');
										}

										Ext.getCmp('mt-task-property').setValue(propertyCode);
										Ext.getCmp('mt-task-score').setValue(propertyScore);
										Ext.getCmp('mt-task-standardcount').setValue(propertyCount);
									}
								}
							}, {
								id : 'mt-task-changecount',
								xtype : 'numberfield',
								value : me.taskMsg.change,
								fieldLabel : '设变次数',
								minValue : 0,
								width : 300,
								maxValue : 30
							}, {
								id : 'mt-task-doublescore',
								width : 300,
								xtype : 'radiogroup',
								fieldLabel : '双倍积分',
								items : [ {
									xtype : 'radiofield',
									boxLabel : '是',
									inputValue : 'true',
									name : 'doubleScore',
									checked : me.taskMsg.checked
								}, {
									xtype : 'radiofield',
									boxLabel : '否',
									inputValue : 'false',
									name : 'doubleScore',
									checked : me.taskMsg.unchecked
								} ]
							} ]
						},
						{
							id : 'mt-grid-taskstuff',
							xtype : 'gridpanel',
							region : 'center',
							tbar : [ {
								text : '新增项目成员',
								iconCls : 'add-16',
								handler : function() {
									new Module.AddTaskGroupMember().show();
								}
							} ],
							store : Ext.create('Ext.data.Store', {
								fields : [ 'id', 'taskid', 'groupid', 'empid', 'empname', 'deptname', 'isgeneral', 'ismajor', 'isgroup', 'issum',
										'ischecker', 'isspecific' ],
								autoLoad : true,
								proxy : {
									url : 'public/getTaskStuff?taskid=' + me.taskMsg.taskId,
									type : 'ajax',
									reader : {
										type : 'json'
									}
								}
							}),
							columns : [ {
								xtype : 'rownumberer'
							}, {
								text : '成员名称',
								dataIndex : 'empname'
							}, {
								text : '所在部门',
								dataIndex : 'deptname'
							}, {
								xtype : 'checkcolumn',
								text : '总负责人',
								dataIndex : 'isgeneral',
								width : 65
							}, {
								xtype : 'checkcolumn',
								text : '项目经理',
								dataIndex : 'ismajor',
								width : 65
							}, {
								xtype : 'checkcolumn',
								text : '组长',
								dataIndex : 'isgroup',
								width : 65
							}, {
								xtype : 'checkcolumn',
								text : '会审成员',
								dataIndex : 'ischecker',
								width : 65
							}, {
								xtype : 'checkcolumn',
								text : '项目负责人',
								dataIndex : 'isspecific',
								width : 70
							}, {
								xtype : 'checkcolumn',
								text : '核算人数',
								dataIndex : 'issum',
								width : 65
							}, {
								xtype : 'actioncolumn',
								text : '删除',
								width : 40,
								items : [ {
									iconCls : 'gtk-delete-16',
									handler : function(grid, rowIndex, colIndex) {
										grid.getStore().removeAt(rowIndex);
									}
								} ]
							} ]
						} ]

			} ],
			buttons : [ {
				xtype : 'button',
				text : '保存资料',
				iconCls : 'gtk-save-16',
				handler : function() {
					var taskWindow = this.up('window');
					// TODO 新增或者管理项目计划
					var moduleCtrl = Ext.getCmp('mt-task-moduleid');
					var moduleid = moduleCtrl.getValue();

					if (!me.getComboSelectRecord('mt-task-moduleid', "modulebarcode")) {
						showError('填写模具工号不存在!');
						return;
					}

					if (!moduleid) {
						showError('模具编号不能为空!');
						return;
					}

					var preciousid = Ext.getCmp('mt-property-precious').getValue();
					var structid = Ext.getCmp('mt-property-struct').getValue();
					var tonid = Ext.getCmp('mt-property-ton').getValue();

					if (!preciousid) {
						showError('精度需要设定!');
						return;
					}

					if (!structid) {
						showError('构造需要设定!');
						return;
					}

					if (!tonid) {
						showError('吨位需要设定!');
						return;
					}

					var property = Ext.getCmp('mt-task-property').getValue();
					var score = Ext.getCmp('mt-task-score').getValue();
					var standardcount = Ext.getCmp('mt-task-standardcount').getValue();
					var changecount = Ext.getCmp('mt-task-changecount').getValue();
					var doublescore = Ext.getCmp('mt-task-doublescore').getValue().doubleScore;

					// 获取成员列表
					var grid = Ext.getCmp('mt-grid-taskstuff').getStore();
					var newRecord = grid.getNewRecords();
					var updateRecord = grid.getUpdatedRecords();
					var removeRecord = grid.getRemovedRecords();

					var sendJson = {
						taskid : me.taskMsg.taskId,
						moduleid : moduleid,
						preciousid : preciousid,
						structid : structid,
						tonid : tonid,
						property : property,
						score : score,
						standardcount : standardcount,
						changecount : changecount,
						doublescore : doublescore,
						newrecord : me.parseRecordToJson(newRecord),
						updaterecord : me.parseRecordToJson(updateRecord),
						removerecord : me.parseRecordToJson(removeRecord),
						allrecord : []
					};

					var _btn = this;

					_btn.setDisabled(true);

					Ext.Ajax.request({
						url : 'project/saveTaskInfo',
						params : {
							data : Ext.JSON.encode(sendJson)
						},
						method : 'POST',
						success : function(resp) {
							var backJson = Ext.JSON.decode(resp.responseText);
							if (backJson.success) {
								taskWindow.close();
								Ext.getStore('mt-store-msg').reload();
								showSuccess(backJson.error);
							} else {
								_btn.setDisabled(false);
								showError(backJson.error);
							}
						},
						failure : function(x, y, z) {
							showError("保存项目任务失败,请检查网络连接!");
						}
					});
				}
			} ]
		});

		me.callParent(arguments);
	},
	/**
	 * 将Record转换我JSON
	 */
	parseRecordToJson : function(records) {
		var data = [];
		if (records) {
			for ( var x in records) {
				data.push(records[x].getData());
			}
		}
		return data;
	},
	/**
	 * 获取Store的数据清单数组
	 */
	getStoreRangeData : function(store) {
		var dataRow = [];
		var _range = store.getRange();
		for ( var x in _range) {
			dataRow.push(_range[x].getData());
		}
	},
	/**
	 * 获取ComboBox的当前选中的项目
	 */
	getComboSelectRecord : function(comboId, valueField) {
		var combo = Ext.getCmp(comboId);
		if (!combo) {
			return (null);
		}

		return combo.getStore().findRecord(valueField, combo.getValue());
	},
	/**
	 * 将其他格式的数字转化为数字
	 */
	parseInt : function(num) {
		try {
			return parseInt(num);
		} catch (e) {
			return 0;
		}
	},
	addTaskInfo : function() {
		var self = this;
		var moduleCode = Ext.getCmp('mt-task-moduleid').getValue();
		if (!moduleCode) {
			showError('请选择模具编号!');
			return;
		}

		var preciousId = Ext.getCmp('mt-property-precious').getValue();
		var structId = Ext.getCmp('mt-property-struct').getValue();
		var tonId = Ext.getCmp('mt-property-ton').getValue();

		var taskProperty = Ext.getCmp('mt-task-property').getValue();
		var taskScore = Ext.getCmp('mt-task-score').getValue();
		var taskStandard = Ext.getCmp('mt-task-standardcount').getValue();
		var taskChange = Ext.getCmp('mt-property-changecount').getValue();

		var taskDouble = Ext.get('mt-task-doublescore').getValue();

		var sendKit = {
			moduleId : self.taskId,
			moduleCode : moduleCode,
			preciousId : preciousId,
			structId : structId,
			tonId : tonId,
			taskProperty : taskProperty,
			taskScore : taskScore,
			taskStandard : taskStandard,
			taskChange : taskChange,
			taskDouble : taskDouble
		};

		Ext.Ajax.request({
			url : '',
			method : 'POST',
			params : {
				data : Ext.data.JSON(sendKit)
			},
			success : function(resp) {
				var backJson = Ext.JSON.decode(resp.responseText);
				if (backJson.success) {
					self.taskId = backJson.taskid;
					showSuccess('保存资料成功!');
				} else {
					showError(backJson.error);
				}
			},
			failure : function(x, y, z) {
				showError('保存资料失败,请检查网络连接!');
				return;
			}
		});
	}
});
Ext.define('Module.GroupManager', {
	extend : 'Ext.window.Window',
	title : '部门单位管理',
	width : 250,
	height : 100,
	modal : true,
	groupInfo : {
		id : '',
		name : '',
		stepid : '',
		type : 0
	},
	resizable : false,
	initComponent : function() {
		var me = this;

		Ext.apply(me, {
			layout : 'border',
			items : [ {
				xtype : 'form',
				region : 'center',
				layout : 'anchor',
				border : false,
				defaults : {
					anchor : '100%',
					padding : 5
				},
				items : [ {
					id : 'mt-group-name',
					xtype : 'textfield',
					emptyText : '请输入内容',
					value : me.groupInfo.name,
					maxLength : 16
				} ],
				buttons : [ {
					text : '保存资料',
					iconCls : 'gtk-save-16',
					handler : function() {
						var groupName = Ext.getCmp('mt-group-name').getValue();
						if (!groupName) {
							showError('单位名称不能为空!');
							return;
						}

						Ext.Ajax.request({
							url : 'project/operateTaskGroup',
							method : 'POST',
							params : {
								id : me.groupInfo.id,
								name : groupName,
								stepid : me.groupInfo.stepid,
								type : me.groupInfo.type
							},
							success : function(resp) {
								var backJson = Ext.JSON.decode(resp.responseText);
								if (backJson.success) {
									me.close();
									Ext.getCmp('mt-department-tree').getStore().reload();
								} else {
									showError((me.groupInfo.type == 0 ? '新增' : '重命名') + '失败!');
									return;
								}
							},
							failure : function(x, y, z) {
								showError('连接服务器失败,请检查网络连接!');
								return;
							}
						});
					}
				}, {
					text : '关闭窗口',
					iconCls : 'gtk-close-16',
					handler : function() {
						me.close();
					}
				} ]
			} ]

		});

		me.callParent(arguments);
	}
});
Ext.define('Module.TaskProperty', {
	extend : 'Ext.window.Window',
	title : '属性管理',
	width : 300,
	height : 250,
	modal : true,
	resizable : false,
	initComponent : function() {
		var me = this;
		Ext.apply(me, {
			layout : 'border',
			items : [ {
				xtype : 'form',
				region : 'center',
				layout : 'anchor',
				border : false,
				defaults : {
					anchor : '100%',
					padding : 5
				},
				items : [ {
					name : 'propertytype',
					xtype : 'combobox',
					fieldLabel : '属性类型',
					labelWidth : 60,
					displayField : 'name',
					valueField : 'id',
					editable : false,
					store : Ext.create('Ext.data.Store', {
						fields : [ 'id', 'name' ],
						autoLoad : true,
						data : [ {
							id : 0,
							name : '精度'
						}, {
							id : 1,
							name : '构造'
						}, {
							id : 2,
							name : '吨位'
						} ]
					}),
					listeners : {
						change : function(combo, nw) {
							Ext.getCmp('mt-propertycode').getStore().load({
								url : 'public/getTaskPropertyByType',
								params : {
									typeid : nw
								}
							});
						}
					}
				}, {
					id : 'mt-propertycode',
					name : 'propertyid',
					xtype : 'combobox',
					fieldLabel : '属性代号',
					labelWidth : 60,
					displayField : 'code',
					valueField : 'id',
					allowBlank : false,
					regex : /^\w+$/,
					store : Ext.create('Ext.data.Store', {
						fields : [ 'id', 'name', 'code', 'score', 'scount' ],
						autoLoad : true,
						proxy : {
							url : '',
							type : 'ajax',
							reader : {
								type : 'json'
							}
						}
					}),
					listeners : {
						change : function(combo, nw) {
							var _store = combo.getStore();
							// 查找输入或者选择的值是否已经存在于服务器
							var _record = _store.findRecord('id', nw);

							Ext.getCmp('mt-propertyname').setValue(_record ? _record.data.name : Ext.emptyString);
							Ext.getCmp('mt-propertyscore').setValue(_record ? _record.data.score : Ext.emptyString);
							Ext.getCmp('mt-propertycount').setValue(_record ? _record.data.scount : Ext.emptyString);
						}
					}
				}, {
					id : 'mt-propertyname',
					name : 'propertyname',
					xtype : 'textfield',
					fieldLabel : '属性描述',
					allowBlank : false,
					labelWidth : 60,
					maxLength : 16
				}, {
					id : 'mt-propertyscore',
					name : 'propertyscore',
					xtype : 'numberfield',
					fieldLabel : '属性积分',
					allowBlank : false,
					labelWidth : 60,
					value : 1,
					minValue : 1,
					maxValue : 5000
				}, {
					id : 'mt-propertycount',
					name : 'propertycount',
					xtype : 'numberfield',
					fieldLabel : '标准次数',
					labelWidth : 60,
					allowBlank : false,
					value : 1,
					minValue : 1,
					maxValue : 50
				} ],
				buttons : [ {
					text : '保存属性',
					iconCls : 'gtk-save-16',
					handler : function() {
						me.doProperty('project/doTaskProperty', true);
					}
				}, '-', {
					text : '删除属性',
					iconCls : 'cancel-16',
					handler : function() {
						me.doProperty('project/doTaskProperty', false);
					}
				} ]
			} ]

		});
		me.callParent(arguments);
	},
	/**
	 * 操作属性方法
	 */
	doProperty : function(url, added) {
		var form = this.down('form').getForm();
		var pcode = Ext.getCmp('mt-propertycode').getRawValue();
		form.submit({
			url : url,
			params : {
				flag : added,
				propertycode : pcode
			},
			success : function(forms, action) {
				var result = Ext.JSON.decode(action.response.responseText);
				if (result.success) {
					form.reset();
				}
			}
		});
	}
});

Ext.define('Module.TaskGroupManager', {
	extend : 'Ext.window.Window',
	title : '组别管理',
	width : 750,
	height : 500,
	bodyPadding : 5,
	modal : true,
	resizable : false,
	initComponent : function() {
		var me = this;
		Ext.apply(me, {
			layout : 'border',
			items : [ {
				id : 'mt-department-tree',
				xtype : 'treepanel',
				region : 'west',
				width : 150,
				rootVisible : false,
				split : true,
				store : Ext.create('Ext.data.TreeStore', {
					autoLoad : true,
					fields : [ 'id', 'text', 'stepid' ],
					proxy : {
						type : 'ajax',
						url : 'public/getTaskGroupList',
						reader : {
							type : 'json',
							root : 'children'// 数据
						},
						extraParams : {
							stepid : ''
						}
					},
					root : {
						text : '管理菜单',
						expanded : true
					},
					listeners : {
						'beforeexpand' : function(node, eOpts) {
							this.proxy.extraParams.stepid = node.raw.stepid;
						}
					}
				}),
				listeners : {
					containercontextmenu : function(tree, e) {
						me.showTreeContextMenu(tree, e, true);
					},
					itemcontextmenu : function(tree, record, item, index, e, eOpts) {
						me.showTreeContextMenu(tree, e, false);
					},
					itemclick : function(tree, record, item, index, e, eOpts) {
						Ext.getCmp('mt-employee-list').getStore().load({
							url : 'public/getTaskStructInfo',
							params : {
								stepid : record.raw.stepid
							}
						});
					}
				}
			}, {
				id : 'mt-employee-list',
				xtype : 'gridpanel',
				title : '组别成员列表',
				region : 'center',
				forceFit : true,
				tbar : [ {
					xtype : 'combobox',
					displayField : 'mergename',
					anyMatch : true,
					valueField : 'id',
					minChars : 0,
					store : Ext.create('Ext.data.Store', {
						fields : [ 'id', 'worknumber', 'empname', 'mergename' ],
						autoLoad : true,
						proxy : {
							url : 'public/getEmployeeByVague',
							actionMethods : {
								read : 'POST'
							},
							type : 'ajax',
							reader : {
								type : 'json'
							}
						}
					}),
					emptyText : '请输入成员名称',
					maxLength : 16
				}, {
					text : '新增成员',
					iconCls : 'add-16',
					handler : function() {
						// 获取结构树中选择的节点
						var _treeSelect = Ext.getCmp('mt-department-tree').getSelectionModel().getSelection();
						if (!_treeSelect.length) {
							showError('请先选择组织单位!');
							return;
						}

						// 获取员工的唯一ID号
						var _empCombo = this.up().down('combobox');
						var _empid = _empCombo.getValue();

						var _eIndex = _empCombo.getStore().findExact('id', _empid);
						if (_eIndex < 0) {
							showError('没有选中任何员工!');
							return;
						}

						var gridStore = this.up('gridpanel').getStore();

						Ext.Ajax.request({
							url : 'project/addTaskStruct',
							method : 'POST',
							params : {
								groupid : _treeSelect[0].get('id'),
								empid : _empid
							},
							success : function(resp) {
								var backJson = Ext.JSON.decode(resp.responseText);
								if (backJson.success) {

									gridStore.reload();
									_empCombo.setValue(Ext.emptyString);

									showSuccess('更新人员讯息成功!');
								} else {
									showError('更新人员讯息失败!');
								}
							},
							failure : function(x, y, z) {
								showError('连接服务器失败,请检查网络连接!');
							}
						});

					}
				} ],
				store : Ext.create('Ext.data.Store', {
					fields : [ 'id', 'empname', 'deptname', 'isgeneral', 'ismajor', 'isgroup', 'issum', 'ischecker' ],
					autoLoad : true,
					proxy : {
						url : '',
						type : 'ajax',
						reader : {
							type : 'json'
						}
					},
					listeners : {
						update : function(store, record, operation, modfield) {
							Ext.Ajax.request({
								url : 'project/updateTaskStruct',
								method : 'POST',
								params : {
									uniqueId : 'id',
									uniqueVal : record.get('id'),
									updateCol : modfield,
									updateVal : record.get(modfield)
								},
								success : function(resp) {
									var backJson = Ext.JSON.decode(resp.responseText);
									if (backJson.success) {
										store.reload();
										showSuccess('更新人员讯息成功!');
									} else {
										showError('更新人员讯息失败!');
									}
								},
								failure : function(x, y, z) {
									showError('连接服务器失败,请检查网络连接!');
								}
							});
						}
					},
				}),
				columns : [ {
					xtype : 'rownumberer'
				}, {
					text : '成员名称',
					dataIndex : 'empname'
				}, {
					text : '所在部门',
					dataIndex : 'deptname'
				}, {
					xtype : 'checkcolumn',
					text : '总负责人',
					dataIndex : 'isgeneral',
					width : 65
				}, {
					xtype : 'checkcolumn',
					text : '项目经理',
					dataIndex : 'ismajor',
					width : 65
				}, {
					xtype : 'checkcolumn',
					text : '组长',
					dataIndex : 'isgroup',
					width : 65
				}, {
					xtype : 'checkcolumn',
					text : '会审成员',
					dataIndex : 'ischecker',
					width : 65
				}, {
					xtype : 'checkcolumn',
					text : '核算人数',
					dataIndex : 'issum',
					width : 65
				}, {
					xtype : 'actioncolumn',
					text : '删除',
					width : 40,
					items : [ {
						iconCls : 'gtk-delete-16',
						handler : function(grid, rowIndex, colIndex) {
							Ext.Msg.confirm('确认', '是否要删除该组织成员?', function(e) {
								if (e == 'yes') {
									Ext.Ajax.request({
										url : 'project/deleteTaskStruct',
										method : 'POST',
										params : {
											uniqueId : 'id',
											uniqueVal : grid.getStore().getAt(rowIndex).get('id')
										},
										success : function(resp) {
											var backJson = Ext.JSON.decode(resp.responseText);
											if (backJson.success) {
												grid.getStore().reload();
												showSuccess('更新人员讯息成功!');
											} else {
												showError('更新人员讯息失败!');
											}
										},
										failure : function(x, y, z) {
											showError('连接服务器失败,请检查网络连接!');
										}
									});
								}
							});
						}
					} ]
				} ]
			} ]
		});
		me.callParent(arguments);
	},
	showTreeContextMenu : function(tree, e, flag) {
		e.preventDefault();
		var treeMenu = new Ext.menu.Menu({
			items : [ {
				text : "新增",
				iconCls : "add-16",
				pressed : false,
				handler : function() {
					var departTree = Ext.getCmp('mt-department-tree');
					var _treeSel = departTree.getSelectionModel().getSelection();

					new Module.GroupManager({
						groupInfo : {
							id : (!_treeSel.length ? '' : _treeSel[0].get('id')),
							stepid : (!_treeSel.length ? '' : _treeSel[0].get('stepid')),
							name : '',
							type : 0
						}
					}).show();
				}
			}, {
				text : "重命名",
				iconCls : "pencil-16",
				pressed : false,
				disabled : flag,
				handler : function() {
					var departTree = Ext.getCmp('mt-department-tree');
					var _treeSel = departTree.getSelectionModel().getSelection();

					new Module.GroupManager({
						groupInfo : {
							id : (!_treeSel.length ? '' : _treeSel[0].get('id')),
							stepid : (!_treeSel.length ? '' : _treeSel[0].get('stepid')),
							name : (!_treeSel.length ? '' : _treeSel[0].get('text')),
							type : 1
						}
					}).show();
				}
			}, {
				text : "删除",
				disabled : flag,
				iconCls : "delete-16",
				pressed : false,
				handler : function() {
					var departTree = Ext.getCmp('mt-department-tree');
					var _treeSel = departTree.getSelectionModel().getSelection();

					if (!_treeSel.length) {
						showInfo('没有选择要删除的部门!');
						return;
					}

					Ext.Msg.confirm('确认', '是否要删除部门以及员工资料?', function(y) {
						if (y == 'yes') {
							Ext.Ajax.request({
								url : 'project/operateTaskGroup',
								method : 'POST',
								params : {
									id : _treeSel[0].get('id'),
									name : _treeSel[0].get('text'),
									stepid : _treeSel[0].get('stepid'),
									type : 2
								},
								success : function(resp) {
									var backJson = Ext.JSON.decode(resp.responseText);
									if (backJson.success) {
										departTree.getStore().getProxy().extraParams.stepid = Ext.emptyString;
										departTree.getStore().load();
										Ext.getCmp('mt-employee-list').getStore().reload();
									} else {
										showError('删除组织单位失败!');
										return;
									}
								},
								failure : function(x, y, z) {
									showError('连接服务器失败,请检查网络连接!');
									return;
								}
							});
						}
					});
				}
			} ]
		});

		treeMenu.showAt(e.getXY());
	}
});

Ext
		.define(
				'Module.ModuleTask',
				{
					extend : 'Ext.panel.Panel',
					title : '加工工件查询',
					layout : 'border',
					mainStore : Ext.create('Ext.data.Store', {
						id : 'mt-store-msg',
						fields : [ 'id', 'guestcode', 'modulebarcode', 'preciousid', 'structid', 'tonid', 'modulecode', 'propertycode',
								'propertyscore', 'standardcount', 'changecount', 'hitdate', 'particulardate', 'moduleframedate', 'modulecoredate',
								'bomdate', 'otherparticulardate', 'otherdesigndate', 'designcheckdate', 'moduleblockdate', 'mainparticulardate',
								'otherbuydate', 'standardpartdate', 'nonstandarddate', 'partprocessdate', 'partfixdate', 'modulefixdate',
								'finishdate', 'isover', 'isdouble' ],
						proxy : {
							url : 'public/getTaskInfo',
							type : 'ajax',
							reader : {
								type : 'json'
							}
						},
						autoLoad : true,
						pageSize : 30
					}),
					initComponent : function() {
						var me = this;
						me.items = [
								{
									xtype : 'panel',
									region : 'west',
									width : 200,
									title : '模具任务说明',
									bodyPadding : 5,
									collapsible : true,
									split : true,
									html : '1.立项检讨，项目经理作成项目进度主计划任务书。<br>2.根据项目的数量来累计积分。模具越多，积分越高。<br>3.根据项目实施过程中的计划实施情况扣除及奖励额外积分：<br>所有模具修理一次OK,额外奖励1倍积分，每减少一次修理额外奖励1/N积分（标准修理次数），每增加一次修理惩罚2/N扣除积分，不设上限。<br>4.模具验收合格后，项目经理计算出最终积分。<br>5.积分奖励：<br>以单套模具积分为基数，全体组员占积分30%奖励；主要负责人占积分48%奖励；组长占积分12%奖励；项目经理占5%奖励。如果积分为负数，同样按相应比例承担损失。<br>6.会审组奖励：<br><font color = red>会审组占积分4%的奖励，必须满足以下条件：<br>----无严重结构缺陷：装模不成功；试模失败；修模困难。</font>'
								}, {
									xtype : 'panel',
									region : 'center',
									border : false,
									layout : 'border',
									items : [ {
										xtype : 'gridpanel',
										rowLines : true,
										columnLines : true,
										tbar : [ {
											text : '新增计划',
											iconCls : 'add-16',
											handler : function() {
												new Module.TaskInfoManager({
													taskMsg : {
														taskId : null,
														property : null,
														disabled : false,
														moduleid : null,
														precious : null,
														score : 0,
														struct : null,
														ton : null,
														standard : null,
														change : 0,
														checked : true,
														unchecked : false
													}
												}).show();
											}
										}, '-', {
											text : '属性管理',
											iconCls : 'table-16',
											handler : function() {
												new Module.TaskProperty().show();
											}
										}, '-', {
											text : '组别管理',
											iconCls : 'group-16',
											handler : function() {
												new Module.TaskGroupManager().show();
											}
										} ],
										dockedItems : [ {
											xtype : 'pagingtoolbar',
											store : me.mainStore,
											dock : 'bottom',
											displayInfo : true
										} ],
										title : '项目计划进度',
										region : 'center',
										store : me.mainStore,
										columns : [ {
											xtype : 'rownumberer'
										}, {
											text : '客户番号',
											dataIndex : 'guestcode',
											locked : true
										}, {
											text : '内部编号',
											dataIndex : 'modulecode',
											locked : true
										}, {
											text : '属性',
											dataIndex : 'propertycode',
											locked : true
										}, {
											text : '积分',
											dataIndex : 'propertyscore',
											align : 'right',
											locked : true
										}, {
											text : '标准次数',
											dataIndex : 'standardcount',
											align : 'right',
											locked : true
										}, {
											text : '设变次数',
											align : 'right',
											dataIndex : 'changecount',
											locked : true
										}, {
											text : '<b>设计（提交资料及出图日期）</b>',
											columns : [ {
												text : '打合确认',
												dataIndex : 'hitdate',
												align : 'center',
												width : 100
											}, {
												text : '主要材料',
												dataIndex : 'particulardate',
												align : 'center',
												width : 100
											}, {
												text : '模架',
												dataIndex : 'moduleframedate',
												align : 'center',
												width : 100
											}, {
												text : '主模仁图纸',
												dataIndex : 'modulecoredate',
												align : 'center',
												width : 100
											}, {
												text : 'BOM清单',
												dataIndex : 'bomdate',
												align : 'center',
												width : 100
											}, {
												text : '其它材料',
												dataIndex : 'otherparticulardate',
												align : 'center',
												width : 100
											}, {
												text : '其它零件图纸',
												dataIndex : 'otherdesigndate',
												align : 'center',
												width : 100
											}, {
												text : '设计评审',
												dataIndex : 'designcheckdate',
												align : 'center',
												width : 100
											} ]
										}, {
											text : '<b>采购（物料收货日期）</b>',
											columns : [ {
												text : '模胚',
												align : 'center',
												dataIndex : 'moduleblockdate'
											}, {
												text : '主要材料',
												align : 'center',
												dataIndex : 'mainparticulardate'
											}, {
												text : '其它材料',
												align : 'center',
												dataIndex : 'otherbuydate'
											}, {
												text : '标准件',
												align : 'center',
												dataIndex : 'standardpartdate'
											}, {
												text : '非标准件',
												align : 'center',
												dataIndex : 'nonstandarddate'
											} ]
										}, {
											text : '<b>生产</b>',
											columns : [ {
												text : '零件加工',
												align : 'center',
												dataIndex : 'partprocessdate'
											} ]
										}, {
											text : '<b>组立</b>',
											columns : [ {
												text : '部件装配',
												align : 'center',
												dataIndex : 'partfixdate'
											}, {
												text : '配模',
												align : 'center',
												dataIndex : 'modulefixdate'
											} ]
										}, {
											text : '<b>生准（装配和修正日期）</b>',
											columns : [ {
												text : '试模以及设变'
											}, {
												text : '交模',
												align : 'center',
												dataIndex : 'finishdate'
											} ]
										} ],
										listeners : {
											// TODO 双击显示任务计划讯息
											itemdblclick : function(grid, record) {
												var json = record.getData();
												new Module.TaskInfoManager({
													taskMsg : {
														taskId : json.id,
														property : json.propertycode,
														disabled : true,
														moduleid : json.modulebarcode,
														precious : json.preciousid,
														score : json.propertyscore,
														struct : json.structid,
														ton : json.tonid,
														standard : json.standardcount,
														change : json.changecount,
														checked : (json.isdouble == 1),
														unchecked : (json.isdouble == 0)
													}
												}).show();
											}
										}
									} ]
								} ];
						me.callParent(arguments);
					}
				});