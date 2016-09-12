OnlineTime = 86400000;// 最长等待响应时间 默认1440分钟

CraftItem = undefined;// 模具加工工艺菜单项
// ModulePartPlan.js,ModulePartPlanGantt.js,CustomFlowplanWindow.js

PredictCraftMenu = undefined;// 预设工艺集合菜单项 ModulePartPlan.js文件引用

FactoryName = "谷崧";
FactoryWebSite = "http://www.coxon.com.tw";

// 是否加入了dom paste 事件
isAddPricturePasteListener = false;

Cookies = {};

/**
 * 将DATAGRID的单元格列字符加粗
 */
function RenderFontBold(val) {
	return val ? '<b>' + val + '</b>' : val;
}

var dateRegx = /([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})-(((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01]))|((0[469]|11)-(0[1-9]|[12][0-9]|30))|(02-(0[1-9]|[1][0-9]|2[0-8])))/;

if (localStorage) {
	localStorage.removeItem('project');
}

BarcodeType = [ "128A", "128B", "128C", "128Auto", "EAN8", "EAN13", "EAN128A", "EAN128B", "EAN128C", "Code39", "39Extended", "2_5interleaved",
		"2_5industrial", "2_5matrix", "UPC_A", "UPC_E0", "UPC_E1", "UPCsupp2", "UPCsupp5", "Code93", "93Extended", "MSI", "Codaba", "QRCode",
		"PDF417" ];

printObject = '<object id="objectId" style="z-index:-9999;" classid="clsid:2105C259-1E0C-4534-8141-A753534CB4CA" width="100%" height="100%"> '
		+ ' <param name="Color" value="#6CA6CD">'
		+ '<embed id="embedId" type="application/x-print-lodop" width="100%"  height="100%" pluginspage="install_lodop.exe"></embed>'
		+ '</object> <div id="barcode-panel" ></div>';

/**
 * 定义工件加工排程模型
 */
Ext.define('ModulePartScheduleModel', {
	extend : 'Gnt.model.Task',
	clsField : 'TaskType',
	fields : [ {
		name : 'TaskType',
		type : 'string'
	}, {
		name : 'Color',
		type : 'string'
	}, {
		name : 'craftId',
		type : 'string'
	}, {
		name : 'evaluate',
		type : 'double'
	}, {
		name : 'typeid',
		type : 'int'
	} ]
});

Cookies.setCookie = function(c_name, value, expiredays) {
	var exdate = new Date();
	exdate.setDate(exdate.getDate() + expiredays);
	document.cookie = c_name + "=" + escape(value) + ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString());
};

Cookies.getCookie = function(c_name) {
	if (document.cookie.length > 0) {
		c_start = document.cookie.indexOf(c_name + "=");
		if (c_start != -1) {
			c_start = c_start + c_name.length + 1;
			c_end = document.cookie.indexOf(";", c_start);
			if (c_end == -1)
				c_end = document.cookie.length;
			return unescape(document.cookie.substring(c_start, c_end));
		}
	}
	return "";
};

Cookies.clear = function(name) {
	if (Cookies.getCookie(name)) {
		document.cookie = name + "=" + "; expires=Thu, 01-Jan-70 00:00:01 GMT";
	}
};

App = {};
App.intRegex = /^[1-9]\d*$/;

// 工艺全加工标识号
App.doAll = '11215';

App.createElements = function(tag) {
	return document.createElement(tag);
};

App.appendElement = function(parentTagName, childElement) {
	var parent = document.getElementsByTagName(parentTagName);
	parent[0].appendChild(childElement);
};

App.Logout = function() {
	window.location.href = 'logout';
};

// 初始化
ContainerId = document.getElementsByClassName('x-body')[0];

/**
 * 信息弹出框
 */
Fly = function() {
	var msgCt;

	function createBox(t, s) {
		// t = '系统提示:';
		// s = '由于您长时间没有登陆系统,所以需要重新登陆!';
		// return [ '<div class="msg">', '<div class="x-box-tl"><div
		// class="x-box-tr"><div class="x-box-tc"></div></div></div>',
		// '<div class="x-box-ml"><div class="x-box-mr"><div
		// class="x-box-mc"><h3>', t, '</h3>', s, '</div></div></div>',
		// '<div class="x-box-bl"><div class="x-box-br"><div
		// class="x-box-bc"></div></div></div>', '</div>' ].join('');
		return '<div class="msg"><h3>' + t + '</h3><p>' + s + '</p></div>';
	}
	return {
		msg : function(title, format) {

			// ContainerId 表示为当前活动的容器
			if (ContainerId) {
				msgCt = Ext.DomHelper.insertFirst(ContainerId, {
					id : 'msg-div'
				}, true);
			} else {
				msgCt = Ext.DomHelper.insertFirst(document.body, {
					id : 'msg-div'
				}, true);
			}

			var s = Ext.String.format.apply(String, Array.prototype.slice.call(arguments, 1));
			var m = Ext.DomHelper.append(msgCt, createBox(title, s), true);
			m.hide();
			m.slideIn('t').ghost("t", {
				delay : 3000,
				remove : true
			});
		},

		init : function() {
			if (!msgCt) {
				// It's better to create the msg-div here in order to avoid
				// re-layouts
				// later that could interfere with the HtmlEditor and reset its
				// iFrame.
				// msgCt = Ext.DomHelper.insertFirst('desktop-1052-body', {
				// id : 'msg-div'
				// }, true);
			}

		}
	};
}();
/**
 * 拦截器判断
 */
