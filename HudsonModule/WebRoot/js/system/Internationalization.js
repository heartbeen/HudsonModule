/**
 * 
 */
Ext.define('System.Internationalization', {
	extend : 'Ext.panel.Panel',

	requires : [ 'System.model.grid.Internationalization', 'System.model.grid.InternationalizationContent' ],
	xtype : 'cell-editing',

	layout : {
		padding : 5,
		type : 'border'
	},
	title : '国际化',

	internatlGridId : 'system.internationalization',

	internatUrl : 'system/queryLocaleTag',
	contentUrl : 'system/queryLocaleContentByTag',

	saveTagUrl : "system/saveLocaleTag",
	updateTagUrl : "system/updateLocaleTag",
	deleteTagUrl : "system/deleteLocaleTag",

	saveContentUrl : 'system/saveLocaleContent',
	updateContentUrl : 'system/updateLocaleContent',

	internalStroeId : 'system.model.grid.Internationalization',
	contentStoreId : 'system.model.grid.InternationalizationContent',

	queryFormId : 'system.query.internationalization',

	initComponent : function() {
		var me = this;

		me.localeTagStore = new Ext.data.Store({
			storeId : me.internalStroeId,
			pageSize : 25,
			autoLoad : true,
			model : System.model.grid.Internationalization,
			proxy : {
				actionMethods : {
					read : "POST"
				},
				type : 'ajax',
				url : me.internatUrl,
				reader : {
					type : 'json',
					root : 'info',
					totalProperty : 'totalCount'
				}
			},

			listeners : {
				load : function() {
					me.clearLocaleContent();
				}
			}
		});

		/**
		 * 国际化编码编辑
		 */
		me.rowEditPlugin = Ext.create('Ext.grid.plugin.RowEditing', {
			clicksToMoveEditor : 1,
			saveBtnText : "保存",
			cancelBtnText : "取消",
			listeners : {
				validateEdit : function() {
					var e = this;
					me.updateLocaleContent(e.context.record, e.editor.items.items);

					return true;
				}
			}
		});

		/**
		 * 国际化内容编辑
		 */
		me.contentEditPlugin = Ext.create('Ext.grid.plugin.RowEditing', {
			clicksToEdit : 1,
			saveBtnText : "保存",
			cancelBtnText : "取消",
			listeners : {
				edit : function(editor, context, eOpts) {
				},

				canceledit : function(editor, context, eOpts) {
				},

				validateEdit : function() {
					var e = this;
					me.localeContentChange(e.context.record, e.editor.items.items);

					return true;
				}
			}
		});

		Ext.applyIf(me, {

			items : [ {
				xtype : 'container',
				region : 'center',
				layout : {
					type : 'border'
				},
				items : [ {
					xtype : 'gridpanel',
					id : me.internatlGridId,
					flex : 3,
					margins : '0 0 5 0',
					region : 'north',
					title : '国际化代码列表',
					plugins : [/*
								 * new Ext.grid.plugin.CellEditing({
								 * clicksToEdit : 2 })
								 */
					me.rowEditPlugin ],

					store : me.localeTagStore,
					columns : [ {
						xtype : 'gridcolumn',
						width : 240,
						dataIndex : 'lang_code',
						text : '国际化代码',
						field : {
							xtype : 'textfield',
							allowBlank : false,
							maxLength : 200,
							regex : /^[a-zA-z.]+$/
						}
					}, {
						xtype : 'gridcolumn',
						text : '所属模块',
						width : 200,
						dataIndex : 'project_name',
						field : {
							xtype : 'combobox',
							allowBlank : false,
							valueField : 'id',
							displayField : 'project_name',
							queryMode : 'remote',
							editable : false,
							store : Ext.create('Ext.data.Store', {
								fields : [ {
									type : 'string',
									name : 'id'
								}, {
									type : 'string',
									name : 'project_name'
								}, {
									type : 'string',
									name : 'parentid'
								} ],
								proxy : {
									type : 'ajax',
									url : 'system/queryProjectModule',
									reader : {
										type : 'json'
									}
								}
							})
						}

					/*
					 * editor : new Ext.form.field.ComboBox({ editable : false,
					 * displayField : 'name', valueField : 'id', // queryMode :
					 * 'local', store : { fields : [ 'name', 'id', 'parentid' ],
					 * proxy : { type : 'ajax', url :
					 * 'system/queryProjectModule', reader : { type : 'json' } } } })
					 */
					},

					/*
					 * { xtype : 'gridcolumn', text : '类型', dataIndex :
					 * 'category', editor : new Ext.form.field.ComboBox({
					 * editable : false, store : [ [ 'user', '用户' ], [ 'sys',
					 * '系统' ] ] }) },
					 */
					{
						xtype : 'gridcolumn',
						width : 60,
						dataIndex : 'create_by',
						text : '创建人'
					}, {
						xtype : 'datecolumn',
						width : 110,
						dataIndex : 'create_date',
						text : '创建日期',
						format : 'Y-m-d H:i'
					}, {
						xtype : 'gridcolumn',
						width : 60,
						dataIndex : 'modify_by',
						text : '修改人'
					}, {
						xtype : 'datecolumn',
						dataIndex : 'modify_date',
						width : 110,
						text : '修改日期',
						format : 'Y-m-d H:i'
					} ],

					dockedItems : [ {
						xtype : 'pagingtoolbar',
						dock : 'bottom',
						width : 360,
						displayInfo : true,
						store : me.localeTagStore,
					}, {
						xtype : 'toolbar',
						dock : 'top',
						items : [ {
							xtype : 'button',
							iconCls : 'appointment-new-16',
							text : '新建 ',
							scope : this,
							handler : this.onAddClick
						}, '-', {
							xtype : 'button',
							iconCls : 'edit-delete-16',
							text : '删除',
							scope : this,
							handler : this.onDeleteClick

						}, '->', {
							xtype : 'button',
							iconCls : 'filesave-16',
							text : '导入'
						}, "-", {
							xtype : 'button',
							iconCls : 'filesave-16',
							text : '导出'
						} ]
					} ],
					selModel : Ext.create('Ext.selection.CheckboxModel', {

					}),
					listeners : {
						scope : me,
						itemclick : me.onItemClick
					}
				}, {// 国际化内容
					xtype : 'gridpanel',
					flex : 2,
					region : 'center',
					title : i18n.get('system.systemparam.locale.content.data.table'),
					columns : [ {
						xtype : 'gridcolumn',
						width : 100,
						dataIndex : 'locale_name',
						text : '语言'
					}, {
						xtype : 'gridcolumn',
						width : 360,
						dataIndex : 'lang_value',
						text : '内容',
						editor : {
							allowBlank : false
						}
					}, {
						xtype : 'gridcolumn',
						width : 60,
						dataIndex : 'create_by',
						text : '创建人'
					}, {
						xtype : 'datecolumn',
						width : 110,
						dataIndex : 'create_date',
						text : '创建日期',
						format : 'Y-m-d H:i'
					}, {
						xtype : 'gridcolumn',
						width : 60,
						dataIndex : 'modify_by',
						text : '修改人'
					}, {
						xtype : 'datecolumn',
						dataIndex : 'modify_date',
						text : '修改日期',
						width : 110,
						format : 'Y-m-d H:i'
					} ],

					plugins : [ me.contentEditPlugin
					/*
					 * new Ext.grid.plugin.CellEditing({ clicksToEdit : 1 })
					 */
					],

					store : new Ext.data.Store({
						autoLoad : false,
						storeId : me.contentStoreId,
						model : System.model.grid.InternationalizationContent,
						proxy : {
							actionMethods : {
								read : "POST"
							},
							type : 'ajax',
							url : me.contentUrl,
							reader : {
								type : 'json'
							}
						},

						listeners : {
							load : function(store, records, successful) {
								if (successful) {
									var langCode = Ext.getCmp(me.internatlGridId).getSelectionModel().getSelection()[0];
									records.forEach(function(record) {
										if (!record.data.id) {
											// 行编辑时，编辑的列要有一个值才能进行保存操作
											record.set("lang_code", langCode.data.lang_code);
											record.set("isNew", true);
											record.set("lang_value", " ");
											record.commit();
										}
									});

								}
							}
						}
					})
				} ]
			}, {
				xtype : 'form',
				region : 'west',
				id : me.queryFormId,
				margin : '0 5 0 0',
				minWidth : 180,
				width : 180,
				bodyPadding : 10,
				collapsed : false,
				collapsible : true,
				title : i18n.get('system.systemparam.title.locale.query'),
				fieldDefaults : {
					labelAlign : 'top',
					labelWidth : 100
				},
				items : [ {
					xtype : 'textfield',
					style : {
						width : '100%'
					},
					labelStyle : 'margin-bottom:5px',
					name : 'lang_code',
					fieldLabel : '国际化代码'
				}, {
					xtype : 'textfield',
					style : {
						width : '100%'
					},
					name : 'lang_value',
					fieldLabel : '国际化内容',
					labelStyle : 'margin-bottom:5px',
					editor : {
						allowBlank : false,
						maxLength : 300
					}
				}, {
					xtype : 'combobox',
					margin : '0 0 10 0',
					style : {
						width : '100%'
					},
					width : 158,
					name : 'project_id',
					fieldLabel : '所属模块',
					labelStyle : 'margin-bottom:5px',
					displayField : 'project_name',
					editable : false,
					valueField : 'id',
					store : {
						fields : [ 'project_name', 'id', 'parentid' ],
						proxy : {
							type : 'ajax',
							url : 'system/queryProjectModule',
							reader : {
								type : 'json'
							}
						}
					}
				},
				/*
				 * { xtype : 'combobox', margin : '0 0 10 0', name : 'category',
				 * style : { width : '100%' }, width : 158, editable : false,
				 * fieldLabel : '类型', labelStyle : 'margin-bottom:5px', store : [ [
				 * 'user', '用户' ], [ 'sys', '系统' ] ] },
				 */
				{
					xtype : 'button',
					width : 75,
					text : '查找',
					scope : me,
					handler : me.onQueryLang
				}, {
					xtype : 'button',
					margin : '0 0 0 7',
					width : 75,
					text : '重置',
					scope : me,
					handler : me.onRestQueryLang
				} ]
			} ]
		});

		me.callParent(arguments);
	},

	clearLocaleContent : function() {
		Ext.getStore(this.contentStoreId).loadData([]);
	},

	/**
	 * 增加国际化
	 */
	onAddClick : function() {
		var me = this;

		var rec = Ext.create("System.model.grid.Internationalization", {
			lang_code : 'example',
			project_id : -1,
			project_name : ' ',
			isNew : true
		});

		me.rowEditPlugin.cancelEdit();

		Ext.getStore(me.internalStroeId).insert(0, rec);
		me.rowEditPlugin.startEdit(0, 0);

		me.clearLocaleContent();
	},

	/**
	 * 
	 */
	onDeleteClick : function() {
		var me = this;
		var tagStore = Ext.getStore(me.localeTagStore);

		var records = Ext.getCmp(me.internatlGridId).getSelectionModel().getSelection();

		if (records.length == 0) {
			showInfo('请选择要删除的国际化编码');
			return;
		}

		var codes = [];
		var newTagRecord = [];

		records.forEach(function(record) {
			if (record.data.isNew) {
				newTagRecord.push(record);
			} else {
				codes.push(record.data.lang_code);
			}

		});

		Ext.MessageBox.show({
			title : '删除国际化编码',
			msg : '确定删除国际化编码吗？',
			buttons : Ext.MessageBox.YESNO,
			fn : function(buttonId) {
				if (buttonId == 'yes') {

					tagStore.remove(newTagRecord);

					// 如果只是删除的新建的，就不发送请求
					if (newTagRecord.length > 0 && codes.length === 0) {
						showSuccess("删除国际化编码成功！");
					}

					if (codes.length === 0) {
						return;
					}

					Ext.Ajax.request({
						url : me.deleteTagUrl,
						params : {
							tags : codes.join(",")
						},
						success : function(response) {
							var res = JSON.parse(response.responseText);

							App.InterPath(res, function() {
								if (res.success) {
									showSuccess(res.msg);
									tagStore.remove(records);
								} else {
									showError(res.msg);
								}
							});

							me.clearLocaleContent();
						},
						failure : function(response) {
							showError("服务内部错误!");
							me.clearLocaleContent();
						}
					});
				}
			}
		});

	},

	/**
	 * 显示当前标签的所有语言数据
	 */
	onItemClick : function(grid, record, item, index) {
		var me = this;

		if (grid.getSelectionModel().getSelection().length > 1) {
			me.clearLocaleContent();

			return;
		}

		Ext.getStore(me.contentStoreId).load({
			url : me.contentUrl,
			params : {
				lang_code : record.data.lang_code
			}
		});

	},

	/**
	 * 查询语言动作
	 */
	onQueryLang : function() {
		var me = this;

		Ext.getStore(me.internalStroeId).load({
			url : me.internatUrl,
			params : Ext.getCmp(me.queryFormId).getForm().getValues()
		});

	},

	/**
	 * 查询语言动作
	 */
	onRestQueryLang : function() {
		Ext.getCmp(this.queryFormId).getForm().reset();

		this.onQueryLang();
	},

	/**
	 * 新建或更新国际化编码
	 */
	updateLocaleContent : function(record, editors) {
		var me = this;

		/*
		 * if (editors[1].lastValue == record.data.lang_code &&
		 * (editors[2].lastValue == record.data.project_id ||
		 * editors[2].lastValue == editors[2].originalValue)) {
		 * showInfo("国际化信息没有发生改变！"); return; }
		 */
		var oldRecord = {
			lang_code : record.data.lang_code,
			project_id : record.data.project_id,
			project_name : record.data.project_name,
		};

		// 模块没有改变时
		var isNewProjectId = editors[2].lastValue == record.data.project_id || editors[2].lastValue == editors[2].originalValue;

		var params = {
			"new_code" : editors[1].lastValue,
			"tag.lang_code" : record.data.isNew ? null : record.data.lang_code,
			"tag.project_id" : isNewProjectId ? (record.data.project_id || editors[2].lastValue) : editors[2].lastValue
		};

		if (!/^[a-zA-z.]{1,200}$/.test(params["tag.lang_code"]) || !/^[a-zA-z.]{1,200}$/.test(params["new_code"])) {
			showError("国际化编码只能为字母和小数点,并且长度不超过200");
			return;
		}

		if (params["tag.project_id"] == "-1") {
			showError("请选择国际化所属模块");
			return;
		}

		if (!params["tag.project_id"]) {
			showError("请选择模块");
			return;
		}

		Ext.MessageBox.show({
			title : '保存国际化编码',
			msg : '确定保存国际化编码吗？',
			buttons : Ext.MessageBox.YESNO,
			fn : function(buttonId) {
				if (buttonId == 'yes') {
					Ext.Ajax.request({
						url : record.data.isNew ? me.saveTagUrl : me.updateTagUrl,
						params : params,
						success : function(response) {
							var res = JSON.parse(response.responseText);

							App.InterPath(res, function() {
								if (res.success) {
									var tag = res.tag;

									showSuccess(res.msg);
									record.set("lang_code", editors[1].getValue());
									record.set("project_id", tag.project_id);
									record.set("project_name", editors[2].rawValue);

									if (record.data.isNew) {
										record.set("create_by", tag.create_by);
										record.set("create_date", tag.create_date);
										record.set("isNew", false);
									}
									record.set("modify_by", tag.modify_by);
									record.set("modify_date", tag.modify_date);
								} else {
									record.set("lang_code", oldRecord.lang_code);
									record.set("project_id", oldRecord.project_id);
									record.set("project_name", oldRecord.project_name);
								}

								record.commit();
							});
						},
						failure : function(response) {
							showError("服务内部错误!");
						}
					});
				} else {
					record.set("lang_code", oldRecord.lang_code);
					record.set("project_id", oldRecord.project_id);
					record.set("project_name", oldRecord.project_name);
					record.commit();
				}
			}
		});

	},

	/**
	 * 
	 */
	localeContentChange : function(record, editors) {
		var me = this;
		// if (editors[1].lastValue == record.data.lang_value) {
		// showInfo("国际化内容没有发生改变！");
		// return;
		// }

		var params = {
			"content.id" : record.data.id,
			"content.locale_key" : record.data.locale_key,
			"content.lang_code" : record.data.lang_code,
			"content.lang_value" : editors[1].lastValue.trim()
		};

		if (params["content.lang_value"].length == 0 || params["content.lang_value"].length > 300) {
			showError("国际化内容的长度不为0,并且不超过300！");
			return;
		}

		Ext.MessageBox.show({
			title : '保存国际化内容',
			msg : '确定保存国际化内容吗？',
			buttons : Ext.MessageBox.YESNO,
			fn : function(buttonId) {
				if (buttonId == 'yes') {
					Ext.Ajax.request({
						url : record.data.id ? me.updateContentUrl : me.saveContentUrl,
						params : params,
						success : function(response) {
							var res = JSON.parse(response.responseText);

							App.InterPath(res, function() {
								if (res.success) {
									var content = res.content;

									showSuccess(res.msg);
									record.set("lang_value", editors[1].getValue());
									record.set("modify_by", content.modify_by);
									record.set("modify_date", content.modify_date);
									record.set("id", content.id);

									if (record.data.isNew) {
										record.set("create_by", content.create_by);
										record.set("create_date", content.create_date);
										record.set("isNew", false);
									}

									record.commit();
								} else {
									showError(res.msg);
									record.cancelEdit();
								}
							});
						},
						failure : function(response) {
							showError("服务内部错误!");
						}
					});
				}
			}
		});

	}

});