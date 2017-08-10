//@auth

var oldEnvName = "${env.envName}",
    oldDasNodeId = "${nodes.das.first.id}",
    envName = "${event.response.env.envName}",
    dasNodeId;

var resp = jelastic.env.control.GetEnvInfo(envName, session);
if (resp.result != 0) return resp;


for (var i = 0, n = resp.nodes, l = n.length; i < l; i++) {
    if (n[i].nodeGroup == 'das') {
        dasNodeId = n[i].id;
        break;
    }
}

//updating links in index.html
var params = "-i \"s/node" + oldDasNodeId + "-" + oldEnvName + "/node" + dasNodeId + "-" + envName + "/g\" ${STACK_PATH}/glassfish/domains/domain1/docroot/index.html";
resp = cmd("sed", params, "cp");
if (resp.result != 0) return resp;
resp = cmd("sed", params, "das");
if (resp.result != 0) return resp;

//clean old nodes in DAS
resp = cmd("$HOME_DIR/service.sh", "clean", "das");
if (resp.result != 0) return resp;

//restart new nodes and register them in DAS
var resp = jelastic.env.control.RestartNodes(envName, session, "cp", -1, -1);
if (resp.result != 0) return resp;

return resp;

function cmd(cmd, params, group) {
    return jelastic.env.control.ExecCmdByGroup(envName, session, group, toJSON([{
        "command": cmd,
        "params": params
    }]), true, false, "root");
}
