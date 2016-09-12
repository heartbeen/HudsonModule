/**
 * 过滤
 */
Ext.define("Project.component.FilterTextField", {
	extend : "Ext.form.TextField",
	enableKeyEvents : true,
	margin : 0,
	border : 0,
	fieldStyle : 'border-left:0;border-right:0;border-bottom:0;background:#fff url(images/search.png) no-repeat 5px center;padding-left:25px;',

	// The task store instance
	store : null,
	filterField : null,// 要过滤的字段

	listeners : {
		keyup : {
			fn : function(field, e) {
				var me = this;
				var value = field.getValue();
				var regexp = new RegExp(Ext.String.escapeRegex(value), 'i');

				if (value) {

					if (e.getKey() == e.BACKSPACE || e.getKey() == e.DELETE) {
						this.store.clearFilter();
					}

					this.store.filter(function(task) {
						return regexp.test(task.get(me.filterField));
					});
				} else {
					this.store.clearFilter();
				}
			},
			buffer : 200
		},
		specialkey : {
			fn : function(field, e) {
				if (e.getKey() === e.ESC) {
					field.reset();

					this.store.clearFilter();
				}
			}
		}
	}
});