App.InterPath = function(resp, func) {
	var res = resp.responseText ? JSON.parse(resp.responseText) : resp;
	if (res.auth) {
		// 无权限
		if (res.login) {
			showError(res.msg);
		} else {
			showInfo(res.msg.replace('?', '5'));
			window.setTimeout(function href() {
				App.Logout();
			}, 5000);
		}
	} else {
		if (func) {
			func.call();
		}
	}
};

/**
 * 用于将数值类型靠右显示
 * 
 * @param val
 * @returns
 */
App.changeNumber = function(val) {
	val = Ext.util.Format.number(val, '0,0');
	return '<span style="float:right">' + val + '</span>';

};

/**
 * 对值进行验证,如果值不合法则将值标记为红色
 * 
 * @param value
 * @param regex
 * @returns {String}
 */
App.validationPartcode = function(value) {
	if (!value.match(/[\w\/]{1,9}/)) {
		return "<span style='color:red;'>" + value + "</span>";
	}
};

/**
 * 
 */
App.changeNumberRate = function(val) {
	val = Ext.util.Format.number(val, '00.0%');
	return '<span style="float:right">' + val + '</span>';

};

/**
 * 用于将数值类型靠右显示
 * 
 * @param val
 * @returns
 */
App.changeNumberUnit = function(val) {
	val = Ext.util.Format.number(val, '0,0 pcs');
	return '<span style="float:right">' + val + '</span>';

};

/**
 * 返回当天时间格式：yyyy-MM-dd HH:mi
 */
App.dateFormat = function() {
	var date = new Date();

	return date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes();
};

/**
 * 
 */
App.dateFormat = function(dateFormat) {
	return Ext.util.Format.dateRenderer(dateFormat);
};

/**
 * 返回表格中选中的数据
 */
App.getModel = function(name) {
	var grid = Ext.getCmp(name);

	if (!grid) {
		return null;
	}

	var model = grid.getSelectionModel().getSelection();

	// 提示没有选择外发工件
	if (model.length == 0) {
		Fly.msg('工件加工', "<sapn style='color:red;'>请选择要操作的工件！</span>");
		return;
	}

	return model;
};

/**
 * 返回表格中选中的数据
 */
App.getSelectionModel = function(name) {

	if (typeof name == 'string') {
		return Ext.getCmp(name).getSelectionModel().getSelection();
	}

	if (typeof name == 'object') {
		return name.getSelectionModel().getSelection();
	}

	Fly.msg('数据', "<sapn style='color:red;'>不能得到选择数据!</span>");
};

var State = new Array();
State['I'] = '<span style="color:#468847;font-size:bold;">加工中</span>';
State['W'] = '<span style="color:#B94A48;font-size:bold;">待加工</span>';
State['P'] = '<span style="color:#F89406;font-size:bold;">暂停</span>';
State['F'] = '<span style="color:#3A87AD;font-size:bold;">加工完</span>';
State['S'] = '<span style="color:#333333;font-size:bold;">已错峰</span>';

App.partState = function(state) {
	return State[state];
};

/**
 * 工件进行操作完之后，对操作结果进行判断，对操作成功的工件进行删除
 */
App.responseResult = function(field, text, model, store, t, s, f) {
	if (text == ";") {
		Fly.msg(t, "<sapn style='color:red;'>" + s + "</span>");
	} else {

		// 删除成功签收的工件记录，不成功的不删除
		for ( var i in model) {
			if (text.indexOf(';' + model[i].get(field) + ';') > 0) {
				store.remove(model[i]);
			}
		}
		Fly.msg(t, "<sapn style='color:#0000CD;'>" + f + "</span>");
	}
};

App.durationcolumn = function(day) {
	return day.replace('days', '天');
};

App.percentdonecolumn = function(p) {
	return p + "%";
};

// ------------------------------------------

/**
 * 得到预编号电极面板
 */
App.getMoldpartnoPane = function() {
	return document.getElementById('moldpartno-pane');
};
/**
 * 清除所有选中的部号
 */
App.clearMoldpartno = function() {
	var partPane = App.getMoldpartnoPane();
	partPane.innerHTML = "<div>部号：</div>";
};

/**
 * 删除要拆电极的工件部号
 */
App.onDeleteMoldpartno = function(moldpartno) {
	var partPane = App.getMoldpartnoPane();
	var part = document.getElementsByClassName('moldpartno-' + moldpartno);
	partPane.removeChild(part[0]);
};

