/**
 * 模具工件条码打印介面
 * 
 * 作者:David Email:xuweissh@163.com
 */
Ext.define('Module.ModuleBarcode', {
	extend : 'Project.component.BarcodePrintPanel',
	layout : {
		type : 'border'
	},
	title : '模具查询',
	initComponent : function() {
		var me = this;
		if (!App.paperFormat) {
			App.paperFormat = me.getPrintPaperFormat(1);
		}

		Ext.applyIf(me, {
			items : [ {
				xtype : 'gridpanel',
				title : '模具工号',
				region : 'west',
				split : true,
				width : 310,
				forceFit : true,
				rootVisible : false,
				viewConfig : {
					emptyText : '<h1 style="10214053000margin:10px">查询不到模具工号</h1>',
				},
				store : Ext.create('Ext.data.Store', {
					autoLoad : true,
					fields : [ 'modulebarcode', 'guestcode', 'modulecode' ],
					proxy : {
						url : '',
						type : 'ajax',
						reader : {
							type : 'json',
							root : 'children'
						}
					}
				}),
				dockedItems : [ {
					xtype : 'toolbar',
					dock : 'top',
					items : [ {
						id : 'mpb-chk-by-guest',
						xtype : 'checkbox',
						boxLabel : '依番号'
					}, {
						xtype : 'textfield',
						emptyText : '请输入模具号',
						type : 0,
						states : '',
						isText : true,
						listeners : {
							change : me.onResumeModule
						}
					}, {
						text : '快速查询',
						iconCls : 'lightning-16',
						menu : Ext.create("Ext.menu.Menu", {
							items : [ {
								text : '新模设计',
								type : 1,
								isText : false,
								states : "('20401')",
								parent : me,
								iconCls : 'cog_add-16',
								handler : me.onResumeModule
							}, {
								text : '其他设计',
								type : 1,
								states : "('20402')",
								isText : false,
								parent : me,
								iconCls : 'cog_edit-16',
								handler : me.onResumeModule
							} ]
						})
					} ]
				} ],
				bbar : [ '->', '-', {
					text : '生成条码',
					scope : me,
					iconCls : 'award_star_add-16',
					handler : me.buttonHandler
				} ],
				columns : [ {
					xtype : 'gridcolumn',
					dataIndex : 'modulecode',
					text : '模具工号',
					renderer : function(val, meta, record) {
						var _guestcode = record.get('guestcode');
						return '<b>' + (val ? val : '') + (_guestcode ? ('<font color = blue>(' + _guestcode + ')</font>') : '') + '</b>';
					}
				} ],
				selModel : Ext.create('Ext.selection.CheckboxModel', {
					mode : 'SIMPLE'
				}),
			}, Ext.create('Project.component.PrintPanel', {
				id : 'module-barcode-printpanel',
				region : 'center',
				printObjectId : 'module-barcode-object',
				printEmbedId : 'module-barcode-embed',
				paperId : App.paperFormat.id,
				pageWidth : App.paperFormat.paperwidth,
				pargHeight : App.paperFormat.paperheight,
				unit : 'mm',
				intOrient : 1,// 打印方向
				pages : App.paperFormat.papers,
				gap : App.paperFormat.papergap,
				leftGap : App.paperFormat.leftgap,
				rightGap : App.paperFormat.rightgap

			}) ]
		});

		me.callParent(arguments);
	},
	/**
	 * 新模或修模/设变
	 */
	onResumeModule : function(ctrl, nw) {
		var item = this;
		var chk = Ext.getCmp('mpb-chk-by-guest').getValue();
		item.up('gridpanel').getStore().load({
			url : 'devise/share/getDeviseModuleByCase',
			params : {
				chk : chk,
				match : item.isText ? nw : '',
				states : item.states,
				type : item.type
			}
		});
	},
	buttonHandler : function(button) {
		var grid = button.up('gridpanel');
		this.previewBarcode('module-barcode-printpanel', grid.getSelectionModel().getSelection(), 1, 16072001);
	}
});