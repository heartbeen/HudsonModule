/**
 * 公告板
 * 
 * @class Ext.app.Portlet
 * @extends Ext.panel.Panel A {@link Ext.panel.Panel Panel} class that is
 *          managed by {@link Portlet.PortalPanel}.
 */
Ext.define('Portlet.Portlet', {
	extend : 'Ext.panel.Panel',
	alias : 'widget.portlet',
	layout : 'fit',
	anchor : '100%',
	bodyPadding : 5,
	closable : true,
	collapsible : true,
	animCollapse : true,
	bodyStyle : 'background-color:#dfe8f6',
	draggable : {
		moveOnDrag : false
	},
	cls : 'x-portlet',
	toolRegex : /refresh|search/,

	initComponent : function() {
		var me = this;

		Ext.applyIf(me, {

			tools : [ {
				type : 'refresh',
				scope : me,
				tooltip : '刷新数据',
				iconCls : 'arrow_refresh-16',
				handler : me.refresh
			}, {
				type : 'search',
				scope : me,
				tooltip : '查找...',
				iconCls : 'find-16',
				handler : me.search
			}, {
				type : 'maximize',
				scope : me,
				tooltip : '最大化显示',
				handler : me.maximize
			} ],

			listeners : {
				close : me.portletClose,
				render : me.renderHeader
			}
		});

		me.callParent(arguments);
	},
	renderHeader : function(panel, eOpts) {
		panel.getHeader().on('dblclick', panel.maximize, panel);
	},

	doClose : function() {
		if (!this.closing) {
			this.closing = true;
			this.el.animate({
				opacity : 0,
				callback : function() {
					var closeAction = this.closeAction;
					this.closing = false;
					this.fireEvent('close', this);
					this[closeAction]();
					if (closeAction == 'hide') {
						this.el.setOpacity(1);
					}
				},
				scope : this
			});

		}
	},

	refresh : function(e, target, header, tool) {
		var portlet = this;
		try {
			var dataPanel = portlet.getComponent(0);
			dataPanel.refreshHandler(e, dataPanel, target, header, tool);
		} catch (e) {
			console.error(e);
		}

	},

	search : function(e, target, header, tool) {
		var portlet = this;
		try {
			var dataPanel = portlet.getComponent(0);
			dataPanel.searchHandler(e, dataPanel, target, header, tool);
		} catch (e) {
			console.error(e);
		}

	},

	/**
	 * 最大化显示时将当前面板显示到tabpanel上
	 */
	maximize : function(e, target, header, tool) {
		var portlet = this;
		var tab = Ext.getCmp('module-project-tabpanel');
		var portletHeader = header || portlet.getHeader();

		var tools = portletHeader.getTools();
		var toolItems = [];

		// 将标题栏的工具转化成最大化显示的工具栏
		for ( var i in tools) {
			if (portlet.toolRegex.test(tools[i].type)) {
				toolItems.push({
					iconCls : tools[i].iconCls,
					handler : tools[i].handler,
					scope : portlet,
					tooltip : tools[i].tooltip
				});
			}
		}

		portlet.addDocked([ {
			xtype : 'toolbar',
			items : toolItems
		} ]);

		tab.add(portlet);
		tab.setActiveTab(portlet);

		try {// 最大化时将公告板菜单项失效
			Ext.getCmp('menuitme-' + portlet.id).setDisabled(true);

			var dataPanel = portlet.getComponent(0);
			dataPanel.maximizeHandler(e, dataPanel, target, header, tool);
		} catch (e) {
			// console.error(e);
		}
		return;
	},

	/**
	 * 从tabpanel关闭时,就将面板重新显示到公告板上
	 */
	portletClose : function(panel) {

		// 当前面板处在公告板中关闭时,就不住下执行
		if (panel.up('portalpanel')) {
			try {
				Ext.getCmp('menuitme-' + panel.id).setChecked(false);
			} catch (e) {
				console.error(e);
			}
			return;
		}

		try {
			Ext.getCmp(panel.parentId).add(Ext.create('Portlet.Portlet', {
				title : panel.getHeader().title,
				parentId : panel.parentId,
				iconCls : panel.iconCls,
				id : panel.id,
				items : [ Ext.create(panel.getComponent(0).getName()) ]
			}));

			// 关闭后将公告板相应菜单项有效
			Ext.getCmp('menuitme-' + panel.id).setDisabled(false);

		} catch (e) {
			console.log(e.message);
			console.error(e);
			twt = e;
			Ext.MessageBox.show({
				title : '错误',
				msg : '公告显示错误,请通知管理员!',
				buttons : Ext.MessageBox.OK,
				icon : Ext.MessageBox.ERROR
			});
		}

	}

});