/**
 * 增加一个工件部号
 */
App.addMoldPart = function(moldpartno) {
	var partPane = App.getMoldpartnoPane();

	if (App.isMoldpartnoExits(partPane, moldpartno)) {
		Tooltip.msg("电极", "<sapn style='color:red;'>电极部号已增加</span>");
		return;
	}

	// ---创建一个工件部号标签
	var newPartnoDiv = App.createMoldpartnoTag(moldpartno);
	var newPart = App.createCancalButton(moldpartno);

	newPartnoDiv.appendChild(newPart);
	partPane.appendChild(newPartnoDiv);
};

/**
 * 判断部号有无选中
 */
App.isMoldpartnoExits = function(partPane, moldpartno) {
	return partPane.innerText.indexOf(moldpartno) > 0;
};

/**
 * 创建一个部号标签
 */
App.createMoldpartnoTag = function(moldpartno) {
	var newPartnoDiv = document.createElement('span');
	newPartnoDiv.textContent = moldpartno;
	newPartnoDiv.className = "moldpartno-div moldpartno-" + moldpartno;

	return newPartnoDiv;
};

/**
 * 创建一个取消按键
 */
App.createCancalButton = function(moldpartno) {
	var newPart = document.createElement('span');
	newPart.className = 'cancel-moldpartno';
	newPart.textContent = "×";
	newPart.onclick = function onDeleteMoldpartno() {

		var partPane = App.getMoldpartnoPane();
		var part = document.getElementsByClassName('moldpartno-' + moldpartno);
		partPane.removeChild(part[0]);

		// 查找当前电极最大的编号
		Ext.getCmp('ElectrodeRecorder').onGetEleMaxNum();
	};

	return newPart;
};

// -------------------------------------------

/**
 * 清除一表格的所有数据
 */
App.clearGrid = function(obj) {
	if (typeof table === 'string') {
		Ext.getCmp(obj).getStore().removeAll(false);
	}

	if (obj instanceof Object) {

		if (obj instanceof Ext.grid.Panel)
			obj.getStore().removeAll(false);

		if (obj instanceof Ext.data.Store)
			obj.removeAll(false);
	}

};

/**
 * 清除树的所有节点
 */
App.clearStore = function(id) {
	var store = Ext.getStore(id);
	store.getRootNode().removeAll();

};

App.getValue = function(id) {
	return Ext.getCmp(id).getValue();
};

App.getRawValue = function(id) {
	return Ext.getCmp(id).getRawValue();
};

App.setValue = function(id, value) {
	return Ext.getCmp(id).setValue(value);
};

App.rendererDate = function(value) {
	return App.format(value, 'Y-m-d');
};

App.rendererTime = function(value) {
	return App.format(value, 'H:i');
};

App.format = function(date, format) {
	return date instanceof Date ? Ext.Date.format(date, format || 'Y-m-d H:i') : date;
};

App.setTitle = function(id, title) {
	Ext.getCmp(id).setTitle(title);
};

/**
 * 设置表格的选模式：
 * 
 * 'SINGLE', 'MULTI' or 'SIMPLE'.
 */
App.setSelectionMode = function(id, mode) {
	Ext.getCmp(id).getSelectionModel().setSelectionMode(mode);
};

App.clearArray = function(array) {
	for ( var i in array) {
		delete (array[i]);
	}
};

App.DateAndTimeFormat = 'Y-m-d H:i';
App.DateFormat = 'Y-m-d';
App.TimeFormat = 'H:i';

/**
 * 得到当天日期
 * 
 * @param format
 * @returns
 */
App.today = function(format) {
	return Ext.Date.format(new Date(), format || 'Y-m-d H:i');
};

App.stringToDate = function(ds, format) {
	return ds.substring(11);

	if (ds.match(dateRegx).length > 0) {
		var d = ds.substring(0, 10).split('-');
		var t = ds.substring(11).split(':');
		var date = new Date();
		date.setYear(d[0]);
		date.setMonth(d[1]);
		date.setDate(d[2]);
		date.setHours(t[0]);
		date.setMinutes(t[1]);
		return date;
	}
	return ds;

};

/**
 * 返回当前日期的前后指定天数
 * 
 * @param day
 * @returns {Date}
 */
App.getDate = function(day) {
	var date = new Date();
	if (parseInt(day)) {
		date.setTime(date.getTime() + 3600000 * 24 * day);
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
	}
	return date;
};

/**
 * 错误提示
 * 
 * @param error
 * @param staut
 */
App.Error = function(response) {

	if (response.status > 399 && response.status < 500) {
		Fly.msg('请求错误', "<span class='request-error'>您请求的数据不存在,请重新请求数据!</span>");
	}

	if (response.status > 499) {
		Fly.msg('服务器', "<span class='service-error'>服务器产生错误,请与管理员联系!</span>");

	}
};

