/**
 * 模具加工排程:计划与实际
 */
Ext.define('Module.ModuleSchedulerQuery', {

	extend : 'Ext.panel.Panel',
	layout : 'border',

	requires : [ 'Project.component.PagingMemoryProxy' ],

	/**
	 * 模具查询接口
	 */
	flowUrl : 'public/queryModulePartFlow?id=',
	selResumeId : '',
	/**
	 * 模具信息对象
	 */
	rowdata : {
		guestname : '',
		modulecode : '',
		unitextrac : '',
		detector : '',
		executive : '',
		designer : '',
		workpressure : '',
		productname : '',
		plastic : '',
		moduleclass : '',
		starttime : '1900-01-01 00:00:00',
		endtime : '1900-01-01 00:00:00'
	},
	state : {
		sch : 'sch-flow-event-normal',
		sch20209 : 'sch-flow-event-finish',
		sch20208 : 'sch-flow-event-wait',
		sch20201 : 'sch-flow-event-doing',
		sch20202 : 'sch-flow-event-pause',
		sch20203 : 'sch-flow-event-pause'
	},
	stateText : {
		sch20209 : '加工完',
		sch20208 : '待加工',
		sch20201 : '加工中',
		sch20202 : '暂停中',
		sch20203 : '停止中',
		sch20205 : '外发中'
	},

	initComponent : function() {
		var me = this;

		me.flowStore = Ext.create('Ext.data.Store', {
			fields : [ 'partbarlistcode', 'remark', 'partname', 'partflow', 'actualflow' ],
			pageSize : 20,
			autoLoad : false,
			proxy : {
				url : '',
				type : 'ajax',
				reader : {
					type : 'json',
					root : 'parts',
					totalProperty : 'total'
				}
			}
		});

		me.schedulerGrid = Ext.create('Ext.grid.Panel', {
			region : 'center',
			// rowHeight : 46,
			title : '工件加工流程',
			store : me.flowStore,
			rowLines : true,
			columnLines : true,
			hideHeaders : true,
			columns : [ {
				text : '工件部号',
				width : 160,
				dataIndex : 'partname',
				locked : true,
				renderer : me.renderPartName
			}, {
				width : 60,
				text : '',
				dataIndex : 'region',
				locked : true,
				renderer : me.renderRemark
			}, {
				width : 1200,
				scope : me,
				text : '计划与实际排程',
				renderer : me.renderPartFlow
			} ],
			tbar : [ {
				id : 'msq-part-id',
				xtype : 'textfield',
				emptyText : '请输入零件编号',
				listeners : {
					scope : me,
					change : me.queryModuleScheduleByPcode
				}
			}, '->', {
				id : 'msq-chk-showall',
				xtype : 'checkbox',
				fieldLabel : '显示全部零件',
				labelWidth : 80,
				margins : '0 5'
			} ],
			bbar : Ext.create('Ext.PagingToolbar', {
				store : me.flowStore,
				displayInfo : true,
				displayMsg : '显示记录行号: {0} - {1}    共{2}条',
				emptyMsg : "没有记录",
				items : [ "-", {
					type : "button",
					text : "签收显示",
					iconCls : 'camera-16',
					handler : function() {
						Ext.create("AcceptShowWindow").show();
					}
				} ]
			})
		});

		/*
		 * dockedItems : [ { xtype : 'toolbar', dock : 'top', defaults : { style :
		 * 'text-align:center;padding-top:2px;font-weight: bold;', height : 22,
		 * width : 50 }, items : [ { xtype : 'label', text : '说明:', }, { xtype :
		 * 'label', text : '正常', cls : 'sch-flow-event sch-flow-event-normal' }, {
		 * xtype : 'label', text : '待加工', cls : 'sch-flow-event
		 * sch-flow-event-wait' }, { xtype : 'label', text : '加工中', cls :
		 * 'sch-flow-event sch-flow-event-doing' }, { xtype : 'label', text :
		 * '暂停', cls : 'sch-flow-event sch-flow-event-pause' }, { xtype :
		 * 'label', text : '加工完', cls : 'sch-flow-event sch-flow-event-finish' } ] } ]
		 */

		Ext.apply(me, {
			items : [
					{
						xtype : 'panel',
						region : 'west',
						title : '模具列表',
						width : 305,
						split : true,
						collapsible : true,
						layout : 'border',
						defaults : {
							padding : 2
						},
						items : [
								{
									xtype : 'gridpanel',
									region : 'center',
									title : '查找模具',
									forceFit : true,
									rootVisible : false,
									store : Ext.create('Ext.data.Store', {
										autoLoad : true,
										fields : [ "endtime", "starttime", "modulebarcode", 'modulecode', "guestcode", "resumename", "resumestate",
												"text", "id" ],
										proxy : {
											url : '',
											type : 'ajax',
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
									dockedItems : [ {
										xtype : 'toolbar',
										dock : 'top',
										items : [ {
											id : 'msq-chk-by-guest',
											xtype : 'checkbox',
											boxLabel : '依番号'
										}, ''
										// ,
										// Ext.create('Module.ModuleFindTextField',
										// {
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
											text : '导出模具数据',
											iconCls : 'application_go-16',
											handler : function() {
												Ext.create("ModuleScheduleExportWindow").show();
											}
										} ]
									} ],

									listeners : {
										scope : me,
										itemclick : me.clickQueryModuleSchedule
									}
								}, {
									xtype : 'propertygrid',
									split : true,
									id : 'msq-detailed-module-propertygrid',
									nameColumnWidth : 70,
									height : 300,
									sortableColumns : false,
									title : '模具信息',
									hideHeaders : true,
									region : 'south',
									source : {}
								} ]
					}, me.schedulerGrid ]
		});

		me.callParent(arguments);
	},

	renderPartName : function(value, meta, record, rowIndex) {
		var remark = record.get('remark');
		return '<div class="schedule-partname-box ' + (rowIndex % 2 == 1 ? 'ext-even-row' : '') + '">' + value
				+ (remark ? '<font color = "#CF2782">[' + remark + ']</font>' : '') + '</div>';
	},
	/**
	 * 流程说明
	 */
	renderRemark : function(value, meta, record, rowIndex) {
		var row = rowIndex % 2 == 1 ? 'ext-even-row' : '';
		return '<div class="schedule-box ' + row + '"><div class="plan">计划</div><div class="actual">实际</div></div>';
	},
	/**
	 * 数组中是否包含值
	 */
	arrayIn : function(item, arr) {
		if (item && arr) {
			for ( var x in arr) {
				if (arr[x] == item) {
					return (true);
				}
			}
		}
		return (false);
	},
	/**
	 * 渲染流程数据
	 */
	renderPartFlow : function(value, meta, record, rowIndex) {
		var me = this;
		var html = '<div class="module-part-flow ' + (rowIndex % 2 == 1 ? 'ext-even-row' : '') + '"><div class="module-part-plan-flow">';

		var partflow = record.data.partflow;
		var actualflow = record.data.actualflow;

		var equalsFlow = [];// 计划排程序数据结构
		var actualCraftCount = [];// 统计实际工艺加工的次数

		var ldata = me.analysisFlowDelay(partflow, actualflow);

		for ( var i in partflow) {
			// 计划加工流程
			if (partflow[i].flowcraftcode) {

				var _ccode = partflow[i].flowcraftcode;
				var _rank = partflow[i].ranknum;

				html = html.concat('<div class="sch-flow-event ');
				html = html.concat(ldata[_ccode + '!' + _rank] ? 'sch-flow-event-delay' : 'sch-flow-event-normal');
				html = html.concat('"><div class="sch-flow-resizable-handle sch-flow-resizable-handle-end"></div>');
				html = html.concat('<div class="sch-flow-resizable-handle sch-flow-resizable-handle-start"></div>');
				html = html.concat('<div class="sch-flow-event-inner sch-flow-plan-inner">');
				html = html.concat(partflow[i].flowcraftcode).concat("<span style=\"float:right;padding:0px 0px 0px 30px\">");
				html = html.concat(Ext.Date.format(Ext.Date.parse(partflow[i].endtime, 'Y-m-d H:i:s'), 'n/j'));
				html = html.concat('</span></div></div>');

				// 将计划排程保存成对象
				if (!equalsFlow[partflow[i].flowcraftcode]) {
					equalsFlow[partflow[i].flowcraftcode] = [];
				}

				equalsFlow[partflow[i].flowcraftcode].push(partflow[i]);

			}
		}

		html = html.concat('</div><div class="module-part-actual-flow">');
		for ( var i in actualflow) {
			// 实际加工流程

			if (actualCraftCount[actualflow[i].ncraft] == null) {
				actualCraftCount[actualflow[i].ncraft] = 0;
			} else {
				++actualCraftCount[actualflow[i].ncraft];
			}

			if (actualflow[i].flag && me.arrayIn(actualflow[i].partstateid, [ '20202', '20203', '20208' ])) {
				// 最后工件所在位置 取消待加工颜色区分
				html = html.concat('<div class="sch-last-flow ').concat(me.state['sch']).concat('">');
				html = html.concat('<div class="sch-flow-resizable-handle sch-flow-resizable-handle-end"></div>');
				html = html.concat('<div class="sch-flow-resizable-handle sch-flow-resizable-handle-start"></div>');
				html = html.concat('<div unselectable="on" class="sch-flow-event-inner sch-flow-actual-inner">');
				html = html.concat(actualflow[i].departname);
				html = html.concat("<span style=\"float:right;padding:0px 0px 0px 30px\">").concat(
						actualflow[i].departname.indexOf("組立") > -1 ? "" : me.stateText['sch' + actualflow[i].partstateid]).concat(
						"</span></div></div>");
			} else {
				// 是否为最后一个工艺,最后一个工艺的宽度较大
				// actualflow[i].flag ? '<div class="sch-last-flow ' :

				if (actualflow[i].ldeptid != null) {

					if (actualflow[i].nrcdtime && actualflow[i].ncraft) {
						// 判断是否延时
						html = html.concat('<div class="sch-flow-event ').concat(me.analyzeFlowTime(equalsFlow, {
							craft : actualflow[i].ncraft,
							time : actualflow[i].nrcdtime,
							count : actualCraftCount[actualflow[i].ncraft],
							isout : actualflow[i].isout
						}, true)).concat('">');

						html = html.concat('<div class="sch-flow-resizable-handle sch-flow-resizable-handle-end"></div>');
						html = html.concat('<div class="sch-flow-resizable-handle sch-flow-resizable-handle-start"></div>');
						html = html.concat('<div unselectable="on" class="sch-flow-event-inner">');
						html = html.concat(actualflow[i].ncraft).concat("<span style=\"float:right;padding:0px 0px 0px 30px\">");
						html = html.concat(Ext.Date.format(Ext.Date.parse(actualflow[i].nrcdtime, 'Y-m-d H:i:s'), 'n/j'));
					} else {
						// 判断是否延时
						html = html.concat('<div class="sch-last-flow ').concat(me.analyzeFlowTime(equalsFlow, {
							craft : actualflow[i].ncraft,
							count : actualCraftCount[actualflow[i].ncraft],
							isout : false
						}, false)).concat('">');

						html = html.concat('<div class="sch-flow-resizable-handle sch-flow-resizable-handle-end"></div>');
						html = html.concat('<div class="sch-flow-resizable-handle sch-flow-resizable-handle-start"></div>');
						html = html.concat('<div unselectable="on" class="sch-flow-event-inner"">');
						html = html.concat(actualflow[i].departname).concat("<span style=\"float:right;padding:0px 0px 0px 30px\">");
						html = html.concat(actualflow[i].departname.indexOf("組立") > -1 ? "" : me.stateText['sch' + actualflow[i].partstateid]);
					}
				} else {
					html = html.concat('<div class="sch-flow-event ').concat(me.state['sch']).concat('">');
					html = html.concat('<div class="sch-flow-resizable-handle sch-flow-resizable-handle-end"></div>');
					html = html.concat('<div class="sch-flow-resizable-handle sch-flow-resizable-handle-start"></div>');
					html = html.concat('<div unselectable="on" class="sch-flow-event-inner" style="color:#B40C0C;">');
					html = html.concat('未被签收');
				}

				html = html.concat('</span></div></div>');
			}
		}

		// 没有实际加工记录
		if (!actualflow) {
			html = html.concat('<div class="sch-flow-event ').concat(me.state['sch']).concat('">');
			html = html.concat('<div class="sch-flow-resizable-handle sch-flow-resizable-handle-end"></div>');
			html = html.concat('<div class="sch-flow-resizable-handle sch-flow-resizable-handle-start"></div>');
			html = html.concat('<div unselectable="on" class="sch-flow-event-inner" style="color:#B40C0C;">');
			html = html.concat('未被签收</span></div></div>');
		}

		return html.concat('</div></div>');

	},

	/**
	 * 分析实际加工时间与计划排程时间的关系
	 */
	analyzeFlowTime : function(plan, actual, isFinsh) {
		// var flow = plan[actual.craft];
		if (actual.isout) {
			return "sch-flow-event-out sch-flow-actual-inner";
		}

		return "sch-flow-event-normal sch-flow-actual-inner";

		// try {
		// // 得到实际加工工艺,所在比对的工艺时间
		// actual.count = actual.count > flow.length ? flow.length :
		// actual.count;
		//
		// if (isFinsh) {
		// actual.count = actual.count > flow.length ? flow.length :
		// actual.count;
		//
		// if (Ext.Date.parse(actual.time, 'Y-m-d H:i:s').getTime() >
		// Ext.Date.parse(flow[actual.count].endtime, 'Y-m-d H:i:s').getTime())
		// {
		// return "sch-flow-event-delay";
		// }
		//
		// } else {
		// if (new Date().getTime() > Ext.Date.parse(flow[actual.count].endtime,
		// 'Y-m-d
		// H:i:s').getTime()) {
		// return "sch-flow-event-delay";
		// }
		// }
		// } catch (e) {
		// return "sch-flow-event-normal sch-flow-actual-inner";
		// }
		// return "sch-flow-event-normal sch-flow-actual-inner";

	},
	analysisFlowDelay : function(plan, actual) {
		var adata = {};
		try {
			for ( var x in plan) {
				var _craftcode = plan[x].flowcraftcode;
				var _ranknum = plan[x].ranknum;

				var _starttime = plan[x].starttime;
				var _endtime = plan[x].endtime;

				var _index = _craftcode + '!' + _ranknum;
				// 如果加工工艺不为空,则记录这个工艺情况
				if (_craftcode) {
					var aunit = {};

					aunit["starttime"] = _starttime;
					aunit["endtime"] = _endtime;

					adata[_index] = aunit;
				}
			}

			for ( var x in actual) {
				var _craftcode = actual[x].ncraft;
				var _nrcdtime = actual[x].nrcdtime;
				// 如果加工工艺不为空,则记录这个工艺情况
				if (_craftcode) {
					for ( var item in adata) {
						var spt = item.split('!');
						if (spt[0] == _craftcode) {
							if (adata[item]["nrcdtime"]) {
								continue;
							} else {
								adata[item]["nrcdtime"] = _nrcdtime;
								break;
							}
						}
					}
				}
			}

			var fdata = {};
			for ( var m in adata) {
				if (!adata[m].nrcdtime) {
					if (adata[m].starttime) {
						if (Ext.Date.parse(adata[m].starttime, 'Y-m-d H:i:s').getTime() < new Date().getTime()) {
							fdata[m] = true;
						} else {
							fdata[m] = false;
						}
					} else {
						fdata[m] = true;
					}
				} else {
					if (adata[m].endtime && adata[m].nrcdtime) {
						if (Ext.Date.parse(adata[m].endtime, 'Y-m-d H:i:s').getTime() < Ext.Date.parse(adata[m].nrcdtime, 'Y-m-d H:i:s').getTime()) {
							fdata[m] = true;
						} else {
							fdata[m] = false;
						}

					} else {
						fdata[m] = true;
					}
				}
			}
		} catch (e) {
		}

		return fdata;
	},

	/**
	 * 新模或修模/设变
	 */
	onResumeModule : function(ctrl, nw) {
		var item = this;
		var chk = Ext.getCmp('msq-chk-by-guest').getValue();
		item.up('gridpanel').getStore().load({
			url : 'public/getModuleResumeInfoByCase',
			params : {
				chk : chk,
				query : (item.isTxt ? nw : null),
				states : item.states
			}
		});
	},

	/**
	 * 读取模具工件
	 */
	clickQueryModuleSchedule : function(tree, record) {
		var me = this;

		var isall = Ext.getCmp('msq-chk-showall').getValue();

		me.selResumeId = record.data.id;
		me.flowStore.proxy.url = me.flowUrl + record.data.id + '&isall=' + isall;
		me.flowStore.loadPage(1);

		Ext.getCmp('msq-part-id').setValue(Ext.emptyString);

		Ext.Ajax.request({
			url : 'module/process/groupModuleInfo',
			method : 'POST',
			params : {
				moduleResumeId : record.data.id,
				flag : true
			},
			success : function(resp) {
				var json = Ext.JSON.decode(resp.responseText);
				if (json.success) {
					var pro = Ext.getCmp('msq-detailed-module-propertygrid');
					if (json.info.length == 1) {
						me.rowdata = json.info[0];
					}
					pro.setSource({
						"<span style='font-weight: bold;'>客户</span>" : me.rowdata.guestname,
						"<span style='font-weight: bold;'>模具工号</span>" : me.rowdata.modulecode,
						"<span style='font-weight: bold;'>取数</span>" : me.rowdata.unitextrac,
						"<span style='font-weight: bold;'>业务担当</span>" : me.rowdata.detector,
						"<span style='font-weight: bold;'>金型担当</span>" : me.rowdata.executive,
						"<span style='font-weight: bold;'>设计担当</span>" : me.rowdata.designer,
						"<span style='font-weight: bold;'>成形吨位</span>" : me.rowdata.workpressure,
						"<span style='font-weight: bold;'>产品名称</span>" : me.rowdata.productname,
						"<span style='font-weight: bold;'>产品材质</span>" : me.rowdata.plastic,
						"<span style='font-weight: bold;'>机种</span>" : me.rowdata.moduleclass,
						"<span style='font-weight: bold;'>开始时间</span>" : Ext.Date.format(new Date(me.rowdata.starttime), 'Y-m-d'),
						"<span style='font-weight: bold;'>完成时间</span>" : Ext.Date.format(new Date(me.rowdata.endtime), 'Y-m-d')
					});

				}
			}
		});
	},
	queryModuleScheduleByPcode : function(text, val) {
		var me = this;

		var chk = Ext.getCmp('msq-chk-showall').getValue();
		me.flowStore.proxy.url = me.flowUrl + me.selResumeId + '&pcode=' + val + '&isall=' + chk;
		me.flowStore.loadPage(1);
	}
});

/**
 * 导出模具进度窗口
 */
Ext.define("ModuleScheduleExportWindow", {
	title : '导出模具进度',
	extend : 'Ext.window.Window',
	iconCls : 'application_go-16',
	modal : true,
	width : 320,
	height : 400,

	initComponent : function() {
		var me = this;
		Ext.apply(me, {
			layout : 'border',
			items : [
					{
						xtype : 'gridpanel',
						border : false,
						id : 'export-module-grid',
						region : 'center',
						selType : 'checkboxmodel',
						forceFit : true,
						store : Ext.create('Ext.data.Store',
								{
									autoLoad : true,
									fields : [ "endtime", "starttime", "modulebarcode", 'modulecode', "guestcode", "resumename", "resumestate",
											"text", "id" ],
									proxy : {
										url : '',
										type : 'ajax',
										reader : {
											type : 'json',
											root : 'children'
										}
									}
								// ,
								// listeners : {
								// load : function(store, node, records,
								// successful, eOpts) {
								// if (records) {
								// Ext.Array.forEach(records, function(record) {
								// record.set("checked", false);
								// });
								// }
								// }
								// }
								}),
						columns : [ {
							text : '模具工号',
							dataIndex : 'text',
							renderer : function(val, meta, record) {
								var _resumename = record.get('resumename');
								var _guestcode = record.get('guestcode');
								return '<b>' + val + (_guestcode ? ('/<font color = blue>' + _guestcode + '</font>') : '') + "<font color = red>["
										+ (!_resumename ? '完成' : _resumename) + ']</font></b>';
							}
						} ],
						tbar : [ {
							id : 'msew-chk-by-guest',
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
						} ],
						bbar : [ {
							xtype : 'button',
							text : '工务排程',
							iconCls : 'manilla-document-open-16',
							handler : me.exportProcessSchedule
						}, '-', {
							xtype : 'button',
							text : '客户进度',
							iconCls : 'user-group-new-16',
							handler : me.exportCustomerSchedule
						} ]
					}, {
						xtype : 'FileDownloader',
						id : 'FileDownloader'
					} ]
		});
		me.callParent(arguments);
	},
	/**
	 * 新模或修模/设变
	 */
	// onResumeModule : function() {
	// var item = this;
	// item.up('treepanel').getStore().load({
	// url : 'public/moduleForResume',
	// params : {
	// isNew : item.isNew
	// }
	// });
	// },
	/**
	 * 新模或修模/设变
	 */
	onResumeModule : function(ctrl, nw) {
		var item = this;
		var chk = Ext.getCmp('msew-chk-by-guest').getValue();
		item.up('gridpanel').getStore().load({
			url : 'public/getModuleResumeInfoByCase',
			params : {
				chk : chk,
				query : (item.isTxt ? nw : null),
				states : item.states
			}
		});
	},

	/**
	 * 导出客户格式报表
	 */
	exportProcessSchedule : function() {
		var grid = Ext.getCmp('export-module-grid');
		var rows = grid.getSelectionModel().getSelection();
		var moduleArray = [];

		if (rows.length == 0) {
			showInfo("请选择要导出的模具工号!");
			return;
		}

		Ext.Array.forEach(rows, function(record) {
			moduleArray.push(record.get('id'));
		});

		layer.load("导出中...", 3);

		grid.getSelectionModel().deselectAll();

		Ext.create('Ext.form.Panel', {
			standardSubmit : true,
		}).submit({
			url : 'public/exportProcessSchedule',
			params : {
				moduleArray : moduleArray.join()
			},
			success : function(form, action) {
				showSuccess("下载成功!");
			},
			failure : function(form, action) {
				switch (action.failureType) {
				case Ext.form.action.Action.CLIENT_INVALID:
					showError("提交数据出现错误!");
					break;
				case Ext.form.action.Action.CONNECT_FAILURE:
					showError("下载出现错误!");
					break;
				case Ext.form.action.Action.SERVER_INVALID:
					showError("服务器错误!");
				}
			}
		});
	},
	/**
	 * 导出客户格式报表
	 */
	exportCustomerSchedule : function() {
		var tree = Ext.getCmp('export-module-tree');
		var nodes = tree.getChecked();
		var moduleArray = [];

		if (nodes.length == 0) {
			showInfo("请选择要导出的模具工号!");
			return;
		}

		Ext.Array.forEach(nodes, function(node) {
			moduleArray.push(node.data.id);
		});

		layer.load("导出中...", 3);

		document.location = 'public/exportCustomerSchedule?moduleArray=' + moduleArray.join();

	}
});

/**
 * 工件签收显示窗口
 */
Ext.define("AcceptShowWindow", {
	title : '工件签收显示',
	extend : 'Ext.window.Window',
	iconCls : 'camera-16',
	modal : true,
	width : 600,
	height : 500,

	initComponent : function() {
		var me = this;

		me.nowTime = App.currentTimeMillis();

		me.partStore = Ext.create("Ext.data.Store", {
			fields : [ 'modulecode', 'partlistcode', 'partname', 'craftname', {
				name : 'actualflow',// 模具实际加工
				type : 'object'
			}, {
				name : 'starttime',
				type : 'date'
			}, {
				name : 'endtime',
				type : 'date'
			} ],
			autoLoad : false,
			proxy : {
				type : 'memory'
			}
		});

		Ext.apply(me, {
			layout : 'border',
			items : [ {
				xtype : 'gridpanel',
				region : 'center',
				store : me.partStore,
				columns : [ {
					text : '模具工号',
					dataIndex : 'modulecode'
				}, {
					text : '工件部号',
					dataIndex : 'partlistcode'
				}, {
					text : '加工工艺',
					dataIndex : 'craftname'
				}, {
					xtype : 'datecolumn',
					text : '开工时间',
					dataIndex : 'starttime',
					format : 'Y-m-d H:i',
					width : 120
				}, {
					xtype : 'datecolumn',
					text : '结束时间',
					dataIndex : 'endtime',
					format : 'Y-m-d H:i',
					width : 120
				} ]
			} ],

			listeners : {
				destroy : function(win) {
					clearInterval(win.refresh);
				}
			}
		});

		me.refresh = setInterval(function() {
			Ext.Ajax.request({
				url : 'public/queryPartDynamic',
				async : false,
				params : {
					nowTime : me.nowTime,// 1419645600000 ,
					partState : 20208
				},
				success : function(response) {
					var data = Ext.JSON.decode(response.responseText);

					Ext.Array.forEach(data.parts, function(item) {
						me.partStore.insert(0, item);
					});

					me.nowTime = data.nowtime;
				}
			});
		}, 2000);

		me.callParent(arguments);
	}
});

/**
 * 排程导出窗口
 */
Ext.define('FileDownload', {
	extend : 'Ext.Component',
	alias : 'widget.FileDownloader',
	autoEl : {
		tag : 'iframe',
		cls : 'x-hidden',
		src : Ext.SSL_SECURE_URL
	},
	stateful : false,
	load : function(config) {
		var loadindex = layer.load("导出中...", 400000);
		var e = this.getEl();
		e.dom.src = config.url + (config.params ? '?' + Ext.urlEncode(config.params) : '');
		e.dom.onload = function() {
			var res = e.dom.contentDocument.body.childNodes[0].wholeText;

			if (res == '404') {
				showError("没有找到要下载的文件!");
			}

			if (res.substr(0, 1) == '5') {
				showError("文件下载出现错误,请通知管理员!");
			}

			layer.close(loadindex);
		};
	}
});