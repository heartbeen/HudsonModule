/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */
var pageSize = 5;
var SignedIdrole;
var SignedIdauth;
var SignedIdroleAssign;
var customerId;
var description;
var address;
var inserts;
var updates;
var selects;
var deletes;
var id;
var today = new Date();

var config = '';

function generateData(vals) {
	if (vals) {
		return Ext.JSON.decode(vals);
	} else {
		return [];
	}
};

function getCreateJSONStore(tons, vals, load) {
	return Ext.create('Ext.data.JsonStore', {
		autoLoad : load,
		fields : tons,
		proxy : {
			type : 'ajax',
			url : 'GetRoleData',     
			reader : {
				type : 'json',
				root : 'auth'
			}
		}
	});
}

var authFields = [ 'id', 'roleName', 'createTime' ];

var thorityFields = [ 'authId', 'itemId', 'roleName', 'itemdes', 'c', 'r', 'u', 'd' ];

var assignFields = [ 'roleNametw', 'workNumber', 'userNametw', 'factoryName', 'deptName', 'stationname', 'roleId', 'accountId' ];

var trucks = [ 'userName', 'description', 'isArrange', 'applyTime', 'departuretime', 'address', 'boxNumber', 'boxCount', 'remark' ];

config = config.concat('<h3 style="margin:3px 0;">{description}</h3>');
config = config.concat('<div style="margin-left:10px;">{address}</div>');

/** 派车的计划路线 */
Ext.define('CarInit', {
	extend : 'Ext.data.Model',
	fields : [ 'destination', 'runningDate', 'runningTime' ]
});

Ext.define('Customer', {
	extend : 'Ext.data.Model',

	fields : [ {
		name : 'customerId',
		mapping : 'customerId'
	}, {
		name : 'description',
		mapping : 'description'
	}, {
		name : 'address',
		mapping : 'address'
	} ]
});

/** 车辆运行计划时间 */
Ext.define('TimeColumn', {   
	extend : 'Ext.grid.column.Column',   

	initComponent : function() {
		var me = this;

		Ext.apply(me, {
			dataIndex : this.dataIndex,
			sortable : false,
			width : 45,
			text : this.text,
			format : 'H:i',
			editor : Ext.create('Ext.form.field.Time', {
				increment : 30,
				format : 'H:i'
			})
		});
		me.callParent(arguments);
	}

});