/**
 * 处理进度提示框
 * 
 * @param msg
 *            处理信息
 * @param text
 * @param tag
 *            弹出处理进度的目标
 * @param icon
 *            进行图标
 */
App.Progress = function(msg, text, tag, icon) {
	Ext.MessageBox.show({
		msg : msg,
		progressText : text,
		width : 300,
		wait : true,
		waitConfig : {
			interval : 200
		},
		icon : icon || 'ext-mb-download',
		iconHeight : 50,
		animateTarget : tag
	});
};

App.netError = function() {
	Fly.msg('网络', '网络连接中断,请检查网络!');
};

/**
 * 处理进度提示框隐藏
 */
App.ProgressHide = function() {
	Ext.MessageBox.hide();
};

/**
 * 设置日期控件的最小日期
 * 
 * @param id
 *            日期控件ID
 * @param value
 */
App.setDateFieldMinValue = function(id, value) {
	var nowday = App.format(new Date(), 'Y-m-d');
	var date = App.format(value, 'Y-m-d');
	Ext.getCmp(id).setMinValue(nowday == date ? new Date() : App.getDate(1));

};

function generateData(vals) {
	if (vals) {
		return Ext.JSON.decode(vals);
	} else {
		return [];
	}
};

function getCreateJSONStore(tons, vals, load) {
	return Ext.create('Ext.data.JsonStore', {
		autoLoad : load,
		fields : tons,
		data : generateData(vals)
	});
}

/**
 * 从服务器得到当前时间的毫秒数
 */
App.currentTimeMillis = function() {
	var now;
	Ext.Ajax.request({
		url : 'public/currentTimeMillis',
		async : false,
		success : function(response) {
			now = Ext.JSON.decode(response.responseText).nowttime;
		}
	});

	return now;
};

/**
 * 功能树点击事件
 * 
 * @param grid
 * @param record
 * @param item
 * @param index
 * @param e
 * @param eOpts
 */
App.itemClick = function(dataview, record, item, index, e, eOpts) {
	if (record) {

		// try {
		// 2014-2-17 更改显示介面
		// var tabPanel = Ext.getCmp(dataview.up('treepanel').tabpanelId);//

		// 得到要用于显示功能的标签面板
		var tabPanel = Ext.getCmp(dataview.up('window').tabpanelId);// 得到要用于显示功能的标签面板
		var leafId = record.id.split(';');

		// var scriptId = leafId[0].substring(leafId[0].length - 36);

		// 得到点击的功能介面
		var funPanel = tabPanel.getComponent(leafId[1]);

		// 如果介面没有创建时
		// 当设定了文件路径时,创建介面时,EXT就会自动加载相应的介面文件
		if (funPanel == null) {

			funPanel = Ext.create(leafId[1], {
				title : record.data.text,
				id : leafId[1],
				closable : true,
				bodyPadding : 5
			});
			tabPanel.add(funPanel);
		}
		tabPanel.setActiveTab(funPanel);
	}
};

/**
 * 模具工号模糊查找组件
 */
Ext.define('Module.ModuleFindTextField', {
	extend : 'Ext.form.field.Text',
	emptyText : '输入查找工号',
	enableKeyEvents : true,
	listeners : {
		keyup : function(text, e, eOpts) {
			var condition = text.getValue();
			var len = text.queryLength || 3;
			if (condition.length >= len) {
				var panel = text.up('treepanel') || text.up('gridpanel');
				try {
					panel.getStore().load({
						url : text.url || 'public/module',
						params : {
							condition : condition
						}
					});
				} catch (e) {
					console.log('不能找到treepanel 或 gridpanel');

				}
			}
		}
	}

});

/**
 * 通用下拉框,只需要请求数据URL,字段数组和根元素名称就可以快速建立 <br>
 * fields<br>
 * url<br>
 * rootName
 */
Ext.define('GeneralComboBox', {
	extend : 'Ext.form.field.ComboBox',

	initComponent : function() {
		var me = this;
		Ext.apply(me, {
			store : Ext.create('Ext.data.Store', {
				fields : me.fields,
				proxy : {
					type : 'ajax',
					url : me.url,
					reader : {
						type : 'json',
						root : me.rootName
					}
				}
			})
		});
		me.callParent(arguments);
	}
});

/**
 * 得到模具加工工艺菜单项
 * 
 * @returns
 */
