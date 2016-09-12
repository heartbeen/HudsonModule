/*******************************************************************************
 * 机台设备类型的添加
 * 
 ******************************************************************************/
Ext.define('Ext.Device.ManageType', {
	extend : 'Ext.window.Window',
	title : '设备种类窗口',
	modal : true,
	resizable : false,
	width : 300,
	height : 150,
	bodyPadding : '8 5',
	layout : 'anchor',
	listeners : {
		beforeshow : function(win, eOpts) {
			Ext.getCmp('combo-device-type-selmode').setValue('01');
			// 输入的设备种类名称
			Ext.getCmp('txt-device-type-modename').setValue('');
		}
	},
	fbar : [ {
		text : '添加设备种类',
		iconCls : 'add-16',
		handler : function() {
			var tself = this.ownerCt.ownerCt;
			// 选择的设备类型
			var typeSelVal = Ext.getCmp('combo-device-type-selmode').getValue();
			// 输入的设备种类名称
			var txtModeCtrl = Ext.getCmp('txt-device-type-modename').getValue();

			// 如果设备种类名称字数不合法,则提示
			if (!txtModeCtrl || txtModeCtrl.length > 16) {
				Ext.Msg.alert('提醒', '设备种类字数应在16字之内!');
				return;
			}

			Ext.Ajax.request({
				url : 'module/manage/addDeviceType',
				params : {
					type : typeSelVal,
					name : txtModeCtrl
				},
				method : 'POST',
				success : function(req) {
					var rs = Ext.JSON.decode(req.responseText);
					if (!rs.result) {
						Ext.Msg.alert('提醒', '添加设备种类失败!');
						return;
					} else {
						tself.close();
					}
				},
				failure : function(x, y, z) {
					Ext.Msg.alert('提醒', '连接网络失败,请检查网络!');
					return;
				}
			});
		}
	} ],
	items : [ {
		id : 'combo-device-type-selmode',
		xtype : 'combobox',
		fieldLabel : '设备类型',
		labelWidth : 80,
		anchor : '100%',
		displayField : 'typename',
		valueField : 'typeid',
		value : '01',
		editable : false,
		store : new Ext.data.Store({
			fields : [ 'typeid', 'typename' ],
			data : [ {
				typeid : '01',
				typename : '机台'
			}, {
				typeid : '02',
				typename : '设备'
			}, {
				typeid : '03',
				typename : '其他'
			} ],
			autoLoad : true
		})
	}, {
		id : 'txt-device-type-modename',
		xtype : 'textfield',
		fieldLabel : '种类名称',
		labelWidth : 80,
		anchor : '100%',
		maxLength : new Number(16)
	} ]
});

/*******************************************************************************
 * 用于新增或者更新机台讯息的界面
 * 
 ******************************************************************************/
