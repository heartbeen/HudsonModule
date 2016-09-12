Ext.define('Deviser.ModuleDeviseInfo', {
	extend : 'Ext.window.Window',

	frame : true,
	height : 600,
	width : 800,
	modal : true,
	resumeid : null,
	layout : {
		type : 'border'
	},
	bodyPadding : 3,
	title : '模具设计详情',
	fieldDefaults : {
		labelWidth : 65
	},
	initComponent : function() {
		var me = this;

		Ext.applyIf(me, {
			items : [ {
				id : 'dp-devise-resume-form',
				xtype : 'form',
				region : 'west',
				split : true,
				width : 300,
				bodyPadding : 10,
				title : '模具设计履历详情',
				fieldDefaults : {
					labelWidth : 65
				},
				items : [ {
					fieldLabel : '设计组别',
					name : 'groupid',
					xtype : 'combobox',
					anchor : '100%',
					editable : false,
					displayField : 'name',
					allowBlank : false,
					valueField : 'id',
					store : Ext.create('Ext.data.Store', {
						fields : [ 'id', 'name', 'stepid' ],
						proxy : {
							url : 'devise/share/getGroupInfo',
							type : 'ajax',
							reader : {
								type : 'json'
							}
						},
						autoLoad : true
					})
				}, {
					fieldLabel : '客户番号',
					name : 'guestcode',
					xtype : 'textfield',
					readOnly : true,
					anchor : '100%'
				}, {
					fieldLabel : '社内编号',
					name : 'modulecode',
					xtype : 'textfield',
					readOnly : true,
					anchor : '100%'
				}, {
					fieldLabel : '客户名称',
					name : 'shortname',
					xtype : 'textfield',
					readOnly : true,
					anchor : '100%'
				}, {
					fieldLabel : '模具状态',
					name : 'resumestate',
					xtype : 'textfield',
					readOnly : true,
					anchor : '100%'
				}, {
					fieldLabel : '加工状态',
					name : 'workstatename',
					xtype : 'textfield',
					readOnly : true,
					anchor : '100%'
				}, {
					fieldLabel : '订单日期',
					name : 'orderdate',
					readOnly : true,
					xtype : 'textfield',
					anchor : '100%'
				}, {
					fieldLabel : '订单纳期',
					name : 'duedate',
					readOnly : true,
					xtype : 'textfield',
					anchor : '100%'
				}, {
					fieldLabel : '预计开始',
					name : 'startdate',
					xtype : 'textfield',
					readOnly : true,
					anchor : '100%'
				}, {
					fieldLabel : '预计完成',
					name : 'enddate',
					xtype : 'textfield',
					readOnly : true,
					anchor : '100%'
				}, {
					fieldLabel : '实际开始',
					name : 'actualstart',
					xtype : 'textfield',
					readOnly : true,
					anchor : '100%'
				}, {
					fieldLabel : '实际完成',
					name : 'actualend',
					xtype : 'textfield',
					readOnly : true,
					anchor : '100%'
				}, {
					fieldLabel : '打合担当',
					name : 'takeon',
					xtype : 'textfield',
					readOnly : true,
					anchor : '100%'
				}, {
					fieldLabel : '设计担当',
					name : 'deviser',
					xtype : 'textfield',
					readOnly : true,
					anchor : '100%'
				}, {
					fieldLabel : '备注说明',
					name : 'remark',
					xtype : 'textareafield',
					readOnly : true,
					anchor : '100%',
					height : 108
				} ]
			}, {
				xtype : 'container',
				region : 'center',
				layout : {
					align : 'stretch',
					type : 'vbox'
				},
				items : [ {
					xtype : 'gridpanel',
					flex : 1,
					height : 537,
					listeners : {
						itemclick : function(grid, record) {
							var k_store = Ext.getStore('dp-schedule-task-store');
							k_store.load({
								params : {
									scheid : record.get('id')
								}
							});
						}
					},
					forceFit : true,
					viewConfig : {
						getRowClass : function(record, rowIndex, p, store) {
							if (record.get('relay')) {
								return 'state-20203';
							}
						}
					},
					title : '制程计划安排',
					store : Ext.create('Ext.data.Store', {
						id : 'dp-schedule-info-store',
						fields : [ 'id', 'craftname', 'statename', {
							name : 'planstart',
							type : 'date'
						}, {
							name : 'planend',
							type : 'date'
						}, {
							name : 'factstart',
							type : 'date'
						}, {
							name : 'factend',
							type : 'date'
						}, 'planhour', 'acthour', 'kind', 'relay' ],
						autoLoad : true,
						proxy : {
							url : 'devise/share/getProcessScheduleInfo?resumeid=' + me.resumeid,
							type : 'ajax',
							reader : {
								type : 'json'
							}
						}
					}),
					columns : [ {
						dataIndex : 'craftname',
						text : '制程名称',
						renderer : RenderFontBold
					}, {
						dataIndex : 'statename',
						text : '加工状态',
						renderer : RenderFontBold
					}, {
						xtype : 'datecolumn',
						dataIndex : 'planstart',
						text : '计划开始',
						renderer : function(val) {
							return val ? '<b>' + Ext.Date.format(val, 'Y-m-d') + '</b>' : val;
						}
					}, {
						xtype : 'datecolumn',
						dataIndex : 'planend',
						text : '计划结束',
						renderer : function(val) {
							return val ? '<b>' + Ext.Date.format(val, 'Y-m-d') + '</b>' : val;
						}
					}, {
						xtype : 'datecolumn',
						dataIndex : 'factstart',
						width : 130,
						text : '实际开始',
						renderer : function(val) {
							return val ? '<b>' + Ext.Date.format(val, 'Y-m-d H:i') + '</b>' : val;
						}
					}, {
						xtype : 'datecolumn',
						dataIndex : 'factend',
						width : 130,
						text : '实际结束',
						renderer : function(val) {
							return val ? '<b>' + Ext.Date.format(val, 'Y-m-d H:i') + '</b>' : val;
						}
					}, {
						dataIndex : 'planhour',
						text : '计划用时(H)',
						renderer : RenderFontBold
					}, {
						dataIndex : 'acthour',
						text : '实际用时(H)',
						renderer : RenderFontBold
					} ]
				}, {
					xtype : 'gridpanel',
					flex : 1,
					margins : '4 0 0 0',
					forceFit : true,
					viewConfig : {
						getRowClass : function(record, rowIndex, p, store) {
							if (!record.get('istime')) {
								return 'state-20203';
							}
						}
					},
					store : Ext.create('Ext.data.Store', {
						id : 'dp-schedule-task-store',
						fields : [ 'empname', 'worknumber', 'regionname', 'craftname', 'statename', {
							name : 'lrcdtime',
							type : 'date'
						}, {
							name : 'nrcdtime',
							type : 'date'
						}, 'acthour', 'istime' ],
						autoLoad : true,
						proxy : {
							url : 'devise/share/getScheduleTaskInfo',
							type : 'ajax',
							reader : {
								type : 'json'
							}
						}
					}),
					title : '制程设计明细',
					columns : [ {
						dataIndex : 'empname',
						text : '设计人员',
						renderer : RenderFontBold
					}, {
						dataIndex : 'worknumber',
						text : '工牌编号',
						renderer : RenderFontBold
					}, {
						dataIndex : 'regionname',
						text : '所在组别',
						renderer : RenderFontBold
					}, {
						dataIndex : 'craftname',
						text : '制程名称',
						width : 130,
						renderer : RenderFontBold
					}, {
						dataIndex : 'statename',
						text : '设计状态',
						renderer : RenderFontBold
					}, {
						dataIndex : 'lrcdtime',
						text : '开始时间',
						width : 130,
						renderer : function(val) {
							return val ? '<b>' + Ext.Date.format(val, 'Y-m-d H:i') + '</b>' : val;
						}
					}, {
						dataIndex : 'nrcdtime',
						width : 130,
						text : '结束时间',
						renderer : function(val) {
							return val ? '<b>' + Ext.Date.format(val, 'Y-m-d H:i') + '</b>' : val;
						}
					}, {
						dataIndex : 'acthour',
						text : '实际用时(H)',
						renderer : RenderFontBold
					} ]
				} ]
			} ]
		});

		me.callParent(arguments);

		Ext.getCmp('dp-devise-resume-form').load({
			url : 'devise/share/getModuleResumeById?resumeid=' + me.resumeid
		});
	}

});
/**
 * 模具加工模块
 */
