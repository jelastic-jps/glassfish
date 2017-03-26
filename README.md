# GlassFish Cluster


Auto-scalable Jelastic GlassFish Cluster in Containers


## GlassFish Cluster Topology


Due to the native GlassFish clustering architecture, its topology includes three node groups:
- _Load Balancer_ - intended to process all incoming requests, sent to the cluster, and distribute them between worker nodes
- _Worker Node_ - application server to handle the required app and web services
- _Domain Administration Server (DAS)_ - management instance which performs centralized control of the cluster nodes and configure communication between them via SSH 


![GlassFish cluster scheme] (/glassfish-cluster/img/gf-cluster.png)



Current implementation of Jelastic scalable GlassFish cluster is built on top of Docker containers. This ensures additional reliability through operating each node as an isolated instance and enables simple [container update] (https://docs.jelastic.com/docker-update) procedure. Here, the following two Docker templates are used:
- [HAProxy] (https://github.com/jelastic-jps/payara/tree/master/addons/haproxy-load-balancing) _Load Balancer_ template
- [GlassFish] (https://github.com/jelastic-docker/glassfish) _Worker_ and _DAS_ nodes template


Upon deploying this solution, you’ll get the already configured and ready-to-work GlassFish cluster inside the Cloud, that consists of DAS node, 2 GF application servers, HAProxy load balancer and is secured by [Jelastic SSL] (https://docs.jelastic.com/jelastic-ssl). For the detailed guidance on this JPS package installation and management, refer to the [GlassFish Cluster with Automatic Load Balancing] (http://blog.jelastic.com/2016/08/16/how-to-configure-glassfish-cluster-with-automatic-load-balancing/) page.


## Auto-Scaling Configuration 


GlassFish cluster package by Jelastic automatically adjusts number of _Worker nodes_ based on current cluster load (up to 10 instances per layer) according to the following conditions:
- +1 node if RAM usage > 70% for at least 1 minute
- -1 node if RAM usage < 40% for at least 10 minute


The appropriate modifications are automatically applied to _DAS_ and _Load Balancer_ configs.


In case you’d like to change the conditions of automatic nodes’ scaling manually, refer to the appropriate triggers’ parameters within the [Automatic Horizontal Scaling] (https://docs.jelastic.com/automatic-horizontal-scaling) settings section.


## Cloud Hosting Deployment


### Public Cloud


To instantly host your own scalable GF cluster, click the **Deploy to Jelastic** button below. Within the opened frame, specify your email address, choose one of the [Jelastic Public Cloud providers] (https://jelastic.cloud/) and press **Install**.


[![Deploy](https://github.com/jelastic-jps/git-push-deploy/raw/master/images/deploy-to-jelastic.png)](https://jelastic.com/install-application/?manifest=https://raw.githubusercontent.com/jelastic-jps/glassfish/master/manifest.jps)





### Private Cloud


If working within Jelastic Private Cloud, copy link to the **_manifest.jps_** file above and [import] (https://docs.jelastic.com/environment-import) it to the required Jelastic installation. 


## Managing Your GlassFish Cluster


Subsequently, in order to access cluster _Domain Administration Server_ control panel, you’ll need to add the **_:4848_** port to the DAS container link (or just click the _Admin Console_ URL within the received email notification).


Also, you can check your GlassFish cluster operability with the automatically deployed test application. For that, add the **_/clusterjsp_** suffix to the end of your environment domain name in address bar. Upon refreshing the opened page, you’ll see the _Server_ IP address and domain being constantly changed - this means the corresponding _Worker Nodes_ are up and load balancing inside the cluster works properly.
