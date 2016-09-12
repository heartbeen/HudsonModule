/**
 * 外厂模具格式
 */
Ext.define('Module.CreateModuleInformation', {
	extend : 'Ext.panel.Panel',

	// forceFit : true,
	layout : 'border',

	tableCol : [ "posid", "modulecode", "guestid", "guestname", "moduleclass", "facttrytime", "createyear", "createmonth", "createtime", "creator",
			"creatorname", "modulestate", "takeon", {
				name : "starttime",
				type : 'date'
			}, {
				name : "inittrytime",
				type : 'date'
			}, "monthno", "pictureurl", "modulestyle", "productname", "moduleintro", "guestcode", "plastic", "workpressure", "unitextrac",
			"operateflag", "modulebarcode", "issave", "takeonname" ],
	todayStr : Ext.Date.format(new Date(), 'Y-m-d').split('-'),
	initComponent : function() {
		var me = this;

		me.moduleStore = Ext.create('Ext.data.Store', {
			autoLoad : false,
			fields : me.tableCol,
			proxy : {
				type : 'ajax',
				url : '',
				reader : {
					type : 'json',
					root : 'root'
				}
			}
		});

		Ext.applyIf(me, {
			tbar : [ {
				xtype : 'form',
				id : 'process-module-form-id',
				border : false,
				bodyStyle : {
					backgroundColor : 'rgba(0,0,0,0)'
				},
				items : [ {
					xtype : 'fieldset',
					title : '工号生成条件',
					bodyPadding : 5,
					layout : {
						type : 'table',
						columns : 3
					},
					items : [ {
						xtype : 'combobox',
						name : 'factoryStyle',
						width : 180,
						fieldLabel : '制作方式',
						margins : '0 0 0 5',
						editable : false,
						allowBlank : false,
						store : new Ext.data.Store({
							autoLoad : true,
							data : [ {
								styleno : 'KC',
								stylename : '内部制作'
							}, {
								styleno : 'KF',
								stylename : '外发制作'
							} ],
							fields : [ {
								name : 'styleno'
							}, {
								name : 'stylecode'
							}, {
								name : 'stylename'
							} ],
						}),
						queryMode : 'local',
						labelWidth : 60,
						valueField : 'styleno',
						displayField : 'stylename',
						triggerAction : 'all',

						value : 'KC'
					}, {
						xtype : 'numberfield',
						fieldLabel : '年份',
						name : 'moduleYear',
						labelWidth : 60,
						width : 160,
						editable : false,
						allowBlank : false,
						style : 'margin-left:5px;',
						value : parseInt(me.todayStr[0]),
						minValue : parseInt(me.todayStr[0]) - 1,
						maxValue : parseInt(me.todayStr[0]) + 1
					}, {
						xtype : 'numberfield',
						fieldLabel : '月份',
						name : 'moduleMonth',

						labelWidth : 60,
						width : 160,
						editable : false,
						allowBlank : false,
						style : 'margin-left:5px;',
						value : parseInt(me.todayStr[1]),
						minValue : 1,
						maxValue : 12
					}, {
						xtype : 'combobox',
						name : 'factoryGuest',
						width : 180,
						allowBlank : false,
						fieldLabel : '客户代号',
						labelWidth : 60,
						margins : '0 0 0 5',
						store : new Ext.data.Store({
							autoLoad : false,
							fields : [ {
								name : 'factorycode'
							}, {
								name : 'shortname'
							}, {
								name : 'guestid'
							} ],

							proxy : {
								type : 'ajax',
								url : 'public/queryGuestOfModuleCode?type=02',
								reader : {
									type : 'json'
								}
							}
						}),
						listConfig : {
							loadingText : 'Searching...',
							getInnerTpl : function() {
								return '<a class="search-item"><span style = \'color:red\'>{factorycode}</span>|<span>{shortname}</span></a>';
							}
						},
						valueField : 'factorycode',
						displayField : 'factorycode',
						autoSelect : false,
						minChars : 1,
						triggerAction : 'all',
						listeners : {
							change : me.getGuestCode
						}
					}, {
						xtype : 'numberfield',
						name : 'moduleCount',
						editable : false,
						allowBlank : false,
						fieldLabel : '模具套数',
						labelWidth : 60,
						style : 'margin-left:5px;',
						width : 160,
						value : 1,
						minValue : 1,
						maxValue : 100
					}, {
						xtype : 'button',
						text : '生成工号',
						iconCls : 'gtk-new-16',
						style : 'margin-left:87px;margin-bottom:5px;',
						scope : me,
						handler : me.verifyCreateModuleCode
					} ]
				} ]
			} ],

			items : [ {
				xtype : 'gridpanel',
				rowLines : true,
				columnLines : true,
				region : 'center',
				title : '新模列表(<span style="color:blue;">双击模具可以填写资料</span><span class="module-info-no-save">(表示为没有保存)</span>)',
				store : me.moduleStore,
				viewConfig : {
					getRowClass : function(record, rowIndex, rowParams, store) {
						return record.get('issave') == false ? "module-info-no-save" : "";
					}
				},
				dockedItems : [ {
					xtype : 'toolbar',
					items : [ {
						text : '导入文件',
						iconCls : 'document-import-16',
						scope : me,
						handler : me.onUploadModuleFile
					} ]
				} ],

				columns : [ {
					xtype : 'rownumberer',
					width : 40
				}, {
					xtype : 'gridcolumn',
					width : 120,
					dataIndex : 'modulecode',
					text : '模具工号'
				}, {
					xtype : 'gridcolumn',
					width : 120,
					dataIndex : 'guestname',
					text : '客户名称'
				}, {
					xtype : 'gridcolumn',
					width : 120,
					dataIndex : 'guestcode',
					text : '客户品番'
				}, {
					xtype : 'gridcolumn',
					width : 120,
					dataIndex : 'moduleclass',
					text : '客户机种'
				}, {
					xtype : 'gridcolumn',
					width : 120,
					dataIndex : 'productname',
					text : '部品名称'
				}, {
					xtype : 'gridcolumn',
					width : 120,
					dataIndex : 'plastic',
					text : '产品材料'
				}, {
					xtype : 'gridcolumn',
					width : 60,
					dataIndex : 'workpressure',
					text : '模具吨位'
				}, {
					xtype : 'gridcolumn',
					width : 60,
					dataIndex : 'unitextrac',
					text : '模具取数'
				}, {
					xtype : 'datecolumn',
					width : 85,
					dataIndex : 'starttime',
					format : 'Y-m-d',
					text : '开始日期'
				}, {
					xtype : 'datecolumn',
					width : 85,
					dataIndex : 'inittrytime',
					format : 'Y-m-d',
					text : 'T0纳期'
				}, {
					xtype : 'gridcolumn',
					width : 60,
					dataIndex : 'takeonname',
					text : '模具担当'
				} ],

				listeners : {
					celldblclick : me.onModuleDbclick
				}
			} ]

		});

		me.callParent(arguments);
	},

	/**
	 * 导入模具文件
	 */
	onUploadModuleFile : function() {
		var me = this;
		Ext.create('Project.component.FileUploadWindow', {
			title : '上传模具资料',
			fileType : '.xls|.xlsx',
			uploadUrl : 'module/manage/uploadModuleInfo',
			downloadModeUrl : 'template/module/module.xls',
			successFunction : function(window, content) {

				if (content.success) {
					window.destroy();
				}

				me.moduleStore.loadData(content.module);

				Fly.msg('信息', content.msg);
			}

		}).show();
	},
	// 开始时间不能大于T0时间
	startChange : function(me, newChar, oldChar, opts) {
		var end = Ext.getCmp('date-select-test').getValue();
		if (!end) {
			Ext.getCmp('date-select-test').setValue(newChar);
		} else {
			if (new Date(end) < new Date(newChar)) {
				me.setValue(oldChar);
				Ext.Msg.show({
					title : '提醒',
					msg : '开始时间不能大于T0试模时间',
					buttons : Ext.Msg.OK,
					icon : Ext.Msg.INFO
				});
				return;
			}
		}
	},
	// T0试模的时间判定
	testChange : function(me, newChar, oldChar, opts) {
		var start = Ext.getCmp('date-select-start').getValue();
		if (!start) {
			Ext.getCmp('date-select-start').setValue(newChar);
		} else {
			if (new Date(start) > new Date(newChar)) {
				me.setValue(oldChar);
				Ext.Msg.show({
					title : '提醒',
					msg : 'T0试模的时间不能小于开始时间',
					buttons : Ext.Msg.OK,
					icon : Ext.Msg.INFO
				});
				return;
			}
		}
	},

	/** 此处为查找客户代号的主函数,主要作用在group-factory-guest Combobox控件的change事件上 */
	getGuestCode : function(combo, newValue, oldValue, eOpts) {
		if (!newValue) {
			combo.getStore().removeAll();
		}

		Ext.Ajax.request({
			url : 'public/queryGuestOfModuleCode',
			params : {
				type : '02',
				query : newValue
			},
			method : 'POST',
			success : function(response) {
				var result = Ext.JSON.decode(response.responseText);
				combo.getStore().loadData(result);
			},
			failure : function() {
				combo.getStore().loadData([]);
			}
		});
	},

	/**
	 * 当已经生成工号时,确定是否要再生成模具工号
	 * 
	 * @returns
	 */
	verifyCreateModuleCode : function() {
		var me = this;

		if (me.moduleStore.getCount() > 0) {
			Ext.MessageBox.show({
				title : '新模',
				msg : '您确定要重新生成工号吗?如果数据没有保存将会丢失!',
				buttons : Ext.MessageBox.YESNO,
				buttonText : {
					yes : "確定",
					no : "取消"
				},
				fn : function(buttonId) {
					if (buttonId == 'yes') {
						me.createModuleCode();
					}
				}
			});
		} else {
			me.createModuleCode();
		}

	},

	/**
	 * 生成工号方法
	 */
	createModuleCode : function() {
		var me = this;
		var form = Ext.getCmp('process-module-form-id').getForm();

		if (!form.isValid()) {
			Ext.Msg.show({
				title : '提醒',
				msg : '条件填写不完整!',
				buttons : Ext.Msg.OK,
				icon : Ext.Msg.INFO
			});
			return;
		}
		var values = form.getValues();
		var factoryCombo = form.getFields().items[3];

		// 提取模具的制作方式(KC：内部制作，KF：外发制作)
		var styleNo = values.factoryStyle;
		// 提取客户代号
		var guestCode = values.factoryGuest;
		// 如果输入的客户名称与从资料库中获取存放在STORE中的客户名称不同,则客户代号不存在
		if (!guestCode || !me.storeContains(factoryCombo.getStore(), 'factorycode', guestCode)) {
			factoryCombo.reset();
			Ext.Msg.show({
				title : '提醒',
				msg : '系统中没有该客户的讯息!',
				buttons : Ext.Msg.OK,
				icon : Ext.Msg.INFO
			});
			return;
		}

		// 获取客户的公司简称
		var guestName = factoryCombo.findRecordByValue(guestCode).get('shortname');
		var guestid = factoryCombo.findRecordByValue(guestCode).get('guestid');

		// 提取模具取数
		var moduleNum = values.moduleCount;

		// 执行对服务器中模具资料的查询分析，过滤出某个客户当月的模具最大值，分析后产生新的模具工号

		Ext.Ajax.request({
			url : 'module/manage/estimateModuleCode',
			params : {
				"mc.style" : styleNo,
				"mc.guest" : guestCode.toUpperCase(),
				"mc.guestId" : guestid,
				"mc.guestName" : guestName,
				"mc.moduleYear" : values.moduleYear.substring(2),
				"mc.moduleMonth" : values.moduleMonth,
				"mc.num" : moduleNum
			},
			method : "POST",

			success : function(response) {
				var res = Ext.JSON.decode(response.responseText);

				App.InterPath(res, function() {
					if (res.success) {
						me.moduleStore.loadData(res.modules);

						Fly.msg('信息', res.msg);
					} else {
						Fly.msg('错误', "<span style='color:red;'>" + res.msg + "</span>");
					}
				});
			},
			failure : function() {
				Fly.msg('提醒', '网络连接失败!');
				return;
			}
		});

	},

	/**
	 * 查询STORE中JSON对象中的列中是否含有某个值
	 * 
	 * @param store
	 *            STORE对象
	 * @param field
	 *            字段
	 * @param val
	 *            值
	 * @returns
	 */
	storeContains : function(store, field, val) {
		if (store && store.getCount() > 0) {
			for (var x = 0; x < store.getCount(); x++) {
				if (store.getAt(x).get(field) == val) {
					return true;
				}
			}

			return false;
		} else {
			return false;
		}
	},

	/**
	 * 双击模具时显示模具资料填写框
	 */
	onModuleDbclick : function(grid, td, cellIndex, record) {
		if (record) {
			var window = Ext.create('Module.ModuleInformationWindow');

			window.form.getForm().loadRecord(record);
			window.show();
		}

	}
});

