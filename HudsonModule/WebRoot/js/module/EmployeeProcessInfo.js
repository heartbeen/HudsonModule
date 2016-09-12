Ext.define('Module.EmployeeProcessInfo', {
	extend : 'Ext.panel.Panel',
	title : '員工加工明細',
	layout : 'border',
	initComponent : function() {
		var self = this;
		self.items = [ {
			xtype : 'gridpanel',
			region : 'center',
			title : 'D卡',
			rowLines : true,
			columnLines : true,
			listeners : {
				itemclick : function(grid, record, item) {
					Ext.getStore('emp-inquire-detail-store').load({
						url : 'module/inquire/getEmployeeProcessPartInformation',
						params : {
							empid : record.get('empId'),
							start : record.get('startTime'),
							end : record.get('endTime')
						}
					});
				}
			},
			tbar : [ {
				id : 'emp-inquire-process-deptid',
				xtype : 'combobox',
				fieldLabel : '<b>&nbsp;加工部門</b>',
				labelWidth : 70,
				editable : false,
				displayField : 'deptname',
				valueField : 'deptid',
				store : new Ext.data.Store({
					fields : [ 'deptid', 'deptname', 'stepid' ],
					proxy : {
						url : 'module/inquire/getUserCurrentRegionDepartment',
						type : 'ajax',
						reader : {
							type : 'json'
						}
					},
					autoLoad : true
				}),
				listConfig : {
					getInnerTpl : function() {
						return '<a class="search-item"><span style = \'font-weight:bold\'>{deptname}</span></a>';
					}
				}
			}, Ext.create('Project.component.DateTimeField', {
				id : 'emp-inquire-process-start',
				fieldLabel : '<b>&nbsp;开始时间</b>',
				labelWidth : 70,
				format : 'Y-m-d H:i',
				editable : false,
				value : self.getTranslateDate(new Date(), Ext.Date.DAY, 1, ' 08:00:00')
			}), Ext.create('Project.component.DateTimeField', {
				id : 'emp-inquire-process-end',
				fieldLabel : '<b>&nbsp;完成时间</b>',
				labelWidth : 70,
				format : 'Y-m-d H:i',
				editable : false,
				value : self.getTranslateDate(new Date(), Ext.Date.DAY, 0, ' 08:00:00')
			}), {
				text : '查询',
				iconCls : 'search-16',
				handler : function() {
					// 获取员工部门
					var deptCtrl = Ext.getCmp('emp-inquire-process-deptid');
					if (!deptCtrl.getValue()) {
						Fly.msg('提醒', '未选择待查询的部门!');
						return;
					}

					var deptModel = deptCtrl.getStore().findRecord('deptid', deptCtrl.getValue());
					var deptid = deptModel.data.stepid;
					// 获取开始时间
					var starttime = Ext.getCmp('emp-inquire-process-start').getValue();
					// 获取结束时间
					var endtime = Ext.getCmp('emp-inquire-process-end').getValue();

					if (!self.compareDate(endtime, starttime)) {
						Fly.msg('提醒', '开始时间不能大于结束时间!');
						return;
					}

					if (!self.timeInteral(starttime, endtime, 7)) {
						Fly.msg('提醒', '时间间隔不能大于一周!');
						return;
					}

					Ext.getStore('emp-inquire-process-store').load({
						url : 'module/inquire/getEmployeeProcessInformation',
						params : {
							deptid : deptid,
							start : self.getFormatDate(starttime),
							end : self.getFormatDate(endtime)
						}
					});

				}
			} ],
			store : Ext.data.Store({
				id : 'emp-inquire-process-store',
				fields : [ 'lName', 'pName', 'empName', 'totalHour', 'actHour', 'startTime', 'endTime', 'empId' ],
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
				header : '<b>员工部门</b>',
				dataIndex : 'pName',
				renderer : function(val) {
					return self.renderFontBold(val);
				}
			}, {
				header : '<b>加工部门</b>',
				dataIndex : 'lName',
				renderer : function(val) {
					return self.renderFontBold(val);
				}
			}, {
				header : '<b>员工姓名</b>',
				dataIndex : 'empName',
				renderer : function(val) {
					return self.renderFontBold(val);
				}
			}, {
				header : '<b>查询时长</b>',
				dataIndex : 'totalHour',
				width : 80,
				align : 'right',
				renderer : function(val) {
					return self.renderFontBold(val);
				}
			}, {
				header : '<b>开始时间</b>',
				dataIndex : 'startTime',
				renderer : function(val) {
					return self.renderFontBold(Ext.Date.format(new Date(val), 'Y-m-d H:i'));
				},
				width : 150
			}, {
				header : '<b>结束时间</b>',
				dataIndex : 'endTime',
				renderer : function(val) {
					return self.renderFontBold(Ext.Date.format(new Date(val), 'Y-m-d H:i'));
				},
				width : 150
			}, {
				header : '<b>有效时间</b>',
				dataIndex : 'actHour',
				align : 'right',
				width : 80,
				renderer : function(val) {
					return self.renderFontBold(self.mathRound(self.parseFloatString(val), 2));
				}
			} ]
		}, {
			xtype : 'gridpanel',
			region : 'south',
			title : '加工工件',
			split : true,
			height : 200,
			columnLines : true,
			rowLines : true,
			store : Ext.create('Ext.data.Store', {
				id : 'emp-inquire-detail-store',
				fields : [ 'partlistcode', 'partcode', 'modulecode', 'deptname', 'usehour', 'statename', 'starttime', 'endtime' ],
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
				header : '<b>加工部门</b>',
				dataIndex : 'deptname',
				renderer : function(val) {
					return self.renderFontBold(val);
				}
			}, {
				header : '<b>模具工号</b>',
				dataIndex : 'modulecode',
				renderer : function(val) {
					return self.renderFontBold(val);
				}
			}, {
				header : '<b>部件编号</b>',
				dataIndex : 'partlistcode',
				renderer : function(val) {
					return self.renderFontBold(val);
				}
			}, {
				header : '<b>有效工时</b>',
				dataIndex : 'usehour',
				width : 80,
				align : 'right',
				renderer : function(val) {
					return self.renderFontBold(self.mathRound(self.parseFloatString(val), 2));
				}
			}, {
				header : '<b>部件状态</b>',
				dataIndex : 'statename',
				width : 80,
				renderer : function(val) {
					return self.renderFontBold(val);
				}
			}, {
				header : '<b>开始时间</b>',
				dataIndex : 'starttime',
				width : 150,
				renderer : function(val) {
					return self.renderFontBold(val);
				}
			}, {
				header : '<b>结束时间</b>',
				dataIndex : 'endtime',
				width : 150,
				renderer : function(val) {
					return self.renderFontBold(val);
				}
			} ]
		} ];

		self.callParent(arguments);
	},
	/**
	 * 格式化时间为Y-m-d H:i:s
	 * 
	 * @param date
	 * @returns
	 */
	getFormatDate : function(date) {
		return Ext.Date.format(date, 'Y-m-d H:i:s');
	},
	/**
	 * 比较两个时间的大小
	 * 
	 * @param ori
	 * @param cpr
	 * @returns {Boolean}
	 */
	compareDate : function(ori, cpr) {
		return (ori >= cpr);
	},
	/**
	 * 判断两个时间是否在制定日期的区间内(天)
	 * 
	 * @param start
	 * @param end
	 * @param inter
	 * @returns {Boolean}
	 */
	timeInteral : function(start, end, inter) {
		var endDay = Ext.Date.subtract(start, Ext.Date.DAY, inter);
		return (endDay <= end);
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
	renderFontBold : function(val) {
		return '<b>' + val + '</b>';
	},
	getTranslateDate : function(date, inter, val, pad) {
		var day = Ext.Date.subtract(date, inter, val);
		return new Date(Ext.Date.format(day, 'Y-m-d') + pad);
	}
});