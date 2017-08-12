//@auth
var oldEnvName = "${env.envName}",
    oldDasId = "${nodes.das.first.id}",
    envName = "${event.response.env.envName}",
    dasId, cpMasterId, allResp = [];

var resp = jelastic.env.control.GetEnvInfo(envName, session);
if (resp.result != 0) return resp; else allResp.push(resp);


for (var i = 0, n = resp.nodes, l = n.length; i < l; i++) {
    if (n[i].nodeGroup == 'das' && n[i].ismaster) {
        dasId = n[i].id;
    }
    if (n[i].nodeGroup == 'cp' && n[i].ismaster) {
        cpMasterId = n[i].id;
    }
}

//updating links in index.html
var cmd = "sed -i \"s/node" + oldDasId + "-" + oldEnvName + "/node" + dasId + "-" + envName + "/g\" ${STACK_PATH}/glassfish/domains/domain1/docroot/index.html";
resp = cmdByGroup(cmd, "cp");
if (resp.result != 0) return resp; else allResp.push(resp);

resp = cmdByGroup(cmd, "das");
if (resp.result != 0) return resp; else allResp.push(resp);

/**
* clean old nodes in DAS
*/
resp = cmdByGroup("$HOME_DIR/service.sh clean", "das");
if (resp.result != 0) return resp; else allResp.push(resp);

/**
* update redirect from "cp" master to DAS
*/
cmd = "d=com/sun/enterprise/v3/admin/adapter; \
mkdir -p $d; \
echo '<html><head><meta http-equiv=\"refresh\" content=\"0;url=https://node" + dasId + "-" + envName + ":4848/\" /></head></html>' > $d/statusNotDAS.html; \
jar uf ../glassfish/modules/kernel.jar $d/statusNotDAS.html; \
rm -rf com";

resp = cmdById(cmd, cpMasterId);
if (resp.result != 0) return resp; else allResp.push(resp);


/**
* restart new nodes and register them in DAS
*/
resp = jelastic.env.control.RestartNodes(envName, session, "cp", -1, -1);
if (resp.result != 0) return resp; else allResp.push(resp);

return {
    result: 0,
    responses: allResp
};


function cmdById(cmd, nodeId) {
    return jelastic.env.control.ExecCmdById(envName, session, nodeId, toJSON([{
        "command": cmd
    }]), true, "root");
}

function cmdByGroup(cmd, group) {
    return jelastic.env.control.ExecCmdByGroup(envName, session, group, toJSON([{
        "command": cmd
    }]), true, false, "root");
}