App.getModuleCraftMenu = function(urls, cid) {
	// if (!CraftItem || !CraftItem[0].success) {
	// var CraftItem = [ {
	// xtype : 'menuitem',
	// text : "没有成功读取工艺,请重试一下",
	// success : false
	// } ];
	// // 生成工艺选择菜单
	// Ext.Ajax.request({
	// url : urls,
	// // url : 'public/craftItem',
	// params : {
	// classid : cid
	// },
	// method : 'POST',
	// async : false,
	// success : function(response) {
	// var res = JSON.parse(response.responseText);
	//
	// if (res.success) {
	// CraftItem = [];
	// for ( var i in res.crafts) {
	// CraftItem.push({
	// xtype : 'menuitem',
	// text : res.crafts[i].name,
	// craftId : 'plan-menuitem-' + res.crafts[i].id,
	// success : true,
	// iconCls : 'application_view_gallery-16'
	// });
	// }
	// }
	// },
	// failure : function(response) {
	// App.Error(response);
	// }
	// });
	// }

	var craftlist = [];
	// 生成工艺选择菜单
	Ext.Ajax.request({
		url : urls,
		// url : 'public/craftItem',
		params : {
			classid : cid
		},
		method : 'POST',
		async : false,
		success : function(response) {
			var res = JSON.parse(response.responseText);

			if (res.success) {
				for ( var i in res.crafts) {
					craftlist.push({
						xtype : 'menuitem',
						text : res.crafts[i].name,
						craftId : 'plan-menuitem-' + res.crafts[i].id,
						success : true,
						iconCls : 'application_view_gallery-16'
					});
				}

				// 如果长度为空则补充没有数据
				if (!craftlist.length) {
					craftlist.push({
						xtype : 'menuitem',
						text : "没有找到想要的工艺",
						success : false
					});
				}
			}
		},
		failure : function(response) {
			craftlist.push({
				xtype : 'menuitem',
				text : "没有找到想要的工艺",
				success : false
			});

			App.Error(response);
		}
	});

	return craftlist;
};

App.dateLongRegex = /"([0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2})"/g;
App.dateShortRegex = /"([0-9]{4}-[0-9]{2}-[0-9]{2})"/g;

/**
 * 将日期格式加上时区，让后台的json解析包可以对时间字符进行正确的解析
 * 
 * @param str
 * @returns
 */
App.dateReplaceToZone = function(str) {
	if (str) {
		return str.replace(App.dateLongRegex, '"$1.000+0800"').replace(App.dateShortRegex, '"$1T00:00:00.000+0800"');
	} else {
		return str;
	}
};

// -----------------------------------------------------------------

var hexcase = 0; /* hex output format. 0 - lowercase; 1 - uppercase */
var b64pad = ""; /* base-64 pad character. "=" for strict RFC compliance */
var chrsz = 8; /* bits per input character. 8 - ASCII; 16 - Unicode */

/*
 * 
 * These are the functions you'll usually want to call
 * 
 * They take string arguments and return either hex or base-64 encoded strings
 * 
 */

function hex_md5(s) {
	return binl2hex(core_md5(str2binl(s), s.length * chrsz));
}

function b64_md5(s) {
	return binl2b64(core_md5(str2binl(s), s.length * chrsz));
}

function hex_hmac_md5(key, data) {
	return binl2hex(core_hmac_md5(key, data));
}

function b64_hmac_md5(key, data) {
	return binl2b64(core_hmac_md5(key, data));
}

/* Backwards compatibility - same as hex_md5() */

function calcMD5(s) {
	return binl2hex(core_md5(str2binl(s), s.length * chrsz));
}

/*
 * 
 * Perform a simple self-test to see if the VM is working
 * 
 */

function md5_vm_test() {
	return hex_md5("abc") == "900150983cd24fb0d6963f7d28e17f72";
}

/*
 * 
 * Calculate the MD5 of an array of little-endian words, and a bit length
 * 
 */

function core_md5(x, len) {
	/* append padding */

	x[len >> 5] |= 0x80 << ((len) % 32);

	x[(((len + 64) >>> 9) << 4) + 14] = len;

	var a = 1732584193;

	var b = -271733879;

	var c = -1732584194;

	var d = 271733878;

	for (var i = 0; i < x.length; i += 16) {
		var olda = a;

		var oldb = b;

		var oldc = c;

		var oldd = d;

		a = md5_ff(a, b, c, d, x[i + 0], 7, -680876936);

		d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);

		c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);

		b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);

		a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);

		d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);

		c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);

		b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);

		a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);

		d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);

		c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);

		b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);

		a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);

		d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);

		c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);

		b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);

		a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);

		d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);

		c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);

		b = md5_gg(b, c, d, a, x[i + 0], 20, -373897302);

		a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);

		d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);

		c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);

		b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);

		a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);

		d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);

		c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);

		b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);

		a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);

		d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);

		c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);

		b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

		a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);

		d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);

		c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);

		b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);

		a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);

		d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);

		c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);

		b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);

		a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);

		d = md5_hh(d, a, b, c, x[i + 0], 11, -358537222);

		c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);

		b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);

		a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);

		d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);

		c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);

		b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);

		a = md5_ii(a, b, c, d, x[i + 0], 6, -198630844);

		d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);

		c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);

		b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);

		a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);

		d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);

		c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);

		b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);

		a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);

		d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);

		c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);

		b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);

		a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);

		d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);

		c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);

		b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);

		a = safe_add(a, olda);

		b = safe_add(b, oldb);

		c = safe_add(c, oldc);

		d = safe_add(d, oldd);

	}

	return Array(a, b, c, d);

}

