//@auth
//@req(nodeGroup, resourceType, cleanOldTriggers, scaleUpValue, scaleUpLimit, scaleUpLoadPeriod, scaleDownValue, scaleDownLimit, scaleDownLoadPeriod)
var nMaxSameNodes, oResp;

oResp = jelastic.billing.account.GetQuotas('environment.maxsamenodescount').array[0];

if (oResp && oResp.value) {
    nMaxSameNodes = oResp.value;
}

if (nMaxSameNodes < scaleUpLimit) {
    scaleUpLimit = nMaxSameNodes;
}

if (scaleUpLimit <= scaleDownLimit) {
    scaleDownLimit = scaleUpLimit - 1;
}

var envName = '${env.envName}';

if (cleanOldTriggers) {
    var actions = ['ADD_NODE', 'REMOVE_NODE'];
    for (var i = 0; i < actions.length; i++) {
        var array = jelastic.env.trigger.GetTriggers(envName, session, actions[i]).array;
        for (var j = 0; j < array.length; j++) jelastic.env.trigger.DeleteTrigger(envName, session, array[j].id);
    }
}

var data = {
    "isEnabled": true,
    "name": "scale-up",
    "nodeGroup": nodeGroup,
    "period": scaleUpLoadPeriod,
    "condition": {
        "type": "GREATER",
        "value": scaleUpValue,
        "resourceType": resourceType,
        "valueType": "PERCENTAGES"
    },
    "actions": [{
        "type": "ADD_NODE",
        "customData": {
            "limit": scaleUpLimit,
            "count": 1,
            "notify": true
        }
    }]
};
resp = jelastic.env.trigger.AddTrigger(envName, session, data);
if (resp.result != 0) {
    resp.data = data;
    return resp
};

data = {
    "isEnabled": true,
    "name": "scale-down",
    "nodeGroup": nodeGroup,
    "period": scaleDownLoadPeriod,
    "condition": {
        "type": "LESS",
        "value": scaleDownValue,
        "resourceType": resourceType,
        "valueType": "PERCENTAGES"
    },
    "actions": [{
        "type": "REMOVE_NODE",
        "customData": {
            "limit": scaleDownLimit,
            "count": 1,
            "notify": true
        }
    }]
};
resp = jelastic.env.trigger.AddTrigger(envName, session, data);
if (resp.result != 0) {
    resp.data = data;
    return resp
};

return resp;
