/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
], function (_, ContrailView, ContrailListModel) {
    var self;
    var fwPolicyListView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            self = this;
            var listModelConfig, contrailListModel,
                viewConfig = self.attributes.viewConfig,
                currentProject = viewConfig["projectSelectedValueData"];

            listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: ctwc.URL_GET_CONFIG_DETAILS,
                        type: "POST",
                        data: JSON.stringify(
                                {data: [{type: 'firewall-policys',
                                    fields: ['application_policy_set_back_refs'],
                                    parent_id: currentProject.value}]})
                    },
                    dataParser: self.parseFWPolicyData,
                }
            };
            contrailListModel = new ContrailListModel(listModelConfig);
            self.renderView4Config(self.$el,
                    contrailListModel, self.getFWPolicyGlobalGridViewConfig(viewConfig));
        },

        parseFWPolicyData: function(result) {
            var fwPolicies = getValueByJsonPath(result,
                "0;firewall-policys", [], false),
                fwPolicyList = [];
            _.each(fwPolicies, function(fwPolicy) {
                if("firewall-policy" in fwPolicy)
                fwPolicyList.push(fwPolicy["firewall-policy"]);
            });
            return fwPolicyList;
        },

        getFWPolicyGlobalGridViewConfig: function(viewConfig) {
            return {
                elementId:
                cowu.formatElementId(["fw-policy-list-view"]),
                view: "SectionView",
                viewConfig: {
                    rows: [{
                        columns: [
                            {
                                elementId: "fw-policy-grid-id",
                                view: "fwApplicationPolicyGridView",
                                viewPathPrefix:
                                    "config/firewall/fwpolicywizard/common/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    pagerOptions: {
                                        options: {
                                            pageSize: 10,
                                            pageSizeSelect: [10, 50, 100]
                                        }
                                    },
                                    viewConfig: viewConfig,
                                    //isProject: false,
                                    isGlobal: false
                                }
                            }
                        ]
                    }]
                }
            }
        }
    });

    return fwPolicyListView;
});

