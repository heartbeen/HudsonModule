/*******************************************************************************
 * TODO Field Region
 ******************************************************************************/
// 解析模具编号是否合法的正则表达式
var parseModulePattern_2 = /^(\d|[,-])*$/;
// 判定输入的模具取数的正则表达式(如:'2(+2+2)')
var extract_reg_2 = /^\d{1,2}([+]\d{1,2}){0,3}$/;
// 判定客户番号的正则表达式(如:F010101)
var mouleId_reg_2 = /^[0-9a-zA-Z]*$/;
// 判定员工ID号的正则表达式(如:101201)
var takeOn_reg_2 = /(\w|[.-]){3,15}/;
// 设置表格的默认列字段
var tableCol_2 = [ "modulecode", "guestcode", "guestid", {
	name : 'starttime',
	type : 'date'
}, {
	name : 'inittrytime',
	type : 'date'
}, "moduleintro", "modulebarcode", "posid", "productname", "moduleclass", "unitextrac", "workpressure", "takeon", "moduletaker", "guestname",
		"plastic", "moduleintro", "pictureurl", {
			name : 'startdate',
			type : 'date'
		}, {
			name : 'enddate',
			type : 'date'
		}, "modulestate", "rid", "deviser", "installer" ];
var refreshPara = {};

Ext.define('RowModel', {
	extend : 'Ext.data.Model',
	fields : tableCol_2
});

// 重写ToolBar的刷新方法
Ext.override(Ext.PagingToolbar, {
	doRefresh : function() {
		var initStore = this.getStore();
		initStore.load({
			url : initStore.proxy.url,
			params : refreshPara
		});
	}
});

// Ext.define('Module.UploadModuleFileWindow', {
// extend : 'Ext.window.Window',
//
// height : 78,
// width : 560,
// resizable : false,
// modal : true,
// layout : {
// type : 'border'
// },
// title : '导入模具资料',
//
// initComponent : function() {
// var me = this;
//
// Ext.applyIf(me, {
// items : [ {
// xtype : 'form',
// region : 'center',
// border : false,
// layout : {
// type : 'column'
// },
// bodyPadding : 10,
// items : [ {
// name : 'modulefile',
// xtype : 'filefield',
// width : 436,
// regex : new RegExp('.xls|.xlsx'),
// regexText : "文件类型错误,请上传(.xls|.xlsx)格式文件!",
// fieldLabel : '请选择上传文件'
// }, {
// xtype : 'button',
// margin : '0 0 0 5',
// width : 80,
// iconCls : 'table_go-16',
// text : '提交信息',
// handler : function() {
// this.up('form').getForm().submit({
// url : 'module/manage/uploadExchangeModuleInfo',
// method : 'POST',
// success : function(form, action) {
// Ext.getCmp('query-module-list').getStore().reload();
// var backJson = Ext.JSON.decode(action.response.responseText);
// showSuccess(backJson.msg);
//
// me.close();
// },
// failure : function(form, action) {
// var backJson = Ext.JSON.decode(action.response.responseText);
// showError(backJson.msg);
// }
// });
// }
// } ]
// } ]
// });
//
// me.callParent(arguments);
// }
//
// });

