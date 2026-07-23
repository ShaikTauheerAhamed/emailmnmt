const cds = require("@sap/cds");

const { SELECT, INSERT, DELETE } = cds.ql;

module.exports = cds.service.impl(async function () {

    const srv = this;
    const db = await cds.connect.to("db");

    const {
        Alert,
        Subscription,
        SubscriptionFilter
    } = cds.entities("hpbuysell.adm.emlmnmt");

    /*****************************************************************
     * Filter Configuration
     *****************************************************************/

    const COMMON_FIELDS = [
        "PROJ",
        "BUYER",
        "RMACOORD",
        "CUST",
        "SUPP",
        "COMPCODE",
        "PART",
        "PLANT",
        "SLOC",
        "BUSMODEL"
    ];

    // Updated as per latest requirement
    const STATUS_FIELD_BY_CATEGORY = {
        IBSHP: ["IBSTAT"],
        OBSHP: ["OBSTAT"],
        IBOBSHP: ["IBSTAT", "OBSTAT"],
        SOREQ: [],
        SO: [],
        PO: [],
        INV: [],
        RMA: []
    };

    /*****************************************************************
     * Subscribe
     *****************************************************************/

    srv.on("subscribe", async (req) => {

        const { alertId } = req.data;

        const tx = cds.transaction(req);

        const alert = await tx.run(
            SELECT.one.from(Alert)
                .where({
                    alertId: alertId
                })
        );

        if (!alert) {
            return req.reject(404, "Alert not found.");
        }

        const existing = await tx.run(
            SELECT.one.from(Subscription)
                .where({
                    userId: req.user.id,
                    alert_alertId: alertId
                })
        );

        if (existing) {
            return existing;
        }

        await tx.run(
            INSERT.into(Subscription).entries({
                userId: req.user.id,
                alert_alertId: alertId,
                active: true
            })
        );

        return await tx.run(
            SELECT.one.from(Subscription)
                .where({
                    userId: req.user.id,
                    alert_alertId: alertId
                })
        );

    });

    /*****************************************************************
     * Unsubscribe
     *****************************************************************/

    srv.on("unsubscribe", async (req) => {

        const { subscriptionId } = req.data;

        const tx = cds.transaction(req);

        const subscription = await tx.run(
            SELECT.one.from(Subscription)
                .where({
                    ID: subscriptionId,
                    userId: req.user.id
                })
        );

        if (!subscription) {
            return req.reject(404, "Subscription not found.");
        }

        await tx.run(
            DELETE.from(Subscription)
                .where({
                    ID: subscriptionId
                })
        );

        return true;

    });

    /*****************************************************************
     * Add Filter Value
     *****************************************************************/

    srv.on("addFilterValue", async (req) => {

        const {
            subscriptionId,
            fieldCode,
            value,
            valueText
        } = req.data;

        const tx = cds.transaction(req);

        const subscription = await tx.run(
            SELECT.one.from(Subscription)
                .where({
                    ID: subscriptionId,
                    userId: req.user.id
                })
        );

        if (!subscription) {
            return req.reject(404, "Subscription not found.");
        }

        const duplicate = await tx.run(
            SELECT.one.from(SubscriptionFilter)
                .where({
                    subscription_ID: subscriptionId,
                    fieldCode,
                    value
                })
        );

        if (duplicate) {
            return true;
        }

        await tx.run(
            INSERT.into(SubscriptionFilter).entries({
                subscription_ID: subscriptionId,
                fieldCode,
                value,
                valueText
            })
        );

        return true;

    });

    /*****************************************************************
     * Remove Filter Value
     *****************************************************************/

    srv.on("removeFilterValue", async (req) => {

        const {
            subscriptionId,
            fieldCode,
            value
        } = req.data;

        const tx = cds.transaction(req);

        const subscription = await tx.run(
            SELECT.one.from(Subscription)
                .where({
                    ID: subscriptionId,
                    userId: req.user.id
                })
        );

        if (!subscription) {
            return req.reject(404, "Subscription not found.");
        }

        await tx.run(
            DELETE.from(SubscriptionFilter)
                .where({
                    subscription_ID: subscriptionId,
                    fieldCode,
                    value
                })
        );

        return true;

    });

    /*****************************************************************
     * Applicable Fields
     *****************************************************************/

    srv.on("applicableFields", async (req) => {

        const { alertId } = req.data;

        const tx = cds.transaction(req);

        const alert = await tx.run(
            SELECT.one.from(Alert)
                .columns("category")
                .where({
                    alertId: alertId
                })
        );

        if (!alert) {
            return req.reject(404, "Alert not found.");
        }

        return [
            ...COMMON_FIELDS,
            ...(STATUS_FIELD_BY_CATEGORY[alert.category] || [])
        ];

    });
    /*****************************************************************
     * Add Alert
     *****************************************************************/

    srv.on("addAlert", async (req) => {

        const { description, category } = req.data;

        const tx = cds.transaction(req);

        if (!description || description.trim() === "") {
            return req.reject(400, "Description is mandatory.");
        }

        // Find next Alert Number
        const maxAlert = await tx.run(
            SELECT.one
                .from(Alert)
                .columns("max(alertId) as maxId")
        );

        const nextAlertId = (maxAlert.maxId || 0) + 1;

        await tx.run(
            INSERT.into(Alert).entries({
                alertId: nextAlertId,
                description: description.trim(),
                category,
                active: true
            })
        );

        return await tx.run(
            SELECT.one.from(Alert)
                .where({
                    alertId: nextAlertId
                })
        );

    });

    /*****************************************************************
     * Delete Alert
     *****************************************************************/

    srv.on("deleteAlert", async (req) => {

        const { alertId } = req.data;

        const tx = cds.transaction(req);

        const alert = await tx.run(
            SELECT.one.from(Alert)
                .where({
                    alertId: alertId
                })
        );

        if (!alert) {
            return req.reject(404, "Alert not found.");
        }

        const subscriptions = await tx.run(
            SELECT.from(Subscription)
                .columns("ID")
                .where({
                    alert_alertId: alertId
                })
        );

        for (const sub of subscriptions) {

            await tx.run(
                DELETE.from(SubscriptionFilter)
                    .where({
                        subscription_ID: sub.ID
                    })
            );

        }

        await tx.run(
            DELETE.from(Subscription)
                .where({
                    alert_alertId: alertId
                })
        );

        await tx.run(
            DELETE.from(Alert)
                .where({
                    alertId: alertId
                })
        );

        return true;

    });

    /*****************************************************************
     * Alert List (Virtual Entity)
     *****************************************************************/

    // srv.on("READ", "AlertList", async (req) => {

    //     const tx = cds.transaction(req);

    //     const userId = req.user.id;

    //     const alerts = await tx.run(
    //         SELECT.from(Alert)
    //             .orderBy("alertId")
    //     );

    //     const subscriptions = await tx.run(
    //         SELECT.from(Subscription)
    //             .where({
    //                 userId: userId
    //             })
    //     );

    //     return alerts.map(alert => {

    //         const subscription = subscriptions.find(
    //             s => s.alert_alertId === alert.alertId
    //         );

    //         return {

    //             alertId: alert.alertId,

    //             description: alert.description,

    //             category: alert.category,

    //             active: alert.active,

    //             subscribed: !!subscription,

    //             subscriptionId: subscription ? subscription.ID : null,

    //             filterEnabled: !!subscription

    //         };

    //     });

 //   });

});