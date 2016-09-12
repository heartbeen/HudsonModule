Ext.define('Module.LocalePartInfo', {
	extend : 'Ext.window.Window',
	title : '本单位零件讯息',
	width : 650,
	height : 500,
	modal : true,
	layout : 'border',
	defaults : {
		padding : 3
	},
	initComponent : function() {
		var self = this;
		self.items = [ {
			xtype : 'gridpanel',
			region : 'center',
			store : Ext.create('Ext.data.Store', {
				fields : [ 'resumeid', 'partlistcode', 'partbarlistcode', 'partname', 'modulecode', 'batchno', 'statename' ],
				autoLoad : true,
				proxy : {
					url : 'module/inquire/getLocalePartInfo',
					type : 'ajax',
					reader : {
						type : 'json'
					}
				}
			}),
			listeners : {
				itemclick : self.getScheduleInfo
			},
			columns : [ {
				text : '模具工号',
				dataIndex : 'modulecode',
				renderer : self.renderBoldFont
			}, {
				text : '工件编号',
				dataIndex : 'partlistcode',
				renderer : self.renderBoldFont
			}, {
				text : '工件名称',
				dataIndex : 'partname',
				renderer : self.renderBoldFont
			}, {
				text : '所在机台',
				dataIndex : 'batchno',
				renderer : self.renderBoldFont
			}, {
				text : '工件状态',
				dataIndex : 'statename',
				renderer : self.renderBoldFont
			} ]
		}, {
			xtype : 'gridpanel',
			region : 'south',
			height : 200,
			store : Ext.create('Ext.data.Store', {
				id : 'pps-store-sche-info',
				fields : [ 'scheid', 'craftname', 'starttime', 'endtime', 'usehour', 'stype' ],
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
				text : '排程编号',
				dataIndex : 'scheid',
				renderer : self.renderBoldFont
			}, {
				text : '工艺名称',
				dataIndex : 'craftname',
				renderer : self.renderBoldFont
			}, {
				text : '开工时间',
				dataIndex : 'starttime',
				renderer : self.renderBoldFont,
				width : 120
			}, {
				text : '结束时间',
				dataIndex : 'starttime',
				renderer : self.renderBoldFont,
				width : 120
			}, {
				text : '预计用时',
				dataIndex : 'usehour',
				renderer : self.renderBoldFont,
				width : 80
			}, {
				text : '排程类型',
				dataIndex : 'stype',
				renderer : self.renderBoldFont,
				width : 80
			} ]
		} ];

		self.callParent(arguments);
	},
	renderBoldFont : function(val) {
		return (val ? '<b>' + val + '</b>' : val);
	},
	getScheduleInfo : function(grid, record) {
		Ext.getStore('pps-store-sche-info').load({
			url : 'module/inquire/getLocalePartSchedule',
			params : {
				partid : record.get('partbarlistcode'),
				resumeid : record.get('resumeid')
			}
		});
	}
});
Ext.define('Module.PreviewProcessSchedule', {
	extend : 'Ext.panel.Panel',
	title : '预计开工排程',
	layout : 'fit',
	initComponent : function() {
		var me = this;
		me.items = [ {
			xtype : 'gridpanel',
			title : '工件预计开工',
			tbar : [ {
				id : 'pps-select-craft',
				xtype : 'combobox',
				fieldLabel : '<b>选择工艺</b>',
				editable : false,
				labelWidth : 65,
				displayField : 'name',
				valueField : 'id',
				store : new Ext.data.Store({
					fields : [ 'id', 'name' ],
					autoLoad : true,
					proxy : {
						url : 'public/craftItem',
						type : 'ajax',
						reader : {
							type : 'json',
							root : 'crafts'
						}
					}
				}),
				listeners : {
					select : me.getScheduleList
				}
			}, {
				id : 'pps-select-date',
				xtype : 'datefield',
				fieldLabel : '<b>选择日期</b>',
				labelWidth : 65,
				editable : false,
				format : 'Y-m-d',
				listeners : {
					select : me.getScheduleList
				}
			}, '->', {
				text : '<b>本单位工件讯息</b>',
				iconCls : 'cog_go-16',
				handler : function() {
					Ext.create('Module.LocalePartInfo', {}).show();
				}
			} ],
			columns : [ {
				text : '模具工号',
				renderer : me.getBoldFont,
				dataIndex : 'modulecode'
			}, {
				text : '工件编号',
				renderer : me.getBoldFont,
				dataIndex : 'partlistcode'
			}, {
				text : '工件名称',
				renderer : me.getBoldFont,
				dataIndex : 'partname'
			}, {
				text : '排程工艺',
				renderer : me.getBoldFont,
				dataIndex : 'craftname'
			}, {
				text : '预计开工',
				dataIndex : 'starttime',
				renderer : me.getBoldFont,
				width : 150
			}, {
				text : '预计完工',
				dataIndex : 'endtime',
				renderer : me.getBoldFont,
				width : 150
			}, {
				text : '预计耗时',
				dataIndex : 'esttime',
				renderer : function(val) {
					return '<b>' + val + '</b>';
				}
			}, {
				text : '工件状态',
				dataIndex : 'statename',
				renderer : function(val) {
					return (!val ? '<b>未签收</b>' : '<b>' + val + '</b>');
				}
			}, {
				text : '当前单位',
				dataIndex : 'deptname',
				renderer : function(val) {
					return (!val ? '<b>未接收</b>' : '<b>' + val + '</b>');
				}
			} ],
			store : Ext.create('Ext.data.Store', {
				id : 'pps-schedule-store',
				fields : [ 'modulecode', 'partlistcode', 'partname', 'craftname', 'starttime', 'esttime', 'endtime', 'deptname', 'statename' ],
				autoLoad : true,
				proxy : {
					url : '',
					type : 'ajax',
					reader : {
						type : 'json'
					}
				}
			})
		} ];

		// 加載系統時間來完成
		me.getServerDateTime();

		me.callParent(arguments);
	},
	getScheduleList : function() {
		//var self = this;
		// 獲取待選擇的工藝ID號和日期
		var craftid = Ext.getCmp('pps-select-craft').getValue();
		var dateStr = Ext.Date.format(Ext.getCmp('pps-select-date').getValue(), 'Y-m-d');
		// 如果兩者之間有一個為空,則返回
		if (!craftid || !dateStr) {
			return;
		}

		Ext.getStore('pps-schedule-store').load({
			url : 'module/schedule/queryPredictCraftSchedule',
			params : {
				day : dateStr,
				craftid : craftid
			}
		});
	},
	getServerDateTime : function() {
		Ext.Ajax.request({
			url : 'public/getDateTimeNow',
			method : 'POST',
			success : function(resp) {
				var timeJson = Ext.JSON.decode(resp.responseText);
				if (timeJson.datetime) {
					Ext.getCmp('pps-select-date').setValue(new Date(timeJson.datetime));
				}
			}
		});
	},
	getBoldFont : function(val) {
		return (val ? '<b>' + val + '</b>' : val);
	}
});