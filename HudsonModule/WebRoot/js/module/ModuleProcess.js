Ext.define('Module.ModuleProcess', {
	extend : 'Ext.panel.Panel',
	requires : [ 'Module.ModuleProcessGantt' ],

	layout : {
		type : 'border'
	},

	initComponent : function() {
		var me = this;

		Ext.define('MyTaskModel', {
			extend : 'Gnt.model.Task',

			// A field in the dataset that will be added as a CSS class to each
			// rendered task element
			clsField : 'TaskType',
			fields : [ {
				name : 'TaskType',
				type : 'string'
			}, {
				name : 'Color',
				type : 'string'
			} ]
		});

		var taskStore = Ext.create("Gnt.data.TaskStore", {
			model : 'MyTaskModel',
			proxy : {
				type : 'ajax',
				method : 'GET',
				url : 'js/module/plan/tasks.js',
				reader : {
					type : 'json'
				}
			},
			rootVisible : false,
			root : {
				Id : '',
				Name : 'Create awesome product',
				expanded : true
			}
		});

		var dependencyStore = Ext.create("Gnt.data.DependencyStore", {
			autoLoad : true,
			proxy : {
				type : 'ajax',
				url : 'js/module/plan/dependencies.js',
				method : 'GET',
				reader : {
					type : 'json'
				}
			}
		});

		var resourceStore = Ext.create('Gnt.data.ResourceStore', {
			model : 'Gnt.model.Resource'
		});

		var assignmentStore = Ext.create('Gnt.data.AssignmentStore', {
			autoLoad : true,
			// Must pass a reference to resource store
			resourceStore : resourceStore,
			proxy : {
				type : 'ajax',
				url : 'js/module/plan/assignmentdata.js',
				method : 'GET',
				reader : {
					type : 'json',
					root : 'assignments'
				}
			},
			listeners : {
				load : function() {
					resourceStore.loadData(this.proxy.reader.jsonData.resources);
				}
			}
		});

		Ext.applyIf(me, {
			items : [ {
				xtype : 'panel',
				region : 'west',
				split : true,
				width : 200,
				layout : {
					type : 'border'
				},
				collapsed : false,
				collapsible : true,
				title : '模具工号',
				items : [ {
					xtype : 'treepanel',
					flex : 1.3,
					region : 'center',
					title : '',
					viewConfig : {

					}
				}, {
					xtype : 'propertygrid',
					flex : 1,
					region : 'south',
					height : 150,
					margin : '5 0 0 0',
					title : '基本信息',
					source : {
						'Property 1' : 'String',
						'Property 2' : true,
						'Property 3' : '2013-10-09T09:03:57',
						'Property 4' : 123
					}
				} ]
			}, Ext.create("Module.ModuleProcessGantt", {
				region : 'center',
				rowHeight : 22,
				taskStore : taskStore,
				dependencyStore : dependencyStore,
				assignmentStore : assignmentStore,
				resourceStore : resourceStore,
				columnLines : true,
				rowLines : true,

				startDate : new Date(2010, 0, 11),// 模具开始时间
				endDate : Sch.util.Date.add(new Date(2010, 0, 4), Sch.util.Date.WEEK, 20),// 模具T0时间

				viewPreset : 'weekAndDayLetter'
			}) ]
		});

		me.callParent(arguments);
	}

});