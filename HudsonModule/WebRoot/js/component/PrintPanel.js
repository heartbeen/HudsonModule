Ext.define('Project.component.PrintPanel', {
	extend : 'Ext.panel.Panel',
	title : '打印',

	LODOP : null, // 声明为全局变量
	blPreviewOpen : false,
	printObjectId : '',
	printEmbedId : '',

	printPages : 0,// 所有要打印的张数
	pageWidth : 0,// 单张的宽度
	pargHeight : 0,// 单张的高度
	intOrient : 1,// 打印方向
	unit : null,// 纸张尺寸单位
	pages : 1,// 同时打印张数
	gap : 1,// 多张间的间隙
	leftGap : 0,// 左间隙
	rightGap : 0,// 右间隙

	printContext : [ {// 打印页
		contextPage : [ {
			type : '',// 打印的类型,text,barcode,rect
			x : 0,
			y : 0,
			width : 0,
			height : 0,
			context : {
				barcodeType : '',// 条码类型
				text : '',// 打印内容
				line : 0,// type为rect时,边框线的类型
				lineWidth : 0
			// type为rect时,边框线的宽度
			}
		} ]
	} ],

	initComponent : function() {
		var me = this;

		me.pageControl = Ext.create('Ext.form.field.Number', {
			width : 80,
			enableKeyEvents : true,
			minValue : 1,
			fieldLabel : '到',
			labelWidth : 15,
			listeners : {
				scope : me,
				spindown : me.printPageDown,
				spinup : me.printPageUp,
				keyup : me.pageControlKeyup
			}
		});

		Ext.applyIf(me, {

			html : printObject.replace('objectId', me.printObjectId).replace('embedId', me.printEmbedId),

			dockedItems : [ {
				xtype : 'toolbar',
				dock : 'top',
				defaults : {
					scope : me
				},
				items : [ {
					xtype : 'button',
					text : '适高显示',
					handler : me.zoomHight,
					iconCls : 'arrow_inout-16',
				}, {
					xtype : 'button',
					text : '正常显示',
					iconCls : 'arrow_in-16',
					handler : me.zoomNormal
				}, {
					xtype : 'button',
					text : '适宽显示',
					iconCls : 'arrow_out-16',
					handler : me.zoomWidth
				}, {
					xtype : 'button',
					text : '缩小',
					iconCls : 'zoom_out-16',
					handler : me.zoomOut
				}, {
					xtype : 'button',
					text : '放大',
					iconCls : 'zoom_in-16',
					handler : me.zoomIn
				}, {
					xtype : 'tbseparator'
				}, {
					xtype : 'combobox',
					width : 120,
					fieldLabel : '比例',
					labelWidth : 30,
					store : Ext.create('Ext.data.Store', {
						fields : [ 'value', 'name' ],
						data : [ {
							value : "0",
							name : "30%"
						}, {
							value : "1",
							name : "50%"
						}, {
							value : "2",
							name : "60%"
						}, {
							value : "3",
							name : "70%"
						}, {
							value : "4",
							name : "80%"
						}, {
							value : "5",
							name : "85%"
						}, {
							value : "6",
							name : "90%"
						}, {
							value : "7",
							name : "95%"
						}, {
							value : "8",
							name : "100%"
						}, {
							value : "9",
							name : "125%"
						}, {
							value : "10",
							name : "150%"
						}, {
							value : "11",
							name : "200%"
						}, {
							value : "12",
							name : "按整宽"
						}, {
							value : "13",
							name : "按整高"
						}, {
							value : "14",
							name : "按整页"
						}, {
							value : "15",
							name : "整宽不变形"
						}, {
							value : "16",
							name : "整高不变形"
						}, {
							value : "17",
							name : "其它比例"
						} ],
						proxy : {
							type : 'memory'
						}
					}),
					valueField : 'value',
					displayField : 'name',

					listeners : {
						select : me.percent
					}

				}, {
					xtype : 'tbfill'
				}, {
					xtype : 'button',
					text : '设置',
					handler : me.previewSetup
				} ]
			}, {
				xtype : 'toolbar',
				dock : 'bottom',
				defaults : {
					scope : me
				},
				items : [ {
					xtype : 'button',
					tooltip : '首页',
					iconCls : 'resultset_first-16',
					handler : me.goFirst
				}, {
					xtype : 'button',
					tooltip : '上一页',
					iconCls : 'resultset_previous-16',
					handler : me.goPrior
				}, {
					xtype : 'button',
					tooltip : '下一页',
					iconCls : 'resultset_next-16',
					handler : me.goNext
				}, {
					xtype : 'button',
					tooltip : '尾页',
					iconCls : 'resultset_last-16',
					handler : me.goLast
				}, '-', me.pageControl, {
					xtype : 'label',
					text : '页'
				}, '-', {
					xtype : 'button',
					text : '旋转',
					handler : me.previewRotate
				}, {
					xtype : 'button',
					text : '打印全部',
					iconCls : 'document-print-16',
					handler : me.printAll
				}, {
					xtype : 'button',
					text : '打印本页',
					handler : me.printPage
				} ]
			} ],

			listeners : {
				afterrender : function() {
					setTimeout(function() {
						me.openPreview();
					}, 1000);
				}
			}
		});

		me.callParent(arguments);
	},

	pageControlKeyup : function(number, e) {

		var key = e.getKey();

		if (key < 48 || (key > 57 && key < 96) || key > 105) {
			number.setValue('');
			return;
		}
		var me = this;
		var p = number.getValue();

		if (p == this.printPages) {
			me.setGoDisabled(number.up('toolbar'), false, false, true, true);
		} else if (p == 1) {
			me.setGoDisabled(number.up('toolbar'), true, true, false, false);
		} else {
			me.setGoDisabled(number.up('toolbar'), false, false, false, false);
		}

		me.LODOP.DO_ACTION("PREVIEW_GOTO", p);// PREVIEW_GOSKIP
	},

	zoomHight : function() {
		var me = this;
		me.LODOP.DO_ACTION("PREVIEW_ZOOM_HIGHT", 0);
	},
	zoomNormal : function() {
		var me = this;
		me.LODOP.DO_ACTION("PREVIEW_ZOOM_NORMAL", 0);
	},
	zoomWidth : function() {
		var me = this;
		me.LODOP.DO_ACTION("PREVIEW_ZOOM_WIDTH", 0);
	},
	zoomIn : function() {
		var me = this;
		me.LODOP.DO_ACTION("PREVIEW_ZOOM_IN", 0);
	},
	zoomOut : function() {
		var me = this;
		me.LODOP.DO_ACTION("PREVIEW_ZOOM_OUT", 0);
	},
	percent : function(combo, records, eOpts) {
		if (!records) {
			return;
		}
		var me = this;
		me.LODOP.DO_ACTION("PREVIEW_PERCENT", records[0].data.value - 1);
	},
	goFirst : function(button) {
		var me = this;
		me.LODOP.DO_ACTION("PREVIEW_GOFIRST", 0);

		me.setGoDisabled(button.up('toolbar'), true, true, false, false);
		me.pageControl.setValue(1);

	},
	goPrior : function(button) {
		var me = this;
		console.log(me.LODOP.GET_VALUE('PREVIEW_PAGE_NUMBER', 4));
		me.LODOP.DO_ACTION("PREVIEW_GOPRIOR", 0);
		me.pageControl.setValue(me.LODOP.GET_VALUE('PREVIEW_PAGE_NUMBER', 4));

		if (me.pageControl.getValue() == 1) {
			me.setGoDisabled(button.up('toolbar'), true, true, false, false);
		} else {
			me.setGoDisabled(button.up('toolbar'), false, false, false, false);
		}
	},
	goNext : function(button) {
		var me = this;
		me.LODOP.DO_ACTION("PREVIEW_GONEXT", 0);
		me.pageControl.setValue(me.LODOP.GET_VALUE('PREVIEW_PAGE_NUMBER', 4));

		if (me.pageControl.getValue() == me.printPages) {
			me.setGoDisabled(button.up('toolbar'), false, false, true, true);
		} else {
			me.setGoDisabled(button.up('toolbar'), false, false, false, false);
		}
	},
	goLast : function(button) {
		var me = this;
		me.LODOP.DO_ACTION("PREVIEW_GOLAST", 0);
		me.pageControl.setValue(me.LODOP.GET_VALUE('PREVIEW_PAGE_NUMBER', 4));

		me.setGoDisabled(button.up('toolbar'), false, false, true, true);
		me.pageControl.setValue(me.LODOP.GET_VALUE('PREVIEW_PAGE_NUMBER', 4));
	},

	setGoDisabled : function(toolbar, first, prior, next, last) {
		toolbar.getComponent(0).setDisabled(first);
		toolbar.getComponent(1).setDisabled(prior);
		toolbar.getComponent(2).setDisabled(next);
		toolbar.getComponent(3).setDisabled(last);
	},

	printPageUp : function(number) {
		var me = this;
		me.goTo(number.getValue() + 1);

		if (number.getValue() + 1 == me.printPages) {
			me.setGoDisabled(number.up('toolbar'), false, false, true, true);
		} else {
			me.setGoDisabled(number.up('toolbar'), false, false, false, false);
		}

	},

	printPageDown : function(number) {
		var me = this;
		this.goTo(number.getValue() - 1);

		if (number.getValue() - 1 == 1) {
			me.setGoDisabled(number.up('toolbar'), true, true, false, false);
		} else {
			me.setGoDisabled(number.up('toolbar'), false, false, false, false);
		}
	},

	goTo : function(page) {
		var me = this;
		me.LODOP.DO_ACTION("PREVIEW_GOTO", page);// PREVIEW_GOSKIP
	},
	previewSetup : function() {
		var me = this;
		me.LODOP.DO_ACTION("PREVIEW_SETUP", 0);
	},
	printAll : function() {
		var me = this;
		var iPageCount = me.LODOP.GET_VALUE("PREVIEW_PAGE_COUNT", 0);// 获得页数
		me.LODOP.SET_PRINT_MODE("PRINT_START_PAGE", 1);
		me.LODOP.SET_PRINT_MODE("PRINT_END_PAGE", iPageCount);
		me.LODOP.DO_ACTION("PREVIEW_PRINT", 0);
	},
	printPage : function() {
		var me = this;
		var iThisNumber = me.LODOP.GET_VALUE("PREVIEW_PAGE_NUMBER", 0);// 获得当前页号
		me.LODOP.SET_PRINT_MODE("PRINT_START_PAGE", iThisNumber);
		me.LODOP.SET_PRINT_MODE("PRINT_END_PAGE", iThisNumber);
		me.LODOP.DO_ACTION("PREVIEW_PRINT", 0);
	},
	previewRotate : function() {
		var me = this;
		me.LODOP.DO_ACTION("PREVIEW_ROTATE", 0);
	},
	previewClose : function() {
		var me = this;
		if (!me.blPreviewOpen)
			return;
		me.LODOP.DO_ACTION("PREVIEW_CLOSE", 0);
		me.blPreviewOpen = false;
	},

	openPreview : function() {

		var me = this;
		me.LODOP = getLodop(document.getElementById(me.printObjectId), document.getElementById(me.printEmbedId));

		if (me.LODOP == null) {
			return;
		}

		me.LODOP.PRINT_INIT("打印控件Lodop功能演示_自己设计预览界面");
		me.LODOP.SET_PRINT_STYLE("FontSize", 11);

		// 更新打印纸
		if (App.paperFormat && me.paperId) {
			if (App.paperFormat != me.paperId) {
				me.paperId = App.paperFormat.id;
				me.pageWidth = App.paperFormat.paperwidth;
				me.pargHeight = App.paperFormat.paperheight;
				me.pages = App.paperFormat.papers;
				me.gap = App.paperFormat.papergap;
				me.leftGap = App.paperFormat.leftgap;
				me.rightGap = App.paperFormat.rightgap;
			}
		}

		me.setPageSize(me.intOrient, me.conversion(me.pageWidth * me.pages + me.leftGap + me.rightGap + me.gap * (me.pages - 1)), me
				.conversion(me.pargHeight));
		me.blPreviewOpen = true;
	},

	/**
	 * direction: 打印方向及纸张类型，数字型，<br>
	 * 
	 * 1---纵(正)向打印，固定纸张；<br>  2---横向打印，固定纸张；   3---纵(正)向打印，宽度固定，高度按打印内容的高度自适应；<br>
	 * 0(或其它)----打印方向由操作者自行选择或按打印机缺省设置；<br>
	 * PageWidth： 设定自定义纸张宽度，整数或字符型，整数时缺省长度单位为0.1mm,
	 * 譬如该参数值为45，则表示4.5毫米。字符型时可包含单位名：in(英寸)、cm(厘米) 、mm(毫米)
	 * 、pt(磅)，如“10mm”表示10毫米。数值等于0时本参数无效。 PageHeight：
	 * 固定纸张时设定纸张高；高度自适应时设定纸张底边的空白高。整数或字符型，整数时缺省长度单位为0.1毫米。字符型时可包含单位名：in(英寸)、cm(厘米)
	 * 、mm(毫米) 、pt(磅)，如“10mm”表示10毫米。数值等于0时本参数无效。 宽或高无效时下面的strPageName才起作用。
	 * strPageName：
	 * 所选纸张类型名，字符型。不同打印机所支持的纸张可能不一样，这里的名称同操作系统内打印机属性中的纸张名称，支持操作系统内的自定义纸张。
	 * 关键字“CreateCustomPage”会按以上宽度和高度自动建立一个自定义纸张，所建立的纸张名固定为“LodopCustomPage”，多次建立则刷新该纸张的大小值。
	 * 注：PageWidth、PageHeight
	 * 和strPageName都无效时，本函数对纸张大小不起作用，控件则采用所选打印机的默认纸张，但intOrient仍可起作用。
	 * 实际打印时，控件按如下优先级顺序确定纸张大小： 第1优先是打印维护里纸张属性（“本机自行定义纸张”）设置的纸张大小。
	 * 第2优先是SET_PRINT_PAGESIZE指定的纸张大小； 第3优先是上次打印时在预览界面设置里选择的纸张类型；
	 * 第4是按所选打印机的默认纸张；
	 */
	setPageSize : function(intOrient, width, height, pageName) {
		this.LODOP.SET_PRINT_PAGESIZE(intOrient, width, height, pageName || "CreateCustomPage");
	},

	showContextPage : function(printContext) {
		var me = this;
		var printPages = Math.floor(printContext.length / me.pages) + (printContext.length % me.pages == 0 ? 0 : 1);// 根据数据量和并列张数计算出要打印的次数

		me.printPages = printPages;

		me.setPrintPages(printPages);

		var index = 0;// 数据索引
		if (printContext) {
			for (var i = 1; i <= printPages; i++) {
				me.LODOP.NEWPAGEA();

				for (var c = 0; c < me.pages; c++) {
					var pc = printContext[index++];

					if (!pc) {
						break;
					}

					for (var a = 0; a < pc.contextPage.length; a++) {
						// 计算每列左边的间距
						var leftSpace = me.conversionPX(me.leftGap + (me.pageWidth + me.gap) * c + pc.contextPage[a].x);
						switch (pc.contextPage[a].type) {

						case 'text': {
							me.LODOP.ADD_PRINT_TEXT(me.conversionPX(pc.contextPage[a].y), leftSpace, me.conversionPX(pc.contextPage[a].width), me
									.conversionPX(pc.contextPage[a].height), pc.contextPage[a].context.text);
							break;
						}
						case 'rect': {
							me.LODOP.ADD_PRINT_RECT(me.conversionPX(pc.contextPage[a].y), leftSpace, me.conversionPX(pc.contextPage[a].width), me
									.conversionPX(pc.contextPage[a].height), pc.contextPage[a].context.line, pc.contextPage[a].context.lineWidth);
							break;
						}
						case 'barcode': {
							me.LODOP.ADD_PRINT_BARCODE(me.conversionPX(pc.contextPage[a].y), leftSpace, me.conversionPX(pc.contextPage[a].width), me
									.conversionPX(pc.contextPage[a].height), pc.contextPage[a].context.barcodeType, pc.contextPage[a].context.text);
							break;
						}

						case 'html': {
							me.LODOP.ADD_PRINT_HTM(me.conversionPX(pc.contextPage[a].y), leftSpace, me.conversionPX(pc.contextPage[a].width), me
									.conversionPX(pc.contextPage[a].height), pc.contextPage[a].context.barcodeType, pc.contextPage[a].context.text);

							break;
						}
						}
					}
				}

			}
			me.browsePreviewMode();
		}

	},

	/**
	 * 设置要打印的总页数
	 */
	setPrintPages : function(pages) {
		var me = this;
		me.pageControl.setMaxValue(pages);
		me.pageControl.setValue(pages > 0 ? 1 : 0);

		if (pages == 0) {
			me.setGoDisabled(me.pageControl.up('toolbar'), true, true, true, true);
		} else {
			me.setGoDisabled(me.pageControl.up('toolbar'), true, true, false, false);
		}
	},

	conversion : function(data) {
		var me = this;

		switch (me.unit.toUpperCase()) {
		case 'MM': {
			return data * 10;
		}
		}
	},

	conversionPX : function(data) {
		var me = this;

		switch (me.unit.toUpperCase()) {

		case 'MM': {// 1毫米转换成象素
			return data * 3.77952;
		}
		}
	},

	/**
	 * 浏览器显示模式
	 */
	browsePreviewMode : function() {
		this.LODOP.SET_PRINT_MODE("PRINT_PAGE_PERCENT", "Full-Page");// 按整页缩放
		this.LODOP.SET_SHOW_MODE("HIDE_PAPER_BOARD", true);// 隐藏走纸板
		this.LODOP.SET_PREVIEW_WINDOW(0, 3, 0, 0, 0, ""); // 隐藏工具条，设置适高显示
		this.LODOP.SET_SHOW_MODE("PREVIEW_IN_BROWSE", true); // 预览界面内嵌到页面内

		this.LODOP.PREVIEW();
		this.LODOP.DO_ACTION("PREVIEW_PERCENT", 8);

		// this.LODOP.SET_SHOW_MODE("SETUP_IN_BROWSE",1);
		// this.LODOP.PRINT_SETUP();
	}

});