/*
 * 
 * These functions implement the four basic operations the algorithm uses.
 * 
 */

function md5_cmn(q, a, b, x, s, t) {
	return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
}

function md5_ff(a, b, c, d, x, s, t) {
	return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
}

function md5_gg(a, b, c, d, x, s, t) {
	return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
}

function md5_hh(a, b, c, d, x, s, t) {
	return md5_cmn(b ^ c ^ d, a, b, x, s, t);
}

function md5_ii(a, b, c, d, x, s, t) {
	return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
}

/*
 * 
 * Calculate the HMAC-MD5, of a key and some data
 * 
 */

function core_hmac_md5(key, data) {
	var bkey = str2binl(key);

	if (bkey.length > 16)
		bkey = core_md5(bkey, key.length * chrsz);

	var ipad = Array(16), opad = Array(16);

	for (var i = 0; i < 16; i++) {
		ipad[i] = bkey[i] ^ 0x36363636;

		opad[i] = bkey[i] ^ 0x5C5C5C5C;
	}

	var hash = core_md5(ipad.concat(str2binl(data)), 512 + data.length * chrsz);

	return core_md5(opad.concat(hash), 512 + 128);

}

/*
 * 
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * 
 * to work around bugs in some JS interpreters.
 * 
 */

function safe_add(x, y) {
	var lsw = (x & 0xFFFF) + (y & 0xFFFF);

	var msw = (x >> 16) + (y >> 16) + (lsw >> 16);

	return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * 
 * Bitwise rotate a 32-bit number to the left.
 * 
 */

function bit_rol(num, cnt) {
	return (num << cnt) | (num >>> (32 - cnt));
}

/*
 * 
 * Convert a string to an array of little-endian words
 * 
 * If chrsz is ASCII, characters >255 have their hi-byte silently ignored.
 * 
 */

function str2binl(str) {
	var bin = Array();

	var mask = (1 << chrsz) - 1;

	for (var i = 0; i < str.length * chrsz; i += chrsz)

		bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (i % 32);

	return bin;
}

/*
 * 
 * Convert an array of little-endian words to a hex string.
 * 
 */

function binl2hex(binarray) {
	var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";

	var str = "";

	for (var i = 0; i < binarray.length * 4; i++) {
		str += hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 0xF) +

		hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8)) & 0xF);
	}

	return str;

}

/*
 * 
 * Convert an array of little-endian words to a base-64 string
 * 
 */

function binl2b64(binarray) {
	var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

	var str = "";

	for (var i = 0; i < binarray.length * 4; i += 3) {
		var triplet = (((binarray[i >> 2] >> 8 * (i % 4)) & 0xFF) << 16)

		| (((binarray[i + 1 >> 2] >> 8 * ((i + 1) % 4)) & 0xFF) << 8)

		| ((binarray[i + 2 >> 2] >> 8 * ((i + 2) % 4)) & 0xFF);

		for (var j = 0; j < 4; j++) {
			if (i * 8 + j * 6 > binarray.length * 32)
				str += b64pad;

			else
				str += tab.charAt((triplet >> 6 * (3 - j)) & 0x3F);
		}

	}

	return str;

}

/**
 * 正则表达式验证字符串
 * 
 * @param str
 *            待检验的字符串
 * @param pattern
 *            正则表达式
 * @returns
 */
function regexValidate(str, pattern) {
	try {
		return pattern.test(str);
	} catch (e) {
		return (false);
	}
}

/**
 * 左补字符
 * 
 * @param str
 *            原字符
 * @param size
 *            替换后的位数
 * @param pad
 *            替换的字符
 * @returns
 */
function leftPad(str, size, pad) {
	try {
		if (str) {
			var strLen = str.length;
			var padStr = '';
			if (strLen < size) {
				for (var x = 0; x < size - strLen; x++) {
					padStr += pad;
				}
				padStr += str;
				return padStr;
			} else {
				return str;
			}
		} else {
			return '';
		}
	} catch (e) {
		return '';
	}
}

/**
 * 右补字符
 * 
 * @param str
 *            原字符
 * @param size
 *            字符补充后的长度
 * @param pad
 *            补充的字符
 * @returns
 */
function rightPad(str, size, pad) {
	try {
		if (str) {
			var strLen = str.length;
			var padStr = '';
			if (strLen < size) {
				padStr += str;

				for (var x = 0; x < size - strLen; x++) {
					padStr += pad;
				}
				return padStr;
			} else {
				return str;
			}
		} else {
			return '';
		}
	} catch (e) {
		return '';
	}
}

/**
 * 某个字符串是否存在于数组中
 * 
 * @param arr
 *            字符串数组
 * @param val
 *            字符串
 * @returns {Boolean} true为存在,false不存在
 */
function arrContains(arr, val) {
	try {
		if (arr && val) {
			for ( var x in arr) {
				if (arr[x] == val) {
					return (true);
				}
			}
			return (false);
		} else {
			return (false);
		}
	} catch (e) {
		return false;
	}
}

