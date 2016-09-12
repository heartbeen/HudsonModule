/**
 * @class Ext.app.PortalColumn
 * @extends Ext.container.Container A layout column class used internally be
 *          {@link Ext.app.PortalPanel}.
 */
Ext.define('Portlet.PortalColumn', {
	extend : 'Ext.container.Container',
	alias : 'widget.portalcolumn',

	requires : [ 'Ext.layout.container.Anchor', 'Portlet.Portlet' ],

	layout : 'anchor',
	defaultType : 'portlet',
	cls : 'x-portal-column'
});