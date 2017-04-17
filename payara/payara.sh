#!/bin/bash

PSWD_FILE=/opt/pwdfile

start() {
    
    #DAS
    if [ -n "${DAS}" ]
    then    
    	echo -e 'y\n'|ssh-keygen -t rsa -b 4096 -q -N '' -f ~/.ssh/id_rsa
    	cp ~/.ssh/id_rsa.pub ~/.ssh/authorized_keys

        #start domain
        ~/bin/asadmin start-domain

        #update JMX default host
        ~/bin/asadmin set --user=admin --passwordfile=${PSWD_FILE} server-config.jms-service.jms-host.default_JMS_host.host="${HOSTNAME}"
        
        #create cluster 
        ~/bin/asadmin --user=admin --passwordfile=${PSWD_FILE} --interactive=false create-cluster cluster1
        
    fi
    
    # Worker
    if [ -n "${DAS_PORT_4848_TCP_ADDR}" ]
    then
        # Getting all keys from Domain Administration Server SSH
        ssh-keyscan -H das >> ~/.ssh/known_hosts

        # Busy waiting for SSH to be enabled
        while [[ true ]]
        do
            SSH_STATUS=$(ssh ${USER}@das echo "I am waiting.")
            echo $SSH_STATUS >> /var/log/run.log
            [ "${SSH_STATUS}" = "ssh: connect to host das port 22: Connection refused" ] && { sleep 10; } || { break; }
        done

        # Busy waiting for Domain Administration Server to be available
        while [[ true ]]
        do
            DAS_STATUS=$(ssh ${USER}@das ~/bin/asadmin --user=admin \
            --passwordfile=${PSWD_FILE} list-domains | head -n 1)
            echo $DAS_STATUS >> /var/log/run.log
            [ "${DAS_STATUS}" = "domain1 not running" ] && { sleep 10; } || { break; }
        done
                
        #start domain
        ~/bin/asadmin start-domain
        
        # Create cluster node
        ~/bin/asadmin --user=admin --passwordfile=${PSWD_FILE} --interactive=false \
        --host das --port 4848 create-local-instance --cluster cluster1 cluster1-"${HOSTNAME}"

        # Stop domain
        ~/bin/asadmin --user=admin stop-domain        

        # Update existing CONFIG node to a SSH one
        ssh ${USER}@das ~/bin/asadmin --user=admin \
        --passwordfile=${PSWD_FILE} --interactive=false update-node-ssh \
        --sshuser "${USER}" --sshkeyfile ~/.ssh/id_rsa \
        --nodehost "${HOSTNAME}" --installdir "${PAYARA_PATH}" "${HOSTNAME}"

        # Start instance
        ssh ${USER}@das ~/lib/nadmin --user=admin \
        --passwordfile=${PSWD_FILE} --interactive=false start-instance cluster1-"${HOSTNAME}"

    fi
}

stop() {
    
    ssh ${USER}@das ~/lib/nadmin --user=admin \
    --passwordfile=${PSWD_FILE} --interactive=false stop-instance cluster1-"${HOSTNAME}"

    sleep 10
    
    ssh ${USER}@das ~/glassfish4/glassfish/lib/nadmin --user=admin \
    --passwordfile=${PSWD_FILE} --interactive=false delete-instance cluster1-"${HOSTNAME}"

    ssh ${USER}@das ~/glassfish4/glassfish/bin/asadmin --user=admin \
    --passwordfile=${PSWD_FILE} --interactive=false delete-node-ssh "${HOSTNAME}"

    #~/glassfish4/glassfish/lib/nadmin --user=admin --passwordfile=${PSWD_FILE} \
    #--interactive=false delete-local-instance --node "${HOSTNAME}" cluster1-"${HOSTNAME}"
}

case ${1} in
    start)
        start
        ;;
    stop)
        stop
        ;;
esac
