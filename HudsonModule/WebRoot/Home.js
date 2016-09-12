//Ext.onReady(Fly.init, Ext.Fly);
Ext.onReady(function() {

	Ext.define('LoginSystem', {
		extend : 'Ext.container.Container',

		layout : 'anchor',
		bodyPadding : 5,

		initComponent : function() {
			var me = this;
			Ext.apply(me, {

				items : [ {
					xtype : 'combobox',
					width : 150,
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
					xtype : 'textfield',
					maxLength : 20,
					hideLabel : false,
					emptyText : Login.userName,
					id : 'user_name',
					labelWidth : 50,
					value : App.Base64Parse(Cookies.getCookie("u_n"))
				}, {
					xtype : 'textfield',
					maxLength : 18,
					hideLabel : false,
					emptyText : Login.userPwd,
					labelWidth : 50,
					id : 'user_pwd',
					inputType : 'password',
					listeners : {
						specialkey : function(text, e, eOpts) {
							if (e.getKey() == e.ENTER) {
								me.onClickLogin(me);
							}
						}
					}
				}, {
					xtype : 'button',
					iconCls : 'user_go-16',
					width : 60,
					text : Login.signIn,
					scope : me,
					handler : me.onClickLogin
				} ]

			});

			me.callParent(arguments);
		},

		onClickLogin : function() {
			var me = this;

			var username = Ext.getCmp('user_name').getValue();
			var password = Ext.getCmp('user_pwd').getValue();

			// var modulesItmeName = hex_md5("modules" + username);
			/** 取消模块缓存功能 --------------------------------------- */
			// 系统模块
			// DesktopItem = App.localStorageParse(modulesItmeName);
			Ext.Ajax.request({
				url : 'login',
				params : {
					userName : username,
					password : hex_md5(password).toUpperCase(),
					localdata : false
				// DesktopItem ? true :

				// 本地没有用户角色与权根资料是从数据库读取
				},
				success : function(response) {

					// 匹配所有的匹配图标路径地址
					var regex = /iconcls/g;
					// 设置程序的图标地址
					var res = Ext.JSON.decode(response.responseText.replace(regex, "iconCls"));
					try {
						if (res.success) {
							username = App.Base64Stringify(username);
							Cookies.setCookie("u_n", username, 365);
							DesktopItem = res.modules;
							// 有新的授权
							// if (res.newauth) {
							// DesktopItem = res.modules;
							// App.localStorageStringify(modulesItmeName,
							// res.modules);
							// Cookies.setCookie("n" + username, res.newauth,
							// 365);// 保存新授权标记
							// } else {
							// 本地没有模块缓存
							// if (!DesktopItem) {
							// DesktopItem = res.modules;
							// App.localStorageStringify(modulesItmeName,
							// res.modules);
							// }
							// }

							me.loadAuthJavascript(DesktopItem);
						} else {
							me.loginToptip(res.msg);
							App.setValue('user_pwd', '');
						}
					} catch (e) {
						me.loginToptip("登录失败!");
					}
				},
				failure : function(response, opts) {
					me.loginToptip("服务器错误,登录失败!");
				}
			});

		},

		/**
		 * 导入用户所有的功能文件
		 */
		loadAuthJavascript : function(modules) {
			var self = this;

			var pathLoad = {
				'Ext.ux.desktop' : 'js',
				MyDesktop : '',
				'Share' : 'js/shared',
				'Module.portlet' : 'js/module/portlet',
				'Module.sublevel' : 'js/module/sublevel',
				'Portlet' : 'js/portlet',
				'Project.component' : 'js/component'
			};

			for ( var i in modules) {
				pathLoad[modules[i].modulename] = modules[i].mpath;
				// 读取模块定义名称
				UserWork.push(modules[i].moduledefine);
			}

			// 用于动态导入用户权限所需要的javascript 文件
			Ext.Loader.setPath(pathLoad);
			Ext.require('MyDesktop.App');

			// 所有功能文件导入完成后进行介面
			Ext.onReady(function() {
				document.body.innerHTML = '';
				new MyDesktop.App();
				StartTime = new Date();// 记录登陆时间
				// 10分钟执行一次握手协议
				setInterval(self.handShake, 600 * 1000);
			});
		},

		loginToptip : function(info) {
			document.getElementById('login-error').innerText = info;
			document.getElementById('login-error').style.visibility = 'visible';
		},
		handShake : function() {
			Ext.Ajax.request({
				url : 'public/handShake',
				success : function(resp) {
					var backJson = Ext.JSON.decode(resp.responseText);
					console.info(backJson);
					if (!backJson.success) {
						window.location = '';
					}
				}
			});
		}

	});

	var login = new LoginSystem();
	login.render('login-region');
});
