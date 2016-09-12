/**
 * 模具加工单位工作量统计
 */
Ext.define('Module.ModulePartPlanWorkload', {
	extend : 'Ext.panel.Panel',

	height : 300,
	date : Ext.Date.format(new Date(), 'Y-m'),

	initComponent : function() {
		var me = this;

		Ext.applyIf(me, {
			// autoScroll : true,
			html : '<div id="module-part-plan-workload-container" style="width:100%;height:100%"></div>',

			listeners : {
				render : me.showChart,
				resize : function() {
					// 调整大小后重绘
					try {
						me.chart.reflow();
					} catch (e) {

					}

				}
			}
		});

		me.callParent(arguments);
	},
	showChart : function() {
		var me = this;

		setTimeout(function() {
			me.renderChart(me);
		}, 1000);
	},

	renderChart : function(me) {

		// var dd = me.date.split('-');
		// var start = Date.UTC(parseInt(dd[0]), parseInt(dd[1]) - 1, 1);

		var options = {
			chart : {
				renderTo : 'module-part-plan-workload-container',
				zoomType : 'x',
				spacingRight : 20
			},
			title : {
				text : '<span id="part-plan-workload-title" >工作量</span><span style="float:right;" id="part-plan-portlet-craft-select-panel"></span>',
				style : {
					color : '#CD3333',
					fontSize : '12px',
					fontWeight : 'bold'
				},
				align : 'left',
				useHTML : true
			},
			xAxis : {
				type : 'datetime',
				maxZoom : 14 * 24 * 3600000, // fourteen days
				title : {
					text : null
				},
				labels : {
					formatter : function() {
						var date = new Date(this.value);// (date.getMonth() + 1)
						// + "/" +
						return date.getDate();
					}
				// rotation : 90
				}
			},
			yAxis : [ {
				title : {
					text : '工件数(件)'
				},
				min : 0
			}, { // Secondary yAxis
				title : {
					text : '加工时数(小时)',
					style : {
						color : '#4572A7'
					}
				},
				min : 0,
				minRange : 50,
				labels : {
					align : 'right',
					x : 0,
					y : -2
				},

				// 加工最大负荷时间
				// plotLines : [ ],
				labels : {
					style : {
						color : '#4572A7',
						fontWeight : 'bold',
						fontSize : '8px'
					}
				},
				opposite : true
			} ],
			tooltip : {
				xDateFormat : '%Y年%m月%d日',
				shared : true
			},
			legend : {
				// layout : 'vertical',
				backgroundColor : 'white',
				align : 'left',
				verticalAlign : 'top',
				y : 0,
				x : 277,
				borderWidth : 1,
				borderRadius : 0,
				floating : true,
				draggable : true,
				zIndex : 20,
				shadow : true
			},
			plotOptions : {
				area : {
					fillColor : {
						linearGradient : {
							x1 : 0,
							y1 : 0,
							x2 : 0,
							y2 : 1
						},
						stops : [ [ 0, Highcharts.getOptions().colors[0] ],
								[ 1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba') ] ]
					},
					lineWidth : 1,
					marker : {
						enabled : false
					},
					shadow : false,
					states : {
						hover : {
							lineWidth : 1
						}
					},
					threshold : null
				}
			},

			series : [ {
				name : '工件数',
				pointInterval : 24 * 3600000,
				// pointStart : start,
				type : 'spline',
				color : '#B8860B',
				tooltip : {
					valueSuffix : '件'
				},
				zIndex : 99999,
				data : []
			}, {
				name : '负荷时数',
				color : '#00C5CD',
				pointInterval : 24 * 3600000,
				type : 'column',
				yAxis : 1,
				tooltip : {
					valueSuffix : '小时'
				},
				zIndex : 99998,
				// pointStart : start,
				data : []
			} ]
		};

		me.chart = new Highcharts.Chart(options);
		// twt = me.chart;
		me.updateChartData();

		Ext.create('Ext.container.Container', {
			renderTo : 'part-plan-portlet-craft-select-panel',
			width : 200,
			layout : 'hbox',
			items : [ Ext.create('PortletCraftMenu', {
				mainPanel : me
			}), Ext.create('PortletWorkloadDate', {
				mainPanel : me
			}) ]
		});
	},

	/**
	 * 更新图表数据方法
	 */
	updateChartData : function(craftId, date) {
		var me = this;

		me.chart.showLoading("数据加载中...");
		// 假如获取的模具工件为空,则提示
		Ext.Ajax.request({
			url : 'public/workloadStatistics',
			params : {
				craftId : craftId,
				date : date
			},
			success : function(response) {
				var res = JSON.parse(response.responseText);

				App.InterPath(res, function() {
					if (res.success) {

						var dd = me.date.split('-');
						var start = Date.UTC(parseInt(dd[0]), parseInt(dd[1]) - 1, 1);

						// 更新月份-----------
						me.chart.series[0].options.pointStart = start;
						me.chart.series[1].options.pointStart = start;

						// 更新负荷线--------
						me.chart.yAxis[1].removePlotLine('machine-craft-work-load');

						me.chart.yAxis[1].addPlotLine({
							id : 'machine-craft-work-load',
							color : '#FF0000',
							width : 1,
							value : res.load,
							label : {
								align : 'right',
								text : '负荷(' + res.load + '时)',
								style : {
									fontWeight : 'bold',
									color : 'red'
								}
							}
						});

						// 更新负荷数据-----
						me.chart.series[1].setData(res.times);
						me.chart.series[0].setData(res.parts);

						me.chart.redraw();
					}
				});

				me.chart.hideLoading();
			},
			failure : function() {
				me.chart.hideLoading();
			}
		});
	}
});

/**
 * 工艺选择菜单
 */
Ext.define('PortletCraftMenu', {
	extend : 'Ext.button.Button',
	initComponent : function() {
		var me = this;

		Ext.applyIf(me, {
			text : '工艺',
			iconCls : 'document-export-16',
			menu : Ext.create("Ext.menu.Menu"),
			parent : me,
			style : 'margin-left:5px;',
			listeners : {
				mouseover : me.onReadCraft
			}
		});

		me.callParent(arguments);
	},
	/**
	 * 得到用户所在部门所有的工艺
	 */
	onReadCraft : function() {
		var me = this.parent;
		var menu = this.menu;

		if (menu.items.length > 0) {
			return;
		}

		Ext.Ajax.request({
			url : 'public/deptModuleCraft?isAll=true',
			async : false,
			success : function(response) {
				var res = JSON.parse(response.responseText);

				if (res.success) {
					for ( var i in res.craft) {
						menu.add({
							text : res.craft[i].craftname,
							craftId : res.craft[i].craftid,
							parent : me,
							checked : false,
							group : 'portletcraft-theme',
							handler : me.onClickModuleCraft
						});
					}
				}
			},
			failure : function(response, opts) {
				App.Error(response);
			}
		});
	},

	/**
	 * 工艺选择方法
	 */
	onClickModuleCraft : function() {
		var mainPanel = this.parent.mainPanel;// 得到显示chart的主面板
		mainPanel.craftId = this.craftId;
		if (mainPanel.date) {
			mainPanel.updateChartData(mainPanel.craftId, mainPanel.date);

			$('#part-plan-workload-title').text(this.text + "工作量");
		} else {
			Fly.msg('信息', '您没有选择月份!');
		}
	}
});

/**
 * 负荷月份
 */
Ext.define('PortletWorkloadDate', {
	id:'part-plan-portletworkloaddate',
	extend : 'Ext.form.field.Date',
	format : 'Y-m',
	value : new Date(),
	initComponent : function() {
		var me = this;

		Ext.applyIf(me, {
			hideLabel : true,
			width : 75,
			style : 'margin-left:5px;',
			editable : false,
			listeners : {
				select : me.onSelectWorkloadDate
			}
		});

		me.callParent(arguments);
	},

	onSelectWorkloadDate : function(field, value, eOpts) {
		var mainPanel = this.mainPanel;
		mainPanel.date = field.getRawValue();
		if (mainPanel.craftId) {
			mainPanel.updateChartData(mainPanel.craftId, mainPanel.date);
		} else {
			Fly.msg('信息', '您没有选择工艺,请选择!');
		}
	}
});