/*eslint no-console: 0, no-unused-vars: 0, no-use-before-define: 0, no-redeclare: 0, no-undef: 0*/
//To use a javascript controller its name must end with .controller.js
sap.ui.define([
	"opensap/odataBasic/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("opensap.odataBasic.controller.App", {

		logout: function () {
			window.location.href = "/my/logout";
		},

		onInit: function () {
			this.getView().addStyleClass("sapUiSizeCompact"); // make everything inside this View appear in Compact mode
			var oConfig = this.getOwnerComponent().getModel("config");
			var userName = oConfig.getProperty("/UserName");
			var HolidayModel = this.getOwnerComponent().getModel("HolidayModel");
			var oTable = this.getView().byId("HolidayTable");

			//To-Do Bind Model to table
			oTable.setModel(HolidayModel);
			oTable.setEntitySet("Holidays");
			oTable.setInitiallyVisibleFields("DATE,PROVINCE,HOLIDAY_ID");
		},

		onErrorCall: function (oError) {
			if (oError.statusCode === 500 || oError.statusCode === 400 || oError.statusCode === "500" || oError.statusCode === "400") {
				var errorRes = JSON.parse(oError.responseText);
				if (!errorRes.error.innererror) {
					sap.m.MessageBox.alert(errorRes.error.message.value);
				} else {
					if (!errorRes.error.innererror.message) {
						sap.m.MessageBox.alert(errorRes.error.innererror.toString());
					} else {
						sap.m.MessageBox.alert(errorRes.error.innererror.message);
					}
				}
				return;
			} else {
				sap.m.MessageBox.alert(oError.response.statusText);
				return;
			}

		}
	});
});