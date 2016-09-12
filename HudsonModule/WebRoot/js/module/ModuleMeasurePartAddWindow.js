/**
 * 增加测量工件窗口
 */
Ext.define('Module.ModuleMeasurePartAddWindow', {
	extend : 'Ext.window.Window',
	iconCls : 'brick_add-16',
	width : 300,
	height : 400,
	layout : 'fit',
	modal : true,
	initComponent : function() {
		var me = this;

		me.measurePartStore = Ext.create('Ext.data.Store', {
			fields : [ 'modulebarcode', 'partbarcode', 'text', 'partcode' ],
			autoLoad : true,
			proxy : {
				type : 'ajax',// 得到不用测量的工件
				url : 'public/moduleMeasureList?measure=0&moduleBarcode=' + me.moduleBarcode,
				reader : {
					type : 'json',
					root : 'children'
				}
			}
		});

		Ext.applyIf(me, {
			items : [ {
				xtype : 'gridpanel',
				title : '',
				border : false,
				store : me.measurePartStore,
				selModel : Ext.create('Ext.selection.CheckboxModel', {
					mode : 'SIMPLE'
				}),
				columns : [ {
					text : '工件',
					dataIndex : 'text',
					width : 240
				} ],

				dockedItems : [ {
					xtype : 'toolbar',
					items : [ Ext.create('Project.component.FilterTextField', {
						emptyText : '查找...',
						filterField : 'text',
						width : 150,
						store : me.measurePartStore
					}) ]
				} ]
			} ],
			buttons : [ {
				text : '增加',
				scope : me,
				handler : me.addMeasurePart

			}, {
				text : '取消',
				handler : function() {
					me.destroy();
				}
			} ]
		});

		me.callParent(arguments);
	},

	addMeasurePart : function() {
		var me = this;
		var models = me.getComponent(0).getSelectionModel().getSelection();
		var parts = '';

		if (models.length == 0) {
			return;
		}

		for ( var i in models) {
			parts = parts.concat("'").concat(models[i].get('partbarcode')).concat(i == models.length - 1 ? "'" : "',");
		}

		Ext.Ajax.request({
			url : 'module/quality/addMeasurePart',
			params : {
				"parts" : parts
			},
			success : function(response) {
				var res = JSON.parse(response.responseText);
				App.InterPath(res, function() {
					if (res.success) {
						if (me.measureStoreId) {
							var store = Ext.getStore(me.measureStoreId);
							store.load({
								url : store.proxy.url,
								params : {
									moduleBarcode : me.moduleBarcode,
									measure : 1
								}
							});
							me.destroy();
						}
					}

					Fly.msg('信息', res.msg);
				});
			},
			failure : function(response, opts) {
				App.Error(response);
			}
		});
	}
});
