sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"sapui5/holiday/App/Holiday/model/models"
], function (UIComponent, JSONModel, Device, models) {
	"use strict";

	return UIComponent.extend("sapui5.holiday.App.Holiday.Component", {

		metadata: {
			manifest: "json",
			"rootView": "sapui5.holiday.App.Holiday.view.App",
			"config": {
				"serviceUrl": "../xsjs/Holiday_JSON.xsjs"
			}
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */

		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			this.getRouter().initialize();

			var oModel = new JSONModel(
				this.getMetadata().getConfig().serviceUrl);
			this.setModel(oModel);

			// important to set the model on the component
			// and not on the sapui5 core!!!!
			this.setModel(oModel);

//			set the device model
//			this.setModel(models.createDeviceModel(), this.getMetadata().getConfig().serviceUrl);
		}

		// 		createContent: function () {

		// 			// call the base component's createContent function
		// 			var oRootView = UIComponent.prototype.createContent.apply(
		// 				this, arguments);

		// 			var oModel = new JSONModel(
		// 				this.getMetadata().getConfig().serviceUrl);
		// 			this.setModel(oModel);

		// 			// // important to set the model on the component
		// 			// // and not on the sapui5 core!!!!
		// 			this.setModel(oModel);

		// //			oApp = oRootView.byId("app");
		// 			oApp = oRootView.byId("myApp");
		// 			return oRootView;
		//		}
	});
});