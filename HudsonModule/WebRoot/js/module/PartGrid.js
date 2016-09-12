Ext.define('Module.PartGrid', {
	extend : 'Ext.grid.Panel',

	initComponent : function() {
		var me = this;
		Ext.define('Part', {
			extend : 'Ext.data.Model',
			fields : [ 'partbarcode','partcode', 'chinaname', 'material', 'quantity', 'standard', 'layer', 'remark' ]
		});

		Ext.apply(me, {
			store : Ext.create('Ext.data.Store', {
				model : 'Part',
				proxy : {
					type : 'memory',
					reader : {
						type : 'json',
						root : 'part'
					}
				}
			}),

			// 无权限时不启用编辑插件
			plugins : Ext.create('Ext.grid.plugin.CellEditing', {
				pluginId : me.pluginId,
				clicksToEdit : 1,
				listeners : {
					edit : function(editor, e, eOpts) {// 这个方法只对特定的工厂有效
						// TODO 这里要写自动填充工件名称代码
						// 当记录有更改时进行记录
						if (e.originalValue != e.value) {
							me.array[e.rowIdx] = e.record.data;// 记录更改过的数据
						}

					}
				}
			}),
			columns : [ {
				xtype : 'gridcolumn',
				width : 62,
				dataIndex : 'partcode',
				text : '部号',
				field : {
					type : 'textfield',
					maxLength : 20
				}
			}, {
				xtype : 'gridcolumn',
				dataIndex : 'chinaname',
				text : '名称',
				editor : new Ext.form.field.ComboBox({
					id : me.comboId,
					typeAhead : true,
					triggerAction : 'all',
					selectOnTab : true,
					displayField : 'text',
					store : me.partname,//
					lazyRender : true,
					listClass : 'x-combo-list-small'
				})
			}, {
				xtype : 'gridcolumn',
				dataIndex : 'material',
				width : 79,
				text : '材质',
				field : {
					type : 'combobox',
					maxLength : 20
				}
			}, {
				xtype : 'gridcolumn',
				dataIndex : 'quantity',
				width : 43,
				text : '数量',
				renderer : function(value, metaData, record, rowIdx, colIdx, store, view) {
					value = value < 1 ? 1 : value;
					return value;
				},
				field : {
					xtype : 'numberfield'
				}
			}, {
				xtype : 'gridcolumn',
				dataIndex : 'standard',
				text : '规格',
				field : {
					type : 'textfield',
					maxLength : 50
				}
			}, {
				xtype : 'gridcolumn',
				dataIndex : 'layer',
				width : 62,
				text : '图层',
				field : {
					type : 'textfield',
					maxLength : 5
				}
			}, {
				xtype : 'gridcolumn',
				dataIndex : 'remark',
				text : '说明',
				field : {
					type : 'textfield',
					maxLength : 140
				}
			} ]

		});

		me.callParent(arguments);
	}
});
