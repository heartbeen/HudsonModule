Ext.define('Ext.AddMeasureTools', {
	extend : 'Ext.window.Window',
	title : '添加測量工具',
	layout : 'vbox',
	closeAction : 'hide',
	bodyPadding : 3,
	listeners : {
		show : function(win, opts) {
			Ext.getCmp('part-tolerance-toolcode').setValue(Ext.emptyString);
			Ext.getCmp('part-tolerance-toolname').setValue(Ext.emptyString);
		}
	},
	defaults : {
		padding : 3
	},
	items : [ {
		id : 'part-tolerance-toolname',
		xtype : 'textfield',
		fieldLabel : '工具名稱',
		labelWidth : 60
	}, {
		id : 'part-tolerance-toolcode',
		xtype : 'textfield',
		fieldLabel : '工具代號',
		labelWidth : 60
	} ],
	bbar : [ {
		text : '添加工具',
		iconCls : 'add-16',
		handler : function() {
			// 获取本按钮所在的Window窗体
			var self = this.findParentByType('window');

			var tlidCtrl = Ext.getCmp('part-tolerance-toolcode');
			var tlnameCtrl = Ext.getCmp('part-tolerance-toolname');

			if (Ext.isEmpty(tlidCtrl.getValue())) {
				Ext.Msg.alert('提醒', '工具代号不能为空!');
				return;
			}

			if (Ext.isEmpty(tlnameCtrl.getValue())) {
				Ext.Msg.alert('提醒', '工具名称不能为空!');
				return;
			}

			Ext.Ajax.request({
				url : 'module/quality/AddMeasureTools',
				params : {
					toolid : tlidCtrl.getValue(),
					toolname : tlnameCtrl.getValue()
				},
				method : 'POST',
				success : function(x) {
					var val = Ext.JSON.decode(x.responseText);
					if (val.result == -1) {
						Ext.Msg.alert('提醒', '工具代号不能为空!');
					} else if (val.result == -2) {
						Ext.Msg.alert('提醒', '工具代号必须为1-5个字符组成!');
					} else if (val.result == -3) {
						Ext.Msg.alert('提醒', '该工具代号已经存在了!');
					} else if (val.result == -4) {
						Ext.Msg.alert('提醒', '保存资料失败,请联系管理员!');
					} else {
						self.close();
					}
				},
				failure : function(x, y, z) {
					Ext.Msg.alert('提醒', '连接网络失败,请检查网络连接!');
					return;
				}
			});
		}
	} ]
});

