/**
 * 
 */
Ext.define('MyDesktop.App', {
	extend : 'Ext.ux.desktop.App',

	requires : UserWork,
	init : function() {
		this.callParent();
	},

	getModules : function() {

		var items = new Array();

		// 将用户的功能进行创建
		for (var i = 3; i < UserWork.length; i++) {
			items[i - 3] = new UserWork[i](); // Ext.create(UserWork[i]);
		}

		return items;
	},

	/**
	 * 桌面配置<br>
	 * 这里对桌面进行初始化配置
	 * 
	 * @returns
	 */
	getDesktopConfig : function() {
		var me = this, ret = me.callParent(), bmg = Cookies.getCookie('wallpaper');
		return Ext.apply(ret, {
			// cls: 'ux-desktop-black',

			contextMenuItems : [ {
				text : '设置',
				handler : me.onSettings,
				scope : me
			} ],

			// 桌面图标
			shortcuts : Ext.create('Ext.data.Store', {
				model : 'Ext.ux.desktop.ShortcutModel',
				data : DesktopItem
			}),

			// 桌面背景为用户个人设置
			wallpaper : bmg ? bmg : 'wallpapers/Blue-Sencha.jpg',
			wallpaperStretch : false
		});
	},

	/**
	 * 开始菜单配置
	 * 
	 * @returns
	 */
	getStartConfig : function() {
		var me = this, ret = me.callParent();

		return Ext.apply(ret, {
			title : "(forth---zhangsan)",
			iconCls : 'user',
			height : 300,
			toolConfig : {
				width : 100,
				items : [ {
					text : Desktop.settings,
					iconCls : 'settings',
					handler : me.onSettings,
					scope : me
				}, '-', {
					text : Desktop.logoutTitle,
					iconCls : 'logout',
					handler : me.onLogout,
					scope : me
				} ]
			}
		});
	},

	/**
	 * 快速启动菜单配置
	 * 
	 * @returns
	 */
	getTaskbarConfig : function() {
		var ret = this.callParent();

		return Ext.apply(ret, {
			quickStart : [ {
				name : 'Accordion Window',
				iconCls : 'accordion',
				module : 'acc-win'
			}, {
				name : 'Grid Window',
				iconCls : 'icon-grid',
				module : 'grid-win'
			} ],
			trayItems : [ {
				xtype : 'trayclock',
				flex : 1
			} ]
		});
	},

	/**
	 * 系统登出
	 */
	onLogout : function() {
		Ext.MessageBox.show({
			title : Desktop.logoutTitle,
			msg : Desktop.logoutContext,
			buttons : Ext.MessageBox.YESNO,
			icon : Ext.MessageBox.QUESTION,
			buttonText : {
				yes : Desktop.logoutTitle,
				no : Desktop.logoutCancel
			},
			fn : function(btn) {
				if (btn == 'yes') {
					App.Logout();
				}
			}
		});

	},

	/**
	 * 系统设置
	 */
	onSettings : function() {
		var dlg = new MyDesktop.Settings({
			desktop : this.desktop
		});
		dlg.show();
	}
});
