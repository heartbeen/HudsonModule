/**
 * 
 */
Ext.define('Module.portlet.ModuleProcessWarnPortlet', {
	extend : 'Ext.grid.Panel',

	height : 300,
	warnFields : [ "craftname", {
		name : "endtime",
		type : 'date'
	}, "craftid", "evaluate", "duration", {
		name : "starttime",
		type : 'date'
	}, "moduleresumeid", "partbarlistcode", "modulecode", "partlistcode", "delaytime" ],

	queryUrl : '',

	initComponent : function() {
		var me = this;

		Ext.applyIf(me, {
			store : Ext.create('Ext.data.Store', {
				fields : me.warnFields,
				autoLoad : false,

				proxy : {
					type : 'ajax',
					url : me.queryUrl,
					reader : {
						type : 'json'
					}
				}
			}),
			columnLines : true,
			rowLines : true,
			columns : [ {
				xtype : 'gridcolumn',
				dataIndex : 'modulecode',
				width : 90,
				text : '模具工号'
			}, {
				xtype : 'gridcolumn',
				dataIndex : 'partlistcode',
				width : 80,
				text : '工件'
			}, {
				xtype : 'gridcolumn',
				dataIndex : 'craftname',
				width : 70,
				text : '工艺'
			}, {
				xtype : 'datecolumn',
				dataIndex : 'starttime',
				width : 80,
				format : 'Y-m-d',
				text : '计划开工时间'
			}, {
				xtype : 'datecolumn',
				dataIndex : 'endtime',
				width : 80,
				format : 'Y-m-d',
				text : '计划完工时间'
			}, {
				xtype : 'numbercolumn',
				dataIndex : 'evaluate',
				width : 74,
				text : '预估工时'
			}, {
				xtype : 'gridcolumn',
				dataIndex : 'delaytime',
				width : 74,
				text : '延时',
				renderer : function(val) {
					if (val > 0) {
						return '<span style="color:red;">' + val + '小时</span>';
					}

					else if (val < 0) {
						return '<span style="color:green;">' + val + '小时</span>';
					}

					return '';
				}
			} ],
			dockedItems : [ {
				xtype : 'toolbar',
				dock : 'top',
				items : [ {
					xtype : 'combobox',
					width : 155,
					editable : false,
					fieldLabel : '提示单位',
					store : Ext.create('Ext.data.Store', {
						fields : [ 'deptid', 'name' ],
						proxy : {
							type : 'ajax',
							url : 'public/moduleProcessDept',
							reader : {
								type : 'json'
							}
						}
					}),
					valueField : 'deptid',
					displayField : 'name',
					labelWidth : 60
				}, {
					xtype : 'combobox',
					stype : 'margin-left:5px;',
					width : 180,
					editable : false,
					fieldLabel : '提示项目',
					store : Ext.create('Ext.data.Store', {
						fields : [ 'queryid', 'name' ],
						data : [ {
							queryid : '1',
							name : '工件离开工时间'
						}, {
							queryid : '2',
							name : '工件离完工时间'
						}, {
							queryid : '3',
							name : '错过开工时间'
						}, {
							queryid : '4',
							name : '错过完工时间'
						} ],
						proxy : {
							type : 'memory'
						}
					}),
					valueField : 'queryid',
					displayField : 'name',
					labelWidth : 60
				}, {
					xtype : 'numberfield',
					width : 100,
					fieldLabel : '时间(天)',
					stype : 'margin-left:5px;',
					labelWidth : 50,
					minValue : 0,
					value : 0
				}, '-', {
					xtype : 'button',
					width : 60,
					text : '查询',
					scope : me,
					handler : me.queryWarn
				} ]
			} ]
		});

		me.callParent(arguments);
	},

	/**
	 * 按条件查询`
	 */
	queryWarn : function(button) {
		var me = this;
		var toolbar = button.up('toolbar');
		var deptCombo = toolbar.getComponent(0);
		var queryCombo = toolbar.getComponent(1);
		var timeField = toolbar.getComponent(2);

		var deptId = deptCombo.getValue();
		var query = queryCombo.getValue();
		var time = query == 3 || query == 4 ? 0 : 0 - timeField.getValue();

		me.queryUrl = 'public/queryModulePartDeadLine?'.concat('deptId=').concat(deptId);
		me.queryUrl = me.queryUrl.concat('&query=').concat(query);
		me.queryUrl = me.queryUrl.concat('&time=').concat(time);

		me.getStore().load({
			url : me.queryUrl
		});
	},

	/**
	 * 查找条件菜单显示方法
	 */
	searchHandler : function(e, portlet, target, header, tool) {

	},
	/**
	 * 刷新数据方法
	 */
	refreshHandler : function(e, portlet, target, header, tool) {
		portlet.getStore().load({
			url : portlet.queryUrl
		});
	},

	getName : function() {
		return Module.portlet.ModuleProcessWarnPortlet.getName();
	}
});