Ext.define('Module.ToleranceMeasure',
		{
			extend : 'Ext.panel.Panel',
			layout : 'border',
			title : '通用测量',
			addToolWindow : new Ext.AddMeasureTools(),
			defaults : {
				padding : 3
			},
			moduleBarSel : null,
			partListBarSel : null,
			measureTemplate : [],
			graphPattern : /^(\w|[-]){1,6}$/,
			toolSel : new Ext.data.Store({
				fields : [ 'toolid', 'toolcode', 'toolname' ],
				autoLoad : true,
				proxy : {
					type : 'ajax',
					url : 'module/quality/getMeasureTools',
					reader : {
						type : 'json'
					}
				}
			}),
			gridfields : [ 'partbarlistcode', 'partbarcode', 'modulebarcode', 'mid', 'msize', 'maxtolar', 'mintolar', 'toolid', 'toolname', 'mdata',
					'remark' ],
			initComponent : function() {
				var me = this;
				me.items = [
						{
							xtype : 'panel',
							region : 'west',
							layout : 'border',
							title : '模具栏',
							collapsible : true,
							split : true,
							width : 300,
							items : [
									{
										xtype : 'treepanel',
										split : true,
										border : false,
										region : 'north',
										rootVisible : false,
										height : 300,
										listeners : {
											itemclick : function(grid, record) {
												me.moduleBarSel = {
													mid : record.data.id,
													name : record.data.text
												};
												me.queryPartByModuleId(grid, record);
											}
										},
										tbar : [ {
											xtype : 'textfield',
											emptyText : '请输入模具工号',
											listeners : {
												change : me.queryModuleMatch
											}
										} ],
										store : Ext.create('Ext.data.TreeStore', {
											id : 'part-tolerance-module-query',
											autoLoad : true,
											fields : [ 'id', 'leaf', 'text' ],
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
										store : Ext.create('Ext.data.TreeStore', {
											id : 'part-tolerance-part-sel',
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
										}),
										listeners : {
											itemclick : function(grid, record) {
												if (record.data.leaf) {
													me.partListBarSel = {
														rid : record.data.partbarlistcode,
														name : record.data.text
													};

													Ext.getCmp('part-tolerance-modulecode').setValue(me.moduleBarSel.name);
													Ext.getCmp('part-tolerance-partlistcode').setValue(me.partListBarSel.name);
												}
											}
										}
									} ]
						},
						{

							xtype : 'container',
							region : 'center',
							layout : 'border',
							defaults : {
								padding : 2
							},
							items : [
									{
										xtype : 'panel',
										region : 'north',
										split : true,
										layout : {
											type : 'table',
											columns : 2
										},
										bodyPadding : 5,
										defaults : {
											padding : '0 5'
										},
										tbar : [ {
											text : '清空资料',
											iconCls : 'gtk-clear-16'
										} ],
										items : [
												{
													id : 'part-tolerance-modulecode',
													xtype : 'textfield',
													fieldLabel : '模具工号',
													labelWidth : 60,
													readOnly : true
												},
												{
													id : 'part-tolerance-partlistcode',
													xtype : 'textfield',
													fieldLabel : '送测工件',
													labelWidth : 60,
													readOnly : true
												},
												{
													id : 'part-tolerance-graphno',
													xtype : 'textfield',
													fieldLabel : '图纸编号',
													labelWidth : 60
												},
												{
													id : 'part-tolerance-sentdept',
													xtype : 'combobox',
													fieldLabel : '送测部门',
													labelWidth : 60,
													displayField : 'name',
													valueField : 'posid',
													editable : false,
													store : new Ext.data.Store({
														fields : [ 'posid', 'name', 'stepid' ],
														proxy : {
															url : 'module/part/getRegionDepartOfMetal',
															type : 'ajax',
															reader : {
																type : 'json'
															}
														}
													}),
													listConfig : {
														getInnerTpl : function() {
															return '<a class="search-item"><span style = \'font-weight:bold\'>{name}</span></a>';
														}
													},
													listeners : {
														select : function(combo, record, opts) {
															// 获取送测人员COMBOBOX
															var empsel = Ext.getCmp('part-tolerance-send-empid');
															// 设置送测人员的Combobox值为空
															empsel.setValue(Ext.emptyString);

															empsel.getStore().load({
																url : 'module/quality/queryDepartmentStaff',
																params : {
																	posid : record[0].data.posid
																}
															});
														}
													}
												},
												{
													id : 'part-tolerance-send-empid',
													xtype : 'combobox',
													fieldLabel : '送测人员',
													displayField : 'ename',
													valueField : 'eid',
													labelWidth : 60,
													editable : false,
													store : new Ext.data.Store({
														fields : [ 'eid', 'ename' ],
														autoLoad : true,
														proxy : {
															url : '',
															type : 'ajax',
															reader : {
																type : 'json'
															}
														}
													}),
													listConfig : {
														getInnerTpl : function() {
															return '<a class="search-item"><span style = \'font-weight:bold\'>{ename}</span></a>';
														}
													}
												},
												{
													id : 'part-tolerance-craft',
													xtype : 'combobox',
													fieldLabel : '工艺名称',
													labelWidth : 60,
													editable : false,
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
													id : 'part-tolerance-makedate',
													xtype : 'datefield',
													fieldLabel : '制造日期',
													labelWidth : 60,
													editable : false,
													format : 'Y-m-d',
													value : new Date()
												} ]
									},
									{
										id : 'part-tolerance-point-list',
										xtype : 'gridpanel',
										region : 'center',
										rowLines : true,
										columnLines : true,
										selType : 'checkboxmodel',
										plugins : [ Ext.create('Ext.grid.plugin.CellEditing', {
											clicksToEdit : 1
										}) ],
										tbar : [ {
											text : '新增测量点',
											iconCls : 'add-16',
											handler : function() {
												Ext.getStore('part-tolerance-grid-info').add({
													rid : '',
													partbarlistcode : '',
													partbarcode : '',
													modulebarcode : '',
													mid : '',
													msize : '',
													maxtolar : '0',
													mintolar : '0',
													toolid : '',
													toolname : '',
													toolname : '',
													mdata : '',
													flag : false
												});
											}
										}, {
											text : '删除测量点',
											iconCls : 'gtk-delete-16',
											handler : function() {
												Ext.Msg.confirm('提醒', '是否确定删除测量讯息?', function(y) {
													if (y == 'yes') {
														me.deleteMeasurePoint(Ext.getCmp('part-tolerance-point-list'));
													}
												});
											}
										}, '-', {
											text : '添加測量具',
											iconCls : 'gtk-preferences-16',
											handler : function() {
												me.addToolWindow.show();
											}
										}, '-', {
											xtype : 'splitbutton',
											text : '模板管理',
											iconCls : 'gtk-edit-16',
											menu : new Ext.menu.Menu({
												items : [ {
													text : '复制模板',
													iconCls : 'gtk-copy-16',
													handler : function() {
														// 获取测量模板
														var store = Ext.getStore('part-tolerance-grid-info');
														me.measureTemplate = me.parseModelToList(store.getRange());
													}
												}, {
													text : '粘贴模板',
													iconCls : 'gtk-paste-16',
													handler : function() {
														if (me.measureTemplate.length) {
															Ext.getStore('part-tolerance-grid-info').add(me.measureTemplate);
														}
													}
												} ]
											})
										}, '-', {
											text : '保存测量',
											iconCls : 'gtk-save-16',
											handler : function() {
												// 读取基本参数
												if (!me.partListBarSel) {
													Ext.Msg.alert('提醒', '未选择要测量的部件号!');
													return;
												}

												var graphno = Ext.getCmp('part-tolerance-graphno').getValue();
												if (!me.graphPattern.test(graphno)) {
													Ext.Msg.alert('提醒', '图纸编号不符合要求!');
													return;
												}

												var deptid = Ext.getCmp('part-tolerance-sentdept').getValue();
												if (Ext.isEmpty(deptid)) {
													Ext.Msg.alert('提醒', '未选择送测部门!');
													return;
												}

												var sentemp = Ext.getCmp('part-tolerance-send-empid').getValue();
												if (Ext.isEmpty(sentemp)) {
													Ext.Msg.alert('提醒', '未选择送测人员!');
													return;
												}

												var craftid = Ext.getCmp('part-tolerance-craft').getValue();
												if (Ext.isEmpty(craftid)) {
													Ext.Msg.alert('提醒', '请选择加工工艺!');
													return;
												}
												var makedate = Ext.getCmp('part-tolerance-makedate').getValue();
												if (Ext.isEmpty(sentemp)) {
													Ext.Msg.alert('提醒', '请选择制造日期!');
													return;
												}

												var range = Ext.getStore('part-tolerance-grid-info').getRange();
												if (!range.length) {
													Ext.Msg.alert('提醒', '没有任何测量数据!');
													return;
												}

												// 判断待保存的资料行是否为空或者测量是否重复
												if (me.isElementDistinct(range, "mid")) {
													Ext.Msg.alert('提醒', '测量点编号不能重复并且不能为空!');
													return;
												}

												if (me.jsonElementEmpty(range, "msize")) {
													Ext.Msg.alert('提醒', '测量点中的标准尺寸必须填写!');
													return;
												}

												if (me.jsonElementEmpty(range, "toolid")) {
													Ext.Msg.alert('提醒', '测量尺寸必须选择测量工具!');
													return;
												}

												if (me.jsonElementEmpty(range, "mdata")) {
													Ext.Msg.alert('提醒', '测量点中的测量结果必须填写!');
													return;
												}

												Ext.Ajax.request({
													url : 'module/quality/saveMeasurePoints',
													params : {
														modulecode : me.moduleBarSel.mid,
														partcode : me.partListBarSel.rid,
														graphno : graphno,
														deptid : deptid,
														empid : sentemp,
														craftid : craftid,
														makedate : Ext.Date.format(makedate, 'Y-m-d'),
														mdata : Ext.JSON.encode(me.parseModelToList(range))
													},
													method : 'POST',
													success : function(x) {
														var rst = Ext.JSON.decode(x.responseText);
														if (!rst) {
															Ext.Msg.alert('提醒', '保存测量资料失败!');
															return;
														}

														Ext.getStore('part-tolerance-grid-info').removeAll();
													},
													failure : function(x, y, z) {
														Ext.Msg.alert('提醒', '连接服务器失败,请检查网络连接!');
														return;
													}
												});
											}
										} ],
										store : new Ext.data.Store({
											id : 'part-tolerance-grid-info',
											fields : me.gridfields,
											autoLoad : true,
											proxy : {
												type : 'ajax',
												url : '',
												reader : {
													type : 'json'
												}
											}
										}),
										columns : [
												{
													text : '測量編號',
													dataIndex : 'mid',
													field : {
														xtype : 'numberfield',
														decimalPrecision : 0,
														maxValue : 200,
														minValue : 0
													},
													width : 70,
													align : 'right'
												},
												{
													text : '測量標準',
													dataIndex : 'msize',
													field : {
														xtype : 'numberfield',
														decimalPrecision : 3,
														minValue : 0
													},
													width : 70,
													align : 'right'
												},
												{
													text : '<b>Tolerance +</b>',
													dataIndex : 'maxtolar',
													field : {
														xtype : 'numberfield',
														decimalPrecision : 3,
														minValue : 0
													},
													width : 80,
													align : 'right'
												},
												{
													text : '<b>Tolerance -</b>',
													dataIndex : 'mintolar',
													field : {
														xtype : 'numberfield',
														decimalPrecision : 3,
														minValue : 0
													},
													renderer : function(value, cellmeta, record, rowIndex, columnIndex, store) {
														var tstd = me.parseFloatVal(record.get('msize'));
														var tmin = me.parseFloatVal(value);
														if (tstd < tmin) {
															return tstd;
														}
														return value;
													},
													width : 80,
													align : 'right'
												},
												{
													text : '測量工具',
													dataIndex : 'toolname',
													renderer : function(value, cellmeta, record, rowIndex, columnIndex, store) {
														// 查找工具ID所对应的工具名称
														var rcd = me.toolSel.findRecord('toolid', value);
														// 将工具的值赋给TOOLID缓存
														record.data.toolid = value;
														// 如果查找的结果不为空,返回工具名称
														if (rcd) {
															return rcd.get('toolname');
														} else {
															return value;
														}
													},
													field : {
														xtype : 'combobox',
														editable : false,
														displayField : 'toolname',
														valueField : 'toolid',
														store : me.toolSel,
														listConfig : {
															getInnerTpl : function() {
																return '<a class="search-item"><span style = \'font-weight:bold\'>{toolname}</span>'
																		+ '[<span style = \'color:blue;font-weight:bold\'>{toolcode}</span>]</a>';
															}
														}
													}
												}, {
													text : '測量尺寸',
													dataIndex : 'mdata',
													renderer : function(value, cellmeta, record, rowIndex, columnIndex, store) {
														// 獲取測量點的標準值,最大公差,最小公差,實際值
														var tstd = me.parseFloatVal(record.get('msize'));
														var tmax = me.parseFloatVal(record.get('maxtolar'));
														var tmin = me.parseFloatVal(record.get('mintolar'));
														var tdata = me.parseFloatVal(value);

														// 設置測量點的合格尺寸範圍
														var lmin = me.numberPrecision(tstd - tmin, 2);
														var lmax = me.numberPrecision(tstd + tmax, 2);

														// 如果實際測量值不在測量合格範圍之內，渲染字體顏色為紅色
														if (tdata < lmin || tdata > lmax) {
															cellmeta.style = 'font-weight:bold;color:red';
														}

														return value;
													},
													field : {
														xtype : 'numberfield',
														decimalPrecision : 3,
														minValue : 0
													},
													width : 70,
													align : 'right'
												}, {
													text : '备注',
													dataIndex : 'remark',
													field : {
														xtype : 'textfield',
														maxlength : 60
													},
													width : 220
												} ],
										bbar : [ {
											xtype : 'label',
											html : '<b><font color = red>注释  OK:黑色 NG:紅色 特採:藍色</font></b>'
										} ]
									} ]
						} ];
				me.callParent(arguments);
			},
			queryModuleMatch : function(ctrl, nw, old, opts) {
				var moduleStore = Ext.getStore('part-tolerance-module-query');
				moduleStore.load({
					url : 'public/module?isResume=true&condition=' + nw
				});
			},
			queryPartByModuleId : function(grid, record) {
				if (record) {
					var store = Ext.getStore('part-tolerance-part-sel');
					store.load({
						url : 'public/moduleResumePart',
						params : {
							moduleResumeId : record.data.id
						}
					});
				}
			},
			/**
			 * 删除测量点
			 * 
			 * @param grid
			 */
			deleteMeasurePoint : function(grid) {
				var sel = grid.getSelectionModel().getSelection();
				if (sel.length) {
					var store = grid.getStore();
					for ( var x in sel) {
						store.remove(sel[x]);
					}
				}
			},
			parseModelToList : function(model) {
				var list = [];

				if (model && model.length) {
					for ( var x in model) {
						list.push(model[x].getData());
					}
				}

				return list;
			},
			/**
			 * 將數值轉換為Float型的數據
			 * 
			 * @param val
			 * @returns
			 */
			parseFloatVal : function(val) {
				// 如果值為空,則返回0
				if (!val) {
					return 0;
				}

				// 如果值為非數字,則返回0
				if (isNaN(val)) {
					return 0;
				}

				return parseFloat(val);
			},
			/** 判斷JSON數組中的某個元素是否重複或者为空 */
			isElementDistinct : function(model, el) {
				if (!model) {
					return (false);
				}

				var arr = [];

				for ( var x in model) {
					var data = model[x].get(el);
					if (!data) {
						return (true);
					}

					for ( var y in arr) {
						if (data == arr[y]) {
							return (true);
						}
					}

					arr.push(data);
				}

				return (false);
			},
			/** 判断MODEL数组中的某个元素的值是否为空 */
			jsonElementEmpty : function(model, el) {
				if (!model) {
					return (false);
				}

				for ( var x in model) {
					var data = model[x].get(el);
					if (!data) {
						return (true);
					}
				}

				return (false);
			},
			numberPrecision : function(val, pre) {
				var baseNumber = Math.pow(10, pre);
				return Math.round(val * baseNumber) / baseNumber;
			}
		});