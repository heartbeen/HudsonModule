/**
 * English translations for the Scheduler component
 * 
 * NOTE: To change locale for month/day names you have to use the Ext JS
 * language pack.
 */

Localize = function() {
	if (Sch.plugin) {
		if (Sch.plugin.SummaryColumn) {
			Ext.override(Sch.plugin.SummaryColumn, {
				dayText : 'd',
				hourText : 'h',
				minuteText : 'min'
			});
		}

		if (Sch.plugin.CurrentTimeLine) {
			Sch.plugin.CurrentTimeLine.prototype.tooltipText = 'Now';
		}
	}

	var M = Sch.preset.Manager, vp = M.getPreset("hourAndDay");

	if (vp) {
		vp.displayDateFormat = 'g:i A';
		vp.headerConfig.middle.dateFormat = 'g A';
		vp.headerConfig.top.dateFormat = 'Y/m/d';
	}

	vp = M.getPreset("dayAndWeek");
	if (vp) {
		vp.displayDateFormat = 'm/d h:i A';
		vp.headerConfig.middle.dateFormat = 'Y/m/d';
		vp.headerConfig.top.renderer = function(start, end, cfg) {
			var w = start.getWeekOfYear();
			return 'w.' + ((w < 10) ? '0' : '') + w + ' ' + Sch.util.Date.getShortMonthName(start.getMonth()) + ' ' + start.getFullYear();
		};
	}

	vp = M.getPreset("weekAndDay");
	if (vp) {
		vp.displayDateFormat = 'm/d';
		vp.headerConfig.bottom.dateFormat = 'm/d';
		vp.headerConfig.middle.dateFormat = 'Y/m/d';
	}

	vp = M.getPreset("weekAndDayLetter");
	if (vp) {
		vp.displayDateFormat = 'm/d';
		vp.headerConfig.bottom.dateFormat = 'M/d';
		vp.headerConfig.middle.dateFormat = 'Y/m/d';
	}

	vp = M.getPreset("weekAndMonth");
	if (vp) {
		vp.displayDateFormat = 'Y/m/d';
		vp.headerConfig.middle.dateFormat = 'm/d';
		vp.headerConfig.top.dateFormat = 'Y/m/d';
	}

	vp = M.getPreset("monthAndYear");
	if (vp) {
		vp.displayDateFormat = 'Y/m/d';
		vp.headerConfig.middle.dateFormat = 'Y/m';
		vp.headerConfig.top.dateFormat = 'Y';
	}

	vp = M.getPreset("year");
	if (vp.year) {
		vp.displayDateFormat = 'Y/m/d';
		vp.headerConfig.bottom.renderer = function(start, end, cfg) {
			return Ext.String.format('{0}S', Math.floor(start.getMonth() / 3) + 1);
		};
		vp.headerConfig.middle.dateFormat = 'Y';
	}

	var cd = Sch.util.Date;
};

Localize();