Ext.define('Ext.Device.ManageUI', {
	extend : 'Ext.window.Window',
	title : '设备管理窗口',
	width : 300,
	height : 270,
	layout : 'form',
	// false是新建机台资料,true为更改机台资料
	useType : false,
	devInfo : null,
	// 新增机台编号正则表达式
	addBatchPattern : /^((\d{1,3}-\d{1,3})|\d{1,3})(,((\d{1,3}-\d{1,3})|\d{1,3}))*$/,
	// 更改机台编号判定
	valBatchPattern : /^\d{1,3}$/,
	// 资产编号正则表达式
	assetNumberPattern : /^(\w|[-])+$/,
	bodyPadding : 10,
	defaults : {
		padding : 5
	},
	modal : true,
	resizable : false,
	// 将关闭的模式设置为隐藏
	// closeAction : 'hide',
	initComponent : function() {
		var self = this;
		self.items = [
				{
					id : 'combo-device-action-deptsel',
					xtype : 'combobox',
					fieldLabel : '所在部门',
					anchor : '100%',
					labelWidth : 60,
					editable : false,
					displayField : 'name',
					valueField : 'partid',
					store : new Ext.data.Store({
						proxy : {
							type : 'ajax',
							url : 'public/getRegularRegionDepart',
							reader : {
								type : 'json',
								root : 'department'
							}
						},
						fields : [ 'partid', 'stepid', 'name' ],
						autoLoad : true
					}),
					listConfig : {
						getInnerTpl : function() {
							return '<a class="search-item"><span style = \'font-weight:bold\'>{name}</span></a>';
						}
					}
				},
				{
					id : 'combo-device-action-mactypesel',
					xtype : 'combobox',
					fieldLabel : '设备类型',
					anchor : '100%',
					labelWidth : 60,
					editable : false,
					displayField : 'name',
					valueField : 'typeid',
					store : new Ext.data.Store({
						proxy : {
							type : 'ajax',
							url : 'public/getDeviceTypes',
							reader : {
								type : 'json',
								root : 'devicetype'
							},
							extraParams : {
								type : '01'
							}
						},
						fields : [ 'typeid', 'name' ],
						autoLoad : true
					}),
					listConfig : {
						getInnerTpl : function() {
							return '<a class="search-item"><span style = \'font-weight:bold\'>{name}</span></a>';
						}
					}
				},
				{
					id : 'txt-device-action-macbatch',
					xtype : 'textfield',
					fieldLabel : '设备编号',
					anchor : '100%',
					labelWidth : 60
				},
				{
					id : 'num-device-action-macload',
					xtype : 'numberfield',
					fieldLabel : '设备负荷',
					anchor : '100%',
					labelWidth : 60,
					decimalPrecision : 1,
					value : 20,
					minValue : 1,
					maxValue : 24
				},
				{
					id : 'combo-device-action-selcraft',
					xtype : 'combobox',
					fieldLabel : '工艺名称',
					anchor : '100%',
					labelWidth : 60,
					editable : false,
					displayField : 'craftname',
					valueField : 'craftbarid',
					store : new Ext.data.Store({
						proxy : {
							type : 'ajax',
							url : 'public/getSchedualCrafts',
							reader : {
								type : 'json',
								root : 'craft'
							}
						},
						fields : [ 'craftbarid', 'craftid', 'craftname', 'craftcode', 'mergename' ],
						autoLoad : true
					}),
					listConfig : {
						getInnerTpl : function() {
							return '<a class="search-item"><span style = \'font-weight:bold\'>{craftname}</span>'
									+ '[<span style = \'color:red;font-weight:bold\'>{craftcode}</span>]</a>';
						}
					}
				}, {
					id : 'txt-device-asset-id',
					xtype : 'textfield',
					fieldLabel : '资产编号',
					labelWidth : 60,
					maxLength : 16
				}, {
					id : 'check-device-classic-virtual',
					xtype : 'checkbox',
					fieldLabel : '虚拟设备',
					labelWidth : 60
				} ];

		self.callParent(arguments);
	},
	onSaveDeviceInfo : function() {
		var _win = this;
		// 获取设备新增面板上的控件讯息
		var _deptid = Ext.getCmp('combo-device-action-deptsel').getValue();
		var _typeid = Ext.getCmp('combo-device-action-mactypesel').getValue();
		var _batchno = Ext.getCmp('txt-device-action-macbatch').getValue();

		var _macload = Ext.getCmp('num-device-action-macload').getValue();
		var _craftid = Ext.getCmp('combo-device-action-selcraft').getValue();
		var _assetid = Ext.getCmp('txt-device-asset-id').getValue();

		var _virtual = Ext.getCmp('check-device-classic-virtual').getValue();

		var _useType = _win.useType;

		var senddata = {
			// 新增或者更新标识
			usetype : _useType,
			// 设备部分唯一号
			devpartid : _win.devInfo.devpartid,
			// 设备唯一号
			deviceid : _win.devInfo.deviceid,
			// 设备类型
			devicetype : _typeid,
			// 资产编号
			assetnumber : _assetid,
			// 是否虚拟设备
			virtual : _virtual,
			// 部门唯一号
			partid : _deptid,
			// 机台编号
			batchno : _batchno,
			// 工艺编号
			craftid : _craftid,
			// 机台负荷
			macload : _macload
		};

		Ext.Ajax.request({
			url : 'module/manage/updateDevices',
			method : 'POST',
			params : {
				data : Ext.JSON.encode(senddata)
			},
			success : function(resp) {
				var backJson = Ext.JSON.decode(resp.responseText);
				if (backJson.success) {

					showInfo('操作成功!');

					Ext.getCmp('grid-machine-detail-list').getStore().reload();

					if (_useType) {
						_win.close();
					} else {
						Ext.getCmp('txt-device-action-macbatch').setValue(Ext.emptyString);
					}
				} else {
					showError(backJson.error);
				}
			},
			failure : function(x, y, z) {
				showError('网络连接失败!');
			}
		});
	},
	/**
	 * 讲参数的值赋予给窗口的显示控件
	 */
	onSetControlVals : function(data) {
		Ext.getCmp('combo-device-action-deptsel').setValue(data.deptid);
		Ext.getCmp('combo-device-action-mactypesel').setValue(data.typeid);
		Ext.getCmp('txt-device-action-macbatch').setValue(data.macbatch);

		Ext.getCmp('num-device-action-macload').setValue(data.macload);
		Ext.getCmp('combo-device-action-selcraft').setValue(data.currentcraft);
		Ext.getCmp('txt-device-asset-id').setValue(data.assetnumber);

		Ext.getCmp('check-device-classic-virtual').setValue(data.istrue);
	},
	bbar : [ {
		text : '保存资料',
		iconCls : 'gtk-save-16',
		handler : function() {
			this.up('window').onSaveDeviceInfo();
		}
	}, '-', {
		text : '清空资料',
		iconCls : 'gtk-clear-16',
		handler : function() {
			this.up('window').onSetControlVals({
				deptid : Ext.emptyString,
				typeid : Ext.emptyString,
				macbatch : Ext.emptyString,
				macload : 20,
				currentcraft : Ext.emptyString,
				assetnumber : Ext.emptyString,
				istrue : false
			});
		}
	} ]
});

