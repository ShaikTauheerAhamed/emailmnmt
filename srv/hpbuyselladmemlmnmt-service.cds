using { hpbuysell.adm.emlmnmt as db } from '../db/hpbuyselladmemlmnmt-model';
@path:'/odata/v4/alert'
service AlertService {

    // @readonly
    //     @restrict: [
    //     {
    //         grant: 'READ',
    //         to: 'AlertUser'
    //     },
    //     {
    //         grant: ['CREATE','DELETE','UPDATE'],
    //         to: 'AlertAdmin'
    //     }
    // ]
    entity Alerts as projection on db.Alert;

    // @restrict: [
    //     {
    //         grant: '*',
    //         to: 'AlertUser'
    //     }
    // ]
    entity MySubscriptions
        as projection on db.Subscription {
            *,
            alert.description as alertDescription,
            alert.category    as alertCategory
        }
        where userId = $user.id;

    entity SubscriptionFilters
        as projection on db.SubscriptionFilter
         where subscription.userId = $user.id;


    action addAlert(
        description : String,
        category    : db.AlertCategory
    ) returns Alerts;

    action deleteAlert(
        alertId : Integer
    ) returns Boolean;

    action subscribe(
        alertId : Integer
    ) returns MySubscriptions;

    action unsubscribe(
        subscriptionId : UUID
    ) returns Boolean;

    action addFilterValue(
        subscriptionId : UUID,
        fieldCode      : db.FilterFieldCode,
        value          : String,
        valueText      : String
    ) returns Boolean;

    action removeFilterValue(
        subscriptionId : UUID,
        fieldCode      : db.FilterFieldCode,
        value          : String
    ) returns Boolean;

    function applicableFields(
        alertId : Integer
    ) returns array of db.FilterFieldCode;

    entity AlertList as projection on db.AlertList;

}