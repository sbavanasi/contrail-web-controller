/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {
    var gridElId = '#' + ctwc.FIREWALL_APPLICATION_POLICY_GRID_ID,
        prefixId = ctwc.FIREWALL_APPLICATION_POLICY_PREFIX_ID,
        modalId = 'configure-' + prefixId,
        formId = '#' + modalId + '-form';

    var applicationPolicyEditView = ContrailView.extend({
    	renderAddEditApplicationPolicy: function(options) {
            var editTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_EDIT),
                editLayout = editTemplate({prefixId: prefixId, modalId: modalId}),
                self = this,disable = false;
                var mode = options.mode;
	            if(mode === 'edit'){
	            	disable = true;
	            }
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.addEditApplicationPolicy({
                    init: function () {
                        cowu.enableModalLoading(modalId);
                    },
                    success: function () {
                        options['callback']();
                        $("#" + modalId).modal('hide');
                    },
                    error: function (error) {
                        cowu.disableModalLoading(modalId, function () {
                            self.model.showErrorAttr(prefixId +
                                                     cowc.FORM_SUFFIX_ID,
                                                     error.responseText);
                        });
                    }
                }, options);
                // TODO: Release binding on successful configure
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});

            self.renderView4Config($("#" + modalId).find(formId),
                                   this.model,
                                   getApplicationPolicyViewConfig(disable),
                                   "applicationPolicyValidation",
                                   null, null, function() {
                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
                Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
                kbValidation.bind(self);
            },null,true);
        },
        renderDeleteApplicationPolicy: function(options) {
            var delTemplate =
                contrail.getTemplate4Id('core-generic-delete-form-template');
            var self = this;

            var delLayout = delTemplate({prefixId: prefixId});
            cowu.createModal({'modalId': modalId, 'className': 'modal-480',
                             'title': options['title'], 'btnName': 'Confirm',
                             'body': delLayout,
               'onSave': function () {
                self.model.deleteApplicationPolicy(options['selectedGridData'], {
                    init: function () {
                        cowu.enableModalLoading(modalId);
                    },
                    success: function () {
                        options['callback']();
                        $("#" + modalId).modal('hide');
                    },
                    error: function (error) {
                        cowu.disableModalLoading(modalId, function () {
                            self.model.showErrorAttr(prefixId +
                                                     cowc.FORM_SUFFIX_ID,
                                                     error.responseText);
                        });
                    }
                });
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
            Knockback.applyBindings(self.model,
                document.getElementById(modalId));
            kbValidation.bind(self);
        }
    });
    function firwallPolicyDropDownFormatter(response){
    	var firewallList = [];
    	var policyList = getValueByJsonPath(response, "0;firewall-policys", []);
    	$.each(policyList, function (i, obj) {
    		var fqName = obj['firewall-policy']['fq_name'].join(':');
    		firewallList.push({id: fqName, text: fqName});
         });
        return firewallList;
    };
    var getApplicationPolicyViewConfig = function (isDisable) {
        var policyParam = {data: [{type: 'firewall-policys'}]};
    	return {
            elementId: ctwc.SEC_POLICY_ADDRESS_GRP_PREFIX_ID,
            view: 'SectionView',
            title: "Application Policy",
           // active:false,
            viewConfig: {
                rows: [
                    {
                        columns: [
                        	{
                                elementId: 'name',
                                view: 'FormInputView',
                                viewConfig: {
                                    label: 'Name',
                                    path: 'name',
                                    class: 'col-xs-6',
                                    dataBindValue: 'name',
                                    disabled : isDisable
                                }
                            },
                            {
                                elementId: 'is_global',
                                name:'Global Apply',
                                view: "FormCheckboxView",
                                viewConfig:
                                  {
                                       class: 'col-xs-6 no-label-input',
                                       label: 'Global Apply',
                                       path: "is_global",
                                       dataBindValue: 'is_global',
                                       templateId: cowc.TMPL_CHECKBOX_LABEL_RIGHT_VIEW,
                                       elementConfig : {
                                            label:'Is Global',
                                            isChecked:false
                                        }
                                  }
                              }
                        ]
                    },
                    {
                        columns: [{
                            elementId: 'firewall_policy',
                            view: "FormMultiselectView",
                            viewConfig: {
                            	label: 'Firewall Policy(s)',
                                class: "col-xs-12",
                                path: "firewall_policy",
                                dataBindValue: "firewall_policy",
                                elementConfig:{
                                    dataTextField: "text",
                                    placeholder:"Select Firewall Policies",
                                    dataValueField: "id",
                                    separator: cowc.DROPDOWN_VALUE_SEPARATOR,
                                    dataSource: {
                                        type: "remote",
                                        requestType: "POST",
                                        url: "/api/tenants/config/get-config-details",
                                        postData: JSON.stringify(policyParam),
                                        parse : firwallPolicyDropDownFormatter
                                    }
                                 }
                            }
                       }]
                       }
                ]
            }
        }
    };

    return applicationPolicyEditView;
});