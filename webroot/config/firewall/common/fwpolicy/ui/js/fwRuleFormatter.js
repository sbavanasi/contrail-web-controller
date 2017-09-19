/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

 define(["underscore", "moment"], function(_, moment){
     var fwRuleFormatter = function(){

         /*
          * actionFormatter
          */
          this.actionFormatter = function(r, c, v, cd, dc) {
              var action = getValueByJsonPath(dc,
                  "action_list;simple_action", '', false);
              return action ? action : '-';
          };

          /*
           * squenceFormatter
           */
           this.sequenceFormatter = function(r, c, v, cd, dc) {
               var sequence = '', policies = getValueByJsonPath(dc,
                   "firewall_policy_back_refs", [], false),
                   currentHashParams = layoutHandler.getURLHashParams(),
                   policyId = currentHashParams.focusedElement.uuid;

               for(var i = 0; i < policies.length; i++) {
                   if(policies[i].uuid === policyId) {
                       sequence = getValueByJsonPath(policies[i],
                               'attr;sequence', '', false);
                       break;
                   }
               }
               return sequence ? sequence : (cd ? '-' : '');
           };

           /*
            * enabledFormatter
            */
            this.enabledFormatter = function(r, c, v, cd, dc) {
                var enabled = getValueByJsonPath(dc,
                        'id_perms;enabled', true, false);
                return enabled ? 'Enabled' : 'Disabled';
            };

          /*
           * serviceFormatter
           */
            this.serviceFormatter = function(r, c, v, cd, dc) {
                var serviceStr = "";
                if(dc['service'] !== undefined){
                    var service = getValueByJsonPath(dc,
                            "service", {}, false);
                        serviceStr += service.protocol ? service.protocol : '';
                        var startPort = getValueByJsonPath(service, 'dst_ports;start_port', '');
                        var endPort = getValueByJsonPath(service, 'dst_ports;end_port', '');
                        if(startPort !== '' && endPort !== ''){
                            if(startPort === endPort){
                                serviceStr += ':'  +
                                    (endPort === -1 ? ctwl.FIREWALL_POLICY_ANY : endPort);
                            } else{
                                serviceStr += ':' + (service && service.dst_ports ?
                                        startPort + '-' +
                                        endPort : '-');
                            }
                        }
                        return serviceStr ? serviceStr : '-';
                }else if(dc['service_group_refs'] !== undefined){
                    var serviceGrpRef = getValueByJsonPath(dc,
                            "service_group_refs",[]);
                    if(serviceGrpRef.length > 0){
                        for(var i = 0; i < serviceGrpRef.length; i++){
                            var to = serviceGrpRef[i].to;
                            serviceStr = to[to.length - 1];
                        }
                        return serviceStr;
                    }else{
                        return '-';
                    }

                }else{
                    return '-';
                }

            };

          /*
           * endPoint1Formatter
           */
           this.endPoint1Formatter = function(r, c, v, cd, dc) {
               return formatEndPoints(dc, 'endpoint_1');

           };

           var formatEndPoints =  function(dc, endpointTarget) {
               var rule_display = '';
               var tags = ctwu.getGlobalVariable(ctwc.RULE_DATA_TAGS);
               var addressGrps = ctwu.getGlobalVariable(ctwc.RULE_DATA_ADDRESS_GROUPS);
               var endpoint = getValueByJsonPath(dc, endpointTarget, {}, false);
               if(endpoint.subnet) {
                   return endpoint.subnet;
               } else if(endpoint.address_group) {
                   var addGrp = endpoint.address_group.split(":");
                   return "Address Group: " + addGrp[addGrp.length - 1];
               } else if(endpoint.tags.length > 0) {
                   return endpoint.tags.join(' &&</br>');
               } else if(endpoint.security_group) {
                   return endpoint.security_group;
               } else if(endpoint.virtual_network) {
                   return "Network: " + endpoint.virtual_network.split(":")[2];
               } else if(endpoint.any) {
                   return 'any';
               } else {
                   return '-';
               }
           }

           /*
            * endPoint2Formatter
            */
            this.endPoint2Formatter = function(r, c, v, cd, dc) {
                return formatEndPoints(dc, 'endpoint_2');
            };

            /*
             * matchFormatter
             */
            this.matchFormatter = function(r, c, v, cd, dc) {
                var  formattedMatch ='', matches = getValueByJsonPath(dc,
                    "match_tags;tag_list", [], false);
                if(matches.length > 0) {
                    _.each(matches, function(match, i){
                        var matchStr  = getFormattedMatchTags(match)
                        if(i === 0) {
                            formattedMatch += matchStr;
                        } else {
                            formattedMatch += '<br>' + matchStr;
                        }
                    });
                } else {
                    formattedMatch = '-';
                }
                return formattedMatch;
            };

            var getFormattedMatchTags = function (key) {
                if(!key){
                    return '';
                }
                key = key.toLowerCase().replace(/\b[a-z]/g, function(letter) {
                    return letter.toUpperCase();
                });
                return key;
            };

            /*
             * dirFormatter
             */
            this.dirFormatter = function(r, c, v, cd, dc) {
                var dir = getValueByJsonPath(dc,
                    "direction", '', false);
                if(dir) {
                    dir = cowu.deSanitize(dir);
                } else {
                    dir = '-';
                }
                return dir;
            };

            /*
             * simpleActionFormatter
             */
            this.simpleActionFormatter = function(r, c, v, cd, dc) {
                var simpleActionStr  = '',
                simpleAction = getValueByJsonPath(dc,
                    "action_list;apply_service", [], false);
                return simpleAction.length > 0 ? simpleAction.join(',') : '-';
            };

            /*
             * mirroringFormatter
             */

            this.mirroringFormatter = function(d, c, v, cd, dc) {
                var mirror = "",
                    nicAssistedMirroring = getValueByJsonPath(dc,
                            "action_list;" +
                            "mirror_to;nic_assisted_mirroring", false),
                    nicAssistedVLAN = getValueByJsonPath(dc,
                            "action_list;" +
                            "mirror_to;nic_assisted_mirroring_vlan", false),
                    analyzerIP = getValueByJsonPath(dc,
                            "action_list;" +
                            "mirror_to;analyzer_ip_address", null),
                    udpPort = getValueByJsonPath(dc,
                            "action_list;" +
                            "mirror_to;udp_port", null),
                    analyzerName = getValueByJsonPath(dc,
                            "action_list;" +
                            "mirror_to;analyzer_name", null),
                    routingInst = getValueByJsonPath(dc,
                            "action_list;" +
                            "mirror_to;routing_instance", null),
                    jnprHeader = getValueByJsonPath(dc,
                            "action_list;" +
                            "mirror_to;juniper_header", null),
                    analyzerMAC = getValueByJsonPath(dc,
                            "action_list;" +
                            "mirror_to;analyzer_mac_address", null),
                    mirrorDirection = getValueByJsonPath(dc,
                            "action_list;" +
                            "traffic_direction", null),
                    nhMode = getValueByJsonPath(dc,
                            "action_list;" +
                            "mirror_to;nh_mode", null),
                    vtepDestIP, vtepDestMAC, VxLANId;
                if(analyzerName) {
                    mirror += this.addTableRow("Analyzer Name", analyzerName);
                } else {
                    return "-";
                }

                if(nicAssistedMirroring) {
                    nicAssistedMirroring = nicAssistedMirroring ? "Enabled" : "Disabled";
                    mirror += this.addTableRow("NIC Assisted Mirroring", nicAssistedMirroring);
                    mirror += this.addTableRow("NIC Assisted VLAN", nicAssistedVLAN);
                    return "<table style='width:100%'><tbody>" + mirror + "</tbody></table>";
                } else {
                    nicAssistedMirroring = nicAssistedMirroring ? "Enabled" : "Disabled";
                    //mirror += this.addTableRow("NIC Assisted Mirroring", nicAssistedMirroring);
                }

                if(analyzerIP) {
                    mirror += this.addTableRow("Analyzer IP", analyzerIP);
                } else {
                    mirror += this.addTableRow("Analyzer IP", "-");
                }

                if(analyzerMAC) {
                    mirror += this.addTableRow("Analyzer MAC", analyzerMAC);
                } else {
                    mirror += this.addTableRow("Analyzer MAC", "-");
                }

                if(udpPort) {
                    mirror += this.addTableRow("UDP Port", udpPort);
                } else {
                    mirror += this.addTableRow("UDP Port", "-");
                }

                if(jnprHeader !== null) {
                    jnprHeader = jnprHeader === true ? "Enabled" : "Disabled";
                    mirror += this.addTableRow("Juniper Header", jnprHeader);
                } else {
                    mirror += this.addTableRow("Juniper Header", "-");
                }

                if(routingInst) {
                    var ri = routingInst.split(":");
                    routingInst = ctwu.formatCurrentFQName(ri,
                            ctwu.getCurrentDomainProject());
                    mirror += this.addTableRow("Routing Instance", routingInst);
                } else {
                    mirror += this.addTableRow("Routing Instance", "-");
                }

                if(mirrorDirection) {
                    var dir = "Both";
                    if(mirrorDirection  === "ingress") {
                        dir = "Ingress";
                    } else if(mirrorDirection  === "egress") {
                        dir = "Egress";
                    }
                    mirror += this.addTableRow("Traffic Direction", dir);
                } else {
                    mirror += this.addTableRow("Traffic Direction", "-");
                }

                if(nhMode) {
                    var mode = "Dynamic";
                    if(nhMode === ctwc.MIRROR_STATIC) {
                        mode = "Static"
                    }
                    mirror += this.addTableRow("Nexthop Mode", mode);
                } else {
                    mirror += this.addTableRow("Nexthop Mode", "-");
                }

                if(nhMode === ctwc.MIRROR_STATIC) {
                    vtepDestIP = getValueByJsonPath(dc,
                            "action_list;" +
                            "mirror_to;static_nh_header;" +
                            "vtep_dst_ip_address", null);
                    vtepDestMAC = getValueByJsonPath(dc,
                            "action_list;" +
                            "mirror_to;static_nh_header;" +
                            "vtep_dst_mac_address", null);
                    VxLANId = getValueByJsonPath(dc,
                            "action_list;" +
                            "mirror_to;static_nh_header;" +
                            "vni", null);
                    if(vtepDestIP) {
                        mirror += this.addTableRow("VTEP Dest IP", vtepDestIP);
                    } else {
                        mirror += this.addTableRow("VTEP Dest IP", "-");
                    }
                    if(vtepDestMAC) {
                        mirror += this.addTableRow("VTEP Dest MAC", vtepDestMAC);
                    } else {
                        mirror += this.addTableRow("VTEP Dest MAC", "-");
                    }
                    if(VxLANId) {
                        mirror += this.addTableRow("VxLAN ID", VxLANId);
                    } else {
                        mirror += this.addTableRow("VxLAN ID", "-");
                    }
                }

                if (mirror == "") {
                    mirror = "-";
                } else {
                    mirror = "<table style='width:100%'><tbody>" + mirror + "</tbody></table>";
                }
                return mirror;
            };

            this.addTableRow = function(key, value) {
                var formattedStr = "<tr>";
                formattedStr += "<td style='width:25%'>" + key + "</td>";
                formattedStr += "<td style='font-weight:bold'>" + value + "</td>";
                formattedStr += "</tr>";
                return formattedStr;
            };
     };
     return fwRuleFormatter
 });

