Ext.define('ScrapPartsWindow', {
	extend : 'Ext.window.Window',

	frame : true,
	modal : true,
	height : 300,
	width : 300,
	title : '工件清除报废',
	partinfo : [],

	initComponent : function() {
		var me = this;

		Ext.applyIf(me, {
			items : [ {
				xtype : 'gridpanel',
				border : false,
				selType : 'checkboxmodel',
				columns : [ {
					dataIndex : 'partlistcode',
					text : '工件编号',
					width : 80
				}, {
					dataIndex : 'partname',
					text : '工件名称',
					width : 120
				}, {
					xtype : 'checkcolumn',
					dataIndex : 'isnew',
					text : '新规',
					width : 60
				} ],
				store : Ext.create('Ext.data.Store', {
					fields : [ 'partbarlistcode', 'partname', 'partlistcode', 'isnew' ],
					autoLoad : true,
					data : me.partinfo
				}),
				tbar : [ {
					text : '清除工件',
					iconCls : 'gtk-clear-16',
					handler : function() {
						var _grid = this.up('gridpanel');
						var _selRow = _grid.getSelectionModel().getSelection();
						_grid.getStore().remove(_selRow);
					}
				}, '-' ]
			} ]
		});

		me.callParent(arguments);
	},
	bbar : [ '->', {
		text : '保存资料',
		iconCls : 'accept-16',
		handler : function() {
			var _win = this.up('window');
			var _grid = _win.down('gridpanel');
			var _store = _grid.getStore();
			// 判断表格中的资料数量,如果为0则提示没有任何待删除的资料
			if (!_store.getCount()) {
				showInfo('没有任何待删除的工件讯息!');
				return;
			}
			// 获取DataGrid表单资料并解析成数据数组
			var _range = _store.getRange();
			var _data = [];
			for ( var x in _range) {
				_isXin = _range[x].get('isnew');
				_data.push({
					partbarlistcode : _range[x].get('partbarlistcode'),
					isnew : !_isXin ? false : true
				});
			}

			var _pstore = Ext.getCmp('cmnp-module-part-info').getStore();
			// 执行AJAX请求
			Ext.Ajax.request({
				url : 'module/part/delModulePartInfo',
				method : 'POST',
				params : {
					info : Ext.JSON.encode(_data)
				},
				success : function(res) {
					var backJson = Ext.JSON.decode(res.responseText);
					if (backJson.success) {
						showInfo('操作成功!');
						_win.close();
						_pstore.reload();
						return;
					} else {
						showError(backJson.msg);
					}
				},
				failure : function(x, y, z) {
					showError('连接网络失败,请检查网络连接!');
					return;
				}
			});
		}
	}, '-', {
		text : '关闭窗口',
		iconCls : 'cross-16',
		handler : function() {
			this.up('window').close();
		}
	} ]

});
/**
 * 新模工件增加介面
 */
