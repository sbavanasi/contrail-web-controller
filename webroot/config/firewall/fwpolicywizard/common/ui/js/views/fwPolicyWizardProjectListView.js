/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
], function (_, ContrailView, ContrailListModel) {
    var self;
    var fwPolicyWizardProjectListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            self = this;
            var listModelConfig, contrailListModel,headerText
                viewConfig = self.attributes.viewConfig;
                currentProject = viewConfig["projectSelectedValueData"];
                console.log("viewConfig-project");
                console.log(viewConfig);
                self.mode = viewConfig.mode;
                $("#aps-save-button").hide();
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
                    dataParser: function(response, mode){
                        return self.parseFWPolicyGlobalData(response, self.mode);
                    }
                }
            };
            contrailListModel = new ContrailListModel(listModelConfig);
            self.renderView4Config(self.$el,
                    contrailListModel, self.getFWPolicyGlobalGridViewConfig());
        },
        parseFWPolicyGlobalData: function(result, mode) {
            var fwPolicies = getValueByJsonPath(result,
                "0;firewall-policys", [], false),
                fwPolicyList = [];
          if(mode === "grid_firewall_policies"){
                _.each(fwPolicies, function(fwPolicy) {
                    if("firewall-policy" in fwPolicy)
                    fwPolicyList.push(fwPolicy["firewall-policy"]);
                });
            }
          else if(mode === "grid_stand_alone"){
              _.each(fwPolicies, function(fwPolicy) {
                  if("firewall-policy" in fwPolicy){
                      var appPolicyBackRefsArray = getValueByJsonPath(fwPolicy, "firewall-policy;application_policy_set_back_refs", []);
                      if(appPolicyBackRefsArray.length === 0)
                       fwPolicyList.push(fwPolicy["firewall-policy"]);
                  }
              });
           }
            return fwPolicyList;
        },

        getFWPolicyGlobalGridViewConfig: function() {
            return {
                elementId:"fw-policy-wizard-global-section",
                view: "SectionView",
                viewConfig: {
                    rows: [{
                        columns: [
                            {
                                elementId:"fw-policy-wizard-global-grid-id",
                                view: "fwPolicyGridView",
                                viewPathPrefix:
                                    "config/firewall/common/fwpolicy/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    pagerOptions: {
                                        options: {
                                            pageSize: 10,
                                            pageSizeSelect: [10, 50, 100]
                                        }
                                    },
                                    isProject: false,
                                    isGlobal: true,
                                    isWizard:true
                                }
                            }
                        ]
                    }]
                }
            }
        }
    });

    return fwPolicyWizardProjectListView;
});

