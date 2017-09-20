/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-config-model'
], function (_, ContrailConfigModel) {
    var fwPolicyWizardModel = ContrailConfigModel.extend({
        defaultConfig: {
            'name': '',
            'firewall_policy': ''
        },
        formatModelConfig: function(modelConfig) {
        }
    });
    return fwPolicyWizardModel;
});
