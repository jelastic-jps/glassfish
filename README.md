# GlassFish Cluster


Auto-scalable Jelastic GlassFish Cluster in Containers


## GlassFish Cluster Topology


Due to the native GlassFish clustering architecture, its topology includes three node groups:
- **_Load Balancer_** - intended to process all incoming requests, sent to the cluster, and distribute them between worker nodes
- **_Worker Node_** - application server to handle the required app and web services
- **_Domain Administration Server (DAS)_** - management instance which performs centralized control of the cluster nodes and configure communication between them via SSH 

![GlassFish cluster scheme](/glassfish-cluster/img/gf-cluster.png)


Current implementation of Jelastic scalable GlassFish cluster is built on top of Docker containers. This ensures additional reliability through operating each node as an isolated instance and enables simple [container update](https://docs.jelastic.com/docker-update) procedure. 

Upon deploying this solution, you’ll get the already configured and ready-to-work GlassFish cluster inside the Cloud, that consists of DAS node, 2 GF application servers (workers), NGINX load balancer and is secured by [Jelastic SSL](https://docs.jelastic.com/jelastic-ssl). For the detailed guidance on this JPS package installation and management, refer to the [GlassFish Cluster with Automatic Load Balancing](http://blog.jelastic.com/2016/08/16/how-to-configure-glassfish-cluster-with-automatic-load-balancing/) page.


## Auto-Scaling Configuration 


GlassFish cluster package by Jelastic automatically adjusts number of _Worker nodes_ based on current cluster load (up to 10 instances per layer) according to the following conditions:
- +1 node if RAM usage > 70% for at least 1 minute
- -1 node if RAM usage < 40% for at least 10 minute


The appropriate modifications are automatically applied to _DAS_ and _Load Balancer_ configs.


In case you’d like to change the conditions of automatic nodes’ scaling manually, refer to the appropriate triggers’ parameters within the [Automatic Horizontal Scaling](https://docs.jelastic.com/automatic-horizontal-scaling) settings section.


## Cloud Hosting Deployment


### Public Cloud


To instantly host your own scalable GF cluster, click the **Deploy to Jelastic** button below. Within the opened frame, specify your email address, choose one of the [Jelastic Public Cloud providers](https://jelastic.cloud/) and press **Install**.


[![Deploy](https://github.com/jelastic-jps/git-push-deploy/raw/master/images/deploy-to-jelastic.png)](https://jelastic.com/install-application/?manifest=https://raw.githubusercontent.com/jelastic-jps/glassfish/master/manifest.jps)





### Private Cloud


If working within Jelastic Private Cloud, copy link to the **_manifest.jps_** file above and [import](https://docs.jelastic.com/environment-import) it to the required Jelastic installation. 

