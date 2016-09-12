/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('Manage.Design.SendBusPart', {
	extend : 'Ext.ux.desktop.Module',

	requires : [ 'Ext.panel.Panel' ],

	id : 'sendBus-win',

	init : function() {
		this.launcher = {
			text : 'SendBus Window',
			iconCls : 'sendBus'
		};
	},

	createWindow : function() {
		var desktop = this.app.getDesktop();
		var win = desktop.getWindow('sendBus-win');
		if (!win) {
			win = desktop.createWindow({
				id : 'sendBus-win',
				title : '派車申請單',
				width : 681,
				height : 349,
				iconCls : 'sendBus',
				animCollapse : false,
				border : false,
				constrainHeader : true,

				layout : 'border',
				items : [ {
					xtype : 'container',
					region : 'north',
					layout : 'hbox',
					items : [  ]
				}, {
					xtype : 'gridpanel',
					region : 'center',
					title : '派车行程',
					columns : [ {
						xtype : 'gridcolumn',
						dataIndex : 'string',
						text : '地点'
					}, {
						xtype : 'datecolumn',
						dataIndex : 'date',
						text : '起讫日期'
					}, {
						xtype : 'gridcolumn',
						text : '里程数'
					}, {
						xtype : 'gridcolumn',
						text : '随车人员'
					} ]
				}, {
					xtype : 'textfield',
					region : 'south',
					margin : '5 0 5 0',
					width : 568,
					fieldLabel : '备     注',
					labelWidth : 40
				} ],
				dockedItems : [ {
					xtype : 'toolbar',
					dock : 'top',
					items : [ {
						xtype : 'datefield',
						autoRender : false,
						fieldLabel : '申请时间',
						labelWidth : 55,
						width : 178,
					}, {
						xtype : 'timefield',
						width : 100,
						margin : '0 50 0 0',
						fieldLabel : 'Label',
						hideLabel : true
					}, {
						xtype : 'datefield',
						width : 178,
						fieldLabel : '出车时间',
						labelWidth : 55
					}, {
						xtype : 'timefield',
						width : 100,
						fieldLabel : 'Label',
						hideLabel : true
					}, ]
				},
				{
					xtype : 'toolbar',
					dock : 'top',
					items : [{
						xtype : 'textfield',
						width : 468,
						margin : '0 50 0 0',
						fieldLabel : '申请事由',
						labelWidth : 55
					}, {
						xtype : 'button',
						margin : '0003',
						text : '提交申请'
					}, ]
				},

				{
					xtype : 'toolbar',
					dock : 'bottom',
					items : [ {
						xtype : 'textfield',
						width : 120,
						fieldLabel : '申请者',
						margin : '0 120 0 0',
						labelWidth : 40
					}, {
						xtype : 'textfield',
						width : 120,
						fieldLabel : '审核',
						margin : '0 120 0 0',
						labelWidth : 35
					}, {
						xtype : 'textfield',
						width : 120,
						fieldLabel : '批准领导',
						labelWidth : 55
					} ]
				} ]
			});
		}
		return win;
	}
});
