Ext.define('AddEmployeeInfo', {
	extend : 'Ext.window.Window',
	width : 250,
	height : 280,
	modal : true,
	frame : true,
	title : '添加员工',
	canEdit : false,
	selRecord : null,
	layout : 'border',
	initComponent : function() {
		var self = this;
		// 将窗口的所有界面加载出来
		Ext.apply(self, {
			items : [ {
				id : 'ds-employee-form',
				xtype : 'form',
				bodyPadding : 5,
				border : false,
				region : 'center',
				layout : 'anchor',
				items : [ {
					name : 'id',
					xtype : 'textfield',
					hidden : true
				}, {
					name : 'worknumber',
					xtype : 'textfield',
					fieldLabel : '用户工号',
					anchor : '100%',
					labelWidth : 65,
					readOnly : !self.canEdit,
					allowBlank : false,
					regex : /^[0-9a-zA-z]{3,10}$/
				}, {
					name : 'empname',
					xtype : 'textfield',
					fieldLabel : '员工姓名',
					anchor : '100%',
					labelWidth : 65,
					allowBlank : false,
					regex : /^([a-zA-Z0-9]|[u3E00-\u9FA5]){2,5}$/
				}, {
					xtype : 'combobox',
					name : 'deptid',
					fieldLabel : '用户单位',
					anchor : '100%',
					labelWidth : 65,
					allowBlank : false,
					displayField : 'name',
					valueField : 'id',
					editable : false,
					store : Ext.create('Ext.data.Store', {
						fields : [ 'id', 'name', 'stepid' ],
						proxy : {
							url : 'module/base/getLocaleSubDepartment',
							type : 'ajax',
							reader : {
								type : 'json'
							}
						},
						autoLoad : true
					})
				}, {
					name : 'stationid',
					xtype : 'combobox',
					anchor : '100%',
					labelWidth : 65,
					fieldLabel : '用户职位',
					editable : false,
					displayField : 'sname',
					valueField : 'sid',
					listConfig : {
						getInnerTpl : function() {
							return '<a class="search-item"><span style = \'font-weight:bold;color:purple\'>{sname}</span></a>';
						}
					},
					store : new Ext.data.Store({
						fields : [ 'sid', 'sname' ],
						autoLoad : true,
						proxy : {
							url : 'public/getCareerInfo',
							type : 'ajax',
							reader : {
								type : 'json'
							}
						}
					})
				}, {
					name : 'phone',
					xtype : 'textfield',
					fieldLabel : '手机号码',
					anchor : '100%',
					labelWidth : 65
				}, {
					name : 'shortnumber',
					xtype : 'textfield',
					fieldLabel : '手机短号',
					anchor : '100%',
					labelWidth : 65
				}, {
					name : 'email',
					xtype : 'textfield',
					fieldLabel : '邮箱地址',
					anchor : '100%',
					labelWidth : 65,
					regex : /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
				} ],
				bbar : [ '->', {
					text : '保存资料',
					iconCls : 'disk-16',
					handler : function() {
						var s_form = this.up('form').getForm();
						var s_window = this.up('window');
						s_form.submit({
							url : 'module/base/saveLocaleEmployeeInfo',
							success : function(form, action) {
								// 将员工讯息列表刷新
								Ext.getStore('ds-employee-store').reload();
								// 将新增窗口的控件内容设置为空值
								if (s_window.canEdit) {
									form.reset();
								} else {
									s_window.close();
								}
							},
							failure : function(form, action) {
								showError(action.result.msg);
							}
						});
					}
				} ]
			} ]
		});
		self.callParent(arguments);

		if (self.selRecord) {
			Ext.getCmp('ds-employee-form').loadRecord(self.selRecord);
		}
	}
});
Ext.define('Module.DepartmentSettings', {
	extend : 'Ext.panel.Panel',
	layout : 'border',
	defaults : {
		padding : 2
	},
	initComponent : function() {
		var me = this;
		Ext.apply(me, {
			items : [ {
				xtype : 'gridpanel',
				rowLines : true,
				title : '员工讯息',
				region : 'center',
				store : Ext.create('Ext.data.Store', {
					id : 'ds-employee-store',
					fields : [ 'id', 'worknumber', 'empname', 'deptid', 'deptname', 'email', 'phone', 'stationid', 'stationname', 'accountid' ],
					autoLoad : true,
					proxy : {
						url : 'module/base/getLocaleEmployeeInfo',
						type : 'ajax',
						reader : {
							type : 'json'
						}
					}
				}),
				listeners : {
					itemdblclick : function(grid, record) {
						new AddEmployeeInfo({
							title : '更新员工资料',
							canEdit : false,
							selRecord : record
						}).show();
					}
				},
				columns : [ {
					header : '',
					xtype : 'rownumberer',
					width : 40,
					sortable : false
				}, {
					text : '员工工号',
					dataIndex : 'worknumber',
					sortable : false,
					menuDisabled : true,
					renderer : me.getRenderBoldCell
				}, {
					text : '员工姓名',
					dataIndex : 'empname',
					sortable : false,
					menuDisabled : true,
					renderer : me.getRenderBoldCell
				}, {
					text : '手机短号',
					dataIndex : 'phone',
					width : 150,
					sortable : false,
					menuDisabled : true,
					renderer : me.getRenderBoldCell
				}, {
					text : '职位',
					dataIndex : 'stationname',
					width : 150,
					sortable : false,
					menuDisabled : true,
					renderer : me.getRenderBoldCell
				}, {
					text : '所在单位',
					dataIndex : 'deptname',
					sortable : false,
					width : 150,
					menuDisabled : true,
					renderer : me.getRenderBoldCell
				}, {
					text : '邮箱地址',
					dataIndex : 'email',
					width : 150,
					sortable : false,
					menuDisabled : true,
					renderer : function(val) {
						return ('<b>' + (val ? val : '/') + '</b>');
					}
				}, {
					text : '用户账号',
					dataIndex : 'accountid',
					renderer : function(val) {
						return ('<b>' + (val ? '有' : '无') + '</b>');
					}
				}, {
					xtype : 'actioncolumn',
					menuDisabled : true,
					width : 40,
					items : [ {
						iconCls : 'gtk-delete-16',
						tooltip : '删除员工',
						handler : function(grid, rowIndex, colIndex) {
							Ext.Msg.confirm('确认', '是否确定删除该员工讯息?', function(y) {
								if (y == 'yes') {
									Ext.Ajax.request({
										url : 'module/base/deleteLocaleEmployeeInfo',
										method : 'POST',
										params : {
											empid : grid.getStore().getAt(rowIndex).get('id')
										},
										success : function(resp) {
											// 设置员工的相关讯息
											var backJson = Ext.JSON.decode(resp.responseText);
											if (backJson.success) {
												grid.getStore().removeAt(rowIndex);
											} else {
												if (backJson.result == -1) {
													showError('未登录系统或者系统登录已经过期!');
													return;
												} else if (backJson.result == -2) {
													showError('删除员工讯息失败!');
													return;
												} else {
													showError('不能删除本人的工号讯息!');
													return;
												}
											}
										},
										failure : function(x, y, z) {
											showError('连接网络失败,请检查网络连接!');
											return;
										}
									});
								}
							});
						}
					} ]
				} ],
				tbar : [ {
					text : '<b><font color = purple>新增员工</font></b>',
					iconCls : 'user_add-16',
					handler : function() {
						new AddEmployeeInfo({
							title : '新增员工资料',
							canEdit : true,
							selRecord : null
						}).show();
					}
				}, '-', {
					text : '<b><font color = purple>职位管理</font></b>',
					iconCls : 'user_suit-16'
				}, '-', {
					text : '<b><font color = purple>刷新资料</font></b>',
					iconCls : 'arrow_refresh-16',
					handler : function() {
						Ext.getStore('ds-employee-store').reload();
					}
				} ]
			} ]
		});
		me.callParent(arguments);
	},
	getRenderBoldCell : function(val) {
		return (val ? '<b>' + val + '</b>' : val);
	}
});