/**
 * 金型仕样书表单
 */
Ext.define('Manage.Business.MoldingSpecification', {
	extend : 'Ext.form.Panel',

	height : 843,
	width : 707,
	autoScroll : true,
	bodyPadding : 10,
	title : '模具仕样书',

	initComponent : function() {
		var me = this;

		Ext.applyIf(me, {
			items : [ {
				xtype : 'container',
				layout : {
					align : 'stretch',
					type : 'hbox'
				},
				items : [ {
					xtype : 'container',
					flex : 1,
					layout : {
						type : 'anchor'
					},
					items : [ {
						xtype : 'container',
						layout : {
							align : 'stretch',
							type : 'vbox'
						},
						items : [ {
							xtype : 'combobox',
							fieldLabel : '客户',
							labelWidth : 60
						}, {
							xtype : 'textfield',
							fieldLabel : '工号',
							labelWidth : 60
						}, {
							xtype : 'triggerfield',
							width : 259,
							fieldLabel : '品名',
							labelWidth : 60,
							allowBlank : false
						}, {
							xtype : 'textfield',
							width : 268,
							fieldLabel : '部品号',
							labelWidth : 60,
							allowBlank : false
						}, {
							xtype : 'fieldset',
							flex : 1,
							width : 324,
							title : '模具',
							items : [ {
								xtype : 'radiogroup',
								layout : {
									align : 'stretch',
									type : 'hbox'
								},
								fieldLabel : '种类',
								labelWidth : 50,
								items : [ {
									xtype : 'radiofield',
									name : 'moldVariety',
									boxLabel : '新作',
									checked : true
								}, {
									xtype : 'radiofield',
									margin : '0 0 0 10',
									name : 'moldVariety',
									boxLabel : '设变'
								}, {
									xtype : 'radiofield',
									margins : '0 0 0 10',
									fieldLabel : 'Label',
									hideLabel : true,
									name : 'moldVariety',
									boxLabel : '更新'
								}, {
									xtype : 'radiofield',
									margins : '0 0 0 10',
									fieldLabel : 'Label',
									hideLabel : true,
									name : 'moldVariety',
									boxLabel : '客户供给'
								} ]
							}, {
								xtype : 'radiogroup',
								layout : {
									align : 'stretch',
									type : 'hbox'
								},
								fieldLabel : '制所',
								labelWidth : 50,
								items : [ {
									xtype : 'radiofield',
									name : 'makeType',
									boxLabel : '自制',
									checked : true
								}, {
									xtype : 'radiofield',
									margin : '0 0 0 10',
									name : 'makeType',
									boxLabel : '委外'
								}, {
									xtype : 'radiofield',
									margin : '0 0 0 10',
									fieldLabel : 'Label',
									hideLabel : true,
									name : 'makeType',
									boxLabel : '移入'
								} ]
							} ]
						} ]
					} ]
				}, {
					xtype : 'container',
					flex : 1,
					layout : {
						align : 'stretch',
						type : 'vbox'
					},
					items : [ {
						xtype : 'fieldset',
						flex : 1,
						margins : '0 0 0 5',
						title : '成形情报',
						items : [ {
							xtype : 'fieldset',
							title : '材料',
							items : [ {
								xtype : 'container',
								layout : {
									type : 'table'
								},
								items : [ {
									xtype : 'textfield',
									width : 149,
									fieldLabel : '材料',
									labelWidth : 60
								}, {
									xtype : 'textfield',
									margin : '-5 0 0 5',
									width : 131,
									fieldLabel : '颜色',
									labelWidth : 40
								} ]
							}, {
								xtype : 'textfield',
								anchor : '100%',
								fieldLabel : '名称',
								labelWidth : 60
							}, {
								xtype : 'radiogroup',
								layout : {
									align : 'stretch',
									type : 'hbox'
								},
								fieldLabel : '厂商',
								labelWidth : 60,
								items : [ {
									xtype : 'radiofield',
									name : 'firmNation',
									boxLabel : '台',
									checked : true
								}, {
									xtype : 'radiofield',
									margin : '0 0 0 10',
									name : 'firmNation',
									boxLabel : '日'
								}, {
									xtype : 'radiofield',
									margin : '0 0 0 10',
									fieldLabel : 'Label',
									hideLabel : true,
									name : 'firmNation',
									boxLabel : '欧'
								}, {
									xtype : 'radiofield',
									margin : '0 0 0 10',
									fieldLabel : 'Label',
									hideLabel : true,
									name : 'firmNation',
									boxLabel : '美'
								} ]
							} ]
						}, {
							xtype : 'triggerfield',
							anchor : '100%',
							fieldLabel : '成形机台',
							labelWidth : 70
						} ]
					} ]
				} ]
			}, {
				xtype : 'fieldset',
				layout : {
					type : 'column'
				},
				title : '模具构造',
				items : [ {
					xtype : 'container',
					layout : {
						align : 'stretch',
						type : 'vbox'
					},
					items : [ {
						xtype : 'radiogroup',
						flex : 1,
						layout : {
							align : 'stretch',
							type : 'hbox'
						},
						fieldLabel : '生产',
						labelWidth : 60,
						items : [ {
							xtype : 'radiofield',
							name : 'produceType',
							boxLabel : '量产用',
							checked : true
						}, {
							xtype : 'radiofield',
							margin : '0 0 0 10',
							name : 'produceType',
							boxLabel : '试作用'
						} ]
					}, {
						xtype : 'radiogroup',
						flex : 1,
						layout : {
							align : 'stretch',
							type : 'hbox'
						},
						fieldLabel : '顶出',
						labelWidth : 60,
						items : [ {
							xtype : 'radiofield',
							name : 'ejectionType',
							boxLabel : '销',
							checked : true
						}, {
							xtype : 'radiofield',
							margin : '0 0 0 10',
							name : 'ejectionType',
							boxLabel : '套筒'
						}, {
							xtype : 'radiofield',
							margin : '0 0 0 10',
							fieldLabel : 'Label',
							hideLabel : true,
							name : 'ejectionType',
							boxLabel : '剥料板'
						}, {
							xtype : 'radiofield',
							margin : '0 0 0 10',
							fieldLabel : 'Label',
							hideLabel : true,
							name : 'ejectionType',
							boxLabel : '特殊'
						} ]
					}, {
						xtype : 'fieldset',
						title : '二次构造',
						items : [ {
							xtype : 'radiogroup',
							layout : {
								align : 'stretch',
								type : 'hbox'
							},
							fieldLabel : '倒勾',
							labelWidth : 40,
							items : [ {
								xtype : 'radiofield',
								name : 'barbType',
								boxLabel : '滑块',
								checked : true
							}, {
								xtype : 'radiofield',
								margin : '0 0 0 10',
								name : 'barbType',
								boxLabel : '强制顶出'
							}, {
								xtype : 'radiofield',
								margin : '0 0 0 10',
								fieldLabel : 'Label',
								hideLabel : true,
								name : 'barbType',
								boxLabel : '斜顶出'
							}, {
								xtype : 'radiofield',
								margin : '0 0 0 10',
								fieldLabel : 'Label',
								hideLabel : true,
								name : 'barbType',
								boxLabel : '其他'
							} ]
						}, {
							xtype : 'radiogroup',
							layout : {
								align : 'stretch',
								type : 'hbox'
							},
							fieldLabel : '旋转',
							labelWidth : 40,
							items : [ {
								xtype : 'radiofield',
								name : 'rotateType',
								boxLabel : '轴承'
							}, {
								xtype : 'radiofield',
								margin : '0 0 0 10',
								name : 'rotateType',
								boxLabel : '齿轮'
							}, {
								xtype : 'radiofield',
								margin : '0 0 0 10',
								fieldLabel : 'Label',
								hideLabel : true,
								name : 'rotateType',
								boxLabel : '马达'
							}, {
								xtype : 'radiofield',
								margin : '0 0 0 10',
								fieldLabel : 'Label',
								hideLabel : true,
								name : 'rotateType',
								boxLabel : '其他',
								checked : true
							} ]
						}, {
							xtype : 'radiogroup',
							layout : {
								align : 'stretch',
								type : 'hbox'
							},
							fieldLabel : '面插',
							labelWidth : 40,
							items : [ {
								xtype : 'radiofield',
								name : 'cutCount',
								boxLabel : '1处',
								checked : true
							}, {
								xtype : 'radiofield',
								margin : '0 0 0 10',
								name : 'cutCount',
								boxLabel : '2-5处'
							}, {
								xtype : 'radiofield',
								margin : '0 0 0 10',
								fieldLabel : 'Label',
								hideLabel : true,
								name : 'cutCount',
								boxLabel : '6处以上'
							} ]
						} ]
					} ]
				}, {
					xtype : 'container',
					margin : '0 0 0 5',
					layout : {
						type : 'anchor'
					},
					items : [ {
						xtype : 'radiogroup',
						layout : {
							align : 'stretch',
							type : 'hbox'
						},
						fieldLabel : '浇口',
						labelWidth : 60,
						items : [ {
							xtype : 'radiofield',
							name : 'gateType',
							boxLabel : '针点',
							checked : true
						}, {
							xtype : 'radiofield',
							margin : '0 0 0 10',
							name : 'gateType',
							boxLabel : '潜式'
						}, {
							xtype : 'radiofield',
							margin : '0 0 0 10',
							fieldLabel : 'Label',
							hideLabel : true,
							name : 'gateType',
							boxLabel : '侧式'
						}, {
							xtype : 'radiofield',
							margin : '0 0 0 10',
							fieldLabel : 'Label',
							hideLabel : true,
							name : 'gateType',
							boxLabel : '特殊'
						} ]
					}, {
						xtype : 'radiogroup',
						layout : {
							align : 'stretch',
							type : 'hbox'
						},
						fieldLabel : '模座',
						labelWidth : 60,
						items : [ {
							xtype : 'radiofield',
							name : 'moldBase',
							boxLabel : '特殊'
						}, {
							xtype : 'radiofield',
							margin : '0 0 0 10',
							name : 'moldBase',
							boxLabel : '双叶'
						}, {
							xtype : 'textfield',
							margin : '0 0 0 10',
							width : 130,
							fieldLabel : 'Label',
							hideLabel : true
						} ]
					}, {
						xtype : 'fieldset',
						width : 300,
						title : '模仁',
						items : [ {
							xtype : 'radiogroup',
							layout : {
								align : 'stretch',
								type : 'hbox'
							},
							fieldLabel : '形状',
							labelWidth : 40,
							items : [ {
								xtype : 'radiofield',
								name : 'coreShape',
								boxLabel : '圆形'
							}, {
								xtype : 'radiofield',
								margin : '0 0 0 10',
								name : 'coreShape',
								boxLabel : '方形',
								checked : true
							}, {
								xtype : 'radiofield',
								margin : '0 0 0 10',
								fieldLabel : 'Label',
								hideLabel : true,
								name : 'coreShape',
								boxLabel : '圆方形'
							}, {
								xtype : 'radiofield',
								margin : '0 0 0 10',
								fieldLabel : 'Label',
								hideLabel : true,
								name : 'coreShape',
								boxLabel : '其他'
							} ]
						}, {
							xtype : 'radiogroup',
							layout : {
								align : 'stretch',
								type : 'hbox'
							},
							fieldLabel : '材质',
							labelWidth : 40,
							items : [ {
								xtype : 'radiofield',
								name : 'preparation',
								boxLabel : '预硬'
							}, {
								xtype : 'radiofield',
								margin : '0 0 0 10',
								name : 'preparation',
								boxLabel : '热处理',
								checked : true
							}, {
								xtype : 'radiofield',
								margin : '0 0 0 10',
								fieldLabel : 'Label',
								hideLabel : true,
								name : 'preparation',
								boxLabel : '表面处理'
							} ]
						} ]
					} ]
				} ]
			}, {
				xtype : 'container',
				layout : {
					align : 'stretch',
					type : 'hbox'
				},
				items : [ {
					xtype : 'fieldset',
					flex : 1,
					title : '日程计划',
					items : [ {
						xtype : 'datefield',
						anchor : '100%',
						fieldLabel : '承认图寄出',
						labelWidth : 80
					}, {
						xtype : 'datefield',
						anchor : '100%',
						fieldLabel : '加工图出图',
						labelWidth : 80
					}, {
						xtype : 'datefield',
						anchor : '100%',
						fieldLabel : '模具完成',
						labelWidth : 80
					}, {
						xtype : 'datefield',
						anchor : '100%',
						fieldLabel : '试模(T0)',
						labelWidth : 80
					}, {
						xtype : 'datefield',
						anchor : '100%',
						fieldLabel : '样品发送',
						labelWidth : 80
					}, {
						xtype : 'datefield',
						anchor : '100%',
						fieldLabel : '检查记录发送',
						labelWidth : 80
					}, {
						xtype : 'datefield',
						anchor : '100%',
						fieldLabel : '投入量产日期',
						labelWidth : 80
					} ]
				}, {
					xtype : 'container',
					flex : 1,
					margin : '0 0 0 5',
					items : [ {
						xtype : 'fieldset',
						title : '营业估价',
						items : [ {
							xtype : 'textfield',
							anchor : '100%',
							fieldLabel : '制品重量(g/个)'
						}, {
							xtype : 'textfield',
							anchor : '100%',
							fieldLabel : '料头重量(g)'
						}, {
							xtype : 'textfield',
							anchor : '100%',
							fieldLabel : '成形周期(秒)'
						}, {
							xtype : 'numberfield',
							anchor : '100%',
							fieldLabel : '报价良率(%)'
						} ]
					}, {
						xtype : 'fieldset',
						title : '客户特定要求',
						items : [ {
							xtype : 'radiogroup',
							fieldLabel : '涂装情报',
							items : [ {
								xtype : 'radiofield',
								name : 'paintInfo',
								boxLabel : '有'
							}, {
								xtype : 'radiofield',
								name : 'paintInfo',
								boxLabel : '无',
								checked : true
							} ]
						}, {
							xtype : 'radiogroup',
							fieldLabel : '印刷情报',
							items : [ {
								xtype : 'radiofield',
								name : 'printInfo',
								boxLabel : '有'
							}, {
								xtype : 'radiofield',
								name : 'printInfo',
								boxLabel : '无',
								checked : true
							} ]
						}, {
							xtype : 'radiogroup',
							fieldLabel : '组立情报',
							items : [ {
								xtype : 'radiofield',
								name : 'assemblyInfo',
								boxLabel : '有'
							}, {
								xtype : 'radiofield',
								name : 'assemblyInfo',
								boxLabel : '无',
								checked : true
							} ]
						} ]
					} ]
				}, {
					xtype : 'fieldset',
					flex : 1,
					margin : '0 0 0 5',
					maxHeight : 235,
					title : '生产数量',
					items : [ {
						xtype : 'textfield',
						anchor : '100%',
						fieldLabel : '验收数(K)'
					}, {
						xtype : 'textfield',
						anchor : '100%',
						fieldLabel : '月产数(K/月)'
					}, {
						xtype : 'textfield',
						anchor : '100%',
						fieldLabel : '预计生产总数(K)'
					}, {
						xtype : 'textfield',
						anchor : '100%',
						fieldLabel : '模具寿命(K)'
					} ]
				} ]
			}, {
				xtype : 'container',
				layout : {
					align : 'stretch',
					type : 'hbox'
				},
				items : [ {
					xtype : 'fieldset',
					title : '确认事项',
					items : [ {
						xtype : 'checkboxgroup',
						layout : {
							align : 'stretch',
							type : 'hbox'
						},
						fieldLabel : '客户提供资料',
						labelWidth : 80,
						items : [ {
							xtype : 'checkboxfield',
							boxLabel : '2D制品图'
						}, {
							xtype : 'checkboxfield',
							margin : '0 0 0 10',
							boxLabel : '样品'
						}, {
							xtype : 'checkboxfield',
							margin : '0 0 0 10',
							fieldLabel : 'Label',
							hideLabel : true,
							boxLabel : '3D'
						}, {
							xtype : 'checkboxfield',
							margin : '0 0 0 10',
							fieldLabel : 'Label',
							hideLabel : true,
							boxLabel : '版下'
						} ]
					}, {
						xtype : 'textfield',
						anchor : '100%',
						width : 300,
						fieldLabel : '检查记录表',
						labelWidth : 80
					}, {
						xtype : 'textfield',
						anchor : '100%',
						width : 300,
						fieldLabel : '会议记录参照',
						labelWidth : 80
					}, {
						xtype : 'textfield',
						anchor : '100%',
						width : 300,
						fieldLabel : '成形条件表',
						labelWidth : 80
					}, {
						xtype : 'textfield',
						anchor : '100%',
						width : 300,
						fieldLabel : '模具设计图',
						labelWidth : 80
					}, {
						xtype : 'radiogroup',
						layout : {
							align : 'stretch',
							type : 'hbox'
						},
						fieldLabel : '模具照相',
						labelWidth : 80,
						items : [ {
							xtype : 'radiofield',
							name : 'photography',
							boxLabel : '要'
						}, {
							xtype : 'radiofield',
							margin : '0 0 0 10',
							name : 'photography',
							boxLabel : '不要   (香烟,尺,其它)',
							checked : true
						} ]
					} ]
				}, {
					xtype : 'container',
					margin : '0 0 0 5',
					width : 352,
					layout : {
						align : 'stretch',
						pack : 'center',
						type : 'vbox'
					},
					items : [ {
						xtype : 'fieldset',
						flex : 1,
						title : '价格',
						items : [ {
							xtype : 'container',
							layout : {
								align : 'stretch',
								type : 'hbox'
							},
							items : [ {
								xtype : 'textfield',
								fieldLabel : '模具单价',
								labelWidth : 60
							}, {
								xtype : 'combobox',
								flex : 1,
								width : 55,
								fieldLabel : 'Label',
								hideLabel : true
							}, {
								xtype : 'checkboxfield',
								margin : '0 0 0 5',
								fieldLabel : 'Label',
								hideLabel : true,
								boxLabel : '待定'
							} ]
						}, {
							xtype : 'container',
							layout : {
								type : 'table'
							},
							items : [ {
								xtype : 'radiogroup',
								width : 181,
								layout : {
									align : 'stretch',
									type : 'hbox'
								},
								fieldLabel : '模具属性',
								labelWidth : 60,
								items : [ {
									xtype : 'radiofield',
									name : 'isPaid',
									boxLabel : '有偿',
									checked : true
								}, {
									xtype : 'radiofield',
									margin : '0 0 0 22',
									name : 'isPaid',
									boxLabel : '无偿'
								} ]
							}, {
								xtype : 'radiogroup',
								margin : '-5 0 0 20',
								width : 218,
								layout : {
									align : 'stretch',
									type : 'hbox'
								},
								fieldLabel : 'Label',
								hideLabel : true,
								items : [ {
									xtype : 'radiofield',
									name : 'isProduct',
									boxLabel : '部品模',
									checked : true
								}, {
									xtype : 'radiofield',
									margin : '0 0 0 10',
									name : 'isProduct',
									boxLabel : '治具模'
								} ]
							} ]
						}, {
							xtype : 'combobox',
							anchor : '100%',
							width : 330,
							fieldLabel : '付款条件',
							labelWidth : 60
						} ]
					}, {
						xtype : 'fieldset',
						flex : 1,
						maxHeight : 75,
						title : '委外加工',
						items : [ {
							xtype : 'container',
							layout : {
								type : 'table'
							},
							items : [ {
								xtype : 'textfield',
								width : 143,
								fieldLabel : '委外',
								labelWidth : 40
							}, {
								xtype : 'textfield',
								margin : '-5 0 0 5',
								width : 178,
								fieldLabel : '供应商',
								labelWidth : 70
							} ]
						}, {
							xtype : 'container',
							layout : {
								align : 'stretch',
								type : 'hbox'
							},
							items : [ {
								xtype : 'datefield',
								width : 143,
								fieldLabel : '出图',
								labelWidth : 40
							}, {
								xtype : 'datefield',
								margins : '0 0 0 5',
								width : 178,
								fieldLabel : '预入货日期',
								labelWidth : 70
							} ]
						} ]
					} ]
				} ]
			}, {
				xtype : 'container',
				layout : {
					align : 'stretch',
					type : 'hbox'
				},
				items : [ {
					xtype : 'fieldset',
					flex : 1,
					width : 150,
					title : '试模',
					items : [ {
						xtype : 'radiogroup',
						layout : {
							align : 'stretch',
							type : 'hbox'
						},
						fieldLabel : '客户会同',
						labelWidth : 60,
						items : [ {
							xtype : 'radiofield',
							name : 'contract',
							boxLabel : '有',
							checked : true
						}, {
							xtype : 'radiofield',
							margin : '0 0 0 10',
							name : 'contract',
							boxLabel : '无'
						} ]
					}, {
						xtype : 'radiogroup',
						layout : {
							align : 'stretch',
							type : 'hbox'
						},
						fieldLabel : '材料',
						labelWidth : 60,
						items : [ {
							xtype : 'radiofield',
							name : 'material',
							boxLabel : '自备',
							checked : true
						}, {
							xtype : 'radiofield',
							margin : '0 0 0 10',
							name : 'material',
							boxLabel : '客户供给(再生,可,否)'
						} ]
					}, {
						xtype : 'radiogroup',
						layout : {
							align : 'stretch',
							type : 'hbox'
						},
						fieldLabel : '镶物',
						labelWidth : 60,
						items : [ {
							xtype : 'radiofield',
							name : 'insertThing',
							boxLabel : '自备'
						}, {
							xtype : 'radiofield',
							margin : '0 0 0 10',
							name : 'insertThing',
							boxLabel : '客户供给',
							checked : true
						}, {
							xtype : 'numberfield',
							margin : '0 0 0 10',
							width : 140,
							fieldLabel : '试模时(个)',
							labelWidth : 70
						} ]
					}, {
						xtype : 'radiogroup',
						layout : {
							align : 'stretch',
							type : 'hbox'
						},
						fieldLabel : '试模',
						labelWidth : 60,
						items : [ {
							xtype : 'radiofield',
							name : 'tryModule',
							boxLabel : '无人'
						}, {
							xtype : 'radiofield',
							margin : '0 0 0 10',
							name : 'tryModule',
							boxLabel : '自动'
						}, {
							xtype : 'radiofield',
							margin : '0 0 0 10',
							fieldLabel : 'Label',
							hideLabel : true,
							name : 'tryModule',
							boxLabel : '手动',
							checked : true
						}, {
							xtype : 'radiofield',
							margin : '0 0 0 10',
							fieldLabel : 'Label',
							hideLabel : true,
							name : 'tryModule',
							boxLabel : '半自动'
						} ]
					} ]
				}, {
					xtype : 'fieldset',
					flex : 1,
					margins : '0 0 0 5',
					maxWidth : 300,
					title : '检收',
					items : [ {
						xtype : 'radiogroup',
						layout : {
							align : 'stretch',
							type : 'hbox'
						},
						fieldLabel : '指示书',
						labelWidth : 60,
						items : [ {
							xtype : 'radiofield',
							name : 'instruction',
							boxLabel : '有',
							checked : true
						}, {
							xtype : 'radiofield',
							margin : '0 0 0 10',
							name : 'instruction',
							boxLabel : '无'
						} ]
					}, {
						xtype : 'radiogroup',
						layout : {
							align : 'stretch',
							type : 'hbox'
						},
						fieldLabel : '测定具',
						labelWidth : 60,
						items : [ {
							xtype : 'radiofield',
							name : 'gauge',
							boxLabel : '自备',
							checked : true
						}, {
							xtype : 'radiofield',
							margin : '0 0 0 10',
							name : 'gauge',
							boxLabel : '客户供给'
						} ]
					}, {
						xtype : 'radiogroup',
						layout : {
							align : 'stretch',
							type : 'hbox'
						},
						fieldLabel : '试验品',
						labelWidth : 60,
						items : [ {
							xtype : 'radiofield',
							fieldLabel : '检查记录一起发送',
							name : 'recordSend',
							boxLabel : '要',
							checked : true
						}, {
							xtype : 'radiofield',
							margin : '0 0 0 10',
							name : 'recordSend',
							boxLabel : '不要'
						} ]
					} ]
				} ]
			} ]
		});

		me.callParent(arguments);
	}

});