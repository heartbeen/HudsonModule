// TODO 获取浏览器等相关信息
// =============================================================================================================
var Monitor = {
	// 屏幕分辨率宽
	width : window.screen.width,
	// 屏幕分辨率高
	height : window.screen.height,
	// 网页正文部分上
	top : window.screenTop,
	// 网页正文部分左
	left : window.screenLeft,
	// 可用工作区高度
	avaht : window.screen.availHeight,
	// 可用工作区宽度
	avawd : window.screen.availWidth,
	// 屏幕色彩位
	cdepth : window.screen.colorDepth,
	// 屏幕采用的单位类型(英寸/像素)
	devXdpi : window.screen.deviceXDPI,
	/**
	 * 返回指定比率的屏幕尺寸
	 * 
	 * @param ratio
	 * @returns {___anonymous579_672}
	 */
	ratioRect : function(ratio) {
		return {
			x : Arith.round(this.width * ratio, 0),
			y : Arith.round(this.height * ratio, 0)
		};
	}
};

var Arith = {
	/**
	 * 四舍五入
	 * 
	 * @param val
	 * @param dec
	 * @returns
	 */
	round : function(val, dec) {
		return Arith.roundRef(val, dec, val);
	},
	/**
	 * 数字的四舍五入
	 * 
	 * @param val
	 * @param dec
	 * @param def
	 * @returns
	 */
	roundRef : function(val, dec, def) {
		try {
			var baseNumber = Math.pow(10, dec);
			return Math.round(val * baseNumber) / baseNumber;
		} catch (e) {
			return def;
		}
	},
	/**
	 * 转化其他类型为整形异常的用def的内容代替
	 * 
	 * @param val
	 * @param def
	 * @returns
	 */
	toIntRef : function(val, def) {
		try {
			return parseInt(val);
		} catch (e) {
			return def;
		}
	},
	/**
	 * 转化其他类型为整形
	 * 
	 * @param val
	 * @returns
	 */
	toInt : function(val) {
		return toIntRef(val, val);
	}
};