Ext.define('CheckMouldInformation', {
	extend : 'Ext.window.Window',
	height : 490,
	width : 390,
	modal : true,
	title : '模具明细',
	iconCls : 'text_dropcaps-16',
	layout : 'border',
	dataRow : null,
	initComponent : function() {
		var self = this;

		Ext.applyIf(self, {
			items : [ {
				id : 'cqmi-mould-info',
				xtype : 'form',
				region : 'center',
				border : false,
				bodyPadding : 10,
				items : [ {
					name : 'guestname',
					xtype : 'textfield',
					anchor : '100%',
					fieldLabel : '客户名称',
					readOnly : true
				}, {
					name : 'modulecode',
					xtype : 'textfield',
					anchor : '100%',
					fieldLabel : '内部编号',
					readOnly : true
				}, {
					name : 'guestcode',
					xtype : 'textfield',
					anchor : '100%',
					fieldLabel : '客户品番'
				}, {
					name : 'moduleclass',
					xtype : 'textfield',
					anchor : '100%',
					fieldLabel : '客户机种名'
				}, {
					name : 'productname',
					xtype : 'textfield',
					anchor : '100%',
					fieldLabel : '部品名称'
				}, {
					name : 'plastic',
					xtype : 'textfield',
					anchor : '100%',
					fieldLabel : '部品材料'
				}, {
					name : 'workpressure',
					xtype : 'numberfield',
					anchor : '100%',
					fieldLabel : '模具吨位',
					allowDecimals : false
				}, {
					name : 'unitextrac',
					xtype : 'textfield',
					anchor : '100%',
					fieldLabel : '模具取数',
					allowDecimals : false
				}, {
					name : 'starttime',
					xtype : 'datefield',
					anchor : '100%',
					fieldLabel : '起工日期',
					editable : false,
					format : 'Y-m-d'
				}, {
					name : 'inittrytime',
					xtype : 'datefield',
					anchor : '100%',
					editable : false,
					fieldLabel : '客户纳期',
					format : 'Y-m-d'
				}, {
					name : 'startdate',
					xtype : 'datefield',
					anchor : '100%',
					fieldLabel : '计划开始',
					editable : false,
					format : 'Y-m-d'
				}, {
					name : 'enddate',
					xtype : 'datefield',
					anchor : '100%',
					fieldLabel : '计划结束',
					editable : false,
					format : 'Y-m-d'
				}, {
					name : 'installer',
					xtype : 'combobox',
					anchor : '100%',
					fieldLabel : '模具担当',
					displayField : 'empname',
					valueField : 'empname',
					minChars : 0,
					store : Ext.create('Ext.data.Store', {
						fields : [ 'worknumber', 'empname' ],
						proxy : {
							url : 'public/querySaleEmployeeInfo',
							actionMethods : {
								read : "POST"
							},
							type : 'ajax',
							reader : {
								type : 'json'
							}
						},
						autoLoad : true
					})
				}, {
					name : 'deviser',
					xtype : 'combobox',
					anchor : '100%',
					fieldLabel : '设计担当',
					displayField : 'empname',
					valueField : 'empname',
					minChars : 0,
					store : Ext.create('Ext.data.Store', {
						fields : [ 'worknumber', 'empname' ],
						proxy : {
							url : 'public/querySaleEmployeeInfo',
							actionMethods : {
								read : "POST"
							},
							type : 'ajax',
							reader : {
								type : 'json'
							}
						},
						autoLoad : true
					})
				}, {
					name : 'modulebarcode',
					xtype : 'hiddenfield',
					anchor : '100%',
					fieldLabel : 'Label'
				} ],
				bbar : [ '->', {
					text : '保存资料',
					iconCls : 'gtk-save-16',
					handler : function() {
						var winform = this.up('window');
						winform.down('form').getForm().submit({
							url : "module/manage/updateModuleInfo",
							waitMsg : '正在提交数据',
							waitTitle : '提示',
							method : "POST",
							success : function(form, action) {
								winform.close();
								Ext.getCmp('query-module-list').getStore().reload();
							},
							failure : function(form, action) {
								showError(action.result.msg);
							}
						});
					}
				} ]
			} ]
		});

		self.callParent(arguments);

		Ext.getCmp('cqmi-mould-info').loadRecord(self.dataRow);
	}
});

