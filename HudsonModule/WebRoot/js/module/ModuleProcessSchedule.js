Ext.define('Module.ModuleProcessSchedule', {
	extend : 'Ext.panel.Panel',

	title : '加工模具进度',
	layout : 'border',
	initComponent : function() {
		var me = this;
		me.items = [
				{
					xtype : 'gridpanel',
					forceFit : true,
					store : new Ext.data.Store({
						id : 'store-mps-query-modulecode',
						fields : [ "endtime", "starttime", "modulebarcode", 'modulecode', "guestcode", "resumename", "resumestate", "text", "id" ],
						autoLoad : true,
						proxy : {
							url : '',
							type : 'ajax',
							reader : {
								type : 'json',
								root : 'children'
							}
						}
					}),
					columns : [ {
						header : '模具工号',
						dataIndex : 'modulecode',
						renderer : function(val, meta, record) {
							var _resumename = record.get('resumename');
							var _guestcode = record.get('guestcode');
							return '<b>' + val + (_guestcode ? ('/<font color = blue>' + _guestcode + '</font>') : '') + "<font color = red>["
									+ (!_resumename ? '完成' : _resumename) + ']</font></b>';
						}
					} ],
					region : 'west',
					title : '加工模具栏',
					width : 305,
					split : true,
					listeners : {
						itemclick : function(grid, record) {
							Ext.Ajax.request({
								url : 'module/inquire/getCurrentProcessModuleInfo',
								params : {
									resumeid : record.get('id')
								},
								success : function(x) {
									var json = Ext.JSON.decode(x.responseText);
									var partGrid = Ext.getCmp('grid-mps-parts-schedule');
									partGrid.down('#bar-mps-modulecode').setText('<b> 模具工号-> ' + record.get('text') + '</b>');
									partGrid.down('#bar-mps-esthour').setText('<b> 预计用时-> ' + json.esthour + '</b>');
									partGrid.down('#bar-mps-acthour').setText('<b> 实际用时-> ' + json.acthour + '</b>');
									partGrid.down('#bar-mps-schedule').setValue(me.renderProgressBar(json.esthour, json.acthour));

									partGrid.getStore().removeAll();
									partGrid.getStore().add(json.detail);
								},
								failure : function(x, y, z) {
									Ext.Msg.alert('提醒', '连接服务器失败,请检查网络连接!');
								}
							});
						}
					},
					tbar : [
					// {
					// xtype : 'textfield',
					// emptyText : '请输入模具工号',
					// listeners : {
					// change : function(txt, nw, od) {
					// Ext.getStore('store-mps-query-modulecode').load({
					// url : 'module/inquire/getProcessModuleCodeList',
					// params : {
					// modulecode : nw
					// }
					// });
					// }
					// }
					// },
					{
						id : 'mps-chk-by-guest',
						xtype : 'checkbox',
						boxLabel : '依番号'
					}, ''
					// , Ext.create('Module.ModuleFindTextField', {
					// queryLength : 2,
					// url : 'public/module?isResume=false'
					// })
					, {
						xtype : 'textfield',
						emptyText : '请输入模具号',
						isTxt : true,
						listeners : {
							change : me.onResumeModule
						}
					}, {
						text : '快速查询',
						iconCls : 'lightning-16',
						menu : Ext.create("Ext.menu.Menu", {
							items : [ {
								text : '新增模具',
								// isNew : true,
								isTxt : false,
								states : "['20401']",
								parent : me,
								iconCls : 'cog_add-16',
								handler : me.onResumeModule
							}, {
								text : '修模设变',
								isTxt : false,
								// isNew : false,
								states : "['20402','20403']",
								parent : me,
								iconCls : 'cog_edit-16',
								handler : me.onResumeModule
							}, {
								text : '治具加工',
								isTxt : false,
								states : "['20409']",
								// isNew : false,
								iconCls : 'cog_go-16',
								parent : me,
								handler : me.onResumeModule
							}, {
								text : '量产加工',
								isTxt : false,
								states : "['20410']",
								// isNew : false,
								iconCls : 'wand-16',
								parent : me,
								handler : me.onResumeModule
							}, {
								text : '零件加工',
								isTxt : false,
								states : "['20408']",
								// isNew : false,
								iconCls : 'cog-16',
								parent : me,
								handler : me.onResumeModule
							}, {
								text : '暂停模具',
								isTxt : false,
								// isNew : false,
								states : "['20404']",
								parent : me,
								iconCls : 'cog_delete-16',
								handler : me.onResumeModule
							} ]
						})
					} ]
				}, {
					id : 'grid-mps-parts-schedule',
					xtype : 'gridpanel',
					region : 'center',
					title : '工件加工进度',
					columnLines : true,
					store : new Ext.data.Store({
						id : 'store-mps-module-parts',
						fields : [ 'partcode', 'partname', 'partplace', 'partstate', 'acthour', 'esthour', 'per' ],
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
						header : '部件编号',
						dataIndex : 'partcode',
						renderer : function(val) {
							if (val) {
								return '<b>' + val + '</b>';
							}
						}
					}, {
						header : '部件名称',
						dataIndex : 'partname',
						renderer : function(val) {
							if (val) {
								return '<b>' + val + '</b>';
							}
						}
					}, {
						header : '部件位置',
						dataIndex : 'partplace',
						renderer : function(val) {
							if (val) {
								return '<b>' + val + '</b>';
							}
						}
					}, {
						header : '部件状态',
						dataIndex : 'partstate',
						renderer : function(val) {
							if (val) {
								return '<b>' + val + '</b>';
							}
						}
					}, {
						header : '实际用时',
						dataIndex : 'acthour',
						align : 'right',
						renderer : function(val) {
							if (val) {
								return '<b>' + val + '</b>';
							}
						}
					}, {
						header : '预计用时',
						dataIndex : 'esthour',
						align : 'right',
						renderer : function(val) {
							if (val) {
								return '<b>' + val + '</b>';
							}
						}
					}, {
						header : '计划进度',
						dataIndex : 'partper',
						renderer : function(val, meta, record) {
							return me.renderProgressBar(record.get('esthour'), record.get('acthour'));
						}
					} ],
					tbar : [ {
						itemId : 'bar-mps-modulecode',
						text : '<b> 模具工号 ->  </b>'
					}, '-', {
						itemId : 'bar-mps-esthour',
						text : '<b> 预计用时 -> 0</b>'
					}, '-', {
						itemId : 'bar-mps-acthour',
						text : '<b> 实际用时 -> 0</b>'
					}, '-', {
						itemId : 'bar-mps-schedule',
						xtype : 'displayfield',
						labelWidth : 90,
						width : 150,
						fieldLabel : '<b> 计划完成比 -></b>',
						// hideLabel : true,
						labelSeparator : '',
						fieldStyle : 'background:#fff',
						value : me.renderProgressBar(0, 0)
					} ]
				} ];
		me.callParent(arguments);
	},

	/**
	 * 新模或修模/设变
	 */
	onResumeModule : function(ctrl, nw) {
		var item = this;
		var chk = Ext.getCmp('mps-chk-by-guest').getValue();
		item.up('gridpanel').getStore().load({
			url : 'public/getModuleResumeInfoByCase',
			params : {
				chk : chk,
				query : (item.isTxt ? nw : null),
				states : item.states
			}
		});
	},
	/**
	 * /** 新模或修模/设变
	 */
	onResumeModuleProcess : function(ctrl, nw) {
		var chk = Ext.getCmp('mps-chk-by-guest').getValue();

		Ext.getStore('store-mps-query-modulecode').load({
			url : 'module/inquire/getProcessModuleCodeList',
			params : {
				chk : chk,
				query : nw
			}
		});
	},

	parseFloatString : function(x) {
		if (isNaN(x)) {
			return 0;
		}

		try {
			return parseFloat(x);
		} catch (ex) {
			return 0;
		}
	},
	mathRound : function(num, pre) {
		var pos = Math.pow(10, pre);
		return Math.round(pos * num) / pos;
	},
	renderProgressBar : function(est, act) {
		var mine = this;
		var per = mine.parseFloatString(est) ? mine.mathRound(mine.parseFloatString(act) / mine.parseFloatString(est) * 100, 1) : 0;
		var bar = '<div style = \'background:' + (per > 100 ? '#d9534f' : '#5cb85c') + ';width:' + (per > 100 ? 100 : per) + '%;font-weight:bold\'>'
				+ per + '%<div>';
		return bar;
	}
});