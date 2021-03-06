/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var VRouterACLFormModel = ContrailModel.extend({
        defaultConfig: {
            'acl_uuid': '',
        },

        validations: {
        },
        //Build the object to be sent in the req.
        getQueryParams : function () {
            var queryParams = {};
            var modelAttrs = this.model().attributes;
            if (modelAttrs.acl_uuid != '')
                queryParams['uuid'] = modelAttrs.acl_uuid;
            return queryParams;
        },

        reset: function (data, event) {
            this.acl_uuid('');
        },
    });
    return VRouterACLFormModel;
});

