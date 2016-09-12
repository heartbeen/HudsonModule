/**
 * 上传文件对话框,客户上传工件清单窗口
 */
Ext.define('Project.component.FileUploadWindow', {
	extend : 'Ext.window.Window',

	layout : 'border',
	frame : true,
	iconCls : 'human-folder-new-16',
	modal : true,
	width : 400,
	height : 100,

	fileType : '',// 指定上传文件的类型
	downloadModeUrl : '',// 下载模板地址
	uploadUrl : '',// 上传文件地址
	/**
	 * 上传成功后处理方法<br>
	 * 参数:<br>
	 * window 文件上传对话框 <br>
	 * content 服务器响应结果
	 */
	successFunction : new Function(),// 
	initComponent : function() {
		var me = this;

		Ext.applyIf(me, {
			items : [ {
				xtype : 'form',
				region : 'center',
				bodyPadding : 10,
				defaults : {
					anchor : '100%',
					allowBlank : false,
					msgTarget : 'side',
					labelWidth : 50
				},
				border : false,

				items : [ {
					xtype : 'filefield',
					id : 'form-file',
					emptyText : '请选择文件...',
					fieldLabel : '文件',
					name : 'filePath',
					regex : new RegExp(me.fileType ? me.fileType : ''),
					regexText : "文件类型错误,请上传(" + me.fileType + ")格式文件!",
					buttonText : '',
					buttonConfig : {
						iconCls : 'filefind-16'
					}
				} ],

				buttons : [ {
					xtype : 'label',
					html : '<a href="' + me.downloadModeUrl + '" >下载模板</a>',
					iconCls : 'gtk-sort-ascending-16'

				}, '-', {
					text : '上传',
					iconCls : 'gtk-sort-descending-16',
					width : 60,
					handler : function() {
						var form = this.up('form').getForm();

						if (!me.uploadUrl) {
							Ext.Msg.alert('错误', "没有指定指定提交地址!");
							return;
						}

						if (form.isValid()) {
							form.submit({
								url : me.uploadUrl,
								waitMsg : '上传中,请稍候...',
								success : function(fp, action) {
									var res = Ext.JSON.decode(action.response.responseText);
									App.InterPath(res, me.successFunction(me, res));
								},
								failure : function(form, action) {
									switch (action.failureType) {
									case Ext.form.action.Action.CLIENT_INVALID:
										Ext.Msg.alert('错误', '表单字段不得提交无效值');
										break;
									case Ext.form.action.Action.CONNECT_FAILURE:
										Ext.Msg.alert('错误', '与服务通信失败');
										break;
									case Ext.form.action.Action.SERVER_INVALID:
										Ext.Msg.alert('错误', action.result.msg);
									}
								}
							});
						}
					}
				}, {
					text : '取消',
					width : 60,
					iconCls : 'xfce-system-exit-16',
					handler : function() {
						me.destroy();
					}
				} ]
			} ]
		});

		me.callParent(arguments);
	}

})