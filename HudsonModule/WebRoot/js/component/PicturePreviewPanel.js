/**
 * 图片预览面板
 */
Ext.define('Project.component.PicturePreviewPanel', {
	extend : 'Ext.panel.Panel',
	alias : 'widget.picturepreviewpanel',

	border : false,

	initComponent : function() {
		var me = this;

		Ext.applyIf(me, {
			layout : 'border',
			bodyPadding : 5,
			html : '<div id="measure-panel" style="width:100%;height:100%"><canvas width="778" height="531" id="measure-img"></canvas></div>',
			listeners : {
				scope : me,
				render : me.canvasRender,
				resize : me.panelResize
			},
			dockedItems : [ {
				xtype : 'toolbar',
				items : [ {
					iconCls : 'zoom_in-16',
					tooltip : '放大图片',
					scope : me,
					handler : me.zoomInPicture
				}, {
					iconCls : 'zoom_out-16',
					tooltip : '缩小图片',
					scope : me,
					handler : me.zoomOutPicture
				} ]
			} ]
		});

		me.callParent(arguments);
	},

	/**
	 * 重设图片处理面板的size
	 */
	panelResize : function(panel, width, height, oldWidth, oldHeight, eOpts) {
		var me = this;

		// 没有图片
		if (!me.img) {
			return;
		}

		me.canvas.setAttribute('width', width);
		me.canvas.setAttribute('height', height);

		me.canvasInit(me.imgSrc);

	},

	/**
	 * 渲染办图片处理介面
	 */
	canvasRender : function(panel, e) {
		var me = this;

		me.canvas = document.getElementById('measure-img');
		me.context = me.canvas.getContext('2d');
		me.context.lineWidth = 10;

		// 根据图片尺寸调整显示面板大小,而不是根据浏览窗口大小调整
		var measurePanel = $('#measure-panel');

		me.canvas.setAttribute('width', measurePanel.width());
		me.canvas.setAttribute('height', measurePanel.height());

		me.canvasInit(me.imgSrc);

	},

	/**
	 * 初始化图片编辑区
	 */
	canvasInit : function(result) {
		var me = this;

		me.imgX = 0, me.imgY = 0;
		me.imgScale = me.getImgScale(me.imgWidth, me.imgHeight);// 显示比例

		me.img = new Image();
		me.img.onload = function() {
			imgIsLoaded = true;
			me.drawImage();
		};
		me.img.src = result;

		if (!me.canvas.onmousedown) {
			me.canvas.onmousedown = function(event) {
				me.canvasonmousedown(event);
			};

			me.canvas.onmousewheel = me.canvas.onwheel = function(event) {
				me.canvasonmousewheel(event);
			};
		}

	},

	/**
	 * 计算显示区与图片的比例
	 */
	getImgScale : function(width, height) {
		var measurePanel = $('#measure-panel');
		var ws = measurePanel.width() / width;
		var hs = measurePanel.height() / height;
		return ws < hs ? ws : hs;
	},

	/**
	 * 重绘图形
	 */
	drawImage : function() {
		var me = this;
		if (!me.context || !me.img) {
			return;
		}
		me.context.clearRect(0, 0, me.canvas.width, me.canvas.height);
		me.context.drawImage(me.img, 0, 0, me.img.width, me.img.height, me.imgX, me.imgY, me.img.width * me.imgScale, me.img.height * me.imgScale);
	},

	/**
	 * 图片鼠标拖动事件
	 */
	canvasonmousedown : function(event) {
		var me = this;

		var pos = me.windowToCanvas(me.canvas, event.clientX, event.clientY);
		me.canvas.onmousemove = function(event) {
			me.canvas.style.cursor = "move";
			var pos1 = me.windowToCanvas(me.canvas, event.clientX, event.clientY);
			var x = pos1.x - pos.x;
			var y = pos1.y - pos.y;
			pos = pos1;
			me.imgX += x;
			me.imgY += y;
			me.drawImage();
		};
		me.canvas.onmouseup = function() {
			me.canvas.onmousemove = null;
			me.canvas.onmouseup = null;
			me.canvas.style.cursor = "default";
		};

	},

	/**
	 * 鼠标滚动图形缩放事件
	 */
	canvasonmousewheel : function(event) {
		var me = this;

		var pos = me.windowToCanvas(me.canvas, event.clientX, event.clientY);
		event.wheelDelta = event.wheelDelta ? event.wheelDelta : (event.deltaY * (-40));

		if (event.wheelDelta > 0) {
			me.imgScale *= 2;
			me.imgX = me.imgX * 2 - pos.x;
			me.imgY = me.imgY * 2 - pos.y;
		} else {
			me.imgScale /= 2;
			me.imgX = me.imgX * 0.5 + pos.x * 0.5;
			me.imgY = me.imgY * 0.5 + pos.y * 0.5;
		}
		me.drawImage();		

		// $("#animate").animate({
		// left : 2
		// }, {
		// duration : 100,
		// step : function(now, fx) {
		// console.log(now);
		//
		// if (now > 0) {
		// me.imgScale *= now;
		// me.imgX = me.imgX * now - pos.x;
		// me.imgY = me.imgY * now - pos.y;
		// me.drawImage();
		//				}
		//
		//			}
		//		});

	},

	windowToCanvas : function(canvas, x, y) {
		var bbox = canvas.getBoundingClientRect();
		return {
			x : x - bbox.left - (bbox.width - canvas.width) / 2,
			y : y - bbox.top - (bbox.height - canvas.height) / 2
		};
	},

	zoomInPicture : function() {
		var me = this;

		var panelX = me.getX() + me.getWidth() / 2;
		var panelY = me.getY() + me.getHeight() / 2;

		var pos = me.windowToCanvas(me.canvas, panelX, panelY);
		me.imgScale *= 2;
		this.imgX = me.imgX * 2 - pos.x;
		me.imgY = me.imgY * 2 - pos.y;
		me.drawImage();

	},
	zoomOutPicture : function() {
		var me = this;
		var panelX = me.getX() + me.getWidth() / 2;
		var panelY = me.getY() + me.getHeight() / 2;
		var pos = me.windowToCanvas(me.canvas, panelX, panelY);
		me.imgScale /= 2;
		me.imgX = me.imgX * 0.5 + pos.x * 0.5;
		me.imgY = me.imgY * 0.5 + pos.y * 0.5;
		me.drawImage();
	}
});
