Ext.define('Module.EditPartOutBound', {
	extend : 'Ext.window.Window',
	height : 573,
	width : 537,
	layout : {
		type : 'border'
	},
	title : '工件外发',
	modal : true,
	appendInfo : null,
	initComponent : function() {
		var me = this;

		Ext.applyIf(me, {
			items : [ {
				xtype : 'form',
				region : 'center',
				border : false,
				layout : {
					type : 'border'
				},
				bodyPadding : 10,
				items : [
						{
							xtype : 'fieldset',
							region : 'north',
							height : 240,
							title : '外发讯息',
							items : [
									{
										id : 'part-outbound-factory-select',
										xtype : 'combobox',
										anchor : '100%',
										fieldLabel : '外发厂商',
										editable : false,
										displayField : 'factorycode',
										valueField : 'fatid',
										regex : /^[a-zA-Z0-9]{1,8}$/,
										value : me.appendInfo.guestid,
										listConfig : {
											loadingText : 'Searching...',
											getInnerTpl : function() {
												return '<span style = \'color:red\'>{factorycode}</span>|<span>{shortname}</span>';
											}
										},
										store : Ext.create('Ext.data.Store', {
											autoLoad : true,
											fields : [ 'factorycode', 'barid', 'fatid', 'shortname', 'contactor', 'phonenumber', 'address' ],
											proxy : {
												type : 'ajax',
												url : 'module/manage/getDeviceFacotry?type=3',
												reader : {
													type : 'json',
													root : 'devices'
												}
											}
										})
									},
									{
										id : 'part-outbound-craft-select',
										xtype : 'combobox',
										anchor : '100%',
										fieldLabel : '外发工艺',
										editable : false,
										multiSelect : true,
										value : me.appendInfo.craftid,
										displayField : 'craftname',
										valueField : 'craftbarid',
										store : new Ext.data.Store({
											proxy : {
												type : 'ajax',
												url : 'public/getSchedualCrafts',
												reader : {
													type : 'json',
													root : 'craft'
												}
											},
											fields : [ 'craftbarid', 'craftid', 'craftname', 'craftcode', 'mergename' ],
											autoLoad : true
										}),
										listConfig : {
											getInnerTpl : function() {
												return '<a class="search-item"><span style = \'font-weight:bold\'>{craftname}</span>'
														+ '[<span style = \'color:red;font-weight:bold\'>{craftcode}</span>]</a>';
											}
										}
									}, {
										id : 'part-outbound-outtime',
										xtype : 'datefield',
										fieldLabel : '外发时间',
										value : me.appendInfo.outtime,
										format : 'Y-m-d',
										anchor : '100%',
										editable : false
									}, {
										id : 'part-outbound-backtime',
										xtype : 'datefield',
										value : me.appendInfo.backtime,
										fieldLabel : '回厂时间',
										anchor : '100%',
										format : 'Y-m-d',
										editable : false
									}, {
										id : 'part-outbound-intro',
										xtype : 'textareafield',
										anchor : '100%',
										fieldLabel : '外发说明',
										value : me.appendInfo.intro
									} ]
						}, {
							xtype : 'gridpanel',
							region : 'center',
							title : '工件栏',
							plugins : [ Ext.create('Ext.grid.plugin.RowEditing', {
								clicksToMoveEditor : 1
							}) ],
							store : Ext.create('Ext.data.Store', {
								id : 'part-outbound-information',
								fields : [ 'partbarlistcode', 'partlistcode', 'modulebarcode', 'modulecode', 'resumeid', 'fee' ],
								autoLoad : true,
								data : me.appendInfo.operateInfo
							}),
							columns : [ {
								xtype : 'gridcolumn',
								dataIndex : 'modulecode',
								width : 150,
								text : '模具工号'
							}, {
								xtype : 'gridcolumn',
								dataIndex : 'partlistcode',
								text : '工件编号',
								width : 130
							}, {
								xtype : 'numbercolumn',
								dataIndex : 'fee',
								text : '加工费用',
								format : '0',
								field : {
									xtype : 'numberfield',
									allowDecimals : false,
									minValue : 0
								}
							}, {
								width : 60,
								text : '操作',
								xtype : 'actioncolumn',
								items : [ {
									iconCls : 'gtk-delete-16',
									tooltip : '删除',
									handler : function(grid, rowIndex, colIndex) {
										grid.getStore().removeAt(rowIndex);
									}
								} ]
							} ]
						} ]
			} ],
			bbar : [ '->', {
				text : '保存讯息',
				iconCls : 'disk-16',
				handler : me.getOutBoundPartInfo
			}, '-', {
				text : '关闭窗口',
				iconCls : 'cross-16',
				handler : function() {
					this.up('window').close();
				}
			} ]
		});

		me.callParent(arguments);
	},
	getOutBoundPartInfo : function() {
		// 选择客户
		var guestCtrl = Ext.getCmp('part-outbound-factory-select');
		// 选择工艺
		var craftCtrl = Ext.getCmp('part-outbound-craft-select');
		// 外发时间
		var outTimeCtrl = Ext.getCmp('part-outbound-outtime');
		// 回厂时间
		var backTimeCtrl = Ext.getCmp('part-outbound-backtime');
		// 获取客户Record和工艺Record
		var guestSel = this.up('window').getComboboxRecord(guestCtrl.getStore(), 'fatid', guestCtrl.getValue());
		if (!guestSel) {
			showError('请选择外发工艺厂商!');
			return;
		}

		var craftid = craftCtrl.getValue();
		var craftname = craftCtrl.getRawValue();
		var craftcode = this.up('window').getMultiComboArray(craftCtrl.getStore(), 'craftbarid', 'craftcode', craftCtrl.getValue());
		// 如果工艺为空,提示选择工艺
		if (!craftid.length) {
			showError('请选择外发工艺!');
			return;
		}

		var outtime = outTimeCtrl.getValue();
		var backtime = backTimeCtrl.getValue();

		if (!outtime) {
			showError('预计外发时间不能为空!');
			return;
		}

		if (!backtime) {
			showError('预计回厂时间不能为空!');
			return;
		}

		if (outtime > backtime) {
			showError('回厂时间不能小于外发时间!');
			return;
		}

		var partintro = Ext.getCmp('part-outbound-intro').getValue();
		if (partintro.length > 80) {
			showError('外发说明不能超过80个字!');
			return;
		}

		var partinfo = Ext.getStore('part-outbound-information').getRange();
		var listinfo = [];
		for ( var x in partinfo) {
			listinfo.push({
				partbarlistcode : partinfo[x].get('partbarlistcode'),
				partlistcode : partinfo[x].get('partlistcode'),
				modulebarcode : partinfo[x].get('modulebarcode'),
				modulecode : partinfo[x].get('modulecode'),
				resumeid : partinfo[x].get('resumeid'),
				fee : partinfo[x].get('fee'),
				factorycode : guestSel.get('factorycode'),
				factoryid : guestSel.get('fatid'),
				factoryname : guestSel.get('shortname'),
				address : guestSel.get('address'),
				contactor : guestSel.get('contactor'),
				outphone : guestSel.get('phonenumber'),
				applycomment : partintro,
				craftid : craftid,
				craftcode : craftcode,
				craftname : craftname,
				planouttime : outtime,
				planbacktime : backtime,
				intro : partintro
			});
		}

		var pstore = Ext.getStore('part-outbound-apply-grid-store');
		for ( var m in listinfo) {
			var tempRecord = pstore.findRecord('partbarlistcode', listinfo[m].partbarlistcode);
			if (!tempRecord) {
				pstore.add(listinfo[m]);
			} else {
				tempRecord.set(listinfo[m]);
			}
		}

		this.up('window').close();
	},
	getComboboxRecord : function(store, col, val) {
		return store.findRecord(col, val);
	},
	getMultiComboArray : function(store, base, col, arr) {
		if (arr == null) {
			return [];
		}

		var arrayInfo = [];
		for ( var x in arr) {
			arrayInfo.push(store.findRecord(base, arr[x]).get(col));
		}

		return arrayInfo;
	}

});
Ext.define('Module.PartOutApply', {
	extend : 'Ext.panel.Panel',
	title : '外发申请',
	layout : 'border',
	moduleSel : '',
	// onResumeModule : function() {
	// var item = this;
	// item.up('treepanel').getStore().load({
	// url : 'public/moduleForResume',
	// params : {
	// isNew : item.isNew
	// }
	// });
	// },
	initComponent : function() {
		var me = this;
		Ext.applyIf(me, {
			items : [
					{
						xtype : 'panel',
						region : 'west',
						layout : 'border',
						title : '模具栏',
						collapsible : true,
						split : true,
						width : 305,
						items : [
								{
									xtype : 'gridpanel',
									id : 'part-outbound-apply-module-query',
									border : false,
									region : 'north',
									rootVisible : false,
									forceFit : true,
									height : 300,
									listeners : {
										itemclick : function(grid, record) {
											me.moduleSel = record;
											me.queryPartByModuleId(grid, record);
										}
									},
									tbar : [ {
										id : 'poa-chk-by-guest',
										xtype : 'checkbox',
										boxLabel : '依番号'
									}, ''
									// ,
									// Ext.create('Module.ModuleFindTextField',
									// {
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
									columns : [ {
										xtype : 'gridcolumn',
										dataIndex : 'modulecode',
										text : '模具工号',
										renderer : function(val, meta, record) {
											var _resumename = record.get('resumename');
											var _guestcode = record.get('guestcode');
											return '<b>' + val + (_guestcode ? ('/<font color = blue>' + _guestcode + '</font>') : '')
													+ "<font color = red>[" + (!_resumename ? '完成' : _resumename) + ']</font></b>';
										}
									} ],
									store : Ext.create('Ext.data.Store', {
										autoLoad : true,
										fields : [ "endtime", "starttime", "modulebarcode", 'modulecode', "guestcode", "resumename", "resumestate",
												"text", "id" ],
										proxy : {
											url : '',
											type : 'ajax',
											reader : {
												type : 'json',
												root : 'children'
											}
										}
									})
								},
								{
									title : '工件栏',
									xtype : 'treepanel',
									region : 'center',
									rootVisible : false,
									border : false,
									tbar : [ {
										text : '批量外发',
										iconCls : 'application_cascade-16',
										handler : function() {
											var nodeList = this.up('treepanel').getStore().getRootNode().childNodes;
											var partinfo = [];
											for ( var x in nodeList) {
												// 找出节点的勾选状态
												var ischecked = nodeList[x].data.checked;
												if (ischecked) {
													for ( var y in nodeList[x].childNodes) {
														var element = nodeList[x].childNodes[y];

														partinfo.push({
															partbarlistcode : element.data.partbarlistcode,
															partlistcode : element.data.text,
															resumeid : me.moduleSel.data.id,
															modulebarcode : me.moduleSel.data.modulebarcode,
															modulecode : me.moduleSel.data.text,
															fee : 0
														});
													}
												}
											}

											if (partinfo.length) {
												new Module.EditPartOutBound({
													appendInfo : {
														operateInfo : partinfo,
														craftid : null,
														guestid : null,
														intro : null
													}
												}).show();

												me.queryPartByModuleId(null, me.moduleSel);
											}
										}
									} ],
									listeners : {
										itemdblclick : function(tree, record, item, index, e, eOpts) {
											var partinfo = [];
											if (record.data.leaf) {
												partinfo.push({
													partbarlistcode : record.data.partbarlistcode,
													partlistcode : record.data.text,
													resumeid : me.moduleSel.data.id,
													modulebarcode : me.moduleSel.data.id,
													modulecode : me.moduleSel.data.text,
													fee : 0
												});
											} else {
												for ( var x in record.data.children) {
													var dataNode = record.data.children[x];
													partinfo.push({
														partbarlistcode : dataNode.partbarlistcode,
														partlistcode : dataNode.text,
														resumeid : me.moduleSel.data.id,
														modulebarcode : me.moduleSel.data.id,
														modulecode : me.moduleSel.data.text,
														fee : 0
													});
												}
											}

											if (partinfo.length) {
												new Module.EditPartOutBound({
													appendInfo : {
														operateInfo : partinfo,
														craftid : null,
														guestid : null,
														intro : null
													}
												}).show();
												me.queryPartByModuleId(null, me.moduleSel);
											}
										}
									},
									store : Ext.create('Ext.data.TreeStore', {
										id : 'part-outbound-apply-part-query',
										fields : [ "moduleResumeId", "partBarCode", "name", "moduleresumeid", "partbarlistcode", "partbarcode",
												"partcode", "text", "cnames" ],
										autoLoad : true,
										proxy : {
											type : 'ajax',
											url : '',
											reader : {
												type : 'json',
												root : 'children'
											}
										}
									})
								} ]
					},
					{
						id : 'part-outbound-apply-grid-list',
						xtype : 'gridpanel',
						title : '外发工件栏',
						iconCls : 'brick_go-16',
						region : 'center',
						store : Ext.create('Ext.data.Store', {
							id : 'part-outbound-apply-grid-store',
							fields : [ 'partbarlistcode', 'partlistcode', 'modulebarcode', 'modulecode', 'resumeid', 'factorycode', 'factoryid',
									'factoryname', 'address', 'contactor', 'outphone', 'applycomment', 'craftid', 'craftcode', 'craftname', 'fee',
									'planouttime', 'planbacktime', 'intro' ],
							autoLoad : true
						}),
						listeners : {
							itemdblclick : function(grid, record, item, index, e, eOpts) {

								new Module.EditPartOutBound({
									appendInfo : {
										operateInfo : record.getData(),
										craftid : record.get('craftid'),
										guestid : record.get('factoryid'),
										outtime : record.get('planouttime'),
										backtime : record.get('planbacktime'),
										intro : record.get('intro')
									}
								}).show();
							}
						},
						tbar : [ '->', {
							text : '导出报告',
							iconCls : 'script_go-16',
							handler : function() {
								var rows = Ext.getStore('part-outbound-apply-grid-store').getRange();
								if (!rows.length) {
									showError('没有可以导出的零件清单');
									return;
								}

								var dataR = [];
								for ( var x in rows) {
									dataR.push({
										partbarlistcode : rows[x].get('partbarlistcode'),
										planouttime : Ext.Date.format(rows[x].get('planouttime'), 'Y-m-d'),
										planbacktime : Ext.Date.format(rows[x].get('planbacktime'), 'Y-m-d'),
										craftname : rows[x].get('craftname')
									});
								}

								Ext.Msg.confirm('提示', '是否确定下载外发报告', function(y) {
									if (y == 'yes') {
										Ext.create('Ext.form.Panel', {
											standardSubmit : true,
										}).submit({
											url : 'public/exportPartInfo',
											params : {
												partlist : Ext.JSON.encode(dataR)
											},
											success : function(form, action) {
												showSuccess("下载成功!");
											},
											failure : function(form, action) {
												switch (action.failureType) {
												case Ext.form.action.Action.CLIENT_INVALID:
													showError("提交数据出现错误!");
													break;
												case Ext.form.action.Action.CONNECT_FAILURE:
													showError("下载出现错误!");
													break;
												case Ext.form.action.Action.SERVER_INVALID:
													showError("服务器错误!");
												}
											}
										});
									}
								});
							}
						}, '-', {
							text : '工件外发',
							iconCls : 'basket_remove-16',
							handler : me.saveOutBoundApply
						}, '-', {
							text : '取消所有',
							iconCls : 'edit-clear-16',
							handler : function() {
								var outPartStore = this.ownerCt.ownerCt.getStore();
								if (!outPartStore.getCount()) {
									return;
								}
								Ext.Msg.confirm('确认', '确定要取消所有外发工件?', function(r) {
									if (r == 'yes') {
										outPartStore.removeAll();
									}
								});
							}
						} ],
						columns : [ new Ext.grid.RowNumberer(), {
							text : '模具工号',
							dataIndex : 'modulecode',
							width : 300
						}, {
							text : '工件编号',
							dataIndex : 'partlistcode',
							width : 150
						}, {
							text : '外发厂商',
							dataIndex : 'factoryname',
							width : 150
						}, {
							width : 60,
							text : '操作',
							xtype : 'actioncolumn',
							items : [ {
								iconCls : 'gtk-delete-16',
								tooltip : '删除',
								handler : function(grid, rowIndex, colIndex) {
									grid.getStore().removeAt(rowIndex);
								}
							} ]
						} ]
					} ]
		});

		me.callParent(arguments);
	},
	/**
	 * 新模或修模/设变
	 */
	onResumeModule : function(ctrl, nw) {
		var item = this;
		var chk = Ext.getCmp('poa-chk-by-guest').getValue();
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
	 * 保存外发的工件资料
	 */
	saveOutBoundApply : function() {
		var _store = this.up('gridpanel').getStore();
		if (!_store.getCount()) {
			showError('没有任何要外发的工件记录!');
			return;
		}

		var _partdata = [];
		var _range = _store.getRange();
		for ( var x in _range) {
			_partdata.push(_range[x].getData());
		}
		// 外发
		Ext.Msg.confirm('提醒', '是否确认外发工件?', function(y) {
			if (y == 'yes') {
				Ext.Ajax.request({
					url : 'module/part/saveOutBoundApply',
					method : 'POST',
					params : {
						data : Ext.JSON.encode(_partdata),
						ostateid : '',
						fstateid : '20604',
						pstateid : '20205',
						timecol : 'OUTTIME',
						empcol : 'OUTMAN',
						isfinish : false,
						isresume : true,
						isdept : true
					},
					success : function(resp) {
						var backJson = Ext.JSON.decode(resp.responseText);
						if (backJson.success) {
							_store.removeAll();
							showInfo('外发工件完成!');
						} else {
							if (backJson.result == -1) {
								showInfo('没有任何有效的外发工件讯息!');
								return;
							} else if (backJson.result == -2) {
								showInfo(backJson.error + '工件正在加工中,请先通知现场停止加工!');
								return;
							} else if (backJson.result == -3) {
								showInfo('外发工件失败,请重试!');
								return;
							} else {
								showInfo('外发工件资料出现异常,请联系管理员!');
								return;
							}
						}
					},
					failure : function() {
						showError('请检查网络连接!');
						return;
					}
				});
			}
		});
	},
	queryModuleMatch : function(ctrl, nw, old, opts) {
		if (!nw || nw.length < 3) {
			return;
		}

		var moduleStore = Ext.getCmp('part-outbound-apply-module-query').getStore();
		moduleStore.load({
			url : 'public/module?isResume=true&condition=' + nw
		});
	},
	queryPartByModuleId : function(grid, record) {
		if (record) {
			var store = Ext.getStore('part-outbound-apply-part-query');
			store.load({
				url : 'public/moduleResumePart',
				params : {
					moduleResumeId : record.data.id
				}
			});
		}
	},
	selectFactory : function(combo, record, opts) {
		if (!record || record.length < 1) {
			return;
		}

		Ext.getCmp('part-outbound-apply-factroy-name').setValue(record[0].get('shortname'));
		Ext.getCmp('part-outbound-apply-contactor').setValue(record[0].get('contactor'));
		Ext.getCmp('part-outbound-apply-phone').setValue(record[0].get('phonenumber'));
		Ext.getCmp('part-outbound-apply-address').setValue(record[0].get('address'));
	},
	alertInfo : function(title, msg) {
		Ext.Msg.alert({
			title : title,
			msg : msg
		});
	},
	packageJsonArray : function(list) {
		// 如果列为空返回NULL
		if (!list || list.length == 0) {
			return (null);
		}

		var arr = [], builder = '[';
		// 遍历其中的所有列
		for ( var x in list) {
			arr.push(Ext.JSON.encode(list[x].data));
		}
		// 将JSON串合并
		builder += arr.join(',');
		builder += ']';

		return builder;
	}
});