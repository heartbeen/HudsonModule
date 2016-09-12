/**
 * 模具加工模块
 */
Ext.define('Module.ModuleProject', {
	extend : 'Ext.ux.desktop.Module',

	requires : [ 'Ext.tab.Panel', 'Portlet.PortalPanel', 'Module.portlet.ModulePortalPanel' ],

	id : 'module-project-win',
	tabpanelId : 'module-project-tabpanel',
	moduleId : 1,
	moduleName : 'module',// 模具模块名称
	/** 公告板显示结构 */
	portletStruc : [ {
		id : 'moduleportalpanel-left',
		children : [ {
			title : '模具加工进度',
			name : 'Module.portlet.MoldueProcessGrid',
			iconCls : 'brick-16',
			show : true,
			sizable : true
		}
		// ,
		// {
		// title : '加工单位工件量',
		// name : 'Module.portlet.ModuleProcessWorkload',
		// iconCls : 'chart_bar-16',
		// show : true
		// },
		// {
		// title : '工件加工动态信息',
		// name : 'Module.portlet.ProcessDynamicPortlet',
		// iconCls : 'chart_curve-16',
		// show : true
		// }
		]
	}
	// , {
	// id : 'moduleportalpanel-right',
	// children : [ {
	// title : '工件加工提醒',
	// name : 'Module.portlet.ModuleProcessWarnPortlet',
	// iconCls : 'clock_red-16',
	// show : true
	// }, {
	// title : '机台负荷',
	// region : 'center',
	// name : 'Module.portlet.ModuleMachineOperationRate',
	// iconCls : 'hourglass-16',
	// show : true
	// } ]
	// }
	],

	init : function() {
		this.launcher = {
			text : 'Tab Window',
			iconCls : this.id
		};
	},

	createWindow : function() {
		var me = this;
		var desktop = this.app.getDesktop();
		var win = desktop.getWindow(me.id);
		if (!win) {
			var portletMenuItems = [];// 公告板菜单项
			var portletItems = [];// 公告板

			var ps = me.portletStruc;

			// 生成公告板:portletStruc
			for ( var i in ps) {
				var childItems = [];
				for ( var s in ps[i].children) {
					var randomId = hex_md5(new Date().getTime() + "");

					if (ps[i].children[s].show) {
						childItems.push({
							title : ps[i].children[s].title,
							iconCls : ps[i].children[s].iconCls,
							id : randomId,
							parentId : ps[i].id,
							items : [ Ext.create(ps[i].children[s].name) ]
						});
					}

					portletMenuItems.push({
						id : 'menuitme-' + randomId,// 菜单ID由公告板ID+'-menuitme'组成
						checked : ps[i].children[s].show,
						text : ps[i].children[s].title,
						iconCls : ps[i].children[s].iconCls,
						parentId : ps[i].id,
						portletName : ps[i].children[s].name,
						checkHandler : me.portletShow
					});
				}

				if (i != ps.length - 1) {
					portletMenuItems.push('-');
				}

				portletItems.push({
					id : ps[i].id,
					items : childItems
				});
			}

			win = desktop.createWindow({
				id : me.id,
				tabpanelId : me.tabpanelId,
				title : '模具系统(HMMS)',
				maximized : true,
				// 此处加上此句的意思就是禁止ESC键
				onEsc : Ext.emptyFn,
				iconCls : 'app-set-16',
				layout : 'border',

				dockedItems : [ {
					xtype : 'toolbar',
					items : [ {  
						xtype : 'buttongroup',
						bodyPadding : 5,
						items : me.initProjectItem(me.onMainFunction)
					}, '->', {
						height : 75,
						width : 20,
						menu : Ext.create("Ext.menu.Menu", {
							items : portletMenuItems
						})
					} ]
				} ],

				items : [ {
					xtype : 'panel',
					region : 'west',
					width : 170,
					title : '功能导航',
					layout : 'border',
					collapsed : false,
					collapsible : true,
					split : true,
					items : [ {
						xtype : 'dataview',
						autoScroll : true,
						region : 'center',
						store : Ext.create('Ext.data.Store', {
							autoLoad : true,
							storeId : 'module-subitem-dataview-id',
							fields : [ "id", "text", "name", "iconcls", "leaf" ],

							proxy : {
								type : 'memory',
							}
						}),

						itemSelector : 'div.module-subitemlist',
						cls : 'module-sub-view',
						overItemCls : 'module-subitemlist-hover',
						itemTpl : me.itemTpl,
						listeners : {
							itemclick : App.itemClick
						}
					} ]
				}, {
					xtype : 'tabpanel',
					id : me.tabpanelId,
					region : 'center',
					activeTab : 0,
					items : [ {
						xtype : 'moduleportalpanel',
						title : '首页',
						iconCls : 'house-16',
						items : portletItems

					} ]
				} ]
			});
		}
		return win;
	},

	/**
	 * 显示公告板
	 */
	portletShow : function(item) {

		var parentPanel = Ext.getCmp(item.parentId);
		var portletId = item.id.replace('menuitme-', '');
		// 不显示当前公告板
		if (!item.checked) {
			// 公告板在任何一列都可以进行删除
			var up = Ext.getCmp(portletId).up('portalcolumn');
			up.remove(portletId);
			return;
		}

		try {
			parentPanel.add(Ext.create('Portlet.Portlet', {
				iconCls : item.iconCls,
				title : item.text,
				id : portletId,
				parentId : item.parentId,
				items : [ Ext.create(item.portletName) ]
			}));
		} catch (e) {
			console.error(e);
			Ext.MessageBox.show({
				title : '错误',
				msg : '公告显示错误,请通知管理员!',
				buttons : Ext.MessageBox.OK,
				icon : Ext.MessageBox.ERROR
			});
		}
	},
	onMainFunction : function() {
		Ext.getStore('module-subitem-dataview-id').loadData(this.children);
	}
});