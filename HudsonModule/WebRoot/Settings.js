var oldItmeColor = '#A9A9A9';
/*
 * ! Ext JS Library 4.0 Copyright(c) 2006-2011 Sencha Inc. licensing@sencha.com
 * http://www.sencha.com/license
 */
Ext.define('DesktopSetting', {
	extend : 'Ext.container.Container',

	id : 'DesktopSetting',
	uses : [ 'Ext.tree.Panel', 'Ext.tree.View', 'Ext.form.field.Checkbox', 'Ext.layout.container.Anchor', 'Ext.layout.container.Border',
			'Ext.ux.desktop.Wallpaper', 'MyDesktop.WallpaperModel' ],
	layout : 'anchor',
	region : 'center',
	initComponent : function() {
		var me = this;

		me.selected = me.desktop.getWallpaper();
		me.stretch = me.desktop.wallpaper.stretch;

		me.preview = Ext.create('widget.wallpaper');
		me.preview.setWallpaper(me.selected);
		me.tree = me.createTree();

		me.items = [ {
			anchor : '0 -30',
			border : false,
			layout : 'border',
			items : [ me.tree, {
				xtype : 'panel',
				title : Settings.preview,
				region : 'center',
				layout : 'fit',
				items : [ me.preview ]
			} ]
		}, {
			xtype : 'checkbox',
			boxLabel : Settings.stretch,
			checked : me.stretch,
			listeners : {
				change : function(comp) {
					me.stretch = comp.checked;
				}
			}
		} ];

		me.callParent();
	},
	createTree : function() {
		var me = this;

		function child(img) {
			return {
				img : img,
				text : me.getTextOfWallpaper(img),
				iconCls : '',
				leaf : true
			};
		}

		var tree = new Ext.tree.Panel({
			title : Settings.desktop,
			rootVisible : false,
			lines : false,
			autoScroll : true,
			width : 150,
			region : 'west',
			split : true,
			minWidth : 100,
			listeners : {
				afterrender : {
					fn : this.setInitialSelection,
					delay : 100
				},
				select : this.onSelect,
				scope : this
			},
			store : new Ext.data.TreeStore({
				model : 'MyDesktop.WallpaperModel',
				root : {
					text : 'Wallpaper',
					expanded : true,
					children : [ {
						text : "None",
						iconCls : '',
						leaf : true
					}, child('Blue-Sencha.jpg'), child('Dark-Sencha.jpg'), child('Wood-Sencha.jpg'), child('blue.jpg'), child('desk.jpg'),
							child('desktop.jpg'), child('desktop2.jpg'), child('sky.jpg') ]
				}
			})
		});

		return tree;
	},

	getTextOfWallpaper : function(path) {
		var text = path, slash = path.lastIndexOf('/');
		if (slash >= 0) {
			text = text.substring(slash + 1);
		}
		var dot = text.lastIndexOf('.');
		text = Ext.String.capitalize(text.substring(0, dot));
		text = text.replace(/[-]/g, ' ');
		return text;
	},

	onSelect : function(tree, record) {
		var me = this;

		if (record.data.img) {
			me.selected = 'wallpapers/' + record.data.img;
		} else {
			me.selected = Ext.BLANK_IMAGE_URL;
		}

		me.preview.setWallpaper(me.selected);
		// me.parent.executeArray[0] = me.execute;
	},

	setInitialSelection : function() {
		var s = this.desktop.getWallpaper();
		if (s) {
			var path = '/Wallpaper/' + this.getTextOfWallpaper(s);
			this.tree.selectPath(path, 'text');
		}
	},

	/**
	 * 执行设置的方法
	 */
	execute : function(object) {
		var me = Ext.getCmp('DesktopSetting');
		if (me.selected) {
			me.desktop.setWallpaper(me.selected, me.stretch);
			Cookies.setCookie('wallpaper', me.selected);
		}
	}

});