/*******************************************************************************
 * 机台设备管理主窗口
 ******************************************************************************/
Ext.define('Module.ManageDevices', {
	extend : 'Ext.panel.Panel',
	height : 700,
	width : 870,
	layout : {
		type : 'border'
	},
	bodyPadding : 5,
	defaults : {
		padding : '0 1'
	},
	// manageUi : new Ext.Device.ManageUI(),
	// manageType : new Ext.Device.ManageType(),
	title : '',
	// tbar : [ {
	// id : 'combo-device-action-selfactory',
	// xtype : 'combobox',
	// editable : false,
	// fieldLabel : '选择厂别',
	// labelWidth : 60,
	// displayField : 'shortname',
	// valueField : 'factorycode',
	// store : new Ext.data.Store({
	// proxy : {
	// type : 'ajax',
	// url : 'module/manage/getDeviceFacotry?type=1',
	// reader : {
	// type : 'json',
	// root : 'devices'
	// }
	// },
	// fields : [ 'factorycode', 'barid', 'shortname' ],
	// autoLoad : true
	// }),
	// listeners : {
	// select : function(combo, record, opts) {
	// if (!combo.getValue()) {
	// return;
	// }
	//
	// // 获取厂区所有的机台讯息
	// Ext.getCmp('grid-machine-detail-list').getStore().load({
	// url : 'module/manage/getAllFactoryDevice',
	// params : {
	// factoryId : combo.getValue()
	// }
	// });
	//
	// // Ext.Ajax.request({
	// // url : 'module/manage/getAllFactoryDevice',
	// // params : {
	// // factoryId : combo.getValue()
	// // },
	// // method : 'POST',
	// // success : function(r) {
	// // var store =
	// // Ext.getCmp('grid-machine-detail-list').getStore();
	// // store.removeAll();
	// // var res = r.responseText;
	// // if (res) {
	// // store.add(Ext.JSON.decode(res));
	// //
	// // store.sort([ {
	// // property : 'deptid',
	// // direction : 'ASC'
	// // }, {
	// // property : 'macbatch',
	// // direction : 'ASC'
	// // } ]);
	// // }
	// // },
	// // failure : function(x, y, z) {
	// // Fly.msg('提醒', '连接网络失败!');
	// // return;
	// // }
	// // });
	// }
	// }
	// } ],
	initComponent : function() {
		var me = this;
		me.items = [ {
			id : 'grid-machine-detail-list',
			region : 'center',
			title : '设备讯息栏',
			xtype : "gridpanel",
			listeners : {
				itemdblclick : function(grid, record, item, index, e, eOpts) {
					var _rowData = record.getData();

					var updateWin = new Ext.Device.ManageUI({
						useType : true,
						devInfo : {
							devpartid : _rowData.devpartid,
							deviceid : _rowData.macbarcode
						}
					});

					updateWin.onSetControlVals(_rowData);

					Ext.getCmp('txt-device-action-macbatch').setReadOnly(false);

					me.onReLoadConfigs(true, null);

					updateWin.show();
				}
			},
			tbar : [ {
				text : '新增设备',
				iconCls : 'add-16',
				handler : function() {
					// 显示一个新增设备的窗口
					new Ext.Device.ManageUI({
						useType : false,
						devInfo : {
							devpartid : '',
							deviceid : ''
						}
					}).show();

					// 重新设置机台面板的资料
					me.onReLoadConfigs(false, factoryVal);

					// 将设备管理窗口上的控件全部清空
					Ext.getCmp('combo-device-action-deptsel').setValue(Ext.emptyString);
					Ext.getCmp('combo-device-action-mactypesel').setValue(Ext.emptyString);
					Ext.getCmp('combo-device-action-selcraft').setValue(Ext.emptyString);
					Ext.getCmp('txt-device-action-macbatch').setValue(Ext.emptyString);
					Ext.getCmp('num-device-action-macload').setValue(20);
					Ext.getCmp('txt-device-asset-id').setValue(Ext.emptyString);

					Ext.getCmp('txt-device-action-macbatch').setReadOnly(false);
				}
			}, '-', {
				text : '报废设备',
				iconCls : 'dialog-close-16',
				handler : function() {
					// 获取机台的相关情况
					var selRow = Ext.getCmp('grid-machine-detail-list').getSelectionModel().getSelection();
					if (selRow.length) {
						Ext.Msg.confirm('确认', '是否确定报废机台?', function(e) {
							if (e == 'yes') {
								Ext.Ajax.request({
									url : 'module/manage/delDevices',
									params : {
										macbarcode : selRow[0].getData().macbarcode
									},
									method : 'POST',
									success : function(r) {
										// 将返回结果转换为JSON对象
										var rs = Ext.JSON.decode(r.responseText);
										if (rs.success) {
											Ext.getCmp('grid-machine-detail-list').getStore().remove(selRow);
										} else {
											Fly.msg('提醒', '报废机台失败!');
											return;
										}
									},
									failure : function(x, y, z) {
										Fly.msg('提醒', '连接网络失败!');
										return;
									}
								});
							}
						});
					} else {
						Fly.msg('提醒', '请选择待保存的机台设备!');
					}
				}
			}, '-', {
				text : '新增设备种类',
				iconCls : 'bookmark_add-16',
				handler : function() {
					new Ext.Device.ManageType().show();
				}
			}, '-', {
				text : '刷新',
				iconCls : 'arrow_refresh-16',
				handler : function() {
					this.up('gridpanel').getStore().reload();
				}
			} ],
			store : new Ext.data.Store({
				fields : [ 'devpartid', 'deptid', 'deptname', 'macbarcode', 'macbatch', 'assetnumber', 'typeid', 'typename', 'macload', 'macstatus',
						'stateid', 'statusname', 'currentcraft', 'craftname', 'istrue' ],
				proxy : {
					type : 'ajax',
					url : 'module/manage/getAllFactoryDevice',
					reader : {
						type : 'json'
					}
				},
				autoLoad : true
			}),
			columns : [ new Ext.grid.RowNumberer({
				width : 40
			}), {
				text : '所在厂区部门别',
				width : 150,
				dataIndex : 'deptname'
			}, {
				text : '机台编号',
				width : 80,
				dataIndex : 'macbatch'
			}, {
				text : '设备资产编号',
				width : 200,
				dataIndex : 'assetnumber'
			}, {
				text : '设备类型',
				width : 200,
				dataIndex : 'typename'
			}, {
				text : '负荷(时/天)',
				width : 90,
				dataIndex : 'macload'
			}, {
				text : '机台工艺',
				width : 200,
				dataIndex : 'craftname'
			}, {
				text : '设备分类',
				dataIndex : 'istrue',
				renderer : function(val) {
					if (isNaN(val)) {
						return "实物设备";
					}

					var flag = parseInt(val);
					if (flag) {
						return "<font color = red><b>虚拟设备</b></font>";
					} else {
						return "实物设备";
					}
				}
			}, {
				text : '状态',
				width : 40,
				renderer : function(val, meta, record) {
					var backVal = '';
					if (val == '20101') {
						backVal = '<img src = "images/AH16/app-set-16.png" alt ="开机" title ="开机" />';
					} else if (val == '20102') {
						backVal = '<img src = "images/AH16/cog.png" alt ="停机" title ="停机" />';
					} else if (val == '20103') {
						backVal = '<img src = "images/AH16/view-refresh.png" alt ="保养" title ="保养" />';
					} else {
						backVal = '<img src = "images/AH16/app-edit-16.png" alt ="维修" title ="维修" />';
					}

					return backVal;
				},
				dataIndex : 'stateid'
			} ]
		} ];
		me.callParent(arguments);
	},
	onReLoadConfigs : function(update, val) {
		// 将机台类型重新加载
		Ext.getCmp('combo-device-action-mactypesel').getStore().load();
		// 将机台工艺任务讯息重新加载
		Ext.getCmp('combo-device-action-selcraft').getStore().load();
		// 将厂区部门机台讯息重新加载
		var store = Ext.getCmp('combo-device-action-deptsel').getStore();
		// 如果为UPDATE状态,则按厂别刷新资料
		store.setProxy({
			type : 'ajax',
			url : 'public/getRegularRegionDepart',
			extraParams : {
				factoryId : !update ? val : ''
			},
			reader : {
				type : 'json',
				root : 'department'
			}
		});
		// 刷新Store
		store.load();
	}
});
