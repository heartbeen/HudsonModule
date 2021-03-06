Ext.define('Module.ArrangePartWindow', {
	extend : 'Ext.window.Window',

	height : 580,
	width : 700,
	resizable : false,
	modal : true,
	layout : {
		type : 'border'
	},
	bodyPadding : 5,
	title : '工件安排机台',
	iconCls : 'gtk-indent-rtl-16',
	format : 'Y-m-d G',

	initComponent : function() {
		var me = this;

		me.taskStore = Ext.create("Gnt.data.TaskStore", {
			// pageSize : 10,
			autoLoad : false,
			model : 'ModulePartModel',

			proxy : {
				type : 'ajax',
				url : '',
				// type : 'memory',
				reader : {
					type : 'json'
				}
			},
			rootVisible : false
		});

		Ext.applyIf(me, {
			items : [
					{
						xtype : 'ganttpanel',
						flex : 1.5,
						margins : '0 0 5 0 ',
						region : 'center',
						rowHeight : 20,
						taskStore : me.taskStore,
						columnLines : true,
						rowLines : true,
						rightLabelField : 'Responsible',
						highlightWeekends : true,// 突出显示周未
						showTodayLine : true,// 显示今天时间线
						loadMask : true,
						enableProgressBarResize : false,// 进度可否拖动
						skipWeekendsDuringDragDrop : false,
						weekendsAreWorkdays : true,// 周未也为工件时间

						startDate : new Date(),

						viewPreset : 'weekAndDayLetter',

						lockedGridConfig : {
							width : 200,
							title : '工艺',
							collapsible : true
						},

						lockedViewConfig : {
							getRowClass : function(rec) {
								return rec.isRoot() ? 'root-row' : '';
							},
							plugins : {
								ptype : 'treeviewdragdrop',
								containerScroll : true
							}
						},

						// Experimental
						schedulerConfig : {
							collapsible : true,
							title : '排程'
						},

						// Define an HTML template for the tooltip
						tooltipTpl : new Ext.XTemplate('<strong class="tipHeader">{Name}</strong>', '<table class="taskTip">',
								'<tr><td>开工时间:</td> <td align="right">{[values._record.getDisplayStartDate("Y年m月d日 H时")]}</td></tr>',
								'<tr><td>完工时间:</td> <td align="right">{[values._record.getDisplayEndDate("Y年m月d日 H时")]}</td></tr>', '</table>'),

						eventRenderer : function(task) {
							if (task.get('Color')) {
								var style = Ext.String.format('background-color: #{0};border-color:#{0}', task.get('Color'));

								return {
									// Here you can add custom per-task styles
									style : style
								};
							}
						},

						// Define the static columns
						columns : [ {
							xtype : 'treecolumn',
							header : '加工工艺',
							sortable : true,
							dataIndex : 'Name',
							width : 120,
							renderer : function(v, meta, r) {
								if (!r.data.leaf)
									meta.tdCls = 'sch-gantt-parent-cell';

								return v;
							}
						}, {
							xtype : 'startdatecolumn',
							text : '开工时间',
							format : me.format,
							width : 90

						}, {
							// hidden : true,
							xtype : 'enddatecolumn',
							text : '完工时间',
							format : me.format,
							width : 90
						}, {
							xtype : 'durationcolumn',
							text : '加工<br>时长',
							width : 55
						} ],

						dockedItems : [ {
							xtype : 'toolbar',
							// store: store, // same store GridPanel is using
							dock : 'bottom',
							displayInfo : true,
							items : [ '->', '-', {
								text : '全部显示',
								iconCls : 'zoomfit',
								handler : function() {
									this.up('ganttpanel').zoomToFit();
								}
							}, '-', {
								iconCls : 'icon-prev',
								text : '上一周',
								handler : function() {
									this.up('ganttpanel').shiftPrevious();
								}
							}, {
								iconCls : 'icon-next',
								text : '下一周',
								handler : function() {
									this.up('ganttpanel').shiftNext();
								}
							}, '-' ]
						} ]
					}, {
						xtype : 'container',
						flex : 1,
						region : 'south',
						height : 150,
						layout : {
							type : 'border'
						},
						items : [ {
							xtype : 'gridpanel',

							margins : '0 5 0 0',
							region : 'west',
							width : 170,
							title : '工件',

							store : Ext.create('Ext.data.Store', {
								storeId : 'arrange-part-store-id',
								fields : me.waitProcessPartFields,
								data : me.parts,
								proxy : {
									type : 'memory',
									reader : {
										type : 'json',
										root : 'list'
									}
								}
							}),

							columns : [ {
								xtype : 'gridcolumn',
								width : 120,
								dataIndex : 'partlistcode',
								text : '部号'
							}, {
								xtype : 'actioncolumn',
								width : 30,
								items : [ {
									iconCls : 'list-remove-16', // Use a URL in
									// the icon
									// config
									tooltip : '取消',
									handler : me.cancelPartArrange
								} ]
							} ]
						}, {
							xtype : 'tabpanel',
							title : me.craftTabTitle,
							flex : 1,
							region : 'center',
							items : me.craftSplitItems
						} ]
					} ],
			dockedItems : [ {
				xtype : 'toolbar',
				dock : 'bottom',
				ui : 'footer',
				items : [ {
					xtype : 'button',
					text : '删除该工单',
					scope : me,
					iconCls : 'editcut-16',
					scope : me,
					handler : me.deleteArrange,
				}, '->', {
					xtype : 'button',
					id : 'arrange-button-id',
					width : 70,
					text : '安排',
					scope : me,
					iconCls : 'gtk-yes-16',
					handler : me.arrangePart,
				}, {
					xtype : 'button',
					width : 70,
					text : '取消',
					iconCls : 'process-stop-16',
					scope : me,
					handler : function() {
						this.close();
					}
				} ]
			} ]
		});

		me.callParent(arguments);
	},

	/** 取消选中工件的加工安排 */
	cancelPartArrange : function(grid, rowIndex, colIndex) {
		var store = grid.getStore();
		var rec = store.getAt(rowIndex);

		Ext.MessageBox.show({
			title : '安排',
			msg : '是否取消<' + rec.data.partlistcode + '>的加工安排?',
			buttons : Ext.MessageBox.YESNO,
			buttonText : {
				yes : "是",
				no : "否"
			},
			fn : function(btn) {
				if (btn == 'yes') {
					store.remove(rec);

					// 工件有安排过时,就取消安排
					if (rec.data.schbarcode) {
						var me = grid.up('window');
						me.cancelArrangePart(me, rec.data.id, rec.data.schbarcode, store.getCount() == 0 ? true : false);
					}

					if (store.getCount() == 0) {
						Ext.getCmp('arrange-button-id').setDisabled(true);
					}

				}
			}
		});
	},

	/**
	 * 删除工件加工安排
	 */
	deleteArrange : function() {

		var rec = Ext.getStore('arrange-part-store-id').getAt(0);

		if (rec.data.schbarcode) {
			this.cancelArrangePart(this, "0000", rec.data.schbarcode, true);
		}
	},

	/**
	 * 取消工件加工安排
	 * 
	 * @param bufferId
	 *            取消安排的工件bufferId
	 * @param schBarcode
	 *            工单条码号
	 * @param isAll
	 *            是否取消所有安排
	 */
	cancelArrangePart : function(me, bufferId, schBarcode, isAll) {

		Ext.Ajax.request({
			url : 'module/process/cancelArrange',
			params : {
				bufferId : bufferId,
				schBarcode : schBarcode,
				// 如果只有一个工件时,那就表示工单整个作费
				isAll : isAll
			},
			success : function(response) {
				var res = JSON.parse(response.responseText);

				App.InterPath(res, function() {

					if (res.success) {

						if (isAll) {
							var parent = Ext.getCmp('Module.ModuleWorkPlan');
							parent.selectWaitProcessPart(parent, Ext.getStore('part-plan-store-id'));
							me.close();
						}
					} else {
						Fly.msg('错误', '工件加工安排取消失败!,请重试!');
					}

				});
			},
			failure : function(response, opts) {
				App.Error(response);
			}
		});

	},

	/**
	 * 工件加工安排
	 */
	arrangePart : function() {
		var splitChar = ';';
		var me = this;
		var form = me.craftSplitItems[0];
		var arrange = form.getValues();

		Ext.MessageBox.show({
			title : '安排',
			msg : '是否取消<>的加工安排?',
			buttons : Ext.MessageBox.YESNO,
			buttonText : {
				yes : "是",
				no : "否"
			},
			fn : function(btn) {
				if (btn == 'yes') {
					Ext.Ajax.request({
						url : 'module/process/arrangePart',
						params : {
							"partSchedule.craftId" : form.craftId,
							"partSchedule.craftsplitId" : form.craftsplitId,
							"partSchedule.machinebarcode" : arrange.machinebarcode,
							"partSchedule.estStart" : arrange.startDate + ' ' + arrange.startTime + ":00",
							"partSchedule.estTime" : arrange.timeout,
							"partSchedule.processor" : arrange.processor,
							"partSchedule.remark" : arrange.remark,
							"bufferIds" : me.partBufferIds(splitChar),
							"partCount" : Ext.getStore('arrange-part-store-id').getCount()
						},
						success : function(response) {
							var res = JSON.parse(response.responseText);

							App.InterPath(res, function() {
								if (res.success) {
									// 待安排介面更新
									var parent = Ext.getCmp('Module.ModuleWorkPlan');
									parent.selectWaitProcessPart(parent, Ext.getStore('part-plan-store-id'));
									me.close();
								} else {
									Fly.msg('错误', res.message);
								}
							});
						},
						failure : function(response, opts) {
							App.Error(response);
						}
					});
				}
			}
		});
	},

	/**
	 * 得到要安排工件的加工单位仓库ID(md_craftbuffer:id)
	 * 
	 * @returns {String}
	 */
	partBufferIds : function(splitChar) {
		var bufferIds = "";
		var store = Ext.getStore('arrange-part-store-id');
		var count = store.getCount();

		for ( var i = 0; i < count; i++) {
			bufferIds = bufferIds.concat("'").concat(store.getAt(i).data.id).concat(i == count - 1 ? "'" : "',");
		}

		return bufferIds;
	}
});