Ext.define('AccoutSecurityForm', {
	extend : 'Ext.form.Panel',
	region : 'center',
	bodyPadding : 10,
	title : '账户安全',
	initComponent : function() {
		var me = this;

		Ext.apply(me, {
			items : [ {
				xtype : 'textfield',
				anchor : '100%',
				fieldLabel : '旧密码',
				id : 'security-old',
				allowBlank : false,
				labelWidth : 60,
				inputType : 'password'
			}, {
				xtype : 'textfield',
				anchor : '100%',
				fieldLabel : '新密码',
				id : 'security-new',
				allowBlank : false,
				labelWidth : 60,
				inputType : 'password'
			}, {
				xtype : 'textfield',
				anchor : '100%',
				fieldLabel : '确认密码',
				allowBlank : false,
				id : 'security-repeat',
				labelWidth : 60,
				inputType : 'password'
			} ],
			tbar : [ {
				iconCls : 'dialog-ok-16',
				text : '修改密码',
				handler : me.onChanagePassword
			} ]
		});

		me.callParent();
	},
	onChanagePassword : function() {
		var form = this.up('form').getForm();
		if (form.isValid()) {
			Ext.Ajax.request({
				url : 'alterUserInfo',
				params : {
					security_old : Ext.getCmp('security-old').getValue(),
					security_new : Ext.getCmp('security-new').getValue(),
					security_repeat : Ext.getCmp('security-repeat').getValue()
				},
				method : 'POST',
				success : function(res) {
					var backJson = Ext.JSON.decode(res.responseText);
					if (backJson.success) {
						Ext.Msg.alert('错误', '修改成功下次登录生效');
					} else {
						Ext.Msg.alert('错误', backJson.msg);
					}
				},
				failure : function(x, y, z) {
					Ext.Msg.alert('错误', '连接服务器失败');
				}
			});
		} else {
			Ext.Msg.alert('提示', '密码不允许为空');
		}
	}
});

Ext.define('AccoutInformationForm', {
	extend : 'Ext.form.Panel',
	region : 'center',
	bodyPadding : 10,
	title : '账户基本信息',
	initComponent : function() {
		var me = this;

		Ext.apply(me, {
			items : [ {
				xtype : 'textfield',
				anchor : '100%',
				fieldLabel : '姓名',
				labelWidth : 60,
				value : !Cookies.setCookie('wallpaper') ? Cookies.setCookie('wallpaper') : 'wallpapers/Blue-Sencha.jpg',
				readOnly : true
			}, {
				xtype : 'fieldset',
				title : '联系信息',
				items : [ {
					xtype : 'label',
					text : '当前手机号:',
					style : {
						color : oldItmeColor,
						margin : '0 0 0 75'
					}
				}, {
					xtype : 'textfield',
					anchor : '100%',
					fieldLabel : '新手机号',
					id : 'informationform-phone',
					labelWidth : 70,
					style : {
						marginTop : '5px'
					},
					maxLength : 11
				}, {
					xtype : 'label',
					text : '当前短号:',
					style : {
						color : oldItmeColor,
						margin : '0 0 0 75'
					}
				}, {
					xtype : 'textfield',
					anchor : '100%',
					id : 'informationform-shortNumber',
					fieldLabel : '新短号',
					labelWidth : 70,
					style : {
						marginTop : '5px'
					}
				}, {
					xtype : 'label',
					text : '当前电子邮箱:',
					style : {
						color : oldItmeColor,
						margin : '0 0 0 75'
					}

				}, {
					xtype : 'textfield',
					anchor : '100%',
					id : 'informationform-email',
					fieldLabel : '新电子邮箱',
					vtype : 'email',
					labelWidth : 70,
					style : {
						marginTop : '5px'
					}
				} ]
			} ],
			dockedItems : [ {
				xtype : 'toolbar',
				dock : 'bottom',
				ui : 'footer',
				layout : {
					align : 'stretchmax',
					type : 'hbox'
				},
				items : [ {
					xtype : 'button',
					width : 60,
					text : '更改',
					handler : me.onChanageInfo

				} ]
			} ]
		});

		me.callParent();
	},
	onChanageInfo : function() {
		var form = this.up('form').getForm();
		var phone = App.getValue('informationform-phone');
		var shortNumber = App.getValue('informationform-shortNumber');
		var email = App.getValue('informationform-email');

		if (phone == '' && shortNumber == '' && email == '') {
			Ext.Msg.alert('信息', '请输入您要更改的资料!');
			return;
		}

		/*
		 * Normally we would submit the form to the server here and handle the
		 * response...
		 */
		if (form.isValid()) {
			Ext.Ajax.request({
				url : 'changeuserinfo',
				params : {
					workNumber : UserRole.workNumber,
					phone : phone,
					shortNumber : shortNumber,
					email : email
				},
				success : function(response) {
					if (response.responseText > 0) {
						Ext.Msg.alert('信息', "个人资料修改成功!");

						UserRole.phone = phone;
						UserRole.shortNumber = shortNumber;
						UserRole.email = email;
					} else {
						Ext.Msg.alert('信息', "个人资料修改不成功,请再修改一次!");
					}

				},
				failure : function(response) {
					Ext.Msg.alert("错误", response.status);
				}
			});
		}

	},
	execute : function() {
	}
});

