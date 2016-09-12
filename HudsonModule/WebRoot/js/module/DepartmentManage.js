/*******************************************************************************
 * 厂区与部门资料<br>
 * 
 * @author Administrator XUE
 * 
 ******************************************************************************/
Ext.define('Module.Department.ManageUI', {
	extend : 'Ext.window.Window',
	title : '新增部门',
	width : 300,
	height : 160,
	// 上级部门代号
	superiorid : null,
	layout : 'anchor',
	defaults : {
		padding : 4
	},
	closeAction : 'hide',
	modal : true,
	resizable : false,
	fbar : [ {
		text : '添加部门',
		iconCls : 'add-16',
		handler : function() {
			var deptCtrl = Ext.getCmp('txt-partment-action-deptname');
			var rootCtrl = this.ownerCt.ownerCt;
			if (!deptCtrl.getValue() || deptCtrl.getErrors().length) {
				Ext.Msg.alert('提醒', '部门名称字数必须在3-16之间');
				return;
			} else {
				Ext.Ajax.request({
					url : 'module/manage/addRegionPartment',
					method : 'POST',
					params : {
						stepid : rootCtrl.superiorid,
						deptname : deptCtrl.getValue()
					},
					success : function(r) {
						var rs = Ext.JSON.decode(r.responseText);
						if (!rs.result) {
							Ext.Msg.alert('提醒', '添加部门失败!');
							return;
						} else {
							Ext.getCmp('id1').getStore().load();
							rootCtrl.close();
						}
					},
					faliure : function(x, y, z) {
						Ext.Msg.alert('提醒', '连接网络失败!');
						return;
					}
				});
			}
		}
	} ],
	initComponent : function() {
		var self = this;
		self.items = [ {
			id : 'txt-partment-action-superiorname',
			xtype : 'textfield',
			fieldLabel : '上级部门',
			labelWidth : 60,
			readOnly : true,
			anchor : '100%'
		}, {
			id : 'txt-partment-action-deptname',
			xtype : 'textfield',
			fieldLabel : '部门名称',
			labelWidth : 60,
			anchor : '100%',
			maxLength : 16
		} ];

		self.callParent(arguments);
	}
});

Ext.define('Module.DepartmentManage', {
	extend : 'Ext.tree.Panel',
	addWin : Ext.create('Module.Department.ManageUI', {}),
	initComponent : function() {
		var me = this;

		Ext.apply(me, {
			title : '部门架构',
			useArrows : true,
			rootVisible : false,
			multiSelect : false,
			selModel : {
				selType : 'rowmodel',
				mode : 'SINGLE',
				toggleOnClick : false
			},
			rowLines : true,
			columnLines : true,
			forceFit : true,
			store : new Ext.data.TreeStore({
				proxy : {
					type : 'ajax',
					url : 'module/manage/getPackageRegionDeparment',

					reader : {
						type : 'json'
					}
				},
				root : {
					expanded : true
				},
				fields : [ 'id', 'text', 'stepid', 'leaf' ]
			}),
			tbar : [ {
				text : '新增部门',
				iconCls : 'gtk-add-16',
				handler : function() {
					var selRow = this.ownerCt.ownerCt.getSelectionModel().getSelection();
					if (selRow.length) {
						me.addWin.superiorid = selRow[0].getData().stepid;
						Ext.getCmp('txt-partment-action-superiorname').setValue(selRow[0].getData().text);
						me.addWin.show();
					} else {
						me.addWin.superiorid = '';
						Ext.getCmp('txt-partment-action-superiorname').setValue('');
						Ext.Msg.alert('提醒', '未选中待添加部门的上级单位');
						return;
					}
				}
			}, '-', {
				text : '删除部门',
				iconCls : 'gtk-delete-16',
				handler : function() {
					var selectRow = this.ownerCt.ownerCt.getSelectionModel().getSelection();
					var treeStore = this.up('treepanel').getStore();
					if (selectRow.length) {
						Ext.Msg.confirm('提示', '是否确认删除该部门以及下属单位?', function(y) {
							if (y == 'yes') {
								Ext.Ajax.request({
									url : 'project/updateRegionDepartment',
									params : {
										stepid : selectRow[0].get('stepid')
									},
									method : 'POST',
									success : function(resp) {
										var backJson = Ext.JSON.decode(resp.responseText);
										if (backJson.success) {
											treeStore.reload();
										} else {
											showError(backJson.msg);
										}
									},
									failure : function(x, y, z) {
										showError('连接服务器失败,请检查网络连接!');
									}
								});
							}
						});
					}
				}
			}, '-', {
				text : '刷新部门',
				iconCls : 'arrow_refresh-16',
				handler : function() {
					this.up('treepanel').getStore().reload();
				}
			} ]

		});
		me.callParent(arguments);
	}
});
