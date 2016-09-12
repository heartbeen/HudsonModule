Ext.define('Module.CustomFlowplanWindow', {
	extend : 'Ext.window.Window',

	id : 'Module.CustomFlowplanWindow',
	border : false,
	height : 600,
	width : 950,
	resizable : false,
	layout : {
		type : 'border'
	},
	title : '设置预设流程',
	modal : true,
	setId : null,// 单击工艺排程集合的ID
	initComponent : function() {
		var me = this;

		Ext.applyIf(me, {
			items : [ {
				xtype : 'treepanel',
				split : true,
				region : 'west',
				width : 270,
				title : '自定义流程名称列表',
				rootVisible : false,
				store : Ext.create('Ext.data.TreeStore', {
					fields : [ "setid", "text" ],
					autoLoad : true,
					proxy : {
						type : 'ajax',
						url : 'module/schedule/craftSet?setMethod=findCraftSetName&condition=all',
						reader : {
							type : 'json'
						}
					}
				}),
				listeners : {
					containercontextmenu : me.treeContainerContextMenu,
					itemcontextmenu : me.treeItemContextMenu,
					itemclick : me.onCraftSetClick
				}
			}, {
				xtype : 'gridpanel',
				id : 'custom-flow-craft-grid',
				region : 'center',
				title : '自定流程',

				store : Ext.create('Ext.data.Store', {
					fields : [ "setid", "craftid", "duration", "gap", "ranknum", "craftname", "intro" ],
					proxy : {
						type : 'ajax',
						url : '',
						reader : {
							type : 'json'
						}
					}
				}),
				columns : [ {
					xtype : 'rownumberer',
					width : 33
				}, {
					xtype : 'gridcolumn',
					width : 180,
					dataIndex : 'craftname',
					text : '工艺'
				}, {
					xtype : 'numbercolumn',
					width : 70,
					dataIndex : 'duration',
					text : '时间跨度',
					field : {
						xtype : 'numberfield',
						minValue : 0,
						craftField : 'd',
						listeners : {
							blur : me.onUpdateCraft
						}
					}
				}, {
					xtype : 'numbercolumn',
					text : '间隔时长',
					dataIndex : 'gap',
					width : 60,
					field : {
						xtype : 'numberfield',
						minValue : 0,
						craftField : 'g',
						listeners : {
							blur : me.onUpdateCraft
						}
					}
				}, {
					xtype : 'gridcolumn',
					text : '排程说明',
					dataIndex : 'intro',
					width : 150,
					field : {
						xtype : 'textfield',
						minValue : 0,
						craftField : 'i',
						listeners : {
							blur : me.onUpdateCraft
						}
					}
				}, {
					xtype : 'actioncolumn',
					width : 25,
					items : [ {
						iconCls : 'gtk-close-16',
						tooltip : '删除当前工艺',
						handler : me.onDeleteCraft
					} ]
				} ],
				plugins : [ Ext.create('Ext.grid.plugin.CellEditing', {
					clicksToEdit : 1
				}) ],

				listeners : {
					containercontextmenu : me.gridContainerContextMenu,
					itemcontextmenu : me.gridItemContextMenu,
					cellclick : me.onCraftCellClick
				}
			} ]
		});

		me.callParent(arguments);
	},

	/**
	 * 点工艺集合名称得到相应的预设工艺流程详细信息
	 */
	onCraftSetClick : function(view, record) {
		var me = Ext.getCmp('Module.CustomFlowplanWindow');

		if (record) {

			me.craftListName = record.data.text;
			me.setId = record.data.setid;
			Ext.getCmp('custom-flow-craft-grid').getStore().load({
				url : 'module/schedule/craftSet',
				params : {
					setMethod : 'findCraftSetContent',
					condition : me.setId
				},
			});
		}

	},

	treeContainerContextMenu : function(view, e, Object) {
		// var me = Ext.getCmp('Module.CustomFlowplanWindow');
		var tree = this;
		twt = tree.getStore();
		new Ext.create('Module.CustomCraftListMenu', {
			isSelectItem : false,
			craftStore : tree.getStore(),
			craftNode : tree.getRootNode(),
			record : null
		}).showAt(e.getXY());
	},

	/**
	 * 
	 */
	treeItemContextMenu : function(view, record, item, index, e, eOpts) {
		if (!record) {
			return;
		}
		var me = Ext.getCmp('Module.CustomFlowplanWindow');
		var tree = this;
		me.craftListName = record.data.text;
		new Ext.create('Module.CustomCraftListMenu', {
			isSelectItem : true,
			craftStore : tree.getStore(),
			craftNode : tree.getRootNode(),
			record : record
		}).showAt(e.getXY());
	},

	/**
	 * 在空白的工艺排程表格右键单击
	 */
	gridContainerContextMenu : function(view, e, Object) {
		var me = Ext.getCmp('Module.CustomFlowplanWindow');
		if (!me.craftListName) {
			return;
		}

		new Ext.create('Module.CustomCraftMenu', {
			setId : me.setId,
			craftStore : view.getStore(),
			craftView : view,
			nowIndex : view.getStore().getCount(),
			record : null

		}).showAt(e.getXY());
	},

	/**
	 * 在工艺排程上右键单击
	 */
	gridItemContextMenu : function(view, record, item, index, e, eOpts) {
		var me = Ext.getCmp('Module.CustomFlowplanWindow');
		if (!me.craftListName) {
			return;
		}

		me.craftRecord = record;
		new Ext.create('Module.CustomCraftMenu', {
			setId : me.setId,
			craftStore : view.getStore(),
			craftView : view,
			nowIndex : index,
			record : record
		}).showAt(e.getXY());
	},

	/**
	 * 单击工艺流程
	 */
	onCraftCellClick : function(grid, td, cellIndex, record) {
		Ext.getCmp('Module.CustomFlowplanWindow').craftRecord = record;

	},

	/**
	 * 删除指定的工艺
	 */
	onDeleteCraft : function(grid, rowIndex, colIndex) {
		var store = grid.getStore();
		var record = store.getAt(rowIndex);

		Ext.Ajax.request({
			url : 'module/schedule/deleteCraftSet',
			params : {
				setId : record.data.setid,
				ranknum : rowIndex,
				type : 'child'// 表示为工艺排程集合名称
			},
			success : function(response) {
				var res = JSON.parse(response.responseText);

				App.InterPath(res, function() {
					if (res.success) {
						Fly.msg('成功', res.msg);
						store.removeAt(rowIndex);
						grid.refresh();

						// 提示草预设工艺菜单有更改
						Ext.getCmp('Module.ModulePartPlan').isNewPredictCraft = true;
					} else {
						Fly.msg('错误', "<span style='color:red;'>" + res.msg + "</span>");
					}
				});
			},
			failure : function(response) {
				App.Error(response);
			}
		});
		// Ext.MessageBox.show({
		// title : '排程',
		// msg : '你确定要删除->' + record.data.craftname + " 这个工艺吗?",
		// buttons : Ext.MessageBox.YESNO,
		// buttonText : {
		// yes : "確定",
		// no : "取消"
		// },
		// fn : function(buttonId) {
		// if (buttonId == 'yes') {
		//
		// Ext.Ajax.request({
		// url : 'module/schedule/deleteCraftSet',
		// params : {
		// setId : record.data.setid,
		// ranknum : rowIndex,
		// type : 'child'// 表示为工艺排程集合名称
		// },
		// success : function(response) {
		// var res = JSON.parse(response.responseText);
		//
		// App.InterPath(res, function() {
		// if (res.success) {
		// Fly.msg('成功', res.msg);
		// store.removeAt(rowIndex);
		// grid.refresh();
		//
		// // 提示草预设工艺菜单有更改
		// Ext.getCmp('Module.ModulePartPlan').isNewPredictCraft = true;
		// } else {
		// Fly.msg('错误', "<span style='color:red;'>" + res.msg + "</span>");
		// }
		// });
		// },
		// failure : function(response) {
		// App.Error(response);
		// }
		// });
		// }
		// }
		// });
	},

	/**
	 * 更改工艺的加工时长和工艺间隙
	 */
	onUpdateCraft : function(field, e, eOpts) {
		var me = Ext.getCmp('Module.CustomFlowplanWindow');

		me.updateShare({
			"mcs.id" : me.craftRecord.data.setid,
			"mcs.duration" : field.craftField == 'd' ? field.getValue() : me.craftRecord.data.duration,
			"mcs.gap" : field.craftField == 'g' ? field.getValue() : me.craftRecord.data.gap,
			"mcs.intro" : field.craftField == 'i' ? field.getValue() : me.craftRecord.data.i
		}, function() {

		});
	},

	/**
	 * 更新预设排程通用方法
	 * 
	 * @param params
	 * @param func
	 */
	updateShare : function(params, func) {
		Ext.Ajax.request({
			url : 'module/schedule/updateCraftSet',
			params : params,
			success : function(response) {
				var res = JSON.parse(response.responseText);

				App.InterPath(res, function() {
					if (res.success) {
						Fly.msg('成功', res.msg);

						if (typeof func == 'function') {
							func.call();
						}

						// 提示草预设工艺菜单有更改
						Ext.getCmp('Module.ModulePartPlan').isNewPredictCraft = true;
					} else {
						Fly.msg('错误', "<span style='color:red;'>" + res.msg + "</span>");
					}
				});
			},
			failure : function(response) {
				App.Error(response);
			}
		});
	}
});

