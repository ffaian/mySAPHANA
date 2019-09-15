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
			var HolidayModel =
				this.getOwnerComponent().getModel("HolidayModel");
			var oTable = this.getView().byId("holidayTable");
			oTable.setModel(HolidayModel);

			// //Holidays JSON Query
			// var oModel_Holidays = new JSONModel();
			// oModel_Holidays.loadData(
			// 	"../xsodata/HolidayMD.xsodata", "GET", false);

			// Holiday Master Data
			var oModel_Holidays = this.getOwnerComponent().getModel("HolidayMDModel");

			// var oSearchTable = sap.ui.getCore().byId("searchTableId");
			// var oModel = this.getOwnerComponent().getModel("HolidayMD");
			var oModelJson = new JSONModel();
			oModel_Holidays.read("/HolidaysMD", {
				success: function (oData, response) {
					oModelJson.setData(oData);
					// oModelJson.setData( {HolidaysMD: oData});
					// var oRow = new sap.m.ColumnListItem({
					// 	cells: [
					// 		new sap.m.Text({
					// 			text: "{Name1}"
					// 		}),
					// 		new sap.m.Text({
					// 			text: "{Werks}"
					// 		})
					// 	]
					// });
					// oSearchTable.setModel(oModelJson);
					// oSearchTable.bindItems("/results", oRow);
					//sap.ui.getCore().setModel(oModelJson, "oJSONModel");
				}
			});

			this.oHolidayCombo = new sap.m.ComboBox("myHolidayCombo");
			this.oHolidayCombo.setModel(oModelJson); // lookup_tables
			this.oHolidayCombo.bindAggregation("items", {
				// path: "/HolidaysMD",
				path: "/results",				
				template: new sap.ui.core.ListItem({
					key: "{HOLIDAY_ID}",
					text: "{HOLIDAY_TXT}"
				})
			});
			this.oHolidayCombo.attachChange(this.onCheckComboBox, this);

			/*var sPath = "/HolidaysMD";
			oModel_Holidays.read(sPath, {
				urlParameters: {
					"$top": 13
				},
				success: function (oData, oResponse) {
					console.log("Success!");
				}
			});*/

			// oModel_Holidays.metadataLoaded().then(function (oEvent) {
			// 	/* TODO: add the event handling here! */
			// 	var oMetadata = oModel_Holidays.getServiceMetadata();

			// 	var oData = oModel_Holidays.read(
			// 		"/HolidaysMD",
			// 		function (oData2, oResponse) {
			// 			console.log("Success!");
			// 		},
			// 		function (oError) {
			// 			console.log("Error!");
			// 		}
			// 	);

			// 	sap.m.MessageToast.show("Holiday MD Data Ready!");
			// });

			// oModel_Holidays.attachRequestCompleted(function (oEvent) {

			// 	// request completed
			// 	// check oEvent.getParameters("success") ...
			// 	// ... whether the request was successful and the data was loaded
			// 	var oMetadata = oModel_Holidays.getServiceMetadata();
			// 	sap.m.MessageToast.show("Holiday MD Data Ready!");
			// 	// 	// console.log(oMetadata);

			// });

			// var oData = oModel_Holidays.read(
			// 	"/HolidaysMD",
			// 	function (oData2, oResponse) {
			// 		console.log("Success!");
			// 	},
			// 	function (oError) {
			// 		console.log("Error!");
			// 	}
			// );

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