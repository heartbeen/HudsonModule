/**
 * 系统设置管理
 */
Ext.define('Module.RootManager', {
	extend : 'Ext.panel.Panel',

	layout : 'border',

	initComponent : function() {
		var me = this;

		Ext.apply(me, {
			items : [ {
				xtype : 'panel',
				region : 'west',
				width : 158,
				bodyPadding : 10,
				layout : {
					type : 'anchor'
				},
				title : '',
				defaults : {
					anchor : '100%',
					margin : '0 0 5 0',
					allowDepress : false,
					destroyMenu : false,
					enableToggle : true,
				},
				items : [ {
					xtype : 'button',
					id : 'ins-user',
					pressed : true,
					text : '用户管理',
					toggleGroup : 'system-config',
					handler : function(btn) {
						me.onSubmitDataInfo001("onContentChange");
					}
				}, {
					xtype : 'button',
					id : 'item-authority',
					text : '功能路径管理',
					toggleGroup : 'system-config',
					handler : function(btn) {
						me.onSubmitDataInfo003("onContentChange");
					}
				}, {
					xtype : 'button',
					id : 'role-posts',
					text : '角色与权限管理',
					toggleGroup : 'system-config',
					handler : function(btn) {
						me.onSubmitDataInfo004("onContentChange");
					}

				}, {
					xtype : 'button',
					id : 'account-info',
					text : '登录账号管理',
					toggleGroup : 'system-config',
					handler : function(btn) {
						me.onSubmitDataInfo005("onContentChange");
					}
				} ]
			}, {
				xtype : 'container',
				region : 'center',
				id : 'system-setting-panel',
				margin : '0 0 0 5',
				layout : 'card',
				activeItem : 0, // 默认显示第一个子面板
				animCollapse : true,
				layoutConfig : {
					animate : true
				},
				items : [ Ext.create('Module.AddUserInfo'), Ext.create("Module.sublevel.ActionPathManager"), {
					title : '角色与权限管理',
					id : 'id003',
					layout : 'border',
					bodyPadding : 5,
					items : [
					// {
					// xtype : 'fieldset',
					// title : '角色信息',
					// region : 'north',
					// height : 150,
					// items : [ {
					// xtype : 'textfield',
					// id : 'role-id',
					// width : 300,
					// fieldLabel : '角色ID',
					// labelWidth : 60
					// }, {
					// xtype : 'textfield',
					// id : 'role-name',
					// width : 300,
					// fieldLabel : '角色名称',
					// labelWidth : 60
					// }, {
					// xtype : 'button',
					// minWidth : 80,
					// text : '新增角色',
					// scope : me,
					// handler : me.onSubmitRole,
					// iconCls : 'gtk-apply-16'
					// } ]
					// },
					{
						xtype : 'container',
						region : 'center',
						layout : 'border',
						items : [ {
							xtype : 'treepanel',
							id : 'role-treepanel',
							region : 'west',
							split : true,
							width : 205,
							animCollapse : true,
							collapsed : false,
							collapsible : true,
							title : '角色列表',
							rootVisible : false,
							store : Ext.create('Ext.data.TreeStore', {
								autoLoad : false,
								proxy : {
									type : 'ajax',
									url : 'public/queryRoleTree',
									reader : {
										type : 'json',
										root : 'children'
									}
								},
								listeners : {
									load : function(store, node, records, successful) {
										if (successful) {
											Ext.Array.forEach(records, function(record) {
												record.set("leaf", true);
												record.set("iconCls", "user_gray-16");
											});
										}
									}
								}
							}),
							listeners : {
								scope : me,
								select : me.onWorkItemInfoDetail
							},
							tbar : [ {
								xtype : 'textfield',
								emptyText : '请填写角色名称'
							}, '->', {
								text : '新增',
								iconCls : 'add-16',
								handler : me.onSubmitRole
							} ]
						}, {
							xtype : 'treepanel',
							id : 'rolePosGrid',
							region : 'center',
							title : '权限分配',
							autoScroll : true,
							rootVisible : false,
							store : Ext.create('Ext.data.TreeStore', {
								autoLoad : false,
								fields : [ 'authposid', 'roleid', 'authid', 'posid', 'authok', 'rolename', 'posname', 'name', 'id' ],
								nodeParam : 'id',
								proxy : {
									type : 'ajax',
									url : '',
									reader : {
										type : 'json',
										root : 'children'
									}
								}
							}),
							useArrows : true,
							listeners : {
								scope : me,
								checkchange : me.onRolePermissionsChange
							},
							columns : [ {
								xtype : 'treecolumn',
								dataIndex : 'name',
								flex : 1,
								text : '权限列表'
							} ]
						} ]
					} ]
				}, Ext.create("Module.sublevel.LoginRoleManager") ],
				buttons : [ {
					text : '上一步',
					width : 60,
					id : 'prevs01',
					handler : function(btn) {
						me.changeTab(btn.up("panel"), "prev");
					}
				}, {
					text : '下一步',
					width : 60,
					id : 'prevt02',
					handler : function(btn) {
						me.changeTab(btn.up("panel"), "next");
					}
				}, {
					text : '完成',
					width : 60,
					id : 'prevst03',
				// handler : me.onSubmitDataInfo()
				} ]
			} ]
		});

		me.callParent(arguments);
	},

	changeTab : function(panel, direction) {
		var layout = panel.getLayout();
		layout[direction]();
		Ext.getCmp('prevs').setDisabled(!layout.getPrev());
		Ext.getCmp('prevt').setDisabled(!layout.getNext());
	},

	onSubmitDataInfo001 : function(direction) {
		var layout = Ext.getCmp('system-setting-panel').getLayout();
		layout.setActiveItem(0);
	},
	onSubmitDataInfo003 : function(direction) {
		var layout = Ext.getCmp('system-setting-panel').getLayout();
		layout.setActiveItem(1);
	},
	onSubmitDataInfo004 : function(direction) {
		var layout = Ext.getCmp('system-setting-panel').getLayout();
		layout.setActiveItem(2);

		var store = Ext.getCmp('role-treepanel').getStore();
		if (store.getRootNode().childNodes.length == 0) {
			store.load();
		}

	},
	onSubmitDataInfo005 : function(direction) {
		var layout = Ext.getCmp('system-setting-panel').getLayout();
		layout.setActiveItem(3);
	},

	/**
	 * 创建用户角色
	 */
	onSubmitRole : function() {
		var roleField = this.up().down('textfield');
		var roleName = roleField.getValue();
		if (!roleName) {
			showError('角色名称不能为空!');
			return;
		}

		Ext.MessageBox.show({
			title : '角色信息',
			msg : '你确定要新增该角色信息？',
			buttons : Ext.MessageBox.YESNO,
			buttonText : {
				yes : "確定",
				no : "取消"
			},
			fn : function(buttonId) {
				if (buttonId == 'yes') {

					Ext.Ajax.request({
						url : 'module/base/insertRole',
						params : {
							"role.roleId" : '000',
							"role.roleName" : roleName
						},
						success : function(response) {
							var res = JSON.parse(response.responseText);
							App.InterPath(response, function() {
								if (res.success) {
									showSuccess(res.msg);
									// 将角色名称输入框设置为空
									roleField.setValue(Ext.emptyString);
									// 重新加载系统角色数据
									Ext.getCmp('role-treepanel').getStore().load();
								} else {
									showError(res.msg);
								}
							});

						},
					});
				}
			}
		});
	},

	/**
	 * 得到角色所拥有的主模块列表
	 */
	onWorkItemInfoDetail : function(treepanel, record, index, eOpts) {
		var me = this;

		if (record) {
			me.roleId = record.data.id;

			// 产生对应角色的url
			var store = Ext.getCmp('rolePosGrid').getStore();
			store.proxy.url = "system/queryRoleAuthority?roleId=" + me.roleId;

			store.load({
				url : 'system/queryMainModule'
			});
		}
	},

	/**
	 * 角色对应权限操作
	 */
	onRolePermissionsChange : function(node, checked) {
		var me = this;
		Ext.Ajax.request({
			url : checked ? 'system/createRoleAuthority' : 'system/deleteRoleAuthority',
			params : checked ? {
				"rp.roleId" : me.roleId,
				"rp.authId" : node.data.authid
			} : {
				roleId : me.roleId,
				authPosId : node.data.authposid
			},
			success : function(response) {
				var res = JSON.parse(response.responseText);

				App.InterPath(res, function() {
					if (res.success) {
						showSuccess(res.msg);

						if (checked) {
							node.set("authposid", res.authPosId);
						}
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
