/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-config-model',
    'config/firewall/fwpolicywizard/common/ui/js/views/fwPolicyWizard.utils'
], function (_, ContrailConfigModel,FWZUtils) {
    var self;
    var fwzUtils = new FWZUtils();
    var fwPolicyWizardModel = ContrailConfigModel.extend({
        defaultConfig: {
            'name': '',
            'Application': '',
            'description': '',
            "firewall_rules": [],
            "perms2": {
                "owner": "",
                "owner_access": "",
                "global_access": "",
                "share": []
            }
        },
        formatModelConfig: function(modelConfig) {
            self = this;
            var tagRef = getValueByJsonPath(modelConfig, 'tag_refs', []), tagList = [],
            description = getValueByJsonPath(modelConfig, 'id_perms;description', '');
            if((modelConfig["perms2"]["owner_access"] != "") || (modelConfig["perms2"]["global_access"] != "")) {
                modelConfig["perms2"]["owner_access"] =
                    fwzUtils.formatAccessList(modelConfig["perms2"]["owner_access"]);
                modelConfig["perms2"]["global_access"] =
                    fwzUtils.formatAccessList(modelConfig["perms2"]["global_access"]);
                modelConfig["owner_visible"] = true;
            } else {//required for create case
                modelConfig["perms2"] = {};
                modelConfig["perms2"]["owner_access"] = "4,2,1";
                modelConfig["perms2"]["global_access"] = "";
                modelConfig["owner_visible"] = false;
            }
            _.each(tagRef, function(tag) {
                var to = tag.to.join(':');
                tagList.push(to);;
            });
            if(tagList.length > 0){
                modelConfig['Application'] = tagList.join(',');
            }
            if(description !== ''){
                modelConfig['description'] = description;
            }
            return modelConfig;
        },
        validations: {
            applicationPolicyValidation: {
                'name': {
                    required: true,
                    msg: 'Enter a valid Application Policy Set.'
                }
            }
        },
        addEditApplicationSet: function (callbackObj, options) {
            var ajaxConfig = {}, returnFlag = true,updatedVal = {};
            var updatedModel = {},policyList = [];
            var self = this;
            var validations = [
                {
                    key : null,
                    type : cowc.OBJECT_TYPE_MODEL,
                    getValidation : "applicationPolicyValidation"
                }];
            if (self.isDeepValid(validations)) {
                var model = $.extend(true,{},this.model().attributes);
                var gridElId = '#' + ctwc.FW_WZ_POLICY_GRID_ID;
                var selectedRows = $(gridElId).data("contrailGrid")._dataView.getItems();
                if(selectedRows.length > 0){
                    for(var j = 0; j < selectedRows.length;j++){
                            var obj = {};
                            var to = selectedRows[j].fq_name;
                            obj.to = to;
                            obj.attr = {};
                            obj.attr.sequence = j.toString();
                            policyList.push(obj);
                        }
                    updatedModel.fq_name = [];
                    if(options.isGlobal) {
                        updatedModel.fq_name.push('default-policy-management');
                        updatedModel.fq_name.push(model.name);
                        updatedModel.parent_type = 'policy-management';
                    } else {
                        updatedModel.fq_name.push(
                                contrail.getCookie(cowc.COOKIE_DOMAIN_DISPLAY_NAME));
                        updatedModel.fq_name.push(
                                contrail.getCookie(cowc.COOKIE_PROJECT_DISPLAY_NAME));
                        updatedModel.fq_name.push(model.name);
                        updatedModel.parent_type = 'project';
                    }
                    updatedModel.name = model.name;
                    this.updateRBACPermsAttrs(model);
                    updatedModel.tag_refs = model.tag_refs;
                    if(model.description != ''){
                        var obj = {};
                        obj.description = model.description;
                        updatedModel.id_perms = obj;
                    }
                    updatedModel.firewall_policy_refs = policyList;
                    if (options.mode == 'add') {
                        var postData = {"data":[{"data":{"application-policy-set": updatedModel},
                                    "reqUrl": "/application-policy-sets"}]};
                        ajaxConfig.url = ctwc.URL_CREATE_CONFIG_OBJECT;
                    } else {
                        delete(updatedModel.name);
                        delete(updatedModel.id_perms);
                        var postData = {"data":[{"data":{"application-policy-set": updatedModel},
                                    "reqUrl": "/application-policy-set/" +
                                    model.uuid}]};
                        ajaxConfig.url = ctwc.URL_UPDATE_CONFIG_OBJECT;
                    }
                    ajaxConfig.type  = 'POST';
                    ajaxConfig.data  = JSON.stringify(postData);
                    contrail.ajaxHandler(ajaxConfig, function () {
                        if (contrail.checkIfFunction(callbackObj.init)) {
                            callbackObj.init();
                        }
                    }, function (response) {
                        if (contrail.checkIfFunction(callbackObj.success)) {
                            callbackObj.success();
                        }
                        returnFlag = true;
                    }, function (error) {
                        if (contrail.checkIfFunction(callbackObj.error)) {
                            callbackObj.error(error);
                        }
                        returnFlag = false;
                    });
                  return returnFlag;
               } else{
                    if (contrail.checkIfFunction(callbackObj.error)) {
                        var error = {};
                        error.responseText = 'Please create new firewall policy or add firewall policy from inventory.'
                        callbackObj.error(error);
                    }
                }
            }else{
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(this.getFormErrorText(ctwc.FIREWALL_APPLICATION_POLICY_PREFIX_ID));
                }
            }
        }
    });
    function polRefFormatter (dc) {
        var polArr = [];
        var pols   =
            getValueByJsonPath(dc, 'firewall_policy_refs', []);

        if (!pols.length) {
            return '-';
        }

        var sortedPols =
         _.sortBy(pols, function (pol) {
             var sequence =
                Number(getValueByJsonPath(pol, 'attr;sequence', 0));
             return ((1 + sequence) * 100000 ) - sequence;
        });

        pLen = pols.length;

        $.each(sortedPols,
            function (i, obj) {
                polArr.push(obj.to.join(':'));
            }
        );

        return polArr;
    };
    return fwPolicyWizardModel;
});