Ext.define('Module.CoxonQueryModuleCode', {
	extend : 'Ext.panel.Panel',
	height : 506,
	width : 849,
	layout : {
		type : 'border'
	},
	title : '模具查询',
	initComponent : function() {
		var me = this;
		Ext.applyIf(me, {
			items : [ {
				id : 'query-module-list',
				xtype : 'gridpanel',
				region : 'center',
				// mode : 'remote',
				columnLines : true,
				rowLines : true,
				viewConfig : {
					stripeRows : true
				},
				store : me.queryStore,
				viewConfig : {
					getRowClass : function(record, rowIndex, p, store) {
						var stateid = parseInt(record.get('modulestate'));
						if (stateid) {
							return 'state-20203';
						}

						var rid = record.get('rid');
						if (rid) {
							return 'state-20201';
						}
					}
				},
				columns : [ new Ext.grid.RowNumberer({
					width : 40
				}), {
					xtype : 'gridcolumn',
					width : 90,
					dataIndex : 'guestname',
					locked : true,
					text : '客户名称',
					renderer : me.renderBold
				}, {
					xtype : 'gridcolumn',
					width : 180,
					dataIndex : 'modulecode',
					locked : true,
					text : '社内番号',
					renderer : me.renderBold
				}, {
					xtype : 'gridcolumn',
					width : 120,
					locked : true,
					dataIndex : 'guestcode',
					text : '客户品番',
					renderer : me.renderBold
				}, {
					xtype : 'gridcolumn',
					width : 120,
					dataIndex : 'moduleclass',
					text : '客户机种',
					renderer : me.renderBold
				}, {
					xtype : 'gridcolumn',
					width : 120,
					dataIndex : 'productname',
					text : '部品名称',
					renderer : me.renderBold
				}, {
					xtype : 'gridcolumn',
					width : 120,
					dataIndex : 'plastic',
					text : '部品材料',
					renderer : me.renderBold
				}, {

					dataIndex : 'workpressure',
					width : 80,
					text : '模具吨位(T)',
					renderer : function(value) {
						if (value) {
							return '<b>' + value + 'T</b>';
						}
					}
				}, {
					xtype : 'gridcolumn',
					width : 80,
					dataIndex : 'unitextrac',
					text : '模具取数',
					renderer : me.renderBold
				}, {
					xtype : 'datecolumn',
					width : 100,
					dataIndex : 'starttime',
					text : '订单起工',
					format : 'Y-m-d',
					renderer : function(date) {
						return (date ? '<b>' + Ext.Date.format(date, 'Y-m-d') + '</b>' : date);
					}
				}, {
					xtype : 'datecolumn',
					width : 100,
					dataIndex : 'inittrytime',
					text : 'T0纳期',
					format : 'Y-m-d',
					renderer : function(date) {
						return (date ? '<b>' + Ext.Date.format(date, 'Y-m-d') + '</b>' : date);
					}
				}, {
					xtype : 'datecolumn',
					width : 100,
					dataIndex : 'startdate',
					text : '计划开工',
					format : 'Y-m-d',
					renderer : function(date) {
						return (date ? '<b>' + Ext.Date.format(date, 'Y-m-d') + '</b>' : date);
					}
				}, {
					xtype : 'datecolumn',
					width : 100,
					dataIndex : 'enddate',
					text : '计划完成',
					format : 'Y-m-d',
					renderer : function(date) {
						return (date ? '<b>' + Ext.Date.format(date, 'Y-m-d') + '</b>' : date);
					}
				}, {
					// xtype : 'gridcolumn',
					width : 90,
					dataIndex : 'installer',
					text : '模具担当',
					renderer : me.renderBold
				}, {
					width : 80,
					dataIndex : 'deviser',
					text : '设计担当',
					renderer : me.renderBold
				}
				// , {
				// xtype : 'gridcolumn',
				// width : 120,
				// dataIndex : 'moduleintro',
				// text : '模具说明',
				// field : {
				// xtype : 'textfield',
				// maxLength : 240
				// }
				// }
				],
				title : '模具讯息',
				tbar : [ {
					text : '<b>移除履历</b>',
					iconCls : 'delete-16',
					handler : function() {
						me.moduleOperate(this.up('gridpanel'), '删除', '本次加工履历', 'module/manage/deleteModuleResume');
					}
				}, '-', {
					text : '<b>报废模具</b>',
					iconCls : 'cross-16',
					handler : function() {
						me.moduleOperate(this.up('gridpanel'), '报废', '模具资料', 'module/manage/ruinModuleInfo');
					}
				}, '-', {
					text : '<b>删除模具</b>',
					iconCls : 'gtk-clear-16',
					handler : function() {
						me.moduleOperate(this.up('gridpanel'), '永久删除', '模具资料', 'module/manage/deleteModuleInfo');
					}
				}
				// , '-', {
				// text : '<b>导出东莞</b>',
				// iconCls : 'door_out-16',
				// todata : 'dgdata',
				// handler : function() {
				// var selR =
				// this.up('gridpanel').getSelectionModel().getSelection();
				// if (!selR.length) {
				// showError('未选中任何要导出的模具信息');
				// return;
				// }
				//
				// Ext.create('Ext.form.Panel', {
				// standardSubmit : true,
				// }).submit({
				// url : 'public/exportModuleReport',
				// params : {
				// modulebarcode : selR[0].get('modulebarcode'),
				// to : this.todata
				// },
				// success : function(form, action) {
				// showSuccess("下载成功!");
				// },
				// failure : function(form, action) {
				// switch (action.failureType) {
				// case Ext.form.action.Action.CLIENT_INVALID:
				// showError("提交数据出现错误!");
				// break;
				// case Ext.form.action.Action.CONNECT_FAILURE:
				// showError("下载出现错误!");
				// break;
				// case Ext.form.action.Action.SERVER_INVALID:
				// showError("服务器错误!");
				// }
				// }
				// });
				// }
				// }, '-', {
				// text : '<b>导入资料</b>',
				// iconCls : 'door_in-16',
				// handler : function() {
				// new Module.UploadModuleFileWindow().show();
				// }
				// }
				],
				bbar : Ext.create('Ext.PagingToolbar', {
					store : me.queryStore,
					displayInfo : true,
					displayMsg : '资料范围为第 {0} - {1} 共 {2}',
					emptyMsg : "模具查询更新"
				}),
				listeners : {
					itemdblclick : function(panel, record) {
						new CheckMouldInformation({
							dataRow : record
						}).show();
					}
				}
			} ],
			dockedItems : [ {
				xtype : 'toolbar',
				dock : 'top',
				defaults : {
					labelWidth : 60,
				},
				items : [ {
					id : 'cqmc-query-info',
					xtype : 'textfield',
					margins : '0 5',
					fieldLabel : '匹配模号',
					width : 200
				}, {
					xtype : 'button',
					text : '点击查询',
					iconCls : 'search-16',
					scope : me,
					handler : me.onQueryModuleInfo
				} ]
			} ]
		});

		me.callParent(arguments);
	},
	/**
	 * 执行具体的模具删除、报废、删除模具记录的相关操作。
	 */
	moduleOperate : function(grid, oper, intro, uri) {
		var selRow = grid.getSelectionModel().getSelection();
		if (!selRow.length) {
			showError('没有选择待操作的模具资料!');
		}

		Ext.Msg.confirm('提示', '确定' + oper + '模具' + selRow[0].get('modulecode') + '的' + intro + '?', function(y) {
			if (y == 'yes') {
				Ext.Ajax.request({
					url : uri,
					method : 'POST',
					params : {
						modulebarcode : selRow[0].get('modulebarcode')
					},
					success : function(resp) {
						var backJson = Ext.JSON.decode(resp.responseText);
						if (backJson.success) {
							grid.getStore().reload();
						} else {
							showError(backJson.msg);
						}
					}
				});
			}
		});
	},
	renderBold : function(val) {
		return (val ? '<b>' + val + '</b>' : val);
	},
	saleStore : new Ext.data.Store({
		autoLoad : false,
		proxy : {
			actionMethods : {
				read : "POST"
			},
			type : 'ajax',
			url : 'public/querySaleEmployeeInfo'
		},
		fields : [ {
			name : 'worknumber'
		}, {
			name : 'empname'
		} ]
	}),
	// TODO ceshidian
	queryStore : new Ext.data.Store({
		model : 'RowModel',
		pageSize : 50,
		autoLoad : false,
		proxy : {
			type : 'ajax',
			url : 'module/manage/queryModuleByCondition',
			reader : {
				type : 'json',
				root : 'info',
				totalProperty : 'totalCount'
			}
		}
	}),

	// /**
	// * 选择查询条件
	// */
	// onSelectQuery : function(combo, records, eOpts) {
	// var me = this;
	// if (records) {
	// var selected = records[0].data.fieldId.split(',');
	// for (var i = 0; i < me.queryFormFields.length; i++) {
	// Ext.getCmp(me.queryFormFields[i]).setVisible(selected[i] == 'true');
	// }
	// me.queryId = records[0].data.queryId;
	// me.queryField = records[0].data.queryField;
	// }
	// },

	/**
	 * 查找机种
	 */
	onQueryModuleClass : function(combo, records, eOpts) {
		if (records) {
			Ext.getStore('query-module-class-store-id').load({
				url : 'public/queryModuleClass',
				params : {
					guestid : records[0].data.guestid
				}
			});
		}
	},

	/**
	 * 按条件查询模具信息
	 */
	onQueryModuleInfo : function() {
		var me = this;

		var value = Ext.getCmp('cqmc-query-info').getValue();
		refreshPara = {
			condition : value
		};

		me.queryStore.load({
			url : me.queryStore.proxy.url,
			params : refreshPara
		});
	},

	/**
	 * 更新前提示
	 */
	onDeforeedit : function(editor, e, eOpts) {

	},
	/**
	 * 更新模具信息
	 */
	onUpdateModuleInfo : function(editor, e) {

		Ext.Ajax.request({
			url : 'module/manage/updateModuleIntroduce',
			params : {
				module : App.dateReplaceToZone(Ext.JSON.encode(e.record.data))
			},
			method : "POST",

			success : function(response) {
				var res = Ext.JSON.decode(response.responseText);

				App.InterPath(res, function() {
					if (res.success) {
						showSuccess(res.msg);
						e.record.commit();
					} else {
						showError(res.msg);
					}
				});
			},
			failure : function() {
				showError('网络连接失败!');
				return;
			}
		});

	}
});

