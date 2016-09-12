Ext.define('QueryOutBoundWindow', {
	extend : 'Ext.window.Window',

	height : 233,
	width : 337,
	layout : {
		type : 'border'
	},
	bodyPadding : 5,
	title : '外发查询栏',
	modal : true,

	initComponent : function() {
		var me = this;

		Ext.applyIf(me, {
			items : [ {
				xtype : 'fieldset',
				region : 'center',
				title : '查询条件',
				items : [ {
					id : 'query-outbound-stateid',
					xtype : 'combobox',
					anchor : '100%',
					fieldLabel : '外发状态',
					displayField : 'statename',
					valueField : 'stateid',
					editable : false,
					store : Ext.create('Ext.data.Store', {
						fields : [ 'stateid', 'statename' ],
						autoLoad : true,
						proxy : {
							url : 'public/getOutBoundStates',
							type : 'ajax',
							reader : {
								type : 'json'
							}
						}
					})
				}, {
					id : 'query-outbound-modulecode',
					xtype : 'textfield',
					anchor : '100%',
					fieldLabel : '模具编号'
				}, {
					id : 'query-outbound-partid',
					xtype : 'textfield',
					anchor : '100%',
					fieldLabel : '工件编号'
				}, {
					id : 'query-outbound-startdate',
					xtype : 'datefield',
					anchor : '100%',
					fieldLabel : '开始日期',
					format : 'Y-m-d',
					value : me.getDistanceDay(30),
					editable : false
				}, {
					id : 'query-outbound-enddate',
					xtype : 'datefield',
					anchor : '100%',
					fieldLabel : '结束日期',
					format : 'Y-m-d',
					value : new Date(),
					editable : false
				} ]
			} ],
			bbar : [ '->', {
				text : '立即查询',
				iconCls : 'zoom_in-16',
				handler : me.getFieldSetValue
			}, '-', {
				text : '果断退出',
				iconCls : 'cross-16',
				handler : function() {
					this.up('window').close();
				}
			} ]
		});

		me.callParent(arguments);
	},
	/**
	 * 获取今天指定日期内的某一天
	 * 
	 * @param day
	 * @returns
	 */
	getDistanceDay : function(day) {
		var sdate = new Date();
		if (!day) {
			return sdate;
		}

		sdate.setTime(sdate.getTime() - parseInt(day) * 3600 * 1000 * 24);
		return sdate;
	},
	/**
	 * 查询数据
	 */
	getFieldSetValue : function() {
		// 获取工件的相关数据
		var _stateid = Ext.getCmp('query-outbound-stateid').getValue();
		var _modulecode = Ext.getCmp('query-outbound-modulecode').getValue();
		var _partid = Ext.getCmp('query-outbound-partid').getValue();
		var _startdate = Ext.getCmp('query-outbound-startdate').getValue();
		var _enddate = Ext.getCmp('query-outbound-enddate').getValue();

		// 获取store
		var _store = Ext.getStore('query-outbound-parts-store');

		// 加载数据
		_store.load({
			url : 'module/part/getOutBoundPartInfo',
			method : 'POST',
			params : {
				stateid : _stateid,
				modulecode : _modulecode,
				partid : _partid,
				startdate : Ext.Date.format(_startdate, 'Y-m-d'),
				enddate : Ext.Date.format(_enddate, 'Y-m-d')
			}
		});

		// 关闭窗口
		this.up('window').close();
	}

});
Ext.define('Module.PartOutManage', {
	extend : 'Ext.panel.Panel',
	title : '外发管理',
	layout : 'border',
	initComponent : function() {
		var me = this;
		me.items = [ {
			xtype : 'gridpanel',
			title : '外发工件管理栏',
			region : 'center',
			selType : 'checkboxmodel',
			tbar : [
					{
						text : '外发查询',
						iconCls : 'zoom-16',
						handler : function() {
							new QueryOutBoundWindow().show();
						}
					},
					// '-',
					// {
					// text : '核准外发',
					// iconCls : 'user_edit-16',
					// handler : function() {
					// me.operatePartInfo('module/part/saveOutBoundApplyCheck',
					// '确认核准外发', '20601', '20602', '', "CHECKTIME", "CHECKER",
					// false,
					// false, false);
					// }
					// },
					// '-',
					// {
					// text : '驳回外发',
					// iconCls : 'user_delete-16',
					// handler : function() {
					// me.operatePartInfo('module/part/saveOutBoundApplyUncheck',
					// '确认驳回外发', '20601', '20603', '', "CHECKTIME", "CHECKER",
					// false,
					// true, false);
					// }
					// },
					// '-',
					// {
					// text : '取消外发',
					// iconCls : 'delete-16',
					// handler : function() {
					// me.operatePartInfo('module/part/saveOutBoundApplyCancel',
					// '确认取消外发', '20601,20602', '20606', '', "CANCELTIME",
					// "CANCELMAN", false, true, false);
					// }
					// },
					// '-',
					// {
					// text : '工件外发',
					// iconCls : 'door_out-16',
					// handler : function() {
					// me.operatePartInfo('module/part/saveOutBoundApplyOut',
					// '确认工件外发', '20602', '20604', '20205', "OUTTIME", "OUTMAN",
					// true,
					// false, true);
					// }
					// },
					'-',
					{
						text : '工件发回',
						iconCls : 'door_in-16',
						handler : function() {
							me.operatePartInfo('module/part/saveOutBoundApplyBack', '确认工件回收', '20604', '20605', '20208', "BACKTIME", "RECEVIER",
									true, true, true);
						}
					}, '-', {
						text : '刷新列表',
						iconCls : 'arrow_refresh-16',
						handler : function() {
							this.up('gridpanel').getStore().reload();
						}
					} ],
			columns : [ {
				text : '模具工号',
				dataIndex : 'modulecode'
			}, {
				text : '客户番号',
				dataIndex : 'guestcode'
			}, {
				text : '工件编号',
				dataIndex : 'partlistcode'
			}, {
				text : '工件名称',
				dataIndex : 'cnames'
			}, {
				text : '客户名称',
				dataIndex : 'shortname'
			}, {
				text : '外发状态',
				dataIndex : 'statename'
			}, {
				text : '外发厂商',
				dataIndex : 'outguestname'
			}, {
				text : '外发工艺',
				dataIndex : 'outcraftcode',
				renderer : function(value) {
					if (!value) {
						return value;
					}

					return '<b>' + value.replace(/,/g, '->') + '</b>';
				}
			}
			// , {
			// text : '申请人',
			// dataIndex : 'empname'
			// }
			// , {
			// text : '申请时间',
			// dataIndex : 'applytime'
			// }
			, {
				text : '预计外发时间',
				dataIndex : 'planouttime',
				renderer : function(val) {
					return (val ? '<b>' + val + '</b>' : val);
				}
			}, {
				text : '预计回厂时间',
				dataIndex : 'planbacktime',
				renderer : function(val) {
					return (val ? '<b>' + val + '</b>' : val);
				}
			}, {
				text : '备注说明',
				dataIndex : 'applycomment',
				width : 250,
				renderer : function(val) {
					return (val ? '<b>' + val + '</b>' : val);
				}
			} ],
			store : Ext.create('Ext.data.Store', {
				id : 'query-outbound-parts-store',
				fields : [ 'pid', 'modulecode', 'guestcode', 'partlistcode', 'cnames', 'shortname', 'statename', 'outguestname', 'outcraftname',
						'applycomment', 'applytime', 'backtime', 'planouttime', 'planbacktime', 'empname', 'partlistbarcode', 'charges',
						'outcraftcode', 'moduleresumeid' ],
				autoLoad : true,
				proxy : {
					url : 'module/part/getOutBoundPartInfo?stateid=20604',
					type : 'ajax',
					reader : {
						type : 'json'
					}
				}
			})
		} ];
		me.callParent(arguments);
	},
	operatePartInfo : function(uri, tip, oid, fid, psd, tcol, ecol, resume, finish, dept) {
		// 读取GRID表中的数据
		var _grid = this.down('gridpanel');
		var _store = _grid.getStore();
		var _range = _grid.getSelectionModel().getSelection();
		console.info(_range);
		if (!_range.length) {
			showError('没有任何可操作的资料行!');
			return;
		}

		// 获取工件列表中的值
		var partinfo = [];
		for ( var x in _range) {
			console.info(_range[x].get('partlistbarcode'));
			console.info(_range[x].get('moduleresumeid'));
			partinfo.push({
				partbarlistcode : _range[x].get('partlistbarcode'),
				resumeid : _range[x].get('moduleresumeid')
			});
		}

		Ext.Msg.confirm('提醒', tip, function(y) {
			if (y == 'yes') {
				Ext.Ajax.request({
					url : uri,
					method : 'POST',
					params : {
						data : Ext.JSON.encode(partinfo),
						isresume : resume,
						isfinish : finish,
						ostateid : oid,
						fstateid : fid,
						timecol : tcol,
						empcol : ecol,
						pstateid : psd,
						isdept : dept
					},
					success : function(res) {
						var backJson = Ext.JSON.decode(res.responseText);
						if (backJson.success) {
							showInfo('工件已经更新完毕!');
							_store.reload();
							return;
						} else {
							if (backJson.result == -1) {
								showInfo('没有任何有效的更新资料行!');
								return;
							} else if (backJson.result == -2) {
								showInfo(backJson.error + '工件正在加工中,请先通知现场停止加工!');
								return;
							} else if (backJson.result == -3) {
								showInfo('外发工件失败,请重试!');
								return;
							} else {
								showInfo('你没有操作权限!');
								return;
							}
						}
					},
					failure : function(x, y, z) {
						showError('连接网络失败!');
						return;
					}
				});
			}
		});
	}
});