Ext.define('Manage.Business.AuthorityManager', {
	extend : 'Ext.ux.desktop.Module',

	requires : [ 'Ext.tab.Panel' ],

	id : UserAuth.AuthorityManager.itemWebId,

	init : function() {
		this.launcher = {
			text : eval(UserAuth.AuthorityManager.itemTitle),
			iconCls : UserAuth.AuthorityManager.itemIcon + "-16"
		};
	},

	createWindow : function() {
		var me = this;
		var desktop = this.app.getDesktop();
		var win = desktop.getWindow(UserAuth.AuthorityManager.itemWebId);
		if (!win) {
			win = desktop.createWindow({
				id : UserAuth.AuthorityManager.itemWebId,
				title : eval(UserAuth.AuthorityManager.itemTitle),
				height : 597,
				width : 700,
				iconCls : UserAuth.AuthorityManager.itemIcon + "-16",    
				animCollapse : false,
				border : false,
				constrainHeader : true,

				layout : 'border',
				items : [ {
					xtype : 'tabpanel',
					region : 'center',
					activeTab : 0,
					items : [ {
						xtype : 'form',
						id : 'apply-car-form',
						layout : 'border',
						bodyPadding : 10,
						title : '职位管理',
						items : [ {
							xtype : 'container',
							region : 'north',
							items : [ {
								xtype : 'textfield',
								id : 'create-id',
								width : 240,
								fieldLabel : 'ID编号',
								labelWidth : 80,
								maxLength : 100
							}, {
								xtype : 'textfield',
								id : 'role-name',
								width : 240,
								fieldLabel : '职位权限',
								labelWidth : 80,
								maxLength : 100
							}, {
								xtype : 'textfield',
								id : 'create-time',
								fieldLabel : '创建时间',
								allowBlank : false,
								labelWidth : 80,
								width : 240,
								value : App.today(),
								readOnly : true
							} ]
						}, {
							xtype : 'gridpanel',
							id : 'roleGrid',
							region : 'center',
							autoScroll : true,
							store : Ext.create('Ext.data.Store', {
								autoLoad : true,
								fields : authFields,
								proxy : {
									type : 'ajax',
									url : 'GetRoleData',
									reader : {
										type : 'json',
										root : 'auth'
									}
								}
							}),
							listeners : {
								select : function(gridpanel, records, eOpts) {
									if (records) {
										// 得到签核者ID
										id = records[0].data.id;
									}
								}
							},
							columns : [ {
								xtype : 'gridcolumn',
								dataIndex : 'id',
								width : 60,
								text : 'ID编号'
							}, {
								xtype : 'gridcolumn',
								dataIndex : 'roleName',
								width : 435,
								text : '职位权限'
							}, {
								xtype : 'gridcolumn',
								dataIndex : 'createTime',
								width : 120,
								text : '创建时间'
							}, { // 删除工艺
								xtype : 'actioncolumn',
								text : '编辑',
								width : 40,
								flex : 40,
								sortable : false,
								items : [ {
									iconCls : 'edit-delete-16',
									id : 'car-plan-actioncolumn',
									handler : me.onConfirmRole
								} ]
							} ]
						} ],
						dockedItems : [ {
							xtype : 'toolbar',
							dock : 'top',
							items : [ {
								xtype : 'button',
								minWidth : 80,
								text : '提交申请',
								scope : me,
								handler : me.onSubmitRole,
								iconCls : 'gtk-apply-16'
							} ]
						} ]
					}, {
						title : '權限管理',
						xtype : 'form',
						bodyPadding : 10,
						layout : 'border',

						items : [ {
							xtype : 'container',
							region : 'north',
							items : [ {
								xtype : 'combobox',
								id : 'role-names',
								fieldLabel : '職位名稱',
								labelWidth : 80,
								maxWidth : '130',
								valueField : 'id',
								displayField : 'name',
								editable : false,

								// 工号下拉框
								store : Ext.create('Ext.data.Store', {

									fields : [ {
										type : 'string',
										name : 'name'
									}, {
										type : 'string',
										name : 'id'
									} ],

									proxy : {
										type : 'ajax',
										url : 'roleData/signer',
										reader : {
											type : 'json',
											root : 'signers'
										}
									}

								}),
								listeners : {
									select : function(combo, records, eOpts) {
										if (records) {
											// 得到签核者ID
											SignedIdrole = records[0].data.id;

										}
									}
								}
							}, {
								xtype : 'combobox',
								id : 'item-list',
								fieldLabel : '項目清單',
								labelWidth : 80,
								maxWidth : '130',
								valueField : 'id',
								displayField : 'name',
								editable : false,

								// 工号下拉框
								store : Ext.create('Ext.data.Store', {

									fields : [ {
										type : 'string',
										name : 'name'
									}, {
										type : 'string',
										name : 'id'
									} ],

									proxy : {
										type : 'ajax',
										url : 'workItemData/signer',
										reader : {
											type : 'json',
											root : 'signers'
										}
									}

								}),
								listeners : {
									select : function(combo, records, eOpts) {
										if (records) {
											// 得到签核者ID
											SignedIdauth = records[0].data.id;

										}
									}
								}
							}, {
								xtype : 'radiogroup',
								width : 201,
								fieldLabel : '新增权限',
								labelWidth : 68,
								items : [ {
									xtype : 'radiofield',
									id : 'insert-radio',
									name : 'insert-auth',
									checked : true,
									boxLabel : '可以',
									handler : function() {
										inserts = 'Y';
									}
								}, {
									xtype : 'radiofield',
									name : 'insert-auth',
									boxLabel : '不可以',
									handler : function() {
										inserts = 'N';
									}
								} ]
							}, {
								xtype : 'radiogroup',
								width : 201,
								fieldLabel : '修改权限',
								labelWidth : 68,
								items : [ {
									xtype : 'radiofield',
									id : 'update-radio',
									name : 'update-auth',
									checked : true,
									boxLabel : '可以',
									handler : function() {
										updates = 'Y';
									}
								}, {
									xtype : 'radiofield',
									name : 'update-auth',
									boxLabel : '不可以',
									handler : function() {
										updates = 'N';
									}
								} ]
							}, {
								xtype : 'radiogroup',
								width : 201,
								fieldLabel : '查询权限',
								labelWidth : 68,
								items : [ {
									xtype : 'radiofield',
									id : 'select-radio',
									name : 'select-auth',
									checked : true,
									boxLabel : '可以',
									handler : function() {
										selects = 'Y';
									}
								}, {
									xtype : 'radiofield',
									name : 'select-auth',
									boxLabel : '不可以',
									handler : function() {
										selects = 'N';
									}
								} ]
							}, {
								xtype : 'radiogroup',
								width : 201,
								fieldLabel : '删除权限',
								labelWidth : 68,
								items : [ {
									xtype : 'radiofield',
									id : 'delete-radio',
									name : 'delete-auth',
									checked : true,
									boxLabel : '可以',
									handler : function() {
										deletes = 'Y';
									}
								}, {
									xtype : 'radiofield',
									name : 'delete-auth',
									boxLabel : '不可以',
									handler : function() {
										deletes = 'N';
									}
								} ]
							} ]
						}, {
							xtype : 'gridpanel',
							id : 'auth-panel',
							region : 'center',
							store : Ext.create('Ext.data.Store', {
								autoLoad : true,
								fields : thorityFields,
								proxy : {
									type : 'ajax',
									url : 'GetAuthorityData',
									reader : {
										type : 'json',
										root : 'auth'
									}
								}
							}),
							listeners : {
								itemclick : me.onShowApplyCarInfo,
								beforecellkeydown : me.onKeyShowApplyCarInfo
							},
							columns : [ {
								xtype : 'gridcolumn',
								dataIndex : 'authId',
								width : 50,
								text : 'ID编号'
							}, {
								xtype : 'gridcolumn',
								dataIndex : 'roleName',
								width : 195,
								text : '职位权限'
							}, {
								xtype : 'gridcolumn',
								dataIndex : 'itemdes',
								width : 155,
								text : '项目名称'
							}, {
								xtype : 'gridcolumn',
								dataIndex : 'c',
								width : 55,
								text : '新增'
							}, {
								xtype : 'gridcolumn',
								dataIndex : 'u',
								width : 55,
								text : '修改'
							}, {
								xtype : 'gridcolumn',
								dataIndex : 'r',
								width : 55,
								text : '查询'
							}, {
								xtype : 'gridcolumn',
								dataIndex : 'd',
								width : 55,
								text : '删除'
							}, { // 删除工艺
								xtype : 'actioncolumn',
								text : '编辑',
								width : 40,
								flex : 40,
								sortable : false,
								items : [ {
									iconCls : 'edit-delete-16',
									id : 'car-plan-actioncolumn',
									handler : me.onConfirmAuth
								} ]
							} ]
						} ],
						dockedItems : [ {
							xtype : 'toolbar',
							dock : 'top',
							items : [ {
								xtype : 'button',
								minWidth : 80,
								text : '提交申请',
								scope : me,
								handler : me.onSubmitAuth,
								iconCls : 'gtk-apply-16'
							} ]
						} ]
					}, {
						title : '人員管理',
						xtype : 'form',
						layout : 'border',
						bodyPadding : 10,
						items : [ {
							xtype : 'container',
							region : 'north',
							items : [ {
								xtype : 'textfield',
								id : 'work-numbers',
								width : 240,
								fieldLabel : '輸入工號',
								labelWidth : 80,
								maxLength : 100
							}, {
								xtype : 'combobox',
								id : 'role-nametw',
								fieldLabel : '職位名稱',
								labelWidth : 80,
								width : 240,
								valueField : 'id',
								displayField : 'name',
								editable : false,

								// 工号下拉框
								store : Ext.create('Ext.data.Store', {
									fields : [ {
										type : 'string',
										name : 'name'
									}, {
										type : 'string',
										name : 'id'
									} ],

									proxy : {
										type : 'ajax',
										url : 'roleData/signer',
										reader : {
											type : 'json',
											root : 'signers'
										}
									}
								}),
								listeners : {
									select : function(combo, records, eOpts) {
										if (records) {
											// 得到签核者ID
											SignedIdroleAssign = records[0].data.id;

										}
									}
								}
							}, {
								xtype : 'textfield',
								id : 'create-timetw',
								fieldLabel : '创建时间',
								width : 240,
								allowBlank : false,
								labelWidth : 80,
								value : App.today(),
								readOnly : true
							} ]
						}, {
							xtype : 'grid',
							id : 'role-assign',
							region : 'center',
							store : Ext.create('Ext.data.Store', {
								autoLoad : true,
								fields : assignFields,
								proxy : {
									type : 'ajax',
									url : 'GetRoleAssignData',
									reader : {
										type : 'json',
										root : 'auth'
									}
								}
							}),
							listeners : {
								itemclick : me.onShowApplyCarInfo,
								beforecellkeydown : me.onKeyShowApplyCarInfo
							},
							columns : [ {
								xtype : 'gridcolumn',
								dataIndex : 'roleNametw',
								width : 130,
								text : '職位權限'
							}, {
								xtype : 'gridcolumn',
								dataIndex : 'workNumber',
								width : 85,
								text : '工號'
							}, {
								xtype : 'gridcolumn',
								dataIndex : 'userNametw',
								width : 80,
								text : '姓名'
							}, {
								xtype : 'gridcolumn',
								dataIndex : 'factoryName',
								width : 80,
								text : '廠名'
							}, {
								xtype : 'gridcolumn',
								dataIndex : 'deptName',
								width : 120,
								text : '部門'
							}, {
								xtype : 'gridcolumn',
								dataIndex : 'stationname',
								width : 120,
								text : '職位'
							}, { // 删除工艺
								xtype : 'actioncolumn',
								text : '编辑',
								width : 40,
								flex : 40,
								sortable : false,
								items : [ {
									iconCls : 'edit-delete-16',
									id : 'car-plan-actioncolumn',
									handler : me.onConfirmAssign
								} ]
							} ]
						} ],
						dockedItems : [ {
							xtype : 'toolbar',
							dock : 'top',
							items : [ {
								xtype : 'button',
								minWidth : 80,
								text : '提交申请',
								scope : me,
								handler : me.onSubmitAssign,
								iconCls : 'gtk-apply-16'
							} ]
						} ]
					} ],
					listeners : {
						tabchange : me.onSubmitApplyCar
					}
				} ]
			});
		}
		return win;
	},

	onSubmitRole : function() {

		var me = this;

		var id = App.getRawValue('create-id');
		var roleName = App.getRawValue('role-name');
		var createTime = App.getRawValue('create-time');

		if (id == '') {
			Fly.msg('權限管理', '請輸入ID編號!');
			return;
		}
		if (roleName == '') {
			Fly.msg('權限管理', '請輸入職位權限!');
			return;
		}

		Ext.MessageBox.show({
			title : '權限管理',
			msg : '你確定要新增該權限職位？',
			buttons : Ext.MessageBox.YESNO,
			buttonText : {
				yes : "確定",
				no : "取消"
			},
			fn : function(buttonId) {
				if (buttonId == 'yes') {

					Ext.Ajax.request({
						url : 'RoleDataSubmit',
						params : {
							id : id,
							roleName : roleName
						},
						success : function(response) {

							if (response.status > 499) {
								Fly.msg('服务器', '服务器处理数据出错了!请重新提交一次!');
								console.log(response.responseText);
								return;
							}
							if (response.responseText == "所輸入的ID號或職位權限已存在!") {
								Fly.msg('權限管理', '所輸入的ID號或職位權限已存在,請重新輸入!');
								App.setValue('create-id', '');
								App.setValue('role-name', '');
								return;
							}

							if (response.responseText == "權限數據新增成功!") {
								Fly.msg("權限管理", "權限數據新增成功!");
								App.setValue('create-id', '');
								App.setValue('role-name', '');
								Ext.getCmp('roleGrid').getStore().load();

							} else {
								Fly.msg("<span style='color:red;'>错误</span>", response.responseText);
							}

						},
					});

				}
			}
		});

	},

	onSubmitAuth : function() {

		var me = this;

		var roleNames = App.getRawValue('role-names');
		var itemList = App.getRawValue('item-list');

		if (roleNames == '') {
			Fly.msg('權限管理', '請輸入職位名稱!');
			return;
		}
		if (itemList == '') {
			Fly.msg('權限管理', '請輸入項目清單!');
			return;
		}

		Ext.MessageBox.show({
			title : '權限管理',
			msg : '你確定要新增該權限職位？',
			buttons : Ext.MessageBox.YESNO,
			buttonText : {
				yes : "確定",
				no : "取消"
			},
			fn : function(buttonId) {
				if (buttonId == 'yes') {

					Ext.Ajax.request({
						url : 'AuthrityDataSubmit',
						params : {
							authId : SignedIdrole,
							itemId : SignedIdauth,
							c : App.getRawValue('insert-radio') == true ? "Y" : "N",
							r : App.getRawValue('select-radio') == true ? "Y" : "N",
							u : App.getRawValue('update-radio') == true ? "Y" : "N",
							d : App.getRawValue('delete-radio') == true ? "Y" : "N"
						},
						success : function(response) {

							if (response.status > 499) {
								Fly.msg('服务器', '服务器处理数据出错了!请重新提交一次!');
								console.log(response.responseText);
								return;
							}
							if (response.responseText == "所新增的職位權限或項目名稱相同，請重新輸入!") {
								Fly.msg('權限管理', '所新增的職位權限或項目名稱相同，請重新輸入!');
								App.setValue('role-names', '');
								App.setValue('item-list', '');
								return;
							}

							if (response.responseText == "權限數據新增成功!") {
								Fly.msg("權限管理", "權限數據新增成功!");
								App.setValue('role-names', '');
								App.setValue('item-list', '');
								Ext.getCmp('auth-panel').getStore().load();
							} else {
								Fly.msg("<span style='color:red;'>错误</span>", response.responseText);
							}

						},
					});

				}
			}
		});

	},

	onSubmitAssign : function() {

		var me = this;

		var roleNametw = App.getRawValue('role-nametw');
		var workNumber = App.getRawValue('work-numbers');

		if (roleNametw == '') {
			Fly.msg('權限管理', '請輸入職位名稱!');
			return;
		}
		if (workNumber == '') {
			Fly.msg('權限管理', '請輸入工號!');
			return;
		}

		Ext.MessageBox.show({
			title : '權限管理',
			msg : '你確定要為該員工設置此權限？',
			buttons : Ext.MessageBox.YESNO,
			buttonText : {
				yes : "確定",
				no : "取消"
			},
			fn : function(buttonId) {
				if (buttonId == 'yes') {

					Ext.Ajax.request({
						url : 'RoleAssignDataSubmit',
						params : {
							accountId : workNumber,
							roleId : SignedIdroleAssign,
						},
						success : function(response) {

							if (response.status > 499) {
								Fly.msg('服务器', '服务器处理数据出错了!请重新提交一次!');
								console.log(response.responseText);
								return;
							}

							if (response.responseText == "權限數據新增成功!") {
								Fly.msg("權限管理", "權限數據新增成功!");
								App.setValue('role-nametw', '');
								App.setValue('work-numbers', '');
								Ext.getCmp('role-assign').getStore().load();
							} else {
								Fly.msg("<span style='color:red;'>错误</span>", response.responseText);
							}

						},
					});

				}
			}
		});

	},

	onConfirmRole : function(grid, rowIndex, colIndex) {

		var me = this;
		var store = grid.getStore();
		var model = store.getAt(rowIndex);

		Ext.MessageBox.show({
			title : '權限管理',
			msg : '你確定要刪除該條記錄？',
			buttons : Ext.MessageBox.YESNO,
			buttonText : {
				yes : "確定",
				no : "取消"
			},
			fn : function(buttonId) {
				if (buttonId == 'yes') {

					Ext.Ajax.request({
						url : 'deleteRoleData',
						params : {
							id : model.data.id
						},
						success : function(response) {

							Ext.MessageBox.hide();

							if (response.responseText == "權限數據刪除成功!") {
								Fly.msg('權限管理', "權限數據刪除成功!");

								// 删除后更新其后的加工艺的index
								store.removeAt(rowIndex);
								grid.updateLayout();

								driverId = null;
								driverMacId = null;

								showApplyCarInfo(false);

								Ext.getStore('apply-car-form-store').load();
							}
						},
					});
				}
			}
		});
	},

	onConfirmAuth : function(grid, rowIndex, colIndex) {

		var me = this;
		var store = grid.getStore();
		var model = store.getAt(rowIndex);

		Ext.MessageBox.show({
			title : '權限管理',
			msg : '你確定要刪除該條記錄？',
			buttons : Ext.MessageBox.YESNO,
			buttonText : {
				yes : "確定",
				no : "取消"
			},
			fn : function(buttonId) {
				if (buttonId == 'yes') {

					Ext.Ajax.request({
						url : 'deleteAuthorityData',
						params : {
							authId : model.data.authId,
							itemId : model.data.itemId
						},
						success : function(response) {

							Ext.MessageBox.hide();

							if (response.responseText == "權限數據刪除成功!") {
								Fly.msg('權限管理', "權限數據刪除成功!");

								// 删除后更新其后的加工艺的index
								store.removeAt(rowIndex);
								grid.updateLayout();

								driverId = null;
								driverMacId = null;

								showApplyCarInfo(false);

								Ext.getStore('apply-car-form-store').load();
							}
						},
					});
				}
			}
		});
	},

	onConfirmAssign : function(grid, rowIndex, colIndex) {

		var me = this;
		var store = grid.getStore();
		var model = store.getAt(rowIndex);

		Ext.MessageBox.show({
			title : '權限管理',
			msg : '你確定要刪除該條記錄？',
			buttons : Ext.MessageBox.YESNO,
			buttonText : {
				yes : "確定",
				no : "取消"
			},
			fn : function(buttonId) {
				if (buttonId == 'yes') {

					Ext.Ajax.request({
						url : 'deleteAssignData',
						params : {
							roleId : model.data.roleId,
							accountId : model.data.accountId
						},
						success : function(response) {

							Ext.MessageBox.hide();

							if (response.responseText == "權限數據刪除成功!") {
								Fly.msg('權限管理', "權限數據刪除成功!");

								// 删除后更新其后的加工艺的index
								store.removeAt(rowIndex);
								grid.updateLayout();

								driverId = null;
								driverMacId = null;

								showApplyCarInfo(false);

								Ext.getStore('apply-car-form-store').load();
							}
						},
					});
				}
			}
		});
	},

	/**
	 * 
	 * @param combo
	 * @param records
	 * @param eOpts
	 */
	onSelectAddress : function(combo, records, eOpts) {
		if (records) {
			customerId = records[0].data.customerId;
			App.setValue('customer-address-text', records[0].data.address);
		}
	},

	onKey : function(combo, e, eOpts) {
		customerId = null;
		App.setValue('customer-address-text', '');
	},

	/**
	 * 提交拼车信息
	 */
	onClickTruckInfo : function() {

	},

	onShowApplyCarInfo : function(grid, record, item, index, e, eOpts) {
		Ext.getCmp('apply-car-form').getForm().loadRecord(record);
	},

	onShowApplyTruckInfo : function(grid, record, item, index, e, eOpts) {
		Ext.getCmp('apply-truck-info-form').getForm().loadRecord(record);
	},

	onKeyShowApplyCarInfo : function(tree, td, cellIndex, record, tr, rowIndex, e, eOpts) {
		var store = tree.getStore();
		console.log(store.count() + " " + rowIndex);
		var rec;
		if (e.getKey() == 38) {
			rec = store.getAt(rowIndex - 1);
		}

		if (e.getKey() == 40) {
			rec = store.getAt(rowIndex + 1);
		}
		showApplyCarInfo(rec);
	},

	onSubmitApplyCar : function(tabPanel, newCard, oldCard) {

		if (newCard.title == '职位管理') {
			Ext.getCmp('roleGrid').getStore().load();

		}
		if (newCard.title == '并车單查询') {
			Ext.getCmp('truckGrid').getStore().load();

		}

	}
});
