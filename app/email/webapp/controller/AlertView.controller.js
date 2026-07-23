sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Switch",
    "sap/m/Button"
], function (Controller, Switch, Button) {
    "use strict";

    return Controller.extend("hpbuysell.adm.emlmnmt.email.controller.AlertView", {

        onInit: function () {

        },

        // onSmartTableInitialise: function () {

        //     var oSmartTable = this.byId("smartTable");
        //     var oTable = oSmartTable.getTable();

        //     oTable.attachEventOnce("updateFinished", function () {

        //         var aItems = oTable.getItems();

        //         aItems.forEach(function (oItem) {

        //             var aCells = oItem.getCells();

        //             //
        //             // Subscribe Column
        //             //
        //             aCells[3].destroy();

        //             aCells[3] = new Switch({

        //                 state: "{subscribed}",

        //                 change: this.onSubscribeChange.bind(this)

        //             });

        //             //
        //             // Filter Button
        //             //
        //             aCells[4].destroy();

        //             aCells[4] = new Button({

        //                 text: "Configure",

        //                 enabled: "{filterEnabled}",

        //                 press: this.onConfigureFilters.bind(this)

        //             });

        //             oItem.removeAllCells();

        //             aCells.forEach(function (c) {
        //                 oItem.addCell(c);
        //             });

        //         }.bind(this));

        //     }.bind(this));

        // },

        onSubscribeChange: function (oEvent) {

            var bState = oEvent.getParameter("state");

            var oContext = oEvent.getSource().getBindingContext();

            var oData = oContext.getObject();

            console.log(oData);

        },

        onConfigureFilters: function (oEvent) {

            var oData = oEvent.getSource()
                .getBindingContext()
                .getObject();

            console.log(oData);

        }

    });

});