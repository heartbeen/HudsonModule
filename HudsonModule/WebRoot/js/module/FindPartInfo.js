Ext.define('Module.FindPartInfo', {
	extend : 'Ext.panel.Panel',
	title : '加工工件查询',
	layout : 'border',
	initComponent : function() {
		var me = this;
		me.items = [ {
			xtype : 'gridpanel',
			region : 'center',
			columnLines : true,
			store : Ext.create('Ext.data.Store', {
				fields : [ 'partlistcode', 'partcode', 'modulecode', 'partname', 'departname', 'statename', 'batchno' ],
				autoLoad : true,
				proxy : {
					url : '',
					type : 'ajax',
					reader : {
						type : 'json'
					}
				}
			}),
			columns : [ {
				text : '工件编号',
				dataIndex : 'partlistcode',
				renderer : me.renderBoldFont
			}, {
				text : '部件编号',
				dataIndex : 'partcode',
				renderer : me.renderBoldFont
			}, {
				text : '模具编号',
				dataIndex : 'modulecode',
				renderer : me.renderBoldFont
			}, {
				text : '部件名称',
				dataIndex : 'partname',
				renderer : me.renderBoldFont
			}, {
				text : '当前部门',
				dataIndex : 'departname',
				renderer : function(val) {
					return (val ? '<b>' + val + '</b>' : '<b>未簽收</b>');
				}
			}, {
				text : '工件状态',
				dataIndex : 'statename',
				renderer : function(val) {
					return (val ? '<b>' + val + '</b>' : '<b>未接收</b>');
				}
			}, {
				text : '所在机台',
				dataIndex : 'batchno',
				renderer : me.renderBoldFont
			} ],
			tbar : [ {
				itemId : 'mold-select',
				xtype : 'combobox',
				fieldLabel : '模具工号',
				labelWidth : 60,
				valueField : 'modulebarcode',
				displayField : 'modulecode',
				store : Ext.create('Ext.data.Store', {
					autoLoad : true,
					fields : [ 'modulebarcode', 'modulecode' ],
					proxy : {
						url : 'public/getAllProcessModuleInfo',
						type : 'ajax',
						reader : {
							type : 'json'
						}
					}
				})
			}, '-', {
				itemId : 'part-batch',
				xtype : 'textfield',
				fieldLabel : '工件编号',
				labelWidth : 60
			}, {
				text : '查询',
				iconCls : 'search-16',
				handler : me.queryPartInfo
			} ]
		} ];

		me.callParent(arguments);
	},
	queryPartInfo : function() {
		var moldctrl = this.up().down('#mold-select');
		var partctrl = this.up().down('#part-batch');
		this.up().up().getStore().load({
			url : 'module/inquire/findPartInfo',
			params : {
				moldid : moldctrl.getValue(),
				partid : partctrl.getValue()
			}
		});
	},
	renderBoldFont : function(val) {
		return (val ? '<b>' + val + '</b>' : val);
	}
});