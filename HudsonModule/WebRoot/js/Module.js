Ext.define('Ext.ux.desktop.Module',
		{
			mixins : {
				observable : 'Ext.util.Observable'
			},

			moduleName : '',// 模块名称

			itemTpl : [ ' <div class="module-subitemlist">', '<span class="{iconcls}">&nbsp;</span>', '<div class="send-bus-reason">{text}</div>',
					'</div> ' ],

			constructor : function(config) {
				this.mixins.observable.constructor.call(this, config);
				this.init();
			},

			init : Ext.emptyFn,

			/**
			 * 初始模块功能
			 */
			initProjectItem : function(projectFunction) {
				var me = this;
				var projectItems = new Array();

				if (!this.moduleName) {
					Fly.msg('信息', '没有组模具命名,属性为:moduleName');
				}
				// var u = App.Base64Parse(Cookies.getCookie("u_n"));
				// var n = "n" + Cookies.getCookie("u_n");
				/** 取消模块缓存功能 --------------------------------------- */
				// 每个用户都有模块缓存
				// var moduleItmeName = hex_md5(me.moduleName + u);
				// var newAuth = Cookies.getCookie(n);// 得到新授权模块字符串
				// projectStorage = App.localStorageParse(moduleItmeName);
				// if (!projectStorage || newAuth.indexOf(me.moduleName) >= 0) {
				Ext.Ajax.request({
					url : 'public/moduleProject',
					params : {
						projectId : me.moduleId
					},
					async : false,
					success : function(response) {
						// 读出功能模块
						var projectStorage = Ext.JSON.decode(response.responseText);

						for ( var i in projectStorage.subproject) {

							projectItems.push(Ext.create('Ext.button.Button', {
								text : '<span class="project-child-item">' + projectStorage.subproject[i].name + '</span>',
								pressed : false,
								toggleGroup : 'project-item-group-' + me.moduleId,
								allowDepress : false,
								iconCls : projectStorage.subproject[i].iconcls,
								scale : 'large',
								iconAlign : 'top',
								margins : '0 3 0 0',
								width : 80,
								height : 60,
								children : projectStorage.subproject[i].children,
								handler : projectFunction
							}));
						}

						// if (newAuth.indexOf(me.moduleName) >= 0) {
						// 读取新授权后删除已授权模块
						// Cookies.setCookie(n, newAuth.replace(me.moduleName,
						// ""), 365);
						// }
						// 缓存模块数据
						// App.localStorageStringify(moduleItmeName,
						// response.responseText);
					}
				});
				// }

				return projectItems;

			}
		});
