/**
 * 新模加工排程
 * 
 */
Ext.define('Module.ModuleInitialSchedule', {
	extend : 'Ext.panel.Panel',
	// 使用BORDER布局
	layout : 'border',
	title : '新模',
	xtype : 'dd-grid-to-grid',
	bodyPadding : 5,
	defaults : {
		padding : 2
	},
	craftStore : new Ext.data.Store({
		fields : [ 'craftid', 'craftname' ],
		proxy : {
			type : 'ajax',
			url : 'public/getSchedualCrafts',
			reader : {
				type : 'json',
				root : 'craft'
			}
		},
		autoLoad : true
	}),
	initComponent : function() {
		var me = this;
		Ext.apply(me, {
			tbar : [ {

			} ],

			items : [ {
				xtype : 'panel',
				region : 'west',
				layout : 'border',
				defaults : {
					padding : 2
				},
				flex : 1,
				items : [ {
					id : 'mis-query-partcode',
					xtype : 'grid',
					region : 'north',
					flex : 1,
					title : '',
					forceFit : true,
					rowLines : true,
					columnLines : true,
					multiSelect : true,
					selModel : {
						mode : 'SIMPLE',
						toggleOnClick : false
					},
					selType : 'checkboxmodel',
					store : new Ext.data.Store({
						fields : [ 'partbarlistcode', 'partlistcode', 'cnames', 'chinaname' ],
						data : [],
						autoLoad : true
					}),
					tbar : [ {
						xtype : 'combobox',
						emptyText : '请输入模具工号',
						labelWidth : 60,
						width : 150,
						queryMode : 'local',
						displayField : 'modulecode',
						valueField : 'modulebarcode',
						triggerAction : 'all',
						store : new Ext.data.Store({
							fields : [ 'modulebarcode', 'modulecode' ],
							data : []
						}),
						listeners : {
							/**
							 * 根据输入的数据来加载匹配的模具工号
							 * 
							 * @param combo
							 * @param ori
							 */
							change : function(combo, ori) {
								Ext.Ajax.request({
									url : 'module/manage/getModuleRelyOn',
									method : 'POST',
									params : {
										para : ori
									},
									success : function(resp) {
										combo.getStore().removeAll();
										combo.getStore().add(Ext.JSON.decode(resp.responseText));
									},
									failure : function() {
										combo.getStore().removeAll();
										return;
									}
								});
							},
							/**
							 * 将选中的某个模具的有效工件全部加载出来
							 * 
							 * @param combo
							 */
							select : function(combo) {
								Ext.Ajax.request({
									url : 'module/manage/getPartsForSchedule',
									method : 'POST',
									params : {
										para : combo.getValue()
									},
									success : function(resp) {
										// 获取零件查询栏的STORE
										var store = Ext.getCmp('mis-query-partcode').getStore();
										var mergeStore = Ext.getCmp('mis-part-merge').getStore();
										// 解析AJAX回传的JSON数据
										var json = Ext.JSON.decode(resp.responseText);
										// 将旧数据资料清空
										store.removeAll();
										if (json.length > 0) {
											Ext.Array.each(json, function(item) {
												var mergeCount = mergeStore.getCount();
												if (mergeCount) {
													var inMerge = false;
													for ( var x = 0; x < mergeCount; x++) {
														if (mergeStore.getAt(x).get('partbarlistcode') == item.partbarlistcode) {
															inMerge = true;
															break;
														}
													}
													if (!inMerge) {
														store.add(item);
													}
												} else {
													store.add(item);
												}
											});
										}
									},
									failure : function() {
										Ext.getCmp('mis-query-partcode').getStore().removeAll();
										return;
									}
								});
							}
						}
					} ],
					columns : [ {
						dataIndex : 'partlistcode',
						text : '工件编号'
					}, {
						dataIndex : 'chinaname',
						text : '工件类型'
					}, {
						dataIndex : 'cnames',
						text : '工件名称'
					} ]
				}, {
					id : 'mis-part-merge',
					xtype : 'grid',
					region : 'center',
					flex : 1,
					title : '工件排程',
					forceFit : true,
					rowLines : true,
					columnLines : true,
					multiSelect : true,
					selModel : {
						mode : 'SIMPLE',
						toggleOnClick : false
					},
					selType : 'checkboxmodel',
					store : new Ext.data.Store({
						fields : [ 'partbarlistcode', 'partlistcode', 'cnames', 'chinaname' ],
						data : [],
						autoLoad : true
					}),
					tbar : [ {
						text : '添加排程工件',
						iconCls : 'down-16',
						handler : function() {
							// 获取勾选的模具工件
							var sel = Ext.getCmp('mis-query-partcode');
							// 如果选择的模具工件数量大于0,则添加工件至合并工件栏中并将查询栏中的工件删除掉
							if (sel.getStore().getCount()) {
								Ext.getCmp('mis-part-merge').getStore().add(sel.getSelectionModel().getSelection());
								sel.getStore().remove(sel.getSelectionModel().getSelection());
							}
						}
					}, '-', {
						text : '取消排程工件',
						iconCls : 'gtk-delete-16',
						handler : function() {
							var sel = Ext.getCmp('mis-part-merge').getSelectionModel().getSelection();
							if (sel && sel.length > 0) {
								Ext.getCmp('mis-part-merge').getStore().remove(sel);
							}
						}
					} ],
					columns : [ {
						dataIndex : 'partlistcode',
						text : '工件编号'
					}, {
						dataIndex : 'chinaname',
						text : '工件类型'
					}, {
						dataIndex : 'cnames',
						text : '工件名称'
					} ]
				} ]
			}, {
				xtype : 'gridpanel',
				title : '排程安排',
				id : 'mis-schedule-setting',
				region : 'center',
				flex : 3,
				forceFit : true,
				rowLines : true,
				store : new Ext.data.Store({
					fields : [ 'craftid', 'craftname', 'starttime', 'endtime', 'usetime', 'useinfo' ],
					data : [],
					autoLoad : true
				}),
				selType : 'checkboxmodel',
				plugins : [ new Ext.grid.plugin.CellEditing({
					clicksToEdit : 1
				}) ],
				tbar : [ {
					text : '新增工件排程',
					iconCls : 'add-16',
					handler : function() {
						this.up('toolbar').up('gridpanel').getStore().add({
							craftid : '',
							craftname : '',
							starttime : Ext.util.Format.date(new Date(), 'Y-m-d H:i'),
							endtime : Ext.util.Format.date(new Date(), 'Y-m-d H:i'),
							usetime : '0',
							info : '0分'
						});
					}
				}, '-', {
					text : '删除工件排程',
					iconCls : 'gtk-remove-16',
					handler : function() {
						var grid = this.up('toolbar').up('gridpanel');
						var sels = grid.getSelectionModel().getSelection();
						if (sels.length > 0) {
							Ext.Msg.confirm('提醒', '确定要删除所选排程?', function(btn) {
								if (btn == 'yes') {
									grid.getStore().remove(sels);
								}
							});
						} else {
							Fly.msg('<font color = red>Error</color>', '未选中任何有效的行!');
						}
					}
				}, '-', {
					text : '保存工件排程',
					iconCls : 'gtk-save-16',
					handler : function() {
						var mergeStore = Ext.getCmp('mis-part-merge').getStore();
						var schStore = Ext.getCmp('mis-schedule-setting').getStore();
						var result = me.getValPartSchedule(mergeStore, schStore);
						if (result.rs == -1) {
							Fly.msg('<font color = red>Tip</color>', '排程工件或者排程工艺不能为空!');
						} else if (result.rs == -2) {
							Fly.msg('<font color = red>Error</color>', '排程工艺不能为空!');
						} else if (result.rs == -3) {
							Fly.msg('<font color = red>Error</color>', '排程的时间不能小于0!');
						} else if (result.rs == -4) {
							Fly.msg('<font color = red>Error</color>', '工件的各个排程工艺时间不能重叠!');
						} else {
							Ext.Msg.confirm('提醒', '是否确定保存工件排程?', function(btn) {
								if (btn == 'yes') {
									Ext.Ajax.request({
										url : 'module/manage/setModuleEstimateSchedule',
										params : {
											part : Ext.JSON.encode(result.plist),
											sch : Ext.JSON.encode(result.slist)
										},
										method : 'POST',
										success : function(resp) {
											var backRs = Ext.JSON.decode(resp.responseText);
											if (backRs.result) {
												mergeStore.removeAll();
												schStore.removeAll();
											} else {
												if (backRs.flag == -1) {
													Fly.msg('<font color = red>INFO</color>', '工件排程资料不能为空!');
												} else if (backRs.flag == -2) {
													Fly.msg('<font color = red>INFO</color>', '工件排程资料解析出现问题!');
												} else if (backRs.flag == -3) {
													Fly.msg('<font color = red>INFO</color>', '工件资料讯息有错误!');
												} else if (backRs.flag == -4) {
													Fly.msg('<font color = red>INFO</color>', '新增的工件排程与已安排排程时间出现重叠!');
												} else if (backRs.flag == -5) {
													Fly.msg('<font color = red>INFO</color>', '排程资料保存失败!');
												} else {
													Fly.msg('<font color = red>INFO</color>', '工件排程讯息保存时出现无法预知错误!');
												}
											}
										},
										failure : function() {
											Fly.msg('<font color = red>Error</color>', '连接服务器失败!');
										}
									});
								}
							});
						}
					}
				} ],
				columnLines : true,
				columns : [ {
					dataIndex : 'craftname',
					text : '工艺类型',
					renderer : function(val, meta, record, rowindex, colindex, store, view) {
						var model = me.craftStore.findRecord('craftid', val);
						if (model) {
							record.set('craftid', val);
							return model.get('craftname');
						} else {
							return val;
						}
					},
					field : {
						xtype : 'combobox',
						displayField : 'craftname',
						valueField : 'craftid',
						editable : false,
						store : me.craftStore
					}
				}, {
					xtype : 'datecolumn',
					text : '开始时间',
					dataIndex : 'starttime',
					format : 'Y-m-d H:i',
					field : {
						xtype : 'datefield',
						format : 'Y-m-d H:i'
					}
				}, {
					xtype : 'datecolumn',
					text : '结束时间',
					format : 'Y-m-d H:i',
					dataIndex : 'endtime',
					field : {
						xtype : 'datefield',
						format : 'Y-m-d H:i'
					}
				}, {
					dataIndex : 'useinfo',
					text : '工艺用时',
					renderer : function(val, meta, record) {
						var json = me.getTimeFieldDistance(record.get('starttime'), record.get('endtime'));
						record.set('usetime', json.time);
						return json.info;
					}
				} ]
			} ]
		})
		me.callParent(arguments);
	},
	/**
	 * 获取两个时间段的有效时间段(格式:D天H时M分)
	 * 
	 * @param start
	 *            开始时间
	 * @param end
	 *            结束时间
	 * @returns {String}
	 */
	getTimeFieldDistance : function(start, end) {
		if (start && end) {
			var startTime = new Date(start);
			var endTime = new Date(end);
			var timeSec = parseInt((endTime - startTime) / 1000 / 60);

			var minTime = parseInt(timeSec % 60);
			var minRs = parseInt(timeSec / 60);

			if (!minRs) {
				return {
					time : timeSec,
					info : minTime + '分'
				};
			}

			var hourTime = parseInt(minRs % 24);
			var hourRs = parseInt(minRs / 24);

			if (!hourRs) {
				return {
					time : timeSec,
					info : hourTime + '时' + minTime + '分'
				};
			}

			return {
				time : timeSec,
				info : hourRs + '天' + hourTime + '时' + minTime + '分'
			};

		} else {
			return {
				time : 0,
				info : '0分'
			};
		}
	},
	getValPartSchedule : function(part, schedule) {
		if (part.getCount() && schedule.getCount()) {
			// 对工件的工艺制程按开始时间进行排序
			schedule.sort('starttime', 'ASC');
			var json = [], plist = [];
			for ( var m = 0; m < part.getCount(); m++) {
				plist.push({
					partcode : part.getAt(m).get('partbarlistcode')
				});
			}
			for ( var x = 0; x < schedule.getCount(); x++) {
				// 如果工件未安排工艺排程,则提示错误
				if (!schedule.getAt(x).get('craftid')) {
					return {
						rs : -2,
						list : []
					};
				}

				// 如果工艺所需时间为0或者为负,则本工件工艺安排失误
				if (schedule.getAt(x).get('usetime') <= 0) {
					return {
						rs : -3,
						list : []
					};
				}

				// 如果上一个工艺的结束时间大于当前工艺的开始时间,则排程出现问题
				if (x != 0) {
					var foreEnd = new Date(schedule.getAt(x - 1).get('endtime'));
					var backStart = new Date(schedule.getAt(x).get('starttime'));
					if (foreEnd > backStart) {
						return {
							rs : -4,
							list : []
						};
					}
				}
				// 生成工件工艺制程的JSON
				json.push({
					starttime : Ext.util.Format.date(schedule.getAt(x).get('starttime'), 'Y-m-d H:i'),
					endtime : Ext.util.Format.date(schedule.getAt(x).get('endtime'), 'Y-m-d H:i'),
					craftid : schedule.getAt(x).get('craftid'),
					ismerge : (part.getCount() > 1 ? 1 : 0)
				});
			}

			return {
				rs : 1,
				slist : json,
				plist : plist
			};
		} else {
			return {
				rs : -1,
				list : []
			};
		}
	}
});