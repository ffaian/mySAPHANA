sap.ui.define([
		"sap/ui/core/mvc/Controller", "sap/ui/model/Filter",
		"sap/ui/model/json/JSONModel",
		"sapui5/libraryApp/commons/formatter",
		"sapui5/libraryApp/commons/types",
		"sapui5/libraryApp/commons/Validator",
		"sap/ui/core/ValueState",
		"sapui5/libraryApp/commons/SystemInfo"
	],
	function (Controller, Filter, JSONModel, formatter, types, Validator, ValueState, SystemInfo) {
		"use strict";

		return Controller.extend("sapui5.holiday.App.Holiday.controller.Master", {

			formatter: formatter,
			types: types,

			onInit: function () {

				// Global variable	
				window.oJSView = this.getView();

				// Attaches validation handlers
				sap.ui.getCore().attachValidationError(
					function (oEvent) {
						oEvent.getParameter("element").setValueState(ValueState.Error);
					});
				sap.ui.getCore().attachValidationSuccess(
					function (oEvent) {
						oEvent.getParameter("element").setValueState(ValueState.None);
					});

				// Holidays JSON Query
				var oModel_Holidays = new sap.ui.model.json.JSONModel();
				oModel_Holidays.loadData(
					"../xsjs/Holiday_md.xsjs", "GET", false);

				// provinces JSON Query
				var oModel_Provinces = new sap.ui.model.json.JSONModel();
				oModel_Provinces.loadData(
					"../xsjs/Province_md.xsjs", "GET", false);

				this.oHolidayCombo = new sap.m.ComboBox("myHolidayCombo");
				this.oHolidayCombo.setModel(oModel_Holidays); // lookup_tables
				this.oHolidayCombo.bindAggregation("items", {
					path: "/Holidays",
					template: new sap.ui.core.ListItem({
						key: "{HOLIDAY_ID}",
						text: "{HOLIDAY_TXT}"
					})
				});
				this.oHolidayCombo.attachChange(this.onCheckComboBox, this);

				// Province ComboBox
				this.oProvincescombo = new sap.m.ComboBox("myProvinceCombo", {});
				this.oProvincescombo.setModel(oModel_Provinces); // lookup_tables
				this.oProvincescombo.bindAggregation("items", {
					path: "/Province",
					template: new sap.ui.core.ListItem({
						key: "{REGION}",
						text: "{TXTSH}"
					})
				});
				this.oProvincescombo.attachChange(this.onCheckComboBox, this);

				// validation
				// JSON dummy data
				var oDataVal = {
					text: null,
					number: 500,
					myDate: new Date()
				};
				this.oModelVal = new JSONModel();
				this.oModelVal.setData(oDataVal);
				sap.ui.getCore().setModel(this.oModelVal);

				// Date
				this.oInputDate = new sap.m.DatePicker("myDateInput", {
					displayFormat: "MMM-dd-YYYY",
					valueFormat: "yyyy-MM-dd",
					required: true
				});

				this.oInputDate.setModel(this.oModelVal);
				this.oInputDate.bindProperty("value", {
					path: "/myDate",
					type: new control.tables.myDate
				});

				// user section
				var oModel_User = new sap.ui.model.json.JSONModel();
				oModel_User.loadData(
					"../xsjs/user_session.xsjs", "GET", false);

				// System Info
				this.mySystemInfo = new SystemInfo(); // declare

				//var oUserModel = new sap.ui.model.json.JSONModel();
				//oUserModel.loadData("/services/userapi/currentUser", "GET", false);

				sap.ui.getCore().byId("myUserLabel").bindProperty("text", {
					parts: [{
						path: "/session/0/UserName"
					}, {
						path: "/session/0/Language"
					}],
					formatter: function (user, lan) {
						return user + " | " + lan;
					},
				});
				sap.ui.getCore().byId("myUserLabel").setModel(oModel_User);

				//				new sap.ui.model.json.JSONModel("/services/userapi/currentUser");
				//				sap.ui.getCore().setModel(userModel, "userapi");

			},

			onListPress: function (oEvent) {
				// general get selected Item - to be used maybe latter

				var oItem = oEvent.getSource();
				if (oItem.getId() === "mySearchCombo") {

					var oListBinding = sap.ui.getCore().byId("mytable").getBinding("items");
					oListBinding.aSorters = null;
					oListBinding.aFilters = null;
					sap.ui.getCore().byId("mytable").getModel().refresh(true);

				}

			},

			onLiveSearch: function (oEvent) {
				if (oEvent.getParameters().refreshButtonPressed) {} else {
					//						window.oJSView.getController().mySystemInfo.CheckConnection();
					var tpmla = oEvent.getParameter("newValue");
					var filters = new Array();
					var sSearchID = sap.ui.getCore().byId("mySearchCombo").getSelectedKey();
					switch (sSearchID) {
					case "1":
						var oFilter = new sap.ui.model.Filter("DATE",
							sap.ui.model.FilterOperator.Contains, tpmla);
						break;
					case "2":
						var oFilter = new sap.ui.model.Filter("PROVINCE",
							sap.ui.model.FilterOperator.Contains, tpmla);
						break;
					case "3":
						var oFilter = new sap.ui.model.Filter("HOLIDAY_ID",
							sap.ui.model.FilterOperator.Contains, tpmla);
						break;

					}
					filters.push(oFilter);

					// get list created in view
					this.oTable = sap.ui.getCore().byId("mytable");
					this.oTable.getBinding("items").filter(filters);
				}
			},

			onSearch: function (oEvent) {
				if (oEvent.getParameters().refreshButtonPressed) {
					window.location.reload();
				}
			},

			onValidate: function (myForm) {
				// Create new validator instance
				var validator = new Validator();
				validator.validate(sap.ui.getCore().byId(myForm));
				return validator.isValid();

			},

			onCheckComboBox: function (oEvent) {
				var newval = oEvent.getParameter("newValue");
				var key = oEvent.getSource().getSelectedItem();

				if (key === null) {
					oEvent.getSource().setValue("");
					oEvent.getSource().setValueState("Error");
				} else {
					oEvent.getSource().setValueState("None");
				}
			},

			/** *** EDIT Operation **** **/
			openUpdateDialog: function (oController, oIndex) {
				//window.oJSView.getController().mySystemInfo.CheckConnection();
				var openUpdateDialog = new sap.m.Dialog();
				openUpdateDialog.setTitle("Edit Record");
				openUpdateDialog.setContentWidth("600px");
				var oModel = sap.ui.getCore().byId("mytable").getModel();
				var oItems = sap.ui.getCore().byId("mytable").getItems();
				// set values
				this.oHolidayCombo.setSelectedKey(oModel.getProperty("HOLIDAY_ID", oItems[oIndex].getBindingContext()));
				var oSimpleForm = new sap.ui.layout.form.SimpleForm({
					editable: true,
					maxContainerCols: 2,
					content: [
						new sap.m.Title({
							text: "Holiday Information",
							titleStyle: sap.ui.core.TitleLevel.H2
						}),
						new sap.m.Label({
							text: "Date"
						}), new sap.m.Input({
							value: oModel.getProperty("DATE", oItems[oIndex].getBindingContext()),
							editable: false
						}), new sap.m.Label({
							text: "Province"
						}), new sap.m.Input({
							value: this.formatter.formatProvince(oModel.getProperty("PROVINCE", oItems[oIndex].getBindingContext())),
							editable: false
						}), new sap.m.Label({
							text: "Holiday",
							required: true
						}), this.oHolidayCombo,
						new sap.m.Label({
							text: ""
						})
					]
				});
				openUpdateDialog.addContent(oSimpleForm);
				openUpdateDialog.addButton(new sap.m.Button({
					type: "Reject",
					text: "Cancel",
					press: function () {
						openUpdateDialog.close();
					}
				}));
				openUpdateDialog.addButton(new sap.m.Button({
					text: "Confirm",
					type: "Accept",
					press: function () {
						if (oController.onValidate(openUpdateDialog.getId()) &&
							sap.ui.getCore().byId("myHolidayCombo").getSelectedItem()) {
							//window.oJSView.getController().mySystemInfo.CheckConnection();
							var oEntry = {};
							oEntry.DATE = oModel.getProperty("DATE", oItems[oIndex].getBindingContext());
							oEntry.PROVINCE = oModel.getProperty("PROVINCE", oItems[oIndex].getBindingContext());
							oEntry.HOLIDAY_ID = sap.ui.getCore().byId("myHolidayCombo").getSelectedItem().getBindingContext().getObject().HOLIDAY_ID;
							// Post data to the server
							sap.ui.getCore().byId("mytable").getModel().loadData("../xsjs/editdata.xsjs", oEntry,
								true, 'POST');
							// Update JSON model 
							oModel.getData().Holidays[oIndex].HOLIDAY_ID = oEntry.HOLIDAY_ID;
							oModel.refresh(true);
							openUpdateDialog.close();
						} else {
							sap.m.MessageToast.show("Please check the form entries");
						}
					}
				}));
				openUpdateDialog.open();
			},

			/** *** CREATE Operation **** **/
			openCreateDialog: function (oController) {
				//window.oJSView.getController().mySystemInfo.CheckConnection();
				var oCreateDialog = new sap.m.Dialog();
				oCreateDialog.setTitle("Create Record");
				oCreateDialog.setContentWidth("600px");
				// default values
				var oDateFormat = sap.ui.core.format.DateFormat.getInstance({
					pattern: "yyyy-MM-dd"
				});
				this.oModelVal.setProperty("/myDate", oDateFormat.format(new Date()));
				this.oProvincescombo.setSelectedKey("99");
				this.oHolidayCombo.setSelectedKey("1");
				var oSimpleForm = new sap.ui.layout.form.SimpleForm({
					editable: true,
					maxContainerCols: 2,
					content: [
						new sap.m.Title({
							text: "Holiday Information",
							titleStyle: sap.ui.core.TitleLevel.H2
						}),
						new sap.m.Label({
							text: "Date",
							required: true
						}), this.oInputDate,
						new sap.m.Label({
							text: ""
						}), new sap.m.Label({
							text: "Province",
							required: true
						}), this.oProvincescombo,
						new sap.m.Label({
							text: ""
						}), new sap.m.Label({
							text: "Holiday",
							required: true
						}), this.oHolidayCombo,
						new sap.m.Label({
							text: ""
						})
					]
				});

				oCreateDialog.addContent(oSimpleForm);
				oCreateDialog.addButton(new sap.m.Button({
					type: "Reject",
					text: "Cancel",
					press: function () {
						oCreateDialog.close();
					}
				}));
				oCreateDialog.addButton(new sap.m.Button({
					text: "Confirm",
					type: "Accept",
					press: function () {
						if (oController.onValidate(oCreateDialog.getId()) &&
							sap.ui.getCore().byId("myHolidayCombo").getSelectedItem() &&
							sap.ui.getCore().byId("myProvinceCombo").getSelectedItem()) {
							//window.oJSView.getController().mySystemInfo.CheckConnection();
							var oEntry = {};
							oEntry.DATE = sap.ui.getCore().byId("myDateInput").getValue();
							oEntry.PROVINCE = sap.ui.getCore().byId("myProvinceCombo").getSelectedItem().getBindingContext().getObject().REGION;
							oEntry.HOLIDAY_ID = sap.ui.getCore().byId("myHolidayCombo").getSelectedItem().getBindingContext().getObject().HOLIDAY_ID;
							// Post data to the server
							sap.ui.getCore().byId("mytable").getModel().loadData("../xsjs/adddata.xsjs", oEntry,
								true, 'POST');
							sap.ui.getCore().byId("mytable").getModel().getData().Holidays.push(oEntry);
							sap.ui.getCore().byId("mytable").getModel().refresh(true);
							oCreateDialog.close();
						} else {
							sap.m.MessageToast.show("Please check the form entries");
						}
					}
				}));
				oCreateDialog.open();
			},

			/** *** DELETE Operation **** **/
			openDeleteDialog: function (oIndex) {
				//window.oJSView.getController().mySystemInfo.CheckConnection();
				var openDeleteDialog = new sap.m.Dialog();
				openDeleteDialog.setTitle("Delete Record");
				openDeleteDialog.setContentWidth("600px");
				var oModel = sap.ui.getCore().byId("mytable").getModel();
				var oItems = sap.ui.getCore().byId("mytable").getItems();
				var oSimpleForm = new sap.ui.layout.form.SimpleForm({
					editable: true,
					maxContainerCols: 2,
					content: [
						new sap.m.Title({
							text: "Holiday Information",
							titleStyle: sap.ui.core.TitleLevel.H2
						}),
						new sap.m.Label({
							text: "Date"
						}), new sap.m.Input({
							value: oModel.getProperty("DATE", oItems[oIndex].getBindingContext()),
							editable: false
						}), new sap.m.Label({
							text: "Province"
						}), new sap.m.Input({
							value: this.formatter.formatProvince(oModel.getProperty("PROVINCE", oItems[oIndex].getBindingContext())),
							editable: false
						}), new sap.m.Label({
							text: "Holiday"
						}), new sap.m.Input({
							value: this.formatter.formatHoliday(oModel.getProperty("HOLIDAY_ID", oItems[oIndex].getBindingContext())),
							editable: false
						})
					]
				});
				openDeleteDialog.addContent(oSimpleForm);
				openDeleteDialog.addButton(new sap.m.Button({
					type: "Reject",
					text: "Cancel",
					press: function () {
						openDeleteDialog.close();
					}
				}));
				openDeleteDialog.addButton(new sap.m.Button({
					text: "Confirm",
					type: "Accept",
					press: function () {
						//window.oJSView.getController().mySystemInfo.CheckConnection();
						var oEntry = {};
						oEntry.DATE = oModel.getProperty("DATE", oItems[oIndex].getBindingContext());
						oEntry.PROVINCE = oModel.getProperty("PROVINCE", oItems[oIndex].getBindingContext());
						oEntry.HOLIDAY_ID = oModel.getProperty("HOLIDAY_ID", oItems[oIndex].getBindingContext());
						// Post data to the server
						oModel.loadData("../xsjs/deletedata.xsjs", oEntry,
							true, 'POST');
						oModel.getData().Holidays.splice(oIndex, 1);
						oModel.refresh(true);
						openDeleteDialog.close();
					}
				}));
				openDeleteDialog.open();
			}

		});
	});