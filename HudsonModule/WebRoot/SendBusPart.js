/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('Manage.Design.SendBusPart', {
    extend: 'Ext.ux.desktop.Module',

    requires: [
        'Ext.panel.Panel'
    ],

    id:'sendBus-win',

    init : function(){
        this.launcher = {
            text: 'SendBus Window',
            iconCls:'sendBus'
        };
    },

    createWindow : function(){
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow('sendBus-win');
        if(!win){
            win = desktop.createWindow({
                id: 'sendBus-win',
                title:'SendBus Window',
                width:681,
                height:289,
                iconCls: 'sendBus',
                animCollapse:false,
                border:false,
                constrainHeader:true,

                layout: 'border',
                items: [
                    {
                        xtype: 'tabpanel',
                        activeTab:0,
                        bodyStyle: 'padding: 5px;',

                        items: [
                                {
                                    xtype: 'textfield',
                                    region: 'north',
                                    height: 22,
                                    margin: '0 0 5 0',
                                    fieldLabel: '申请事由',
                                    labelWidth: 60
                                },
                                {
                                    xtype: 'gridpanel',
                                    region: 'center',
                                    title: '派车行程',
                                    columns: [
                                        {
                                            xtype: 'gridcolumn',
                                            dataIndex: 'string',
                                            text: '地点'
                                        },
                                        {
                                            xtype: 'datecolumn',
                                            dataIndex: 'date',
                                            text: '起讫日期'
                                        },
                                        {
                                            xtype: 'gridcolumn',
                                            text: '里程数'
                                        },
                                        {
                                            xtype: 'gridcolumn',
                                            text: '随车人员'
                                        }
                                    ]
                                }
                            ]
                    }
                ]
            });
        }
        return win;
    }
});