// 判定选择的文件是否是图片格式(*.gif,*.png,*.jpeg,*.jpg,*.bmp)
var img_reg = /\.([jJ][pP][gG]){1}$|\.([jJ][pP][eE][gG]){1}$|\.([gG][iI][fF]){1}$|\.([pP][nN][gG]){1}$|\.([bB][mM][pP]){1}$/;
// 判定输入的模具取数的正则表达式(如:'2(+2+2)')
var extract_reg = /^\d{1,2}([+]\d{1,2}){0,3}$/;
// 判定客户番号的正则表达式(如:F010101)
var mouleId_reg = /^[0-9a-zA-Z]*$/;
// 模具资料暂存表格列名

// 判定员工ID号的正则表达式(如:101201)
var takeOn_reg = /(\w|[.-]){3,15}/;

Ext.define('Module.ModuleInformationWindow', {
	extend : 'Ext.window.Window',
	width : 400,
	height : 540,
	layout : 'border',
	title : '模具资料',
	modal : true,

	initComponent : function() {
		var me = this;

		me.form = Ext.create('Ext.form.Panel', {

			layout : 'hbox',
			region : 'center',
			border : false,
			layout : 'anchor',
			bodyPadding : 10,
			record : null,
			defaults : {
				labelWidth : 80
			},
			items : [ {
				xtype : 'textfield',
				name : 'modulecode',
				anchor : '100%',
				fieldLabel : '模具工号',
				maxLength : 50,
				allowBlank : false

			}, {

				xtype : 'textfield',
				name : 'guestcode',
				anchor : '100%',
				fieldLabel : '客户番号',
				maxLength : 30,
				allowBlank : false
			}, {
				xtype : 'textfield',
				name : 'productname',
				anchor : '100%',
				fieldLabel : '部品名称',
				maxLength : 100,
				allowBlank : false
			}, {
				xtype : 'textfield',
				name : 'moduleclass',
				anchor : '100%',
				fieldLabel : '客户机种名',
				maxLength : 50,
				allowBlank : false
			}, {
				xtype : 'textfield',
				name : 'plastic',
				anchor : '100%',
				fieldLabel : '产品材料',
				maxLength : 50,
				allowBlank : false
			}, {
				xtype : 'textfield',
				anchor : '100%',
				fieldLabel : '模具取数',
				name : 'unitextrac',
				maxLength : 20,
				allowBlank : false
			}, {
				xtype : 'numberfield',
				name : 'workpressure',
				anchor : '100%',
				fieldLabel : '成型吨位',
				maxValue : 9999,
				minValue : 5,
				step : 5,
				maxLength : 4,
				value : 75,
				listeners : {
					blur : function(me) {
						var ps = me.getValue();
						if (!ps) {
							me.setValue(75);
						} else {
							var pattern = /\d+/;
							if (!pattern.test(ps)) {
								me.setValue(75);
							} else {
								if (ps > 9999 || ps < 5) {
									me.setValue(75);
								} else {
									me.setValue(ps);
								}
							}
						}
					}
				},
				allowBlank : false
			}, {
				name : 'starttime',
				xtype : 'datefield',
				anchor : '100%',
				fieldLabel : '开始时间',
				format : 'Y-m-d',
				editable : false,
				// minValue : new Date(),
				listeners : {
					select : function(field, value, eOpts) {
						Ext.getCmp('create-module-inittrytime-id').setMinValue(value);
					}
				},
				allowBlank : false
			}, {
				xtype : 'datefield',
				id : 'create-module-inittrytime-id',
				name : 'inittrytime',
				anchor : '100%',
				fieldLabel : 'T0试模时间',
				format : 'Y-m-d',
				// minValue : new Date(),
				editable : false,
				allowBlank : false
			}, {

				xtype : 'combobox',
				name : 'takeon',
				anchor : '100%',
				store : new Ext.data.Store({
					autoLoad : true,
					proxy : {
						type : 'ajax',
						url : 'public/querySaleEmployeeInfo'
					},
					fields : [ {
						name : 'worknumber'
					}, {
						name : 'empname'
					} ]
				}),
				fieldLabel : '跟模担当',
				valueField : 'worknumber',
				displayField : 'empname',
				triggerAction : 'all',
				allowBlank : false
			}, {
				xtype : 'textareafield',
				name : 'moduleintro',
				maxLength : 240,
				height : 100,
				anchor : '100%',
				fieldLabel : '模具说明'
			} ]

		});
		Ext.applyIf(me, {
			items : [ me.form ],
			fbar : [ {
				xtype : 'button',
				text : '保存资料',
				width : 80,
				iconCls : 'gtk-save-16',
				scope : me,
				handler : me.onSaveModuleInfo
			}, {
				xtype : 'button',
				text : '取消',
				width : 80,
				iconCls : 'edit-clear-16',
				handler : function() {
					me.destroy();
				}
			} ]
		});

		me.callParent(arguments);

	},

	onSaveModuleInfo : function() {
		var me = this;
		form = me.form.getForm();

		if (!form.isValid()) {
			return;
		}

		var record = form.getRecord();
		var values = form.getValues();

		var tableCol = Ext.getCmp('Module.CreateModuleInformation').tableCol;

		// 更新表格中的数据
		for ( var i in tableCol) {
			if (typeof tableCol[i] == 'object') {
				if (values[tableCol[i].name]) {
					record.set(tableCol[i].name, values[tableCol[i].name]);
				}
			} else {
				if (values[tableCol[i]]) {
					record.set(tableCol[i], values[tableCol[i]]);
				}
			}

		}
		// 临时使用
		record.set('facttrytime', '2014-03-19T00:00:00.000+0800');
		record.set('createtime', '2014-03-19T00:00:00.000+0800');

		Ext.Ajax.request({
			url : 'module/manage/saveNewModuleData',
			params : {
				modules : '{"modules":[' + App.dateReplaceToZone(Ext.JSON.encode(record.data)) + ']}',
				isSave : record.data.issave
			},
			method : "POST",

			success : function(response) {
				var res = Ext.JSON.decode(response.responseText);

				App.InterPath(res, function() {
					if (res.success) {
						record.set('issave', true);
						me.destroy();
						record.commit();
						Fly.msg('信息', res.msg);
					} else {
						Fly.msg('错误', "<span style='color:red;'>" + res.msg + "</span>");
					}
				});
			},
			failure : function() {
				Fly.msg('提醒', '网络连接失败!');
				return;
			}
		});
	}
});
