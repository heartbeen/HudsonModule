Ext.define('Deviser.ModuleDeviseInfo', {
	extend : 'Ext.window.Window',

	frame : true,
	height : 600,
	width : 800,
	modal : true,
	resumeid : null,
	modulebarcode : null,
	layout : {
		type : 'border'
	},
	bodyPadding : 3,
	title : '模具设计详情',
	fieldDefaults : {
		labelWidth : 65
	},
	initComponent : function() {
		var me = this;

		Ext.applyIf(me, {
			tbar : [ {
				id : 'mdi-resume-combo',
				xtype : 'combobox',
				fieldLabel : '<b>设计履历</b>',
				labelWidth : 65,
				valueField : 'id',
				displayField : 'cdate',
				value : me.resumeid,
				editable : false,
				store : Ext.create('Ext.data.Store', {
					id : 'mdi-resume-store',
					fields : [ 'id', 'sname', 'cdate' ],
					proxy : {
						url : 'devise/share/getDeviseResumeByModule?modulebarcode=' + me.modulebarcode,
						type : 'ajax',
						reader : {
							type : 'json'
						}
					},
					autoLoad : true
				}),
				listeners : {
					select : function(combo, records) {
						var resumeid = records[0].get('id');

						Ext.getCmp('dp-devise-resume-form').load({
							url : 'devise/share/getModuleResumeById?resumeid=' + resumeid
						});

						Ext.getStore('dp-schedule-info-store').load({
							url : 'devise/share/getProcessScheduleInfo?resumeid=' + resumeid
						});
					}
				},
				listConfig : {
					loadingText : '查找中...',
					getInnerTpl : function() {
						return '<a class="search-item"><b><span>{cdate}</span><span style = \'color:red\'>|{sname}</span></b></a>';
					}
				},
			} ],
			items : [ {
				id : 'dp-devise-resume-form',
				xtype : 'form',
				region : 'west',
				split : true,
				width : 300,
				bodyPadding : 10,
				title : '模具设计履历详情',
				fieldDefaults : {
					labelWidth : 65
				},
				items : [ {
					fieldLabel : '设计组别',
					name : 'groupid',
					xtype : 'combobox',
					anchor : '100%',
					editable : false,
					displayField : 'name',
					allowBlank : false,
					valueField : 'id',
					store : Ext.create('Ext.data.Store', {
						fields : [ 'id', 'name', 'stepid' ],
						proxy : {
							url : 'devise/share/getGroupInfo',
							type : 'ajax',
							reader : {
								type : 'json'
							}
						},
						autoLoad : true
					})
				}, {
					fieldLabel : '客户番号',
					name : 'guestcode',
					xtype : 'textfield',
					readOnly : true,
					anchor : '100%'
				}, {
					fieldLabel : '社内编号',
					name : 'modulecode',
					xtype : 'textfield',
					readOnly : true,
					anchor : '100%'
				}, {
					fieldLabel : '客户名称',
					name : 'shortname',
					xtype : 'textfield',
					readOnly : true,
					anchor : '100%'
				}, {
					fieldLabel : '模具状态',
					name : 'resumestate',
					xtype : 'textfield',
					readOnly : true,
					anchor : '100%'
				}, {
					fieldLabel : '加工状态',
					name : 'workstatename',
					xtype : 'textfield',
					readOnly : true,
					anchor : '100%'
				}, {
					fieldLabel : '订单日期',
					name : 'orderdate',
					readOnly : true,
					xtype : 'textfield',
					anchor : '100%'
				}, {
					fieldLabel : '订单纳期',
					name : 'duedate',
					readOnly : true,
					xtype : 'textfield',
					anchor : '100%'
				}, {
					fieldLabel : '预计开始',
					name : 'startdate',
					xtype : 'textfield',
					readOnly : true,
					anchor : '100%'
				}, {
					fieldLabel : '预计完成',
					name : 'enddate',
					xtype : 'textfield',
					readOnly : true,
					anchor : '100%'
				}, {
					fieldLabel : '实际开始',
					name : 'actualstart',
					xtype : 'textfield',
					readOnly : true,
					anchor : '100%'
				}, {
					fieldLabel : '实际完成',
					name : 'actualend',
					xtype : 'textfield',
					readOnly : true,
					anchor : '100%'
				}, {
					fieldLabel : '打合担当',
					name : 'takeon',
					xtype : 'textfield',
					readOnly : true,
					anchor : '100%'
				}, {
					fieldLabel : '设计担当',
					name : 'deviser',
					xtype : 'textfield',
					readOnly : true,
					anchor : '100%'
				}, {
					fieldLabel : '备注说明',
					name : 'remark',
					xtype : 'textareafield',
					readOnly : true,
					anchor : '100%',
					height : 108
				} ]
			}, {
				xtype : 'container',
				region : 'center',
				layout : {
					align : 'stretch',
					type : 'vbox'
				},
				items : [ {
					xtype : 'gridpanel',
					flex : 1,
					height : 537,
					listeners : {
						itemclick : function(grid, record) {
							var k_store = Ext.getStore('dp-schedule-task-store');
							k_store.load({
								params : {
									scheid : record.get('id')
								}
							});
						}
					},
					forceFit : true,
					viewConfig : {
						getRowClass : function(record, rowIndex, p, store) {
							if (record.get('relay')) {
								return 'state-20203';
							}
						}
					},
					title : '制程计划安排',
					store : Ext.create('Ext.data.Store', {
						id : 'dp-schedule-info-store',
						fields : [ 'id', 'craftname', 'statename', {
							name : 'planstart',
							type : 'date'
						}, {
							name : 'planend',
							type : 'date'
						}, {
							name : 'factstart',
							type : 'date'
						}, {
							name : 'factend',
							type : 'date'
						}, 'planhour', 'acthour', 'kind', 'relay' ],
						autoLoad : true,
						proxy : {
							url : 'devise/share/getProcessScheduleInfo?resumeid=' + me.resumeid,
							type : 'ajax',
							reader : {
								type : 'json'
							}
						}
					}),
					columns : [ {
						dataIndex : 'craftname',
						text : '制程名称',
						renderer : RenderFontBold
					}, {
						dataIndex : 'statename',
						text : '加工状态',
						renderer : RenderFontBold
					}, {
						xtype : 'datecolumn',
						dataIndex : 'planstart',
						text : '计划开始',
						renderer : function(val) {
							return val ? '<b>' + Ext.Date.format(val, 'Y-m-d') + '</b>' : val;
						}
					}, {
						xtype : 'datecolumn',
						dataIndex : 'planend',
						text : '计划结束',
						renderer : function(val) {
							return val ? '<b>' + Ext.Date.format(val, 'Y-m-d') + '</b>' : val;
						}
					}, {
						xtype : 'datecolumn',
						dataIndex : 'factstart',
						width : 130,
						text : '实际开始',
						renderer : function(val) {
							return val ? '<b>' + Ext.Date.format(val, 'Y-m-d H:i') + '</b>' : val;
						}
					}, {
						xtype : 'datecolumn',
						dataIndex : 'factend',
						width : 130,
						text : '实际结束',
						renderer : function(val) {
							return val ? '<b>' + Ext.Date.format(val, 'Y-m-d H:i') + '</b>' : val;
						}
					}, {
						dataIndex : 'planhour',
						text : '计划用时(H)',
						renderer : RenderFontBold
					}, {
						dataIndex : 'acthour',
						text : '实际用时(H)',
						renderer : RenderFontBold
					} ]
				}, {
					xtype : 'gridpanel',
					flex : 1,
					margins : '4 0 0 0',
					forceFit : true,
					viewConfig : {
						getRowClass : function(record, rowIndex, p, store) {
							if (!record.get('istime')) {
								return 'state-20203';
							}
						}
					},
					store : Ext.create('Ext.data.Store', {
						id : 'dp-schedule-task-store',
						fields : [ 'empname', 'worknumber', 'regionname', 'craftname', 'statename', {
							name : 'lrcdtime',
							type : 'date'
						}, {
							name : 'nrcdtime',
							type : 'date'
						}, 'acthour', 'istime' ],
						autoLoad : true,
						proxy : {
							url : 'devise/share/getScheduleTaskInfo',
							type : 'ajax',
							reader : {
								type : 'json'
							}
						}
					}),
					title : '制程设计明细',
					columns : [ {
						dataIndex : 'empname',
						text : '设计人员',
						renderer : RenderFontBold
					}, {
						dataIndex : 'worknumber',
						text : '工牌编号',
						renderer : RenderFontBold
					}, {
						dataIndex : 'regionname',
						text : '所在组别',
						renderer : RenderFontBold
					}, {
						dataIndex : 'craftname',
						text : '制程名称',
						width : 130,
						renderer : RenderFontBold
					}, {
						dataIndex : 'statename',
						text : '设计状态',
						renderer : RenderFontBold
					}, {
						dataIndex : 'lrcdtime',
						text : '开始时间',
						width : 130,
						renderer : function(val) {
							return val ? '<b>' + Ext.Date.format(val, 'Y-m-d H:i') + '</b>' : val;
						}
					}, {
						dataIndex : 'nrcdtime',
						width : 130,
						text : '结束时间',
						renderer : function(val) {
							return val ? '<b>' + Ext.Date.format(val, 'Y-m-d H:i') + '</b>' : val;
						}
					}, {
						dataIndex : 'acthour',
						text : '实际用时(H)',
						renderer : RenderFontBold
					} ]
				} ]
			} ]
		});

		me.callParent(arguments);

		Ext.getCmp('dp-devise-resume-form').load({
			url : 'devise/share/getModuleResumeById?resumeid=' + me.resumeid
		});
	}

});