/**
 * 清空字符串中所有空格(两端和中间的空格)
 * 
 * @param str
 *            待清空的字符串
 * @returns
 */
function trimAll(str) {
	if (!str) {
		return str;
	} else {
		return (str + '').replace(/\s+/g, "");
	}
}

/**
 * 删除字符串两边的空格
 * 
 * @param str
 * @returns
 */
function trimSides(str) {
	if (!str) {
		return str;
	} else {
		return (str + '').replace(/^\s+|\s+$/g, "");
	}
}

/**
 * 清空左边的空格
 */
var trimLeft = function(str) {
	if (!str) {
		return str;
	} else {
		return (str + '').replace(/^\s*/, '');
	}
};

/**
 * 清空右边的空格
 * 
 * @param str
 * @returns
 */
var trimRight = function(str) {
	if (!str) {
		return str;
	} else {
		return (str + '').replace(/(\s*$)/g, "");
	}
};

/**
 * 判定字符串中是否含有另一个字符串
 * 
 * @param str
 * @param chr
 * @returns
 */
var strContains = function(str, chr) {
	if (str && chr) {
		var index = str.indexOf(chr);
		if (index >= 0) {
			return (true);
		} else {
			return (false);
		}
	} else {
		return (false);
	}
};

/**
 * 解码
 */
App.Base64Parse = function(value) {
	var words = CryptoJS.enc.Base64.parse(value);
	return words.toString(CryptoJS.enc.Utf8) || null;
};

/**
 * 编码
 */
App.Base64Stringify = function(value) {
	return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(value));
};

/**
 * 读取本地缓存的数据
 */
App.localStorageParse = function(key) {
	// 读取相应用户模块的缓存数据,如果浏览器不支持localStorage时,就从cookies中读到
	var words = App.Base64Parse(localStorage ? localStorage.getItem(key) || "" : Cookies.getCookie(key));
	return Ext.JSON.decode(words || null);
};

/**
 * 保存本地缓存数据
 */
App.localStorageStringify = function(key, value) {
	var base64 = App.Base64Stringify(value instanceof Object ? Ext.JSON.encode(value) : value);

	if (localStorage) {
		localStorage.setItem(key, base64);
	} else {
		// 如果浏览器不支持localStorage时, 就将模具数据缓存到cookies中
		Cookies.setCookie(key, base64);
	}
};

/**
 * 得到相应条码的格式
 */
App.getPrintBarcodeFormat = function(moduleId, barTypeId) {
	var format = null;
	Ext.Ajax.request({
		url : 'module/code/queryBarcodeFormat',
		params : {
			"moduleId" : moduleId,
			"barTypeId" : barTypeId
		},
		async : false,
		success : function(response) {
			format = Ext.JSON.decode(response.responseText).children[0].children;
		},
		failure : function(response) {
			App.Error(response);
		}
	});
	return format;
};

/**
 * 打印内容是否改变
 */
App.printContextChange = false;

/**
 * 通给定的数据和条码打印格式,生成条码打印内容
 */
App.getPrintBarcodeContext = function(models, format) {
	var part = new Array();
	for ( var i in models) {
		var contextPage = [];
		for ( var x in format) {
			contextPage.push({
				type : format[x].printtype,
				x : format[x].xseat,
				y : format[x].yseat,
				width : format[x].printwidth,
				height : format[x].printheight,
				context : {
					barcodeType : format[x].barcodetype,
					text : models[i].get(format[x].printcol),
					line : format[x].rectline,
					lineWidth : format[x].rectlinewidth
				}
			});
		}
		part.push({
			contextPage : contextPage
		});
	}
	return part;
};

/**
 * 生成打印的table Html格式
 */
App.createPartInfoTable = function(title, headers, data) {
	var htmlGenerator = '<html><body><div style = "padding:0 12px 0 0px;font-size:14px;font-family: \'微软雅黑\'"><div><a style = "color:#336666">'
			+ title
			+ '</a></div><div><table border="0" cellpadding="3" cellspacing="0" width="100%" style="background-color: #b9d8f3;font-size:10px">';
	if (headers && headers.length) {
		htmlGenerator += '<tr>';
		for ( var x in headers) {
			htmlGenerator += '<td width = \'' + headers[x].width + '%\'>' + headers[x].name + '</td>';
		}
		htmlGenerator += '</tr>';
	}

	if (data.length) {
		for ( var m in data) {
			var row = data[m];
			htmlGenerator += '<tr' + (m % 2 == 0 ? ' bgcolor=\'#F4FAFF\'>' : '>');
			for ( var n in row) {
				htmlGenerator += '<td>';
				htmlGenerator += (row[n] ? row[n] : '');
				htmlGenerator += '</td>';
			}
			htmlGenerator += '</tr>';
		}
	}

	htmlGenerator += '</table></div></div></body><html>';
	return htmlGenerator;
};