/**
 * 工艺流程增加菜单
 */
Ext.define('Module.CustomCraftMenu', {
	extend : 'Ext.menu.Menu',
	// 数据对象
	// setId : 所属的集合ID
	// craftView: 工艺流程视图
	// craftStore : 工艺流程store,
	// nowIndex : 工艺所在加入的位置,
	// record : 单击右键时所在的工艺流程
	initComponent : function() {
		var me = this;

		var craftItem = App.getModuleCraftMenu('public/getClassifyCrafts', 0);
		for ( var i in craftItem) {
			craftItem[i].handler = me.addTaskAction;
		}

		Ext.applyIf(me, {
			items : [ {
				xtype : 'menuitem',
				text : !me.record ? '新增' : '向前增加',
				iconCls : 'document-import-16',
				menu : {
					xtype : 'menu',
					direction : 0,
					parent : me,
					items : craftItem
				}
			}, {
				xtype : 'menuitem',
				text : '向后增加',
				disabled : !me.record,
				iconCls : 'document-export-16',
				menu : {
					xtype : 'menu',
					direction : 1,
					parent : me,
					items : craftItem
				}
			} ]
		});

		me.callParent(arguments);
	},

	/**
	 * 插入工艺动作
	 */
	addTaskAction : function() {
		var menu = this.up('menu');
		var me = menu.parent;
		var menuItem = this;

		// 计算插入的位置
		var loc = !me.record ? me.nowIndex : (me.nowIndex + menu.direction);
		Ext.Ajax.request({
			url : 'module/schedule/createCraftSet',
			params : {
				"mcs.craftid" : menuItem.craftId.split('-')[2],
				"mcs.setid" : me.setId,
				"mcs.duration" : 24,
				"mcs.gap" : 1,
				"mcs.ranknum" : loc,
				type : 'child'// 表示为工艺排程集合名称
			},
			success : function(response) {
				var res = JSON.parse(response.responseText);

				App.InterPath(res, function() {
					if (res.success) {

						var model = me.craftStore.model;

						me.craftStore.insert(loc, [ new model({
							"setid" : res.setId,
							"craftid" : menuItem.craftId,
							"duration" : 24,
							"gap" : 1,
							"ranknum" : loc,
							"craftname" : menuItem.text
						}) ]);

						me.craftView.refresh();

						// 提示草预设工艺菜单有更改
						Ext.getCmp('Module.ModulePartPlan').isNewPredictCraft = true;

					} else {
						Fly.msg('错误', "<span style='color:red;'>" + res.msg + "</span>");
					}
				});
			},
			failure : function(response) {
				App.Error(response);
			}
		});
	}
});

