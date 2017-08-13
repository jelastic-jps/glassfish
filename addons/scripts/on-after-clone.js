//@auth
var oldEnvName = "${env.envName}",
    oldDasId = "${nodes.das.first.id}",
    envName = "${event.response.env.envName}",
    dasId, allResp = [];
    

var resp = jelastic.env.control.GetEnvInfo(envName, session);
if (resp.result != 0) return resp; else allResp.push(resp);


for (var i = 0, n = resp.nodes, l = n.length; i < l; i++) {
    if (n[i].nodeGroup == 'das' && n[i].ismaster) {
        dasId = n[i].id;
    }
}

/**
* updating JMS host
*
cmd = "sed -i \"s/node" + oldDasId + "/node" + dasId + "/g\" ${STACK_PATH}/glassfish/domains/domain1/config/domain.xml";
resp = cmdByGroup(cmd, "das");
if (resp.result != 0) return resp; else allResp.push(resp);

/**
* restart DAS node
* 
resp = jelastic.env.control.RestartNodes(envName, session, "das", -1, -1);
if (resp.result != 0) return resp; else allResp.push(resp);
**/

/**
* updating links in index.html
*/
var cmd = "sed -i \"s/node" + oldDasId + "-" + oldEnvName + "/node" + dasId + "-" + envName + "/g\" ${STACK_PATH}/glassfish/domains/domain1/docroot/index.html";
resp = cmdByGroup(cmd, "cp");
if (resp.result != 0) return resp; else allResp.push(resp);

resp = cmdByGroup(cmd, "das");
if (resp.result != 0) return resp; else allResp.push(resp);


/**
* update redirect from "cp" master to DAS
*/
cmd = ["d=com/sun/enterprise/v3/admin/adapter",
"mkdir -p $d",
"echo '<html><head><meta http-equiv=\"refresh\" content=\"0;url=https://node" + dasId + "-" + "${env.domain}".replace(oldEnvName, envName) + ":4848/\" /></head></html>' > $d/statusNotDAS.html",
"jar uf $STACK_PATH/glassfish/modules/kernel.jar $d/statusNotDAS.html",
"rm -rf com"].join("; ");

resp = cmdByGroup(cmd, "cp");
if (resp.result != 0) return resp; else allResp.push(resp);

/**
* clean all old nodes in DAS
*/
resp = cmdByGroup("$STACK_PATH/service.sh clean", "das");
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

function cmdByGroup(cmd, group) {
    return jelastic.env.control.ExecCmdByGroup(envName, session, group, toJSON([{
        "command": cmd
    }]), true, false, "jelastic");
}
