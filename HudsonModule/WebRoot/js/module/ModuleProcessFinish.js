Ext.define('Module.ModuleProcessFinish', {
	extend : 'Ext.panel.Panel',
	title : '模具完工',
	layout : 'border',
	initComponent : function() {
		var me = this;
		me.items = [
				{
					xtype : 'gridpanel',
					title : '模具工号',
					width : 305,
					region : 'west',
					split : true,
					forceFit : true,
					store : Ext.create('Ext.data.Store', {
						id : 'mpf-store-module-info',
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
						text : '模具工号',
						dataIndex : 'modulecode',
						renderer : function(val, meta, record) {
							var _resumename = record.get('resumename');
							var _guestcode = record.get('guestcode');
							return '<b>' + val + (_guestcode ? ('/<font color = blue>' + _guestcode + '</font>') : '') + "<font color = red>["
									+ (!_resumename ? '完成' : _resumename) + ']</font></b>';
						}
					} ],
					tbar : [ {
						id : 'mpf-chk-by-guest',
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
								text : '零件加工',
								isTxt : false,
								states : "['20408']",
								// isNew : false,
								iconCls : 'cog-16',
								parent : me,
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
								text : '暂停模具',
								isTxt : false,
								// isNew : false,
								states : "['20404']",
								parent : me,
								iconCls : 'cog_delete-16',
								handler : me.onResumeModule
							} ]
						})
					} ],
					listeners : {
						itemclick : me.getModuleInformation
					}
				},
				{
					id : 'mpf-grid-part-info',
					xtype : 'gridpanel',
					title : '工件清单',
					region : 'center',
					selModel : {
						selType : 'checkboxmodel',
						mode : 'SIMPLE'
					},
					rowLines : true,
					columnLines : true,
					resumeid : null,
					store : Ext.create('Ext.data.Store', {
						id : 'mpf-store-part-info',
						fields : [ 'mid', 'partlistcode', 'partname', 'regionname', 'statename', 'scher', 'batchno', 'craftname', 'craftcode',
								'empname', 'actiontime', 'ismajor', 'fid', 'isfixed' ],
						autoLoad : true,
						proxy : {
							url : '',
							type : 'ajax',
							reader : {
								type : 'json'
							}
						}
					}),
					viewConfig : {
						getRowClass : function(record, rowIndex, p, store) {
							var isfixed = record.get('isfixed');
							if (isfixed) {
								return 'state-20203';
							}

							var fid = record.get('fid');
							if (fid) {
								return 'state-20208';
							}
						}
					},
					columns : [ {
						text : '零件编号',
						dataIndex : 'partlistcode',
						renderer : me.renderBoldFont
					}, {
						text : '工件名称',
						dataIndex : 'partname',
						width : 150,
						renderer : me.renderBoldFont
					}, {
						text : '加工排程',
						dataIndex : 'scher',
						width : 400,
						renderer : me.renderBoldFont
					}, {
						text : '工件状态',
						dataIndex : 'statename',
						renderer : me.renderBoldFont
					}, {
						text : '所在单位',
						dataIndex : 'regionname',
						renderer : function(val) {
							return (val ? ('<b>' + val + '</b>') : '<b><font color=blue>未接收</font></b>');
						}
					}, {
						text : '所在机台',
						dataIndex : 'batchno',
						renderer : function(val) {
							return (val ? ('<b>' + val + '</b>') : '<b><font color=blue>未安排</font></b>');
						}
					}, {
						text : '加工工艺',
						dataIndex : 'craftname',
						width : 150,
						renderer : function(val, meta, record) {
							return (val ? ('<b>' + val + '(' + record.data.craftcode + ')</b>') : val);
						}
					}, {
						text : '操作人员',
						dataIndex : 'empname',
						align : 'center',
						width : 80,
						renderer : me.renderBoldFont
					}, {
						text : '操作时间',
						dataIndex : 'actiontime',
						width : 200,
						renderer : function(val, meta, record) {
							var _statename = record.get('statename');
							return ((_statename && val) ? '<b>' + val + '</b>' : '');
						}
					} ],
					tbar : [ {
						id : 'mpf-txt-module-info',
						xtype : 'textfield',
						fieldLabel : '当前模号',
						labelWidth : 65,
						width : 200,
						readOnly : true
					}, '-', {
						text : '停工&复工',
						iconCls : 'cog_edit-16',
						handler : me.alertModuleState
					}, '-', {
						text : '加工完成',
						iconCls : 'clock-16',
						handler : me.processFinish
					}, '-', {
						text : '核准完工',
						iconCls : 'accept-16',
						handler : me.proceedModuleFinish
					}, '-', {
						text : '零件完工',
						iconCls : 'tick-16',
						handler : me.processPartFinish
					}, '->', {
						id : 'mpf-show-standard',
						xtype : 'checkbox',
						boxLabel : '<b>显示标准件</b>',
						checked : true,
						listeners : {
							change : function(checkbox, newVal, oldVal) {
								var t_resumeid = Ext.getCmp('mpf-grid-part-info').resumeid;
								Ext.getStore('mpf-store-part-info').reload({
									params : {
										resumeid : t_resumeid,
										chk : newVal
									}
								});
							}
						}
					} ]
				} ];

		me.callParent(arguments);
	},
	processFinish : function() {
		var rsmid = this.up('gridpanel').resumeid;
		if (!rsmid) {
			showError('未选中任何待完工的模具工号!');
			return;
		}

		Ext.Msg.confirm('确认', '是否设置为加工完成?', function(y) {
			if (y == 'yes') {
				Ext.Ajax.request({
					url : 'module/manage/processModuleHandle',
					method : 'POST',
					params : {
						resumeid : "'" + rsmid + "'"
					},
					success : function(resp) {
						var back = Ext.JSON.decode(resp.responseText);
						if (back.success) {
							// 将工件表清空
							Ext.getStore('mpf-store-part-info').reload();
							showInfo('状态更新成功!');
							return;
						} else {
							showError(back.msg);
							return;
						}
					},
					failure : function(x, y, z) {
						showError('连接服务器失败,请检查网络连接!');
						return;
					}
				});
			}
		});
	},
	/**
	 * 新模或修模/设变
	 */
	onResumeModule : function(ctrl, nw) {
		var item = this;
		var chk = Ext.getCmp('mpf-chk-by-guest').getValue();
		item.up('gridpanel').getStore().load({
			url : 'public/getModuleResumeInfoByCase',
			params : {
				chk : chk,
				query : (item.isTxt ? nw : null),
				states : item.states
			}
		});
	},
	getModuleInformation : function(grid, record) {
		// 如果履歷號為空,則返回資料訊息不完整
		var t_resumeid = record.get('id');
		if (!t_resumeid) {
			showError('该模具讯息资料不完整!');
			return;
		}

		// 設置工件清单表格的模具履歷緩存
		Ext.getCmp('mpf-grid-part-info').resumeid = t_resumeid;
		var showStandard = Ext.getCmp('mpf-show-standard').getValue();

		Ext.getCmp('mpf-txt-module-info').setValue(record.get('modulecode'));
		Ext.getStore('mpf-store-part-info').load({
			url : 'module/manage/getFinishModulePartInfo',
			params : {
				resumeid : t_resumeid,
				chk : showStandard
			}
		});
	},
	renderBoldFont : function(val) {
		return (val ? ('<b>' + val + '</b>') : val);
	},
	processPartFinish : function() {
		var grid = this.up('gridpanel');
		var selRows = grid.getSelectionModel().getSelection();
		if (!selRows.length) {
			showError('没有选择任何有效行!');
			return;
		}

		Ext.Msg.confirm('提示', '是否确定零件加工完成?', function(y) {
			if (y == 'yes') {
				var selId = [];

				for ( var x in selRows) {
					selId.push(selRows[x].get('mid'));
				}

				Ext.Ajax.request({
					url : 'module/manage/processPartFinish',
					method : 'POST',
					params : {
						ids : Ext.JSON.encode(selId)
					},
					success : function(resp) {
						var backJson = Ext.JSON.decode(resp.responseText);
						if (!backJson.success) {
							showError('保存讯息失败!');
							return;
						}

						grid.getStore().reload();
					},
					failure : function(x, y, z) {
						showError('连接网络失败,请检查网络连接!');
					}
				});
			}
		});
	},
	proceedModuleFinish : function() {
		var rsmid = this.up('gridpanel').resumeid;
		if (!rsmid) {
			showError('未选中任何待完工的模具工号!');
			return;
		}

		Ext.Msg.confirm('确认', '是否决定将该模具完工?', function(y) {
			if (y == 'yes') {
				Ext.Ajax.request({
					url : 'module/manage/proceedModuleFinish',
					method : 'POST',
					params : {
						resumeid : rsmid
					},
					success : function(resp) {
						var back = Ext.JSON.decode(resp.responseText);
						if (back.success) {
							// 将工件表清空
							Ext.getStore('mpf-store-part-info').reload();
							showInfo('状态更新成功!');
							return;
						} else {
							showError(back.msg);
							return;
						}
					},
					failure : function(x, y, z) {
						showError('连接服务器失败,请检查网络连接!');
						return;
					}
				});
			}
		});
	},
	alertModuleState : function() {
		var rsmid = this.up('gridpanel').resumeid;
		if (!rsmid) {
			showError('未选中任何模具工号!');
			return;
		}

		Ext.Msg.confirm('确认', '是否将停工或者复工模具?', function(y) {
			if (y == 'yes') {
				Ext.Ajax.request({
					url : 'module/manage/alertControlModuleState',
					method : 'POST',
					params : {
						resumeid : "'" + rsmid + "'"
					},
					success : function(resp) {
						var back = Ext.JSON.decode(resp.responseText);
						if (back.success) {
							// 将工件表清空
							Ext.getStore('mpf-store-part-info').removeAll();
							// 将当前模具讯息清空
							Ext.getCmp('mpf-txt-module-info').setValue(Ext.emptyString);
							// 将该模具工号从模具栏删除
							var moduleStore = Ext.getStore('mpf-store-module-info');
							var selRowIndex = moduleStore.findExact('id', rsmid);
							if (selRowIndex > -1) {
								moduleStore.removeAt(selRowIndex);
							}

							showInfo(back.msg);
						} else {
							showError(back.msg);
						}
					},
					failure : function(x, y, z) {
						showError('连接服务器失败,请检查网络连接!');
						return;
					}
				});
			}
		});
	}
});