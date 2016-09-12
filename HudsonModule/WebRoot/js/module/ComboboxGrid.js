Ext.define('Module.ComboboxGrid', {
	extend : 'Ext.form.ComboBox',
	requires : [ 'Ext.grid.Panel' ],
	alias : [ 'widget.PVE.form.ComboGrid' ],
	itemClick : false,
	itemChange : false,
	createPicker : function() {
		var me = this, picker, menuCls = Ext.baseCSSPrefix + 'menu', opts = Ext.apply({
			selModel : {
				mode : me.multiSelect ? 'SIMPLE' : 'SINGLE'
			},
			floating : true,
			hidden : true,
			ownerCt : me.ownerCt,
			cls : me.el.up('.' + menuCls) ? menuCls : '',
			store : me.store,
			displayField : me.displayField,
			focusOnToFront : false,
			pageSize : me.pageSize
		}, me.listConfig, me.defaultListConfig);

		picker = me.picker = Ext.create('Ext.grid.Panel', opts);
		picker.getNode = function() {
			picker.getView().getNode(arguments);
		};

		// me.mon(picker, {
		// itemclick : me.onItemClick,
		// refresh : me.onListRefresh,
		// scope : me
		// });

		picker.setItemChange = function(flag) {
			me.itemChange = flag;
		};

		picker.setItemClick = function(flag) {
			me.itemClick = flag;
		};

		me.mon(picker, {
			itemclick : function(picker, record) {
				if (me.itemClick) {
					me.setValue(Ext.emptyString);
					me.itemClick = false;
				}

				me.onItemClick(picker, record);
			},
			refresh : me.onListRefresh,
			scope : me
		});

		me.mon(picker.getSelectionModel(), {
			selectionChange : function(list, sel) {

				me.onListSelectionChange(list, me.itemChange ? [] : sel);

				if (me.itemChange) {
					me.setValue(Ext.emptyString);
					me.itemChange = false;
				}
			},
			scope : me
		});

		return picker;
	}
});