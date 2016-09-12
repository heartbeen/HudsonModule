Ext.define('Module.ModuleArrange', {
	extend : 'Ext.tab.Panel',

	initComponent : function() {
		var tab = this;

		PlanDeptCrafts = [];
		Machines = [];
		MachineCombo = [];

		setTimeout(function() {
			var craftToolbar = Ext.getCmp('dept-plan-toolbar-id');
			var machineToolbar = Ext.getCmp('dept-machine-toolbar-id');

			var me = Ext.getCmp('Module.ModulePartArrange');

			PlanDeptCrafts.push({
				xtype : 'label',
				text : "本单位的工艺:",
				margins : '0 0 0 5'
			});

			PlanDeptCrafts.push('-');
			Machines.push('-');

			Ext.Ajax.request({
				url : 'module/process/deptCraftAndMachine',
				success : function(response) {
					var res = JSON.parse(response.responseText);

					App.InterPath(res, function() {
						if (res.success) {
							me.craftId = res.crafts[0].craftid;// 初始化工艺ID
							me.craftName = res.crafts[0].craftname;// 初始化工艺名称
							setTimeout(function() {
								me.createCraftSplit(me);
							}, 300);

							for ( var i in res.crafts) {
								PlanDeptCrafts.push({
									tooltip : res.crafts[i].craftname,
									id : 'plan;' + res.crafts[i].craftid,
									text : res.crafts[i].craftname,
									cls : 'PlanDeptCrafts-button',
									enableToggle : true,
									pressed : i == 0 ? true : false,
									handler : function() {
										var me = Ext.getCmp('Module.ModulePartArrange');

										if (!me.moduleBarcode || !me.resumeId) {
											Fly.msg('清单', '只有您选择了模具,才能查看清单!');
											return;
										}

										me.craftName = this.text;// 初始化工艺名称
										me.craftId = this.id.split(';')[1];
										me.selectWaitProcessPart(me, Ext.getStore('part-plan-store-id'));

										// 生成工艺加工任务选项
										me.createCraftSplit(me);
									}
								});

								PlanDeptCrafts.push('-');
							}

							for ( var i in res.machines) {
								Machines.push({
									tooltip : res.machines[i].craftname,
									id : res.machines[i].machinebarcode,
									text : res.machines[i].machinecode,
									machineState : res.machines[i].machinestate,
									iconCls : 'cog-16 ',
									cls : 'machine-button',
									enableToggle : true,
									pressed : i == 0 ? true : false,
									handler : function() {
									}
								});

								MachineCombo.push({
									machinebarcode : res.machines[i].machinebarcode,
									machineCode : res.machines[i].machinecode
								});

								Machines.push('-');
							}

							craftToolbar.add(PlanDeptCrafts);
							machineToolbar.add(Machines);
						}
					});
				},
				failure : function(response, opts) {
					App.Error(response);
				}
			});
		}, 500);

		Ext.apply(tab, {
			items : [ Ext.create('Module.ModulePartArrange'), Ext.create('Module.ModuleMachineArranged') ]
		});

		tab.callParent(arguments);

	}
});

/**
 * 得到当前加工单位可以加工的工艺和机台,延时导入
 */
(function() {
})();

/** 工艺拆分工作安排面板 */
Ext.define('CraftSplitPanel', {

	extend : 'Ext.form.Panel',
	layout : {
		padding : 3,
		type : 'anchor'
	},

	bodyPadding : 3,
	minValue : new Date(),

	initComponent : function() {
		var me = this;

		Ext.apply(me, {
			items : [ {
				xtype : 'combobox',
				anchor : '100%',
				fieldLabel : '机台号码',
				labelWidth : 52,
				name : 'machinebarcode',

				valueField : 'machinebarcode',
				displayField : 'machineCode',
				editable : false,
				store : Ext.create('Ext.data.Store', {

					fields : [ 'machinebarcode', 'machineCode' ],
					data : me.machines,
					proxy : {
						type : 'memory',
						reader : {
							type : 'json'
						}
					}
				})
			}, {
				xtype : 'combobox',
				anchor : '100%',
				fieldLabel : '加工者',
				name : 'processor',
				allowBlank : false,
				labelWidth : 52,
				valueField : 'worknumber',
				displayField : 'empname',
				editable : false,
				// 工号下拉框
				store : Ext.create('Ext.data.Store', {

					fields : [ 'worknumber', 'empname' ],

					proxy : {
						type : 'ajax',
						url : 'public/moduleProcesser',
						reader : {
							type : 'json',
							root : 'processer'
						}
					}

				}),
				listeners : {
					select : function(combo, records, eOpts) {
					}
				}

			}, {
				xtype : 'container',
				layout : {
					type : 'table'
				},
				items : [ {
					xtype : 'datefield',
					margin : '-3 2 2 0',
					width : 150,
					name : 'startDate',
					fieldLabel : '开工时间',
					allowBlank : false,
					minValue : me.minValue,
					format : 'Y-m-d',
					labelWidth : 52
				}, {
					xtype : 'timefield',
					width : 60,
					name : 'startTime',
					fieldLabel : 'Label',
					allowBlank : false,
					minValue : me.minValue,
					format : 'H:i',
					hideLabel : true
				} ]
			}, {
				xtype : 'numberfield',
				anchor : '60%',
				width : 232,
				fieldLabel : '加工时长',
				allowBlank : false,
				minValue : 0.5,
				step : 0.5,
				name : 'timeout',
				labelWidth : 52
			}, {
				xtype : 'textareafield',
				anchor : '100%',
				name : 'remark',
				fieldLabel : '备注',
				labelWidth : 52,
				maxLength : 200
			} ]
		});

		me.callParent(arguments);
	}
});