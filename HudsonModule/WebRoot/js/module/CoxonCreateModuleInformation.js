/**
 * 本厂模具格式
 */
Ext.define('Module.CoxonCreateModuleInformation', {
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
			"operateflag", "modulebarcode", {
				name : "issave",
				type : 'boolean'
			}, "takeonname", {
				name : 'combine',// 1:单色模,2:双色模
				type : 'int'
			} ],
	todayStr : Ext.Date.format(new Date(), 'Y-m-d').split('-'),
	initComponent : function() {
		var me = this;

		me.moduleStore = Ext.create('Ext.data.Store', {
			autoLoad : true,
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

			items : [ {
				xtype : 'form',
				region : 'north',
				margins : '0 0 5 0',
				bodyStyle : {
					backgroundColor : 'rgba(0,0,0,0)'
				},
				parent : me,
				bodyPadding : 5,
				title : '工号生成条件',
				items : [ {
					xtype : 'container',
					layout : 'table',
					defaults : {
						labelWidth : 60,
						style : 'margin-right:5px;'
					},
					items : [ {

						xtype : 'combobox',
						name : 'processType',
						allowBlank : false,
						fieldLabel : '制作别',
						width : 160,
						store : new Ext.data.Store({
							autoLoad : false,
							fields : [ 'type', 'typeName' ],
							data : [ {
								type : 'KC',
								typeName : '内部制作'
							}, {
								type : 'KW',
								typeName : '外发制作'
							} ],
							proxy : {
								type : 'memory',
								reader : {
									type : 'json'
								}
							}
						}),
						listConfig : {
							loadingText : 'Searching...',
							getInnerTpl : function() {
								return '<a class="search-item"><span style = \'color:red\'>{type}</span>|<span>{typeName}</span></a>';
							}
						},
						value : 'KC',
						valueField : 'type',
						displayField : 'type',
						autoSelect : false,
						editable : false
					}, {
						xtype : 'datefield',
						fieldLabel : '订单月份',
						name : 'orderMonth',
						allowBlank : false,
						format : 'ym',
						editable : false,
						width : 180
					}, {
						xtype : 'combobox',
						name : 'factoryGuest',
						allowBlank : false,
						fieldLabel : '客户代号',
						width : 200,
						store : new Ext.data.Store({
							autoLoad : true,
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
						// change : me.getGuestCode
						}

					} ]
				}, {
					xtype : 'container',
					layout : {
						type : 'table'
					},
					items : [ {
						xtype : 'container',
						defaults : {
							style : 'margin-right:5px;',
							minValue : 1,
							labelWidth : 60
						},
						layout : {
							type : 'table'
						},
						items : [ {
							xtype : 'textfield',
							name : 'moduleFrom',
							width : 420,
							fieldLabel : '模具序号',
						}, {
							xtype : 'numberfield',
							name : 'moduleUnit',
							width : 120,
							fieldLabel : '序号位数',
							minValue : 2,
							maxValue : 4,
							value : 2,
							editable : false
						} ]
					} ]
				} ],
				dockedItems : [ {
					xtype : 'toolbar',
					dock : 'bottom',
					items : [ {
						xtype : 'button',
						text : '生成番号',
						iconCls : 'gtk-new-16',
						handler : me.createModuleCode
					} ]
				} ]
			}, {
				xtype : 'gridpanel',
				rowLines : true,
				columnLines : true,
				region : 'center',
				title : '新模列表(<span style="color:blue;">双击模具可以填写资料</span>)<span class="module-info-no-save">(表示为没有保存)</span>',
				store : me.moduleStore,
				viewConfig : {
					getRowClass : function(record, rowIndex, rowParams, store) {
						return record.get('issave') == false ? "module-info-no-save" : "module-info-been-save";
					}
				},
				dockedItems : [ {
					xtype : 'toolbar',
					items : [
					// {
					// text : '导入文件',
					// iconCls : 'document-import-16',
					// scope : me,
					// handler : me.onUploadModuleFile
					// }, '-',
					{
						text : '清空列表',
						iconCls : 'gtk-clear-16',
						scope : me,
						handler : me.clearModuleList
					} ]
				} ],

				columns : [ {
					xtype : 'rownumberer',
					locked : true,
					width : 30
				}, {
					xtype : 'gridcolumn',
					width : 110,
					dataIndex : 'modulecode',
					locked : true,
					text : '社内番号'
				}, {
					xtype : 'gridcolumn',
					width : 90,
					dataIndex : 'guestname',
					locked : true,
					text : '客户名称'
				}, {
					xtype : 'gridcolumn',
					width : 120,
					dataIndex : 'guestcode',
					locked : true,
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
					width : 80,
					dataIndex : 'workpressure',
					text : '模具吨位',
					renderer : me.renderModuleTone
				}, {
					xtype : 'gridcolumn',
					width : 60,
					dataIndex : 'unitextrac',
					text : '模具取数'
				}, {
					xtype : 'gridcolumn',
					width : 60,
					dataIndex : 'creatorname',
					text : '生管担当'
				}, {
					xtype : 'gridcolumn',
					width : 60,
					dataIndex : 'pictureurl',
					text : '设计担当'
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
					dataIndex : 'moduleintro',
					text : '模具说明'
				} ],

				listeners : {
					scope : me,
					itemdblclick : me.onModuleDbclick,
					itemcontextmenu : me.moduleContextmenu
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
				showInfo(content.msg);

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
	 * 生成工号方法
	 */
	createModuleCode : function() {

		var form = this.up('form').getForm();
		var me = this.up('form').parent;
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

		var factoryCombo = form.getFields().items[2];

		// 提取客户代号
		var guestCode = values.factoryGuest;
		// 如果输入的客户名称与从资料库中获取存放在STORE中的客户名称不同,则客户代号不存在
		if (!guestCode || factoryCombo.getStore().find('factorycode', guestCode) == -1) {
			factoryCombo.reset();
			Ext.Msg.show({
				title : '提醒',
				msg : '系统中没有该客户的讯息!',
				buttons : Ext.Msg.OK,
				icon : Ext.Msg.INFO
			});
			return;
		}

		// if (values.moduleFrom.length > values.moduleUnit) {
		// values.moduleUnit = values.moduleFrom.length;
		// }

		// 获取客户的公司简称
		var guestName = factoryCombo.findRecordByValue(guestCode).get('shortname');
		var guestid = factoryCombo.findRecordByValue(guestCode).get('guestid');

		Ext.Ajax.request({
			url : 'module/manage/generateModuleCode',
			params : {
				"gmf.orderMonth" : values.orderMonth,
				"gmf.guestId" : guestid,
				"gmf.guestName" : guestName,
				"gmf.factoryGuest" : values.factoryGuest,
				"gmf.processType" : values.processType,
				"gmf.moduleFrom" : values.moduleFrom,
				"gmf.moduleUnit" : values.moduleUnit
			},
			method : "POST",

			success : function(response) {
				var res = Ext.JSON.decode(response.responseText);

				App.InterPath(res, function() {
					if (res.success) {

						for ( var i in res.modules) {
							if (me.moduleStore.find('modulecode', res.modules[i].modulecode) == -1) {
								me.moduleStore.add(res.modules[i]);
							}
						}
						if (res.backstr) {
							showError("下列社内番号已经存在,无需添加了:" + res.backstr);
						}
					} else {
						if (res.flag == -1) {
							showError("社内番号不符合要求!<br>社内番号格式如:A,B,C-D其中字母代表数字");
						} else if (res.flag == -2) {
							showError("分解解析的社内番号为空!");
						} else if (res.flag == -3) {
							showError("社内番号一次保存的数量只能在30套之内!");
						} else {
							showError("其他错误,请联系管理员!");
						}
					}
				});
			},
			failure : function() {
				showError("网络连接失败!");
				return;
			}
		});

	},

	/**
	 * 删除模具资料菜单
	 */
	moduleContextmenu : function(view, record, html, index, e) {
		Ext.create('Ext.menu.Menu', {
			plain : true,
			items : [ {
				text : '删除' + record.data.modulecode,
				iconCls : 'remove-16',
				handler : function() {

					Ext.MessageBox.confirm('删除', '您确认要删除' + record.data.modulecode + "模具资料码?", function(btn) {
						if (btn == 'yes') {

							if (record.data.issave) {

							} else {
								view.up('gridpanel').getStore().remove(record);
							}
						}
					});
				}
			} ]
		}).showAt(e.getXY());
	},

	/**
	 * 双击模具时显示模具资料填写框
	 */
	onModuleDbclick : function(view, record, item, index, e, eOpts) {
		var me = this;
		if (record) {
			var window = Ext.create('ModuleInformationWindow', {
				parent : me,
				moduleStore : view.up('gridpanel').getStore(),
				nowIndex : index
			});
			window.form.getForm().loadRecord(record);
			window.show();
		}

	},
	/**
	 * 清空模具列表里的所有讯息
	 */
	clearModuleList : function() {
		var self = this;
		Ext.Msg.confirm('确认', '是否决定删除列表的所有社内番号?', function(y) {
			if (y == 'yes') {
				self.moduleStore.removeAll();
			}
		});
	},

	/**
	 * 
	 */
	renderModuleTone : function(value, meta, record) {
		return value == '' ? '' : (record.data.combine == 1 ? '单射' : '双射') + value + "T";
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

Ext.define('ModuleInformationWindow', {
	extend : 'Ext.window.Window',
	width : 600,
	height : 540,
	layout : 'border',
	title : '模具资料',
	modal : true,
	yieldCount : 0,// 良率汇总
	yieldSum : 0,

	initComponent : function() {
		var me = this;

		me.form = Ext.create('Ext.form.Panel', {
			border : false,
			region : 'center',
			bodyPadding : 10,
			record : null,
			layout : 'border',
			items : [ {
				xtype : 'fieldset',
				layout : 'hbox',
				region : 'center',
				title : '基本资料',
				layout : 'anchor',

				defaults : {
					labelWidth : 80,
					labelAlign : 'right'
				},
				items : [ {
					xtype : 'textfield',
					name : 'modulecode',
					anchor : '100%',
					fieldLabel : '社内番号',
					maxLength : 50,
					allowBlank : false,
					readOnly : true

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
					allowBlank : false,
					regex : /^[1-9](\d)?([+][1-9](\d)?)*$/,
					regexText : '模具取数格式:n或者m(+n)'
				}, {
					xtype : 'fieldcontainer',
					layout : 'table',
					anchor : '100%',
					defaults : {
						width : 140,
						labelWidth : 80,
						allowBlank : false,
						labelAlign : 'right'
					},
					items : [ {
						xtype : 'combobox',
						name : 'combine',
						store : new Ext.data.Store({
							fields : [ {
								name : 'combine',
								type : 'int'
							}, 'combineName' ],

							data : [ {
								combine : 1,
								combineName : '单射'
							}, {
								combine : 2,
								combineName : '双射'
							} ],
							proxy : {
								type : 'memory'
							}
						}),
						editable : false,
						fieldLabel : '单双射',
						valueField : 'combine',
						displayField : 'combineName',
						triggerAction : 'all'
					}, {
						xtype : 'numberfield',
						name : 'workpressure',
						style : 'margin-left:5px;',
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
						}
					} ]
				}, {
					name : 'starttime',
					xtype : 'datefield',
					anchor : '100%',
					fieldLabel : '预计开始',
					format : 'Y-m-d',
					editable : false,
					// minValue : new Date(),
					listeners : {
						change : function(field, newValue, oldValue, eOpts) {
							Ext.getCmp('create-module-inittrytime-id').setMinValue(newValue);
						}
					},
					allowBlank : false
				}, {
					xtype : 'datefield',
					id : 'create-module-inittrytime-id',
					name : 'inittrytime',
					anchor : '100%',
					fieldLabel : '预计完成',
					format : 'Y-m-d',
					// minValue : new Date(),
					editable : false,
					allowBlank : false
				}, {

					xtype : 'combobox',
					name : 'takeon',
					anchor : '100%',
					fieldLabel : '组立担当',
					valueField : 'empname',
					displayField : 'empname',
					// allowBlank : false,
					store : new Ext.data.Store({
						autoLoad : true,
						fields : [ {
							name : 'worknumber'
						}, {
							name : 'empname'
						} ],

						proxy : {
							actionMethods : {
								read : 'POST'
							},
							type : 'ajax',
							url : 'public/querySaleEmployeeInfo',
							reader : {
								type : 'json'
							}
						}
					}),
					listConfig : {
						loadingText : '查找中...',
						getInnerTpl : function() {
							return '<a class="search-item"><span style = \'color:red\'>{worknumber}</span>|<span>{empname}</span></a>';
						}
					},
					minChars : 0,
				}, {
					xtype : 'combobox',
					name : 'pictureurl',
					anchor : '100%',
					fieldLabel : '设计担当',
					valueField : 'empname',
					displayField : 'empname',
					triggerAction : 'all',
					// allowBlank : false,
					store : new Ext.data.Store({
						autoLoad : false,
						fields : [ {
							name : 'worknumber'
						}, {
							name : 'empname'
						} ],

						proxy : {
							actionMethods : {
								read : "POST"
							},
							type : 'ajax',
							url : 'public/querySaleEmployeeInfo'
						}
					}),
					listConfig : {
						loadingText : '查找中...',
						getInnerTpl : function() {
							return '<a class="search-item"><span style = \'color:red\'>{worknumber}</span>|<span>{empname}</span></a>';
						}
					},
					minChars : 0

				}, {
					xtype : 'textareafield',
					name : 'moduleintro',
					maxLength : 240,
					height : 100,
					anchor : '100%',
					fieldLabel : '模具说明'
				} ]

			}, {
				xtype : 'fieldset',
				region : 'east',
				width : 200,
				style : 'margin-left:5px;',
				defaults : {
					labelWidth : 75,
					labelAlign : 'right',
					scope : me,

					listeners : {
						change : me.yieldChange
					}
				},
				title : '制程报价资料',
				items : [ {
					xtype : 'numberfield',
					anchor : '100%',
					minValue : 1,
					fieldLabel : '成形周期(s)',
				}, {
					xtype : 'numberfield',
					anchor : '100%',
					maxValue : 100,
					minValue : 0,
					step : 1,
					value : 0,
					fieldLabel : '成形良率',

				}, {
					xtype : 'numberfield',
					anchor : '100%',
					maxValue : 100,
					minValue : 0,
					value : 0,
					fieldLabel : '涂装良率'
				}, {
					xtype : 'numberfield',
					anchor : '100%',
					minValue : 0,
					value : 0,
					maxValue : 100,
					value : 0,
					fieldLabel : '装配良率'
				}, {
					xtype : 'numberfield',
					anchor : '100%',
					minValue : 0,
					value : 0,
					maxValue : 100,
					fieldLabel : '印刷良率'
				}, {
					xtype : 'numberfield',
					anchor : '100%',
					minValue : 0,
					value : 0,
					maxValue : 100,
					fieldLabel : 'NCVM良率'
				}, {
					xtype : 'numberfield',
					anchor : '100%',
					fieldLabel : '直通率',
					labelStyle : 'color:red;font-weight:bold;',
					readOnly : true
				} ]
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

	/**
	 * 计算直通率
	 */
	yieldChange : function(field, newValue, oldValue, eOpts) {

		var fieldSet = field.up('fieldset');

		var count = 0;
		var sum = 0;

		for (var i = 1; i <= 5; i++) {
			var tmp = fieldSet.getComponent(i).getValue();
			if (tmp > 0) {
				sum = tmp + sum;
				count = count + 1;
			}
		}

		fieldSet.getComponent(6).setValue(count == 0 ? 0 : (sum / count));
	},

	/**
	 * 设置社内番号的更新完成后跳到下一条模具讯息
	 */
	jumpNextModule : function() {
		var me = this.parent, self = this;

		me.moduleStore.getAt(self.nowIndex).set('issave', true);

		self.nowIndex++;
		// 再判断下一个Record是否为空,如果不为空,将其填充到Form中去
		var rcd = me.moduleStore.getAt(self.nowIndex);
		if (rcd) {
			self.form.getForm().loadRecord(rcd);
		} else {
			self.form.getForm().findField('modulecode').setValue(Ext.emptyString);
		}
		self.form.getForm().clearInvalid();
	},

	onSaveModuleInfo : function() {
		var me = this;
		var form = me.form.getForm();

		if (!form.isValid()) {
			return;
		}

		var record = form.getRecord();
		var values = form.getValues();

		var tableCol = me.parent.tableCol;

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
				modules : '{"modules":[' + App.dateReplaceToZone(Ext.JSON.encode(record.data)) + ']}'
			},
			method : "POST",
			success : function(response) {
				var res = Ext.JSON.decode(response.responseText);

				App.InterPath(res, function() {
					if (res.success) {
						// 将模具讯息从讯息栏中删除,添加下一个模具的讯息
						me.jumpNextModule();
						showSuccess("模具保存成功!");
					} else {
						if (res.flag == -1) {
							showError("没有任何模具要保存!");
						} else if (res.flag == -2) {
							showError("更新模具讯息失败,请联系管理员!");
						} else if (res.flag == -3) {
							showError("其他错误,请联系系统管理员!");
						}
					}
				});
			},
			failure : function() {
				showError("连接网络失败,请检查网络连接!");
				return;
			}
		});

	}

});