App.createSchePlan = function(sz, hr, col, header, data, timecol, format) {

	// 生成表头
	var headerHtml = '';
	if (header && header.length) {
		headerHtml += ('<tr>');

		for ( var x in header) {
			headerHtml += ('<th>' + header[x].name + '</th>');
		}

		headerHtml += ('</tr>');
	}

	// 判断数组中是否包含某个值
	function isArrIn(val, arr) {
		if (!val) {
			return (false);
		}

		if (arr && arr.length) {
			for ( var x in arr) {
				if (arr[x] == val) {
					return (true);
				}
			}
		}

		return (false);
	}

	var bodyHtml = '';
	var hours = 0;
	var rLen = 0;
	if (data && data.length) {
		rLen = data.length;
		for ( var m in data) {
			var cHour = data[m].get(col);
			hours += (cHour ? cHour : 0);

			bodyHtml += ('<tr>');

			for ( var n in header) {
				var headerCol = header[n].column;
				var cellStr = data[m].get(headerCol);

				if (isArrIn(headerCol, timecol)) {
					if (cellStr) {
						cellStr = cellStr.substring(0, 10);
					}
				}

				bodyHtml += ('<td>' + (cellStr ? cellStr : '') + '</td>');
			}

			bodyHtml += ('</tr>');
		}
	}

	var htmlGenerator = '<html><div>' + sz + ' : ' + rLen + ' | ' + hr + ' : ' + hours + '</div><table cellspacing="0" border = "1">' + headerHtml
			+ bodyHtml + '</table></body></html>';

	// <tr><td>TL151238</td><td>401</td><td>开工</td><td>磨床</td><td>SG-1</td><td>磨床</td><td>2016-02-17</td><td>2016-03-01</td><td>1.5</td></tr>
	return htmlGenerator;
};

/** 弹出框的个数----------------- */
var layerCount = 0;
var layerIndex = -1;

/**
 * 弹出提示框
 * 
 * @param text
 */
function showSuccess(text) {
	showMessage('success_xubox_tips', text);
}

function showError(text) {
	showMessage('error_xubox_tips', text);
}

function showInfo(text) {
	showMessage('info_xubox_tips', text);
}

/**
 * 弹出提示框
 * 
 * @param text
 */
function showMessage(type, text) {
	layer.close(layerIndex);

	var msg = '<div class="'.concat(type).concat(' xubox_tips"><div class="xubox_tipsMsg" style="font-size:16px;padding:3px;">');
	msg = msg.concat(text).concat('</div></div>');

	layerIndex = $.layer({
		type : 1,
		closeBtn : false,
		shadeClose : false,
		shade : [ 0 ],
		border : [ 0 ],
		offset : [ 30 * 0 + 'px', '' ],
		time : 4,
		page : {
			html : msg
		},
		bgcolor : 'rgba(0, 0, 0, 0)',
		title : false,
		area : [ '300px', 'auto' ],
		shift : 'top',
		end : function() {
			layerCount--;
		}
	});
	layerCount++;
}

/** ------------DOM对象的提醒------------- */
function showSuccessTip(msg, dom, guide) {
	return showTip(msg, dom, '#5cb85c', guide);
}

function showInfoTip(msg, dom, guide) {
	return showTip(msg, dom, '#f0ad4e', guide);
}

function showErrorTip(msg, dom, guide) {
	return showTip(msg, dom, '#d9534f', guide);
}

function showTip(msg, dom, bgcolor, guide) {
	return layer.tips("<span style=\"font-size:16px;\">" + msg + "</span>", dom, {
		guide : guide || 0,
		style : [ 'background-color:' + bgcolor + '; color:#fff;', bgcolor ],
		closeBtn : [ 0, true ],
		time : 3
	});
}

/**
 * 数字的四舍五入
 * 
 * @param val
 * @param dec
 * @param def
 * @returns
 */
function MathRound(val, dec, def) {
	try {
		var baseNumber = Math.pow(10, dec);
		return Math.round(val * baseNumber) / baseNumber;
	} catch (e) {
		return def;
	}
}

// TODO AJAX请求事项
// =============================================================================================================
var Ajax = {};
// 断网提醒
Ajax.disconnect = "连接网络失败";
/**
 * 将参数ENCODE成编码
 */
Ajax.Encode = function(params) {
	return Ext.JSON.encode(params);
};

/**
 * 将后台返回的JSON串转换为JSON
 */
Ajax.DecodeJson = function(res) {
	return Ext.JSON.decode(res.responseText);
};
/**
 * AJAX请求
 */
Ajax.Request = function(url, method, params, extras, callback, error) {
	Ext.Ajax.request({
		url : url,
		method : method,
		params : params,
		success : function(resp) {
			// 将后台的数据转换为JSON
			var backJson = Ajax.DecodeJson(resp);
			// 执行回调函数
			callback(extras, backJson);
		},
		failure : function() {
			showError(error);
		}
	});
};

Ajax.Post = function(url, params, extras, callback) {
	Ajax.Request(url, "POST", params, extras, callback, Ajax.disconnect);
};