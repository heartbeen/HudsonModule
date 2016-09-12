var factoryType = [ '分厂', '客户', '供应商' ];

var factoryNature = [ '港台资', '欧美 ', '大陆', '其他' ];

var factoryFields = [ "id", "factorycode", "shortname", "fullname", "factorytype", "address", "contactor", "phonenumber", "faxnumber", "email",
		"nature", "remark", "currency" ];

var craftFields = [ 'craftid', 'craftcode', 'craftname', 'description', 'posname' ];

var postionFields = [ 'posid', 'posname', 'creator' ];
var naturValue;
var isowned;
var craftPosId;
var factoryCode;
var field = '';
var condition = '';

/**
 * 基本资料建立主介面
 */
Ext.define('Module.BaseInformation', {
	extend : 'Ext.panel.Panel',

	layout : {
		type : 'border'
	},
	title : '模具加工初始化',

	initComponent : function() {
		var me = this;

		me.factoryStore = Ext.create('Ext.data.Store', {
			pageSize : 25,
			fields : factoryFields,

			proxy : {
				actionMethods : {
					read : "POST"
				},
				type : 'ajax',
				url : 'module/base/queryFactory',
				reader : {
					type : 'json',
					root : 'info',
					totalProperty : 'totalCount'
				}
			}
		});

		Ext.applyIf(me, {
			items : [ {
				xtype : 'panel',
				region : 'west',
				width : 158,
				layout : {
					type : 'anchor'
				},
				bodyPadding : 10,
				title : '',
				items : [ {
					xtype : 'button',
					anchor : '100%',
					id : 'ins-price1',
					margin : '0 0 5 0',
					allowDepress : false,
					destroyMenu : false,
					enableToggle : true,
					pressed : true,
					text : '厂商资料',
					toggleGroup : 'factory-config',
					handler : function(btn) {
						me.onSubmitDataInfo1("onContentChange");
					}
				}, {
					xtype : 'button',
					anchor : '100%',
					id : 'ins-price2',
					margin : '0 0 5 0',
					allowDepress : false,
					destroyMenu : false,
					enableToggle : true,
					text : '部门与单位资料',
					toggleGroup : 'factory-config',
					handler : function(btn) {
						me.onSubmitDataInfo2("onContentChange");
					}
				}, {
					xtype : 'button',
					id : 'ins-price3',
					anchor : '100%',
					margin : '0 0 5 0',
					allowDepress : false,
					destroyMenu : false,
					enableToggle : true,
					text : '工艺与工价资料',
					toggleGroup : 'factory-config',
					handler : function(btn) {
						me.onSubmitDataInfo3("onContentChange");
					}

				} ]
			}, {
				xtype : 'container',
				id : 'inserx-info',
				region : 'center',
				title : '新增帐号信息',
				margin : '0 0 0 5',
				layout : 'card',
				activeItem : 0, // 默认显示第一个子面板
				animCollapse : true,
				layoutConfig : {
					animate : true
				},
				items : [ {
					xtype : 'gridpanel',
					title : '厂商资料',
					id : 'id0',
					loadMask : true,
					columnLines : true,
					bbar : Ext.create('Ext.PagingToolbar', {
						store : me.factoryStore,
						displayInfo : true,
						displayMsg : '显示记录行号: {0} - {1}    共{2}条',
						emptyMsg : "没有记录"
					}),

					dockedItems : [ {
						xtype : 'toolbar',
						items : [ {
							xtype : 'combobox',
							fieldLabel : '查询字段',
							id : 'factory-query-field-id',
							labelWidth : 60,
							margin : '0 0 0 5',
							valueField : 'field',
							displayField : 'fieldName',
							editable : false,
							// 工号下拉框
							store : Ext.create('Ext.data.Store', {

								fields : [ {
									type : 'string',
									name : 'field'
								}, {
									type : 'string',
									name : 'fieldName'
								} ],

								data : [ {
									field : 'factorycode',
									fieldName : '厂商代号'
								}, {
									field : 'shortname',
									fieldName : '厂商名称'
								}, {
									field : 'fullname',
									fieldName : '厂商全名'
								}, {
									field : 'factorytype',
									fieldName : '厂商性质'
								}, {
									field : 'address',
									fieldName : '厂商地址'
								}, {
									field : 'contactor',
									fieldName : '联络人'
								}, {
									field : 'phonenumber',
									fieldName : '联络电话'
								}, {
									field : 'faxnumber',
									fieldName : '传真'
								}, {
									field : 'email',
									fieldName : '电子邮箱'
								}, {
									field : 'nature',
									fieldName : '厂商类型'
								}, {
									field : 'currency',
									fieldName : '交易币种'
								} ],

								proxy : {
									type : 'memory'
								}

							}),
						}, {
							xtype : 'textfield',
							id : 'factory-query-condition-id',
							fieldLabel : '条件',
							margin : '0 0 0 5',
							labelWidth : 40,
						}, {
							text : '查询',
							iconCls : 'gnome-searchtool-16',
							width : 60,
							scope : me,
							handler : me.onSearchFactory
						} ]
					}, {
						xtype : 'toolbar',
						dock : 'bottom',
						ui : 'footer',
						items : [ {
							text : '增加资料',
							iconCls : 'add-16',
							handler : function() {
								Ext.create('FactoryWindow', {
									title : '新增厂商',
									url : 'module/base/insertFactory',
									isInsert : true
								}).show();
							}
						} ]
					} ],
					store : me.factoryStore,
					listeners : {
						celldblclick : function(grid, td, cellIndex, record) {
							if (record) {
								var win = Ext.create('FactoryWindow', {
									title : '更新厂商',
									url : 'module/base/updateFactory',
									isInsert : false
								});
								win.getComponent(1).getForm().loadRecord(record);

								win.show();
							}
						}
					},

					columns : [ Ext.create('Ext.grid.RowNumberer', {
						width : 40
					}), {
						xtype : 'gridcolumn',
						dataIndex : 'factorycode',
						width : 70,
						text : '厂商代号'
					}, {
						xtype : 'gridcolumn',
						dataIndex : 'shortname',
						width : 100,
						text : '厂商名称'
					}, {
						xtype : 'gridcolumn',
						dataIndex : 'fullname',
						width : 300,
						text : '厂商全名'
					}, {
						xtype : 'gridcolumn',
						dataIndex : 'factorytype',
						width : 60,
						text : '厂商性质',
						renderer : function(value) {
							return factoryType[value - 1];
						}
					}, {
						xtype : 'gridcolumn',
						dataIndex : 'address',
						width : 280,
						text : '厂商地址'
					}, {
						xtype : 'gridcolumn',
						dataIndex : 'contactor',
						width : 80,
						text : '联络人'
					}, {
						xtype : 'gridcolumn',
						dataIndex : 'phonenumber',
						width : 100,
						text : '联络电话'
					}, {
						xtype : 'gridcolumn',
						dataIndex : 'faxnumber',
						width : 80,
						text : '传真'
					}, {
						xtype : 'gridcolumn',
						dataIndex : 'email',
						width : 180,
						text : '电子邮箱'
					}, {
						xtype : 'gridcolumn',
						dataIndex : 'nature',
						width : 60,
						text : '厂商类型',
						renderer : function(value) {
							return factoryNature[value - 1];
						}
					}, {
						xtype : 'gridcolumn',
						dataIndex : 'currency',
						width : 50,
						text : '币种'
					}, {
						xtype : 'gridcolumn',
						dataIndex : 'remark',
						width : 80,
						text : '备注'
					}, { // 删除资料
						xtype : 'actioncolumn',
						text : '删除',
						width : 40,
						flex : 40,
						sortable : false,
						items : [ {
							iconCls : 'edit-delete-16',
							id : 'car-plan-actioncolumn',
							handler : me.onDeleteFactory
						} ]
					} ]
				}, Ext.create('Module.DepartmentManage', {
					id : 'id1'
				}), Ext.create('Module.ManageCrafts', {
					id : 'id2'
				}) ],
				buttons : [ {
					text : '上一步',
					width : 60,
					id : 'prevs',
					handler : function(btn) {
						me.changeTab(btn.up("panel"), "prev");
					}
				}, {
					text : '下一步',
					width : 60,
					id : 'prevt',
					handler : function(btn) {
						me.changeTab(btn.up("panel"), "next");
					}
				}, {
					text : '完成',
					width : 60,
					id : 'prevst'
				// handler : me.onSubmitDataInfo()
				} ]
			} ]
		});

		me.callParent(arguments);
	},

	changeTab : function(panel, direction) {
		var layout = panel.getLayout();
		layout[direction]();
		Ext.getCmp('prevs').setDisabled(!layout.getPrev());
		Ext.getCmp('prevt').setDisabled(!layout.getNext());
		// if(Ext.getCmp('inserx-info').getLayout().setActiveItem()==1){
		// //Ext.getCmp('ins-price2').pressed(true);
		// alert('aa');
		// }
	},

	onSubmitDataInfo1 : function(direction) {
		var layout = Ext.getCmp('inserx-info').getLayout();
		layout.setActiveItem('id0');
		layout.setActiveItem(0);
	},
	onSubmitDataInfo2 : function(direction) {
		var layout = Ext.getCmp('inserx-info').getLayout();
		layout.setActiveItem('id1');
		layout.setActiveItem(1);
	},
	onSubmitDataInfo3 : function(direction) {
		var layout = Ext.getCmp('inserx-info').getLayout();
		layout.setActiveItem('id2');
		layout.setActiveItem(2);
	},

	/** 查询厂间资料 */
	onSearchFactory : function() {

		field = App.getValue('factory-query-field-id');
		condition = App.getValue('factory-query-condition-id');

		// 更新查询条件
		var store = Ext.getCmp('id0').getStore();
		store.proxy.url = 'module/base/queryFactory?field=' + field + "&condition=" + condition;

		store.loadPage(1);

	},

	/**
	 * 删除厂商资料
	 */
	onDeleteFactory : function(grid, rowIndex, colIndex) {

		var me = this;
		var store = grid.getStore();
		var model = store.getAt(rowIndex);

		Ext.MessageBox.show({
			title : '厂别资料',
			msg : '你確定要刪除該條記錄？',
			buttons : Ext.MessageBox.YESNO,
			buttonText : {
				yes : "確定",
				no : "取消"
			},
			fn : function(buttonId) {
				if (buttonId == 'yes') {

					Ext.Ajax.request({
						url : 'module/base/deleteFactory',
						params : {
							id : model.data.id,
							factoryType : model.data.factorytype
						},
						success : function(response) {

							var res = JSON.parse(response.responseText);

							App.InterPath(res, function() {
								if (!res.success) {
									Fly.msg('错误', "<span style='color:red;'>" + res.msg + "</span>");
								} else {
									Fly.msg("<span style='color:red;'>提示:</span>", res.msg);

									// 删除后更新其后的加工艺的index
									store.removeAt(rowIndex);
									grid.updateLayout();
								}

							});

						},
						failure : function(response) {
							App.Error(response);
						}
					});
				}
			}
		});
	}
});