/**
 * 
 */
Ext.define('Module.CustomCraftListMenu', {
	extend : 'Ext.menu.Menu',

	initComponent : function() {
		var me = this;

		Ext.applyIf(me, {
			items : [ {
				xtype : 'menuitem',
				text : '新建',
				iconCls : 'appointment-new-16',
				scope : me,
				handler : me.onAddCustomCraftList

			}, {
				xtype : 'menuitem',
				text : '重命名',
				iconCls : 'document-edit-16',
				disabled : !me.isSelectItem,
				scope : me,
				handler : me.onRenameCustomCraftList

			}, '-', {
				xtype : 'menuitem',
				text : '删除',
				iconCls : 'app-ruin-16',
				disabled : !me.isSelectItem,
				scope : me,
				handler : me.onDeleteCustomCraftList

			} ]
		});

		me.callParent(arguments);
	},

	/**
	 * 新增工艺流程集合
	 */
	onAddCustomCraftList : function() {
		var me = this;
		if (me.craftNode) {
			Ext.MessageBox.prompt('工艺集合名称', '请为集合命名:', function(btn, text) {
				if (btn == 'ok') {

					Ext.Ajax.request({
						url : 'module/schedule/createCraftSet',
						params : {
							"mcs.setname" : text,
							type : 'root'// 表示为工艺排程集合名称
						},
						success : function(response) {
							var res = JSON.parse(response.responseText);

							App.InterPath(res, function() {
								if (res.success) {
									me.craftNode.appendChild({
										setid : res.setId,
										text : text,
										leaf : true
									});

									// 提示草预设工艺菜单有更改
									Ext.getCmp('Module.ModulePartPlan').isNewPredictCraft = true;
								} else {
									Fly.msg('错误', "<span style='color:red;'>" + res.msg + "</span>");
								}
							});
						},
						failure : function(response) {
							App.Error(response);
						}
					});

				}
			}, me, false, '新名称');
		}
	},

	/**
	 * 重命名工艺流程集合
	 */
	onRenameCustomCraftList : function() {
		var me = this;
		if (me.record) {
			Ext.MessageBox.prompt('工艺集合名称', '请为集合命名:', function(btn, text) {
				if (btn == 'ok') {

					if (text.length > 50) {
						Fly.msg('错误', "<span style='color:red;'>新名称长度超过50,请重新命名!</span>");
						return;
					}
					Ext.getCmp('Module.CustomFlowplanWindow').updateShare({
						"mcs.id" : me.record.data.setid,
						"mcs.setname" : text
					}, function() {
						me.record.set('text', text);
						me.record.commit();
					});
				}
			}, me, false, me.record.data.text);
		}
	},

	/**
	 * 删除工艺流程集合
	 */
	onDeleteCustomCraftList : function() {
		var me = this;
		if (me.record) {
			Ext.MessageBox.confirm('删除', '您确定要删除' + me.record.data.text + '吗?', function(btn) {
				if (btn == 'yes') {

					Ext.Ajax.request({
						url : 'module/schedule/deleteCraftSet',
						params : {
							setId : me.record.data.setid,
							ranknum : -1,
							type : 'root'// 表示为工艺排程集合名称
						},
						success : function(response) {
							var res = JSON.parse(response.responseText);

							App.InterPath(res, function() {
								if (res.success) {
									Fly.msg('成功', res.msg);

									me.craftStore.tree.root.removeChild(me.record);

									Ext.getCmp('custom-flow-craft-grid').getStore().loadData([]);

									// 提示草预设工艺菜单有更改
									Ext.getCmp('Module.ModulePartPlan').isNewPredictCraft = true;
								} else {
									Fly.msg('错误', "<span style='color:red;'>" + res.msg + "</span>");
								}
							});
						},
						failure : function(response) {
							App.Error(response);
						}
					});
				}
			});
		}
	}
});