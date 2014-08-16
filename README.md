# Populus
## README

Populus is a visualizing front-end for the [ATNF Pulsar
Catalogue](http://www.atnf.csiro.au/people/pulsar/psrcat/). It displays scatter plots for any combination of supported pulsar parameters for which data are available.

To create a scatter plot, choose two parameters from the 'Parameters' section of the page, and click the 'Plot' button. Hovering the mouse pointer on a plotted point shows the name of the pulsar and the x and y axis values for that pulsar, above the plot. To zoom into a particular region, click and drag around the region of interest. To select pulsars, either control-click on the pulsars that you want to choose, or control-click-and-drag an area around them (in the case of Macs, use command-click or command-click-and-drag instead). To plot all pulsars in the catalogue for which values of both parameters are available, select the 'All' radio button (this is the default option). To create a scatter plot of only the selected pulsars, click the 'Selected' radio button, choose parameters, and click 'Plot'.

To plot the x-axis (or y-axis) in log<sub>10</sub> scale, check the
'log(x)' (or 'log(y)') checkbox and click 'Plot'.

To create a histogram, choose one parameter and click the 'Plot'
button.

To see what each parameter or plot option is, click on the checkbox or
radio button label. The explanation is displayed on the status bar at the
bottom of the page.

System requirements: psrcat, to be present in the path; a modern web browser such as Google Chrome.

Setup instructions: Run psrcat2js.py to generate the JavaScript variables from psrcat. Open a browser window and open populus.htm.

Created by Jayanth Chennamangalam  
[http://jayanthc.github.io/yapp/](http://jayanthc.github.io/yapp/)
