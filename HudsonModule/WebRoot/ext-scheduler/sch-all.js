/*version 2.2.22*/
Ext.define("Sch.locale.Locale", {
	l10n : null,
	legacyMode : true,
	localeName : null,
	namespaceId : null,
	constructor : function() {
		if (!Sch.locale.Active) {
			Sch.locale.Active = {};
			this.bindRequire()
		}
		var d = this.self.getName().split(".");
		var e = this.localeName = d.pop();
		this.namespaceId = d.join(".");
		var f = Sch.locale.Active[this.namespaceId];
		if (!(e == "En" && f && f.localeName != "En")) {
			this.apply()
		}
	},
	bindRequire : function() {
		var b = Ext.ClassManager.triggerCreated;
		Ext.ClassManager.triggerCreated = function(e) {
			b.apply(this, arguments);
			var f = Ext.ClassManager.get(e);
			for ( var a in Sch.locale.Active) {
				Sch.locale.Active[a].apply(f)
			}
		}
	},
	apply : function(r) {
		if (this.l10n) {
			var k = this, m, n;
			var l = this.self.getName();
			var o = function(b, c) {
				c = c || Ext.ClassManager.get(b);
				if (c && (c.activeLocaleId !== l)) {
					var d = k.l10n[b];
					if (typeof d === "function") {
						d(b)
					} else {
						if (c.singleton) {
							c.l10n = Ext.apply(c.l10n || {}, d)
						} else {
							Ext.override(c, {
								l10n : d
							})
						}
					}
					if (k.legacyMode) {
						var e;
						if (c.prototype) {
							e = c.prototype
						} else {
							if (c.singleton) {
								e = c
							}
						}
						if (e && e.legacyMode) {
							if (e.legacyHolderProp) {
								if (!e[e.legacyHolderProp]) {
									e[e.legacyHolderProp] = {}
								}
								e = e[e.legacyHolderProp]
							}
							for ( var a in d) {
								if (typeof e[a] !== "function") {
									e[a] = d[a]
								}
							}
						}
					}
					c.activeLocaleId = l;
					if (c.onLocalized) {
						c.onLocalized()
					}
				}
			};
			if (r) {
				if (!Ext.isArray(r)) {
					r = [ r ]
				}
				var q, i;
				for (m = 0, n = r.length; m < n; m++) {
					if (Ext.isObject(r[m])) {
						if (r[m].singleton) {
							i = r[m];
							q = Ext.getClassName(Ext.getClass(i))
						} else {
							i = Ext.getClass(r[m]);
							q = Ext.getClassName(i)
						}
					} else {
						i = null;
						q = "string" === typeof r[m] ? r[m] : Ext.getClassName(r[m])
					}
					if (q && q in this.l10n) {
						o(q, i)
					}
				}
			} else {
				Sch.locale.Active[this.namespaceId] = this;
				for ( var p in this.l10n) {
					o(p)
				}
			}
		}
	}
});

Ext.define("Sch.util.Patch", {
	target : null,
	minVersion : null,
	maxVersion : null,
	reportUrl : null,
	description : null,
	applyFn : null,
	ieOnly : false,
	overrides : null,
	onClassExtended : function(d, c) {
		if (Sch.disableOverrides) {
			return
		}
		if (c.ieOnly && !Ext.isIE) {
			return
		}
		if ((!c.minVersion || Ext.versions.extjs.equals(c.minVersion) || Ext.versions.extjs.isGreaterThan(c.minVersion))
				&& (!c.maxVersion || Ext.versions.extjs.equals(c.maxVersion) || Ext.versions.extjs.isLessThan(c.maxVersion))) {
			if (c.applyFn) {
				c.applyFn()
			} else {
				Ext.ClassManager.get(c.target).override(c.overrides)
			}
		}
	}
});
Ext.define("Sch.patches.ColumnResize", {
	override : "Sch.panel.TimelineGridPanel",
	afterRender : function() {
		this.callParent(arguments);
		var b = this.lockedGrid.headerCt.findPlugin("gridheaderresizer");
		if (b) {
			b.getConstrainRegion = function() {
				var e = this, a = e.dragHd.el, f;
				if (e.headerCt.forceFit) {
					f = e.dragHd.nextNode("gridcolumn:not([hidden]):not([isGroupHeader])");
					if (!e.headerInSameGrid(f)) {
						f = null
					}
				}
				return e.adjustConstrainRegion(Ext.util.Region.getRegion(a), 0, e.headerCt.forceFit ? (f ? f.getWidth() - e.minColWidth : 0)
						: e.maxColWidth - a.getWidth(), 0, e.minColWidth)
			}
		}
	}
});
Ext.define("Sch.patches.ColumnResizeTree", {
	override : "Sch.panel.TimelineTreePanel",
	afterRender : function() {
		this.callParent(arguments);
		var b = this.lockedGrid.headerCt.findPlugin("gridheaderresizer");
		if (b) {
			b.getConstrainRegion = function() {
				var e = this, a = e.dragHd.el, f;
				if (e.headerCt.forceFit) {
					f = e.dragHd.nextNode("gridcolumn:not([hidden]):not([isGroupHeader])");
					if (!e.headerInSameGrid(f)) {
						f = null
					}
				}
				return e.adjustConstrainRegion(Ext.util.Region.getRegion(a), 0, e.headerCt.forceFit ? (f ? f.getWidth() - e.minColWidth : 0)
						: e.maxColWidth - a.getWidth(), 0, e.minColWidth)
			}
		}
	}
});
if (!Ext.ClassManager.get("Sch.patches.ElementScroll")) {
	Ext.define("Sch.patches.ElementScroll", {
		override : "Sch.mixin.TimelineView",
		_onAfterRender : function() {
			this.callParent(arguments);
			if (Ext.versions.extjs.isLessThan("4.2.1") || Ext.versions.extjs.isGreaterThan("4.2.2")) {
				return
			}
			this.el.scroll = function(j, r, p) {
				if (!this.isScrollable()) {
					return false
				}
				j = j.substr(0, 1);
				var k = this, n = k.dom, l = j === "r" || j === "l" ? "left" : "top", q = false, o, m;
				if (j === "r" || j === "t" || j === "u") {
					r = -r
				}
				if (l === "left") {
					o = n.scrollLeft;
					m = k.constrainScrollLeft(o + r)
				} else {
					o = n.scrollTop;
					m = k.constrainScrollTop(o + r)
				}
				if (m !== o) {
					this.scrollTo(l, m, p);
					q = true
				}
				return q
			}
		}
	})
}
Ext.define("Sch.mixin.Localizable", {
	requires : [ "Sch.locale.En" ],
	legacyMode : true,
	activeLocaleId : "",
	l10n : null,
	isLocaleApplied : function() {
		var c = (this.singleton && this.activeLocaleId) || this.self.activeLocaleId;
		if (!c) {
			return false
		}
		for ( var d in Sch.locale.Active) {
			if (c === Sch.locale.Active[d].self.getName()) {
				return true
			}
		}
		return false
	},
	applyLocale : function() {
		for ( var b in Sch.locale.Active) {
			Sch.locale.Active[b].apply(this.singleton ? this : this.self.getName())
		}
	},
	L : function() {
		return this.localize.apply(this, arguments)
	},
	localize : function(q, o, l) {
		if (!this.isLocaleApplied() && !l) {
			this.applyLocale()
		}
		if (this.hasOwnProperty("l10n") && this.l10n.hasOwnProperty(q) && "function" != typeof this.l10n[q]) {
			return this.l10n[q]
		}
		var p = this.self && this.self.prototype;
		if (this.legacyMode) {
			var r = o || this.legacyHolderProp;
			var k = r ? this[r] : this;
			if (k && k.hasOwnProperty(q) && "function" != typeof k[q]) {
				return k[q]
			}
			if (p) {
				var n = r ? p[r] : p;
				if (n && n.hasOwnProperty(q) && "function" != typeof n[q]) {
					return n[q]
				}
			}
		}
		var j = p.l10n[q];
		if (j === null || j === undefined) {
			var m = p && p.superclass;
			if (m && m.localize) {
				j = m.localize(q, o, l)
			}
			if (j === null || j === undefined) {
				throw "Cannot find locale: " + q + " [" + this.self.getName() + "]"
			}
		}
		return j
	}
});
Ext
		.define(
				"Sch.tooltip.ClockTemplate",
				{
					extend : "Ext.XTemplate",
					constructor : function() {
						var r = Math.PI / 180, o = Math.cos, q = Math.sin, n = 7, x = 2, w = 10, p = 6, u = 3, z = 10, v = Ext.isIE
								&& (Ext.isIE8m || Ext.isIEQuirks);
						function y(e) {
							var b = e * r, d = o(b), h = q(b), a = p * q((90 - e) * r), i = p * o((90 - e) * r), g = Math.min(p, p - a), c = e > 180 ? i
									: 0, f = "progid:DXImageTransform.Microsoft.Matrix(sizingMethod='auto expand', M11 = " + d + ", M12 = " + (-h)
									+ ", M21 = " + h + ", M22 = " + d + ")";
							return Ext.String.format("filter:{0};-ms-filter:{0};top:{1}px;left:{2}px;", f, g + u, c + z)
						}
						function s(e) {
							var b = e * r, d = o(b), h = q(b), a = n * q((90 - e) * r), i = n * o((90 - e) * r), g = Math.min(n, n - a), c = e > 180 ? i
									: 0, f = "progid:DXImageTransform.Microsoft.Matrix(sizingMethod='auto expand', M11 = " + d + ", M12 = " + (-h)
									+ ", M21 = " + h + ", M22 = " + d + ")";
							return Ext.String.format("filter:{0};-ms-filter:{0};top:{1}px;left:{2}px;", f, g + x, c + w)
						}
						function t(a) {
							return Ext.String
									.format(
											"transform:rotate({0}deg);-ms-transform:rotate({0}deg);-moz-transform: rotate({0}deg);-webkit-transform: rotate({0}deg);-o-transform:rotate({0}deg);",
											a)
						}
						this
								.callParent([
										'<div class="sch-clockwrap {cls}"><div class="sch-clock"><div class="sch-hourIndicator" style="{[this.getHourStyle((values.date.getHours()%12) * 30)]}">{[Ext.Date.monthNames[values.date.getMonth()].substr(0,3)]}</div><div class="sch-minuteIndicator" style="{[this.getMinuteStyle(values.date.getMinutes() * 6)]}">{[values.date.getDate()]}</div></div><span class="sch-clock-text">{text}</span></div>',
										{
											compiled : true,
											disableFormats : true,
											getMinuteStyle : v ? s : t,
											getHourStyle : v ? y : t
										} ])
					}
				});
Ext.define("Sch.tooltip.Tooltip", {
	extend : "Ext.tip.ToolTip",
	requires : [ "Sch.tooltip.ClockTemplate" ],
	autoHide : false,
	anchor : "b",
	padding : "0 3 0 0",
	showDelay : 0,
	hideDelay : 0,
	quickShowInterval : 0,
	dismissDelay : 0,
	trackMouse : false,
	valid : true,
	anchorOffset : 5,
	shadow : false,
	frame : false,
	constructor : function(c) {
		var d = new Sch.tooltip.ClockTemplate();
		this.renderTo = document.body;
		this.startDate = this.endDate = new Date();
		if (!this.template) {
			this.template = Ext.create("Ext.XTemplate", '<div class="{[values.valid ? "sch-tip-ok" : "sch-tip-notok"]}">',
					'{[this.renderClock(values.startDate, values.startText, "sch-tooltip-startdate")]}',
					'{[this.renderClock(values.endDate, values.endText, "sch-tooltip-enddate")]}', "</div>", {
						compiled : true,
						disableFormats : true,
						renderClock : function(b, a, f) {
							return d.apply({
								date : b,
								text : a,
								cls : f
							})
						}
					})
		}
		this.callParent(arguments)
	},
	update : function(h, j, k, i) {
		if (this.startDate - h !== 0 || this.endDate - j !== 0 || this.valid !== k || i) {
			this.startDate = h;
			this.endDate = j;
			this.valid = k;
			var l = this.schedulerView.getFormattedDate(h), g = this.schedulerView.getFormattedEndDate(j, h);
			if (this.mode === "calendar" && j.getHours() === 0 && j.getMinutes() === 0
					&& !(j.getYear() === h.getYear() && j.getMonth() === h.getMonth() && j.getDate() === h.getDate())) {
				j = Sch.util.Date.add(j, Sch.util.Date.DAY, -1)
			}
			this.callParent([ this.template.apply({
				valid : k,
				startDate : h,
				endDate : j,
				startText : l,
				endText : g
			}) ])
		}
	},
	show : function(c, d) {
		if (!c) {
			return
		}
		d = d || 18;
		if (Sch.util.Date.compareUnits(this.schedulerView.getTimeResolution().unit, Sch.util.Date.DAY) >= 0) {
			this.mode = "calendar";
			this.addCls("sch-day-resolution")
		} else {
			this.mode = "clock";
			this.removeCls("sch-day-resolution")
		}
		this.mouseOffsets = [ d - 18, -7 ];
		this.setTarget(c);
		this.callParent();
		this.alignTo(c, "bl-tl", this.mouseOffsets);
		this.mon(Ext.getDoc(), "mousemove", this.onMyMouseMove, this);
		this.mon(Ext.getDoc(), "mouseup", this.onMyMouseUp, this, {
			single : true
		})
	},
	onMyMouseMove : function() {
		this.el.alignTo(this.target, "bl-tl", this.mouseOffsets)
	},
	onMyMouseUp : function() {
		this.mun(Ext.getDoc(), "mousemove", this.onMyMouseMove, this)
	},
	afterRender : function() {
		this.callParent(arguments);
		this.el.on("mouseenter", this.onElMouseEnter, this)
	},
	onElMouseEnter : function() {
		this.alignTo(this.target, "bl-tl", this.mouseOffsets)
	}
});
Ext.define("Sch.util.Date", {
	requires : "Ext.Date",
	mixins : [ "Sch.mixin.Localizable" ],
	singleton : true,
	stripEscapeRe : /(\\.)/g,
	hourInfoRe : /([gGhHisucUOPZ]|MS)/,
	unitHash : null,
	unitsByName : {},
	constructor : function() {
		var e = Ext.Date;
		var f = this.unitHash = {
			MILLI : e.MILLI,
			SECOND : e.SECOND,
			MINUTE : e.MINUTE,
			HOUR : e.HOUR,
			DAY : e.DAY,
			WEEK : "w",
			MONTH : e.MONTH,
			QUARTER : "q",
			YEAR : e.YEAR
		};
		Ext.apply(this, f);
		var d = this;
		this.units = [ d.MILLI, d.SECOND, d.MINUTE, d.HOUR, d.DAY, d.WEEK, d.MONTH, d.QUARTER, d.YEAR ]
	},
	onLocalized : function() {
		this.setUnitNames(this.L("unitNames"))
	},
	setUnitNames : function(i, g) {
		var j = this.unitsByName = {};
		this.l10n.unitNames = i;
		this._unitNames = Ext.apply({}, i);
		var l = this.unitHash;
		for ( var h in l) {
			if (l.hasOwnProperty(h)) {
				var k = l[h];
				this._unitNames[k] = this._unitNames[h];
				j[h] = k;
				j[k] = k
			}
		}
	},
	betweenLesser : function(e, g, f) {
		var h = e.getTime();
		return g.getTime() <= h && h < f.getTime()
	},
	constrain : function(d, f, e) {
		return this.min(this.max(d, f), e)
	},
	compareUnits : function(h, e) {
		var f = Ext.Array.indexOf(this.units, h), g = Ext.Array.indexOf(this.units, e);
		return f > g ? 1 : (f < g ? -1 : 0)
	},
	isUnitGreater : function(c, d) {
		return this.compareUnits(c, d) > 0
	},
	copyTimeValues : function(c, d) {
		c.setHours(d.getHours());
		c.setMinutes(d.getMinutes());
		c.setSeconds(d.getSeconds());
		c.setMilliseconds(d.getMilliseconds())
	},
	add : function(d, j, i) {
		var h = Ext.Date.clone(d);
		if (!j || i === 0) {
			return h
		}
		switch (j.toLowerCase()) {
		case this.MILLI:
			h = new Date(d.getTime() + i);
			break;
		case this.SECOND:
			h = new Date(d.getTime() + (i * 1000));
			break;
		case this.MINUTE:
			h = new Date(d.getTime() + (i * 60000));
			break;
		case this.HOUR:
			h = new Date(d.getTime() + (i * 3600000));
			break;
		case this.DAY:
			h.setDate(d.getDate() + i);
			break;
		case this.WEEK:
			h.setDate(d.getDate() + i * 7);
			break;
		case this.MONTH:
			var g = d.getDate();
			if (g > 28) {
				g = Math.min(g, Ext.Date.getLastDateOfMonth(this.add(Ext.Date.getFirstDateOfMonth(d), this.MONTH, i)).getDate())
			}
			h.setDate(g);
			h.setMonth(h.getMonth() + i);
			break;
		case this.QUARTER:
			h = this.add(d, this.MONTH, i * 3);
			break;
		case this.YEAR:
			h.setFullYear(d.getFullYear() + i);
			break
		}
		return h
	},
	getUnitDurationInMs : function(b) {
		return this.add(new Date(1, 0, 1), b, 1) - new Date(1, 0, 1)
	},
	getMeasuringUnit : function(b) {
		if (b === this.WEEK) {
			return this.DAY
		}
		return b
	},
	getDurationInUnit : function(h, g, j, i) {
		var f;
		switch (j) {
		case this.YEAR:
			f = this.getDurationInYears(h, g);
			break;
		case this.QUARTER:
			f = this.getDurationInMonths(h, g) / 3;
			break;
		case this.MONTH:
			f = this.getDurationInMonths(h, g);
			break;
		case this.WEEK:
			f = this.getDurationInDays(h, g) / 7;
			break;
		case this.DAY:
			f = this.getDurationInDays(h, g);
			break;
		case this.HOUR:
			f = this.getDurationInHours(h, g);
			break;
		case this.MINUTE:
			f = this.getDurationInMinutes(h, g);
			break;
		case this.SECOND:
			f = this.getDurationInSeconds(h, g);
			break;
		case this.MILLI:
			f = this.getDurationInMilliseconds(h, g);
			break
		}
		return i ? f : Math.round(f)
	},
	getUnitToBaseUnitRatio : function(c, d) {
		if (c === d) {
			return 1
		}
		switch (c) {
		case this.YEAR:
			switch (d) {
			case this.QUARTER:
				return 1 / 4;
			case this.MONTH:
				return 1 / 12
			}
			break;
		case this.QUARTER:
			switch (d) {
			case this.YEAR:
				return 4;
			case this.MONTH:
				return 1 / 3
			}
			break;
		case this.MONTH:
			switch (d) {
			case this.YEAR:
				return 12;
			case this.QUARTER:
				return 3
			}
			break;
		case this.WEEK:
			switch (d) {
			case this.DAY:
				return 1 / 7;
			case this.HOUR:
				return 1 / 168
			}
			break;
		case this.DAY:
			switch (d) {
			case this.WEEK:
				return 7;
			case this.HOUR:
				return 1 / 24;
			case this.MINUTE:
				return 1 / 1440
			}
			break;
		case this.HOUR:
			switch (d) {
			case this.DAY:
				return 24;
			case this.MINUTE:
				return 1 / 60
			}
			break;
		case this.MINUTE:
			switch (d) {
			case this.HOUR:
				return 60;
			case this.SECOND:
				return 1 / 60;
			case this.MILLI:
				return 1 / 60000
			}
			break;
		case this.SECOND:
			switch (d) {
			case this.MILLI:
				return 1 / 1000
			}
			break;
		case this.MILLI:
			switch (d) {
			case this.SECOND:
				return 1000
			}
			break
		}
		return -1
	},
	getDurationInMilliseconds : function(c, d) {
		return (d - c)
	},
	getDurationInSeconds : function(c, d) {
		return (d - c) / 1000
	},
	getDurationInMinutes : function(c, d) {
		return (d - c) / 60000
	},
	getDurationInHours : function(c, d) {
		return (d - c) / 3600000
	},
	getDurationInDays : function(f, d) {
		var e = f.getTimezoneOffset() - d.getTimezoneOffset();
		return (d - f + e * 60 * 1000) / 86400000
	},
	getDurationInBusinessDays : function(i, d) {
		var l = Math.round((d - i) / 86400000), h = 0, j;
		for (var k = 0; k < l; k++) {
			j = this.add(i, this.DAY, k).getDay();
			if (j !== 6 && j !== 0) {
				h++
			}
		}
		return h
	},
	getDurationInMonths : function(c, d) {
		return ((d.getFullYear() - c.getFullYear()) * 12) + (d.getMonth() - c.getMonth())
	},
	getDurationInYears : function(c, d) {
		return this.getDurationInMonths(c, d) / 12
	},
	min : function(c, d) {
		return c < d ? c : d
	},
	max : function(c, d) {
		return c > d ? c : d
	},
	intersectSpans : function(h, g, e, f) {
		return this.betweenLesser(h, e, f) || this.betweenLesser(e, h, g)
	},
	getNameOfUnit : function(b) {
		b = this.getUnitByName(b);
		switch (b.toLowerCase()) {
		case this.YEAR:
			return "YEAR";
		case this.QUARTER:
			return "QUARTER";
		case this.MONTH:
			return "MONTH";
		case this.WEEK:
			return "WEEK";
		case this.DAY:
			return "DAY";
		case this.HOUR:
			return "HOUR";
		case this.MINUTE:
			return "MINUTE";
		case this.SECOND:
			return "SECOND";
		case this.MILLI:
			return "MILLI"
		}
		throw "Incorrect UnitName"
	},
	getReadableNameOfUnit : function(c, d) {
		if (!this.isLocaleApplied()) {
			this.applyLocale()
		}
		return this._unitNames[c][d ? "plural" : "single"]
	},
	getShortNameOfUnit : function(b) {
		if (!this.isLocaleApplied()) {
			this.applyLocale()
		}
		return this._unitNames[b].abbrev
	},
	getUnitByName : function(b) {
		if (!this.isLocaleApplied()) {
			this.applyLocale()
		}
		if (!this.unitsByName[b]) {
			Ext.Error.raise("Unknown unit name: " + b)
		}
		return this.unitsByName[b]
	},
	getNext : function(n, j, i, k) {
		var l = Ext.Date.clone(n);
		k = arguments.length < 4 ? 1 : k;
		i = i == null ? 1 : i;
		switch (j) {
		case this.MILLI:
			l = this.add(n, j, i);
			break;
		case this.SECOND:
			l = this.add(n, j, i);
			if (l.getMilliseconds() > 0) {
				l.setMilliseconds(0)
			}
			break;
		case this.MINUTE:
			l = this.add(n, j, i);
			if (l.getSeconds() > 0) {
				l.setSeconds(0)
			}
			if (l.getMilliseconds() > 0) {
				l.setMilliseconds(0)
			}
			break;
		case this.HOUR:
			l = this.add(n, j, i);
			if (l.getMinutes() > 0) {
				l.setMinutes(0)
			}
			if (l.getSeconds() > 0) {
				l.setSeconds(0)
			}
			if (l.getMilliseconds() > 0) {
				l.setMilliseconds(0)
			}
			break;
		case this.DAY:
			var m = n.getHours() === 23 && this.add(l, this.HOUR, 1).getHours() === 1;
			if (m) {
				l = this.add(l, this.DAY, 2);
				Ext.Date.clearTime(l);
				return l
			}
			Ext.Date.clearTime(l);
			l = this.add(l, this.DAY, i);
			break;
		case this.WEEK:
			Ext.Date.clearTime(l);
			var h = l.getDay();
			l = this.add(l, this.DAY, k - h + 7 * (i - (k <= h ? 0 : 1)));
			if (l.getDay() !== k) {
				l = this.add(l, this.HOUR, 1)
			} else {
				Ext.Date.clearTime(l)
			}
			break;
		case this.MONTH:
			l = this.add(l, this.MONTH, i);
			l.setDate(1);
			Ext.Date.clearTime(l);
			break;
		case this.QUARTER:
			l = this.add(l, this.MONTH, ((i - 1) * 3) + (3 - (l.getMonth() % 3)));
			Ext.Date.clearTime(l);
			l.setDate(1);
			break;
		case this.YEAR:
			l = new Date(l.getFullYear() + i, 0, 1);
			break;
		default:
			throw "Invalid date unit"
		}
		return l
	},
	getNumberOfMsFromTheStartOfDay : function(b) {
		return b - Ext.Date.clearTime(b, true) || 86400000
	},
	getNumberOfMsTillTheEndOfDay : function(b) {
		return this.getStartOfNextDay(b, true) - b
	},
	getStartOfNextDay : function(g, i, j) {
		var k = this.add(j ? g : Ext.Date.clearTime(g, i), this.DAY, 1);
		if (k.getDate() == g.getDate()) {
			var l = this.add(Ext.Date.clearTime(g, i), this.DAY, 2).getTimezoneOffset();
			var h = g.getTimezoneOffset();
			k = this.add(k, this.MINUTE, h - l)
		}
		return k
	},
	getEndOfPreviousDay : function(d, f) {
		var e = f ? d : Ext.Date.clearTime(d, true);
		if (e - d) {
			return e
		} else {
			return this.add(e, this.DAY, -1)
		}
	},
	timeSpanContains : function(h, e, g, f) {
		return (g - h) >= 0 && (e - f) >= 0
	}
});
Ext.define("Sch.util.Debug", {
	singleton : true,
	runDiagnostics : function() {
		var u;
		var r = this;
		var w = window.console;
		if (w && w.log) {
			u = function(a) {
				w.log(a)
			}
		} else {
			if (!r.schedulerDebugWin) {
				r.schedulerDebugWin = new Ext.Window({
					height : 400,
					width : 500,
					bodyStyle : "padding:10px",
					closeAction : "hide",
					autoScroll : true
				})
			}
			r.schedulerDebugWin.show();
			r.schedulerDebugWin.update("");
			u = function(a) {
				r.schedulerDebugWin.update((r.schedulerDebugWin.body.dom.innerHTML || "") + a + "<br/>")
			}
		}
		var t = Ext.select(".sch-schedulerpanel");
		if (t.getCount() === 0) {
			u("No scheduler component found")
		}
		var m = Ext.getCmp(t.elements[0].id), o = m.getResourceStore(), v = m.getEventStore();
		if (!v.isEventStore) {
			u("Your event store must be or extend Sch.data.EventStore")
		}
		u("Scheduler view start: " + m.getStart() + ", end: " + m.getEnd());
		if (!o) {
			u("No store configured");
			return
		}
		if (!v) {
			u("No event store configured");
			return
		}
		u(o.getCount() + " records in the resource store");
		u(v.getCount() + " records in the eventStore");
		var n = v.model.prototype.idProperty;
		var x = o.model.prototype.idProperty;
		var p = v.model.prototype.fields.getByKey(n);
		var s = o.model.prototype.fields.getByKey(x);
		if (!(v.model.prototype instanceof Sch.model.Event)) {
			u("Your event model must extend Sch.model.Event")
		}
		if (!(o.model.prototype instanceof Sch.model.Resource)) {
			u("Your resource model must extend Sch.model.Resource")
		}
		if (!p) {
			u("idProperty on the event model is incorrectly setup, value: " + n)
		}
		if (!s) {
			u("idProperty on the resource model is incorrectly setup, value: " + x)
		}
		var q = m.getSchedulingView();
		u(q.el.select(q.eventSelector).getCount() + " events present in the DOM");
		if (v.getCount() > 0) {
			if (!v.first().getStartDate() || !(v.first().getStartDate() instanceof Date)) {
				u("The eventStore reader is misconfigured - The StartDate field is not setup correctly, please investigate");
				u("StartDate is configured with dateFormat: " + v.model.prototype.fields.getByKey("StartDate").dateFormat);
				u("See Ext JS docs for information about different date formats: http://docs.sencha.com/ext-js/4-0/#!/api/Ext.Date")
			}
			if (!v.first().getEndDate() || !(v.first().getEndDate() instanceof Date)) {
				u("The eventStore reader is misconfigured - The EndDate field is not setup correctly, please investigate");
				u("EndDate is configured with dateFormat: " + v.model.prototype.fields.getByKey("EndDate").dateFormat);
				u("See Ext JS docs for information about different date formats: http://docs.sencha.com/ext-js/4-0/#!/api/Ext.Date")
			}
			if (v.proxy && v.proxy.reader && v.proxy.reader.jsonData) {
				u("Dumping jsonData to console");
				console && console.dir && console.dir(v.proxy.reader.jsonData)
			}
			u("Records in the event store:");
			v.each(function(b, a) {
				u((a + 1) + ". " + b.startDateField + ":" + b.getStartDate() + ", " + b.endDateField + ":" + b.getEndDate() + ", "
						+ b.resourceIdField + ":" + b.getResourceId());
				if (!b.getStartDate()) {
					u(b.getStartDate())
				}
			})
		} else {
			u("Event store has no data. Has it been loaded properly?")
		}
		if (o instanceof Ext.data.TreeStore) {
			o = o.nodeStore
		}
		if (o.getCount() > 0) {
			u("Records in the resource store:");
			o.each(function(b, a) {
				u((a + 1) + ". " + b.idProperty + ":" + b.getId());
				return
			})
		} else {
			u("Resource store has no data.");
			return
		}
		u("Everything seems to be setup ok!")
	}
});
Ext.define("Sch.util.DragTracker", {
	extend : "Ext.dd.DragTracker",
	xStep : 1,
	yStep : 1,
	constructor : function() {
		this.callParent(arguments);
		this.on("dragstart", function() {
			var b = this.el;
			b.on("scroll", this.onMouseMove, this);
			this.on("dragend", function() {
				b.un("scroll", this.onMouseMove, this)
			}, this, {
				single : true
			})
		})
	},
	setXStep : function(b) {
		this.xStep = b
	},
	startScroll : null,
	setYStep : function(b) {
		this.yStep = b
	},
	getRegion : function() {
		var q = this.startXY, u = this.el.getScroll(), o = this.getXY(), x = o[0], y = o[1], s = u.left - this.startScroll.left, n = u.top
				- this.startScroll.top, r = q[0] - s, t = q[1] - n, v = Math.min(r, x), w = Math.min(t, y), z = Math.abs(r - x), p = Math.abs(t - y);
		return new Ext.util.Region(w, v + z, w + p, v)
	},
	onMouseDown : function(c, d) {
		this.callParent(arguments);
		this.lastXY = this.startXY;
		this.startScroll = this.el.getScroll()
	},
	onMouseMove : function(k, l) {
		if (this.active && k.type === "mousemove" && Ext.isIE9m && !k.browserEvent.button) {
			k.preventDefault();
			this.onMouseUp(k);
			return
		}
		k.preventDefault();
		var m = k.type === "scroll" ? this.lastXY : k.getXY(), e = this.startXY;
		if (!this.active) {
			if (Math.max(Math.abs(e[0] - m[0]), Math.abs(e[1] - m[1])) > this.tolerance) {
				this.triggerStart(k)
			} else {
				return
			}
		}
		var i = m[0], j = m[1];
		if (this.xStep > 1) {
			i -= this.startXY[0];
			i = Math.round(i / this.xStep) * this.xStep;
			i += this.startXY[0]
		}
		if (this.yStep > 1) {
			j -= this.startXY[1];
			j = Math.round(j / this.yStep) * this.yStep;
			j += this.startXY[1]
		}
		var n = this.xStep > 1 || this.yStep > 1;
		if (!n || i !== m[0] || j !== m[1]) {
			this.lastXY = [ i, j ];
			if (this.fireEvent("mousemove", this, k) === false) {
				this.onMouseUp(k)
			} else {
				this.onDrag(k);
				this.fireEvent("drag", this, k)
			}
		}
	}
});
Ext
		.define(
				"Sch.util.ScrollManager",
				{
					singleton : true,
					vthresh : 25,
					hthresh : 25,
					increment : 100,
					frequency : 500,
					animate : true,
					animDuration : 200,
					activeEl : null,
					scrollElRegion : null,
					scrollProcess : {},
					pt : null,
					scrollWidth : null,
					scrollHeight : null,
					direction : "both",
					constructor : function() {
						this.doScroll = Ext.Function.bind(this.doScroll, this)
					},
					triggerRefresh : function() {
						if (this.activeEl) {
							this.refreshElRegion();
							this.clearScrollInterval();
							this.onMouseMove()
						}
					},
					doScroll : function() {
						var h = this.scrollProcess, g = h.el, e = h.dir[0], f = this.increment;
						if (e === "r") {
							f = Math.min(f, this.scrollWidth - this.activeEl.dom.scrollLeft - this.activeEl.dom.clientWidth)
						} else {
							if (e === "d") {
								f = Math.min(f, this.scrollHeight - this.activeEl.dom.scrollTop - this.activeEl.dom.clientHeight)
							}
						}
						g.scroll(e, Math.max(f, 0), {
							duration : this.animDuration,
							callback : this.triggerRefresh,
							scope : this
						})
					},
					clearScrollInterval : function() {
						var b = this.scrollProcess;
						if (b.id) {
							clearTimeout(b.id)
						}
						b.id = 0;
						b.el = null;
						b.dir = ""
					},
					isScrollAllowed : function(b) {
						switch (this.direction) {
						case "both":
							return true;
						case "horizontal":
							return b === "right" || b === "left";
						case "vertical":
							return b === "up" || b === "down";
						default:
							throw "Invalid direction: " + this.direction
						}
					},
					startScrollInterval : function(c, d) {
						if (!this.isScrollAllowed(d)) {
							return
						}
						if (Ext.versions.extjs.isLessThan("4.2.2")) {
							if (d[0] === "r") {
								d = "left"
							} else {
								if (d[0] === "l") {
									d = "right"
								}
							}
						}
						this.clearScrollInterval();
						this.scrollProcess.el = c;
						this.scrollProcess.dir = d;
						this.scrollProcess.id = setTimeout(this.doScroll, this.frequency)
					},
					onMouseMove : function(q) {
						var e = q ? q.getPoint() : this.pt, l = e.x, n = e.y, p = this.scrollProcess, t, s = this.activeEl, m = this.scrollElRegion, r = s.dom, o = this;
						this.pt = e;
						if (m && m.contains(e) && s.isScrollable()) {
							if (m.bottom - n <= o.vthresh && (this.scrollHeight - r.scrollTop - r.clientHeight > 0)) {
								if (p.el != s) {
									this.startScrollInterval(s, "down")
								}
								return
							} else {
								if (m.right - l <= o.hthresh && (this.scrollWidth - r.scrollLeft - r.clientWidth > 0)) {
									if (p.el != s) {
										this.startScrollInterval(s, "right")
									}
									return
								} else {
									if (n - m.top <= o.vthresh && s.dom.scrollTop > 0) {
										if (p.el != s) {
											this.startScrollInterval(s, "up")
										}
										return
									} else {
										if (l - m.left <= o.hthresh && s.dom.scrollLeft > 0) {
											if (p.el != s) {
												this.startScrollInterval(s, "left")
											}
											return
										}
									}
								}
							}
						}
						this.clearScrollInterval()
					},
					refreshElRegion : function() {
						this.scrollElRegion = this.activeEl.getRegion()
					},
					activate : function(d, c) {
						this.direction = c || "both";
						this.activeEl = Ext.get(d);
						this.scrollWidth = this.activeEl.dom.scrollWidth;
						this.scrollHeight = this.activeEl.dom.scrollHeight;
						this.refreshElRegion();
						this.activeEl.on("mousemove", this.onMouseMove, this)
					},
					deactivate : function() {
						this.clearScrollInterval();
						this.activeEl.un("mousemove", this.onMouseMove, this);
						this.activeEl = this.scrollElRegion = this.scrollWidth = this.scrollHeight = null;
						this.direction = "both"
					}
				});
Ext.define("Sch.preset.ViewPreset", {
	name : null,
	rowHeight : null,
	timeColumnWidth : 50,
	timeRowHeight : null,
	timeAxisColumnWidth : null,
	displayDateFormat : "G:i",
	shiftUnit : "HOUR",
	shiftIncrement : 1,
	defaultSpan : 12,
	timeResolution : null,
	headerConfig : null,
	columnLinesFor : "middle",
	headers : null,
	mainHeader : 0,
	constructor : function(b) {
		Ext.apply(this, b)
	},
	getHeaders : function() {
		if (this.headers) {
			return this.headers
		}
		var b = this.headerConfig;
		this.mainHeader = b.top ? 1 : 0;
		return this.headers = [].concat(b.top || [], b.middle || [], b.bottom || [])
	},
	getMainHeader : function() {
		return this.getHeaders()[this.mainHeader]
	},
	getBottomHeader : function() {
		var b = this.getHeaders();
		return b[b.length - 1]
	},
	clone : function() {
		var d = {};
		var c = this;
		Ext.each([ "rowHeight", "timeColumnWidth", "timeRowHeight", "timeAxisColumnWidth", "displayDateFormat", "shiftUnit", "shiftIncrement",
				"defaultSpan", "timeResolution", "headerConfig" ], function(a) {
			d[a] = c[a]
		});
		return new this.self(Ext.clone(d))
	}
});

if (!Ext.ClassManager.get("Sch.feature.AbstractTimeSpan")) {
	Ext.define("Sch.feature.AbstractTimeSpan", {
		extend : "Ext.AbstractPlugin",
		mixins : {
			observable : "Ext.util.Observable"
		},
		lockableScope : "top",
		schedulerView : null,
		timeAxis : null,
		containerEl : null,
		expandToFitView : false,
		disabled : false,
		cls : null,
		clsField : "Cls",
		template : null,
		store : null,
		renderElementsBuffered : false,
		renderDelay : 15,
		refreshSizeOnItemUpdate : true,
		_resizeTimer : null,
		_renderTimer : null,
		showHeaderElements : false,
		headerTemplate : null,
		innerHeaderTpl : null,
		headerContainerCls : "sch-header-secondary-canvas",
		headerContainerEl : null,
		renderingDoneEvent : null,
		constructor : function(b) {
			this.uniqueCls = this.uniqueCls || ("sch-timespangroup-" + Ext.id());
			Ext.apply(this, b);
			this.mixins.observable.constructor.call(this);
			this.callParent(arguments)
		},
		setDisabled : function(b) {
			if (b) {
				this.removeElements()
			}
			this.disabled = b
		},
		removeElements : function() {
			this.removeBodyElements();
			if (this.showHeaderElements) {
				this.removeHeaderElements()
			}
		},
		getBodyElements : function() {
			if (this.containerEl) {
				return this.containerEl.select("." + this.uniqueCls)
			}
			return null
		},
		getHeaderContainerEl : function() {
			var f = this.headerContainerEl, d = Ext.baseCSSPrefix, e;
			if (!f || !f.dom) {
				if (this.schedulerView.isHorizontal()) {
					e = this.panel.getTimeAxisColumn().headerView.containerEl
				} else {
					e = this.panel.el.down("." + d + "grid-inner-locked ." + d + "panel-body ." + d + "grid-view")
				}
				if (e) {
					f = e.down("." + this.headerContainerCls);
					if (!f) {
						f = e.appendChild({
							cls : this.headerContainerCls
						})
					}
					this.headerContainerEl = f
				}
			}
			return f
		},
		getHeaderElements : function() {
			var b = this.getHeaderContainerEl();
			if (b) {
				return b.select("." + this.uniqueCls)
			}
			return null
		},
		removeBodyElements : function() {
			var b = this.getBodyElements();
			if (b) {
				b.each(function(a) {
					a.destroy()
				})
			}
		},
		removeHeaderElements : function() {
			var b = this.getHeaderElements();
			if (b) {
				b.each(function(a) {
					a.destroy()
				})
			}
		},
		getElementId : function(b) {
			return this.uniqueCls + "-" + b.internalId
		},
		getHeaderElementId : function(b) {
			return this.uniqueCls + "-header-" + b.internalId
		},
		getTemplateData : function(b) {
			return this.prepareTemplateData ? this.prepareTemplateData(b) : b.data
		},
		getElementCls : function(e, f) {
			var d = e.clsField || this.clsField;
			if (!f) {
				f = this.getTemplateData(e)
			}
			return this.cls + " " + this.uniqueCls + " " + (f[d] || "")
		},
		getHeaderElementCls : function(e, f) {
			var d = e.clsField || this.clsField;
			if (!f) {
				f = this.getTemplateData(e)
			}
			return "sch-header-indicator " + this.uniqueCls + " " + (f[d] || "")
		},
		init : function(d) {
			if (Ext.versions.touch && !d.isReady()) {
				d.on("viewready", function() {
					this.init(d)
				}, this);
				return
			}
			if (Ext.isString(this.innerHeaderTpl)) {
				this.innerHeaderTpl = new Ext.XTemplate(this.innerHeaderTpl)
			}
			var c = this.innerHeaderTpl;
			if (!this.headerTemplate) {
				this.headerTemplate = new Ext.XTemplate('<tpl for=".">', '<div id="{id}" class="{cls}" style="{side}:{position}px;">'
						+ (c ? "{[this.renderInner(values)]}" : "") + "</div>", "</tpl>", {
					renderInner : function(a) {
						return c.apply(a)
					}
				})
			}
			this.schedulerView = d.getSchedulingView();
			this.panel = d;
			this.timeAxis = d.getTimeAxis();
			this.store = Ext.StoreManager.lookup(this.store);
			if (!this.store) {
				Ext.Error.raise("Error: You must define a store for this plugin")
			}
			if (!this.schedulerView.getEl()) {
				this.schedulerView.on({
					afterrender : this.onAfterRender,
					scope : this
				})
			} else {
				this.onAfterRender()
			}
			this.schedulerView.on({
				destroy : this.onDestroy,
				scope : this
			})
		},
		onAfterRender : function(f) {
			var e = this.schedulerView;
			this.containerEl = e.getSecondaryCanvasEl();
			this.storeListeners = {
				load : this.renderElements,
				datachanged : this.renderElements,
				clear : this.renderElements,
				add : this.refreshSingle,
				remove : this.renderElements,
				update : this.refreshSingle,
				addrecords : this.refreshSingle,
				removerecords : this.renderElements,
				updaterecord : this.refreshSingle,
				scope : this
			};
			this.store.on(this.storeListeners);
			if (Ext.data.NodeStore && e.store instanceof Ext.data.NodeStore) {
				if (e.animate) {
				} else {
					e.mon(e.store, {
						expand : this.renderElements,
						collapse : this.renderElements,
						scope : this
					})
				}
			}
			e.on({
				bufferedrefresh : this.renderElements,
				refresh : this.renderElements,
				itemadd : this.refreshSizeOnItemUpdate ? this.refreshSizes : this.renderElements,
				itemremove : this.refreshSizeOnItemUpdate ? this.refreshSizes : this.renderElements,
				itemupdate : this.refreshSizeOnItemUpdate ? this.refreshSizes : this.renderElements,
				groupexpand : this.renderElements,
				groupcollapse : this.renderElements,
				columnwidthchange : this.renderElements,
				resize : this.renderElements,
				scope : this
			});
			if (e.headerCt) {
				e.headerCt.on({
					add : this.renderElements,
					remove : this.renderElements,
					scope : this
				})
			}
			this.panel.on({
				viewchange : this.renderElements,
				show : this.refreshSizes,
				orientationchange : this.forceNewRenderingTimeout,
				scope : this
			});
			var d = e.getRowContainerEl();
			if (d && d.down(".sch-timetd")) {
				this.renderElements()
			}
		},
		forceNewRenderingTimeout : function() {
			this.renderElementsBuffered = false;
			clearTimeout(this._renderTimer);
			clearTimeout(this._resizeTimer);
			this.renderElements()
		},
		refreshSizesInternal : function() {
			if (!this.schedulerView.isDestroyed && this.schedulerView.isHorizontal()) {
				var b = this.schedulerView.getTimeSpanRegion(new Date(), null, this.expandToFitView);
				this.getBodyElements().setHeight(b.bottom - b.top)
			}
		},
		refreshSizes : function() {
			clearTimeout(this._resizeTimer);
			this._resizeTimer = Ext.Function.defer(this.refreshSizesInternal, this.renderDelay, this)
		},
		renderElements : function() {
			if (this.renderElementsBuffered || this.disabled) {
				return
			}
			this.renderElementsBuffered = true;
			clearTimeout(this._renderTimer);
			this._renderTimer = Ext.Function.defer(this.renderElementsInternal, this.renderDelay, this)
		},
		setElementX : function(c, d) {
			if (this.panel.rtl) {
				c.setRight(d)
			} else {
				c.setLeft(d)
			}
		},
		getHeaderElementPosition : function(c) {
			var d = this.schedulerView.getTimeAxisViewModel();
			return Math.round(d.getPositionFromDate(c))
		},
		renderBodyElementsInternal : function(b) {
			Ext.DomHelper.append(this.containerEl, this.generateMarkup(false, b))
		},
		getHeaderElementData : function(d, c) {
			throw "Abstract method call"
		},
		renderHeaderElementsInternal : function(d) {
			var c = this.getHeaderContainerEl();
			if (c) {
				Ext.DomHelper.append(c, this.generateHeaderMarkup(false, d))
			}
		},
		renderElementsInternal : function() {
			this.renderElementsBuffered = false;
			if (this.disabled || this.schedulerView.isDestroyed) {
				return
			}
			if (Ext.versions.extjs && !this.schedulerView.el.down("table")) {
				return
			}
			this.removeElements();
			this.renderBodyElementsInternal();
			if (this.showHeaderElements) {
				this.headerContainerEl = null;
				this.renderHeaderElementsInternal()
			}
			if (this.renderingDoneEvent) {
				this.fireEvent(this.renderingDoneEvent, this)
			}
		},
		generateMarkup : function(j, f) {
			var h = this.timeAxis.getStart(), g = this.timeAxis.getEnd(), i = this.getElementData(h, g, f, j);
			return this.template.apply(i)
		},
		generateHeaderMarkup : function(d, e) {
			var f = this.getHeaderElementData(e, d);
			return this.headerTemplate.apply(f)
		},
		getElementData : function(g, h, f, e) {
			throw "Abstract method call"
		},
		updateBodyElement : function(f) {
			var j = Ext.get(this.getElementId(f));
			if (j) {
				var h = this.timeAxis.getStart(), g = this.timeAxis.getEnd(), i = this.getElementData(h, g, [ f ])[0];
				if (i) {
					j.dom.className = i.$cls;
					j.setTop(i.top);
					this.setElementX(j, i.left);
					j.setSize(i.width, i.height)
				} else {
					Ext.destroy(j)
				}
			} else {
				this.renderBodyElementsInternal([ f ])
			}
		},
		updateHeaderElement : function(e) {
			var d = Ext.get(this.getHeaderElementId(e));
			if (d) {
				var f = this.getHeaderElementData([ e ])[0];
				if (f) {
					d.dom.className = f.cls;
					if (this.schedulerView.isHorizontal()) {
						this.setElementX(d, f.position);
						d.setWidth(f.size)
					} else {
						d.setTop(f.position);
						d.setHeight(f.size)
					}
				} else {
					Ext.destroy(d)
				}
			} else {
				this.renderHeaderElementsInternal([ e ])
			}
		},
		onDestroy : function() {
			clearTimeout(this._renderTimer);
			clearTimeout(this._resizeTimer);
			if (this.store.autoDestroy) {
				this.store.destroy()
			}
			this.store.un(this.storeListeners)
		},
		refreshSingle : function(c, d) {
			Ext.each(d, this.updateBodyElement, this);
			if (this.showHeaderElements) {
				Ext.each(d, this.updateHeaderElement, this)
			}
		}
	})
}
Ext.define("Sch.feature.DragCreator", {
	requires : [ "Ext.XTemplate", "Sch.util.Date", "Sch.util.ScrollManager", "Sch.util.DragTracker", "Sch.tooltip.Tooltip",
			"Sch.tooltip.ClockTemplate" ],
	disabled : false,
	showHoverTip : true,
	showDragTip : true,
	dragTip : null,
	dragTolerance : 2,
	validatorFn : Ext.emptyFn,
	validatorFnScope : null,
	hoverTipTemplate : null,
	constructor : function(b) {
		Ext.apply(this, b || {});
		this.lastTime = new Date();
		this.template = this.template || new Ext.Template('<div class="sch-dragcreator-proxy"><div class="sch-event-inner">&#160;</div></div>', {
			compiled : true,
			disableFormats : true
		});
		this.schedulerView.on("destroy", this.onSchedulerDestroy, this);
		this.schedulerView.el.on("mousemove", this.setupTooltips, this, {
			single : true
		});
		this.callParent([ b ])
	},
	setDisabled : function(b) {
		this.disabled = b;
		if (this.hoverTip) {
			this.hoverTip.setDisabled(b)
		}
		if (this.dragTip) {
			this.dragTip.setDisabled(b)
		}
	},
	getProxy : function() {
		if (!this.proxy) {
			this.proxy = this.template.append(this.schedulerView.getSecondaryCanvasEl(), {}, true);
			this.proxy.hide = function() {
				this.setTop(-10000)
			}
		}
		return this.proxy
	},
	onMouseMove : function(f) {
		var e = this.hoverTip;
		if (e.disabled || this.dragging) {
			return
		}
		if (f.getTarget("." + this.schedulerView.timeCellCls, 5) && !f.getTarget(this.schedulerView.eventSelector)) {
			var d = this.schedulerView.getDateFromDomEvent(f, "floor");
			if (d) {
				if (d - this.lastTime !== 0) {
					this.updateHoverTip(d);
					if (e.hidden) {
						e[Sch.util.Date.compareUnits(this.schedulerView.getTimeResolution().unit, Sch.util.Date.DAY) >= 0 ? "addCls" : "removeCls"]
								("sch-day-resolution");
						e.show()
					}
				}
			} else {
				e.hide();
				this.lastTime = null
			}
		} else {
			e.hide();
			this.lastTime = null
		}
	},
	updateHoverTip : function(d) {
		if (d) {
			var c = this.schedulerView.getFormattedDate(d);
			this.hoverTip.update(this.hoverTipTemplate.apply({
				date : d,
				text : c
			}));
			this.lastTime = d
		}
	},
	onBeforeDragStart : function(k, i) {
		var e = this.schedulerView, h = i.getTarget("." + e.timeCellCls, 5);
		if (h && !i.getTarget(e.eventSelector)) {
			var l = e.resolveResource(h);
			var j = e.getDateFromDomEvent(i);
			if (!this.disabled && h && e.fireEvent("beforedragcreate", e, l, j, i) !== false) {
				this.resourceRecord = l;
				this.originalStart = j;
				this.resourceRegion = e.getScheduleRegion(this.resourceRecord, this.originalStart);
				this.dateConstraints = e.getDateConstraints(this.resourceRecord, this.originalStart);
				return true
			}
		}
		return false
	},
	onDragStart : function() {
		var f = this, e = f.schedulerView, d = f.getProxy();
		this.dragging = true;
		if (this.hoverTip) {
			this.hoverTip.disable()
		}
		f.start = f.originalStart;
		f.end = f.start;
		f.originalScroll = e.getScroll();
		if (e.getOrientation() === "horizontal") {
			f.rowBoundaries = {
				top : f.resourceRegion.top,
				bottom : f.resourceRegion.bottom
			};
			d.setRegion({
				top : f.rowBoundaries.top,
				right : f.tracker.startXY[0],
				bottom : f.rowBoundaries.bottom,
				left : f.tracker.startXY[0]
			})
		} else {
			f.rowBoundaries = {
				left : f.resourceRegion.left,
				right : f.resourceRegion.right
			};
			d.setRegion({
				top : f.tracker.startXY[1],
				right : f.resourceRegion.right,
				bottom : f.tracker.startXY[1],
				left : f.resourceRegion.left
			})
		}
		d.show();
		e.fireEvent("dragcreatestart", e);
		if (f.showDragTip) {
			f.dragTip.enable();
			f.dragTip.update(f.start, f.end, true);
			f.dragTip.show(d);
			f.dragTip.el.setStyle("visibility", "visible")
		}
		Sch.util.ScrollManager.activate(e.el, e.getOrientation())
	},
	onDrag : function(l, q) {
		var o = this, n = o.schedulerView, k = o.tracker.getRegion(), r = n.getStartEndDatesFromRegion(k, "round");
		if (!r) {
			return
		}
		o.start = r.start || o.start;
		o.end = r.end || o.end;
		var e = o.dateConstraints;
		if (e) {
			o.end = Sch.util.Date.constrain(o.end, e.start, e.end);
			o.start = Sch.util.Date.constrain(o.start, e.start, e.end)
		}
		o.valid = this.validatorFn.call(o.validatorFnScope || o, o.resourceRecord, o.start, o.end) !== false;
		if (o.showDragTip) {
			o.dragTip.update(o.start, o.end, o.valid)
		}
		Ext.apply(k, o.rowBoundaries);
		var m = n.getScroll();
		var p = this.getProxy();
		p.setRegion(k);
		if (n.isHorizontal()) {
			p.setY(o.resourceRegion.top + o.originalScroll.top - m.top)
		}
	},
	eventSwallower : function(b) {
		b.stopPropagation();
		b.preventDefault()
	},
	onDragEnd : function(k, j) {
		var l = this, n = l.schedulerView, m = true, i = j.getTarget(), e = Ext.get(i);
		e.on("click", this.eventSwallower);
		setTimeout(function() {
			e.un("click", this.eventSwallower)
		}, 100);
		l.dragging = false;
		if (l.showDragTip) {
			l.dragTip.disable()
		}
		if (!l.start || !l.end || (l.end - l.start <= 0)) {
			l.valid = false
		}
		l.createContext = {
			start : l.start,
			end : l.end,
			resourceRecord : l.resourceRecord,
			e : j,
			finalize : function() {
				l.finalize.apply(l, arguments)
			}
		};
		if (l.valid) {
			m = n.fireEvent("beforedragcreatefinalize", l, l.createContext, j) !== false
		}
		if (m) {
			l.finalize(l.valid)
		}
		Sch.util.ScrollManager.deactivate()
	},
	finalize : function(f) {
		var e = this.createContext;
		var g = this.schedulerView;
		if (f) {
			var h = Ext.create(g.eventStore.model);
			if (Ext.data.TreeStore && g.eventStore instanceof Ext.data.TreeStore) {
				h.set("leaf", true);
				g.eventStore.append(h)
			}
			h.assign(e.resourceRecord);
			h.setStartEndDate(e.start, e.end);
			g.fireEvent("dragcreateend", g, h, e.resourceRecord, e.e)
		} else {
			this.proxy.hide()
		}
		this.schedulerView.fireEvent("afterdragcreate", g);
		if (this.hoverTip) {
			this.hoverTip.enable()
		}
	},
	tipCfg : {
		trackMouse : true,
		bodyCssClass : "sch-hovertip",
		autoHide : false,
		dismissDelay : 1000,
		showDelay : 300
	},
	dragging : false,
	setupTooltips : function() {
		var j = this, g = j.schedulerView, i = g.up("[lockable=true]").el;
		j.tracker = new Sch.util.DragTracker({
			el : g.el,
			tolerance : j.dragTolerance,
			listeners : {
				mousedown : j.verifyLeftButtonPressed,
				beforedragstart : j.onBeforeDragStart,
				dragstart : j.onDragStart,
				drag : j.onDrag,
				dragend : j.onDragEnd,
				scope : j
			}
		});
		if (this.showDragTip) {
			var f = this.dragTip;
			if (f instanceof Ext.tip.ToolTip) {
				Ext.applyIf(f, {
					schedulerView : g
				});
				f.on("beforeshow", function() {
					return j.dragging
				})
			} else {
				this.dragTip = new Sch.tooltip.Tooltip(Ext.apply({
					cls : "sch-dragcreate-tip",
					constrainTo : i,
					schedulerView : g,
					listeners : {
						beforeshow : function() {
							return j.dragging
						}
					}
				}, f))
			}
		}
		if (j.showHoverTip) {
			var h = g.el;
			j.hoverTipTemplate = j.hoverTipTemplate || new Sch.tooltip.ClockTemplate();
			j.hoverTip = new Ext.ToolTip(Ext.applyIf({
				renderTo : document.body,
				target : h,
				disabled : j.disabled
			}, j.tipCfg));
			j.hoverTip.on("beforeshow", j.tipOnBeforeShow, j);
			g.mon(h, {
				mouseleave : function() {
					j.hoverTip.hide()
				},
				mousemove : j.onMouseMove,
				scope : j
			})
		}
	},
	verifyLeftButtonPressed : function(d, c) {
		return c.button === 0
	},
	onSchedulerDestroy : function() {
		if (this.hoverTip) {
			this.hoverTip.destroy()
		}
		if (this.dragTip) {
			this.dragTip.destroy()
		}
		if (this.tracker) {
			this.tracker.destroy()
		}
		if (this.proxy) {
			Ext.destroy(this.proxy);
			this.proxy = null
		}
	},
	tipOnBeforeShow : function(b) {
		return !this.disabled && !this.dragging && this.lastTime !== null
	}
});
Ext.define("Sch.feature.SchedulerDragZone",
		{
			extend : "Ext.dd.DragZone",
			requires : [ "Sch.tooltip.Tooltip", "Ext.dd.StatusProxy", "Ext.util.Point" ],
			repairHighlight : false,
			repairHighlightColor : "transparent",
			containerScroll : false,
			dropAllowed : "sch-dragproxy",
			dropNotAllowed : "sch-dragproxy",
			showTooltip : true,
			tip : null,
			tipIsProcessed : false,
			schedulerView : null,
			lastXY : null,
			showExactDropPosition : false,
			enableCopy : false,
			enableCopyKey : "SHIFT",
			validatorFn : function(e, g, j, h, i) {
				return true
			},
			validatorFnScope : null,
			copyKeyPressed : false,
			constructor : function(h, f) {
				if (Ext.isIE8m && window.top !== window) {
					Ext.dd.DragDropManager.notifyOccluded = true
				}
				var e = this.proxy = this.proxy || new Ext.dd.StatusProxy({
					shadow : false,
					dropAllowed : this.dropAllowed,
					dropNotAllowed : this.dropNotAllowed,
					ensureAttachedToBody : Ext.emptyFn
				});
				this.callParent(arguments);
				this.isTarget = true;
				this.scroll = false;
				this.ignoreSelf = false;
				var g = this.schedulerView;
				g.el.appendChild(e.el);
				if (g.rtl) {
					e.addCls("sch-rtl")
				}
				g.on({
					eventdragstart : function() {
						Sch.util.ScrollManager.activate(g.el, g.constrainDragToResource && g.getOrientation())
					},
					aftereventdrop : function() {
						Sch.util.ScrollManager.deactivate()
					},
					scope : this
				})
			},
			destroy : function() {
				this.callParent(arguments);
				if (this.tip) {
					this.tip.destroy()
				}
			},
			autoOffset : function(d, c) {
				this.setDelta(0, 0)
			},
			setupConstraints : function(l, s, p, r, n, q, t) {
				this.clearTicks();
				var v = n && !this.showExactDropPosition && q > 1 ? q : 0;
				var o = !n && !this.showExactDropPosition && q > 1 ? q : 0;
				this.resetConstraints();
				this.initPageX = l.left + p;
				this.initPageY = l.top + r;
				var u = s.right - s.left;
				var m = s.bottom - s.top;
				if (n) {
					if (t) {
						this.setXConstraint(l.left + p, l.right - u + p, v)
					} else {
						this.setXConstraint(l.left, l.right, v)
					}
					this.setYConstraint(l.top + r, l.bottom - m + r, o)
				} else {
					this.setXConstraint(l.left + p, l.right - u + p, v);
					if (t) {
						this.setYConstraint(l.top + r, l.bottom - m + r, o)
					} else {
						this.setYConstraint(l.top, l.bottom, o)
					}
				}
			},
			setXConstraint : function(f, d, e) {
				this.leftConstraint = f;
				this.rightConstraint = d;
				this.minX = f;
				this.maxX = d;
				if (e) {
					this.setXTicks(this.initPageX, e)
				}
				this.constrainX = true
			},
			setYConstraint : function(e, f, d) {
				this.topConstraint = e;
				this.bottomConstraint = f;
				this.minY = e;
				this.maxY = f;
				if (d) {
					this.setYTicks(this.initPageY, d)
				}
				this.constrainY = true
			},
			onDragEnter : Ext.emptyFn,
			onDragOut : Ext.emptyFn,
			setVisibilityForSourceEvents : function(b) {
				Ext.each(this.dragData.eventEls, function(a) {
					a[b ? "show" : "hide"]()
				})
			},
			onDragOver : function(q) {
				var e = q.type === "scroll" ? this.lastXY : q.getXY();
				this.checkShiftChange();
				var m = this.dragData;
				if (!m.originalHidden) {
					this.setVisibilityForSourceEvents(false);
					m.originalHidden = true
				}
				var u = m.startDate;
				var s = m.newResource;
				var p = this.schedulerView;
				this.updateDragContext(q);
				if (this.showExactDropPosition) {
					var o = p.isHorizontal();
					var v = p.getDateFromCoordinate(o ? e[0] : e[1]) - m.sourceDate;
					var n = new Date(m.origStart - 0 + v);
					var r = p.timeAxisViewModel.getDistanceBetweenDates(n, m.startDate);
					if (m.startDate > p.timeAxis.getStart()) {
						var t = this.proxy.el;
						if (r) {
							if (p.isHorizontal()) {
								t.setX(e[0] + (this.schedulerView.rtl ? -r : r))
							} else {
								t.setY(e[1] + r)
							}
						}
					}
				}
				if (m.startDate - u !== 0 || s !== m.newResource) {
					this.schedulerView.fireEvent("eventdrag", this.schedulerView, m.eventRecords, m.startDate, m.newResource, m)
				}
				if (this.showTooltip) {
					this.tip.update(m.startDate, m.endDate, m.valid)
				}
				if (q.type !== "scroll") {
					this.lastXY = q.getXY()
				}
			},
			getDragData : function(t) {
				var w = this.schedulerView, x = t.getTarget(w.eventSelector);
				if (!x) {
					return
				}
				var B = w.resolveEventRecord(x);
				if (!B || B.isDraggable() === false || w.fireEvent("beforeeventdrag", w, B, t) === false) {
					return null
				}
				var D = t.getXY(), J = Ext.get(x), e = J.getXY(), C = [ D[0] - e[0], D[1] - e[1] ], z = J.getRegion();
				var A = w.getOrientation() == "horizontal";
				var I = w.resolveResource(x);
				if (w.constrainDragToResource && !I) {
					throw "Resource could not be resolved for event: " + B.getId()
				}
				var s = w.getDateConstraints(w.constrainDragToResource ? I : null, B);
				this.setupConstraints(w.getScheduleRegion(w.constrainDragToResource ? I : null, B), z, C[0], C[1], A, w.getSnapPixelAmount(),
						Boolean(s));
				var H = B.getStartDate(), y = B.getEndDate(), G = w.timeAxis, E = this.getRelatedRecords(B), v = [ J ];
				Ext.Array.each(E, function(a) {
					var b = w.getElementFromEventRecord(a);
					if (b) {
						v.push(b)
					}
				});
				var F = {
					offsets : C,
					repairXY : e,
					prevScroll : w.getScroll(),
					dateConstraints : s,
					eventEls : v,
					eventRecords : [ B ].concat(E),
					relatedEventRecords : E,
					resourceRecord : I,
					sourceDate : w.getDateFromCoordinate(D[A ? 0 : 1]),
					origStart : H,
					origEnd : y,
					startDate : H,
					endDate : y,
					timeDiff : 0,
					startsOutsideView : H < G.getStart(),
					endsOutsideView : y > G.getEnd(),
					duration : y - H,
					bodyScroll : Ext.getBody().getScroll(),
					eventObj : t
				};
				F.ddel = this.getDragElement(J, F);
				return F
			},
			onStartDrag : function(e, g) {
				var h = this.schedulerView, f = this.dragData;
				f.eventEls[0].removeCls("sch-event-hover");
				h.fireEvent("eventdragstart", h, f.eventRecords);
				h.el.on("scroll", this.onViewElScroll, this)
			},
			alignElWithMouse : function(f, h, i) {
				this.callParent(arguments);
				var j = this.getTargetCoord(h, i), g = f.dom ? f : Ext.fly(f, "_dd");
				this.setLocalXY(g, j.x + this.deltaSetXY[0], j.y + this.deltaSetXY[1])
			},
			onViewElScroll : function(r, o) {
				var n = this.proxy, j = this.schedulerView, l = this.dragData;
				this.setVisibilityForSourceEvents(false);
				var k = n.getXY();
				var m = j.getScroll();
				var p = [ k[0] + m.left - l.prevScroll.left, k[1] + m.top - l.prevScroll.top ];
				var q = this.deltaSetXY;
				this.deltaSetXY = [ q[0] + m.left - l.prevScroll.left, q[1] + m.top - l.prevScroll.top ];
				l.prevScroll = m;
				n.setXY(p);
				this.onDragOver(r)
			},
			getCopyKeyPressed : function() {
				return Boolean(this.enableCopy && this.dragData.eventObj[this.enableCopyKey.toLowerCase() + "Key"])
			},
			checkShiftChange : function() {
				var c = this.getCopyKeyPressed(), d = this.dragData;
				if (c !== this.copyKeyPressed) {
					this.copyKeyPressed = c;
					if (c) {
						d.refElements.addCls("sch-event-copy");
						this.setVisibilityForSourceEvents(true)
					} else {
						d.refElements.removeCls("sch-event-copy");
						this.setVisibilityForSourceEvents(false)
					}
				}
			},
			onKey : function(b) {
				if (b.getKey() === b[this.enableCopyKey]) {
					this.checkShiftChange()
				}
			},
			startDrag : function() {
				if (this.enableCopy) {
					Ext.EventManager.on(document, "keydown", this.onKey, this);
					Ext.EventManager.on(document, "keyup", this.onKey, this)
				}
				var h = this.callParent(arguments);
				var i = this.dragData;
				i.refElement = this.proxy.el.down(".sch-dd-ref");
				i.refElements = this.proxy.el.select(".sch-event");
				i.refElement.removeCls("sch-event-hover");
				if (this.showTooltip) {
					var g = this.schedulerView, j = g.up("[lockable=true]").el;
					if (!this.tipIsProcessed) {
						this.tipIsProcessed = true;
						var f = this.tip;
						if (f instanceof Ext.tip.ToolTip) {
							Ext.applyIf(f, {
								schedulerView : g,
								onMyMouseUp : function(a) {
								}
							})
						} else {
							this.tip = new Sch.tooltip.Tooltip(Ext.apply({
								schedulerView : g,
								cls : "sch-dragdrop-tip",
								constrainTo : j
							}, f))
						}
					}
					this.tip.update(i.origStart, i.origEnd, true);
					this.tip.el.setStyle("visibility");
					this.tip.show(i.refElement, i.offsets[0])
				}
				this.copyKeyPressed = this.getCopyKeyPressed();
				if (this.copyKeyPressed) {
					i.refElements.addCls("sch-event-copy");
					i.originalHidden = true
				}
				return h
			},
			endDrag : function() {
				this.schedulerView.el.un("scroll", this.onViewElScroll, this);
				if (this.enableCopy) {
					Ext.EventManager.un(document, "keydown", this.onKey, this);
					Ext.EventManager.un(document, "keyup", this.onKey, this)
				}
				this.callParent(arguments)
			},
			updateRecords : function(A) {
				var v = this, t = v.schedulerView, r = t.resourceStore, y = A.newResource, q = A.eventRecords[0], p = [], s = this
						.getCopyKeyPressed(), z = t.eventStore;
				var w = A.resourceRecord;
				if (s) {
					q = q.fullCopy();
					p.push(q)
				}
				q.beginEdit();
				if (y !== w) {
					if (!s) {
						q.unassign(w)
					}
					q.assign(y)
				}
				q.setStartDate(A.startDate, true, z.skipWeekendsDuringDragDrop);
				q.endEdit();
				var B = A.timeDiff, o = Ext.data.TreeStore && r instanceof Ext.data.TreeStore;
				var u = o ? t.store : r;
				var x = u.indexOf(w) - u.indexOf(y);
				Ext.each(A.relatedEventRecords, function(b) {
					var a = b.getResource(null, z);
					if (s) {
						b = b.fullCopy();
						p.push(b)
					}
					b.beginEdit();
					b.setStartDate(v.adjustStartDate(b.getStartDate(), B), true, z.skipWeekendsDuringDragDrop);
					var c = u.indexOf(a) - x;
					if (c < 0) {
						c = 0
					}
					if (c >= u.getCount()) {
						c = u.getCount() - 1
					}
					b.setResource(u.getAt(c));
					b.endEdit()
				});
				if (p.length) {
					z.append(p)
				}
				t.fireEvent("eventdrop", t, A.eventRecords, s)
			},
			isValidDrop : function(e, d, f) {
				if (e !== d && f.isAssignedTo(d)) {
					return false
				}
				return true
			},
			resolveResource : function(k, l) {
				var n = this.proxy.el.dom;
				var j = this.dragData.bodyScroll;
				n.style.display = "none";
				var m = document.elementFromPoint(k[0] - j.left, k[1] - j.top);
				if (Ext.isIE8 && l && l.browserEvent.synthetic) {
					m = document.elementFromPoint(k[0] - j.left, k[1] - j.top)
				}
				n.style.display = "block";
				if (!m) {
					return null
				}
				var i = this.schedulerView;
				if (!m.className.match(i.timeCellCls)) {
					var e = Ext.fly(m).up("." + i.timeCellCls);
					if (e) {
						m = e.dom
					} else {
						return null
					}
				}
				return i.resolveResource(m)
			},
			adjustStartDate : function(e, f) {
				var d = this.schedulerView;
				return d.timeAxis.roundDate(new Date(e - 0 + f), d.snapRelativeToEventStartDate ? e : false)
			},
			updateDragContext : function(k) {
				var i = this.dragData, l = k.type === "scroll" ? this.lastXY : k.getXY();
				if (!i.refElement) {
					return
				}
				var m = this.schedulerView, j = i.refElement.getRegion();
				if (m.timeAxis.isContinuous()) {
					if ((m.isHorizontal() && this.minX < l[0] && l[0] < this.maxX) || (m.isVertical() && this.minY < l[1] && l[1] < this.maxY)) {
						var e = m.getDateFromCoordinate(l[m.getOrientation() == "horizontal" ? 0 : 1]);
						i.timeDiff = e - i.sourceDate;
						i.startDate = this.adjustStartDate(i.origStart, i.timeDiff);
						i.endDate = new Date(i.startDate - 0 + i.duration)
					}
				} else {
					var n = this.resolveStartEndDates(j);
					i.startDate = n.startDate;
					i.endDate = n.endDate;
					i.timeDiff = i.startDate - i.origStart
				}
				i.newResource = m.constrainDragToResource ? i.resourceRecord : this.resolveResource([ j.left + i.offsets[0], j.top + i.offsets[1] ],
						k);
				if (i.newResource) {
					i.valid = this.validatorFn.call(this.validatorFnScope || this, i.eventRecords, i.newResource, i.startDate, i.duration, k)
				} else {
					i.valid = false
				}
			},
			getRelatedRecords : function(h) {
				var e = this.schedulerView;
				var g = e.selModel;
				var f = [];
				if (g.selected.getCount() > 1) {
					g.selected.each(function(a) {
						if (a !== h && a.isDraggable() !== false) {
							f.push(a)
						}
					})
				}
				return f
			},
			getDragElement : function(h, l) {
				var n = l.eventEls;
				var j;
				var i = l.offsets[0];
				var k = l.offsets[1];
				if (n.length > 1) {
					var m = Ext.core.DomHelper.createDom({
						tag : "div",
						cls : "sch-dd-wrap",
						style : {
							overflow : "visible"
						}
					});
					Ext.Array.each(n, function(a) {
						j = a.dom.cloneNode(true);
						j.id = Ext.id();
						if (a.dom === h.dom) {
							Ext.fly(j).addCls("sch-dd-ref")
						}
						m.appendChild(j);
						var b = a.getOffsetsTo(h);
						Ext.fly(j).setStyle({
							left : b[0] - i + "px",
							top : b[1] - k + "px"
						})
					});
					return m
				} else {
					j = h.dom.cloneNode(true);
					j.id = Ext.id();
					j.style.left = -i + "px";
					j.style.top = -k + "px";
					Ext.fly(j).addCls("sch-dd-ref");
					return j
				}
			},
			onDragDrop : function(l, k) {
				this.updateDragContext(l);
				var o = this, e = o.schedulerView, m = o.cachedTarget || Ext.dd.DragDropMgr.getDDById(k), n = o.dragData, j = false, p = true;
				n.ddCallbackArgs = [ m, l, k ];
				if (this.tip) {
					this.tip.onMyMouseUp()
				}
				if (n.valid && n.startDate && n.endDate) {
					n.finalize = function() {
						o.finalize.apply(o, arguments)
					};
					p = e.fireEvent("beforeeventdropfinalize", o, n, l) !== false;
					if (p && o.isValidDrop(n.resourceRecord, n.newResource, n.eventRecords[0])) {
						j = (n.startDate - n.origStart) !== 0 || n.newResource !== n.resourceRecord
					}
				}
				if (p) {
					o.finalize(n.valid && j)
				}
				e.el.un("scroll", o.onViewElScroll, o)
			},
			finalize : function(n) {
				var k = this, h = k.schedulerView, m = h.eventStore, j = k.dragData;
				if (k.tip) {
					k.tip.hide()
				}
				if (n) {
					var i, l = function() {
						i = true
					};
					m.on("update", l, null, {
						single : true
					});
					k.updateRecords(j);
					m.un("update", l, null, {
						single : true
					});
					if (!i) {
						k.onInvalidDrop.apply(k, j.ddCallbackArgs)
					} else {
						if (Ext.isIE9) {
							k.proxy.el.setStyle("visibility", "hidden");
							Ext.Function.defer(k.onValidDrop, 10, k, j.ddCallbackArgs)
						} else {
							k.onValidDrop.apply(k, j.ddCallbackArgs)
						}
						h.fireEvent("aftereventdrop", h, j.eventRecords)
					}
				} else {
					k.onInvalidDrop.apply(k, j.ddCallbackArgs)
				}
			},
			onInvalidDrop : function(i, j, h) {
				if (Ext.isIE && !j) {
					j = i;
					i = i.getTarget() || document.body
				}
				if (this.tip) {
					this.tip.hide()
				}
				this.setVisibilityForSourceEvents(true);
				var g = this.schedulerView, e = this.callParent([ i, j, h ]);
				g.fireEvent("aftereventdrop", g, this.dragData.eventRecords);
				return e
			},
			resolveStartEndDates : function(i) {
				var h = this.dragData, l, j = h.origStart, g = h.origEnd;
				var k = Sch.util.Date;
				if (!h.startsOutsideView) {
					l = this.schedulerView.getStartEndDatesFromRegion(i, "round");
					if (l) {
						j = l.start || h.startDate;
						g = k.add(j, k.MILLI, h.duration)
					}
				} else {
					if (!h.endsOutsideView) {
						l = this.schedulerView.getStartEndDatesFromRegion(i, "round");
						if (l) {
							g = l.end || h.endDate;
							j = k.add(g, k.MILLI, -h.duration)
						}
					}
				}
				return {
					startDate : j,
					endDate : g
				}
			}
		});
Ext.define("Sch.feature.DragDrop", {
	requires : [ "Ext.XTemplate", "Sch.feature.SchedulerDragZone" ],
	validatorFn : function(e, g, j, h, i) {
		return true
	},
	validatorFnScope : null,
	dragConfig : null,
	constructor : function(h, f) {
		Ext.apply(this, f);
		this.schedulerView = h;
		var c = !!document.elementFromPoint;
		if (c) {
			h.eventDragZone = new Sch.feature.SchedulerDragZone(h.ownerCt.el, Ext.apply({
				ddGroup : h.id,
				schedulerView : h,
				validatorFn : this.validatorFn,
				validatorFnScope : this.validatorFnScope
			}, this.dragConfig))
		} else {
			if (typeof console !== "undefined") {
				var g = console;
				g.log("WARNING: Your browser does not support document.elementFromPoint required for the Drag drop feature")
			}
		}
		this.schedulerView.on("destroy", this.cleanUp, this);
		this.callParent([ f ])
	},
	cleanUp : function() {
		var b = this.schedulerView;
		if (b.eventDragZone) {
			b.eventDragZone.destroy()
		}
	}
});
Ext
		.define(
				"Sch.feature.ResizeZone",
				{
					extend : "Ext.util.Observable",
					requires : [ "Ext.resizer.Resizer", "Sch.tooltip.Tooltip", "Sch.util.ScrollManager" ],
					showTooltip : true,
					showExactResizePosition : false,
					validatorFn : Ext.emptyFn,
					validatorFnScope : null,
					schedulerView : null,
					origEl : null,
					handlePos : null,
					eventRec : null,
					tip : null,
					tipInstance : null,
					startScroll : null,
					constructor : function(d) {
						Ext.apply(this, d);
						var c = this.schedulerView;
						c.on({
							destroy : this.cleanUp,
							scope : this
						});
						c.mon(c.el, {
							mousedown : this.onMouseDown,
							mouseup : this.onMouseUp,
							scope : this,
							delegate : ".sch-resizable-handle"
						});
						this.callParent(arguments)
					},
					onMouseDown : function(h, g) {
						var e = this.schedulerView;
						var i = this.eventRec = e.resolveEventRecord(g);
						var j = i.isResizable();
						if (h.button !== 0 || (j === false || typeof j === "string" && !g.className.match(j))) {
							return
						}
						this.eventRec = i;
						this.handlePos = this.getHandlePosition(g);
						this.origEl = Ext.get(h.getTarget(".sch-event"));
						e.el.on({
							mousemove : this.onMouseMove,
							scope : this,
							single : true
						})
					},
					onMouseUp : function(f, e) {
						var d = this.schedulerView;
						d.el.un({
							mousemove : this.onMouseMove,
							scope : this,
							single : true
						})
					},
					getTipInstance : function() {
						if (this.tipInstance) {
							return this.tipInstance
						}
						var e = this.schedulerView;
						var f = this.tip;
						var d = e.up("[lockable=true]").el;
						if (f instanceof Ext.tip.ToolTip) {
							Ext.applyIf(f, {
								schedulerView : e
							})
						} else {
							f = new Sch.tooltip.Tooltip(Ext.apply({
								rtl : this.rtl,
								schedulerView : e,
								constrainTo : d,
								cls : "sch-resize-tip",
								onMyMouseMove : function(a) {
									this.el.alignTo(this.target, "bl-tl", [ a.getX() - this.target.getX(), -5 ])
								}
							}, f))
						}
						return this.tipInstance = f
					},
					onMouseMove : function(j, i) {
						var e = this.schedulerView, k = this.eventRec, m = this.handlePos;
						if (!k || e.fireEvent("beforeeventresize", e, k, j) === false) {
							return
						}
						delete this.eventRec;
						j.stopEvent();
						this.resizer = this.createResizer(this.origEl, k, m, j, i);
						var n = this.resizer.resizeTracker;
						if (this.showTooltip) {
							var l = this.getTipInstance();
							l.update(k.getStartDate(), k.getEndDate(), true);
							l.show(this.origEl)
						}
						n.onMouseDown(j, this.resizer[m].dom);
						n.onMouseMove(j, this.resizer[m].dom);
						e.fireEvent("eventresizestart", e, k);
						e.el.on("scroll", this.onViewElScroll, this)
					},
					getHandlePosition : function(c) {
						var d = c.className.match("start");
						if (this.schedulerView.getOrientation() === "horizontal") {
							if (this.schedulerView.rtl) {
								return d ? "east" : "west"
							}
							return d ? "west" : "east"
						} else {
							return d ? "north" : "south"
						}
					},
					createResizer : function(J, G, w) {
						var z = this.schedulerView, s = this, K = z.getElementFromEventRecord(G), F = z.resolveResource(J), u = z
								.getSnapPixelAmount(), x = z.getScheduleRegion(F, G), v = z.getDateConstraints(F, G), y = J.getHeight, E = (z.rtl && w[0] === "e")
								|| (!z.rtl && w[0] === "w") || w[0] === "n", D = z.getOrientation() === "vertical", H = {
							otherEdgeX : E ? K.getRight() : K.getLeft(),
							otherEdgeY : E ? K.getBottom() : K.getTop(),
							target : K,
							isStart : E,
							startYOffset : K.getY() - K.parent().getY(),
							startXOffset : K.getX() - K.parent().getX(),
							dateConstraints : v,
							resourceRecord : F,
							eventRecord : G,
							handles : w[0],
							minHeight : y,
							constrainTo : x,
							listeners : {
								resizedrag : this.partialResize,
								resize : this.afterResize,
								scope : this
							}
						};
						var I = J.id;
						var B = "_" + I;
						J.id = J.dom.id = B;
						Ext.cache[B] = Ext.cache[I];
						if (D) {
							if (u > 0) {
								var C = J.getWidth();
								Ext.apply(H, {
									minHeight : u,
									minWidth : C,
									maxWidth : C,
									heightIncrement : u
								})
							}
						} else {
							if (u > 0) {
								Ext.apply(H, {
									minWidth : u,
									maxHeight : y,
									widthIncrement : u
								})
							}
						}
						var A = new Ext.resizer.Resizer(H);
						if (A.resizeTracker) {
							A.resizeTracker.tolerance = -1;
							var L = A.resizeTracker.updateDimensions;
							A.resizeTracker.updateDimensions = function(a) {
								if (!Ext.isWebKit || a.getTarget(".sch-timelineview")) {
									var b;
									if (D) {
										b = z.el.getScroll().top - s.startScroll.top;
										A.resizeTracker.minHeight = H.minHeight - Math.abs(b)
									} else {
										b = z.el.getScroll().left - s.startScroll.left;
										A.resizeTracker.minWidth = H.minWidth - Math.abs(b)
									}
									L.apply(this, arguments)
								}
							};
							A.resizeTracker.resize = function(b) {
								var a;
								if (D) {
									a = z.el.getScroll().top - s.startScroll.top;
									if (w[0] === "s") {
										b.y -= a
									}
									b.height += Math.abs(a)
								} else {
									a = z.el.getScroll().left - s.startScroll.left;
									if (w[0] === "e") {
										b.x -= a
									}
									b.width += Math.abs(a)
								}
								Ext.resizer.ResizeTracker.prototype.resize.apply(this, arguments)
							}
						}
						J.setStyle("z-index", parseInt(J.getStyle("z-index"), 10) + 1);
						Sch.util.ScrollManager.activate(z.el, z.getOrientation());
						this.startScroll = z.el.getScroll();
						return A
					},
					getStartEndDates : function() {
						var l = this.resizer, n = l.el, m = this.schedulerView, h = l.isStart, j, i, k;
						if (h) {
							k = [ m.rtl ? n.getRight() : n.getLeft() + 1, n.getTop() ];
							i = l.eventRecord.getEndDate();
							if (m.snapRelativeToEventStartDate) {
								j = m.getDateFromXY(k);
								j = m.timeAxis.roundDate(j, l.eventRecord.getStartDate())
							} else {
								j = m.getDateFromXY(k, "round")
							}
						} else {
							k = [ m.rtl ? n.getLeft() : n.getRight(), n.getBottom() ];
							j = l.eventRecord.getStartDate();
							if (m.snapRelativeToEventStartDate) {
								i = m.getDateFromXY(k);
								i = m.timeAxis.roundDate(i, l.eventRecord.getEndDate())
							} else {
								i = m.getDateFromXY(k, "round")
							}
						}
						j = j || l.start;
						i = i || l.end;
						if (l.dateConstraints) {
							j = Sch.util.Date.constrain(j, l.dateConstraints.start, l.dateConstraints.end);
							i = Sch.util.Date.constrain(i, l.dateConstraints.start, l.dateConstraints.end)
						}
						return {
							start : j,
							end : i
						}
					},
					partialResize : function(E, A, t, v) {
						var e = this.schedulerView, r = v.type === "scroll" ? this.resizer.resizeTracker.lastXY : v.getXY(), s = this
								.getStartEndDates(r), B = s.start, z = s.end, x = E.eventRecord, u = e.isHorizontal();
						if (u) {
							E.target.el.setY(E.target.parent().getY() + E.startYOffset)
						} else {
							E.target.el.setX(E.target.parent().getX() + E.startXOffset)
						}
						if (this.showTooltip) {
							var F = this.validatorFn.call(this.validatorFnScope || this, E.resourceRecord, x, B, z) !== false;
							this.getTipInstance().update(B, z, F)
						}
						if (this.showExactResizePosition) {
							var w = E.target.el, C, D, y;
							if (E.isStart) {
								C = e.timeAxisViewModel.getDistanceBetweenDates(B, x.getEndDate());
								if (u) {
									D = e.getDateFromCoordinate(E.otherEdgeX - Math.min(A, E.maxWidth)) || B;
									y = e.timeAxisViewModel.getDistanceBetweenDates(D, B);
									w.setWidth(C);
									w.setX(w.getX() + y)
								} else {
									D = e.getDateFromCoordinate(E.otherEdgeY - Math.min(A, E.maxHeight)) || B;
									y = e.timeAxisViewModel.getDistanceBetweenDates(D, B);
									w.setHeight(C);
									w.setY(w.getY() + y)
								}
							} else {
								C = e.timeAxisViewModel.getDistanceBetweenDates(x.getStartDate(), z);
								if (u) {
									w.setWidth(C)
								} else {
									w.setHeight(C)
								}
							}
						} else {
							if (!B || !z || ((E.start - B === 0) && (E.end - z === 0))) {
								return
							}
						}
						E.end = z;
						E.start = B;
						e.fireEvent("eventpartialresize", e, x, B, z, E.el)
					},
					onViewElScroll : function(c, d) {
						this.resizer.resizeTracker.onDrag.apply(this.resizer.resizeTracker, arguments);
						this.partialResize(this.resizer, 0, 0, c)
					},
					afterResize : function(B, r, x, w) {
						var u = this, v = B.resourceRecord, t = B.eventRecord, y = t.getStartDate(), e = t.getEndDate(), A = B.start || y, z = B.end
								|| e, h = u.schedulerView, q = false, s = true;
						Sch.util.ScrollManager.deactivate();
						h.el.un("scroll", this.onViewElScroll, this);
						if (this.showTooltip) {
							this.getTipInstance().hide()
						}
						delete Ext.cache[B.el.id];
						B.el.id = B.el.dom.id = B.el.id.substr(1);
						u.resizeContext = {
							resourceRecord : B.resourceRecord,
							eventRecord : t,
							start : A,
							end : z,
							finalize : function() {
								u.finalize.apply(u, arguments)
							}
						};
						if (A && z && (z - A > 0) && ((A - y !== 0) || (z - e !== 0))
								&& u.validatorFn.call(u.validatorFnScope || u, v, t, A, z, w) !== false) {
							s = h.fireEvent("beforeeventresizefinalize", u, u.resizeContext, w) !== false;
							q = true
						} else {
							h.repaintEventsForResource(v)
						}
						if (s) {
							u.finalize(q)
						}
					},
					finalize : function(f) {
						var e = this.schedulerView;
						var g = this.resizeContext;
						var h = false;
						g.eventRecord.store.on("update", function() {
							h = true
						}, null, {
							single : true
						});
						if (f) {
							if (this.resizer.isStart) {
								g.eventRecord.setStartDate(g.start, false, e.eventStore.skipWeekendsDuringDragDrop)
							} else {
								g.eventRecord.setEndDate(g.end, false, e.eventStore.skipWeekendsDuringDragDrop)
							}
							if (!h) {
								e.repaintEventsForResource(g.resourceRecord)
							}
						} else {
							e.repaintEventsForResource(g.resourceRecord)
						}
						this.resizer.destroy();
						e.fireEvent("eventresizeend", e, g.eventRecord);
						this.resizeContext = null
					},
					cleanUp : function() {
						if (this.tipInstance) {
							this.tipInstance.destroy()
						}
					}
				});
Ext
		.define(
				"Sch.feature.Grouping",
				{
					extend : "Ext.grid.feature.Grouping",
					alias : "feature.scheduler_grouping",
					headerRenderer : Ext.emptyFn,
					timeAxisViewModel : null,
					headerCellTpl : '<tpl for="."><div class="sch-grid-group-hd-cell {cellCls}" style="{cellStyle}; width: {width}px;"><span>{value}</span></div></tpl>',
					renderCells : function(j) {
						var h = [];
						var l = this.timeAxisViewModel.columnConfig[this.timeAxisViewModel.columnLinesFor];
						for (var g = 0; g < l.length; g++) {
							var i = {};
							var k = this.headerRenderer(l[g].start, l[g].end, j.groupInfo.children, i);
							i.value = k;
							i.width = l[g].width;
							h.push(i)
						}
						return this.headerCellTpl.apply(h)
					},
					init : function() {
						this.callParent(arguments);
						if (typeof this.headerCellTpl === "string") {
							this.headerCellTpl = new Ext.XTemplate(this.headerCellTpl)
						}
						if (this.view.eventStore) {
							this.timeAxisViewModel = this.view.timeAxisViewModel;
							this.view.mon(this.view.eventStore, {
								add : this.refreshGroupHeader,
								remove : this.refreshGroupHeader,
								update : this.refreshGroupHeader,
								scope : this
							})
						}
					},
					destroy : function() {
						this.callParent(arguments)
					},
					getNodeIndex : function(e, f) {
						var h = e.resourceStore;
						var g = h.getGroups(h.getGroupString(f.getResource(null, e.eventStore)));
						return e.store.indexOf(g.children[0])
					},
					refreshGroupHeader : function(h, e) {
						var g = this, f = g.view;
						e = Ext.isArray(e) ? e : [ e ];
						Ext.Array.each(e, function(a) {
							f.refreshNode(g.getNodeIndex(f, a))
						})
					},
					groupTpl : [
							"{%",
							"var me = this.groupingFeature;",
							"if (me.disabled) {",
							"values.needsWrap = false;",
							"} else {",
							"me.setupRowData(values.record, values.recordIndex, values);",
							"values.needsWrap = !me.disabled && (values.isFirstRow || values.summaryRecord);",
							"}",
							"%}",
							'<tpl if="needsWrap">',
							'<tr data-boundView="{view.id}" data-recordId="{record.internalId}" data-recordIndex="{[values.isCollapsedGroup ? -1 : values.recordIndex]}"',
							'class="{[values.itemClasses.join(" ")]} ' + Ext.baseCSSPrefix + 'grid-wrap-row<tpl if="!summaryRecord"> '
									+ Ext.baseCSSPrefix + 'grid-group-row</tpl>">',
							'<td class="' + Ext.baseCSSPrefix + 'group-hd-container" colspan="{columns.length}">',
							'<tpl if="isFirstRow">',
							"{%",
							'var groupTitleStyle = (!values.view.lockingPartner || (values.view.ownerCt === values.view.ownerCt.ownerLockable.lockedGrid) || (values.view.lockingPartner.headerCt.getVisibleGridColumns().length === 0)) ? "" : "visibility:hidden";',
							"%}",
							'<tpl if="(values.view.ownerCt === values.view.ownerCt.ownerLockable.lockedGrid) || !this.groupingFeature.headerRenderer || this.groupingFeature.headerRenderer == Ext.emptyFn">',
							'<div id="{groupId}" class="',
							Ext.baseCSSPrefix,
							'grid-group-hd {collapsibleCls}" tabIndex="0" hidefocus="on" {ariaCellInnerAttr}>',
							'<div class="',
							Ext.baseCSSPrefix,
							'grid-group-title" style="{[groupTitleStyle]}" {ariaGroupTitleAttr}>',
							'{[values.groupHeaderTpl.apply(values.groupInfo, parent) || "&#160;"]}',
							"</div>",
							"</div>",
							"<tpl else>",
							'<div id="{groupId}" class="',
							Ext.baseCSSPrefix,
							'grid-group-hd sch-grid-group-hd {collapsibleCls}" tabIndex="0" hidefocus="on" {ariaCellInnerAttr}>',
							"{[this.groupingFeature.renderCells(values)]}",
							"</div>",
							"</tpl>",
							"</tpl>",
							'<tpl if="summaryRecord || !isCollapsedGroup">',
							'<table class="',
							Ext.baseCSSPrefix,
							"{view.id}-table ",
							Ext.baseCSSPrefix,
							"grid-table",
							'<tpl if="summaryRecord"> ',
							Ext.baseCSSPrefix,
							'grid-table-summary</tpl>"',
							'border="0" cellspacing="0" cellpadding="0" style="width:100%">',
							"{[values.view.renderColumnSizer(out)]}",
							'<tpl if="!isCollapsedGroup">',
							"{%",
							"values.itemClasses.length = 0;",
							"this.nextTpl.applyOut(values, out, parent);",
							"%}",
							"</tpl>",
							'<tpl if="summaryRecord">',
							"{%me.outputSummaryRecord(values.summaryRecord, values, out);%}",
							"</tpl>",
							"</table>",
							"</tpl>",
							"</td>",
							"</tr>",
							"<tpl else>",
							"{%this.nextTpl.applyOut(values, out, parent);%}",
							"</tpl>",
							{
								priority : 200,
								syncRowHeights : function(o, j) {
									o = Ext.fly(o, "syncDest");
									j = Ext.fly(j, "sycSrc");
									var q = this.owner, n = o.down(q.eventSelector, true), m, l = o.down(q.summaryRowSelector, true), p, r, k;
									if (n && (m = j.down(q.eventSelector, true))) {
										n.style.height = m.style.height = "";
										if ((r = n.offsetHeight) > (k = m.offsetHeight)) {
											Ext.fly(m).setHeight(r)
										} else {
											if (k > r) {
												Ext.fly(n).setHeight(k)
											}
										}
									}
									if (l && (p = j.down(q.summaryRowSelector, true))) {
										l.style.height = p.style.height = "";
										if ((r = l.offsetHeight) > (k = p.offsetHeight)) {
											Ext.fly(p).setHeight(r)
										} else {
											if (k > r) {
												Ext.fly(l).setHeight(k)
											}
										}
									}
								},
								syncContent : function(h, j) {
									h = Ext.fly(h, "syncDest");
									j = Ext.fly(j, "sycSrc");
									var i = this.owner, m = h.down(i.eventSelector, true), n = j.down(i.eventSelector, true), k = h.down(
											i.summaryRowSelector, true), l = j.down(i.summaryRowSelector, true);
									if (m && n) {
										Ext.fly(m).syncContent(n)
									}
									if (k && l) {
										Ext.fly(k).syncContent(l)
									}
								}
							} ]
				});
Ext.define("Sch.eventlayout.Horizontal", {
	timeAxisViewModel : null,
	view : null,
	nbrOfBandsByResource : null,
	constructor : function(b) {
		Ext.apply(this, b);
		this.nbrOfBandsByResource = {}
	},
	clearCache : function(b) {
		if (b) {
			delete this.nbrOfBandsByResource[b.internalId]
		} else {
			this.nbrOfBandsByResource = {}
		}
	},
	getNumberOfBands : function(d, f) {
		if (!this.view.dynamicRowHeight) {
			return 1
		}
		var e = this.nbrOfBandsByResource;
		if (e.hasOwnProperty(d.internalId)) {
			return e[d.internalId]
		}
		return this.calculateNumberOfBands(d, f)
	},
	getRowHeight : function(e, h) {
		var f = this.view;
		var g = this.getNumberOfBands(e, h);
		return (g * this.timeAxisViewModel.rowHeightHorizontal) - ((g - 1) * f.barMargin)
	},
	calculateNumberOfBands : function(n, l) {
		var m = [];
		l = l || this.view.eventStore.getEventsForResource(n);
		var o = this.view.timeAxis;
		for (var i = 0; i < l.length; i++) {
			var p = l[i];
			var k = p.getStartDate();
			var j = p.getEndDate();
			if (k && j && o.timeSpanInAxis(k, j)) {
				m[m.length] = {
					start : k,
					end : j,
					event : p
				}
			}
		}
		return this.applyLayout(m, n)
	},
	applyLayout : function(f, h) {
		var g = f.slice();
		var e = this;
		g.sort(function(a, b) {
			return e.sortEvents(a.event, b.event)
		});
		return this.nbrOfBandsByResource[h.internalId] = this.layoutEventsInBands(0, g)
	},
	sortEvents : function(k, m) {
		var j = k.getStartDate(), a = k.getEndDate();
		var l = m.getStartDate(), b = m.getEndDate();
		var n = (j - l === 0);
		if (n) {
			return a > b ? -1 : 1
		} else {
			return (j < l) ? -1 : 1
		}
	},
	layoutEventsInBands : function(h, f) {
		var g = this.view;
		do {
			var i = f[0], j = h === 0 ? g.barMargin : (h * this.timeAxisViewModel.rowHeightHorizontal - (h - 1) * g.barMargin);
			if (j >= g.cellBottomBorderWidth) {
				j -= g.cellBottomBorderWidth
			}
			while (i) {
				i.top = j;
				Ext.Array.remove(f, i);
				i = this.findClosestSuccessor(i, f)
			}
			h++
		} while (f.length > 0);
		return h
	},
	findClosestSuccessor : function(l, n) {
		var p = Infinity, m, j = l.end, k;
		for (var o = 0, i = n.length; o < i; o++) {
			k = n[o].start - j;
			if (k >= 0 && k < p) {
				m = n[o];
				p = k
			}
		}
		return m
	}
});
Ext.define("Sch.eventlayout.Vertical", {
	requires : [ "Sch.util.Date" ],
	constructor : function(b) {
		Ext.apply(this, b)
	},
	applyLayout : function(L, G) {
		if (L.length === 0) {
			return
		}
		var i = this;
		L.sort(function(a, b) {
			return i.sortEvents(a.event, b.event)
		});
		var I, J, D = this.view, C = Sch.util.Date, A = 1, w, K, E = G - (2 * D.barMargin), H, x;
		for (var l = 0, y = L.length; l < y; l++) {
			H = L[l];
			I = H.start;
			J = H.end;
			K = this.findStartSlot(L, H);
			var j = this.getCluster(L, l);
			if (j.length > 1) {
				H.left = K.start;
				H.width = K.end - K.start;
				x = 1;
				while (x < (j.length - 1) && j[x + 1].start - H.start === 0) {
					x++
				}
				var z = this.findStartSlot(L, j[x]);
				if (z && z.start < 0.8) {
					j = j.slice(0, x)
				}
			}
			var F = j.length, B = (K.end - K.start) / F;
			for (x = 0; x < F; x++) {
				j[x].width = B;
				j[x].left = K.start + (x * B)
			}
			l += F - 1
		}
		for (l = 0, y = L.length; l < y; l++) {
			L[l].width = L[l].width * E;
			L[l].left = D.barMargin + (L[l].left * E)
		}
	},
	findStartSlot : function(h, g) {
		var f = this.getPriorOverlappingEvents(h, g), e;
		if (f.length === 0) {
			return {
				start : 0,
				end : 1
			}
		}
		for (e = 0; e < f.length; e++) {
			if (e === 0 && f[0].left > 0) {
				return {
					start : 0,
					end : f[0].left
				}
			} else {
				if (f[e].left + f[e].width < (e < f.length - 1 ? f[e + 1].left : 1)) {
					return {
						start : f[e].left + f[e].width,
						end : e < f.length - 1 ? f[e + 1].left : 1
					}
				}
			}
		}
		return false
	},
	getPriorOverlappingEvents : function(n, m) {
		var l = Sch.util.Date, k = m.start, i = m.end, p = [];
		for (var o = 0, j = Ext.Array.indexOf(n, m); o < j; o++) {
			if (l.intersectSpans(k, i, n[o].start, n[o].end)) {
				p.push(n[o])
			}
		}
		p.sort(this.sortOverlappers);
		return p
	},
	sortOverlappers : function(c, d) {
		return c.left < d.left ? -1 : 1
	},
	getCluster : function(n, l) {
		if (l >= n.length - 1) {
			return [ n[l] ]
		}
		var p = [ n[l] ], k = n[l].start, i = n[l].end, j = n.length, m = Sch.util.Date, o = l + 1;
		while (o < j && m.intersectSpans(k, i, n[o].start, n[o].end)) {
			p.push(n[o]);
			k = m.max(k, n[o].start);
			i = m.min(n[o].end, i);
			o++
		}
		return p
	},
	sortEvents : function(k, m) {
		var j = k.getStartDate(), a = k.getEndDate();
		var l = m.getStartDate(), b = m.getEndDate();
		var n = (j - l === 0);
		if (n) {
			return a > b ? -1 : 1
		} else {
			return (j < l) ? -1 : 1
		}
	}
});
Ext.define("Sch.column.Summary", {
	extend : "Ext.grid.column.Column",
	alias : [ "widget.summarycolumn", "plugin.scheduler_summarycolumn" ],
	mixins : [ "Ext.AbstractPlugin" ],
	alternateClassName : "Sch.plugin.SummaryColumn",
	init : Ext.emptyFn,
	lockableScope : "top",
	showPercent : false,
	nbrDecimals : 1,
	sortable : false,
	fixed : true,
	menuDisabled : true,
	width : 80,
	dataIndex : "_sch_not_used",
	timeAxis : null,
	eventStore : null,
	constructor : function(b) {
		this.scope = this;
		this.callParent(arguments)
	},
	beforeRender : function() {
		this.callParent(arguments);
		var b = this.up("tablepanel[lockable=true]");
		this.timeAxis = b.getTimeAxis();
		b.lockedGridDependsOnSchedule = true;
		this.eventStore = b.getEventStore()
	},
	renderer : function(k, t, n) {
		var m = this.timeAxis, p = this.eventStore, o = m.getStart(), l = m.getEnd(), r = 0, s = this.calculate(p.getEventsForResource(n), o, l);
		if (s <= 0) {
			return ""
		}
		if (this.showPercent) {
			var q = Sch.util.Date.getDurationInMinutes(o, l);
			return (Math.round((s * 100) / q)) + " %"
		} else {
			if (s > 1440) {
				return (s / 1440).toFixed(this.nbrDecimals) + " " + Sch.util.Date.getShortNameOfUnit("DAY")
			}
			if (s >= 30) {
				return (s / 60).toFixed(this.nbrDecimals) + " " + Sch.util.Date.getShortNameOfUnit("HOUR")
			}
			return s + " " + Sch.util.Date.getShortNameOfUnit("MINUTE")
		}
	},
	calculate : function(n, j, m) {
		var l = 0, h, i, k = Sch.util.Date;
		Ext.each(n, function(a) {
			h = a.getStartDate();
			i = a.getEndDate();
			if (k.intersectSpans(j, m, h, i)) {
				l += k.getDurationInMinutes(k.max(h, j), k.min(i, m))
			}
		});
		return l
	}
});
Ext.define("Sch.column.Resource", {
	extend : "Ext.grid.Column",
	alias : "widget.resourcecolumn",
	cls : "sch-resourcecolumn-header",
	align : "center",
	menuDisabled : true,
	hideable : false,
	sortable : false,
	locked : false,
	lockable : false,
	draggable : false,
	enableLocking : false,
	tdCls : "sch-timetd",
	model : null
});
if (!Ext.ClassManager.get("Sch.view.model.TimeAxis")) {
	Ext.define("Sch.view.model.TimeAxis", {
		extend : "Ext.util.Observable",
		requires : [ "Ext.Date", "Sch.util.Date", "Sch.preset.Manager" ],
		timeAxis : null,
		availableWidth : 0,
		tickWidth : 100,
		snapToIncrement : false,
		forceFit : false,
		headerConfig : null,
		headers : null,
		mainHeader : 0,
		timeAxisColumnWidth : null,
		resourceColumnWidth : null,
		timeColumnWidth : null,
		rowHeightHorizontal : null,
		rowHeightVertical : null,
		orientation : "horizontal",
		suppressFit : false,
		refCount : 0,
		columnConfig : {},
		viewPreset : null,
		columnLinesFor : "middle",
		eventStore : null,
		constructor : function(e) {
			var f = this;
			Ext.apply(this, e);
			if (this.viewPreset) {
				var d = Sch.preset.Manager.getPreset(this.viewPreset);
				d && this.consumeViewPreset(d)
			}
			f.timeAxis.on("reconfigure", f.onTimeAxisReconfigure, f);
			this.callParent(arguments)
		},
		destroy : function() {
			this.timeAxis.un("reconfigure", this.onTimeAxisReconfigure, this)
		},
		onTimeAxisReconfigure : function(d, e, f) {
			if (!f) {
				this.update()
			}
		},
		reconfigure : function(b) {
			this.headers = null;
			Ext.apply(this, b);
			if (this.orientation == "horizontal") {
				this.setTickWidth(this.timeColumnWidth)
			} else {
				this.setTickWidth(this.rowHeightVertical)
			}
			this.fireEvent("reconfigure", this)
		},
		getColumnConfig : function() {
			return this.columnConfig
		},
		update : function(k, g) {
			var j = this.timeAxis, l = this.headerConfig;
			this.availableWidth = Math.max(k || this.availableWidth, 0);
			if (!Ext.isNumber(this.availableWidth)) {
				throw "Invalid available width provided to Sch.view.model.TimeAxis"
			}
			if (this.forceFit && this.availableWidth <= 0) {
				return
			}
			this.columnConfig = {};
			for ( var i in l) {
				if (l[i].cellGenerator) {
					this.columnConfig[i] = l[i].cellGenerator.call(this, j.getStart(), j.getEnd())
				} else {
					this.columnConfig[i] = this.createHeaderRow(i, l[i])
				}
			}
			var h = this.calculateTickWidth(this.getTickWidth());
			if (!Ext.isNumber(h) || h <= 0) {
				throw "Invalid column width calculated in Sch.view.model.TimeAxis"
			}
			this.updateTickWidth(h);
			if (!g) {
				this.fireEvent("update", this)
			}
		},
		createHeaderRow : function(h, k) {
			var l = [], j = this, i = k.align, g = Ext.Date.clearTime(new Date());
			j.forEachInterval(h, function(a, d, c) {
				var b = {
					align : i,
					start : a,
					end : d,
					headerCls : ""
				};
				if (k.renderer) {
					b.header = k.renderer.call(k.scope || j, a, d, b, c, j.eventStore)
				} else {
					b.header = Ext.Date.format(a, k.dateFormat)
				}
				if (k.unit === Sch.util.Date.DAY && (!k.increment || k.increment === 1)) {
					b.headerCls += " sch-dayheadercell-" + a.getDay();
					if (Ext.Date.clearTime(a, true) - g === 0) {
						b.headerCls += " sch-dayheadercell-today"
					}
				}
				l.push(b)
			});
			return l
		},
		getDistanceBetweenDates : function(c, d) {
			return Math.round(this.getPositionFromDate(d) - this.getPositionFromDate(c))
		},
		getPositionFromDate : function(e) {
			var f = -1, d = this.timeAxis.getTickFromDate(e);
			if (d >= 0) {
				f = Math.round(this.tickWidth * (d - this.timeAxis.visibleTickStart))
			}
			return f
		},
		getDateFromPosition : function(f, g) {
			var h = f / this.getTickWidth() + this.timeAxis.visibleTickStart, e = this.timeAxis.getCount();
			if (h < 0 || h > e) {
				return null
			}
			return this.timeAxis.getDateFromTick(h, g)
		},
		getSingleUnitInPixels : function(b) {
			return Sch.util.Date.getUnitToBaseUnitRatio(this.timeAxis.getUnit(), b) * this.tickWidth / this.timeAxis.increment
		},
		getSnapPixelAmount : function() {
			if (this.snapToIncrement) {
				var b = this.timeAxis.getResolution();
				return (b.increment || 1) * this.getSingleUnitInPixels(b.unit)
			} else {
				return 1
			}
		},
		getTickWidth : function() {
			return this.tickWidth
		},
		setTickWidth : function(c, d) {
			this.updateTickWidth(c);
			this.update(null, d)
		},
		updateTickWidth : function(b) {
			this.tickWidth = b;
			if (this.orientation == "horizontal") {
				this.timeColumnWidth = b
			} else {
				this.rowHeightVertical = b
			}
		},
		getTotalWidth : function() {
			return Math.round(this.tickWidth * this.timeAxis.getVisibleTickTimeSpan())
		},
		calculateTickWidth : function(q) {
			var k = this.forceFit;
			var n = this.timeAxis;
			var s = 0, o = n.getUnit(), l = Number.MAX_VALUE, r = Sch.util.Date;
			if (this.snapToIncrement) {
				var p = n.getResolution();
				l = r.getUnitToBaseUnitRatio(o, p.unit) * p.increment
			} else {
				var m = r.getMeasuringUnit(o);
				l = Math.min(l, r.getUnitToBaseUnitRatio(o, m))
			}
			var t = Math[k ? "floor" : "round"](this.getAvailableWidth() / n.getVisibleTickTimeSpan());
			if (!this.suppressFit) {
				s = (k || q < t) ? t : q;
				if (l > 0 && (!k || l < 1)) {
					s = Math.round(Math.max(1, Math[k ? "floor" : "round"](l * s)) / l)
				}
			} else {
				s = q
			}
			return s
		},
		getAvailableWidth : function() {
			return this.availableWidth
		},
		setAvailableWidth : function(d) {
			this.availableWidth = Math.max(0, d);
			var c = this.calculateTickWidth(this.tickWidth);
			if (c !== this.tickWidth) {
				this.setTickWidth(c)
			}
		},
		fitToAvailableWidth : function(d) {
			var c = Math.floor(this.availableWidth / this.timeAxis.getVisibleTickTimeSpan());
			this.setTickWidth(c, d)
		},
		setForceFit : function(b) {
			if (b !== this.forceFit) {
				this.forceFit = b;
				this.update()
			}
		},
		setSnapToIncrement : function(b) {
			if (b !== this.snapToIncrement) {
				this.snapToIncrement = b;
				this.update()
			}
		},
		getViewRowHeight : function() {
			var b = this.orientation == "horizontal" ? this.rowHeightHorizontal : this.rowHeightVertical;
			if (!b) {
				throw "rowHeight info not available"
			}
			return b
		},
		setViewRowHeight : function(h, f) {
			var g = this.orientation === "horizontal";
			var e = "rowHeight" + Ext.String.capitalize(this.orientation);
			if (this[e] != h) {
				this[e] = h;
				if (g) {
					if (!f) {
						this.fireEvent("update", this)
					}
				} else {
					this.setTickWidth(h, f)
				}
			}
		},
		setViewColumnWidth : function(c, d) {
			if (this.orientation === "horizontal") {
				this.setTickWidth(c, d)
			} else {
				this.resourceColumnWidth = c
			}
			if (!d) {
				this.fireEvent("columnwidthchange", this, c)
			}
		},
		getHeaders : function() {
			if (this.headers) {
				return this.headers
			}
			var b = this.headerConfig;
			this.mainHeader = b.top ? 1 : 0;
			return this.headers = [].concat(b.top || [], b.middle || [], b.bottom || [])
		},
		getMainHeader : function() {
			return this.getHeaders()[this.mainHeader]
		},
		getBottomHeader : function() {
			var b = this.getHeaders();
			return b[b.length - 1]
		},
		forEachInterval : function(f, g, i) {
			i = i || this;
			var j = this.headerConfig;
			if (!j) {
				return
			}
			if (f === "top" || (f === "middle" && j.bottom)) {
				var h = j[f];
				this.timeAxis.forEachAuxInterval(h.unit, h.increment, g, i)
			} else {
				this.timeAxis.each(function(a, b) {
					return g.call(i, a.data.start, a.data.end, b)
				})
			}
		},
		forEachMainInterval : function(d, c) {
			this.forEachInterval("middle", d, c)
		},
		consumeViewPreset : function(d) {
			this.headers = null;
			var c = this.orientation == "horizontal";
			Ext.apply(this, {
				headerConfig : d.headerConfig,
				columnLinesFor : d.columnLinesFor || "middle",
				rowHeightHorizontal : d.rowHeight,
				tickWidth : c ? d.timeColumnWidth : d.timeRowHeight || d.timeColumnWidth || 60,
				timeColumnWidth : d.timeColumnWidth,
				rowHeightVertical : d.timeRowHeight || d.timeColumnWidth || 60,
				timeAxisColumnWidth : d.timeAxisColumnWidth,
				resourceColumnWidth : d.resourceColumnWidth || 100
			})
		}
	})
}
Ext
		.define(
				"Sch.view.HorizontalTimeAxis",
				{
					extend : "Ext.util.Observable",
					requires : [ "Ext.XTemplate" ],
					trackHeaderOver : true,
					compactCellWidthThreshold : 15,
					baseCls : "sch-column-header",
					tableCls : "sch-header-row",
					headerHtmlRowTpl : '<table border="0" cellspacing="0" cellpadding="0" style="width: {totalWidth}px; {tstyle}" class="{{tableCls}} sch-header-row-{position} {cls}"><thead><tr><tpl for="cells"><td class="{{baseCls}} {headerCls}" style="position : static; text-align: {align}; width: {width}px; {style}" tabIndex="0"headerPosition="{parent.position}" headerIndex="{[xindex-1]}"><div class="sch-simple-timeheader">{header}</div></td></tpl></tr></thead></table>',
					model : null,
					hoverCls : "",
					containerEl : null,
					height : null,
					constructor : function(i) {
						var h = this;
						var f = !!Ext.versions.touch;
						var g = f ? "tap" : "click";
						Ext.apply(this, i);
						h.callParent(arguments);
						h.model.on("update", h.onModelUpdate, this, {
							priority : 5
						});
						h.containerEl = Ext.get(h.containerEl);
						if (!(h.headerHtmlRowTpl instanceof Ext.Template)) {
							h.headerHtmlRowTpl = h.headerHtmlRowTpl.replace("{{baseCls}}", this.baseCls).replace("{{tableCls}}", this.tableCls);
							h.headerHtmlRowTpl = new Ext.XTemplate(h.headerHtmlRowTpl)
						}
						if (h.trackHeaderOver && h.hoverCls) {
							h.containerEl.on({
								mousemove : h.highlightCell,
								delegate : ".sch-column-header",
								scope : h
							});
							h.containerEl.on({
								mouseleave : h.clearHighlight,
								scope : h
							})
						}
						var j = {
							scope : this,
							delegate : ".sch-column-header"
						};
						if (f) {
							j.tap = this.onElClick("tap");
							j.doubletap = this.onElClick("doubletap")
						} else {
							j.click = this.onElClick("click");
							j.dblclick = this.onElClick("dblclick");
							j.contextmenu = this.onElClick("contextmenu")
						}
						h._listenerCfg = j;
						if (h.containerEl) {
							h.containerEl.on(j)
						}
					},
					destroy : function() {
						var b = this;
						if (b.containerEl) {
							b.containerEl.un(b._listenerCfg);
							b.containerEl.un({
								mousemove : b.highlightCell,
								delegate : ".sch-simple-timeheader",
								scope : b
							});
							b.containerEl.un({
								mouseleave : b.clearHighlight,
								scope : b
							})
						}
						b.model.un({
							update : b.onModelUpdate,
							scope : b
						})
					},
					onModelUpdate : function() {
						this.render()
					},
					getHTML : function(n, k, o) {
						var j = this.model.getColumnConfig();
						var l = this.model.getTotalWidth();
						var p = Ext.Object.getKeys(j).length;
						var q = this.height ? this.height / p : 0;
						var m = "";
						var r;
						if (j.top) {
							this.embedCellWidths(j.top);
							m += this.headerHtmlRowTpl.apply({
								totalWidth : l,
								cells : j.top,
								position : "top",
								tstyle : "border-top : 0;" + (q ? "height:" + q + "px" : "")
							})
						}
						if (j.middle) {
							this.embedCellWidths(j.middle);
							m += this.headerHtmlRowTpl.apply({
								totalWidth : l,
								cells : j.middle,
								position : "middle",
								tstyle : (j.top ? "" : "border-top : 0;") + (q ? "height:" + q + "px" : ""),
								cls : !j.bottom && this.model.getTickWidth() <= this.compactCellWidthThreshold ? "sch-header-row-compact" : ""
							})
						}
						if (j.bottom) {
							this.embedCellWidths(j.bottom);
							m += this.headerHtmlRowTpl.apply({
								totalWidth : l,
								cells : j.bottom,
								position : "bottom",
								tstyle : (q ? "height:" + q + "px" : ""),
								cls : this.model.getTickWidth() <= this.compactCellWidthThreshold ? "sch-header-row-compact" : ""
							})
						}
						return m + '<div class="sch-header-secondary-canvas"></div>'
					},
					render : function() {
						if (!this.containerEl) {
							return
						}
						var j = this.containerEl, i = j.dom, k = i.style.display, h = this.model.getColumnConfig(), g = i.parentNode;
						i.style.display = "none";
						g.removeChild(i);
						var l = this.getHTML();
						i.innerHTML = l;
						if (!h.top && !h.middle) {
							this.containerEl.addCls("sch-header-single-row")
						} else {
							this.containerEl.removeCls("sch-header-single-row")
						}
						g && g.appendChild(i);
						i.style.display = k;
						this.fireEvent("refresh", this)
					},
					embedCellWidths : function(f) {
						var h = (Ext.isIE7 || Ext.isSafari) ? 1 : 0;
						for (var j = 0; j < f.length; j++) {
							var g = f[j];
							var i = this.model.getDistanceBetweenDates(g.start, g.end);
							if (i) {
								g.width = i - (j ? h : 0)
							} else {
								g.width = 0;
								g.style = "display: none"
							}
						}
					},
					onElClick : function(b) {
						return function(h, g) {
							g = h.delegatedTarget || g;
							var a = Ext.fly(g).getAttribute("headerPosition"), j = Ext.fly(g).getAttribute("headerIndex"), i = this.model
									.getColumnConfig()[a][j];
							this.fireEvent("timeheader" + b, this, i.start, i.end, h)
						}
					},
					highlightCell : function(f, e) {
						var d = this;
						if (e !== d.highlightedCell) {
							d.clearHighlight();
							d.highlightedCell = e;
							Ext.fly(e).addCls(d.hoverCls)
						}
					},
					clearHighlight : function() {
						var c = this, d = c.highlightedCell;
						if (d) {
							Ext.fly(d).removeCls(c.hoverCls);
							delete c.highlightedCell
						}
					}
				});
Ext.define("Sch.column.timeAxis.Horizontal", {
	extend : "Ext.grid.column.Column",
	alias : "widget.timeaxiscolumn",
	draggable : false,
	groupable : false,
	hideable : false,
	sortable : false,
	fixed : true,
	menuDisabled : true,
	cls : "sch-simple-timeaxis",
	tdCls : "sch-timetd",
	enableLocking : false,
	requires : [ "Sch.view.HorizontalTimeAxis" ],
	timeAxisViewModel : null,
	headerView : null,
	hoverCls : "",
	ownHoverCls : "sch-column-header-over",
	trackHeaderOver : true,
	compactCellWidthThreshold : 20,
	initComponent : function() {
		this.callParent(arguments)
	},
	afterRender : function() {
		var b = this;
		b.headerView = new Sch.view.HorizontalTimeAxis({
			model : b.timeAxisViewModel,
			containerEl : b.titleEl,
			hoverCls : b.ownHoverCls,
			trackHeaderOver : b.trackHeaderOver,
			compactCellWidthThreshold : b.compactCellWidthThreshold
		});
		b.headerView.on("refresh", b.onTimeAxisViewRefresh, b);
		b.ownerCt.on("afterlayout", function() {
			b.mon(b.ownerCt, "resize", b.onHeaderContainerResize, b);
			if (this.getWidth() > 0) {
				if (b.getAvailableWidthForSchedule() === b.timeAxisViewModel.getAvailableWidth()) {
					b.headerView.render()
				} else {
					b.timeAxisViewModel.update(b.getAvailableWidthForSchedule())
				}
				b.setWidth(b.timeAxisViewModel.getTotalWidth())
			}
		}, null, {
			single : true
		});
		this.enableBubble("timeheaderclick", "timeheaderdblclick", "timeheadercontextmenu");
		b.relayEvents(b.headerView, [ "timeheaderclick", "timeheaderdblclick", "timeheadercontextmenu" ]);
		b.callParent(arguments)
	},
	initRenderData : function() {
		var b = this;
		b.renderData.headerCls = b.renderData.headerCls || b.headerCls;
		return b.callParent(arguments)
	},
	destroy : function() {
		if (this.headerView) {
			this.headerView.destroy()
		}
		this.callParent(arguments)
	},
	onTimeAxisViewRefresh : function() {
		this.headerView.un("refresh", this.onTimeAxisViewRefresh, this);
		this.setWidth(this.timeAxisViewModel.getTotalWidth());
		this.headerView.on("refresh", this.onTimeAxisViewRefresh, this)
	},
	getAvailableWidthForSchedule : function() {
		var f = this.ownerCt.getWidth();
		var e = this.ownerCt.items;
		for (var d = 1; d < e.length; d++) {
			f -= e.get(d).getWidth()
		}
		return f - Ext.getScrollbarSize().width - 1
	},
	onResize : function() {
		this.callParent(arguments);
		this.timeAxisViewModel.setAvailableWidth(this.getAvailableWidthForSchedule())
	},
	onHeaderContainerResize : function() {
		this.timeAxisViewModel.setAvailableWidth(this.getAvailableWidthForSchedule());
		this.headerView.render()
	},
	refresh : function() {
		this.timeAxisViewModel.update(null, true);
		this.headerView.render()
	}
});
Ext.define("Sch.column.timeAxis.Vertical", {
	extend : "Ext.grid.column.Column",
	alias : "widget.verticaltimeaxis",
	align : "right",
	draggable : false,
	groupable : false,
	hideable : false,
	sortable : false,
	menuDisabled : true,
	timeAxis : null,
	timeAxisViewModel : null,
	cellTopBorderWidth : null,
	cellBottomBorderWidth : null,
	totalBorderWidth : null,
	enableLocking : false,
	locked : true,
	initComponent : function() {
		this.callParent(arguments);
		this.tdCls = (this.tdCls || "") + " sch-verticaltimeaxis-cell";
		this.scope = this;
		this.totalBorderWidth = this.cellTopBorderWidth + this.cellBottomBorderWidth
	},
	afterRender : function() {
		this.callParent(arguments);
		var b = this.up("panel");
		b.getView().on("resize", this.onContainerResize, this)
	},
	onContainerResize : function(f, d, e) {
		this.timeAxisViewModel.update(e - 21)
	},
	renderer : function(i, f, g, h) {
		var j = this.timeAxisViewModel.getBottomHeader();
		f.style = "height:" + (this.timeAxisViewModel.getTickWidth() - this.totalBorderWidth) + "px";
		if (j.renderer) {
			return j.renderer.call(j.scope || this, g.data.start, g.data.end, f, h)
		} else {
			return Ext.Date.format(g.data.start, j.dateFormat)
		}
	}
});
Ext.define("Sch.mixin.Lockable", {
	extend : "Ext.grid.locking.Lockable",
	useSpacer : true,
	syncRowHeight : false,
	horizontalScrollForced : false,
	injectLockable : function() {
		var o = this;
		var q = Ext.data.TreeStore && o.store instanceof Ext.data.TreeStore;
		var v = o.getEventSelectionModel ? o.getEventSelectionModel() : o.getSelectionModel();
		o.lockedGridConfig = Ext.apply({}, o.lockedGridConfig || {});
		o.normalGridConfig = Ext.apply({}, o.schedulerConfig || o.normalGridConfig || {});
		if (o.lockedXType) {
			o.lockedGridConfig.xtype = o.lockedXType
		}
		if (o.normalXType) {
			o.normalGridConfig.xtype = o.normalXType
		}
		var x = o.lockedGridConfig, p = o.normalGridConfig;
		Ext.applyIf(o.lockedGridConfig, {
			useArrows : true,
			split : true,
			animCollapse : false,
			collapseDirection : "left",
			trackMouseOver : false,
			region : "west"
		});
		Ext.applyIf(o.normalGridConfig, {
			viewType : o.viewType,
			layout : "fit",
			sortableColumns : false,
			enableColumnMove : false,
			enableColumnResize : false,
			enableColumnHide : false,
			trackMouseOver : false,
			getSchedulingView : function() {
				var a = typeof console !== "undefined" ? console : false;
				if (a && a.log) {
					a.log('getSchedulingView is deprecated on the inner grid panel. Instead use getView on the "normal" subgrid.')
				}
				return this.getView()
			},
			selModel : v,
			collapseDirection : "right",
			animCollapse : false,
			region : "center"
		});
		if (o.orientation === "vertical") {
			x.store = p.store = o.timeAxis
		}
		if (x.width) {
			o.syncLockedWidth = Ext.emptyFn;
			x.scroll = "horizontal";
			x.scrollerOwner = true
		}
		var t = o.lockedViewConfig = o.lockedViewConfig || {};
		var n = o.normalViewConfig = o.normalViewConfig || {};
		if (q) {
			var r = Ext.tree.View.prototype.onUpdate;
			t.onUpdate = function() {
				this.refreshSize = function() {
					var b = this, a = b.getBodySelector();
					if (a) {
						b.body.attach(b.el.child(a, true))
					}
				};
				Ext.suspendLayouts();
				r.apply(this, arguments);
				Ext.resumeLayouts();
				this.refreshSize = Ext.tree.View.prototype.refreshSize
			};
			if (Ext.versions.extjs.isLessThan("5.0")) {
				t.store = n.store = o.store.nodeStore
			}
		}
		var s = o.layout;
		var u = x.width;
		this.callParent(arguments);
		this.on("afterrender", function() {
			var a = this.lockedGrid.headerCt.showMenuBy;
			this.lockedGrid.headerCt.showMenuBy = function() {
				a.apply(this, arguments);
				o.showMenuBy.apply(this, arguments)
			}
		});
		var m = o.lockedGrid.getView();
		var w = o.normalGrid.getView();
		this.patchViews();
		if (u || s === "border") {
			if (u) {
				o.lockedGrid.setWidth(u)
			}
			w.addCls("sch-timeline-horizontal-scroll");
			m.addCls("sch-locked-horizontal-scroll");
			o.horizontalScrollForced = true
		}
		if (o.normalGrid.collapsed) {
			o.normalGrid.collapsed = false;
			w.on("boxready", function() {
				o.normalGrid.collapse()
			}, o, {
				delay : 10
			})
		}
		if (o.lockedGrid.collapsed) {
			if (m.bufferedRenderer) {
				m.bufferedRenderer.disabled = true
			}
		}
		if (Ext.getScrollbarSize().width === 0) {
			m.addCls("sch-ganttpanel-force-locked-scroll")
		}
		if (q) {
			this.setupLockableTree()
		}
		if (o.useSpacer) {
			w.on("refresh", o.updateSpacer, o);
			m.on("refresh", o.updateSpacer, o)
		}
		if (s !== "fit") {
			o.layout = s
		}
		if (w.bufferedRenderer) {
			this.lockedGrid.on("expand", function() {
				m.el.dom.scrollTop = w.el.dom.scrollTop
			});
			this.patchSubGrid(this.lockedGrid, true);
			this.patchSubGrid(this.normalGrid, false);
			this.patchBufferedRenderingPlugin(w.bufferedRenderer);
			this.patchBufferedRenderingPlugin(m.bufferedRenderer)
		}
		this.patchSyncHorizontalScroll(this.lockedGrid);
		this.patchSyncHorizontalScroll(this.normalGrid);
		this.delayReordererPlugin(this.lockedGrid);
		this.delayReordererPlugin(this.normalGrid);
		this.fixHeaderResizer(this.lockedGrid);
		this.fixHeaderResizer(this.normalGrid)
	},
	setupLockableTree : function() {
		var f = this;
		var d = f.lockedGrid.getView();
		var e = Sch.mixin.FilterableTreeView.prototype;
		d.initTreeFiltering = e.initTreeFiltering;
		d.onFilterChangeStart = e.onFilterChangeStart;
		d.onFilterChangeEnd = e.onFilterChangeEnd;
		d.onFilterCleared = e.onFilterCleared;
		d.onFilterSet = e.onFilterSet;
		d.initTreeFiltering()
	},
	patchSyncHorizontalScroll : function(b) {
		b.scrollTask = new Ext.util.DelayedTask(function(e, a) {
			var f = this.getScrollTarget().el;
			if (f) {
				this.syncHorizontalScroll(f.dom.scrollLeft, a)
			}
		}, b)
	},
	delayReordererPlugin : function(d) {
		var f = d.headerCt;
		var e = f.reorderer;
		if (e) {
			f.un("render", e.onHeaderCtRender, e);
			f.on("render", function() {
				if (!f.isDestroyed) {
					e.onHeaderCtRender()
				}
			}, e, {
				single : true,
				delay : 10
			})
		}
	},
	fixHeaderResizer : function(f) {
		var h = f.headerCt;
		var g = h.resizer;
		if (g) {
			var e = g.onBeforeStart;
			g.onBeforeStart = function() {
				if (this.activeHd && this.activeHd.isDestroyed) {
					return false
				}
				return e.apply(this, arguments)
			}
		}
	},
	updateSpacer : function() {
		var l = this.lockedGrid.getView();
		var n = this.normalGrid.getView();
		if (l.rendered && n.rendered && l.el.child("table")) {
			var m = this, p = l.el, o = n.el.dom, i = p.dom.id + "-spacer", k = (o.offsetHeight - o.clientHeight) + "px";
			m.spacerEl = Ext.getDom(i);
			if (Ext.isIE6 || Ext.isIE7 || (Ext.isIEQuirks && Ext.isIE8) && m.spacerEl) {
				Ext.removeNode(m.spacerEl);
				m.spacerEl = null
			}
			if (m.spacerEl) {
				m.spacerEl.style.height = k
			} else {
				var j = p;
				Ext.core.DomHelper.append(j, {
					id : i,
					style : "height: " + k
				})
			}
		}
	},
	onLockedViewScroll : function() {
		this.callParent(arguments);
		var b = this.lockedGrid.getView().bufferedRenderer;
		if (b) {
			b.onViewScroll()
		}
	},
	onNormalViewScroll : function() {
		this.callParent(arguments);
		var b = this.normalGrid.getView().bufferedRenderer;
		if (b) {
			b.onViewScroll()
		}
	},
	patchSubGrid : function(q, r) {
		var m = q.getView();
		var k = m.bufferedRenderer;
		q.on({
			collapse : function() {
				k.disabled = true
			},
			expand : function() {
				k.disabled = false
			}
		});
		var o = m.collectData;
		m.collectData = function() {
			var a = o.apply(this, arguments);
			var b = a.tableStyle;
			if (b && b[b.length - 1] != "x") {
				a.tableStyle += "px"
			}
			return a
		};
		var n = Ext.data.TreeStore && this.store instanceof Ext.data.TreeStore;
		var l = m.getStore();
		if (!r && n) {
			var j = m.onRemove;
			l.un("bulkremove", m.onRemove, m);
			m.onRemove = function() {
				var a = this;
				if (a.rendered && a.bufferedRenderer) {
					a.refreshView()
				} else {
					j.apply(this, arguments)
				}
			};
			l.on("bulkremove", m.onRemove, m)
		}
		var p = m.onAdd;
		l.un("add", m.onAdd, m);
		m.onAdd = function() {
			var a = this;
			if (a.rendered && a.bufferedRenderer) {
				a.refreshView()
			} else {
				p.apply(this, arguments)
			}
		};
		l.on("add", m.onAdd, m)
	},
	afterLockedViewLayout : function() {
		if (!this.horizontalScrollForced) {
			return this.callParent(arguments)
		}
	},
	patchBufferedRenderingPlugin : function(f) {
		f.variableRowHeight = true;
		if (Ext.getVersion("extjs").isLessThan("4.2.1.883")) {
			f.view.on("afterrender", function() {
				f.view.el.un("scroll", f.onViewScroll, f)
			}, this, {
				single : true,
				delay : 1
			});
			var d = f.stretchView;
			f.stretchView = function(c, h) {
				var a = this, b = (a.store.buffered ? a.store.getTotalCount() : a.store.getCount());
				if (b && (a.view.all.endIndex === b - 1)) {
					h = a.bodyTop + c.body.dom.offsetHeight
				}
				d.apply(this, [ c, h ])
			}
		} else {
			var e = f.enable;
			f.enable = function() {
				if (f.grid.collapsed) {
					return
				}
				return e.apply(this, arguments)
			}
		}
	},
	showMenuBy : function(g, i) {
		var j = this.getMenu(), l = j.down("#unlockItem"), k = j.down("#lockItem"), h = l.prev();
		h.hide();
		l.hide();
		k.hide()
	},
	patchViews : function() {
		if (Ext.isIE) {
			var n = this.getSelectionModel();
			var k = this;
			var l = k.lockedGrid.view;
			var m = k.normalGrid.view;
			var j = n.processSelection;
			var o = Ext.getVersion("extjs").isLessThan("4.2.2.1144") ? "mousedown" : "click";
			var p = l.doFocus ? "doFocus" : "focus";
			n.processSelection = function(c, d, a, b, f) {
				var e, g;
				if (f.type == o) {
					e = l.scrollRowIntoView;
					g = l[p];
					l.scrollRowIntoView = m.scrollRowIntoView = Ext.emptyFn;
					l[p] = m[p] = Ext.emptyFn
				}
				j.apply(this, arguments);
				if (f.type == o) {
					l.scrollRowIntoView = m.scrollRowIntoView = e;
					l[p] = m[p] = g;
					l.el.focus()
				}
			};
			var i = m.onRowFocus;
			m.onRowFocus = function(b, c, a) {
				i.call(this, b, c, true)
			};
			if (Ext.tree && Ext.tree.plugin && Ext.tree.plugin.TreeViewDragDrop) {
				l.on("afterrender", function() {
					Ext.each(l.plugins, function(b) {
						if (b instanceof Ext.tree.plugin.TreeViewDragDrop) {
							var a = l[p];
							b.dragZone.view.un("itemmousedown", b.dragZone.onItemMouseDown, b.dragZone);
							b.dragZone.view.on("itemmousedown", function() {
								l[p] = Ext.emptyFn;
								if (l.editingPlugin) {
									l.editingPlugin.completeEdit()
								}
								b.dragZone.onItemMouseDown.apply(b.dragZone, arguments);
								l[p] = a
							});
							return false
						}
					})
				}, null, {
					delay : 100
				})
			}
		}
	}
});
if (!Ext.ClassManager.get("Sch.model.Customizable")) {
	Ext.define("Sch.model.Customizable", {
		extend : "Ext.data.Model",
		idProperty : null,
		customizableFields : null,
		previous : null,
		constructor : function() {
			var b = this.callParent(arguments);
			this.modified = this.modified || {};
			return b
		},
		onClassExtended : function(e, g, f) {
			var h = f.onBeforeCreated;
			f.onBeforeCreated = function(a, i) {
				h.apply(this, arguments);
				var d = a.prototype;
				var b = Ext.versions.extjs && Ext.versions.extjs.isGreaterThanOrEqual("5.0");
				if (!d.customizableFields) {
					return
				}
				d.customizableFields = (a.superclass.customizableFields || []).concat(d.customizableFields);
				var r = d.customizableFields;
				var q = {};
				Ext.Array.each(r, function(j) {
					if (typeof j == "string") {
						j = {
							name : j
						}
					}
					q[j.name] = j
				});
				var c = d.fields;
				if (Ext.isArray(c)) {
					var t = new Ext.util.MixedCollection();
					for (var p = 0; p < c.length; p++) {
						t.add(c[p].name, c[p])
					}
					c = t
				}
				var s = [];
				c.each(function(j) {
					if (j.isCustomizableField) {
						s.push(j)
					}
				});
				c.removeAll(s);
				Ext.Object.each(q, function(m, j) {
					j.isCustomizableField = true;
					var B = j.name || j.getName();
					var n = B === "Id" ? "idProperty" : B.charAt(0).toLowerCase() + B.substr(1) + "Field";
					var A = d[n];
					var o = A || B;
					var y;
					if (c.containsKey(o)) {
						y = Ext.applyIf({
							name : B,
							isCustomizableField : true
						}, c.getByKey(o));
						c.getByKey(o).isCustomizableField = true;
						if (b) {
							y = Ext.create("data.field." + (y.type || "auto"), y)
						} else {
							y = new Ext.data.Field(y)
						}
						r.push(y)
					} else {
						y = Ext.applyIf({
							name : o,
							isCustomizableField : true
						}, j);
						if (b) {
							y = Ext.create("data.field." + (y.type || "auto"), y)
						} else {
							y = new Ext.data.Field(y)
						}
						c.add(o, y)
					}
					var k = Ext.String.capitalize(B);
					if (k != "Id") {
						var z = "get" + k;
						var l = "set" + k;
						if (!d[z] || d[z].__getterFor__ && d[z].__getterFor__ != o) {
							d[z] = function() {
								return this.data[o]
							};
							d[z].__getterFor__ = o
						}
						if (!d[l] || d[l].__setterFor__ && d[l].__setterFor__ != o) {
							d[l] = function(u) {
								return this.set(o, u)
							};
							d[l].__setterFor__ = o
						}
					}
				});
				if (b) {
					d.fields.splice(0, d.fields.length);
					d.fields.push.apply(d.fields, c.items)
				}
			}
		},
		set : function(g, e) {
			var f;
			this.previous = this.previous || {};
			if (arguments.length > 1) {
				f = this.get(g);
				if (f !== e) {
					this.previous[g] = f
				}
			} else {
				for ( var h in g) {
					f = this.get(h);
					if (f !== g[h]) {
						this.previous[h] = f
					}
				}
			}
			this.callParent(arguments);
			if (!this.__editing) {
				delete this.previous
			}
		},
		beginEdit : function() {
			this.__editing = true;
			this.callParent(arguments)
		},
		cancelEdit : function() {
			this.callParent(arguments);
			this.__editing = false;
			delete this.previous
		},
		endEdit : function() {
			this.callParent(arguments);
			this.__editing = false;
			delete this.previous
		},
		reject : function() {
			var d = this, e = d.modified, f;
			d.previous = d.previous || {};
			for (f in e) {
				if (e.hasOwnProperty(f)) {
					if (typeof e[f] != "function") {
						d.previous[f] = d.get(f)
					}
				}
			}
			d.callParent(arguments);
			delete d.previous
		}
	})
}
Ext.define("Sch.model.Range", {
	extend : "Sch.model.Customizable",
	requires : [ "Sch.util.Date" ],
	idProperty : "Id",
	config : Ext.versions.touch ? {
		idProperty : "Id"
	} : null,
	startDateField : "StartDate",
	endDateField : "EndDate",
	nameField : "Name",
	clsField : "Cls",
	customizableFields : [ {
		name : "StartDate",
		type : "date",
		dateFormat : "c"
	}, {
		name : "EndDate",
		type : "date",
		dateFormat : "c"
	}, {
		name : "Cls",
		type : "string"
	}, {
		name : "Name",
		type : "string"
	} ],
	setStartDate : function(f, g) {
		var h = this.getEndDate();
		var e = this.getStartDate();
		this.set(this.startDateField, f);
		if (g === true && h && e) {
			this.setEndDate(Sch.util.Date.add(f, Sch.util.Date.MILLI, h - e))
		}
	},
	setEndDate : function(e, g) {
		var f = this.getStartDate();
		var h = this.getEndDate();
		this.set(this.endDateField, e);
		if (g === true && f && h) {
			this.setStartDate(Sch.util.Date.add(e, Sch.util.Date.MILLI, -(h - f)))
		}
	},
	setStartEndDate : function(f, e) {
		var d = !this.editing;
		d && this.beginEdit();
		this.set(this.startDateField, f);
		this.set(this.endDateField, e);
		d && this.endEdit()
	},
	getDates : function() {
		var f = [], d = this.getEndDate();
		for (var e = Ext.Date.clearTime(this.getStartDate(), true); e < d; e = Sch.util.Date.add(e, Sch.util.Date.DAY, 1)) {
			f.push(e)
		}
		return f
	},
	forEachDate : function(c, d) {
		return Ext.each(this.getDates(), c, d)
	},
	isValid : function() {
		var d = this.callParent(arguments);
		if (d) {
			var f = this.getStartDate(), e = this.getEndDate();
			d = !f || !e || (e - f >= 0)
		}
		return d
	},
	shift : function(c, d) {
		this.setStartEndDate(Sch.util.Date.add(this.getStartDate(), c, d), Sch.util.Date.add(this.getEndDate(), c, d))
	},
	fullCopy : function() {
		return this.copy.apply(this, arguments)
	}
});
Ext.define("Sch.model.TimeAxisTick", {
	extend : "Sch.model.Range",
	startDateField : "start",
	endDateField : "end"
});
Ext.define("Sch.model.Event", {
	extend : "Sch.model.Range",
	customizableFields : [ {
		name : "Id"
	}, {
		name : "ResourceId"
	}, {
		name : "Draggable",
		type : "boolean",
		persist : false,
		defaultValue : true
	}, {
		name : "Resizable",
		persist : false,
		defaultValue : true
	} ],
	resourceIdField : "ResourceId",
	draggableField : "Draggable",
	resizableField : "Resizable",
	getResource : function(f, d) {
		if (this.stores && this.stores.length > 0 || d) {
			var e = (d || this.stores[0]).resourceStore;
			f = f || this.get(this.resourceIdField);
			if (Ext.data.TreeStore && e instanceof Ext.data.TreeStore) {
				return e.getNodeById(f) || e.getRootNode().findChildBy(function(a) {
					return a.internalId === f
				})
			} else {
				return e.getById(f) || e.data.map[f]
			}
		}
		return null
	},
	setResource : function(b) {
		this.set(this.resourceIdField, (b instanceof Ext.data.Model) ? b.getId() || b.internalId : b)
	},
	assign : function(b) {
		this.setResource.apply(this, arguments)
	},
	unassign : function(b) {
	},
	isDraggable : function() {
		return this.getDraggable()
	},
	isAssignedTo : function(b) {
		return this.getResource() === b
	},
	isResizable : function() {
		return this.getResizable()
	},
	isPersistable : function() {
		var c = this.getResources();
		var d = true;
		Ext.each(c, function(a) {
			if (a.phantom) {
				d = false;
				return false
			}
		});
		return d
	},
	forEachResource : function(g, h) {
		var f = this.getResources();
		for (var e = 0; e < f.length; e++) {
			if (g.call(h || this, f[e]) === false) {
				return
			}
		}
	},
	getResources : function(d) {
		var c = this.getResource(null, d);
		return c ? [ c ] : []
	}
});
if (!Ext.ClassManager.get("Sch.model.Resource")) {
	Ext.define("Sch.model.Resource", {
		extend : "Sch.model.Customizable",
		idProperty : "Id",
		config : Ext.versions.touch ? {
			idProperty : "Id"
		} : null,
		nameField : "Name",
		customizableFields : [ "Id", {
			name : "Name",
			type : "string"
		} ],
		getEventStore : function() {
			return this.stores[0] && this.stores[0].eventStore || this.parentNode && this.parentNode.getEventStore()
		},
		getEvents : function(k) {
			var l = [], j, i = this.getId() || this.internalId;
			k = k || this.getEventStore();
			for (var g = 0, h = k.getCount(); g < h; g++) {
				j = k.getAt(g);
				if (j.data[j.resourceIdField] === i) {
					l.push(j)
				}
			}
			return l
		}
	})
}
Ext.define("Sch.data.mixin.EventStore", {
	model : "Sch.model.Event",
	config : {
		model : "Sch.model.Event"
	},
	requires : [ "Sch.util.Date" ],
	isEventStore : true,
	setResourceStore : function(b) {
		if (this.resourceStore) {
			this.resourceStore.un({
				beforesync : this.onResourceStoreBeforeSync,
				write : this.onResourceStoreWrite,
				scope : this
			})
		}
		this.resourceStore = b;
		if (b) {
			b.on({
				beforesync : this.onResourceStoreBeforeSync,
				write : this.onResourceStoreWrite,
				scope : this
			})
		}
	},
	onResourceStoreBeforeSync : function(f, j) {
		var g = f.create;
		if (g) {
			for (var h, i = g.length - 1; i >= 0; i--) {
				h = g[i];
				h._phantomId = h.internalId
			}
		}
	},
	onResourceStoreWrite : function(h, e) {
		if (e.wasSuccessful()) {
			var g = this, f = e.getRecords();
			Ext.each(f, function(a) {
				if (a._phantomId && !a.phantom) {
					g.each(function(b) {
						if (b.getResourceId() === a._phantomId) {
							b.assign(a)
						}
					})
				}
			})
		}
	},
	isDateRangeAvailable : function(i, h, g, k) {
		var l = true, j = Sch.util.Date;
		this.forEachScheduledEvent(function(b, c, a) {
			if (j.intersectSpans(i, h, c, a) && k === b.getResource() && (!g || g !== b)) {
				l = false;
				return false
			}
		});
		return l
	},
	getEventsInTimeSpan : function(g, e, f) {
		if (f !== false) {
			var h = Sch.util.Date;
			return this.queryBy(function(a) {
				var b = a.getStartDate(), c = a.getEndDate();
				return b && c && h.intersectSpans(b, c, g, e)
			})
		} else {
			return this.queryBy(function(a) {
				var b = a.getStartDate(), c = a.getEndDate();
				return b && c && (b - g >= 0) && (e - c >= 0)
			})
		}
	},
	forEachScheduledEvent : function(c, d) {
		this.each(function(a) {
			var b = a.getStartDate(), f = a.getEndDate();
			if (b && f) {
				return c.call(d || this, a, b, f)
			}
		}, this)
	},
	getTotalTimeSpan : function() {
		var e = new Date(9999, 0, 1), d = new Date(0), f = Sch.util.Date;
		this.each(function(a) {
			if (a.getStartDate()) {
				e = f.min(a.getStartDate(), e)
			}
			if (a.getEndDate()) {
				d = f.max(a.getEndDate(), d)
			}
		});
		e = e < new Date(9999, 0, 1) ? e : null;
		d = d > new Date(0) ? d : null;
		return {
			start : e || null,
			end : d || e || null
		}
	},
	getEventsForResource : function(j) {
		var l = [], k, i = j.getId() || j.internalId;
		for (var g = 0, h = this.getCount(); g < h; g++) {
			k = this.getAt(g);
			if (k.data[k.resourceIdField] == i) {
				l.push(k)
			}
		}
		return l
	},
	append : function(b) {
		throw "Must be implemented by consuming class"
	},
	getModel : function() {
		return this.model
	},
	setAssignmentStore : null,
	getAssignmentStore : null
});
Ext.define("Sch.data.EventStore", {
	extend : "Ext.data.Store",
	model : "Sch.model.Event",
	config : {
		model : "Sch.model.Event"
	},
	mixins : [ "Sch.data.mixin.EventStore" ],
	constructor : function() {
		this.callParent(arguments);
		if (this.getModel() !== Sch.model.Event && !(this.getModel().prototype instanceof Sch.model.Event)) {
			throw "The model for the EventStore must subclass Sch.model.Event"
		}
	},
	getByInternalId : function(b) {
		if (Ext.versions.extjs && Ext.versions.extjs.isLessThan("5.0")) {
			return this.data.getByKey(b)
		}
		return this.queryBy(function(a) {
			return a.internalId == b
		}).first()
	},
	append : function(b) {
		this.add(b)
	}
});
Ext.define("Sch.data.mixin.ResourceStore", {
	getModel : function() {
		return this.model
	}
});
Ext.define("Sch.data.FilterableNodeStore", {
	extend : "Ext.data.NodeStore",
	onNodeExpand : function(i, j, f) {
		var h = this.treeStore;
		var g = h.isTreeFiltered(true);
		if (g && i == this.node) {
			h.reApplyFilter()
		} else {
			return this.callParent(arguments)
		}
	},
	handleNodeExpand : function(k, q, i) {
		var m = [];
		var r = this.treeStore;
		var p = r.isTreeFiltered();
		var l = r.currentFilterGeneration;
		for (var o = 0; o < q.length; o++) {
			var n = q[o];
			if (!(p && n.__filterGen != l || n.hidden)) {
				m[m.length] = n
			}
		}
		return this.callParent([ k, m, i ])
	},
	onNodeCollapse : function(p, u, n, o, m) {
		var q = this;
		var s = this.data;
		var l = s.contains;
		var v = this.treeStore;
		var t = v.isTreeFiltered();
		var r = v.currentFilterGeneration;
		s.contains = function() {
			var e, f, c;
			var a = q.indexOf(p) + 1;
			var d = false;
			for (var b = 0; b < u.length; b++) {
				if (!(u[b].hidden || t && u[b].__filterGen != r) && l.call(this, u[b])) {
					e = p;
					while (e.parentNode) {
						f = e;
						do {
							f = f.nextSibling
						} while (f && (f.hidden || t && f.__filterGen != r));
						if (f) {
							d = true;
							c = q.indexOf(f);
							break
						} else {
							e = e.parentNode
						}
					}
					if (!d) {
						c = q.getCount()
					}
					q.removeAt(a, c - a);
					break
				}
			}
			return false
		};
		this.callParent(arguments);
		s.contains = l
	},
	onNodeAppend : function(k, q, o) {
		var l = this, n, j;
		var r = this.treeStore;
		var p = r.isTreeFiltered();
		var m = r.currentFilterGeneration;
		if (p) {
			q.__filterGen = m
		}
		if (l.isVisible(q)) {
			if (o === 0) {
				n = k
			} else {
				j = q;
				do {
					j = j.previousSibling
				} while (j && (j.hidden || p && j.__filterGen != m));
				if (!j) {
					n = k
				} else {
					while (j.isExpanded() && j.lastChild) {
						j = j.lastChild
					}
					n = j
				}
			}
			l.insert(l.indexOf(n) + 1, q);
			if (!q.isLeaf() && q.isExpanded()) {
				if (q.isLoaded()) {
					l.onNodeExpand(q, q.childNodes, true)
				} else {
					if (!l.treeStore.fillCount) {
						q.set("expanded", false);
						q.expand()
					}
				}
			}
		}
	}
});
Ext.define("Sch.data.mixin.FilterableTreeStore", {
	requires : [ "Sch.data.FilterableNodeStore" ],
	nodeStoreClassName : "Sch.data.FilterableNodeStore",
	nodeStore : null,
	isFilteredFlag : false,
	isHiddenFlag : false,
	lastTreeFilter : null,
	lastTreeHiding : null,
	allowExpandCollapseWhileFiltered : true,
	reApplyFilterOnDataChange : true,
	suspendIncrementalFilterRefresh : 0,
	filterGeneration : 0,
	currentFilterGeneration : null,
	dataChangeListeners : null,
	monitoringDataChange : false,
	initTreeFiltering : function() {
		if (!this.nodeStore) {
			this.nodeStore = this.createNodeStore(this)
		}
		this.dataChangeListeners = {
			append : this.onNeedToUpdateFilter,
			insert : this.onNeedToUpdateFilter,
			scope : this
		}
	},
	startDataChangeMonitoring : function() {
		if (this.monitoringDataChange) {
			return
		}
		this.monitoringDataChange = true;
		this.on(this.dataChangeListeners)
	},
	stopDataChangeMonitoring : function() {
		if (!this.monitoringDataChange) {
			return
		}
		this.monitoringDataChange = false;
		this.un(this.dataChangeListeners)
	},
	onNeedToUpdateFilter : function() {
		if (this.reApplyFilterOnDataChange && !this.suspendIncrementalFilterRefresh) {
			this.reApplyFilter()
		}
	},
	createNodeStore : function(b) {
		return Ext.create(this.nodeStoreClassName, {
			treeStore : b,
			recursive : true,
			rootVisible : this.rootVisible
		})
	},
	clearTreeFilter : function() {
		if (!this.isTreeFiltered()) {
			return
		}
		this.currentFilterGeneration = null;
		this.isFilteredFlag = false;
		this.lastTreeFilter = null;
		if (!this.isTreeFiltered(true)) {
			this.stopDataChangeMonitoring()
		}
		this.refreshNodeStoreContent();
		this.fireEvent("filter-clear", this)
	},
	reApplyFilter : function() {
		if (this.isHiddenFlag) {
			this.hideNodesBy.apply(this, this.lastTreeHiding.concat(this.isFilteredFlag))
		}
		if (this.isFilteredFlag) {
			this.filterTreeBy(this.lastTreeFilter)
		}
	},
	refreshNodeStoreContent : function(r) {
		var l = this.getRootNode(), j = [];
		var k = this.rootVisible;
		var q = this.isTreeFiltered();
		var n = this;
		var m = this.currentFilterGeneration;
		var o = function(a) {
			if (q && a.__filterGen != m || a.hidden) {
				return
			}
			if (k || a != l) {
				j[j.length] = a
			}
			if (!a.data.leaf && a.isExpanded()) {
				var d = a.childNodes, b = d.length;
				for (var c = 0; c < b; c++) {
					o(d[c])
				}
			}
		};
		o(l);
		this.fireEvent("nodestore-datachange-start", this);
		var p = this.nodeStore;
		if (!this.loadDataInNodeStore || !this.loadDataInNodeStore(j)) {
			p.loadRecords(j)
		}
		if (!r) {
			p.fireEvent("clear", p)
		}
		this.fireEvent("nodestore-datachange-end", this)
	},
	getIndexInTotalDataset : function(o) {
		var p = this.getRootNode(), m = -1;
		var l = this.rootVisible;
		if (!l && o == p) {
			return -1
		}
		var i = this.isTreeFiltered();
		var k = this;
		var j = this.currentFilterGeneration;
		var n = function(b) {
			if (i && b.__filterGen != j || b.hidden) {
				if (b == o) {
					return false
				}
			}
			if (l || b != p) {
				m++
			}
			if (b == o) {
				return false
			}
			if (!b.data.leaf && b.isExpanded()) {
				var a = b.childNodes, c = a.length;
				for (var d = 0; d < c; d++) {
					if (n(a[d]) === false) {
						return false
					}
				}
			}
		};
		n(p);
		return m
	},
	isTreeFiltered : function(b) {
		return this.isFilteredFlag || b && this.isHiddenFlag
	},
	collectFilteredNodes : function(C, i) {
		var u = this.currentFilterGeneration;
		var y = {};
		var z = this.getRootNode(), H = this.rootVisible, I = [];
		var L = function(a) {
			var b = a.parentNode;
			while (b && !y[b.internalId]) {
				y[b.internalId] = true;
				b = b.parentNode
			}
		};
		var F = i.filter;
		var K = i.scope || this;
		var D = i.shallow;
		var v = i.checkParents || D;
		var E = i.fullMathchingParents;
		var J = i.onlyParents || E;
		if (J && v) {
			throw new Error("Can't combine `onlyParents` and `checkParents` options")
		}
		var A = function(b) {
			if (b.hidden) {
				return
			}
			var d, a, c, e;
			if (b.data.leaf) {
				if (F.call(K, b, y)) {
					I[I.length] = b;
					L(b)
				}
			} else {
				if (H || b != z) {
					I[I.length] = b
				}
				if (J) {
					d = F.call(K, b);
					a = b.childNodes;
					c = a.length;
					if (d) {
						y[b.internalId] = true;
						L(b);
						if (E) {
							b.cascadeBy(function(f) {
								if (f != b) {
									I[I.length] = f;
									if (!f.data.leaf) {
										y[f.internalId] = true
									}
								}
							});
							return
						}
					}
					for (e = 0; e < c; e++) {
						if (d && a[e].data.leaf) {
							I[I.length] = a[e]
						} else {
							if (!a[e].data.leaf) {
								A(a[e])
							}
						}
					}
				} else {
					if (v) {
						d = F.call(K, b, y);
						if (d) {
							y[b.internalId] = true;
							L(b)
						}
					}
					if (!v || !D || D && (d || b == z && !H)) {
						a = b.childNodes;
						c = a.length;
						for (e = 0; e < c; e++) {
							A(a[e])
						}
					}
				}
			}
		};
		A(C);
		var G = [];
		for (var x = 0, w = I.length; x < w; x++) {
			var B = I[x];
			if (B.data.leaf || y[B.internalId]) {
				G[G.length] = B;
				B.__filterGen = u;
				if (this.allowExpandCollapseWhileFiltered && !B.data.leaf) {
					B.data.expanded = true
				}
			}
		}
		return G
	},
	filterTreeBy : function(h, j) {
		this.currentFilterGeneration = this.filterGeneration++;
		var f;
		if (arguments.length == 1 && Ext.isObject(arguments[0])) {
			j = h.scope;
			f = h.filter
		} else {
			f = h;
			h = {
				filter : f,
				scope : j
			}
		}
		this.fireEvent("nodestore-datachange-start", this);
		h = h || {};
		var g = this.collectFilteredNodes(this.getRootNode(), h);
		var i = this.nodeStore;
		if (!this.loadDataInNodeStore || !this.loadDataInNodeStore(g)) {
			i.loadRecords(g, false);
			i.fireEvent("clear", i)
		}
		this.startDataChangeMonitoring();
		this.isFilteredFlag = true;
		this.lastTreeFilter = h;
		this.fireEvent("nodestore-datachange-end", this);
		this.fireEvent("filter-set", this)
	},
	hideNodesBy : function(e, f, g) {
		if (this.isFiltered()) {
			throw new Error("Can't hide nodes of the filtered tree store")
		}
		var h = this;
		f = f || this;
		this.getRootNode().cascadeBy(function(a) {
			a.hidden = e.call(f, a, h)
		});
		this.startDataChangeMonitoring();
		this.isHiddenFlag = true;
		this.lastTreeHiding = [ e, f ];
		if (!g) {
			this.refreshNodeStoreContent()
		}
	},
	showAllNodes : function(b) {
		this.getRootNode().cascadeBy(function(a) {
			a.hidden = false
		});
		this.isHiddenFlag = false;
		this.lastTreeHiding = null;
		if (!this.isTreeFiltered(true)) {
			this.stopDataChangeMonitoring()
		}
		if (!b) {
			this.refreshNodeStoreContent()
		}
	},
	inheritables : function() {
		return {
			load : function(m) {
				var p = this.getRootNode();
				if (p) {
					var t = this.nodeStore;
					var w = p.removeAll;
					p.removeAll = function() {
						w.apply(this, arguments);
						t && t.fireEvent("clear", t);
						delete p.removeAll
					}
				}
				var x = Ext.getVersion("extjs").isLessThan("4.2.2.1144");
				if (x) {
					m = m || {};
					var s = false;
					var v;
					this.on("beforeload", function(b, a) {
						v = a.node;
						s = v.data.expanded;
						v.data.expanded = false
					}, this, {
						single : true
					});
					var o = m.callback;
					var n = m.scope;
					m.callback = function() {
						if (s) {
							v.expand()
						}
						Ext.callback(o, n, arguments)
					}
				}
				var r = this;
				m = m || {};
				var u = m.callback;
				var q = m.scope;
				m.callback = function() {
					r.suspendIncrementalFilterRefresh--;
					Ext.callback(u, q, arguments)
				};
				this.suspendIncrementalFilterRefresh++;
				this.callParent([ m ]);
				if (p) {
					delete p.removeAll
				}
			}
		}
	}
});
Ext.define("Sch.data.ResourceStore", {
	extend : "Ext.data.Store",
	model : "Sch.model.Resource",
	config : {
		model : "Sch.model.Resource"
	},
	mixins : [ "Sch.data.mixin.ResourceStore" ],
	constructor : function() {
		this.callParent(arguments);
		if (this.getModel() !== Sch.model.Resource && !(this.getModel().prototype instanceof Sch.model.Resource)) {
			throw "The model for the ResourceStore must subclass Sch.model.Resource"
		}
	}
});
Ext.define("Sch.data.ResourceTreeStore", {
	extend : "Ext.data.TreeStore",
	model : "Sch.model.Resource",
	mixins : [ "Sch.data.mixin.ResourceStore", "Sch.data.mixin.FilterableTreeStore" ],
	constructor : function() {
		this.callParent(arguments);
		this.initTreeFiltering();
		if (this.getModel() !== Sch.model.Resource && !(this.getModel().prototype instanceof Sch.model.Resource)) {
			throw "The model for the ResourceTreeStore must subclass Sch.model.Resource"
		}
	},
	setRootNode : function() {
		this.isSettingRoot = true;
		var b = this.callParent(arguments);
		this.isSettingRoot = false;
		return b
	}
}, function() {
	this.override(Sch.data.mixin.FilterableTreeStore.prototype.inheritables() || {})
});
Ext.define("Sch.data.TimeAxis", {
	extend : "Ext.data.JsonStore",
	requires : [ "Sch.util.Date", "Sch.model.TimeAxisTick" ],
	model : "Sch.model.TimeAxisTick",
	continuous : true,
	originalContinuous : null,
	autoAdjust : true,
	unit : null,
	increment : null,
	resolutionUnit : null,
	resolutionIncrement : null,
	weekStartDay : null,
	mainUnit : null,
	shiftUnit : null,
	shiftIncrement : 1,
	defaultSpan : 1,
	isConfigured : false,
	adjustedStart : null,
	adjustedEnd : null,
	visibleTickStart : null,
	visibleTickEnd : null,
	constructor : function(d) {
		var c = this;
		if (c.setModel) {
			c.setModel(c.model)
		}
		c.originalContinuous = c.continuous;
		c.callParent(arguments);
		c.on(Ext.versions.touch ? "refresh" : "datachanged", function(f, b, a) {
			c.fireEvent("reconfigure", c, b, a)
		});
		if (d && c.start) {
			c.reconfigure(d)
		}
	},
	reconfigure : function(v, z) {
		this.isConfigured = true;
		Ext.apply(this, v);
		var n = this.getAdjustedDates(v.start, v.end, true);
		var o = this.getAdjustedDates(v.start, v.end);
		var y = o.start;
		var u = o.end;
		if (this.fireEvent("beforereconfigure", this, y, u) !== false) {
			this.fireEvent("beginreconfigure", this);
			var q = this.unit;
			var p = this.increment || 1;
			var r = this.generateTicks(y, u, q, p, this.mainUnit);
			var w = Ext.Object.getKeys(v).length;
			var t = (w === 1 && "start" in v) || (w === 2 && "start" in v && "end" in v);
			this.removeAll(true);
			this.suspendEvents();
			this.add(r);
			if (this.getCount() === 0) {
				Ext.Error.raise("Invalid time axis configuration or filter, please check your input data.")
			}
			this.resumeEvents();
			var x = Sch.util.Date;
			var s = r.length;
			if (this.isContinuous()) {
				this.adjustedStart = n.start;
				this.adjustedEnd = this.getNext(s > 1 ? r[s - 1].start : n.start, q, p)
			} else {
				this.adjustedStart = this.getStart();
				this.adjustedEnd = this.getEnd()
			}
			do {
				this.visibleTickStart = (this.getStart() - this.adjustedStart) / (x.getUnitDurationInMs(q) * p);
				if (this.visibleTickStart >= 1) {
					this.adjustedStart = x.getNext(this.adjustedStart, q, 1)
				}
			} while (this.visibleTickStart >= 1);
			do {
				this.visibleTickEnd = s - (this.adjustedEnd - this.getEnd()) / (x.getUnitDurationInMs(q) * p);
				if (s - this.visibleTickEnd >= 1) {
					this.adjustedEnd = x.getNext(this.adjustedEnd, q, -1)
				}
			} while (s - this.visibleTickEnd >= 1);
			this.fireEvent("datachanged", this, !t, z);
			this.fireEvent("refresh", this, !t, z);
			this.fireEvent("endreconfigure", this)
		}
	},
	setTimeSpan : function(f, e) {
		var d = this.getAdjustedDates(f, e);
		f = d.start;
		e = d.end;
		if (this.getStart() - f !== 0 || this.getEnd() - e !== 0) {
			this.reconfigure({
				start : f,
				end : e
			})
		}
	},
	filterBy : function(c, d) {
		this.continuous = false;
		d = d || this;
		this.clearFilter(true);
		this.suspendEvents(true);
		this.filter([ {
			filterFn : function(a, b) {
				return c.call(d, a.data, b)
			}
		} ]);
		if (this.getCount() === 0) {
			this.clearFilter();
			this.resumeEvents();
			Ext.Error.raise("Invalid time axis filter - no ticks passed through the filter. Please check your filter method.")
		}
		this.resumeEvents()
	},
	isContinuous : function() {
		return this.continuous && !this.isFiltered()
	},
	clearFilter : function() {
		this.continuous = this.originalContinuous;
		this.callParent(arguments)
	},
	generateTicks : function(t, q, n, l) {
		var m = [], o, s = Sch.util.Date, p = 0;
		n = n || this.unit;
		l = l || this.increment;
		var k = this.getAdjustedDates(t, q);
		t = k.start;
		q = k.end;
		while (t < q) {
			o = this.getNext(t, n, l);
			if (!this.autoAdjust && o > q) {
				o = q
			}
			if (n === s.HOUR && l > 1 && m.length > 0 && p === 0) {
				var r = m[m.length - 1];
				p = ((r.start.getHours() + l) % 24) - r.end.getHours();
				if (p !== 0) {
					o = s.add(o, s.HOUR, p)
				}
			}
			m.push({
				start : t,
				end : o
			});
			t = o
		}
		return m
	},
	getVisibleTickTimeSpan : function() {
		return this.isContinuous() ? this.visibleTickEnd - this.visibleTickStart : this.getCount()
	},
	getAdjustedDates : function(f, d, e) {
		f = f || this.getStart();
		d = d || Sch.util.Date.add(f, this.mainUnit, this.defaultSpan);
		return this.autoAdjust || e ? {
			start : this.floorDate(f, false, this.mainUnit, 1),
			end : this.ceilDate(d, false, this.mainUnit, 1)
		} : {
			start : f,
			end : d
		}
	},
	getTickFromDate : function(q) {
		var l = this.data.items;
		var m = l.length - 1;
		if (q < l[0].data.start || q > l[m].data.end) {
			return -1
		}
		var o, n, s;
		if (this.isContinuous()) {
			if (q - l[0].data.start === 0) {
				return this.visibleTickStart
			}
			if (q - l[m].data.end === 0) {
				return this.visibleTickEnd
			}
			var i = this.adjustedStart;
			var t = this.adjustedEnd;
			var r = Math.floor(l.length * (q - i) / (t - i));
			if (r > m) {
				r = m
			}
			n = r === 0 ? i : l[r].data.start;
			s = r == m ? t : l[r].data.end;
			o = r + (q - n) / (s - n);
			if (o < this.visibleTickStart || o > this.visibleTickEnd) {
				return -1
			}
			return o
		} else {
			for (var p = 0; p <= m; p++) {
				s = l[p].data.end;
				if (q <= s) {
					n = l[p].data.start;
					o = p + (q > n ? (q - n) / (s - n) : 0);
					return o
				}
			}
		}
		return -1
	},
	getDateFromTick : function(n, j) {
		if (n === this.visibleTickEnd) {
			return this.getEnd()
		}
		var q = Math.floor(n), l = n - q, k = this.getAt(q);
		if (!k) {
			return null
		}
		var m = k.data;
		var r = q === 0 ? this.adjustedStart : m.start;
		var o = (q == this.getCount() - 1) && this.isContinuous() ? this.adjustedEnd : m.end;
		var p = Sch.util.Date.add(r, Sch.util.Date.MILLI, l * (o - r));
		if (j) {
			p = this[j + "Date"](p)
		}
		return p
	},
	getTicks : function() {
		var b = [];
		this.each(function(a) {
			b.push(a.data)
		});
		return b
	},
	getStart : function() {
		var b = this.first();
		if (b) {
			return new Date(b.data.start)
		}
		return null
	},
	getEnd : function() {
		var b = this.last();
		if (b) {
			return new Date(b.data.end)
		}
		return null
	},
	floorDate : function(t, r, q, x) {
		r = r !== false;
		var v = Ext.Date.clone(t), u = r ? this.getStart() : null, m = x || this.resolutionIncrement, n;
		if (q) {
			n = q
		} else {
			n = r ? this.resolutionUnit : this.mainUnit
		}
		var w = Sch.util.Date;
		var s = function(b, a) {
			return Math.floor(b / a) * a
		};
		switch (n) {
		case w.MILLI:
			if (r) {
				v = w.add(u, w.MILLI, s(w.getDurationInMilliseconds(u, v), m))
			}
			break;
		case w.SECOND:
			if (r) {
				v = w.add(u, w.MILLI, s(w.getDurationInSeconds(u, v), m) * 1000)
			} else {
				v.setMilliseconds(0);
				v.setSeconds(s(v.getSeconds(), m))
			}
			break;
		case w.MINUTE:
			if (r) {
				v = w.add(u, w.SECOND, s(w.getDurationInMinutes(u, v), m) * 60)
			} else {
				v.setMinutes(s(v.getMinutes(), m));
				v.setSeconds(0);
				v.setMilliseconds(0)
			}
			break;
		case w.HOUR:
			if (r) {
				v = w.add(u, w.MINUTE, s(w.getDurationInHours(this.getStart(), v), m) * 60)
			} else {
				v.setMinutes(0);
				v.setSeconds(0);
				v.setMilliseconds(0);
				v.setHours(s(v.getHours(), m))
			}
			break;
		case w.DAY:
			if (r) {
				v = w.add(u, w.DAY, s(w.getDurationInDays(u, v), m))
			} else {
				Ext.Date.clearTime(v);
				v.setDate(s(v.getDate() - 1, m) + 1)
			}
			break;
		case w.WEEK:
			var o = v.getDay() || 7;
			var p = this.weekStartDay || 7;
			Ext.Date.clearTime(v);
			v = w.add(v, w.DAY, o >= p ? p - o : -(7 - p + o));
			break;
		case w.MONTH:
			if (r) {
				v = w.add(u, w.MONTH, s(w.getDurationInMonths(u, v), m))
			} else {
				Ext.Date.clearTime(v);
				v.setDate(1);
				v.setMonth(s(v.getMonth(), m))
			}
			break;
		case w.QUARTER:
			Ext.Date.clearTime(v);
			v.setDate(1);
			v = w.add(v, w.MONTH, -(v.getMonth() % 3));
			break;
		case w.YEAR:
			if (r) {
				v = w.add(u, w.YEAR, s(w.getDurationInYears(u, v), m))
			} else {
				v = new Date(s(t.getFullYear() - 1, m) + 1, 0, 1)
			}
			break
		}
		return v
	},
	roundDate : function(w, M) {
		var C = Ext.Date.clone(w), v = this.resolutionIncrement;
		M = M || this.getStart();
		switch (this.resolutionUnit) {
		case Sch.util.Date.MILLI:
			var J = Sch.util.Date.getDurationInMilliseconds(M, C), K = Math.round(J / v) * v;
			C = Sch.util.Date.add(M, Sch.util.Date.MILLI, K);
			break;
		case Sch.util.Date.SECOND:
			var F = Sch.util.Date.getDurationInSeconds(M, C), x = Math.round(F / v) * v;
			C = Sch.util.Date.add(M, Sch.util.Date.MILLI, x * 1000);
			break;
		case Sch.util.Date.MINUTE:
			var A = Sch.util.Date.getDurationInMinutes(M, C), N = Math.round(A / v) * v;
			C = Sch.util.Date.add(M, Sch.util.Date.SECOND, N * 60);
			break;
		case Sch.util.Date.HOUR:
			var B = Sch.util.Date.getDurationInHours(M, C), E = Math.round(B / v) * v;
			C = Sch.util.Date.add(M, Sch.util.Date.MINUTE, E * 60);
			break;
		case Sch.util.Date.DAY:
			var L = Sch.util.Date.getDurationInDays(M, C), I = Math.round(L / v) * v;
			C = Sch.util.Date.add(M, Sch.util.Date.DAY, I);
			break;
		case Sch.util.Date.WEEK:
			Ext.Date.clearTime(C);
			var z = C.getDay() - this.weekStartDay, u;
			if (z < 0) {
				z = 7 + z
			}
			if (Math.round(z / 7) === 1) {
				u = 7 - z
			} else {
				u = -z
			}
			C = Sch.util.Date.add(C, Sch.util.Date.DAY, u);
			break;
		case Sch.util.Date.MONTH:
			var y = Sch.util.Date.getDurationInMonths(M, C) + (C.getDate() / Ext.Date.getDaysInMonth(C)), G = Math.round(y / v) * v;
			C = Sch.util.Date.add(M, Sch.util.Date.MONTH, G);
			break;
		case Sch.util.Date.QUARTER:
			Ext.Date.clearTime(C);
			C.setDate(1);
			C = Sch.util.Date.add(C, Sch.util.Date.MONTH, 3 - (C.getMonth() % 3));
			break;
		case Sch.util.Date.YEAR:
			var D = Sch.util.Date.getDurationInYears(M, C), H = Math.round(D / v) * v;
			C = Sch.util.Date.add(M, Sch.util.Date.YEAR, H);
			break
		}
		return C
	},
	ceilDate : function(n, h, k) {
		var l = Ext.Date.clone(n);
		h = h !== false;
		var i = h ? this.resolutionIncrement : 1, j = false, m;
		if (k) {
			m = k
		} else {
			m = h ? this.resolutionUnit : this.mainUnit
		}
		switch (m) {
		case Sch.util.Date.HOUR:
			if (l.getMinutes() > 0 || l.getSeconds() > 0 || l.getMilliseconds() > 0) {
				j = true
			}
			break;
		case Sch.util.Date.DAY:
			if (l.getHours() > 0 || l.getMinutes() > 0 || l.getSeconds() > 0 || l.getMilliseconds() > 0) {
				j = true
			}
			break;
		case Sch.util.Date.WEEK:
			Ext.Date.clearTime(l);
			if (l.getDay() !== this.weekStartDay) {
				j = true
			}
			break;
		case Sch.util.Date.MONTH:
			Ext.Date.clearTime(l);
			if (l.getDate() !== 1) {
				j = true
			}
			break;
		case Sch.util.Date.QUARTER:
			Ext.Date.clearTime(l);
			if (l.getMonth() % 3 !== 0 || (l.getMonth() % 3 === 0 && l.getDate() !== 1)) {
				j = true
			}
			break;
		case Sch.util.Date.YEAR:
			Ext.Date.clearTime(l);
			if (l.getMonth() !== 0 || l.getDate() !== 1) {
				j = true
			}
			break;
		default:
			break
		}
		if (j) {
			return this.getNext(l, m, i)
		} else {
			return l
		}
	},
	getNext : function(d, f, e) {
		return Sch.util.Date.getNext(d, f, e, this.weekStartDay)
	},
	getResolution : function() {
		return {
			unit : this.resolutionUnit,
			increment : this.resolutionIncrement
		}
	},
	setResolution : function(c, d) {
		this.resolutionUnit = c;
		this.resolutionIncrement = d || 1
	},
	shift : function(d, c) {
		this.setTimeSpan(Sch.util.Date.add(this.getStart(), c, d), Sch.util.Date.add(this.getEnd(), c, d))
	},
	shiftNext : function(d) {
		d = d || this.getShiftIncrement();
		var c = this.getShiftUnit();
		this.setTimeSpan(Sch.util.Date.add(this.getStart(), c, d), Sch.util.Date.add(this.getEnd(), c, d))
	},
	shiftPrevious : function(d) {
		d = -(d || this.getShiftIncrement());
		var c = this.getShiftUnit();
		this.setTimeSpan(Sch.util.Date.add(this.getStart(), c, d), Sch.util.Date.add(this.getEnd(), c, d))
	},
	getShiftUnit : function() {
		return this.shiftUnit || this.mainUnit
	},
	getShiftIncrement : function() {
		return this.shiftIncrement || 1
	},
	getUnit : function() {
		return this.unit
	},
	getIncrement : function() {
		return this.increment
	},
	dateInAxis : function(b) {
		return Sch.util.Date.betweenLesser(b, this.getStart(), this.getEnd())
	},
	timeSpanInAxis : function(c, d) {
		if (this.isContinuous()) {
			return Sch.util.Date.intersectSpans(c, d, this.getStart(), this.getEnd())
		} else {
			return (c < this.getStart() && d > this.getEnd()) || this.getTickFromDate(c) !== this.getTickFromDate(d)
		}
	},
	forEachAuxInterval : function(k, i, j, m) {
		m = m || this;
		var p = this.getEnd(), l = this.getStart(), n = 0, o;
		if (l > p) {
			throw "Invalid time axis configuration"
		}
		while (l < p) {
			o = Sch.util.Date.min(this.getNext(l, k, i || 1), p);
			j.call(m, l, o, n);
			l = o;
			n++
		}
	},
	consumeViewPreset : function(b) {
		Ext.apply(this, {
			unit : b.getBottomHeader().unit,
			increment : b.getBottomHeader().increment || 1,
			resolutionUnit : b.timeResolution.unit,
			resolutionIncrement : b.timeResolution.increment,
			mainUnit : b.getMainHeader().unit,
			shiftUnit : b.shiftUnit,
			shiftIncrement : b.shiftIncrement || 1,
			defaultSpan : b.defaultSpan || 1
		})
	}
});
Ext
		.define(
				"Sch.view.Horizontal",
				{
					requires : [ "Ext.util.Region", "Ext.Element", "Sch.util.Date" ],
					view : null,
					constructor : function(b) {
						Ext.apply(this, b)
					},
					translateToScheduleCoordinate : function(d) {
						var c = this.view;
						if (c.rtl) {
							return c.getTimeAxisColumn().getEl().getRight() - d
						}
						return d - c.getEl().getX() + c.getScroll().left
					},
					translateToPageCoordinate : function(d) {
						var c = this.view;
						return d + c.getEl().getX() - c.getScroll().left
					},
					getEventRenderData : function(x, w, v) {
						var q = w || x.getStartDate(), r = v || x.getEndDate() || q, o = this.view, s = o.timeAxis.getStart(), n = o.timeAxis
								.getEnd(), p = Math, t = o.getXFromDate(Sch.util.Date.max(q, s)), m = o.getXFromDate(Sch.util.Date.min(r, n)), u = {};
						if (this.view.rtl) {
							u.right = p.min(t, m)
						} else {
							u.left = p.min(t, m)
						}
						u.width = p.max(1, p.abs(m - t)) - o.eventBorderWidth;
						if (o.managedEventSizing) {
							u.top = p.max(0, (o.barMargin - ((Ext.isIE && !Ext.isStrict) ? 0 : o.eventBorderWidth - o.cellTopBorderWidth)));
							u.height = o.timeAxisViewModel.rowHeightHorizontal - (2 * o.barMargin) - o.eventBorderWidth
						}
						u.start = q;
						u.end = r;
						u.startsOutsideView = q < s;
						u.endsOutsideView = r > n;
						return u
					},
					getScheduleRegion : function(t, r) {
						var v = Ext.Element.prototype.getRegion ? "getRegion" : "getPageBox", o = this.view, p = t ? Ext.fly(o.getRowNode(t))[v]()
								: o.getTableRegion(), s = o.timeAxis.getStart(), m = o.timeAxis.getEnd(), w = o.getDateConstraints(t, r) || {
							start : s,
							end : m
						}, u = this.translateToPageCoordinate(o.getXFromDate(Sch.util.Date.max(s, w.start))), n = this.translateToPageCoordinate(o
								.getXFromDate(Sch.util.Date.min(m, w.end))), q = p.top + o.barMargin, x = p.bottom - o.barMargin - o.eventBorderWidth;
						return new Ext.util.Region(q, Math.max(u, n), x, Math.min(u, n))
					},
					getResourceRegion : function(u, z, v) {
						var r = this.view, A = r.getRowNode(u), y = Ext.fly(A).getOffsetsTo(r.getEl()), t = r.timeAxis.getStart(), p = r.timeAxis
								.getEnd(), B = z ? Sch.util.Date.max(t, z) : t, x = v ? Sch.util.Date.min(p, v) : p, w = r.getXFromDate(B), q = r
								.getXFromDate(x), s = y[1] + r.cellTopBorderWidth, D = y[1] + Ext.fly(A).getHeight() - r.cellBottomBorderWidth;
						if (!Ext.versions.touch) {
							var C = r.getScroll();
							s += C.top;
							D += C.top
						}
						return new Ext.util.Region(s, Math.max(w, q), D, Math.min(w, q))
					},
					columnRenderer : function(A, i, u, s, l) {
						var r = this.view;
						var C = r.eventStore.getEventsForResource(u);
						if (C.length === 0) {
							return
						}
						var w = r.timeAxis, t = [], x, z;
						for (x = 0, z = C.length; x < z; x++) {
							var D = C[x], B = D.getStartDate(), y = D.getEndDate();
							if (B && y && w.timeSpanInAxis(B, y)) {
								t[t.length] = r.generateTplData(D, u, s)
							}
						}
						if (r.dynamicRowHeight) {
							var v = r.eventLayout.horizontal;
							v.applyLayout(t, u);
							i.rowHeight = v.getRowHeight(u, C)
						}
						return r.eventTpl.apply(t)
					},
					resolveResource : function(d) {
						var e = this.view;
						var f = e.findRowByChild(d);
						if (f) {
							return e.getRecordForRowNode(f)
						}
						return null
					},
					getTimeSpanRegion : function(i, k, l) {
						var o = this.view, p = o.getXFromDate(i), n = k ? o.getXFromDate(k) : p, j, m;
						m = o.getTableRegion();
						if (l) {
							j = Math.max(m ? m.bottom - m.top : 0, o.getEl().dom.clientHeight)
						} else {
							j = m ? m.bottom - m.top : 0
						}
						return new Ext.util.Region(0, Math.max(p, n), j, Math.min(p, n))
					},
					getStartEndDatesFromRegion : function(j, m, n) {
						var h = this.view;
						var k = h.rtl;
						var i = h.getDateFromCoordinate(k ? j.right : j.left, m), l = h.getDateFromCoordinate(k ? j.left : j.right, m);
						if (i && l || n && (i || l)) {
							return {
								start : i,
								end : l
							}
						}
						return null
					},
					onEventAdd : function(i, j) {
						var k = this.view;
						var p = {};
						for (var l = 0, r = j.length; l < r; l++) {
							var t = j[l].getResources(k.eventStore);
							for (var o = 0, q = t.length; o < q; o++) {
								var s = t[o];
								p[s.getId()] = s
							}
						}
						Ext.Object.each(p, function(a, b) {
							k.repaintEventsForResource(b)
						})
					},
					onEventRemove : function(i, p) {
						var m = this.view;
						var l = this.resourceStore;
						var o = Ext.tree && Ext.tree.View && m instanceof Ext.tree.View;
						if (!Ext.isArray(p)) {
							p = [ p ]
						}
						var n = function(a) {
							if (m.store.indexOf(a) >= 0) {
								m.repaintEventsForResource(a)
							}
						};
						for (var q = 0; q < p.length; q++) {
							var t = p[q].getResources(m.eventStore);
							if (t.length > 1) {
								Ext.each(t, n, this)
							} else {
								var s = m.getEventNodeByRecord(p[q]);
								if (s) {
									var r = m.resolveResource(s);
									if (Ext.Element.prototype.fadeOut) {
										Ext.get(s).fadeOut({
											callback : function() {
												n(r)
											}
										})
									} else {
										Ext.Anim.run(Ext.get(s), "fade", {
											out : true,
											duration : 500,
											after : function() {
												n(r)
											},
											autoClear : false
										})
									}
								}
							}
						}
					},
					onEventUpdate : function(n, m, h) {
						var l = m.previous;
						var i = this.view;
						if (l && l[m.resourceIdField]) {
							var k = m.getResource(l[m.resourceIdField], i.eventStore);
							if (k) {
								i.repaintEventsForResource(k, true)
							}
						}
						var j = m.getResources(i.eventStore);
						Ext.each(j, function(a) {
							i.repaintEventsForResource(a, true)
						})
					},
					setColumnWidth : function(f, d) {
						var e = this.view;
						e.getTimeAxisViewModel().setViewColumnWidth(f, d)
					},
					getVisibleDateRange : function() {
						var k = this.view;
						if (!k.getEl()) {
							return null
						}
						var l = k.getTableRegion(), g = k.timeAxis.getStart(), i = k.timeAxis.getEnd(), j = k.getWidth();
						if ((l.right - l.left) < j) {
							return {
								startDate : g,
								endDate : i
							}
						}
						var h = k.getScroll();
						return {
							startDate : k.getDateFromCoordinate(h.left, null, true),
							endDate : k.getDateFromCoordinate(h.left + j, null, true)
						}
					}
				});
Ext
		.define(
				"Sch.view.Vertical",
				{
					view : null,
					constructor : function(b) {
						Ext.apply(this, b)
					},
					translateToScheduleCoordinate : function(c) {
						var d = this.view;
						return c - d.getEl().getY() + d.getScroll().top
					},
					translateToPageCoordinate : function(g) {
						var e = this.view;
						var h = e.getEl(), f = h.getScroll();
						return g + h.getY() - f.top
					},
					getEventRenderData : function(v) {
						var p = v.getStartDate(), q = v.getEndDate(), n = this.view, r = n.timeAxis.getStart(), m = n.timeAxis.getEnd(), o = Math, s = o
								.floor(n.getCoordinateFromDate(Sch.util.Date.max(p, r))), l = o.floor(n
								.getCoordinateFromDate(Sch.util.Date.min(q, m))), t = this.getResourceColumnWidth(v.getResource(), n.eventStore), u;
						u = {
							top : o.max(0, o.min(s, l) - n.eventBorderWidth),
							height : o.max(1, o.abs(s - l))
						};
						if (n.managedEventSizing) {
							u.left = n.barMargin;
							u.width = t - (2 * n.barMargin) - n.eventBorderWidth
						}
						u.start = p;
						u.end = q;
						u.startsOutsideView = p < r;
						u.endsOutsideView = q > m;
						return u
					},
					getScheduleRegion : function(s, q) {
						var o = this.view, p = s ? Ext.fly(o.getScheduleCell(0, o.resourceStore.indexOf(s))).getRegion() : o.getTableRegion(), r = o.timeAxis
								.getStart(), l = o.timeAxis.getEnd(), v = o.getDateConstraints(s, q) || {
							start : r,
							end : l
						}, t = this.translateToPageCoordinate(o.getCoordinateFromDate(Sch.util.Date.max(r, v.start))), m = this
								.translateToPageCoordinate(o.getCoordinateFromDate(Sch.util.Date.min(l, v.end))), u = p.left + o.barMargin, n = (s ? (p.left + this
								.getResourceColumnWidth(s))
								: p.right)
								- o.barMargin;
						return new Ext.util.Region(Math.min(t, m), n, Math.max(t, m), u)
					},
					getResourceColumnWidth : function(b) {
						return this.view.resourceColumnWidth
					},
					getResourceRegion : function(s, y, t) {
						var q = this.view, v = q.resourceStore.indexOf(s) * this.getResourceColumnWidth(s), r = q.timeAxis.getStart(), n = q.timeAxis
								.getEnd(), z = y ? Sch.util.Date.max(r, y) : r, w = t ? Sch.util.Date.min(n, t) : n, u = Math.max(0, q
								.getCoordinateFromDate(z)
								- q.cellTopBorderWidth), o = q.getCoordinateFromDate(w) - q.cellTopBorderWidth, x = v + q.cellBorderWidth, p = v
								+ this.getResourceColumnWidth(s) - q.cellBorderWidth;
						return new Ext.util.Region(Math.min(u, o), p, Math.max(u, o), x)
					},
					columnRenderer : function(A, i, v, t, l) {
						var s = this.view;
						var B = "";
						if (t === 0) {
							var F = Sch.util.Date, w = s.timeAxis, u, D, x, z;
							u = [];
							D = s.eventStore.getEventsForResource(v);
							for (x = 0, z = D.length; x < z; x++) {
								var E = D[x], C = E.getStartDate(), y = E.getEndDate();
								if (C && y && w.timeSpanInAxis(C, y)) {
									u.push(s.generateTplData(E, v, l))
								}
							}
							s.eventLayout.vertical.applyLayout(u, this.getResourceColumnWidth(v));
							B = "&#160;" + s.eventTpl.apply(u);
							if (Ext.isIE) {
								i.tdAttr = 'style="z-index:1000"'
							}
						}
						if (l % 2 === 1) {
							i.tdCls = (i.tdCls || "") + " " + s.altColCls;
							i.cellCls = (i.cellCls || "") + " " + s.altColCls
						}
						return B
					},
					resolveResource : function(h) {
						var f = this.view;
						h = Ext.fly(h).is(f.timeCellSelector) ? h : Ext.fly(h).up(f.timeCellSelector);
						if (h) {
							var g = h.dom ? h.dom : h;
							var e = 0;
							if (Ext.isIE8m) {
								g = g.previousSibling;
								while (g) {
									if (g.nodeType === 1) {
										e++
									}
									g = g.previousSibling
								}
							} else {
								e = Ext.Array.indexOf(Array.prototype.slice.call(g.parentNode.children), g)
							}
							if (e >= 0) {
								return f.resourceStore.getAt(e)
							}
						}
						return null
					},
					onEventUpdate : function(g, k) {
						this.renderSingle.call(this, k);
						var h = this.view;
						var j = k.previous;
						if (j && j[k.resourceIdField]) {
							var i = k.getResource(j[k.resourceIdField], h.eventStore);
							if (i) {
								this.relayoutRenderedEvents(i)
							}
						}
						var l = k.getResource(null, h.eventStore);
						if (l) {
							this.relayoutRenderedEvents(l);
							if (h.getSelectionModel().isSelected(k)) {
								h.onEventSelect(k, true)
							}
						}
					},
					onEventAdd : function(d, f) {
						var e = this.view;
						if (f.length === 1) {
							this.renderSingle(f[0]);
							this.relayoutRenderedEvents(f[0].getResource(null, e.eventStore))
						} else {
							e.repaintAllEvents()
						}
					},
					onEventRemove : function(d, c) {
						this.view.repaintAllEvents()
					},
					relayoutRenderedEvents : function(k) {
						var l = [], i = this.view, o, j, m, n, p = i.eventStore.getEventsForResource(k);
						if (p.length > 0) {
							for (o = 0, j = p.length; o < j; o++) {
								m = p[o];
								n = i.getEventNodeByRecord(m);
								if (n) {
									l.push({
										start : m.getStartDate(),
										end : m.getEndDate(),
										event : m,
										id : n.id
									})
								}
							}
							i.eventLayout.vertical.applyLayout(l, this.getResourceColumnWidth(k));
							for (o = 0; o < l.length; o++) {
								m = l[o];
								Ext.fly(m.id).setStyle({
									left : m.left + "px",
									width : m.width + "px"
								})
							}
						}
					},
					renderSingle : function(m) {
						var i = this.view;
						var j = m.getResource(null, i.eventStore);
						var n = i.getEventNodeByRecord(m);
						var k = i.resourceStore.indexOf(j);
						if (n) {
							Ext.fly(n).destroy()
						}
						var h = Ext.fly(i.getScheduleCell(0, k));
						if (!h) {
							return
						}
						var l = i.generateTplData(m, j, k);
						if (!Ext.versions.touch) {
							h = h.first()
						}
						i.eventTpl.append(h, [ l ])
					},
					getTimeSpanRegion : function(h, j) {
						var m = this.view, i = m.getCoordinateFromDate(h), k = j ? m.getCoordinateFromDate(j) : i, n = m.getTableRegion(), l = n ? n.right
								- n.left
								: m.getEl().dom.clientWidth;
						return new Ext.util.Region(Math.min(i, k), l, Math.max(i, k), 0)
					},
					getStartEndDatesFromRegion : function(i, j, f) {
						var g = this.view.getDateFromCoordinate(i.top, j), h = this.view.getDateFromCoordinate(i.bottom, j);
						if (g && h) {
							return {
								start : Sch.util.Date.min(g, h),
								end : Sch.util.Date.max(g, h)
							}
						} else {
							return null
						}
					},
					setColumnWidth : function(f, d) {
						var e = this.view;
						e.resourceColumnWidth = f;
						e.getTimeAxisViewModel().setViewColumnWidth(f, d)
					},
					getVisibleDateRange : function() {
						var j = this.view;
						if (!j.rendered) {
							return null
						}
						var l = j.getScroll(), g = j.getHeight(), k = j.getTableRegion(), i = j.timeAxis.getEnd();
						if (k.bottom - k.top < g) {
							var h = j.timeAxis.getStart();
							return {
								startDate : h,
								endDate : i
							}
						}
						return {
							startDate : j.getDateFromCoordinate(l.top, null, true),
							endDate : j.getDateFromCoordinate(l.top + g, null, true) || i
						}
					}
				});
Ext.define("Sch.selection.EventModel", {
	extend : "Ext.selection.Model",
	alias : "selection.eventmodel",
	requires : [ "Ext.util.KeyNav" ],
	deselectOnContainerClick : true,
	selectedOnMouseDown : false,
	onVetoUIEvent : Ext.emptyFn,
	bindComponent : function(e) {
		var d = this, f = {
			refresh : d.refresh,
			scope : d
		};
		d.view = e;
		d.bindStore(e.getEventStore());
		e.on({
			eventclick : d.onEventClick,
			eventmousedown : d.onEventMouseDown,
			itemmousedown : d.onItemMouseDown,
			scope : this
		});
		e.on(f)
	},
	bindStore : function(b) {
		if (b && !b.isEventStore) {
			return
		}
		this.callParent(arguments)
	},
	onEventMouseDown : function(d, e, f) {
		this.selectedOnMouseDown = null;
		if (!this.isSelected(e)) {
			this.selectedOnMouseDown = e;
			this.selectWithEvent(e, f)
		}
	},
	onEventClick : function(d, e, f) {
		if (!this.selectedOnMouseDown) {
			this.selectWithEvent(e, f)
		}
	},
	onItemMouseDown : function() {
		if (this.deselectOnContainerClick) {
			this.deselectAll()
		}
	},
	onSelectChange : function(o, q, i, r) {
		var m = this, l = m.view, k = m.store, n = q ? "select" : "deselect", p = 0;
		if ((i || m.fireEvent("before" + n, m, o)) !== false && r() !== false) {
			if (q) {
				l.onEventSelect(o, i)
			} else {
				l.onEventDeselect(o, i)
			}
			if (!i) {
				m.fireEvent(n, m, o)
			}
		}
	},
	selectRange : Ext.emptyFn,
	selectNode : function(h, g, f) {
		var e = this.view.resolveEventRecord(h);
		if (e) {
			this.select(e, g, f)
		}
	},
	deselectNode : function(h, g, f) {
		var e = this.view.resolveEventRecord(h);
		if (e) {
			this.deselect(e, f)
		}
	},
	storeHasSelected : function(d) {
		var c = this.store;
		if (d.hasId() && c.getByInternalId(d.internalId)) {
			return true
		}
		return this.callParent(arguments)
	}
});
Ext
		.define(
				"Sch.plugin.Printable",
				{
					extend : "Ext.AbstractPlugin",
					alias : "plugin.scheduler_printable",
					requires : [ "Ext.XTemplate" ],
					lockableScope : "top",
					docType : "<!DOCTYPE HTML>",
					beforePrint : Ext.emptyFn,
					afterPrint : Ext.emptyFn,
					autoPrintAndClose : true,
					fakeBackgroundColor : true,
					scheduler : null,
					constructor : function(b) {
						Ext.apply(this, b)
					},
					init : function(b) {
						this.scheduler = b;
						b.print = Ext.Function.bind(this.print, this)
					},
					mainTpl : new Ext.XTemplate(
							'{docType}<html class="'
									+ Ext.baseCSSPrefix
									+ 'border-box {htmlClasses}"><head><meta content="text/html; charset=UTF-8" http-equiv="Content-Type" /><title>{title}</title>{styles}</head><body class="sch-print-body {bodyClasses}"><div class="sch-print-ct {componentClasses}" style="width:{totalWidth}px"><div class="sch-print-headerbg" style="border-left-width:{totalWidth}px;height:{headerHeight}px;"></div><div class="sch-print-header-wrap">{[this.printLockedHeader(values)]}{[this.printNormalHeader(values)]}</div>{[this.printLockedGrid(values)]}{[this.printNormalGrid(values)]}</div><script type="text/javascript">{setupScript}<\/script></body></html>',
							{
								printLockedHeader : function(d) {
									var c = "";
									if (d.lockedGrid) {
										c += '<div style="left:-' + d.lockedScroll + "px;margin-right:-" + d.lockedScroll + "px;width:"
												+ (d.lockedWidth + d.lockedScroll) + 'px"';
										c += 'class="sch-print-lockedheader ' + d.lockedGrid.headerCt.el.dom.className + '">';
										c += d.lockedHeader;
										c += "</div>"
									}
									return c
								},
								printNormalHeader : function(d) {
									var c = "";
									if (d.normalGrid) {
										c += '<div style="left:' + (d.lockedGrid ? d.lockedWidth : "0") + "px;width:" + d.normalWidth
												+ 'px;" class="sch-print-normalheader ' + d.normalGrid.headerCt.el.dom.className + '">';
										c += '<div style="margin-left:-' + d.normalScroll + 'px">' + d.normalHeader + "</div>";
										c += "</div>"
									}
									return c
								},
								printLockedGrid : function(d) {
									var c = "";
									if (d.lockedGrid) {
										c += '<div id="lockedRowsCt" style="left:-' + d.lockedScroll + "px;margin-right:-" + d.lockedScroll
												+ "px;width:" + (d.lockedWidth + d.lockedScroll) + "px;top:" + d.headerHeight
												+ 'px;" class="sch-print-locked-rows-ct ' + d.innerLockedClasses + " " + Ext.baseCSSPrefix
												+ 'grid-inner-locked">';
										c += d.lockedRows;
										c += "</div>"
									}
									return c
								},
								printNormalGrid : function(d) {
									var c = "";
									if (d.normalGrid) {
										c += '<div id="normalRowsCt" style="left:' + (d.lockedGrid ? d.lockedWidth : "0") + "px;top:"
												+ d.headerHeight + "px;width:" + d.normalWidth + 'px" class="sch-print-normal-rows-ct '
												+ d.innerNormalClasses + '">';
										c += '<div style="position:relative;overflow:visible;margin-left:-' + d.normalScroll + 'px">' + d.normalRows
												+ "</div>";
										c += "</div>"
									}
									return c
								}
							}),
					getGridContent : function(q) {
						var r = q.normalGrid, z = q.lockedGrid, p = z.getView(), x = r.getView(), u, A, s, v, t, C, w;
						this.beforePrint(q);
						if (z.collapsed && !r.collapsed) {
							C = z.getWidth() + r.getWidth()
						} else {
							C = r.getWidth();
							w = z.getWidth()
						}
						var B = p.store.getRange();
						A = p.tpl.apply(p.collectData(B, 0));
						s = x.tpl.apply(x.collectData(B, 0));
						v = p.el.getScroll().left;
						t = x.el.getScroll().left;
						var D = document.createElement("div");
						D.innerHTML = A;
						D.firstChild.style.width = p.el.dom.style.width;
						if (Ext.versions.extjs.isLessThan("4.2.1")) {
							z.headerCt.items.each(function(a, b) {
								if (a.isHidden()) {
									Ext.fly(D).down("colgroup:nth-child(" + (b + 1) + ") col").setWidth(0)
								}
							})
						}
						A = D.innerHTML;
						if (Sch.feature && Sch.feature.AbstractTimeSpan) {
							var y = (q.plugins || []).concat(q.normalGrid.plugins || []).concat(q.columnLinesFeature || []);
							Ext.each(y, function(a) {
								if (a instanceof Sch.feature.AbstractTimeSpan && a.generateMarkup) {
									s = a.generateMarkup(true) + s
								}
							})
						}
						this.afterPrint(q);
						return {
							normalHeader : r.headerCt.el.dom.innerHTML,
							lockedHeader : z.headerCt.el.dom.innerHTML,
							lockedGrid : z.collapsed ? false : z,
							normalGrid : r.collapsed ? false : r,
							lockedRows : A,
							normalRows : s,
							lockedScroll : v,
							normalScroll : t,
							lockedWidth : w - (Ext.isWebKit ? 1 : 0),
							normalWidth : C,
							headerHeight : r.headerCt.getHeight(),
							innerLockedClasses : z.view.el.dom.className,
							innerNormalClasses : r.view.el.dom.className + (this.fakeBackgroundColor ? " sch-print-fake-background" : ""),
							width : q.getWidth()
						}
					},
					getStylesheets : function() {
						return Ext.getDoc().select('link[rel="stylesheet"]')
					},
					print : function() {
						var l = this.scheduler;
						if (!(this.mainTpl instanceof Ext.Template)) {
							var r = 22;
							this.mainTpl = new Ext.XTemplate(this.mainTpl, {
								compiled : true,
								disableFormats : true
							})
						}
						var k = l.getView(), j = this.getStylesheets(), n = Ext.get(Ext.core.DomHelper.createDom({
							tag : "div"
						})), q;
						j.each(function(a) {
							n.appendChild(a.dom.cloneNode(true))
						});
						q = n.dom.innerHTML + "";
						var m = this.getGridContent(l), p = this.mainTpl.apply(Ext.apply({
							waitText : this.waitText,
							docType : this.docType,
							htmlClasses : Ext.getBody().parent().dom.className,
							bodyClasses : Ext.getBody().dom.className,
							componentClasses : l.el.dom.className,
							title : (l.title || ""),
							styles : q,
							totalWidth : l.getWidth(),
							setupScript : ("window.onload = function(){ (" + this.setupScript.toString() + ")(" + l.syncRowHeight + ", "
									+ this.autoPrintAndClose + ", " + Ext.isChrome + ", " + Ext.isIE + "); };")
						}, m));
						var o = window.open("", "printgrid");
						if (!o || !o.document) {
							return false
						}
						this.printWindow = o;
						o.document.write(p);
						o.document.close()
					},
					setupScript : function(h, g, i, f) {
						var j = function() {
							if (h) {
								var s = document.getElementById("lockedRowsCt"), a = document.getElementById("normalRowsCt"), r = s
										&& s.getElementsByTagName("tr"), c = a && a.getElementsByTagName("tr"), e = c && r ? c.length : 0;
								for (var p = 0; p < e; p++) {
									var q = c[p].clientHeight;
									var d = r[p].clientHeight;
									var b = Math.max(q, d) + "px";
									r[p].style.height = c[p].style.height = b
								}
							}
							document._loaded = true;
							if (g) {
								window.print();
								if (!i) {
									window.close()
								}
							}
						};
						if (f) {
							setTimeout(j, 0)
						} else {
							j()
						}
					}
				});
Ext
		.define(
				"Sch.plugin.Export",
				{
					extend : "Ext.util.Observable",
					alternateClassName : "Sch.plugin.PdfExport",
					alias : "plugin.scheduler_export",
					mixins : [ "Ext.AbstractPlugin" ],
					requires : [ "Ext.XTemplate" ],
					lockableScope : "top",
					printServer : undefined,
					tpl : null,
					exportDialogClassName : "Sch.widget.ExportDialog",
					exportDialogConfig : {},
					defaultConfig : {
						format : "A4",
						orientation : "portrait",
						range : "complete",
						showHeader : true,
						singlePageExport : false
					},
					expandAllBeforeExport : false,
					pageSizes : {
						A5 : {
							width : 5.8,
							height : 8.3
						},
						A4 : {
							width : 8.3,
							height : 11.7
						},
						A3 : {
							width : 11.7,
							height : 16.5
						},
						Letter : {
							width : 8.5,
							height : 11
						},
						Legal : {
							width : 8.5,
							height : 14
						}
					},
					openAfterExport : true,
					beforeExport : Ext.emptyFn,
					afterExport : Ext.emptyFn,
					fileFormat : "pdf",
					DPI : 72,
					constructor : function(b) {
						b = b || {};
						if (b.exportDialogConfig) {
							Ext.Object.each(this.defaultConfig, function(h, a, f) {
								var g = b.exportDialogConfig[h];
								if (g) {
									f[h] = g
								}
							})
						}
						this.callParent([ b ]);
						if (!this.tpl) {
							this.tpl = new Ext.XTemplate(
									'<!DOCTYPE html><html class="'
											+ Ext.baseCSSPrefix
											+ 'border-box {htmlClasses}"><head><meta content="text/html; charset=UTF-8" http-equiv="Content-Type" /><title>{column}/{row}</title>{styles}</head><body class="'
											+ Ext.baseCSSPrefix
											+ 'webkit sch-export {bodyClasses}"><tpl if="showHeader"><div class="sch-export-header" style="width:{totalWidth}px"><h2>{column}/{row}</h2></div></tpl><div class="{componentClasses}" style="height:{bodyHeight}px; width:{totalWidth}px; position: relative !important">{HTML}</div></body></html>',
									{
										disableFormats : true
									})
						}
						this.setFileFormat(this.fileFormat)
					},
					init : function(b) {
						this.scheduler = b;
						b.showExportDialog = Ext.Function.bind(this.showExportDialog, this);
						b.doExport = Ext.Function.bind(this.doExport, this)
					},
					setFileFormat : function(b) {
						if (typeof b !== "string") {
							this.fileFormat = "pdf"
						} else {
							b = b.toLowerCase();
							if (b === "png") {
								this.fileFormat = b
							} else {
								this.fileFormat = "pdf"
							}
						}
					},
					showExportDialog : function() {
						var c = this, d = c.scheduler.getSchedulingView();
						if (c.win) {
							c.win.destroy();
							c.win = null
						}
						c.win = Ext.create(c.exportDialogClassName, {
							plugin : c,
							exportDialogConfig : Ext.apply({
								startDate : c.scheduler.getStart(),
								endDate : c.scheduler.getEnd(),
								rowHeight : d.timeAxisViewModel.getViewRowHeight(),
								columnWidth : d.timeAxisViewModel.getTickWidth(),
								defaultConfig : c.defaultConfig
							}, c.exportDialogConfig)
						});
						c.saveRestoreData();
						c.win.show()
					},
					saveRestoreData : function() {
						var e = this.scheduler, f = e.getSchedulingView(), h = e.normalGrid, g = e.lockedGrid;
						this.restoreSettings = {
							width : e.getWidth(),
							height : e.getHeight(),
							rowHeight : f.timeAxisViewModel.getViewRowHeight(),
							columnWidth : f.timeAxisViewModel.getTickWidth(),
							startDate : e.getStart(),
							endDate : e.getEnd(),
							normalWidth : h.getWidth(),
							normalLeft : h.getEl().getStyle("left"),
							lockedWidth : g.getWidth(),
							lockedCollapse : g.collapsed,
							normalCollapse : h.collapsed
						}
					},
					getStylesheets : function() {
						var f = Ext.getDoc().select('link[rel="stylesheet"]'), e = Ext.get(Ext.core.DomHelper.createDom({
							tag : "div"
						})), d;
						f.each(function(a) {
							e.appendChild(a.dom.cloneNode(true))
						});
						d = e.dom.innerHTML + "";
						return d
					},
					doExport : function(af, ai, ab) {
						this.mask();
						var l = this, ad = l.scheduler, Z = ad.getSchedulingView(), ag = l.getStylesheets(), O = af || l.defaultConfig, W = ad.normalGrid, T = ad.lockedGrid, ac = W.headerCt
								.getHeight();
						l.saveRestoreData();
						W.expand();
						T.expand();
						l.fireEvent("updateprogressbar", 0.1);
						if (this.expandAllBeforeExport && ad.expandAll) {
							ad.expandAll()
						}
						var M = ad.timeAxis.getTicks(), V = Z.timeAxisViewModel.getTickWidth(), X, am, ak;
						if (!O.singlePageExport) {
							if (O.orientation === "landscape") {
								X = l.pageSizes[O.format].height * l.DPI;
								ak = l.pageSizes[O.format].width * l.DPI
							} else {
								X = l.pageSizes[O.format].width * l.DPI;
								ak = l.pageSizes[O.format].height * l.DPI
							}
							var P = 41;
							am = Math.floor(ak) - ac - (O.showHeader ? P : 0)
						}
						Z.timeAxisViewModel.suppressFit = true;
						var U = 0;
						var ah = 0;
						if (O.range !== "complete") {
							var an, ap;
							switch (O.range) {
							case "date":
								an = new Date(O.dateFrom);
								ap = new Date(O.dateTo);
								if (Sch.util.Date.getDurationInDays(an, ap) < 1) {
									ap = Sch.util.Date.add(ap, Sch.util.Date.DAY, 1)
								}
								an = Sch.util.Date.constrain(an, ad.getStart(), ad.getEnd());
								ap = Sch.util.Date.constrain(ap, ad.getStart(), ad.getEnd());
								break;
							case "current":
								var a = Z.getVisibleDateRange();
								an = a.startDate;
								ap = a.endDate || Z.timeAxis.getEnd();
								if (O.cellSize) {
									V = O.cellSize[0];
									if (O.cellSize.length > 1) {
										Z.setRowHeight(O.cellSize[1])
									}
								}
								break
							}
							ad.setTimeSpan(an, ap);
							var ao = Math.floor(Z.timeAxis.getTickFromDate(an));
							var N = Math.floor(Z.timeAxis.getTickFromDate(ap));
							M = ad.timeAxis.getTicks();
							M = Ext.Array.filter(M, function(c, b) {
								if (b < ao) {
									U++;
									return false
								} else {
									if (b > N) {
										ah++;
										return false
									}
								}
								return true
							})
						}
						this.beforeExport(ad, M);
						var Y, i, aj;
						if (!O.singlePageExport) {
							ad.setWidth(X);
							ad.setTimeColumnWidth(V);
							Z.timeAxisViewModel.setTickWidth(V);
							aj = l.calculatePages(O, M, V, X, am);
							i = l.getExportJsonHtml(aj, {
								styles : ag,
								config : O,
								ticks : M,
								skippedColsBefore : U,
								skippedColsAfter : ah,
								printHeight : am,
								paperWidth : X,
								headerHeight : ac
							});
							Y = O.format
						} else {
							i = l.getExportJsonHtml(null, {
								styles : ag,
								config : O,
								ticks : M,
								skippedColsBefore : U,
								skippedColsAfter : ah,
								timeColumnWidth : V
							});
							var al = l.getRealSize(), R = Ext.Number.toFixed(al.width / l.DPI, 1), S = Ext.Number.toFixed(al.height / l.DPI, 1);
							Y = R + "in*" + S + "in"
						}
						l.fireEvent("updateprogressbar", 0.4);
						if (l.printServer) {
							if (!l.debug && !l.test) {
								Ext.Ajax.request({
									type : "POST",
									url : l.printServer,
									timeout : 60000,
									params : Ext.apply({
										html : {
											array : i
										},
										startDate : ad.getStartDate(),
										endDate : ad.getEndDate(),
										format : Y,
										orientation : O.orientation,
										range : O.range,
										fileFormat : l.fileFormat
									}, this.getParameters()),
									success : function(b) {
										l.onSuccess(b, ai, ab)
									},
									failure : function(b) {
										l.onFailure(b, ab)
									},
									scope : l
								})
							} else {
								if (l.debug) {
									var ae, Q = Ext.JSON.decode(i);
									for (var aa = 0, w = Q.length; aa < w; aa++) {
										ae = window.open();
										ae.document.write(Q[aa].html);
										ae.document.close()
									}
								}
							}
						} else {
							throw "Print server URL is not defined, please specify printServer config"
						}
						Z.timeAxisViewModel.suppressFit = false;
						l.restorePanel();
						this.afterExport(ad);
						if (l.test) {
							return {
								htmlArray : Ext.JSON.decode(i),
								calculatedPages : aj
							}
						}
					},
					getParameters : function() {
						return {}
					},
					getRealSize : function() {
						var j = this.scheduler, f = j.normalGrid.headerCt.getHeight(), h = "." + Ext.baseCSSPrefix
								+ (Ext.versions.extjs.isLessThan("5.0") ? "grid-table" : "grid-item-container"), g = (f + j.lockedGrid.getView()
								.getEl().down(h).getHeight()), i = (j.lockedGrid.headerCt.getEl().first().getWidth() + j.normalGrid.body.down(h)
								.getWidth());
						return {
							width : i,
							height : g
						}
					},
					calculatePages : function(y, x, G, A, O) {
						var w = this, H = w.scheduler, z = H.lockedGrid, N = H.getSchedulingView().timeAxisViewModel.getViewRowHeight(), v = z.headerCt, B = v
								.getEl().first().getWidth(), I = null, F = 0;
						if (B > z.getWidth()) {
							var J = 0, M = 0, D = 0, C = false, L;
							I = [];
							z.headerCt.items.each(function(d, b, c) {
								L = d.width;
								if (!D || D + L < A) {
									D += L;
									if (b === c - 1) {
										C = true;
										var a = A - D;
										F = Math.floor(a / G)
									}
								} else {
									C = true
								}
								if (C) {
									M = b;
									I.push({
										firstColumnIdx : J,
										lastColumnIdx : M,
										totalColumnsWidth : D || L
									});
									J = M + 1;
									D = 0
								}
							})
						} else {
							F = Math.floor((A - B) / G)
						}
						var E = Math.floor(A / G), P = Math.ceil((x.length - F) / E), K = Math.floor(O / N);
						if (!I || P === 0) {
							P += 1
						}
						return {
							columnsAmountLocked : F,
							columnsAmountNormal : E,
							lockedColumnPages : I,
							rowsAmount : K,
							rowPages : Math.ceil(H.getSchedulingView().store.getCount() / K),
							columnPages : P,
							timeColumnWidth : G,
							lockedGridWidth : B,
							rowHeight : N,
							panelHTML : {}
						}
					},
					getExportJsonHtml : function(ag, Q) {
						var K = this, aa = K.scheduler, k = [], M = new RegExp(Ext.baseCSSPrefix + "ie\\d?|" + Ext.baseCSSPrefix + "gecko", "g"), V = Ext
								.getBody().dom.className.replace(M, ""), W = aa.el.dom.className, ab = Q.styles, O = Q.config, L = Q.ticks, Z, ai, ah, Y, U;
						if (Ext.isIE) {
							V += " sch-ie-export"
						}
						aa.timeAxis.autoAdjust = false;
						if (!O.singlePageExport) {
							var S = ag.columnsAmountLocked, N = ag.columnsAmountNormal, ac = ag.lockedColumnPages, ae = ag.rowsAmount, P = ag.rowPages, al = ag.columnPages, T = Q.paperWidth, aj = Q.printHeight, i = Q.headerHeight, ad = null, ak, af;
							U = ag.timeColumnWidth;
							Z = ag.panelHTML;
							Z.skippedColsBefore = Q.skippedColsBefore;
							Z.skippedColsAfter = Q.skippedColsAfter;
							if (ac) {
								af = ac.length;
								al += af
							}
							for (var X = 0; X < al; X++) {
								if (ac && X < af) {
									if (X === af - 1 && S !== 0) {
										aa.normalGrid.show();
										ad = Ext.Number.constrain((S - 1), 0, (L.length - 1));
										aa.setTimeSpan(L[0].start, L[ad].end)
									} else {
										aa.normalGrid.hide()
									}
									var R = ac[X];
									this.showLockedColumns();
									this.hideLockedColumns(R.firstColumnIdx, R.lastColumnIdx);
									aa.lockedGrid.setWidth(R.totalColumnsWidth + 1)
								} else {
									if (X === 0) {
										this.showLockedColumns();
										if (S !== 0) {
											aa.normalGrid.show()
										}
										ad = Ext.Number.constrain(S - 1, 0, L.length - 1);
										aa.setTimeSpan(L[0].start, L[ad].end)
									} else {
										aa.lockedGrid.hide();
										aa.normalGrid.show();
										if (ad === null) {
											ad = -1
										}
										if (L[ad + N]) {
											aa.setTimeSpan(L[ad + 1].start, L[ad + N].end);
											ad = ad + N
										} else {
											aa.setTimeSpan(L[ad + 1].start, L[L.length - 1].end)
										}
									}
								}
								aa.setTimeColumnWidth(U, true);
								aa.getSchedulingView().timeAxisViewModel.setTickWidth(U);
								for (var I = 0; I < P; I += 1) {
									K.hideRows(ae, I);
									Z.dom = aa.body.dom.innerHTML;
									Z.k = I;
									Z.i = X;
									ai = K.resizePanelHTML(Z);
									Y = K.tpl.apply(Ext.apply({
										bodyClasses : V,
										bodyHeight : aj + i,
										componentClasses : W,
										styles : ab,
										showHeader : O.showHeader,
										HTML : ai.dom.innerHTML,
										totalWidth : T,
										headerHeight : i,
										column : X + 1,
										row : I + 1
									}));
									ah = {
										html : Y
									};
									k.push(ah);
									K.showRows()
								}
							}
						} else {
							U = Q.timeColumnWidth;
							Z = ag ? ag.panelHTML : {};
							aa.setTimeSpan(L[0].start, L[L.length - 1].end);
							aa.lockedGrid.setWidth(aa.lockedGrid.headerCt.getEl().first().getWidth());
							aa.setTimeColumnWidth(U);
							aa.getSchedulingView().timeAxisViewModel.setTickWidth(U);
							var J = K.getRealSize();
							Ext.apply(Z, {
								dom : aa.body.dom.innerHTML,
								column : 1,
								row : 1,
								timeColumnWidth : Q.timeColumnWidth,
								skippedColsBefore : Q.skippedColsBefore,
								skippedColsAfter : Q.skippedColsAfter
							});
							ai = K.resizePanelHTML(Z);
							Y = K.tpl.apply(Ext.apply({
								bodyClasses : V,
								bodyHeight : J.height,
								componentClasses : W,
								styles : ab,
								showHeader : false,
								HTML : ai.dom.innerHTML,
								totalWidth : J.width
							}));
							ah = {
								html : Y
							};
							k.push(ah)
						}
						aa.timeAxis.autoAdjust = true;
						return Ext.JSON.encode(k)
					},
					resizePanelHTML : function(q) {
						var l = Ext.get(Ext.core.DomHelper.createDom({
							tag : "div",
							html : q.dom
						})), m = this.scheduler, s = m.lockedGrid, n = m.normalGrid, p, r, u;
						if (Ext.isIE6 || Ext.isIE7 || Ext.isIEQuirks) {
							var o = document.createDocumentFragment(), v, t;
							if (o.getElementById) {
								v = "getElementById";
								t = ""
							} else {
								v = "querySelector";
								t = "#"
							}
							o.appendChild(l.dom);
							p = s.view.el;
							r = [ o[v](t + m.id + "-targetEl"), o[v](t + m.id + "-innerCt"), o[v](t + s.id), o[v](t + s.body.id), o[v](t + p.id) ];
							u = [ o[v](t + n.id), o[v](t + n.headerCt.id), o[v](t + n.body.id), o[v](t + n.getView().id) ];
							Ext.Array.each(r, function(a) {
								if (a !== null) {
									a.style.height = "100%";
									a.style.width = "100%"
								}
							});
							Ext.Array.each(u, function(a, b) {
								if (a !== null) {
									if (b === 1) {
										a.style.width = "100%"
									} else {
										a.style.height = "100%";
										a.style.width = "100%"
									}
								}
							});
							l.dom.innerHTML = o.firstChild.innerHTML
						} else {
							p = s.view.el;
							r = [ l.select("#" + m.id + "-targetEl").first(), l.select("#" + m.id + "-innerCt").first(),
									l.select("#" + s.id).first(), l.select("#" + s.body.id).first(), l.select("#" + p.id) ];
							u = [ l.select("#" + n.id).first(), l.select("#" + n.headerCt.id).first(), l.select("#" + n.body.id).first(),
									l.select("#" + n.getView().id).first() ];
							Ext.Array.each(r, function(a, b) {
								if (a) {
									a.setHeight("100%");
									if (b !== 3 && b !== 2) {
										a.setWidth("100%")
									}
								}
							});
							Ext.Array.each(u, function(a, b) {
								if (b === 1) {
									a.setWidth("100%")
								} else {
									a.applyStyles({
										height : "100%",
										width : "100%"
									})
								}
							})
						}
						return l
					},
					getWin : function() {
						return this.win || null
					},
					hideDialogWindow : function(d) {
						var c = this;
						c.fireEvent("hidedialogwindow", d);
						c.unmask();
						if (c.openAfterExport) {
							window.open(d.url, "ExportedPanel")
						}
					},
					onSuccess : function(n, j, e) {
						var m = this, k = m.getWin(), i;
						try {
							i = Ext.JSON.decode(n.responseText)
						} catch (l) {
							this.onFailure(n, e);
							return
						}
						m.fireEvent("updateprogressbar", 1, i);
						if (i.success) {
							setTimeout(function() {
								m.hideDialogWindow(i)
							}, k ? k.hideTime : 3000)
						} else {
							m.fireEvent("showdialogerror", k, i.msg, i)
						}
						m.unmask();
						if (j) {
							j.call(this, n)
						}
					},
					onFailure : function(e, f) {
						var h = this.getWin(), g = e.status === 200 ? e.responseText : e.statusText;
						this.fireEvent("showdialogerror", h, g);
						this.unmask();
						if (f) {
							f.call(this, e)
						}
					},
					hideRows : function(n, l) {
						var o = this.scheduler.lockedGrid.view.getNodes(), j = this.scheduler.normalGrid.view.getNodes(), k = n * l, p = k + n;
						for (var m = 0, i = j.length; m < i; m++) {
							if (m < k || m >= p) {
								o[m].className += " sch-none";
								j[m].className += " sch-none"
							}
						}
					},
					showRows : function() {
						this.scheduler.getEl().select(this.scheduler.getSchedulingView().getItemSelector()).each(function(b) {
							b.removeCls("sch-none")
						})
					},
					hideLockedColumns : function(j, h) {
						var i = this.scheduler.lockedGrid.headerCt.items.items;
						for (var f = 0, g = i.length; f < g; f++) {
							if (f < j || f > h) {
								i[f].hide()
							}
						}
					},
					showLockedColumns : function() {
						this.scheduler.lockedGrid.headerCt.items.each(function(b) {
							b.show()
						})
					},
					mask : function() {
						var b = Ext.getBody().mask();
						b.addCls("sch-export-mask")
					},
					unmask : function() {
						Ext.getBody().unmask()
					},
					restorePanel : function() {
						var c = this.scheduler, d = this.restoreSettings;
						c.setWidth(d.width);
						c.setHeight(d.height);
						c.setTimeSpan(d.startDate, d.endDate);
						c.setTimeColumnWidth(d.columnWidth, true);
						c.getSchedulingView().setRowHeight(d.rowHeight);
						c.lockedGrid.show();
						c.normalGrid.setWidth(d.normalWidth);
						c.normalGrid.getEl().setStyle("left", d.normalLeft);
						c.lockedGrid.setWidth(d.lockedWidth);
						if (d.lockedCollapse) {
							c.lockedGrid.collapse()
						}
						if (d.normalCollapse) {
							c.normalGrid.collapse()
						}
						c.getSchedulingView().timeAxisViewModel.update()
					},
					destroy : function() {
						if (this.win) {
							this.win.destroy()
						}
					}
				});
Ext.define("Sch.plugin.Lines", {
	extend : "Sch.feature.AbstractTimeSpan",
	alias : "plugin.scheduler_lines",
	cls : "sch-timeline",
	showTip : true,
	innerTpl : null,
	prepareTemplateData : null,
	side : null,
	init : function(d) {
		if (Ext.isString(this.innerTpl)) {
			this.innerTpl = new Ext.XTemplate(this.innerTpl)
		}
		this.side = d.rtl ? "right" : "left";
		var c = this.innerTpl;
		if (!this.template) {
			this.template = new Ext.XTemplate('<tpl for=".">', '<div id="{id}" ' + (this.showTip ? 'title="{[this.getTipText(values)]}" ' : "")
					+ 'class="{$cls}" style="' + this.side + ':{left}px;top:{top}px;height:{height}px;width:{width}px">'
					+ (c ? "{[this.renderInner(values)]}" : "") + "</div>", "</tpl>", {
				getTipText : function(a) {
					return d.getSchedulingView().getFormattedDate(a.Date) + " " + (a.Text || "")
				},
				renderInner : function(a) {
					return c.apply(a)
				}
			})
		}
		this.callParent(arguments)
	},
	getElementData : function(w, l, E) {
		var H = this.store, y = this.schedulerView, s = y.isHorizontal(), B = E || H.getRange(), z = [], i, G, u = y.getTimeSpanRegion(w, null,
				this.expandToFitView), x, F, C;
		if (Ext.versions.touch) {
			i = "100%"
		} else {
			i = s ? u.bottom - u.top : 1
		}
		G = s ? 1 : u.right - u.left;
		for (var A = 0, D = B.length; A < D; A++) {
			x = B[A];
			F = x.get("Date");
			if (F && Sch.util.Date.betweenLesser(F, w, l)) {
				var v = y.getCoordinateFromDate(F);
				C = Ext.apply({}, this.getTemplateData(x));
				C.id = this.getElementId(x);
				C.$cls = this.getElementCls(x, C);
				C.width = G;
				C.height = i;
				if (s) {
					C.left = v
				} else {
					C.top = v
				}
				z.push(C)
			}
		}
		return z
	},
	getHeaderElementData : function(t) {
		var v = this.timeAxis.getStart(), l = this.timeAxis.getEnd(), i = this.schedulerView.isHorizontal(), p = [], o, u, n, r;
		t = t || this.store.getRange();
		for (var q = 0, s = t.length; q < s; q++) {
			o = t[q];
			u = o.get("Date");
			if (u && Sch.util.Date.betweenLesser(u, v, l)) {
				n = this.getHeaderElementPosition(u);
				r = this.getTemplateData(o);
				p.push(Ext.apply({
					id : this.getHeaderElementId(o),
					side : i ? this.side : "top",
					cls : this.getHeaderElementCls(o, r),
					position : n
				}, r))
			}
		}
		return p
	}
});
Ext.define("Sch.plugin.CurrentTimeLine", {
	extend : "Sch.plugin.Lines",
	alias : "plugin.scheduler_currenttimeline",
	mixins : [ "Sch.mixin.Localizable" ],
	requires : [ "Ext.data.JsonStore" ],
	updateInterval : 60000,
	showHeaderElements : true,
	autoUpdate : true,
	expandToFitView : true,
	timer : null,
	init : function(f) {
		if (Ext.getVersion("touch")) {
			this.showHeaderElements = false
		}
		var d = new Ext.data.JsonStore({
			fields : [ "Date", "Cls", "Text" ],
			data : [ {
				Date : new Date(),
				Cls : "sch-todayLine",
				Text : this.L("tooltipText")
			} ]
		});
		var e = d.first();
		if (this.autoUpdate) {
			this.timer = setInterval(function() {
				e.set("Date", new Date())
			}, this.updateInterval)
		}
		f.on("destroy", this.onHostDestroy, this);
		this.store = d;
		this.callParent(arguments)
	},
	onHostDestroy : function() {
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null
		}
		if (this.store.autoDestroy) {
			this.store.destroy()
		}
	}
});
Ext.define("Sch.plugin.DragSelector", {
	extend : "Sch.util.DragTracker",
	alias : "plugin.scheduler_dragselector",
	mixins : [ "Ext.AbstractPlugin" ],
	requires : [ "Sch.util.ScrollManager" ],
	lockableScope : "top",
	schedulerView : null,
	eventData : null,
	sm : null,
	proxy : null,
	bodyRegion : null,
	constructor : function(b) {
		b = b || {};
		Ext.applyIf(b, {
			onBeforeStart : this.onBeforeStart,
			onStart : this.onStart,
			onDrag : this.onDrag,
			onEnd : this.onEnd
		});
		this.callParent(arguments)
	},
	init : function(c) {
		var d = this.schedulerView = c.getSchedulingView();
		d.on({
			afterrender : this.onSchedulingViewRender,
			destroy : this.onSchedulingViewDestroy,
			scope : this
		})
	},
	onBeforeStart : function(b) {
		return !b.getTarget(".sch-event") && b.ctrlKey
	},
	onStart : function(d) {
		var f = this.schedulerView;
		this.proxy.show();
		this.bodyRegion = f.getScheduleRegion();
		var e = [];
		f.getEventNodes().each(function(a) {
			e[e.length] = {
				region : a.getRegion(),
				node : a.dom
			}
		});
		this.eventData = e;
		this.sm.deselectAll();
		Sch.util.ScrollManager.activate(f.el)
	},
	onDrag : function(l) {
		var k = this.sm, n = this.eventData, e = this.getRegion().constrainTo(this.bodyRegion), p, o, i, m;
		this.proxy.setRegion(e);
		for (p = 0, i = n.length; p < i; p++) {
			o = n[p];
			m = e.intersect(o.region);
			if (m && !o.selected) {
				o.selected = true;
				k.selectNode(o.node, true)
			} else {
				if (!m && o.selected) {
					o.selected = false;
					k.deselectNode(o.node)
				}
			}
		}
	},
	onEnd : function(b) {
		if (this.proxy) {
			this.proxy.setDisplayed(false)
		}
		Sch.util.ScrollManager.deactivate()
	},
	onSchedulingViewRender : function(b) {
		this.sm = b.getSelectionModel();
		this.initEl(this.schedulerView.el);
		this.proxy = b.el.createChild({
			cls : "sch-drag-selector"
		})
	},
	onSchedulingViewDestroy : function() {
		if (this.proxy) {
			Ext.destroy(this.proxy)
		}
		this.destroy()
	}
});
Ext.define("Sch.plugin.EventEditor", {
	extend : "Ext.form.Panel",
	mixins : [ "Ext.AbstractPlugin", "Sch.mixin.Localizable" ],
	alias : [ "widget.eventeditor", "plugin.scheduler_eventeditor" ],
	lockableScope : "normal",
	requires : [ "Sch.util.Date", "Ext.form.Label" ],
	hideOnBlur : true,
	startDateField : null,
	startTimeField : null,
	durationField : null,
	timeConfig : null,
	dateConfig : null,
	durationConfig : null,
	durationUnit : null,
	durationText : null,
	triggerEvent : "eventdblclick",
	fieldsPanelConfig : null,
	dateFormat : "Y-m-d",
	timeFormat : "H:i",
	cls : "sch-eventeditor",
	border : false,
	shadow : false,
	dynamicForm : true,
	eventRecord : null,
	hidden : true,
	collapsed : true,
	currentForm : null,
	schedulerView : null,
	resourceRecord : null,
	preventHeader : true,
	floating : true,
	hideMode : "offsets",
	ignoreCls : "sch-event-editor-ignore-click",
	readOnly : false,
	layout : {
		type : "vbox",
		align : "stretch"
	},
	constrain : false,
	constructor : function(b) {
		b = b || {};
		Ext.apply(this, b);
		this.durationUnit = this.durationUnit || Sch.util.Date.HOUR;
		this.callParent(arguments)
	},
	initComponent : function() {
		if (!this.fieldsPanelConfig) {
			throw "Must define a fieldsPanelConfig property"
		}
		Ext.apply(this, {
			fbar : this.buttons || this.buildButtons(),
			items : [ {
				xtype : "container",
				layout : "hbox",
				height : 35,
				border : false,
				cls : "sch-eventeditor-timefields",
				items : this.buildDurationFields()
			}, Ext.applyIf(this.fieldsPanelConfig, {
				flex : 1,
				activeItem : 0
			}) ]
		});
		this.callParent(arguments)
	},
	init : function(b) {
		this.ownerCt = b;
		this.schedulerView = b.getView();
		this.eventStore = this.schedulerView.getEventStore();
		this.schedulerView.on({
			afterrender : this.onSchedulerRender,
			destroy : this.onSchedulerDestroy,
			dragcreateend : this.onDragCreateEnd,
			scope : this
		});
		if (this.triggerEvent) {
			this.schedulerView.on(this.triggerEvent, this.onActivateEditor, this)
		}
		this.schedulerView.registerEventEditor(this)
	},
	onSchedulerRender : function() {
		this.render(Ext.getBody());
		if (this.hideOnBlur) {
			this.mon(Ext.getDoc(), "mousedown", this.onMouseDown, this)
		}
	},
	show : function(l, j) {
		var k = this.schedulerView.isReadOnly();
		if (k !== this.readOnly) {
			Ext.Array.each(this.query("field"), function(a) {
				a.setReadOnly(k)
			});
			this.saveButton.setVisible(!k);
			this.deleteButton.setVisible(!k);
			this.readOnly = k
		}
		if (this.deleteButton) {
			this.deleteButton.setVisible(!k && this.eventStore.indexOf(l) >= 0)
		}
		this.eventRecord = l;
		this.durationField.setValue(Sch.util.Date.getDurationInUnit(l.getStartDate(), l.getEndDate(), this.durationUnit, true));
		var n = l.getStartDate();
		this.startDateField.setValue(n);
		this.startTimeField.setValue(n);
		var m = this.schedulerView.up("[floating=true]");
		if (m) {
			this.getEl().setZIndex(m.getEl().getZIndex() + 1);
			m.addCls(this.ignoreCls)
		}
		this.callParent();
		j = j || this.schedulerView.getElementFromEventRecord(l);
		this.alignTo(j, this.schedulerView.getOrientation() == "horizontal" ? "bl" : "tl-tr", this.getConstrainOffsets(j));
		this.expand(!this.constrain);
		if (this.constrain) {
			this.doConstrain(Ext.util.Region.getRegion(Ext.getBody()))
		}
		var p, o = l.get("EventType");
		if (o && this.dynamicForm) {
			var q = this.items.getAt(1), r = q.query("> component[EventType=" + o + "]");
			if (!r.length) {
				throw "Can't find form for EventType=" + o
			}
			if (!q.getLayout().setActiveItem) {
				throw "Can't switch active component in the 'fieldsPanel'"
			}
			p = r[0];
			if (!(p instanceof Ext.form.Panel)) {
				throw "Each child component of 'fieldsPanel' should be a 'form'"
			}
			q.getLayout().setActiveItem(p)
		} else {
			p = this
		}
		this.currentForm = p;
		p.getForm().loadRecord(l)
	},
	getConstrainOffsets : function(b) {
		return [ 0, 0 ]
	},
	onSaveClick : function() {
		var p = this, m = p.eventRecord, t = this.currentForm.getForm();
		if (t.isValid() && this.fireEvent("beforeeventsave", this, m) !== false) {
			var r = p.startDateField.getValue(), l, s = p.startTimeField.getValue(), n = p.durationField.getValue();
			if (r && n >= 0) {
				if (s) {
					Sch.util.Date.copyTimeValues(r, s)
				}
				l = Sch.util.Date.add(r, this.durationUnit, n)
			} else {
				return
			}
			var q = m.getResources(this.eventStore);
			var o = (q.length > 0 && q[0]) || this.resourceRecord;
			if (!this.schedulerView.allowOverlap && !this.schedulerView.isDateRangeAvailable(r, l, m, o)) {
				return
			}
			m.beginEdit();
			var k = m.endEdit;
			m.endEdit = Ext.emptyFn;
			t.updateRecord(m);
			m.endEdit = k;
			m.setStartEndDate(r, l);
			m.endEdit();
			if (this.eventStore.indexOf(this.eventRecord) < 0) {
				if (this.schedulerView.fireEvent("beforeeventadd", this.schedulerView, m) !== false) {
					this.eventStore.append(m)
				}
			}
			p.collapse(null, true)
		}
	},
	onDeleteClick : function() {
		if (this.fireEvent("beforeeventdelete", this, this.eventRecord) !== false) {
			this.eventStore.remove(this.eventRecord)
		}
		this.collapse(null, true)
	},
	onCancelClick : function() {
		this.collapse(null, true)
	},
	buildButtons : function() {
		this.saveButton = new Ext.Button({
			text : this.L("saveText"),
			scope : this,
			handler : this.onSaveClick
		});
		this.deleteButton = new Ext.Button({
			text : this.L("deleteText"),
			scope : this,
			handler : this.onDeleteClick
		});
		this.cancelButton = new Ext.Button({
			text : this.L("cancelText"),
			scope : this,
			handler : this.onCancelClick
		});
		return [ this.saveButton, this.deleteButton, this.cancelButton ]
	},
	buildDurationFields : function() {
		this.startDateField = new Ext.form.field.Date(Ext.apply({
			width : 90,
			allowBlank : false,
			format : this.dateFormat
		}, this.dateConfig || {}));
		this.startDateField.getPicker().addCls(this.ignoreCls);
		this.startTimeField = new Ext.form.field.Time(Ext.apply({
			width : 70,
			allowBlank : false,
			format : this.timeFormat
		}, this.timeConfig || {}));
		this.startTimeField.getPicker().addCls(this.ignoreCls);
		this.durationField = new Ext.form.field.Number(Ext.apply({
			width : 45,
			value : 0,
			minValue : 0,
			allowNegative : false
		}, this.durationConfig || {}));
		this.durationLabel = new Ext.form.Label({
			text : this.getDurationText()
		});
		return [ this.startDateField, this.startTimeField, this.durationField, this.durationLabel ]
	},
	onActivateEditor : function(c, d) {
		this.show(d)
	},
	onMouseDown : function(b) {
		if (this.collapsed || b.within(this.getEl()) || b.getTarget("." + this.ignoreCls, 9) || b.getTarget(this.schedulerView.eventSelector)) {
			return
		}
		this.collapse()
	},
	onSchedulerDestroy : function() {
		this.destroy()
	},
	onDragCreateEnd : function(d, e, f) {
		if (!this.dragProxyEl && this.schedulerView.dragCreator) {
			this.dragProxyEl = this.schedulerView.dragCreator.getProxy()
		}
		this.resourceRecord = f;
		this.schedulerView.onEventCreated(e);
		this.show(e, this.dragProxyEl)
	},
	hide : function() {
		this.callParent(arguments);
		var b = this.dragProxyEl;
		if (b) {
			b.hide()
		}
	},
	afterCollapse : function() {
		this.hide();
		this.callParent(arguments)
	},
	getDurationText : function() {
		if (this.durationText) {
			return this.durationText
		}
		return Sch.util.Date.getShortNameOfUnit(Sch.util.Date.getNameOfUnit(this.durationUnit))
	}
});
Ext.define("Sch.plugin.EventTools", {
	extend : "Ext.Container",
	mixins : [ "Ext.AbstractPlugin" ],
	lockableScope : "top",
	alias : "plugin.scheduler_eventtools",
	hideDelay : 500,
	align : "right",
	defaults : {
		xtype : "tool",
		baseCls : "sch-tool",
		overCls : "sch-tool-over",
		width : 20,
		height : 20,
		visibleFn : Ext.emptyFn
	},
	hideTimer : null,
	lastPosition : null,
	cachedSize : null,
	offset : {
		x : 0,
		y : 1
	},
	autoRender : true,
	floating : true,
	hideMode : "offsets",
	hidden : true,
	getRecord : function() {
		return this.record
	},
	init : function(b) {
		if (!this.items) {
			throw "Must define an items property for this plugin to function correctly"
		}
		this.addCls("sch-event-tools");
		this.scheduler = b;
		b.on({
			eventresizestart : this.onOperationStart,
			eventresizeend : this.onOperationEnd,
			eventdragstart : this.onOperationStart,
			eventdrop : this.onOperationEnd,
			eventmouseenter : this.onEventMouseEnter,
			eventmouseleave : this.onContainerMouseLeave,
			scope : this
		})
	},
	onRender : function() {
		this.callParent(arguments);
		this.scheduler.mon(this.el, {
			mouseenter : this.onContainerMouseEnter,
			mouseleave : this.onContainerMouseLeave,
			scope : this
		})
	},
	onEventMouseEnter : function(l, j, m) {
		var p = false;
		var k;
		this.record = j;
		this.items.each(function(a) {
			k = a.visibleFn(j) !== false;
			a.setVisible(k);
			if (k) {
				p = true
			}
		}, this);
		if (!p) {
			return
		}
		if (!this.rendered) {
			this.doAutoRender()
		}
		var n = m.getTarget(l.eventSelector);
		var o = Ext.fly(n).getBox();
		this.doLayout();
		var i = this.getSize();
		this.lastPosition = [ m.getXY()[0] - (i.width / 2), o.y - i.height - this.offset.y ];
		this.onContainerMouseEnter()
	},
	onContainerMouseEnter : function() {
		window.clearTimeout(this.hideTimer);
		this.setPosition.apply(this, this.lastPosition);
		this.show()
	},
	onContainerMouseLeave : function() {
		window.clearTimeout(this.hideTimer);
		this.hideTimer = Ext.defer(this.hide, this.hideDelay, this)
	},
	onOperationStart : function() {
		this.scheduler.un("eventmouseenter", this.onEventMouseEnter, this);
		window.clearTimeout(this.hideTimer);
		this.hide()
	},
	onOperationEnd : function() {
		this.scheduler.on("eventmouseenter", this.onEventMouseEnter, this)
	}
});
Ext.define("Sch.plugin.Pan", {
	extend : "Ext.AbstractPlugin",
	alias : "plugin.scheduler_pan",
	lockableScope : "top",
	enableVerticalPan : true,
	statics : {
		KEY_SHIFT : 1,
		KEY_CTRL : 2,
		KEY_ALT : 4,
		KEY_ALL : 7
	},
	disableOnKey : 0,
	panel : null,
	constructor : function(b) {
		Ext.apply(this, b)
	},
	init : function(b) {
		this.panel = b.normalGrid || b;
		this.view = b.getSchedulingView();
		this.view.on("afterrender", this.onRender, this)
	},
	onRender : function(b) {
		this.view.el.on("mousedown", this.onMouseDown, this)
	},
	onMouseDown : function(g, h) {
		var e = this.self, f = this.disableOnKey;
		if ((g.shiftKey && (f & e.KEY_SHIFT)) || (g.ctrlKey && (f & e.KEY_CTRL)) || (g.altKey && (f & e.KEY_ALT))) {
			return
		}
		if (g.getTarget("." + this.view.timeCellCls, 10) && !g.getTarget(this.view.eventSelector)) {
			this.mouseX = g.getPageX();
			this.mouseY = g.getPageY();
			Ext.getBody().on("mousemove", this.onMouseMove, this);
			Ext.getDoc().on("mouseup", this.onMouseUp, this);
			if (Ext.isIE || Ext.isGecko) {
				Ext.getBody().on("mouseenter", this.onMouseUp, this)
			}
			g.stopEvent()
		}
	},
	onMouseMove : function(i) {
		i.stopEvent();
		var g = i.getPageX(), h = i.getPageY(), j = g - this.mouseX, e = h - this.mouseY;
		this.panel.scrollByDeltaX(-j);
		this.mouseX = g;
		this.mouseY = h;
		if (this.enableVerticalPan) {
			this.panel.scrollByDeltaY(-e)
		}
	},
	onMouseUp : function(b) {
		Ext.getBody().un("mousemove", this.onMouseMove, this);
		Ext.getDoc().un("mouseup", this.onMouseUp, this);
		if (Ext.isIE || Ext.isGecko) {
			Ext.getBody().un("mouseenter", this.onMouseUp, this)
		}
	}
});
Ext.define("Sch.plugin.SimpleEditor", {
	extend : "Ext.Editor",
	alias : "plugin.scheduler_simpleeditor",
	requires : [ "Ext.form.TextField" ],
	mixins : [ "Ext.AbstractPlugin", "Sch.mixin.Localizable" ],
	lockableScope : "top",
	cls : "sch-simpleeditor",
	allowBlur : false,
	delegate : ".sch-event-inner",
	dataIndex : null,
	completeOnEnter : true,
	cancelOnEsc : true,
	ignoreNoChange : true,
	height : 19,
	autoSize : {
		width : "boundEl"
	},
	initComponent : function() {
		this.field = this.field || {
			xtype : "textfield",
			selectOnFocus : true
		};
		this.callParent(arguments)
	},
	init : function(b) {
		this.scheduler = b.getSchedulingView();
		b.on("afterrender", this.onSchedulerRender, this);
		this.scheduler.registerEventEditor(this);
		this.dataIndex = this.dataIndex || this.scheduler.getEventStore().model.prototype.nameField
	},
	edit : function(d, c) {
		c = c || this.scheduler.getElementFromEventRecord(d);
		this.startEdit(c.child(this.delegate));
		this.record = d;
		this.setValue(this.record.get(this.dataIndex))
	},
	onSchedulerRender : function(b) {
		this.on({
			startedit : this.onStartEdit,
			complete : function(h, g, i) {
				var a = this.record;
				var j = this.scheduler.eventStore;
				a.set(this.dataIndex, g);
				if (j.indexOf(a) < 0) {
					if (this.scheduler.fireEvent("beforeeventadd", this.scheduler, a) !== false) {
						j.append(a)
					}
				}
				this.onAfterEdit()
			},
			canceledit : this.onAfterEdit,
			hide : function() {
				if (this.dragProxyEl) {
					this.dragProxyEl.hide()
				}
			},
			scope : this
		});
		b.on({
			eventdblclick : function(a, f, e) {
				if (!b.isReadOnly()) {
					this.edit(f)
				}
			},
			dragcreateend : this.onDragCreateEnd,
			scope : this
		})
	},
	onStartEdit : function() {
		if (!this.allowBlur) {
			Ext.getBody().on("mousedown", this.onMouseDown, this);
			this.scheduler.on("eventmousedown", function() {
				this.cancelEdit()
			}, this)
		}
	},
	onAfterEdit : function() {
		if (!this.allowBlur) {
			Ext.getBody().un("mousedown", this.onMouseDown, this);
			this.scheduler.un("eventmousedown", function() {
				this.cancelEdit()
			}, this)
		}
	},
	onMouseDown : function(c, d) {
		if (this.editing && this.el && !c.within(this.el)) {
			this.cancelEdit()
		}
	},
	onDragCreateEnd : function(c, d) {
		if (!this.dragProxyEl && this.scheduler.dragCreator) {
			this.dragProxyEl = this.scheduler.dragCreator.getProxy()
		}
		this.scheduler.onEventCreated(d);
		if (d.get(this.dataIndex) === "") {
			d.set(this.dataIndex, this.L("newEventText"))
		}
		this.edit(d, this.dragProxyEl)
	}
});
Ext
		.define("Sch.plugin.Zones",
				{
					extend : "Sch.feature.AbstractTimeSpan",
					alias : "plugin.scheduler_zones",
					requires : [ "Sch.model.Range" ],
					innerTpl : null,
					cls : "sch-zone",
					side : null,
					init : function(d) {
						if (Ext.isString(this.innerTpl)) {
							this.innerTpl = new Ext.XTemplate(this.innerTpl)
						}
						this.side = d.rtl ? "right" : "left";
						var c = this.innerTpl;
						if (!this.template) {
							this.template = new Ext.XTemplate('<tpl for="."><div id="{id}" class="{$cls}" style="' + this.side
									+ ':{left}px;top:{top}px;height:{height}px;width:{width}px;{style}">' + (c ? "{[this.renderInner(values)]}" : "")
									+ "</div></tpl>", {
								renderInner : function(a) {
									return c.apply(a)
								}
							})
						}
						if (Ext.isString(this.innerHeaderTpl)) {
							this.innerHeaderTpl = new Ext.XTemplate(this.innerHeaderTpl)
						}
						this.callParent(arguments)
					},
					getElementData : function(C, G, u, E) {
						var D = this.schedulerView, l = [], H = D.getTimeSpanRegion(C, G, this.expandToFitView), A = this.schedulerView
								.isHorizontal(), I, z, J, B, y, F;
						u = u || this.store.getRange();
						for (var v = 0, w = u.length; v < w; v++) {
							I = u[v];
							z = I.getStartDate();
							J = I.getEndDate();
							F = this.getTemplateData(I);
							if (z && J && Sch.util.Date.intersectSpans(z, J, C, G)) {
								var i = D.getCoordinateFromDate(Sch.util.Date.max(z, C));
								var x = D.getCoordinateFromDate(Sch.util.Date.min(J, G));
								B = Ext.apply({}, F);
								B.id = this.getElementId(I);
								B.$cls = this.getElementCls(I, F);
								if (A) {
									B.left = i;
									B.top = H.top;
									B.width = E ? 0 : x - i;
									B.height = H.bottom - H.top;
									B.style = E ? ("border-left-width:" + (x - i) + "px") : ""
								} else {
									B.left = H.left;
									B.top = i;
									B.height = E ? 0 : x - i;
									B.width = H.right - H.left;
									B.style = E ? ("border-top-width:" + (x - i) + "px") : ""
								}
								l.push(B)
							}
						}
						return l
					},
					getHeaderElementId : function(c, d) {
						return this.callParent([ c ]) + (d ? "-start" : "-end")
					},
					getHeaderElementCls : function(e, g, f) {
						var h = e.clsField || this.clsField;
						if (!g) {
							g = this.getTemplateData(e)
						}
						return "sch-header-indicator sch-header-indicator-" + (f ? "start " : "end ") + this.uniqueCls + " " + (g[h] || "")
					},
					getZoneHeaderElementData : function(q, k, m, r) {
						var p = r ? m.getStartDate() : m.getEndDate(), n = null, l, j, o;
						if (p && Sch.util.Date.betweenLesser(p, q, k)) {
							l = this.getHeaderElementPosition(p);
							j = this.schedulerView.isHorizontal();
							o = this.getTemplateData(m);
							n = Ext.apply({
								id : this.getHeaderElementId(m, r),
								cls : this.getHeaderElementCls(m, o, r),
								isStart : r,
								side : j ? this.side : "top",
								position : l
							}, o)
						}
						return n
					},
					getHeaderElementData : function(q) {
						var r = this.timeAxis.getStart(), k = this.timeAxis.getEnd(), n = [], l, o, i;
						q = q || this.store.getRange();
						for (var m = 0, p = q.length; m < p; m++) {
							l = q[m];
							o = this.getZoneHeaderElementData(r, k, l, true);
							if (o) {
								n.push(o)
							}
							i = this.getZoneHeaderElementData(r, k, l, false);
							if (i) {
								n.push(i)
							}
						}
						return n
					},
					updateZoneHeaderElement : function(d, c) {
						d.dom.className = c.cls;
						if (this.schedulerView.isHorizontal()) {
							this.setElementX(d, c.position)
						} else {
							d.setTop(c.position)
						}
					},
					updateHeaderElement : function(n) {
						var i = this.timeAxis.getStart(), j = this.timeAxis.getEnd(), k = Ext.get(this.getHeaderElementId(n, true)), l = Ext.get(this
								.getHeaderElementId(n, false)), m = this.getZoneHeaderElementData(i, j, n, true), h = this.getZoneHeaderElementData(
								i, j, n, false);
						if (!(k && h) || !(l && h)) {
							Ext.destroy(k, l);
							this.renderHeaderElementsInternal([ n ])
						} else {
							if (k) {
								if (!m) {
									Ext.destroy(k)
								} else {
									this.updateZoneHeaderElement(k, m)
								}
							}
							if (l) {
								if (!h) {
									Ext.destroy(l)
								} else {
									this.updateZoneHeaderElement(l, h)
								}
							}
						}
					}
				});
Ext
		.define("Sch.plugin.TimeGap",
				{
					extend : "Sch.plugin.Zones",
					alias : "plugin.scheduler_timegap",
					getZoneCls : Ext.emptyFn,
					init : function(b) {
						this.store = new Ext.data.JsonStore({
							model : "Sch.model.Range"
						});
						this.scheduler = b;
						b.mon(b.eventStore, {
							load : this.populateStore,
							update : this.populateStore,
							remove : this.populateStore,
							add : this.populateStore,
							datachanged : this.populateStore,
							scope : this
						});
						b.on("viewchange", this.populateStore, this);
						this.schedulerView = b.getSchedulingView();
						this.callParent(arguments)
					},
					populateStore : function(r) {
						var s = this.schedulerView.getEventsInView(), o = [], p = this.scheduler.getStart(), l = this.scheduler.getEnd(), q = s
								.getCount(), k = p, m, n = 0, t;
						s.sortBy(function(a, b) {
							return a.getStartDate() - b.getStartDate()
						});
						t = s.getAt(0);
						while (k < l && n < q) {
							m = t.getStartDate();
							if (!Sch.util.Date.betweenLesser(k, m, t.getEndDate()) && k < m) {
								o.push(new this.store.model({
									StartDate : k,
									EndDate : m,
									Cls : this.getZoneCls(k, m) || ""
								}))
							}
							k = Sch.util.Date.max(t.getEndDate(), k);
							n++;
							t = s.getAt(n)
						}
						if (k < l) {
							o.push(new this.store.model({
								StartDate : k,
								EndDate : l,
								Cls : this.getZoneCls(k, l) || ""
							}))
						}
						this.store.removeAll(o.length > 0);
						this.store.add(o)
					}
				});
Ext.define("Sch.plugin.TreeCellEditing", {
	extend : "Ext.grid.plugin.CellEditing",
	alias : "plugin.scheduler_treecellediting",
	lockableScope : "locked",
	editorsStarted : 0,
	init : function(b) {
		this._grid = b;
		this.on("beforeedit", this.checkReadOnly, this);
		this.callParent(arguments)
	},
	bindPositionFixer : function() {
		Ext.on({
			afterlayout : this.fixEditorPosition,
			scope : this
		})
	},
	unbindPositionFixer : function() {
		Ext.un({
			afterlayout : this.fixEditorPosition,
			scope : this
		})
	},
	fixEditorPosition : function() {
		var e = this.getActiveEditor();
		if (e && e.getEl()) {
			var f = this.getEditingContext(this.context.record, this.context.column);
			if (f) {
				this.context.row = f.row;
				this.context.rowIdx = f.rowIdx;
				e.boundEl = this.getCell(f.record, f.column);
				e.realign();
				this.scroll = this.view.el.getScroll();
				var d = this._grid.getView();
				d.focusedRow = d.getNode(f.rowIdx)
			}
		}
	},
	checkReadOnly : function() {
		var b = this._grid;
		if (!(b instanceof Sch.panel.TimelineTreePanel)) {
			b = b.up("tablepanel")
		}
		return !b.isReadOnly()
	},
	startEdit : function(f, h, e) {
		this._grid.suspendLayouts();
		var g = this.callParent(arguments);
		this._grid.resumeLayouts();
		return g
	},
	onEditComplete : function(l, i, g) {
		var j = this, h, k;
		if (l.field.applyChanges) {
			h = l.field.task || j.context.record;
			k = true;
			h.set = function() {
				delete h.set;
				k = false;
				l.field.applyChanges(h)
			}
		}
		this.callParent(arguments);
		if (k) {
			delete h.set
		}
		this.unbindPositionFixer()
	},
	showEditor : function(o, r, j) {
		var q = this.grid.getSelectionModel();
		var l;
		var m = this;
		this.editorsStarted++;
		if (!o.hideEditOverridden) {
			var p = o.hideEdit;
			o.hideEdit = function() {
				m.editorsStarted--;
				if (!m.editorsStarted) {
					p.apply(this, arguments)
				}
			};
			o.hideEditOverridden = true
		}
		if (Ext.isIE && Ext.getVersion("extjs").isLessThan("4.2.2.1144")) {
			l = q.selectByPosition;
			q.selectByPosition = Ext.emptyFn;
			this.view.focusedRow = this.view.getNode(r.record)
		}
		var k = o.field;
		if (k && k.setSuppressTaskUpdate) {
			k.setSuppressTaskUpdate(true);
			if (!o.startEditOverridden) {
				o.startEditOverridden = true;
				var n = o.startEdit;
				o.startEdit = function() {
					n.apply(this, arguments);
					k.setSuppressTaskUpdate(false)
				}
			}
		}
		if (k) {
			if (k.setTask) {
				k.setTask(r.record);
				j = r.value = r.originalValue = k.getValue()
			} else {
				if (!r.column.dataIndex && r.value === undefined) {
					j = r.value = k.getDisplayValue(r.record)
				}
			}
		}
		if (Ext.isIE8m && Ext.getVersion("extjs").toString() === "4.2.2.1144") {
			Ext.EventObject.type = "click"
		}
		this.callParent([ o, r, j ]);
		if (l) {
			q.selectByPosition = l
		}
		this.bindPositionFixer()
	},
	cancelEdit : function() {
		this.callParent(arguments);
		this.unbindPositionFixer()
	}
});
Ext.define("Sch.plugin.ResourceZones", {
	extend : "Sch.plugin.Zones",
	alias : "plugin.scheduler_resourcezones",
	innerTpl : null,
	store : null,
	cls : "sch-resourcezone",
	init : function(d) {
		this.uniqueCls = this.uniqueCls || ("sch-timespangroup-" + Ext.id());
		this.scheduler = d;
		d.on("destroy", this.onSchedulerDestroy, this);
		d.registerRenderer(this.renderer, this);
		if (Ext.isString(this.innerTpl)) {
			this.innerTpl = new Ext.XTemplate(this.innerTpl)
		}
		var c = this.innerTpl;
		if (!this.template) {
			this.template = new Ext.XTemplate('<tpl for="."><div id="' + this.uniqueCls + '-{id}" class="' + this.cls + " " + this.uniqueCls
					+ ' {Cls}" style="' + (d.rtl ? "right" : "left") + ':{start}px;width:{width}px;top:{start}px;height:{width}px;{style}">'
					+ (c ? "{[this.renderInner(values)]}" : "") + "</div></tpl>", {
				renderInner : function(a) {
					return c.apply(a)
				}
			})
		}
		this.storeListeners = {
			load : this.fullRefresh,
			datachanged : this.fullRefresh,
			clear : this.fullRefresh,
			add : this.fullRefresh,
			remove : this.fullRefresh,
			update : this.refreshSingle,
			addrecords : this.fullRefresh,
			removerecords : this.fullRefresh,
			updaterecord : this.refreshSingle,
			scope : this
		};
		this.store.on(this.storeListeners)
	},
	onSchedulerDestroy : function() {
		this.store.un(this.storeListeners)
	},
	fullRefresh : function() {
		this.scheduler.getSchedulingView().refresh()
	},
	renderer : function(h, e, f, g) {
		if (this.scheduler.getOrientation() === "horizontal" || g === 0) {
			return this.renderZones(f)
		}
		return ""
	},
	renderZones : function(m) {
		var j = this.store, p = this.scheduler, k = p.timeAxis.getStart(), i = p.timeAxis.getEnd(), n = [], o, l;
		j.each(function(d) {
			o = d.getStartDate();
			l = d.getEndDate();
			if (d.getResource(null, p.eventStore) === m && o && l && Sch.util.Date.intersectSpans(o, l, k, i)) {
				var b = p.getSchedulingView()[p.getOrientation()].getEventRenderData(d);
				var a, c;
				if (p.getOrientation() === "horizontal") {
					a = p.rtl ? b.right : b.left;
					c = b.width
				} else {
					a = b.top;
					c = b.height
				}
				n[n.length] = Ext.apply({
					id : d.internalId,
					start : a,
					width : c,
					Cls : d.getCls()
				}, d.data)
			}
		});
		return this.template.apply(n)
	},
	refreshSingle : function(n, p) {
		var t = Ext.get(this.uniqueCls + "-" + p.internalId);
		if (t) {
			var r = this.scheduler, q = r.timeAxis.getStart(), m = r.timeAxis.getEnd();
			var u = Sch.util.Date.max(q, p.getStartDate()), s = Sch.util.Date.min(m, p.getEndDate()), l = p.getCls();
			var o = r.getSchedulingView().getCoordinateFromDate(u);
			var v = r.getSchedulingView().getCoordinateFromDate(s) - o;
			t.dom.className = this.cls + " " + this.uniqueCls + " " + (l || "");
			t.setStyle({
				left : o + "px",
				top : o + "px",
				height : v + "px",
				width : v + "px"
			})
		}
	}
});
Ext.define("Sch.plugin.HeaderZoom", {
	extend : "Sch.util.DragTracker",
	mixins : [ "Ext.AbstractPlugin" ],
	alias : "plugin.scheduler_headerzoom",
	lockableScope : "top",
	scheduler : null,
	proxy : null,
	headerRegion : null,
	init : function(b) {
		b.on({
			destroy : this.onSchedulerDestroy,
			scope : this
		});
		this.scheduler = b;
		this.onOrientationChange();
		b.on("orientationchange", this.onOrientationChange, this)
	},
	onOrientationChange : function() {
		var b = this.scheduler.down("timeaxiscolumn");
		if (b) {
			if (b.rendered) {
				this.onTimeAxisColumnRender(b)
			} else {
				b.on({
					afterrender : this.onTimeAxisColumnRender,
					scope : this
				})
			}
		}
	},
	onTimeAxisColumnRender : function(b) {
		this.proxy = b.el.createChild({
			cls : "sch-drag-selector"
		});
		this.initEl(b.el)
	},
	onStart : function(b) {
		this.proxy.show();
		this.headerRegion = this.scheduler.normalGrid.headerCt.getRegion()
	},
	onDrag : function(d) {
		var f = this.headerRegion;
		var e = this.getRegion().constrainTo(f);
		e.top = f.top;
		e.bottom = f.bottom;
		this.proxy.setRegion(e)
	},
	onEnd : function(i) {
		if (this.proxy) {
			this.proxy.setDisplayed(false);
			var e = this.scheduler;
			var k = e.timeAxis;
			var j = this.getRegion();
			var l = e.getSchedulingView().timeAxisViewModel.getBottomHeader().unit;
			var h = e.getSchedulingView().getStartEndDatesFromRegion(j);
			e.zoomToSpan({
				start : k.floorDate(h.start, false, l, 1),
				end : k.ceilDate(h.end, false, l, 1)
			})
		}
	},
	onSchedulerDestroy : function() {
		if (this.proxy) {
			Ext.destroy(this.proxy);
			this.proxy = null
		}
		this.destroy()
	}
});
Ext.define("Sch.widget.ResizePicker", {
	extend : "Ext.Panel",
	alias : "widget.dualrangepicker",
	width : 200,
	height : 200,
	border : true,
	collapsible : false,
	bodyStyle : "position:absolute; margin:5px",
	verticalCfg : {
		height : 120,
		value : 24,
		increment : 2,
		minValue : 20,
		maxValue : 80,
		reverse : true,
		disabled : true
	},
	horizontalCfg : {
		width : 120,
		value : 100,
		minValue : 25,
		increment : 5,
		maxValue : 200,
		disable : true
	},
	initComponent : function() {
		var b = this;
		b.horizontalCfg.value = b.dialogConfig.columnWidth;
		b.verticalCfg.value = b.dialogConfig.rowHeight;
		b.verticalCfg.disabled = b.dialogConfig.scrollerDisabled || false;
		b.dockedItems = [ b.vertical = new Ext.slider.Single(Ext.apply({
			dock : "left",
			style : "margin-top:10px",
			vertical : true,
			listeners : {
				change : b.onSliderChange,
				changecomplete : b.onSliderChangeComplete,
				scope : b
			}
		}, b.verticalCfg)), b.horizontal = new Ext.slider.Single(Ext.apply({
			dock : "top",
			style : "margin-left:28px",
			listeners : {
				change : b.onSliderChange,
				changecomplete : b.onSliderChangeComplete,
				scope : b
			}
		}, b.horizontalCfg)) ];
		b.callParent(arguments)
	},
	afterRender : function() {
		var c = this;
		c.addCls("sch-ux-range-picker");
		c.valueHandle = this.body.createChild({
			cls : "sch-ux-range-value",
			cn : {
				tag : "span"
			}
		});
		c.valueSpan = this.valueHandle.down("span");
		var d = new Ext.dd.DD(this.valueHandle);
		Ext.apply(d, {
			startDrag : function() {
				c.dragging = true;
				this.constrainTo(c.body)
			},
			onDrag : function() {
				c.onHandleDrag.apply(c, arguments)
			},
			endDrag : function() {
				c.onHandleEndDrag.apply(c, arguments);
				c.dragging = false
			},
			scope : this
		});
		this.setValues(this.getValues());
		this.callParent(arguments);
		this.body.on("click", this.onBodyClick, this)
	},
	onBodyClick : function(f, e) {
		var d = [ f.getXY()[0] - 8 - this.body.getX(), f.getXY()[1] - 8 - this.body.getY() ];
		this.valueHandle.setLeft(Ext.Number.constrain(d[0], 0, this.getAvailableWidth()));
		this.valueHandle.setTop(Ext.Number.constrain(d[1], 0, this.getAvailableHeight()));
		this.setValues(this.getValuesFromXY([ this.valueHandle.getLeft(true), this.valueHandle.getTop(true) ]));
		this.onSliderChangeComplete()
	},
	getAvailableWidth : function() {
		return this.body.getWidth() - 18
	},
	getAvailableHeight : function() {
		return this.body.getHeight() - 18
	},
	onHandleDrag : function() {
		this.setValues(this.getValuesFromXY([ this.valueHandle.getLeft(true), this.valueHandle.getTop(true) ]))
	},
	onHandleEndDrag : function() {
		this.setValues(this.getValuesFromXY([ this.valueHandle.getLeft(true), this.valueHandle.getTop(true) ]))
	},
	getValuesFromXY : function(i) {
		var j = i[0] / this.getAvailableWidth();
		var g = i[1] / this.getAvailableHeight();
		var h = Math.round((this.horizontalCfg.maxValue - this.horizontalCfg.minValue) * j);
		var f = Math.round((this.verticalCfg.maxValue - this.verticalCfg.minValue) * g) + this.verticalCfg.minValue;
		return [ h + this.horizontalCfg.minValue, f ]
	},
	getXYFromValues : function(k) {
		var g = this.horizontalCfg.maxValue - this.horizontalCfg.minValue;
		var i = this.verticalCfg.maxValue - this.verticalCfg.minValue;
		var h = Math.round((k[0] - this.horizontalCfg.minValue) * this.getAvailableWidth() / g);
		var l = k[1] - this.verticalCfg.minValue;
		var j = Math.round(l * this.getAvailableHeight() / i);
		return [ h, j ]
	},
	updatePosition : function() {
		var d = this.getValues();
		var c = this.getXYFromValues(d);
		this.valueHandle.setLeft(Ext.Number.constrain(c[0], 0, this.getAvailableWidth()));
		if (this.verticalCfg.disabled) {
			this.valueHandle.setTop(this.dialogConfig.rowHeight)
		} else {
			this.valueHandle.setTop(Ext.Number.constrain(c[1], 0, this.getAvailableHeight()))
		}
		this.positionValueText();
		this.setValueText(d)
	},
	positionValueText : function() {
		var d = this.valueHandle.getTop(true);
		var c = this.valueHandle.getLeft(true);
		this.valueSpan.setLeft(c > 30 ? -30 : 10);
		this.valueSpan.setTop(d > 10 ? -20 : 20)
	},
	setValueText : function(b) {
		if (this.verticalCfg.disabled) {
			b[1] = this.dialogConfig.rowHeight
		}
		this.valueSpan.update("[" + b.toString() + "]")
	},
	setValues : function(b) {
		this.horizontal.setValue(b[0]);
		if (this.verticalCfg.reverse) {
			if (!this.verticalCfg.disabled) {
				this.vertical.setValue(this.verticalCfg.maxValue + this.verticalCfg.minValue - b[1])
			}
		} else {
			if (!this.verticalCfg.disabled) {
				this.vertical.setValue(b[1])
			}
		}
		if (!this.dragging) {
			this.updatePosition()
		}
		this.positionValueText();
		this.setValueText(b)
	},
	getValues : function() {
		if (!this.verticalCfg.disabled) {
			var b = this.vertical.getValue();
			if (this.verticalCfg.reverse) {
				b = this.verticalCfg.maxValue - b + this.verticalCfg.minValue
			}
			return [ this.horizontal.getValue(), b ]
		}
		return [ this.horizontal.getValue() ]
	},
	onSliderChange : function() {
		this.fireEvent("change", this, this.getValues());
		if (!this.dragging) {
			this.updatePosition()
		}
	},
	onSliderChangeComplete : function() {
		this.fireEvent("changecomplete", this, this.getValues())
	},
	afterLayout : function() {
		this.callParent(arguments);
		this.updatePosition()
	}
});
Ext
		.define(
				"Sch.widget.ExportDialogForm",
				{
					extend : "Ext.form.Panel",
					requires : [ "Ext.data.Store", "Ext.ProgressBar", "Ext.form.field.ComboBox", "Ext.form.field.Date", "Ext.form.FieldContainer",
							"Ext.form.field.Checkbox", "Sch.widget.ResizePicker" ],
					border : false,
					bodyPadding : "10 10 0 10",
					autoHeight : true,
					initComponent : function() {
						var b = this;
						if (Ext.getVersion("extjs").isLessThan("4.2.1")) {
							if (typeof Ext.tip !== "undefined" && Ext.tip.Tip && Ext.tip.Tip.prototype.minWidth != "auto") {
								Ext.tip.Tip.prototype.minWidth = "auto"
							}
						}
						b.createFields();
						Ext.apply(this, {
							fieldDefaults : {
								labelAlign : "left",
								labelWidth : 120,
								anchor : "99%"
							},
							items : [ b.rangeField, b.resizerHolder, b.datesHolder, b.showHeaderField, b.exportToSingleField, b.formatField,
									b.orientationField, b.progressBar || b.createProgressBar() ]
						});
						b.callParent(arguments);
						b.onRangeChange(null, b.dialogConfig.defaultConfig.range);
						b.on({
							hideprogressbar : b.hideProgressBar,
							showprogressbar : b.showProgressBar,
							updateprogressbar : b.updateProgressBar,
							scope : b
						})
					},
					isValid : function() {
						var b = this;
						if (b.rangeField.getValue() === "date") {
							return b.dateFromField.isValid() && b.dateToField.isValid()
						}
						return true
					},
					getValues : function(j, l, k, g) {
						var h = this.callParent(arguments);
						var i = this.resizePicker.getValues();
						if (!j) {
							h.cellSize = i
						} else {
							h += "&cellSize[0]=" + i[0] + "&cellSize[1]=" + i[1]
						}
						return h
					},
					createFields : function() {
						var k = this, h = k.dialogConfig, i = '<table class="sch-fieldcontainer-label-wrap"><td width="1" class="sch-fieldcontainer-label">', j = '<td><div class="sch-fieldcontainer-separator"></div></table>';
						k.rangeField = new Ext.form.field.ComboBox({
							value : h.defaultConfig.range,
							triggerAction : "all",
							cls : "sch-export-dialog-range",
							forceSelection : true,
							editable : false,
							fieldLabel : h.rangeFieldLabel,
							name : "range",
							queryMode : "local",
							displayField : "name",
							valueField : "value",
							store : new Ext.data.Store({
								fields : [ "name", "value" ],
								data : [ {
									name : h.completeViewText,
									value : "complete"
								}, {
									name : h.dateRangeText,
									value : "date"
								}, {
									name : h.currentViewText,
									value : "current"
								} ]
							}),
							listeners : {
								change : k.onRangeChange,
								scope : k
							}
						});
						k.resizePicker = new Sch.widget.ResizePicker({
							dialogConfig : h,
							margin : "10 20"
						});
						k.resizerHolder = new Ext.form.FieldContainer({
							fieldLabel : h.scrollerDisabled ? h.adjustCols : h.adjustColsAndRows,
							labelAlign : "top",
							hidden : true,
							labelSeparator : "",
							beforeLabelTextTpl : i,
							afterLabelTextTpl : j,
							layout : "vbox",
							defaults : {
								flex : 1,
								allowBlank : false
							},
							items : [ k.resizePicker ]
						});
						k.dateFromField = new Ext.form.field.Date({
							fieldLabel : h.dateRangeFromText,
							baseBodyCls : "sch-exportdialogform-date",
							name : "dateFrom",
							format : h.dateRangeFormat || Ext.Date.defaultFormat,
							allowBlank : false,
							maxValue : h.endDate,
							minValue : h.startDate,
							value : h.startDate
						});
						k.dateToField = new Ext.form.field.Date({
							fieldLabel : h.dateRangeToText,
							name : "dateTo",
							format : h.dateRangeFormat || Ext.Date.defaultFormat,
							baseBodyCls : "sch-exportdialogform-date",
							allowBlank : false,
							maxValue : h.endDate,
							minValue : h.startDate,
							value : h.endDate
						});
						k.datesHolder = new Ext.form.FieldContainer({
							fieldLabel : h.specifyDateRange,
							labelAlign : "top",
							hidden : true,
							labelSeparator : "",
							beforeLabelTextTpl : i,
							afterLabelTextTpl : j,
							layout : "vbox",
							defaults : {
								flex : 1,
								allowBlank : false
							},
							items : [ k.dateFromField, k.dateToField ]
						});
						k.showHeaderField = new Ext.form.field.Checkbox({
							xtype : "checkboxfield",
							boxLabel : k.dialogConfig.showHeaderLabel,
							name : "showHeader",
							checked : !!h.defaultConfig.showHeaderLabel
						});
						k.exportToSingleField = new Ext.form.field.Checkbox({
							xtype : "checkboxfield",
							boxLabel : k.dialogConfig.exportToSingleLabel,
							name : "singlePageExport",
							checked : !!h.defaultConfig.singlePageExport
						});
						k.formatField = new Ext.form.field.ComboBox({
							value : h.defaultConfig.format,
							triggerAction : "all",
							forceSelection : true,
							editable : false,
							fieldLabel : h.formatFieldLabel,
							name : "format",
							queryMode : "local",
							store : [ "A5", "A4", "A3", "Letter", "Legal" ]
						});
						var l = h.defaultConfig.orientation === "portrait" ? 'class="sch-none"' : "", g = h.defaultConfig.orientation === "landscape" ? 'class="sch-none"'
								: "";
						k.orientationField = new Ext.form.field.ComboBox({
							value : h.defaultConfig.orientation,
							triggerAction : "all",
							baseBodyCls : "sch-exportdialogform-orientation",
							forceSelection : true,
							editable : false,
							fieldLabel : k.dialogConfig.orientationFieldLabel,
							afterSubTpl : new Ext.XTemplate('<span id="sch-exportdialog-imagePortrait" ' + g
									+ '></span><span id="sch-exportdialog-imageLandscape" ' + l + "></span>"),
							name : "orientation",
							displayField : "name",
							valueField : "value",
							queryMode : "local",
							store : new Ext.data.Store({
								fields : [ "name", "value" ],
								data : [ {
									name : h.orientationPortraitText,
									value : "portrait"
								}, {
									name : h.orientationLandscapeText,
									value : "landscape"
								} ]
							}),
							listeners : {
								change : function(a, b) {
									switch (b) {
									case "landscape":
										Ext.fly("sch-exportdialog-imagePortrait").toggleCls("sch-none");
										Ext.fly("sch-exportdialog-imageLandscape").toggleCls("sch-none");
										break;
									case "portrait":
										Ext.fly("sch-exportdialog-imagePortrait").toggleCls("sch-none");
										Ext.fly("sch-exportdialog-imageLandscape").toggleCls("sch-none");
										break
									}
								}
							}
						})
					},
					createProgressBar : function() {
						return this.progressBar = new Ext.ProgressBar({
							text : this.config.progressBarText,
							animate : true,
							hidden : true,
							margin : "4px 0 10px 0"
						})
					},
					onRangeChange : function(c, d) {
						switch (d) {
						case "complete":
							this.datesHolder.hide();
							this.resizerHolder.hide();
							break;
						case "date":
							this.datesHolder.show();
							this.resizerHolder.hide();
							break;
						case "current":
							this.datesHolder.hide();
							this.resizerHolder.show();
							this.resizePicker.expand(true);
							break
						}
					},
					showProgressBar : function() {
						if (this.progressBar) {
							this.progressBar.show()
						}
					},
					hideProgressBar : function() {
						if (this.progressBar) {
							this.progressBar.hide()
						}
					},
					updateProgressBar : function(b) {
						if (this.progressBar) {
							this.progressBar.updateProgress(b)
						}
					}
				});
Ext.define("Sch.widget.ExportDialog", {
	alternateClassName : "Sch.widget.PdfExportDialog",
	extend : "Ext.window.Window",
	requires : [ "Sch.widget.ExportDialogForm" ],
	mixins : [ "Sch.mixin.Localizable" ],
	alias : "widget.exportdialog",
	modal : false,
	width : 350,
	cls : "sch-exportdialog",
	frame : false,
	layout : "fit",
	draggable : true,
	padding : 0,
	plugin : null,
	buttonsPanel : null,
	buttonsPanelScope : null,
	progressBar : null,
	dateRangeFormat : "",
	constructor : function(b) {
		Ext.apply(this, b.exportDialogConfig);
		Ext.Array.forEach([ "generalError", "title", "formatFieldLabel", "orientationFieldLabel", "rangeFieldLabel", "showHeaderLabel",
				"orientationPortraitText", "orientationLandscapeText", "completeViewText", "currentViewText", "dateRangeText", "dateRangeFromText",
				"pickerText", "dateRangeToText", "exportButtonText", "cancelButtonText", "progressBarText", "exportToSingleLabel" ], function(a) {
			if (a in b) {
				this[a] = b[a]
			}
		}, this);
		this.title = this.L("title");
		this.config = Ext.apply({
			progressBarText : this.L("progressBarText"),
			dateRangeToText : this.L("dateRangeToText"),
			pickerText : this.L("pickerText"),
			dateRangeFromText : this.L("dateRangeFromText"),
			dateRangeText : this.L("dateRangeText"),
			currentViewText : this.L("currentViewText"),
			formatFieldLabel : this.L("formatFieldLabel"),
			orientationFieldLabel : this.L("orientationFieldLabel"),
			rangeFieldLabel : this.L("rangeFieldLabel"),
			showHeaderLabel : this.L("showHeaderLabel"),
			exportToSingleLabel : this.L("exportToSingleLabel"),
			orientationPortraitText : this.L("orientationPortraitText"),
			orientationLandscapeText : this.L("orientationLandscapeText"),
			completeViewText : this.L("completeViewText"),
			adjustCols : this.L("adjustCols"),
			adjustColsAndRows : this.L("adjustColsAndRows"),
			specifyDateRange : this.L("specifyDateRange"),
			dateRangeFormat : this.dateRangeFormat,
			defaultConfig : this.defaultConfig
		}, b.exportDialogConfig);
		this.callParent(arguments)
	},
	initComponent : function() {
		var c = this, d = {
			hidedialogwindow : c.destroy,
			showdialogerror : c.showError,
			updateprogressbar : function(a) {
				c.fireEvent("updateprogressbar", a)
			},
			scope : this
		};
		c.form = c.buildForm(c.config);
		Ext.apply(this, {
			items : c.form,
			fbar : c.buildButtons(c.buttonsPanelScope || c)
		});
		c.callParent(arguments);
		c.plugin.on(d)
	},
	afterRender : function() {
		var b = this;
		b.relayEvents(b.form.resizePicker, [ "change", "changecomplete", "select" ]);
		b.form.relayEvents(b, [ "updateprogressbar", "hideprogressbar", "showprogressbar" ]);
		b.callParent(arguments)
	},
	buildButtons : function(b) {
		return [ {
			xtype : "button",
			scale : "medium",
			text : this.L("exportButtonText"),
			handler : function() {
				if (this.form.isValid()) {
					this.fireEvent("showprogressbar");
					this.plugin.doExport(this.form.getValues())
				}
			},
			scope : b
		}, {
			xtype : "button",
			scale : "medium",
			text : this.L("cancelButtonText"),
			handler : function() {
				this.destroy()
			},
			scope : b
		} ]
	},
	buildForm : function(b) {
		return new Sch.widget.ExportDialogForm({
			progressBar : this.progressBar,
			dialogConfig : b
		})
	},
	showError : function(e, f) {
		var h = e, g = f || h.L("generalError");
		h.fireEvent("hideprogressbar");
		Ext.Msg.alert("", g)
	}
});
Ext.define("Sch.feature.ColumnLines", {
	extend : "Sch.plugin.Lines",
	requires : [ "Ext.data.JsonStore" ],
	cls : "sch-column-line",
	showTip : false,
	timeAxisViewModel : null,
	renderingDoneEvent : "columnlinessynced",
	init : function(b) {
		this.timeAxis = b.getTimeAxis();
		this.timeAxisViewModel = b.timeAxisViewModel;
		this.panel = b;
		this.store = new Ext.data.JsonStore({
			fields : [ "Date" ]
		});
		this.store.loadData = this.store.loadData || this.store.setData;
		this.callParent(arguments);
		b.on({
			orientationchange : this.populate,
			destroy : this.onHostDestroy,
			scope : this
		});
		this.timeAxisViewModel.on("update", this.populate, this);
		this.populate()
	},
	onHostDestroy : function() {
		this.timeAxisViewModel.un("update", this.populate, this)
	},
	populate : function() {
		this.store.loadData(this.getData())
	},
	getElementData : function() {
		var b = this.schedulerView;
		if (b.isHorizontal() && b.store.getCount() > 0) {
			return this.callParent(arguments)
		}
		return []
	},
	getData : function() {
		var i = this.panel, l = [];
		if (i.isHorizontal()) {
			var k = this.timeAxisViewModel;
			var n = k.columnLinesFor;
			var m = !!(k.headerConfig && k.headerConfig[n].cellGenerator);
			if (m) {
				var p = k.getColumnConfig()[n];
				for (var o = 1, j = p.length; o < j; o++) {
					l.push({
						Date : p[o].start
					})
				}
			} else {
				k.forEachInterval(n, function(a, c, b) {
					if (b > 0) {
						l.push({
							Date : a
						})
					}
				})
			}
		}
		return l
	}
});
Ext.define("Sch.mixin.AbstractTimelineView", {
	requires : [ "Sch.data.TimeAxis", "Sch.view.Horizontal" ],
	selectedEventCls : "sch-event-selected",
	readOnly : false,
	horizontalViewClass : "Sch.view.Horizontal",
	timeCellCls : "sch-timetd",
	timeCellSelector : ".sch-timetd",
	eventBorderWidth : 1,
	timeAxis : null,
	timeAxisViewModel : null,
	eventPrefix : null,
	rowHeight : null,
	orientation : "horizontal",
	horizontal : null,
	vertical : null,
	secondaryCanvasEl : null,
	panel : null,
	displayDateFormat : null,
	el : null,
	_initializeTimelineView : function() {
		if (this.horizontalViewClass) {
			this.horizontal = Ext.create(this.horizontalViewClass, {
				view : this
			})
		}
		if (this.verticalViewClass) {
			this.vertical = Ext.create(this.verticalViewClass, {
				view : this
			})
		}
		this.eventPrefix = (this.eventPrefix || this.getId()) + "-"
	},
	getTimeAxisViewModel : function() {
		return this.timeAxisViewModel
	},
	getFormattedDate : function(b) {
		return Ext.Date.format(b, this.getDisplayDateFormat())
	},
	getFormattedEndDate : function(f, e) {
		var d = this.getDisplayDateFormat();
		if (f.getHours() === 0 && f.getMinutes() === 0
				&& !(f.getYear() === e.getYear() && f.getMonth() === e.getMonth() && f.getDate() === e.getDate())
				&& !Sch.util.Date.hourInfoRe.test(d.replace(Sch.util.Date.stripEscapeRe, ""))) {
			f = Sch.util.Date.add(f, Sch.util.Date.DAY, -1)
		}
		return Ext.Date.format(f, d)
	},
	getDisplayDateFormat : function() {
		return this.displayDateFormat
	},
	setDisplayDateFormat : function(b) {
		this.displayDateFormat = b
	},
	fitColumns : function(c) {
		if (this.orientation === "horizontal") {
			this.getTimeAxisViewModel().fitToAvailableWidth(c)
		} else {
			var d = Math.floor((this.panel.getWidth() - Ext.getScrollbarSize().width - 1) / this.headerCt.getColumnCount());
			this.setColumnWidth(d, c)
		}
	},
	getElementFromEventRecord : function(b) {
		return Ext.get(this.eventPrefix + b.internalId)
	},
	getEventNodeByRecord : function(b) {
		return document.getElementById(this.eventPrefix + b.internalId)
	},
	getEventNodesByRecord : function(b) {
		return this.el.select("[id=" + this.eventPrefix + b.internalId + "]")
	},
	getStartEndDatesFromRegion : function(f, d, e) {
		return this[this.orientation].getStartEndDatesFromRegion(f, d, e)
	},
	getTimeResolution : function() {
		return this.timeAxis.getResolution()
	},
	setTimeResolution : function(c, d) {
		this.timeAxis.setResolution(c, d);
		if (this.getTimeAxisViewModel().snapToIncrement) {
			this.refreshKeepingScroll()
		}
	},
	getEventIdFromDomNodeId : function(b) {
		return b.substring(this.eventPrefix.length)
	},
	getDateFromDomEvent : function(c, d) {
		return this.getDateFromXY(c.getXY(), d)
	},
	getSnapPixelAmount : function() {
		return this.getTimeAxisViewModel().getSnapPixelAmount()
	},
	getTimeColumnWidth : function() {
		return this.getTimeAxisViewModel().getTickWidth()
	},
	setSnapEnabled : function(b) {
		this.getTimeAxisViewModel().setSnapToIncrement(b)
	},
	setReadOnly : function(b) {
		this.readOnly = b;
		this[b ? "addCls" : "removeCls"](this._cmpCls + "-readonly")
	},
	isReadOnly : function() {
		return this.readOnly
	},
	setOrientation : function(b) {
		this.orientation = b;
		this.timeAxisViewModel.orientation = b
	},
	getOrientation : function() {
		return this.orientation
	},
	isHorizontal : function() {
		return this.getOrientation() === "horizontal"
	},
	isVertical : function() {
		return !this.isHorizontal()
	},
	getDateFromXY : function(f, d, e) {
		return this.getDateFromCoordinate(this.orientation === "horizontal" ? f[0] : f[1], d, e)
	},
	getDateFromCoordinate : function(f, d, e) {
		if (!e) {
			f = this[this.orientation].translateToScheduleCoordinate(f)
		}
		return this.timeAxisViewModel.getDateFromPosition(f, d)
	},
	getDateFromX : function(d, c) {
		return this.getDateFromCoordinate(d, c)
	},
	getDateFromY : function(c, d) {
		return this.getDateFromCoordinate(c, d)
	},
	getCoordinateFromDate : function(e, d) {
		var f = this.timeAxisViewModel.getPositionFromDate(e);
		if (d === false) {
			f = this[this.orientation].translateToPageCoordinate(f)
		}
		return Math.round(f)
	},
	getXFromDate : function(d, c) {
		return this.getCoordinateFromDate(d, c)
	},
	getYFromDate : function(d, c) {
		return this.getCoordinateFromDate(d, c)
	},
	getTimeSpanDistance : function(d, c) {
		return this.timeAxisViewModel.getDistanceBetweenDates(d, c)
	},
	getTimeSpanRegion : function(d, c) {
		return this[this.orientation].getTimeSpanRegion(d, c)
	},
	getScheduleRegion : function(c, d) {
		return this[this.orientation].getScheduleRegion(c, d)
	},
	getTableRegion : function() {
		throw "Abstract method call"
	},
	getRowNode : function(b) {
		throw "Abstract method call"
	},
	getRecordForRowNode : function(b) {
		throw "Abstract method call"
	},
	getVisibleDateRange : function() {
		return this[this.orientation].getVisibleDateRange()
	},
	setColumnWidth : function(c, d) {
		this[this.orientation].setColumnWidth(c, d)
	},
	findRowByChild : function(b) {
		throw "Abstract method call"
	},
	setBarMargin : function(c, d) {
		this.barMargin = c;
		if (!d) {
			this.refreshKeepingScroll()
		}
	},
	getRowHeight : function() {
		return this.timeAxisViewModel.getViewRowHeight()
	},
	setRowHeight : function(d, c) {
		this.timeAxisViewModel.setViewRowHeight(d, c)
	},
	refreshKeepingScroll : function() {
		throw "Abstract method call"
	},
	scrollVerticallyTo : function(c, d) {
		throw "Abstract method call"
	},
	scrollHorizontallyTo : function(d, c) {
		throw "Abstract method call"
	},
	getVerticalScroll : function() {
		throw "Abstract method call"
	},
	getHorizontalScroll : function() {
		throw "Abstract method call"
	},
	getEl : Ext.emptyFn,
	getSecondaryCanvasEl : function() {
		if (!this.rendered) {
			throw "Calling this method too early"
		}
		if (!this.secondaryCanvasEl) {
			this.secondaryCanvasEl = this.getEl().createChild({
				cls : "sch-secondary-canvas"
			})
		}
		return this.secondaryCanvasEl
	},
	getScroll : function() {
		throw "Abstract method call"
	},
	getOuterEl : function() {
		return this.getEl()
	},
	getRowContainerEl : function() {
		return this.getEl()
	},
	getScheduleCell : function(c, d) {
		return this.getCellByPosition({
			row : c,
			column : d
		})
	},
	getScrollEventSource : function() {
		return this.getEl()
	},
	getViewportHeight : function() {
		return this.getEl().getHeight()
	},
	getViewportWidth : function() {
		return this.getEl().getWidth()
	},
	getDateConstraints : Ext.emptyFn
});
Ext.apply(Sch, {
	VERSION : "2.2.22"
});
Ext
		.define(
				"Sch.mixin.TimelineView",
				{
					extend : "Sch.mixin.AbstractTimelineView",
					requires : [ "Ext.tip.ToolTip" ],
					overScheduledEventClass : "sch-event-hover",
					ScheduleEventMap : {
						click : "Click",
						mousedown : "MouseDown",
						mouseup : "MouseUp",
						dblclick : "DblClick",
						contextmenu : "ContextMenu",
						keydown : "KeyDown",
						keyup : "KeyUp"
					},
					preventOverCls : false,
					_initializeTimelineView : function() {
						this.callParent(arguments);
						this.on("destroy", this._onDestroy, this);
						this.on("afterrender", this._onAfterRender, this);
						this.setOrientation(this.orientation);
						this.enableBubble("columnwidthchange");
						this.addCls("sch-timelineview");
						if (this.readOnly) {
							this.addCls(this._cmpCls + "-readonly")
						}
						this.addCls(this._cmpCls);
						if (this.eventAnimations) {
							this.addCls("sch-animations-enabled")
						}
					},
					inheritables : function() {
						return {
							processUIEvent : function(i) {
								var g = i.getTarget(this.eventSelector), j = this.ScheduleEventMap, e = i.type, h = false;
								if (g && e in j) {
									this.fireEvent(this.scheduledEventName + e, this, this.resolveEventRecord(g), i);
									h = !(this.getSelectionModel() instanceof Ext.selection.RowModel)
								}
								if (!h) {
									return this.callParent(arguments)
								}
							}
						}
					},
					_onDestroy : function() {
						if (this.tip) {
							this.tip.destroy()
						}
					},
					_onAfterRender : function() {
						if (this.overScheduledEventClass) {
							this.setMouseOverEnabled(true)
						}
						if (this.tooltipTpl) {
							this.el.on("mousemove", this.setupTooltip, this, {
								single : true
							})
						}
						var f = this.bufferedRenderer;
						if (f) {
							this.patchBufferedRenderingPlugin(f);
							this.patchBufferedRenderingPlugin(this.lockingPartner.bufferedRenderer)
						}
						this.on("bufferedrefresh", this.onBufferedRefresh, this, {
							buffer : 10
						});
						this.setupTimeCellEvents();
						var d = this.getSecondaryCanvasEl();
						if (d.getStyle("position").toLowerCase() !== "absolute") {
							var e = Ext.Msg || window;
							e.alert("ERROR: The CSS file for the Bryntum component has not been loaded.")
						}
					},
					patchBufferedRenderingPlugin : function(f) {
						var d = this;
						var e = f.setBodyTop;
						f.setBodyTop = function(c, b) {
							if (c < 0) {
								c = 0
							}
							var a = e.apply(this, arguments);
							d.fireEvent("bufferedrefresh", this);
							return a
						}
					},
					onBufferedRefresh : function() {
						this.getSecondaryCanvasEl().dom.style.top = this.body.dom.style.top
					},
					setMouseOverEnabled : function(b) {
						this[b ? "mon" : "mun"](this.el, {
							mouseover : this.onEventMouseOver,
							mouseout : this.onEventMouseOut,
							delegate : this.eventSelector,
							scope : this
						})
					},
					onEventMouseOver : function(f, e) {
						if (e !== this.lastItem && !this.preventOverCls) {
							this.lastItem = e;
							Ext.fly(e).addCls(this.overScheduledEventClass);
							var d = this.resolveEventRecord(e);
							if (d) {
								this.fireEvent("eventmouseenter", this, d, f)
							}
						}
					},
					onEventMouseOut : function(c, d) {
						if (this.lastItem) {
							if (!c.within(this.lastItem, true, true)) {
								Ext.fly(this.lastItem).removeCls(this.overScheduledEventClass);
								this.fireEvent("eventmouseleave", this, this.resolveEventRecord(this.lastItem), c);
								delete this.lastItem
							}
						}
					},
					highlightItem : function(c) {
						if (c) {
							var d = this;
							d.clearHighlight();
							d.highlightedItem = c;
							Ext.fly(c).addCls(d.overItemCls)
						}
					},
					setupTooltip : function() {
						var c = this, d = Ext.apply({
							renderTo : Ext.getBody(),
							delegate : c.eventSelector,
							target : c.el,
							anchor : "b",
							rtl : c.rtl,
							show : function() {
								Ext.ToolTip.prototype.show.apply(this, arguments);
								if (this.triggerElement && c.getOrientation() === "horizontal") {
									this.setX(this.targetXY[0] - 10);
									this.setY(Ext.fly(this.triggerElement).getY() - this.getHeight() - 10)
								}
							}
						}, c.tipCfg);
						c.tip = new Ext.ToolTip(d);
						c.tip.on({
							beforeshow : function(a) {
								if (!a.triggerElement || !a.triggerElement.id) {
									return false
								}
								var b = this.resolveEventRecord(a.triggerElement);
								if (!b || this.fireEvent("beforetooltipshow", this, b) === false) {
									return false
								}
								a.update(this.tooltipTpl.apply(this.getDataForTooltipTpl(b)))
							},
							scope : this
						})
					},
					getTimeAxisColumn : function() {
						if (!this.timeAxisColumn) {
							this.timeAxisColumn = this.headerCt.down("timeaxiscolumn")
						}
						return this.timeAxisColumn
					},
					getDataForTooltipTpl : function(b) {
						return Ext.apply({
							_record : b
						}, b.data)
					},
					refreshKeepingScroll : function() {
						Ext.suspendLayouts();
						this.saveScrollState();
						this.refresh();
						if (this.up("tablepanel[lockable=true]").lockedGridDependsOnSchedule) {
							this.lockingPartner.refresh()
						}
						Ext.resumeLayouts(true);
						if (this.scrollState.left !== 0 || this.scrollState.top !== 0 || this.infiniteScroll) {
							this.restoreScrollState()
						}
					},
					setupTimeCellEvents : function() {
						this.mon(this.el, {
							click : this.handleScheduleEvent,
							dblclick : this.handleScheduleEvent,
							contextmenu : this.handleScheduleEvent,
							scope : this
						})
					},
					getTableRegion : function() {
						var b = this.el.down("." + Ext.baseCSSPrefix + (Ext.versions.extjs.isLessThan("5.0") ? "grid-table" : "grid-item-container"));
						return (b || this.el).getRegion()
					},
					getRowNode : function(b) {
						return this.getNodeByRecord(b)
					},
					findRowByChild : function(b) {
						return this.findItemByChild(b)
					},
					getRecordForRowNode : function(b) {
						return this.getRecord(b)
					},
					refreshKeepingResourceScroll : function() {
						var b = this.getScroll();
						this.refresh();
						if (this.getOrientation() === "horizontal") {
							this.scrollVerticallyTo(b.top)
						} else {
							this.scrollHorizontallyTo(b.left)
						}
					},
					scrollHorizontallyTo : function(e, d) {
						var f = this.getEl();
						if (f) {
							f.scrollTo("left", Math.max(0, e), d)
						}
					},
					scrollVerticallyTo : function(f, e) {
						var d = this.getEl();
						if (d) {
							d.scrollTo("top", Math.max(0, f), e)
						}
					},
					getVerticalScroll : function() {
						var b = this.getEl();
						return b.getScroll().top
					},
					getHorizontalScroll : function() {
						var b = this.getEl();
						return b.getScroll().left
					},
					getScroll : function() {
						var b = this.getEl().getScroll();
						return {
							top : b.top,
							left : b.left
						}
					},
					getXYFromDate : function() {
						var b = this.getCoordinateFromDate.apply(this, arguments);
						return this.orientation === "horizontal" ? [ b, 0 ] : [ 0, b ]
					},
					handleScheduleEvent : function(b) {
					},
					scrollElementIntoView : function(I, z, u, E, F) {
						var J = 20, v = I.dom, C = I.getOffsetsTo(z = Ext.getDom(z) || Ext.getBody().dom), G = C[0] + z.scrollLeft, y = C[1]
								+ z.scrollTop, B = y + v.offsetHeight, t = G + v.offsetWidth, x = z.clientHeight, D = parseInt(z.scrollTop, 10), s = parseInt(
								z.scrollLeft, 10), w = D + x, A = s + z.clientWidth, H;
						if (F) {
							if (E) {
								E = Ext.apply({
									listeners : {
										afteranimate : function() {
											Ext.fly(v).highlight()
										}
									}
								}, E)
							} else {
								Ext.fly(v).highlight()
							}
						}
						if (v.offsetHeight > x || y < D) {
							H = y - J
						} else {
							if (B > w) {
								H = B - x + J
							}
						}
						if (H != null) {
							Ext.fly(z).scrollTo("top", H, E)
						}
						if (u !== false) {
							H = null;
							if (v.offsetWidth > z.clientWidth || G < s) {
								H = G - J
							} else {
								if (t > A) {
									H = t - z.clientWidth + J
								}
							}
							if (H != null) {
								Ext.fly(z).scrollTo("left", H, E)
							}
						}
						return I
					}
				});
Ext.define("Sch.view.TimelineGridView", {
	extend : "Ext.grid.View",
	mixins : [ "Sch.mixin.TimelineView" ],
	infiniteScroll : false,
	bufferCoef : 5,
	bufferThreshold : 0.2,
	cachedScrollLeftDate : null,
	boxIsReady : false,
	ignoreNextHorizontalScroll : false,
	constructor : function(b) {
		this.callParent(arguments);
		if (this.infiniteScroll) {
			this.on("afterrender", this.setupInfiniteScroll, this, {
				single : true
			})
		}
		if (this.timeAxisViewModel) {
			this.relayEvents(this.timeAxisViewModel, [ "columnwidthchange" ])
		}
	},
	setupInfiniteScroll : function() {
		var c = this.panel.ownerCt;
		this.cachedScrollLeftDate = c.startDate || this.timeAxis.getStart();
		var d = this;
		c.calculateOptimalDateRange = function(i, j, a, h) {
			if (h) {
				return h
			}
			var b = Sch.preset.Manager.getPreset(a.preset);
			return d.calculateInfiniteScrollingDateRange(i, b.getBottomHeader().unit, a.increment, a.width)
		};
		this.el.on("scroll", this.onHorizontalScroll, this);
		this.on("resize", this.onSelfResize, this)
	},
	onHorizontalScroll : function() {
		if (this.ignoreNextHorizontalScroll || this.cachedScrollLeftDate) {
			this.ignoreNextHorizontalScroll = false;
			return
		}
		var f = this.el.dom, d = this.getWidth(), e = d * this.bufferThreshold * this.bufferCoef;
		if ((f.scrollWidth - f.scrollLeft - d < e) || f.scrollLeft < e) {
			this.shiftToDate(this.getDateFromCoordinate(f.scrollLeft, null, true));
			this.el.stopAnimation()
		}
	},
	refresh : function() {
		this.callParent(arguments);
		if (this.infiniteScroll && !this.scrollStateSaved && this.boxIsReady) {
			this.restoreScrollLeftDate()
		}
	},
	onSelfResize : function(j, i, g, f, h) {
		this.boxIsReady = true;
		if (i != f) {
			this.shiftToDate(this.cachedScrollLeftDate || this.timeAxis.getStart(), this.cachedScrollCentered)
		}
	},
	restoreScrollLeftDate : function() {
		if (this.cachedScrollLeftDate && this.boxIsReady) {
			this.ignoreNextHorizontalScroll = true;
			this.scrollToDate(this.cachedScrollLeftDate);
			this.cachedScrollLeftDate = null
		}
	},
	scrollToDate : function(d) {
		this.cachedScrollLeftDate = d;
		if (this.cachedScrollCentered) {
			this.panel.ownerCt.scrollToDateCentered(d)
		} else {
			this.panel.ownerCt.scrollToDate(d)
		}
		var c = this.el.dom.scrollLeft;
		this.panel.scrollLeftPos = c;
		this.headerCt.el.dom.scrollLeft = c
	},
	saveScrollState : function() {
		this.scrollStateSaved = this.boxIsReady;
		this.callParent(arguments)
	},
	restoreScrollState : function() {
		this.scrollStateSaved = false;
		if (this.infiniteScroll && this.cachedScrollLeftDate) {
			this.restoreScrollLeftDate();
			this.el.dom.scrollTop = this.scrollState.top;
			return
		}
		this.callParent(arguments)
	},
	calculateInfiniteScrollingDateRange : function(n, m, i, j) {
		var l = this.timeAxis;
		var o = this.getWidth();
		j = j || this.timeAxisViewModel.getTickWidth();
		i = i || l.increment || 1;
		m = m || l.unit;
		var k = Sch.util.Date;
		var p = Math.ceil(o * this.bufferCoef / j);
		return {
			start : l.floorDate(k.add(n, m, -p * i), false, m, i),
			end : l.ceilDate(k.add(n, m, Math.ceil((o / j + p) * i)), false, m, i)
		}
	},
	shiftToDate : function(d, f) {
		var e = this.calculateInfiniteScrollingDateRange(d);
		this.cachedScrollLeftDate = d;
		this.cachedScrollCentered = f;
		this.timeAxis.setTimeSpan(e.start, e.end)
	},
	destroy : function() {
		if (this.infiniteScroll && this.rendered) {
			this.el.un("scroll", this.onHorizontalScroll, this)
		}
		this.callParent(arguments)
	}
}, function() {
	this.override(Sch.mixin.TimelineView.prototype.inheritables() || {})
});
Ext
		.define(
				"Sch.mixin.AbstractSchedulerView",
				{
					requires : [ "Sch.eventlayout.Horizontal", "Sch.view.Vertical", "Sch.eventlayout.Vertical" ],
					_cmpCls : "sch-schedulerview",
					scheduledEventName : "event",
					barMargin : 1,
					constrainDragToResource : false,
					allowOverlap : null,
					readOnly : null,
					altColCls : "sch-col-alt",
					dynamicRowHeight : true,
					managedEventSizing : true,
					eventAnimations : true,
					horizontalLayoutCls : "Sch.eventlayout.Horizontal",
					horizontalEventSorterFn : null,
					verticalLayoutCls : "Sch.eventlayout.Vertical",
					verticalEventSorterFn : null,
					eventCls : "sch-event",
					verticalViewClass : "Sch.view.Vertical",
					eventTpl : [
							'<tpl for=".">',
							'<div unselectable="on" id="{{evt-prefix}}{id}" style="right:{right}px;left:{left}px;top:{top}px;height:{height}px;width:{width}px;{style}" class="sch-event '
									+ Ext.baseCSSPrefix + 'unselectable {internalCls} {cls}">',
							'<div unselectable="on" class="sch-event-inner {iconCls}">', "{body}", "</div>", "</div>", "</tpl>" ],
					eventStore : null,
					resourceStore : null,
					eventLayout : null,
					_initializeSchedulerView : function() {
						var e = Ext.ClassManager.get(this.horizontalLayoutCls);
						var f = Ext.ClassManager.get(this.verticalLayoutCls);
						this.eventSelector = "." + this.eventCls;
						this.eventLayout = {};
						var d = {
							view : this,
							timeAxisViewModel : this.timeAxisViewModel
						};
						if (e) {
							this.eventLayout.horizontal = new e(Ext.apply({}, d, this.horizontalEventSorterFn ? {
								sortEvents : this.horizontalEventSorterFn
							} : {}))
						}
						if (f) {
							this.eventLayout.vertical = new f(Ext.apply({}, d, this.verticalEventSorterFn ? {
								sortEvents : this.verticalEventSorterFn
							} : {}))
						}
						this.store = this.store || this.resourceStore;
						this.resourceStore = this.resourceStore || this.store
					},
					generateTplData : function(o, p, l) {
						var m = this[this.orientation].getEventRenderData(o), k = o.getStartDate(), i = o.getEndDate(), j = o.getCls() || "";
						j += " sch-event-resizable-" + o.getResizable();
						if (o.dirty) {
							j += " sch-dirty "
						}
						if (m.endsOutsideView) {
							j += " sch-event-endsoutside "
						}
						if (m.startsOutsideView) {
							j += " sch-event-startsoutside "
						}
						if (this.eventBarIconClsField) {
							j += " sch-event-withicon "
						}
						if (o.isDraggable() === false) {
							j += " sch-event-fixed "
						}
						if (i - k === 0) {
							j += " sch-event-milestone "
						}
						m.id = o.internalId;
						m.internalCls = j;
						m.start = k;
						m.end = i;
						m.iconCls = o.data[this.eventBarIconClsField] || "";
						m.event = o;
						if (this.eventRenderer) {
							var n = this.eventRenderer.call(this.eventRendererScope || this, o, p, m, l);
							if (Ext.isObject(n) && this.eventBodyTemplate) {
								m.body = this.eventBodyTemplate.apply(n)
							} else {
								m.body = n
							}
						} else {
							if (this.eventBodyTemplate) {
								m.body = this.eventBodyTemplate.apply(o.data)
							} else {
								if (this.eventBarTextField) {
									m.body = o.data[this.eventBarTextField] || ""
								}
							}
						}
						return m
					},
					resolveResource : function(b) {
						return this[this.orientation].resolveResource(b)
					},
					getResourceRegion : function(d, e, f) {
						return this[this.orientation].getResourceRegion(d, e, f)
					},
					resolveEventRecord : function(b) {
						b = b.dom ? b.dom : b;
						if (!(Ext.fly(b).hasCls(this.eventCls))) {
							b = Ext.fly(b).up(this.eventSelector)
						}
						return this.getEventRecordFromDomId(b.id)
					},
					getResourceByEventRecord : function(b) {
						return b.getResource()
					},
					getEventRecordFromDomId : function(c) {
						var d = this.getEventIdFromDomNodeId(c);
						return this.eventStore.getByInternalId(d)
					},
					isDateRangeAvailable : function(g, f, e, h) {
						return this.eventStore.isDateRangeAvailable(g, f, e, h)
					},
					getEventsInView : function() {
						var c = this.timeAxis.getStart(), d = this.timeAxis.getEnd();
						return this.eventStore.getEventsInTimeSpan(c, d)
					},
					getEventNodes : function() {
						return this.getEl().select(this.eventSelector)
					},
					onEventCreated : function(b) {
					},
					getEventStore : function() {
						return this.eventStore
					},
					registerEventEditor : function(b) {
						this.eventEditor = b
					},
					getEventEditor : function() {
						return this.eventEditor
					},
					onEventUpdate : function(d, f, e) {
						this[this.orientation].onEventUpdate(d, f, e)
					},
					onEventAdd : function(d, c) {
						if (!Ext.isArray(c)) {
							c = [ c ]
						}
						this[this.orientation].onEventAdd(d, c)
					},
					onAssignmentAdd : function(e, f) {
						var h = {};
						Ext.Array.each(f, function(a) {
							h[a.getResourceId()] = a.getResource()
						});
						for ( var g in h) {
							this.repaintEventsForResource(h[g])
						}
					},
					onAssignmentUpdate : function(k, i) {
						var h = i.previous[i.resourceIdField];
						var j = i.getResourceId();
						if (h) {
							var g = this.resourceStore.getByInternalId(h);
							this.repaintEventsForResource(g)
						}
						if (j) {
							var l = this.resourceStore.getByInternalId(j);
							this.repaintEventsForResource(l)
						}
					},
					onAssignmentRemove : function(f, h) {
						var g = h.getResourceId();
						var e = g && this.resourceStore.getByInternalId(g);
						if (e) {
							this.repaintEventsForResource(e)
						}
					},
					onEventRemove : function(d, c) {
						this[this.orientation].onEventRemove(d, c)
					},
					bindEventStore : function(m, h) {
						var k = this;
						var i = {
							scope : k,
							refresh : k.onEventDataRefresh,
							addrecords : k.onEventAdd,
							updaterecord : k.onEventUpdate,
							removerecords : k.onEventRemove,
							add : k.onEventAdd,
							update : k.onEventUpdate,
							remove : k.onEventRemove,
							insert : k.onEventAdd,
							append : k.onEventAdd
						};
						var n = {
							scope : k,
							refresh : k.onEventDataRefresh,
							load : k.onEventDataRefresh,
							update : k.onAssignmentUpdate,
							add : k.onAssignmentAdd,
							remove : k.onAssignmentRemove
						};
						if (!Ext.versions.touch) {
							i.clear = k.onEventDataRefresh
						}
						if (!h && k.eventStore) {
							k.eventStore.setResourceStore(null);
							if (m !== k.eventStore && k.eventStore.autoDestroy) {
								k.eventStore.destroy()
							} else {
								if (k.mun) {
									k.mun(k.eventStore, i);
									var l = k.eventStore.getAssignmentStore && k.eventStore.getAssignmentStore();
									if (l) {
										k.mun(l, n)
									}
								} else {
									k.eventStore.un(i)
								}
							}
							if (!m) {
								if (k.loadMask && k.loadMask.bindStore) {
									k.loadMask.bindStore(null)
								}
								k.eventStore = null
							}
						}
						if (m) {
							m = Ext.data.StoreManager.lookup(m);
							if (k.mon) {
								k.mon(m, i)
							} else {
								m.on(i)
							}
							if (k.loadMask && k.loadMask.bindStore) {
								k.loadMask.bindStore(m)
							}
							k.eventStore = m;
							m.setResourceStore(k.resourceStore);
							var j = m.getAssignmentStore && m.getAssignmentStore();
							if (j) {
								k.mon(j, n)
							}
						}
						if (m && !h) {
							k.refresh()
						}
					},
					onEventDataRefresh : function() {
						this.refreshKeepingScroll()
					},
					onEventSelect : function(d) {
						var c = this.getEventNodesByRecord(d);
						if (c) {
							c.addCls(this.selectedEventCls)
						}
					},
					onEventDeselect : function(d) {
						var c = this.getEventNodesByRecord(d);
						if (c) {
							c.removeCls(this.selectedEventCls)
						}
					},
					refresh : function() {
						throw "Abstract method call"
					},
					repaintEventsForResource : function(b) {
						throw "Abstract method call"
					},
					repaintAllEvents : function() {
						this.refreshKeepingScroll()
					},
					scrollEventIntoView : function(u, z, D, q, p) {
						p = p || this;
						var t = this;
						var s = function(a) {
							if (Ext.versions.extjs) {
								t.up("panel").scrollTask.cancel();
								t.scrollElementIntoView(a, t.el, true, D)
							} else {
								a.scrollIntoView(t.el, true, D)
							}
							if (z) {
								if (typeof z === "boolean") {
									a.highlight()
								} else {
									a.highlight(null, z)
								}
							}
							q && q.call(p)
						};
						if (Ext.data.TreeStore && this.resourceStore instanceof Ext.data.TreeStore) {
							var A = u.getResources(t.eventStore);
							if (A.length > 0 && !A[0].isVisible()) {
								A[0].bubble(function(a) {
									a.expand()
								})
							}
						}
						var v = this.timeAxis;
						var B = u.getStartDate();
						var w = u.getEndDate();
						if (!v.dateInAxis(B) || !v.dateInAxis(w)) {
							var x = v.getEnd() - v.getStart();
							v.setTimeSpan(new Date(B.getTime() - x / 2), new Date(w.getTime() + x / 2))
						}
						var C = this.getElementFromEventRecord(u);
						if (C) {
							s(C)
						} else {
							if (this.bufferedRenderer) {
								var r = this.resourceStore;
								var y = u.getResource(null, t.eventStore);
								Ext.Function.defer(function() {
									var a = r.getIndexInTotalDataset ? r.getIndexInTotalDataset(y) : r.indexOf(y);
									this.bufferedRenderer.scrollTo(a, false, function() {
										var b = t.getElementFromEventRecord(u);
										if (b) {
											s(b)
										}
									})
								}, 10, this)
							}
						}
					}
				});
Ext.define("Sch.mixin.SchedulerView", {
	extend : "Sch.mixin.AbstractSchedulerView",
	requires : [ "Sch.tooltip.Tooltip", "Sch.feature.DragCreator", "Sch.feature.DragDrop", "Sch.feature.ResizeZone", "Sch.column.Resource",
			"Ext.XTemplate" ],
	eventResizeHandles : "end",
	dndValidatorFn : Ext.emptyFn,
	resizeValidatorFn : Ext.emptyFn,
	createValidatorFn : Ext.emptyFn,
	_initializeSchedulerView : function() {
		this.callParent(arguments);
		this.on("destroy", this._destroy, this);
		this.on("afterrender", this._afterRender, this);
		var h = this;
		if (!this.eventPrefix) {
			throw "eventPrefix missing"
		}
		if (Ext.isArray(h.eventTpl)) {
			var g = Ext.Array.clone(h.eventTpl), e = '<div class="sch-resizable-handle sch-resizable-handle-{0}"></div>';
			var f = this.eventResizeHandles;
			if (f === "start" || f === "both") {
				g.splice(2, 0, Ext.String.format(e, "start"))
			}
			if (f === "end" || f === "both") {
				g.splice(2, 0, Ext.String.format(e, "end"))
			}
			h.eventTpl = new Ext.XTemplate(g.join("").replace("{{evt-prefix}}", this.eventPrefix))
		}
	},
	inheritables : function() {
		return {
			loadingText : "Loading events...",
			overItemCls : "",
			trackOver : false,
			setReadOnly : function(b) {
				if (this.dragCreator) {
					this.dragCreator.setDisabled(b)
				}
				this.callParent(arguments)
			},
			repaintEventsForResource : function(h, i) {
				var f = this.orientation === "horizontal" ? this.store.indexOf(h) : 0;
				if (this.orientation === "horizontal") {
					this.eventLayout.horizontal.clearCache(h)
				}
				if (f >= 0) {
					this.refreshNode(f);
					this.lockingPartner.refreshNode(f);
					if (i) {
						var g = this.getSelectionModel();
						var j = h.getEvents();
						Ext.each(j, function(a) {
							if (g.isSelected(a)) {
								this.onEventSelect(a, true)
							}
						}, this)
					}
				}
			},
			repaintAllEvents : function() {
				if (this.orientation === "horizontal") {
					this.refresh()
				} else {
					this.refreshNode(0)
				}
			},
			handleScheduleEvent : function(o) {
				var t = o.getTarget("." + this.eventCls, 3), l = !t && o.getTarget("." + this.timeCellCls, 3);
				if (l) {
					var e = this.getDateFromDomEvent(o, "floor");
					var m = this.findRowByChild(l);
					var p = this.indexOf(m);
					var s;
					if (this.orientation == "horizontal") {
						s = this.getRecordForRowNode(m)
					} else {
						var r = o.getTarget(this.timeCellSelector, 5);
						if (r) {
							var n = typeof r.cellIndex == "number" ? r.cellIndex : r.getAttribute("data-cellIndex");
							var q = this.headerCt.getGridColumns()[n];
							s = q && q.model
						}
					}
					this.fireEvent("schedule" + o.type, this, e, p, s, o)
				}
			},
			onEventDataRefresh : function() {
				this.clearRowHeightCache();
				this.callParent(arguments)
			},
			onUnbindStore : function(b) {
				b.un({
					refresh : this.clearRowHeightCache,
					clear : this.clearRowHeightCache,
					load : this.clearRowHeightCache,
					scope : this
				});
				this.callParent(arguments)
			},
			bindStore : function(b) {
				b && b.on({
					refresh : this.clearRowHeightCache,
					clear : this.clearRowHeightCache,
					load : this.clearRowHeightCache,
					scope : this
				});
				this.callParent(arguments)
			}
		}
	},
	_afterRender : function() {
		this.bindEventStore(this.eventStore, true);
		this.setupEventListeners();
		this.configureFunctionality();
		var b = this.headerCt.resizer;
		if (b) {
			b.doResize = Ext.Function.createSequence(b.doResize, this.afterHeaderResized, this)
		}
	},
	_destroy : function() {
		this.bindEventStore(null)
	},
	clearRowHeightCache : function() {
		if (this.orientation === "horizontal") {
			this.eventLayout.horizontal.clearCache()
		}
	},
	configureFunctionality : function() {
		var b = this.validatorFnScope || this;
		if (this.eventResizeHandles !== "none" && Sch.feature.ResizeZone) {
			this.resizePlug = new Sch.feature.ResizeZone(Ext.applyIf({
				schedulerView : this,
				validatorFn : function(g, h, a, f) {
					return (this.allowOverlap || this.isDateRangeAvailable(a, f, h, g)) && this.resizeValidatorFn.apply(b, arguments) !== false
				},
				validatorFnScope : this
			}, this.resizeConfig || {}))
		}
		if (this.enableEventDragDrop !== false && Sch.feature.DragDrop) {
			this.dragdropPlug = new Sch.feature.DragDrop(this, {
				validatorFn : function(h, a, g, f) {
					return (this.allowOverlap || this.isDateRangeAvailable(g, Sch.util.Date.add(g, Sch.util.Date.MILLI, f), h[0], a))
							&& this.dndValidatorFn.apply(b, arguments) !== false
				},
				validatorFnScope : this,
				dragConfig : this.dragConfig || {}
			})
		}
		if (this.enableDragCreation !== false && Sch.feature.DragCreator) {
			this.dragCreator = new Sch.feature.DragCreator(Ext.applyIf({
				schedulerView : this,
				disabled : this.readOnly,
				validatorFn : function(f, a, e) {
					return (this.allowOverlap || this.isDateRangeAvailable(a, e, null, f)) && this.createValidatorFn.apply(b, arguments) !== false
				},
				validatorFnScope : this
			}, this.createConfig || {}))
		}
	},
	onBeforeDragDrop : function(e, f, d) {
		return !this.readOnly && !d.getTarget().className.match("sch-resizable-handle")
	},
	onDragDropStart : function() {
		if (this.dragCreator) {
			this.dragCreator.setDisabled(true)
		}
		if (this.tip) {
			this.tip.hide();
			this.tip.disable()
		}
		if (this.overScheduledEventClass) {
			this.setMouseOverEnabled(false)
		}
	},
	onDragDropEnd : function() {
		if (this.dragCreator) {
			this.dragCreator.setDisabled(false)
		}
		if (this.tip) {
			this.tip.enable()
		}
		if (this.overScheduledEventClass) {
			this.setMouseOverEnabled(true)
		}
	},
	onBeforeDragCreate : function(e, h, f, g) {
		return !this.readOnly && !g.ctrlKey
	},
	onDragCreateStart : function() {
		if (this.overScheduledEventClass) {
			this.setMouseOverEnabled(false)
		}
		if (this.tip) {
			this.tip.hide();
			this.tip.disable()
		}
	},
	onDragCreateEnd : function(c, d) {
		if (!this.getEventEditor()) {
			if (this.fireEvent("beforeeventadd", this, d) !== false) {
				this.onEventCreated(d);
				this.eventStore.append(d)
			}
			this.dragCreator.getProxy().hide()
		}
		if (this.overScheduledEventClass) {
			this.setMouseOverEnabled(true)
		}
	},
	onEventCreated : function(b) {
	},
	onAfterDragCreate : function() {
		if (this.overScheduledEventClass) {
			this.setMouseOverEnabled(true)
		}
		if (this.tip) {
			this.tip.enable()
		}
	},
	onBeforeResize : function() {
		return !this.readOnly
	},
	onResizeStart : function() {
		if (this.tip) {
			this.tip.hide();
			this.tip.disable()
		}
		if (this.dragCreator) {
			this.dragCreator.setDisabled(true)
		}
	},
	onResizeEnd : function() {
		if (this.tip) {
			this.tip.enable()
		}
		if (this.dragCreator) {
			this.dragCreator.setDisabled(false)
		}
	},
	setupEventListeners : function() {
		this.on({
			beforeeventdrag : this.onBeforeDragDrop,
			eventdragstart : this.onDragDropStart,
			aftereventdrop : this.onDragDropEnd,
			beforedragcreate : this.onBeforeDragCreate,
			dragcreatestart : this.onDragCreateStart,
			dragcreateend : this.onDragCreateEnd,
			afterdragcreate : this.onAfterDragCreate,
			beforeeventresize : this.onBeforeResize,
			eventresizestart : this.onResizeStart,
			eventresizeend : this.onResizeEnd,
			scope : this
		})
	},
	afterHeaderResized : function() {
		var c = this.headerCt.resizer;
		if (c && c.dragHd instanceof Sch.column.Resource) {
			var d = c.dragHd.getWidth();
			this.setColumnWidth(d)
		}
	},
	columnRenderer : function(h, j, g, i, f) {
		return this[this.orientation].columnRenderer(h, j, g, i, f)
	}
});
Ext.define("Sch.view.SchedulerGridView", {
	extend : "Sch.view.TimelineGridView",
	mixins : [ "Sch.mixin.SchedulerView", "Sch.mixin.Localizable" ],
	alias : "widget.schedulergridview"
}, function() {
	this.override(Sch.mixin.SchedulerView.prototype.inheritables() || {})
});
Ext.define("Sch.mixin.Zoomable", {
	zoomLevels : [ {
		width : 40,
		increment : 1,
		resolution : 1,
		preset : "manyYears",
		resolutionUnit : "YEAR"
	}, {
		width : 80,
		increment : 1,
		resolution : 1,
		preset : "manyYears",
		resolutionUnit : "YEAR"
	}, {
		width : 30,
		increment : 1,
		resolution : 1,
		preset : "year",
		resolutionUnit : "MONTH"
	}, {
		width : 50,
		increment : 1,
		resolution : 1,
		preset : "year",
		resolutionUnit : "MONTH"
	}, {
		width : 100,
		increment : 1,
		resolution : 1,
		preset : "year",
		resolutionUnit : "MONTH"
	}, {
		width : 200,
		increment : 1,
		resolution : 1,
		preset : "year",
		resolutionUnit : "MONTH"
	}, {
		width : 100,
		increment : 1,
		resolution : 7,
		preset : "monthAndYear",
		resolutionUnit : "DAY"
	}, {
		width : 30,
		increment : 1,
		resolution : 1,
		preset : "weekDateAndMonth",
		resolutionUnit : "DAY"
	}, {
		width : 35,
		increment : 1,
		resolution : 1,
		preset : "weekAndMonth",
		resolutionUnit : "DAY"
	}, {
		width : 50,
		increment : 1,
		resolution : 1,
		preset : "weekAndMonth",
		resolutionUnit : "DAY"
	}, {
		width : 20,
		increment : 1,
		resolution : 1,
		preset : "weekAndDayLetter"
	}, {
		width : 50,
		increment : 1,
		resolution : 1,
		preset : "weekAndDay",
		resolutionUnit : "HOUR"
	}, {
		width : 100,
		increment : 1,
		resolution : 1,
		preset : "weekAndDay",
		resolutionUnit : "HOUR"
	}, {
		width : 50,
		increment : 6,
		resolution : 30,
		preset : "hourAndDay",
		resolutionUnit : "MINUTE"
	}, {
		width : 100,
		increment : 6,
		resolution : 30,
		preset : "hourAndDay",
		resolutionUnit : "MINUTE"
	}, {
		width : 60,
		increment : 2,
		resolution : 30,
		preset : "hourAndDay",
		resolutionUnit : "MINUTE"
	}, {
		width : 60,
		increment : 1,
		resolution : 30,
		preset : "hourAndDay",
		resolutionUnit : "MINUTE"
	}, {
		width : 30,
		increment : 15,
		resolution : 5,
		preset : "minuteAndHour"
	}, {
		width : 60,
		increment : 15,
		resolution : 5,
		preset : "minuteAndHour"
	}, {
		width : 130,
		increment : 15,
		resolution : 5,
		preset : "minuteAndHour"
	}, {
		width : 60,
		increment : 5,
		resolution : 5,
		preset : "minuteAndHour"
	}, {
		width : 100,
		increment : 5,
		resolution : 5,
		preset : "minuteAndHour"
	}, {
		width : 50,
		increment : 2,
		resolution : 1,
		preset : "minuteAndHour"
	}, {
		width : 30,
		increment : 10,
		resolution : 5,
		preset : "secondAndMinute"
	}, {
		width : 60,
		increment : 10,
		resolution : 5,
		preset : "secondAndMinute"
	}, {
		width : 130,
		increment : 5,
		resolution : 5,
		preset : "secondAndMinute"
	} ],
	minZoomLevel : null,
	maxZoomLevel : null,
	visibleZoomFactor : 5,
	zoomKeepsOriginalTimespan : false,
	cachedCenterDate : null,
	isFirstZoom : true,
	isZooming : false,
	initializeZooming : function() {
		this.zoomLevels = this.zoomLevels.slice();
		this.setMinZoomLevel(this.minZoomLevel || 0);
		this.setMaxZoomLevel(this.maxZoomLevel !== null ? this.maxZoomLevel : this.zoomLevels.length - 1);
		this.on("viewchange", this.clearCenterDateCache, this)
	},
	getZoomLevelUnit : function(b) {
		return Sch.preset.Manager.getPreset(b.preset).getBottomHeader().unit
	},
	getMilliSecondsPerPixelForZoomLevel : function(f, e) {
		var d = Sch.util.Date;
		return Math.round((d.add(new Date(1, 0, 1), this.getZoomLevelUnit(f), f.increment) - new Date(1, 0, 1))
				/ (e ? f.width : f.actualWidth || f.width))
	},
	presetToZoomLevel : function(c) {
		var d = Sch.preset.Manager.getPreset(c);
		return {
			preset : c,
			increment : d.getBottomHeader().increment || 1,
			resolution : d.timeResolution.increment,
			resolutionUnit : d.timeResolution.unit,
			width : d.timeColumnWidth
		}
	},
	zoomLevelToPreset : function(f) {
		var d = Sch.preset.Manager.getPreset(f.preset).clone();
		var e = d.getBottomHeader();
		e.increment = f.increment;
		d.timeColumnWidth = f.width;
		if (f.resolutionUnit || f.resolution) {
			d.timeResolution = {
				unit : f.resolutionUnit || d.timeResolution.unit || e.unit,
				increment : f.resolution || d.timeResolution.increment || 1
			}
		}
		return d
	},
	calculateCurrentZoomLevel : function() {
		var b = this.presetToZoomLevel(this.viewPreset);
		b.width = this.timeAxisViewModel.timeColumnWidth;
		b.increment = this.timeAxisViewModel.getBottomHeader().increment || 1;
		return b
	},
	getCurrentZoomLevelIndex : function() {
		var i = this.calculateCurrentZoomLevel();
		var g = this.getMilliSecondsPerPixelForZoomLevel(i);
		var j = this.zoomLevels;
		for (var l = 0; l < j.length; l++) {
			var k = this.getMilliSecondsPerPixelForZoomLevel(j[l]);
			if (k == g) {
				return l
			}
			if (l === 0 && g > k) {
				return -0.5
			}
			if (l == j.length - 1 && g < k) {
				return j.length - 1 + 0.5
			}
			var h = this.getMilliSecondsPerPixelForZoomLevel(j[l + 1]);
			if (k > g && g > h) {
				return l + 0.5
			}
		}
		throw "Can't find current zoom level index"
	},
	setMaxZoomLevel : function(b) {
		if (b < 0 || b >= this.zoomLevels.length) {
			throw new Error("Invalid range for `setMinZoomLevel`")
		}
		this.maxZoomLevel = b
	},
	setMinZoomLevel : function(b) {
		if (b < 0 || b >= this.zoomLevels.length) {
			throw new Error("Invalid range for `setMinZoomLevel`")
		}
		this.minZoomLevel = b
	},
	getViewportCenterDateCached : function() {
		if (this.cachedCenterDate) {
			return this.cachedCenterDate
		}
		return this.cachedCenterDate = this.getViewportCenterDate()
	},
	clearCenterDateCache : function() {
		this.cachedCenterDate = null
	},
	zoomToLevel : function(M, w, J) {
		M = Ext.Number.constrain(M, this.minZoomLevel, this.maxZoomLevel);
		J = J || {};
		var x = this.calculateCurrentZoomLevel();
		var K = this.getMilliSecondsPerPixelForZoomLevel(x);
		var C = this.zoomLevels[M];
		var N = this.getMilliSecondsPerPixelForZoomLevel(C);
		if (K == N && !w) {
			return null
		}
		var u = this;
		var B = this.getSchedulingView();
		var G = B.getOuterEl();
		var v = B.getScrollEventSource();
		if (this.isFirstZoom) {
			this.isFirstZoom = false;
			v.on("scroll", this.clearCenterDateCache, this)
		}
		var F = this.orientation == "vertical";
		var H = w ? new Date((w.start.getTime() + w.end.getTime()) / 2) : this.getViewportCenterDateCached();
		var A = F ? G.getHeight() : G.getWidth();
		var z = Sch.preset.Manager.getPreset(C.preset).clone();
		var y = z.getBottomHeader();
		var I = Boolean(w);
		w = this.calculateOptimalDateRange(H, A, C, w);
		z[F ? "timeRowHeight" : "timeColumnWidth"] = J.customWidth || C.width;
		y.increment = C.increment;
		this.isZooming = true;
		this.viewPreset = C.preset;
		var L = this.timeAxis;
		z.increment = C.increment;
		z.resolutionUnit = Sch.util.Date.getUnitByName(C.resolutionUnit || y.unit);
		z.resolutionIncrement = C.resolution;
		this.switchViewPreset(z, w.start || this.getStart(), w.end || this.getEnd(), false, true);
		C.actualWidth = this.timeAxisViewModel.getTickWidth();
		if (I) {
			H = J.centerDate || new Date((L.getStart().getTime() + L.getEnd().getTime()) / 2)
		}
		v.on("scroll", function() {
			u.cachedCenterDate = H
		}, this, {
			single : true
		});
		if (F) {
			var E = B.getYFromDate(H, true);
			B.scrollVerticallyTo(E - A / 2)
		} else {
			var D = B.getXFromDate(H, true);
			B.scrollHorizontallyTo(D - A / 2)
		}
		u.isZooming = false;
		this.fireEvent("zoomchange", this, M);
		return M
	},
	zoomToSpan : function(A, x) {
		if (A.start && A.end && A.start < A.end) {
			var L = A.start, O = A.end, N = x && x.adjustStart >= 0 && x.adjustEnd >= 0;
			if (N) {
				L = Sch.util.Date.add(L, this.timeAxis.mainUnit, -x.adjustStart);
				O = Sch.util.Date.add(O, this.timeAxis.mainUnit, x.adjustEnd)
			}
			var R = this.getSchedulingView().getTimeAxisViewModel().getAvailableWidth();
			var F = Math.floor(this.getCurrentZoomLevelIndex());
			if (F == -1) {
				F = 0
			}
			var w = this.zoomLevels;
			var D, Q = O - L, I = this.getMilliSecondsPerPixelForZoomLevel(w[F], true), G = Q / I > R ? -1 : 1, M = F + G;
			var C, B, K = null;
			while (M >= 0 && M <= w.length - 1) {
				C = w[M];
				var z = Q / this.getMilliSecondsPerPixelForZoomLevel(C, true);
				if (G == -1) {
					if (z <= R) {
						K = M;
						break
					}
				} else {
					if (z <= R) {
						if (F !== M - G) {
							K = M
						}
					} else {
						break
					}
				}
				M += G
			}
			K = K !== null ? K : M - G;
			C = w[K];
			var P = Sch.preset.Manager.getPreset(C.preset).getBottomHeader().unit;
			var y = Sch.util.Date.getDurationInUnit(L, O, P) / C.increment;
			if (y === 0) {
				return
			}
			var J = Math.floor(R / y);
			var H = new Date((L.getTime() + O.getTime()) / 2);
			var E;
			if (N) {
				E = {
					start : L,
					end : O
				}
			} else {
				E = this.calculateOptimalDateRange(H, R, C)
			}
			return this.zoomToLevel(K, E, {
				customWidth : J,
				centerDate : H
			})
		}
		return null
	},
	zoomIn : function(d) {
		d = d || 1;
		var c = this.getCurrentZoomLevelIndex();
		if (c >= this.zoomLevels.length - 1) {
			return null
		}
		return this.zoomToLevel(Math.floor(c) + d)
	},
	zoomOut : function(d) {
		d = d || 1;
		var c = this.getCurrentZoomLevelIndex();
		if (c <= 0) {
			return null
		}
		return this.zoomToLevel(Math.ceil(c) - d)
	},
	zoomInFull : function() {
		return this.zoomToLevel(this.maxZoomLevel)
	},
	zoomOutFull : function() {
		return this.zoomToLevel(this.minZoomLevel)
	},
	calculateOptimalDateRange : function(v, p, t, m) {
		if (m) {
			return m
		}
		var q = this.timeAxis;
		if (this.zoomKeepsOriginalTimespan) {
			return {
				start : q.getStart(),
				end : q.getEnd()
			}
		}
		var w = Sch.util.Date;
		var o = Sch.preset.Manager.getPreset(t.preset).headerConfig;
		var s = o.top ? o.top.unit : o.middle.unit;
		var n = this.getZoomLevelUnit(t);
		var u = Math.ceil(p / t.width * t.increment * this.visibleZoomFactor / 2);
		var x = w.add(v, n, -u);
		var r = w.add(v, n, u);
		return {
			start : q.floorDate(x, false, n, t.increment),
			end : q.ceilDate(r, false, n, t.increment)
		}
	}
});
Ext.define("Sch.mixin.AbstractTimelinePanel", {
	requires : [ "Sch.data.TimeAxis", "Sch.view.model.TimeAxis", "Sch.feature.ColumnLines", "Sch.preset.Manager" ],
	mixins : [ "Sch.mixin.Zoomable" ],
	orientation : "horizontal",
	weekStartDay : 1,
	snapToIncrement : false,
	readOnly : false,
	forceFit : false,
	eventResizeHandles : "both",
	timeAxis : null,
	autoAdjustTimeAxis : true,
	timeAxisViewModel : null,
	viewPreset : "weekAndDay",
	trackHeaderOver : true,
	startDate : null,
	endDate : null,
	columnLines : true,
	getDateConstraints : Ext.emptyFn,
	snapRelativeToEventStartDate : false,
	trackMouseOver : false,
	readRowHeightFromPreset : true,
	eventBorderWidth : 1,
	getOrientation : function() {
		return this.orientation
	},
	isHorizontal : function() {
		return this.getOrientation() === "horizontal"
	},
	isVertical : function() {
		return !this.isHorizontal()
	},
	cellBorderWidth : 1,
	cellTopBorderWidth : 1,
	cellBottomBorderWidth : 1,
	renderers : null,
	_initializeTimelinePanel : function() {
		var c = this.viewPreset && Sch.preset.Manager.getPreset(this.viewPreset);
		if (!c) {
			throw "You must define a valid view preset object. See Sch.preset.Manager class for reference"
		}
		this.initializeZooming();
		this.renderers = [];
		this.readRowHeightFromPreset = !this.rowHeight;
		if (!this.timeAxis) {
			this.timeAxis = new Sch.data.TimeAxis({
				autoAdjust : this.autoAdjustTimeAxis
			})
		}
		if (!this.timeAxisViewModel || !(this.timeAxisViewModel instanceof Sch.view.model.TimeAxis)) {
			var d = Ext.apply({
				orientation : this.orientation,
				snapToIncrement : this.snapToIncrement,
				forceFit : this.forceFit,
				timeAxis : this.timeAxis,
				eventStore : this.getEventStore()
			}, this.timeAxisViewModel || {});
			this.timeAxisViewModel = new Sch.view.model.TimeAxis(d)
		}
		this.timeAxisViewModel.on("update", this.onTimeAxisViewModelUpdate, this);
		this.timeAxisViewModel.refCount++;
		this.on("destroy", this.onPanelDestroyed, this);
		this.addCls([ "sch-timelinepanel", "sch-" + this.orientation ])
	},
	onTimeAxisViewModelUpdate : function() {
		var b = this.getSchedulingView();
		if (b && b.viewReady) {
			b.refreshKeepingScroll();
			this.fireEvent("viewchange", this)
		}
	},
	onPanelDestroyed : function() {
		var b = this.timeAxisViewModel;
		b.un("update", this.onTimeAxisViewModelUpdate, this);
		b.refCount--;
		if (b.refCount <= 0) {
			b.destroy()
		}
	},
	getSchedulingView : function() {
		throw "Abstract method call"
	},
	setReadOnly : function(b) {
		this.getSchedulingView().setReadOnly(b)
	},
	isReadOnly : function() {
		return this.getSchedulingView().isReadOnly()
	},
	switchViewPreset : function(j, r, o, m, q) {
		var n = this.timeAxis;
		if (this.fireEvent("beforeviewchange", this, j, r, o) !== false) {
			var k = this.getOrientation() === "horizontal";
			if (Ext.isString(j)) {
				this.viewPreset = j;
				j = Sch.preset.Manager.getPreset(j)
			}
			if (!j) {
				throw "View preset not found"
			}
			if (!(m && n.isConfigured)) {
				var p = {
					weekStartDay : this.weekStartDay
				};
				if (m) {
					if (n.getCount() === 0 || r) {
						p.start = r || new Date()
					}
				} else {
					p.start = r || n.getStart()
				}
				p.end = o;
				n.consumeViewPreset(j);
				n.reconfigure(p, true);
				this.timeAxisViewModel.reconfigure({
					headerConfig : j.headerConfig,
					columnLinesFor : j.columnLinesFor || "middle",
					rowHeightHorizontal : this.readRowHeightFromPreset ? j.rowHeight : this.rowHeight,
					tickWidth : k ? j.timeColumnWidth : j.timeRowHeight || j.timeColumnWidth || 60,
					timeColumnWidth : j.timeColumnWidth,
					rowHeightVertical : j.timeRowHeight || j.timeColumnWidth || 60,
					timeAxisColumnWidth : j.timeAxisColumnWidth,
					resourceColumnWidth : this.resourceColumnWidth || j.resourceColumnWidth || 100
				})
			}
			var l = this.getSchedulingView();
			l.setDisplayDateFormat(j.displayDateFormat);
			if (!k) {
				l.setColumnWidth(this.resourceColumnWidth || j.resourceColumnWidth || 100, true)
			}
			if (!q) {
				if (k) {
					l.scrollHorizontallyTo(0)
				} else {
					l.scrollVerticallyTo(0)
				}
			}
		}
	},
	getStart : function() {
		return this.getStartDate()
	},
	getStartDate : function() {
		return this.timeAxis.getStart()
	},
	getEnd : function() {
		return this.getEndDate()
	},
	getEndDate : function() {
		return this.timeAxis.getEnd()
	},
	setTimeColumnWidth : function(c, d) {
		this.timeAxisViewModel.setTickWidth(c, d)
	},
	getTimeColumnWidth : function() {
		return this.timeAxisViewModel.getTickWidth()
	},
	getRowHeight : function() {
		return this.timeAxisViewModel.getViewRowHeight()
	},
	shiftNext : function(b) {
		this.suspendLayouts && this.suspendLayouts();
		this.timeAxis.shiftNext(b);
		this.suspendLayouts && this.resumeLayouts(true)
	},
	shiftPrevious : function(b) {
		this.suspendLayouts && this.suspendLayouts();
		this.timeAxis.shiftPrevious(b);
		this.suspendLayouts && this.resumeLayouts(true)
	},
	goToNow : function() {
		this.setTimeSpan(new Date())
	},
	setTimeSpan : function(c, d) {
		if (this.timeAxis) {
			this.timeAxis.setTimeSpan(c, d)
		}
	},
	setStart : function(b) {
		this.setTimeSpan(b)
	},
	setEnd : function(b) {
		this.setTimeSpan(null, b)
	},
	getTimeAxis : function() {
		return this.timeAxis
	},
	scrollToDate : function(h, e) {
		var f = this.getSchedulingView();
		var g = f.getCoordinateFromDate(h, true);
		this.scrollToCoordinate(g, h, e, false)
	},
	scrollToDateCentered : function(j, f) {
		var g = this.getSchedulingView();
		var h = 0;
		if (this.orientation === "horizontal") {
			h = g.getBox().width / 2
		} else {
			h = g.getBox().height / 2
		}
		var i = Math.round(g.getCoordinateFromDate(j, true) - h);
		this.scrollToCoordinate(i, j, f, true)
	},
	scrollToCoordinate : function(j, l, m, n) {
		var h = this.getSchedulingView();
		var k = this;
		if (j < 0) {
			if (this.infiniteScroll) {
				h.shiftToDate(l, n)
			} else {
				var i = (this.timeAxis.getEnd() - this.timeAxis.getStart()) / 2;
				this.setTimeSpan(new Date(l.getTime() - i), new Date(l.getTime() + i));
				if (n) {
					k.scrollToDateCentered(l, m)
				} else {
					k.scrollToDate(l, m)
				}
			}
			return
		}
		if (this.orientation === "horizontal") {
			h.scrollHorizontallyTo(j, m)
		} else {
			h.scrollVerticallyTo(j, m)
		}
		h.fireEvent("scroll", this, j)
	},
	getViewportCenterDate : function() {
		var d = this.getSchedulingView(), e = d.getScroll(), f;
		if (this.getOrientation() === "vertical") {
			f = [ 0, e.top + d.getViewportHeight() / 2 ]
		} else {
			f = [ e.left + d.getViewportWidth() / 2, 0 ]
		}
		return d.getDateFromXY(f, null, true)
	},
	addCls : function() {
		throw "Abstract method call"
	},
	removeCls : function() {
		throw "Abstract method call"
	},
	registerRenderer : function(c, d) {
		this.renderers.push({
			fn : c,
			scope : d
		})
	},
	deregisterRenderer : function(c, d) {
		Ext.each(this.renderers, function(b, a) {
			if (c === b) {
				Ext.Array.removeAt(this.renderers, a);
				return false
			}
		})
	}
});
if (!Ext.ClassManager.get("Sch.mixin.TimelinePanel")) {
	Ext.define("Sch.mixin.TimelinePanel", {
		extend : "Sch.mixin.AbstractTimelinePanel",
		requires : [ "Sch.util.Patch", "Sch.patches.ElementScroll", "Sch.column.timeAxis.Horizontal", "Sch.preset.Manager" ],
		mixins : [ "Sch.mixin.Zoomable", "Sch.mixin.Lockable" ],
		bufferCoef : 5,
		bufferThreshold : 0.2,
		infiniteScroll : false,
		waitingForAutoTimeSpan : false,
		columnLinesFeature : null,
		tipCfg : {
			cls : "sch-tip",
			showDelay : 1000,
			hideDelay : 0,
			autoHide : true,
			anchor : "b"
		},
		inheritables : function() {
			return {
				columnLines : true,
				enableLocking : true,
				lockable : true,
				initComponent : function() {
					if (this.partnerTimelinePanel) {
						this.timeAxisViewModel = this.partnerTimelinePanel.timeAxisViewModel;
						this.timeAxis = this.partnerTimelinePanel.getTimeAxis();
						this.startDate = this.timeAxis.getStart();
						this.endDate = this.timeAxis.getEnd()
					}
					if (this.viewConfig && this.viewConfig.forceFit) {
						this.forceFit = true
					}
					if (Ext.versions.extjs.isGreaterThanOrEqual("4.2.1")) {
						this.cellTopBorderWidth = 0
					}
					this._initializeTimelinePanel();
					this.configureColumns();
					var j = this.normalViewConfig = this.normalViewConfig || {};
					var h = this.getId();
					Ext.apply(this.normalViewConfig, {
						id : h + "-timelineview",
						eventPrefix : this.autoGenId ? null : h,
						timeAxisViewModel : this.timeAxisViewModel,
						eventBorderWidth : this.eventBorderWidth,
						timeAxis : this.timeAxis,
						readOnly : this.readOnly,
						orientation : this.orientation,
						rtl : this.rtl,
						cellBorderWidth : this.cellBorderWidth,
						cellTopBorderWidth : this.cellTopBorderWidth,
						cellBottomBorderWidth : this.cellBottomBorderWidth,
						infiniteScroll : this.infiniteScroll,
						bufferCoef : this.bufferCoef,
						bufferThreshold : this.bufferThreshold
					});
					Ext.Array.forEach([ "eventRendererScope", "eventRenderer", "dndValidatorFn", "resizeValidatorFn", "createValidatorFn",
							"tooltipTpl", "validatorFnScope", "eventResizeHandles", "enableEventDragDrop", "enableDragCreation", "resizeConfig",
							"createConfig", "tipCfg", "getDateConstraints" ], function(a) {
						if (a in this) {
							j[a] = this[a]
						}
					}, this);
					this.mon(this.timeAxis, "reconfigure", this.onMyTimeAxisReconfigure, this);
					this.callParent(arguments);
					this.switchViewPreset(this.viewPreset, this.startDate || this.timeAxis.getStart(), this.endDate || this.timeAxis.getEnd(), true);
					if (!this.startDate) {
						var g = this.getTimeSpanDefiningStore();
						if (Ext.data.TreeStore && g instanceof Ext.data.TreeStore ? g.getRootNode().childNodes.length : g.getCount()) {
							var i = g.getTotalTimeSpan();
							this.setTimeSpan(i.start || new Date(), i.end)
						} else {
							this.bindAutoTimeSpanListeners()
						}
					}
					var f = this.columnLines;
					if (f) {
						this.columnLinesFeature = new Sch.feature.ColumnLines(Ext.isObject(f) ? f : undefined);
						this.columnLinesFeature.init(this);
						this.columnLines = true
					}
					this.relayEvents(this.getSchedulingView(), [ "beforetooltipshow" ]);
					this.on("afterrender", this.__onAfterRender, this);
					this.on("zoomchange", function() {
						this.normalGrid.scrollTask.cancel()
					})
				},
				getState : function() {
					var d = this, c = d.callParent(arguments);
					Ext.apply(c, {
						viewPreset : d.viewPreset,
						startDate : d.getStart(),
						endDate : d.getEnd(),
						zoomMinLevel : d.zoomMinLevel,
						zoomMaxLevel : d.zoomMaxLevel,
						currentZoomLevel : d.currentZoomLevel
					});
					return c
				},
				applyState : function(c) {
					var d = this;
					d.callParent(arguments);
					if (c && c.viewPreset) {
						d.switchViewPreset(c.viewPreset, c.startDate, c.endDate)
					}
					if (c && c.currentZoomLevel) {
						d.zoomToLevel(c.currentZoomLevel)
					}
				},
				setTimeSpan : function() {
					if (this.waitingForAutoTimeSpan) {
						this.unbindAutoTimeSpanListeners()
					}
					this.callParent(arguments);
					if (!this.normalGrid.getView().viewReady) {
						this.getView().refresh()
					}
				}
			}
		},
		bindAutoTimeSpanListeners : function() {
			var b = this.getTimeSpanDefiningStore();
			this.waitingForAutoTimeSpan = true;
			this.normalGrid.getView().on("beforerefresh", this.refreshStopper, this);
			this.lockedGrid.getView().on("beforerefresh", this.refreshStopper, this);
			this.mon(b, "load", this.applyStartEndDatesFromStore, this);
			if (Ext.data.TreeStore && b instanceof Ext.data.TreeStore) {
				this.mon(b, "rootchange", this.applyStartEndDatesFromStore, this);
				this.mon(b.tree, "append", this.applyStartEndDatesAfterTreeAppend, this)
			} else {
				this.mon(b, "add", this.applyStartEndDatesFromStore, this)
			}
		},
		refreshStopper : function(b) {
			return b.store.getCount() === 0
		},
		getTimeSpanDefiningStore : function() {
			throw "Abstract method called"
		},
		unbindAutoTimeSpanListeners : function() {
			this.waitingForAutoTimeSpan = false;
			var b = this.getTimeSpanDefiningStore();
			this.normalGrid.getView().un("beforerefresh", this.refreshStopper, this);
			this.lockedGrid.getView().un("beforerefresh", this.refreshStopper, this);
			b.un("load", this.applyStartEndDatesFromStore, this);
			if (Ext.data.TreeStore && b instanceof Ext.data.TreeStore) {
				b.un("rootchange", this.applyStartEndDatesFromStore, this);
				b.tree.un("append", this.applyStartEndDatesAfterTreeAppend, this)
			} else {
				b.un("add", this.applyStartEndDatesFromStore, this)
			}
		},
		applyStartEndDatesAfterTreeAppend : function() {
			var b = this.getTimeSpanDefiningStore();
			if (!b.isSettingRoot) {
				this.applyStartEndDatesFromStore()
			}
		},
		applyStartEndDatesFromStore : function() {
			var e = this.getTimeSpanDefiningStore();
			var d = e.getTotalTimeSpan();
			var f = this.lockedGridDependsOnSchedule;
			this.lockedGridDependsOnSchedule = true;
			this.setTimeSpan(d.start || new Date(), d.end);
			this.lockedGridDependsOnSchedule = f
		},
		onMyTimeAxisReconfigure : function(b) {
			if (this.stateful && this.rendered) {
				this.saveState()
			}
		},
		onLockedGridItemDblClick : function(f, g, j, h, i) {
			if (this.orientation === "vertical" && g) {
				this.fireEvent("timeheaderdblclick", this, g.get("start"), g.get("end"), h, i)
			}
		},
		getSchedulingView : function() {
			return this.normalGrid.getView()
		},
		getTimeAxisColumn : function() {
			if (!this.timeAxisColumn) {
				this.timeAxisColumn = this.down("timeaxiscolumn")
			}
			return this.timeAxisColumn
		},
		configureColumns : function() {
			var e = this.columns || [];
			if (e.items) {
				e = e.items
			} else {
				e = this.columns = e.slice()
			}
			var f = [];
			var d = [];
			Ext.Array.each(e, function(a) {
				if (a.position === "right") {
					if (!Ext.isNumber(a.width)) {
						Ext.Error.raise('"Right" columns must have a fixed width')
					}
					a.locked = false;
					d.push(a)
				} else {
					a.locked = true;
					f.push(a)
				}
				a.lockable = false
			});
			Ext.Array.erase(e, 0, e.length);
			Ext.Array.insert(e, 0, f.concat({
				xtype : "timeaxiscolumn",
				timeAxisViewModel : this.timeAxisViewModel,
				trackHeaderOver : this.trackHeaderOver,
				renderer : this.mainRenderer,
				scope : this
			}).concat(d));
			this.horizontalColumns = Ext.Array.clone(e);
			this.verticalColumns = [ Ext.apply({
				xtype : "verticaltimeaxis",
				width : 100,
				timeAxis : this.timeAxis,
				timeAxisViewModel : this.timeAxisViewModel,
				cellTopBorderWidth : this.cellTopBorderWidth,
				cellBottomBorderWidth : this.cellBottomBorderWidth
			}, this.timeAxisColumnCfg || {}) ];
			if (this.orientation === "vertical") {
				this.columns = this.verticalColumns;
				this.store = this.timeAxis;
				this.on("beforerender", this.refreshResourceColumns, this)
			}
		},
		mainRenderer : function(w, i, r, p, n) {
			var v = this.renderers, o = this.orientation === "horizontal", u = o ? r : this.resourceStore.getAt(n), x = "&nbsp;";
			i.rowHeight = null;
			for (var t = 0; t < v.length; t++) {
				x += v[t].fn.call(v[t].scope || this, w, i, u, p, n) || ""
			}
			if (this.variableRowHeight) {
				var q = this.getSchedulingView();
				var s = this.timeAxisViewModel.getViewRowHeight();
				i.style = "height:" + ((i.rowHeight || s) - q.cellTopBorderWidth - q.cellBottomBorderWidth) + "px"
			}
			return x
		},
		__onAfterRender : function() {
			var b = this;
			b.normalGrid.on({
				collapse : b.onNormalGridCollapse,
				expand : b.onNormalGridExpand,
				scope : b
			});
			b.lockedGrid.on({
				collapse : b.onLockedGridCollapse,
				itemdblclick : b.onLockedGridItemDblClick,
				scope : b
			});
			if (b.lockedGridDependsOnSchedule) {
				b.normalGrid.getView().on("itemupdate", b.onNormalViewItemUpdate, b)
			}
			if (this.partnerTimelinePanel) {
				if (this.partnerTimelinePanel.rendered) {
					this.setupPartnerTimelinePanel()
				} else {
					this.partnerTimelinePanel.on("afterrender", this.setupPartnerTimelinePanel, this)
				}
			}
		},
		onLockedGridCollapse : function() {
			if (this.normalGrid.collapsed) {
				this.normalGrid.expand()
			}
		},
		onNormalGridCollapse : function() {
			var b = this;
			if (!b.normalGrid.reExpander) {
				b.normalGrid.reExpander = b.normalGrid.placeholder
			}
			if (!b.lockedGrid.rendered) {
				b.lockedGrid.on("render", b.onNormalGridCollapse, b, {
					delay : 1
				})
			} else {
				b.lockedGrid.flex = 1;
				b.lockedGrid.doLayout();
				if (b.lockedGrid.collapsed) {
					b.lockedGrid.expand()
				}
				b.addCls("sch-normalgrid-collapsed")
			}
		},
		onNormalGridExpand : function() {
			this.removeCls("sch-normalgrid-collapsed");
			delete this.lockedGrid.flex;
			this.lockedGrid.doLayout()
		},
		onNormalViewItemUpdate : function(f, e, g) {
			if (this.lockedGridDependsOnSchedule) {
				var h = this.lockedGrid.getView();
				h.suspendEvents();
				h.refreshNode(e);
				h.resumeEvents()
			}
		},
		setupPartnerTimelinePanel : function() {
			var i = this.partnerTimelinePanel;
			var k = i.down("splitter");
			var l = this.down("splitter");
			if (k) {
				k.on("dragend", function() {
					this.lockedGrid.setWidth(i.lockedGrid.getWidth())
				}, this)
			}
			if (l) {
				l.on("dragend", function() {
					i.lockedGrid.setWidth(this.lockedGrid.getWidth())
				}, this)
			}
			var g = i.isVisible() ? i.lockedGrid.getWidth() : i.lockedGrid.width;
			this.lockedGrid.setWidth(g);
			var h = i.getSchedulingView().getEl(), j = this.getSchedulingView().getEl();
			i.mon(j, "scroll", function(a, b) {
				h.scrollTo("left", b.scrollLeft)
			});
			this.mon(h, "scroll", function(a, b) {
				j.scrollTo("left", b.scrollLeft)
			});
			this.on("viewchange", function() {
				i.viewPreset = this.viewPreset
			}, this);
			i.on("viewchange", function() {
				this.viewPreset = i.viewPreset
			}, this)
		}
	}, function() {
		var b = "4.2.1";
		Ext.apply(Sch, {
			VERSION : "2.2.22"
		});
		if (Ext.versions.extjs.isLessThan(b)) {
			alert("The Ext JS version you are using needs to be updated to at least " + b)
		}
	})
}
Ext.define("Sch.mixin.AbstractSchedulerPanel", {
	requires : [ "Sch.model.Event", "Sch.model.Resource", "Sch.data.EventStore", "Sch.data.ResourceStore", "Sch.util.Date" ],
	eventBarIconClsField : "",
	enableEventDragDrop : true,
	resourceColumnClass : "Sch.column.Resource",
	resourceColumnWidth : null,
	allowOverlap : true,
	startParamName : "startDate",
	endParamName : "endDate",
	passStartEndParameters : false,
	variableRowHeight : true,
	eventRenderer : null,
	eventRendererScope : null,
	eventStore : null,
	resourceStore : null,
	onEventCreated : function(b) {
	},
	initStores : function() {
		var b = this.resourceStore || this.store;
		if (!b) {
			Ext.Error.raise("You must specify a resourceStore config")
		}
		if (!this.eventStore) {
			Ext.Error.raise("You must specify an eventStore config")
		}
		this.store = Ext.StoreManager.lookup(b);
		this.resourceStore = this.store;
		this.eventStore = Ext.StoreManager.lookup(this.eventStore);
		if (!this.eventStore.isEventStore) {
			Ext.Error.raise("Your eventStore should be a subclass of Sch.data.EventStore (or consume the EventStore mixin)")
		}
		this.resourceStore.eventStore = this.eventStore;
		if (this.passStartEndParameters) {
			this.eventStore.on("beforeload", this.applyStartEndParameters, this)
		}
	},
	_initializeSchedulerPanel : function() {
		this.initStores();
		if (this.eventBodyTemplate && Ext.isString(this.eventBodyTemplate)) {
			this.eventBodyTemplate = new Ext.XTemplate(this.eventBodyTemplate)
		}
	},
	getResourceStore : function() {
		return this.resourceStore
	},
	getEventStore : function() {
		return this.eventStore
	},
	applyStartEndParameters : function(f, e) {
		var d = f.getProxy();
		d.setExtraParam(this.startParamName, this.getStart());
		d.setExtraParam(this.endParamName, this.getEnd())
	},
	createResourceColumns : function(d) {
		var e = [];
		var f = this;
		this.resourceStore.each(function(a) {
			e.push(Ext.create(f.resourceColumnClass, {
				renderer : f.mainRenderer,
				scope : f,
				width : d || 100,
				text : a.getName(),
				model : a
			}))
		});
		return e
	}
});
Ext.define("Sch.mixin.SchedulerPanel", {
	extend : "Sch.mixin.AbstractSchedulerPanel",
	requires : [ "Sch.view.SchedulerGridView", "Sch.selection.EventModel", "Sch.plugin.ResourceZones", "Sch.column.timeAxis.Vertical" ],
	eventSelModelType : "eventmodel",
	eventSelModel : null,
	enableEventDragDrop : true,
	enableDragCreation : true,
	dragConfig : null,
	resourceZones : null,
	resourceZonesConfig : null,
	componentCls : "sch-schedulerpanel",
	lockedGridDependsOnSchedule : true,
	verticalListeners : null,
	inheritables : function() {
		return {
			initComponent : function() {
				var e = this.normalViewConfig = this.normalViewConfig || {};
				this._initializeSchedulerPanel();
				this.verticalListeners = {
					clear : this.refreshResourceColumns,
					datachanged : this.refreshResourceColumns,
					update : this.refreshResourceColumns,
					load : this.refreshResourceColumns,
					scope : this
				};
				Ext.apply(e, {
					eventStore : this.eventStore,
					resourceStore : this.resourceStore,
					eventBarTextField : this.eventBarTextField || this.eventStore.model.prototype.nameField
				});
				Ext.Array.forEach([ "barMargin", "eventBodyTemplate", "eventTpl", "allowOverlap", "dragConfig", "eventBarIconClsField",
						"onEventCreated", "constrainDragToResource", "snapRelativeToEventStartDate" ], function(a) {
					if (a in this) {
						e[a] = this[a]
					}
				}, this);
				if (this.orientation === "vertical") {
					this.mon(this.resourceStore, this.verticalListeners)
				}
				this.callParent(arguments);
				var g = this.lockedGrid.getView();
				var h = this.getSchedulingView();
				this.registerRenderer(h.columnRenderer, h);
				if (this.resourceZones) {
					var f = Ext.StoreManager.lookup(this.resourceZones);
					f.setResourceStore(this.resourceStore);
					this.resourceZonesPlug = new Sch.plugin.ResourceZones(Ext.apply({
						store : f
					}, this.resourceZonesConfig));
					this.resourceZonesPlug.init(this)
				}
				h.on("columnwidthchange", this.onColWidthChange, this);
				this.relayEvents(this.getSchedulingView(), [ "eventclick", "eventmousedown", "eventmouseup", "eventdblclick", "eventcontextmenu",
						"eventmouseenter", "eventmouseleave", "beforeeventresize", "eventresizestart", "eventpartialresize",
						"beforeeventresizefinalize", "eventresizeend", "beforeeventdrag", "eventdragstart", "eventdrag", "beforeeventdropfinalize",
						"eventdrop", "aftereventdrop", "beforedragcreate", "dragcreatestart", "beforedragcreatefinalize", "dragcreateend",
						"afterdragcreate", "beforeeventadd", "scheduleclick", "scheduledblclick", "schedulecontextmenu" ]);
				if (!this.syncRowHeight) {
					this.enableRowHeightInjection(g, h)
				}
			},
			afterRender : function() {
				this.callParent(arguments);
				this.getSchedulingView().on({
					itemmousedown : this.onScheduleRowMouseDown,
					eventmousedown : this.onScheduleEventBarMouseDown,
					eventdragstart : this.doSuspendLayouts,
					aftereventdrop : this.doResumeLayouts,
					eventresizestart : this.doSuspendLayouts,
					eventresizeend : this.doResumeLayouts,
					scope : this
				})
			},
			getTimeSpanDefiningStore : function() {
				return this.eventStore
			}
		}
	},
	doSuspendLayouts : function() {
		var b = this.getSchedulingView();
		b.infiniteScroll && b.timeAxis.on({
			beginreconfigure : this.onBeginReconfigure,
			endreconfigure : this.onEndReconfigure,
			scope : this
		});
		this.lockedGrid.suspendLayouts();
		this.normalGrid.suspendLayouts()
	},
	doResumeLayouts : function() {
		var b = this.getSchedulingView();
		b.infiniteScroll && b.timeAxis.un({
			beginreconfigure : this.onBeginReconfigure,
			endreconfigure : this.onEndReconfigure,
			scope : this
		});
		this.lockedGrid.resumeLayouts();
		this.normalGrid.resumeLayouts()
	},
	onBeginReconfigure : function() {
		this.normalGrid.resumeLayouts()
	},
	onEndReconfigure : function() {
		this.normalGrid.suspendLayouts()
	},
	onColWidthChange : function(c, d) {
		if (this.getOrientation() === "vertical") {
			this.resourceColumnWidth = d;
			this.refreshResourceColumns()
		}
	},
	enableRowHeightInjection : function(e, f) {
		var d = new Ext.XTemplate("{%", "this.processCellValues(values);", "this.nextTpl.applyOut(values, out, parent);", "%}", {
			priority : 1,
			processCellValues : function(c) {
				if (f.orientation === "horizontal") {
					var b = f.eventLayout.horizontal;
					var a = c.record;
					var h = b.getRowHeight(a) - f.cellTopBorderWidth - f.cellBottomBorderWidth;
					c.style = (c.style || "") + ";height:" + h + "px;"
				}
			}
		});
		e.addCellTpl(d);
		e.store.un("refresh", e.onDataRefresh, e);
		e.store.on("refresh", e.onDataRefresh, e)
	},
	getEventSelectionModel : function() {
		if (this.eventSelModel && this.eventSelModel.events) {
			return this.eventSelModel
		}
		if (!this.eventSelModel) {
			this.eventSelModel = {}
		}
		var d = this.eventSelModel;
		var c = "SINGLE";
		if (this.simpleSelect) {
			c = "SIMPLE"
		} else {
			if (this.multiSelect) {
				c = "MULTI"
			}
		}
		Ext.applyIf(d, {
			allowDeselect : this.allowDeselect,
			mode : c
		});
		if (!d.events) {
			d = this.eventSelModel = Ext.create("selection." + this.eventSelModelType, d)
		}
		if (!d.hasRelaySetup) {
			this.relayEvents(d, [ "selectionchange", "deselect", "select" ]);
			d.hasRelaySetup = true
		}
		if (this.disableSelection) {
			d.locked = true
		}
		return d
	},
	refreshResourceColumns : function() {
		var b = this.resourceColumnWidth || this.timeAxisViewModel.resourceColumnWidth;
		this.normalGrid.reconfigure(null, this.createResourceColumns(b))
	},
	setOrientation : function(p, q) {
		if (p === this.orientation && !q) {
			return
		}
		this.removeCls("sch-" + this.orientation);
		this.addCls("sch-" + p);
		this.orientation = p;
		var k = this, n = function() {
			return false
		}, l = k.normalGrid, j = k.lockedGrid.getView(), m = k.getSchedulingView(), o = l.headerCt;
		var r = j.deferInitialRefresh;
		m.deferInitialRefresh = j.deferInitialRefresh = false;
		j.on("beforerefresh", n);
		m.on("beforerefresh", n);
		m.setOrientation(p);
		Ext.suspendLayouts();
		o.removeAll(true);
		Ext.resumeLayouts();
		if (p === "horizontal") {
			k.mun(k.resourceStore, k.verticalListeners);
			m.setRowHeight(k.rowHeight || k.timeAxisViewModel.rowHeight, true);
			k.reconfigure(k.resourceStore, k.horizontalColumns)
		} else {
			k.mon(k.resourceStore, k.verticalListeners);
			k.reconfigure(k.timeAxis, k.verticalColumns.concat(k.createResourceColumns(k.resourceColumnWidth
					|| k.timeAxisViewModel.resourceColumnWidth)));
			m.setColumnWidth(k.timeAxisViewModel.resourceColumnWidth || 100, true)
		}
		m.deferInitialRefresh = j.deferInitialRefresh = r;
		j.un("beforerefresh", n);
		m.un("beforerefresh", n);
		k.getView().refresh();
		this.fireEvent("orientationchange", this, p)
	},
	onScheduleRowMouseDown : function(e, f) {
		var d = this.lockedGrid.getSelectionModel();
		if (this.getOrientation() === "horizontal" && Ext.selection.RowModel && d instanceof Ext.selection.RowModel) {
			d.select(f)
		}
	},
	onScheduleEventBarMouseDown : function(g, i, h) {
		var j = this.normalGrid.view;
		var e = j.getRecord(j.findRowByChild(h.getTarget()));
		this.onScheduleRowMouseDown(g, e)
	}
});
Ext.define("Sch.mixin.FilterableTreeView", {
	prevBlockRefresh : null,
	initTreeFiltering : function() {
		var b = function() {
			var a = this.store.treeStore;
			this.mon(a, "nodestore-datachange-start", this.onFilterChangeStart, this);
			this.mon(a, "nodestore-datachange-end", this.onFilterChangeEnd, this);
			if (!a.allowExpandCollapseWhileFiltered) {
				this.mon(a, "filter-clear", this.onFilterCleared, this);
				this.mon(a, "filter-set", this.onFilterSet, this)
			}
		};
		if (this.rendered) {
			b.call(this)
		} else {
			this.on("beforerender", b, this, {
				single : true
			})
		}
	},
	onFilterChangeStart : function() {
		this.prevBlockRefresh = this.blockRefresh;
		this.blockRefresh = true;
		Ext.suspendLayouts()
	},
	onFilterChangeEnd : function() {
		Ext.resumeLayouts(true);
		this.blockRefresh = this.prevBlockRefresh
	},
	onFilterCleared : function() {
		delete this.toggle;
		var b = this.getEl();
		if (b) {
			b.removeCls("sch-tree-filtered")
		}
	},
	onFilterSet : function() {
		this.toggle = function() {
		};
		var b = this.getEl();
		if (b) {
			b.addCls("sch-tree-filtered")
		}
	}
});
Ext.define("Sch.panel.TimelineGridPanel", {
	extend : "Ext.grid.Panel",
	mixins : [ "Sch.mixin.TimelinePanel" ],
	subGridXType : "gridpanel",
	requires : [ "Sch.patches.ColumnResize" ],
	initComponent : function() {
		this.callParent(arguments);
		this.getSchedulingView()._initializeTimelineView()
	}
}, function() {
	this.override(Sch.mixin.TimelinePanel.prototype.inheritables() || {})
});
if (!Ext.ClassManager.get("Sch.panel.TimelineTreePanel")) {
	Ext.define("Sch.panel.TimelineTreePanel", {
		extend : "Ext.tree.Panel",
		requires : [ "Ext.grid.Panel", "Ext.data.TreeStore", "Sch.mixin.FilterableTreeView", "Sch.patches.ColumnResizeTree" ],
		mixins : [ "Sch.mixin.TimelinePanel" ],
		useArrows : true,
		rootVisible : false,
		lockedXType : "treepanel",
		initComponent : function() {
			this.callParent(arguments);
			this.getSchedulingView()._initializeTimelineView()
		}
	}, function() {
		this.override(Sch.mixin.TimelinePanel.prototype.inheritables() || {})
	})
}
Ext.define("Sch.panel.SchedulerGrid", {
	extend : "Sch.panel.TimelineGridPanel",
	mixins : [ "Sch.mixin.SchedulerPanel" ],
	alias : [ "widget.schedulergrid", "widget.schedulerpanel" ],
	alternateClassName : "Sch.SchedulerPanel",
	viewType : "schedulergridview",
	initComponent : function() {
		this.callParent(arguments);
		this.getSchedulingView()._initializeSchedulerView()
	}
}, function() {
	this.override(Sch.mixin.SchedulerPanel.prototype.inheritables() || {})
});
Ext.define("Sch.panel.SchedulerTree", {
	extend : "Sch.panel.TimelineTreePanel",
	mixins : [ "Sch.mixin.SchedulerPanel" ],
	alias : [ "widget.schedulertree" ],
	viewType : "schedulergridview",
	setOrientation : function(b) {
		if (b == "vertical") {
			Ext.Error.raise("Sch.panel.SchedulerTree does not support vertical orientation")
		}
	},
	initComponent : function() {
		this.callParent(arguments);
		this.getSchedulingView()._initializeSchedulerView()
	}
}, function() {
	this.override(Sch.mixin.SchedulerPanel.prototype.inheritables() || {})
});
Ext.data.Connection.override({
	parseStatus : function(c) {
		var d = this.callOverridden(arguments);
		if (c === 0) {
			d.success = true
		}
		return d
	}
});