Ext.define('Deviser.DeviserProject', {
	extend : 'Ext.ux.desktop.Module',

	requires : [ 'Ext.tab.Panel', 'Portlet.PortalPanel' ],

	id : 'deviser-project-win',
	tabpanelId : 'deviser-project-tabpanel',
	moduleId : 8,
	moduleName : 'deviser',// 模具模块名称
	/** 公告板显示结构 */
	portletStruc : [ {
		id : 'deviserportalpanel-left',
		children : []
	} ],

	init : function() {
		this.launcher = {
			text : 'Tab Window',
			iconCls : this.id
		};
	},
	initCellContent : function(val, meta, record) {
		var fcnt = parseInt(record.get('fcnt'));
		console.info(fcnt);
		var ecnt = parseInt(record.get('ecnt'));
		return '<div class = "' + (fcnt ? (ecnt ? 'x-grid-cell-content-red' : 'x-grid-cell-content') : 'x-grid-cell-content-green') + '">'
				+ (val ? val : '') + '</div>';
	},
	initDateCell : function(val, meta, record) {
		var fcnt = parseInt(record.get('fcnt'));
		var ecnt = parseInt(record.get('ecnt'));
		console.info(fcnt);
		var tDate = Ext.Date.format(val, 'Y-m-d');
		return '<div class = "' + (fcnt ? (ecnt ? 'x-grid-cell-content-red' : 'x-grid-cell-content') : 'x-grid-cell-content-green') + '">'
				+ (tDate ? tDate : '') + '</div>';
	},
	initDateTimeCell : function(val, meta, record) {
		var fcnt = parseInt(record.get('fcnt'));
		var ecnt = parseInt(record.get('ecnt'));
		console.info(fcnt);
		var tDate = Ext.Date.format(val, 'Y-m-d H:i');
		return '<div class = "' + (fcnt ? (ecnt ? 'x-grid-cell-content-red' : 'x-grid-cell-content') : 'x-grid-cell-content-green') + '">'
				+ (tDate ? tDate : '') + '</div>';
	},
	createWindow : function() {
		var me = this;
		var desktop = this.app.getDesktop();
		var win = desktop.getWindow(me.id);
		if (!win) {
			var portletMenuItems = [];// 公告板菜单项
			var portletItems = [];// 公告板

			var ps = me.portletStruc;

			// 生成公告板:portletStruc
			for ( var i in ps) {
				var childItems = [];
				for ( var s in ps[i].children) {
					var randomId = hex_md5(new Date().getTime() + "");

					if (ps[i].children[s].show) {
						childItems.push({
							title : ps[i].children[s].title,
							iconCls : ps[i].children[s].iconCls,
							id : randomId,
							parentId : ps[i].id,
							items : [ Ext.create(ps[i].children[s].name) ]
						});
					}

					portletMenuItems.push({
						id : 'menuitme-' + randomId,// 菜单ID由公告板ID+'-menuitme'组成
						checked : ps[i].children[s].show,
						text : ps[i].children[s].title,
						iconCls : ps[i].children[s].iconCls,
						parentId : ps[i].id,
						portletName : ps[i].children[s].name,
						checkHandler : me.portletShow
					});
				}

				if (i != ps.length - 1) {
					portletMenuItems.push('-');
				}

				portletItems.push({
					id : ps[i].id,
					items : childItems
				});
			}

			win = desktop.createWindow({
				id : me.id,
				tabpanelId : me.tabpanelId,
				title : '设计系统(HDSS)',
				maximized : true,
				// 此处加上此句的意思就是禁止ESC键
				onEsc : Ext.emptyFn,
				iconCls : 'color_palette-16',
				layout : 'border',

				dockedItems : [ {
					xtype : 'toolbar',
					items : [ {
						xtype : 'buttongroup',
						bodyPadding : 5,
						items : me.initProjectItem(me.onMainFunction)
					}, '->', {
						height : 75,
						width : 20,
						menu : Ext.create("Ext.menu.Menu", {
							items : portletMenuItems
						})
					} ]
				} ],

				items : [
						{
							xtype : 'panel',
							region : 'west',
							width : 170,
							title : '功能导航',
							layout : 'border',
							collapsed : false,
							collapsible : true,
							split : true,
							items : [ {
								xtype : 'dataview',
								autoScroll : true,
								region : 'center',
								store : Ext.create('Ext.data.Store', {
									autoLoad : true,
									storeId : 'deviser-subitem-dataview-id',
									fields : [ "id", "text", "name", "iconcls", "leaf" ],

									proxy : {
										type : 'memory',
									}
								}),

								itemSelector : 'div.module-subitemlist',
								cls : 'module-sub-view',
								overItemCls : 'module-subitemlist-hover',
								itemTpl : me.itemTpl,
								listeners : {
									itemclick : App.itemClick
								}
							} ]
						},
						{
							xtype : 'tabpanel',
							id : me.tabpanelId,
							region : 'center',
							activeTab : 0,
							items : [ {
								xtype : 'moduleportalpanel',
								title : '首页',
								iconCls : 'house-16',
								// items : portletItems
								bodyPadding : 3,
								items : [ {
									xtype : 'gridpanel',
									height : 780,
									columnLines : true,
									title : '设计计划安排',
									forceFit : true,
									frame : true,
									tbar : [ {
										text : '我的信息',
										iconCls : 'user-16',
										handler : function() {
											this.up('toolbar').down('textfield').setValue('');
											Ext.getStore('dp-devise-module-list').load({
												url : 'devise/share/getProcessModuleInfo',
												params : {
													isall : false
												}
											});
										}
									}, '-', {
										text : '全部信息',
										iconCls : 'sum-16',
										handler : function() {
											this.up('toolbar').down('textfield').setValue('');
											Ext.getStore('dp-devise-module-list').load({
												url : 'devise/share/getProcessModuleInfo',
												params : {
													isall : true
												}
											});
										}
									}, '-', {
										text : '按类型查找',
										iconCls : 'magnifier-16',
										menu : new Ext.menu.Menu({
											items : [ {
												text : "新模信息",
												iconCls : 'award_star_gold_1-16',
												handler : function() {
													var para = [ {
														name : 'DRR.STATEID',
														value : "'20401'",
														symbol : '='
													} ];

													me.queryDeviseByCase(para);
												}
											}, {
												text : "修模信息",
												iconCls : 'award_star_gold_2-16',
												handler : function() {
													var para = [ {
														name : 'DRR.STATEID',
														value : "'20402'",
														symbol : '='
													} ];

													me.queryDeviseByCase(para);
												}
											}, {
												text : '新模修正',
												iconCls : 'award_star_gold_3-16',
												handler : function() {
													var para = [ {
														name : 'DRR.STATEID',
														value : "'20402'",
														symbol : '='
													}, {
														name : 'DRR.AMEND',
														value : 1,
														symbol : '='
													} ];

													me.queryDeviseByCase(para);
												}
											}, '-', {
												text : "待设计",
												iconCls : 'award_star_gold_1-16',

												handler : function() {
													var para = [ {
														name : 'DRR.WORKSTATE',
														value : "'40101'",
														symbol : '='
													} ];

													me.queryDeviseByCase(para);
												}
											}, {
												text : "设计中",
												iconCls : 'award_star_gold_2-16',
												handler : function() {
													var para = [ {
														name : 'DRR.WORKSTATE',
														value : "'40102'",
														symbol : '='
													} ];

													me.queryDeviseByCase(para);
												}
											}, {
												text : "完成检修",
												iconCls : 'award_star_gold_1-16',
												handler : function() {
													var para = [ {
														name : 'DRR.WORKSTATE',
														value : "('40104','40105')",
														symbol : 'IN'
													} ];

													me.queryDeviseByCase(para);
												}
											}, '-', {
												text : "已发图",
												iconCls : 'award_star_gold_2-16',
												handler : function() {
													var para = [ {
														name : 'DRR.ISIMG',
														value : "1",
														symbol : "="
													} ];

													me.queryDeviseByCase(para);
												}

											} ]
										})
									}, '-', {
										text : "上周完成",
										iconCls : 'tick-16',
										handler : function() {
											Ext.getStore('dp-devise-module-list').load({
												url : 'devise/share/getDeviseFinishInfo',
												params : {
													ismonth : false
												}
											});
										}
									}, '->', {
										xtype : 'combobox',
										width : 120,
										editable : false,
										emptyText : '请选择组别',
										valueField : 'id',
										displayField : 'name',
										store : Ext.create('Ext.data.Store', {
											fields : [ 'id', 'name', 'stepid' ],
											proxy : {
												url : 'devise/share/getGroupInfo?inc=false',
												type : 'ajax',
												reader : {
													type : 'json'
												}
											},
											autoLoad : true
										}),
										listeners : {
											change : function(combo, nw) {
												Ext.getStore('dp-devise-module-list').load({
													url : 'devise/share/getGroupDesignInfo',
													params : {
														groupid : nw
													}
												});
											}
										}
									}, '-', {
										xtype : 'textfield',
										labelWidth : 65,
										emptyText : '输入客户番号',
										listeners : {
											change : function(txt, nw) {
												var k_store = Ext.getStore('dp-devise-module-list');
												k_store.clearFilter();
												if (nw) {
													k_store.filterBy(function(record) {
														// 按客户番号搜索
														var kcode = record.get('guestcode');
														if (kcode && kcode.indexOf(nw) > -1) {
															return true;
														}

														// 按社内番号搜索
														var mcode = record.get('modulecode');
														return mcode && mcode.indexOf(nw) > -1;
													});
												}
											}
										}
									} ],
									store : new Ext.data.Store({
										id : 'dp-devise-module-list',
										fields : [ 'id', 'modulebarcode', 'shortname', 'moduleclass', 'guestcode', 'productname', 'modulecode',
												'ecnt', 'imagepath', 'unitextrac', 'takeon', 'deviser', 'pictureurl', 'remark', 'ensure',
												'workpressure', 'groupid', 'groupname', {
													name : 'startdate',
													type : 'date'
												}, {
													name : 'enddate',
													type : 'date'
												}, {
													name : 'duedate',
													type : 'date'
												}, {
													name : 'orderdate',
													type : 'date'
												}, {
													name : 'actualstart',
													type : 'date'
												}, 'fcnt' ],
										proxy : {
											url : 'devise/share/getProcessModuleInfo',
											type : 'ajax',
											reader : {
												type : 'json'
											}
										},
										autoLoad : true
									}),
									listeners : {
										itemdblclick : function(grid, record) {
											var gcode = record.get('guestcode');
											var dimension = Monitor.ratioRect(0.67);
											new Deviser.ModuleDeviseInfo({
												resumeid : record.get('id'),
												width : dimension.x,
												height : dimension.y,
												title : (gcode ? gcode : '') + '模具设计详情'
											}).show();
										},
										cellclick : function(grid, td, cellIndex, record) {
										}
									},
									columns : [ new Ext.grid.RowNumberer({
										header : "序号",
										width : 40
									}), {
										xtype : 'gridcolumn',
										text : '客户',
										dataIndex : 'shortname',
										width : 120,
										height : 40,
										renderer : me.initCellContent
									}, {
										dataIndex : 'imagepath',
										text : '图片',
										width : 60,
										align : 'center',
										renderer : function(value) {
											return "<img width='48px' heigth='48px' src='devise/share/requestScaleImage?filename=" + value + "' />";
										}
									}, {
										text : '机种',
										dataIndex : 'moduleclass',
										width : 120,
										renderer : me.initCellContent
									}, {
										text : '品番/模号',
										dataIndex : 'guestcode',
										width : 120,
										renderer : me.initCellContent
									}, {
										text : '品名',
										dataIndex : 'productname',
										width : 120,
										renderer : me.initCellContent
									}, {
										text : '社内编号',
										dataIndex : 'modulecode',
										width : 100,
										renderer : me.initCellContent
									},
									// {
									// text : '取数',
									// dataIndex : 'unitextrac',
									// width : 60,
									// renderer : me.initCellContent
									// }, {
									// text : '吨位(T)',
									// dataIndex : 'workpressure',
									// width : 60,
									// renderer : me.initCellContent
									// },
									{
										text : '项目组别',
										dataIndex : 'groupname',
										width : 80,
										renderer : me.initCellContent
									}, {
										text : '打合担当',
										dataIndex : 'takeon',
										width : 80,
										renderer : me.initCellContent
									}, {
										text : '设计担当',
										dataIndex : 'deviser',
										width : 80,
										renderer : me.initCellContent
									}, {
										xtype : 'datecolumn',
										text : '订单日期',
										dataIndex : 'orderdate',
										width : 80,
										renderer : me.initDateCell
									}, {
										xtype : 'datecolumn',
										text : '订单纳期',
										dataIndex : 'duedate',
										width : 80,
										renderer : me.initDateCell
									}, {
										xtype : 'datecolumn',
										text : '预计开始',
										dataIndex : 'startdate',
										width : 80,
										renderer : me.initDateCell
									}, {
										xtype : 'datecolumn',
										text : '预计结束',
										dataIndex : 'enddate',
										width : 80,
										renderer : me.initDateCell
									}, {
										xtype : 'datecolumn',
										text : '实际开始',
										dataIndex : 'actualstart',
										width : 100,
										renderer : me.initDateTimeCell
									} ]
								} ]

							} ]
						} ]
			});
		}
		return win;
	},

	queryDeviseByCase : function(para) {
		Ext.getStore('dp-devise-module-list').load({
			url : 'devise/share/queryDeviseInfoByCase',
			params : {
				tablepara : Ext.JSON.encode(para)
			}
		});
	},

	/**
	 * 显示公告板
	 */
	portletShow : function(item) {

		var parentPanel = Ext.getCmp(item.parentId);
		var portletId = item.id.replace('menuitme-', '');
		// 不显示当前公告板
		if (!item.checked) {
			// 公告板在任何一列都可以进行删除
			var up = Ext.getCmp(portletId).up('portalcolumn');
			up.remove(portletId);
			return;
		}

		try {
			parentPanel.add(Ext.create('Portlet.Portlet', {
				iconCls : item.iconCls,
				title : item.text,
				id : portletId,
				parentId : item.parentId,
				items : [ Ext.create(item.portletName) ]
			}));
		} catch (e) {
			Ext.MessageBox.show({
				title : '错误',
				msg : '公告显示错误,请通知管理员!',
				buttons : Ext.MessageBox.OK,
				icon : Ext.MessageBox.ERROR
			});
		}
	},
	onMainFunction : function() {
		Ext.getStore('deviser-subitem-dataview-id').loadData(this.children);
	}
});
