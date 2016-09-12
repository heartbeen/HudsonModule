/**
 * 功能路径管理介面
 */
Ext.define("Module.sublevel.ActionPathManager", {
	extend : "Ext.panel.Panel",

	editRecord : null,

	initComponent : function() {
		var me = this;
		Ext.applyIf(me, {
			title : '功能路径信息',
			bodyPadding : 5,
			layout : 'border',
			dockedItems : [ {
				xtype : 'toolbar',
				items : [ {
					text : '新增路径',
					minWidth : 80,
					scope : me,
					handler : me.onSubmitAuthority,
					iconCls : 'gtk-apply-16'
				} ]
			} ],
			items : [ {
				xtype : 'fieldset',
				region : 'north',
				title : '功能信息',
				items : [ {
					xtype : 'textfield',
					id : 'auth-name',
					width : 400,
					fieldLabel : '功能路径',
					labelWidth : 80,
					maxLength : 200
				}, {
					xtype : 'textfield',
					id : 'userpath-name',
					width : 400,
					fieldLabel : '路径描述',
					labelWidth : 80,
					maxLength : 100
				}, {
					xtype : 'combobox',
					id : 'module-id',
					width : 300,
					fieldLabel : '对应模块名称',
					labelWidth : 80,
					valueField : 'id',
					displayField : 'text',
					editable : false,
					store : Ext.create('Ext.data.Store', {
						fields : [ {
							type : 'string',
							name : 'id'
						}, {
							type : 'string',
							name : 'text'
						} ],
						proxy : {
							type : 'ajax',
							url : 'public/getSubFunctionList',
							reader : {
								type : 'json'
							}
						}
					})
				}, {
					xtype : 'combobox',
					id : 'auth-typest',
					fieldLabel : '路径类型',
					labelWidth : 80,
					width : 300,
					valueField : 'value',
					displayField : 'text',
					editable : false,
					store : new Ext.data.Store({
						fields : [ 'value', 'text' ],
						data : [ {
							value : 0,
							text : '查询'
						}, {
							value : 1,
							text : '新增'
						}, {
							value : 2,
							text : '修改'
						}, {
							value : 3,
							text : '删除'
						} ]
					})
				} ]
			}, {
				xtype : 'gridpanel',
				id : 'authorityGrid',
				title : '功能路径列表',
				region : 'center',
				store : Ext.create('Ext.data.Store', {
					autoLoad : true,
					fields : [ 'authid', 'authname', 'userpathname', 'authtype', 'authtypename', 'moduleid', 'text' ],
					proxy : {
						type : 'ajax',
						url : 'module/base/authorityList',
						reader : {
							type : 'json'
						}
					},
					listeners : {
						load : function(store, records, successful) {
							if (successful) {
								Ext.Array.forEach(records, function(item) {
									if (item.data.authtype == 0) {
										item.data.authtypename = '查询';
									} else if (item.data.authtype == 1) {
										item.data.authtypename = '新增';
									} else if (item.data.authtype == 2) {
										item.data.authtypename = '修改';
									} else {
										item.data.authtypename = '删除';
									}
								});
							}
						}
					}
				}),
				columns : [ {
					xtype : 'gridcolumn',
					dataIndex : 'authname',
					width : 360,
					text : '路径名称',
					field : {
						xtype : 'textfield',
						maxLength : 200
					}
				}, {
					xtype : 'gridcolumn',
					dataIndex : 'userpathname',
					width : 200,
					text : '路径描述',
					field : {
						xtype : 'textfield',
						maxLength : 100
					}
				}, {
					xtype : 'gridcolumn',
					dataIndex : 'text',
					width : 120,
					text : '所属模块',
					field : {
						xtype : 'combobox',
						valueField : 'id',
						displayField : 'text',
						queryMode : 'remote',
						editable : false,
						store : Ext.create('Ext.data.Store', {
							fields : [ {
								type : 'string',
								name : 'id'
							}, {
								type : 'string',
								name : 'text'
							} ],
							proxy : {
								type : 'ajax',
								url : 'public/getSubFunctionList',
								reader : {
									type : 'json'
								}
							}
						})
					}
				}, {
					xtype : 'gridcolumn',
					dataIndex : 'authtypename',
					width : 60,
					text : '路径类型',
					field : {
						xtype : 'combobox',
						valueField : 'value',
						displayField : 'text',
						editable : false,
						store : new Ext.data.Store({
							fields : [ 'value', 'text' ],
							data : [ {
								value : 0,
								text : '查询'
							}, {
								value : 1,
								text : '新增'
							}, {
								value : 2,
								text : '修改'
							}, {
								value : 3,
								text : '删除'
							} ]
						})

					}
				}, { // 删除工艺
					xtype : 'actioncolumn',
					width : 30,
					sortable : false,
					items : [ {
						iconCls : 'cancel-16',
						handler : me.onConfirmAuthority
					} ]
				} ],
				plugins : [ Ext.create('Ext.grid.plugin.RowEditing', {
					clicksToMoveEditor : 1,
					listeners : {
						beforeedit : function(editor, e) {
							me.editRecord = e.record;
						}
					},
					// over
					validateEdit : function() {
						var e = this;
						me.updateAuthority(e.context.record, e.editor.items.items);

						return false;
					}
				}) ]
			} ]
		});

		me.callParent(arguments);
	},

	/**
	 * 提交新功能路径
	 */
	onSubmitAuthority : function() {
		var authName = App.getRawValue('auth-name');
		var userpathname = App.getRawValue('userpath-name');

		if (authName.length == 0) {
			showInfo('路径名称不能为空,请填写路径名称!');
			return;
		}
		if (userpathname.length == 0) {
			showInfo('路径描述不能为空,请填写路径描述!');
			return;
		}
		var moduleId = Ext.getCmp("module-id").getValue();

		if (moduleId == null) {
			showInfo('对应模块名称不能为空,请填写对应模块名称!');
			return;
		}

		var authtype = Ext.getCmp("auth-typest").getValue();
		if (authtype == null) {
			showInfo('路径类型不能为空,请填写路径类型!');
			return;
		}

		Ext.MessageBox.show({
			title : '对应路径',
			msg : '你确定要新增该相应路径？',
			buttons : Ext.MessageBox.YESNO,
			buttonText : {
				yes : "確定",
				no : "取消"
			},
			fn : function(buttonId) {
				if (buttonId == 'yes') {
					Ext.Ajax.request({
						url : 'module/base/insertAuthority',
						params : {
							"auth.authName" : authName,
							"auth.userPathName" : userpathname,
							"auth.authType" : authtype,
							"auth.moduleId" : moduleId
						},
						success : function(response) {
							var res = JSON.parse(response.responseText);

							App.InterPath(res, function() {
								if (res.success) {
									showSuccess("功能路径新增成功!");
									Ext.getCmp('authorityGrid').getStore().load();
									App.setValue('auth-name', '');
									App.setValue('userpath-name', '');
									App.setValue('module-id', '');
									App.setValue('auth-typest', '');
								} else {
									showError("功能路径新增失败!");
								}
							});
						},
						failure : function(response) {
							showError("服务内部错误!");
						}
					});
				}
			}
		});
	},

	/**
	 * 提交新功能路径
	 */
	updateAuthority : function(record, editors) {

		if (editors[0].lastValue == editors[0].originalValue && editors[1].lastValue == editors[1].originalValue
				&& editors[3].lastValue == editors[3].originalValue && editors[2].lastValue == editors[2].originalValue) {
			showInfo("功能路径信息没有发生改变!");
			return;
		}

		var params = {
			"auth.authid" : record.data.authid
		};

		if (editors[0].lastValue != editors[0].originalValue) {
			if (editors[0].getValue().length == 0) {
				showInfo('路径名称不能为空,请填写路径名称!');
				return;
			}
			params["auth.authName"] = editors[0].getValue();
		}

		if (editors[1].lastValue != editors[1].originalValue) {
			if (editors[1].getValue() == 0) {
				showInfo('路径描述不能为空,请填写路径描述!');
				return;
			}
			params["auth.userPathName"] = editors[1].getValue();
		}

		if (editors[3].lastValue != editors[3].originalValue) {
			if (editors[3].getValue() == null) {
				showInfo('对应模块名称不能为空,请填写对应模块名称!');
				return;
			}
			params["auth.authType"] = editors[3].getValue();
		}

		if (editors[2].lastValue != editors[2].originalValue) {
			params["auth.moduleId"] = editors[2].getValue();
		}

		Ext.MessageBox.show({
			title : '对应路径',
			msg : '确定更新功能路径？',
			buttons : Ext.MessageBox.YESNO,
			buttonText : {
				yes : "確定",
				no : "取消"
			},
			fn : function(buttonId) {
				if (buttonId == 'yes') {
					Ext.Ajax.request({
						url : 'module/base/updateAuthority',
						params : params,
						success : function(response) {
							var res = JSON.parse(response.responseText);

							App.InterPath(res, function() {
								if (res.success) {
									showSuccess("功能路径更新成功!");
									record.set("authname", editors[0].getValue());
									record.set("userpathname", editors[1].getValue());
									record.set("text", editors[2].getRawValue());
									record.set("moduleid", editors[2].getValue());
									record.set("authtypename", editors[3].getRawValue());
									record.set("authtype", editors[3].getValue());

									record.commit();
								} else {
									showError("功能路径更新失败!");
									record.cancelEdit();
								}
							});
						},
						failure : function(response) {
							showError("服务内部错误!");
						}
					});
				}
			}
		});
	},

	/**
	 * 删除功能路径
	 */
	onConfirmAuthority : function(grid, rowIndex, colIndex) {
		var store = grid.getStore();

		Ext.MessageBox.show({
			title : '对应记录',
			msg : '你確定要刪除該條記錄？',
			buttons : Ext.MessageBox.YESNO,
			buttonText : {
				yes : "删除",
				no : "不删除"
			},
			fn : function(buttonId) {
				if (buttonId == 'yes') {

					Ext.Ajax.request({
						url : 'module/base/deleteAuthority',
						params : {
							authId : store.getAt(rowIndex).data.authid
						},
						success : function(response) {
							var res = JSON.parse(response.responseText);
							Ext.MessageBox.hide();

							App.InterPath(res, function() {
								if (res.success) {
									store.removeAt(rowIndex);
									showSuccess("功能路径刪除成功!");
								} else {
									showError("功能路径刪除失败,请重试!");
								}
							});
						},
						failure : function(response) {
							showError("服务内部错误!");
						}
					});
				}
			}
		});
	}
});