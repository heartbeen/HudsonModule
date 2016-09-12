Ext.define('Ext.MachineClassfic', {
	extend : 'Ext.window.Window',
	closeAction : 'hide',
	height : 300,
	width : 500,
	modal : true,
	resizable : false,
	dataRecord : null,
	layout : {
		align : 'stretch',
		type : 'border'
	},
	initCraftStore : new Ext.data.Store({
		fields : [ 'craftid', 'craftname' ],
		autoLoad : true,
		proxy : {
			type : 'ajax',
			url : 'public/getSchedualCrafts',
			reader : {
				type : 'json',
				root : 'craft'
			}
		}
	}),
	defaults : {
		padding : '2'
	},
	title : '添加金型机台',
	initComponent : function() {
		var self = this;
		self.items = [ {
			xtype : 'panel',
			region : 'west',
			layout : 'anchor',
			defaults : {
				padding : '3'
			},
			flex : 1,
			items : [ {
				id : 'mnm-dept-sel',
				xtype : 'combobox',
				fieldLabel : '部门选择',
				labelWidth : 70,
				anchor : '100%',
				triggerAction : 'all',
				margins : '0 5',
				displayField : 'text',
				valueField : 'barcode',
				store : new Ext.data.Store({
					fields : [ 'barcode', 'text' ],
					autoLoad : false,
					proxy : {
						type : 'ajax',
						url : 'module/manage/getRegionPartForAddition',
						reader : {
							type : 'json'
						}
					}
				}),
				editable : false
			}, {
				id : 'mnm-machine-type',
				xtype : 'combobox',
				fieldLabel : '机台类型',
				labelWidth : 70,
				anchor : '100%',
				editable : false,
				displayField : 'classname',
				valueField : 'classid',
				store : new Ext.data.Store({
					fields : [ 'classid', 'classname' ],
					autoLoad : true,
					proxy : {
						url : 'public/getDeviceClassfic',
						type : 'ajax',
						reader : {
							type : 'json'
						}
					}
				})
			}, {
				id : 'mnm-machine-batch',
				xtype : 'numberfield',
				fieldLabel : '机台编号',
				labelWidth : 70,
				minValue : 1,
				maxValue : 300,
				value : 1,
				anchor : '100%'
			}, {
				id : 'mnm-machine-possessid',
				xtype : 'textfield',
				fieldLabel : '资产编号',
				labelWidth : 70,
				anchor : '100%',
				maxLength : 30
			}, {
				id : 'mnm-machine-load',
				xtype : 'numberfield',
				fieldLabel : '日负荷(天)',
				labelWidth : 70,
				maxValue : 24,
				minValue : 1,
				value : 22,
				anchor : '100%'
			} ]
		}, {
			id : 'mnm-craft-grid',
			xtype : 'gridpanel',
			region : 'center',
			forceFit : true,
			plugins : [ new Ext.grid.plugin.CellEditing({
				clicksToEdit : 1
			}) ],
			store : new Ext.data.Store({
				fields : [ 'craftid', 'craftname' ],
				autoLoad : true
			}),
			selType : 'checkboxmodel',
			columns : [ {
				dataIndex : 'craftname',
				text : '机台工艺',
				renderer : function(value, meta, record, rowIndex, colIndex, store, view) {
					var paraRecord = self.initCraftStore.findRecord('craftid', value);
					if (!paraRecord) {
						return value;
					}

					record.set('craftid', value);
					return paraRecord.get('craftname');
				},
				editor : {
					xtype : 'combobox',
					store : self.initCraftStore,
					displayField : 'craftname',
					valueField : 'craftid',
					editable : false
				}
			} ],
			tbar : [ {
				text : '添加工艺',
				iconCls : 'add-16',
				handler : function() {
					this.up('gridpanel').getStore().add({
						craftid : '',
						craftname : ''
					});
				}
			}, '-', {
				text : '删除工艺',
				iconCls : 'gtk-remove-16',
				handler : function() {
					var grid = this.up('gridpanel');
					var sel = grid.getSelectionModel().getSelection();
					if (!sel.length) {
						return;
					}
					Ext.Msg.confirm('提醒', '确定要删除工艺?', function(btn) {
						if (btn == 'yes') {
							grid.getStore().remove(sel);
						}
					});
				}
			} ]
		} ];
		self.bbar = [ {
			text : '保存机台讯息',
			iconCls : 'gtk-save-16',
			handler : function() {
				var ctrlVals = self.getAllPanelCtrls();
				if (self.dataRecord) {

				}
			}
		} ];
		self.callParent(arguments);
	},
	getAllPanelCtrls : function() {
		var deptid = Ext.getCmp('mnm-dept-sel');
		if (!deptid.getStore().getCount()) {
			return {
				flag : -1,
				data : null
			};
		}

		var mactype = Ext.getCmp('mnm-machine-type');
		if (!mactype.getStore().getCount()) {
			return {
				flag : -2,
				data : null
			};
		}

		var batchno = Ext.getCmp('mnm-machine-batch');
		if (batchno.getErrors().length || !batchno.getValue()) {
			return {
				flag : -3,
				data : null
			};
		}

		var assetnumber = Ext.getCmp('mnm-machine-possessid');
		if (!assetnumber.getValue()) {
			return {
				flag : -3,
				data : null
			};
		}
		var macload = Ext.getCmp('mnm-machine-load');
		if (macload.getErrors().length || !macload.getValue()) {
			return {
				flag : -4,
				data : null
			};
		}
		var datagrid = Ext.getCmp('mnm-craft-grid');
		if (!datagrid.getStore().getCount()) {
			return {
				flag : -5,
				data : null
			};
		}

		var dataRow = [];
		datagrid.getStore().each(function(item) {
			if (item.get('craftid')) {
				dataRow.push(item.get('craftid'));
			}
		});

		if (!dataRow.length) {
			return {
				flag : -5,
				data : null
			};
		}

		return {
			flag : 1,
			data : {
				partid : deptid.getValue(),
				devtype : mactype.getValue(),
				macno : batchno.getValue(),
				asset : assetnumber.getValue(),
				load : macload.getValue(),
				crafts : dataRow
			}
		};
	},
	clearWindowCtrls : function() {
		Ext.getCmp('mnm-machine-type').setValue('');
		Ext.getCmp('mnm-machine-batch').setValue(1);
		Ext.getCmp('mnm-machine-possessid').setValue('');
		Ext.getCmp('mnm-machine-load').setValue(22);
		Ext.getCmp('mnm-craft-grid').getStore().removeAll();
	}
});
Ext.define('Module.ModuleNewMachine', {
	extend : 'Ext.panel.Panel',
	layout : {
		type : 'border'
	},
	addWindow : new Ext.MachineClassfic(),
	initComponent : function() {
		var me = this;
		me.tbar = [ {
			id : 'mnm-dept-query',
			xtype : 'combobox',
			fieldLabel : '请选择查询部门:',
			labelWidth : 110,
			anchor : '100%',
			triggerAction : 'all',
			margins : '0 5',
			displayField : 'text',
			valueField : 'barcode',
			store : new Ext.data.Store({
				fields : [ 'barcode', 'text' ],
				autoLoad : true,
				proxy : {
					type : 'ajax',
					url : 'module/manage/getRegionPartForAddition',
					reader : {
						type : 'json'
					}
				}
			}),
			listeners : {
				select : function(combo, record) {
					Ext.getCmp('mnm-execute-list').getStore().load({
						url : 'module/manage/queryDevicesByPart',
						params : {
							partid : combo.getValue()
						}
					});
				}
			},
			editable : false
		} ];
		me.items = [ {
			xtype : 'container',
			region : 'center',
			layout : 'border',
			items : [ {
				id : 'mnm-execute-list',
				xtype : 'gridpanel',
				title : '机台列表',
				region : 'center',
				// forceFit : true,
				rowLines : true,
				columnLines : true,
				selType : 'checkboxmodel',
				tbar : [ {
					text : '新增加工机台',
					iconCls : 'add-16',
					handler : function() {
						me.addWindow.dataRecord = null;
						me.addWindow.clearWindowCtrls();
						me.addWindow.show();
					}
				}, '-', {
					text : '清除新增机台',
					iconCls : 'app-ruin-16'
				}, '-', {
					text : '报废加工机台',
					iconCls : 'gtk-remove-16'
				}, '-', {
					text : '更新机台讯息',
					iconCls : 'gtk-save-16'
				}, '-', {
					text : '刷新机台讯息',
					iconCls : 'view-refresh-16'
				} ],
				store : new Ext.data.Store(
						{
							fields : [ 'sid', 'partid', 'deptname', 'deviceid', 'typeid', 'mactype', 'assetnumber', 'batchno', 'crafts', 'macload',
									'dtype' ],
							proxy : {
								type : 'ajax',
								url : '',
								reader : {
									type : 'json'
								}
							}
						}),
				columns : [ {
					dataIndex : 'deptname',
					text : '机台部门',
					width : 80
				}, {
					dataIndex : 'batchno',
					text : '机台编号',
					width : 60
				}, {
					dataIndex : 'mactype',
					text : '机台类型',
					width : 100
				}, {
					dataIndex : 'assetnumber',
					text : '资产编号',
					width : 100
				}, {
					dataIndex : 'macload',
					text : '机台负载',
					width : 70,
					renderer : function(val) {
						return val + '时/天';
					}
				} ],
				listeners : {
					itemdblclick : function(grid, record) {
						// 机台部门代号
						Ext.getCmp('mnm-dept-sel').setValue(record.get('partid'));
						// 机台类型
						Ext.getCmp('mnm-machine-type').setValue(record.get('typeid'));
						// 部门机台编号
						Ext.getCmp('mnm-machine-batch').setValue(record.get('batchno'));
						// 机台资产编号
						Ext.getCmp('mnm-machine-possessid').setValue(record.get('assetnumber'));
						// 机台负荷
						Ext.getCmp('mnm-machine-load').setValue(record.get('macload'));
						// 将机台工艺列表清空并赋值
						Ext.getCmp('mnm-craft-grid').getStore().removeAll();
						Ext.getCmp('mnm-craft-grid').getStore().add(record.get('crafts'));
						// 显示部门机台清单

						me.addWindow.dataRecord = record;
						me.addWindow.show();
					}
				}
			} ]
		} ];

		me.callParent(arguments);
	}
});