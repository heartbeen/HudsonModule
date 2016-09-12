/**
 * 登录账号管理介面
 */
Ext.define("Module.sublevel.LoginRoleManager", {
	extend : "Ext.panel.Panel",

	initComponent : function() {
		var me = this;
		Ext.applyIf(me, {
			title : '登录账号管理',
			layout : 'border',
			bodyPadding : 5,
			items : [ {
				xtype : 'fieldset',
				title : '新建用户',
				region : 'north',
				items : [ {
					xtype : 'textfield',
					id : 'user-name',
					width : 300,
					fieldLabel : '登陆账号',
					labelWidth : 80
				}, {
					xtype : 'textfield',
					id : 'pass-word',
					width : 300,
					fieldLabel : '用户密码',
					labelWidth : 80
				}, {
					xtype : 'combobox',
					id : 'role-posiduut',
					width : 300,
					fieldLabel : '角色名称',
					labelWidth : 80,
					valueField : 'roleid',
					displayField : 'rolename',
					editable : false,

					// 工号下拉框
					store : Ext.create('Ext.data.Store', {

						fields : [ {
							type : 'string',
							name : 'roleid'
						}, {
							type : 'string',
							name : 'rolename'
						} ],

						proxy : {
							type : 'ajax',
							url : 'public/getRoleDataList',
							reader : {
								type : 'json',
								root : 'auth'
							}
						}

					})
				}, {
					xtype : 'combobox',
					id : 'na-turesuk',
					fieldLabel : '帐户是否有效',
					labelWidth : 80,
					width : 300,
					valueField : 'value',
					displayField : 'text',
					editable : false,

					store : new Ext.data.Store({
						fields : [ 'value', 'text' ],
						data : [ {
							text : '无效',
							value : 0
						}, {
							text : '有效',
							value : 1
						} ]
					})
				}, {
					xtype : 'button',
					minWidth : 80,
					text : '新增用户',
					margin : '0 0 8 0',
					scope : me,
					handler : me.onSubmitAccountInfo,
					iconCls : 'gtk-apply-16'
				} ]
			}, {
				xtype : 'gridpanel',
				id : 'accountInfoGrid',
				region : 'center',
				autoScroll : true,
				store : Ext.create('Ext.data.Store', {
					autoLoad : true,
					fields : [ 'username', 'empname', 'rolename', 'roleid', 'createtime', 'valid', 'validname', 'accountid' ],
					proxy : {
						type : 'ajax',
						url : 'module/base/accountInfoList',
						reader : {
							type : 'json'
						}
					},
					listeners : {
						load : function(store, records, successful) {
							if (successful) {
								Ext.Array.forEach(records, function(item) {
									item.data.validname = item.data.valid == 0 ? '无效' : '有效';
								});

								store.loadData(records);
							}
						}
					}
				}),
				columns : [ {
					xtype : 'gridcolumn',
					dataIndex : 'username',
					width : 70,
					text : '登录账号'
				}, {
					xtype : 'gridcolumn',
					dataIndex : 'empname',
					width : 100,
					text : '用户名'
				}, {
					xtype : 'gridcolumn',
					dataIndex : 'rolename',
					width : 140,
					text : '用户角色',
					field : {
						xtype : 'combobox',
						valueField : 'roleid',
						displayField : 'rolename',
						editable : false,
						store : Ext.create('Ext.data.Store', {
							fields : [ {
								type : 'string',
								name : 'roleid'
							}, {
								type : 'string',
								name : 'rolename'
							} ],

							proxy : {
								type : 'ajax',
								url : 'public/getRoleDataList',
								reader : {
									type : 'json',
									root : 'auth'
								}
							}
						})
					}
				}, {
					xtype : 'gridcolumn',
					dataIndex : 'validname',
					width : 90,
					text : '帐户是否有效',
					// renderer : function(value, meta, record) {
					// var isValidText = (record.get('valid') > 0 ? '有效' :
					// '无效');
					// record.set('validname', isValidText);
					// return isValidText;
					// },
					field : {
						xtype : 'combobox',
						valueField : 'value',
						displayField : 'text',
						editable : false,

						store : new Ext.data.Store({
							fields : [ 'value', 'text' ],
							data : [ {
								text : '无效',
								value : 0
							}, {
								text : '有效',
								value : 1
							} ]
						})

					}
				}, {
					xtype : 'actioncolumn',
					text : '删除',
					width : 40,
					sortable : false,
					items : [ {
						iconCls : 'cancel-16',
						handler : me.onConfirmAccountInfo
					} ]
				} ],
				plugins : [ Ext.create('Ext.grid.plugin.RowEditing', {
					clicksToMoveEditor : 1,
					autoCancel : true,
					listeners : {
						beforeedit : function(editor, e) {
							me.editRecord = e.record;
						},
						validateedit : function() {
							var e = this;
							me.updateLoginRole(e.context.record, e.editor.items.items);
						}
					}
				}) ],
				dockedItems : [ {
					xtype : 'toolbar',
					items : [ {
						id : 'lrm-query-case',
						xtype : 'combobox',
						fieldLabel : '查询字段',
						labelWidth : 65,
						width : 240,
						ui : 'footer',
						valueField : 'value',
						displayField : 'colName',
						editable : false,
						store : new Ext.data.Store({
							fields : [ 'value', 'colName' ],
							data : [ {
								colName : '登录账号',
								value : 'username'
							}, {
								colName : '用户名',
								value : 'empname'
							}, {
								colName : '用户角色',
								value : 'rolename'
							} ]
						})
					}, {
						id : 'lrm-query-value',
						xtype : 'textfield',
						fieldLabel : '::',
						labelWidth : 10,
						width : 120
					}, {
						text : '查找',
						iconCls : 'page_white_find-16',
						handler : me.onQueryAccountInfo
					} ]
				} ]
			} ]
		});

		me.callParent(arguments);
	},
	onQueryAccountInfo : function() {
		// 设置查询的条件
		var qName = Ext.getCmp('lrm-query-case').getValue();
		var qValue = Ext.getCmp('lrm-query-value').getValue();
		var qList = Ext.getCmp('accountInfoGrid').getStore();

		// if (!qName || !qValue) {
		// showError('查询条件和查询的内容不能为空!');
		// return;
		// }

		qList.load({
			params : {
				colName : qName,
				value : encodeURI(qValue)
			}
		});
	},
	onSubmitAccountInfo : function() {
		var username = App.getRawValue('user-name');
		var password = App.getRawValue('pass-word');

		if (username == '') {
			showInfo("用户名不能为空,请输入用户名!");
			return;
		}
		if (password == '') {
			showInfo("密码不能为空,请输入密码!");
			return;
		}
		var rolePosIdtu = App.getValue("role-posiduut");
		if (rolePosIdtu == null) {
			showInfo("角色名称不能为空,请选择角色名称!");
			return;
		}

		var isvalid = App.getValue('na-turesuk');
		if (isvalid == null) {
			showInfo("帐户是否有效不能为空,请选择帐户是否有效!");
			return;
		}

		Ext.MessageBox.show({
			title : '权限分配',
			msg : '你确定要新增该用户？',
			buttons : Ext.MessageBox.YESNO,
			buttonText : {
				yes : "確定",
				no : "取消"
			},
			fn : function(buttonId) {
				if (buttonId == 'yes') {

					Ext.Ajax.request({
						url : 'module/base/insertAccountInfo',
						params : {
							"account.username" : username,
							"account.password" : hex_md5(password).toUpperCase(),
							"account.roleId" : rolePosIdtu,
							"account.valid" : isvalid
						},
						success : function(response) {
							var res = JSON.parse(response.responseText);

							App.InterPath(res, function() {
								if (res.success) {
									showSuccess(res.msg);
									Ext.getCmp('accountInfoGrid').getStore().load();
									App.setValue('craft-code', '');
									App.setValue('craft-namest', '');
									App.setValue('descrip-tionst', '');
									App.setValue('iso-wned', '');
									App.setValue('posst-id', '');
								} else {
									showInfo(res.msg);
								}
							});

						},
						failure : function(response) {
							App.Error(response);
							show.destroy();
						},
						failure : function(response) {
							App.Error(response);
							show.destroy();
						}
					});
				}
			}
		});
	},

	/**
	 * 新增登陆账号
	 */
	onConfirmAccountInfo : function(grid, rowIndex, colIndex) {
		var store = grid.getStore();
		var model = store.getAt(rowIndex);

		Ext.MessageBox.show({
			title : '删除用户登录权限',
			msg : '是否删除用户登录权限或一并删除用户信息?',
			buttons : Ext.MessageBox.YESNOCANCEL,
			icon : Ext.MessageBox.QUESTION,
			buttonText : {
				yes : "全部删除",
				no : "只删除登录权限",
				cancel : '取消'
			},
			fn : function(buttonId) {
				if (buttonId == 'cancel') {
					return;
				}

				Ext.Ajax.request({
					url : 'module/base/deleteAccountInfo',
					params : {
						accountId : model.data.accountid,
						allInfo : buttonId == 'yes' ? true : false
					},
					success : function(response) {
						var res = JSON.parse(response.responseText);
						Ext.MessageBox.hide();

						App.InterPath(res, function() {
							if (res.success) {
								showSuccess('成功删除员工讯息!');
								store.removeAt(rowIndex);
							} else {
								showError(res.msg);
							}
						});
					},
					failure : function(response) {
						showError("服务内部错误!");
					}
				});
			}
		});
	},

	/**
	 * 更新登录信息
	 */
	updateLoginRole : function(record, editors) {
		if (editors[2].lastValue == editors[2].originalValue && editors[3].lastValue == editors[3].originalValue) {
			showInfo("登录账号信息没有发生改变!");
			return;
		}

		var params = {
			"acc.accountid" : record.data.accountid
		};

		if (editors[2].lastValue != editors[2].originalValue) {
			params["acc.roleid"] = editors[2].getValue();
		}

		if (editors[3].lastValue != editors[3].originalValue) {
			params["acc.valid"] = editors[3].getValue();
		}

		Ext.MessageBox.show({
			title : '对应路径',
			msg : '确定要更新' + record.data.empname + "的登录信息?",
			buttons : Ext.MessageBox.YESNO,
			buttonText : {
				yes : "確定",
				no : "取消"
			},
			fn : function(buttonId) {
				if (buttonId == 'yes') {
					Ext.Ajax.request({
						url : 'module/base/updateAccountInfo',
						params : params,
						success : function(response) {
							var res = JSON.parse(response.responseText);

							App.InterPath(res, function() {
								if (res.success) {
									showSuccess("登录信息更新成功!");
									record.set("rolename", editors[2].getRawValue());
									record.set("validname", editors[3].getRawValue());
									record.set("roleid", editors[2].getValue());
									record.set("valid", editors[3].getValue());

									record.commit();
								} else {
									showError(res.msg);
									// 取消编辑状态
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
	}

});