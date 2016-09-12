Ext.define('Module.ModuleProcessInformation', {
	extend : 'Ext.panel.Panel',
	layout : 'border',
	title : '模具加工详情',
	initComponent : function() {
		var me = this;
		me.items = [
				{
					xtype : 'gridpanel',
					title : '模具查询',
					width : 300,
					region : 'west',
					split : true,
					collapsible : true,
					forceFit : true,
					rowLines : true,
					tbar : [ {
						id : 'mpi-query-case',
						xtype : 'combobox',
						labelWidth : 65,
						valueField : 'sid',
						displayField : 'sname',
						editable : false,
						width : 100,
						value : 0,
						store : new Ext.data.Store({
							fields : [ 'sid', 'sname' ],
							data : [ {
								sid : 0,
								sname : '按模具号'
							}, {
								sid : 1,
								sname : '按客户别'
							}, {
								sid : 2,
								sname : '按机种'
							} ],
							autoLoad : true
						})
					}, {
						id : 'mpi-txt-content',
						xtype : 'textfield',
						emptyText : '请输入内容',
						width : 120
					}, '-', {
						text : '查询',
						iconCls : 'search-16',
						handler : me.initModuleCode
					} ],
					store : new Ext.data.Store({
						fields : [ 'modulebarcode', 'modulecode', 'modulestate' ],
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
						renderer : me.renderBold
					} ],
					listeners : {
						itemclick : me.getModuleResumeAll
					}
				},
				{
					id : 'mpi-module-resume-list',
					xtype : 'gridpanel',
					title : '模具加工详情',
					region : 'center',
					store : new Ext.data.Store({
						fields : [ 'modulecode', 'moduleclass', 'shortname', 'estart', 'eend', 'esthour', 'astart', 'aend', 'acthour', 'modulestate',
								'rname' ],
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
						header : '模具工号',
						dataIndex : 'modulecode',
						renderer : me.renderBold
					}, {
						header : '模具机种',
						dataIndex : 'moduleclass',
						renderer : me.renderBold
					}, {
						header : '客户名称',
						dataIndex : 'shortname',
						renderer : me.renderBold
					}, {
						header : '预计开始',
						dataIndex : 'estart',
						width : 110,
						renderer : me.renderBold
					}, {
						header : '预计结束',
						dataIndex : 'eend',
						width : 110,
						renderer : me.renderBold
					}, {
						header : '预计用时',
						dataIndex : 'esthour',
						width : 80,
						renderer : me.renderBold

					}, {
						header : '实际开始',
						dataIndex : 'astart',
						width : 110,
						renderer : me.renderBold
					}, {
						header : '实际结束',
						dataIndex : 'aend',
						width : 110,
						renderer : me.renderBold
					}, {
						header : '实际用时',
						dataIndex : 'acthour',
						width : 80,
						renderer : me.renderBold
					}, {
						header : '当前状态',
						dataIndex : 'modulestate',
						renderer : function(val) {
							return (!val ? '<b>正在加工</b>' : '<b>加工完成</b>');
						}
					}, {
						header : '履历',
						dataIndex : 'rname',
						renderer : me.renderBold
					} ],
					tbar : [ {
						text : '<b>加工模具讯息</b>',
						iconCls : 'cog-16',
						handler : me.getCurrentModuleInfo
					}
					// , '-', {
					// text : '<b>两天之内</b>',
					// iconCls : 'date-16'
					// }, '-', {
					// text : '<b>三天之内</b>',
					// iconCls : 'date-16'
					// }, '-', {
					// text : '<b>一周之内</b>',
					// iconCls : 'calendar-16'}
					]
				} ];
		me.callParent(arguments);
	},
	initModuleCode : function() {
		var stypeid = Ext.getCmp('mpi-query-case').getValue();
		var scontent = Ext.getCmp('mpi-txt-content').getValue();
		this.up('gridpanel').getStore().load({
			url : 'module/inquire/queryModuleInfoByCase',
			params : {
				stype : stypeid,
				content : scontent
			}
		});
	},
	getCurrentModuleInfo : function() {
		this.up('gridpanel').getStore().load({
			url : 'module/inquire/getCurrentModuleInformation'
		});
	},
	getModuleResumeAll : function(grid, record) {
		Ext.getCmp('mpi-module-resume-list').getStore().load({
			url : 'module/inquire/getAllModuleResumeInfo',
			params : {
				modulebarcode : record.get('modulebarcode')
			}
		});
	},
	renderBold : function(val) {
		return (val ? '<b>' + val + '</b>' : val);
	}
});