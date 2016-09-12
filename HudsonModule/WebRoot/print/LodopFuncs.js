var CreatedOKLodop7766 = null;

function getLodop(oOBJECT, oEMBED) {
	var LODOP = null;
	// =====判断浏览器类型:===============
	var isIE = (navigator.userAgent.indexOf('MSIE') >= 0) || (navigator.userAgent.indexOf('Trident') >= 0);
	var is64IE = isIE && (navigator.userAgent.indexOf('x64') >= 0);
	var is64 = navigator.userAgent.indexOf('x64') >= 0;
	try {
		// =====如果页面有Lodop就直接使用，没有则新建:==========
		if (oOBJECT != undefined || oEMBED != undefined) {
			if (isIE)
				LODOP = oOBJECT;
			else
				LODOP = oEMBED;
		} else {
			if (CreatedOKLodop7766 == null) {
				LODOP = document.createElement("object");
				LODOP.setAttribute("width", 0);
				LODOP.setAttribute("height", 0);
				LODOP.setAttribute("style", "position:absolute;left:0px;top:-100px;width:0px;height:0px;");
				if (isIE)
					LODOP.setAttribute("classid", "clsid:2105C259-1E0C-4534-8141-A753534CB4CA");
				else
					LODOP.setAttribute("type", "application/x-print-lodop");
				document.documentElement.appendChild(LODOP);
				CreatedOKLodop7766 = LODOP;
			} else
				LODOP = CreatedOKLodop7766;
		}
		;
		// =====判断Lodop插件是否安装过，没有安装或版本过低就提示下载安装:==========
		if (typeof (LODOP.VERSION) == "undefined") {
			Ext.MessageBox.show({
				title : '打印程序下载',
				msg : '当前没有安装条码打印程序,请确认后下载!<br>安装后请重新登录系统!',
				buttons : Ext.MessageBox.YESNO,
				icon : 'x-message-box-info',
				fn : function(btn) {
					if (btn == 'yes') {
						window.location = 'print/install_lodop' + (is64 ? '64' : '32') + '.exe';
					}
				}

			});
			LODOP = null;
		}
		LODOP.SET_LICENSES("广州交通信息化建设投资营运有限公司", "864607380837275858895969799998", "", "");
		return LODOP;
	} catch (err) {
		if (is64IE)
			document.documentElement.innerHTML = "Error:" + strHtm64_Install + document.documentElement.innerHTML;
		else
			document.documentElement.innerHTML = "Error:" + strHtmInstall + document.documentElement.innerHTML;
		return LODOP;
	}
	;
}
