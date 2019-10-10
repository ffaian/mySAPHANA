/*eslint no-console: 0, no-unused-vars: 0, no-use-before-define: 0, no-redeclare: 0, no-undef: 0*/
//To use a javascript controller its name must end with .controller.js
sap.ui.define([
	"opensap/odataBasic/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sapui5/libraryApp/commons/formatter"
], function (BaseController, JSONModel, formatter) {
	"use strict";

	return BaseController.extend("opensap.odataBasic.controller.App", {

		formatter: formatter,

		logout: function () {
			window.location.href = "/my/logout";
		},

		onInit: function () {
			this.getView().addStyleClass("sapUiSizeCompact"); //make everything inside this View appear in Compact mode
			var oConfig =
				this.getOwnerComponent().getModel("config");
			var userName = oConfig.getProperty("/UserName");
			var oHolidayModel =
				this.getOwnerComponent().getModel("HolidayModel");
			var oTable = this.getView().byId("holidayTable");
			oTable.setModel(oHolidayModel);

			// Holiday Master Data
			// var oModel_Holidays = this.getOwnerComponent().getModel("HolidayMDModel");

			var oModelJson = new JSONModel();
			// Read Entity Set from oData Model
			oHolidayModel.read("/Holidays_MD", {
				// oModel_Holidays.read("/HolidaysMD", {
				async: true,
				success: function (oData, response) {
					// Set Json Model of results from the Entity Set 
					oModelJson.setData(oData);
				}
			});

			this.oHolidayCombo = new sap.m.ComboBox("myHolidayCombo");
			this.oHolidayCombo.setModel(oModelJson); // lookup_tables
			this.oHolidayCombo.bindAggregation("items", {
				// "results" is always the entity set from JSON Model of the oData service Read function
				path: "/results",
				template: new sap.ui.core.ListItem({
					key: "{HOLIDAY_ID}",
					text: "{HOLIDAY_TXT}"
				})
			});
			this.oHolidayCombo.attachChange(this.onCheckComboBox, this);

			// Province Master Data
			var oModelProvince = new JSONModel();
			// Read Entity Set from oData Model
			oHolidayModel.read("/Province_MD", {
				async: true,
				success: function (oData, response) {
					// Set Json Model of results from the Entity Set 
					oModelProvince.setData(oData);
				}
			});
			
			// var oModel_Provinces = this.getOwnerComponent().getModel("ProvinceMDModel");
			// oModel_Provinces.attachRequestCompleted(function () {
				// console.log(oModel_Provinces.getData());
			// });

			// Province ComboBox
			this.oProvincescombo = new sap.m.ComboBox("myProvinceCombo", {});
			this.oProvincescombo.setModel(oModelProvince); // lookup_tables
			// this.oProvincescombo.setModel(oModel_Provinces); // lookup_tables
			this.oProvincescombo.bindAggregation("items", {
				path: "/results",
				// path: "/Province",
				template: new sap.ui.core.ListItem({
					key: "{REGION}",
					text: "{TXTSH}"
				})
			});
			this.oProvincescombo.attachChange(this.onCheckComboBox, this);

		},

		onSort: function () {
			// var oSmartTable = this._getSmartTable();
			var oSmartTable = this.oTable = sap.ui.getCore().byId(this.getView().sId + "--holidayTable");
			if (oSmartTable) {
				oSmartTable.openPersonalisationDialog("Sort");
			}
		},

		onLiveSearch: function (oEvent) {
			//			if (oEvent.getParameters().refreshButtonPressed) {} else {
			var tpmla = oEvent.getParameter("newValue");
			this.oFilterLive = new Array();
			//	this.oFilterLive = [];
			// var sSearchID = sap.ui.getCore().byId("mySearchCombo").getSelectedKey();
			var sSearchID = sap.ui.getCore().byId(this.getView().sId + "--mySearchCombo").getSelectedKey();
			switch (sSearchID) {
			case "1":
				var oDateFormat = sap.ui.core.format.DateFormat.getInstance({
					pattern: "MMM-dd-YYYY"
				});
				oDateFormat.format(new Date(tpmla));
				this.oFilterLive = new sap.ui.model.Filter("DATE",
					sap.ui.model.FilterOperator.EQ, oDateFormat);
				break;
			case "2":
				this.oFilterLive = new sap.ui.model.Filter("PROVINCE",
					sap.ui.model.FilterOperator.Contains, tpmla);
				break;
			case "3":
				this.oFilterLive = new sap.ui.model.Filter("HOLIDAY_ID",
					sap.ui.model.FilterOperator.Contains, tpmla);
				break;

			}
			//this.oFilterLive.push(oFilter);
			this._applyFilter(this.oFilterLive);

			// get list created in view
			// this.oTable = sap.ui.getCore().byId("mytable");
			// this.oTable = sap.ui.getCore().byId(this.getView().sId + "--holidayTable");
			// this.oTable.getBinding("items").filter(filters);
			//			}
		},

		_applyFilter: function (oFilterLive) {
			var oTable = sap.ui.getCore().byId(this.getView().sId + "--holidayTable");
			oTable.rebindTable(); // Call rebindtable function here
		},

		onBeforeRebindTable: function (oEvent) { //Add this function to your controller
			this.mBindingParams = oEvent.getParameter("bindingParams");
			if (typeof (this.oFilterLive) !== 'undefined') {
				this.mBindingParams.filters = this.oFilterLive;
			}
		},

		callUserService: function () {
			var oModel =
				this.getOwnerComponent().getModel("userModel");
			var result = this.getView().getModel().getData();
			var oEntry = {};
			oEntry.UserId = "0000000000";
			oEntry.FirstName = result.FirstName;
			oEntry.LastName = result.LastName;
			oEntry.Email = result.Email;
			oModel.setHeaders({
				"content-type": "application/json;charset=utf-8"
			});
			var mParams = {};
			mParams.success = function () {
				sap.m.MessageToast.show("Create successful");
			};
			mParams.error = this.onErrorCall;
			oModel.create("/Users", oEntry, mParams);
		},

		callUserUpdate: function () {
			var oModel =
				this.getOwnerComponent().getModel("userModel");
			oModel.setHeaders({
				"content-type": "application/json;charset=utf-8"
			});
			var mParams = {};
			mParams.error = function () {
				sap.m.MessageToast.show("Update failed");
			};
			mParams.success = function () {
				sap.m.MessageToast.show("Update successful");
			};
			oModel.submitChanges(mParams);
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
		},

		onBatchDialogPress: function () {
			var view = this.getView();
			view._bDialog = sap.ui.xmlfragment(
				"opensap.odataBasic.view.batchDialog", this // associate controller with the fragment
			);
			view._bDialog.addStyleClass("sapUiSizeCompact");
			view.addDependent(this._bDialog);
			view._bDialog.addContent(view.getController().getItem(true));
			view._bDialog.open();
		},

		onDialogCloseButton: function () {
			this.getView()._bDialog.close();
		},

		getItem: function (isFirstRow) {
			var view = this.getView();
			var addIcon = new sap.ui.core.Icon({
				src: "sap-icon://add",
				color: "#006400",
				size: "1.5rem",
				press: function () {
					view._bDialog.addContent(view.getController().getItem(false));
				}
			});

			var deleteIcon = new sap.ui.core.Icon({
				src: "sap-icon://delete",
				color: "#49311c",
				size: "1.5rem",
				press: function (oEvent) {
					view._bDialog.removeContent(oEvent.oSource.oParent.sId);
				}
			});

			var icon;
			if (isFirstRow) {
				icon = addIcon;
			} else {
				icon = deleteIcon;
			}
			icon.addStyleClass("iconPadding");

			var firstNameTxt = new sap.m.Label({
				text: "First Name"
			});
			firstNameTxt.addStyleClass("alignText");
			var firstNameInput = new sap.m.Input({});

			var lastNameTxt = new sap.m.Label({
				text: "Last Name"
			});
			lastNameTxt.addStyleClass("alignText");
			var lastNameInput = new sap.m.Input({});

			var emailTxt = new sap.m.Label({
				text: "Email"
			});
			emailTxt.addStyleClass("alignText");
			var emailInput = new sap.m.Input({});

			return new sap.m.FlexBox({
				// enableFlexBox: true,
				//    fitContainer: true,
				//  justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
				items: [firstNameTxt,
					firstNameInput,
					lastNameTxt,
					lastNameInput,
					emailTxt,
					emailInput,
					icon
				]
			});
		},

		onSubmitBatch: function () {
			var view = this.getView();
			var content = view._bDialog.getContent();
			var newUserList = [];
			for (var i = 0; i < content.length; i++) {
				var user = {};
				user.UserId = "0000000000";
				user.FirstName = content[i].getItems()[1].getValue();
				user.LastName = content[i].getItems()[3].getValue();
				user.Email = content[i].getItems()[5].getValue();
				//	user.ZMYNEW1 = "";
				newUserList.push(user);
			}

			//create an array of batch changes and save  
			var oParams = {};
			oParams.json = true;
			oParams.defaultUpdateMethod = "PUT";
			oParams.useBatch = true;

			var batchModel = new sap.ui.model.odata.v2.ODataModel("/xsodata/user.xsodata/", oParams);
			//var batchChanges = [];
			var mParams = {};
			mParams.groupId = "1001";
			mParams.success = function () {
				sap.m.MessageToast.show("Create successful");
			};
			mParams.error = this.onErrorCall;

			for (var k = 0; k < newUserList.length; k++) {
				batchModel.create("/Users", newUserList[k], mParams);
			}

		}

	});
});