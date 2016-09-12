/**
 * 新模工件增加介面
 */
Ext.define('Module.ModuleNewPart', {
	extend : 'Ext.panel.Panel',

	title : '新模工件',
	layout : {
		type : 'border'
	},
	// 获取工件总数,其格式如下: (4|(4-10,2,3)(XYZ)[XYZ])
	partCreatePattern : /^(\d{1,2}|(\((\d{1,2}|(\d{1,2}-\d{1,2}))(,(\d{1,2}|(\d{1,2}-\d{1,2})))*\)))?(\([a-zA-Z]+\))?(\[[a-zA-Z]+\])?$/,
	// 工件代码的正则表达式
	partCodePattern : /^\d{1,2}$/,
	standardUnitCounter : 0,
	partAddNodeDataList : [],
	/** 以下暂时不用这种查询方式 2014-3-31 moduleCaseSet : new Ext.ModuleCaseOfPart(), */
	initComponent : function() {
		var me = this;
		Ext.apply(me, {
			items : [ {
				xtype : 'container',
				region : 'west',
				layout : 'border',
				width : 220,
				items : [ {
					xtype : 'gridpanel',
					id : 'design-module-list',
					region : 'center',
					rowLines : true,
					columnLines : true,
					tbar : [

					{
						text : '刷新新模',
						iconCls : 'search-16',
						handler : me.refreshNewModuleGrid
					}, '->', {
						text : '导入零件',
						iconCls : 'document-import-16',
						scope : me,
						handler : me.uploadModulePartFile
					} ],
					title : '模具工号',
					selModel : {
						mode : 'SIMPLE',
						toggleOnClick : false
					},
					selType : 'checkboxmodel',
					forceFit : true,
					flex : 1,
					store : Ext.create('Ext.data.Store', {
						autoLoad : false,
						fields : [ 'modulecode', 'modulebarcode', 'moduleresumeid' ],
						proxy : {
							type : 'ajax',
							url : 'module/manage/getNewModuleForPart',
							reader : {
								type : 'json',
								root : 'modules'
							}
						}
					}),
					columns : [ {
						xtype : 'gridcolumn',
						dataIndex : 'modulecode',
						text : '模具工号'
					} ]
				}, {
					xtype : 'gridpanel',
					id : 'select-module-list',
					region : 'south',
					rowLines : true,
					columnLines : true,
					// hideHeaders :
					// true,
					selModel : {
						mode : 'SIMPLE',
						toggleOnClick : false
					},
					selType : 'checkboxmodel',
					forceFit : true,
					flex : 1,
					store : Ext.create('Ext.data.Store', {
						autoLoad : false,
						fields : [ 'modulecode', 'modulebarcode', 'moduleresumeid' ]
					}),
					columns : [ {
						xtype : 'gridcolumn',
						dataIndex : 'modulecode',
						text : '模具工号'
					} ],
					dockedItems : [ {
						xtype : 'toolbar',
						dock : 'top',
						items : [ {
							iconCls : 'down-16',
							text : '选择模具',
							handler : function() {
								var design = Ext.getCmp('design-module-list');
								var select = Ext.getCmp('select-module-list');
								var designSel = design.getSelectionModel().getSelection();
								if (designSel && designSel.length) {
									design.getStore().remove(designSel);
									select.getStore().add(designSel);
								}
							}
						}, '-', {
							iconCls : 'up-16',
							text : '撤销模具',
							handler : function() {
								var design = Ext.getCmp('design-module-list');
								var select = Ext.getCmp('select-module-list');
								var selectSel = select.getSelectionModel().getSelection();
								if (selectSel && selectSel.length) {
									design.getStore().add(selectSel);
									select.getStore().remove(selectSel);
								}
							}
						} ]
					} ]
				} ]

			}, {

				xtype : 'treegrid',
				region : 'center',
				id : 'part-list-grid',
				margin : '0 0 0 5',
				title : '工件暂存',
				useArrows : true,
				rootVisible : false,
				selModel : {
					selType : 'checkboxmodel',
					mode : 'SIMPLE',
					toggleOnClick : false
				},
				rowLines : true,
				columnLines : true,
				// forceFit : true,
				store : new Ext.data.TreeStore({
					root : {
						text : 'root',
						expand : false
					},
					fields : [ 'partid', 'text', 'source', 'isfit', 'bodytxt', 'suffix', 'norms', 'count', 'type' ]
				}),
				columns : [ {
					xtype : 'treecolumn',
					dataIndex : 'text',
					width : 160,
					text : '工件名称'
				}, {
					xtype : 'gridcolumn',
					width : 100,
					dataIndex : 'partid',
					text : '工件编号'
				}, {
					xtype : 'gridcolumn',
					dataIndex : 'source',
					width : 100,
					text : '工件材质'
				}, {
					xtype : 'gridcolumn',
					dataIndex : 'norms',
					width : 120,
					text : '工件规格'
				}, {
					xtype : 'gridcolumn',
					dataIndex : 'count',
					text : '数量',
					width : 40,
					align : 'right'
				}, {
					xtype : 'checkcolumn',
					dataIndex : 'isfit',
					disabled : true,
					width : 40,
					text : '固件'
				} ],

				dockedItems : [ {
					xtype : 'toolbar',
					items : [ {
						xtype : 'fieldset',
						title : '添加工件',
						bodyPadding : 5,
						margin : '0 0 0 5',
						defaults : {
							width : 180,
							labelWidth : 60,
							style : "margin-left:10px;"
						},
						layout : {
							type : 'table',

							columns : 3
						},
						items : [ {
							id : 'part-type-txt',
							xtype : 'combobox',
							fieldLabel : '工件类型',

							valueField : 'classcode',
							displayField : 'chinaname',
							editable : false,
							store : new Ext.data.Store({
								proxy : {
									type : 'ajax',
									url : 'public/getPartRaceInfo',
									reader : {
										type : 'json',
										root : 'races'
									}
								},
								fields : [ 'classcode', 'chinaname' ]
							}),
							listeners : {
								select : me.onSelectPartType
							}
						}, {
							id : 'part-type-code',
							xtype : 'textfield',
							fieldLabel : '工件编号'
						}, {
							xtype : 'label'
						}, {
							id : 'part-list-name',
							xtype : 'textfield',
							fieldLabel : '工件名称'
						}, {
							id : 'part-list-source',
							xtype : 'textfield',
							fieldLabel : '工件材料'
						}, {
							id : 'part-list-norms',
							xtype : 'textfield',
							fieldLabel : '零件规格'
						}, {
							id : 'part-list-count',
							xtype : 'textfield',
							fieldLabel : '工件总数',
							regex : me.partCreatePattern
						}, {
							id : 'part-list-isfit',
							xtype : 'checkbox',
							fieldLabel : '是否固件'
						} ]

					} ]
				}, {
					xtype : 'toolbar',
					items : [ {
						text : '新增工件',
						iconCls : 'gtk-add-16',
						scope : me,
						handler : me.onCreateModulePart
					}, '-', {
						text : '删除工件',
						iconCls : 'gtk-remove-16',
						handler : function() {
							var listGrid = Ext.getCmp('part-list-grid');
							var selNode = listGrid.getSelectionModel().getSelection();
							if (!selNode.length) {
								return;
							}
							me.onClearSelectNodes(selNode);
						}
					}, '-', {
						text : '保存工件',
						iconCls : 'gtk-save-16',
						scope : me,
						handler : me.onSaveModuleNewPart
					} ]
				} ],
				width : '100%',
				flex : 2
			} ]
		});

		me.callParent(arguments);
	},

	/**
	 * 导入模具零件文件
	 */
	uploadModulePartFile : function() {
		var me = this;
		Ext.create('Project.component.FileUploadWindow', {
			title : '上传模具零件资料',
			fileType : '.xls|.xlsx',
			uploadUrl : 'module/manage/uploadModulePart',
			downloadModeUrl : 'template/module/module.xls',
			successFunction : function(window, content) {

				if (content.success) {
					window.destroy();
				}
				Fly.msg('信息', content.msg);
			}

		}).show();
	},

	onSelectPartType : function(combo, record, opts) {
		var val = combo.getValue();
		// 清空控件的值
		Ext.getCmp('part-type-code').setValue(val);
		me.onClearControlValues(this.up('panel'), [ 'part-list-count', 'part-list-norms', 'part-list-source', 'part-list-name' ]);

		Ext.getCmp('part-list-isfit').setDisabled(val == '9');

	},

	/**
	 * 刷新新模列表
	 */
	refreshNewModuleGrid : function() {
		this.up('grid').getStore().load();
	},

	onGetJsonProperties : function(json, properties) {
	},
	onClearSelectNodes : function(sels) {
		var me = this;
		Ext.Array.each(sels, function(node) {
			me.onDeleteMinNodes(node);
		});
	},
	onDeleteMinNodes : function(node) {
		// 如果node已经不存在,终止操作
		if (!node) {
			return;
		}

		// 如果节点为根节点,终止操作
		if (node.isRoot()) {
			return;
		}

		// 如果node的父节点已经不存在,终止操作
		if (!node.parentNode) {
			return;
		}

		// 如果树节点的同级节点数仅为其本身一个,则通过递归继续删除上一级节点
		var parentNode = node.parentNode;
		if (parentNode.childNodes.length == 1) {
			node.remove();
			this.onDeleteMinNodes(parentNode);
		} else {
			if (parentNode.childNodes.length) {
				parentNode.set('count', parentNode.childNodes.length - 1);
			}
			node.remove();
		}
	},

	/**
	 * 保存新模工件
	 */
	onSaveModuleNewPart : function() {

		var moduleStore = Ext.getCmp('select-module-list').getStore();
		if (!moduleStore.getCount()) {
			Fly.msg('提醒', '添加工件的模具不能为空!');
			return;
		}

		var treeNodes = Ext.getCmp('part-list-grid').getRootNode();

		if (treeNodes.length == 0) {
			Fly.msg('提醒', '模具的工件不能为空!');
			return;
		}

		App.Progress('新模工件建立中,请稍候...', '工件');
		var me = this;
		parts = {
			moduleParts : [],
			modulePartLists : []
		};
		var partNode;
		var partListNode;
		var moduleRecord;

		var partListIndex = 0;
		var childIndex = "";
		for (var i = 0; i < moduleStore.getCount(); i++) {
			moduleRecord = moduleStore.getAt(i);

			for ( var x in treeNodes.childNodes) {

				for ( var y in treeNodes.childNodes[x].childNodes) {
					partNode = treeNodes.childNodes[x].childNodes[y];

					// 解析出工件清单对象
					for ( var c in partNode.childNodes) {
						partListNode = partNode.childNodes[c];

						parts.modulePartLists.push({
							modulebarcode : moduleRecord.data.modulebarcode,
							partlistcode : partListNode.get('partid'),
							partrootcode : partListNode.get('bodytxt'),
							partlistbatch : partListNode.get('suffix'),
							modulecode : moduleRecord.data.modulecode,
							moduleresumeid : moduleRecord.data.moduleresumeid
						});

						// 用于存放工件清单所在的索引号
						childIndex = childIndex.concat(partListIndex++).concat(";");
					}

					// 解析出工件汇总对象
					parts.moduleParts.push({
						modulebarcode : moduleRecord.data.modulebarcode,
						cnames : partNode.get('text'),
						partcode : partNode.get('partid'),
						enames : '',
						raceid : '',
						norms : partNode.get('norms'),
						material : partNode.get('source'),
						applierid : '',
						quantity : partNode.get('count'),
						isfirmware : partNode.get('isfit') == 'true' ? 1 : 0,
						isbatch : '',
						childIndex : childIndex
					});

					childIndex = '';

				}
			}
		}

		// 假如获取的模具工件为空,则提示
		Ext.Ajax.request({
			url : 'module/manage/createModuleNewParts',
			method : 'POST',
			params : {
				parts : Ext.JSON.encode(parts)
			},
			success : function(response) {
				var res = JSON.parse(response.responseText);

				App.InterPath(res, function() {
					if (res.success) {
						Fly.msg('信息', res.msg);
						moduleStore.removeAll();
						treeNodes.removeAll();

					} else {
						Fly.msg('错误', "<span style='color:red;'>" + res.msg + "</span>");
					}

				});

				App.ProgressHide();

			},
			failure : function() {
				App.ProgressHide();

			}
		});

	},

	exeModuleQuery : function(url, paras, store, tip, errmsg) {
		Ext.Ajax.request({
			url : url,
			params : paras,
			method : 'POST',
			success : function(response) {
				store.removeAll();
				var backRows = Ext.JSON.decode(response.responseText);
				if (backRows.result) {
					store.add(backRows.rows);
				}
			},
			failure : function() {
				Fly.msg(tip, errmsg);
				return;
			}
		});
	},
	/**
	 * 将工件总数转换为工件的后缀
	 * 
	 * @param batch
	 * @param str
	 * @returns {Array}
	 */
	onPartCountFliter : function(str) {
		if (!str) {
			return [];
		}
		var len = str.length;
		if (len) {
			var itemList = [];
			// 声明存放不同命名方式的字串
			var indexList = this.onFliterSymbol(str, [ '[', ']', '(', ')' ]);
			if (!indexList.length) {
				var arrLen = parseInt(str);
				for (var x = 1; x < arrLen + 1; x++) {
					itemList.push('-' + x);
				}
			} else {
				var first = parseInt(indexList[0]);
				var arrLen = parseInt(str.substring(0, first));
				if (first) {
					for (var x = 1; x < arrLen + 1; x++) {
						itemList.push('-' + x);
					}

					for (var x = 0; x < (indexList.length / 2); x++) {
						var startOne = str[indexList[x * 2]];
						var items = str.substring(parseInt(indexList[2 * x]) + 1, parseInt(indexList[x * 2 + 1]));
						if (startOne == '(') {
							for ( var y in items) {
								if (!arrContains(itemList, '-' + items[y])) {
									itemList.push('-' + items[y]);
								}
							}
						} else {
							for ( var y in items) {
								if (!arrContains(itemList, items[y])) {
									itemList.push(items[y]);
								}
							}
						}
					}
				} else {
					if (str[first] == '(') {
						for (var x = 0; x < (indexList.length / 2); x++) {
							var startOne = str[indexList[x * 2]];
							var items = str.substring(parseInt(indexList[x * 2]) + 1, parseInt(indexList[x * 2 + 1]));
							if (startOne == '(') {
								if (isNaN(items[0])) {
									for ( var y in items) {
										if (!arrContains(itemList, '-' + items[y])) {
											itemList.push('-' + items[y]);
										}
									}
								} else {
									var itemCell = items.split(',');
									var cells = [];
									for ( var y in itemCell) {
										if (isNaN(itemCell[y])) {
											var max = 0, min = 0;
											var merges = itemCell[y].split('-');
											var posA = parseInt(merges[0]);
											var posB = parseInt(merges[1]);
											if (!posA && posB) {
												continue;
											}

											if (posA > posB) {
												max = posA;
												min = posB;
												if (!min) {
													min = 1;
												}
											} else {
												max = posB;
												min = posA;
												if (!min) {
													min = 1;
												}
											}

											for (var z = min; z < max + 1; z++) {
												for ( var m in cells) {
													if (cells[m] == z) {
														var isHas = false;
														break;
													}
												}
												if (!isHas) {
													cells.push(z);
												}
											}

										} else {
											var itemVal = parseInt(itemCell[y]);
											if (itemVal) {
												var isHas = false;
												for ( var z in cells) {
													if (cells[z] == itemVal) {
														var isHas = false;
														break;
													}
												}
												if (!isHas) {
													cells.push(itemVal);
												}
											}
										}
									}

									cells.sort(function(t, s) {
										if (t > s) {
											return 1;
										} else {
											return -1;
										}
									});

									for ( var k in cells) {
										itemList.push('-' + cells[k]);
									}
								}
							} else {
								for ( var y in items) {
									if (!arrContains(itemList, items[y])) {
										itemList.push(items[y]);
									}
								}
							}
						}
					} else {
						var items = str.substring(indexList[0] + 1, indexList[1]);
						for ( var y in items) {
							if (!arrContains(itemList, items[y])) {
								itemList.push(items[y]);
							}
						}
					}
				}
			}
			return itemList;
		}
		return [];
	},
	/**
	 * 过滤出某字符串所有指定符号所在的位置
	 * 
	 * @param str
	 * @param ignore
	 */
	onFliterSymbol : function(str, symbol) {
		if (!str || !symbol) {
			return [];
		}
		// 设置特殊符号
		var list = [];
		for ( var x in str) {
			for ( var y in symbol) {
				if (symbol[y] == str[x]) {
					list.push(x);
					break;
				}
			}
		}
		return list;
	},
	onClearControlValues : function(box, items) {
		if (box && items) {
			for ( var x in items) {
				var comp = box.getComponent(items[x]);
				if (comp) {
					comp.setValue('');
				}
			}
		}
	},

	/**
	 * 新增工件
	 */
	onCreateModulePart : function() {
		var me = this;
		var err = null;

		var typeCombo = Ext.getCmp('part-type-txt');
		if (!typeCombo.getValue()) {
			Fly.msg('提醒', '未选择工件类型!');
			return;
		}

		var partCode = Ext.getCmp('part-type-code');
		if (!partCode.getValue()) {
			Fly.msg('提醒', '请输入工件编号!');
			return;
		}

		var nameCombo = Ext.getCmp('part-list-name');
		if (!nameCombo.getValue() || nameCombo.getValue().length > 10) {
			Fly.msg('提醒', '工件名称字数必须在1-10字之间!');
			return;
		}

		var sourceCombo = Ext.getCmp('part-list-source');
		if (!sourceCombo.getValue() || sourceCombo.getValue().length > 15) {
			Fly.msg('提醒', '工件材质字数必须在1-15字之间!');
			return;
		}

		var normsCombo = Ext.getCmp('part-list-norms');

		// 统计总数量的编号输入栏
		var countCombo = Ext.getCmp('part-list-count');

		if (!countCombo.getValue()) {
			Fly.msg('提醒', '工件总数不能为空!');
			return;
		}

		err = countCombo.getErrors();
		if (err && err.length) {
			Fly.msg('提醒', '工件总数格式不正确!');
			return;
		}

		var fitCombo = Ext.getCmp('part-list-isfit');

		// 判断是否为标准件,如果为标准件数量必须为数字
		if (typeCombo.getValue() == 9) {
			if (isNaN(countCombo.getValue())) {
				Fly.msg('提醒', '标准件数量必须为数字!');
				return;
			}
		}

		// 获取TreeGrid树结构
		var listGrid = Ext.getCmp('part-list-grid');
		// 获取数的根节点
		var rootNode = listGrid.getRootNode();
		// 查找出该种类型的节点是否存在
		var typeNode = rootNode.findChild('partid', typeCombo.getValue());
		if (typeCombo.getValue() != 9) {
			// 获取生成的工件号集合
			var suffixList = me.onPartCountFliter(countCombo.getValue());
			if (!suffixList.length) {
				Fly.msg('提醒', '定义的工件数量为空!');
				return;
			}
			if (!typeNode) {
				var childNode = rootNode.createNode({
					partid : typeCombo.getValue(),
					text : typeCombo.getRawValue(),
					type : typeCombo.getValue(),
				});

				var groupNode = childNode.createNode({
					partid : partCode.getValue(),
					text : nameCombo.getValue(),
					source : sourceCombo.getValue(),
					count : suffixList.length,
					norms : normsCombo.getValue(),
					type : typeCombo.getValue()
				});

				for ( var x in suffixList) {
					groupNode.appendChild({
						partid : partCode.getValue() + suffixList[x].toUpperCase(),
						text : nameCombo.getValue(),
						source : sourceCombo.getValue(),
						isfit : fitCombo.getValue(),
						norms : normsCombo.getValue(),
						bodytxt : partCode.getValue(),
						suffix : suffixList[x].toUpperCase(),
						type : typeCombo.getValue(),
						leaf : true
					});
				}

				childNode.appendChild(groupNode);
				rootNode.appendChild(childNode);
			} else {
				// 判断有无组节点,如果未含有,则创建之
				var groupNode = typeNode.findChild('partid', partCode.getValue());
				if (!groupNode) {
					groupNode = typeNode.appendChild({
						partid : partCode.getValue(),
						text : nameCombo.getValue(),
						source : sourceCombo.getValue(),
						norms : normsCombo.getValue(),
						count : 0,
						type : typeCombo.getValue(),
					});
				}

				// 判断待添加的节点是否存在,若不存在,则创建之
				for ( var x in suffixList) {
					if (!groupNode.findChild('partid', partCode.getValue() + suffixList[x].toUpperCase())) {

						groupNode.appendChild({
							partid : partCode.getValue() + suffixList[x].toUpperCase(),
							text : nameCombo.getValue(),
							source : sourceCombo.getValue(),
							isfit : fitCombo.getValue(),
							bodytxt : partCode.getValue(),
							suffix : suffixList[x],
							norms : normsCombo.getValue(),
							type : typeCombo.getValue(),
							leaf : true
						});
						groupNode.set('count', groupNode.get('count') + 1);
					}
				}
			}

		} else {
			var childNode = null;
			if (!typeNode) {
				childNode = rootNode.createNode({
					partid : typeCombo.getValue(),
					text : partCode.getRawValue(),
					type : typeCombo.getValue()
				});
			} else {
				childNode = typeNode;
			}

			childNode.appendChild({
				partid : partCode.getValue() + leftPad(me.standardUnitCounter + '', 2, '0'),
				text : nameCombo.getValue(),
				source : sourceCombo.getValue(),
				norms : normsCombo.getValue(),
				isfit : fitCombo.getValue(),
				count : countCombo.getValue(),
				type : typeCombo.getValue(),
				leaf : true
			});

			rootNode.appendChild(childNode);

			me.standardUnitCounter++;
		}

		Ext.getCmp('part-list-norms').setValue('');
		Ext.getCmp('part-list-isfit').setValue(false);
	}
});

