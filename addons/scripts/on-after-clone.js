//@auth
var oldEnvName = "${env.envName}",
    oldDasId = "${nodes.das.first.id}",
    oldDasIP = "${nodes.das.first.address}",
    envName = "${event.response.env.envName}",
    dasId, dasIP, cpMasterId, cpMasterIP, 
    oldEnvCpMasterIP, allResp = [];

var resp = jelastic.env.control.GetEnvInfo(envName, session);
if (resp.result != 0) return resp; else allResp.push(resp);


for (var i = 0, n = resp.nodes, l = n.length; i < l; i++) {
    if (n[i].nodeGroup == 'das' && n[i].ismaster) {
        dasId = n[i].id;
        dasIP = n[i].address;
    }
    if (n[i].nodeGroup == 'cp' && n[i].ismaster) {
        cpMasterId = n[i].id;
        cpMasterIP = n[i].address;
    }
}

//updating links in index.html
var params = "-i \"s/node" + oldDasId + "-" + oldEnvName + "/node" + dasId + "-" + envName + "/g\" ${STACK_PATH}/glassfish/domains/domain1/docroot/index.html";
resp = cmdByGroup("sed", params, "cp");
if (resp.result != 0) return resp; else allResp.push(resp);

resp = cmdByGroup("sed", params, "das");
if (resp.result != 0) return resp; else allResp.push(resp);

/**
* clean old nodes in DAS
*/
resp = cmdByGroup("$HOME_DIR/service.sh", "clean", "das");
if (resp.result != 0) return resp; else allResp.push(resp);

/**
* update iptables forwarding from "cp" master to DAS
*/
resp = jelastic.env.control.GetEnvInfo(oldEnvName, session);
if (resp.result != 0) return resp; else allResp.push(resp);

for (var i = 0, n = resp.nodes, l = n.length; i < l; i++) {
    if (n[i].nodeGroup == 'cp' && n[i].ismaster) {
        oldEnvCpMasterIP = n[i].address;
        break;
    }
}

//clean old routing
resp = preRouting(oldEnvCpMasterIP, oldDasIP, "D");
if (resp.result != 0) return resp; else allResp.push(resp);
resp = postRouting(oldEnvCpMasterIP, oldDasIP, "D");
if (resp.result != 0) return resp; else allResp.push(resp);

//add new routing
resp = preRouting(cpMasterIP, dasIP, "A");
if (resp.result != 0) return resp; else allResp.push(resp);
resp = postRouting(cpMasterIP, dasIP, "A");
if (resp.result != 0) return resp; else allResp.push(resp);

/**
* restart new nodes and register them in DAS
*/
var resp = jelastic.env.control.RestartNodes(envName, session, "cp", -1, -1);
if (resp.result != 0) return resp; else allResp.push(resp);

return {
    result: 0,
    responses: allResp
};

  
function preRouting(masterIP, dasIP, act){
    return cmdById("iptables", "-t nat -" + act + " PREROUTING -p tcp -d " + masterIP + " --dport 4848 -j DNAT --to-destination " + dasIP, cpMasterId);
}

function postRouting(masterIP, dasIP, act){
    return cmdById("iptables", "-t nat -" + act + " POSTROUTING -p tcp --dst " + dasIP + " --dport 4848 -j SNAT --to-source " + masterIP, cpMasterId);
}

function cmdById(cmd, params, nodeId) {
    return jelastic.env.control.ExecCmdById(envName, session, nodeId, toJSON([{
        "command": cmd,
        "params": params
    }]), true, "root");
}

function cmdByGroup(cmd, params, group) {
    return jelastic.env.control.ExecCmdByGroup(envName, session, group, toJSON([{
        "command": cmd,
        "params": params
    }]), true, false, "root");
}
