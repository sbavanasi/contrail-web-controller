/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback',
    'config/firewall/fwpolicywizard/common/ui/js/views/fwPolicyWizard.utils'
], function (_, ContrailView, Knockback,FWZUtils) {
    var gridElId = '#' + ctwc.APPLICATION_POLICY_SET_GRID_ID,
        prefixId = ctwc.APPLICATION_POLICY_SET_PREFIX_ID,
        modalId = 'configure-' + prefixId,
        formId = '#' + modalId + '-form';
    var fwzUtils = new FWZUtils();
    var fwPolicyWizardEditView = ContrailView.extend({
        renderFwWizard: function(options) {
            var editTemplate = contrail.getTemplate4Id(ctwl.TMPL_APPLICATION_POLICY_SET),
                editLayout = editTemplate({prefixId: prefixId, modalId: modalId}),
                self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-1120',
                             'title': options['title'], 'body': editLayout});

            self.renderView4Config($("#" + modalId).find('#aps-button-container'),
                                   this.model,
                                   getApplicationPolicyViewConfig(), "",
                                   null, null, function() {
                    $("#" + modalId).find('.modal-footer').hide();
                    $("#review_address_groups").on('click', function() {
                        self.renderObject(options, 'address_groups');
                    });
                    $("#review_service_groups").on('click', function() {
                        self.renderObject(options, 'service_groups');
                    });
                    $("#review_visible_tag_for_project").on('click', function() {
                        self.renderObject(options, 'tag');
                    });
                    $("#aps-plus-icon").on('click', function(){
                        self.renderObject(options, 'addIcon');
                    })
                    $("#aps-back-button").on('click', function(){
                        $('#modal-landing-container').show();
                        $("#aps-gird-container").empty();
                        $('#aps-landing-container').hide();
                    });
            },null,false);
        },
        renderObject: function(options, objName){
            $('#modal-landing-container').hide();
            $('#aps-save-button').hide();
            $('#aps-landing-container').show();
            var placeHolder = $('#aps-gird-container');
            var viewConfig = options['viewConfig'];
            if(objName === 'address_groups'){
                this.renderView4Config(placeHolder, null, getAddressGroup(viewConfig));
            }else if(objName === 'service_groups'){
                this.renderView4Config(placeHolder, null, getServiceGroup(viewConfig));
            }else if(objName === 'tag'){
                this.renderView4Config(placeHolder, null, getTag(viewConfig));
            }else if(objName === 'addIcon'){
                $('#aps-overlay-container').hide();
                $('#aps-main-container').css('background', "white !important");
                this.renderView4Config($('#aps-main-container'), this.model, getAddPolicyViewConfig(viewConfig));
            }
         }
    });
    function getNewFirewallPolicyViewConfig() {
        var gridPrefix = "add-firewall-policy",
            addNewFwPolicyViewConfig = {
            elementId:  cowu.formatElementId([prefixId, "add-new-firewall-policy"]),
            view: "WizardView",
            viewConfig: {
                steps: [
                    {
                        elementId:  cowu.formatElementId([prefixId, "add-new-firewall-policy"]),
                        title: "Name Policy",
                        view: "AccordianView",
                        viewConfig: fwzUtils.getFirewallPolicyViewConfig(),
                        stepType: "step",
                        onInitRender: true,
                        buttons: {
                            previous: {
                                visible: true
                            }
                        },
                        onNext: function(params) {
                            return true;
                        }
                    }
                ]
            }
        };
        return addNewFwPolicyViewConfig;
    }
    function getAddRulesViewConfig() {
        var gridPrefix = "add-rules",
        addRulesViewConfig = {
            elementId:  cowu.formatElementId([prefixId, ctwl.TITLE_CREATE_FW_RULES]),
            view: "WizardView",
            viewConfig: {
                steps: [
                    {
                        elementId:  cowu.formatElementId([prefixId, ctwl.TITLE_CREATE_FW_RULES]),
                        title: "Create Rules",
                        view: "SectionView",
                        viewConfig: fwzUtils.getRulesViewConfig(prefixId),
                        stepType: "step",
                        onInitRender: true,
                        buttons: {
                            previous: {
                                visible: true
                            }
                        },
                        onNext: function(params) {
                            return true;
                        }
                    }
                ]
            }
        };
        return addRulesViewConfig;
    }
    function getAddPolicyViewConfig(viewConfig) {
        var addPolicyViewConfig = {
            elementId: cowu.formatElementId([prefixId, 'policy_wizard']),
            view: "WizardView",
            viewConfig: {
                steps: []
            }
        }
    steps = [];
    createStepViewConfig = null;
    addnewFwPolicyStepViewConfig = null;
    addRulesStepViewConfig = null;
    createStepViewConfig = {
            elementId: cowu.formatElementId([ctwc.NEW_APPLICATION_POLICY_SET_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId:
                                    cowu.formatElementId([ctwc.NEW_APPLICATION_POLICY_SET_LIST_VIEW_ID]),
                                view: "fwPolicyWizardListView",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewPathPrefix: "config/firewall/fwpolicywizard/project/ui/js/views/",
                                viewConfig: $.extend(true, {}, viewConfig,
                                                     {projectSelectedValueData: viewConfig.projectSelectedValueData})
                            }
                        ]
                    }
                ]
            },
            title: "Select set",
            stepType: "step",
            onInitRender: true,
            onNext: function (options) {
                return true;
            },
            buttons: {
                next: {
                    label: ctwl.TITLE_SAVE_NEXT
                },
                previous: {
                    visible: false
                }
            }
        };
    steps = steps.concat(createStepViewConfig);
    addnewFwPolicyStepViewConfig = $.extend(true, {}, getNewFirewallPolicyViewConfig().viewConfig).steps;
    addRulesStepViewConfig = $.extend(true, {}, getAddRulesViewConfig().viewConfig).steps;
    steps = steps.concat(addnewFwPolicyStepViewConfig);
    steps = steps.concat(addRulesStepViewConfig);
    addPolicyViewConfig.viewConfig.steps = steps;
    return addPolicyViewConfig;
  }
    function getAddressGroup(viewConfig){
        return {
            elementId:
                cowu.formatElementId([ctwc.SECURITY_POLICY_TAG_LIST_VIEW_ID]),
            view: "addressGroupProjectListView",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewPathPrefix: "config/firewall/project/addressgroup/ui/js/views/",
            viewConfig: $.extend(true, {}, viewConfig,
                                 {projectSelectedValueData: viewConfig.projectSelectedValueData})
        }
    }
    function getServiceGroup(viewConfig){
        return {
            elementId:
                cowu.formatElementId([ctwc.SECURITY_POLICY_TAG_LIST_VIEW_ID]),
            view: "serviceGroupProjectListView",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewPathPrefix: "config/firewall/project/servicegroup/ui/js/views/",
            viewConfig: $.extend(true, {}, viewConfig,
                                 {projectSelectedValueData: viewConfig.projectSelectedValueData})
        }
    }
    function getTag(viewConfig){
        return {
            elementId:
                cowu.formatElementId([ctwc.SECURITY_POLICY_TAG_LIST_VIEW_ID]),
            view: "tagProjectListView",
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewPathPrefix: "config/firewall/project/tag/ui/js/views/",
            viewConfig: $.extend(true, {}, viewConfig,
                                 {projectSelectedValueData: viewConfig.projectSelectedValueData})
        }
    }
    var getApplicationPolicyViewConfig = function () {
        return {
            elementId: ctwc.APPLICATION_POLICY_SET_PREFIX_ID,
            view: 'SectionView',
            title: "Application Policy Set",
           // active:false,
            viewConfig: {
                rows: [{
                        columns: [
                            {
                                elementId: 'review_address_groups',
                                view: "FormButtonView",
                                label: "Review Address Groups",
                                width:300,
                                viewConfig: {
                                    class: 'display-inline-block'
                                }
                            }
                         ]
                      },
                      {
                          columns: [
                              {
                                  elementId: 'review_service_groups',
                                  view: "FormButtonView",
                                  label: "Review Service Groups",
                                  width:300,
                                  viewConfig: {
                                      class: 'display-inline-block'
                                  }
                              }
                           ]
                        },{
                            columns: [
                                {
                                    elementId: 'review_visible_tag_for_project',
                                    view: "FormButtonView",
                                    label: "Review Visible Tag For Project",
                                    width:300,
                                    viewConfig: {
                                        class: 'display-inline-block'
                                    }
                                }
                             ]
                          }
                    ]
               }
          }
     };

    return fwPolicyWizardEditView;
});