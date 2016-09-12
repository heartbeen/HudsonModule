/*
 * File: app/view/Module/ScrapModuleCode.js
 *
 * This file was generated by Sencha Architect version 2.2.2.
 * http://www.sencha.com/products/architect/
 *
 * This file requires use of the Ext JS 4.2.x library, under independent license.
 * License of Sencha Architect does not include license for Ext JS 4.2.x. For more
 * details see http://www.sencha.com/license or contact license@sencha.com.
 *
 * This file will be auto-generated each and everytime you save your project.
 *
 * Do NOT hand edit this file.
 */

Ext.define('Module.ScrapModuleCode', {
	extend : 'Ext.panel.Panel',

	height : 378,
	width : 667,
	layout : {
		type : 'border'
	},
	title : '模具报废',

	initComponent : function() {
		var me = this;

		Ext.applyIf(me, {
			items : [ {
				xtype : 'panel',
				region : 'center',
				title : '状态设定',
				items : [ {
					xtype : 'radiogroup',
					width : 146,
					fieldLabel : '报废模具',
					hideLabel : true,
					items : [ {
						xtype : 'radiofield',
						boxLabel : '报废'
					}, {
						xtype : 'radiofield',
						boxLabel : '恢复'
					} ]
				} ]
			}, {
				xtype : 'treepanel',
				region : 'west',
				width : 189,
				title : '模具清单',
				viewConfig : {

				},
				dockedItems : [ {
					xtype : 'toolbar',
					dock : 'top',
					items : [ {
						xtype : 'textfield',
						width : 171,
						fieldLabel : 'Label',
						hideLabel : true,
						emptyText : '请输入匹配模具工号'
					} ]
				} ]
			} ]
		});

		me.callParent(arguments);
	}

});