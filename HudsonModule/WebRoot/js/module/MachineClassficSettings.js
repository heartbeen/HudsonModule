Ext.define('Module.MachineClassficSettings', {
	extend : 'Ext.panel.Panel',
	layout : 'border',
	title : '',
	addflag : 'New',
	initComponent : function() {
		var me = this;
		me.items = [ {
			id : 'mcs-device-classfic',
			xtype : 'gridpanel',
			title : '金型部机台种类列表',
			region : 'center',
			plugins : [ new Ext.grid.plugin.CellEditing({
				clicksToEdit : 1
			}) ],
			forceFit : true,
			rowLines : true,
			columnLines : true,
			tbar : [ {
				text : '新增机台种类',
				iconCls : 'add-16',
				handler : function() {
					me.addDeviceClassfic(this.up('gridpanel').getStore());
				}
			}, '-', {
				text : '保存机台种类',
				iconCls : 'gtk-save-16',
				handler : function() {
					me.saveDeviceClassfic(this.up('gridpanel').getStore());
				}
			}, '-', {
				text : '刷新机台种类',
				iconCls : 'view-refresh-16',
				handler : me.getDeviceClassfic
			} ],
			store : new Ext.data.Store({
				fields : [ 'classid', 'classname', 'append' ],
				data : [],
				autoLoad : true
			}),
			columns : [ {
				dataIndex : 'classid',
				text : '类别代号',
				flex : 1
			}, {
				dataIndex : 'classname',
				text : '类别名称',
				flex : 4,
				editor : {
					xtype : 'textfield'
				}
			} ]
		} ];
		me.callParent(arguments);
		me.getDeviceClassfic();
	},
	getDeviceClassfic : function() {
		Ext.Ajax.request({
			url : 'public/getDeviceClassfic',
			method : 'POST',
			params : {},
			success : function(resp) {
				var json = Ext.JSON.decode(resp.responseText);
				var deviceStore = Ext.getCmp('mcs-device-classfic').getStore();
				deviceStore.removeAll();
				if (json && json.length > 0) {
					deviceStore.add(json);
				}
				deviceStore.commitChanges();
			},
			failure : function(err) {
				Fly.msg('Error', '连接服务器失败!');
			}
		});
	},
	addDeviceClassfic : function(store) {
		store.add({
			classid : this.addflag,
			classname : '',
			append : true
		});
	},
	saveDeviceClassfic : function(store) {
		var me = this;
		if (store && store.getCount()) {
			var list = [];
			for ( var x = 0; x < store.getCount(); x++) {
				if (!store.getAt(x).get('classname')) {
					Fly.msg('ERROR', '机台种类名称不能为空!');
					return;
				}
				if (store.getAt(x).get('append')) {
					list.push({
						classid : store.getAt(x).get('classid'),
						classname : store.getAt(x).get('classname')
					});
				}
			}

			Ext.Ajax.request({
				url : 'module/manage/saveDeviceClassfic',
				params : {
					classfic : Ext.JSON.encode(list)
				},
				method : 'POST',
				success : function(resp) {
					var backJson = Ext.JSON.decode(resp.responseText);
					if (backJson.result) {
						store.removeAll();
						me.getDeviceClassfic();
					} else {
						if (backJson.flag == -1) {
							Fly.msg('INFO', '保存至服务器失败');
							return;
						} else if (backJson.flag == -2) {
							Fly.msg('ERROR', '机台种类名称不能重复定义');
							return;
						} else {
							Fly.msg('ERROR', '其他错误,请联系管理员!');
							return;
						}
					}
				},
				failure : function(err) {
					Fly.msg('INFO', '连接服务器失败,请检查网络连接!');
					return;
				}
			});
		} else {
			Fly.msg('INFO', '没有要保存的资料');
			return;
		}
	}
});