/**
 * 用户设置页面
 */
Ext.define('UserSetting', {
	extend : 'Ext.container.Container',

	region : 'center',
	layout : 'border',
	initComponent : function() {
		var me = this;

		var tree = Ext.create('Ext.tree.Panel', {
			margins : '0 5 0 0',
			region : 'west',
			width : 150,
			title : '选项',
			rootVisible : false,
			store : Ext.create('Ext.data.TreeStore', {
				root : {
					expanded : true,
					text : 'root',
					children : [ {
						text : "账户安全",
						id : 'AccoutSecurityForm',
						leaf : true
					}, {
						text : "个人基本资料",
						id : 'AccoutInformationForm',
						leaf : true
					} ]
				}
			}),

			listeners : {
				itemclick : me.onSelectSettingItem
			}
		});

		Ext.apply(me, {
			items : [ tree, {
				xtype : 'container',
				id : 'settimg-item-container',
				region : 'center',
				layout : {
					type : 'card'
				},
				items : [ Ext.create('AccoutSecurityForm'), Ext.create('AccoutInformationForm') ]
			} ]
		});

		me.callParent();
	},

	onSelectSettingItem : function(tree, record, item, index, e, eOpts) {

		if (record.data.leaf) {
			var con = Ext.getCmp('settimg-item-container');
			con.getLayout().setActiveItem(index);
		}
	},

	execute : function() {
	}

});

Ext.define('MyDesktop.Settings', {
	extend : 'Ext.window.Window',

	layout : 'card',
	title : Settings.title,
	modal : true,
	width : 640,
	height : 480,
	border : false,
	bodyPadding : 5,
	id : 'setting-window',

	// 用于存放所有设置完成后的设置方法
	executeItem : null,
	initComponent : function() {
		var me = this;

		me.buttons = [ {
			text : Settings.enter,
			handler : me.onOK,
			scope : me
		}, {
			text : Settings.cancel,
			handler : me.close,
			scope : me
		} ];

		me.tbar = [ {
			xtype : 'buttongroup',
			defaults : {
				scale : 'medium',
				iconAlign : 'top',
				pressed : false,
				toggleGroup : 'btns',
				allowDepress : false
			},
			items : [ {
				xtype : 'button',
				text : Settings.desktopSetting,
				iconCls : 'gtk-execute-24',
				cls : 'apply-car-info-button-group',
				state : '1',
				width : 60,
				margins : '0 3 0 0',
				itemName : 'DesktopSetting',
				index : 0,
				enableToggle : true,
				pressed : true,
				handler : me.onChanageSetting
			}, {
				xtype : 'button',
				text : Settings.userSetting,
				iconCls : 'contact-new-24',
				cls : 'apply-car-info-button-group',
				state : '0',
				width : 60,
				itemName : 'UserSetting',
				index : 1,
				margins : '0 3 0 0',
				enableToggle : true,
				pressed : false,
				handler : me.onChanageSetting
			} ]
		} ];

		me.items = [ Ext.create('DesktopSetting', {
			desktop : me.desktop,
			parent : me
		}), Ext.create('UserSetting', {
			desktop : me.desktop,
			parent : me
		}) ];

		me.callParent();
	},

	/**
	 * 切换设置页面
	 * 
	 * @param button
	 */
	onChanageSetting : function(button) {
		// 获取窗口信息
		var parent = button.up('window');
		parent.getLayout().setActiveItem(button.index);
	},

	onOK : function() {
		var me = this;
		// 执行所有设置内容
		Ext.Array.each(me.items.items, function(item) {
			item.execute();
		});

		me.destroy();
	},

});
