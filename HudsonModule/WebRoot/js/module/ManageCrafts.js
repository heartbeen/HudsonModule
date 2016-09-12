/*******************************************************************************
 * 模具加工工艺与工价资料<br>
 * 
 * @author Administrator XUE
 * 
 ******************************************************************************/

Ext.define('Module.Crafts.ManageUI', {
	extend : 'Ext.window.Window',
	title : '工艺管理窗口',
	width : 300,
	height : 210,
	// 上级部门代号
	mainid : '',
	layout : 'anchor',
	closeAction : 'Hide',
	bodyPadding : 3,
	// defaults : {
	// padding : 4
	// },
	modal : true,
	resizable : false,
	fbar : [ {
		text : '添加工艺',
		iconCls : 'add-16',
		handler : function() {
			var craftCtrl = Ext.getCmp('txt-craft-action-craftcode');
			var craftNCtrl = Ext.getCmp('txt-craft-action-craftname');
			var craftPrice = Ext.getCmp('txt-craft-action-hprice');
			var craftTypeid = Ext.getCmp('combo-craft-action-typeid');
			var rootCtrl = this.ownerCt.ownerCt;

			if (!craftNCtrl.getValue() || craftNCtrl.getErrors().length) {
				Ext.Msg.alert('提醒', '工艺名称长度必须为1-16字之内');
				return;
			}
			if (!craftCtrl.getValue() || craftCtrl.getErrors().length) {
				Ext.Msg.alert('提醒', '工艺代码必须为1-4个字母的组合');
				return;
			}

			if (Ext.isEmpty(craftPrice.getValue()) || craftPrice.getErrors().length) {
				Ext.Msg.alert('提醒', '价格必须为大于0的数字');
				return;
			}

			Ext.Ajax.request({
				url : 'module/manage/addCrafts',
				method : 'POST',
				params : {
					mainid : rootCtrl.mainid,
					code : craftCtrl.getValue(),
					name : craftNCtrl.getValue(),
					price : craftPrice.getValue(),
					typeid : craftTypeid.getValue()
				},
				success : function(r) {
					var rs = Ext.JSON.decode(r.responseText);
					if (!rs.result) {
						Ext.Msg.alert('提醒', '添加工艺失败!');
						return;
					} else {
						Ext.getCmp('id2').getStore().load();
						rootCtrl.close();
					}
				},
				faliure : function(x, y, z) {
					Ext.Msg.alert('提醒', '连接网络失败!');
					return;
				}
			});

		}
	} ],
	initComponent : function() {
		var self = this;
		self.items = [ {
			id : 'txt-craft-action-maincraft',
			xtype : 'textfield',
			fieldLabel : '主要工艺',
			labelWidth : 70,
			readOnly : true,
			anchor : '100%'
		}, {
			id : 'combo-craft-action-typeid',
			xtype : 'combobox',
			fieldLabel : '工艺类型',
			displayField : 'name',
			anchor : '100%',
			labelWidth : 70,
			valueField : 'id',
			editable : false,
			value : 0,
			store : new Ext.data.Store({
				fields : [ 'id', 'name' ],
				autoLoad : true,
				data : [ {
					id : 0,
					name : '内作工艺'
				}, {
					id : 1,
					name : '外发工艺'
				} ]
			})
		}, {
			id : 'txt-craft-action-craftcode',
			xtype : 'textfield',
			fieldLabel : '工艺代号',
			regex : /^\w{1,4}(-\w{1,4})?$/,
			labelWidth : 70,
			anchor : '100%',
			maxLength : 10
		}, {
			id : 'txt-craft-action-craftname',
			xtype : 'textfield',
			fieldLabel : '工艺名称',
			labelWidth : 70,
			anchor : '100%',
			maxLength : 16
		}, {
			id : 'txt-craft-action-hprice',
			xtype : 'numberfield',
			fieldLabel : '单价(元/时)',
			labelWidth : 70,
			anchor : '100%',
			minValue : 0,
			maxValue : 30000,
			value : 0,
			maxLength : 10
		} ];

		self.callParent(arguments);
	}
});

Ext.define('Module.ManageCrafts', {
	extend : 'Ext.tree.Panel',
	addWin : Ext.create('Module.Crafts.ManageUI', {}),
	initComponent : function() {
		var me = this;

		Ext.apply(me, {

			title : '工艺暂存',
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
			sortableColumns : false,
			forceFit : true,
			listeners : {
				itemdblclick : function(grid, record) {
					var json = record.getData();
					me.addWin.mainid = json.id;

					Ext.getCmp('txt-craft-action-maincraft').setValue(json.text);
					Ext.getCmp('txt-craft-action-craftcode').setValue(json.craftcode);
					Ext.getCmp('txt-craft-action-craftname').setValue(json.sname);
					Ext.getCmp('txt-craft-action-hprice').setValue(json.hprice);
					Ext.getCmp('combo-craft-action-typeid').setValue(parseInt(json.kindid));

					me.addWin.child('toolbar').child().setText('更新工艺');
					me.addWin.show();
				}
			},
			store : new Ext.data.TreeStore({
				proxy : {
					type : 'ajax',
					url : 'module/manage/getPackageCrafts'
				},
				root : {
					text : 'root',
					expand : false
				},
				fields : [ 'id', 'text', 'stepid', 'leaf', 'sname', 'craftcode', 'hprice', 'kindid' ]
			}),
			columns : [ {
				xtype : 'treecolumn',
				dataIndex : 'text',
				text : '工艺名称'
			} ],
			tbar : [ {
				text : '新增工艺',
				iconCls : 'gtk-add-16',
				handler : function() {
					me.addWin.mainid = '';

					Ext.getCmp('txt-craft-action-maincraft').setValue('******');
					Ext.getCmp('txt-craft-action-craftcode').setValue('');
					Ext.getCmp('txt-craft-action-craftname').setValue('');
					Ext.getCmp('txt-craft-action-hprice').setValue(0);
					Ext.getCmp('combo-craft-action-typeid').setValue(0);

					me.addWin.child('toolbar').child().setText('新增工艺');
					me.addWin.show();
				}
			}, '-', {
				text : '刷新工艺',
				iconCls : 'view-refresh-16',
				handler : function() {
					me.getStore().load();
				}
			} ]

		});

		me.callParent(arguments);
	}
});