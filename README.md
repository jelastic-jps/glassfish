# Glassfish cluster
Jelastic JPS file to define an importable environment.

## How to use
Firstly, clone this project in any folder you like.

In Jelastic control panel, click in the down arrow button at the side of
'New environment', and then click in 'import'. After that, in 'Local file' tab,
click in 'Browse', select the jenkins-cluster.json file, and click in 'Import'
button.

In the next dialog, set the name of the environment, the region, and click in
'Install' button.

Finally, you just have to wait Jelastic create the environment for you. To
access GlassFish control panel, you need to get the URL of the DAS container,
and type the following in your web browser location bar:

- https://[DAS container URL]:4848
