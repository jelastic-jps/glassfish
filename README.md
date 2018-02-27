# GlassFish with Automatic Clustering and Scaling


Java EE often looks like a black box when it comes to deployment, clustering and scaling. You can get rid of this complexity using pre-configured clusters in domain mode with automatically scaled instances and standard flows for zero code change deployment. The default topology and scaling triggers can be easily adjusted.

[Follow the link](https://jelastic.com/blog/glassfish-payara-auto-clustering-cloud-hosting/) to get more details on how clustering works and high availability is configured, as well as how to test this implementation.


## GlassFish Cluster Topology


Due to the native GlassFish clustering architecture, its topology includes three node groups:
- **_Load Balancer(LB)_** - intended to process all incoming requests, sent to the cluster, and distribute them between worker nodes
- **_Worker Node(W)_** - application server to handle the required app and web services
- **_Domain Administration Server (DAS)_** - management instance which performs centralized control of the cluster nodes and configure communication between them via SSH 

![GlassFish cluster scheme](/glassfish-cluster/img/gf-cluster.png)

Current implementation of Jelastic scalable GlassFish cluster is built on top of Docker containers. This ensures additional reliability through operating each node as an isolated instance and enables simple [container update](https://docs.jelastic.com/docker-update) procedure. 

Upon deploying this solution, you’ll get the already configured and ready-to-work GlassFish cluster inside the Cloud, that consists of DAS node, 2 GF application servers (workers), NGINX load balancer and is secured by [Jelastic SSL](https://docs.jelastic.com/jelastic-ssl). 

For the detailed guidance on this JPS package installation and management, refer to the [GlassFish Cluster with Automatic Load Balancing](https://jelastic.com/blog/how-to-configure-glassfish-cluster-with-automatic-load-balancing/) page.


## Automatic Scaling and Clustering Configuration 


GlassFish cluster package automatically adjusts a number of Worker nodes based on current cluster load (up to 10 instances per layer) according to the following conditions:
- +1 node if RAM usage > 70% for at least 1 minute
- -1 node if RAM usage < 40% for at least 10 minute


The appropriate modifications are automatically applied to _DAS_ and _Load Balancer_ configs, and multiple application server instances are automatically interconnected that implements the commonly used clustering configuration.


In case you’d like to change the conditions of automatic nodes’ scaling, refer to the appropriate triggers parameters within the [Automatic Horizontal Scaling](https://docs.jelastic.com/automatic-horizontal-scaling) settings section.


## Cloud Hosting Deployment


### Public Cloud


To instantly host your own scalable GF cluster, click the **GET IT HOSTED** button below. Within the opened frame, specify your email address, choose one of the [Jelastic Public Cloud providers](https://jelastic.cloud/) and press **Install**.


[![GET IT HOSTED](https://raw.githubusercontent.com/jelastic-jps/jpswiki/master/images/getithosted.png)](https://jelastic.com/install-application/?manifest=https://raw.githubusercontent.com/jelastic-jps/glassfish/master/manifest.jps&keys=app.jelastic.eapps.com;app.jelastic.saveincloud.net;app.jelastic.saveincloud.net;app.mircloud.host;app.j.layershift.co.uk)

### Private Cloud

If working within Jelastic Private Cloud, copy link of the [**_manifest.jps_**](https://raw.githubusercontent.com/jelastic-jps/glassfish/master/manifest.jps) file above and [import](https://docs.jelastic.com/environment-import) it to the required Jelastic installation. 
