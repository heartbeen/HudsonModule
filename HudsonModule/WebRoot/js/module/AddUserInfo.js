Ext.define('Module.AddCareerInfo', {
	extend : 'Ext.window.Window',
	title : '管理工作职位',
	width : 350,
	height : 350,
	layout : 'border',
	sRegex : /^[\u4e00-\u9fa5a-zA-Z0-9]+$/,
	initComponent : function() {
		var me = this;
		Ext.applyIf(me, {
			items : [ {
				id : 'grid-user-station-info',
				xtype : 'gridpanel',
				region : 'center',
				border : false,
				forceFit : true,
				tbar : [ {
					id : 'txt-user-station-name',
					xtype : 'textfield',
					emptyText : '职位名称'
				}, '-', {
					text : '添加职位',
					iconCls : 'add-16',
					handler : function() {
						var sname = Ext.getCmp('txt-user-station-name').getValue();
						if (!sname) {
							Ext.Msg.alert('提醒', '<b>工作职位不能为空!</b>');
							return;
						}
						if (!me.sRegex.test(sname)) {
							Ext.Msg.alert('提醒', '<b>工作职位必须含有汉字,允许包含字母或者数字!</b>');
							return;
						}

						var store = Ext.getCmp('grid-user-station-info').getStore();
						var rcd = store.findRecord('sname', sname);
						if (rcd) {
							Ext.Msg.alert('提醒', '<b>该工作职位已经存在了!</b>');
							return;
						}

						Ext.Ajax.request({
							url : 'module/base/saveStationInfo',
							params : {
								sname : sname
							},
							success : function(resp) {
								var rs = Ext.JSON.decode(resp.responseText);
								if (rs.result) {
									Ext.getCmp('txt-user-station-name').setValue(Ext.emptyString);
									store.reload();
									Ext.getCmp('cmb-user-pos-info').getStore().reload();

								} else {
									Ext.Msg.alert('提醒', '<font color = red><b>保存工作职位失败了!</b></font>');
									return;
								}
							},
							failure : function() {
								Ext.Msg.alert('提醒', '<b>连接服务器失败,请检查网络连接!</b>');
								return;
							}
						});
					}
				} ],
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
				}),
				columns : [ {
					dataIndex : 'sname',
					text : '职位名称',
					renderer : function(val) {
						return '<b>' + val + '</b>';
					}
				} ]
			} ]
		});

		me.callParent(arguments);
	}
});
Ext.define('Module.AddUserInfo', {
	extend : 'Ext.panel.Panel',

	layout : {
		columns : 2,
		type : 'table'
	},
	bodyPadding : 5,
	title : '新增用户',
	initComponent : function() {
		var me = this;

		Ext.applyIf(me, {
			defaults : {
				padding : '2 5'
			},
			tbar : [ {
				text : '保存用户讯息',
				iconCls : 'gtk-save-16',
				handler : function() {
					me.saveUserInfo();
				}
			}, '-', {
				text : '添加工作职位',
				iconCls : 'contact-new-16',
				handler : function() {
					new Module.AddCareerInfo().show();
				}
			} ],
			items : [ {
				id : 'cmb-user-work-number',
				xtype : 'combobox',
				fieldLabel : '用户工号',
				labelWidth : 60,
				displayField : 'empname',
				valueField : 'worknumber',
				minChars : 0,
				listConfig : {
					getInnerTpl : function() {
						return '<a class="search-item"><span style = \'font-weight:bold;color:purple\'>{empname}[{worknumber}]</span></a>';
					}
				},
				store : new Ext.data.Store({
					fields : [ 'userid', 'empname', 'worknumber', 'phone', 'shortnumber', 'posid', 'stationid' ],
					autoLoad : true,
					proxy : {
						// url : 'module/base/findEmployeeByWorkNumber',
						url : '',
						type : 'ajax',
						reader : {
							type : 'json'
						}
					}
				}),
				listeners : {
					change : function(combo, nw, od, opts) {
						// 将控件的值设置为空
						var eps = Ext.emptyString;
						me.initCtrlValues(eps, eps, eps, eps, eps);
						// 获取数据库中匹配的员工资料
						Ext.Ajax.request({
							url : 'module/base/findEmployeeByWorkNumber',
							params : {
								worknumber : nw
							},
							method : 'POST',
							success : function(resp) {
								var row = Ext.JSON.decode(resp.responseText);
								var store = combo.getStore();

								store.removeAll();
								store.add(row);
							},
							failure : function(x, y, z) {
								// Fly.msg('提醒','查询资料')
							}
						});
					},
					select : function(combo, records) {
						var rcd = records[0].data;
						me.initCtrlValues(rcd.empname, rcd.posid, rcd.stationid, rcd.phone, rcd.shortnumber);
					}
				}
			}, {
				id : 'txt-user-add-name',
				xtype : 'textfield',
				fieldLabel : '用户姓名',
				labelWidth : 60
			}, {
				id : 'cmb-user-dept-info',
				xtype : 'combobox',
				fieldLabel : '用户部门',
				editable : false,
				displayField : 'deptname',
				valueField : 'deptid',
				listConfig : {
					getInnerTpl : function() {
						return '<a class="search-item"><span style = \'font-weight:bold;color:purple\'>{deptname}</span></a>';
					}
				},
				store : new Ext.data.Store({
					fields : [ 'deptid', 'deptname', 'stepid' ],
					// autoLoad : true,
					proxy : {
						url : 'module/base/findLocalRegionDepartment',
						type : 'ajax',
						reader : {
							type : 'json'
						}
					}
				}),
				labelWidth : 60
			}, {
				id : 'cmb-user-pos-info',
				xtype : 'combobox',
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
						url : 'module/base/getCareerInfo',
						type : 'ajax',
						reader : {
							type : 'json'
						}
					}
				}),
				labelWidth : 60
			}, {
				id : 'txt-user-phone-number',
				xtype : 'textfield',
				fieldLabel : '手机号码',
				labelWidth : 60
			}, {
				id : 'txt-user-short-number',
				xtype : 'textfield',
				fieldLabel : '手机短号',
				labelWidth : 60
			} ]
		});

		me.callParent(arguments);
	},
	/**
	 * 为员工信息控件赋值
	 * 
	 * @param name
	 * @param dept
	 * @param pos
	 * @param pn
	 * @param spn
	 */
	initCtrlValues : function(name, dept, pos, pn, spn) {
		Ext.getCmp('txt-user-add-name').setValue(name);
		Ext.getCmp('cmb-user-dept-info').setValue(dept);
		Ext.getCmp('cmb-user-pos-info').setValue(pos);
		Ext.getCmp('txt-user-phone-number').setValue(pn);
		Ext.getCmp('txt-user-short-number').setValue(spn);
	},
	saveUserInfo : function() {
		var self = this;

		var userCtrl = Ext.getCmp('cmb-user-work-number');
		var userno = userCtrl.getValue();

		if (!userno) {
			Fly.msg('提醒', '工号不能为空!');
			return;
		}

		if (!self.regex.test(userno)) {
			Fly.msg('提醒', '工号不符合要求(3-8字内的数字,字母或者组合');
			return;
		}

		// 获取员工唯一号USERID
		var rcd = userCtrl.getStore().findRecord('worknumber', userno);
		var userid = (rcd ? rcd.data.userid : '');

		var username = Ext.getCmp('txt-user-add-name').getValue();
		if (!username) {
			Fly.msg('提醒', '用户姓名不能为空!');
			return;
		}

		var deptid = Ext.getCmp('cmb-user-dept-info').getValue();
		if (!deptid) {
			Fly.msg('提醒', '未选择用户所在部门单位!');
			return;
		}

		var workid = Ext.getCmp('cmb-user-pos-info').getValue();
		var phone = Ext.getCmp('txt-user-phone-number').getValue();
		var shortnumber = Ext.getCmp('txt-user-short-number').getValue();

		var json = {

			"worknumber" : userno,
			"empname" : username,
			"posid" : deptid,
			"stationid" : workid,
			"phone" : phone,
			"shortnumber" : shortnumber
		};

		Ext.Ajax.request({
			url : 'module/base/saveEmployeeInfo',
			params : {
				data : Ext.JSON.encode(json)
			},
			method : 'POST',
			success : function(resp) {
				var rs = Ext.JSON.decode(resp.responseText);

				showError(rs.msg);
				if (!rs.result) {
					return;
				}

				var nll = Ext.emptyString;
				userCtrl.setValue(nll);
				self.initCtrlValues(nll, nll, nll, nll, nll);
			},
			failure : function(x, y, z) {
				showError('连接服务器失败!');
				return;
			}
		});
	},
	regex : /^\w{4,8}$/

});