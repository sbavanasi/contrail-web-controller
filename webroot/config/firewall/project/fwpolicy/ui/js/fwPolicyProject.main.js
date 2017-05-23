/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

var fwPolicyProjectPageLoader = new FWPolicyProjectPageLoader();

function FWPolicyProjectPageLoader ()
{
    this.load = function (paramObject) {
        var self = this, currMenuObj = globalObj.currMenuObj,
            hashParams = paramObject['hashParams'],
            rootDir = currMenuObj['resources']['resource'][1]['rootDir'],
            pathSecurityPolicyView = rootDir + '/js/views/fwPolicyProjectView.js',
            renderFn = paramObject['function'];


        if (self.fwPolicyView == null) {
            requirejs([pathSecurityPolicyView], function (FWPolicyView) {
                self.fwPolicyView = new FWPolicyView();
                self.renderView(renderFn, hashParams);
            }, function (err) {
                console.info("Firewall Page Load error:" + err);
            });
       } else {
            self.renderView(renderFn, hashParams);
        }
    }
    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        switch (renderFn) {
            case 'renderFWPolicy':
                this.fwPolicyView[renderFn]({hashParams: hashParams});
                break;
        }
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
        var renderFn;
        this.load({hashParams: hashObj, 'function': renderFn});
    };

    this.destroy = function () {
        /*ctwu.destroyDOMResources(ctwc.GLOBAL_FORWARDING_OPTIONS_PREFIX_ID);*/
    };
}

