/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

/**
 * @class Ext.ux.desktop.Desktop
 * @extends Ext.panel.Panel
 *          <p>
 *          This class manages the wallpaper, shortcuts and taskbar.
 *          </p>
 */
Ext.define('Ext.ux.desktop.Desktop', {
	extend : 'Ext.panel.Panel',

	alias : 'widget.desktop',

	uses : [ 'Ext.util.MixedCollection', 'Ext.menu.Menu', 'Ext.view.View', // dataview
	'Ext.window.Window',

	'Ext.ux.desktop.TaskBar', 'Ext.ux.desktop.Wallpaper' ],

	activeWindowCls : 'ux-desktop-active-win',
	inactiveWindowCls : 'ux-desktop-inactive-win',
	lastActiveWindow : null,

	border : false,
	html : '&#160;',
	layout : 'fit',

	xTickSize : 1,
	yTickSize : 1,

	app : null,

	/**
	 * @cfg {Array|Store} shortcuts The items to add to the DataView. This can
	 *      be a {@link Ext.data.Store Store} or a simple array. Items should
	 *      minimally provide the fields in the
	 *      {@link Ext.ux.desktop.ShorcutModel ShortcutModel}.
	 */
	shortcuts : null,

	/**
	 * @cfg {String} shortcutItemSelector This property is passed to the
	 *      DataView for the desktop to select shortcut items. If the
	 *      {@link #shortcutTpl} is modified, this will probably need to be
	 *      modified as well.
	 */
	shortcutItemSelector : 'div.ux-desktop-shortcut',

	/**
	 * 用于创建桌面图标
	 * 
	 * @cfg {String} shortcutTpl This XTemplate is used to render items in the
	 *      DataView. If this is changed, the {@link shortcutItemSelect} will
	 *      probably also need to changed.
	 */
	shortcutTpl : [ '<tpl for=".">', '<div class="ux-desktop-shortcut" id="{name}-shortcut">', '<div class="ux-desktop-shortcut-icon {iconCls}">',
			'<img src="', Ext.BLANK_IMAGE_URL, '" title="{name}">', '</div>', '<span class="ux-desktop-shortcut-text">{name}</span>', '</div>',
			'</tpl>', '<div class="x-clear"></div>' ],

	/**
	 * @cfg {Object} taskbarConfig The config object for the TaskBar.
	 */
	taskbarConfig : null,

	windowMenu : null,

	/**
	 * 初始化桌面
	 */
	initComponent : function() {
		var me = this;

		me.windowMenu = new Ext.menu.Menu(me.createWindowMenu());

		me.bbar = me.taskbar = new Ext.ux.desktop.TaskBar(me.taskbarConfig);
		me.taskbar.windowMenu = me.windowMenu;

		me.windows = new Ext.util.MixedCollection();

		me.contextMenu = new Ext.menu.Menu(me.createDesktopMenu());

		me.items = [ {
			xtype : 'wallpaper',
			id : me.id + '_wallpaper'
		}, me.createDataView() ];

		me.callParent();

		me.shortcutsView = me.items.getAt(1);
		// 图标双击
		me.shortcutsView.on('itemdblclick', me.onShortcutItemClick, me);

		var wallpaper = me.wallpaper;
		me.wallpaper = me.items.getAt(0);
		if (wallpaper) {
			// 将系统设置的墙纸默认为拉伸状态 [Rock 15/08/26]
			me.setWallpaper(wallpaper, true);
			// me.setWallpaper(wallpaper, me.wallpaperStretch);
		}
	},

	afterRender : function() {
		var me = this;
		me.callParent();
		me.el.on('contextmenu', me.onDesktopMenu, me);
	},

	// ------------------------------------------------------
	// Overrideable configuration creation methods

	/**
	 * 生成桌面图标视图
	 */
	createDataView : function() {
		var me = this;
		return {
			xtype : 'dataview',
			overItemCls : 'x-view-over',
			trackOver : true,
			itemSelector : me.shortcutItemSelector,
			store : me.shortcuts,
			style : {
				position : 'absolute'
			},
			x : 0,
			y : 0,
			tpl : new Ext.XTemplate(me.shortcutTpl)
		};
	},

	createDesktopMenu : function() {
		var me = this, ret = {
			items : me.contextMenuItems || []
		};

		if (ret.items.length) {
			ret.items.push('-');
		}

		ret.items.push({
			text : 'Tile',
			handler : me.tileWindows,
			scope : me,
			minWindows : 1
		}, {
			text : 'Cascade',
			handler : me.cascadeWindows,
			scope : me,
			minWindows : 1
		});

		return ret;
	},

	/**
	 * 窗口菜单
	 * 
	 * @returns {___anonymous3708_4228}
	 */
	createWindowMenu : function() {
		var me = this;
		return {
			defaultAlign : 'br-tr',
			items : [ {
				text : Desktop.restore,
				handler : me.onWindowMenuRestore,
				scope : me
			}, {
				text : Desktop.minimize,
				handler : me.onWindowMenuMinimize,
				scope : me
			}, {
				text : Desktop.maximize,
				handler : me.onWindowMenuMaximize,
				scope : me
			}, '-', {
				text : Desktop.close,
				handler : me.onWindowMenuClose,
				scope : me,
				iconCls : 'process-stop-16'
			} ],
			listeners : {
				beforeshow : me.onWindowMenuBeforeShow,
				hide : me.onWindowMenuHide,
				scope : me
			}
		};
	},

	// ------------------------------------------------------
	// Event handler methods

	onDesktopMenu : function(e) {
		var me = this, menu = me.contextMenu;
		e.stopEvent();
		if (!menu.rendered) {
			menu.on('beforeshow', me.onDesktopMenuBeforeShow, me);
		}
		menu.showAt(e.getXY());
		menu.doConstrain();
	},

	onDesktopMenuBeforeShow : function(menu) {
		var me = this, count = me.windows.getCount();

		menu.items.each(function(item) {
			var min = item.minWindows || 0;
			item.setDisabled(count < min);
		});
	},

	/**
	 * 图标双击方法
	 * 
	 * @param dataView
	 * @param record
	 */
	onShortcutItemClick : function(dataView, record) {
		var me = this;
		var md = record.data.module.split(';');
		var module = me.app.getModule(md[0]);

		var win = module && module.createWindow();
		win.moduleId = md[1];// 模块ID
		if (win) {
			me.restoreWindow(win);
		}

	},

	/**
	 * 窗口关闭
	 * 
	 * @param win
	 */
	onWindowClose : function(win) {
		var me = this;
		me.windows.remove(win);
		me.taskbar.removeTaskButton(win.taskButton);
		me.updateActiveWindow();
		ContainerId = document.getElementsByClassName('x-body')[0];
	},

	// ------------------------------------------------------
	// Window context menu handlers

	onWindowMenuBeforeShow : function(menu) {
		var items = menu.items.items, win = menu.theWin;
		items[0].setDisabled(win.maximized !== true && win.hidden !== true); // Restore
		items[1].setDisabled(win.minimized === true); // Minimize
		items[2].setDisabled(win.maximized === true || win.hidden === true); // Maximize
	},

	onWindowMenuClose : function() {
		var me = this, win = me.windowMenu.theWin;
		win.close();
	},

	onWindowMenuHide : function(menu) {
		menu.theWin = null;
	},

	onWindowMenuMaximize : function() {
		var me = this, win = me.windowMenu.theWin;

		win.maximize();
		win.toFront();
	},

	onWindowMenuMinimize : function() {
		var me = this, win = me.windowMenu.theWin;

		win.minimize();
	},

	onWindowMenuRestore : function() {
		var me = this, win = me.windowMenu.theWin;

		me.restoreWindow(win);
	},
	// ------------------------------------------------------
	// Dynamic (re)configuration methods

	getWallpaper : function() {
		return this.wallpaper.wallpaper;
	},

	setTickSize : function(xTickSize, yTickSize) {
		var me = this, xt = me.xTickSize = xTickSize, yt = me.yTickSize = (arguments.length > 1) ? yTickSize : xt;

		me.windows.each(function(win) {
			var dd = win.dd, resizer = win.resizer;
			dd.xTickSize = xt;
			dd.yTickSize = yt;
			resizer.widthIncrement = xt;
			resizer.heightIncrement = yt;
		});
	},

	setWallpaper : function(wallpaper, stretch) {
		this.wallpaper.setWallpaper(wallpaper, stretch);
		return this;
	},

	// ------------------------------------------------------
	// Window management methods

	cascadeWindows : function() {
		var x = 0, y = 0, zmgr = this.getDesktopZIndexManager();

		zmgr.eachBottomUp(function(win) {
			if (win.isWindow && win.isVisible() && !win.maximized) {
				win.setPosition(x, y);
				x += 20;
				y += 20;
			}
		});
	},

	/**
	 * 运行程序
	 * 
	 * @param config
	 * @param cls
	 * @returns {___win3}
	 */
	createWindow : function(config, cls) {
		var me = this, win;
		cls = cls || Ext.window.Window;
		win = me.add(new cls(Ext.applyIf(config || {}, {
			minimizable : true,
			// maximizable : true,
			listeners : {
				destroy : me.onWindowClose,
				activate : me.updateActiveWindow,
				beforeshow : me.updateActiveWindow,
				deactivate : me.updateActiveWindow,
				minimize : me.minimizeWindow,
				scope : me
			}
		})));

		me.windows.add(win.id, win);

		win.taskButton = me.taskbar.addTaskButton(win);
		win.animateTarget = win.taskButton.el;

		win.on({
			boxready : function() {
				win.dd.xTickSize = me.xTickSize;
				win.dd.yTickSize = me.yTickSize;

				if (win.resizer) {
					win.resizer.widthIncrement = me.xTickSize;
					win.resizer.heightIncrement = me.yTickSize;
				}
			},
			single : true
		});

		// replace normal window close w/fadeOut animation:
		win.doClose = function() {
			win.doClose = Ext.emptyFn; // dblclick can call again...
			win.el.disableShadow();
			win.el.fadeOut({
				listeners : {
					afteranimate : function() {
						win.destroy();
					}
				}
			});
		};
		return win;
	},

	getActiveWindow : function() {
		var win = null, zmgr = this.getDesktopZIndexManager();

		if (zmgr) {
			// We cannot rely on activate/deactive because that fires against
			// non-Window
			// components in the stack.

			zmgr.eachTopDown(function(comp) {
				if (comp.isWindow && !comp.hidden) {
					win = comp;
					return false;
				}
				return true;
			});
		}

		return win;
	},

	getDesktopZIndexManager : function() {
		var windows = this.windows;
		// TODO - there has to be a better way to get this...
		return (windows.getCount() && windows.getAt(0).zIndexManager) || null;
	},

	/**
	 * 得到一个功能窗口
	 * 
	 * @param id
	 * @returns
	 */
	getWindow : function(id) {
		return this.windows.get(id);
	},

	minimizeWindow : function(win) {
		win.minimized = true;
		win.hide();
		ContainerId = document.getElementsByClassName('x-body')[0];
	},

	/**
	 * 功能窗口显示方法
	 * 
	 * @param win
	 * @returns
	 */
	restoreWindow : function(win) {
		if (win.isVisible()) {
			win.restore();
			win.toFront();
		} else {
			win.show();
		}
		return win;
	},

	tileWindows : function() {
		var me = this, availWidth = me.body.getWidth(true);
		var x = me.xTickSize, y = me.yTickSize, nextY = y;

		me.windows.each(function(win) {
			if (win.isVisible() && !win.maximized) {
				var w = win.el.getWidth();

				// Wrap to next row if we are not at the line start and this
				// Window will
				// go off the end
				if (x > me.xTickSize && x + w > availWidth) {
					x = me.xTickSize;
					y = nextY;
				}

				win.setPosition(x, y);
				x += w + me.xTickSize;
				nextY = Math.max(nextY, y + win.el.getHeight() + me.yTickSize);
			}
		});
	},

	updateActiveWindow : function() {
		var me = this, activeWindow = me.getActiveWindow(), last = me.lastActiveWindow;

		// 得到弹出框所在显示在哪个窗口上
		ContainerId = me.id;

		if (activeWindow === last) {
			return;
		}

		if (last) {
			if (last.el.dom) {
				last.addCls(me.inactiveWindowCls);
				last.removeCls(me.activeWindowCls);
			}
			last.active = false;
		}

		me.lastActiveWindow = activeWindow;

		if (activeWindow) {
			activeWindow.addCls(me.activeWindowCls);
			activeWindow.removeCls(me.inactiveWindowCls);
			activeWindow.minimized = false;
			activeWindow.active = true;
		}

		me.taskbar.setActiveButton(activeWindow && activeWindow.taskButton);

	}
});
