sap.ui.define([
  "sap/ui/core/UIComponent",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/odata/v2/ODataModel"
], function(UIComponent, JSONModel, ODataModel) {
  "use strict";
  return UIComponent.extend("sap.anz.mvc.Component", {
    metadata: {
      // instantiates the resource model thanks to the app descriptor
      manifest: "json"
    },

    init: function() {
      // call the init function of the parent
      UIComponent.prototype.init.apply(this, arguments);

      // set local data model (schedule.json)
      //var oConfig = this.getMetadata().getConfig();
      //var sNamespace = this.getMetadata().getManifestEntry("sap.app").id;
      // mapping to the property "modelLocal" in the "config" property of the app descriptor
      //var oLocalModel = new JSONModel(jQuery.sap.getModulePath(sNamespace, oConfig.modelLocal));
      //this.setModel(oLocalModel, "schedule");

      // sample for remote JSON model definition
      //var oConfig = this.getMetadata().getConfig();
      //var oJSONModel = new ODataModel(oConfig./* destination in config prop of app descriptor */);
      //this.setModel(oJSONModel, "JSON");


      // create the views based on the url/hash
			this.getRouter().initialize();
    }
  });
});