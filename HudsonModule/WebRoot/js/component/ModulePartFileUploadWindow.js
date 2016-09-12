/**
 * 上传文件对话框,谷崧上传工件清单窗口
 */
Ext
		.define(
				'Project.component.ModulePartFileUploadWindow',
				{
					extend : 'Ext.window.Window',

					layout : 'border',
					// resizable : false,
					frame : true,
					iconCls : 'cog_add-16',
					modal : true,
					width : 950,
					height : 650,
					bodyPadding : 3,
					isPartImport : false,// 标注是否为零件导入
					modulelist : null,
					fileType : '',// 指定上传文件的类型
					downloadModeUrl : '',// 下载模板地址
					uploadUrl : '',// 上传文件地址
					/**
					 * 上传成功后处理方法<br>
					 * 参数:<br>
					 * window 文件上传对话框 <br>
					 * content 服务器响应结果
					 */
					successFunction : new Function(),// 
					initComponent : function() {
						var me = this;

						Ext
								.applyIf(
										me,
										{
											items : [
													{
														xtype : 'gridpanel',
														id : 'upload-modulecode-gridpanel',
														rootVisible : false,
														region : 'west',
														split : true,
														collapsible : true,
														hidden : me.isPartImport,
														width : 180,
														forceFit : true,
														title : '模具工号栏',
														store : Ext.create('Ext.data.Store', {
															fields : [ "modulebarcode", "modulecode" ],
															autoLoad : true,
															data : me.modulelist
														}),
														columns : [ {
															xtype : 'gridcolumn',
															forceFit : true,
															dataIndex : 'modulecode',
															text : '模具工号'
														} ],
													},
													{
														xtype : 'container',
														region : 'center',
														layout : 'border',
														bodyPadding : 3,
														items : [
																{
																	xtype : 'fieldset',
																	title : '零件讯息录入',
																	hidden : !me.isPartImport,
																	region : 'north',
																	layout : {
																		type : 'table',
																		columns : 4
																	},
																	defaults : {
																		padding : '0 5',
																		anchor : '100%'
																	},
																	items : [
																			{
																				id : 'mpfuw-module-type',
																				xtype : 'combobox',
																				width : 170,
																				allowBlank : false,
																				fieldLabel : '选择类型',
																				editable : false,
																				labelWidth : 65,
																				store : new Ext.data.Store({
																					autoLoad : true,
																					fields : [ {
																						name : 'typecode'
																					}, {
																						name : 'typename'
																					}, {
																						name : 'stateid'
																					} ],
																					data : [ {
																						typecode : 'P',
																						typename : '零件',
																						stateid : '20408'
																					}, {
																						typecode : 'Z',
																						typename : '治具',
																						stateid : '20409'
																					}, {
																						typecode : 'L',
																						typename : '量产',
																						stateid : '20410'
																					} ]
																				}),
																				listConfig : {
																					loadingText : 'Searching...',
																					getInnerTpl : function() {
																						return '<a class="search-item"><span style = \'color:purple;font-weight:bold\'>{typecode}</span>|<span>{typename}</span></a>';
																					}
																				},
																				valueField : 'typecode',
																				displayField : 'typename',
																				minChars : 1
																			},
																			{
																				id : 'mpfuw-guest-select',
																				xtype : 'combobox',
																				width : 170,
																				allowBlank : false,
																				fieldLabel : '选择客户',
																				labelWidth : 65,
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
																				displayField : 'shortname',
																				minChars : 1
																			}, {
																				id : 'mpfuw-inner-code',
																				xtype : 'textfield',
																				labelWidth : 65,
																				// width
																				// :
																				// 210,
																				fieldLabel : '社内番号',
																				maxLength : 30
																			}, {
																				id : 'mpfuw-module-guest',
																				xtype : 'textfield',
																				labelWidth : 65,
																				// width
																				// :
																				// 210,
																				fieldLabel : '客户番号',
																				maxLength : 30
																			}, {
																				id : 'mpfuw-module-start',
																				xtype : 'datefield',
																				labelWidth : 65,
																				fieldLabel : '开始时间',
																				width : 170,
																				editable : false,
																				allowBlank : false,
																				minValue : new Date(),
																				format : 'Y-m-d',
																				listeners : {
																					change : function(datefield, newValue) {
																						me.dateFieldBetween('mpfuw-module-end', newValue, false);
																					}
																				}
																			}, {
																				id : 'mpfuw-module-end',
																				xtype : 'datefield',
																				labelWidth : 65,
																				fieldLabel : '完成时间',
																				width : 170,
																				format : 'Y-m-d',
																				minValue : new Date(),
																				allowBlank : false,
																				editable : false,
																				listeners : {
																					change : function(datefield, newValue) {
																						me.dateFieldBetween('mpfuw-module-start', newValue, true);
																					}
																				}
																			}, {
																				id : 'mpfuw-module-class',
																				xtype : 'textfield',
																				labelWidth : 65,
																				// width
																				// :
																				// 210,
																				fieldLabel : '机种名',
																				maxLength : 30
																			}, {
																				id : 'mpfuw-module-prdname',
																				xtype : 'textfield',
																				labelWidth : 65,
																				// width
																				// :
																				// 210,
																				fieldLabel : '部品名称',
																				maxLength : 30
																			} ]
																},
																{
																	xtype : 'gridpanel',
																	id : 'upload-modulecode-part-gridpanel',
																	rootVisible : false,
																	region : 'center',
																	title : '导入工件讯息',
																	forceFit : true,
																	store : Ext.create('Ext.data.Store', {
																		fields : [ "partcode", "partname", "partcount", "norms", "material",
																				"piccode", "hardness", "buffing", "materialsrc", "materialtype",
																				"remark", "ismerge", "ismeasure", "isshop", "tolerance", "reform",
																				"fixed" ],
																		autoLoad : true
																	}),
																	bbar : [ {
																		text : '删除工件',
																		iconCls : 'gtk-clear-16',
																		handler : me.delSelParts
																	} ],
																	columns : [ {
																		xtype : 'gridcolumn',
																		dataIndex : 'partcode',
																		text : '工件编号',
																		width : 70
																	}, {
																		xtype : 'gridcolumn',
																		dataIndex : 'partname',
																		text : '工件名称',
																		width : 100
																	}, {
																		xtype : 'gridcolumn',
																		dataIndex : 'partcount',
																		width : 70,
																		text : '部件数量'
																	}, {
																		xtype : 'gridcolumn',
																		dataIndex : 'material',
																		width : 100,
																		text : '工件材质'
																	}, {
																		xtype : 'gridcolumn',
																		dataIndex : 'norms',
																		width : 80,
																		text : '工件规格'
																	}, {
																		xtype : 'gridcolumn',
																		dataIndex : 'piccode',
																		width : 80,
																		text : '图号',
																		hidden : true
																	}, {
																		xtype : 'gridcolumn',
																		dataIndex : 'hardness',
																		width : 80,
																		text : '硬度HRC',
																		hidden : true
																	}, {
																		xtype : 'gridcolumn',
																		dataIndex : 'buffing',
																		width : 80,
																		text : '表面处理',
																		hidden : true
																	}, {
																		xtype : 'gridcolumn',
																		dataIndex : 'tolerance',
																		width : 80,
																		text : '公差',
																		hidden : true
																	}, {
																		xtype : 'gridcolumn',
																		dataIndex : 'remark',
																		width : 150,
																		// hidden
																		// :
																		// !me.isPartImport,
																		text : '备注',
																		renderer : function(val) {
																			return (val ? '<b>' + val + '</b>' : val);
																		}
																	}, {
																		xtype : 'checkcolumn',
																		dataIndex : 'ismerge',
																		width : 60,
																		text : '区分编号'
																	}, {
																		xtype : 'checkcolumn',
																		dataIndex : 'ismeasure',
																		width : 60,
																		text : '是否测量',
																		hidden : true
																	}, {
																		xtype : 'checkcolumn',
																		dataIndex : 'materialsrc',
																		width : 50,
																		text : '外购',
																		hidden : true
																	}, {
																		xtype : 'checkcolumn',
																		dataIndex : 'fixed',
																		width : 50,
																		text : '固件'
																	}, {
																		xtype : 'checkcolumn',
																		dataIndex : 'materialtype',
																		width : 50,
																		text : '软料',
																		hidden : true
																	}, {
																		xtype : 'checkcolumn',
																		dataIndex : 'reform',
																		width : 50,
																		text : '标改',
																		hidden : true
																	} ],

																	selModel : Ext.create('Ext.selection.CheckboxModel', {
																		mode : 'SIMPLE'
																	})
																} ]
													}, {
														xtype : 'form',
														region : 'south',
														bodyPadding : 10,
														margins : '3 0 0 0',
														defaults : {
															anchor : '100%',
															allowBlank : false,
															msgTarget : 'side',
															labelWidth : 50
														},

														items : [ {
															xtype : 'filefield',
															id : 'form-file',
															emptyText : '请选择文件...',
															fieldLabel : 'Excel文档',
															labelWidth : 80,
															name : 'filePath',
															regex : new RegExp(me.fileType ? me.fileType : ''),
															regexText : "文件类型错误,请上传(" + me.fileType + ")格式文件!",
															buttonText : '',
															buttonConfig : {
																iconCls : 'filefind-16'
															}
														} ],

														buttons : [ {
															id : 'mpfuw-chk-partonly',
															xtype : 'checkbox',
															fieldLabel : '仅导入零件',
															labelWidth : 70
														}, '-', {
															text : '解析工件',
															iconCls : 'map_edit-16',
															scope : me,
															handler : me.parsePartFile
														}, '-', {
															text : '保存工件',
															iconCls : 'gtk-sort-descending-16',
															scope : me,
															handler : me.savePartInfo
														}, '-', {
															text : '取消',
															iconCls : 'xfce-system-exit-16',
															handler : function() {
																me.destroy();
															}
														} ]
													} ]
										});

						me.callParent(arguments);
					},
					/**
					 * 用于处理开始时间和结束时间之间的关系
					 */
					dateFieldBetween : function(id, value, flag) {
						var dateField = Ext.getCmp(id);
						dateVal = dateField.getValue();
						// FLAG为TRUE代表控件提供结束时间FALSE代表开始时间
						if (flag) {
							if (value < dateVal) {
								dateField.setValue(value);
							}

							// 如果开始时间的控件原本为空,则设置为默认时间
							if (!dateVal) {
								dateField.setValue(new Date());
							}

							dateField.setMaxValue(value);
							dateField.setMinValue(new Date());
						} else {
							if (value > dateVal) {
								dateField.setValue(value);
							}

							dateField.setMinValue(value);
						}
					},

					/**
					 * 删除不需要的工件讯息
					 */
					delSelParts : function() {
						Ext.Msg.confirm('确认', '确定要删除所选工件讯息?', function(y) {
							if (y == 'yes') {
								var grid = Ext.getCmp('upload-modulecode-part-gridpanel');
								var selRow = grid.getSelectionModel().getSelection();
								var store = grid.getStore();
								store.remove(selRow);
							}
						});
					},
					parsePartFile : function(button) {
						var self = this;
						if (!self.uploadUrl) {
							showError("没有指定指定提交地址!");
							return;
						}

						var form = button.up('form').getForm();
						if (!form.isValid()) {
							showError("提交的文件资料有缺失!");
							return;
						}

						form.submit({
							url : self.uploadUrl,
							waitMsg : '解析中,请稍候...',
							success : function(fp, action) {
								var res = Ext.JSON.decode(action.response.responseText);
								var store = Ext.getCmp('upload-modulecode-part-gridpanel').getStore();
								store.removeAll();
								store.add(res.list);
							},
							failure : function(form, action) {
								switch (action.failureType) {
								case Ext.form.action.Action.CLIENT_INVALID:
									Ext.Msg.alert('错误', '表单字段不得提交无效值');
									break;
								case Ext.form.action.Action.CONNECT_FAILURE:
									Ext.Msg.alert('错误', '与服务通信失败');
									break;
								case Ext.form.action.Action.SERVER_INVALID:
									Ext.Msg.alert('错误', action.result.msg);
								}
							}
						});
					},
					isPlusIntValue : function(num) {
						// 如果为空值,直接返回FALSE
						if (!num) {
							return (false);
						}
						// 如果不是数字,返回FALSE
						if (isNaN(num)) {
							return (false);
						}

						// 如果内容不全为数字,则返回FALSE
						var pat = /^\d+$/;
						if (!pat.test(num)) {
							return (false);
						}
						// 如果数字的值小于1,则返回FALSE
						if (parseInt(num) < 1) {
							return (false);
						}

						return (true);
					},
					getComboSelectRecord : function(combo, field) {
						return combo.getStore().findRecord(field, combo.getValue());
					},
					savePartInfo : function() {
						var self = this;
						var guestId = null, moduleInner = null, moduleClass = null, productName = null, moduleGuest = null, moduleStart = null, moduleEnd = null, moduleState = null, moduleType = null;
						// 声明模具讯息数组
						var moldlist = [];
						// 声明工件讯息数组
						var partlist = [];
						// 用于判断客户番号是否符合要求的正则表达式
						var pattern = /^\w(\w|[-])+$/;

						// 导入零件为TRUE,其他为FALSE
						if (self.isPartImport) {
							// 获取模具类型
							var moduleTypeCombo = Ext.getCmp('mpfuw-module-type');
							var moduleTypeValue = moduleTypeCombo.getValue();
							if (!moduleTypeValue) {
								showError('未选择模具类型!');
								return;
							}

							moduleType = moduleTypeValue;
							moduleState = self.getComboSelectRecord(moduleTypeCombo, 'typecode').get('stateid');

							// 获取选择客户的控件
							var guestSelCombo = Ext.getCmp('mpfuw-guest-select');
							var selRecord = self.getComboSelectRecord(guestSelCombo, 'factorycode');
							if (!selRecord) {
								showError('该客户的资料不存在!');
								return;
							}

							// 获取客户唯一号
							guestId = selRecord.get('guestid');

							// 获取模具的客户番号
							moduleGuest = Ext.getCmp('mpfuw-module-guest').getValue();
							// 获取社内编号
							moduleInner = Ext.getCmp('mpfuw-inner-code').getValue();

							// 如果社内编号和客户编号全都为空,则提示社内编号和客户编号不能同时为空
							if (!moduleInner && !moduleGuest) {
								showError('社内编号和客户番号至少有一个不能为空!');
								return;
							}

							// 客户番号必须负荷指定要求
							if (moduleGuest && (moduleGuest.length > 30 || !pattern.test(moduleGuest))) {
								showError('客户番号要求必须为2~30个字母,数字,中线的组合!');
								return;
							}
							// 社内番号必须负荷指定要求
							if (moduleInner && (moduleInner.length > 30 || !pattern.test(moduleInner))) {
								showError('社内编号要求必须为2~30个字母,数字,中线的组合!');
								return;
							}

							// 获取客户机种名
							moduleClass = Ext.getCmp('mpfuw-module-class').getValue();
							// 获取部品名称
							productName = Ext.getCmp('mpfuw-module-prdname').getValue();

							moduleStart = Ext.getCmp('mpfuw-module-start').getValue();
							moduleEnd = Ext.getCmp('mpfuw-module-end').getValue();

							if (!moduleStart) {
								showError('开始时间不允许为空!');
								return;
							}

							if (!moduleEnd) {
								showError('完成时间不允许为空!');
								return;
							}

						} else {
							// 获取模具的相关讯息
							var moduleRow = Ext.getCmp('upload-modulecode-gridpanel').getStore().getRange();
							for ( var x in moduleRow) {
								moldlist.push(moduleRow[x].get('modulebarcode'));
							}
						}

						// 获取所有的工件讯息
						var partRow = Ext.getCmp('upload-modulecode-part-gridpanel').getStore().getRange();
						// 如果零件为导入零件加工,则不用提示是否工件为空
						if (!self.isPartImport && !partRow.length) {
							showInfo('没有任何工件讯息!');
							return;
						}

						for ( var x in partRow) {
							if (!self.isPlusIntValue(partRow[x].get('partcount'))) {
								showError('第' + (++x) + '行的工件数量必须为数字!');
								return;
							}

							// 加载零件数据
							var itemData = partRow[x].getData();
							itemData.fixed = (itemData.fixed ? 1 : 0);

							partlist.push(itemData);
						}

						var partOnlyChk = Ext.getCmp('mpfuw-chk-partonly').getValue();

						Ext.Ajax.request({
							url : 'module/manage/saveExcelPartInfo',
							params : {
								ispart : self.isPartImport,
								guestid : guestId,
								modulestate : moduleState,
								moduletype : moduleType,
								moduleinner : moduleInner,
								moduleguest : moduleGuest,
								modulestart : moduleStart,
								productname : productName,
								moduleclass : moduleClass,
								moduleend : moduleEnd,
								moduleInfo : Ext.JSON.encode(moldlist),
								partInfo : Ext.JSON.encode(partlist),
								chk : partOnlyChk
							},
							method : 'POST',
							success : function(resp) {
								var backJson = Ext.JSON.decode(resp.responseText);
								if (backJson.success) {
									showSuccess('导入资料成功!');
									self.close();
								} else {
									showError(backJson.result);
								}
							},
							failure : function(x, y, z) {
								showError('连接服务器失败,请检查网络连接!');
								return;
							}
						});
					}
				});
