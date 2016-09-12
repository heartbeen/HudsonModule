/**
 * 模具加工机台稼动率表
 */
Ext.define('Module.portlet.ModuleMachineOperationRate', {
	extend : 'Ext.panel.Panel',
	height : 385,
	html : '<div id="machine-container" style="width:100%;height:100%;"><div id="machine-list-container"></div></div>',

	initComponent : function() {
		var me = this;

		me.macPieSize = 200;// 显示机台稼动率PIE直径
		me.macInnerSize = 120;// 显示机台稼动率空心PIE直径

		// 第一台机台的显示位置
		me.macFirstCenter = {
			x : 290,
			y : 40
		};

		me.macColumns = 0;// 一行显示机台列数
		me.macCount = 0;// 机台总数
		me.macRow = 0;// 显示机台列数

		// 机台之间的间距
		me.macGap = {
			x : 130,
			y : 180
		};

		me.rectColor = '#BCBCBC';// 机台显示框的颜色
		me.strokeWidth = 0.5;// 机台显示框宽度

		// 机台显示框属性
		me.macRect = {
			x : me.macFirstCenter.x - (me.macPieSize * 5 / 4) / 2 + 30,
			y : me.macFirstCenter.y - (me.macPieSize * 5 / 4) / 2 + 67,
			width : me.macPieSize * 5 / 4,
			height : me.macPieSize * 5 / 4 + 50,
			r : 3
		};

		Ext.applyIf(me, {

			listeners : {
				render : me.renderChart,
				resize : me.chartResize
			}
		});

		me.callParent(arguments);
	},

	/**
	 * 
	 */
	chartResize : function(me) {

		var mc = $('#machine-container');
		var chartRegionWidth = mc.width() - me.macFirstCenter.x;// 得到绘制机台信息区域的宽度

		me.macColumns = Math.floor(chartRegionWidth / me.macRect.width);// 得到绘制机台信息区域可以显示的机台列数

		if (me.macColumns < 1 || !me.macCount) {
			return;
		}

		// me.macCount = 19;// 机台总数
		// 显示机台列数
		me.macRow = Math.floor(me.macCount / me.macColumns) + (me.macCount % me.macColumns > 0 ? 1 : 0);

		var macRectHeight = me.macRow * me.macRect.height + 60;

		// 调整大小后重绘
		if (me.pieChart) {
			me.pieChart.reflow();

			// 如果所有机台信息框的高度大于显示区高度时,就显示滚动条
			me.setChartContainerSize(macRectHeight > mc.height(), macRectHeight < mc.height() ? mc.height() : macRectHeight);
		}
	},

	/**
	 * 只对高度方向对图表进行调整
	 */
	setChartContainerSize : function(isScroll, height) {

		var mc = $('#machine-container');

		var width = mc.width();
		if (isScroll) {
			width = width - 20;
			mc.css('overflow', 'auto');
		} else {
			mc.css('overflow', 'hidden');
		}

		this.pieChart.setSize(width, height || mc.height());

	},

	/**
	 * 
	 */
	renderChart : function() {
		var me = this;
		setTimeout(function() {

			var mc = $('#machine-container');
			me.pieChart = new Highcharts.Chart({
				chart : {
					type : 'pie',
					renderTo : 'machine-list-container'
				},
				title : {
					text : '<div id="machine-rate-title">机台详细稼动</div>',
					style : {
						'font-size' : 18
					},
					useHTML : true
				},

				plotOptions : {

					pie : {
						// shadow: true,
						dataLabels : {
							formatter : function() {
								if (this.point.name.indexOf('机') > -1) {
									return ''.concat(this.point.name).concat('<br>' + this.point.y + '%');
								}
							},

							color : 'black',
							distance : -me.macPieSize / 2 + 1,
							style : {
								fontWeight : 'bold',
								fontSize : 12
							},
							// shadow: true,
							x : 0,
							y : -6
						}

					}
				},

				tooltip : {
					formatter : function() {
						if (this.point.name.indexOf('机') > -1) {
							return ''.concat(this.point.name).concat('稼动率:' + this.point.y).concat('%');
						}
					}
				},
				series : [ {
					allowPointSelect : false,
					// cursor: 'pointer',
					data : [ {
						name : '总稼率',
						y : 77,
						color : '#52BE6B' // Jane's color
					}, {
						name : 'John',
						y : 23,
						color : '#585D62' // John's color
					} ],
					center : [ mc.width() / 2, mc.height() / 2 - 67 ],
					size : 125,
					innerSize : 80,
					// showInLegend : false,

					dataLabels : {
						formatter : function() {
							if (this.point.name.indexOf('总稼率') > -1) {
								return ''.concat(this.point.name).concat('<br>' + this.point.y + '%');
							}
						},

						color : 'black',
						distance : -62,
						style : {
							fontWeight : 'bold',
							fontSize : 12
						},
						// shadow: true,
						x : 0,
						y : -6
					}
				}, {
					allowPointSelect : false,
					// cursor: 'pointer',
					data : [ {
						name : '1#机',
						y : 6,
					}, {
						name : 'John',
						y : 2,
					}, {
						name : 'John',
						y : 3,
					} ],
					center : [ mc.width() / 2, mc.height() / 2 - 67 ],
					size : 180,
					innerSize : 125,
					// showInLegend : false,
					dataLabels : {
						format : '{y}台',
						distance : 0,
						style : {
							fontWeight : 'bold',
							fontSize : 12
						},
						x : 0,
						y : 0
					}
				} ]
			});

			me.setChartContainerSize();

		}, 200);

	},

	/**
	 * 刷新数据方法
	 */
	refreshHandler : function(e, portlet, target, header, tool) {
	},

	/**
	 * 查找条件菜单显示方法
	 */
	searchHandler : function(e, portlet, target, header, tool) {

		if (!portlet.deptMenu) {
			portlet.deptMenu = [];

			Ext.Ajax.request({
				url : 'public/queryDeptChildren',
				async : false,
				success : function(r) {
					var dept = Ext.JSON.decode(r.responseText).department;

					for ( var i in dept) {
						portlet.deptMenu.push({
							xtype : 'menuitem',
							text : dept[i].name,
							stepId : dept[i].stepid,
							scope : portlet,
							iconCls : 'chart_pie-16',
							handler : portlet.deptMenuHandler
						});
					}
					Ext.create('Ext.menu.Menu', {
						items : portlet.deptMenu
					}).showAt(e.getXY());
				},
				failure : function(x, y, z) {
					Fly.msg('提醒', '连接网络失败!');
					return;
				}
			});
		}

		Ext.create('Ext.menu.Menu', {
			items : portlet.deptMenu
		}).showAt(e.getXY());

	},

	/**
	 * 加工单位菜单点击方法
	 */
	deptMenuHandler : function(menu) {
		var me = this;
		Ext.Ajax.request({
			url : 'public/moduleMachineRate',
			params : {
				deptStepId : menu.stepId,
				present : true
			},
			success : function(r) {
				var rate = Ext.JSON.decode(r.responseText);
				var rates = 0;
				var i = 0;
				var macStatistics = [];// 机台状态统计

				for (var r = 0; r < me.macRow; r++) {
					for (var c = 0; c < me.macColumns; c++) {
						if (i == rate.length) {
							break;
						}
						rates = rates + rate[i].rate;

						// 对机台各种状态进行分类统计
						if (macStatistics.length == 0) {
							macStatistics.push({
								name : rate[i].macstate,
								y : 1
							});
						} else {
							for (var a = 0; a < macStatistics.length; a++) {
								if (macStatistics[a].name == rate[i].macstate) {
									macStatistics[a].y = macStatistics[a].y + 1;
									break;
								}
							}
						}
						i++;
					}
				}

				rates = Math.round(rates / rate.length);

				// 机台汇总信息
				me.pieChart.series[0].setData([ {
					name : '总稼率',
					y : rates,
					color : rates >= 0 && rates <= 33 ? '#D15858' : rates >= 33 && rates <= 66 ? '#FFA54F' : '#52BE6B'
				}, {
					y : 100 - rates,
					color : '#585D62'
				} ]);

				me.pieChart.series[1].setData(macStatistics);

				$('#machine-rate-title').text(menu.text + '机台详细稼动');

				me.rate = rate;

			},
			failure : function(x, y, z) {
				Fly.msg('提醒', '连接网络失败!');
				return;
			}
		});

	},

	/**
	 * 刷新数据方法
	 */
	maximizeHandler : function(e, portlet, target, header, tool) {

		var me = portlet;

		me.addDocked(Ext.create('Ext.toolbar.Toolbar', {
			items : [ {
				text : '当天稼动',
				iconCls : 'application_form_magnify-16',
				scope : me,
				handler : me.presentDeptMachineRate
			}, '-', {
				xtype : 'combobox',
				id : 'machine-rete-combobox-id',
				editable : false,
				fieldLabel : '加工单位',
				labelWidth : 60,
				displayField : 'name',
				width : 180,
				valueField : 'stepid',
				store : new Ext.data.Store({
					proxy : {
						type : 'ajax',
						url : 'public/queryDeptChildren',
						reader : {
							type : 'json',
							root : 'department'
						}
					},
					fields : [ 'partid', 'stepid', 'name' ],
					autoLoad : true
				}),
				listeners : {
					scope : me,
					select : me.selectDeptMachineRate
				}
			}, {
				xtype : 'datefield',
				id : 'machine-rete-start-field-id',
				fieldLabel : '时间段',
				style : 'margin-left:10px;',
				labelWidth : 60,
				width : 160,
				maxValue : new Date(),
				format : 'Y-m-d',
				editable : false,
				listeners : {
					select : function(field) {
						Ext.getCmp('machine-rete-end-field-id').setMinValue(field.getValue());
					}
				}
			}, {
				xtype : 'datefield',
				id : 'machine-rete-end-field-id',
				hideLabel : true,
				width : 95,
				maxValue : new Date(),
				editable : false,
				format : 'Y-m-d'
			}, {
				text : '查询',
				iconCls : "find-16",
				scope : me,
				handler : me.queryDeptMachineRate
			} ]
		}));

		if (me.rate) {
			me.createMachineSeries(me.rate);
		}
	},

	/**
	 * 按条件查询机台的稼动率
	 */
	selectDeptMachineRate : function(combo, record, opts) {
		var me = this;
		me.deptStepId = combo.getValue();

	},

	queryDeptMachineRate : function() {
		var me = this;

		if (!me.deptStepId) {
			Fly.msg('提示', '请选择加工单位!');
			return;
		}

		var startTime = App.getRawValue('machine-rete-start-field-id');

		if (startTime == '') {
			Fly.msg('提示', '请选择机台稼动日期!');
			return;
		}

		var endTime = App.getRawValue('machine-rete-end-field-id');

		// 如果查一天的稼动率时,应该算两个班的,夜班为第二天8点
		endTime = endTime == '' ? '' : Ext.Date.format(new Date(Ext.Date.parse(endTime, 'Y-m-d').getTime() + 24 * 3600000), 'Y-m-d') + ' 08:00:00';
		Ext.Ajax.request({
			url : 'public/moduleMachineRate',
			params : {
				deptStepId : me.deptStepId,
				startTime : App.getRawValue('machine-rete-start-field-id') + ' 08:00:00',
				endTime : endTime
			},
			success : function(r) {
				rate = Ext.JSON.decode(r.responseText);

				me.createMachineSeries(rate);
			},
			failure : function(x, y, z) {
				Fly.msg('提醒', '连接网络失败!');
				return;
			}
		});
	},

	/**
	 * 
	 */
	presentDeptMachineRate : function() {
		var me = this;

		if (!me.deptStepId) {
			Fly.msg('提示', '请选择加工单位!');
			return;
		}
		App.setValue('machine-rete-start-field-id', new Date());

		var end = Ext.getCmp('machine-rete-end-field-id');

		end.setValue(null);
		end.setMinValue(new Date());

		Ext.Ajax.request({
			url : 'public/moduleMachineRate',
			params : {
				deptStepId : me.deptStepId,
				present : true
			},
			success : function(r) {
				rate = Ext.JSON.decode(r.responseText);
				me.createMachineSeries(rate);

			},
			failure : function(x, y, z) {
				Fly.msg('提醒', '连接网络失败!');
				return;
			}
		});
	},

	/**
	 * 建立机台稼动率图表数据
	 */
	createMachineSeries : function(rate) {
		var me = this;

		me.destroyRenderObject(me);
		me.destroySeries(me);
		me.renderObject = [];

		me.macCount = rate.length;// 机台总数
		me.chartResize(me);

		var rates = 0;
		var i = 0;
		var macStatistics = [];// 机台状态统计

		for (var r = 0; r < me.macRow; r++) {
			for (var c = 0; c < me.macColumns; c++) {
				if (i == rate.length) {
					break;
				}
				// 三种颜色:红,黄,绿表示机台的稼动率高低的区分
				var color = rate[i].rate >= 0 && rate[i].rate <= 33 ? '#D15858' : rate[i].rate >= 33 && rate[i].rate <= 66 ? '#FFA54F' : '#52BE6B';

				rates = rates + rate[i].rate;

				// 加入机台稼动图表
				me.pieChart.addSeries({
					allowPointSelect : false,
					data : [ {
						name : rate[i].batchno + '#机',
						y : rate[i].rate,
						color : color
					}, {
						name : 'other',
						y : 100 - rate[i].rate,
						color : '#585D62'
					} ],
					center : [ me.macFirstCenter.x + c * me.macGap.x, me.macFirstCenter.y + r * me.macGap.y ],
					size : me.macPieSize,
					innerSize : me.macInnerSize,
					showInLegend : false
				});

				// 绘制机台信息框体
				var x = me.macRect.x + c * me.macGap.x;
				var y = me.macRect.y + r * me.macGap.y;
				var w = me.macRect.width;
				var lengthen = me.macRect.height - w;// 加长用于显示文字

				me.renderObject.push(me.pieChart.renderer.rect(x, y, w, me.macRect.height, me.macRect.r).attr({
					'stroke-width' : me.strokeWidth,
					stroke : me.rectColor,
					zIndex : 3,
					'fill-opacity' : 0
				}).add());

				me.renderObject.push(me.pieChart.renderer.path([ 'M', x, y + w, 'L', x + w, y + w ]).attr({
					'stroke-width' : me.strokeWidth,
					stroke : me.rectColor
				}).add());

				me.renderObject.push(me.pieChart.renderer.path([ 'M', x, y + w + lengthen / 2, 'L', x + w, y + w + lengthen / 2 ]).attr({
					'stroke-width' : me.strokeWidth,
					stroke : me.rectColor
				}).add());

				me.renderObject.push(me.pieChart.renderer.text('状态:', x + 5, y + w + 15).css({
					color : '#104E8B',
					fontSize : '12px',
					fontWeight : 'bold',
					fontFamily : '微软雅黑, 微軟雅黑, 宋体, 宋體'
				}).add());

				me.renderObject.push(me.pieChart.renderer.text(rate[i].macstate, x + 50, y + w + 15).css({
					color : '#104E8B',
					fontSize : '12px',
					fontWeight : 'bold',
					fontFamily : '微软雅黑, 微軟雅黑, 宋体, 宋體'
				}).add());

				me.renderObject.push(me.pieChart.renderer.text('加工者:', x + 5, y + w + 40).css({
					color : '#104E8B',
					fontSize : '12px',
					fontWeight : 'bold',
					fontFamily : '微软雅黑, 微軟雅黑, 宋体, 宋體'
				}).add());

				me.renderObject.push(me.pieChart.renderer.text(rate[i].empname, x + 50, y + w + 40).css({
					color : '#104E8B',
					fontSize : '12px',
					fontWeight : 'bold',
					fontFamily : '微软雅黑, 微軟雅黑, 宋体, 宋體'
				}).add());

				if (macStatistics.length == 0) {
					macStatistics.push({
						name : rate[i].macstate,
						y : 1
					});
				} else {
					for (var a = 0; a < macStatistics.length; a++) {
						if (macStatistics[a].name == rate[i].macstate) {
							macStatistics[a].y = macStatistics[a].y + 1;
							break;
						}
					}
				}
				i++;
			}
		}

		me.renderObject.push(me.pieChart.renderer.path([ 'M', 0, 280, 'L', 250, 280 ]).attr({
			'stroke-width' : me.strokeWidth,
			stroke : me.rectColor
		}).add());

		me.renderObject.push(me.pieChart.renderer.path([ 'M', 250, 40, 'L', 250, 600 ]).attr({
			'stroke-width' : me.strokeWidth,
			stroke : me.rectColor
		}).add());

		rates = Math.round(rates / rate.length);

		// 机台汇总信息
		me.pieChart.series[0].setData([ {
			name : '总稼率',
			y : rates,
			color : rates >= 0 && rates <= 33 ? '#D15858' : rates >= 33 && rates <= 66 ? '#FFA54F' : '#52BE6B'
		}, {
			y : 100 - rates,
			color : '#585D62'
		} ]);

		me.pieChart.series[1].setData(macStatistics);

		$('#machine-rate-title').text(App.getRawValue('machine-rete-combobox-id') + '机台详细稼动');

		if (me.pieChart.series[0].center[0] != 100) {
			me.pieChart.series[0].update({
				center : [ 100, 100 ],
				size : 125,
				innerSzie : 80
			});
			me.pieChart.series[1].update({
				center : [ 100, 100 ],
				size : 180,
				innerSize : 125
			});
		}

	},

	/**
	 * 擦除绘制的机台信息框格与文字
	 */
	destroyRenderObject : function(me) {
		if (me.renderObject) {
			Ext.Array.each(me.renderObject, function(item) {
				item.destroy();
			});
		}
	},

	/**
	 * 擦除旧的机台图片
	 */
	destroySeries : function(me) {
		if (me.pieChart.series.length > 2) {
			for (var i = 2; i < me.pieChart.series.length; i++) {
				me.pieChart.series[i].destroy();
			}
			me.destroySeries(me);
		}
	},

	getName : function() {
		return Module.portlet.ModuleMachineOperationRate.getName();
	}
});