/**
 * 厂商资料增加和修窗口
 */
Ext.define('FactoryWindow', {
	extend : 'Ext.window.Window',
	modal : true,
	iconCls : 'manilla-add-folder-to-archive-16',

	emailRegex : new RegExp("[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?"),
	width : 400,
	height : 540,
	layout : 'border',

	initComponent : function() {
		var me = this;

		Ext.apply(me, {

			items : [ {
				xtype : 'panel',
				height : 80,
				region : 'north',
				border : 0,
				style : 'border-bottom-style:inset',
				bodyPadding : 10
			// html : '<span>新建厂资料</span>'
			}, {
				xtype : 'form',
				region : 'north',
				layout : 'anchor',
				bodyPadding : 10,
				border : 0,
				items : [ {
					xtype : 'textfield',
					name : 'id',
					hidden : true
				}, {
					xtype : 'textfield',
					id : 'base-factorycode-textfield',
					name : 'factorycode',
					fieldLabel : '厂商代号',
					allowBlank : false,
					readOnly : !me.isInsert,
					fieldStyle : !me.isInsert ? 'color:red;font-weight:bold;' : '',
					maxLength : 36,
					labelWidth : 70,
					anchor : '100%'
				}, {
					xtype : 'textfield',
					name : 'shortname',
					fieldLabel : '厂商名称',
					allowBlank : false,
					maxLength : 20,
					labelWidth : 70,
					anchor : '100%'
				}, {
					xtype : 'textfield',
					name : 'fullname',
					maxLength : 100,
					allowBlank : false,
					fieldLabel : '厂商全名',
					labelWidth : 70,
					anchor : '100%'
				}, {
					xtype : 'combobox',
					name : 'factorytype',
					fieldLabel : '厂商性质',
					readOnly : !me.isInsert,
					allowBlank : false,
					maxLength : 36,
					labelWidth : 70,
					valueField : 'value',
					displayField : 'text',
					editable : false,
					anchor : '100%',
					fieldStyle : !me.isInsert ? 'color:red;font-weight:bold;' : '',
					store : new Ext.data.Store({
						fields : [ 'value', 'text' ],
						data : [ {
							value : 1,
							text : '分厂'
						}, {
							value : 2,
							text : '客户'
						}, {
							value : 3,
							text : '供应商'
						} ]
					}),
					listeners : {
						select : me.onSelectFactoryType
					}
				}, {
					xtype : 'textfield',
					name : 'address',
					fieldLabel : '厂商地址',
					allowBlank : false,
					maxLength : 150,
					labelWidth : 70,
					anchor : '100%'
				}, {
					xtype : 'textfield',
					name : 'contactor',
					fieldLabel : '联络人',
					maxLength : 30,
					labelWidth : 70,
					anchor : '100%'
				}, {
					xtype : 'textfield',
					name : 'phonenumber',
					fieldLabel : '联系电话',
					maxLength : 50,
					labelWidth : 70,
					anchor : '100%'
				}, {
					xtype : 'textfield',
					name : 'faxnumber',
					fieldLabel : '传真号码',
					maxLength : 50,
					labelWidth : 70,
					anchor : '100%',
				}, {
					xtype : 'textfield',
					name : 'email',
					// regex : me.emailRegex,
					fieldLabel : '电子邮箱',
					maxLength : 100,
					labelWidth : 70,
					anchor : '100%',
				}, {
					xtype : 'combobox',
					name : 'nature',
					fieldLabel : '厂商类型',
					labelWidth : 70,
					valueField : 'value',
					displayField : 'text',
					editable : false,
					anchor : '100%',
					store : new Ext.data.Store({
						fields : [ 'value', 'text' ],
						data : [ {
							value : 1,
							text : '港台资'
						}, {
							value : 2,
							text : '欧美 '
						}, {
							value : 3,
							text : '大陆'
						}, {
							value : 4,
							text : '其他'
						} ]
					})
				}, {

					xtype : 'combobox',
					fieldLabel : '交易币种',
					name : 'currency',
					anchor : '100%',
					labelWidth : 70,
					valueField : 'currency',
					displayField : 'currencyName',
					editable : false,
					// 工号下拉框
					store : Ext.create('Ext.data.Store', {

						fields : [ {
							type : 'string',
							name : 'currency'
						}, {
							type : 'string',
							name : 'currencyName'
						} ],

						data : [ {
							currency : 'USD',
							currencyName : 'USD'
						}, {
							currency : 'CHF',
							currencyName : 'CHF'
						}, {
							currency : 'RMB',
							currencyName : 'RMB'
						}, {
							currency : 'HKD',
							currencyName : 'HKD'
						}, {
							currency : 'JPY',
							currencyName : 'JPY'
						}, {
							currency : 'GBP',
							currencyName : 'GBP'
						} ],
						proxy : {
							type : 'memory'
						}
					})

				}, {
					xtype : 'textarea',
					name : 'remark',
					fieldLabel : '备注',
					maxLength : 100,
					labelWidth : 70,
					anchor : '100%',
					height : '100%'

				} ]
			} ],

			dockedItems : [ {
				xtype : 'toolbar',
				dock : 'bottom',
				ui : 'footer',
				items : [ '->', {
					text : '保存资料',
					iconCls : 'stock_save-16',
					width : 80,
					scope : me,
					handler : me.onSubmitFactory
				}, {
					text : '取消',
					iconCls : 'stock_stop-16',
					width : 80,
					scope : me,
					handler : function() {
						me.destroy();
					}
				} ]
			} ]
		});

		me.callParent(arguments);
	},

	/**
	 * 如果为创建分厂时,那么分厂代号要自动产生
	 */
	onSelectFactoryType : function(combo, records, eOpts) {
		var field = Ext.getCmp('base-factorycode-textfield');
		field.setDisabled(records && records[0].data.value == 1);

	},

	/** 提交厂商资料请求 */
	onSubmitFactory : function() {
		var me = this;
		var form = me.getComponent(1).getForm();

		if (form.isValid()) {
			Ext.MessageBox.show({
				title : '厂别资料',
				msg : '你确定要保存该厂别资料？',
				buttons : Ext.MessageBox.YESNO,
				buttonText : {
					yes : "確定",
					no : "取消"
				},
				fn : function(buttonId) {
					if (buttonId == 'yes') {

						Ext.Ajax.request({
							url : me.url,
							params : {
								factory : Ext.JSON.encode(form.getValues())
							},
							method : 'POST',
							success : function(response) {

								var res = JSON.parse(response.responseText);

								App.InterPath(res, function() {
									if (!res.success) {
										Fly.msg('错误', "<span style='color:red;'>" + res.msg + "</span>");
									} else {
										Ext.MessageBox.show({
											title : '厂别资料',
											msg : '厂商数据保存成功',
											buttons : Ext.MessageBox.YES,
											buttonText : {
												yes : "確定"
											},
											fn : function(buttonId) {
												if (buttonId == 'yes') {
													me.destroy();
													form.getRecord().commit();
												}
											}
										});
									}

								});

							},
							failure : function(response) {
								App.Error(response);
							}
						});

					}
				}
			});

		}

	},
});
