/**
 * Project.component.PictureEditPanel
 */
Ext.define('Module.ModuleMeasurePrictureWindow', {
	extend : 'Ext.window.Window',

	maximizable : true,
	modal : true,
	width : 840,
	height : 650,
	iconCls : 'creditcards-16',
	title : '编辑三次元测量图片',

	actionType : 'new',// edit 为编辑模式,new为新增模式,默认为new

	requires : [ 'Project.component.PictureEditPanel' ],

	craftTpl : '<a class="search-item"><span style = \'font-weight:bold\'>{craftname}</span>'
			+ '[<span style = \'color:red;font-weight:bold\'>{craftcode}</span>]</a>',

	initComponent : function() {
		var me = this;

		Ext.applyIf(me, {
			layout : 'border',
			bodyPadding : 5,
			items : [ {
				xtype : 'pictureeditpanel',
				region : 'center'
			}, {
				title : '图片效果',
				width : 300,
				bodyPadding : 5,
				region : 'east',
				layout : 'border',
				collapsible : true,
				style : 'margin-left:5px;',
				items : [ {
					xtype : 'container',
					id : 'preview-pane',
					region : 'north',
					height : 260,
					html : '<div class="preview-container"><img/></div>',
					listeners : {
						resize : me.previewContainerResize
					}
				}, {
					xtype : 'form',
					id : 'measure-info-form',
					title : '属性',
					bodyPadding : 5,
					region : 'center',
					style : 'margin-top:5px;',
					layout : {
						type : 'anchor'
					},
					defaults : {
						anchor : '100%',
						labelWidth : 60
					},
					items : [ {
						xtype : 'textfield',
						name : 'modulecode',
						fieldLabel : '工号'
					}, {
						xtype : 'textfield',
						name : 'partcode',
						fieldLabel : '部号',
					}, {
						xtype : 'textfield',
						name : 'measurename',
						allowBlank : false,
						fieldLabel : '测量名称'
					}, {
						xtype : 'combobox',
						name : 'craftname',
						fieldLabel : '测量工艺',
						allowBlank : false,
						editable : false,
						displayField : 'craftname',
						valueField : 'craftbarid',
						store : new Ext.data.Store({
							proxy : {
								type : 'ajax',
								url : 'public/getSchedualCrafts',
								reader : {
									type : 'json',
									root : 'craft'
								}
							},
							fields : [ 'craftbarid', 'craftid', 'craftname', 'craftcode', 'mergename' ],
							autoLoad : true
						}),
						listConfig : {
							getInnerTpl : function() {
								return me.craftTpl;
							}
						}
					},
					// {
					// xtype : 'datefield',
					// name : 'measuretime',
					// fieldLabel : '测量时间',
					// format : 'Y-m-d H:i',
					// value : new Date()
					// },
					{
						xtype : 'textareafield',
						name : 'remark',
						fieldLabel : '说明(300字)',
						maxLength : 300
					} ],
					buttons : [ {
						text : me.type = 'new' ? '保存' : '修改',
						iconCls : 'picture_save-16',
						scope : me,
						handler : me.saveMeasurePicture
					}, {
						text : '取消',
						iconCls : 'picture_delete-16',
						handler : function() {
							me.destroy();
						}
					} ]
				} ]

			} ],

			listeners : {
				scope : me,
				render : function() {
					// 如果不编辑图片而弹出窗口时
					if (me.imgSrc) {
						setTimeout(function() {
							var panel = me.getComponent(0);
							panel.canvasInit(me.imgSrc);
						}, 200);
					}
				}
			}
		});

		me.callParent(arguments);
	},

	/**
	 * 调整图片裁剪预览区的大小
	 */
	previewContainerResize : function(panel, width, height, oldWidth, oldHeight, eOpts) {
		var pc = $('#preview-pane .preview-container');
		pc.width(width - 14);
		pc.height(height - 14);
	},

	/**
	 * 保存测量图片
	 */
	saveMeasurePicture : function(button) {
		var me = this;
		var form = Ext.getCmp('measure-info-form').getForm();

		var editpanel = Ext.getCmp('Project.component.PictureEditPanel');

		switch (me.actionType) {
		case 'new': {
			me.saveNewMeasure(form, editpanel, button);
			return;
		}

		case 'edit': {
			Ext.Msg.confirm('確認', '是否確定保存修改后的三次元测量图片?', function(e) {
				if (e == 'yes') {
					me.saveEditMeasure(form, editpanel, button);
				}
			});
			break;
		}
		}

	},

	saveNewMeasure : function(form, editpanel, button) {
		var me = this;
		if (form.isValid() && editpanel.img) {
			Ext.Msg.confirm('確認', '是否確定保存新的三次元测量图片?', function(e) {
				if (e == 'yes') {
					var values = form.getValues();
					button.setIconCls('loading-16');
					button.setDisabled(true);
					Ext.Ajax.request({
						url : 'module/quality/saveMeasurePicture',
						params : {
							"mtm.partbarcode" : me.partRecord.data.partbarcode,
							"mtm.modulebarcode" : me.moduleRecord.data.modulebarcode,
							"mtm.measurename" : values.measurename,
							// "mtm.measuretime" : values.measuretime + ':00',
							"mtm.craftid" : values.craftname,
							"mtm.remark" : values.remark,
							guestcode : values.modulecode.split('-')[0],
							picturedata : editpanel.img.src,
							modulecode : values.modulecode,
							partcode : values.partcode
						},
						success : function(response) {
							var res = JSON.parse(response.responseText);
							App.InterPath(res, function() {
								if (res.success) {
									var measureStore = Ext.getCmp('measure-edit').getStore();
									measureStore.insert(0, {
										id : res.id,
										modulebarcode : me.moduleRecord.data.modulebarcode,
										partbarcode : me.partRecord.data.partbarcode,
										measurename : values.measurename,
										craftid : values.craftname,
										remark : values.remark,
										imagestring : editpanel.img.src,
										width : editpanel.img.width,
										height : editpanel.img.height,
										empname : res.empname,
										modulecode : values.modulecode,
										craftname : form.getFields().getAt(3).getRawValue(),
										partcode : values.partcode,
										measuretime : res.measuretime
									});

									measureStore.fireEvent('load', {

									});
									me.destroy();
								}

								Fly.msg('信息', res.msg);
								button.setIconCls('picture_save-16');
								button.setDisabled(false);
							});
						},
						failure : function(response, opts) {
							button.setDisabled(false);
							button.setIconCls('picture_save-16');
							App.Error(response);
						}
					});
				}
			});
		}
	},

	saveEditMeasure : function(form, editpanel) {

		if (form.isValid() && editpanel.img) {

			var values = form.getValues();
			button.setDisabled(true);
			Ext.Ajax.request({
				url : 'module/quality/saveMeasurePicture',
				params : {
					"mtm.id" : me.partRecord.data.id,
					"mtm.measurename" : values.measurename,
					"mtm.craftid" : values.craftname,
					"mtm.remark" : values.remark,
					guestcode : values.modulecode.split('-')[0],
					picturedata : editpanel.img.src,
					modulecode : values.modulecode,
					partcode : values.partcode
				},
				success : function(response) {
					var res = JSON.parse(response.responseText);
					App.InterPath(res, function() {
						if (res.success) {
							me.destroy();
						} else {
							button.setDisabled(false);
						}

						Fly.msg('信息', res.msg);
					});
				},
				failure : function(response, opts) {
					App.Error(response);
				}
			});

		}

	}

});