/*******************************************************************************
 * Method Region
 ******************************************************************************/

/**
 * 获取当前年份的前Start年后End年
 * 
 * @param start
 * @param end
 * @returns
 */
var getYears = function(start, end) {
	var years = [];
	var nowDate = new Date();
	for (var x = start; x < end; x++) {
		years.push({
			moldYear : Ext.util.Format.date(new Date(nowDate.getFullYear() + x, nowDate.getMonth(), nowDate.getDay()), 'Y')
		});
	}
	return years;
};

/**
 * 获取当的月份值
 * 
 * @returns
 */
var getNowMonth = function() {
	return Ext.util.Format.date(new Date(), 'm');
};

/**
 * 获取当前的年份值
 * 
 * @returns
 */
var getNowYear = function() {
	return Ext.util.Format.date(new Date(), 'Y');
};

/**
 * 获取月份JSON
 * 
 * @returns
 */
var getMonths = function() {
	var months = [];
	for (var x = 0; x < 12; x++) {
		months.push({
			monthId : x,
			monthNo : leftPad((x + 1) + '', 2, '0')
		});
	}
	return months;
};

// /**
// * 解析模具标号编号,使其生成编号数组
// *
// * @param str
// * @returns
// */
// var parseAllModules = function(str, base, pow, maxbatch) {
// if (!parseModulePattern_2.test(str)) {
// return {
// result : false,
// flag : -1,
// rows : []
// };
// } else {
// var batchList = [];
// var unit = str.split(',');
// for ( var x in unit) {
// if (!unit[x]) {
// continue;
// }
//
// if (strContains(unit[x], '-')) {
// var item = unit[x].split('-');
// var ival = [];
// for ( var x in item) {
// if (item[x]) {
// if (parseInt(item[x]) >= Math.pow(base, pow) || parseInt(item[x]) <= 0) {
// return {
// result : false,
// flag : -2,
// rows : []
// };
// }
//
// ival.push(parseInt(item[x]));
// }
// }
//
// if (ival.length == 0) {
// continue;
// } else if (ival.length == 1) {
// if (!arrContains(batchList, ival[0] + '')) {
// batchList.push(ival[0] + '');
// }
// } else {
// ival.sort(function(x, y) {
// return x - y;
// });
//
// for (var x = ival[0]; x < ival[ival.length - 1] + 1; x++) {
// if (!arrContains(batchList, x + '')) {
// batchList.push(x + '');
// }
// }
//
// if (batchList.length > maxbatch) {
// return {
// result : false,
// flag : -3,
// rows : []
// };
// }
// }
// } else {
// var padBatch = parseInt(unit[x]) + '';
// if (!arrContains(batchList, padBatch)) {
// batchList.push(padBatch);
// }
// }
// }
//
// return {
// result : true,
// flag : 1,
// rows : batchList
// };
// }
// };

/**
 * 判断STORE中是否含有某个列对应的值
 * 
 * @param ctrl
 * @param col
 * @param val
 * @returns
 */
// var dataInStore = function(ctrl, col, val) {
// try {
// var store = Ext.getCmp(ctrl).getStore();
// var isHas = false;
// for (var x = 0; x < store.getCount(); x++) {
// if (store.getAt(x).get(col) == val) {
// isHas = true;
// break;
// }
// }
//
// return isHas;
// } catch (e) {
// return (false);
// }
// };
