Ext.define('Module.MachineOperate', {
	extend : 'Ext.panel.Panel',
	title : '机台操作',
	layout : 'border',
	initComponent : function() {
		var me = this;
		me.items = [ {
			id : 'grid-current-machine-info',
			xtype : 'gridpanel',
			region : 'center',
			title : '机台列表',
			rowLines : true,
			tbar : [ {
				text : '刷新机台',
				iconCls : 'view-refresh-16',
				handler : function() {
					this.ownerCt.ownerCt.getStore().reload();
				}
			}, '-', {
				text : '关闭机台',
				iconCls : 'gtk-media-pause-16',
				handler : function() {
					Ext.Msg.confirm('确认', '是否决定关闭所选机台?', me.pauseDevice, me);
				}
			} ],
			selType : 'checkboxmodel',
			columnLines : true,
			store : Ext.create('Ext.data.Store', {
				storeId : 'store-currency-machine-info',
				fields : [ 'departid', 'deviceid', 'deptname', 'batchno', 'statename', 'empname', 'typename', 'craftname', 'launch', 'usehour' ],
				proxy : {
					url : 'module/part/getCurrencyDepartmentMachineInfo',
					type : 'ajax',
					reader : {
						type : 'json'
					}
				},
				autoLoad : true
			}),
			listeners : {
				itemclick : function(grid, record) {
					Ext.getCmp('grid-current-part-info').getStore().load({
						url : 'module/part/getCurrentProcessMachinePartInfo',
						params : {
							departid : record.get('departid')
						}
					});
				}
			},
			columns : [ {
				header : '机台部门',
				dataIndex : 'deptname',
				renderer : function(val) {
					if (val) {
						return '<b>' + val + '</b>';
					} else {
						return val;
					}
				}
			}, {
				header : '机台编号',
				dataIndex : 'batchno',
				renderer : function(val) {
					if (val) {
						return '<b>' + val + '</b>';
					} else {
						return val;
					}
				}
			}, {
				header : '机台类型',
				dataIndex : 'typename',
				renderer : function(val) {
					if (val) {
						return '<b>' + val + '</b>';
					} else {
						return val;
					}
				}
			}, {
				header : '机台工艺',
				dataIndex : 'craftname',
				renderer : function(val) {
					if (val) {
						return '<b>' + val + '</b>';
					} else {
						return val;
					}
				}
			}, {
				header : '操机人员',
				dataIndex : 'empname',
				renderer : function(val) {
					if (val) {
						return '<b>' + val + '</b>';
					} else {
						return val;
					}
				}
			}, {
				header : '机台状态',
				dataIndex : 'statename',
				renderer : function(val) {
					if (val) {
						return '<b>' + val + '</b>';
					} else {
						return val;
					}
				}
			}, {
				header : '开机时间',
				dataIndex : 'launch',
				width : 150,
				renderer : function(val) {
					if (val) {
						return '<b>' + val + '</b>';
					} else {
						return val;
					}
				}
			}, {
				header : '稼动时长',
				dataIndex : 'usehour',
				renderer : function(val) {
					if (val) {
						return '<b>' + val + '</b>';
					} else {
						return val;
					}
				}
			} ]
		}, {
			id : 'grid-current-part-info',
			xtype : 'gridpanel',
			region : 'south',
			height : 200,
			split : true,
			title : '机台工件',
			store : Ext.create('Ext.data.Store', {
				fields : [ 'modulecode', 'guestcode', 'partlistcode', 'partname', 'statename' ],
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
				header : '<b>模具工号</b>',
				dataIndex : 'modulecode',
				renderer : me.getFontBold
			}, {
				header : '<b>客户番号</b>',
				dataIndex : 'guestcode',
				renderer : me.getFontBold, 
				width : 150
			}, {
				header : '<b>工件编号</b>',
				dataIndex : 'partlistcode',
				renderer : me.getFontBold
			}, {
				header : '<b>部件名称</b>',
				dataIndex : 'partname',
				renderer : me.getFontBold
			}, {
				header : '<b>工件状态</b>',
				dataIndex : 'statename',
				renderer : me.getFontBold
			} ]
		} ];
		me.callParent(arguments);
	},
	getFontBold : function(val) {
		return (val ? '<b>' + val + '</b>' : val);
	},
	pauseDevice : function(r) {
		if (r == 'yes') {
			// 获取机台GRID
			var grid = Ext.getCmp('grid-current-machine-info');
			// 获取选中要关闭的讯息记录
			var range = grid.getSelectionModel().getSelection();
			// 如果机台数量为空,则前天提示并返回
			if (!range.length) {
				Fly.msg('提醒', '没有选择任何要关闭的机台!');
				return;
			}

			// 初始化一个数组用于获取待停止的机台设备的唯一号
			var macData = [];
			for ( var x in range) {
				var did = range[x].get('departid');
				macData.push(did);
			}

			// 执行停止机台的请求
			Ext.Ajax.request({
				url : 'module/part/pauseCurrencyDepartMachine',
				params : {
					device : Ext.JSON.encode(macData)
				},
				method : 'POST',
				success : function(resp) {
					var rs = Ext.JSON.decode(resp.responseText);
					// 如果关机失败,则提醒
					if (!rs.result) {
						Fly.msg('提醒', '关闭机台失败,请检查网络!');
						return;
					}
					// 重新加载机台数据
					grid.getStore().load();
				},
				failure : function(x, y, z) {
					Fly.msg('提醒', '连接服务器失败,请检查网络!');
					return;
				}
			});
		}
	}
});