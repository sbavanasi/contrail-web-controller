/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
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
    var fwApplicationPolicyEditView = ContrailView.extend({
        renderApplicationPolicy: function(options) {

            var self = this,disable = false;
            var mode = options.mode, headerText;
            if(mode === 'edit'){
                disable = true;
                headerText = 'Edit Application Policy Sets';
            }else if(mode === 'add'){
                headerText = 'Create Application Policy Sets';
            }else{
                headerText = 'Delete Application Policy Sets';
            }
            var viewConfig = options.viewConfig;
            $('#aps-overlay-container').show();
            $("#aps-gird-container").empty();
            $('#aps-save-button').show();
            self.setErrorContainer(headerText);
            if(mode === 'delete'){
                $('#aps-save-button').text('Confirm');
                var deleteContainer = $('<div style="padding-top:30px;"></div>');
                var deletText = $('<span style="padding-left:300px;">Are you sure you want to delete ?</span>');
                deleteContainer.append(deletText);
                $('#gird-details-container').append(deleteContainer);
                //back method
                $("#aps-back-button").off('click').on('click', function(){
                    $('#aps-save-button').hide();
                    Knockback.ko.cleanNode($("#aps-gird-container")[0]);
                    $("#aps-gird-container").empty();
                    self.renderView4Config($("#aps-gird-container"), null, getAddressGroup(viewConfig));
                    $('#aps-save-button').text('Save');
                });
                // save method
                $("#aps-save-button").off('click').on('click', function(){
                    self.model.deleteAddressGroup(options['selectedGridData'],{
                        success: function () {
                            $('#aps-save-button').text('Save');
                            $('#aps-save-button').hide();
                            Knockback.ko.cleanNode($("#aps-gird-container")[0]);
                            $("#aps-gird-container").empty();
                            self.renderView4Config($("#aps-gird-container"), null, getAddressGroup(viewConfig));
                        },
                        error: function (error) {
                            $("#grid-details-error-container").text('');
                            $("#grid-details-error-container").text(error.responseText);
                            $(".aps-details-error-container").show();
                        }
                    });
                });
            }else{
                $("#aps-back-button").text('Cancel');
                $("#aps-back-button").off('click').on('click', function(){
                    Knockback.ko.cleanNode($("#aps-gird-container")[0]);
                    $("#aps-gird-container").empty();
                    $('#aps-save-button').text('Save');
                    $('#aps-overlay-container').hide();
                });
                self.renderView4Config($('#gird-details-container'),
                        this.model,
                        getApplicationPolicyViewConfig(disable),
                        "applicationPolicyValidation",
                        null, null, function() {
                    self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
                    Knockback.applyBindings(self.model,
                            document.getElementById('aps-gird-container'));
                    kbValidation.bind(self);
                },null,false);
            }
        },
        setErrorContainer : function(headerText){
            $('#aps-gird-container').append($('<h6></h6>').text(headerText).addClass('aps-details-header'));
            var errorHolder = $('<div></div>').addClass('alert-error clearfix aps-details-error-container');
            var errorSpan = $('<span>Error : </span>').addClass('error-font-weight');
            var errorText = $('<span id="grid-details-error-container"></span>');
            errorHolder.append(errorSpan);
            errorHolder.append(errorText);
            $('#aps-gird-container').append(errorHolder);
            $('#aps-gird-container').append($('<div id = "gird-details-container"></div>'));
        }
    });
    function firwallPolicyDropDownFormatter(response){
        var firewallList = [];
        var policyList = getValueByJsonPath(response, "0;firewall-policys", []);
        $.each(policyList, function (i, obj) {
            var fqNameJoin = obj['firewall-policy']['fq_name'].join(':');
            var fqName = obj['firewall-policy']['fq_name'];
            fqName = fqName[fqName.length-1];
            firewallList.push({id: fqNameJoin, text: fqName});
         });
        return firewallList;
    };
    var getApplicationPolicyViewConfig = function (isDisable) {
        var policyParam = {data: [{type: 'firewall-policys'}]};
        var tagsFiiteredArray = [];
        var tagsArray = [];
        return {
            elementId: "create_application_policy_prefixid",
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
                            }
                        ]
                    },
                       {
                           columns: [
                               {
                                   elementId: 'Application',
                                   view: 'FormMultiselectView',
                                   viewConfig: {
                                       visible:
                                           'name() !== "' + ctwc.GLOBAL_APPLICATION_POLICY_SET + '"',
                                       label: "Application Tags",
                                       path: 'Applicaton',
                                       dataBindValue: 'Application',
                                       class: 'col-xs-6',
                                       elementConfig: {
                                           dataTextField: "text",
                                           dataValueField: "value",
                                           placeholder:
                                               "Select Tags",
                                               dataSource : {
                                                   type: 'remote',
                                                   requestType: 'post',
                                                   postData: JSON.stringify(
                                                         {data: [{type: 'tags'}]}),
                                                   url:'/api/tenants/config/get-config-details',
                                                   parse: function(result) {
                                                       for(var i=0; i<result.length; i++){
                                                         tagsDetails = result[i].tags;
                                                         for(var j= 0; j<tagsDetails.length; j++){
                                                             var domain = contrail.getCookie(cowc.COOKIE_DOMAIN_DISPLAY_NAME);
                                                             var project = contrail.getCookie(cowc.COOKIE_PROJECT_DISPLAY_NAME);
                                                             if (tagsDetails[j]['tag'].fq_name.length > 1 &&
                                                                     (domain != tagsDetails[j]['tag'].fq_name[0] ||
                                                                     project != tagsDetails[j]['tag'].fq_name[1])) {
                                                                 continue;
                                                             }
                                                             if(tagsDetails[j].tag.fq_name &&
                                                                     tagsDetails[j].tag.fq_name.length === 1) {
                                                                 actValue = tagsDetails[j].tag.fq_name[0];
                                                             }
                                                             else{
                                                                 actValue =  tagsDetails[j].tag.fq_name[0] +
                                                                 ":" + tagsDetails[j].tag.fq_name[1] +
                                                                 ":" + tagsDetails[j].tag.fq_name[2];
                                                             }
                                                             data = {
                                                                     "text":(tagsDetails[j]['tag'].fq_name.length == 1)?
                                                                             "global:" + tagsDetails[j].tag.name :
                                                                                 tagsDetails[j].tag.name,
                                                                     "value":actValue
                                                                };
                                                            if (tagsDetails[j].tag.tag_type === 'application') {
                                                                 tagsArray.push(data);
                                                             }
                                                         }
                                                       }
                                                       return tagsArray;
                                                   }
                                               }
                                       }
                                   }
                               }
                           ]

                       },
                       {
                           columns: [
                               {
                                   elementId: "description",
                                   view: "FormTextAreaView",
                                   viewConfig: {
                                       disabled: false,
                                       path: "description",
                                       dataBindValue: "description",
                                       label: "Description",
                                       rows:"5",
                                       cols:"100%",
                                       class: "col-xs-6"
                                   }
                               }
                           ]
                       },
                       {
                           columns: [
                               {
                                   elementId: "fw-policy-global-grid-id",
                                   view: "fwApplicationPolicyListView",
                                   viewPathPrefix:
                                       "config/firewall/fwpolicywizard/project/ui/js/views/",
                                   app: cowc.APP_CONTRAIL_CONTROLLER,
                                   viewConfig: {
                                       pagerOptions: {
                                           options: {
                                               pageSize: 10,
                                               pageSizeSelect: [10, 50, 100]
                                           }
                                       },
                                       isProject: false,
                                       isGlobal: true
                                   }
                               }
                           ]
                       }
                ]
            }
        }
    }
    return fwApplicationPolicyEditView;
});