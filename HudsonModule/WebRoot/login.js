Ext.define('LoginSystem', {

	extend : 'Ext.container.Container',

	layout : {
		type : 'absolute'
	},
	bodyPadding : 10,

	initComponent : function() {
		var me = this;
		Ext.apply(me, {

			items : [ {
				xtype : 'textfield',
				x : 0,
				y : 10,
				hideLabel : false,
				emptyText : Login.userName,
				id : 'user_name',
				labelWidth : 50,
				value : Cookies.getCookie("username")
			}, {
				xtype : 'textfield',
				x : 0,
				y : 50,
				hideLabel : false,
				emptyText : Login.userPwd,
				labelWidth : 50,
				id : 'user_pwd',
				inputType : 'password'
			}, {
				xtype : 'combobox',
				x : 2,
				y : 90,
				width : 100,
				// fieldLabel : Login.lang,
				hideLabel : false,
				displayField : 'name',
				store : Ext.create('Ext.data.Store', {
					storeId : 'processer-store',
					fields : [ {
						type : 'string',
						name : 'name'
					}, {
						type : 'string',
						name : 'locale'
					} ],

					data : [ {
						name : '简体中文',
						locale : 'CN'

					}, {
						name : '繁體中文',
						locale : 'TW'
					} ]
				}),
				value : Cookies.getCookie('lang') == 'TW' ? '繁体中文' : localLang == 'TW' ? '繁體中文' : '简体中文',
				editable : false,
				queryMode : 'local',
				typeAhead : true,
				listeners : {
					select : function(combo, records, eOpts) {
						// 标签切换时，保存相应兄弟厂的PODID

						Cookies.setCookie("lang", records[0].data.locale, 23);
						window.location.reload();
					}
				},

				labelWidth : 52
			}, {
				xtype : 'button',
				x : 2,
				y : 130,
				width : 60,
				text : Login.signIn,
				handler : me.onClickLogin()
			} ]

		});

		me.callParent(arguments);
	},

	onClickLogin : function() {
		Ext.Ajax.request({
			url : 'page.php',
			params : {
				username : Ext.getCmp('user_name').getValue(),
				password : Ext.getCmp('user_pwd').getValue()
			},
			success : function(response) {

			}
		});

		var username = Ext.getCmp('user_name').getValue(), pwd = Ext.getCmp('user_pwd').getValue();// 1006008745004

		if (username == "1" && pwd == "1") {
			Cookies.setCookie("username", username, 15);

			document.body.innerHTML = '';
			// var myDesktopApp = new MyDesktop.App();
		} else {
			document.getElementById('login-error').style.visibility = 'visible';
		}

	}
});
