/**
 * 图片编辑面板
 */
Ext.define('Project.component.PictureEditPanel', {
	extend : 'Ext.panel.Panel',
	alias : 'widget.pictureeditpanel',

	id : 'Project.component.PictureEditPanel',
	title : '图片编辑',

	jcropParams : {},// 裁剪参数

	initComponent : function() {
		var me = this;

		Ext.applyIf(me, {
			layout : 'border',
			bodyPadding : 5,
			html : '<div id="measure-panel" style="width:100%;height:100%"><canvas id="measure-img"></canvas></div>',
			listeners : {
				scope : me,
				render : me.canvasRender,
				resize : me.panelResize
			},
			dockedItems : [ {
				xtype : 'toolbar',
				items : [ {
					iconCls : 'shape_handles-16',
					tooltip : '图片裁剪',
					scope : me,
					handler : me.tailorPicture
				// enableToggle : true,
				// pressed : false
				}, {
					iconCls : 'page_white_paste-16',
					tooltip : '粘贴图片',
					listeners : {
						scope : me,
						click : me.buttonPastePicture
					}
				}, {
					iconCls : 'vector-16',
					tooltip : '粘贴图片',
					listeners : {
						scope : me,
						click : me.canvasLine
					}
				}, '->', {
					iconCls : 'cut_red-16',
					text : '裁剪',
					width : 60,
					scope : me,
					handler : me.processCropPicture
				}, {
					iconCls : 'arrow_turn_left-16',
					text : '取消',
					width : 60,
					scope : me,
					handler : me.undoCropPicture
				} ]
			} ]
		});

		me.callParent(arguments);
	},

	/**
	 * 处理裁剪图片
	 */
	processCropPicture : function() {

		var me = this;
		if (!me.img || !me.jcropImage) {
			Fly.msg('信息', '没有选择裁剪区域');
			return;
		}

		var is = me.img.src.split(',');

		me.jcropParams['cmf.imgSrc'] = is[1];
		me.jcropParams['cmf.imgType'] = is[0];

		Ext.Ajax.request({
			url : 'module/quality/cropMeasurePicture',
			params : me.jcropParams,
			success : function(response) {
				var res = JSON.parse(response.responseText);
				App.InterPath(res, function() {
					if (res.success) {
						// 调整大小时,如果已选择裁剪图片,那么就释放已选择的区域
						me.updateCanvasRegion();
						me.canvasInit(res.crop);
					} else {
						Fly.msg('信息', res.msg);
					}
				});
			},
			failure : function(response, opts) {
				App.Error(response);
			}
		});
	},

	/**
	 * 撤消图片裁剪
	 */
	undoCropPicture : function() {
		var me = this;
		if (me.jcropImage) {
			// 调整大小时,如果已选择裁剪图片,那么就释放已选择的区域
			me.updateCanvasRegion();
			me.canvasInit(me.img.src);

		}
	},

	/**
	 * 设置描绘的颜色
	 */
	setCanvasStrokeStyle : function(style) {
		this.context.strokeStyle = style;
	},

	/**
	 * 设置描绘线的宽度
	 */
	setCanvasLineWidth : function(width) {
		this.context.lineWidth = width;
	},

	/**
	 * 裁剪图片
	 */
	tailorPicture : function() {
		var me = this;

		$(function($) {
			$('#measure-img').Jcrop({
				bgColor : '#DFE8F6',
				bgOpacity : 0.4,
				onChange : me.jcropPreview,
				onSelect : me.jcropPreview,
				onRelease : function() {
				}

			}, function() {
				me.jcropImage = this;
			});
		});
		// var jcropHolder = $('.jcrop-holder')[0];

		// jcropHolderonmousedown = function(event) {
		// me.canvasonmousedown(event);
		// };
		//
		// jcropHolderonmousewheel = jcropHolder.onwheel = function(event) {
		// me.canvasonmousewheel(event);
		// };

		var jcropHolder = $('.jcrop-holder')[0];
		me.setComponentSizeAlignCenter(jcropHolder, parseInt(me.canvas.getAttribute('width')), parseInt(me.canvas.getAttribute('height')));
		jcropHolder.style.backgroundColor = '#DFE8F6';

	},

	/**
	 * 预览预裁剪的图片
	 */
	jcropPreview : function(c) {
		var me = Ext.getCmp('Project.component.PictureEditPanel');
		var bounds = me.jcropImage.getBounds();
		var boundx = bounds[0], boundy = bounds[1];
		var xsize = 274;// me.previewContainer.width();
		var ysize = 241;// me.previewContainer.height();

		var cs = c.w / c.h;

		if (cs >= 1) {
			ysize = xsize / cs;
			ysize = ysize > 241 ? 241 : ysize;
		} else {
			xsize = ysize * cs;
		}

		// 根据实际选取的裁剪图片尺寸动态调整预览窗口的尺寸与位置
		me.previewContainer.width(xsize);
		me.previewContainer.height(ysize);
		me.previewContainer.css('position', 'absolute');
		me.previewContainer.css('top', '50%');
		me.previewContainer.css('left', '50%');
		me.previewContainer.css('margin-top', ysize / -2);
		me.previewContainer.css('margin-left', xsize / -2);

		// me.imgScale = me.getImgScale(me.img.width, me.img.height);

		// 裁剪参数
		me.jcropParams = {
			"cmf.x" : Math.floor(c.x / me.imgScale),
			"cmf.y" : Math.floor(c.y / me.imgScale),
			"cmf.width" : Math.floor(c.w / me.imgScale),
			"cmf.height" : Math.floor(c.h / me.imgScale)
		};

		if (parseInt(c.w) > 0) {
			var rx = xsize / c.w;
			var ry = ysize / c.h;
			me.previewContainerImg.css({
				width : Math.round(rx * boundx) + 'px',
				height : Math.round(ry * boundy) + 'px',
				marginLeft : '-' + Math.round(rx * c.x) + 'px',
				marginTop : '-' + Math.round(ry * c.y) + 'px'
			});
		}
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

		var rw = width, rh = height;
		me.imgScale = me.getImgScale(me.img.width, me.img.height);
		rw = me.imgScale * me.img.width;
		rh = me.imgScale * me.img.height;

		if (me.jcropImage) {
			// 调整大小时,如果已选择裁剪图片,那么就释放已选择的区域
			me.updateCanvasRegion();
			me.canvasInit(me.img.src);

		} else {
			// 未选择裁剪图片
			// 重设图片canvas大小
			me.setComponentSizeAlignCenter(me.canvas, rw, rh);

		}

		me.drawImage();

		// 重设canvas的位置
		me.updatecanvasLocation();

	},

	/**
	 * 更新
	 */
	updateCanvasRegion : function() {
		var me = this;
		me.jcropImage.destroy();
		me.jcropImage = null;

		me.canvas = document.createElement('canvas');
		me.canvas.id = "measure-img";
		$('#measure-panel').append(me.canvas);
		me.context = me.canvas.getContext('2d');
		me.context.lineWidth = 10;
	},

	/**
	 * 更新板的位置
	 */
	updatecanvasLocation : function() {
		var me = this;
		var rect = me.canvas.getClientRects();
		xwy = rect[0];
		me.canvasx = rect[0].left;
		me.canvasy = rect[0].top;
	},

	/**
	 * 导入裁剪脚本
	 */
	importJcrop : function() {

		if ($.Jcrop) {
			return;
		}

		var jcropScript = document.createElement('script');
		jcropScript.src = 'jcrop/js/jquery.Jcrop.js';

		var colorScript = document.createElement('script');
		colorScript.src = 'jcrop/js/jquery.color.js';

		document.body.appendChild(jcropScript);
		document.body.appendChild(colorScript);
	},

	/**
	 * 渲染办图片处理介面
	 */
	canvasRender : function(panel, e) {
		var me = this;
		me.importJcrop();

		me.canvas = document.getElementById('measure-img');
		me.context = me.canvas.getContext('2d');
		me.context.lineWidth = 10;

		// 重设canvas的位置
		me.updatecanvasLocation();

		setTimeout(function() {
			var measurePanel = document.getElementById('measure-panel');

			// 根据图片尺寸调整显示面板大小,而不是根据浏览窗口大小调整
			// measureImg.attr('width', me.getWidth());
			// measureImg.attr('height', me.getHeight());

			// 设置图片拖放
			measurePanel.ondrop = me.dropFileUploadPreview;
			measurePanel.ondragenter = function() {
				return false;
			};
			measurePanel.ondragover = function() {
				return false;
			};

			me.pasteInit();

		}, 500);

	},

	/**
	 * 显示拖到浏览器中的图片
	 */
	dropFileUploadPreview : function(event) {

		event.stopPropagation();
		event.preventDefault();

		var aFile = event.dataTransfer.files;
		if (typeof FileReader == "undefined") {
			alert("浏览器不支持");
		}
		var i;

		for (i = 0; i < aFile.length; i++) {
			var tmp = aFile[i];
			var reader = new FileReader();
			reader.readAsDataURL(tmp);
			reader.onload = (function(f) {
				return function(e) {
					Ext.getCmp('Project.component.PictureEditPanel').canvasInit(e.target.result);
				};
			})(tmp);
		}

	},

	/**
	 * 初始化图片编辑区
	 */
	canvasInit : function(result) {
		var me = this;

		me.imgX = 0, me.imgY = 0;
		me.imgScale = 1;// 显示比例

		me.img = new Image();
		me.img.onload = function() {
			imgIsLoaded = true;
			me.drawImage();
		};
		me.img.src = result;

		// 根据显示区与图片的比例,来计算canvas的大小
		me.imgScale = me.getImgScale(me.img.width, me.img.height);

		me.setComponentSizeAlignCenter(me.canvas, me.imgScale * me.img.width, me.imgScale * me.img.height);

		// me.canvas.onmousedown = function(event) {
		// me.canvasonmousedown(event);
		// };

		// me.canvas.onmousewheel = me.canvas.onwheel = function(event) {
		// me.canvasonmousewheel(event);
		// };

		me.previewPanel = $('#preview-pane');
		me.previewContainer = $('#preview-pane .preview-container');
		me.previewContainerImg = $('#preview-pane .preview-container img');

		$('#preview-pane .preview-container img')[0].src = result;
	},

	/**
	 * 设置canvas水平上下居中及大小
	 */
	setComponentSizeAlignCenter : function(component, width, height) {

		if (component.toDataURL) {
			component.setAttribute('width', width);
			component.setAttribute('height', height);
		} else {
			component.style.width = width;
			component.style.height = height;
		}

		component.style.position = 'absolute';
		component.style.top = '50%';
		component.style.left = '50%';
		component.style.marginTop = (height / -2) + 'px';
		component.style.marginLeft = (width / -2) + 'px';
	},

	/**
	 * 重绘图形
	 */
	drawImage : function() {
		var me = this;
		if (!me.context || !me.img) {
			return;
		}
		me.imgScale = me.getImgScale(me.img.width, me.img.height);

		me.context.clearRect(0, 0, me.canvas.width, me.canvas.height);
		me.context.drawImage(me.img, 0, 0, me.img.width, me.img.height, me.imgX, me.imgY, me.img.width * me.imgScale, me.img.height * me.imgScale);

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

	},

	windowToCanvas : function(canvas, x, y) {
		var bbox = canvas.getBoundingClientRect();
		return {
			x : x - bbox.left - (bbox.width - canvas.width) / 2,
			y : y - bbox.top - (bbox.height - canvas.height) / 2
		};
	},

	buttonPastePicture : function(button, e) {
		// button.fireEvent("paste",Ext.getBody());
	},

	/**
	 * 初始化图形paste事件
	 */
	pasteInit : function() {
		if (!isAddPricturePasteListener) {
			document.body.addEventListener("paste", function(e) {
				try {
					Ext.getCmp('Project.component.PictureEditPanel').pastePicture(e);
				} catch (e) {
				}
			});
			isAddPricturePasteListener = true;
		}
	},

	/**
	 * 粘贴图形
	 */
	pastePicture : function(e) {
		var me = this;
		for (var i = 0; i < e.clipboardData.items.length; i++) {

			if (e.clipboardData.items[i].kind == "file" && e.clipboardData.items[i].type == "image/png") {

				// get the blob
				var imageFile = e.clipboardData.items[i].getAsFile();

				// read the blob as a data URL
				var fileReader = new FileReader();
				fileReader.onloadend = function(e) {
					me.canvasInit(this.result);
				};
				fileReader.readAsDataURL(imageFile);

				// prevent the default paste action
				e.preventDefault();
				break;
			}
		}
	},

	/**
	 * 在图片上划线
	 */
	canvasLine : function() {
		var me = this;

		var sx, sy;
		// me.context.strokeStyle = "#99cc33";
		// me.context.lineWidth=1;
		me.canvas.onmousedown = function(e) {

			// me.canvas.style.cursor = 'url(image/icons/accept.png)';

			sx = e.x - me.canvasx;
			sy = e.y - me.canvasy;
			me.context.moveTo(sx, sy);

			me.canvas.onmousemove = function(e) {
				me.context.lineTo(e.x - me.canvasx, e.y - me.canvasy);
				// me.context.rect(sx, sy, e.x - me.canvasx, e.y - me.canvasy);
				// me.context.strokeRect(sx,sy,e.x - me.canvasx, e.y -
				// me.canvasy);
				// console.log((e.x - me.canvasx) + ' ' + (e.y - me.canvasy));
				// me.context.clip();

				me.context.stroke();
			};

			me.canvas.onmouseup = function(e) {
				// me.canvas.style.cursor = 'pointer';
				me.canvas.onmousemove = null;
				me.canvas.onmouseup = null;
			};
		};

	}
});
