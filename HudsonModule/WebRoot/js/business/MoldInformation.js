Ext.define('CreateModuleWindow', {
	extend : 'Ext.window.Window',

	height : 268,
	width : 366,
	resizable : false,
	bodyPadding : 10,
	title : '新建工号',
	modal : true,
	isFast : false,

	initComponent : function() {
		var me = this;

		Ext.applyIf(me, {
			items : [ {
				xtype : 'radiogroup',
				id : 'createmodulewindow-radiogroup',
				width : 424,
				layout : {
					type : 'table'
				},
				fieldLabel : '生成工号方式',
				items : [ {
					xtype : 'radiofield',
					name : 'createType',
					boxLabel : '单独输入',
					create : 's',
					handler : me.onClickCreateType,

					checked : true
				}, {
					xtype : 'radiofield',
					style : 'margin-left:10px;',
					name : 'createType',
					create : 'b',
					handler : me.onClickCreateType,
					boxLabel : '快速输入'
				} ]
			}, {
				xtype : 'combobox',
				fieldLabel : '机种',
				allowBlank : false,
				id : 'createmodulewindow-moldclass-combobox',
			}, {
				xtype : 'combobox',
				id : 'createmodulewindow-customer-combobox',
				allowBlank : false,
				fieldLabel : '客户别(如:C53)'
			}, {
				xtype : 'container',
				layout : {
					type : 'table'
				},
				items : [ {
					xtype : 'textfield',
					id : 'from-textfield',
					disabled : true,
					margin : '0 0 5 100',
					width : 76,
					fieldLabel : '从',
					allowBlank : false,
					labelWidth : 15,
					validator : me.validator
				}, {
					xtype : 'textfield',
					id : 'to-textfield',
					disabled : true,
					allowBlank : false,
					margin : '0 0 5 5',
					width : 73,
					fieldLabel : '到',
					labelWidth : 15,
					validator : me.validator
				} ]
			}, {
				xtype : 'textfield',
				id : 'index-textfield',
				fieldLabel : '模具序号',
				allowBlank : false,
				validator : me.validator
			}, {
				xtype : 'combobox',
				id : 'createmodulewindow-workclass-combobox',
				fieldLabel : '制作别',
				allowBlank : false,

				valueField : 'code',
				displayField : 'name',
				editable : false,

				// 工号下拉框
				store : Ext.create('Ext.data.Store', {

					fields : [ {
						type : 'string',
						name : 'name'
					}, {
						type : 'string',
						name : 'code'
					} ],
					data : [ {
						code : 'T',
						name : 'T-自制模'
					}, {
						code : 'S',
						name : 'S-移管模'
					}, {
						code : 'Y',
						name : 'Y-委外模'
					}, {
						code : 'P',
						name : 'P-试作模'
					}, {
						code : 'Z',
						name : 'Z-治具模'
					} ]

				})
			} ],

			buttons : [ {
				text : '生成',
				id : 'process-module-number-button',
				handler : me.onCreateModule,
				scope : me,
				disabled : true,
				iconCls : 'dialog-apply-16'
			}, {
				text : '取消',
				handler : function() {
					me.close();
				},
				iconCls : 'dialog-cancel-16'
			} ]
		});

		me.callParent(arguments);
	},

	onClickCreateType : function(button) {
		button.up('window').isFast = button.create == 's';

		App.setValue('from-textfield', '');
		App.setValue('to-textfield', '');
		App.setValue('index-textfield', '');
		Ext.getCmp('from-textfield').setDisabled(button.create != 's');
		Ext.getCmp('to-textfield').setDisabled(button.create != 's');
		Ext.getCmp('index-textfield').setDisabled(button.create == 's');
	},
	validator : function(value) {
		Ext.getCmp('process-module-number-button').setDisabled(!value.match(App.intRegex) || value == '');
		return (value.match(App.intRegex)) ? true : '只能为数字';
	},

	// TODO 后此方法要进行更改
	onCreateModule : function() {
		var me = this;
		var module = '';

		var workType = App.getValue('createmodulewindow-workclass-combobox');
		var moldclass = App.getValue('createmodulewindow-moldclass-combobox');
		var customer = App.getValue('createmodulewindow-customer-combobox');

		if (!workType || !moldclass || !customer) {
			Ext.Msg.alert("信息", '模具信息请输入完整!');
			return;
		}
		workType = workType.substring(0, 1);
		customer = customer.toUpperCase();

		if (me.isFast) {

			var from = parseInt(App.getValue('from-textfield'));
			var to = parseInt(App.getValue('to-textfield'));

			if (!from || !to) {
				Ext.Msg.alert("信息", '模具信息请输入完整!');
				return;
			}
			var times = Math.abs(from - to);
			from = from < to ? from : to;

			for ( var i = 0; i <= times; i++) {
				console.log(customer + '-' + me.completion(from + i + '') + workType);
			}

		} else {
			var index = App.getValue('index-textfield');
			console.log(customer + '-' + me.completion(index) + workType);
		}

	},

	completion : function(no) {
		return no.length >= 3 ? no : no.length == 1 ? '00' + no : '0' + no;
	}

});

/*
 * ! Ext JS Library 4.0 Copyright(c) 2006-2011 Sencha Inc. licensing@sencha.com
 * http://www.sencha.com/license
 */
Ext.define('Manage.Business.MoldInformation', {
	extend : 'Ext.ux.desktop.Module',

	requires : [ 'Manage.Business.MoldingSpecification' ],

	id : UserAuth.MoldInformation.itemWebId,

	init : function() {
		this.launcher = {
			text : eval(UserAuth.MoldInformation.itemTitle),
			iconCls : UserAuth.MoldInformation.itemIcon + '-16'
		};
	},

	createWindow : function() {
		var me = this;
		var desktop = me.app.getDesktop();
		var win = desktop.getWindow(UserAuth.MoldInformation.itemWebId);
		if (!win) {
			win = desktop.createWindow({
				id : UserAuth.MoldInformation.itemWebId,
				title : eval(UserAuth.MoldInformation.itemTitle),
				width : 889,
				height : 600,
				iconCls : UserAuth.MoldInformation.itemIcon + '-16',
				animCollapse : false,
				border : false,
				constrainHeader : true,

				layout : 'border',
				dockedItems : [ {
					xtype : 'toolbar',
					dock : 'top',
					items : [ {
						minWidth : 80,
						text : '新建工号',
						iconCls : 'edit-add-16',
						handler : me.onCreateModuleNumber
					} ]
				} ],
				items : [ {
					xtype : 'treepanel',
					title : '模具工号',
					width : 150,
					region : 'west',
					margin : '0 5 0 0'
				}, {
					xtype : 'tabpanel',
					region : 'center',

					items : [ Ext.create('Manage.Business.MoldingSpecification') ]
				} ]
			});
		}
		return win;
	},

	onCreateModuleNumber : function() {
		Ext.create('CreateModuleWindow').show();
	}
});
