<%@ page language="java" import="java.util.*" pageEncoding="utf-8"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
<base href="${basePath }">

<title>MPMS</title>
<!-- <meta http-equiv="pragma" content="no-cache">
<meta http-equiv="cache-control" content="no-cache"> -->
<meta http-equiv="expires" content="0">
<meta http-equiv="keywords" content="keyword1,keyword2,keyword3">
<meta http-equiv="description" content="This is my page">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />

<link rel="stylesheet" type="text/css" href="css/desktop.css?${time}" />
<link rel="stylesheet" type="text/css" href="css/render.css?${time}" />
<link rel="stylesheet" type="text/css" href="css/icon.css?" />
<link rel="stylesheet" type="text/css" href="css/portal.css?${time}" />

<link href="js/component/css/toolbar.css" rel="stylesheet"
	type="text/css" />

<link href="ext4.2/resources/css/ext-all.css" rel="stylesheet"
	type="text/css" />
<script type="text/javascript" src="ext4.2/ext-all.js"></script>
<script type="text/javascript"
	src="ext4.2\packages\ext-theme-gray\build\ext-theme-gray.js"></script>

<!-- gantt component-->
<link href="ext-gantt/resources/css/sch-gantt-all.css" rel="stylesheet"
	type="text/css" />
<script src="ext-gantt/gnt-all-debug.js" type="text/javascript"></script>
<script src="ext-gantt/sch-lang-${lang}.js" type="text/javascript"></script>

<script type="text/javascript"
	src="ext4.2/packages/sys_${lang}.js?${time}"></script>
<script type="text/javascript"
	src="ext4.2/packages/ext-locale-${lang}/ext-locale-${lang}.js"></script>
<!--script type="text/javascript"
	src="ext4.2/extexcel/export-all.js"></script-->

<script type="text/javascript" src="js/shared/public.js?${time}"></script>
<script type="text/javascript" src="js/shared/const.js?${time}"></script>
<script type="text/javascript" src="js/FocusUtils.js"></script>

<link href="qtip/jquery.qtip.min.css" rel="stylesheet" type="text/css" />
<script type="text/javascript" src="qtip/jquery-1.10.2.min.js"></script>
<script type="text/javascript" src="qtip/jquery.qtip.min.js"></script>
<script type="text/javascript" src="jquery/jquery-barcode-last.min.js"></script>
<script>
	var factoryName = "和诚锴诚";
	var factoryWeb = "#";
</script>
<script src="highchart/js/highcharts.js"></script>
<script src="highchart/js/themes/sand-signika.js"></script>
<script src="highchart/js/modules/exporting.src.js"></script>
<script src="vis/vis.min.js"></script>
<link href="vis/vis.min.css" rel="stylesheet" type="text/css" />
<script language="javascript" src="print/LodopFuncs.js"></script>
<script type="text/javascript" src="print/jquery.jqprint-0.3.js"></script>
<script type="text/javascript" src="print/jquery-migrate-1.1.0.js"></script>

<script language="javascript" src="layer/layer.min.js"></script>
<!--  <script type="text/javascript" src="js/design/DateTimeField4.2.js"></script>
<script type="text/javascript" src="js/design/DateTimePicker4.2.js"></script>-->
<script type="text/javascript">
	NowDate = new Date(${time});// 当前时间--与服务器同步
	localLang = '${lang}';

	// 用于判断系统是否登录
	var USER_LOGIN = false;

	// 用户功能全局变量
	UserWork = [ 'Ext.window.MessageBox', 'Ext.ux.desktop.ShortcutModel', 'MyDesktop.Settings', 'MyDesktop.VideoWindow', 'MyDesktop.TabWindow',
			'MyDesktop.BogusMenuModule', 'MyDesktop.BogusModule' ];// 用户所有功能名数组

	function forbidBackSpace(e) {
		var ev = e || window.event; //获取event对象
		var obj = ev.target || ev.srcElement; //获取事件源 
		var t = obj.type || obj.getAttribute('type'); //获取事件源类型 
		//获取作为判断条件的事件类型 
		var vReadOnly = obj.readOnly;
		var vDisabled = obj.disabled;
		//处理undefined值情况 
		vReadOnly = (vReadOnly == undefined) ? false : vReadOnly;
		vDisabled = (vDisabled == undefined) ? true : vDisabled;

		if (ev && (ev.keyCode == 27 || ev.keyCode == 9)) {
			ev.keyCode = 0;
			ev.returnValue = false;
			return;
		}

		//当敲Backspace键时，事件源类型为密码或单行、多行文本的， 
		//并且readOnly属性为true或disabled属性为true的，则退格键失效 
		var flag1 = ev.keyCode == 8 && (t == "password" || t == "text" || t == "textarea") && (vReadOnly == true || vDisabled == true);
		//当敲Backspace键时，事件源类型非密码或单行、多行文本的，则退格键失效 
		var flag2 = ev.keyCode == 8 && t != "password" && t != "text" && t != "textarea";
		//判断 
		if (flag2 || flag1)
			return false;
	}

	document.onkeypress = forbidBackSpace;
	//禁止后退键  作用于IE、Chrome
	document.onkeydown = forbidBackSpace;
</script>

<script type="text/javascript" src="Home.js"></script>
<style>
body {
	font-family: 华文细黑, "Microsoft YaHei", Tahoma, Verdana, "SimSun",
		"Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei",
		sans-serif;
	/*禁用双击选择文本， css方法*/
	-moz-user-select: none;
	-webkit-user-select: none;
	background: #2F4F4F
}

#bg-div {
	position: absolute;
	width: 400;
	height: 200;
	/*background-image: url(images/bg-panel.jpg) !important;*/
	top: 50%;
	left: 50%;
	margin-left: -200px;
	margin-top: -100px;
	/**background: white;*/
}

#login {
	position: relative;
	top: -100;
	left: 170;
	width: 300;
	/**background: yellow*/
}

#logo-img {
	position: relative;
	top: 30px;
	left: 30px;
}

#fooler {
	position: absolute;
	left: 30px;
	bottom: 30px;
	color: #737573;
	width: 748px;
}

#fooler div {
	float: right;
}

#theme-div {
	
}
</style>

</head>
<body onmousemove="active();" oncontextmenu="return false">
	<div id="bg-div">
		<div id="theme-div"></div>
		<img id="logo-img" src="images/admin.png?${time }"></img>
		<div id="login">
			<span id="login-error"
				style="visibility:hidden;color:#f7626d;font-weight: bold;font-size: 14px;">
				${error} </span>
			<div id="login-region"></div>
		</div>
		<!-- <div id="fooler"></div> -->
	</div>
	<div id="animate" style="display:none;"></div>
	<script>
		document.getElementById('login-error').innerText = Login.error;
		//document.getElementById('fooler').innerHTML = '<span>&copy;&nbsp;</span>和誠鍇誠<div>' + Login.website + ':<a href="#"></a></div>';
		function active() {
			StartTime = new Date();
		}
		$.fn.qtip.zindex = 20000;
	</script>
</body>
</html>

