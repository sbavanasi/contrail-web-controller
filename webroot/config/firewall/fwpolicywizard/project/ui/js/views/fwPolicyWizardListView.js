/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model'
], function (_, ContrailView, ContrailListModel) {
    var fwPolicyWizardListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig, listModelConfig,
                currentProject;
            if(!viewConfig.isGlobal) {
                currentProject = viewConfig["projectSelectedValueData"];
                listModelConfig = {
                    remote: {
                        ajaxConfig: {
                            url: "/api/tenants/config/get-config-details",
                            type: "POST",
                            data: JSON.stringify(
                                {data: [{type: 'application-policy-sets',
                                    parent_id: currentProject.value}]})
                        },
                        dataParser: self.parseApplicationPolicyData,
                    }
                };
            } else {
                listModelConfig = {
                        remote: {
                            ajaxConfig: {
                                url: "/api/tenants/config/get-config-details",
                                type: "POST",
                                data: JSON.stringify(
                                        {data: [{type: 'application-policy-sets',
                                            parent_type: "policy-management",
                                            parent_fq_name_str:"default-policy-management"}]})
                            },
                            dataParser: self.parseApplicationPolicyData,
                        }
                    };
            }
            var contrailListModel = new ContrailListModel(listModelConfig);
            this.renderView4Config(this.$el,
                   contrailListModel, getAppPolicyGridViewConfig(viewConfig));
        },
        parseApplicationPolicyData : function(response){
            var dataItems = [],
                appPolicyData = getValueByJsonPath(response, "0;application-policy-sets", []);
                _.each(appPolicyData, function(val){
                    if("application-policy-set" in val) {
                        dataItems.push(val['application-policy-set']);
                    }
                }); 
            return dataItems;
        }
    });

    var getAppPolicyGridViewConfig = function (viewConfig) {
        return {
            elementId: cowu.formatElementId([ctwc.NEW_APPLICATION_POLICY_SET_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.NEW_APPLICATION_POLICY_SET,
                                view: "fwPolicyWizardGridView",
                                viewPathPrefix: "config/firewall/fwpolicywizard/common/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    pagerOptions: {
                                        options: {
                                            pageSize: 10,
                                            pageSizeSelect: [10, 50, 100]
                                        }
                                    },
                                    viewConfig: viewConfig
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return fwPolicyWizardListView;
});