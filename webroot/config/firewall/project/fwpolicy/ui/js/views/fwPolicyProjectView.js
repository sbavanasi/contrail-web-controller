/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var tagProjectView = ContrailView.extend({
        el: $(contentContainer),
        renderFWPolicy: function (viewConfig) {
            var self = this;
            self.renderView4Config(self.$el, null,
                                   getFWPolicyProjectConfig(viewConfig));
        }
    });

    function getFWPolicyProjectConfig (viewConfig) {
        var hashParams = viewConfig.hashParams,
            customProjectDropdownOptions = {
                config: true,
                childView: {
                    init: getFWPolicyProject(viewConfig),
                }
            },
            customDomainDropdownOptions = {
                childView: {
                    init: ctwvc.getProjectBreadcrumbDropdownViewConfig(hashParams,
                                                                 customProjectDropdownOptions)
                }
            };
        return ctwvc.getDomainBreadcrumbDropdownViewConfig(hashParams,
                                                     customDomainDropdownOptions)
    };

    function getFWPolicyProject(viewConfig) {
        return function (projectSelectedValueData) {
            selectedDomainProjectData = projectSelectedValueData;
            return {
                elementId:
                    cowu.formatElementId([ctwc.SECURITY_POLICY_TAG_LIST_VIEW_ID]),
                view: "fwPolicyProjectListView",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix: "config/firewall/project/fwpolicy/ui/js/views/",
                viewConfig: $.extend(true, {}, viewConfig,
                                     {projectSelectedValueData:
                                     projectSelectedValueData})
            }
        }
    };
    return tagProjectView;
});

