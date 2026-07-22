namespace hpbuysell.adm.emlmnmt;
using { cuid, managed } from '@sap/cds/common';
type AlertCategory : String enum {
    SOREQ;
    SO;
    PO;
    IBSHP;
    OBSHP;
    IBOBSHP;
    INV;
    RMA;
}
type FilterFieldCode : String enum {
    PROJ;
    BUYER;
    RMACOORD;
    CUST;
    SUPP;
    COMPCODE;
    PART;
    PLANT;
    SLOC;
    BUSMODEL;
    SOREQSTAT;
    SOSTAT;
    POSTAT;
    IBSTAT;
    OBSTAT;
}
entity Alert :  managed {
    key alertId : Integer;
    description : String(120);
    category    : AlertCategory;
    active      : Boolean default true;
}
entity Subscription : cuid, managed {
    userId    : String(256);
    alert   : Association to Alert;
    active  : Boolean default true;
    filters : Composition of many SubscriptionFilter
        on filters.subscription = $self;
}
entity SubscriptionFilter : cuid {
    subscription : Association to Subscription;
    fieldCode    : FilterFieldCode;
    value         : String(40);
    valueText     : String(120);
}
@cds.persistence.skip
entity AlertList {
    key alertId       : Integer;
    description       : String(120);
    category          : AlertCategory;
    active            : Boolean;
    subscribed        : Boolean;
    subscriptionId    : UUID;
    filterEnabled     : Boolean;
}