/**
 * 以下暂时不用这种查询方式 2014-3-31 <br> { text : '查询设定', iconCls : 'cog-16', handler :
 * function() { me.moduleCaseSet.show(); } }, '-', { text : '点击查询', iconCls :
 * 'search-16', handler : function() { if (!me.moduleCaseSet.setCase) {
 * Fly.msg('提醒', '请先设定查询条件!'); return; } var select =
 * Ext.getCmp('select-module-list'); var store =
 * Ext.getCmp('design-module-list').getStore(); if
 * (select.getStore().getCount()) { Ext.Msg.confirm('提醒',
 * '如果重新执行查询,原来的资料将被清空,是否继续?', function(e) { if (e == 'yes') {
 * select.getStore().removeAll();
 * me.exeModuleQuery('module/manage/getNewModuleForPart',
 * me.moduleCaseSet.setCase, store, "提醒", "连接网络失败"); } }); } else {
 * me.exeModuleQuery('module/manage/getNewModuleForPart',
 * me.moduleCaseSet.setCase, store, "提醒", "连接网络失败"); } } }
 * 
 * 查询条件设置框
 * 
 * Ext.define('Ext.ModuleCaseOfPart', { extend : 'Ext.window.Window',
 * closeAction : 'hide', height : 280, width : 300, modal : true, resizable :
 * false, layout : { align : 'stretch', type : 'vbox' }, defaults : { padding :
 * '3 5 0 5' }, title : '模具查询条件设定', // 寄存模具工号查询讯息内容 setCase : null, dataFields :
 * null, // 模具工号的输入格式 parseModulePattern : /^(\d|[,-])*$/, initComponent :
 * function() { var self = this; Ext.applyIf(self, { items : [ { id :
 * 'part-list-addtype', xtype : 'combobox', fieldLabel : '新增方式', labelWidth :
 * 60, valueField : 'id', displayField : 'tname', editable : false, value : 0,
 * store : new Ext.data.Store({ fields : [ 'id', 'tname' ], data : [ { id : 0,
 * tname : '新模新增' }, { id : 1, tname : '模具追加' } ] }) }, { id :
 * 'part-query-style', xtype : 'combobox', fieldLabel : '制作方式', labelWidth : 60, //
 * width : 140, valueField : 'styleNo', displayField : 'shortName', value :
 * 'KC', queryMode : 'local', triggerAction : 'all', store :
 * Ext.create('Ext.data.Store', { autoLoad : true, fields : [ 'styleNo',
 * 'shortName' ], data : [ { styleNo : 'KC', shortName : '内部制作' }, { styleNo :
 * 'KF', shortName : '外发制作' } ] }) }, { id : 'part-query-guest', xtype :
 * 'combobox', fieldLabel : '客户代号', labelWidth : 60, // padding : '0 0 0 2',
 * width : 190, store : new Ext.data.Store({ autoLoad : true, data : [], fields : [ {
 * name : 'factorycode' }, { name : 'shortname' } ] }), listConfig : {
 * loadingText : 'Searching...', getInnerTpl : function() { return '<a
 * class="search-item"><span style =\'color:red\'>{factorycode}</span>|<span>{shortname}</span></a>'; } },
 * queryMode : 'local', valueField : 'factorycode', displayField :
 * 'factorycode', triggerAction : 'all', listeners : { change :
 * self.getGuestCode } }, { id : 'part-create-year', xtype : 'combobox',
 * fieldLabel : '订单年份', labelWidth : 60, // padding : '0 0 0 2', width : 100,
 * valueField : 'moldYear', displayField : 'moldYear', value :
 * self.getNowYear(), store : Ext.create('Ext.data.Store', { fields : [
 * 'moldYear' ], autoLoad : true, data : self.onGetYears(-5, 1) }) }, { id :
 * 'part-create-month', xtype : 'combobox', fieldLabel : '订单月份', labelWidth :
 * 60, // padding : '0 0 0 2', width : 100, valueField : 'monthNo', displayField :
 * 'monthNo', value : self.getNowMonth(), store : Ext.create('Ext.data.Store', {
 * fields : [ 'monthId', 'monthNo' ], autoLoad : true, data : self.onGetMonths() }) }, {
 * id : 'part-list-batch', xtype : 'textfield', // padding : '0 0 0 2',
 * fieldLabel : '模具编号', labelWidth : 60 } ], buttons : [ { text : '保存设定',
 * iconCls : 'gtk-save-16', handler : function() { // 设定要 var addtypeCombo =
 * Ext.getCmp('part-list-addtype'); var moduleRelySel =
 * Ext.getCmp('module-rely-sel'); if (addtypeCombo.getValue()) {
 * moduleRelySel.setValue(false); moduleRelySel.setDisabled(true);
 * Ext.getCmp('part-list-grid').getRootNode().removeAll(); } else {
 * moduleRelySel.setDisabled(false);
 * Ext.getCmp('part-list-grid').getRootNode().removeAll(); }
 * 
 * var styleCombo = Ext.getCmp('part-query-style'); if (styleCombo.getValue() &&
 * !self.storeContains(styleCombo.getStore(), 'styleNo', styleCombo.getValue())) {
 * Fly.msg('提醒', '请选择完整的制作方式!'); return; }
 * 
 * var guestCombo = Ext.getCmp('part-query-guest'); if (guestCombo.getValue() &&
 * !self.storeContains(guestCombo.getStore(), 'factorycode',
 * guestCombo.getValue().toUpperCase())) { Fly.msg('提醒', '系统中不存在该模具的资料讯息!');
 * return; } var yearCombo = Ext.getCmp('part-create-year'); if
 * (yearCombo.getValue() && !self.storeContains(yearCombo.getStore(),
 * 'moldYear', yearCombo.getValue())) { Fly.msg('提醒', '请输入或者选择完整的年份!'); return; }
 * 
 * var monthCombo = Ext.getCmp('part-create-month'); if (monthCombo.getValue() &&
 * !self.storeContains(monthCombo.getStore(), 'monthNo', monthCombo.getValue())) {
 * Fly.msg('提醒', '请输入或者选择完整的月份!'); return; } var rs =
 * self.parseAllModules(Ext.getCmp('part-list-batch').getValue(), 10, 3, 100);
 * 
 * if (!styleCombo.getValue() && !guestCombo.getValue() && !yearCombo.getValue() &&
 * !monthCombo.getValue() && !rs.rows.length) { Fly.msg('提醒',
 * '系统中不存在该模具的资料讯息!'); return; } // 生成模具工号查询的JSON讯息 self.setCase = { style :
 * styleCombo.getValue() ? styleCombo.getValue() : '', guest :
 * guestCombo.getValue() ? guestCombo.getValue() : '', year :
 * yearCombo.getValue() ? yearCombo.getValue().substring(2) : '', month :
 * monthCombo.getValue() ? monthCombo.getValue() : '', batch :
 * Ext.JSON.encode(rs.rows), mode : addtypeCombo.getValue() };
 * 
 * self.dataFields = { listBatch : Ext.getCmp('part-list-batch').getValue() ?
 * Ext.getCmp('part-list-batch').getValue() : '' };
 * 
 * this.up('window').close(); } } ] });
 * 
 * self.callParent(arguments);
 * 
 * if (self.setCase) {
 * Ext.getCmp('part-list-addtype').setValue(self.setCase.mode);
 * Ext.getCmp('part-query-style').setValue(self.setCase.style);
 * Ext.getCmp('part-query-guest').setValue(self.setCase.guest);
 * Ext.getCmp('part-create-year').setValue(self.setCase.year);
 * Ext.getCmp('part-create-month').setValue(self.setCase.month);
 * Ext.getCmp('part-list-batch').setValue(self.dataFields.listBatch); } else {
 * Ext.getCmp('part-list-addtype').setValue(0);
 * Ext.getCmp('part-query-style').setValue('KC');
 * Ext.getCmp('part-query-guest').setValue('');
 * Ext.getCmp('part-create-year').setValue(self.getNowYear());
 * Ext.getCmp('part-create-month').setValue(self.getNowMonth());
 * Ext.getCmp('part-list-batch').setValue(''); } },
 * 
 * onGetYears : function(start, end) { var years = []; var nowDate = new Date();
 * for (var x = start; x < end; x++) { years.push({ moldYear :
 * Ext.util.Format.date(new Date(nowDate.getFullYear() + x,
 * 
 * nowDate.getMonth(), nowDate.getDay()), 'Y') }); } return years; },
 * onGetMonths : function() { var months = []; for (var x = 0; x < 12; x++) {
 * months.push({ monthId : x, monthNo : leftPad((x + 1) + '', 2, '0') }); }
 * return months; }, getNowMonth : function() { return Ext.util.Format.date(new
 * Date(), 'm'); },
 * 
 * getNowYear : function() { return Ext.util.Format.date(new Date(), 'Y'); },
 * storeContains : function(store, col, val) { try { var isHas = false; for (var
 * x = 0; x < store.getCount(); x++) { if (store.getAt(x).get(col) == val) {
 * isHas = true; break; } }
 * 
 * return isHas; } catch (e) { return (false); } }, parseAllModules :
 * function(str, base, pow, maxbatch) { if (!this.parseModulePattern.test(str)) {
 * return { result : false, flag : -1, rows : [] }; } else { var batchList = [];
 * var unit = str.split(','); for ( var x in unit) { if (!unit[x]) { continue; }
 * 
 * if (strContains(unit[x], '-')) { var item = unit[x].split('-'); var ival =
 * []; for ( var x in item) { if (item[x]) { if (parseInt(item[x]) >=
 * Math.pow(base, pow) || parseInt(item[x]) <= 0) { return { result : false,
 * flag : -2, rows : [] }; }
 * 
 * ival.push(parseInt(item[x])); } }
 * 
 * if (ival.length == 0) { continue; } else if (ival.length == 1) { if
 * (!arrContains(batchList, ival[0] + '')) { batchList.push(ival[0] + ''); } }
 * else { ival.sort(function(x, y) { return x - y; });
 * 
 * for (var x = ival[0]; x < ival[ival.length - 1] + 1; x++) { if
 * (!arrContains(batchList, x + '')) { batchList.push(x + ''); } }
 * 
 * if (batchList.length > maxbatch) { return { result : false, flag : -3, rows : [] }; } } }
 * else { var padBatch = parseInt(unit[x]) + ''; if (!arrContains(batchList,
 * padBatch)) { batchList.push(padBatch); } } }
 * 
 * return { result : true, flag : 1, rows : batchList }; } }, getGuestCode :
 * function(combo, newValue, oldValue, eOpts) { if (!newValue) {
 * combo.getStore().removeAll(); }
 * 
 * Ext.Ajax.request({ url : 'module/manage/queryGuestOfModuleCode', params : {
 * type : '02', query : newValue }, method : 'POST', success :
 * function(response) { var result = Ext.JSON.decode(response.responseText);
 * combo.getStore().loadData(result); }, failure : function() {
 * combo.getStore().loadData([]); } }); } });
 */
