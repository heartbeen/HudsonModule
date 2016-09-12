var machineFields = [ 'posname', 'machinecode', 'machinename', 'machinestate', 'typename' ];
Ext.define('Module.ModuleMachineInfo', {
	extend : 'Ext.panel.Panel',

	layout : {
		type : 'border'
	},

	initComponent : function() {
		var me = this;

		Ext.applyIf(me, {
			items : [ {
				xtype : 'gridpanel',
				id : 'machine-data',
				flex : 1,
				region : 'north',
				height : 150,
				title : '机台列表',
				store : Ext.create('Ext.data.Store', {  
					fields : machineFields,
					proxy : {
						type : 'ajax',
						reader : {
							type : 'json',
							root : 'auth'
						}
					}
				}),
				columns : [ {
					xtype : 'gridcolumn',
					dataIndex : 'posname',
					text : '单位'
				}, {
					xtype : 'gridcolumn',
					dataIndex : 'machinecode',
					text : '机台编号'
				}, {
					xtype : 'gridcolumn',
					dataIndex : 'machinename',
					text : '机台名称'
				}, {
					xtype : 'gridcolumn',
					dataIndex : 'machinestate',
					text : '机台状态',
					renderer : function(value) {
						if (value == 0) {
							return '正常状态';
						} else if (value == 1) { 
							return '维修/保养';
						} else {
                            return '移除/报废'; 
						}
					}
				}, {
					xtype : 'gridcolumn',
					dataIndex : 'typename',
					text : '加工分类'
				}, {
					xtype : 'actioncolumn'
				}, {
					xtype : 'actioncolumn'
				} ],
				dockedItems : [ {
					xtype : 'toolbar',
					dock : 'top',
					items : [ {
						xtype : 'combobox',
						id : 'factory-idus',
						anchor : '70%',
						fieldLabel : '厂别',
						labelWidth : 40,
						valueField : 'factorycode',  
						displayField : 'fullname',
						editable : false,

						// 工号下拉框
						store : Ext.create('Ext.data.Store', {

							fields : [ {
								type : 'string',
								name : 'factorycode'
							}, {
								type : 'string',
								name : 'fullname'
							} ],

							proxy : {
								type : 'ajax',
								url : 'public/getFactoryName',
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
									factoryCode = records[0].data.factorycode;

								}
							}
						}
					}, {
						xtype : 'textfield',
						fieldLabel : '部门',  
						labelWidth : 40,
						readOnly : true
					}, {
						xtype : 'tbseparator'
					}, {
						xtype : 'button',
						width : 60,
						text : '查询',
						handler : me.onSubmitMachineData
					}, {
						xtype : 'tbfill'
					}, {
						xtype : 'tbseparator'
					}, {
						xtype : 'button',
						width : 60,
						text : '本单位机台'
					} ]
				}, {
					xtype : 'toolbar',
					dock : 'bottom',
					items : [ {
						xtype : 'tbfill'
					}, {
						xtype : 'button',
						width : 80,
						text : '增加机台'
					}, {
						xtype : 'tbseparator'
					}, {
						xtype : 'button',
						width : 80,
						text : '机台设置'
					} ]
				} ]
			}, {
				xtype : 'gridpanel',
				flex : 1,
				region : 'center',
				margin : '5 0 0 0',
				title : '机台维修与保养记录',
				columns : [ {
					xtype : 'gridcolumn',
					dataIndex : 'string',
					text : 'String'
				}, {
					xtype : 'numbercolumn',
					dataIndex : 'number',
					text : 'Number'
				}, {
					xtype : 'datecolumn',
					dataIndex : 'date',
					text : 'Date'
				}, {
					xtype : 'booleancolumn',
					dataIndex : 'bool',
					text : 'Boolean'
				} ],
				dockedItems : [ {
					xtype : 'toolbar',
					dock : 'bottom',
					items : [ {
						xtype : 'tbfill'
					}, {
						xtype : 'button',
						text : '机台维修/保养'
					} ]
				} ]
			} ]
		});

		me.callParent(arguments);
	},

	onSubmitMachineData : function() {

		Ext.getCmp('machine-data').getStore().load({
			url : 'public/getMachineList',   			
		});
	},

});