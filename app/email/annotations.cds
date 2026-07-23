using AlertService as service from '../../srv/hpbuyselladmemlmnmt-service';
annotate service.AlertList with @(

    UI.LineItem : [

        {
            Value : alertId,
            Label : 'Alert ID'
        },

        {
            Value : description,
            Label : 'Description'
        },

        {
            Value : category,
            Label : 'Category'
        },

        {
            Value : subscribed,
            Label : 'Subscribe'
        },

        {
            Value : filterEnabled,
            Label : 'Filters'
        }

    ]

);