Ext.define('Module.CoxonModuleNewPart', {
	extend : 'Ext.panel.Panel',

	title : '新模工件',
	layout : {
		type : 'border'
	},
	border : false,
	// 获取工件总数,其格式如下: (4|(4-10,2,3)(XYZ)[XYZ])
	partCreatePattern : /^(\d{1,3}|(\((\d{1,3}|(\d{1,3}-\d{1,3}))(,(\d{1,3}|(\d{1,3}-\d{1,3})))*\)))?(\([a-zA-Z]+\))?(\[[a-zA-Z]+\])?$/,
	// 工件代码的正则表达式
	partCodePattern : /^\d{1,2}$/,
	standardUnitCounter : 0,
	partAddNodeDataList : [],
	/** 用于临时存放工件的详细信息 Date:2015-03-06 Modifier:Rock */
	tempPartListCodeInfo : null,
	/** 以下暂时不用这种查询方式 2014-3-31 moduleCaseSet : new Ext.ModuleCaseOfPart(), */
	initComponent : function() {
		var me = this;
		Ext.apply(me, {
			items : [
					{
						xtype : 'container',
						region : 'west',
						layout : 'border',
						split : true,
						width : 300,
						items : [ {
							xtype : 'gridpanel',
							id : 'design-module-list',
							region : 'center',
							rowLines : true,
							columnLines : true,
							dockedItems : [ {
								xtype : 'toolbar',
								items : [ {
									id : 'cmnp-chk-by-guest',
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
								} ]
							}, {
								xtype : 'toolbar',
								dock : 'bottom',
								items : [ {
									text : '增番复制',
									iconCls : 'gtk-copy-16',
									scope : me,
									handler : me.openCopyWindow
								}, '-', {
									text : '导入零件',
									iconCls : 'document-import-16',
									scope : me,
									handler : function() {
										me.uploadModulePartFile(false);
									}
								}, '-', {
									text : '零件加工',
									iconCls : 'cog_go-16',
									isPartImport : true,
									scope : me,
									handler : function() {
										me.uploadModulePartFile(true);
									}
								} ]
							} ],
							title : '模具工号',
							selModel : {
								mode : 'MULTI',
								toggleOnClick : false
							},
							selType : 'checkboxmodel',
							forceFit : true,
							flex : 1,
							store : Ext.create('Ext.data.Store', {
								autoLoad : true,
								fields : [ "endtime", "starttime", "modulebarcode", 'modulecode', "guestcode", "resumename", "resumestate", "text",
										"id", 'installer', 'deviser' ],
								proxy : {
									type : 'ajax',
									url : '',
									reader : {
										type : 'json',
										root : 'children'
									}
								}
							}),
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

							listeners : {
								itemdblclick : me.getModulePartInformation
							}
						} ]

					}, {
						xtype : 'panel',
						region : 'center',
						title : '工件清单',
						layout : 'border',
						defaults : {
							padding : 3
						},
						split : true,
						items : [ {
							xtype : 'panel',
							// title : '添加工件',
							region : 'north',
							bbar : [ {
								id : 'part-basic-select',
								xtype : 'checkboxgroup',
								defaults : {
									width : 80
								},
								items : [ {
									boxLabel : '是否固件',
									name : 'item',
									inputValue : 0
								}, {
									boxLabel : '材料外购',
									name : 'item',
									inputValue : 1,
									hidden : true
								}, {
									boxLabel : '是否软料',
									name : 'item',
									inputValue : 2,
									hidden : true
								}, {
									boxLabel : '是否标改',
									name : 'item',
									inputValue : 3,
									hidden : true
								}, {
									boxLabel : '零件外购',
									name : 'item',
									inputValue : 4,
									hidden : true
								} ]
							} ],
							defaults : {
								labelWidth : 65,
								padding : '0 5'
							},
							bodyPadding : 5,
							layout : {
								type : 'table',
								columns : 3
							},
							items : [ {
								id : 'part-module-code',
								xtype : 'textfield',
								fieldLabel : '模具工号',
								readOnly : true
							}, {
								id : 'part-type-txt',
								xtype : 'combobox',
								fieldLabel : '工件类型',
								valueField : 'id',
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
									fields : [ 'id', 'classcode', 'chinaname' ]
								})
							}, {
								id : 'part-type-code',
								xtype : 'textfield',
								fieldLabel : '工件编号'
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
								fieldLabel : '零件规格',
								value : '参考图纸'
							}, {
								id : 'part-list-piccode',
								xtype : 'textfield',
								fieldLabel : '零件图号'
							}, {
								id : 'part-list-hardness',
								xtype : 'textfield',
								fieldLabel : '硬度HRC'
							}, {
								id : 'part-list-buffing',
								xtype : 'textfield',
								fieldLabel : '表面处理'
							}, {
								id : 'part-list-tolerance',
								xtype : 'textfield',
								fieldLabel : '公差(±0.3)'
							}, {
								id : 'part-list-count',
								xtype : 'textfield',
								fieldLabel : '工件总数',
								regex : me.partCreatePattern,
								value : 1
							}, {
								id : 'part-list-split',
								xtype : 'combobox',
								fieldLabel : '编号规则',
								displayField : 'name',
								valueField : 'id',
								store : Ext.create('Ext.data.Store', {
									fields : [ 'id', 'name' ],
									autoLoad : true,
									data : [ {
										id : 0,
										name : '合并编号'
									}, {
										id : 1,
										name : '区分编号'
									} ]
								}),
								editable : false,
								value : 0
							} ]

						}, Ext.create('ModulePartTreePanel', {
							region : 'center',
							title : '模具工件',
							id : 'cmnp-module-part-info',
							moduleInfo : null,
							listeners : {
								itemdblclick : function(grid, record) {
									Ext.getCmp('part-type-txt').setValue(record.get('raceid'));
									Ext.getCmp('part-type-code').setValue(record.get('partcode'));
									Ext.getCmp('part-list-name').setValue(record.get('partname'));
									Ext.getCmp('part-list-source').setValue(record.get('material'));
									Ext.getCmp('part-list-norms').setValue(record.get('norms'));

									Ext.getCmp('part-list-hardness').setValue(record.get('hardness'));
									Ext.getCmp('part-list-buffing').setValue(record.get('buffing'));
									Ext.getCmp('part-list-tolerance').setValue(record.get('tolerance'));
									Ext.getCmp('part-list-piccode').setValue(record.get('piccode'));

									var checkCol = [ 'isfixed', 'materialsrc', 'materialtype', 'reform', 'isfirmware' ];
									var chkdata = [];

									for ( var x in checkCol) {
										var itemVal = parseInt(record.get(checkCol[x]));
										if (itemVal) {
											chkdata.push(parseInt(x));
										}
									}

									var partSel = Ext.getCmp('part-basic-select');
									partSel.reset();

									if (chkdata.length) {
										partSel.setValue({
											item : chkdata
										});
									}

									// Ext.getCmp('part-list-isfit').setValue(record.get('isfirmware')
									// > 0);

									me.tempPartListCodeInfo = record.getData();
								}
							}
						}) ]
					} ]
		});

		Ext.getCmp('cmnp-module-part-info').getStore().removeAll();
		me.callParent(arguments);
	},

	/**
	 * 新模或修模/设变
	 */
	onResumeModule : function(ctrl, nw) {
		var item = this;
		var chk = Ext.getCmp('cmnp-chk-by-guest').getValue();
		item.up('gridpanel').getStore().load({
			url : 'public/getModuleResumeInfoByCase',
			params : {
				chk : chk,
				query : (item.isTxt ? nw : null),
				states : item.states
			}
		});
	},
	getModulePartInformation : function(grid, record) {
		var cmnpGrid = Ext.getCmp('cmnp-module-part-info');
		Ext.getCmp('part-module-code').setValue(record.get('modulecode'));
		cmnpGrid.moduleInfo = record;

		cmnpGrid.getStore().load({
			url : 'module/manage/getModulePartInformation',
			params : {
				modulebarcode : record.get('modulebarcode')
			}
		});
	},

	/**
	 * 选择模具工件时,相应的模具工号选中
	 */
	modulePartSelect : function(tabPanel, newCard, oldCard, eOpts) {
		var grid = Ext.getCmp('design-module-list');
		var moduleStore = grid.getStore();
		var moduleModel = grid.getSelectionModel();

		if (moduleStore) {
			var record = moduleStore.getById(newCard.getId().replace('part-', ''));
			moduleModel.select(record);

		}
	},
	/**
	 * 导入模具零件文件
	 */
	uploadModulePartFile : function(isPart) {
		// 用于存放模具工号的数组
		var list = [];
		// 获取模具讯息栏中的模具工号
		if (!isPart) {
			var moldlist = Ext.getCmp('design-module-list');
			var rows = moldlist.getSelectionModel().getSelection();
			if (!rows.length) {
				showInfo('请选择模具工号!');
				return;
			}

			for ( var x in rows) {
				list.push({
					modulebarcode : rows[x].get('modulebarcode'),
					modulecode : rows[x].get('text')
				});
			}
		}

		Ext.create('Project.component.ModulePartFileUploadWindow', {
			title : (isPart ? '零件加工清单' : '模具加工清单'),
			fileType : '.xls|.xlsx',
			modulelist : list,
			isPartImport : isPart,
			uploadUrl : 'module/manage/uploadModulePartBom',
			successFunction : function(window, content) {
				if (content.success) {
					window.destroy();
				}

				Fly.msg('信息', content.msg);
			}

		}).show();
	},
	// TODO 开启复制模具工件面板
	openCopyWindow : function() {
		var selRows = Ext.getCmp('design-module-list').getSelectionModel().getSelection();
		if (!selRows.length) {
			showInfo('未选中任何模具工号!');
			return;
		}

		var selRowInfo = [];
		for ( var x in selRows) {
			selRowInfo.push({
				modulebarcode : selRows[x].get('modulebarcode'),
				modulecode : selRows[x].get('text')
			});
		}

		Ext.create('Module.CopyModulePartInfo', {
			id : 'cnmp-window-copy-module',
			moduleInfo : selRowInfo
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

		var treeNodes = Ext.getCmp('module-new-part-tab-panel').getRootNode();

		if (treeNodes.length == 0) {
			Fly.msg('提醒', '模具的工件不能为空!');
			return;
		}

		App.Progress('新模工件建立中,请稍候...', '工件');
		// var me = this;
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
		var listGrid = Ext.getCmp('module-new-part-tab-panel');
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
 * 模具工件显示面板
 */
Ext.define('ModulePartTreePanel', {
	extend : 'Ext.grid.Panel',
	useArrows : true,
	rootVisible : false,
	selModel : {
		selType : 'checkboxmodel',
		mode : 'SIMPLE',
		toggleOnClick : false
	},
	moduleMsg : null,
	tbar : [ {
		text : '新增工件',
		iconCls : 'add-16',
		handler : function() {
			this.up('gridpanel').onGetModuleWorkPieces();
			// new PartListPreview().show();
		}
	}, '-', {
		text : '修改数量',
		iconCls : 'brick_edit-16',
		handler : function() {
			var _grid = this.up('gridpanel');
			_grid.onModifyPartCount(_grid);
		}
	}, '-', {
		text : '清空讯息',
		iconCls : 'gtk-clear-16',
		handler : function() {
			this.up('gridpanel').onClearAllPartInfo();
		}
	}, '-', {
		text : '清除报废',
		iconCls : 'cog_delete-16',
		handler : function() {
			this.up('gridpanel').onOpenScrapWindow();
		}
	}, '-', {
		text : '修模设变',
		iconCls : 'wrench-16',
		handler : function() {
			this.up('gridpanel').onGetModuleSection();
		}

	} ],
	rowLines : true,
	columnLines : true,
	// forceFit : true,
	store : new Ext.data.Store({
		fields : [ 'modulebarcode', 'partbarcode', 'partname', 'material', 'norms', 'parttype', 'partbarlistcode', 'partlistcode', 'partsuffix',
				'materialsrc', 'hardness', 'materialtype', 'reform', 'buffing', 'tolerance', 'raceid', 'partcode', 'isuse', 'isfixed', 'piccode',
				'isfirmware', 'pstname', 'deptname', 'batchno', 'empname', 'rid' ],
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
		getRowClass : function(record, rowIndex, rowParams, store) {
			if (record.get('isuse')) {
				return 'state-20210';
			}
		}
	},
	columns : [ {
		xtype : 'gridcolumn',
		dataIndex : 'partname',
		width : 120,
		text : '工件名称'
	}, {
		xtype : 'gridcolumn',
		width : 100,
		dataIndex : 'partlistcode',
		text : '工件编号'
	}, {
		xtype : 'gridcolumn',
		dataIndex : 'piccode',
		width : 100,
		text : '图号',
		hidden : true
	}, {
		xtype : 'gridcolumn',
		dataIndex : 'material',
		width : 100,
		text : '工件材质'
	}, {
		xtype : 'gridcolumn',
		dataIndex : 'norms',
		width : 100,
		text : '工件规格'
	}, {
		xtype : 'gridcolumn',
		dataIndex : 'hardness',
		width : 100,
		text : '硬度HRC',
		hidden : true
	}, {
		xtype : 'gridcolumn',
		width : 40,
		dataIndex : 'isfixed',
		text : '固件',
		align : 'center',
		renderer : function(val) {
			return (val ? '<font color = red>是</font>' : '否');
		}
	}, {
		xtype : 'gridcolumn',
		dataIndex : 'pstname',
		width : 80,
		text : '工件状态',
		align : 'center',
		renderer : function(val, meta, record) {
			var rid = record.get('rid');
			if (rid) {
				return (val ? val : '未接收');
			}

			return '未加工';
		}
	}, {
		xtype : 'gridcolumn',
		dataIndex : 'deptname',
		width : 100,
		text : '所在单位',
		align : 'center'
	}, {
		xtype : 'gridcolumn',
		dataIndex : 'batchno',
		width : 80,
		text : '机台编号',
		align : 'center'
	}, {
		xtype : 'gridcolumn',
		dataIndex : 'empname',
		width : 80,
		text : '操机员'
	}, {
		xtype : 'checkcolumn',
		dataIndex : 'isfirmware',
		width : 40,
		text : '外购'
	} ],
	onClearAllPartInfo : function() {
		Ext.getCmp('part-type-txt').setValue(Ext.emptyString);
		Ext.getCmp('part-type-code').setValue(Ext.emptyString);
		Ext.getCmp('part-list-name').setValue(Ext.emptyString);
		Ext.getCmp('part-list-norms').setValue('参考图纸');
		Ext.getCmp('part-list-source').setValue(Ext.emptyString);
		Ext.getCmp('part-list-count').setValue(Ext.emptyString);
		Ext.getCmp('part-list-isfit').setValue(false);
	},
	onGetModuleSection : function() {
		// 获取工件所在的GridView
		var _gridview = this;
		// 获取模具讯息
		var _selMold = _gridview.moduleInfo;
		if (!_selMold) {
			showError('未选择任何模具的工件资料!');
			return;
		}
		// 获取GridView选择的行
		var _selRow = _gridview.getSelectionModel().getSelection();
		// if (!_selRow.length) {
		// showError('未选择任何工件讯息!');
		// return;
		// }

		var _partlist = [];
		for ( var x in _selRow) {
			_partlist.push({
				partbarlistcode : _selRow[x].get('partbarlistcode'),
				partname : _selRow[x].get('partname'),
				partlistcode : _selRow[x].get('partlistcode'),
				mrsid : '',
				secid : '',
				remark : '',
				isfixed : _selRow[x].get('isfixed'),
				isnew : true
			});
		}
		new Module.ModuleResumeWindow({
			moduleInfo : _selMold.getData(),
			partInfo : _partlist
		}).show();
	},
	onGetModuleWorkPieces : function() {
		var me = this;
		// 如果未选择模具工号,返回提醒
		if (!me.moduleInfo) {
			Fly.msg('警告', '未选择任何模具工号!');
			return;
		}

		// 工件类型
		var parttypetxt = Ext.getCmp('part-type-txt').getValue();
		// if (!trimAll(parttypetxt)) {
		// Fly.msg('警告', '未选择工件类型!');
		// return;
		// }
		// 工件编号
		var parttypecode = Ext.getCmp('part-type-code').getValue();
		if (!trimAll(parttypecode)) {
			Fly.msg('警告', '工件编号不能为空!');
			return;
		}
		// 工件名称
		var partlistname = Ext.getCmp('part-list-name').getValue();
		// if (!trimAll(partlistname)) {
		// Fly.msg('警告', '工件名称不能为空!');
		// return;
		// }
		// 工件材质
		var partlistsource = Ext.getCmp('part-list-source').getValue();
		if (!trimAll(partlistsource)) {
			Fly.msg('警告', '工件材质不能为空!');
			return;
		}
		// 工件规格
		var partlistnorms = Ext.getCmp('part-list-norms').getValue();
		// 工件数量
		var partlistcount = Ext.getCmp('part-list-count').getValue();
		if (!trimAll(partlistcount)) {
			Fly.msg('警告', '工件数量不能为空!');
			return;
		}
		// 是否区分编号
		var partlistsplit = Ext.getCmp('part-list-split').getValue();
		// 是否固件
		// var partlistfit = Ext.getCmp('part-list-isfit').getValue();
		var partlistbasic = Ext.getCmp('part-basic-select').getValue();

		var piccode = Ext.getCmp('part-list-piccode').getValue();
		var hardness = Ext.getCmp('part-list-hardness').getValue();
		var buffing = Ext.getCmp('part-list-buffing').getValue();
		var tolerance = Ext.getCmp('part-list-tolerance').getValue();

		// 发送至后台的讯息
		var sendJson = {
			modulebarcode : me.moduleInfo.data.modulebarcode,
			moduleresume : me.moduleInfo.data.id,
			parttypetxt : parttypetxt,
			parttypecode : parttypecode,
			parttypename : partlistname,
			parttypesource : partlistsource,
			parttypenorms : partlistnorms,
			parttypecount : partlistcount,
			// parttypefit : partlistfit,
			parttypebasic : Ext.JSON.encode(partlistbasic.item),
			parttypesplit : partlistsplit,
			piccode : piccode,
			hardness : hardness,
			buffing : buffing,
			tolerance : tolerance
		};

		Ext.Ajax.request({
			url : 'module/manage/getModuleWorkPieces',
			method : 'POST',
			params : {
				info : Ext.JSON.encode(sendJson),
				flag : 0
			},
			success : function(resp) {
				var r_list = Ext.JSON.decode(resp.responseText);
				if (!r_list.result) {
					Fly.msg('错误', '生成工件编号失败!');
					return;
				}

				new PartListPreview({
					moldInfo : {
						modulebarcode : me.moduleInfo.data.modulebarcode,
						moduleresumeid : r_list.resumeid,
						moldstateid : r_list.resumestate,
						sendInfo : sendJson
					}
				}).show();

				// 设置模具的履历状态
				Ext.getCmp('cnmn-process-typeid').setValue(r_list.resumestate);
				// 获取工件List
				var t_store = Ext.getCmp('cnmn-part-list').getStore();

				t_store.removeAll();
				t_store.add(r_list.queryList);
			},
			failure : function(x, y, z) {
				Fly.msg('错误', '连接服务器失败,请检查网络连接!');
				return;
			}
		});
	},
	onModifyPartCount : function(grid) {
		var pcode = grid.ownerCt.ownerCt.tempPartListCodeInfo.partbarlistcode;
		var pcount = Ext.getCmp('part-list-count').getValue();

		Ext.Msg.confirm('确认', '是否确定要修改工件数量?', function(r) {
			if (r == 'yes') {
				Ext.Ajax.request({
					url : 'module/manage/onModifyPartCount',
					method : 'POST',
					params : {
						pcode : pcode,
						pcount : pcount
					},
					success : function(resp) {
						var rst = Ext.JSON.decode(resp.responseText);
						if (rst.success) {
							showSuccess('修改成功!');
							grid.getStore().reload();
						} else {
							if (rst.result == -1) {
								showError('该工件已经不存在了!');
							} else if (rst.result == -2) {
								showError('工件数量必须在1-200之内!');
							} else if (rst.result == -3) {
								showError('区分编号的工件不能修改数量!');
							} else if (rst.result == -4) {
								showError('修改工件数量失败!');
							} else {
								showError('请确保输入的讯息完整并且网络畅通!');
							}
						}
					},
					failure : function(x, y, z) {
						showError('更新工件数量失败!');
					}
				});
			}
		});
	},
	onOpenScrapWindow : function() {
		var _grid = this;
		var selRows = _grid.getSelectionModel().getSelection();
		if (!selRows.length) {
			showInfo('没有选中要删除的工件讯息!');
			return;
		}

		new ScrapPartsWindow({
			partinfo : selRows
		}).show();
	}
});

Ext.define("HistoryResumeModel", {
	extend : 'Ext.data.Model',
	fields : [ 'resumeid', 'resumename', "resumestate", "update", {
		name : 'newup',
		type : "bool"
	}, {
		name : 'starttime',
		type : 'date'
	}, {
		name : 'endtime',
		type : 'date'
	}, 'mdremark', {
		name : "children",
		type : "object"
	} ]
});

/**
 * 设变信息窗口
 */
Ext
		.define(
				'Module.ModuleResumeWindow',
				{
					extend : 'Ext.window.Window',
					height : 540,
					width : 730,
					layout : {
						type : 'border'
					},
					title : "设变/修模信息",
					bodyPadding : 5,
					resumeStore : Ext.create('Ext.data.Store', {
						model : 'HistoryResumeModel',
						autoLoad : false,
						proxy : {
							type : 'ajax'
						}
					}),
					partStore : Ext.create('Ext.data.Store', {
						fields : [ 'partbarlistcode', 'partlistcode', 'mrsid', 'secid', 'partname', 'remark', 'isfixed', 'isnew' ],
						autoLoad : true
					}),

					selectPartRecord : null,
					selRowIndex : -1,
					resumeRecord : null,
					moduleInfo : null,
					partInfo : [],
					form : null,
					resizable : false,
					required : '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>',
					modal : true,
					nowTime : new Date(),
					initComponent : function() {
						var me = this;

						Ext
								.applyIf(
										me,
										{
											items : [ {
												xtype : 'container',
												layout : 'border',
												region : 'center',
												items : [
														{
															xtype : 'fieldset',
															layout : 'border',
															region : 'center',
															title : '设变/修模工件信息',
															items : [ {
																id : 'main-module-section-partlist',
																xtype : 'gridpanel',
																region : 'center',
																selModel : {
																	selType : 'checkboxmodel',
																	mode : 'SIMPLE'
																},
																store : me.partStore,
																viewConfig : {
																	getRowClass : function(record, rowIndex, p, store) {
																		if (record.get('isnew')) {
																			return 'state-20201';
																		}
																		return '';
																	}
																},
																forceFit : true,
																tbar : [ {
																	frame : true,
																	text : '工件重置',
																	iconCls : 'wand-16',
																	handler : function() {
																		this.up('gridpanel').getStore().loadData(me.partInfo);
																		me.selRowIndex = -1;

																		Ext.getCmp('main-module-section-select').setValue(Ext.emptyString);
																		Ext.getCmp('main-module-section-state').setValue(Ext.emptyString);
																		Ext.getCmp('main-module-section-startdate').setValue(new Date());
																		Ext.getCmp('main-module-section-starttime').setValue(new Date());
																		Ext.getCmp('main-module-section-enddate').setValue(Ext.emptyString);
																		Ext.getCmp('main-module-section-endtime').setValue(Ext.emptyString);
																		Ext.getCmp('main-module-section-intro').setValue(Ext.emptyString);
																	}
																}, '-', {
																	text : '新规',
																	iconCls : 'cog_add-16',
																	field : 'remark',
																	value : '新规',
																	def : false,
																	handler : me.initRemark
																}, '-', {
																	text : '追加工',
																	iconCls : 'cog_go-16',
																	field : 'remark',
																	value : '追加工',
																	def : false,
																	handler : me.initRemark
																}, '-', {
																	text : '设默认',
																	def : true,
																	iconCls : 'wand-16',
																	field : 'remark',
																	value : '',
																	handler : me.initRemark
																} ],
																columns : [ {
																	xtype : 'gridcolumn',
																	dataIndex : 'partbarlistcode',
																	width : 120,
																	text : '工件条码号',
																	renderer : me.renderHaveRemark
																}, {
																	xtype : 'gridcolumn',
																	dataIndex : 'partlistcode',
																	text : '工件编号',
																	renderer : me.renderHaveRemark
																}, {
																	xtype : 'gridcolumn',
																	dataIndex : 'remark',
																	text : '备注说明',
																	renderer : me.renderHaveRemark
																}, {
																	xtype : 'gridcolumn',
																	dataIndex : 'partname',
																	text : '工件名称',
																	renderer : me.renderHaveRemark
																}, {
																	xtype : 'actioncolumn',
																	width : 20,
																	items : [ {
																		iconCls : 'dialog-cancel-16',
																		tooltip : '移除工件',
																		scope : me,
																		handler : me.onClickRemovePart
																	} ]
																} ],
																listeners : {
																	scope : me,
																	itemclick : me.onClickPartRemark
																}
															}, {
																xtype : 'textareafield',
																id : 'main-part-process-remark-id',
																region : 'east',
																emptyText : '工件(设变/修模)说明(200字)',
																style : 'margin-left:5px;',
																maxLength : 200,
																labelAlign : 'top',
																labelWidth : 100,
																width : 160,
																labelStyle : 'margin-bottom:3px;',
																listeners : {
																	scope : me,
																	blur : me.onRecordPartRemark
																}
															} ]
														},
														{
															xtype : 'form',
															border : 0,
															margin : '5 0 0 0',
															region : 'north',
															layout : 'border',
															height : 180,
															items : [ {
																xtype : 'fieldset',
																region : 'center',
																fieldDefaults : {
																	// labelAlign
																	// : 'top',
																	labelWidth : 70,
																// labelStyle :
																// 'margin-bottom:3px;'
																},
																layout : {
																	type : 'border'
																},
																title : '基本信息',
																items : [
																		{
																			xtype : 'container',
																			region : 'west',
																			width : 410,
																			layout : {
																				type : 'vbox',
																				align : 'stretch'
																			},
																			bodyPadding : 5,
																			items : [ {
																				xtype : 'container',
																				layout : {
																					type : 'table',
																					columns : 2
																				},
																				items : [
																						{
																							id : 'main-module-section-select',
																							xtype : 'combobox',
																							name : 'resSection',
																							width : 200,
																							fieldLabel : '加工阶段',
																							valueField : 'mrsid',
																							displayField : 'displayname',
																							emptyText : '请选择设变/修模',
																							editable : false,
																							store : new Ext.data.Store(
																									{
																										fields : [ 'mid', 'mrsid', 'stateid',
																												'displayname', 'startdate',
																												'enddate', 'remark' ],
																										autoLoad : true,
																										proxy : {
																											url : 'module/part/getModuleSectionInfo?moduleinfo='
																													+ me.moduleInfo.modulebarcode,
																											type : 'ajax',
																											reader : {
																												type : 'json'
																											}
																										}
																									}),
																							listeners : {
																								select : me.onSelectModuleSection
																							}
																						},
																						{
																							id : 'main-module-section-state',
																							xtype : 'combobox',
																							name : 'resumeState',
																							style : 'margin-left:5px',
																							width : 200,
																							fieldLabel : '加工原因',
																							valueField : 'id',
																							displayField : 'name',
																							allowBlank : false,
																							emptyText : '请选择加工原因',
																							afterLabelTextTpl : me.required,
																							editable : false,
																							store : new Ext.data.Store({
																								fields : [ 'id', 'name' ],
																								data : [ {
																									id : '20402',
																									name : '修模'
																								}, {
																									id : '20403',
																									name : '设变'
																								}, {
																									id : '20408',
																									name : '零件'
																								}, {
																									id : '20409',
																									name : '治具'
																								}, {
																									id : '20410',
																									name : '量产'
																								} ]
																							}),
																							listeners : {
																								scope : me,
																								select : me.onSelectResumeState
																							}
																						},
																						{
																							id : 'main-module-section-startdate',
																							xtype : 'datefield',
																							name : 'startdate',
																							width : 200,
																							fieldLabel : '开始日期',
																							afterLabelTextTpl : me.required,
																							allowBlank : false,
																							value : Ext.Date.format(me.nowTime, 'Y-m-d'),
																							format : 'Y-m-d',
																							listeners : {
																								scope : me,
																								select : me.onSelectStartDate
																							}
																						},
																						{
																							id : 'main-module-section-starttime',
																							xtype : 'timefield',
																							name : 'starttime',
																							allowBlank : false,
																							width : 200,
																							fieldLabel : '开始时间',
																							style : 'margin-left:5px',
																							increment : 30,
																							afterLabelTextTpl : me.required,
																							value : me.nowTime,
																							format : 'H:i',
																							listeners : {
																								scope : me,
																								select : me.onSelectStartDate
																							}
																						},
																						{
																							id : 'main-module-section-enddate',
																							xtype : 'datefield',
																							name : 'enddate',
																							afterLabelTextTpl : me.required,
																							allowBlank : false,
																							width : 200,
																							fieldLabel : '完成日期',
																							format : 'Y-m-d',
																							listeners : {
																								scope : me,
																								select : me.onSelectEndDate
																							}
																						},
																						{
																							id : 'main-module-section-endtime',
																							xtype : 'timefield',
																							name : 'endtime',
																							width : 200,
																							allowBlank : false,
																							style : 'margin-left:5px',
																							fieldLabel : '完成时间',
																							increment : 30,
																							afterLabelTextTpl : me.required,
																							format : 'H:i',
																							listeners : {
																								scope : me,
																								select : me.onSelectEndDate
																							}
																						},
																						{
																							id : 'main-module-section-installer',
																							xtype : 'combobox',
																							name : 'installer',
																							fieldLabel : '组立担当',
																							width : 200,
																							valueField : 'empname',
																							displayField : 'empname',
																							allowBlank : false,
																							value : me.moduleInfo.installer,
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
																						},
																						{
																							id : 'main-module-section-deviser',
																							xtype : 'combobox',
																							name : 'deviser',
																							width : 200,
																							fieldLabel : '设计担当',
																							style : 'margin-left:5px',
																							afterLabelTextTpl : me.required,
																							valueField : 'empname',
																							displayField : 'empname',
																							value : me.moduleInfo.deviser,
																							allowBlank : false,
																							store : new Ext.data.Store({
																								autoLoad : true,
																								fields : [ {
																									name : 'empname'
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

																						} ]
																			} ]
																		}, {
																			id : 'main-module-section-intro',
																			xtype : 'textareafield',
																			labelAlign : 'top',
																			name : 'remark',
																			region : 'center',
																			emptyText : '模具(设变/修模)说明(500字)',
																			style : 'margin-left:5px;',
																			maxLength : 500,
																			listeners : {
																				scope : me,
																				blur : me.onResumeRemark
																			}
																		} ]
															} ]
														} ]
											} ],
											dockedItems : [ {
												xtype : 'toolbar',
												dock : 'bottom',
												ui : 'footer',
												items : [ {
													xtype : 'tbfill'
												}, {
													text : '提交资料',
													iconCls : 'accept-16',
													width : 80,
													handler : me.submitSection
												}, {
													text : '关闭窗口',
													iconCls : 'cross-16',
													width : 80,
													handler : function() {
														me.destroy();
													}
												} ]
											} ]
										});

						me.partStore.loadData(me.partInfo);

						me.callParent(arguments);
					},
					/**
					 * 为工件添加remark
					 */
					initRemark : function() {
						var self = this;
						var selModel = self.up('gridpanel').getSelectionModel();
						var models = selModel.getSelection();
						if (models.length) {
							Ext.Array.each(models, function(record, index) {
								var remark = record.get(self.field);
								if (!remark || self.def) {
									record.set(self.field, self.value);
								}
							});

							selModel.deselectAll();
						}
					},
					submitSection : function() {
						var btn = this;
						var winsec = btn.up('window');

						var secid = Ext.getCmp('main-module-section-select').getValue();
						var stateid = Ext.getCmp('main-module-section-state').getValue();
						var startdate = Ext.getCmp('main-module-section-startdate').getValue();
						var starttime = Ext.getCmp('main-module-section-starttime').getValue();
						var enddate = Ext.getCmp('main-module-section-enddate').getValue();
						var endtime = Ext.getCmp('main-module-section-endtime').getValue();
						var remark = Ext.getCmp('main-module-section-intro').getValue();

						var installer = Ext.getCmp('main-module-section-installer').getValue();
						var deviser = Ext.getCmp('main-module-section-deviser').getValue();

						var start = Ext.Date.format(startdate, 'Y-m-d') + ' ' + Ext.Date.format(starttime, 'H:i:s');
						var end = Ext.Date.format(enddate, 'Y-m-d') + ' ' + Ext.Date.format(endtime, 'H:i:s');

						var partlist = Ext.getCmp('main-module-section-partlist').getStore().getRange();
						var partdata = [];
						partlist.forEach(function(r) {
							partdata.push(r.getData());
						});

						var sendJson = {
							modulebarcode : winsec.moduleInfo.modulebarcode,
							secid : secid,
							startdate : start,
							enddate : end,
							stateid : stateid,
							installer : installer,
							deviser : deviser,
							remark : remark,
							plist : partdata
						};

						btn.disable(true);

						Ext.Ajax.request({
							url : 'module/part/saveModuleSectionInfo',
							method : 'POST',
							params : {
								secdata : Ext.JSON.encode(sendJson)
							},
							success : function(resp) {
								var backJson = Ext.JSON.decode(resp.responseText);
								// 将提交按钮设置为可用
								btn.enable(true);
								try {
									if (!backJson.success) {
										if (backJson.result == -10001) {
											showError('加工原因未选择!');
											return;
										} else if (backJson.result == -10002) {
											showError('模具的加工日期不完整!');
											return;
										} else if (backJson.result == -10003) {
											showError('没有任何工件资料讯息!');
											return;
										} else if (backJson.result == -10004) {
											showError('保存个工件资料失败!');
										} else if (backJson.result == -10005) {
											showError('正在新模的模具不能修模或者设变!');
											return;
										} else if (backJson.result == -10006) {
											showError('模具完成日期不能早于开始日期!');
											return;
										} else {
											showError('请重新登录系统!');
											return;
										}
									} else {
										var moldInfo = Ext.getCmp('cmnp-module-part-info').moduleInfo;

										if (moldInfo) {
											moldInfo.set('installer', installer);
											moldInfo.set('deviser', deviser);
										}

										Ext.getCmp('cmnp-module-part-info').getStore().reload();
										Ext.getCmp('design-module-list').getStore().reload();

										winsec.destroy();
									}
								} catch (e) {
									showError('请重新登录系统或者你无权限!');
									return;
								}

							},
							failure : function(x, y, z) {
								showError('连接网络失败!');
							}
						});

					},
					/**
					 * 模具履历阶段加工性选择
					 * 
					 * @param combo
					 * @param record
					 * @param opts
					 */
					onSelectModuleSection : function(combo, records, opts) {
						var record = records[0];

						var format = 'Y-m-d H:i:s';
						var startdate = Ext.Date.parse(record.get('startdate'), format);
						var enddate = Ext.Date.parse(record.get('enddate'), format);

						Ext.getCmp('main-module-section-state').setValue(record.get('stateid'));
						Ext.getCmp('main-module-section-startdate').setValue(startdate);
						Ext.getCmp('main-module-section-starttime').setValue(startdate);
						Ext.getCmp('main-module-section-enddate').setValue(enddate);
						Ext.getCmp('main-module-section-endtime').setValue(enddate);
						Ext.getCmp('main-module-section-intro').setValue(record.get('remark'));

						var _store = Ext.getCmp('main-module-section-partlist').getStore();
						var _tempRow = this.up('window').partInfo;

						Ext.Ajax.request({
							url : 'module/part/getModuleResumeSectionInfo',
							method : 'POST',
							params : {
								secid : record.get('mrsid')
							},
							success : function(resp) {
								var backJson = Ext.JSON.decode(resp.responseText);

								_store.removeAll();
								_store.add(_tempRow);

								for ( var x in backJson) {
									for ( var y in _tempRow) {
										if (_tempRow[y].partbarlistcode == backJson[x].partbarlistcode) {
											var rIndex = _store.findExact('partbarlistcode', _tempRow[y].partbarlistcode);
											if (rIndex > -1) {
												_store.removeAt(rIndex);
												break;
											}
										}
									}
								}

								_store.add(backJson);
							},
							failure : function(x, y, z) {
								showError('连接服务器失败,请检查网络连接!');
							}
						});
					},

					/**
					 * 移除相关工件
					 */
					onClickRemovePart : function(gridpanel, rowIndex, colIndex) {
						var rowModel = gridpanel.getStore().getAt(rowIndex);
						if (rowModel.get('isnew')) {
							Ext.MessageBox.confirm('工件', '您确认删除该工件的修模/设变?', function(btn) {
								if (btn != 'yes') {
									return;
								}
								// 将工件说明讯息栏中内容清除
								Ext.getCmp("main-part-process-remark-id").setValue(Ext.emptyString);
								gridpanel.getStore().removeAt(rowIndex);
							});
						} else {
							rowModel.set('isnew', false);
							showInfo("不允许删除已设变/修模的工件!");
							return;
						}

					},
					/**
					 * 有工件加工说明时显示样式
					 */
					renderHaveRemark : function(value, m, record) {
						if (record.data.remark) {
							return (value ? "<span style='font-weight: bold;'>".concat(value).concat("</span>") : '');
						} else {
							return value;
						}
					},
					/**
					 * 点击相应工件的修模/设变说明
					 */
					onClickPartRemark : function(grid, record, item, index) {
						this.selRowIndex = index;
						Ext.getCmp("main-part-process-remark-id").setValue(record.data.remark);
					},

					/**
					 * 记录每个工件的设变/修模说明
					 */
					onRecordPartRemark : function(area, The, eOpts) {
						if (this.selRowIndex > -1) {
							this.partStore.getAt(this.selRowIndex).set('remark', area.getValue());
							area.setValue(Ext.emptyString);
							this.selRowIndex = -1;
						}
					},

					/**
					 * 记录模具设变/修模说明
					 */
					onResumeRemark : function(area, The, eOpts) {
						if (this.resumeRecord) {
							this.resumeRecord.set("mdremark", area.getValue());

							this.moduleResumeUpdate();
						}
					},

					onSelectResumeState : function(combo, records) {
						if (this.resumeRecord) {
							this.resumeRecord.set("resumestate", combo.getValue());

							this.moduleResumeUpdate();
						}
					},

					onSelectStartDate : function(combo, records) {
						if (this.resumeRecord) {
							var time = this.form.findField('startdate').getRawValue() + " " + this.form.findField('starttime').getRawValue();
							this.resumeRecord.set("starttime", time);

							this.moduleResumeUpdate();
						}
					},

					onSelectEndDate : function(combo, records) {
						if (this.resumeRecord) {
							var time = this.form.findField('enddate').getRawValue() + " " + this.form.findField('endtime').getRawValue();
							this.resumeRecord.set("endtime", time);

							this.moduleResumeUpdate();
						}
					},

					moduleResumeUpdate : function() {
						// 如果修模记录为已存时,就表示为更新
						if (!this.resumeRecord.data.newup && !this.resumeRecord.data.update) {
							this.resumeRecord.set("update", true);
						}
					}
				});
Ext.define('PartListPreview', {
	extend : 'Ext.window.Window',
	width : 300,
	height : 300,
	plain : true,
	resizable : false,
	modal : true,
	moldInfo : {
		modulebarcode : '',
		moduleresumeid : '',
		moldstateid : '',
		sendInfo : null
	},
	layout : 'fit',
	title : '工件预览',
	initComponent : function() {
		var self = this;
		self.items = [ {
			id : 'cnmn-part-list',
			xtype : 'gridpanel',
			border : false,
			columnLines : true,
			rowLines : true,
			tbar : [ {
				id : 'cnmn-process-typeid',
				xtype : 'combobox',
				emptyText : '请选择加工类型',
				displayField : 'rname',
				valueField : 'rid',
				editable : false,
				width : 100,
				store : new Ext.data.Store({
					fields : [ 'rid', 'rname' ],
					data : [ {
						rid : '20401',
						rname : '新模'
					}, {
						rid : '20402',
						rname : '修模'
					}, {
						rid : '20403',
						rname : '设变'
					} ],
					autoLoad : true
				})
			}, '-', {
				text : '保存工件',
				iconCls : 'gtk-save-16',
				handler : function() {
					var self = this.up('window');
					var grid = this.up('gridpanel');
					if (!grid.getStore().getCount()) {
						Fly.msg('错误', '解析的工件个数为空!');
						return;
					}

					Ext.Ajax.request({
						url : 'module/manage/getModuleWorkPieces',
						method : 'POST',
						params : {
							info : Ext.JSON.encode(self.moldInfo.sendInfo),
							flag : 1
						},
						success : function(resp) {
							var r_list = Ext.JSON.decode(resp.responseText);
							if (!r_list.result) {
								Fly.msg('错误', '生成工件编号失败!');
								return;
							}

							Ext.getCmp('part-type-txt').setValue(Ext.emptyString);
							Ext.getCmp('part-type-code').setValue(Ext.emptyString);
							Ext.getCmp('part-list-name').setValue(Ext.emptyString);
							Ext.getCmp('part-list-norms').setValue(Ext.emptyString);
							Ext.getCmp('part-list-source').setValue(Ext.emptyString);
							Ext.getCmp('part-list-count').setValue(Ext.emptyString);

							Ext.getCmp('part-basic-select').reset();

							Ext.getCmp('part-list-piccode').setValue(Ext.emptyString);
							Ext.getCmp('part-list-hardness').setValue(Ext.emptyString);
							Ext.getCmp('part-list-buffing').setValue(Ext.emptyString);
							Ext.getCmp('part-list-tolerance').setValue(Ext.emptyString);

							// Ext.getCmp('part-list-isfit').setValue(false);

							Ext.getCmp('cmnp-module-part-info').getStore().load({
								url : 'module/manage/getModulePartInformation',
								params : {
									modulebarcode : self.moldInfo.modulebarcode
								}
							});

							self.close();
						},
						failure : function(x, y, z) {
							Fly.msg('错误', '连接服务器失败,请检查网络连接!');
							return;
						}
					});
				}
			} ],
			columns : [ {
				text : '工件编号',
				dataIndex : 'partlistcode',
				flex : 2
			}, {
				text : '是否存在',
				dataIndex : 'isexist',
				renderer : function(val) {
					return val ? '<font color = red>是</font>' : '否';
				},
				flex : 1
			} ],
			store : new Ext.data.Store({
				fields : [ 'partlistcode', 'isexist' ],
				autoLoad : true,
				data : []
			})
		} ];
		self.callParent(arguments);
	}
});

Ext.define('Module.CopyModulePartInfo', {
	extend : 'Ext.window.Window',
	title : '增番复制',
	width : 300,
	height : 300,
	moduleInfo : [],
	modal : true,
	resizable : false,
	layout : 'border',
	initComponent : function() {
		var self = this;
		self.items = [ {
			xtype : 'gridpanel',
			forceFit : true,
			border : false,
			region : 'center',
			store : Ext.create('Ext.data.Store', {
				id : 'cmnp-store-module-list',
				fields : [ 'modulebarcode', 'modulecode' ],
				autoLoad : true,
				data : self.moduleInfo
			}),
			columns : [ {
				text : '模具工号',
				dataIndex : 'modulecode'
			} ],
			tbar : [ {
				id : 'cmnp-select-module',
				xtype : 'combobox',
				emptyText : '请输入参考模具',
				displayField : 'modulecode',
				valueField : 'modulecode',
				store : Ext.create('Ext.data.Store', {
					id : 'cmnp-match-module-query',
					fields : [ 'modulebarcode', 'modulecode' ],
					autoLoad : true,
					proxy : {
						url : '',
						type : 'ajax',
						reader : {
							type : 'json'
						}
					}
				}),
				minChars : 2,
				listeners : {
					change : function(combo, nw, od) {
						Ext.getStore('cmnp-match-module-query').load({
							url : 'module/part/getMatchModuleInfo',
							params : {
								match : nw
							}
						});
					}
				}
			}, {
				text : '复制模具',
				iconCls : 'gtk-copy-16',
				handler : self.executeCopyModuleInfo
			} ]
		} ];

		self.callParent(arguments);
	},
	/**
	 * 将增番模具的工件讯息导入数据库
	 */
	executeCopyModuleInfo : function() {
		// 获取参考模具讯息
		var selModuleCtrl = Ext.getCmp('cmnp-select-module');
		var record = selModuleCtrl.findRecord('modulecode', selModuleCtrl.getValue());
		if (!record) {
			showInfo('该模具工号的讯息不存在!');
			return;
		}

		// 获取增番模具讯息
		var moduleRows = Ext.getStore('cmnp-store-module-list').getRange();
		if (!moduleRows.length) {
			showInfo('欲复制工件讯息的模具工号不存在!');
			return;
		}

		// 获取增番模具的唯一号
		var m_list = [];
		for ( var x in moduleRows) {
			m_list.push(moduleRows[x].get('modulebarcode'));
		}

		// 获取复制模具窗口
		var win = this.up('window');

		// 执行AJAX工件讯息保存
		Ext.Ajax.request({
			url : 'module/part/copyModulePartInfo',
			method : 'POST',
			params : {
				refer : record.get('modulebarcode'),
				modulelist : Ext.JSON.encode(m_list)
			},
			success : function(resp) {
				var rst = Ext.JSON.decode(resp.responseText);
				if (rst.success) {
					win.close();
					showSuccess('恭喜你,复制模具成功!');
				} else {
					if (rst.result == -1) {
						showError('增番模具清单为空!');
						return;
					} else if (rst.result == -2) {
						showError('参考模具讯息不能为空!');
						return;
					} else if (rst.result == -3) {
						showError('所有的增番模具都已经导入工件了!');
						return;
					} else if (rst.result == -4) {
						showError('参考模具的工件讯息不存在!');
						return;
					} else if (rst.result == -5) {
						showError('复制模具失败,请重试!');
						return;
					} else {
						showError('未知错误,请联系系统管理员!');
						return;
					}
				}
			},
			failure : function(x, y, z) {
				showError('连接服务器失败,请检查网络连接!');
				return;
			}
		});
	}
});